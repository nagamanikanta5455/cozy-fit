import React, { useState, useMemo } from 'react';
import { useToday } from '../hooks/useToday';
import { useStats, useRecentWorkouts } from '../store/selectors';
import { useAppStore } from '../store/useAppStore';
import { useToast } from '../components/ui/Toast';
import { StreakCard } from '../components/dashboard/StreakCard';
import { StatsGrid } from '../components/dashboard/StatsGrid';
import { WeekTracker } from '../components/dashboard/WeekTracker';
import { BadgeShelf } from '../components/dashboard/BadgeShelf';
import { ActivityChart } from '../components/dashboard/ActivityChart';
import { RecentActivityList } from '../components/dashboard/RecentActivityList';
import { QuickLogRow } from '../components/dashboard/QuickLogRow';
import { BackupNudgeCard } from '../components/dashboard/BackupNudgeCard';
import { InstallPromptCard } from '../components/ui/InstallPromptCard';
import { EmptyState } from '../components/ui/EmptyState';
import { LoggerModal } from '../components/logger/LoggerModal';
import { SettingsModal } from '../components/settings/SettingsModal';
import { JourneyModal } from '../components/journey/JourneyModal';
import { Workout, WorkoutType } from '../domain/types';
import { triggerHaptic } from '../utils/haptics';
import { calculateStreak } from '../../src/domain/streak';
import { buildWeekSummary, groupWorkoutsByWeek } from '../domain/badges';
import { getWeekStart } from '../domain/dates';
import { STREAK_MILESTONES } from '../domain/constants';
import { evaluateAchievements } from '../domain/achievements';
import { CalendarDays } from 'lucide-react';

