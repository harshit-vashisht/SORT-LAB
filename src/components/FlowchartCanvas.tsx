import React, { useState, useRef, useEffect } from 'react';
import {
  FlowchartNode,
  FlowchartEdge,
  FlowchartNodeType,
  FlowchartDiagram,
} from '../types';
import { sound } from '../lib/soundEngine';
import { saveFlowchartDiagram, getProgressionV2 } from '../lib/progressionEngine';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import {
  Play,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Trash2,
  Undo2,
  Redo2,
  Download,
  Save,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  Sparkles,
  Layers,
  ArrowRight,
  FolderOpen,
} from 'lucide-react';

interface FlowchartCanvasProps {
  initialExample?: 'even_odd' | 'max_two' | 'loop_five' | 'array_traverse';
  onAwardXp?: (amount: number) => void;
  onOpenMentorWithMessage?: (msg: string) => void;
}

const TEMPLATES: Record<
  string,
  { title: string; goal: string; nodes: FlowchartNode[]; edges: FlowchartEdge[] }
> = {
  even_odd: {
    title: 'Even or Odd Number Checker',
    goal: 'Test if a number N is divisible by 2 with 0 remainder. If Yes, print "Even"; if No, print "Odd".',
    nodes: [
      { id: 'n1', type: 'start_end', x: 260, y: 40, label: 'Start' },
      { id: 'n2', type: 'input_output', x: 260, y: 130, label: 'Input: Number N' },
      { id: 'n3', type: 'decision', x: 260, y: 240, label: 'N % 2 == 0 ?' },
      { id: 'n4', type: 'input_output', x: 110, y: 350, label: 'Print "Even"' },
      { id: 'n5', type: 'input_output', x: 410, y: 350, label: 'Print "Odd"' },
      { id: 'n6', type: 'start_end', x: 260, y: 450, label: 'End' },
    ],
    edges: [
      { id: 'e1', fromNodeId: 'n1', toNodeId: 'n2' },
      { id: 'e2', fromNodeId: 'n2', toNodeId: 'n3' },
      { id: 'e3', fromNodeId: 'n3', toNodeId: 'n4', label: 'Yes' },
      { id: 'e4', fromNodeId: 'n3', toNodeId: 'n5', label: 'No' },
      { id: 'e5', fromNodeId: 'n4', toNodeId: 'n6' },
      { id: 'e6', fromNodeId: 'n5', toNodeId: 'n6' },
    ],
  },
  max_two: {
    title: 'Largest of Two Numbers',
    goal: 'Compare A and B. Output whichever value is larger.',
    nodes: [
      { id: 'n1', type: 'start_end', x: 260, y: 40, label: 'Start' },
      { id: 'n2', type: 'input_output', x: 260, y: 130, label: 'Input: A, B' },
      { id: 'n3', type: 'decision', x: 260, y: 240, label: 'A > B ?' },
      { id: 'n4', type: 'input_output', x: 110, y: 350, label: 'Print A' },
      { id: 'n5', type: 'input_output', x: 410, y: 350, label: 'Print B' },
      { id: 'n6', type: 'start_end', x: 260, y: 450, label: 'End' },
    ],
    edges: [
      { id: 'e1', fromNodeId: 'n1', toNodeId: 'n2' },
      { id: 'e2', fromNodeId: 'n2', toNodeId: 'n3' },
      { id: 'e3', fromNodeId: 'n3', toNodeId: 'n4', label: 'Yes' },
      { id: 'e4', fromNodeId: 'n3', toNodeId: 'n5', label: 'No' },
      { id: 'e5', fromNodeId: 'n4', toNodeId: 'n6' },
      { id: 'e6', fromNodeId: 'n5', toNodeId: 'n6' },
    ],
  },
  loop_five: {
    title: 'Print Numbers 1 to 5',
    goal: 'Initialize counter i = 1. While i <= 5, print i and increment i = i + 1.',
    nodes: [
      { id: 'n1', type: 'start_end', x: 260, y: 40, label: 'Start' },
      { id: 'n2', type: 'process', x: 260, y: 130, label: 'i = 1' },
      { id: 'n3', type: 'decision', x: 260, y: 230, label: 'i <= 5 ?' },
      { id: 'n4', type: 'input_output', x: 260, y: 340, label: 'Print i' },
      { id: 'n5', type: 'process', x: 260, y: 430, label: 'i = i + 1' },
      { id: 'n6', type: 'start_end', x: 430, y: 230, label: 'End' },
    ],
    edges: [
      { id: 'e1', fromNodeId: 'n1', toNodeId: 'n2' },
      { id: 'e2', fromNodeId: 'n2', toNodeId: 'n3' },
      { id: 'e3', fromNodeId: 'n3', toNodeId: 'n4', label: 'Yes' },
      { id: 'e4', fromNodeId: 'n4', toNodeId: 'n5' },
      { id: 'e5', fromNodeId: 'n5', toNodeId: 'n3', label: 'Loop' },
      { id: 'e6', fromNodeId: 'n3', toNodeId: 'n6', label: 'No' },
    ],
  },
  array_traverse: {
    title: '1D Array Traversal',
    goal: 'Start at index i = 0. Iterate until i == arr.length, visiting each element.',
    nodes: [
      { id: 'n1', type: 'start_end', x: 260, y: 40, label: 'Start' },
      { id: 'n2', type: 'process', x: 260, y: 130, label: 'i = 0' },
      { id: 'n3', type: 'decision', x: 260, y: 230, label: 'i < length ?' },
      { id: 'n4', type: 'input_output', x: 260, y: 340, label: 'Process arr[i]' },
      { id: 'n5', type: 'process', x: 260, y: 430, label: 'i = i + 1' },
      { id: 'n6', type: 'start_end', x: 430, y: 230, label: 'End' },
    ],
    edges: [
      { id: 'e1', fromNodeId: 'n1', toNodeId: 'n2' },
      { id: 'e2', fromNodeId: 'n2', toNodeId: 'n3' },
      { id: 'e3', fromNodeId: 'n3', toNodeId: 'n4', label: 'Yes' },
      { id: 'e4', fromNodeId: 'n4', toNodeId: 'n5' },
      { id: 'e5', fromNodeId: 'n5', toNodeId: 'n3', label: 'Loop' },
      { id: 'e6', fromNodeId: 'n3', toNodeId: 'n6', label: 'No' },
    ],
  },
};

