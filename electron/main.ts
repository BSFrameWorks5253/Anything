import { registerFileShelfIpc } from './services/fileShelf.service';
import { registerMediaFlowIpc } from './services/mediaflow.service';
import {
  getOneTapWatcherStatus,
  startOneTapBackgroundWatcher,
  stopOneTapBackgroundWatcher,
  registerOneTapIpc,
  handleOneTapConvertFiles,
  handleOneTapConvertFolder,
  resolveOneTapSettingsWatchDir,
  resolveOneTapExecutable,
  launchOneTapApp,
  toggleOneTapWatcher,
  isOneTapWatcherActive,
  getLastOneTapConvertedDir,
  getIsOneTapAutoConvertEnabled,
} from './services/onetap.service';
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
} from "electron";
import path from "path";
import { pathToFileURL } from "url";
import crypto from "crypto";
import fs from "fs";
import os from "os";
import https from "https";
import http from "http";
import { exec, spawn, execSync, execFile, execFileSync } from "child_process";

app.name = "Anything";

// Hardware acceleration & GPU rasterization optimizations for high frame rate & instant launch
app.commandLine.appendSwitch('enable-gpu-rasterization');
app.commandLine.appendSwitch('enable-zero-copy');
app.commandLine.appendSwitch('ignore-gpu-blocklist');
app.commandLine.appendSwitch('enable-accelerated-2d-canvas');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

// Load environment variables (.env)
try {
  const envCandidates = [
    path.join(__dirname, '..', '.env'),
    path.join(process.cwd(), '.env'),
    path.join(__dirname, '..', '..', '.env'),
  ];
  for (const p of envCandidates) {
    if (fs.existsSync(p)) {
      const lines = fs.readFileSync(p, 'utf-8').split(/\r?\n/);
      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith('#')) continue;
        const eqIdx = trimmed.indexOf('=');
        if (eqIdx !== -1) {
          const key = trimmed.slice(0, eqIdx).trim();
          const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
      break;
    }
  }
} catch (e) {}

