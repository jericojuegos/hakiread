export interface ProgressPoint {
  date: string;
  avgWpm: number;
  avgComprehension: number;
  sessionsCompleted: number;
}

export interface WeeklyReport {
  weekStart: string;
  progress: ProgressPoint[];
  driftDetected: boolean;
  driftDetails?: string;
}

export interface DriftAlert {
  type: 'plateau' | 'regression' | 'bottleneck_shift';
  message: string;
  severity: 'low' | 'medium' | 'high';
}
