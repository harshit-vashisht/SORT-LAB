import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { sound } from '../../lib/soundEngine';
import { ArrowLeft, ArrowRight, ArrowLeftRight, ShieldAlert, ShieldCheck, Search } from 'lucide-react';

interface ArrayLabProps {
  onAwardXp?: (amount: number) => void;
  onRequestMentorContext?: (ctx: any) => void;
}

export const ArrayLab: React.FC<ArrayLabProps> = ({ onAwardXp }) => {
  const [array, setArray] = useState<number[]>([23, 77, 14, 89, 45, 62, 91, 38]);
  const [pointerIdx, setPointerIdx] = useState<number>(0);
  const [swapA, setSwapA] = useState<number>(1);
  const [swapB, setSwapB] = useState<number>(4);
  const [testIndexInput, setTestIndexInput] = useState<string>('8');
  const [boundsResult, setBoundsResult] = useState<{ safe: boolean; message: string } | null>(null);

  const handlePointerLeft = () => {
    sound.playClick();
    setPointerIdx(prev => Math.max(0, prev - 1));
  };

  const handlePointerRight = () => {
    sound.playClick();
    setPointerIdx(prev => Math.min(array.length - 1, prev + 1));
  };

  const handleSwap = () => {
    if (swapA >= 0 && swapA < array.length && swapB >= 0 && swapB < array.length) {
      sound.playSwap();
      const next = [...array];
      const temp = next[swapA];
      next[swapA] = next[swapB];
      next[swapB] = temp;
      setArray(next);
      if (onAwardXp) onAwardXp(10);
    }
  };

  const handleTestBounds = () => {
    sound.playClick();
    const idx = parseInt(testIndexInput, 10);
    if (isNaN(idx)) {
      setBoundsResult({ safe: false, message: 'Invalid non-integer index requested.' });
      return;
    }
    if (idx < 0) {
      setBoundsResult({
        safe: false,
        message: `Underflow: index ${idx} < 0. In Python: negative indexing wraps or raises IndexError; in C/C++: reads memory before buffer.`,
      });
      sound.playError();
    } else if (idx >= array.length) {
      setBoundsResult({
        safe: false,
        message: `Overflow: index ${idx} >= array.length (${array.length}). Causes IndexError / Buffer Overflow panic!`,
      });
      sound.playError();
    } else {
      setBoundsResult({
        safe: true,
        message: `Valid Access: array[${idx}] contains value ${array[idx]}. Memory bounds verified.`,
      });
      sound.playSuccess();
      if (onAwardXp) onAwardXp(15);
    }
  };

  return (
    <div className="space-y-6 lift-up">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--muted-foreground)] uppercase tracking-wider">
            <span>LAB 02 / FOUNDATIONS</span>
            <span>·</span>
            <span>1D ARRAYS &amp; POINTER SAFETY</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            Array Lab: <span className="font-serif-italic text-[var(--primary)]">Vectors</span> &amp; Boundary Guards
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-2xl mt-1">
            Observe continuous memory addressing, zero-indexed pointer traversal, and boundary safety mechanisms.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">
            LENGTH: {array.length} | CAPACITY: {array.length}
          </Badge>
        </div>
      </div>

      {/* Array Vector Display */}
      <Card className="p-6 bg-[var(--card)] border-[var(--border)] space-y-6">
        <div className="flex items-center justify-between">
          <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
            Continuous Memory Layout (Contiguous Heap)
          </span>
          <span className="font-mono text-xs text-[var(--muted-foreground)]">
            Active Pointer: <strong className="text-[var(--primary)] font-bold">i = {pointerIdx}</strong> (Value: {array[pointerIdx]})
          </span>
        </div>

        {/* 1D Array Block Cells with Indices */}
        <div className="overflow-x-auto pb-2">
          <div className="flex items-end justify-center gap-2 min-w-[560px] py-4">
            {array.map((val, idx) => {
              const isPointer = idx === pointerIdx;
              const isSwapTarget = idx === swapA || idx === swapB;
              return (
                <div key={idx} className="flex flex-col items-center">
                  {/* Pointer indicator */}
                  <div className="h-6 flex items-center justify-center font-mono text-xs font-bold text-[var(--primary)]">
                    {isPointer && <span className="animate-bounce">↓ i</span>}
                  </div>

                  {/* Cell box */}
                  <div
                    onClick={() => {
                      sound.playClick();
                      setPointerIdx(idx);
                    }}
                    className={`w-14 h-16 rounded-[8px] flex flex-col items-center justify-center font-mono cursor-pointer transition-all border ${
                      isPointer
                        ? 'border-[var(--primary)] bg-[var(--primary)]/15 text-[var(--foreground)] shadow-sm'
                        : isSwapTarget
                        ? 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]'
                        : 'border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--muted-foreground)]'
                    }`}
                  >
                    <span className="text-lg font-bold tabular-nums">{val}</span>
                  </div>

                  {/* Index annotation */}
                  <div className="mt-2 font-mono text-[11px] text-[var(--muted-foreground)]">
                    [{idx}]
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Pointer Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Button
              onClick={handlePointerLeft}
              disabled={pointerIdx <= 0}
              variant="secondary"
              size="sm"
            >
              <ArrowLeft className="h-3.5 w-3.5 mr-1" />
              <span>Step Left</span>
            </Button>
            <Button
              onClick={handlePointerRight}
              disabled={pointerIdx >= array.length - 1}
              variant="secondary"
              size="sm"
            >
              <span>Step Right</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </div>

          <div className="font-mono text-xs text-[var(--muted-foreground)]">
            Memory Offset: <code>base_address + ({pointerIdx} * sizeof(int))</code>
          </div>
        </div>
      </Card>

      {/* Grid: In-Place Swap & Bounds Guard Testing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* In-Place Swap Simulator */}
        <Card className="p-5 bg-[var(--card)] border-[var(--border)] space-y-4">
          <div className="flex items-center gap-2">
            <ArrowLeftRight className="h-4 w-4 text-[var(--primary)]" />
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
              In-Place Swap Mechanism
            </h3>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Swap two elements in memory using a temporary register without allocating extra vector buffers.
          </p>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-[var(--muted-foreground)] mb-1">Index A</label>
              <select
                value={swapA}
                onChange={(e) => setSwapA(Number(e.target.value))}
                className="w-full rounded-[8px] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-mono text-[var(--foreground)]"
              >
                {array.map((_, i) => (
                  <option key={i} value={i}>Index [{i}] ({array[i]})</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-[var(--muted-foreground)] mb-1">Index B</label>
              <select
                value={swapB}
                onChange={(e) => setSwapB(Number(e.target.value))}
                className="w-full rounded-[8px] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-mono text-[var(--foreground)]"
              >
                {array.map((_, i) => (
                  <option key={i} value={i}>Index [{i}] ({array[i]})</option>
                ))}
              </select>
            </div>
          </div>

          <Button onClick={handleSwap} variant="default" size="sm" className="w-full">
            Execute In-Place Swap ({swapA} ↔ {swapB})
          </Button>

          <div className="p-3 rounded-[8px] bg-[var(--background)] border border-[var(--border)] text-xs font-mono text-[var(--muted-foreground)]">
            <code>temp = arr[{swapA}]; arr[{swapA}] = arr[{swapB}]; arr[{swapB}] = temp;</code>
          </div>
        </Card>

        {/* Boundary Guard & Panic Tester */}
        <Card className="p-5 bg-[var(--card)] border-[var(--border)] space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-4 w-4 text-[var(--warning)]" />
            <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
              Index Boundary Validator
            </h3>
          </div>
          <p className="text-xs text-[var(--muted-foreground)]">
            Test arbitrary indices to observe boundary guard logic: <code className="text-[var(--primary)] font-mono">0 &le; index &lt; {array.length}</code>.
          </p>

          <div className="flex gap-2">
            <input
              type="number"
              value={testIndexInput}
              onChange={(e) => setTestIndexInput(e.target.value)}
              placeholder="e.g. 8 or -1"
              className="flex-1 rounded-[8px] border border-[var(--border)] bg-[var(--background)] px-3 py-1.5 text-xs font-mono text-[var(--foreground)]"
            />
            <Button onClick={handleTestBounds} variant="secondary" size="sm">
              <Search className="h-3.5 w-3.5 mr-1" />
              <span>Verify Access</span>
            </Button>
          </div>

          {boundsResult && (
            <div
              className={`p-3 rounded-[8px] border text-xs ${
                boundsResult.safe
                  ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                  : 'border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)]'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-1 font-mono">
                {boundsResult.safe ? <ShieldCheck className="h-4 w-4" /> : <ShieldAlert className="h-4 w-4" />}
                <span>{boundsResult.safe ? 'SAFE MEMORY ACCESS' : 'MEMORY FAULT / PANIC'}</span>
              </div>
              <p className="font-mono text-[11px] leading-relaxed">{boundsResult.message}</p>
            </div>
          )}
        </Card>
      </div>

      <div className="text-center font-mono text-[11px] text-[var(--muted-foreground)]">
        FIG. 03 · Contiguous memory vector allocation &amp; boundary enforcement
      </div>
    </div>
  );
};
