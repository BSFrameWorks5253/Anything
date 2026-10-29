# 🤖 Master Prompt for AI: How to Build a Professional Child App for Anything

Copy and paste the entire prompt below into any AI coding assistant (**ChatGPT, Claude, Cursor, Antigravity, GitHub Copilot**) to build, package, and integrate a standalone child desktop application for the **Anything** ecosystem.

---

```markdown
You are building a dedicated professional child desktop application for the "Anything" app ecosystem (created by Burhanuddin Sounasath · Phone: 8369811201).

Follow these specifications strictly:

---

### 1. 🎯 Child App Requirements & Executable Standards
1. **Target Operating System**: Windows 10 / Windows 11 (64-bit).
2. **Professional Setup Installer / Build**:
   - The output must be a professional Windows setup installer (e.g., built using electron-builder NSIS, Inno Setup, WiX, or PyInstaller with NSIS wrapper).
   - It **MUST** create a dedicated **Start Menu folder shortcut** named after the app (e.g. `Start Menu > Programs > <AppName> > <AppName>.lnk`).
   - It **MUST** create a desktop shortcut and register a clean uninstaller in Windows Control Panel / Settings.
3. **Executable Naming Convention**:
   - The `.exe` MUST strictly follow this exact format:
     `<AppName>-V-<version>.exe`
   - Examples:
     - `TapStudio-V-1.0.0.exe`
     - `PhotoEditor-V-2.1.0.exe`
     - `AudioMixer-V-1.0.4.exe`

---

### 2. 🖼️ App Listing Icon & Logo Requirements
Anything automatically scans for the app icon inside the app release folder to display it in the Anything App Store, launcher cards, and detailed inspect view.

- **File Name**: `app-logo.png` (or `icon.png`, `logo.png`) placed directly inside the `<AppName>` folder.
- **Dimensions**: **512 x 512 pixels** (Square 1:1 aspect ratio).
- **Format**: 32-bit PNG with alpha transparency (`RGBA`).
- **Safe Area Padding**: Leave approximately **10% to 15% inner padding / margin** around the core glyph so that rounded corners, squircles, and circular badges in Anything never clip the artwork.
- **Visual Style**: High contrast, crisp vector/raster design that renders sharply on both dark glass themes and high-DPI displays.

---

### 3. 📁 Required Directory & Folder Structure
Deliver your release files matching this exact folder layout inside the `release/` (or `releases/`) directory:

```text
release/
  └── <AppName>/                                (e.g., "Tap Studio")
      ├── app-logo.png                          (512x512 PNG listing icon)
      ├── app.json                              (Base identity & cloud endpoints manifest)
      └── V-<version>/                          (e.g., "V-1.0.0")
          ├── <AppName>-V-<version>.exe         (e.g., "TapStudio-V-1.0.0.exe")
          └── release.json                      (Release notes, changelog & animated email)
```

For subsequent updates (e.g., v1.1.0), simply add a new version folder beside the previous ones:
```text
release/
  └── <AppName>/
      ├── app-logo.png
      ├── app.json                              (Update "version": "1.1.0")
      ├── V-1.0.0/
      │   ├── <AppName>-V-1.0.0.exe
      │   └── release.json
      └── V-1.1.0/
          ├── <AppName>-V-1.1.0.exe
          └── release.json
```
Anything's background watcher automatically archives older versions into the Version History rollback drawer so users can switch versions anytime.

---

### 4. 📄 Configuration Manifests

#### A. `app.json` (Base Identity & Endpoints Manifest)
Place this at `release/<AppName>/app.json`:
```json
{
  "id": "my-child-app",
  "name": "My Child App",
  "shortName": "MC",
  "version": "1.0.0",
  "size": "45.0 MB",
  "category": "Productivity",
  "author": "Burhanuddin Sounasath",
  "contact": "8369811201",
  "description": "High-performance developer utility built for the Anything ecosystem.",
  "executableName": "MyChildApp-V-1.0.0.exe",
  "iconType": "image",
  "iconValue": "app-logo.png",
  "gradient": "from-cyan-500 via-sky-500 to-blue-600",
  "textColor": "#38bdf8",
  "glowColor": "rgba(56, 189, 248, 0.45)",
  "githubRepo": "BSFrameWorks5253/MyChildApp",
  "systemRequirements": {
    "os": "Windows 10 / Windows 11 (64-bit)",
    "ram": "8 GB RAM (16 GB Recommended)",
    "gpu": "DirectX 12 / Direct3D 11 Compatible GPU",
    "storage": "100 MB Available Storage"
  },
  "endpoints": {
    "repository": "https://github.com/BSFrameWorks5253/MyChildApp",
    "releasesDashboard": "https://github.com/BSFrameWorks5253/MyChildApp/releases",
    "latestReleaseApi": "https://api.github.com/repos/BSFrameWorks5253/MyChildApp/releases/latest",
    "binaryDownloadPattern": "https://github.com/BSFrameWorks5253/MyChildApp/releases/download/v{version}/MyChildApp-V-{version}.exe"
  }
}
```

#### B. `release.json` (Release Breakdown & Animated Email Dispatcher)
Place this at `release/<AppName>/V-<version>/release.json`:
```json
{
  "appId": "my-child-app",
  "appName": "My Child App",
  "version": "1.0.0",
  "executableName": "MyChildApp-V-1.0.0.exe",
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
    "subject": "🚀 My Child App v1.0.0 is Live in Anything!",
    "preview": "Discover all the capabilities of My Child App with automated updates.",
    "ctaText": "Launch Application",
    "heroGradient": "from-cyan-500 via-sky-500 to-blue-600"
  }
}
```

---

### 5. 🛠️ Professional NSIS / Installer Recipe (electron-builder example)
If using Electron, configure your `package.json` with this NSIS block to ensure a Start Menu folder and clean shortcuts are created:

```json
"build": {
  "appId": "com.burhanuddin.mychildapp",
  "productName": "My Child App",
  "win": {
    "target": "nsis",
    "icon": "assets/icon.ico"
  },
  "nsis": {
    "oneClick": false,
    "allowToChangeInstallationDirectory": true,
    "createDesktopShortcut": true,
    "createStartMenuShortcut": true,
    "shortcutName": "My Child App",
    "artifactName": "${productName}-V-${version}.${ext}",
    "uninstallDisplayName": "My Child App"
  }
}
```

If using Python / Inno Setup:
```pascal
[Icons]
Name: "{group}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
Name: "{group}\Uninstall {#MyAppName}"; Filename: "{uninstallexe}"
Name: "{autodesktop}\{#MyAppName}"; Filename: "{app}\{#MyAppExeName}"
```

---

### 6. 🔄 How Anything Integrates Your App
1. **Zero-Configuration Auto-Discovery**: When you drop the `release/<AppName>/` folder into Anything, Anything detects the `app-logo.png`, registers the app, displays the icon in the store, and enables 1-click install and launch.
2. **Version History & Rollback**: Each version subdirectory (`V-1.0.0`, `V-1.1.0`) is parsed into Anything's Version History table. Users can inspect past release notes, preview the animated update email, and roll back if needed.
3. **Cloud & GitHub Releases**: If `endpoints` are supplied in `app.json`, Anything can check GitHub releases automatically and fetch update binaries over the air!

Now proceed to generate the source code, setup installer build scripts, `app-logo.png`, `app.json`, and `release.json` according to these standards.
```
