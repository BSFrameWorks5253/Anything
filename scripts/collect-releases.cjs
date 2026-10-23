/**
 * Anything Child App Release Collector
 * 
 * Scans the `releases/` directory for new child app executables,
 * parses metadata / versions, and registers / updates them automatically
 * in `published-apps/catalog.json`.
 * 
 * Usage:
 *   node scripts/collect-releases.cjs
 *   node scripts/collect-releases.cjs --watch
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const RELEASES_DIR = path.join(ROOT_DIR, 'releases');
const PUBLISHED_DIR = path.join(ROOT_DIR, 'published-apps');
const CATALOG_PATH = path.join(PUBLISHED_DIR, 'catalog.json');

// Ensure base directories exist
if (!fs.existsSync(RELEASES_DIR)) fs.mkdirSync(RELEASES_DIR, { recursive: true });
if (!fs.existsSync(PUBLISHED_DIR)) fs.mkdirSync(PUBLISHED_DIR, { recursive: true });

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
  const c1 = v1.replace(/^[vV]/, '').split(/[.-]/).map((n) => (isNaN(Number(n)) ? n : Number(n)));
  const c2 = v2.replace(/^[vV]/, '').split(/[.-]/).map((n) => (isNaN(Number(n)) ? n : Number(n)));
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
}

const shaderPresets = [
  { gradient: 'from-blue-600 via-sky-500 to-cyan-400', textColor: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)' },
  { gradient: 'from-violet-700 via-purple-600 to-indigo-500', textColor: '#c084fc', glow: 'rgba(192, 132, 252, 0.45)' },
  { gradient: 'from-amber-600 via-orange-500 to-yellow-400', textColor: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)' },
  { gradient: 'from-emerald-500 via-teal-400 to-cyan-400', textColor: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.45)' },
  { gradient: 'from-pink-600 via-rose-500 to-orange-400', textColor: '#fb7185', glow: 'rgba(251, 113, 133, 0.45)' },
];

function collectReleases() {
  console.log(`\n🔍 Scanning releases folder: ${RELEASES_DIR}`);
  const catalog = loadCatalog();
  let updatedCount = 0;
  let addedCount = 0;

  const entries = fs.readdirSync(RELEASES_DIR, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules') continue;

    // Case 1: Subdirectory for a specific child app (e.g. releases/my-app/)
    if (entry.isDirectory()) {
      const appDir = path.join(RELEASES_DIR, entry.name);
      const appFiles = fs.readdirSync(appDir);

      // Check for optional app.json / manifest.json
      let manifest = {};
      const manifestFile = appFiles.find((f) => f.toLowerCase() === 'app.json' || f.toLowerCase() === 'manifest.json');
      if (manifestFile) {
        try {
          manifest = JSON.parse(fs.readFileSync(path.join(appDir, manifestFile), 'utf-8'));
        } catch (e) {
          console.warn(`  ⚠️ Could not parse manifest in ${entry.name}`);
        }
      }

      // Find executable or installer
      const exeFile = appFiles.find((f) => {
        const ext = path.extname(f).toLowerCase();
        return ext === '.exe' || ext === '.msix' || ext === '.zip';
      });

      if (!exeFile) {
        console.log(`  ℹ️ Skipping ${entry.name} (no .exe, .msix, or .zip found yet)`);
        continue;
      }

      const exeFullPath = path.join(appDir, exeFile);
      const stats = fs.statSync(exeFullPath);
      const ext = path.extname(exeFile).toLowerCase();

      const appId = manifest.id || `app-${entry.name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const appName = manifest.name || entry.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      const appVersion = manifest.version || extractVersion(exeFile) || '1.0.0';
      const category = manifest.category || 'Custom Tools';
      const description = manifest.description || `Child application ${appName} running inside Anything.`;
      const githubRepo = manifest.githubRepo || undefined;

      // Copy package to published directory: published-apps/<appId>/<exeFile>
      const targetDir = path.join(PUBLISHED_DIR, appId);
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      const destPath = path.join(targetDir, exeFile);

      // Check if file is identical or already copied
      let isNewFile = true;
      if (fs.existsSync(destPath)) {
        const destStats = fs.statSync(destPath);
        if (destStats.size === stats.size && destStats.mtimeMs === stats.mtimeMs) {
          isNewFile = false;
        }
      }

      if (isNewFile) {
        fs.copyFileSync(exeFullPath, destPath);
      }

      const shader = shaderPresets[Math.abs(appId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % shaderPresets.length];

      const catalogEntry = {
        id: appId,
        name: appName,
        shortName: (manifest.shortName || appName.slice(0, 2)).toUpperCase(),
        category,
        version: appVersion,
        description,
        executableName: manifest.executableName || exeFile,
        packageFileName: exeFile,
        packageSize: formatBytes(stats.size),
        packageFormat: ext,
        localPackagePath: destPath,
        gradient: manifest.gradient || shader.gradient,
        textColor: manifest.textColor || shader.textColor,
        glowColor: manifest.glowColor || shader.glow,
        iconType: manifest.iconType || 'emoji',
        iconValue: manifest.iconValue || '⚡',
        status: 'not-installed',
        githubRepo,
        publishedAt: Date.now(),
        changelog: [
          `Release v${appVersion} collected from releases/${entry.name}`,
          `Format: ${ext.toUpperCase()} · Size: ${formatBytes(stats.size)}`,
          ...(manifest.changelog || []),
        ],
        addedByCreator: true,
      };

      const existingIndex = catalog.findIndex((a) => a.id === appId);
      if (existingIndex >= 0) {
        const existing = catalog[existingIndex];
        const hasNewerVersion = compareVersions(appVersion, existing.version) > 0;
        if (hasNewerVersion || isNewFile) {
          console.log(`  🚀 [UPDATE DETECTED] ${appName}: v${existing.version} ➔ v${appVersion}`);
          catalog[existingIndex] = {
            ...existing,
            ...catalogEntry,
            status: existing.status === 'ready' ? 'update-available' : existing.status,
          };
          updatedCount++;
        } else {
          console.log(`  ✓ ${appName} is up to date (v${existing.version})`);
        }
      } else {
        console.log(`  ✨ [NEW APP REGISTERED] ${appName} (v${appVersion})`);
        catalog.unshift(catalogEntry);
        addedCount++;
      }
    }

    // Case 2: Direct executable file in releases/ (e.g. releases/MyNewTool-v1.0.0.exe)
    else if (entry.isFile()) {
      const ext = path.extname(entry.name).toLowerCase();
      if (ext !== '.exe' && ext !== '.msix' && ext !== '.zip') continue;

      const exeFullPath = path.join(RELEASES_DIR, entry.name);
      const stats = fs.statSync(exeFullPath);
      const cleanBase = entry.name.replace(/\.[^/.]+$/, '').replace(/[-_v0-9.]+$/g, '').trim();
      const appName = (cleanBase || 'Application').replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
      const appId = `app-${appName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      const appVersion = extractVersion(entry.name);

      const targetDir = path.join(PUBLISHED_DIR, appId);
      if (!fs.existsSync(targetDir)) fs.mkdirSync(targetDir, { recursive: true });
      const destPath = path.join(targetDir, entry.name);

      fs.copyFileSync(exeFullPath, destPath);

      const shader = shaderPresets[Math.abs(appId.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % shaderPresets.length];

      const catalogEntry = {
        id: appId,
        name: appName,
        shortName: appName.slice(0, 2).toUpperCase(),
        category: 'Custom Tools',
        version: appVersion,
        description: `Direct release executable ${entry.name}`,
        executableName: entry.name,
        packageFileName: entry.name,
        packageSize: formatBytes(stats.size),
        packageFormat: ext,
        localPackagePath: destPath,
        gradient: shader.gradient,
        textColor: shader.textColor,
        glowColor: shader.glow,
        iconType: 'emoji',
        iconValue: '📦',
        status: 'not-installed',
        publishedAt: Date.now(),
        changelog: [`Collected ${entry.name} (v${appVersion})`],
        addedByCreator: true,
      };

      const existingIndex = catalog.findIndex((a) => a.id === appId);
      if (existingIndex >= 0) {
        const existing = catalog[existingIndex];
        if (compareVersions(appVersion, existing.version) > 0) {
          console.log(`  🚀 [UPDATE DETECTED] ${appName}: v${existing.version} ➔ v${appVersion}`);
          catalog[existingIndex] = { ...existing, ...catalogEntry, status: 'update-available' };
          updatedCount++;
        }
      } else {
        console.log(`  ✨ [NEW APP REGISTERED] ${appName} (v${appVersion})`);
        catalog.unshift(catalogEntry);
        addedCount++;
      }
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
    console.log(`👀 Watching ${RELEASES_DIR} for new files... (Press Ctrl+C to exit)`);
    let debounceTimer = null;
    fs.watch(RELEASES_DIR, { recursive: true }, (eventType, filename) => {
      if (filename && (filename.endsWith('.exe') || filename.endsWith('.json') || filename.endsWith('.msix') || filename.endsWith('.zip'))) {
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          console.log(`\n🔔 Change detected in releases: ${filename}`);
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
