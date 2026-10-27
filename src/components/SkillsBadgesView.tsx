import React from 'react';
import { CURRICULUM_TOPICS, REALMS } from '../lib/curriculumData';
import { getProgressionV2 } from '../lib/progressionEngine';
import { SkillCardRecord, SkillBadgeTier } from '../types';
import { sound } from '../lib/soundEngine';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import {
  Award,
  CheckCircle2,
  Calendar,
  CheckSquare,
  Sparkles,
  Printer,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

interface SkillsBadgesViewProps {
  onNavigateLesson: (topicId: string) => void;
}

export const SkillsBadgesView: React.FC<SkillsBadgesViewProps> = ({ onNavigateLesson }) => {
  const progression = getProgressionV2();
  const earnedCards: SkillCardRecord[] = Object.values(progression.skillCards);

  const getTierColor = (tier: SkillBadgeTier) => {
    switch (tier) {
      case 'platinum':
        return 'border-[#A3E635] bg-[#A3E635]/10 text-[#A3E635]';
      case 'gold':
        return 'border-[#EAB308] bg-[#EAB308]/10 text-[#EAB308]';
      case 'bronze':
        return 'border-[#D97706] bg-[#D97706]/10 text-[#D97706]';
    }
  };

  const getTierLabel = (tier: SkillBadgeTier) => {
    switch (tier) {
      case 'platinum':
        return 'Platinum · Demonstrated Excellence';
      case 'gold':
        return 'Gold · Proficient';
      case 'bronze':
        return 'Bronze · Developing';
    }
  };

  const handlePrint = () => {
    sound.playClick();
    window.print();
  };

  return (
    <div className="space-y-6 lift-up max-w-full">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--muted-foreground)] uppercase tracking-wider">
            <span>VERIFIED PORTFOLIO</span>
            <span>·</span>
            <span>EVIDENCE-BACKED RECOGNITION</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            My Skills &amp; <span className="font-serif-italic text-[var(--primary)]">Badges</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-2xl mt-1">
            Deterministic credentials earned through demonstrated performance, unit tests, and conceptual assessments.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} variant="secondary" size="sm" className="gap-1.5 font-mono text-xs">
            <Printer className="h-3.5 w-3.5" />
            <span>Export Portfolio Report</span>
          </Button>
        </div>
      </div>

      {/* Tier Explanation Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-4 rounded-[10px] bg-[var(--card)] border border-[var(--border)] text-xs font-mono">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#D97706]" />
          <span>Bronze: Completed introductory stages (&ge;60%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#EAB308]" />
          <span>Gold: Passed assessment &amp; code tasks (&ge;75%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#A3E635]" />
          <span>Platinum: Demonstrated excellence with 0 hints (&ge;90%)</span>
        </div>
      </div>

      {/* Earned Cards Grid */}
      {earnedCards.length === 0 ? (
        <Card className="p-12 text-center bg-[var(--card)] border-[var(--border)] space-y-3">
          <Award className="h-10 w-10 text-[var(--muted-foreground)] mx-auto opacity-50" />
          <h3 className="text-base font-bold text-[var(--foreground)]">No Skill Cards Earned Yet</h3>
          <p className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto">
            Complete the 8-stage lesson sequence for Level 0 Foundations to earn your first verified Bronze or Gold skill badge.
          </p>
          <Button
            onClick={() => onNavigateLesson('l0-intro')}
            variant="default"
            size="sm"
            className="mt-2"
          >
            Start Level 0 Lesson ↗
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {earnedCards.map((card) => (
            <Card
              key={card.id}
              className="p-5 bg-[var(--card)] border-[var(--border)] space-y-4 shadow-xs hover:border-[var(--primary)] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-[8px] border ${getTierColor(card.tier)}`}>
                    <Award className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[var(--foreground)]">{card.topicTitle}</h3>
                    <div className="flex items-center gap-2 text-[10px] font-mono text-[var(--muted-foreground)] uppercase">
                      <span>{REALMS[card.realmId].name}</span>
                      <span>·</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(card.earnedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full border ${getTierColor(
                    card.tier
                  )}`}
                >
                  {getTierLabel(card.tier)}
                </span>
              </div>

              {/* Assessment Score & Task Completion Strip */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono p-2.5 rounded-[8px] bg-[var(--background)] border border-[var(--border)]">
                <div>
                  <span className="text-[var(--muted-foreground)] block text-[10px]">Assessment Score:</span>
                  <strong className="text-[var(--primary)]">{card.score}% Verified</strong>
                </div>
                <div>
                  <span className="text-[var(--muted-foreground)] block text-[10px]">Tasks Passed:</span>
                  <strong className="text-[var(--foreground)]">{card.tasksCompleted} / 6 Activities</strong>
                </div>
              </div>

              {/* Verified Evidence List */}
              <div className="space-y-1.5 border-t border-[var(--border)] pt-3 text-xs">
                <div className="flex items-center gap-1 font-mono text-[10px] uppercase font-bold text-[var(--primary)]">
                  <CheckCircle2 className="h-3 w-3" />
                  <span>Logged Evidence:</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[var(--muted-foreground)] font-mono text-[11px]">
                  {card.evidence.map((ev, i) => (
                    <li key={i}>{ev}</li>
                  ))}
                </ul>
              </div>

              {/* Skills Demonstrated Chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {card.skillsDemonstrated.map((sk, i) => (
                  <span
                    key={i}
                    className="px-2 py-0.5 rounded-[6px] border border-[var(--border)] bg-[var(--background)] text-[10px] font-mono text-[var(--foreground)]"
                  >
                    {sk}
                  </span>
                ))}
              </div>

              {/* Next Challenge Action */}
              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs font-mono">
                <span className="text-[var(--muted-foreground)] truncate max-w-[220px]">
                  Next: {card.nextChallenge}
                </span>
                <button
                  onClick={() => onNavigateLesson(card.topicId)}
                  className="text-[var(--primary)] font-semibold hover:underline inline-flex items-center gap-1"
                >
                  <span>Review</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
