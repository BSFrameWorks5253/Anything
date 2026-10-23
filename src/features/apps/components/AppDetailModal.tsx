import React, { useState } from 'react';
import { X, Play, Download, Trash2, Cpu, HardDrive, Monitor, CheckCircle, Sparkles, AlertTriangle, Wrench, RefreshCw, GitBranch, ExternalLink, Copy, Check, Cloud } from 'lucide-react';
import type { CatalogApp } from '../../../types/app.types';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import { AppIconRenderer } from './CrazyAppStudio/AppIconRenderer';
import { VersionHistoryTab } from './AppDetailModal/VersionHistoryTab';
import { useTheme } from '../../../context/ThemeContext';

interface AppDetailModalProps {
  app: CatalogApp | null;
  isOpen: boolean;
  onClose: () => void;
  onLaunch: (app: CatalogApp) => void;
  onInstall: (app: CatalogApp) => void;
  onUpdate: (app: CatalogApp) => void;
  onRollback?: (app: CatalogApp, release: any) => void;
  onFixPath: (app: CatalogApp) => void;
  onUninstall: (appId: string) => void;
  onDeleteApp?: (appId: string) => void;
}

export const AppDetailModal: React.FC<AppDetailModalProps> = ({
  app,
  isOpen,
  onClose,
  onLaunch,
  onInstall,
  onUpdate,
  onRollback,
  onFixPath,
  onUninstall,
  onDeleteApp,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'release-notes' | 'versions'>('overview');
  const [confirmAction, setConfirmAction] = useState<'uninstall' | 'delete' | null>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!isOpen || !app) return null;

  const defaultReqs = app.systemRequirements || {
    os: 'Windows 11 / macOS Tahoe 16+',
    ram: '16 GB RAM (32 GB recommended)',
    gpu: 'DirectX 12 / Apple Metal 4',
    storage: app.size || '100 MB SSD',
  };

  const defaultNotes = app.changelog || [
    `Version ${app.version} distributed via Creative Hub`,
    'Optimized for instant launching and background updates',
    'Full path verification and auto-repair support',
  ];

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-2xl animate-fadeIn ${
        isLight ? 'bg-slate-900/40' : 'bg-slate-950/75'
      }`}
    >
      <GlassCard
        variant="elevated"
        className={`w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh] ${
          isLight ? 'border-white/80' : 'border-white/20'
        }`}
      >
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ background: app.glowColor }}
        />

        {/* Modal Top Bar */}
        <div
          className={`flex items-center justify-between p-6 pb-4 border-b relative z-10 ${
            isLight ? 'border-slate-900/10' : 'border-white/[0.08]'
          }`}
        >
          <div className="flex items-center gap-4">
            <AppIconRenderer app={app} size="lg" />

            <div>
              <div className="flex items-center gap-2">
                <h2
                  className={`text-xl font-extrabold tracking-tight ${
                    isLight ? 'text-slate-900' : 'text-white'
                  }`}
                >
                  {app.name}
                </h2>
                {(app.status === 'installed' || app.status === 'ready') && (
                  <GlassBadge variant="emerald" dot>Installed</GlassBadge>
                )}
                {app.status === 'update-available' && (
                  <GlassBadge variant="cyan" dot>Update Ready</GlassBadge>
                )}
                {app.status === 'path-broken' && (
                  <GlassBadge variant="amber" dot>Needs Repair</GlassBadge>
                )}
              </div>
              <p
                className={`text-xs font-mono mt-0.5 ${
                  isLight ? 'text-slate-500' : 'text-white/50'
                }`}
              >
                Version {app.localVersion || app.version} · {app.category} · {app.size || '42.8 MB'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isLight
                ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div
          className={`flex items-center gap-2 px-6 pt-3 border-b ${
            isLight ? 'border-slate-900/10 bg-slate-50/50' : 'border-white/[0.06] bg-white/[0.02]'
          }`}
        >
          {[
            { id: 'overview', label: 'Overview & Path' },
            { id: 'requirements', label: 'Hardware Specs' },
            { id: 'release-notes', label: 'Changelog' },
            { id: 'versions', label: 'Other Versions & Rollback' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-2.5 px-3 text-xs font-medium border-b-2 transition-all ${
                activeTab === tab.id
                  ? isLight
                    ? 'border-sky-500 text-sky-700 font-bold'
                    : 'border-cyan-400 text-white font-semibold'
                  : isLight
                  ? 'border-transparent text-slate-500 hover:text-slate-900'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content Area */}
        <div
          className={`flex-1 overflow-y-auto p-6 space-y-5 text-sm ${
            isLight ? 'text-zinc-700' : 'text-zinc-200'
          }`}
        >
          {activeTab === 'overview' && (
            <div className="space-y-4">
              <div>
                <h4
                  className={`text-xs font-mono uppercase tracking-wider mb-1 ${
                    isLight ? 'text-zinc-500' : 'text-zinc-400'
                  }`}
                >
                  Description
                </h4>
                <p
                  className={`text-sm leading-relaxed font-normal ${
                    isLight ? 'text-zinc-800' : 'text-zinc-200'
                  }`}
                >
                  {app.description ||
                    'High-performance desktop companion for hardware macro automation, hotkey triggers, and system controls integrated natively into the Anything ecosystem.'}
                </p>
              </div>

              {/* Path & Installation Info Card */}
              <div
                className={`p-4 rounded-xl border space-y-2 ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200'
                    : 'bg-white/[0.04] border-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[11px] font-mono block ${
                      isLight ? 'text-zinc-500' : 'text-zinc-400'
                    }`}
                  >
                    EXECUTABLE LOCATION
                  </span>
                  <button
                    onClick={() => onFixPath(app)}
                    className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-mono flex items-center gap-1 font-semibold"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Change / Fix Path</span>
                  </button>
                </div>
                <div
                  className={`p-2.5 rounded-lg font-mono text-xs break-all select-all border ${
                    isLight
                      ? 'bg-white border-zinc-200 text-cyan-700 font-semibold'
                      : 'bg-black/40 border-white/5 text-cyan-300'
                  }`}
                >
                  {app.installedPath && !app.installedPath.toLowerCase().includes('setup')
                    ? app.installedPath
                    : `Status: Not installed • Click "Download & Install" below to fetch latest setup from GitHub`}
                </div>
              </div>

              {/* GitHub Repository Releases Source */}
              {app.githubRepo && (
                <div
                  className={`p-4 rounded-xl border space-y-3 ${
                    isLight
                      ? 'bg-cyan-50/80 border-cyan-200'
                      : 'bg-cyan-500/[0.06] border-cyan-400/20'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-300 flex items-center gap-1.5 font-bold">
                      <GitBranch className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                      <span>REPOSITORY RELEASES (GITHUB)</span>
                    </span>
                    <a
                      href={`https://github.com/${app.githubRepo}/releases`}
                      target="_blank"
                      rel="noreferrer"
                      onClick={(e) => {
                        e.preventDefault();
                        const electronAPI = (window as any).electronAPI;
                        if (electronAPI?.openExternal) {
                          electronAPI.openExternal(`https://github.com/${app.githubRepo}/releases`);
                        } else {
                          window.open(`https://github.com/${app.githubRepo}/releases`, '_blank');
                        }
                      }}
                      className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-mono font-semibold"
                    >
                      <span>Releases Page</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  <div className="p-2.5 rounded-lg bg-black/20 border border-cyan-500/20 font-mono text-[11px] text-cyan-700 dark:text-cyan-300 break-all select-all flex items-center justify-between gap-2">
                    <span className="truncate">https://github.com/{app.githubRepo}/releases</span>
                    <button
                      onClick={async () => {
                        await navigator.clipboard.writeText(`https://github.com/${app.githubRepo}/releases`);
                      }}
                      title="Copy Release Link"
                      className="p-1 hover:bg-cyan-500/20 rounded text-cyan-600 dark:text-cyan-400 shrink-0"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {app.latestRelease ? (
                    <div
                      className={`p-2.5 rounded-lg text-xs border flex items-center justify-between ${
                        isLight
                          ? 'bg-white border-cyan-200 text-zinc-900'
                          : 'bg-black/40 border-cyan-400/20 text-white'
                      }`}
                    >
                      <div>
                        <p className="font-semibold">
                          Latest GitHub Release: v{app.latestRelease.tag}
                        </p>
                        <p
                          className={`text-[10px] font-mono ${
                            isLight ? 'text-zinc-500' : 'text-zinc-400'
                          }`}
                        >
                          Asset: {app.latestRelease.assetName} (
                          {app.latestRelease.assetSize || 'N/A'})
                        </p>
                      </div>
                      <GlassButton
                        variant="primary"
                        size="sm"
                        onClick={() => {
                          onUpdate(app);
                          onClose();
                        }}
                        icon={<RefreshCw className="w-3 h-3" />}
                        className="text-xs font-bold"
                      >
                        Update Now
                      </GlassButton>
                    </div>
                  ) : (
                    <p
                      className={`text-xs leading-relaxed ${
                        isLight ? 'text-zinc-700' : 'text-zinc-300'
                      }`}
                    >
                      This application automatically tracks and receives new releases published to GitHub.
                    </p>
                  )}
                </div>
              )}

              {/* Status Banner */}
              {app.status === 'path-broken' && (
                <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2.5 text-xs text-amber-800 dark:text-amber-200 font-medium">
                    <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>Executable is missing or was moved. Please locate the file to launch.</span>
                  </div>
                  <GlassButton
                    variant="glass"
                    size="sm"
                    onClick={() => onFixPath(app)}
                    icon={<Wrench className="w-3 h-3 text-amber-500" />}
                  >
                    Locate
                  </GlassButton>
                </div>
              )}
            </div>
          )}

          {activeTab === 'requirements' && (
            <div className="grid grid-cols-2 gap-3">
              <div
                className={`p-4 rounded-xl border ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    : 'bg-white/[0.03] border-white/10 text-white'
                }`}
              >
                <Monitor className="w-4 h-4 text-cyan-600 dark:text-cyan-400 mb-2" />
                <span
                  className={`text-[11px] font-mono block font-bold ${
                    isLight ? 'text-zinc-500' : 'text-zinc-400'
                  }`}
                >
                  OPERATING SYSTEM
                </span>
                <span className="text-xs font-bold mt-0.5 block">{defaultReqs.os}</span>
              </div>
              <div
                className={`p-4 rounded-xl border ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    : 'bg-white/[0.03] border-white/10 text-white'
                }`}
              >
                <Cpu className="w-4 h-4 text-purple-600 dark:text-purple-400 mb-2" />
                <span
                  className={`text-[11px] font-mono block font-bold ${
                    isLight ? 'text-zinc-500' : 'text-zinc-400'
                  }`}
                >
                  MEMORY
                </span>
                <span className="text-xs font-bold mt-0.5 block">{defaultReqs.ram}</span>
              </div>
              <div
                className={`p-4 rounded-xl border ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    : 'bg-white/[0.03] border-white/10 text-white'
                }`}
              >
                <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400 mb-2" />
                <span
                  className={`text-[11px] font-mono block font-bold ${
                    isLight ? 'text-zinc-500' : 'text-zinc-400'
                  }`}
                >
                  GRAPHICS
                </span>
                <span className="text-xs font-bold mt-0.5 block">{defaultReqs.gpu}</span>
              </div>
              <div
                className={`p-4 rounded-xl border ${
                  isLight
                    ? 'bg-zinc-50 border-zinc-200 text-zinc-900'
                    : 'bg-white/[0.03] border-white/10 text-white'
                }`}
              >
                <HardDrive className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mb-2" />
                <span
                  className={`text-[11px] font-mono block font-bold ${
                    isLight ? 'text-zinc-500' : 'text-zinc-400'
                  }`}
                >
                  DISK SPACE
                </span>
                <span className="text-xs font-bold mt-0.5 block">{defaultReqs.storage}</span>
              </div>
            </div>
          )}

          {activeTab === 'release-notes' && (
            <div className="space-y-3">
              <h4
                className={`text-xs font-mono uppercase tracking-wider mb-2 font-bold ${
                  isLight ? 'text-zinc-500' : 'text-zinc-400'
                }`}
              >
                Changelog · Version {app.version}
              </h4>
              <ul className="space-y-2">
                {defaultNotes.map((note, i) => (
                  <li
                    key={i}
                    className={`flex items-start gap-2.5 text-xs font-medium leading-relaxed ${
                      isLight ? 'text-zinc-800' : 'text-zinc-200'
                    }`}
                  >
                    <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0 mt-1" />
                    <span>{note}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {activeTab === 'versions' && (
            <VersionHistoryTab
              app={app}
              onRollback={async (targetApp, release) => {
                if (onRollback) {
                  onRollback(targetApp, release);
                } else {
                  onUpdate({
                    ...targetApp,
                    version: release.tag,
                    latestRelease: release.asset
                      ? {
                          tag: release.tag,
                          name: release.name,
                          body: release.releaseNotes,
                          assetUrl: release.asset.downloadUrl,
                          assetName: release.asset.name,
                          assetSize: release.asset.sizeFormatted,
                          publishedAt: release.publishedAt,
                        }
                      : undefined,
                  });
                }
              }}
            />
          )}
        </div>

        {/* Modal Actions Footer */}
        <div
          className={`p-5 border-t flex items-center justify-between flex-wrap gap-3 ${
            isLight ? 'border-slate-900/10 bg-slate-100/90' : 'border-white/[0.08] bg-slate-950/60'
          }`}
        >
          <div>
            {confirmAction === 'uninstall' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-300 font-medium">Uninstall from PC?</span>
                <button
                  onClick={() => {
                    onUninstall(app.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all"
                >
                  Yes, Uninstall
                </button>
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-2.5 py-1 rounded-full text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : confirmAction === 'delete' ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-rose-300 font-medium">Delete completely?</span>
                <button
                  onClick={() => {
                    if (onDeleteApp) onDeleteApp(app.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 transition-all"
                >
                  Yes, Delete All
                </button>
                <button
                  onClick={() => setConfirmAction(null)}
                  className="px-2.5 py-1 rounded-full text-xs text-white/60 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                {(app.status === 'installed' || app.status === 'ready' || app.status === 'update-available' || Boolean(app.installedPath)) && (
                  <button
                    onClick={() => setConfirmAction('uninstall')}
                    className="text-xs text-white/40 hover:text-rose-400 flex items-center gap-1.5 transition-colors font-mono"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Uninstall</span>
                  </button>
                )}
                {onDeleteApp && (
                  <button
                    onClick={() => setConfirmAction('delete')}
                    className="text-xs text-rose-400/70 hover:text-rose-400 flex items-center gap-1.5 transition-colors font-mono"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Delete from Anything</span>
                  </button>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <GlassButton variant="ghost" size="sm" onClick={onClose}>
              Done
            </GlassButton>

            {app.status === 'installed' && (
              <GlassButton
                variant="primary"
                size="sm"
                icon={<Play className="w-3.5 h-3.5 fill-current" />}
                onClick={() => {
                  onLaunch(app);
                  onClose();
                }}
              >
                Launch App
              </GlassButton>
            )}

            {app.status === 'not-installed' && (
              <GlassButton
                variant="primary"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={() => {
                  onInstall(app);
                  onClose();
                }}
              >
                Download & Install
              </GlassButton>
            )}

            {app.status === 'update-available' && (
              <GlassButton
                variant="primary"
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => {
                  onUpdate(app);
                  onClose();
                }}
              >
                Install Update (v{app.version})
              </GlassButton>
            )}

            {app.status === 'path-broken' && (
              <GlassButton
                variant="primary"
                size="sm"
                icon={<Wrench className="w-3.5 h-3.5" />}
                onClick={() => {
                  onFixPath(app);
                  onClose();
                }}
              >
                Relocate Executable
              </GlassButton>
            )}
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
