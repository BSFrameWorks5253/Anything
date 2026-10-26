import React, { useState } from 'react';
import { X, FolderOpen, Plus, Sparkles } from 'lucide-react';
import type { CreativeApp, AppCategory } from '../../../types/app.types';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';

interface AddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddApp: (newApp: CreativeApp) => void;
}

const colorPresets = [
  { label: 'Cyan Aurora', gradient: 'from-blue-600 via-sky-500 to-cyan-400', textColor: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)' },
  { label: 'Cosmic Violet', gradient: 'from-violet-700 via-purple-600 to-indigo-500', textColor: '#c084fc', glow: 'rgba(192, 132, 252, 0.45)' },
  { label: 'Liquid Amber', gradient: 'from-amber-600 via-orange-500 to-yellow-400', textColor: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)' },
  { label: 'Emerald Glow', gradient: 'from-emerald-500 via-teal-400 to-cyan-400', textColor: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.45)' },
  { label: 'Apple Rose', gradient: 'from-pink-600 via-rose-500 to-orange-400', textColor: '#fb7185', glow: 'rgba(251, 113, 133, 0.45)' },
];

export const AddAppModal: React.FC<AddAppModalProps> = ({
  isOpen,
  onClose,
  onAddApp,
}) => {
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [category, setCategory] = useState<AppCategory>('Custom Tools');
  const [description, setDescription] = useState('');
  const [executablePath, setExecutablePath] = useState('');
  const [selectedColor, setSelectedColor] = useState(colorPresets[0]);

  if (!isOpen) return null;

  const handleBrowseExecutable = async () => {
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.selectExecutable) {
        const pickedPath = await electronAPI.selectExecutable();
        if (pickedPath) {
          setExecutablePath(pickedPath);
          if (!name) {
            // Auto fill name from file name
            const baseName = pickedPath.split(/[\/\\]/).pop()?.replace(/\.[^/.]+$/, '');
            if (baseName) {
              setName(baseName.charAt(0).toUpperCase() + baseName.slice(1));
              setShortName(baseName.slice(0, 2).toUpperCase());
            }
          }
        }
      } else {
        alert('File selection dialog is available when running in the Electron desktop shell.');
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newApp: CreativeApp = {
      id: `custom-${Date.now()}`,
      name: name.trim(),
      shortName: shortName.trim() || name.slice(0, 2).toUpperCase(),
      category,
      description: description.trim() || 'Custom registered application in Creative Hub.',
      gradient: selectedColor.gradient,
      textColor: selectedColor.textColor,
      glowColor: selectedColor.glow,
      version: "26.10.26",
      status: 'installed',
      size: 'Local Executable',
      executablePath: executablePath.trim() || undefined,
      badgeTag: 'Custom Tool',
      isCustom: true,
      rating: 5.0,
      releaseNotes: ['Initial registration in Creative Hub', 'Local system execution support'],
      systemRequirements: {
        os: 'Windows 11 / macOS 14+',
        ram: '8 GB',
        gpu: 'DirectX 12 / Metal compatible',
        storage: 'Custom',
      },
    };

    onAddApp(newApp);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-2xl animate-fadeIn">
      <GlassCard
        variant="elevated"
        className="w-full max-w-lg p-6 sm:p-7 border-white/20 shadow-2xl relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/[0.08]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 shadow-[0_0_15px_rgba(56,189,248,0.35)]">
              <Plus className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Add Custom Application
              </h3>
              <p className="text-xs text-white/50">
                Register any local software, script, or web tool into your hub
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4 mt-5">
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase">
                App Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Blender 3D, VS Code, Figma"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (!shortName) {
                    setShortName(e.target.value.slice(0, 2).toUpperCase());
                  }
                }}
                className="w-full px-3.5 py-2 text-sm bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-cyan-400/60 focus:bg-white/[0.08] outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase">
                Short Code
              </label>
              <input
                type="text"
                maxLength={3}
                placeholder="Bl"
                value={shortName}
                onChange={(e) => setShortName(e.target.value.toUpperCase())}
                className="w-full px-3.5 py-2 text-sm text-center font-bold bg-white/[0.05] border border-white/10 rounded-xl text-cyan-300 placeholder-white/30 focus:border-cyan-400/60 outline-none transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as AppCategory)}
              className="w-full px-3.5 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/60"
            >
              <option value="Custom Tools">Custom Tools</option>
              <option value="Photo & Design">Photo & Design</option>
              <option value="Graphic Design">Graphic Design</option>
              <option value="Video & Motion">Video & Motion</option>
              <option value="UI & Spatial">UI & Spatial</option>
              <option value="Generative AI">Generative AI</option>
              <option value="Web & 3D">Web & 3D</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase">
              Executable Path or Web URL
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="C:\Program Files\... or https://..."
                value={executablePath}
                onChange={(e) => setExecutablePath(e.target.value)}
                className="flex-1 px-3.5 py-2 text-sm bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-cyan-400/60 outline-none transition-all font-mono text-xs"
              />
              <button
                type="button"
                onClick={handleBrowseExecutable}
                className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-white/80 hover:text-white flex items-center gap-1.5 text-xs font-medium transition-all"
                title="Browse local executable"
              >
                <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Browse</span>
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase">
              Description
            </label>
            <textarea
              rows={2}
              placeholder="What do you use this tool for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white/[0.05] border border-white/10 rounded-xl text-white placeholder-white/30 focus:border-cyan-400/60 outline-none transition-all resize-none"
            />
          </div>

          {/* Color Orb Picker */}
          <div>
            <label className="block text-xs font-mono text-white/60 mb-2 uppercase">
              Liquid Glass Icon Style
            </label>
            <div className="flex items-center gap-3">
              {colorPresets.map((preset, idx) => {
                const isSelected = selectedColor.label === preset.label;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedColor(preset)}
                    className={`w-9 h-9 rounded-xl p-[2px] bg-gradient-to-br ${preset.gradient} transition-transform ${
                      isSelected ? 'scale-115 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={preset.label}
                  >
                    <div className="w-full h-full rounded-[9px] bg-slate-950/80 backdrop-blur-sm flex items-center justify-center text-[10px] font-bold text-white">
                      {shortName || 'Cc'}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-white/[0.08] mt-6">
            <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </GlassButton>
            <GlassButton type="submit" variant="primary" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
              Add to Hub
            </GlassButton>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
