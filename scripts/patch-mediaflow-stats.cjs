const fs = require('fs');
const path = require('path');

// 1. Update mediaflow.service.ts
const servicePath = path.resolve(__dirname, '..', 'electron', 'services', 'mediaflow.service.ts');
let serviceContent = fs.readFileSync(servicePath, 'utf8');

const statsHelper = `
// ── Production Safar Stats Ledger ──────────────────────────────────────────

export function getSafarStatsFilePath(): string {
  const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  const candidates = [
    path.join(appData, 'Anything', 'safar_stats.json'),
    path.join(appData, 'anything', 'safar_stats.json'),
    path.join(os.homedir(), 'OneDrive', 'Desktop', 'Anything Apps', 'MediaFlow-Studio', 'safar_stats.json'),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return candidates[0];
}

export function readSafarStats(): { exists: boolean; filePath: string; records: any[]; lastUpdated?: string } {
  const target = getSafarStatsFilePath();
  if (fs.existsSync(target)) {
    try {
      const content = fs.readFileSync(target, 'utf-8');
      const parsed = JSON.parse(content);
      const stat = fs.statSync(target);
      return {
        exists: true,
        filePath: target,
        records: Array.isArray(parsed) ? parsed : (parsed.records || []),
        lastUpdated: stat.mtime.toISOString(),
      };
    } catch (e) {
      console.warn('[MediaFlow Service] Error reading safar_stats.json:', e);
    }
  }
  return {
    exists: false,
    filePath: target,
    records: [],
  };
}
`;

if (!serviceContent.includes('readSafarStats()')) {
  serviceContent = serviceContent.replace(
    '// ── IPC Handlers Registration',
    statsHelper + '\n// ── IPC Handlers Registration'
  );
}

if (!serviceContent.includes('mediaflow:get-safar-stats')) {
  serviceContent = serviceContent.replace(
    "ipcMain.handle('mediaflow:launch-studio'",
    "ipcMain.handle('mediaflow:get-safar-stats', async () => {\n    return readSafarStats();\n  });\n\n  ipcMain.handle('mediaflow:launch-studio'"
  );
}

fs.writeFileSync(servicePath, serviceContent, 'utf8');
console.log('✓ Updated mediaflow.service.ts');

// 2. Update electron/preload.ts
const preloadPath = path.resolve(__dirname, '..', 'electron', 'preload.ts');
let preloadContent = fs.readFileSync(preloadPath, 'utf8');

if (!preloadContent.includes('mediaflowGetSafarStats')) {
  preloadContent = preloadContent.replace(
    "mediaflowGetBadgesDir: () => ipcRenderer.invoke('mediaflow:get-event-badges-dir'),",
    "mediaflowGetBadgesDir: () => ipcRenderer.invoke('mediaflow:get-event-badges-dir'),\n  mediaflowGetSafarStats: () => ipcRenderer.invoke('mediaflow:get-safar-stats'),"
  );
  fs.writeFileSync(preloadPath, preloadContent, 'utf8');
  console.log('✓ Updated preload.ts');
}
