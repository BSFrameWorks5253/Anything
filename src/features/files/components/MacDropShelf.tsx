import React, { useState, useEffect, useRef } from 'react';
import {
  Download,
  Trash2,
  QrCode,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Plus,
  RefreshCw,
  Sparkles,
  Smartphone,
  CheckCircle2,
  Eye,
  X,
  ExternalLink,
  Layers,
  ArrowDownToLine,
  Share2,
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import { AnythingLogoAssemblyAnimation } from '../../../components/ui/AnythingLogoAssemblyAnimation';

export interface ShelfItem {
  id: string;
  name: string;
  size: number;
  sizeFormatted: string;
  mimeType: string;
  isImage: boolean;
  createdAt: string;
  filePath: string;
}

export interface ShareServerInfo {
  isRunning: boolean;
  port: number;
  localIp: string;
  shareUrl: string;
  qrDataUrl: string;
  totalItems: number;
}

export const MacDropShelf: React.FC = () => {
  const [items, setItems] = useState<ShelfItem[]>([]);
  const [serverInfo, setServerInfo] = useState<ShareServerInfo | null>(null);
  const [isQrOpen, setIsQrOpen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewItem, setPreviewItem] = useState<ShelfItem | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [animState, setAnimState] = useState<{
    isOpen: boolean;
    mode: 'upload' | 'download';
    title?: string;
    subtitle?: string;
    itemCount: number;
    totalSizeFormatted: string;
  }>({
    isOpen: false,
    mode: 'upload',
    itemCount: 0,
    totalSizeFormatted: '0 MB',
  });

  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Load items and initialize local sharing server
  const loadShelf = async () => {
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.fileShelfGetItems) {
        const list = await electronAPI.fileShelfGetItems();
        setItems(list || []);
      }
      if (electronAPI?.fileShelfGetServerInfo) {
        const info = await electronAPI.fileShelfGetServerInfo();
        setServerInfo(info);
      }
    } catch (err) {
      console.warn('[DropShelf] Failed to load shelf:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShelf();

    const electronAPI = (window as any).electronAPI;
    let unsubUpdate: (() => void) | undefined;
    let unsubReceived: (() => void) | undefined;

    if (electronAPI?.onFileShelfUpdated) {
      unsubUpdate = electronAPI.onFileShelfUpdated((updated: ShelfItem[]) => {
        setItems(updated || []);
      });
    }

    if (electronAPI?.onFileShelfItemReceived) {
      unsubReceived = electronAPI.onFileShelfItemReceived((newItem: ShelfItem) => {
        setFeedback(`📱 Photo received from Phone: ${newItem.name}`);
        setTimeout(() => setFeedback(null), 4000);
      });
    }

    return () => {
      if (unsubUpdate) unsubUpdate();
      if (unsubReceived) unsubReceived();
    };
  }, []);

  // Handle Drag & Drop over Shelf
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const electronAPI = (window as any).electronAPI;
    const droppedFiles = Array.from(e.dataTransfer.files);

    if (droppedFiles.length === 0) return;
    const totalBytesDropped = droppedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    const dropSizeFormatted = totalBytesDropped > 1024 * 1024 ? `${(totalBytesDropped / (1024 * 1024)).toFixed(1)} MB` : `${Math.round(totalBytesDropped / 1024)} KB`;
    setAnimState({
      isOpen: true,
      mode: 'upload',
      title: 'Assembling Staged Assets into Hub',
      subtitle: `Staging ${droppedFiles.length} item(s) (${dropSizeFormatted}) into Studio Drop Shelf`,
      itemCount: droppedFiles.length,
      totalSizeFormatted: dropSizeFormatted,
    });

    // In Electron, dropped files carry a physical 'path' property
    const paths = droppedFiles
      .map((f: any) => f.path)
      .filter((p): p is string => Boolean(p && typeof p === 'string'));

    if (paths.length > 0 && electronAPI?.fileShelfAddFiles) {
      const res = await electronAPI.fileShelfAddFiles(paths);
      if (res?.success) {
        setFeedback(`✓ Added ${res.added.length} item(s) to Drop Shelf`);
        setTimeout(() => setFeedback(null), 3000);
      }
    } else {
      // Browser fallback (base64 or dummy)
      const mockItems: ShelfItem[] = droppedFiles.map((f, i) => ({
        id: `local_${Date.now()}_${i}`,
        name: f.name,
        size: f.size,
        sizeFormatted: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        mimeType: f.type || 'image/jpeg',
        isImage: f.type?.startsWith('image/') || f.name.match(/\.(png|jpe?g|webp|gif|svg)$/i) !== null,
        createdAt: new Date().toISOString(),
        filePath: '',
      }));
      setItems((prev) => [...mockItems, ...prev]);
      setFeedback(`✓ Staged ${mockItems.length} item(s) on Drop Shelf`);
      setTimeout(() => setFeedback(null), 3000);
    }
  };

  const handleSelectFiles = async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.fileShelfSelectFiles) {
      const res = await electronAPI.fileShelfSelectFiles();
      if (res?.success && res.added?.length > 0) {
        setFeedback(`✓ Added ${res.added.length} file(s) to Drop Shelf`);
        setTimeout(() => setFeedback(null), 3000);
      }
    }
  };

  const handleDownloadItem = async (item: ShelfItem) => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.fileShelfSaveItemToDisk) {
      const res = await electronAPI.fileShelfSaveItemToDisk(item.id);
      if (res?.success) {
        setFeedback(`✓ Saved to ${res.savedPath}`);
        setTimeout(() => setFeedback(null), 3500);
      }
    } else if (serverInfo?.shareUrl) {
      // Web anchor download
      const downloadLink = `http://${serverInfo.localIp}:${serverInfo.port}/download/${item.id}`;
      const a = document.createElement('a');
      a.href = downloadLink;
      a.download = item.name;
      a.click();
    }
  };

  const handleDownloadAll = async () => {
    setAnimState({
      isOpen: true,
      mode: 'download',
      title: 'Streaming Staged Assets to Disk',
      subtitle: `Exporting ${items.length} file(s) (${totalSizeFormatted}) at native bus speed`,
      itemCount: items.length,
      totalSizeFormatted,
    });
    for (const it of items) {
      await handleDownloadItem(it);
    }
  };

  const handleRemoveItem = async (id: string) => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.fileShelfRemoveItem) {
      await electronAPI.fileShelfRemoveItem(id);
    } else {
      setItems((prev) => prev.filter((it) => it.id !== id));
    }
  };

  const handleClearShelf = async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.fileShelfClear) {
      await electronAPI.fileShelfClear();
    } else {
      setItems([]);
    }
  };

  const handleOpenItem = async (id: string) => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.fileShelfOpenItem) {
      await electronAPI.fileShelfOpenItem(id);
    }
  };

  const imageCount = items.filter((it) => it.isImage).length;
  const totalSizeBytes = items.reduce((acc, it) => acc + (it.size || 0), 0);
  const totalSizeFormatted =
    totalSizeBytes > 1024 * 1024 * 1024
      ? `${(totalSizeBytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
      : `${(totalSizeBytes / (1024 * 1024)).toFixed(1)} MB`;

  return (
    <div className="space-y-5">
      {/* Shelf Header & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25">
              <Layers className="w-4 h-4" />
            </div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
              Universal Drop Shelf & Mobile Gateway
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              {items.length} {items.length === 1 ? 'Staged Asset' : 'Staged Assets'} · {totalSizeFormatted}
            </span>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Stage media, graphics, and package builds for instant access across your desktop suite and peer-to-peer mobile transfer.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <GlassButton
            variant="glass"
            size="sm"
            icon={<QrCode className="w-3.5 h-3.5 text-indigo-400" />}
            onClick={() => setIsQrOpen(!isQrOpen)}
            className={`font-semibold border-indigo-500/30 text-indigo-600 dark:text-indigo-300 ${
              isQrOpen ? 'bg-indigo-500/15' : ''
            }`}
          >
            {isQrOpen ? 'Hide Mobile Link' : 'Mobile QR Link'}
          </GlassButton>

          <GlassButton
            variant="glass"
            size="sm"
            icon={<Plus className="w-3.5 h-3.5" />}
            onClick={handleSelectFiles}
            title="Browse files from your computer"
          >
            Add Files & Assets
          </GlassButton>

          {items.length > 0 && (
            <>
              <GlassButton
                variant="primary"
                size="sm"
                icon={<ArrowDownToLine className="w-3.5 h-3.5" />}
                onClick={handleDownloadAll}
                className="font-bold bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/20"
                title="Download all staged assets to your local drive"
              >
                Download All ({items.length})
              </GlassButton>

              <GlassButton
                variant="glass"
                size="sm"
                icon={<Trash2 className="w-3.5 h-3.5 text-zinc-400 hover:text-rose-500" />}
                onClick={handleClearShelf}
                title="Clear all items from shelf"
              >
                Clear
              </GlassButton>
            </>
          )}
        </div>
      </div>

      {/* QR Code Sharing Modal / Collapsible Section */}
      {isQrOpen && serverInfo && (
        <GlassCard
          variant="interactive"
          className="p-6 border-indigo-500/30 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent relative overflow-hidden animate-fadeIn rounded-2xl shadow-xl"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-3 max-w-md">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Smartphone className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
                    Instant Peer-to-Peer Mobile Link
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">
                    Direct Wi-Fi pipeline. Works in Safari, Chrome, and any mobile browser without cloud intermediaries.
                  </p>
                </div>
              </div>

              <ul className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 font-medium">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span><strong>Direct Image Downloads:</strong> Preview and save high-resolution studio assets straight to your mobile camera roll.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                  <span><strong>Instant Mobile Ingest:</strong> Snap a photo or choose gallery items on your phone to stream straight onto this shelf.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span><strong>High-Speed Local LAN:</strong> Direct Wi-Fi stream on port {serverInfo.port} without cloud compression or size limits.</span>
                </li>
              </ul>

              <div className="p-2.5 rounded-xl bg-white/70 dark:bg-black/50 border border-zinc-200 dark:border-white/10 font-mono text-xs text-indigo-600 dark:text-indigo-400 break-all select-all font-semibold flex items-center justify-between gap-2">
                <span className="truncate">{serverInfo.shareUrl}</span>
                <GlassButton
                  variant="glass"
                  size="sm"
                  onClick={() => {
                    navigator.clipboard.writeText(serverInfo.shareUrl);
                    setFeedback('✓ URL Copied to clipboard');
                    setTimeout(() => setFeedback(null), 3000);
                  }}
                  className="text-[10px] py-1 px-2 shrink-0"
                >
                  Copy Link
                </GlassButton>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="flex flex-col items-center gap-2 shrink-0 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/15 shadow-xl">
              {serverInfo.qrDataUrl ? (
                <img
                  src={serverInfo.qrDataUrl}
                  alt="Mobile Share QR Code"
                  className="w-48 h-48 rounded-xl object-contain"
                />
              ) : (
                <div className="w-48 h-48 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-xs text-zinc-400">
                  Generating QR...
                </div>
              )}
              <span className="text-[11px] font-mono text-zinc-500 font-semibold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Live Wi-Fi Server: Port {serverInfo.port}
              </span>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Mac-Style Drop Zone Area */}
      <div
        ref={dropZoneRef}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleSelectFiles}
        className={`relative rounded-2xl p-8 border-2 border-dashed transition-all duration-200 ease-out cursor-pointer text-center select-none ${
          isDragging
            ? 'border-blue-500 bg-blue-500/10 scale-[1.01] shadow-2xl shadow-blue-500/20'
            : 'border-zinc-300 dark:border-zinc-700/80 bg-zinc-100/50 dark:bg-zinc-900/40 hover:border-blue-400/80 hover:bg-zinc-100/80 dark:hover:bg-zinc-900/60'
        }`}
      >
        <div className="flex flex-col items-center justify-center gap-2.5 max-w-sm mx-auto pointer-events-none">
          <div
            className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-transform duration-200 ${
              isDragging
                ? 'scale-110 bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
            }`}
          >
            <ArrowDownToLine className="w-7 h-7" />
          </div>

          <div>
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              {isDragging ? 'Release to Stage Assets on Shelf' : 'Drop Images, Videos & Files onto Shelf'}
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
              Drag & drop high-res photos, 4K clips, PSDs, production graphics, or documents from any application or folder
            </p>
          </div>

          {/* Supported format pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
            {['PNG', 'JPG', 'MP4', 'WAV', 'PSD', 'PDF', 'ZIP'].map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-zinc-200/70 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border border-zinc-300/50 dark:border-white/10"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Shelf Staged Items Gallery */}
      {items.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-bold">
            <span>Staged Production Assets ({items.length})</span>
            <span>{imageCount} High-Res Assets Ready</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
            {items.map((item) => {
              const previewSrc = serverInfo?.shareUrl
                ? `http://${serverInfo.localIp}:${serverInfo.port}/preview/${item.id}`
                : undefined;

              return (
                <div
                  key={item.id}
                  className="group relative rounded-2xl bg-white/80 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-white/10 overflow-hidden shadow-sm hover:shadow-xl hover:border-blue-500/50 transition-all duration-200 flex flex-col"
                >
                  {/* Thumbnail / File Icon Area */}
                  <div
                    onClick={() => (item.isImage ? setPreviewItem(item) : handleOpenItem(item.id))}
                    className="w-full h-32 bg-zinc-100 dark:bg-black/50 relative overflow-hidden flex items-center justify-center cursor-pointer group-hover:opacity-95"
                  >
                    {item.isImage && previewSrc ? (
                      <img
                        src={previewSrc}
                        alt={item.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex flex-col items-center gap-1.5 text-zinc-400">
                        {item.isImage ? <ImageIcon className="w-8 h-8 text-blue-500" /> : <FileText className="w-8 h-8 text-indigo-400" />}
                        <span className="text-[10px] font-mono uppercase font-bold text-zinc-500">
                          {item.name.split('.').pop() || 'FILE'}
                        </span>
                      </div>
                    )}

                    {/* Image overlay hover quick look */}
                    {item.isImage && (
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                        <span className="p-2 rounded-xl bg-white/90 text-zinc-900 shadow-md">
                          <Eye className="w-4 h-4" />
                        </span>
                      </div>
                    )}

                    {/* Delete shelf item cross */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveItem(item.id);
                      }}
                      className="absolute top-2 right-2 w-6 h-6 rounded-lg bg-black/60 hover:bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-md cursor-pointer"
                      title="Remove from Shelf"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Body & Download Button */}
                  <div className="p-3 flex flex-col gap-1.5 flex-1">
                    <h4
                      className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate cursor-pointer hover:underline"
                      title={item.name}
                      onClick={() => handleOpenItem(item.id)}
                    >
                      {item.name}
                    </h4>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      {item.sizeFormatted}
                    </span>

                    <button
                      onClick={() => handleDownloadItem(item)}
                      className="mt-auto w-full py-1.5 px-2 rounded-xl bg-blue-600 hover:bg-blue-500 active:scale-[0.98] text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
                      title="Download or save to PC"
                    >
                      <Download className="w-3 h-3" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lightbox Modal for Quick Look */}
      {previewItem && (
        <div
          onClick={() => setPreviewItem(null)}
          className="fixed inset-0 z-[120] flex items-center justify-center bg-black/85 backdrop-blur-md p-4 animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-4xl max-h-[90vh] bg-zinc-900 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="flex items-center justify-between p-4 border-b border-white/10 text-white">
              <div className="flex items-center gap-2">
                <ImageIcon className="w-4 h-4 text-blue-400" />
                <span className="text-sm font-bold truncate max-w-md">{previewItem.name}</span>
                <span className="text-xs text-zinc-400 font-mono">({previewItem.sizeFormatted})</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleDownloadItem(previewItem)}
                  className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 cursor-pointer shadow-md"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Image</span>
                </button>
                <button
                  onClick={() => setPreviewItem(null)}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="p-4 flex items-center justify-center overflow-auto max-h-[75vh]">
              <img
                src={
                  serverInfo?.shareUrl
                    ? `http://${serverInfo.localIp}:${serverInfo.port}/preview/${previewItem.id}`
                    : ''
                }
                alt={previewItem.name}
                className="max-w-full max-h-[70vh] rounded-xl object-contain shadow-2xl"
              />
            </div>
          </div>
        </div>
      )}

      {/* Toast Feedback */}
      {feedback && (
        <div className="fixed bottom-6 right-6 z-[130] p-3 px-4 rounded-2xl bg-emerald-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-bounce">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}
      <AnythingLogoAssemblyAnimation
        isOpen={animState.isOpen}
        mode={animState.mode}
        title={animState.title}
        subtitle={animState.subtitle}
        itemCount={animState.itemCount}
        totalSizeFormatted={animState.totalSizeFormatted}
        onComplete={() => setAnimState((prev) => ({ ...prev, isOpen: false }))}
      />
    </div>
  );
};

