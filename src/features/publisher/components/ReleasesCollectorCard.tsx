import React, { useState } from 'react';
import {
  FolderSync,
  FolderOpen,
  RefreshCw,
  Sparkles,
  Bot,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ArrowRight,
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import { ChildAppSetupModal } from './ChildAppSetupModal';

interface ReleasesCollectorCardProps {
  onReleasesSynced?: (catalog: any[]) => void;
}

export const ReleasesCollectorCard: React.FC<ReleasesCollectorCardProps> = ({
  onReleasesSynced,
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [syncStatus, setSyncStatus] = useState<{
    success?: boolean;
    addedCount?: number;
    updatedCount?: number;
    total?: number;
    message?: string;
  } | null>(null);

  const handleOpenFolder = async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.openReleasesFolder) {
      await electronAPI.openReleasesFolder();
    } else {
      alert('Open folder is available in the Electron desktop app.');
    }
  };

  const handleCollectNow = async () => {
    setIsScanning(true);
    setSyncStatus(null);

    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.scanAndCollectReleases) {
      try {
        const res = await electronAPI.scanAndCollectReleases();
        setIsScanning(false);
        if (res.success) {
          setSyncStatus({
            success: true,
            addedCount: res.addedCount,
            updatedCount: res.updatedCount,
            total: res.total,
            message: `Scanned releases: +${res.addedCount} new app(s), ${res.updatedCount} update(s). Total: ${res.total}`,
          });
          if (onReleasesSynced && res.catalog) {
            onReleasesSynced(res.catalog);
          }
        } else {
          setSyncStatus({
            success: false,
            message: res.error || 'Failed to scan releases folder',
          });
        }
      } catch (err: any) {
        setIsScanning(false);
        setSyncStatus({
          success: false,
          message: err.message,
        });
      }
    } else {
      // Browser preview simulation
      setTimeout(() => {
        setIsScanning(false);
        setSyncStatus({
          success: true,
          addedCount: 1,
          updatedCount: 0,
          total: 1,
          message: 'Simulation: 1 child app collected from releases folder.',
        });
      }, 700);
    }
  };

  return (
    <>
      <GlassCard
        variant="elevated"
        className="p-6 border-zinc-200 dark:border-white/10 space-y-4 relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-500 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/25">
              <FolderSync className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                  Child Apps Release Collector
                </h4>
                <GlassBadge variant="cyan" dot>
                  Live Auto-Watcher
                </GlassBadge>
              </div>
              <p className="text-xs text-zinc-600 dark:text-white/60 mt-0.5">
                Drop any new child app <code className="text-cyan-600 dark:text-cyan-400 font-mono font-bold">.exe</code> or subfolder into <code className="text-zinc-800 dark:text-white font-mono">Anything/releases/</code> to auto-catalog or update it.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <GlassButton
              variant="glass"
              size="sm"
              icon={<Bot className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />}
              onClick={() => setGuideModalOpen(true)}
            >
              Setup Guide & AI Prompt
            </GlassButton>

            <GlassButton
              variant="glass"
              size="sm"
              icon={<FolderOpen className="w-4 h-4 text-zinc-600 dark:text-white/70" />}
              onClick={handleOpenFolder}
            >
              Open Releases Folder
            </GlassButton>

            <GlassButton
              variant="primary"
              size="sm"
              icon={<RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />}
              onClick={handleCollectNow}
              disabled={isScanning}
            >
              {isScanning ? 'Scanning...' : 'Collect Releases Now'}
            </GlassButton>
          </div>
        </div>

        {/* Sync Status Banner */}
        {syncStatus && (
          <div
            className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 animate-fade-in ${
              syncStatus.success
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-800 dark:text-emerald-300'
                : 'bg-rose-500/10 border-rose-500/30 text-rose-800 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-2">
              {syncStatus.success ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400 shrink-0" />
              )}
              <span className="font-medium">{syncStatus.message}</span>
            </div>

            <button
              onClick={() => setSyncStatus(null)}
              className="text-[11px] font-mono underline hover:no-underline opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}
      </GlassCard>

      {/* Guide and AI Prompt Modal */}
      <ChildAppSetupModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
        onOpenReleasesFolder={handleOpenFolder}
      />
    </>
  );
};
