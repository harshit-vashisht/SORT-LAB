import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'md', children, ...props }, ref) => {
    let baseStyles = 'inline-flex items-center justify-center font-mono text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] disabled:opacity-40 disabled:pointer-events-none rounded-[8px] cursor-pointer whitespace-nowrap shrink-0';

    let variantStyles = '';
    switch (variant) {
      case 'default':
        variantStyles = 'bg-[var(--primary)] text-[var(--primary-foreground)] hover:opacity-90';
        break;
      case 'secondary':
        variantStyles = 'bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-[var(--muted)] border border-[var(--border)]';
        break;
      case 'outline':
        variantStyles = 'border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)]';
        break;
      case 'ghost':
        variantStyles = 'bg-transparent text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)]';
        break;
      case 'destructive':
        variantStyles = 'bg-[var(--destructive)] text-[var(--destructive-foreground)] hover:opacity-90';
        break;
    }

    let sizeStyles = '';
    switch (size) {
      case 'sm':
        sizeStyles = 'h-7 px-2.5 text-[11px]';
        break;
      case 'md':
        sizeStyles = 'h-9 px-3.5 text-xs';
        break;
      case 'lg':
        sizeStyles = 'h-11 px-5 text-sm font-semibold';
        break;
      case 'icon':
        sizeStyles = 'h-8 w-8 p-0';
        break;
    }

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variantStyles} ${sizeStyles} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);
Button.displayName = 'Button';
