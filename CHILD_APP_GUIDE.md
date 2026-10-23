# 📖 Child App Developer Guide for Anything

**Architect & Creator**: Burhanuddin Sounasath (Phone: +91 8369811201)

This guide explains how to create, deploy, and auto-update child apps inside the **Anything** liquid-glass ecosystem.

---

## ⚡ The 3-Step Setup

```
   ┌────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────┐
   │ 1. Build your App      │ ───> │ 2. Drop into releases/  │ ───> │ 3. Anything Auto-Syncs  │
   │ (Electron/Tauri/Python)│      │ (releases/<app>/app.exe)│      │ (Instant launch & tray) │
   └────────────────────────┘      └─────────────────────────┘      └─────────────────────────┘
```

### Step 1: Build a Standalone Executable
You can build your child app using any language or framework:
- **Tauri / Rust**: `npm run tauri build` → ultra-lightweight `.exe` (~8MB)
- **Electron**: `npm run build && electron-builder --win portable` → standalone `.exe`
- **Python**: `pyinstaller --onefile --windowed main.py` → single `.exe`
- **C# / .NET / C++**: compile standalone release binary.

### Step 2: Drop into the `releases/` Folder
Inside your Anything directory, open `releases/`:
```
Anything/releases/
└── video-studio/
    ├── video-studio.exe
    └── app.json
```

### Step 3: That's It!
Anything automatically:
1. Detects the new application.
2. Extracts metadata and versions.
3. Adds it to the **Apps Grid**, **System Tray**, and **Quick Launch**.
4. Fires a Windows Action Center native notification.

---

## 🔄 Two Ways to Release Updates

### Method 1: Local Releases Folder Drop (Offline / Local)
Whenever you make changes to your child app:
1. Build the new `.exe`.
2. Name it with the new version (e.g., `video-studio-v1.1.0.exe`) or replace `video-studio.exe` and bump `version` in `app.json`.
3. Drop it into `releases/video-studio/`.
4. Anything detects the new version and updates the catalog instantly!

### Method 2: GitHub Releases Auto-Update (Cloud / Remote)
Link your GitHub repo in `app.json`:
```json
{
  "id": "video-studio",
  "name": "Video Studio",
  "version": "1.0.0",
  "githubRepo": "username/video-studio"
}
```
Whenever you create a new release on GitHub (e.g. tag `v1.1.0`) with the `.exe` attached:
1. Anything automatically checks GitHub in the background.
2. Displays an "Update Available" badge.
3. Downloads the update in the background with live speed & progress.
4. Hot-swaps the `.exe` without ever reinstalling Anything!

---

## 📋 Full `app.json` Reference

```json
{
  "id": "pixel-forge",
  "name": "Pixel Forge",
  "shortName": "PF",
  "version": "1.0.0",
  "category": "Creative & Design",
  "description": "GPU-accelerated procedural texture and pixel art generator.",
  "executableName": "PixelForge.exe",
  "iconType": "emoji",
  "iconValue": "🎨",
  "gradient": "from-purple-600 via-pink-500 to-rose-400",
  "textColor": "#f43f5e",
  "glowColor": "rgba(244, 63, 94, 0.45)",
  "githubRepo": "your-username/pixel-forge",
  "changelog": [
    "Initial high-performance release",
    "Real-time procedural shaders"
  ]
}
```

Categories available:
- `Creative & Design`
- `Development`
- `Video & 3D`
- `Productivity`
- `Gaming & Media`
- `Custom Tools`
