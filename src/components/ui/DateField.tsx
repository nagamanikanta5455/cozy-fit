import React from 'react';
import { Calendar } from 'lucide-react';

interface DateFieldProps {
  id?: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
}

/**
 * Note on OS Calendar Popups:
 * Native browser <input type="date"> popup dialogs (the OS calendar picker)
 * are rendered by the browser/system chrome in Shadow DOM and cannot be
 * directly restyled using CSS classes. Setting `color-scheme: light | dark`
 * on :root/.light and `accent-color` provides the maximum theming available
 * for native date controls across iOS Safari, Android Chrome, and Desktop.
 */
export const DateField: React.FC<DateFieldProps> = ({
  id,
  label,
  value,
  onChange,
  min,
  max,
  error,
  disabled = false,
  required = false,
}) => {
  const inputId = id || `date-field-${label.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="w-full space-y-1.5">
      <label
        htmlFor={inputId}
        className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
      >
        <Calendar className="w-3.5 h-3.5 stroke-[1.75]" />
        <span>{label}</span>
      </label>

      <div className="relative">
        <input
          id={inputId}
          type="date"
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className={`w-full min-h-[44px] px-4 py-2.5 rounded-2xl border text-base font-medium bg-[var(--bg-surface)] text-[var(--text-primary)] transition-standard focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)] disabled:opacity-50 disabled:cursor-not-allowed appearance-none -webkit-appearance-none ${
            error
              ? 'border-[var(--status-danger)] ring-1 ring-[var(--status-danger)]'
              : 'border-[var(--border-subtle)] hover:border-[var(--text-muted)]'
          }`}
          style={{
            minHeight: '44px',
            WebkitAppearance: 'none',
          }}
        />
      </div>

      {error && (
        <p className="text-[11px] font-medium text-[var(--status-danger)] mt-1">
          {error}
        </p>
      )}
    </div>
  );
};
