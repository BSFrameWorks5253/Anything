import React from 'react';
import { MoreHorizontal, Share2, CheckCircle2, Clock } from 'lucide-react';
import type { CloudFileItem } from '../../../types/app.types';

interface FileRowItemProps {
  file: CloudFileItem;
  onOpen: (file: CloudFileItem) => void;
}

export const FileRowItem: React.FC<FileRowItemProps> = ({ file, onOpen }) => {
  return (
    <div
      onClick={() => onOpen(file)}
      className="group grid grid-cols-12 gap-3 items-center px-4 py-3.5 border-b border-zinc-200 dark:border-white/[0.05] last:border-0 hover:bg-zinc-100/70 dark:hover:bg-white/[0.06] transition-all duration-200 cursor-pointer select-none"
    >
      {/* File Name & App Badge */}
      <div className="col-span-12 sm:col-span-6 flex items-center gap-3 min-w-0">
        <div
          className={`w-9 h-9 rounded-xl p-[1px] bg-gradient-to-br ${file.appGradient} shrink-0 shadow-md group-hover:scale-105 transition-transform`}
        >
          <div className="w-full h-full rounded-[11px] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center font-bold text-xs border border-white/20">
            <span style={{ color: file.appTextColor }}>{file.appShort}</span>
          </div>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-cyan-600 dark:group-hover:text-cyan-300 transition-colors truncate">
            {file.name}
          </p>
          <div className="flex items-center gap-2 mt-0.5 sm:hidden text-[10px] text-zinc-500 dark:text-white/50">
            <span>{file.modified}</span>
            <span>·</span>
            <span>{file.size}</span>
          </div>
        </div>
      </div>

      {/* Sync Status */}
      <div className="hidden sm:flex col-span-2 items-center gap-1.5 text-xs">
        {file.status === 'synced' ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Synced</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] text-amber-600 dark:text-amber-400 font-mono font-medium">
            <Clock className="w-3.5 h-3.5 animate-spin" />
            <span>Uploading...</span>
          </span>
        )}
      </div>

      {/* Modified date */}
      <div className="hidden sm:block col-span-2 text-xs text-zinc-600 dark:text-white/60 font-mono font-medium truncate">
        {file.modified}
      </div>

      {/* Size & Actions */}
      <div className="hidden sm:flex col-span-2 items-center justify-end gap-2">
        <span className="text-xs font-mono text-zinc-600 dark:text-white/50 font-medium">{file.size}</span>
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          title="Share"
        >
          <Share2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
          }}
          className="w-7 h-7 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200/60 dark:text-white/40 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          title="Options"
        >
          <MoreHorizontal className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
