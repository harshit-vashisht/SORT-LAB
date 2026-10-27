export interface BraidElement {
  id: string; // unique identifier for the element instance
  initialValue: number;
  initialIndex: number;
}

export interface BraidPassState {
  passNumber: number; // 0 = initial state, 1..N
  passTitle: string;
  order: BraidElement[]; // array of elements in their current position 0..n-1
  activeComparisonIndices?: [number, number]; // indices being compared in this pass
  swappedIndices?: [number, number]; // indices swapped in this pass
  finalizedIndices: number[]; // indices now permanently in their final sorted position
  description: string;
  pseudocodeLine: number;
}

export interface BraidSwapCrossing {
  passNumber: number;
  fromIndexA: number;
  toIndexA: number;
  fromIndexB: number;
  toIndexB: number;
  elementA: BraidElement;
  elementB: BraidElement;
  reason: string;
}

export interface BraidTrajectory {
  element: BraidElement;
  color: string;
  dashStyle?: string;
  positions: { passNumber: number; index: number; isFinalized: boolean }[];
}

export interface BraidTrace {
  algorithm: 'bubble-sort' | 'selection-sort' | 'insertion-sort';
  initialArray: number[];
  elements: BraidElement[];
  passes: BraidPassState[];
  crossings: BraidSwapCrossing[];
  trajectories: BraidTrajectory[];
  totalPasses: number;
}

// 8 distinct high-contrast accessible color palette for trajectories
export const BRAID_PALETTE = [
  '#2E7D32', // Deep Forest Emerald
  '#1565C0', // Royal Cobalt
  '#C62828', // Crimson Red
  '#E65100', // Burnt Amber / Orange
  '#6A1B9A', // Imperial Purple
  '#00838F', // Ocean Teal
  '#D81B60', // Berry Pink
  '#4E342E', // Warm Umber / Bronze
];

/**
 * Generate a complete Braid trace with pass-by-pass snapshots and trajectories
 */
export function generateBraidTrace(
  algorithm: 'bubble-sort' | 'selection-sort' | 'insertion-sort',
  initialValues: number[]
): BraidTrace {
  const elements: BraidElement[] = initialValues.map((val, idx) => ({
    id: `el-${idx}-${val}`,
    initialValue: val,
    initialIndex: idx,
  }));

  if (algorithm === 'bubble-sort') {
    return generateBubbleBraidTrace(elements, initialValues);
  } else if (algorithm === 'selection-sort') {
    return generateSelectionBraidTrace(elements, initialValues);
  } else {
    return generateInsertionBraidTrace(elements, initialValues);
  }
}

/**
 * Bubble Sort Pass-by-Pass Braid Generator
 */
function generateBubbleBraidTrace(
  initialElements: BraidElement[],
  initialValues: number[]
): BraidTrace {
  const n = initialElements.length;
  let currentOrder = [...initialElements];
  const passes: BraidPassState[] = [];
  const crossings: BraidSwapCrossing[] = [];

  // Pass 0: Initial configuration
  passes.push({
    passNumber: 0,
    passTitle: 'Initial Vector',
    order: [...currentOrder],
    finalizedIndices: [],
    description: 'Initial unsorted arrangement of elements.',
    pseudocodeLine: 1,
  });

  const finalizedIndices: number[] = [];

  for (let pass = 0; pass < n - 1; pass++) {
    let swappedAny = false;
    const prevOrder = [...currentOrder];

    for (let j = 0; j < n - pass - 1; j++) {
      if (currentOrder[j].initialValue > currentOrder[j + 1].initialValue) {
        // Swap
        const elA = currentOrder[j];
        const elB = currentOrder[j + 1];

        currentOrder[j] = elB;
        currentOrder[j + 1] = elA;
        swappedAny = true;

        crossings.push({
          passNumber: pass + 1,
          fromIndexA: j,
          toIndexA: j + 1,
          fromIndexB: j + 1,
          toIndexB: j,
          elementA: elA,
          elementB: elB,
          reason: `${elA.initialValue} > ${elB.initialValue}`,
        });
      }
    }

    // Element at n - pass - 1 is now finalized in its correct position
    const lockedIndex = n - pass - 1;
    if (!finalizedIndices.includes(lockedIndex)) {
      finalizedIndices.push(lockedIndex);
    }

    passes.push({
      passNumber: pass + 1,
      passTitle: `Pass ${pass + 1}`,
      order: [...currentOrder],
      finalizedIndices: [...finalizedIndices],
      description: `Pass ${pass + 1}: Bubble phase completed. Position [${lockedIndex}] finalized with maximum remaining value (${currentOrder[lockedIndex].initialValue}).`,
      pseudocodeLine: 3,
    });

    if (!swappedAny) {
      // Early exit optimization
      for (let k = 0; k < n; k++) {
        if (!finalizedIndices.includes(k)) finalizedIndices.push(k);
      }
      passes[passes.length - 1].description += ' (Early exit triggered: No swaps detected).';
      passes[passes.length - 1].finalizedIndices = [...finalizedIndices];
      break;
    }
  }

  // Ensure all indices finalized at the end
  for (let k = 0; k < n; k++) {
    if (!finalizedIndices.includes(k)) finalizedIndices.push(k);
  }
  if (passes[passes.length - 1]) {
    passes[passes.length - 1].finalizedIndices = [...finalizedIndices];
  }

  const trajectories = buildTrajectories(initialElements, passes);

  return {
    algorithm: 'bubble-sort',
    initialArray: initialValues,
    elements: initialElements,
    passes,
    crossings,
    trajectories,
    totalPasses: passes.length - 1,
  };
}

