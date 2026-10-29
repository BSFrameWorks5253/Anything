# 🚀 GitHub Releases Auto-Update Guide for Anything & Child Apps

**Detailed Specification**: See [DOCS/AUTO_UPDATE_AND_CHILD_APP_LIFECYCLE.md](file:///c:/Users/Burhanuddin/OneDrive/Desktop/New%20folder%20(2)/Anything/DOCS/AUTO_UPDATE_AND_CHILD_APP_LIFECYCLE.md)

---

## ⚡ Quick Start: Zero-Touch App Registration

To add any new child app to Anything so it automatically lists, tracks releases, and updates without manual manifest creation:

1. Open [`app-sources.json`](file:///c:/Users/Burhanuddin/OneDrive/Desktop/New%20folder%20(2)/Anything/app-sources.json) in the Anything root folder.
2. Paste the app's GitHub repository URL:
   ```json
   [
     "https://github.com/BSFrameWorks5253/MediaFlow-Studio",
     "https://github.com/BSFrameWorks5253/AnotherCreativeTool"
   ]
   ```
3. Save the file! Anything's live watcher immediately queries GitHub, registers the latest setup executable, and adds it to the catalog.

---

## 📦 How to Publish a Release Version-Wise to GitHub

Whenever you build a new version of Anything or a child app:

### 1. Set your GitHub Token (once):
```powershell
$env:GH_TOKEN="ghp_yourGeneratedTokenHere"
```
*(Or save it into a `.env` file in the Anything root directory)*

### 2. Run the Automated Release Publisher:
```powershell
# Publish Anything:
npm run release:github

# Publish a specific child app:
node scripts/publish-github-release.cjs --app=mediaflow-studio

# Publish all child apps and Anything:
npm run release:all
```

The script will:
- Read the version and repository information.
- Locate the built `<AppName>_<version>_Setup.exe` installer.
- Create or update the release tag (`v<version>`) on GitHub.
- Format release notes with new features, improvements, and bug fixes.
- Upload the setup executable asset directly to GitHub Releases.

---

## 🎨 Real-Time Loader Customization

Customizing the splash screen loader for Anything or any child app happens in **real time**:
1. Open Anything → **Settings → Splash Screen Loader**.
2. Select **Anything** or any child app (e.g. **MediaFlow Studio**).
3. Adjust presets, monograms, phrases, background art, or gradients.
4. Changes are broadcast live to all open windows with **zero latency** and synced directly to disk (`loader-config.json`).
