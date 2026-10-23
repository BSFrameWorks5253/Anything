# 📖 Child App Developer Guide for Anything

**Architect & Creator**: Burhanuddin Sounasath (Phone: +91 8369811201)

This guide explains how to build, deploy, auto-update, and archive child applications inside the **Anything** liquid-glass ecosystem.

---

## ⚡ 1. Executable Build Standards

Every child app should produce a **professional Windows setup executable**:
1. **Naming Standard**: The executable MUST strictly be named `<AppName>_<version>.exe` (e.g. `PhotoEditor_1.2.0.exe`, `VideoTrimmer_2.0.0.exe`).
2. **Setup Experience**:
   - The installer creates a dedicated **Start Menu folder** named after the app.
   - It creates a **Desktop shortcut**.
   - It registers a clean uninstaller in Windows.

---

## 📁 2. Directory Layout & Files

Place each child app inside a subfolder under `Anything/releases/`:

```
Anything/releases/
└── photo-editor/
    ├── PhotoEditor_1.2.0.exe      <-- The setup executable
    ├── app.json                  <-- Identity and branding
    └── release.json              <-- Changelog & animated email info
```

---

## 📄 3. JSON Configuration Templates

### `app.json` (Identity Manifest)
```json
{
  "id": "photo-editor",
  "name": "Photo Editor Pro",
  "shortName": "PE",
  "version": "1.2.0",
  "category": "Creative & Design",
  "description": "GPU-accelerated photo manipulation and RAW processing suite.",
  "executableName": "PhotoEditor_1.2.0.exe",
  "iconType": "emoji",
  "iconValue": "🎨",
  "gradient": "from-purple-600 via-pink-500 to-rose-400",
  "textColor": "#f43f5e",
  "glowColor": "rgba(244, 63, 94, 0.45)",
  "githubRepo": "your-username/photo-editor"
}
```

### `release.json` (Changelog & Animated Email Dispatcher)
This JSON file drives the **Animated Release Email** dispatched to users and populates the **Version History Archive**:
```json
{
  "appId": "photo-editor",
  "appName": "Photo Editor Pro",
  "version": "1.2.0",
  "executableName": "PhotoEditor_1.2.0.exe",
  "releaseDate": "2026-10-23",
  "releaseType": "minor",
  "tagline": "Neural Grading & 2x Faster Engine",
  "summary": "This release brings 2x faster canvas rendering, WebP/AVIF export presets, and crucial Windows 11 high-DPI fixes.",
  "newFeatures": [
    "Neural Tone Mapping with HDR10+ support",
    "GPU-accelerated blur and bokeh engine",
    "Batch export to WebP and AVIF formats"
  ],
  "improvements": [
    "2.5x faster canvas rendering on 4K/8K displays",
    "Reduced idle RAM footprint by 45MB",
    "Smoother brush stroke interpolation at high zoom levels"
  ],
  "fixes": [
    "Fixed memory leak when repeatedly swapping layer masks",
    "Resolved Windows 11 HDR color banding glitch",
    "Fixed crash when opening corrupted EXIF metadata files"
  ],
  "emailNotification": {
    "subject": "🚀 Photo Editor Pro v1.2.0 is Here: Neural Grading & 2x Faster Canvas!",
    "preview": "Discover all the new features, performance boosts, and fixes in v1.2.0.",
    "ctaText": "Open in Anything",
    "heroGradient": "from-purple-600 via-pink-500 to-rose-400"
  }
}
```

---

## 🔄 4. Version History & Rollback Archive

Whenever a new version is dropped:
1. Anything automatically **archives previous versions** in the app's Version History tab.
2. Users can easily view the exact breakdown of **New Features**, **Improvements**, and **Bug Fixes** for each past release.
3. If an older version is preferred, users simply click **"Use vX.X.X"** or **"Rollback"** to swap the active version in one click!
4. Users can also click **"Release Email"** on any version to view the animated email dispatch that was sent for that release.

---

## 📧 5. Authentication & Email Alerts

In **Settings → Authentication & Animated Email Notifications**:
- Users and developers can configure recipient email addresses.
- Test and preview animated release dispatches live.
- Whenever an app is updated locally or via GitHub, Anything triggers the animated email preview.
