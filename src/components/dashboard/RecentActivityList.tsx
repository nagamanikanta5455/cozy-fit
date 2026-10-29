import React from 'react';
import { Card } from '../ui/Card';
import { Workout, ISODate } from '../../domain/types';
import { WorkoutRow } from './WorkoutRow';

interface RecentActivityListProps {
  workouts: Workout[];
  today: ISODate;
  onEdit: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
  onLogClick?: () => void;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  workouts,
  today,
  onEdit,
  onDelete,
  onLogClick,
}) => {
  return (
    <Card className="p-4 sm:p-5" variant="default">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate">
          Recent Activity
        </span>
        <span className="text-xs text-[var(--text-faint)] tabular-nums shrink-0">
          {workouts.length} {workouts.length === 1 ? 'entry' : 'entries'}
        </span>
      </div>

      {workouts.length > 0 ? (
        <div className="divide-y divide-[var(--border-subtle)]">
          {workouts.map((workout) => (
            <WorkoutRow
              key={workout.id}
              workout={workout}
              today={today}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      ) : (
        <div className="py-6 px-3 rounded-lg bg-[var(--bg-surface-raised)]/30 border border-[var(--border-subtle)] text-center">
          <p className="text-xs text-[var(--text-muted)]">
            No workouts logged yet.
          </p>
          {onLogClick && (
            <button
              type="button"
              onClick={onLogClick}
              className="mt-2 text-xs font-semibold text-[#C6F432] dark:text-[#C6F432] light:text-[#4D6B00] hover:underline cursor-pointer"
            >
              Log your first workout
            </button>
          )}
        </div>
      )}
    </Card>
  );
};
