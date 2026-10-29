import { startOfWeek, addDays, format, differenceInCalendarDays } from 'date-fns';
import { ISODate } from './types';

/**
 * Format a Date object into local "YYYY-MM-DD" string.
 * Uses local getters (getFullYear, getMonth, getDate) - NEVER toISOString() to avoid UTC shift.
 */
export function toISODate(d: Date): ISODate {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Parse an ISODate string ("YYYY-MM-DD") into a local Date at local midnight (00:00:00.000).
 * NEVER uses `new Date("YYYY-MM-DD")` which standardizes to UTC midnight and shifts in west timezones.
 */
export function parseISODate(iso: ISODate): Date {
  const parts = iso.split('-');
  if (parts.length !== 3) {
    throw new Error(`Invalid ISODate format: "${iso}". Expected "YYYY-MM-DD".`);
  }
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const day = parseInt(parts[2], 10);

  if (isNaN(year) || isNaN(month) || isNaN(day)) {
    throw new Error(`Invalid numeric values in ISODate: "${iso}"`);
  }

  return new Date(year, month, day, 0, 0, 0, 0);
}

/**
 * Add (or subtract) n calendar days safely across DST boundaries.
 */
export function addDaysToISODate(iso: ISODate, days: number): ISODate {
  const d = parseISODate(iso);
  const result = addDays(d, days);
  return toISODate(result);
}

/**
 * Get the Monday start of the week containing the given date.
 * Weeks run Monday (1) to Sunday (0).
 */
export function getWeekStart(iso: ISODate): ISODate {
  const date = parseISODate(iso);
  const start = startOfWeek(date, { weekStartsOn: 1 });
  return toISODate(start);
}

/**
 * Get the Sunday end of the week containing the given date.
 */
export function getWeekEnd(iso: ISODate): ISODate {
  const start = getWeekStart(iso);
  return addDaysToISODate(start, 6);
}

/**
 * Get array of all 7 ISODates in the Monday-Sunday week.
 */
export function getWeekDays(weekStartIso: ISODate): ISODate[] {
  const days: ISODate[] = [];
  for (let i = 0; i < 7; i++) {
    days.push(addDaysToISODate(weekStartIso, i));
  }
  return days;
}

/**
 * Calculate difference in calendar days: isoA - isoB
 */
export function diffISODays(isoA: ISODate, isoB: ISODate): number {
  return differenceInCalendarDays(parseISODate(isoA), parseISODate(isoB));
}

/**
 * Human-friendly date formatting relative to today.
 */
export function formatFriendlyDate(targetIso: ISODate, todayIso: ISODate): string {
  const diff = diffISODays(todayIso, targetIso);
  if (diff === 0) return 'Today';
  if (diff === 1) return 'Yesterday';
  if (diff === -1) return 'Tomorrow';

  const date = parseISODate(targetIso);
  // Same year: e.g. "Mon, Oct 29"
  const todayDate = parseISODate(todayIso);
  if (date.getFullYear() === todayDate.getFullYear()) {
    return format(date, 'EEE, MMM d');
  }
  return format(date, 'MMM d, yyyy');
}

/**
 * Get short weekday name (e.g. "Mon", "Tue")
 */
export function getWeekdayShort(iso: ISODate): string {
  return format(parseISODate(iso), 'EEE');
}

/**
 * Get single letter weekday (e.g. "M", "T", "W")
 */
export function getWeekdayInitial(iso: ISODate): string {
  return format(parseISODate(iso), 'EEEEE');
}

/**
 * Get greeting based on current local hour: morning, afternoon, evening, night
 */
export function getTimeOfDayGreeting(hour: number = new Date().getHours()): {
  greeting: string;
  tagline: string;
} {
  if (hour >= 5 && hour < 12) {
    return {
      greeting: 'Good morning',
      tagline: 'Brew a warm cup and greet the new day gently.',
    };
  }
  if (hour >= 12 && hour < 17) {
    return {
      greeting: 'Good afternoon',
      tagline: 'Hope your day is flowing at a peaceful rhythm.',
    };
  }
  if (hour >= 17 && hour < 22) {
    return {
      greeting: 'Good evening',
      tagline: 'Lamp light is on. Rest and winding down feel earned.',
    };
  }
  return {
    greeting: 'Quiet night',
    tagline: 'The cottage is still. Rest well for tomorrow.',
  };
}
