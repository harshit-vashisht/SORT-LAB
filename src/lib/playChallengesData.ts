export type GameModeId =
  | 'logic-expedition'
  | 'code-detective'
  | 'pattern-builder'
  | 'speed-challenge'
  | 'algorithm-arena';

export type ChallengeTopicId =
  | 'variables'
  | 'io'
  | 'conditions'
  | 'loops'
  | 'arrays'
  | 'functions'
  | 'tracing'
  | 'sorting';

export interface ActionBlock {
  id: string;
  label: string;
  code: string;
  category: 'action' | 'control' | 'condition' | 'data';
  description?: string;
}

export interface LogicExpeditionChallenge {
  id: string;
  topicId: ChallengeTopicId;
  title: string;
  lore: string;
  objective: string;
  gridMap: {
    start: [number, number];
    crystal: [number, number];
    obstacles: [number, number][];
    gridSize: [number, number]; // [rows, cols]
  };
  availableBlocks: ActionBlock[];
  slotCount: number;
  correctSequences: string[][]; // Allow multiple valid solution paths
  hints: string[];
  explanation: string;
  xpReward: number;
}

export interface CodeDetectiveChallenge {
  id: string;
  topicId: ChallengeTopicId;
  title: string;
  lore: string;
  objective: string;
  codeSnippet: string;
  question: string;
  options: string[];
  correctIndex: number;
  hints: string[];
  explanation: string;
  xpReward: number;
}

export interface PatternBuilderChallenge {
  id: string;
  topicId: ChallengeTopicId;
  title: string;
  lore: string;
  objective: string;
  initialState: number[] | string[];
  targetPattern: number[] | string[];
  availableRules: ActionBlock[];
  slotCount: number;
  correctSequences: string[][];
  hints: string[];
  explanation: string;
  xpReward: number;
}

export interface SpeedChallengeQuestion {
  id: string;
  prompt: string;
  subtext?: string;
  isTrue: boolean;
  explanation: string;
}

export interface SpeedChallengeData {
  id: string;
  topicId: ChallengeTopicId;
  title: string;
  lore: string;
  timeSeconds: number;
  questions: SpeedChallengeQuestion[];
  xpPerQuestion: number;
}

export interface AlgorithmArenaChallenge {
  id: string;
  topicId: ChallengeTopicId;
  title: string;
  lore: string;
  objective: string;
  initialArray: number[];
  targetCondition: 'sorted-asc' | 'sorted-desc' | 'partition-evens' | 'max-at-end';
  minMovesTarget: number;
  hints: string[];
  explanation: string;
  xpReward: number;
}

// TOPIC DEFINITIONS
export const PLAY_TOPICS: { id: ChallengeTopicId; name: string; tag: string }[] = [
  { id: 'variables', name: 'Variables & Memory', tag: 'Registers & Types' },
  { id: 'io', name: 'Input & Output', tag: 'Console & Primitives' },
  { id: 'conditions', name: 'Conditions & Gates', tag: 'If / Else & Booleans' },
  { id: 'loops', name: 'Loops & Iteration', tag: 'While / For & Bounds' },
  { id: 'arrays', name: 'Arrays & Buffers', tag: 'Indices & Vectors' },
  { id: 'functions', name: 'Functions & Scope', tag: 'Calls & Returns' },
  { id: 'tracing', name: 'State Tracing', tag: 'Invariants & Memory' },
  { id: 'sorting', name: 'Sorting Protocols', tag: 'Bubble / Select / Insert' },
];

// GAME MODE DEFINITIONS
export const GAME_MODES: {
  id: GameModeId;
  name: string;
  tagline: string;
  description: string;
  iconName: string;
}[] = [
  {
    id: 'logic-expedition',
    name: 'Logic Expedition',
    tagline: 'Sequence & Path Assembly',
    description: 'Assemble draggable action blocks into sequence slots to navigate the algorithmic island and harvest glowing crystal energy.',
    iconName: 'Compass',
  },
  {
    id: 'code-detective',
    name: 'Code Detective',
    tagline: 'Bug Hunter & Mystery Tracer',
    description: 'Investigate cryptic code snippets, discover logic flaws, and deduce the exact runtime output of mysterious algorithms.',
    iconName: 'Search',
  },
  {
    id: 'pattern-builder',
    name: 'Pattern Builder',
    tagline: 'Array & Loop Synthesis',
    description: 'Chain algorithmic transformation rules into execution slots to reshape raw inputs into the designated geometric target pattern.',
    iconName: 'Grid',
  },
  {
    id: 'speed-challenge',
    name: 'Speed Challenge',
    tagline: 'Rapid Invariant Evaluation',
    description: 'Race against the celestial clock: evaluate comparative invariants, boundary conditions, and boolean logic at lightning speed.',
    iconName: 'Zap',
  },
  {
    id: 'algorithm-arena',
    name: 'Algorithm Arena',
    tagline: 'Manual Sorting Battleground',
    description: 'Take manual command of array registers. Execute pointer swaps and comparisons to achieve the target invariant with minimum moves.',
    iconName: 'Swords',
  },
];

// --- CHALLENGE DATABASE ---

