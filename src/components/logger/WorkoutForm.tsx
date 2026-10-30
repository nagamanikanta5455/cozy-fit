import React, { useState } from 'react';
import { Workout, WorkoutType, ISODate, HHmm } from '../../domain/types';
import { WORKOUT_TYPES, QUICK_DURATIONS, EARLY_BIRD_START, EARLY_BIRD_END } from '../../domain/constants';
import { Button } from '../ui/Button';
import { Chip } from '../ui/Chip';
import { DateField } from '../ui/DateField';
import { WorkoutIcon } from '../ui/WorkoutIcon';
import { Minus, Plus, Clock, Dumbbell, ChevronDown, ChevronUp } from 'lucide-react';

export interface WorkoutFormData {
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
  const [showMoreDetails, setShowMoreDetails] = useState<boolean>(
    Boolean(
      initialWorkout?.startTime ||
      initialWorkout?.sets ||
      initialWorkout?.reps ||
      initialWorkout?.type === 'strength' ||
      initialWorkout?.type === 'bodyweight'
    )
  );
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleDurationDelta = (delta: number) => {
    setDurationMin((prev) => Math.min(600, Math.max(1, prev + delta)));
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
      newErrors.startTime = 'Start time must be HH:mm (24-hour format)';
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
    <form
      id="workout-form"
      onSubmit={handleSubmit}
      className="flex flex-col h-full justify-between"
    >
      {/* Scrollable Form Body */}
      <div className="space-y-5 flex-1 pr-1">
        {/* 1. Date Field with DateField component */}
        <div>
          <DateField
            id="panel-workout-date"
            label="Date"
            value={date}
            max={today}
            onChange={(val) => setDate(val as ISODate)}
            error={errors.date}
            required
          />
        </div>

        {/* 2. Activity Type Picker: 3-column desktop grid with hover & selected states */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              id="activity-type-label"
              className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
            >
              Activity Type
            </label>
            <span className="text-[11px] text-[var(--text-faint)]">
              {WORKOUT_TYPES[type]?.label || 'Select'}
            </span>
          </div>

          <div
            role="group"
            aria-labelledby="activity-type-label"
            className="grid grid-cols-3 gap-2"
          >
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
                      setShowMoreDetails(true);
                    }
                  }}
                  className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 text-center transition-standard cursor-pointer select-none h-18 ${
                    isSelected
                      ? 'bg-[var(--accent-fill)]/15 border-[var(--accent-fill)] text-[var(--accent-text)] ring-1 ring-[var(--accent-fill)]'
                      : 'bg-[var(--bg-surface-raised)]/40 border-[var(--border-subtle)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]'
                  }`}
                  aria-pressed={isSelected}
                >
                  <WorkoutIcon iconKey={meta.iconKey} size={18} />
                  <span className="text-xs font-bold truncate max-w-full">
                    {meta.label}
                  </span>
                </button>
              );
            })}
          </div>
          {errors.type && (
            <p id="type-error" className="text-xs text-[#F87171] mt-1">
              {errors.type}
            </p>
          )}
        </div>

        {/* 3. Duration: Number input with quick chips */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="panel-duration-input"
              className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
            >
              Duration (minutes)
            </label>
            <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums">
              {durationMin} min
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDurationDelta(-5)}
              className="h-10 w-11 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] flex items-center justify-center hover:border-[var(--text-muted)] active:opacity-80 cursor-pointer shrink-0"
              aria-label="Decrease 5 minutes"
              title="-5 minutes"
            >
              <Minus className="w-4 h-4" />
            </button>

            <div className="flex-1">
              <input
                id="panel-duration-input"
                type="number"
                min={1}
                max={600}
                value={durationMin}
                onChange={handleDurationInput}
                aria-describedby={errors.duration ? 'duration-error' : undefined}
                className="w-full h-10 text-center text-lg font-bold tabular-nums px-3 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)]"
              />
            </div>

            <button
              type="button"
              onClick={() => handleDurationDelta(5)}
              className="h-10 w-11 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] flex items-center justify-center hover:border-[var(--text-muted)] active:opacity-80 cursor-pointer shrink-0"
              aria-label="Increase 5 minutes"
              title="+5 minutes"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Quick chips (15, 30, 45, 60) */}
          <div className="flex items-center gap-1.5 mt-2">
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
            <p id="duration-error" className="text-xs text-[#F87171] mt-1">
              {errors.duration}
            </p>
          )}
        </div>

        {/* 4. Notes Textarea with live character count (max 140) */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="panel-workout-note"
              className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
            >
              Session Notes
            </label>
            <span
              className={`text-[11px] tabular-nums font-mono ${
                note.length >= 130 ? 'text-[#F87171] font-bold' : 'text-[var(--text-faint)]'
              }`}
            >
              {note.length}/140
            </span>
          </div>
          <textarea
            id="panel-workout-note"
            rows={2}
            maxLength={140}
            placeholder="Add details, sets, weather or feeling..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            aria-describedby={errors.note ? 'note-error' : undefined}
            className="w-full px-3.5 py-2 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] placeholder:text-[var(--text-faint)] focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)] text-sm resize-none"
          />
          {errors.note && (
            <p id="note-error" className="text-xs text-[#F87171] mt-1">
              {errors.note}
            </p>
          )}
        </div>

        {/* 5. Collapsible "More Details" Section (Start Time, Sets, Reps) */}
        <div className="border border-[var(--border-subtle)] rounded-xl overflow-hidden bg-[var(--bg-surface-raised)]/20">
          <button
            type="button"
            onClick={() => setShowMoreDetails((prev) => !prev)}
            className="w-full px-3.5 py-2.5 flex items-center justify-between text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Clock className="w-3.5 h-3.5" />
              <span>More details (Start time, sets & reps)</span>
            </div>
            {showMoreDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>

          {showMoreDetails && (
            <div className="p-3.5 pt-0 space-y-3.5 border-t border-[var(--border-subtle)]/50">
              {/* Start Time with Early Bird indicator */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label
                    htmlFor="panel-start-time"
                    className="text-[11px] font-semibold text-[var(--text-muted)]"
                  >
                    Start Time (24h)
                  </label>
                  {isEarlyBirdTime ? (
                    <span className="text-[10px] font-semibold text-[var(--accent-text)] bg-[var(--accent-fill)]/15 px-1.5 py-0.5 rounded">
                      Early Bird active
                    </span>
                  ) : (
                    <span className="text-[10px] text-[var(--text-faint)]">
                      Early Bird: 04:00 - 07:00
                    </span>
                  )}
                </div>
                <input
                  id="panel-start-time"
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  aria-describedby={errors.startTime ? 'time-error' : undefined}
                  className="w-full h-9 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] text-sm focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)]"
                />
                {errors.startTime && (
                  <p id="time-error" className="text-xs text-[#F87171] mt-1">
                    {errors.startTime}
                  </p>
                )}
              </div>

              {/* Strength sets and reps */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="panel-sets"
                    className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1"
                  >
                    Sets (1 - 99)
                  </label>
                  <input
                    id="panel-sets"
                    type="number"
                    min={1}
                    max={99}
                    placeholder="e.g. 4"
                    value={sets}
                    onChange={(e) =>
                      setSets(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    aria-describedby={errors.sets ? 'sets-error' : undefined}
                    className="w-full h-9 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] text-sm tabular-nums focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)]"
                  />
                  {errors.sets && (
                    <p id="sets-error" className="text-xs text-[#F87171] mt-1">
                      {errors.sets}
                    </p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="panel-reps"
                    className="block text-[11px] font-semibold text-[var(--text-muted)] mb-1"
                  >
                    Reps / Set (1 - 999)
                  </label>
                  <input
                    id="panel-reps"
                    type="number"
                    min={1}
                    max={999}
                    placeholder="e.g. 10"
                    value={reps}
                    onChange={(e) =>
                      setReps(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    aria-describedby={errors.reps ? 'reps-error' : undefined}
                    className="w-full h-9 px-3 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] text-sm tabular-nums focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)]"
                  />
                  {errors.reps && (
                    <p id="reps-error" className="text-xs text-[#F87171] mt-1">
                      {errors.reps}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Pinned Footer with Cancel and Save Buttons */}
      <div className="pt-4 mt-6 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2.5 shrink-0 bg-[var(--bg-surface)]">
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="primary">
          {isEditing ? 'Save Changes' : 'Save Workout'}
        </Button>
      </div>
    </form>
  );
};
