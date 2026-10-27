import { SortStep } from '../types';

export function generateSelectionSortSteps(initialArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  const sortedIndices: number[] = [];

  steps.push({
    type: 'compare',
    array: [...arr],
    indices: [],
    pass: 0,
    comparison: 0,
    pseudocodeLine: 1,
    description: `Initialize Selection Sort on vector of length ${n}. The sorted prefix will grow left-to-right.`,
    swapped: false,
    sortedIndices: [],
  });

  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;

    steps.push({
      type: 'compare',
      array: [...arr],
      indices: [i, minIdx],
      pass: i + 1,
      comparison: 1,
      pseudocodeLine: 2,
      description: `Pass ${i + 1}: Setting initial minimum candidate to index ${i} (value ${arr[i]}).`,
      swapped: false,
      sortedIndices: [...sortedIndices],
    });

    for (let j = i + 1; j < n; j++) {
      const isNewMin = arr[j] < arr[minIdx];
      steps.push({
        type: 'compare',
        array: [...arr],
        indices: [j, minIdx],
        pass: i + 1,
        comparison: j - i,
        pseudocodeLine: 4,
        description: `Comparing candidate arr[${j}] = ${arr[j]} with current minimum arr[${minIdx}] = ${arr[minIdx]}. ${
          isNewMin ? `New minimum discovered at index ${j}!` : 'Candidate is not smaller; maintaining current min.'
        }`,
        swapped: false,
        sortedIndices: [...sortedIndices],
      });

      if (isNewMin) {
        minIdx = j;
        steps.push({
          type: 'select_min',
          array: [...arr],
          indices: [minIdx, i],
          pass: i + 1,
          comparison: j - i,
          pseudocodeLine: 5,
          description: `Updated minimum index register to ${minIdx} (value ${arr[minIdx]}).`,
          swapped: false,
          sortedIndices: [...sortedIndices],
        });
      }
    }

    if (minIdx !== i) {
      const temp = arr[i];
      arr[i] = arr[minIdx];
      arr[minIdx] = temp;

      steps.push({
        type: 'swap',
        array: [...arr],
        indices: [i, minIdx],
        pass: i + 1,
        comparison: n - 1 - i,
        pseudocodeLine: 7,
        description: `Swapping found minimum ${arr[i]} into its permanent sorted index ${i}.`,
        swapped: true,
        sortedIndices: [...sortedIndices, i],
      });
    } else {
      steps.push({
        type: 'no_swap',
        array: [...arr],
        indices: [i, i],
        pass: i + 1,
        comparison: n - 1 - i,
        pseudocodeLine: 7,
        description: `Minimum was already at index ${i}. Zero memory swap needed.`,
        swapped: false,
        sortedIndices: [...sortedIndices, i],
      });
    }

    sortedIndices.push(i);
  }

  sortedIndices.push(n - 1);
  steps.push({
    type: 'sorted',
    array: [...arr],
    indices: [],
    pass: n - 1,
    comparison: 0,
    pseudocodeLine: 8,
    description: `Selection Sort complete. Vector is guaranteed sorted in non-decreasing order with exactly ${n - 1} maximum swaps.`,
    swapped: false,
    sortedIndices: Array.from({ length: n }, (_, k) => k),
  });

  return steps;
}

export function generateInsertionSortSteps(initialArray: number[]): SortStep[] {
  const steps: SortStep[] = [];
  const arr = [...initialArray];
  const n = arr.length;
  const sortedIndices: number[] = [0];

  steps.push({
    type: 'compare',
    array: [...arr],
    indices: [0, 0],
    pass: 0,
    comparison: 0,
    pseudocodeLine: 1,
    description: `Initialize Insertion Sort. Single-element prefix [0..0] (${arr[0]}) is trivially sorted.`,
    swapped: false,
    sortedIndices: [0],
  });

  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;

    steps.push({
      type: 'compare',
      array: [...arr],
      indices: [i, j],
      pass: i,
      comparison: 1,
      pseudocodeLine: 2,
      description: `Pass ${i}: Extracted key = ${key} at index ${i}. Scanning leftward across sorted partition [0..${j}].`,
      swapped: false,
      sortedIndices: [...sortedIndices],
    });

    let comparisonsInPass = 1;
    while (j >= 0 && arr[j] > key) {
      arr[j + 1] = arr[j];
      comparisonsInPass++;

      steps.push({
        type: 'insert',
        array: [...arr],
        indices: [j, j + 1],
        pass: i,
        comparison: comparisonsInPass,
        pseudocodeLine: 5,
        description: `arr[${j}] = ${arr[j]} > ${key}. Shifting element at ${j} rightward to index ${j + 1}.`,
        swapped: true,
        sortedIndices: [...sortedIndices],
      });

      j--;
    }

    arr[j + 1] = key;
    sortedIndices.push(i);

    steps.push({
      type: 'pass_complete',
      array: [...arr],
      indices: [j + 1, j + 1],
      pass: i,
      comparison: comparisonsInPass,
      pseudocodeLine: 7,
      description: `Inserted key ${key} into vacated slot at index ${j + 1}. Sorted prefix now spans [0..${i}].`,
      swapped: false,
      sortedIndices: Array.from({ length: i + 1 }, (_, k) => k),
    });
  }

  steps.push({
    type: 'sorted',
    array: [...arr],
    indices: [],
    pass: n,
    comparison: 0,
    pseudocodeLine: 8,
    description: 'Insertion Sort complete. All elements stably placed with adaptive shift minimization.',
    swapped: false,
    sortedIndices: Array.from({ length: n }, (_, k) => k),
  });

  return steps;
}
