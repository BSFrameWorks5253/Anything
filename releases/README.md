# 🚀 Anything Child Apps Release Directory

Drop your child app executables and updates here! Anything automatically scans, collects, and deploys them to the launcher.

---

## 📁 How to Structure Your Child Apps

You can drop executables in **two ways**:

### Option 1: Dedicated Folder per App (Recommended)
Create a subfolder named after your app, and place the `.exe` along with an optional `app.json`:
```
releases/
├── my-awesome-tool/
│   ├── my-awesome-tool-v1.0.0.exe
│   └── app.json
└── screen-recorder/
    ├── screen-recorder.exe
    └── app.json
```

### Option 2: Direct Executable Drop
Drop the `.exe` directly into `releases/`:
```
releases/
├── VideoTrimmer-v1.2.0.exe
└── QuickNotes.exe
```
Anything will automatically parse the name, extract the version number, and create a card in the app catalog!

---

## 📄 Manifest Template (`app.json`)
Creating an `app.json` alongside your `.exe` gives you complete control over branding, icons, and auto-updates:

```json
{
  "id": "my-awesome-tool",
  "name": "My Awesome Tool",
  "shortName": "AT",
  "version": "1.0.0",
  "category": "Development",
  "description": "High-performance developer utility built for Anything.",
  "executableName": "my-awesome-tool-v1.0.0.exe",
  "iconType": "emoji",
  "iconValue": "⚡",
  "githubRepo": "your-username/my-awesome-tool"
}
```

---

## 🔄 How Updates Work
Whenever you release a new version:
1. **Local Drop**: Simply put the new `.exe` (e.g. `my-awesome-tool-v1.1.0.exe`) into the app's folder. If `Anything` is running, it instantly detects the new version, updates the catalog, and alerts you that an update is ready!
2. **GitHub Auto-Update**: If you set `"githubRepo": "username/repo"`, Anything will check GitHub Releases in the background and download updates automatically.
