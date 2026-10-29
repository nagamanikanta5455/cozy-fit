import React, { useState, useMemo, useLayoutEffect, useRef } from 'react';
import { Workout, ISODate } from '../../domain/types';
import {
  HeatmapDay,
  HeatmapWeek,
  buildHeatmapWeeks,
  getMonthLabels,
} from '../../domain/history';
import { formatFriendlyDate, parseISODate } from '../../domain/dates';
import { format } from 'date-fns';
import { Button } from '../ui/Button';
import { Activity, Flame, Plus } from 'lucide-react';

interface AllTimeHeatmapProps {
  workouts: Workout[];
  today: ISODate;
  longestStreak: number;
  onOpenLogger: () => void;
}

const WEEKDAY_LABELS = [
  { index: 0, label: 'Mon' },
  { index: 2, label: 'Wed' },
  { index: 4, label: 'Fri' },
];

interface HeatCellProps {
  day: HeatmapDay;
  isSelected: boolean;
  onSelect: (day: HeatmapDay) => void;
}

const HeatCell = React.memo<HeatCellProps>(({ day, isSelected, onSelect }) => {
  const formattedDate = format(parseISODate(day.date), 'EEE, MMM d, yyyy');
  const label = day.isFuture
    ? `${formattedDate} - Future`
    : day.count > 0
    ? `${formattedDate} - ${day.count} workout${day.count === 1 ? '' : 's'}, ${day.minutes}m`
    : `${formattedDate} - No workouts`;

  // Intensity color style using semantic CSS variables
  const bgStyle: React.CSSProperties = {
    backgroundColor: day.isFuture ? 'transparent' : `var(--heat-${day.intensity})`,
  };

  return (
    <button
      type="button"
      onClick={() => onSelect(day)}
      disabled={day.isFuture}
      aria-label={label}
      style={bgStyle}
      className={`w-[14px] h-[14px] rounded-[3px] border border-[var(--heat-border)] transition-standard cursor-pointer relative shrink-0 ${
        day.isFuture
          ? 'opacity-20 cursor-not-allowed border-dashed'
          : 'hover:brightness-110'
      } ${
        day.isToday ? 'ring-2 ring-[var(--accent-fill)] z-10' : ''
      } ${
        isSelected ? 'ring-2 ring-white dark:ring-white z-20 scale-110 shadow-xs' : ''
      }`}
    />
  );
});

HeatCell.displayName = 'HeatCell';

