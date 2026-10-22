import React, { useState, useRef } from 'react';
import {
  Sparkles,
  Play,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sliders,
  Palette,
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import {
  splashArtworkPresets,
  loadSplashSettings,
  saveSplashSettings,
  defaultSplashSettings,
  type SplashSettings,
} from '../../../data/splash.data';

interface SplashScreenSectionProps {
  onPreview: (settings: SplashSettings) => void;
}

export const SplashScreenSection: React.FC<SplashScreenSectionProps> = ({ onPreview }) => {
  const [settings, setSettings] = useState<SplashSettings>(() => loadSplashSettings());
  const [customUrlInput, setCustomUrlInput] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updateSettings = (partial: Partial<SplashSettings>) => {
    const next = { ...settings, ...partial };
    setSettings(next);
    saveSplashSettings(next);
  };

  const handleSelectPreset = (preset: (typeof splashArtworkPresets)[0]) => {
    updateSettings({
      artworkUrl: preset.imageUrl,
      artistName: preset.artist,
      artworkTitle: preset.title,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          updateSettings({
            artworkUrl: reader.result,
            artistName: 'Custom Artist',
            artworkTitle: file.name.replace(/\.[^/.]+$/, ''),
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      updateSettings({
        artworkUrl: customUrlInput.trim(),
        artistName: 'Web Asset',
        artworkTitle: 'Custom Online Graphic',
      });
      setCustomUrlInput('');
    }
  };

  const handleResetDefaults = () => {
    setSettings(defaultSplashSettings);
    saveSplashSettings(defaultSplashSettings);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold">
            Adobe-Style Splash Screen & Loader
          </h3>
          <GlassBadge variant="cyan" dot>
            Customizable
          </GlassBadge>
        </div>
        <button
          onClick={handleResetDefaults}
          className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:text-white/40 dark:hover:text-white font-mono flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset Default</span>
        </button>
      </div>

      <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 space-y-6">
        {/* Top Header & Live Preview Button */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl overflow-hidden shadow-md shadow-red-600/25 shrink-0">
              <img src="/logo.svg" alt="Anything Logo" className="w-full h-full object-contain" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                  Startup Branding & Artwork Loader
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-medium">
                  Adobe Spectrum Layout
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-white/60 mt-0.5 font-medium">
                Displays the iconic Adobe-inspired splash screen with real-time initialization steps upon opening Anything.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <GlassButton
              variant="primary"
              size="sm"
              icon={<Play className="w-3.5 h-3.5" />}
              onClick={() => onPreview(settings)}
            >
              Preview Splash Screen
            </GlassButton>
          </div>
        </div>

        {/* Current Active Splash Artwork Preview Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-5 relative rounded-xl overflow-hidden border border-zinc-300 dark:border-white/15 h-44 shadow-md bg-zinc-900 group">
            <img
              src={settings.artworkUrl}
              alt="Active Splash Preview"
              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40 pointer-events-none" />

            {/* Overlay badge */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg overflow-hidden shadow-xs">
                <img src="/logo.svg" alt="Anything Logo" className="w-full h-full object-contain" />
              </div>
              <span className="text-xs font-bold text-white drop-shadow-sm">
                {settings.productName}
              </span>
            </div>

            <div className="absolute bottom-3 right-3 text-right">
              <span className="text-[9px] font-mono uppercase text-cyan-300 block font-bold">
                Artwork by
              </span>
              <span className="text-xs font-semibold text-white drop-shadow-xs">
                {settings.artistName}
              </span>
            </div>
          </div>

          <div className="md:col-span-7 space-y-3.5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold mb-1.5">
                Artist Name / Credit
              </label>
              <input
                type="text"
                value={settings.artistName}
                onChange={(e) => updateSettings({ artistName: e.target.value })}
                placeholder="e.g. Burhanuddin, Adobe Design Studio"
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold mb-1.5">
                  Artwork Title
                </label>
                <input
                  type="text"
                  value={settings.artworkTitle}
                  onChange={(e) => updateSettings({ artworkTitle: e.target.value })}
                  placeholder="e.g. Refractive Spectrum"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold mb-1.5">
                  Duration (Speed)
                </label>
                <select
                  value={settings.durationMs}
                  onChange={(e) => updateSettings({ durationMs: Number(e.target.value) })}
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white outline-none focus:border-cyan-500 font-medium"
                >
                  <option value={1500}>Quick (1.5 seconds)</option>
                  <option value={2800}>Standard (2.8 seconds)</option>
                  <option value={4200}>Cinematic (4.2 seconds)</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Preset Gallery */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold mb-2.5">
            Curated Adobe-Style Artwork Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {splashArtworkPresets.map((preset) => {
              const isSelected = settings.artworkUrl === preset.imageUrl;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-cyan-500 ring-2 ring-cyan-500/40 scale-[1.02] shadow-md shadow-cyan-500/20'
                      : 'border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/30'
                  }`}
                >
                  <div className="h-24 w-full bg-zinc-900 relative">
                    <img
                      src={preset.imageUrl}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-zinc-50 dark:bg-white/[0.03]">
                    <p className="text-[11px] font-bold text-zinc-900 dark:text-white truncate">
                      {preset.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-white/50 truncate font-mono">
                      {preset.artist}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Upload or Image URL Bar */}
        <div className="pt-2 border-t border-zinc-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="Paste any custom image URL (https://...)"
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-mono"
            />
            <GlassButton variant="glass" size="sm" onClick={handleApplyCustomUrl}>
              Apply URL
            </GlassButton>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <GlassButton
              variant="glass"
              size="sm"
              icon={<Upload className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Local Image
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </section>
  );
};
