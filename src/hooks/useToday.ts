import { useState, useEffect } from 'react';
import { ISODate } from '../domain/types';
import { toISODate } from '../domain/dates';

/**
 * Returns the current local calendar date (YYYY-MM-DD).
 * Automatically updates at local midnight and when the tab regains focus or visibility,
 * guaranteeing that day-boundary transitions, streaks, and day dots update without a reload.
 */
export function useToday(): ISODate {
  const [today, setToday] = useState<ISODate>(() => toISODate(new Date()));

  useEffect(() => {
    function updateDate() {
      const nowIso = toISODate(new Date());
      setToday((prev) => (prev !== nowIso ? nowIso : prev));
    }

    // Check when user returns to tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        updateDate();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', updateDate);

    // Schedule midnight timer
    let timerId: number | undefined;

    function scheduleMidnightCheck() {
      const now = new Date();
      // Next midnight in local time
      const tomorrowMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0,
        0,
        0,
        50 // 50ms buffer
      );
      const msUntilMidnight = tomorrowMidnight.getTime() - now.getTime();

      timerId = window.setTimeout(() => {
        updateDate();
        scheduleMidnightCheck();
      }, Math.max(1000, msUntilMidnight));
    }

    scheduleMidnightCheck();

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', updateDate);
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  return today;
}