export const AllTimeHeatmap: React.FC<AllTimeHeatmapProps> = ({
  workouts,
  today,
  longestStreak,
  onOpenLogger,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Memoize weeks grid calculation
  const weeks = useMemo(() => {
    return buildHeatmapWeeks(workouts, today);
  }, [workouts, today]);

  // Month header labels
  const monthLabels = useMemo(() => {
    return getMonthLabels(weeks);
  }, [weeks]);

  // Total active days
  const activeDays = useMemo(() => {
    const dates = new Set<string>();
    for (const w of workouts) {
      dates.add(w.date);
    }
    return dates.size;
  }, [workouts]);

  // Selected cell for mobile tap-to-inspect
  const [selectedDay, setSelectedDay] = useState<HeatmapDay | null>(null);

  // Auto-scroll to far right (today) on mount so latest weeks appear first
  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth;
    }
  }, [weeks]);

  if (workouts.length === 0) {
    return (
      <div className="py-8 px-4 text-center space-y-4">
        <div className="w-12 h-12 mx-auto rounded-xl bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)]">
          <Activity className="w-6 h-6 stroke-[1.75]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-semibold text-[var(--text-primary)]">
            Your journey begins here
          </h3>
          <p className="text-xs text-[var(--text-muted)] max-w-xs mx-auto leading-relaxed">
            Every workout you log kindles your all-time consistency map.
          </p>
        </div>
        <Button
          onClick={onOpenLogger}
          variant="primary"
          size="sm"
          leftIcon={<Plus className="w-4 h-4" />}
        >
          Log first workout
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary line */}
      <div className="flex items-center justify-between gap-2 text-xs flex-wrap pb-3 border-b border-[var(--border-subtle)]">
        <div className="flex items-center gap-4 text-[var(--text-muted)]">
          <div>
            <span className="font-bold text-[var(--text-primary)] tabular-nums">
              {workouts.length}
            </span>{' '}
            workouts
          </div>
          <div>
            <span className="font-bold text-[var(--text-primary)] tabular-nums">
              {activeDays}
            </span>{' '}
            active days
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
          <Flame className="w-3.5 h-3.5 text-[var(--accent-fill)]" />
          <span>Longest streak:</span>
          <span className="font-bold text-[var(--text-primary)] tabular-nums">
            {longestStreak}d
          </span>
        </div>
      </div>

      {/* Heatmap Grid Container */}
      <div className="relative">
        <div className="flex">
          {/* Sticky left day labels */}
          <div className="pr-2 pt-[22px] flex flex-col justify-between h-[116px] text-[10px] font-semibold text-[var(--text-faint)] select-none shrink-0">
            <span className="h-[14px] leading-[14px]">Mon</span>
            <span className="h-[14px] leading-[14px]">Wed</span>
            <span className="h-[14px] leading-[14px]">Fri</span>
          </div>

          {/* Horizontally scrollable grid container */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto touch-pan-x pb-2"
            style={{ WebkitOverflowScrolling: 'touch', scrollSnapType: 'none' }}
          >
            {/* Month Header row */}
            <div
              className="relative h-5 mb-1 select-none text-[10px] font-semibold text-[var(--text-muted)]"
              style={{ width: `${weeks.length * 17}px` }}
            >
              {monthLabels.map((m) => (
                <div
                  key={`${m.weekIndex}-${m.label}`}
                  className="absolute top-0 whitespace-nowrap"
                  style={{ left: `${m.weekIndex * 17}px` }}
                >
                  {m.label}
                </div>
              ))}
            </div>

            {/* 7-row CSS Grid */}
            <div
              className="grid grid-rows-7 grid-flow-col gap-[3px]"
              style={{ width: `${weeks.length * 17 - 3}px` }}
            >
              {weeks.map((week) =>
                week.days.map((day) => (
                  <HeatCell
                    key={day.date}
                    day={day}
                    isSelected={selectedDay?.date === day.date}
                    onSelect={(d) => setSelectedDay(d)}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tap-to-Inspect Detail Line */}
      <div className="min-h-[38px] px-3 py-2 rounded-xl bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 text-xs">
        {selectedDay ? (
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-semibold text-[var(--text-primary)] truncate">
              {format(parseISODate(selectedDay.date), 'EEE, MMM d, yyyy')}
            </span>
            <span className="text-[var(--text-muted)] shrink-0">
              {selectedDay.count > 0
                ? `${selectedDay.count} workout${selectedDay.count === 1 ? '' : 's'}, ${selectedDay.minutes}m`
                : 'No workouts'}
            </span>
          </div>
        ) : (
          <span className="text-[var(--text-faint)]">
            Tap any cell to inspect activity details
          </span>
        )}

        {selectedDay?.isToday && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent-fill)] shrink-0">
            Today
          </span>
        )}
      </div>

      {/* Legend Row */}
      <div className="flex items-center justify-end gap-1.5 text-[11px] text-[var(--text-muted)] select-none pt-1">
        <span>Less</span>
        <div className="flex items-center gap-[3px]">
          <span
            className="w-3 h-3 rounded-[2px] border border-[var(--heat-border)]"
            style={{ backgroundColor: 'var(--heat-0)' }}
          />
          <span
            className="w-3 h-3 rounded-[2px] border border-[var(--heat-border)]"
            style={{ backgroundColor: 'var(--heat-1)' }}
          />
          <span
            className="w-3 h-3 rounded-[2px] border border-[var(--heat-border)]"
            style={{ backgroundColor: 'var(--heat-2)' }}
          />
          <span
            className="w-3 h-3 rounded-[2px] border border-[var(--heat-border)]"
            style={{ backgroundColor: 'var(--heat-3)' }}
          />
        </div>
        <span>More</span>
      </div>
    </div>
  );
};
