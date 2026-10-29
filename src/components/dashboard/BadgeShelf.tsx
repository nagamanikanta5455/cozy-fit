import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { WeekSummary, AchievementBadge } from '../../domain/types';
import { BadgeCard } from '../gamification/BadgeCard';
import { AchievementCard } from '../gamification/AchievementCard';
import { Award, Trophy, Sparkles, Lock, HelpCircle, Check } from 'lucide-react';

interface BadgeShelfProps {
  badgeHistory: WeekSummary[];
  achievements?: AchievementBadge[];
}

export const BadgeShelf: React.FC<BadgeShelfProps> = ({ badgeHistory, achievements = [] }) => {
  const [tab, setTab] = useState<'weekly' | 'milestones'>('weekly');
  const [milestoneFilter, setMilestoneFilter] = useState<'all' | 'unlocked'>('all');
  const [selectedMysteryId, setSelectedMysteryId] = useState<string | null>(null);

  const unlockedCount = achievements.filter((a) => Boolean(a.unlockedAt)).length;

  // Group achievements into logical tiers to prevent mobile doom-scrolling
  const unlockedBadges = achievements.filter((a) => Boolean(a.unlockedAt));
  const knownLockedBadges = achievements.filter((a) => !a.unlockedAt && !a.isHidden);
  const mysteryLockedBadges = achievements.filter((a) => !a.unlockedAt && a.isHidden);

  return (
    <Card className="p-3.5 sm:p-5" variant="default">
      {/* Tab Header Bar: Mobile-optimized with no overflow or squishing */}
      <div className="flex items-center justify-between gap-2 mb-3.5 min-h-[36px] w-full min-w-0">
        {/* Toggle Pill Buttons with shrink-0 and clean padding */}
        <div className="flex items-center p-0.5 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] shrink-0">
          <button
            type="button"
            onClick={() => setTab('weekly')}
            aria-selected={tab === 'weekly'}
            role="tab"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-standard cursor-pointer shrink-0 ${
              tab === 'weekly'
                ? 'bg-[var(--accent-fill)] text-[#0E0F12] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Award className="w-3.5 h-3.5 shrink-0" />
            <span>Weekly</span>
            <span className="text-[10px] tabular-nums opacity-85">({badgeHistory.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setTab('milestones')}
            aria-selected={tab === 'milestones'}
            role="tab"
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-md text-xs font-semibold whitespace-nowrap transition-standard cursor-pointer shrink-0 ${
              tab === 'milestones'
                ? 'bg-[var(--accent-fill)] text-[#0E0F12] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
            }`}
          >
            <Trophy className="w-3.5 h-3.5 shrink-0" />
            <span>Milestones</span>
            <span className="text-[10px] tabular-nums opacity-85">
              ({unlockedCount}/{achievements.length})
            </span>
          </button>
        </div>

        {/* Right Status / Filter indicators: Helper text hidden on mobile to prevent overflow */}
        <div className="flex items-center gap-2 shrink-0">
          {tab === 'milestones' && unlockedCount > 0 && (
            <div className="flex items-center gap-1 text-[11px] shrink-0">
              <button
                type="button"
                onClick={() => setMilestoneFilter('all')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  milestoneFilter === 'all'
                    ? 'text-[var(--accent-text)] font-bold underline underline-offset-2'
                    : 'text-[var(--text-faint)] hover:text-[var(--text-muted)]'
                }`}
              >
                All
              </button>
              <span className="text-[var(--text-faint)]">•</span>
              <button
                type="button"
                onClick={() => setMilestoneFilter('unlocked')}
                className={`px-1.5 py-0.5 rounded text-[10px] font-medium transition-colors cursor-pointer ${
                  milestoneFilter === 'unlocked'
                    ? 'text-[var(--accent-text)] font-bold underline underline-offset-2'
                    : 'text-[var(--text-faint)] hover:text-[var(--text-muted)]'
                }`}
              >
                Unlocked
              </button>
            </div>
          )}

          {/* Helper text is hidden on mobile screens (<640px) to prevent overflowing container */}
          <span className="hidden sm:inline text-xs text-[var(--text-faint)] tabular-nums whitespace-nowrap text-right">
            {tab === 'weekly'
              ? `${badgeHistory.length} ${badgeHistory.length === 1 ? 'badge' : 'badges'}`
              : `${unlockedCount} of ${achievements.length} unlocked`}
          </span>
        </div>
      </div>

      {/* Content Area with smooth scroll and clean mobile height */}
      <div className="min-h-[260px] max-h-[460px] overflow-y-auto overscroll-contain pr-0.5">
        {tab === 'weekly' ? (
          badgeHistory.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {badgeHistory.map((summary) => (
                <BadgeCard key={summary.weekKey} summary={summary} />
              ))}
            </div>
          ) : (
            <div className="h-full min-h-[240px] flex flex-col items-center justify-center p-6 rounded-xl bg-[var(--bg-surface-raised)]/30 border border-[var(--border-subtle)] text-center">
              <Award className="w-8 h-8 text-[var(--text-faint)] mb-2 stroke-[1.5]" />
              <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">
                No past badges yet
              </p>
              <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">
                Log 2 or more workouts in a single week to earn your first weekly multiplier badge.
              </p>
            </div>
          )
        ) : (
          /* Milestones Tab Layout: Ends the 50-badge doom scroll */
          milestoneFilter === 'unlocked' ? (
            unlockedBadges.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {unlockedBadges.map((badge) => (
                  <AchievementCard key={badge.id} badge={badge} />
                ))}
              </div>
            ) : (
              <div className="h-full min-h-[240px] flex flex-col items-center justify-center p-6 rounded-xl bg-[var(--bg-surface-raised)]/30 border border-[var(--border-subtle)] text-center">
                <Sparkles className="w-8 h-8 text-[var(--text-faint)] mb-2 stroke-[1.5]" />
                <p className="text-xs font-semibold text-[var(--text-primary)] mb-1">
                  No unlocked badges yet
                </p>
                <p className="text-xs text-[var(--text-muted)] max-w-xs leading-relaxed">
                  Complete milestones and hidden challenges to unlock your first secret badge.
                </p>
              </div>
            )
          ) : (
            <div className="space-y-4">
              {/* 1. Unlocked Badges at the top (if any) */}
              {unlockedBadges.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--accent-text)] mb-2">
                    <span className="flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                      Unlocked ({unlockedBadges.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {unlockedBadges.map((badge) => (
                      <AchievementCard key={badge.id} badge={badge} />
                    ))}
                  </div>
                </div>
              )}

              {/* 2. Known/Visible Locked Badges (4 Milestone Badges) */}
              {knownLockedBadges.length > 0 && (
                <div>
                  <div className="flex items-center justify-between text-xs font-semibold text-[var(--text-primary)] mb-2">
                    <span className="flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-[var(--accent-text)]" />
                      Active Milestones ({knownLockedBadges.length})
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {knownLockedBadges.map((badge) => (
                      <AchievementCard key={badge.id} badge={badge} />
                    ))}
                  </div>
                </div>
              )}

              {/* 3. Condensed Mystery Badges: Compact tight grid eliminating infinite scroll */}
              {mysteryLockedBadges.length > 0 && (
                <div className="p-3.5 rounded-xl bg-[var(--bg-surface-raised)]/30 border border-[var(--border-subtle)]">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-7 h-7 rounded-lg bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-center text-[var(--text-muted)] shrink-0">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h5 className="text-xs font-semibold text-[var(--text-primary)] leading-tight">
                            Mystery Badges
                          </h5>
                          <span className="text-[10px] font-medium text-[var(--text-faint)] tabular-nums bg-[var(--bg-surface)] px-1.5 py-0.5 rounded border border-[var(--border-subtle)]">
                            {mysteryLockedBadges.length} hidden
                          </span>
                        </div>
                        <p className="text-[10px] text-[var(--text-muted)] truncate mt-0.5">
                          Keep pushing to discover secret achievements and milestones
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tight CSS grid for the mystery badges: 6 cols on mobile, 8-10 on larger */}
                  <div className="grid grid-cols-6 xs:grid-cols-7 sm:grid-cols-8 md:grid-cols-10 gap-1.5">
                    {mysteryLockedBadges.map((badge, idx) => {
                      const isSelected = selectedMysteryId === badge.id;
                      return (
                        <button
                          key={badge.id}
                          type="button"
                          onClick={() => setSelectedMysteryId(isSelected ? null : badge.id)}
                          title="Mystery Badge: Keep moving to discover this secret"
                          aria-label={`Mystery badge ${idx + 1}`}
                          className={`aspect-square rounded-lg flex flex-col items-center justify-center transition-standard select-none cursor-pointer ${
                            isSelected
                              ? 'bg-[var(--accent-fill)]/15 border-[var(--accent-fill)] text-[var(--accent-text)] scale-105'
                              : 'bg-[var(--bg-surface)]/70 border border-[var(--border-subtle)] text-[var(--text-faint)] hover:text-[var(--text-muted)] hover:border-[var(--text-muted)]/50'
                          }`}
                        >
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span className="text-[8px] tabular-nums mt-0.5 leading-none opacity-50">
                            #{idx + 1}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Interactive hint when tapping a mystery tile */}
                  {selectedMysteryId && (
                    <div className="mt-2.5 pt-2 border-t border-[var(--border-subtle)]/70 flex items-center justify-between text-[11px] text-[var(--text-muted)]">
                      <span className="italic flex items-center gap-1.5 truncate">
                        <Sparkles className="w-3 h-3 text-[var(--accent-text)] shrink-0" />
                        <span>Mystery Challenge: Hidden until unlocked by workout milestones.</span>
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedMysteryId(null)}
                        className="text-[10px] text-[var(--text-faint)] hover:text-[var(--text-primary)] cursor-pointer px-1.5 py-0.5 shrink-0 underline"
                      >
                        Dismiss
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        )}
      </div>
    </Card>
  );
};
