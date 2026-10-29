# 🚀 UNIVERSAL MASTER PROMPT: Child App Loader & Splash Screen Synchronization

> **Target:** Any Child Application in the Anything Ecosystem (e.g., *One Tap*, *MediaFlow Studio*, *DocuFlow Studio*, *Tap Studio*, *Auto Copier*, *AIN53 Data Management*, etc.)  
> **Goal:** Automatically read, apply, and render the dynamic Loading/Splash Screen artwork, text, and timing customizations configured inside the master **Anything Hub**.

---

## 🎯 Context & Objective
In the **Anything Ecosystem**, users and studio architects can customize the startup loading experience of any child application (artwork image, product title, tagline, artist credits, logo monogram, accent gradients, and display duration) from the Anything desktop hub.

Whenever Anything saves a child app's loader customization, it writes an atomic JSON snapshot to disk and synchronizes it across the ecosystem.

Your task is to integrate the **Universal Loader Receiver** into this child app so that on startup, it dynamically displays the exact custom artwork, text, and splash duration configured in Anything, transitioning seamlessly into the child app's main window.

---

## 📂 Configuration Sources & Priority Resolution

On startup (before creating or showing the main window), the child application must check and resolve its `loader-config.json` in the following priority order:

1. **CLI Argument Override (Highest Priority)**:
   - Check if `--loader-config="<path>"` is passed in `process.argv`.
2. **Global Anything Ecosystem Loaders Directory**:
   - `%APPDATA%\Anything\loaders\<appId>.json` (Windows)
   - Fallback: `%APPDATA%\anything\loaders\<appId>.json`
   - *Example:* For One Tap, `<appId>` is `one-tap`. For MediaFlow Studio, `<appId>` is `mediaflow-studio`. For DocuFlow, `<appId>` is `docuflow-studio`.
3. **Application Local Release Directory**:
   - `path.join(app.getAppPath(), "loader-config.json")`
   - `path.join(process.resourcesPath, "loader-config.json")`
   - `path.join(__dirname, "..", "loader-config.json")`

---

## 📋 Standard Loader Configuration Schema

```typescript
export interface ChildAppLoaderConfig {
  appId: string;              // Unique ecosystem app identifier (e.g. "one-tap", "mediaflow-studio")
  enabled: boolean;           // If false, skip splash and open main window directly
  artworkUrl?: string;        // HTTP(S) URL or local base64/file path of high-res artwork
  productName?: string;       // Displayed product title (e.g. "MediaFlow Studio Pro")
  versionText?: string;       // App version pill (e.g. "v26.10.30")
  tagline?: string;           // Subtitle/tagline under product name
  artistName?: string;        // Artist or architect credit (e.g. "Studio Master Build")
  artworkTitle?: string;      // Artwork name or subtitle
  durationMs?: number;        // Display duration in ms (default: 2600ms)
  logoText?: string;          // 2-3 letter monogram (e.g. "MF", "OT", "DF")
  badgeGradient?: string;     // Tailwind gradient or CSS gradient for monogram box
  artworkFit?: "cover" | "contain"; // Default: "cover"
  artworkPosition?: string;   // Default: "center"
}
```

---

## 🛠️ Step-by-Step Implementation Instructions for Child App

### Step 1: Create Universal Loader Resolver Helper in Main Process

Create or place inside your Electron backend (e.g., `electron/splash.ts` or inside `electron/main.ts`):

