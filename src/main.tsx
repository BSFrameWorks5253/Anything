import React, { StrictMode, Component, type ErrorInfo, type ReactNode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { ThemeProvider } from './context/ThemeContext';
import { ViewModeProvider } from './context/ViewModeContext';
import { AuthProvider } from './context/AuthContext';
import { WorkspaceProvider } from './context/WorkspaceContext';
import { DataBusProvider } from './context/DataBusContext';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class RootErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[CRITICAL ROOT ERROR]', error, errorInfo);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('creative_hub_catalog_apps_v4');
      localStorage.removeItem('anything_splash_screen_settings_v1');
    } catch {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="w-screen h-screen flex flex-col items-center justify-center bg-[#030712] text-white p-8 select-none">
          <div className="max-w-lg w-full bg-zinc-900/90 border border-red-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl flex flex-col items-center text-center">
            <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-4 text-red-400">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-red-400 mb-1">Anything Encountered a Problem</h2>
            <p className="text-xs text-zinc-400 mb-4">
              A component error prevented the application workspace from rendering.
            </p>
            <pre className="w-full bg-black/50 border border-white/5 rounded-lg p-3 text-[11px] text-zinc-300 font-mono text-left max-h-36 overflow-auto mb-5 select-text">
              {this.state.error?.message || 'Unknown render exception'}
            </pre>
            <div className="flex items-center gap-3 w-full">
              <button
                onClick={() => window.location.reload()}
                className="flex-1 py-2 px-4 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-200 transition-colors"
              >
                Reload Window
              </button>
              <button
                onClick={this.handleReset}
                className="flex-1 py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-semibold text-white transition-colors"
              >
                Reset Cache & Reload
              </button>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootErrorBoundary>
      <ThemeProvider>
        <ViewModeProvider>
          <AuthProvider>
            <WorkspaceProvider>
              <DataBusProvider>
                <App />
              </DataBusProvider>
            </WorkspaceProvider>
          </AuthProvider>
        </ViewModeProvider>
      </ThemeProvider>
    </RootErrorBoundary>
  </StrictMode>,
);
