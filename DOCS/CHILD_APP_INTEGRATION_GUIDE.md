# 🌐 Anything Child App Integration Specification & Developer Guide

**Author & Creator**: Burhanuddin Sounasath  
**Version**: 2.0 (Windows 11 / Anything Ecosystem)  
**Reference App**: MediaFlow Studio (`mediaflow-studio`)  

---

## 📌 Overview

This document specifies the official architecture, directory layout, JSON schemas, and runtime contracts required for any desktop application to be discovered, listed, installed, launched, auto-updated, and integrated into the **Anything** ecosystem.

When an app adheres to this specification, Anything will automatically:
1. **Discover** the app without requiring manual database or registry changes.
2. **List** it in the Anything App Store catalog with rich glass cards, category filters, and live search.
3. **Display** official vector/raster branding (`logo.png`, `app-logo.png`, `icon.png`, or monogram).
4. **Provide one-click Setup/Install/Launch** and track local installation paths.
5. **Sync Splash Loader Themes** (`loader-config.json`) so the child app launches with matching Liquid Glass animations.
6. **Publish Version History & Changelogs** (`release.json`) with rollback capabilities and email release previews.
7. **Detect GitHub Releases** (`githubRepo`) and notify users via native Windows 11 Action Center toasts.

---

## 🗂️ 1. Directory Structure

Place child app releases inside the `releases/` directory (or `release/`) in the root of the Anything workspace.

### Recommended Production Hierarchy:
```text
Anything/
  └── releases/
      └── <app-id>/                         # e.g. "mediaflow-studio"
          ├── loader-config.json             # Splash screen custom loader parameters
          └── v<version>/                    # e.g. "v6.0.0"
              ├── app.json                   # App identity, metadata & category
              ├── release.json               # Version-specific changelog & email preview
              ├── logo.png                   # 512x512 high-resolution logo (or app-logo.png)
              ├── app.ico                    # Windows icon resource
              ├── <AppName>_<version>.exe    # Standalone executable
              └── <AppName>_<version>_Setup.exe # (Optional) Full Windows Setup installer
```

### Example from MediaFlow Studio:
```text
Anything/
  └── releases/
      └── mediaflow-studio/
          ├── loader-config.json
          └── v6.0.0/
              ├── app.json
              ├── release.json
              ├── logo.png
              ├── app.ico
              ├── Mediaflow_studio_6.0.0.exe
              └── Mediaflow_studio_6.0.0_Setup.exe
```

---

## ⚙️ 2. Metadata Manifest (`app.json`)

The `app.json` file defines the app's persistent identity. It must be valid JSON located in the app's version directory or app root.

### Schema & Fields:

| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | **Yes** | Unique slug for the app (lowercase, alphanumeric, dashes) | `"mediaflow-studio"` |
| `name` | `string` | **Yes** | Full human-readable display name | `"MediaFlow Studio"` |
| `shortName` | `string` | No | 2-letter monogram for fallback cards | `"MS"` |
| `version` | `string` | **Yes** | Semantic version string | `"6.0.0"` |
| `category` | `string` | **Yes** | Catalog filter category | `"Media & Video"`, `"Development"`, `"Productivity"` |
| `description` | `string` | **Yes** | Detailed overview of features and purpose | (Detailed description) |
| `executableName` | `string` | **Yes** | Exact filename of the primary executable | `"Mediaflow_studio_6.0.0.exe"` |
| `setupExecutableName` | `string` | No | Setup installer if separate from main binary | `"Mediaflow_studio_6.0.0_Setup.exe"` |
| `gradient` | `string` | No | Tailwind gradient for card styling | `"from-blue-600 to-indigo-700"` |
| `textColor` | `string` | No | Hex accent color | `"#0066ee"` |
| `glowColor` | `string` | No | RGBA ambient glow | `"rgba(0, 102, 238, 0.45)"` |
| `githubRepo` | `string` | No | GitHub repository (`owner/repo`) for updates | `"BSFrameWorks5253/MediaFlow-Studio"` |
| `iconType` | `string` | No | `"image"`, `"monogram"`, or `"emoji"` | `"image"` |
| `systemRequirements` | `object` | No | OS, RAM, GPU, and storage requirements | `{ "os": "Windows 11", "ram": "8 GB" }` |

### Complete Reference `app.json`:
```json
{
  "id": "mediaflow-studio",
  "name": "MediaFlow Studio",
  "shortName": "MS",
  "version": "6.0.0",
  "category": "Media & Video",
  "description": "MediaFlow Studio introduces an Apple WWDC26 Liquid Glass UI redesign, native Anything ecosystem loader sync, interactive Action Center toast notifications, and automated GitHub release publishing.",
  "executableName": "Mediaflow_studio_6.0.0.exe",
  "setupExecutableName": "Mediaflow_studio_6.0.0_Setup.exe",
  "gradient": "from-blue-600 to-indigo-700",
  "textColor": "#0066ee",
  "glowColor": "rgba(0, 102, 238, 0.45)",
  "githubRepo": "BSFrameWorks5253/MediaFlow-Studio",
  "iconType": "image",
  "systemRequirements": {
    "os": "Windows 10 / Windows 11 (64-bit)",
    "ram": "8 GB RAM (16 GB Recommended)",
    "gpu": "DirectX 12 GPU Accelerated",
    "storage": "80 MB Available Space"
  }
}
```

