import { useAppStore } from '../store/useAppStore';
import { toISODate } from '../domain/dates';

/**
 * Exports data through direct browser file download.
 */
export async function exportBackupWithShare(): Promise<{ success: boolean; method: 'download' }> {
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
