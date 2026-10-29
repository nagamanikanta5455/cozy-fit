import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildDayMap,
  getIntensity,
  buildHeatmapWeeks,
  getMonthLabels,
} from './history';
import { Workout } from './types';

function createWorkout(date: string, durationMin: number, type: Workout['type'] = 'run'): Workout {
  return {
    id: `w-${Math.random().toString(36).slice(2)}`,
    date,
    type,
    durationMin,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

test('History: getIntensity correctly partitions minutes according to thresholds', () => {
  assert.equal(getIntensity(0), 0);
  assert.equal(getIntensity(-10), 0);
  assert.equal(getIntensity(15), 1);
  assert.equal(getIntensity(29), 1);
  assert.equal(getIntensity(30), 2);
  assert.equal(getIntensity(59), 2);
  assert.equal(getIntensity(60), 3);
  assert.equal(getIntensity(120), 3);
});

test('History: buildDayMap sums multiple workouts in the same day correctly', () => {
  const workouts: Workout[] = [
    createWorkout('2026-03-10', 25, 'run'),
    createWorkout('2026-03-10', 35, 'yoga'),
    createWorkout('2026-03-11', 45, 'cycle'),
  ];

  const map = buildDayMap(workouts);
  assert.equal(map.size, 2);

  const day1 = map.get('2026-03-10');
  assert.ok(day1);
  assert.equal(day1.count, 2);
  assert.equal(day1.minutes, 60);

  const day2 = map.get('2026-03-11');
  assert.ok(day2);
  assert.equal(day2.count, 1);
  assert.equal(day2.minutes, 45);
});

test('History: empty array generates default 26-week span ending on current week', () => {
  const today = '2026-10-29'; // Thursday
  const weeks = buildHeatmapWeeks([], today);

  assert.equal(weeks.length, 26);
  // Last week should contain today
  const lastWeek = weeks[weeks.length - 1];
  const todayCell = lastWeek.days.find((d) => d.date === today);
  assert.ok(todayCell);
  assert.equal(todayCell.isToday, true);

  // Future days in current week (Fri, Sat, Sun) must be isFuture: true
  const futureDays = lastWeek.days.filter((d) => d.isFuture);
  assert.equal(futureDays.length, 3);
});

test('History: first workout on a Sunday correctly starts on that week\'s Monday', () => {
  // 2026-04-12 is a Sunday. The Monday of that week is 2026-04-06.
  const workouts = [createWorkout('2026-04-12', 30)];
  const today = '2026-04-14'; // Tuesday of following week

  const weeks = buildHeatmapWeeks(workouts, today);
  assert.equal(weeks[0].weekStart, '2026-04-06');
  // First week Sunday is 2026-04-12
  const sunday = weeks[0].days[6];
  assert.equal(sunday.date, '2026-04-12');
  assert.equal(sunday.count, 1);
  assert.equal(sunday.minutes, 30);
  assert.equal(sunday.intensity, 2);
});

test('History: first workout on a Monday starts exactly on that day', () => {
  // 2026-05-04 is a Monday
  const workouts = [createWorkout('2026-05-04', 60)];
  const today = '2026-05-06';

  const weeks = buildHeatmapWeeks(workouts, today);
  assert.equal(weeks[0].weekStart, '2026-05-04');
  assert.equal(weeks[0].days[0].date, '2026-05-04');
  assert.equal(weeks[0].days[0].intensity, 3);
});

test('History: leap day 2024-02-29 is correctly preserved without drift', () => {
  // 2024 is a leap year; 2024-02-29 is a Thursday
  const workouts = [createWorkout('2024-02-29', 40)];
  const today = '2024-03-03'; // Sunday of same week

  const weeks = buildHeatmapWeeks(workouts, today);
  const week = weeks[0];
  assert.equal(week.weekStart, '2024-02-26');

  const leapDay = week.days.find((d) => d.date === '2024-02-29');
  assert.ok(leapDay, 'Leap day 2024-02-29 must be present');
  assert.equal(leapDay.dayOfWeek, 3); // Thursday is index 3
  assert.equal(leapDay.count, 1);
  assert.equal(leapDay.minutes, 40);

  const nextDay = week.days[4];
  assert.equal(nextDay.date, '2024-03-01');
});

test('History: Dec 31 to Jan 1 year boundary transition is seamless', () => {
  // 2025-12-31 is Wednesday, 2026-01-01 is Thursday
  const workouts = [
    createWorkout('2025-12-31', 30),
    createWorkout('2026-01-01', 45),
  ];
  const today = '2026-01-04'; // Sunday of the boundary week

  const weeks = buildHeatmapWeeks(workouts, today);
  assert.equal(weeks.length, 1);

  const week = weeks[0];
  assert.equal(week.weekStart, '2025-12-29'); // Monday

  const dec31 = week.days[2]; // Wednesday
  assert.equal(dec31.date, '2025-12-31');
  assert.equal(dec31.minutes, 30);

  const jan1 = week.days[3]; // Thursday
  assert.equal(jan1.date, '2026-01-01');
  assert.equal(jan1.minutes, 45);
});

test('History: future cells beyond today are flagged as isFuture and have 0 intensity', () => {
  const today = '2026-10-14'; // Wednesday
  const workouts = [createWorkout('2026-10-12', 30)]; // Monday

  const weeks = buildHeatmapWeeks(workouts, today);
  const week = weeks[0];

  const wednesday = week.days[2];
  assert.equal(wednesday.date, '2026-10-14');
  assert.equal(wednesday.isToday, true);
  assert.equal(wednesday.isFuture, false);

  const thursday = week.days[3];
  assert.equal(thursday.date, '2026-10-15');
  assert.equal(thursday.isToday, false);
  assert.equal(thursday.isFuture, true);
  assert.equal(thursday.intensity, 0);
});

test('History: getMonthLabels creates non-overlapping labels and includes year for January', () => {
  // Simulate 3 weeks across Dec 2025 to Jan 2026
  const weeks = [
    {
      weekStart: '2025-12-15',
      days: [],
    },
    {
      weekStart: '2025-12-22',
      days: [],
    },
    {
      weekStart: '2025-12-29',
      days: [],
    },
    {
      weekStart: '2026-01-05',
      days: [],
    },
    {
      weekStart: '2026-01-12',
      days: [],
    },
  ];

  const labels = getMonthLabels(weeks as any);
  assert.equal(labels.length, 2);
  assert.equal(labels[0].weekIndex, 0);
  assert.equal(labels[0].label, 'Dec');

  assert.equal(labels[1].weekIndex, 3);
  assert.equal(labels[1].label, 'Jan 2026');
});
