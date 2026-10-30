import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';
import { Z_INDEX } from '../../constants/zIndex';

export interface ToastMessage {
  id: string;
  type: 'success' | 'info' | 'warning' | 'undo';
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  duration?: number;
}

interface ToastContextValue {
  showToast: (toast: Omit<ToastMessage, 'id'>) => string;
  dismissToast: (id: string) => void;
  showUndoToast: (title: string, onUndo: () => void) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

interface ToastItemProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  const [isHovered, setIsHovered] = useState(false);
  const remainingTimeRef = useRef<number>(toast.duration ?? 5000);
  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (toast.duration === 0) return;

    if (!isHovered) {
      startTimeRef.current = Date.now();
      timerRef.current = setTimeout(() => {
        onDismiss(toast.id);
      }, remainingTimeRef.current);
    } else {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
        const elapsed = Date.now() - startTimeRef.current;
        remainingTimeRef.current = Math.max(0, remainingTimeRef.current - elapsed);
      }
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isHovered, toast.duration, toast.id, onDismiss]);

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="pointer-events-auto w-full bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-xl transition-all duration-150 animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-[var(--text-primary)] truncate">
          {toast.title}
        </p>
        {toast.description && (
          <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
            {toast.description}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 shrink-0">
        {toast.action && (
          <button
            type="button"
            onClick={() => {
              toast.action?.onClick();
              onDismiss(toast.id);
            }}
            className="text-xs font-bold text-[#C6F432] dark:text-[#C6F432] light:text-[#4D6B00] hover:underline px-2 py-1 rounded cursor-pointer transition-colors focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-fill)]"
          >
            {toast.action.label}
          </button>
        )}
        <button
          type="button"
          onClick={() => onDismiss(toast.id)}
          className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-md transition-colors cursor-pointer focus:outline-hidden focus:ring-1 focus:ring-[var(--accent-fill)]"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ duration = 5000, ...toast }: Omit<ToastMessage, 'id'>): string => {
      const id = `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = { ...toast, id, duration };

      setToasts((prev) => [...prev, newToast]);
      return id;
    },
    []
  );

  const showUndoToast = useCallback(
    (title: string, onUndo: () => void) => {
      showToast({
        type: 'undo',
        title,
        action: {
          label: 'Undo',
          onClick: onUndo,
        },
        duration: 7000,
      });
    },
    [showToast]
  );

  return (
    <ToastContext.Provider value={{ showToast, dismissToast, showUndoToast }}>
      {children}

      {/* Accessible Desktop Toast Viewport: Bottom-Right Stacked */}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        style={{ zIndex: Z_INDEX.toasts }}
        className="fixed bottom-6 right-6 w-full max-w-sm pointer-events-none flex flex-col gap-2 items-end min-w-0"
      >
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={dismissToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return ctx;
}
