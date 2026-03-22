'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { RSVPPlayer } from '@/features/reader/components/RSVPPlayer';
import { ComprehensionQuiz } from '@/features/reader/components/ComprehensionQuiz';
import { ReadingProfile } from '@/types/reading';
import { Award, Flame, ArrowLeft, Loader2 } from 'lucide-react';

interface Props {
  profile: ReadingProfile;
}

export function DailySessionFlow({ profile }: Props) {
  const router = useRouter();
  const [step, setStep] = useState<'loading' | 'reading' | 'quiz' | 'saving' | 'summary'>('loading');
  const [sessionData, setSessionData] = useState<any>(null);
  const [finalWpm, setFinalWpm] = useState(0);
  const [summaryData, setSummaryData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Generate session
    const generateSession = async () => {
      try {
        const res = await fetch('/api/session/generate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ profile }),
        });
        if (!res.ok) throw new Error('Failed to generate session');
        const data = await res.json();
        setSessionData(data.session);
        setStep('reading');
      } catch (err: any) {
        setError(err.message);
      }
    };
    if (step === 'loading') {
      generateSession();
    }
  }, [profile, step]);

  const handleReadingComplete = (wpm: number) => {
    setFinalWpm(wpm);
    setStep('quiz');
  };

  const handleQuizFinish = async (score: number) => {
    setStep('saving');
    try {
      // Calculate words read roughly
      const wordsRead = sessionData.passageText.trim().split(/\s+/).length;
      
      const questionsTotal = 5; // Fixed per constant for MVP assumption
      const questionsCorrect = Math.round((score / 100) * questionsTotal);
      
      const res = await fetch('/api/session/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          wordsRead,
          wpmAchieved: finalWpm,
          questionsTotal,
          questionsCorrect,
          bottleneckTargeted: profile.primaryBottleneck
        }),
      });
      if (!res.ok) throw new Error('Failed to save session');
      const data = await res.json();
      setSummaryData(data);
      setStep('summary');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-4 text-center">
        <h2 className="text-2xl font-bold text-red-600 mb-4">Error loading session</h2>
        <p className="text-slate-600 mb-6">{error}</p>
        <button onClick={() => router.push('/dashboard')} className="px-6 py-2 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-white rounded-lg hover:opacity-90">Go Back</button>
      </div>
    );
  }

  if (step === 'loading') {
    return (
      <div className="max-w-3xl mx-auto py-24 px-4 text-center flex flex-col items-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Building your custom session...</h2>
        <p className="text-slate-500 mt-2">Targeting {profile.primaryBottleneck.replace('_', ' ')}</p>
      </div>
    );
  }

  if (step === 'saving') {
    return (
      <div className="max-w-3xl mx-auto py-24 px-4 text-center flex flex-col items-center">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Evaluating results...</h2>
      </div>
    );
  }

  if (step === 'reading' && sessionData) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 relative px-4">
        <button 
          onClick={() => router.push('/dashboard')}
          className="absolute -top-6 left-4 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 font-medium transition-colors"
        >
          <ArrowLeft size={18} /> Cancel Session
        </button>
        <div className="mb-6 text-center">
           <h2 className="text-xl font-bold text-slate-800 dark:text-slate-200">{sessionData.passageTitle}</h2>
           <p className="text-sm text-slate-500">{sessionData.sessionGoal}</p>
        </div>
        <RSVPPlayer 
          text={sessionData.passageText} 
          onComplete={handleReadingComplete} 
          initialWpm={sessionData.targetWpm} 
        />
      </div>
    );
  }

  if (step === 'quiz' && sessionData) {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 px-4">
        <ComprehensionQuiz 
          text={sessionData.passageText} 
          wpm={finalWpm}
          onFinish={handleQuizFinish} 
          onCancel={() => router.push('/dashboard')}
        />
      </div>
    );
  }

  if (step === 'summary' && summaryData) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 px-4">
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 p-8 text-center">
          <div className="w-20 h-20 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center mx-auto mb-6">
            <Award size={40} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Session Complete!</h2>
          <p className="text-lg text-slate-600 dark:text-slate-400 mb-8">You achieved {finalWpm} WPM with {summaryData.comprehensionScore}% comprehension.</p>
          
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-center gap-2 text-blue-500 mb-2">
                <Award size={24} />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">+{summaryData.xpEarned}</div>
              <div className="text-sm font-medium text-slate-500 mt-1">XP Earned</div>
            </div>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 p-6 rounded-2xl border border-slate-100 dark:border-slate-800">
              <div className="flex items-center justify-center gap-2 text-orange-500 mb-2">
                <Flame size={24} fill="currentColor" />
              </div>
              <div className="text-3xl font-black text-slate-900 dark:text-white">{summaryData.newStreak}</div>
              <div className="text-sm font-medium text-slate-500 mt-1">Day Streak</div>
            </div>
          </div>

          <button
            onClick={() => router.push('/dashboard')}
            className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-sm transition-all text-lg"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return null;
}
