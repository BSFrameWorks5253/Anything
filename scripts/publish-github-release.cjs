#!/usr/bin/env node
/**
 * Automated GitHub Release Publisher for Anything & Child Apps
 * Publishes version-wise releases and uploads setup executables directly to GitHub Releases.
 * 
 * Usage:
 *   node scripts/publish-github-release.cjs                  # Publishes Anything Setup
 *   node scripts/publish-github-release.cjs --app=mediaflow-studio # Publishes MediaFlow Studio
 *   node scripts/publish-github-release.cjs --all            # Publishes Anything and all child apps
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

// Load environment variables from .env if present
const envPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const GITHUB_TOKEN = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

function makeGitHubRequest(options, postData = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, data: parsed, raw: data });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, data, raw: data });
        }
      });
    });

    req.on('error', (err) => reject(err));
    if (postData) {
      if (Buffer.isBuffer(postData)) {
        req.write(postData);
      } else if (typeof postData === 'object') {
        req.write(JSON.stringify(postData));
      } else {
        req.write(postData);
      }
    }
    req.end();
  });
}

function uploadAsset(uploadUrlTemplate, filePath, fileName, token) {
  return new Promise((resolve, reject) => {
    // Template format: https://uploads.github.com/repos/:owner/:repo/releases/:id/assets{?name,label}
    const cleanUrl = uploadUrlTemplate.replace(/\{.*\}/, '');
    const urlObj = new URL(`${cleanUrl}?name=${encodeURIComponent(fileName)}`);
    const fileStats = fs.statSync(filePath);
    const fileStream = fs.createReadStream(filePath);

    const options = {
      hostname: urlObj.hostname,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'User-Agent': 'Anything-Release-Publisher',
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/octet-stream',
        'Content-Length': fileStats.size,
      },
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch {
            resolve(data);
          }
        } else {
          reject(new Error(`Asset upload failed (${res.statusCode}): ${data}`));
        }
      });
    });

    req.on('error', reject);
    fileStream.pipe(req);
  });
}

async function publishReleaseForTarget({ repoOwner, repoName, version, title, body, assetPath, assetName }) {
  const tag = version.startsWith('v') ? version : `v${version}`;
  console.log(`\n======================================================`);
  console.log(`🚀 Preparing GitHub Release: ${repoOwner}/${repoName} [${tag}]`);
  console.log(`📦 Asset: ${assetName} (${(fs.statSync(assetPath).size / (1024 * 1024)).toFixed(1)} MB)`);
  console.log(`======================================================`);

  if (!GITHUB_TOKEN) {
    console.warn(`⚠️ Warning: No GH_TOKEN or GITHUB_TOKEN environment variable found.`);
    console.warn(`   To publish automatically, set: $env:GH_TOKEN="ghp_yourPersonalAccessToken" or add it to .env`);
    console.log(`\n📄 Generated Release Notes preview for ${tag}:`);
    console.log(`------------------------------------------------------`);
    console.log(body);
    console.log(`------------------------------------------------------`);
    return { success: false, reason: 'NO_TOKEN' };
  }

  // 1. Check if release already exists for this tag
  const checkOptions = {
    hostname: 'api.github.com',
    path: `/repos/${repoOwner}/${repoName}/releases/tags/${tag}`,
    method: 'GET',
    headers: {
      'User-Agent': 'Anything-Release-Publisher',
      'Authorization': `Bearer ${GITHUB_TOKEN}`,
      'Accept': 'application/vnd.github.v3+json',
    },
  };

  let releaseData = null;
  const checkRes = await makeGitHubRequest(checkOptions);

  if (checkRes.status === 200 && checkRes.data?.id) {
    console.log(`ℹ️ Existing release found for ${tag} (ID: ${checkRes.data.id}). Updating assets...`);
    releaseData = checkRes.data;

    // Check if asset already exists and remove old one
    if (Array.isArray(releaseData.assets)) {
      const existingAsset = releaseData.assets.find((a) => a.name === assetName);
      if (existingAsset) {
        console.log(`🗑️ Removing older asset "${assetName}" (ID: ${existingAsset.id})...`);
        await makeGitHubRequest({
          hostname: 'api.github.com',
          path: `/repos/${repoOwner}/${repoName}/releases/assets/${existingAsset.id}`,
          method: 'DELETE',
          headers: {
            'User-Agent': 'Anything-Release-Publisher',
            'Authorization': `Bearer ${GITHUB_TOKEN}`,
          },
        });
      }
    }
  } else {
    // 2. Create New Release
    console.log(`✨ Creating new release ${tag} on GitHub...`);
    const createRes = await makeGitHubRequest(
      {
        hostname: 'api.github.com',
        path: `/repos/${repoOwner}/${repoName}/releases`,
        method: 'POST',
        headers: {
          'User-Agent': 'Anything-Release-Publisher',
          'Authorization': `Bearer ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
      },
      {
        tag_name: tag,
        name: title || `${repoName} ${tag}`,
        body: body,
        draft: false,
        prerelease: false,
      }
    );

    if (createRes.status !== 201 && createRes.status !== 200) {
      throw new Error(`Failed to create release (${createRes.status}): ${createRes.raw}`);
    }
    releaseData = createRes.data;
  }

  // 3. Upload Setup Executable
  console.log(`⬆️ Uploading ${assetName} to release...`);
  const uploadResult = await uploadAsset(releaseData.upload_url, assetPath, assetName, GITHUB_TOKEN);
  console.log(`✅ Asset successfully uploaded!`);
  console.log(`🔗 Direct Download URL: ${uploadResult.browser_download_url}`);
  console.log(`🎉 Release is live at: ${releaseData.html_url}`);

  return { success: true, releaseUrl: releaseData.html_url, downloadUrl: uploadResult.browser_download_url };
}

async function main() {
  const args = process.argv.slice(2);
  const targetAppArg = args.find((a) => a.startsWith('--app='));
  const targetApp = targetAppArg ? targetAppArg.split('=')[1] : null;
  const isAll = args.includes('--all');

  const rootDir = path.resolve(__dirname, '..');
  const pkg = JSON.parse(fs.readFileSync(path.join(rootDir, 'package.json'), 'utf-8'));

  // Target 1: Anything App itself
  if (!targetApp || targetApp === 'anything' || isAll) {
    const owner = pkg.build?.publish?.owner || 'BSFrameWorks5253';
    const repo = pkg.build?.publish?.repo || 'Anything';
    const version = pkg.version || '1.0.0';

    // Locate setup executable in release/ or dist/
    const possibleDirs = [path.join(rootDir, 'release'), path.join(rootDir, 'dist')];
    let foundSetup = null;

    for (const dir of possibleDirs) {
      if (!fs.existsSync(dir)) continue;
      const files = fs.readdirSync(dir);
      const candidateExes = files.filter(
        (f) =>
          f.toLowerCase().endsWith('.exe') &&
          !f.toLowerCase().includes('unins') &&
          !f.toLowerCase().endsWith('.blockmap')
      );
      // Prioritize setup executable matching the target version
      const exe = candidateExes.find((f) => f.includes(version)) || candidateExes.sort().reverse()[0];
      if (exe) {
        foundSetup = { path: path.join(dir, exe), name: exe };
        break;
      }
    }

    if (foundSetup) {
      const releaseBody = `## 🚀 Anything v${version}
Apple WWDC26 Liquid Glass UI ecosystem for creative professionals and developer child apps.

### Highlights:
- **Instant Child App Auto-Discovery**: Automatic indexing of child app releases without manual manifests.
- **Native Taskbar & Window Registration**: Windows 11 AppUserModelId grouping with matching branding.
- **Dynamic Loader Configuration**: Live real-time splash screen styling and synchronization.
- **Action Center Notifications**: Interactive Windows toast alerts for updates and ingestions.

### 📥 Download & Install:
Download **[${foundSetup.name}](https://github.com/${owner}/${repo}/releases/download/v${version}/${foundSetup.name})** and run to install or update.`;

      try {
        await publishReleaseForTarget({
          repoOwner: owner,
          repoName: repo,
          version,
          title: `Anything v${version} · Liquid Glass UI`,
          body: releaseBody,
          assetPath: foundSetup.path,
          assetName: foundSetup.name,
        });
      } catch (err) {
        console.error('❌ Error publishing Anything:', err.message);
      }
    } else {
      console.log(`ℹ️ No built setup executable found for Anything in release/. Run "npm run build" first.`);
    }
  }

  // Target 2: Child Apps (e.g. mediaflow-studio)
  const releasesDir = path.join(rootDir, 'releases');
  if (fs.existsSync(releasesDir)) {
    const childApps = fs.readdirSync(releasesDir, { withFileTypes: true }).filter((d) => d.isDirectory());

    for (const appDir of childApps) {
      const appId = appDir.name;
      if (targetApp && targetApp !== appId && !isAll) continue;

      const appPath = path.join(releasesDir, appId);
      const subEntries = fs.readdirSync(appPath, { withFileTypes: true });
      const versionDirs = subEntries.filter((e) => e.isDirectory() && (e.name.startsWith('v') || e.name.startsWith('V')));

      for (const vDir of versionDirs) {
        const vPath = path.join(appPath, vDir.name);
        const appJsonPath = path.join(vPath, 'app.json');
        const releaseJsonPath = path.join(vPath, 'release.json');

        if (!fs.existsSync(appJsonPath)) continue;
        const appData = JSON.parse(fs.readFileSync(appJsonPath, 'utf-8'));
        const releaseData = fs.existsSync(releaseJsonPath)
          ? JSON.parse(fs.readFileSync(releaseJsonPath, 'utf-8'))
          : {};

        const repoUrl = appData.githubRepo || releaseData.githubRepo;
        if (!repoUrl) {
          console.log(`⏭️ Skipping ${appId}: No githubRepo defined in app.json.`);
          continue;
        }

        const [owner, repo] = repoUrl.replace(/^https?:\/\/github\.com\//i, '').split('/');
        const version = appData.version || vDir.name.replace(/^v/i, '');

        // Find setup executable
        const vFiles = fs.readdirSync(vPath);
        const setupExe =
          vFiles.find((f) => f.toLowerCase().includes('setup') && f.toLowerCase().endsWith('.exe')) ||
          vFiles.find((f) => f.toLowerCase().endsWith('.exe'));

        if (!setupExe) {
          console.log(`⏭️ Skipping ${appId} ${version}: No .exe found in ${vPath}`);
          continue;
        }

        const setupPath = path.join(vPath, setupExe);
        const features = (releaseData.newFeatures || []).map((f) => `- ${f}`).join('\n');
        const improvements = (releaseData.improvements || []).map((i) => `- ${i}`).join('\n');
        const fixes = (releaseData.fixes || []).map((f) => `- ${f}`).join('\n');

        const body = `## 🚀 ${appData.name} v${version}
${releaseData.tagline || appData.description}

### ✨ New Features:
${features || '- Integrated with the Anything ecosystem.'}

### ⚡ Improvements:
${improvements || '- Performance optimizations.'}

### 🛠️ Fixes:
${fixes || '- Stability improvements.'}

---
### 📥 Installation:
Download **[${setupExe}](https://github.com/${owner}/${repo}/releases/download/v${version}/${setupExe})** to install or update directly.`;

        try {
          await publishReleaseForTarget({
            repoOwner: owner,
            repoName: repo,
            version,
            title: `${appData.name} v${version} Release`,
            body,
            assetPath: setupPath,
            assetName: setupExe,
          });
        } catch (err) {
          console.error(`❌ Error publishing ${appId}:`, err.message);
        }
      }
    }
  }
}

main().catch(console.error);
