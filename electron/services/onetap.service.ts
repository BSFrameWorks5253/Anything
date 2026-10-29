import { app, BrowserWindow, dialog, nativeImage, shell, ipcMain } from 'electron';
import fs from 'fs';
import path from 'path';
import os from 'os';
import http from 'http';
import { spawn } from 'child_process';

export interface OneTapWatcherStatus {
  enabled: boolean;
  active: boolean;
  watchDir: string | null;
  outDir: string | null;
  lastConvertedDir: string | null;
}

export interface OneTapConvertResult {
  success: boolean;
  converted: number;
  failed: number;
  outputDir?: string;
}

export type NotifyFn = (
  title: string,
  body: string,
  onClick?: () => void,
  iconSource?: string,
  appName?: string
) => void;

let lastOneTapConvertedDir: string | null = null;
let oneTapWatcherInstance: fs.FSWatcher | null = null;
let oneTapCurrentWatchDir: string | null = null;
let oneTapCurrentOutDir: string | null = null;
const oneTapProcessingFiles = new Set<string>();
let isOneTapAutoConvertEnabled = true;

/**
 * Converts a PNG image to a high-quality JPEG buffer, compositing any
 * transparent or translucent pixels over a pure white (#FFFFFF) background.
 */
export function convertPngToJpgBuffer(pngFilePath: string, quality = 92): Buffer {
  const img = nativeImage.createFromPath(pngFilePath);
  if (img.isEmpty()) {
    throw new Error(`Failed to load PNG image: ${pngFilePath}`);
  }

  const size = img.getSize();
  const rawBitmap = img.toBitmap(); // 32-bit BGRA buffer
  const totalPixels = size.width * size.height;

  // Composite RGBA over pure white (255, 255, 255) for any transparent/translucent pixels
  for (let i = 0; i < totalPixels; i++) {
    const offset = i * 4;
    const a = rawBitmap[offset + 3];

    if (a < 255) {
      const alphaRatio = a / 255;
      const invRatio = 1 - alphaRatio;

      rawBitmap[offset] = Math.round(rawBitmap[offset] * alphaRatio + 255 * invRatio); // Blue
      rawBitmap[offset + 1] = Math.round(rawBitmap[offset + 1] * alphaRatio + 255 * invRatio); // Green
      rawBitmap[offset + 2] = Math.round(rawBitmap[offset + 2] * alphaRatio + 255 * invRatio); // Red
      rawBitmap[offset + 3] = 255; // Alpha
    }
  }

  const whiteBackedImg = nativeImage.createFromBitmap(rawBitmap, {
    width: size.width,
    height: size.height,
  });

  return whiteBackedImg.toJPEG(quality);
}

/**
 * Resolves the watch directory and output directory for One Tap screenshots.
 * Checks user overrides, One Tap settings file locator, direct settings, and system Screenshot folders.
 */