```typescript
import fs from 'fs';
import path from 'path';
import os from 'os';
import { app, BrowserWindow, screen } from 'electron';

export interface ChildAppLoaderConfig {
  appId: string;
  enabled?: boolean;
  artworkUrl?: string;
  productName?: string;
  versionText?: string;
  tagline?: string;
  artistName?: string;
  artworkTitle?: string;
  durationMs?: number;
  logoText?: string;
  badgeGradient?: string;
}

/**
 * Resolves the dynamic loader configuration for this child app.
 * Replace 'YOUR_APP_ID' with this app's ecosystem ID (e.g. 'one-tap', 'mediaflow-studio', 'docuflow-studio').
 */
export function resolveChildAppLoaderConfig(appId: string, fallbackAppName: string): ChildAppLoaderConfig {
  const defaultFallback: ChildAppLoaderConfig = {
    appId,
    enabled: true,
    productName: fallbackAppName,
    versionText: `v${app.getVersion() || '1.0.0'}`,
    tagline: 'Integrated Anything Workspace Application',
    artistName: 'Anything Creative Ecosystem',
    artworkTitle: 'Master Edition',
    durationMs: 2500,
    logoText: appId.split('-').map(s => s[0]?.toUpperCase()).join('').slice(0, 3) || 'AN',
    badgeGradient: 'linear-gradient(135deg, #3b82f6, #6366f1)',
    artworkUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=85',
  };

  // 1. Check CLI argument --loader-config=...
  for (const arg of process.argv) {
    if (arg.startsWith('--loader-config=')) {
      const cfgPath = arg.replace('--loader-config=', '').replace(/^["']|["']$/g, '');
      if (fs.existsSync(cfgPath)) {
        try {
          return { ...defaultFallback, ...JSON.parse(fs.readFileSync(cfgPath, 'utf-8')) };
        } catch {}
      }
    }
  }

  // 2. Check %APPDATA%/Anything/loaders/<appId>.json
  const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  const candidateGlobalPaths = [
    path.join(appData, 'Anything', 'loaders', `${appId}.json`),
    path.join(appData, 'anything', 'loaders', `${appId}.json`),
  ];

  for (const p of candidateGlobalPaths) {
    if (fs.existsSync(p)) {
      try {
        const loaded = JSON.parse(fs.readFileSync(p, 'utf-8'));
        return { ...defaultFallback, ...loaded };
      } catch (e) {
        console.warn('[Loader] Error reading global config from', p, e);
      }
    }
  }

  // 3. Check bundled or local release loader-config.json
  const candidateLocalPaths = [
    path.join(app.getAppPath(), 'loader-config.json'),
    path.join(process.resourcesPath, 'loader-config.json'),
    path.join(__dirname, '..', 'loader-config.json'),
    path.join(__dirname, 'loader-config.json'),
  ];

  for (const p of candidateLocalPaths) {
    if (fs.existsSync(p)) {
      try {
        const loaded = JSON.parse(fs.readFileSync(p, 'utf-8'));
        return { ...defaultFallback, ...loaded };
      } catch {}
    }
  }

  return defaultFallback;
}
```

---

### Step 2: Standalone Liquid Glass Splash Window Generator

Implement the standalone splash window runner. It generates an in-memory Apple/Adobe Creative Cloud quality HTML splash, renders it centered on the display, and transitions smoothly into your main window:

