import React, { useEffect, useState, useCallback } from 'react';
import { Folder, RefreshCw, ExternalLink, Film, Image as ImageIcon, Search, CheckCircle2, AlertCircle, HardDrive } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { useTheme } from '../../../context/ThemeContext';

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

export const OneTapTitlesTab: React.FC<{ searchQuery?: string }> = ({ searchQuery = '' }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [data, setData] = useState<FinalTitlesData | null>(null);
  const [loading, setLoading] = useState(false);
  const [filterText, setFilterText] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      // Support both window.electron.ipcRenderer and window.electronAPI
      const electronAPI = (window as any).electronAPI;
      const ipc = (window as any).electron?.ipcRenderer;

      let res: any = null;
      if (electronAPI?.oneTapGetFinalTitles) {
        res = await electronAPI.oneTapGetFinalTitles();
      } else if (ipc?.invoke) {
        res = await ipc.invoke('onetap:get-final-titles');
      }

      if (res) {
        setData(res);
      }
    } catch (err: any) {
      console.warn('Failed to load One Tap Final Titles:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleChangeFolder = async () => {
    try {
      const electronAPI = (window as any).electronAPI;
      const ipc = (window as any).electron?.ipcRenderer;

      let res: any = null;
      if (electronAPI?.oneTapSelectFinalTitlesFolder) {
        res = await electronAPI.oneTapSelectFinalTitlesFolder();
      } else if (ipc?.invoke) {
        res = await ipc.invoke('onetap:select-final-titles-folder');
      }

      if (res?.success) {
        setFeedback('Linked Final Titles folder updated.');
        setTimeout(() => setFeedback(null), 4000);
        loadData();
      }
    } catch (err) {
      console.warn('Failed to select folder:', err);
    }
  };

  const handleOpenFolder = () => {
    const electronAPI = (window as any).electronAPI;
    const ipc = (window as any).electron?.ipcRenderer;
    if (electronAPI?.oneTapOpenFinalTitlesFolder) {
      electronAPI.oneTapOpenFinalTitlesFolder(data?.folderPath);
    } else if (ipc?.invoke) {
      ipc.invoke('onetap:open-final-titles-folder', data?.folderPath);
    }
  };

  const handleReveal = (filePath: string) => {
    const electronAPI = (window as any).electronAPI;
    const ipc = (window as any).electron?.ipcRenderer;
    if (electronAPI?.oneTapRevealFile) {
      electronAPI.oneTapRevealFile(filePath);
    } else if (ipc?.invoke) {
      ipc.invoke('onetap:reveal-file', filePath);
    }
  };

  const effectiveFilter = (filterText || searchQuery).toLowerCase();
  const allFiles = data?.files || [];
  const filteredFiles = allFiles.filter((f: FinalTitleFile) =>
    !effectiveFilter || f.name.toLowerCase().includes(effectiveFilter)
  );

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Linked Folder Bar */}
      <GlassCard
        variant="interactive"
        className={`p-5 rounded-2xl border transition-all ${
          isLight
            ? 'bg-white/80 border-zinc-200/90 shadow-sm'
            : 'bg-zinc-900/60 border-white/10 shadow-xl'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border ${
                isLight
                  ? 'bg-sky-50 border-sky-200 text-sky-600 shadow-sm'
                  : 'bg-sky-500/10 border-sky-500/20 text-sky-400'
              }`}
            >
              <Folder className="w-6 h-6" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
                  LINKED FINAL TITLES FOLDER
                </span>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1.5 ${
                    data?.isOneTapRunning
                      ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                      : isLight
                      ? 'bg-zinc-200/80 text-zinc-700 border border-zinc-300'
                      : 'bg-zinc-800 text-zinc-400 border border-zinc-700'
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      data?.isOneTapRunning ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-400'
                    }`}
                  />
                  {data?.isOneTapRunning ? 'Live Sync (One Tap Online)' : 'Direct Disk (One Tap Closed)'}
                </span>
              </div>

              <div
                className="text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate mt-0.5 select-all font-mono"
                title={data?.folderPath}
              >
                {data?.folderPath || 'No folder linked'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto justify-end">
            <GlassButton
              variant="accent"
              size="sm"
              onClick={handleChangeFolder}
              className="text-xs font-semibold text-sky-600 dark:text-sky-300 border-sky-500/30"
            >
              Change Folder
            </GlassButton>

            <GlassButton
              variant="glass"
              size="sm"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={handleOpenFolder}
              className="text-xs font-semibold"
            >
              Open Folder
            </GlassButton>

            <GlassButton
              variant="glass"
              size="sm"
              onClick={loadData}
              title="Refresh directory"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-sky-500' : ''}`} />
            </GlassButton>
          </div>
        </div>

        {feedback && (
          <div className="mt-3.5 pt-3 border-t border-zinc-200/60 dark:border-white/5 flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <CheckCircle2 className="w-4 h-4" />
            <span>{feedback}</span>
          </div>
        )}
      </GlassCard>

      {/* Stats Summary Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div
          className={`p-4 rounded-2xl border transition-all ${
            isLight
              ? 'bg-white/70 border-zinc-200/80 shadow-sm'
              : 'bg-zinc-900/40 border-white/5'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400">
            <span>Total Files</span>
            <HardDrive className="w-4 h-4 text-zinc-400" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-1">
            {data?.totalCount ?? 0}
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isLight
              ? 'bg-sky-50/50 border-sky-200/80 shadow-sm'
              : 'bg-sky-500/5 border-sky-500/15'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-sky-600 dark:text-sky-400 font-medium">
            <span>Final Videos</span>
            <Film className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-sky-600 dark:text-sky-400 mt-1">
            {data?.stats?.videos ?? 0}
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isLight
              ? 'bg-amber-50/50 border-amber-200/80 shadow-sm'
              : 'bg-amber-500/5 border-amber-500/15'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-amber-600 dark:text-amber-400 font-medium">
            <span>Title Images</span>
            <ImageIcon className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">
            {data?.stats?.images ?? 0}
          </div>
        </div>

        <div
          className={`p-4 rounded-2xl border transition-all ${
            isLight
              ? 'bg-emerald-50/50 border-emerald-200/80 shadow-sm'
              : 'bg-emerald-500/5 border-emerald-500/15'
          }`}
        >
          <div className="flex items-center justify-between text-xs text-emerald-600 dark:text-emerald-400 font-medium">
            <span>Total Volume</span>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-emerald-500/10">Disk</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
            {data?.stats?.totalSizeFormatted ?? '0 MB'}
          </div>
        </div>
      </div>

      {/* Search Input Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-zinc-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Filter Final Title assets by prefix or keyword (e.g. Z, QMZ, Nikah, mp4, png)..."
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
          className={`w-full rounded-xl pl-10 pr-4 py-2.5 text-xs font-medium transition-all outline-none ${
            isLight
              ? 'bg-white border border-zinc-200 text-zinc-900 placeholder-zinc-400 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 shadow-sm'
              : 'bg-zinc-900/60 border border-white/10 text-white placeholder-zinc-500 focus:border-sky-500/50 focus:ring-2 focus:ring-sky-500/20'
          }`}
        />
        {filterText && (
          <button
            onClick={() => setFilterText('')}
            className="absolute right-3 top-2.5 text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 font-semibold"
          >
            Clear
          </button>
        )}
      </div>

      {/* Files List / Card View */}
      <div className="space-y-2">
        {filteredFiles.length === 0 ? (
          <div
            className={`p-12 text-center rounded-2xl border border-dashed transition-all ${
              isLight
                ? 'bg-zinc-50/70 border-zinc-300 text-zinc-500'
                : 'bg-zinc-900/30 border-white/10 text-zinc-400'
            }`}
          >
            {loading ? (
              <div className="flex flex-col items-center gap-3">
                <RefreshCw className="w-6 h-6 animate-spin text-sky-500" />
                <span className="text-xs font-semibold">Scanning One Tap Final Titles directory...</span>
              </div>
            ) : data && !data.exists ? (
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="w-7 h-7 text-amber-500" />
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  Titles folder does not exist on disk
                </p>
                <p className="text-xs text-zinc-500 max-w-sm">
                  The linked folder <span className="font-mono">{data.folderPath}</span> was not found. Click &quot;Change Folder&quot; above to select your Final Titles location.
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <Film className="w-7 h-7 text-zinc-400 opacity-60" />
                <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                  No title files found
                </p>
                <p className="text-xs text-zinc-500">
                  {filterText
                    ? `No assets matched "${filterText}". Try a different filter.`
                    : 'The linked Final Titles folder is currently empty.'}
                </p>
              </div>
            )}
          </div>
        ) : (
          filteredFiles.map((file: FinalTitleFile) => (
            <div
              key={file.path}
              className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-4 ${
                isLight
                  ? 'bg-white/80 border-zinc-200/90 hover:bg-zinc-50/90 hover:border-zinc-300 shadow-xs'
                  : 'bg-zinc-900/40 border-white/5 hover:bg-zinc-800/40 hover:border-white/10'
              }`}
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                    file.type === 'video'
                      ? isLight
                        ? 'bg-sky-50 border-sky-200 text-sky-600'
                        : 'bg-sky-500/10 border-sky-500/20 text-sky-400'
                      : isLight
                      ? 'bg-amber-50 border-amber-200 text-amber-600'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}
                >
                  {file.type === 'video' ? <Film className="w-5 h-5" /> : <ImageIcon className="w-5 h-5" />}
                </div>

                <div className="min-w-0">
                  <div
                    className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate font-mono"
                    title={file.name}
                  >
                    {file.name}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                    <span className="font-semibold">{file.sizeFormatted}</span>
                    <span>•</span>
                    <span>Modified {file.mtimeFormatted}</span>
                    <span className="uppercase text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                      {file.extension?.replace('.', '') || file.type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <GlassButton
                  variant="glass"
                  size="sm"
                  icon={<ExternalLink className="w-3.5 h-3.5 text-zinc-400" />}
                  onClick={() => handleReveal(file.path)}
                  className="text-xs font-semibold"
                  title="Reveal file in Windows Explorer"
                >
                  Reveal ↗
                </GlassButton>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