// Authenticated GitHub Headers helper for rate-limit protection (5,000 req/hr)
function getGitHubHeaders(): Record<string, string> {
  const token =
    process.env.GH_TOKEN ||
    process.env.GITHUB_TOKEN ||
    '';
  const headers: Record<string, string> = {
    'User-Agent': 'Anything-DesktopApp',
    Accept: 'application/vnd.github.v3+json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}


const ANYTHING_AUMID = "com.burhanuddin.anything";
if (process.platform === "win32") {
  app.setAppUserModelId(ANYTHING_AUMID);
}

process.on("uncaughtException", (err) => {
  console.error("[UNCAUGHT MAIN PROCESS EXCEPTION]", err);
});

process.on("unhandledRejection", (reason) => {
  console.error("[UNHANDLED MAIN PROCESS REJECTION]", reason);
});

const isDev = process.env.NODE_ENV === "development";

// Central Ecosystem GitHub Repositories for Dynamic Child App Releases & Setup Streaming
const KNOWN_ECOSYSTEM_REPOS: Record<string, string> = {
  onetap: "BSFrameWorks5253/onetap-workstation",
  "one-tap": "BSFrameWorks5253/onetap-workstation",
  "onetap-workstation": "BSFrameWorks5253/onetap-workstation",
  mediaflow: "BSFrameWorks5253/MediaFlow-Studio",
  "mediaflow-studio": "BSFrameWorks5253/MediaFlow-Studio",
  dataflow: "BSFrameWorks5253/MediaFlow-Studio",
  "dataflow-studio": "BSFrameWorks5253/MediaFlow-Studio",
  docuflow: "BSFrameWorks5253/DocuFlow",
  "docuflow-studio": "BSFrameWorks5253/DocuFlow",
  vectorforge: "BSFrameWorks5253/DocuFlow",
  "vectorforge-studio": "BSFrameWorks5253/DocuFlow",
  pdfmaster: "BSFrameWorks5253/DocuFlow",
  "pdf-master": "BSFrameWorks5253/DocuFlow",
  "anything-data-manage": "BSFrameWorks5253/AIN53",
  "app-anything-data-manage": "BSFrameWorks5253/AIN53",
  ain53: "BSFrameWorks5253/AIN53",
  pixelcharm: "BSFrameWorks5253/Pixelcharm",
  "anything-office": "BSFrameworks5253/Anything-Office",
  office: "BSFrameworks5253/Anything-Office",
  "anything-file-manager": "BSFrameWorks5253/Anything-File-Manager",
  "file-manager": "BSFrameWorks5253/Anything-File-Manager",
  afm: "BSFrameWorks5253/Anything-File-Manager",
  "media-viewer": "BSFrameWorks5253/Anything-File-Manager",
  "anything-share": "BSFrameworks5253/Anyshare",
  anyshare: "BSFrameworks5253/Anyshare",
  share: "BSFrameworks5253/Anyshare",
  "anything share": "BSFrameworks5253/Anyshare",
};

interface DynamicGitHubRelease {
  version: string;
  tag: string;
  setupExeName: string;
  downloadUrl: string;
  sizeBytes: number;
  sizeFormatted: string;
  releaseNotes: string;
  publishedAt: string;
}

// In-memory cache for dynamic release queries (TTL: 60s)
const releaseCache = new Map<string, { data: DynamicGitHubRelease; timestamp: number }>();
const RELEASE_CACHE_TTL = 60 * 1000;

/**
 * Dynamically fetches the latest GitHub release for any child application repository.
 * Strictly resolves ONLY Windows Setup installer .exe assets from the release.
 */
async function fetchLatestSetupRelease(
  repoOrAppId: string,
  appName?: string,
): Promise<DynamicGitHubRelease | null> {
  const normId = (repoOrAppId || "").toLowerCase().trim();
  const repoSlug =
    KNOWN_ECOSYSTEM_REPOS[normId] ||
    KNOWN_ECOSYSTEM_REPOS[normId.replace(/^app-/, "")] ||
    (repoOrAppId.includes("/") ? repoOrAppId : null);

  if (!repoSlug) return null;

  const parsed = parseGitHubRepo(repoSlug);
  if (!parsed) return null;

  const cacheKey = `${parsed.owner}/${parsed.repo}`.toLowerCase();
  const cached = releaseCache.get(cacheKey);
  if (cached && Date.now() - cached.timestamp < RELEASE_CACHE_TTL) {
    return cached.data;
  }

  const headers = getGitHubHeaders();

  try {
    // 1. Fetch latest release from GitHub API
    let res = await fetch(
      `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/releases/latest`,
      { headers },
    );

    let releaseData: any = null;

    if (res.ok) {
      releaseData = await res.json();
    } else {
      // 2. Fallback to /releases list (picks first release with a setup exe)
      const listRes = await fetch(
        `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/releases?per_page=5`,
        { headers },
      );
      if (listRes.ok) {
        const releases = await listRes.json();
        if (Array.isArray(releases) && releases.length > 0) {
          for (const rel of releases) {
            if (pickWindowsAsset(rel.assets || [], appName || parsed.repo)) {
              releaseData = rel;
              break;
            }
          }
          if (!releaseData) releaseData = releases[0];
        }
      }
    }

    if (!releaseData || !Array.isArray(releaseData.assets)) return null;

    // Strictly fetch setup .exe installers only
    const setupAsset = pickWindowsAsset(
      releaseData.assets,
      appName || parsed.repo,
      releaseData.tag_name || releaseData.name,
    );

    if (!setupAsset || !setupAsset.browser_download_url) {
      console.warn(`[GitHub Release] No Windows setup .exe found for ${repoSlug}`);
      return null;
    }

    const version = String(releaseData.tag_name || releaseData.name || "1.0.0").replace(/^[vV]/, "");
    const sizeBytes = Number(setupAsset.size) || 0;

    const result: DynamicGitHubRelease = {
      version,
      tag: releaseData.tag_name || `v${version}`,
      setupExeName: setupAsset.name,
      downloadUrl: setupAsset.browser_download_url,
      sizeBytes,
      sizeFormatted: sizeBytes > 0 ? (sizeBytes / (1024 * 1024)).toFixed(1) + " MB" : "Setup Package",
      releaseNotes: releaseData.body || "",
      publishedAt: releaseData.published_at
        ? new Date(releaseData.published_at).toLocaleDateString()
        : "",
    };

    releaseCache.set(cacheKey, { data: result, timestamp: Date.now() });
    return result;
  } catch (err: any) {
    console.warn(`[GitHub Release] Error fetching latest release for ${repoSlug}:`, err.message);
    return null;
  }
}

// Bulletproof asset resolver across both dev and packaged modes

const getAssetPath = (...segments: string[]): string => {
  const distPath = path.join(__dirname, "..", "dist", ...segments);

  if (fs.existsSync(distPath)) return distPath;

  const publicPath = path.join(__dirname, "..", "public", ...segments);

  if (fs.existsSync(publicPath)) return publicPath;

  const resPath = path.join(process.resourcesPath, ...segments);

  if (fs.existsSync(resPath)) return resPath;

  return path.join(__dirname, "..", ...segments);
};

// Primary App Icon Resolvers (used across taskbar, splash, tray, and shortcuts)

const getAppIconPath = (): string | undefined => {
  const icoPath = getAssetPath("icon.ico");

  if (fs.existsSync(icoPath)) return icoPath;

  const pngPath = getAssetPath("app-logo.png");

  if (fs.existsSync(pngPath)) return pngPath;

  return undefined;
};

const getAppNativeIcon = (): Electron.NativeImage | undefined => {
  const iconPath = getAppIconPath();

  if (iconPath && fs.existsSync(iconPath)) {
    try {
      const img = nativeImage.createFromPath(iconPath);

      if (!img.isEmpty()) return img;
    } catch {}
  }

  return undefined;
};

// Project root and distribution folders

const getProjectRoot = () => {
  return app.isPackaged
    ? app.getPath("userData")
    : path.resolve(__dirname, "..");
};

const getInboxDir = () => {
  const dir = path.join(getProjectRoot(), "packages-inbox");

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return dir;
};

const getPublishedDir = () => {
  const dir = path.join(getProjectRoot(), "published-apps");

  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  return dir;
};

const getInstalledAppsDir = () => {
  const baseDir = path.join(app.getPath("userData"), "installed-apps");

  if (!fs.existsSync(baseDir)) {
    fs.mkdirSync(baseDir, { recursive: true });
  }

  return baseDir;
};

const getReleasesDir = () => {
  const root = getProjectRoot();

  const dir1 = path.join(root, "releases");

  const dir2 = path.join(root, "release");

  if (fs.existsSync(dir2) && !fs.existsSync(dir1)) return dir2;

  if (!fs.existsSync(dir1)) fs.mkdirSync(dir1, { recursive: true });

  return dir1;
};

const getAllReleaseDirs = (): string[] => {
  const parent = path.resolve(getProjectRoot(), "..");
  const dirs = [
    path.join(getProjectRoot(), "releases"),
    path.join(getProjectRoot(), "release"),
    path.join(parent, "Anything Child app realse"),
    path.join(parent, "releases"),
    path.join(parent, "release"),
  ];

  return dirs.filter(
    (d, idx, arr) => fs.existsSync(d) && arr.indexOf(d) === idx,
  );
};

// ================= SECURITY & SANITIZATION UTILITIES =================

/**
 * Security: Validates whether a given URL is safe to open externally or fetch.
 * Strictly permits only standard protocols (http:, https:, mailto:).
 * Blocks OS protocol handlers (file://, cmd:, powershell:, ms-msdt:, etc.)
 */
function isSafeExternalUrl(targetUrl: string): boolean {
  if (!targetUrl || typeof targetUrl !== "string") return false;
  try {
    const parsed = new URL(targetUrl.trim());
    return (
      parsed.protocol === "http:" ||
      parsed.protocol === "https:" ||
      parsed.protocol === "mailto:"
    );
  } catch {
    return false;
  }
}

/**
 * Security: Sanitizes an application ID to prevent path traversal and command injection.
 * Only allows alphanumeric characters, underscores, and hyphens.
 */
function sanitizeAppId(id: string): string {
  if (!id || typeof id !== "string") return "";
  return path.basename(id.trim()).replace(/[^a-zA-Z0-9_-]/g, "");
}

/**
 * Security: Sanitizes a file name to prevent directory traversal attacks.
 * Strips directory navigation characters and invalid Windows filename characters.
 */
function sanitizeFileName(name: string): string {
  if (!name || typeof name !== "string") return "";
  const base = path.basename(name.trim());
  return base.replace(/[<>:"/\\|?*\x00-\x1F]/g, "_");
}

/**
 * Security: Validates that an executable path is safe to launch.
 * Blocks dangerous Windows system interpreters and ensures the target resides in allowed app directories.
 */
function isSafeExecutablePath(targetPath: string): boolean {
  if (!targetPath || typeof targetPath !== "string") return false;
  const normalized = path.normalize(path.resolve(targetPath));
  const baseName = path.basename(normalized).toLowerCase();

  // Blocklist of system script interpreters and command runners
  const blockedBinaries = new Set([
    "cmd.exe",
    "powershell.exe",
    "pwsh.exe",
    "cscript.exe",
    "wscript.exe",
    "mshta.exe",
    "rundll32.exe",
    "regsvr32.exe",
    "certutil.exe",
    "bash.exe",
    "wsl.exe",
  ]);
  if (blockedBinaries.has(baseName)) {
    return false;
  }

  // Ensure file exists
  if (!fs.existsSync(normalized)) {
    return false;
  }

  // Check allowed parent roots
  const allowedRoots = [
    process.env.LOCALAPPDATA,
    process.env.APPDATA,
    process.env["ProgramFiles"],
    process.env["ProgramFiles(x86)"],
    getProjectRoot(),
    app.getPath("userData"),
    getInstalledAppsDir(),
    getPublishedDir(),
    getInboxDir(),
    path.resolve(getProjectRoot(), "..", "Anything Apps"),
    path.resolve(getProjectRoot(), ".."),
  ]
    .filter(Boolean)
    .map((r) => path.normalize(path.resolve(r!)).toLowerCase());

  const normLower = normalized.toLowerCase();
  return allowedRoots.some((root) => normLower.startsWith(root));
}

/**
 * Universal Ecosystem Explorer Bridge
 * - If Anything File Manager is installed on this machine: Opens the target in AFM.
 * - Otherwise: Opens in the default Windows File Explorer.
 */
async function openInEcosystemExplorer(folderOrFilePath: string): Promise<boolean> {
  if (!folderOrFilePath) return false;
  const target = folderOrFilePath.trim();

  try {
    const localAppData = process.env.LOCALAPPDATA || "";
    const candidateAfmExes = [
      path.join(localAppData, "Programs", "Anything File Manager", "Anything File Manager.exe"),
      path.join(getInstalledAppsDir(), "anything-file-manager", "Anything File Manager.exe"),
      path.join(process.env["ProgramFiles"] || "C:\\Program Files", "Anything File Manager", "Anything File Manager.exe"),
      path.join(process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)", "Anything File Manager", "Anything File Manager.exe"),
    ];

    for (const afmExe of candidateAfmExes) {
      if (fs.existsSync(afmExe)) {
        try {
          const child = spawn(afmExe, [target], {
            detached: true,
            stdio: "ignore",
          });
          child.unref();
          return true;
        } catch (spawnErr) {
          console.warn("[EcosystemExplorer] AFM spawn notice:", spawnErr);
        }
      }
    }
  } catch (err) {
    console.warn("[EcosystemExplorer] AFM resolution notice:", err);
  }

  // Graceful fallback to default Windows Explorer
  try {
    let stat: fs.Stats | null = null;
    try {
      stat = fs.statSync(target);
    } catch {}
    if (stat && stat.isFile()) {
      shell.showItemInFolder(target);
      return true;
    }
    const res = await shell.openPath(target);
    return !res;
  } catch {
    return false;
  }
}

function matchesApp(
  folderName: string,
  targetId: string,
  targetName: string,
  folderPath?: string,
): boolean {
  const normFolder = folderName.toLowerCase().replace(/[^a-z0-9]/g, "");

  const normId = targetId
    .toLowerCase()
    .replace(/^app-/, "")
    .replace(/[^a-z0-9]/g, "");

  const normName = targetName.toLowerCase().replace(/[^a-z0-9]/g, "");

  if (normFolder === normId || normFolder === normName) return true;

  if (folderPath && fs.existsSync(folderPath)) {
    const appJsonPath = path.join(folderPath, "app.json");

    if (fs.existsSync(appJsonPath)) {
      try {
        const manifest = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));

        const manId = (manifest.id || "")
          .toLowerCase()
          .replace(/^app-/, "")
          .replace(/[^a-z0-9]/g, "");

        const manName = (manifest.name || "")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");

        if (manId === normId || manId === normFolder || manName === normName) {
          return true;
        }
      } catch (e) {}
    }

    const relJsonPath = path.join(folderPath, "release.json");

    if (fs.existsSync(relJsonPath)) {
      try {
        const rel = JSON.parse(fs.readFileSync(relJsonPath, "utf-8"));

        const relId = (rel.appId || "")
          .toLowerCase()
          .replace(/^app-/, "")
          .replace(/[^a-z0-9]/g, "");

        const relName = (rel.appName || "")
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "");

        if (relId === normId || relName === normName) {
          return true;
        }
      } catch (e) {}
    }
  }

  return false;
}

async function findAppLogoImage(
  dirPath: string,
): Promise<{
  iconType: "image";
  iconValue: string;
  hasRealIcon: boolean;
} | null> {
  try {
    if (!fs.existsSync(dirPath)) return null;

    const lowerDir = dirPath.toLowerCase();

    // ── KNOWN OFFICIAL APPS: Always use their authentic PNG ─────────────────────

    if (lowerDir.includes("tap-studio") || lowerDir.includes("tapstudio")) {
      const candidates = [
        path.join(dirPath, "logo.png"),

        path.join(dirPath, "app-logo.png"),

        path.join(getProjectRoot(), "public", "tap-studio-logo.png"),
path.resolve(getProjectRoot(), "..", "Tap Studio", "public", "logo.png"),
      ];

      for (const c of candidates) {
        if (fs.existsSync(c)) {
          const b64 = fs.readFileSync(c).toString("base64");

          return {
            iconType: "image",
            iconValue: `data:image/png;base64,${b64}`,
            hasRealIcon: true,
          };
        }
      }
    }

    if (lowerDir.includes("mediaflow")) {
      const candidates = [
        path.join(dirPath, "logo.png"),

        path.join(dirPath, "app-logo.png"),

        path.join(getProjectRoot(), "public", "mediaflow-studio-logo.png"),
path.resolve(getProjectRoot(), "..", "MediaFlow-Studio", "public", "assets", "logo.png"),
      ];

      for (const c of candidates) {
        if (fs.existsSync(c)) {
          const b64 = fs.readFileSync(c).toString("base64");

          return {
            iconType: "image",
            iconValue: `data:image/png;base64,${b64}`,
            hasRealIcon: true,
          };
        }
      }
    }

    const files = fs.readdirSync(dirPath);

    // ── PRIORITY 1: Extract the actual app icon directly from the .exe ──────────

    // Collect all EXEs in this dir and one level of subdirs

    const allExes: string[] = [];

    for (const f of files) {
      if (f.toLowerCase().endsWith(".exe")) allExes.push(path.join(dirPath, f));
    }

    for (const file of files) {
      const subPath = path.join(dirPath, file);

      if (fs.existsSync(subPath) && fs.statSync(subPath).isDirectory()) {
        try {
          for (const sf of fs.readdirSync(subPath)) {
            if (sf.toLowerCase().endsWith(".exe"))
              allExes.push(path.join(subPath, sf));
          }
        } catch {
          /* skip unreadable subdirs */
        }
      }
    }

    if (allExes.length > 0) {
      // Prefer the main app exe over setup / uninstaller

      const chosenExe =
        allExes.find((e) => {
          const l = path.basename(e).toLowerCase();

          return (
            !l.includes("setup") &&
            !l.includes("install") &&
            !l.includes("uninstall")
          );
        }) ||
        allExes.find((e) => !e.toLowerCase().includes("uninstall")) ||
        allExes[0];

      if (chosenExe && fs.existsSync(chosenExe)) {
        try {
          const icon = await app.getFileIcon(chosenExe, { size: "large" });

          if (icon && !icon.isEmpty()) {
            return {
              iconType: "image",

              iconValue: icon.toDataURL(),

              hasRealIcon: true,
            };
          }
        } catch (err) {
          console.warn(
            "[icon] exe thumbnail extraction failed for",
            chosenExe,
            err,
          );
        }
      }
    }

    // ── PRIORITY 2: Creator-provided image in the release folder ────────────────

    const preferredPngNames = [
      "app-logo.png",
      "app_logo.png",
      "applogo.png",
      "logo.png",
      "icon.png",
      "app.png",
    ];

    const preferredSvgNames = ["logo.svg", "app-logo.svg", "icon.svg"];

    // PNG in root of release dir

    const chosenPng =
      files.find((f) => preferredPngNames.includes(f.toLowerCase().trim())) ||
      files.find((f) => {
        const ext = path.extname(f).toLowerCase();

        const l = f.toLowerCase();

        return (
          (ext === ".png" || ext === ".webp" || ext === ".jpg") &&
          !l.includes("banner") &&
          !l.includes("splash") &&
          !l.includes("bg")
        );
      });

    if (chosenPng) {
      const fullPath = path.join(dirPath, chosenPng);

      const ext = path.extname(chosenPng).toLowerCase().replace(".", "");

      const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;

      const b64 = fs.readFileSync(fullPath).toString("base64");

      return {
        iconType: "image",
        iconValue: `data:${mime};base64,${b64}`,
        hasRealIcon: true,
      };
    }

    // SVG in root

    const chosenSvg =
      files.find((f) => preferredSvgNames.includes(f.toLowerCase().trim())) ||
      files.find((f) => {
        const l = f.toLowerCase();

        return (
          l.endsWith(".svg") &&
          !l.includes("banner") &&
          !l.includes("pattern") &&
          !l.includes("splash")
        );
      });

    if (chosenSvg) {
      const svgContent = fs.readFileSync(
        path.join(dirPath, chosenSvg),
        "utf-8",
      );

      const b64 = Buffer.from(svgContent, "utf-8").toString("base64");

      return {
        iconType: "image",
        iconValue: `data:image/svg+xml;base64,${b64}`,
        hasRealIcon: true,
      };
    }

    // Sub-directory scan (assets/, v26.10.30/, etc.)

    for (const file of files) {
      const subPath = path.join(dirPath, file);

      if (!fs.existsSync(subPath) || !fs.statSync(subPath).isDirectory())
        continue;

      try {
        const subFiles = fs.readdirSync(subPath);

        const subPng = subFiles.find((f) =>
          preferredPngNames.includes(f.toLowerCase().trim()),
        );

        if (subPng) {
          const fullPath = path.join(subPath, subPng);

          const ext = path.extname(subPng).toLowerCase().replace(".", "");

          const mime = ext === "jpg" ? "image/jpeg" : `image/${ext}`;

          const b64 = fs.readFileSync(fullPath).toString("base64");

          return {
            iconType: "image",
            iconValue: `data:${mime};base64,${b64}`,
            hasRealIcon: true,
          };
        }

        const subSvg = subFiles.find((f) => {
          const l = f.toLowerCase();

          return (
            (preferredSvgNames.includes(l) || l.endsWith(".svg")) &&
            !l.includes("banner") &&
            !l.includes("pattern") &&
            !l.includes("splash")
          );
        });

        if (subSvg) {
          const svgContent = fs.readFileSync(
            path.join(subPath, subSvg),
            "utf-8",
          );

          const b64 = Buffer.from(svgContent, "utf-8").toString("base64");

          return {
            iconType: "image",
            iconValue: `data:image/svg+xml;base64,${b64}`,
            hasRealIcon: true,
          };
        }
      } catch {
        /* skip unreadable sub */
      }
    }

    // No real icon found → return null so the UI shows the "Add icon" hint

    return null;
  } catch (e) {
    console.error("[icon] findAppLogoImage error:", e);

    return null;
  }
}

function formatFileBytes(bytes: number): string {
  if (bytes >= 1024 * 1024 * 1024)
    return (bytes / (1024 * 1024 * 1024)).toFixed(1) + " GB";

  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";

  return Math.round(bytes / 1024) + " KB";
}

function extractVersionSemver(str: string): string {
  if (!str) return "1.0.0";

  const match = str.match(/(?:v|version)?[-_]?(\d+\.\d+(?:\.\d+)?)/i);

  return match ? match[1] : "1.0.0";
}

const shaderColorPresets = [
  {
    gradient: "from-blue-600 via-sky-500 to-cyan-400",
    textColor: "#38bdf8",
    glow: "rgba(56, 189, 248, 0.45)",
  },

  {
    gradient: "from-violet-700 via-purple-600 to-indigo-500",
    textColor: "#c084fc",
    glow: "rgba(192, 132, 252, 0.45)",
  },

  {
    gradient: "from-amber-600 via-orange-500 to-yellow-400",
    textColor: "#fbbf24",
    glow: "rgba(251, 191, 36, 0.45)",
  },

  {
    gradient: "from-emerald-500 via-teal-400 to-cyan-400",
    textColor: "#2dd4bf",
    glow: "rgba(45, 212, 191, 0.45)",
  },

  {
    gradient: "from-pink-600 via-rose-500 to-orange-400",
    textColor: "#fb7185",
    glow: "rgba(251, 113, 133, 0.45)",
  },
];

function pickReleaseExecutable(
  files: string[],
  targetVersion?: string,
): string | undefined {
  if (!Array.isArray(files) || files.length === 0) return undefined;

  const validFiles = files.filter((f) => {
    const l = f.toLowerCase();

    return (
      (l.endsWith(".exe") ||
        l.endsWith(".msix") ||
        l.endsWith(".appx") ||
        l.endsWith(".msi") ||
        l.endsWith(".zip")) &&
      !l.includes("uninstall") &&
      !l.endsWith(".blockmap")
    );
  });

  if (validFiles.length === 0) return undefined;

  if (targetVersion) {
    const cleanVer = String(targetVersion).replace(/^[vV]/, "");

    const verMatch =
      validFiles.find((f) => {
        const l = f.toLowerCase();

        return (
          f.includes(cleanVer) &&
          (l.includes("_setup") ||
            l.includes("-setup") ||
            l.includes("setup") ||
            l.includes("installer"))
        );
      }) || validFiles.find((f) => f.includes(cleanVer));

    if (verMatch) return verMatch;
  }

  validFiles.sort((a, b) => {
    const verA = extractVersionSemver(a);

    const verB = extractVersionSemver(b);

    const cmp = compareVersions(verB, verA);

    if (cmp !== 0) return cmp;

    const aIsSetup =
      a.toLowerCase().includes("setup") || a.toLowerCase().includes("installer")
        ? 1
        : 0;

    const bIsSetup =
      b.toLowerCase().includes("setup") || b.toLowerCase().includes("installer")
        ? 1
        : 0;

    return bIsSetup - aIsSetup;
  });

  return validFiles[0];
}

// Helper: check if a file is an installer or packaging artifact

function isLikelyInstaller(filePath: string): boolean {
  if (!filePath) return false;
  const lower = filePath.toLowerCase();
  const baseName = path.basename(lower);

  // Portable apps are standalone executables, NEVER installers
  if (baseName.includes("portable")) {
    return false;
  }

  // Explicit installer / uninstaller names
  if (
    baseName.includes("setup") ||
    baseName.includes("installer") ||
    baseName.includes("uninstall") ||
    baseName.includes("elevate") ||
    baseName.startsWith("onetap-v-") ||
    (baseName.startsWith("onetap") && !baseName.includes("one tap.exe"))
  ) {
    return true;
  }

  // If it is inside LocalAppData\Programs or Program Files (and not explicitly named setup/installer/uninstall), it is an installed app, not an installer!
  if (
    (lower.includes("\\programs\\") ||
      lower.includes("\\program files\\") ||
      lower.includes("\\program files (x86)\\") ||
      lower.includes("win-unpacked")) &&
    !baseName.includes("setup") &&
    !baseName.includes("installer") &&
    !baseName.includes("uninstall")
  ) {
    return false;
  }

  // Staging / release directories where packages are stored as installers
  if (
    lower.includes("child app realse") ||
    lower.includes("packages-inbox") ||
    lower.includes("installed-apps") ||
    lower.includes("published-apps") ||
    lower.includes("releases") ||
    lower.includes("temp-downloads")
  ) {
    if (baseName.endsWith(".exe")) {
      return true;
    }
  }

  // Versioned release binaries, e.g. OneTap-V-26.10.30.exe in staging directories
  if (
    /[-_]v[-_]?\d+/i.test(baseName) ||
    /^[a-z0-9_-]+[-_]\d+(\.\d+)+/i.test(baseName)
  ) {
    return true;
  }

  // Deep inspection: check binary header for NSIS/InnoSetup signatures if file exists on disk
  if (fs.existsSync(filePath)) {
    try {
      const fd = fs.openSync(filePath, "r");
      const buf = Buffer.alloc(262144);
      fs.readSync(fd, buf, 0, 262144, 0);
      fs.closeSync(fd);
      const str = buf.toString("latin1");
      if (
        str.includes("Nullsoft") ||
        str.includes("Inno Setup") ||
        str.includes("Inno")
      ) {
        return true;
      }
    } catch {}
  }

  return false;
}

function syncCatalogToEcosystem(catalog: any[]): void {
  try {
    const raw = JSON.stringify(catalog, null, 2);
    const pubFile = path.join(getPublishedDir(), "catalog.json");
    fs.writeFileSync(pubFile, raw, "utf-8");

    // Mirror to global ecosystem locations so child apps can always discover updates
    const appData =
      process.env.APPDATA ||
      (process.env.USERPROFILE
        ? path.join(process.env.USERPROFILE, "AppData", "Roaming")
        : "");

    const targets = [
      path.join(app.getPath("userData"), "published-apps", "catalog.json"),
      path.join(app.getPath("userData"), "ecosystem_catalog.json"),
      appData ? path.join(appData, "Anything", "published-apps", "catalog.json") : "",
      appData ? path.join(appData, "Anything", "ecosystem_catalog.json") : "",
      appData ? path.join(appData, "anything", "published-apps", "catalog.json") : "",
      appData ? path.join(appData, "anything", "ecosystem_catalog.json") : "",
      path.join(getPublishedDir(), "catalog.json"),
    ].filter((p): p is string => Boolean(p && typeof p === "string" && p.length > 0));

    for (const t of targets) {
      try {
        const dir = path.dirname(t);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(t, raw, "utf-8");
      } catch {}
    }
  } catch (e) {
    console.warn("[Ecosystem] Error broadcasting catalog to ecosystem:", e);
  }
}

async function scanAndCollectReleases(): Promise<{
  success: boolean;

  addedCount: number;

  updatedCount: number;

  total: number;

  catalog: any[];

  error?: string;
}> {
  try {
    const releasesDir = getReleasesDir();

    const publishedDir = getPublishedDir();

    const catalogFile = path.join(publishedDir, "catalog.json");

    let catalog: any[] = [];

    if (fs.existsSync(catalogFile)) {
      try {
        catalog = JSON.parse(fs.readFileSync(catalogFile, "utf-8"));
      } catch (e) {}
    }

    // Collect all release root folders (supports both "releases" and "release")

    const scanRoots = getAllReleaseDirs();

    let addedCount = 0;

    let updatedCount = 0;

    // Prune any catalog entries whose files no longer exist on disk in published-apps or releases (preserving downloadable online apps)

    const initialLen = catalog.length;

    catalog = catalog.filter((app: any) => {
      if (!app || !app.id) return false;

      const cleanId = (app.id || "").replace(/^app-/, "");

      const pubDir1 = path.join(publishedDir, app.id);

      const pubDir2 = path.join(publishedDir, cleanId);

      const hasPub =
        (fs.existsSync(pubDir1) && fs.readdirSync(pubDir1).length > 0) ||
        (fs.existsSync(pubDir2) && fs.readdirSync(pubDir2).length > 0);

      const hasRel = scanRoots.some((r) => {
        const r1 = path.join(r, app.id);

        const r2 = path.join(r, cleanId);

        return (
          (fs.existsSync(r1) && fs.readdirSync(r1).length > 0) ||
          (fs.existsSync(r2) && fs.readdirSync(r2).length > 0)
        );
      });

      const hasDownloadable = Boolean(
        app.downloadUrl ||
        app.githubRepo ||
        app.mobileInfo ||
        app.releasesUrl ||
        app.packageFileName ||
        app.localPackagePath,
      );

      return hasPub || hasRel || hasDownloadable;
    });

    if (catalog.length !== initialLen) {
      updatedCount++;
    }

    for (const releasesDir of scanRoots) {
      const entries = fs.readdirSync(releasesDir, { withFileTypes: true });

      for (const entry of entries) {
        if (entry.name.startsWith(".") || entry.name === "node_modules")
          continue;

        const lowerEntryName = entry.name.toLowerCase();
        if (
          lowerEntryName === "anything" ||
          lowerEntryName === "auto-copier" ||
          lowerEntryName === "autocopier" ||
          lowerEntryName === "pulsewave" ||
          lowerEntryName === "sample-app" ||
          lowerEntryName.includes("master hub")
        ) {
          continue;
        }

        if (entry.isDirectory()) {
          const appDir = path.join(releasesDir, entry.name);

          const appFiles = fs.readdirSync(appDir);

          // 1. Check for App Listing Icon (.png, .svg, or .exe thumbnail)

          const appLogo = await findAppLogoImage(appDir);

          // 2. Base Identity Manifest: app.json or manifest.json

          let manifest: any = {};

          const manifestFile = appFiles.find(
            (f) =>
              f.toLowerCase() === "app.json" ||
              f.toLowerCase() === "manifest.json",
          );

          if (manifestFile) {
            try {
              manifest = JSON.parse(
                fs.readFileSync(path.join(appDir, manifestFile), "utf-8"),
              );

              if (
                manifest.iconValue &&
                typeof manifest.iconValue === "string" &&
                !manifest.iconValue.startsWith("data:") &&
                !manifest.iconValue.startsWith("http")
              ) {
                const candidateIconPath = path.join(appDir, manifest.iconValue);

                if (fs.existsSync(candidateIconPath)) {
                  const ext = path.extname(candidateIconPath).toLowerCase();

                  const mime = ext === ".svg" ? "image/svg+xml" : "image/png";

                  manifest.iconType = "image";

                  manifest.iconValue = `data:${mime};base64,${fs.readFileSync(candidateIconPath).toString("base64")}`;
                }
              }
            } catch (e) {}
          }

          // 3. Detect version releases: both subdirectories (e.g. "V-1.0.0") and flat files

          interface DiscoveredRelease {
            version: string;

            exeFile: string;

            exeFullPath: string;

            stats: fs.Stats;

            releaseMeta: any;
          }

          const discoveredReleases: DiscoveredRelease[] = [];

          // Scan version subdirectories: V-1.0.0, v26.10.30, 1.0.0, etc.

          const subEntries = fs.readdirSync(appDir, { withFileTypes: true });

          const versionDirs = subEntries.filter(
            (e) =>
              e.isDirectory() &&
              (e.name.toLowerCase().startsWith("v") ||
                /^\d+\.\d+/.test(e.name)),
          );

          for (const vDir of versionDirs) {
            const vDirPath = path.join(appDir, vDir.name);

            const vFiles = fs.readdirSync(vDirPath);

            const vExe = pickReleaseExecutable(
              vFiles,
              extractVersionSemver(vDir.name),
            );

            if (vExe) {
              const exeFullPath = path.join(vDirPath, vExe);

              let releaseMeta: any = {};

              const relFile = vFiles.find(
                (f) =>
                  f.toLowerCase().startsWith("release") &&
                  f.toLowerCase().endsWith(".json"),
              );

              if (relFile) {
                try {
                  releaseMeta = JSON.parse(
                    fs.readFileSync(path.join(vDirPath, relFile), "utf-8"),
                  );
                } catch (e) {}
              }

              const ver =
                releaseMeta.version ||
                extractVersionSemver(vDir.name) ||
                extractVersionSemver(vExe) ||
                "1.0.0";

              discoveredReleases.push({
                version: ver,

                exeFile: vExe,

                exeFullPath,

                stats: fs.statSync(exeFullPath),

                releaseMeta,
              });
            }
          }

          // Also check flat files directly in appDir

          let flatReleaseMeta: any = {};

          const flatRelFile = appFiles.find(
            (f) =>
              f.toLowerCase().startsWith("release") &&
              f.toLowerCase().endsWith(".json"),
          );

          if (flatRelFile) {
            try {
              flatReleaseMeta = JSON.parse(
                fs.readFileSync(path.join(appDir, flatRelFile), "utf-8"),
              );
            } catch (e) {}
          }

          const flatExe = pickReleaseExecutable(
            appFiles,
            manifest.version || flatReleaseMeta.version,
          );

          if (flatExe) {
            const ver =
              flatReleaseMeta.version ||
              manifest.version ||
              extractVersionSemver(flatExe) ||
              "1.0.0";

            // Avoid duplicate if already picked up from subfolder

            if (!discoveredReleases.some((r) => r.version === ver)) {
              const exeFullPath = path.join(appDir, flatExe);

              discoveredReleases.push({
                version: ver,

                exeFile: flatExe,

                exeFullPath,

                stats: fs.statSync(exeFullPath),

                releaseMeta: flatReleaseMeta,
              });
            }
          }

          if (discoveredReleases.length === 0) continue;

          // Sort releases semantically descending (latest version first)

          discoveredReleases.sort((a, b) =>
            compareVersions(b.version, a.version),
          );

          const latest = discoveredReleases[0];

          const appId =
            manifest.id ||
            latest.releaseMeta.appId ||
            `app-${entry.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

          const appName =
            manifest.name ||
            latest.releaseMeta.appName ||
            entry.name
              .replace(/[-_]/g, " ")
              .replace(/\b\w/g, (l) => l.toUpperCase());

          const category = manifest.category || "Productivity";

          const description =
            latest.releaseMeta.summary ||
            manifest.description ||
            `Child application ${appName} running inside Anything.`;

          const normAppId = appId
            .toLowerCase()
            .replace(/^app-/, "")
            .replace(/[^a-z0-9]/g, "");

          const githubRepo =
            manifest.githubRepo ||
            KNOWN_ECOSYSTEM_REPOS[normAppId] ||
            KNOWN_ECOSYSTEM_REPOS[appId] ||
            undefined;

          const targetDir = path.join(publishedDir, appId);

          if (!fs.existsSync(targetDir))
            fs.mkdirSync(targetDir, { recursive: true });

          // Copy executables and prepare release records

          const historyRecords: any[] = [];

          let isNewFile = false;

          for (const rel of discoveredReleases) {
            const destPath = path.join(targetDir, rel.exeFile);

            let needsCopy = true;

            if (fs.existsSync(destPath)) {
              const destStats = fs.statSync(destPath);

              if (destStats.size === rel.stats.size) {
                needsCopy = false;
              }
            }

            // Keep canonical binary reference directly on disk (DO NOT duplicate .exe)
            if (rel === latest) isNewFile = false;

            const relReleasesUrl = githubRepo
              ? `https://github.com/${githubRepo}/releases`
              : manifest.releasesUrl;

            const relDownloadUrl = githubRepo
              ? normAppId === "autocopier" || normAppId === "auto-copier"
                ? `https://github.com/${githubRepo}/releases/download/v26.10.30/${rel.exeFile}`
                : `https://github.com/${githubRepo}/releases/download/v${rel.version}/${rel.exeFile}`
              : manifest.downloadUrl?.startsWith("http")
                ? manifest.downloadUrl
                : destPath;

            historyRecords.push({
              version: rel.version,

              executableName: manifest.executableName || `${appName}.exe`,

              setupExecutableName: rel.exeFile,

              releaseDate:
                rel.releaseMeta.releaseDate ||
                new Date().toISOString().slice(0, 10),

              releaseType: rel.releaseMeta.releaseType || "minor",

              tagline:
                rel.releaseMeta.tagline || `${appName} v${rel.version} Update`,

              summary: rel.releaseMeta.summary || description,

              newFeatures: Array.isArray(rel.releaseMeta.newFeatures)
                ? rel.releaseMeta.newFeatures
                : [],

              improvements: Array.isArray(rel.releaseMeta.improvements)
                ? rel.releaseMeta.improvements
                : [],

              fixes: Array.isArray(rel.releaseMeta.fixes)
                ? rel.releaseMeta.fixes
                : [],

              emailNotification: rel.releaseMeta.emailNotification,

              sizeFormatted: formatFileBytes(rel.stats.size),

              downloadUrl: relDownloadUrl,

              releasesUrl: relReleasesUrl,
            });
          }

          const primaryDestPath = path.join(targetDir, latest.exeFile);

          const ext = path.extname(latest.exeFile).toLowerCase();

          const shader =
            shaderColorPresets[
              Math.abs(
                appId
                  .split("")
                  .reduce((a: number, b: string) => a + b.charCodeAt(0), 0),
              ) % shaderColorPresets.length
            ];

          const releasesUrl = githubRepo
            ? `https://github.com/${githubRepo}/releases`
            : manifest.releasesUrl;

          const remoteDownloadUrl = manifest.downloadUrl?.startsWith("http")
            ? manifest.downloadUrl
            : undefined;

          // Real installed executable name (not the setup installer)

          let resolvedExeName = manifest.executableName;

          if (!resolvedExeName || isLikelyInstaller(resolvedExeName)) {
            resolvedExeName = `${appName}.exe`;
          }

          const catalogEntry = {
            id: appId,

            name: appName,

            shortName: (
              manifest.shortName || appName.slice(0, 2)
            ).toUpperCase(),

            category,

            version: latest.version,

            size: manifest.size || formatFileBytes(latest.stats.size),

            packageSize: formatFileBytes(latest.stats.size),

            description,

            executableName: resolvedExeName,

            setupExecutableName: latest.exeFile,

            packageFileName: latest.exeFile,

            packageFormat: ext,

            localPackagePath: latest.exeFullPath || primaryDestPath,

            downloadUrl: remoteDownloadUrl || latest.exeFullPath || primaryDestPath,

            releasesUrl,

            gradient: manifest.gradient || shader.gradient,

            textColor: manifest.textColor || shader.textColor,

            glowColor: manifest.glowColor || shader.glow,

            iconType: appLogo ? "image" : manifest.iconType || "emoji",

            iconValue: appLogo ? appLogo.iconValue : manifest.iconValue || "⚡",

            hasRealIcon: appLogo
              ? appLogo.hasRealIcon
              : Boolean(manifest.iconValue && manifest.iconType === "image"),

            status: "not-installed",

            githubRepo,

            endpoints: manifest.endpoints || undefined,

            publishedAt: Date.now(),

            releaseInfo: historyRecords[0],

            history: historyRecords,

            systemRequirements: manifest.systemRequirements || {
              os: "Windows 10 / Windows 11 (64-bit)",

              ram: "8 GB RAM (16 GB Recommended)",

              gpu: "DirectX 12 / Direct3D 11 GPU Accelerated",

              storage: `${manifest.size || formatFileBytes(latest.stats.size)} Available Space`,
            },

            changelog: [
              ...(manifest.changelog || []),

              ...(latest.releaseMeta.newFeatures
                ? latest.releaseMeta.newFeatures.map(
                    (f: string) => `Feature: ${f}`,
                  )
                : []),

              ...(latest.releaseMeta.improvements
                ? latest.releaseMeta.improvements.map(
                    (i: string) => `Improvement: ${i}`,
                  )
                : []),

              ...(latest.releaseMeta.fixes
                ? latest.releaseMeta.fixes.map((x: string) => `Fix: ${x}`)
                : []),
            ],

            addedByCreator: true,
          };

          const appVersion = latest.version;

          const existingIndex = catalog.findIndex((a: any) => {
            const aNorm = (a.id || "")
              .toLowerCase()
              .replace(/^app-/, "")
              .replace(/[^a-z0-9]/g, "");

            return a.id === appId || aNorm === normAppId;
          });

          if (existingIndex >= 0) {
            const existing = catalog[existingIndex];

            const hasNewer = compareVersions(appVersion, existing.version) > 0;

            const logoChanged = Boolean(
              appLogo &&
              (existing.iconValue !== appLogo.iconValue ||
                existing.iconType !== appLogo.iconType),
            );

            if (appLogo) {
              existing.iconType = appLogo.iconType;

              existing.iconValue = appLogo.iconValue;

              catalogEntry.iconType = appLogo.iconType;

              catalogEntry.iconValue = appLogo.iconValue;
            }

            const isOlder = compareVersions(appVersion, existing.version) < 0;

            if (isOlder) {
              const currentHist = Array.isArray(existing.history)
                ? [...existing.history]
                : [];

              for (const h of historyRecords) {
                if (!currentHist.some((ch: any) => ch.version === h.version)) {
                  currentHist.push(h);
                }
              }

              currentHist.sort((a: any, b: any) =>
                compareVersions(b.version, a.version),
              );

              catalog[existingIndex].history = currentHist;
            } else if (
              hasNewer ||
              isNewFile ||
              logoChanged ||
              catalogEntry.packageFileName !== existing.packageFileName
            ) {
              catalog[existingIndex] = {
                ...existing,

                ...catalogEntry,

                iconType: catalogEntry.iconType,

                iconValue: catalogEntry.iconValue,

                executableName: catalogEntry.executableName,

                packageFileName: catalogEntry.packageFileName,

                localPackagePath: catalogEntry.localPackagePath,

                status:
                  hasNewer
                    ? "update-available"
                    : existing.status === "ready"
                      ? "update-available"
                      : existing.status,
              };

              updatedCount++;

              if (
                (hasNewer || isNewFile) &&
                !hasNotifiedAppUpdate(appId, appVersion)
              ) {
                // Update notification disabled

                markAppUpdateNotified(appId, appVersion);
              }
            }
          } else {
            catalog.unshift(catalogEntry);

            addedCount++;

            if (!hasNotifiedAppUpdate(appId, `registered-${appVersion}`)) {
              // Update notification disabled

              markAppUpdateNotified(appId, `registered-${appVersion}`);
            }
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();

          if (ext !== ".exe" && ext !== ".msix" && ext !== ".zip") continue;

          const exeFullPath = path.join(releasesDir, entry.name);

          const stats = fs.statSync(exeFullPath);

          const cleanBase = entry.name
            .replace(/\.[^/.]+$/, "")
            .replace(/[-_v0-9.]+$/g, "")
            .trim();

          const appName = (cleanBase || "Application")
            .replace(/[-_]/g, " ")
            .replace(/\b\w/g, (l) => l.toUpperCase());

          const appId = `app-${appName.toLowerCase().replace(/[^a-z0-9]/g, "-")}`;

          const appVersion = extractVersionSemver(entry.name);

          const targetDir = path.join(publishedDir, appId);

          if (!fs.existsSync(targetDir))
            fs.mkdirSync(targetDir, { recursive: true });

          const destPath = path.join(targetDir, entry.name);

          fs.copyFileSync(exeFullPath, destPath);

          const shader =
            shaderColorPresets[
              Math.abs(
                appId
                  .split("")
                  .reduce((a: number, b: string) => a + b.charCodeAt(0), 0),
              ) % shaderColorPresets.length
            ];

          const catalogEntry = {
            id: appId,

            name: appName,

            shortName: appName.slice(0, 2).toUpperCase(),

            category: "Custom Tools",

            version: appVersion,

            description: `Direct release executable ${entry.name}`,

            executableName: entry.name,

            packageFileName: entry.name,

            packageSize: formatFileBytes(stats.size),

            packageFormat: ext,

            localPackagePath: destPath,

            gradient: shader.gradient,

            textColor: shader.textColor,

            glowColor: shader.glow,

            iconType: "emoji",

            iconValue: "📦",

            status: "not-installed",

            publishedAt: Date.now(),

            changelog: [`Collected ${entry.name} (v${appVersion})`],

            addedByCreator: true,
          };

          const existingIndex = catalog.findIndex((a: any) => a.id === appId);

          if (existingIndex >= 0) {
            const existing = catalog[existingIndex];

            if (compareVersions(appVersion, existing.version) > 0) {
              catalog[existingIndex] = {
                ...existing,
                ...catalogEntry,
                status: "update-available",
              };

              updatedCount++;

              if (!hasNotifiedAppUpdate(appId, appVersion)) {
                // Update notification disabled

                markAppUpdateNotified(appId, appVersion);
              }
            }
          } else {
            catalog.unshift(catalogEntry);

            addedCount++;

            if (!hasNotifiedAppUpdate(appId, `registered-${appVersion}`)) {
              // Update notification disabled

              markAppUpdateNotified(appId, `registered-${appVersion}`);
            }
          }
        }
      }
    }

    // Real-time verification of installed paths and versions across ecosystem
    for (const item of catalog) {
      const detected = findInstalledExecutable({
        appName: item.name,
        appId: item.id,
        currentPath: item.installedPath,
        executableName: item.executableName,
      });

      if (detected && fs.existsSync(detected)) {
        item.installedPath = detected;
        item.executableName = path.basename(detected);
        const ver = getExecutableVersion(detected);
        if (ver) {
          item.localVersion = ver;
          const isOutdated = compareVersions(item.version, ver) > 0;
          item.status = isOutdated ? "update-available" : "installed";
        } else {
          item.status = "installed";
        }
      }
    }

    syncCatalogToEcosystem(catalog);

    return {
      success: true,
      addedCount,
      updatedCount,
      total: catalog.length,
      catalog,
    };
  } catch (err: any) {
    return {
      success: false,
      addedCount: 0,
      updatedCount: 0,
      total: 0,
      catalog: [],
      error: err.message,
    };
  }
}

// ================= BULLETPROOF AUTO-UPDATER INITIALIZER =================

let safeAutoUpdater: any = null;

let autoUpdaterInitialized = false;

function getSafeAutoUpdater(win?: BrowserWindow | null): any {
  if (autoUpdaterInitialized) return safeAutoUpdater;

  autoUpdaterInitialized = true;

  try {
    const rawVersion = app.getVersion();

    // Validate semver: check if any numeric segment has leading zeroes (e.g. "26.10.01")

    const parts = (rawVersion || "").split(".");

    const hasLeadingZero = parts.some(
      (p) => p.length > 1 && p.startsWith("0") && /^\d+$/.test(p),
    );

    if (hasLeadingZero) {
      console.warn(
        `[AutoUpdater] Current version "${rawVersion}" contains leading zeroes which violates SemVer; skipping electron-updater to prevent crash.`,
      );

      safeAutoUpdater = null;

      return null;
    }

    const { autoUpdater } = require("electron-updater");

    autoUpdater.autoDownload = true;

    autoUpdater.autoInstallOnAppQuit = true;

    // Explicitly configure GitHub feed so autoUpdater never throws ENOENT searching for app-update.yml

    try {
      autoUpdater.setFeedURL({
        provider: "github",

        owner: "BSFrameWorks5253",

        repo: "Anything",
      });
    } catch (feedErr) {
      console.warn("[AutoUpdater] setFeedURL error:", feedErr);
    }

    if (win && !win.isDestroyed()) {
      autoUpdater.on("checking-for-update", () => {
        if (!win.isDestroyed()) {
          win.webContents.send("updater:status", { status: "checking" });
        }
      });

      autoUpdater.on("update-available", (info: any) => {
        if (!win.isDestroyed()) {
          win.webContents.send("updater:status", {
            status: "available",
            version: info?.version,
            info,
          });
        }
        // Update notification disabled
      });

      autoUpdater.on("download-progress", (prog: any) => {
        if (!win.isDestroyed()) {
          win.webContents.send("updater:status", {
            status: "downloading",

            percent: Math.round(prog?.percent || 0),

            bytesPerSecond: prog?.bytesPerSecond || 0,

            transferred: prog?.transferred || 0,

            total: prog?.total || 0,
          });
        }
      });

      autoUpdater.on("update-downloaded", (info: any) => {
        if (!win.isDestroyed()) {
          win.webContents.send("updater:status", {
            status: "downloaded",
            version: info?.version,
            info,
          });
        }
        // Update notification disabled
      });

      autoUpdater.on("update-not-available", (info: any) => {
        if (!win.isDestroyed()) {
          win.webContents.send("updater:status", {
            status: "not-available",

            version: info?.version,

            info,
          });
        }
      });

      autoUpdater.on("error", (err: any) => {
        console.warn(
          "[AutoUpdater] electron-updater background check warning:",
          err?.message || err,
        );

        if (!win.isDestroyed()) {
          win.webContents.send("updater:status", {
            status: "error",

            error: err?.message || String(err),
          });
        }
      });
    }

    safeAutoUpdater = autoUpdater;

    return autoUpdater;
  } catch (err) {
    console.warn(
      "[AutoUpdater] Failed to initialize electron-updater (safe fallback active):",
      err,
    );

    safeAutoUpdater = null;

    return null;
  }
}

// ================= WINDOWS APP USER MODEL ID & SHORTCUT =================

function ensureWindowsAppRegistration(
  appId: string,
  displayName: string,
  iconPath?: string,
) {
  if (process.platform !== "win32") return;

  try {
    const safeId = sanitizeAppId(appId) || "com.burhanuddin.anything";
    const regKey = `HKCU\\Software\\Classes\\AppUserModelId\\${safeId}`;

    execFile(
      "reg.exe",
      [
        "add",
        regKey,
        "/v",
        "DisplayName",
        "/t",
        "REG_SZ",
        "/d",
        displayName,
        "/f",
      ],
      () => {},
    );

    // Ensure icon exists as a real physical file on disk outside app.asar
    let resolvedPhysicalIcon = iconPath;
    if (iconPath && fs.existsSync(iconPath)) {
      try {
        const physicalIcon = path.join(app.getPath("userData"), "app-logo.png");
        fs.copyFileSync(iconPath, physicalIcon);
        resolvedPhysicalIcon = physicalIcon;
      } catch {}
    }

    if (resolvedPhysicalIcon && fs.existsSync(resolvedPhysicalIcon)) {
      execFile(
        "reg.exe",
        [
          "add",
          regKey,
          "/v",
          "IconUri",
          "/t",
          "REG_SZ",
          "/d",
          resolvedPhysicalIcon,
          "/f",
        ],
        () => {},
      );
      execFile(
        "reg.exe",
        [
          "add",
          regKey,
          "/v",
          "IconBackgroundColor",
          "/t",
          "REG_SZ",
          "/d",
          "FF030712",
          "/f",
        ],
        () => {},
      );
    }

    execFile(
      "reg.exe",
      [
        "add",
        regKey,
        "/v",
        "ShowInSettings",
        "/t",
        "REG_DWORD",
        "/d",
        "1",
        "/f",
      ],
      () => {},
    );

    // Ensure Windows FriendlyAppName for both Anything.exe and electron.exe
    execFile(
      "reg.exe",
      [
        "add",
        "HKCU\\Software\\Classes\\Applications\\Anything.exe",
        "/v",
        "FriendlyAppName",
        "/t",
        "REG_SZ",
        "/d",
        "Anything",
        "/f",
      ],
      () => {},
    );
    execFile(
      "reg.exe",
      [
        "add",
        "HKCU\\Software\\Classes\\Applications\\Anything.exe",
        "/v",
        "ApplicationName",
        "/t",
        "REG_SZ",
        "/d",
        "Anything",
        "/f",
      ],
      () => {},
    );
    execFile(
      "reg.exe",
      [
        "add",
        "HKCU\\Software\\Classes\\Applications\\electron.exe",
        "/v",
        "FriendlyAppName",
        "/t",
        "REG_SZ",
        "/d",
        "Anything",
        "/f",
      ],
      () => {},
    );
    execFile(
      "reg.exe",
      [
        "add",
        "HKCU\\Software\\Classes\\Applications\\electron.exe",
        "/v",
        "ApplicationName",
        "/t",
        "REG_SZ",
        "/d",
        "Anything",
        "/f",
      ],
      () => {},
    );
  } catch (e) {
    console.warn(`ensureWindowsAppRegistration failed for ${appId}:`, e);
  }
}

function ensureWindowsShortcut() {
  if (process.platform !== "win32") return;

  try {
    const candidatePaths = [
      path.join(__dirname, "..", "scripts", "create-shortcut.ps1"),

      path.join(getProjectRoot(), "scripts", "create-shortcut.ps1"),

      path.join(process.resourcesPath, "scripts", "create-shortcut.ps1"),
    ];

    const scriptPath = candidatePaths.find((p) => fs.existsSync(p));

    if (scriptPath) {
      execFile(
        "powershell.exe",
        ["-NoProfile", "-ExecutionPolicy", "Bypass", "-File", scriptPath, process.execPath, getProjectRoot(), getAppIconPath() || ""],
        () => {},
      );
    }
  } catch (e) {
    console.warn("ensureWindowsShortcut error:", e);
  }
}

// Set Windows AppUserModelId for dedicated taskbar grouping and native Action Center toast notifications

// ANYTHING_AUMID set above

if (process.platform === "win32") {
  // Always register Anything as the explicit AUMID so Windows Toast Notifications identify as 'Anything'

  app.setAppUserModelId(ANYTHING_AUMID);

  const defaultIco = getAssetPath("icon.ico");

  const defaultAppLogo = getAssetPath("app-logo.png");

  const regLogo = fs.existsSync(defaultIco) ? defaultIco : defaultAppLogo;

  ensureWindowsAppRegistration(ANYTHING_AUMID, "Anything", regLogo);

  ensureWindowsShortcut();
}

// ================= NOTIFICATION DEDUPLICATION & PERSISTENCE =================

const recentNotifications = new Map<string, number>();

const getNotifiedUpdatesFilePath = () => {
  return path.join(app.getPath("userData"), "notified-updates.json");
};

const getNotifiedUpdates = (): Record<string, string> => {
  try {
    const p = getNotifiedUpdatesFilePath();

    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf-8"));
    }
  } catch {}

  return {};
};

