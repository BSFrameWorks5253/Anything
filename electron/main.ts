import {
  app,
  BrowserWindow,
  shell,
  ipcMain,
  dialog,
  Notification,
  Tray,
  Menu,
  nativeImage,
} from 'electron';
import path from 'path';
import fs from 'fs';
import https from 'https';
import http from 'http';
import { exec } from 'child_process';
import { autoUpdater } from 'electron-updater';

const isDev = process.env.NODE_ENV === 'development';

// Project root and distribution folders
const getProjectRoot = () => {
  return app.isPackaged ? app.getPath('userData') : path.resolve(__dirname, '..');
};

const getInboxDir = () => {
  const dir = path.join(getProjectRoot(), 'packages-inbox');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const getPublishedDir = () => {
  const dir = path.join(getProjectRoot(), 'published-apps');
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  return dir;
};

const getInstalledAppsDir = () => {
  const baseDir = path.join(app.getPath('userData'), 'installed-apps');
  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }
  return baseDir;
};

// Configure Auto-Updater
autoUpdater.autoDownload = true;
autoUpdater.autoInstallOnAppQuit = true;

// Set Windows AppUserModelId for native Action Center toast notifications
if (process.platform === 'win32') {
  app.setAppUserModelId('com.burhanuddin.anything');
}

function sendWindowsNotification(title: string, body: string, onClick?: () => void) {
  try {
    if (Notification.isSupported()) {
      const notif = new Notification({
        title,
        body,
        silent: false,
      });
      if (onClick) {
        notif.on('click', onClick);
      }
      notif.show();
    }
  } catch (e) {
    console.error('Notification error:', e);
  }
}

// ================= WINDOWS SYSTEM TRAY DAEMON =================
let tray: Tray | null = null;
let isQuitting = false;
let installedAppsForTray: Array<{ id: string; name: string; path?: string }> = [];

function buildTrayMenu(win: BrowserWindow) {
  const appMenuItems =
    installedAppsForTray.length > 0
      ? installedAppsForTray.map((item) => ({
          label: `▶ Launch ${item.name}`,
          click: () => {
            if (item.path && fs.existsSync(item.path)) {
              shell.openPath(item.path);
            } else {
              if (win.isMinimized()) win.restore();
              win.show();
              win.focus();
              win.webContents.send('notification:clicked', { appId: item.id });
            }
          },
        }))
      : [{ label: '(No installed apps yet)', enabled: false }];

  return Menu.buildFromTemplate([
    {
      label: '✨ Anything (Liquid Glass)',
      enabled: false,
    },
    { type: 'separator' },
    {
      label: 'Open Anything',
      click: () => {
        if (win.isMinimized()) win.restore();
        win.show();
        win.focus();
      },
    },
    {
      label: '🔄 Check for App Updates',
      click: () => {
        if (win.isMinimized()) win.restore();
        win.show();
        win.webContents.send('tray:check-updates');
      },
    },
    { type: 'separator' },
    {
      label: '⚡ Quick Launch Apps',
      submenu: appMenuItems,
    },
    { type: 'separator' },
    {
      label: 'Quit Anything',
      click: () => {
        isQuitting = true;
        app.quit();
      },
    },
  ]);
}

function createSystemTray(win: BrowserWindow) {
  try {
    const iconPath = path.join(__dirname, '../public/tray-icon.png');
    let trayImage = fs.existsSync(iconPath)
      ? nativeImage.createFromPath(iconPath)
      : nativeImage.createEmpty();

    tray = new Tray(trayImage);
    tray.setToolTip('Anything');
    tray.setContextMenu(buildTrayMenu(win));

    tray.on('click', () => {
      if (win.isVisible()) {
        win.hide();
      } else {
        if (win.isMinimized()) win.restore();
        win.show();
        win.focus();
      }
    });
  } catch (err) {
    console.error('Tray initialization error:', err);
  }
}

// ================= GITHUB RELEASES ENGINE =================
function parseGitHubRepo(input: string): { owner: string; repo: string } | null {
  if (!input) return null;
  let clean = input.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '');
  clean = clean.replace(/\/releases.*$/i, '').replace(/\/+$/, '');
  const parts = clean.split('/');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1] };
  }
  return null;
}

