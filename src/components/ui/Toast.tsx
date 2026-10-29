import React, { createContext, useContext, useState, useCallback } from 'react';
import { X } from 'lucide-react';

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

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    ({ duration = 4000, ...toast }: Omit<ToastMessage, 'id'>): string => {
      const id = `t-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const newToast: ToastMessage = { ...toast, id, duration };

      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          dismissToast(id);
        }, duration);
      }

      return id;
    },
    [dismissToast]
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

      {/* Accessible Toast Viewport */}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        className="fixed bottom-20 sm:bottom-6 right-4 left-4 sm:left-auto sm:w-80 z-[60] pointer-events-none flex flex-col gap-2 items-center sm:items-end"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="pointer-events-auto w-full bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] rounded-xl p-3.5 flex items-center justify-between gap-3 shadow-lg"
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
                    dismissToast(toast.id);
                  }}
                  className="text-xs font-bold text-[#C6F432] dark:text-[#C6F432] light:text-[#4D6B00] hover:underline px-2 py-1 cursor-pointer"
                >
                  {toast.action.label}
                </button>
              )}
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-md transition-colors"
                aria-label="Dismiss notification"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
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
