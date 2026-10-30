import { useEffect } from 'react';

interface UseKeyboardShortcutsOptions {
  onOpenLogger: () => void;
  onNavigate: (page: string) => void;
  isModalOrDrawerOpen?: boolean;
  onCloseTopOverlay?: () => void;
}

export function useKeyboardShortcuts({
  onOpenLogger,
  onNavigate,
  isModalOrDrawerOpen = false,
  onCloseTopOverlay,
}: UseKeyboardShortcutsOptions) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Always allow Escape to close top overlay
      if (e.key === 'Escape') {
        if (onCloseTopOverlay) {
          onCloseTopOverlay();
        }
        return;
      }

      // Ignore shortcuts if user is typing in form controls
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Ignore standard key navigation if a modal or drawer is open
      if (isModalOrDrawerOpen) {
        return;
      }

      // Don't trigger if modifier keys are active (Cmd/Ctrl/Alt)
      if (e.metaKey || e.ctrlKey || e.altKey) {
        return;
      }

      // N opens logger
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        onOpenLogger();
        return;
      }

      // 1 to 4 switch pages
      if (e.key === '1') {
        e.preventDefault();
        onNavigate('dashboard');
      } else if (e.key === '2') {
        e.preventDefault();
        onNavigate('journey');
      } else if (e.key === '3') {
        e.preventDefault();
        onNavigate('badges');
      } else if (e.key === '4') {
        e.preventDefault();
        onNavigate('settings');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onOpenLogger, onNavigate, isModalOrDrawerOpen, onCloseTopOverlay]);
}
