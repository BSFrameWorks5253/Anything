import React, { useState, useEffect } from 'react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import {
  GitCommit,
  GitBranch,
  UploadCloud,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  FileCode,
  Terminal,
  Sparkles,
  Layers,
} from 'lucide-react';

export const GitAutoCommitSection: React.FC = () => {
  const [gitStatus, setGitStatus] = useState<{
    branch: string;
    isDirty: boolean;
    changedFilesCount: number;
    files: string[];
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [previewMsg, setPreviewMsg] = useState<string | null>(null);
  const [consoleOutput, setConsoleOutput] = useState<string | null>(null);
  const [autoPush, setAutoPush] = useState(true);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchStatus = async () => {
    if (!window.electronAPI?.gitStatus) return;
    try {
      const res = await window.electronAPI.gitStatus();
      if (res.success) {
        setGitStatus({
          branch: res.branch || 'main',
          isDirty: res.isDirty,
          changedFilesCount: res.changedFilesCount,
          files: res.files || [],
        });
      }
    } catch (e: any) {
      console.error('Failed to fetch git status:', e);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 10000);
    return () => clearInterval(interval);
  }, []);

  const handlePreview = async () => {
    if (!window.electronAPI?.gitPreviewMessage) return;
    setLoading(true);
    setStatusMessage(null);
    try {
      const res = await window.electronAPI.gitPreviewMessage();
      if (res.success && res.output) {
        setPreviewMsg(res.output);
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to preview commit message' });
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'Error executing preview' });
    } finally {
      setLoading(false);
    }
  };

  const handleAutoCommit = async (ecosystem = false) => {
    if (!window.electronAPI?.gitAutoCommit) return;
    setLoading(true);
    setStatusMessage(null);
    setConsoleOutput(null);
    try {
      const res = await window.electronAPI.gitAutoCommit({
        push: autoPush,
        ecosystem,
      });
      if (res.success) {
        setStatusMessage({
          type: 'success',
          text: ecosystem
            ? '🎉 Successfully committed & synchronized all ecosystem repositories!'
            : '🎉 Commit successfully created with auto-generated message!',
        });
        if (res.output) setConsoleOutput(res.output);
        await fetchStatus();
      } else {
        setStatusMessage({ type: 'error', text: res.error || 'Failed to create auto commit' });
        if (res.output) setConsoleOutput(res.output);
      }
    } catch (e: any) {
      setStatusMessage({ type: 'error', text: e.message || 'Error running auto-commit' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 relative overflow-hidden">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-bl from-purple-500/10 via-cyan-500/5 to-transparent pointer-events-none rounded-bl-full" />

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-zinc-100 dark:border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shadow-inner">
            <GitCommit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Intelligent Ecosystem Auto-Commit
              </h3>
              <GlassBadge variant="cyan" dot>
                Auto-Crafted Messages
              </GlassBadge>
            </div>
            <p className="text-xs text-zinc-500 dark:text-white/60 mt-0.5">
              The app automatically analyzes diffs, deduces conventional scopes & bullets, stages changes, and commits.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {gitStatus && (
            <>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-white/5 text-xs font-mono text-zinc-700 dark:text-zinc-300">
                <GitBranch className="w-3.5 h-3.5 text-cyan-500" />
                <span>{gitStatus.branch}</span>
              </div>
              <GlassBadge variant={gitStatus.isDirty ? 'amber' : 'green'}>
                {gitStatus.isDirty ? `${gitStatus.changedFilesCount} Modified` : 'Clean Tree'}
              </GlassBadge>
            </>
          )}

          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors"
            title="Refresh Git Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Controls & Options */}
      <div className="mt-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 bg-zinc-50 dark:bg-white/[0.02] p-4 rounded-xl border border-zinc-100 dark:border-white/5">
          <label className="flex items-center gap-2 text-xs font-medium text-zinc-700 dark:text-zinc-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoPush}
              onChange={(e) => setAutoPush(e.target.checked)}
              className="rounded border-zinc-300 dark:border-zinc-700 text-purple-600 focus:ring-purple-500 w-4 h-4"
            />
            <UploadCloud className="w-4 h-4 text-purple-500" />
            <span>Automatically push to GitHub origin (using secure token)</span>
          </label>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handlePreview}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-zinc-200/70 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-800 dark:text-white transition-all shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Preview Generated Message</span>
            </button>

            <button
              onClick={() => handleAutoCommit(false)}
              disabled={loading || !gitStatus?.isDirty}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-md shadow-purple-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <GitCommit className="w-3.5 h-3.5" />
              <span>Auto-Commit Hub</span>
            </button>

            <button
              onClick={() => handleAutoCommit(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-cyan-600 to-sky-600 hover:from-cyan-500 hover:to-sky-500 text-white shadow-md shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Sync All Ecosystem Repos</span>
            </button>
          </div>
        </div>

        {/* Status Message */}
        {statusMessage && (
          <div
            className={`p-3 rounded-xl flex items-center gap-2.5 text-xs ${
              statusMessage.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}
          >
            {statusMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{statusMessage.text}</span>
          </div>
        )}

        {/* Preview Drawer */}
        {previewMsg && (
          <div className="bg-zinc-900/90 text-zinc-200 rounded-xl p-4 border border-white/10 font-mono text-xs relative">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                Live Preview of Auto-Generated Commit Message
              </span>
              <button
                onClick={() => setPreviewMsg(null)}
                className="text-zinc-500 hover:text-white text-xs px-1.5 py-0.5 rounded"
              >
                Close
              </button>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed max-h-56 overflow-y-auto">{previewMsg}</pre>
          </div>
        )}

        {/* Console / Log Output */}
        {consoleOutput && (
          <div className="bg-slate-950/95 text-slate-300 rounded-xl p-4 border border-cyan-500/20 font-mono text-xs relative shadow-inner">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-zinc-400">
              <span className="flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                Auto-Commit Engine Execution Stream
              </span>
              <button
                onClick={() => setConsoleOutput(null)}
                className="text-zinc-500 hover:text-white text-xs px-1.5 py-0.5 rounded"
              >
                Dismiss
              </button>
            </div>
            <pre className="whitespace-pre-wrap leading-relaxed max-h-64 overflow-y-auto">{consoleOutput}</pre>
          </div>
        )}

        {/* Changed Files Summary */}
        {gitStatus && gitStatus.isDirty && (
          <div className="pt-2">
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-white/50 mb-2">
              <FileCode className="w-3.5 h-3.5" />
              <span>Pending changes in working tree ({gitStatus.changedFilesCount} files):</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-36 overflow-y-auto pr-1">
              {gitStatus.files.slice(0, 12).map((f, i) => (
                <div
                  key={i}
                  className="px-2.5 py-1 rounded bg-zinc-100 dark:bg-white/[0.03] text-[11px] font-mono text-zinc-700 dark:text-zinc-300 truncate"
                >
                  {f}
                </div>
              ))}
              {gitStatus.files.length > 12 && (
                <div className="px-2.5 py-1 rounded bg-zinc-100/50 dark:bg-white/[0.01] text-[11px] font-mono text-zinc-500 dark:text-white/40 italic">
                  + {gitStatus.files.length - 12} more files...
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </GlassCard>
  );
};