interface DashboardPageProps {
  isLoggerOpen: boolean;
  onCloseLogger: () => void;
  onOpenLogger: () => void;
  isSettingsOpen: boolean;
  onCloseSettings: () => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  isLoggerOpen,
  onCloseLogger,
  onOpenLogger,
  isSettingsOpen,
  onCloseSettings,
}) => {
  const today = useToday();
  const stats = useStats(today);
  const recentWorkouts = useRecentWorkouts(10);
  const allWorkouts = useAppStore((state) => state.workouts);
  const settings = useAppStore((state) => state.settings);
  const achievementUnlockedDates = useAppStore((state) => state.achievementUnlockedDates);
  const addWorkout = useAppStore((state) => state.addWorkout);
  const deleteWorkout = useAppStore((state) => state.deleteWorkout);
  const restoreWorkout = useAppStore((state) => state.restoreWorkout);
  const queueCelebration = useAppStore((state) => state.queueCelebration);
  const { showToast, showUndoToast } = useToast();

  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);

  const achievements = useMemo(() => {
    return evaluateAchievements(
      allWorkouts,
      settings.priorStats,
      stats.streak.longest,
      achievementUnlockedDates || {}
    );
  }, [allWorkouts, settings.priorStats, stats.streak.longest, achievementUnlockedDates]);

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    onOpenLogger();
  };

  const handleDeleteWorkout = (workout: Workout) => {
    triggerHaptic('light');
    const deleted = deleteWorkout(workout.id);
    if (deleted) {
      showUndoToast(`Deleted ${workout.durationMin}m workout`, () => {
        triggerHaptic('light');
        restoreWorkout(deleted);
      });
    }
  };

  // Quick Log: One-tap repeat of last workout for today
  const handleQuickLog = (type: WorkoutType, durationMin: number) => {
    addWorkout({
      date: today,
      type,
      durationMin,
      note: 'Quick log',
    });
    triggerHaptic('success');
    showToast({
      type: 'success',
      title: 'Workout logged',
      description: `${durationMin}m session recorded for today.`,
    });

    // Gamification checks
    const streakInfo = calculateStreak(allWorkouts, today);

    if ((STREAK_MILESTONES as readonly number[]).includes(streakInfo.current)) {
      triggerHaptic('milestone');
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
      triggerHaptic('milestone');
      queueCelebration({
        id: `week:${currentWeekKey}:${weekSummary.badge}x`,
        title: `Earned ${weekSummary.badge}x Weekly Badge`,
        subtitle: `Completed ${weekSummary.workoutCount} workouts this week.`,
        type: 'badge',
        tier: weekSummary.badge,
      });
    }
  };

  const handleCloseModal = () => {
    setEditingWorkout(null);
    onCloseLogger();
  };

  const mostRecentWorkout = recentWorkouts.length > 0 ? recentWorkouts[0] : null;

  return (
    <div className="space-y-5">
      {/* Informational banners if triggered */}
      <InstallPromptCard workoutCount={stats.totalWorkouts} />
      <BackupNudgeCard workoutCount={stats.totalWorkouts} />

      {/* 1. Streak Block */}
      <StreakCard streak={stats.streak} />

      {/* 2. The Journey Entry Point */}
      <div
        onClick={() => {
          triggerHaptic('light');
          setIsJourneyOpen(true);
        }}
        className="rounded-xl p-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] hover:border-[var(--text-muted)] flex items-center justify-between gap-3 cursor-pointer transition-standard"
      >
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[var(--accent-fill)] flex items-center justify-center shrink-0">
            <CalendarDays className="w-4 h-4 stroke-[1.75]" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-[var(--text-primary)] truncate">
              The Journey
            </h4>
            <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
              All-time consistency heatmap ({allWorkouts.length} recorded sessions)
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            triggerHaptic('light');
            setIsJourneyOpen(true);
          }}
          className="px-3 py-1.5 min-h-[36px] rounded-lg bg-[var(--bg-surface-raised)] hover:bg-[var(--accent-fill)] hover:text-[#0E0F12] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer transition-standard shrink-0"
        >
          View Map
        </button>
      </div>

      {/* 3. 3 Stat Tiles with Prior Breakdown */}
      <StatsGrid
        totalWorkouts={stats.totalWorkouts}
        totalMinutes={stats.totalMinutes}
        thisWeekCount={stats.currentWeek.workoutCount}
        weeklyGoal={settings.weeklyGoal}
        breakdown={stats.breakdown}
      />

      {/* 4. This Week Tracker */}
      <WeekTracker
        currentWeek={stats.currentWeek}
        today={today}
        weeklyGoal={settings.weeklyGoal}
      />

      {/* 5. Quick Log */}
      {mostRecentWorkout && (
        <QuickLogRow
          lastWorkout={mostRecentWorkout}
          today={today}
          onQuickLog={handleQuickLog}
        />
      )}

      {/* Empty State when zero workouts */}
      {stats.totalWorkouts === 0 && (
        <EmptyState
          title="No workouts recorded yet"
          description="Log your first run, ride, strength session, or walk to ignite your streak."
          actionLabel="Log workout"
          onAction={() => {
            triggerHaptic('light');
            onOpenLogger();
          }}
        />
      )}

      {/* 6. 7-Day Activity Chart */}
      <ActivityChart data={stats.last7Days} today={today} />

      {/* 7. Badge Shelf with Weekly & Milestone Badges */}
      <BadgeShelf badgeHistory={stats.badgeHistory} achievements={achievements} />

      {/* 8. Recent Activity List */}
      <RecentActivityList
        workouts={recentWorkouts}
        today={today}
        onEdit={handleEditWorkout}
        onDelete={handleDeleteWorkout}
        onLogClick={() => {
          triggerHaptic('light');
          onOpenLogger();
        }}
      />

      {/* Logger Modal */}
      <LoggerModal
        isOpen={isLoggerOpen}
        onClose={handleCloseModal}
        today={today}
        editingWorkout={editingWorkout}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={onCloseSettings}
      />

      {/* The Journey Heatmap Modal */}
      <JourneyModal
        isOpen={isJourneyOpen}
        onClose={() => setIsJourneyOpen(false)}
        workouts={allWorkouts}
        today={today}
        longestStreak={stats.streak.longest}
        onOpenLogger={onOpenLogger}
      />
    </div>
  );
};
