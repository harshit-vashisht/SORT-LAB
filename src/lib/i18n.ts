export type SupportedLocale = 'en' | 'hi' | 'pa';

export interface Translations {
  appName: string;
  tabs: {
    visual: string;
    play: string;
    arena: string;
    assessment: string;
  };
  actions: {
    start: string;
    reset: string;
    next: string;
    prev: string;
    play: string;
    pause: string;
    step: string;
    swap: string;
    keep: string;
    runTests: string;
    submit: string;
    askMentor: string;
    downloadSummary: string;
    changeOptions: string;
    needHint: string;
    hideHint: string;
    level1Hint: string;
    level2Hint: string;
    level3Hint: string;
  };
  intake: {
    kicker: string;
    headlinePre: string;
    headlineItalic: string;
    headlinePost: string;
    promise: string;
    selectLevelPrompt: string;
    levels: {
      beginner: { title: string; desc: string };
      intermediate: { title: string; desc: string };
      experienced: { title: string; desc: string };
    };
    languagePrompt: string;
    pacePrompt: string;
    enterStudio: string;
    figCaption: string;
  };
  visual: {
    kicker: string;
    title: string;
    pass: string;
    compare: string;
    step: string;
    figCaption: string;
    presets: string;
    randomize: string;
    predictPrompt: string;
    predictYes: string;
    predictNo: string;
  };
  play: {
    kicker: string;
    title: string;
    streak: string;
    personalBest: string;
    challenges: {
      blitz: string;
      pair: string;
      arranger: string;
      gap: string;
      bug: string;
    };
  };
  arena: {
    kicker: string;
    title: string;
    problemTitle: string;
    problemDesc: string;
    suiteTitle: string;
    statusPassed: string;
    statusFailed: string;
  };
  assessment: {
    kicker: string;
    title: string;
    masteryLabel: string;
    confidence: string;
    evidenceTitle: string;
    portfolioTitle: string;
    statusEvidence: string;
    statusDeveloping: string;
    statusDemonstrated: string;
    skillTreeTitle: string;
    nextCurriculum: string;
  };
  mentor: {
    title: string;
    subtitle: string;
    placeholder: string;
    ladderLevel1: string;
    ladderLevel2: string;
    ladderLevel3: string;
  };
  braid: {
    caption: string;
    tabBars: string;
    tabBraid: string;
    tabOrbit: string;
    tabSplit: string;
    finalized: string;
    crossing: string;
    predictFirst: string;
    predictQuestion: string;
    scrubber: string;
    speed: string;
  };
  orbit: {
    caption: string;
    tabOrbit: string;
    centerComparing: string;
    centerSwapping: string;
    centerSorted: string;
  };
  skillMap: {
    title: string;
    subtitle: string;
    legendTitle: string;
    shapeCircle: string;
    shapeRect: string;
    shapeDiamond: string;
    shapeBadge: string;
    statusLocked: string;
    statusAvailable: string;
    statusInProgress: string;
    statusCompleted: string;
    region1: string;
    region2: string;
    region3: string;
    region4: string;
    region5: string;
    startLesson: string;
    continueLesson: string;
    reviewLesson: string;
  };
}

