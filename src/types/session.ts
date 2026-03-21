export interface Exercise {
  type: string;
  description: string;
  targetWpm?: number;
}

export interface ComprehensionQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  level: string;
}

export interface TrainingSession {
  id: string;
  userId: string;
  sessionType: 'diagnostic' | 'training' | 'reading';
  bottleneckTargeted?: string;
  exercises: Exercise[];
  startedAt?: string;
  completedAt?: string;
}
