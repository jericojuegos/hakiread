export type Bottleneck = 'subvocalization' | 'regression' | 'vocabulary' | 'topic_unfamiliarity';

export interface ReadingProfile {
  id: string;
  userId: string;
  primaryBottleneck: Bottleneck;
  bottleneckSeverity: number;
  secondaryBottleneck?: Bottleneck;
  baselineWpm: number;
  baselineComprehension: number;
  vocabularyPercentile?: number;
  lastDiagnosedAt: string;
}

export interface SessionResult {
  id: string;
  sessionId: string;
  userId: string;
  wpmAchieved: number;
  comprehensionScore: number;
  questionsTotal: number;
  questionsCorrect: number;
  exerciseScores: Record<string, number>;
  notes?: string;
}
