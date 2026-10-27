import React, { useState, useEffect, useRef } from 'react';
import { SortStep, StudentProfile, TopicId } from '../types';
import { generateBubbleSortSteps, PSEUDOCODE_DEFINITIONS, getLanguageLineIndex } from '../lib/bubbleSortEngine';
import { generateSelectionSortSteps, generateInsertionSortSteps } from '../lib/sortingEngines';
import { LoopLab } from './labs/LoopLab';
import { ArrayLab } from './labs/ArrayLab';
import { MatrixLab } from './labs/MatrixLab';
import { SupportedLocale, TRANSLATIONS } from '../lib/i18n';
import { sound } from '../lib/soundEngine';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import {
  Play,
  Pause,
  SkipForward,
  SkipBack,
  RotateCcw,
  Sparkles,
  Check,
  Dices,
  Layers,
  ArrowUpDown,
  Repeat,
  ListFilter,
  Grid,
  BarChart3,
  GitCommit,
  Columns,
  CircleDot,
} from 'lucide-react';
import { SortBraidVisualizer } from './SortBraidVisualizer';
import { SortOrbitVisualizer } from './SortOrbitVisualizer';
import { generateBraidTrace, BraidTrace } from '../lib/braidEngine';

interface VisualLabProps {
  profile: StudentProfile;
  onUpdateProfile: (updates: Partial<StudentProfile>) => void;
  onRequestMentorContext: (context: any) => void;
  locale: SupportedLocale;
  initialTopic?: TopicId;
  initialLab?: 'loop' | 'array' | 'matrix' | 'sort';
}

const PRESET_ARRAYS = [
  { name: 'Standard Mix', array: [45, 12, 85, 32, 89, 39, 69, 22] },
  { name: 'Duplicate Keys', array: [25, 60, 25, 80, 40, 60, 15] },
  { name: 'Negative Values', array: [-15, 30, -5, 60, 0, -25, 45] },
  { name: 'Nearly Sorted', array: [10, 20, 30, 50, 40, 60, 70] },
  { name: 'Reverse Sorted', array: [80, 70, 60, 50, 40, 30, 20] },
];

type LabTab = 'bubble-sort' | 'selection-sort' | 'insertion-sort' | 'loops' | 'arrays-1d' | 'arrays-2d';

