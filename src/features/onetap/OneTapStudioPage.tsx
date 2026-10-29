import React, { useState, useEffect, useCallback } from 'react';
import {
  Sparkles,
  Activity,
  FolderSync,
  Film,
  Play,
  Pause,
  ExternalLink,
  RefreshCw,
  FolderOpen,
  CheckCircle2,
  Clock,
  Layers,
  ArrowUpRight,
  HardDrive,
  FileCheck2,
  UploadCloud,
  Eye,
  Camera,
  Search,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';

interface ProductionSummary {
  updatedAt?: number;
  activeSafar?: string;
  city?: string;
  totalDays?: number;
  completedDays?: number;
  percent?: number;
  isSafarDone?: boolean;
  currentPath?: string;
  currentDrive?: string;
  isOneTapRunning?: boolean;
  counts?: {
    editingPending: number;
    inProgress: number;
    review: number;
    uploadPending: number;
    uploaded: number;
    submitted: number;
    totalTasks: number;
  };
}

interface FinalTitleFile {
  name: string;
  path: string;
  size: number;
  sizeFormatted: string;
  mtime: number;
  mtimeFormatted: string;
  type: 'video' | 'image' | 'other';
  extension?: string;
}

interface FinalTitlesData {
  success: boolean;
  folderPath: string;
  exists: boolean;
  totalCount: number;
  stats?: {
    videos: number;
    images: number;
    totalSizeFormatted: string;
  };
  files?: FinalTitleFile[];
  isOneTapRunning?: boolean;
  error?: string;
}

export const OneTapStudioPage: React.FC<{ searchQuery?: string }> = ({ searchQuery: externalQuery = '' }) => {
  const [activeTab, setActiveTab] = useState<'tracker' | 'converter' | 'titles'>('tracker');
  const [summary, setSummary] = useState<ProductionSummary | null>(null);
  const [titlesData, setTitlesData] = useState<FinalTitlesData | null>(null);
  const [watcherStatus, setWatcherStatus] = useState<{
    enabled: boolean;
    active: boolean;
    watchDir: string | null;
    outDir: string | null;
  }>({
    enabled: true,
    active: true,
    watchDir: 'C:\\Users\\Burhanuddin\\OneDrive\\Pictures\\Screenshots',
    outDir: 'C:\\Users\\Burhanuddin\\OneDrive\\Pictures\\Screenshots\\Converted_JPEGs',
  });
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [titlesFilter, setTitlesFilter] = useState<'all' | 'video' | 'image'>('all');
  const [titlesSearch, setTitlesSearch] = useState(externalQuery);

  // Load tracker summary
  const loadTrackerSummary = useCallback(async () => {
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.oneTapGetTrackerSummary) {
        const res = await electronAPI.oneTapGetTrackerSummary();
        if (res && (res.counts || res.activeSafar)) {
          setSummary(res);
        } else {
          // Demo fallback
          setSummary({
            activeSafar: '1448-10-Istefada ilmiyah',
            city: 'Mumbai',
            totalDays: 6,
            completedDays: 4,
            percent: 67,
            isSafarDone: false,
            isOneTapRunning: true,
            counts: {
              editingPending: 18,
              inProgress: 12,
              review: 5,
              uploadPending: 8,
              uploaded: 42,
              submitted: 42,
              totalTasks: 85,
            },
          });
        }
      }
    } catch (e) {
      console.warn('Error loading tracker summary:', e);
    }
  }, []);

  // Load final titles
  const loadTitles = useCallback(async () => {
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.oneTapGetFinalTitles) {
        const res = await electronAPI.oneTapGetFinalTitles();
        if (res) setTitlesData(res);
      }
    } catch (e) {
      console.warn('Error loading titles:', e);
    }
  }, []);

  // Load watcher status
  const loadWatcher = useCallback(async () => {
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.oneTapGetWatcherStatus) {
        const res = await electronAPI.oneTapGetWatcherStatus();
        if (res) setWatcherStatus(res);
      }
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([loadTrackerSummary(), loadTitles(), loadWatcher()]).finally(() => setLoading(false));
  }, [loadTrackerSummary, loadTitles, loadWatcher]);

  const handleLaunchOneTap = () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.oneTapLaunch) {
      electronAPI.oneTapLaunch();
    }
  };

  const handleOpenOneTapPage = (pageKey: string) => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.oneTapOpenPage) {
      electronAPI.oneTapOpenPage(pageKey);
    }
  };

  const handleToggleWatcher = async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.oneTapToggleWatcher) {
      const res = await electronAPI.oneTapToggleWatcher(!watcherStatus.enabled);
      setWatcherStatus((prev) => ({ ...prev, enabled: res?.enabled ?? !prev.enabled }));
      setFeedback(`Watcher is now ${!watcherStatus.enabled ? 'ACTIVE' : 'PAUSED'}`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleConvertFiles = async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.oneTapConvertFiles) {
      const res = await electronAPI.oneTapConvertFiles();
      if (res?.success) {
        setFeedback(`✓ Converted ${res.converted} screenshots to JPEG`);
        setTimeout(() => setFeedback(null), 3500);
      }
    }
  };

  const handleConvertFolder = async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.oneTapConvertFolder) {
      const res = await electronAPI.oneTapConvertFolder();
      if (res?.success) {
        setFeedback(`✓ Converted ${res.converted} images in folder`);
        setTimeout(() => setFeedback(null), 3500);
      }
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-14 animate-fadeIn">
      {/* Top Banner & Launch CTA */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-600 to-pink-600 flex items-center justify-center text-white shadow-lg shadow-rose-600/25">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  One Tap Production Workstation
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {summary?.isOneTapRunning ? 'Live Daemon Connected' : 'Snapshot Mode'}
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                Live production task tracking, Safar progress analytics, and automated screenshot conversion engine
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <GlassButton
            variant="glass"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 text-rose-500 ${loading ? 'animate-spin' : ''}`} />}
            onClick={() => {
              loadTrackerSummary();
              loadTitles();
            }}
          >
            Refresh
          </GlassButton>

          <GlassButton
            variant="primary"
            size="sm"
            icon={<ExternalLink className="w-3.5 h-3.5 text-white" />}
            onClick={handleLaunchOneTap}
            className="bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md shadow-rose-600/25"
          >
            Launch One Tap App
          </GlassButton>
        </div>
      </div>

      {/* Segmented Module Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-200/80 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-700/60 rounded-xl w-fit backdrop-blur-md">
        <button
          onClick={() => setActiveTab('tracker')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'tracker'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-rose-500" />
          <span>Live Production Tracker</span>
        </button>

        <button
          onClick={() => setActiveTab('converter')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'converter'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <FolderSync className="w-3.5 h-3.5 text-amber-500" />
          <span>Auto-Screenshot Converter</span>
        </button>

        <button
          onClick={() => setActiveTab('titles')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'titles'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <Film className="w-3.5 h-3.5 text-indigo-400" />
          <span>Production Final Titles</span>
        </button>
      </div>

      {/* Module 1: Live Production Tracker & Safar Progress */}
      {activeTab === 'tracker' && (
        <div className="space-y-6 animate-fadeIn">
          {/* Active Safar Hero Card */}
          <GlassCard className="p-6 border-rose-500/20 bg-gradient-to-br from-rose-500/10 via-pink-500/5 to-transparent relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🕌</span>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                      {summary?.activeSafar || 'No Active Safar Selected'}
                    </h2>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                      {summary?.city ? `Stationed at ${summary.city}` : 'One Tap Workstation'} · Day {summary?.completedDays || 0} of {summary?.totalDays || 0} Complete
                    </p>
                  </div>
                </div>
              </div>

              {/* Progress Radial & Quick Jump */}
              <div className="flex items-center gap-4 shrink-0">
                <div className="text-right">
                  <span className="text-2xl font-bold font-mono text-zinc-900 dark:text-white">
                    {summary?.percent || 0}%
                  </span>
                  <span className="text-[11px] text-zinc-500 block font-medium">Safar Completion</span>
                </div>
                <GlassButton
                  variant="primary"
                  size="sm"
                  icon={<ArrowUpRight className="w-4 h-4 text-white" />}
                  onClick={() => handleOpenOneTapPage('tracker')}
                  className="bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md shadow-rose-600/20"
                >
                  Open Tracker in One Tap
                </GlassButton>
              </div>
            </div>

            {/* Visual Progress Bar */}
            <div className="w-full mt-5 bg-zinc-200/70 dark:bg-black/50 p-1 rounded-2xl border border-zinc-300/60 dark:border-white/10 shadow-inner">
              <div
                className="h-2.5 rounded-xl bg-gradient-to-r from-rose-600 via-pink-500 to-amber-400 transition-all duration-500"
                style={{ width: `${summary?.percent || 0}%` }}
              />
            </div>
          </GlassCard>

          {/* Task Pipeline Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
            <GlassCard className="p-4 border-zinc-200/90 dark:border-white/10">
              <span className="text-[11px] font-medium text-amber-600 dark:text-amber-400">Editing Pending</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                {summary?.counts?.editingPending ?? 0}
              </p>
              <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">Tasks queued</span>
            </GlassCard>

            <GlassCard className="p-4 border-zinc-200/90 dark:border-white/10">
              <span className="text-[11px] font-medium text-blue-600 dark:text-blue-400">In Progress</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                {summary?.counts?.inProgress ?? 0}
              </p>
              <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">Actively editing</span>
            </GlassCard>

            <GlassCard className="p-4 border-zinc-200/90 dark:border-white/10">
              <span className="text-[11px] font-medium text-purple-600 dark:text-purple-400">In Review</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                {summary?.counts?.review ?? 0}
              </p>
              <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">Verification stage</span>
            </GlassCard>

            <GlassCard className="p-4 border-zinc-200/90 dark:border-white/10">
              <span className="text-[11px] font-medium text-cyan-600 dark:text-cyan-400">Upload Pending</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                {summary?.counts?.uploadPending ?? 0}
              </p>
              <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">Ready for cloud</span>
            </GlassCard>

            <GlassCard className="p-4 border-zinc-200/90 dark:border-white/10">
              <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400">Uploaded</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                {summary?.counts?.uploaded ?? 0}
              </p>
              <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">Delivered cuts</span>
            </GlassCard>

            <GlassCard className="p-4 border-zinc-200/90 dark:border-white/10">
              <span className="text-[11px] font-medium text-zinc-600 dark:text-zinc-300">Total Tasks</span>
              <p className="text-2xl font-bold text-zinc-900 dark:text-white mt-1">
                {summary?.counts?.totalTasks ?? 0}
              </p>
              <span className="text-[10px] text-zinc-500 font-medium block mt-0.5">Overall scope</span>
            </GlassCard>
          </div>
        </div>
      )}

      {/* Module 2: Auto-Screenshot Converter Engine */}
      {activeTab === 'converter' && (
        <div className="space-y-6 animate-fadeIn">
          <GlassCard className="p-6 border-zinc-200/90 dark:border-white/10 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                  Automated Screenshot & Image Watcher
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                  Continuously watches your Windows Screenshots folder and automatically converts PNGs into optimized JPEGs.
                </p>
              </div>

              <GlassButton
                variant={watcherStatus.enabled ? 'primary' : 'glass'}
                size="sm"
                icon={watcherStatus.enabled ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                onClick={handleToggleWatcher}
                className={watcherStatus.enabled ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-semibold' : ''}
              >
                {watcherStatus.enabled ? 'Watcher Active' : 'Start Watcher'}
              </GlassButton>
            </div>

            {/* Folder Paths */}
            <div className="space-y-3 pt-2">
              <div className="p-3.5 rounded-xl bg-zinc-100/80 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10 text-xs font-mono flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-zinc-400 font-semibold block text-[10px] uppercase">Watch Directory (Input)</span>
                  <span className="text-zinc-800 dark:text-zinc-200 truncate block mt-0.5">
                    {watcherStatus.watchDir || 'Default Screenshots Folder'}
                  </span>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-100/80 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10 text-xs font-mono flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <span className="text-zinc-400 font-semibold block text-[10px] uppercase">Output Directory (Converted JPEGs)</span>
                  <span className="text-zinc-800 dark:text-zinc-200 truncate block mt-0.5">
                    {watcherStatus.outDir || 'Converted_JPEGs'}
                  </span>
                </div>
              </div>
            </div>

            {/* Manual Batch Actions */}
            <div className="pt-3 border-t border-zinc-200/80 dark:border-white/10 flex flex-wrap items-center gap-3">
              <GlassButton
                variant="glass"
                size="sm"
                icon={<UploadCloud className="w-3.5 h-3.5 text-blue-500" />}
                onClick={handleConvertFiles}
              >
                Select & Convert PNGs Now
              </GlassButton>

              <GlassButton
                variant="glass"
                size="sm"
                icon={<FolderOpen className="w-3.5 h-3.5 text-amber-500" />}
                onClick={handleConvertFolder}
              >
                Batch Convert Entire Folder
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      )}

      {/* Module 3: Production Final Titles */}
      {activeTab === 'titles' && (
        <div className="space-y-5 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Final Rendered Production Titles
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
                Master video cuts, intro slates, and lower-third graphics rendered by One Tap Workstation.
              </p>
            </div>

            {/* Filter pills */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setTitlesFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  titlesFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                All ({titlesData?.files?.length || 0})
              </button>
              <button
                onClick={() => setTitlesFilter('video')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  titlesFilter === 'video'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Videos ({titlesData?.stats?.videos || 0})
              </button>
              <button
                onClick={() => setTitlesFilter('image')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold cursor-pointer ${
                  titlesFilter === 'image'
                    ? 'bg-blue-600 text-white'
                    : 'bg-zinc-200/70 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                }`}
              >
                Graphics ({titlesData?.stats?.images || 0})
              </button>
            </div>
          </div>

          {/* Titles Gallery */}
          {(!titlesData?.files || titlesData.files.length === 0) ? (
            <GlassCard className="p-10 text-center border-dashed border-zinc-300 dark:border-white/10">
              <Film className="w-10 h-10 text-zinc-400 mx-auto mb-2 opacity-50" />
              <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No Final Titles Staged</h4>
              <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                Rendered titles from One Tap Workstation will automatically populate here for instantaneous cross-app inspection.
              </p>
            </GlassCard>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3.5">
              {titlesData.files
                .filter((f) => (titlesFilter === 'all' ? true : f.type === titlesFilter))
                .map((f) => (
                  <GlassCard key={f.path} className="p-3 border-zinc-200/80 dark:border-white/10 flex flex-col gap-2">
                    <div className="w-full h-24 rounded-xl bg-zinc-100 dark:bg-black/50 flex items-center justify-center text-zinc-400">
                      {f.type === 'video' ? <Film className="w-8 h-8 text-indigo-400" /> : <Camera className="w-8 h-8 text-rose-400" />}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate" title={f.name}>
                        {f.name}
                      </h4>
                      <span className="text-[10px] font-mono text-zinc-500 block">{f.sizeFormatted}</span>
                    </div>
                  </GlassCard>
                ))}
            </div>
          )}
        </div>
      )}

      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-[130] p-3 px-4 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
};
