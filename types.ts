
export type Language = 'en' | 'cs' | 'de' | 'sk' | 'fr' | 'es' | 'it' | 'pl' | 'nl' | 'pt' | 'sv' | 'hu' | 'da' | 'fi' | 'no' | 'ro' | 'tr' | 'el' | 'ja' | 'zh';

export interface DailyActivity {
  id: string;
  date: string;
  sleepHours: number;
  restingHeartRate: number;
  maxHeartRate: number;
  avgExerciseHeartRate: number;
  activeCalories: number;
  exerciseMinutes: number;
  standHours: number;
  steps: number;
  workoutType: string;
  mood: 'Skvělý' | 'Dobrý' | 'Průměrný' | 'Unavený';
  weight?: number;
}

export interface Account {
  id: string;
  name: string;
  email: string;
  password?: string;
  birthDate: string; // ISO format YYYY-MM-DD
  baseWeight: number;
  createdAt: string;
  language: Language;
}

export interface AIInsight {
  title: string;
  content: string;
  type: 'success' | 'warning' | 'info';
}

export interface WeeklyGoals {
  moveKcal: number;
  exerciseMin: number;
  standHours: number;
  reasoning: string;
}

export interface AccountData {
  activities: DailyActivity[];
  weeklyGoals: WeeklyGoals | null;
}
