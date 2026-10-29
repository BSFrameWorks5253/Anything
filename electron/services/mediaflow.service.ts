import fs from 'fs';
import path from 'path';
import os from 'os';
import { spawn } from 'child_process';
import { dialog, shell, type BrowserWindow, ipcMain } from 'electron';

export interface BadgeSample {
  name: string;
  token: string;
  fullPath: string;
}

export interface MediaFlowBadgesResult {
  path: string;
  exists: boolean;
  count: number;
  sampleBadges: BadgeSample[];
  lastUpdated?: string;
  updatedBy?: string;
}

// ── Path Helpers ──────────────────────────────────────────────────────────

export function getEcosystemConfigPath(): string {
  const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  return path.join(appData, 'anything', 'ecosystem_shared_config.json');
}

export function getMediaFlowLoaderConfigPath(): string {
  const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  return path.join(appData, 'anything', 'loaders', 'mediaflow-studio.json');
}

// ── Shared Config Readers / Writers ───────────────────────────────────────

export function readEcosystemSharedConfig(): Record<string, any> {
  try {
    const configPath = getEcosystemConfigPath();
    if (fs.existsSync(configPath)) {
      return JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    }
  } catch (err) {
    console.warn('[MediaFlow Service] Error reading ecosystem config:', err);
  }
  return {};
}

export function writeEcosystemBadgesDir(dirPath: string): boolean {
  try {
    const configPath = getEcosystemConfigPath();
    const configDir = path.dirname(configPath);
    if (!fs.existsSync(configDir)) {
      fs.mkdirSync(configDir, { recursive: true });
    }

    const current = readEcosystemSharedConfig();
    const nowIso = new Date().toISOString();

    const updated = {
      ...current,
      mediaflow: {
        ...(current.mediaflow || {}),
        eventImagesDirPath: dirPath,
        lastUpdated: nowIso,
        updatedBy: 'Anything Hub',
      },
      sharedAssets: {
        ...(current.sharedAssets || {}),
        eventBadgesDir: dirPath,
      },
    };

    fs.writeFileSync(configPath, JSON.stringify(updated, null, 2), 'utf-8');

    // Also update loader config if present
    try {
      const loaderPath = getMediaFlowLoaderConfigPath();
      if (fs.existsSync(path.dirname(loaderPath))) {
        let loaderConfig: Record<string, any> = {};
        if (fs.existsSync(loaderPath)) {
          loaderConfig = JSON.parse(fs.readFileSync(loaderPath, 'utf-8'));
        }
        loaderConfig.eventImagesDirPath = dirPath;
        loaderConfig.lastUpdated = nowIso;
        fs.writeFileSync(loaderPath, JSON.stringify(loaderConfig, null, 2), 'utf-8');
      }
    } catch {}

    return true;
  } catch (err) {
    console.error('[MediaFlow Service] Failed to write shared config:', err);
    return false;
  }
}

// ── Badge Token Extraction ────────────────────────────────────────────────

export function extractBadgeToken(filename: string): string {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);

  // Split on delimiters: e.g. "0042_Ceremony_N" -> ["0042", "Ceremony", "N"]
  const parts = base.split(/[_-]/).filter(Boolean);
  if (parts.length > 1) {
    const last = parts[parts.length - 1];
    if (last.length <= 4) {
      return last.toUpperCase();
    }
  }

  // Short tokens like "Q", "VIP", "M1"
  if (base.length <= 5) {
    return base.toUpperCase();
  }

  // Fallback: initial 3-4 chars
  return base.slice(0, 4).toUpperCase();
}

// ── Directory Scanner ─────────────────────────────────────────────────────

const VALID_IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp']);

export function scanBadgesDirectory(dirPath: string): MediaFlowBadgesResult {
  if (!dirPath || typeof dirPath !== 'string') {
    return { path: '', exists: false, count: 0, sampleBadges: [] };
  }

  const normalized = path.normalize(dirPath.trim());
  if (!fs.existsSync(normalized)) {
    return { path: normalized, exists: false, count: 0, sampleBadges: [] };
  }

  try {
    const entries = fs.readdirSync(normalized, { withFileTypes: true });
    const imageFiles = entries
      .filter((e) => e.isFile() && VALID_IMAGE_EXTS.has(path.extname(e.name).toLowerCase()))
      .map((e) => e.name);

    const sampleBadges: BadgeSample[] = imageFiles.slice(0, 24).map((fileName) => ({
      name: fileName,
      token: extractBadgeToken(fileName),
      fullPath: path.join(normalized, fileName),
    }));

    return {
      path: normalized,
      exists: true,
      count: imageFiles.length,
      sampleBadges,
    };
  } catch (err) {
    console.warn('[MediaFlow Service] Error scanning badges directory:', err);
    return { path: normalized, exists: true, count: 0, sampleBadges: [] };
  }
}

// ── Executable Resolver ───────────────────────────────────────────────────

