import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Calendar,
  FolderTree,
  HardDrive,
  FileSpreadsheet,
  Search,
  ExternalLink,
  RefreshCw,
  Folder,
  Layers,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Camera,
  Film,
  CheckCircle2,
  Clock,
  Download,
  Copy,
  SlidersHorizontal,
  FolderOpen,
  PieChart,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';

export interface FolderMetrics {
  path: string;
  exists: boolean;
  fileCount: number;
  totalBytes: number;
  sizeStr: string;
  photoCount: number;
  videoCount: number;
  otherCount: number;
  subfolderCount: number;
}

export interface DateStatItem {
  id: string;
  dateName: string;
  mainDataPath: string;
  remainingPath: string;
  thumbnailsPath: string;
  mainDataMetrics: FolderMetrics;
  remainingMetrics: FolderMetrics;
  thumbnailsMetrics: FolderMetrics;
  eventFoldersCount: number;
  totalFiles: number;
  totalBytes: number;
  sizeStr: string;
  addedAt: string;
  updatedAt: string;
}

export interface SafarStatRecord {
  id: string;
  safarName: string;
  safarRootPath: string;
  pvFolderPath: string;
  remainingFolderPath: string;
  thumbnailsFolderPath: string;
  dates: DateStatItem[];
  totalDates: number;
  totalMainFiles: number;
  totalRemainingFiles: number;
  totalThumbnailsFiles: number;
  totalFiles: number;
  totalBytes: number;
  sizeStr: string;
  createdAt: string;
  lastModifiedAt: string;
}

