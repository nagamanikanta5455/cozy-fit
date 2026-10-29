import { useMemo } from 'react';
import { useAppStore } from './useAppStore';
import {
  ISODate,
  DashboardStats,
  StreakInfo,
  Workout,
  PriorStats,
  StatTotals,
} from '../domain/types';
import { PRIOR_STATS_LIMITS } from '../domain/constants';
import { calculateStreak } from '../domain/streak';
import {
  buildWeekSummary,
  getBadgeHistory,
  getLast7DaysActivity,
  groupWorkoutsByWeek,
} from '../domain/badges';
import { getWeekStart } from '../domain/dates';

export const EMPTY_PRIOR_STATS: PriorStats = {
  totalWorkouts: 0,
  totalMinutes: 0,
  longestStreak: 0,
};

/**
 * Coerces unknown inputs to valid integer PriorStats within allowed limits.
 * Gracefully defaults missing, NaN, negative, or infinite values to 0.
 */
export function sanitizePriorStats(raw: unknown): PriorStats {
  if (!raw || typeof raw !== 'object') {
    return { ...EMPTY_PRIOR_STATS };
  }

  const obj = raw as Partial<Record<keyof PriorStats, unknown>>;

  const sanitizeNumber = (val: unknown, max: number): number => {
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      return 0;
    }
    const truncated = Math.floor(val);
    if (truncated < 0) return 0;
    if (truncated > max) return max;
    return truncated;
  };

  return {
    totalWorkouts: sanitizeNumber(obj.totalWorkouts, PRIOR_STATS_LIMITS.maxWorkouts),
    totalMinutes: sanitizeNumber(obj.totalMinutes, PRIOR_STATS_LIMITS.maxMinutes),
    longestStreak: sanitizeNumber(obj.longestStreak, PRIOR_STATS_LIMITS.maxStreak),
  };
}

/**
 * Strictly validates candidate input and returns detailed validation errors if bounds or types fail.
 */
export function validatePriorStats(
  candidate: unknown
): { ok: true; value: PriorStats } | { ok: false; errors: string[] } {
  if (!candidate || typeof candidate !== 'object') {
    return { ok: false, errors: ['Prior stats must be an object'] };
  }

  const errors: string[] = [];
  const obj = candidate as Record<string, unknown>;

  const checkField = (field: keyof PriorStats, max: number, label: string) => {
    const val = obj[field];
    if (typeof val !== 'number' || !Number.isFinite(val)) {
      errors.push(`${label} must be a valid number`);
    } else if (!Number.isInteger(val)) {
      errors.push(`${label} must be an integer`);
    } else if (val < 0) {
      errors.push(`${label} cannot be negative`);
    } else if (val > max) {
      errors.push(`${label} cannot exceed ${max.toLocaleString()}`);
    }
  };

  checkField('totalWorkouts', PRIOR_STATS_LIMITS.maxWorkouts, 'Total workouts');
  checkField('totalMinutes', PRIOR_STATS_LIMITS.maxMinutes, 'Total minutes');
  checkField('longestStreak', PRIOR_STATS_LIMITS.maxStreak, 'Longest streak');

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: {
      totalWorkouts: obj.totalWorkouts as number,
      totalMinutes: obj.totalMinutes as number,
      longestStreak: obj.longestStreak as number,
    },
  };
}

/**
 * Calculates raw totals purely from logged in-app workouts.
 */
export function sumLoggedTotals(workouts: Workout[]): StatTotals {
  let totalMinutes = 0;
  for (const w of workouts) {
    totalMinutes += w.durationMin;
  }
  return {
    totalWorkouts: workouts.length,
    totalMinutes,
    longestStreak: 0, // Longest streak calculation is handled via calculateStreak
  };
}

/**
 * Combines logged totals with manual prior offsets.
 */
export function combineTotals(logged: StatTotals, prior: PriorStats): StatTotals {
  return {
    totalWorkouts: logged.totalWorkouts + prior.totalWorkouts,
    totalMinutes: logged.totalMinutes + prior.totalMinutes,
    longestStreak: Math.max(logged.longestStreak, prior.longestStreak),
  };
}

/**
 * Computes an effective StreakInfo object where longest is the maximum between
 * the logged in-app longest streak and the manual prior longest streak.
 */
export function withEffectiveLongest(streak: StreakInfo, prior: PriorStats): StreakInfo {
  return {
    ...streak,
    longest: Math.max(streak.longest, prior.longestStreak),
  };
}

/**
 * Pure function to compute all DashboardStats given workouts, priorStats, today, and weeklyGoal.
 */
export function computeDashboardStats(
  workouts: Workout[],
  priorStatsInput: PriorStats | undefined,
  today: ISODate,
  weeklyGoal: number
): DashboardStats {
  const prior = sanitizePriorStats(priorStatsInput);
  const loggedTotals = sumLoggedTotals(workouts);
  const rawStreak = calculateStreak(workouts, today);
  const effectiveStreak = withEffectiveLongest(rawStreak, prior);

  const combined = combineTotals(
    {
      totalWorkouts: loggedTotals.totalWorkouts,
      totalMinutes: loggedTotals.totalMinutes,
      longestStreak: rawStreak.longest,
    },
    prior
  );

  const currentWeekKey = getWeekStart(today);
  const weekGroups = groupWorkoutsByWeek(workouts);
  const thisWeekWorkouts = weekGroups.get(currentWeekKey) || [];
  const currentWeek = buildWeekSummary(currentWeekKey, thisWeekWorkouts, today, weeklyGoal);

  const badgeHistory = getBadgeHistory(workouts, today, weeklyGoal);
  const last7Days = getLast7DaysActivity(workouts, today);

  return {
    totalWorkouts: combined.totalWorkouts,
    totalMinutes: combined.totalMinutes,
    streak: effectiveStreak,
    currentWeek,
    badgeHistory,
    last7Days,
    breakdown: {
      logged: {
        totalWorkouts: loggedTotals.totalWorkouts,
        totalMinutes: loggedTotals.totalMinutes,
        longestStreak: rawStreak.longest,
      },
      prior,
    },
  };
}

/**
 * Hook to retrieve full dashboard statistics with prior offset integration.
 */
export function useStats(today: ISODate): DashboardStats {
  const workouts = useAppStore((state) => state.workouts);
  const settings = useAppStore((state) => state.settings);
  const weeklyGoal = settings.weeklyGoal;
  const priorStats = settings.priorStats;

  return useMemo(() => {
    return computeDashboardStats(workouts, priorStats, today, weeklyGoal);
  }, [workouts, priorStats, today, weeklyGoal]);
}

/**
 * Hook to retrieve effective streak info for today with prior streak consideration.
 */
export function useStreak(today: ISODate): StreakInfo {
  const workouts = useAppStore((state) => state.workouts);
  const priorStats = useAppStore((state) => state.settings.priorStats);

  return useMemo(() => {
    const rawStreak = calculateStreak(workouts, today);
    return withEffectiveLongest(rawStreak, sanitizePriorStats(priorStats));
  }, [workouts, priorStats, today]);
}
