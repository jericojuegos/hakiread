import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import {
  SESSION_BUILDER_SYSTEM_PROMPT,
  buildSessionUserPrompt,
} from '@/lib/ai/prompts/sessionBuilder';
import { Bottleneck, ReadingProfile } from '@/types/reading';

export const dynamic = 'force-dynamic';

const GenerateSessionPayloadSchema = z.object({
  profile: z.object({
    id: z.string().optional(),
    userId: z.string().optional(),
    primaryBottleneck: z.enum(['subvocalization', 'regression', 'vocabulary', 'topic_unfamiliarity']),
    bottleneckSeverity: z.number().min(0).max(100),
    secondaryBottleneck: z.enum(['subvocalization', 'regression', 'vocabulary', 'topic_unfamiliarity']).optional(),
    baselineWpm: z.number().min(1),
    baselineComprehension: z.number().min(0).max(100),
    vocabularyPercentile: z.number().optional(),
    lastDiagnosedAt: z.string().optional()
  })
});

const SessionOutputSchema = z.object({
  sessionGoal: z.string(),
  targetWpm: z.number().int().min(10),
  recommendedChunkSize: z.number().int().min(1).max(3),
  passageTitle: z.string(),
  passageText: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = GenerateSessionPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid_payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { profile } = parsed.data;

    const { object: sessionConfig } = await generateObject({
      model: google('gemini-2.5-flash'),
      temperature: 0.4,
      system: SESSION_BUILDER_SYSTEM_PROMPT,
      prompt: buildSessionUserPrompt(profile as ReadingProfile),
      schema: SessionOutputSchema,
    });

    return NextResponse.json({
      session: sessionConfig
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Session generation error:', error);
    return NextResponse.json(
      { error: 'session_generation_failed', message: msg },
      { status: 500 }
    );
  }
}
