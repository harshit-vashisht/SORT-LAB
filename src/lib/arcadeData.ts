import { AssessmentQuestion } from '../types';

export interface GapFillChallenge {
  id: string;
  title: string;
  description: string;
  codeSnippet: string[];
  blankLineIndex: number;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
}

export interface BugHunterChallenge {
  id: string;
  title: string;
  code: string;
  options: string[];
  correctOptionIndex: number;
  explanation: string;
  fixDescription: string;
}

export const GAP_FILL_CHALLENGES: GapFillChallenge[] = [
  {
    id: 'gap-1',
    title: 'Inner Loop Bound Optimization',
    description: 'Complete the inner loop range so it avoids re-checking already sorted elements at the end.',
    codeSnippet: [
      'def bubble_sort(arr):',
      '    n = len(arr)',
      '    for i in range(n):',
      '        # Which inner loop range stops before sorted elements?',
      '        ???',
      '            if arr[j] > arr[j + 1]:',
      '                arr[j], arr[j + 1] = arr[j + 1], arr[j]'
    ],
    blankLineIndex: 4,
    options: [
      'for j in range(0, n - i - 1):',
      'for j in range(0, n):',
      'for j in range(i, n):',
      'for j in range(1, n - 1):'
    ],
    correctOptionIndex: 0,
    explanation: 'After pass i, the last i elements are already in their correct sorted positions. Range "0 to n - i - 1" stops exactly before the sorted section and prevents index out-of-bounds when accessing arr[j + 1].'
  },
  {
    id: 'gap-2',
    title: 'Swap Condition for Ascending Order',
    description: 'Fill in the comparison condition to sort from smallest to largest.',
    codeSnippet: [
      'for j in range(0, n - i - 1):',
      '    # We want larger values to move right',
      '    ???',
      '        arr[j], arr[j + 1] = arr[j + 1], arr[j]',
      '        swapped = True'
    ],
    blankLineIndex: 2,
    options: [
      'if arr[j] > arr[j + 1]:',
      'if arr[j] < arr[j + 1]:',
      'if arr[j] == arr[j + 1]:',
      'if arr[j] >= arr[j + 1]:'
    ],
    correctOptionIndex: 0,
    explanation: 'When arr[j] > arr[j + 1], the left element is strictly larger than its right neighbor, so they must be swapped. Using strictly greater (>) also keeps the sort stable!'
  },
  {
    id: 'gap-3',
    title: 'Early Exit Optimization',
    description: 'Detect when the list is already sorted to stop outer loop passes.',
    codeSnippet: [
      '    for i in range(n):',
      '        swapped = False',
      '        for j in range(0, n - i - 1):',
      '            if arr[j] > arr[j + 1]:',
      '                arr[j], arr[j + 1] = arr[j + 1], arr[j]',
      '                swapped = True',
      '        # Stop early if no swaps occurred',
      '        ???'
    ],
    blankLineIndex: 7,
    options: [
      'if not swapped: break',
      'if swapped: break',
      'if i == n - 1: return arr',
      'swapped = False'
    ],
    correctOptionIndex: 0,
    explanation: 'If a full pass finishes with 0 swaps, every adjacent pair was already in order (arr[j] <= arr[j + 1]), meaning the entire list is sorted! Breaking early reduces best-case time to O(n).'
  }
];

