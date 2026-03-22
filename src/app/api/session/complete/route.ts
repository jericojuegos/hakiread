import 'server-only';
import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { SESSION_XP_FACTOR } from '@/lib/constants';

export const dynamic = 'force-dynamic';

const CompleteSessionPayloadSchema = z.object({
  wordsRead: z.number().int().min(1),
  wpmAchieved: z.number().int().min(1),
  questionsTotal: z.number().int().min(1),
  questionsCorrect: z.number().int().min(0),
  bottleneckTargeted: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = CompleteSessionPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'invalid_payload', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { wordsRead, wpmAchieved, questionsTotal, questionsCorrect, bottleneckTargeted } = parsed.data;
    const comprehensionScore = questionsTotal > 0 ? (questionsCorrect / questionsTotal) : 0;
    
    // XP formula: wordsRead × comprehension_score × SESSION_XP_FACTOR
    const xpEarned = Math.round(wordsRead * comprehensionScore * SESSION_XP_FACTOR);

    // Get active user
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll(); },
          setAll(cookiesToSet) {
            try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch (_) {}
          },
        },
      }
    );

    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;

    if (!userId) {
      // For anonymous users, just return the calculated XP so the frontend can store it locally
      return NextResponse.json({
        xpEarned,
        comprehensionScore: Math.round(comprehensionScore * 100),
        isAnonymous: true
      });
    }

    // 1. Create a training_sessions record
    const { data: trainingSession, error: sessionErr } = await supabase
      .from('training_sessions')
      .insert({
        user_id: userId,
        session_type: 'daily_training',
        bottleneck_targeted: bottleneckTargeted || 'baseline',
        completed_at: new Date().toISOString()
      })
      .select()
      .single();

    if (sessionErr) throw new Error(`Failed to create training session: ${sessionErr.message}`);

    // 2. Create the session_results record
    const { error: resultsErr } = await supabase
      .from('session_results')
      .insert({
        session_id: trainingSession.id,
        user_id: userId,
        wpm_achieved: wpmAchieved,
        comprehension_score: Math.round(comprehensionScore * 100), // store as percentage 0-100
        questions_total: questionsTotal,
        questions_correct: questionsCorrect,
      });

    if (resultsErr) throw new Error(`Failed to create session results: ${resultsErr.message}`);

    // 3. Update the user's reading_profile with XP and streak
    // Ideally we would do this in an RPC/edge function, but for MVP we fetch, add, and upsert
    const { data: profile } = await supabase
      .from('reading_profiles')
      .select('xp, streak, last_session_at')
      .eq('user_id', userId)
      .single();

    let newXp = xpEarned;
    let newStreak = 1;
    const now = new Date();

    if (profile) {
      newXp = (profile.xp || 0) + xpEarned;
      
      const lastSession = profile.last_session_at ? new Date(profile.last_session_at) : null;
      if (lastSession) {
        const diffMs = now.getTime() - lastSession.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffDays === 1) {
          // Consecutive day
          newStreak = (profile.streak || 0) + 1;
        } else if (diffDays === 0) {
          // Same day, keep streak
          newStreak = (profile.streak || 1);
        } else {
          // Streak broken
          newStreak = 1;
        }
      }
    }

    const { error: profileErr } = await supabase
      .from('reading_profiles')
      .update({
        xp: newXp,
        streak: newStreak,
        last_session_at: now.toISOString()
      })
      .eq('user_id', userId);

    if (profileErr) throw new Error(`Failed to update profile XP: ${profileErr.message}`);

    return NextResponse.json({
      xpEarned,
      newTotalXp: newXp,
      newStreak,
      comprehensionScore: Math.round(comprehensionScore * 100),
      isAnonymous: false
    });

  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Unknown error';
    console.error('Session complete error:', error);
    return NextResponse.json(
      { error: 'session_complete_failed', message: msg },
      { status: 500 }
    );
  }
}
