import React from 'react';
import { QuickRead } from '@/features/reader/components/QuickRead';
import { TodaySessionCard } from './TodaySessionCard';
import { LayoutDashboard, Award, Flame } from 'lucide-react';
import { ReadingProfile } from '@/types/reading';

interface Props {
  profile: ReadingProfile | null;
}

export function DashboardView({ profile }: Props) {
  const xp = profile?.xp || 0;
  const streak = profile?.streak || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <LayoutDashboard className="text-blue-600" />
          Dashboard
        </h1>
        
        <div className="flex gap-4">
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm px-4 py-2.5 rounded-xl">
             <Flame className="text-orange-500 flex-shrink-0" size={20} fill="currentColor" />
             <span className="font-bold text-slate-700 dark:text-slate-200">{streak} Day{streak !== 1 ? 's' : ''}</span>
          </div>
          <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm px-4 py-2.5 rounded-xl">
             <Award className="text-blue-500 flex-shrink-0" size={20} />
             <span className="font-bold text-slate-700 dark:text-slate-200">{xp} XP</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-1">
          <TodaySessionCard profile={profile} />
        </div>
        <div className="lg:col-span-2">
           <QuickRead />
        </div>
      </div>
    </div>
  );
}
