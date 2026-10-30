import React, { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { exportBackupWithShare } from '../../utils/backup';
import { useToast } from '../ui/Toast';
import { ShieldCheck, X } from 'lucide-react';

interface BackupNudgeCardProps {
  workoutCount: number;
}

export const BackupNudgeCard: React.FC<BackupNudgeCardProps> = ({ workoutCount }) => {
  const lastExportAt = useAppStore((state) => state.lastExportAt);
  const { showToast } = useToast();
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || workoutCount < 5) return null;

  const isMultipleOf10 = workoutCount % 10 === 0;
  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  const isStaleExport =
    !lastExportAt ? workoutCount >= 10 : Date.now() - lastExportAt > thirtyDaysMs;

  if (!isMultipleOf10 && !isStaleExport) {
    return null;
  }

  const handleBackup = async () => {
    const res = await exportBackupWithShare();
    if (res.success) {
      showToast({
        type: 'success',
        title: 'Backup saved',
        description: 'Downloaded backup file.',
      });
      setDismissed(true);
    }
  };

  return (
    <div className="rounded-xl p-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-3">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center shrink-0">
          <ShieldCheck className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <h4 className="text-xs font-semibold text-[var(--text-primary)] truncate">
            Back up your progress
          </h4>
          <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
            Export a local JSON copy of your {workoutCount} workouts.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={handleBackup}
          className="px-3 py-1.5 h-8 rounded-lg bg-[var(--bg-surface-raised)] hover:bg-[var(--accent-fill)] hover:text-[#0E0F12] border border-[var(--border-subtle)] text-xs font-semibold text-[var(--text-primary)] cursor-pointer transition-standard"
        >
          Export
        </button>
        <button
          type="button"
          onClick={() => setDismissed(true)}
          aria-label="Dismiss backup notice"
          title="Dismiss"
          className="h-8 w-8 flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] rounded-lg transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