```typescript
let splashWindow: BrowserWindow | null = null;

export function showChildAppSplash(
  config: ChildAppLoaderConfig,
  onFinished: () => void
): BrowserWindow | null {
  if (config.enabled === false) {
    onFinished();
    return null;
  }

  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } = primaryDisplay.workAreaSize;

  const splashWidth = 720;
  const splashHeight = 440;

  splashWindow = new BrowserWindow({
    width: splashWidth,
    height: splashHeight,
    x: Math.round((screenWidth - splashWidth) / 2),
    y: Math.round((screenHeight - splashHeight) / 2),
    frame: false,
    transparent: true,
    resizable: false,
    alwaysOnTop: true,
    show: false,
    backgroundColor: '#00000000',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  const splashHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; user-select: none; }
    body {
      width: 100vw;
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: transparent;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      overflow: hidden;
    }
    .splash-card {
      width: ${splashWidth}px;
      height: ${splashHeight}px;
      border-radius: 20px;
      position: relative;
      overflow: hidden;
      background: #0f1117;
      box-shadow: 0 25px 60px -12px rgba(0, 0, 0, 0.75), 0 0 0 1px rgba(255, 255, 255, 0.12);
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .artwork-bg {
      position: absolute;
      inset: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      opacity: 0.55;
      filter: saturate(1.15) contrast(1.05);
      transform: scale(1.02);
      transition: transform 6s ease-out;
    }
    .vignette {
      position: absolute;
      inset: 0;
      background: linear-gradient(180deg, rgba(15, 17, 23, 0.2) 0%, rgba(15, 17, 23, 0.85) 75%, rgba(15, 17, 23, 0.98) 100%);
    }
    .content-top {
      position: relative;
      z-index: 10;
      padding: 28px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .brand-cluster {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .monogram-box {
      width: 44px;
      height: 44px;
      border-radius: 12px;
      background: ${config.badgeGradient || 'linear-gradient(135deg, #3b82f6, #6366f1)'};
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 900;
      font-size: 18px;
      letter-spacing: -0.03em;
      box-shadow: 0 8px 20px rgba(0,0,0,0.4);
      border: 1px solid rgba(255,255,255,0.25);
    }
    .title-group h1 {
      color: #ffffff;
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .version-pill {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 9999px;
      background: rgba(255, 255, 255, 0.15);
      border: 1px solid rgba(255, 255, 255, 0.2);
      color: #e2e8f0;
    }
    .title-group p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 12px;
      font-weight: 500;
      margin-top: 2px;
    }
    .content-bottom {
      position: relative;
      z-index: 10;
      padding: 28px 32px;
      display: flex;
      flex-direction: column;
      gap: 14px;
    }
    .meta-credits {
      display: flex;
      align-items: center;
      justify-content: space-between;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 500;
    }
    .progress-bar-bg {
      width: 100%;
      height: 4px;
      background: rgba(255, 255, 255, 0.12);
      border-radius: 9999px;
      overflow: hidden;
      position: relative;
    }
    .progress-bar-fill {
      position: absolute;
      top: 0;
      left: 0;
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #38bdf8, #818cf8, #c084fc);
      border-radius: 9999px;
      animation: loadFill ${Math.max(1800, (config.durationMs || 2500) - 400)}ms cubic-bezier(0.4, 0, 0.2, 1) forwards;
    }
    @keyframes loadFill {
      0% { width: 0%; }
      40% { width: 55%; }
      80% { width: 88%; }
      100% { width: 100%; }
    }
  </style>
</head>
<body>
  <div class="splash-card">
    <img class="artwork-bg" src="${config.artworkUrl}" alt="Artwork" />
    <div class="vignette"></div>

    <div class="content-top">
      <div class="brand-cluster">
        <div class="monogram-box">${config.logoText || 'AN'}</div>
        <div class="title-group">
          <h1>
            <span>${config.productName || 'Child Application'}</span>
            <span class="version-pill">${config.versionText || 'v1.0.0'}</span>
          </h1>
          <p>${config.tagline || 'Integrated Anything Ecosystem Workspace'}</p>
        </div>
      </div>
    </div>

    <div class="content-bottom">
      <div class="meta-credits">
        <span>${config.artworkTitle || 'Artwork Composition'}</span>
        <span>${config.artistName || 'Anything Ecosystem'}</span>
      </div>
      <div class="progress-bar-bg">
        <div class="progress-bar-fill"></div>
      </div>
    </div>
  </div>
</body>
</html>`;

  splashWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(splashHtml)}`);

  splashWindow.once('ready-to-show', () => {
    splashWindow?.show();
  });

  const duration = config.durationMs || 2500;
  setTimeout(() => {
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
    onFinished();
  }, duration);

  return splashWindow;
}
```

---

### Step 3: Wire into App Startup Lifecycle (`electron/main.ts`)

Inside your main application startup code, start the splash screen **first**, load your main window silently in the background, and reveal the main window only once the splash duration completes:

```typescript
app.whenReady().then(() => {
  // 1. Resolve customized configuration for this app (replace 'one-tap' with your actual appId)
  const APP_ID = 'one-tap'; 
  const APP_NAME = 'One Tap';
  const loaderConfig = resolveChildAppLoaderConfig(APP_ID, APP_NAME);

  // 2. Launch Splash Screen
  showChildAppSplash(loaderConfig, () => {
    // 3. When splash finishes, reveal the main application window
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.show();
      mainWindow.focus();
    }
  });

  // 4. Create Main Window in background (show: false)
  createMainWindow();
});

function createMainWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    show: false, // Keep hidden while splash is displaying!
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadURL(RENDERER_URL);
}
```

---

## 🧪 Verification & Acceptance Criteria

1. **Custom Artwork & Text Reflection**:
   - Open Anything → Go to App Details → Customize Loader.
   - Change product name, subtitle/tagline, artwork URL, and duration (e.g. 3000ms).
   - Launch your child app directly or via Anything.
   - **Expected:** The child app splash screen displays the exact updated artwork, title, version, and artist attribution.
2. **Graceful Fallback**:
   - Delete `%APPDATA%\Anything\loaders\<appId>.json`.
   - Launch child app.
   - **Expected:** The child app falls back smoothly to its bundled default splash without crashing or error dialogs.
3. **No Window Flashing**:
   - The main application window never flashes white before the splash completes.
