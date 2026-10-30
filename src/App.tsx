import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import { AppShell, PageRoute } from './components/layout/AppShell';
import { CelebrationLayer } from './components/gamification/CelebrationLayer';
import { DashboardPage } from './pages/DashboardPage';
import { JourneyPage } from './pages/JourneyPage';
import { BadgesPage } from './pages/BadgesPage';
import { SettingsPage } from './pages/SettingsPage';
import { LogWorkoutPanel } from './components/logger/LogWorkoutPanel';
import { useToday } from './hooks/useToday';
import { useStreak, useStats } from './store/selectors';
import { useAppStore } from './store/useAppStore';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { evaluateAchievements } from './domain/achievements';
import { Workout } from './domain/types';

function getRouteFromHash(): PageRoute {
  if (typeof window === 'undefined') return 'dashboard';
  const hash = window.location.hash.toLowerCase().replace('#', '');
  if (hash === 'journey' || hash === 'badges' || hash === 'settings') {
    return hash;
  }
  return 'dashboard';
}

export default function App() {
  const [activeRoute, setActiveRoute] = useState<PageRoute>(getRouteFromHash);
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState<Workout | null>(null);

  const today = useToday();
  const streak = useStreak(today);
  const stats = useStats(today);

  const workouts = useAppStore((state) => state.workouts);
  const settings = useAppStore((state) => state.settings);
  const achievementUnlockedDates = useAppStore((state) => state.achievementUnlockedDates);

  // Sync state-based routing with location.hash
  useEffect(() => {
    const handleHashChange = () => {
      setActiveRoute(getRouteFromHash());
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = useCallback((route: string) => {
    const validRoute: PageRoute =
      route === 'journey' || route === 'badges' || route === 'settings'
        ? route
        : 'dashboard';
    setActiveRoute(validRoute);
    window.location.hash = `#${validRoute}`;
  }, []);

  // Global Keyboard Shortcuts (N = log, 1-4 = pages, Escape = close overlays)
  useKeyboardShortcuts({
    onOpenLogger: () => {
      setEditingWorkout(null);
      setIsLoggerOpen(true);
    },
    onNavigate: (route) => handleNavigate(route as PageRoute),
    isModalOrDrawerOpen: isLoggerOpen || Boolean(editingWorkout),
    onCloseTopOverlay: () => {
      setIsLoggerOpen(false);
      setEditingWorkout(null);
    },
  });

  // Evaluate achievements for BadgesPage
  const achievements = useMemo(() => {
    const priorStats = settings.priorStats;
    const effectiveLongest = Math.max(stats.streak.longest, priorStats?.longestStreak || 0);
    return evaluateAchievements(
      workouts,
      priorStats,
      effectiveLongest,
      achievementUnlockedDates || {}
    );
  }, [workouts, settings.priorStats, stats.streak.longest, achievementUnlockedDates]);

  const handleEditWorkout = (workout: Workout) => {
    setEditingWorkout(workout);
    setIsLoggerOpen(true);
  };

  const handleCloseLogger = () => {
    setIsLoggerOpen(false);
    setEditingWorkout(null);
  };

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppShell
          activeRoute={activeRoute}
          onRouteChange={handleNavigate}
          onOpenLogger={() => {
            setEditingWorkout(null);
            setIsLoggerOpen(true);
          }}
          streakCount={streak.current}
        >
          {activeRoute === 'dashboard' && (
            <DashboardPage
              onOpenLogger={() => {
                setEditingWorkout(null);
                setIsLoggerOpen(true);
              }}
              onEditWorkout={handleEditWorkout}
              onNavigate={handleNavigate}
            />
          )}

          {activeRoute === 'journey' && (
            <JourneyPage
              workouts={workouts}
              today={today}
              longestStreak={stats.streak.longest}
              onOpenLogger={() => {
                setEditingWorkout(null);
                setIsLoggerOpen(true);
              }}
            />
          )}

          {activeRoute === 'badges' && (
            <BadgesPage
              badgeHistory={stats.badgeHistory}
              achievements={achievements}
            />
          )}

          {activeRoute === 'settings' && <SettingsPage />}

          {/* Logger Slide-Over Panel (opened via sidebar button, topbar button, or 'N' shortcut) */}
          <LogWorkoutPanel
            isOpen={isLoggerOpen}
            onClose={handleCloseLogger}
            today={today}
            editingWorkout={editingWorkout}
          />

          {/* Global Celebration Layer for Streaks & Milestones */}
          <CelebrationLayer />
        </AppShell>
      </ToastProvider>
    </ErrorBoundary>
  );
}
