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
} from 'lucide-react';
import type { CatalogApp } from '../../types/app.types';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { AppIconRenderer } from './components/CrazyAppStudio/AppIconRenderer';
import { VersionHistoryTab } from './components/AppDetailModal/VersionHistoryTab';
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
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'requirements' | 'release-notes' | 'versions'>('overview');
  const { theme } = useTheme();
  const isLight = theme === 'light';

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

          {app.status === 'installed' && (
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
            <GlassButton
              variant="primary"
              size="sm"
              icon={<RefreshCw className="w-3.5 h-3.5" />}
              onClick={() => onUpdate(app)}
              className="font-bold"
            >
              Update Now
            </GlassButton>
          )}

          {app.status === 'not-installed' && (
            <GlassButton
              variant="primary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => onInstall(app)}
              className="font-bold"
            >
              Download & Install
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
            <div className="shrink-0 p-1 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl shadow-lg">
              <AppIconRenderer app={app} size="lg" />
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  {app.name}
                </h1>
                {app.status === 'installed' && (
                  <GlassBadge variant="emerald" dot>
                    Installed & Ready
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
              icon={<Wrench className="w-3.5 h-3.5 text-cyan-500" />}
              onClick={() => onFixPath(app)}
            >
              Locate Path
            </GlassButton>

            {app.status === 'installed' && (
              <GlassButton
                variant="glass"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5 text-rose-500" />}
                onClick={() => onUninstall(app.id)}
                className="hover:bg-rose-500/10 hover:text-rose-600"
              >
                Uninstall
              </GlassButton>
            )}
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
          <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              About {app.name}
            </h3>
            <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 font-medium">
              {app.description ||
                'High-performance desktop companion for hardware macro automation, hotkey triggers, and system controls integrated natively into the Anything ecosystem.'}
            </p>
          </GlassCard>

          {/* Executable Path Info */}
          <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
                Executable Disk Location
              </span>
              <button
                onClick={() => onFixPath(app)}
                className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline font-mono flex items-center gap-1 font-semibold"
              >
                <Wrench className="w-3.5 h-3.5" />
                <span>Change / Locate Executable</span>
              </button>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-black/50 border border-zinc-200 dark:border-white/10 font-mono text-xs text-cyan-700 dark:text-cyan-300 break-all select-all font-semibold">
              {app.installedPath ||
                `Will install to: %LOCALAPPDATA%\\Anything\\installed-apps\\${app.id}\\${app.executableName}`}
            </div>
            <p className="text-[11px] text-zinc-500 font-mono">
              Executable is managed under Anything's isolated apps sandbox. Click "Change / Locate" to link an external build.
            </p>
          </GlassCard>

          {/* GitHub Auto-Updater Sync */}
          {app.githubRepo && (
            <GlassCard
              variant="interactive"
              className="p-6 border-cyan-500/20 bg-gradient-to-r from-cyan-500/5 via-sky-500/5 to-transparent space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span className="text-xs font-mono uppercase tracking-wider text-cyan-700 dark:text-cyan-300 font-bold">
                    GitHub Cloud Releases Sync
                  </span>
                </div>
                <a
                  href={`https://github.com/${app.githubRepo}`}
                  target="_blank"
                  rel="noreferrer"
                  onClick={(e) => {
                    e.preventDefault();
                    const electronAPI = (window as any).electronAPI;
                    if (electronAPI?.openExternal) {
                      electronAPI.openExternal(`https://github.com/${app.githubRepo}`);
                    } else {
                      window.open(`https://github.com/${app.githubRepo}`, '_blank');
                    }
                  }}
                  className="text-xs text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 font-mono font-semibold"
                >
                  <span>{app.githubRepo}</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed font-medium">
                This child application continuously tracks official GitHub releases published to{' '}
                <strong className="text-zinc-900 dark:text-white font-mono">{app.githubRepo}</strong>. When a new executable is released, Anything automatically alerts you with animated release notes.
              </p>
            </GlassCard>
          )}

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
          />
        </GlassCard>
      )}
    </div>
  );
};
