import { z } from 'zod';
import { PersistedState } from '../domain/types';
import { DEFAULT_SETTINGS, PRIOR_STATS_LIMITS } from '../domain/constants';

export const WorkoutTypeSchema = z.enum([
  'run',
  'walk',
  'cycle',
  'swim',
  'strength',
  'bodyweight',
  'yoga',
  'hiit',
  'sports',
  'other',
]);

// Validates ISO date "YYYY-MM-DD"
export const ISODateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, {
  message: 'Date must be formatted as YYYY-MM-DD',
});

// Validates 24h time "HH:mm"
export const HHmmSchema = z.string().regex(/^\d{2}:\d{2}$/, {
  message: 'Time must be in 24h format HH:mm',
});

export const WorkoutSchema = z.object({
  id: z.string().min(1),
  date: ISODateSchema,
  type: WorkoutTypeSchema,
  durationMin: z.number().int().min(1).max(600),
  startTime: HHmmSchema.optional(),
  sets: z.number().int().min(1).max(99).optional(),
  reps: z.number().int().min(1).max(999).optional(),
  note: z.string().max(140).optional(),
  createdAt: z.number().int(),
  updatedAt: z.number().int(),
});

export const PriorStatsSchema = z.object({
  totalWorkouts: z.number().int().min(0).max(PRIOR_STATS_LIMITS.maxWorkouts),
  totalMinutes: z.number().int().min(0).max(PRIOR_STATS_LIMITS.maxMinutes),
  longestStreak: z.number().int().min(0).max(PRIOR_STATS_LIMITS.maxStreak),
});

export const SettingsSchema = z.object({
  theme: z.enum(['light', 'evening', 'system']),
  weeklyGoal: z.number().int().min(1).max(7),
  displayName: z.string().max(40).optional(),
  reducedMotion: z.enum(['system', 'on', 'off']),
  priorStats: PriorStatsSchema.default({
    totalWorkouts: 0,
    totalMinutes: 0,
    longestStreak: 0,
  }),
  installPromptDismissed: z.boolean().optional(),
});

export const AchievementIdSchema = z.string().min(1);

export const PersistedStateSchema = z.object({
  schemaVersion: z.literal(2),
  workouts: z.array(WorkoutSchema),
  settings: SettingsSchema,
  seenCelebrations: z.array(z.string()),
  lastExportAt: z.number().int().optional(),
  unlockedAchievements: z.array(AchievementIdSchema).default([]),
  achievementUnlockedDates: z.record(AchievementIdSchema, ISODateSchema).optional(),
});

export const CURRENT_SCHEMA_VERSION = 2;

export const DEFAULT_PERSISTED_STATE: PersistedState = {
  schemaVersion: 2,
  workouts: [],
  settings: DEFAULT_SETTINGS,
  seenCelebrations: [],
  lastExportAt: undefined,
  unlockedAchievements: [],
  achievementUnlockedDates: {},
};

/**
 * Validates raw loaded state from localStorage with seamless v1 -> v2 migration.
 * If corrupted, creates a backup and falls back to safe default state.
 */
export function validateOrRecoverPersistedState(rawJson: string | null): PersistedState {
  if (!rawJson) {
    return DEFAULT_PERSISTED_STATE;
  }

  try {
    const parsed = JSON.parse(rawJson);

    // Migration: schemaVersion 1 -> 2
    if (parsed && typeof parsed === 'object') {
      if (parsed.schemaVersion === 1) {
        parsed.schemaVersion = 2;
        if (!parsed.settings?.priorStats) {
          parsed.settings = {
            ...parsed.settings,
            priorStats: { totalWorkouts: 0, totalMinutes: 0, longestStreak: 0 },
          };
        }
        if (!parsed.unlockedAchievements) {
          parsed.unlockedAchievements = [];
        }
        if (!parsed.achievementUnlockedDates) {
          parsed.achievementUnlockedDates = {};
        }
      }
    }

    const validationResult = PersistedStateSchema.safeParse(parsed);

    if (validationResult.success) {
      return validationResult.data as PersistedState;
    } else {
      console.warn('Persisted state schema validation failed:', validationResult.error);
      saveCorruptBackup(rawJson);
      return DEFAULT_PERSISTED_STATE;
    }
  } catch (err) {
    console.error('JSON parsing failed for persisted state:', err);
    saveCorruptBackup(rawJson);
    return DEFAULT_PERSISTED_STATE;
  }
}

function saveCorruptBackup(rawString: string) {
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const backupKey = `cozyfit:v1:corrupt-${Date.now()}`;
      window.localStorage.setItem(backupKey, rawString);
      console.info(`Corrupted storage safely backed up to "${backupKey}"`);
    }
  } catch {
    // ignore quota issues during backup
  }
}
