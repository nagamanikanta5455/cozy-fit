import React from 'react';
import { Modal } from '../ui/Modal';
import { WorkoutForm } from './WorkoutForm';
import { Workout, ISODate, WorkoutType, HHmm } from '../../domain/types';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../ui/Toast';
import { calculateStreak } from '../../domain/streak';
import { buildWeekSummary, groupWorkoutsByWeek } from '../../domain/badges';
import { getWeekStart } from '../../domain/dates';
import { STREAK_MILESTONES } from '../../domain/constants';
import { evaluateAchievements } from '../../domain/achievements';
import { triggerHaptic } from '../../utils/haptics';

interface LoggerModalProps {
  isOpen: boolean;
  onClose: () => void;
  today: ISODate;
  editingWorkout?: Workout | null;
}

export const LoggerModal: React.FC<LoggerModalProps> = ({
  isOpen,
  onClose,
  today,
  editingWorkout,
}) => {
  const addWorkout = useAppStore((state) => state.addWorkout);
  const updateWorkout = useAppStore((state) => state.updateWorkout);
  const queueCelebration = useAppStore((state) => state.queueCelebration);
  const unlockAchievement = useAppStore((state) => state.unlockAchievement);
  const { showToast } = useToast();

  const handleSubmit = (data: {
    date: ISODate;
    type: WorkoutType;
    durationMin: number;
    startTime?: HHmm;
    sets?: number;
    reps?: number;
    note?: string;
  }) => {
    if (editingWorkout) {
      updateWorkout(editingWorkout.id, data);
      triggerHaptic('success');
      showToast({
        type: 'success',
        title: 'Workout updated',
      });
    } else {
      addWorkout(data);
      triggerHaptic('success');
      showToast({
        type: 'success',
        title: 'Workout saved',
        description: `${data.durationMin}m logged`,
      });

      const storeState = useAppStore.getState();
      const allWorkouts = storeState.workouts;
      const priorStats = storeState.settings.priorStats;
      const streakInfo = calculateStreak(allWorkouts, today);
      const effectiveLongest = Math.max(streakInfo.longest, priorStats?.longestStreak || 0);

      // Streak milestone check
      if ((STREAK_MILESTONES as readonly number[]).includes(streakInfo.current)) {
        triggerHaptic('milestone');
        queueCelebration({
          id: `streak:${streakInfo.current}`,
          title: `${streakInfo.current} day streak reached`,
          subtitle: `${streakInfo.current} consecutive active days`,
          type: 'streak',
          tier: streakInfo.current,
        });
      }

      // Weekly badge check
      const currentWeekKey = getWeekStart(today);
      const groups = groupWorkoutsByWeek(allWorkouts);
      const currentWeekWorkouts = groups.get(currentWeekKey) || [];
      const weekSummary = buildWeekSummary(
        currentWeekKey,
        currentWeekWorkouts,
        today,
        storeState.settings.weeklyGoal
      );

      if (weekSummary.badge) {
        triggerHaptic('milestone');
        queueCelebration({
          id: `week:${currentWeekKey}:${weekSummary.badge}x`,
          title: `${weekSummary.badge}x badge earned`,
          subtitle: `${weekSummary.workoutCount} workouts this week`,
          type: 'badge',
          tier: weekSummary.badge,
        });
      }

      // Achievements check
      const currentUnlocked = storeState.unlockedAchievements || [];
      const evaluated = evaluateAchievements(
        allWorkouts,
        priorStats,
        effectiveLongest,
        storeState.achievementUnlockedDates || {}
      );

      for (const ach of evaluated) {
        if (ach.unlockedAt && !currentUnlocked.includes(ach.id)) {
          unlockAchievement(ach.id, ach.unlockedAt);
          triggerHaptic('milestone');
          queueCelebration({
            id: `achievement:${ach.id}`,
            title: `${ach.title} Unlocked`,
            subtitle: ach.description,
            type: 'badge',
          });
        }
      }
    }

    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingWorkout ? 'Edit Workout' : 'Log Workout'}
      description={editingWorkout ? 'Update session details' : 'Record activity'}
      maxWidth="md"
    >
      <WorkoutForm
        today={today}
        initialWorkout={editingWorkout}
        onSubmit={handleSubmit}
        onCancel={onClose}
      />
    </Modal>
  );
};
