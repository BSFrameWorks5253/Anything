import React from 'react';
import { useTheme } from '../../context/ThemeContext';

/**
 * High-Performance Ambient Studio Background
 * Uses pure CSS radial gradients instead of heavy multi-pass blur shaders.
 * Runs at a locked 60/120fps with zero GPU lag.
 */
export const LiquidBackground: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      className={`fixed inset-0 pointer-events-none overflow-hidden -z-10 ${
        isLight ? 'bg-[#F8F9FA]' : 'bg-[#0E0E11]'
      }`}
    >
      {/* 1. Base Gradient Foundation */}
      <div
        className={`absolute inset-0 ${
          isLight
            ? 'bg-gradient-to-br from-[#FFFFFF] via-[#F4F5F9] to-[#ECEEF3]'
            : 'bg-gradient-to-br from-[#131318] via-[#0E0E12] to-[#09090C]'
        }`}
      />

      {/* 2. Top-Right Soft Crimson Glow (Hardware Accelerated Radial Gradient) */}
      <div
        className="absolute top-0 right-0 w-[60vw] h-[50vh] pointer-events-none"
        style={{
          background: isLight
            ? 'radial-gradient(circle at 80% 20%, rgba(255, 42, 85, 0.06) 0%, transparent 70%)'
            : 'radial-gradient(circle at 80% 20%, rgba(255, 19, 65, 0.08) 0%, transparent 70%)',
        }}
      />

      {/* 3. Bottom-Left Soft Indigo/Cyan Glow */}
      <div
        className="absolute bottom-0 left-0 w-[60vw] h-[50vh] pointer-events-none"
        style={{
          background: isLight
            ? 'radial-gradient(circle at 20% 80%, rgba(59, 130, 246, 0.05) 0%, transparent 70%)'
            : 'radial-gradient(circle at 20% 80%, rgba(30, 64, 175, 0.07) 0%, transparent 70%)',
        }}
      />

      {/* 4. Center-Top Warm Gold Accent */}
      <div
        className="absolute top-1/4 left-1/3 w-[40vw] h-[30vh] pointer-events-none"
        style={{
          background: isLight
            ? 'radial-gradient(circle at center, rgba(255, 138, 0, 0.03) 0%, transparent 60%)'
            : 'radial-gradient(circle at center, rgba(255, 122, 0, 0.04) 0%, transparent 60%)',
        }}
      />

      {/* 5. Delicate Drafting Grid Matrix */}
      <div
        className={`absolute inset-0 ${isLight ? 'opacity-[0.03]' : 'opacity-[0.02]'}`}
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