export const BUG_HUNTER_CHALLENGES: BugHunterChallenge[] = [
  {
    id: 'bug-1',
    title: 'Index Out of Range Crash',
    code: `def broken_bubble(arr):
    n = len(arr)
    for i in range(n):
        for j in range(n):
            if arr[j] > arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
    options: [
      'The inner loop range(n) causes arr[j + 1] to access index n, raising IndexError.',
      'The outer loop should start at index 1.',
      'The swap syntax is invalid in Python.',
      'The function must take two arrays instead of one.'
    ],
    correctOptionIndex: 0,
    explanation: 'When j reaches n - 1, accessing arr[j + 1] attempts to read arr[n], which is past the end of the array. The inner loop must stop at n - 1 or n - i - 1.',
    fixDescription: 'Change "for j in range(n):" to "for j in range(0, n - i - 1):"'
  },
  {
    id: 'bug-2',
    title: 'Inverted Sort Direction',
    code: `def sort_ascending(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] < arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
    options: [
      'The condition arr[j] < arr[j + 1] sorts the array in descending order instead of ascending.',
      'The return statement should be inside the inner loop.',
      'The swapped flag is missing.',
      'The array length calculation is off by one.'
    ],
    correctOptionIndex: 0,
    explanation: 'Swapping when arr[j] < arr[j + 1] pushes smaller values right and bubbles the maximum values to the front, producing a descending list.',
    fixDescription: 'Change "arr[j] < arr[j + 1]" to "arr[j] > arr[j + 1]".'
  },
  {
    id: 'bug-3',
    title: 'Unstable Sorting on Equal Keys',
    code: `def unstable_bubble(arr):
    n = len(arr)
    for i in range(n):
        for j in range(0, n - i - 1):
            if arr[j] >= arr[j + 1]:
                arr[j], arr[j + 1] = arr[j + 1], arr[j]
    return arr`,
    options: [
      'Using ">=" swaps equal elements, which violates algorithm stability.',
      'The algorithm does not sort negative numbers.',
      'Equal elements cause an infinite loop.',
      'The function fails on lists with odd length.'
    ],
    correctOptionIndex: 0,
    explanation: 'A sorting algorithm is stable if equal elements retain their original relative order. Swapping when arr[j] == arr[j+1] unnecessarily reorders identical items and wastes CPU cycles.',
    fixDescription: 'Use strict inequality ">" instead of ">=".'
  }
];

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: 'q1',
    prompt: 'After the first full pass of standard Bubble Sort on an array of length n, which element is guaranteed to be in its final sorted position?',
    options: [
      'The largest element, locked at the last index (n - 1)',
      'The smallest element, locked at index 0',
      'The median element, locked in the center',
      'No element is guaranteed until all passes finish'
    ],
    correctIndex: 0,
    explanation: 'In each pass, adjacent comparisons push the largest unsorted element step-by-step toward the rightmost unsorted position.',
    category: 'conceptual'
  },
  {
    id: 'q2',
    prompt: 'Given the array [5, 1, 4, 2, 8], how many swaps will occur during the first pass?',
    options: [
      '2 swaps (5 with 1, then 5 with 4, then 5 with 2)',
      '3 swaps (5 with 1, 5 with 4, 5 with 2, but 5 < 8 so no swap with 8)',
      '4 swaps (every comparison swaps)',
      '1 swap (only 5 with 1)'
    ],
    correctIndex: 1,
    explanation: '1. (5, 1) -> swap -> [1, 5, 4, 2, 8]\n2. (5, 4) -> swap -> [1, 4, 5, 2, 8]\n3. (5, 2) -> swap -> [1, 4, 2, 5, 8]\n4. (5, 8) -> 5 < 8 -> no swap!\nTotal = 3 swaps.',
    category: 'prediction'
  },
  {
    id: 'q3',
    prompt: 'What is the best-case time complexity of Bubble Sort when an early-exit "swapped" flag optimization is implemented?',
    options: [
      'O(n) linear time',
      'O(n log n)',
      'O(n²) quadratic time',
      'O(1) constant time'
    ],
    correctIndex: 0,
    explanation: 'If the input array is already sorted, the algorithm performs n - 1 comparisons in the first pass, detects 0 swaps, and terminates immediately in O(n) time.',
    category: 'complexity'
  },
  {
    id: 'q4',
    prompt: 'Why is Bubble Sort classified as an in-place sorting algorithm?',
    options: [
      'It only requires O(1) auxiliary memory because elements are swapped directly within the input array',
      'It creates a new sorted array and deletes the original array',
      'It runs in linear time',
      'It never moves memory locations on disk'
    ],
    correctIndex: 0,
    explanation: 'An in-place algorithm sorts without requiring additional proportional memory; Bubble Sort only needs a single temporary variable for swapping, so auxiliary space is O(1).',
    category: 'conceptual'
  },
  {
    id: 'q5',
    prompt: 'Suppose an array contains identical duplicate values like [4, 2, 4, 1]. Why does Bubble Sort preserve the relative order of the two 4s (stability)?',
    options: [
      'Because the comparison condition "arr[j] > arr[j + 1]" evaluates to false when elements are equal, skipping unnecessary swaps',
      'Because duplicate elements are placed into a separate hash set',
      'Because it sorts from right to left',
      'Bubble Sort is not stable'
    ],
    correctIndex: 0,
    explanation: 'When comparing two identical elements (4 and 4), 4 > 4 is false. Therefore no swap occurs, preserving the original appearance order.',
    category: 'edge-case'
  }
];
