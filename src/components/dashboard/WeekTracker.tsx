import React from 'react';
import { Card } from '../ui/Card';
import { WeekSummary, ISODate } from '../../domain/types';
import { getWeekDays, parseISODate } from '../../domain/dates';
import { format } from 'date-fns';

interface WeekTrackerProps {
  currentWeek: WeekSummary;
  today: ISODate;
  weeklyGoal: number;
}

export const WeekTracker: React.FC<WeekTrackerProps> = ({
  currentWeek,
  today,
  weeklyGoal,
}) => {
  const daysInWeek = getWeekDays(currentWeek.weekStart);
  const activeDaysSet = new Set(currentWeek.activeDays);

  const startFormatted = format(parseISODate(currentWeek.weekStart), 'MMM d');
  const endFormatted = format(parseISODate(currentWeek.weekEnd), 'MMM d');

  const badgeTier = currentWeek.badge;
  const dayInitials = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <Card className="p-4 sm:p-5" variant="default">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-sm font-semibold tracking-tight text-[var(--text-primary)] truncate">
              This Week
            </h3>
            <span className="text-xs text-[var(--text-faint)] tabular-nums">
              {startFormatted} – {endFormatted}
            </span>
          </div>
        </div>

        {/* Live Badge Tag */}
        {badgeTier ? (
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[var(--bg-surface-raised)] border border-[var(--accent-fill)] text-xs font-bold text-[var(--text-primary)] shrink-0">
            <span className="text-[#C6F432] dark:text-[#C6F432] light:text-[#4D6B00] tabular-nums">
              {badgeTier}x
            </span>
            <span className="text-[11px] font-medium text-[var(--text-muted)]">Badge Live</span>
          </div>
        ) : (
          <div className="text-xs text-[var(--text-faint)] tabular-nums shrink-0">
            {2 - currentWeek.workoutCount} more for 2x
          </div>
        )}
      </div>

      {/* 7-Day Grid: aspect-square, min-w-0 */}
      <div className="grid grid-cols-7 gap-1.5">
        {daysInWeek.map((dayIso, idx) => {
          const dateObj = parseISODate(dayIso);
          const dayNum = dateObj.getDate();
          const isToday = dayIso === today;
          const isActive = activeDaysSet.has(dayIso);

          return (
            <div
              key={dayIso}
              className={`aspect-square min-w-0 flex flex-col items-center justify-center rounded-lg border text-center transition-standard ${
                isToday
                  ? 'border-[var(--accent-fill)] bg-[var(--bg-surface-raised)]'
                  : 'border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]/40'
              }`}
            >
              <span className="text-[10px] font-semibold text-[var(--text-faint)]">
                {dayInitials[idx]}
              </span>
              <span
                className={`text-xs font-bold tabular-nums my-0.5 ${
                  isToday
                    ? 'text-[#C6F432] dark:text-[#C6F432] light:text-[#4D6B00]'
                    : 'text-[var(--text-primary)]'
                }`}
              >
                {dayNum}
              </span>

              {/* Minimal Dot */}
              <div
                className={`w-1.5 h-1.5 rounded-full ${
                  isActive
                    ? 'bg-[#4ADE80]'
                    : 'bg-transparent'
                }`}
              />
            </div>
          );
        })}
      </div>

      {/* Goal Progress bar */}
      <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] space-y-1.5">
        <div className="flex items-center justify-between text-xs text-[var(--text-muted)] tabular-nums">
          <span>Weekly target</span>
          <span>
            {currentWeek.workoutCount} of {weeklyGoal} workouts
          </span>
        </div>
        <div className="w-full h-1.5 rounded-full bg-[var(--bg-surface-raised)] overflow-hidden">
          <div
            className="h-full bg-[var(--accent-fill)] rounded-full transition-standard"
            style={{
              width: `${Math.min(100, Math.max(0, (currentWeek.workoutCount / weeklyGoal) * 100))}%`,
            }}
          />
        </div>
      </div>
    </Card>
  );
};
