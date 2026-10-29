import React from 'react';
import { Button } from './Button';
import { Plus, Activity } from 'lucide-react';

interface EmptyStateProps {
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = 'No workouts yet',
  description = 'Log your first session to start your streak.',
  actionLabel = 'Log Workout',
  onAction,
}) => {
  return (
    <div className="py-10 px-4 text-center max-w-sm mx-auto flex flex-col items-center">
      <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] mb-3">
        <Activity className="w-5 h-5 stroke-[1.75]" />
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)]">
        {title}
      </h3>
      <p className="text-xs text-[var(--text-muted)] mt-1 mb-5 leading-normal">
        {description}
      </p>
      {onAction && (
        <Button
          onClick={onAction}
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
};
