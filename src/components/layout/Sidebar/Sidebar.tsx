import React from 'react';
import {
  LayoutGrid,
  Compass,
  FolderClosed,
  Sliders,
} from 'lucide-react';
import type { NavigationPage } from '../../../types/app.types';
import { SidebarLogo } from './SidebarLogo';
import { SidebarFooter } from './SidebarFooter';
import { useTheme } from '../../../context/ThemeContext';

interface SidebarProps {
  activePage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  updateCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const sections = [
    {
      title: 'APPS',
      items: [
        {
          id: 'home' as NavigationPage,
          label: 'Home',
          icon: <LayoutGrid className="w-4 h-4" />,
        },
        {
          id: 'apps' as NavigationPage,
          label: 'Apps',
          icon: <Compass className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'SHELF & FILES',
      items: [
        {
          id: 'files' as NavigationPage,
          label: 'Files',
          icon: <FolderClosed className="w-4 h-4" />,
        },
      ],
    },
    {
      title: 'PREFERENCES',
      items: [
        {
          id: 'settings' as NavigationPage,
          label: 'Settings',
          icon: <Sliders className="w-4 h-4" />,
        },
      ],
    },
  ];

  return (
    <aside
      className={`w-[88px] h-full flex flex-col items-center py-4 px-2 select-none z-30 relative transition-colors duration-200 shrink-0 ${
        isLight
          ? 'bg-[#F2F3F5] border-r border-[#E0E2E6]'
          : 'bg-[#18181B] border-r border-[#27272A]'
      }`}
    >
      <SidebarLogo />

      {/* Nav stack */}
      <nav className="flex flex-col gap-3 w-full mt-2 flex-1 overflow-y-auto overflow-x-hidden no-scrollbar">
        {sections.map((sec, sIdx) => {
          const visibleItems = sec.items;
          if (visibleItems.length === 0) return null;

          return (
            <div key={sec.title} className="flex flex-col items-center w-full">
              {sIdx > 0 && (
                <div
                  className={`w-8 h-[1px] my-1 mb-2 ${
                    isLight ? 'bg-zinc-300/80' : 'bg-zinc-800/80'
                  }`}
                />
              )}

              <span
                className={`text-[8px] font-mono tracking-widest uppercase mb-1.5 ${
                  isLight ? 'text-zinc-400 font-bold' : 'text-zinc-500 font-semibold'
                }`}
              >
                {sec.title}
              </span>

              <div className="flex flex-col gap-1.5 w-full px-0.5">
                {visibleItems.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => onNavigate(item.id)}
                      className={`relative w-full flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all duration-150 ease-out active:scale-[0.96] group select-none cursor-pointer ${
                        isActive
                          ? isLight
                            ? 'bg-white text-zinc-950 font-bold shadow-xs'
                            : 'bg-[#27272A] text-white font-bold shadow-xs'
                          : isLight
                          ? 'text-zinc-600 hover:text-zinc-950 hover:bg-zinc-200/60 font-medium'
                          : 'text-zinc-400 hover:text-zinc-100 hover:bg-white/[0.04] font-medium'
                      }`}
                      title={item.label}
                    >
                      {/* Signature Active Indicator Bar */}
                      {isActive && (
                        <div className="absolute left-0 inset-y-2.5 w-[3px] bg-blue-600 dark:bg-blue-500 rounded-r-full shadow-[0_0_8px_rgba(59,130,246,0.7)]" />
                      )}

                      <div className="relative p-0.5 transition-transform duration-150 group-hover:scale-105">
                        {item.icon}
                      </div>

                      <span className="text-[10.5px] mt-1 tracking-tight leading-tight text-center whitespace-nowrap font-medium">
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>

      <SidebarFooter onNavigate={onNavigate} />
    </aside>
  );
};
