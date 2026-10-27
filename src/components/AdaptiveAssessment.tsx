import React, { useState } from 'react';
import { StudentProfile, WorkspaceMode } from '../types';
import { ASSESSMENT_QUESTIONS } from '../lib/arcadeData';
import { 
  evaluateHonestMastery, 
  downloadMarkdownSummary, 
  triggerPrintablePortfolio 
} from '../lib/masteryEngine';
import { SupportedLocale, TRANSLATIONS } from '../lib/i18n';
import { sound } from '../lib/soundEngine';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge, Progress } from './ui/Badge';
import { 
  Award, CheckCircle2, XCircle, RotateCcw, 
  Download, Printer, ArrowRight, ShieldCheck, Layers 
} from 'lucide-react';

interface AdaptiveAssessmentProps {
  profile: StudentProfile;
  onUpdateProfile: (updates: Partial<StudentProfile>) => void;
  onSelectMode: (mode: WorkspaceMode) => void;
  locale: SupportedLocale;
}

export const AdaptiveAssessment: React.FC<AdaptiveAssessmentProps> = ({
  profile,
  onUpdateProfile,
  onSelectMode,
  locale,
}) => {
  const t = TRANSLATIONS[locale];

  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, number>>({});
  const [isSubmitted, setIsSubmitted] = useState(profile.assessmentCompleted);

  const summary = evaluateHonestMastery(profile);

  const handleSelectOption = (qIdx: number, optIdx: number) => {
    sound.playClick();
    setSelectedAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleNextQuestion = () => {
    if (currentQIndex < ASSESSMENT_QUESTIONS.length - 1) {
      sound.playClick();
      setCurrentQIndex(prev => prev + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQIndex > 0) {
      sound.playClick();
      setCurrentQIndex(prev => prev - 1);
    }
  };

  const handleSubmitAssessment = () => {
    sound.playSuccess();
    let correctCount = 0;
    ASSESSMENT_QUESTIONS.forEach((q, idx) => {
      if (selectedAnswers[idx] === q.correctIndex) correctCount++;
    });

    const percentScore = Math.round((correctCount / ASSESSMENT_QUESTIONS.length) * 100);
    const passed = percentScore >= 70;

    setIsSubmitted(true);
    onUpdateProfile({
      assessmentCompleted: true,
      assessmentScore: percentScore,
      xp: profile.xp + (passed ? 80 : 30),
    });
  };

  const resetAssessment = () => {
    sound.playClick();
    setSelectedAnswers({});
    setCurrentQIndex(0);
    setIsSubmitted(false);
  };

  const question = ASSESSMENT_QUESTIONS[currentQIndex];
  const allAnswered = ASSESSMENT_QUESTIONS.every((_, idx) => selectedAnswers[idx] !== undefined);

  return (
    <div className="space-y-8 max-w-[1200px] mx-auto">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[var(--border)] pb-4">
        <div>
          <div className="text-[11px] font-mono tracking-[0.08em] uppercase text-[var(--muted-foreground)]">
            {t.assessment.kicker}
          </div>
          <h2 className="text-xl sm:text-2xl font-sans font-bold text-[var(--foreground)] tracking-tight">
            {t.assessment.title}
          </h2>
        </div>

        <div className="text-xs font-mono text-[var(--muted-foreground)]">
          Evidence threshold: <strong className="text-[var(--primary)]">Demonstrated</strong> at &ge;75% Confidence
        </div>
      </div>

      {/* Concept Coverage Map (Skill Tree) */}
      <Card className="p-6 bg-[var(--card)] space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-[var(--primary)]" />
            <h3 className="text-sm font-mono font-bold uppercase tracking-wide text-[var(--foreground)]">
              {t.assessment.skillTreeTitle}
            </h3>
          </div>
          <span className="text-xs font-mono text-[var(--muted-foreground)]">
            Overall: <strong className="text-[var(--primary)]">{summary.overallStatus}</strong> ({summary.confidencePercent}% Confidence)
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {summary.concepts.map(c => {
            let statusColor = 'text-[var(--muted-foreground)] border-[var(--border)] bg-[var(--background)]';
            if (c.status === 'Demonstrated') {
              statusColor = 'text-[var(--primary)] border-[var(--primary)]/40 bg-[var(--primary)]/10 font-bold';
            } else if (c.status === 'Developing') {
              statusColor = 'text-[var(--warning)] border-[var(--warning)]/40 bg-[var(--warning)]/10 font-semibold';
            }

            return (
              <div
                key={c.conceptId}
                className="p-3.5 rounded-[8px] border border-[var(--border)] bg-[var(--background)] flex flex-col justify-between space-y-2.5"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] font-mono mb-1">
                    <span className="font-semibold text-[var(--foreground)] truncate">{c.name}</span>
                  </div>
                  <p className="text-[11px] text-[var(--muted-foreground)] line-clamp-2 leading-relaxed">
                    {c.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className={`px-1.5 py-0.5 rounded border ${statusColor}`}>
                      {c.status}
                    </span>
                    <span className="tabular-nums font-semibold text-[var(--foreground)]">
                      {c.confidencePercent}%
                    </span>
                  </div>
                  <Progress value={c.confidencePercent} />
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Main Assessment Interaction */}
      {!isSubmitted ? (
        <Card className="p-6 bg-[var(--card)] space-y-6">
          <div className="flex items-center justify-between border-b border-[var(--border)] pb-3">
            <span className="text-xs font-mono text-[var(--muted-foreground)] uppercase">
              Question {currentQIndex + 1} of {ASSESSMENT_QUESTIONS.length} · {question.category}
            </span>

            <div className="flex items-center gap-1.5">
              {ASSESSMENT_QUESTIONS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQIndex(idx)}
                  className={`h-2 w-5 rounded-full transition-all ${
                    idx === currentQIndex
                      ? 'bg-[var(--primary)]'
                      : selectedAnswers[idx] !== undefined
                      ? 'bg-[var(--muted-foreground)]'
                      : 'bg-[var(--muted)] border border-[var(--border)]'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="py-2">
            <h3 className="text-base sm:text-lg font-sans font-semibold text-[var(--foreground)] leading-relaxed">
              {question.prompt}
            </h3>
          </div>

          <div className="space-y-2.5">
            {question.options.map((opt, optIdx) => {
              const isSelected = selectedAnswers[currentQIndex] === optIdx;
              return (
                <button
                  key={optIdx}
                  onClick={() => handleSelectOption(currentQIndex, optIdx)}
                  className={`w-full p-3.5 rounded-[8px] border text-left text-xs font-mono transition-all flex items-start gap-3 ${
                    isSelected
                      ? 'border-2 border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--foreground)] font-semibold'
                      : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--muted-foreground)]/50 text-[var(--foreground)]'
                  }`}
                >
                  <span className="h-4 w-4 rounded-full border border-[var(--border)] flex items-center justify-center shrink-0 mt-0.5 text-[9px]">
                    {String.fromCharCode(65 + optIdx)}
                  </span>
                  <span className="leading-relaxed">{opt}</span>
                </button>
              );
            })}
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
            <Button
              onClick={handlePrevQuestion}
              disabled={currentQIndex === 0}
              variant="outline"
              size="sm"
            >
              {t.actions.prev}
            </Button>

            {currentQIndex < ASSESSMENT_QUESTIONS.length - 1 ? (
              <Button onClick={handleNextQuestion} variant="secondary" size="sm">
                {t.actions.next}
              </Button>
            ) : (
              <Button
                onClick={handleSubmitAssessment}
                disabled={!allAnswered}
                variant="default"
                size="md"
              >
                {t.actions.submit}
              </Button>
            )}
          </div>
        </Card>
      ) : (
        /* End-of-Session Portfolio Card with Download Summary Action */
        <Card className="p-6 sm:p-8 bg-[var(--card)] space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-6">
            <div className="flex items-center gap-3.5">
              <div className="flex h-12 w-12 items-center justify-center rounded-[10px] border border-[var(--primary)]/40 bg-[var(--primary)]/10 text-[var(--primary)]">
                <Award className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-[0.08em] text-[var(--muted-foreground)]">
                  {t.assessment.portfolioTitle}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold font-sans text-[var(--foreground)]">
                  Status: {summary.overallStatus}
                </h3>
                <span className="text-xs text-[var(--muted-foreground)] font-mono">
                  Confidence: <strong className="text-[var(--primary)]">{summary.confidencePercent}%</strong> · Session Date: {summary.portfolioDate}
                </span>
              </div>
            </div>

            {/* Export Actions */}
            <div className="flex items-center gap-2">
              <Button
                onClick={() => downloadMarkdownSummary(profile, summary)}
                variant="outline"
                size="sm"
                className="gap-1.5 text-xs font-mono"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Markdown Summary ↗</span>
              </Button>

              <Button
                onClick={triggerPrintablePortfolio}
                variant="secondary"
                size="sm"
                className="gap-1.5 text-xs font-mono"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print Document ↗</span>
              </Button>
            </div>
          </div>

          {/* Evidence Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-[8px] border border-[var(--border)] bg-[var(--background)] space-y-2">
              <div className="text-xs font-mono font-bold text-[var(--foreground)] uppercase tracking-wide flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[var(--primary)]" />
                <span>Observed Process Evidence</span>
              </div>
              <ul className="text-xs text-[var(--muted-foreground)] space-y-1 font-mono">
                <li>• Reasoning XP: {profile.xp} XP collected without speed penalization</li>
                <li>• Personal Best Streak: {profile.bestStreak} accurate adjacent predictions</li>
                <li>• Hints Requested: {summary.hintsUsed} (lower hints grant higher confidence)</li>
                <li>• Documented Error Invariants: {profile.mistakes.length} corrected</li>
              </ul>
            </div>

            <div className="p-4 rounded-[8px] border border-[var(--border)] bg-[var(--background)] space-y-2">
              <div className="text-xs font-mono font-bold text-[var(--foreground)] uppercase tracking-wide flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[var(--primary)]" />
                <span>Curriculum Pathway</span>
              </div>
              <div className="text-xs text-[var(--muted-foreground)] space-y-1 font-mono">
                <div>Current Topic: <strong>Bubble Sort (O(n²) / O(1))</strong></div>
                <div className="text-[var(--primary)] font-semibold mt-1">
                  Next Recommendation: {summary.nextRecommendedTopic}
                </div>
                <div className="text-[11px] text-[var(--muted-foreground)]">
                  Ready to compare adjacent bubbling against selective minimum scanning.
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="pt-4 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
            <button
              onClick={resetAssessment}
              className="flex items-center gap-1.5 text-xs font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              <RotateCcw className="h-3 w-3" />
              <span>Retake Diagnostic ↺</span>
            </button>

            <div className="flex items-center gap-2">
              <Button
                onClick={() => onSelectMode('visual')}
                variant="outline"
                size="sm"
              >
                Return to Visual Lab ↗
              </Button>
              <Button
                onClick={() => onSelectMode('arena')}
                variant="default"
                size="sm"
              >
                Code Arena ↗
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};
