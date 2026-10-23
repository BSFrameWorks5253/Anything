import React from 'react';
import type { NavigationPage } from '../../../types/app.types';
import { useTheme } from '../../../context/ThemeContext';
import { useViewMode } from '../../../context/ViewModeContext';

interface HeaderTitleProps {
  page: NavigationPage;
  appName?: string;
}

const pageTitles: Record<NavigationPage, { title: string; subtitle: string }> = {
  home: {
    title: 'Anything Hub',
    subtitle: 'Quick access, child apps & ecosystem updates',
  },
  apps: {
    title: 'All Apps',
    subtitle: 'Download, update and manage creative applications',
  },
  publisher: {
    title: 'Catalog Publisher',
    subtitle: 'Distribute software & manage releases',
  },
  files: {
    title: 'Cloud Documents',
    subtitle: 'Synchronized assets & cloud storage',
  },
  settings: {
    title: 'Preferences',
    subtitle: 'Account, storage and system settings',
  },
};

export const HeaderTitle: React.FC<HeaderTitleProps> = ({ page, appName }) => {
  const meta = appName
    ? { title: appName, subtitle: 'Child Application Details & Configuration' }
    : pageTitles[page] || pageTitles.apps;
  const { theme } = useTheme();
  const { viewMode } = useViewMode();
  const isLight = theme === 'light';

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className="flex flex-col">
        <div className="flex items-center gap-2">
          <h1
            className={`text-sm font-semibold tracking-tight ${
              isLight ? 'text-zinc-900' : 'text-zinc-100'
            }`}
          >
            {meta.title}
          </h1>

          {viewMode === 'user' && (
            <span
              className={`text-[10px] font-medium px-2 py-0.5 rounded-md border ${
                isLight
                  ? 'bg-zinc-100 border-zinc-200 text-zinc-600'
                  : 'bg-zinc-800 border-zinc-700 text-zinc-300'
              }`}
            >
              User View
            </span>
          )}
        </div>

        <p
          className={`text-[11px] hidden sm:block ${
            isLight ? 'text-zinc-500' : 'text-zinc-400'
          }`}
        >
          {meta.subtitle}
        </p>
      </div>
    </div>
  );
};
