import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { generateObject } from 'ai';
import { google } from '@ai-sdk/google';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { DIAGNOSTIC_SYSTEM_PROMPT, buildDiagnosticUserPrompt } from '@/lib/ai/prompts/diagnostic';
import { Bottleneck, ReadingProfile } from '@/types/reading';

// Force dynamic to access cookies and process POST payload correctly
export const dynamic = 'force-dynamic';

const DiagnosticPayloadSchema = z.object({
  baseWpm: z.number().min(1),
  maxWpm: z.number().min(1),
  rewinds: z.number().min(0),
  comprehensionScore: z.number().min(0).max(100),
  primaryBottleneck: z.enum(['subvocalization', 'regression', 'vocabulary', 'topic_unfamiliarity']),
  bottleneckSeverity: z.enum(['low', 'medium', 'high']),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = DiagnosticPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: 'invalid_payload', details: parsed.error.format() }, { status: 400 });
    }

    const metrics = parsed.data;

    // Use AI to generate secondary bottleneck, vocabulary, and insights
    const { object: aiResult } = await generateObject({
      model: google('gemini-2.5-flash'),
      temperature: 0.2, // Low temperature for consistent analysis
      system: DIAGNOSTIC_SYSTEM_PROMPT,
      prompt: buildDiagnosticUserPrompt(metrics),
      schema: z.object({
        secondaryBottleneck: z.enum(['subvocalization', 'regression', 'vocabulary', 'topic_unfamiliarity']).nullable(),
        vocabularyPercentile: z.number().min(0).max(100),
        aiInsightsSummary: z.string()
      }),
    });

    // Check for an active user session
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) => {
                cookieStore.set(name, value, options);
              });
            } catch (error) {
              // Ignore cookie set errors in route handlers if called from middleware
            }
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    // Numerical severity mapping for DB if needed, but we keep string in TS. 
    // Wait, `ReadingProfile.bottleneckSeverity` is a number in our types. Let's map it:
    const severityMap: Record<string, number> = { 'low': 33, 'medium': 66, 'high': 100 };

    const profile: Partial<ReadingProfile> & { aiInsightsSummary: string } = {
      primaryBottleneck: metrics.primaryBottleneck as Bottleneck,
      bottleneckSeverity: severityMap[metrics.bottleneckSeverity] || 50,
      secondaryBottleneck: aiResult.secondaryBottleneck as Bottleneck || undefined,
      baselineWpm: metrics.baseWpm,
      baselineComprehension: metrics.comprehensionScore,
      vocabularyPercentile: aiResult.vocabularyPercentile,
      aiInsightsSummary: aiResult.aiInsightsSummary,
      lastDiagnosedAt: new Date().toISOString()
    };

    if (userId) {
      profile.userId = userId;
      // Upsert profile in DB
      const { data: dbProfile, error } = await supabase
        .from('reading_profiles')
        .upsert({
          user_id: userId,
          primary_bottleneck: profile.primaryBottleneck,
          bottleneck_severity: profile.bottleneckSeverity,
          secondary_bottleneck: profile.secondaryBottleneck,
          baseline_wpm: profile.baselineWpm,
          baseline_comprehension: profile.baselineComprehension,
          vocabulary_percentile: profile.vocabularyPercentile,
          last_diagnosed_at: profile.lastDiagnosedAt
        }, { onConflict: 'user_id' })
        .select()
        .single();

      if (error) {
        console.error('Diagnostic DB Upsert error:', error);
        // Continue and just return the in-memory profile rather than failing the whole diagnostic
      } else {
        profile.id = dbProfile.id;
      }
    } else {
      profile.id = 'anon-' + Date.now(); // Temp ID for anonymous local storage
      profile.userId = 'anonymous';
    }

    return NextResponse.json({ profile });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'diagnostic_failed', message: msg },
      { status: 500 }
    );
  }
}
