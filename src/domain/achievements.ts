import {
  AchievementBadge,
  AchievementId,
  ISODate,
  PriorStats,
  Workout,
  WorkoutType,
} from './types';
import {
  CENTURY_TARGET,
  EARLY_BIRD_END,
  EARLY_BIRD_START,
  IRON_WILL_DAYS,
} from './constants';
import { parseISODate } from './dates';

export interface AchievementConfig {
  id: AchievementId;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  target?: number;
  isHidden?: boolean;
}

export const ACHIEVEMENTS_METADATA: Record<AchievementId, AchievementConfig> = {
  // --- 4 Known Milestones ---
  early_bird: {
    id: 'early_bird',
    title: 'Early Bird',
    subtitle: 'Morning Discipline',
    description: 'Log a workout started between 04:00 and 07:00.',
    icon: 'Sun',
    isHidden: false,
  },
  weekend_warrior: {
    id: 'weekend_warrior',
    title: 'Weekend Warrior',
    subtitle: 'Saturday & Sunday',
    description: 'Complete workouts on both Saturday and Sunday in the same week.',
    icon: 'Flame',
    isHidden: false,
  },
  century: {
    id: 'century',
    title: 'Century Club',
    subtitle: '100 Workouts',
    description: 'Complete 100 all-time workouts (including prior history).',
    icon: 'Trophy',
    target: CENTURY_TARGET,
    isHidden: false,
  },
  iron_will: {
    id: 'iron_will',
    title: 'Iron Will',
    subtitle: '14-Day Streak',
    description: 'Achieve an unbroken daily streak of 14 consecutive days.',
    icon: 'Shield',
    target: IRON_WILL_DAYS,
    isHidden: false,
  },

  // --- 46 Hidden Mystery Badges ---
  // Time of Day
  night_owl: {
    id: 'night_owl',
    title: 'Night Owl',
    subtitle: 'Late Night Grind',
    description: 'Log a workout started at or after 21:00.',
    icon: 'Moon',
    isHidden: true,
  },
  dawn_patrol: {
    id: 'dawn_patrol',
    title: 'Dawn Patrol',
    subtitle: 'Before Sunrise',
    description: 'Log a workout started before 06:00.',
    icon: 'Sunrise',
    isHidden: true,
  },
  lunch_break: {
    id: 'lunch_break',
    title: 'Midday Recharge',
    subtitle: 'Lunch Hour Energy',
    description: 'Log a workout started between 11:30 and 13:30.',
    icon: 'Clock',
    isHidden: true,
  },
  golden_hour: {
    id: 'golden_hour',
    title: 'Golden Hour',
    subtitle: 'Sunset Movement',
    description: 'Log a workout started between 17:00 and 19:00.',
    icon: 'Sunset',
    isHidden: true,
  },

  // Single-session duration & frequency
  quick_spark: {
    id: 'quick_spark',
    title: 'Quick Spark',
    subtitle: 'Micro Session',
    description: 'Complete a focused workout of 15 minutes or less.',
    icon: 'Zap',
    isHidden: true,
  },
  half_hour_hero: {
    id: 'half_hour_hero',
    title: 'Half-Hour Hero',
    subtitle: 'Solid 30',
    description: 'Complete a workout of 30 minutes or more.',
    icon: 'Timer',
    isHidden: true,
  },
  hour_power: {
    id: 'hour_power',
    title: 'Hour of Power',
    subtitle: 'Full 60 Minutes',
    description: 'Complete a workout of 60 minutes or more.',
    icon: 'BatteryCharging',
    isHidden: true,
  },
  ultra_session: {
    id: 'ultra_session',
    title: 'Ultra Endurance',
    subtitle: '90-Minute Session',
    description: 'Complete a workout lasting 90 minutes or longer.',
    icon: 'Mountain',
    isHidden: true,
  },
  century_session: {
    id: 'century_session',
    title: 'Century Session',
    subtitle: '100 Minutes in One Go',
    description: 'Complete a single workout of 100 minutes or longer.',
    icon: 'Compass',
    isHidden: true,
  },
  double_header: {
    id: 'double_header',
    title: 'Double Header',
    subtitle: 'Two in One Day',
    description: 'Log 2 workouts on the same calendar day.',
    icon: 'Layers',
    isHidden: true,
  },

  // Activity variety & specific disciplines
  first_step: {
    id: 'first_step',
    title: 'First Step',
    subtitle: 'The Journey Begins',
    description: 'Log your very first workout in CozyFit.',
    icon: 'Footprints',
    isHidden: true,
  },
  runner_high: {
    id: 'runner_high',
    title: 'Road Runner',
    subtitle: '5 Running Sessions',
    description: 'Complete 5 running workouts.',
    icon: 'Activity',
    target: 5,
    isHidden: true,
  },
  stroll_patrol: {
    id: 'stroll_patrol',
    title: 'Daily Stroller',
    subtitle: '5 Walking Sessions',
    description: 'Complete 5 walking workouts.',
    icon: 'Footprints',
    target: 5,
    isHidden: true,
  },
  pedal_pusher: {
    id: 'pedal_pusher',
    title: 'Pedal Pusher',
    subtitle: '5 Cycling Sessions',
    description: 'Complete 5 cycling workouts.',
    icon: 'Bike',
    target: 5,
    isHidden: true,
  },
  zen_master: {
    id: 'zen_master',
    title: 'Inner Calm',
    subtitle: '5 Yoga Sessions',
    description: 'Complete 5 yoga sessions.',
    icon: 'Heart',
    target: 5,
    isHidden: true,
  },
  aquatic_ace: {
    id: 'aquatic_ace',
    title: 'Aquatic Ace',
    subtitle: '3 Swimming Sessions',
    description: 'Complete 3 swimming workouts.',
    icon: 'Waves',
    target: 3,
    isHidden: true,
  },
  iron_lifter: {
    id: 'iron_lifter',
    title: 'Iron Lifter',
    subtitle: '5 Strength Sessions',
    description: 'Complete 5 strength workouts.',
    icon: 'Dumbbell',
    target: 5,
    isHidden: true,
  },
  bodyweight_beast: {
    id: 'bodyweight_beast',
    title: 'Calisthenics Ace',
    subtitle: '5 Bodyweight Sessions',
    description: 'Complete 5 bodyweight workouts.',
    icon: 'Sparkles',
    target: 5,
    isHidden: true,
  },
  interval_fire: {
    id: 'interval_fire',
    title: 'Interval Fire',
    subtitle: '5 HIIT Sessions',
    description: 'Complete 5 high-intensity interval workouts.',
    icon: 'Flame',
    target: 5,
    isHidden: true,
  },
  sports_fanatic: {
    id: 'sports_fanatic',
    title: 'Team Player',
    subtitle: '5 Sports Sessions',
    description: 'Complete 5 sports workouts.',
    icon: 'Trophy',
    target: 5,
    isHidden: true,
  },
  versatile_athlete: {
    id: 'versatile_athlete',
    title: 'Versatile Athlete',
    subtitle: '3 Disciplines',
    description: 'Log workouts in at least 3 distinct disciplines.',
    icon: 'Grid',
    target: 3,
    isHidden: true,
  },
  polymath: {
    id: 'polymath',
    title: 'Movement Polymath',
    subtitle: '5 Disciplines',
    description: 'Log workouts in at least 5 distinct disciplines.',
    icon: 'Layers',
    target: 5,
    isHidden: true,
  },
  decathlon: {
    id: 'decathlon',
    title: 'The Decathlete',
    subtitle: 'Master of All 10',
    description: 'Log all 10 workout disciplines at least once.',
    icon: 'Crown',
    target: 10,
    isHidden: true,
  },
  hybrid_day: {
    id: 'hybrid_day',
    title: 'Hybrid Dynamo',
    subtitle: 'Two Disciplines One Day',
    description: 'Log 2 different workout types on the same calendar day.',
    icon: 'Shuffle',
    isHidden: true,
  },
  trio_sampler: {
    id: 'trio_sampler',
    title: 'Weekly Sampler',
    subtitle: '3 Disciplines in One Week',
    description: 'Log at least 3 different workout types in a single week.',
    icon: 'Sparkles',
    isHidden: true,
  },

  // Total Workout Volume (Milestones)
  high_five: {
    id: 'high_five',
    title: 'High Five',
    subtitle: '5 Workouts',
    description: 'Complete 5 all-time workouts (including prior history).',
    icon: 'Award',
    target: 5,
    isHidden: true,
  },
  dirty_dozen: {
    id: 'dirty_dozen',
    title: 'Dirty Dozen',
    subtitle: '12 Workouts',
    description: 'Complete 12 all-time workouts (including prior history).',
    icon: 'Award',
    target: 12,
    isHidden: true,
  },
  quarter_century: {
    id: 'quarter_century',
    title: 'Silver Quarter',
    subtitle: '25 Workouts',
    description: 'Complete 25 all-time workouts (including prior history).',
    icon: 'Medal',
    target: 25,
    isHidden: true,
  },
  fabulous_fifty: {
    id: 'fabulous_fifty',
    title: 'Halfway to Century',
    subtitle: '50 Workouts',
    description: 'Complete 50 all-time workouts (including prior history).',
    icon: 'Medal',
    target: 50,
    isHidden: true,
  },
  double_century: {
    id: 'double_century',
    title: 'Double Century',
    subtitle: '200 Workouts',
    description: 'Complete 200 all-time workouts (including prior history).',
    icon: 'Trophy',
    target: 200,
    isHidden: true,
  },
  legendary_five_hundred: {
    id: 'legendary_five_hundred',
    title: 'Hall of Fame',
    subtitle: '500 Workouts',
    description: 'Complete 500 all-time workouts (including prior history).',
    icon: 'Crown',
    target: 500,
    isHidden: true,
  },

  // Total Minutes Volume
  centurion_minutes: {
    id: 'centurion_minutes',
    title: 'First Centurion',
    subtitle: '100 Minutes',
    description: 'Reach 100 total minutes across all workouts (including prior history).',
    icon: 'Clock',
    target: 100,
    isHidden: true,
  },
  five_hundred_minutes: {
    id: 'five_hundred_minutes',
    title: 'Five Hundred Club',
    subtitle: '500 Minutes',
    description: 'Reach 500 total minutes across all workouts (including prior history).',
    icon: 'Clock',
    target: 500,
    isHidden: true,
  },
  marathoner: {
    id: 'marathoner',
    title: 'Minute Marathoner',
    subtitle: '1,000 Total Minutes',
    description: 'Accumulate 1,000 total minutes (including prior history).',
    icon: 'Trophy',
    target: 1000,
    isHidden: true,
  },
  time_lord: {
    id: 'time_lord',
    title: 'Time Lord',
    subtitle: '5,000 Minutes',
    description: 'Accumulate 5,000 total minutes (including prior history).',
    icon: 'Trophy',
    target: 5000,
    isHidden: true,
  },
  ten_thousand_hours: {
    id: 'ten_thousand_hours',
    title: 'Grandmaster of Time',
    subtitle: '10,000 Minutes',
    description: 'Accumulate 10,000 total minutes (including prior history).',
    icon: 'Crown',
    target: 10000,
    isHidden: true,
  },

  // Streaks & Consistency
  three_peat: {
    id: 'three_peat',
    title: 'Three-Peat',
    subtitle: '3-Day Streak',
    description: 'Maintain an unbroken daily streak of 3 days.',
    icon: 'Flame',
    target: 3,
    isHidden: true,
  },
  lucky_seven: {
    id: 'lucky_seven',
    title: 'Lucky Seven',
    subtitle: '7-Day Streak',
    description: 'Maintain an unbroken daily streak of 7 days.',
    icon: 'Flame',
    target: 7,
    isHidden: true,
  },
  habit_formed: {
    id: 'habit_formed',
    title: 'Habit Builder',
    subtitle: '21-Day Streak',
    description: 'Achieve a 21-day unbroken streak to form a lifelong habit.',
    icon: 'Shield',
    target: 21,
    isHidden: true,
  },
  monthly_master: {
    id: 'monthly_master',
    title: 'Monthly Master',
    subtitle: '30-Day Streak',
    description: 'Achieve an unbroken 30-day streak.',
    icon: 'Shield',
    target: 30,
    isHidden: true,
  },
  sixty_day_soar: {
    id: 'sixty_day_soar',
    title: 'Unstoppable Momentum',
    subtitle: '60-Day Streak',
    description: 'Achieve an unbroken 60-day streak.',
    icon: 'Crown',
    target: 60,
    isHidden: true,
  },
  century_streak: {
    id: 'century_streak',
    title: 'Immortal Streak',
    subtitle: '100-Day Streak',
    description: 'Achieve a mythical 100-day daily streak.',
    icon: 'Crown',
    target: 100,
    isHidden: true,
  },

  // Days of Week & Calendar Patterns
  monday_momentum: {
    id: 'monday_momentum',
    title: 'Monday Momentum',
    subtitle: 'Never Miss a Monday',
    description: 'Log a workout on a Monday to set the weekly tone.',
    icon: 'Calendar',
    isHidden: true,
  },
  midweek_hustle: {
    id: 'midweek_hustle',
    title: 'Midweek Hustle',
    subtitle: 'Hump Day Power',
    description: 'Log a workout on a Wednesday.',
    icon: 'Zap',
    isHidden: true,
  },
  friday_finisher: {
    id: 'friday_finisher',
    title: 'Friday Finisher',
    subtitle: 'Strong Finish',
    description: 'Log a workout on a Friday to wrap up the workweek strong.',
    icon: 'PartyPopper',
    isHidden: true,
  },
  full_house_week: {
    id: 'full_house_week',
    title: 'Full House Week',
    subtitle: '5 Days in One Week',
    description: 'Work out on 5 or more distinct days in a single week.',
    icon: 'Star',
    isHidden: true,
  },
};

