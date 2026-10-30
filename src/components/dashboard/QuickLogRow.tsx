import React from 'react';
import { Workout, ISODate } from '../../domain/types';
import { WORKOUT_TYPES } from '../../domain/constants';
import { WorkoutIcon } from '../ui/WorkoutIcon';

interface QuickLogRowProps {
  lastWorkout: Workout | null;
  today: ISODate;
  onQuickLog: (type: Workout['type'], durationMin: number) => void;
}

export const QuickLogRow: React.FC<QuickLogRowProps> = ({
  lastWorkout,
  onQuickLog,
}) => {
  if (!lastWorkout) return null;

  const meta = WORKOUT_TYPES[lastWorkout.type] || WORKOUT_TYPES.other;

  const handleClick = () => {
    onQuickLog(lastWorkout.type, lastWorkout.durationMin);
  };

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface)] p-3.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
          <WorkoutIcon iconKey={meta.iconKey} size={18} />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-primary)] truncate">
              Repeat {meta.label}
            </span>
            <span className="text-xs text-[var(--text-faint)] tabular-nums shrink-0">
              {lastWorkout.durationMin}m
            </span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
            Log today with one click
          </p>
        </div>
      </div>

      <button
        type="button"
        onClick={handleClick}
        aria-label={`Quick log ${meta.label} for ${lastWorkout.durationMin} minutes`}
        className="px-3.5 py-1.5 h-8 rounded-lg bg-[var(--accent-fill)] hover:brightness-105 active:opacity-95 text-black dark:text-black font-bold text-xs shadow-xs cursor-pointer transition-standard shrink-0 whitespace-nowrap"
      >
        Log
      </button>
    </div>
  );
};
