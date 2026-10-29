import React from 'react';
import { Card } from '../ui/Card';
import { StreakInfo } from '../../domain/types';
import { getNextMilestone } from '../../domain/constants';

interface StreakCardProps {
  streak: StreakInfo;
}

export const StreakCard: React.FC<StreakCardProps> = ({ streak }) => {
  const nextTarget = getNextMilestone(streak.current);
  const prevMilestone =
    streak.current >= 30
      ? 30
      : streak.current >= 14
      ? 14
      : streak.current >= 7
      ? 7
      : streak.current >= 3
      ? 3
      : 0;

  const segmentProgress =
    nextTarget > prevMilestone
      ? Math.min(100, Math.max(0, ((streak.current - prevMilestone) / (nextTarget - prevMilestone)) * 100))
      : 100;

  return (
    <Card className="p-4 sm:p-5" variant="default">
      <div className="flex flex-col gap-4">
        {/* Top row: Label & Status */}
        <div className="flex items-center justify-between gap-2 min-w-0">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate">
            Daily Streak
          </span>
          <div className="flex items-center gap-2 shrink-0">
            {streak.longest > 0 && (
              <span className="text-xs font-medium text-[var(--text-faint)] tabular-nums">
                Best {streak.longest}d
              </span>
            )}
            <span
              className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold tabular-nums ${
                streak.isActiveToday
                  ? 'bg-[#4ADE80]/10 text-[#4ADE80]'
                  : streak.atRisk
                  ? 'bg-[#F87171]/10 text-[#F87171]'
                  : 'bg-[var(--bg-surface-raised)] text-[var(--text-muted)]'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  streak.isActiveToday
                    ? 'bg-[#4ADE80]'
                    : streak.atRisk
                    ? 'bg-[#F87171]'
                    : 'bg-[var(--text-faint)]'
                }`}
              />
              <span>
                {streak.isActiveToday
                  ? 'Active today'
                  : streak.atRisk
                  ? 'At risk today'
                  : 'Inactive'}
              </span>
            </span>
          </div>
        </div>

        {/* Big Typographic Number */}
        <div className="flex items-baseline gap-2.5 min-w-0">
          <span className="text-[clamp(2.5rem,8vw,3.5rem)] font-bold tracking-tight text-[var(--text-primary)] tabular-nums leading-none">
            {streak.current}
          </span>
          <span className="text-sm font-medium text-[var(--text-muted)] truncate">
            {streak.current === 1 ? 'day streak' : 'days streak'}
          </span>
        </div>

        {/* Milestone Segmented Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between text-xs text-[var(--text-faint)] tabular-nums">
            <span>Next milestone: {nextTarget} days</span>
            <span>{Math.max(0, nextTarget - streak.current)} days left</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-[var(--bg-surface-raised)] overflow-hidden">
            <div
              className="h-full bg-[var(--accent-fill)] rounded-full transition-standard"
              style={{ width: `${segmentProgress}%` }}
            />
          </div>
        </div>

        {/* Contextual notice */}
        <p className="text-xs text-[var(--text-muted)] truncate">
          {streak.isActiveToday
            ? 'Completed for today.'
            : streak.atRisk
            ? 'Log today before midnight to continue.'
            : 'Log today to start your streak.'}
        </p>
      </div>
    </Card>
  );
};
