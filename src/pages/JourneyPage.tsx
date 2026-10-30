import React, { useState, useMemo, useLayoutEffect, useRef, useEffect } from 'react';
import { Card } from '../components/ui/Card';
import { Workout, ISODate } from '../domain/types';
import {
  HeatmapDay,
  buildHeatmapWeeks,
  getMonthLabels,
} from '../domain/history';
import { parseISODate } from '../domain/dates';
import { ChevronLeft, ChevronRight, Flame, Calendar, Activity } from 'lucide-react';

const formatTooltipDate = (d: Date): string =>
  d.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });

const formatAriaDate = (d: Date): string =>
  d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });

const formatDetailDate = (d: Date): string =>
  d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

interface JourneyPageProps {
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

export const JourneyPage: React.FC<JourneyPageProps> = ({
  workouts,
  today,
  longestStreak,
  onOpenLogger,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Selected cell for pinned inspection
  const [pinnedDay, setPinnedDay] = useState<HeatmapDay | null>(null);
  // Hovered cell for floating tooltip
  const [hoveredDay, setHoveredDay] = useState<{
    day: HeatmapDay;
    x: number;
    y: number;
  } | null>(null);

  // Selected year filter (or 'all')
  const [selectedYear, setSelectedYear] = useState<string>('all');

  // Build full heatmap weeks
  const allWeeks = useMemo(() => {
    return buildHeatmapWeeks(workouts, today);
  }, [workouts, today]);

  // Extract all distinct years with activity (plus current year)
  const years = useMemo(() => {
    const yearSet = new Set<string>();
    const currentYear = today.slice(0, 4);
    yearSet.add(currentYear);
    for (const w of workouts) {
      yearSet.add(w.date.slice(0, 4));
    }
    return Array.from(yearSet).sort();
  }, [workouts, today]);

  // Month header labels
  const monthLabels = useMemo(() => {
    return getMonthLabels(allWeeks);
  }, [allWeeks]);

  // Total active days count
  const activeDays = useMemo(() => {
    const dates = new Set<string>();
    for (const w of workouts) {
      dates.add(w.date);
    }
    return dates.size;
  }, [workouts]);

  // Auto-scroll to far right (today) on mount
  useLayoutEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollLeft = el.scrollWidth;
    }
  }, [allWeeks]);

  // Enable mouse wheel and shift+wheel horizontal scrolling
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // If user is scrolling vertically with mouse wheel without holding shift, scroll horizontally
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && !e.shiftKey) {
        el.scrollLeft += e.deltaY;
        e.preventDefault();
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Scroll by 8 weeks (8 * (16 + 4) = 160px)
  const handleScrollWeeks = (direction: 'left' | 'right') => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distance = 8 * 20; // 8 weeks * 20px (16px cell + 4px gap)
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  // Scroll to a specific year
  const handleScrollToYear = (year: string) => {
    setSelectedYear(year);
    const el = scrollContainerRef.current;
    if (!el) return;

    if (year === 'all') {
      el.scrollTo({ left: el.scrollWidth, behavior: 'smooth' });
      return;
    }

    // Find the first week index belonging to this year
    const weekIdx = allWeeks.findIndex((w) =>
      w.days.some((d) => d.date.startsWith(year))
    );

    if (weekIdx !== -1) {
      el.scrollTo({ left: weekIdx * 20, behavior: 'smooth' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            The Journey
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            All-time consistency heatmap and lifetime movement records.
          </p>
        </div>

        {/* Year Filter Chips */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => handleScrollToYear('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-standard ${
              selectedYear === 'all'
                ? 'bg-[var(--accent-fill)] text-[#0E0F12]'
                : 'bg-[var(--bg-surface-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
            }`}
          >
            All time
          </button>
          {years.map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => handleScrollToYear(yr)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-standard ${
                selectedYear === yr
                  ? 'bg-[var(--accent-fill)] text-[#0E0F12]'
                  : 'bg-[var(--bg-surface-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border-subtle)]'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-3.5 flex items-center gap-3" variant="default">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-fill)] shrink-0">
            <Activity className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--text-muted)] font-medium block">
              Active Days
            </span>
            <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">
              {activeDays}
            </span>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center gap-3" variant="default">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-fill)] shrink-0">
            <Flame className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--text-muted)] font-medium block">
              Longest Consistency Streak
            </span>
            <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">
              {longestStreak} {longestStreak === 1 ? 'day' : 'days'}
            </span>
          </div>
        </Card>

        <Card className="p-3.5 flex items-center gap-3" variant="default">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
            <Calendar className="w-4 h-4 stroke-[2]" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--text-muted)] font-medium block">
              Logged Workouts
            </span>
            <span className="text-lg font-bold text-[var(--text-primary)] tabular-nums">
              {workouts.length} total
            </span>
          </div>
        </Card>
      </div>

      {/* Main Full-Width Heatmap Card */}
      <Card className="p-5 relative" variant="default">
        {/* Navigation Chevron Controls */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Activity Density Grid (16px cells)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => handleScrollWeeks('left')}
              aria-label="Scroll left 8 weeks"
              title="Scroll left 8 weeks"
              className="h-8 w-8 rounded-lg bg-[var(--bg-surface-raised)] hover:bg-[var(--accent-fill)] hover:text-[#0E0F12] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScrollWeeks('right')}
              aria-label="Scroll right 8 weeks"
              title="Scroll right 8 weeks"
              className="h-8 w-8 rounded-lg bg-[var(--bg-surface-raised)] hover:bg-[var(--accent-fill)] hover:text-[#0E0F12] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Floating Hover Tooltip */}
        {hoveredDay && (
          <div
            className="fixed pointer-events-none z-50 px-2.5 py-1.5 rounded-lg bg-[#0E0F12] border border-[#262A33] text-xs font-semibold text-[#F2F3F5] shadow-xl tabular-nums -translate-x-1/2 -translate-y-full"
            style={{
              left: `${hoveredDay.x}px`,
              top: `${hoveredDay.y - 10}px`,
            }}
          >
            {formatTooltipDate(parseISODate(hoveredDay.day.date))} -{' '}
            {hoveredDay.day.count > 0
              ? `${hoveredDay.day.count} workout${hoveredDay.day.count === 1 ? '' : 's'}, ${hoveredDay.day.minutes} min`
              : '0 workouts'}
          </div>
        )}

        <div className="flex items-start gap-3">
          {/* Day of Week Labels (Mon, Wed, Fri) */}
          <div className="grid grid-rows-7 gap-[4px] pt-6 select-none text-[10px] font-semibold text-[var(--text-faint)] shrink-0">
            <span className="h-[16px] leading-[16px]">Mon</span>
            <span className="h-[16px] leading-[16px]"></span>
            <span className="h-[16px] leading-[16px]">Wed</span>
            <span className="h-[16px] leading-[16px]"></span>
            <span className="h-[16px] leading-[16px]">Fri</span>
            <span className="h-[16px] leading-[16px]"></span>
            <span className="h-[16px] leading-[16px]"></span>
          </div>

          {/* Horizontally scrollable container with 16px cells and 4px gap */}
          <div
            ref={scrollContainerRef}
            className="flex-1 overflow-x-auto pb-3"
          >
            {/* Month Header row */}
            <div
              className="relative h-5 mb-1.5 select-none text-[11px] font-semibold text-[var(--text-muted)]"
              style={{ width: `${allWeeks.length * 20}px` }}
            >
              {monthLabels.map((m) => (
                <div
                  key={`${m.weekIndex}-${m.label}`}
                  className="absolute top-0 whitespace-nowrap"
                  style={{ left: `${m.weekIndex * 20}px` }}
                >
                  {m.label}
                </div>
              ))}
            </div>

            {/* 7-row CSS Grid: 16px cells with 4px gap */}
            <div
              className="grid grid-rows-7 grid-flow-col gap-[4px]"
              style={{ width: `${allWeeks.length * 20 - 4}px` }}
            >
              {allWeeks.map((week) =>
                week.days.map((day) => {
                  const isPinned = pinnedDay?.date === day.date;
                  const formattedDate = formatAriaDate(parseISODate(day.date));
                  const label = day.isFuture
                    ? `${formattedDate} - Future`
                    : day.count > 0
                    ? `${formattedDate} - ${day.count} workout${day.count === 1 ? '' : 's'}, ${day.minutes}m`
                    : `${formattedDate} - No workouts`;

                  return (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => setPinnedDay(isPinned ? null : day)}
                      onMouseEnter={(e) => {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setHoveredDay({
                          day,
                          x: rect.left + rect.width / 2,
                          y: rect.top,
                        });
                      }}
                      onMouseLeave={() => setHoveredDay(null)}
                      disabled={day.isFuture}
                      aria-label={label}
                      style={{
                        backgroundColor: day.isFuture
                          ? 'transparent'
                          : `var(--heat-${day.intensity})`,
                      }}
                      className={`w-[16px] h-[16px] rounded-[3px] border border-[var(--heat-border)] cursor-pointer transition-standard relative shrink-0 ${
                        day.isFuture
                          ? 'opacity-20 cursor-not-allowed border-dashed'
                          : 'hover:brightness-110'
                      } ${
                        day.isToday ? 'ring-2 ring-[var(--accent-fill)] z-10' : ''
                      } ${
                        isPinned ? 'ring-2 ring-white dark:ring-white z-20 scale-110 shadow-md' : ''
                      }`}
                    />
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Selected Cell Pinned Detail Line */}
        <div className="mt-4 pt-3 border-t border-[var(--border-subtle)] flex items-center justify-between text-xs">
          {pinnedDay ? (
            <div className="flex items-center gap-3 min-w-0">
              <span className="font-bold text-[var(--text-primary)]">
                {formatDetailDate(parseISODate(pinnedDay.date))}
              </span>
              <span className="text-[var(--accent-text)] bg-[var(--accent-fill)]/15 px-2 py-0.5 rounded font-semibold tabular-nums">
                {pinnedDay.count > 0
                  ? `${pinnedDay.count} workout${pinnedDay.count === 1 ? '' : 's'} (${pinnedDay.minutes} min)`
                  : 'Rest day (0 min)'}
              </span>
            </div>
          ) : (
            <span className="text-[var(--text-faint)] italic">
              Click any cell to pin activity details, or scroll with mouse wheel / chevrons.
            </span>
          )}

          {/* Legend */}
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-muted)] select-none">
            <span>Less</span>
            <div className="w-3 h-3 rounded-[2px] bg-[var(--heat-0)] border border-[var(--heat-border)]" />
            <div className="w-3 h-3 rounded-[2px] bg-[var(--heat-1)] border border-[var(--heat-border)]" />
            <div className="w-3 h-3 rounded-[2px] bg-[var(--heat-2)] border border-[var(--heat-border)]" />
            <div className="w-3 h-3 rounded-[2px] bg-[var(--heat-3)] border border-[var(--heat-border)]" />
            <span>More</span>
          </div>
        </div>
      </Card>
    </div>
  );
};
