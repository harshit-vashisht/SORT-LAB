import React, { useState, useEffect } from 'react';
import { StudentProfile, ExperienceLevel, ProgrammingLanguage, LearningPace, WorkspaceMode } from '../types';
import { SupportedLocale, TRANSLATIONS } from '../lib/i18n';
import { sound } from '../lib/soundEngine';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Sparkles, Terminal, ShieldAlert } from 'lucide-react';

interface MentorOnboardingProps {
  profile: StudentProfile;
  onUpdateProfile: (updates: Partial<StudentProfile>) => void;
  onStartWorkspace: (mode: WorkspaceMode) => void;
  locale: SupportedLocale;
  onSelectLocale?: (locale: SupportedLocale) => void;
}

export const MentorOnboarding: React.FC<MentorOnboardingProps> = ({
  profile,
  onUpdateProfile,
  onStartWorkspace,
  locale,
  onSelectLocale,
}) => {
  const t = TRANSLATIONS[locale];

  // Right-side live mini sorting preview state
  const [previewArray, setPreviewArray] = useState<number[]>([42, 18, 77, 33, 91, 55]);
  const [comparingIdx, setComparingIdx] = useState<[number, number] | null>([0, 1]);
  const [passCount, setPassCount] = useState(1);

  // Quiet autonomous sorting loop
  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      setPreviewArray(prev => {
        const next = [...prev];
        const idx = step % (next.length - 1);
        setComparingIdx([idx, idx + 1]);
        if (next[idx] > next[idx + 1]) {
          const temp = next[idx];
          next[idx] = next[idx + 1];
          next[idx + 1] = temp;
          sound.playCompare(next[idx]);
        }
        step++;
        if (step % (next.length - 1) === 0) {
          setPassCount(p => (p % 4) + 1);
        }
        return next;
      });
    }, 1400);

    return () => clearInterval(interval);
  }, []);

  const handleSelectLevel = (level: ExperienceLevel) => {
    sound.playClick();
    onUpdateProfile({ experience: level });
  };

  const handleSelectLang = (lang: ProgrammingLanguage) => {
    sound.playClick();
    onUpdateProfile({ language: lang });
  };

  const handleSelectPace = (pace: LearningPace) => {
    sound.playClick();
    onUpdateProfile({ pace });
  };

  const handleLocaleChange = (newLoc: SupportedLocale) => {
    sound.playClick();
    if (onSelectLocale) {
      onSelectLocale(newLoc);
    }
  };

  // Detailed mentor adaptation data for the 3 levels
  const LEVEL_ADAPTATIONS: Record<
    ExperienceLevel,
    {
      title: string;
      tag: string;
      ruleDesc: string;
      simulatedPrompt: string;
      mentorQuote: string;
      adaptationNotes: string;
      icon: typeof Sparkles;
    }
  > = {
    beginner: {
      title: 'Beginner',
      tag: 'Step-by-step hints',
      ruleDesc: 'Scaffolded adjacent comparisons and tactile walkthroughs before any mutation occurs.',
      simulatedPrompt: 'Comparing indices [0] and [1] with values 42 and 18...',
      mentorQuote:
        '“Look closely at values 42 and 18. Since 42 > 18, why must they swap places to move the larger value toward the right boundary?”',
      adaptationNotes: 'High guidance · Micro-step inquiry · Zero code penalization',
      icon: Sparkles,
    },
    intermediate: {
      title: 'Intermediate',
      tag: 'Predict-then-verify',
      ruleDesc: 'Probes asking you to predict adjacent outcomes before machine execution, validating loop bounds.',
      simulatedPrompt: 'Observing sub-array pass 2: arr[2]=77, arr[3]=33...',
      mentorQuote:
        '“Before executing the swap step: forecast whether 77 > 33 triggers an inversion, and what invariant holds for the rightmost element after this pass.”',
      adaptationNotes: 'Predictive probes · Invariant verification · Medium hint ladder',
      icon: Terminal,
    },
    experienced: {
      title: 'Experienced',
      tag: 'Edge cases',
      ruleDesc: 'Targeted stress tests on inverted sequences, early-exit flags, and formal O(n) best-case proofs.',
      simulatedPrompt: 'Analyzing fully pre-sorted input array [10, 20, 30, 40]...',
      mentorQuote:
        '“If an entire pass completes with zero swaps performed, what theorem can you assert about the remaining elements, and how does a swapped boolean flag achieve linear time?”',
      adaptationNotes: 'Edge-case focus · Early exit optimization · Minimal hint safety net',
      icon: ShieldAlert,
    },
  };

  const currentAdaptation = LEVEL_ADAPTATIONS[profile.experience];

  return (
    <div className="py-6 sm:py-10 max-w-[1200px] mx-auto space-y-8">
      {/* Above-the-fold Language Switcher & Editorial Kicker */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-2 text-[11px] font-mono tracking-[0.08em] uppercase text-[var(--muted-foreground)]">
          <span className="font-bold text-[var(--foreground)]">SORT//LAB</span>
          <span>·</span>
          <span>Adaptive Algorithmic Intake</span>
        </div>

        {/* Language switcher above the fold */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
            Locale:
          </span>
          <div className="flex items-center gap-1 p-0.5 rounded-[8px] border border-[var(--border)] bg-[var(--card)]">
            {[
              { id: 'en' as SupportedLocale, label: 'English' },
              { id: 'hi' as SupportedLocale, label: 'हिन्दी' },
              { id: 'pa' as SupportedLocale, label: 'ਪੰਜਾਬੀ' },
            ].map(l => (
              <button
                key={l.id}
                onClick={() => handleLocaleChange(l.id)}
                className={`px-2.5 py-1 text-xs font-mono rounded-[8px] transition-colors ${
                  locale === l.id
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Split Layout: Left Intake Controls + Right Live Looping Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Editorial Headline & Selectable Cards (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-[42px] font-sans font-bold tracking-tight text-[var(--foreground)] leading-[1.15]">
              Learn it. See it.{' '}
              <span className="font-serif italic font-normal text-[var(--primary)] text-4xl sm:text-5xl">
                Break it.
              </span>{' '}
              Build it.
            </h1>
            <p className="mt-2.5 text-sm text-[var(--muted-foreground)] max-w-[65ch] leading-relaxed">
              An experimental algorithmic laboratory pairing Socratic dialogue with real-time invariant inspection.
            </p>
          </div>

          {/* Three Level Cards with Radio State and Mentor Adaptation Preview */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                Select Diagnostic Tier:
              </span>
              <span className="text-[11px] font-mono text-[var(--primary)]">
                Adapts Mentor Dialogue
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {(['beginner', 'intermediate', 'experienced'] as ExperienceLevel[]).map(lvlKey => {
                const item = LEVEL_ADAPTATIONS[lvlKey];
                const isSelected = profile.experience === lvlKey;
                return (
                  <div
                    key={lvlKey}
                    onClick={() => handleSelectLevel(lvlKey)}
                    className={`cursor-pointer rounded-[10px] p-3.5 border transition-all flex flex-col justify-between ${
                      isSelected
                        ? 'border-2 border-[var(--primary)] bg-[var(--card)]'
                        : 'border-[var(--border)] bg-[var(--card)]/60 hover:bg-[var(--card)] hover:border-[var(--muted-foreground)]/50'
                    }`}
                  >
                    <div>
                      {/* Visible Radio indicator + Tag */}
                      <div className="flex items-center justify-between mb-2.5">
                        <div
                          className={`h-4 w-4 rounded-full border flex items-center justify-center transition-colors ${
                            isSelected
                              ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]'
                              : 'border-[var(--border)] bg-transparent'
                          }`}
                        >
                          {isSelected && (
                            <div className="h-1.5 w-1.5 rounded-full bg-[var(--primary-foreground)]" />
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase">
                          Tier {lvlKey === 'beginner' ? '01' : lvlKey === 'intermediate' ? '02' : '03'}
                        </span>
                      </div>

                      <div className="text-xs font-mono font-bold text-[var(--foreground)]">
                        {item.title}
                      </div>

                      <div className="text-[10px] font-mono text-[var(--primary)] font-semibold mt-0.5">
                        {item.tag}
                      </div>

                      <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed mt-1.5">
                        {item.ruleDesc}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live Preview of How the Mentor Will Adapt */}
            <div className="rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-4 space-y-2.5">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                <div className="flex items-center gap-2">
                  <currentAdaptation.icon className="h-3.5 w-3.5 text-[var(--primary)]" />
                  <span className="text-xs font-mono font-bold text-[var(--foreground)] uppercase tracking-wide">
                    Live Mentor Adaptation Preview · {currentAdaptation.title}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                  Mode: {currentAdaptation.tag}
                </span>
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-mono text-[var(--muted-foreground)] uppercase tracking-wide">
                  Context: {currentAdaptation.simulatedPrompt}
                </div>
                <div className="p-3 rounded-[8px] border border-[var(--border)] bg-[var(--background)] text-xs font-mono text-[var(--foreground)] leading-relaxed italic">
                  {currentAdaptation.mentorQuote}
                </div>
                <div className="flex items-center justify-between text-[10px] font-mono text-[var(--muted-foreground)] pt-1">
                  <span>Policy: {currentAdaptation.adaptationNotes}</span>
                  <span className="text-[var(--primary)]">Dynamic Socratic Framing</span>
                </div>
              </div>
            </div>
          </div>

          {/* Target Language & Learning Pace Pickers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <span className="text-xs font-mono uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                {t.intake.languagePrompt}
              </span>
              <div className="flex items-center gap-1 p-0.5 rounded-[8px] border border-[var(--border)] bg-[var(--card)]">
                {[
                  { id: 'python' as ProgrammingLanguage, label: 'Python' },
                  { id: 'javascript' as ProgrammingLanguage, label: 'JavaScript' },
                  { id: 'java' as ProgrammingLanguage, label: 'Java' },
                  { id: 'cpp' as ProgrammingLanguage, label: 'C++' },
                ].map(l => (
                  <button
                    key={l.id}
                    onClick={() => handleSelectLang(l.id)}
                    className={`flex-1 py-1 text-xs font-mono rounded-[8px] transition-colors ${
                      profile.language === l.id
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {l.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                {t.intake.pacePrompt}
              </span>
              <div className="flex items-center gap-1 p-0.5 rounded-[8px] border border-[var(--border)] bg-[var(--card)]">
                {[
                  { id: 'relaxed' as LearningPace, label: 'Relaxed' },
                  { id: 'standard' as LearningPace, label: 'Standard' },
                  { id: 'challenge' as LearningPace, label: 'Challenge' },
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectPace(p.id)}
                    className={`flex-1 py-1 text-xs font-mono rounded-[8px] transition-colors ${
                      profile.pace === p.id
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold'
                        : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* One Primary Button: Start diagnostic ↗ */}
          <div className="pt-2">
            <Button
              onClick={() => {
                sound.playClick();
                onStartWorkspace('visual');
              }}
              variant="default"
              size="lg"
              className="w-full sm:w-auto px-8"
            >
              Start diagnostic ↗
            </Button>
          </div>
        </div>

        {/* Right Column: Looping Mini Bubble-Sort Visualization (5 cols) */}
        <div className="lg:col-span-5 space-y-2">
          <Card className="p-6 bg-[var(--card)] flex flex-col justify-between min-h-[380px]">
            {/* Header Telemetry */}
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 text-xs font-mono">
              <div className="flex items-center gap-2 text-[var(--muted-foreground)]">
                <span className="font-mono text-[10px] text-[var(--primary)]">●</span>
                <span>STATE MONITOR</span>
              </div>
              <div className="text-[var(--muted-foreground)]">
                PASS: <strong className="tabular-nums text-[var(--foreground)]">{passCount}</strong>
              </div>
            </div>

            {/* Looping Mini Sorting Visualization */}
            <div className="flex items-end justify-center gap-2 sm:gap-3 h-48 py-4">
              {previewArray.map((val, idx) => {
                const isComparing =
                  comparingIdx && (comparingIdx[0] === idx || comparingIdx[1] === idx);
                const heightPx = Math.max(36, val * 1.8);
                return (
                  <div key={idx} className="flex flex-col items-center justify-end">
                    <span
                      className={`text-[10px] font-mono tabular-nums mb-1 transition-colors ${
                        isComparing
                          ? 'text-[var(--primary)] font-bold'
                          : 'text-[var(--muted-foreground)]'
                      }`}
                    >
                      {val}
                    </span>
                    <div
                      style={{ height: `${heightPx}px` }}
                      className={`w-9 sm:w-11 rounded-[8px] border transition-colors flex flex-col justify-end items-center p-1 ${
                        isComparing
                          ? 'border-[var(--primary)] bg-[var(--primary)]/15'
                          : 'border-[var(--border)] bg-[var(--muted)]/50'
                      }`}
                    >
                      <span className="text-[9px] font-mono text-[var(--muted-foreground)]">
                        #{idx}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Live State Legend */}
            <div className="border-t border-[var(--border)] pt-3 flex items-center justify-between text-[11px] font-mono text-[var(--muted-foreground)]">
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-[2px] border border-[var(--primary)] bg-[var(--primary)]/20" />
                <span>Comparing Adjacent</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-[2px] border border-[var(--border)] bg-[var(--muted)]/50" />
                <span>Resting Buffer</span>
              </div>
            </div>
          </Card>

          {/* Labeled: FIG. 01 · Bubble sort, live */}
          <div className="text-[11px] font-mono text-[var(--muted-foreground)] tracking-wide pl-1">
            FIG. 01 · Bubble sort, live
          </div>
        </div>
      </div>
    </div>
  );
};
