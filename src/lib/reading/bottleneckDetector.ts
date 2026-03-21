export type BottleneckType = 'subvocalization' | 'regression' | 'vocabulary_gaps' | 'topic_unfamiliarity';

export interface DiagnosticMetrics {
  baseWpm: number;
  maxWpm: number;
  rewinds: number;
  comprehensionScore: number; 
  vocabularyDrops?: number;
}

export interface DetectionResult {
  bottleneck: BottleneckType;
  severity: 'low' | 'medium' | 'high';
  confidence: number;
}

/**
 * Pure logic to classify a user's reading bottleneck based on behavioral metrics.
 * Operates completely offline, no AI needed for baseline heuristic detection.
 */
export function detectBottleneck(metrics: DiagnosticMetrics): DetectionResult {
  const { baseWpm, maxWpm, rewinds, comprehensionScore, vocabularyDrops = 0 } = metrics;
  
  // 1. Vocabulary Gaps
  // Sudden drops in speed and low comprehension
  if (vocabularyDrops > 2 && comprehensionScore < 80) {
    return {
      bottleneck: 'vocabulary_gaps',
      severity: vocabularyDrops > 5 ? 'high' : 'medium',
      confidence: 0.8
    };
  }

  // 2. Regression
  // High rewinds (user going back) and poor/mediocre comprehension
  if (rewinds > 3) {
    return {
      bottleneck: 'regression',
      severity: rewinds > 6 ? 'high' : 'medium',
      confidence: 0.85
    };
  }

  // 3. Subvocalization
  // Speed is artificially capped around 250 WPM
  if (baseWpm <= 250 && (maxWpm - baseWpm) <= 50) {
    return {
      bottleneck: 'subvocalization',
      severity: baseWpm < 200 ? 'high' : 'medium',
      confidence: 0.9
    };
  }

  // 4. Topic Unfamiliarity (Fallback for low comprehension with no structural issues)
  // If they read fast, didn't rewind, didn't pause for vocab, but still failed the quiz
  if (comprehensionScore < 75) {
    return {
      bottleneck: 'topic_unfamiliarity',
      severity: comprehensionScore < 50 ? 'high' : 'medium',
      confidence: 0.7
    };
  }

  // Default fallback
  return {
    bottleneck: 'subvocalization',
    severity: 'low',
    confidence: 0.6
  };
}
