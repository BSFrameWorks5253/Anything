import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface AnythingLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showText?: boolean;
}

export const AnythingLogo: React.FC<AnythingLogoProps> = ({
  size = 'md',
  className = '',
  showText = false,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const pixelDimensions = {
    sm: { w: 32, h: 32 },
    md: { w: 42, h: 42 },
    lg: { w: 56, h: 56 },
    xl: { w: 72, h: 72 },
  }[size];

  return (
    <div className={`relative inline-flex items-center gap-2.5 select-none ${className}`}>
      {/* Adobe CC Minimalist Mnemonic Tile (An = Anything) */}
      <div
        className="relative shrink-0 shadow-xs transition-transform duration-150 hover:scale-105"
        style={{
          width: pixelDimensions.w,
          height: pixelDimensions.h,
        }}
      >
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Adobe Dark Studio Squircle Tile */}
            <linearGradient id="logoBgGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#25252A" />
              <stop offset="50%" stopColor="#18181C" />
              <stop offset="100%" stopColor="#0F0F12" />
            </linearGradient>

            {/* Authentic Adobe Creative Cloud Spectrum Gradient */}
            <linearGradient id="spectrumGradient" x1="20" y1="70" x2="80" y2="25" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#E91E63" />    {/* Magenta / Pink */}
              <stop offset="28%" stopColor="#FF1341" />   {/* Crimson Red */}
              <stop offset="58%" stopColor="#FF4500" />   {/* Vermilion Orange */}
              <stop offset="85%" stopColor="#FF8A00" />   {/* Amber */}
              <stop offset="100%" stopColor="#FFB300" />  {/* Golden Yellow */}
            </linearGradient>

            <radialGradient id="logoGlow" cx="25" cy="25" r="60" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.12" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Squircle Tile with Specular Lighting */}
          <rect width="100" height="100" rx="22" fill="url(#logoBgGrad)" />
          <rect width="100" height="100" rx="22" fill="url(#logoGlow)" />
          <rect x="1" y="1" width="98" height="98" rx="21" stroke="#FFFFFF" strokeOpacity="0.18" strokeWidth="1.5" />

          {/* Creative Cloud-inspired Multi-Color Spectrum Loop (Continuous Smooth Tube) */}
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M 50,23.5
               C 60.1,23.5 68.3,30.1 71.4,38.7
               C 79.6,40.3 85.9,47.3 85.9,55.9
               C 85.9,65.6 78.1,73.4 68.4,73.4
               C 62.9,73.4 56.3,70.3 50,65.2
               C 43.7,70.3 37.1,73.4 31.6,73.4
               C 21.9,73.4 14.1,65.6 14.1,55.9
               C 14.1,47.3 20.4,40.3 28.6,38.7
               C 31.7,30.1 39.9,23.5 50,23.5 Z
               M 50,32.8
               C 43,32.8 36.7,37.9 34.8,44.9
               C 34.4,46.5 32.8,47.7 31.2,47.7
               C 26.1,47.7 22.7,51.2 22.7,55.9
               C 22.7,61 26.6,64.8 31.6,64.8
               C 35.1,64.8 40.2,62.1 45.3,57.4
               C 48.1,54.9 51.9,54.9 54.7,57.4
               C 59.8,62.1 64.9,64.8 68.4,64.8
               C 73.4,64.8 77.3,61 77.3,55.9
               C 77.3,51.2 73.9,47.7 68.8,47.7
               C 67.2,47.7 65.6,46.5 65.2,44.9
               C 63.3,37.9 57,32.8 50,32.8 Z"
            fill="url(#spectrumGradient)"
          />
          {/* Central Keystone 'A' Delta Spark */}
          <path d="M 50 37.1 L 44.9 47.7 L 55.1 47.7 Z" fill="#FFFFFF" opacity="0.95" />

          {/* Minimalist Mnemonic "An" in Crisp Adobe Typography */}
          <text
            x="50"
            y="86.5"
            textAnchor="middle"
            fill="#FFFFFF"
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              fontWeight: 800,
              fontSize: '15px',
              letterSpacing: '-0.3px',
            }}
          >
            An
          </text>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col select-none">
          <span
            className={`text-sm font-bold tracking-tight leading-none ${
              isLight ? 'text-zinc-900' : 'text-zinc-100'
            }`}
          >
            Anything
          </span>
          <span className="text-[10px] font-mono tracking-wider text-zinc-400 dark:text-zinc-500 uppercase mt-0.5">
            Suite
          </span>
        </div>
      )}
    </div>
  );
};