function compareVersions(remote: string, current: string): number {
  if (!remote || !current) return 0;
  const clean = (v: string) => v.replace(/^[vV]/, '').trim();
  const rParts = clean(remote).split(/[.-]/).map((p) => (isNaN(Number(p)) ? p : Number(p)));
  const cParts = clean(current).split(/[.-]/).map((p) => (isNaN(Number(p)) ? p : Number(p)));
  const maxLen = Math.max(rParts.length, cParts.length);
  for (let i = 0; i < maxLen; i++) {
    const r = rParts[i] ?? 0;
    const c = cParts[i] ?? 0;
    if (typeof r === 'number' && typeof c === 'number') {
      if (r > c) return 1;
      if (r < c) return -1;
    } else {
      const cmp = String(r).localeCompare(String(c));
      if (cmp !== 0) return cmp;
    }
  }
  return 0;
}

function pickWindowsAsset(assets: any[]): any {
  if (!Array.isArray(assets) || assets.length === 0) return null;
  const candidates = assets.filter((a: any) => {
    const name = String(a.name || '').toLowerCase();
    if (
      name.endsWith('.blockmap') ||
      name.endsWith('.yml') ||
      name.endsWith('.yaml') ||
      name.endsWith('.sha256') ||
      name.endsWith('.asc')
    )
      return false;
    return (
      name.endsWith('.exe') ||
      name.endsWith('.msix') ||
      name.endsWith('.appx') ||
      name.endsWith('.zip')
    );
  });

  if (candidates.length === 0) return null;

  candidates.sort((a: any, b: any) => {
    let scoreA = 0;
    let scoreB = 0;
    const nameA = String(a.name).toLowerCase();
    const nameB = String(b.name).toLowerCase();

    if (nameA.includes('win') || nameA.includes('windows')) scoreA += 10;
    if (nameB.includes('win') || nameB.includes('windows')) scoreB += 10;

    if (nameA.includes('x64') || nameA.includes('64-bit') || nameA.includes('x86_64')) scoreA += 6;
    if (nameB.includes('x64') || nameB.includes('64-bit') || nameB.includes('x86_64')) scoreB += 6;

    if (nameA.endsWith('.exe')) scoreA += 5;
    if (nameB.endsWith('.exe')) scoreB += 5;
    if (nameA.endsWith('.msix')) scoreA += 4;
    if (nameB.endsWith('.msix')) scoreB += 4;
    if (nameA.endsWith('.zip')) scoreA += 2;
    if (nameB.endsWith('.zip')) scoreB += 2;

    if (nameA.includes('setup') || nameA.includes('portable')) scoreA += 3;
    if (nameB.includes('setup') || nameB.includes('portable')) scoreB += 3;

    return scoreB - scoreA;
  });

  return candidates[0];
}

async function downloadAssetWithProgress(
  url: string,
  destPath: string,
  onProgress: (prog: { percent: number; transferredBytes: number; totalBytes: number; speedBytesPerSec: number }) => void
) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'CreativeHub-DesktopApp',
      'Accept': 'application/octet-stream',
    },
    redirect: 'follow',
  });

  if (!response.ok) {
    throw new Error(`Failed to download asset: HTTP ${response.status} ${response.statusText}`);
  }

  const totalBytes = Number(response.headers.get('content-length')) || 0;
  let transferredBytes = 0;
  let lastTime = Date.now();
  let lastTransferred = 0;

  const fileStream = fs.createWriteStream(destPath);
  if (!response.body) {
    throw new Error('Response body stream is empty');
  }

  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    fileStream.write(Buffer.from(value));
    transferredBytes += value.length;

    const now = Date.now();
    if (now - lastTime >= 200) {
      const speed = ((transferredBytes - lastTransferred) / (now - lastTime)) * 1000;
      lastTime = now;
      lastTransferred = transferredBytes;
      onProgress({
        percent: totalBytes > 0 ? Math.min(100, Math.round((transferredBytes / totalBytes) * 100)) : 50,
        transferredBytes,
        totalBytes,
        speedBytesPerSec: speed,
      });
    }
  }

  await new Promise<void>((resolve, reject) => {
    fileStream.end(() => resolve());
    fileStream.on('error', reject);
  });

  onProgress({
    percent: 100,
    transferredBytes,
    totalBytes: totalBytes || transferredBytes,
    speedBytesPerSec: 0,
  });
}