/** Helper to get Monday ISODate for a given ISODate */
function getWeekMonday(isoDate: ISODate): string {
  const d = parseISODate(isoDate);
  const dayOfWeek = d.getDay();
  const offset = dayOfWeek === 0 ? -6 : -(dayOfWeek - 1);
  const monday = new Date(d);
  monday.setDate(d.getDate() + offset);
  const y = monday.getFullYear();
  const m = String(monday.getMonth() + 1).padStart(2, '0');
  const day = String(monday.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/**
 * Checks if any weekend in the workout list has workouts on both Saturday and Sunday.
 */
function hasWeekendBothDays(workouts: Workout[]): { hasWeekend: boolean; weekendDate?: ISODate } {
  const weekendMap = new Map<string, { sat: boolean; sun: boolean; lastDate: ISODate }>();

  for (const w of workouts) {
    const d = parseISODate(w.date);
    const dayOfWeek = d.getDay();
    if (dayOfWeek !== 0 && dayOfWeek !== 6) continue;

    const weekKey = getWeekMonday(w.date);
    const current = weekendMap.get(weekKey) || { sat: false, sun: false, lastDate: w.date };
    if (dayOfWeek === 6) current.sat = true;
    if (dayOfWeek === 0) current.sun = true;
    if (w.date > current.lastDate) current.lastDate = w.date;
    weekendMap.set(weekKey, current);
  }

  for (const entry of weekendMap.values()) {
    if (entry.sat && entry.sun) {
      return { hasWeekend: true, weekendDate: entry.lastDate };
    }
  }

  return { hasWeekend: false };
}

/**
 * Evaluates achievement statuses and calculates progress based on workouts, prior stats, and longest streak.
 */
export function evaluateAchievements(
  workouts: Workout[],
  priorStats: PriorStats,
  effectiveLongestStreak: number,
  persistedUnlockedDates: Partial<Record<AchievementId, ISODate>> = {}
): AchievementBadge[] {
  const totalLoggedWorkouts = workouts.length;
  const totalPriorWorkouts = priorStats?.totalWorkouts || 0;
  const totalAllTimeWorkouts = totalLoggedWorkouts + totalPriorWorkouts;

  const totalLoggedMinutes = workouts.reduce((s, w) => s + w.durationMin, 0);
  const totalPriorMinutes = priorStats?.totalMinutes || 0;
  const totalAllTimeMinutes = totalLoggedMinutes + totalPriorMinutes;

  // Group workouts by date
  const dateMap = new Map<ISODate, Workout[]>();
  for (const w of workouts) {
    const list = dateMap.get(w.date) || [];
    list.push(w);
    dateMap.set(w.date, list);
  }

  // Group workouts by week Monday
  const weekMap = new Map<string, Workout[]>();
  for (const w of workouts) {
    const monday = getWeekMonday(w.date);
    const list = weekMap.get(monday) || [];
    list.push(w);
    weekMap.set(monday, list);
  }

  // Type frequency map
  const typeCountMap = new Map<WorkoutType, number>();
  for (const w of workouts) {
    typeCountMap.set(w.type, (typeCountMap.get(w.type) || 0) + 1);
  }
  const distinctDisciplines = typeCountMap.size;

  // Helper to resolve an unlock date for threshold-based badges
  const resolveThresholdDate = (
    currentTotal: number,
    target: number,
    priorOffset: number
  ): ISODate | undefined => {
    if (currentTotal < target) return undefined;
    const neededFromLogs = target - priorOffset;
    if (neededFromLogs <= 0) {
      return workouts[0]?.date || 'Earned';
    }
    const sorted = [...workouts].sort((a, b) => a.date.localeCompare(b.date));
    return sorted[neededFromLogs - 1]?.date || 'Earned';
  };

  const results: AchievementBadge[] = [];

  for (const [id, meta] of Object.entries(ACHIEVEMENTS_METADATA)) {
    let unlockedAt = persistedUnlockedDates[id];
    let progress: { current: number; target: number } | undefined = undefined;

    switch (id) {
      // --- Baseline 4 ---
      case 'early_bird': {
        if (!unlockedAt) {
          const w = workouts.find(
            (item) => item.startTime && item.startTime >= EARLY_BIRD_START && item.startTime < EARLY_BIRD_END
          );
          if (w) unlockedAt = w.date;
        }
        break;
      }

      case 'weekend_warrior': {
        if (!unlockedAt) {
          const res = hasWeekendBothDays(workouts);
          if (res.hasWeekend) unlockedAt = res.weekendDate;
        }
        break;
      }

      case 'century': {
        progress = {
          current: Math.min(CENTURY_TARGET, totalAllTimeWorkouts),
          target: CENTURY_TARGET,
        };
        if (!unlockedAt) {
          unlockedAt = resolveThresholdDate(totalAllTimeWorkouts, CENTURY_TARGET, totalPriorWorkouts);
        }
        break;
      }

      case 'iron_will': {
        progress = {
          current: Math.min(IRON_WILL_DAYS, effectiveLongestStreak),
          target: IRON_WILL_DAYS,
        };
        if (!unlockedAt && effectiveLongestStreak >= IRON_WILL_DAYS) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      // --- Time of Day ---
      case 'night_owl': {
        if (!unlockedAt) {
          const w = workouts.find((item) => item.startTime && item.startTime >= '21:00');
          if (w) unlockedAt = w.date;
        }
        break;
      }

      case 'dawn_patrol': {
        if (!unlockedAt) {
          const w = workouts.find((item) => item.startTime && item.startTime < '06:00');
          if (w) unlockedAt = w.date;
        }
        break;
      }

      case 'lunch_break': {
        if (!unlockedAt) {
          const w = workouts.find(
            (item) => item.startTime && item.startTime >= '11:30' && item.startTime <= '13:30'
          );
          if (w) unlockedAt = w.date;
        }
        break;
      }

      case 'golden_hour': {
        if (!unlockedAt) {
          const w = workouts.find(
            (item) => item.startTime && item.startTime >= '17:00' && item.startTime <= '19:00'
          );
          if (w) unlockedAt = w.date;
        }
        break;
      }

      // --- Single-session duration & frequency ---
      case 'quick_spark': {
        if (!unlockedAt) {
          const w = workouts.find((item) => item.durationMin <= 15);
          if (w) unlockedAt = w.date;
        }
        break;
      }

      case 'half_hour_hero': {
        if (!unlockedAt) {
          const w = workouts.find((item) => item.durationMin >= 30);
          if (w) unlockedAt = w.date;
        }
        break;
      }

      case 'hour_power': {
        if (!unlockedAt) {
          const w = workouts.find((item) => item.durationMin >= 60);
          if (w) unlockedAt = w.date;
        }
        break;
      }

      case 'ultra_session': {
        if (!unlockedAt) {
          const w = workouts.find((item) => item.durationMin >= 90);
          if (w) unlockedAt = w.date;
        }
        break;
      }

      case 'century_session': {
        if (!unlockedAt) {
          const w = workouts.find((item) => item.durationMin >= 100);
          if (w) unlockedAt = w.date;
        }
        break;
      }

      case 'double_header': {
        if (!unlockedAt) {
          for (const [date, list] of dateMap.entries()) {
            if (list.length >= 2) {
              unlockedAt = date;
              break;
            }
          }
        }
        break;
      }

      // --- Discipline Counts ---
      case 'first_step': {
        if (!unlockedAt && totalAllTimeWorkouts >= 1) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      case 'runner_high': {
        const count = typeCountMap.get('run') || 0;
        progress = { current: Math.min(5, count), target: 5 };
        if (!unlockedAt && count >= 5) {
          unlockedAt = workouts.filter((w) => w.type === 'run')[4]?.date || 'Earned';
        }
        break;
      }

      case 'stroll_patrol': {
        const count = typeCountMap.get('walk') || 0;
        progress = { current: Math.min(5, count), target: 5 };
        if (!unlockedAt && count >= 5) {
          unlockedAt = workouts.filter((w) => w.type === 'walk')[4]?.date || 'Earned';
        }
        break;
      }

      case 'pedal_pusher': {
        const count = typeCountMap.get('cycle') || 0;
        progress = { current: Math.min(5, count), target: 5 };
        if (!unlockedAt && count >= 5) {
          unlockedAt = workouts.filter((w) => w.type === 'cycle')[4]?.date || 'Earned';
        }
        break;
      }

      case 'zen_master': {
        const count = typeCountMap.get('yoga') || 0;
        progress = { current: Math.min(5, count), target: 5 };
        if (!unlockedAt && count >= 5) {
          unlockedAt = workouts.filter((w) => w.type === 'yoga')[4]?.date || 'Earned';
        }
        break;
      }

      case 'aquatic_ace': {
        const count = typeCountMap.get('swim') || 0;
        progress = { current: Math.min(3, count), target: 3 };
        if (!unlockedAt && count >= 3) {
          unlockedAt = workouts.filter((w) => w.type === 'swim')[2]?.date || 'Earned';
        }
        break;
      }

      case 'iron_lifter': {
        const count = typeCountMap.get('strength') || 0;
        progress = { current: Math.min(5, count), target: 5 };
        if (!unlockedAt && count >= 5) {
          unlockedAt = workouts.filter((w) => w.type === 'strength')[4]?.date || 'Earned';
        }
        break;
      }

      case 'bodyweight_beast': {
        const count = typeCountMap.get('bodyweight') || 0;
        progress = { current: Math.min(5, count), target: 5 };
        if (!unlockedAt && count >= 5) {
          unlockedAt = workouts.filter((w) => w.type === 'bodyweight')[4]?.date || 'Earned';
        }
        break;
      }

      case 'interval_fire': {
        const count = typeCountMap.get('hiit') || 0;
        progress = { current: Math.min(5, count), target: 5 };
        if (!unlockedAt && count >= 5) {
          unlockedAt = workouts.filter((w) => w.type === 'hiit')[4]?.date || 'Earned';
        }
        break;
      }

      case 'sports_fanatic': {
        const count = typeCountMap.get('sports') || 0;
        progress = { current: Math.min(5, count), target: 5 };
        if (!unlockedAt && count >= 5) {
          unlockedAt = workouts.filter((w) => w.type === 'sports')[4]?.date || 'Earned';
        }
        break;
      }

      case 'versatile_athlete': {
        progress = { current: Math.min(3, distinctDisciplines), target: 3 };
        if (!unlockedAt && distinctDisciplines >= 3) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      case 'polymath': {
        progress = { current: Math.min(5, distinctDisciplines), target: 5 };
        if (!unlockedAt && distinctDisciplines >= 5) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      case 'decathlon': {
        progress = { current: Math.min(10, distinctDisciplines), target: 10 };
        if (!unlockedAt && distinctDisciplines >= 10) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      case 'hybrid_day': {
        if (!unlockedAt) {
          for (const [date, list] of dateMap.entries()) {
            const typesOnDate = new Set(list.map((w) => w.type));
            if (typesOnDate.size >= 2) {
              unlockedAt = date;
              break;
            }
          }
        }
        break;
      }

      case 'trio_sampler': {
        if (!unlockedAt) {
          for (const list of weekMap.values()) {
            const weekTypes = new Set(list.map((w) => w.type));
            if (weekTypes.size >= 3) {
              unlockedAt = list[list.length - 1]?.date || 'Earned';
              break;
            }
          }
        }
        break;
      }

      // --- Total Workouts Volume ---
      case 'high_five': {
        progress = { current: Math.min(5, totalAllTimeWorkouts), target: 5 };
        if (!unlockedAt) unlockedAt = resolveThresholdDate(totalAllTimeWorkouts, 5, totalPriorWorkouts);
        break;
      }

      case 'dirty_dozen': {
        progress = { current: Math.min(12, totalAllTimeWorkouts), target: 12 };
        if (!unlockedAt) unlockedAt = resolveThresholdDate(totalAllTimeWorkouts, 12, totalPriorWorkouts);
        break;
      }

      case 'quarter_century': {
        progress = { current: Math.min(25, totalAllTimeWorkouts), target: 25 };
        if (!unlockedAt) unlockedAt = resolveThresholdDate(totalAllTimeWorkouts, 25, totalPriorWorkouts);
        break;
      }

      case 'fabulous_fifty': {
        progress = { current: Math.min(50, totalAllTimeWorkouts), target: 50 };
        if (!unlockedAt) unlockedAt = resolveThresholdDate(totalAllTimeWorkouts, 50, totalPriorWorkouts);
        break;
      }

      case 'double_century': {
        progress = { current: Math.min(200, totalAllTimeWorkouts), target: 200 };
        if (!unlockedAt) unlockedAt = resolveThresholdDate(totalAllTimeWorkouts, 200, totalPriorWorkouts);
        break;
      }

      case 'legendary_five_hundred': {
        progress = { current: Math.min(500, totalAllTimeWorkouts), target: 500 };
        if (!unlockedAt) unlockedAt = resolveThresholdDate(totalAllTimeWorkouts, 500, totalPriorWorkouts);
        break;
      }

      // --- Total Minutes Volume ---
      case 'centurion_minutes': {
        progress = { current: Math.min(100, totalAllTimeMinutes), target: 100 };
        if (!unlockedAt && totalAllTimeMinutes >= 100) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      case 'five_hundred_minutes': {
        progress = { current: Math.min(500, totalAllTimeMinutes), target: 500 };
        if (!unlockedAt && totalAllTimeMinutes >= 500) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      case 'marathoner': {
        progress = { current: Math.min(1000, totalAllTimeMinutes), target: 1000 };
        if (!unlockedAt && totalAllTimeMinutes >= 1000) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      case 'time_lord': {
        progress = { current: Math.min(5000, totalAllTimeMinutes), target: 5000 };
        if (!unlockedAt && totalAllTimeMinutes >= 5000) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      case 'ten_thousand_hours': {
        progress = { current: Math.min(10000, totalAllTimeMinutes), target: 10000 };
        if (!unlockedAt && totalAllTimeMinutes >= 10000) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      // --- Streaks ---
      case 'three_peat': {
        progress = { current: Math.min(3, effectiveLongestStreak), target: 3 };
        if (!unlockedAt && effectiveLongestStreak >= 3) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      case 'lucky_seven': {
        progress = { current: Math.min(7, effectiveLongestStreak), target: 7 };
        if (!unlockedAt && effectiveLongestStreak >= 7) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      case 'habit_formed': {
        progress = { current: Math.min(21, effectiveLongestStreak), target: 21 };
        if (!unlockedAt && effectiveLongestStreak >= 21) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      case 'monthly_master': {
        progress = { current: Math.min(30, effectiveLongestStreak), target: 30 };
        if (!unlockedAt && effectiveLongestStreak >= 30) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      case 'sixty_day_soar': {
        progress = { current: Math.min(60, effectiveLongestStreak), target: 60 };
        if (!unlockedAt && effectiveLongestStreak >= 60) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      case 'century_streak': {
        progress = { current: Math.min(100, effectiveLongestStreak), target: 100 };
        if (!unlockedAt && effectiveLongestStreak >= 100) {
          unlockedAt = workouts[0]?.date || 'Earned';
        }
        break;
      }

      // --- Days of Week & Calendar Patterns ---
      case 'monday_momentum': {
        if (!unlockedAt) {
          const w = workouts.find((item) => parseISODate(item.date).getDay() === 1);
          if (w) unlockedAt = w.date;
        }
        break;
      }

      case 'midweek_hustle': {
        if (!unlockedAt) {
          const w = workouts.find((item) => parseISODate(item.date).getDay() === 3);
          if (w) unlockedAt = w.date;
        }
        break;
      }

      case 'friday_finisher': {
        if (!unlockedAt) {
          const w = workouts.find((item) => parseISODate(item.date).getDay() === 5);
          if (w) unlockedAt = w.date;
        }
        break;
      }

      case 'full_house_week': {
        if (!unlockedAt) {
          for (const list of weekMap.values()) {
            const daysInWeek = new Set(list.map((w) => w.date));
            if (daysInWeek.size >= 5) {
              unlockedAt = list[list.length - 1]?.date || 'Earned';
              break;
            }
          }
        }
        break;
      }
    }

    results.push({
      id: meta.id,
      title: meta.title,
      subtitle: meta.subtitle,
      description: meta.description,
      icon: meta.icon,
      unlockedAt,
      progress,
      isHidden: meta.isHidden ?? false,
    });
  }

  return results;
}
