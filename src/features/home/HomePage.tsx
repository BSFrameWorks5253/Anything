import React from 'react';
import type { CreativeApp, NavigationPage } from '../../types/app.types';
import { HeroBanner } from './components/HeroBanner';
import { UpdatesAlertBar } from './components/UpdatesAlertBar';
import { QuickLaunchGrid } from './components/QuickLaunchGrid';
import { WhatIsNewSection } from './components/WhatIsNewSection';

interface HomePageProps {
  apps: CreativeApp[];
  onNavigate: (page: NavigationPage) => void;
  onOpenApp: (app: CreativeApp) => void;
  onUpdateAll: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  apps,
  onNavigate,
  onOpenApp,
  onUpdateAll,
}) => {
  const installedApps = apps.filter(
    (a) => a.status === 'installed' || a.status === 'update'
  );
  const updateApps = apps.filter((a) => a.status === 'update');

  return (
    <div className="p-6 lg:p-8 space-y-7 max-w-7xl mx-auto pb-14">
      {/* Liquid Glass Hero Banner */}
      <HeroBanner onOpenApps={() => onNavigate('apps')} />

      {/* Updates Alert Bar */}
      <UpdatesAlertBar
        count={updateApps.length}
        onUpdateAll={onUpdateAll}
        onViewApps={() => onNavigate('apps')}
      />

      {/* Quick Launch Dock */}
      <QuickLaunchGrid
        apps={installedApps.slice(0, 6)}
        onOpenApp={onOpenApp}
        onAddClick={() => onNavigate('apps')}
      />

      {/* WWDC26 Keynote Features */}
      <WhatIsNewSection />
    </div>
  );
};