export const LOGIC_EXPEDITION_CHALLENGES: Record<ChallengeTopicId, LogicExpeditionChallenge> = {
  variables: {
    id: 'le-var-1',
    topicId: 'variables',
    title: 'The Mana Vault Initialization',
    lore: 'An ancient runic gate on the floating island requires storing 50 mana units and boosting it with a double charge to power the bridge.',
    objective: 'Create a variable `mana = 50`, amplify it `mana = mana * 2`, then output `mana` to unlock the crystal bridge.',
    gridMap: {
      start: [0, 0],
      crystal: [2, 3],
      obstacles: [[1, 1], [0, 2]],
      gridSize: [3, 4],
    },
    availableBlocks: [
      { id: 'b1', label: 'Initialize mana = 50', code: 'mana = 50', category: 'data' },
      { id: 'b2', label: 'Amplify mana = mana * 2', code: 'mana = mana * 2', category: 'action' },
      { id: 'b3', label: 'Transmit mana to Gate', code: 'print(mana)', category: 'action' },
      { id: 'b4', label: 'Reset mana = 0', code: 'mana = 0', category: 'action' },
      { id: 'b5', label: 'Add noise = 15', code: 'mana = mana + 15', category: 'data' },
    ],
    slotCount: 3,
    correctSequences: [['b1', 'b2', 'b3']],
    hints: [
      'First allocate memory by declaring mana with initial value 50.',
      'Multiply the current mana register by 2 before transmitting.',
      'Transmit mana to Gate as the final action.',
    ],
    explanation: 'Variables hold values that can be reassigned. Declaring mana = 50, multiplying it to 100, and printing transmits the required charge.',
    xpReward: 30,
  },
  io: {
    id: 'le-io-1',
    topicId: 'io',
    title: 'The Whispering Shrine',
    lore: 'The guardian shrine accepts rune whispers from travelers and echoes back the amplified blessing.',
    objective: 'Read string input `rune`, convert to uppercase `rune.upper()`, and output the blessed blessing string.',
    gridMap: {
      start: [0, 0],
      crystal: [2, 2],
      obstacles: [[1, 0]],
      gridSize: [3, 3],
    },
    availableBlocks: [
      { id: 'b1', label: 'Read input rune', code: 'rune = input()', category: 'data' },
      { id: 'b2', label: 'Bless rune.upper()', code: 'blessed = rune.upper()', category: 'action' },
      { id: 'b3', label: 'Output blessed rune', code: 'print(blessed)', category: 'action' },
      { id: 'b4', label: 'Discard rune = ""', code: 'rune = ""', category: 'action' },
    ],
    slotCount: 3,
    correctSequences: [['b1', 'b2', 'b3']],
    hints: [
      'Input must be read from the environment before processing.',
      'Transform the string data into uppercase.',
      'Output the resulting value to complete the transmission.',
    ],
    explanation: 'Standard I/O takes external data, processes it in memory, and writes output to the console channel.',
    xpReward: 30,
  },
  conditions: {
    id: 'le-cond-1',
    topicId: 'conditions',
    title: 'The Chasm Bridge Gate',
    lore: 'A treacherous wind blows across the floating chasm. The portal only opens if `stamina >= 20` and `wind_speed < 15`.',
    objective: 'Inspect environmental meters with an `if` gate and project the forcefield bridge.',
    gridMap: {
      start: [0, 0],
      crystal: [1, 3],
      obstacles: [[0, 1], [2, 1]],
      gridSize: [3, 4],
    },
    availableBlocks: [
      { id: 'b1', label: 'Read stamina & wind_speed', code: 'stamina, wind = read_sensors()', category: 'data' },
      { id: 'b2', label: 'If stamina >= 20 and wind < 15', code: 'if stamina >= 20 and wind < 15:', category: 'condition' },
      { id: 'b3', label: 'Extend Light Bridge', code: '    activate_bridge()', category: 'action' },
      { id: 'b4', label: 'Sound Alarm & Retreat', code: '    retreat()', category: 'action' },
      { id: 'b5', label: 'Set wind = 100', code: 'wind = 100', category: 'data' },
    ],
    slotCount: 3,
    correctSequences: [['b1', 'b2', 'b3']],
    hints: [
      'Sensors must be sampled before evaluating the boolean condition.',
      'Check both stamina and wind_speed using logical AND.',
      'If the condition evaluates to true, trigger bridge activation.',
    ],
    explanation: 'Boolean logic gates evaluate compound expressions (`A and B`) to direct flow safely through branch targets.',
    xpReward: 35,
  },
  loops: {
    id: 'le-loop-1',
    topicId: 'loops',
    title: 'The Staircase of Echoes',
    lore: 'Four consecutive stone pillars float in mid-air. Step across each pillar sequentially without missing any steps.',
    objective: 'Loop exactly 4 times from step 0 to 3, stepping forward on each iteration.',
    gridMap: {
      start: [0, 0],
      crystal: [0, 4],
      obstacles: [[1, 1], [1, 2], [1, 3]],
      gridSize: [2, 5],
    },
    availableBlocks: [
      { id: 'b1', label: 'Initialize step = 0', code: 'step = 0', category: 'data' },
      { id: 'b2', label: 'While step < 4:', code: 'while step < 4:', category: 'control' },
      { id: 'b3', label: 'Move Forward across pillar', code: '    move_forward()', category: 'action' },
      { id: 'b4', label: 'Increment step += 1', code: '    step += 1', category: 'action' },
      { id: 'b5', label: 'Decreasing step -= 1', code: '    step -= 1', category: 'action' },
    ],
    slotCount: 4,
    correctSequences: [['b1', 'b2', 'b3', 'b4']],
    hints: [
      'Initialize counter step = 0.',
      'Boundary condition should be step < 4.',
      'Inside the loop body, move forward and increment step.',
    ],
    explanation: 'Loop iteration requires an initialization, a termination invariant, and progress toward termination to prevent infinite loops.',
    xpReward: 35,
  },
  arrays: {
    id: 'le-arr-1',
    topicId: 'arrays',
    title: 'The Rune Vector Alignment',
    lore: 'Ancient stones are stored in a contiguous 0-indexed memory bank. Extract the first and last runes to unlock the seal.',
    objective: 'Given array `runes = [10, 25, 40, 85]`, retrieve `runes[0]` and `runes[-1]`, and compute their sum.',
    gridMap: {
      start: [0, 0],
      crystal: [2, 3],
      obstacles: [[1, 2]],
      gridSize: [3, 4],
    },
    availableBlocks: [
      { id: 'b1', label: 'Load runes = [10, 25, 40, 85]', code: 'runes = [10, 25, 40, 85]', category: 'data' },
      { id: 'b2', label: 'Extract head = runes[0]', code: 'head = runes[0]', category: 'action' },
      { id: 'b3', label: 'Extract tail = runes[-1]', code: 'tail = runes[-1]', category: 'action' },
      { id: 'b4', label: 'Total key = head + tail', code: 'key = head + tail', category: 'action' },
      { id: 'b5', label: 'Read runes[99] (OOB)', code: 'err = runes[99]', category: 'action' },
    ],
    slotCount: 4,
    correctSequences: [['b1', 'b2', 'b3', 'b4']],
    hints: [
      'Load the array in memory first.',
      'Index 0 accesses the first element; index -1 or length-1 accesses the final element.',
      'Combine head and tail into the final key.',
    ],
    explanation: 'Arrays offer constant-time O(1) random access by index offset from the memory buffer base address.',
    xpReward: 35,
  },
  functions: {
    id: 'le-func-1',
    topicId: 'functions',
    title: 'The Spell Forge Invocation',
    lore: 'Define a reusable spell formula to compute kinetic force from mass and velocity, then invoke it for the flying ship.',
    objective: 'Define function `calc_force(m, a)`, return `m * a`, then call `f = calc_force(20, 5)`.',
    gridMap: {
      start: [0, 0],
      crystal: [2, 2],
      obstacles: [[0, 1]],
      gridSize: [3, 3],
    },
    availableBlocks: [
      { id: 'b1', label: 'Define calc_force(m, a):', code: 'def calc_force(m, a):', category: 'control' },
      { id: 'b2', label: 'Return m * a', code: '    return m * a', category: 'action' },
      { id: 'b3', label: 'Invoke calc_force(20, 5)', code: 'thrust = calc_force(20, 5)', category: 'action' },
      { id: 'b4', label: 'Output thrust', code: 'print(thrust)', category: 'action' },
      { id: 'b5', label: 'Return None', code: '    return None', category: 'action' },
    ],
    slotCount: 4,
    correctSequences: [['b1', 'b2', 'b3', 'b4']],
    hints: [
      'Function definition must precede invocation.',
      'The body computes product m * a and returns the result.',
      'Call the function with arguments (20, 5) and print the return value.',
    ],
    explanation: 'Functions encapsulate reusable logic, accept parameter inputs, and pass back results via return statements.',
    xpReward: 40,
  },
  tracing: {
    id: 'le-trace-1',
    topicId: 'tracing',
    title: 'The Invariant Crystal Sieve',
    lore: 'Trace the memory registers as pointers move across the island nodes to guarantee the maximum value stays in the lead register.',
    objective: 'Given elements A and B, compare them and update `lead_register` with the greater value.',
    gridMap: {
      start: [0, 0],
      crystal: [2, 3],
      obstacles: [[1, 0]],
      gridSize: [3, 4],
    },
    availableBlocks: [
      { id: 'b1', label: 'Read registers A=45, B=12', code: 'A, B = 45, 12', category: 'data' },
      { id: 'b2', label: 'If A > B:', code: 'if A > B:', category: 'condition' },
      { id: 'b3', label: 'Set lead = A', code: '    lead = A', category: 'action' },
      { id: 'b4', label: 'Else: set lead = B', code: 'else:\n    lead = B', category: 'action' },
    ],
    slotCount: 4,
    correctSequences: [['b1', 'b2', 'b3', 'b4']],
    hints: [
      'Read values A and B into registers.',
      'Check if A > B.',
      'Branch on true to set lead = A; branch on false to set lead = B.',
    ],
    explanation: 'Tracing ensures memory invariants are preserved across conditional state changes.',
    xpReward: 40,
  },
  sorting: {
    id: 'le-sort-1',
    topicId: 'sorting',
    title: 'The Bubble Sort Pass Protocol',
    lore: 'Arrange adjacent floating stones into ascending height order by inspecting consecutive pairs and swapping in-place when needed.',
    objective: 'For pair `arr[j]` and `arr[j+1]`, if `arr[j] > arr[j+1]`, execute swap `arr[j], arr[j+1] = arr[j+1], arr[j]`.',
    gridMap: {
      start: [0, 0],
      crystal: [1, 3],
      obstacles: [[0, 2]],
      gridSize: [2, 4],
    },
    availableBlocks: [
      { id: 'b1', label: 'Inspect pair arr[j], arr[j+1]', code: 'left, right = arr[j], arr[j+1]', category: 'data' },
      { id: 'b2', label: 'If left > right:', code: 'if left > right:', category: 'condition' },
      { id: 'b3', label: 'Swap arr[j] and arr[j+1]', code: '    arr[j], arr[j+1] = arr[j+1], arr[j]', category: 'action' },
      { id: 'b4', label: 'Mark swapped = True', code: '    swapped = True', category: 'action' },
      { id: 'b5', label: 'Randomize array', code: '    shuffle(arr)', category: 'action' },
    ],
    slotCount: 4,
    correctSequences: [['b1', 'b2', 'b3', 'b4']],
    hints: [
      'Inspect the two adjacent array elements at indices j and j+1.',
      'Check if left is strictly greater than right.',
      'When inverted, execute the swap and flag that a modification occurred.',
    ],
    explanation: 'Bubble sort compares adjacent items and swaps inversions, bubbling the largest unsorted element to the end of each pass.',
    xpReward: 45,
  },
};

