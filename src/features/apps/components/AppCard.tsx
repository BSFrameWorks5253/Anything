import React from 'react';
import type { CatalogApp } from '../../../types/app.types';
import { GlassCard } from '../../../components/ui/GlassCard';
import { AppCardHeader } from './AppCardHeader';
import { AppCardActions } from './AppCardActions';

interface AppCardProps {
  app: CatalogApp;
  onOpenDetail: (app: CatalogApp) => void;
  onInstall: (app: CatalogApp) => void;
  onLaunch: (app: CatalogApp) => void;
  onUpdate: (app: CatalogApp) => void;
  onFixPath: (app: CatalogApp) => void;
  onUninstall: (appId: string) => void;
}

export const AppCard: React.FC<AppCardProps> = ({
  app,
  onOpenDetail,
  onInstall,
  onLaunch,
  onUpdate,
  onFixPath,
  onUninstall,
}) => {
  return (
    <GlassCard
      variant="interactive"
      className="p-4 flex flex-col justify-between group border-white/10"
      glowColor={app.glowColor}
      onClick={() => onOpenDetail(app)}
    >
      <AppCardHeader app={app} />
      <AppCardActions
        app={app}
        onInstall={onInstall}
        onLaunch={onLaunch}
        onUpdate={onUpdate}
        onFixPath={onFixPath}
        onUninstall={onUninstall}
      />
    </GlassCard>
  );
};
