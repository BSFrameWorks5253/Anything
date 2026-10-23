import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCcw,
  ArrowUpCircle,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  Mail,
  Zap,
  Wrench,
  Package,
  Trash2,
  Send,
  Check,
} from 'lucide-react';
import type { CatalogApp, AppReleaseMetadata } from '../../../../types/app.types';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { useTheme } from '../../../../context/ThemeContext';
import { AnimatedReleaseEmailModal } from '../../../../components/ui/AnimatedReleaseEmailModal';

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
  releaseMetadata?: AppReleaseMetadata;
}

interface VersionHistoryTabProps {
  app: CatalogApp;
  onRollback: (app: CatalogApp, release: any) => void;
  onVersionDeleted?: (version: string) => void;
}

export const VersionHistoryTab: React.FC<VersionHistoryTabProps> = ({
  app,
  onRollback,
  onVersionDeleted,
}) => {
  const [releases, setReleases] = useState<GitHubReleaseItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [rollingBackTag, setRollingBackTag] = useState<string | null>(null);
  const [emailModalRelease, setEmailModalRelease] = useState<AppReleaseMetadata | null>(null);
  const [deleteConfirmTag, setDeleteConfirmTag] = useState<string | null>(null);
  const [pushedTags, setPushedTags] = useState<{ [tag: string]: boolean }>({});
  const [isDeleting, setIsDeleting] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const currentVersion = (app.localVersion || app.version || '').replace(/^[vV]/, '');

  const buildLocalHistoryReleases = (): GitHubReleaseItem[] => {
    const list: GitHubReleaseItem[] = [];

    // 1. History items from app.history (e.g. from release.json)
    if (Array.isArray(app.history) && app.history.length > 0) {
      app.history.forEach((h, idx) => {
        list.push({
          id: 1000 + idx,
          tag: h.version.replace(/^[vV]/, ''),
          rawTag: `v${h.version.replace(/^[vV]/, '')}`,
          name: `${app.name} v${h.version}: ${h.tagline || 'Update'}`,
          releaseNotes: h.summary || `Release v${h.version}`,
          publishedAt: h.releaseDate || 'Local Release',
          isPrerelease: false,
          asset: {
            name: h.executableName || `${app.name}_${h.version}.exe`,
            downloadUrl: h.downloadUrl || '#',
            sizeFormatted: h.sizeFormatted || app.size || '45 MB',
          },
          releaseMetadata: h,
        });
      });
    }

    // 2. Add current active version if not already present
    if (!list.some((r) => r.tag === currentVersion)) {
      list.unshift({
        id: 999,
        tag: currentVersion,
        rawTag: `v${currentVersion}`,
        name: `${app.name} v${currentVersion}: Current Stable Build`,
        releaseNotes:
          app.releaseInfo?.summary ||
          (Array.isArray(app.changelog) ? app.changelog.join('\n• ') : `Active version ${currentVersion}`),
        publishedAt: 'Current',
        isPrerelease: false,
        asset: {
          name: app.executableName || `${app.name}_${currentVersion}.exe`,
          downloadUrl: app.downloadUrl || '#',
          sizeFormatted: app.size || 'Standard',
        },
        releaseMetadata: app.releaseInfo || {
          version: currentVersion,
          executableName: app.executableName || `${app.name}_${currentVersion}.exe`,
          summary: `Active installed version of ${app.name}`,
          newFeatures: [
            'Full liquid glass UI theme integration',
            'Windows Start Menu shortcut and uninstaller registration',
            'Auto-updater channel connected',
          ],
          improvements: [
            'Optimized startup performance and rapid window creation',
            'Reduced background idle RAM footprint',
          ],
          fixes: [
            'Fixed path resolving for custom Windows drive partitions',
          ],
        },
      });
    }

    return list;
  };

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const electronAPI = (window as any).electronAPI;
      if (app.githubRepo && electronAPI?.getGitHubReleaseHistory) {
        const res = await electronAPI.getGitHubReleaseHistory(app.githubRepo);
        if (res.success && Array.isArray(res.releases) && res.releases.length > 0) {
          setReleases(res.releases);
          return;
        }
      }

      // Fallback to local release history
      const localList = buildLocalHistoryReleases();
      setReleases(localList);
    } catch (e: any) {
      setError(e.message);
      setReleases(buildLocalHistoryReleases());
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, [app.id, app.githubRepo, app.version]);

  const handleRollbackClick = async (release: GitHubReleaseItem) => {
    setRollingBackTag(release.tag);
    try {
      await onRollback(app, release);
    } finally {
      setRollingBackTag(null);
    }
  };

  const handleOpenEmailPreview = (rel: GitHubReleaseItem) => {
    const meta: AppReleaseMetadata = rel.releaseMetadata || {
      version: rel.tag,
      executableName: rel.asset?.name || `${app.name}_${rel.tag}.exe`,
      tagline: rel.name.replace(/^v[0-9.]+\s*[:\-]?\s*/i, '') || 'Official Release Dispatch',
      summary: rel.releaseNotes,
      releaseDate: rel.publishedAt,
      newFeatures: [
        'Expanded feature toolkit and workflow enhancements',
        'Direct integration with Anything Master Hub',
        'Windows 11 Start Menu & desktop setup installer',
      ],
      improvements: [
        'Significant startup speed boost and memory reductions',
        'High-DPI display canvas rendering optimizations',
      ],
      fixes: [
        'Patched path resolution edge cases on Windows drives',
      ],
    };
    setEmailModalRelease(meta);
  };

  const handleDirectPushEmail = async (rel: GitHubReleaseItem) => {
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.pushReleaseEmail) {
        await electronAPI.pushReleaseEmail({
          appId: app.id,
          version: rel.tag,
          payload: rel.releaseMetadata,
        });
      }
      setPushedTags((prev) => ({ ...prev, [rel.tag]: true }));
      setTimeout(() => {
        setPushedTags((prev) => ({ ...prev, [rel.tag]: false }));
      }, 4000);
    } catch (e) {
      console.error('Failed to push email:', e);
    }
  };

  const handleConfirmDeleteVersion = async (tag: string) => {
    setIsDeleting(true);
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.deleteAppVersion) {
        await electronAPI.deleteAppVersion({ appId: app.id, version: tag });
      }
      setReleases((prev) => prev.filter((r) => r.tag !== tag));
      if (onVersionDeleted) {
        onVersionDeleted(tag);
      }
      setDeleteConfirmTag(null);
    } catch (e: any) {
      setError(e.message || 'Failed to delete version.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-300 flex items-center gap-1.5 font-bold">
            <History className="w-3.5 h-3.5" />
            <span>Version History & Rollback Archive</span>
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-white/50 mt-0.5">
            Switch to previous versions, inspect changelog breakdowns (Features, Improvements, Fixes), or preview animated release emails.
          </p>
        </div>

        <button
          onClick={fetchHistory}
          disabled={loading}
          className="px-2.5 py-1 text-[10px] font-mono rounded-lg bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-zinc-700 dark:text-white/70 transition-all flex items-center gap-1"
        >
          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {loading && (
        <div className="py-12 flex flex-col items-center justify-center text-xs text-zinc-500 dark:text-white/50 gap-2">
          <RefreshCw className="w-5 h-5 animate-spin text-cyan-500" />
          <span>Scanning version archives...</span>
        </div>
      )}

      {error && (
        <div className="p-4 rounded-xl bg-rose-500/15 border border-rose-500/30 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {!loading && releases.length > 0 && (
        <div className="space-y-3">
          {releases.map((rel) => {
            const isCurrent = rel.tag === currentVersion;
            const isExpanded = expandedId === rel.id;
            const isRolling = rollingBackTag === rel.tag;
            const meta = rel.releaseMetadata;

            return (
              <div
                key={rel.id}
                className={`p-4 rounded-2xl border transition-all ${
                  isCurrent
                    ? isLight
                      ? 'bg-emerald-500/10 border-emerald-500/30 shadow-xs'
                      : 'bg-emerald-500/[0.08] border-emerald-400/30 shadow-md shadow-emerald-500/5'
                    : isLight
                    ? 'bg-white/80 border-zinc-200 hover:border-cyan-500/40 shadow-xs'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg ${
                        isCurrent
                          ? isLight
                            ? 'bg-emerald-500/20 text-emerald-800 border border-emerald-500/30'
                            : 'bg-emerald-400/20 text-emerald-300 border border-emerald-400/40'
                          : isLight
                          ? 'bg-zinc-200 text-zinc-800 border border-zinc-300'
                          : 'bg-white/10 text-white/80 border border-white/10'
                      }`}
                    >
                      {rel.rawTag}
                    </span>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p
                          className={`text-xs font-bold truncate ${
                            isLight ? 'text-zinc-900' : 'text-white'
                          }`}
                        >
                          {rel.name}
                        </p>
                        {isCurrent && (
                          <span
                            className={`flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                              isLight
                                ? 'text-emerald-800 bg-emerald-500/15 border-emerald-500/30 font-bold'
                                : 'text-emerald-300 bg-emerald-500/15 border-emerald-400/20 font-bold'
                            }`}
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Current Installed</span>
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-white/40 font-mono mt-0.5">
                        Build: <span className="font-semibold">{rel.asset?.name || `${app.name}_${rel.tag}.exe`}</span> · Size: {rel.asset?.sizeFormatted || '45 MB'} · Date: {rel.publishedAt}
                      </p>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-zinc-200 dark:border-white/10">
                    {/* Animated Email Dispatch Button */}
                    <button
                      onClick={() => handleOpenEmailPreview(rel)}
                      className="px-2.5 py-1.5 rounded-xl text-xs font-medium bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 transition-all"
                      title="Preview Animated Release Email"
                    >
                      <Mail className="w-3.5 h-3.5 text-cyan-500" />
                      <span>Release Email</span>
                    </button>

                    {/* Direct Push Email Button */}
                    <button
                      onClick={() => handleDirectPushEmail(rel)}
                      className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border flex items-center gap-1.5 transition-all ${
                        pushedTags[rel.tag]
                          ? 'bg-emerald-500 text-slate-950 border-emerald-500 shadow-sm font-bold'
                          : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-white/10'
                      }`}
                      title="Push Release Email directly to all subscribers"
                    >
                      {pushedTags[rel.tag] ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          <span>Pushed!</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 text-sky-500" />
                          <span>Push</span>
                        </>
                      )}
                    </button>

                    {/* Delete Version Button */}
                    <button
                      onClick={() => setDeleteConfirmTag(rel.tag)}
                      className="p-1.5 rounded-xl text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 border border-transparent hover:border-rose-500/20 transition-all"
                      title={`Delete Version ${rel.rawTag} from disk & history`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>

                    {/* Switch / Upgrade / Rollback Button */}
                    {!isCurrent && (
                      <GlassButton
                        variant={rel.tag > currentVersion ? 'primary' : 'glass'}
                        size="sm"
                        disabled={isRolling}
                        onClick={() => handleRollbackClick(rel)}
                        icon={
                          isRolling ? (
                            <RefreshCw className="w-3 h-3 animate-spin" />
                          ) : rel.tag > currentVersion ? (
                            <ArrowUpCircle className="w-3.5 h-3.5 text-cyan-400" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400" />
                          )
                        }
                      >
                        {isRolling
                          ? 'Switching...'
                          : rel.tag > currentVersion
                          ? `Upgrade to ${rel.rawTag}`
                          : `Use ${rel.rawTag}`}
                      </GlassButton>
                    )}

                    <button
                      onClick={() => setExpandedId(isExpanded ? null : rel.id)}
                      className="p-1.5 rounded-xl text-zinc-500 hover:text-zinc-900 dark:text-white/40 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
                      title={isExpanded ? 'Hide Details' : 'View Fixes & Improvements'}
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Expanded Categorized Details (Features, Improvements, Fixes) */}
                {isExpanded && (
                  <div className="mt-3.5 pt-3.5 border-t border-zinc-200 dark:border-white/[0.08] space-y-3 animate-fade-in">
                    {/* Summary text */}
                    {rel.releaseNotes && (
                      <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-medium">
                        {rel.releaseNotes}
                      </p>
                    )}

                    {/* 3 Pillars Breakdown */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 pt-1">
                      {/* Features */}
                      <div className="p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/20 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold font-mono">
                          <span>🚀</span>
                          <span>New Features</span>
                        </div>
                        <ul className="text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1 pl-1">
                          {(meta?.newFeatures || ['Windows Start Menu installer setup', 'Enhanced UI rendering pipeline']).map((f, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-emerald-500">•</span>
                              <span>{f}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Improvements */}
                      <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-cyan-700 dark:text-cyan-400 font-bold font-mono">
                          <Zap className="w-3.5 h-3.5" />
                          <span>Improvements</span>
                        </div>
                        <ul className="text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1 pl-1">
                          {(meta?.improvements || ['Reduced launch latency', 'Optimized memory usage']).map((imp, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-cyan-500">•</span>
                              <span>{imp}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Fixes */}
                      <div className="p-3 rounded-xl bg-rose-500/5 border border-rose-500/20 text-xs space-y-1.5">
                        <div className="flex items-center gap-1.5 text-rose-700 dark:text-rose-400 font-bold font-mono">
                          <Wrench className="w-3.5 h-3.5" />
                          <span>Bug Fixes</span>
                        </div>
                        <ul className="text-[11px] text-zinc-600 dark:text-zinc-300 space-y-1 pl-1">
                          {(meta?.fixes || ['Fixed executable launch path resolution', 'Windows 11 theme smoothing']).map((fx, i) => (
                            <li key={i} className="flex items-start gap-1.5">
                              <span className="text-rose-500">•</span>
                              <span>{fx}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Animated Email Modal Popup */}
      {emailModalRelease && (
        <AnimatedReleaseEmailModal
          isOpen={Boolean(emailModalRelease)}
          onClose={() => setEmailModalRelease(null)}
          app={app}
          release={emailModalRelease}
          userEmail="burhanuddin@anything.io"
          onInstallVersion={(targetApp, targetVer) => {
            const relToInstall = releases.find((r) => r.tag === targetVer);
            if (relToInstall) {
              handleRollbackClick(relToInstall);
            }
          }}
        />
      )}
      {/* Delete Version Confirmation Dialog */}
      {deleteConfirmTag && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Delete Release v{deleteConfirmTag}?</h4>
                <p className="text-xs text-zinc-400">This removes the version folder and installer binary from disk.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/60 font-mono">
              Target: <span className="text-white font-bold">{app.name} (v{deleteConfirmTag})</span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmTag(null)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => handleConfirmDeleteVersion(deleteConfirmTag)}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Version'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
