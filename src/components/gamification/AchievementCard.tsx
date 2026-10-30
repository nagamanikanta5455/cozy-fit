import React from 'react';
import { AchievementBadge } from '../../domain/types';
import {
  Sun,
  Flame,
  Trophy,
  Shield,
  Lock,
  Check,
  Moon,
  Sunrise,
  Sunset,
  Zap,
  Timer,
  BatteryCharging,
  Mountain,
  Compass,
  Layers,
  Footprints,
  Activity,
  Bike,
  Heart,
  Waves,
  Dumbbell,
  Sparkles,
  Grid,
  Crown,
  Shuffle,
  Award,
  Medal,
  Clock,
  Calendar,
  PartyPopper,
  Star,
  HelpCircle,
} from 'lucide-react';

interface AchievementCardProps {
  badge: AchievementBadge;
}

const ICON_MAP: Record<string, React.FC<{ className?: string }>> = {
  Sun,
  Flame,
  Trophy,
  Shield,
  Lock,
  Check,
  Moon,
  Sunrise,
  Sunset,
  Zap,
  Timer,
  BatteryCharging,
  Mountain,
  Compass,
  Layers,
  Footprints,
  Activity,
  Bike,
  Heart,
  Waves,
  Dumbbell,
  Sparkles,
  Grid,
  Crown,
  Shuffle,
  Award,
  Medal,
  Clock,
  Calendar,
  PartyPopper,
  Star,
  HelpCircle,
};

export const AchievementCard: React.FC<AchievementCardProps> = ({ badge }) => {
  const isUnlocked = Boolean(badge.unlockedAt);
  const isHiddenLocked = Boolean(badge.isHidden && !isUnlocked);

  const displayTitle = isHiddenLocked ? 'Mystery Badge' : badge.title;
  const displaySubtitle = isHiddenLocked ? 'Secret Milestone' : badge.subtitle;
  const displayDescription = isHiddenLocked
    ? 'Keep pushing to discover this secret.'
    : badge.description;

  const renderIcon = () => {
    if (isHiddenLocked) {
      return <HelpCircle className="w-4 h-4 text-[var(--text-muted)]" />;
    }
    const IconComponent = ICON_MAP[badge.icon];
    if (IconComponent) {
      return <IconComponent className="w-4 h-4" />;
    }
    // Fallback icon from Lucide
    return <Trophy className="w-4 h-4" />;
  };

  const progressPercent =
    !isHiddenLocked && badge.progress
      ? Math.min(100, Math.round((badge.progress.current / badge.progress.target) * 100))
      : null;

  return (
    <div
      className={`p-3 rounded-xl border transition-standard flex flex-col justify-between ${
        isUnlocked
          ? 'bg-[var(--bg-surface-raised)] border-[var(--accent-fill)]/60 shadow-sm'
          : isHiddenLocked
          ? 'bg-[var(--bg-surface-raised)]/20 border-[var(--border-subtle)]/70 opacity-75'
          : 'bg-[var(--bg-surface-raised)]/30 border-[var(--border-subtle)] opacity-85'
      }`}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
              isUnlocked
                ? 'bg-[var(--accent-fill)] text-[#0E0F12]'
                : 'bg-[var(--bg-surface-raised)] text-[var(--text-faint)] border border-[var(--border-subtle)]'
            }`}
          >
            {renderIcon()}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span
                className={`text-xs font-bold leading-tight ${
                  isHiddenLocked ? 'text-[var(--text-muted)] italic' : 'text-[var(--text-primary)]'
                }`}
              >
                {displayTitle}
              </span>
            </div>
            <span className="text-[11px] text-[var(--text-muted)] leading-none block mt-0.5">
              {displaySubtitle}
            </span>
          </div>
        </div>

        <div>
          {isUnlocked ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-[var(--accent-text)] bg-[var(--accent-fill)]/15 px-2 py-0.5 rounded-full">
              <Check className="w-3 h-3 stroke-[2.5]" />
              {badge.unlockedAt && badge.unlockedAt !== 'Earned'
                ? badge.unlockedAt
                : 'Unlocked'}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-[10px] text-[var(--text-faint)] bg-[var(--bg-surface-raised)] px-2 py-0.5 rounded-full border border-[var(--border-subtle)]">
              <Lock className="w-2.5 h-2.5" />
              Locked
            </span>
          )}
        </div>
      </div>

      <p
        className={`text-[11px] leading-relaxed mb-2 ${
          isHiddenLocked ? 'text-[var(--text-faint)] italic' : 'text-[var(--text-faint)]'
        }`}
      >
        {displayDescription}
      </p>

      {/* Progress Bar (never shown for mystery locked badges) */}
      {!isHiddenLocked && badge.progress && (
        <div className="pt-2 border-t border-[var(--border-subtle)]/60">
          <div className="flex items-center justify-between text-[10px] text-[var(--text-muted)] mb-1 tabular-nums">
            <span>Progress</span>
            <span className="font-semibold text-[var(--text-primary)]">
              {badge.progress.current} / {badge.progress.target}
            </span>
          </div>
          <div className="h-1.5 w-full bg-[var(--bg-surface)] rounded-full overflow-hidden border border-[var(--border-subtle)]">
            <div
              className="h-full bg-[var(--accent-fill)] rounded-full transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      )}
    </div>
  );
};
