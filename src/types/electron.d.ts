export interface ElectronAPI {
  platform: string;
  launchApp: (
    target: string | { path?: string; name?: string; id?: string; executableName?: string }
  ) => Promise<{ success: boolean; error?: string; resolvedPath?: string }>;
  launchAppDemo?: (appData: any) => Promise<{ success: boolean; error?: string; mode?: string; path?: string }>;
  resolveInstalledPath?: (data: {
    appId?: string;
    name?: string;
    currentPath?: string;
    executableName?: string;
  }) => Promise<{ installed: boolean; resolvedPath?: string | null; version?: string | null; error?: string }>;
  selectExecutable: () => Promise<string | null>;
  openExternal: (url: string) => Promise<void>;

  // Publisher
  openInboxFolder: () => Promise<string>;
  scanInboxFolder: () => Promise<any>;
  pushPackage: (data: { stagedFile: any; appConfig: any }) => Promise<any>;
  loadPublishedCatalog: () => Promise<{ success: boolean; catalog: any[]; error?: string }>;
  installPublishedPackage: (appData: any) => Promise<any>;

  // Releases Collector & Folder
  getReleasesPath: () => Promise<string>;
  openReleasesFolder: () => Promise<string>;
  scanAndCollectReleases: () => Promise<{
    success: boolean;
    addedCount: number;
    updatedCount: number;
    total: number;
    catalog: any[];
    error?: string;
  }>;
  saveChildAppLoaderConfig?: (data: { appId: string; config: any }) => Promise<{
    success: boolean;
    releaseConfigPath?: string;
    globalPath?: string;
    error?: string;
  }>;
  loadChildAppLoaderConfig?: (appId: string) => Promise<{
    success: boolean;
    config?: any;
    notFound?: boolean;
    error?: string;
  }>;
  onCatalogUpdated: (callback: (catalog: any[]) => void) => () => void;
  onLoaderUpdated?: (callback: (data: { appId: string; config: any }) => void) => () => void;
  syncAppSources?: () => Promise<{ success: boolean; synced: number; errors: string[] }>;
  getAppSources?: () => Promise<{ success: boolean; sources: any[] }>;
  saveAppSources?: (sources: any[]) => Promise<{ success: boolean; synced: number; errors: string[] }>;

  // App Lifecycle
  uninstallApp: (appId: string) => Promise<any>;
  fixAppPath: (appName: string) => Promise<any>;
  verifyAppPath: (targetPath: string) => Promise<boolean>;
  onCatalogDownloadProgress: (callback: (data: any) => void) => () => void;

  // GitHub Releases
  checkGitHubRelease: (repo: string, currentVersion?: string) => Promise<any>;
  getGitHubReleaseHistory: (repo: string) => Promise<any>;
  downloadReleaseToInbox: (data: { assetUrl: string; assetName: string }) => Promise<any>;
  updateAppFromGitHub: (data: {
    appId: string;
    downloadUrl: string;
    assetName: string;
    newVersion: string;
    executableName?: string;
  }) => Promise<any>;

  // Tray
  syncTrayInstalledApps: (apps: Array<{ id: string; name: string; path?: string }>) => Promise<any>;
  onTrayCheckUpdates: (callback: () => void) => () => void;

  // Updater
  checkForUpdates: () => Promise<any>;
  installUpdate: () => Promise<any>;
  onUpdateStatus: (callback: (data: any) => void) => () => void;
  saveChildAppUpdateSettings?: (settings: any) => Promise<{ success: boolean; error?: string }>;
  loadChildAppUpdateSettings?: () => Promise<any>;

  // Notifications
  showNotification: (data: { title: string; body: string; appId?: string; icon?: string; appName?: string }) => Promise<any>;
  onNotificationClicked: (callback: (data: any) => void) => () => void;

  // Splash Screen Lifecycle
  splashDone?: () => Promise<boolean>;

  // Windows 11 Controls
  minimizeWindow: () => Promise<boolean>;
  maximizeWindow: () => Promise<boolean>;
  closeWindow: () => Promise<boolean>;
  isWindowMaximized: () => Promise<boolean>;
  onWindowStateChanged: (callback: (data: { isMaximized: boolean }) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}
