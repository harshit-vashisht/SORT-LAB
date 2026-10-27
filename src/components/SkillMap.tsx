import React, { useState } from 'react';
import { CURRICULUM_TOPICS, REALMS } from '../lib/curriculumData';
import { getProgressionV2, isTopicUnlocked } from '../lib/progressionEngine';
import { TopicLesson, RealmId } from '../types';
import { sound } from '../lib/soundEngine';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import {
  Lock,
  CheckCircle2,
  Play,
  Award,
  ChevronRight,
  Compass,
  ArrowRight,
  Sparkles,
  Layers,
  Filter,
  Clock,
  Circle,
  Square,
  Diamond,
  Shield,
  HelpCircle,
  X,
  ExternalLink,
} from 'lucide-react';

interface SkillMapProps {
  onNavigateLesson: (topicId: string) => void;
  onOpenBadges: () => void;
  onOpenMentorWithMessage?: (msg: string) => void;
}

// 5 Curriculum Regions
export interface RoadmapRegion {
  id: string;
  name: string;
  levelLabel: string;
  description: string;
  topicIds: string[];
  color: string;
}

const ROADMAP_REGIONS: RoadmapRegion[] = [
  {
    id: 'region-foundations',
    name: '1. Programming Foundations',
    levelLabel: 'Level 0 · Primitives',
    description: 'Execute unambiguous instructions, model memory registers, and variable types.',
    topicIds: ['l0-intro', 'l0-variables'],
    color: '#597346',
  },
  {
    id: 'region-logic-loops',
    name: '2. Conditions and Loops',
    levelLabel: 'Level 1-2 · Control Flow',
    description: 'Direct execution through conditional gates, boundary guards, and loop invariants.',
    topicIds: ['l1-conditions', 'l2-loops'],
    color: '#3B7A57',
  },
  {
    id: 'region-arrays',
    name: '3. Arrays and Strings',
    levelLabel: 'Level 3 · Memory Collections',
    description: 'Manipulate contiguous 1D vectors and multi-dimensional matrices in memory.',
    topicIds: ['l3-arrays-1d', 'l3-arrays-2d'],
    color: '#8A6D3B',
  },
  {
    id: 'region-sorting',
    name: '4. Searching and Sorting',
    levelLabel: 'Level 4 · Algorithmic Invariants',
    description: 'Comparative sorting mechanics: Bubble, Selection, and Insertion Sort.',
    topicIds: ['l4-bubble-sort', 'l4-selection-sort'],
    color: '#9E642D',
  },
  {
    id: 'region-advanced',
    name: '5. Advanced Algorithms',
    levelLabel: 'Level 5 · Recursion & Stacks',
    description: 'Divide-and-conquer strategies, call stack memory, and base conditions.',
    topicIds: ['l5-recursion'],
    color: '#6F4E7A',
  },
];

// Node Shape Type
type NodeShape = 'circle' | 'rounded-rect' | 'diamond' | 'badge';

const NODE_SHAPES: Record<string, NodeShape> = {
  'l0-intro': 'circle',
  'l0-variables': 'circle',
  'l1-conditions': 'diamond',
  'l2-loops': 'rounded-rect',
  'l3-arrays-1d': 'rounded-rect',
  'l3-arrays-2d': 'diamond',
  'l4-bubble-sort': 'rounded-rect',
  'l4-selection-sort': 'badge',
  'l5-recursion': 'badge',
};

// SVG Canvas positions for the roadmap graph (in 0-1000 X, 0-520 Y viewBox)
const ROADMAP_COORDINATES: Record<string, { x: number; y: number; regionIdx: number }> = {
  'l0-intro': { x: 95, y: 260, regionIdx: 0 },
  'l0-variables': { x: 195, y: 260, regionIdx: 0 },
  'l1-conditions': { x: 320, y: 190, regionIdx: 1 },
  'l2-loops': { x: 425, y: 330, regionIdx: 1 },
  'l3-arrays-1d': { x: 550, y: 230, regionIdx: 2 },
  'l3-arrays-2d': { x: 645, y: 350, regionIdx: 2 },
  'l4-bubble-sort': { x: 760, y: 210, regionIdx: 3 },
  'l4-selection-sort': { x: 840, y: 330, regionIdx: 3 },
  'l5-recursion': { x: 930, y: 240, regionIdx: 4 },
};

