import { format } from 'date-fns';
import { Workout, ISODate } from './types';
import { HEAT_THRESHOLDS } from './constants';
import {
  parseISODate,
  getWeekStart,
  getWeekEnd,
  addDaysToISODate,
} from './dates';

export type HeatIntensity = 0 | 1 | 2 | 3;

export interface HeatmapDay {
  date: ISODate;
  count: number;
  minutes: number;
  intensity: HeatIntensity;
  isToday: boolean;
  isFuture: boolean;
  dayOfWeek: number; // 0 = Mon, 6 = Sun
}

export interface HeatmapWeek {
  weekStart: ISODate;
  days: HeatmapDay[];
}

export interface MonthLabel {
  weekIndex: number;
  label: string;
}

/**
 * Group workouts by local ISODate string in a single O(n) pass.
 */
export function buildDayMap(
  workouts: Workout[]
): Map<ISODate, { count: number; minutes: number }> {
  const map = new Map<ISODate, { count: number; minutes: number }>();
  for (let i = 0; i < workouts.length; i++) {
    const w = workouts[i];
    const existing = map.get(w.date);
    if (existing) {
      existing.count += 1;
      existing.minutes += w.durationMin;
    } else {
      map.set(w.date, { count: 1, minutes: w.durationMin });
    }
  }
  return map;
}

/**
 * Determine heat intensity based on total active minutes.
 * 0 = no activity
 * 1 = under 30 min (1-29)
 * 2 = 30 to 59 min
 * 3 = 60+ min
 */
export function getIntensity(minutes: number): HeatIntensity {
  if (minutes <= 0) return 0;
  if (minutes < HEAT_THRESHOLDS.LIGHT) return 1;
  if (minutes < HEAT_THRESHOLDS.MEDIUM) return 2;
  return 3;
}

/**
 * Builds the full grid of weeks from the Monday of the first workout week
 * (or 26 weeks ago if empty) to Sunday of the current week.
 * Preserves leap years and month boundaries via calendar date utilities.
 */
export function buildHeatmapWeeks(
  workouts: Workout[],
  today: ISODate
): HeatmapWeek[] {
  const dayMap = buildDayMap(workouts);

  // Determine starting Monday
  let startWeekMonday: ISODate;
  if (workouts.length === 0) {
    // Last 26 weeks ending on current week
    startWeekMonday = addDaysToISODate(getWeekStart(today), -25 * 7);
  } else {
    let earliest = workouts[0].date;
    for (let i = 1; i < workouts.length; i++) {
      if (workouts[i].date < earliest) {
        earliest = workouts[i].date;
      }
    }
    startWeekMonday = getWeekStart(earliest);
  }

  const endWeekSunday = getWeekEnd(today);
  const weeks: HeatmapWeek[] = [];

  let currentMonday = startWeekMonday;
  while (currentMonday <= endWeekSunday) {
    const days: HeatmapDay[] = [];
    for (let dayIndex = 0; dayIndex < 7; dayIndex++) {
      const dayDate = addDaysToISODate(currentMonday, dayIndex);
      const isToday = dayDate === today;
      const isFuture = dayDate > today;
      const stats = dayMap.get(dayDate) || { count: 0, minutes: 0 };
      const intensity = isFuture ? 0 : getIntensity(stats.minutes);

      days.push({
        date: dayDate,
        count: isFuture ? 0 : stats.count,
        minutes: isFuture ? 0 : stats.minutes,
        intensity,
        isToday,
        isFuture,
        dayOfWeek: dayIndex,
      });
    }

    weeks.push({
      weekStart: currentMonday,
      days,
    });

    currentMonday = addDaysToISODate(currentMonday, 7);
  }

  return weeks;
}

/**
 * Extracts month column header labels.
 * Only labels a column when the month changes so labels never overlap.
 * January includes the full 4-digit year.
 */
export function getMonthLabels(weeks: HeatmapWeek[]): MonthLabel[] {
  const labels: MonthLabel[] = [];
  let prevMonth = -1;

  for (let i = 0; i < weeks.length; i++) {
    const d = parseISODate(weeks[i].weekStart);
    const m = d.getMonth();

    if (m !== prevMonth) {
      const label = m === 0 ? format(d, 'MMM yyyy') : format(d, 'MMM');
      labels.push({ weekIndex: i, label });
      prevMonth = m;
    }
  }

  return labels;
}
