import React, { useState, useEffect } from 'react';
import {
  Image,
  FolderOpen,
  Power,
  Play,
  Pause,
  RefreshCw,
  CheckCircle2,
  Sparkles,
  ExternalLink,
  FileImage,
  FolderSync,
  Sliders,
  Check,
  Camera,
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import { useTheme } from '../../../context/ThemeContext';

export const OneTapAutoConverterSection: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [enabled, setEnabled] = useState(true);
  const [active, setActive] = useState(false);
  const [watchDir, setWatchDir] = useState<string | null>(null);
  const [outDir, setOutDir] = useState<string | null>(null);
  const [lastConverted, setLastConverted] = useState<string | null>(null);
  const [convertedCount, setConvertedCount] = useState<number>(0);
  const [recentFiles, setRecentFiles] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Load initial daemon status
  const refreshStatus = async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.oneTapGetWatcherStatus) {
      try {
        const res = await electronAPI.oneTapGetWatcherStatus();
        setEnabled(res.enabled);
        setActive(res.active);
        setWatchDir(res.watchDir);
        setOutDir(res.outDir);
      } catch (err) {
        console.error('Failed to load One Tap watcher status:', err);
      }
    }
  };

  useEffect(() => {
    refreshStatus();

    const electronAPI = (window as any).electronAPI;

    // Listen to real-time status updates (e.g. from tray toggle or folder change)
    let unsubStatus: (() => void) | undefined;
    if (electronAPI?.onOneTapStatus) {
      unsubStatus = electronAPI.onOneTapStatus((data: any) => {
        setEnabled(data.enabled);
        setActive(data.active);
        if (data.watchDir) setWatchDir(data.watchDir);
        if (data.outDir) setOutDir(data.outDir);
      });
    }

    // Listen to real-time image conversion events
    let unsubConverted: (() => void) | undefined;
    if (electronAPI?.onOneTapConverted) {
      unsubConverted = electronAPI.onOneTapConverted((data: any) => {
        if (data.converted > 0) {
          setConvertedCount((prev) => prev + data.converted);
          if (data.file) {
            setLastConverted(data.file);
            setRecentFiles((prev) => [data.file, ...prev.slice(0, 4)]);
          }
          if (data.outputDir) {
            setOutDir(data.outputDir);
          }
        }
      });
    }

    return () => {
      if (unsubStatus) unsubStatus();
      if (unsubConverted) unsubConverted();
    };
  }, []);

  const handleToggle = async () => {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI?.oneTapToggleWatcher) return;
    setIsLoading(true);
    try {
      const nextState = !enabled;
      const res = await electronAPI.oneTapToggleWatcher(nextState);
      setEnabled(res.enabled);
      setActive(res.active);
      setActionMessage(nextState ? 'Daemon activated! Monitoring screenshots.' : 'Daemon paused.');
      setTimeout(() => setActionMessage(null), 3000);
    } catch (err) {
      console.error('Failed to toggle One Tap watcher:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenWatchFolder = async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.oneTapOpenWatchFolder) {
      await electronAPI.oneTapOpenWatchFolder();
    }
  };

  const handleOpenOutputFolder = async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.oneTapOpenOutputFolder) {
      await electronAPI.oneTapOpenOutputFolder();
    }
  };

  const handleChangeFolder = async () => {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI?.oneTapSetWatchFolder) return;
    try {
      const res = await electronAPI.oneTapSetWatchFolder();
      if (res.success && res.watchDir) {
        setWatchDir(res.watchDir);
        if (res.outDir) setOutDir(res.outDir);
        setActionMessage('Watch folder updated successfully!');
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch (err) {
      console.error('Failed to set watch folder:', err);
    }
  };

  const handleConvertFiles = async () => {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI?.oneTapConvertFiles) return;
    try {
      const res = await electronAPI.oneTapConvertFiles();
      if (res?.success && res.converted > 0) {
        setConvertedCount((prev) => prev + res.converted);
        setActionMessage(`Successfully converted ${res.converted} image${res.converted > 1 ? 's' : ''} to JPG!`);
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      console.error('Manual file conversion error:', err);
    }
  };

  const handleConvertFolder = async () => {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI?.oneTapConvertFolder) return;
    try {
      const res = await electronAPI.oneTapConvertFolder();
      if (res?.success && res.converted > 0) {
        setConvertedCount((prev) => prev + res.converted);
        setActionMessage(`Converted ${res.converted} PNGs in folder to JPG!`);
        setTimeout(() => setActionMessage(null), 4000);
      }
    } catch (err) {
      console.error('Manual folder conversion error:', err);
    }
  };

  const handleLaunchOneTap = async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.oneTapLaunch) {
      await electronAPI.oneTapLaunch();
    }
  };

  return (
    <section className="space-y-3.5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-700 dark:text-white/70 font-bold flex items-center gap-2">
            <Camera className="w-3.5 h-3.5 text-emerald-500" />
            <span>One Tap &bull; Screenshot Auto-Converter Daemon</span>
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Monitors screenshots in the background and converts PNGs into JPEGs automatically—even when One Tap and Anything are minimized.
          </p>
        </div>

        {actionMessage && (
          <div className="px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-1.5 animate-fadeIn">
            <Check className="w-3.5 h-3.5" />
            <span>{actionMessage}</span>
          </div>
        )}
      </div>

      <GlassCard
        variant="interactive"
        className={`p-6 rounded-2xl border transition-all relative overflow-hidden ${
          isLight
            ? 'bg-white/80 border-zinc-200/90 shadow-sm'
            : 'bg-zinc-900/60 border-white/10 shadow-xl'
        }`}
      >
        {/* Glow ambient accent */}
        <div
          className={`absolute -top-24 -right-24 w-72 h-72 rounded-full blur-3xl pointer-events-none transition-opacity duration-700 ${
            enabled && active ? 'bg-emerald-500/15' : 'bg-amber-500/10'
          }`}
        />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          {/* Status Indicator & Title */}
          <div className="flex items-start gap-4">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border transition-all duration-300 ${
                enabled && active
                  ? isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-600 shadow-sm'
                    : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-lg shadow-emerald-500/10'
                  : isLight
                  ? 'bg-zinc-100 border-zinc-200 text-zinc-500'
                  : 'bg-zinc-800/40 border-zinc-700 text-zinc-400'
              }`}
            >
              <Image className="w-6 h-6" />
            </div>

            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  Real-Time Screenshot Watcher
                </h4>
                {enabled && active ? (
                  <GlassBadge variant="green" dot>
                    Active &bull; Watching
                  </GlassBadge>
                ) : (
                  <GlassBadge variant="orange" dot>
                    Paused
                  </GlassBadge>
                )}
                {convertedCount > 0 && (
                  <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-mono font-semibold">
                    {convertedCount} converted
                  </span>
                )}
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl leading-relaxed">
                Snipping Tool, Windows Screenshot (
                <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                  isLight ? 'bg-zinc-200/90 text-zinc-800 border border-zinc-300' : 'bg-zinc-800 text-zinc-200'
                }`}>Win</kbd> + <kbd className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold ${
                  isLight ? 'bg-zinc-200/90 text-zinc-800 border border-zinc-300' : 'bg-zinc-800 text-zinc-200'
                }`}>PrtScn</kbd>
                ), or copied images appearing in the watch folder are instantly converted to clean 92% quality JPGs in <span className="font-mono font-semibold text-zinc-800 dark:text-zinc-200">Converted_JPEGs</span>.
              </p>
            </div>
          </div>

          {/* Toggle Button */}
          <div className="flex items-center gap-3 shrink-0">
            <GlassButton
              variant={enabled && active ? 'primary' : 'glass'}
              size="md"
              icon={enabled && active ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              onClick={handleToggle}
              disabled={isLoading}
              className={`text-xs font-bold ${
                enabled && active
                  ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900'
                  : ''
              }`}
            >
              {enabled && active ? 'Pause Auto-Convert' : 'Enable Auto-Convert'}
            </GlassButton>
          </div>
        </div>

        {/* Directory details grid */}
        <div className="mt-6 pt-5 border-t border-zinc-200/80 dark:border-white/5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Watch Folder */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3.5 transition-all ${
              isLight
                ? 'bg-zinc-50/80 border-zinc-200/80 shadow-2xs'
                : 'bg-zinc-900/50 border-white/5'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                  <FolderSync className="w-3.5 h-3.5 text-cyan-500" />
                  Monitored Input Folder
                </span>
                <button
                  onClick={handleChangeFolder}
                  className="text-[11px] font-semibold text-cyan-600 dark:text-cyan-400 hover:text-cyan-700 dark:hover:text-cyan-300 transition-colors"
                >
                  Change Folder...
                </button>
              </div>
              <div
                className="text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100 truncate select-all"
                title={watchDir || 'Standard Windows Screenshots'}
              >
                {watchDir || 'OneDrive\\Pictures\\Screenshots'}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <GlassButton
                variant="glass"
                size="sm"
                icon={<FolderOpen className="w-3.5 h-3.5" />}
                onClick={handleOpenWatchFolder}
                className="text-xs font-semibold"
              >
                Open Watch Folder
              </GlassButton>
            </div>
          </div>

          {/* Output Destination Folder */}
          <div
            className={`p-4 rounded-xl border flex flex-col justify-between gap-3.5 transition-all ${
              isLight
                ? 'bg-zinc-50/80 border-zinc-200/80 shadow-2xs'
                : 'bg-zinc-900/50 border-white/5'
            }`}
          >
            <div>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-mono text-[11px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Target Output (Converted_JPEGs)
                </span>
                <span className="text-[10px] text-zinc-500 font-mono font-semibold px-1.5 py-0.5 rounded bg-zinc-200/60 dark:bg-zinc-800">
                  JPG @ Quality 92
                </span>
              </div>
              <div
                className="text-xs font-mono font-medium text-zinc-900 dark:text-zinc-100 truncate select-all"
                title={outDir || 'Auto-creates Converted_JPEGs in watch directory'}
              >
                {outDir || (watchDir ? `${watchDir}\\Converted_JPEGs` : 'Converted_JPEGs')}
              </div>
            </div>

            <div className="flex items-center justify-end">
              <GlassButton
                variant="glass"
                size="sm"
                icon={<FolderOpen className="w-3.5 h-3.5" />}
                onClick={handleOpenOutputFolder}
                className="text-xs font-semibold"
              >
                Open Converted JPEGs
              </GlassButton>
            </div>
          </div>
        </div>

        {/* Quick Actions Footer */}
        <div className="mt-4 pt-4 border-t border-zinc-200/60 dark:border-white/5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-zinc-600 dark:text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span className="font-medium">Manual Tools:</span>
            <button
              onClick={handleConvertFiles}
              className="text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white font-semibold underline underline-offset-2 ml-1"
            >
              Select PNGs to Convert
            </button>
            <span className="text-zinc-400">&bull;</span>
            <button
              onClick={handleConvertFolder}
              className="text-zinc-800 dark:text-zinc-200 hover:text-black dark:hover:text-white font-semibold underline underline-offset-2"
            >
              Batch Convert Folder
            </button>
          </div>

          <div className="flex items-center gap-2">
            <GlassButton
              variant="glass"
              size="sm"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={handleLaunchOneTap}
              className="text-xs font-semibold"
            >
              Launch One Tap Workstation
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </section>
  );
};
