import { WorkoutType, Settings, HHmm } from './types';

export type LucideIconKey =
  | 'Footprints'
  | 'Activity'
  | 'Bike'
  | 'PersonStanding'
  | 'Dumbbell'
  | 'Zap'
  | 'Waves'
  | 'Trophy'
  | 'MoreHorizontal'
  | 'Flame';

export interface WorkoutMeta {
  type: WorkoutType;
  label: string;
  iconKey: LucideIconKey;
  description: string;
}

export const WORKOUT_TYPES: Record<WorkoutType, WorkoutMeta> = {
  run: {
    type: 'run',
    label: 'Run',
    iconKey: 'Activity',
    description: 'Running session',
  },
  walk: {
    type: 'walk',
    label: 'Walk',
    iconKey: 'Footprints',
    description: 'Walking session',
  },
  cycle: {
    type: 'cycle',
    label: 'Cycle',
    iconKey: 'Bike',
    description: 'Cycling session',
  },
  swim: {
    type: 'swim',
    label: 'Swim',
    iconKey: 'Waves',
    description: 'Swimming session',
  },
  strength: {
    type: 'strength',
    label: 'Strength',
    iconKey: 'Dumbbell',
    description: 'Strength training',
  },
  bodyweight: {
    type: 'bodyweight',
    label: 'Bodyweight',
    iconKey: 'PersonStanding',
    description: 'Calisthenics & core',
  },
  yoga: {
    type: 'yoga',
    label: 'Yoga',
    iconKey: 'PersonStanding',
    description: 'Yoga and mobility',
  },
  hiit: {
    type: 'hiit',
    label: 'HIIT',
    iconKey: 'Zap',
    description: 'Interval training',
  },
  sports: {
    type: 'sports',
    label: 'Sports',
    iconKey: 'Trophy',
    description: 'Sports session',
  },
  other: {
    type: 'other',
    label: 'Other',
    iconKey: 'MoreHorizontal',
    description: 'General activity',
  },
};

export const QUICK_DURATIONS = [15, 30, 45, 60] as const;

export const DEFAULT_SETTINGS: Settings = {
  theme: 'system',
  weeklyGoal: 3,
  displayName: 'Athlete',
  reducedMotion: 'system',
  priorStats: {
    totalWorkouts: 0,
    totalMinutes: 0,
    longestStreak: 0,
  },
};

export const STREAK_MILESTONES = [3, 7, 14, 30, 50, 100] as const;

export const HEAT_THRESHOLDS = {
  LIGHT: 30, // 1 to 29 min
  MEDIUM: 60, // 30 to 59 min
} as const;

export const MAX_DURATION_MIN = 600;

export const PRIOR_STATS_LIMITS = {
  maxWorkouts: 100_000,
  maxMinutes: 6_000_000, // ~11.4 years of continuous workouts
  maxStreak: 36_500, // ~100 years
} as const;

export const EARLY_BIRD_START: HHmm = '04:00';
export const EARLY_BIRD_END: HHmm = '07:00';

export const CENTURY_TARGET = 100;
export const IRON_WILL_DAYS = 14;

export function getNextMilestone(current: number): number {
  for (const m of STREAK_MILESTONES) {
    if (m > current) return m;
  }
  return current + 10;
}
