import React from 'react';
import Link from 'next/link';
import { Play, BrainCircuit } from 'lucide-react';
import { ReadingProfile } from '@/types/reading';

interface Props {
  profile: ReadingProfile | null;
}

export function TodaySessionCard({ profile }: Props) {
  // If no profile, they need to take the diagnostic
  if (!profile) {
    return (
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full">
        <div className="flex items-center gap-2 text-blue-600 mb-4">
          <BrainCircuit size={24} />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Daily Training</h2>
        </div>
        <p className="text-slate-600 dark:text-slate-400 mb-6 flex-grow">
          Take the diagnostic test to unlock your personalized daily reading session.
        </p>
        <Link 
          href="/diagnostic"
          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all"
        >
          Take Diagnostic
        </Link>
      </div>
    );
  }

  // TODO: Add logic to check if they already completed today's session using profile.last_session_at

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white dark:from-slate-800 dark:to-slate-900 rounded-2xl shadow-sm border border-blue-100 dark:border-blue-900/30 p-6 flex flex-col h-full relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 dark:bg-blue-500/5 rounded-bl-full -z-0"></div>
      
      <div className="relative z-10 flex-grow">
        <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 mb-2">
          <BrainCircuit size={24} />
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Today's Session</h2>
        </div>
        
        <p className="text-slate-600 dark:text-slate-400 mt-2 mb-6">
          A personalized passage to improve your {profile.primaryBottleneck.replace('_', ' ')}.
        </p>
        
        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">Target Speed</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">{Math.round((profile.baselineWpm || 250) * 1.05)} WPM</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-slate-500 dark:text-slate-400">Focus</span>
            <span className="font-semibold text-slate-700 dark:text-slate-200 capitalize">{profile.primaryBottleneck.replace('_', ' ')}</span>
          </div>
        </div>
      </div>

      <div className="relative z-10 mt-auto">
        <Link 
          href="/session/daily"
          className="flex items-center justify-center gap-2 w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-all shadow-blue-500/25 hover:shadow-blue-500/40"
        >
          <Play size={20} fill="currentColor" />
          Start Session
        </Link>
      </div>
    </div>
  );
}
