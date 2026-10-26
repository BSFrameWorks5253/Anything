import React from 'react';
import { Plus, Sparkles, Wand2, Compass } from 'lucide-react';
import type { CreativeApp } from '../../../../types/app.types';
import { GlassCard } from '../../../../components/ui/GlassCard';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { popularPresets } from '../../../../data/apps.data';
import { AppIconRenderer } from './AppIconRenderer';
import { ExeDropTarget } from './ExeDropTarget';
import { useTheme } from '../../../../context/ThemeContext';

interface EmptyHubHeroProps {
  onOpenAddModal: () => void;
  onAddPreset: (preset: Partial<CreativeApp>) => void;
  onAutoAdd: (newApp: CreativeApp) => void;
}

export const EmptyHubHero: React.FC<EmptyHubHeroProps> = ({
  onOpenAddModal,
  onAddPreset,
  onAutoAdd,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-6">
      {/* Hero Welcome Box */}
      <GlassCard
        variant="elevated"
        className={`p-8 text-center relative overflow-hidden shadow-2xl group ${
          isLight ? 'border-white/80' : 'border-white/20'
        }`}
      >
        <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-purple-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-xl mx-auto flex flex-col items-center">
          <div className="w-16 h-16 rounded-3xl p-[1px] bg-gradient-to-tr from-cyan-400 via-sky-300 to-indigo-500 mb-4 shadow-xl shadow-cyan-400/25">
            <div
              className={`w-full h-full rounded-[23px] flex items-center justify-center border ${
                isLight
                  ? 'bg-white/95 border-sky-300 shadow-md'
                  : 'bg-slate-950/90 border-white/20'
              }`}
            >
              <Compass className={`w-8 h-8 ${isLight ? 'text-sky-600' : 'text-cyan-300'}`} />
            </div>
          </div>

          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono mb-3 border ${
              isLight
                ? 'bg-sky-500/10 border-sky-400/30 text-sky-800 font-semibold'
                : 'bg-white/[0.08] border-white/10 text-cyan-300'
            }`}
          >
            <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-sky-600' : 'text-cyan-300'}`} />
            <span>Zero Bloatware · Your Clean Workspace</span>
          </div>

          <h2
            className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${
              isLight ? 'text-slate-900' : 'text-white'
            }`}
          >
            Welcome to <br />
            <span className="shimmer-text">Anything.</span>
          </h2>

          <p
            className={`text-sm mt-2.5 leading-relaxed ${
              isLight ? 'text-slate-600 font-medium' : 'text-white/60'
            }`}
          >
            All default mock apps have been removed. Add your real applications, scripts, games, or web tools using our drag-and-drop studio below.
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <GlassButton
              variant="primary"
              size="md"
              onClick={onOpenAddModal}
              icon={<Plus className="w-4 h-4 stroke-[2.5]" />}
            >
              Open Application Studio
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Drag & Drop Target for executables */}
      <ExeDropTarget onAutoAdd={onAutoAdd} />

      {/* 1-Click Popular Add Section */}
      <GlassCard
        variant="interactive"
        className={`p-6 ${isLight ? 'border-white/80' : 'border-white/10'}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h4
              className={`text-sm font-bold tracking-tight flex items-center gap-2 ${
                isLight ? 'text-slate-900' : 'text-white'
              }`}
            >
              <Wand2 className={`w-4 h-4 ${isLight ? 'text-sky-600' : 'text-cyan-400'}`} />
              <span>Quick-Add Tools You Probably Have</span>
            </h4>
            <p className={`text-xs mt-0.5 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
              Click any tool to instantly register it into your hub
            </p>
          </div>
        </div>

        {popularPresets.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {popularPresets.map((preset) => (
              <button
                key={preset.name}
                type="button"
                onClick={() => onAddPreset(preset)}
                className={`p-3 rounded-xl border flex items-center justify-between gap-3 text-left transition-all hover:scale-102 group select-none ${
                  isLight
                    ? 'bg-white/80 hover:bg-white border-slate-900/10 hover:border-sky-400/50 shadow-sm'
                    : 'bg-white/[0.03] hover:bg-white/[0.08] border-white/10 hover:border-white/25'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <AppIconRenderer app={preset} size="sm" />
                  <div className="min-w-0">
                    <span
                      className={`text-xs font-semibold block truncate transition-colors ${
                        isLight
                          ? 'text-slate-900 group-hover:text-sky-600'
                          : 'text-white group-hover:text-cyan-300'
                      }`}
                    >
                      {preset.name}
                    </span>
                    <span
                      className={`text-[10px] block truncate ${
                        isLight ? 'text-slate-500' : 'text-white/40'
                      }`}
                    >
                      {preset.category}
                    </span>
                  </div>
                </div>

                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isLight
                      ? 'bg-slate-200/80 group-hover:bg-sky-500 group-hover:text-white text-slate-700'
                      : 'bg-white/10 group-hover:bg-cyan-400 group-hover:text-slate-950 text-white'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </span>
              </button>
            ))}
          </div>
        )}
      </GlassCard>
    </div>
  );
};
