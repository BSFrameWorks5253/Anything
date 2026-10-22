import React from 'react';
import { Rocket, Sparkles, Check, Layers, AlertCircle, GitBranch, CloudDownload, CheckCircle2, RefreshCw } from 'lucide-react';
import type { StagedFile } from './InboxStagingDock';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';

interface PushFormCustomizerProps {
  selectedFile: StagedFile | null;
  name: string;
  setName: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  version: string;
  setVersion: (val: string) => void;
  description: string;
  setDescription: (val: string) => void;
  executableName: string;
  setExecutableName: (val: string) => void;
  iconType: 'monogram' | 'emoji' | 'image';
  setIconType: (val: 'monogram' | 'emoji' | 'image') => void;
  selectedEmoji: string;
  setSelectedEmoji: (val: string) => void;
  selectedShader: any;
  setSelectedShader: (val: any) => void;
  shaders: any[];
  isPushing: boolean;
  onPush: () => void;
  githubRepo: string;
  setGithubRepo: (val: string) => void;
  githubStatus: { checking: boolean; info?: any; error?: string };
  onCheckGitHub: () => void;
  onDownloadGitHubAsset?: () => void;
}

const emojiIcons = ['⚡', '🎨', '🚀', '💻', '🎬', '🎮', '🔮', '🎧', '📦', '📸', '✨', '🛠️'];

