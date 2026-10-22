import React from 'react';
import type { NavigationPage } from '../../../types/app.types';
import { useTheme } from '../../../context/ThemeContext';

interface SidebarNavItemProps {
  id: NavigationPage;
  label: string;
  icon: React.ReactNode;
  isActive: boolean;
  badge?: string | number;
  onClick: (id: NavigationPage) => void;
}

export const SidebarNavItem: React.FC<SidebarNavItemProps> = ({
  id,
  label,
  icon,
  isActive,
  badge,
  onClick,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <button
      onClick={() => onClick(id)}
      className={`relative w-full flex flex-col items-center py-2.5 px-1 rounded-xl transition-all duration-150 group select-none ${
        isActive
          ? isLight
            ? 'bg-zinc-200/70 text-zinc-900 font-semibold shadow-xs'
            : 'bg-white/10 text-white font-medium'
          : isLight
          ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.05]'
      }`}
      title={label}
    >
      {/* Refined Adobe Accent Bar on Active */}
      {isActive && (
        <div className="absolute left-0 inset-y-2 w-1 bg-red-600 rounded-r-full" />
      )}

      {/* Icon */}
      <div className="relative p-0.5 transition-transform duration-150 group-hover:scale-105">
        {icon}
        {badge !== undefined && (
          <span className="absolute -top-1 -right-2 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-red-600 text-white shadow-xs">
            {badge}
          </span>
        )}
      </div>

      <span className="text-[10px] mt-1 tracking-tight font-medium">
        {label}
      </span>
    </button>
  );
};
