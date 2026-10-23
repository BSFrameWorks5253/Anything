import React, { useState } from 'react';
import {
  ArrowLeft,
  Play,
  Download,
  RefreshCw,
  Wrench,
  Trash2,
  GitBranch,
  ExternalLink,
  Cpu,
  Monitor,
  Sparkles,
  HardDrive,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Palette,
  ShieldCheck,
  User,
  Pencil,
  Check,
  Copy,
  Cloud,
  Globe,
} from 'lucide-react';
import type { CatalogApp } from '../../types/app.types';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { AppIconRenderer } from './components/CrazyAppStudio/AppIconRenderer';
import { VersionHistoryTab } from './components/AppDetailModal/VersionHistoryTab';
import { EditAppModal } from './components/EditAppModal';
import { AppDemoModal } from './components/AppDemoModal';
import { useTheme } from '../../context/ThemeContext';

interface AppDetailPageProps {
  app: CatalogApp;
  onBack: () => void;
  onLaunch: (app: CatalogApp) => void;
  onInstall: (app: CatalogApp) => void;
  onUpdate: (app: CatalogApp) => void;
  onRollback?: (app: CatalogApp, release: any) => void;
  onFixPath: (app: CatalogApp) => void;
  onUninstall: (appId: string) => void;
  onCustomizeLoader?: (app: CatalogApp) => void;
  onDeleteApp?: (appId: string) => void;
  onRenameApp?: (appId: string, newName: string) => void;
  onEditApp?: (appId: string, updates: Partial<CatalogApp>) => Promise<void> | void;
  onVersionDeleted?: (appId: string, version: string) => void;
  onStartTrial?: (app: CatalogApp) => void;
}

