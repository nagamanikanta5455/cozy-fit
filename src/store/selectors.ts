import { useMemo } from 'react';
import { useAppStore } from './useAppStore';
import { ISODate, WeekSummary, Workout } from '../domain/types';
import { buildWeekSummary, groupWorkoutsByWeek } from '../domain/badges';
import { getWeekStart } from '../domain/dates';
import { useStats, useStreak } from './statsSelectors';

export { useStats, useStreak };

/**
 * Computes the current week summary.
 */
export function useCurrentWeek(today: ISODate): WeekSummary {
  const workouts = useAppStore((state) => state.workouts);
  const weeklyGoal = useAppStore((state) => state.settings.weeklyGoal);

  return useMemo(() => {
    const currentWeekKey = getWeekStart(today);
    const weekGroups = groupWorkoutsByWeek(workouts);
    const thisWeekWorkouts = weekGroups.get(currentWeekKey) || [];
    return buildWeekSummary(currentWeekKey, thisWeekWorkouts, today, weeklyGoal);
  }, [workouts, today, weeklyGoal]);
}

/**
 * Returns recent workouts sorted by date (descending), then createdAt (descending).
 */
export function useRecentWorkouts(limit: number = 10): Workout[] {
  const workouts = useAppStore((state) => state.workouts);

  return useMemo(() => {
    return [...workouts]
      .sort((a, b) => {
        if (a.date !== b.date) {
          return b.date.localeCompare(a.date);
        }
        return b.createdAt - a.createdAt;
      })
      .slice(0, limit);
  }, [workouts, limit]);
}

/**
 * Settings selector
 */
export function useSettings() {
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  return { settings, updateSettings };
}