let mainWindow: BrowserWindow | null = null;
let splashWindow: BrowserWindow | null = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    title: 'Anything',
    width: 1280,
    height: 840,
    minWidth: 980,
    minHeight: 660,
    backgroundColor: '#030712',
    frame: false, // Seamless frameless window for pixel-perfect custom Windows 11 controls
    titleBarStyle: 'hidden',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
    show: false, // Hidden on startup: ONLY the loader box appears first!
  });

  const win = mainWindow;

  // Standalone Adobe Splash Window: Centered, frameless, 100% transparent desktop background
  splashWindow = new BrowserWindow({
    width: 740,
    height: 480,
    frame: false,
    transparent: true,
    backgroundColor: '#00000000',
    resizable: false,
    center: true,
    alwaysOnTop: true,
    show: true, // Only the loader box appears on the screen
    hasShadow: true,
    skipTaskbar: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  splashWindow.on('closed', () => {
    splashWindow = null;
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // Splash lifecycle: when the loader finishes, dismiss splash and reveal the main apps window
  ipcMain.handle('splash:done', () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.destroy();
      splashWindow = null;
    }
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
    return true;
  });

  // Fallback safety timeout (6 seconds) to guarantee the main window appears
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.destroy();
        splashWindow = null;
      }
      mainWindow.show();
      mainWindow.focus();
    }
  }, 6000);

  // Track window state changes for seamless Maximize / Restore icon updates
  win.on('maximize', () => {
    win.webContents.send('window:state-changed', { isMaximized: true });
  });

  win.on('unmaximize', () => {
    win.webContents.send('window:state-changed', { isMaximized: false });
  });

  // IPC Window Controls
  ipcMain.handle('window:minimize', () => {
    if (!win.isDestroyed()) win.minimize();
    return true;
  });

  ipcMain.handle('window:maximize', () => {
    if (!win.isDestroyed()) {
      if (win.isMaximized()) {
        win.unmaximize();
        return false;
      } else {
        win.maximize();
        return true;
      }
    }
    return false;
  });

  ipcMain.handle('window:close', () => {
    if (!win.isDestroyed()) win.close();
    return true;
  });

  ipcMain.handle('window:is-maximized', () => {
    return !win.isDestroyed() && win.isMaximized();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // ================= PUBLISHER INBOX & PUSH ENGINE =================
  ipcMain.handle('publisher:open-inbox', async () => {
    const inboxPath = getInboxDir();
    await shell.openPath(inboxPath);
    return inboxPath;
  });

  ipcMain.handle('publisher:get-paths', async () => {
    return {
      inboxDir: getInboxDir(),
      publishedDir: getPublishedDir(),
    };
  });

  ipcMain.handle('publisher:scan-inbox', async () => {
    try {
      const inboxDir = getInboxDir();
      const files = fs.readdirSync(inboxDir);
      const supportedExtensions = ['.exe', '.msix', '.zip', '.msi', '.bat', '.appx'];

      const fileList = files
        .filter((file) => {
          const ext = path.extname(file).toLowerCase();
          return supportedExtensions.includes(ext);
        })
        .map((fileName) => {
          const fullPath = path.join(inboxDir, fileName);
          const stats = fs.statSync(fullPath);
          const ext = path.extname(fileName).toLowerCase();

          const sizeFormatted =
            stats.size > 1024 * 1024 * 1024
              ? `${(stats.size / (1024 * 1024 * 1024)).toFixed(1)} GB`
              : stats.size > 1024 * 1024
              ? `${(stats.size / (1024 * 1024)).toFixed(1)} MB`
              : `${Math.round(stats.size / 1024)} KB`;

          return {
            fileName,
            fullPath,
            extension: ext,
            sizeBytes: stats.size,
            sizeFormatted,
            modifiedTime: stats.mtime.toLocaleDateString(),
          };
        });

      return { success: true, files: fileList, inboxDir };
    } catch (err: any) {
      return { success: false, error: err.message, files: [] };
    }
  });

  // Push Package: copies package to published directory and updates catalog.json
  ipcMain.handle('publisher:push-package', async (_, { stagedFile, appConfig }) => {
    try {
      const publishedDir = getPublishedDir();
      const appTargetDir = path.join(publishedDir, appConfig.id);
      if (!fs.existsSync(appTargetDir)) {
        fs.mkdirSync(appTargetDir, { recursive: true });
      }

      // Copy executable or package from inbox into published directory
      const destPath = path.join(appTargetDir, stagedFile.fileName);
      fs.copyFileSync(stagedFile.fullPath, destPath);

      // Read or initialize catalog.json
      const catalogFile = path.join(publishedDir, 'catalog.json');
      let catalog: any[] = [];
      if (fs.existsSync(catalogFile)) {
        try {
          catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf-8'));
        } catch (e) {}
      }

      const publishedAppEntry = {
        ...appConfig,
        packageFileName: stagedFile.fileName,
        packageSize: stagedFile.sizeFormatted,
        packageFormat: stagedFile.extension,
        localPackagePath: destPath,
        publishedAt: Date.now(),
      };

      // Upsert into catalog
      const existingIdx = catalog.findIndex((a) => a.id === appConfig.id);
      if (existingIdx >= 0) {
        catalog[existingIdx] = publishedAppEntry;
      } else {
        catalog.unshift(publishedAppEntry);
      }

      fs.writeFileSync(catalogFile, JSON.stringify(catalog, null, 2), 'utf-8');

      return {
        success: true,
        app: publishedAppEntry,
        catalog,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('publisher:load-catalog', async () => {
    try {
      const catalogFile = path.join(getPublishedDir(), 'catalog.json');
      if (fs.existsSync(catalogFile)) {
        const data = fs.readFileSync(catalogFile, 'utf-8');
        return { success: true, catalog: JSON.parse(data) };
      }
      return { success: true, catalog: [] };
    } catch (err: any) {
      return { success: false, error: err.message, catalog: [] };
    }
  });

  // ================= APP LIFECYCLE (INSTALL / RUN / UNINSTALL) =================
  ipcMain.handle('app:install-published-package', async (_, appData) => {
    try {
      const { id, packageFileName, localPackagePath, packageFormat, executableName } = appData;
      const appsDir = getInstalledAppsDir();
      const targetAppDir = path.join(appsDir, id);
      if (!fs.existsSync(targetAppDir)) {
        fs.mkdirSync(targetAppDir, { recursive: true });
      }

      // 1. MSIX Native Installation
      if (packageFormat === '.msix' || packageFormat === '.appx') {
        await new Promise<void>((resolve, reject) => {
          const cmd = `powershell -NoProfile -Command "Add-AppxPackage -Path '${localPackagePath}'"`;
          exec(cmd, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });
        return { success: true, installedPath: localPackagePath, format: 'msix' };
      }

      // 2. ZIP Archive Extraction
      if (packageFormat === '.zip') {
        win.webContents.send('catalog:download-progress', { appId: id, percent: 99, status: 'extracting' });
        await new Promise<void>((resolve, reject) => {
          const powershellCmd = `powershell -NoProfile -Command "Expand-Archive -Path '${localPackagePath}' -DestinationPath '${targetAppDir}' -Force"`;
          exec(powershellCmd, (error) => {
            if (error) reject(error);
            else resolve();
          });
        });

        // Locate executable inside extracted folder
        let resolvedExePath = path.join(targetAppDir, executableName || `${id}.exe`);
        if (!fs.existsSync(resolvedExePath)) {
          const files = fs.readdirSync(targetAppDir, { recursive: true });
          const exeFound = files.find((f: any) => String(f).toLowerCase().endsWith('.exe'));
          if (exeFound) resolvedExePath = path.join(targetAppDir, String(exeFound));
        }
        return { success: true, installedPath: resolvedExePath, format: 'zip' };
      }

      // 3. Standalone EXE / MSI
      const targetExe = path.join(targetAppDir, packageFileName);
      fs.copyFileSync(localPackagePath, targetExe);
      return { success: true, installedPath: targetExe, format: 'exe' };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // App Launcher
  ipcMain.handle('app:launch', async (_, pathOrUrl: string) => {
    try {
      if (!pathOrUrl) return { success: false, error: 'No path specified' };
      if (pathOrUrl.startsWith('http://') || pathOrUrl.startsWith('https://')) {
        await shell.openExternal(pathOrUrl);
        return { success: true };
      }
      if (!fs.existsSync(pathOrUrl)) {
        return { success: false, error: 'Executable not found on disk. Please fix the path.' };
      }
      const result = await shell.openPath(pathOrUrl);
      if (result) {
        return { success: false, error: result };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Fix Path Picker
  ipcMain.handle('app:fix-path', async (_, appName: string) => {
    const result = await dialog.showOpenDialog(win, {
      title: `Locate Executable for ${appName || 'Application'}`,
      properties: ['openFile'],
      filters: [
        { name: 'Executables & Applications', extensions: ['exe', 'bat', 'cmd', 'lnk', 'app', 'msix'] },
        { name: 'All Files', extensions: ['*'] },
      ],
    });
    if (result.canceled || result.filePaths.length === 0) {
      return null;
    }
    const chosenPath = result.filePaths[0];
    return {
      success: true,
      newPath: chosenPath,
      exists: fs.existsSync(chosenPath),
    };
  });

  // Verify Path Existence
  ipcMain.handle('app:verify-path', async (_, targetPath: string) => {
    if (!targetPath) return false;
    return fs.existsSync(targetPath);
  });

  // Uninstall Application from Disk
  ipcMain.handle('app:uninstall', async (_, appId: string) => {
    try {
      const appsDir = getInstalledAppsDir();
      const targetDir = path.join(appsDir, appId);
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // ================= GITHUB APP RELEASES HANDLERS =================
  ipcMain.handle('github:check-release', async (_, { repo, currentVersion }) => {
    try {
      const parsed = parseGitHubRepo(repo);
      if (!parsed) {
        return { success: false, error: 'Invalid GitHub repository format (use owner/repo)' };
      }
      const apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/releases/latest`;
      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'CreativeHub-DesktopApp',
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (res.status === 404) {
        return { success: false, error: `No releases found for ${parsed.owner}/${parsed.repo}` };
      }
      if (!res.ok) {
        return { success: false, error: `GitHub API error: ${res.statusText} (${res.status})` };
      }

      const data: any = await res.json();
      const bestAsset = pickWindowsAsset(data.assets || []);
      const remoteVersion = (data.tag_name || data.name || '').replace(/^[vV]/, '');
      const hasUpdate = currentVersion ? compareVersions(remoteVersion, currentVersion) > 0 : true;

      return {
        success: true,
        hasUpdate,
        repo: `${parsed.owner}/${parsed.repo}`,
        remoteVersion,
        rawTag: data.tag_name || data.name,
        releaseName: data.name || data.tag_name,
        releaseNotes: data.body || '',
        publishedAt: data.published_at ? new Date(data.published_at).toLocaleDateString() : '',
        asset: bestAsset
          ? {
              name: bestAsset.name,
              downloadUrl: bestAsset.browser_download_url,
              sizeBytes: bestAsset.size,
              sizeFormatted: (bestAsset.size / (1024 * 1024)).toFixed(1) + ' MB',
            }
          : null,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle('github:download-release-to-inbox', async (_, { assetUrl, assetName }) => {
    try {
      const inboxDir = getInboxDir();
      const destPath = path.join(inboxDir, assetName);

      await downloadAssetWithProgress(assetUrl, destPath, (prog) => {
        win.webContents.send('catalog:download-progress', {
          appId: 'inbox-download',
          ...prog,
          status: 'downloading',
        });
      });

      return { success: true, filePath: destPath, fileName: assetName };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle(
    'github:update-app',
    async (_, { appId, downloadUrl, assetName, newVersion, executableName }) => {
      try {
        const appsDir = getInstalledAppsDir();
        const targetAppDir = path.join(appsDir, appId);
        if (!fs.existsSync(targetAppDir)) {
          fs.mkdirSync(targetAppDir, { recursive: true });
        }

        const tempDownloadPath = path.join(targetAppDir, assetName);

        // Download with live progress feedback
        await downloadAssetWithProgress(downloadUrl, tempDownloadPath, (prog) => {
          win.webContents.send('catalog:download-progress', {
            appId,
            ...prog,
            status: 'downloading',
          });
        });

        const isZip = assetName.toLowerCase().endsWith('.zip');
        const isMsix =
          assetName.toLowerCase().endsWith('.msix') || assetName.toLowerCase().endsWith('.appx');

        let resolvedExePath = tempDownloadPath;

        if (isMsix) {
          win.webContents.send('catalog:download-progress', {
            appId,
            percent: 99,
            status: 'extracting',
          });
          await new Promise<void>((resolve, reject) => {
            const cmd = `powershell -NoProfile -Command "Add-AppxPackage -Path '${tempDownloadPath}'"`;
            exec(cmd, (error) => {
              if (error) reject(error);
              else resolve();
            });
          });
          resolvedExePath = tempDownloadPath;
        } else if (isZip) {
          win.webContents.send('catalog:download-progress', {
            appId,
            percent: 99,
            status: 'extracting',
          });
          await new Promise<void>((resolve, reject) => {
            const powershellCmd = `powershell -NoProfile -Command "Expand-Archive -Path '${tempDownloadPath}' -DestinationPath '${targetAppDir}' -Force"`;
            exec(powershellCmd, (error) => {
              if (error) reject(error);
              else resolve();
            });
          });

          // Clean up archive
          try {
            fs.unlinkSync(tempDownloadPath);
          } catch (e) {}

          // Locate executable inside extracted folder
          resolvedExePath = path.join(targetAppDir, executableName || `${appId}.exe`);
          if (!fs.existsSync(resolvedExePath)) {
            const files = fs.readdirSync(targetAppDir, { recursive: true });
            const exeFound = files.find((f: any) => String(f).toLowerCase().endsWith('.exe'));
            if (exeFound) resolvedExePath = path.join(targetAppDir, String(exeFound));
          }
        }

        // Update catalog.json if registered
        try {
          const catalogFile = path.join(getPublishedDir(), 'catalog.json');
          if (fs.existsSync(catalogFile)) {
            const catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf-8'));
            const idx = catalog.findIndex((a: any) => a.id === appId);
            if (idx >= 0) {
              catalog[idx].version = newVersion;
              fs.writeFileSync(catalogFile, JSON.stringify(catalog, null, 2), 'utf-8');
            }
          }
        } catch (e) {}

        return {
          success: true,
          installedPath: resolvedExePath,
          newVersion,
        };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
  );

  // ================= GITHUB RELEASE HISTORY & ROLLBACK =================
  ipcMain.handle('github:get-release-history', async (_, { repo }) => {
    try {
      const parsed = parseGitHubRepo(repo);
      if (!parsed) {
        return { success: false, error: 'Invalid GitHub repository format (use owner/repo)', releases: [] };
      }
      const apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/releases?per_page=25`;
      const res = await fetch(apiUrl, {
        headers: {
          'User-Agent': 'CreativeHub-DesktopApp',
          'Accept': 'application/vnd.github.v3+json',
        },
      });

      if (!res.ok) {
        return { success: false, error: `GitHub API error: ${res.statusText} (${res.status})`, releases: [] };
      }

      const releasesList: any = await res.json();
      if (!Array.isArray(releasesList)) {
        return { success: false, error: 'Invalid response from GitHub Releases API', releases: [] };
      }

      const formattedReleases = releasesList.map((rel: any) => {
        const bestAsset = pickWindowsAsset(rel.assets || []);
        const cleanTag = (rel.tag_name || rel.name || '').replace(/^[vV]/, '');
        return {
          id: rel.id,
          tag: cleanTag,
          rawTag: rel.tag_name || rel.name,
          name: rel.name || rel.tag_name,
          releaseNotes: rel.body || '',
          publishedAt: rel.published_at ? new Date(rel.published_at).toLocaleDateString() : '',
          isPrerelease: Boolean(rel.prerelease),
          asset: bestAsset
            ? {
                name: bestAsset.name,
                downloadUrl: bestAsset.browser_download_url,
                sizeBytes: bestAsset.size,
                sizeFormatted: (bestAsset.size / (1024 * 1024)).toFixed(1) + ' MB',
              }
            : null,
        };
      });

      return {
        success: true,
        repo: `${parsed.owner}/${parsed.repo}`,
        releases: formattedReleases,
      };
    } catch (err: any) {
      return { success: false, error: err.message, releases: [] };
    }
  });

  // Windows System Tray Installed Apps Sync
  ipcMain.handle('tray:sync-installed-apps', (_, appsList) => {
    installedAppsForTray = Array.isArray(appsList) ? appsList : [];
    if (tray && win && !win.isDestroyed()) {
      tray.setContextMenu(buildTrayMenu(win));
    }
    return { success: true };
  });

  // Auto-Updater Handlers
  ipcMain.handle('updater:check', async () => {
    if (isDev) return { status: 'dev-mode', currentVersion: app.getVersion() };
    try {
      const res = await autoUpdater.checkForUpdates();
      return { status: 'checking', updateInfo: res?.updateInfo };
    } catch (err: any) {
      return { status: 'error', error: err.message };
    }
  });

  ipcMain.handle('updater:install', () => {
    autoUpdater.quitAndInstall();
  });

  // Windows Native Toast Notification IPC
  ipcMain.handle('notification:show', (_, { title, body, appId }) => {
    sendWindowsNotification(title, body, () => {
      if (win) {
        if (win.isMinimized()) win.restore();
        win.focus();
        if (appId) {
          win.webContents.send('notification:clicked', { appId });
        }
      }
    });
    return { success: true };
  });

  // Auto-Updater status and notifications for Anything
  autoUpdater.on('update-available', (info) => {
    win.webContents.send('updater:status', { status: 'update-available', info });
    sendWindowsNotification(
      `⚡ Anything v${info.version} Available!`,
      `A new update is downloading in the background. Click to view.`,
      () => {
        if (win.isMinimized()) win.restore();
        win.focus();
      }
    );
  });

  autoUpdater.on('update-downloaded', (info) => {
    win.webContents.send('updater:status', { status: 'update-downloaded', info });
    sendWindowsNotification(
      `🎉 Anything v${info.version} Ready!`,
      `Update downloaded. Click to restart and apply changes now.`,
      () => {
        autoUpdater.quitAndInstall();
      }
    );
  });

  // Setup System Tray
  createSystemTray(win);

  // Minimize to System Tray on close instead of terminating
  win.on('close', (e) => {
    if (!isQuitting) {
      e.preventDefault();
      win.hide();
      sendWindowsNotification(
        'Anything is running in the background',
        'Anything is minimized to your system tray. Updates and app notifications will remain active.'
      );
    }
  });

  // Periodic 1-hour background check for app updates
  setInterval(() => {
    if (win && !win.isDestroyed()) {
      win.webContents.send('tray:check-updates');
    }
  }, 60 * 60 * 1000);

  if (isDev) {
    const devUrl = 'http://127.0.0.1:5173';
    // Load splash in standalone transparent splashWindow
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.loadURL(`${devUrl}?view=splash`).catch(() => {});
    }
    const loadDev = (retries = 8) => {
      win.loadURL(devUrl).catch(() => {
        if (retries > 0) setTimeout(() => loadDev(retries - 1), 250);
        else win.loadFile(path.join(__dirname, '../dist/index.html')).catch(() => {});
      });
    };
    loadDev();
  } else {
    // Production build loading
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.loadFile(path.join(__dirname, '../dist/index.html'), { query: { view: 'splash' } }).catch(() => {});
    }
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.on('before-quit', () => {
  isQuitting = true;
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
