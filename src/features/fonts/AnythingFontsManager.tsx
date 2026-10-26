import React, { useState } from 'react';
import { Type, Check, Download, Sparkles, Sliders } from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassBadge } from '../../components/ui/GlassBadge';

export interface EcosystemFont {
  id: string;
  name: string;
  category: 'Display' | 'Sans Serif' | 'Monospace' | 'Serif';
  sampleText: string;
  weights: string[];
  description: string;
  isDefault?: boolean;
}

const ANYTHING_ECOSYSTEM_FONTS: EcosystemFont[] = [
  {
    id: 'anything-sans',
    name: 'Anything Liquid Display',
    category: 'Display',
    sampleText: 'Architecting the Future of Liquid Interfaces',
    weights: ['Regular 400', 'Medium 500', 'Bold 700', 'Black 900'],
    description: 'Signature variable typography for Anything ecosystem headers & hero text.',
    isDefault: true,
  },
  {
    id: 'anything-body',
    name: 'Anything Inter SF',
    category: 'Sans Serif',
    sampleText: 'Clean, legible, precision UI typography engineered for creative suites.',
    weights: ['Light 300', 'Regular 400', 'Medium 500', 'SemiBold 600'],
    description: 'Default body font shared across all child app controls and viewports.',
    isDefault: true,
  },
  {
    id: 'anything-mono',
    name: 'Anything Code Mono',
    category: 'Monospace',
    sampleText: 'const ecosystem = new AnythingSuite({ mode: "liquid" });',
    weights: ['Regular 400', 'Medium 500', 'Bold 700'],
    description: 'High-contrast monospace for code editors, telemetry, and terminal logs.',
    isDefault: true,
  },
];

export const AnythingFontsManager: React.FC = () => {
  const [activeFontId, setActiveFontId] = useState<string>('anything-sans');
  const [previewText, setPreviewText] = useState('Anything Ecosystem — Premium Typography');
  const [fontSize, setFontSize] = useState(24);

  const activeFont = ANYTHING_ECOSYSTEM_FONTS.find(f => f.id === activeFontId) || ANYTHING_ECOSYSTEM_FONTS[0];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-extrabold tracking-tight">Anything Fonts Repository</h3>
            <GlassBadge variant="cyan" dot>Ecosystem Standard</GlassBadge>
          </div>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Unified typography automatically synchronized across MediaFlow Studio, One Tap, and all Anything child apps.
          </p>
        </div>
      </div>

      {/* Font Custom Preview Controls */}
      <GlassCard className="p-5 space-y-4 border-zinc-200 dark:border-white/10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <input
            type="text"
            className="flex-1 bg-black/20 border border-white/10 rounded-xl px-4 py-2 text-sm outline-none text-zinc-100 placeholder-zinc-500"
            placeholder="Type custom preview text..."
            value={previewText}
            onChange={(e) => setPreviewText(e.target.value)}
          />

          <div className="flex items-center gap-3">
            <span className="text-xs font-mono text-zinc-400">{fontSize}px</span>
            <input
              type="range"
              min={12}
              max={64}
              value={fontSize}
              onChange={(e) => setFontSize(Number(e.target.value))}
              className="w-32 accent-cyan-500 cursor-pointer"
            />
          </div>
        </div>

        {/* Live Font Specimen Display */}
        <div className="p-6 rounded-2xl bg-black/40 border border-white/5 space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-500 font-mono">
            <span>{activeFont.name} ({activeFont.category})</span>
            <span>Synchronized via DataBus to MediaFlow & One Tap</span>
          </div>
          <p
            style={{ fontSize: `${fontSize}px` }}
            className="font-bold text-zinc-100 tracking-tight transition-all leading-snug"
          >
            {previewText || activeFont.sampleText}
          </p>
        </div>
      </GlassCard>

      {/* Font List */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {ANYTHING_ECOSYSTEM_FONTS.map((font) => (
          <GlassCard
            key={font.id}
            onClick={() => setActiveFontId(font.id)}
            className={`p-5 cursor-pointer transition-all border ${
              activeFontId === font.id
                ? 'border-cyan-500/50 bg-cyan-500/10 shadow-lg shadow-cyan-500/10'
                : 'border-zinc-200 dark:border-white/10 hover:bg-white/5'
            }`}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="font-bold text-sm">{font.name}</h4>
                <span className="text-[10px] text-zinc-500 font-mono uppercase">{font.category}</span>
              </div>
              {activeFontId === font.id && (
                <div className="p-1 rounded-full bg-cyan-500/20 text-cyan-400">
                  <Check className="w-3.5 h-3.5" />
                </div>
              )}
            </div>

            <p className="text-xs text-zinc-400 mb-4 line-clamp-2 leading-relaxed">
              {font.description}
            </p>

            <div className="flex items-center justify-between text-[11px] pt-3 border-t border-white/5 text-zinc-500">
              <span>{font.weights.length} Weights</span>
              <span className="text-cyan-400 font-semibold">Active in All Apps</span>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