export const PushFormCustomizer: React.FC<PushFormCustomizerProps> = ({
  selectedFile,
  name,
  setName,
  category,
  setCategory,
  version,
  setVersion,
  description,
  setDescription,
  executableName,
  setExecutableName,
  iconType,
  setIconType,
  selectedEmoji,
  setSelectedEmoji,
  selectedShader,
  setSelectedShader,
  shaders,
  isPushing,
  onPush,
  githubRepo,
  setGithubRepo,
  githubStatus,
  onCheckGitHub,
  onDownloadGitHubAsset,
}) => {
  if (!selectedFile) {
    return (
      <GlassCard variant="sunken" className="p-8 text-center flex flex-col items-center justify-center h-full">
        <Layers className="w-10 h-10 text-white/20 mb-3" />
        <h4 className="text-sm font-semibold text-white/80">Select a Package to Configure</h4>
        <p className="text-xs text-white/40 mt-1 max-w-xs">
          Click an .exe or .msix from the Staging Folder on the left to set up how users will see it.
        </p>
      </GlassCard>
    );
  }

  return (
    <GlassCard variant="interactive" className="p-6 border-white/10 space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/[0.08]">
        <div>
          <h4 className="text-sm font-bold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>2. Configure User Presentation</span>
          </h4>
          <p className="text-[11px] text-white/50 mt-0.5">
            Configuring <code className="text-cyan-300 font-mono">{selectedFile.fileName}</code>
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-cyan-400/15 text-cyan-300 border border-cyan-400/30">
          {selectedFile.sizeFormatted} · {selectedFile.extension.toUpperCase()}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="col-span-2">
          <label className="block text-[11px] font-mono text-white/50 mb-1 uppercase">
            User-Facing App Title *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-3 py-1.5 text-sm bg-white/[0.05] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400"
          />
        </div>

        <div>
          <label className="block text-[11px] font-mono text-white/50 mb-1 uppercase">
            Version *
          </label>
          <input
            type="text"
            required
            placeholder="1.0.0"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full px-3 py-1.5 text-sm font-mono text-cyan-300 bg-white/[0.05] border border-white/10 rounded-xl outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-[11px] font-mono text-white/50 mb-1 uppercase">
            Category
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400"
          >
            <option value="Creative & Design">Creative & Design</option>
            <option value="Development">Development</option>
            <option value="Video & 3D">Video & 3D</option>
            <option value="Productivity">Productivity</option>
            <option value="Gaming & Media">Gaming & Media</option>
            <option value="Custom Tools">Custom Tools</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-mono text-white/50 mb-1 uppercase">
            Main Launch Target (.exe)
          </label>
          <input
            type="text"
            required
            placeholder="e.g. app.exe"
            value={executableName}
            onChange={(e) => setExecutableName(e.target.value)}
            className="w-full px-3 py-1.5 text-xs font-mono bg-white/[0.05] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400"
          />
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-mono text-white/50 mb-1 uppercase">
          Short Tagline / Description
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Briefly tell your users what this tool does..."
          className="w-full px-3 py-1.5 text-xs bg-white/[0.05] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400 resize-none"
        />
      </div>

      {/* 3D Emoji Icon Selector */}
      <div>
        <label className="block text-[11px] font-mono text-white/50 mb-2 uppercase">
          Icon Emblem (Click an Emoji or Monogram)
        </label>
        <div className="flex flex-wrap gap-2">
          {emojiIcons.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => {
                setIconType('emoji');
                setSelectedEmoji(emoji);
              }}
              className={`w-8 h-8 rounded-lg border text-sm flex items-center justify-center transition-all ${
                iconType === 'emoji' && selectedEmoji === emoji
                  ? 'border-cyan-400 bg-cyan-400/25 scale-110 shadow-md ring-2 ring-cyan-400/40'
                  : 'border-white/10 bg-white/[0.04] opacity-70 hover:opacity-100'
              }`}
            >
              {emoji}
            </button>
          ))}
        </div>
      </div>

      {/* Liquid Shader Selector */}
      <div>
        <label className="block text-[11px] font-mono text-white/50 mb-2 uppercase">
          Liquid Glass Shader Theme
        </label>
        <div className="flex items-center gap-2">
          {shaders.map((shader, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setSelectedShader(shader)}
              className={`w-7 h-7 rounded-lg p-[1.5px] bg-gradient-to-br ${shader.gradient} transition-transform ${
                selectedShader.label === shader.label ? 'scale-115 ring-2 ring-white shadow-md' : 'opacity-70 hover:opacity-100'
              }`}
            >
              <div className="w-full h-full rounded-[6px] bg-slate-950/80" />
            </button>
          ))}
        </div>
      </div>

      {/* GitHub Auto-Update Link */}
      <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2.5">
        <div className="flex items-center justify-between">
          <label className="text-[11px] font-mono text-cyan-300 flex items-center gap-1.5 uppercase font-semibold">
            <GitBranch className="w-3.5 h-3.5 text-cyan-400" />
            <span>GitHub Release Sync (Auto-Updates)</span>
          </label>
          {githubStatus.info && (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
              <CheckCircle2 className="w-3 h-3" />
              <span>Latest: {githubStatus.info.rawTag}</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="owner/repo (e.g. yourname/yourapp)"
            value={githubRepo}
            onChange={(e) => setGithubRepo(e.target.value)}
            className="flex-1 px-3 py-1.5 text-xs font-mono bg-black/40 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400"
          />
          <button
            type="button"
            onClick={onCheckGitHub}
            disabled={!githubRepo.trim() || githubStatus.checking}
            className="px-3 py-1.5 text-xs font-medium rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30 transition-all flex items-center gap-1.5 disabled:opacity-40"
          >
            {githubStatus.checking ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : (
              <Sparkles className="w-3 h-3" />
            )}
            <span>Fetch Release</span>
          </button>
        </div>

        {githubStatus.error && (
          <p className="text-[10px] font-mono text-rose-400 flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{githubStatus.error}</span>
          </p>
        )}

        {githubStatus.info && (
          <div className="pt-2 border-t border-white/[0.06] flex items-center justify-between text-[11px] text-white/70">
            <div>
              <p className="font-semibold text-white">{githubStatus.info.releaseName || githubStatus.info.rawTag}</p>
              <p className="text-[10px] text-white/40 font-mono">
                Asset: {githubStatus.info.asset?.name || 'No Windows binary'} ({githubStatus.info.asset?.sizeFormatted || 'N/A'})
              </p>
            </div>
            {githubStatus.info.asset && onDownloadGitHubAsset && (
              <button
                type="button"
                onClick={onDownloadGitHubAsset}
                className="px-2.5 py-1 text-[10px] font-mono rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 hover:bg-emerald-500/30 flex items-center gap-1"
              >
                <CloudDownload className="w-3 h-3" />
                <span>Pull into Inbox</span>
              </button>
            )}
          </div>
        )}
      </div>

      {/* Big Push Button */}
      <div className="pt-4 border-t border-white/[0.08]">
        <button
          onClick={onPush}
          disabled={isPushing || !name.trim()}
          className="w-full py-3 rounded-2xl font-bold text-sm tracking-wide bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 text-slate-950 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-400/50 hover:brightness-110 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-40 select-none"
        >
          <Rocket className={`w-4 h-4 ${isPushing ? 'animate-bounce' : ''}`} />
          <span>{isPushing ? 'Pushing Package to Users...' : '🚀 PUSH TO USERS'}</span>
        </button>
        <p className="text-[10px] text-center text-white/40 mt-1.5 font-mono">
          Packages are instantly published to the user-side catalog with 1 click.
        </p>
      </div>
    </GlassCard>
  );
};
