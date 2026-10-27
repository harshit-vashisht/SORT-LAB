import React, { useState, useEffect } from 'react';
import { SortStep } from '../types';
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
  ArrowUpDown,
  CircleDot,
  CheckCircle2,
  TrendingDown,
  Info,
} from 'lucide-react';

interface SortOrbitVisualizerProps {
  currentStep: SortStep;
  steps: SortStep[];
  stepIndex: number;
  totalSteps: number;
  isPlaying: boolean;
  speedMultiplier: number;
  isPredictMode: boolean;
  predictFeedback: { isCorrect: boolean; text: string } | null;
  algorithm: 'bubble-sort' | 'selection-sort' | 'insertion-sort';
  onNextStep: () => void;
  onPrevStep: () => void;
  onReset: () => void;
  onTogglePlay: () => void;
  onSetStepIndex: (index: number) => void;
  onSetSpeedMultiplier: (speed: number) => void;
  onTogglePredictMode: () => void;
  onPredictChoice: (userSaysSwap: boolean) => void;
  onAwardXp?: (amount: number) => void;
  onRecordMistake?: (mistake: string) => void;
}

export const SortOrbitVisualizer: React.FC<SortOrbitVisualizerProps> = ({
  currentStep,
  steps,
  stepIndex,
  totalSteps,
  isPlaying,
  speedMultiplier,
  isPredictMode,
  predictFeedback,
  algorithm,
  onNextStep,
  onPrevStep,
  onReset,
  onTogglePlay,
  onSetStepIndex,
  onSetSpeedMultiplier,
  onTogglePredictMode,
  onPredictChoice,
}) => {
  const [hoveredNodeIndex, setHoveredNodeIndex] = useState<number | null>(null);

  const array = currentStep.array;
  const n = array.length;
  const comparedIndices: number[] = (currentStep.indices as number[]) || [];
  const sortedIndices: number[] = (currentStep.sortedIndices as number[]) || [];

  // SVG Geometry Dimensions
  const svgWidth = 600;
  const svgHeight = 600;
  const cx = 300;
  const cy = 300;
  const orbitRadius = 200;
  const nodeRadius = 24;

  // Calculate polar coordinates for each node index
  const getNodePosition = (index: number) => {
    // Angle starting at -90 degrees (12 o'clock) and going clockwise
    const angle = -Math.PI / 2 + (2 * Math.PI * index) / n;
    const x = cx + orbitRadius * Math.cos(angle);
    const y = cy + orbitRadius * Math.sin(angle);
    const labelX = cx + (orbitRadius + 40) * Math.cos(angle);
    const labelY = cy + (orbitRadius + 40) * Math.sin(angle);
    return { x, y, angle, labelX, labelY };
  };

  // Identify compared elements
  const isComparing = comparedIndices.length >= 2;
  const idxA = comparedIndices[0];
  const idxB = comparedIndices[1];
  const posA = idxA !== undefined ? getNodePosition(idxA) : null;
  const posB = idxB !== undefined ? getNodePosition(idxB) : null;

  // Values being compared
  const valA = idxA !== undefined ? array[idxA] : null;
  const valB = idxB !== undefined ? array[idxB] : null;

  // Algorithm-specific prompt formulation
  const getPredictPrompt = () => {
    if (!isComparing || valA === null || valB === null) {
      return {
        question: 'Wait for next comparison step to predict.',
        choiceA: 'YES, SWAP ⇄',
        choiceB: 'NO, KEEP IN PLACE ✓',
      };
    }

    if (algorithm === 'bubble-sort') {
      return {
        question: `Will element [${valA}] at [${idxA}] swap with [${valB}] at [${idxB}]?`,
        choiceA: 'YES, SWAP ⇄',
        choiceB: 'NO, KEEP IN PLACE ✓',
      };
    } else if (algorithm === 'selection-sort') {
      if (currentStep.type === 'select_min') {
        return {
          question: `Is [${valA}] the new minimum candidate compared to [${valB}]?`,
          choiceA: 'YES, NEW MINIMUM',
          choiceB: 'NO, RETAIN MINIMUM',
        };
      }
      return {
        question: `Is candidate arr[${idxA}] = [${valA}] smaller than current min arr[${idxB}] = [${valB}]?`,
        choiceA: 'YES, SMALLER (<)',
        choiceB: 'NO, GREATER/EQUAL (>=)',
      };
    } else {
      // insertion sort
      return {
        question: `Will inserting key [${valB}] shift left past element [${valA}]?`,
        choiceA: 'YES, SHIFT LEFT ⇄',
        choiceB: 'NO, INSERT HERE ✓',
      };
    }
  };

  const predictConfig = getPredictPrompt();

  // Draw curved comparison chord path between two compared nodes
  const getComparisonChordD = () => {
    if (!posA || !posB) return '';
    // Midpoint between nodes
    const midX = (posA.x + posB.x) / 2;
    const midY = (posA.y + posB.y) / 2;

    // Pull control point towards center for a graceful interior arc
    const cpX = cx + 0.35 * (midX - cx);
    const cpY = cy + 0.35 * (midY - cy);

    return `M ${posA.x} ${posA.y} Q ${cpX} ${cpY} ${posB.x} ${posB.y}`;
  };

  return (
    <div className="space-y-4">
      {/* Visualizer Status & Meta Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="font-mono text-[11px] uppercase tracking-wide">
            ORBIT VISUALIZER
          </Badge>
          <span className="text-xs text-[var(--muted-foreground)]">·</span>
          <span className="font-mono text-xs font-bold text-[var(--primary)]">
            Pass {currentStep.pass || 1}
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">·</span>
          <span className="font-mono text-xs text-[var(--foreground)]">
            Comparison {currentStep.comparison || 0}
          </span>
          <span className="text-xs text-[var(--muted-foreground)]">·</span>
          <span className="text-xs font-mono text-[var(--muted-foreground)] truncate max-w-xs sm:max-w-md">
            {currentStep.description}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            onClick={() => {
              sound.playClick();
              onTogglePredictMode();
            }}
            size="sm"
            variant={isPredictMode ? 'default' : 'outline'}
            className="h-8 gap-1.5 font-mono text-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>
              Predict First: <strong>{isPredictMode ? 'ON' : 'OFF'}</strong>
            </span>
          </Button>
        </div>
      </div>

      {/* Socratic Predict-First Overlay Banner */}
      {isPredictMode && isComparing && (
        <Card className="p-4 bg-[var(--card)] border border-[var(--primary)] lift-up">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[var(--primary)] uppercase tracking-wider">
              <Sparkles className="h-4 w-4 text-amber-500" />
              <span>Predictive Evaluation: {predictConfig.question}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={() => onPredictChoice(true)}
              size="sm"
              variant="default"
              className="font-mono text-xs"
            >
              {predictConfig.choiceA}
            </Button>
            <Button
              onClick={() => onPredictChoice(false)}
              size="sm"
              variant="secondary"
              className="font-mono text-xs"
            >
              {predictConfig.choiceB}
            </Button>
            {predictFeedback && (
              <span
                className={`text-xs font-mono ml-2 ${
                  predictFeedback.isCorrect
                    ? 'text-[var(--primary)] font-bold'
                    : 'text-[var(--destructive)]'
                }`}
              >
                {predictFeedback.text}
              </span>
            )}
          </div>
        </Card>
      )}

      {/* Main Orbit Circular Canvas Card */}
      <Card className="p-4 bg-[var(--card)] border border-[var(--border)] relative overflow-hidden select-none">
        {/* Caption - Exact required string */}
        <div className="flex items-center justify-between pb-2 text-[11px] font-mono text-[var(--muted-foreground)] border-b border-[var(--border)] mb-3">
          <span className="font-bold text-[var(--foreground)]">
            FIG. 03 · Circular paths through a sorting process
          </span>
          <div className="flex items-center gap-3 text-[10px]">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-[var(--primary)] bg-[var(--primary)]/30 inline-block" />
              Comparing
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full border border-[#3B7A57] bg-[#3B7A57]/30 inline-block" />
              Sorted Lock
            </span>
          </div>
        </div>

        {/* Scalable SVG Circular Orbit Visualization */}
        <div className="w-full flex items-center justify-center py-2 overflow-x-auto min-w-0">
          <svg
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full max-w-[500px] h-auto aspect-square font-mono"
            style={{ minWidth: '320px' }}
          >
            <defs>
              {/* Arrowhead marker for curved directional chords */}
              <marker
                id="orbitArrow"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M 0 2 L 8 5 L 0 8 z" fill="var(--primary)" />
              </marker>

              {/* Marker for swap crossing */}
              <marker
                id="swapMarker"
                viewBox="0 0 10 10"
                refX="6"
                refY="5"
                markerWidth="6"
                markerHeight="6"
                orient="auto-start-reverse"
              >
                <path d="M 0 1.5 L 9 5 L 0 8.5 z" fill="#C8412F" />
              </marker>

              {/* Center Hub Gradient */}
              <radialGradient id="centerHubGrad" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="var(--card)" stopOpacity="1" />
                <stop offset="100%" stopColor="var(--background)" stopOpacity="0.85" />
              </radialGradient>
            </defs>

            {/* Concentric Guide Rings */}
            <circle
              cx={cx}
              cy={cy}
              r={orbitRadius + 40}
              fill="none"
              stroke="var(--border)"
              strokeWidth="0.75"
              strokeDasharray="2 4"
              opacity="0.35"
            />
            <circle
              cx={cx}
              cy={cy}
              r={orbitRadius}
              fill="none"
              stroke="var(--border)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.7"
            />
            <circle
              cx={cx}
              cy={cy}
              r={orbitRadius - 40}
              fill="none"
              stroke="var(--border)"
              strokeWidth="0.75"
              strokeDasharray="2 4"
              opacity="0.25"
            />

            {/* Radial Spoke Ticks from Center to Ring */}
            {Array.from({ length: n }, (_, i) => {
              const pos = getNodePosition(i);
              return (
                <line
                  key={`spoke-${i}`}
                  x1={cx + 80 * Math.cos(pos.angle)}
                  y1={cy + 80 * Math.sin(pos.angle)}
                  x2={cx + (orbitRadius - 30) * Math.cos(pos.angle)}
                  y2={cy + (orbitRadius - 30) * Math.sin(pos.angle)}
                  stroke="var(--border)"
                  strokeWidth="0.75"
                  strokeDasharray="1 3"
                  opacity="0.4"
                />
              );
            })}

            {/* Comparison Chord Line across Orbit */}
            {isComparing && posA && posB && (
              <g>
                {/* Glowing underlay line */}
                <path
                  d={getComparisonChordD()}
                  fill="none"
                  stroke={currentStep.type === 'swap' ? '#C8412F' : 'var(--primary)'}
                  strokeWidth={currentStep.type === 'swap' ? '4' : '3'}
                  strokeDasharray={currentStep.type === 'swap' ? 'none' : '4 4'}
                  opacity="0.85"
                  className={currentStep.type === 'swap' ? 'animate-pulse' : ''}
                />

                {/* Swap Bidirectional Flow Curve */}
                {currentStep.type === 'swap' && (
                  <path
                    d={getComparisonChordD()}
                    fill="none"
                    stroke="#C8412F"
                    strokeWidth="2"
                    markerEnd="url(#swapMarker)"
                    markerStart="url(#swapMarker)"
                  />
                )}
              </g>
            )}

            {/* Center Readout Hub Circle */}
            <circle
              cx={cx}
              cy={cy}
              r={72}
              fill="url(#centerHubGrad)"
              stroke="var(--border)"
              strokeWidth="1.5"
              className="shadow-inner"
            />

            {/* Center Readout Content */}
            <g className="text-center select-none pointer-events-none">
              <text
                x={cx}
                y={cy - 36}
                textAnchor="middle"
                fontSize="9"
                fontFamily="monospace"
                fontWeight="bold"
                className="fill-[var(--muted-foreground)] uppercase tracking-wider"
              >
                PASS {currentStep.pass || 1} · {algorithm.split('-')[0].toUpperCase()}
              </text>

              {/* Main Center Comparison Operator / Status */}
              {isComparing && valA !== null && valB !== null ? (
                <>
                  <text
                    x={cx}
                    y={cy - 12}
                    textAnchor="middle"
                    fontSize="13"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="fill-[var(--foreground)]"
                  >
                    [{valA}] {valA > valB ? '>' : valA < valB ? '<' : '=='} [{valB}]
                  </text>
                  <text
                    x={cx}
                    y={cy + 8}
                    textAnchor="middle"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className={
                      currentStep.type === 'swap'
                        ? 'fill-[var(--destructive)]'
                        : 'fill-[var(--primary)]'
                    }
                  >
                    {currentStep.type === 'swap'
                      ? '⇄ SWAP IN-PLACE'
                      : currentStep.type === 'select_min'
                      ? '★ NEW MINIMUM'
                      : '✓ MAINTAIN ORDER'}
                  </text>
                </>
              ) : currentStep.type === 'sorted' ? (
                <>
                  <text
                    x={cx}
                    y={cy - 8}
                    textAnchor="middle"
                    fontSize="14"
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill="#3B7A57"
                  >
                    ✓ SORTED
                  </text>
                  <text
                    x={cx}
                    y={cy + 10}
                    textAnchor="middle"
                    fontSize="10"
                    fontFamily="monospace"
                    className="fill-[var(--muted-foreground)]"
                  >
                    All Invariants Met
                  </text>
                </>
              ) : (
                <>
                  <text
                    x={cx}
                    y={cy - 8}
                    textAnchor="middle"
                    fontSize="12"
                    fontFamily="monospace"
                    fontWeight="bold"
                    className="fill-[var(--primary)]"
                  >
                    STEP {stepIndex + 1}/{totalSteps}
                  </text>
                  <text
                    x={cx}
                    y={cy + 10}
                    textAnchor="middle"
                    fontSize="10"
                    fontFamily="monospace"
                    className="fill-[var(--muted-foreground)]"
                  >
                    Invariants Active
                  </text>
                </>
              )}

              {/* Secondary Coordinates Label */}
              <text
                x={cx}
                y={cy + 34}
                textAnchor="middle"
                fontSize="9"
                fontFamily="monospace"
                className="fill-[var(--muted-foreground)]"
              >
                {isComparing ? `arr[${idxA}] ⟷ arr[${idxB}]` : `N = ${n} Elements`}
              </text>
            </g>

            {/* Orbit Node Elements around the circle */}
            {array.map((val, idx) => {
              const pos = getNodePosition(idx);
              const isCompared = comparedIndices.includes(idx);
              const isSorted = sortedIndices.includes(idx);
              const isHovered = hoveredNodeIndex === idx;

              // Compute color / visual state
              let nodeStroke = 'var(--border)';
              let nodeFill = 'var(--card)';
              let textColor = 'var(--foreground)';

              if (isCompared) {
                if (currentStep.type === 'swap') {
                  nodeStroke = '#C8412F';
                  nodeFill = 'rgba(200, 65, 47, 0.15)';
                  textColor = '#C8412F';
                } else {
                  nodeStroke = 'var(--primary)';
                  nodeFill = 'rgba(89, 115, 70, 0.15)';
                  textColor = 'var(--primary)';
                }
              } else if (isSorted) {
                nodeStroke = '#3B7A57';
                nodeFill = 'rgba(59, 122, 87, 0.15)';
                textColor = '#3B7A57';
              }

              return (
                <g
                  key={`node-${idx}`}
                  onMouseEnter={() => setHoveredNodeIndex(idx)}
                  onMouseLeave={() => setHoveredNodeIndex(null)}
                  className="cursor-pointer transition-all duration-300"
                  style={{
                    transformOrigin: `${pos.x}px ${pos.y}px`,
                  }}
                >
                  {/* Subtle Comparison Pulsing Aura */}
                  {isCompared && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeRadius + 6}
                      fill="none"
                      stroke={currentStep.type === 'swap' ? '#C8412F' : 'var(--primary)'}
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                      className="animate-pulse"
                      opacity="0.8"
                    />
                  )}

                  {/* Node Outer Body Circle */}
                  <circle
                    cx={pos.x}
                    cy={pos.y}
                    r={isHovered ? nodeRadius + 3 : nodeRadius}
                    fill={nodeFill}
                    stroke={nodeStroke}
                    strokeWidth={isCompared ? '2.5' : isSorted ? '2' : '1.5'}
                    className="transition-all duration-300"
                  />

                  {/* Double Ring for Sorted Nodes */}
                  {isSorted && (
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={nodeRadius - 4}
                      fill="none"
                      stroke="#3B7A57"
                      strokeWidth="1"
                      strokeDasharray="2 2"
                      opacity="0.7"
                    />
                  )}

                  {/* Element Value Text */}
                  <text
                    x={pos.x}
                    y={pos.y + 4.5}
                    textAnchor="middle"
                    fontSize="13"
                    fontFamily="monospace"
                    fontWeight="bold"
                    fill={textColor}
                    className="select-none pointer-events-none tabular-nums"
                  >
                    {val}
                  </text>

                  {/* Array Index Label Outside the Node */}
                  <text
                    x={pos.labelX}
                    y={pos.labelY + 4}
                    textAnchor="middle"
                    fontSize="10"
                    fontFamily="monospace"
                    fontWeight="600"
                    className="fill-[var(--muted-foreground)] select-none pointer-events-none"
                  >
                    [{idx}]
                  </text>

                  {/* Sorted Green Checkmark Badge Indicator */}
                  {isSorted && (
                    <g transform={`translate(${pos.x + 13}, ${pos.y - 19})`}>
                      <circle cx="6" cy="6" r="6.5" fill="#3B7A57" stroke="var(--card)" strokeWidth="1" />
                      <path
                        d="M 3.5 6.5 L 5 8 L 8.5 4"
                        fill="none"
                        stroke="#FBFAF5"
                        strokeWidth="1.25"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </g>
                  )}

                  {/* Pointer Comparison Indicator for active nodes */}
                  {isCompared && (
                    <g transform={`translate(${pos.x - 7}, ${pos.y + 26})`}>
                      <text
                        x="7"
                        y="8"
                        textAnchor="middle"
                        fontSize="9"
                        fontWeight="bold"
                        fill={currentStep.type === 'swap' ? '#C8412F' : 'var(--primary)'}
                      >
                        {currentStep.type === 'swap' ? 'SWAP' : 'COMP'}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Hovered Node Tooltip Detail */}
        {hoveredNodeIndex !== null && (
          <div className="text-center font-mono text-xs text-[var(--muted-foreground)] pt-2 border-t border-[var(--border)]">
            Inspecting Index <strong className="text-[var(--foreground)]">[{hoveredNodeIndex}]</strong>: Value{' '}
            <strong className="text-[var(--primary)]">{array[hoveredNodeIndex]}</strong> ·{' '}
            {sortedIndices.includes(hoveredNodeIndex)
              ? 'Finalized in Sorted Order'
              : 'Unsorted or in transit'}
          </div>
        )}
      </Card>

      {/* Scrubbing & Playback Controls Bar */}
      <Card className="p-4 bg-[var(--card)] flex flex-col sm:flex-row items-center justify-between gap-4 border border-[var(--border)]">
        {/* Playback Buttons */}
        <div className="flex items-center gap-2">
          <Button
            onClick={onReset}
            variant="outline"
            size="icon"
            title="Reset to Step 1"
          >
            <RotateCcw className="h-4 w-4" />
          </Button>

          <Button
            onClick={onPrevStep}
            disabled={stepIndex === 0}
            variant="outline"
            size="icon"
            title="Previous Step"
          >
            <SkipBack className="h-4 w-4" />
          </Button>

          <Button
            onClick={onTogglePlay}
            variant="default"
            size="sm"
            className="gap-1.5 font-mono text-xs px-4"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span>{isPlaying ? 'PAUSE' : 'PLAY ORBIT'}</span>
          </Button>

          <Button
            onClick={onNextStep}
            disabled={stepIndex >= totalSteps - 1}
            variant="outline"
            size="icon"
            title="Next Step"
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>

        {/* Step Scrubber Slider */}
        <div className="flex-1 max-w-md w-full flex items-center gap-3">
          <span className="font-mono text-xs text-[var(--muted-foreground)] shrink-0">
            Scrubber:
          </span>
          <input
            type="range"
            min="0"
            max={Math.max(totalSteps - 1, 0)}
            value={stepIndex}
            onChange={(e) => {
              onSetStepIndex(Number(e.target.value));
              sound.playClick();
            }}
            className="w-full accent-[var(--primary)] bg-[var(--muted)] h-1.5 rounded cursor-pointer"
          />
          <span className="font-mono text-xs font-bold text-[var(--foreground)] shrink-0 tabular-nums">
            {stepIndex + 1} / {totalSteps || 1}
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
                onSetSpeedMultiplier(s);
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
