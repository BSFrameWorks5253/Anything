# 🚀 GitHub Releases Auto-Update Guide (No Custom Domain Needed)

This application has `electron-updater` built-in. Whenever you make changes to your code, users' installed apps will **automatically update in the background** without them needing to download a new `.exe`!

---

## 🛠️ Step 1: Link Your GitHub Repository

In [`package.json`](./package.json), update the `publish` field with your actual GitHub username and repository name:

```json
"build": {
  "appId": "com.burhanuddin.creativehub",
  "productName": "Creative Hub",
  "publish": {
    "provider": "github",
    "owner": "YOUR_GITHUB_USERNAME",
    "repo": "YOUR_REPOSITORY_NAME"
  }
}
```

---

## 📦 Step 2: How to Release an Update to All Users

Whenever you make any change (even a 1-line code tweak):

### 1. Bump the version number in `package.json`:
```json
"version": "1.0.1"
```

### 2. Generate your GitHub Token:
1. Go to **GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)**.
2. Generate a token with the **`repo`** scope checked.
3. In PowerShell, set your token:
```powershell
$env:GH_TOKEN="ghp_yourGeneratedTokenHere"
```

### 3. Run the automated release command:
```powershell
npm run release
```

`electron-builder` will:
- Build the optimized Vite web bundle.
- Compile the Electron main process.
- Package the Windows NSIS installer and delta blockmaps (`latest.yml`).
- Automatically create a new Release draft on your GitHub repository with the update files attached!
- Publish the release so it is live immediately.

---

## 🔄 What Happens on the User's PC?

1. When the user opens Creative Hub, `electron-updater` checks GitHub in the background.
2. It detects that version `1.0.1` is newer than their installed `1.0.0`.
3. It downloads only the **delta patch** in the background (usually just 5–15 MB rather than the full installer).
4. The user sees a frosted glass pill: **"Update Ready to Install · Version 1.0.1"**.
5. They click **"Restart & Apply"** (or it updates automatically next time they close the app).
6. **Done! No website, no server, and no manual `.exe` downloading required.**

---

## ⚙️ Automated GitHub Actions (Optional 100% Cloud Workflow)

You can also automate this completely with GitHub Actions:
Whenever you push a tag like `v1.0.1`:
```bash
git tag v1.0.1
git push origin v1.0.1
```
A GitHub Action will build the Windows `.exe` on GitHub's cloud runners and publish the update automatically!
