import React from 'react';
import type { NavigationPage } from '../../types/app.types';
import { LiquidBackground } from '../ui/LiquidBackground';
import { Sidebar } from './Sidebar/Sidebar';
import { Header } from './Header/Header';
import { UpdateNotificationModal } from '../ui/UpdateNotificationModal';
import { useTheme } from '../../context/ThemeContext';
import { useViewMode } from '../../context/ViewModeContext';

interface AppLayoutProps {
  currentPage: NavigationPage;
  appName?: string;
  onNavigate: (page: NavigationPage) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  updateCount: number;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPage,
  appName,
  onNavigate,
  searchQuery,
  onSearchChange,
  updateCount,
  children,
}) => {
  const { theme } = useTheme();
  const { viewMode, setViewMode } = useViewMode();
  const isLight = theme === 'light';

  return (
    <div
      data-theme={theme}
      className={`relative flex h-screen w-screen overflow-hidden font-sans antialiased transition-colors duration-200 ${
        isLight
          ? 'bg-[#F8F9FA] text-zinc-900 selection:bg-red-500/20 selection:text-red-950'
          : 'bg-[#121214] text-zinc-100 selection:bg-red-500/30 selection:text-white'
      }`}
    >
      {/* WWDC26 Ambient Liquid Glow Background */}
      <LiquidBackground />

      {/* Frosted Floating Glass Navigation Bar */}
      <Sidebar
        activePage={currentPage}
        onNavigate={onNavigate}
        updateCount={updateCount}
      />

      {/* Main Container */}
      <div className="flex flex-col flex-1 h-full overflow-hidden relative">
        <Header
          page={currentPage}
          appName={appName}
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />

        {/* Viewport Canvas with Smooth Scroll */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
      </div>

      {/* Global Background Auto-Update Dialog */}
      <UpdateNotificationModal />
    </div>
  );
};