export function resolveOneTapSettingsWatchDir(): { watchDir: string; outDir: string } {
  let watchDir = '';
  let outDir = '';

  // 0. Check custom user override in Anything appData (userData/onetap_watcher_settings.json)
  try {
    const userCfg = path.join(app.getPath('userData'), 'onetap_watcher_settings.json');
    if (fs.existsSync(userCfg)) {
      const parsed = JSON.parse(fs.readFileSync(userCfg, 'utf-8'));
      if (parsed.watchDir && fs.existsSync(parsed.watchDir)) {
        watchDir = parsed.watchDir;
      }
      if (parsed.outDir) {
        outDir = parsed.outDir;
      }
    }
  } catch {}

  // 1. Try reading from One Tap settings locator (%APPDATA%\One Tap\settings_location.ini)
  if (!watchDir) {
    try {
      const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      const locatorFile = path.join(appData, 'One Tap', 'settings_location.ini');
      if (fs.existsSync(locatorFile)) {
        const targetDir = fs.readFileSync(locatorFile, 'utf-8').trim();
        const settingsJsonPath = path.join(targetDir, 'settings.json');
        if (fs.existsSync(settingsJsonPath)) {
          const parsed = JSON.parse(fs.readFileSync(settingsJsonPath, 'utf-8'));
          const watcherInput = (
            parsed.watcher_input_folder ||
            parsed.converter_input ||
            parsed.screenshot_folder ||
            ''
          )?.trim();
          if (watcherInput && fs.existsSync(watcherInput)) {
            watchDir = watcherInput;
          }
          const customJpeg = (parsed.converter_jpeg || '')?.trim();
          if (customJpeg) {
            outDir = customJpeg;
          }
        }
      }
    } catch (err) {
      console.warn('[Anything Daemon] Could not read One Tap settings:', err);
    }
  }

  // 2. Direct %APPDATA%\One Tap\settings.json fallback
  if (!watchDir) {
    try {
      const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      const directSettings = path.join(appData, 'One Tap', 'settings.json');
      if (fs.existsSync(directSettings)) {
        const parsed = JSON.parse(fs.readFileSync(directSettings, 'utf-8'));
        const watcherInput = (
          parsed.watcher_input_folder ||
          parsed.converter_input ||
          parsed.screenshot_folder ||
          ''
        )?.trim();
        if (watcherInput && fs.existsSync(watcherInput)) {
          watchDir = watcherInput;
        }
        const customJpeg = (parsed.converter_jpeg || '')?.trim();
        if (customJpeg) {
          outDir = customJpeg;
        }
      }
    } catch {}
  }

  // 3. Fallbacks: Standard Windows Screenshots folders
  if (!watchDir) {
    const home = os.homedir();
    const oneDriveScreenshots = path.join(home, 'OneDrive', 'Pictures', 'Screenshots');
    const localScreenshots = path.join(home, 'Pictures', 'Screenshots');

    if (fs.existsSync(oneDriveScreenshots)) {
      watchDir = oneDriveScreenshots;
    } else if (fs.existsSync(localScreenshots)) {
      watchDir = localScreenshots;
    }
  }

  if (watchDir && !outDir) {
    outDir = path.join(watchDir, 'Converted_JPEGs');
  }

  return { watchDir, outDir };
}

/**
 * Searches filesystem for a valid One Tap standalone executable.
 */
export function resolveOneTapExecutable(): string | null {
  const directCandidates = [
    'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything Apps\\One Tap\\release\\OneTap-V-26.10.30.exe',
    'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything Apps\\One Tap\\release\\OneTap-V-26.10.28.exe',
    'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything Apps\\One Tap\\release\\win-unpacked\\One Tap.exe',
    'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything Apps\\One Tap\\release\\OneTap-V-26.10.27.exe',
    'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything Apps\\One Tap\\release\\One Tap\\V-26.10.30\\OneTap-V-26.10.30.exe',
    'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything Apps\\One Tap\\release\\One Tap\\V-26.10.28\\OneTap-V-26.10.28.exe',
    'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything Apps\\One Tap\\release\\One Tap\\V-26.10.27\\OneTap-V-26.10.27.exe',
  ];

  for (const c of directCandidates) {
    if (fs.existsSync(c)) return c;
  }

  const relDir = 'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything Apps\\One Tap\\release';
  if (fs.existsSync(relDir)) {
    try {
      const files = fs.readdirSync(relDir);
      const exes = files
        .filter((f) => f.toLowerCase().endsWith('.exe') && !f.toLowerCase().includes('setup'))
        .map((f) => path.join(relDir, f));
      if (exes.length > 0) return exes[0];
    } catch {}
  }

  return null;
}

/**
 * Launches One Tap workstation or focuses parent window.
 */
export function launchOneTapApp(win?: BrowserWindow | null, notify?: NotifyFn): void {
  const exePath = resolveOneTapExecutable();
  if (exePath && fs.existsSync(exePath)) {
    shell.openPath(exePath);
    if (notify) {
      notify('One Tap Workstation', 'Launching One Tap Workstation...');
    }
  } else if (win) {
    if (win.isMinimized()) win.restore();
    win.show();
    win.focus();
    win.webContents.send('notification:clicked', { appId: 'app-one-tap' });
  }
}

/**
 * Converts user-selected files or prompts a file picker dialog.
 */
