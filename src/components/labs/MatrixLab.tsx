import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { sound } from '../../lib/soundEngine';
import { Play, Pause, RotateCcw, Grid, Compass, Hash } from 'lucide-react';

interface MatrixLabProps {
  onAwardXp?: (amount: number) => void;
  onRequestMentorContext?: (ctx: any) => void;
}

const ROWS = 3;
const COLS = 4;

export const MatrixLab: React.FC<MatrixLabProps> = ({ onAwardXp }) => {
  const [matrix, setMatrix] = useState<number[][]>([
    [12, 45, 78, 23],
    [56, 89, 34, 67],
    [90, 11, 44, 88],
  ]);

  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [highlightMode, setHighlightMode] = useState<'cell' | 'row' | 'col' | 'diagonal' | 'traversal'>('cell');
  const [traversalIndex, setTraversalIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const totalCells = ROWS * COLS;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Auto traversal loop
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setTimeout(() => {
        setTraversalIndex(prev => {
          const next = prev + 1;
          if (next >= totalCells) {
            setIsPlaying(false);
            sound.playSuccess();
            if (onAwardXp) onAwardXp(20);
            return 0;
          }
          const nextR = Math.floor(next / COLS);
          const nextC = next % COLS;
          setSelectedCell({ r: nextR, c: nextC });
          sound.playClick();
          return next;
        });
      }, 400);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isPlaying, traversalIndex, totalCells, onAwardXp]);

  const handleCellClick = (r: number, c: number) => {
    sound.playClick();
    setSelectedCell({ r, c });
    setHighlightMode('cell');
    setIsPlaying(false);
  };

  const handleStartTraversal = () => {
    sound.playClick();
    setHighlightMode('traversal');
    setTraversalIndex(0);
    setSelectedCell({ r: 0, c: 0 });
    setIsPlaying(true);
  };

  const flatIndex = selectedCell.r * COLS + selectedCell.c;
  const cellValue = matrix[selectedCell.r][selectedCell.c];

  return (
    <div className="space-y-6 lift-up">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--muted-foreground)] uppercase tracking-wider">
            <span>LAB 03 / MULTI-DIMENSIONAL</span>
            <span>·</span>
            <span>2D MATRICES &amp; COORDINATE LATTICES</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            Matrix Lab: <span className="font-serif-italic text-[var(--primary)]">Lattices</span> &amp; Nested Loops
          </h2>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-2xl mt-1">
            Explore 2D coordinate spaces [row][col], row-major memory mapping, and nested loop iterations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="font-mono text-xs">
            DIMENSIONS: {ROWS} &times; {COLS} (12 CELLS)
          </Badge>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: 2D Matrix Grid Display */}
        <div className="lg:col-span-7 space-y-4">
          <Card className="p-6 bg-[var(--card)] border-[var(--border)] space-y-5">
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)]">
                2D Array Coordinate Canvas
              </span>
              <span className="font-mono text-xs text-[var(--primary)] font-bold">
                [{selectedCell.r}][{selectedCell.c}] = {cellValue}
              </span>
            </div>

            {/* Matrix Visual Table */}
            <div className="overflow-x-auto pb-2">
              <div className="min-w-[420px] mx-auto flex flex-col items-center">
                {/* Column Headers */}
                <div className="flex items-center gap-3 mb-2 ml-10">
                  {Array.from({ length: COLS }).map((_, c) => (
                    <div key={c} className="w-16 text-center font-mono text-[11px] text-[var(--muted-foreground)]">
                      col {c}
                    </div>
                  ))}
                </div>

                {/* Matrix Rows */}
                {matrix.map((rowArr, r) => (
                  <div key={r} className="flex items-center gap-3 mb-3">
                    {/* Row Label */}
                    <div className="w-7 text-right font-mono text-[11px] text-[var(--muted-foreground)]">
                      r {r}
                    </div>

                    {/* Row Cells */}
                    {rowArr.map((val, c) => {
                      const isSelected = selectedCell.r === r && selectedCell.c === c;
                      const isRowHighlight = highlightMode === 'row' && selectedCell.r === r;
                      const isColHighlight = highlightMode === 'col' && selectedCell.c === c;
                      const isDiagonal = highlightMode === 'diagonal' && r === c;

                      let cellStyle = 'border-[var(--border)] bg-[var(--background)] text-[var(--foreground)]';
                      if (isSelected) {
                        cellStyle = 'border-[var(--primary)] bg-[var(--primary)]/20 text-[var(--primary)] font-bold scale-105 shadow-sm';
                      } else if (isRowHighlight || isColHighlight || isDiagonal) {
                        cellStyle = 'border-[var(--accent)] bg-[var(--accent)]/10 text-[var(--foreground)]';
                      }

                      return (
                        <button
                          key={c}
                          onClick={() => handleCellClick(r, c)}
                          className={`w-16 h-14 rounded-[8px] flex flex-col items-center justify-center font-mono border transition-all cursor-pointer ${cellStyle}`}
                        >
                          <span className="text-base font-bold tabular-nums">{val}</span>
                          <span className="text-[9px] text-[var(--muted-foreground)]">[{r}][{c}]</span>
                        </button>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Traversal Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-[var(--border)]">
              <div className="flex items-center gap-2">
                <Button
                  onClick={isPlaying ? () => setIsPlaying(false) : handleStartTraversal}
                  variant={isPlaying ? 'secondary' : 'default'}
                  size="sm"
                  className="flex items-center gap-1.5"
                >
                  {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                  <span>{isPlaying ? 'Pause Scan' : 'Run Row-Major Scan'}</span>
                </Button>

                <Button
                  onClick={() => {
                    setIsPlaying(false);
                    setSelectedCell({ r: 0, c: 0 });
                    setHighlightMode('cell');
                    setTraversalIndex(0);
                  }}
                  variant="secondary"
                  size="sm"
                >
                  <RotateCcw className="h-3.5 w-3.5 mr-1" />
                  <span>Reset</span>
                </Button>
              </div>

              {/* View Modes */}
              <div className="flex items-center gap-1 bg-[var(--muted)]/50 p-0.5 rounded-[8px] border border-[var(--border)] text-xs font-mono">
                <button
                  onClick={() => setHighlightMode('cell')}
                  className={`px-2 py-1 rounded-[6px] ${highlightMode === 'cell' ? 'bg-[var(--card)] text-[var(--foreground)] font-bold' : 'text-[var(--muted-foreground)]'}`}
                >
                  Cell
                </button>
                <button
                  onClick={() => setHighlightMode('row')}
                  className={`px-2 py-1 rounded-[6px] ${highlightMode === 'row' ? 'bg-[var(--card)] text-[var(--foreground)] font-bold' : 'text-[var(--muted-foreground)]'}`}
                >
                  Row
                </button>
                <button
                  onClick={() => setHighlightMode('col')}
                  className={`px-2 py-1 rounded-[6px] ${highlightMode === 'col' ? 'bg-[var(--card)] text-[var(--foreground)] font-bold' : 'text-[var(--muted-foreground)]'}`}
                >
                  Col
                </button>
                <button
                  onClick={() => setHighlightMode('diagonal')}
                  className={`px-2 py-1 rounded-[6px] ${highlightMode === 'diagonal' ? 'bg-[var(--card)] text-[var(--foreground)] font-bold' : 'text-[var(--muted-foreground)]'}`}
                >
                  Diagonal
                </button>
              </div>
            </div>
          </Card>
        </div>

        {/* Right: Nested Loop Inspector & Memory Addressing */}
        <div className="lg:col-span-5 space-y-4">
          {/* Nested Loop Code Card */}
          <Card className="p-5 bg-[var(--card)] border-[var(--border)] space-y-4">
            <span className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--muted-foreground)] block">
              Nested Loop Traversal Syntax
            </span>

            <div className="rounded-[8px] bg-[var(--background)] p-4 font-mono text-xs border border-[var(--border)] space-y-1">
              <div className={`px-2 py-0.5 rounded-[4px] ${highlightMode === 'row' || highlightMode === 'traversal' ? 'bg-[var(--primary)]/15 text-[var(--primary)] font-bold' : 'text-[var(--foreground)]'}`}>
                <span className="text-[var(--primary)]">for</span> (let r = 0; r &lt; {ROWS}; r++) &#123;
              </div>
              <div className={`pl-4 px-2 py-0.5 rounded-[4px] ${highlightMode === 'col' || highlightMode === 'traversal' ? 'bg-[var(--primary)]/15 text-[var(--primary)] font-bold' : 'text-[var(--foreground)]'}`}>
                <span className="text-[var(--primary)]">for</span> (let c = 0; c &lt; {COLS}; c++) &#123;
              </div>
              <div className="pl-8 text-[var(--muted-foreground)]">
                visit(grid[r][c]); // [{selectedCell.r}][{selectedCell.c}]
              </div>
              <div className="pl-4 text-[var(--foreground)]">&#125;</div>
              <div className="text-[var(--foreground)]">&#125;</div>
            </div>

            <div className="text-xs text-[var(--muted-foreground)] leading-relaxed">
              Row-major order traverses all columns <code className="text-[var(--foreground)] font-mono">c</code> for row 0, then increments <code className="text-[var(--foreground)] font-mono">r</code> to row 1. Total iterations = <strong className="text-[var(--foreground)] font-mono">{ROWS} &times; {COLS} = {totalCells}</strong>.
            </div>
          </Card>

          {/* Flat 1D Heap Mapping Equation */}
          <Card className="p-5 bg-[var(--card)] border-[var(--border)] space-y-3">
            <div className="flex items-center gap-2">
              <Hash className="h-4 w-4 text-[var(--primary)]" />
              <h3 className="font-mono text-xs font-semibold uppercase tracking-wider text-[var(--foreground)]">
                Row-Major Memory Offset Equation
              </h3>
            </div>

            <div className="p-3 rounded-[8px] bg-[var(--background)] border border-[var(--border)] font-mono text-xs text-[var(--foreground)]">
              <div>index = (r &times; COLS) + c</div>
              <div className="text-[var(--primary)] font-bold mt-1">
                index = ({selectedCell.r} &times; {COLS}) + {selectedCell.c} = {flatIndex}
              </div>
            </div>

            <p className="text-xs text-[var(--muted-foreground)]">
              In computer hardware memory (RAM), 2D matrices are flattened into a single continuous 1D block. Cell <code className="font-mono text-[var(--primary)]">[{selectedCell.r}][{selectedCell.c}]</code> resides at continuous offset <strong className="text-[var(--foreground)] font-mono">{flatIndex}</strong>.
            </p>
          </Card>
        </div>
      </div>

      <div className="text-center font-mono text-[11px] text-[var(--muted-foreground)]">
        FIG. 04 · Row-major coordinate projection &amp; flat linear memory indexation
      </div>
    </div>
  );
};
