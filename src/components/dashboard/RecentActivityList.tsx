import React from 'react';
import { Card } from '../ui/Card';
import { Workout, ISODate } from '../../domain/types';
import { WorkoutRow } from './WorkoutRow';
import { ChevronRight } from 'lucide-react';

interface RecentActivityListProps {
  workouts: Workout[];
  today: ISODate;
  onEdit: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
  onLogClick?: () => void;
  onViewAll?: () => void;
  maxDisplay?: number;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  workouts,
  today,
  onEdit,
  onDelete,
  onLogClick,
  onViewAll,
  maxDisplay = 6,
}) => {
  const displayedWorkouts = workouts.slice(0, maxDisplay);
  const hasMore = workouts.length > maxDisplay;

  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between" variant="default">
      <div>
        <div className="flex items-center justify-between mb-3 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate">
            Recent Activity
          </span>
          <span className="text-xs text-[var(--text-faint)] tabular-nums shrink-0">
            {workouts.length} {workouts.length === 1 ? 'entry' : 'entries'}
          </span>
        </div>

        {workouts.length > 0 ? (
          <div className="space-y-2">
            {displayedWorkouts.map((workout) => (
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
          <div className="py-8 px-4 rounded-xl bg-[var(--bg-surface-raised)]/30 border border-[var(--border-subtle)] text-center">
            <p className="text-xs text-[var(--text-muted)]">
              No workouts logged yet.
            </p>
            {onLogClick && (
              <button
                type="button"
                onClick={onLogClick}
                className="mt-2 text-xs font-bold text-black dark:text-black bg-[var(--accent-fill)] px-3 py-1.5 rounded-lg hover:brightness-105 active:opacity-95 cursor-pointer inline-block"
              >
                Log your first workout
              </button>
            )}
          </div>
        )}
      </div>

      {hasMore && (
        <div className="pt-3 mt-3 border-t border-[var(--border-subtle)] flex items-center justify-between">
          <span className="text-xs text-[var(--text-faint)] tabular-nums">
            Showing {maxDisplay} of {workouts.length} sessions
          </span>
          {onViewAll ? (
            <button
              type="button"
              onClick={onViewAll}
              className="text-xs font-semibold text-[var(--accent-fill)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all in Journey</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <a
              href="#journey"
              className="text-xs font-semibold text-[var(--accent-fill)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>View all in Journey</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </a>
          )}
        </div>
      )}
    </Card>
  );
};