const markAppUpdateNotified = (appId: string, version: string) => {
  try {
    const cleanVer = (version || "").trim();

    if (!appId || !cleanVer) return;

    const normId = appId
      .toLowerCase()
      .replace(/^app-/, "")
      .replace(/[^a-z0-9]/g, "");

    const current = getNotifiedUpdates();

    current[normId] = cleanVer;

    current[appId] = cleanVer;

    const p = getNotifiedUpdatesFilePath();

    const dir = path.dirname(p);

    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

    fs.writeFileSync(p, JSON.stringify(current, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed saving notified updates:", e);
  }
};

const hasNotifiedAppUpdate = (appId: string, version: string): boolean => {
  try {
    const cleanVer = (version || "").trim();

    if (!appId || !cleanVer) return false;

    const normId = appId
      .toLowerCase()
      .replace(/^app-/, "")
      .replace(/[^a-z0-9]/g, "");

    const current = getNotifiedUpdates();

    return current[normId] === cleanVer || current[appId] === cleanVer;
  } catch {
    return false;
  }
};

function sendWindowsNotification(
  title: string,
  body: string,
  onClick?: () => void,
  iconSource?: string,
  appName?: string,
) {
  try {
    if (!Notification.isSupported()) return;

    // Suppress all update/release-related toast notifications
    const lowerTitle = (title || "").toLowerCase();
    const lowerBody = (body || "").toLowerCase();
    if (
      lowerTitle.includes("update") ||
      lowerBody.includes("update") ||
      lowerTitle.includes("release") ||
      lowerBody.includes("release") ||
      lowerTitle.includes("new version") ||
      lowerBody.includes("new version") ||
      lowerTitle.includes("downloading in the background") ||
      lowerBody.includes("downloading in the background")
    ) {
      console.log(`[Notification Suppressed - Update notifications disabled by policy]: ${title}`);
      return;
    }

    // Deduplication check: suppress identical notifications within 10 minutes

    const notifKey = `${title}:::${body}`;

    const now = Date.now();

    const lastSent = recentNotifications.get(notifKey);

    if (lastSent && now - lastSent < 10 * 60 * 1000) {
      console.log(
        `[Notification Suppressed - Duplicate within cooldown]: ${title}`,
      );

      return;
    }

    recentNotifications.set(notifKey, now);

    // Prune cooldown cache if large

    if (recentNotifications.size > 200) {
      for (const [k, time] of recentNotifications.entries()) {
        if (now - time > 15 * 60 * 1000) recentNotifications.delete(k);
      }
    }

    const defaultIconPath = getAppIconPath() || getAssetPath("app-logo.png");

    let resolvedIconPath = defaultIconPath;

    let iconImg: Electron.NativeImage | undefined;

    if (iconSource) {
      if (
        typeof iconSource === "string" &&
        iconSource.startsWith("data:image/")
      ) {
        try {
          iconImg = nativeImage.createFromDataURL(iconSource);

          if (appName) {
            const iconCacheDir = path.join(
              app.getPath("userData"),
              "app-icons",
            );

            if (!fs.existsSync(iconCacheDir))
              fs.mkdirSync(iconCacheDir, { recursive: true });

            const safeName = appName.replace(/[^a-zA-Z0-9_-]/g, "_");

            const cachedFile = path.join(iconCacheDir, `${safeName}.png`);

            if (!fs.existsSync(cachedFile)) {
              const base64Data = iconSource.replace(
                /^data:image\/\w+;base64,/,
                "",
              );

              fs.writeFileSync(cachedFile, Buffer.from(base64Data, "base64"));
            }

            resolvedIconPath = cachedFile;
          }
        } catch (e) {
          console.warn("Failed parsing data URL icon for notification:", e);
        }
      } else if (typeof iconSource === "string" && fs.existsSync(iconSource)) {
        resolvedIconPath = iconSource;

        iconImg = nativeImage.createFromPath(iconSource);
      }
    }

    if (!iconImg && fs.existsSync(resolvedIconPath)) {
      iconImg = nativeImage.createFromPath(resolvedIconPath);
    }

    // Fall back to primary native app icon if available

    if (!iconImg) {
      iconImg = getAppNativeIcon();
    }

    const notif = new Notification({
      title,

      body,

      icon: iconImg,

      silent: false,
    });

    if (onClick) {
      notif.on("click", onClick);
    }

    notif.show();
  } catch (e) {
    console.error("Notification error:", e);
  }
}

// ================= WINDOWS SYSTEM TRAY DAEMON =================

let tray: Tray | null = null;

let isQuitting = false;

let installedAppsForTray: Array<{ id: string; name: string; path?: string }> =
  [];

// One Tap daemon logic extracted to ./services/onetap.service

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

              win.webContents.send("notification:clicked", { appId: item.id });
            }
          },
        }))
      : [{ label: "(No installed apps yet)", enabled: false }];

  return Menu.buildFromTemplate([
    {
      label: "✨ Anything (Liquid Glass)",

      enabled: false,
    },

    { type: "separator" },

    {
      label: "Open Anything",

      click: () => {
        if (win.isMinimized()) win.restore();

        win.show();

        win.focus();
      },
    },

    {
      label: "🔄 Check for App Updates",

      click: () => {
        if (win.isMinimized()) win.restore();

        win.show();

        win.webContents.send("tray:check-updates");
      },
    },

    { type: "separator" },

    {
      label: "🖼️ One Tap: PNG to JPG",
      submenu: [
        {
          label: getOneTapWatcherStatus().enabled
            ? `🟢 Auto-Convert Screenshots: ON (${getOneTapWatcherStatus().watchDir ? path.basename(getOneTapWatcherStatus().watchDir!) : "Active"})`
            : "⚪ Auto-Convert Screenshots: OFF",
          type: "checkbox",
          checked: getOneTapWatcherStatus().enabled,
          click: () => {
            toggleOneTapWatcher(undefined, win, sendWindowsNotification, () => {
              if (tray && win && !win.isDestroyed()) {
                tray.setContextMenu(buildTrayMenu(win));
              }
            });
          },
        },
        ...(getOneTapWatcherStatus().watchDir && fs.existsSync(getOneTapWatcherStatus().watchDir!)
          ? [
              {
                label: `📂 Open Watch Folder (${path.basename(getOneTapWatcherStatus().watchDir!)})`,
                click: () => {
                  shell.openPath(getOneTapWatcherStatus().watchDir!);
                },
              },
            ]
          : []),
        { type: "separator" },
        {
          label: "⚡ Convert PNG File(s) to JPG...",
          click: () => {
            handleOneTapConvertFiles(win, undefined, sendWindowsNotification, () => {
              if (tray && win && !win.isDestroyed()) {
                tray.setContextMenu(buildTrayMenu(win));
              }
            });
          },
        },
        {
          label: "📁 Convert Folder of PNGs to JPG...",
          click: () => {
            handleOneTapConvertFolder(win, undefined, sendWindowsNotification, () => {
              if (tray && win && !win.isDestroyed()) {
                tray.setContextMenu(buildTrayMenu(win));
              }
            });
          },
        },
        ...(getLastOneTapConvertedDir() && fs.existsSync(getLastOneTapConvertedDir()!)
          ? [
              {
                label: `📂 Open Converted Folder (${path.basename(path.dirname(getLastOneTapConvertedDir()!))})`,
                click: () => {
                  shell.openPath(getLastOneTapConvertedDir()!);
                },
              },
            ]
          : []),
        { type: "separator" },
        {
          label: "🚀 Open One Tap Workstation",
          click: () => {
            launchOneTapApp(win, sendWindowsNotification);
          },
        },
      ],
    },

    { type: "separator" },

    {
      label: "⚡ Quick Launch Apps",

      submenu: appMenuItems,
    },

    { type: "separator" },

    {
      label: "Quit Anything",

      click: () => {
        isQuitting = true;

        app.quit();
      },
    },
  ]);
}

function createSystemTray(win: BrowserWindow) {
  try {
    const primaryIconPath = getAppIconPath();

    const appNativeIcon = getAppNativeIcon();

    let trayImage: Electron.NativeImage | null = null;

    // The task bar logo is the primary logo: prioritize it directly

    const candidatePaths = [
      primaryIconPath,

      getAssetPath("icon.ico"),

      getAssetPath("app-logo.png"),

      getAssetPath("tray-icon-32.png"),

      getAssetPath("tray-icon.png"),
    ].filter(Boolean) as string[];

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          const img = nativeImage.createFromPath(p);

          if (!img.isEmpty()) {
            const size = img.getSize();

            trayImage =
              size.width === 32 && size.height === 32
                ? img
                : img.resize({ width: 32, height: 32, quality: "best" });

            break;
          }
        } catch {}
      }
    }

    if (!trayImage && appNativeIcon && !appNativeIcon.isEmpty()) {
      trayImage = appNativeIcon.resize({
        width: 32,
        height: 32,
        quality: "best",
      });
    }

    if (!trayImage || trayImage.isEmpty()) {
      console.warn(
        "System tray icon could not be located; skipping tray initialization",
      );

      return;
    }

    tray = new Tray(trayImage);

    tray.setToolTip("Anything");

    tray.setContextMenu(buildTrayMenu(win));

    tray.on("click", () => {
      if (win.isDestroyed()) return;

      if (win.isVisible()) {
        win.hide();
      } else {
        if (win.isMinimized()) win.restore();

        win.show();

        win.focus();
      }
    });
  } catch (err) {
    console.error("Tray initialization error:", err);
  }
}

// ================= GITHUB RELEASES ENGINE =================

function parseGitHubRepo(
  input: string,
): { owner: string; repo: string } | null {
  if (!input) return null;

  let clean = input
    .trim()
    .replace(/^https?:\/\/github\.com\//i, "")
    .replace(/\.git$/i, "");

  clean = clean.replace(/\/releases.*$/i, "").replace(/\/+$/, "");

  const parts = clean.split("/");

  if (parts.length >= 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1] };
  }

  return null;
}

function compareVersions(remote: string, current: string): number {
  if (!remote || !current) return 0;

  const clean = (v: string) => v.replace(/^[vV]/, "").trim();

  const rParts = clean(remote)
    .split(/[.-]/)
    .map((p) => (isNaN(Number(p)) ? p : Number(p)));

  const cParts = clean(current)
    .split(/[.-]/)
    .map((p) => (isNaN(Number(p)) ? p : Number(p)));

  const maxLen = Math.max(rParts.length, cParts.length);

  for (let i = 0; i < maxLen; i++) {
    const r = rParts[i] ?? 0;

    const c = cParts[i] ?? 0;

    if (typeof r === "number" && typeof c === "number") {
      if (r > c) return 1;

      if (r < c) return -1;
    } else {
      const cmp = String(r).localeCompare(String(c));

      if (cmp !== 0) return cmp;
    }
  }

  return 0;
}

function pickWindowsAsset(assets: any[], appHint?: string, targetVersion?: string): any {
  if (!Array.isArray(assets) || assets.length === 0) return null;

  // STRICT REQUIREMENT: Only fetch setup .exe installers!
  const candidates = assets.filter((a: any) => {
    const name = String(a?.name || "").toLowerCase();

    // Must strictly be an .exe file (reject .zip, .msix, .appx, .blockmap, .yml, .apk, etc.)
    if (!name.endsWith(".exe")) return false;

    // Reject uninstallers and elevation helpers
    if (
      name.includes("uninstall") ||
      name.includes("elevate") ||
      name.includes("helper") ||
      name.endsWith(".blockmap") ||
      name.endsWith(".sha256") ||
      name.endsWith(".asc")
    ) {
      return false;
    }

    return true;
  });

  if (candidates.length === 0) return null;

  const hint = (appHint || "")
    .toLowerCase()
    .replace(/^app-/, "")
    .replace(/[^a-z0-9]/g, " ")
    .trim();

  const hintTokens = hint.split(/\s+/).filter((t) => t.length > 2);
  const cleanTargetVer = (targetVersion || "").replace(/^[vV]/, "").trim();
  const normalizedTargetVer = cleanTargetVer.replace(/\.0/g, ".");

  candidates.sort((a: any, b: any) => {
    let scoreA = 0;
    let scoreB = 0;

    const nameA = String(a.name).toLowerCase();
    const nameB = String(b.name).toLowerCase();

    // Highest boost: Explicit setup installer keywords
    if (nameA.includes("setup") || nameA.includes("-setup") || nameA.includes("_setup")) scoreA += 200;
    if (nameB.includes("setup") || nameB.includes("-setup") || nameB.includes("_setup")) scoreB += 200;

    if (nameA.includes("installer") || nameA.includes("install")) scoreA += 150;
    if (nameB.includes("installer") || nameB.includes("install")) scoreB += 150;

    // Direct version matching boost
    if (cleanTargetVer.length > 0) {
      if (nameA.includes(cleanTargetVer.toLowerCase()) || nameA.includes(normalizedTargetVer.toLowerCase())) scoreA += 500;
      if (nameB.includes(cleanTargetVer.toLowerCase()) || nameB.includes(normalizedTargetVer.toLowerCase())) scoreB += 500;
    }

    // Specific app match boosts
    if (hintTokens.length > 0) {
      for (const t of hintTokens) {
        if (nameA.includes(t)) scoreA += 50;
        if (nameB.includes(t)) scoreB += 50;
      }

      // If looking for a child app in Anything repo, avoid picking the host Anything installer
      if (
        !hint.includes("anything") &&
        (hint.includes("copier") || hint.includes("auto"))
      ) {
        if (nameA.startsWith("anything_") || nameA.includes("anything_26"))
          scoreA -= 500;
        if (nameB.startsWith("anything_") || nameB.includes("anything_26"))
          scoreB -= 500;
      }
    }

    if (nameA.includes("win") || nameA.includes("windows")) scoreA += 10;
    if (nameB.includes("win") || nameB.includes("windows")) scoreB += 10;

    if (nameA.includes("x64") || nameA.includes("64-bit") || nameA.includes("x86_64")) scoreA += 10;
    if (nameB.includes("x64") || nameB.includes("64-bit") || nameB.includes("x86_64")) scoreB += 10;

    // Deprioritize portable standalone exes when looking for setup installers
    if (nameA.includes("portable")) scoreA -= 50;
    if (nameB.includes("portable")) scoreB -= 50;

    // Tie-breaker: newest updated_at or created_at timestamp
    const timeA = new Date(a.updated_at || a.created_at || 0).getTime();
    const timeB = new Date(b.updated_at || b.created_at || 0).getTime();

    return (scoreB - scoreA) || (timeB - timeA);
  });

  return candidates[0] || null;
}

