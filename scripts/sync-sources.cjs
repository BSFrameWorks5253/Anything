#!/usr/bin/env node
/**
 * Anything App Sources Synchronizer
 * Queries GitHub API for each repository in app-sources.json,
 * generates version-wise release structures in releases/<appId>/,
 * and updates published-apps/catalog.json.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const rootDir = path.resolve(__dirname, '..');
const sourcesFile = path.join(rootDir, 'app-sources.json');
const publishedDir = path.join(rootDir, 'published-apps');
const catalogFile = path.join(publishedDir, 'catalog.json');

if (!fs.existsSync(sourcesFile)) {
  console.error('app-sources.json not found!');
  process.exit(1);
}

const sources = JSON.parse(fs.readFileSync(sourcesFile, 'utf-8'));
console.log(`\n🔄 Found ${sources.length} app source(s) to sync in app-sources.json:\n`);

function parseRepo(url) {
  if (!url) return null;
  let clean = url.trim().replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '');
  clean = clean.replace(/\/releases.*$/i, '').replace(/\/+$/, '');
  const parts = clean.split('/');
  if (parts.length >= 2 && parts[0] && parts[1]) {
    return { owner: parts[0], repo: parts[1] };
  }
  return null;
}

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const headers = {
      'User-Agent': 'Anything-Sources-Sync',
      'Accept': 'application/vnd.github.v3+json',
    };
    if (process.env.GITHUB_TOKEN || process.env.GH_TOKEN) {
      headers['Authorization'] = `Bearer ${process.env.GITHUB_TOKEN || process.env.GH_TOKEN}`;
    }

    const req = https.get(url, { headers }, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(new Error(`Failed to parse JSON response: ${e.message}`));
          }
        } else {
          reject(new Error(`GitHub API HTTP ${res.statusCode}: ${data.slice(0, 200)}`));
        }
      });
    });

    req.on('error', reject);
    req.setTimeout(12000, () => {
      req.destroy();
      reject(new Error('GitHub API request timed out'));
    });
  });
}

function formatBytes(bytes) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${sizes[i]}`;
}

async function run() {
  let catalog = [];
  if (fs.existsSync(catalogFile)) {
    try {
      catalog = JSON.parse(fs.readFileSync(catalogFile, 'utf-8'));
    } catch (e) {
      catalog = [];
    }
  }

  for (const src of sources) {
    const rawUrl = typeof src === 'string' ? src : src.url || src.repo;
    const parsed = parseRepo(rawUrl);
    if (!parsed) {
      console.warn(`⚠️ Could not parse repo URL: ${rawUrl}`);
      continue;
    }

    const explicitName = src.name || (parsed.repo.toLowerCase().includes('onetap') ? 'One Tap' : parsed.repo);
    const appId = src.id || (parsed.repo.toLowerCase().includes('onetap') ? 'onetap-workstation' : parsed.repo.toLowerCase().replace(/[^a-z0-9]/g, '-'));
    const category = src.category || (parsed.repo.toLowerCase().includes('media') ? 'Media & Video' : 'Productivity');

    console.log(`▶ Syncing [${explicitName}] (${parsed.owner}/${parsed.repo})...`);

    try {
      const releases = await fetchJson(`https://api.github.com/repos/${parsed.owner}/${parsed.repo}/releases`);
      if (!Array.isArray(releases) || releases.length === 0) {
        console.warn(`  No releases found for ${parsed.owner}/${parsed.repo}`);
        continue;
      }

      const latestRel = releases[0];
      const version = latestRel.tag_name.replace(/^[vV]/, '');
      const assets = latestRel.assets || [];

      // Find Setup Installer and Standalone Binary
      const setupAsset = assets.find((a) => a.name.toLowerCase().includes('setup') && a.name.endsWith('.exe')) ||
                         assets.find((a) => a.name.endsWith('.exe'));
      const standaloneAsset = assets.find((a) => !a.name.toLowerCase().includes('setup') && a.name.endsWith('.exe')) || setupAsset;

      const setupName = setupAsset ? setupAsset.name : `${explicitName.replace(/\s+/g, '')}_Setup_V${version}.exe`;
      const exeName = standaloneAsset ? standaloneAsset.name : `${explicitName.replace(/\s+/g, '')}_V${version}.exe`;
      const downloadUrl = setupAsset ? setupAsset.browser_download_url : `https://github.com/${parsed.owner}/${parsed.repo}/releases/download/${latestRel.tag_name}/${setupName}`;
      const packageSize = setupAsset ? formatBytes(setupAsset.size) : 'Online Package';

      console.log(`  ✓ Latest Release: ${latestRel.tag_name} (${latestRel.name || 'Release'})`);
      console.log(`  ✓ Installer: ${setupName} (${packageSize})`);
      console.log(`  ✓ Standalone/Trial: ${exeName}`);

      // Ensure directory: releases/<appId>/v<version>/
      const appReleasesDir = path.join(rootDir, 'releases', appId);
      const versionDir = path.join(appReleasesDir, `v${version}`);
      if (!fs.existsSync(versionDir)) {
        fs.mkdirSync(versionDir, { recursive: true });
      }

      const isOneTap =
        appId.includes('onetap') ||
        appId.includes('one-tap') ||
        explicitName.toLowerCase().includes('one tap');
      const gradient = isOneTap
        ? 'from-rose-600 via-red-600 to-amber-500'
        : 'from-blue-600 to-indigo-700';
      const textColor = isOneTap ? '#f43f5e' : '#0066ee';
      const glowColor = isOneTap ? 'rgba(225, 29, 72, 0.45)' : 'rgba(0, 102, 238, 0.45)';
      const appCategory = isOneTap ? 'Media & Production' : category;

      // 1. app.json
      const appJsonPath = path.join(versionDir, 'app.json');
      const appData = {
        id: appId,
        name: explicitName,
        shortName: isOneTap ? 'OT' : explicitName.slice(0, 2).toUpperCase(),
        version,
        category: appCategory,
        description: isOneTap
          ? 'Next-Generation Automated Video Production Workstation, Sequential Multi-Batch Rendering Engine, and Media Asset Management Suite for the Anything ecosystem.'
          : (latestRel.body?.slice(0, 240) || `${explicitName} for the Anything ecosystem.`),
        executableName: isOneTap ? 'One Tap.exe' : exeName,
        setupExecutableName: setupName,
        packageFileName: setupName,
        gradient,
        textColor,
        glowColor,
        githubRepo: `${parsed.owner}/${parsed.repo}`,
        releasesUrl: `https://github.com/${parsed.owner}/${parsed.repo}/releases`,
        releasesTagUrl: `https://github.com/${parsed.owner}/${parsed.repo}/releases/tag/`,
        downloadUrl,
        iconType: 'monogram',
        systemRequirements: {
          os: 'Windows 10 / Windows 11 (64-bit)',
          processor: isOneTap ? 'Intel Core i5 / AMD Ryzen 5 or higher' : 'Intel Core i7 / AMD Ryzen 7',
          ram: isOneTap ? '8 GB RAM (16 GB recommended)' : '16 GB RAM',
          graphics: 'DirectX 11 / DirectX 12 compatible GPU',
          storage: '1 GB available space'
        }
      };
      fs.writeFileSync(appJsonPath, JSON.stringify(appData, null, 2), 'utf-8');

      // 2. release.json
      const releaseJsonPath = path.join(versionDir, 'release.json');
      const releaseFeatures = (latestRel.body || '')
        .split('\n')
        .map((l) => l.trim().replace(/^[-*•]\s*/, ''))
        .filter((l) => l && !l.startsWith('#') && l.length > 5 && !l.toLowerCase().includes('uni desk'))
        .slice(0, 6);

      const releaseData = {
        appId,
        appName: explicitName,
        version,
        executableName: isOneTap ? 'One Tap.exe' : exeName,
        setupExecutableName: setupName,
        releaseDate: latestRel.published_at ? latestRel.published_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
        releaseType: 'major',
        tagline: isOneTap
          ? 'Automated Batch Rendering Engine & VisionOS Design System'
          : `${explicitName} v${version} Official GitHub Release`,
        summary: isOneTap ? `${explicitName} v${version}` : (latestRel.name || `Release ${latestRel.tag_name}`),
        newFeatures: releaseFeatures.length > 0 ? releaseFeatures : [`Automated GitHub Release: ${latestRel.tag_name}`],
        improvements: ['Low latency event loop execution', 'Anything parent ecosystem integration', 'Liquid Glass styling'],
        fixes: ['Stability enhancements and Windows 11 compatibility'],
        emailNotification: {
          subject: `🚀 ${explicitName} v${version} is Available!`,
          preview: `Download or evaluate ${explicitName} v${version} now in Anything.`,
          ctaText: 'Open in Anything',
          heroGradient: gradient
        },
        sizeFormatted: packageSize,
        downloadUrl,
        releasesUrl: `https://github.com/${parsed.owner}/${parsed.repo}/releases`
      };
      fs.writeFileSync(releaseJsonPath, JSON.stringify(releaseData, null, 2), 'utf-8');

      // 3. loader-config.json
      const loaderConfigPath = path.join(appReleasesDir, 'loader-config.json');
      if (!fs.existsSync(loaderConfigPath)) {
        fs.writeFileSync(
          loaderConfigPath,
          JSON.stringify(
            {
              appId,
              appName: explicitName,
              monogram: appData.shortName,
              tagline: `${explicitName} Desktop Workstation`,
              gradient,
              presetId: isOneTap ? 'dark-obsidian' : 'apple-ambient',
              bootPhrases: [
                `Connecting ${explicitName} to Anything...`,
                'Synchronizing hardware macro event loop...',
                'Ready.'
              ]
            },
            null,
            2
          ),
          'utf-8'
        );
      }

      // 4. Update published-apps/catalog.json
      const existingIndex = catalog.findIndex((c) => c.id === appId || (c.name && c.name.toLowerCase() === explicitName.toLowerCase()));
      const historyItems = releases.slice(0, 5).map((r) => {
        const v = r.tag_name.replace(/^[vV]/, '');
        const a = (r.assets || []).find((x) => x.name.toLowerCase().includes('setup') && x.name.endsWith('.exe')) || (r.assets || [])[0];
        return {
          version: v,
          executableName: isOneTap ? 'One Tap.exe' : exeName,
          setupExecutableName: a ? a.name : setupName,
          releaseDate: r.published_at ? r.published_at.slice(0, 10) : '2026-10-23',
          releaseType: 'minor',
          tagline: `${explicitName} v${v}`,
          summary: isOneTap ? `${explicitName} v${v}` : (r.name || `Release ${r.tag_name}`),
          downloadUrl: a ? a.browser_download_url : `https://github.com/${parsed.owner}/${parsed.repo}/releases/download/${r.tag_name}/${setupName}`,
          sizeFormatted: a ? formatBytes(a.size) : 'Release',
        };
      });

      function compareVersions(v1, v2) {
        if (!v1 || !v2) return 0;
        const p1 = String(v1).replace(/^[vV]/, '').split(/[-_]/)[0].split('.').map(Number);
        const p2 = String(v2).replace(/^[vV]/, '').split(/[-_]/)[0].split('.').map(Number);
        const len = Math.max(p1.length, p2.length);
        for (let i = 0; i < len; i++) {
          const n1 = p1[i] || 0;
          const n2 = p2[i] || 0;
          if (n1 > n2) return 1;
          if (n1 < n2) return -1;
        }
        return 0;
      }

      // Check for installed executable on disk and compare versions
      const isMediaFlow = appId.includes('mediaflow') || explicitName.toLowerCase().includes('mediaflow');
      let detectedInstalledPath = undefined;
      let detectedLocalVersion = undefined;

      if (isOneTap) {
        const otPath = 'C:\\Users\\Burhanuddin\\AppData\\Local\\Programs\\One Tap PV Separator\\PV_Separator.exe';
        if (fs.existsSync(otPath)) {
          detectedInstalledPath = otPath;
        }
      } else if (isMediaFlow) {
        const mfPath = 'C:\\Users\\Burhanuddin\\AppData\\Local\\Programs\\MediaFlow Studio\\MediaFlow Studio.exe';
        if (fs.existsSync(mfPath)) {
          detectedInstalledPath = mfPath;
          detectedLocalVersion = '5.0.0';
        }
      }
      if (!detectedInstalledPath && existingIndex >= 0) {
        detectedInstalledPath = catalog[existingIndex].installedPath;
        detectedLocalVersion = catalog[existingIndex].localVersion;
      }

      let appStatus = 'not-installed';
      if (detectedInstalledPath) {
        const hasNewer = detectedLocalVersion ? compareVersions(version, detectedLocalVersion) > 0 : false;
        appStatus = hasNewer ? 'update-available' : 'installed';
      } else if (existingIndex >= 0 && catalog[existingIndex].status) {
        appStatus = catalog[existingIndex].status;
      }

      const catalogItem = {
        ...appData,
        packageSize,
        packageFormat: '.exe',
        status: appStatus,
        installedPath: detectedInstalledPath,
        localVersion: detectedLocalVersion,
        publishedAt: new Date(latestRel.published_at || Date.now()).getTime(),
        releaseInfo: releaseData,
        history: historyItems,
        changelog: releaseFeatures,
        addedByCreator: true
      };

      // Check for local logo PNG to encode as base64 iconValue
      const logoPng = path.join(appReleasesDir, 'app-logo.png');
      if (fs.existsSync(logoPng)) {
        try {
          const b64 = fs.readFileSync(logoPng).toString('base64');
          catalogItem.iconType = 'image';
          catalogItem.iconValue = `data:image/png;base64,${b64}`;
        } catch (e) {}
      }

      if (existingIndex >= 0) {
        catalog[existingIndex] = { ...catalog[existingIndex], ...catalogItem };
        console.log(`  ✓ Updated catalog entry for ${explicitName}`);
      } else {
        catalog.unshift(catalogItem);
        console.log(`  ✓ Added new catalog entry for ${explicitName}`);
      }
    } catch (err) {
      console.error(`  ❌ Failed syncing ${parsed.owner}/${parsed.repo}:`, err.message);
    }
  }

  // Ensure published-apps directory exists
  if (!fs.existsSync(publishedDir)) {
    fs.mkdirSync(publishedDir, { recursive: true });
  }
  fs.writeFileSync(catalogFile, JSON.stringify(catalog, null, 2), 'utf-8');
  console.log(`\n🎉 Sync complete! Catalog updated (${catalog.length} total apps in ${catalogFile})\n`);
}

run().catch((err) => {
  console.error('Fatal sync error:', err);
  process.exit(1);
});
