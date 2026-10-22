import React from 'react';
import { AnythingLogo } from '../../ui/AnythingLogo';
import { useTheme } from '../../../context/ThemeContext';

export const SidebarLogo: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      className="flex flex-col items-center mb-4 pt-1 select-none group cursor-pointer"
      title="Anything"
    >
      {/* Minimalist Adobe CC Style Emblem */}
      <AnythingLogo size="md" />

      <span
        className={`text-[11px] font-semibold tracking-tight mt-1.5 transition-colors select-none ${
          isLight ? 'text-zinc-800 group-hover:text-red-600' : 'text-zinc-300 group-hover:text-white'
        }`}
      >
        Anything
      </span>
    </div>
  );
};