// --- CODE DETECTIVE CHALLENGES ---

export const CODE_DETECTIVE_CHALLENGES: Record<ChallengeTopicId, CodeDetectiveChallenge> = {
  variables: {
    id: 'cd-var-1',
    topicId: 'variables',
    title: 'The Swapped Potion Mystery',
    lore: 'An alchemist attempted to swap two potion registers but mixed up the assignment order.',
    objective: 'Deduce the final value of variable `x` after the code executes.',
    codeSnippet: `let x = 10;
let y = 25;
let temp = x;
x = y;
y = temp;
x = x + 5;`,
    question: 'What is the final value of variable x?',
    options: ['15', '25', '30', '10'],
    correctIndex: 2,
    hints: [
      'Trace step by step: temp holds 10.',
      'x gets y (25).',
      'Finally, x = x + 5 evaluates to 25 + 5.',
    ],
    explanation: 'x is updated to 25 from y, and then incremented by 5, resulting in 30.',
    xpReward: 30,
  },
  io: {
    id: 'cd-io-1',
    topicId: 'io',
    title: 'The Type Concatenation Paradox',
    lore: 'The console log printed an unexpected result when combining user inputs.',
    objective: 'Predict the console output of this input concatenation.',
    codeSnippet: `const input1 = "20";
const input2 = "30";
const result = input1 + input2;
console.log(result);`,
    question: 'What does console.log(result) print?',
    options: ['50', '"2030"', 'NaN', 'Error'],
    correctIndex: 1,
    hints: [
      'Notice the quotes: both input1 and input2 are string primitives, not integers.',
      'The + operator concatenates strings.',
    ],
    explanation: 'String concatenation merges "20" and "30" into "2030", rather than performing arithmetic addition.',
    xpReward: 30,
  },
  conditions: {
    id: 'cd-cond-1',
    topicId: 'conditions',
    title: 'The Shadow Guardian Gate',
    lore: 'The guardian checks player level and keys to decide access level.',
    objective: 'Deduce which branch will execute for `level = 14` and `hasKey = false`.',
    codeSnippet: `const level = 14;
const hasKey = false;
let gate = "Locked";

if (level >= 18 || (level >= 10 && hasKey)) {
  gate = "Open";
} else if (level >= 12) {
  gate = "Trial Chamber";
} else {
  gate = "Forbidden";
}`,
    question: 'What will be the final value of gate?',
    options: ['"Open"', '"Trial Chamber"', '"Forbidden"', '"Locked"'],
    correctIndex: 1,
    hints: [
      'Evaluate the first if: level >= 18 is false; level >= 10 is true, but hasKey is false, so true && false is false.',
      'Move to else if: level (14) >= 12 is true!',
    ],
    explanation: 'The first condition fails because hasKey is false. The second condition (level >= 12) succeeds, setting gate to "Trial Chamber".',
    xpReward: 35,
  },
  loops: {
    id: 'cd-loop-1',
    topicId: 'loops',
    title: 'The Accumulator Sentinel',
    lore: 'A loop runs across an index sequence accumulating power tokens.',
    objective: 'Calculate the final value of `total` when the loop exits.',
    codeSnippet: `let total = 0;
for (let i = 1; i <= 4; i++) {
  if (i === 3) continue;
  total += i * 2;
}`,
    question: 'What is the final value of total?',
    options: ['20', '14', '12', '8'],
    correctIndex: 1,
    hints: [
      'i = 1: total = 0 + 2 = 2',
      'i = 2: total = 2 + 4 = 6',
      'i = 3: continue skips iteration!',
      'i = 4: total = 6 + 8 = 14',
    ],
    explanation: 'When i = 3, continue skips the addition. For i = 1, 2, and 4, the additions are 2 + 4 + 8 = 14.',
    xpReward: 35,
  },
  arrays: {
    id: 'cd-arr-1',
    topicId: 'arrays',
    title: 'The Off-By-One Anomaly',
    lore: 'A scanner reads an array of 5 crystals using an index pointer.',
    objective: 'Find the bug in this array traversal loop.',
    codeSnippet: `const crystals = [10, 20, 30, 40, 50];
// Goal: print all crystals
for (let i = 0; i <= crystals.length; i++) {
  console.log(crystals[i]);
}`,
    question: 'What occurs during the final iteration (i = 5)?',
    options: [
      'Prints 50 and terminates normally',
      'Prints undefined (out of bounds)',
      'Causes a syntax error',
      'Skips index 0',
    ],
    correctIndex: 1,
    hints: [
      'The array has length 5, with valid indices 0, 1, 2, 3, 4.',
      'The loop condition is i <= crystals.length (i <= 5), so i reaches 5.',
      'crystals[5] is beyond the array boundary.',
    ],
    explanation: 'Arrays are 0-indexed. With 5 elements, valid indices are 0 to 4. Accessing crystals[5] produces undefined due to the off-by-one condition i <= length.',
    xpReward: 35,
  },
  functions: {
    id: 'cd-func-1',
    topicId: 'functions',
    title: 'The Scope Shield Enigma',
    lore: 'An inner function modifies a variable name that shadows an outer variable.',
    objective: 'Deduce what is printed to the console.',
    codeSnippet: `let power = 50;

function boost() {
  let power = 100;
  power += 25;
}

boost();
console.log(power);`,
    question: 'What is printed by console.log(power)?',
    options: ['125', '100', '50', 'undefined'],
    correctIndex: 2,
    hints: [
      'Inside boost(), let power creates a new local variable in function scope.',
      'The outer power variable remains untouched.',
    ],
    explanation: 'Variable shadowing: `let power = 100` is scoped locally to `boost()`. The outer `power` variable retains its initial value of 50.',
    xpReward: 40,
  },
  tracing: {
    id: 'cd-trace-1',
    topicId: 'tracing',
    title: 'The Two-Pointer Invariant',
    lore: 'Two pointers step toward each other from opposite ends of a vector.',
    objective: 'Find where pointers left and right meet.',
    codeSnippet: `let arr = [2, 4, 6, 8, 10];
let left = 0;
let right = arr.length - 1; // 4

while (left < right) {
  left++;
  right--;
}`,
    question: 'What are the values of left and right when the loop finishes?',
    options: ['left = 2, right = 2', 'left = 1, right = 3', 'left = 3, right = 1', 'left = 2, right = 1'],
    correctIndex: 0,
    hints: [
      'Iteration 1: left = 1, right = 3 (1 < 3 is true)',
      'Iteration 2: left = 2, right = 2 (2 < 2 is false -> loop terminates)',
    ],
    explanation: 'After 2 iterations, both pointers converge at index 2, causing left < right to become false.',
    xpReward: 40,
  },
  sorting: {
    id: 'cd-sort-1',
    topicId: 'sorting',
    title: 'The Early Exit Detective',
    lore: 'An optimized Bubble Sort pass runs on an array with an early exit boolean flag.',
    objective: 'Determine how many passes this nearly-sorted array requires.',
    codeSnippet: `let arr = [10, 20, 30, 50, 40];
// Bubble Sort with swapped flag
// Pass 1: compares (10,20), (20,30), (30,50), (50,40)->swap!
// Pass 2: compares (10,20), (20,30), (30,40), (40,50)->no swaps!`,
    question: 'How many total passes does the algorithm execute before terminating?',
    options: ['1 Pass', '2 Passes', '4 Passes', '5 Passes'],
    correctIndex: 1,
    hints: [
      'Pass 1 swaps 50 and 40, setting swapped = true.',
      'Pass 2 verifies the array with zero swaps, triggering the early exit break.',
    ],
    explanation: 'Because Pass 2 detects zero inversions, the early exit flag terminates the algorithm after exactly 2 passes.',
    xpReward: 45,
  },
};

