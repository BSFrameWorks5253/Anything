import React, { useState, useEffect } from "react";
import type { NavigationPage, CatalogApp } from "./types/app.types";
import { creativeAppsData } from "./data/apps.data";
import { AppLayout } from "./components/layout/AppLayout";
import { HomePage } from "./features/home/HomePage";
import { AppsPage } from "./features/apps/AppsPage";
import { AppDetailPage } from "./features/apps/AppDetailPage";
import { FilesPage } from "./features/files/FilesPage";
import { SettingsPage } from "./features/settings/SettingsPage";
import { AdobeSplashScreen } from "./components/ui/AdobeSplashScreen";
import { loadSplashSettings, type SplashSettings } from "./data/splash.data";
import {
  MEDIAFLOW_STUDIO_LOGO_BASE64,
  ONE_TAP_LOGO_BASE64,
} from "./features/apps/components/CrazyAppStudio/AppIconRenderer";
import { AppDemoModal } from "./features/apps/components/AppDemoModal";
import { useAuth } from "./context/AuthContext";
import { AuthScreen } from "./features/auth/AuthScreen";
import { CommandPalette } from "./components/ui/CommandPalette";

function compareVersions(v1: any, v2: any): number {
  if (!v1 || !v2) return 0;

  const s1 = String(v1)
    .replace(/^[vV]/, "")
    .split(/[-_]/)[0]
    .split(".")
    .map((x) => parseInt(x, 10) || 0);

  const s2 = String(v2)
    .replace(/^[vV]/, "")
    .split(/[-_]/)[0]
    .split(".")
    .map((x) => parseInt(x, 10) || 0);

  const len = Math.max(s1.length, s2.length);

  for (let i = 0; i < len; i++) {
    const num1 = s1[i] || 0;

    const num2 = s2[i] || 0;

    if (num1 > num2) return 1;

    if (num1 < num2) return -1;
  }

  return 0;
}

const KNOWN_ECOSYSTEM_REPOS: Record<string, string> = {
  onetap: "BSFrameWorks5253/onetap-workstation",

  "one-tap": "BSFrameWorks5253/onetap-workstation",

  "onetap-workstation": "BSFrameWorks5253/onetap-workstation",

  mediaflow: "BSFrameWorks5253/MediaFlow-Studio",

  "mediaflow-studio": "BSFrameWorks5253/MediaFlow-Studio",

  docuflow: "BSFrameworks5253/DocuFlow-",

  "docuflow-studio": "BSFrameworks5253/DocuFlow-",

  pulsewave: "BSFrameWorks5253/Plusewave",

  plusewave: "BSFrameWorks5253/Plusewave",

  "anything-data-manage": "BSFrameWorks5253/AIN53",

  "app-anything-data-manage": "BSFrameWorks5253/AIN53",

  ain53: "BSFrameWorks5253/AIN53",

  "auto-copier": "BSFrameWorks5253/Anything",

  autocopier: "BSFrameWorks5253/Anything",

  anything: "BSFrameWorks5253/Anything",
};

