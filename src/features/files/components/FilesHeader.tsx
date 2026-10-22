import React from 'react';
import { Plus, CloudUpload, HardDrive } from 'lucide-react';
import { GlassButton } from '../../../components/ui/GlassButton';

interface FilesHeaderProps {
  onNewFile: () => void;
}

export const FilesHeader: React.FC<FilesHeaderProps> = ({ onNewFile }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-zinc-200 dark:border-white/[0.08]">
      <div>
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
            Cloud Documents & Spatial Libraries
          </h2>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
            Encrypted
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-white/60 mt-0.5">
          Synchronized across macOS, iPadOS, and Apple Vision Pro
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <GlassButton
          variant="glass"
          size="sm"
          icon={<CloudUpload className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
        >
          Upload Asset
        </GlassButton>

        <GlassButton
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5 text-white" />}
          onClick={onNewFile}
        >
          New Spatial Document
        </GlassButton>
      </div>
    </div>
  );
};
