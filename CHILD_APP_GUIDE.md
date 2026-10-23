# 📖 Child App Developer Guide for Anything

**Architect & Creator**: Burhanuddin Sounasath (Phone: +91 8369811201)  
**Standard Reference App**: MediaFlow Studio (`mediaflow-studio`)  
**Detailed Specification**: See [DOCS/CHILD_APP_INTEGRATION_GUIDE.md](file:///c:/Users/Burhanuddin/OneDrive/Desktop/New%20folder%20(2)/Anything/DOCS/CHILD_APP_INTEGRATION_GUIDE.md)

This guide explains how to build, deploy, auto-update, and archive child applications inside the **Anything** liquid-glass ecosystem.

---

## ⚡ 1. Executable Build Standards

Every child app should produce a professional Windows binary or installer:
1. **Naming Standard**:
   - Primary executable: `<AppName>_<version>.exe` (e.g. `Mediaflow_studio_6.0.0.exe`).
   - Setup installer: `<AppName>_<version>_Setup.exe` (e.g. `Mediaflow_studio_6.0.0_Setup.exe`).
2. **Setup Experience**:
   - Creates a dedicated Start Menu folder named after the app.
   - Registers a clean desktop shortcut and uninstaller in Windows.

---

## 🖼️ 2. Listing Icon & Logo Requirements

Anything automatically scans for the app icon inside the app's release folder:
- **File Name**: `logo.png` (or `app-logo.png`, `icon.png`, `app.ico`).
- **Dimensions**: **512 x 512 pixels** (Square 1:1 aspect ratio).
- **Format**: 32-bit PNG with transparency (alpha channel).
- **Safe Area Padding**: 10% to 15% inner padding so squircle and circle containers do not clip edges.
- **Visuals**: Modern, high contrast, vibrant visual identity optimized for dark glass UI.

---

## 📁 3. Directory Layout & Files

Place each child app inside the `releases/` (or `release/`) directory with versioned subfolders:

```text
releases/
  └── mediaflow-studio/
      ├── loader-config.json                    (Optional splash screen customization)
      └── v6.0.0/
          ├── app.json                          (Base identity & endpoints manifest)
          ├── release.json                      (Changelog & animated release email)
          ├── logo.png                          (512x512 PNG listing icon)
          ├── app.ico                           (Windows taskbar / exe icon)
          ├── Mediaflow_studio_6.0.0.exe        (Main application binary)
          └── Mediaflow_studio_6.0.0_Setup.exe  (Setup installer)
```

For subsequent versions (e.g. `v6.1.0`), simply create a new version folder beside `v6.0.0/`:
```text
releases/
  └── mediaflow-studio/
      ├── loader-config.json
      ├── v6.0.0/
      │   ├── app.json
      │   ├── release.json
      │   └── Mediaflow_studio_6.0.0.exe
      └── v6.1.0/
          ├── app.json                          (Bump version to "6.1.0")
          ├── release.json                      (New changelog & release notes)
          └── Mediaflow_studio_6.1.0.exe
```

---

## 📄 4. JSON Configuration Templates

### `app.json` (Identity Manifest)
Place at `releases/<app-id>/v<version>/app.json`:
```json
{
  "id": "mediaflow-studio",
  "name": "MediaFlow Studio",
  "shortName": "MS",
  "version": "6.0.0",
  "size": "76.1 MB",
  "category": "Media & Video",
  "author": "Burhanuddin Sounasath",
  "description": "MediaFlow Studio introduces an Apple WWDC26 Liquid Glass UI redesign, native Anything ecosystem loader sync, interactive Action Center toast notifications, and automated GitHub release publishing.",
  "executableName": "Mediaflow_studio_6.0.0.exe",
  "setupExecutableName": "Mediaflow_studio_6.0.0_Setup.exe",
  "iconType": "image",
  "iconValue": "logo.png",
  "gradient": "from-blue-600 to-indigo-700",
  "textColor": "#0066ee",
  "glowColor": "rgba(0, 102, 238, 0.45)",
  "githubRepo": "BSFrameWorks5253/MediaFlow-Studio"
}
```

### `release.json` (Changelog & Animated Email Dispatcher)
Place at `releases/<app-id>/v<version>/release.json`:
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
    "Automated release packaging generating version-wise binaries",
    "Seamless auto-sync directly into the Anything releases catalog"
  ],
  "improvements": [
    "Crisp vector Mf monogram insignia with specular rim matching Anything",
    "Enhanced multi-camera PV separation pipeline and thumbnail memory management",
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

## 🔄 5. Version History & Rollback Archive

Whenever a new version folder is detected:
1. Anything automatically **archives previous versions** in the app's Version History tab.
2. Users can easily view the exact breakdown of **New Features**, **Improvements**, and **Bug Fixes** for each past release.
3. If an older version is preferred, users simply click **"Use vX.X.X"** or **"Rollback"** to swap the active version in one click.
4. Users can also click **"Release Email"** on any version to view the animated email dispatch that was sent for that release.
