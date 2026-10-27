import React from 'react';
import { WorkspaceMode } from '../types';
import { sound } from '../lib/soundEngine';
import {
  LayoutDashboard,
  Compass,
  Map,
  Eye,
  GitBranch,
  Gamepad2,
  Code2,
  CheckSquare,
  Award,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';

interface SidebarProps {
  currentMode: WorkspaceMode;
  onSelectMode: (mode: WorkspaceMode) => void;
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  isMobileOpen: boolean;
  onCloseMobile: () => void;
  onToggleMentor: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentMode,
  onSelectMode,
  isCollapsed,
  onToggleCollapse,
  isMobileOpen,
  onCloseMobile,
  onToggleMentor,
}) => {
  const MENU_ITEMS: { id: WorkspaceMode | 'mentor'; label: string; icon: any; isSpecial?: boolean }[] = [
    { id: 'dashboard', label: 'Home Dashboard', icon: LayoutDashboard },
    { id: 'start-zero', label: 'Start From Zero', icon: Compass },
    { id: 'map', label: 'Learning Path', icon: Map },
    { id: 'visual', label: 'Visual Lab', icon: Eye },
    { id: 'flowchart', label: 'Flowchart Canvas', icon: GitBranch },
    { id: 'play', label: 'Play & Learn', icon: Gamepad2 },
    { id: 'arena', label: 'Code Arena', icon: Code2 },
    { id: 'assessment', label: 'Assessments', icon: CheckSquare },
    { id: 'badges', label: 'My Skills & Badges', icon: Award },
    { id: 'mentor', label: 'AI Mentor', icon: Sparkles, isSpecial: true },
  ];

  const handleItemClick = (id: WorkspaceMode | 'mentor') => {
    sound.playClick();
    if (id === 'mentor') {
      onToggleMentor();
    } else {
      onSelectMode(id);
    }
    onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-xs md:hidden"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen border-r border-[var(--border)] bg-[var(--card)] transition-all duration-200 flex flex-col justify-between select-none ${
          /* Desktop Width */
          isCollapsed ? 'md:w-16' : 'md:w-60'
        } ${
          /* Mobile Slide-in Drawer */
          isMobileOpen ? 'translate-x-0 w-64' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Top Header Wordmark & Mobile Close */}
        <div>
          <div className="flex h-14 items-center justify-between px-4 border-b border-[var(--border)]">
            <button
              onClick={() => {
                sound.playClick();
                onSelectMode('dashboard');
                onCloseMobile();
              }}
              className="flex items-center gap-1.5 font-mono text-sm font-bold tracking-wider text-[var(--foreground)] hover:opacity-85 transition-opacity"
            >
              <span className="text-[var(--primary)]">SORT</span>
              <span className="text-[var(--muted-foreground)]">//</span>
              <span>LAB</span>
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="md:hidden p-1 rounded-[6px] hover:bg-[var(--muted)] text-[var(--muted-foreground)]"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Desktop Collapse Toggle */}
            <button
              onClick={onToggleCollapse}
              title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
              className="hidden md:flex p-1 rounded-[6px] hover:bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </button>
          </div>

          {/* Nav List */}
          <nav className="p-2 space-y-1 overflow-y-auto max-h-[calc(100vh-120px)]">
            {MENU_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentMode === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  title={isCollapsed ? item.label : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[8px] text-xs font-mono transition-colors text-left ${
                    isActive
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)] font-bold shadow-xs'
                      : item.isSpecial
                      ? 'text-[var(--primary)] hover:bg-[var(--muted)] font-semibold'
                      : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]/50'
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="truncate">{item.label}</span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info when expanded */}
        {(!isCollapsed || isMobileOpen) && (
          <div className="p-3 border-t border-[var(--border)] text-[10px] font-mono text-[var(--muted-foreground)]">
            <div>SORT//LAB Atelier v2.0</div>
            <div>Zero to Algorithms</div>
          </div>
        )}
      </aside>
    </>
  );
};
