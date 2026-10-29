import test from 'node:test';
import assert from 'node:assert/strict';
import { evaluateAchievements } from './achievements';
import { Workout } from './types';

test('Achievements: early_bird unlocks when a workout has startTime between 04:00 and 07:00', () => {
  const workoutsNoEarly: Workout[] = [
    {
      id: '1',
      date: '2026-10-25',
      type: 'run',
      durationMin: 30,
      startTime: '07:30',
      createdAt: 1,
      updatedAt: 1,
    },
  ];

  const badgesLocked = evaluateAchievements(workoutsNoEarly, { totalWorkouts: 0, totalMinutes: 0, longestStreak: 0 }, 1);
  const earlyBirdLocked = badgesLocked.find((b) => b.id === 'early_bird');
  assert.equal(earlyBirdLocked?.unlockedAt, undefined);

  const workoutsWithEarly: Workout[] = [
    ...workoutsNoEarly,
    {
      id: '2',
      date: '2026-10-26',
      type: 'run',
      durationMin: 30,
      startTime: '05:45',
      createdAt: 2,
      updatedAt: 2,
    },
  ];

  const badgesUnlocked = evaluateAchievements(workoutsWithEarly, { totalWorkouts: 0, totalMinutes: 0, longestStreak: 0 }, 1);
  const earlyBirdUnlocked = badgesUnlocked.find((b) => b.id === 'early_bird');
  assert.equal(earlyBirdUnlocked?.unlockedAt, '2026-10-26');
});

test('Achievements: weekend_warrior unlocks only when workouts exist on both Sat and Sun of the same week', () => {
  // 2026-10-24 is Saturday, 2026-10-25 is Sunday
  const workoutsSatOnly: Workout[] = [
    {
      id: '1',
      date: '2026-10-24', // Saturday
      type: 'walk',
      durationMin: 40,
      createdAt: 1,
      updatedAt: 1,
    },
  ];

  const locked = evaluateAchievements(workoutsSatOnly, { totalWorkouts: 0, totalMinutes: 0, longestStreak: 0 }, 1);
  assert.equal(locked.find((b) => b.id === 'weekend_warrior')?.unlockedAt, undefined);

  const workoutsBothDays: Workout[] = [
    ...workoutsSatOnly,
    {
      id: '2',
      date: '2026-10-25', // Sunday
      type: 'cycle',
      durationMin: 50,
      createdAt: 2,
      updatedAt: 2,
    },
  ];

  const unlocked = evaluateAchievements(workoutsBothDays, { totalWorkouts: 0, totalMinutes: 0, longestStreak: 0 }, 1);
  assert.equal(unlocked.find((b) => b.id === 'weekend_warrior')?.unlockedAt, '2026-10-25');
});

test('Achievements: century tracks progress and unlocks at 100 workouts including prior', () => {
  const workouts: Workout[] = Array.from({ length: 40 }, (_, i) => ({
    id: `w-${i}`,
    date: '2026-10-01',
    type: 'strength',
    durationMin: 30,
    createdAt: i,
    updatedAt: i,
  }));

  const partial = evaluateAchievements(workouts, { totalWorkouts: 20, totalMinutes: 500, longestStreak: 5 }, 5);
  const centuryPartial = partial.find((b) => b.id === 'century');
  assert.equal(centuryPartial?.progress?.current, 60);
  assert.equal(centuryPartial?.progress?.target, 100);
  assert.equal(centuryPartial?.unlockedAt, undefined);

  const completed = evaluateAchievements(workouts, { totalWorkouts: 65, totalMinutes: 1500, longestStreak: 5 }, 5);
  const centuryCompleted = completed.find((b) => b.id === 'century');
  assert.equal(centuryCompleted?.progress?.current, 100);
  assert.notEqual(centuryCompleted?.unlockedAt, undefined);
});

test('Achievements: iron_will tracks 14-day streak progress and unlocks when streak is >= 14', () => {
  const badgesUnder = evaluateAchievements([], { totalWorkouts: 0, totalMinutes: 0, longestStreak: 10 }, 10);
  const ironWillUnder = badgesUnder.find((b) => b.id === 'iron_will');
  assert.equal(ironWillUnder?.progress?.current, 10);
  assert.equal(ironWillUnder?.unlockedAt, undefined);

  const badgesMet = evaluateAchievements([], { totalWorkouts: 0, totalMinutes: 0, longestStreak: 14 }, 14);
  const ironWillMet = badgesMet.find((b) => b.id === 'iron_will');
  assert.equal(ironWillMet?.progress?.current, 14);
  assert.notEqual(ironWillMet?.unlockedAt, undefined);
});

test('Achievements: total count is exactly 50 with 4 known and 46 hidden mystery badges', () => {
  const badges = evaluateAchievements([], { totalWorkouts: 0, totalMinutes: 0, longestStreak: 0 }, 0);
  assert.equal(badges.length, 50);

  const known = badges.filter((b) => !b.isHidden);
  assert.equal(known.length, 4);
  assert.deepEqual(
    known.map((b) => b.id).sort(),
    ['century', 'early_bird', 'iron_will', 'weekend_warrior']
  );

  const hidden = badges.filter((b) => b.isHidden);
  assert.equal(hidden.length, 46);
});

test('Achievements: mystery badges unlock when criteria are met (night_owl, quick_spark, high_five)', () => {
  const emptyBadges = evaluateAchievements([], { totalWorkouts: 0, totalMinutes: 0, longestStreak: 0 }, 0);
  assert.equal(emptyBadges.find((b) => b.id === 'night_owl')?.unlockedAt, undefined);
  assert.equal(emptyBadges.find((b) => b.id === 'quick_spark')?.unlockedAt, undefined);
  assert.equal(emptyBadges.find((b) => b.id === 'high_five')?.unlockedAt, undefined);

  const nightWorkout: Workout = {
    id: 'w-night',
    date: '2026-10-28',
    type: 'yoga',
    durationMin: 12,
    startTime: '21:30',
    createdAt: 1,
    updatedAt: 1,
  };

  const evaluated = evaluateAchievements(
    [nightWorkout],
    { totalWorkouts: 4, totalMinutes: 90, longestStreak: 1 },
    1
  );

  // night_owl unlocked because startTime is 21:30 (>= 21:00)
  assert.equal(evaluated.find((b) => b.id === 'night_owl')?.unlockedAt, '2026-10-28');
  // quick_spark unlocked because duration is 12 (<= 15)
  assert.equal(evaluated.find((b) => b.id === 'quick_spark')?.unlockedAt, '2026-10-28');
  // high_five unlocked because 1 logged + 4 prior = 5 all-time workouts
  assert.notEqual(evaluated.find((b) => b.id === 'high_five')?.unlockedAt, undefined);
});