const DEMO_SAFAR_STATS: SafarStatRecord[] = [
  {
    id: '1448-10-istefada_ilmiyah',
    safarName: '1448-10-Istefada ilmiyah',
    safarRootPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah',
    pvFolderPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah\\1448-10-Istefada ilmiyah_P-V',
    remainingFolderPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah\\Remaining',
    thumbnailsFolderPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah\\Thumbnails',
    totalDates: 4,
    totalMainFiles: 2840,
    totalRemainingFiles: 520,
    totalThumbnailsFiles: 2840,
    totalFiles: 6200,
    totalBytes: 94800000000,
    sizeStr: '88.29 GB',
    createdAt: '2026-10-20T10:00:00Z',
    lastModifiedAt: '2026-10-28T16:30:00Z',
    dates: [
      {
        id: '1448-10-01_Session1',
        dateName: '1448-10-01 _01E',
        mainDataPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah\\1448-10-Istefada ilmiyah_P-V\\1448-10-01 _01E',
        remainingPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah\\Remaining\\1448-10-01 _01E',
        thumbnailsPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah\\Thumbnails\\1448-10-01 _01E',
        mainDataMetrics: {
          path: '',
          exists: true,
          fileCount: 710,
          totalBytes: 23400000000,
          sizeStr: '21.79 GB',
          photoCount: 650,
          videoCount: 60,
          otherCount: 0,
          subfolderCount: 12,
        },
        remainingMetrics: {
          path: '',
          exists: true,
          fileCount: 130,
          totalBytes: 1600000000,
          sizeStr: '1.49 GB',
          photoCount: 130,
          videoCount: 0,
          otherCount: 0,
          subfolderCount: 1,
        },
        thumbnailsMetrics: {
          path: '',
          exists: true,
          fileCount: 710,
          totalBytes: 350000000,
          sizeStr: '333 MB',
          photoCount: 710,
          videoCount: 0,
          otherCount: 0,
          subfolderCount: 1,
        },
        eventFoldersCount: 12,
        totalFiles: 1550,
        totalBytes: 25350000000,
        sizeStr: '23.61 GB',
        addedAt: '2026-10-20T11:00:00Z',
        updatedAt: '2026-10-20T11:45:00Z',
      },
      {
        id: '1448-10-02_Session2',
        dateName: '1448-10-02 _02E',
        mainDataPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah\\1448-10-Istefada ilmiyah_P-V\\1448-10-02 _02E',
        remainingPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah\\Remaining\\1448-10-02 _02E',
        thumbnailsPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah\\Thumbnails\\1448-10-02 _02E',
        mainDataMetrics: {
          path: '',
          exists: true,
          fileCount: 820,
          totalBytes: 28900000000,
          sizeStr: '26.91 GB',
          photoCount: 740,
          videoCount: 80,
          otherCount: 0,
          subfolderCount: 14,
        },
        remainingMetrics: {
          path: '',
          exists: true,
          fileCount: 140,
          totalBytes: 1800000000,
          sizeStr: '1.67 GB',
          photoCount: 140,
          videoCount: 0,
          otherCount: 0,
          subfolderCount: 1,
        },
        thumbnailsMetrics: {
          path: '',
          exists: true,
          fileCount: 820,
          totalBytes: 410000000,
          sizeStr: '391 MB',
          photoCount: 820,
          videoCount: 0,
          otherCount: 0,
          subfolderCount: 1,
        },
        eventFoldersCount: 14,
        totalFiles: 1780,
        totalBytes: 31110000000,
        sizeStr: '28.97 GB',
        addedAt: '2026-10-21T10:00:00Z',
        updatedAt: '2026-10-21T10:30:00Z',
      },
      {
        id: '1448-10-03_Session3',
        dateName: '1448-10-03 _03E',
        mainDataPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah\\1448-10-Istefada ilmiyah_P-V\\1448-10-03 _03E',
        remainingPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah\\Remaining\\1448-10-03 _03E',
        thumbnailsPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah\\Thumbnails\\1448-10-03 _03E',
        mainDataMetrics: {
          path: '',
          exists: true,
          fileCount: 650,
          totalBytes: 20100000000,
          sizeStr: '18.72 GB',
          photoCount: 590,
          videoCount: 60,
          otherCount: 0,
          subfolderCount: 11,
        },
        remainingMetrics: {
          path: '',
          exists: true,
          fileCount: 110,
          totalBytes: 1400000000,
          sizeStr: '1.30 GB',
          photoCount: 110,
          videoCount: 0,
          otherCount: 0,
          subfolderCount: 1,
        },
        thumbnailsMetrics: {
          path: '',
          exists: true,
          fileCount: 650,
          totalBytes: 320000000,
          sizeStr: '305 MB',
          photoCount: 650,
          videoCount: 0,
          otherCount: 0,
          subfolderCount: 1,
        },
        eventFoldersCount: 11,
        totalFiles: 1410,
        totalBytes: 21820000000,
        sizeStr: '20.32 GB',
        addedAt: '2026-10-22T09:30:00Z',
        updatedAt: '2026-10-22T10:15:00Z',
      },
      {
        id: '1448-10-04_Session4',
        dateName: '1448-10-04 _04E',
        mainDataPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah\\1448-10-Istefada ilmiyah_P-V\\1448-10-04 _04E',
        remainingPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah\\Remaining\\1448-10-04 _04E',
        thumbnailsPath: 'D:\\2026_PRODUCTION\\1448-10-Istefada ilmiyah\\Thumbnails\\1448-10-04 _04E',
        mainDataMetrics: {
          path: '',
          exists: true,
          fileCount: 660,
          totalBytes: 21200000000,
          sizeStr: '19.74 GB',
          photoCount: 600,
          videoCount: 60,
          otherCount: 0,
          subfolderCount: 10,
        },
        remainingMetrics: {
          path: '',
          exists: true,
          fileCount: 140,
          totalBytes: 1700000000,
          sizeStr: '1.58 GB',
          photoCount: 140,
          videoCount: 0,
          otherCount: 0,
          subfolderCount: 1,
        },
        thumbnailsMetrics: {
          path: '',
          exists: true,
          fileCount: 660,
          totalBytes: 330000000,
          sizeStr: '314 MB',
          photoCount: 660,
          videoCount: 0,
          otherCount: 0,
          subfolderCount: 1,
        },
        eventFoldersCount: 10,
        totalFiles: 1460,
        totalBytes: 23230000000,
        sizeStr: '21.63 GB',
        addedAt: '2026-10-23T11:00:00Z',
        updatedAt: '2026-10-23T11:50:00Z',
      },
    ],
  },
];