export const AppDetailPage: React.FC<AppDetailPageProps> = ({
  app,
  onBack,
  onLaunch,
  onInstall,
  onUpdate,
  onRollback,
  onFixPath,
  onUninstall,
  onCustomizeLoader,
  onDeleteApp,
  onRenameApp,
  onEditApp,
  onVersionDeleted,
  onStartTrial,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'release-notes' | 'versions'>('overview');
  const [currentAppName, setCurrentAppName] = useState(app.name);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [renameInput, setRenameInput] = useState(app.name);
  const [isRenaming, setIsRenaming] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [uninstallModalOpen, setUninstallModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isUninstalling, setIsUninstalling] = useState(false);
  const [copiedReleaseUrl, setCopiedReleaseUrl] = useState(false);
  const [copiedTagUrl, setCopiedTagUrl] = useState(false);
  const [copiedAssetUrl, setCopiedAssetUrl] = useState(false);
  const [resolvedExePath, setResolvedExePath] = useState<string | undefined>(
    app.installedPath && !app.installedPath.toLowerCase().includes('setup') ? app.installedPath : undefined
  );
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Auto-resolve real installed executable on disk
  React.useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.resolveInstalledPath) {
      electronAPI
        .resolveInstalledPath({
          appId: app.id,
          name: app.name,
          currentPath: app.installedPath,
          executableName: app.executableName || `${app.name}.exe`,
        })
        .then((res: any) => {
          if (res?.installed && res?.resolvedPath) {
            setResolvedExePath(res.resolvedPath);
            app.installedPath = res.resolvedPath;
            if (app.status === 'not-installed' || app.status === 'path-broken') {
              app.status = 'installed';
            }
          }
        })
        .catch(() => {});
    }
  }, [app.id, app.installedPath, app.executableName, app.name]);

  const repoReleasesUrl =
    app.releasesUrl || (app.githubRepo ? `https://github.com/${app.githubRepo}/releases` : 'https://github.com/BSFrameWorks5253/TapDesk/releases');
  const releasesTagBaseUrl =
    app.releasesTagUrl ||
    app.endpoints?.releasesTagUrl ||
    (app.githubRepo ? `https://github.com/${app.githubRepo}/releases/tag/` : 'https://github.com/BSFrameWorks5253/TapDesk/releases/tag/');
  const latestTag = `v${app.version || '1.2.0'}`;
  const tagReleasesUrl = `${releasesTagBaseUrl.replace(/\/+$/, '')}/${latestTag}`;
  const setupExeName =
    app.setupExecutableName ||
    (app.packageFileName?.toLowerCase().includes('setup')
      ? app.packageFileName
      : `${app.name.replace(/\s+/g, '')}_${app.version}_Setup.exe`);
  const setupDownloadUrl =
    app.downloadUrl && app.downloadUrl.startsWith('http')
      ? app.downloadUrl
      : app.githubRepo
      ? `https://github.com/${app.githubRepo}/releases/download/${latestTag}/${setupExeName}`
      : '';

  const openExternalUrl = (url: string) => {
    if (!url) return;
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.openExternal) {
      electronAPI.openExternal(url);
    } else {
      window.open(url, '_blank');
    }
  };

  const copyToClipboard = async (text: string, type: 'release' | 'asset' | 'tag') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'release') {
        setCopiedReleaseUrl(true);
        setTimeout(() => setCopiedReleaseUrl(false), 2000);
      } else if (type === 'tag') {
        setCopiedTagUrl(true);
        setTimeout(() => setCopiedTagUrl(false), 2000);
      } else {
        setCopiedAssetUrl(true);
        setTimeout(() => setCopiedAssetUrl(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveRename = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = renameInput.trim();
    if (!trimmed) return;
    setIsRenaming(true);
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.renameApp) {
        await electronAPI.renameApp({ appId: app.id, newName: trimmed });
      }
      setCurrentAppName(trimmed);
      app.name = trimmed;
      if (onRenameApp) {
        onRenameApp(app.id, trimmed);
      }
      setRenameModalOpen(false);
    } catch (err) {
      console.error('Failed to rename app:', err);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleSaveEdit = async (appId: string, updates: Partial<CatalogApp>) => {
    if (updates.name) {
      setCurrentAppName(updates.name);
      app.name = updates.name;
    }
    if (updates.category) app.category = updates.category;
    if (updates.description !== undefined) app.description = updates.description;
    if (updates.iconType) app.iconType = updates.iconType;
    if (updates.iconValue) app.iconValue = updates.iconValue;
    if (updates.shortName) app.shortName = updates.shortName;
    if (updates.gradient) app.gradient = updates.gradient;
    if (updates.textColor) app.textColor = updates.textColor;
    if (updates.glowColor) app.glowColor = updates.glowColor;
    (app as any).hasRealIcon = true;

    if (onEditApp) {
      await onEditApp(appId, updates);
    } else {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.updateApp) {
        await electronAPI.updateApp({ appId, ...updates });
      }
      if (updates.name && onRenameApp) {
        onRenameApp(appId, updates.name);
      }
    }
  };

  const handleConfirmDeleteApp = async () => {
    setIsDeleting(true);
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.deleteApp) {
        await electronAPI.deleteApp(app.id);
      }
      if (onDeleteApp) {
        onDeleteApp(app.id);
      }
      setDeleteModalOpen(false);
      onBack();
    } catch (err) {
      console.error('Failed to delete app:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const defaultReqs = app.systemRequirements || {
    os: 'Windows 10 / Windows 11 (64-bit)',
    ram: '8 GB RAM (16 GB Recommended)',
    gpu: 'DirectX 12 / Direct3D 11 GPU Accelerated',
    storage: `${app.size || '50 MB'} Available SSD Storage`,
  };

  const defaultNotes =
    app.changelog && app.changelog.length > 0
      ? app.changelog
      : [
          'Ultra low-latency global macro and hotkey triggers',
          'USB Stream Deck & hardware peripheral dynamic keymaps',
          'Automatic Anything Ecosystem background release updater',
          'Customizable startup loader and splash screen receiver',
          'Windows 11 Start Menu shortcut & NSIS packaging',
        ];

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24 animate-fadeIn">
      {/* Top Navigation & Breadcrumbs */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <GlassButton
            variant="glass"
            size="sm"
            icon={<ArrowLeft className="w-3.5 h-3.5" />}
            onClick={onBack}
          >
            Back to All Apps
          </GlassButton>

          <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-zinc-400">
            <span>Ecosystem</span>
            <span>/</span>
            <span>{app.category}</span>
            <span>/</span>
            <span className="text-zinc-900 dark:text-white font-semibold">{app.name}</span>
          </div>
        </div>

        {/* Quick Launch / Action Buttons */}
        <div className="flex items-center gap-2">
          {onCustomizeLoader && (
            <GlassButton
              variant="glass"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 text-cyan-500" />}
              onClick={() => onCustomizeLoader(app)}
            >
              Customize Loader
            </GlassButton>
          )}

          {(app.status === 'installed' || app.status === 'ready') && (
            <GlassButton
              variant="primary"
              size="sm"
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
              onClick={() => onLaunch(app)}
              className="font-bold"
            >
              Launch App
            </GlassButton>
          )}

          {app.status === 'update-available' && (
            <div className="flex items-center gap-2">
              <GlassButton
                variant="primary"
                size="sm"
                icon={<RefreshCw className="w-3.5 h-3.5" />}
                onClick={() => onUpdate(app)}
                className="font-bold"
              >
                Update Now
              </GlassButton>
              {app.installedPath && (
                <GlassButton
                  variant="glass"
                  size="sm"
                  icon={<Play className="w-3.5 h-3.5 fill-current" />}
                  onClick={() => onLaunch(app)}
                  className="font-bold"
                >
                  Launch App
                </GlassButton>
              )}
            </div>
          )}

          {app.status === 'not-installed' && (
            <div className="flex items-center gap-2">
              <GlassButton
                variant="accent"
                size="sm"
                icon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                onClick={() => setIsDemoModalOpen(true)}
                className="font-semibold border-cyan-500/40 text-cyan-300"
              >
                Try Free Demo
              </GlassButton>
              <GlassButton
                variant="primary"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={() => onInstall(app)}
                className="font-bold"
              >
                Download & Install
              </GlassButton>
            </div>
          )}

          {app.status === 'trial' && (
            <div className="flex items-center gap-2">
              <GlassButton
                variant="accent"
                size="sm"
                icon={<Play className="w-3.5 h-3.5 fill-current" />}
                onClick={() => setIsDemoModalOpen(true)}
                className="font-bold bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 border-emerald-500/40 text-emerald-300"
              >
                Open Demo ({app.trialInfo?.daysRemaining ?? 7}d Trial)
              </GlassButton>
              <GlassButton
                variant="primary"
                size="sm"
                icon={<Download className="w-3.5 h-3.5" />}
                onClick={() => onInstall(app)}
                className="font-bold"
              >
                Install Full Version
              </GlassButton>
            </div>
          )}

          {(app.status === 'installed' || app.status === 'ready' || app.status === 'update-available' || Boolean(app.installedPath)) && (
            <GlassButton
              variant="glass"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
              onClick={() => setUninstallModalOpen(true)}
              className="hover:bg-rose-500/10 hover:text-rose-600 text-rose-500 dark:text-rose-400 border-rose-500/30 font-medium"
            >
              Uninstall
            </GlassButton>
          )}
        </div>
      </div>

      {/* Main Hero Header Card */}
      <GlassCard
        variant="interactive"
        className="p-6 sm:p-8 border-zinc-200 dark:border-white/10 relative overflow-hidden"
      >
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ background: app.glowColor || 'rgba(56, 189, 248, 0.45)' }}
        />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            <div className="relative shrink-0 group/icon">
              <div className="p-1 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-lg relative overflow-hidden">
                <AppIconRenderer app={{ ...app, name: currentAppName }} size="lg" />
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover/icon:opacity-100 flex flex-col items-center justify-center text-white transition-all rounded-2xl backdrop-blur-xs cursor-pointer z-10"
                  title="Change / Edit App Icon"
                >
                  <Pencil className="w-4 h-4 text-cyan-400 mb-0.5" />
                  <span className="text-[9px] font-bold tracking-tight">Edit Icon</span>
                </button>
              </div>
              {!(app as any).hasRealIcon && !(app.id?.includes('tap-studio')) && !(app.name?.toLowerCase().includes('mediaflow')) && (
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="absolute -bottom-1.5 -right-1.5 bg-amber-500 hover:bg-amber-400 rounded-full p-1 shadow-md cursor-pointer transition-transform hover:scale-110 z-20"
                  title="No custom icon — Click to set app icon"
                >
                  <Pencil className="w-2.5 h-2.5 text-slate-950" />
                </button>
              )}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  {currentAppName}
                </h1>
                <button
                  type="button"
                  onClick={() => setEditModalOpen(true)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-cyan-500 hover:bg-cyan-500/10 transition-colors flex items-center gap-1"
                  title="Edit Application & Icon"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                {app.status === 'installed' && (
                  <GlassBadge variant="emerald" dot>
                    Installed & Ready
                  </GlassBadge>
                )}
                {app.status === 'trial' && (
                  <GlassBadge variant="emerald" dot className="bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
                    ⚡ {app.trialInfo?.daysRemaining ?? 7}d Free Trial Active
                  </GlassBadge>
                )}
                {app.status === 'update-available' && (
                  <GlassBadge variant="cyan" dot>
                    Update Available
                  </GlassBadge>
                )}
                {app.status === 'path-broken' && (
                  <GlassBadge variant="amber" dot>
                    Path Needs Repair
                  </GlassBadge>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-zinc-100 dark:bg-white/10 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 font-semibold">
                  {app.category}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                <span>Version {app.localVersion || app.version}</span>
                <span>•</span>
                <span>Package Size: {app.size || '42.8 MB'}</span>
                <span>•</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-semibold">
                  Architect: Burhanuddin Sounasath (8369811201)
                </span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <GlassButton
              variant="glass"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
              onClick={() => setIsDemoModalOpen(true)}
              className="text-cyan-400 border-cyan-500/30 hover:border-cyan-400 font-medium"
              title="Interactive Demo Simulator & Free Trial"
            >
              Try / Demo
            </GlassButton>

            <GlassButton
              variant="glass"
              size="sm"
              icon={<Wrench className="w-3.5 h-3.5 text-cyan-500" />}
              onClick={() => onFixPath(app)}
            >
              Locate Path
            </GlassButton>

            {(app.status === 'installed' || app.status === 'ready' || app.status === 'update-available' || Boolean(app.installedPath)) && (
              <GlassButton
                variant="glass"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                onClick={() => setUninstallModalOpen(true)}
                className="hover:bg-rose-500/10 hover:text-rose-600 text-rose-500 dark:text-rose-400 border-rose-500/30 font-medium"
              >
                Uninstall
              </GlassButton>
            )}

            <GlassButton
              variant="glass"
              size="sm"
              icon={<Trash2 className="w-3.5 h-3.5 text-rose-600" />}
              onClick={() => setDeleteModalOpen(true)}
              className="hover:bg-rose-600/15 text-rose-600 dark:text-rose-400 border-rose-500/30"
            >
              Delete App
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Navigation Tabs */}
      <div className="border-b border-zinc-200 dark:border-white/10 flex items-center gap-2">
        {[
          { id: 'overview', label: 'Overview & Installation Path' },
          { id: 'requirements', label: 'Hardware & System Specs' },
          { id: 'release-notes', label: 'Changelog & Updates' },
          { id: 'versions', label: 'Other Versions & Rollback' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`pb-3 px-4 text-xs font-medium border-b-2 transition-all ${
              activeTab === tab.id
                ? 'border-cyan-500 text-cyan-600 dark:text-cyan-400 font-bold'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview & Path */}
      {activeTab === 'overview' && (
        <div className="space-y-6">

          {/* ── No Icon Notice for Creator ────────────────────────────────────── */}
          {!(app as any).hasRealIcon && !(app.id?.includes('tap-studio')) && !(app.name?.toLowerCase().includes('mediaflow')) && (
            <div className="flex items-start gap-3 px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-600 dark:text-amber-400">
              <svg viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd"/>
              </svg>
              <div className="text-xs leading-relaxed">
                <p className="font-bold mb-0.5">No app icon found</p>
                <p className="opacity-80">
                  Anything couldn't extract an icon from the EXE or find a logo image in your release folder.
                  To show the real app icon, add a <code className="font-mono bg-amber-500/15 rounded px-1">logo.png</code> or <code className="font-mono bg-amber-500/15 rounded px-1">app-logo.png</code> (512×512 px recommended) inside{' '}
                  <code className="font-mono bg-amber-500/15 rounded px-1">releases/{app.id}/</code>, or set an icon directly using the button below.
                </p>
                <div className="mt-2.5">
                  <button
                    type="button"
                    onClick={() => setEditModalOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                    <span>Upload / Set App Icon Now</span>
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Creative Cloud Style Demo & 7-Day Free Trial Spotlight */}
          <GlassCard
            variant="interactive"
            className="p-6 border-cyan-500/30 bg-gradient-to-br from-cyan-500/10 via-emerald-500/5 to-transparent relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-cyan-500/20 text-cyan-400">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Experience {app.name} in Trial Sandbox / Interactive Demo
                  </h4>
                  <GlassBadge variant="cyan" size="sm" className="font-mono text-[10px]">
                    Adobe Creative Cloud Style
                  </GlassBadge>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                  Test-drive the full UI, real-time macro event engine, and child app loader handoff with zero commitment. Launch the interactive video & multi-camera timeline simulator or evaluate with a 7-day full license.
                </p>
                {app.status === 'trial' && (
                  <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    <span>Free Evaluation Mode: {app.trialInfo?.daysRemaining ?? 7} days remaining</span>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <GlassButton
                  variant="glass"
                  size="sm"
                  icon={<Play className="w-3.5 h-3.5 fill-current text-cyan-400" />}
                  onClick={() => setIsDemoModalOpen(true)}
                  className="font-semibold text-xs border-cyan-500/30 hover:border-cyan-400 text-cyan-300"
                >
                  Try Demo Simulator
                </GlassButton>
                {app.status !== 'trial' && app.status !== 'installed' && (
                  <GlassButton
                    variant="accent"
                    size="sm"
                    icon={<Sparkles className="w-3.5 h-3.5" />}
                    onClick={() => {
                      if (onStartTrial) onStartTrial(app);
                      setIsDemoModalOpen(true);
                    }}
                    className="font-bold text-xs"
                  >
                    Start 7-Day Free Trial
                  </GlassButton>
                )}
              </div>
            </div>
          </GlassCard>

          <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              About {app.name}
            </h3>
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
              {app.description ||
                'High-performance desktop companion for hardware macro automation, hotkey triggers, and system controls integrated natively into the Anything ecosystem.'}
            </p>
          </GlassCard>

          {/* GitHub Repository Releases Source (REPO RELEASE LINK) */}
          {(app.githubRepo || repoReleasesUrl) && (
            <GlassCard
              variant="interactive"
              className="p-6 border-cyan-500/25 bg-gradient-to-br from-cyan-500/10 via-sky-500/5 to-transparent space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-300 font-bold">
                        Repository Release Source (GitHub)
                      </span>
                      <GlassBadge variant="cyan" size="sm" className="font-mono text-[10px]">
                        Cloud Source (Not Computer)
                      </GlassBadge>
                    </div>
                    <p className="text-[11px] text-zinc-500 font-mono mt-0.5">
                      Child app binary packages are fetched directly from GitHub cloud releases
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <GlassButton
                    variant="glass"
                    size="sm"
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                    onClick={() => openExternalUrl(repoReleasesUrl)}
                    className="text-xs font-mono font-semibold"
                  >
                    Open Releases Page
                  </GlassButton>
                </div>
              </div>

              {/* Official Repository Releases Link Display */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                  Official GitHub Repository Releases Link:
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 rounded-xl bg-zinc-100 dark:bg-black/60 border border-cyan-500/30 font-mono text-xs text-cyan-700 dark:text-cyan-300 break-all select-all font-semibold flex items-center justify-between gap-2">
                    <span className="truncate">{repoReleasesUrl}</span>
                    <button
                      onClick={() => copyToClipboard(repoReleasesUrl, 'release')}
                      title="Copy Repository Release Link"
                      className="p-1 rounded-lg hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 transition-colors shrink-0"
                    >
                      {copiedReleaseUrl ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <GlassButton
                    variant="glass"
                    size="sm"
                    icon={<ExternalLink className="w-3 h-3" />}
                    onClick={() => openExternalUrl(repoReleasesUrl)}
                    className="font-mono text-xs shrink-0"
                  >
                    View All
                  </GlassButton>
                </div>
              </div>

              {/* Specific Release Tag Endpoint Link */}
              <div className="space-y-1.5">
                <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 font-semibold uppercase tracking-wider">
                  Release Tag Repository Endpoint ({latestTag}):
                </span>
                <div className="flex items-center gap-2">
                  <div className="flex-1 p-3 rounded-xl bg-zinc-100 dark:bg-black/60 border border-cyan-500/30 font-mono text-xs text-cyan-700 dark:text-cyan-300 break-all select-all font-semibold flex items-center justify-between gap-2">
                    <span className="truncate">{tagReleasesUrl || `${releasesTagBaseUrl}${latestTag}`}</span>
                    <button
                      onClick={() => copyToClipboard(tagReleasesUrl || `${releasesTagBaseUrl}${latestTag}`, 'tag')}
                      title="Copy Release Tag URL"
                      className="p-1 rounded-lg hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400 transition-colors shrink-0"
                    >
                      {copiedTagUrl ? (
                        <Check className="w-4 h-4 text-emerald-500" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  <GlassButton
                    variant="glass"
                    size="sm"
                    onClick={() => openExternalUrl(tagReleasesUrl || `${releasesTagBaseUrl}${latestTag}`)}
                    className="font-mono text-xs shrink-0 text-cyan-600 dark:text-cyan-400 font-bold"
                  >
                    Tag {latestTag}
                  </GlassButton>
                </div>
              </div>

              {/* Latest Setup Exe Release Asset */}
              <div className="p-3.5 rounded-xl bg-white/40 dark:bg-white/5 border border-zinc-200 dark:border-white/10 space-y-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                  <div className="flex items-center gap-2">
                    <Cloud className="w-3.5 h-3.5 text-cyan-500" />
                    <span className="font-mono font-bold text-zinc-800 dark:text-zinc-200">
                      Latest Release Setup Exe:
                    </span>
                    <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">
                      {setupExeName}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {setupDownloadUrl && (
                      <button
                        onClick={() => copyToClipboard(setupDownloadUrl, 'asset')}
                        className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
                      >
                        {copiedAssetUrl ? (
                          <>
                            <Check className="w-3 h-3 text-emerald-500" />
                            <span>URL Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copy Asset URL</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                </div>

                <p className="text-[11px] text-zinc-600 dark:text-zinc-300 leading-relaxed font-mono">
                  When you click <strong>Download & Install</strong> or <strong>Update</strong>, Anything takes this setup executable directly from GitHub Releases and runs it silently without showing setup dialogs. It does not take files from your computer.
                </p>
              </div>
            </GlassCard>
          )}

          {/* Executable Disk Location */}
          <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                  Application Executable (Installed Disk Location)
                </span>
              </div>
              <button
                onClick={() => onFixPath(app)}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-mono flex items-center gap-1 font-semibold"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Change / Locate Executable</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-white/10 font-mono text-xs text-cyan-700 dark:text-cyan-300 break-all select-all font-semibold">
              {resolvedExePath ||
                (app.installedPath && !app.installedPath.toLowerCase().includes('setup')
                  ? app.installedPath
                  : `Status: Not installed locally • Click "Download & Install" above to fetch latest setup from GitHub`)}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-zinc-500 font-mono">
              <span>
                Target Program Binary: <strong>{app.executableName || `${app.name}.exe`}</strong>
              </span>
              <span className="text-cyan-600 dark:text-cyan-400">
                {resolvedExePath || (app.installedPath && !app.installedPath.toLowerCase().includes('setup'))
                  ? '✓ Verified native installed executable'
                  : 'Installer is downloaded from GitHub and executed silently'}
              </span>
            </div>
          </GlassCard>

          {/* Path Broken Warning */}
          {app.status === 'path-broken' && (
            <div className="p-4 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 text-xs text-amber-800 dark:text-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
                <span>Executable file is missing or was relocated. Click "Locate File" to reconnect the launch path.</span>
              </div>
              <GlassButton
                variant="glass"
                size="sm"
                onClick={() => onFixPath(app)}
                icon={<Wrench className="w-3.5 h-3.5 text-amber-500" />}
              >
                Locate File
              </GlassButton>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Hardware Specs (Clean High-Contrast Cards) */}
      {activeTab === 'requirements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassCard variant="interactive" className="p-5 border-zinc-200 dark:border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Monitor className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block font-bold">
              Operating System
            </span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              {defaultReqs.os}
            </h4>
            <p className="text-xs text-zinc-500">Native 64-bit architecture with DirectX 12 hardware acceleration.</p>
          </GlassCard>

          <GlassCard variant="interactive" className="p-5 border-zinc-200 dark:border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400">
              <Cpu className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block font-bold">
              Processor & Memory
            </span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              {defaultReqs.ram}
            </h4>
            <p className="text-xs text-zinc-500">Multi-core processor recommended for low-latency macro dispatching.</p>
          </GlassCard>

          <GlassCard variant="interactive" className="p-5 border-zinc-200 dark:border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block font-bold">
              Graphics Acceleration
            </span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              {defaultReqs.gpu}
            </h4>
            <p className="text-xs text-zinc-500">Hardware rasterization for fluid UI animations and transparent overlays.</p>
          </GlassCard>

          <GlassCard variant="interactive" className="p-5 border-zinc-200 dark:border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block font-bold">
              Storage & Hardware IO
            </span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              {defaultReqs.storage}
            </h4>
            <p className="text-xs text-zinc-500">High-speed NVMe/SSD space with USB HID & Stream Deck device support.</p>
          </GlassCard>
        </div>
      )}

      {/* Tab 3: Changelog (High-Contrast Bullets) */}
      {activeTab === 'release-notes' && (
        <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Release Notes · Version {app.version}
              </h3>
              <p className="text-xs text-zinc-500 font-mono mt-0.5">
                Official release verified by Burhanuddin Sounasath (8369811201)
              </p>
            </div>
            <GlassBadge variant="cyan" dot>
              Current Build
            </GlassBadge>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              Included Enhancements & Fixes
            </h4>
            <ul className="space-y-2.5">
              {defaultNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-200 font-medium">
                  <span className="w-2 h-2 rounded-full bg-cyan-500 shrink-0 mt-1 shadow-xs" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      )}

      {/* Tab 4: Other Versions & Rollback */}
      {activeTab === 'versions' && (
        <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10">
          <VersionHistoryTab
            app={app}
            onRollback={async (targetApp, release) => {
              if (onRollback) {
                onRollback(targetApp, release);
              } else {
                onUpdate(targetApp);
              }
            }}
            onVersionDeleted={(ver) => {
              if (onVersionDeleted) {
                onVersionDeleted(app.id, ver);
              }
            }}
          />
        </GlassCard>
      )}
      {/* Rename Application Modal */}
      {renameModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-cyan-600 dark:text-cyan-400">
              <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <Pencil className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Rename Application</h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Updates the display name in Anything and app.json</p>
              </div>
            </div>

            <form onSubmit={handleSaveRename} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                  Application Title
                </label>
                <input
                  type="text"
                  required
                  value={renameInput}
                  onChange={(e) => setRenameInput(e.target.value)}
                  placeholder="App Name"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRenameModalOpen(false)}
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <GlassButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={isRenaming}
                  icon={<Check className="w-3.5 h-3.5" />}
                >
                  {isRenaming ? 'Saving...' : 'Save Name'}
                </GlassButton>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Application Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Delete {currentAppName}?</h4>
                <p className="text-xs text-zinc-400">Permanently removes all release executables and files from Anything.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/60 font-mono">
              App ID: <span className="text-white font-bold">{app.id}</span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteApp}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                {isDeleting ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isDeleting ? 'Deleting...' : 'Delete Completely'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Uninstall Application Modal */}
      {uninstallModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-zinc-900 border border-zinc-700 shadow-2xl text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Uninstall {currentAppName}?</h4>
                <p className="text-xs text-zinc-400">Removes the installed app from your PC. You can reinstall it anytime from Anything.</p>
              </div>
            </div>

            <p className="text-xs text-zinc-300 bg-zinc-800/60 p-3 rounded-xl border border-zinc-700/60 font-mono">
              Status: <span className="text-white font-bold">{app.status}</span> • Version: <span className="text-white font-bold">{app.localVersion || app.version}</span>
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUninstallModalOpen(false)}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isUninstalling}
                onClick={async () => {
                  setIsUninstalling(true);
                  try {
                    await onUninstall(app.id);
                    app.status = 'not-installed';
                    app.installedPath = undefined;
                    app.localVersion = undefined;
                  } catch (err) {
                    console.error('Uninstall failed:', err);
                  } finally {
                    setIsUninstalling(false);
                    setUninstallModalOpen(false);
                  }
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5"
              >
                {isUninstalling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isUninstalling ? 'Uninstalling...' : 'Yes, Uninstall'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Application & Icon Modal */}
      <EditAppModal
        app={app}
        isOpen={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        onSave={handleSaveEdit}
      />

      {/* Interactive Demo Simulator & 7-Day Trial Modal */}
      <AppDemoModal
        app={app}
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onInstall={(appToInstall) => {
          onInstall(appToInstall);
          setIsDemoModalOpen(false);
        }}
        onStartTrial={(appToTrial) => {
          if (onStartTrial) onStartTrial(appToTrial);
          setIsDemoModalOpen(false);
        }}
      />
    </div>
  );
};
