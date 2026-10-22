import React from 'react';
import { Plus, Check, Sparkles } from 'lucide-react';
import type { CreativeApp } from '../../../../types/app.types';
import { popularPresets } from '../../../../data/apps.data';
import { AppIconRenderer } from './AppIconRenderer';
import { useTheme } from '../../../../context/ThemeContext';

interface PresetOneClickPickerProps {
  existingNames: string[];
  onAddPreset: (preset: Partial<CreativeApp>) => void;
}

export const PresetOneClickPicker: React.FC<PresetOneClickPickerProps> = ({
  existingNames,
  onAddPreset,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span
          className={`text-xs font-mono uppercase flex items-center gap-1.5 ${
            isLight ? 'text-slate-600 font-semibold' : 'text-white/50'
          }`}
        >
          <Sparkles className={`w-3.5 h-3.5 ${isLight ? 'text-sky-600' : 'text-cyan-400'}`} />
          <span>Quick-Add Popular Applications</span>
        </span>
        <span className={`text-[10px] ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
          1-Click Auto Registration
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        {popularPresets.map((preset) => {
          const isAdded = existingNames.some(
            (n) => n.toLowerCase() === preset.name?.toLowerCase()
          );

          return (
            <div
              key={preset.name}
              className={`p-3 rounded-xl border flex items-center justify-between gap-2.5 transition-all select-none ${
                isAdded
                  ? isLight
                    ? 'bg-slate-100/60 border-slate-200 opacity-60'
                    : 'bg-white/[0.02] border-white/5 opacity-50'
                  : isLight
                  ? 'bg-white/80 border-slate-900/10 hover:border-sky-400/50 hover:bg-white shadow-sm cursor-pointer'
                  : 'bg-white/[0.04] border-white/10 hover:border-white/25 hover:bg-white/[0.07] cursor-pointer'
              }`}
              onClick={() => !isAdded && onAddPreset(preset)}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <AppIconRenderer app={preset} size="sm" />
                <div className="min-w-0">
                  <span
                    className={`text-xs font-semibold block truncate ${
                      isLight ? 'text-slate-900' : 'text-white'
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

              {isAdded ? (
                <span className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <Check className="w-3 h-3 stroke-[2.5]" />
                </span>
              ) : (
                <button
                  type="button"
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-all ${
                    isLight
                      ? 'bg-slate-200/80 hover:bg-sky-500 hover:text-white text-slate-700'
                      : 'bg-white/10 hover:bg-cyan-400 hover:text-slate-950 text-white'
                  }`}
                  title="Add to Hub"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
