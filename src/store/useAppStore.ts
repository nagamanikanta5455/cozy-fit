import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Workout, Settings, PersistedState, AchievementId, ISODate } from '../domain/types';
import {
  CURRENT_SCHEMA_VERSION,
  DEFAULT_PERSISTED_STATE,
  validateOrRecoverPersistedState,
  PersistedStateSchema,
} from './schema';

export interface CelebrationItem {
  id: string;
  title: string;
  subtitle: string;
  type: 'streak' | 'badge';
  tier?: string | number;
}

export interface ImportResult {
  success: boolean;
  error?: string;
  count?: number;
  addedCount?: number;
  updatedCount?: number;
  unmodifiedCount?: number;
  mode?: 'merge' | 'replace';
}

export interface AppState extends PersistedState {
  // Ephemeral (non-persisted) state
  lastDeletedWorkout: Workout | null;
  activeCelebration: CelebrationItem | null;
  quotaWarning: boolean;

  // Actions
  addWorkout: (data: Omit<Workout, 'id' | 'createdAt' | 'updatedAt'>) => string;
  updateWorkout: (id: string, updates: Partial<Omit<Workout, 'id' | 'createdAt'>>) => void;
  deleteWorkout: (id: string) => Workout | null;
  restoreWorkout: (workout: Workout) => void;
  clearLastDeleted: () => void;
  
  markCelebrationSeen: (celebrationId: string) => void;
  queueCelebration: (item: CelebrationItem) => void;
  dismissCelebration: () => void;

  unlockAchievement: (id: AchievementId, unlockedAt: ISODate) => void;

  updateSettings: (updates: Partial<Settings>) => void;
  importData: (jsonStr: string, mode?: 'merge' | 'replace') => ImportResult;
  resetAll: () => void;
  setQuotaWarning: (warning: boolean) => void;
  syncFromStorage: () => void;
}

const STORAGE_KEY = 'cozyfit:v1';