export const VisualLab: React.FC<VisualLabProps> = ({
  profile,
  onUpdateProfile,
  onRequestMentorContext,
  locale,
  initialTopic,
  initialLab,
}) => {
  const t = TRANSLATIONS[locale];

  // Active sub-lab tab
  const getInitialTab = (): LabTab => {
    if (initialLab === 'loop') return 'loops';
    if (initialLab === 'array') return 'arrays-1d';
    if (initialLab === 'matrix') return 'arrays-2d';
    if (initialTopic === 'selection-sort') return 'selection-sort';
    if (initialTopic === 'insertion-sort') return 'insertion-sort';
    if (initialTopic === 'loops') return 'loops';
    if (initialTopic === 'arrays-1d') return 'arrays-1d';
    if (initialTopic === 'arrays-2d') return 'arrays-2d';
    return 'bubble-sort';
  };

  const [activeTab, setActiveTab] = useState<LabTab>(getInitialTab);

  const [currentArray, setCurrentArray] = useState<number[]>([45, 12, 85, 32, 89, 39, 69, 22]);
  const [customInput, setCustomInput] = useState('45, 12, 85, 32, 89, 39, 69, 22');
  const [customError, setCustomError] = useState<string | null>(null);

  const [steps, setSteps] = useState<SortStep[]>([]);
  const [stepIndex, setStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speedMultiplier, setSpeedMultiplier] = useState(1);
  const [isPredictMode, setIsPredictMode] = useState(false);
  const [predictFeedback, setPredictFeedback] = useState<{ isCorrect: boolean; text: string } | null>(null);

  // Visualization View Mode: 'bars' | 'braid' | 'orbit' | 'split'
  const [visView, setVisView] = useState<'bars' | 'braid' | 'orbit' | 'split'>('bars');
  const [braidActiveCodeLine, setBraidActiveCodeLine] = useState<number | null>(null);

  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Compute Braid Trace dynamically
  const isSortingLab = activeTab === 'bubble-sort' || activeTab === 'selection-sort' || activeTab === 'insertion-sort';
  const braidTrace: BraidTrace | null = isSortingLab
    ? generateBraidTrace(activeTab as any, currentArray)
    : null;

  // Generate steps whenever array or sorting algorithm changes
  useEffect(() => {
    let generated: SortStep[] = [];
    if (activeTab === 'bubble-sort') {
      generated = generateBubbleSortSteps(currentArray);
    } else if (activeTab === 'selection-sort') {
      generated = generateSelectionSortSteps(currentArray);
    } else if (activeTab === 'insertion-sort') {
      generated = generateInsertionSortSteps(currentArray);
    }
    setSteps(generated);
    setStepIndex(0);
    setIsPlaying(false);
    setPredictFeedback(null);
  }, [currentArray, activeTab]);

  const currentStep = steps[stepIndex] || {
    type: 'compare',
    array: currentArray,
    indices: [],
    pass: 0,
    comparison: 0,
    pseudocodeLine: 0,
    description: 'Ready to observe algorithm execution.',
    swapped: false,
    sortedIndices: [],
  };

  // Sync mentor session context
  useEffect(() => {
    onRequestMentorContext({
      mode: 'visual',
      topic: activeTab,
      array: currentStep.array,
      indices: currentStep.indices,
      pass: currentStep.pass,
      comparison: currentStep.comparison,
      stepType: currentStep.type,
      description: currentStep.description,
    });
  }, [stepIndex, steps, activeTab]);

  // Audio trigger on step change
  useEffect(() => {
    if (!currentStep) return;
    if (currentStep.type === 'compare') {
      sound.playCompare(currentStep.indices.length ? currentStep.array[currentStep.indices[0]] : 0);
    } else if (currentStep.type === 'swap' || currentStep.type === 'insert') {
      sound.playSwap();
    } else if (currentStep.type === 'pass_complete' || currentStep.type === 'sorted') {
      sound.playSuccess();
    }
  }, [stepIndex]);

  // Handle auto-play loop
  useEffect(() => {
    if (isPlaying) {
      if (stepIndex >= steps.length - 1) {
        setIsPlaying(false);
        onUpdateProfile({
          completedAtLeastOnePass: true,
          xp: profile.xp + 25,
        });
        return;
      }

      if (isPredictMode && currentStep.type === 'compare' && currentStep.indices.length === 2 && !predictFeedback) {
        setIsPlaying(false);
        return;
      }

      const baseDelay = 1000 / speedMultiplier;
      playTimerRef.current = setTimeout(() => {
        setStepIndex(prev => prev + 1);
        setPredictFeedback(null);
      }, baseDelay);
    }

    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, stepIndex, steps.length, speedMultiplier, isPredictMode, predictFeedback]);

  const handleNextStep = () => {
    if (stepIndex < steps.length - 1) {
      setStepIndex(prev => prev + 1);
      setPredictFeedback(null);
    }
  };

  const handlePrevStep = () => {
    if (stepIndex > 0) {
      setStepIndex(prev => prev - 1);
      setPredictFeedback(null);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setIsPlaying(false);
    setStepIndex(0);
    setPredictFeedback(null);
  };

  const handleGenerateRandom = () => {
    sound.playClick();
    const count = 7;
    const randoms = Array.from({ length: count }, () => Math.floor(Math.random() * 85) + 10);
    setCurrentArray(randoms);
    setCustomInput(randoms.join(', '));
    setCustomError(null);
  };

  const handleApplyPreset = (arr: number[]) => {
    sound.playClick();
    setCurrentArray(arr);
    setCustomInput(arr.join(', '));
    setCustomError(null);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = customInput
        .split(',')
        .map(v => v.trim())
        .filter(v => v.length > 0)
        .map(v => {
          const num = Number(v);
          if (isNaN(num)) throw new Error(`Invalid value '${v}'`);
          return num;
        });

      if (parsed.length < 2) {
        setCustomError('Enter at least 2 numbers separated by commas.');
        return;
      }
      if (parsed.length > 12) {
        setCustomError('Maximum 12 numbers for optimal clarity.');
        return;
      }
      setCurrentArray(parsed);
      setCustomError(null);
    } catch {
      setCustomError('Please enter valid numbers separated by commas.');
    }
  };

  // Prediction Challenge Handlers
  const handlePredictChoice = (userSaysSwap: boolean) => {
    if (currentStep.indices.length < 2) return;
    const leftIdx = currentStep.indices[0];
    const rightIdx = currentStep.indices[1];
    if (leftIdx === undefined || rightIdx === undefined) return;

    const leftVal = currentStep.array[leftIdx];
    const rightVal = currentStep.array[rightIdx];
    const shouldSwap = leftVal > rightVal;
    const isCorrect = userSaysSwap === shouldSwap;

    if (isCorrect) {
      sound.playSuccess();
      const nextStreak = profile.predictionStreak + 1;
      onUpdateProfile({
        predictionStreak: nextStreak,
        bestStreak: Math.max(profile.bestStreak, nextStreak),
        xp: profile.xp + 10,
      });
      setPredictFeedback({
        isCorrect: true,
        text: `Accurate: ${leftVal} ${shouldSwap ? '>' : '<='} ${rightVal}. Streak: ${nextStreak} (+10 XP)`,
      });
    } else {
      sound.playError();
      onUpdateProfile({
        predictionStreak: 0,
        mistakes: [...profile.mistakes, `Comparison error: ${leftVal} vs ${rightVal}`],
      });
      setPredictFeedback({
        isCorrect: false,
        text: `Incorrect: ${leftVal} is ${shouldSwap ? 'greater than' : 'not greater than'} ${rightVal}.`,
      });
    }
  };

  const pseudocode = PSEUDOCODE_DEFINITIONS[profile.language] || PSEUDOCODE_DEFINITIONS.python;
  const getMappedStepType = (type: string): 'outer_loop' | 'inner_loop' | 'compare' | 'swap' | 'early_exit' | 'done' => {
    if (type === 'swap' || type === 'insert') return 'swap';
    if (type === 'pass_complete') return 'early_exit';
    if (type === 'sorted') return 'done';
    if (type === 'select_min') return 'inner_loop';
    return 'compare';
  };
  const activeCodeLine =
    visView === 'braid' && braidActiveCodeLine !== null
      ? braidActiveCodeLine
      : getLanguageLineIndex(profile.language, getMappedStepType(currentStep.type));

  return (
    <div className="space-y-6 lift-up">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--muted-foreground)] uppercase tracking-wider">
            <span>EXPERIMENTAL WORKBENCH</span>
            <span>·</span>
            <span>ALGORITHM ATELIER</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            Visual Lab: <span className="font-serif-italic text-[var(--primary)]">Stepping</span> &amp; State Inspection
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-2xl mt-1">
            Observe pointer mechanics, memory registers, loop boundaries, and comparative invariants step by step.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-xs">
            PASS: {currentStep.pass || 1}
          </Badge>
          <Badge variant="secondary" className="font-mono text-xs">
            STEP: {stepIndex + 1}/{steps.length || 1}
          </Badge>
        </div>
      </div>

      {/* Lab Mode Tabs (Sorting + Foundation Labs) */}
      <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-2 text-xs font-mono">
        {[
          { id: 'bubble-sort' as LabTab, label: 'Bubble Sort', icon: ArrowUpDown },
          { id: 'selection-sort' as LabTab, label: 'Selection Sort', icon: ArrowUpDown },
          { id: 'insertion-sort' as LabTab, label: 'Insertion Sort', icon: ArrowUpDown },
          { id: 'loops' as LabTab, label: 'Loop Lab', icon: Repeat },
          { id: 'arrays-1d' as LabTab, label: 'Array Lab (1D)', icon: ListFilter },
          { id: 'arrays-2d' as LabTab, label: 'Matrix Lab (2D)', icon: Grid },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                sound.playClick();
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-[8px] border transition-colors whitespace-nowrap shrink-0 ${
                isActive
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] font-bold'
                  : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Render Embedded Foundation Labs if Selected */}
      {activeTab === 'loops' && (
        <LoopLab onAwardXp={(xp) => onUpdateProfile({ xp: profile.xp + xp })} />
      )}

      {activeTab === 'arrays-1d' && (
        <ArrayLab onAwardXp={(xp) => onUpdateProfile({ xp: profile.xp + xp })} />
      )}

      {activeTab === 'arrays-2d' && (
        <MatrixLab onAwardXp={(xp) => onUpdateProfile({ xp: profile.xp + xp })} />
      )}

      {/* Render Sorting Visualizer if a Sorting Algorithm is Selected */}
      {(activeTab === 'bubble-sort' || activeTab === 'selection-sort' || activeTab === 'insertion-sort') && (
        <>
          {/* Preset Array Selectors & Visualization Mode Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            {/* Presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[var(--muted-foreground)] mr-1">Dataset:</span>
              {PRESET_ARRAYS.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset.array)}
                  className="px-2.5 py-1 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)] hover:border-[var(--primary)] transition-colors"
                >
                  {preset.name}
                </button>
              ))}
              <Button
                onClick={handleGenerateRandom}
                variant="outline"
                size="sm"
                className="gap-1 font-mono text-xs"
              >
                <Dices className="h-3.5 w-3.5" />
                <span>Generate Random</span>
              </Button>
            </div>

            {/* View Switcher: Bars | Braid | Orbit | Split */}
            <div className="flex items-center rounded-[8px] border border-[var(--border)] bg-[var(--card)] p-0.5 shrink-0 self-start sm:self-auto">
              <button
                onClick={() => {
                  sound.playClick();
                  setVisView('bars');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors ${
                  visView === 'bars'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-bold shadow-xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <BarChart3 className="h-3.5 w-3.5" />
                <span>{t.braid.tabBars}</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setVisView('braid');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors ${
                  visView === 'braid'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-bold shadow-xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <GitCommit className="h-3.5 w-3.5" />
                <span>{t.braid.tabBraid}</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setVisView('orbit');
                }}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors ${
                  visView === 'orbit'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-bold shadow-xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <CircleDot className="h-3.5 w-3.5" />
                <span>{t.braid.tabOrbit || 'Orbit'}</span>
              </button>
              <button
                onClick={() => {
                  sound.playClick();
                  setVisView('split');
                }}
                className={`hidden xl:flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] transition-colors ${
                  visView === 'split'
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-bold shadow-xs'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                <Columns className="h-3.5 w-3.5" />
                <span>{t.braid.tabSplit}</span>
              </button>
            </div>
          </div>

          {/* Workbench Grid Layout: Visual Canvas (8 cols) & Pseudocode Panel (4 cols) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Visual Array Canvas (8 cols) */}
            <div className="lg:col-span-8 space-y-4">
              {/* 1. Sort Orbit Circular Visualizer */}
              {visView === 'orbit' && (
                <SortOrbitVisualizer
                  currentStep={currentStep}
                  steps={steps}
                  stepIndex={stepIndex}
                  totalSteps={steps.length}
                  isPlaying={isPlaying}
                  speedMultiplier={speedMultiplier}
                  isPredictMode={isPredictMode}
                  predictFeedback={predictFeedback}
                  algorithm={activeTab as any}
                  onNextStep={handleNextStep}
                  onPrevStep={handlePrevStep}
                  onReset={handleReset}
                  onTogglePlay={() => setIsPlaying(!isPlaying)}
                  onSetStepIndex={(idx) => {
                    setStepIndex(idx);
                    setPredictFeedback(null);
                  }}
                  onSetSpeedMultiplier={(s) => setSpeedMultiplier(s)}
                  onTogglePredictMode={() => {
                    sound.playClick();
                    setIsPredictMode(!isPredictMode);
                    setPredictFeedback(null);
                  }}
                  onPredictChoice={handlePredictChoice}
                  onAwardXp={(xp) => onUpdateProfile({ xp: profile.xp + xp })}
                  onRecordMistake={(mistake) =>
                    onUpdateProfile({ mistakes: [...profile.mistakes, mistake] })
                  }
                />
              )}

              {/* 2. Sort Braid Trajectory Graph (when active or in split view) */}
              {(visView === 'braid' || visView === 'split') && braidTrace && (
                <div className="space-y-2">
                  <SortBraidVisualizer
                    trace={braidTrace}
                    onAwardXp={(xp) => onUpdateProfile({ xp: profile.xp + xp })}
                    onRecordMistake={(mistake) =>
                      onUpdateProfile({ mistakes: [...profile.mistakes, mistake] })
                    }
                    onActivePassChange={(passNum, codeLine) => {
                      setBraidActiveCodeLine(codeLine);
                    }}
                  />
                </div>
              )}

              {/* 3. Classic Bar Visualizer (when active or in split view) */}
              {(visView === 'bars' || visView === 'split') && (
                <Card className="p-6 bg-[var(--card)] flex flex-col justify-between min-h-[460px] relative overflow-hidden">
                  {/* Visualizer Status Bar */}
                  <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                        {activeTab.replace('-', ' ').toUpperCase()} STATE
                      </span>
                      <span className="text-xs font-mono text-[var(--muted-foreground)]">·</span>
                      <span className="text-xs font-mono text-[var(--primary)] font-bold">
                        {currentStep.type === 'compare' && 'Comparing'}
                        {currentStep.type === 'swap' && 'Swapping In-Place'}
                        {currentStep.type === 'no_swap' && 'In Order (No Swap)'}
                        {currentStep.type === 'insert' && 'Shifting Key Rightward'}
                        {currentStep.type === 'select_min' && 'New Minimum Tracked'}
                        {currentStep.type === 'pass_complete' && 'Pass Complete'}
                        {currentStep.type === 'sorted' && 'Array Fully Sorted'}
                      </span>
                    </div>

                    <div className="text-xs font-mono text-[var(--muted-foreground)]">
                      Pass {currentStep.pass || 1}
                    </div>
                  </div>

                  {/* Bars & Array Elements Visualizer */}
                  <div className="flex-1 flex items-end justify-center gap-2 sm:gap-3 py-8 px-2 overflow-x-auto min-h-[220px]">
                    {currentStep.array.map((val, idx) => {
                      const isCompared = (currentStep.indices as number[]).includes(idx);
                      const isSorted = currentStep.sortedIndices.includes(idx);
                      const maxVal = Math.max(...currentStep.array, 90);
                      const heightPercent = Math.max(20, Math.round((Math.abs(val) / maxVal) * 160));

                      return (
                        <div key={idx} className="flex flex-col items-center gap-1.5 shrink-0">
                          {/* Comparison Indicator Pointer */}
                          <div className="h-5 flex items-center justify-center font-mono text-xs font-bold text-[var(--primary)]">
                            {isCompared && (
                              <span className="animate-bounce">
                                {currentStep.type === 'swap' ? '⇄' : '↓'}
                              </span>
                            )}
                          </div>

                          {/* Value Bar Box */}
                          <div
                            style={{ height: `${heightPercent}px` }}
                            className={`w-11 sm:w-14 rounded-[8px] flex flex-col items-center justify-end pb-2 font-mono transition-all duration-200 border ${
                              isCompared
                                ? currentStep.type === 'swap'
                                  ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]'
                                  : 'border-[var(--accent)] bg-[var(--accent)]/20 text-[var(--foreground)]'
                                : isSorted
                                ? 'border-[#3B7A57] bg-[#3B7A57]/20 text-[var(--foreground)]'
                                : 'border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]'
                            }`}
                          >
                            <span className="text-sm font-bold tabular-nums">{val}</span>
                          </div>

                          {/* Array Index */}
                          <span className="font-mono text-[10px] text-[var(--muted-foreground)]">
                            [{idx}]
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Socratic Predict-the-Next-Step Overlay */}
                  {isPredictMode && currentStep.type === 'compare' && currentStep.indices.length === 2 && (
                    <div className="mb-4 p-4 rounded-[8px] bg-[var(--background)] border border-[var(--primary)] lift-up">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs font-mono text-[var(--primary)] font-bold uppercase tracking-wider">
                          <Sparkles className="h-3.5 w-3.5" />
                          <span>Predictive Evaluation: Will these elements swap?</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          onClick={() => handlePredictChoice(true)}
                          size="sm"
                          variant="default"
                          className="font-mono"
                        >
                          YES, SWAP ⇄
                        </Button>
                        <Button
                          onClick={() => handlePredictChoice(false)}
                          size="sm"
                          variant="secondary"
                          className="font-mono"
                        >
                          NO, KEEP IN PLACE ✓
                        </Button>
                        {predictFeedback && (
                          <span
                            className={`text-xs font-mono ml-2 ${
                              predictFeedback.isCorrect ? 'text-[var(--primary)] font-bold' : 'text-[var(--destructive)]'
                            }`}
                          >
                            {predictFeedback.text}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Playback Controls Footer */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
                    {/* Stepper Buttons */}
                    <div className="flex items-center gap-1.5">
                      <Button
                        onClick={handleReset}
                        variant="outline"
                        size="icon"
                        title={t.actions.reset}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        onClick={handlePrevStep}
                        disabled={stepIndex === 0}
                        variant="outline"
                        size="icon"
                        title={t.actions.prev}
                      >
                        <SkipBack className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        onClick={() => setIsPlaying(!isPlaying)}
                        variant="default"
                        size="sm"
                        className="gap-1.5 font-mono text-xs"
                      >
                        {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                        <span>{isPlaying ? t.actions.pause : t.actions.play}</span>
                      </Button>
                      <Button
                        onClick={handleNextStep}
                        disabled={stepIndex >= steps.length - 1}
                        variant="outline"
                        size="icon"
                        title={t.actions.next}
                      >
                        <SkipForward className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Speed Multiplier */}
                    <div className="flex items-center gap-1 text-xs font-mono text-[var(--muted-foreground)]">
                      <span>Speed:</span>
                      {[0.5, 1, 2, 4].map((s) => (
                        <button
                          key={s}
                          onClick={() => setSpeedMultiplier(s)}
                          className={`px-2 py-0.5 rounded-[8px] border transition-colors ${
                            speedMultiplier === s
                              ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] font-bold'
                              : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--background)]'
                          }`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>

                    {/* Predict Mode Toggle */}
                    <Button
                      onClick={() => {
                        sound.playClick();
                        setIsPredictMode(!isPredictMode);
                        setPredictFeedback(null);
                      }}
                      variant={isPredictMode ? 'secondary' : 'outline'}
                      size="sm"
                      className="gap-1.5"
                    >
                      <Sparkles className="h-3 w-3 text-[var(--primary)]" />
                      <span>Predict Mode: <strong className={isPredictMode ? 'text-[var(--primary)]' : ''}>{isPredictMode ? 'ON' : 'OFF'}</strong></span>
                    </Button>
                  </div>

                  {/* Timeline Progress Slider */}
                  <div className="mt-3">
                    <input
                      type="range"
                      min="0"
                      max={Math.max(steps.length - 1, 0)}
                      value={stepIndex}
                      onChange={(e) => {
                        setStepIndex(Number(e.target.value));
                        setPredictFeedback(null);
                      }}
                      className="w-full accent-[var(--primary)] bg-[var(--muted)] h-1 rounded cursor-pointer"
                    />
                  </div>

                  {/* Figure Caption for Bars View */}
                  <div className="text-[11px] font-mono text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)] mt-2">
                    FIG. 02 · {activeTab.replace('-', ' ')}, pass {currentStep.pass || 1} execution and invariant tracking
                  </div>
                </Card>
              )}
            </div>

            {/* Right: Pseudocode & Custom Array Form (4 cols) */}
            <div className="lg:col-span-4 space-y-4">
              <Card className="p-5 bg-[var(--card)] flex flex-col justify-between min-h-[460px]">
                <div>
                  <div className="border-b border-[var(--border)] pb-2.5 mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Layers className="h-3.5 w-3.5 text-[var(--primary)]" />
                      <span className="text-xs font-mono font-bold text-[var(--foreground)] uppercase tracking-[0.08em]">
                        Trace Execution
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase">
                      {profile.language}
                    </span>
                  </div>

                  {/* Synchronized Code lines */}
                  <div className="font-mono text-xs rounded-[8px] border border-[var(--border)] bg-[var(--background)] p-3 space-y-0.5 overflow-x-auto max-h-[280px]">
                    {pseudocode.lines.map((line, idx) => {
                      const isLineActive = idx === activeCodeLine;
                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-2 px-1.5 py-0.5 rounded-[8px] transition-colors ${
                            isLineActive
                              ? 'bg-[var(--primary)]/15 text-[var(--primary)] font-semibold border-l-2 border-[var(--primary)]'
                              : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                          }`}
                        >
                          <span className="w-4 text-[10px] text-[var(--muted-foreground)] select-none shrink-0 tabular-nums">
                            {idx + 1}
                          </span>
                          <span className="whitespace-pre">{line}</span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Step Analysis Box */}
                  <div className="mt-3 p-3 rounded-[8px] border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] leading-relaxed">
                    <div className="text-[10px] uppercase tracking-wide text-[var(--muted-foreground)] mb-1">
                      Active Invariant Note:
                    </div>
                    <p>{currentStep.description}</p>
                  </div>
                </div>

                {/* Custom Array Input */}
                <div className="pt-3 border-t border-[var(--border)]">
                  <span className="text-xs font-mono text-[var(--muted-foreground)] block mb-1.5">
                    Load Custom Array:
                  </span>
                  <form onSubmit={handleCustomSubmit} className="space-y-1.5">
                    <div className="flex gap-1.5">
                      <input
                        type="text"
                        value={customInput}
                        onChange={(e) => setCustomInput(e.target.value)}
                        placeholder="e.g. 5, 2, 8, 1, 9"
                        className="flex-1 rounded-[8px] border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-[var(--primary)]"
                      />
                      <Button type="submit" variant="secondary" size="sm">
                        Load ↗
                      </Button>
                    </div>
                    {customError && (
                      <span className="text-[10px] font-mono text-[var(--destructive)] block">
                        {customError}
                      </span>
                    )}
                  </form>
                </div>
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