// --- PATTERN BUILDER CHALLENGES ---

export const PATTERN_BUILDER_CHALLENGES: Record<ChallengeTopicId, PatternBuilderChallenge> = {
  variables: {
    id: 'pb-var-1',
    topicId: 'variables',
    title: 'The Value Ladder Pattern',
    lore: 'Construct a sequence of integer transformations starting from 5 to reach [5, 10, 15, 20].',
    objective: 'Arrange the increment rule blocks to produce the arithmetic step pattern.',
    initialState: [5],
    targetPattern: [5, 10, 15, 20],
    availableRules: [
      { id: 'r1', label: 'Push current + 5', code: 'arr.push(val + 5)', category: 'action' },
      { id: 'r2', label: 'Push current + 5', code: 'arr.push(val + 5)', category: 'action' },
      { id: 'r3', label: 'Push current + 5', code: 'arr.push(val + 5)', category: 'action' },
      { id: 'r4', label: 'Multiply by 2', code: 'val * 2', category: 'action' },
    ],
    slotCount: 3,
    correctSequences: [['r1', 'r2', 'r3']],
    hints: ['Add +5 sequentially three times to advance from 5 to 10, 15, and 20.'],
    explanation: 'Sequential accumulator steps generate the arithmetic sequence [5, 10, 15, 20].',
    xpReward: 30,
  },
  io: {
    id: 'pb-io-1',
    topicId: 'io',
    title: 'The Tag Wrapper Pattern',
    lore: 'Format raw tokens into structured bracket tags `<val>` for message broadcasting.',
    objective: 'Transform tokens `["A", "B", "C"]` into `["<A>", "<B>", "<C>"]`.',
    initialState: ['A', 'B', 'C'],
    targetPattern: ['<A>', '<B>', '<C>'],
    availableRules: [
      { id: 'r1', label: 'Wrap with "<" and ">"', code: 'tokens.map(t => `<${t}>`)', category: 'action' },
      { id: 'r2', label: 'Convert to lowercase', code: 't.toLowerCase()', category: 'action' },
      { id: 'r3', label: 'Reverse order', code: 'tokens.reverse()', category: 'action' },
    ],
    slotCount: 1,
    correctSequences: [['r1']],
    hints: ['Use the string template literal to wrap each token with angle brackets.'],
    explanation: 'Mapping a projection function over an array transforms every element uniformly.',
    xpReward: 30,
  },
  conditions: {
    id: 'pb-cond-1',
    topicId: 'conditions',
    title: 'The Threshold Filter Pattern',
    lore: 'Filter high-energy crystals from raw readings: retain only values >= 50.',
    objective: 'Transform `[12, 65, 30, 89, 45, 99]` into `[65, 89, 99]`.',
    initialState: [12, 65, 30, 89, 45, 99],
    targetPattern: [65, 89, 99],
    availableRules: [
      { id: 'r1', label: 'Filter where val >= 50', code: 'arr.filter(v => v >= 50)', category: 'condition' },
      { id: 'r2', label: 'Filter where val < 50', code: 'arr.filter(v => v < 50)', category: 'condition' },
      { id: 'r3', label: 'Sort descending', code: 'arr.sort((a,b) => b - a)', category: 'action' },
    ],
    slotCount: 1,
    correctSequences: [['r1']],
    hints: ['Apply the conditional predicate val >= 50 to filter out values below 50.'],
    explanation: 'A filter operation tests each element against a predicate, discarding elements that evaluate to false.',
    xpReward: 35,
  },
  loops: {
    id: 'pb-loop-1',
    topicId: 'loops',
    title: 'The Geometric Doubler Pattern',
    lore: 'Generate powers of two through repeated doubling: [1, 2, 4, 8, 16].',
    objective: 'Configure a loop that doubles the accumulator on each iteration.',
    initialState: [1],
    targetPattern: [1, 2, 4, 8, 16],
    availableRules: [
      { id: 'r1', label: 'For i = 0 to 3:', code: 'for i in range(4):', category: 'control' },
      { id: 'r2', label: 'Push last * 2', code: '    arr.push(arr[-1] * 2)', category: 'action' },
      { id: 'r3', label: 'Add 1 to last', code: '    arr.push(arr[-1] + 1)', category: 'action' },
    ],
    slotCount: 2,
    correctSequences: [['r1', 'r2']],
    hints: ['Run the loop 4 times, doubling the last element each time.'],
    explanation: 'Doubling 1 four times produces 2, 4, 8, and 16, completing the geometric progression.',
    xpReward: 35,
  },
  arrays: {
    id: 'pb-arr-1',
    topicId: 'arrays',
    title: 'The Vector Reversal Pattern',
    lore: 'Invert the polarity of an array by reversing its elements: [10, 20, 30, 40] to [40, 30, 20, 10].',
    objective: 'Reorder the array from tail to head.',
    initialState: [10, 20, 30, 40],
    targetPattern: [40, 30, 20, 10],
    availableRules: [
      { id: 'r1', label: 'Swap arr[0] with arr[3]', code: 'swap(0, 3)', category: 'action' },
      { id: 'r2', label: 'Swap arr[1] with arr[2]', code: 'swap(1, 2)', category: 'action' },
      { id: 'r3', label: 'Clear array', code: 'arr.length = 0', category: 'action' },
    ],
    slotCount: 2,
    correctSequences: [['r1', 'r2'], ['r2', 'r1']],
    hints: ['Swap the outer pair (index 0 and 3), then the inner pair (index 1 and 2).'],
    explanation: 'Two-pointer array reversal swaps elements symmetric to the center in O(N/2) operations.',
    xpReward: 35,
  },
  functions: {
    id: 'pb-func-1',
    topicId: 'functions',
    title: 'The Map-Reduce Pipeline',
    lore: 'Create a pipeline: square every number, then sum them all up.',
    objective: 'Transform `[2, 3, 4]` to intermediate `[4, 9, 16]`, then output total `29`.',
    initialState: [2, 3, 4],
    targetPattern: [29],
    availableRules: [
      { id: 'r1', label: 'Map: square each number', code: 'arr.map(x => x * x)', category: 'action' },
      { id: 'r2', label: 'Reduce: sum all elements', code: 'arr.reduce((acc, x) => acc + x, 0)', category: 'action' },
      { id: 'r3', label: 'Filter: keep evens', code: 'arr.filter(x => x % 2 === 0)', category: 'condition' },
    ],
    slotCount: 2,
    correctSequences: [['r1', 'r2']],
    hints: ['First map x => x * x to get [4, 9, 16], then reduce to sum (4+9+16 = 29).'],
    explanation: 'Functional composition chains pure transformations where the output of map feeds into reduce.',
    xpReward: 40,
  },
  tracing: {
    id: 'pb-trace-1',
    topicId: 'tracing',
    title: 'The Running Sum Invariant',
    lore: 'Compute the prefix running sum: [1, 2, 3, 4] becomes [1, 3, 6, 10].',
    objective: 'Construct the cumulative sum array.',
    initialState: [1, 2, 3, 4],
    targetPattern: [1, 3, 6, 10],
    availableRules: [
      { id: 'r1', label: 'Accumulate prefix sum', code: 'prefix_sum(arr)', category: 'action' },
      { id: 'r2', label: 'Multiply by index', code: 'arr[i] * i', category: 'action' },
      { id: 'r3', label: 'Sort ascending', code: 'arr.sort()', category: 'action' },
    ],
    slotCount: 1,
    correctSequences: [['r1']],
    hints: ['Each element in a prefix sum array equals the sum of all elements up to that index.'],
    explanation: 'Prefix sums enable O(1) range sum queries after O(N) precomputation.',
    xpReward: 40,
  },
  sorting: {
    id: 'pb-sort-1',
    topicId: 'sorting',
    title: 'The Monotonic Sorter Pattern',
    lore: 'Transform an unsorted vector [45, 12, 85, 32] into strict ascending order [12, 32, 45, 85].',
    objective: 'Apply the correct sequence of adjacent pair swaps.',
    initialState: [45, 12, 85, 32],
    targetPattern: [12, 32, 45, 85],
    availableRules: [
      { id: 'r1', label: 'Swap arr[0], arr[1] (45 and 12)', code: 'swap(0, 1)', category: 'action' },
      { id: 'r2', label: 'Swap arr[2], arr[3] (85 and 32)', code: 'swap(2, 3)', category: 'action' },
      { id: 'r3', label: 'Swap arr[1], arr[2] (45 and 32)', code: 'swap(1, 2)', category: 'action' },
    ],
    slotCount: 3,
    correctSequences: [
      ['r1', 'r2', 'r3'],
      ['r2', 'r1', 'r3'],
    ],
    hints: [
      'Swap 45 and 12 -> [12, 45, 85, 32].',
      'Swap 85 and 32 -> [12, 45, 32, 85].',
      'Swap 45 and 32 -> [12, 32, 45, 85].',
    ],
    explanation: 'Eliminating inversions step-by-step establishes the sorted invariant: for all i, arr[i] <= arr[i+1].',
    xpReward: 45,
  },
};

