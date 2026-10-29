import React from 'react';
import { Card } from '../ui/Card';
import { StatTotals, PriorStats } from '../../domain/types';

interface StatsGridProps {
  totalWorkouts: number;
  totalMinutes: number;
  thisWeekCount: number;
  weeklyGoal: number;
  breakdown?: {
    logged: StatTotals;
    prior: PriorStats;
  };
}

export const StatsGrid: React.FC<StatsGridProps> = ({
  totalWorkouts,
  totalMinutes,
  thisWeekCount,
  weeklyGoal,
  breakdown,
}) => {
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  const hasPrior = breakdown?.prior && (breakdown.prior.totalWorkouts > 0 || breakdown.prior.totalMinutes > 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {/* 1. Total Workouts */}
      <Card className="p-4" variant="default">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-[var(--text-muted)] truncate">
            Total Workouts
          </span>
          {hasPrior && (
            <span className="text-[10px] font-semibold text-[var(--accent-text)] bg-[var(--accent-fill)]/15 px-1.5 py-0.2 rounded">
              +{breakdown?.prior.totalWorkouts} prior
            </span>
          )}
        </div>
        <div className="text-[clamp(1.5rem,6vw,2rem)] font-bold tracking-tight text-[var(--text-primary)] tabular-nums leading-none">
          {totalWorkouts}
        </div>
        <span className="block text-[11px] text-[var(--text-faint)] truncate mt-1.5 tabular-nums">
          {hasPrior
            ? `${breakdown?.logged.totalWorkouts} in app + ${breakdown?.prior.totalWorkouts} prior`
            : 'All-time sessions'}
        </span>
      </Card>

      {/* 2. Total Time */}
      <Card className="p-4" variant="default">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-[var(--text-muted)] truncate">
            Time Moved
          </span>
          {hasPrior && breakdown?.prior.totalMinutes ? (
            <span className="text-[10px] font-semibold text-[var(--accent-text)] bg-[var(--accent-fill)]/15 px-1.5 py-0.2 rounded">
              +{formatTime(breakdown.prior.totalMinutes)}
            </span>
          ) : null}
        </div>
        <div className="text-[clamp(1.5rem,6vw,2rem)] font-bold tracking-tight text-[var(--text-primary)] tabular-nums leading-none whitespace-nowrap">
          {formatTime(totalMinutes)}
        </div>
        <span className="block text-[11px] text-[var(--text-faint)] truncate mt-1.5 tabular-nums">
          {hasPrior
            ? `${formatTime(breakdown?.logged.totalMinutes || 0)} app + ${formatTime(breakdown?.prior.totalMinutes || 0)} prior`
            : `${totalMinutes} total min`}
        </span>
      </Card>

      {/* 3. This Week Sessions */}
      <Card className="p-4 col-span-2 sm:col-span-1" variant="default">
        <span className="block text-xs font-medium text-[var(--text-muted)] truncate mb-1">
          This Week
        </span>
        <div className="text-[clamp(1.5rem,6vw,2rem)] font-bold tracking-tight text-[var(--text-primary)] tabular-nums leading-none">
          {thisWeekCount}
          <span className="text-sm font-medium text-[var(--text-muted)] ml-1">
            / {weeklyGoal}
          </span>
        </div>
        <span className="block text-[11px] text-[var(--text-faint)] truncate mt-1.5 tabular-nums">
          {thisWeekCount >= weeklyGoal ? 'Target met' : `${weeklyGoal - thisWeekCount} remaining`}
        </span>
      </Card>
    </div>
  );
};
