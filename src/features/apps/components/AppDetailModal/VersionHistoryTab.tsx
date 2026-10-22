import React, { useState, useEffect } from 'react';
import { History, RotateCcw, ArrowUpCircle, CheckCircle2, RefreshCw, AlertCircle, Sparkles, ChevronDown, ChevronUp } from 'lucide-react';
import type { CatalogApp } from '../../../../types/app.types';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { useTheme } from '../../../../context/ThemeContext';

export interface GitHubReleaseItem {
  id: number;
  tag: string;
  rawTag: string;
  name: string;
  releaseNotes: string;
  publishedAt: string;
  isPrerelease: boolean;
  asset: {
    name: string;
    downloadUrl: string;
    sizeFormatted: string;
  } | null;
}

interface VersionHistoryTabProps {
  app: CatalogApp;
  onRollback: (app: CatalogApp, release: GitHubReleaseItem) => void;
}

export const VersionHistoryTab: React.FC<VersionHistoryTabProps> = ({ app, onRollback }) => {
  const [releases, setReleases] = useState<GitHubReleaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rollingBackTag, setRollingBackTag] = useState<string | null>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const currentVersion = (app.localVersion || app.version || '').replace(/^[vV]/, '');

  const fetchHistory = async () => {
    if (!app.githubRepo) return;
    setLoading(true);
    setError(null);
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.getGitHubReleaseHistory) {
        const res = await electronAPI.getGitHubReleaseHistory(app.githubRepo);
        if (res.success && Array.isArray(res.releases)) {
          setReleases(res.releases);
        } else {
          setError(res.error || 'Failed to fetch releases');
        }
      } else {
        // Mock fallback for browser simulation
        setTimeout(() => {
          setReleases([
            {
              id: 101,
              tag: '1.2.0',
              rawTag: 'v1.2.0',
              name: 'v1.2.0 Spring Polish & Faster Loading',
              releaseNotes: '• Major startup performance optimizations\n• Fixed executable path relocation issue\n• Added vibrant liquid glass shader themes',
              publishedAt: 'Yesterday',
              isPrerelease: false,
              asset: { name: 'App-Win-x64.exe', downloadUrl: '#', sizeFormatted: '42.5 MB' },
            },
            {
              id: 102,
              tag: '1.1.0',
              rawTag: 'v1.1.0',
              name: 'v1.1.0 Feature Release: Custom Shaders',
              releaseNotes: '• Introduced chromatic shader presets\n• Native Windows toast notifications support',
              publishedAt: '2 weeks ago',
              isPrerelease: false,
              asset: { name: 'App-Win-x64.exe', downloadUrl: '#', sizeFormatted: '41.8 MB' },
            },
            {
              id: 103,
              tag: '1.0.0',
              rawTag: 'v1.0.0',
              name: 'v1.0.0 Initial Stable Release',
              releaseNotes: '• Initial public release distributed via Creative Hub',
              publishedAt: '1 month ago',
              isPrerelease: false,
              asset: { name: 'App-Win-x64.exe', downloadUrl: '#', sizeFormatted: '40.2 MB' },
            },
          ]);
        }, 500);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [app.id, app.githubRepo]);

  const handleRollbackClick = async (release: GitHubReleaseItem) => {
    setRollingBackTag(release.tag);
    try {
      await onRollback(app, release);
    } finally {
      setRollingBackTag(null);
    }
  };

  if (!app.githubRepo) {
    return (
      <div className="p-8 text-center flex flex-col items-center justify-center space-y-3 rounded-2xl bg-white/[0.03] border border-white/10">
        <History className="w-10 h-10 text-white/30" />
        <h4 className="text-sm font-bold text-white">No GitHub Repository Linked</h4>
        <p className="text-xs text-white/50 max-w-sm leading-relaxed">
          Version rollback and history require a linked GitHub repository. Link your repository in the Publisher Studio to track and rollback any release.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-300 flex items-center gap-1.5 font-semibold">
            <History className="w-3.5 h-3.5" />
            <span>Adobe CC-Style Version History & Rollback</span>
          </h4>
          <p className="text-[11px] text-white/50 mt-0.5">
            Switch or rollback to any previous release tag published on GitHub.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="px-2.5 py-1 text-[10px] font-mono rounded-lg bg-white/[0.06] hover:bg-white/10 text-white/70 hover:text-white transition-all flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-xs text-white/50 gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-cyan-400" />
          <span>Fetching release history from GitHub...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && releases.length === 0 && (
        <div className="py-8 text-center text-xs text-white/40">
          No releases found for <code className="text-cyan-300 font-mono">{app.githubRepo}</code>.
        </div>
      )}

      {!loading && releases.length > 0 && (
        <div className="space-y-2.5">
          {releases.map((rel) => {
            const isCurrent = rel.tag === currentVersion;
            const isExpanded = expandedId === rel.id;
            const isRolling = rollingBackTag === rel.tag;

            return (
              <div
                key={rel.id}
                className={`p-3.5 rounded-xl border transition-all ${
                  isCurrent
                    ? isLight
                      ? 'bg-emerald-500/10 border-emerald-500/30 shadow-sm'
                      : 'bg-emerald-500/[0.08] border-emerald-400/30 shadow-md shadow-emerald-500/5'
                    : isLight
                    ? 'bg-white/80 border-slate-900/10 hover:border-sky-400/50 shadow-sm'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded-md ${
                        isCurrent
                          ? isLight
                            ? 'bg-emerald-500/15 text-emerald-800 border border-emerald-500/30'
                            : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                          : isLight
                          ? 'bg-slate-200/80 text-slate-800 border border-slate-300'
                          : 'bg-white/10 text-white/80 border border-white/10'
                      }`}
                    >
                      {rel.rawTag}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-xs font-semibold truncate ${
                            isLight ? 'text-slate-900' : 'text-white'
                          }`}
                        >
                          {rel.name}
                        </p>
                        {isCurrent && (
                          <span
                            className={`flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.2 rounded-full border ${
                              isLight
                                ? 'text-emerald-800 bg-emerald-500/15 border-emerald-500/30 font-semibold'
                                : 'text-emerald-300 bg-emerald-500/15 border-emerald-400/20'
                            }`}
                          >
                            <CheckCircle2 className="w-2.5 h-2.5" />
                            <span>Active Installed</span>
                          </span>
                        )}
                        {rel.isPrerelease && (
                          <span className="text-[9px] font-mono text-amber-300 bg-amber-500/15 px-1.5 py-0.2 rounded-full border border-amber-400/20">
                            Beta
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-white/40 font-mono mt-0.5">
                        Published: {rel.publishedAt} · Asset: {rel.asset?.name || 'No Windows Binary'} ({rel.asset?.sizeFormatted || 'N/A'})
                      </p>
                    </div>
                  </div>

                  {/* Action button */}
                  <div className="flex items-center gap-2 shrink-0">
                    {rel.asset && !isCurrent && (
                      <GlassButton
                        variant={rel.tag > currentVersion ? 'primary' : 'glass'}
                        size="sm"
                        disabled={isRolling}
                        onClick={() => handleRollbackClick(rel)}
                        icon={
                          isRolling ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : rel.tag > currentVersion ? (
                            <ArrowUpCircle className="w-3 h-3 text-cyan-400" />
                          ) : (
                            <RotateCcw className="w-3 h-3 text-amber-400" />
                          )
                        }
                        className="text-[11px] px-3"
                      >
                        {isRolling
                          ? 'Applying...'
                          : rel.tag > currentVersion
                          ? `Upgrade to ${rel.rawTag}`
                          : `Rollback to ${rel.rawTag}`}
                      </GlassButton>
                    )}

                    {rel.releaseNotes && (
                      <button
                        onClick={() => setExpandedId(isExpanded ? null : rel.id)}
                        className="p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
                        title={isExpanded ? 'Hide release notes' : 'View release notes'}
                      >
                        {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                  </div>
                </div>

                {/* Expandable release notes */}
                {isExpanded && rel.releaseNotes && (
                  <div className="mt-3 pt-3 border-t border-white/[0.06] text-xs text-white/70 font-mono whitespace-pre-line leading-relaxed bg-black/30 p-2.5 rounded-lg">
                    {rel.releaseNotes}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
