import React, { useState, useEffect } from 'react';
import { WorkspaceMode, StudentProfile } from './types';
import { sound } from './lib/soundEngine';
import { SupportedLocale, detectBrowserLocale, saveLocale } from './lib/i18n';
import { CURRICULUM_TOPICS } from './lib/curriculumData';
import { getProgressionV2, resetToBeginnerProgression } from './lib/progressionEngine';

import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { HomeDashboard } from './components/HomeDashboard';
import { LessonExperience } from './components/LessonExperience';
import { SkillMap } from './components/SkillMap';
import { VisualLab } from './components/VisualLab';
import { FlowchartCanvas } from './components/FlowchartCanvas';
import { PlayAndLearn } from './components/PlayAndLearn';
import { CodeArena } from './components/CodeArena';
import { AdaptiveAssessment } from './components/AdaptiveAssessment';
import { SkillsBadgesView } from './components/SkillsBadgesView';
import { SkillBadgesModal } from './components/SkillBadgesModal';
import { MentorDrawer } from './components/MentorDrawer';

const STORAGE_KEY_PROFILE = 'sortlab_student_profile';
const STORAGE_KEY_THEME = 'sortlab_theme';

const DEFAULT_PROFILE: StudentProfile = {
  experience: 'beginner',
  topic: 'CS Foundations',
  topicId: 'l0-intro',
  language: 'python',
  pace: 'standard',
  completedAtLeastOnePass: false,
  predictionStreak: 0,
  bestStreak: 0,
  xp: 140,
  hintsUsed: 0,
  mistakes: [],
  assessmentCompleted: false,
};

