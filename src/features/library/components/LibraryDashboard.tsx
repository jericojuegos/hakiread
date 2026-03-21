'use client';

import React, { useState } from 'react';
import { BookMarked, Clock, CheckCircle2, MoreVertical, Plus, Library } from 'lucide-react';
import Link from 'next/link';

// Mock data structure until we wire up Supabase in the next BE task
interface DocumentObject {
  id: string;
  title: string;
  excerpt: string;
  progress: number; // 0 to 100
  wordsTotal: number;
  addedAt: string;
}

const MOCK_DOCS: DocumentObject[] = [
  {
    id: '1',
    title: 'The Architecture of Modern Web Applications',
    excerpt: 'An exploration of how FDA and clean architectures scale in modern React environments...',
    progress: 45,
    wordsTotal: 2500,
    addedAt: '2 days ago'
  },
  {
    id: '2',
    title: 'Understanding the RSVP Reading Methodology',
    excerpt: 'Rapid Serial Visual Presentation minimizes saccades and regressions to double reading speed...',
    progress: 100,
    wordsTotal: 1200,
    addedAt: '1 week ago'
  },
  {
    id: '3',
    title: 'Weekly Engineering Update - Q3',
    excerpt: 'This quarter we focused heavily on performance metrics and reducing our bundle size footprint...',
    progress: 0,
    wordsTotal: 850,
    addedAt: 'Just now'
  }
];

export function LibraryDashboard() {
  // Toggle this to test the empty state
  const [docs] = useState<DocumentObject[]>(MOCK_DOCS);

  if (docs.length === 0) {
    return (
      <div className="w-full max-w-5xl mx-auto space-y-8">
        <Header />
        <div className="flex flex-col items-center justify-center min-h-[400px] bg-slate-50 dark:bg-slate-800/20 rounded-2xl border border-slate-200 border-dashed dark:border-slate-800 p-8 text-center mt-12">
          <div className="w-20 h-20 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-full flex items-center justify-center mb-6">
            <BookMarked size={32} />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Your library is empty</h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
            Import articles, PDFs, or paste text to build your personal reading collection and track your progress over time.
          </p>
          <Link 
            href="/dashboard"
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl shadow-sm hover:shadow transition-all active:scale-95"
          >
            <Plus size={20} />
            Import Document
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <Header />
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 pt-6">
        {docs.map(doc => (
          <DocumentCard key={doc.id} doc={doc} />
        ))}
      </div>
    </div>
  );
}

function Header() {
  return (
    <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
          <Library className="text-blue-600" />
          Library
        </h1>
        <p className="text-slate-600 dark:text-slate-400 mt-2 text-lg">
          Your saved articles and reading progress.
        </p>
      </div>
      <Link 
        href="/dashboard"
        className="hidden md:flex items-center gap-2 px-5 py-2.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl transition-colors border border-slate-200 dark:border-slate-700 active:scale-95 shadow-sm"
      >
        <Plus size={18} /> New Import
      </Link>
    </div>
  );
}

function DocumentCard({ doc }: { doc: DocumentObject }) {
  const isComplete = doc.progress === 100;
  
  return (
    <div className="group flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-blue-300 dark:hover:border-blue-700">
      
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Clock size={14} /> {doc.addedAt}
          </div>
          <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreVertical size={18} />
          </button>
        </div>
        
        <h3 className="font-bold text-slate-900 dark:text-white text-xl leading-snug mb-3 line-clamp-2">
          {doc.title}
        </h3>
        
        <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-3 mb-6 leading-relaxed">
          {doc.excerpt}
        </p>
      </div>
      
      <div className="px-6 pb-6 mt-auto">
        <div className="flex justify-between items-end mb-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
            {isComplete ? (
              <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-500">
                <CheckCircle2 size={16} /> Completed
              </span>
            ) : (
              `${doc.progress}% Read`
            )}
          </div>
          <div className="text-xs font-medium text-slate-400">{doc.wordsTotal} words</div>
        </div>
        
        <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
          <div 
            className={`h-full transition-all duration-1000 ease-out rounded-full ${isComplete ? 'bg-emerald-500' : 'bg-blue-600 dark:bg-blue-500'}`}
            style={{ width: `${doc.progress}%` }}
          />
        </div>
      </div>
      
    </div>
  );
}
