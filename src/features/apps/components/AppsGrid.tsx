import React from 'react';
import { PackageOpen } from 'lucide-react';
import type { CatalogApp } from '../../../types/app.types';
import { AppCard } from './AppCard';
import { GlassCard } from '../../../components/ui/GlassCard';

interface AppsGridProps {
  apps: CatalogApp[];
  onOpenDetail: (app: CatalogApp) => void;
  onInstall: (app: CatalogApp) => void;
  onLaunch: (app: CatalogApp) => void;
  onUpdate: (app: CatalogApp) => void;
  onFixPath: (app: CatalogApp) => void;
  onUninstall: (appId: string) => void;
}

export const AppsGrid: React.FC<AppsGridProps> = ({
  apps,
  onOpenDetail,
  onInstall,
  onLaunch,
  onUpdate,
  onFixPath,
  onUninstall,
}) => {
  if (apps.length === 0) {
    return (
      <GlassCard variant="sunken" className="p-12 text-center my-8">
        <PackageOpen className="w-12 h-12 text-white/30 mx-auto mb-3" />
        <h4 className="text-base font-semibold text-white/80">No applications match your filter</h4>
        <p className="text-xs text-white/40 mt-1 max-w-sm mx-auto">
          Try switching categories or check the Publisher Suite to add your apps.
        </p>
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {apps.map((app) => (
        <AppCard
          key={app.id}
          app={app}
          onOpenDetail={onOpenDetail}
          onInstall={onInstall}
          onLaunch={onLaunch}
          onUpdate={onUpdate}
          onFixPath={onFixPath}
          onUninstall={onUninstall}
        />
      ))}
    </div>
  );
};
