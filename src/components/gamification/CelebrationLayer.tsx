import React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/Button';
import { Trophy } from 'lucide-react';

export const CelebrationLayer: React.FC = () => {
  const activeCelebration = useAppStore((state) => state.activeCelebration);
  const dismissCelebration = useAppStore((state) => state.dismissCelebration);

  if (!activeCelebration) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Milestone"
      className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs select-none"
    >
      <div className="relative w-full max-w-sm bg-[var(--bg-surface)] border border-[var(--border-subtle)] rounded-xl p-5 text-center text-[var(--text-primary)] space-y-4 shadow-xl">
        <div className="w-10 h-10 mx-auto rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] flex items-center justify-center text-[#C6F432]">
          <Trophy className="w-5 h-5 stroke-[1.75]" />
        </div>

        <div className="space-y-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--text-faint)]">
            Milestone
          </span>
          <h3 className="text-base font-bold text-[var(--text-primary)]">
            {activeCelebration.title.replace(/!/g, '').replace(/[^\x00-\x7F]/g, '')}
          </h3>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            {activeCelebration.subtitle.replace(/!/g, '').replace(/[^\x00-\x7F]/g, '')}
          </p>
        </div>

        <Button
          onClick={dismissCelebration}
          variant="primary"
          size="sm"
          fullWidth
        >
          Continue
        </Button>
      </div>
    </div>
  );
};
