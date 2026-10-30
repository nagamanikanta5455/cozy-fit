import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { DayActivity, ISODate } from '../../domain/types';
import { formatFriendlyDate, getWeekdayShort } from '../../domain/dates';

interface ActivityChartProps {
  data: DayActivity[];
  today: ISODate;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data, today }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxMinutes = Math.max(60, ...data.map((d) => d.minutes));
  const total7DayMinutes = data.reduce((sum, d) => sum + d.minutes, 0);

  // SVG dimensions widened for laptop container
  const width = 540;
  const height = 140;
  const barWidth = 36;
  const gap = (width - data.length * barWidth) / (data.length + 1);

  return (
    <Card className="p-4 sm:p-5 flex flex-col justify-between" variant="default">
      <div className="flex items-center justify-between mb-3 min-w-0">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate">
          7-Day Activity
        </span>
        <div className="text-xs text-[var(--text-faint)] tabular-nums shrink-0">
          <span className="font-bold text-[var(--text-primary)]">{total7DayMinutes}</span> min total
        </div>
      </div>

      {/* Responsive ViewBox SVG Chart */}
      <div className="relative pt-2 pb-1">
        {/* Floating tooltip */}
        {hoveredIdx !== null && (
          <div className="absolute top-0 inset-x-0 flex justify-center pointer-events-none z-10">
            <span className="px-2.5 py-1 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] tabular-nums shadow-md">
              {formatFriendlyDate(data[hoveredIdx].date, today)}: {data[hoveredIdx].minutes}m
            </span>
          </div>
        )}

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto overflow-visible select-none"
          role="img"
          aria-label={`7-day workout activity chart showing ${total7DayMinutes} total minutes`}
        >
          {/* Subtle grid line at 50% and baseline */}
          <line
            x1="0"
            y1={height * 0.45}
            x2={width}
            y2={height * 0.45}
            stroke="var(--border-subtle)"
            strokeDasharray="3 4"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={height - 24}
            x2={width}
            y2={height - 24}
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />

          {data.map((item, idx) => {
            const isToday = item.date === today;
            const x = gap + idx * (barWidth + gap);
            const chartHeight = height - 38;
            const barHeight =
              item.minutes > 0
                ? Math.max(4, (item.minutes / maxMinutes) * chartHeight)
                : 2;
            const y = height - 24 - barHeight;

            const dayName = isToday ? 'Today' : getWeekdayShort(item.date);
            const isHovered = hoveredIdx === idx;
            const barFill = isToday
              ? 'var(--accent-fill)'
              : item.minutes > 0
              ? 'var(--text-muted)'
              : 'var(--border-subtle)';

            return (
              <g
                key={item.date}
                className="cursor-pointer"
                onMouseEnter={() => setHoveredIdx(idx)}
                onMouseLeave={() => setHoveredIdx(null)}
                tabIndex={0}
                role="button"
                aria-label={`${formatFriendlyDate(item.date, today)}: ${item.minutes} minutes`}
                onFocus={() => setHoveredIdx(idx)}
                onBlur={() => setHoveredIdx(null)}
              >
                {/* Bar */}
                <rect
                  x={x}
                  y={y}
                  width={barWidth}
                  height={barHeight}
                  rx="4"
                  fill={barFill}
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-standard"
                />

                {/* X-axis label */}
                <text
                  x={x + barWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize="11"
                  fontWeight={isToday ? '700' : '500'}
                  fill={isToday ? 'var(--accent-fill)' : 'var(--text-faint)'}
                  className="tabular-nums"
                >
                  {dayName}
                </text>
              </g>
            );
          })}
        </svg>
      </div>
    </Card>
  );
};
