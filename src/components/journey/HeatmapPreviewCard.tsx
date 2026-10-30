import React, { useMemo } from 'react';
import { Card } from '../ui/Card';
import { Workout, ISODate } from '../../domain/types';
import { buildHeatmapWeeks, getMonthLabels } from '../../domain/history';
import { parseISODate } from '../../domain/dates';
import { format } from 'date-fns';
import { Calendar, ChevronRight } from 'lucide-react';

interface HeatmapPreviewCardProps {
  workouts: Workout[];
  today: ISODate;
  onNavigateToJourney: () => void;
}

export const HeatmapPreviewCard: React.FC<HeatmapPreviewCardProps> = ({
  workouts,
  today,
  onNavigateToJourney,
}) => {
  // Build all weeks and take the last 26 weeks for the dashboard preview
  const allWeeks = useMemo(() => buildHeatmapWeeks(workouts, today), [workouts, today]);
  const previewWeeks = useMemo(() => allWeeks.slice(-26), [allWeeks]);
  const monthLabels = useMemo(() => getMonthLabels(previewWeeks), [previewWeeks]);

  const activeDaysCount = useMemo(() => {
    const dates = new Set<string>();
    for (const w of workouts) dates.add(w.date);
    return dates.size;
  }, [workouts]);

  return (
    <Card className="p-4 sm:p-5" variant="default">
      <div className="flex items-center justify-between mb-3 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <Calendar className="w-4 h-4 text-[var(--accent-fill)] shrink-0" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate">
            Consistency Map (Past 26 Weeks)
          </h3>
          <span className="text-xs text-[var(--text-faint)] tabular-nums shrink-0">
            {activeDaysCount} active days
          </span>
        </div>

        <button
          type="button"
          onClick={onNavigateToJourney}
          className="text-xs font-semibold text-[var(--accent-fill)] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
        >
          <span>View full journey</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* 26-week Heatmap Preview Grid */}
      <div className="overflow-x-auto pb-1">
        <div className="inline-block min-w-full">
          {/* Month labels */}
          <div
            className="relative h-4 mb-1 select-none text-[10px] font-semibold text-[var(--text-muted)]"
            style={{ width: `${previewWeeks.length * 19}px` }}
          >
            {monthLabels.map((m) => (
              <div
                key={`${m.weekIndex}-${m.label}`}
                className="absolute top-0 whitespace-nowrap"
                style={{ left: `${m.weekIndex * 19}px` }}
              >
                {m.label}
              </div>
            ))}
          </div>

          {/* Grid */}
          <div
            className="grid grid-rows-7 grid-flow-col gap-[3px]"
            style={{ width: `${previewWeeks.length * 19 - 3}px` }}
          >
            {previewWeeks.map((week) =>
              week.days.map((day) => {
                const formattedDate = format(parseISODate(day.date), 'EEE, MMM d, yyyy');
                const label = day.isFuture
                  ? `${formattedDate} - Future`
                  : day.count > 0
                  ? `${formattedDate} - ${day.count} workout${day.count === 1 ? '' : 's'}, ${day.minutes}m`
                  : `${formattedDate} - No workouts`;

                return (
                  <button
                    key={day.date}
                    type="button"
                    onClick={onNavigateToJourney}
                    disabled={day.isFuture}
                    aria-label={label}
                    title={label}
                    style={{
                      backgroundColor: day.isFuture ? 'transparent' : `var(--heat-${day.intensity})`,
                    }}
                    className={`w-[16px] h-[16px] rounded-[3px] border border-[var(--heat-border)] cursor-pointer transition-standard ${
                      day.isFuture
                        ? 'opacity-20 cursor-not-allowed border-dashed'
                        : 'hover:brightness-110'
                    } ${day.isToday ? 'ring-2 ring-[var(--accent-fill)] z-10' : ''}`}
                  />
                );
              })
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
