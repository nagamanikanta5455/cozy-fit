import React, { useState, useEffect } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import { format } from 'date-fns';
import {
  LayoutDashboard,
  CalendarDays,
  Award,
  Settings as SettingsIcon,
  Plus,
  Sun,
  Moon,
  Keyboard,
  Flame,
  AlertTriangle,
  Monitor,
} from 'lucide-react';
import { Z_INDEX } from '../../constants/zIndex';

export type PageRoute = 'dashboard' | 'journey' | 'badges' | 'settings';

interface AppShellProps {
  children: React.ReactNode;
  activeRoute: PageRoute;
  onRouteChange: (route: PageRoute) => void;
  onOpenLogger: () => void;
  streakCount: number;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  activeRoute,
  onRouteChange,
  onOpenLogger,
  streakCount,
}) => {
  const theme = useAppStore((state) => state.settings.theme);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const quotaWarning = useAppStore((state) => state.quotaWarning);
  const isReduced = useReducedMotion();

  const [showShortcuts, setShowShortcuts] = useState(false);

  // Apply theme class
  useEffect(() => {
    const root = document.documentElement;
    const body = document.body;

    let isLight = false;
    if (theme === 'light') {
      isLight = true;
    } else if (theme === 'system') {
      isLight = !window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (isLight) {
      root.classList.add('light');
      body.classList.add('light');
      root.classList.remove('evening', 'dark');
      body.classList.remove('evening', 'dark');
    } else {
      root.classList.remove('light');
      body.classList.remove('light');
    }

    if (isReduced) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }
  }, [theme, isReduced]);

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'evening' : 'light';
    updateSettings({ theme: nextTheme });
  };

  const navItems = [
    { id: 'dashboard' as const, label: 'Dashboard', icon: LayoutDashboard, keyHint: '1' },
    { id: 'journey' as const, label: 'Journey', icon: CalendarDays, keyHint: '2' },
    { id: 'badges' as const, label: 'Badges', icon: Award, keyHint: '3' },
    { id: 'settings' as const, label: 'Settings', icon: SettingsIcon, keyHint: '4' },
  ];

  const pageTitles: Record<PageRoute, string> = {
    dashboard: 'Dashboard',
    journey: 'The Journey',
    badges: 'Badges & Milestones',
    settings: 'Settings',
  };

  const todayFormatted = format(new Date(), 'EEEE, MMMM d, yyyy');

  return (
    <>
      {/* 1. Calm Minimum Screen Width Notice (< 1024px) */}
      <div className="flex lg:hidden fixed inset-0 z-50 bg-[var(--bg-app)] text-[var(--text-primary)] items-center justify-center p-6 text-center select-none">
        <div className="max-w-sm p-6 rounded-2xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-xl space-y-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--accent-fill)] mx-auto">
            <Monitor className="w-5 h-5 stroke-[1.75]" />
          </div>
          <h2 className="text-base font-bold tracking-tight">Laptop Screen Required</h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            CozyFit is built for laptop and desktop screens. Widen your browser window to continue.
          </p>
        </div>
      </div>

      {/* 2. Desktop Full-Height Grid Application Shell (>= 1024px) */}
      <div className="hidden lg:flex h-screen w-screen overflow-hidden bg-[var(--bg-app)] text-[var(--text-primary)] transition-colors duration-150">
        {/* Fixed Left Sidebar: 72px on 1024-1279px, 240px on >=1280px */}
        <aside
          aria-label="Application sidebar"
          className={`shrink-0 h-full ${Z_INDEX.sidebar} bg-[var(--bg-surface)] border-r border-[var(--border-subtle)] flex flex-col justify-between transition-standard w-[72px] xl:w-[240px]`}
        >
          {/* Top Section: Brand + Log Button + Navigation */}
          <div className="p-3.5 xl:p-5 space-y-5">
            {/* Brand Block (name only, no emoji) */}
            <div className="flex items-center gap-2.5 px-1 py-0.5 select-none">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--accent-fill)] shrink-0" />
              <span className="hidden xl:inline text-lg font-bold tracking-tight text-[var(--text-primary)]">
                CozyFit
              </span>
            </div>

            {/* Primary "Log workout" button with 'N' kbd chip */}
            <div>
              <button
                type="button"
                onClick={onOpenLogger}
                aria-label="Log workout"
                title="Log workout (N)"
                className="w-full h-10 px-2 xl:px-4 rounded-xl bg-[var(--accent-fill)] hover:brightness-105 active:opacity-95 text-[#0E0F12] font-bold text-xs shadow-xs flex items-center justify-center xl:justify-between transition-standard cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <Plus className="w-4 h-4 stroke-[2.25] shrink-0" />
                  <span className="hidden xl:inline">Log workout</span>
                </div>
                <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-[#0E0F12]/15 rounded border border-[#0E0F12]/20 text-[#0E0F12]">
                  N
                </kbd>
              </button>
            </div>

            {/* Navigation List */}
            <nav aria-label="Main navigation" className="space-y-1">
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeRoute === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onRouteChange(item.id)}
                    aria-label={item.label}
                    title={`${item.label} (${item.keyHint})`}
                    className={`w-full flex items-center justify-center xl:justify-between px-3 py-2.5 rounded-xl text-xs font-semibold cursor-pointer transition-standard ${
                      isActive
                        ? 'bg-[var(--bg-surface-raised)] text-[var(--text-primary)] border-l-3 border-[var(--accent-fill)] shadow-xs font-bold'
                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] border-l-3 border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <IconComponent className="w-4 h-4 shrink-0 stroke-[1.8]" />
                      <span className="hidden xl:inline truncate">{item.label}</span>
                    </div>
                    <kbd className="hidden xl:inline-block text-[10px] font-mono text-[var(--text-faint)]">
                      {item.keyHint}
                    </kbd>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom Section: Theme toggle, Streak summary, Keyboard shortcuts */}
          <div className="p-3.5 xl:p-5 border-t border-[var(--border-subtle)] space-y-3">
            {/* Streak summary line */}
            <div className="flex items-center justify-center xl:justify-between px-1 text-xs text-[var(--text-muted)]">
              <div className="flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-[var(--accent-fill)] stroke-[2] shrink-0" />
                <span className="hidden xl:inline">Current streak:</span>
              </div>
              <span className="font-bold text-[var(--text-primary)] tabular-nums">
                {streakCount}d
              </span>
            </div>

            {/* Theme Toggle & Shortcuts row */}
            <div className="flex items-center justify-between gap-1 pt-1">
              <button
                type="button"
                onClick={toggleTheme}
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                className="h-8 w-8 xl:w-auto xl:px-3 rounded-lg flex items-center justify-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] transition-standard cursor-pointer text-xs"
              >
                {theme === 'light' ? (
                  <Moon className="w-3.5 h-3.5" />
                ) : (
                  <Sun className="w-3.5 h-3.5" />
                )}
                <span className="hidden xl:inline capitalize">
                  {theme === 'light' ? 'Dark' : 'Light'}
                </span>
              </button>

              {/* Shortcuts popover button */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowShortcuts((prev) => !prev)}
                  aria-label="View keyboard shortcuts"
                  title="Keyboard shortcuts"
                  className={`h-8 w-8 rounded-lg flex items-center justify-center border transition-standard cursor-pointer ${
                    showShortcuts
                      ? 'bg-[var(--accent-fill)] text-[#0E0F12] border-[var(--accent-fill)]'
                      : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] border-[var(--border-subtle)]'
                  }`}
                >
                  <Keyboard className="w-3.5 h-3.5" />
                </button>

                {/* Popover */}
                {showShortcuts && (
                  <div
                    className={`absolute bottom-10 left-0 xl:left-auto xl:right-0 w-52 p-3 rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] shadow-2xl text-xs space-y-2 ${Z_INDEX.drawerAndDialogs}`}
                  >
                    <div className="flex items-center justify-between border-b border-[var(--border-subtle)] pb-1.5 font-bold text-[var(--text-primary)]">
                      <span>Shortcuts</span>
                      <span className="text-[10px] text-[var(--text-faint)] font-normal">Global</span>
                    </div>
                    <div className="space-y-1.5 text-[11px] text-[var(--text-muted)]">
                      <div className="flex items-center justify-between">
                        <span>Log workout</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] font-mono text-[10px]">
                          N
                        </kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Dashboard</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] font-mono text-[10px]">
                          1
                        </kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Journey</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] font-mono text-[10px]">
                          2
                        </kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Badges</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] font-mono text-[10px]">
                          3
                        </kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Settings</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] font-mono text-[10px]">
                          4
                        </kbd>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Close dialog</span>
                        <kbd className="px-1.5 py-0.5 rounded bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] font-mono text-[10px]">
                          Esc
                        </kbd>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Region: internal scrolling (overflow-y-auto) */}
        <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
          {/* Quota Exceeded Warning Banner */}
          {quotaWarning && (
            <div className="bg-[#F87171] text-[#0E0F12] px-6 py-2 text-xs font-semibold flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Local storage quota is nearly full. Export a JSON backup to protect history.</span>
              </div>
              <button
                type="button"
                onClick={() => onRouteChange('settings')}
                className="underline font-bold hover:opacity-80 cursor-pointer h-7 px-2"
              >
                Go to Settings
              </button>
            </div>
          )}

          {/* Desktop Top Bar inside Main: Sticky z-20 */}
          <header
            aria-label="Page header"
            className={`h-14 shrink-0 px-8 ${Z_INDEX.topbar} bg-[var(--bg-app)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] flex items-center justify-between select-none`}
          >
            <h1 className="text-base font-bold tracking-tight text-[var(--text-primary)]">
              {pageTitles[activeRoute]}
            </h1>

            <div className="flex items-center gap-3">
              {/* Secondary Log Button: Visible ONLY when sidebar is in collapsed icon-rail mode (< 1280px) */}
              <button
                type="button"
                onClick={onOpenLogger}
                aria-label="Log workout"
                className="xl:hidden h-8 px-3 rounded-lg bg-[var(--accent-fill)] hover:brightness-105 active:opacity-95 text-[#0E0F12] font-bold text-xs flex items-center gap-1.5 transition-standard cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Log</span>
              </button>

              <span className="text-xs font-medium text-[var(--text-muted)] tabular-nums">
                {todayFormatted}
              </span>
            </div>
          </header>

          {/* Main Scrollable Content Container */}
          <main className="flex-1 overflow-y-auto overscroll-contain">
            <div className="mx-auto w-full max-w-[1440px] px-8 py-6">
              {children}
            </div>
          </main>
        </div>
      </div>
    </>
  );
};
