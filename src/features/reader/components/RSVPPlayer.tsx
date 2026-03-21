'use client';

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Play, Pause, FastForward, Rewind, Settings2 } from 'lucide-react';
import { 
  MAX_SESSION_WPM, 
  MIN_SESSION_WPM, 
  WPM_STEP_FINE, 
  CHUNK_SIZES 
} from '@/lib/constants';

interface RSVPPlayerProps {
  text: string;
  onComplete?: (finalWpm: number) => void;
  initialWpm?: number;
}

export function RSVPPlayer({ text, onComplete, initialWpm = 300 }: RSVPPlayerProps) {
  const [wpm, setWpm] = useState(initialWpm);
  const [chunkSize, setChunkSize] = useState<1 | 2 | 3>(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Pre-process text into words
  const words = useMemo(() => {
    return text.split(/\s+/).filter(w => w.length > 0);
  }, [text]);

  const wordQueue = useMemo(() => {
    const queue: string[][] = [];
    for (let i = 0; i < words.length; i += chunkSize) {
      queue.push(words.slice(i, i + chunkSize));
    }
    return queue;
  }, [words, chunkSize]);

  const requestRef = useRef<number | undefined>(undefined);
  const lastUpdateRef = useRef<number | undefined>(undefined);

  const currentDisplay = wordQueue[currentIndex] ? wordQueue[currentIndex].join(' ') : '';
  const isFinished = currentIndex >= wordQueue.length;

  const handlePausePlay = useCallback(() => {
    if (isFinished) {
      setCurrentIndex(0);
      setIsPlaying(true);
    } else {
      setIsPlaying(prev => !prev);
    }
  }, [isFinished]);

  const findSentenceBoundary = useCallback((direction: 'prev' | 'next') => {
    let index = currentIndex;
    const isPunctuation = (word: string) => /[.!?]$/.test(word);

    if (direction === 'prev') {
      // Step back at least 2 chunks to avoid getting stuck on the current sentence end
      index -= 2; 
      while (index > 0 && !isPunctuation(wordQueue[index][wordQueue[index].length - 1])) {
        index--;
      }
      return Math.max(0, index + (index > 0 ? 1 : 0));
    } else {
      while (index < wordQueue.length - 1 && !isPunctuation(wordQueue[index][wordQueue[index].length - 1])) {
        index++;
      }
      return Math.min(wordQueue.length - 1, index + 1);
    }
  }, [currentIndex, wordQueue]);

  const rewindSentence = useCallback(() => {
    setCurrentIndex(findSentenceBoundary('prev'));
  }, [findSentenceBoundary]);

  const forwardSentence = useCallback(() => {
    setCurrentIndex(findSentenceBoundary('next'));
  }, [findSentenceBoundary]);

  const changeWpm = useCallback((delta: number) => {
    setWpm(prev => {
      const next = prev + delta;
      if (next > MAX_SESSION_WPM) return MAX_SESSION_WPM;
      if (next < MIN_SESSION_WPM) return MIN_SESSION_WPM;
      return next;
    });
  }, []);

  const changeChunkSize = useCallback((size: 1 | 2 | 3) => {
    // Attempt to keep same approximate word position
    const currentWordIndex = currentIndex * chunkSize;
    setChunkSize(size);
    setCurrentIndex(Math.floor(currentWordIndex / size));
  }, [currentIndex, chunkSize]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePausePlay();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        rewindSentence();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        forwardSentence();
      } else if (e.code === 'ArrowUp') {
        e.preventDefault();
        changeWpm(WPM_STEP_FINE);
      } else if (e.code === 'ArrowDown') {
        e.preventDefault();
        changeWpm(-WPM_STEP_FINE);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePausePlay, rewindSentence, forwardSentence, changeWpm]);

  // rAF Animation Loop
  const animate = useCallback((time: number) => {
    if (!lastUpdateRef.current) lastUpdateRef.current = time;
    
    // Calculate ms per flash. Assuming WPM is words per minute.
    // If chunk size is > 1, the flash stays longer: (60000 / wpm) * chunkSize.
    const msPerFlash = (60000 / wpm) * chunkSize;

    if (time - lastUpdateRef.current >= msPerFlash) {
      setCurrentIndex(prev => {
        if (prev + 1 >= wordQueue.length) {
          setIsPlaying(false);
          if (onComplete) onComplete(wpm);
          return prev;
        }
        return prev + 1;
      });
      lastUpdateRef.current = time;
    }
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    }
  }, [isPlaying, wpm, chunkSize, wordQueue.length, onComplete]);

  useEffect(() => {
    if (isPlaying) {
      requestRef.current = requestAnimationFrame(animate);
    } else if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isPlaying, animate]);

  // Reset lastUpdateRef on play toggle to prevent skipping chunks
  useEffect(() => {
    if (isPlaying) lastUpdateRef.current = undefined;
  }, [isPlaying]);

  const progressPercent = wordQueue.length > 0 ? (currentIndex / wordQueue.length) * 100 : 0;

  return (
    <div className="w-full max-w-3xl mx-auto p-6 bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
      
      {/* Player Display */}
      <div className="flex flex-col items-center justify-center min-h-[300px] mb-8 bg-slate-50 dark:bg-slate-800/50 rounded-lg p-8 relative">
        <div className="text-4xl md:text-6xl font-medium tracking-tight text-slate-900 dark:text-slate-100 text-center select-none min-h-[1.5em] flex items-center justify-center">
          {isFinished ? "Session Complete" : currentDisplay}
        </div>
        
        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 w-full h-1.5 bg-slate-200 dark:bg-slate-700/50 overflow-hidden rounded-b-lg">
          <div 
            className="h-full bg-blue-600 dark:bg-blue-500 transition-all duration-75 ease-linear"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Controls */}
      <div className="space-y-6">
        
        {/* Playback Controls */}
        <div className="flex items-center justify-center gap-4">
          <button onClick={rewindSentence} className="p-3 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-colors" title="Rewind Sentence (Left Arrow)">
            <Rewind size={24} />
          </button>
          
          <button 
            onClick={handlePausePlay} 
            className="p-4 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-sm hover:shadow transition-all active:scale-95" 
            title="Play/Pause (Space)"
          >
            {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
          </button>
          
          <button onClick={forwardSentence} className="p-3 text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 rounded-full transition-colors" title="Forward Sentence (Right Arrow)">
            <FastForward size={24} />
          </button>
        </div>

        {/* Settings Bar */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
          
          <div className="flex items-center gap-4">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Speed (WPM)</span>
              <div className="flex items-center gap-2 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                <button onClick={() => changeWpm(-WPM_STEP_FINE)} className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm transition-colors">−</button>
                <span className="font-mono font-medium text-center w-12">{wpm}</span>
                <button onClick={() => changeWpm(WPM_STEP_FINE)} className="w-8 h-8 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 rounded-md shadow-sm transition-colors">+</button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider mb-1">Words / Flash</span>
              <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                {CHUNK_SIZES.map(size => (
                  <button
                    key={size}
                    onClick={() => changeChunkSize(size as 1|2|3)}
                    className={`w-10 h-8 flex items-center justify-center text-sm font-medium rounded-md transition-all ${
                      chunkSize === size 
                        ? 'bg-white dark:bg-slate-700 shadow-sm text-blue-600 dark:text-blue-400' 
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
        </div>

        {/* Keyboard Hints */}
        <div className="flex flex-wrap justify-center gap-4 pt-4 text-xs text-slate-400 dark:text-slate-500 font-medium">
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono text-[10px]">Space</kbd> Play/Pause</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono text-[10px]">↑/↓</kbd> Speed</span>
          <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 font-mono text-[10px]">←/→</kbd> Skip Sentences</span>
        </div>

      </div>
    </div>
  );
}