export const SkillMap: React.FC<SkillMapProps> = ({
  onNavigateLesson,
  onOpenBadges,
  onOpenMentorWithMessage,
}) => {
  const [progression, setProgression] = useState(getProgressionV2());
  const [selectedTopicId, setSelectedTopicId] = useState<string>('l0-intro');
  const [showLegend, setShowLegend] = useState<boolean>(true);
  const [filterRegion, setFilterRegion] = useState<string>('all');

  const selectedTopic =
    CURRICULUM_TOPICS.find((t) => t.id === selectedTopicId) || CURRICULUM_TOPICS[0];

  const isCompleted = progression.completedTopics.includes(selectedTopic.id);
  const isUnlocked = isTopicUnlocked(selectedTopic.id, progression);
  const hasCard = Boolean(progression.skillCards[selectedTopic.id]);
  const currentCard = progression.skillCards[selectedTopic.id];

  const totalCompleted = progression.completedTopics.length;
  const totalTopics = CURRICULUM_TOPICS.length;
  const progressPercent = Math.round((totalCompleted / totalTopics) * 100);

  const handleSelectNode = (topic: TopicLesson) => {
    sound.playClick();
    setSelectedTopicId(topic.id);
  };

  const handleStartLesson = () => {
    if (!isUnlocked) return;
    sound.playSuccess();
    onNavigateLesson(selectedTopic.id);
  };

  const getNodeStatus = (topicId: string): 'locked' | 'available' | 'in-progress' | 'completed' => {
    if (progression.completedTopics.includes(topicId)) return 'completed';
    if (!isTopicUnlocked(topicId, progression)) return 'locked';
    // If started or has cards/stage progress
    const stage = progression.topicStagesProgress[topicId];
    if (stage) return 'in-progress';
    return 'available';
  };

  return (
    <div className="space-y-6 lift-up max-w-full">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--muted-foreground)] uppercase tracking-wider">
            <span>CURRICULUM ROADMAP</span>
            <span>·</span>
            <span>5 PROGRESSION STAGES</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            Algorithmic <span className="font-serif-italic text-[var(--primary)]">Roadmap</span> &amp; Invariants
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-2xl mt-1">
            Follow the structured sequence: Foundations &rarr; Logic &rarr; Memory &rarr; Sorting &rarr; Recursion.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={() => {
              sound.playClick();
              setShowLegend(!showLegend);
            }}
            variant="outline"
            size="sm"
            className="flex items-center gap-1.5 font-mono text-xs"
          >
            <HelpCircle className="h-3.5 w-3.5 text-[var(--primary)]" />
            <span>{showLegend ? 'Hide Legend' : 'Roadmap Legend'}</span>
          </Button>

          <Button
            onClick={() => {
              sound.playClick();
              onOpenBadges();
            }}
            variant="secondary"
            size="sm"
            className="flex items-center gap-1.5 font-mono text-xs"
          >
            <Award className="h-3.5 w-3.5 text-amber-500" />
            <span>Portfolio Badges ({Object.keys(progression.skillCards).length})</span>
          </Button>
        </div>
      </div>

      {/* Progress Metric Bar & Region Filters */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 rounded-[10px] bg-[var(--card)] border border-[var(--border)]">
        {/* Progress Metric */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex flex-col">
            <span className="font-mono text-[10px] uppercase text-[var(--muted-foreground)]">
              Curriculum Mastery
            </span>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold font-mono text-[var(--foreground)]">{progressPercent}%</span>
              <span className="text-xs text-[var(--muted-foreground)] font-mono">
                ({totalCompleted} / {totalTopics} Demonstrated)
              </span>
            </div>
          </div>
          {/* Progress Bar */}
          <div className="h-2 flex-1 md:w-36 bg-[var(--muted)] rounded-full overflow-hidden">
            <div
              className="h-full bg-[var(--primary)] transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Region Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 md:pb-0 text-xs font-mono">
          <button
            onClick={() => setFilterRegion('all')}
            className={`px-3 py-1 rounded-[6px] border transition-colors whitespace-nowrap ${
              filterRegion === 'all'
                ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] font-bold'
                : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
            }`}
          >
            All Stages
          </button>
          {ROADMAP_REGIONS.map((region) => (
            <button
              key={region.id}
              onClick={() => setFilterRegion(region.id)}
              className={`px-2.5 py-1 rounded-[6px] border transition-colors whitespace-nowrap ${
                filterRegion === region.id
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] font-bold'
                  : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {region.name.split('.')[1]?.trim() || region.name}
            </button>
          ))}
        </div>
      </div>

      {/* Intuitive Legend: Node Shapes and Status Symbols */}
      {showLegend && (
        <Card className="p-4 bg-[var(--card)] border border-[var(--border)] lift-up">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5 mb-3">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-[var(--foreground)]">
              <HelpCircle className="h-4 w-4 text-[var(--primary)]" />
              <span>Roadmap Guide &amp; Visual Invariants</span>
            </div>
            <button
              onClick={() => setShowLegend(false)}
              className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            {/* Shapes Legend */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase">
                Content Node Shapes:
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-[var(--primary)] bg-[var(--primary)]/20 flex items-center justify-center text-[10px]">
                  ●
                </div>
                <span><strong>Circle:</strong> Foundations &amp; Primitives</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-[4px] border-2 border-[var(--primary)] bg-[var(--primary)]/20 flex items-center justify-center text-[10px]">
                  ■
                </div>
                <span><strong>Rounded Rectangle:</strong> Standard Interactive Lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rotate-45 border-2 border-[var(--primary)] bg-[var(--primary)]/20 flex items-center justify-center text-[10px]" />
                <span className="ml-1"><strong>Diamond:</strong> Decision Gates &amp; Branching Challenges</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-[var(--primary)] fill-[var(--primary)]/20" />
                <span><strong>Shield/Badge:</strong> Boss Milestones &amp; Diagnostics</span>
              </div>
            </div>

            {/* Status Legend */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold text-[var(--muted-foreground)] uppercase">
                Node Status Symbols (Non-Color Dependent):
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-dashed border-[var(--muted-foreground)] flex items-center justify-center text-[var(--muted-foreground)]">
                  <Lock className="h-3 w-3" />
                </div>
                <span><strong>Locked:</strong> Requires preceding prerequisite lessons</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-[var(--primary)] bg-[var(--primary)]/20 flex items-center justify-center text-[var(--primary)]">
                  <Play className="h-3 w-3 fill-[var(--primary)]" />
                </div>
                <span><strong>Available / Current:</strong> Ready to explore with active pulse</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border-2 border-amber-500 flex items-center justify-center text-amber-500">
                  <Compass className="h-3 w-3" />
                </div>
                <span><strong>In Progress:</strong> Partially completed milestones</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full border border-[#3B7A57] bg-[#3B7A57] text-[#FBFAF5] flex items-center justify-center">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                </div>
                <span><strong>Demonstrated:</strong> Full mastery verified and badge awarded</span>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Main Roadmap Visualizer + Slide-over Inspection Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Interactive SVG Roadmap Graph (8 cols) */}
        <div className="lg:col-span-8 space-y-3">
          <div className="relative w-full aspect-[16/9] min-h-[480px] max-h-[580px] rounded-[10px] border border-[var(--border)] bg-[#141712] overflow-hidden select-none">
            {/* SVG Background Layer: Grid + 5 Stage Background Bounds + Prerequisite Lines with Arrowheads */}
            <svg
              className="absolute inset-0 w-full h-full"
              viewBox="0 0 1000 520"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                {/* Arrowhead marker for directional prerequisite flow */}
                <marker
                  id="arrow"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#9BD77A" />
                </marker>
                <marker
                  id="arrow-locked"
                  viewBox="0 0 10 10"
                  refX="8"
                  refY="5"
                  markerWidth="6"
                  markerHeight="6"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#4B5344" />
                </marker>

                {/* Subtle Grid Pattern */}
                <pattern id="roadmapGrid" width="30" height="30" patternUnits="userSpaceOnUse">
                  <path d="M 30 0 L 0 0 0 30" fill="none" stroke="#22271D" strokeWidth="0.75" />
                </pattern>
              </defs>

              {/* Background */}
              <rect width="1000" height="520" fill="#11130F" />
              <rect width="1000" height="520" fill="url(#roadmapGrid)" />

              {/* 5 Distinct Region Stage Column Bounding Cards */}
              {ROADMAP_REGIONS.map((region, rIdx) => {
                const width = 190;
                const x = 10 + rIdx * 196;
                const isRegionActive = filterRegion === 'all' || filterRegion === region.id;
                const opacity = isRegionActive ? 0.9 : 0.15;

                return (
                  <g key={region.id} opacity={opacity} className="transition-opacity duration-200">
                    {/* Subtle boundary rectangle */}
                    <rect
                      x={x}
                      y={15}
                      width={width}
                      height={490}
                      rx={8}
                      fill={region.color}
                      fillOpacity="0.07"
                      stroke={region.color}
                      strokeOpacity="0.35"
                      strokeWidth="1"
                    />

                    {/* Region Top Label */}
                    <text
                      x={x + 10}
                      y={36}
                      fill="#ECEBE3"
                      fontFamily="monospace"
                      fontSize="10"
                      fontWeight="bold"
                    >
                      {region.name}
                    </text>
                    <text
                      x={x + 10}
                      y={50}
                      fill="#9C9B90"
                      fontFamily="monospace"
                      fontSize="9"
                    >
                      {region.levelLabel}
                    </text>
                  </g>
                );
              })}

              {/* Curved Prerequisite Connector Lines with Arrowheads */}
              {CURRICULUM_TOPICS.map((topic) => {
                const pos = ROADMAP_COORDINATES[topic.id];
                if (!pos) return null;

                return topic.prerequisites.map((prereqId) => {
                  const prereqPos = ROADMAP_COORDINATES[prereqId];
                  if (!prereqPos) return null;

                  const isPathUnlocked = isTopicUnlocked(topic.id, progression);
                  const isCompletedPrereq = progression.completedTopics.includes(prereqId);

                  // Calculate cubic bezier curve between prereq and target
                  const x1 = prereqPos.x;
                  const y1 = prereqPos.y;
                  const x2 = pos.x;
                  const y2 = pos.y;
                  const dx = x2 - x1;

                  return (
                    <path
                      key={`${prereqId}-${topic.id}`}
                      d={`M ${x1} ${y1} C ${x1 + dx * 0.45} ${y1}, ${x2 - dx * 0.45} ${y2}, ${x2} ${y2}`}
                      fill="none"
                      stroke={isPathUnlocked ? '#9BD77A' : '#3E4637'}
                      strokeWidth={isPathUnlocked ? 2.5 : 1.5}
                      strokeDasharray={isPathUnlocked ? 'none' : '4 4'}
                      markerEnd={isPathUnlocked ? 'url(#arrow)' : 'url(#arrow-locked)'}
                      opacity={isPathUnlocked ? 0.9 : 0.4}
                      className="transition-all duration-200"
                    />
                  );
                });
              })}
            </svg>

            {/* Interactive Milestone Nodes (HTML Elements overlaid on SVG coordinates) */}
            {CURRICULUM_TOPICS.map((topic) => {
              const pos = ROADMAP_COORDINATES[topic.id];
              if (!pos) return null;

              const region = ROADMAP_REGIONS[pos.regionIdx];
              const isRegionVisible = filterRegion === 'all' || filterRegion === region.id;
              if (!isRegionVisible) return null;

              const status = getNodeStatus(topic.id);
              const isSelected = selectedTopicId === topic.id;
              const shape = NODE_SHAPES[topic.id] || 'circle';

              return (
                <div
                  key={topic.id}
                  style={{
                    left: `${(pos.x / 1000) * 100}%`,
                    top: `${(pos.y / 520) * 100}%`,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={() => handleSelectNode(topic)}
                  className="absolute cursor-pointer group z-20"
                >
                  {/* Selected Ripple Pulse */}
                  {isSelected && (
                    <div className="absolute -inset-2.5 rounded-full border-2 border-[var(--primary)] animate-ping opacity-60 pointer-events-none" />
                  )}

                  {/* Node Button with Shape-Specific Geometry */}
                  {shape === 'circle' && (
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center font-mono text-xs transition-all duration-200 border-2 shadow-lg ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] scale-110'
                          : status === 'completed'
                          ? 'border-[#3B7A57] bg-[#1E2E20] text-[#9BD77A]'
                          : status === 'in-progress'
                          ? 'border-amber-500 bg-[#2C2415] text-amber-400'
                          : status === 'available'
                          ? 'border-[var(--border)] bg-[#242A1E] text-[var(--foreground)] hover:border-[var(--primary)]'
                          : 'border-[#33382D] bg-[#171A14] text-[#555B4F] opacity-75'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : status === 'in-progress' ? (
                        <Compass className="h-5 w-5" />
                      ) : status === 'available' ? (
                        <Play className="h-4 w-4 fill-current ml-0.5" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>
                  )}

                  {shape === 'rounded-rect' && (
                    <div
                      className={`w-14 h-11 rounded-[8px] flex items-center justify-center font-mono text-xs transition-all duration-200 border-2 shadow-lg ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] scale-110'
                          : status === 'completed'
                          ? 'border-[#3B7A57] bg-[#1E2E20] text-[#9BD77A]'
                          : status === 'in-progress'
                          ? 'border-amber-500 bg-[#2C2415] text-amber-400'
                          : status === 'available'
                          ? 'border-[var(--border)] bg-[#242A1E] text-[var(--foreground)] hover:border-[var(--primary)]'
                          : 'border-[#33382D] bg-[#171A14] text-[#555B4F] opacity-75'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : status === 'in-progress' ? (
                        <Compass className="h-5 w-5" />
                      ) : status === 'available' ? (
                        <Play className="h-4 w-4 fill-current ml-0.5" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>
                  )}

                  {shape === 'diamond' && (
                    <div
                      className={`w-11 h-11 rotate-45 rounded-[4px] flex items-center justify-center font-mono text-xs transition-all duration-200 border-2 shadow-lg ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] scale-110'
                          : status === 'completed'
                          ? 'border-[#3B7A57] bg-[#1E2E20] text-[#9BD77A]'
                          : status === 'in-progress'
                          ? 'border-amber-500 bg-[#2C2415] text-amber-400'
                          : status === 'available'
                          ? 'border-[var(--border)] bg-[#242A1E] text-[var(--foreground)] hover:border-[var(--primary)]'
                          : 'border-[#33382D] bg-[#171A14] text-[#555B4F] opacity-75'
                      }`}
                    >
                      <div className="-rotate-45 flex items-center justify-center">
                        {status === 'completed' ? (
                          <CheckCircle2 className="h-5 w-5" />
                        ) : status === 'in-progress' ? (
                          <Compass className="h-5 w-5" />
                        ) : status === 'available' ? (
                          <Play className="h-4 w-4 fill-current ml-0.5" />
                        ) : (
                          <Lock className="h-4 w-4" />
                        )}
                      </div>
                    </div>
                  )}

                  {shape === 'badge' && (
                    <div
                      className={`w-12 h-12 rounded-t-[8px] rounded-b-[18px] flex items-center justify-center font-mono text-xs transition-all duration-200 border-2 shadow-lg ${
                        isSelected
                          ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] scale-110'
                          : status === 'completed'
                          ? 'border-[#3B7A57] bg-[#1E2E20] text-[#9BD77A]'
                          : status === 'in-progress'
                          ? 'border-amber-500 bg-[#2C2415] text-amber-400'
                          : status === 'available'
                          ? 'border-[var(--border)] bg-[#242A1E] text-[var(--foreground)] hover:border-[var(--primary)]'
                          : 'border-[#33382D] bg-[#171A14] text-[#555B4F] opacity-75'
                      }`}
                    >
                      {status === 'completed' ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : status === 'in-progress' ? (
                        <Compass className="h-5 w-5" />
                      ) : status === 'available' ? (
                        <Play className="h-4 w-4 fill-current ml-0.5" />
                      ) : (
                        <Lock className="h-4 w-4" />
                      )}
                    </div>
                  )}

                  {/* Clean Non-Color-Dependent Label with Status Tag */}
                  <div className="absolute top-13 left-1/2 -translate-x-1/2 whitespace-nowrap px-2 py-0.5 rounded-[6px] bg-[#0E0F0C]/95 text-[10px] font-mono border border-[#2D3325] shadow-lg pointer-events-none flex flex-col items-center">
                    <span className="font-semibold text-[#ECEBE3] truncate max-w-[110px]">
                      {topic.title}
                    </span>
                    <span
                      className={`text-[9px] uppercase font-bold ${
                        status === 'completed'
                          ? 'text-[#9BD77A]'
                          : status === 'in-progress'
                          ? 'text-amber-400'
                          : status === 'available'
                          ? 'text-[#9BD77A]'
                          : 'text-[#888E81]'
                      }`}
                    >
                      {status === 'completed' && '✓ Demonstrated'}
                      {status === 'in-progress' && '◐ In Progress'}
                      {status === 'available' && '▶ Ready'}
                      {status === 'locked' && '🔒 Locked'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Inspection Drawer & Action Panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <Card className="p-5 bg-[var(--card)] border border-[var(--border)] flex flex-col justify-between min-h-[480px]">
            <div>
              {/* Header: Stage, Level, Shape & Status Badges */}
              <div className="border-b border-[var(--border)] pb-3 mb-3">
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <Badge variant="outline" className="font-mono text-[10px] uppercase">
                    Level {selectedTopic.level} · {REALMS[selectedTopic.realmId]?.name}
                  </Badge>

                  <Badge
                    variant={
                      isCompleted ? 'secondary' : isUnlocked ? 'default' : 'outline'
                    }
                    className="font-mono text-[10px] uppercase font-bold"
                  >
                    {isCompleted
                      ? '✓ Demonstrated'
                      : isUnlocked
                      ? '▶ Available'
                      : '🔒 Locked'}
                  </Badge>
                </div>

                <h2 className="text-lg font-bold tracking-tight text-[var(--foreground)]">
                  {selectedTopic.title}
                </h2>
                <div className="text-xs font-serif-italic text-[var(--primary)] mt-0.5">
                  {selectedTopic.tagline}
                </div>
              </div>

              {/* Description & Analogy */}
              <div className="space-y-3 text-xs leading-relaxed text-[var(--muted-foreground)]">
                <p className="text-[var(--foreground)]">{selectedTopic.description}</p>

                {selectedTopic.analogy && (
                  <div className="p-3 rounded-[8px] bg-[var(--background)] border border-[var(--border)] space-y-1">
                    <div className="font-mono text-[10px] uppercase font-bold text-[var(--primary)]">
                      Concept Analogy: {selectedTopic.analogy.headline}
                    </div>
                    <p className="text-[11px] italic text-[var(--foreground)]">
                      "{selectedTopic.analogy.story}"
                    </p>
                  </div>
                )}

                {/* Learning Invariants & Estimated Time */}
                <div className="grid grid-cols-2 gap-2 font-mono text-[11px] pt-1">
                  <div className="flex items-center gap-1.5 p-2 rounded-[6px] bg-[var(--background)] border border-[var(--border)]">
                    <Clock className="h-3.5 w-3.5 text-[var(--primary)]" />
                    <span>~{selectedTopic.estimatedMinutes} mins</span>
                  </div>
                  <div className="flex items-center gap-1.5 p-2 rounded-[6px] bg-[var(--background)] border border-[var(--border)]">
                    <Layers className="h-3.5 w-3.5 text-[var(--primary)]" />
                    <span>8 Interactive Stages</span>
                  </div>
                </div>

                {/* Prerequisites Check */}
                <div className="pt-2">
                  <span className="font-mono text-[11px] font-bold text-[var(--foreground)] uppercase block mb-1">
                    Prerequisites:
                  </span>
                  {selectedTopic.prerequisites.length === 0 ? (
                    <span className="font-mono text-[11px] text-[var(--primary)]">
                      None (Foundational Entry Point)
                    </span>
                  ) : (
                    <ul className="space-y-1">
                      {selectedTopic.prerequisites.map((pId) => {
                        const pTopic = CURRICULUM_TOPICS.find((t) => t.id === pId);
                        const isDone = progression.completedTopics.includes(pId);
                        return (
                          <li
                            key={pId}
                            className="flex items-center gap-1.5 font-mono text-[11px]"
                          >
                            {isDone ? (
                              <CheckCircle2 className="h-3.5 w-3.5 text-[#3B7A57]" />
                            ) : (
                              <Lock className="h-3.5 w-3.5 text-[var(--destructive)]" />
                            )}
                            <span className={isDone ? 'text-[var(--foreground)]' : 'text-[var(--muted-foreground)]'}>
                              {pTopic?.title || pId}
                            </span>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </div>

                {/* Skill Card / Badge Status if earned */}
                {hasCard && currentCard && (
                  <div className="p-2.5 rounded-[8px] bg-[var(--background)] border border-amber-500/40 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Award className="h-4 w-4 text-amber-500" />
                      <div className="flex flex-col">
                        <span className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase">
                          Earned Skill Card
                        </span>
                        <span className="font-mono text-xs font-bold capitalize text-[var(--foreground)]">
                          {currentCard.tier} Tier · {currentCard.topicTitle}
                        </span>
                      </div>
                    </div>
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {currentCard.score}% Acc
                    </Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[var(--border)] space-y-2">
              <Button
                onClick={handleStartLesson}
                disabled={!isUnlocked}
                variant="default"
                size="lg"
                className="w-full gap-2 font-mono text-xs tracking-wider"
              >
                {isCompleted ? (
                  <>
                    <span>REVIEW LESSON</span>
                    <span>↺</span>
                  </>
                ) : isUnlocked ? (
                  <>
                    <span>START LESSON</span>
                    <span>↗</span>
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5 mr-1" />
                    <span>LOCKED · COMPLETE PREREQUISITES</span>
                  </>
                )}
              </Button>

              {onOpenMentorWithMessage && (
                <Button
                  onClick={() => {
                    sound.playClick();
                    onOpenMentorWithMessage(
                      `Can you give me an intuitive overview of "${selectedTopic.title}" and explain why it's important before I start the lesson?`
                    );
                  }}
                  variant="outline"
                  size="sm"
                  className="w-full gap-1.5 font-mono text-xs"
                >
                  <Sparkles className="h-3.5 w-3.5 text-[var(--primary)]" />
                  <span>Ask AI Mentor About Topic</span>
                </Button>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
