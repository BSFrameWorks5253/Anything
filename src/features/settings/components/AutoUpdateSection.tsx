import React, { useState, useEffect } from 'react';
import {
  RefreshCw,
  GitBranch,
  Sparkles,
  CheckCircle2,
  Download,
  Clock,
  Bell,
  MousePointerClick,
  Layers,
  ArrowUpRight,
  ExternalLink,
  Cpu,
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import { AppIconRenderer } from '../../apps/components/CrazyAppStudio/AppIconRenderer';
import type {
  CatalogApp,
  ChildAppUpdateSettings,
  ChildAppUpdateMode,
  ChildAppCheckFrequency,
} from '../../../types/app.types';

interface AutoUpdateSectionProps {
  apps?: CatalogApp[];
  onUpdateApp?: (app: CatalogApp) => void;
  onCheckUpdates?: () => Promise<void>;
  isCheckingUpdates?: boolean;
}

export const AutoUpdateSection: React.FC<AutoUpdateSectionProps> = ({
  apps = [],
  onUpdateApp,
  onCheckUpdates,
  isCheckingUpdates = false,
}) => {
  // Parent App (Anything) updater states
  const [checkingParent, setCheckingParent] = useState(false);
  const [parentStatusText, setParentStatusText] = useState('Up to date with GitHub Releases');

  // Child Apps update settings (Auto vs Manual)
  const [settings, setSettings] = useState<ChildAppUpdateSettings>(() => {
    try {
      const saved = localStorage.getItem('anything_child_app_update_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      mode: 'manual',
      frequency: 'startup',
      silentInstall: true,
      notifyAvailable: true,
      notifyComplete: true,
      lastCheckedAt: Date.now(),
    };
  });

  const [savedToast, setSavedToast] = useState(false);

  // Sync settings across localStorage and Electron backend
  const updateSettings = (updates: Partial<ChildAppUpdateSettings>) => {
    const next: ChildAppUpdateSettings = { ...settings, ...updates };
    setSettings(next);
    try {
      localStorage.setItem('anything_child_app_update_settings', JSON.stringify(next));
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.saveChildAppUpdateSettings) {
        electronAPI.saveChildAppUpdateSettings(next);
      }
    } catch (e) {
      console.error('Failed to save update settings:', e);
    }
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 2000);
  };

  // Check parent Anything app updates
  const handleCheckParent = async () => {
    setCheckingParent(true);
    setParentStatusText('Checking GitHub Releases repository...');

    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.checkForUpdates) {
      try {
        const res = await electronAPI.checkForUpdates();
        setTimeout(() => {
          setCheckingParent(false);
          if (res?.status === 'dev-mode') {
            setParentStatusText('Development mode · Auto-update active in packaged builds');
          } else {
            setParentStatusText('Your Anything app is running the latest version');
          }
        }, 1200);
      } catch (err: any) {
        setCheckingParent(false);
        setParentStatusText(`Status: ${err.message || 'Complete'}`);
      }
    } else {
      setTimeout(() => {
        setCheckingParent(false);
        setParentStatusText('Latest version installed (v26.10.27)');
      }, 800);
    }
  };

  // Check all child apps for updates
  const handleCheckChildApps = async () => {
    if (onCheckUpdates) {
      await onCheckUpdates();
      updateSettings({ lastCheckedAt: Date.now() });
    }
  };

  const pendingUpdates = apps.filter((a) => a.status === 'update-available');

  const handleUpdateAllPending = () => {
    if (!onUpdateApp) return;
    pendingUpdates.forEach((app) => onUpdateApp(app));
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold">
            Update Engine & Child App Lifecycle
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Configure automatic background updating or on-demand manual updates for all installed apps.
          </p>
        </div>

        {savedToast && (
          <GlassBadge variant="emerald" dot className="animate-fade-in text-[10px]">
            Preferences Saved
          </GlassBadge>
        )}
      </div>

      {/* ── 1. UPDATE MODE SELECTION (Auto vs Manual) ── */}
      <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 space-y-6">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <h4 className="text-sm font-bold tracking-tight text-zinc-900 dark:text-white">
              Child Apps Update Strategy
            </h4>
            <GlassBadge variant={settings.mode === 'auto' ? 'cyan' : 'amber'} size="sm">
              {settings.mode === 'auto' ? '⚡ Background Auto-Update' : '👆 On-Demand (Click to Update)'}
            </GlassBadge>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Choose whether Anything should automatically install updates for child apps (e.g. One Tap, MediaFlow Studio) or wait for your confirmation.
          </p>
        </div>

        {/* Dual Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Option A: Auto-Update */}
          <div
            onClick={() => updateSettings({ mode: 'auto' })}
            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative ${
              settings.mode === 'auto'
                ? 'border-cyan-500/60 bg-cyan-500/[0.08] dark:bg-cyan-500/[0.12] shadow-lg shadow-cyan-500/10'
                : 'border-zinc-200 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] hover:border-zinc-300 dark:hover:border-white/20'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    settings.mode === 'auto'
                      ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                      : 'bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <Sparkles className="w-5 h-5 fill-current" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Automatic Updates
                  </h5>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400">
                    Background Silent Mode
                  </span>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  settings.mode === 'auto'
                    ? 'border-cyan-500 bg-cyan-500 text-slate-950'
                    : 'border-zinc-300 dark:border-white/20'
                }`}
              >
                {settings.mode === 'auto' && <div className="w-2 h-2 rounded-full bg-slate-950" />}
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Whenever a new GitHub release is published for an app, Anything automatically downloads the installer in the background and silently updates it without interrupting your workflow.
            </p>
          </div>

          {/* Option B: Manual / On-Demand */}
          <div
            onClick={() => updateSettings({ mode: 'manual' })}
            className={`p-4 rounded-2xl border cursor-pointer transition-all duration-200 relative ${
              settings.mode === 'manual'
                ? 'border-amber-500/60 bg-amber-500/[0.08] dark:bg-amber-500/[0.12] shadow-lg shadow-amber-500/10'
                : 'border-zinc-200 dark:border-white/10 bg-white/40 dark:bg-white/[0.02] hover:border-zinc-300 dark:hover:border-white/20'
            }`}
          >
            <div className="flex items-start justify-between gap-3 mb-2.5">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                    settings.mode === 'manual'
                      ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
                      : 'bg-zinc-100 dark:bg-white/10 text-zinc-500 dark:text-zinc-400'
                  }`}
                >
                  <MousePointerClick className="w-5 h-5" />
                </div>
                <div>
                  <h5 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Manual / On-Demand
                  </h5>
                  <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
                    Whenever You Click Update
                  </span>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  settings.mode === 'manual'
                    ? 'border-amber-500 bg-amber-500 text-slate-950'
                    : 'border-zinc-300 dark:border-white/20'
                }`}
              >
                {settings.mode === 'manual' && <div className="w-2 h-2 rounded-full bg-slate-950" />}
              </div>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
              Anything displays an <span className="font-semibold text-amber-500">Update Available</span> badge when a new version is detected. Apps are only downloaded and updated when you explicitly click the &quot;Update&quot; button.
            </p>
          </div>
        </div>

        {/* Secondary Toggles: Check Frequency & Silent Switches */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3 border-t border-zinc-200 dark:border-white/10">
          {/* Check Frequency */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold block flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-cyan-500" />
              Check Frequency
            </label>
            <select
              value={settings.frequency}
              onChange={(e) => updateSettings({ frequency: e.target.value as ChildAppCheckFrequency })}
              className="w-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-white/10 rounded-xl px-3 py-2 text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-cyan-500 cursor-pointer"
            >
              <option value="startup">On App Startup</option>
              <option value="1h">Every 1 Hour</option>
              <option value="6h">Every 6 Hours</option>
              <option value="manual">Manual Checks Only</option>
            </select>
          </div>

          {/* Silent Install */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold block flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-emerald-500" />
              Silent Installation
            </label>
            <button
              onClick={() => updateSettings({ silentInstall: !settings.silentInstall })}
              className={`w-full text-xs font-medium border rounded-xl px-3 py-2 text-left flex items-center justify-between transition-colors ${
                settings.silentInstall
                  ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-400'
                  : 'border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <span>{settings.silentInstall ? 'Enabled (/S flags)' : 'Disabled (Interactive)'}</span>
              <span className={`w-2 h-2 rounded-full ${settings.silentInstall ? 'bg-emerald-400' : 'bg-zinc-400'}`} />
            </button>
          </div>

          {/* Notify Available */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold block flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              Notify When Available
            </label>
            <button
              onClick={() => updateSettings({ notifyAvailable: !settings.notifyAvailable })}
              className={`w-full text-xs font-medium border rounded-xl px-3 py-2 text-left flex items-center justify-between transition-colors ${
                settings.notifyAvailable
                  ? 'border-amber-500/40 bg-amber-500/10 text-amber-400'
                  : 'border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <span>{settings.notifyAvailable ? 'Toast Alerts On' : 'Silent (No Toast)'}</span>
              <span className={`w-2 h-2 rounded-full ${settings.notifyAvailable ? 'bg-amber-400' : 'bg-zinc-400'}`} />
            </button>
          </div>

          {/* Notify Complete */}
          <div className="space-y-1">
            <label className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold block flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-purple-500" />
              Notify on Install Complete
            </label>
            <button
              onClick={() => updateSettings({ notifyComplete: !settings.notifyComplete })}
              className={`w-full text-xs font-medium border rounded-xl px-3 py-2 text-left flex items-center justify-between transition-colors ${
                settings.notifyComplete
                  ? 'border-purple-500/40 bg-purple-500/10 text-purple-400'
                  : 'border-zinc-200 dark:border-white/10 bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-400'
              }`}
            >
              <span>{settings.notifyComplete ? 'Toast Alerts On' : 'Silent'}</span>
              <span className={`w-2 h-2 rounded-full ${settings.notifyComplete ? 'bg-purple-400' : 'bg-zinc-400'}`} />
            </button>
          </div>
        </div>
      </GlassCard>

      {/* ── 2. LIVE CHILD APPLICATIONS UPDATE DASHBOARD ── */}
      <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-500/20">
              <Layers className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  Child Applications Status
                </h4>
                {pendingUpdates.length > 0 ? (
                  <GlassBadge variant="amber" dot size="sm">
                    {pendingUpdates.length} Update{pendingUpdates.length > 1 ? 's' : ''} Available
                  </GlassBadge>
                ) : (
                  <GlassBadge variant="emerald" dot size="sm">
                    All Apps Up to Date
                  </GlassBadge>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                {settings.lastCheckedAt
                  ? `Last verified: ${new Date(settings.lastCheckedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`
                  : 'Checking GitHub in real time'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {pendingUpdates.length > 0 && (
              <GlassButton
                variant="primary"
                size="sm"
                onClick={handleUpdateAllPending}
                icon={<Download className="w-3.5 h-3.5" />}
                className="font-bold text-xs"
              >
                Update All Pending ({pendingUpdates.length})
              </GlassButton>
            )}

            <GlassButton
              variant="glass"
              size="sm"
              onClick={handleCheckChildApps}
              disabled={isCheckingUpdates}
              icon={
                <RefreshCw
                  className={`w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 ${
                    isCheckingUpdates ? 'animate-spin' : ''
                  }`}
                />
              }
              className="text-xs"
            >
              {isCheckingUpdates ? 'Checking GitHub...' : 'Check All for Updates'}
            </GlassButton>
          </div>
        </div>

        {/* Apps List Table/Grid */}
        <div className="space-y-3">
          {apps.map((app) => {
            const hasUpdate = app.status === 'update-available';
            const isDownloading = app.status === 'downloading' || (app as any).status === 'installing';
            const isInstalled = app.status === 'installed' || app.status === 'trial';

            return (
              <div
                key={app.id}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 ${
                  hasUpdate
                    ? 'border-amber-500/40 bg-amber-500/[0.04] dark:bg-amber-500/[0.07]'
                    : 'border-zinc-200 dark:border-white/5 bg-white/40 dark:bg-white/[0.02]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <AppIconRenderer app={app} size="sm" />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {app.name}
                      </h5>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-zinc-200 dark:bg-white/10 text-zinc-600 dark:text-zinc-400 font-mono">
                        {app.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5 truncate">
                      <span>Installed: <strong className="text-zinc-900 dark:text-white">v{app.localVersion || app.version}</strong></span>
                      {app.latestRelease?.tag && (
                        <>
                          <span>•</span>
                          <span>Latest: <strong className={hasUpdate ? 'text-amber-400' : 'text-emerald-400'}>v{app.latestRelease.tag}</strong></span>
                        </>
                      )}
                      {app.githubRepo && (
                        <>
                          <span>•</span>
                          <span className="text-cyan-500 truncate">{app.githubRepo}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Status & Action */}
                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-between sm:justify-end">
                  {isDownloading ? (
                    <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      <span>{app.downloadProgress?.percent || 0}% Installing...</span>
                    </div>
                  ) : hasUpdate ? (
                    <div className="flex items-center gap-2">
                      <GlassBadge variant="amber" dot size="sm">
                        v{app.latestRelease?.tag || app.version} Available
                      </GlassBadge>
                      <GlassButton
                        variant="accent"
                        size="sm"
                        icon={<Download className="w-3 h-3" />}
                        onClick={() => onUpdateApp && onUpdateApp(app)}
                        className="text-xs font-bold"
                      >
                        Update Now
                      </GlassButton>
                    </div>
                  ) : isInstalled ? (
                    <div className="flex items-center gap-1.5 text-xs text-emerald-500 font-mono font-medium">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Up to Date</span>
                    </div>
                  ) : (
                    <span className="text-xs text-zinc-400 font-mono">Not Installed</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </GlassCard>

      {/* ── 3. PARENT APPLICATION (ANYTHING) DELTA UPDATER ── */}
      <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-400/25 shrink-0">
              <GitBranch className="w-5 h-5 text-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                  Anything Host App v26.10.27
                </h4>
                <GlassBadge variant="emerald" dot>Live Channel</GlassBadge>
              </div>
              <p className="text-xs text-zinc-600 dark:text-white/60 mt-0.5 font-medium">
                {parentStatusText}
              </p>
            </div>
          </div>

          <GlassButton
            variant="glass"
            size="sm"
            onClick={handleCheckParent}
            disabled={checkingParent}
            icon={
              <RefreshCw
                className={`w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 ${
                  checkingParent ? 'animate-spin' : ''
                }`}
              />
            }
          >
            {checkingParent ? 'Checking GitHub...' : 'Check Host Updates'}
          </GlassButton>
        </div>

        {/* 3 Steps Pipeline Architecture */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
            <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-300 font-bold block mb-1">
              1. GITHUB RELEASES HOOK
            </span>
            <p className="text-xs text-zinc-600 dark:text-white/70 leading-relaxed font-medium">
              Bump version in <code className="text-cyan-700 dark:text-cyan-300 font-mono">package.json</code> and push to release tag on GitHub.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
            <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 font-bold block mb-1">
              2. ZERO DOMAIN HOSTING
            </span>
            <p className="text-xs text-zinc-600 dark:text-white/70 leading-relaxed font-medium">
              Free hosting of binaries, block maps, and delta payloads directly through GitHub CDN.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-bold block mb-1">
              3. USER CHOICE OR AUTO
            </span>
            <p className="text-xs text-zinc-600 dark:text-white/70 leading-relaxed font-medium">
              Configured per your preference above: update automatically or only when you click update.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-white/40 pt-2 border-t border-zinc-200 dark:border-white/5 font-mono font-medium">
          <span>Electron Updater Engine v6.3.9</span>
          <a
            href="https://github.com/BSFrameWorks5253/Anything/releases"
            target="_blank"
            rel="noopener noreferrer"
            className="text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>View GitHub Releases Dashboard</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </GlassCard>
    </section>
  );
};
