import React, { useState } from 'react';
import { UploadCloud, FileUp, Sparkles } from 'lucide-react';
import type { CloudFileItem } from '../../../types/app.types';
import { GlassCard } from '../../../components/ui/GlassCard';

interface FileDropZoneProps {
  onFilesDropped: (newFiles: CloudFileItem[]) => void;
}

export const FileDropZone: React.FC<FileDropZoneProps> = ({ onFilesDropped }) => {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const processFileList = (files: FileList) => {
    const newItems: CloudFileItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const ext = file.name.split('.').pop()?.toLowerCase() || '';

      // Determine app badge based on extension
      let appShort = 'Doc';
      let appGradient = 'from-slate-600 to-slate-800';
      let appTextColor = '#ffffff';

      if (['psd', 'psb', 'png', 'jpg', 'jpeg', 'webp'].includes(ext)) {
        appShort = 'Ps';
        appGradient = 'from-blue-600 to-cyan-400';
        appTextColor = '#38bdf8';
      } else if (['ai', 'eps', 'svg'].includes(ext)) {
        appShort = 'Ai';
        appGradient = 'from-amber-600 to-yellow-400';
        appTextColor = '#fbbf24';
      } else if (['prproj', 'mp4', 'mov', 'mkv'].includes(ext)) {
        appShort = 'Pr';
        appGradient = 'from-violet-700 to-indigo-500';
        appTextColor = '#c084fc';
      } else if (['aep', 'ae'].includes(ext)) {
        appShort = 'Ae';
        appGradient = 'from-indigo-600 to-fuchsia-500';
        appTextColor = '#e879f9';
      }

      const sizeStr =
        file.size > 1024 * 1024 * 1024
          ? `${(file.size / (1024 * 1024 * 1024)).toFixed(1)} GB`
          : `${(file.size / (1024 * 1024)).toFixed(1)} MB`;

      newItems.push({
        id: `upload-${Date.now()}-${i}`,
        name: file.name,
        appShort,
        appGradient,
        appTextColor,
        modified: 'Just now',
        size: sizeStr,
        status: 'synced',
        palette: ['#38bdf8', '#c084fc', '#fbbf24', '#34d399'],
      });
    }

    if (newItems.length > 0) {
      onFilesDropped(newItems);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFileList(e.dataTransfer.files);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFileList(e.target.files);
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className="relative group"
    >
      <input
        type="file"
        multiple
        onChange={handleFileInputChange}
        className="absolute inset-0 opacity-0 cursor-pointer z-10"
      />

      <GlassCard
        variant="interactive"
        className={`p-6 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center ${
          isDragOver
            ? 'border-cyan-500 bg-cyan-500/10 dark:bg-cyan-950/25 scale-[1.01] shadow-[0_0_30px_rgba(56,189,248,0.25)]'
            : 'border-zinc-300 hover:border-zinc-400 dark:border-white/15 dark:hover:border-white/30 bg-zinc-50/50 dark:bg-white/[0.02]'
        }`}
      >
        <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
          <UploadCloud className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />
        </div>

        <p className="text-sm font-semibold text-zinc-900 dark:text-white tracking-tight">
          Drag & Drop Spatial Assets or Browse
        </p>
        <p className="text-xs text-zinc-600 dark:text-white/60 mt-1 max-w-sm">
          Drop executables, child app builds, package bundles, or media assets to stage and sync directly.
        </p>

        <span className="inline-flex items-center gap-1.5 mt-3 text-[11px] font-mono text-cyan-700 dark:text-cyan-300 font-medium">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Automatic Color Palette Extraction on Drop</span>
        </span>
      </GlassCard>
    </div>
  );
};
