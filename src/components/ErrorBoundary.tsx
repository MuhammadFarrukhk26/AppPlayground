import React, { ErrorInfo, ReactNode } from 'react';
import { ShieldAlert, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.warn('ErrorBoundary caught rendering error:', error, errorInfo);
  }

  private handleReset = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  private handleClearData = async () => {
    try {
      await fetch('/api/state/reset', { method: 'POST' });
    } catch (e) {
      console.warn('Error during reset fetch:', e);
    }
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white p-6 select-none font-sans">
          <div className="max-w-md w-full bg-slate-950 border border-slate-800 rounded-3xl p-6 shadow-2xl text-center space-y-6">
            <div className="mx-auto w-16 h-16 rounded-full bg-rose-500/10 flex items-center justify-center text-rose-500 border border-rose-500/20">
              <ShieldAlert size={36} className="animate-pulse" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-bold tracking-tight text-white uppercase">
                Aesthetic Recovery Mode
              </h1>
              <p className="text-xs text-slate-400 font-medium leading-relaxed">
                Our Lahori real-time dispatch dashboard intercepted a rendering telemetry issue. Don't worry—your connection state is fully safe.
              </p>
            </div>

            {this.state.error && (
              <div className="bg-slate-900 border border-slate-800/60 p-3 rounded-xl text-left max-h-24 overflow-y-auto">
                <span className="text-[10px] font-mono text-rose-400 font-bold block mb-1">
                  Exception: {this.state.error.name || 'SystemError'}
                </span>
                <p className="text-[9px] font-mono text-slate-400 whitespace-pre-wrap leading-tight break-all">
                  {this.state.error.message || 'Unknown render exception.'}
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 pt-2">
              <button
                onClick={this.handleReset}
                className="w-full bg-teal-600 hover:bg-teal-500 active:scale-98 text-white font-extrabold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw size={12} className="animate-spin" style={{ animationDuration: '3s' }} />
                Instant Recovery Reboot
              </button>
              
              <button
                onClick={this.handleClearData}
                className="w-full bg-slate-900 hover:bg-slate-850 active:scale-98 border border-slate-800 text-slate-300 font-bold text-xs uppercase tracking-wider py-3 px-4 rounded-xl transition-all cursor-pointer"
              >
                Reset Deep Synchronized State
              </button>
            </div>

            <div className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">
              Haazir Pakistan Platform © 2026
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
