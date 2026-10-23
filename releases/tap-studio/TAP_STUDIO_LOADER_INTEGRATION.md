# Tap Studio & Child App Loader Customization Guide

This guide explains how **Tap Studio** (and any other child application in the Anything ecosystem) receives and renders the customized startup loader configured from Anything.

---

## 1. Where the Customization Lives

When you customize the loader for **Tap Studio** in Anything (under **Settings → Customization**):
1. Anything writes: `releases/tap-studio/loader-config.json`
2. Anything also writes globally to: `%APPDATA%/Anything/loaders/tap-studio.json`
3. If Tap Studio is installed locally, it writes: `apps/tap-studio/loader-config.json`
4. When launching Tap Studio via Anything, the path is also injected via the command-line argument:
   `--loader-config="<path-to-json>"` or environment variable `ANYTHING_LOADER_CONFIG`.

---

## 2. Loader Configuration Schema (`loader-config.json`)

```json
{
  "appId": "tap-studio",
  "productName": "Tap Studio",
  "versionText": "v1.0.0 (x64)",
  "tagline": "Macro Automation & Hardware Deck Companion",
  "artworkUrl": "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85",
  "artistName": "Anything Creation",
  "artworkTitle": "Refractive Glass in Motion",
  "durationMs": 2800,
  "logoText": "Ts",
  "badgeGradient": "from-cyan-600 via-sky-500 to-indigo-600",
  "steps": [
    "Initializing Direct3D 12 low-latency driver...",
    "Scanning USB Stream Deck & Macro Devices...",
    "Loading Hotkeys and Dynamic Keymaps...",
    "Syncing with Anything Ecosystem...",
    "Starting Tap Studio..."
  ],
  "author": "Burhanuddin Sounasath",
  "contactPhone": "8369811201"
}
```

---

## 3. How Tap Studio Consumes the Config (Electron Example)

In Tap Studio's `electron/main.ts` or `src/main.js`:

```javascript
const fs = require('fs');
const path = require('path');
const { app, BrowserWindow, ipcMain } = require('electron');

function loadAnythingLoaderConfig() {
  // 1. Check CLI argument
  const arg = process.argv.find((a) => a.startsWith('--loader-config='));
  if (arg) {
    const filePath = arg.split('=')[1];
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    }
  }

  // 2. Check local working directory
  const localConfig = path.join(__dirname, 'loader-config.json');
  if (fs.existsSync(localConfig)) {
    return JSON.parse(fs.readFileSync(localConfig, 'utf-8'));
  }

  // 3. Check global Anything AppData
  const appDataConfig = path.join(
    process.env.APPDATA || (process.platform === 'darwin' ? process.env.HOME + '/Library/Application Support' : '/var/local'),
    'Anything',
    'loaders',
    'tap-studio.json'
  );
  if (fs.existsSync(appDataConfig)) {
    return JSON.parse(fs.readFileSync(appDataConfig, 'utf-8'));
  }

  // Default fallback
  return {
    productName: 'Tap Studio',
    artistName: 'Anything Creation',
    artworkTitle: 'Refractive Glass in Motion',
    durationMs: 2800
  };
}

// Tap Studio can now show a transparent splash window using this exact config
// before opening its main macro interface!
```

---

## 4. Built by & Maintained by
* **Lead Architect:** Burhanuddin Sounasath
* **Direct Contact:** 8369811201
* **Ecosystem:** Anything Creative & Automation Suite
