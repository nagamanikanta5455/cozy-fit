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

  const hasPrior =
    breakdown?.prior &&
    (breakdown.prior.totalWorkouts > 0 || breakdown.prior.totalMinutes > 0);

  const goalProgress = weeklyGoal > 0 ? Math.min(100, Math.round((thisWeekCount / weeklyGoal) * 100)) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 h-full">
      {/* 1. Total Workouts */}
      <Card className="p-3.5 flex flex-col justify-between" variant="default">
        <div>
          <div className="flex items-center justify-between mb-1 min-w-0">
            <span className="text-xs font-medium text-[var(--text-muted)] truncate">
              Total Workouts
            </span>
            {hasPrior && (
              <span className="text-[10px] font-semibold text-[var(--accent-text)] bg-[var(--accent-fill)]/15 px-1.5 py-0.5 rounded shrink-0">
                +{breakdown?.prior.totalWorkouts} prior
              </span>
            )}
          </div>
          <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)] tabular-nums leading-tight">
            {totalWorkouts}
          </div>
        </div>
        <span className="block text-[11px] text-[var(--text-faint)] truncate mt-1.5 tabular-nums">
          {hasPrior
            ? `${breakdown?.logged.totalWorkouts} in app + ${breakdown?.prior.totalWorkouts} prior`
            : 'All-time sessions'}
        </span>
      </Card>

      {/* 2. Total Time */}
      <Card className="p-3.5 flex flex-col justify-between" variant="default">
        <div>
          <div className="flex items-center justify-between mb-1 min-w-0">
            <span className="text-xs font-medium text-[var(--text-muted)] truncate">
              Time Moved
            </span>
            {hasPrior && breakdown?.prior.totalMinutes ? (
              <span className="text-[10px] font-semibold text-[var(--accent-text)] bg-[var(--accent-fill)]/15 px-1.5 py-0.5 rounded shrink-0">
                +{formatTime(breakdown.prior.totalMinutes)}
              </span>
            ) : null}
          </div>
          <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)] tabular-nums leading-tight whitespace-nowrap">
            {formatTime(totalMinutes)}
          </div>
        </div>
        <span className="block text-[11px] text-[var(--text-faint)] truncate mt-1.5 tabular-nums">
          {hasPrior
            ? `${formatTime(breakdown?.logged.totalMinutes || 0)} app + ${formatTime(breakdown?.prior.totalMinutes || 0)} prior`
            : `${totalMinutes} total min`}
        </span>
      </Card>

      {/* 3. This Week Sessions */}
      <Card className="p-3.5 flex flex-col justify-between" variant="default">
        <div>
          <div className="flex items-center justify-between mb-1 min-w-0">
            <span className="text-xs font-medium text-[var(--text-muted)] truncate">
              This Week
            </span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-[var(--text-primary)] tabular-nums leading-tight">
            {thisWeekCount}
            <span className="text-xs font-normal text-[var(--text-muted)] ml-1">
              / {weeklyGoal}
            </span>
          </div>
        </div>
        <span className="block text-[11px] text-[var(--text-faint)] truncate mt-1.5 tabular-nums">
          {thisWeekCount >= weeklyGoal ? 'Goal achieved' : `${weeklyGoal - thisWeekCount} to target`}
        </span>
      </Card>

      {/* 4. Weekly Goal Progress */}
      <Card className="p-3.5 flex flex-col justify-between" variant="default">
        <div>
          <div className="flex items-center justify-between mb-1 min-w-0">
            <span className="text-xs font-medium text-[var(--text-muted)] truncate">
              Goal Progress
            </span>
            <span className="text-[11px] font-semibold text-[var(--accent-text)] tabular-nums">
              {goalProgress}%
            </span>
          </div>
          <div className="h-2 w-full bg-[var(--bg-surface-raised)] rounded-full overflow-hidden mt-3 border border-[var(--border-subtle)]">
            <div
              className="h-full bg-[var(--accent-fill)] rounded-full transition-standard"
              style={{ width: `${goalProgress}%` }}
            />
          </div>
        </div>
        <span className="block text-[11px] text-[var(--text-faint)] truncate mt-1.5 tabular-nums">
          {thisWeekCount >= weeklyGoal ? 'Multiplier active' : `${weeklyGoal} sessions targeted`}
        </span>
      </Card>
    </div>
  );
};
