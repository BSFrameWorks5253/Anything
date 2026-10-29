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
  checkGitHubRelease: (repo: string, currentVersion?: string, appId?: string) => Promise<any>;
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
  showNotification: (data: { title: string; body: string; appId?: string; icon?: string; appName?: string; version?: string }) => Promise<any>;
  onNotificationClicked: (callback: (data: any) => void) => () => void;

  // Git Ecosystem Auto-Commit
  gitStatus?: () => Promise<{ success: boolean; isDirty: boolean; branch: string; changedFilesCount: number; files: string[]; error?: string }>;
  gitPreviewMessage?: () => Promise<{ success: boolean; output?: string; error?: string }>;
  gitAutoCommit?: (options?: { push?: boolean; ecosystem?: boolean; message?: string }) => Promise<{ success: boolean; output?: string; error?: string }>;

  // Master Builder Studio
  launchMasterBuilder?: () => Promise<{ success: boolean; error?: string }>;
  syncEcosystemVersions?: () => Promise<{ success: boolean; output?: string; error?: string }>;

  // Splash Screen Lifecycle
  splashDone?: () => Promise<boolean>;

  // Windows 11 Controls
  minimizeWindow: () => Promise<boolean>;
  maximizeWindow: () => Promise<boolean>;
  closeWindow: () => Promise<boolean>;
  isWindowMaximized: () => Promise<boolean>;
  onWindowStateChanged: (callback: (data: { isMaximized: boolean }) => void) => () => void;

  // One Tap Daemon & PNG to JPG Auto-Converter
  oneTapConvertFiles?: (files?: string[]) => Promise<{ success: boolean; converted: number; failed: number; outputDir?: string }>;
  oneTapConvertFolder?: (folder?: string) => Promise<{ success: boolean; converted: number; failed: number; outputDir?: string }>;
  oneTapLaunch?: () => Promise<{ success: boolean }>;
  oneTapGetWatcherStatus?: () => Promise<{ enabled: boolean; active: boolean; watchDir: string | null; outDir: string | null; lastConvertedDir?: string | null }>;
  oneTapToggleWatcher?: (enabled?: boolean) => Promise<{ enabled: boolean; active: boolean; watchDir: string | null; outDir: string | null; lastConvertedDir?: string | null }>;
  oneTapOpenWatchFolder?: () => Promise<{ success: boolean; path?: string; error?: string }>;
  oneTapOpenOutputFolder?: () => Promise<{ success: boolean; path?: string; error?: string }>;
  oneTapSetWatchFolder?: () => Promise<{ success: boolean; enabled?: boolean; active?: boolean; watchDir?: string | null; outDir?: string | null; canceled?: boolean }>;
  oneTapGetTrackerSummary?: () => Promise<any>;
  oneTapOpenPage?: (page?: string) => Promise<{ success: boolean; launched?: boolean; error?: string }>;
  oneTapGetFinalTitles?: () => Promise<any>;
  oneTapSelectFinalTitlesFolder?: () => Promise<{ success: boolean; folderPath?: string }>;
  oneTapOpenFinalTitlesFolder?: (folder?: string) => Promise<{ success: boolean }>;
  oneTapRevealFile?: (filePath: string) => Promise<{ success: boolean }>;
  onOneTapConverted?: (callback: (data: { converted: number; failed: number; outputDir?: string; file?: string }) => void) => () => void;
  onOneTapStatus?: (callback: (data: { enabled: boolean; active: boolean; watchDir: string | null; outDir: string | null; lastConvertedDir?: string | null }) => void) => () => void;

  // MediaFlow Studio Event Badges & Remote Launcher
  mediaflowGetBadgesDir?: () => Promise<{
    path: string;
    exists: boolean;
    count: number;
    sampleBadges: Array<{ name: string; token: string; fullPath: string }>;
    lastUpdated?: string;
    updatedBy?: string;
  }>;
  mediaflowSetBadgesDir?: (dirPath: string) => Promise<{
    success: boolean;
    path: string;
    exists: boolean;
    count: number;
    sampleBadges: Array<{ name: string; token: string; fullPath: string }>;
  }>;
  mediaflowSelectBadgesDir?: () => Promise<{
    path: string;
    exists: boolean;
    count: number;
    sampleBadges: Array<{ name: string; token: string; fullPath: string }>;
  } | null>;
  mediaflowLaunchStudio?: (imagesDir?: string) => Promise<boolean>;
  mediaflowOpenFolder?: (targetPath?: string) => Promise<boolean>;
  onMediaFlowBadgesUpdated?: (callback: (data: any) => void) => () => void;

  // Mac-Style Drop Shelf & Mobile QR Server
  fileShelfGetItems?: () => Promise<Array<{
    id: string;
    name: string;
    size: number;
    sizeFormatted: string;
    mimeType: string;
    isImage: boolean;
    createdAt: string;
    filePath: string;
  }>>;
  fileShelfAddFiles?: (filePaths: string[]) => Promise<{ success: boolean; added: any[]; total: number }>;
  fileShelfRemoveItem?: (id: string) => Promise<boolean>;
  fileShelfClear?: () => Promise<boolean>;
  fileShelfSelectFiles?: () => Promise<{ success: boolean; added: any[]; total: number }>;
  fileShelfGetServerInfo?: () => Promise<{
    isRunning: boolean;
    port: number;
    localIp: string;
    shareUrl: string;
    qrDataUrl: string;
    totalItems: number;
  }>;
  fileShelfSaveItemToDisk?: (id: string) => Promise<{ success: boolean; savedPath?: string }>;
  fileShelfOpenItem?: (id: string) => Promise<boolean>;
  onFileShelfUpdated?: (callback: (items: any[]) => void) => () => void;
  onFileShelfItemReceived?: (callback: (item: any) => void) => () => void;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
    electron?: {
      ipcRenderer?: {
        invoke: (channel: string, ...args: any[]) => Promise<any>;
        on?: (channel: string, listener: (...args: any[]) => void) => () => void;
      };
    };
  }
}
