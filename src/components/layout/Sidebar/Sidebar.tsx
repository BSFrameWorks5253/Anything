import React from 'react';
import { LayoutGrid, Compass, CloudUpload, FolderClosed, Sliders, Sparkles } from 'lucide-react';
import type { NavigationPage } from '../../../types/app.types';
import { SidebarLogo } from './SidebarLogo';
import { SidebarNavItem } from './SidebarNavItem';
import { SidebarFooter } from './SidebarFooter';
import { useTheme } from '../../../context/ThemeContext';
import { useViewMode } from '../../../context/ViewModeContext';

interface SidebarProps {
  activePage: NavigationPage;
  onNavigate: (page: NavigationPage) => void;
  updateCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activePage,
  onNavigate,
  updateCount = 0,
}) => {
  const { theme } = useTheme();
  const { viewMode } = useViewMode();
  const isLight = theme === 'light';

  const allNavItems = [
    {
      id: 'home' as NavigationPage,
      label: 'Home',
      icon: <LayoutGrid className="w-4 h-4" />,
      creatorOnly: false,
    },
    {
      id: 'apps' as NavigationPage,
      label: 'Apps',
      icon: <Compass className="w-4 h-4" />,
      badge: updateCount > 0 ? updateCount : undefined,
      creatorOnly: false,
    },
    {
      id: 'creator' as NavigationPage,
      label: 'Creator',
      icon: <Sparkles className="w-4 h-4 text-cyan-500" />,
      creatorOnly: false,
    },
    {
      id: 'publisher' as NavigationPage,
      label: 'Publish',
      icon: <CloudUpload className="w-4 h-4" />,
      creatorOnly: true,
    },
    {
      id: 'files' as NavigationPage,
      label: 'Files',
      icon: <FolderClosed className="w-4 h-4" />,
      creatorOnly: false,
    },
    {
      id: 'settings' as NavigationPage,
      label: 'Settings',
      icon: <Sliders className="w-4 h-4" />,
      creatorOnly: false,
    },
  ];

  const navItems = allNavItems.filter((item) => (viewMode === 'user' ? !item.creatorOnly : true));

  return (
    <aside
      className={`w-[76px] h-full flex flex-col items-center py-3.5 px-2 select-none z-30 relative transition-colors duration-200 shrink-0 ${
        isLight
          ? 'bg-[#FAFAFA] border-r border-zinc-200'
          : 'bg-[#18181B] border-r border-zinc-800'
      }`}
    >
      <SidebarLogo />

      {/* Nav stack */}
      <nav className="flex flex-col gap-1 w-full">
        {navItems.map((item) => (
          <SidebarNavItem
            key={item.id}
            id={item.id}
            label={item.label}
            icon={item.icon}
            isActive={activePage === item.id}
            badge={item.badge}
            onClick={onNavigate}
          />
        ))}
      </nav>

      <SidebarFooter onNavigate={onNavigate} />
    </aside>
  );
};