export function App() {
  const isSplashWindow =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).get("view") === "splash";

  const isElectron = Boolean(
    typeof window !== "undefined" && (window as any).electronAPI,
  );

  const { isAuthenticated, isAuthModalOpen, closeAuthModal } = useAuth();

  const [currentPage, setCurrentPage] = useState<NavigationPage>("apps");

  const [viewingApp, setViewingApp] = useState<CatalogApp | null>(null);

  const [demoModalApp, setDemoModalApp] = useState<CatalogApp | null>(null);

  const [customizeAppId, setCustomizeAppId] = useState<string>("anything");

  const [searchQuery, setSearchQuery] = useState<string>("");

  const [splashSettings, setSplashSettings] = useState<SplashSettings>(() =>
    loadSplashSettings(),
  );

  const [isBooting, setIsBooting] = useState<boolean>(
    () => !isElectron && splashSettings.enabled,
  );

  const [previewSplash, setPreviewSplash] = useState<SplashSettings | null>(
    null,
  );
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global Ctrl+K listener for Command Palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);


  // Apply zero-background transparency if this instance is the standalone splash window

  useEffect(() => {
    if (isSplashWindow) {
      document.documentElement.style.background = "transparent";

      document.documentElement.style.backgroundColor = "transparent";

      document.body.style.background = "transparent";

      document.body.style.backgroundColor = "transparent";
    }
  }, [isSplashWindow]);

  // Persistent Catalog Apps Registry

  const [apps, setApps] = useState<CatalogApp[]>(() => {
    const saved = localStorage.getItem("creative_hub_catalog_apps_v4");

    if (saved) {
      try {
        const parsed = JSON.parse(saved);

        if (Array.isArray(parsed)) {
          return parsed

            .filter((a: any) => {
              const id = (a?.id || "").toLowerCase();

              const name = (a?.name || "").toLowerCase();

              return !(
                id === "tap-studio" ||
                id === "app-tap-studio" ||
                name.includes("tap studio")
              );
            })

            .map((a: CatalogApp) => {
              if (
                a.id === "one-tap" ||
                a.id === "onetap-workstation" ||
                a.id === "app-one-tap" ||
                (a.name && a.name.toLowerCase().includes("one tap"))
              ) {
                const isDevPath =
                  a.installedPath &&
                  a.installedPath.toLowerCase().includes("burhanuddin");

                const safePath = isDevPath ? undefined : a.installedPath;

                const safeStatus =
                  isDevPath || !a.installedPath
                    ? "not-installed"
                    : a.status || "not-installed";

                return {
                  ...a,

                  id: "one-tap",

                  name: "One Tap",

                  shortName: "OT",

                  category: "Media & Production",

                  gradient: "from-rose-600 via-red-600 to-amber-500",

                  textColor: "#f43f5e",

                  glowColor: "rgba(225, 29, 72, 0.45)",

                  executableName: "One Tap.exe",

                  iconType: "image" as const,

                  iconValue: ONE_TAP_LOGO_BASE64,

                  githubRepo:
                    a.githubRepo || "BSFrameWorks5253/onetap-workstation",

                  installedPath: safePath,

                  status: safeStatus as any,
                };
              }

              if (
                a.id === "mediaflow-studio" ||
                a.id === "app-mediaflow-studio" ||
                (a.name && a.name.toLowerCase().includes("mediaflow"))
              ) {
                const isDevPath =
                  a.installedPath &&
                  a.installedPath.toLowerCase().includes("burhanuddin");

                const targetPath = isDevPath ? undefined : a.installedPath;

                const localVer = a.localVersion;

                const remoteVer = a.version || "6.0.0";

                const isOutdated =
                  localVer && remoteVer && targetPath
                    ? compareVersions(remoteVer, localVer) > 0
                    : false;

                return {
                  ...a,

                  id: "mediaflow-studio",

                  name: "MediaFlow Studio",

                  shortName: "MS",

                  category: "Media & Video",

                  gradient: "from-blue-600 to-indigo-700",

                  iconType: "image" as const,

                  iconValue: MEDIAFLOW_STUDIO_LOGO_BASE64,

                  githubRepo: "BSFrameWorks5253/MediaFlow-Studio",

                  executableName: "MediaFlow Studio.exe",

                  installedPath: targetPath,

                  localVersion: localVer,

                  version: remoteVer,

                  status: isOutdated
                    ? ("update-available" as const)
                    : targetPath
                      ? a.status || "installed"
                      : "not-installed",
                };
              }

              return a;
            });
        }
      } catch (e) {
        console.error(e);
      }
    }

    return creativeAppsData as CatalogApp[];
  });

  const persistApps = (updatedList: CatalogApp[]) => {
    setApps(updatedList);

    localStorage.setItem(
      "creative_hub_catalog_apps_v4",
      JSON.stringify(updatedList),
    );
  };

  // Load published packages from disk on start

  useEffect(() => {
    const loadFromDisk = async () => {
      const electronAPI = (window as any).electronAPI;

      if (electronAPI?.loadPublishedCatalog) {
        const res = await electronAPI.loadPublishedCatalog();

        if (res.success && Array.isArray(res.catalog)) {
          const validCatalog = res.catalog.filter((remote: any) => {
            const id = (remote?.id || "").toLowerCase();

            const name = (remote?.name || "").toLowerCase();

            return !(
              id === "tap-studio" ||
              id === "app-tap-studio" ||
              name.includes("tap studio")
            );
          });

          // Merge with local install state

          const merged = await Promise.all(
            validCatalog.map(async (remote: any) => {
              const normRemoteId = (remote.id || "")
                .toLowerCase()
                .replace(/^app-/, "");

              const local = apps.find(
                (a) =>
                  a.id === remote.id ||
                  (a.id || "").toLowerCase().replace(/^app-/, "") ===
                    normRemoteId,
              );

              let item: CatalogApp = local
                ? {
                    ...remote,

                    status: local.status,

                    installedPath: local.installedPath,

                    localVersion: local.localVersion,
                  }
                : remote;

              // Auto-resolve installed app location

              if (electronAPI?.resolveInstalledPath) {
                const detected = await electronAPI.resolveInstalledPath({
                  appId: item.id,

                  name: item.name,

                  currentPath: item.installedPath,

                  executableName: item.executableName,
                });

                if (detected?.installed && detected?.resolvedPath) {
                  const activeLocalVer = detected.version || item.localVersion;

                  const isOutdated = activeLocalVer
                    ? compareVersions(item.version, activeLocalVer) > 0
                    : false;

                  item = {
                    ...item,

                    status: isOutdated ? "update-available" : "installed",

                    installedPath: detected.resolvedPath,

                    localVersion: activeLocalVer,
                  };
                }
              }

              if (
                item.id === "mediaflow-studio" ||
                item.id === "app-mediaflow-studio" ||
                (item.name && item.name.toLowerCase().includes("mediaflow"))
              ) {
                if (!item.iconValue || item.iconType !== "image") {
                  item.iconType = "image";

                  item.iconValue = MEDIAFLOW_STUDIO_LOGO_BASE64;
                }
              }

              if (
                item.id === "onetap-workstation" ||
                item.id === "one-tap" ||
                item.id === "app-one-tap" ||
                (item.name && item.name.toLowerCase().includes("one tap"))
              ) {
                item.id = "one-tap";

                item.name = "One Tap";

                item.shortName = "OT";

                item.category = "Media & Production";

                item.executableName = "One Tap.exe";

                item.gradient = "from-rose-600 via-red-600 to-amber-500";

                item.textColor = "#f43f5e";

                item.glowColor = "rgba(225, 29, 72, 0.45)";

                item.githubRepo =
                  item.githubRepo || "BSFrameWorks5253/onetap-workstation";

                if (!item.iconValue || item.iconType !== "image") {
                  item.iconType = "image";

                  item.iconValue = ONE_TAP_LOGO_BASE64;
                }

                if (
                  item.installedPath &&
                  item.installedPath.toLowerCase().includes("burhanuddin")
                ) {
                  item.installedPath = undefined;

                  item.status = "not-installed";
                }
              }

              if (
                item.id === "mediaflow-studio" ||
                (item.name && item.name.toLowerCase().includes("mediaflow"))
              ) {
                item.id = "mediaflow-studio";

                item.name = "MediaFlow Studio";

                item.shortName = "MS";

                item.category = "Media & Video";

                item.executableName = "MediaFlow Studio.exe";

                item.githubRepo = "BSFrameWorks5253/MediaFlow-Studio";

                item.gradient = "from-blue-600 to-indigo-700";

                item.textColor = "#0066ee";

                item.glowColor = "rgba(0, 102, 238, 0.45)";

                if (
                  item.installedPath &&
                  item.installedPath.toLowerCase().includes("burhanuddin")
                ) {
                  item.installedPath = undefined;

                  item.status = "not-installed";
                }
              }

              return item;
            }),
          );

          // Deduplicate by normalized application key (preserving GitHub repository and online download info)

          const dedupedMap = new Map<string, CatalogApp>();

          for (const item of merged) {
            const normKey = (item.id || "")

              .toLowerCase()

              .replace(/^app-/, "")

              .replace(/-studio$/, "")

              .replace(/[^a-z0-9]/g, "");

            const itemRepo =
              item.githubRepo ||
              KNOWN_ECOSYSTEM_REPOS[normKey] ||
              KNOWN_ECOSYSTEM_REPOS[item.id];

            const itemWithRepo = itemRepo
              ? { ...item, githubRepo: itemRepo }
              : item;

            if (!dedupedMap.has(normKey)) {
              dedupedMap.set(normKey, itemWithRepo);
            } else {
              const existing = dedupedMap.get(normKey)!;

              const existingHasDl = Boolean(
                existing.githubRepo ||
                (existing.downloadUrl &&
                  existing.downloadUrl.startsWith("http")),
              );

              const itemHasDl = Boolean(
                itemWithRepo.githubRepo ||
                (itemWithRepo.downloadUrl &&
                  itemWithRepo.downloadUrl.startsWith("http")),
              );

              const shouldReplace =
                (!existingHasDl && itemHasDl) ||
                (existingHasDl === itemHasDl &&
                  compareVersions(item.version, existing.version) > 0) ||
                (item.status === "installed" &&
                  existing.status !== "installed");

              if (shouldReplace) {
                dedupedMap.set(normKey, {
                  ...existing,

                  ...itemWithRepo,

                  githubRepo: itemWithRepo.githubRepo || existing.githubRepo,

                  downloadUrl: itemWithRepo.downloadUrl || existing.downloadUrl,
                });
              } else {
                dedupedMap.set(normKey, {
                  ...itemWithRepo,

                  ...existing,

                  githubRepo: existing.githubRepo || itemWithRepo.githubRepo,

                  downloadUrl: existing.downloadUrl || itemWithRepo.downloadUrl,
                });
              }
            }
          }

          const finalApps = Array.from(dedupedMap.values());

          persistApps(finalApps);
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
            const validCatalog = newCatalog.filter((remote: any) => {
              const id = (remote?.id || "").toLowerCase();

              const name = (remote?.name || "").toLowerCase();

              return !(
                id === "tap-studio" ||
                id === "app-tap-studio" ||
                name.includes("tap studio")
              );
            });

            const merged = validCatalog.map((remote: any) => {
              const local = prevApps.find((a) => a.id === remote.id);

              const target = local
                ? {
                    ...remote,

                    status: local.status,

                    installedPath: local.installedPath,

                    localVersion: local.localVersion,
                  }
                : remote;

              if (
                target.id === "mediaflow-studio" ||
                target.id === "app-mediaflow-studio" ||
                (target.name && target.name.toLowerCase().includes("mediaflow"))
              ) {
                if (!target.iconValue || target.iconType !== "image") {
                  target.iconType = "image";

                  target.iconValue = MEDIAFLOW_STUDIO_LOGO_BASE64;
                }
              }

              return target;
            });

            const dedupedMap = new Map<string, CatalogApp>();

            for (const item of merged) {
              const normKey = (item.id || "")

                .toLowerCase()

                .replace(/^app-/, "")

                .replace(/-studio$/, "")

                .replace(/[^a-z0-9]/g, "");

              const itemRepo =
                item.githubRepo ||
                KNOWN_ECOSYSTEM_REPOS[normKey] ||
                KNOWN_ECOSYSTEM_REPOS[item.id];

              const itemWithRepo = itemRepo
                ? { ...item, githubRepo: itemRepo }
                : item;

              if (!dedupedMap.has(normKey)) {
                dedupedMap.set(normKey, itemWithRepo);
              } else {
                const existing = dedupedMap.get(normKey)!;

                const existingHasDl = Boolean(
                  existing.githubRepo ||
                  (existing.downloadUrl &&
                    existing.downloadUrl.startsWith("http")),
                );

                const itemHasDl = Boolean(
                  itemWithRepo.githubRepo ||
                  (itemWithRepo.downloadUrl &&
                    itemWithRepo.downloadUrl.startsWith("http")),
                );

                const shouldReplace =
                  (!existingHasDl && itemHasDl) ||
                  (existingHasDl === itemHasDl &&
                    compareVersions(item.version, existing.version) > 0) ||
                  (item.status === "installed" &&
                    existing.status !== "installed");

                if (shouldReplace) {
                  dedupedMap.set(normKey, {
                    ...existing,

                    ...itemWithRepo,

                    githubRepo: itemWithRepo.githubRepo || existing.githubRepo,

                    downloadUrl:
                      itemWithRepo.downloadUrl || existing.downloadUrl,
                  });
                } else {
                  dedupedMap.set(normKey, {
                    ...itemWithRepo,

                    ...existing,

                    githubRepo: existing.githubRepo || itemWithRepo.githubRepo,

                    downloadUrl:
                      existing.downloadUrl || itemWithRepo.downloadUrl,
                  });
                }
              }
            }

            const finalApps = Array.from(dedupedMap.values());

            localStorage.setItem(
              "creative_hub_catalog_apps_v4",
              JSON.stringify(finalApps),
            );

            return finalApps;
          });
        }
      });

      return unsub;
    }
  }, []);

  // Real-time loader customization sync across all windows

  useEffect(() => {
    const electronAPI = (window as any).electronAPI;

    if (electronAPI?.onLoaderUpdated) {
      const unsub = electronAPI.onLoaderUpdated(
        (data: { appId: string; config: any }) => {
          if (data?.config) {
            if (data.appId === "anything" || !data.appId) {
              setSplashSettings(data.config);
            }
          }
        },
      );

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

                status:
                  data.status === "extracting" || data.status === "installing"
                    ? "extracting"
                    : a.status,

                downloadProgress: {
                  percent: data.percent,

                  transferredBytes: data.transferredBytes || 0,

                  totalBytes: data.totalBytes || 0,

                  speedBytesPerSec: data.speedBytesPerSec || 0,
                },
              };
            }

            return a;
          }),
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
          setCurrentPage("apps");
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

        .filter(
          (a) =>
            a.status === "installed" && (a.installedPath || a.executableName),
        )

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

  // Check GitHub Releases for newer versions of child applications

  const checkAllGitHubUpdates = async () => {
    const electronAPI = (window as any).electronAPI;

    if (!electronAPI?.checkGitHubRelease) return;

    // Load user update preferences

    let updateSettings = {
      mode: "manual",

      frequency: "startup",

      silentInstall: true,

      notifyAvailable: true,

      notifyComplete: true,
    };

    try {
      const saved = localStorage.getItem("anything_child_app_update_settings");

      if (saved) updateSettings = JSON.parse(saved);
    } catch {}

    // Track notified update versions to prevent spamming notifications repeatedly

    let notifiedUpdates: Record<string, string> = {};

    try {
      const savedNotifs = localStorage.getItem("anything_notified_app_updates");

      if (savedNotifs) notifiedUpdates = JSON.parse(savedNotifs);
    } catch {}

    setIsCheckingUpdates(true);

    try {
      const appsToAutoUpdate: CatalogApp[] = [];

      const updatedList = await Promise.all(
        apps.map(async (app) => {
          const normKey = (app.id || "")
            .toLowerCase()
            .replace(/^app-/, "")
            .replace(/-studio$/, "")
            .replace(/[^a-z0-9]/g, "");

          const resolvedRepo =
            app.githubRepo ||
            KNOWN_ECOSYSTEM_REPOS[normKey] ||
            KNOWN_ECOSYSTEM_REPOS[app.id];

          if (!resolvedRepo) return app;

          try {
            const res = await electronAPI.checkGitHubRelease(
              resolvedRepo,

              app.localVersion || app.version,

              app.id,
            );

            if (res.success && res.asset) {
              const hasNewVersion = res.hasUpdate;

              const remoteVer = res.remoteVersion || res.rawTag || app.version;

              const appWithRelease: CatalogApp = {
                ...app,

                version: remoteVer,

                latestRelease: {
                  tag: remoteVer,

                  name: res.releaseName,

                  body: res.releaseNotes,

                  assetUrl: res.asset.downloadUrl,

                  assetName: res.asset.name,

                  assetSize: res.asset.sizeFormatted,

                  publishedAt: res.publishedAt,
                },
              };

              if (
                hasNewVersion &&
                (app.status === "installed" ||
                  app.status === "update-available" ||
                  Boolean(app.installedPath))
              ) {
                // MODE A: AUTO-UPDATE (Background Silent Installation)

                if (updateSettings.mode === "auto") {
                  appsToAutoUpdate.push(appWithRelease);

                  return {
                    ...appWithRelease,

                    status: "downloading" as const,
                  };
                }

                // MODE B: MANUAL (User clicks update when ready)

                // ONLY notify once per app version to prevent notification spam

                const alreadyNotifiedVer = notifiedUpdates[app.id];

                if (alreadyNotifiedVer !== remoteVer) {
                  // Update notification suppressed by policy

                  notifiedUpdates[app.id] = remoteVer;

                  try {
                    localStorage.setItem(
                      "anything_notified_app_updates",
                      JSON.stringify(notifiedUpdates),
                    );
                  } catch {}
                }

                return {
                  ...appWithRelease,

                  status: "update-available" as const,
                };
              }

              return appWithRelease;
            }
          } catch (e) {
            console.error(`Error checking GitHub for ${app.name}:`, e);
          }

          return app;
        }),
      );

      persistApps(updatedList);

      // Execute auto-updates sequentially if in auto mode

      if (updateSettings.mode === "auto" && appsToAutoUpdate.length > 0) {
        for (const appToUpdate of appsToAutoUpdate) {
          try {
            await handleInstallApp(appToUpdate);
          } catch (err) {
            console.error(`Auto-update failed for ${appToUpdate.name}:`, err);
          }
        }
      }
    } finally {
      setIsCheckingUpdates(false);
    }
  };

  // Background update check interval according to user frequency preference

  useEffect(() => {
    let updateSettings = { frequency: "startup" };

    try {
      const saved = localStorage.getItem("anything_child_app_update_settings");

      if (saved) updateSettings = JSON.parse(saved);
    } catch {}

    if (updateSettings.frequency === "manual") return;

    let intervalMs = 0;

    if (updateSettings.frequency === "1h") intervalMs = 3600000;
    else if (updateSettings.frequency === "6h") intervalMs = 21600000;

    if (intervalMs > 0) {
      const timer = setInterval(() => {
        checkAllGitHubUpdates();
      }, intervalMs);

      return () => clearInterval(timer);
    }
  }, []);

  useEffect(() => {
    checkAllGitHubUpdates();
  }, [apps.length]);

  // Verify installed paths on disk upon launch and auto-resolve existing installations

  useEffect(() => {
    const verifyAllPaths = async () => {
      const electronAPI = (window as any).electronAPI;

      if (!electronAPI?.resolveInstalledPath && !electronAPI?.verifyAppPath)
        return;

      const checked = await Promise.all(
        apps.map(async (app) => {
          if (electronAPI?.resolveInstalledPath) {
            const detected = await electronAPI.resolveInstalledPath({
              appId: app.id,

              name: app.name,

              currentPath: app.installedPath,

              executableName: app.executableName,
            });

            if (detected?.installed && detected?.resolvedPath) {
              const activeLocalVer = detected.version || app.localVersion;

              const isOutdated = activeLocalVer
                ? compareVersions(app.version, activeLocalVer) > 0
                : false;

              return {
                ...app,

                status: isOutdated
                  ? ("update-available" as const)
                  : ("installed" as const),

                installedPath: detected.resolvedPath,

                localVersion: activeLocalVer,
              };
            }
          }

          if (app.status === "installed" || app.status === "update-available") {
            if (app.installedPath) {
              const exists = await electronAPI.verifyAppPath(app.installedPath);

              if (!exists) {
                return {
                  ...app,
                  status: "not-installed" as const,
                  installedPath: undefined,
                };
              }
            } else {
              return { ...app, status: "not-installed" as const };
            }
          }

          return app;
        }),
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

              status: "downloading",

              downloadProgress: {
                percent: 15,

                transferredBytes: 0,

                totalBytes: 0,

                speedBytesPerSec: 0,
              },
            }
          : a,
      ),
    );

    const normKey = (targetApp.id || "")

      .toLowerCase()

      .replace(/^app-/, "")

      .replace(/-studio$/, "")

      .replace(/[^a-z0-9]/g, "");

    const resolvedRepo =
      targetApp.githubRepo ||
      KNOWN_ECOSYSTEM_REPOS[normKey] ||
      KNOWN_ECOSYSTEM_REPOS[targetApp.id];

    // 1. Direct GitHub Release Installation or Update (Takes Setup EXE from GitHub, NOT from computer)

    if (
      electronAPI?.updateAppFromGitHub &&
      (resolvedRepo ||
        targetApp.latestRelease?.assetUrl ||
        (targetApp.downloadUrl && targetApp.downloadUrl.startsWith("http")))
    ) {
      let downloadUrl =
        targetApp.latestRelease?.assetUrl ||
        (targetApp.downloadUrl?.startsWith("http")
          ? targetApp.downloadUrl
          : undefined);

      let assetName =
        targetApp.latestRelease?.assetName ||
        targetApp.setupExecutableName ||
        targetApp.packageFileName;

      let newVersion = targetApp.latestRelease?.tag || targetApp.version;

      if (resolvedRepo) {
        // Query GitHub releases API for latest setup binary

        try {
          const ghCheck = await electronAPI.checkGitHubRelease(
            resolvedRepo,
            undefined,
            targetApp.id,
          );

          if (ghCheck?.success && ghCheck.asset) {
            downloadUrl = ghCheck.asset.downloadUrl;

            assetName = ghCheck.asset.name;

            newVersion =
              ghCheck.remoteVersion || ghCheck.rawTag || targetApp.version;
          }
        } catch (e) {}
      }

      if (downloadUrl) {
        if (!assetName) {
          assetName =
            downloadUrl.split("/").pop() || `${targetApp.id}_Setup.exe`;
        }

        const result = await electronAPI.updateAppFromGitHub({
          appId: targetApp.id,

          downloadUrl,

          assetName,

          newVersion,

          executableName: targetApp.executableName || `${targetApp.name}.exe`,

          appName: targetApp.name,
        });

        if (result.success) {
          persistApps(
            apps.map((a) =>
              a.id === targetApp.id
                ? {
                    ...a,

                    status: "installed",

                    version: newVersion,

                    localVersion: newVersion,

                    installedPath: result.installedPath,

                    downloadProgress: undefined,
                  }
                : a,
            ),
          );

          return;
        } else {
          console.warn(
            `Online install failed for ${targetApp.name} (${result.error}); attempting local package fallback...`,
          );
        }
      }
    }

    // 2. Safe package installer fallback (installs from local package on disk)

    if (electronAPI?.installPublishedPackage) {
      try {
        const result = await electronAPI.installPublishedPackage({
          ...targetApp,

          githubRepo: resolvedRepo,
        });

        if (result.success) {
          persistApps(
            apps.map((a) =>
              a.id === targetApp.id
                ? {
                    ...a,

                    status: "installed",

                    installedPath: result.installedPath,

                    localVersion: targetApp.version,

                    downloadProgress: undefined,
                  }
                : a,
            ),
          );

          return;
        } else {
          alert(`Installation failed for ${targetApp.name}: ${result.error}`);

          persistApps(
            apps.map((a) =>
              a.id === targetApp.id
                ? { ...a, status: "not-installed", downloadProgress: undefined }
                : a,
            ),
          );

          return;
        }
      } catch (err: any) {
        alert(`Installation error: ${err?.message || err}`);

        persistApps(
          apps.map((a) =>
            a.id === targetApp.id
              ? { ...a, status: "not-installed", downloadProgress: undefined }
              : a,
          ),
        );

        return;
      }
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

                  status: "installed",

                  installedPath: result.installedPath,

                  localVersion: targetApp.version,

                  downloadProgress: undefined,
                }
              : a,
          ),
        );
      } else {
        alert(`Installation failed: ${result.error}`);

        persistApps(
          apps.map((a) =>
            a.id === targetApp.id
              ? { ...a, status: "not-installed", downloadProgress: undefined }
              : a,
          ),
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

                status: "installed",

                localVersion: targetApp.version,

                installedPath: `C:\\Program Files\\${targetApp.name}\\${targetApp.executableName}`,

                downloadProgress: undefined,
              }
            : a,
        ),
      );
    }, 1000);
  };

  const handleLaunchApp = async (targetApp: CatalogApp) => {
    const electronAPI = (window as any).electronAPI;

    let launchPath = targetApp.installedPath || "";

    if (
      !launchPath ||
      launchPath.toLowerCase().includes("setup") ||
      launchPath.toLowerCase().includes("published-apps") ||
      launchPath.toLowerCase().includes("uni desk")
    ) {
      launchPath = targetApp.executableName || `${targetApp.name}.exe`;
    }

    if (electronAPI?.launchApp) {
      const res = await electronAPI.launchApp({
        path: launchPath,

        name: targetApp.name,

        id: targetApp.id,

        executableName: targetApp.executableName,
      });

      if (!res.success) {
        alert(
          `Could not launch application: ${res.error}\nClick "Fix Path" to locate your executable.`,
        );

        persistApps(
          apps.map((a) =>
            a.id === targetApp.id ? { ...a, status: "path-broken" } : a,
          ),
        );
      } else if (launchPath && launchPath !== targetApp.installedPath) {
        persistApps(
          apps.map((a) =>
            a.id === targetApp.id
              ? {
                  ...a,

                  status: "installed",

                  installedPath: launchPath,

                  localVersion: a.localVersion || a.version,
                }
              : a,
          ),
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

                status: "downloading",

                downloadProgress: {
                  percent: 15,

                  transferredBytes: 0,

                  totalBytes: 0,

                  speedBytesPerSec: 0,
                },
              }
            : a,
        ),
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

                  status: "installed",

                  version: release.tag,

                  localVersion: release.tag,

                  installedPath: result.installedPath,

                  downloadProgress: undefined,
                }
              : a,
          ),
        );

        if (electronAPI?.showNotification) {
          electronAPI.showNotification({
            title: `⏪ Rolled Back ${targetApp.name}`,

            body: `Successfully switched to version v${release.tag}.`,

            appId: targetApp.id,

            appName: targetApp.name,

            icon: targetApp.iconValue,
          });
        }
      } else {
        alert(`Rollback failed: ${result.error}`);

        persistApps(
          apps.map((a) =>
            a.id === targetApp.id
              ? { ...a, status: "installed", downloadProgress: undefined }
              : a,
          ),
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
            : a,
        ),
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
              ? { ...a, installedPath: res.newPath, status: "installed" }
              : a,
          ),
        );
      }
    } else {
      const manualPath = prompt(
        "Enter new executable path:",
        targetApp.installedPath || "",
      );

      if (manualPath) {
        persistApps(
          apps.map((a) =>
            a.id === targetApp.id
              ? { ...a, installedPath: manualPath, status: "installed" }
              : a,
          ),
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
          ? {
              ...a,
              status: "not-installed",
              installedPath: undefined,
              localVersion: undefined,
            }
          : a,
      ),
    );
  };

  const handleAddCatalogApp = (newApp: CatalogApp) => {
    // If updating existing app version, flip status to update-available

    const existing = apps.find((a) => a.id === newApp.id);

    if (
      existing &&
      existing.status === "installed" &&
      existing.localVersion !== newApp.version
    ) {
      persistApps(
        apps.map((a) =>
          a.id === newApp.id
            ? {
                ...newApp,
                status: "update-available",
                localVersion: existing.localVersion,
                installedPath: existing.installedPath,
              }
            : a,
        ),
      );

      return;
    }

    persistApps([newApp, ...apps.filter((a) => a.id !== newApp.id)]);
  };

  const handleRemoveCatalogApp = (id: string) => {
    const normTarget = id
      .toLowerCase()
      .replace(/^app-/, "")
      .replace(/[^a-z0-9]/g, "");

    const updated = apps.filter((a) => {
      const aNorm = a.id
        .toLowerCase()
        .replace(/^app-/, "")
        .replace(/[^a-z0-9]/g, "");

      return a.id !== id && aNorm !== normTarget;
    });

    persistApps(updated);

    if (
      viewingApp &&
      (viewingApp.id === id ||
        viewingApp.id
          .toLowerCase()
          .replace(/^app-/, "")
          .replace(/[^a-z0-9]/g, "") === normTarget)
    ) {
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
      console.error("Failed to delete app:", err);
    }

    handleRemoveCatalogApp(id);
  };

  const handleRenameApp = (id: string, newName: string) => {
    const normTarget = id
      .toLowerCase()
      .replace(/^app-/, "")
      .replace(/[^a-z0-9]/g, "");

    const updated = apps.map((a) => {
      const aNorm = a.id
        .toLowerCase()
        .replace(/^app-/, "")
        .replace(/[^a-z0-9]/g, "");

      return a.id === id || aNorm === normTarget ? { ...a, name: newName } : a;
    });

    persistApps(updated);

    if (
      viewingApp &&
      (viewingApp.id === id ||
        viewingApp.id
          .toLowerCase()
          .replace(/^app-/, "")
          .replace(/[^a-z0-9]/g, "") === normTarget)
    ) {
      setViewingApp({ ...viewingApp, name: newName });
    }
  };

  const handleEditApp = async (id: string, updates: Partial<CatalogApp>) => {
    try {
      const electronAPI = (window as any).electronAPI;

      if (electronAPI?.updateApp) {
        await electronAPI.updateApp({ appId: id, ...updates });
      }
    } catch (err) {
      console.error("Failed to update app in main process:", err);
    }

    const normTarget = id
      .toLowerCase()
      .replace(/^app-/, "")
      .replace(/[^a-z0-9]/g, "");

    const updated = apps.map((a) => {
      const aNorm = a.id
        .toLowerCase()
        .replace(/^app-/, "")
        .replace(/[^a-z0-9]/g, "");

      if (a.id === id || aNorm === normTarget) {
        return {
          ...a,

          ...updates,

          hasRealIcon: true,
        };
      }

      return a;
    });

    persistApps(updated);

    if (
      viewingApp &&
      (viewingApp.id === id ||
        viewingApp.id
          .toLowerCase()
          .replace(/^app-/, "")
          .replace(/[^a-z0-9]/g, "") === normTarget)
    ) {
      setViewingApp({
        ...viewingApp,

        ...updates,

        hasRealIcon: true,
      });
    }
  };

  const handleVersionDeleted = (id: string, deletedVer: string) => {
    const cleanVer = deletedVer.replace(/^[vV]/, "").trim();

    const normTarget = id
      .toLowerCase()
      .replace(/^app-/, "")
      .replace(/[^a-z0-9]/g, "");

    const updated = apps.map((a) => {
      const aNorm = a.id
        .toLowerCase()
        .replace(/^app-/, "")
        .replace(/[^a-z0-9]/g, "");

      if (a.id === id || aNorm === normTarget) {
        const nextHistory = (a.history || []).filter(
          (h: any) =>
            (h.version || "").replace(/^[vV]/, "").trim() !== cleanVer,
        );

        const nextVersion =
          (a.version || "").replace(/^[vV]/, "").trim() === cleanVer
            ? nextHistory[0]?.version || a.version
            : a.version;

        return { ...a, history: nextHistory, version: nextVersion };
      }

      return a;
    });

    persistApps(updated);

    if (
      viewingApp &&
      (viewingApp.id === id ||
        viewingApp.id
          .toLowerCase()
          .replace(/^app-/, "")
          .replace(/[^a-z0-9]/g, "") === normTarget)
    ) {
      const current = updated.find(
        (a) =>
          a.id === id ||
          a.id
            .toLowerCase()
            .replace(/^app-/, "")
            .replace(/[^a-z0-9]/g, "") === normTarget,
      );

      if (current) setViewingApp(current);
    }
  };

  const handleStartTrial = (targetApp: CatalogApp) => {
    const updated = apps.map((a) => {
      if (a.id === targetApp.id) {
        return {
          ...a,

          status: "trial" as const,

          trialInfo: {
            active: true,

            startedAt: Date.now(),
          },
        };
      }

      return a;
    });

    persistApps(updated);

    if (viewingApp && viewingApp.id === targetApp.id) {
      setViewingApp({
        ...viewingApp,

        status: "trial" as const,

        trialInfo: {
          active: true,

          startedAt: Date.now(),
        },
      });
    }
  };

  const updateCount = apps.filter(
    (a) => a.status === "update-available",
  ).length;

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

          onEditApp={handleEditApp}

          onVersionDeleted={handleVersionDeleted}

          onStartTrial={handleStartTrial}

          onCustomizeLoader={(targetApp) => {
            setCustomizeAppId(targetApp.id);

            setViewingApp(null);

            setCurrentPage("settings");
          }}
        />
      );
    }

    switch (currentPage) {
      case "home":
        return (
          <HomePage
            apps={apps as any}

            onNavigate={(p) => {
              setViewingApp(null);

              setCurrentPage(p);
            }}

            onOpenApp={(app) => handleLaunchApp(app as any)}

            onUpdateAll={() => {
              apps
                .filter((a) => a.status === "update-available")
                .forEach(handleUpdateApp);
            }}
          />
        );

      case "apps":
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

            onEditApp={handleEditApp}

            onTryDemoApp={(app) => setDemoModalApp(app)}

            onAddCustomApp={(custom) => handleAddCatalogApp(custom as any)}

            onImportApps={(imported) => persistApps(imported)}

            onOpenDetailApp={(targetApp) => setViewingApp(targetApp)}

            onCustomizeLoader={(targetApp) => {
              setCustomizeAppId(targetApp.id);

              setViewingApp(null);

              setCurrentPage("settings");
            }}

            isCheckingUpdates={isCheckingUpdates}

            onCheckUpdates={checkAllGitHubUpdates}
          />
        );

      
      

      

      case "files":
        return <FilesPage searchQuery={searchQuery} />;

      case "settings":
        return (
          <SettingsPage
            apps={apps}

            initialAppId={customizeAppId}

            onPreviewSplash={(customSettings) => {
              setPreviewSplash(customSettings);
            }}

            onUpdateApp={handleUpdateApp}

            onCheckUpdates={checkAllGitHubUpdates}

            isCheckingUpdates={isCheckingUpdates}
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

      {isAuthModalOpen && <AuthScreen isModal onClose={closeAuthModal} />}

      <AppLayout
        currentPage={currentPage}

        appName={viewingApp?.name}
        activeApp={viewingApp}

        onNavigate={(page) => {
          setViewingApp(null);

          setCurrentPage(page);

          setSearchQuery("");
        }}

        searchQuery={searchQuery}

        onSearchChange={setSearchQuery}

        updateCount={updateCount}
      >
        {renderActivePage()}
      </AppLayout>

      {/* Global Command Palette */}

      <CommandPalette
        isOpen={isCommandPaletteOpen}

        onClose={() => setIsCommandPaletteOpen(false)}

        apps={apps}

        onNavigate={(page) => {
          setViewingApp(null);

          setCurrentPage(page);
        }}

        onLaunchApp={handleLaunchApp}

        onCheckUpdates={checkAllGitHubUpdates}
      />

      {/* Global Interactive Demo Simulator & Free Demo Modal */}

      {demoModalApp && (
        <AppDemoModal
          app={demoModalApp}

          isOpen={Boolean(demoModalApp)}

          onClose={() => setDemoModalApp(null)}

          onInstall={(appToInstall) => {
            handleInstallApp(appToInstall);

            setDemoModalApp(null);
          }}

          onStartTrial={(appToTrial) => {
            handleStartTrial(appToTrial);

            setDemoModalApp(null);
          }}
        />
      )}
    </div>
  );
}

export default App;
