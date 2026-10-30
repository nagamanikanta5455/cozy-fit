import React, { useState, useRef } from 'react';
import { Modal } from '../ui/Modal';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { useToday } from '../../hooks/useToday';
import { ExportDataModal } from '../export/ExportDataModal';
import { validatePriorStats, sanitizePriorStats, sumLoggedTotals } from '../../store/statsSelectors';
import { calculateStreak } from '../../domain/streak';
import { PriorStats } from '../../domain/types';
import {
  Sun,
  Moon,
  Laptop,
  Download,
  Upload,
  AlertTriangle,
  RotateCcw,
  Check,
  User,
  History,
  Info,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const today = useToday();
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const workouts = useAppStore((state) => state.workouts);
  const importData = useAppStore((state) => state.importData);
  const resetAll = useAppStore((state) => state.resetAll);

  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [displayName, setDisplayName] = useState(settings.displayName || 'Athlete');
  const [weeklyGoal, setWeeklyGoal] = useState(settings.weeklyGoal || 3);
  const [theme, setTheme] = useState(settings.theme || 'evening');
  const [reducedMotion, setReducedMotion] = useState(settings.reducedMotion || 'system');

  // Prior stats form state
  const initialPrior = sanitizePriorStats(settings.priorStats);
  const [priorWorkouts, setPriorWorkouts] = useState<number | ''>(
    initialPrior.totalWorkouts || ''
  );
  const [priorMinutes, setPriorMinutes] = useState<number | ''>(
    initialPrior.totalMinutes || ''
  );
  const [priorStreak, setPriorStreak] = useState<number | ''>(
    initialPrior.longestStreak || ''
  );
  const [priorErrors, setPriorErrors] = useState<string[]>([]);
  const [priorSaved, setPriorSaved] = useState(false);

  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Live calculation for preview
  const loggedTotals = sumLoggedTotals(workouts);
  const loggedStreak = calculateStreak(workouts, today);

  const safePriorWorkouts = typeof priorWorkouts === 'number' ? Math.max(0, priorWorkouts) : 0;
  const safePriorMinutes = typeof priorMinutes === 'number' ? Math.max(0, priorMinutes) : 0;
  const safePriorStreak = typeof priorStreak === 'number' ? Math.max(0, priorStreak) : 0;

  const previewTotalWorkouts = loggedTotals.totalWorkouts + safePriorWorkouts;
  const previewTotalMinutes = loggedTotals.totalMinutes + safePriorMinutes;
  const previewLongestStreak = Math.max(loggedStreak.longest, safePriorStreak);

  const handleSavePriorHistory = () => {
    const candidatePrior: PriorStats = {
      totalWorkouts: typeof priorWorkouts === 'number' ? priorWorkouts : 0,
      totalMinutes: typeof priorMinutes === 'number' ? priorMinutes : 0,
      longestStreak: typeof priorStreak === 'number' ? priorStreak : 0,
    };

    const validation = validatePriorStats(candidatePrior);
    if (!validation.ok) {
      setPriorErrors(validation.errors);
      return;
    }

    setPriorErrors([]);
    updateSettings({
      priorStats: validation.value,
    });

    setPriorSaved(true);
    showToast({
      type: 'success',
      title: 'Prior stats saved',
      description: 'Your prior workout history baselines have been updated.',
    });

    setTimeout(() => {
      setPriorSaved(false);
    }, 2500);
  };

  const handleSave = () => {
    // Validate prior stats
    const candidatePrior: PriorStats = {
      totalWorkouts: typeof priorWorkouts === 'number' ? priorWorkouts : 0,
      totalMinutes: typeof priorMinutes === 'number' ? priorMinutes : 0,
      longestStreak: typeof priorStreak === 'number' ? priorStreak : 0,
    };

    const validation = validatePriorStats(candidatePrior);
    if (!validation.ok) {
      setPriorErrors(validation.errors);
      return;
    }

    setPriorErrors([]);
    updateSettings({
      displayName: displayName.trim() || 'Athlete',
      weeklyGoal,
      theme,
      reducedMotion,
      priorStats: validation.value,
    });

    showToast({
      type: 'success',
      title: 'Preferences saved',
      description: 'Your settings and history baselines have been updated.',
    });
    onClose();
  };

  const handleOpenExportModal = () => {
    setIsExportModalOpen(true);
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      // Merge by workout id
      const result = importData(content, 'merge');
      if (result.success) {
        showToast({
          type: 'success',
          title: 'Workouts merged',
          description: `Added ${result.addedCount ?? 0} new, updated ${result.updatedCount ?? 0} workout${(result.updatedCount ?? 0) === 1 ? '' : 's'}.`,
        });
        onClose();
      } else {
        showToast({
          type: 'warning',
          title: 'Import failed',
          description: result.error || 'Invalid file format.',
        });
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleConfirmReset = () => {
    resetAll();
    setShowResetConfirm(false);
    showToast({
      type: 'info',
      title: 'Data reset',
      description: 'All local workout data and preferences have been cleared.',
    });
    onClose();
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title="Settings"
        description="Manage preferences, weekly targets, prior history, and local data."
        maxWidth="md"
      >
        <div className="space-y-6">
          {/* Name input */}
          <div>
            <label
              htmlFor="display-name"
              className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
            >
              <User className="w-3.5 h-3.5" />
              Display Name
            </label>
            <input
              id="display-name"
              type="text"
              maxLength={35}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-base rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] font-medium focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)]"
              placeholder="Athlete name"
            />
          </div>

          {/* Theme Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setTheme('evening')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-standard cursor-pointer ${
                  theme === 'evening'
                    ? 'border-[var(--accent-fill)] bg-[var(--bg-surface-raised)] ring-1 ring-[var(--accent-fill)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-subtle)]/80 text-[var(--text-muted)]'
                }`}
              >
                <Moon className="w-4 h-4 text-[var(--text-primary)]" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">Dark</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-standard cursor-pointer ${
                  theme === 'light'
                    ? 'border-[var(--accent-fill)] bg-[var(--bg-surface-raised)] ring-1 ring-[var(--accent-fill)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-subtle)]/80 text-[var(--text-muted)]'
                }`}
              >
                <Sun className="w-4 h-4 text-[var(--text-primary)]" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">Light</span>
              </button>

              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`p-3 rounded-xl border flex flex-col items-center gap-1.5 transition-standard cursor-pointer ${
                  theme === 'system'
                    ? 'border-[var(--accent-fill)] bg-[var(--bg-surface-raised)] ring-1 ring-[var(--accent-fill)]'
                    : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] hover:border-[var(--border-subtle)]/80 text-[var(--text-muted)]'
                }`}
              >
                <Laptop className="w-4 h-4 text-[var(--text-primary)]" />
                <span className="text-xs font-semibold text-[var(--text-primary)]">System</span>
              </button>
            </div>
          </div>

          {/* Weekly Goal Stepper */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                Weekly Goal
              </label>
              <span className="text-xs text-[var(--accent-text)] font-semibold tabular-nums">
                {weeklyGoal} days / week
              </span>
            </div>
            <div className="flex gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                <button
                  key={num}
                  type="button"
                  onClick={() => setWeeklyGoal(num)}
                  className={`flex-1 py-2 rounded-xl text-sm font-semibold tabular-nums border transition-standard cursor-pointer ${
                    weeklyGoal === num
                      ? 'bg-[var(--accent-fill)] text-[#0E0F12] border-[var(--accent-fill)] font-bold'
                      : 'bg-[var(--bg-surface-raised)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Prior History (Before CozyFit) */}
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <div className="flex items-center justify-between mb-2">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                <History className="w-3.5 h-3.5" />
                Prior Workout History
              </label>
              <span className="text-[11px] text-[var(--text-faint)]">Additive baseline</span>
            </div>

            <div className="p-3.5 rounded-xl bg-[var(--bg-surface-raised)]/30 border border-[var(--border-subtle)] space-y-3">
              <div className="flex items-start gap-2 text-xs text-[var(--text-muted)] leading-relaxed">
                <Info className="w-4 h-4 text-[var(--accent-fill)] shrink-0 mt-0.5" />
                <p>
                  Add your past stats from before using CozyFit. These numbers are added to your dashboard totals so you don't lose your all-time progress.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1">
                <div>
                  <label
                    htmlFor="prior-workouts"
                    className="block text-[11px] font-medium text-[var(--text-muted)] mb-1 truncate"
                  >
                    Prior Workouts
                  </label>
                  <input
                    id="prior-workouts"
                    type="number"
                    min={0}
                    max={100000}
                    placeholder="0"
                    value={priorWorkouts}
                    onChange={(e) =>
                      setPriorWorkouts(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] text-sm tabular-nums focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="prior-minutes"
                    className="block text-[11px] font-medium text-[var(--text-muted)] mb-1 truncate"
                  >
                    Prior Minutes
                  </label>
                  <input
                    id="prior-minutes"
                    type="number"
                    min={0}
                    max={6000000}
                    placeholder="0"
                    value={priorMinutes}
                    onChange={(e) =>
                      setPriorMinutes(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] text-sm tabular-nums focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)]"
                  />
                </div>

                <div>
                  <label
                    htmlFor="prior-streak"
                    className="block text-[11px] font-medium text-[var(--text-muted)] mb-1 truncate"
                  >
                    Longest Streak
                  </label>
                  <input
                    id="prior-streak"
                    type="number"
                    min={0}
                    max={36500}
                    placeholder="0"
                    value={priorStreak}
                    onChange={(e) =>
                      setPriorStreak(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    className="w-full px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] text-sm tabular-nums focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)]"
                  />
                </div>
              </div>

              {priorErrors.length > 0 && (
                <div className="space-y-1">
                  {priorErrors.map((err, i) => (
                    <p key={i} className="text-xs text-[#F87171]">
                      {err}
                    </p>
                  ))}
                </div>
              )}

              {/* Live Preview & Dedicated Save Button */}
              <div className="pt-2 border-t border-[var(--border-subtle)]/60 flex flex-wrap items-center justify-between gap-2.5">
                <div className="text-xs text-[var(--text-faint)]">
                  <span>Grand Total Preview: </span>
                  <span className="font-semibold text-[var(--text-primary)] tabular-nums">
                    {previewTotalWorkouts} sessions • {previewTotalMinutes}m • {previewLongestStreak}d record
                  </span>
                </div>

                <Button
                  type="button"
                  size="sm"
                  variant={priorSaved ? 'primary' : 'secondary'}
                  onClick={handleSavePriorHistory}
                  leftIcon={priorSaved ? <Check className="w-3.5 h-3.5 stroke-[2.5]" /> : undefined}
                  className={`text-xs ${
                    priorSaved ? '!bg-[var(--accent-fill)] !text-[#0E0F12] font-bold' : ''
                  }`}
                >
                  {priorSaved ? 'Saved!' : 'Save History'}
                </Button>
              </div>
            </div>
          </div>

          {/* Backup & Restore */}
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
              Backup & Export
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="secondary"
                onClick={handleOpenExportModal}
                leftIcon={<Download className="w-4 h-4" />}
                className="flex-1"
              >
                Export Data
              </Button>

              <Button
                type="button"
                variant="secondary"
                onClick={handleImportClick}
                leftIcon={<Upload className="w-4 h-4" />}
                className="flex-1"
              >
                Import JSON
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          </div>

          {/* Danger Zone */}
          <div className="pt-4 border-t border-[var(--border-subtle)]">
            {!showResetConfirm ? (
              <button
                type="button"
                onClick={() => setShowResetConfirm(true)}
                className="text-xs font-semibold text-[#F87171] hover:underline flex items-center gap-1.5 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Erase all local data
              </button>
            ) : (
              <div className="p-4 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F87171]">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Erase all local data?</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  This permanently deletes all {workouts.length} recorded workouts and streak history.
                  This cannot be undone without a backup file.
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={handleConfirmReset}
                  >
                    Yes, Erase
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setShowResetConfirm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Action footer */}
          <div className="pt-4 border-t border-[var(--border-subtle)] flex justify-end gap-2.5">
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              leftIcon={<Check className="w-4 h-4" />}
            >
              Save
            </Button>
          </div>
        </div>
      </Modal>

      {/* Date-Range Export Modal */}
      <ExportDataModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        workouts={workouts}
        settings={settings}
        today={today}
      />
    </>
  );
};
