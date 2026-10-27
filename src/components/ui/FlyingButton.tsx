import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles } from 'lucide-react';

export interface FlyingButtonProps {
  children?: React.ReactNode;
  onClick?: () => void;
  trigger?: 'click' | 'hover';
  className?: string;
  disabled?: boolean;
  flyingContent?: React.ReactNode;
  flightDuration?: number;
  ariaLabel?: string;
  isActive?: boolean;
}

interface FlyingItem {
  id: number;
  startX: number;
  startY: number;
  deltaX: number;
  deltaY: number;
}

export const FlyingButton: React.FC<FlyingButtonProps> = ({
  children,
  onClick,
  trigger = 'click',
  className = '',
  disabled = false,
  flyingContent,
  flightDuration = 0.75,
  ariaLabel = 'AI Mentor',
  isActive = false,
}) => {
  const [flyingItems, setFlyingItems] = useState<FlyingItem[]>([]);
  const [isAirborne, setIsAirborne] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const nextId = useRef(0);

  // Detect user's reduced-motion preference
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const listener = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };
    mediaQuery.addEventListener('change', listener);
    return () => mediaQuery.removeEventListener('change', listener);
  }, []);

  const triggerFlight = useCallback(() => {
    if (disabled) return;

    // Trigger parent callback immediately so action (e.g. opening AI mentor drawer) is instant
    if (onClick) {
      onClick();
    }

    // If reduced motion is requested, do not spawn flight animations
    if (prefersReducedMotion) {
      return;
    }

    // Prevent duplicate flying particle floods if button is rapidly clicked while airborne
    if (isAirborne) {
      return;
    }

    if (!buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;

    // Flight path: subtle arc upwards and slightly right towards mentor drawer
    const deltaX = Math.min(window.innerWidth - startX - 40, 160);
    const deltaY = -Math.min(startY - 20, 140);

    const id = ++nextId.current;
    setIsAirborne(true);
    setFlyingItems(prev => [...prev, { id, startX, startY, deltaX, deltaY }]);

    // Reset airborne state after animation completes
    window.setTimeout(() => {
      setFlyingItems(prev => prev.filter(item => item.id !== id));
      setIsAirborne(false);
    }, flightDuration * 1000 + 100);
  }, [disabled, onClick, prefersReducedMotion, isAirborne, flightDuration]);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (trigger === 'click') {
      triggerFlight();
    }
  };

  const handleMouseEnter = () => {
    if (trigger === 'hover' && !isAirborne) {
      triggerFlight();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerFlight();
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={handleClick}
        onMouseEnter={handleMouseEnter}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        aria-label={ariaLabel}
        aria-expanded={isActive}
        className={`relative inline-flex items-center justify-center gap-1.5 rounded-[8px] font-mono text-xs font-medium transition-all duration-200 select-none cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed ${
          isActive
            ? 'border-2 border-[var(--primary)] bg-[var(--primary)] text-[var(--primary-foreground)] shadow-sm'
            : 'border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--muted)] text-[var(--foreground)] dark:border-teal-500/30 dark:bg-gradient-to-r dark:from-purple-950/40 dark:via-teal-950/40 dark:to-emerald-950/40 dark:text-teal-200 dark:hover:border-teal-400/60 dark:hover:shadow-[0_0_15px_rgba(20,184,166,0.2)]'
        } ${className}`}
      >
        {children}
      </button>

      {/* Airborne Flying Elements Portal / Overlay */}
      <AnimatePresence>
        {!prefersReducedMotion &&
          flyingItems.map(item => (
            <motion.div
              key={item.id}
              initial={{
                position: 'fixed',
                left: item.startX,
                top: item.startY,
                x: '-50%',
                y: '-50%',
                scale: 0.9,
                opacity: 1,
                rotate: 0,
                zIndex: 9999,
                pointerEvents: 'none',
              }}
              animate={{
                x: ['-50%', `calc(-50% + ${item.deltaX * 0.4}px)`, `calc(-50% + ${item.deltaX}px)`],
                y: ['-50%', `calc(-50% + ${item.deltaY * 1.3}px)`, `calc(-50% + ${item.deltaY}px)`],
                scale: [0.9, 1.25, 0.4],
                opacity: [1, 0.95, 0],
                rotate: [0, 45, 120],
              }}
              transition={{
                duration: flightDuration,
                ease: [0.22, 1, 0.36, 1], // Smooth cubic-bezier curve
              }}
            >
              {flyingContent || (
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] bg-gradient-to-r from-emerald-500 via-teal-500 to-indigo-600 text-white font-mono text-xs shadow-[0_4px_20px_rgba(20,184,166,0.45)] border border-teal-300/40 backdrop-blur-sm">
                  <Sparkles className="h-3.5 w-3.5 animate-spin" />
                  <span className="font-semibold tracking-wide">AI Mentor ↗</span>
                </div>
              )}
            </motion.div>
          ))}
      </AnimatePresence>
    </>
  );
};
