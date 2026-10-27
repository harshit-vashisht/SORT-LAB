import React, { useState, useEffect, useRef } from 'react';
import { StudentProfile, MentorMessage } from '../types';
import { SupportedLocale, TRANSLATIONS } from '../lib/i18n';
import { sound } from '../lib/soundEngine';
import {
  evaluateHonestMastery,
  downloadMarkdownSummary,
  triggerPrintablePortfolio,
  SessionEvidenceSummary,
} from '../lib/masteryEngine';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from './ui/Sheet';
import { Button } from './ui/Button';
import {
  Send,
  Sparkles,
  RotateCcw,
  PlusCircle,
  AlertCircle,
  RefreshCw,
  FileText,
  Printer,
  Award,
  Terminal,
  Cpu,
} from 'lucide-react';

interface MentorDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: StudentProfile;
  sessionContext: any;
  initialMessageToSend?: string | null;
  onClearInitialMessage?: () => void;
  locale: SupportedLocale;
}

export const MentorDrawer: React.FC<MentorDrawerProps> = ({
  isOpen,
  onClose,
  profile,
  sessionContext,
  initialMessageToSend,
  onClearInitialMessage,
  locale,
}) => {
  const t = TRANSLATIONS[locale];

  const getInitialGreeting = () => {
    const mode = sessionContext?.mode || 'visual';
    const lang = profile.language?.toUpperCase() || 'PYTHON';
    if (locale === 'hi') {
      return `नमस्ते! मैं आपका SORT//LAB AI मेंटर हूँ। मैं आपके वर्तमान कार्यक्षेत्र (${mode}, ${lang}) को देख रहा हूँ। शुरुआती संकल्पनाओं, लूप्स या बबल सॉर्ट के नियमों के बारे में मुझसे कोई भी सवाल पूछें!`;
    }
    if (locale === 'pa') {
      return `ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ! ਮੈਂ ਤੁਹਾਡਾ SORT//LAB AI ਮੈਂਟਰ ਹਾਂ। ਮੈਂ ਤੁਹਾਡੇ ਪ੍ਰਯੋਗਸ਼ਾਲਾ ਕਾਰਜ (${mode}, ${lang}) 'ਤੇ ਨਜ਼ਰ ਰੱਖ ਰਿਹਾ ਹਾਂ। ਐਲਗੋਰਿਦਮ ਬਾਰੇ ਕੋਈ ਵੀ ਸਵਾਲ ਪੁੱਛੋ!`;
    }
    return `Welcome to the Mentor Workbench. I'm observing your active laboratory state (workspace: ${mode}, language: ${lang}, level: ${profile.experience}). Ask me anything from absolute zero (loops & arrays) to algorithmic invariants, or select a hint from the 3-step indicator above.`;
  };

  const [messages, setMessages] = useState<MentorMessage[]>([
    {
      id: 'm-init',
      role: 'mentor',
      text: getInitialGreeting(),
      timestamp: Date.now(),
    },
  ]);

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastAttemptedPrompt, setLastAttemptedPrompt] = useState<{ text: string; why?: string } | null>(null);
  const [activeLadderLevel, setActiveLadderLevel] = useState<1 | 2 | 3 | null>(null);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [lastWhyThisHint, setLastWhyThisHint] = useState<string | null>(null);
  const [activeProvider, setActiveProvider] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Auto-scroll to bottom when messages update or drawer opens
  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, showEvaluation, isLoading]);

  // Handle external trigger message (e.g. from Visual Lab or Arena hints)
  useEffect(() => {
    if (initialMessageToSend && isOpen) {
      sendMessage(initialMessageToSend);
      if (onClearInitialMessage) onClearInitialMessage();
    }
  }, [initialMessageToSend, isOpen]);

  // Reset conversation to fresh state
  const handleStartNewChat = () => {
    sound.playClick();
    setMessages([
      {
        id: `m-init-${Date.now()}`,
        role: 'mentor',
        text: getInitialGreeting(),
        timestamp: Date.now(),
      },
    ]);
    setInputMessage('');
    setErrorMessage(null);
    setLastAttemptedPrompt(null);
    setActiveLadderLevel(null);
    setLastWhyThisHint(null);
  };

  const sendMessage = async (textToSend: string, whyNote?: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isLoading) return;

    sound.playClick();
    const userMsg: MentorMessage = {
      id: `u-${Date.now()}`,
      role: 'student',
      text: trimmed,
      timestamp: Date.now(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsLoading(true);
    setErrorMessage(null);
    setLastAttemptedPrompt({ text: trimmed, why: whyNote });
    if (whyNote) setLastWhyThisHint(whyNote);

    try {
      const res = await fetch('/api/mentor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: trimmed,
          locale: locale,
          sessionContext: {
            ...sessionContext,
            experience: profile.experience,
            language: profile.language,
            pace: profile.pace,
            xp: profile.xp,
            streak: profile.predictionStreak,
            hintsUsed: profile.hintsUsed,
            mistakes: profile.mistakes,
          },
          history: messages.slice(-8),
        }),
      });

      if (!res.ok) {
        throw new Error(`Server responded with status ${res.status}`);
      }

      const data = await res.json();
      const replyText =
        data.reply ||
        "In Bubble Sort, we repeatedly compare adjacent elements. If the left element is larger than the right element, swap them so the highest values bubble towards the end.";

      if (data.provider) {
        setActiveProvider(data.provider);
      }

      const mentorMsg: MentorMessage = {
        id: `m-${Date.now()}`,
        role: 'mentor',
        text: replyText,
        timestamp: Date.now(),
        isFallback: data.isFallback,
      };

      setMessages(prev => [...prev, mentorMsg]);
      sound.playSuccess();
    } catch (err: any) {
      console.error('AI Mentor chat error:', err);
      setErrorMessage(err?.message || 'Failed to reach AI Mentor. Please check connection and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryLastMessage = () => {
    if (lastAttemptedPrompt) {
      sendMessage(lastAttemptedPrompt.text, lastAttemptedPrompt.why);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputMessage);
    }
  };

  // 3-Step Hint Indicator Handlers
  const HINT_STEPS = [
    {
      level: 1 as const,
      label: 'Question',
      fullTitle: 'Step 1: Socratic Question',
      why: 'Why this hint: Socratic inquiry activates conceptual deduction without providing algorithmic code, preserving your reasoning XP.',
      prompt: 'Give me a Level 1 guiding question to help me reason through the current algorithmic invariant.',
    },
    {
      level: 2 as const,
      label: 'Concept',
      fullTitle: 'Step 2: Invariant Concept',
      why: 'Why this hint: Reinforces the sorting invariant (pass i places the i-th largest element at the right boundary) so you can deduce the fix independently.',
      prompt: 'Give me a Level 2 hint explaining the underlying algorithmic concept or invariant.',
    },
    {
      level: 3 as const,
      label: 'Bug Focus',
      fullTitle: 'Step 3: Location Focus',
      why: 'Why this hint: Pinpoints the specific loop boundary condition or swap index without exposing the exact solution code.',
      prompt: 'Give me a Level 3 hint pinpointing where my logic or boundary condition needs adjustment.',
    },
  ];

  const handleSelectHintStep = (level: 1 | 2 | 3) => {
    const stepConfig = HINT_STEPS.find(s => s.level === level);
    if (!stepConfig) return;

    setActiveLadderLevel(level);
    sendMessage(stepConfig.prompt, stepConfig.why);
  };

  const handleAskDifferentWay = () => {
    sound.playClick();
    sendMessage(
      'Can you explain that in a different way with a clearer real-world physical analogy or a simpler conceptual breakdown?',
      'Why this hint: Alternative analogies help reframe mental models when standard formal syntax causes hesitation.'
    );
  };

  // Honest mastery evaluation (never uses the word "mastered")
  const evaluation: SessionEvidenceSummary = evaluateHonestMastery(profile);

  return (
    <Sheet open={isOpen} onOpenChange={open => !open && onClose()}>
      <SheetContent onClose={onClose} className="flex flex-col h-full bg-[var(--card)] text-[var(--foreground)] border-l border-[var(--border)]">
        {/* Sheet Header */}
        <SheetHeader className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <div className="h-7 w-7 rounded-[8px] bg-gradient-to-tr from-teal-500/20 to-indigo-500/20 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-300">
              <Sparkles className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <SheetTitle className="text-sm font-mono font-bold tracking-tight">AI Mentor</SheetTitle>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[4px] bg-[var(--muted)] text-[var(--muted-foreground)] uppercase">
                  {profile.language}
                </span>
                {activeProvider === 'deepseek' && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[4px] bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center gap-1 font-semibold">
                    <Cpu className="h-2.5 w-2.5 text-blue-500" /> DeepSeek
                  </span>
                )}
                {activeProvider === 'openai' && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[4px] bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center gap-1">
                    <Cpu className="h-2.5 w-2.5" /> GPT
                  </span>
                )}
                {activeProvider === 'gemini' && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[4px] bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                    <Sparkles className="h-2.5 w-2.5" /> Gemini
                  </span>
                )}
                {activeProvider === 'local-heuristics' && (
                  <span className="text-[9px] font-mono px-1.5 py-0.5 rounded-[4px] bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center gap-1">
                    Atelier Tutor
                  </span>
                )}
              </div>
              <SheetDescription className="text-[11px] font-mono text-[var(--muted-foreground)]">
                {profile.experience.toUpperCase()} · Socratic Guidance · {locale.toUpperCase()}
              </SheetDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            {/* New Chat Button */}
            <Button
              onClick={handleStartNewChat}
              variant="ghost"
              size="sm"
              title="Start a fresh conversation"
              className="h-7 px-2 text-[11px] font-mono flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Chat</span>
            </Button>

            {/* Evaluation Toggle Button */}
            <button
              onClick={() => {
                sound.playClick();
                setShowEvaluation(!showEvaluation);
              }}
              className={`px-2 py-1 text-[11px] font-mono rounded-[6px] border transition-colors ${
                showEvaluation
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold'
                  : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {showEvaluation ? 'Chat' : 'Rubric'}
            </button>
            <SheetClose onClick={onClose} />
          </div>
        </SheetHeader>

        {/* 3-Step Hint Indicator Strip */}
        <div className="border-b border-[var(--border)] bg-[var(--background)] p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-[var(--muted-foreground)] flex items-center gap-1.5">
              <Terminal className="h-3 w-3 text-teal-500" /> 3-Step Hint Indicator:
            </span>
            <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
              Level 1 preserves max XP
            </span>
          </div>

          {/* Stepper Buttons */}
          <div className="grid grid-cols-3 gap-2">
            {HINT_STEPS.map(step => {
              const isActive = activeLadderLevel === step.level;
              return (
                <button
                  key={step.level}
                  onClick={() => handleSelectHintStep(step.level)}
                  className={`p-2 rounded-[8px] border text-left transition-all flex flex-col justify-between cursor-pointer ${
                    isActive
                      ? 'border-2 border-teal-500 bg-[var(--card)] font-semibold shadow-xs'
                      : 'border-[var(--border)] bg-[var(--card)]/70 hover:bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`h-4 w-4 rounded-full border text-[9px] font-mono flex items-center justify-center font-bold ${
                        isActive
                          ? 'border-teal-500 bg-teal-500 text-white'
                          : 'border-[var(--border)] text-[var(--muted-foreground)]'
                      }`}
                    >
                      {step.level}
                    </span>
                    <span className="text-[9px] font-mono uppercase text-[var(--muted-foreground)]">
                      L{step.level}
                    </span>
                  </div>
                  <span className="text-xs font-mono font-medium text-[var(--foreground)] mt-1 truncate">
                    {step.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Active Hint Step Detail with "Why this hint" */}
          {activeLadderLevel && (
            <div className="pt-1">
              {HINT_STEPS.filter(s => s.level === activeLadderLevel).map(s => (
                <div
                  key={s.level}
                  className="p-2 rounded-[8px] border border-teal-500/30 bg-teal-500/5 dark:bg-teal-950/20 space-y-1"
                >
                  <div className="text-[10px] font-mono font-semibold text-[var(--foreground)]">
                    {s.fullTitle}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--muted-foreground)] leading-relaxed">
                    {s.why}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area: Either Evaluation Card OR Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 font-mono text-xs">
          {showEvaluation ? (
            /* After Session Evaluation Card (Never uses the word "mastered") */
            <div className="space-y-4">
              <div className="p-4 rounded-[10px] border border-[var(--border)] bg-[var(--background)] space-y-3">
                <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5">
                  <div className="flex items-center gap-2">
                    <Award className="h-4 w-4 text-[var(--primary)]" />
                    <span className="text-xs font-mono font-bold text-[var(--foreground)] uppercase tracking-wide">
                      Session Evaluation Card
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                    {evaluation.portfolioDate}
                  </span>
                </div>

                {/* Status Label (Needs more evidence / Developing / Demonstrated) */}
                <div className="space-y-1">
                  <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                    Demonstration Status:
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`px-2.5 py-1 text-xs font-mono font-bold rounded-[8px] border ${
                        evaluation.overallStatus === 'Demonstrated'
                          ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--primary)]'
                          : evaluation.overallStatus === 'Developing'
                          ? 'border-[var(--warning)] bg-[var(--warning)]/15 text-[var(--warning)]'
                          : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]'
                      }`}
                    >
                      {evaluation.overallStatus}
                    </span>
                    <span className="text-[11px] font-mono text-[var(--muted-foreground)]">
                      (Strict Evidence Rubric)
                    </span>
                  </div>
                </div>

                {/* Confidence Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-[var(--muted-foreground)]">Observed Confidence:</span>
                    <span className="font-bold text-[var(--foreground)] tabular-nums">
                      {evaluation.confidencePercent}%
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-[var(--card)] border border-[var(--border)] overflow-hidden">
                    <div
                      style={{ width: `${evaluation.confidencePercent}%` }}
                      className="h-full bg-[var(--primary)] transition-all duration-500"
                    />
                  </div>
                </div>

                {/* Itemized Evidence List */}
                <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                  <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                    Demonstrated Evidence List:
                  </span>
                  <div className="space-y-2">
                    {evaluation.concepts.map(c => (
                      <div
                        key={c.conceptId}
                        className="p-2.5 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-xs space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[var(--foreground)]">{c.name}</span>
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.5 rounded-[8px] border ${
                              c.status === 'Demonstrated'
                                ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10'
                                : c.status === 'Developing'
                                ? 'border-[var(--warning)] text-[var(--warning)] bg-[var(--warning)]/10'
                                : 'border-[var(--border)] text-[var(--muted-foreground)]'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>
                        <ul className="space-y-0.5 text-[11px] text-[var(--muted-foreground)] pl-3 list-disc">
                          {c.evidencePoints.map((ep, i) => (
                            <li key={i}>{ep}</li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Export Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => downloadMarkdownSummary(profile, evaluation)}
                    variant="secondary"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-1.5"
                  >
                    <FileText className="h-3 w-3" />
                    <span>Download Report</span>
                  </Button>
                  <Button
                    onClick={() => triggerPrintablePortfolio()}
                    variant="outline"
                    size="sm"
                    className="flex-1 flex items-center justify-center gap-1.5"
                  >
                    <Printer className="h-3 w-3" />
                    <span>Print Card</span>
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            /* Message Thread */
            <>
              {messages.map((msg, index) => {
                const isMentor = msg.role === 'mentor';
                const isLatestMentor = isMentor && index === messages.length - 1;

                return (
                  <div
                    key={msg.id}
                    className={`flex items-start gap-2.5 ${isMentor ? '' : 'flex-row-reverse'}`}
                  >
                    <div
                      className={`flex h-6 w-6 items-center justify-center rounded-[6px] border shrink-0 text-[10px] font-mono font-bold ${
                        isMentor
                          ? 'border-teal-500/40 bg-teal-500/15 text-teal-600 dark:text-teal-300'
                          : 'border-[var(--border)] bg-[var(--primary)] text-[var(--primary-foreground)]'
                      }`}
                    >
                      {isMentor ? 'M' : 'S'}
                    </div>

                    <div
                      className={`max-w-[85%] rounded-[10px] p-3 text-xs leading-relaxed whitespace-pre-wrap ${
                        isMentor
                          ? 'border border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] shadow-xs'
                          : 'bg-[var(--primary)] text-[var(--primary-foreground)] font-medium shadow-xs'
                      }`}
                    >
                      <div>{msg.text}</div>

                      {/* "Why this hint" in small mono text on mentor messages */}
                      {isMentor && (
                        <div className="mt-2 pt-2 border-t border-[var(--border)] text-[10px] font-mono text-[var(--muted-foreground)]">
                          {lastWhyThisHint && isLatestMentor
                            ? lastWhyThisHint
                            : 'Why this hint: Prompts self-reflection on why adjacent elements must swap or stay in order.'}
                        </div>
                      )}

                      {/* "Ask a different way" ghost button on mentor messages */}
                      {isMentor && !isLoading && (
                        <div className="mt-2 pt-1 flex items-center justify-end">
                          <Button
                            onClick={handleAskDifferentWay}
                            variant="ghost"
                            size="sm"
                            className="h-6 px-2 text-[10px] font-mono flex items-center gap-1 hover:bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
                          >
                            <RotateCcw className="h-2.5 w-2.5" />
                            <span>Ask a different way</span>
                          </Button>
                        </div>
                      )}

                      {msg.isFallback && (
                        <div className="mt-1.5 text-[9px] text-[var(--muted-foreground)] pt-1 border-t border-[var(--border)] flex items-center gap-1">
                          <span>Offline Laboratory Heuristics</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Loading Indicator with Animated Spinner */}
              {isLoading && (
                <div className="flex items-start gap-2.5">
                  <div className="h-6 w-6 rounded-[6px] border border-teal-500/40 bg-teal-500/15 text-teal-500 flex items-center justify-center text-[10px]">
                    <Sparkles className="h-3 w-3 animate-spin" />
                  </div>
                  <div className="p-3 rounded-[10px] border border-[var(--border)] bg-[var(--background)] text-xs text-[var(--muted-foreground)] flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-teal-500 animate-pulse" />
                    <span>Analyzing code & pedagogical context...</span>
                  </div>
                </div>
              )}

              {/* Error Message with Retry Button */}
              {errorMessage && (
                <div className="p-3 rounded-[8px] border border-red-500/40 bg-red-500/10 text-red-700 dark:text-red-300 space-y-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
                    <div className="text-xs font-mono">{errorMessage}</div>
                  </div>
                  {lastAttemptedPrompt && (
                    <div className="flex justify-end">
                      <Button
                        onClick={handleRetryLastMessage}
                        variant="outline"
                        size="sm"
                        className="h-6 text-[10px] font-mono flex items-center gap-1.5 border-red-400/50 hover:bg-red-500/20"
                      >
                        <RefreshCw className="h-2.5 w-2.5" />
                        <span>Retry</span>
                      </Button>
                    </div>
                  )}
                </div>
              )}

              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Message Area with Textarea and Send button */}
        {!showEvaluation && (
          <div className="p-3 border-t border-[var(--border)] bg-[var(--background)] space-y-2">
            <div className="flex items-center justify-between text-[10px] font-mono text-[var(--muted-foreground)]">
              <span>Enter to send · Shift+Enter for new line</span>
              <Button
                type="button"
                onClick={handleAskDifferentWay}
                variant="ghost"
                size="sm"
                className="h-5 px-1.5 text-[10px] font-mono flex items-center gap-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
              >
                <RotateCcw className="h-2.5 w-2.5" />
                <span>Analogy</span>
              </Button>
            </div>

            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={inputMessage}
                onChange={e => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.mentor.placeholder || 'Ask about arrays, loops, swap condition...'}
                disabled={isLoading}
                rows={2}
                className="flex-1 rounded-[8px] border border-[var(--border)] bg-[var(--card)] p-2 text-xs font-mono text-[var(--foreground)] focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 resize-none"
              />
              <Button
                type="button"
                onClick={() => sendMessage(inputMessage)}
                disabled={isLoading || !inputMessage.trim()}
                variant="default"
                size="sm"
                className="h-10 px-3 bg-[var(--primary)] hover:opacity-90 flex items-center justify-center shrink-0"
              >
                {isLoading ? (
                  <Sparkles className="h-4 w-4 animate-spin text-[var(--primary-foreground)]" />
                ) : (
                  <Send className="h-4 w-4 text-[var(--primary-foreground)]" />
                )}
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
