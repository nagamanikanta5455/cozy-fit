import { useState, useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';

/**
 * Hook to determine whether animations should be simplified or disabled,
 * based on user preference in settings combined with system prefers-reduced-motion media query.
 */
export function useReducedMotion(): boolean {
  const setting = useAppStore((state) => state.settings.reducedMotion);
  const [systemReduced, setSystemReduced] = useState(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handler = (event: MediaQueryListEvent) => setSystemReduced(event.matches);

    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  if (setting === 'on') return true;
  if (setting === 'off') return false;
  return systemReduced;
}
