import React from 'react';
import { useToday } from '../hooks/useToday';
import { useStats, useRecentWorkouts } from '../store/selectors';
import { useAppStore } from '../store/useAppStore';
import { useToast } from '../components/ui/Toast';
import { StreakCard } from '../components/dashboard/StreakCard';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { WeekTracker } from '../components/dashboard/WeekTracker';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { RecentActivityList } from '../components/dashboard/RecentActivityList';
import { QuickLogRow } from '../components/dashboard/QuickLogRow';
import { BackupNudgeCard } from '../components/dashboard/BackupNudgeCard';
import { HeatmapPreviewCard } from '../components/journey/HeatmapPreviewCard';
import { EmptyState } from '../components/ui/EmptyState';
import { Workout, WorkoutType } from '../domain/types';
import { calculateStreak } from '../domain/streak';
import { buildWeekSummary, groupWorkoutsByWeek } from '../domain/badges';
import { getWeekStart } from '../domain/dates';
import { STREAK_MILESTONES } from '../domain/constants';

interface DashboardPageProps {
  onOpenLogger: () => void;
  onEditWorkout: (workout: Workout) => void;
  onNavigate: (page: string) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  onOpenLogger,
  onEditWorkout,
  onNavigate,
}) => {
  const today = useToday();
  const stats = useStats(today);
  const recentWorkouts = useRecentWorkouts(10);
  const settings = useAppStore((state) => state.settings);
  const allWorkouts = useAppStore((state) => state.workouts);
  const addWorkout = useAppStore((state) => state.addWorkout);
  const deleteWorkout = useAppStore((state) => state.deleteWorkout);
  const restoreWorkout = useAppStore((state) => state.restoreWorkout);
  const queueCelebration = useAppStore((state) => state.queueCelebration);
  const { showToast, showUndoToast } = useToast();

  const handleDeleteWorkout = (workout: Workout) => {
    const deleted = deleteWorkout(workout.id);
    if (deleted) {
      showUndoToast(`Deleted ${workout.durationMin}m workout`, () => {
        restoreWorkout(deleted);
      });
    }
  };

  // Quick Log: One-click repeat of last workout for today
  const handleQuickLog = (type: WorkoutType, durationMin: number) => {
    addWorkout({
      date: today,
      type,
      durationMin,
      note: 'Quick log',
    });
    showToast({
      type: 'success',
      title: 'Workout logged',
      description: `${durationMin}m session recorded for today.`,
    });

    // Gamification checks
    const streakInfo = calculateStreak(allWorkouts, today);

    if ((STREAK_MILESTONES as readonly number[]).includes(streakInfo.current)) {
      queueCelebration({
        id: `streak:${streakInfo.current}`,
        title: `${streakInfo.current}-Day Streak Reached`,
        subtitle: `You completed ${streakInfo.current} consecutive active days.`,
        type: 'streak',
        tier: streakInfo.current,
      });
    }

    const currentWeekKey = getWeekStart(today);
    const groups = groupWorkoutsByWeek(allWorkouts);
    const currentWeekWorkouts = groups.get(currentWeekKey) || [];
    const weekSummary = buildWeekSummary(
      currentWeekKey,
      currentWeekWorkouts,
      today,
      settings.weeklyGoal
    );

    if (weekSummary.badge) {
      queueCelebration({
        id: `week:${currentWeekKey}:${weekSummary.badge}x`,
        title: `Earned ${weekSummary.badge}x Weekly Badge`,
        subtitle: `Completed ${weekSummary.workoutCount} workouts this week.`,
        type: 'badge',
        tier: weekSummary.badge,
      });
    }
  };

  const mostRecentWorkout = recentWorkouts.length > 0 ? recentWorkouts[0] : null;

  return (
    <div className="space-y-6">
      {/* Informational banners if triggered */}
      <BackupNudgeCard workoutCount={stats.totalWorkouts} />

      {/* Empty State when zero workouts */}
      {stats.totalWorkouts === 0 && (
        <EmptyState
          title="No workouts recorded yet"
          description="Log your first run, ride, strength session, or walk to ignite your streak."
          actionLabel="Log workout"
          onAction={onOpenLogger}
        />
      )}

      {/* 12-Column Desktop Grid */}
      <div className="grid grid-cols-12 gap-6 items-stretch">
        {/* ROW 1: StreakCard (col-span-12 xl:col-span-4) and StatsGrid (col-span-12 xl:col-span-8) */}
        <div className="col-span-12 xl:col-span-4 flex flex-col">
          <StreakCard streak={stats.streak} />
        </div>

        <div className="col-span-12 xl:col-span-8 flex flex-col">
          <StatsGrid
            totalWorkouts={stats.totalWorkouts}
            totalMinutes={stats.totalMinutes}
            thisWeekCount={stats.currentWeek.workoutCount}
            weeklyGoal={settings.weeklyGoal}
            breakdown={stats.breakdown}
          />
        </div>

        {/* ROW 2: WeekTracker with live weekly badge (col-span-12 xl:col-span-7) and Quick Log (col-span-12 xl:col-span-5) */}
        <div className="col-span-12 xl:col-span-7 flex flex-col justify-between">
          <WeekTracker
            currentWeek={stats.currentWeek}
            today={today}
            weeklyGoal={settings.weeklyGoal}
          />
        </div>

        <div className="col-span-12 xl:col-span-5 flex flex-col justify-center">
          {mostRecentWorkout ? (
            <QuickLogRow
              lastWorkout={mostRecentWorkout}
              today={today}
              onQuickLog={handleQuickLog}
            />
          ) : (
            <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] flex items-center justify-between text-xs text-[var(--text-muted)]">
              <span>Quick Log activates after your first session.</span>
              <button
                type="button"
                onClick={onOpenLogger}
                className="text-[var(--accent-text)] bg-[var(--accent-fill)] px-2.5 py-1 rounded-lg font-bold text-xs hover:brightness-105 cursor-pointer"
              >
                Log now
              </button>
            </div>
          )}
        </div>

        {/* ROW 3: Compact All-Time Heatmap Preview Card (col-span-12) */}
        <div className="col-span-12">
          <HeatmapPreviewCard
            workouts={allWorkouts}
            today={today}
            onNavigateToJourney={() => onNavigate('journey')}
          />
        </div>

        {/* ROW 4: ActivityChart 7-day (col-span-12 xl:col-span-7) and RecentActivityList (col-span-12 xl:col-span-5) */}
        <div className="col-span-12 xl:col-span-7 flex flex-col">
          <ActivityChart data={stats.last7Days} today={today} />
        </div>

        <div className="col-span-12 xl:col-span-5 flex flex-col">
          <RecentActivityList
            workouts={recentWorkouts}
            today={today}
            onEdit={onEditWorkout}
            onDelete={handleDeleteWorkout}
            onLogClick={onOpenLogger}
            onViewAll={() => onNavigate('journey')}
          />
        </div>
      </div>
    </div>
  );
};