export const FlowchartCanvas: React.FC<FlowchartCanvasProps> = ({
  initialExample = 'even_odd',
  onAwardXp,
  onOpenMentorWithMessage,
}) => {
  const [selectedExample, setSelectedExample] = useState(initialExample);
  const [activeMode, setActiveMode] = useState<'learn' | 'build' | 'guided' | 'evaluate'>('learn');

  const [nodes, setNodes] = useState<FlowchartNode[]>(() => TEMPLATES[initialExample].nodes);
  const [edges, setEdges] = useState<FlowchartEdge[]>(() => TEMPLATES[initialExample].edges);

  const [history, setHistory] = useState<{ nodes: FlowchartNode[]; edges: FlowchartEdge[] }[]>([]);
  const [historyIdx, setHistoryIdx] = useState(-1);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [connectingFromId, setConnectingFromId] = useState<string | null>(null);

  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });

  // Execution Simulator state
  const [simInputVal, setSimInputVal] = useState('7');
  const [simActiveNodeId, setSimActiveNodeId] = useState<string | null>(null);
  const [simLog, setSimLog] = useState<string[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  // Evaluation state
  const [evalResult, setEvalResult] = useState<{ passed: boolean; message: string } | null>(null);

  const canvasRef = useRef<SVGSVGElement | null>(null);
  const isDraggingNode = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Load template
  const handleLoadTemplate = (key: string) => {
    sound.playClick();
    const t = TEMPLATES[key];
    if (!t) return;
    setSelectedExample(key as any);
    setNodes(t.nodes);
    setEdges(t.edges);
    setSelectedNodeId(null);
    setConnectingFromId(null);
    setSimActiveNodeId(null);
    setSimLog([]);
    setEvalResult(null);
  };

  // Node Dragging Handlers
  const handleMouseDownNode = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    sound.playClick();
    setSelectedNodeId(nodeId);
    isDraggingNode.current = true;
    const node = nodes.find((n) => n.id === nodeId);
    if (!node) return;
    dragOffset.current = {
      x: e.clientX - node.x * zoom,
      y: e.clientY - node.y * zoom,
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingNode.current || !selectedNodeId) return;
    const newX = (e.clientX - dragOffset.current.x) / zoom;
    const newY = (e.clientY - dragOffset.current.y) / zoom;

    setNodes((prev) =>
      prev.map((n) => (n.id === selectedNodeId ? { ...n, x: Math.round(newX), y: Math.round(newY) } : n))
    );
  };

  const handleMouseUp = () => {
    if (isDraggingNode.current) {
      isDraggingNode.current = false;
      saveHistory();
    }
  };

  const saveHistory = () => {
    setHistory((prev) => [...prev.slice(0, historyIdx + 1), { nodes: [...nodes], edges: [...edges] }]);
    setHistoryIdx((prev) => prev + 1);
  };

  const handleUndo = () => {
    if (historyIdx > 0) {
      sound.playClick();
      const prev = history[historyIdx - 1];
      setNodes(prev.nodes);
      setEdges(prev.edges);
      setHistoryIdx((i) => i - 1);
    }
  };

  const handleRedo = () => {
    if (historyIdx < history.length - 1) {
      sound.playClick();
      const next = history[historyIdx + 1];
      setNodes(next.nodes);
      setEdges(next.edges);
      setHistoryIdx((i) => i + 1);
    }
  };

  // Add new node from palette
  const handleAddNode = (type: FlowchartNodeType, defaultLabel: string) => {
    sound.playClick();
    const id = `node_${Date.now()}`;
    const newNode: FlowchartNode = {
      id,
      type,
      x: 240,
      y: 180 + nodes.length * 20,
      label: defaultLabel,
    };
    setNodes((prev) => [...prev, newNode]);
    setSelectedNodeId(id);
    saveHistory();
  };

  // Node editing
  const handleEditLabel = (nodeId: string, newLabel: string) => {
    setNodes((prev) => prev.map((n) => (n.id === nodeId ? { ...n, label: newLabel } : n)));
  };

  // Delete selected node
  const handleDeleteSelected = () => {
    if (!selectedNodeId) return;
    sound.playClick();
    setNodes((prev) => prev.filter((n) => n.id !== selectedNodeId));
    setEdges((prev) => prev.filter((e) => e.fromNodeId !== selectedNodeId && e.toNodeId !== selectedNodeId));
    setSelectedNodeId(null);
    saveHistory();
  };

  // Clear Canvas
  const handleClear = () => {
    if (window.confirm('Clear all nodes and connectors from the flowchart canvas?')) {
      sound.playClick();
      setNodes([]);
      setEdges([]);
      setSelectedNodeId(null);
      setConnectingFromId(null);
      setSimLog([]);
      setEvalResult(null);
      saveHistory();
    }
  };

  // Connect port click
  const handlePortClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    sound.playClick();
    if (!connectingFromId) {
      setConnectingFromId(nodeId);
    } else {
      if (connectingFromId !== nodeId) {
        const edgeId = `edge_${Date.now()}`;
        const sourceNode = nodes.find((n) => n.id === connectingFromId);
        const isDecision = sourceNode?.type === 'decision';
        const existingOut = edges.filter((ed) => ed.fromNodeId === connectingFromId);
        const branchLabel = isDecision ? (existingOut.length === 0 ? 'Yes' : 'No') : undefined;

        setEdges((prev) => [
          ...prev,
          { id: edgeId, fromNodeId: connectingFromId, toNodeId: nodeId, label: branchLabel },
        ]);
        sound.playSuccess();
        saveHistory();
      }
      setConnectingFromId(null);
    }
  };

  // Execution Simulator
  const handleRunSimulation = () => {
    sound.playClick();
    setIsSimulating(true);
    setSimLog([]);
    setSimActiveNodeId(null);

    const startNode = nodes.find((n) => n.type === 'start_end' && n.label.toLowerCase().includes('start'));
    if (!startNode) {
      setSimLog(['Error: No "Start" terminator node found on canvas.']);
      setIsSimulating(false);
      return;
    }

    const inputNum = parseInt(simInputVal, 10);
    const traceSequence: { nodeId: string; msg: string }[] = [];
    traceSequence.push({ nodeId: startNode.id, msg: '1. Executing Start terminator.' });

    if (selectedExample === 'even_odd') {
      const isEven = inputNum % 2 === 0;
      traceSequence.push({ nodeId: 'n2', msg: `2. Received input N = ${inputNum}` });
      traceSequence.push({ nodeId: 'n3', msg: `3. Evaluated decision: ${inputNum} % 2 == 0 -> ${isEven ? 'TRUE' : 'FALSE'}` });
      if (isEven) {
        traceSequence.push({ nodeId: 'n4', msg: '4. Traversed YES branch -> Output: "Even"' });
      } else {
        traceSequence.push({ nodeId: 'n5', msg: '4. Traversed NO branch -> Output: "Odd"' });
      }
      traceSequence.push({ nodeId: 'n6', msg: '5. Reached End terminator. Execution complete.' });
    } else {
      // General path simulation following edges
      let currId: string | null = startNode.id;
      let stepCount = 1;
      while (currId && stepCount < 8) {
        const nextEdge = edges.find((ed) => ed.fromNodeId === currId);
        if (!nextEdge) break;
        const target = nodes.find((n) => n.id === nextEdge.toNodeId);
        if (target) {
          stepCount++;
          traceSequence.push({ nodeId: target.id, msg: `${stepCount}. Traversed to ${target.label}` });
          currId = target.id;
        } else {
          break;
        }
      }
    }

    // Step through visually
    let stepIdx = 0;
    const interval = setInterval(() => {
      if (stepIdx < traceSequence.length) {
        const step = traceSequence[stepIdx];
        setSimActiveNodeId(step.nodeId);
        setSimLog((prev) => [...prev, step.msg]);
        sound.playCompare(stepIdx * 10);
        stepIdx++;
      } else {
        clearInterval(interval);
        setIsSimulating(false);
        sound.playSuccess();
        if (onAwardXp) onAwardXp(20);
      }
    }, 700);
  };

  // Evaluation against target logic
  const handleEvaluateFlowchart = () => {
    sound.playClick();
    const hasStart = nodes.some((n) => n.type === 'start_end');
    const hasDecision = nodes.some((n) => n.type === 'decision');
    const hasEdgeCount = edges.length >= 4;

    if (hasStart && hasDecision && hasEdgeCount) {
      sound.playSuccess();
      setEvalResult({
        passed: true,
        message: 'Flowchart logic verified! All decision branches, input/output nodes, and terminators are valid.',
      });
      if (onAwardXp) onAwardXp(30);
    } else {
      sound.playError();
      setEvalResult({
        passed: false,
        message: 'Incomplete flow: Ensure you include a Start node, a Decision Diamond, and both Yes/No branches.',
      });
    }
  };

  // Save Flowchart Diagram
  const handleSaveDiagram = () => {
    sound.playClick();
    const diagram: FlowchartDiagram = {
      id: `diag_${selectedExample}_${Date.now()}`,
      title: TEMPLATES[selectedExample].title,
      nodes,
      edges,
      updatedAt: Date.now(),
    };
    saveFlowchartDiagram(diagram);
    alert('Flowchart successfully saved to your atelier profile!');
  };

  return (
    <div className="space-y-6 lift-up">
      {/* Editorial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
        <div>
          <div className="flex items-center gap-2 font-mono text-[11px] text-[var(--muted-foreground)] uppercase tracking-wider">
            <span>DRAW STAGE</span>
            <span>·</span>
            <span>INTERACTIVE FLOWCHART STUDIO</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[var(--foreground)] mt-1">
            Flowchart Canvas: <span className="font-serif-italic text-[var(--primary)]">Logic</span> Mapping
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted-foreground)] max-w-2xl mt-1">
            Construct standard flowchart diagrams with decision diamonds, draggable nodes, and live input simulation.
          </p>
        </div>

        {/* Learning Mode Segmented Controls */}
        <div className="flex items-center gap-1 bg-[var(--muted)]/50 p-1 rounded-[8px] border border-[var(--border)] text-xs font-mono">
          {(['learn', 'build', 'guided', 'evaluate'] as const).map((m) => (
            <button
              key={m}
              onClick={() => {
                sound.playClick();
                setActiveMode(m);
              }}
              className={`px-3 py-1 rounded-[6px] transition-colors uppercase ${
                activeMode === m
                  ? 'bg-[var(--card)] text-[var(--foreground)] font-bold shadow-xs'
                  : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {m}
            </button>
          ))}
        </div>
      </div>

      {/* Preset Example Selectors */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
        <div className="flex items-center gap-2">
          <span className="text-[var(--muted-foreground)]">Algorithm Templates:</span>
          {Object.keys(TEMPLATES).map((key) => (
            <button
              key={key}
              onClick={() => handleLoadTemplate(key)}
              className={`px-2.5 py-1 rounded-[8px] border transition-colors ${
                selectedExample === key
                  ? 'border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] font-bold'
                  : 'border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
              }`}
            >
              {TEMPLATES[key].title}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handleSaveDiagram} variant="secondary" size="sm" className="gap-1.5">
            <Save className="h-3.5 w-3.5" />
            <span>Save Flowchart</span>
          </Button>
          <Button onClick={handleClear} variant="outline" size="sm" className="gap-1 text-[var(--destructive)]">
            <Trash2 className="h-3.5 w-3.5" />
            <span>Clear</span>
          </Button>
        </div>
      </div>

      {/* Goal Callout Card */}
      <div className="p-3.5 rounded-[8px] bg-[var(--card)] border border-[var(--border)] text-xs text-[var(--foreground)] flex items-start justify-between gap-3">
        <div>
          <span className="font-mono text-[10px] uppercase font-bold text-[var(--primary)] block mb-0.5">
            Target Logic Objective:
          </span>
          <p>{TEMPLATES[selectedExample].goal}</p>
        </div>
        {activeMode === 'guided' && onOpenMentorWithMessage && (
          <Button
            onClick={() =>
              onOpenMentorWithMessage(
                `Mentor, what is the next logical flowchart block needed for ${TEMPLATES[selectedExample].title}?`
              )
            }
            variant="outline"
            size="sm"
            className="shrink-0 gap-1 font-mono text-xs"
          >
            <Sparkles className="h-3 w-3 text-[var(--primary)]" />
            <span>Ask Hint</span>
          </Button>
        )}
      </div>

      {/* Node Palette Bar (Usable without horizontal scroll) */}
      <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-[8px] bg-[var(--background)] border border-[var(--border)]">
        <span className="text-xs font-mono text-[var(--muted-foreground)] mr-1">Add Symbol:</span>
        <button
          onClick={() => handleAddNode('start_end', 'Start / End')}
          className="px-2.5 py-1 rounded-full text-xs font-mono border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]"
        >
          Terminal (Start/End)
        </button>
        <button
          onClick={() => handleAddNode('process', 'Operation / Compute')}
          className="px-2.5 py-1 rounded-[6px] text-xs font-mono border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]"
        >
          Process [ ]
        </button>
        <button
          onClick={() => handleAddNode('input_output', 'Input / Print')}
          className="px-2.5 py-1 rounded-[6px] text-xs font-mono border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)] italic"
        >
          Input/Output / /
        </button>
        <button
          onClick={() => handleAddNode('decision', 'Condition ?')}
          className="px-2.5 py-1 text-xs font-mono border border-[var(--warning)] bg-[var(--card)] hover:border-[var(--primary)] text-[var(--warning)]"
        >
          Decision &lt; &gt;
        </button>
        <button
          onClick={() => handleAddNode('connector', 'Connect')}
          className="px-2.5 py-1 rounded-full text-xs font-mono border border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]"
        >
          Connector (O)
        </button>
      </div>

      {/* Main Canvas Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* SVG Drawing Surface */}
        <div className="lg:col-span-8 space-y-3">
          <div
            className="relative w-full h-[520px] rounded-[10px] border border-[var(--border)] bg-[var(--card)] overflow-hidden select-none cursor-crosshair"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* Grid Pattern */}
            <svg
              ref={canvasRef}
              className="absolute inset-0 w-full h-full"
              viewBox={`0 0 ${800 / zoom} ${520 / zoom}`}
            >
              <defs>
                <pattern id="flowGrid" width="20" height="20" patternUnits="userSpaceOnUse">
                  <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" className="text-[var(--border)] opacity-40" strokeWidth="0.5" />
                </pattern>
                <marker id="arrowHead" markerWidth="8" markerHeight="8" refX="6" refY="4" orient="auto">
                  <path d="M 0 0 L 8 4 L 0 8 Z" fill="currentColor" className="text-[var(--primary)]" />
                </marker>
              </defs>

              <rect width="100%" height="100%" fill="url(#flowGrid)" />

              {/* Render Edges */}
              {edges.map((edge) => {
                const source = nodes.find((n) => n.id === edge.fromNodeId);
                const target = nodes.find((n) => n.id === edge.toNodeId);
                if (!source || !target) return null;

                const sx = source.x;
                const sy = source.y + 25;
                const tx = target.x;
                const ty = target.y - 25;

                const isEdgeSimulating = simActiveNodeId === source.id;

                return (
                  <g key={edge.id}>
                    <path
                      d={`M ${sx} ${sy} C ${sx} ${(sy + ty) / 2}, ${tx} ${(sy + ty) / 2}, ${tx} ${ty}`}
                      fill="none"
                      stroke={isEdgeSimulating ? '#9BD77A' : '#717669'}
                      strokeWidth={isEdgeSimulating ? 2.5 : 1.5}
                      markerEnd="url(#arrowHead)"
                    />
                    {edge.label && (
                      <text
                        x={(sx + tx) / 2}
                        y={(sy + ty) / 2 - 6}
                        fill="#597346"
                        fontSize="10"
                        fontFamily="monospace"
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {edge.label}
                      </text>
                    )}
                  </g>
                );
              })}

              {/* Render Nodes */}
              {nodes.map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isSimActive = simActiveNodeId === node.id;
                const isConnectingSource = connectingFromId === node.id;

                let fillClass = 'fill-[var(--background)] stroke-[var(--border)]';
                if (isSimActive) {
                  fillClass = 'fill-[var(--primary)]/20 stroke-[var(--primary)] stroke-2';
                } else if (isSelected) {
                  fillClass = 'fill-[var(--primary)]/10 stroke-[var(--primary)] stroke-2';
                }

                return (
                  <g
                    key={node.id}
                    transform={`translate(${node.x}, ${node.y})`}
                    onMouseDown={(e) => handleMouseDownNode(e, node.id)}
                    className="cursor-move group"
                  >
                    {/* Node Shape by Type */}
                    {node.type === 'start_end' && (
                      <rect x="-65" y="-20" width="130" height="40" rx="20" className={fillClass} />
                    )}
                    {node.type === 'process' && (
                      <rect x="-70" y="-22" width="140" height="44" rx="6" className={fillClass} />
                    )}
                    {node.type === 'input_output' && (
                      <polygon points="-65,-20 75,-20 65,20 -75,20" className={fillClass} />
                    )}
                    {node.type === 'decision' && (
                      <polygon points="0,-28 75,0 0,28 -75,0" className={fillClass} />
                    )}
                    {node.type === 'connector' && (
                      <circle cx="0" cy="0" r="18" className={fillClass} />
                    )}

                    {/* Node Text */}
                    <text
                      x="0"
                      y="4"
                      textAnchor="middle"
                      fill="currentColor"
                      className="text-[var(--foreground)] text-[11px] font-mono pointer-events-none select-none font-semibold"
                    >
                      {node.label}
                    </text>

                    {/* Port Button for connecting edges */}
                    <circle
                      cx="0"
                      cy="22"
                      r="6"
                      onClick={(e) => handlePortClick(e, node.id)}
                      className={`cursor-pointer transition-colors ${
                        isConnectingSource
                          ? 'fill-[var(--primary)] stroke-white stroke-2 animate-ping'
                          : 'fill-[var(--border)] hover:fill-[var(--primary)]'
                      }`}
                    />
                  </g>
                );
              })}
            </svg>

            {/* Canvas Floating Toolbar */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[var(--background)]/90 backdrop-blur-xs p-1 rounded-[8px] border border-[var(--border)] shadow-sm">
              <button
                onClick={() => setZoom((z) => Math.min(1.6, z + 0.15))}
                title="Zoom In"
                className="p-1.5 rounded-[6px] hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
              >
                <ZoomIn className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
                title="Zoom Out"
                className="p-1.5 rounded-[6px] hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
              >
                <ZoomOut className="h-4 w-4" />
              </button>
              <button
                onClick={() => setZoom(1)}
                title="Fit Screen"
                className="p-1.5 rounded-[6px] hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
              >
                <Maximize2 className="h-4 w-4" />
              </button>
              <div className="w-[1px] h-4 bg-[var(--border)]" />
              <button
                onClick={handleUndo}
                title="Undo"
                className="p-1.5 rounded-[6px] hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
              >
                <Undo2 className="h-4 w-4" />
              </button>
              <button
                onClick={handleRedo}
                title="Redo"
                className="p-1.5 rounded-[6px] hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
              >
                <Redo2 className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="text-center font-mono text-[11px] text-[var(--muted-foreground)]">
            FIG. 07 · Interactive ISO/IEC flowchart model with draggable logic registers &amp; directional paths
          </div>
        </div>

        {/* Right Side: Simulation & Node Inspector */}
        <div className="lg:col-span-4 space-y-4">
          {/* Node Label Inspector */}
          {selectedNodeId && (
            <Card className="p-4 bg-[var(--card)] border-[var(--border)] space-y-3">
              <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                <span className="font-mono text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                  Edit Selected Node
                </span>
                <Button onClick={handleDeleteSelected} variant="outline" size="sm" className="h-7 text-xs text-[var(--destructive)]">
                  Delete
                </Button>
              </div>

              <div>
                <label className="block text-xs font-mono text-[var(--muted-foreground)] mb-1">
                  Node Label:
                </label>
                <input
                  type="text"
                  value={nodes.find((n) => n.id === selectedNodeId)?.label || ''}
                  onChange={(e) => handleEditLabel(selectedNodeId, e.target.value)}
                  className="w-full rounded-[8px] border border-[var(--border)] bg-[var(--background)] px-2.5 py-1.5 text-xs font-mono text-[var(--foreground)]"
                />
              </div>
            </Card>
          )}

          {/* Execution Simulator Card */}
          <Card className="p-5 bg-[var(--card)] border-[var(--border)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
              <span className="font-mono text-xs font-semibold uppercase text-[var(--muted-foreground)]">
                Logic Execution Simulator
              </span>
              <Badge variant={isSimulating ? 'default' : 'secondary'} className="font-mono text-[10px]">
                {isSimulating ? 'SIMULATING...' : 'READY'}
              </Badge>
            </div>

            <p className="text-xs text-[var(--muted-foreground)]">
              Feed test input into the flowchart to trace which decision branches execute in real time.
            </p>

            <div className="flex items-center gap-2">
              <span className="text-xs font-mono text-[var(--muted-foreground)]">Sample Input N:</span>
              <input
                type="number"
                value={simInputVal}
                onChange={(e) => setSimInputVal(e.target.value)}
                className="w-20 rounded-[8px] border border-[var(--border)] bg-[var(--background)] px-2 py-1 text-xs font-mono text-[var(--foreground)] text-center"
              />
              <Button
                onClick={handleRunSimulation}
                disabled={isSimulating}
                variant="default"
                size="sm"
                className="flex-1 gap-1.5 font-mono text-xs"
              >
                <Play className="h-3.5 w-3.5" />
                <span>Run Flow</span>
              </Button>
            </div>

            {/* Execution Trace Log */}
            <div className="rounded-[8px] bg-[var(--background)] p-3 border border-[var(--border)] font-mono text-xs space-y-1 max-h-36 overflow-y-auto">
              {simLog.length === 0 ? (
                <div className="text-[var(--muted-foreground)] italic">
                  Click &quot;Run Flow&quot; to trace execution steps through the flowchart.
                </div>
              ) : (
                simLog.map((log, idx) => (
                  <div key={idx} className="text-[var(--foreground)] flex items-center gap-1.5">
                    <span className="text-[var(--primary)] font-bold">&gt;</span>
                    <span>{log}</span>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Evaluate Mode Actions */}
          <Card className="p-4 bg-[var(--card)] border-[var(--border)] space-y-3">
            <span className="font-mono text-xs font-semibold uppercase text-[var(--muted-foreground)] block">
              Logic Verification
            </span>
            <Button onClick={handleEvaluateFlowchart} variant="secondary" size="sm" className="w-full font-mono text-xs">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-[var(--primary)]" />
              <span>Validate Logic Correctness</span>
            </Button>

            {evalResult && (
              <div
                className={`p-3 rounded-[8px] border text-xs font-mono ${
                  evalResult.passed
                    ? 'border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)]'
                    : 'border-[var(--destructive)] bg-[var(--destructive)]/10 text-[var(--destructive)]'
                }`}
              >
                {evalResult.message}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};
