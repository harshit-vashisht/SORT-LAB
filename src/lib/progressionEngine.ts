import {
  ProgressionStateV2,
  ProgressionState,
  SkillBadgeTier,
  SkillCardRecord,
  SkillBadge,
  LessonStage,
  FlowchartDiagram,
  MapNode,
  TopicId,
  GameId,
  IslandId,
} from '../types';
import { CURRICULUM_TOPICS, REALMS } from './curriculumData';

// V2 STORAGE & PROGRESSION ENGINE
const STORAGE_KEY_V2 = 'sortlab_v2_progression';

const DEFAULT_PROGRESSION_V2: ProgressionStateV2 = {
  completedTopics: ['l0-intro'],
  unlockedTopics: ['l0-intro', 'l0-variables'],
  topicStagesProgress: {
    'l0-intro': 'reward',
  },
  skillCards: {
    'l0-intro': {
      id: 'sc-l0-intro',
      topicId: 'l0-intro',
      topicTitle: 'What is a Program & Algorithm?',
      realmId: 'foundations',
      tier: 'gold',
      earnedAt: Date.now() - 3600000,
      score: 85,
      tasksCompleted: 4,
      evidence: [
        'Traced sequential instruction execution with 100% accuracy',
        'Assembled first I/O flowchart successfully',
        'Completed Level 0 diagnostic assessment',
      ],
      skillsDemonstrated: ['Unambiguous Instruction Flow', 'I/O Cycle', 'Terminal Output'],
      nextChallenge: 'Variables & Memory Boxes',
    },
  },
  currentTopicId: 'l0-variables',
  gameHighScores: {
    'memory-match': 240,
    'decision-detective': 180,
    'loop-runner': 300,
    'index-quest': 210,
    'matrix-mission': 260,
    'swap-blitz': 350,
  },
  savedFlowcharts: {},
};

export function getProgressionV2(): ProgressionStateV2 {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_V2);
    if (!raw) return DEFAULT_PROGRESSION_V2;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESSION_V2,
      ...parsed,
      skillCards: { ...DEFAULT_PROGRESSION_V2.skillCards, ...(parsed.skillCards || {}) },
      gameHighScores: { ...DEFAULT_PROGRESSION_V2.gameHighScores, ...(parsed.gameHighScores || {}) },
      savedFlowcharts: { ...(parsed.savedFlowcharts || {}) },
    };
  } catch {
    return DEFAULT_PROGRESSION_V2;
  }
}

export function saveProgressionV2(prog: ProgressionStateV2): void {
  try {
    localStorage.setItem(STORAGE_KEY_V2, JSON.stringify(prog));
  } catch {}
}

export function isTopicUnlocked(topicId: string, prog: ProgressionStateV2): boolean {
  if (prog.unlockedTopics.includes(topicId)) return true;
  const topic = CURRICULUM_TOPICS.find((t) => t.id === topicId);
  if (!topic) return false;
  if (topic.prerequisites.length === 0) return true;
  return topic.prerequisites.every((prereqId: string) => prog.completedTopics.includes(prereqId));
}

export function completeTopicStage(
  topicId: string,
  stage: LessonStage,
  score: number = 85,
  hintsUsed: number = 0
): { updated: ProgressionStateV2; newCardAwarded?: SkillCardRecord; newlyUnlocked: string[] } {
  const current = getProgressionV2();
  current.topicStagesProgress[topicId] = stage;

  const newlyUnlocked: string[] = [];
  let newCardAwarded: SkillCardRecord | undefined = undefined;

  if (stage === 'test' || stage === 'reward') {
    if (!current.completedTopics.includes(topicId)) {
      current.completedTopics.push(topicId);
    }

    const topic = CURRICULUM_TOPICS.find((t) => t.id === topicId);
    if (topic) {
      let tier: SkillBadgeTier = 'bronze';
      if (score >= 90 && hintsUsed === 0) {
        tier = 'platinum';
      } else if (score >= 75) {
        tier = 'gold';
      }

      const card: SkillCardRecord = {
        id: `sc-${topicId}`,
        topicId,
        topicTitle: topic.title,
        realmId: topic.realmId,
        tier,
        earnedAt: Date.now(),
        score,
        tasksCompleted: 6,
        evidence: [
          `Scored ${score}% on adaptive assessment with ${hintsUsed} hints`,
          `Completed visual interactive sandbox and flowchart verification`,
          `Passed all practical test cases in Code Arena`,
        ],
        skillsDemonstrated: topic.skillsDemonstrated,
        nextChallenge: 'Advance to next curriculum milestone in ' + REALMS[topic.realmId].name,
      };

      current.skillCards[topicId] = card;
      newCardAwarded = card;
    }

    CURRICULUM_TOPICS.forEach((t) => {
      if (!current.unlockedTopics.includes(t.id)) {
        const canUnlock = t.prerequisites.every((p: string) => current.completedTopics.includes(p));
        if (canUnlock) {
          current.unlockedTopics.push(t.id);
          newlyUnlocked.push(t.id);
        }
      }
    });
  }

  saveProgressionV2(current);
  return { updated: current, newCardAwarded, newlyUnlocked };
}

