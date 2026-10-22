# 📘 ANYTHING — DEVELOPER & AI ARCHITECTURE GUIDANCE
> **Target Audience:** AI Assistants, LLM Coding Agents, and Software Engineers developing applications to be distributed, managed, and auto-updated via **Anything (WWDC26 Liquid Glass Edition)**.

---

## 1. Executive Summary & Ecosystem Overview

**Anything** is a centralized Windows desktop launcher and lifecycle management ecosystem (styled with an Apple WWDC26 full liquid glass aesthetic, modeled after Adobe Creative Cloud). 

It acts as the **Master Distribution Hub** for standalone creative, productivity, and developer tools. Users discover, install, launch ("Open"), repair paths, and cleanly uninstall applications through Anything.

### The Auto-Update & Notification Contract
```
┌────────────────────────────────────────────────────────┐
│  CHILD APPLICATION REPOSITORY (GitHub)                 │
│  - Push release tag: v1.2.0                            │
│  - GitHub Actions compiles Windows binary (.exe / .zip) │
│  - Publishes to GitHub Releases                        │
└──────────────────────────┬─────────────────────────────┘
                           │ (GitHub API: /releases/latest)
                           ▼
┌────────────────────────────────────────────────────────┐
│  ANYTHING (Desktop Master Application)                 │
│  1. Background sync queries GitHub Releases API        │
│  2. Compares: Remote Version (v1.2.0) > Local (v1.0.0) │
│  3. Windows Native Notification Dispatched:            │
│     Title: "🚀 Update Available: [AppName] v1.2.0"     │
│     Body:  "Installed: v1.0.0. Click to update now."  │
│  4. User clicks Notification / Update Button           │
│  5. Stream-downloads asset with real-time speed & %    │
│  6. Replaces binary in %LOCALAPPDATA%\installed-apps   │
│  7. Transitions state back to [Open]                   │
└────────────────────────────────────────────────────────┘
```

---

## 2. Windows Native Notification Specification

Whenever Anything detects an update on GitHub for any installed or managed application, it dispatches an official **Windows 10/11 Action Center Toast Notification**.

### 2.1 Notification Payload Contract
```json
{
  "appUserModelId": "com.burhanuddin.anything",
  "title": "🚀 Update Available: {AppName} v{NewVersion}",
  "body": "Version {NewVersion} is now available on GitHub (Installed: v{CurrentVersion}). Click to download and install.",
  "silent": false,
  "icon": "application_emblem_or_logo.png",
  "clickAction": "FOCUS_ANYTHING_AND_OPEN_UPDATE_MODAL"
}
```

### 2.2 Expected Behavior
- **Action Center Banner**: Appears in the bottom-right corner of the Windows desktop with the system notification chime.
- **On Click**: Brings Anything to the foreground (restores if minimized), switches to the **Apps** tab, and presents the update with the changelog.

---

## 3. Child Application Architecture Rules (For AI Prompts)

When you prompt an AI to create a new application that will be hosted in Anything, **instruct the AI to follow these 5 core rules**:

### Rule 1: Portable Binary & Self-Contained Execution
The application must be distributable as a standalone Windows binary. Supported package formats:
1. **Single Portable `.exe`** (Recommended for lightweight tools, CLI/GUI utilities).
2. **Compressed `.zip` Archive** (Recommended for apps with asset folders, DLLs, dependencies). The main executable should be at the root of the archive (e.g. `MyTool.exe`).
3. **Windows MSIX / APPX** (`.msix` / `.appx` packages).

> **CRITICAL:** Do NOT hardcode absolute file paths to `C:\Program Files\` inside the child app. Use relative paths or `%LOCALAPPDATA%` for application configuration and user data. Anything installs child apps to:
> `%LOCALAPPDATA%\anything\installed-apps\{appId}\`

### Rule 2: Strict Semantic Versioning (SemVer)
- Always follow `vMAJOR.MINOR.PATCH` (e.g. `v1.0.0`, `v1.1.0`, `v2.0.4`).
- Avoid arbitrary tag names like `build-latest` or `snapshot`. Anything's version comparator compares numeric components:
  - `v1.2.0` > `v1.1.9` (Triggers Update)
  - `v1.2.0` == `v1.2.0` (Up to date)

### Rule 3: GitHub Releases Asset Naming Convention
Anything's release scanner scans release assets and automatically selects the Windows binary based on scoring algorithms. Name your release assets following these conventions:

| Package Type | Recommended File Naming Pattern | Example |
| :--- | :--- | :--- |
| **Standalone Portable EXE** | `{appname}-win-x64.exe` or `{appname}.exe` | `pixel-studio-win-x64.exe` |
| **ZIP Archive** | `{appname}-win-x64.zip` or `{appname}-windows.zip` | `video-cutter-win-x64.zip` |
| **MSIX Package** | `{appname}-win-x64.msix` | `audio-synth-win-x64.msix` |

*Avoid uploading only `.tar.gz` or `.dmg` assets without a Windows `.exe` / `.zip`.*

### Rule 4: Structured Markdown Release Notes (Changelog)
Anything parses the GitHub Release body and displays it directly in the app's **Hardware Specs & Changelog** tab.

Format your GitHub Release body like this:
```markdown
## What's Changed
- ⚡ 2x faster GPU canvas rendering using Direct3D
- 🎨 Added 12 new chromatic color presets
- 🐛 Fixed memory leak when exporting high-resolution PNGs

