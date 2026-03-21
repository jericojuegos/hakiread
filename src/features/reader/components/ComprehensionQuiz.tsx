'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Loader2, 
  ArrowRight, 
  Trophy, 
  AlertCircle,
  RefreshCw,
  LayoutDashboard
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface Question {
  level: 'recall' | 'inference' | 'synthesis';
  question: string;
  choices: string[];
  correctIndex: number;
}

interface ComprehensionQuizProps {
  text: string;
  wpm: number;
  onFinish: (score: number) => void;
}

export function ComprehensionQuiz({ text, wpm, onFinish }: ComprehensionQuizProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentStep, setCurrentStep] = useState<'quiz' | 'results'>('quiz');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [score, setScore] = useState(0);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/comprehension', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate comprehension questions');
      }

      const data = await response.json();
      setQuestions(data.questions);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [text]);

  useEffect(() => {
    fetchQuestions();
  }, [fetchQuestions]);

  const handleSelect = (choiceIndex: number) => {
    if (selectedAnswers[currentQuestionIndex] !== undefined) return;

    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = choiceIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      // Calculate final score
      const finalScore = questions.reduce((acc, q, idx) => {
        return acc + (selectedAnswers[idx] === q.correctIndex ? 1 : 0);
      }, 0);
      
      const percentage = Math.round((finalScore / questions.length) * 100);
      setScore(percentage);
      setCurrentStep('results');
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
        </div>
        <p className="text-slate-600 dark:text-slate-400 font-medium animate-pulse text-lg">
          AI is analyzing the passage and generating questions...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 p-8 rounded-2xl text-center space-y-4 max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto" />
        <h3 className="text-xl font-bold text-red-900 dark:text-red-400">Analysis Failed</h3>
        <p className="text-red-700 dark:text-red-300">{error}</p>
        <button 
          onClick={fetchQuestions}
          className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg mx-auto font-semibold hover:bg-red-700 transition-colors"
        >
          <RefreshCw size={18} /> Retry
        </button>
      </div>
    );
  }

  if (currentStep === 'results') {
    return (
      <div className="max-w-xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl text-center space-y-6">
          <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto scale-110">
            <Trophy className="w-10 h-10 text-yellow-600" />
          </div>
          
          <div className="space-y-2">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Session Complete!</h2>
            <p className="text-slate-500 dark:text-slate-400">Your average reading speed and accuracy is being calculated.</p>
          </div>

          <div className="py-4">
            <div className="text-6xl font-black text-blue-600">{score}%</div>
            <div className="text-sm font-bold text-slate-400 uppercase tracking-widest mt-2">Comprehension Accuracy</div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">Speed</div>
              <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{wpm} WPM</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">Questions</div>
              <div className="text-xl font-bold text-slate-900 dark:text-white">{questions.length} Total</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-tight">Correct</div>
              <div className="text-xl font-bold text-green-600">{(score / 100) * questions.length} Hit</div>
            </div>
          </div>

          <button
            onClick={() => onFinish(score)}
            className="w-full flex items-center justify-center gap-2 py-4 bg-slate-900 dark:bg-blue-600 text-white font-bold rounded-2xl hover:bg-slate-800 dark:hover:bg-blue-700 transition-all shadow-lg active:scale-95 group"
          >
            <LayoutDashboard size={20} className="group-hover:-translate-x-1 transition-transform" />
            Finish & Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];
  const isSelected = selectedAnswers[currentQuestionIndex] !== undefined;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Progress Header */}
      <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 px-2">
        <span className="text-sm font-bold uppercase tracking-wider">
          Question {currentQuestionIndex + 1} of {questions.length}
        </span>
        <span className="text-xs font-medium px-2 py-1 rounded bg-slate-100 dark:bg-slate-800 capitalize">
          Level: {currentQuestion.level}
        </span>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl p-8 border border-slate-200 dark:border-slate-800 shadow-xl space-y-8">
        {/* Question */}
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
          {currentQuestion.question}
        </h2>

        {/* Choices */}
        <div className="space-y-3">
          {currentQuestion.choices.map((choice, idx) => {
            const isThisSelected = selectedAnswers[currentQuestionIndex] === idx;
            const isCorrect = idx === currentQuestion.correctIndex;
            
            return (
              <button
                key={idx}
                onClick={() => handleSelect(idx)}
                disabled={isSelected}
                className={cn(
                  "w-full text-left p-5 rounded-2xl border-2 transition-all flex items-start gap-4 group relative overflow-hidden",
                  !isSelected && "border-slate-100 dark:border-slate-800 hover:border-blue-500 hover:bg-blue-50/30 dark:hover:bg-blue-900/10",
                  isSelected && isCorrect && "border-green-500 bg-green-50/50 dark:bg-green-900/10",
                  isSelected && isThisSelected && !isCorrect && "border-red-500 bg-red-50/50 dark:bg-red-900/10",
                  isSelected && !isThisSelected && !isCorrect && "border-slate-100 dark:border-slate-800 opacity-60"
                )}
              >
                <div className="mt-1">
                  {isSelected && isCorrect ? (
                    <CheckCircle2 size={24} className="text-green-600" />
                  ) : isSelected && isThisSelected && !isCorrect ? (
                    <AlertCircle size={24} className="text-red-600" />
                  ) : (
                    <Circle size={24} className={cn(
                      "transition-colors",
                      isThisSelected ? "text-blue-600 fill-blue-600" : "text-slate-300 dark:text-slate-700 group-hover:text-blue-400"
                    )} />
                  )}
                </div>
                <div className="flex-1 text-lg font-medium text-slate-700 dark:text-slate-200">
                  {choice}
                </div>
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="pt-4 flex justify-end">
          <button
            onClick={handleNext}
            disabled={!isSelected}
            className="flex items-center gap-2 px-8 py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-95 group"
          >
            {currentQuestionIndex < questions.length - 1 ? "Next Question" : "Finish Quiz"}
            <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}
