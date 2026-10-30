import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      className = '',
      variant = 'primary',
      size = 'md',
      fullWidth = false,
      leftIcon,
      rightIcon,
      disabled,
      type = 'button',
      ...props
    },
    ref
  ) => {
    const baseClasses =
      'inline-flex items-center justify-center gap-2 whitespace-nowrap font-semibold rounded-xl select-none cursor-pointer focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)] focus-visible:outline-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-standard';

    const sizeClasses = {
      sm: 'text-xs px-3 h-8',
      md: variant === 'primary' ? 'text-xs px-4 h-10 font-bold' : 'text-xs px-3.5 h-9',
      lg: 'text-sm px-5 h-10',
    }[size];

    const variantClasses = {
      primary:
        'bg-[#C6F432] text-[#0E0F12] hover:brightness-105 active:opacity-90 font-bold shadow-xs',
      secondary:
        'bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[var(--text-primary)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-surface-raised)]/80 active:opacity-90',
      ghost:
        'bg-transparent text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-raised)] active:opacity-90',
      danger:
        'bg-[#F87171]/10 border border-[#F87171]/40 text-[#F87171] hover:bg-[#F87171]/20 active:opacity-90',
    }[variant];

    const widthClass = fullWidth ? 'w-full' : '';

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={`${baseClasses} ${sizeClasses} ${variantClasses} ${widthClass} ${className}`}
        {...props}
      >
        {leftIcon && <span className="inline-flex shrink-0">{leftIcon}</span>}
        <span>{children}</span>
        {rightIcon && <span className="inline-flex shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
