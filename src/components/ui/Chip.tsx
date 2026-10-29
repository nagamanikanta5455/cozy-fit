import React from 'react';

interface ChipProps {
  label: string | React.ReactNode;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md';
  icon?: React.ReactNode;
}

export const Chip: React.FC<ChipProps> = ({
  label,
  selected = false,
  onClick,
  className = '',
  size = 'md',
  icon,
}) => {
  const sizeClasses = size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-3.5 py-2 text-xs font-semibold';

  const stateClasses = selected
    ? 'bg-[#C6F432] text-[#0E0F12] border-transparent font-bold'
    : 'bg-[var(--bg-surface-raised)] text-[var(--text-muted)] border-[var(--border-subtle)] hover:text-[var(--text-primary)] hover:border-[var(--text-muted)]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-1.5 rounded-full border transition-standard cursor-pointer select-none focus-visible:outline-2 focus-visible:outline-[var(--accent-fill)] min-h-[36px] whitespace-nowrap ${sizeClasses} ${stateClasses} ${className}`}
    >
      {icon && <span className="inline-flex shrink-0">{icon}</span>}
      <span className="tabular-nums">{label}</span>
    </button>
  );
};
