import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * Creative Cloud & Adobe Spectrum Ambient Gradient Background
 * Infuses rich, luminous organic gradient orbs (crimson, violet, sunset amber, and deep cyan)
 * overlaid with studio depth and delicate film texture.
 */
export const LiquidBackground: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden -z-10 transition-colors duration-500 ${
        isLight ? 'bg-[#F5F6F8]' : 'bg-[#0E0E12]'
      }`}
    >
      {/* 1. Base Multi-Stop Angular/Linear Foundation Gradient */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          isLight
            ? 'bg-gradient-to-br from-[#FFFFFF] via-[#F4F5F9] to-[#ECEEF3]'
            : 'bg-gradient-to-br from-[#16161D] via-[#0E0E12] to-[#08080A]'
        }`}
      />

      {/* 2. Top-Right Creative Spectrum Glow (Adobe Crimson to Sunset Magenta) */}
      <div
        className={`absolute -top-32 right-[-5%] w-[880px] h-[640px] rounded-full blur-[140px] pointer-events-none transition-all duration-700 ${
          isLight
            ? 'bg-gradient-to-br from-[#FF2A55]/15 via-[#FF6B4A]/10 to-[#9333EA]/10 opacity-70'
            : 'bg-gradient-to-br from-[#FF1341]/18 via-[#E11D48]/14 to-[#7C3AED]/12 opacity-80'
        }`}
      />

      {/* 3. Bottom-Left Creative Nebula (Deep Royal Indigo / Electric Violet to Cyan) */}
      <div
        className={`absolute -bottom-48 -left-24 w-[800px] h-[650px] rounded-full blur-[150px] pointer-events-none transition-all duration-700 ${
          isLight
            ? 'bg-gradient-to-tr from-[#3B82F6]/12 via-[#6366F1]/10 to-[#EC4899]/08 opacity-65'
            : 'bg-gradient-to-tr from-[#1E40AF]/16 via-[#4F46E5]/14 to-[#06B6D4]/10 opacity-75'
        }`}
      />

      {/* 4. Center-Top Warm Golden Sunset Accent (Subtle Spectrum Harmony) */}
      <div
        className={`absolute top-1/4 left-1/3 w-[520px] h-[360px] rounded-full blur-[120px] pointer-events-none transition-all duration-700 ${
          isLight
            ? 'bg-gradient-to-r from-[#FF8A00]/08 to-[#FF0055]/06 opacity-50'
            : 'bg-gradient-to-r from-[#FF7A00]/09 to-[#E11D48]/07 opacity-60'
        }`}
      />

      {/* 5. Smooth Studio Vignette to gently frame and focus content */}
      <div
        className={`absolute inset-0 pointer-events-none ${
          isLight
            ? 'bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(230,234,242,0.45)_100%)]'
            : 'bg-[radial-gradient(ellipse_at_center,transparent_45%,rgba(0,0,0,0.55)_100%)]'
        }`}
      />

      {/* 6. Hairline Micro-Grid Drafting Matrix */}
      <div
        className={`absolute inset-0 ${isLight ? 'opacity-[0.035]' : 'opacity-[0.025]'}`}
        style={{
          backgroundImage: isLight
            ? 'radial-gradient(#000000 1px, transparent 1px)'
            : 'radial-gradient(#ffffff 1px, transparent 1px)',
          backgroundSize: '28px 28px',
        }}
      />
    </div>
  );
};
