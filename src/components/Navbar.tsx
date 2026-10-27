import React from 'react';
import { WorkspaceMode, StudentProfile } from '../types';
import { SupportedLocale, TRANSLATIONS } from '../lib/i18n';
import { sound } from '../lib/soundEngine';
import { Volume2, VolumeX, Sun, Moon, Globe, Sparkles, Menu } from 'lucide-react';
import { Button } from './ui/Button';
import { FlyingButton } from './ui/FlyingButton';

interface NavbarProps {
  currentMode: WorkspaceMode;
  onSelectMode: (mode: WorkspaceMode) => void;
  profile: StudentProfile;
  isMuted: boolean;
  onToggleMute: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  locale: SupportedLocale;
  onSelectLocale: (locale: SupportedLocale) => void;
  isMentorOpen: boolean;
  onToggleMentor: () => void;
  onOpenMobileSidebar: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentMode,
  profile,
  isMuted,
  onToggleMute,
  theme,
  onToggleTheme,
  locale,
  onSelectLocale,
  isMentorOpen,
  onToggleMentor,
  onOpenMobileSidebar,
}) => {
  const t = TRANSLATIONS[locale];

  const MODE_TITLES: Record<WorkspaceMode, string> = {
    dashboard: 'Home Dashboard',
    'start-zero': 'Start From Zero · Level 0',
    lesson: '8-Stage Lesson Journey',
    map: 'Learning Path (Atlas)',
    visual: 'Visual Lab Simulator',
    flowchart: 'Flowchart Canvas Studio',
    play: 'Play & Learn Arcade',
    arena: 'Code Arena & Tests',
    assessment: 'Diagnostic Assessment',
    badges: 'My Skills & Badges',
    onboarding: 'Atelier Intake',
  };

  return (
    <header className="sticky top-0 z-30 w-full border-b border-[var(--border)] bg-[var(--background)]/95 backdrop-blur-md transition-colors">
      <div className="mx-auto flex h-14 w-full items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: Mobile Hamburger & Mode Title */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              sound.playClick();
              onOpenMobileSidebar();
            }}
            className="md:hidden p-1.5 rounded-[6px] hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)]"
            title="Open Menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="font-mono text-xs sm:text-sm font-semibold tracking-wide text-[var(--foreground)] truncate">
            {MODE_TITLES[currentMode] || 'SORT//LAB'}
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Language Switcher (Compact 2-char on mobile, full label on tablet/desktop) */}
          <div className="flex items-center rounded-[8px] border border-[var(--border)] bg-[var(--card)] p-0.5 text-[10px] sm:text-[11px] font-mono">
            <Globe className="h-3 w-3 text-[var(--muted-foreground)] ml-1 mr-0.5 hidden xs:inline" />
            {(['en', 'hi', 'pa'] as SupportedLocale[]).map((loc) => (
              <button
                key={loc}
                onClick={() => {
                  sound.playClick();
                  onSelectLocale(loc);
                }}
                className={`px-1.5 sm:px-2 py-0.5 rounded-[6px] transition-colors ${
                  locale === loc
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-semibold'
                    : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'
                }`}
              >
                {loc.toUpperCase()}
              </button>
            ))}
          </div>

          {/* XP Chip */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[10px] sm:text-[11px] font-mono text-[var(--foreground)]">
            <span className="text-[var(--muted-foreground)]">XP</span>
            <span className="font-semibold tabular-nums text-[var(--primary)]">{profile.xp}</span>
          </div>

          {/* Theme Toggle */}
          <button
            onClick={() => {
              sound.playClick();
              onToggleTheme();
            }}
            title={theme === 'light' ? 'Switch to Dark Arcade' : 'Switch to Light Paper'}
            className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {theme === 'light' ? <Moon className="h-3.5 w-3.5" /> : <Sun className="h-3.5 w-3.5 text-[var(--primary)]" />}
          </button>

          {/* Audio Mute Toggle (hidden on tiny screens < 380px) */}
          <button
            onClick={() => onToggleMute()}
            title={isMuted ? 'Unmute Sound' : 'Mute Sound'}
            className="hidden xs:flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-[8px] border border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            {isMuted ? <VolumeX className="h-3.5 w-3.5" /> : <Volume2 className="h-3.5 w-3.5 text-[var(--primary)]" />}
          </button>

          {/* AI Mentor Drawer Trigger with React Bits Flying Button */}
          <FlyingButton
            onClick={() => {
              sound.playClick();
              onToggleMentor();
            }}
            trigger="click"
            isActive={isMentorOpen}
            ariaLabel="Open AI Mentor"
            className="h-7 sm:h-8 px-2 sm:px-3 text-xs"
          >
            <Sparkles className="h-3.5 w-3.5 text-teal-500 dark:text-teal-300 transition-transform group-hover:scale-110" />
            <span className="hidden sm:inline">{t.actions.askMentor}</span>
            <span className="sm:hidden text-[11px]">Mentor</span>
          </FlyingButton>
        </div>
      </div>
    </header>
  );
};