export async function handleOneTapConvertFiles(
  win?: BrowserWindow | null,
  filePaths?: string[],
  notify?: NotifyFn,
  onMenuRefresh?: () => void
): Promise<OneTapConvertResult> {
  try {
    let targetFiles = filePaths;

    if (!targetFiles || targetFiles.length === 0) {
      const openOptions: Electron.OpenDialogOptions = {
        title: 'One Tap: Select PNG Images to Convert to JPG',
        buttonLabel: 'Convert to JPG',
        filters: [
          { name: 'PNG Images (*.png)', extensions: ['png', 'PNG'] },
          { name: 'All Files (*.*)', extensions: ['*'] },
        ],
        properties: ['openFile', 'multiSelections'],
      };

      const result =
        win && !win.isDestroyed()
          ? await dialog.showOpenDialog(win, openOptions)
          : await dialog.showOpenDialog(openOptions);

      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return { success: false, converted: 0, failed: 0 };
      }

      targetFiles = result.filePaths;
    }

    const pngFiles = targetFiles.filter((f) => {
      const ext = path.extname(f).toLowerCase();
      return ext === '.png' && fs.existsSync(f);
    });

    if (pngFiles.length === 0) {
      if (notify) {
        notify('One Tap: No PNGs Found', 'None of the selected files were valid .png images.');
      }
      return { success: false, converted: 0, failed: 0 };
    }

    const sourceDir = path.dirname(pngFiles[0]);
    const outDir = path.join(sourceDir, 'Converted_JPEGs');

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    let converted = 0;
    let failed = 0;

    for (const file of pngFiles) {
      try {
        const stem = path.basename(file, path.extname(file));
        const dstPath = path.join(outDir, `${stem}.jpg`);
        const jpgBuf = convertPngToJpgBuffer(file, 92);
        fs.writeFileSync(dstPath, jpgBuf);
        converted++;
      } catch (err) {
        console.error('[One Tap Tray] Failed converting PNG:', file, err);
        failed++;
      }
    }

    lastOneTapConvertedDir = outDir;
    if (onMenuRefresh) onMenuRefresh();

    if (notify) {
      notify(
        'One Tap: PNG to JPG Complete ✨',
        `Converted ${converted} image${converted === 1 ? '' : 's'} to JPG in "${path.basename(outDir)}"${failed > 0 ? ` (${failed} failed)` : ''}. Click to open folder.`,
        () => {
          shell.openPath(outDir);
        }
      );
    }

    if (win && !win.isDestroyed()) {
      win.webContents.send('onetap:converted', {
        converted,
        failed,
        outputDir: outDir,
      });
    }

    return { success: true, converted, failed, outputDir: outDir };
  } catch (err: any) {
    console.error('[One Tap Tray] Conversion error:', err);
    if (notify) {
      notify('One Tap: Conversion Error', err?.message || 'An error occurred during conversion.');
    }
    return { success: false, converted: 0, failed: 1 };
  }
}

/**
 * Converts all PNG files inside a selected directory.
 */
