import React from 'react';
import { ALL_BADGES, getProgression } from '../lib/progressionEngine';
import { SkillBadge, SkillBadgeTier } from '../types';
import { sound } from '../lib/soundEngine';
import { X, Award, CheckCircle2, ShieldCheck, Download, Printer } from 'lucide-react';
import { Badge } from './ui/Badge';
import { Button } from './ui/Button';

interface SkillBadgesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SkillBadgesModal: React.FC<SkillBadgesModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const progression = getProgression();

  const getTierColor = (tier?: SkillBadgeTier) => {
    switch (tier) {
      case 'platinum':
        return 'border-[#A3E635] bg-[#A3E635]/10 text-[#A3E635]';
      case 'gold':
        return 'border-[#EAB308] bg-[#EAB308]/10 text-[#EAB308]';
      case 'bronze':
        return 'border-[#D97706] bg-[#D97706]/10 text-[#D97706]';
      default:
        return 'border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] opacity-60';
    }
  };

  const getTierLabel = (tier?: SkillBadgeTier) => {
    switch (tier) {
      case 'platinum':
        return 'Platinum · Demonstrated with Distinction';
      case 'gold':
        return 'Gold · Demonstrated';
      case 'bronze':
        return 'Bronze · Developing';
      default:
        return 'Undiscovered';
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="w-full max-w-3xl max-h-[90vh] flex flex-col rounded-[10px] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] shadow-xl overflow-hidden lift-up">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[var(--border)] px-6 py-4 bg-[var(--background)]">
          <div>
            <div className="font-mono text-[11px] text-[var(--muted-foreground)] uppercase tracking-wider">
              SORT//LAB CREDENTIALS &amp; EVIDENCE
            </div>
            <h2 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
              Skill Badges &amp; Demonstrated Competence
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} variant="secondary" size="sm" className="hidden sm:flex items-center gap-1.5">
              <Printer className="h-3.5 w-3.5" />
              <span>Export Report</span>
            </Button>
            <button
              onClick={() => {
                sound.playClick();
                onClose();
              }}
              className="p-1 rounded-[6px] hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content list */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="p-3.5 rounded-[8px] bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--muted-foreground)]">
            <strong>Atelier Policy:</strong> Badges are awarded deterministically based on verifiable test scores, prediction streaks, and minimal hint reliance. We measure <em>Demonstrated Competence</em> rather than arbitrary completion marks.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ALL_BADGES.map((badge) => {
              const userBadge = progression.badges[badge.id];
              const tier = userBadge?.tier;
              const isEarned = Boolean(tier);

              return (
                <div
                  key={badge.id}
                  className={`p-4 rounded-[8px] border transition-all ${
                    isEarned
                      ? 'border-[var(--border)] bg-[var(--card)] shadow-xs'
                      : 'border-[var(--border)]/60 bg-[var(--background)]/40 opacity-75'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2.5">
                      <div className={`p-2 rounded-[8px] border ${getTierColor(tier)}`}>
                        <Award className="h-4 w-4" />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[var(--foreground)]">{badge.title}</h4>
                        <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase">
                          {badge.topicId}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${getTierColor(
                        tier
                      )}`}
                    >
                      {tier ? tier.toUpperCase() : 'LOCKED'}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--muted-foreground)] mb-3 leading-relaxed">
                    {badge.description}
                  </p>

                  {/* Tier Thresholds */}
                  <div className="space-y-1 text-[11px] font-mono border-t border-[var(--border)] pt-2.5 text-[var(--muted-foreground)]">
                    <div className={tier === 'bronze' ? 'text-[var(--foreground)] font-bold' : ''}>
                      <span className="text-[#D97706]">Bronze:</span> {badge.criteria.bronze}
                    </div>
                    <div className={tier === 'gold' ? 'text-[var(--foreground)] font-bold' : ''}>
                      <span className="text-[#EAB308]">Gold:</span> {badge.criteria.gold}
                    </div>
                    <div className={tier === 'platinum' ? 'text-[var(--foreground)] font-bold' : ''}>
                      <span className="text-[#A3E635]">Platinum:</span> {badge.criteria.platinum}
                    </div>
                  </div>

                  {/* Evidence List */}
                  {isEarned && (
                    <div className="mt-3 pt-2 border-t border-[var(--border)]">
                      <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--primary)] font-bold mb-1 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>Logged Evidence:</span>
                      </div>
                      <ul className="text-[11px] text-[var(--muted-foreground)] space-y-0.5 list-disc list-inside">
                        {badge.evidence.map((ev: string, i: number) => (
                          <li key={i}>{ev}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-[var(--border)] px-6 py-3 bg-[var(--background)] flex items-center justify-between text-xs font-mono text-[var(--muted-foreground)]">
          <span>Total Badges Demonstrated: {Object.keys(progression.badges).length} / {ALL_BADGES.length}</span>
          <Button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            variant="secondary"
            size="sm"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
