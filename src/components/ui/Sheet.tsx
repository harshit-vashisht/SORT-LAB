import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

export const Sheet: React.FC<SheetProps> = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onOpenChange(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onOpenChange]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
      {/* Backdrop Overlay */}
      <div
        onClick={() => onOpenChange(false)}
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
      />
      {children}
    </div>
  );
};

interface SheetContentProps {
  children: React.ReactNode;
  className?: string;
  onClose?: () => void;
}

export const SheetContent: React.FC<SheetContentProps> = ({
  children,
  className = '',
  onClose,
}) => {
  return (
    <div
      className={`fixed inset-y-0 right-0 z-50 w-full sm:w-[480px] bg-[var(--card)] border-l border-[var(--border)] shadow-xl flex flex-col justify-between transition-transform duration-300 ease-in-out ${className}`}
    >
      {children}
    </div>
  );
};

export const SheetHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`border-b border-[var(--border)] px-5 py-4 ${className}`}>
      {children}
    </div>
  );
};

export const SheetTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`text-xs font-mono font-bold text-[var(--foreground)] uppercase tracking-wide ${className}`}>
      {children}
    </div>
  );
};

export const SheetDescription: React.FC<{ children: React.ReactNode; className?: string }> = ({
  children,
  className = '',
}) => {
  return (
    <div className={`text-[11px] font-mono text-[var(--muted-foreground)] ${className}`}>
      {children}
    </div>
  );
};

export const SheetClose: React.FC<{ onClick: () => void; className?: string }> = ({
  onClick,
  className = '',
}) => {
  return (
    <button
      onClick={onClick}
      className={`flex h-7 w-7 items-center justify-center rounded-[8px] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors ${className}`}
      aria-label="Close sheet"
    >
      <X className="h-4 w-4" />
    </button>
  );
};
