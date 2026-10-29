import { Workout, ISODate, StreakInfo } from './types';
import { addDaysToISODate, diffISODays } from './dates';

/**
 * Pure calculation of streak metrics.
 * - Multiple workouts on the same day count as 1 streak day.
 * - Grace rule: If no workout today, but there was one yesterday,
 *   the streak stays alive with `atRisk: true` until midnight.
 * - If neither today nor yesterday has a workout, streak is 0.
 * - Longest streak tracks the maximum historical consecutive active days.
 */
export function calculateStreak(workouts: Workout[], today: ISODate): StreakInfo {
  if (!workouts || workouts.length === 0) {
    return {
      current: 0,
      longest: 0,
      isActiveToday: false,
      atRisk: false,
      lastWorkoutDate: null,
    };
  }

  // Set of unique workout dates (dedupes multiple workouts on the same day)
  const uniqueDates = new Set<ISODate>();
  for (const w of workouts) {
    uniqueDates.add(w.date);
  }

  const sortedDates = Array.from(uniqueDates).sort();
  const lastWorkoutDate = sortedDates.length > 0 ? sortedDates[sortedDates.length - 1] : null;

  const isActiveToday = uniqueDates.has(today);
  const yesterday = addDaysToISODate(today, -1);
  const isActiveYesterday = uniqueDates.has(yesterday);

  let current = 0;
  let atRisk = false;

  // Determine anchor for current streak calculation
  if (isActiveToday) {
    current = 1;
    let cursor = yesterday;
    while (uniqueDates.has(cursor)) {
      current++;
      cursor = addDaysToISODate(cursor, -1);
    }
  } else if (isActiveYesterday) {
    // Grace period: streak is alive through yesterday, but at risk of resetting at midnight
    atRisk = true;
    current = 1;
    let cursor = addDaysToISODate(yesterday, -1);
    while (uniqueDates.has(cursor)) {
      current++;
      cursor = addDaysToISODate(cursor, -1);
    }
  } else {
    current = 0;
    atRisk = false;
  }

  // Calculate historical longest streak
  let longest = 0;
  if (sortedDates.length > 0) {
    let currentRun = 1;
    longest = 1;

    for (let i = 1; i < sortedDates.length; i++) {
      const prev = sortedDates[i - 1];
      const curr = sortedDates[i];
      const diff = diffISODays(curr, prev);

      if (diff === 1) {
        currentRun++;
        if (currentRun > longest) {
          longest = currentRun;
        }
      } else if (diff > 1) {
        currentRun = 1;
      }
      // If diff === 0, it wouldn't happen because uniqueDates was used, but safety check.
    }
  }

  // Ensure longest is at least current
  if (current > longest) {
    longest = current;
  }

  return {
    current,
    longest,
    isActiveToday,
    atRisk,
    lastWorkoutDate,
  };
}
