import React from 'react';

export const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className = '', children, ...props }, ref) => (
    <div
      ref={ref}
      className={`rounded-[10px] border border-[var(--border)] bg-[var(--card)] text-[var(--card-foreground)] p-5 transition-colors ${className}`}
      {...props}
    >
      {children}
    </div>
  )
);
Card.displayName = 'Card';

export const CardHeader = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <div className={`border-b border-[var(--border)] pb-3 mb-4 flex items-center justify-between ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <h3 className={`text-base font-semibold text-[var(--foreground)] tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardDescription = ({ className = '', children }: { className?: string; children: React.ReactNode }) => (
  <p className={`text-xs text-[var(--muted-foreground)] leading-relaxed ${className}`}>
    {children}
  </p>
);
