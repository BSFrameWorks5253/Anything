# 📖 Child App Developer Guide for Anything

**Architect & Creator**: Burhanuddin Sounasath (Phone: +91 8369811201)

This guide explains how to build, deploy, auto-update, and archive child applications inside the **Anything** liquid-glass ecosystem.

---

## ⚡ 1. Executable Build Standards

Every child app should produce a **professional Windows setup executable**:
1. **Naming Standard**: The executable MUST strictly be named:
   `<AppName>-V-<version>.exe` (e.g. `TapStudio-V-1.0.0.exe`, `PhotoEditor-V-1.2.0.exe`).
2. **Setup Experience**:
   - The installer creates a dedicated **Start Menu folder** named after the app.
   - It creates a **Desktop shortcut**.
   - It registers a clean uninstaller in Windows.

---

## 🖼️ 2. Listing Icon & Logo Requirements

Anything automatically scans for the app icon inside the app's release folder:
- **File Name**: `app-logo.png` (or `icon.png`, `logo.png`).
- **Dimensions**: **512 x 512 pixels** (Square 1:1 aspect ratio).
- **Format**: 32-bit PNG with transparency (alpha channel).
- **Safe Area Padding**: 10% to 15% inner padding so squircle and circle containers do not clip edges.
- **Visuals**: Modern, high contrast, vibrant visual identity optimized for dark glass UI.

---

## 📁 3. Directory Layout & Files

Place each child app inside the `release/` (or `releases/`) directory with versioned subfolders:

```text
release/
  └── Tap Studio/
      ├── app-logo.png                          (512x512 PNG listing icon)
      ├── app.json                              (Base identity & endpoints manifest)
      └── V-1.0.0/
          ├── TapStudio-V-1.0.0.exe             (Setup installer)
          └── release.json                      (Changelog & animated release email)
```

For subsequent versions (e.g. `V-1.1.0`), simply create a new version folder beside `V-1.0.0/`:
```text
release/
  └── Tap Studio/
      ├── app-logo.png
      ├── app.json                              (Bump version to "1.1.0")
      ├── V-1.0.0/
      │   ├── TapStudio-V-1.0.0.exe
      │   └── release.json
      └── V-1.1.0/
          ├── TapStudio-V-1.1.0.exe
          └── release.json
```

---

## 📄 4. JSON Configuration Templates

### `app.json` (Identity Manifest)
Place at `release/<AppName>/app.json`:
```json
{
  "id": "tap-studio",
  "name": "Tap Studio",
  "shortName": "TS",
  "version": "1.0.0",
  "size": "42.8 MB",
  "category": "Productivity",
  "author": "Burhanuddin Sounasath",
  "contact": "8369811201",
  "description": "Hardware companion, low-latency stream deck macro controller, and desktop automation suite for the Anything ecosystem.",
  "executableName": "TapStudio-V-1.0.0.exe",
  "iconType": "image",
  "iconValue": "app-logo.png",
  "gradient": "from-cyan-500 via-teal-500 to-emerald-400",
  "textColor": "#2dd4bf",
  "glowColor": "rgba(45, 212, 191, 0.45)",
  "githubRepo": "BSFrameWorks5253/TapDesk",
  "endpoints": {
    "repository": "https://github.com/BSFrameWorks5253/TapDesk",
    "releasesDashboard": "https://github.com/BSFrameWorks5253/TapDesk/releases",
    "latestReleaseApi": "https://api.github.com/repos/BSFrameWorks5253/TapDesk/releases/latest",
    "binaryDownloadPattern": "https://github.com/BSFrameWorks5253/TapDesk/releases/download/v{version}/TapStudio-V-{version}.exe"
  }
}
```

### `release.json` (Changelog & Animated Email Dispatcher)
Place at `release/<AppName>/V-<version>/release.json`:
```json
{
  "appId": "tap-studio",
  "appName": "Tap Studio",
  "version": "1.0.0",
  "executableName": "TapStudio-V-1.0.0.exe",
  "releaseDate": "2026-10-23",
  "releaseType": "major",
  "tagline": "Launch Release & High-Speed Engine",
  "summary": "Initial release featuring ultra low-latency processing, Windows 11 integration, and Anything auto-updates.",
  "newFeatures": [
    "Native Windows 11 Start Menu shortcut integration and clean uninstaller",
    "Full Anything auto-updater and Version History rollback support",
    "GPU-accelerated rendering pipeline with low-latency event loop"
  ],
  "improvements": [
    "Instant cold-start launch in under 400ms on SSDs",
    "Lightweight background RAM footprint (~30MB)"
  ],
  "fixes": [
    "Initial stable release with high-DPI scaling bugfixes"
  ],
  "emailNotification": {
    "subject": "🚀 Tap Studio v1.0.0 is Live in Anything!",
    "preview": "Discover all the capabilities of Tap Studio with automated updates.",
    "ctaText": "Launch Application",
    "heroGradient": "from-cyan-500 via-teal-500 to-emerald-400"
  }
}
```

---

## 🔄 5. Version History & Rollback Archive

Whenever a new version folder is detected:
1. Anything automatically **archives previous versions** in the app's Version History tab.
2. Users can easily view the exact breakdown of **New Features**, **Improvements**, and **Bug Fixes** for each past release.
3. If an older version is preferred, users simply click **"Use vX.X.X"** or **"Rollback"** to swap the active version in one click!
4. Users can also click **"Release Email"** on any version to view the animated email dispatch that was sent for that release.
