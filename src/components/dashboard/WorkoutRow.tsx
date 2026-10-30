import React from 'react';
import { Workout, ISODate } from '../../domain/types';
import { WORKOUT_TYPES } from '../../domain/constants';
import { formatFriendlyDate } from '../../domain/dates';
import { WorkoutIcon } from '../ui/WorkoutIcon';
import { Edit2, Trash2 } from 'lucide-react';

interface WorkoutRowProps {
  workout: Workout;
  today: ISODate;
  onEdit: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
}

export const WorkoutRow: React.FC<WorkoutRowProps> = ({
  workout,
  today,
  onEdit,
  onDelete,
}) => {
  const meta = WORKOUT_TYPES[workout.type] || WORKOUT_TYPES.other;
  const dateStr = formatFriendlyDate(workout.date, today);

  return (
    <div className="group relative flex items-center justify-between gap-3 py-2.5 px-3 rounded-xl bg-[var(--bg-surface)] hover:bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] transition-standard">
      {/* [type icon] */}
      <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
        <WorkoutIcon iconKey={meta.iconKey} size={16} />
      </div>

      {/* [title + meta, min-w-0 truncate] */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="text-xs font-semibold text-[var(--text-primary)] truncate">
            {meta.label}
          </h4>
          <span className="text-[11px] text-[var(--text-faint)] tabular-nums shrink-0">
            {dateStr}
          </span>
        </div>

        {workout.note && (
          <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5 break-words">
            {workout.note}
          </p>
        )}
      </div>

      {/* [duration, shrink-0] */}
      <div className="text-xs font-semibold text-[var(--text-primary)] tabular-nums shrink-0 whitespace-nowrap">
        {workout.durationMin}m
      </div>

      {/* [actions, shrink-0] - hover/focus visible, accessible by Tab */}
      <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-visible:opacity-100 transition-opacity">
        <button
          type="button"
          onClick={() => onEdit(workout)}
          aria-label={`Edit ${meta.label} on ${dateStr}`}
          title="Edit workout"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-colors cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          type="button"
          onClick={() => onDelete(workout)}
          aria-label={`Delete ${meta.label} on ${dateStr}`}
          title="Delete workout"
          className="h-8 w-8 rounded-lg flex items-center justify-center text-[var(--text-muted)] hover:text-[#F87171] hover:bg-[#F87171]/10 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
