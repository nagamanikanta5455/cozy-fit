import React, { useState, useRef } from 'react';
import { Workout, ISODate } from '../../domain/types';
import { WORKOUT_TYPES } from '../../domain/constants';
import { formatFriendlyDate } from '../../domain/dates';
import { WorkoutIcon } from '../ui/WorkoutIcon';
import { Edit2, Trash2 } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface WorkoutRowProps {
  workout: Workout;
  today: ISODate;
  onEdit: (workout: Workout) => void;
  onDelete: (workout: Workout) => void;
}

export const WorkoutRow: React.FC<WorkoutRowProps> = ({
  workout,
  today,
  onEdit,
  onDelete,
}) => {
  const meta = WORKOUT_TYPES[workout.type] || WORKOUT_TYPES.other;
  const dateStr = formatFriendlyDate(workout.date, today);

  const [translateX, setTranslateX] = useState(0);
  const [isSwipedOpen, setIsSwipedOpen] = useState(false);

  // Pointer event tracking refs
  const startX = useRef(0);
  const startY = useRef(0);
  const isSwiping = useRef(false);
  const hasCapturedPointer = useRef(false);
  const didSwipeJustEnd = useRef(false);
  const rowRef = useRef<HTMLDivElement>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    // Only primary button / primary touch
    if (e.button !== 0) return;
    startX.current = e.clientX;
    startY.current = e.clientY;
    isSwiping.current = false;
    hasCapturedPointer.current = false;
    didSwipeJustEnd.current = false;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;

    // Movement threshold: only treat as horizontal swipe if |dx| > 10px and |dx| > |dy|
    if (!isSwiping.current) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        isSwiping.current = true;
        if (!hasCapturedPointer.current && rowRef.current) {
          rowRef.current.setPointerCapture(e.pointerId);
          hasCapturedPointer.current = true;
        }
      } else {
        return;
      }
    }

    // Apply movement
    if (dx < 0) {
      setTranslateX(Math.max(-76, dx));
    } else if (isSwipedOpen && dx > 0) {
      setTranslateX(Math.min(0, -68 + dx));
    }
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (hasCapturedPointer.current && rowRef.current) {
      try {
        rowRef.current.releasePointerCapture(e.pointerId);
      } catch {
        // pointer may already be released
      }
      hasCapturedPointer.current = false;
    }

    if (isSwiping.current) {
      didSwipeJustEnd.current = true;
      if (translateX < -35) {
        setTranslateX(-68);
        setIsSwipedOpen(true);
        triggerHaptic('light');
      } else {
        setTranslateX(0);
        setIsSwipedOpen(false);
      }
      isSwiping.current = false;
    }
  };

  const handleRowClick = () => {
    // Suppress synthetic click after a swipe gesture completes
    if (didSwipeJustEnd.current) {
      didSwipeJustEnd.current = false;
      return;
    }
    if (isSwipedOpen) {
      setTranslateX(0);
      setIsSwipedOpen(false);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    setTranslateX(0);
    setIsSwipedOpen(false);
    onDelete(workout);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    triggerHaptic('light');
    onEdit(workout);
  };

  return (
    <div className="relative overflow-hidden py-3 first:pt-0 last:pb-0 select-none">
      {/* Background action revealed on swipe-left */}
      <div
        className={`absolute inset-y-0 right-0 flex items-center pr-1 transition-opacity ${
          isSwipedOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        <button
          type="button"
          onClick={handleDelete}
          onPointerDown={(e) => e.stopPropagation()}
          aria-label={`Delete ${meta.label} on ${dateStr}`}
          className="h-9 w-14 rounded-lg bg-[#F87171]/20 border border-[#F87171]/40 text-[#F87171] flex items-center justify-center cursor-pointer active:opacity-90 transition-standard"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Foreground Row */}
      <div
        ref={rowRef}
        onClick={handleRowClick}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="flex items-center justify-between gap-3 bg-[var(--bg-surface)] relative z-10 transition-standard cursor-pointer"
        style={{
          transform: `translateX(${translateX}px)`,
          touchAction: 'pan-y',
        }}
      >
        {/* [icon] */}
        <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
          <WorkoutIcon iconKey={meta.iconKey} size={16} />
        </div>

        {/* [title + meta, min-w-0, truncate] */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-semibold text-[var(--text-primary)] truncate">
              {meta.label}
            </h4>
            <span className="text-[11px] text-[var(--text-faint)] tabular-nums">
              {dateStr}
            </span>
          </div>

          {workout.note && (
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-2 break-words">
              {workout.note}
            </p>
          )}
        </div>

        {/* [duration, shrink-0] */}
        <div className="text-xs font-semibold text-[var(--text-primary)] tabular-nums shrink-0 whitespace-nowrap">
          {workout.durationMin}m
        </div>

        {/* [actions, shrink-0] */}
        <div
          className="flex items-center gap-1 shrink-0"
          onPointerDown={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={handleEdit}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={`Edit ${meta.label} on ${dateStr}`}
            className="p-2 min-h-11 min-w-11 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={handleDelete}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={`Delete ${meta.label} on ${dateStr}`}
            className="p-2 min-h-11 min-w-11 flex items-center justify-center text-[var(--text-muted)] hover:text-[#F87171] rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
