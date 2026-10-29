import { useAppStore } from '../store/useAppStore';

export type HapticType = 'light' | 'success' | 'milestone';

/**
 * Triggers subtle vibration feedback if supported by device and permitted by motion preferences.
 */
export function triggerHaptic(type: HapticType = 'light') {
  if (typeof window === 'undefined' || !navigator.vibrate) return;

  const setting = useAppStore.getState().settings.reducedMotion;
  const systemReduced =
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (setting === 'on' || (setting === 'system' && systemReduced)) {
    return;
  }

  try {
    switch (type) {
      case 'light':
        navigator.vibrate(15);
        break;
      case 'success':
        navigator.vibrate(28);
        break;
      case 'milestone':
        navigator.vibrate([35, 50, 35]);
        break;
    }
  } catch {
    // Gracefully handle browser restrictions
  }
}
