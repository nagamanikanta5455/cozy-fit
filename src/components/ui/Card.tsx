import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'default' | 'raised' | 'accent' | 'flat';
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  variant = 'default',
  onClick,
  ...props
}) => {
  const baseClasses =
    'rounded-xl border transition-standard relative overflow-hidden p-4 sm:p-5';

  const variantClasses = {
    default:
      'bg-[var(--bg-surface)] border-[var(--border-subtle)] text-[var(--text-primary)]',
    raised:
      'bg-[var(--bg-surface-raised)] border-[var(--border-subtle)] text-[var(--text-primary)]',
    accent:
      'bg-[var(--bg-surface)] border-[var(--accent-fill)] text-[var(--text-primary)]',
    flat:
      'bg-transparent border-[var(--border-subtle)] text-[var(--text-primary)]',
  }[variant];

  const clickableClasses = onClick
    ? 'cursor-pointer hover:border-[var(--text-muted)] active:opacity-90'
    : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses} ${clickableClasses} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};
