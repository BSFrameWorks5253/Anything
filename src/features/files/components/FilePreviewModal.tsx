import React, { useState } from 'react';
import { X, ExternalLink, Copy, Check, Trash2, Palette, Cloud, FileText } from 'lucide-react';
import type { CloudFileItem } from '../../../types/app.types';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassBadge } from '../../../components/ui/GlassBadge';

interface FilePreviewModalProps {
  file: CloudFileItem | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => void;
}

export const FilePreviewModal: React.FC<FilePreviewModalProps> = ({
  file,
  isOpen,
  onClose,
  onDelete,
}) => {
  const [copiedHex, setCopiedHex] = useState<string | null>(null);

  if (!isOpen || !file) return null;

  const palette = file.palette || ['#38bdf8', '#818cf8', '#c084fc', '#f43f5e', '#fbbf24'];

  const copyToClipboard = (hex: string) => {
    navigator.clipboard.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 1500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-2xl animate-fadeIn">
      <GlassCard
        variant="elevated"
        className="w-full max-w-lg p-6 border-white/20 shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl p-[1px] bg-gradient-to-br ${file.appGradient} shrink-0 shadow-md`}
            >
              <div className="w-full h-full rounded-[10px] bg-slate-950/80 backdrop-blur-xl flex items-center justify-center font-bold text-xs border border-white/20">
                <span style={{ color: file.appTextColor }}>{file.appShort}</span>
              </div>
            </div>

            <div className="min-w-0">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight truncate max-w-xs">
                {file.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-white/60 font-mono font-medium">
                {file.size} · Modified {file.modified}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 dark:text-white/50 dark:hover:text-white dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Preview Frame */}
        <div className="my-5 p-8 rounded-xl bg-zinc-50 dark:bg-gradient-to-br dark:from-white/[0.04] dark:to-white/[0.01] border border-zinc-200 dark:border-white/10 flex flex-col items-center justify-center text-center shadow-inner relative overflow-hidden">
          <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-white/[0.06] border border-zinc-200 dark:border-white/15 flex items-center justify-center mb-3">
            <FileText className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <span className="text-sm font-semibold text-zinc-900 dark:text-white">{file.name}</span>
          <span className="text-xs text-zinc-500 dark:text-white/50 mt-0.5">Encrypted Spatial Document</span>
        </div>

        {/* Extracted Color Palette Section */}
        <div className="space-y-2 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase text-zinc-600 dark:text-white/60 font-medium flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              <span>Extracted Chromatic Palette</span>
            </span>
            <span className="text-[10px] text-zinc-500 dark:text-white/40">Click swatch to copy HEX</span>
          </div>

          <div className="grid grid-cols-5 gap-2">
            {palette.map((hex, i) => (
              <button
                key={i}
                onClick={() => copyToClipboard(hex)}
                className="group p-2 rounded-xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 hover:border-zinc-300 dark:hover:border-white/30 flex flex-col items-center transition-all hover:scale-105"
              >
                <div
                  className="w-full h-8 rounded-lg mb-1.5 shadow-xs"
                  style={{ backgroundColor: hex }}
                />
                <span className="text-[10px] font-mono text-zinc-700 dark:text-white/70 group-hover:text-zinc-900 dark:group-hover:text-white font-medium">
                  {copiedHex === hex ? 'Copied!' : hex}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-zinc-200 dark:border-white/[0.08] flex items-center justify-between">
          <button
            onClick={() => {
              onDelete(file.id);
              onClose();
            }}
            className="text-xs text-rose-400/80 hover:text-rose-300 flex items-center gap-1 font-mono transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Asset</span>
          </button>

          <div className="flex items-center gap-2">
            <GlassButton variant="ghost" size="sm" onClick={onClose}>
              Close
            </GlassButton>
            <GlassButton
              variant="primary"
              size="sm"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => {
                alert(`Opening ${file.name} in native viewer...`);
                onClose();
              }}
            >
              Open File
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
