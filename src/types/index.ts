export type ExperienceLevel = 'beginner' | 'intermediate' | 'experienced';
export type ProgrammingLanguage = 'python' | 'javascript' | 'java' | 'cpp';
export type LearningPace = 'relaxed' | 'standard' | 'challenge';

export type WorkspaceMode =
  | 'dashboard'
  | 'start-zero'
  | 'lesson'
  | 'map'
  | 'visual'
  | 'flowchart'
  | 'play'
  | 'arena'
  | 'assessment'
  | 'badges'
  | 'onboarding';

export type RealmId =
  | 'foundations'
  | 'logic'
  | 'loops'
  | 'arrays'
  | 'algorithms'
  | 'structures';

export type IslandId =
  | 'island-starting'
  | 'island-matrix'
  | 'island-sorting'
  | 'island-challenge';

export type TopicId =
  | 'basics'
  | 'loops'
  | 'arrays-1d'
  | 'arrays-2d'
  | 'bubble-sort'
  | 'selection-sort'
  | 'insertion-sort';

export type GameId =
  | 'swap-blitz'
  | 'loop-runner'
  | 'index-detective'
  | 'matrix-mission'
  | 'code-repair'
  | 'output-oracle';

export type CurriculumLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface StudentProfile {
  experience: ExperienceLevel;
  topic: string;
  topicId?: string;
  language: ProgrammingLanguage;
  pace: LearningPace;
  completedAtLeastOnePass: boolean;
  predictionStreak: number;
  bestStreak: number;
  xp: number;
  hintsUsed: number;
  mistakes: string[];
  assessmentCompleted: boolean;
  assessmentScore?: number;
}

export type StepType =
  | 'compare'
  | 'swap'
  | 'no_swap'
  | 'pass_complete'
  | 'sorted'
  | 'insert'
  | 'select_min'
  | 'variable_assign'
  | 'condition_eval'
  | 'loop_step';

export interface SortStep {
  type: StepType;
  array: number[];
  indices: [number, number] | [];
  pass: number;
  comparison: number;
  pseudocodeLine: number;
  description: string;
  swapped: boolean;
  sortedIndices: number[];
}

export interface MentorMessage {
  id: string;
  role: 'mentor' | 'student';
  text: string;
  timestamp: number;
  isFallback?: boolean;
}

export interface TestCase {
  id: string;
  name: string;
  input: any;
  expected: any;
  description: string;
  isEdgeCase?: boolean;
}

export interface TestResult {
  testId: string;
  passed: boolean;
  actual: any;
  error?: string;
  executionTimeMs: number;
}

export interface AssessmentQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  category: 'conceptual' | 'prediction' | 'edge-case' | 'complexity';
  topicId?: string;
}

export type LessonStage =
  | 'understand'
  | 'learn'
  | 'visualize'
  | 'draw'
  | 'play'
  | 'code'
  | 'test'
  | 'reward';

export type FlowchartNodeType =
  | 'start_end'
  | 'process'
  | 'input_output'
  | 'decision'
  | 'connector'
  | 'annotation';

export interface FlowchartNode {
  id: string;
  type: FlowchartNodeType;
  x: number;
  y: number;
  label: string;
  secondaryLabel?: string;
}

export interface FlowchartEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  label?: 'Yes' | 'No' | 'Next' | 'Loop';
}

export interface FlowchartDiagram {
  id: string;
  title: string;
  nodes: FlowchartNode[];
  edges: FlowchartEdge[];
  updatedAt: number;
}

export interface TopicLesson {
  id: string;
  level: CurriculumLevel;
  realmId: RealmId;
  title: string;
  tagline: string;
  description: string;
  prerequisites: string[];
  estimatedMinutes: number;
  analogy: {
    headline: string;
    story: string;
    realWorldExample: string;
  };
  sandbox: {
    initialState: Record<string, any>;
    prompt: string;
  };
  visualizerLab: 'variable' | 'condition' | 'loop' | 'array' | 'matrix' | 'sort' | 'search';
  flowchartTask: {
    goal: string;
    initialNodes: FlowchartNode[];
    initialEdges: FlowchartEdge[];
    expectedOrder: string[];
  };
  gameId: string;
  codeTask: {
    title: string;
    instructions: string;
    starterCode: Record<ProgrammingLanguage, string>;
    testCases: TestCase[];
  };
  assessmentQuestions: AssessmentQuestion[];
  skillsDemonstrated: string[];
}

export type SkillBadgeTier = 'bronze' | 'gold' | 'platinum';

export interface SkillCardRecord {
  id: string;
  topicId: string;
  topicTitle: string;
  realmId: RealmId;
  tier: SkillBadgeTier;
  earnedAt: number;
  score: number;
  tasksCompleted: number;
  evidence: string[];
  skillsDemonstrated: string[];
  nextChallenge: string;
}

export interface SkillBadge {
  id: string;
  topicId: TopicId | string;
  title: string;
  description: string;
  tier?: SkillBadgeTier;
  unlockedAt?: number;
  score?: number;
  evidence: string[];
  icon: string;
  criteria: {
    bronze: string;
    gold: string;
    platinum: string;
  };
}

export interface MapNode {
  id: string;
  title: string;
  subtitle: string;
  topicId: TopicId;
  islandId: IslandId;
  x: number;
  y: number;
  prerequisites: string[];
  description: string;
  targetMode: WorkspaceMode;
  targetLab?: 'loop' | 'array' | 'matrix' | 'sort';
  objectives: string[];
}

export interface ProgressionState {
  completedNodes: string[];
  unlockedNodes: string[];
  badges: Record<string, { tier: SkillBadgeTier; unlockedAt: number; score: number }>;
  activeTopicId: TopicId;
  gameHighScores: Record<string, number>;
}

export interface ProgressionStateV2 {
  completedTopics: string[];
  unlockedTopics: string[];
  topicStagesProgress: Record<string, LessonStage>;
  skillCards: Record<string, SkillCardRecord>;
  currentTopicId: string;
  gameHighScores: Record<string, number>;
  savedFlowcharts: Record<string, FlowchartDiagram>;
}