export const TRANSLATIONS: Record<SupportedLocale, Translations> = {
  en: {
    appName: 'SORT//LAB',
    tabs: {
      visual: 'Visual Lab',
      play: 'Play & Learn',
      arena: 'Code Arena',
      assessment: 'Assessment',
    },
    actions: {
      start: 'Start ↗',
      reset: 'Reset ↺',
      next: 'Next →',
      prev: '← Prev',
      play: 'Play ▶',
      pause: 'Pause ⏸',
      step: 'Step ↷',
      swap: 'Swap ⇄',
      keep: 'Keep ✓',
      runTests: 'Run Tests ↗',
      submit: 'Submit Assessment ↗',
      askMentor: 'AI Mentor ↗',
      downloadSummary: 'Download Summary ↗',
      changeOptions: 'Change Options ↺',
      needHint: 'Need a hint? ↗',
      hideHint: 'Hide hint ✕',
      level1Hint: 'Level 1: Guiding Question',
      level2Hint: 'Level 2: Core Concept',
      level3Hint: 'Level 3: Bug Location',
    },
    intake: {
      kicker: 'LABORATORY PROTOCOL · 01',
      headlinePre: 'Learn it. See it. ',
      headlineItalic: 'Break it.',
      headlinePost: ' Build it.',
      promise: 'A quiet, rigorous computational atelier for algorithmic reasoning.',
      selectLevelPrompt: 'Select your level of experience:',
      levels: {
        beginner: { title: 'Beginner', desc: 'New to sorting invariants and loop bounds' },
        intermediate: { title: 'Intermediate', desc: 'Comfortable with arrays and nested iterations' },
        experienced: { title: 'Experienced', desc: 'Ready for edge cases, stability, and O(n) early exits' },
      },
      languagePrompt: 'Select implementation language:',
      pacePrompt: 'Select studio pace:',
      enterStudio: 'Enter Studio ↗',
      figCaption: 'FIG. 01 · Autonomous Bubble Sort inspection preview, pass 1',
    },
    visual: {
      kicker: 'WORKBENCH · MODE 01',
      title: 'Bubble Sort State Inspector',
      pass: 'PASS',
      compare: 'COMPARE',
      step: 'STEP',
      figCaption: 'FIG. 02 · Bubble sort, active pass adjacent inspection',
      presets: 'Presets:',
      randomize: 'Randomize ↺',
      predictPrompt: 'Will these adjacent elements swap?',
      predictYes: 'Swap ⇄',
      predictNo: 'Keep ✓',
    },
    play: {
      kicker: 'CHALLENGES · MODE 02',
      title: 'Algorithmic Mini-Challenges',
      streak: 'Streak',
      personalBest: 'Personal Best',
      challenges: {
        blitz: '01 / Swap Blitz',
        pair: '02 / Next Pair Predictor',
        arranger: '03 / Manual Arranger',
        gap: '04 / Pseudocode Gap',
        bug: '05 / Bug Hunter',
      },
    },
    arena: {
      kicker: 'EXECUTION · MODE 03',
      title: 'Sandboxed Code Harness',
      problemTitle: 'Problem: In-Place Bubble Sort',
      problemDesc: 'Implement an in-place sort that arranges values in ascending order. Must respect stability and terminate early if already sorted.',
      suiteTitle: 'Verification Suite',
      statusPassed: 'PASSED',
      statusFailed: 'FAILED',
    },
    assessment: {
      kicker: 'DIAGNOSTIC · MODE 04',
      title: 'Honest Mastery Evaluation',
      masteryLabel: 'Mastery Status:',
      confidence: 'Confidence Metric',
      evidenceTitle: 'Observed Learning Evidence',
      portfolioTitle: 'Session Portfolio Summary',
      statusEvidence: 'Needs more evidence',
      statusDeveloping: 'Developing',
      statusDemonstrated: 'Demonstrated',
      skillTreeTitle: 'Concept Coverage Map',
      nextCurriculum: 'Curriculum Tier 02: Selection Sort ↗',
    },
    mentor: {
      title: 'Mentor Workbench',
      subtitle: 'Contextual algorithmic tutor',
      placeholder: 'Ask about comparisons, invariants, or hints...',
      ladderLevel1: 'L1 Question',
      ladderLevel2: 'L2 Concept',
      ladderLevel3: 'L3 Bug Focus',
    },
    braid: {
      caption: 'FIG. 02 · Element journeys across passes',
      tabBars: 'Bars',
      tabBraid: 'Braid',
      tabOrbit: 'Orbit',
      tabSplit: 'Side-by-Side',
      finalized: 'Finalized/Sorted',
      crossing: 'Swap Crossing',
      predictFirst: 'Predict First',
      predictQuestion: 'Where will this element land after the next pass?',
      scrubber: 'Timeline Scrubber',
      speed: 'Playback Speed',
    },
    orbit: {
      caption: 'FIG. 03 · Circular paths through a sorting process',
      tabOrbit: 'Orbit (Circular)',
      centerComparing: 'Comparing Elements',
      centerSwapping: 'Swapping Positions',
      centerSorted: 'Array Fully Sorted',
    },
    skillMap: {
      title: 'Curriculum Roadmap',
      subtitle: 'Structured progression from foundational primitives to advanced algorithms',
      legendTitle: 'Roadmap Guide & Visual Invariants',
      shapeCircle: 'Circle: Foundations & Primitives',
      shapeRect: 'Rounded Rectangle: Interactive Lessons',
      shapeDiamond: 'Diamond: Decision Gates & Challenges',
      shapeBadge: 'Shield/Badge: Milestones & Diagnostics',
      statusLocked: 'Locked: Requires preceding prerequisites',
      statusAvailable: 'Available: Ready to begin or explore',
      statusInProgress: 'In Progress: Partially completed',
      statusCompleted: 'Demonstrated: Full mastery verified',
      region1: '1. Programming Foundations',
      region2: '2. Conditions and Loops',
      region3: '3. Arrays and Strings',
      region4: '4. Searching and Sorting',
      region5: '5. Advanced Algorithms',
      startLesson: 'Start Lesson ↗',
      continueLesson: 'Continue Lesson →',
      reviewLesson: 'Review Lesson ↺',
    },
  },
  hi: {
    appName: 'सॉर्ट//लैब',
    tabs: {
      visual: 'विज़ुअल लैब',
      play: 'अभ्यास व खेल',
      arena: 'कोड अखाड़ा',
      assessment: 'मूल्यांकन',
    },
    actions: {
      start: 'आरंभ ↗',
      reset: 'रीसेट ↺',
      next: 'अगला →',
      prev: '← पिछला',
      play: 'चलाएँ ▶',
      pause: 'रोकें ⏸',
      step: 'कदम ↷',
      swap: 'बदलें ⇄',
      keep: 'रखें ✓',
      runTests: 'टेस्ट चलाएँ ↗',
      submit: 'मूल्यांकन सबमिट करें ↗',
      askMentor: 'एआई मेंटर ↗',
      downloadSummary: 'सारांश डाउनलोड ↗',
      changeOptions: 'विकल्प बदलें ↺',
      needHint: 'संकेत चाहिए? ↗',
      hideHint: 'संकेत छिपाएँ ✕',
      level1Hint: 'स्तर 1: मार्गदर्शक प्रश्न',
      level2Hint: 'स्तर 2: मूल अवधारणा',
      level3Hint: 'स्तर 3: त्रुटि का स्थान',
    },
    intake: {
      kicker: 'प्रयोगशाला प्रोटोकॉल · 01',
      headlinePre: 'इसे समझें। देखें। ',
      headlineItalic: 'परखें।',
      headlinePost: ' बनाएं।',
      promise: 'एल्गोरिदम चिंतन के लिए एक शांत, सटीक कार्यशाला।',
      selectLevelPrompt: 'अपने अनुभव का स्तर चुनें:',
      levels: {
        beginner: { title: 'आरंभिक', desc: 'सॉर्टिंग और लूप सीमाओं से नया परिचय' },
        intermediate: { title: 'मध्यम', desc: 'नेस्टेड लूप और एरे से भलीभांति परिचित' },
        experienced: { title: 'अनुभवी', desc: 'एज केस, स्थिरता और O(n) के लिए तैयार' },
      },
      languagePrompt: 'कोडिंग भाषा चुनें:',
      pacePrompt: 'सीखने की गति चुनें:',
      enterStudio: 'स्टूडियो में प्रवेश ↗',
      figCaption: 'चित्र 01 · बबल सॉर्ट स्वतः निरीक्षण पूर्वावलोकन, पास 1',
    },
    visual: {
      kicker: 'कार्यक्षेत्र · विधा 01',
      title: 'बबल सॉर्ट स्थिति विश्लेषक',
      pass: 'पास',
      compare: 'तुलना',
      step: 'कदम',
      figCaption: 'चित्र 02 · बबल सॉर्ट, सक्रिय तुलना निरीक्षण',
      presets: 'प्रीसेट:',
      randomize: 'यादृच्छिक ↺',
      predictPrompt: 'क्या ये दोनों तत्व आपस में बदलेंगे?',
      predictYes: 'बदलें ⇄',
      predictNo: 'रखें ✓',
    },
    play: {
      kicker: 'चुनौतियाँ · विधा 02',
      title: 'एल्गोरिदम खेल चुनौतियाँ',
      streak: 'लगातार सही',
      personalBest: 'व्यक्तिगत सर्वश्रेष्ठ',
      challenges: {
        blitz: '01 / स्वैप ब्लिट्ज़',
        pair: '02 / अगली जोड़ी का अनुमान',
        arranger: '03 / हस्तचालित संचालक',
        gap: '04 / स्यूडोकोड रिक्त स्थान',
        bug: '05 / बग खोजक',
      },
    },
    arena: {
      kicker: 'कार्यान्वयन · विधा 03',
      title: 'सुरक्षित कोड अभ्यास',
      problemTitle: 'समस्या: इन-प्लेस बबल सॉर्ट',
      problemDesc: 'एक फलन लिखें जो एरे को आरोही क्रम में सॉर्ट करे। स्थिरता और शीघ्र समाप्ति का ध्यान रखें।',
      suiteTitle: 'जाँच परीक्षण सूट',
      statusPassed: 'सफल',
      statusFailed: 'असफल',
    },
    assessment: {
      kicker: 'निदान · विधा 04',
      title: 'ईमानदार दक्षता मूल्यांकन',
      masteryLabel: 'दक्षता स्थिति:',
      confidence: 'विश्वास माप',
      evidenceTitle: 'दर्ज किया गया साक्ष्य',
      portfolioTitle: 'सत्र पोर्टफोलियो सारांश',
      statusEvidence: 'और साक्ष्य की आवश्यकता है',
      statusDeveloping: 'प्रगति पर है',
      statusDemonstrated: 'प्रमाणित हो चुका है',
      skillTreeTitle: 'अवधारणा कवरेज मानचित्र',
      nextCurriculum: 'पाठ्यक्रम स्तर 02: सिलेक्शन सॉर्ट ↗',
    },
    mentor: {
      title: 'मेंटर कार्यक्षेत्र',
      subtitle: 'संदर्भ-सचेत एल्गोरिदम शिक्षक',
      placeholder: 'तुलना, लूप या संकेतों के बारे में पूछें...',
      ladderLevel1: 'स्तर 1 प्रश्न',
      ladderLevel2: 'स्तर 2 अवधारणा',
      ladderLevel3: 'स्तर 3 बग स्थान',
    },
    braid: {
      caption: 'चित्र 02 · पास के दौरान तत्वों का प्रक्षेपवक्र',
      tabBars: 'बार चार्ट',
      tabBraid: 'ब्रेड',
      tabOrbit: 'ऑर्बिट',
      tabSplit: 'दोनों साथ',
      finalized: 'अंतिम/सॉर्टेड',
      crossing: 'स्वैप क्रॉसिंग',
      predictFirst: 'पहले अनुमान लगाएं',
      predictQuestion: 'अगले पास के बाद यह तत्व किस स्थान पर पहुंचेगा?',
      scrubber: 'टाइमलाइन स्क्रबर',
      speed: 'गति',
    },
    orbit: {
      caption: 'चित्र 03 · सॉर्टिंग प्रक्रिया के वृत्ताकार पथ',
      tabOrbit: 'ऑर्बिट (वृत्ताकार)',
      centerComparing: 'तुलना जारी है',
      centerSwapping: 'स्थान बदले जा रहे हैं',
      centerSorted: 'पूरी तरह सॉर्ट हो गया',
    },
    skillMap: {
      title: 'पाठ्यक्रम रोडमैप',
      subtitle: 'प्रोग्रामिंग की बुनियादी बातों से लेकर उन्नत एल्गोरिदम तक की प्रगति',
      legendTitle: 'रोडमैप मार्गदर्शिका और प्रतीक',
      shapeCircle: 'गोलाकार: बुनियादी अवधारणाएं',
      shapeRect: 'आयत: इंटरएक्टिव पाठ',
      shapeDiamond: 'डायमंड: निर्णय और चुनौतियाँ',
      shapeBadge: 'शील्ड: प्रमुख मील के पत्थर',
      statusLocked: 'बंद: पिछले पाठ पूरे करें',
      statusAvailable: 'उपलब्ध: शुरू करने के लिए तैयार',
      statusInProgress: 'प्रगति पर: आंशिक रूप से पूरा',
      statusCompleted: 'प्रमाणित: पूर्ण समझ सिद्ध हुई',
      region1: '1. प्रोग्रामिंग की नींव',
      region2: '2. शर्तें और लूप',
      region3: '3. एरे और स्ट्रिंग्स',
      region4: '4. सर्चिंग और सॉर्टिंग',
      region5: '5. उन्नत एल्गोरिदम',
      startLesson: 'पाठ शुरू करें ↗',
      continueLesson: 'जारी रखें →',
      reviewLesson: 'पुनरावृत्ति ↺',
    },
  },
  pa: {
    appName: 'ਸੌਰਟ//ਲੈਬ',
    tabs: {
      visual: 'ਵਿਜ਼ੂਅਲ ਲੈਬ',
      play: 'ਖੇਡ ਤੇ ਅਭਿਆਸ',
      arena: 'ਕੋਡ ਅਖਾੜਾ',
      assessment: 'ਮੁਲਾਂਕਣ',
    },
    actions: {
      start: 'ਸ਼ੁਰੂ ਕਰੋ ↗',
      reset: 'ਰੀਸੈਟ ↺',
      next: 'ਅਗਲਾ →',
      prev: '← ਪਿਛਲਾ',
      play: 'ਚਲਾਓ ▶',
      pause: 'ਰੋਕੋ ⏸',
      step: 'ਕਦਮ ↷',
      swap: 'ਬਦਲੋ ⇄',
      keep: 'ਰੱਖੋ ✓',
      runTests: 'ਟੈਸਟ ਚਲਾਓ ↗',
      submit: 'ਮੁਲਾਂਕਣ ਜਮ੍ਹਾ ਕਰੋ ↗',
      askMentor: 'ਏਆਈ ਮੈਂਟਰ ↗',
      downloadSummary: 'ਸਾਰ ਡਾਊਨਲੋਡ ↗',
      changeOptions: 'ਵਿਕਲਪ ਬਦਲੋ ↺',
      needHint: 'ਇਸ਼ਾਰਾ ਚਾਹੀਦਾ ਹੈ? ↗',
      hideHint: 'ਇਸ਼ਾਰਾ ਛੁਪਾਓ ✕',
      level1Hint: 'ਪੱਧਰ 1: ਸਵਾਲ',
      level2Hint: 'ਪੱਧਰ 2: ਧਾਰਨਾ',
      level3Hint: 'ਪੱਧਰ 3: ਗ਼ਲਤੀ ਦੀ ਥਾਂ',
    },
    intake: {
      kicker: 'ਪ੍ਰਯੋਗਸ਼ਾਲਾ ਨਿਯਮ · 01',
      headlinePre: 'ਇਸਨੂੰ ਸਿੱਖੋ। ਦੇਖੋ। ',
      headlineItalic: 'ਪਰਖੋ।',
      headlinePost: ' ਬਣਾਓ।',
      promise: 'ਐਲਗੋਰਿਦਮ ਸਿੱਖਣ ਲਈ ਇੱਕ ਸ਼ਾਂਤ ਅਤੇ ਗੰਭੀਰ ਵਰਕਬੈਂਚ।',
      selectLevelPrompt: 'ਆਪਣਾ ਅਨੁਭਵ ਪੱਧਰ ਚੁਣੋ:',
      levels: {
        beginner: { title: 'ਸ਼ੁਰੂਆਤੀ', desc: 'ਸੌਰਟਿੰਗ ਅਤੇ ਲੂਪ ਨਿਯਮਾਂ ਨਾਲ ਨਵਾਂ ਪਛਾਣ' },
        intermediate: { title: 'ਦਰਮਿਆਨਾ', desc: 'ਅਰੇਅ ਅਤੇ ਨੇਸਟਿਡ ਲੂਪਾਂ ਦੀ ਚੰਗੀ ਸਮਝ' },
        experienced: { title: 'ਤਜਰਬੇਕਾਰ', desc: 'ਐਜ ਕੇਸ ਅਤੇ O(n) ਲਈ ਪੂਰੀ ਤਿਆਰੀ' },
      },
      languagePrompt: 'ਕੋਡਿੰਗ ਭਾਸ਼ਾ ਚੁਣੋ:',
      pacePrompt: 'ਸਿੱਖਣ ਦੀ ਗਤੀ ਚੁਣੋ:',
      enterStudio: 'ਸਟੂਡੀਓ ਵਿੱਚ ਦਾਖਲ ਹੋਵੋ ↗',
      figCaption: 'ਚਿੱਤਰ 01 · ਬਬਲ ਸੌਰਟ ਸਵੈ-ਚਾਲਿਤ ਨਿਰੀਖਣ, ਪਾਸ 1',
    },
    visual: {
      kicker: 'ਵਰਕਬੈਂਚ · ਢੰਗ 01',
      title: 'ਬਬਲ ਸੌਰਟ ਸਥਿਤੀ ਨਿਰੀਖਕ',
      pass: 'ਪਾਸ',
      compare: 'ਤੁਲਨਾ',
      step: 'ਕਦਮ',
      figCaption: 'ਚਿੱਤਰ 02 · ਬਬਲ ਸੌਰਟ, ਨਾਲ ਲੱਗਦੇ ਤੱਤਾਂ ਦੀ ਤੁਲਨਾ',
      presets: 'ਪਹਿਲਾਂ ਤੋਂ ਤੈਅ:',
      randomize: 'ਬੇਤਰਤੀਬਾ ↺',
      predictPrompt: 'ਕੀ ਇਹ ਦੋਵੇਂ ਤੱਤ ਆਪਸ ਵਿੱਚ ਬਦਲਣਗੇ?',
      predictYes: 'ਬਦਲੋ ⇄',
      predictNo: 'ਰੱਖੋ ✓',
    },
    play: {
      kicker: 'ਚੁਣੌਤੀਆਂ · ਢੰਗ 02',
      title: 'ਐਲਗੋਰਿਦਮ ਮਿੰਨੀ ਚੁਣੌਤੀਆਂ',
      streak: 'ਲਗਾਤਾਰ ਸਹੀ',
      personalBest: 'ਨਿੱਜੀ ਸਰਵੋਤਮ',
      challenges: {
        blitz: '01 / ਸਵੈਪ ਬਲਿਟਜ਼',
        pair: '02 / ਅਗਲੇ ਜੋੜੇ ਦਾ ਅਨੁਮਾਨ',
        arranger: '03 / ਹੱਥੀਂ ਸੰਚਾਲਕ',
        gap: '04 / ਖ਼ਾਲੀ ਥਾਵਾਂ ਭਰੋ',
        bug: '05 / ਬੱਗ ਲੱਭੋ',
      },
    },
    arena: {
      kicker: 'ਲਾਗੂਕਰਨ · ਢੰਗ 03',
      title: 'ਸੁਰੱਖਿਅਤ ਕੋਡ ਅਭਿਆਸ',
      problemTitle: 'ਸਮੱਸਿਆ: ਇਨ-ਪਲੇਸ ਬਬਲ ਸੌਰਟ',
      problemDesc: 'ਇੱਕ ਫੰਕਸ਼ਨ ਲਿਖੋ ਜੋ ਮੁੱਲਾਂ ਨੂੰ ਵੱਧਦੇ ਕ੍ਰਮ ਵਿੱਚ ਸੌਰਟ ਕਰੇ। ਸਥਿਰਤਾ ਦਾ ਧਿਆਨ ਰੱਖੋ।',
      suiteTitle: 'ਟੈਸਟਿੰਗ ਸੂਟ',
      statusPassed: 'ਪਾਸ',
      statusFailed: 'ਫੇਲ੍ਹ',
    },
    assessment: {
      kicker: 'ਜਾਂਚ · ਢੰਗ 04',
      title: 'ਇਮਾਨਦਾਰ ਮੁਹਾਰਤ ਮੁਲਾਂਕਣ',
      masteryLabel: 'ਮੁਹਾਰਤ ਦੀ ਸਥਿਤੀ:',
      confidence: 'ਵਿਸ਼ਵਾਸ ਮਾਪ',
      evidenceTitle: 'ਦੇਖਿਆ ਗਿਆ ਸਬੂਤ',
      portfolioTitle: 'ਸੈਸ਼ਨ ਪੋਰਟਫੋਲੀਓ ਸਾਰ',
      statusEvidence: 'ਹੋਰ ਸਬੂਤਾਂ ਦੀ ਲੋੜ ਹੈ',
      statusDeveloping: 'ਵਿਕਾਸ ਅਧੀਨ ਹੈ',
      statusDemonstrated: 'ਪ੍ਰਮਾਣਿਤ ਹੈ',
      skillTreeTitle: 'ਧਾਰਨਾ ਕਵਰੇਜ ਨਕਸ਼ਾ',
      nextCurriculum: 'ਅਗਲਾ ਪੱਧਰ: ਸਿਲੈਕਸ਼ਨ ਸੌਰਟ ↗',
    },
    mentor: {
      title: 'ਮੈਂਟਰ ਵਰਕਬੈਂਚ',
      subtitle: 'ਸੰਦਰਭ-ਜਾਣੂ ਐਲਗੋਰਿਦਮ ਸਿੱਖਿਅਕ',
      placeholder: 'ਤੁਲਨਾ, ਲੂਪਾਂ ਜਾਂ ਇਸ਼ਾਰਿਆਂ ਬਾਰੇ ਪੁੱਛੋ...',
      ladderLevel1: 'ਪੱਧਰ 1 ਸਵਾਲ',
      ladderLevel2: 'ਪੱਧਰ 2 ਧਾਰਨਾ',
      ladderLevel3: 'ਪੱਧਰ 3 ਬੱਗ ਫੋਕਸ',
    },
    braid: {
      caption: 'ਚਿੱਤਰ 02 · ਪਾਸਾਂ ਦੌਰਾਨ ਤੱਤਾਂ ਦੀ ਯਾਤਰਾ',
      tabBars: 'ਬਾਰ ਚਾਰਟ',
      tabBraid: 'ਬ੍ਰੇਡ',
      tabOrbit: 'ਔਰਬਿਟ',
      tabSplit: 'ਦੋਵੇਂ ਇਕੱਠੇ',
      finalized: 'ਅੰਤਿਮ/ਸੌਰਟਡ',
      crossing: 'ਸਵੈਪ ਕ੍ਰਾਸਿੰਗ',
      predictFirst: 'ਪਹਿਲਾਂ ਅੰਦਾਜ਼ਾ ਲਗਾਓ',
      predictQuestion: 'ਅਗਲੇ ਪਾਸ ਤੋਂ ਬਾਅਦ ਇਹ ਤੱਤ ਕਿਸ ਸਥਾਨ ਤੇ ਪਹੁੰਚੇਗਾ?',
      scrubber: 'ਸਮਾਂਰੇਖਾ ਸਕ੍ਰਬਰ',
      speed: 'ਰਫ਼ਤਾਰ',
    },
    orbit: {
      caption: 'ਚਿੱਤਰ 03 · ਸੌਰਟਿੰਗ ਪ੍ਰਕਿਰਿਆ ਦੇ ਗੋਲਾਕਾਰ ਰਸਤੇ',
      tabOrbit: 'ਔਰਬਿਟ (ਗੋਲਾਕਾਰ)',
      centerComparing: 'ਤੁਲਨਾ ਜਾਰੀ ਹੈ',
      centerSwapping: 'ਸਥਾਨ ਬਦਲ ਰਹੇ ਹਨ',
      centerSorted: 'ਪੂਰੀ ਤਰ੍ਹਾਂ ਸੌਰਟ ਹੋ ਚੁੱਕਾ ਹੈ',
    },
    skillMap: {
      title: 'ਪਾਠਕ੍ਰਮ ਰੋਡਮੈਪ',
      subtitle: 'ਮੂਲ ਧਾਰਨਾਵਾਂ ਤੋਂ ਲੈ ਕੇ ਉੱਨਤ ਐਲਗੋਰਿਦਮ ਤੱਕ ਦੀ ਤਰੱਕੀ',
      legendTitle: 'ਰੋਡਮੈਪ ਗਾਈਡ ਅਤੇ ਪ੍ਰਤੀਕ',
      shapeCircle: 'ਚੱਕਰ: ਬੁਨਿਆਦੀ ਧਾਰਨਾਵਾਂ',
      shapeRect: 'ਆਇਤਕਾਰ: ਇੰਟਰਐਕਟਿਵ ਪਾਠ',
      shapeDiamond: 'ਹੀਰਾ: ਫੈਸਲੇ ਅਤੇ ਚੁਣੌਤੀਆਂ',
      shapeBadge: 'ਸ਼ੀਲਡ: ਮੁੱਖ ਮੀਲ ਪੱਥਰ',
      statusLocked: 'ਲਾਕ: ਪਹਿਲੇ ਪਾਠ ਪੂਰੇ ਕਰੋ',
      statusAvailable: 'ਉਪਲਬਧ: ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਤਿਆਰ',
      statusInProgress: 'ਜਾਰੀ: ਅੱਧਾ ਪੂਰਾ ਹੋਇਆ',
      statusCompleted: 'ਪ੍ਰਮਾਣਿਤ: ਪੂਰੀ ਮੁਹਾਰਤ ਸਾਬਤ ਹੋਈ',
      region1: '1. ਪ੍ਰੋਗਰਾਮਿੰਗ ਨੀਂਹ',
      region2: '2. ਸ਼ਰਤਾਂ ਅਤੇ ਲੂਪ',
      region3: '3. ਅਰੇਅ ਅਤੇ ਸਟ੍ਰਿੰਗਜ਼',
      region4: '4. ਖੋਜ ਅਤੇ ਸੌਰਟਿੰਗ',
      region5: '5. ਉੱਨਤ ਐਲਗੋਰਿਦਮ',
      startLesson: 'ਪਾਠ ਸ਼ੁਰੂ ਕਰੋ ↗',
      continueLesson: 'ਜਾਰੀ ਰੱਖੋ →',
      reviewLesson: 'ਦੁਹਰਾਓ ↺',
    },
  },
};

/**
 * Detect user's browser language on initial load
 */
export function detectBrowserLocale(): SupportedLocale {
  if (typeof window === 'undefined') return 'en';
  try {
    const saved = localStorage.getItem('sortlab_locale');
    if (saved === 'en' || saved === 'hi' || saved === 'pa') {
      return saved;
    }
    const navLangs = navigator.languages || [navigator.language || ''];
    for (const lang of navLangs) {
      const lower = lang.toLowerCase();
      if (lower.startsWith('hi')) return 'hi';
      if (lower.startsWith('pa')) return 'pa';
    }
  } catch {}
  return 'en';
}

export function saveLocale(loc: SupportedLocale) {
  try {
    localStorage.setItem('sortlab_locale', loc);
  } catch {}
}
