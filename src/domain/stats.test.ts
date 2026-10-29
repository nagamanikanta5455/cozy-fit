import test from 'node:test';
import assert from 'node:assert/strict';
import {
  sanitizePriorStats,
  validatePriorStats,
  combineTotals,
  withEffectiveLongest,
  sumLoggedTotals,
} from '../store/statsSelectors';
import { Workout } from './types';

test('PriorStats: sanitizePriorStats correctly handles invalid, negative, float and out-of-bound inputs', () => {
  const resultNull = sanitizePriorStats(null);
  assert.deepEqual(resultNull, { totalWorkouts: 0, totalMinutes: 0, longestStreak: 0 });

  const resultNegative = sanitizePriorStats({
    totalWorkouts: -15,
    totalMinutes: 120.9,
    longestStreak: 50_000, // over 36,500
  });

  assert.equal(resultNegative.totalWorkouts, 0);
  assert.equal(resultNegative.totalMinutes, 120); // truncated
  assert.equal(resultNegative.longestStreak, 36_500); // capped at max
});

test('PriorStats: validatePriorStats returns detailed validation errors', () => {
  const valid = validatePriorStats({
    totalWorkouts: 150,
    totalMinutes: 4500,
    longestStreak: 45,
  });
  assert.equal(valid.ok, true);

  const invalid = validatePriorStats({
    totalWorkouts: -5,
    totalMinutes: 10_000_000,
    longestStreak: 12.5,
  });
  assert.equal(invalid.ok, false);
  if (!invalid.ok) {
    assert.equal(invalid.errors.length, 3);
  }
});

test('PriorStats: combineTotals correctly combines logged and prior stats', () => {
  const logged = {
    totalWorkouts: 10,
    totalMinutes: 300,
    longestStreak: 5,
  };
  const prior = {
    totalWorkouts: 50,
    totalMinutes: 1500,
    longestStreak: 14,
  };

  const combined = combineTotals(logged, prior);
  assert.equal(combined.totalWorkouts, 60);
  assert.equal(combined.totalMinutes, 1800);
  assert.equal(combined.longestStreak, 14); // max(5, 14)
});

test('PriorStats: withEffectiveLongest upgrades streak longest if prior is larger', () => {
  const currentStreak = {
    current: 4,
    longest: 6,
    isActiveToday: true,
    atRisk: false,
    lastWorkoutDate: '2026-10-29',
  };

  const withLesserPrior = withEffectiveLongest(currentStreak, {
    totalWorkouts: 0,
    totalMinutes: 0,
    longestStreak: 3,
  });
  assert.equal(withLesserPrior.longest, 6);

  const withGreaterPrior = withEffectiveLongest(currentStreak, {
    totalWorkouts: 0,
    totalMinutes: 0,
    longestStreak: 20,
  });
  assert.equal(withGreaterPrior.longest, 20);
});

test('PriorStats: sumLoggedTotals sums all workouts correctly', () => {
  const workouts: Workout[] = [
    {
      id: '1',
      date: '2026-10-28',
      type: 'run',
      durationMin: 35,
      createdAt: 1000,
      updatedAt: 1000,
    },
    {
      id: '2',
      date: '2026-10-29',
      type: 'bodyweight',
      durationMin: 25,
      sets: 3,
      reps: 15,
      startTime: '06:30',
      createdAt: 2000,
      updatedAt: 2000,
    },
  ];

  const logged = sumLoggedTotals(workouts);
  assert.equal(logged.totalWorkouts, 2);
  assert.equal(logged.totalMinutes, 60);
});