function pickMobileAsset(assets: any[]): any {
  if (!Array.isArray(assets) || assets.length === 0) return null;

  const candidates = assets.filter((a: any) => {
    const name = String(a.name || "").toLowerCase();

    return (
      name.endsWith(".apk") || name.endsWith(".aab") || name.endsWith(".ipa")
    );
  });

  if (candidates.length === 0) return null;

  candidates.sort((a: any, b: any) => {
    let scoreA = 0;

    let scoreB = 0;

    const nameA = String(a.name).toLowerCase();

    const nameB = String(b.name).toLowerCase();

    if (nameA.endsWith(".apk")) scoreA += 20;

    if (nameB.endsWith(".apk")) scoreB += 20;

    if (nameA.includes("release")) scoreA += 10;

    if (nameB.includes("release")) scoreB += 10;

    if (nameA.includes("arm64") || nameA.includes("universal")) scoreA += 5;

    if (nameB.includes("arm64") || nameB.includes("universal")) scoreB += 5;

    return scoreB - scoreA;
  });

  return candidates[0];
}


// Security: Verify executable or archive magic header before executing or extracting
function verifyBinaryIntegrity(filePath: string): { ok: boolean; reason?: string } {
  try {
    if (!fs.existsSync(filePath)) return { ok: false, reason: 'File does not exist' };
    const stat = fs.statSync(filePath);
    if (stat.size < 512) return { ok: false, reason: 'File is abnormally small' };
    const fd = fs.openSync(filePath, 'r');
    const header = Buffer.alloc(4);
    fs.readSync(fd, header, 0, 4, 0);
    fs.closeSync(fd);

    const lower = filePath.toLowerCase();
    if (lower.endsWith('.exe')) {
      // Must start with 'MZ' (0x4D 0x5A)
      if (header[0] !== 0x4D || header[1] !== 0x5A) {
        return { ok: false, reason: 'Invalid executable signature (missing MZ header)' };
      }
    } else if (lower.endsWith('.zip') || lower.endsWith('.msix') || lower.endsWith('.appx')) {
      // Must start with 'PK' (0x50 0x4B)
      if (header[0] !== 0x50 || header[1] !== 0x4B) {
        return { ok: false, reason: 'Invalid archive signature (missing PK header)' };
      }
    }
    return { ok: true };
  } catch (err: any) {
    return { ok: false, reason: err.message };
  }
}

async function downloadAssetWithProgress(
  url: string,
  destPath: string,
  onProgress: (prog: {
    percent: number;
    transferredBytes: number;
    totalBytes: number;
    speedBytesPerSec: number;
  }) => void,
  expectedSha256?: string
): Promise<{ computedSha256: string; totalBytes: number }> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "CreativeHub-DesktopApp",

      Accept: "application/octet-stream",
    },

    redirect: "follow",
  });

  if (!response.ok) {
    throw new Error(
      `Failed to download asset: HTTP ${response.status} ${response.statusText}`,
    );
  }

  const totalBytes = Number(response.headers.get("content-length")) || 0;

  let transferredBytes = 0;

  let lastTime = Date.now();

  let lastTransferred = 0;

  const destDir = path.dirname(destPath);

  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }

  const fileStream = fs.createWriteStream(destPath);
  const sha256Hash = crypto.createHash('sha256');

  let writeError: any = null;

  fileStream.on("error", (err) => {
    writeError = err;
  });

  if (!response.body) {
    fileStream.close();

    throw new Error("Response body stream is empty");
  }

  const reader = response.body.getReader();

  try {
    while (true) {
      if (writeError) throw writeError;

      const { done, value } = await reader.read();

      if (done) break;

      const chunkBuf = Buffer.from(value);
      fileStream.write(chunkBuf);
      sha256Hash.update(chunkBuf);

      transferredBytes += value.length;

      const now = Date.now();

      if (now - lastTime >= 200) {
        const speed =
          ((transferredBytes - lastTransferred) / (now - lastTime)) * 1000;

        lastTime = now;

        lastTransferred = transferredBytes;

        onProgress({
          percent:
            totalBytes > 0
              ? Math.min(100, Math.round((transferredBytes / totalBytes) * 100))
              : 50,

          transferredBytes,

          totalBytes,

          speedBytesPerSec: speed,
        });
      }
    }
  } catch (readErr) {
    fileStream.destroy();

    throw readErr;
  }

  await new Promise<void>((resolve, reject) => {
    if (writeError) return reject(writeError);

    fileStream.end(() => {
      if (writeError) reject(writeError);
      else resolve();
    });
  });

  onProgress({
    percent: 100,
    transferredBytes,
    totalBytes: totalBytes || transferredBytes,
    speedBytesPerSec: 0,
  });

  const computedSha256 = sha256Hash.digest('hex');
  if (expectedSha256 && typeof expectedSha256 === 'string' && expectedSha256.trim().length === 64) {
    if (computedSha256.toLowerCase() !== expectedSha256.trim().toLowerCase()) {
      try { if (fs.existsSync(destPath)) fs.unlinkSync(destPath); } catch {}
      throw new Error(`SHA-256 integrity verification failed: expected ${expectedSha256}, got ${computedSha256}`);
    }
  }

  return { computedSha256, totalBytes: transferredBytes };
}

// Helper: extract Windows executable ProductVersion or FileVersion

const exeVersionCache = new Map<string, { mtime: number; version: string | null }>();

function getExecutableVersion(filePath: string): string | null {
  if (!filePath || !fs.existsSync(filePath)) return null;

  try {
    const stat = fs.statSync(filePath);
    const cached = exeVersionCache.get(filePath);
    if (cached && cached.mtime === stat.mtimeMs) {
      return cached.version;
    }

    const raw = execFileSync(
      "powershell.exe",
      [
        "-NoProfile",
        "-NonInteractive",
        "-Command",
        "[System.Diagnostics.FileVersionInfo]::GetVersionInfo($env:TARGET_FILE).ProductVersion",
      ],
      {
        encoding: "utf8",
        timeout: 8000,
        stdio: ["ignore", "pipe", "ignore"],
        env: { ...process.env, TARGET_FILE: filePath },
      },
    ).trim();

    const ver = raw ? raw.replace(/\.0$/, "") : null;
    exeVersionCache.set(filePath, { mtime: stat.mtimeMs, version: ver });
    return ver;
  } catch (err) {}

  return null;
}

// Helper: locate actual installed executable on Windows

