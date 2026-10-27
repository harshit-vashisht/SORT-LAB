import React from 'react';
import { CURRICULUM_TOPICS, REALMS } from '../lib/curriculumData';
import { getProgressionV2, isTopicUnlocked, resetToBeginnerProgression } from '../lib/progressionEngine';
import { WorkspaceMode, StudentProfile } from '../types';
import { sound } from '../lib/soundEngine';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import {
  Compass,
  Award,
  Play,
  ArrowRight,
  GitBranch,
  Eye,
  Gamepad2,
  Code2,
  CheckCircle2,
  Sparkles,
  BookOpen,
  RotateCcw,
} from 'lucide-react';

interface HomeDashboardProps {
  profile: StudentProfile;
  onNavigateMode: (mode: WorkspaceMode, topicId?: string) => void;
  onOpenBadges: () => void;
  onOpenMentorWithMessage?: (msg: string) => void;
  onStartZero: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  profile,
  onNavigateMode,
  onOpenBadges,
  onOpenMentorWithMessage,
  onStartZero,
}) => {
  const progression = getProgressionV2();

  const totalTopics = CURRICULUM_TOPICS.length;
  const completedCount = progression.completedTopics.length;
  const progressPercent = Math.round((completedCount / totalTopics) * 100);

  // Next recommended topic
  const nextRecommended =
    CURRICULUM_TOPICS.find(
      (t) => isTopicUnlocked(t.id, progression) && !progression.completedTopics.includes(t.id)
    ) || CURRICULUM_TOPICS[0];

  const earnedCards = Object.values(progression.skillCards);

  return (
    <div className="space-y-8 lift-up max-w-full">
      {/* Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-6 sm:p-8">
        <div className="max-w-2xl space-y-3">
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--primary)] uppercase tracking-wider font-semibold">
            <span>COMPUTATIONAL ATELIER</span>
            <span>·</span>
            <span>ZERO TO ADVANCED</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-[var(--foreground)]">
            Master Programming. <span className="font-serif-italic text-[var(--primary)]">From Zero</span> to Algorithms.
          </h1>

          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] leading-relaxed">
            Understand computer science concepts through physical analogies, sketch logic on interactive flowcharts, test your reflexes in arcade mini-games, and prove your reasoning on verifiable skill cards.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-3">
            <Button
              onClick={() => {
                sound.playSuccess();
                onStartZero();
              }}
              variant="default"
              size="lg"
              className="gap-2 font-mono text-xs sm:text-sm font-semibold shadow-xs"
            >
              <Compass className="h-4 w-4" />
              <span>Start From Zero (Level 0)</span>
              <ArrowRight className="h-4 w-4" />
            </Button>

            <Button
              onClick={() => {
                sound.playClick();
                onNavigateMode('lesson', nextRecommended.id);
              }}
              variant="secondary"
              size="lg"
              className="gap-2 font-mono text-xs sm:text-sm"
            >
              <Play className="h-4 w-4 text-[var(--primary)]" />
              <span>Continue: {nextRecommended.title}</span>
            </Button>

            <Button
              onClick={() => {
                sound.playClick();
                onNavigateMode('assessment');
              }}
              variant="outline"
              size="lg"
              className="gap-1.5 font-mono text-xs sm:text-sm text-[var(--muted-foreground)]"
            >
              <span>Diagnostic Test ↗</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Progress & Milestone Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Progress Card */}
        <Card className="p-5 bg-[var(--card)] border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold uppercase text-[var(--muted-foreground)]">
              Curriculum Mastery
            </span>
            <span className="font-mono text-xs text-[var(--primary)] font-bold">{progressPercent}%</span>
          </div>
          <div className="h-2 w-full bg-[var(--muted)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            {completedCount} of {totalTopics} milestones verified across 6 realms.
          </p>
        </Card>

        {/* Skill Cards Card */}
        <Card className="p-5 bg-[var(--card)] border-[var(--border)] space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-semibold uppercase text-[var(--muted-foreground)]">
              Skill Cards Earned
            </span>
            <Award className="h-4 w-4 text-[#EAB308]" />
          </div>
          <div className="text-2xl font-bold font-mono text-[var(--foreground)]">
            {earnedCards.length} Cards
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onOpenBadges();
            }}
            className="text-xs font-mono text-[var(--primary)] hover:underline inline-flex items-center gap-1"
          >
            <span>View Verified Credentials</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </Card>

        {/* Learning Sequence Status */}
        <Card className="p-5 bg-[var(--card)] border-[var(--border)] space-y-3">
          <span className="font-mono text-xs font-semibold uppercase text-[var(--muted-foreground)] block">
            Current Active Milestone
          </span>
          <div className="text-sm font-bold text-[var(--foreground)] truncate">
            {nextRecommended.title}
          </div>
          <span className="inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--background)] text-[var(--primary)]">
            Level {nextRecommended.level} · {REALMS[nextRecommended.realmId].name.split(' ')[0]}
          </span>
        </Card>
      </div>

      {/* Core Studio Workspaces Quick Access Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Interactive Learning Studios</h2>
          <span className="text-xs font-mono text-[var(--muted-foreground)]">8-Stage Learning Journey</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Studio 1: Flowchart Canvas */}
          <Card
            onClick={() => {
              sound.playClick();
              onNavigateMode('flowchart');
            }}
            className="p-5 bg-[var(--card)] hover:border-[var(--primary)] cursor-pointer transition-all space-y-3 group"
          >
            <div className="p-2.5 rounded-[8px] bg-[var(--primary)]/10 text-[var(--primary)] w-fit group-hover:scale-105 transition-transform">
              <GitBranch className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--foreground)]">Flowchart Canvas</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Drag-and-drop logic nodes, decision diamonds, and run live logic simulations.
              </p>
            </div>
            <div className="text-xs font-mono text-[var(--primary)] flex items-center gap-1 pt-1">
              <span>Open Studio</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </Card>

          {/* Studio 2: Visual Lab */}
          <Card
            onClick={() => {
              sound.playClick();
              onNavigateMode('visual');
            }}
            className="p-5 bg-[var(--card)] hover:border-[var(--primary)] cursor-pointer transition-all space-y-3 group"
          >
            <div className="p-2.5 rounded-[8px] bg-[var(--primary)]/10 text-[var(--primary)] w-fit group-hover:scale-105 transition-transform">
              <Eye className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--foreground)]">Visual Lab</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Deterministic stepping through memory variables, loops, arrays, and sorting algorithms.
              </p>
            </div>
            <div className="text-xs font-mono text-[var(--primary)] flex items-center gap-1 pt-1">
              <span>Inspect Memory</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </Card>

          {/* Studio 3: Play & Learn Arcade */}
          <Card
            onClick={() => {
              sound.playClick();
              onNavigateMode('play');
            }}
            className="p-5 bg-[var(--card)] hover:border-[var(--primary)] cursor-pointer transition-all space-y-3 group"
          >
            <div className="p-2.5 rounded-[8px] bg-[var(--primary)]/10 text-[var(--primary)] w-fit group-hover:scale-105 transition-transform">
              <Gamepad2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--foreground)]">Play &amp; Learn</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Six dedicated topic mini-games: Swap Blitz, Loop Runner, Index Quest, and Matrix Mission.
              </p>
            </div>
            <div className="text-xs font-mono text-[var(--primary)] flex items-center gap-1 pt-1">
              <span>Play Games</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </Card>

          {/* Studio 4: Code Arena */}
          <Card
            onClick={() => {
              sound.playClick();
              onNavigateMode('arena');
            }}
            className="p-5 bg-[var(--card)] hover:border-[var(--primary)] cursor-pointer transition-all space-y-3 group"
          >
            <div className="p-2.5 rounded-[8px] bg-[var(--primary)]/10 text-[var(--primary)] w-fit group-hover:scale-105 transition-transform">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-[var(--foreground)]">Code Arena</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Write real code with unit test cases in Python, JavaScript, Java, and C++.
              </p>
            </div>
            <div className="text-xs font-mono text-[var(--primary)] flex items-center gap-1 pt-1">
              <span>Solve Challenges</span>
              <ArrowRight className="h-3 w-3" />
            </div>
          </Card>
        </div>
      </div>

      {/* 6 Topological Realms Overview */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
          <h2 className="text-lg font-bold text-[var(--foreground)]">Curriculum Realms (Level 0 to 5)</h2>
          <button
            onClick={() => {
              sound.playClick();
              onNavigateMode('map');
            }}
            className="text-xs font-mono text-[var(--primary)] hover:underline inline-flex items-center gap-1"
          >
            <span>Open Skill Map</span>
            <ArrowRight className="h-3 w-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Object.entries(REALMS).map(([rId, realm]) => {
            const realmTopics = CURRICULUM_TOPICS.filter((t) => t.realmId === rId);
            const completedInRealm = realmTopics.filter((t) =>
              progression.completedTopics.includes(t.id)
            ).length;

            return (
              <Card
                key={rId}
                onClick={() => {
                  sound.playClick();
                  onNavigateMode('map');
                }}
                className="p-5 bg-[var(--card)] border-[var(--border)] hover:border-[var(--primary)] cursor-pointer transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--muted-foreground)]">
                    Level {realm.level}
                  </span>
                  <span className="font-mono text-xs text-[var(--primary)] font-bold">
                    {completedInRealm} / {realmTopics.length}
                  </span>
                </div>
                <h3 className="font-bold text-base text-[var(--foreground)]">{realm.name}</h3>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {realm.description}
                </p>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
