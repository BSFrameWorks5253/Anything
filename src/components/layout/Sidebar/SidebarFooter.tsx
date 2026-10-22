import React from 'react';
import { HelpCircle } from 'lucide-react';
import type { NavigationPage } from '../../../types/app.types';
import { useTheme } from '../../../context/ThemeContext';

interface SidebarFooterProps {
  onNavigate: (page: NavigationPage) => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      className={`flex flex-col items-center gap-2 mt-auto pt-3 border-t w-full transition-colors ${
        isLight ? 'border-zinc-200' : 'border-zinc-800'
      }`}
    >
      {/* Help Button */}
      <button
        onClick={() => onNavigate('settings')}
        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors ${
          isLight
            ? 'text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100'
            : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.06]'
        }`}
        title="Help & Preferences"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {/* User profile avatar */}
      <button
        onClick={() => onNavigate('settings')}
        className="relative group p-0.5 rounded-full transition-transform active:scale-95"
        title="Burhanuddin · Creative Cloud Individual"
      >
        <div
          className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border transition-colors ${
            isLight
              ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
              : 'bg-zinc-800 border-zinc-700 text-zinc-100'
          }`}
        >
          B
        </div>
        <span
          className={`absolute bottom-0 right-0 w-2 h-2 rounded-full bg-emerald-500 border ${
            isLight ? 'border-white' : 'border-zinc-900'
          }`}
        />
      </button>
    </div>
  );
};
