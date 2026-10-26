import React, { useState } from 'react';
import { Palette, Sparkles, Check, RefreshCw, Sun, Moon, Sliders } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { useDataBus } from '../../context/DataBusContext';

export interface ThemePreset {
  id: string;
  name: string;
  gradient: string;
  accentColor: string;
  description: string;
}

const THEME_PRESETS: ThemePreset[] = [
  { id: 'wwdc26', name: 'WWDC26 Liquid Glass', gradient: 'from-blue-600 via-indigo-600 to-cyan-500', accentColor: '#38bdf8', description: 'Apple WWDC26 specular glass lighting with dynamic chromatic ambient glow.' },
  { id: 'cyber', name: 'Cyber Cyan', gradient: 'from-cyan-500 via-teal-500 to-emerald-400', accentColor: '#2dd4bf', description: 'High-visibility neon cyan accent tuned for code and creative production.' },
  { id: 'crimson', name: 'Crimson Pulse', gradient: 'from-rose-600 via-red-600 to-amber-500', accentColor: '#f43f5e', description: 'Vibrant studio lighting preset optimized for media processing.' },
  { id: 'obsidian', name: 'Obsidian Minimal', gradient: 'from-zinc-800 via-zinc-900 to-black', accentColor: '#a1a1aa', description: 'Ultra-clean dark glass contrast for distraction-free creative workflows.' },
];

export const EcosystemThemeSync: React.FC = () => {
  const { broadcastEvent } = useDataBus();
  const [activeThemeId, setActiveThemeId] = useState<string>(() => {
    return localStorage.getItem('anything_active_theme') || 'wwdc26';
  });

  const handleApplyTheme = (preset: ThemePreset) => {
    setActiveThemeId(preset.id);
    localStorage.setItem('anything_active_theme', preset.id);

    // Broadcast UI/UX theme sync event to all child applications via DataBus
    broadcastEvent('theme:sync', {
      themeId: preset.id,
      name: preset.name,
      accentColor: preset.accentColor,
      gradient: preset.gradient,
    });

    alert(`Ecosystem UI/UX Theme "${preset.name}" synchronized across all child apps!`);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold tracking-tight">Ecosystem UI/UX Theme Sync</h3>
            <GlassBadge variant="cyan" dot>DataBus Active</GlassBadge>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Synchronize UI accents, specular highlights, and liquid glass blur across all child applications.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {THEME_PRESETS.map((preset) => {
          const isActive = activeThemeId === preset.id;
          return (
            <GlassCard
              key={preset.id}
              className={`p-5 flex flex-col justify-between border transition-all ${
                isActive
                  ? 'border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                  : 'border-zinc-200 dark:border-white/10 hover:bg-white/5'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${preset.gradient} shadow-md shrink-0`} />
                    <h4 className="font-bold text-sm">{preset.name}</h4>
                  </div>
                  {isActive && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active
                    </span>
                  )}
                </div>

                <p className="text-xs text-zinc-400 leading-relaxed">
                  {preset.description}
                </p>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between mt-4">
                <span className="text-[11px] font-mono text-zinc-500">Accent: {preset.accentColor}</span>
                <button
                  onClick={() => handleApplyTheme(preset)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-white/10 hover:bg-white/20 text-zinc-200'
                  }`}
                >
                  {isActive ? 'Synchronized' : 'Sync to All Apps'}
                </button>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
};
