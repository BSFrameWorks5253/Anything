import React, { useState, useEffect } from 'react';
import type { NavigationPage, CatalogApp } from './types/app.types';
import { creativeAppsData } from './data/apps.data';
import { AppLayout } from './components/layout/AppLayout';
import { HomePage } from './features/home/HomePage';
import { AppsPage } from './features/apps/AppsPage';
import { AppDetailPage } from './features/apps/AppDetailPage';
import { PublisherPage } from './features/publisher/PublisherPage';
import { FilesPage } from './features/files/FilesPage';
import { SettingsPage } from './features/settings/SettingsPage';
import { CreatorProfilePage } from './features/creator/CreatorProfilePage';
import { AdobeSplashScreen } from './components/ui/AdobeSplashScreen';
import { loadSplashSettings, type SplashSettings } from './data/splash.data';
import { useAuth } from './context/AuthContext';
import { AuthScreen } from './features/auth/AuthScreen';

export function App() {
  const isSplashWindow =
    typeof window !== 'undefined' &&
    new URLSearchParams(window.location.search).get('view') === 'splash';

  const isElectron = Boolean(typeof window !== 'undefined' && (window as any).electronAPI);
  const { isAuthenticated, isAuthModalOpen, closeAuthModal } = useAuth();

  const [currentPage, setCurrentPage] = useState<NavigationPage>('apps');
  const [viewingApp, setViewingApp] = useState<CatalogApp | null>(null);
  const [customizeAppId, setCustomizeAppId] = useState<string>('anything');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [splashSettings, setSplashSettings] = useState<SplashSettings>(() => loadSplashSettings());
  const [isBooting, setIsBooting] = useState<boolean>(() => !isElectron && splashSettings.enabled);
  const [previewSplash, setPreviewSplash] = useState<SplashSettings | null>(null);

  // Apply zero-background transparency if this instance is the standalone splash window
  useEffect(() => {
    if (isSplashWindow) {
      document.documentElement.style.background = 'transparent';
      document.documentElement.style.backgroundColor = 'transparent';
      document.body.style.background = 'transparent';
      document.body.style.backgroundColor = 'transparent';
    }
  }, [isSplashWindow]);

  // Persistent Catalog Apps Registry
  const [apps, setApps] = useState<CatalogApp[]>(() => {
    const saved = localStorage.getItem('creative_hub_catalog_apps_v4');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return creativeAppsData as CatalogApp[];
  });

  const persistApps = (updatedList: CatalogApp[]) => {
    setApps(updatedList);
    localStorage.setItem('creative_hub_catalog_apps_v4', JSON.stringify(updatedList));
  };

  // Load published packages from disk on start
  useEffect(() => {
    const loadFromDisk = async () => {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.loadPublishedCatalog) {
        const res = await electronAPI.loadPublishedCatalog();
        if (res.success && res.catalog && res.catalog.length > 0) {
          // Merge with local install state
          const merged = res.catalog.map((remote: any) => {
            const normRemoteId = (remote.id || '').toLowerCase().replace(/^app-/, '');
            const local = apps.find(
              (a) =>
                a.id === remote.id ||
                (a.id || '').toLowerCase().replace(/^app-/, '') === normRemoteId
            );
            if (local) {
              return {
                ...remote,
                status: local.status,
                installedPath: local.installedPath,
                localVersion: local.localVersion,
              };
            }
            return remote;
          });
          persistApps(merged);
        }
      }
    };
    loadFromDisk();
  }, []);

  // Listen for real-time catalog changes from Electron (e.g. app deleted, version deleted, app renamed)
  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.onCatalogUpdated) {
      const unsub = electronAPI.onCatalogUpdated((newCatalog: any[]) => {
        if (Array.isArray(newCatalog)) {
          setApps((prevApps) => {
            const merged = newCatalog.map((remote: any) => {
              const local = prevApps.find((a) => a.id === remote.id);
              if (local) {
                return {
                  ...remote,
                  status: local.status,
                  installedPath: local.installedPath,
                  localVersion: local.localVersion,
                };
              }
              return remote;
            });
            localStorage.setItem('creative_hub_catalog_apps_v4', JSON.stringify(merged));
            return merged;
          });
        }
      });
      return unsub;
    }
  }, []);

  const [isCheckingUpdates, setIsCheckingUpdates] = useState(false);

  // Real-time catalog download progress listener
  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.onCatalogDownloadProgress) {
      const cleanup = electronAPI.onCatalogDownloadProgress((data: any) => {
        setApps((prevApps) =>
          prevApps.map((a) => {
            if (a.id === data.appId) {
              return {
                ...a,
                status: data.status === 'extracting' ? 'extracting' : a.status,
                downloadProgress: {
                  percent: data.percent,
                  transferredBytes: data.transferredBytes || 0,
                  totalBytes: data.totalBytes || 0,
                  speedBytesPerSec: data.speedBytesPerSec || 0,
                },
              };
            }
            return a;
          })
        );
      });
      return cleanup;
    }
  }, []);

  // Listen to Windows notification clicks
  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.onNotificationClicked) {
      const cleanup = electronAPI.onNotificationClicked((data: any) => {
        if (data?.appId) {
          setCurrentPage('apps');
        }
      });
      return cleanup;
    }
  }, []);

  // Sync installed applications with Windows System Tray quick launcher
  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.syncTrayInstalledApps) {
      const installed = apps
        .filter((a) => a.status === 'installed' && (a.installedPath || a.executableName))
        .map((a) => ({
          id: a.id,
          name: a.name,
          path: a.installedPath,
        }));
      electronAPI.syncTrayInstalledApps(installed);
    }
  }, [apps]);

  // Listen to Tray "Check for Updates" trigger
  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.onTrayCheckUpdates) {
      const cleanup = electronAPI.onTrayCheckUpdates(() => {
        checkAllGitHubUpdates();
      });
      return cleanup;
    }
  }, [apps]);

  // Check GitHub Releases for newer versions
  const checkAllGitHubUpdates = async () => {
    const electronAPI = (window as any).electronAPI;
    if (!electronAPI?.checkGitHubRelease) return;

    setIsCheckingUpdates(true);
    try {
      const updatedList = await Promise.all(
        apps.map(async (app) => {
          if (!app.githubRepo) return app;
          try {
            const res = await electronAPI.checkGitHubRelease(
              app.githubRepo,
              app.localVersion || app.version
            );
            if (res.success && res.asset) {
              const hasNewVersion = res.hasUpdate;
              if (
                hasNewVersion &&
                (app.status === 'installed' || app.status === 'update-available') &&
                electronAPI?.showNotification
              ) {
                electronAPI.showNotification({
                  title: `🚀 Update Available: ${app.name} v${res.remoteVersion || res.rawTag}`,
                  body: `Version ${res.remoteVersion || res.rawTag} is now available on GitHub (Installed: v${app.localVersion || app.version}). Click to download and install.`,
                  appId: app.id,
                });
              }
              return {
                ...app,
                version: res.remoteVersion || app.version,
                status:
                  hasNewVersion && (app.status === 'installed' || app.status === 'update-available')
                    ? ('update-available' as const)
                    : app.status,
                latestRelease: {
                  tag: res.remoteVersion || res.rawTag,
                  name: res.releaseName,
                  body: res.releaseNotes,
                  assetUrl: res.asset.downloadUrl,
                  assetName: res.asset.name,
                  assetSize: res.asset.sizeFormatted,
                  publishedAt: res.publishedAt,
                },
              };
            }
          } catch (e) {
            console.error(`Error checking GitHub for ${app.name}:`, e);
          }
          return app;
        })
      );

      persistApps(updatedList);
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  useEffect(() => {
    checkAllGitHubUpdates();
  }, [apps.length]);

  // Verify installed paths on disk upon launch
  useEffect(() => {
    const verifyAllPaths = async () => {
      const electronAPI = (window as any).electronAPI;
      if (!electronAPI?.verifyAppPath) return;

      const checked = await Promise.all(
        apps.map(async (app) => {
          if (app.status === 'installed' && app.installedPath) {
            const exists = await electronAPI.verifyAppPath(app.installedPath);
            if (!exists) {
              return { ...app, status: 'path-broken' as const };
            }
          }
          return app;
        })
      );
      persistApps(checked);
    };

    verifyAllPaths();
  }, []);

  // Lifecycle Action Handlers
  const handleInstallApp = async (targetApp: CatalogApp) => {
    const electronAPI = (window as any).electronAPI;

    // Set downloading / installing visual state
    persistApps(
      apps.map((a) =>
        a.id === targetApp.id
          ? {
              ...a,
              status: 'downloading',
              downloadProgress: {
                percent: 15,
                transferredBytes: 0,
                totalBytes: 0,
                speedBytesPerSec: 0,
              },
            }
          : a
      )
    );

    // 1. Direct GitHub Release Installation or Update
    if (
      electronAPI?.updateAppFromGitHub &&
      (targetApp.latestRelease?.assetUrl || targetApp.githubRepo)
    ) {
      let downloadUrl = targetApp.latestRelease?.assetUrl;
      let assetName = targetApp.latestRelease?.assetName;
      let newVersion = targetApp.latestRelease?.tag || targetApp.version;

      if (!downloadUrl && targetApp.githubRepo) {
        const ghCheck = await electronAPI.checkGitHubRelease(
          targetApp.githubRepo,
          targetApp.localVersion || targetApp.version
        );
        if (ghCheck.success && ghCheck.asset) {
          downloadUrl = ghCheck.asset.downloadUrl;
          assetName = ghCheck.asset.name;
          newVersion = ghCheck.remoteVersion || ghCheck.rawTag;
        }
      }

      if (downloadUrl && assetName) {
        const result = await electronAPI.updateAppFromGitHub({
          appId: targetApp.id,
          downloadUrl,
          assetName,
          newVersion,
          executableName: targetApp.executableName,
        });

        if (result.success) {
          persistApps(
            apps.map((a) =>
              a.id === targetApp.id
                ? {
                    ...a,
                    status: 'installed',
                    version: newVersion,
                    localVersion: newVersion,
                    installedPath: result.installedPath,
                    downloadProgress: undefined,
                  }
                : a
            )
          );
          return;
        } else {
          alert(`Installation from GitHub failed: ${result.error}`);
          persistApps(
            apps.map((a) =>
              a.id === targetApp.id
                ? { ...a, status: 'not-installed', downloadProgress: undefined }
                : a
            )
          );
          return;
        }
      }
    }

    // 2. If app has local package from Publisher Push
    if (electronAPI?.installPublishedPackage && (targetApp as any).localPackagePath) {
      setTimeout(async () => {
        const result = await electronAPI.installPublishedPackage(targetApp);
        if (result.success) {
          persistApps(
            apps.map((a) =>
              a.id === targetApp.id
                ? {
                    ...a,
                    status: 'installed',
                    installedPath: result.installedPath,
                    localVersion: targetApp.version,
                    downloadProgress: undefined,
                  }
                : a
            )
          );
        } else {
          alert(`Installation error: ${result.error}`);
          persistApps(
            apps.map((a) =>
              a.id === targetApp.id
                ? { ...a, status: 'not-installed', downloadProgress: undefined }
                : a
            )
          );
        }
      }, 600);
      return;
    }

    // 3. Direct download URL fallback
    if (electronAPI?.downloadAndInstallApp && targetApp.downloadUrl) {
      const result = await electronAPI.downloadAndInstallApp({
        appId: targetApp.id,
        downloadUrl: targetApp.downloadUrl,
        executableName: targetApp.executableName,
        version: targetApp.version,
      });

      if (result.success) {
        persistApps(
          apps.map((a) =>
            a.id === targetApp.id
              ? {
                  ...a,
                  status: 'installed',
                  installedPath: result.installedPath,
                  localVersion: targetApp.version,
                  downloadProgress: undefined,
                }
              : a
          )
        );
      } else {
        alert(`Installation failed: ${result.error}`);
        persistApps(
          apps.map((a) =>
            a.id === targetApp.id
              ? { ...a, status: 'not-installed', downloadProgress: undefined }
              : a
          )
        );
      }
      return;
    }

    // Browser preview simulation
    setTimeout(() => {
      persistApps(
        apps.map((a) =>
          a.id === targetApp.id
            ? {
                ...a,
                status: 'installed',
                localVersion: targetApp.version,
                installedPath: `C:\\Program Files\\${targetApp.name}\\${targetApp.executableName}`,
                downloadProgress: undefined,
              }
            : a
        )
      );
    }, 1000);
  };

  const handleLaunchApp = async (targetApp: CatalogApp) => {
    const electronAPI = (window as any).electronAPI;
    const launchTarget = targetApp.installedPath || targetApp.executableName;

    if (electronAPI?.launchApp) {
      const res = await electronAPI.launchApp(launchTarget);
      if (!res.success) {
        alert(
          `Could not launch application: ${res.error}\nClick "Fix Path" to locate your executable.`
        );
        persistApps(
          apps.map((a) => (a.id === targetApp.id ? { ...a, status: 'path-broken' } : a))
        );
      }
    } else {
      alert(`Launching ${targetApp.name} (Preview Simulation)...`);
    }
  };

  const handleUpdateApp = async (targetApp: CatalogApp) => {
    await handleInstallApp(targetApp);
  };

  const handleRollbackApp = async (targetApp: CatalogApp, release: any) => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.updateAppFromGitHub && release.asset?.downloadUrl) {
      persistApps(
        apps.map((a) =>
          a.id === targetApp.id
            ? {
                ...a,
                status: 'downloading',
                downloadProgress: {
                  percent: 15,
                  transferredBytes: 0,
                  totalBytes: 0,
                  speedBytesPerSec: 0,
                },
              }
            : a
        )
      );

      const result = await electronAPI.updateAppFromGitHub({
        appId: targetApp.id,
        downloadUrl: release.asset.downloadUrl,
        assetName: release.asset.name,
        newVersion: release.tag,
        executableName: targetApp.executableName,
      });

      if (result.success) {
        persistApps(
          apps.map((a) =>
            a.id === targetApp.id
              ? {
                  ...a,
                  status: 'installed',
                  version: release.tag,
                  localVersion: release.tag,
                  installedPath: result.installedPath,
                  downloadProgress: undefined,
                }
              : a
          )
        );

        if (electronAPI?.showNotification) {
          electronAPI.showNotification({
            title: `⏪ Rolled Back ${targetApp.name}`,
            body: `Successfully switched to version v${release.tag}.`,
            appId: targetApp.id,
          });
        }
      } else {
        alert(`Rollback failed: ${result.error}`);
        persistApps(
          apps.map((a) =>
            a.id === targetApp.id
              ? { ...a, status: 'installed', downloadProgress: undefined }
              : a
          )
        );
      }
    } else {
      // Direct version assignment fallback
      persistApps(
        apps.map((a) =>
          a.id === targetApp.id
            ? {
                ...a,
                version: release.tag,
                localVersion: release.tag,
              }
            : a
        )
      );
    }
  };

  const handleFixPathApp = async (targetApp: CatalogApp) => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.fixAppPath) {
      const res = await electronAPI.fixAppPath(targetApp.name);
      if (res?.success && res.newPath) {
        persistApps(
          apps.map((a) =>
            a.id === targetApp.id
              ? { ...a, installedPath: res.newPath, status: 'installed' }
              : a
          )
        );
      }
    } else {
      const manualPath = prompt('Enter new executable path:', targetApp.installedPath || '');
      if (manualPath) {
        persistApps(
          apps.map((a) =>
            a.id === targetApp.id
              ? { ...a, installedPath: manualPath, status: 'installed' }
              : a
          )
        );
      }
    }
  };

  const handleUninstallApp = async (appId: string) => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.uninstallApp) {
      await electronAPI.uninstallApp(appId);
    }
    persistApps(
      apps.map((a) =>
        a.id === appId
          ? { ...a, status: 'not-installed', installedPath: undefined, localVersion: undefined }
          : a
      )
    );
  };

  const handleAddCatalogApp = (newApp: CatalogApp) => {
    // If updating existing app version, flip status to update-available
    const existing = apps.find((a) => a.id === newApp.id);
    if (existing && existing.status === 'installed' && existing.localVersion !== newApp.version) {
      persistApps(
        apps.map((a) =>
          a.id === newApp.id
            ? { ...newApp, status: 'update-available', localVersion: existing.localVersion, installedPath: existing.installedPath }
            : a
        )
      );
      return;
    }
    persistApps([newApp, ...apps.filter((a) => a.id !== newApp.id)]);
  };

  const handleRemoveCatalogApp = (id: string) => {
    const normTarget = id.toLowerCase().replace(/^app-/, '').replace(/[^a-z0-9]/g, '');
    const updated = apps.filter((a) => {
      const aNorm = a.id.toLowerCase().replace(/^app-/, '').replace(/[^a-z0-9]/g, '');
      return a.id !== id && aNorm !== normTarget;
    });
    persistApps(updated);
    if (viewingApp && (viewingApp.id === id || viewingApp.id.toLowerCase().replace(/^app-/, '').replace(/[^a-z0-9]/g, '') === normTarget)) {
      setViewingApp(null);
    }
  };

  const handleDeleteApp = async (id: string) => {
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.deleteApp) {
        await electronAPI.deleteApp(id);
      }
    } catch (err) {
      console.error('Failed to delete app:', err);
    }
    handleRemoveCatalogApp(id);
  };

  const handleRenameApp = (id: string, newName: string) => {
    const normTarget = id.toLowerCase().replace(/^app-/, '').replace(/[^a-z0-9]/g, '');
    const updated = apps.map((a) => {
      const aNorm = a.id.toLowerCase().replace(/^app-/, '').replace(/[^a-z0-9]/g, '');
      return (a.id === id || aNorm === normTarget) ? { ...a, name: newName } : a;
    });
    persistApps(updated);
    if (viewingApp && (viewingApp.id === id || viewingApp.id.toLowerCase().replace(/^app-/, '').replace(/[^a-z0-9]/g, '') === normTarget)) {
      setViewingApp({ ...viewingApp, name: newName });
    }
  };

  const handleVersionDeleted = (id: string, deletedVer: string) => {
    const cleanVer = deletedVer.replace(/^[vV]/, '').trim();
    const normTarget = id.toLowerCase().replace(/^app-/, '').replace(/[^a-z0-9]/g, '');
    const updated = apps.map((a) => {
      const aNorm = a.id.toLowerCase().replace(/^app-/, '').replace(/[^a-z0-9]/g, '');
      if (a.id === id || aNorm === normTarget) {
        const nextHistory = (a.history || []).filter(
          (h: any) => (h.version || '').replace(/^[vV]/, '').trim() !== cleanVer
        );
        const nextVersion =
          (a.version || '').replace(/^[vV]/, '').trim() === cleanVer
            ? nextHistory[0]?.version || a.version
            : a.version;
        return { ...a, history: nextHistory, version: nextVersion };
      }
      return a;
    });
    persistApps(updated);
    if (viewingApp && (viewingApp.id === id || viewingApp.id.toLowerCase().replace(/^app-/, '').replace(/[^a-z0-9]/g, '') === normTarget)) {
      const current = updated.find((a) => a.id === id || a.id.toLowerCase().replace(/^app-/, '').replace(/[^a-z0-9]/g, '') === normTarget);
      if (current) setViewingApp(current);
    }
  };

  const updateCount = apps.filter((a) => a.status === 'update-available').length;

  const renderActivePage = () => {
    if (viewingApp) {
      return (
        <AppDetailPage
          app={viewingApp}
          onBack={() => setViewingApp(null)}
          onLaunch={handleLaunchApp}
          onInstall={handleInstallApp}
          onUpdate={handleUpdateApp}
          onRollback={handleRollbackApp}
          onFixPath={handleFixPathApp}
          onUninstall={handleUninstallApp}
          onDeleteApp={handleDeleteApp}
          onRenameApp={handleRenameApp}
          onVersionDeleted={handleVersionDeleted}
          onCustomizeLoader={(targetApp) => {
            setCustomizeAppId(targetApp.id);
            setViewingApp(null);
            setCurrentPage('settings');
          }}
        />
      );
    }

    switch (currentPage) {
      case 'home':
        return (
          <HomePage
            apps={apps as any}
            onNavigate={(p) => {
              setViewingApp(null);
              setCurrentPage(p);
            }}
            onOpenApp={(app) => handleLaunchApp(app as any)}
            onUpdateAll={() => {
              apps.filter((a) => a.status === 'update-available').forEach(handleUpdateApp);
            }}
          />
        );
      case 'apps':
        return (
          <AppsPage
            apps={apps}
            searchQuery={searchQuery}
            onInstallApp={handleInstallApp}
            onLaunchApp={handleLaunchApp}
            onUpdateApp={handleUpdateApp}
            onRollbackApp={handleRollbackApp}
            onFixPathApp={handleFixPathApp}
            onUninstallApp={handleUninstallApp}
            onDeleteApp={handleDeleteApp}
            onAddCustomApp={(custom) => handleAddCatalogApp(custom as any)}
            onImportApps={(imported) => persistApps(imported)}
            onNavigateToPublisher={() => {
              setViewingApp(null);
              setCurrentPage('publisher');
            }}
            onOpenDetailApp={(targetApp) => setViewingApp(targetApp)}
            onCustomizeLoader={(targetApp) => {
              setCustomizeAppId(targetApp.id);
              setViewingApp(null);
              setCurrentPage('settings');
            }}
            isCheckingUpdates={isCheckingUpdates}
            onCheckUpdates={checkAllGitHubUpdates}
          />
        );
      case 'publisher':
        return (
          <PublisherPage
            catalogApps={apps}
            onAddCatalogApp={handleAddCatalogApp}
            onRemoveCatalogApp={handleDeleteApp}
            onNavigateToApps={() => setCurrentPage('apps')}
          />
        );
      case 'creator':
        return (
          <CreatorProfilePage
            catalog={apps}
            onLaunchApp={handleLaunchApp}
            onOpenAppDetail={(targetApp) => setViewingApp(targetApp)}
          />
        );
      case 'files':
        return <FilesPage searchQuery={searchQuery} />;
      case 'settings':
        return (
          <SettingsPage
            initialAppId={customizeAppId}
            onPreviewSplash={(customSettings) => {
              setPreviewSplash(customSettings);
            }}
          />
        );
      default:
        return null;
    }
  };

  // 1. Standalone Splash Window: ONLY the loader box appears on the screen (no other background)
  if (isSplashWindow) {
    return (
      <div className="w-screen h-screen flex items-center justify-center bg-transparent select-none p-0 m-0 overflow-hidden">
        <AdobeSplashScreen
          settings={splashSettings}
          isOpen={true}
          onComplete={() => {
            (window as any).electronAPI?.splashDone?.();
          }}
          isStandaloneSplash={true}
        />
      </div>
    );
  }

  // 2. Web browser fallback: show splash before app
  if (isBooting) {
    return (
      <AdobeSplashScreen
        settings={splashSettings}
        isOpen={true}
        onComplete={() => setIsBooting(false)}
        isBootScreen={true}
      />
    );
  }

  // 3. User Authentication Gate: if user hasn't signed in, show Sign In screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  // 4. Main Applications Hub: Revealed smoothly after loader finishes
  return (
    <div className="w-full h-full animate-fadeIn">
      {previewSplash && (
        <AdobeSplashScreen
          settings={previewSplash}
          isOpen={true}
          onComplete={() => setPreviewSplash(null)}
          isPreview={true}
        />
      )}
      {isAuthModalOpen && (
        <AuthScreen isModal onClose={closeAuthModal} />
      )}
      <AppLayout
        currentPage={currentPage}
        appName={viewingApp?.name}
        onNavigate={(page) => {
          setViewingApp(null);
          setCurrentPage(page);
          setSearchQuery('');
        }}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        updateCount={updateCount}
      >
        {renderActivePage()}
      </AppLayout>
    </div>
  );
}

export default App;