---

## 🚀 3. Release Manifest (`release.json`)

`release.json` specifies changelogs, new features, improvements, fixes, and email dispatch templates for that specific release version.

### Complete Reference `release.json`:
```json
{
  "appId": "mediaflow-studio",
  "appName": "MediaFlow Studio",
  "version": "6.0.0",
  "executableName": "Mediaflow_studio_6.0.0.exe",
  "releaseDate": "2026-10-23",
  "releaseType": "major",
  "tagline": "Apple WWDC26 Liquid Glass UI, Mf Monogram & Anything Child App Ecosystem",
  "summary": "MediaFlow Studio v6.0.0 introduces an Apple WWDC26 Liquid Glass UI redesign, native Anything ecosystem loader sync, interactive Action Center toast notifications, and automated GitHub release publishing.",
  "newFeatures": [
    "Integrated into Anything Ecosystem with customized startup loader and diagnostic telemetry",
    "Apple WWDC26 Liquid Glass UI with dynamic chromatic ambient lighting and squircle insignia",
    "Automated release packaging generating version-wise binaries"
  ],
  "improvements": [
    "Crisp vector monogram insignia matching Anything design tokens",
    "Native Action Center interactive toast banners for background ingestions and updates"
  ],
  "fixes": [
    "Resolved premature window maximize flicker during startup via splash handoff",
    "Unified storage headroom verification and clean process termination"
  ],
  "emailNotification": {
    "subject": "🚀 MediaFlow Studio v6.0.0: Apple WWDC26 Liquid Glass UI & Anything Ecosystem!",
    "preview": "Discover all the new features, performance boosts, and fixes in v6.0.0.",
    "ctaText": "Open in Anything",
    "heroGradient": "from-cyan-500 via-blue-600 to-indigo-700"
  }
}
```

---

## 🎨 4. Logo & Icon Standards

Anything automatically detects and renders app icons:
- **Accepted Filenames**: `logo.png`, `app-logo.png`, `icon.png`, or `app.ico`.
- **Dimensions**: **512 x 512 pixels** (Square 1:1 aspect ratio).
- **Format**: 32-bit PNG with an alpha channel (transparent background).
- **Padding**: 10% to 15% inner safe-area margin to ensure the logo is not cropped by squircle frames.
- **Conversion**: During collection, Anything automatically converts the logo into an optimized base64 data URI for instant rendering without disk reads.

---

## 💫 5. Startup Splash Loader Integration (`loader-config.json`)

Child apps can synchronize their startup splash experience with Anything by placing a `loader-config.json` file in their root release directory.

### Structure:
```json
{
  "appId": "mediaflow-studio",
  "appName": "MediaFlow Studio",
  "presetId": "apple-ambient",
  "monogram": "Mf",
  "tagline": "Professional Media Ingestion & Multi-Camera Pipeline",
  "gradient": "from-cyan-500 via-blue-600 to-indigo-700",
  "bootPhrases": [
    "Synchronizing with Anything Ecosystem...",
    "Initializing hardware GPU encoders...",
    "Checking media cache integrity...",
    "Ready for production."
  ]
}
```

### Passing Loader Config at Launch:
Anything passes the resolved loader configuration path via the command line when launching the child app:
```bash
Mediaflow_studio_6.0.0.exe --loader-config="C:\Users\<user>\AppData\Roaming\Anything\loaders\mediaflow-studio.json"
```

The child app can inspect `process.argv` (in Electron/Node) or command line arguments (in C#/C++/Rust/Python) to customize its loading splash.

---

## 🔄 6. Auto-Update & GitHub Releases Integration

To support frictionless in-app updates:
1. Provide the GitHub repository in `app.json` under `"githubRepo"` (e.g. `"BSFrameWorks5253/MediaFlow-Studio"`).
2. Follow standard semantic release tags on GitHub: `v6.0.0` or `v6.0.1`.
3. Attach standard Windows assets to the GitHub Release:
   - `<AppName>_<version>_Setup.exe`
   - `<AppName>_<version>.exe`
4. Anything's background update engine polls GitHub's Releases API, detects newer versions, downloads the installer into `packages-inbox/`, and alerts the user with a Windows Action Center notification.

---

## 🗑️ 7. Deletion & Uninstallation Policy

- When an app is deleted via the Anything UI or its release folder is permanently deleted from disk:
  1. The app's entry is removed from `published-apps/catalog.json`.
  2. Its published binaries and local install files are cleaned.
  3. Anything prunes stale cached entries from React state and `localStorage`.
- **Note**: Hardcoding external desktop paths in Anything's engine is forbidden. An app will only appear if its release files exist within the managed `releases/` directory.

---

## ✅ 8. Verification Checklist Before Listing

Before publishing your child app to Anything, verify:
- [ ] Folder is located at `releases/<app-id>/v<version>/`.
- [ ] `app.json` has valid `id`, `name`, `version`, `category`, and `executableName`.
- [ ] `release.json` has `newFeatures`, `improvements`, and `fixes`.
- [ ] `logo.png` is 512x512 transparent PNG.
- [ ] Executable runs cleanly on Windows 10/11 64-bit without administrator prompt requirements for normal operation.
- [ ] Launching Anything automatically discovers the app and notifies: *"🎉 New Child App: <AppName>"*.