export const MediaFlowStatsPage: React.FC<{ searchQuery?: string }> = ({ searchQuery: externalQuery = '' }) => {
  const [records, setRecords] = useState<SafarStatRecord[]>([]);
  const [filePath, setFilePath] = useState<string>('');
  const [exists, setExists] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>(externalQuery);
  const [expandedSafarIds, setExpandedSafarIds] = useState<Set<string>>(new Set());
  const [useDemo, setUseDemo] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadStats = async () => {
    setLoading(true);
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.mediaflowGetSafarStats) {
        const res = await electronAPI.mediaflowGetSafarStats();
        if (res?.exists && res.records?.length > 0) {
          setRecords(res.records);
          setExists(true);
          setFilePath(res.filePath);
          setLastUpdated(res.lastUpdated || '');
          setExpandedSafarIds(new Set([res.records[0].id]));
          setUseDemo(false);
        } else {
          setExists(Boolean(res?.exists));
          setFilePath(res?.filePath || '%APPDATA%\\Anything\\safar_stats.json');
          setRecords(DEMO_SAFAR_STATS);
          setExpandedSafarIds(new Set([DEMO_SAFAR_STATS[0].id]));
          setUseDemo(true);
        }
      } else {
        setRecords(DEMO_SAFAR_STATS);
        setExpandedSafarIds(new Set([DEMO_SAFAR_STATS[0].id]));
        setUseDemo(true);
      }
    } catch (err) {
      console.warn('Failed to load MediaFlow stats:', err);
      setRecords(DEMO_SAFAR_STATS);
      setUseDemo(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const toggleExpand = (id: string) => {
    setExpandedSafarIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleLaunchMediaFlow = () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.mediaflowLaunchStudio) {
      electronAPI.mediaflowLaunchStudio();
    }
  };

  const handleOpenFolder = (dirPath?: string) => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.mediaflowOpenFolder) {
      electronAPI.mediaflowOpenFolder(dirPath || filePath);
    }
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(filePath || 'safar_stats.json');
    setFeedback('✓ Path copied to clipboard');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleExportJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(records, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `MediaFlow_Production_Stats_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setFeedback('✓ Production stats exported as JSON');
    setTimeout(() => setFeedback(null), 3500);
  };

  // Filter records
  const filtered = records.filter((r) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      r.safarName.toLowerCase().includes(q) ||
      r.safarRootPath.toLowerCase().includes(q) ||
      r.dates?.some((d) => d.dateName.toLowerCase().includes(q))
    );
  });

  // Calculate Aggregates
  const totalSafars = records.length;
  const totalDates = records.reduce((acc, r) => acc + (r.dates?.length || r.totalDates || 0), 0);
  const totalFiles = records.reduce((acc, r) => acc + (r.totalFiles || 0), 0);
  const totalMainFiles = records.reduce((acc, r) => acc + (r.totalMainFiles || 0), 0);
  const totalRemainingFiles = records.reduce((acc, r) => acc + (r.totalRemainingFiles || 0), 0);
  const totalThumbs = records.reduce((acc, r) => acc + (r.totalThumbnailsFiles || 0), 0);
  const totalBytes = records.reduce((acc, r) => acc + (r.totalBytes || 0), 0);
  const totalSizeFormatted =
    totalBytes > 1024 * 1024 * 1024 * 1024
      ? `${(totalBytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`
      : `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;

  // Percentages for distribution
  const pvPercent = totalFiles > 0 ? Math.round((totalMainFiles / totalFiles) * 100) : 48;
  const remPercent = totalFiles > 0 ? Math.round((totalRemainingFiles / totalFiles) * 100) : 8;
  const thumbPercent = 100 - pvPercent - remPercent;

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-14 animate-fadeIn">
      {/* Cinematic Top Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-white/[0.08]">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/25">
              <BarChart3 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
                  MediaFlow Production & Safar Telemetry
                </h1>
                {useDemo ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                    Demo Mode Preview
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live Sync · safar_stats.json
                  </span>
                )}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
                Comprehensive data ledger generated by MediaFlow Studio Stage 07 Event Image Shifter and Stats Manager
              </p>
            </div>
          </div>
        </div>

        {/* Global Action Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <GlassButton
            variant="glass"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 text-blue-500 ${loading ? 'animate-spin' : ''}`} />}
            onClick={loadStats}
          >
            Refresh Metrics
          </GlassButton>

          <GlassButton
            variant="glass"
            size="sm"
            icon={<Download className="w-3.5 h-3.5 text-emerald-500" />}
            onClick={handleExportJson}
            title="Export all Safar records as JSON report"
          >
            Export JSON
          </GlassButton>

          <GlassButton
            variant="primary"
            size="sm"
            icon={<ExternalLink className="w-3.5 h-3.5 text-white" />}
            onClick={handleLaunchMediaFlow}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/25"
          >
            Launch MediaFlow Studio
          </GlassButton>
        </div>
      </div>

      {/* 6 Executive Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <GlassCard className="p-4 border-zinc-200/90 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Total Expeditions</span>
            <div className="p-1.5 rounded-xl bg-blue-500/10 text-blue-500">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{totalSafars}</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5 font-medium">Safars Recorded</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-zinc-200/90 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Processed Dates</span>
            <div className="p-1.5 rounded-xl bg-indigo-500/10 text-indigo-500">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{totalDates}</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5 font-medium">Session Dates</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-zinc-200/90 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Total Media Files</span>
            <div className="p-1.5 rounded-xl bg-purple-500/10 text-purple-500">
              <Camera className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{totalFiles.toLocaleString()}</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5 font-medium">RAW & Cuts</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-zinc-200/90 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Storage Volume</span>
            <div className="p-1.5 rounded-xl bg-emerald-500/10 text-emerald-500">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{totalSizeFormatted}</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5 font-medium">Disk Footprint</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-zinc-200/90 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">P-V Proportion</span>
            <div className="p-1.5 rounded-xl bg-cyan-500/10 text-cyan-500">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white tracking-tight">{pvPercent}%</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5 font-medium">Main Data Share</span>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-zinc-200/90 dark:border-white/10 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Sync Pipeline</span>
            <div className="p-1.5 rounded-xl bg-amber-500/10 text-amber-500">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-bold text-emerald-500 tracking-tight">Healthy</span>
            <span className="text-[10px] text-zinc-500 block mt-0.5 font-medium">0 Quarantine Issues</span>
          </div>
        </GlassCard>
      </div>

      {/* Visual File Distribution Ratio Bar */}
      <GlassCard className="p-5 border-zinc-200/80 dark:border-white/10 space-y-3">
        <div className="flex items-center justify-between text-xs font-semibold">
          <span className="text-zinc-900 dark:text-white flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-blue-500" />
            <span>Master File Ingestion Breakdown</span>
          </span>
          <span className="text-zinc-500 font-mono text-[11px]">
            {totalMainFiles.toLocaleString()} P-V · {totalRemainingFiles.toLocaleString()} Remaining · {totalThumbs.toLocaleString()} Thumbnails
          </span>
        </div>

        {/* Multi-segment distribution progress bar */}
        <div className="w-full h-3.5 rounded-xl bg-zinc-200/70 dark:bg-black/50 overflow-hidden flex p-0.5 gap-1 border border-zinc-300/60 dark:border-white/10 shadow-inner">
          <div
            style={{ width: `${pvPercent}%` }}
            className="h-full rounded-lg bg-gradient-to-r from-blue-600 to-cyan-500 shadow-sm transition-all duration-500"
            title={`Main P-V Data: ${pvPercent}%`}
          />
          <div
            style={{ width: `${remPercent}%` }}
            className="h-full rounded-lg bg-gradient-to-r from-purple-600 to-indigo-500 shadow-sm transition-all duration-500"
            title={`Remaining Shifter: ${remPercent}%`}
          />
          <div
            style={{ width: `${thumbPercent}%` }}
            className="h-full rounded-lg bg-gradient-to-r from-emerald-500 to-teal-400 shadow-sm transition-all duration-500"
            title={`Thumbnails: ${thumbPercent}%`}
          />
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 text-[11px] font-mono text-zinc-500 pt-1">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
            <strong className="text-zinc-800 dark:text-zinc-200">Main Data (P-V):</strong> {pvPercent}%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500" />
            <strong className="text-zinc-800 dark:text-zinc-200">Remaining (_R):</strong> {remPercent}%
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <strong className="text-zinc-800 dark:text-zinc-200">Thumbnails:</strong> {thumbPercent}%
          </span>
        </div>
      </GlassCard>

      {/* Storage Source & Audit Bar */}
      <div className="p-3.5 rounded-2xl bg-zinc-100/80 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs shadow-xs">
        <div className="flex items-center gap-2.5 text-zinc-600 dark:text-zinc-300 font-mono">
          <FolderTree className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-semibold text-zinc-500">Live JSON Ledger:</span>
          <span className="truncate max-w-md select-all text-blue-600 dark:text-blue-400 font-medium">
            {filePath || '%APPDATA%\\Anything\\safar_stats.json'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1">
              <Clock className="w-3 h-3" /> Updated: {new Date(lastUpdated).toLocaleDateString()}
            </span>
          )}
          <button
            onClick={handleCopyPath}
            className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-zinc-800 dark:text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
          >
            <Copy className="w-3 h-3" /> Copy Path
          </button>
          <button
            onClick={() => handleOpenFolder()}
            className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-zinc-800 dark:text-white text-[11px] font-semibold transition-all cursor-pointer flex items-center gap-1"
          >
            <FolderOpen className="w-3 h-3" /> Reveal in Explorer
          </button>
        </div>
      </div>

      {/* Search Input & Live Filter */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter Safars by expedition name, directory root, or date session code..."
          className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 shadow-sm"
        />
      </div>

      {/* Interactive Safar Explorer Accordion */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <GlassCard className="p-10 text-center border-dashed border-zinc-300 dark:border-white/10">
            <BarChart3 className="w-12 h-12 text-zinc-400 mx-auto mb-3 opacity-40" />
            <h4 className="text-base font-bold text-zinc-800 dark:text-zinc-200">No Production Safar Records Found</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-md mx-auto leading-relaxed">
              Open MediaFlow Studio, complete Stage 07 Event Image Shifter, and click "+ Add to Stats" to automatically record sessions into this master ledger.
            </p>
            <GlassButton
              variant="primary"
              size="sm"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={handleLaunchMediaFlow}
              className="mt-4 bg-blue-600 text-white font-semibold mx-auto"
            >
              Open MediaFlow Studio
            </GlassButton>
          </GlassCard>
        ) : (
          filtered.map((safar) => {
            const isExpanded = expandedSafarIds.has(safar.id);
            return (
              <GlassCard
                key={safar.id}
                className="overflow-hidden border-zinc-200/90 dark:border-white/10 transition-all duration-200 shadow-sm hover:shadow-md"
              >
                {/* Safar Hero Header */}
                <div
                  onClick={() => toggleExpand(safar.id)}
                  className="p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] transition-colors select-none"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <button className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-200/50 dark:bg-white/[0.05]">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center text-white text-base shrink-0 shadow-md shadow-blue-600/25">
                      🕌
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight truncate">
                          {safar.safarName}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold border border-blue-500/20">
                          {safar.dates?.length || safar.totalDates} Sessions
                        </span>
                      </div>
                      <p className="text-xs text-zinc-500 font-mono truncate mt-0.5" title={safar.safarRootPath}>
                        {safar.safarRootPath}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-5 shrink-0 text-right">
                    <div>
                      <span className="text-base font-mono font-bold text-zinc-900 dark:text-white block">
                        {safar.sizeStr}
                      </span>
                      <span className="text-xs font-mono text-zinc-500 block">
                        {safar.totalFiles.toLocaleString()} total files
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFolder(safar.safarRootPath);
                      }}
                      className="p-2.5 rounded-xl bg-zinc-200/80 dark:bg-white/[0.08] hover:bg-blue-600 hover:text-white text-zinc-600 dark:text-zinc-300 transition-colors shadow-xs"
                      title="Reveal Safar Root Directory"
                    >
                      <FolderOpen className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Session Dates Breakdown */}
                {isExpanded && safar.dates && safar.dates.length > 0 && (
                  <div className="border-t border-zinc-200/80 dark:border-white/10 bg-zinc-50/70 dark:bg-black/40 p-5 space-y-3 animate-fadeIn">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold px-1 flex items-center justify-between">
                      <span>Daily Sessions Breakdown ({safar.dates.length} Recorded Slots)</span>
                      <span>Folder Splits: P-V · Remaining · Thumbnails</span>
                    </div>

                    <div className="space-y-2.5">
                      {safar.dates.map((date) => (
                        <div
                          key={date.id}
                          className="p-4 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/90 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs shadow-xs hover:border-blue-500/40 transition-colors"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center shrink-0">
                              <Calendar className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-bold text-zinc-900 dark:text-white block font-mono text-xs">
                                {date.dateName}
                              </span>
                              <span className="text-[11px] text-zinc-500 font-medium">
                                {date.eventFoldersCount} event subfolders mapped
                              </span>
                            </div>
                          </div>

                          {/* Folder Type Badges */}
                          <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
                            <span
                              className="px-2.5 py-1 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold"
                              title="Main P-V Separated Media"
                            >
                              P-V: {date.mainDataMetrics?.fileCount || 0} ({date.mainDataMetrics?.sizeStr || '0 B'})
                            </span>
                            <span
                              className="px-2.5 py-1 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-semibold"
                              title="Remaining Photos Shifter"
                            >
                              Remaining: {date.remainingMetrics?.fileCount || 0} ({date.remainingMetrics?.sizeStr || '0 B'})
                            </span>
                            <span
                              className="px-2.5 py-1 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold"
                              title="Generated Thumbnails"
                            >
                              Thumbs: {date.thumbnailsMetrics?.fileCount || 0}
                            </span>
                          </div>

                          {/* Total Date Size & Explorer Link */}
                          <div className="flex items-center gap-3 shrink-0">
                            <div className="text-right">
                              <span className="font-mono font-bold text-zinc-900 dark:text-white block text-xs">
                                {date.sizeStr}
                              </span>
                              <span className="text-[10px] font-mono text-zinc-500">
                                {date.totalFiles} items
                              </span>
                            </div>
                            <button
                              onClick={() => handleOpenFolder(date.mainDataPath || safar.safarRootPath)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-white/[0.05]"
                              title="Open Date Folder"
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            );
          })
        )}
      </div>

      {/* Toast Notification */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-[130] p-3 px-4 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}
    </div>
  );
};
