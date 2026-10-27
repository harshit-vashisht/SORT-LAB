import React, { useState } from 'react';
import { StudentProfile, ProgrammingLanguage, TestResult } from '../types';
import { STARTER_CODE, CODE_TEST_CASES, evaluateStudentCode } from '../lib/codeEvaluator';
import { SupportedLocale, TRANSLATIONS } from '../lib/i18n';
import { sound } from '../lib/soundEngine';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { 
  Play, RotateCcw, Sparkles, Terminal, FileCode, Check, X 
} from 'lucide-react';

interface CodeArenaProps {
  profile: StudentProfile;
  onUpdateProfile: (updates: Partial<StudentProfile>) => void;
  onRequestMentorContext: (context: any) => void;
  onOpenMentorWithMessage: (msg: string) => void;
  locale: SupportedLocale;
}

export const CodeArena: React.FC<CodeArenaProps> = ({
  profile,
  onUpdateProfile,
  onRequestMentorContext,
  onOpenMentorWithMessage,
  locale,
}) => {
  const t = TRANSLATIONS[locale];

  const [selectedLang, setSelectedLang] = useState<ProgrammingLanguage>(profile.language || 'python');
  const [code, setCode] = useState<string>(STARTER_CODE[selectedLang] || STARTER_CODE.python);
  const [activeTestCaseId, setActiveTestCaseId] = useState<string>('test-1');
  const [testResults, setTestResults] = useState<TestResult[] | null>(null);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [runSummary, setRunSummary] = useState<string | null>(null);

  const handleLanguageChange = (lang: ProgrammingLanguage) => {
    sound.playClick();
    setSelectedLang(lang);
    setCode(STARTER_CODE[lang]);
    setTestResults(null);
    setRunSummary(null);
    onUpdateProfile({ language: lang });
  };

  const handleResetCode = () => {
    sound.playClick();
    setCode(STARTER_CODE[selectedLang]);
    setTestResults(null);
    setRunSummary(null);
  };

  const handleRunCode = () => {
    sound.playClick();
    setIsRunning(true);
    setTestResults(null);
    setRunSummary(null);

    setTimeout(() => {
      const evaluation = evaluateStudentCode(code, selectedLang);
      setTestResults(evaluation.results);
      setRunSummary(evaluation.summary);
      setIsRunning(false);

      if (evaluation.allPassed) {
        sound.playSuccess();
        onUpdateProfile({
          xp: profile.xp + 50,
          completedAtLeastOnePass: true,
        });
      } else {
        sound.playError();
        const failures = evaluation.results.filter(r => !r.passed).map(r => r.error || 'Failed test');
        onUpdateProfile({
          mistakes: [...profile.mistakes, ...failures.slice(0, 2)],
        });
      }

      onRequestMentorContext({
        mode: 'arena',
        language: selectedLang,
        codeSnippet: code.slice(0, 300),
        allPassed: evaluation.allPassed,
        results: evaluation.results,
      });
    }, 200);
  };

  const activeTestCase = CODE_TEST_CASES.find(tc => tc.id === activeTestCaseId) || CODE_TEST_CASES[0];
  const activeResult = testResults?.find(r => r.testId === activeTestCaseId);

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-[var(--border)] pb-4">
        <div>
          <div className="text-[11px] font-mono tracking-[0.08em] uppercase text-[var(--muted-foreground)]">
            {t.arena.kicker}
          </div>
          <h2 className="text-xl sm:text-2xl font-sans font-bold text-[var(--foreground)] tracking-tight">
            {t.arena.title}
          </h2>
        </div>

        {/* Language Tabs */}
        <div className="flex items-center gap-1 p-0.5 rounded-[8px] border border-[var(--border)] bg-[var(--card)]">
          {[
            { id: 'python' as ProgrammingLanguage, label: 'Python', active: true },
            { id: 'javascript' as ProgrammingLanguage, label: 'JavaScript', active: true },
            { id: 'java' as ProgrammingLanguage, label: 'Java', active: false },
            { id: 'cpp' as ProgrammingLanguage, label: 'C++', active: false },
          ].map(lang => (
            <button
              key={lang.id}
              onClick={() => handleLanguageChange(lang.id)}
              className={`px-2.5 py-1 text-xs font-mono rounded-[8px] transition-colors ${
                selectedLang === lang.id
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {lang.label} {!lang.active && '· Preview'}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Code Editor (7 cols) + Verification Suite (5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left: Code Editor Card */}
        <div className="lg:col-span-7">
          <Card className="p-5 bg-[var(--card)] flex flex-col justify-between min-h-[500px]">
            <div>
              {/* Problem Brief */}
              <div className="border-b border-[var(--border)] pb-3 mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-mono font-bold text-[var(--foreground)] uppercase tracking-wide">
                    {t.arena.problemTitle}
                  </span>
                  <span className="text-[10px] font-mono text-[var(--primary)]">
                    In-Place · O(1) Space
                  </span>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] leading-relaxed">
                  {t.arena.problemDesc}
                </p>
              </div>

              {/* Editor Tab Bar */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--muted-foreground)]">
                  <FileCode className="h-3.5 w-3.5 text-[var(--primary)]" />
                  <span>solution.{selectedLang === 'python' ? 'py' : selectedLang === 'javascript' ? 'js' : selectedLang === 'java' ? 'java' : 'cpp'}</span>
                </div>

                <button
                  onClick={handleResetCode}
                  className="flex items-center gap-1 text-[11px] font-mono text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset ↺</span>
                </button>
              </div>

              {/* Textarea Code Editor */}
              <div className="rounded-[8px] border border-[var(--border)] bg-[var(--background)] p-3 font-mono text-xs overflow-hidden">
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  spellCheck={false}
                  className="w-full min-h-[300px] bg-transparent text-[var(--foreground)] resize-none focus:outline-none leading-relaxed font-mono"
                />
              </div>
            </div>

            {/* Editor Action Controls */}
            <div className="mt-4 pt-3 border-t border-[var(--border)] flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => {
                  onOpenMentorWithMessage(`Review my current code for Bubble Sort in ${selectedLang}:\n\`\`\`${selectedLang}\n${code}\n\`\`\`\nPlease provide an editorial hint on loop boundaries and invariant logic.`);
                }}
                className="flex items-center gap-1.5 text-xs font-mono text-[var(--primary)] hover:underline"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span>Ask AI Mentor to Review ↗</span>
              </button>

              <Button
                onClick={handleRunCode}
                disabled={isRunning}
                variant="default"
                size="md"
                className="gap-2 font-bold"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>{isRunning ? 'Evaluating...' : t.actions.runTests}</span>
              </Button>
            </div>
          </Card>
        </div>

        {/* Right: Verification Suite Card */}
        <div className="lg:col-span-5">
          <Card className="p-5 bg-[var(--card)] flex flex-col justify-between min-h-[500px]">
            <div>
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2.5 mb-3">
                <div className="flex items-center gap-1.5">
                  <Terminal className="h-3.5 w-3.5 text-[var(--primary)]" />
                  <span className="text-xs font-mono font-bold text-[var(--foreground)] uppercase tracking-wide">
                    {t.arena.suiteTitle}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-[var(--muted-foreground)]">
                  {CODE_TEST_CASES.length} Test Cases
                </span>
              </div>

              {/* Case Picker Badges */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {CODE_TEST_CASES.map((tc, idx) => {
                  const res = testResults?.find(r => r.testId === tc.id);
                  const isCur = tc.id === activeTestCaseId;

                  let variantColor = 'border-[var(--border)] text-[var(--muted-foreground)] bg-[var(--background)]';
                  if (res) {
                    variantColor = res.passed
                      ? 'border-[var(--primary)] text-[var(--primary)] bg-[var(--primary)]/10'
                      : 'border-[var(--destructive)] text-[var(--destructive)] bg-[var(--destructive)]/10';
                  }

                  return (
                    <button
                      key={tc.id}
                      onClick={() => {
                        sound.playClick();
                        setActiveTestCaseId(tc.id);
                      }}
                      className={`px-2.5 py-1 text-[11px] font-mono rounded-[8px] border transition-colors flex items-center gap-1 ${
                        isCur ? 'border-[var(--primary)] font-bold' : ''
                      } ${variantColor}`}
                    >
                      <span>Case {idx + 1}</span>
                      {res && (
                        res.passed ? (
                          <Check className="h-3 w-3 stroke-[3]" />
                        ) : (
                          <X className="h-3 w-3 stroke-[3]" />
                        )
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Case Details Box */}
              <div className="rounded-[8px] border border-[var(--border)] bg-[var(--background)] p-3.5 space-y-2.5 font-mono text-xs">
                <div>
                  <span className="text-[10px] uppercase text-[var(--muted-foreground)] block">Description:</span>
                  <span className="text-[var(--foreground)] font-semibold">{activeTestCase.name}</span>
                  <span className="text-[11px] text-[var(--muted-foreground)] block mt-0.5">{activeTestCase.description}</span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-[var(--muted-foreground)] block">Input Array:</span>
                  <span className="text-[var(--foreground)] bg-[var(--card)] px-2 py-0.5 rounded border border-[var(--border)] block mt-0.5 overflow-x-auto tabular-nums">
                    [{activeTestCase.input.join(', ')}]
                  </span>
                </div>

                <div>
                  <span className="text-[10px] uppercase text-[var(--muted-foreground)] block">Expected Output:</span>
                  <span className="text-[var(--primary)] bg-[var(--card)] px-2 py-0.5 rounded border border-[var(--border)] block mt-0.5 overflow-x-auto tabular-nums">
                    [{activeTestCase.expected.join(', ')}]
                  </span>
                </div>

                {activeResult && (
                  <div className="pt-2 border-t border-[var(--border)] space-y-2">
                    <div>
                      <span className="text-[10px] uppercase text-[var(--muted-foreground)] block">Actual Result:</span>
                      <span
                        className={`px-2 py-0.5 rounded border block mt-0.5 overflow-x-auto tabular-nums ${
                          activeResult.passed
                            ? 'text-[var(--primary)] border-[var(--primary)]/40 bg-[var(--primary)]/10'
                            : 'text-[var(--destructive)] border-[var(--destructive)]/40 bg-[var(--destructive)]/10'
                        }`}
                      >
                        {activeResult.error ? activeResult.error : `[${activeResult.actual.join(', ')}]`}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-[var(--muted-foreground)]">
                      <span>Status: <strong className={activeResult.passed ? 'text-[var(--primary)]' : 'text-[var(--destructive)]'}>{activeResult.passed ? t.arena.statusPassed : t.arena.statusFailed}</strong></span>
                      <span>Runtime: <strong className="text-[var(--foreground)] tabular-nums">{activeResult.executionTimeMs} ms</strong></span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Run Summary Notice */}
            <div className="mt-4 pt-3 border-t border-[var(--border)]">
              {runSummary ? (
                <div className="p-3 rounded-[8px] bg-[var(--background)] border border-[var(--border)] text-xs font-mono text-[var(--foreground)]">
                  <span className="font-semibold block mb-0.5">Execution Summary:</span>
                  <span>{runSummary}</span>
                </div>
              ) : (
                <div className="text-xs font-mono text-[var(--muted-foreground)] text-center py-2">
                  Select "Run Tests ↗" to evaluate all test cases.
                </div>
              )}
            </div>
          </Card>
        </div>

      </div>
    </div>
  );
};
