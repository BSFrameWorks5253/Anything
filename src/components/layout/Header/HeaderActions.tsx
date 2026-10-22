import React, { useState, useRef, useEffect } from 'react';
import { Bell, Sun, Moon, Eye, Wrench, CheckCircle2, RefreshCw } from 'lucide-react';
import { GlassInput } from '../../ui/GlassInput';
import { useTheme } from '../../../context/ThemeContext';
import { useViewMode } from '../../../context/ViewModeContext';

interface HeaderActionsProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const HeaderActions: React.FC<HeaderActionsProps> = ({
  searchQuery,
  onSearchChange,
}) => {
  const { theme, toggleTheme } = useTheme();
  const { viewMode, setViewMode } = useViewMode();
  const isLight = theme === 'light';
  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    if (showNotifications) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications]);

  return (
    <div
      className="flex items-center gap-2"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {/* Search Bar */}
      <GlassInput
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        className="w-48 sm:w-64 md:w-72"
      />

      {/* Mode Switcher */}
      <div
        className={`inline-flex p-0.5 rounded-lg border transition-colors select-none ${
          isLight
            ? 'bg-zinc-100 border-zinc-200'
            : 'bg-zinc-800/80 border-zinc-700'
        }`}
      >
        <button
          onClick={() => setViewMode('creator')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
            viewMode === 'creator'
              ? isLight
                ? 'bg-white text-zinc-900 font-semibold shadow-xs'
                : 'bg-zinc-700 text-white font-semibold shadow-xs'
              : isLight
              ? 'text-zinc-500 hover:text-zinc-900'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="Creator Mode: Manage apps, push packages, link GitHub"
        >
          <Wrench className="w-3 h-3" />
          <span className="hidden sm:inline">Creator</span>
        </button>

        <button
          onClick={() => setViewMode('user')}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition-colors ${
            viewMode === 'user'
              ? isLight
                ? 'bg-white text-zinc-900 font-semibold shadow-xs'
                : 'bg-zinc-700 text-white font-semibold shadow-xs'
              : isLight
              ? 'text-zinc-500 hover:text-zinc-900'
              : 'text-zinc-400 hover:text-zinc-200'
          }`}
          title="User View: Test the end-user experience"
        >
          <Eye className="w-3 h-3" />
          <span className="hidden sm:inline">User View</span>
        </button>
      </div>

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
          isLight
            ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
            : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
        }`}
        title={`Switch to ${isLight ? 'Dark' : 'Light'} Mode`}
        aria-label="Toggle Theme"
      >
        {isLight ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
      </button>

      {/* Notifications */}
      <div className="relative" ref={notifRef}>
        <button
          onClick={() => setShowNotifications(!showNotifications)}
          className={`relative w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
            isLight
              ? 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
              : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800'
          }`}
          title="Notifications & Updates"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-red-600" />
        </button>

        {showNotifications && (
          <div
            className={`absolute right-0 mt-2 w-72 rounded-xl p-3.5 shadow-xl border z-50 animate-in fade-in zoom-in-95 duration-100 ${
              isLight
                ? 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-200/80'
                : 'bg-zinc-900 border-zinc-700 text-zinc-100 shadow-black/60'
            }`}
          >
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-100 dark:border-zinc-800">
              <span className="text-xs font-semibold">Activity</span>
              <span className="text-[10px] text-zinc-500 font-mono">Tray Daemon On</span>
            </div>

            <div className="space-y-2 pt-2.5">
              <div className="flex items-start gap-2 text-xs">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-zinc-800 dark:text-zinc-200">Catalog Synced</p>
                  <p className="text-[11px] text-zinc-500">All local applications verified.</p>
                </div>
              </div>

              <div className="flex items-start gap-2 text-xs">
                <RefreshCw className="w-3.5 h-3.5 text-zinc-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-zinc-800 dark:text-zinc-200">GitHub Releases</p>
                  <p className="text-[11px] text-zinc-500">Checking for updates periodically.</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* User Monogram */}
      <div
        className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs select-none border transition-colors ${
          isLight
            ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
            : 'bg-zinc-800 border-zinc-700 text-zinc-200'
        }`}
        title="Burhanuddin"
      >
        B
      </div>
    </div>
  );
};
