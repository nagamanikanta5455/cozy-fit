import React from 'react';
import { Button } from '../ui/Button';
import { useAppStore } from '../../store/useAppStore';
import { Plus, Settings as SettingsIcon, Sun, Moon } from 'lucide-react';

interface HeaderProps {
  onOpenLogger: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenLogger, onOpenSettings }) => {
  const currentTheme = useAppStore((state) => state.settings.theme);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const toggleTheme = () => {
    const nextTheme = currentTheme === 'light' ? 'evening' : 'light';
    updateSettings({ theme: nextTheme });
  };

  const isLight = currentTheme === 'light';

  return (
    <header className="sticky top-0 z-20 bg-[var(--bg-app)]/90 backdrop-blur-md border-b border-[var(--border-subtle)] transition-colors">
      <div className="max-w-md md:max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2 select-none">
          <span className="w-2 h-2 rounded-full bg-[var(--accent-fill)] shrink-0" />
          <span className="text-base font-bold tracking-tight text-[var(--text-primary)]">
            CozyFit
          </span>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quick theme toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={`Switch to ${isLight ? 'dark' : 'light'} theme`}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-standard cursor-pointer"
            title="Toggle theme"
          >
            {isLight ? (
              <Moon className="w-4 h-4 stroke-[1.75]" />
            ) : (
              <Sun className="w-4 h-4 stroke-[1.75]" />
            )}
          </button>

          {/* Settings button */}
          <button
            type="button"
            onClick={() => onOpenSettings()}
            aria-label="Open settings"
            className="h-8 w-8 flex items-center justify-center rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] transition-standard cursor-pointer"
            title="Settings"
          >
            <SettingsIcon className="w-4 h-4 stroke-[1.75]" />
          </button>

          {/* Desktop Log button */}
          <div className="hidden sm:block ml-2">
            <Button
              onClick={() => onOpenLogger()}
              size="sm"
              variant="primary"
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Log workout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};