export async function handleOneTapConvertFolder(
  win?: BrowserWindow | null,
  targetFolder?: string,
  notify?: NotifyFn,
  onMenuRefresh?: () => void
): Promise<OneTapConvertResult> {
  try {
    let folder = targetFolder;

    if (!folder) {
      const folderOptions: Electron.OpenDialogOptions = {
        title: 'One Tap: Select Folder Containing PNG Images',
        buttonLabel: 'Convert PNGs to JPG',
        properties: ['openDirectory'],
      };

      const result =
        win && !win.isDestroyed()
          ? await dialog.showOpenDialog(win, folderOptions)
          : await dialog.showOpenDialog(folderOptions);

      if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
        return { success: false, converted: 0, failed: 0 };
      }

      folder = result.filePaths[0];
    }

    if (!fs.existsSync(folder)) {
      if (notify) {
        notify('One Tap', `Selected folder does not exist: "${folder}"`);
      }
      return { success: false, converted: 0, failed: 0 };
    }

    const entries = fs.readdirSync(folder);
    const pngFiles = entries.filter((f) => path.extname(f).toLowerCase() === '.png');

    if (pngFiles.length === 0) {
      if (notify) {
        notify('One Tap: No PNGs Found', `No .png images were found in folder: "${path.basename(folder)}"`);
      }
      return { success: false, converted: 0, failed: 0 };
    }

    const outDir = path.join(folder, 'Converted_JPEGs');
    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    let converted = 0;
    let failed = 0;

    for (const file of pngFiles) {
      try {
        const fullSrc = path.join(folder, file);
        const stem = path.basename(file, path.extname(file));
        const dstPath = path.join(outDir, `${stem}.jpg`);
        const jpgBuf = convertPngToJpgBuffer(fullSrc, 92);
        fs.writeFileSync(dstPath, jpgBuf);
        converted++;
      } catch (err) {
        console.error('[One Tap Tray] Failed converting folder image:', file, err);
        failed++;
      }
    }

    lastOneTapConvertedDir = outDir;
    if (onMenuRefresh) onMenuRefresh();

    if (notify) {
      notify(
        'One Tap: Folder Converted ✨',
        `Converted ${converted} PNG${converted === 1 ? '' : 's'} into "${path.basename(folder)}/Converted_JPEGs"${failed > 0 ? ` (${failed} failed)` : ''}. Click to open.`,
        () => {
          shell.openPath(outDir);
        }
      );
    }

    if (win && !win.isDestroyed()) {
      win.webContents.send('onetap:converted', {
        converted,
        failed,
        outputDir: outDir,
      });
    }

    return { success: true, converted, failed, outputDir: outDir };
  } catch (err: any) {
    console.error('[One Tap Tray] Folder conversion error:', err);
    if (notify) {
      notify('One Tap: Conversion Error', err?.message || 'An error occurred during folder conversion.');
    }
    return { success: false, converted: 0, failed: 1 };
  }
}

async function processSingleAutoPng(
  fullSrc: string,
  outDir: string,
  filename: string,
  win?: BrowserWindow | null,
  notify?: NotifyFn,
  onMenuRefresh?: () => void
): Promise<void> {
  try {
    if (!fs.existsSync(fullSrc)) return;

    // Small delay for Snipping Tool / OS to finish writing file
    await new Promise((r) => setTimeout(r, 250));

    // Confirm file still exists and has content
    const stat = fs.statSync(fullSrc);
    if (stat.size === 0) {
      await new Promise((r) => setTimeout(r, 400));
    }

    const stem = path.basename(filename, path.extname(filename));
    const dstPath = path.join(outDir, `${stem}.jpg`);

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    const jpgBuf = convertPngToJpgBuffer(fullSrc, 92);
    fs.writeFileSync(dstPath, jpgBuf);

    lastOneTapConvertedDir = outDir;
    console.log(`[Anything Daemon] Auto-converted PNG: "${filename}" -> "${dstPath}"`);

    if (notify) {
      notify(
        'One Tap: Auto PNG Converted ✨',
        `Converted "${filename}" to JPG in Converted_JPEGs. Click to open.`,
        () => {
          shell.openPath(outDir);
        }
      );
    }

    if (onMenuRefresh) onMenuRefresh();

    if (win && !win.isDestroyed()) {
      win.webContents.send('onetap:converted', {
        converted: 1,
        failed: 0,
        outputDir: outDir,
        file: dstPath,
      });
    }
  } catch (err) {
    console.error('[Anything Daemon] Failed auto-converting PNG:', fullSrc, err);
  }
}

async function scanAndProcessExistingAutoPngs(
  watchDir: string,
  outDir: string,
  win?: BrowserWindow | null,
  notify?: NotifyFn,
  onMenuRefresh?: () => void
): Promise<void> {
  try {
    if (!fs.existsSync(watchDir)) return;
    const entries = await fs.promises.readdir(watchDir);
    for (const f of entries) {
      if (path.extname(f).toLowerCase() === '.png') {
        const fullSrc = path.join(watchDir, f);
        const stem = path.basename(f, path.extname(f));
        const dstPath = path.join(outDir, `${stem}.jpg`);

        if (!fs.existsSync(dstPath) && !oneTapProcessingFiles.has(fullSrc)) {
          oneTapProcessingFiles.add(fullSrc);
          processSingleAutoPng(fullSrc, outDir, f, win, notify, onMenuRefresh).finally(() => {
            oneTapProcessingFiles.delete(fullSrc);
          });
        }
      }
    }
  } catch (err) {
    console.error('[Anything Daemon] Error scanning existing PNGs:', err);
  }
}