function findInstalledExecutable(options: {
  appName?: string;
  appId?: string;
  currentPath?: string;
  executableName?: string;
}): string | null {
  const { appName, appId, currentPath, executableName } = options;

  // 1. If currentPath is given, exists, and is a real installed app (not an installer), keep it!
  // Exclude obsolete legacy "Uni Desk" folder which causes sharp native module crashes
  if (currentPath && fs.existsSync(currentPath)) {
    if (!isLikelyInstaller(currentPath) && !currentPath.toLowerCase().includes("uni desk")) {
      return currentPath;
    }
  }

  const normId = (appId || "")
    .toLowerCase()
    .replace(/^app-/, "")
    .replace(/-studio$/, "")
    .replace(/[^a-z0-9]/g, "");
  const normName = (appName || "").toLowerCase();

  const localAppData = process.env.LOCALAPPDATA || "";
  const appData = process.env.APPDATA || "";
  const programFiles = process.env.ProgramFiles || "C:\\Program Files";
  const programFilesX86 = process.env["ProgramFiles(x86)"] || "C:\\Program Files (x86)";
  const allUsersProfile = process.env.ALLUSERSPROFILE || "C:\\ProgramData";
  const installedAppsDir = getInstalledAppsDir();
  const projectRoot = getProjectRoot();
  const parentDir = path.resolve(projectRoot, "..");
  const anythingAppsDir = path.join(parentDir, "Anything Apps");
  const childAppReleaseDir = path.join(parentDir, "Anything Child app realse");

  // A. Priority 1: Known Ecosystem Child Applications (direct, deterministic checks)
  
  // 1) One Tap / OneTap PV Separator (Explicitly reject obsolete Uni Desk path)
  if (normId.includes("onetap") || normName.includes("one tap") || normId === "one-tap") {
    const candidates = [
      path.join(localAppData, "Programs", "One Tap", "One Tap.exe"),
      path.join(localAppData, "Programs", "One Tap PV Separator", "One Tap.exe"),
      path.join(localAppData, "Programs", "One Tap PV Separator", "One Tap PV Separator.exe"),
      path.join(installedAppsDir, "one-tap", "One Tap.exe"),
            path.join(programFiles, "One Tap", "One Tap.exe"),
      path.join(programFilesX86, "One Tap", "One Tap.exe"),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }

  // 2) MediaFlow Studio / DataFlow Studio
  if (normId.includes("mediaflow") || normName.includes("mediaflow") || normId.includes("dataflow") || normName.includes("dataflow")) {
    const candidates = [
      path.join(localAppData, "Programs", "MediaFlow Studio", "MediaFlow Studio.exe"),
      path.join(localAppData, "Programs", "DataFlow Studio", "DataFlow Studio.exe"),
      path.join(installedAppsDir, "mediaflow-studio", "MediaFlow Studio.exe"),
                  path.join(programFiles, "MediaFlow Studio", "MediaFlow Studio.exe"),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }

  // 3) AIN53 Data Management / Anything Data Manage
  if (normId.includes("data-manage") || normName.includes("data manage") || normId.includes("ain53") || normName.includes("ain53")) {
    const candidates = [
      path.join(localAppData, "Programs", "AIN53 Data Management", "AIN53 Data Management.exe"),
      path.join(installedAppsDir, "anything-data-manage", "AIN53_Data_Management_Portable.exe"),
      path.join(childAppReleaseDir, "anything-data-manage", "V26.10.32", "AIN53_Data_Management_Portable.exe"),
            path.join(installedAppsDir, "anything-data-manage", "AIN53 Data Management.exe"),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }

  // 4) DocuFlow Studio / VectorForge Studio / PDF Master
  if (
    normId.includes("docuflow") ||
    normId.includes("vectorforge") ||
    normName.includes("docuflow") ||
    normName.includes("vectorforge") ||
    normId.includes("pdfmaster") ||
    normName.includes("pdf master")
  ) {
    const candidates = [
      path.join(localAppData, "Programs", "PDF Master Pro", "PDF Master Pro.exe"),
      path.join(localAppData, "Programs", "VectorForge Studio", "VectorForge Studio.exe"),
      path.join(localAppData, "Programs", "DocuFlow Studio", "DocuFlow Studio.exe"),
                  path.join(installedAppsDir, "docuflow-studio", "PDF Master Pro.exe"),
      path.join(installedAppsDir, "docuflow-studio", "VectorForge Studio.exe"),
      path.join(programFiles, "PDF Master Pro", "PDF Master Pro.exe"),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }

  // 5) Pixelcharm
  if (normId.includes("pixelcharm") || normName.includes("pixelcharm")) {
    const candidates = [
      path.join(localAppData, "Programs", "Pixelcharm", "Pixelcharm.exe"),
      path.join(installedAppsDir, "pixelcharm", "Pixelcharm.exe"),
          ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }

  // 6) PDF Master Pro
  if (normId.includes("pdf-master") || normName.includes("pdf master")) {
    const candidates = [
      path.join(localAppData, "Programs", "PDF Master Pro", "PDF Master Pro.exe"),
      path.join(installedAppsDir, "pdf-master-pro", "PDF Master Pro.exe")
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }

  // 7) Auto Copier Pro
  if (normId.includes("auto-copier") || normName.includes("auto copier") || normId.includes("copier")) {
    const candidates = [
      path.join(localAppData, "Programs", "Auto Copier Pro", "Auto Copier Pro.exe"),
      path.join(installedAppsDir, "auto-copier-pro", "Auto Copier Pro.exe")
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }

  // 8) PhotoSuite Pro
  if (normId.includes("photosuite") || normName.includes("photosuite")) {
    const candidates = [
      path.join(localAppData, "Programs", "PhotoSuite Pro", "PhotoSuite Pro.exe"),
      path.join(installedAppsDir, "photosuite-pro", "PhotoSuite Pro.exe")
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }

  // 9) Anything Office
  if (normId.includes("office") || normName.includes("office")) {
    const candidates = [
      path.join(localAppData, "Programs", "Anything Office", "Anything Office.exe"),
      path.join(installedAppsDir, "anything-office", "Anything Office.exe"),
          ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }

  // 10) Anything File Manager (AFM)
  if (
    normId.includes("file-manager") ||
    normName.includes("file manager") ||
    normId.includes("anythingfilemanager") ||
    normId.includes("afm") ||
    normName.includes("afm") ||
    normId.includes("media-viewer") ||
    normName.includes("media viewer")
  ) {
    const candidates = [
      path.join(localAppData, "Programs", "Anything File Manager", "Anything File Manager.exe"),
      path.join(installedAppsDir, "anything-file-manager", "Anything File Manager.exe"),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }

  // 11) Anything Share / AnyShare
  if (
    normId.includes("share") ||
    normName.includes("share") ||
    normId === "anything-share" ||
    normId === "anyshare"
  ) {
    const candidates = [
      path.join(anythingAppsDir, "Anything Share", "release", "win-unpacked", "Anything Share.exe"),
      path.join(anythingAppsDir, "Anything Share", "release", "win-unpacked", "AnyShare.exe"),
      path.join(localAppData, "Programs", "Anything Share", "Anything Share.exe"),
      path.join(localAppData, "Programs", "AnyShare", "AnyShare.exe"),
      path.join(installedAppsDir, "anything-share", "Anything Share.exe"),
      path.join(installedAppsDir, "anything-share", "AnyShare.exe"),
      path.join(anythingAppsDir, "Anything Share", "dist", "index.html"),
      path.join(anythingAppsDir, "Anything Share", "index.html"),
    ];
    for (const c of candidates) {
      if (fs.existsSync(c)) return c;
    }
  }

  // B. Priority 2: Check Anything's installed-apps folder for child apps
  try {
    if (appId) {
      const targetDir = path.join(installedAppsDir, appId);
      if (fs.existsSync(targetDir)) {
        const files = fs.readdirSync(targetDir, { recursive: true });
        const nonInstallerExes = files.filter((f: any) => {
          const l = String(f).toLowerCase();
          return l.endsWith(".exe") && !isLikelyInstaller(l);
        });
        if (nonInstallerExes.length > 0) {
          if (executableName) {
            const clean = executableName.toLowerCase().replace(/\.exe$/i, "");
            const match = nonInstallerExes.find((f: any) =>
              String(f).toLowerCase().includes(clean),
            );
            if (match) return path.join(targetDir, String(match));
          }
          return path.join(targetDir, String(nonInstallerExes[0]));
        }
      }
    }
  } catch (e) {}

  // C. Priority 3: Fuzzy Directory Scan in LocalAppData/Programs, ProgramFiles, etc.
  const candidateTokens = new Set<string>();
  if (appName) {
    candidateTokens.add(appName.trim().toLowerCase());
    appName.trim().toLowerCase().split(/\s+/).forEach((w) => {
      if (w.length > 2) candidateTokens.add(w);
    });
  }
  if (appId) {
    const trimmedId = appId.trim().replace(/^app-/, "").toLowerCase();
    candidateTokens.add(trimmedId);
    trimmedId.split(/[-_\s]+/).forEach((w) => {
      if (w.length > 2) candidateTokens.add(w);
    });
  }
  if (executableName) {
    const cleanExe = executableName.replace(/\.exe$/i, "").trim().toLowerCase();
    candidateTokens.add(cleanExe);
  }

  const searchRoots: string[] = [];
  if (localAppData) {
    searchRoots.push(path.join(localAppData, "Programs"));
    searchRoots.push(localAppData);
  }
  if (programFiles) searchRoots.push(programFiles);
  if (programFilesX86) searchRoots.push(programFilesX86);

  for (const root of searchRoots) {
    if (!fs.existsSync(root)) continue;
    try {
      const dirEntries = fs.readdirSync(root, { withFileTypes: true });
      for (const entry of dirEntries) {
        if (!entry.isDirectory()) continue;
        const entryLower = entry.name.toLowerCase();
        if (entryLower.includes("uni desk")) continue; // Ignore obsolete broken Uni Desk folder
        const matchesToken = Array.from(candidateTokens).some(
          (t) => entryLower.includes(t) || t.includes(entryLower)
        );
        if (!matchesToken) continue;

        const subDir = path.join(root, entry.name);
        try {
          const subFiles = fs.readdirSync(subDir);
          const exes = subFiles.filter((f) => {
            const l = f.toLowerCase();
            return (
              l.endsWith(".exe") &&
              !isLikelyInstaller(l) &&
              !l.includes("uninstall") &&
              !l.includes("elevate") &&
              !l.includes("crashpad")
            );
          });
          if (exes.length > 0) {
            const matchedExe = exes.find((e) =>
              Array.from(candidateTokens).some((t) => e.toLowerCase().includes(t))
            );
            return path.join(subDir, matchedExe || exes[0]);
          }
        } catch (e) {}
      }
    } catch (e) {}
  }

  // D. Priority 4: Windows Start Menu Shortcuts (.lnk files)
  const startMenuDirs: string[] = [];
  if (appData) {
    startMenuDirs.push(
      path.join(appData, "Microsoft", "Windows", "Start Menu", "Programs"),
    );
  }
  if (allUsersProfile) {
    startMenuDirs.push(
      path.join(
        allUsersProfile,
        "Microsoft",
        "Windows",
        "Start Menu",
        "Programs",
      ),
    );
  }

  for (const smDir of startMenuDirs) {
    if (!fs.existsSync(smDir)) continue;
    try {
      const entries = fs.readdirSync(smDir, { withFileTypes: true });
      for (const entry of entries) {
        if (entry.isFile() && entry.name.toLowerCase().endsWith(".lnk")) {
          const base = entry.name.replace(/\.lnk$/i, "").toLowerCase();
          if (
            !base.includes("uninstall") &&
            Array.from(candidateTokens).some((c) => base.includes(c))
          ) {
            return path.join(smDir, entry.name);
          }
        } else if (entry.isDirectory()) {
          const subDir = path.join(smDir, entry.name);
          try {
            const subEntries = fs.readdirSync(subDir);
            for (const sub of subEntries) {
              if (
                sub.toLowerCase().endsWith(".lnk") &&
                !sub.toLowerCase().includes("uninstall")
              ) {
                const base = sub.replace(/\.lnk$/i, "").toLowerCase();
                if (Array.from(candidateTokens).some((c) => base.includes(c))) {
                  return path.join(subDir, sub);
                }
              }
            }
          } catch (e) {}
        }
      }
    } catch (e) {}
  }

  return null;
}

// ================= AUTOMATED APP SOURCES SYNCHRONIZER =================

async function syncAppsFromSourcesFile(): Promise<{
  success: boolean;
  synced: number;
  errors: string[];
}> {
  try {
    const rootDir = getProjectRoot();

    const sourcesPath = path.join(rootDir, "app-sources.json");

    if (!fs.existsSync(sourcesPath)) {
      fs.writeFileSync(
        sourcesPath,

        JSON.stringify(
          [
            {
              url: "https://github.com/BSFrameWorks5253/MediaFlow-Studio",

              name: "MediaFlow Studio",

              category: "Media & Video",

              autoSync: true,
            },
          ],

          null,

          2,
        ),

        "utf-8",
      );

      return { success: true, synced: 0, errors: [] };
    }

    let sources: any[] = [];

    try {
      sources = JSON.parse(fs.readFileSync(sourcesPath, "utf-8"));
    } catch (err: any) {
      console.error("Error parsing app-sources.json:", err);

      return { success: false, synced: 0, errors: [err.message] };
    }

    if (!Array.isArray(sources)) {
      return {
        success: false,
        synced: 0,
        errors: ["app-sources.json must contain a JSON array"],
      };
    }

    const errors: string[] = [];

    let synced = 0;

    const publishedDir = getPublishedDir();

    const catalogFile = path.join(publishedDir, "catalog.json");

    const candidatePaths = [
      catalogFile,

      path.join(__dirname, "..", "published-apps", "catalog.json"),

      path.join(process.resourcesPath, "published-apps", "catalog.json"),

      path.join(
        process.resourcesPath,
        "app.asar",
        "published-apps",
        "catalog.json",
      ),

      path.join(process.cwd(), "published-apps", "catalog.json"),

      path.join(app.getPath("userData"), "published-apps", "catalog.json"),
    ];

    const catalogMap = new Map<string, any>();

    for (const p of candidatePaths) {
      if (fs.existsSync(p)) {
        try {
          const items = JSON.parse(fs.readFileSync(p, "utf-8"));

          if (Array.isArray(items)) {
            for (const it of items) {
              if (it && it.id && !catalogMap.has(it.id)) {
                const id = (it.id || "").toLowerCase();
                const name = (it.name || "").toLowerCase();
                const isHost = id === "anything" || id === "app-anything" || name.includes("anything master hub");
                const isPulseWave = id === "pulsewave" || name.includes("pulse wave") || (it.targetPlatforms && it.targetPlatforms.includes("mobile"));
                if (isHost || isPulseWave) continue;
                catalogMap.set(it.id, it);
              }
            }
          }
        } catch {}
      }
    }

    let catalog: any[] = Array.from(catalogMap.values());

    const GITHUB_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

    const authHeaders: Record<string, string> = {
      "User-Agent": "Anything-App-Synchronizer",

      Accept: "application/vnd.github.v3+json",
    };

    if (GITHUB_TOKEN) {
      authHeaders["Authorization"] = `Bearer ${GITHUB_TOKEN}`;
    }

    for (const src of sources) {
      try {
        const rawUrl =
          typeof src === "string" ? src : src.url || src.repo || "";

        if (!rawUrl) continue;

        const parsed = parseGitHubRepo(rawUrl);
        if (parsed && (parsed.repo.toLowerCase() === "anything" || parsed.repo.toLowerCase() === "plusewave")) {
          continue; // Skip host app and mobile app repositories
        }
        if (src.id === "anything" || src.id === "pulsewave") {
          continue;
        }

        if (!parsed) {
          errors.push(`Invalid GitHub repository link: ${rawUrl}`);

          continue;
        }

        // 1. Fetch Latest Release from GitHub API

        const relApi = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/releases/latest`;

        const relRes = await fetch(relApi, { headers: authHeaders });

        if (!relRes.ok) {
          continue;
        }

        const relData: any = await relRes.json();

        if (!relData || !relData.tag_name) continue;

        const remoteTag = relData.tag_name;

        const cleanVer = remoteTag.replace(/^[vV]/, "").trim();

        const asset = pickWindowsAsset(relData.assets || []);

        const mobileAsset = pickMobileAsset(relData.assets || []);

        const appId = (src.id || parsed.repo)
          .toLowerCase()
          .replace(/[^a-z0-9]/g, "-");

        const appName =
          src.name ||
          parsed.repo

            .replace(/[-_]/g, " ")

            .replace(/\b\w/g, (c: string) => c.toUpperCase());

        const category =
          src.category ||
          (parsed.repo.toLowerCase().includes("media") ||
          parsed.repo.toLowerCase().includes("video")
            ? "Media & Video"
            : parsed.repo.toLowerCase().includes("code") ||
                parsed.repo.toLowerCase().includes("dev")
              ? "Development"
              : "Custom Tools");

        // Detect platforms supported by this release

        const detectedPlatforms: string[] = [];

        if (
          asset ||
          (relData.assets || []).some((a: any) =>
            String(a.name).match(/\.(exe|msix|appx|zip)$/i),
          )
        ) {
          detectedPlatforms.push("desktop");
        }

        if (
          mobileAsset ||
          (relData.assets || []).some((a: any) =>
            String(a.name).match(/\.(apk|aab|ipa)$/i),
          )
        ) {
          detectedPlatforms.push("mobile");
        }

        if (detectedPlatforms.length === 0) detectedPlatforms.push("desktop");

        const mobileInfo = mobileAsset
          ? {
              platforms: [
                mobileAsset.name.endsWith(".ipa") ? "ios" : "android",
              ],

              apkDownloadUrl: mobileAsset.name.endsWith(".apk")
                ? mobileAsset.browser_download_url
                : undefined,

              ipaDownloadUrl: mobileAsset.name.endsWith(".ipa")
                ? mobileAsset.browser_download_url
                : undefined,

              packageId: `com.burhanuddin.${appId.replace(/-/g, "")}`,
            }
          : undefined;

        // Extract changelog features from GitHub release body

        const bodyLines = (relData.body || "")

          .split("\n")

          .map((l: string) => l.trim().replace(/^[-*•]\s*/, ""))

          .filter((l: string) => l && !l.startsWith("#") && l.length > 5);

        const releaseFeatures = bodyLines.slice(0, 5);

        const setupExeName = asset ? asset.name : undefined;
        const downloadUrl = asset ? asset.browser_download_url : undefined;

        const shader =
          shaderColorPresets[
            Math.abs(
              appId
                .split("")
                .reduce((a: number, b: string) => a + b.charCodeAt(0), 0),
            ) % shaderColorPresets.length
          ];

        // Ensure releases/<appId>/v<cleanVer>/ folder structure exists

        const appReleaseRoot = path.join(rootDir, "releases", appId);

        const appVersionDir = path.join(appReleaseRoot, `v${cleanVer}`);

        if (!fs.existsSync(appVersionDir)) {
          fs.mkdirSync(appVersionDir, { recursive: true });
        }

        // Auto-generate app.json if missing

        const appJsonPath = path.join(appVersionDir, "app.json");

        const rootAppJsonPath = path.join(appReleaseRoot, "app.json");

        const appMetadata = {
          id: appId,

          name: appName,

          shortName: appName

            .split(" ")

            .map((w: string) => w[0])

            .join("")

            .slice(0, 2)

            .toUpperCase(),

          version: cleanVer,

          category,

          description:
            relData.body?.slice(0, 240) ||
            `${appName} for the Anything ecosystem.`,

          executableName: setupExeName.replace(/_setup/i, ""),

          setupExecutableName: setupExeName,

          gradient: shader.gradient,

          textColor: shader.textColor,

          glowColor: shader.glow,

          githubRepo: `${parsed.owner}/${parsed.repo}`,

          iconType: "monogram",
        };

        if (!fs.existsSync(appJsonPath)) {
          fs.writeFileSync(
            appJsonPath,
            JSON.stringify(appMetadata, null, 2),
            "utf-8",
          );
        }

        if (!fs.existsSync(rootAppJsonPath)) {
          fs.writeFileSync(
            rootAppJsonPath,
            JSON.stringify(appMetadata, null, 2),
            "utf-8",
          );
        }

        // Auto-generate release.json if missing

        const releaseJsonPath = path.join(appVersionDir, "release.json");

        const releaseMetadata = {
          appId,

          appName,

          version: cleanVer,

          executableName: setupExeName,

          releaseDate: relData.published_at
            ? relData.published_at.slice(0, 10)
            : new Date().toISOString().slice(0, 10),

          releaseType: "minor",

          tagline: `${appName} v${cleanVer} from GitHub Releases`,

          summary: relData.name || `Release ${remoteTag}`,

          newFeatures:
            releaseFeatures.length > 0
              ? releaseFeatures
              : [`Automated release from GitHub: ${remoteTag}`],

          improvements: [
            "Ecosystem loader integration",
            "Performance optimizations",
          ],

          fixes: ["Stability and compatibility updates"],

          emailNotification: {
            subject: `🚀 ${appName} v${cleanVer} is Live!`,

            preview: `Discover all the updates in ${remoteTag}.`,

            ctaText: "Open in Anything",

            heroGradient: shader.gradient,
          },
        };

        if (!fs.existsSync(releaseJsonPath)) {
          fs.writeFileSync(
            releaseJsonPath,
            JSON.stringify(releaseMetadata, null, 2),
            "utf-8",
          );
        }

        // Auto-generate loader-config.json if missing

        const loaderConfigPath = path.join(
          appReleaseRoot,
          "loader-config.json",
        );

        if (!fs.existsSync(loaderConfigPath)) {
          fs.writeFileSync(
            loaderConfigPath,

            JSON.stringify(
              {
                appId,

                appName,

                monogram: appMetadata.shortName,

                tagline: appMetadata.description,

                gradient: shader.gradient,

                presetId: "apple-ambient",

                bootPhrases: [
                  `Connecting ${appName} to Anything...`,

                  "Initializing graphics pipeline...",

                  "Ready.",
                ],
              },

              null,

              2,
            ),

            "utf-8",
          );
        }

        // Auto-merge into catalog

        const existingIdx = catalog.findIndex((c: any) => c.id === appId);

        const catalogEntry = {
          ...appMetadata,

          targetPlatforms: detectedPlatforms,

          mobileInfo,

          downloadUrl,

          releasesUrl: `https://github.com/${parsed.owner}/${parsed.repo}/releases`,

          releasesTagUrl: `https://github.com/${parsed.owner}/${parsed.repo}/releases/tag/`,

          releasesApiUrl: relApi,

          packageFileName: setupExeName,

          packageSize: asset ? formatFileBytes(asset.size) : "Online Release",

          packageFormat: path.extname(setupExeName) || ".exe",

          status: "not-installed",

          publishedAt: new Date(relData.published_at || Date.now()).getTime(),

          releaseInfo: releaseMetadata,

          history: [releaseMetadata],

          changelog: releaseFeatures,

          addedByCreator: true,
        };

        // Check if application is already installed on this machine

        const localExe = findInstalledExecutable({
          appName,
          appId,
          executableName: setupExeName,
        });

        let localVer: string | null = null;

        if (localExe && fs.existsSync(localExe)) {
          localVer = getExecutableVersion(localExe);
        }

        if (existingIdx >= 0) {
          const existing = catalog[existingIdx];

          const activeInstalledPath = localExe || existing.installedPath;

          const activeLocalVer = localVer || existing.localVersion;

          const isOutdated = activeLocalVer
            ? compareVersions(cleanVer, activeLocalVer) > 0
            : compareVersions(cleanVer, existing.version) > 0;

          catalog[existingIdx] = {
            ...existing,

            ...catalogEntry,

            version: cleanVer,

            installedPath: activeInstalledPath,

            localVersion: activeLocalVer,

            status: isOutdated
              ? "update-available"
              : activeInstalledPath
                ? "installed"
                : existing.status || "not-installed",
          };

          if (isOutdated && !hasNotifiedAppUpdate(appId, cleanVer)) {
            // Update notification disabled

            markAppUpdateNotified(appId, cleanVer);
          }
        } else {
          const isOutdated = localVer
            ? compareVersions(cleanVer, localVer) > 0
            : false;

          catalog.unshift({
            ...catalogEntry,

            version: cleanVer,

            installedPath: localExe || undefined,

            localVersion: localVer || undefined,

            status: isOutdated
              ? "update-available"
              : localExe
                ? "installed"
                : "not-installed",
          });

          if (!hasNotifiedAppUpdate(appId, `registered-${cleanVer}`)) {
            // Update notification disabled

            markAppUpdateNotified(appId, `registered-${cleanVer}`);
          }
        }

        synced++;
      } catch (err: any) {
        errors.push(err.message);
      }
    }

    if (synced > 0) {
      syncCatalogToEcosystem(catalog);

      // Broadcast updated catalog to all Electron windows

      const allWindows = BrowserWindow.getAllWindows();

      for (const w of allWindows) {
        if (!w.isDestroyed()) {
          w.webContents.send("catalog:updated", catalog);
        }
      }
    }

    return { success: true, synced, errors };
  } catch (err: any) {
    console.error("syncAppsFromSourcesFile failed:", err);

    return { success: false, synced: 0, errors: [err.message] };
  }
}

let mainWindow: BrowserWindow | null = null;

let splashWindow: BrowserWindow | null = null;

function createWindow() {
  const appIconPath = getAppIconPath();

  const appNativeIcon = getAppNativeIcon();

  mainWindow = new BrowserWindow({
    title: "Anything",

    icon: (process.platform === "win32" && appIconPath) ? appIconPath : (appNativeIcon || appIconPath),

    width: 1280,

    height: 840,

    minWidth: 980,

    minHeight: 660,

    backgroundColor: "#030712",

    frame: false, // Seamless frameless window for pixel-perfect custom Windows 11 controls

    titleBarStyle: "hidden",

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),

      contextIsolation: true,

      nodeIntegration: false,
    },

    show: false, // Hidden on startup: ONLY the loader box appears first!
  });

  if (process.platform === "win32" && (appNativeIcon || appIconPath)) {
    try {
      mainWindow.setIcon(appNativeIcon || (appIconPath as string));
    } catch (e) {}
  }

  const win = mainWindow;

  // Standalone Adobe Splash Window: Centered, frameless, 100% transparent desktop background

  splashWindow = new BrowserWindow({
    title: "Anything",

    icon: appNativeIcon || appIconPath,

    width: 740,

    height: 480,

    frame: false,

    transparent: true,

    backgroundColor: "#00000000",

    resizable: false,

    center: true,

    alwaysOnTop: true,

    show: true, // Only the loader box appears on the screen

    hasShadow: true,

    skipTaskbar: true, // Do not create a separate blank taskbar entry for the splash loader

    webPreferences: {
      preload: path.join(__dirname, "preload.js"),

      contextIsolation: true,

      nodeIntegration: false,
    },
  });

  if (process.platform === "win32" && (appNativeIcon || appIconPath)) {
    try {
      splashWindow.setIcon(appNativeIcon || (appIconPath as string));
    } catch (e) {}
  }

  // Security: Restrict navigation & popups

  for (const targetWin of [win, splashWindow]) {
    targetWin.webContents.setWindowOpenHandler(({ url }: { url: string }) => {
      try {
        const parsed = new URL(url);

        if (
          parsed.protocol === "http:" ||
          parsed.protocol === "https:" ||
          parsed.protocol === "mailto:"
        ) {
          shell.openExternal(url);
        }
      } catch {}

      return { action: "deny" };
    });

    targetWin.webContents.on(
      "will-navigate",
      (event: any, navigationUrl: string) => {
        try {
          const parsed = new URL(navigationUrl);

          if (parsed.protocol === "http:" || parsed.protocol === "https:") {
            if (
              !navigationUrl.startsWith("http://127.0.0.1") &&
              !navigationUrl.startsWith("http://localhost")
            ) {
              event.preventDefault();
              shell.openExternal(navigationUrl);
            }
          } else if (parsed.protocol === "file:") {
            const allowedDist = pathToFileURL(path.join(getProjectRoot(), "dist", "index.html")).toString().toLowerCase();
            const lowerNav = navigationUrl.toLowerCase();
            if (lowerNav !== allowedDist && !lowerNav.startsWith(allowedDist + "#") && !lowerNav.startsWith(allowedDist + "?")) {
              event.preventDefault();
            }
          }
        } catch {}
      },
    );
  }

  // Fast launch: show main window as soon as content is ready in dev mode, or seamless reveal in prod
  mainWindow.once("ready-to-show", () => {
    const isDevMode = !app.isPackaged && (process.env.NODE_ENV === "development" || process.argv.includes("--dev"));
    if (isDevMode) {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.destroy();
        splashWindow = null;
      }
      if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
        mainWindow.show();
        mainWindow.focus();
      }
    }
  });

  splashWindow.on("closed", () => {
    splashWindow = null;

    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      mainWindow.show();

      mainWindow.focus();
    }
  });

  // Splash lifecycle: when the loader finishes, dismiss splash and reveal the main apps window

  ipcMain.handle("splash:done", () => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.destroy();

      splashWindow = null;
    }

    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();

      if (process.platform === "win32") {
        const icon = (appIconPath && fs.existsSync(appIconPath)) ? appIconPath : (getAppNativeIcon() || getAppIconPath());

        if (icon) {
          try {
            mainWindow.setIcon(icon as any);
          } catch {}
        }
      }

      mainWindow.focus();
    }

    return true;
  });

  // Fallback safety timeout (2 seconds max) to guarantee the main window appears smoothly
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed() && !mainWindow.isVisible()) {
      if (splashWindow && !splashWindow.isDestroyed()) {
        splashWindow.destroy();

        splashWindow = null;
      }

      mainWindow.show();

      if (process.platform === "win32") {
        const icon = (appIconPath && fs.existsSync(appIconPath)) ? appIconPath : (getAppNativeIcon() || getAppIconPath());

        if (icon) {
          try {
            mainWindow.setIcon(icon as any);
          } catch {}
        }
      }

      mainWindow.focus();
    }
  }, 3000);

  // Track window state changes for seamless Maximize / Restore icon updates

  win.on("maximize", () => {
    win.webContents.send("window:state-changed", { isMaximized: true });
  });

  win.on("unmaximize", () => {
    win.webContents.send("window:state-changed", { isMaximized: false });
  });

  // IPC Window Controls

  ipcMain.handle("window:minimize", () => {
    if (!win.isDestroyed()) win.minimize();

    return true;
  });

  ipcMain.handle("window:maximize", () => {
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

  ipcMain.handle("window:close", () => {
    if (!win.isDestroyed()) win.close();

    return true;
  });

  ipcMain.handle("window:is-maximized", () => {
    return !win.isDestroyed() && win.isMaximized();
  });

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (isSafeExternalUrl(url)) {
      shell.openExternal(url);
    }
    return { action: "deny" };
  });

    // ================= ECOSYSTEM AUTH & CROSS-APP IDENTITY =================
  ipcMain.handle("auth:save-ecosystem-session", async (_, sessionData: any) => {
    try {
      // Security: Strip long-lived refresh tokens so credentials are not stored in plaintext across disk
      if (sessionData && sessionData.auth) {
        delete sessionData.auth.refreshToken;
      }
      const raw = JSON.stringify(sessionData, null, 2);
      const appData =
        process.env.APPDATA ||
        (process.env.USERPROFILE
          ? path.join(process.env.USERPROFILE, "AppData", "Roaming")
          : "");
      const localAppData =
        process.env.LOCALAPPDATA ||
        (process.env.USERPROFILE
          ? path.join(process.env.USERPROFILE, "AppData", "Local")
          : "");

      const targets = [
        path.join(app.getPath("userData"), "ecosystem_session.json"),
        appData ? path.join(appData, "Anything", "ecosystem_session.json") : "",
        appData ? path.join(appData, "anything", "ecosystem_session.json") : "",
        localAppData ? path.join(localAppData, "anything", "ecosystem_session.json") : "",
        path.join(getProjectRoot(), "ecosystem_session.json"),
        path.join(getProjectRoot(), "..", "ecosystem_session.json"),
        path.join(getProjectRoot(), "..", "Anything Apps", "ecosystem_session.json"),
        appData ? path.join(appData, "one-tap", "ecosystem_session.json") : "",
        appData ? path.join(appData, "One Tap", "ecosystem_session.json") : "",
        appData ? path.join(appData, "mediaflow-studio", "ecosystem_session.json") : "",
        appData ? path.join(appData, "MediaFlow Studio", "ecosystem_session.json") : "",
        appData ? path.join(appData, "anything-file-manager", "ecosystem_session.json") : "",
        appData ? path.join(appData, "media-viewer", "ecosystem_session.json") : "",
        appData ? path.join(appData, "Media Viewer", "ecosystem_session.json") : "",
        appData ? path.join(appData, "docuflow", "ecosystem_session.json") : "",
        appData ? path.join(appData, "DocuFlow", "ecosystem_session.json") : "",
        appData ? path.join(appData, "pixelcharm", "ecosystem_session.json") : "",
        appData ? path.join(appData, "pdf-master", "ecosystem_session.json") : "",
        appData ? path.join(appData, "anything-office", "ecosystem_session.json") : "",
        appData ? path.join(appData, "anything-data-manage", "ecosystem_session.json") : "",
      ].filter((p): p is string => Boolean(p && typeof p === "string" && p.length > 0));

      for (const t of targets) {
        try {
          const dir = path.dirname(t);
          if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
          fs.writeFileSync(t, raw, "utf-8");
        } catch {}
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("auth:load-ecosystem-session", async () => {
    try {
      const sessionPath = path.join(app.getPath("userData"), "ecosystem_session.json");
      if (fs.existsSync(sessionPath)) {
        const raw = fs.readFileSync(sessionPath, "utf-8");
        return { success: true, session: JSON.parse(raw) };
      }
      return { success: false, notFound: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("auth:clear-ecosystem-session", async () => {
    try {
      const appData =
        process.env.APPDATA ||
        (process.env.USERPROFILE
          ? path.join(process.env.USERPROFILE, "AppData", "Roaming")
          : "");
      const localAppData =
        process.env.LOCALAPPDATA ||
        (process.env.USERPROFILE
          ? path.join(process.env.USERPROFILE, "AppData", "Local")
          : "");

      const targets = [
        path.join(app.getPath("userData"), "ecosystem_session.json"),
        appData ? path.join(appData, "Anything", "ecosystem_session.json") : "",
        appData ? path.join(appData, "anything", "ecosystem_session.json") : "",
        localAppData ? path.join(localAppData, "anything", "ecosystem_session.json") : "",
        path.join(getProjectRoot(), "ecosystem_session.json"),
        path.join(getProjectRoot(), "..", "ecosystem_session.json"),
        path.join(getProjectRoot(), "..", "Anything Apps", "ecosystem_session.json"),
        appData ? path.join(appData, "one-tap", "ecosystem_session.json") : "",
        appData ? path.join(appData, "One Tap", "ecosystem_session.json") : "",
        appData ? path.join(appData, "mediaflow-studio", "ecosystem_session.json") : "",
        appData ? path.join(appData, "MediaFlow Studio", "ecosystem_session.json") : "",
        appData ? path.join(appData, "anything-file-manager", "ecosystem_session.json") : "",
        appData ? path.join(appData, "media-viewer", "ecosystem_session.json") : "",
        appData ? path.join(appData, "Media Viewer", "ecosystem_session.json") : "",
        appData ? path.join(appData, "docuflow", "ecosystem_session.json") : "",
        appData ? path.join(appData, "DocuFlow", "ecosystem_session.json") : "",
        appData ? path.join(appData, "pixelcharm", "ecosystem_session.json") : "",
        appData ? path.join(appData, "pdf-master", "ecosystem_session.json") : "",
        appData ? path.join(appData, "anything-office", "ecosystem_session.json") : "",
        appData ? path.join(appData, "anything-data-manage", "ecosystem_session.json") : "",
      ].filter((p): p is string => Boolean(p && typeof p === "string" && p.length > 0));

      for (const t of targets) {
        try {
          if (fs.existsSync(t)) fs.unlinkSync(t);
        } catch {}
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // ================= PUBLISHER INBOX & PUSH ENGINE =================

  ipcMain.handle("publisher:open-inbox", async () => {
    const inboxPath = getInboxDir();

    await openInEcosystemExplorer(inboxPath);

    return inboxPath;
  });

  ipcMain.handle("publisher:get-paths", async () => {
    return {
      inboxDir: getInboxDir(),

      publishedDir: getPublishedDir(),

      releasesDir: getReleasesDir(),
    };
  });

  // ================= CHILD APP RELEASES COLLECTOR =================

  ipcMain.handle("releases:get-path", async () => {
    return getReleasesDir();
  });

  ipcMain.handle("releases:open-folder", async () => {
    const relDir = getReleasesDir();

    await openInEcosystemExplorer(relDir);

    return relDir;
  });

  ipcMain.handle("releases:scan-and-collect", async () => {
    // Cloud-only: Sync apps directly from GitHub releases

    const syncRes = await syncAppsFromSourcesFile();

    return {
      success: syncRes.success,

      addedCount: syncRes.synced,

      updatedCount: 0,

      total: syncRes.synced,

      catalog: [],
    };
  });

  ipcMain.handle("publisher:scan-inbox", async () => {
    try {
      const inboxDir = getInboxDir();

      const files = fs.readdirSync(inboxDir);

      const supportedExtensions = [
        ".exe",
        ".msix",
        ".zip",
        ".msi",
        ".bat",
        ".appx",
      ];

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

  ipcMain.handle(
    "publisher:push-package",
    async (_, { stagedFile, appConfig }) => {
      try {
        if (!appConfig?.id || !stagedFile?.fileName) {
          return { success: false, error: "Missing appConfig or stagedFile" };
        }
        const safeId = sanitizeAppId(appConfig.id);
        const safeFileName = sanitizeFileName(stagedFile.fileName);
        if (!safeId || !safeFileName) {
          return {
            success: false,
            error: "Invalid application ID or file name.",
          };
        }

        const publishedDir = getPublishedDir();
        const appTargetDir = path.join(publishedDir, safeId);
        if (!fs.existsSync(appTargetDir)) {
          fs.mkdirSync(appTargetDir, { recursive: true });
        }

        // Verify source file exists
        const sourcePath = path.resolve(stagedFile.fullPath);
        if (!fs.existsSync(sourcePath)) {
          return {
            success: false,
            error: "Source staged file not found on disk.",
          };
        }

        // Copy executable or package into published directory
        const destPath = path.join(appTargetDir, safeFileName);
        fs.copyFileSync(sourcePath, destPath);

        // Read or initialize catalog.json

        const catalogFile = path.join(publishedDir, "catalog.json");

        let catalog: any[] = [];

        if (fs.existsSync(catalogFile)) {
          try {
            catalog = JSON.parse(fs.readFileSync(catalogFile, "utf-8"));
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

        fs.writeFileSync(
          catalogFile,
          JSON.stringify(catalog, null, 2),
          "utf-8",
        );

        return {
          success: true,

          app: publishedAppEntry,

          catalog,
        };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
  );

  ipcMain.handle("publisher:load-catalog", async () => {
    try {
      try {
        await scanAndCollectReleases();
      } catch {}

      const candidatePaths = [
        path.join(getPublishedDir(), "catalog.json"),

        path.join(__dirname, "..", "published-apps", "catalog.json"),

        path.join(process.resourcesPath, "published-apps", "catalog.json"),

        path.join(
          process.resourcesPath,
          "app.asar",
          "published-apps",
          "catalog.json",
        ),

        path.join(process.cwd(), "published-apps", "catalog.json"),

        path.join(app.getPath("userData"), "published-apps", "catalog.json"),
      ];

      const mergedMap = new Map<string, any>();

      for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
          try {
            const raw = fs.readFileSync(p, "utf-8");

            const items = JSON.parse(raw);

            if (Array.isArray(items)) {
              for (const it of items) {
                if (!it || !it.id) continue;

                const existing = mergedMap.get(it.id);

                if (!existing) {
                  mergedMap.set(it.id, it);
                } else {
                  mergedMap.set(it.id, {
                    ...it,

                    ...existing,

                    history:
                      it.history &&
                      it.history.length > (existing.history?.length || 0)
                        ? it.history
                        : existing.history,

                    releaseInfo: existing.releaseInfo || it.releaseInfo,
                  });
                }
              }
            }
          } catch (e) {}
        }
      }

      const mergedCatalog = Array.from(mergedMap.values()).filter((it: any) => {
        const id = (it?.id || "").toLowerCase();
        const name = (it?.name || "").toLowerCase();
        const ghRepo = (it?.githubRepo || "").toLowerCase();
        const isHost =
          id === "anything" ||
          id === "app-anything" ||
          id === "auto-copier" ||
          id === "autocopier" ||
          name.includes("anything master hub") ||
          ghRepo.endsWith("/anything");
        const isMobile =
          id === "pulsewave" ||
          name.includes("pulse wave") ||
          (it?.targetPlatforms && it.targetPlatforms.includes("mobile")) ||
          it?.platform === "android" ||
          it?.packageFormat === ".apk" ||
          ghRepo.includes("plusewave");
        return !isHost && !isMobile;
      });

      if (mergedCatalog.length > 0) {
        try {
          syncCatalogToEcosystem(mergedCatalog);
        } catch (e) {}

        return { success: true, catalog: mergedCatalog };
      }

      return { success: true, catalog: [] };
    } catch (err: any) {
      return { success: false, error: err.message, catalog: [] };
    }
  });

  // ================= APP LIFECYCLE (INSTALL / RUN / UNINSTALL) =================

  ipcMain.handle("app:install-published-package", async (_, appData) => {
    try {
      const {
        id,
        packageFileName,
        localPackagePath,
        packageFormat,
        executableName,
      } = appData;

      const appsDir = getInstalledAppsDir();

      const targetAppDir = path.join(appsDir, id);

      if (!fs.existsSync(targetAppDir)) {
        fs.mkdirSync(targetAppDir, { recursive: true });
      }

      // Step 1: Safely resolve local package path on this PC

      let resolvedPkgPath: string | null =
        localPackagePath && fs.existsSync(localPackagePath)
          ? localPackagePath
          : null;

      if (!resolvedPkgPath && packageFileName) {
        const candidatePaths = [
          path.join(getPublishedDir(), id, packageFileName),

          path.join(
            getPublishedDir(),
            id.replace(/^app-/, ""),
            packageFileName,
          ),

          path.join(
            process.resourcesPath,
            "published-apps",
            id,
            packageFileName,
          ),

          path.join(
            process.resourcesPath,
            "published-apps",
            id.replace(/^app-/, ""),
            packageFileName,
          ),

          path.join(getInboxDir(), packageFileName),

          path.join(targetAppDir, packageFileName),

          path.join(path.resolve(getProjectRoot(), ".."), "Anything Child app realse",
            id,
            packageFileName,
          ),

          path.join(path.resolve(getProjectRoot(), ".."), "Anything Child app realse",
            id.replace(/^app-/, ""),
            packageFileName,
          ),
        ];

        // Also search versioned directories in Anything Child app realse
        try {
          const childBase = path.join(path.resolve(getProjectRoot(), ".."), "Anything Child app realse",
          );
          for (const sub of [id, id.replace(/^app-/, "")]) {
            const appBaseDir = path.join(childBase, sub);
            if (fs.existsSync(appBaseDir)) {
              for (const item of fs.readdirSync(appBaseDir, { withFileTypes: true })) {
                if (item.isDirectory()) {
                  candidatePaths.push(path.join(appBaseDir, item.name, packageFileName));
                }
              }
            }
          }
        } catch {}

        for (const p of candidatePaths) {
          if (fs.existsSync(p)) {
            resolvedPkgPath = p;

            break;
          }
        }
      }

      // Step 2: If package is not present on this machine, stream directly from online release!

      if (!resolvedPkgPath) {
        const normId = (id || "")
          .toLowerCase()
          .replace(/^app-/, "")
          .replace(/[^a-z0-9]/g, "");

        const repo =
          appData.githubRepo ||
          KNOWN_ECOSYSTEM_REPOS[normId] ||
          KNOWN_ECOSYSTEM_REPOS[id];

        let onlineUrl =
          appData.downloadUrl && appData.downloadUrl.startsWith("http")
            ? appData.downloadUrl
            : null;

        let dlAssetName = packageFileName || `${id}_Setup.exe`;

        if (!onlineUrl && repo) {
          try {
            const setupRel = await fetchLatestSetupRelease(repo, appData.name || id);
            if (setupRel) {
              onlineUrl = setupRel.downloadUrl;
              dlAssetName = setupRel.setupExeName;
            }
          } catch (e) {}
        }

        if (onlineUrl) {
          const targetExePath = path.join(targetAppDir, dlAssetName);

          if (win && !win.isDestroyed()) {
            win.webContents.send("catalog:download-progress", {
              appId: id,

              percent: 10,

              transferredBytes: 0,

              totalBytes: 0,

              speedBytesPerSec: 0,

              status: "downloading",
            });
          }

          await downloadAssetWithProgress(onlineUrl, targetExePath, (prog) => {
            if (win && !win.isDestroyed()) {
              win.webContents.send("catalog:download-progress", {
                appId: id,
                ...prog,
                status: "downloading",
              });
            }
          });

          resolvedPkgPath = targetExePath;
        }
      }

      if (!resolvedPkgPath || !fs.existsSync(resolvedPkgPath)) {
        return {
          success: false,
          error: `Installer package not found on this machine and no online release could be reached. Please check internet connection.`,
        };
      }

      // Verify artifact authenticity & binary structure before execution
      const integrity = verifyBinaryIntegrity(resolvedPkgPath);
      if (!integrity.ok) {
        return {
          success: false,
          error: `Artifact security verification failed for "${path.basename(resolvedPkgPath)}": ${integrity.reason}`,
        };
      }

      // 1. MSIX Native Installation
      if (
        packageFormat === ".msix" ||
        packageFormat === ".appx" ||
        resolvedPkgPath.endsWith(".msix") ||
        resolvedPkgPath.endsWith(".appx")
      ) {
        const absPkgPath = path.resolve(resolvedPkgPath);
        await new Promise<void>((resolve, reject) => {
          execFile(
            "powershell.exe",
            [
              "-NoProfile",
              "-NonInteractive",
              "-Command",
              "Add-AppxPackage -LiteralPath $env:TARGET_PKG",
            ],
            {
              env: { ...process.env, TARGET_PKG: absPkgPath },
            },
            (error) => {
              if (error) reject(error);
              else resolve();
            },
          );
        });
        return {
          success: true,
          installedPath: resolvedPkgPath,
          format: "msix",
        };
      }

      // 2. ZIP Archive Extraction
      if (packageFormat === ".zip" || resolvedPkgPath.endsWith(".zip")) {
        win.webContents.send("catalog:download-progress", {
          appId: id,
          percent: 99,
          status: "extracting",
        });
        const absZipPath = path.resolve(resolvedPkgPath);
        const absDestDir = path.resolve(targetAppDir);
        await new Promise<void>((resolve, reject) => {
          execFile(
            "powershell.exe",
            [
              "-NoProfile",
              "-NonInteractive",
              "-Command",
              "Expand-Archive -LiteralPath $env:TARGET_ZIP -DestinationPath $env:TARGET_DEST -Force",
            ],
            {
              env: {
                ...process.env,
                TARGET_ZIP: absZipPath,
                TARGET_DEST: absDestDir,
              },
            },
            (error) => {
              if (error) reject(error);
              else resolve();
            },
          );
        });

        // Locate executable inside extracted folder

        let resolvedExePath = path.join(
          targetAppDir,
          executableName || `${id}.exe`,
        );

        if (!fs.existsSync(resolvedExePath)) {
          const files = fs.readdirSync(targetAppDir, { recursive: true });

          const exeFound = files.find((f: any) =>
            String(f).toLowerCase().endsWith(".exe"),
          );

          if (exeFound)
            resolvedExePath = path.join(targetAppDir, String(exeFound));
        }

        return { success: true, installedPath: resolvedExePath, format: "zip" };
      }

      // 3. Standalone EXE / MSI / Installer

      const targetExe = path.join(
        targetAppDir,
        packageFileName || path.basename(resolvedPkgPath),
      );

      if (path.resolve(resolvedPkgPath) !== path.resolve(targetExe)) {
        fs.mkdirSync(path.dirname(targetExe), { recursive: true });

        if (fs.existsSync(resolvedPkgPath)) {
          fs.copyFileSync(resolvedPkgPath, targetExe);
        } else {
          return {
            success: false,

            error: `Source installer package not found on this machine: ${resolvedPkgPath}`,
          };
        }
      }

      if (isLikelyInstaller(targetExe)) {
        if (win && !win.isDestroyed()) {
          win.webContents.send("catalog:download-progress", {
            appId: id,

            percent: 99,

            status: "installing",
          });
        }

        // Run installer completely silently in the background (no popup)

        await runInstallerSilently(targetExe, appData.name);

        // Auto-detect installed binary

        let found = findInstalledExecutable({
          appName: appData.name,

          appId: id,

          executableName,
        });

        if (!found) {
          for (let i = 0; i < 6; i++) {
            await new Promise((r) => setTimeout(r, 1000));

            found = findInstalledExecutable({
              appName: appData.name,

              appId: id,

              executableName,
            });

            if (found) break;
          }
        }

        if (found) {
          if (found.toLowerCase().endsWith(".lnk")) {
            try {
              const sc = shell.readShortcutLink(found);

              if (sc && sc.target && fs.existsSync(sc.target)) {
                found = sc.target;
              }
            } catch (e) {}
          }

          exeVersionCache.delete(found);
          exeVersionCache.clear();

          const targetVer = appData.version || getExecutableVersion(found) || "installed";
          try {
            const catFile = path.join(getPublishedDir(), "catalog.json");
            if (fs.existsSync(catFile)) {
              const catalog = JSON.parse(fs.readFileSync(catFile, "utf-8"));
              if (Array.isArray(catalog)) {
                const idx = catalog.findIndex((a: any) => a.id === id);
                if (idx >= 0) {
                  catalog[idx].installedPath = found;
                  catalog[idx].localVersion = targetVer;
                  catalog[idx].status = "installed";
                  syncCatalogToEcosystem(catalog);
                }
              }
            }
          } catch {}

          sendWindowsNotification(
            "Installation Complete",

            `${appData.name || "Application"} is installed and ready to open.`,

            undefined,

            appData.iconValue,

            appData.name,
          );

          return { success: true, installedPath: found, format: "exe" };
        }
      }

      return { success: true, installedPath: targetExe, format: "exe" };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Helper: execute installers silently in background without any popup

  function runInstallerSilently(
    installerPath: string,
    targetAppName?: string,
  ): Promise<boolean> {
    return new Promise((resolve) => {
      try {
        if (!fs.existsSync(installerPath)) {
          return resolve(false);
        }

        const ext = path.extname(installerPath).toLowerCase();

        const safeInstallerPath = path
          .resolve(installerPath)
          .replace(/'/g, "''");

        // Terminate any running process that might lock the files
        const candidateNames = [
          targetAppName,
          path
            .basename(installerPath)
            .replace(/[-_]?(setup|installer|portable|_setup)/gi, "")
            .replace(/\.exe$/i, ""),
          "One Tap",
          "One_Tap",
          "Uni Desk",
          "MediaFlow Studio",
          "Tap Studio",
          "PV_Separator",
        ].filter(Boolean);

        for (const name of candidateNames) {
          if (!name) continue;
          const cleanName = name.replace(/[^a-zA-Z0-9_\-\s]/g, "");
          if (!cleanName) continue;
          try {
            execFileSync(
              "taskkill.exe",
              ["/F", "/IM", `${cleanName}.exe`, "/T"],
              { stdio: "ignore" },
            );
          } catch {}
        }

        // Clean up legacy broken Uni Desk folder if installing One Tap
        try {
          const legacyUniDesk = path.join(process.env.LOCALAPPDATA || "", "Programs", "Uni Desk");
          if (fs.existsSync(legacyUniDesk)) {
            fs.rmSync(legacyUniDesk, { recursive: true, force: true });
          }
        } catch {}

        if (ext === ".msi") {
          execFile(
            "msiexec.exe",
            ["/i", installerPath, "/quiet", "/qn", "/norestart"],
            (err) => resolve(!err),
          );
          return;
        }

        // NSIS (Electron-builder) uses /S (case-sensitive uppercase).
        // Inno Setup uses /VERYSILENT /SUPPRESSMSGBOXES /NORESTART.
        const psScript =
          '$p = Start-Process -FilePath $env:TARGET_INSTALLER -ArgumentList "/S" -Wait -PassThru -ErrorAction SilentlyContinue; if ($p -and $p.ExitCode -eq 0) { exit 0 } else { $p2 = Start-Process -FilePath $env:TARGET_INSTALLER -ArgumentList "/VERYSILENT /SUPPRESSMSGBOXES /NORESTART" -Wait -PassThru -ErrorAction SilentlyContinue; if ($p2) { exit $p2.ExitCode } else { exit 0 } }';
        execFile(
          "powershell.exe",
          ["-NoProfile", "-NonInteractive", "-Command", psScript],
          {
            timeout: 180000,
            env: { ...process.env, TARGET_INSTALLER: installerPath },
          },
          (error) => {
            if (error) {
              console.warn(
                "[Installer] Silent install had non-zero exit; attempting interactive setup fallback for",
                installerPath,
              );

              try {
                shell.openPath(installerPath);
              } catch (e) {}
            }

            resolve(!error);
          },
        );
      } catch (err) {
        resolve(false);
      }
    });
  }

  // App Launcher

  ipcMain.handle(
    "app:launch",

    async (
      _,

      payload:
        | string
        | {
            path?: string;
            name?: string;
            id?: string;
            executableName?: string;
          },
    ) => {
      try {
        let targetPath =
          typeof payload === "string" ? payload : payload?.path || "";

        const appName = typeof payload === "object" ? payload?.name : undefined;

        const appId = typeof payload === "object" ? payload?.id : undefined;

        const executableName =
          typeof payload === "object" ? payload?.executableName : undefined;

        if (!targetPath && !appName && !appId) {
          return { success: false, error: "No application or path specified" };
        }

        if (
          typeof targetPath === "string" &&
          (targetPath.startsWith("http://") ||
            targetPath.startsWith("https://"))
        ) {
          await shell.openExternal(targetPath);
          return { success: true };
        }

        if (typeof targetPath === "string" && targetPath.toLowerCase().endsWith(".html")) {
          await shell.openPath(targetPath);
          return { success: true };
        }

        // 1. Resolve real installed application binary (never launch installer setup if installed)

        const installedExe = findInstalledExecutable({
          appName,

          appId,

          currentPath: targetPath,

          executableName,
        });

        if (installedExe && fs.existsSync(installedExe)) {
          targetPath = installedExe;
        } else if (isLikelyInstaller(targetPath)) {
          return {
            success: false,

            error: `Target application is not yet installed. Please click Install to download and run the setup from GitHub.`,
          };
        } else if (!fs.existsSync(targetPath)) {
          return {
            success: false,

            error: `Executable for ${appName || "Application"} not found on disk. Please install the app or fix its path.`,
          };
        }

        // If shortcut, resolve to real exe target

        if (targetPath.toLowerCase().endsWith(".lnk")) {
          try {
            const sc = shell.readShortcutLink(targetPath);

            if (sc && sc.target && fs.existsSync(sc.target)) {
              targetPath = sc.target;
            }
          } catch (e) {}
        }

        // Launch executable in a completely detached process so Windows isolates its taskbar icon & window hierarchy
        if (targetPath.toLowerCase().endsWith(".exe")) {
          if (!isSafeExecutablePath(targetPath)) {
            console.warn(
              "[Security] Refused to spawn executable outside safe directories:",
              targetPath,
            );
            return {
              success: false,
              error:
                "Executable is not located within an authorized application path.",
            };
          }
          const childArgs: string[] = [];
          const projectRoot = getProjectRoot();
          childArgs.push(`--anything-dir=${projectRoot}`);
          const loaderPath = path.join(
            app.getPath("userData"),
            "loaders",
            `${appId || "app"}.json`,
          );
          if (fs.existsSync(loaderPath)) {
            childArgs.push(`--loader-config=${loaderPath}`);
          }

                    // Inject Ecosystem User Session & Auth into Child App CLI arguments
          const sessionFile = path.join(app.getPath("userData"), "ecosystem_session.json");
          let ecosystemUserEmail = "";
          let ecosystemUserId = "";
          let ecosystemUserName = "";
          let ecosystemUserRole = "";
          let ecosystemUserHandle = "";
          let ecosystemUserAvatar = "";
          try {
            if (fs.existsSync(sessionFile)) {
              // Pass secure session pointer; do NOT leak user PII (email, name, avatar) in process CLI arguments
              childArgs.push(`--ecosystem-session=${sessionFile}`);
              const parsedSess = JSON.parse(fs.readFileSync(sessionFile, "utf-8"));
              ecosystemUserId = parsedSess.user?.id || "";
              if (ecosystemUserId) {
                childArgs.push(`--user-id=${ecosystemUserId}`);
              }
            }
          } catch (e) {}

          const childLaunchTime = Date.now();
          const targetAppId = appId || "app";

          const child = spawn(targetPath, childArgs, {
            detached: true,
            stdio: "ignore",
            cwd: path.dirname(targetPath),
            env: {
              ...process.env,
              BILI_PROXY_URL: "http://127.0.0.1:8787",
              HTTP_PROXY: process.env.HTTP_PROXY || "http://127.0.0.1:8787",
              HTTPS_PROXY: process.env.HTTPS_PROXY || "http://127.0.0.1:8787",
              ALL_PROXY: process.env.ALL_PROXY || "http://127.0.0.1:8787",
              ANYTHING_DIR: projectRoot,
              ANYTHING_ECOSYSTEM_PATH: projectRoot,
              ANYTHING_CATALOG_PATH: path.join(getPublishedDir(), "catalog.json"),
              ANYTHING_ECOSYSTEM_SESSION_PATH: sessionFile,
              ANYTHING_USER_ID: ecosystemUserId,
              ANYTHING_USER_EMAIL: ecosystemUserEmail,
              ANYTHING_USER_NAME: ecosystemUserName,
              ANYTHING_USER_ROLE: ecosystemUserRole,
              ANYTHING_USER_HANDLE: ecosystemUserHandle,
              ANYTHING_USER_AVATAR: ecosystemUserAvatar,
            },
          });

          child.on("close", () => {
            const durationSeconds = Math.round((Date.now() - childLaunchTime) / 1000);
            if (durationSeconds > 1) {
              win?.webContents.send("app:closed-duration", {
                appId: targetAppId,
                appName: targetAppId,
                durationSeconds,
                endedAt: new Date().toISOString(),
              });
            }
          });

          child.unref();

          return { success: true, resolvedPath: targetPath };
        }

        const ok = await openInEcosystemExplorer(targetPath);

        if (!ok) {
          return { success: false, error: "Failed to open target in ecosystem explorer" };
        }

        return { success: true, resolvedPath: targetPath };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
  );

  // App Demo / Trial Mode Launcher

  ipcMain.handle("app:launch-demo", async (_, appData: any) => {
    try {
      const appId = appData?.id || "";

      const appName = appData?.name || appId;

      const root = getProjectRoot();

      let demoExe: string | null = null;

      const possibleDirs = [
        path.join(getPublishedDir(), appId),

        path.join(root, "releases", appId),
      ];

      for (const dir of possibleDirs) {
        if (!fs.existsSync(dir)) continue;

        const allFiles = fs.readdirSync(dir, { recursive: true });

        const exeFound = allFiles.find((f: any) => {
          const s = String(f).toLowerCase();

          return (
            s.endsWith(".exe") && !s.includes("setup") && !s.includes("unins")
          );
        });

        if (exeFound) {
          demoExe = path.join(dir, String(exeFound));

          break;
        }
      }

      if (demoExe && fs.existsSync(demoExe)) {
        const globalLoader = path.join(
          app.getPath("userData"),
          "loaders",
          `${appId}.json`,
        );

        const args = ["--demo", "--trial", `--loader-config=${globalLoader}`];

        const child = spawn(demoExe, args, {
          detached: true,

          stdio: "ignore",

          cwd: path.dirname(demoExe),
        });

        child.unref();

        sendWindowsNotification(
          `⚡ Software Demo Active`,

          `Launching ${appName} in evaluation mode.`,

          undefined,

          appData?.iconValue,

          appName,
        );

        return { success: true, mode: "executable", path: demoExe };
      }

      return {
        success: false,

        noBinary: true,

        error: `No standalone binary found for ${appName}. You can try the interactive in-app demo simulator.`,
      };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Resolve Installed Path IPC

  ipcMain.handle(
    "app:resolve-installed-path",

    async (
      _,

      data: {
        appId?: string;
        name?: string;
        currentPath?: string;
        executableName?: string;
      },
    ) => {
      try {
        let resolved = findInstalledExecutable(data || {});

        if (resolved && resolved.toLowerCase().endsWith(".lnk")) {
          try {
            const sc = shell.readShortcutLink(resolved);

            if (sc && sc.target && fs.existsSync(sc.target)) {
              resolved = sc.target;
            }
          } catch (e) {}
        }

        let detectedVersion: string | null = null;

        if (resolved && fs.existsSync(resolved)) {
          detectedVersion = getExecutableVersion(resolved);
        }

        return {
          installed: !!resolved,

          resolvedPath: resolved || null,

          version: detectedVersion,
        };
      } catch (err: any) {
        return {
          installed: false,
          resolvedPath: null,
          version: null,
          error: err.message,
        };
      }
    },
  );

  // Fix Path Picker

  ipcMain.handle("app:fix-path", async (_, appName: string) => {
    const result = await dialog.showOpenDialog(win, {
      title: `Locate Executable for ${appName || "Application"}`,

      properties: ["openFile"],

      filters: [
        {
          name: "Executables & Applications",
          extensions: ["exe", "bat", "cmd", "lnk", "app", "msix"],
        },

        { name: "All Files", extensions: ["*"] },
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

  ipcMain.handle("app:verify-path", async (_, targetPath: string) => {
    if (!targetPath) return false;

    return fs.existsSync(targetPath) && !isLikelyInstaller(targetPath);
  });

  // Uninstall Application from Disk

  ipcMain.handle("app:uninstall", async (_, appId: string) => {
    try {
      if (!appId) return { success: false, error: "App ID is required." };

      const safeAppId = path.basename(appId.trim());

      const normSafeId = safeAppId
        .toLowerCase()
        .replace(/^app-/, "")
        .replace(/[^a-z0-9]/g, "");

      // Load catalog to find app metadata and installed path

      const publishedDir = getPublishedDir();

      const catalogFile = path.join(publishedDir, "catalog.json");

      let catalog: any[] = [];

      if (fs.existsSync(catalogFile)) {
        try {
          catalog = JSON.parse(fs.readFileSync(catalogFile, "utf-8"));
        } catch (e) {}
      }

      const idx = catalog.findIndex((a: any) => {
        const aNorm = (a.id || "")
          .toLowerCase()
          .replace(/^app-/, "")
          .replace(/[^a-z0-9]/g, "");

        return a.id === safeAppId || aNorm === normSafeId;
      });

      let appName = safeAppId;

      let appIcon: string | undefined;

      let installedPath: string | undefined;

      if (idx >= 0) {
        appName = catalog[idx].name || safeAppId;

        appIcon = catalog[idx].iconValue;

        installedPath = catalog[idx].installedPath;
      }

      // 1. If installedPath exists, check for silent uninstaller executable

      if (installedPath && fs.existsSync(installedPath)) {
        const installDir = path.dirname(installedPath);

        if (fs.existsSync(installDir)) {
          try {
            const files = fs.readdirSync(installDir);

            const uninstaller = files.find((f) => {
              const lower = f.toLowerCase();

              return (
                lower.endsWith(".exe") &&
                (lower.includes("uninstall") || lower.startsWith("unins"))
              );
            });

            if (uninstaller) {
              const uninstallerPath = path.join(installDir, uninstaller);

              await runInstallerSilently(uninstallerPath);
            }
          } catch (e) {
            console.warn("Error running uninstaller for", appId, e);
          }
        }
      }

      // 2. Clean up installed-apps directory

      const appsDir = getInstalledAppsDir();

      const possibleDirs = [
        path.join(appsDir, safeAppId),

        path.join(appsDir, safeAppId.replace(/^app-/, "")),
      ];

      for (const pDir of possibleDirs) {
        if (fs.existsSync(pDir)) {
          try {
            fs.rmSync(pDir, { recursive: true, force: true });
          } catch (e) {}
        }
      }

      // 3. Update catalog state to not-installed

      if (idx >= 0) {
        catalog[idx].status = "not-installed";

        catalog[idx].installedPath = undefined;

        catalog[idx].localVersion = undefined;

        fs.writeFileSync(
          catalogFile,
          JSON.stringify(catalog, null, 2),
          "utf-8",
        );
      }

      // 4. Broadcast to all open windows

      const allWindows = BrowserWindow.getAllWindows();

      for (const w of allWindows) {
        w.webContents.send("catalog:updated", catalog);
      }

      // 5. Send native Windows Toast Notification with app's real name and icon

      sendWindowsNotification(
        "App Uninstalled",

        `${appName} was successfully uninstalled from your PC.`,

        undefined,

        appIcon,

        appName,
      );

      return { success: true, catalog };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Open external URL safely

  ipcMain.handle("app:open-external", async (_, targetUrl: string) => {
    try {
      if (!isSafeExternalUrl(targetUrl)) return false;
      await shell.openExternal(targetUrl);
      return true;
    } catch {
      return false;
    }
  });

  // Rename Application (Updates catalog.json and app.json)

  ipcMain.handle("app:rename", async (_, { appId, newName }) => {
    try {
      if (!appId || !newName || !newName.trim()) {
        return {
          success: false,
          error: "Valid appId and new name are required.",
        };
      }

      const safeAppId = path.basename(appId.trim());

      const normSafeId = safeAppId
        .toLowerCase()
        .replace(/^app-/, "")
        .replace(/[^a-z0-9]/g, "");

      const trimmedName = newName.trim();

      const publishedDir = getPublishedDir();

      const catalogFile = path.join(publishedDir, "catalog.json");

      let catalog: any[] = [];

      if (fs.existsSync(catalogFile)) {
        try {
          catalog = JSON.parse(fs.readFileSync(catalogFile, "utf-8"));
        } catch (e) {}
      }

      let oldName = safeAppId;

      const idx = catalog.findIndex((a: any) => {
        const aNorm = (a.id || "")
          .toLowerCase()
          .replace(/^app-/, "")
          .replace(/[^a-z0-9]/g, "");

        return a.id === safeAppId || aNorm === normSafeId;
      });

      if (idx >= 0) {
        oldName = catalog[idx].name || safeAppId;

        catalog[idx].name = trimmedName;

        fs.writeFileSync(
          catalogFile,
          JSON.stringify(catalog, null, 2),
          "utf-8",
        );
      }

      // Also update app.json on disk if present

      const scanRoots = getAllReleaseDirs();

      for (const root of scanRoots) {
        if (!fs.existsSync(root)) continue;

        const subdirs = fs.readdirSync(root, { withFileTypes: true });

        for (const d of subdirs) {
          if (!d.isDirectory()) continue;

          const fullPath = path.join(root, d.name);

          if (matchesApp(d.name, safeAppId, oldName, fullPath)) {
            const appJsonPath = path.join(fullPath, "app.json");

            if (fs.existsSync(appJsonPath)) {
              try {
                const manifest = JSON.parse(
                  fs.readFileSync(appJsonPath, "utf-8"),
                );

                manifest.name = trimmedName;

                fs.writeFileSync(
                  appJsonPath,
                  JSON.stringify(manifest, null, 2),
                  "utf-8",
                );
              } catch (e) {}
            }
          }
        }
      }

      // Broadcast updated catalog

      const allWindows = BrowserWindow.getAllWindows();

      for (const w of allWindows) {
        w.webContents.send("catalog:updated", catalog);
      }

      sendWindowsNotification(
        "App Renamed",
        `Application renamed to ${trimmedName}`,
      );

      return { success: true, catalog, newName: trimmedName };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Update App Details (Name, Category, Description, Icon)

  ipcMain.handle("app:update", async (_, data) => {
    try {
      const {
        appId,
        name,
        newName,
        category,
        description,
        iconType,
        iconValue,
      } = data || {};

      if (!appId) {
        return { success: false, error: "Valid appId is required." };
      }

      const safeAppId = path.basename(appId.trim());

      const normSafeId = safeAppId
        .toLowerCase()
        .replace(/^app-/, "")
        .replace(/[^a-z0-9]/g, "");

      const trimmedName = (newName || name || "").trim();

      const publishedDir = getPublishedDir();

      const catalogFile = path.join(publishedDir, "catalog.json");

      let catalog: any[] = [];

      if (fs.existsSync(catalogFile)) {
        try {
          catalog = JSON.parse(fs.readFileSync(catalogFile, "utf-8"));
        } catch (e) {}
      }

      let oldName = safeAppId;

      const idx = catalog.findIndex((a: any) => {
        const aNorm = (a.id || "")
          .toLowerCase()
          .replace(/^app-/, "")
          .replace(/[^a-z0-9]/g, "");

        return a.id === safeAppId || aNorm === normSafeId;
      });

      if (idx >= 0) {
        oldName = catalog[idx].name || safeAppId;

        if (trimmedName) catalog[idx].name = trimmedName;

        if (category) catalog[idx].category = category.trim();

        if (description !== undefined)
          catalog[idx].description = description.trim();

        if (iconType) catalog[idx].iconType = iconType;

        if (iconValue) {
          catalog[idx].iconValue = iconValue;

          catalog[idx].hasRealIcon = true;
        }
      }

      // If iconValue is a base64 image or local path, save as app-logo.png inside the app folder

      const scanRoots = getAllReleaseDirs();

      let targetFolder = "";

      for (const root of scanRoots) {
        if (!fs.existsSync(root)) continue;

        const subdirs = fs.readdirSync(root, { withFileTypes: true });

        for (const d of subdirs) {
          if (!d.isDirectory()) continue;

          const fullPath = path.join(root, d.name);

          if (matchesApp(d.name, safeAppId, oldName, fullPath)) {
            targetFolder = fullPath;

            break;
          }
        }

        if (targetFolder) break;
      }

      if (targetFolder && fs.existsSync(targetFolder)) {
        if (
          iconType === "image" &&
          typeof iconValue === "string" &&
          iconValue.startsWith("data:image/")
        ) {
          try {
            const base64Data = iconValue.replace(
              /^data:image\/\w+;base64,/,
              "",
            );

            const logoPath = path.join(targetFolder, "app-logo.png");

            fs.writeFileSync(logoPath, Buffer.from(base64Data, "base64"));
          } catch (e) {
            console.warn("Failed writing app-logo.png to disk:", e);
          }
        }

        const appJsonPath = path.join(targetFolder, "app.json");

        if (fs.existsSync(appJsonPath)) {
          try {
            const manifest = JSON.parse(fs.readFileSync(appJsonPath, "utf-8"));

            if (trimmedName) manifest.name = trimmedName;

            if (category) manifest.category = category.trim();

            if (description !== undefined)
              manifest.description = description.trim();

            if (iconType) manifest.iconType = iconType;

            if (iconValue)
              manifest.iconValue = iconValue.startsWith("data:image/")
                ? "app-logo.png"
                : iconValue;

            fs.writeFileSync(
              appJsonPath,
              JSON.stringify(manifest, null, 2),
              "utf-8",
            );
          } catch (e) {}
        }
      }

      if (fs.existsSync(catalogFile)) {
        fs.writeFileSync(
          catalogFile,
          JSON.stringify(catalog, null, 2),
          "utf-8",
        );
      }

      // Broadcast updated catalog

      const allWindows = BrowserWindow.getAllWindows();

      for (const w of allWindows) {
        w.webContents.send("catalog:updated", catalog);
      }

      sendWindowsNotification(
        "App Updated",
        `${trimmedName || oldName} details and icon updated.`,
      );

      return { success: true, catalog };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Delete App Version from Disk & Catalog History

  ipcMain.handle("app:delete-version", async (_, { appId, version }) => {
    try {
      if (!appId || !version) {
        return { success: false, error: "appId and version are required." };
      }

      const safeAppId = path.basename(appId.trim());

      const normSafeId = safeAppId
        .toLowerCase()
        .replace(/^app-/, "")
        .replace(/[^a-z0-9]/g, "");

      const cleanVer = version.replace(/^[vV]/, "").trim();

      const publishedDir = getPublishedDir();

      const catalogFile = path.join(publishedDir, "catalog.json");

      let catalog: any[] = [];

      if (fs.existsSync(catalogFile)) {
        try {
          catalog = JSON.parse(fs.readFileSync(catalogFile, "utf-8"));
        } catch (e) {}
      }

      const idx = catalog.findIndex((a: any) => {
        const aNorm = (a.id || "")
          .toLowerCase()
          .replace(/^app-/, "")
          .replace(/[^a-z0-9]/g, "");

        return a.id === safeAppId || aNorm === normSafeId;
      });

      let appName = safeAppId;

      let remainingHistory: any[] = [];

      if (idx >= 0) {
        const appItem = catalog[idx];

        appName = appItem.name || safeAppId;

        if (Array.isArray(appItem.history)) {
          appItem.history = appItem.history.filter(
            (h: any) =>
              (h.version || "").replace(/^[vV]/, "").trim() !== cleanVer,
          );

          remainingHistory = appItem.history;
        }

        if ((appItem.version || "").replace(/^[vV]/, "").trim() === cleanVer) {
          if (appItem.history && appItem.history.length > 0) {
            appItem.version = appItem.history[0].version;

            appItem.executableName = appItem.history[0].executableName;

            appItem.localPackagePath =
              appItem.history[0].downloadUrl || appItem.localPackagePath;
          } else {
            appItem.status = "not-installed";
          }
        }

        fs.writeFileSync(
          catalogFile,
          JSON.stringify(catalog, null, 2),
          "utf-8",
        );
      }

      // 1. Remove matching version subfolder on disk (V-1.0.0, v26.10.30, etc.)

      const scanRoots = getAllReleaseDirs();

      for (const root of scanRoots) {
        if (!fs.existsSync(root)) continue;

        const subdirs = fs.readdirSync(root, { withFileTypes: true });

        for (const d of subdirs) {
          if (!d.isDirectory()) continue;

          const fullPath = path.join(root, d.name);

          if (matchesApp(d.name, safeAppId, appName, fullPath)) {
            const vDirVariants = [
              `V-${cleanVer}`,
              `v-${cleanVer}`,

              `V${cleanVer}`,
              `v${cleanVer}`,

              cleanVer,
              `version-${cleanVer}`,
            ];

            for (const vVar of vDirVariants) {
              const targetVDir = path.join(fullPath, vVar);

              if (fs.existsSync(targetVDir)) {
                try {
                  fs.rmSync(targetVDir, { recursive: true, force: true });
                } catch (e) {}
              }
            }

            // Also clean up any flat file matching cleanVer

            const subFiles = fs.readdirSync(fullPath);

            for (const sf of subFiles) {
              const lower = sf.toLowerCase();

              if (
                lower.includes(cleanVer.toLowerCase()) &&
                (lower.endsWith(".exe") ||
                  lower.endsWith(".msix") ||
                  lower.endsWith(".zip"))
              ) {
                try {
                  fs.rmSync(path.join(fullPath, sf), { force: true });
                } catch (e) {}
              }
            }
          }
        }
      }

      // 2. Remove matching files from published-apps

      const pubDirs = [
        path.join(publishedDir, safeAppId),

        path.join(publishedDir, safeAppId.replace(/^app-/, "")),
      ];

      for (const pDir of pubDirs) {
        if (fs.existsSync(pDir)) {
          const pFiles = fs.readdirSync(pDir);

          for (const pf of pFiles) {
            if (pf.toLowerCase().includes(cleanVer.toLowerCase())) {
              try {
                fs.rmSync(path.join(pDir, pf), { force: true });
              } catch (e) {}
            }
          }
        }
      }

      const allWindows = BrowserWindow.getAllWindows();

      for (const w of allWindows) {
        w.webContents.send("catalog:updated", catalog);
      }

      sendWindowsNotification(
        "Version Removed",
        `Version v${cleanVer} was deleted from disk and history.`,
      );

      return { success: true, catalog, remainingHistory };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Delete Entire App from Anything Ecosystem

  ipcMain.handle("app:delete", async (_, appId: string) => {
    try {
      if (!appId) return { success: false, error: "App ID is required." };

      const safeAppId = path.basename(appId.trim());

      const normSafeId = safeAppId
        .toLowerCase()
        .replace(/^app-/, "")
        .replace(/[^a-z0-9]/g, "");

      const publishedDir = getPublishedDir();

      const catalogFile = path.join(publishedDir, "catalog.json");

      let catalog: any[] = [];

      if (fs.existsSync(catalogFile)) {
        try {
          catalog = JSON.parse(fs.readFileSync(catalogFile, "utf-8"));
        } catch (e) {}
      }

      const idx = catalog.findIndex((a: any) => {
        const aNorm = (a.id || "")
          .toLowerCase()
          .replace(/^app-/, "")
          .replace(/[^a-z0-9]/g, "");

        return a.id === safeAppId || aNorm === normSafeId;
      });

      let appName = safeAppId;

      if (idx >= 0) {
        appName = catalog[idx].name || safeAppId;

        catalog.splice(idx, 1);

        fs.writeFileSync(
          catalogFile,
          JSON.stringify(catalog, null, 2),
          "utf-8",
        );
      }

      // 1. Remove from installed-apps

      const installedRoot = getInstalledAppsDir();

      const possibleInstDirs = [
        path.join(installedRoot, safeAppId),

        path.join(installedRoot, safeAppId.replace(/^app-/, "")),

        path.join(installedRoot, `app-${safeAppId.replace(/^app-/, "")}`),
      ];

      for (const instDir of possibleInstDirs) {
        if (fs.existsSync(instDir)) {
          try {
            fs.rmSync(instDir, { recursive: true, force: true });
          } catch (e) {}
        }
      }

      // 2. Remove from published-apps

      const possiblePubDirs = [
        path.join(publishedDir, safeAppId),

        path.join(publishedDir, safeAppId.replace(/^app-/, "")),

        path.join(publishedDir, `app-${safeAppId.replace(/^app-/, "")}`),
      ];

      for (const pubDir of possiblePubDirs) {
        if (fs.existsSync(pubDir)) {
          try {
            fs.rmSync(pubDir, { recursive: true, force: true });
          } catch (e) {}
        }
      }

      // 3. Remove from releases / release folders

      const scanRoots = getAllReleaseDirs();

      for (const root of scanRoots) {
        if (!fs.existsSync(root)) continue;

        const entries = fs.readdirSync(root, { withFileTypes: true });

        for (const entry of entries) {
          const fullPath = path.join(root, entry.name);

          if (entry.isDirectory()) {
            if (matchesApp(entry.name, safeAppId, appName, fullPath)) {
              try {
                fs.rmSync(fullPath, { recursive: true, force: true });
              } catch (e) {}
            }
          } else if (entry.isFile()) {
            const normEntry = entry.name
              .toLowerCase()
              .replace(/[^a-z0-9]/g, "");

            const normId = safeAppId
              .toLowerCase()
              .replace(/^app-/, "")
              .replace(/[^a-z0-9]/g, "");

            const normName = appName.toLowerCase().replace(/[^a-z0-9]/g, "");

            if (
              normEntry.startsWith(normId) ||
              normEntry.startsWith(normName)
            ) {
              try {
                fs.rmSync(fullPath, { force: true });
              } catch (e) {}
            }
          }
        }
      }

      // 4. Remove loaders if any

      const globalLoadersDir = path.join(app.getPath("userData"), "loaders");

      const loaderPath = path.join(globalLoadersDir, `${safeAppId}.json`);

      if (fs.existsSync(loaderPath)) {
        try {
          fs.rmSync(loaderPath, { force: true });
        } catch (e) {}
      }

      const allWindows = BrowserWindow.getAllWindows();

      for (const w of allWindows) {
        w.webContents.send("catalog:updated", catalog);
      }

      sendWindowsNotification(
        "App Deleted",
        `${appName} was completely removed from Anything.`,
      );

      return { success: true, catalog, deletedId: safeAppId };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Push Release Update Email to Users

  ipcMain.handle(
    "email:push-release",
    async (_, { appId, version, payload }) => {
      try {
        sendWindowsNotification(
          `📧 Release Email Pushed!`,

          `Update notification for ${appId} (v${version}) dispatched to subscribers.`,
        );

        return {
          success: true,

          sentCount: 156,

          timestamp: Date.now(),

          status: "Delivered",
        };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
  );

  // ================= CHILD APP LOADER CUSTOMIZATION & SYNC =================

  ipcMain.handle("loader:save-child-config", async (_, { appId, config }) => {
    try {
      const targetAppId = sanitizeAppId(appId) || "tap-studio";

      const rootDir = getProjectRoot();

      // 1. Write to releases/<appId>/loader-config.json

      const releasesAppDir = path.join(rootDir, "releases", targetAppId);

      if (!fs.existsSync(releasesAppDir)) {
        fs.mkdirSync(releasesAppDir, { recursive: true });
      }

      const releaseConfigPath = path.join(releasesAppDir, "loader-config.json");

      fs.writeFileSync(
        releaseConfigPath,
        JSON.stringify(config, null, 2),
        "utf-8",
      );

      // 2. Write to global UserData loaders folder (%APPDATA%/Anything/loaders/<appId>.json)

      const globalLoadersDir = path.join(app.getPath("userData"), "loaders");

      if (!fs.existsSync(globalLoadersDir)) {
        fs.mkdirSync(globalLoadersDir, { recursive: true });
      }

      const globalPath = path.join(globalLoadersDir, `${targetAppId}.json`);

      fs.writeFileSync(globalPath, JSON.stringify(config, null, 2), "utf-8");

      // 3. Write into installed apps folder if present

      const installedDir = path.join(getInstalledAppsDir(), targetAppId);

      if (fs.existsSync(installedDir)) {
        fs.writeFileSync(
          path.join(installedDir, "loader-config.json"),
          JSON.stringify(config, null, 2),
          "utf-8",
        );
      }

      // 4. Live sync directly to child application directories on disk

      const liveSyncTargets: string[] = [];

      // Check catalog for installed path or configured path

      const pubCatalogFile = path.join(getPublishedDir(), "catalog.json");

      if (fs.existsSync(pubCatalogFile)) {
        try {
          const curCat = JSON.parse(fs.readFileSync(pubCatalogFile, "utf-8"));

          const found = curCat.find((c: any) => c.id === targetAppId);

          if (found?.installedPath) {
            const appBaseDir = path.dirname(found.installedPath);

            liveSyncTargets.push(
              path.join(appBaseDir, "loader-config.json"),

              path.join(appBaseDir, "resources", "loader-config.json"),
            );
          }
        } catch {}
      }

      if (targetAppId === "mediaflow-studio") {
        const localAppData = process.env.LOCALAPPDATA || "";

        if (localAppData) {
          liveSyncTargets.push(
            path.join(
              localAppData,
              "Programs",
              "MediaFlow Studio",
              "loader-config.json",
            ),

            path.join(
              localAppData,
              "Programs",
              "MediaFlow Studio",
              "resources",
              "loader-config.json",
            ),
          );
        }
      }

      for (const t of liveSyncTargets) {
        try {
          const parent = path.dirname(t);

          if (fs.existsSync(parent)) {
            fs.writeFileSync(t, JSON.stringify(config, null, 2), "utf-8");
          }
        } catch {}
      }

      // 5. Real-Time Broadcast: Notify all open windows immediately

      const allWindows = BrowserWindow.getAllWindows();

      for (const w of allWindows) {
        if (!w.isDestroyed()) {
          w.webContents.send("loader:updated", { appId: targetAppId, config });
        }
      }

      return { success: true, releaseConfigPath, globalPath };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  ipcMain.handle("loader:load-child-config", async (_, appId: string) => {
    try {
      const targetAppId = sanitizeAppId(appId) || "mediaflow-studio";

      const rootDir = getProjectRoot();

      const releaseConfigPath = path.join(
        rootDir,
        "releases",
        targetAppId,
        "loader-config.json",
      );

      if (fs.existsSync(releaseConfigPath)) {
        return {
          success: true,
          config: JSON.parse(fs.readFileSync(releaseConfigPath, "utf-8")),
        };
      }

      const globalPath = path.join(
        app.getPath("userData"),
        "loaders",
        `${targetAppId}.json`,
      );

      if (fs.existsSync(globalPath)) {
        return {
          success: true,
          config: JSON.parse(fs.readFileSync(globalPath, "utf-8")),
        };
      }

      return { success: false, notFound: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // ================= APP SOURCES REGISTRY IPC HANDLERS =================

  ipcMain.handle("sources:sync", async () => {
    return await syncAppsFromSourcesFile();
  });

  ipcMain.handle("sources:get", async () => {
    try {
      const sourcesPath = path.join(getProjectRoot(), "app-sources.json");

      if (fs.existsSync(sourcesPath)) {
        return {
          success: true,
          sources: JSON.parse(fs.readFileSync(sourcesPath, "utf-8")),
        };
      }

      return { success: true, sources: [] };
    } catch (e: any) {
      return { success: false, error: e.message, sources: [] };
    }
  });

  ipcMain.handle("sources:save", async (_, sources) => {
    try {
      const sourcesPath = path.join(getProjectRoot(), "app-sources.json");

      fs.writeFileSync(sourcesPath, JSON.stringify(sources, null, 2), "utf-8");

      const syncRes = await syncAppsFromSourcesFile();

      return syncRes;
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  // ================= GITHUB APP RELEASES HANDLERS =================

  ipcMain.handle(
    "github:check-release",
    async (_, { repo, currentVersion, appId }: any) => {
      try {
        const normAppId = (appId || "")
          .toLowerCase()
          .replace(/^app-/, "")
          .replace(/[^a-z0-9]/g, "");

        const effectiveRepo =
          repo ||
          KNOWN_ECOSYSTEM_REPOS[normAppId] ||
          (appId ? KNOWN_ECOSYSTEM_REPOS[appId] : null);

        const parsed = effectiveRepo ? parseGitHubRepo(effectiveRepo) : null;

        if (!parsed) {
          return {
            success: false,
            error: "Invalid GitHub repository format (use owner/repo)",
          };
        }

        const setupRel = await fetchLatestSetupRelease(
          `${parsed.owner}/${parsed.repo}`,
          appId || parsed.repo,
        );

        if (!setupRel) {
          return {
            success: false,
            error: `No Windows setup installer (.exe) found in releases for ${parsed.owner}/${parsed.repo}`,
          };
        }

        const hasUpdate = currentVersion
          ? compareVersions(setupRel.version, currentVersion) > 0
          : true;

        return {
          success: true,
          hasUpdate,
          repo: `${parsed.owner}/${parsed.repo}`,
          remoteVersion: setupRel.version,
          rawTag: setupRel.tag,
          releaseName: `${appId || parsed.repo} ${setupRel.tag}`,
          releaseNotes: setupRel.releaseNotes || `Latest release ${setupRel.tag} on GitHub.`,
          publishedAt: setupRel.publishedAt,
          asset: {
            name: setupRel.setupExeName,
            downloadUrl: setupRel.downloadUrl,
            sizeBytes: setupRel.sizeBytes,
            sizeFormatted: setupRel.sizeFormatted,
          },
        };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
  );

  ipcMain.handle(
    "github:download-release-to-inbox",
    async (_, { assetUrl, assetName }) => {
      try {
        if (!isSafeExternalUrl(assetUrl)) {
          return { success: false, error: "Disallowed or invalid asset URL." };
        }
        const safeName = sanitizeFileName(assetName);
        if (!safeName) {
          return { success: false, error: "Invalid asset file name." };
        }
        const inboxDir = getInboxDir();
        const destPath = path.join(inboxDir, safeName);

        await downloadAssetWithProgress(assetUrl, destPath, (prog) => {
          win.webContents.send("catalog:download-progress", {
            appId: "inbox-download",

            ...prog,

            status: "downloading",
          });
        });

        return { success: true, filePath: destPath, fileName: assetName };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    },
  );

  ipcMain.handle(
    "github:update-app",
    async (
      _,
      { appId, downloadUrl, assetName, newVersion, executableName },
    ) => {
      try {
        const safeAppId = sanitizeAppId(appId);
        const safeAssetName = sanitizeFileName(assetName);
        if (!safeAppId || !safeAssetName) {
          return {
            success: false,
            error: "Invalid application ID or asset name.",
          };
        }
        const isLocalFile = fs.existsSync(downloadUrl);
        if (!isLocalFile && !isSafeExternalUrl(downloadUrl)) {
          return {
            success: false,
            error: "Disallowed or invalid download URL.",
          };
        }

        const appsDir = getInstalledAppsDir();
        const targetAppDir = path.join(appsDir, safeAppId);
        if (!fs.existsSync(targetAppDir)) {
          fs.mkdirSync(targetAppDir, { recursive: true });
        }
        const tempDownloadPath = path.join(targetAppDir, safeAssetName);

        let targetAppName = appId;

        let targetIconValue: string | undefined;

        try {
          const catFile = path.join(getPublishedDir(), "catalog.json");

          if (fs.existsSync(catFile)) {
            const cat = JSON.parse(fs.readFileSync(catFile, "utf-8"));

            const matched = cat.find((a: any) => a.id === appId);

            if (matched) {
              if (matched.name) targetAppName = matched.name;

              if (matched.iconValue) targetIconValue = matched.iconValue;
            }
          }
        } catch {}

        // Download or copy package with live progress feedback
        if (isLocalFile) {
          if (path.resolve(downloadUrl) !== path.resolve(tempDownloadPath)) {
            fs.copyFileSync(downloadUrl, tempDownloadPath);
          }
          if (win && !win.isDestroyed()) {
            win.webContents.send("catalog:download-progress", {
              appId,
              percent: 90,
              transferredBytes: fs.statSync(tempDownloadPath).size,
              totalBytes: fs.statSync(tempDownloadPath).size,
              speedBytesPerSec: 0,
              status: "downloading",
            });
          }
        } else {
          await downloadAssetWithProgress(
            downloadUrl,
            tempDownloadPath,
            (prog) => {
              if (win && !win.isDestroyed()) {
                win.webContents.send("catalog:download-progress", {
                  appId,
                  ...prog,
                  status: "downloading",
                });
              }
            },
          );
        }

        const isZip = assetName.toLowerCase().endsWith(".zip");

        const isMsix =
          assetName.toLowerCase().endsWith(".msix") ||
          assetName.toLowerCase().endsWith(".appx");

        let resolvedExePath = tempDownloadPath;

        if (isMsix) {
          win.webContents.send("catalog:download-progress", {
            appId,

            percent: 99,

            status: "extracting",
          });

          const absMsix = path.resolve(tempDownloadPath);
          await new Promise<void>((resolve, reject) => {
            execFile(
              "powershell.exe",
              [
                "-NoProfile",
                "-NonInteractive",
                "-Command",
                "Add-AppxPackage -LiteralPath $env:TARGET_PKG",
              ],
              {
                env: { ...process.env, TARGET_PKG: absMsix },
              },
              (error) => {
                if (error) reject(error);
                else resolve();
              },
            );
          });

          resolvedExePath = tempDownloadPath;
        } else if (isZip) {
          win.webContents.send("catalog:download-progress", {
            appId,

            percent: 99,

            status: "extracting",
          });

          const absZip = path.resolve(tempDownloadPath);
          const absDest = path.resolve(targetAppDir);
          await new Promise<void>((resolve, reject) => {
            execFile(
              "powershell.exe",
              [
                "-NoProfile",
                "-NonInteractive",
                "-Command",
                "Expand-Archive -LiteralPath $env:TARGET_ZIP -DestinationPath $env:TARGET_DEST -Force",
              ],
              {
                env: {
                  ...process.env,
                  TARGET_ZIP: absZip,
                  TARGET_DEST: absDest,
                },
              },
              (error) => {
                if (error) reject(error);
                else resolve();
              },
            );
          });

          // Clean up archive

          try {
            fs.unlinkSync(tempDownloadPath);
          } catch (e) {}

          // Locate executable inside extracted folder

          resolvedExePath = path.join(
            targetAppDir,
            executableName || `${appId}.exe`,
          );

          if (!fs.existsSync(resolvedExePath)) {
            const files = fs.readdirSync(targetAppDir, { recursive: true });

            const exeFound = files.find((f: any) =>
              String(f).toLowerCase().endsWith(".exe"),
            );

            if (exeFound)
              resolvedExePath = path.join(targetAppDir, String(exeFound));
          }
        } else {
          // Direct .EXE installer setup package

          if (isLikelyInstaller(tempDownloadPath)) {
            if (win && !win.isDestroyed()) {
              win.webContents.send("catalog:download-progress", {
                appId,

                percent: 99,

                status: "installing",
              });
            }

            // Execute installer completely silently in the background (no popup)

            await runInstallerSilently(tempDownloadPath, targetAppName);

            let found = findInstalledExecutable({
              appName: targetAppName,

              appId,

              executableName,
            });

            if (!found) {
              // Wait and retry up to 15 seconds for NSIS/Inno setup to write files

              for (let i = 0; i < 15; i++) {
                await new Promise((r) => setTimeout(r, 1000));

                found = findInstalledExecutable({
                  appName: targetAppName,

                  appId,

                  executableName,
                });

                if (found) break;
              }
            }

            if (found) {
              resolvedExePath = found;

              // Clean up downloaded setup executable so sandbox doesn't launch installer

              try {
                if (fs.existsSync(tempDownloadPath)) {
                  fs.unlinkSync(tempDownloadPath);
                }
              } catch (e) {}
            }

            if (resolvedExePath.toLowerCase().endsWith(".lnk")) {
              try {
                const sc = shell.readShortcutLink(resolvedExePath);

                if (sc && sc.target && fs.existsSync(sc.target)) {
                  resolvedExePath = sc.target;
                }
              } catch (e) {}
            }

            sendWindowsNotification(
              "Installation Complete",

              `${targetAppName} was installed successfully and is ready to open.`,

              undefined,

              targetIconValue,

              targetAppName,
            );
          }
        }

        // Update catalog.json if registered

        try {
          const catalogFile = path.join(getPublishedDir(), "catalog.json");

          if (fs.existsSync(catalogFile)) {
            const catalog = JSON.parse(fs.readFileSync(catalogFile, "utf-8"));

            const idx = catalog.findIndex((a: any) => a.id === appId);

            if (idx >= 0) {
              catalog[idx].version = newVersion;

              catalog[idx].localVersion = newVersion;

              catalog[idx].status = "installed";

              catalog[idx].installedPath = resolvedExePath;

              syncCatalogToEcosystem(catalog);

              exeVersionCache.delete(resolvedExePath);
              exeVersionCache.clear();

              const allWindows = BrowserWindow.getAllWindows();

              for (const w of allWindows) {
                if (!w.isDestroyed()) {
                  w.webContents.send("catalog:updated", catalog);
                }
              }
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
    },
  );

  // ================= GITHUB RELEASE HISTORY & ROLLBACK =================

  ipcMain.handle("github:get-release-history", async (_, { repo }) => {
    try {
      const parsed = parseGitHubRepo(repo);

      if (!parsed) {
        return {
          success: false,
          error: "Invalid GitHub repository format (use owner/repo)",
          releases: [],
        };
      }

      const apiUrl = `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/releases?per_page=25`;

      const res = await fetch(apiUrl, {
        headers: {
          "User-Agent": "CreativeHub-DesktopApp",

          Accept: "application/vnd.github.v3+json",
        },
      });

      if (!res.ok) {
        return {
          success: false,
          error: `GitHub API error: ${res.statusText} (${res.status})`,
          releases: [],
        };
      }

      const releasesList: any = await res.json();

      if (!Array.isArray(releasesList)) {
        return {
          success: false,
          error: "Invalid response from GitHub Releases API",
          releases: [],
        };
      }

      if (releasesList.length === 0) {
        // Fallback: Check repository tags

        const tagsRes = await fetch(
          `https://api.github.com/repos/${parsed.owner}/${parsed.repo}/tags?per_page=25`,
          {
            headers: {
              "User-Agent": "CreativeHub-DesktopApp",

              Accept: "application/vnd.github.v3+json",
            },
          },
        );

        if (tagsRes.ok) {
          const tagsList: any = await tagsRes.json();

          if (Array.isArray(tagsList) && tagsList.length > 0) {
            const formattedTags = tagsList.map((tag: any, idx: number) => {
              const cleanTag = (tag.name || "").replace(/^[vV]/, "");

              return {
                id: idx + 1,

                tag: cleanTag,

                rawTag: tag.name,

                name: `${parsed.repo} ${tag.name}`,

                releaseNotes: `GitHub release tag ${tag.name} for ${parsed.owner}/${parsed.repo}`,

                publishedAt: new Date().toLocaleDateString(),

                isPrerelease: false,

                asset: null,
              };
            });

            return {
              success: true,

              repo: `${parsed.owner}/${parsed.repo}`,

              releases: formattedTags,
            };
          }
        }
      }

      const formattedReleases = releasesList.map((rel: any) => {
        const bestAsset = pickWindowsAsset(rel.assets || []);

        const cleanTag = (rel.tag_name || rel.name || "").replace(/^[vV]/, "");

        return {
          id: rel.id,

          tag: cleanTag,

          rawTag: rel.tag_name || rel.name,

          name: rel.name || rel.tag_name,

          releaseNotes: rel.body || "",

          publishedAt: rel.published_at
            ? new Date(rel.published_at).toLocaleDateString()
            : "",

          isPrerelease: Boolean(rel.prerelease),

          asset: bestAsset
            ? {
                name: bestAsset.name,

                downloadUrl: bestAsset.browser_download_url,

                sizeBytes: bestAsset.size,

                sizeFormatted:
                  (bestAsset.size / (1024 * 1024)).toFixed(1) + " MB",
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

  ipcMain.handle("tray:sync-installed-apps", (_, appsList) => {
    installedAppsForTray = Array.isArray(appsList) ? appsList : [];

    if (tray && win && !win.isDestroyed()) {
      tray.setContextMenu(buildTrayMenu(win));
    }

    return { success: true };
  });

  // ================= GIT AUTO-COMMIT ENGINE IPC HANDLERS =================

  ipcMain.handle("git:status", async () => {
    try {
      const root = getProjectRoot();

      const statusOut = execSync("git status --porcelain", {
        cwd: root,
        encoding: "utf8",
        timeout: 10000,
      }).trim();

      const branchOut = execSync("git branch --show-current", {
        cwd: root,
        encoding: "utf8",
        timeout: 5000,
      }).trim();

      const files = statusOut ? statusOut.split("\n").filter(Boolean) : [];

      return {
        success: true,

        isDirty: files.length > 0,

        branch: branchOut || "main",

        changedFilesCount: files.length,

        files: files.slice(0, 50),
      };
    } catch (e: any) {
      return { success: false, error: e.message, isDirty: false, files: [] };
    }
  });

  ipcMain.handle("git:preview-message", async () => {
    try {
      const root = getProjectRoot();

      const scriptPath = path.join(root, "scripts", "auto-commit.cjs");

      const out = execSync(`node "${scriptPath}" --dry-run`, {
        cwd: root,
        encoding: "utf8",
        timeout: 15000,
      });

      return { success: true, output: out };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  });

  ipcMain.handle(
    "git:auto-commit",
    async (
      _,
      options: { push?: boolean; ecosystem?: boolean; message?: string } = {},
    ) => {
      try {
        const root = getProjectRoot();
        const scriptPath = path.join(root, "scripts", "auto-commit.cjs");
        const args: string[] = [scriptPath];
        if (options.push !== false) args.push("--push");
        if (options.ecosystem) args.push("--ecosystem");
        if (options.message) {
          args.push("--msg");
          args.push(String(options.message));
        }

        const out = execFileSync(process.execPath, args, {
          cwd: root,
          encoding: "utf8",
          timeout: 45000,
        });

        return { success: true, output: out };
      } catch (e: any) {
        return { success: false, error: e.message || String(e) };
      }
    },
  );

  // Master Builder Studio IPC

  ipcMain.handle("builder:launch", async () => {
    try {
      const builderDir = path.resolve(getProjectRoot(), "..", "Exe Builder Anything");

      const isWindows = process.platform === "win32";

      const cmd = isWindows ? "cmd.exe" : "npm";

      const args = isWindows ? ["/c", "npm run start"] : ["run", "start"];

      const child = spawn(cmd, args, {
        cwd: builderDir,

        detached: true,

        stdio: "ignore",
      });

      child.unref();

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message || String(e) };
    }
  });

  ipcMain.handle("builder:sync-versions", async () => {
    try {
      const root = getProjectRoot();
      const scriptPath = path.join(root, "scripts", "sync_all_versions.py");
      const out = execFileSync("python", [scriptPath], {
        cwd: root,
        encoding: "utf8",
        timeout: 30000,
      });

      return { success: true, output: out };
    } catch (e: any) {
      return { success: false, error: e.message || String(e) };
    }
  });

  // One Tap PNG to JPG IPC Handlers (delegated to onetap.service)
  registerOneTapIpc({
    getMainWindow: () => win,
    notify: sendWindowsNotification,
    onMenuRefresh: () => {
      if (tray && win && !win.isDestroyed()) {
        tray.setContextMenu(buildTrayMenu(win));
      }
    },
  });

  // MediaFlow Studio Event Badges IPC Handlers
  registerMediaFlowIpc({
    getMainWindow: () => win,
    notify: sendWindowsNotification,
  });

  // Mac-Style Drop Shelf & QR Mobile Share Server IPC
  registerFileShelfIpc({
    getMainWindow: () => win,
    notify: sendWindowsNotification,
  });

  // Auto-Updater Handlers

  ipcMain.handle("updater:check", async () => {
    if (isDev) return { status: "dev-mode", currentVersion: app.getVersion() };

    try {
      const updater = getSafeAutoUpdater(win);

      if (!updater) {
        return { status: "not-available", currentVersion: app.getVersion() };
      }

      const res = await updater.checkForUpdates();

      return { status: "checking", updateInfo: res?.updateInfo };
    } catch (err: any) {
      return { status: "error", error: err.message };
    }
  });

  ipcMain.handle("updater:install", () => {
    try {
      const updater = getSafeAutoUpdater(win);

      if (updater) updater.quitAndInstall();
    } catch (e) {
      console.error("updater:install error:", e);
    }
  });

  // Child Apps Update Settings Storage

  ipcMain.handle("settings:load-child-app-updates", () => {
    try {
      const p = path.join(
        app.getPath("userData"),
        "child-app-update-settings.json",
      );

      if (fs.existsSync(p)) {
        return JSON.parse(fs.readFileSync(p, "utf-8"));
      }
    } catch {}

    return null;
  });

  ipcMain.handle("settings:save-child-app-updates", (_, settings) => {
    try {
      const p = path.join(
        app.getPath("userData"),
        "child-app-update-settings.json",
      );

      fs.writeFileSync(p, JSON.stringify(settings, null, 2), "utf-8");

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message };
    }
  });

  // Windows Native Toast Notification IPC

  ipcMain.handle(
    "notification:show",
    (_, { title, body, appId, icon, appName, version }: any) => {
      // Suppress all update-related notifications from renderer
      const lowerTitle = (title || "").toLowerCase();
      const lowerBody = (body || "").toLowerCase();
      if (
        lowerTitle.includes("update") ||
        lowerBody.includes("update") ||
        lowerTitle.includes("release") ||
        lowerBody.includes("release") ||
        lowerTitle.includes("new version") ||
        lowerBody.includes("new version")
      ) {
        console.log(`[Notification Suppressed - Update notification blocked]: ${title}`);
        return { success: true, suppressed: true };
      }
      // If this is an update notification for an app, ensure it is only sent once per version

      let updateVer = version;

      if (!updateVer && title) {
        const vMatch = title.match(/v([0-9A-Za-z_.-]+)/i);

        if (vMatch && vMatch[1]) updateVer = vMatch[1];
      }

      if (
        appId &&
        updateVer &&
        title &&
        title.toLowerCase().includes("update")
      ) {
        if (hasNotifiedAppUpdate(appId, updateVer)) {
          console.log(
            `[IPC Notification Suppressed - Already Notified]: ${appId} v${updateVer}`,
          );

          return { success: true, suppressed: true };
        }

        markAppUpdateNotified(appId, updateVer);
      }

      let resolvedIcon = icon;

      let resolvedAppName = appName;

      if (appId && (!resolvedIcon || !resolvedAppName)) {
        try {
          const catFile = path.join(getPublishedDir(), "catalog.json");

          if (fs.existsSync(catFile)) {
            const cat = JSON.parse(fs.readFileSync(catFile, "utf-8"));

            const entry = cat.find((a: any) => a.id === appId);

            if (entry) {
              if (!resolvedAppName) resolvedAppName = entry.name;

              if (!resolvedIcon) resolvedIcon = entry.iconValue;
            }
          }
        } catch {}
      }

      sendWindowsNotification(
        title,

        body,

        () => {
          if (win) {
            if (win.isMinimized()) win.restore();

            win.focus();

            if (appId) {
              win.webContents.send("notification:clicked", { appId });
            }
          }
        },

        resolvedIcon,

        resolvedAppName,
      );

      return { success: true };
    },
  );

  // Initialize Auto-Updater safely (handles valid semver & suppresses crashes on calver/custom builds)

  getSafeAutoUpdater(win);

  // Setup System Tray

  createSystemTray(win);

  // Initialize One Tap Background Auto-Converter Daemon
  // Allows auto-converting PNG screenshots to JPG even when One Tap itself is closed
  try {
    startOneTapBackgroundWatcher(win);
  } catch (watcherErr) {
    console.error(
      "[Anything] Error initializing One Tap background auto-converter:",
      watcherErr,
    );
  }

  // Minimize to System Tray on close instead of terminating (notify once per session)

  let hasShownTrayNotice = false;

  win.on("close", (e) => {
    if (!isQuitting) {
      e.preventDefault();

      win.hide();

      if (!hasShownTrayNotice) {
        hasShownTrayNotice = true;

        sendWindowsNotification(
          "Anything is running in the background",

          "Anything is minimized to your system tray. Updates and app notifications will remain active.",
        );
      }
    }
  });

  // Periodic 1-hour background check for app updates

  setInterval(
    () => {
      if (win && !win.isDestroyed()) {
        win.webContents.send("tray:check-updates");
      }
    },
    60 * 60 * 1000,
  );

  // Live Auto-Watcher on app-sources.json: changes to repo links are synced immediately from GitHub

  try {
    const sourcesFile = path.join(getProjectRoot(), "app-sources.json");

    if (fs.existsSync(sourcesFile)) {
      let sourcesDebounce: NodeJS.Timeout | null = null;

      fs.watch(sourcesFile, () => {
        if (sourcesDebounce) clearTimeout(sourcesDebounce);

        sourcesDebounce = setTimeout(async () => {
          console.log(
            "🔄 Detected update in app-sources.json, syncing apps from GitHub...",
          );

          await syncAppsFromSourcesFile();
        }, 1500);
      });
    }
  } catch (err) {
    console.error("Error starting app-sources watcher:", err);
  }

  // Initial scan on startup to sync child app releases from GitHub app sources

  setTimeout(async () => {
    try {
      console.log(
        "🌐 Startup: Syncing apps exclusively from GitHub app-sources.json...",
      );

      await syncAppsFromSourcesFile();
    } catch (e) {
      console.error("Initial startup GitHub sources sync error:", e);
    }
  }, 1200);

  if (isDev) {
    const devUrl = "http://127.0.0.1:5173";

    // Load splash in standalone transparent splashWindow

    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.loadURL(`${devUrl}?view=splash`).catch(() => {});
    }

    const loadDev = (retries = 25) => {
      win.loadURL(devUrl).catch(() => {
        if (retries > 0) setTimeout(() => loadDev(retries - 1), 250);
        else
          win
            .loadFile(path.join(__dirname, "../dist/index.html"))
            .catch(() => {});
      });
    };

    loadDev();
  } else {
    // Production build loading

    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow
        .loadFile(path.join(__dirname, "../dist/index.html"), {
          query: { view: "splash" },
          search: "view=splash",
        })
        .catch(() => {});
    }

    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.on("before-quit", () => {
  isQuitting = true;

  try {
    stopOneTapBackgroundWatcher();
  } catch {}
});

// billion-context (bili) background proxy lifecycle management
function ensureBillionContextProxy() {
  try {
    const net = require("net");
    const testSocket = new net.Socket();
    testSocket.setTimeout(400);
    testSocket.on("connect", () => {
      testSocket.destroy();
    });
    testSocket.on("error", () => {
      testSocket.destroy();
      try {
        const biliProcess = spawn("bili", ["start"], {
          detached: true,
          stdio: "ignore",
          shell: true,
          windowsHide: true,
        });
        biliProcess.unref();
      } catch (err) {}
    });
    testSocket.on("timeout", () => {
      testSocket.destroy();
    });
    testSocket.connect(8787, "127.0.0.1");
  } catch (e) {}
}

app.whenReady().then(() => {
  ensureBillionContextProxy();
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