export function resolveMediaFlowExecutable(): string | null {
  const home = os.homedir();
  const localAppData = process.env.LOCALAPPDATA || path.join(home, 'AppData', 'Local');

  const candidates = [
    // 1. Direct workspace development / unpacked release
    path.join(home, 'OneDrive', 'Desktop', 'Anything Apps', 'MediaFlow-Studio', 'dist-release', 'win-unpacked', 'MediaFlow Studio.exe'),
    path.join(home, 'OneDrive', 'Desktop', 'Anything Apps', 'MediaFlow-Studio', 'release', 'win-unpacked', 'MediaFlow Studio.exe'),
    path.join(home, 'OneDrive', 'Desktop', 'Anything Apps', 'MediaFlow-Studio', 'releases', 'v6.0.0', 'Mediaflow_studio_6.0.0.exe'),
    path.join(home, 'OneDrive', 'Desktop', 'Anything Apps', 'MediaFlow-Studio', 'dist-release', 'Mediaflow_studio_6.0.0.exe'),
    // 2. Published apps inside Anything
    path.join(home, 'OneDrive', 'Desktop', 'Anything', 'Anything', 'published-apps', 'mediaflow-studio', 'Mediaflow_studio_6.0.0.exe'),
    path.join(home, 'OneDrive', 'Desktop', 'Anything', 'published-apps', 'mediaflow-studio', 'Mediaflow_studio_6.0.0.exe'),
    // 3. Local standard installation folders
    path.join(localAppData, 'Programs', 'Mediaflow Studio', 'Mediaflow Studio.exe'),
    path.join(localAppData, 'Programs', 'MediaFlow Studio', 'MediaFlow Studio.exe'),
    path.join(localAppData, 'Programs', 'MediaFlow-Studio', 'MediaFlow-Studio.exe'),
    'C:\\Program Files\\MediaFlow Studio\\MediaFlow Studio.exe',
  ];

  for (const cand of candidates) {
    if (fs.existsSync(cand)) {
      return cand;
    }
  }

  return null;
}

// ── Cross-App Remote Launch ───────────────────────────────────────────────

export function launchMediaFlowStudio(targetDir?: string): boolean {
  const dir = targetDir || readEcosystemSharedConfig()?.mediaflow?.eventImagesDirPath || '';
  const exePath = resolveMediaFlowExecutable();

  if (exePath && fs.existsSync(exePath)) {
    try {
      const args: string[] = ['--page=eventDistributor'];
      if (dir) {
        args.push(`--event-images-dir=${dir}`);
      }
      spawn(exePath, args, { detached: true, stdio: 'ignore' }).unref();
      return true;
    } catch (err) {
      console.warn('[MediaFlow Service] Direct spawn failed:', err);
    }
  }

  // Fallback: Custom URL protocol
  try {
    const protocolUrl = `mediaflow://event-distributor?eventImagesDir=${encodeURIComponent(dir)}`;
    shell.openExternal(protocolUrl).catch(() => {});
    return true;
  } catch {
    return false;
  }
}

// ── IPC Handlers Registration ─────────────────────────────────────────────

export interface MediaFlowIpcContext {
  getMainWindow: () => BrowserWindow | null;
  notify?: (title: string, body: string) => void;
}

export function registerMediaFlowIpc(ctx: MediaFlowIpcContext): void {
  // 1. Get Event Badges Directory & Status
  ipcMain.handle('mediaflow:get-event-badges-dir', async () => {
    const config = readEcosystemSharedConfig();
    const configuredPath =
      config?.mediaflow?.eventImagesDirPath ||
      config?.sharedAssets?.eventBadgesDir ||
      '';

    const result = scanBadgesDirectory(configuredPath);
    return {
      ...result,
      lastUpdated: config?.mediaflow?.lastUpdated,
      updatedBy: config?.mediaflow?.updatedBy,
    };
  });

  // 2. Set Event Badges Directory
  ipcMain.handle('mediaflow:set-event-badges-dir', async (_e, dirPath: string) => {
    if (!dirPath || typeof dirPath !== 'string') {
      return { success: false, error: 'Invalid directory path' };
    }

    const ok = writeEcosystemBadgesDir(dirPath);
    const result = scanBadgesDirectory(dirPath);

    const win = ctx.getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('mediaflow:badges-dir-updated', result);
    }

    if (ctx.notify && ok) {
      ctx.notify('MediaFlow Badges Synced', `Event badges folder linked: ${path.basename(dirPath)} (${result.count} badges)`);
    }

    return { success: ok, ...result };
  });

  // 3. Open Native Browse Directory Dialog
  ipcMain.handle('mediaflow:select-badges-dir', async () => {
    const win = ctx.getMainWindow();
    const res = await dialog.showOpenDialog(win || undefined as any, {
      title: 'Select Master Event Badges Folder (MediaFlow Studio)',
      properties: ['openDirectory', 'createDirectory'],
      buttonLabel: 'Select Badges Folder',
    });

    if (res.canceled || !res.filePaths || res.filePaths.length === 0) {
      return null;
    }

    const chosenPath = res.filePaths[0];
    writeEcosystemBadgesDir(chosenPath);
    return scanBadgesDirectory(chosenPath);
  });

  // 4. Remote Launch MediaFlow Studio with Deep Link
  ipcMain.handle('mediaflow:launch-studio', async (_e, imagesDir?: string) => {
    const launched = launchMediaFlowStudio(imagesDir);
    return launched;
  });

  // 5. Reveal Folder in Native Explorer
  ipcMain.handle('mediaflow:open-folder', async (_e, targetPath?: string) => {
    const dir = targetPath || readEcosystemSharedConfig()?.mediaflow?.eventImagesDirPath;
    if (dir && fs.existsSync(dir)) {
      await shell.openPath(dir);
      return true;
    }
    return false;
  });
}

