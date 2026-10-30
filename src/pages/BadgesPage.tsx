import React, { useState } from 'react';
import { Card } from '../components/ui/Card';
import { WeekSummary, AchievementBadge } from '../domain/types';
import { BadgeCard } from '../components/gamification/BadgeCard';
import { AchievementCard } from '../components/gamification/AchievementCard';
import { Award, Trophy, Sparkles } from 'lucide-react';

interface BadgesPageProps {
  badgeHistory: WeekSummary[];
  achievements: AchievementBadge[];
}

const WEEKLY_TIERS = [
  { multiplier: 2, label: 'Double', minWorkouts: 2 },
  { multiplier: 3, label: 'Triple', minWorkouts: 3 },
  { multiplier: 4, label: 'Quad', minWorkouts: 4 },
  { multiplier: 5, label: 'High Five', minWorkouts: 5 },
  { multiplier: 6, label: 'Mega Week', minWorkouts: 6 },
  { multiplier: 7, label: 'Perfect 7', minWorkouts: 7 },
];

export const BadgesPage: React.FC<BadgesPageProps> = ({
  badgeHistory,
  achievements,
}) => {
  const [filter, setFilter] = useState<'all' | 'unlocked' | 'locked'>('all');

  const unlockedCount = achievements.filter((a) => Boolean(a.unlockedAt)).length;
  const filteredAchievements = achievements.filter((a) => {
    if (filter === 'unlocked') return Boolean(a.unlockedAt);
    if (filter === 'locked') return !a.unlockedAt;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[var(--text-primary)]">
            Badges & Milestones Guide
          </h2>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            Earn weekly workout multipliers and discover 50 achievement milestones.
          </p>
        </div>

        {/* Filter Buttons */}
        <div className="flex items-center p-1 rounded-xl bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] shrink-0">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-standard ${
              filter === 'all'
                ? 'bg-[var(--accent-fill)] text-[#0E0F12]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            All ({achievements.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('unlocked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-standard ${
              filter === 'unlocked'
                ? 'bg-[var(--accent-fill)] text-[#0E0F12]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Unlocked ({unlockedCount})
          </button>
          <button
            type="button"
            onClick={() => setFilter('locked')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-standard ${
              filter === 'locked'
                ? 'bg-[var(--accent-fill)] text-[#0E0F12]'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            Locked ({achievements.length - unlockedCount})
          </button>
        </div>
      </div>

      {/* 1. Weekly Tier Rules Guide (3-4 columns) */}
      <Card className="p-5" variant="default">
        <div className="flex items-center gap-2 mb-3 min-w-0">
          <Award className="w-4 h-4 text-[var(--accent-fill)] shrink-0" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
            Weekly Multiplier Tiers (Complete in a Single Week)
          </h3>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {WEEKLY_TIERS.map((tier) => (
            <div
              key={tier.multiplier}
              className="p-3 rounded-xl bg-[var(--bg-surface-raised)]/40 border border-[var(--border-subtle)] flex flex-col items-center text-center"
            >
              <div className="w-9 h-9 rounded-full bg-[var(--accent-fill)]/15 border border-[var(--accent-fill)]/30 text-[var(--accent-text)] flex items-center justify-center font-bold text-sm mb-2 tabular-nums">
                {tier.multiplier}x
              </div>
              <span className="text-xs font-bold text-[var(--text-primary)]">
                {tier.label}
              </span>
              <span className="text-[11px] text-[var(--text-faint)] mt-0.5 tabular-nums">
                {tier.minWorkouts}+ workouts
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* 2. Earned Past Weekly Badges (if any) */}
      {badgeHistory.length > 0 && (
        <Card className="p-5" variant="default">
          <div className="flex items-center justify-between mb-3 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <Sparkles className="w-4 h-4 text-[var(--accent-fill)] shrink-0" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)] truncate">
                Your Past Weekly Badges ({badgeHistory.length})
              </h3>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {badgeHistory.map((summary) => (
              <BadgeCard key={summary.weekKey} summary={summary} />
            ))}
          </div>
        </Card>
      )}

      {/* 3. 50 Milestone & Mystery Badges (3 to 4 column responsive grid) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-[var(--accent-fill)]" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
              Achievements & Milestones ({filteredAchievements.length})
            </h3>
          </div>
          <span className="text-xs text-[var(--text-faint)] tabular-nums">
            {unlockedCount} of {achievements.length} unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {filteredAchievements.map((badge) => (
            <AchievementCard key={badge.id} badge={badge} />
          ))}
        </div>
      </div>
    </div>
  );
};
