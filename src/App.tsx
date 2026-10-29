import React, { useState } from 'react';
import { ErrorBoundary } from './components/ui/ErrorBoundary';
import { ToastProvider } from './components/ui/Toast';
import { AppShell } from './components/layout/AppShell';
import { CelebrationLayer } from './components/gamification/CelebrationLayer';
import { DashboardPage } from './pages/DashboardPage';
import { useToday } from './hooks/useToday';
import { useStreak } from './store/selectors';
import { triggerHaptic } from './utils/haptics';
import { Plus } from 'lucide-react';

export default function App() {
  const [isLoggerOpen, setIsLoggerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const today = useToday();
  const streak = useStreak(today);

  return (
    <ErrorBoundary>
      <ToastProvider>
        <AppShell
          onOpenLogger={() => setIsLoggerOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          streakCount={streak.current}
        >
          <DashboardPage
            isLoggerOpen={isLoggerOpen}
            onCloseLogger={() => setIsLoggerOpen(false)}
            onOpenLogger={() => setIsLoggerOpen(true)}
            isSettingsOpen={isSettingsOpen}
            onCloseSettings={() => setIsSettingsOpen(false)}
          />

          {/* Desktop Floating Log Button (bottom-right) */}
          <div className="hidden sm:block fixed bottom-6 right-6 z-40">
            <button
              type="button"
              onClick={() => {
                triggerHaptic('light');
                setIsLoggerOpen(true);
              }}
              aria-label="Log workout"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent-fill)] hover:brightness-105 active:scale-95 text-[#0E0F12] font-bold text-sm shadow-md transition-standard cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.25]" />
              <span>Log workout</span>
            </button>
          </div>

          {/* Global Celebration Modal for Milestones & Badges */}
          <CelebrationLayer />
        </AppShell>
      </ToastProvider>
    </ErrorBoundary>
  );
}