/**
 * Selection Sort Pass-by-Pass Braid Generator
 */
function generateSelectionBraidTrace(
  initialElements: BraidElement[],
  initialValues: number[]
): BraidTrace {
  const n = initialElements.length;
  let currentOrder = [...initialElements];
  const passes: BraidPassState[] = [];
  const crossings: BraidSwapCrossing[] = [];
  const finalizedIndices: number[] = [];

  // Pass 0: Initial
  passes.push({
    passNumber: 0,
    passTitle: 'Initial Vector',
    order: [...currentOrder],
    finalizedIndices: [],
    description: 'Initial unsorted arrangement of elements.',
    pseudocodeLine: 1,
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    for (let j = i + 1; j < n; j++) {
      if (currentOrder[j].initialValue < currentOrder[minIdx].initialValue) {
        minIdx = j;
      }
    }

    if (minIdx !== i) {
      const elA = currentOrder[i];
      const elB = currentOrder[minIdx];

      currentOrder[i] = elB;
      currentOrder[minIdx] = elA;

      crossings.push({
        passNumber: i + 1,
        fromIndexA: i,
        toIndexA: minIdx,
        fromIndexB: minIdx,
        toIndexB: i,
        elementA: elA,
        elementB: elB,
        reason: `${elB.initialValue} is minimum from index ${i} to ${n - 1}`,
      });
    }

    finalizedIndices.push(i);

    passes.push({
      passNumber: i + 1,
      passTitle: `Pass ${i + 1}`,
      order: [...currentOrder],
      finalizedIndices: [...finalizedIndices],
      description: `Pass ${i + 1}: Found smallest remaining element (${currentOrder[i].initialValue}) and placed into position [${i}].`,
      pseudocodeLine: 2,
    });
  }

  // Final element is also sorted
  if (!finalizedIndices.includes(n - 1)) finalizedIndices.push(n - 1);
  if (passes[passes.length - 1]) {
    passes[passes.length - 1].finalizedIndices = [...finalizedIndices];
  }

  const trajectories = buildTrajectories(initialElements, passes);

  return {
    algorithm: 'selection-sort',
    initialArray: initialValues,
    elements: initialElements,
    passes,
    crossings,
    trajectories,
    totalPasses: passes.length - 1,
  };
}

/**
 * Insertion Sort Pass-by-Pass Braid Generator
 */
function generateInsertionBraidTrace(
  initialElements: BraidElement[],
  initialValues: number[]
): BraidTrace {
  const n = initialElements.length;
  let currentOrder = [...initialElements];
  const passes: BraidPassState[] = [];
  const crossings: BraidSwapCrossing[] = [];
  const finalizedIndices: number[] = [0];

  // Pass 0: Initial
  passes.push({
    passNumber: 0,
    passTitle: 'Initial Vector',
    order: [...currentOrder],
    finalizedIndices: [0],
    description: 'Initial arrangement: single element at index 0 is trivially sorted.',
    pseudocodeLine: 1,
  });

  for (let i = 1; i < n; i++) {
    const key = currentOrder[i];
    let j = i - 1;

    // Shift elements of currentOrder[0..i-1] that are greater than key to one position ahead
    while (j >= 0 && currentOrder[j].initialValue > key.initialValue) {
      const elShifted = currentOrder[j];
      currentOrder[j + 1] = elShifted;

      crossings.push({
        passNumber: i,
        fromIndexA: j,
        toIndexA: j + 1,
        fromIndexB: j + 1,
        toIndexB: j,
        elementA: elShifted,
        elementB: key,
        reason: `${elShifted.initialValue} > ${key.initialValue}`,
      });

      j--;
    }
    currentOrder[j + 1] = key;
    finalizedIndices.push(i);

    passes.push({
      passNumber: i,
      passTitle: `Pass ${i}`,
      order: [...currentOrder],
      finalizedIndices: Array.from({ length: i + 1 }, (_, k) => k),
      description: `Pass ${i}: Inserted key (${key.initialValue}) into its proper position [${j + 1}] within sorted prefix [0..${i}].`,
      pseudocodeLine: 3,
    });
  }

  const trajectories = buildTrajectories(initialElements, passes);

  return {
    algorithm: 'insertion-sort',
    initialArray: initialValues,
    elements: initialElements,
    passes,
    crossings,
    trajectories,
    totalPasses: passes.length - 1,
  };
}

/**
 * Build continuous coordinate trajectories for each element across passes
 */
function buildTrajectories(
  elements: BraidElement[],
  passes: BraidPassState[]
): BraidTrajectory[] {
  return elements.map((element, elIdx) => {
    const color = BRAID_PALETTE[elIdx % BRAID_PALETTE.length];
    const positions = passes.map((pass) => {
      const idx = pass.order.findIndex((item) => item.id === element.id);
      const isFinalized = pass.finalizedIndices.includes(idx);
      return {
        passNumber: pass.passNumber,
        index: idx,
        isFinalized,
      };
    });

    return {
      element,
      color,
      positions,
    };
  });
}

/**
 * Predict First validation logic per algorithm:
 * Determines the target element and its correct landing position for the upcoming pass.
 */
export interface PredictTarget {
  targetElement: BraidElement;
  currentPosition: number;
  expectedNextPosition: number;
  question: string;
  rationale: string;
}

export function getPredictTargetForPass(
  trace: BraidTrace,
  currentPassNumber: number
): PredictTarget | null {
  const currentPass = trace.passes[currentPassNumber];
  const nextPass = trace.passes[currentPassNumber + 1];
  if (!currentPass || !nextPass) return null;

  const n = currentPass.order.length;

  if (trace.algorithm === 'bubble-sort') {
    // In bubble sort, find the largest unsorted element in current pass
    // Unsorted portion is 0 to n - currentPassNumber - 1
    const unsortedLimit = n - currentPassNumber;
    let maxVal = -Infinity;
    let targetEl: BraidElement = currentPass.order[0];
    let currIdx = 0;

    for (let i = 0; i < unsortedLimit; i++) {
      if (currentPass.order[i].initialValue > maxVal) {
        maxVal = currentPass.order[i].initialValue;
        targetEl = currentPass.order[i];
        currIdx = i;
      }
    }

    const nextIdx = nextPass.order.findIndex((el) => el.id === targetEl.id);

    return {
      targetElement: targetEl,
      currentPosition: currIdx,
      expectedNextPosition: nextIdx,
      question: `In Bubble Sort Pass ${currentPassNumber + 1}, where will the largest unsorted element [${targetEl.initialValue}] bubble up to?`,
      rationale: `Bubble Sort bubbles the maximum remaining value to the end of the unsorted segment (index ${nextIdx}).`,
    };
  } else if (trace.algorithm === 'selection-sort') {
    // In selection sort, the pass selects the minimum element from index currentPassNumber to n-1
    const startIdx = currentPassNumber;
    let minVal = Infinity;
    let targetEl: BraidElement = currentPass.order[startIdx];
    let currIdx = startIdx;

    for (let i = startIdx; i < n; i++) {
      if (currentPass.order[i].initialValue < minVal) {
        minVal = currentPass.order[i].initialValue;
        targetEl = currentPass.order[i];
        currIdx = i;
      }
    }

    const nextIdx = nextPass.order.findIndex((el) => el.id === targetEl.id);

    return {
      targetElement: targetEl,
      currentPosition: currIdx,
      expectedNextPosition: nextIdx,
      question: `In Selection Sort Pass ${currentPassNumber + 1}, where will the minimum element [${targetEl.initialValue}] be placed?`,
      rationale: `Selection Sort locates the minimum remaining element and swaps it to position [${startIdx}].`,
    };
  } else {
    // Insertion sort
    // Pass takes element at index (currentPassNumber + 1) and inserts into prefix
    const keyIdx = currentPassNumber + 1;
    if (keyIdx >= n) return null;
    const targetEl = currentPass.order[keyIdx];
    const nextIdx = nextPass.order.findIndex((el) => el.id === targetEl.id);

    return {
      targetElement: targetEl,
      currentPosition: keyIdx,
      expectedNextPosition: nextIdx,
      question: `In Insertion Sort Pass ${currentPassNumber + 1}, where will the new key [${targetEl.initialValue}] settle within the sorted prefix?`,
      rationale: `Insertion Sort slides elements larger than ${targetEl.initialValue} rightward, placing the key at index [${nextIdx}].`,
    };
  }
}
