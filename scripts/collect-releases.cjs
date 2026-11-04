const APP_ICONS = {
  'mediaflow-studio': './app-icons/mediaflow-studio.png',
  'one-tap': './app-icons/one-tap.png',
  'docuflow-studio': './app-icons/docuflow-studio.png',
  'pixelcharm': './app-icons/pixelcharm.png',
  'anything-office': './app-icons/anything-office.svg',
  'anything-data-manage': './app-icons/anything-data-manage.svg',
  'anything-file-manager': './app-icons/anything-file-manager.png',
};
/**
 * Anything Child App Release Collector & Single Canonical Releaser
 * 
 * Enforces the Single Release Repository rule:
 * - The ONLY place for .exe installers is:
 *   "Anything Child app realse/<appId>/V<version>/<AppName>_Setup.exe"
 * - published-apps/ holds ONLY lightweight manifests (app.json, release.json, icons).
 * - releases/ is cleaned so that no duplicate .exe binaries sprawl across the repo.
 * - Updates published-apps/catalog.json with localPackagePath pointing directly to the single canonical location.
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const RELEASES_DIR = path.join(ROOT_DIR, 'releases');
const PUBLISHED_DIR = path.join(ROOT_DIR, 'published-apps');
const CATALOG_PATH = path.join(PUBLISHED_DIR, 'catalog.json');
const CHILD_RELEASES_BASE = path.resolve(ROOT_DIR, '..', 'Anything Child app realse');

// Ensure base directories exist
if (!fs.existsSync(RELEASES_DIR)) fs.mkdirSync(RELEASES_DIR, { recursive: true });
if (!fs.existsSync(PUBLISHED_DIR)) fs.mkdirSync(PUBLISHED_DIR, { recursive: true });
if (!fs.existsSync(CHILD_RELEASES_BASE)) fs.mkdirSync(CHILD_RELEASES_BASE, { recursive: true });

function formatBytes(bytes) {
  if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
  if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return Math.round(bytes / 1024) + ' KB';
}

function extractVersion(str) {
  if (!str) return '1.0.0';
  const match = str.match(/(?:v|version)?[-_]?(\d+\.\d+(?:\.\d+)?)/i);
  return match ? match[1] : '1.0.0';
}

function compareVersions(v1, v2) {
  if (!v1 || !v2) return 0;
  const c1 = String(v1).replace(/^[vV]/, '').split(/[.-]/).map((n) => (isNaN(Number(n)) ? n : Number(n)));
  const c2 = String(v2).replace(/^[vV]/, '').split(/[.-]/).map((n) => (isNaN(Number(n)) ? n : Number(n)));
  const len = Math.max(c1.length, c2.length);
  for (let i = 0; i < len; i++) {
    const a = c1[i] ?? 0;
    const b = c2[i] ?? 0;
    if (typeof a === 'number' && typeof b === 'number') {
      if (a > b) return 1;
      if (a < b) return -1;
    } else {
      const cmp = String(a).localeCompare(String(b));
      if (cmp !== 0) return cmp;
    }
  }
  return 0;
}

function loadCatalog() {
  if (fs.existsSync(CATALOG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf-8'));
    } catch (e) {
      console.warn('⚠️ Could not parse catalog.json, creating fresh array.');
    }
  }
  return [];
}

function saveCatalog(catalog) {
  fs.writeFileSync(CATALOG_PATH, JSON.stringify(catalog, null, 2), 'utf-8');
  const appData = process.env.APPDATA;
  if (appData) {
    const targets = [
      path.join(appData, 'Anything', 'published-apps', 'catalog.json'),
      path.join(appData, 'anything', 'published-apps', 'catalog.json'),
      path.join(appData, 'Anything', 'ecosystem_catalog.json'),
      path.join(appData, 'anything', 'ecosystem_catalog.json')
    ];
    for (const t of targets) {
      try {
        const d = path.dirname(t);
        if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
        fs.writeFileSync(t, JSON.stringify(catalog, null, 2), 'utf-8');
      } catch (e) {}
    }
  }
}

const shaderPresets = [
  { gradient: 'from-blue-600 via-sky-500 to-cyan-400', textColor: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)' },
  { gradient: 'from-violet-700 via-purple-600 to-indigo-500', textColor: '#c084fc', glow: 'rgba(192, 132, 252, 0.45)' },
  { gradient: 'from-amber-600 via-orange-500 to-yellow-400', textColor: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)' },
  { gradient: 'from-emerald-500 via-teal-400 to-cyan-400', textColor: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.45)' },
  { gradient: 'from-pink-600 via-rose-500 to-orange-400', textColor: '#fb7185', glow: 'rgba(251, 113, 133, 0.45)' },
];

function pickReleaseExecutable(files, targetVersion) {
  if (!Array.isArray(files) || files.length === 0) return null;
  const valid = files.filter((f) => {
    const l = f.toLowerCase();
    return (
      (l.endsWith('.exe') || l.endsWith('.msix') || l.endsWith('.appx') || l.endsWith('.msi') || l.endsWith('.zip')) &&
      !l.includes('uninstall') &&
      !l.endsWith('.blockmap')
    );
  });
  if (valid.length === 0) return null;
  if (targetVersion) {
    const cleanVer = String(targetVersion).replace(/^[vV]/, '');
    const verMatch = valid.find((f) => {
      const l = f.toLowerCase();
      return f.includes(cleanVer) && (l.includes('_setup') || l.includes('-setup') || l.includes('setup') || l.includes('installer'));
    }) || valid.find((f) => f.includes(cleanVer));
    if (verMatch) return verMatch;
  }
  valid.sort((a, b) => {
    const verA = extractVersion(a);
    const verB = extractVersion(b);
    const cmp = compareVersions(verB, verA);
    if (cmp !== 0) return cmp;
    const aSetup = (a.toLowerCase().includes('setup') || a.toLowerCase().includes('installer')) ? 1 : 0;
    const bSetup = (b.toLowerCase().includes('setup') || b.toLowerCase().includes('installer')) ? 1 : 0;
    return bSetup - aSetup;
  });
  return valid[0];
}

const KNOWN_ECOSYSTEM_REPOS = {
  'onetap': 'BSFrameWorks5253/onetap-workstation',
  'one-tap': 'BSFrameWorks5253/onetap-workstation',
  'onetap-workstation': 'BSFrameWorks5253/onetap-workstation',
  'mediaflow': 'BSFrameWorks5253/MediaFlow-Studio',
  'mediaflow-studio': 'BSFrameWorks5253/MediaFlow-Studio',
  'docuflow': 'BSFrameWorks5253/VectorForge',
  'docuflow-studio': 'BSFrameWorks5253/VectorForge',
  'vectorforge': 'BSFrameWorks5253/VectorForge',
  'vectorforge-studio': 'BSFrameWorks5253/VectorForge',
  'anything-data-manage': 'BSFrameWorks5253/AIN53',
  'ain53': 'BSFrameWorks5253/AIN53',
  'anything-office': 'BSFrameworks5253/Anything-Office',
  'office': 'BSFrameworks5253/Anything-Office',
  'pixelcharm': 'BSFrameworks5253/Pixelcharm',
};

const APP_ID_NORMALIZE = {
  'docuflow': 'docuflow-studio',
  'mediaflow': 'mediaflow-studio',
  'onetap': 'one-tap',
  'office': 'anything-office',
  'ain53': 'anything-data-manage'
};

function normalizeAppId(id) {
  const clean = String(id || '').toLowerCase().replace(/^app-/, '');
  return APP_ID_NORMALIZE[clean] || clean;
}

/**
 * Migration & Sweep: Ensure all EXEs in releases/ or published-apps/ are migrated
 * to Anything Child app realse and then purged from temporary/duplicate paths.
 */
