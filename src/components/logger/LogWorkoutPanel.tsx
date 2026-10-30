import React, { useEffect, useRef } from 'react';
import { WorkoutForm, WorkoutFormData } from './WorkoutForm';
import { Workout, ISODate } from '../../domain/types';
import { useAppStore } from '../../store/useAppStore';
import { useToast } from '../ui/Toast';
import { calculateStreak } from '../../domain/streak';
import { buildWeekSummary, groupWorkoutsByWeek } from '../../domain/badges';
import { getWeekStart } from '../../domain/dates';
import { STREAK_MILESTONES } from '../../domain/constants';
import { evaluateAchievements } from '../../domain/achievements';
import { X } from 'lucide-react';
import { Z_INDEX } from '../../constants/zIndex';

interface LogWorkoutPanelProps {
  isOpen: boolean;
  onClose: () => void;
  today: ISODate;
  editingWorkout?: Workout | null;
}

export const LogWorkoutPanel: React.FC<LogWorkoutPanelProps> = ({
  isOpen,
  onClose,
  today,
  editingWorkout,
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerElementRef = useRef<HTMLElement | null>(null);

  const addWorkout = useAppStore((state) => state.addWorkout);
  const updateWorkout = useAppStore((state) => state.updateWorkout);
  const queueCelebration = useAppStore((state) => state.queueCelebration);
  const unlockAchievement = useAppStore((state) => state.unlockAchievement);
  const { showToast } = useToast();

  const isEditing = Boolean(editingWorkout);

  // Store trigger element and manage body scroll
  useEffect(() => {
    if (isOpen) {
      triggerElementRef.current = document.activeElement as HTMLElement | null;
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (triggerElementRef.current && typeof triggerElementRef.current.focus === 'function') {
        triggerElementRef.current.focus();
      }
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  // Escape key handler and focus trap
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && panelRef.current) {
        const focusableElements = panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

        if (focusableElements.length === 0) {
          e.preventDefault();
          return;
        }

        const first = focusableElements[0];
        const last = focusableElements[focusableElements.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    // Initial focus on first field
    const timer = setTimeout(() => {
      if (panelRef.current) {
        const firstInput = panelRef.current.querySelector<HTMLElement>('input, button');
        firstInput?.focus();
      }
    }, 50);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      clearTimeout(timer);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (data: WorkoutFormData) => {
    if (editingWorkout) {
      updateWorkout(editingWorkout.id, data);
      showToast({
        type: 'success',
        title: 'Workout updated',
      });
      onClose();
    } else {
      addWorkout(data);
      showToast({
        type: 'success',
        title: 'Workout saved',
        description: `${data.durationMin}m logged`,
      });
      onClose();

      const storeState = useAppStore.getState();
      const allWorkouts = storeState.workouts;
      const priorStats = storeState.settings.priorStats;
      const streakInfo = calculateStreak(allWorkouts, today);
      const effectiveLongest = Math.max(streakInfo.longest, priorStats?.longestStreak || 0);

      // Streak milestone celebration
      if ((STREAK_MILESTONES as readonly number[]).includes(streakInfo.current)) {
        queueCelebration({
          id: `streak:${streakInfo.current}`,
          title: `${streakInfo.current} day streak reached`,
          subtitle: `${streakInfo.current} consecutive active days`,
          type: 'streak',
          tier: streakInfo.current,
        });
      }

      // Weekly badge celebration
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
        queueCelebration({
          id: `week:${currentWeekKey}:${weekSummary.badge}x`,
          title: `${weekSummary.badge}x badge earned`,
          subtitle: `${weekSummary.workoutCount} workouts this week`,
          type: 'badge',
          tier: weekSummary.badge,
        });
      }

      // Achievements milestone check
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
          queueCelebration({
            id: `achievement:${ach.id}`,
            title: `${ach.title} Unlocked`,
            subtitle: ach.description,
            type: 'badge',
          });
        }
      }
    }
  };

  return (
    <>
      {/* Drawer Backdrop (z-40) */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-160 ${Z_INDEX.drawerBackdrop}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel (z-50): 420px wide, right-aligned, 160ms slide-in */}
      <aside
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="drawer-title"
        className={`fixed top-0 right-0 bottom-0 h-full w-[420px] max-w-full bg-[var(--bg-surface)] border-l border-[var(--border-subtle)] shadow-2xl flex flex-col justify-between overflow-hidden transition-transform duration-160 ease-out translate-x-0 ${Z_INDEX.drawerAndDialogs}`}
      >
        {/* Panel Header */}
        <div className="px-6 py-4 border-b border-[var(--border-subtle)] flex items-center justify-between shrink-0 bg-[var(--bg-surface)]">
          <div>
            <h2 id="drawer-title" className="text-base font-bold tracking-tight text-[var(--text-primary)]">
              {isEditing ? 'Edit Workout' : 'Log Workout'}
            </h2>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              {isEditing ? 'Modify recorded session details.' : 'Record a new movement session.'}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            title="Close (Esc)"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel Body: internally scrollable */}
        <div className="p-6 overflow-y-auto flex-1 overscroll-contain">
          <WorkoutForm
            today={today}
            initialWorkout={editingWorkout}
            onSubmit={handleSubmit}
            onCancel={onClose}
          />
        </div>
      </aside>
    </>
  );
};
