import React from 'react';
import type { CatalogApp, NavigationPage } from '../../../types/app.types';
import { useTheme } from '../../../context/ThemeContext';

interface HeaderTitleProps {
  page: NavigationPage;
  appName?: string;
  activeApp?: CatalogApp | null;
}

const pageTitles: Record<NavigationPage, { title: string; subtitle: string }> = {
  home: {
    title: 'Anything Hub',
    subtitle: 'Quick access, child apps & ecosystem updates',
  },
  apps: {
    title: 'Creative Apps',
    subtitle: 'Download, update and manage creative workstation applications',
  },
  files: {
    title: 'Drop Shelf & Shared Assets',
    subtitle: 'Mac-style drop shelf, QR mobile image hub & cross-app assets',
  },
  stats: {
    title: 'MediaFlow Production Stats',
    subtitle: 'Live Safar telemetry, date breakdown & media processing metrics',
  },
  onetap: {
    title: 'One Tap Production Studio',
    subtitle: 'Live production tracker, Safar progress & automatic conversion engine',
  },
  settings: {
    title: 'Preferences',
    subtitle: 'Account, workspace storage and ecosystem settings',
  },
};

export const HeaderTitle: React.FC<HeaderTitleProps> = ({ page, appName, activeApp }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const defaultMeta = pageTitles[page] || pageTitles.apps;
  const title = appName || (activeApp ? activeApp.name : defaultMeta.title);
  const subtitle = activeApp
    ? (activeApp.category ? `${activeApp.category} · Desktop Application` : 'Desktop Creative Application')
    : (appName ? 'Desktop Creative Application' : defaultMeta.subtitle);

  return (
    <div className="flex flex-col min-w-0">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight truncate">
          {title}
        </h2>
        {activeApp && (
          <span className="hidden sm:inline-flex px-1.5 py-0.5 rounded text-[10px] font-mono bg-zinc-200/80 dark:bg-white/10 text-zinc-600 dark:text-zinc-300 font-semibold">
            {activeApp.version ? `v${activeApp.version}` : 'Desktop'}
          </span>
        )}
      </div>
      <p
        className={`text-[11px] truncate ${
          isLight ? 'text-zinc-500 font-medium' : 'text-zinc-400 font-normal'
        }`}
      >
        {subtitle}
      </p>
    </div>
  );
};
