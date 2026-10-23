import React from 'react';
import type { NavigationPage } from '../../../types/app.types';
import { WindowControls } from './WindowControls';
import { HeaderTitle } from './HeaderTitle';
import { HeaderActions } from './HeaderActions';
import { useTheme } from '../../../context/ThemeContext';
import { AnythingBrandEmblem } from '../../ui/AdobeSplashScreen';

interface HeaderProps {
  page: NavigationPage;
  appName?: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  page,
  appName,
  searchQuery,
  onSearchChange,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const handleDoubleClickHeader = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('input') || target.closest('a')) return;
    window.electronAPI?.maximizeWindow();
  };

  return (
    <header
      onDoubleClick={handleDoubleClickHeader}
      className={`h-12 pl-4 pr-0 flex items-center justify-between z-30 shrink-0 relative transition-colors duration-200 select-none ${
        isLight
          ? 'bg-white border-b border-zinc-200'
          : 'bg-[#18181B] border-b border-zinc-800'
      }`}
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left: Active Page Title with Logo */}
      <div
        className="flex items-center gap-2.5 shrink-0 py-1"
        style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
      >
        <AnythingBrandEmblem size={24} className="rounded-lg shrink-0 shadow-xs" />
        <HeaderTitle page={page} appName={appName} />
      </div>

      {/* Center Draggable Spacer */}
      <div className="flex-1 h-full min-w-[20px]" />

      {/* Right: Actions, Search & Window Caption Controls */}
      <div className="flex items-center gap-2 h-full">
        <HeaderActions
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />

        {/* Windows 11 Fluent Window Caption Controls (Flush Right) */}
        <div className="h-full flex items-center pl-1 border-l border-zinc-200 dark:border-zinc-800 ml-1">
          <WindowControls />
        </div>
      </div>
    </header>
  );
};
