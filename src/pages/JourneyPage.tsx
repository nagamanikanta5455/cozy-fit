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
  const currentYear = parseInt(today.split('-')[0], 10);
  const [selectedYear, setSelectedYear] = useState<number | 'all'>('all');
  const [pinnedDay, setPinnedDay] = useState<HeatmapDay | null>(null);
  const [hoveredDay, setHoveredDay] = useState<{
    day: HeatmapDay;
    x: number;
    y: number;
  } | null>(null);

  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Available year chips
  const availableYears = useMemo(() => {
    const years = new Set<number>();
    years.add(currentYear);
    workouts.forEach((w) => {
      const y = parseInt(w.date.split('-')[0], 10);
      if (!isNaN(y)) years.add(y);
    });
    return Array.from(years).sort((a, b) => b - a);
  }, [workouts, currentYear]);

  // Generate heatmap weeks
  const allWeeks = useMemo(() => {
    return buildHeatmapWeeks(workouts, today);
  }, [workouts, today]);

  // Compute month labels aligned with grid columns
  const monthLabels = useMemo(() => {
    return getMonthLabels(allWeeks);
  }, [allWeeks]);

  // Initial scroll position: Scroll to the right (most recent weeks)
  useLayoutEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [allWeeks]);

  // Horizontal scroll controls: scroll 8 weeks (8 * 20px = 160px)
  const scrollHeatmap = (deltaWeeks: number) => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({
        left: deltaWeeks * 20,
        behavior: 'smooth',
      });
    }
  };

  // Enable mouse wheel horizontal scrolling
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY !== 0 && e.deltaX === 0) {
        e.preventDefault();
        el.scrollLeft += e.deltaY;
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => el.removeEventListener('wheel', handleWheel);
  }, []);

  // Jump to specific year start
  const handleYearSelect = (year: number | 'all') => {
    setSelectedYear(year);
    if (!scrollContainerRef.current) return;

    if (year === 'all') {
      scrollContainerRef.current.scrollTo({
        left: scrollContainerRef.current.scrollWidth,
        behavior: 'smooth',
      });
      return;
    }

    const targetWeekIdx = allWeeks.findIndex((w) => {
      return w.days.some((d) => d.date.startsWith(`${year}-`));
    });

    if (targetWeekIdx !== -1) {
      scrollContainerRef.current.scrollTo({
        left: targetWeekIdx * 20,
        behavior: 'smooth',
      });
    }
  };

  if (workouts.length === 0) {
    return (
      <div className="py-16 text-center max-w-sm mx-auto space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-fill)] mx-auto">
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
        <button
          type="button"
          onClick={onOpenLogger}
          className="px-4 py-2 rounded-xl bg-[var(--accent-fill)] text-black dark:text-black font-bold text-xs shadow-xs hover:brightness-105 active:opacity-95 transition-standard cursor-pointer inline-flex items-center gap-1.5"
        >
          <span>Log first workout</span>
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header and Year Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            All-Time Consistency Map
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Browse your full workout history with 16px high-density interactive cells.
          </p>
        </div>

        {/* Year Filter Chips */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => handleYearSelect('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-standard ${
              selectedYear === 'all'
                ? 'bg-[var(--accent-fill)] text-black dark:text-black font-bold shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Recent
          </button>
          {availableYears.map((yr) => (
            <button
              key={yr}
              type="button"
              onClick={() => handleYearSelect(yr)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-standard ${
                selectedYear === yr
                  ? 'bg-[var(--accent-fill)] text-black dark:text-black font-bold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
              }`}
            >
              {yr}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Summary Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-3" variant="raised">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-fill)] shrink-0">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block">
              Longest Streak
            </span>
            <span className="text-base font-bold text-[var(--text-primary)] tabular-nums">
              {longestStreak} days
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3" variant="raised">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-fill)] shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block">
              Span Tracked
            </span>
            <span className="text-base font-bold text-[var(--text-primary)] tabular-nums">
              {allWeeks.length} weeks
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-3" variant="raised">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-fill)] shrink-0">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <span className="text-[11px] text-[var(--text-muted)] uppercase tracking-wider block">
              Total Sessions
            </span>
            <span className="text-base font-bold text-[var(--text-primary)] tabular-nums">
              {workouts.length}
            </span>
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between" variant="raised">
          <span className="text-xs text-[var(--text-muted)] font-medium">Controls</span>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => scrollHeatmap(-8)}
              title="Scroll back 8 weeks"
              aria-label="Scroll back 8 weeks"
              className="h-8 w-8 rounded-lg bg-[var(--bg-surface-raised)] hover:bg-[var(--accent-fill)] hover:text-black dark:hover:text-black border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollHeatmap(8)}
              title="Scroll forward 8 weeks"
              aria-label="Scroll forward 8 weeks"
              className="h-8 w-8 rounded-lg bg-[var(--bg-surface-raised)] hover:bg-[var(--accent-fill)] hover:text-black dark:hover:text-black border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </Card>
      </div>

      {/* Main Heatmap Card */}
      <Card className="p-5 overflow-hidden" variant="default">
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
              <span className="text-black dark:text-black bg-[var(--accent-fill)] px-2 py-0.5 rounded font-semibold tabular-nums">
                {pinnedDay.count > 0
                  ? `${pinnedDay.count} workout${pinnedDay.count === 1 ? '' : 's'} (${pinnedDay.minutes} min)`
                  : 'Rest day (0 min)'}
              </span>
            </div>
          ) : (
            <span className="text-[var(--text-faint)] italic">
              Click any square to inspect that day's log
            </span>
          )}

          {/* Heatmap Legend */}
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--text-faint)] shrink-0 select-none">
            <span>Less</span>
            <div className="w-[12px] h-[12px] rounded-[2px] bg-[var(--heat-0)] border border-[var(--heat-border)]" />
            <div className="w-[12px] h-[12px] rounded-[2px] bg-[var(--heat-1)] border border-[var(--heat-border)]" />
            <div className="w-[12px] h-[12px] rounded-[2px] bg-[var(--heat-2)] border border-[var(--heat-border)]" />
            <div className="w-[12px] h-[12px] rounded-[2px] bg-[var(--heat-3)] border border-[var(--heat-border)]" />
            <span>More</span>
          </div>
        </div>
      </Card>
    </div>
  );
};