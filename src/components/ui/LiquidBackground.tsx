import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Premium Studio Canvas Background
 * Replaces loud neon gradient blobs with a calm, refined, high-end studio atmosphere
 * crafted for the Anything ecosystem.
 */
export const LiquidBackground: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden -z-10 transition-colors duration-300 ${
        isLight ? 'bg-[#F8F9FA]' : 'bg-[#121214]'
      }`}
    >
      {/* Subtle Studio Vignette */}
      <div
        className={`absolute inset-0 ${
          isLight
            ? 'bg-gradient-to-b from-white via-[#F8F9FA] to-[#EEF0F2]'
            : 'bg-gradient-to-b from-[#18181B] via-[#121214] to-[#0A0A0C]'
        }`}
      />

      {/* Gentle, Whisper-soft Ambient Warmth / Depth (Understated & Non-Distracting) */}
      <div
        className={`absolute top-0 right-1/4 w-[800px] h-[400px] rounded-full blur-[140px] pointer-events-none transition-opacity duration-500 ${
          isLight
            ? 'bg-slate-200/40 opacity-60'
            : 'bg-white/[0.02] opacity-40'
        }`}
      />

      {/* Hairline Grid Accent (Precision Drafting Grid) */}
      <div
        className={`absolute inset-0 ${isLight ? 'opacity-[0.025]' : 'opacity-[0.015]'}`}
        style={{
          backgroundImage: isLight
            ? 'radial-gradient(#000000 1px, transparent 1px)'
            : 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
    </div>
  );
};
