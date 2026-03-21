'use client';

import React, { useState } from 'react';
import { RSVPPlayer } from '@/features/reader/components/RSVPPlayer';
import { detectBottleneck, DetectionResult } from '@/lib/reading/bottleneckDetector';

const DIAGNOSTIC_TEXT = `The human brain is a remarkable pattern-recognition machine. When you first learn to read, you sound out every letter, converting visual symbols into auditory signals. This process, known as subvocalization, is essential for beginners but severely limits your maximum reading speed later in life. Most adults continue to "hear" the words in their head as they read, capping their speed at roughly 250 words per minute, which is the average speed of human speech. By utilizing Rapid Serial Visual Presentation, or RSVP, you can eliminate the need for eye movement and suppress subvocalization. This technique flashes words in front of your focal point, forcing your brain to process the visual information directly as concepts, rather than translating them into sounds first. Over time, practicing with RSVP builds new neural pathways, allowing you to comprehend dense material at speeds exceeding 500 words per minute.`;

const DIAGNOSTIC_QUESTIONS = [
  {
    question: "What process limits the average adult's reading speed to around 250 WPM?",
    options: ["Eye strain", "Subvocalization", "Regression", "Vocabulary gaps"],
    answer: "Subvocalization"
  },
  {
    question: "How does RSVP help increase reading speed?",
    options: ["By sounding words out louder", "By flashing words at your focal point", "By highlighting punctuation", "By translating text into audio"],
    answer: "By flashing words at your focal point"
  },
  {
    question: "What does the text claim the brain converts visual symbols into during early reading?",
    options: ["Auditory signals", "Neural pathways", "Motor functions", "Conceptual structures"],
    answer: "Auditory signals"
  }
];

export function DiagnosticPassage() {
  const [stage, setStage] = useState<'intro' | 'reading' | 'quiz' | 'results'>('intro');
  const [metrics, setMetrics] = useState({
    rewinds: 0
  });
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<any | null>(null);

  const startReading = () => setStage('reading');

  const handleReadingComplete = () => {
    setStage('quiz');
  };

  const submitQuiz = async () => {
    setIsAnalyzing(true);
    let correct = 0;
    DIAGNOSTIC_QUESTIONS.forEach((q, i) => {
      if (answers[i] === q.answer) correct++;
    });
    
    const comprehensionScore = Math.round((correct / DIAGNOSTIC_QUESTIONS.length) * 100);
    const baseWpm = 250;
    const maxWpm = 250; 
    
    const localDetection = detectBottleneck({
      baseWpm,
      maxWpm,
      rewinds: metrics.rewinds,
      comprehensionScore,
      vocabularyDrops: 0 
    });

    try {
      const res = await fetch('/api/diagnostic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          baseWpm,
          maxWpm,
          rewinds: metrics.rewinds,
          comprehensionScore,
          primaryBottleneck: localDetection.bottleneck,
          bottleneckSeverity: localDetection.severity,
        })
      });
      
      const payload = await res.json();
      
      if (res.ok && payload.profile) {
        setResult(payload.profile);
      } else {
        // Fallback to local if AI generation failed
        setResult({
          baselineComprehension: comprehensionScore,
          baselineWpm: baseWpm,
          primaryBottleneck: localDetection.bottleneck,
          bottleneckSeverity: localDetection.severity === 'high' ? 100 : localDetection.severity === 'medium' ? 50 : 25,
          aiInsightsSummary: "AI analysis unavailable. Please check your API key connection."
        });
      }
    } catch (e) {
      setResult({
        baselineComprehension: comprehensionScore,
        baselineWpm: baseWpm,
        primaryBottleneck: localDetection.bottleneck,
        bottleneckSeverity: localDetection.severity === 'high' ? 100 : localDetection.severity === 'medium' ? 50 : 25,
        aiInsightsSummary: "AI analysis server request failed."
      });
    }
    
    setIsAnalyzing(false);
    setStage('results');
  };

  if (stage === 'intro') {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center">
        <h2 className="text-2xl font-bold mb-4 text-slate-900 dark:text-white">Reading Baseline Diagnostic</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">
          We need to calculate your baseline reading speed and identify your primary bottleneck. 
          You will read a short passage and then answer 3 quick questions.
        </p>
        <button 
          onClick={startReading}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
        >
          Start Diagnostic
        </button>
      </div>
    );
  }

  if (stage === 'reading') {
    return (
      <div className="animate-in fade-in duration-500">
        <div className="max-w-3xl mx-auto mb-4 text-center text-sm font-medium text-slate-500">
          Read comfortably. Adjust speed if needed using ↑/↓ keys.
        </div>
        <RSVPPlayer 
          text={DIAGNOSTIC_TEXT} 
          onComplete={handleReadingComplete}
          initialWpm={250}
        />
      </div>
    );
  }

  if (stage === 'quiz') {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm animate-in fade-in slide-in-from-bottom-4">
        <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">Comprehension Check</h2>
        <div className="space-y-8">
          {DIAGNOSTIC_QUESTIONS.map((q, i) => (
            <div key={i} className="space-y-3">
              <p className="font-medium text-slate-800 dark:text-slate-200">{i + 1}. {q.question}</p>
              <div className="space-y-2">
                {q.options.map(opt => (
                  <label key={opt} className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition-colors">
                    <input 
                      type="radio" 
                      name={`question-${i}`} 
                      value={opt}
                      checked={answers[i] === opt}
                      onChange={() => setAnswers({...answers, [i]: opt})}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-slate-700 dark:text-slate-300">{opt}</span>
                  </label>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex justify-end">
          <button 
            onClick={submitQuiz}
            disabled={Object.keys(answers).length < DIAGNOSTIC_QUESTIONS.length || isAnalyzing}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors flex items-center gap-2"
          >
            {isAnalyzing ? "Analyzing Profile..." : "Submit Answers"}
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'results' && result) {
    return (
      <div className="max-w-2xl mx-auto p-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm text-center animate-in zoom-in-95 duration-500">
        <h2 className="text-3xl font-bold mb-2 text-slate-900 dark:text-white">Diagnostic Complete</h2>
        <p className="text-slate-600 dark:text-slate-400 mb-8">Here is your initial reading profile analysis.</p>
        
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Comprehension</div>
            <div className="text-4xl font-bold text-slate-900 dark:text-white">{result.baselineComprehension}%</div>
            {result.vocabularyPercentile && (
              <div className="text-sm text-slate-500 mt-2">Vocab Percentile: {result.vocabularyPercentile}th</div>
            )}
          </div>
          <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
            <div className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-2">Primary Bottleneck</div>
            <div className="text-xl font-bold text-blue-600 dark:text-blue-400 capitalize">
              {result.primaryBottleneck?.replace('_', ' ')}
            </div>
            <div className="text-sm text-slate-500 mt-1 capitalize">
              Severity: {result.bottleneckSeverity === 100 ? 'High' : result.bottleneckSeverity === 50 ? 'Medium' : 'Low'}
              {result.secondaryBottleneck && ` • Secondary: ${result.secondaryBottleneck}`}
            </div>
          </div>
        </div>
        
        {result.aiInsightsSummary && (
          <div className="p-6 mb-8 text-left bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/50 rounded-xl text-slate-700 dark:text-slate-300 italic leading-relaxed">
            "{result.aiInsightsSummary}"
          </div>
        )}

        <button className="px-8 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-medium rounded-lg hover:opacity-90 transition-opacity">
          Create Account to Save Profile
        </button>
      </div>
    );
  }

  return null;
}
