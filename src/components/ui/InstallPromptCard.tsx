import React, { useState } from 'react';
import { usePWAInstall } from '../../hooks/usePWAInstall';
import { Button } from './Button';
import { Smartphone, Download, X, Share } from 'lucide-react';
import { triggerHaptic } from '../../utils/haptics';

interface InstallPromptCardProps {
  workoutCount: number;
}

export const InstallPromptCard: React.FC<InstallPromptCardProps> = ({ workoutCount }) => {
  const { isInstallable, isInstalled, isIOS, isDismissed, install, dismiss } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);

  if (isInstalled || isDismissed || workoutCount < 1) {
    return null;
  }

  if (!isInstallable && !isIOS) {
    return null;
  }

  const handleInstallClick = async () => {
    triggerHaptic('light');
    if (isInstallable) {
      await install();
    } else if (isIOS) {
      setShowIOSModal(true);
    }
  };

  const handleDismiss = () => {
    triggerHaptic('light');
    dismiss();
  };

  return (
    <>
      <div className="rounded-xl p-3.5 bg-[var(--bg-surface)] border border-[var(--border-subtle)] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[var(--bg-surface-raised)] border border-[var(--border-subtle)] text-[var(--text-muted)] flex items-center justify-center shrink-0">
            <Smartphone className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-semibold text-[var(--text-primary)] truncate">
              Install CozyFit
            </h4>
            <p className="text-[11px] text-[var(--text-muted)] truncate mt-0.5">
              {isIOS ? 'Add to Home Screen for fullscreen access.' : 'Offline tracking and instant launch.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <Button
            size="sm"
            variant="primary"
            onClick={handleInstallClick}
            leftIcon={isIOS ? <Share className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
          >
            {isIOS ? 'Add' : 'Install'}
          </Button>

          <button
            type="button"
            onClick={handleDismiss}
            aria-label="Dismiss install notice"
            className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-lg transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* iOS Instructions Modal */}
      {showIOSModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs"
          onClick={() => setShowIOSModal(false)}
        >
          <div
            className="w-full max-w-sm rounded-xl bg-[var(--bg-surface)] border border-[var(--border-subtle)] p-5 text-[var(--text-primary)] space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">
                Install on iPhone
              </h3>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                aria-label="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-xs text-[var(--text-muted)] space-y-2 bg-[var(--bg-surface-raised)] p-3 rounded-lg border border-[var(--border-subtle)]">
              <div>1. Tap Share in Safari toolbar.</div>
              <div>2. Scroll and select <strong>Add to Home Screen</strong>.</div>
              <div>3. Tap <strong>Add</strong> in the top corner.</div>
            </div>

            <Button
              variant="secondary"
              fullWidth
              size="sm"
              onClick={() => setShowIOSModal(false)}
            >
              Close
            </Button>
          </div>
        </div>
      )}
    </>
  );
};
