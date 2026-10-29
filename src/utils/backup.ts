import { useAppStore } from '../store/useAppStore';
import { toISODate } from '../domain/dates';

/**
 * Exports data using the Web Share API if supported on mobile devices (shares a file),
 * or falls back to standard file download.
 */
export async function exportBackupWithShare(): Promise<{ success: boolean; method: 'share' | 'download' }> {
  const state = useAppStore.getState();
  const exportObject = {
    schemaVersion: 1,
    workouts: state.workouts,
    settings: state.settings,
    seenCelebrations: state.seenCelebrations,
    lastExportAt: Date.now(),
  };

  const jsonStr = JSON.stringify(exportObject, null, 2);
  const todayStr = toISODate(new Date());
  const fileName = `cozyfit-backup-${todayStr}.json`;

  // Update lastExportAt in store
  useAppStore.setState({ lastExportAt: Date.now() });

  // 1. Check if Web Share API with files is supported (iOS Safari 15+, Android Chrome)
  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      const file = new File([jsonStr], fileName, { type: 'application/json' });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          title: 'CozyFit Workout Backup',
          text: `My CozyFit backup with ${state.workouts.length} recorded workouts.`,
          files: [file],
        });
        return { success: true, method: 'share' };
      }
    } catch (err: unknown) {
      // User might have canceled the share sheet (AbortError) - don't crash
      if (err instanceof Error && err.name === 'AbortError') {
        return { success: true, method: 'share' };
      }
      console.warn('Web Share failed, falling back to download:', err);
    }
  }

  // 2. Fallback to anchor download
  try {
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return { success: true, method: 'download' };
  } catch (err) {
    console.error('File download failed:', err);
    return { success: false, method: 'download' };
  }
}
