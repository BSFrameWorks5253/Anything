import React, { useState, useEffect } from 'react';
import { HelpCircle } from 'lucide-react';
import type { NavigationPage } from '../../../types/app.types';
import { useTheme } from '../../../context/ThemeContext';
import { useAuth } from '../../../context/AuthContext';
import { getProfileInitial, getInitialGradient } from '../../../utils/userInitials';

interface SidebarFooterProps {
  onNavigate: (page: NavigationPage) => void;
}

export const SidebarFooter: React.FC<SidebarFooterProps> = ({ onNavigate }) => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const isLight = theme === 'light';

  const [avatar, setAvatar] = useState<string | null>(() => {
    return localStorage.getItem('anything_user_avatar') || null;
  });

  useEffect(() => {
    const handleStorage = () => {
      setAvatar(localStorage.getItem('anything_user_avatar') || null);
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const activeAvatar = user?.avatar || avatar;
  const initial = getProfileInitial(user);
  const gradient = getInitialGradient(initial);

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
        title={user ? `${user.name} (${user.email})` : 'Burhanuddin Sounasath · 8369811201 · Architect'}
      >
        <div
          className={`w-8 h-8 rounded-full overflow-hidden flex items-center justify-center text-xs font-bold border transition-colors ${
            isLight
              ? 'bg-zinc-100 border-zinc-300 text-zinc-800'
              : 'bg-zinc-800 border-zinc-700 text-zinc-100'
          }`}
        >
          {activeAvatar ? (
            <img src={activeAvatar} alt={user?.name || 'Profile'} className="w-full h-full object-cover" />
          ) : (
            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-tr ${gradient} text-white font-black`}>
              {initial}
            </div>
          )}
        </div>
        <span
          className={`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 shadow-xs ${
            isLight ? 'border-white' : 'border-zinc-900'
          }`}
        />
      </button>
    </div>
  );
};