// --- SPEED CHALLENGE DATA ---

export const SPEED_CHALLENGES: Record<ChallengeTopicId, SpeedChallengeData> = {
  variables: {
    id: 'sc-var-1',
    topicId: 'variables',
    title: 'Type & Memory Blitz',
    lore: 'Rapid evaluation of variable data types and assignment values.',
    timeSeconds: 25,
    xpPerQuestion: 8,
    questions: [
      { id: 'q1', prompt: 'In Python, `x = "42"` is an integer type.', isTrue: false, explanation: 'Enclosed in quotes, "42" is a string (str).' },
      { id: 'q2', prompt: 'Assigning `y = x` copies or references the value of x into y.', isTrue: true, explanation: 'The value stored in register x is assigned to register y.' },
      { id: 'q3', prompt: 'Booleans can hold three states: True, False, and Null.', isTrue: false, explanation: 'A boolean is strictly binary: True or False.' },
      { id: 'q4', prompt: '`const` variables in JavaScript cannot be reassigned.', isTrue: true, explanation: 'const enforces assignment immutability on identifiers.' },
    ],
  },
  io: {
    id: 'sc-io-1',
    topicId: 'io',
    title: 'Console Speed Check',
    lore: 'Rapidly verify input/output behavior and string conversions.',
    timeSeconds: 25,
    xpPerQuestion: 8,
    questions: [
      { id: 'q1', prompt: 'Standard input `input()` always returns data as a string by default.', isTrue: true, explanation: 'User inputs arrive as character text streams.' },
      { id: 'q2', prompt: '`print("A", "B")` in Python separates arguments with a newline by default.', isTrue: false, explanation: 'Default separator is a space (`sep=" "`).' },
      { id: 'q3', prompt: '`parseInt("45.9")` in JavaScript returns 45.', isTrue: true, explanation: 'parseInt parses up to the decimal point.' },
    ],
  },
  conditions: {
    id: 'sc-cond-1',
    topicId: 'conditions',
    title: 'Boolean Gate Blitz',
    lore: 'Test compound boolean logic statements under time pressure.',
    timeSeconds: 25,
    xpPerQuestion: 8,
    questions: [
      { id: 'q1', prompt: '`5 > 3 and 10 < 20` evaluates to True.', isTrue: true, explanation: 'Both sub-expressions are true, so logical AND is true.' },
      { id: 'q2', prompt: '`not (False or True)` evaluates to True.', isTrue: false, explanation: 'False or True is True; NOT True is False.' },
      { id: 'q3', prompt: 'In an if-elif-else chain, multiple matching elif blocks will execute.', isTrue: false, explanation: 'Only the first matching branch executes.' },
    ],
  },
  loops: {
    id: 'sc-loop-1',
    topicId: 'loops',
    title: 'Loop Bounds Sprint',
    lore: 'Verify termination conditions and fencepost boundary invariants.',
    timeSeconds: 25,
    xpPerQuestion: 8,
    questions: [
      { id: 'q1', prompt: '`for i in range(5):` iterates exactly 5 times (0 to 4).', isTrue: true, explanation: 'Range(5) generates indices 0, 1, 2, 3, 4.' },
      { id: 'q2', prompt: 'A while loop with condition `while x > 0:` where x never changes will cause an infinite loop.', isTrue: true, explanation: 'Without progress toward termination, the invariant never breaks.' },
      { id: 'q3', prompt: 'The `break` statement skips to the next iteration of the loop.', isTrue: false, explanation: 'break exits the loop entirely; continue skips to the next iteration.' },
    ],
  },
  arrays: {
    id: 'sc-arr-1',
    topicId: 'arrays',
    title: 'Array Index Reflex',
    lore: 'Rapid index lookups and length calculations.',
    timeSeconds: 25,
    xpPerQuestion: 8,
    questions: [
      { id: 'q1', prompt: 'In a 0-indexed array of length 7, the last valid index is 6.', isTrue: true, explanation: 'Last index is always length - 1.' },
      { id: 'q2', prompt: 'Accessing `arr[-1]` in Python accesses the first element.', isTrue: false, explanation: 'Negative indexing counts backward; -1 accesses the last element.' },
      { id: 'q3', prompt: 'An empty array has a length of 0.', isTrue: true, explanation: 'Array length reflects the count of stored elements.' },
    ],
  },
  functions: {
    id: 'sc-func-1',
    topicId: 'functions',
    title: 'Function Reflex',
    lore: 'Check return values and argument passing.',
    timeSeconds: 25,
    xpPerQuestion: 8,
    questions: [
      { id: 'q1', prompt: 'A function without an explicit return statement returns `None` or `undefined`.', isTrue: true, explanation: 'Default return value is void/None/undefined.' },
      { id: 'q2', prompt: 'Parameters are the actual values passed during a function call.', isTrue: false, explanation: 'Parameters are variables in definition; arguments are values passed in calls.' },
      { id: 'q3', prompt: 'A recursive function must have a base case to terminate.', isTrue: true, explanation: 'Without a base case, recursion causes stack overflow.' },
    ],
  },
  tracing: {
    id: 'sc-trace-1',
    topicId: 'tracing',
    title: 'State Memory Sprint',
    lore: 'Trace variable changes across lines of code in seconds.',
    timeSeconds: 25,
    xpPerQuestion: 8,
    questions: [
      { id: 'q1', prompt: 'If `a = 10; b = a; a = 20;`, the value of b remains 10.', isTrue: true, explanation: 'Primitive integer assignment copies the value.' },
      { id: 'q2', prompt: '`x += 1` is equivalent to `x = x + 1`.', isTrue: true, explanation: 'Compound addition assignment increments the register.' },
      { id: 'q3', prompt: 'In `[1, 2, 3]`, swapping index 0 and 2 yields `[3, 2, 1]`.', isTrue: true, explanation: 'Elements at 0 and 2 trade positions.' },
    ],
  },
  sorting: {
    id: 'sc-sort-1',
    topicId: 'sorting',
    title: 'Sorting Invariant Blitz',
    lore: 'Confirm algorithm complexity and comparative properties.',
    timeSeconds: 25,
    xpPerQuestion: 8,
    questions: [
      { id: 'q1', prompt: 'Bubble Sort compares adjacent elements and swaps if left > right.', isTrue: true, explanation: 'Adjacent comparison is the signature of Bubble Sort.' },
      { id: 'q2', prompt: 'After pass 1 of Bubble Sort, the minimum element is at index 0.', isTrue: false, explanation: 'Bubble Sort bubbles the maximum element to the final index.' },
      { id: 'q3', prompt: 'Selection Sort locates the minimum unsorted element on each pass.', isTrue: true, explanation: 'Selection Sort finds the minimum and places it at the sorted prefix.' },
      { id: 'q4', prompt: 'An already sorted array requires 0 swaps in Bubble Sort with early exit.', isTrue: true, explanation: 'Zero swaps flags that the array is already sorted.' },
    ],
  },
};

