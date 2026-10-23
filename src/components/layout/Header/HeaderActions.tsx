import React, { useState, useRef, useEffect } from 'react';
import {
  Bell,
  Sun,
  Moon,
  Eye,
  Wrench,
  CheckCircle2,
  RefreshCw,
  LogOut,
  LogIn,
  ShieldCheck,
  User,
  Phone,
} from 'lucide-react';
import { GlassInput } from '../../ui/GlassInput';
import { useTheme } from '../../../context/ThemeContext';
import { useViewMode } from '../../../context/ViewModeContext';
import { useAuth } from '../../../context/AuthContext';
import { getProfileInitial, getInitialGradient } from '../../../utils/userInitials';

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
  const { user, isAuthenticated, logout, openAuthModal } = useAuth();
  const isLight = theme === 'light';
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false);
      }
    };
    if (showNotifications || showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showNotifications, showUserMenu]);

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

      {/* User Authentication & Profile Menu */}
      {isAuthenticated && user ? (
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs select-none border transition-transform hover:scale-105 overflow-hidden relative ${
              isLight
                ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
                : 'bg-zinc-800 border-zinc-700 text-zinc-200'
            }`}
            title={`${user.name} (${user.email || user.role})`}
          >
            {user.avatar ? (
              <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
            ) : (
              <span className={`w-full h-full flex items-center justify-center bg-gradient-to-tr ${getInitialGradient(getProfileInitial(user))} text-white font-black`}>
                {getProfileInitial(user)}
              </span>
            )}
            <span className="absolute bottom-0 right-0 w-1.5 h-1.5 rounded-full bg-emerald-500 border border-slate-900" />
          </button>

          {showUserMenu && (
            <div
              className={`absolute right-0 mt-2 w-72 rounded-xl p-3.5 shadow-2xl border z-50 animate-in fade-in zoom-in-95 duration-100 ${
                isLight
                  ? 'bg-white border-zinc-200 text-zinc-900 shadow-zinc-200/80'
                  : 'bg-zinc-900 border-zinc-700 text-zinc-100 shadow-black/80'
              }`}
            >
              <div className="flex items-center gap-3 pb-3 border-b border-zinc-100 dark:border-zinc-800">
                <div className={`w-10 h-10 rounded-full overflow-hidden bg-gradient-to-tr ${getInitialGradient(getProfileInitial(user))} flex items-center justify-center text-white font-black text-sm shrink-0 shadow-md`}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    getProfileInitial(user)
                  )}
                </div>
                <div className="truncate">
                  <div className="flex items-center gap-1">
                    <p className="font-bold text-xs truncate">{user.name}</p>
                    <ShieldCheck className="w-3.5 h-3.5 text-cyan-500 shrink-0" />
                  </div>
                  <p className="text-[11px] text-zinc-500 font-mono truncate">{user.email}</p>
                  {user.phone && (
                    <p className="text-[10px] text-zinc-400 font-mono flex items-center gap-1 mt-0.5">
                      <Phone className="w-2.5 h-2.5" />
                      {user.phone}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-2 space-y-1">
                <div className="px-2 py-1 text-[10px] font-mono text-zinc-400 uppercase tracking-wider">
                  Session: Verified
                </div>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                  }}
                  className="w-full px-2.5 py-1.5 text-xs text-left rounded-lg text-rose-500 hover:bg-rose-500/10 flex items-center gap-2 transition-colors font-medium"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <button
          onClick={openAuthModal}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-600/10 hover:bg-red-600/20 text-red-600 border border-red-600/20 transition-colors"
        >
          <LogIn className="w-3 h-3" />
          <span>Sign In</span>
        </button>
      )}
    </div>
  );
};