export default function App() {
  const [currentMode, setCurrentMode] = useState<WorkspaceMode>('dashboard');
  const [activeTopicId, setActiveTopicId] = useState<string>('l0-intro');

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isMentorOpen, setIsMentorOpen] = useState<boolean>(false);
  const [isBadgesModalOpen, setIsBadgesModalOpen] = useState<boolean>(false);
  const [mentorInitialMessage, setMentorInitialMessage] = useState<string | null>(null);

  // Theme state: 'light' (Paper) by default, 'dark' (Arcade)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_THEME);
      if (saved === 'light' || saved === 'dark') return saved;
      return 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    try {
      localStorage.setItem(STORAGE_KEY_THEME, theme);
    } catch {}
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const [locale, setLocale] = useState<SupportedLocale>(() => detectBrowserLocale());
  const handleSelectLocale = (loc: SupportedLocale) => {
    setLocale(loc);
    saveLocale(loc);
  };

  const [profile, setProfile] = useState<StudentProfile>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
      return saved ? JSON.parse(saved) : DEFAULT_PROFILE;
    } catch {
      return DEFAULT_PROFILE;
    }
  });

  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());

  const [sessionContext, setSessionContext] = useState<any>({
    mode: 'dashboard',
    topicId: 'l0-intro',
    array: [45, 12, 85, 32, 89, 39, 69, 22],
  });

  const handleUpdateProfile = (updates: Partial<StudentProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updates };
      try {
        localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  const handleToggleMute = () => {
    const nextMuted = sound.toggleMute();
    setIsMuted(nextMuted);
  };

  const handleOpenMentorWithMessage = (msg: string) => {
    setMentorInitialMessage(msg);
    setIsMentorOpen(true);
  };

  const handleNavigateMode = (mode: WorkspaceMode, topicId?: string) => {
    if (topicId) {
      setActiveTopicId(topicId);
    }
    setCurrentMode(mode);
    setSessionContext((prev: any) => ({ ...prev, mode, topicId: topicId || activeTopicId }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleStartFromZero = () => {
    setActiveTopicId('l0-intro');
    setCurrentMode('lesson');
    setSessionContext((prev: any) => ({ ...prev, mode: 'lesson', topicId: 'l0-intro' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Find active topic object for lesson view
  const currentTopic =
    CURRICULUM_TOPICS.find((t) => t.id === activeTopicId) || CURRICULUM_TOPICS[0];

  return (
    <div className="min-h-screen bg-[var(--background)] text-[var(--foreground)] flex flex-row font-sans transition-colors max-w-full overflow-x-hidden">
      {/* 10-Item Collapsible Left Sidebar Shell */}
      <Sidebar
        currentMode={currentMode}
        onSelectMode={(mode) => handleNavigateMode(mode)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
        onToggleMentor={() => setIsMentorOpen((prev) => !prev)}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden">
        {/* Compact Top Navigation Bar */}
        <Navbar
          currentMode={currentMode}
          onSelectMode={(mode) => handleNavigateMode(mode)}
          profile={profile}
          isMuted={isMuted}
          onToggleMute={handleToggleMute}
          theme={theme}
          onToggleTheme={toggleTheme}
          locale={locale}
          onSelectLocale={handleSelectLocale}
          isMentorOpen={isMentorOpen}
          onToggleMentor={() => setIsMentorOpen((prev) => !prev)}
          onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)}
        />

        {/* Main Content Viewport */}
        <main className="flex-1 w-full max-w-[1240px] mx-auto px-4 sm:px-6 py-6 overflow-x-hidden">
          {currentMode === 'dashboard' && (
            <HomeDashboard
              profile={profile}
              onNavigateMode={handleNavigateMode}
              onOpenBadges={() => handleNavigateMode('badges')}
              onOpenMentorWithMessage={handleOpenMentorWithMessage}
              onStartZero={handleStartFromZero}
            />
          )}

          {currentMode === 'start-zero' && (
            <LessonExperience
              topic={CURRICULUM_TOPICS[0]}
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onNavigateMode={handleNavigateMode}
              onOpenMentorWithMessage={handleOpenMentorWithMessage}
            />
          )}

          {currentMode === 'lesson' && (
            <LessonExperience
              topic={currentTopic}
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onNavigateMode={handleNavigateMode}
              onOpenMentorWithMessage={handleOpenMentorWithMessage}
            />
          )}

          {currentMode === 'map' && (
            <SkillMap
              onNavigateLesson={(tId) => handleNavigateMode('lesson', tId)}
              onOpenBadges={() => handleNavigateMode('badges')}
              onOpenMentorWithMessage={handleOpenMentorWithMessage}
            />
          )}

          {currentMode === 'visual' && (
            <VisualLab
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onRequestMentorContext={(ctx) => setSessionContext(ctx)}
              locale={locale}
              initialTopic={activeTopicId.includes('sort') ? (activeTopicId as any) : undefined}
            />
          )}

          {currentMode === 'flowchart' && (
            <FlowchartCanvas
              onAwardXp={(xp) => handleUpdateProfile({ xp: profile.xp + xp })}
              onOpenMentorWithMessage={handleOpenMentorWithMessage}
            />
          )}

          {currentMode === 'play' && (
            <PlayAndLearn
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onRequestMentorContext={(ctx) => setSessionContext(ctx)}
              onOpenMentorWithMessage={handleOpenMentorWithMessage}
              locale={locale}
            />
          )}

          {currentMode === 'arena' && (
            <CodeArena
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onRequestMentorContext={(ctx) => setSessionContext(ctx)}
              onOpenMentorWithMessage={handleOpenMentorWithMessage}
              locale={locale}
            />
          )}

          {currentMode === 'assessment' && (
            <AdaptiveAssessment
              profile={profile}
              onUpdateProfile={handleUpdateProfile}
              onSelectMode={(mode) => handleNavigateMode(mode)}
              locale={locale}
            />
          )}

          {currentMode === 'badges' && (
            <SkillsBadgesView
              onNavigateLesson={(tId) => handleNavigateMode('lesson', tId)}
            />
          )}
        </main>

        {/* Quiet Editorial Footer */}
        <footer className="border-t border-[var(--border)] bg-[var(--background)] py-5 text-xs text-[var(--muted-foreground)]">
          <div className="max-w-[1240px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 font-mono text-[11px]">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[var(--foreground)]">SORT//LAB</span>
              <span>—</span>
              <span>Zero-to-Hero Computer Science Learning Platform</span>
              <span>·</span>
              <span>Level 0 to 5</span>
            </div>

            <div className="flex items-center gap-3">
              <span>Theme: <strong className="capitalize text-[var(--foreground)]">{theme}</strong></span>
              <span>·</span>
              <button
                onClick={() => {
                  sound.playClick();
                  handleNavigateMode('dashboard');
                }}
                className="text-[var(--primary)] hover:underline"
              >
                Dashboard
              </button>
              <span>·</span>
              <button
                onClick={() => {
                  sound.playClick();
                  handleNavigateMode('map');
                }}
                className="text-[var(--muted-foreground)] hover:underline"
              >
                Skill Map
              </button>
            </div>
          </div>
        </footer>
      </div>

      {/* Socratic Mentor Sheet Drawer */}
      <MentorDrawer
        isOpen={isMentorOpen}
        onClose={() => setIsMentorOpen(false)}
        profile={profile}
        sessionContext={sessionContext}
        initialMessageToSend={mentorInitialMessage}
        onClearInitialMessage={() => setMentorInitialMessage(null)}
        locale={locale}
      />

      {/* Skill Badges Quick Modal */}
      <SkillBadgesModal
        isOpen={isBadgesModalOpen}
        onClose={() => setIsBadgesModalOpen(false)}
      />
    </div>
  );
}
