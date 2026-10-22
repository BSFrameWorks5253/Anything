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
  onNavigate: (page: NavigationPage) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  updateCount: number;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  currentPage,
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
          searchQuery={searchQuery}
          onSearchChange={onSearchChange}
        />

        {/* Viewport Canvas with Smooth Scroll */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden relative">
          {children}
        </main>
      </div>

      {/* User Simulation Active Floating Pill */}
      {viewMode === 'user' && (
        <div className="fixed bottom-5 right-6 z-40 select-none">
          <div
            className={`px-3.5 py-2 rounded-full backdrop-blur-2xl border flex items-center gap-2.5 shadow-xl ${
              isLight
                ? 'bg-sky-600/95 text-white border-sky-400/60 shadow-sky-600/25'
                : 'bg-slate-900/90 text-emerald-300 border-emerald-400/40 shadow-emerald-500/20'
            }`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-semibold">👁️ Viewing as End-User</span>
            <button
              onClick={() => setViewMode('creator')}
              className="ml-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-white text-slate-950 hover:bg-slate-100 transition-all active:scale-95 shadow-sm"
            >
              Exit to Creator 🛠️
            </button>
          </div>
        </div>
      )}

      {/* Global Background Auto-Update Dialog */}
      <UpdateNotificationModal />
    </div>
  );
};
