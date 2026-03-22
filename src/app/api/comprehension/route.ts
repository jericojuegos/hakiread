import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { createClient } from '@/lib/supabase/server';
import {
  COMPREHENSION_SYSTEM_PROMPT,
  buildComprehensionUserPrompt,
} from '@/lib/ai/prompts/comprehension';

export const dynamic = 'force-dynamic';

const ComprehensionPayloadSchema = z.object({
  text: z.string().min(20, 'Passage must be at least 20 characters'),
});

const QuestionSchema = z.object({
  questions: z.array(
    z.object({
      level: z.enum(['recall', 'inference', 'synthesis']),
      question: z.string(),
      choices: z.array(z.string()).length(4),
      correctIndex: z.number().int().min(0).max(3),
    }),
  ),
});

async function hashText(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ComprehensionPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid_payload', details: parsed.error.flatten() },
        { status: 400 },
      );
    }

    const { text } = parsed.data;
    const textHash = await hashText(text);

    const supabase = await createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Cache-first: check if questions already exist for this text hash
    const { data: cached } = await supabase
      .from('comprehension_sets')
      .select('questions')
      .eq('text_hash', textHash)
      .maybeSingle();

    if (cached?.questions) {
      console.log(`[DEBUG] Cache HIT for text hash: ${textHash}`);
      return NextResponse.json({ questions: cached.questions, cached: true });
    }
    console.log(`[DEBUG] Cache MISS for text hash: ${textHash}. Calling AI...`);

    // Generate questions via AI
    const { object: aiResult } = await generateObject({
      model: google('gemini-2.5-flash'),
      temperature: 0,
      system: COMPREHENSION_SYSTEM_PROMPT,
      prompt: buildComprehensionUserPrompt(text),
      schema: QuestionSchema,
    });

    // Cache the generated questions in Supabase
    if (userId) {
      console.log(`[DEBUG] Caching questions in DB for user ${userId}`);
      await supabase.from('comprehension_sets').insert({
        user_id: userId,
        text_hash: textHash,
        source_text: text.substring(0, 5000),
        questions: aiResult.questions,
      });
    } else {
      console.log(`[DEBUG] No userId found, skipping cache insert to DB`);
    }

    return NextResponse.json({
      questions: aiResult.questions,
      cached: false,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'comprehension_failed', message: msg },
      { status: 500 },
    );
  }
}
