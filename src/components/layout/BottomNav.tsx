import React from 'react';
import { Activity, Plus, Settings } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface BottomNavProps {
  onOpenLogger: () => void;
  onOpenSettings: () => void;
  onScrollToTop: () => void;
  streakCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  onOpenLogger,
  onOpenSettings,
  onScrollToTop,
}) => {
  return (
    <nav
      aria-label="Mobile navigation"
      className="sm:hidden fixed bottom-0 inset-x-0 z-30 bg-[var(--bg-app)]/95 backdrop-blur-md border-t border-[var(--border-subtle)] px-6 py-1 pb-safe"
    >
      <div className="flex items-center justify-between max-w-sm mx-auto relative h-13">
        {/* Activity / Home */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onScrollToTop();
          }}
          className="flex flex-col items-center justify-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] min-h-[44px] min-w-[56px] cursor-pointer transition-colors"
        >
          <Activity className="w-4 h-4 stroke-[1.75]" />
          <span className="text-[10px] font-medium tracking-tight">Overview</span>
        </button>

        {/* Center Floating Log Action Button (Thumb Reachable) */}
        <div className="relative -top-4">
          <button
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onOpenLogger();
            }}
            aria-label="Log workout"
            className="w-13 h-13 rounded-full bg-[var(--accent-fill)] text-[#0E0F12] flex items-center justify-center shadow-md active:scale-95 transition-transform border-4 border-[var(--bg-app)] cursor-pointer"
          >
            <Plus className="w-6 h-6 stroke-[2.25]" />
          </button>
        </div>

        {/* Settings */}
        <button
          type="button"
          onClick={() => {
            triggerHaptic('light');
            onOpenSettings();
          }}
          className="flex flex-col items-center justify-center gap-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] min-h-[44px] min-w-[56px] cursor-pointer transition-colors"
        >
          <Settings className="w-4 h-4 stroke-[1.75]" />
          <span className="text-[10px] font-medium tracking-tight">Settings</span>
        </button>
      </div>
    </nav>
  );
};
