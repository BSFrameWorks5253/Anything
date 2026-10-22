import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  launchApp: (pathOrUrl: string) => ipcRenderer.invoke('app:launch', pathOrUrl),
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

  // App Lifecycle: Uninstall, Path Fixing, Path Verification
  uninstallApp: (appId: string) => ipcRenderer.invoke('app:uninstall', appId),
  fixAppPath: (appName: string) => ipcRenderer.invoke('app:fix-path', appName),
  verifyAppPath: (targetPath: string) => ipcRenderer.invoke('app:verify-path', targetPath),
  onCatalogDownloadProgress: (callback: (data: any) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('catalog:download-progress', subscription);
    return () => ipcRenderer.removeListener('catalog:download-progress', subscription);
  },

  // GitHub App Releases Sync & Direct Updates
  checkGitHubRelease: (repo: string, currentVersion?: string) =>
    ipcRenderer.invoke('github:check-release', { repo, currentVersion }),
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

  // Native Windows Notifications
  showNotification: (data: { title: string; body: string; appId?: string }) =>
    ipcRenderer.invoke('notification:show', data),
  onNotificationClicked: (callback: (data: any) => void) => {
    const subscription = (_: any, data: any) => callback(data);
    ipcRenderer.on('notification:clicked', subscription);
    return () => ipcRenderer.removeListener('notification:clicked', subscription);
  },

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
});
