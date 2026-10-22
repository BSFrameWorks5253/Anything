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
          {/* Adobe Signature Crimson Squircle Tile */}
          <rect
            width="100"
            height="100"
            rx="20"
            fill="#E00201"
          />

          {/* Minimalist Mnemonic "An" in Adobe CC Typography */}
          <text
            x="50"
            y="67"
            textAnchor="middle"
            fill="#FFFFFF"
            style={{
              fontFamily: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
              fontWeight: 800,
              fontSize: '50px',
              letterSpacing: '-1.5px',
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
