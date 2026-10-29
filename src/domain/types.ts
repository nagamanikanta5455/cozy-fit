export type ISODate = string; // local "YYYY-MM-DD"
export type HHmm = string; // local 24h "HH:mm", e.g. "05:30"

export type WorkoutType =
  | 'run'
  | 'walk'
  | 'cycle'
  | 'swim'
  | 'strength'
  | 'bodyweight'
  | 'yoga'
  | 'hiit'
  | 'sports'
  | 'other';

export interface Workout {
  id: string; // crypto.randomUUID()
  date: ISODate; // when workout occurred
  type: WorkoutType;
  durationMin: number; // integer 1-600
  startTime?: HHmm; // optional local 24h "HH:mm", drives "Early Bird"
  sets?: number; // optional integer 1-99
  reps?: number; // optional integer 1-999, reps PER SET
  note?: string; // max 140 chars
  createdAt: number; // epoch ms
  updatedAt: number; // epoch ms
}

/** Totals shared by "calculated from workouts" and "manual prior offsets". */
export interface StatTotals {
  totalWorkouts: number; // integer >= 0
  totalMinutes: number; // integer >= 0
  longestStreak: number; // integer >= 0
}

/** Manually entered history from BEFORE the user started logging in the app. */
export type PriorStats = StatTotals;

export interface Settings {
  theme: 'light' | 'evening' | 'system';
  weeklyGoal: number; // 1-7, default 3
  displayName?: string;
  reducedMotion: 'system' | 'on' | 'off';
  priorStats: PriorStats; // default: all zeros
}

// ---------- Achievements (task badges) ----------
export type AchievementId = string;

export interface AchievementBadge {
  id: AchievementId;
  title: string;
  subtitle: string;
  description: string;
  icon: string; // lucide icon name or emoji
  unlockedAt?: ISODate; // undefined = locked
  progress?: { current: number; target: number };
  isHidden?: boolean; // true for mystery badges
}

export interface PersistedState {
  schemaVersion: 2;
  workouts: Workout[];
  settings: Settings;
  seenCelebrations: string[];
  lastExportAt?: number;
  unlockedAchievements: AchievementId[];
  achievementUnlockedDates?: Partial<Record<AchievementId, ISODate>>;
}

export interface StreakInfo {
  current: number;
  longest: number;
  isActiveToday: boolean;
  atRisk: boolean;
  lastWorkoutDate: ISODate | null;
}

export type BadgeTier = 2 | 3 | 4 | 5 | 6 | 7;

export interface WeekSummary {
  weekKey: ISODate; // Monday of that week
  weekStart: ISODate;
  weekEnd: ISODate; // Sunday
  workoutCount: number;
  totalMinutes: number;
  activeDays: ISODate[];
  badge: BadgeTier | null;
  isCurrentWeek: boolean;
  goalMet: boolean;
}

export interface DayActivity {
  date: ISODate;
  minutes: number;
  count: number;
}

export interface DashboardStats {
  totalWorkouts: number;
  totalMinutes: number;
  streak: StreakInfo;
  currentWeek: WeekSummary;
  badgeHistory: WeekSummary[];
  last7Days: DayActivity[];
  breakdown: {
    logged: StatTotals;
    prior: PriorStats;
  };
}
