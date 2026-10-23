# 🤖 Master Prompt for AI: How to Build a Child App for Anything

Copy and paste the prompt below into any AI coding assistant (ChatGPT, Claude, Cursor, Antigravity, GitHub Copilot) to build a standalone child app that integrates seamlessly with **Anything**.

---

```markdown
You are building a dedicated child desktop application for the "Anything" app ecosystem (created by Burhanuddin Sounasath).

### 🎯 Child App Requirements
1. **Target Platform**: Windows 10 / 11 (x64).
2. **Output Target**: A single standalone executable (.exe) or portable executable that runs smoothly without external installers.
3. **Preferred Tech Stacks**:
   - Web-based desktop: Electron + Vite + React / Vue / Vanilla TS (packaged via `electron-builder` as portable/nsis).
   - Lightweight native: Tauri + Rust (produces a tiny <10MB .exe).
   - Python tools: PyInstaller (`pyinstaller --noconsole --onefile app.py`).
   - C# / .NET: `dotnet publish -c Release -r win-x64 --self-contained -p:PublishSingleFile=true`.
   - Go: `go build -ldflags="-H windowsgui" -o my-app.exe`.

### 📦 Output Structure & Manifest
When your build is ready, output the executable and an `app.json` file inside a folder named after the app:
Folder path: `Anything/releases/<your-app-id>/`

Create an `app.json` manifest with these exact fields:
```json
{
  "id": "my-child-app",
  "name": "My Child App",
  "shortName": "MC",
  "version": "1.0.0",
  "category": "Development",
  "description": "Short description of what this child app does.",
  "executableName": "my-child-app.exe",
  "iconType": "emoji",
  "iconValue": "🚀",
  "gradient": "from-blue-600 via-sky-500 to-cyan-400",
  "textColor": "#38bdf8",
  "glowColor": "rgba(56, 189, 248, 0.45)",
  "githubRepo": "your-github-username/my-child-app"
}
```

### 🔄 Auto-Update Standards
Anything supports two update channels:
1. **Local Releases Folder**: Whenever a new version is built, saving the new `.exe` into `Anything/releases/<your-app-id>/` (e.g. `my-child-app-v1.1.0.exe`) triggers Anything's watcher to automatically update the launcher.
2. **GitHub Releases Auto-Update**: If `githubRepo` is provided (e.g. `"BSFrameWorks5253/my-child-app"`), publish your new `.exe` to GitHub Releases with tag `v1.1.0`. Anything will automatically query GitHub API, download delta updates, and apply them.

### 🎨 Design & UX Guidelines
- Frameless or Windows 11 Fluent dark mode styling preferred (matches the liquid glass aesthetic of Anything).
- Quick startup time (<1.5 seconds).
- Clean exit on window close.

Please build the application code, build configuration, and the `app.json` manifest now.
```
