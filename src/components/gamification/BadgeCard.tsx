import React from 'react';
import { WeekSummary } from '../../domain/types';
import { parseISODate } from '../../domain/dates';
import { format } from 'date-fns';

interface BadgeCardProps {
  summary: WeekSummary;
  isLive?: boolean;
}

export const BadgeCard: React.FC<BadgeCardProps> = ({ summary, isLive = false }) => {
  if (!summary.badge) return null;

  const tier = summary.badge;
  const startDate = parseISODate(summary.weekStart);
  const endDate = parseISODate(summary.weekEnd);
  const dateRangeStr = `${format(startDate, 'MMM d')} – ${format(endDate, 'MMM d')}`;

  return (
    <div
      className={`flex items-center justify-between p-3 rounded-lg border transition-standard select-none ${
        isLive
          ? 'bg-[var(--bg-surface-raised)] border-[var(--accent-fill)]'
          : 'bg-[var(--bg-surface-raised)]/60 border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
      }`}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {/* Flat rounded-rectangle tag with bold multiplier */}
        <div className="px-2.5 py-1 rounded bg-[var(--bg-surface)] border border-[var(--border-subtle)] text-xs font-bold text-[var(--text-primary)] tabular-nums shrink-0">
          <span className="text-[#C6F432] dark:text-[#C6F432] light:text-[#4D6B00]">
            {tier}x
          </span>
        </div>

        <div className="min-w-0">
          <p className="text-xs font-medium text-[var(--text-primary)] truncate">
            {dateRangeStr}
          </p>
          <p className="text-[11px] text-[var(--text-faint)] truncate tabular-nums mt-0.5">
            {summary.workoutCount} workouts / {summary.totalMinutes}m
          </p>
        </div>
      </div>

      {isLive && (
        <span className="text-[10px] uppercase font-bold text-[#C6F432] dark:text-[#C6F432] light:text-[#4D6B00] shrink-0">
          Current
        </span>
      )}
    </div>
  );
};
