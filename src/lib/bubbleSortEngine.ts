import { SortStep, ProgrammingLanguage } from '../types';

export const PSEUDOCODE_DEFINITIONS: Record<ProgrammingLanguage, { lines: string[]; lineLabels: string[] }> = {
  python: {
    lines: [
      'def bubble_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n):',
      '        swapped = False',
      '        for j in range(0, n - i - 1):',
      '            if arr[j] > arr[j + 1]:',
      '                arr[j], arr[j + 1] = arr[j + 1], arr[j]',
      '                swapped = True',
      '        if not swapped:',
      '            break',
      '    return arr'
    ],
    lineLabels: [
      'Function definition',
      'Get array length',
      'Outer pass loop (0 to n-1)',
      'Reset swapped flag for pass',
      'Inner comparison loop (0 to n-i-1)',
      'Comparison: is left > right?',
      'Swap adjacent elements',
      'Mark swap occurred',
      'Check if any swaps happened',
      'Early exit optimization',
      'Return sorted array'
    ]
  },
  javascript: {
    lines: [
      'function bubbleSort(arr) {',
      '  const n = arr.length;',
      '  for (let i = 0; i < n; i++) {',
      '    let swapped = false;',
      '    for (let j = 0; j < n - i - 1; j++) {',
      '      if (arr[j] > arr[j + 1]) {',
      '        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];',
      '        swapped = true;',
      '      }',
      '    }',
      '    if (!swapped) break;',
      '  }',
      '  return arr;',
      '}'
    ],
    lineLabels: [
      'Function definition',
      'Get array length',
      'Outer loop through passes',
      'Track swaps this pass',
      'Inner loop adjacent pairs',
      'Check if left > right',
      'Swap adjacent elements',
      'Set swapped flag true',
      'End of swap block',
      'End of inner loop',
      'Early break if already sorted',
      'End of outer loop',
      'Return sorted array',
      'Close function'
    ]
  },
  java: {
    lines: [
      'public static void bubbleSort(int[] arr) {',
      '    int n = arr.length;',
      '    for (int i = 0; i < n - 1; i++) {',
      '        boolean swapped = false;',
      '        for (int j = 0; j < n - i - 1; j++) {',
      '            if (arr[j] > arr[j + 1]) {',
      '                int temp = arr[j];',
      '                arr[j] = arr[j + 1];',
      '                arr[j + 1] = temp;',
      '                swapped = true;',
      '            }',
      '        }',
      '        if (!swapped) break;',
      '    }',
      '}'
    ],
    lineLabels: [
      'Method signature',
      'Array length n',
      'Outer pass loop',
      'Reset swapped flag',
      'Inner comparison loop',
      'Evaluate condition arr[j] > arr[j+1]',
      'Store temp variable',
      'Copy right to left',
      'Copy temp to right',
      'Mark swapped = true',
      'End swap block',
      'End inner loop',
      'Early termination check',
      'End outer loop',
      'Close method'
    ]
  },
  cpp: {
    lines: [
      'void bubbleSort(vector<int>& arr) {',
      '    int n = arr.size();',
      '    for (int i = 0; i < n - 1; ++i) {',
      '        bool swapped = false;',
      '        for (int j = 0; j < n - i - 1; ++j) {',
      '            if (arr[j] > arr[j + 1]) {',
      '                std::swap(arr[j], arr[j + 1]);',
      '                swapped = true;',
      '            }',
      '        }',
      '        if (!swapped) break;',
      '    }',
      '}'
    ],
    lineLabels: [
      'Function declaration with reference',
      'Array size n',
      'Outer pass loop',
      'Swapped tracking flag',
      'Inner comparison loop',
      'Compare adjacent values',
      'Swap adjacent elements in-place',
      'Set swapped to true',
      'End conditional',
      'End inner loop',
      'Early break if sorted',
      'End outer loop',
      'Close function'
    ]
  }
};

/**
 * Maps the abstract algorithm phase to the line number for the given language (0-indexed)
 */
export function getLanguageLineIndex(
  lang: ProgrammingLanguage,
  stepType: 'outer_loop' | 'inner_loop' | 'compare' | 'swap' | 'early_exit' | 'done'
): number {
  if (lang === 'python') {
    switch (stepType) {
      case 'outer_loop': return 2;
      case 'inner_loop': return 4;
      case 'compare': return 5;
      case 'swap': return 6;
      case 'early_exit': return 8;
      case 'done': return 10;
    }
  } else if (lang === 'javascript') {
    switch (stepType) {
      case 'outer_loop': return 2;
      case 'inner_loop': return 4;
      case 'compare': return 5;
      case 'swap': return 6;
      case 'early_exit': return 10;
      case 'done': return 12;
    }
  } else if (lang === 'java') {
    switch (stepType) {
      case 'outer_loop': return 2;
      case 'inner_loop': return 4;
      case 'compare': return 5;
      case 'swap': return 6;
      case 'early_exit': return 12;
      case 'done': return 14;
    }
  } else {
    // cpp
    switch (stepType) {
      case 'outer_loop': return 2;
      case 'inner_loop': return 4;
      case 'compare': return 5;
      case 'swap': return 6;
      case 'early_exit': return 10;
      case 'done': return 12;
    }
  }
}

