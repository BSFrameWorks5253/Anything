# 🤖 Master Prompt for AI: How to Build a Professional Child App for Anything

Copy and paste the prompt below into any AI coding assistant (ChatGPT, Claude, Cursor, Antigravity, GitHub Copilot) to build a standalone child app that integrates seamlessly with **Anything**.

---

```markdown
You are building a dedicated professional child desktop application for the "Anything" app ecosystem (created by Burhanuddin Sounasath · Phone: 8369811201).

### 🎯 Child App Requirements & Executable Standards
1. **Target Platform**: Windows 10 / 11 (x64).
2. **Professional Setup Installer / Build**:
   - The output must be a professional Windows setup installer or self-extracting executable.
   - It MUST create a proper Start Menu folder shortcut (named after the app) and desktop shortcut.
   - It MUST support clean uninstallation.
3. **Executable Naming Convention**:
   - The `.exe` MUST strictly follow the naming pattern: `<AppName>_<version>.exe`
   - Examples: `PhotoEditor_1.2.0.exe`, `VectorStudio_2.0.1.exe`, `CodeRunner_1.0.0.exe`.
4. **Tech Stack Options**:
   *Exe 
   *msi

### 📦 Output Structure, Manifest & Release JSON
When built, place your executable and two JSON configuration files inside:
`Anything/releases/<your-app-id>/`

1. **`app.json`** (Base Identity Manifest):
```json
{
  "id": "my-child-app",
  "name": "My Child App",
  "shortName": "MC",
  "version": "1.2.0",
  "category": "Development",
  "description": "High-performance developer utility built for Anything.",
  "executableName": "MyChildApp_1.2.0.exe",
  "iconType": "emoji",
  "iconValue": "🚀",
  "gradient": "from-blue-600 via-sky-500 to-cyan-400",
  "textColor": "#38bdf8",
  "glowColor": "rgba(56, 189, 248, 0.45)",
  "githubRepo": "your-github-username/my-child-app"
}
```

2. **`release.json`** (Release Breakdown & Animated Email Dispatcher):
Every release MUST include a `release.json` detailing fixes, improvements, and features:
```json
{
  "appId": "my-child-app",
  "appName": "My Child App",
  "version": "1.2.0",
  "executableName": "MyChildApp_1.2.0.exe",
  "releaseDate": "2026-10-23",
  "releaseType": "minor",
  "tagline": "Spring Speedup & Neural Rendering",
  "summary": "This release brings 2x faster canvas rendering, dark mode enhancements, and resolves Windows 11 high-DPI scaling.",
  "newFeatures": [
    "GPU-accelerated rendering pipeline for real-time 4K previews",
    "Added export presets for WebP, AVIF, and HDR PNG",
    "Start Menu shortcuts and Windows 11 Action Center integration"
  ],
  "improvements": [
    "50% faster startup time from cold launch",
    "Reduced background memory usage by 40MB",
    "Smoother high-refresh-rate cursor tracking"
  ],
  "fixes": [
    "Fixed path resolution on non-C: Windows drives",
    "Resolved occasional flicker during window resizing",
    "Fixed shortcut key conflict with system hotkeys"
  ],
  "emailNotification": {
    "subject": "🚀 My Child App v1.2.0 is Here: 2x Faster Rendering!",
    "preview": "Discover all the new features, performance boosts, and fixes in v1.2.0.",
    "ctaText": "Open in Anything",
    "heroGradient": "from-cyan-500 via-sky-500 to-indigo-600"
  }
}
```

### 🔄 How Anything Handles Updates & Version History
1. **Local Releases**: Whenever you build a new version, drop `MyChildApp_1.3.0.exe` and updated `release.json` into `Anything/releases/my-child-app/`. Anything's background watcher detects it instantly, creates an entry in the Version History archive, and alerts users.
2. **Older Versions & Rollback**: Anything keeps an archive of all previous versions in the Version History tab, allowing users to downgrade or pick older releases anytime!
3. **Animated Email Dispatch**: Anything parses `release.json` and renders an animated release email to notify users with exact fixes, improvements, and new features!

Please build the application code, build configuration (with NSIS setup creating Start Menu folder), and the two JSON files now.
```
