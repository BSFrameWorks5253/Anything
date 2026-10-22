import React, { useState } from 'react';
import { X, Sparkles, CloudUpload, Link, Code2, Tag } from 'lucide-react';
import type { CatalogApp, AppCategory } from '../../../types/app.types';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';

interface PublishAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPublish: (app: CatalogApp) => void;
}

const colorPresets = [
  { gradient: 'from-blue-600 via-sky-500 to-cyan-400', textColor: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)' },
  { gradient: 'from-violet-700 via-purple-600 to-indigo-500', textColor: '#c084fc', glow: 'rgba(192, 132, 252, 0.45)' },
  { gradient: 'from-amber-600 via-orange-500 to-yellow-400', textColor: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)' },
  { gradient: 'from-emerald-500 via-teal-400 to-cyan-400', textColor: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.45)' },
  { gradient: 'from-pink-600 via-rose-500 to-orange-400', textColor: '#fb7185', glow: 'rgba(251, 113, 133, 0.45)' },
];

const emojiIcons = ['⚡', '🎨', '🚀', '💻', '🎬', '🎮', '🔮', '🎧', '📦', '📸', '✨', '🛠️'];

export const PublishAppModal: React.FC<PublishAppModalProps> = ({
  isOpen,
  onClose,
  onPublish,
}) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [category, setCategory] = useState<AppCategory>('Creative & Design');
  const [version, setVersion] = useState('1.0.0');
  const [downloadUrl, setDownloadUrl] = useState('');
  const [executableName, setExecutableName] = useState('');
  const [description, setDescription] = useState('');
  const [size, setSize] = useState('45 MB');
  const [selectedEmoji, setSelectedEmoji] = useState('🚀');
  const [selectedPreset, setSelectedPreset] = useState(colorPresets[0]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !executableName.trim()) {
      alert('Please provide an App Name and the Executable Name (e.g. myapp.exe).');
      return;
    }

    const newCatalogApp: CatalogApp = {
      id: `app-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now().toString(36)}`,
      name: name.trim(),
      shortName: shortName.trim() || name.slice(0, 2).toUpperCase(),
      category,
      version: version.trim() || '1.0.0',
      description: description.trim() || 'Software application distributed via Creative Hub.',
      downloadUrl: downloadUrl.trim() || undefined,
      executableName: executableName.trim(),
      size: size.trim() || '50 MB',
      gradient: selectedPreset.gradient,
      textColor: selectedPreset.textColor,
      glowColor: selectedPreset.glow,
      iconType: 'emoji',
      iconValue: selectedEmoji,
      status: 'not-installed',
      addedByCreator: true,
      changelog: [
        `Version ${version} published to Creative Hub catalog`,
        'Includes auto-updater & path verification support',
      ],
    };

    onPublish(newCatalogApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-3xl animate-fadeIn">
      <GlassCard
        variant="elevated"
        className="w-full max-w-xl p-6 sm:p-7 border-white/20 shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-lg shadow-cyan-400/30">
              <CloudUpload className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Publish App to Creative Hub Catalog
              </h3>
              <p className="text-xs text-white/50">
                Configure your app so users can download, update & uninstall it
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto space-y-4 pt-4 pr-1">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase">
                App Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. My Pixel Editor, 3D Forge"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!executableName) {
                    setExecutableName(`${e.target.value.toLowerCase().replace(/\s+/g, '')}.exe`);
                  }
                  if (!shortName) {
                    setShortName(e.target.value.slice(0, 2).toUpperCase());
                  }
                }}
                className="w-full px-3.5 py-2 text-sm bg-white/[0.05] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/60"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase">
                Version *
              </label>
              <input
                type="text"
                required
                placeholder="1.0.0"
                value={version}
                onChange={(e) => setVersion(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white/[0.05] border border-white/10 rounded-xl text-cyan-300 font-mono outline-none focus:border-cyan-400/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase">
                Main Executable File *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. app.exe or run.bat"
                value={executableName}
                onChange={(e) => setExecutableName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs font-mono bg-white/[0.05] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/60"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as AppCategory)}
                className="w-full px-3 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/60"
              >
                <option value="Creative & Design">Creative & Design</option>
                <option value="Development">Development</option>
                <option value="Video & 3D">Video & 3D</option>
                <option value="Productivity">Productivity</option>
                <option value="Gaming & Media">Gaming & Media</option>
                <option value="Custom Tools">Custom Tools</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase flex items-center gap-1.5">
              <Link className="w-3 h-3 text-cyan-400" />
              <span>Direct Download Package URL (.zip or .exe)</span>
            </label>
            <input
              type="url"
              placeholder="https://github.com/user/repo/releases/download/v1.0.0/app.zip"
              value={downloadUrl}
              onChange={(e) => setDownloadUrl(e.target.value)}
              className="w-full px-3.5 py-2 text-xs font-mono bg-white/[0.05] border border-white/10 rounded-xl text-cyan-300 outline-none focus:border-cyan-400/60"
            />
            <p className="text-[11px] text-white/40 mt-1">
              Host your app zip on GitHub Releases. When users click Install, the Hub downloads and extracts it automatically.
            </p>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="Describe what your creative application does..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white/[0.05] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/60 resize-none"
            />
          </div>

          {/* Emoji & Shader style */}
          <div>
            <label className="block text-xs font-mono text-white/60 mb-2 uppercase">
              App Icon & Liquid Shader
            </label>
            <div className="flex items-center gap-2 mb-3">
              {emojiIcons.slice(0, 8).map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setSelectedEmoji(emoji)}
                  className={`w-8 h-8 rounded-lg border text-base flex items-center justify-center transition-all ${
                    selectedEmoji === emoji ? 'border-cyan-400 bg-cyan-400/20 scale-110' : 'border-white/10 bg-white/[0.04]'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2.5">
              {colorPresets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setSelectedPreset(preset)}
                  className={`w-8 h-8 rounded-xl p-[2px] bg-gradient-to-br ${preset.gradient} transition-transform ${
                    selectedPreset.gradient === preset.gradient ? 'scale-115 ring-2 ring-white shadow-md' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  <div className="w-full h-full rounded-[9px] bg-slate-950/80" />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 border-t border-white/[0.08] flex items-center justify-end gap-2.5">
            <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
              Publish to Hub
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
