export interface ElectronAPI {
  platform: string;
  launchApp: (pathOrUrl: string) => Promise<{ success: boolean; error?: string }>;
  selectExecutable: () => Promise<string | null>;
  openExternal: (url: string) => Promise<void>;

  // Publisher
  openInboxFolder: () => Promise<string>;
  scanInboxFolder: () => Promise<any[]>;
  pushPackage: (data: { stagedFile: any; appConfig: any }) => Promise<any>;
  loadPublishedCatalog: () => Promise<{ success: boolean; catalog: any[]; error?: string }>;
  installPublishedPackage: (appData: any) => Promise<any>;

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

  // Notifications
  showNotification: (data: { title: string; body: string; appId?: string }) => Promise<any>;
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