// --- ALGORITHM ARENA CHALLENGES ---

export const ALGORITHM_ARENA_CHALLENGES: Record<ChallengeTopicId, AlgorithmArenaChallenge> = {
  variables: {
    id: 'aa-var-1',
    topicId: 'variables',
    title: 'The Register Swap Duel',
    lore: 'Sort the registers by swapping adjacent pairs until values ascend.',
    objective: 'Arrange the array [30, 10, 50, 20] in ascending order using minimum swaps.',
    initialArray: [30, 10, 50, 20],
    targetCondition: 'sorted-asc',
    minMovesTarget: 3,
    hints: ['Swap 30 and 10 first to fix the left inversion.', 'Swap 50 and 20 to move 50 to the end.'],
    explanation: 'By selecting adjacent inversions, you resolve out-of-order pairs until the array is monotonically increasing.',
    xpReward: 40,
  },
  io: {
    id: 'aa-io-1',
    topicId: 'io',
    title: 'The Buffer Sieve Duel',
    lore: 'Organize incoming buffer readings into sorted order.',
    objective: 'Arrange buffer [45, 12, 60, 25] into ascending order.',
    initialArray: [45, 12, 60, 25],
    targetCondition: 'sorted-asc',
    minMovesTarget: 3,
    hints: ['Move 12 to the front by swapping with 45.', 'Resolve the remaining inversions.'],
    explanation: 'Buffer ordering ensures sequential downstream consumers receive ordered records.',
    xpReward: 40,
  },
  conditions: {
    id: 'aa-cond-1',
    topicId: 'conditions',
    title: 'The Parity Partition Battle',
    lore: 'Sort all elements so the maximum element occupies the final position.',
    objective: 'Float the largest element in [25, 80, 15, 60] to the end.',
    initialArray: [25, 80, 15, 60],
    targetCondition: 'max-at-end',
    minMovesTarget: 2,
    hints: ['Identify the maximum element (80).', 'Swap 80 with 15, then with 60.'],
    explanation: 'Bubbling the maximum element to the rightmost index satisfies the Pass 1 invariant of Bubble Sort.',
    xpReward: 40,
  },
  loops: {
    id: 'aa-loop-1',
    topicId: 'loops',
    title: 'The Pass Invariant Arena',
    lore: 'Execute a full bubble pass to sort [70, 20, 50, 30, 90].',
    objective: 'Arrange array [70, 20, 50, 30, 90] in ascending order.',
    initialArray: [70, 20, 50, 30, 90],
    targetCondition: 'sorted-asc',
    minMovesTarget: 4,
    hints: ['Swap 70 and 20 -> [20, 70, 50, 30, 90].', 'Swap 70 and 50, then 70 and 30.'],
    explanation: 'Resolving all adjacent inversions completes the sort.',
    xpReward: 45,
  },
  arrays: {
    id: 'aa-arr-1',
    topicId: 'arrays',
    title: 'The Memory Permutation Arena',
    lore: 'Rearrange array [60, 10, 40, 20] into ascending order.',
    objective: 'Transform [60, 10, 40, 20] into [10, 20, 40, 60].',
    initialArray: [60, 10, 40, 20],
    targetCondition: 'sorted-asc',
    minMovesTarget: 3,
    hints: ['Swap 60 with 10.', 'Swap 60 with 20.', 'Swap 40 with 20.'],
    explanation: 'Array elements swap in-place by updating index contents without extra memory allocation.',
    xpReward: 45,
  },
  functions: {
    id: 'aa-func-1',
    topicId: 'functions',
    title: 'The Call Stack Sorter Arena',
    lore: 'Order recursive return states [85, 39, 69, 12] into ascending sequence.',
    objective: 'Sort [85, 39, 69, 12] in ascending order.',
    initialArray: [85, 39, 69, 12],
    targetCondition: 'sorted-asc',
    minMovesTarget: 4,
    hints: ['Swap 85 and 39.', 'Swap 85 and 12, then 69 and 12.'],
    explanation: 'In-place permutation minimizes auxiliary memory complexity.',
    xpReward: 45,
  },
  tracing: {
    id: 'aa-trace-1',
    topicId: 'tracing',
    title: 'The Invariant Lock Arena',
    lore: 'Move the largest value to the end of [55, 15, 95, 35].',
    objective: 'Sort array [55, 15, 95, 35] in ascending order.',
    initialArray: [55, 15, 95, 35],
    targetCondition: 'sorted-asc',
    minMovesTarget: 3,
    hints: ['Swap 55 and 15.', 'Swap 95 and 35.'],
    explanation: 'Achieving the sorted state satisfies both prefix and suffix invariants.',
    xpReward: 45,
  },
  sorting: {
    id: 'aa-sort-1',
    topicId: 'sorting',
    title: 'The Grand Algorithm Gauntlet',
    lore: 'Prove manual mastery of Bubble and Selection Sort by resolving inversions in [45, 12, 85, 32, 60].',
    objective: 'Sort [45, 12, 85, 32, 60] into [12, 32, 45, 60, 85].',
    initialArray: [45, 12, 85, 32, 60],
    targetCondition: 'sorted-asc',
    minMovesTarget: 4,
    hints: ['Swap 45 and 12.', 'Swap 85 and 32, then 85 and 60.', 'Swap 45 and 32.'],
    explanation: 'Resolving 4 inversions puts all 5 elements into monotonic ascending order.',
    xpReward: 50,
  },
};