/**
 * Pure deterministic step generator for Bubble Sort
 */
export function generateBubbleSortSteps(initialArray: number[]): SortStep[] {
  const arr = [...initialArray];
  const steps: SortStep[] = [];
  const n = arr.length;

  if (n <= 1) {
    steps.push({
      type: 'sorted',
      array: [...arr],
      indices: [],
      pass: 0,
      comparison: 0,
      pseudocodeLine: 10,
      description: 'Array has 1 or fewer elements. It is trivially sorted.',
      swapped: false,
      sortedIndices: n === 1 ? [0] : [],
    });
    return steps;
  }

  const sortedIndices: number[] = [];
  let comparisonCount = 0;

  // Initial starting state
  steps.push({
    type: 'compare',
    array: [...arr],
    indices: [],
    pass: 0,
    comparison: 0,
    pseudocodeLine: 2,
    description: `Starting Bubble Sort on ${n} elements. Preparing pass 1.`,
    swapped: false,
    sortedIndices: [],
  });

  for (let i = 0; i < n; i++) {
    let swappedInPass = false;
    const passNumber = i + 1;
    let comparisonInPass = 0;

    for (let j = 0; j < n - i - 1; j++) {
      comparisonCount++;
      comparisonInPass++;
      const valA = arr[j];
      const valB = arr[j + 1];

      // Comparison step
      steps.push({
        type: 'compare',
        array: [...arr],
        indices: [j, j + 1],
        pass: passNumber,
        comparison: comparisonInPass,
        pseudocodeLine: 5,
        description: `Comparing arr[${j}] (${valA}) and arr[${j + 1}] (${valB}). Is ${valA} > ${valB}?`,
        swapped: false,
        sortedIndices: [...sortedIndices],
      });

      if (valA > valB) {
        // Swap occurs
        arr[j] = valB;
        arr[j + 1] = valA;
        swappedInPass = true;

        steps.push({
          type: 'swap',
          array: [...arr],
          indices: [j, j + 1],
          pass: passNumber,
          comparison: comparisonInPass,
          pseudocodeLine: 6,
          description: `Yes: ${valA} > ${valB}. Swapped elements so ${valA} moves towards the end.`,
          swapped: true,
          sortedIndices: [...sortedIndices],
        });
      } else {
        // No swap
        steps.push({
          type: 'no_swap',
          array: [...arr],
          indices: [j, j + 1],
          pass: passNumber,
          comparison: comparisonInPass,
          pseudocodeLine: 5,
          description: valA === valB 
            ? `Equal values (${valA} == ${valB}). No swap needed. Preserves stability.`
            : `No: ${valA} <= ${valB}. Elements are already in order. No swap.`,
          swapped: false,
          sortedIndices: [...sortedIndices],
        });
      }
    }

    // Element at n - 1 - i is now guaranteed sorted
    sortedIndices.unshift(n - 1 - i);

    steps.push({
      type: 'pass_complete',
      array: [...arr],
      indices: [],
      pass: passNumber,
      comparison: comparisonInPass,
      pseudocodeLine: 8,
      description: `Pass ${passNumber} complete. Value ${arr[n - 1 - i]} locked into its sorted position at index ${n - 1 - i}.`,
      swapped: swappedInPass,
      sortedIndices: [...sortedIndices],
    });

    // Early break if no swaps occurred this pass
    if (!swappedInPass) {
      // All remaining elements from 0 to n - 1 - i are sorted
      for (let k = 0; k < n - 1 - i; k++) {
        if (!sortedIndices.includes(k)) {
          sortedIndices.push(k);
        }
      }
      sortedIndices.sort((a, b) => a - b);

      steps.push({
        type: 'sorted',
        array: [...arr],
        indices: [],
        pass: passNumber,
        comparison: comparisonInPass,
        pseudocodeLine: 9,
        description: `Early exit: 0 swaps occurred during pass ${passNumber}. Array is already fully sorted!`,
        swapped: false,
        sortedIndices: [...sortedIndices],
      });
      return steps;
    }
  }

  // Final sorted state if loop ran through
  for (let k = 0; k < n; k++) {
    if (!sortedIndices.includes(k)) {
      sortedIndices.push(k);
    }
  }
  sortedIndices.sort((a, b) => a - b);

  steps.push({
    type: 'sorted',
    array: [...arr],
    indices: [],
    pass: n,
    comparison: comparisonCount,
    pseudocodeLine: 10,
    description: `All passes complete! The entire array [${arr.join(', ')}] is sorted in ascending order.`,
    swapped: false,
    sortedIndices: [...sortedIndices],
  });

  return steps;
}
