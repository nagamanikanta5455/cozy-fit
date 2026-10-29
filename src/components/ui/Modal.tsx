import React, { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
  isSheetOnMobile?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  maxWidth = 'md',
  isSheetOnMobile = true,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const [sheetTranslateY, setSheetTranslateY] = useState(0);
  const touchStartY = useRef(0);
  const isDragging = useRef(false);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSheetTranslateY(0);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isSheetOnMobile) return;
    touchStartY.current = e.touches[0].clientY;
    isDragging.current = true;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging.current || !isSheetOnMobile) return;
    const currentY = e.touches[0].clientY;
    const deltaY = currentY - touchStartY.current;
    if (deltaY > 0) {
      setSheetTranslateY(deltaY);
    }
  };

  const handleTouchEnd = () => {
    if (!isDragging.current || !isSheetOnMobile) return;
    isDragging.current = false;
    if (sheetTranslateY > 80) {
      triggerHaptic('light');
      onClose();
    } else {
      setSheetTranslateY(0);
    }
  };

  if (!isOpen) return null;

  const maxWidthClass = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  }[maxWidth];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-xs transition-standard pb-safe"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        style={{
          transform: sheetTranslateY > 0 ? `translateY(${sheetTranslateY}px)` : undefined,
          transition: isDragging.current ? 'none' : 'transform 0.15s ease-out',
        }}
        className={`w-full ${maxWidthClass} bg-[var(--bg-surface)] border border-[var(--border-subtle)] ${
          isSheetOnMobile
            ? 'rounded-t-xl sm:rounded-xl max-h-[90dvh]'
            : 'rounded-xl max-h-[90dvh]'
        } flex flex-col overflow-hidden text-[var(--text-primary)] shadow-2xl`}
      >
        {/* Drag handle */}
        {isSheetOnMobile && (
          <div
            className="flex sm:hidden justify-center pt-2.5 pb-1 cursor-grab touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div className="w-10 h-1 rounded-full bg-[var(--border-subtle)]" />
          </div>
        )}

        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5 border-b border-[var(--border-subtle)] touch-none"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="min-w-0 pr-2">
            <h2 id="modal-title" className="text-base font-semibold tracking-tight truncate">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-[var(--text-muted)] truncate mt-0.5">{description}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 overscroll-contain flex-1">
          {children}
        </div>
      </div>
    </div>
  );
};
