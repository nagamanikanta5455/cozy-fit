import { Workout, Settings, ISODate } from '../domain/types';
import { toISODate } from '../domain/dates';
import { useAppStore } from './useAppStore';

export interface ExportRange {
  start: ISODate;
  end: ISODate;
}

export interface ExportResult {
  success: boolean;
  method?: 'download';
  count: number;
  error?: string;
  cancelled?: boolean;
}

/**
 * Filter workouts within an inclusive [start, end] local date range.
 * Lexicographical comparison matches chronological order for YYYY-MM-DD.
 */
export function filterWorkoutsByRange(
  workouts: Workout[],
  start: ISODate,
  end: ISODate
): Workout[] {
  return workouts.filter((w) => w.date >= start && w.date <= end);
}

/**
 * Export workouts matching a date range (or all-time) via direct Blob file download.
 * Updates lastExportAt only if all workouts are included in the export.
 */
export async function exportWorkoutsWithRange(
  workouts: Workout[],
  settings: Settings,
  range: ExportRange,
  isAllTime: boolean = false
): Promise<ExportResult> {
  const filteredWorkouts = filterWorkoutsByRange(workouts, range.start, range.end);
  const today = toISODate(new Date());

  const filename = isAllTime
    ? `cozyfit-all-time-${today}.json`
    : `cozyfit-${range.start}_to_${range.end}.json`;

  const exportPayload = {
    schemaVersion: 1,
    exportedAt: Date.now(),
    range: {
      start: range.start,
      end: range.end,
    },
    workouts: filteredWorkouts,
    settings,
    seenCelebrations: [],
  };

  const jsonString = JSON.stringify(exportPayload, null, 2);

  // Desktop file download through temporary anchor
  try {
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    if (isAllTime || filteredWorkouts.length === workouts.length) {
      useAppStore.setState({ lastExportAt: Date.now() });
    }

    return {
      success: true,
      method: 'download',
      count: filteredWorkouts.length,
    };
  } catch (err) {
    console.error('Blob download failed:', err);
    return {
      success: false,
      count: filteredWorkouts.length,
      error: 'Could not create download file.',
    };
  }
}
