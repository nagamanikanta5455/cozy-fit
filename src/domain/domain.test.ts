import test from 'node:test';
import assert from 'node:assert/strict';

import {
  toISODate,
  parseISODate,
  addDaysToISODate,
  getWeekStart,
  getWeekEnd,
  getWeekDays,
  diffISODays,
} from './dates';
import { calculateStreak } from './streak';
import {
  getWeekBadge,
  groupWorkoutsByWeek,
  buildWeekSummary,
  getBadgeHistory,
  getLast7DaysActivity,
} from './badges';
import { Workout } from './types';

// Helper to quickly build mock workouts
function createWorkout(date: string, durationMin = 30, type: Workout['type'] = 'walk'): Workout {
  return {
    id: `test-${Math.random().toString(36).substring(2, 9)}`,
    date,
    type,
    durationMin,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

test('Date utilities: toISODate and parseISODate work in local time without UTC offset drift', () => {
  const d = new Date(2026, 9, 29, 14, 30); // Oct 29, 2026 (month is 0-indexed)
  assert.equal(toISODate(d), '2026-10-29');

  const parsed = parseISODate('2026-10-29');
  assert.equal(parsed.getFullYear(), 2026);
  assert.equal(parsed.getMonth(), 9); // October
  assert.equal(parsed.getDate(), 29);
  assert.equal(parsed.getHours(), 0);
});

test('Date utilities: addDaysToISODate handles month and year boundary transitions', () => {
  assert.equal(addDaysToISODate('2026-12-31', 1), '2027-01-01');
  assert.equal(addDaysToISODate('2027-01-01', -1), '2026-12-31');
  assert.equal(addDaysToISODate('2026-02-28', 1), '2026-03-01');
});

test('Week calculation: week starts on Monday and ends on Sunday', () => {
  // 2026-10-26 is Monday
  // 2026-10-28 is Wednesday
  // 2026-11-01 is Sunday
  // 2026-11-02 is next Monday
  assert.equal(getWeekStart('2026-10-28'), '2026-10-26');
  assert.equal(getWeekEnd('2026-10-28'), '2026-11-01');

  // Sunday belongs to the Monday-ending week
  assert.equal(getWeekStart('2026-11-01'), '2026-10-26');

  // Next Monday begins a new week
  assert.equal(getWeekStart('2026-11-02'), '2026-11-02');

  const days = getWeekDays('2026-10-26');
  assert.equal(days.length, 7);
  assert.equal(days[0], '2026-10-26');
  assert.equal(days[6], '2026-11-01');
});

test('Streak: empty workouts array gives 0 current and 0 longest', () => {
  const result = calculateStreak([], '2026-10-29');
  assert.equal(result.current, 0);
  assert.equal(result.longest, 0);
  assert.equal(result.isActiveToday, false);
  assert.equal(result.atRisk, false);
  assert.equal(result.lastWorkoutDate, null);
});

test('Streak: active today increments streak', () => {
  const workouts = [
    createWorkout('2026-10-27'),
    createWorkout('2026-10-28'),
    createWorkout('2026-10-29'),
  ];
  const result = calculateStreak(workouts, '2026-10-29');
  assert.equal(result.current, 3);
  assert.equal(result.longest, 3);
  assert.equal(result.isActiveToday, true);
  assert.equal(result.atRisk, false);
});

test('Streak: grace rule keeps streak alive if active yesterday but not today', () => {
  const workouts = [
    createWorkout('2026-10-27'),
    createWorkout('2026-10-28'),
  ];
  const result = calculateStreak(workouts, '2026-10-29');
  assert.equal(result.current, 2);
  assert.equal(result.longest, 2);
  assert.equal(result.isActiveToday, false);
  assert.equal(result.atRisk, true);
});

test('Streak: resets to 0 if neither today nor yesterday has a workout', () => {
  const workouts = [
    createWorkout('2026-10-25'),
    createWorkout('2026-10-26'),
  ];
  const result = calculateStreak(workouts, '2026-10-29');
  assert.equal(result.current, 0);
  assert.equal(result.longest, 2); // preserves historical longest
  assert.equal(result.isActiveToday, false);
  assert.equal(result.atRisk, false);
});

test('Streak: same-day duplicates count once for streak', () => {
  const workouts = [
    createWorkout('2026-10-28', 20, 'run'),
    createWorkout('2026-10-28', 45, 'yoga'),
    createWorkout('2026-10-29', 30, 'walk'),
    createWorkout('2026-10-29', 15, 'strength'),
  ];
  const result = calculateStreak(workouts, '2026-10-29');
  assert.equal(result.current, 2); // 2 days, not 4
  assert.equal(result.longest, 2);
  assert.equal(result.isActiveToday, true);
});

test('Streak: across month and year boundary (Dec 31 -> Jan 1 -> Jan 2)', () => {
  const workouts = [
    createWorkout('2026-12-30'),
    createWorkout('2026-12-31'),
    createWorkout('2027-01-01'),
    createWorkout('2027-01-02'),
  ];
  const result = calculateStreak(workouts, '2027-01-02');
  assert.equal(result.current, 4);
  assert.equal(result.longest, 4);
});

test('Streak: backdated entries repair an old streak', () => {
  // Suppose user has Oct 26, Oct 28, Oct 29. Streak on Oct 29 is 2 (Oct 28 + 29).
  let workouts = [
    createWorkout('2026-10-26'),
    createWorkout('2026-10-28'),
    createWorkout('2026-10-29'),
  ];
  let result = calculateStreak(workouts, '2026-10-29');
  assert.equal(result.current, 2);

  // User logs a backdated workout for Oct 27
  workouts = [...workouts, createWorkout('2026-10-27')];
  result = calculateStreak(workouts, '2026-10-29');
  assert.equal(result.current, 4);
  assert.equal(result.longest, 4);
});

test('Streak: deleting a workout correctly recalculates streak', () => {
  const w1 = createWorkout('2026-10-28');
  const w2 = createWorkout('2026-10-29');
  let workouts = [w1, w2];
  assert.equal(calculateStreak(workouts, '2026-10-29').current, 2);

  // Delete today's workout
  workouts = [w1];
  const afterDelete = calculateStreak(workouts, '2026-10-29');
  assert.equal(afterDelete.current, 1);
  assert.equal(afterDelete.atRisk, true);
});

test('Weekly badge: counts sessions (same-day workouts both count towards weekly badge)', () => {
  assert.equal(getWeekBadge(0), null);
  assert.equal(getWeekBadge(1), null);
  assert.equal(getWeekBadge(2), 2);
  assert.equal(getWeekBadge(3), 3);
  assert.equal(getWeekBadge(7), 7);
  assert.equal(getWeekBadge(10), 7); // capped at 7x

  // 2 workouts on Wednesday in the same week
  const workouts = [
    createWorkout('2026-10-28', 30, 'run'),
    createWorkout('2026-10-28', 20, 'walk'),
  ];
  const summary = buildWeekSummary('2026-10-26', workouts, '2026-10-29', 3);
  assert.equal(summary.workoutCount, 2);
  assert.equal(summary.badge, 2); // Earned 2x badge
  assert.equal(summary.activeDays.length, 1); // 1 active day, but 2 sessions!
});

test('Weekly badge: Sunday and Monday land in different weeks', () => {
  const sunWorkout = createWorkout('2026-11-01'); // Sunday of week 2026-10-26
  const monWorkout = createWorkout('2026-11-02'); // Monday of week 2026-11-02

  const groups = groupWorkoutsByWeek([sunWorkout, monWorkout]);
  assert.equal(groups.get('2026-10-26')?.length, 1);
  assert.equal(groups.get('2026-11-02')?.length, 1);
});

test('Badge shelf: historical past weeks with >=2 workouts are included, sorted descending', () => {
  const pastWeek1 = '2026-10-12';
  const pastWeek2 = '2026-10-19';
  const currentWeek = '2026-10-26';

  const workouts = [
    // pastWeek1 has 3 workouts
    createWorkout('2026-10-13'),
    createWorkout('2026-10-14'),
    createWorkout('2026-10-15'),

    // pastWeek2 has 1 workout (no badge)
    createWorkout('2026-10-20'),

    // currentWeek has 2 workouts (live badge, but not on shelf)
    createWorkout('2026-10-27'),
    createWorkout('2026-10-28'),
  ];

  const shelf = getBadgeHistory(workouts, '2026-10-29', 3);
  assert.equal(shelf.length, 1);
  assert.equal(shelf[0].weekKey, '2026-10-12');
  assert.equal(shelf[0].badge, 3);
});

test('Last 7 days activity: builds continuous 7-day window ending on today', () => {
  const workouts = [
    createWorkout('2026-10-29', 40),
    createWorkout('2026-10-27', 30),
  ];
  const chartData = getLast7DaysActivity(workouts, '2026-10-29');
  assert.equal(chartData.length, 7);
  assert.equal(chartData[6].date, '2026-10-29');
  assert.equal(chartData[6].minutes, 40);
  assert.equal(chartData[6].count, 1);
  assert.equal(chartData[4].date, '2026-10-27');
  assert.equal(chartData[4].minutes, 30);
  assert.equal(chartData[0].date, '2026-10-23');
  assert.equal(chartData[0].minutes, 0);
});
