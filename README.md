# 🌌 Anything Creative Hub & Desktop Distribution Ecosystem

**Architect & Creator**: Burhanuddin Sounasath (8369811201)  
**Platform**: Windows 11 / Electron + Vite + React + TypeScript / Apple WWDC26 Liquid Glass Architecture  

---

## 📌 Master Documentation Index

All child application integration guides, auto-update documentation, and optimization references are centralized in the **[`DOCS/`](file:///c:/Users/Burhanuddin/OneDrive/Desktop/New%20folder%20(2)/Anything/DOCS/INDEX.md)** directory:

* 📚 **[Master Documentation Index (`DOCS/INDEX.md`)](file:///c:/Users/Burhanuddin/OneDrive/Desktop/New%20folder%20(2)/Anything/DOCS/INDEX.md)** — Central directory and quick start matrix.
* ⚙️ **[Child App Integration Guide (`DOCS/CHILD_APP_INTEGRATION_GUIDE.md`)](file:///c:/Users/Burhanuddin/OneDrive/Desktop/New%20folder%20(2)/Anything/DOCS/CHILD_APP_INTEGRATION_GUIDE.md)** — Directory structure, JSON schemas (`app.json`, `release.json`), and executable contracts.
* 🚀 **[Auto-Update & Child App Lifecycle Guide (`DOCS/AUTO_UPDATE_AND_CHILD_APP_LIFECYCLE.md`)](file:///c:/Users/Burhanuddin/OneDrive/Desktop/New%20folder%20(2)/Anything/DOCS/AUTO_UPDATE_AND_CHILD_APP_LIFECYCLE.md)** — Zero-touch `app-sources.json` registration, automated GitHub Releases publishing (`npm run release:github`), Windows 11 Action Center updates, and Creative Cloud style Try/Demo system.
* 🎨 **[Child App Feature Page Optimization Guide (`DOCS/CHILD_APP_FEATURE_PAGE_OPTIMIZATION.md`)](file:///c:/Users/Burhanuddin/OneDrive/Desktop/New%20folder%20(2)/Anything/DOCS/CHILD_APP_FEATURE_PAGE_OPTIMIZATION.md)** — Guide to optimizing the child storefront page (`AppDetailPage.tsx`), 3D branding, hardware specs, changelogs, and interactive sandbox demo simulators.
* 🤖 **[Child App AI Prompt (`CHILD_APP_AI_PROMPT.md`)](file:///c:/Users/Burhanuddin/OneDrive/Desktop/New%20folder%20(2)/Anything/CHILD_APP_AI_PROMPT.md)** — Ready-to-use prompt for AI assistants to scaffold new child apps.

---

## ⚡ Zero-Touch Child App Registration

To add any new child app to Anything, simply add its GitHub repository link to [`app-sources.json`](file:///c:/Users/Burhanuddin/OneDrive/Desktop/New%20folder%20(2)/Anything/app-sources.json):

```json
[
  {
    "url": "https://github.com/BSFrameWorks5253/MediaFlow-Studio",
    "name": "MediaFlow Studio",
    "category": "Media & Video",
    "autoSync": true
  }
]
```

Anything watches this file live and automatically syncs the app into the store with glass cards, search, setup download, trial/demo sandbox, and real-time splash screen loader customization!

---

## 💻 Available Commands

```bash
# Start development environment
npm run dev

# Build production bundle (Vite + Electron)
npm run build

# Publish new release version to GitHub
npm run release:github

# Synchronize sources file
npm run sync:sources
```
