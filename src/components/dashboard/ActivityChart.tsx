import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { DayActivity, ISODate } from '../../domain/types';
import { parseISODate, formatFriendlyDate, getWeekdayShort } from '../../domain/dates';

interface ActivityChartProps {
  data: DayActivity[];
  today: ISODate;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ data, today }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const maxMinutes = Math.max(60, ...data.map((d) => d.minutes));
  const total7DayMinutes = data.reduce((sum, d) => sum + d.minutes, 0);

  // SVG dimensions for viewBox
  const width = 320;
  const height = 120;
  const barWidth = 24;
  const gap = (width - data.length * barWidth) / (data.length + 1);

  return (
    <Card className="p-4 sm:p-5" variant="default">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate">
          7-Day Activity
        </span>
        <div className="text-xs text-[var(--text-faint)] tabular-nums">
          <span className="font-bold text-[var(--text-primary)]">{total7DayMinutes}</span> min total
        </div>
      </div>

      {/* Responsive ViewBox SVG Chart */}
      <div className="relative pt-2 pb-1">
        {/* Floating tooltip */}
        {hoveredIdx !== null && (
          <div className="absolute top-0 inset-x-0 flex justify-center pointer-events-none z-10">
            <span className="px-2 py-0.5 rounded bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[11px] font-semibold text-[var(--text-primary)] tabular-nums shadow-sm">
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
          {/* Subtle grid line at 50% and 100% */}
          <line
            x1="0"
            y1={height * 0.5}
            x2={width}
            y2={height * 0.5}
            stroke="var(--border-subtle)"
            strokeDasharray="2 3"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1={height - 20}
            x2={width}
            y2={height - 20}
            stroke="var(--border-subtle)"
            strokeWidth="1"
          />

          {data.map((item, idx) => {
            const isToday = item.date === today;
            const x = gap + idx * (barWidth + gap);
            const chartHeight = height - 28;
            const barHeight =
              item.minutes > 0
                ? Math.max(3, (item.minutes / maxMinutes) * chartHeight)
                : 2;
            const y = height - 20 - barHeight;

            const dateObj = parseISODate(item.date);
            const dayName = isToday ? 'TD' : getWeekdayShort(item.date).slice(0, 2);

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
                  rx="3"
                  fill={barFill}
                  opacity={isHovered ? 1 : 0.85}
                  className="transition-standard"
                />

                {/* X-axis label */}
                <text
                  x={x + barWidth / 2}
                  y={height - 6}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight={isToday ? '700' : '500'}
                  fill={isToday ? 'var(--accent-fill)' : 'var(--text-faint)'}
                  className="tabular-nums font-mono"
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
