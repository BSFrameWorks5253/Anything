import React, { useState, useEffect } from 'react';
import { RefreshCw, Download, CheckCircle, Sparkles, X, ArrowUpCircle } from 'lucide-react';
import { GlassCard } from './GlassCard';
import { GlassButton } from './GlassButton';
import { GlassBadge } from './GlassBadge';

export interface UpdateState {
  status: 'idle' | 'checking' | 'available' | 'downloading' | 'downloaded' | 'not-available' | 'error' | 'dev-mode';
  version?: string;
  percent?: number;
  bytesPerSecond?: number;
  transferred?: number;
  total?: number;
  error?: string;
}

export const UpdateNotificationModal: React.FC = () => {
  const [updateState, setUpdateState] = useState<UpdateState>({ status: 'idle' });
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.onUpdateStatus) {
      const unsubscribe = electronAPI.onUpdateStatus((data: UpdateState) => {
        setUpdateState(data);
        setIsDismissed(false);
      });
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, []);

  if (isDismissed || ['idle', 'not-available', 'dev-mode'].includes(updateState.status)) {
    return null;
  }

  const handleInstall = () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.installUpdate) {
      electronAPI.installUpdate();
    } else {
      alert('Install & restart is active in packaged Electron builds.');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-slideUp">
      <GlassCard
        variant="elevated"
        className="w-88 p-4.5 border-cyan-400/30 shadow-[0_15px_40px_rgba(6,182,212,0.25)] relative overflow-hidden"
      >
        {/* Top-rim highlight */}
        <div className="specular-reflection opacity-80" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-400/30 shrink-0">
              {updateState.status === 'downloaded' ? (
                <CheckCircle className="w-5 h-5 text-slate-950" />
              ) : updateState.status === 'downloading' ? (
                <Download className="w-5 h-5 text-slate-950 animate-bounce" />
              ) : (
                <RefreshCw className="w-5 h-5 text-slate-950 animate-spin" style={{ animationDuration: '4s' }} />
              )}
            </div>

            <div>
              <div className="flex items-center gap-1.5">
                <h4 className="text-sm font-bold text-white tracking-tight">
                  {updateState.status === 'downloaded'
                    ? 'Update Ready to Install'
                    : updateState.status === 'downloading'
                    ? 'Downloading Delta Update'
                    : 'Update Available'}
                </h4>
              </div>
              <p className="text-[11px] text-white/50 font-mono">
                {updateState.version ? `Version ${updateState.version}` : 'GitHub Releases'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsDismissed(true)}
            className="w-6 h-6 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Downloading progress bar */}
        {updateState.status === 'downloading' && (
          <div className="mt-3.5 space-y-1.5">
            <div className="flex justify-between text-[10px] font-mono text-white/60">
              <span>{updateState.percent || 0}% Completed</span>
              <span>
                {updateState.bytesPerSecond
                  ? `${(updateState.bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`
                  : 'Downloading...'}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-white/[0.08] overflow-hidden p-[1px] border border-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500 shadow-[0_0_8px_#38bdf8] transition-all duration-300"
                style={{ width: `${updateState.percent || 5}%` }}
              />
            </div>
          </div>
        )}

        {/* Downloaded CTA */}
        {updateState.status === 'downloaded' && (
          <div className="mt-3.5 pt-3 border-t border-white/[0.08] flex items-center justify-between gap-2">
            <span className="text-[11px] text-emerald-300 font-medium">
              Zero manual download needed.
            </span>
            <GlassButton
              variant="primary"
              size="sm"
              onClick={handleInstall}
              icon={<ArrowUpCircle className="w-3.5 h-3.5" />}
            >
              Restart & Apply
            </GlassButton>
          </div>
        )}

        {updateState.status === 'error' && (
          <p className="text-xs text-rose-300 mt-2">
            Update error: {updateState.error}
          </p>
        )}
      </GlassCard>
    </div>
  );
};
