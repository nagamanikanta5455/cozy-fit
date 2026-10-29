import React, { useState, useMemo } from 'react';
import { Modal } from '../ui/Modal';
import { DateField } from '../ui/DateField';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { Workout, Settings, ISODate } from '../../domain/types';
import { toISODate, addDaysToISODate } from '../../domain/dates';
import { exportWorkoutsWithRange, filterWorkoutsByRange } from '../../store/exportData';
import { Download, Share2, Check, AlertCircle } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface ExportDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  workouts: Workout[];
  settings: Settings;
  today: ISODate;
}

export const ExportDataModal: React.FC<ExportDataModalProps> = ({
  isOpen,
  onClose,
  workouts,
  settings,
  today,
}) => {
  const { showToast } = useToast();

  // Determine earliest workout date or default to today
  const earliestDate = useMemo(() => {
    if (workouts.length === 0) return today;
    let min = workouts[0].date;
    for (let i = 1; i < workouts.length; i++) {
      if (workouts[i].date < min) min = workouts[i].date;
    }
    return min;
  }, [workouts, today]);

  // Range state
  const [startDate, setStartDate] = useState<ISODate>(earliestDate);
  const [endDate, setEndDate] = useState<ISODate>(today);
  const [isExporting, setIsExporting] = useState(false);

  // Quick range chips
  const isAllTime = startDate === earliestDate && endDate === today;
  const isLast30 = startDate === addDaysToISODate(today, -30) && endDate === today;
  const isThisYear = startDate === `${today.slice(0, 4)}-01-01` && endDate === today;

  // Validation: start must be <= end lexicographically
  const isValidRange = startDate <= endDate;
  const rangeError = !isValidRange ? 'Start date must be before or equal to end date.' : undefined;

  // Live filtered count
  const matchingWorkouts = useMemo(() => {
    if (!isValidRange) return [];
    return filterWorkoutsByRange(workouts, startDate, endDate);
  }, [workouts, startDate, endDate, isValidRange]);

  const handleSelectAllTime = () => {
    triggerHaptic('light');
    setStartDate(earliestDate);
    setEndDate(today);
  };

  const handleSelectLast30 = () => {
    triggerHaptic('light');
    setStartDate(addDaysToISODate(today, -30));
    setEndDate(today);
  };

  const handleSelectThisYear = () => {
    triggerHaptic('light');
    setStartDate(`${today.slice(0, 4)}-01-01`);
    setEndDate(today);
  };

  const handleExport = async () => {
    if (!isValidRange || matchingWorkouts.length === 0) return;

    setIsExporting(true);
    triggerHaptic('light');

    try {
      const res = await exportWorkoutsWithRange(
        workouts,
        settings,
        { start: startDate, end: endDate },
        isAllTime
      );

      if (res.success && !res.cancelled) {
        showToast({
          type: 'success',
          title: 'Export complete',
          description: `Exported ${res.count} workout${res.count === 1 ? '' : 's'}.`,
        });
        onClose();
      } else if (!res.cancelled && res.error) {
        showToast({
          type: 'warning',
          title: 'Export failed',
          description: res.error,
        });
      }
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Export Workout Data"
      description="Select a date range to export local workout history as JSON."
      maxWidth="md"
    >
      <div className="space-y-5">
        {/* Quick Range Chips */}
        <div>
          <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
            Preset Ranges
          </label>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={handleSelectAllTime}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-standard cursor-pointer ${
                isAllTime
                  ? 'bg-[var(--accent-fill)] text-[#0E0F12] border-[var(--accent-fill)]'
                  : 'bg-[var(--bg-surface-raised)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              All Time
            </button>

            <button
              type="button"
              onClick={handleSelectLast30}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-standard cursor-pointer ${
                isLast30
                  ? 'bg-[var(--accent-fill)] text-[#0E0F12] border-[var(--accent-fill)]'
                  : 'bg-[var(--bg-surface-raised)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              Last 30 Days
            </button>

            <button
              type="button"
              onClick={handleSelectThisYear}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-standard cursor-pointer ${
                isThisYear
                  ? 'bg-[var(--accent-fill)] text-[#0E0F12] border-[var(--accent-fill)]'
                  : 'bg-[var(--bg-surface-raised)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
              }`}
            >
              This Year
            </button>
          </div>
        </div>

        {/* Start and End Date Fields */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <DateField
            id="export-start-date"
            label="Start Date"
            value={startDate}
            onChange={(val) => setStartDate(val as ISODate)}
            max={endDate}
          />
          <DateField
            id="export-end-date"
            label="End Date"
            value={endDate}
            onChange={(val) => setEndDate(val as ISODate)}
            min={startDate}
            max={today}
          />
        </div>

        {/* Range validation error */}
        {rangeError && (
          <div className="p-3 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30 flex items-center gap-2 text-xs text-[#F87171]">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{rangeError}</span>
          </div>
        )}

        {/* Live Filter Preview Line */}
        <div className="p-3 rounded-xl bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-between gap-2 text-xs">
          <span className="text-[var(--text-muted)]">Workouts in selection:</span>
          <span className="font-bold text-[var(--text-primary)] tabular-nums">
            {matchingWorkouts.length} of {workouts.length} total
          </span>
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-2.5">
          <Button variant="ghost" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>

          <Button
            variant="primary"
            onClick={handleExport}
            disabled={!isValidRange || matchingWorkouts.length === 0 || isExporting}
            leftIcon={<Download className="w-4 h-4" />}
          >
            {isExporting ? 'Exporting...' : `Export (${matchingWorkouts.length})`}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
