import React from 'react';
import { Plus, CloudUpload } from 'lucide-react';
import { GlassButton } from '../../../components/ui/GlassButton';

interface FilesHeaderProps {
  onNewFile: () => void;
}

export const FilesHeader: React.FC<FilesHeaderProps> = ({ onNewFile }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-200/80 dark:border-white/[0.08]">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Ecosystem Asset Hub & Universal Staging
          </h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Studio Network · Port 49153
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
          Real-time cross-app file streaming, asset staging, and direct Wi-Fi sync for One Tap, MediaFlow & Mobile
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <GlassButton
          variant="glass"
          size="sm"
          icon={<CloudUpload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
        >
          Import Asset
        </GlassButton>

        <GlassButton
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5 text-white" />}
          onClick={onNewFile}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/20"
        >
          New Production Asset
        </GlassButton>
      </div>
    </div>
  );
};
