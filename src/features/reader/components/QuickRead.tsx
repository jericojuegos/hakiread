'use client';

import React, { useState } from 'react';
import { Play, ArrowLeft, FileText, LayoutDashboard } from 'lucide-react';
import { RSVPPlayer } from '@/features/reader/components/RSVPPlayer';
import { ComprehensionQuiz } from '@/features/reader/components/ComprehensionQuiz';

export function QuickRead() {
  const [mode, setMode] = useState<'input' | 'reading' | 'quiz'>('input');
  const [text, setText] = useState('');
  const [finalWpm, setFinalWpm] = useState(0);

  const handleStart = () => {
    if (text.trim().length > 0) {
      setMode('reading');
    }
  };

  const handleComplete = (wpm: number) => {
    setFinalWpm(wpm);
    setMode('quiz');
  };

  const handleQuizFinish = (score: number) => {
    setMode('input');
    setText('');
    // TODO: In a later task, we'll store this score in the user's history
  };

  const handleBack = () => {
    setMode('input');
  };

  if (mode === 'reading') {
    return (
      <div className="w-full max-w-4xl mx-auto py-8 relative px-4">
        <div>
          <button 
            onClick={handleBack}
            className="absolute -top-6 left-4 flex items-center gap-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white font-medium transition-colors"
          >
            <ArrowLeft size={18} /> Back to Dashboard
          </button>
          <RSVPPlayer 
            text={text} 
            onComplete={handleComplete} 
            initialWpm={300} 
          />
        </div>
      </div>
    );
  }

  if (mode === 'quiz') {
    return (
      <div className="w-full py-8">
        <ComprehensionQuiz 
          text={text} 
          wpm={finalWpm}
          onFinish={handleQuizFinish} 
          onCancel={handleBack}
        />
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8">
      
      {/* Information Header */}
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          Quick Read
        </h2>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
          Paste any text below to instantly begin a reading session.
        </p>
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center gap-2 text-slate-600 dark:text-slate-300 font-medium">
          <FileText size={18} />
          Quick Import
        </div>
        
        <div className="p-6">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste your article, email, or study notes here..."
            className="w-full min-h-[300px] p-4 bg-transparent border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-y text-slate-700 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 transition-all font-serif text-lg leading-relaxed"
          ></textarea>

          <div className="mt-6 flex justify-end">
            <button
              onClick={handleStart}
              disabled={text.trim().length === 0}
              className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold rounded-xl shadow-sm hover:shadow transition-all active:scale-95"
            >
              <Play size={20} fill="currentColor" />
              Start Reading
            </button>
          </div>
        </div>
      </div>

      {/* Info Boxes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <div className="p-5 rounded-xl bg-orange-50 dark:bg-orange-900/10 border border-orange-100 dark:border-orange-800/50">
          <h3 className="font-semibold text-orange-800 dark:text-orange-400 mb-1">Upcoming Feature</h3>
          <p className="text-orange-700 dark:text-orange-300/80 text-sm">Saving documents to your Library and remembering reading positions will be available after the Comprehension Engine drops.</p>
        </div>
        <div className="p-5 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50">
          <h3 className="font-semibold text-blue-800 dark:text-blue-400 mb-1">Upcoming Feature</h3>
          <p className="text-blue-700 dark:text-blue-300/80 text-sm">Comprehension questions and vocabulary scanning will be analyzed for your content once the AI pipeline expands.</p>
        </div>
      </div>
      
    </div>
  );
}
