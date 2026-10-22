import React from 'react';
import { FolderOpen, RefreshCw, FileCode, Package, HardDrive, ArrowRight } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';

export interface StagedFile {
  fileName: string;
  fullPath: string;
  extension: string;
  sizeBytes: number;
  sizeFormatted: string;
  modifiedTime: string;
}

interface InboxStagingDockProps {
  files: StagedFile[];
  selectedFile: StagedFile | null;
  onSelectFile: (file: StagedFile) => void;
  onRefresh: () => void;
  onOpenFolder: () => void;
}

export const InboxStagingDock: React.FC<InboxStagingDockProps> = ({
  files,
  selectedFile,
  onSelectFile,
  onRefresh,
  onOpenFolder,
}) => {
  return (
    <GlassCard variant="interactive" className="p-5 border-white/10 space-y-4 flex flex-col h-full">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Package className="w-4 h-4 text-cyan-400" />
            <span>1. Staging Folder (Inbox)</span>
          </h4>
          <p className="text-[11px] text-white/50 mt-0.5">
            Drop your .exe, .msix, or .zip here
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={onRefresh}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            title="Refresh inbox"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
          <GlassButton
            variant="glass"
            size="sm"
            onClick={onOpenFolder}
            icon={<FolderOpen className="w-3.5 h-3.5 text-cyan-400" />}
            className="text-xs py-1"
          >
            Open Folder
          </GlassButton>
        </div>
      </div>

      {/* Files List */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-[180px]">
        {files.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center p-6 border-dashed border border-white/10 rounded-2xl bg-white/[0.01]">
            <FolderOpen className="w-9 h-9 text-white/20 mb-2" />
            <span className="text-xs font-semibold text-white/70">Inbox is empty</span>
            <p className="text-[11px] text-white/40 mt-1 max-w-[200px]">
              Click "Open Folder" above and paste your new .exe or .msix file into it.
            </p>
          </div>
        ) : (
          files.map((file) => {
            const isSelected = selectedFile?.fileName === file.fileName;
            const isMsix = file.extension === '.msix' || file.extension === '.appx';
            const isZip = file.extension === '.zip';

            return (
              <div
                key={file.fileName}
                onClick={() => onSelectFile(file)}
                className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                  isSelected
                    ? 'bg-cyan-500/15 border-cyan-400/50 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                    : 'bg-white/[0.03] border-white/10 hover:border-white/25 hover:bg-white/[0.06]'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                    isMsix ? 'bg-purple-500/20 text-purple-300' : isZip ? 'bg-amber-500/20 text-amber-300' : 'bg-cyan-500/20 text-cyan-300'
                  }`}>
                    {file.extension.replace('.', '').toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <span className="text-xs font-bold text-white block truncate">
                      {file.fileName}
                    </span>
                    <span className="text-[10px] font-mono text-white/40 block">
                      {file.sizeFormatted} · {file.modifiedTime}
                    </span>
                  </div>
                </div>

                <ArrowRight className={`w-3.5 h-3.5 shrink-0 ${isSelected ? 'text-cyan-300' : 'text-white/20'}`} />
              </div>
            );
          })
        )}
      </div>

      <div className="pt-2 text-[10px] font-mono text-white/40 border-t border-white/5 flex items-center justify-between">
        <span>Supported: .exe, .msix, .zip, .msi</span>
        <span>{files.length} ready to configure</span>
      </div>
    </GlassCard>
  );
};
