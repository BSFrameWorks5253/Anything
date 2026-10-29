import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  launchApp: (target: string | { path?: string; name?: string; id?: string; executableName?: string }) => {
    let pathString = '';
    if (typeof target === 'string') {
      pathString = target;
    } else if (target && typeof target === 'object') {
      pathString = target.path || target.executableName || '';
      const isTap =
        target.id === 'tap-studio' ||
        Boolean(target.name && target.name.toLowerCase().includes('tap studio'));
      const isOneTap =
        target.id === 'one-tap' ||
        target.id === 'onetap-workstation' ||
        Boolean(target.name && target.name.toLowerCase().includes('one tap'));
      const isMediaFlow =
        target.id === 'mediaflow-studio' ||
        Boolean(target.name && target.name.toLowerCase().includes('mediaflow'));
      const isDataManage =
        target.id === 'anything-data-manage' ||
        Boolean(target.name && target.name.toLowerCase().includes('data manage'));
      if (
        !pathString ||
        pathString.toLowerCase().includes('setup') ||
        pathString.toLowerCase().includes('published-apps') ||
        pathString.toLowerCase().includes('uni desk')
      ) {
        const localAppData = process.env.LOCALAPPDATA || '';
        const appData = process.env.APPDATA || '';
        if (isTap && localAppData) {
          pathString = `${localAppData}\\Programs\\Tap Studio\\Tap Studio.exe`;
        } else if (isOneTap && appData) {
          pathString = `${appData}\\Anything\\installed-apps\\one-tap\\OneTap-V-26.10.28.exe`;
        } else if (isMediaFlow && localAppData) {
          pathString = `${localAppData}\\Programs\\MediaFlow Studio\\MediaFlow Studio.exe`;
        } else if (isDataManage && appData) {
          pathString = `${appData}\\Anything\\installed-apps\\anything-data-manage\\AIN53_Data_Management_Setup.exe`;
        }
      }
    }
    return ipcRenderer.invoke('app:launch', typeof target === 'object' && target ? { ...target, path: pathString || target.path } : pathString);
  },
  launchAppDemo: (appData: any) => ipcRenderer.invoke('app:launch-demo', appData),
  resolveInstalledPath: (data: { appId?: string; name?: string; currentPath?: string; executableName?: string }) =>
    ipcRenderer.invoke('app:resolve-installed-path', data),
  selectExecutable: () => ipcRenderer.invoke('app:select-executable'),
  openExternal: (url: string) => ipcRenderer.invoke('app:open-external', url),
  
  // Publisher Staging Inbox & Push Engine
  openInboxFolder: () => ipcRenderer.invoke('publisher:open-inbox'),
  scanInboxFolder: () => ipcRenderer.invoke('publisher:scan-inbox'),
  pushPackage: (data: { stagedFile: any; appConfig: any }) =>
    ipcRenderer.invoke('publisher:push-package', data),
  loadPublishedCatalog: () => ipcRenderer.invoke('publisher:load-catalog'),
  installPublishedPackage: (appData: any) =>
    ipcRenderer.invoke('app:install-published-package', appData),

  // Child App Releases Collector & Folder
  getReleasesPath: () => ipcRenderer.invoke('releases:get-path'),
  openReleasesFolder: () => ipcRenderer.invoke('releases:open-folder'),
  scanAndCollectReleases: () => ipcRenderer.invoke('releases:scan-and-collect'),
  saveChildAppLoaderConfig: (data: { appId: string; config: any }) =>
    ipcRenderer.invoke('loader:save-child-config', data),
  loadChildAppLoaderConfig: (appId: string) =>
    ipcRenderer.invoke('loader:load-child-config', appId),
  onCatalogUpdated: (callback: (catalog: any[]) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('catalog:updated', subscription);
    return () => ipcRenderer.removeListener('catalog:updated', subscription);
  },
  onLoaderUpdated: (callback: (data: { appId: string; config: any }) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('loader:updated', subscription);
    return () => ipcRenderer.removeListener('loader:updated', subscription);
  },
  syncAppSources: () => ipcRenderer.invoke('sources:sync'),
  getAppSources: () => ipcRenderer.invoke('sources:get'),
  saveAppSources: (sources: any[]) => ipcRenderer.invoke('sources:save', sources),

  // App Lifecycle: Uninstall, Path Fixing, Path Verification, Rename, Delete
  uninstallApp: (appId: string) => ipcRenderer.invoke('app:uninstall', appId),
  renameApp: (data: { appId: string; newName: string }) => ipcRenderer.invoke('app:rename', data),
  updateApp: (data: {
    appId: string;
    name?: string;
    category?: string;
    description?: string;
    iconType?: 'monogram' | 'emoji' | 'image';
    iconValue?: string;
  }) => ipcRenderer.invoke('app:update', data),
  deleteAppVersion: (data: { appId: string; version: string }) => ipcRenderer.invoke('app:delete-version', data),
  deleteApp: (appId: string) => ipcRenderer.invoke('app:delete', appId),
  pushReleaseEmail: (data: { appId: string; version: string; payload?: any }) =>
    ipcRenderer.invoke('email:push-release', data),
  fixAppPath: (appName: string) => ipcRenderer.invoke('app:fix-path', appName),
  verifyAppPath: (targetPath: string) => ipcRenderer.invoke('app:verify-path', targetPath),
  onCatalogDownloadProgress: (callback: (data: any) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('catalog:download-progress', subscription);
    return () => ipcRenderer.removeListener('catalog:download-progress', subscription);
  },

  // GitHub App Releases Sync & Direct Updates
  checkGitHubRelease: (repo: string, currentVersion?: string, appId?: string) =>
    ipcRenderer.invoke('github:check-release', { repo, currentVersion, appId }),
  getGitHubReleaseHistory: (repo: string) =>
    ipcRenderer.invoke('github:get-release-history', { repo }),
  downloadReleaseToInbox: (data: { assetUrl: string; assetName: string }) =>
    ipcRenderer.invoke('github:download-release-to-inbox', data),
  updateAppFromGitHub: (data: {
    appId: string;
    downloadUrl: string;
    assetName: string;
    newVersion: string;
    executableName?: string;
  }) => ipcRenderer.invoke('github:update-app', data),

  // Windows System Tray
  syncTrayInstalledApps: (apps: Array<{ id: string; name: string; path?: string }>) =>
    ipcRenderer.invoke('tray:sync-installed-apps', apps),
  onTrayCheckUpdates: (callback: () => void) => {
    const subscription = () => callback();
    ipcRenderer.on('tray:check-updates', subscription);
    return () => ipcRenderer.removeListener('tray:check-updates', subscription);
  },

  // Auto-Updater
  checkForUpdates: () => ipcRenderer.invoke('updater:check'),
  installUpdate: () => ipcRenderer.invoke('updater:install'),
  onUpdateStatus: (callback: (data: any) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('updater:status', subscription);
    return () => ipcRenderer.removeListener('updater:status', subscription);
  },
  saveChildAppUpdateSettings: (settings: any) =>
    ipcRenderer.invoke('settings:save-child-app-updates', settings),
  loadChildAppUpdateSettings: () =>
    ipcRenderer.invoke('settings:load-child-app-updates'),

  // Native Windows Notifications
  showNotification: (data: { title: string; body: string; appId?: string; icon?: string; appName?: string; version?: string }) =>
    ipcRenderer.invoke('notification:show', data),
  onNotificationClicked: (callback: (data: any) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('notification:clicked', subscription);
    return () => ipcRenderer.removeListener('notification:clicked', subscription);
  },

  // Git Ecosystem Auto-Commit
  gitStatus: () => ipcRenderer.invoke('git:status'),
  gitPreviewMessage: () => ipcRenderer.invoke('git:preview-message'),
  gitAutoCommit: (options?: { push?: boolean; ecosystem?: boolean; message?: string }) =>
    ipcRenderer.invoke('git:auto-commit', options),

  // Master Builder Studio
  launchMasterBuilder: () => ipcRenderer.invoke('builder:launch'),
  syncEcosystemVersions: () => ipcRenderer.invoke('builder:sync-versions'),

  // Splash Screen Lifecycle
  splashDone: () => ipcRenderer.invoke('splash:done'),

  // Windows 11 Fluent Window Caption Controls
  minimizeWindow: () => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: () => ipcRenderer.invoke('window:maximize'),
  closeWindow: () => ipcRenderer.invoke('window:close'),
  isWindowMaximized: () => ipcRenderer.invoke('window:is-maximized'),
  onWindowStateChanged: (callback: (data: { isMaximized: boolean }) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('window:state-changed', subscription);
    return () => ipcRenderer.removeListener('window:state-changed', subscription);
  },

  // One Tap Daemon & PNG to JPG Auto-Converter
  oneTapConvertFiles: (files?: string[]) => ipcRenderer.invoke('onetap:convert-files', files),
  oneTapConvertFolder: (folder?: string) => ipcRenderer.invoke('onetap:convert-folder', folder),
  oneTapLaunch: () => ipcRenderer.invoke('onetap:launch'),
  oneTapGetWatcherStatus: () => ipcRenderer.invoke('onetap:get-watcher-status'),
  oneTapToggleWatcher: (enabled?: boolean) => ipcRenderer.invoke('onetap:toggle-watcher', enabled),
  oneTapOpenWatchFolder: () => ipcRenderer.invoke('onetap:open-watch-folder'),
  oneTapOpenOutputFolder: () => ipcRenderer.invoke('onetap:open-output-folder'),
  oneTapSetWatchFolder: () => ipcRenderer.invoke('onetap:set-watch-folder'),
  oneTapGetTrackerSummary: () => ipcRenderer.invoke('onetap:get-tracker-summary'),
  oneTapOpenPage: (page: string = 'tracker') => ipcRenderer.invoke('onetap:open-page', page),
  oneTapGetFinalTitles: () => ipcRenderer.invoke('onetap:get-final-titles'),
  oneTapSelectFinalTitlesFolder: () => ipcRenderer.invoke('onetap:select-final-titles-folder'),
  oneTapOpenFinalTitlesFolder: (folder?: string) => ipcRenderer.invoke('onetap:open-final-titles-folder', folder),
  oneTapRevealFile: (filePath: string) => ipcRenderer.invoke('onetap:reveal-file', filePath),
  onOneTapConverted: (callback: (data: { converted: number; failed: number; outputDir?: string; file?: string }) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('onetap:converted', subscription);
    return () => ipcRenderer.removeListener('onetap:converted', subscription);
  },
  onOneTapStatus: (callback: (data: { enabled: boolean; active: boolean; watchDir: string | null; outDir: string | null; lastConvertedDir?: string | null }) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('onetap:status', subscription);
    return () => ipcRenderer.removeListener('onetap:status', subscription);
  },

  // MediaFlow Studio Event Badges & Remote Launcher
  mediaflowGetBadgesDir: () => ipcRenderer.invoke('mediaflow:get-event-badges-dir'),
  mediaflowSetBadgesDir: (dirPath: string) => ipcRenderer.invoke('mediaflow:set-event-badges-dir', dirPath),
  mediaflowSelectBadgesDir: () => ipcRenderer.invoke('mediaflow:select-badges-dir'),
  mediaflowLaunchStudio: (imagesDir?: string) => ipcRenderer.invoke('mediaflow:launch-studio', imagesDir),
  mediaflowOpenFolder: (targetPath?: string) => ipcRenderer.invoke('mediaflow:open-folder', targetPath),
  onMediaFlowBadgesUpdated: (callback: (data: any) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('mediaflow:badges-dir-updated', subscription);
    return () => ipcRenderer.removeListener('mediaflow:badges-dir-updated', subscription);
  },

  // Mac-Style Drop Shelf & Mobile QR Server
  fileShelfGetItems: () => ipcRenderer.invoke('fileshelf:get-items'),
  fileShelfAddFiles: (filePaths: string[]) => ipcRenderer.invoke('fileshelf:add-files', filePaths),
  fileShelfRemoveItem: (id: string) => ipcRenderer.invoke('fileshelf:remove-item', id),
  fileShelfClear: () => ipcRenderer.invoke('fileshelf:clear'),
  fileShelfSelectFiles: () => ipcRenderer.invoke('fileshelf:select-files'),
  fileShelfGetServerInfo: () => ipcRenderer.invoke('fileshelf:get-server-info'),
  fileShelfSaveItemToDisk: (id: string) => ipcRenderer.invoke('fileshelf:save-item-to-disk', id),
  fileShelfOpenItem: (id: string) => ipcRenderer.invoke('fileshelf:open-item', id),
  onFileShelfUpdated: (callback: (items: any[]) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('fileshelf:items-updated', subscription);
    return () => ipcRenderer.removeListener('fileshelf:items-updated', subscription);
  },
  onFileShelfItemReceived: (callback: (item: any) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('fileshelf:item-received-from-mobile', subscription);
    return () => ipcRenderer.removeListener('fileshelf:item-received-from-mobile', subscription);
  },
});

contextBridge.exposeInMainWorld('electron', {
  ipcRenderer: {
    invoke: (channel: string, ...args: any[]) => ipcRenderer.invoke(channel, ...args),
    on: (channel: string, listener: (...args: any[]) => void) => {
      const subscription = (_: any, ...args: any[]) => listener(...args);
      ipcRenderer.on(channel, subscription);
      return () => ipcRenderer.removeListener(channel, subscription);
    },
  },
});
