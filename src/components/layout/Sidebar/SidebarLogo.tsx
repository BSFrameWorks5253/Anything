import React from 'react';
import { AnythingLogo } from '../../ui/AnythingLogo';
import { useTheme } from '../../../context/ThemeContext';

export const SidebarLogo: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      className="flex flex-col items-center mb-3 pt-0.5 select-none group cursor-pointer"
      title="Anything"
    >
      {/* Authentic Adobe CC Spectrum Logo Emblem */}
      <AnythingLogo size="md" />

      <span
        className={`text-[11px] font-semibold tracking-tight mt-1 transition-colors select-none ${
          isLight ? 'text-zinc-800 group-hover:text-red-600' : 'text-zinc-300 group-hover:text-white'
        }`}
      >
        Anything
      </span>
    </div>
  );
};
