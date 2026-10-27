import React, { useState, useEffect, useRef } from 'react';
import {
  BraidTrace,
  BraidElement,
  BraidSwapCrossing,
  getPredictTargetForPass,
  PredictTarget,
} from '../lib/braidEngine';
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
  X,
  Info,
  Maximize2,
  Crosshair,
  TrendingDown,
} from 'lucide-react';

interface SortBraidVisualizerProps {
  trace: BraidTrace;
  onAwardXp?: (amount: number) => void;
  onRecordMistake?: (mistake: string) => void;
  onActivePassChange?: (passNumber: number, pseudocodeLine: number) => void;
}

export const SortBraidVisualizer: React.FC<SortBraidVisualizerProps> = ({
  trace,
  onAwardXp,
  onRecordMistake,
  onActivePassChange,
}) => {
  const [activePass, setActivePass] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [speedMultiplier, setSpeedMultiplier] = useState<number>(1);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);
  const [hoveredCrossing, setHoveredCrossing] = useState<BraidSwapCrossing | null>(null);
  const [isPredictMode, setIsPredictMode] = useState<boolean>(false);
  const [predictTarget, setPredictTarget] = useState<PredictTarget | null>(null);
  const [predictResult, setPredictResult] = useState<{ isCorrect: boolean; message: string } | null>(null);
  const [selectedPredictionIndex, setSelectedPredictionIndex] = useState<number | null>(null);

  const playTimerRef = useRef<NodeJS.Timeout | null>(null);

  const totalPasses = trace.totalPasses;
  const numElements = trace.elements.length;

  // Sync active pass changes to parent (e.g. for pseudocode line syncing)
  useEffect(() => {
    const currentPassState = trace.passes[activePass];
    if (currentPassState && onActivePassChange) {
      onActivePassChange(activePass, currentPassState.pseudocodeLine);
    }

    // If Predict First mode is active, set target for upcoming pass
    if (isPredictMode && activePass < totalPasses) {
      const target = getPredictTargetForPass(trace, activePass);
      setPredictTarget(target);
      setPredictResult(null);
      setSelectedPredictionIndex(null);
    } else {
      setPredictTarget(null);
      setPredictResult(null);
    }
  }, [activePass, trace, isPredictMode]);

  // Reset when trace changes (new algorithm or array)
  useEffect(() => {
    setActivePass(0);
    setIsPlaying(false);
    setPredictResult(null);
    setSelectedPredictionIndex(null);
  }, [trace]);

  // Playback loop
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setTimeout(() => {
        if (activePass < totalPasses) {
          setActivePass((prev) => {
            const next = prev + 1;
            sound.playSwap();
            return next;
          });
        } else {
          setIsPlaying(false);
          sound.playSuccess();
        }
      }, 1200 / speedMultiplier);
    }

    return () => {
      if (playTimerRef.current) clearTimeout(playTimerRef.current);
    };
  }, [isPlaying, activePass, totalPasses, speedMultiplier]);

  const handleNext = () => {
    if (activePass < totalPasses) {
      sound.playClick();
      setActivePass((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (activePass > 0) {
      sound.playClick();
      setActivePass((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    sound.playClick();
    setIsPlaying(false);
    setActivePass(0);
    setPredictResult(null);
  };

  // Predict First submission handler
  const handleSelectPrediction = (predictedIndex: number) => {
    if (!predictTarget || predictResult) return;

    setSelectedPredictionIndex(predictedIndex);
    const isCorrect = predictedIndex === predictTarget.expectedNextPosition;

    if (isCorrect) {
      sound.playSuccess();
      setPredictResult({
        isCorrect: true,
        message: `Accurate prediction! ${predictTarget.rationale} (+10 XP)`,
      });
      if (onAwardXp) onAwardXp(10);
    } else {
      sound.playError();
      const mistakeMsg = `${trace.algorithm} prediction error: expected index [${predictTarget.expectedNextPosition}], chose [${predictedIndex}].`;
      setPredictResult({
        isCorrect: false,
        message: `Not quite. ${predictTarget.rationale}`,
      });
      if (onRecordMistake) onRecordMistake(mistakeMsg);
    }
  };

  // SVG Geometry Dimensions
  const svgWidth = 860;
  const svgHeight = Math.max(340, numElements * 42 + 70);
  const paddingLeft = 70;
  const paddingRight = 75;
  const paddingTop = 45;
  const paddingBottom = 45;

  const chartWidth = svgWidth - paddingLeft - paddingRight;
  const chartHeight = svgHeight - paddingTop - paddingBottom;

  const passStepX = totalPasses > 0 ? chartWidth / totalPasses : chartWidth;
  const indexStepY = numElements > 1 ? chartHeight / (numElements - 1) : chartHeight;

  const getCoord = (passNum: number, index: number) => {
    const x = paddingLeft + passNum * passStepX;
    const y = paddingTop + index * indexStepY;
    return { x, y };
  };

  const currentPassData = trace.passes[activePass] || trace.passes[0];

  return (
    <div className="space-y-4">
      {/* Top Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[11px] uppercase tracking-wide">
            TRAJECTORY GRAPH
          </Badge>
          <span className="text-xs text-[var(--muted-foreground)]">·</span>
          <span className="font-mono text-xs font-bold text-[var(--primary)]">
            {currentPassData.passTitle} of {totalPasses}
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">·</span>
          <span className="text-xs font-mono text-[var(--muted-foreground)] truncate max-w-md">
            {currentPassData.description}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => {
              sound.playClick();
              setIsPredictMode(!isPredictMode);
            }}
            size="sm"
            variant={isPredictMode ? 'default' : 'outline'}
            className="h-8 gap-1.5 font-mono text-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>Predict First: <strong>{isPredictMode ? 'ON' : 'OFF'}</strong></span>
          </Button>
        </div>
      </div>

      {/* Predict First Socratic Banner */}
      {isPredictMode && predictTarget && (
        <Card className="p-4 bg-[var(--card)] border border-[var(--primary)] lift-up">
          <div className="flex items-center gap-2 mb-2 text-xs font-mono font-bold text-[var(--primary)] uppercase tracking-wide">
            <Sparkles className="h-4 w-4 text-amber-500" />
            <span>{predictTarget.question}</span>
          </div>

          <p className="text-xs text-[var(--muted-foreground)] mb-3">
            Target Element: <strong className="text-[var(--foreground)] font-mono text-sm px-1.5 py-0.5 rounded bg-[var(--muted)]">[{predictTarget.targetElement.initialValue}]</strong> currently at index <strong className="font-mono">[{predictTarget.currentPosition}]</strong>.
          </p>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-mono text-[var(--muted-foreground)] mr-1">Select Landing Index:</span>
            {Array.from({ length: numElements }, (_, idx) => {
              const isSelected = selectedPredictionIndex === idx;
              const isExpected = predictTarget.expectedNextPosition === idx;
              let btnClass = 'border-[var(--border)] bg-[var(--background)] text-[var(--foreground)] hover:border-[var(--primary)]';

              if (predictResult) {
                if (isExpected) {
                  btnClass = 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] font-bold';
                } else if (isSelected && !isExpected) {
                  btnClass = 'border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)]';
                }
              } else if (isSelected) {
                btnClass = 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)]';
              }

              return (
                <button
                  key={idx}
                  disabled={Boolean(predictResult)}
                  onClick={() => handleSelectPrediction(idx)}
                  className={`w-9 h-8 rounded-[6px] border font-mono text-xs font-semibold transition-all ${btnClass}`}
                >
                  [{idx}]
                </button>
              );
            })}
          </div>

          {predictResult && (
            <div className={`mt-3 text-xs font-mono flex items-center gap-2 ${
              predictResult.isCorrect ? 'text-[var(--primary)] font-bold' : 'text-[var(--destructive)]'
            }`}>
              {predictResult.isCorrect ? <Check className="h-4 w-4" /> : <X className="h-4 w-4" />}
              <span>{predictResult.message}</span>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  handleNext();
                }}
                className="ml-auto font-mono text-xs h-7"
              >
                Reveal Pass &rarr;
              </Button>
            </div>
          )}
        </Card>
      )}

      {/* SVG Canvas Container */}
      <div className="relative rounded-[10px] border border-[var(--border)] bg-[var(--card)] p-2 sm:p-4 overflow-hidden select-none">
        {/* Figure Caption - Required Exact String */}
        <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-[var(--muted-foreground)] border-b border-[var(--border)] mb-2">
          <span className="font-bold text-[var(--foreground)]">FIG. 02 · Element journeys across passes</span>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[var(--primary)] inline-block" />
              Finalized/Sorted
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rotate-45 bg-[var(--destructive)] inline-block" />
              Swap Crossing
            </span>
          </div>
        </div>

        {/* Responsive Scalable SVG Canvas */}
        <div className="w-full overflow-x-auto min-w-0">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-auto max-h-[520px] font-mono"
            style={{ minWidth: '600px' }}
          >
            {/* Grid Lines for Y indices */}
            {Array.from({ length: numElements }, (_, idx) => {
              const y = paddingTop + idx * indexStepY;
              return (
                <g key={`grid-y-${idx}`}>
                  <line
                    x1={paddingLeft - 10}
                    y1={y}
                    x2={svgWidth - paddingRight + 10}
                    y2={y}
                    stroke="currentColor"
                    className="text-[var(--border)]"
                    strokeWidth="1"
                    strokeDasharray="2 4"
                    opacity="0.6"
                  />
                  {/* Left Index Label */}
                  <text
                    x={paddingLeft - 20}
                    y={y + 4}
                    textAnchor="end"
                    fontSize="11"
                    className="fill-[var(--muted-foreground)] font-mono"
                  >
                    Index [{idx}]
                  </text>
                </g>
              );
            })}

            {/* Grid Columns for Passes */}
            {Array.from({ length: totalPasses + 1 }, (_, p) => {
              const x = paddingLeft + p * passStepX;
              const isCurrent = p === activePass;

              return (
                <g key={`grid-p-${p}`}>
                  <line
                    x1={x}
                    y1={paddingTop - 15}
                    x2={x}
                    y2={svgHeight - paddingBottom + 15}
                    stroke="currentColor"
                    className={isCurrent ? 'text-[var(--primary)]' : 'text-[var(--border)]'}
                    strokeWidth={isCurrent ? '2' : '1'}
                    strokeDasharray={isCurrent ? 'none' : '3 3'}
                    opacity={isCurrent ? '1' : '0.4'}
                  />
                  {/* Pass Header Label */}
                  <text
                    x={x}
                    y={paddingTop - 24}
                    textAnchor="middle"
                    fontSize="10"
                    fontWeight={isCurrent ? 'bold' : 'normal'}
                    className={isCurrent ? 'fill-[var(--primary)]' : 'fill-[var(--muted-foreground)]'}
                  >
                    {p === 0 ? 'Pass 0 (Init)' : `Pass ${p}`}
                  </text>
                </g>
              );
            })}

            {/* Active Pass Scanline Highlight Region */}
            {activePass > 0 && (
              <rect
                x={paddingLeft + (activePass - 1) * passStepX}
                y={paddingTop - 10}
                width={passStepX}
                height={chartHeight + 20}
                fill="currentColor"
                className="text-[var(--primary)]"
                opacity="0.04"
              />
            )}

            {/* Trajectory Curves for each element */}
            {trace.trajectories.map((traj) => {
              const isHovered = hoveredElementId === traj.element.id;
              const isAnyHovered = Boolean(hoveredElementId);
              const opacity = isAnyHovered ? (isHovered ? 1 : 0.2) : 0.85;
              const strokeWidth = isHovered ? 4 : 2.5;

              // Build smooth cubic bezier path string
              let pathD = '';
              for (let p = 0; p < totalPasses; p++) {
                const posA = traj.positions[p];
                const posB = traj.positions[p + 1];
                if (!posA || !posB) continue;

                const ptA = getCoord(p, posA.index);
                const ptB = getCoord(p + 1, posB.index);

                if (p === 0) {
                  pathD += `M ${ptA.x} ${ptA.y} `;
                }

                // Control points for smooth organic S-curve
                const midX = (ptA.x + ptB.x) / 2;
                pathD += `C ${midX} ${ptA.y}, ${midX} ${ptB.y}, ${ptB.x} ${ptB.y} `;
              }

              return (
                <g
                  key={traj.element.id}
                  onMouseEnter={() => setHoveredElementId(traj.element.id)}
                  onMouseLeave={() => setHoveredElementId(null)}
                  className="cursor-pointer transition-opacity duration-200"
                  opacity={opacity}
                >
                  {/* Wide invisible path for easy hover targeting */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke="transparent"
                    strokeWidth="16"
                  />

                  {/* Main Colorful Trajectory Spline */}
                  <path
                    d={pathD}
                    fill="none"
                    stroke={traj.color}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                  />

                  {/* Nodes at each pass position */}
                  {traj.positions.map((pos) => {
                    const pt = getCoord(pos.passNumber, pos.index);
                    const isPassed = pos.passNumber <= activePass;

                    return (
                      <g key={`${traj.element.id}-${pos.passNumber}`}>
                        <circle
                          cx={pt.x}
                          cy={pt.y}
                          r={isHovered ? 5.5 : pos.isFinalized ? 4.5 : 3.5}
                          fill={pos.isFinalized ? '#3B7A57' : traj.color}
                          stroke="#FBFAF5"
                          strokeWidth="1.5"
                          opacity={isPassed ? 1 : 0.4}
                        />

                        {/* Finalized Checkmark Icon indicator */}
                        {pos.isFinalized && (
                          <circle
                            cx={pt.x}
                            cy={pt.y}
                            r="7.5"
                            fill="none"
                            stroke="#3B7A57"
                            strokeWidth="1.5"
                            strokeDasharray="2 2"
                          />
                        )}
                      </g>
                    );
                  })}

                  {/* Left Start Value Badge */}
                  {(() => {
                    const startPt = getCoord(0, traj.positions[0].index);
                    return (
                      <g>
                        <rect
                          x={startPt.x - 42}
                          y={startPt.y - 10}
                          width="28"
                          height="20"
                          rx="4"
                          fill={traj.color}
                          stroke="#FBFAF5"
                          strokeWidth="1"
                        />
                        <text
                          x={startPt.x - 28}
                          y={startPt.y + 4}
                          textAnchor="middle"
                          fill="#FBFAF5"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {traj.element.initialValue}
                        </text>
                      </g>
                    );
                  })()}

                  {/* Right End Sorted Value Badge */}
                  {(() => {
                    const endPos = traj.positions[traj.positions.length - 1];
                    const endPt = getCoord(totalPasses, endPos.index);
                    return (
                      <g>
                        <rect
                          x={endPt.x + 14}
                          y={endPt.y - 10}
                          width="28"
                          height="20"
                          rx="4"
                          fill={traj.color}
                          stroke="#FBFAF5"
                          strokeWidth="1"
                        />
                        <text
                          x={endPt.x + 28}
                          y={endPt.y + 4}
                          textAnchor="middle"
                          fill="#FBFAF5"
                          fontSize="10"
                          fontWeight="bold"
                        >
                          {traj.element.initialValue}
                        </text>
                      </g>
                    );
                  })()}
                </g>
              );
            })}

            {/* Swap Crossing Markers (Ticks & Diamonds) */}
            {trace.crossings.map((crossing, cIdx) => {
              if (crossing.passNumber > activePass && !isPlaying) return null;

              // Calculate approximate midpoint of swap crossing between pass p-1 and p
              const ptA1 = getCoord(crossing.passNumber - 1, crossing.fromIndexA);
              const ptB1 = getCoord(crossing.passNumber - 1, crossing.fromIndexB);
              const ptA2 = getCoord(crossing.passNumber, crossing.toIndexA);
              const ptB2 = getCoord(crossing.passNumber, crossing.toIndexB);

              const crossX = (ptA1.x + ptA2.x) / 2;
              const crossY = (ptA1.y + ptA2.y) / 2;

              const isHovered = hoveredCrossing === crossing;

              return (
                <g
                  key={`cross-${cIdx}`}
                  onMouseEnter={() => setHoveredCrossing(crossing)}
                  onMouseLeave={() => setHoveredCrossing(null)}
                  className="cursor-pointer"
                >
                  {/* Crossing Tick Diamond Marker */}
                  <polygon
                    points={`${crossX},${crossY - 5} ${crossX + 5},${crossY} ${crossX},${crossY + 5} ${crossX - 5},${crossY}`}
                    fill="#C8412F"
                    stroke="#FBFAF5"
                    strokeWidth="1"
                    className="hover:scale-125 transition-transform"
                  />
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hover Crossing Tooltip */}
        {hoveredCrossing && (
          <div className="absolute bottom-4 right-4 bg-[#0E0F0C]/90 text-[#ECEBE3] p-2.5 rounded-[8px] border border-[var(--border)] text-xs font-mono shadow-xl max-w-xs z-30 lift-up">
            <div className="font-bold text-[var(--primary)] flex items-center gap-1.5 mb-1">
              <TrendingDown className="h-3.5 w-3.5 text-[var(--destructive)]" />
              <span>Swap in Pass {hoveredCrossing.passNumber}</span>
            </div>
            <div>
              Swapped <strong>{hoveredCrossing.elementA.initialValue}</strong> &amp; <strong>{hoveredCrossing.elementB.initialValue}</strong>
            </div>
            <div className="text-[10px] text-[var(--muted-foreground)] mt-0.5">
              Reason: {hoveredCrossing.reason}
            </div>
          </div>
        )}
      </div>

      {/* Scrubbing & Playback Controls Bar */}
      <Card className="p-4 bg-[var(--card)] flex flex-col sm:flex-row items-center justify-between gap-4 border border-[var(--border)]">
        {/* Playback Button Group */}
        <div className="flex items-center gap-2">
          <Button
            onClick={handleReset}
            variant="outline"
            size="icon"
            title="Reset to Pass 0"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            onClick={handlePrev}
            disabled={activePass === 0}
            variant="outline"
            size="icon"
            title="Previous Pass"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            onClick={() => {
              sound.playClick();
              setIsPlaying(!isPlaying);
            }}
            variant="default"
            size="sm"
            className="gap-1.5 font-mono text-xs px-4"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY JOURNEY'}</span>
          </Button>

          <Button
            onClick={handleNext}
            disabled={activePass >= totalPasses}
            variant="outline"
            size="icon"
            title="Next Pass"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Pass Timeline Scrubber */}
        <div className="flex-1 max-w-md w-full flex items-center gap-3">
          <span className="font-mono text-xs text-[var(--muted-foreground)] shrink-0">Scrubber:</span>
          <input
            type="range"
            min="0"
            max={totalPasses}
            value={activePass}
            onChange={(e) => {
              setActivePass(Number(e.target.value));
              sound.playClick();
            }}
            className="w-full accent-[var(--primary)] bg-[var(--muted)] h-1.5 rounded cursor-pointer"
          />
          <span className="font-mono text-xs font-bold text-[var(--foreground)] shrink-0 tabular-nums">
            {activePass} / {totalPasses}
          </span>
        </div>

        {/* Speed Multiplier Controls */}
        <div className="flex items-center gap-1 text-xs font-mono text-[var(--muted-foreground)]">
          <span className="mr-1">Speed:</span>
          {[0.5, 1, 2, 4].map((s) => (
            <button
              key={s}
              onClick={() => {
                sound.playClick();
                setSpeedMultiplier(s);
              }}
              className={`px-2 py-1 rounded-[6px] border text-xs transition-colors ${
                speedMultiplier === s
                  ? 'border-[var(--foreground)] bg-[var(--foreground)] text-[var(--background)] font-bold'
                  : 'border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] bg-[var(--background)]'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};
