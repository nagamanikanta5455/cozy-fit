import React, { useEffect } from 'react';
import { Header } from './Header';
import { BottomNav } from './BottomNav';
import { useAppStore } from '../../store/useAppStore';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { AlertTriangle } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
  onOpenLogger: () => void;
  onOpenSettings: () => void;
  streakCount: number;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  onOpenLogger,
  onOpenSettings,
  streakCount,
}) => {
  const theme = useAppStore((state) => state.settings.theme);
  const quotaWarning = useAppStore((state) => state.quotaWarning);
  const isReduced = useReducedMotion();

  // Apply theme class and dynamically update meta[name="theme-color"]
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    let isLight = false;
    if (theme === 'light') {
      isLight = true;
    } else if (theme === 'system') {
      isLight = !window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    const themeColor = isLight ? '#F6F5F2' : '#0E0F12';

    if (isLight) {
      root.classList.add('light');
      body.classList.add('light');
      root.classList.remove('evening', 'dark');
      body.classList.remove('evening', 'dark');
    } else {
      root.classList.remove('light');
      body.classList.remove('light');
    }

    // Dynamic update of theme-color meta tag for PWA status bar & chrome
    const metaThemeColor = document.getElementById('theme-color-meta');
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', themeColor);
    } else {
      let meta = document.querySelector('meta[name="theme-color"]');
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute('name', 'theme-color');
        document.head.appendChild(meta);
      }
      meta.setAttribute('content', themeColor);
    }

    if (isReduced) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [theme, isReduced]);

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-200 relative pb-20 sm:pb-12 overflow-x-hidden">
      {/* Quota Exceeded Warning Banner */}
      {quotaWarning && (
        <div className="bg-[#F87171] text-[#0E0F12] px-4 py-2 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs pt-safe">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Local storage quota is nearly full. Export a JSON backup to protect history.</span>
          </div>
          <button
            type="button"
            onClick={() => onOpenSettings()}
            className="underline shrink-0 text-[#0E0F12] hover:opacity-80 cursor-pointer min-h-[44px] flex items-center"
          >
            Settings
          </button>
        </div>
      )}

      {/* Header */}
      <Header onOpenLogger={onOpenLogger} onOpenSettings={onOpenSettings} />

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-md md:max-w-3xl mx-auto px-4 py-5 sm:py-7 space-y-5">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <BottomNav
        onOpenLogger={onOpenLogger}
        onOpenSettings={onOpenSettings}
        onScrollToTop={handleScrollToTop}
        streakCount={streakCount}
      />
    </div>
  );
};
