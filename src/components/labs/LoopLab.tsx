import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { sound } from '../../lib/soundEngine';
import { Play, Pause, SkipForward, RotateCcw, AlertTriangle, CheckCircle2, Info } from 'lucide-react';

interface LoopLabProps {
  onAwardXp?: (amount: number) => void;
  onRequestMentorContext?: (ctx: any) => void;
}

export const LoopLab: React.FC<LoopLabProps> = ({ onAwardXp, onRequestMentorContext }) => {
  // Loop parameters
  const [startVal, setStartVal] = useState(0);
  const [limitVal, setLimitVal] = useState(5);
  const [stepVal, setStepVal] = useState(1);
  const [operator, setOperator] = useState<'<' | '<='>('<');
  
  // Execution state
  const [currentI, setCurrentI] = useState<number>(0);
  const [iterationCount, setIterationCount] = useState<number>(0);
  const [history, setHistory] = useState<{ i: number; condition: boolean; action: string }[]>([]);
  const [isTerminated, setIsTerminated] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const conditionMet = operator === '<' ? currentI < limitVal : currentI <= limitVal;

  const handleStep = () => {
    sound.playClick();
    if (isTerminated) return;

    if (conditionMet) {
      const nextI = currentI + stepVal;
      const nextMet = operator === '<' ? nextI < limitVal : nextI <= limitVal;
      const record = {
        i: currentI,
        condition: true,
        action: `Executed body. Advanced i: ${currentI} → ${nextI}`,
      };
      setHistory(prev => [...prev, record]);
      setCurrentI(nextI);
      setIterationCount(prev => prev + 1);

      if (!nextMet) {
        setIsTerminated(true);
        setIsPlaying(false);
        sound.playSuccess();
        if (onAwardXp) onAwardXp(15);
      }
    } else {
      setIsTerminated(true);
      setIsPlaying(false);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setCurrentI(startVal);
    setIterationCount(0);
    setHistory([]);
    setIsTerminated(false);
    setIsPlaying(false);
  };

  return (
    <div className="space-y-6 lift-up">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--muted-foreground)] uppercase tracking-wider">
            <span>LAB 01 / FOUNDATIONS</span>
            <span>·</span>
            <span>ITERATION & OFF-BY-ONE GUARD</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            Loop Lab: <span className="font-serif-italic text-[var(--primary)]">Stepping</span> & Invariants
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-2xl mt-1">
            Examine boundary conditions, evaluate the exact iteration count, and diagnose fencepost errors in real time.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant={isTerminated ? 'default' : 'secondary'} className="font-mono text-xs">
            {isTerminated ? 'TERMINATED' : `ITERATION: ${iterationCount}`}
          </Badge>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Code Register & Execution State */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-5 bg-[var(--card)] border-[var(--border)]">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-3 mb-4">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                Active Code Formulation
              </span>
              <span className="font-mono text-xs text-[var(--primary)] font-bold">
                i = {currentI}
              </span>
            </div>

            {/* Code Block with Dynamic Highlights */}
            <div className="rounded-[8px] bg-[var(--background)] p-4 font-mono text-xs sm:text-sm border border-[var(--border)] space-y-1">
              <div className="text-[var(--muted-foreground)]">
                <span className="text-[var(--primary)]">let</span> i = <span className="font-bold text-[var(--foreground)]">{startVal}</span>;
              </div>
              <div className={`px-2 py-1 rounded-[6px] transition-colors ${!isTerminated ? 'bg-[var(--primary)]/15 text-[var(--primary)] font-semibold' : 'text-[var(--foreground)]'}`}>
                <span className="text-[var(--primary)]">while</span> (i <span className="text-[var(--destructive)] font-bold">{operator}</span> <span className="font-bold text-[var(--foreground)]">{limitVal}</span>) &#123;
              </div>
              <div className="pl-6 text-[var(--muted-foreground)]">
                console.log(<span className="text-[var(--accent)] font-semibold">&quot;Step&quot;</span>, i);
              </div>
              <div className="pl-6 text-[var(--muted-foreground)]">
                i += <span className="font-bold text-[var(--foreground)]">{stepVal}</span>;
              </div>
              <div className="text-[var(--muted-foreground)]">&#125;</div>
            </div>

            {/* Stepper Controls */}
            <div className="flex flex-wrap items-center gap-3 mt-5">
              <Button
                onClick={handleStep}
                disabled={isTerminated}
                variant="default"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <SkipForward className="h-3.5 w-3.5" />
                <span>Next Step</span>
              </Button>

              <Button
                onClick={handleReset}
                variant="secondary"
                size="sm"
                className="flex items-center gap-1.5"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Reset</span>
              </Button>

              <div className="text-xs font-mono text-[var(--muted-foreground)] ml-auto">
                Condition Evaluated: <strong className={conditionMet ? 'text-[var(--primary)]' : 'text-[var(--destructive)]'}>{conditionMet ? 'TRUE' : 'FALSE'}</strong>
              </div>
            </div>
          </Card>

          {/* Stepping History Log */}
          <Card className="p-4 bg-[var(--card)] border-[var(--border)]">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block mb-3">
              Execution Trace Register
            </span>
            <div className="max-h-48 overflow-y-auto space-y-1.5 text-xs font-mono">
              {history.length === 0 ? (
                <div className="text-[var(--muted-foreground)] py-4 text-center italic">
                  No steps executed yet. Click &quot;Next Step&quot; to begin loop iteration.
                </div>
              ) : (
                history.map((h, idx) => (
                  <div key={idx} className="flex items-center justify-between p-2 rounded-[6px] bg-[var(--background)] border border-[var(--border)]">
                    <span className="text-[var(--muted-foreground)]">Iteration #{idx + 1}</span>
                    <span className="text-[var(--foreground)]">{h.action}</span>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>

        {/* Right Column: Off-by-One Detector & Parameter Sandbox */}
        <div className="lg:col-span-5 space-y-4">
          <Card className="p-5 bg-[var(--card)] border-[var(--border)]">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="h-4 w-4 text-[var(--warning)]" />
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                Fencepost / Off-by-One Tester
              </h3>
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mb-4">
              Toggle the relational operator to compare the exact iteration count. A single misplaced equality creates an off-by-one bug.
            </p>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-mono text-[var(--muted-foreground)] mb-1">
                  Relational Guard Operator
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      setOperator('<');
                      handleReset();
                    }}
                    className={`py-2 px-3 rounded-[8px] font-mono text-xs border text-center transition-colors ${
                      operator === '<'
                        ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] font-bold'
                        : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    i &lt; limit ({limitVal} steps)
                  </button>
                  <button
                    onClick={() => {
                      setOperator('<=');
                      handleReset();
                    }}
                    className={`py-2 px-3 rounded-[8px] font-mono text-xs border text-center transition-colors ${
                      operator === '<='
                        ? 'border-[var(--warning)] bg-[var(--warning)]/10 text-[var(--warning)] font-bold'
                        : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]'
                    }`}
                  >
                    i &lt;= limit ({limitVal + 1} steps)
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--muted-foreground)] mb-1">
                  Boundary Limit: <strong className="text-[var(--foreground)]">{limitVal}</strong>
                </label>
                <input
                  type="range"
                  min="2"
                  max="10"
                  value={limitVal}
                  onChange={(e) => {
                    setLimitVal(Number(e.target.value));
                    handleReset();
                  }}
                  className="w-full accent-[var(--primary)]"
                />
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--muted-foreground)] mb-1">
                  Step Increment (i += step): <strong className="text-[var(--foreground)]">{stepVal}</strong>
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3].map((val) => (
                    <button
                      key={val}
                      onClick={() => {
                        setStepVal(val);
                        handleReset();
                      }}
                      className={`flex-1 py-1.5 rounded-[8px] font-mono text-xs border transition-colors ${
                        stepVal === val
                          ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] font-bold'
                          : 'border-[var(--border)] bg-[var(--background)] text-[var(--muted-foreground)]'
                      }`}
                    >
                      +{val}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-5 p-3 rounded-[8px] bg-[var(--background)] border border-[var(--border)] text-xs text-[var(--muted-foreground)] space-y-1">
              <div className="flex items-center gap-1.5 font-mono text-[11px] font-semibold text-[var(--foreground)]">
                <Info className="h-3.5 w-3.5 text-[var(--primary)]" />
                <span>Atelier Insight</span>
              </div>
              <p>
                When traversing an array of length N, using <code className="font-mono text-[var(--destructive)]">i &lt;= arr.length</code> causes an index out-of-bounds access on the final cycle because arrays are 0-indexed.
              </p>
            </div>
          </Card>
        </div>
      </div>

      <div className="text-center font-mono text-[11px] text-[var(--muted-foreground)]">
        FIG. 02 · Iterative loop condition register &amp; boundary evaluation
      </div>
    </div>
  );
};
