import React from 'react';
import type { CloudFileItem } from '../../../types/app.types';
import { GlassCard } from '../../../components/ui/GlassCard';
import { FileRowItem } from './FileRowItem';

interface FilesTableProps {
  files: CloudFileItem[];
  onOpenFile: (file: CloudFileItem) => void;
}

export const FilesTable: React.FC<FilesTableProps> = ({ files, onOpenFile }) => {
  return (
    <GlassCard variant="static" className="rounded-2xl border-zinc-200 dark:border-white/10 overflow-hidden shadow-xs">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-3 px-4 py-3 bg-zinc-100/70 dark:bg-white/[0.03] border-b border-zinc-200 dark:border-white/[0.08] text-[11px] font-mono text-zinc-600 dark:text-white/50 font-semibold uppercase tracking-wider select-none">
        <div className="col-span-12 sm:col-span-6">Name</div>
        <div className="hidden sm:block col-span-2">Cloud Status</div>
        <div className="hidden sm:block col-span-2">Last Modified</div>
        <div className="hidden sm:block col-span-2 text-right">File Size</div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-zinc-200 dark:divide-white/[0.04]">
        {files.map((file) => (
          <FileRowItem key={file.id} file={file} onOpen={onOpenFile} />
        ))}
      </div>
    </GlassCard>
  );
};