function sweepLegacyDuplicateExecutables() {
  console.log('🧹 Auditing legacy duplicate .exe files across releases and published-apps...');
  let purgedCount = 0;
  let bytesFreed = 0;

  // 1. Sweep releases/
  if (fs.existsSync(RELEASES_DIR)) {
    const sweepDir = (dir, currentAppId = null) => {
      const items = fs.readdirSync(dir, { withFileTypes: true });
      for (const it of items) {
        const full = path.join(dir, it.name);
        if (it.isDirectory()) {
          const nextAppId = currentAppId || it.name;
          sweepDir(full, nextAppId);
        } else if (it.name.toLowerCase().endsWith('.exe')) {
          const appId = normalizeAppId(currentAppId || 'unknown');
          const ver = extractVersion(it.name) || extractVersion(path.basename(dir)) || '1.0.0';
          const targetDir = path.join(CHILD_RELEASES_BASE, appId, `V${ver}`);
          if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
          const targetExe = path.join(targetDir, it.name);

          // If not in canonical, copy it over first
          if (!fs.existsSync(targetExe)) {
            fs.copyFileSync(full, targetExe);
          }

          // Delete duplicate
          try {
            const size = fs.statSync(full).size;
            fs.unlinkSync(full);
            purgedCount++;
            bytesFreed += size;
          } catch (e) {}
        }
      }
    };
    sweepDir(RELEASES_DIR);
  }

  // 2. Sweep published-apps/ (published-apps must NEVER hold binary .exe files)
  if (fs.existsSync(PUBLISHED_DIR)) {
    for (const appFolder of fs.readdirSync(PUBLISHED_DIR)) {
      const appDir = path.join(PUBLISHED_DIR, appFolder);
      if (!fs.statSync(appDir).isDirectory()) continue;
      const appId = normalizeAppId(appFolder);
      for (const f of fs.readdirSync(appDir)) {
        if (f.toLowerCase().endsWith('.exe')) {
          const full = path.join(appDir, f);
          const ver = extractVersion(f) || '1.0.0';
          const targetDir = path.join(CHILD_RELEASES_BASE, appId, `V${ver}`);
          if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
          const targetExe = path.join(targetDir, f);

          if (!fs.existsSync(targetExe)) {
            fs.copyFileSync(full, targetExe);
          }

          try {
            const size = fs.statSync(full).size;
            fs.unlinkSync(full);
            purgedCount++;
            bytesFreed += size;
          } catch (e) {}
        }
      }
    }
  }

  // 3. Sweep unversioned root duplicate EXEs in Anything Child app realse/<appId>/<exe>
  if (fs.existsSync(CHILD_RELEASES_BASE)) {
    for (const appFolder of fs.readdirSync(CHILD_RELEASES_BASE)) {
      const appDir = path.join(CHILD_RELEASES_BASE, appFolder);
      if (!fs.statSync(appDir).isDirectory()) continue;
      for (const f of fs.readdirSync(appDir)) {
        if (f.toLowerCase().endsWith('.exe')) {
          const full = path.join(appDir, f);
          // Check if there is a version subfolder that contains this exe or a versioned exe
          const ver = extractVersion(f);
          const versionDir = path.join(appDir, `V${ver}`);
          const versionExe = path.join(versionDir, f);
          if (fs.existsSync(versionExe)) {
            try {
              const size = fs.statSync(full).size;
              fs.unlinkSync(full);
              purgedCount++;
              bytesFreed += size;
            } catch (e) {}
          }
        }
      }
    }
  }

  if (purgedCount > 0) {
    console.log(`✨ Reclaimed ${formatBytes(bytesFreed)} by removing ${purgedCount} duplicate executable(s).`);
  }
}

