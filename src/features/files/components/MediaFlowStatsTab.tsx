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
  AlertCircle,
  Clock,
  Download,
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';

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
    ],
  },
];

export const MediaFlowStatsTab: React.FC = () => {
  const [records, setRecords] = useState<SafarStatRecord[]>([]);
  const [filePath, setFilePath] = useState<string>('');
  const [exists, setExists] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedSafarIds, setExpandedSafarIds] = useState<Set<string>>(new Set());
  const [useDemo, setUseDemo] = useState<boolean>(false);

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
          // Fall back to demo data preview if no stats collected yet
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
  const totalBytes = records.reduce((acc, r) => acc + (r.totalBytes || 0), 0);
  const totalSizeFormatted =
    totalBytes > 1024 * 1024 * 1024 * 1024
      ? `${(totalBytes / (1024 * 1024 * 1024 * 1024)).toFixed(2)} TB`
      : `${(totalBytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;

  return (
    <div className="space-y-6">
      {/* Header & Ecosystem Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-cyan-500/25">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              MediaFlow Production & Safar Telemetry
            </h2>
            {useDemo && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
                Demo Preview Mode
              </span>
            )}
            {!useDemo && exists && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Hub Sync
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Aggregated metrics recorded by MediaFlow Studio's Stage 07 Event Image Shifter and Stats Manager.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <GlassButton
            variant="glass"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />}
            onClick={loadStats}
          >
            Refresh
          </GlassButton>

          <GlassButton
            variant="primary"
            size="sm"
            icon={<ExternalLink className="w-3.5 h-3.5" />}
            onClick={handleLaunchMediaFlow}
            className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/20"
          >
            Launch MediaFlow Studio
          </GlassButton>
        </div>
      </div>

      {/* Hero Aggregate Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3.5">
        <GlassCard className="p-4 border-zinc-200 dark:border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
            <Layers className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Total Safars</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{totalSafars}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-zinc-200 dark:border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Processed Dates</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{totalDates}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-zinc-200 dark:border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shrink-0">
            <Camera className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Master Files</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{totalFiles.toLocaleString()}</p>
          </div>
        </GlassCard>

        <GlassCard className="p-4 border-zinc-200 dark:border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shrink-0">
            <HardDrive className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">Studio Footprint</p>
            <p className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">{totalSizeFormatted}</p>
          </div>
        </GlassCard>
      </div>

      {/* Storage Location Information Banner */}
      <div className="p-3.5 rounded-2xl bg-zinc-100/70 dark:bg-zinc-900/60 border border-zinc-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-300 font-mono">
          <FolderTree className="w-4 h-4 text-blue-500 shrink-0" />
          <span className="font-semibold text-zinc-500">Source:</span>
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
            onClick={() => handleOpenFolder()}
            className="px-2.5 py-1 rounded-lg bg-zinc-200 dark:bg-white/10 hover:bg-zinc-300 dark:hover:bg-white/20 text-zinc-800 dark:text-white text-[11px] font-semibold transition-all cursor-pointer"
          >
            Reveal Folder
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Filter Safars by expedition name, folder path, or date code..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40"
        />
      </div>

      {/* Safar Records Accordion List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <GlassCard className="p-8 text-center border-dashed border-zinc-300 dark:border-white/10">
            <BarChart3 className="w-10 h-10 text-zinc-400 mx-auto mb-2 opacity-50" />
            <h4 className="text-sm font-bold text-zinc-700 dark:text-zinc-300">No Safar Records Found</h4>
            <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
              Launch MediaFlow Studio, complete Stage 07 Event Image Shifter, and click "+ Add to Stats" to stream production records here.
            </p>
          </GlassCard>
        ) : (
          filtered.map((safar) => {
            const isExpanded = expandedSafarIds.has(safar.id);
            return (
              <GlassCard
                key={safar.id}
                className="overflow-hidden border-zinc-200/90 dark:border-white/10 transition-all duration-200"
              >
                {/* Safar Header Bar */}
                <div
                  onClick={() => toggleExpand(safar.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-100/50 dark:hover:bg-white/[0.02] transition-colors select-none"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <button className="p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white">
                      {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                    </button>
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                      🕌
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                          {safar.safarName}
                        </h3>
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-mono bg-blue-500/10 text-blue-600 dark:text-blue-400 font-semibold border border-blue-500/20">
                          {safar.dates?.length || safar.totalDates} Dates
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-500 font-mono truncate mt-0.5" title={safar.safarRootPath}>
                        {safar.safarRootPath}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-right">
                    <div>
                      <span className="text-xs font-mono font-bold text-zinc-900 dark:text-white block">
                        {safar.sizeStr}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 block">
                        {safar.totalFiles.toLocaleString()} files
                      </span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleOpenFolder(safar.safarRootPath);
                      }}
                      className="p-2 rounded-xl bg-zinc-200/70 dark:bg-white/[0.08] hover:bg-blue-600 hover:text-white text-zinc-600 dark:text-zinc-300 transition-colors"
                      title="Open Safar Root Folder in Explorer"
                    >
                      <Folder className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Dates Table */}
                {isExpanded && safar.dates && safar.dates.length > 0 && (
                  <div className="border-t border-zinc-200 dark:border-white/10 bg-zinc-50/50 dark:bg-black/30 p-4 space-y-2.5 animate-fadeIn">
                    <div className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-bold px-1 flex items-center justify-between">
                      <span>Date Slot Breakdown ({safar.dates.length} sessions)</span>
                      <span>Metrics: P-V · Remaining · Thumbnails</span>
                    </div>

                    <div className="space-y-2">
                      {safar.dates.map((date) => (
                        <div
                          key={date.id}
                          className="p-3.5 rounded-xl bg-white dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs"
                        >
                          <div className="flex items-center gap-2.5 min-w-0">
                            <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                            <div>
                              <span className="font-bold text-zinc-900 dark:text-white block font-mono">
                                {date.dateName}
                              </span>
                              <span className="text-[10px] text-zinc-500 font-medium">
                                {date.eventFoldersCount} event folders matched
                              </span>
                            </div>
                          </div>

                          {/* Folder Type Badges */}
                          <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
                            <span className="px-2 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 font-semibold" title="Main PV Separated Data">
                              P-V: {date.mainDataMetrics?.fileCount || 0} ({date.mainDataMetrics?.sizeStr || '0 B'})
                            </span>
                            <span className="px-2 py-1 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 font-semibold" title="Remaining Shifter Photos">
                              Remaining: {date.remainingMetrics?.fileCount || 0} ({date.remainingMetrics?.sizeStr || '0 B'})
                            </span>
                            <span className="px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-semibold" title="Thumbnails Shifted">
                              Thumbs: {date.thumbnailsMetrics?.fileCount || 0}
                            </span>
                          </div>

                          {/* Total Date Size */}
                          <div className="text-right shrink-0">
                            <span className="font-mono font-bold text-zinc-900 dark:text-white block">
                              {date.sizeStr}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500">
                              {date.totalFiles} items
                            </span>
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
    </div>
  );
};

