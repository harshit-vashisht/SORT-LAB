import React from 'react';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'success' | 'warning' | 'destructive';
}

export const Badge: React.FC<BadgeProps> = ({
  className = '',
  variant = 'default',
  children,
  ...props
}) => {
  let variantStyles = '';
  switch (variant) {
    case 'default':
      variantStyles = 'bg-[var(--primary)] text-[var(--primary-foreground)]';
      break;
    case 'secondary':
      variantStyles = 'bg-[var(--secondary)] text-[var(--secondary-foreground)] border border-[var(--border)]';
      break;
    case 'outline':
      variantStyles = 'border border-[var(--border)] text-[var(--foreground)]';
      break;
    case 'success':
      variantStyles = 'bg-[var(--success)]/15 text-[var(--success)] border border-[var(--success)]/30';
      break;
    case 'warning':
      variantStyles = 'bg-[var(--warning)]/15 text-[var(--warning)] border border-[var(--warning)]/30';
      break;
    case 'destructive':
      variantStyles = 'bg-[var(--destructive)]/15 text-[var(--destructive)] border border-[var(--destructive)]/30';
      break;
  }

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-mono text-[10px] font-semibold tracking-wide uppercase whitespace-nowrap ${variantStyles} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
};

export const Progress: React.FC<{ value: number; className?: string }> = ({ value, className = '' }) => {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div className={`w-full bg-[var(--muted)] rounded-full h-1.5 overflow-hidden border border-[var(--border)] ${className}`}>
      <div
        className="bg-[var(--primary)] h-full transition-all duration-300"
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
};
