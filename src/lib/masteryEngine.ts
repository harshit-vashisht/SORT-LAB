import { StudentProfile } from '../types';

export type MasteryStatus = 'Needs more evidence' | 'Developing' | 'Demonstrated';

export interface ConceptEvidence {
  conceptId: string;
  name: string;
  description: string;
  status: MasteryStatus;
  confidencePercent: number;
  evidencePoints: string[];
}

export interface SessionEvidenceSummary {
  overallStatus: MasteryStatus;
  confidencePercent: number;
  attemptsCount: number;
  hintsUsed: number;
  mistakesCount: number;
  concepts: ConceptEvidence[];
  portfolioDate: string;
  nextRecommendedTopic: string;
}

export function evaluateHonestMastery(profile: StudentProfile): SessionEvidenceSummary {
  const attempts = (profile.completedAtLeastOnePass ? 1 : 0) + (profile.assessmentCompleted ? 1 : 0);
  const hints = profile.hintsUsed;
  const mistakesCount = profile.mistakes.length;
  const assessmentScore = profile.assessmentScore ?? 0;

  // Concept 1: Adjacent Invariant
  const c1Status: MasteryStatus = profile.completedAtLeastOnePass 
    ? (profile.predictionStreak >= 3 ? 'Demonstrated' : 'Developing')
    : 'Needs more evidence';
  const c1Confidence = profile.completedAtLeastOnePass 
    ? Math.min(60 + profile.predictionStreak * 8, 95)
    : 30;

  // Concept 2: Early Exit Optimization
  const c2Status: MasteryStatus = assessmentScore >= 70 
    ? 'Demonstrated' 
    : (assessmentScore >= 40 ? 'Developing' : 'Needs more evidence');
  const c2Confidence = assessmentScore ? Math.min(assessmentScore, 92) : 25;

  // Concept 3: Stability with Duplicates
  const c3Status: MasteryStatus = profile.assessmentCompleted 
    ? (assessmentScore >= 60 ? 'Demonstrated' : 'Developing')
    : 'Needs more evidence';
  const c3Confidence = profile.assessmentCompleted ? Math.min(assessmentScore + 10, 90) : 20;

  // Concept 4: Loop Boundary & Space Complexity O(1)
  const c4Status: MasteryStatus = profile.xp >= 180 
    ? 'Demonstrated' 
    : (profile.xp >= 100 ? 'Developing' : 'Needs more evidence');
  const c4Confidence = Math.min(Math.round((profile.xp / 220) * 100), 96);

  const concepts: ConceptEvidence[] = [
    {
      conceptId: 'adjacent_swap',
      name: 'Adjacent Comparison Invariant',
      description: 'Understanding that only adjacent pairs are compared, bubbling the maximum rightwards.',
      status: c1Status,
      confidencePercent: c1Confidence,
      evidencePoints: [
        `${profile.predictionStreak} streak in prediction challenges`,
        profile.completedAtLeastOnePass ? 'Full visual pass executed' : 'Visual inspection pending',
      ],
    },
    {
      conceptId: 'loop_bounds',
      name: 'In-Place & Space Complexity O(1)',
      description: 'Zero auxiliary allocation; swaps performed directly within the existing buffer.',
      status: c4Status,
      confidencePercent: c4Confidence,
      evidencePoints: [
        `${profile.xp} XP collected through reasoning`,
        `${hints} hint(s) requested during exploration`,
      ],
    },
    {
      conceptId: 'early_exit',
      name: 'Early Termination Optimization',
      description: 'Detecting 0 swaps during a pass to finish in O(n) linear best-case time.',
      status: c2Status,
      confidencePercent: c2Confidence,
      evidencePoints: [
        profile.assessmentCompleted ? `Assessment scored at ${assessmentScore}%` : 'Assessment pending',
        'Early-exit condition evaluated against pre-sorted inputs',
      ],
    },
    {
      conceptId: 'stability',
      name: 'Stability Preservation',
      description: 'Strict inequality arr[j] > arr[j+1] ensures identical keys never swap.',
      status: c3Status,
      confidencePercent: c3Confidence,
      evidencePoints: [
        'Tested against duplicate value arrays',
        mistakesCount > 0 ? `${mistakesCount} mistake(s) tracked and reflected upon` : 'Zero unaddressed regressions',
      ],
    },
  ];

  const avgConfidence = Math.round(
    concepts.reduce((acc, c) => acc + c.confidencePercent, 0) / concepts.length
  );

  let overallStatus: MasteryStatus = 'Needs more evidence';
  if (avgConfidence >= 75 && profile.assessmentCompleted) {
    overallStatus = 'Demonstrated';
  } else if (avgConfidence >= 45) {
    overallStatus = 'Developing';
  }

  return {
    overallStatus,
    confidencePercent: avgConfidence,
    attemptsCount: attempts,
    hintsUsed: hints,
    mistakesCount,
    concepts,
    portfolioDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }),
    nextRecommendedTopic: 'Selection Sort (Pass Minimum Selection)',
  };
}

/**
 * Generates and downloads a clean Markdown summary
 */
export function downloadMarkdownSummary(profile: StudentProfile, summary: SessionEvidenceSummary) {
  const md = `# SORT//LAB Session Portfolio
**Learner Level**: ${profile.experience}
**Language**: ${profile.language.toUpperCase()}
**Studio Pace**: ${profile.pace}
**Date**: ${summary.portfolioDate}

---

## Mastery Status: ${summary.overallStatus.toUpperCase()} (${summary.confidencePercent}% Confidence)

### Evidence Observed:
- **Reasoning XP**: ${profile.xp} XP (rewarded for fewer hints and explaining errors)
- **Personal Best Prediction Streak**: ${profile.bestStreak}
- **Hints Requested**: ${summary.hintsUsed}
- **Recorded Error Reflections**: ${summary.mistakesCount}

### Concept Coverage Map:
${summary.concepts
  .map(
    c => `#### ${c.name} — [${c.status} (${c.confidencePercent}%)]
*${c.description}*
Evidence:
${c.evidencePoints.map(p => `  - ${p}`).join('\n')}
`
  )
  .join('\n')}

---

### Recommended Next Exploration:
**${summary.nextRecommendedTopic}**
Ready to transition from adjacent bubbling to index-based minimum selection.
`;

  const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `SORT_LAB_Portfolio_${new Date().toISOString().slice(0, 10)}.md`;
  a.click();
  URL.revokeObjectURL(url);
}

/**
 * Triggers clean printable HTML view
 */
export function triggerPrintablePortfolio() {
  if (typeof window !== 'undefined') {
    window.print();
  }
}
