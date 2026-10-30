import React, { useState, useRef } from 'react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useAppStore } from '../store/useAppStore';
import { useToast } from '../components/ui/Toast';
import { useToday } from '../hooks/useToday';
import { ExportDataModal } from '../components/export/ExportDataModal';
import { validatePriorStats, sanitizePriorStats, sumLoggedTotals } from '../store/statsSelectors';
import { calculateStreak } from '../domain/streak';
import { PriorStats } from '../domain/types';
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
  Sliders,
  Database,
  Info,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const today = useToday();
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const workouts = useAppStore((state) => state.workouts);
  const importData = useAppStore((state) => state.importData);
  const resetAll = useAppStore((state) => state.resetAll);

  const { showToast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [activeSection, setActiveSection] = useState<'preferences' | 'history' | 'data'>('preferences');

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

  const handleSavePreferences = () => {
    updateSettings({
      displayName: displayName.trim() || 'Athlete',
      weeklyGoal,
      theme,
      reducedMotion,
    });

    showToast({
      type: 'success',
      title: 'Preferences saved',
      description: 'Your display and theme preferences have been updated.',
    });
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (!content) return;

      const result = importData(content, 'merge');
      if (result.success) {
        showToast({
          type: 'success',
          title: 'Workouts merged',
          description: `Added ${result.addedCount ?? 0} new, updated ${result.updatedCount ?? 0} workout${(result.updatedCount ?? 0) === 1 ? '' : 's'}.`,
        });
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
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Title */}
      <div>
        <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
          Settings
        </h2>
        <p className="text-xs text-[var(--text-muted)] mt-1">
          Manage preferences, weekly targets, prior history, and local backups.
        </p>
      </div>

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Section Navigation */}
        <div className="md:col-span-4 sticky top-20 space-y-1">
          <Card className="p-2 space-y-1" variant="default">
            <button
              type="button"
              onClick={() => setActiveSection('preferences')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-standard text-left ${
                activeSection === 'preferences'
                  ? 'bg-[var(--accent-fill)] text-[#0E0F12] font-bold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]'
              }`}
            >
              <Sliders className="w-4 h-4 shrink-0" />
              <span>Preferences</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('history')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-standard text-left ${
                activeSection === 'history'
                  ? 'bg-[var(--accent-fill)] text-[#0E0F12] font-bold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]'
              }`}
            >
              <History className="w-4 h-4 shrink-0" />
              <span>Your History</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveSection('data')}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-standard text-left ${
                activeSection === 'data'
                  ? 'bg-[var(--accent-fill)] text-[#0E0F12] font-bold shadow-xs'
                  : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)]'
              }`}
            >
              <Database className="w-4 h-4 shrink-0" />
              <span>Data & Backup</span>
            </button>
          </Card>
        </div>

        {/* Right Column: Section Content in Cards */}
        <div className="md:col-span-8 space-y-6">
          {/* SECTION 1: PREFERENCES */}
          {activeSection === 'preferences' && (
            <Card className="p-5 space-y-5" variant="default">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Preferences
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Customize theme, weekly target, and identity.
                </p>
              </div>

              {/* Display Name */}
              <div>
                <label
                  htmlFor="desktop-display-name"
                  className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-1.5"
                >
                  <User className="w-3.5 h-3.5" />
                  <span>Display Name</span>
                </label>
                <input
                  id="desktop-display-name"
                  type="text"
                  maxLength={35}
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="w-full h-10 px-3.5 text-sm rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] font-medium focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)]"
                  placeholder="Athlete name"
                />
              </div>

              {/* Theme Picker */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Theme Mode
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTheme('evening')}
                    className={`h-11 px-3 rounded-xl border flex items-center justify-center gap-2 transition-standard cursor-pointer ${
                      theme === 'evening'
                        ? 'border-[var(--accent-fill)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] font-bold'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Moon className="w-4 h-4 text-[var(--accent-fill)]" />
                    <span className="text-xs">Dark</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('light')}
                    className={`h-11 px-3 rounded-xl border flex items-center justify-center gap-2 transition-standard cursor-pointer ${
                      theme === 'light'
                        ? 'border-[var(--accent-fill)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] font-bold'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Sun className="w-4 h-4 text-[var(--accent-fill)]" />
                    <span className="text-xs">Light</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTheme('system')}
                    className={`h-11 px-3 rounded-xl border flex items-center justify-center gap-2 transition-standard cursor-pointer ${
                      theme === 'system'
                        ? 'border-[var(--accent-fill)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] font-bold'
                        : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                    }`}
                  >
                    <Laptop className="w-4 h-4 text-[var(--accent-fill)]" />
                    <span className="text-xs">System</span>
                  </button>
                </div>
              </div>

              {/* Weekly Goal Stepper */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label
                    htmlFor="desktop-goal-slider"
                    className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]"
                  >
                    Weekly Workout Goal
                  </label>
                  <span className="text-xs font-bold text-[var(--text-primary)] tabular-nums">
                    {weeklyGoal} {weeklyGoal === 1 ? 'workout' : 'workouts'} / week
                  </span>
                </div>
                <input
                  id="desktop-goal-slider"
                  type="range"
                  min="1"
                  max="7"
                  step="1"
                  value={weeklyGoal}
                  onChange={(e) => setWeeklyGoal(parseInt(e.target.value, 10))}
                  className="w-full accent-[var(--accent-fill)] cursor-pointer h-2 bg-[var(--bg-surface-raised)] rounded-lg"
                />
              </div>

              {/* Reduced Motion Setting */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] mb-2">
                  Motion & Animation
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {(['system', 'off', 'on'] as const).map((mode) => (
                    <button
                      key={mode}
                      type="button"
                      onClick={() => setReducedMotion(mode)}
                      className={`h-10 px-3 rounded-xl border text-xs font-semibold capitalize transition-standard cursor-pointer ${
                        reducedMotion === mode
                          ? 'border-[var(--accent-fill)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] font-bold'
                          : 'border-[var(--border-subtle)] bg-[var(--bg-surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex justify-end">
                <Button variant="primary" onClick={handleSavePreferences}>
                  Save Preferences
                </Button>
              </div>
            </Card>
          )}

          {/* SECTION 2: PRIOR WORKOUT HISTORY */}
          {activeSection === 'history' && (
            <Card className="p-5 space-y-5" variant="default">
              <div>
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-[var(--accent-fill)]" />
                  <h3 className="text-sm font-bold text-[var(--text-primary)]">
                    Prior Workout History
                  </h3>
                </div>
                <div className="mt-2 p-3 rounded-xl bg-[var(--bg-surface-raised)]/40 border border-[var(--border-subtle)] flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-[var(--accent-fill)] shrink-0 mt-0.5" />
                  <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                    Enter workouts, minutes, or your longest streak completed before using CozyFit.
                    These will be added to your all-time totals and badge progress without cluttering your recent activity.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label
                    htmlFor="prior-workouts"
                    className="block text-xs font-semibold text-[var(--text-muted)] mb-1"
                  >
                    Prior Workouts
                  </label>
                  <input
                    id="prior-workouts"
                    type="number"
                    min="0"
                    max="10000"
                    value={priorWorkouts}
                    onChange={(e) =>
                      setPriorWorkouts(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    className="w-full h-10 px-3 text-sm rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] font-medium tabular-nums focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)]"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="prior-minutes"
                    className="block text-xs font-semibold text-[var(--text-muted)] mb-1"
                  >
                    Prior Minutes
                  </label>
                  <input
                    id="prior-minutes"
                    type="number"
                    min="0"
                    max="600000"
                    value={priorMinutes}
                    onChange={(e) =>
                      setPriorMinutes(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    className="w-full h-10 px-3 text-sm rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] font-medium tabular-nums focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)]"
                    placeholder="0"
                  />
                </div>

                <div>
                  <label
                    htmlFor="prior-streak"
                    className="block text-xs font-semibold text-[var(--text-muted)] mb-1"
                  >
                    Longest Streak (Days)
                  </label>
                  <input
                    id="prior-streak"
                    type="number"
                    min="0"
                    max="3650"
                    value={priorStreak}
                    onChange={(e) =>
                      setPriorStreak(e.target.value === '' ? '' : parseInt(e.target.value, 10))
                    }
                    className="w-full h-10 px-3 text-sm rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)] text-[var(--text-primary)] font-medium tabular-nums focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)]"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Validation errors */}
              {priorErrors.length > 0 && (
                <div className="p-3 rounded-xl bg-[#F87171]/10 border border-[#F87171]/30 space-y-1">
                  {priorErrors.map((err, i) => (
                    <p key={i} className="text-xs text-[#F87171]">
                      {err}
                    </p>
                  ))}
                </div>
              )}

              {/* Live Preview */}
              <div className="p-3.5 rounded-xl bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-between text-xs">
                <span className="text-[var(--text-muted)] font-medium">All-time Combined Preview:</span>
                <span className="font-bold text-[var(--text-primary)] tabular-nums">
                  {previewTotalWorkouts} workouts • {previewTotalMinutes}m • {previewLongestStreak}d streak
                </span>
              </div>

              <div className="pt-3 border-t border-[var(--border-subtle)] flex items-center justify-end gap-3">
                <Button
                  variant="primary"
                  onClick={handleSavePriorHistory}
                  leftIcon={priorSaved ? <Check className="w-4 h-4 stroke-[2.5]" /> : undefined}
                >
                  {priorSaved ? 'Saved!' : 'Save History'}
                </Button>
              </div>
            </Card>
          )}

          {/* SECTION 3: DATA & BACKUP */}
          {activeSection === 'data' && (
            <Card className="p-5 space-y-5" variant="default">
              <div>
                <h3 className="text-sm font-bold text-[var(--text-primary)]">
                  Data & Backup
                </h3>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Export JSON backups, restore workouts, or reset all local data.
                </p>
              </div>

              {/* Hidden file input for import */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,application/json"
                className="hidden"
                onChange={handleImportFile}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Export */}
                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]/30 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Download className="w-4 h-4 text-[var(--accent-fill)]" />
                      Export Data
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Download a JSON file of your workouts and settings with custom date ranges.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    fullWidth
                    size="sm"
                    onClick={() => setIsExportModalOpen(true)}
                  >
                    Open Export Dialog
                  </Button>
                </div>

                {/* Import */}
                <div className="p-4 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-surface-raised)]/30 flex flex-col justify-between space-y-3">
                  <div>
                    <h4 className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
                      <Upload className="w-4 h-4 text-[var(--accent-fill)]" />
                      Import & Merge
                    </h4>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Merge past backups into your current workout history without duplicates.
                    </p>
                  </div>
                  <Button
                    variant="secondary"
                    fullWidth
                    size="sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Choose JSON File
                  </Button>
                </div>
              </div>

              {/* Danger Zone: Reset */}
              <div className="pt-4 border-t border-[var(--border-subtle)] flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-[#F87171] flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4" />
                    Reset All Data
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Permanently delete all workouts and reset preferences to default.
                  </p>
                </div>

                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => setShowResetConfirm(true)}
                >
                  Reset All
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Export Modal */}
      {isExportModalOpen && (
        <ExportDataModal
          isOpen={isExportModalOpen}
          onClose={() => setIsExportModalOpen(false)}
          workouts={workouts}
          settings={settings}
          today={today}
        />
      )}

      {/* Reset Confirmation Modal */}
      <Modal
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        title="Reset all application data?"
        description="This action is permanent and cannot be undone."
        maxWidth="sm"
      >
        <div className="space-y-4">
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            All recorded workout sessions, streaks, custom preferences, and unlocked milestone
            achievements will be cleared immediately from this browser.
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border-subtle)]">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowResetConfirm(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmReset}
            >
              Yes, reset all data
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
