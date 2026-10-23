import React, { useState } from 'react';
import type { CatalogApp } from '../../types/app.types';
import { appCategoriesList } from '../../data/apps.data';
import { AppsFilterBar } from './components/AppsFilterBar';
import { CategoryPills } from './components/CategoryPills';
import { AppsGrid } from './components/AppsGrid';
import { CrazyAddAppModal } from './components/CrazyAppStudio/CrazyAddAppModal';
import { EmptyHubHero } from './components/CrazyAppStudio/EmptyHubHero';
import { AppDetailModal } from './components/AppDetailModal';
import { useViewMode } from '../../context/ViewModeContext';
import { useTheme } from '../../context/ThemeContext';
import { GlassCard } from '../../components/ui/GlassCard';
import { PackageOpen, Sparkles } from 'lucide-react';

interface AppsPageProps {
  apps: CatalogApp[];
  searchQuery: string;
  onInstallApp: (app: CatalogApp) => void;
  onLaunchApp: (app: CatalogApp) => void;
  onUpdateApp: (app: CatalogApp) => void;
  onRollbackApp?: (app: CatalogApp, release: any) => void;
  onFixPathApp: (app: CatalogApp) => void;
  onUninstallApp: (appId: string) => void;
  onAddCustomApp: (newApp: any) => void;
  onImportApps: (imported: any[]) => void;
  onNavigateToPublisher?: () => void;
  onCustomizeLoader?: (app: CatalogApp) => void;
  onOpenDetailApp?: (app: CatalogApp) => void;
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
  onAddCustomApp,
  onImportApps,
  onNavigateToPublisher,
  onCustomizeLoader,
  onOpenDetailApp,
  isCheckingUpdates,
  onCheckUpdates,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'installed' | 'updates'>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [detailApp, setDetailApp] = useState<CatalogApp | null>(null);
  const { viewMode } = useViewMode();
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const updateCount = apps.filter((a) => a.status === 'update-available').length;

  const filteredApps = apps.filter((app) => {
    const matchesSearch =
      !searchQuery ||
      app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      app.category.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'All' || app.category === selectedCategory;

    const matchesTab =
      activeTab === 'all' ||
      (activeTab === 'installed' && (app.status === 'installed' || app.status === 'path-broken' || app.status === 'update-available')) ||
      (activeTab === 'updates' && app.status === 'update-available');

    return matchesSearch && matchesCategory && matchesTab;
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-14">
      {/* Top Action Filter Bar */}
      <AppsFilterBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        updateCount={updateCount}
        totalCount={apps.length}
        onUpdateAll={() => {
          apps.filter((a) => a.status === 'update-available').forEach(onUpdateApp);
        }}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        isCheckingUpdates={isCheckingUpdates}
        onCheckUpdates={onCheckUpdates}
      />

      {apps.length === 0 ? (
        viewMode === 'user' ? (
          <GlassCard variant="elevated" className="p-12 text-center max-w-lg mx-auto space-y-4 shadow-2xl">
            <div className="w-16 h-16 rounded-3xl bg-sky-500/15 border border-sky-400/30 flex items-center justify-center mx-auto text-sky-600">
              <PackageOpen className="w-8 h-8" />
            </div>
            <h3 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Application Catalog is Empty
            </h3>
            <p className={`text-xs ${isLight ? 'text-slate-600' : 'text-white/60'} leading-relaxed`}>
              No software packages have been published to this catalog yet. As soon as your publisher pushes apps or updates, they will appear here ready to install in 1 click.
            </p>
          </GlassCard>
        ) : (
          <EmptyHubHero
            onOpenAddModal={() => setIsAddModalOpen(true)}
            onAddPreset={onAddCustomApp}
            onAutoAdd={onAddCustomApp}
          />
        )
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
            onCustomizeLoader={onCustomizeLoader}
          />
        </>
      )}

      {/* Crazy Power App Studio */}
      <CrazyAddAppModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        existingApps={apps as any}
        onAddApp={onAddCustomApp}
        onImportApps={onImportApps}
      />

      {/* App Detail Modal */}
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
      />
    </div>
  );
};