function collectReleases() {
  // First, guarantee no duplicate EXEs exist
  sweepLegacyDuplicateExecutables();

  console.log(`\n🔍 Scanning Canonical Child Releases Repository: ${CHILD_RELEASES_BASE}`);
  const catalog = loadCatalog();
  let updatedCount = 0;
  let addedCount = 0;

  if (!fs.existsSync(CHILD_RELEASES_BASE)) {
    return { success: true, addedCount: 0, updatedCount: 0, total: catalog.length, catalog };
  }

  const appFolders = fs.readdirSync(CHILD_RELEASES_BASE, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith('.'));

  for (const entry of appFolders) {
    const rawAppId = entry.name;
    const appId = normalizeAppId(rawAppId);
    const appDir = path.join(CHILD_RELEASES_BASE, rawAppId);
    const publishedAppDir = path.join(PUBLISHED_DIR, appId);
    if (!fs.existsSync(publishedAppDir)) fs.mkdirSync(publishedAppDir, { recursive: true });

    // Look for manifests
    let manifest = {};
    for (const mf of [
      path.join(appDir, 'app.json'),
      path.join(publishedAppDir, 'app.json'),
      path.join(ROOT_DIR, 'releases', rawAppId, 'app.json'),
      path.join(ROOT_DIR, 'releases', appId, 'app.json')
    ]) {
      if (fs.existsSync(mf)) {
        try { manifest = { ...manifest, ...JSON.parse(fs.readFileSync(mf, 'utf-8')) }; } catch (e) {}
      }
    }

    let releaseMeta = {};
    for (const rf of [
      path.join(appDir, 'release.json'),
      path.join(publishedAppDir, 'release.json'),
      path.join(ROOT_DIR, 'releases', rawAppId, 'release.json'),
      path.join(ROOT_DIR, 'releases', appId, 'release.json')
    ]) {
      if (fs.existsSync(rf)) {
        try { releaseMeta = { ...releaseMeta, ...JSON.parse(fs.readFileSync(rf, 'utf-8')) }; } catch (e) {}
      }
    }

    // Inspect version subdirectories in Anything Child app realse
    const subEntries = fs.readdirSync(appDir, { withFileTypes: true });
    const versionDirs = subEntries.filter((e) => e.isDirectory() && (e.name.toLowerCase().startsWith('v') || /^\d+\.\d+/.test(e.name)));
    let latestSubRelease = null;

    if (versionDirs.length > 0) {
      versionDirs.sort((a, b) => compareVersions(extractVersion(b.name), extractVersion(a.name)));
      for (const vd of versionDirs) {
        const vdPath = path.join(appDir, vd.name);
        const vdFiles = fs.readdirSync(vdPath);
        const candExe = pickReleaseExecutable(vdFiles, extractVersion(vd.name));
        if (candExe) {
          let vdRel = {};
          const rF = vdFiles.find((f) => f.toLowerCase().startsWith('release') && f.toLowerCase().endsWith('.json'));
          if (rF) {
            try { vdRel = JSON.parse(fs.readFileSync(path.join(vdPath, rF), 'utf-8')); } catch(e) {}
          }
          latestSubRelease = {
            dir: vdPath,
            exe: candExe,
            relMeta: vdRel,
            ver: vdRel.version || extractVersion(vd.name) || extractVersion(candExe)
          };
          break;
        }
      }
    }

    // Fallback: check root of appDir if no version folder had an exe
    let exeFile = latestSubRelease ? latestSubRelease.exe : pickReleaseExecutable(fs.readdirSync(appDir));
    let actualExeDir = latestSubRelease ? latestSubRelease.dir : appDir;
    if (latestSubRelease?.relMeta) {
      releaseMeta = { ...releaseMeta, ...latestSubRelease.relMeta };
    }

    if (!exeFile) {
      continue;
    }

    const canonicalExePath = path.join(actualExeDir, exeFile);
    const stats = fs.statSync(canonicalExePath);
    const ext = path.extname(exeFile).toLowerCase();

    const appName = manifest.name || releaseMeta.appName || appId.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const appVersion = (latestSubRelease && latestSubRelease.ver) || releaseMeta.version || manifest.version || extractVersion(exeFile) || '1.0.0';
    const category = manifest.category || 'Productivity & Utilities';
    const description = releaseMeta.summary || manifest.description || `${appName} — Native workstation application for the Anything ecosystem.`;
    const githubRepo = manifest.githubRepo || KNOWN_ECOSYSTEM_REPOS[appId] || undefined;

    // Sync icons and manifests to published-apps/<appId>
    const iconCandidates = ['app-logo.png', 'app-logo.svg', 'logo.png', 'logo.svg', 'icon.png', 'icon.ico'];
    for (const ic of iconCandidates) {
      const srcIc = path.join(appDir, ic);
      if (fs.existsSync(srcIc)) {
        try { fs.copyFileSync(srcIc, path.join(publishedAppDir, ic)); } catch (e) {}
      }
    }

    const shader = shaderPresets[Math.abs(appId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % shaderPresets.length];

    const releaseRecord = {
      version: appVersion,
      executableName: exeFile,
      releaseDate: releaseMeta.releaseDate || new Date().toISOString().slice(0, 10),
      releaseType: releaseMeta.releaseType || 'minor',
      tagline: releaseMeta.tagline || `${appName} v${appVersion} Update`,
      summary: releaseMeta.summary || description,
      newFeatures: Array.isArray(releaseMeta.newFeatures) ? releaseMeta.newFeatures : [],
      improvements: Array.isArray(releaseMeta.improvements) ? releaseMeta.improvements : [],
      fixes: Array.isArray(releaseMeta.fixes) ? releaseMeta.fixes : [],
      sizeFormatted: formatBytes(stats.size),
      downloadUrl: canonicalExePath,
    };

    const existingIndex = catalog.findIndex((a) => a.id === appId);
    const existing = existingIndex >= 0 ? catalog[existingIndex] : null;

    const history = Array.isArray(existing?.history) ? [...existing.history] : [];
    const histIdx = history.findIndex((h) => h.version === appVersion);
    if (histIdx >= 0) {
      history[histIdx] = { ...history[histIdx], ...releaseRecord };
    } else {
      history.unshift(releaseRecord);
    }

    const catalogEntry = {
      id: appId,
      name: appName,
      shortName: (manifest.shortName || appName.slice(0, 2)).toUpperCase(),
      category,
      version: appVersion,
      description,
      executableName: manifest.executableName || exeFile,
      setupExecutableName: exeFile,
      packageFileName: exeFile,
      packageSize: formatBytes(stats.size),
      packageFormat: ext,
      localPackagePath: canonicalExePath,
      downloadUrl: canonicalExePath,
      gradient: manifest.gradient || shader.gradient,
      textColor: manifest.textColor || shader.textColor,
      glowColor: manifest.glowColor || shader.glow,
      iconType: manifest.iconType || 'image',
      iconValue: APP_ICONS[appId] || manifest.iconValue || './app-icons/' + appId + '.png',
      status: (existing?.status === 'installed' || existing?.status === 'ready') ? existing.status : 'not-installed',
      githubRepo,
      endpoints: manifest.endpoints || undefined,
      publishedAt: Date.now(),
      releaseInfo: releaseRecord,
      history,
      changelog: [
        `Release v${appVersion} canonical setup in Anything Child app realse`,
        `Format: ${ext.toUpperCase()} · Size: ${formatBytes(stats.size)}`,
        ...(manifest.changelog || []),
      ],
      addedByCreator: true,
    };

    // Update app.json and release.json in published-apps
    try {
      fs.writeFileSync(path.join(publishedAppDir, 'app.json'), JSON.stringify({ ...manifest, ...catalogEntry }, null, 2), 'utf-8');
      fs.writeFileSync(path.join(publishedAppDir, 'release.json'), JSON.stringify(releaseRecord, null, 2), 'utf-8');
    } catch (e) {}

    if (existingIndex >= 0) {
      const hasNewer = compareVersions(appVersion, existing.version) > 0;
      if (hasNewer) {
        console.log(`  🚀 [UPDATE DETECTED] ${appName}: v${existing.version} ➔ v${appVersion}`);
        catalog[existingIndex] = {
          ...existing,
          ...catalogEntry,
          status: existing.status === 'ready' || existing.status === 'installed' ? 'update-available' : existing.status,
        };
        updatedCount++;
      } else {
        catalog[existingIndex] = {
          ...existing,
          ...catalogEntry,
          localPackagePath: canonicalExePath,
          downloadUrl: canonicalExePath,
          history,
        };
        console.log(`  ✓ ${appName} canonical release linked (v${existing.version})`);
      }
    } else {
      console.log(`  ✨ [NEW APP REGISTERED] ${appName} (v${appVersion})`);
      catalog.unshift(catalogEntry);
      addedCount++;
    }
  }

  saveCatalog(catalog);
  console.log(`\n🎉 Collection Complete! New Apps: ${addedCount} | Updates: ${updatedCount} | Total in Catalog: ${catalog.length}\n`);

  return { success: true, addedCount, updatedCount, total: catalog.length, catalog };
}

// CLI Execution
if (require.main === module) {
  const isWatch = process.argv.includes('--watch') || process.argv.includes('-w');
  collectReleases();

  if (isWatch) {
    console.log(`👀 Watching ${CHILD_RELEASES_BASE} for new releases...`);
    let debounceTimer = null;
    fs.watch(CHILD_RELEASES_BASE, { recursive: true }, (eventType, filename) => {
      if (filename && filename.endsWith('.exe')) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          collectReleases();
        }, 1200);
      }
    });
  }
}

module.exports = {
  collectReleases,
  extractVersion,
  compareVersions,
};