/**
 * Starts the real-time background watcher on the screenshot directory.
 */
export function startOneTapBackgroundWatcher(
  win?: BrowserWindow | null,
  notify?: NotifyFn,
  onMenuRefresh?: () => void
): void {
  try {
    if (oneTapWatcherInstance) {
      try {
        oneTapWatcherInstance.close();
      } catch {}
      oneTapWatcherInstance = null;
    }

    if (!isOneTapAutoConvertEnabled) return;

    const { watchDir, outDir } = resolveOneTapSettingsWatchDir();
    if (!watchDir || !fs.existsSync(watchDir)) {
      console.log('[Anything Daemon] One Tap watch folder not found or not configured.');
      return;
    }

    oneTapCurrentWatchDir = watchDir;
    oneTapCurrentOutDir = outDir;

    if (!fs.existsSync(outDir)) {
      fs.mkdirSync(outDir, { recursive: true });
    }

    console.log(`[Anything Daemon] One Tap Auto-Converter active: "${watchDir}" -> "${outDir}"`);

    // Process any existing unconverted PNGs on launch
    scanAndProcessExistingAutoPngs(watchDir, outDir, win, notify, onMenuRefresh);

    oneTapWatcherInstance = fs.watch(watchDir, { persistent: true }, async (_eventType, filename) => {
      if (!filename || !isOneTapAutoConvertEnabled) return;

      const ext = path.extname(filename).toLowerCase();
      if (ext !== '.png') return;

      const fullSrc = path.join(watchDir, filename);
      if (oneTapProcessingFiles.has(fullSrc)) return;
      oneTapProcessingFiles.add(fullSrc);

      processSingleAutoPng(fullSrc, outDir, filename, win, notify, onMenuRefresh).finally(() => {
        setTimeout(() => {
          oneTapProcessingFiles.delete(fullSrc);
        }, 500);
      });
    });

    oneTapWatcherInstance.on('error', (err) => {
      console.warn('[Anything Daemon] One Tap Watcher error:', err);
    });
  } catch (err) {
    console.error('[Anything Daemon] Could not start One Tap watcher:', err);
  }
}

/**
 * Stops the real-time background watcher.
 */
export function stopOneTapBackgroundWatcher(): void {
  if (oneTapWatcherInstance) {
    try {
      oneTapWatcherInstance.close();
    } catch {}
    oneTapWatcherInstance = null;
  }
  oneTapCurrentWatchDir = null;
  oneTapCurrentOutDir = null;
}

export function isOneTapWatcherActive(): boolean {
  return Boolean(oneTapWatcherInstance);
}

export function getIsOneTapAutoConvertEnabled(): boolean {
  return isOneTapAutoConvertEnabled;
}

export function getLastOneTapConvertedDir(): string | null {
  return lastOneTapConvertedDir;
}

export function getOneTapWatcherStatus(): OneTapWatcherStatus {
  const { watchDir, outDir } = resolveOneTapSettingsWatchDir();
  return {
    enabled: isOneTapAutoConvertEnabled,
    active: Boolean(oneTapWatcherInstance),
    watchDir: oneTapCurrentWatchDir || watchDir || null,
    outDir: oneTapCurrentOutDir || outDir || null,
    lastConvertedDir: lastOneTapConvertedDir || null,
  };
}

/**
 * Toggles watcher on or off and broadcasts status to all windows.
 */
export function toggleOneTapWatcher(
  targetState?: boolean,
  win?: BrowserWindow | null,
  notify?: NotifyFn,
  onMenuRefresh?: () => void
): OneTapWatcherStatus {
  if (typeof targetState === 'boolean') {
    isOneTapAutoConvertEnabled = targetState;
  } else {
    isOneTapAutoConvertEnabled = !isOneTapAutoConvertEnabled;
  }

  if (isOneTapAutoConvertEnabled) {
    startOneTapBackgroundWatcher(win, notify, onMenuRefresh);
    if (notify) {
      notify('One Tap Auto-Converter', 'Auto-conversion of screenshots is now ACTIVE.');
    }
  } else {
    stopOneTapBackgroundWatcher();
    if (notify) {
      notify('One Tap Auto-Converter', 'Auto-conversion paused.');
    }
  }

  if (onMenuRefresh) onMenuRefresh();

  const statusPayload = getOneTapWatcherStatus();
  const allWindows = BrowserWindow.getAllWindows();
  for (const w of allWindows) {
    if (!w.isDestroyed()) {
      w.webContents.send('onetap:status', statusPayload);
    }
  }

  return statusPayload;
}

