import React, { useState } from 'react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import {
  Hammer,
  Cpu,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  PackageCheck,
  Terminal,
  ShieldCheck,
  Layers,
} from 'lucide-react';

interface AppInfo {
  name: string;
  tag: string;
  color: string;
  version: string;
  repo: string;
  destination: string;
}

const APPS: AppInfo[] = [
  { name: 'MediaFlow Studio', tag: 'Mf', color: 'from-amber-500 to-orange-600', version: '26.10.26', repo: 'BSFrameWorks5253/MediaFlow-Studio', destination: 'Own Repo + Anything' },
  { name: 'One Tap Workstation', tag: 'Ot', color: 'from-blue-600 to-cyan-500', version: '26.10.26', repo: 'BSFrameWorks5253/onetap-workstation', destination: 'Own Repo + Anything' },
  { name: 'DocuFlow Studio Pro', tag: 'Df', color: 'from-emerald-500 to-teal-700', version: '26.10.26', repo: 'BSFrameWorks5253/DocuFlow-', destination: 'Own Repo + Anything' },
  { name: 'Anything Master Hub', tag: 'An', color: 'from-cyan-400 to-indigo-600', version: '26.10.26', repo: 'BSFrameWorks5253/Anything', destination: 'Anything Release' },
  { name: 'Anything Data Manage', tag: 'Dm', color: 'from-purple-600 to-indigo-700', version: '26.10.26', repo: 'Local Hub Only', destination: 'Anything Release Only' },
  { name: 'Auto Copier Pro', tag: 'Ac', color: 'from-rose-500 to-pink-600', version: '26.10.26', repo: 'Local Hub Only', destination: 'Anything Release Only' },
];

export const MasterBuilderSection: React.FC = () => {
  const [launching, setLaunching] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [logOutput, setLogOutput] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLaunchBuilder = async () => {
    setLaunching(true);
    setStatusMessage(null);
    try {
      if (window.electronAPI?.launchMasterBuilder) {
        const res = await window.electronAPI.launchMasterBuilder();
        if (res.success) {
          setStatusMessage({ type: 'success', text: 'Master Builder Studio launched successfully in standalone hardware window!' });
        } else {
          setStatusMessage({ type: 'error', text: res.error || 'Failed to spawn Master Builder.' });
        }
      } else {
        setStatusMessage({ type: 'error', text: 'Master Builder launcher IPC not available in this environment.' });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || String(e) });
    } finally {
      setTimeout(() => setLaunching(false), 1200);
    }
  };

  const handleSyncVersions = async () => {
    setSyncing(true);
    setStatusMessage(null);
    setLogOutput(null);
    try {
      if (window.electronAPI?.syncEcosystemVersions) {
        const res = await window.electronAPI.syncEcosystemVersions();
        if (res.success) {
          setStatusMessage({ type: 'success', text: 'All 6 applications synchronized to 26.10.26 successfully!' });
          if (res.output) setLogOutput(res.output);
        } else {
          setStatusMessage({ type: 'error', text: res.error || 'Version synchronization failed.' });
          if (res.output) setLogOutput(res.output);
        }
      } else {
        setStatusMessage({ type: 'error', text: 'Sync IPC handler is unavailable.' });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || String(e) });
    } finally {
      setSyncing(false);
    }
  };

  return (
    <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-transparent rounded-full blur-2xl pointer-events-none" />

      <div className="flex flex-col gap-5 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Hammer className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Anything Exe Builder Studio
                </h3>
                <GlassBadge variant="cyan" dot>
                  v26.10.26 Synced
                </GlassBadge>
              </div>
              <p className="text-xs text-zinc-600 dark:text-white/60">
                Dedicated React + Electron compiler studio in "Exe Builder Anything" with live streaming terminal and multi-destination release routing
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSyncVersions}
              disabled={syncing}
              className="px-3 py-1.5 rounded-lg border border-zinc-300 dark:border-white/15 hover:bg-zinc-100 dark:hover:bg-white/5 text-xs font-medium text-zinc-700 dark:text-zinc-200 flex items-center gap-1.5 transition-colors disabled:opacity-50"
              title="Ensure all 6 apps have exact matching version 26.10.26 across all files"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-cyan-400' : ''}`} />
              <span>{syncing ? 'Syncing...' : 'Sync All 26.10.26'}</span>
            </button>

            <button
              onClick={handleLaunchBuilder}
              disabled={launching}
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 text-white text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-500/20 transition-all transform active:scale-95 disabled:opacity-60"
            >
              <Cpu className="w-3.5 h-3.5" />
              <span>{launching ? 'Starting Studio...' : 'Launch Master Builder'}</span>
              <ExternalLink className="w-3 h-3 opacity-70" />
            </button>
          </div>
        </div>

        {/* Feedback message banner */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2 text-xs font-medium ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Apps Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {APPS.map((app) => (
            <div
              key={app.name}
              className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5 flex items-center justify-between gap-3 hover:border-indigo-500/30 transition-all"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${app.color} flex items-center justify-center text-white text-xs font-black shadow-sm shrink-0`}
                >
                  {app.tag}
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-semibold text-zinc-900 dark:text-white truncate">
                    {app.name}
                  </div>
                  <div className="text-[10px] text-zinc-500 dark:text-white/50 truncate font-mono">
                    {app.destination}
                  </div>
                </div>
              </div>

              <div className="shrink-0 text-right">
                <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  v{app.version}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Terminal logs viewer */}
        {logOutput && (
          <div className="bg-slate-950/95 text-slate-300 rounded-xl p-4 border border-indigo-500/20 font-mono text-xs relative shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                Version Synchronizer Output
              </span>
              <button
                onClick={() => setLogOutput(null)}
                className="text-zinc-500 hover:text-white text-xs px-1.5 py-0.5 rounded"
              >
                Dismiss
              </button>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">{logOutput}</pre>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
