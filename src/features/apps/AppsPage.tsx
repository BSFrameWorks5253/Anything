import React, { useState } from 'react';
import { PackageOpen } from 'lucide-react';
import type { CatalogApp } from '../../types/app.types';
import { appCategoriesList } from '../../data/apps.data';
import { AppsFilterBar } from './components/AppsFilterBar';
import { CategoryPills } from './components/CategoryPills';
import { AppsGrid } from './components/AppsGrid';
import { AppDetailModal } from './components/AppDetailModal.tsx';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../../components/ui/GlassCard';

interface AppsPageProps {
  apps: CatalogApp[];
  searchQuery: string;
  onInstallApp: (app: CatalogApp) => void;
  onLaunchApp: (app: CatalogApp) => void;
  onUpdateApp: (app: CatalogApp) => void;
  onRollbackApp?: (app: CatalogApp, release: any) => void;
  onFixPathApp: (app: CatalogApp) => void;
  onUninstallApp: (appId: string) => void;
  onDeleteApp?: (appId: string) => void;
  onAddCustomApp?: (newApp: any) => void;
  onImportApps?: (imported: any[]) => void;
  onCustomizeLoader?: (app: CatalogApp) => void;
  onOpenDetailApp?: (app: CatalogApp) => void;
  onEditApp?: (appId: string, updates: Partial<CatalogApp>) => Promise<void> | void;
  onTryDemoApp?: (app: CatalogApp) => void;
  isCheckingUpdates?: boolean;
  onCheckUpdates?: () => void;
}

export const AppsPage: React.FC<AppsPageProps> = ({
  apps,
  searchQuery,
  onInstallApp,
  onLaunchApp,
  onUpdateApp,
  onRollbackApp,
  onFixPathApp,
  onUninstallApp,
  onDeleteApp,
  onCustomizeLoader,
  onOpenDetailApp,
  onEditApp,
  onTryDemoApp,
  isCheckingUpdates,
  onCheckUpdates,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'desktop' | 'mobile' | 'installed' | 'updates'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [detailApp, setDetailApp] = useState<CatalogApp | null>(null);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const updateCount = apps.filter((a) => a.status === 'update-available').length;
  const desktopCount = apps.filter((a) => !a.targetPlatforms || a.targetPlatforms.includes('desktop')).length;
  const mobileCount = apps.filter((a) => a.targetPlatforms?.includes('mobile') || (a.category && a.category.toLowerCase().includes('mobile'))).length;

  const filteredApps = apps.filter((app) => {
    const q = (searchQuery || '').toLowerCase();
    const name = (app?.name || '').toLowerCase();
    const desc = (app?.description || '').toLowerCase();
    const cat = (app?.category || '').toLowerCase();

    const matchesSearch =
      !q ||
      name.includes(q) ||
      desc.includes(q) ||
      cat.includes(q);

    const matchesCategory =
      selectedCategory === 'All' || app.category === selectedCategory;

    const isDesktopApp = !app.targetPlatforms || app.targetPlatforms.includes('desktop');
    const isMobileApp = Boolean(app.targetPlatforms?.includes('mobile') || cat.includes('mobile'));

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'desktop' && isDesktopApp) ||
      (activeTab === 'mobile' && isMobileApp) ||
      (activeTab === 'installed' && (app.status === 'installed' || app.status === 'path-broken' || app.status === 'update-available')) ||
      (activeTab === 'updates' && app.status === 'update-available');

    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-14 animate-fadeIn">
      {/* Top Action Filter Bar */}
      <AppsFilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        updateCount={updateCount}
        totalCount={apps.length}
        desktopCount={desktopCount}
        mobileCount={mobileCount}
        onUpdateAll={() => {
          apps.filter((a) => a.status === 'update-available').forEach(onUpdateApp);
        }}
        isCheckingUpdates={isCheckingUpdates}
        onCheckUpdates={onCheckUpdates}
      />

      {apps.length === 0 ? (
        <GlassCard variant="elevated" className="p-12 text-center max-w-lg mx-auto space-y-4 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center mx-auto text-sky-600">
            <PackageOpen className="w-8 h-8" />
          </div>
          <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Application Catalog is Empty
          </h3>
          <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-white/60'} leading-relaxed`}>
            No software packages have been published to this catalog yet. Ready-to-install creative tools will appear here automatically.
          </p>
        </GlassCard>
      ) : (
        <>
          <CategoryPills
            categories={appCategoriesList}
            activeCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
          />

          <AppsGrid
            apps={filteredApps}
            onOpenDetail={(app) => {
              if (onOpenDetailApp) {
                onOpenDetailApp(app);
              } else {
                setDetailApp(app);
              }
            }}
            onInstall={onInstallApp}
            onLaunch={onLaunchApp}
            onUpdate={onUpdateApp}
            onFixPath={onFixPathApp}
            onUninstall={onUninstallApp}
            onDeleteApp={onDeleteApp}
            onCustomizeLoader={onCustomizeLoader}
            onEditApp={(_targetApp) => {}}
            onTryDemo={onTryDemoApp}
          />
        </>
      )}

      {/* App Detail Modal */}
      {detailApp && (
        <AppDetailModal
          app={detailApp}
          isOpen={Boolean(detailApp)}
          onClose={() => setDetailApp(null)}
          onLaunch={onLaunchApp}
          onInstall={onInstallApp}
          onUpdate={onUpdateApp}
          onRollback={onRollbackApp}
          onFixPath={onFixPathApp}
          onUninstall={onUninstallApp}
          onDeleteApp={onDeleteApp}
          onEditApp={onEditApp}
        />
      )}
    </div>
  );
};