/**
 * Registers all One Tap IPC handlers.
 */

/**
 * Zero-lock local HTTP bridge client communicating with One Tap on port 49152.
 */
export function fetchOneTapHttp(endpoint: string, method = 'GET', postData?: any): Promise<any> {
  return new Promise((resolve) => {
    const req = http.request(
      {
        hostname: '127.0.0.1',
        port: 49152,
        path: endpoint,
        method,
        timeout: 800,
        headers: { 'Content-Type': 'application/json' },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(null);
          }
        });
      }
    );
    req.on('error', () => resolve(null));
    req.on('timeout', () => {
      req.destroy();
      resolve(null);
    });
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

export function registerOneTapIpc(options?: {
  getMainWindow?: () => BrowserWindow | null;
  notify?: NotifyFn;
  onMenuRefresh?: () => void;
}): void {
  const getWin = () => (options?.getMainWindow ? options.getMainWindow() : null);
  const notify = options?.notify;
  const onMenuRefresh = options?.onMenuRefresh;

  ipcMain.handle('onetap:convert-files', async (_e, files?: string[]) => {
    return handleOneTapConvertFiles(getWin(), files, notify, onMenuRefresh);
  });

  ipcMain.handle('onetap:convert-folder', async (_e, folder?: string) => {
    return handleOneTapConvertFolder(getWin(), folder, notify, onMenuRefresh);
  });

  // ── One Tap Live Tracker & Production Summary ─────────────────────────
  ipcMain.handle('onetap:get-tracker-summary', async () => {
    // 1. Try real-time HTTP bridge if One Tap is open
    const httpRes = await fetchOneTapHttp('/tracker-summary');
    if (httpRes && (httpRes.updatedAt || httpRes.activeSafar || httpRes.counts)) {
      return { ...httpRes, isOneTapRunning: true };
    }

    // 2. Fallback: Read atomic JSON snapshot from disk
    try {
      const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      const candidatePaths = [
        path.join(appData, 'One Tap', 'production_summary.json'),
      ];

      const locFile = path.join(appData, 'One Tap', 'settings_location.ini');
      if (fs.existsSync(locFile)) {
        try {
          const customDir = fs.readFileSync(locFile, 'utf-8').trim();
          if (customDir && fs.existsSync(customDir)) {
            candidatePaths.unshift(path.join(customDir, 'production_summary.json'));
          }
        } catch {}
      }

      for (const summaryFile of candidatePaths) {
        if (fs.existsSync(summaryFile)) {
          const fileData = JSON.parse(fs.readFileSync(summaryFile, 'utf-8'));
          return { ...fileData, isOneTapRunning: false };
        }
      }
    } catch (err) {
      console.warn('[Anything] Error reading One Tap production summary file:', err);
    }

    return { success: false, message: 'No active production data found' };
  });

  // ── One Tap Remote Cross-App Page Navigation ───────────────────────────
  ipcMain.handle('onetap:open-page', async (_e, pageKey: string = 'tracker') => {
    const httpRes = await fetchOneTapHttp('/open-page', 'POST', { page: pageKey });
    if (httpRes && httpRes.success) {
      return { success: true };
    }

    // Fallback: Launch executable with --page argument
    const oneTapExe = resolveOneTapExecutable();
    if (oneTapExe && fs.existsSync(oneTapExe)) {
      spawn(oneTapExe, [`--page=${pageKey}`], { detached: true, stdio: 'ignore' }).unref();
      return { success: true, launched: true };
    }
    return { success: false, error: 'One Tap executable not found' };
  });

  ipcMain.handle('onetap:launch', async () => {
    launchOneTapApp(getWin(), notify);
    return { success: true };
  });

  ipcMain.handle('onetap:get-watcher-status', async () => {
    return getOneTapWatcherStatus();
  });

  ipcMain.handle('onetap:toggle-watcher', async (_, targetState?: boolean) => {
    return toggleOneTapWatcher(targetState, getWin(), notify, onMenuRefresh);
  });

  ipcMain.handle('onetap:open-watch-folder', async () => {
    const { watchDir } = resolveOneTapSettingsWatchDir();
    const target = oneTapCurrentWatchDir || watchDir;
    if (target && fs.existsSync(target)) {
      await shell.openPath(target);
      return { success: true, path: target };
    }
    return { success: false, error: 'Watch folder does not exist or is not configured.' };
  });

  ipcMain.handle('onetap:open-output-folder', async () => {
    const { outDir } = resolveOneTapSettingsWatchDir();
    const target = oneTapCurrentOutDir || outDir || lastOneTapConvertedDir;
    if (target && fs.existsSync(target)) {
      await shell.openPath(target);
      return { success: true, path: target };
    }
    return { success: false, error: 'Output folder does not exist yet.' };
  });

  ipcMain.handle('onetap:set-watch-folder', async () => {
    const win = getWin();
    const result = await dialog.showOpenDialog(win || undefined as any, {
      title: 'Select Folder for One Tap to Watch & Auto-Convert PNGs',
      properties: ['openDirectory'],
      buttonLabel: 'Select Watch Folder',
    });

    if (result.canceled || !result.filePaths || result.filePaths.length === 0) {
      return { success: false, canceled: true };
    }

    const selectedDir = result.filePaths[0];
    const outDir = path.join(selectedDir, 'Converted_JPEGs');

    try {
      const settingsFile = path.join(app.getPath('userData'), 'onetap_watcher_settings.json');
      fs.writeFileSync(settingsFile, JSON.stringify({ watchDir: selectedDir, outDir }, null, 2), 'utf-8');
    } catch (e) {
      console.warn('Failed to persist custom watch folder:', e);
    }

    if (isOneTapAutoConvertEnabled) {
      startOneTapBackgroundWatcher(win, notify, onMenuRefresh);
    } else {
      oneTapCurrentWatchDir = selectedDir;
      oneTapCurrentOutDir = outDir;
    }

    if (onMenuRefresh) onMenuRefresh();

    const statusPayload = {
      enabled: isOneTapAutoConvertEnabled,
      active: Boolean(oneTapWatcherInstance),
      watchDir: selectedDir,
      outDir,
      lastConvertedDir: lastOneTapConvertedDir || null,
    };

    const allWindows = BrowserWindow.getAllWindows();
    for (const w of allWindows) {
      if (!w.isDestroyed()) {
        w.webContents.send('onetap:status', statusPayload);
      }
    }

    return { success: true, ...statusPayload };
  });

  // ── Final Titles: Get Assets ──────────────────────────────────────────
  ipcMain.handle('onetap:get-final-titles', async () => {
    // 1. Try real-time HTTP from One Tap
    const httpRes = await fetchOneTapHttp('/final-titles');
    if (httpRes && httpRes.success) {
      return { ...httpRes, isOneTapRunning: true };
    }

    // 2. Fallback: Scan folder directly from disk
    const folder = getOneTapTitlesFolderFallback();
    if (!fs.existsSync(folder)) {
      return { success: false, folderPath: folder, exists: false, totalCount: 0, files: [], isOneTapRunning: false };
    }

    try {
      const entries = fs.readdirSync(folder, { withFileTypes: true });
      const files: any[] = [];
      let totalSize = 0;
      let videos = 0;
      let images = 0;

      for (const ent of entries) {
        if (ent.name.startsWith('.') || ent.name.startsWith('$')) continue;
        const full = path.join(folder, ent.name);
        try {
          const stat = fs.statSync(full);
          if (stat.isDirectory()) continue;
          const ext = path.extname(ent.name).toLowerCase();
          const isVideo = ['.mp4', '.mov', '.avi', '.mkv'].includes(ext);
          const isImage = ['.jpg', '.jpeg', '.png'].includes(ext);
          if (isVideo) videos++;
          if (isImage) images++;
          totalSize += stat.size;

          files.push({
            name: ent.name,
            path: full,
            size: stat.size,
            sizeFormatted: `${(stat.size / (1024 * 1024)).toFixed(1)} MB`,
            mtime: stat.mtimeMs,
            mtimeFormatted: new Date(stat.mtimeMs).toLocaleDateString(),
            type: isVideo ? 'video' : isImage ? 'image' : 'other',
            extension: ext
          });
        } catch {}
      }

      files.sort((a, b) => b.mtime - a.mtime);
      return {
        success: true,
        folderPath: folder,
        exists: true,
        totalCount: files.length,
        stats: { videos, images, totalSizeFormatted: `${(totalSize / (1024 * 1024)).toFixed(1)} MB` },
        files,
        isOneTapRunning: false
      };
    } catch (err: any) {
      return { success: false, error: err.message, isOneTapRunning: false };
    }
  });

  // ── Final Titles: Select Folder ───────────────────────────────────────
  ipcMain.handle('onetap:select-final-titles-folder', async (event) => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const res = await dialog.showOpenDialog(win!, {
      title: 'Select One Tap Final Titles Folder',
      properties: ['openDirectory', 'createDirectory']
    });
    if (res.canceled || !res.filePaths[0]) return { success: false };

    const pickedFolder = res.filePaths[0];

    // Sync to One Tap via HTTP
    await fetchOneTapHttp('/set-final-titles-folder', 'POST', { folder: pickedFolder });

    // Also update One Tap settings.json on disk directly
    try {
      const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
      const locFile = path.join(appData, 'One Tap', 'settings_location.ini');
      let settingsDir = path.join(appData, 'One Tap');
      if (fs.existsSync(locFile)) {
        const custom = fs.readFileSync(locFile, 'utf-8').trim();
        if (custom && fs.existsSync(custom)) settingsDir = custom;
      }
      const settingsJson = path.join(settingsDir, 'settings.json');
      let currentSettings: any = {};
      if (fs.existsSync(settingsJson)) {
        try { currentSettings = JSON.parse(fs.readFileSync(settingsJson, 'utf-8')); } catch {}
      }
      currentSettings.titles_folder = pickedFolder;
      fs.writeFileSync(settingsJson, JSON.stringify(currentSettings, null, 2), 'utf-8');
    } catch {}

    return { success: true, folderPath: pickedFolder };
  });

  // ── Final Titles: Open Folder in Explorer ─────────────────────────────
  ipcMain.handle('onetap:open-final-titles-folder', async (_e, folderPath?: string) => {
    const target = folderPath || getOneTapTitlesFolderFallback();
    if (target && fs.existsSync(target)) {
      shell.openPath(target);
      return { success: true };
    }
    return { success: false };
  });

  // ── Final Titles: Reveal File in Explorer ──────────────────────────────
  ipcMain.handle('onetap:reveal-file', async (_e, filePath: string) => {
    if (filePath && fs.existsSync(filePath)) {
      shell.showItemInFolder(filePath);
      return { success: true };
    }
    return { success: false };
  });
}

// ── Resolve One Tap Settings Directory Fallback ─────────────────────────
export function getOneTapTitlesFolderFallback(): string {
  try {
    const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
    const locFile = path.join(appData, 'One Tap', 'settings_location.ini');
    let settingsDir = path.join(appData, 'One Tap');
    if (fs.existsSync(locFile)) {
      const custom = fs.readFileSync(locFile, 'utf-8').trim();
      if (custom && fs.existsSync(custom)) settingsDir = custom;
    }
    const settingsJson = path.join(settingsDir, 'settings.json');
    if (fs.existsSync(settingsJson)) {
      const parsed = JSON.parse(fs.readFileSync(settingsJson, 'utf-8'));
      if (parsed.titles_folder && fs.existsSync(parsed.titles_folder)) {
        return parsed.titles_folder;
      }
    }
  } catch {}

  const oneDriveDocs = path.join(process.env.USERPROFILE || '', 'OneDrive', 'Documents', 'Final Titles');
  if (fs.existsSync(oneDriveDocs)) return oneDriveDocs;
  return path.join(os.homedir(), 'Documents', 'Final Titles');
}

