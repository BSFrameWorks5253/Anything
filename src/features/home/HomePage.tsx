import React from 'react';
import type { CatalogApp, NavigationPage } from '../../types/app.types';
import { HeroBanner } from './components/HeroBanner';
import { UpdatesAlertBar } from './components/UpdatesAlertBar';
import { QuickLaunchGrid } from './components/QuickLaunchGrid';
import { WhatIsNewSection } from './components/WhatIsNewSection';
import { TelemetryWidget } from './widgets/TelemetryWidget';
import { WorkspaceWidget } from './widgets/WorkspaceWidget';

interface HomePageProps {
  apps: CatalogApp[];
  onNavigate: (page: NavigationPage) => void;
  onOpenApp: (app: CatalogApp) => void;
  onUpdateAll: () => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  apps,
  onNavigate,
  onOpenApp,
  onUpdateAll,
}) => {
  const installedApps = apps.filter(
    (a) => a.status === 'installed' || a.status === 'update-available'
  );
  const updateApps = apps.filter((a) => a.status === 'update-available');

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

      {/* Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <TelemetryWidget apps={apps} />
        <WorkspaceWidget />
      </div>

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
