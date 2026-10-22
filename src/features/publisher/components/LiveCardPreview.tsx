import React from 'react';
import { Eye, Download, Play, Star, Sparkles } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import { AppIconRenderer } from '../../apps/components/CrazyAppStudio/AppIconRenderer';

interface LiveCardPreviewProps {
  name: string;
  category: string;
  version: string;
  description: string;
  size: string;
  iconType: 'monogram' | 'emoji' | 'image';
  iconValue: string;
  gradient: string;
  textColor: string;
  glowColor: string;
}

export const LiveCardPreview: React.FC<LiveCardPreviewProps> = ({
  name,
  category,
  version,
  description,
  size,
  iconType,
  iconValue,
  gradient,
  textColor,
  glowColor,
}) => {
  const dummyApp = {
    name: name || 'Your Application',
    shortName: name ? name.slice(0, 2).toUpperCase() : 'Ap',
    category,
    version: version || '1.0.0',
    description: description || 'Software description preview for the user side.',
    size,
    iconType,
    iconValue,
    gradient,
    textColor,
    glowColor,
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs font-mono uppercase text-white/50">
        <span className="flex items-center gap-1.5">
          <Eye className="w-3.5 h-3.5 text-cyan-400" />
          <span>Live User-Side Preview</span>
        </span>
        <span className="text-[10px] text-cyan-300">WWDC26 Liquid Glass</span>
      </div>

      {/* Render exact card */}
      <GlassCard
        variant="interactive"
        className="p-5 border-white/20 shadow-2xl relative overflow-hidden"
        glowColor={glowColor}
      >
        <div className="flex items-start gap-3.5">
          <AppIconRenderer app={dummyApp} size="md" />

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-sm font-bold text-white tracking-tight truncate">
                {dummyApp.name}
              </h3>
              <GlassBadge variant="cyan" dot className="shrink-0 text-[10px]">
                v{dummyApp.version}
              </GlassBadge>
            </div>

            <span className="text-[10px] text-white/40 block mt-0.5">
              {dummyApp.category} · {dummyApp.size || 'Release'}
            </span>

            <p className="text-[11px] text-white/50 mt-1 line-clamp-2 leading-relaxed">
              {dummyApp.description}
            </p>
          </div>
        </div>

        {/* Card Actions Bottom */}
        <div className="pt-3 border-t border-white/[0.06] mt-3 flex items-center justify-between">
          <span className="text-[10px] font-mono text-white/35">
            {dummyApp.size} · Auto-Update Ready
          </span>

          <div className="px-3.5 py-1.5 rounded-full text-xs font-semibold bg-white/[0.08] text-white border border-white/15 shadow-specular flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span>Install</span>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
