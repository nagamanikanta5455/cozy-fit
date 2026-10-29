import { Workout, ISODate, WeekSummary, BadgeTier, DayActivity } from './types';
import { getWeekStart, getWeekEnd, addDaysToISODate } from './dates';

/**
 * Returns the badge tier earned from a number of workout sessions in a single week.
 * Exactly 2 => 2x, 3 => 3x ... up to 7 => 7x.
 * Fewer than 2 => null.
 */
export function getWeekBadge(workoutCount: number): BadgeTier | null {
  if (workoutCount < 2) return null;
  const clamped = Math.min(workoutCount, 7);
  return clamped as BadgeTier;
}

/**
 * Group workouts by their Monday week key.
 */
export function groupWorkoutsByWeek(workouts: Workout[]): Map<ISODate, Workout[]> {
  const map = new Map<ISODate, Workout[]>();
  for (const w of workouts) {
    const weekKey = getWeekStart(w.date);
    const existing = map.get(weekKey);
    if (existing) {
      existing.push(w);
    } else {
      map.set(weekKey, [w]);
    }
  }
  return map;
}

/**
 * Build a WeekSummary for a specific Monday week key.
 */
export function buildWeekSummary(
  weekKey: ISODate,
  weekWorkouts: Workout[] = [],
  today: ISODate,
  weeklyGoal: number = 3
): WeekSummary {
  const weekStart = weekKey;
  const weekEnd = getWeekEnd(weekKey);
  const workoutCount = weekWorkouts.length;
  const totalMinutes = weekWorkouts.reduce((sum, w) => sum + w.durationMin, 0);

  const activeDaysSet = new Set<ISODate>();
  for (const w of weekWorkouts) {
    activeDaysSet.add(w.date);
  }
  const activeDays = Array.from(activeDaysSet).sort();

  const currentWeekStart = getWeekStart(today);
  const isCurrentWeek = weekKey === currentWeekStart;
  const badge = getWeekBadge(workoutCount);
  const goalMet = workoutCount >= weeklyGoal;

  return {
    weekKey,
    weekStart,
    weekEnd,
    workoutCount,
    totalMinutes,
    activeDays,
    badge,
    isCurrentWeek,
    goalMet,
  };
}

/**
 * Build list of past weeks that earned a badge, sorted descending (newest first).
 * The current week is excluded from the shelf (it is shown live on the week tracker).
 */
export function getBadgeHistory(
  workouts: Workout[],
  today: ISODate,
  weeklyGoal: number = 3
): WeekSummary[] {
  const map = groupWorkoutsByWeek(workouts);
  const currentWeekKey = getWeekStart(today);
  const history: WeekSummary[] = [];

  for (const [weekKey, weekWorkouts] of map.entries()) {
    // Only include past weeks
    if (weekKey < currentWeekKey) {
      const summary = buildWeekSummary(weekKey, weekWorkouts, today, weeklyGoal);
      if (summary.badge !== null) {
        history.push(summary);
      }
    }
  }

  // Sort newest week first
  history.sort((a, b) => b.weekKey.localeCompare(a.weekKey));
  return history;
}

/**
 * Computes activity for the last 7 calendar days ending on today (e.g. today-6 to today).
 */
export function getLast7DaysActivity(workouts: Workout[], today: ISODate): DayActivity[] {
  const result: DayActivity[] = [];

  // Group workouts in the last 7 days by date
  const dateMap = new Map<ISODate, { minutes: number; count: number }>();
  for (const w of workouts) {
    const existing = dateMap.get(w.date) || { minutes: 0, count: 0 };
    existing.minutes += w.durationMin;
    existing.count += 1;
    dateMap.set(w.date, existing);
  }

  for (let i = 6; i >= 0; i--) {
    const date = addDaysToISODate(today, -i);
    const data = dateMap.get(date) || { minutes: 0, count: 0 };
    result.push({
      date,
      minutes: data.minutes,
      count: data.count,
    });
  }

  return result;
}

/**
 * Friendly badge titles and descriptions.
 */
export const BADGE_TIER_DETAILS: Record<BadgeTier, { name: string; color: string; desc: string }> = {
  2: {
    name: 'Gentle Duo',
    color: '#9BB59A', // sage
    desc: '2 peaceful movement sessions',
  },
  3: {
    name: 'Cozy Trio',
    color: '#D9774F', // terracotta
    desc: '3 steady sessions in the bag',
  },
  4: {
    name: 'Four-Fold Flow',
    color: '#F2B84B', // honey
    desc: '4 wonderful times on the move',
  },
  5: {
    name: 'High Five',
    color: '#6B7AA1', // dusk
    desc: '5 energizing rituals completed',
  },
  6: {
    name: 'Steadfast Six',
    color: '#7A5C4D', // mocha
    desc: '6 days of dedicated care',
  },
  7: {
    name: 'Crown of the Week',
    color: '#E2845E', // warm terracotta
    desc: 'Every single day moved with joy',
  },
};