**Full Changelog**: https://github.com/owner/repo/compare/v1.0.0...v1.1.0
```

### Rule 5: Graceful Exit & Clean Replacement
When Anything updates the application, it overwrites the executable or extracts the new `.zip`. Ensure your child app:
- Does not lock its own executable with elevated system locks when not running.
- Closes cleanly when the user terminates it.

---

## 4. Automated GitHub Actions CI/CD Workflow Template

Give this `.github/workflows/release.yml` template to your AI when developing any child application. Whenever you push a tag like `v1.0.1`, GitHub Actions will build the Windows binary and publish the release with assets automatically:

```yaml
name: Build & Publish Release

on:
  push:
    tags:
      - 'v*'

jobs:
  build-and-release:
    runs-on: windows-latest

    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      - name: Setup Node.js (or .NET / Rust / Python / C++)
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Install Dependencies
        run: npm ci

      - name: Build Application Binary
        run: npm run build:win # Adjust to your build command

      - name: Create GitHub Release with Windows Assets
        uses: softprops/action-gh-release@v2
        with:
          tag_name: ${{ github.ref_name }}
          name: ${{ github.ref_name }}
          draft: false
          prerelease: false
          generate_release_notes: true
          files: |
            dist/*.exe
            dist/*.zip
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

---

## 5. Adding Your App into Anything (3 Simple Methods)

### Method A: The Drop & Push Staging Studio (No Coding Required!)
1. Open Anything and click the **Publish** tab.
2. Click **"Open Folder in Explorer"** (opens `packages-inbox/`).
3. Drop your compiled `.exe`, `.msix`, or `.zip`.
4. In the customizer:
   - Enter **App Name**, **Version**, **Category**, and **Icon**.
   - Under **GitHub Release Sync**, paste your `owner/repo` (e.g. `burhanuddin/pixel-studio`).
   - Click **"Fetch Release"** to link future auto-updates.
5. Click **"🚀 PUSH TO USERS"** — it is live in the store instantly!

### Method B: Direct GitHub Repo Import (From Apps Store)
1. In the **Apps** tab, click **"Add Custom App"**.
2. Select **"2. From GitHub Repo"**.
3. Type your `owner/repo` or paste the URL (e.g. `obsidianmd/obsidian-releases` or `yourname/yourapp`).
4. Click **"Fetch & Add"** — Anything inspects the latest release, pulls the description, asset size, and sets up 1-click install.

### Method C: Staging via Local Drop
Drag & drop any `.exe` or `.lnk` directly onto the **Drop Target** on the **Apps** page.

---

## 6. Adobe CC-Style Version History & Rollback System

Just like Adobe Creative Cloud's "Other Versions" menu, Anything allows users to inspect all previous releases published on GitHub and rollback or switch versions with a single click:

- **How it works:** Anything queries the GitHub Releases API (`/repos/{owner}/{repo}/releases?per_page=25`) and displays a chronological timeline in the app's **"Other Versions & Rollback"** tab.
- **Rollback Execution:** Clicking **"⏪ Rollback to vX.X.X"** automatically pulls that specific release's binary, replaces the installed files in `%LOCALAPPDATA%\anything\installed-apps\{appId}\`, and updates the local version registry with an official Windows notification.

---

## 7. Windows System Tray Daemon & Background Auto-Updates

Anything runs as an intelligent Windows background daemon:
- **Minimize to Tray on Close:** Clicking the `X` button hides Anything to the Windows System Tray (notification area near the clock) rather than terminating it.
- **Quick Launch Menu:** Right-clicking the tray icon surfaces a dynamic menu listing all installed applications for instant 1-click launching.
- **Silent Background Checker:** Checks GitHub Releases every hour. When a new version is detected for any app, it fires an Action Center toast notification with the app name, new version, and direct update shortcut.

---

## 8. Verification & Health Checklist

Before distributing an app to users, verify against this checklist:
- [x] Application launches cleanly when double-clicked or opened from Anything.
- [x] Application stores data in `%LOCALAPPDATA%` (not in its installation root).
- [x] GitHub repository has Releases enabled (Releases > Create a new release).
- [x] Release tag adheres to SemVer format (e.g. `v1.0.0`).
- [x] Release contains a Windows asset matching `.exe`, `.msix`, or `.zip`.
- [x] Windows Action Center notification displays when a higher release tag is published on GitHub.
- [x] Clicking **"Update"** in Anything downloads and replaces the binary smoothly.
- [x] "Other Versions & Rollback" allows downgrading or switching to any previous release.
- [x] System Tray icon enables 1-click launching and background monitoring.

