import React, { useState } from 'react';
import { Workout, WorkoutType, ISODate, HHmm } from '../../domain/types';
import { WORKOUT_TYPES, QUICK_DURATIONS, EARLY_BIRD_START, EARLY_BIRD_END } from '../../domain/constants';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { DateField } from '../ui/DateField';
import { WorkoutIcon } from '../ui/WorkoutIcon';
import { Minus, Plus, Clock, Dumbbell } from 'lucide-react';

interface WorkoutFormData {
  date: ISODate;
  type: WorkoutType;
  durationMin: number;
  startTime?: HHmm;
  sets?: number;
  reps?: number;
  note?: string;
}

interface WorkoutFormProps {
  today: ISODate;
  initialWorkout?: Workout | null;
  onSubmit: (data: WorkoutFormData) => void;
  onCancel: () => void;
}

export const WorkoutForm: React.FC<WorkoutFormProps> = ({
  today,
  initialWorkout,
  onSubmit,
  onCancel,
}) => {
  const isEditing = Boolean(initialWorkout);

  const [date, setDate] = useState<ISODate>(initialWorkout?.date || today);
  const [type, setType] = useState<WorkoutType>(initialWorkout?.type || 'walk');
  const [durationMin, setDurationMin] = useState<number>(initialWorkout?.durationMin || 30);
  const [startTime, setStartTime] = useState<string>(initialWorkout?.startTime || '');
  const [sets, setSets] = useState<number | ''>(initialWorkout?.sets ?? '');
  const [reps, setReps] = useState<number | ''>(initialWorkout?.reps ?? '');
  const [note, setNote] = useState<string>(initialWorkout?.note || '');
  const [showStrengthFields, setShowStrengthFields] = useState<boolean>(
    Boolean(initialWorkout?.sets || initialWorkout?.reps || initialWorkout?.type === 'strength' || initialWorkout?.type === 'bodyweight')
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const isStrengthOrBodyweight = type === 'strength' || type === 'bodyweight';

  const handleDurationChange = (delta: number) => {
    setDurationMin((prev) => {
      const next = prev + delta;
      return Math.min(600, Math.max(1, next));
    });
  };

  const handleDurationInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setDurationMin(Math.min(600, Math.max(1, val)));
    } else {
      setDurationMin(1);
    }
  };

  const validate = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!date) {
      newErrors.date = 'Select a date';
    } else if (date > today) {
      newErrors.date = 'Future dates are not allowed';
    }

    if (!type || !WORKOUT_TYPES[type]) {
      newErrors.type = 'Select a workout type';
    }

    if (!durationMin || durationMin < 1 || durationMin > 600) {
      newErrors.duration = 'Duration must be between 1 and 600 minutes';
    }

    if (startTime && !/^\d{2}:\d{2}$/.test(startTime)) {
      newErrors.startTime = 'Start time must be HH:mm (24-hour)';
    }

    if (sets !== '' && (sets < 1 || sets > 99)) {
      newErrors.sets = 'Sets must be between 1 and 99';
    }

    if (reps !== '' && (reps < 1 || reps > 999)) {
      newErrors.reps = 'Reps must be between 1 and 999';
    }

    if (note && note.length > 140) {
      newErrors.note = 'Note must be 140 characters or fewer';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      date,
      type,
      durationMin,
      startTime: startTime ? (startTime as HHmm) : undefined,
      sets: sets !== '' ? sets : undefined,
      reps: reps !== '' ? reps : undefined,
      note: note.trim() || undefined,
    });
  };

  const isEarlyBirdTime = Boolean(
    startTime && startTime >= EARLY_BIRD_START && startTime < EARLY_BIRD_END
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full space-y-4">
      {/* Date using DateField component */}
      <DateField
        id="workout-date"
        label="Date"
        value={date}
        max={today}
        onChange={(val) => setDate(val as ISODate)}
        error={errors.date}
        required
      />

      {/* Activity Type Grid with Lucide icons only */}
      <div>
        <label className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5">
          Activity Type
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {(Object.keys(WORKOUT_TYPES) as WorkoutType[]).map((tKey) => {
            const meta = WORKOUT_TYPES[tKey];
            const isSelected = type === tKey;
            return (
              <button
                key={tKey}
                type="button"
                onClick={() => {
                  setType(tKey);
                  if (tKey === 'strength' || tKey === 'bodyweight') {
                    setShowStrengthFields(true);
                  }
                }}
                className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-standard cursor-pointer select-none min-h-[58px] ${
                  isSelected
                    ? 'bg-[var(--bg-surface-raised)] border-[var(--accent-fill)] text-[var(--text-primary)]'
                    : 'bg-[var(--bg-surface-raised)]/40 border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]'
                }`}
              >
                <WorkoutIcon iconKey={meta.iconKey} size={18} />
                <span className="text-xs font-semibold truncate max-w-full">
                  {meta.label}
                </span>
              </button>
            );
          })}
        </div>
        {errors.type && (
          <p className="text-xs text-[#F87171] mt-1">{errors.type}</p>
        )}
      </div>

      {/* Duration Stepper + Quick Chips */}
      <div>
        <label
          htmlFor="duration-input"
          className="block text-xs font-semibold text-[var(--text-muted)] mb-1.5"
        >
          Duration (minutes)
        </label>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleDurationChange(-5)}
            className="w-11 h-11 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] flex items-center justify-center hover:border-[var(--text-muted)] active:opacity-80 cursor-pointer shrink-0"
            aria-label="Decrease 5 minutes"
          >
            <Minus className="w-4 h-4" />
          </button>

          <div className="flex-1 text-center">
            <input
              id="duration-input"
              type="number"
              min={1}
              max={600}
              value={durationMin}
              onChange={handleDurationInput}
              className="w-full text-center text-xl font-bold tabular-nums py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)]"
            />
          </div>

          <button
            type="button"
            onClick={() => handleDurationChange(5)}
            className="w-11 h-11 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] flex items-center justify-center hover:border-[var(--text-muted)] active:opacity-80 cursor-pointer shrink-0"
            aria-label="Increase 5 minutes"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Quick chips */}
        <div className="flex flex-wrap gap-1.5 mt-2">
          {QUICK_DURATIONS.map((dur) => (
            <Chip
              key={dur}
              size="sm"
              label={`${dur}m`}
              selected={durationMin === dur}
              onClick={() => setDurationMin(dur)}
            />
          ))}
        </div>
        {errors.duration && (
          <p className="text-xs text-[#F87171] mt-1">{errors.duration}</p>
        )}
      </div>

      {/* Start Time (Optional) with Early Bird indicator */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="workout-start-time"
            className="text-xs font-semibold text-[var(--text-muted)] flex items-center gap-1.5"
          >
            <Clock className="w-3.5 h-3.5 text-[var(--text-faint)]" />
            <span>Start Time (optional)</span>
          </label>
          {isEarlyBirdTime ? (
            <span className="text-[11px] font-semibold text-[var(--accent-text)] bg-[var(--accent-fill)]/15 px-2 py-0.5 rounded-full">
              Early Bird active (04:00 - 07:00)
            </span>
          ) : (
            <span className="text-[11px] text-[var(--text-faint)]">
              Early Bird: 04:00 – 07:00
            </span>
          )}
        </div>
        <input
          id="workout-start-time"
          type="time"
          value={startTime}
          onChange={(e) => setStartTime(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)] text-sm"
        />
        {errors.startTime && (
          <p className="text-xs text-[#F87171] mt-1">{errors.startTime}</p>
        )}
      </div>

      {/* Sets & Reps for Strength/Bodyweight (Collapsible or visible) */}
      {(isStrengthOrBodyweight || showStrengthFields) && (
        <div className="p-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]/30 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--text-muted)]">
            <Dumbbell className="w-3.5 h-3.5" />
            <span>Volume & Reps (optional)</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="workout-sets"
                className="block text-[11px] font-medium text-[var(--text-muted)] mb-1"
              >
                Sets (1 - 99)
              </label>
              <input
                id="workout-sets"
                type="number"
                min={1}
                max={99}
                placeholder="e.g. 4"
                value={sets}
                onChange={(e) =>
                  setSets(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                }
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] text-sm tabular-nums focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)]"
              />
              {errors.sets && (
                <p className="text-xs text-[#F87171] mt-1">{errors.sets}</p>
              )}
            </div>
            <div>
              <label
                htmlFor="workout-reps"
                className="block text-[11px] font-medium text-[var(--text-muted)] mb-1"
              >
                Reps per Set (1 - 999)
              </label>
              <input
                id="workout-reps"
                type="number"
                min={1}
                max={999}
                placeholder="e.g. 12"
                value={reps}
                onChange={(e) =>
                  setReps(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                }
                className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] text-sm tabular-nums focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)]"
              />
              {errors.reps && (
                <p className="text-xs text-[#F87171] mt-1">{errors.reps}</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Note input */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label
            htmlFor="workout-note"
            className="text-xs font-semibold text-[var(--text-muted)]"
          >
            Notes (optional)
          </label>
          <span className="text-[11px] text-[var(--text-faint)] tabular-nums">
            {note.length}/140
          </span>
        </div>
        <textarea
          id="workout-note"
          rows={2}
          maxLength={140}
          placeholder="Session details..."
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)] text-sm resize-none"
        />
        {errors.note && (
          <p className="text-xs text-[#F87171] mt-1">{errors.note}</p>
        )}
      </div>

      {/* Sticky footer Save button */}
      <div className="sticky bottom-0 pt-3 pb-safe bg-[var(--bg-surface)] border-t border-[var(--border-subtle)] flex items-center justify-end gap-2 mt-auto">
        <Button type="button" variant="ghost" onClick={onCancel} size="sm">
          Cancel
        </Button>
        <Button type="submit" variant="primary" size="sm">
          {isEditing ? 'Save Changes' : 'Save Workout'}
        </Button>
      </div>
    </form>
  );
};