// Custom storage wrapper with corruption recovery and QuotaExceededError catch
const safeStorage = {
  getItem: (name: string): string | null => {
    try {
      if (typeof localStorage === 'undefined') {
        return JSON.stringify(DEFAULT_PERSISTED_STATE);
      }
      const raw = localStorage.getItem(name);
      const validated = validateOrRecoverPersistedState(raw);
      return JSON.stringify(validated);
    } catch (e) {
      console.error('Storage getItem failed:', e);
      return JSON.stringify(DEFAULT_PERSISTED_STATE);
    }
  },
  setItem: (name: string, value: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(name, value);
      }
    } catch (err: unknown) {
      console.warn('Storage setItem failed (possible quota exceeded):', err);
      if (err instanceof DOMException && (err.name === 'QuotaExceededError' || err.code === 22)) {
        useAppStore.getState().setQuotaWarning(true);
      }
    }
  },
  removeItem: (name: string): void => {
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.removeItem(name);
      }
    } catch (e) {
      console.error('Storage removeItem failed:', e);
    }
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      ...DEFAULT_PERSISTED_STATE,
      lastDeletedWorkout: null,
      activeCelebration: null,
      quotaWarning: false,

      addWorkout: (data) => {
        const id = typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `w-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
        
        const now = Date.now();
        const newWorkout: Workout = {
          ...data,
          id,
          createdAt: now,
          updatedAt: now,
        };

        set((state) => ({
          workouts: [newWorkout, ...state.workouts],
        }));

        return id;
      },

      updateWorkout: (id, updates) => {
        set((state) => ({
          workouts: state.workouts.map((w) =>
            w.id === id ? { ...w, ...updates, updatedAt: Date.now() } : w
          ),
        }));
      },

      deleteWorkout: (id) => {
        const target = get().workouts.find((w) => w.id === id) || null;
        if (!target) return null;

        set((state) => ({
          workouts: state.workouts.filter((w) => w.id !== id),
          lastDeletedWorkout: target,
        }));

        return target;
      },

      restoreWorkout: (workout) => {
        set((state) => {
          // Avoid duplicate insertion
          if (state.workouts.some((w) => w.id === workout.id)) {
            return { lastDeletedWorkout: null };
          }
          return {
            workouts: [workout, ...state.workouts],
            lastDeletedWorkout: null,
          };
        });
      },

      clearLastDeleted: () => {
        set({ lastDeletedWorkout: null });
      },

      markCelebrationSeen: (celebrationId) => {
        set((state) => {
          if (state.seenCelebrations.includes(celebrationId)) return state;
          return {
            seenCelebrations: [...state.seenCelebrations, celebrationId],
          };
        });
      },

      queueCelebration: (item) => {
        const seen = get().seenCelebrations;
        if (seen.includes(item.id)) return;

        set({
          activeCelebration: item,
          seenCelebrations: [...seen, item.id],
        });
      },

      dismissCelebration: () => {
        set({ activeCelebration: null });
      },

      unlockAchievement: (id, unlockedAt) => {
        const current = get().unlockedAchievements || [];
        if (!current.includes(id)) {
          set({
            unlockedAchievements: [...current, id],
            achievementUnlockedDates: {
              ...(get().achievementUnlockedDates || {}),
              [id]: unlockedAt,
            },
          });
        }
      },

      updateSettings: (updates) => {
        set((state) => ({
          settings: { ...state.settings, ...updates },
        }));
      },

      importData: (jsonStr, mode = 'merge') => {
        try {
          const parsed = JSON.parse(jsonStr);
          const result = PersistedStateSchema.safeParse(parsed);
          if (!result.success) {
            const firstError = result.error.issues[0]?.message || 'Invalid CozyFit backup file';
            return { success: false, error: firstError };
          }

          const imported = result.data;

          if (mode === 'replace') {
            set({
              schemaVersion: 2,
              workouts: imported.workouts,
              settings: { ...get().settings, ...imported.settings },
              seenCelebrations: imported.seenCelebrations,
              unlockedAchievements: imported.unlockedAchievements || [],
              achievementUnlockedDates: imported.achievementUnlockedDates || {},
              lastExportAt: Date.now(),
            });
            return {
              success: true,
              count: imported.workouts.length,
              addedCount: imported.workouts.length,
              updatedCount: 0,
              unmodifiedCount: 0,
              mode: 'replace',
            };
          }

          // MERGE by workout id: keep the newer updatedAt on conflicts
          const currentWorkouts = get().workouts;
          const workoutMap = new Map<string, Workout>(
            currentWorkouts.map((w) => [w.id, w])
          );

          let addedCount = 0;
          let updatedCount = 0;
          let unmodifiedCount = 0;

          for (const inc of imported.workouts) {
            const existing = workoutMap.get(inc.id);
            if (!existing) {
              workoutMap.set(inc.id, inc);
              addedCount++;
            } else if (inc.updatedAt > existing.updatedAt) {
              workoutMap.set(inc.id, inc);
              updatedCount++;
            } else {
              unmodifiedCount++;
            }
          }

          const mergedWorkouts = Array.from(workoutMap.values()).sort((a, b) => {
            if (b.date !== a.date) return b.date > a.date ? 1 : -1;
            return b.createdAt - a.createdAt;
          });

          const mergedCelebrations = Array.from(
            new Set([...get().seenCelebrations, ...imported.seenCelebrations])
          );

          set({
            schemaVersion: 2,
            workouts: mergedWorkouts,
            settings: { ...get().settings, ...imported.settings },
            seenCelebrations: mergedCelebrations,
            unlockedAchievements: Array.from(
              new Set([...(get().unlockedAchievements || []), ...(imported.unlockedAchievements || [])])
            ),
            achievementUnlockedDates: {
              ...(get().achievementUnlockedDates || {}),
              ...(imported.achievementUnlockedDates || {}),
            },
            lastExportAt: Date.now(),
          });

          return {
            success: true,
            count: imported.workouts.length,
            addedCount,
            updatedCount,
            unmodifiedCount,
            mode: 'merge',
          };
        } catch (e: unknown) {
          return {
            success: false,
            error: 'Could not parse JSON file. Please ensure it is a valid CozyFit backup.',
          };
        }
      },

      resetAll: () => {
        set({
          ...DEFAULT_PERSISTED_STATE,
          lastDeletedWorkout: null,
          activeCelebration: null,
          quotaWarning: false,
        });
      },

      setQuotaWarning: (warning) => {
        set({ quotaWarning: warning });
      },

      syncFromStorage: () => {
        try {
          const raw = localStorage.getItem(STORAGE_KEY);
          if (raw) {
            const state = validateOrRecoverPersistedState(raw);
            set({
              schemaVersion: 2,
              workouts: state.workouts,
              settings: state.settings,
              seenCelebrations: state.seenCelebrations,
              lastExportAt: state.lastExportAt,
              unlockedAchievements: state.unlockedAchievements,
              achievementUnlockedDates: state.achievementUnlockedDates,
            });
          }
        } catch (err) {
          console.warn('Sync from storage error:', err);
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => safeStorage),
      version: CURRENT_SCHEMA_VERSION,
      partialize: (state) => ({
        schemaVersion: state.schemaVersion,
        workouts: state.workouts,
        settings: state.settings,
        seenCelebrations: state.seenCelebrations,
        lastExportAt: state.lastExportAt,
        unlockedAchievements: state.unlockedAchievements,
        achievementUnlockedDates: state.achievementUnlockedDates,
      }),
      migrate: (persistedState: unknown, version: number) => {
        if (version < 1) {
          return DEFAULT_PERSISTED_STATE;
        }
        const rawState = (persistedState && typeof persistedState === 'object'
          ? (persistedState as Record<string, any>)
          : {}) as Record<string, any>;

        if (version === 1 || rawState.schemaVersion === 1) {
          return {
            ...rawState,
            schemaVersion: 2,
            settings: {
              ...DEFAULT_PERSISTED_STATE.settings,
              ...(rawState.settings || {}),
              priorStats: rawState.settings?.priorStats || {
                totalWorkouts: 0,
                totalMinutes: 0,
                longestStreak: 0,
              },
            },
            unlockedAchievements: rawState.unlockedAchievements || [],
            achievementUnlockedDates: rawState.achievementUnlockedDates || {},
          } as PersistedState;
        }
        return rawState as unknown as PersistedState;
      },
    }
  )
);

// Listen to storage events for multi-tab synchronization
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key === STORAGE_KEY) {
      useAppStore.getState().syncFromStorage();
    }
  });
}
