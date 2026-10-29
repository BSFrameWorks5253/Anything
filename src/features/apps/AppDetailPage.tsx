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
  Check,
  Copy,
  Cloud,
  FolderOpen,
  ShieldCheck,
} from 'lucide-react';
import type { CatalogApp } from '../../types/app.types';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { AppIconRenderer } from './components/CrazyAppStudio/AppIconRenderer';
import { VersionHistoryTab } from './components/AppDetailModal/VersionHistoryTab';
import { AppDemoModal } from './components/AppDemoModal';
import { OneTapAutoConverterSection } from '../settings/components/OneTapAutoConverterSection';

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

function cleanDescription(desc?: string): string {
  if (!desc) return '';
  return desc
    .replace(/^#+\s*[^\n]*\n+/g, '')
    .replace(/^#+\s+/g, '')
    .replace(/^[🚀⚡✨🛠️📦]\s*[^\n]*\n+/gu, '')
    .trim();
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
  onEditApp,
  onVersionDeleted,
  onStartTrial,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'release-notes' | 'versions'>('overview');
  const [uninstallModalOpen, setUninstallModalOpen] = useState(false);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const [isUninstalling, setIsUninstalling] = useState(false);
  const [copiedReleaseUrl, setCopiedReleaseUrl] = useState(false);
  const [copiedAssetUrl, setCopiedAssetUrl] = useState(false);
  const [resolvedExePath, setResolvedExePath] = useState<string | undefined>(
    app.installedPath && !app.installedPath.toLowerCase().includes('setup') ? app.installedPath : undefined
  );
  const [isCheckingUpdate, setIsCheckingUpdate] = useState(false);
  const [updateFeedback, setUpdateFeedback] = useState<string | null>(null);

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
    app.releasesUrl ||
    (app.githubRepo ? `https://github.com/${app.githubRepo}/releases` : 'https://github.com/BSFrameWorks5253/TapDesk/releases');
  const latestTag = `v${app.version || '1.2.0'}`;
  const setupExeName =
    app.setupExecutableName ||
    (app.packageFileName?.toLowerCase().includes('setup')
      ? app.packageFileName
      : `${(app?.name || app?.id || 'App').replace(/\s+/g, '')}_${app?.version || '1.0.0'}_Setup.exe`);
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

  const copyToClipboard = async (text: string, type: 'release' | 'asset') => {
    try {
      await navigator.clipboard.writeText(text);
      if (type === 'release') {
        setCopiedReleaseUrl(true);
        setTimeout(() => setCopiedReleaseUrl(false), 2000);
      } else {
        setCopiedAssetUrl(true);
        setTimeout(() => setCopiedAssetUrl(false), 2000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCheckUpdate = async () => {
    let repo = app.githubRepo;
    if (!repo) {
      const lower = `${app.id || ''} ${app.name || ''}`.toLowerCase();
      if (lower.includes('mediaflow')) {
        repo = 'BSFrameWorks5253/MediaFlow-Studio';
      } else if (lower.includes('one-tap') || lower.includes('onetap')) {
        repo = 'BSFrameWorks5253/onetap-workstation';
      } else if (lower.includes('docuflow')) {
        repo = 'BSFrameworks5253/DocuFlow-';
      } else if (lower.includes('data-manage') || lower.includes('data manage') || lower.includes('ain53')) {
        repo = 'BSFrameWorks5253/AIN53';
      } else if (lower.includes('copier')) {
        repo = 'BSFrameWorks5253/Anything';
      } else if (lower.includes('pulse') || lower.includes('wave')) {
        repo = 'BSFrameWorks5253/Plusewave';
      } else if (lower.includes('anything')) {
        repo = 'BSFrameWorks5253/Anything';
      }
    }
    if (!repo) return;
    setIsCheckingUpdate(true);
    setUpdateFeedback(null);
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.checkGitHubRelease) {
        const res = await electronAPI.checkGitHubRelease(repo, app.localVersion || app.version, app.id);
        if (res.success && res.hasUpdate && res.asset) {
          app.status = 'update-available';
          app.version = res.remoteVersion || app.version;
          app.latestRelease = {
            tag: res.remoteVersion || res.rawTag,
            name: res.releaseName,
            body: res.releaseNotes,
            assetUrl: res.asset.downloadUrl,
            assetName: res.asset.name,
            sizeFormatted: res.asset.sizeFormatted,
            publishedAt: res.publishedAt,
          };
          if (onEditApp) {
            await onEditApp(app.id, {
              status: 'update-available',
              version: app.version,
              latestRelease: app.latestRelease,
            });
          }
          setUpdateFeedback(`⚡ Version ${res.remoteVersion} is available! Click "Update Now" to install.`);
        } else if (res.success) {
          if (!res.hasUpdate && app.status === 'update-available') {
            app.status = 'installed';
            if (onEditApp) {
              await onEditApp(app.id, { status: 'installed' });
            }
          }
          setUpdateFeedback(`✓ ${app.name} is up to date (v${app.localVersion || app.version}).`);
        } else {
          setUpdateFeedback(res.error || 'Failed to check GitHub releases.');
        }
      }
    } catch (e: any) {
      setUpdateFeedback(e.message || 'Error checking releases.');
    } finally {
      setIsCheckingUpdate(false);
      setTimeout(() => setUpdateFeedback(null), 8000);
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
          'Optimized real-time engine with ultra low-latency background processing',
          'Seamless integration with Anything master hub and quick launchers',
          'Full native 64-bit Windows compatibility with dark mode support',
          'Clean silent package installation and atomic update verification',
        ];

  const isInstalled =
    app.status === 'installed' ||
    app.status === 'ready' ||
    Boolean(resolvedExePath) ||
    (Boolean(app.installedPath) && !app.installedPath?.toLowerCase().includes('setup'));

  const cleanedDescription = cleanDescription(app.description);

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
            All Applications
          </GlassButton>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <span>Creative Cloud</span>
            <span>/</span>
            <span>{app.category || 'Desktop'}</span>
            <span>/</span>
            <span className="text-zinc-900 dark:text-white font-bold">{app.name}</span>
          </div>
        </div>

        {/* Header Action Shortcuts */}
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

          {isInstalled && (
            <GlassButton
              variant="primary"
              size="sm"
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
              onClick={() => onLaunch(app)}
              className="font-bold shadow-md shadow-blue-500/20"
            >
              Launch App
            </GlassButton>
          )}

          {!isInstalled && app.status !== 'update-available' && (
            <GlassButton
              variant="primary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => onInstall(app)}
              className="font-bold shadow-md shadow-blue-500/20"
            >
              Download & Install
            </GlassButton>
          )}
        </div>
      </div>

      {/* Main Hero Header Card */}
      <GlassCard
        variant="static"
        className="p-6 sm:p-8 border-zinc-200/80 dark:border-white/10 relative overflow-hidden bg-white/70 dark:bg-zinc-900/70 backdrop-blur-xl shadow-xl rounded-2xl"
      >
        <div
          className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-25"
          style={{ background: app.glowColor || 'rgba(56, 189, 248, 0.35)' }}
        />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          {/* App Emblem & Title Details */}
          <div className="flex items-start sm:items-center gap-5 flex-1 min-w-0">
            <div className="relative shrink-0">
              <div className="p-2 rounded-2xl border border-zinc-200/80 dark:border-white/15 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl shadow-lg ring-1 ring-black/5">
                <AppIconRenderer app={app} size="xl" />
              </div>
            </div>

            <div className="min-w-0 flex-1 space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight truncate">
                  {app.name}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700/60">
                  {app.category || 'Desktop Application'}
                </span>
                {isInstalled ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Installed
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/15 text-blue-600 dark:text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                    <ShieldCheck className="w-3 h-3" />
                    Ready to Install
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                <span>Version {app.localVersion || app.version || '1.0.0'}</span>
                <span>•</span>
                <span>{(app as any).packageSize || app.size || '122.8 MB'}</span>
                <span>•</span>
                <span className="text-zinc-400 dark:text-zinc-500">Official Creative Cloud Ecosystem Build</span>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto shrink-0">
            {isInstalled ? (
              <>
                <GlassButton
                  variant="primary"
                  size="md"
                  icon={<Play className="w-4 h-4 fill-current" />}
                  onClick={() => onLaunch(app)}
                  className="font-bold px-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                >
                  Launch App
                </GlassButton>

                {app.status === 'update-available' && (
                  <GlassButton
                    variant="accent"
                    size="md"
                    icon={<Download className="w-4 h-4" />}
                    onClick={() => onUpdate(app)}
                    className="font-bold text-emerald-300 border-emerald-500/40"
                  >
                    Update Now
                  </GlassButton>
                )}

                <GlassButton
                  variant="glass"
                  size="md"
                  icon={<FolderOpen className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />}
                  onClick={() => onFixPath(app)}
                  title="Locate or change executable path"
                >
                  Locate Path
                </GlassButton>

                <GlassButton
                  variant="glass"
                  size="md"
                  icon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                  onClick={() => setIsDemoModalOpen(true)}
                  title="Interactive Demo Simulator"
                >
                  Try Demo
                </GlassButton>

                <GlassButton
                  variant="glass"
                  size="md"
                  icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                  onClick={() => setUninstallModalOpen(true)}
                  className="hover:bg-rose-500/10 hover:text-rose-600 text-rose-500 dark:text-rose-400 border-rose-500/30"
                  title="Uninstall App"
                >
                  Uninstall
                </GlassButton>
              </>
            ) : (
              <>
                <GlassButton
                  variant="primary"
                  size="md"
                  icon={<Download className="w-4 h-4" />}
                  onClick={() => onInstall(app)}
                  className="font-bold px-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25"
                >
                  Download & Install
                </GlassButton>

                <GlassButton
                  variant="glass"
                  size="md"
                  icon={<Sparkles className="w-3.5 h-3.5 text-cyan-400" />}
                  onClick={() => setIsDemoModalOpen(true)}
                  className="text-cyan-600 dark:text-cyan-300 font-semibold border-cyan-500/30"
                >
                  Try Free Demo
                </GlassButton>

                <GlassButton
                  variant="glass"
                  size="md"
                  icon={<FolderOpen className="w-3.5 h-3.5" />}
                  onClick={() => onFixPath(app)}
                  title="Link already installed local file"
                >
                  Locate Local Path
                </GlassButton>
              </>
            )}

            {app.githubRepo && (
              <GlassButton
                variant="glass"
                size="md"
                icon={<RefreshCw className={`w-3.5 h-3.5 text-cyan-500 ${isCheckingUpdate ? 'animate-spin' : ''}`} />}
                onClick={handleCheckUpdate}
                disabled={isCheckingUpdate}
                title="Check for updates on GitHub"
              >
                {isCheckingUpdate ? 'Checking...' : 'Check GitHub'}
              </GlassButton>
            )}
          </div>
        </div>

        {updateFeedback && (
          <div className="mt-4 p-3.5 rounded-xl bg-blue-500/10 border border-blue-500/30 text-blue-800 dark:text-blue-300 text-xs flex items-center justify-between z-10 relative">
            <span className="flex items-center gap-2 font-medium">
              <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0" />
              <span>{updateFeedback}</span>
            </span>
            {app.status === 'update-available' && (
              <GlassButton
                variant="primary"
                size="sm"
                icon={<Download className="w-3 h-3" />}
                onClick={() => onUpdate(app)}
                className="text-xs ml-3 shrink-0"
              >
                Update Now
              </GlassButton>
            )}
          </div>
        )}
      </GlassCard>

      {/* Navigation Tabs */}
      <div className="border-b border-zinc-200 dark:border-white/10 flex items-center gap-2">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'requirements', label: 'System Requirements' },
          { id: 'release-notes', label: 'Release Notes' },
          { id: 'versions', label: 'Version History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`pb-3 px-4 text-xs font-semibold border-b-2 transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-bold'
                : 'border-transparent text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* One Tap Auto-Converter Daemon section when viewing One Tap app */}
          {(app.id === 'one-tap' || app.id === 'onetap' || app.id?.includes('tap') || app.name?.toLowerCase().includes('one tap')) && (
            <div className="mb-2">
              <OneTapAutoConverterSection />
            </div>
          )}

          {/* About App Card */}
          <GlassCard variant="interactive" className="p-6 border-zinc-200/80 dark:border-white/10 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
              About {app.name}
            </h3>
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
              {cleanedDescription ||
                'High-performance desktop companion for hardware macro automation, hotkey triggers, and system controls integrated natively into the Anything ecosystem.'}
            </p>

            {app.releaseInfo?.newFeatures && app.releaseInfo.newFeatures.length > 0 && (
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block mb-2 font-semibold">
                  Key Capabilities
                </span>
                <div className="flex flex-wrap gap-2">
                  {app.releaseInfo.newFeatures.slice(0, 4).map((f, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1.5 rounded-lg text-xs bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/60 font-medium max-w-md truncate"
                      title={f}
                    >
                      {f.replace(/^[^:]+:\s*/, '')}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </GlassCard>

          {/* Interactive Demo Sandbox Card */}
          <GlassCard
            variant="interactive"
            className="p-6 border-blue-500/20 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-transparent relative overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="p-1 rounded-lg bg-blue-500/10 text-blue-500">
                    <Sparkles className="w-4 h-4" />
                  </span>
                  <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Interactive Trial Sandbox
                  </h4>
                </div>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-xl leading-relaxed">
                  Test-drive the full UI, real-time macro event engine, and child app loader handoff with zero commitment. Launch the interactive video & multi-camera timeline simulator directly.
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <GlassButton
                  variant="glass"
                  size="sm"
                  icon={<Play className="w-3.5 h-3.5 fill-current text-blue-500" />}
                  onClick={() => setIsDemoModalOpen(true)}
                  className="font-semibold text-xs border-blue-500/30 hover:border-blue-400 text-blue-600 dark:text-blue-300"
                >
                  Launch Demo ↗
                </GlassButton>
              </div>
            </div>
          </GlassCard>

          {/* Verified Cloud Release Distribution Card */}
          {(app.githubRepo || repoReleasesUrl) && (
            <GlassCard
              variant="interactive"
              className="p-6 border-zinc-200/80 dark:border-white/10 space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-800 dark:text-zinc-200 font-bold">
                      Verified Distribution Source
                    </h4>
                    <p className="text-[11px] text-zinc-500 font-medium">
                      Packages are verified and streamed directly from GitHub Cloud Releases
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <GlassButton
                    variant="glass"
                    size="sm"
                    icon={<ExternalLink className="w-3.5 h-3.5" />}
                    onClick={() => openExternalUrl(repoReleasesUrl)}
                    className="text-xs font-semibold"
                  >
                    View on GitHub ↗
                  </GlassButton>
                </div>
              </div>

              {/* Release Metadata Strip */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">Repository</span>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{app.githubRepo || 'BSFrameworks5253'}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">Release Tag</span>
                  <p className="font-semibold text-blue-600 dark:text-blue-400 truncate">{latestTag}</p>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/5 space-y-1">
                  <span className="text-[10px] font-mono uppercase text-zinc-400 font-semibold">Setup Package</span>
                  <p className="font-semibold text-zinc-800 dark:text-zinc-200 truncate">{setupExeName}</p>
                </div>
              </div>

              {setupDownloadUrl && (
                <div className="flex items-center justify-between pt-1">
                  <span className="text-xs text-zinc-500 font-medium flex items-center gap-1.5">
                    <Cloud className="w-3.5 h-3.5 text-blue-500" />
                    <span>Installer executes silently without manual configuration dialogs</span>
                  </span>
                  <button
                    onClick={() => copyToClipboard(setupDownloadUrl, 'asset')}
                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {copiedAssetUrl ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>Link Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Download Link</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </GlassCard>
          )}

          {/* Executable Disk Location */}
          <GlassCard variant="interactive" className="p-6 border-zinc-200/80 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <HardDrive className="w-4 h-4 text-zinc-500 dark:text-zinc-400" />
                <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
                  Local Installation Status
                </span>
              </div>
              <button
                onClick={() => onFixPath(app)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 font-semibold cursor-pointer"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Locate Executable</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10 font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all select-all font-medium">
              {resolvedExePath ||
                (app.installedPath && !app.installedPath.toLowerCase().includes('setup')
                  ? app.installedPath
                  : `Not currently installed • Click "Download & Install" above to stream from GitHub Releases`)}
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-zinc-500">
              <span>
                Binary Name: <strong className="text-zinc-700 dark:text-zinc-300">{app.executableName || `${app.name}.exe`}</strong>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                {resolvedExePath || (app.installedPath && !app.installedPath.toLowerCase().includes('setup'))
                  ? '✓ Verified native installed executable'
                  : 'Automated 1-click silent installation available'}
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

      {/* Tab 2: Hardware Specs */}
      {activeTab === 'requirements' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <GlassCard variant="interactive" className="p-5 border-zinc-200/80 dark:border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
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

          <GlassCard variant="interactive" className="p-5 border-zinc-200/80 dark:border-white/10 space-y-2">
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

          <GlassCard variant="interactive" className="p-5 border-zinc-200/80 dark:border-white/10 space-y-2">
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

          <GlassCard variant="interactive" className="p-5 border-zinc-200/80 dark:border-white/10 space-y-2">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <HardDrive className="w-4 h-4" />
            </div>
            <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-wider block font-bold">
              Storage & Hardware IO
            </span>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              {defaultReqs.storage}
            </h4>
            <p className="text-xs text-zinc-500">High-speed NVMe/SSD space with USB HID & peripheral device support.</p>
          </GlassCard>
        </div>
      )}

      {/* Tab 3: Changelog */}
      {activeTab === 'release-notes' && (
        <GlassCard variant="interactive" className="p-6 border-zinc-200/80 dark:border-white/10 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                Release Notes · Version {app.version || '1.0.0'}
              </h3>
              <p className="text-xs text-zinc-500 font-medium mt-0.5">
                Official verified build package
              </p>
            </div>
            <GlassBadge variant="cyan" dot>
              Current Release
            </GlassBadge>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              Included Enhancements & Fixes
            </h4>
            <ul className="space-y-2.5">
              {defaultNotes.map((note, idx) => (
                <li key={idx} className="flex items-start gap-3 text-xs leading-relaxed text-zinc-700 dark:text-zinc-200 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                  <span>{note}</span>
                </li>
              ))}
            </ul>
          </div>
        </GlassCard>
      )}

      {/* Tab 4: Other Versions & Rollback */}
      {activeTab === 'versions' && (
        <GlassCard variant="interactive" className="p-6 border-zinc-200/80 dark:border-white/10">
          <VersionHistoryTab
            app={app}
            onRollback={async (targetApp: CatalogApp, release: any) => {
              if (onRollback) {
                onRollback(targetApp, release);
              } else {
                onUpdate(targetApp);
              }
            }}
            onVersionDeleted={(ver: string) => {
              if (onVersionDeleted) {
                onVersionDeleted(app.id, ver);
              }
            }}
          />
        </GlassCard>
      )}

      {/* Uninstall Application Modal */}
      {uninstallModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md p-4">
          <div className="w-full max-w-sm p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-2xl text-left space-y-4 animate-in zoom-in-95">
            <div className="flex items-center gap-3 text-rose-500">
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white">Uninstall {app.name}?</h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">Removes the installed application from your PC. You can reinstall it anytime from Anything.</p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setUninstallModalOpen(false)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-semibold text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
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
                    setResolvedExePath(undefined);
                  } catch (err) {
                    console.error('Uninstall failed:', err);
                  } finally {
                    setIsUninstalling(false);
                    setUninstallModalOpen(false);
                  }
                }}
                className="px-4 py-1.5 rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-500 text-white shadow-lg shadow-rose-600/30 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                {isUninstalling ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                <span>{isUninstalling ? 'Uninstalling...' : 'Yes, Uninstall'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Demo Simulator Modal */}
      <AppDemoModal
        app={app}
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
        onInstall={(appToInstall: CatalogApp) => {
          onInstall(appToInstall);
          setIsDemoModalOpen(false);
        }}
        onStartTrial={(appToTrial: CatalogApp) => {
          if (onStartTrial) onStartTrial(appToTrial);
          setIsDemoModalOpen(false);
        }}
      />
    </div>
  );
};