export function saveFlowchartDiagram(diagram: FlowchartDiagram): ProgressionStateV2 {
  const current = getProgressionV2();
  current.savedFlowcharts[diagram.id] = diagram;
  saveProgressionV2(current);
  return current;
}

export function resetToBeginnerProgression(): ProgressionStateV2 {
  const fresh: ProgressionStateV2 = {
    completedTopics: [],
    unlockedTopics: ['l0-intro'],
    topicStagesProgress: {},
    skillCards: {},
    currentTopicId: 'l0-intro',
    gameHighScores: {
      'memory-match': 0,
      'decision-detective': 0,
      'loop-runner': 0,
      'index-quest': 0,
      'matrix-mission': 0,
      'swap-blitz': 0,
    },
    savedFlowcharts: {},
  };
  saveProgressionV2(fresh);
  return fresh;
}

// BACKWARDS COMPATIBILITY FOR LEGACY BADGES MODAL
export const ALL_BADGES: SkillBadge[] = [
  {
    id: 'badge-loops',
    topicId: 'loops',
    title: 'Loop Sentinel',
    description: 'Demonstrated precise boundary control, termination forecasting, and off-by-one defense.',
    icon: 'Repeat',
    evidence: [
      'Completed Loop Lab stepping with 0 fencepost errors',
      'Accurately determined while-loop termination in Loop Runner',
    ],
    criteria: {
      bronze: '60%+ score in Loop Runner or completed Loop Lab',
      gold: '80%+ score with fewer than 2 mentor hints',
      platinum: '95%+ score in Loop Runner with zero hints requested',
    },
  },
  {
    id: 'badge-arrays',
    topicId: 'arrays-1d',
    title: 'Vector Cartographer',
    description: 'Mastered 0-indexed pointer navigation, boundary containment, and linear scans.',
    icon: 'ListFilter',
    evidence: [
      'Identified out-of-bounds memory hazards in Index Detective',
      'Executed in-place swap transformations cleanly',
    ],
    criteria: {
      bronze: '60%+ score in Index Detective',
      gold: '85%+ score with high-speed pointer identification',
      platinum: '100% boundary identification across all 8 test vectors',
    },
  },
  {
    id: 'badge-matrix',
    topicId: 'arrays-2d',
    title: 'Lattice Navigator',
    description: 'Navigated 2D coordinate spaces, nested iteration matrices, and diagonal scans.',
    icon: 'Grid',
    evidence: [
      'Mapped (row, col) cells without index transposition',
      'Solved Matrix Mission path sequence correctly',
    ],
    criteria: {
      bronze: '60%+ score in Matrix Mission',
      gold: '80%+ score on 4x4 coordinate challenge',
      platinum: 'Completed multi-cell diagonal scan with 0 misses',
    },
  },
  {
    id: 'badge-bubble-sort',
    topicId: 'bubble-sort',
    title: 'Bubble Invariant Guardian',
    description: 'Demonstrated understanding of adjacent comparative swaps and early-exit flags.',
    icon: 'ArrowUpDown',
    evidence: [
      'Completed Visual Lab passes with accurate step predictions',
      'Achieved high streak in Swap Blitz comparison challenge',
    ],
    criteria: {
      bronze: 'Completed full sorting pass in Visual Lab',
      gold: 'Achieved 5+ prediction streak in Swap Blitz',
      platinum: 'Implemented early-exit optimization and passed edge-case suite',
    },
  },
];

const STORAGE_KEY_LEGACY = 'sortlab_progression_state';

const DEFAULT_PROGRESSION: ProgressionState = {
  completedNodes: ['node-basics'],
  unlockedNodes: ['node-basics', 'node-loops', 'node-arrays-1d', 'node-bubble-sort'],
  badges: {
    'badge-loops': {
      tier: 'bronze',
      unlockedAt: Date.now() - 3600000,
      score: 75,
    },
  },
  activeTopicId: 'bubble-sort',
  gameHighScores: {
    'swap-blitz': 320,
    'loop-runner': 240,
    'index-detective': 180,
    'matrix-mission': 210,
    'code-repair': 300,
    'output-oracle': 150,
  },
};

export function getProgression(): ProgressionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_LEGACY);
    if (!raw) return DEFAULT_PROGRESSION;
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_PROGRESSION,
      ...parsed,
      badges: { ...DEFAULT_PROGRESSION.badges, ...(parsed.badges || {}) },
    };
  } catch {
    return DEFAULT_PROGRESSION;
  }
}

export function saveProgression(prog: ProgressionState): void {
  try {
    localStorage.setItem(STORAGE_KEY_LEGACY, JSON.stringify(prog));
  } catch {}
}

export function recordGameScore(gameId: GameId | string, score: number): void {
  const progV2 = getProgressionV2();
  const old = progV2.gameHighScores[gameId] || 0;
  if (score > old) {
    progV2.gameHighScores[gameId] = score;
    saveProgressionV2(progV2);
  }
}
