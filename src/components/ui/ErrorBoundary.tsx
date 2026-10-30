import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Button } from './Button';
import { RotateCcw, Download, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('CozyFit error boundary caught:', error, errorInfo);
  }

  private handleExportBackup = () => {
    try {
      const data = localStorage.getItem('cozy-fit-storage') || localStorage.getItem('cozyfit:v1') || '{}';
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cozyfit-backup-emergency-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      // Fallback
    }
  };

  private handleReset = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[#0E0F12] text-[#F2F3F5]">
          <div className="max-w-sm w-full bg-[#16181D] border border-[#262A33] rounded-xl p-6 text-center space-y-4">
            <div className="w-10 h-10 rounded-xl bg-[#1C1F26] border border-[#262A33] flex items-center justify-center text-[#F87171] mx-auto">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h1 className="text-base font-semibold">
              An unexpected error occurred
            </h1>
            <p className="text-xs text-[#8B93A1] leading-relaxed">
              Your workouts remain safe in storage. Reload the application or export a backup.
            </p>
            <div className="flex flex-col gap-2 pt-2">
              <Button
                variant="primary"
                onClick={this.handleReset}
                leftIcon={<RotateCcw className="w-4 h-4" />}
                fullWidth
              >
                Reload
              </Button>
              <Button
                variant="secondary"
                onClick={this.handleExportBackup}
                leftIcon={<Download className="w-4 h-4" />}
                fullWidth
              >
                Export Backup
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
