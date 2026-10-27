import React, { useState, useEffect } from 'react';
import { StudentProfile } from '../types';
import { sound } from '../lib/soundEngine';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import {
  PLAY_TOPICS,
  GAME_MODES,
  GameModeId,
  ChallengeTopicId,
  ActionBlock,
  LOGIC_EXPEDITION_CHALLENGES,
  CODE_DETECTIVE_CHALLENGES,
  PATTERN_BUILDER_CHALLENGES,
  SPEED_CHALLENGES,
  ALGORITHM_ARENA_CHALLENGES,
} from '../lib/playChallengesData';
import {
  Compass,
  Search,
  Grid,
  Zap,
  Swords,
  Play,
  RotateCcw,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  ArrowRight,
  ArrowLeft,
  X,
  Trophy,
  Flame,
  Check,
  ChevronRight,
  HelpCircle,
} from 'lucide-react';

interface PlayAndLearnProps {
  profile: StudentProfile;
  onUpdateProfile: (updates: Partial<StudentProfile>) => void;
  onRequestMentorContext?: (context: any) => void;
  onOpenMentorWithMessage?: (msg: string) => void;
  locale?: string;
}

export const PlayAndLearn: React.FC<PlayAndLearnProps> = ({
  profile,
  onUpdateProfile,
  onOpenMentorWithMessage,
  locale = 'en',
}) => {
  // Navigation & Category States
  const [activeMode, setActiveMode] = useState<GameModeId>('logic-expedition');
  const [activeTopic, setActiveTopic] = useState<ChallengeTopicId>('variables');

  // Shared Streak & Score
  const [streak, setStreak] = useState<number>(profile.predictionStreak || 0);
  const [hintIndex, setHintIndex] = useState<number>(-1);
  const [showHintModal, setShowHintModal] = useState<boolean>(false);

  // --- MODE 1: LOGIC EXPEDITION STATE ---
  const currentExpedition = LOGIC_EXPEDITION_CHALLENGES[activeTopic];
  const [slottedBlocks, setSlottedBlocks] = useState<(ActionBlock | null)[]>([]);
  const [expeditionFeedback, setExpeditionFeedback] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });
  const [expeditionPathStep, setExpeditionPathStep] = useState<number>(0);

  // Initialize slots when topic or mode changes
  useEffect(() => {
    setSlottedBlocks(new Array(currentExpedition.slotCount).fill(null));
    setExpeditionFeedback({ status: 'idle', message: '' });
    setHintIndex(-1);
    setExpeditionPathStep(0);
  }, [activeTopic, activeMode]);

  const handleAddBlockToFirstEmptySlot = (block: ActionBlock) => {
    sound.playClick();
    const nextSlots = [...slottedBlocks];
    const emptyIdx = nextSlots.findIndex((s) => s === null);
    if (emptyIdx !== -1) {
      nextSlots[emptyIdx] = block;
      setSlottedBlocks(nextSlots);
      setExpeditionFeedback({ status: 'idle', message: '' });
    }
  };

  const handleRemoveBlockFromSlot = (slotIdx: number) => {
    sound.playClick();
    const nextSlots = [...slottedBlocks];
    nextSlots[slotIdx] = null;
    setSlottedBlocks(nextSlots);
    setExpeditionFeedback({ status: 'idle', message: '' });
  };

  const handleResetExpedition = () => {
    sound.playClick();
    setSlottedBlocks(new Array(currentExpedition.slotCount).fill(null));
    setExpeditionFeedback({ status: 'idle', message: '' });
    setExpeditionPathStep(0);
  };

  const handleCheckExpedition = () => {
    const isAllFilled = slottedBlocks.every((s) => s !== null);
    if (!isAllFilled) {
      sound.playError();
      setExpeditionFeedback({
        status: 'error',
        message: `Please fill all ${currentExpedition.slotCount} sequence slots before activating.`,
      });
      return;
    }

    const currentSequenceIds = slottedBlocks.map((s) => s!.id);
    const isMatch = currentExpedition.correctSequences.some((seq) =>
      seq.every((id, idx) => id === currentSequenceIds[idx])
    );

    if (isMatch) {
      sound.playSuccess();
      setExpeditionPathStep(currentExpedition.slotCount);
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      onUpdateProfile({
        xp: profile.xp + currentExpedition.xpReward,
        predictionStreak: nextStreak,
        bestStreak: Math.max(profile.bestStreak, nextStreak),
      });
      setExpeditionFeedback({
        status: 'success',
        message: `Sequence Activated! Crystal Energy Harvested (+${currentExpedition.xpReward} XP). ${currentExpedition.explanation}`,
      });
    } else {
      sound.playError();
      setStreak(0);
      onUpdateProfile({ predictionStreak: 0 });
      setExpeditionFeedback({
        status: 'error',
        message: `Logic sequence failed to unlock the crystal barrier. Review the order of execution and try again.`,
      });
    }
  };

  // --- MODE 2: CODE DETECTIVE STATE ---
  const currentDetective = CODE_DETECTIVE_CHALLENGES[activeTopic];
  const [selectedDetectiveOption, setSelectedDetectiveOption] = useState<number | null>(null);
  const [detectiveFeedback, setDetectiveFeedback] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  useEffect(() => {
    setSelectedDetectiveOption(null);
    setDetectiveFeedback({ status: 'idle', message: '' });
    setHintIndex(-1);
  }, [activeTopic]);

  const handleSelectDetectiveOption = (idx: number) => {
    if (detectiveFeedback.status !== 'idle') return;
    setSelectedDetectiveOption(idx);
    if (idx === currentDetective.correctIndex) {
      sound.playSuccess();
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      onUpdateProfile({
        xp: profile.xp + currentDetective.xpReward,
        predictionStreak: nextStreak,
        bestStreak: Math.max(profile.bestStreak, nextStreak),
      });
      setDetectiveFeedback({
        status: 'success',
        message: `Case Solved! ${currentDetective.explanation} (+${currentDetective.xpReward} XP)`,
      });
    } else {
      sound.playError();
      setStreak(0);
      onUpdateProfile({ predictionStreak: 0 });
      setDetectiveFeedback({
        status: 'error',
        message: `Incorrect deduction. ${currentDetective.explanation}`,
      });
    }
  };

  // --- MODE 3: PATTERN BUILDER STATE ---
  const currentPattern = PATTERN_BUILDER_CHALLENGES[activeTopic];
  const [patternSlots, setPatternSlots] = useState<(ActionBlock | null)[]>([]);
  const [patternFeedback, setPatternFeedback] = useState<{
    status: 'idle' | 'success' | 'error';
    message: string;
  }>({ status: 'idle', message: '' });

  useEffect(() => {
    setPatternSlots(new Array(currentPattern.slotCount).fill(null));
    setPatternFeedback({ status: 'idle', message: '' });
    setHintIndex(-1);
  }, [activeTopic]);

  const handleAddPatternRule = (rule: ActionBlock) => {
    sound.playClick();
    const next = [...patternSlots];
    const emptyIdx = next.findIndex((s) => s === null);
    if (emptyIdx !== -1) {
      next[emptyIdx] = rule;
      setPatternSlots(next);
      setPatternFeedback({ status: 'idle', message: '' });
    }
  };

  const handleRemovePatternRule = (slotIdx: number) => {
    sound.playClick();
    const next = [...patternSlots];
    next[slotIdx] = null;
    setPatternSlots(next);
    setPatternFeedback({ status: 'idle', message: '' });
  };

  const handleCheckPattern = () => {
    const isAllFilled = patternSlots.every((s) => s !== null);
    if (!isAllFilled) {
      sound.playError();
      setPatternFeedback({
        status: 'error',
        message: `Please fill all ${currentPattern.slotCount} rule slots to evaluate pattern synthesis.`,
      });
      return;
    }

    const currentSequenceIds = patternSlots.map((s) => s!.id);
    const isMatch = currentPattern.correctSequences.some((seq) =>
      seq.every((id, idx) => id === currentSequenceIds[idx])
    );

    if (isMatch) {
      sound.playSuccess();
      const nextStreak = streak + 1;
      setStreak(nextStreak);
      onUpdateProfile({
        xp: profile.xp + currentPattern.xpReward,
        predictionStreak: nextStreak,
      });
      setPatternFeedback({
        status: 'success',
        message: `Pattern Synthesized! Target state successfully generated. (+${currentPattern.xpReward} XP)`,
      });
    } else {
      sound.playError();
      setStreak(0);
      setPatternFeedback({
        status: 'error',
        message: `Output does not match the target pattern. Check the transformation rules.`,
      });
    }
  };

  // --- MODE 4: SPEED CHALLENGE STATE ---
  const currentSpeed = SPEED_CHALLENGES[activeTopic];
  const [speedQuestionIdx, setSpeedQuestionIdx] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(currentSpeed.timeSeconds);
  const [isSpeedRunning, setIsSpeedRunning] = useState<boolean>(false);
  const [speedScore, setSpeedScore] = useState<number>(0);
  const [speedFinished, setSpeedFinished] = useState<boolean>(false);
  const [lastAnswerFeedback, setLastAnswerFeedback] = useState<string | null>(null);

  useEffect(() => {
    setIsSpeedRunning(false);
    setTimeLeft(currentSpeed.timeSeconds);
    setSpeedQuestionIdx(0);
    setSpeedScore(0);
    setSpeedFinished(false);
    setLastAnswerFeedback(null);
  }, [activeTopic]);

  useEffect(() => {
    let timer: any = null;
    if (isSpeedRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setIsSpeedRunning(false);
            setSpeedFinished(true);
            sound.playSuccess();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isSpeedRunning, timeLeft]);

  const handleStartSpeedChallenge = () => {
    sound.playClick();
    setIsSpeedRunning(true);
    setTimeLeft(currentSpeed.timeSeconds);
    setSpeedScore(0);
    setSpeedQuestionIdx(0);
    setSpeedFinished(false);
    setLastAnswerFeedback(null);
  };

  const handleAnswerSpeedQuestion = (userAnswer: boolean) => {
    const q = currentSpeed.questions[speedQuestionIdx];
    const isCorrect = userAnswer === q.isTrue;

    if (isCorrect) {
      sound.playClick();
      setSpeedScore((prev) => prev + currentSpeed.xpPerQuestion);
      onUpdateProfile({ xp: profile.xp + currentSpeed.xpPerQuestion });
      setLastAnswerFeedback(`Correct: ${q.explanation}`);
    } else {
      sound.playError();
      setLastAnswerFeedback(`Wrong: ${q.explanation}`);
    }

    if (speedQuestionIdx < currentSpeed.questions.length - 1) {
      setSpeedQuestionIdx((prev) => prev + 1);
    } else {
      setIsSpeedRunning(false);
      setSpeedFinished(true);
      sound.playSuccess();
    }
  };

  // --- MODE 5: ALGORITHM ARENA STATE ---
  const currentArena = ALGORITHM_ARENA_CHALLENGES[activeTopic];
  const [arenaArray, setArenaArray] = useState<number[]>([...currentArena.initialArray]);
  const [selectedArenaIndices, setSelectedArenaIndices] = useState<number[]>([]);
  const [movesCount, setMovesCount] = useState<number>(0);
  const [arenaSolved, setArenaSolved] = useState<boolean>(false);

  useEffect(() => {
    setArenaArray([...currentArena.initialArray]);
    setSelectedArenaIndices([]);
    setMovesCount(0);
    setArenaSolved(false);
  }, [activeTopic]);

  const handleSelectArenaItem = (idx: number) => {
    if (arenaSolved) return;
    sound.playClick();

    if (selectedArenaIndices.includes(idx)) {
      setSelectedArenaIndices(selectedArenaIndices.filter((i) => i !== idx));
      return;
    }

    const next = [...selectedArenaIndices, idx];
    if (next.length === 2) {
      // Execute swap
      const [i1, i2] = next;
      const copy = [...arenaArray];
      const temp = copy[i1];
      copy[i1] = copy[i2];
      copy[i2] = temp;

      setArenaArray(copy);
      setSelectedArenaIndices([]);
      setMovesCount((prev) => prev + 1);
      sound.playSwap();

      // Check condition
      let solved = false;
      if (currentArena.targetCondition === 'sorted-asc') {
        solved = copy.every((v, i) => i === 0 || copy[i - 1] <= v);
      } else if (currentArena.targetCondition === 'max-at-end') {
        const maxVal = Math.max(...copy);
        solved = copy[copy.length - 1] === maxVal;
      }

      if (solved) {
        setArenaSolved(true);
        sound.playSuccess();
        const nextStreak = streak + 1;
        setStreak(nextStreak);
        onUpdateProfile({
          xp: profile.xp + currentArena.xpReward,
          predictionStreak: nextStreak,
        });
      }
    } else {
      setSelectedArenaIndices(next);
    }
  };

  const handleResetArena = () => {
    sound.playClick();
    setArenaArray([...currentArena.initialArray]);
    setSelectedArenaIndices([]);
    setMovesCount(0);
    setArenaSolved(false);
  };

  // Helper for rendering game mode icons
  const getModeIcon = (iconName: string, className = 'h-5 w-5') => {
    switch (iconName) {
      case 'Compass':
        return <Compass className={className} />;
      case 'Search':
        return <Search className={className} />;
      case 'Grid':
        return <Grid className={className} />;
      case 'Zap':
        return <Zap className={className} />;
      case 'Swords':
        return <Swords className={className} />;
      default:
        return <Compass className={className} />;
    }
  };

  // Get active hints list for current game mode
  const getActiveHints = (): string[] => {
    if (activeMode === 'logic-expedition') return currentExpedition.hints;
    if (activeMode === 'code-detective') return currentDetective.hints;
    if (activeMode === 'pattern-builder') return currentPattern.hints;
    if (activeMode === 'algorithm-arena') return currentArena.hints;
    return ['Evaluate invariants carefully before answering.'];
  };

  const currentHints = getActiveHints();

  const handleShowNextHint = () => {
    sound.playClick();
    if (hintIndex < currentHints.length - 1) {
      setHintIndex((prev) => prev + 1);
    }
    setShowHintModal(true);
  };

  return (
    <div className="space-y-6 lift-up max-w-full">
      {/* 1. FANTASY GAME HERO ENVIRONMENT & BANNER */}
      <div className="relative rounded-[14px] border border-[var(--border)] overflow-hidden bg-[#0A0D08] text-[#ECEBE3] shadow-xl">
        {/* Vector Landscape Canvas: Floating Islands, Glowing Arcane Crystals, Forest Canopy, Starlight Aurora */}
        <div className="relative w-full h-[180px] sm:h-[220px] overflow-hidden select-none">
          <svg
            viewBox="0 0 1200 320"
            preserveAspectRatio="xMidYMid slice"
            className="absolute inset-0 w-full h-full opacity-85"
          >
            <defs>
              {/* Sky Twilight Gradient */}
              <linearGradient id="skyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#060906" />
                <stop offset="60%" stopColor="#0F1710" />
                <stop offset="100%" stopColor="#1B2B1B" />
              </linearGradient>

              {/* Glowing Arcane Crystal Radiant Gradient */}
              <radialGradient id="crystalGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#9BD77A" stopOpacity="0.95" />
                <stop offset="45%" stopColor="#597346" stopOpacity="0.6" />
                <stop offset="100%" stopColor="#1E2E1D" stopOpacity="0" />
              </radialGradient>

              {/* Island Moss Gradient */}
              <linearGradient id="mossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#2D4624" />
                <stop offset="100%" stopColor="#142111" />
              </linearGradient>

              {/* Stone Rock Gradient */}
              <linearGradient id="stoneGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#1C201A" />
                <stop offset="100%" stopColor="#0B0D09" />
              </linearGradient>
            </defs>

            {/* Twilight Sky */}
            <rect width="1200" height="320" fill="url(#skyGrad)" />

            {/* Aurora Bands */}
            <path
              d="M 0 120 Q 300 40, 600 90 T 1200 60 L 1200 0 L 0 0 Z"
              fill="#597346"
              fillOpacity="0.18"
            />
            <path
              d="M 0 150 Q 400 80, 800 130 T 1200 100 L 1200 0 L 0 0 Z"
              fill="#9BD77A"
              fillOpacity="0.12"
            />

            {/* Background Floating Island 1 (Far Left) */}
            <g opacity="0.6" transform="translate(60, 40) scale(0.7)">
              <polygon points="120,80 180,60 220,90 190,140 100,120" fill="url(#stoneGrad)" />
              <ellipse cx="160" cy="75" rx="55" ry="18" fill="url(#mossGrad)" />
              <polygon points="150,55 160,35 170,55 160,65" fill="#9BD77A" opacity="0.9" />
            </g>

            {/* Main Central Floating Island (Hero Stage) */}
            <g transform="translate(420, 70)">
              {/* Rock Roots & Lower Spire */}
              <polygon points="80,110 280,105 340,140 220,240 160,250 110,180" fill="url(#stoneGrad)" />
              {/* Lush Forest Surface */}
              <path
                d="M 60 110 Q 200 85 360 105 Q 380 125 340 140 Q 200 155 80 140 Q 50 125 60 110 Z"
                fill="url(#mossGrad)"
              />
              {/* Tree Silhouettes */}
              <polygon points="100,100 110,65 120,100" fill="#1C3018" />
              <polygon points="115,102 125,58 135,102" fill="#253D20" />
              <polygon points="130,105 142,70 155,105" fill="#1C3018" />
              <polygon points="280,102 292,62 305,102" fill="#253D20" />
              <polygon points="300,105 310,72 320,105" fill="#1C3018" />

              {/* Glowing Monolith Shards */}
              <polygon points="210,100 220,40 230,100 220,115" fill="#9BD77A" />
              <polygon points="220,40 225,48 230,100 220,115" fill="#C2F0AA" opacity="0.75" />
              <circle cx="220" cy="40" r="38" fill="url(#crystalGlow)" />
            </g>

            {/* Floating Island Right */}
            <g transform="translate(860, 50) scale(0.9)">
              <polygon points="90,110 260,100 300,135 210,210 130,190" fill="url(#stoneGrad)" />
              <ellipse cx="190" cy="110" rx="90" ry="22" fill="url(#mossGrad)" />
              {/* Stone Runic Arch */}
              <path d="M 175 110 L 175 75 Q 190 65 205 75 L 205 110 Z" fill="#2A3326" />
              <circle cx="190" cy="72" r="16" fill="url(#crystalGlow)" />
            </g>

            {/* Floating Celestial Dust & Arcane Nodes */}
            <circle cx="280" cy="110" r="3" fill="#9BD77A" opacity="0.8" />
            <circle cx="340" cy="70" r="2.5" fill="#C2F0AA" opacity="0.9" />
            <circle cx="780" cy="140" r="3.5" fill="#9BD77A" opacity="0.85" />
            <circle cx="820" cy="95" r="2" fill="#FFFFFF" opacity="0.8" />
            <circle cx="150" cy="160" r="3" fill="#9BD77A" opacity="0.75" />
          </svg>

          {/* Vignette Overlay & Hero Typography */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0A0D08] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0A0D08]/90 via-[#0A0D08]/40 to-[#0A0D08]/90" />

          {/* Large Hero Heading with Subtitle */}
          <div className="absolute bottom-4 left-5 right-5 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 font-mono text-[11px] text-[#9BD77A] uppercase tracking-wider">
                <Sparkles className="h-3.5 w-3.5" />
                <span>INTERACTIVE ADVENTURE REALM</span>
                <span>·</span>
                <span>FANTASY CODING WORKBENCH</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white mt-0.5">
                Play &amp; <span className="font-serif-italic text-[#9BD77A]">Learn</span>
              </h1>
              <p className="text-xs sm:text-sm text-[#A8B2A2] max-w-xl mt-0.5 leading-snug">
                Step into a gamified computational universe. Assemble logic, track memory registers, hunt down subtle bugs, and master algorithms through hands-on play.
              </p>
            </div>

            {/* XP & Streak Badges */}
            <div className="flex items-center gap-2 shrink-0">
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#2D3F28] bg-[#121B10]/90 text-xs font-mono text-white shadow-md">
                <Flame className="h-4 w-4 text-amber-400 fill-amber-400" />
                <span className="text-[#9BD77A] font-bold">{streak}</span>
                <span className="text-[#879680]">Streak</span>
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] border border-[#2D3F28] bg-[#121B10]/90 text-xs font-mono text-white shadow-md">
                <Trophy className="h-4 w-4 text-yellow-400" />
                <span className="text-[#9BD77A] font-bold">{profile.xp}</span>
                <span className="text-[#879680]">XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Topic Selector Ribbon Bar */}
        <div className="border-t border-[#1C2619] bg-[#0E140C] p-2.5 px-4 flex items-center gap-2 overflow-x-auto max-w-full text-xs font-mono select-none">
          <span className="text-[#75846E] shrink-0 font-bold uppercase text-[10px] tracking-wider mr-1">
            Topic Domain:
          </span>
          {PLAY_TOPICS.map((topic) => {
            const isActive = activeTopic === topic.id;
            return (
              <button
                key={topic.id}
                onClick={() => {
                  sound.playClick();
                  setActiveTopic(topic.id);
                }}
                className={`px-3 py-1.5 rounded-[6px] border whitespace-nowrap transition-all duration-200 shrink-0 flex items-center gap-1.5 ${
                  isActive
                    ? 'border-[#9BD77A] bg-[#1A2E16] text-[#9BD77A] font-bold shadow-xs'
                    : 'border-[#1E291B] bg-[#10170E] text-[#8C9B85] hover:text-white hover:border-[#384A33]'
                }`}
              >
                <span>{topic.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN FEATURED PLAYABLE GAME STAGE */}
      <div className="space-y-4">
        {/* GAME MODE 1: LOGIC EXPEDITION (FEATURED PRIMARY GAME) */}
        {activeMode === 'logic-expedition' && (
          <Card className="p-5 sm:p-6 bg-[var(--card)] border border-[var(--border)] space-y-6 lift-up relative">
            {/* Stage Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center">
                  <Compass className="h-4 w-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                      QUEST MODE · {activeTopic.toUpperCase()}
                    </span>
                    <span className="text-[var(--muted-foreground)] text-xs">·</span>
                    <span className="font-mono text-xs text-[var(--muted-foreground)]">
                      {currentExpedition.slotCount} Sequence Slots
                    </span>
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
                    {currentExpedition.title}
                  </h2>
                </div>
              </div>

              {/* Action Buttons: Hint, Reset, Check */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  onClick={handleShowNextHint}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 font-mono text-xs"
                >
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  <span>Hint</span>
                </Button>

                <Button
                  onClick={handleResetExpedition}
                  variant="outline"
                  size="sm"
                  className="gap-1.5 font-mono text-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset</span>
                </Button>

                <Button
                  onClick={handleCheckExpedition}
                  variant="default"
                  size="sm"
                  className="gap-1.5 font-mono text-xs px-4"
                >
                  <Play className="h-3.5 w-3.5" />
                  <span>Check Answer ↗</span>
                </Button>
              </div>
            </div>

            {/* Split Quest Grid: Objective & Island Visualizer (Left) + Available Blocks & Slots (Right) */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (5 cols): Objective Panel & Visual Island Path Simulation */}
              <div className="lg:col-span-5 space-y-4">
                {/* Lore & Objective */}
                <div className="p-4 rounded-[10px] bg-[var(--background)] border border-[var(--border)] space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wide text-[var(--primary)]">
                    <Sparkles className="h-3.5 w-3.5" />
                    <span>Expedition Objective</span>
                  </div>
                  <p className="text-xs text-[var(--foreground)] leading-relaxed font-sans font-medium">
                    {currentExpedition.objective}
                  </p>
                  <p className="text-[11px] italic text-[var(--muted-foreground)] border-t border-[var(--border)] pt-2 mt-2">
                    "{currentExpedition.lore}"
                  </p>
                </div>

                {/* Island Path Grid Simulation Canvas */}
                <div className="p-4 rounded-[10px] bg-[#0E120B] border border-[#23301E] space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#8C9E84]">
                    <span>TERRAIN SIMULATOR</span>
                    <span>Path: {expeditionPathStep} / {currentExpedition.slotCount}</span>
                  </div>

                  {/* 2D Tile Grid */}
                  <div
                    className="grid gap-1.5 select-none"
                    style={{
                      gridTemplateColumns: `repeat(${currentExpedition.gridMap.gridSize[1]}, minmax(0, 1fr))`,
                    }}
                  >
                    {Array.from({ length: currentExpedition.gridMap.gridSize[0] }).map((_, r) =>
                      Array.from({ length: currentExpedition.gridMap.gridSize[1] }).map((_, c) => {
                        const isStart = currentExpedition.gridMap.start[0] === r && currentExpedition.gridMap.start[1] === c;
                        const isCrystal = currentExpedition.gridMap.crystal[0] === r && currentExpedition.gridMap.crystal[1] === c;
                        const isObstacle = currentExpedition.gridMap.obstacles.some((o) => o[0] === r && o[1] === c);
                        const isReached = isCrystal && expeditionFeedback.status === 'success';

                        return (
                          <div
                            key={`tile-${r}-${c}`}
                            className={`h-14 sm:h-16 rounded-[8px] border flex flex-col items-center justify-center p-1 relative transition-all duration-300 ${
                              isReached
                                ? 'border-[#9BD77A] bg-[#1F3A1A] text-white shadow-lg'
                                : isCrystal
                                ? 'border-[#597346] bg-[#142312] text-[#9BD77A]'
                                : isStart
                                ? 'border-[#4B5E41] bg-[#182615] text-[#ECEBE3]'
                                : isObstacle
                                ? 'border-[#30211E] bg-[#1C1210] text-[#A8645B]'
                                : 'border-[#1F2B1A] bg-[#10170E] text-[#4A5D44]'
                            }`}
                          >
                            {isStart && (
                              <span className="font-mono text-[9px] uppercase font-bold text-[#9BD77A]">
                                Start [0,0]
                              </span>
                            )}
                            {isCrystal && (
                              <div className="flex flex-col items-center">
                                <Sparkles className={`h-5 w-5 ${isReached ? 'animate-bounce text-amber-300' : 'text-[#9BD77A]'}`} />
                                <span className="font-mono text-[9px] font-bold">CRYSTAL</span>
                              </div>
                            )}
                            {isObstacle && (
                              <span className="font-mono text-[10px] text-[#A8645B] font-bold">
                                ✕ RIFT
                              </span>
                            )}
                            {!isStart && !isCrystal && !isObstacle && (
                              <span className="font-mono text-[9px] opacity-40">
                                {r},{c}
                              </span>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column (7 cols): Available Action Blocks & Draggable Sequence Slots */}
              <div className="lg:col-span-7 space-y-5">
                {/* Available Action Blocks Palette */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--foreground)] font-bold uppercase tracking-wider">
                      Available Action Blocks:
                    </span>
                    <span className="text-[var(--muted-foreground)] text-[11px]">
                      Click block to place into sequence
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {currentExpedition.availableBlocks.map((block) => (
                      <button
                        key={block.id}
                        onClick={() => handleAddBlockToFirstEmptySlot(block)}
                        className="p-3 rounded-[8px] border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] hover:bg-[var(--card)] transition-all text-left group flex flex-col justify-between gap-1 shadow-xs hover:shadow-md"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-[var(--foreground)] group-hover:text-[var(--primary)]">
                            {block.label}
                          </span>
                          <span className="font-mono text-[10px] uppercase px-1.5 py-0.5 rounded-[4px] bg-[var(--muted)] text-[var(--muted-foreground)]">
                            {block.category}
                          </span>
                        </div>
                        <code className="text-[11px] font-mono text-[var(--primary)] bg-[var(--card)] px-1.5 py-0.5 rounded-[4px] border border-[var(--border)] block truncate">
                          {block.code}
                        </code>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Draggable Sequence Slots Container */}
                <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--foreground)] font-bold uppercase tracking-wider">
                      Draggable Sequence Slots:
                    </span>
                    <span className="text-[var(--muted-foreground)] text-[11px]">
                      Sequential Execution Order
                    </span>
                  </div>

                  <div className="space-y-2">
                    {slottedBlocks.map((block, idx) => (
                      <div
                        key={`slot-${idx}`}
                        className={`p-3 rounded-[8px] border-2 transition-all flex items-center justify-between gap-3 ${
                          block
                            ? 'border-[var(--primary)] bg-[var(--card)] shadow-xs'
                            : 'border-dashed border-[var(--border)] bg-[var(--background)]/60'
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="w-6 h-6 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] font-mono text-xs font-bold flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>

                          {block ? (
                            <div className="min-w-0">
                              <span className="font-mono text-xs font-bold text-[var(--foreground)] block truncate">
                                {block.label}
                              </span>
                              <code className="font-mono text-[11px] text-[var(--primary)] block truncate">
                                {block.code}
                              </code>
                            </div>
                          ) : (
                            <span className="font-mono text-xs text-[var(--muted-foreground)] italic">
                              Empty Slot {idx + 1} · Click an action block above to slot
                            </span>
                          )}
                        </div>

                        {block && (
                          <button
                            onClick={() => handleRemoveBlockFromSlot(idx)}
                            className="p-1 rounded-[6px] hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--destructive)] transition-colors shrink-0"
                            title="Remove block from slot"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Feedback Notification Banner */}
                {expeditionFeedback.status !== 'idle' && (
                  <div
                    className={`p-4 rounded-[8px] border text-xs font-mono leading-relaxed lift-up flex items-start gap-3 ${
                      expeditionFeedback.status === 'success'
                        ? 'border-[#3B7A57] bg-[#3B7A57]/15 text-[var(--foreground)]'
                        : 'border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)]'
                    }`}
                  >
                    {expeditionFeedback.status === 'success' ? (
                      <CheckCircle2 className="h-5 w-5 text-[#3B7A57] shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="h-5 w-5 text-[var(--destructive)] shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="font-bold mb-0.5 uppercase tracking-wide">
                        {expeditionFeedback.status === 'success' ? 'Validation Passed' : 'Execution Error'}
                      </div>
                      <p>{expeditionFeedback.message}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* GAME MODE 2: CODE DETECTIVE */}
        {activeMode === 'code-detective' && (
          <Card className="p-5 sm:p-6 bg-[var(--card)] border border-[var(--border)] space-y-6 lift-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center">
                  <Search className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                    CODE DETECTIVE · {activeTopic.toUpperCase()}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
                    {currentDetective.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleShowNextHint} variant="outline" size="sm" className="gap-1.5 font-mono text-xs">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  <span>Hint</span>
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-6 space-y-3">
                <div className="p-3 rounded-[8px] bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)]">
                  {currentDetective.objective}
                </div>
                {/* Code Snippet Display with line numbers */}
                <div className="p-4 rounded-[8px] bg-[#0E120B] border border-[#24301E] font-mono text-xs text-[#ECEBE3] overflow-x-auto">
                  <pre className="leading-relaxed">
                    <code>{currentDetective.codeSnippet}</code>
                  </pre>
                </div>
              </div>

              <div className="lg:col-span-6 space-y-4">
                <div className="text-sm font-bold font-mono text-[var(--foreground)]">
                  {currentDetective.question}
                </div>

                <div className="space-y-2">
                  {currentDetective.options.map((opt, idx) => {
                    const isSelected = selectedDetectiveOption === idx;
                    const isCorrect = idx === currentDetective.correctIndex;

                    let btnStyle = 'border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]';
                    if (detectiveFeedback.status !== 'idle') {
                      if (isCorrect) {
                        btnStyle = 'border-[#3B7A57] bg-[#3B7A57]/20 text-[#3B7A57] font-bold';
                      } else if (isSelected && !isCorrect) {
                        btnStyle = 'border-[var(--destructive)] bg-[var(--destructive)]/20 text-[var(--destructive)]';
                      }
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectDetectiveOption(idx)}
                        className={`w-full p-3.5 rounded-[8px] border text-left font-mono text-xs transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {detectiveFeedback.status !== 'idle' && isCorrect && (
                          <Check className="h-4 w-4 text-[#3B7A57]" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {detectiveFeedback.status !== 'idle' && (
                  <div
                    className={`p-3.5 rounded-[8px] border text-xs font-mono leading-relaxed lift-up ${
                      detectiveFeedback.status === 'success'
                        ? 'border-[#3B7A57] bg-[#3B7A57]/15 text-[var(--foreground)]'
                        : 'border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)]'
                    }`}
                  >
                    {detectiveFeedback.message}
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}

        {/* GAME MODE 3: PATTERN BUILDER */}
        {activeMode === 'pattern-builder' && (
          <Card className="p-5 sm:p-6 bg-[var(--card)] border border-[var(--border)] space-y-6 lift-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center">
                  <Grid className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                    PATTERN BUILDER · {activeTopic.toUpperCase()}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
                    {currentPattern.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button onClick={handleShowNextHint} variant="outline" size="sm" className="gap-1.5 font-mono text-xs">
                  <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
                  <span>Hint</span>
                </Button>
                <Button onClick={handleCheckPattern} variant="default" size="sm" className="gap-1.5 font-mono text-xs px-4">
                  <Play className="h-3.5 w-3.5" />
                  <span>Synthesize Pattern</span>
                </Button>
              </div>
            </div>

            {/* Pattern Target Display */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-[8px] bg-[var(--background)] border border-[var(--border)]">
                <span className="font-mono text-[10px] uppercase text-[var(--muted-foreground)] block mb-1">
                  Initial Input Array:
                </span>
                <div className="flex items-center gap-2 flex-wrap font-mono text-sm font-bold text-[var(--foreground)]">
                  {currentPattern.initialState.map((val, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-[6px] bg-[var(--card)] border border-[var(--border)]">
                      {val}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 rounded-[8px] bg-[var(--background)] border border-[var(--primary)]/60">
                <span className="font-mono text-[10px] uppercase text-[var(--primary)] font-bold block mb-1">
                  Target Goal Pattern:
                </span>
                <div className="flex items-center gap-2 flex-wrap font-mono text-sm font-bold text-[var(--primary)]">
                  {currentPattern.targetPattern.map((val, idx) => (
                    <span key={idx} className="px-2.5 py-1 rounded-[6px] bg-[var(--primary)]/15 border border-[var(--primary)]">
                      {val}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Rule Blocks & Slots */}
            <div className="space-y-3">
              <span className="font-mono text-xs font-bold text-[var(--foreground)] block">
                Available Transformation Rules:
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {currentPattern.availableRules.map((rule) => (
                  <button
                    key={rule.id}
                    onClick={() => handleAddPatternRule(rule)}
                    className="p-3 rounded-[8px] border border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)] text-left font-mono text-xs transition-colors"
                  >
                    <div className="font-bold text-[var(--foreground)] mb-1">{rule.label}</div>
                    <code className="text-[10px] text-[var(--primary)] block truncate">{rule.code}</code>
                  </button>
                ))}
              </div>

              {/* Slots */}
              <div className="space-y-2 pt-2">
                {patternSlots.map((slot, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-[8px] border-2 border-dashed border-[var(--border)] bg-[var(--background)] flex items-center justify-between font-mono text-xs"
                  >
                    <span>
                      Rule Slot {idx + 1}:{' '}
                      {slot ? (
                        <strong className="text-[var(--primary)]">{slot.label}</strong>
                      ) : (
                        <span className="text-[var(--muted-foreground)] italic">Unassigned</span>
                      )}
                    </span>
                    {slot && (
                      <button onClick={() => handleRemovePatternRule(idx)} className="text-[var(--destructive)] hover:underline">
                        Remove
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {patternFeedback.status !== 'idle' && (
                <div
                  className={`p-3.5 rounded-[8px] border text-xs font-mono leading-relaxed lift-up ${
                    patternFeedback.status === 'success'
                      ? 'border-[#3B7A57] bg-[#3B7A57]/15 text-[var(--foreground)]'
                      : 'border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)]'
                  }`}
                >
                  {patternFeedback.message}
                </div>
              )}
            </div>
          </Card>
        )}

        {/* GAME MODE 4: SPEED CHALLENGE */}
        {activeMode === 'speed-challenge' && (
          <Card className="p-5 sm:p-6 bg-[var(--card)] border border-[var(--border)] space-y-6 lift-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center">
                  <Zap className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                    SPEED CHALLENGE · {activeTopic.toUpperCase()}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
                    {currentSpeed.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-[8px] border border-[var(--border)] bg-[var(--background)] font-mono text-xs font-bold text-[var(--foreground)]">
                  <span>⏱ {timeLeft}s</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-[8px] border border-[var(--border)] bg-[var(--background)] font-mono text-xs font-bold text-[var(--primary)]">
                  <span>Score: {speedScore} XP</span>
                </div>
              </div>
            </div>

            {!isSpeedRunning && !speedFinished ? (
              <div className="p-8 text-center space-y-4">
                <Zap className="h-10 w-10 text-amber-400 mx-auto animate-pulse" />
                <h3 className="text-base font-bold text-[var(--foreground)]">
                  Ready for the {currentSpeed.timeSeconds}-Second Invariant Sprint?
                </h3>
                <p className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto">
                  Evaluate true/false statements at high speed. Gain XP for every accurate answer before the clock expires.
                </p>
                <Button onClick={handleStartSpeedChallenge} variant="default" size="lg" className="font-mono text-xs">
                  Start Speed Challenge ⚡
                </Button>
              </div>
            ) : speedFinished ? (
              <div className="p-6 text-center space-y-3">
                <Trophy className="h-8 w-8 text-yellow-500 mx-auto" />
                <h3 className="text-base font-bold text-[var(--foreground)]">Challenge Complete!</h3>
                <p className="font-mono text-sm text-[var(--primary)] font-bold">
                  Total Gained: +{speedScore} XP
                </p>
                <Button onClick={handleStartSpeedChallenge} variant="outline" size="sm" className="font-mono text-xs">
                  Retry Sprint ↺
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-5 rounded-[10px] bg-[var(--background)] border border-[var(--border)] text-center space-y-2">
                  <span className="font-mono text-[10px] uppercase text-[var(--muted-foreground)]">
                    Question {speedQuestionIdx + 1} of {currentSpeed.questions.length}
                  </span>
                  <div className="text-sm sm:text-base font-mono font-bold text-[var(--foreground)]">
                    {currentSpeed.questions[speedQuestionIdx]?.prompt}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    onClick={() => handleAnswerSpeedQuestion(true)}
                    variant="default"
                    size="lg"
                    className="font-mono text-sm h-12"
                  >
                    TRUE ✓
                  </Button>
                  <Button
                    onClick={() => handleAnswerSpeedQuestion(false)}
                    variant="secondary"
                    size="lg"
                    className="font-mono text-sm h-12"
                  >
                    FALSE ✕
                  </Button>
                </div>

                {lastAnswerFeedback && (
                  <div className="p-2.5 rounded-[6px] bg-[var(--background)] border border-[var(--border)] text-center font-mono text-xs text-[var(--muted-foreground)]">
                    {lastAnswerFeedback}
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        {/* GAME MODE 5: ALGORITHM ARENA */}
        {activeMode === 'algorithm-arena' && (
          <Card className="p-5 sm:p-6 bg-[var(--card)] border border-[var(--border)] space-y-6 lift-up">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-[8px] bg-[var(--primary)] text-[var(--primary-foreground)] flex items-center justify-center">
                  <Swords className="h-4 w-4" />
                </div>
                <div>
                  <div className="font-mono text-[10px] font-bold uppercase tracking-wider text-[var(--primary)]">
                    ALGORITHM ARENA · {activeTopic.toUpperCase()}
                  </div>
                  <h2 className="text-lg sm:text-xl font-bold tracking-tight text-[var(--foreground)]">
                    {currentArena.title}
                  </h2>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="font-mono text-xs text-[var(--muted-foreground)]">
                  Moves: <strong className="text-[var(--foreground)]">{movesCount}</strong> (Par: {currentArena.minMovesTarget})
                </div>
                <Button onClick={handleResetArena} variant="outline" size="sm" className="font-mono text-xs">
                  Reset ↺
                </Button>
              </div>
            </div>

            <div className="p-3 rounded-[8px] bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--foreground)]">
              {currentArena.objective} · <em>Click any two cards to execute an in-place register swap.</em>
            </div>

            {/* Interactive Array Cards */}
            <div className="flex items-center justify-center gap-3 sm:gap-4 py-6 overflow-x-auto">
              {arenaArray.map((val, idx) => {
                const isSelected = selectedArenaIndices.includes(idx);
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectArenaItem(idx)}
                    className={`w-14 sm:w-16 h-20 sm:h-24 rounded-[10px] border-2 flex flex-col items-center justify-between p-2 font-mono transition-all transform duration-200 select-none shadow-md ${
                      isSelected
                        ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] -translate-y-2 scale-105'
                        : arenaSolved
                        ? 'border-[#3B7A57] bg-[#3B7A57]/20 text-[var(--foreground)]'
                        : 'border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)]'
                    }`}
                  >
                    <span className="text-[10px] text-[var(--muted-foreground)]">[{idx}]</span>
                    <span className="text-base sm:text-lg font-bold">{val}</span>
                    <span className="text-[9px] uppercase opacity-75">{isSelected ? 'Active' : 'Pick'}</span>
                  </button>
                );
              })}
            </div>

            {arenaSolved && (
              <div className="p-4 rounded-[8px] border border-[#3B7A57] bg-[#3B7A57]/15 text-center font-mono text-xs text-[var(--foreground)] space-y-1 lift-up">
                <div className="font-bold text-[#3B7A57]">Target Invariant Achieved! (+{currentArena.xpReward} XP)</div>
                <p>{currentArena.explanation}</p>
              </div>
            )}
          </Card>
        )}
      </div>

      {/* 3. FIVE GAME-MODE CARDS ALONG THE BOTTOM */}
      <div className="space-y-2 pt-2">
        <div className="flex items-center justify-between font-mono text-xs text-[var(--muted-foreground)] px-1">
          <span className="uppercase font-bold tracking-wider text-[var(--foreground)]">
            Select Game Mode:
          </span>
          <span>5 Reusable Interactive Mechanics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {GAME_MODES.map((mode) => {
            const isActive = activeMode === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => {
                  sound.playClick();
                  setActiveMode(mode.id);
                }}
                className={`p-4 rounded-[10px] border text-left transition-all duration-200 relative flex flex-col justify-between gap-3 group ${
                  isActive
                    ? 'border-[#9BD77A] bg-[var(--card)] shadow-lg ring-1 ring-[#9BD77A]/40'
                    : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] hover:shadow-md'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div
                      className={`w-8 h-8 rounded-[8px] flex items-center justify-center transition-colors ${
                        isActive
                          ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                          : 'bg-[var(--muted)] text-[var(--muted-foreground)] group-hover:text-[var(--foreground)]'
                      }`}
                    >
                      {getModeIcon(mode.iconName, 'h-4 w-4')}
                    </div>
                    {isActive && (
                      <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 rounded-[4px] bg-[#9BD77A]/20 text-[#9BD77A] font-bold">
                        Active
                      </span>
                    )}
                  </div>

                  <h3 className="font-mono text-xs sm:text-sm font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors leading-tight">
                    {mode.name}
                  </h3>
                  <div className="font-mono text-[10px] text-[var(--primary)] font-semibold mt-0.5">
                    {mode.tagline}
                  </div>
                </div>

                <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed line-clamp-2">
                  {mode.description}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4. HINT MODAL */}
      {showHintModal && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setShowHintModal(false)}
        >
          <div
            className="w-full max-w-md p-5 rounded-[12px] bg-[var(--card)] border border-[var(--border)] space-y-4 shadow-2xl lift-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--primary)] uppercase tracking-wider">
                <Lightbulb className="h-4 w-4 text-amber-400" />
                <span>Mentor Hint ({hintIndex + 1} / {currentHints.length})</span>
              </div>
              <button
                onClick={() => setShowHintModal(false)}
                className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="p-3.5 rounded-[8px] bg-[var(--background)] border border-[var(--border)] text-xs font-mono leading-relaxed text-[var(--foreground)]">
              {currentHints[hintIndex] || currentHints[0]}
            </div>

            <div className="flex items-center justify-between gap-3 pt-2">
              {hintIndex < currentHints.length - 1 ? (
                <Button
                  onClick={() => setHintIndex((prev) => prev + 1)}
                  variant="outline"
                  size="sm"
                  className="font-mono text-xs"
                >
                  Next Hint ({hintIndex + 2}/{currentHints.length}) &rarr;
                </Button>
              ) : (
                <span className="font-mono text-[10px] text-[var(--muted-foreground)]">All hints revealed</span>
              )}

              <Button
                onClick={() => setShowHintModal(false)}
                variant="default"
                size="sm"
                className="font-mono text-xs ml-auto"
              >
                Got It ✓
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
