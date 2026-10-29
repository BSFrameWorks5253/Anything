import http from 'http';
import fs from 'fs';
import path from 'path';
import os from 'os';
import QRCode from 'qrcode';
import { dialog, shell, type BrowserWindow, ipcMain } from 'electron';

export interface ShelfItem {
  id: string;
  name: string;
  size: number;
  sizeFormatted: string;
  mimeType: string;
  isImage: boolean;
  createdAt: string;
  filePath: string;
  thumbnailUrl?: string;
  downloadUrl?: string;
}

export interface ShareServerInfo {
  isRunning: boolean;
  port: number;
  localIp: string;
  shareUrl: string;
  qrDataUrl: string;
  totalItems: number;
}

// ── Directory Helpers ─────────────────────────────────────────────────────

export function getShelfDir(): string {
  const appData = process.env.APPDATA || path.join(os.homedir(), 'AppData', 'Roaming');
  const dir = path.join(appData, 'anything', 'drop-shelf');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  return dir;
}

export function getShelfManifestPath(): string {
  return path.join(getShelfDir(), 'shelf_manifest.json');
}

// ── Local Network IP Resolver ─────────────────────────────────────────────

export function getLocalIpAddress(): string {
  const interfaces = os.networkInterfaces();
  for (const ifaceName of Object.keys(interfaces)) {
    const addresses = interfaces[ifaceName];
    if (!addresses) continue;
    for (const addr of addresses) {
      if (addr.family === 'IPv4' && !addr.internal && (addr.address.startsWith('192.168.') || addr.address.startsWith('10.') || addr.address.startsWith('172.'))) {
        return addr.address;
      }
    }
  }
  // Fallback to any non-internal IPv4
  for (const ifaceName of Object.keys(interfaces)) {
    const addresses = interfaces[ifaceName];
    if (!addresses) continue;
    for (const addr of addresses) {
      if (addr.family === 'IPv4' && !addr.internal) {
        return addr.address;
      }
    }
  }
  return '127.0.0.1';
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function getMimeType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase();
  switch (ext) {
    case '.jpg':
    case '.jpeg':
      return 'image/jpeg';
    case '.png':
      return 'image/png';
    case '.gif':
      return 'image/gif';
    case '.webp':
      return 'image/webp';
    case '.svg':
      return 'image/svg+xml';
    case '.pdf':
      return 'application/pdf';
    case '.txt':
      return 'text/plain';
    case '.json':
      return 'application/json';
    case '.zip':
      return 'application/zip';
    case '.mp4':
      return 'video/mp4';
    default:
      return 'application/octet-stream';
  }
}

// ── Shelf Item Store ──────────────────────────────────────────────────────

let shelfItems: ShelfItem[] = [];

export function loadShelfManifest(): ShelfItem[] {
  try {
    const manifestPath = getShelfManifestPath();
    if (fs.existsSync(manifestPath)) {
      const parsed: ShelfItem[] = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
      // Filter out files that no longer exist on disk
      shelfItems = parsed.filter((item) => fs.existsSync(item.filePath));
      return shelfItems;
    }
  } catch (err) {
    console.warn('[DropShelf] Failed to load manifest:', err);
  }
  shelfItems = [];
  return shelfItems;
}

export function saveShelfManifest(): void {
  try {
    const manifestPath = getShelfManifestPath();
    fs.writeFileSync(manifestPath, JSON.stringify(shelfItems, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[DropShelf] Failed to save manifest:', err);
  }
}

export function addFileToShelf(sourceFilePath: string, customName?: string): ShelfItem | null {
  if (!fs.existsSync(sourceFilePath)) return null;

  try {
    const stat = fs.statSync(sourceFilePath);
    if (!stat.isFile()) return null;

    const fileName = customName || path.basename(sourceFilePath);
    const id = `shelf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const shelfDir = getShelfDir();
    const destPath = path.join(shelfDir, `${id}_${fileName}`);

    // Copy file into shelf store
    fs.copyFileSync(sourceFilePath, destPath);

    const mime = getMimeType(destPath);
    const isImg = mime.startsWith('image/');

    const item: ShelfItem = {
      id,
      name: fileName,
      size: stat.size,
      sizeFormatted: formatBytes(stat.size),
      mimeType: mime,
      isImage: isImg,
      createdAt: new Date().toISOString(),
      filePath: destPath,
    };

    shelfItems.unshift(item);
    saveShelfManifest();
    return item;
  } catch (err) {
    console.error('[DropShelf] Failed to add file to shelf:', err);
    return null;
  }
}

export function addBufferToShelf(buffer: Buffer, fileName: string, mimeType?: string): ShelfItem | null {
  try {
    const id = `shelf_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const shelfDir = getShelfDir();
    const destPath = path.join(shelfDir, `${id}_${fileName}`);

    fs.writeFileSync(destPath, buffer);
    const mime = mimeType || getMimeType(destPath);
    const isImg = mime.startsWith('image/');

    const item: ShelfItem = {
      id,
      name: fileName,
      size: buffer.length,
      sizeFormatted: formatBytes(buffer.length),
      mimeType: mime,
      isImage: isImg,
      createdAt: new Date().toISOString(),
      filePath: destPath,
    };

    shelfItems.unshift(item);
    saveShelfManifest();
    return item;
  } catch (err) {
    console.error('[DropShelf] Failed to add buffer to shelf:', err);
    return null;
  }
}

export function removeShelfItem(id: string): boolean {
  const idx = shelfItems.findIndex((it) => it.id === id);
  if (idx !== -1) {
    const [removed] = shelfItems.splice(idx, 1);
    try {
      if (fs.existsSync(removed.filePath)) {
        fs.unlinkSync(removed.filePath);
      }
    } catch {}
    saveShelfManifest();
    return true;
  }
  return false;
}

export function clearShelf(): void {
  for (const it of shelfItems) {
    try {
      if (fs.existsSync(it.filePath)) fs.unlinkSync(it.filePath);
    } catch {}
  }
  shelfItems = [];
  saveShelfManifest();
}

// ── Mobile Responsive HTML Template ───────────────────────────────────────

function renderMobileHtml(localIp: string, port: number): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Anything · Drop Shelf</title>
  <style>
    :root {
      --bg: #09090b;
      --card-bg: rgba(24, 24, 27, 0.75);
      --card-border: rgba(255, 255, 255, 0.1);
      --text: #fafafa;
      --text-muted: #a1a1aa;
      --accent: #3b82f6;
      --accent-grad: linear-gradient(135deg, #3b82f6, #6366f1);
      --emerald: #10b981;
    }
    @media (prefers-color-scheme: light) {
      :root {
        --bg: #f4f4f5;
        --card-bg: rgba(255, 255, 255, 0.85);
        --card-border: rgba(0, 0, 0, 0.08);
        --text: #18181b;
        --text-muted: #71717a;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; -webkit-tap-highlight-color: transparent; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Roboto, sans-serif;
      background: var(--bg);
      color: var(--text);
      min-height: 100vh;
      padding-bottom: 80px;
    }
    header {
      position: sticky;
      top: 0;
      z-index: 50;
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      background: rgba(9, 9, 11, 0.8);
      border-bottom: 1px solid var(--card-border);
      padding: 16px 20px;
      display: flex;
      align-items: center;
      justify-between: space-between;
    }
    .header-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      width: 100%;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .logo-badge {
      width: 32px;
      height: 32px;
      border-radius: 10px;
      background: var(--accent-grad);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .title-group h1 {
      font-size: 16px;
      font-weight: 700;
      letter-spacing: -0.02em;
    }
    .title-group p {
      font-size: 11px;
      color: var(--text-muted);
    }
    .status-pill {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 10px;
      border-radius: 9999px;
      font-size: 11px;
      font-weight: 600;
      background: rgba(16, 185, 129, 0.15);
      color: var(--emerald);
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .pulse-dot {
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background: var(--emerald);
      animation: pulse 2s infinite;
    }
    @keyframes pulse {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.4; transform: scale(0.8); }
    }
    .container {
      padding: 16px;
      max-width: 640px;
      margin: 0 auto;
    }
    /* Upload Banner */
    .upload-card {
      background: var(--card-bg);
      border: 2px dashed rgba(59, 130, 246, 0.4);
      border-radius: 18px;
      padding: 20px;
      text-align: center;
      margin-bottom: 20px;
      position: relative;
      cursor: pointer;
      transition: all 0.2s;
    }
    .upload-card:active {
      transform: scale(0.98);
      border-color: var(--accent);
    }
    .upload-card input[type="file"] {
      position: absolute;
      inset: 0;
      opacity: 0;
      width: 100%;
      height: 100%;
      cursor: pointer;
    }
    .upload-icon {
      width: 44px;
      height: 44px;
      border-radius: 14px;
      background: rgba(59, 130, 246, 0.15);
      color: var(--accent);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 8px;
    }
    .upload-card h3 {
      font-size: 14px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .upload-card p {
      font-size: 12px;
      color: var(--text-muted);
    }
    /* Section Header */
    .section-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      font-weight: 700;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    /* Grid */
    .grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }
    @media (min-width: 480px) {
      .grid { grid-template-columns: repeat(3, 1fr); }
    }
    .shelf-card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 16px;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 16px rgba(0,0,0,0.15);
      position: relative;
    }
    .thumb-wrap {
      width: 100%;
      height: 140px;
      background: #18181b;
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    .thumb-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .file-icon {
      font-size: 32px;
    }
    .card-body {
      padding: 10px;
      display: flex;
      flex-direction: column;
      gap: 6px;
      flex: 1;
    }
    .card-title {
      font-size: 12px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .card-meta {
      font-size: 10px;
      color: var(--text-muted);
    }
    .btn-download {
      margin-top: auto;
      width: 100%;
      padding: 8px 10px;
      border-radius: 10px;
      border: none;
      background: var(--accent);
      color: white;
      font-weight: 600;
      font-size: 11px;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      text-decoration: none;
      cursor: pointer;
      transition: background 0.15s;
    }
    .btn-download:active {
      opacity: 0.85;
    }
    /* Empty State */
    .empty-state {
      text-align: center;
      padding: 40px 20px;
      color: var(--text-muted);
      font-size: 13px;
    }
    /* Toast */
    .toast {
      position: fixed;
      bottom: 24px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(16, 185, 129, 0.95);
      color: white;
      padding: 10px 18px;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 600;
      box-shadow: 0 10px 25px rgba(0,0,0,0.3);
      display: none;
      z-index: 100;
    }
  </style>
</head>
<body>
  <header>
    <div class="header-content">
      <div class="brand">
        <div class="logo-badge">An</div>
        <div class="title-group">
          <h1>Anything Drop Shelf</h1>
          <p>PC ↔ Mobile Direct Link</p>
        </div>
      </div>
      <div class="status-pill">
        <span class="pulse-dot"></span>
        <span>Connected</span>
      </div>
    </div>
  </header>

  <div class="container">
    <!-- Mobile Upload Trigger -->
    <div class="upload-card">
      <input type="file" id="mobileFileInput" multiple accept="image/*,*/*" onchange="handleUpload(event)">
      <div class="upload-icon">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
          <polyline points="17 8 12 3 7 8"></polyline>
          <line x1="12" y1="3" x2="12" y2="15"></line>
        </svg>
      </div>
      <h3>Send Photos to PC Shelf</h3>
      <p>Tap to pick from Camera Roll or take a photo</p>
    </div>

    <!-- Active Shelf Grid -->
    <div class="section-title">
      <span id="shelfCountLabel">Shelf Items (0)</span>
      <span style="font-size: 10px; color: var(--accent); cursor: pointer;" onclick="fetchItems()">Refresh</span>
    </div>

    <div id="gridContainer" class="grid">
      <!-- Injected via JavaScript -->
    </div>

    <div id="emptyContainer" class="empty-state" style="display: none;">
      <p>The Drop Shelf is currently empty.</p>
      <p style="font-size: 11px; margin-top: 4px;">Drag files into Anything on your PC or tap above to send photos.</p>
    </div>
  </div>

  <div id="toast" class="toast">Uploaded to PC!</div>

  <script>
    let currentItems = [];

    async function fetchItems() {
      try {
        const res = await fetch('/api/files');
        const data = await res.json();
        currentItems = data.items || [];
        renderGrid();
      } catch (err) {
        console.error('Failed to load items:', err);
      }
    }

    function renderGrid() {
      const grid = document.getElementById('gridContainer');
      const empty = document.getElementById('emptyContainer');
      const countLabel = document.getElementById('shelfCountLabel');

      countLabel.textContent = 'Shelf Items (' + currentItems.length + ')';

      if (currentItems.length === 0) {
        grid.innerHTML = '';
        empty.style.display = 'block';
        return;
      }

      empty.style.display = 'none';
      grid.innerHTML = currentItems.map(item => {
        const isImg = item.isImage;
        const thumbHtml = isImg
          ? '<img src="/preview/' + item.id + '" alt="' + item.name + '" loading="lazy">'
          : '<div class="file-icon">📄</div>';

        return '<div class="shelf-card">' +
          '<div class="thumb-wrap">' + thumbHtml + '</div>' +
          '<div class="card-body">' +
            '<div class="card-title" title="' + item.name + '">' + item.name + '</div>' +
            '<div class="card-meta">' + item.sizeFormatted + '</div>' +
            '<a href="/download/' + item.id + '" download="' + item.name + '" class="btn-download">' +
              '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>' +
              'Download' +
            '</a>' +
          '</div>' +
        '</div>';
      }).join('');
    }

    async function handleUpload(e) {
      const files = e.target.files;
      if (!files || files.length === 0) return;

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const formData = new FormData();
        formData.append('file', file, file.name);

        try {
          await fetch('/api/upload', {
            method: 'POST',
            body: formData,
          });
        } catch (err) {
          console.error('Upload failed:', err);
        }
      }

      showToast('✓ ' + files.length + ' file(s) sent to PC!');
      e.target.value = '';
      fetchItems();
    }

    function showToast(msg) {
      const t = document.getElementById('toast');
      t.textContent = msg;
      t.style.display = 'block';
      setTimeout(() => { t.style.display = 'none'; }, 3000);
    }

    // Initial load + silent 3s background polling
    fetchItems();
    setInterval(fetchItems, 3000);
  </script>
</body>
</html>`;
}

// ── HTTP Sharing Server ───────────────────────────────────────────────────

let shareServer: http.Server | null = null;
const SERVER_PORT = 49153;

export function startDropShelfServer(onItemUploaded?: (item: ShelfItem) => void): Promise<ShareServerInfo> {
  return new Promise(async (resolve) => {
    loadShelfManifest();
    const localIp = getLocalIpAddress();
    const shareUrl = `http://${localIp}:${SERVER_PORT}/share`;

    if (shareServer) {
      const qrDataUrl = await QRCode.toDataURL(shareUrl, { margin: 1, width: 280 });
      return resolve({
        isRunning: true,
        port: SERVER_PORT,
        localIp,
        shareUrl,
        qrDataUrl,
        totalItems: shelfItems.length,
      });
    }

    shareServer = http.createServer((req, res) => {
      // Enable CORS for modern fetch
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

      if (req.method === 'OPTIONS') {
        res.writeHead(200);
        return res.end();
      }

      const parsedUrl = new URL(req.url || '/', `http://${localIp}:${SERVER_PORT}`);
      const pathname = parsedUrl.pathname;

      // 1. Mobile App HTML
      if (pathname === '/' || pathname === '/share') {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        return res.end(renderMobileHtml(localIp, SERVER_PORT));
      }

      // 2. API: List Shelf Items
      if (pathname === '/api/files') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, count: shelfItems.length, items: shelfItems }));
      }

      // 2.1 API: Ecosystem Health Check
      if (pathname === '/api/health') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({
          status: 'ok',
          service: 'Anything Ecosystem Gateway',
          port: SERVER_PORT,
          version: '26.10.30',
          timestamp: new Date().toISOString()
        }));
      }

      // 2.2 API: Ecosystem Catalog for Desktop & Mobile Child Apps
      if (pathname === '/api/catalog' || pathname === '/api/ecosystem/catalog') {
        const appData = process.env.APPDATA || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Roaming') : '');
        const catCandidates = [
          path.resolve(__dirname, '..', '..', 'published-apps', 'catalog.json'),
          path.join(appData, 'Anything', 'published-apps', 'catalog.json'),
          path.join(appData, 'Anything', 'ecosystem_catalog.json'),
          path.join(appData, 'anything', 'published-apps', 'catalog.json'),
          path.join(appData, 'anything', 'ecosystem_catalog.json'),
          'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything\\Anything\\published-apps\\catalog.json'
        ];
        let catalogData: any[] = [];
        for (const c of catCandidates) {
          if (fs.existsSync(c)) {
            try {
              const parsed = JSON.parse(fs.readFileSync(c, 'utf-8'));
              if (Array.isArray(parsed) && parsed.length > 0) {
                catalogData = parsed;
                break;
              }
            } catch {}
          }
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: true, count: catalogData.length, apps: catalogData, timestamp: Date.now() }));
      }

      // 2.3 API: Specific App Update Query
      if (pathname.startsWith('/api/updates/')) {
        const appId = pathname.replace('/api/updates/', '').toLowerCase().replace(/^app-/, '');
        const appData = process.env.APPDATA || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Roaming') : '');
        const catCandidates = [
          path.resolve(__dirname, '..', '..', 'published-apps', 'catalog.json'),
          path.join(appData, 'Anything', 'published-apps', 'catalog.json'),
          path.join(appData, 'Anything', 'ecosystem_catalog.json'),
          'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything\\Anything\\published-apps\\catalog.json'
        ];
        let matched: any = null;
        for (const c of catCandidates) {
          if (fs.existsSync(c)) {
            try {
              const list = JSON.parse(fs.readFileSync(c, 'utf-8'));
              if (Array.isArray(list)) {
                matched = list.find((a: any) => {
                  const clean = (a.id || '').toLowerCase().replace(/^app-/, '');
                  return clean === appId || (a.name || '').toLowerCase().replace(/\s+/g, '-') === appId;
                });
                if (matched) break;
              }
            } catch {}
          }
        }
        if (matched) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, app: matched }));
        }
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: `App "${appId}" not found in ecosystem catalog` }));
      }

      // 2.4 API: High-Speed LAN Download of Cached Installer from packages-inbox or releases
      if (pathname.startsWith('/api/download-package/') || pathname.startsWith('/api/download/')) {
        const appId = pathname.replace('/api/download-package/', '').replace('/api/download/', '').toLowerCase().replace(/^app-/, '');
        
        // Check if matching shelf item first
        const shelfItem = shelfItems.find((it) => it.id === appId);
        if (shelfItem && fs.existsSync(shelfItem.filePath)) {
          res.writeHead(200, {
            'Content-Type': shelfItem.mimeType,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(shelfItem.name)}"`,
            'Content-Length': shelfItem.size,
          });
          return fs.createReadStream(shelfItem.filePath).pipe(res);
        }

        // Search local packages-inbox and release folders
        const root = path.resolve(__dirname, '..', '..');
        const searchDirs = [
          path.join(root, 'packages-inbox'),
          path.join(root, 'releases', appId),
          path.join(root, 'published-apps', appId),
          'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything\\Anything\\packages-inbox',
          `C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything\\Anything\\releases\\${appId}`,
          `C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything\\Anything\\published-apps\\${appId}`
        ];

        let foundExe: string | null = null;
        for (const d of searchDirs) {
          if (fs.existsSync(d)) {
            try {
              const files = fs.readdirSync(d, { recursive: true });
              const match = files.find((f: any) => {
                const s = String(f).toLowerCase();
                return (s.endsWith('.exe') || s.endsWith('.apk') || s.endsWith('.zip')) && !s.includes('unins');
              });
              if (match) {
                foundExe = path.join(d, String(match));
                break;
              }
            } catch {}
          }
        }

        if (foundExe && fs.existsSync(foundExe)) {
          const stats = fs.statSync(foundExe);
          const fileName = path.basename(foundExe);
          res.writeHead(200, {
            'Content-Type': 'application/octet-stream',
            'Content-Disposition': `attachment; filename="${encodeURIComponent(fileName)}"`,
            'Content-Length': stats.size,
          });
          return fs.createReadStream(foundExe).pipe(res);
        }

        // If not on local disk, check catalog for remote GitHub download URL and redirect
        const appData = process.env.APPDATA || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Roaming') : '');
        const catCandidates = [
          path.resolve(__dirname, '..', '..', 'published-apps', 'catalog.json'),
          path.join(appData, 'Anything', 'published-apps', 'catalog.json'),
          'C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything\\Anything\\published-apps\\catalog.json'
        ];
        for (const c of catCandidates) {
          if (fs.existsSync(c)) {
            try {
              const list = JSON.parse(fs.readFileSync(c, 'utf-8'));
              const entry = (Array.isArray(list) ? list : []).find((a: any) => (a.id || '').toLowerCase().replace(/^app-/, '') === appId);
              if (entry?.downloadUrl) {
                res.writeHead(302, { Location: entry.downloadUrl });
                return res.end();
              }
            } catch {}
          }
        }

        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: `Package for "${appId}" not found on disk or catalog` }));
      }

      // 2.5 API: Dynamic Splash Loader Configuration Delivery
      if (pathname.startsWith('/api/loader/')) {
        const appId = pathname.replace('/api/loader/', '').toLowerCase();
        const appData = process.env.APPDATA || (process.env.USERPROFILE ? path.join(process.env.USERPROFILE, 'AppData', 'Roaming') : '');
        const loaderCandidates = [
          path.join(appData, 'Anything', 'loaders', `${appId}.json`),
          path.join(appData, 'anything', 'loaders', `${appId}.json`),
          path.resolve(__dirname, '..', '..', 'releases', appId, 'loader-config.json'),
          `C:\\Users\\Burhanuddin\\OneDrive\\Desktop\\Anything\\Anything\\releases\\${appId}\\loader-config.json`
        ];
        for (const p of loaderCandidates) {
          if (fs.existsSync(p)) {
            try {
              const data = JSON.parse(fs.readFileSync(p, 'utf-8'));
              res.writeHead(200, { 'Content-Type': 'application/json' });
              return res.end(JSON.stringify(data));
            } catch {}
          }
        }
        res.writeHead(404, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: `Loader config for "${appId}" not found` }));
      }

      // 3. API: Image Preview Stream
      if (pathname.startsWith('/preview/')) {
        const id = pathname.replace('/preview/', '');
        const item = shelfItems.find((it) => it.id === id);
        if (item && fs.existsSync(item.filePath)) {
          res.writeHead(200, {
            'Content-Type': item.mimeType,
            'Cache-Control': 'public, max-age=86400',
          });
          return fs.createReadStream(item.filePath).pipe(res);
        }
        res.writeHead(404);
        return res.end('Not found');
      }

      // 4. API: Direct File Download
      if (pathname.startsWith('/download/')) {
        const id = pathname.replace('/download/', '');
        const item = shelfItems.find((it) => it.id === id);
        if (item && fs.existsSync(item.filePath)) {
          res.writeHead(200, {
            'Content-Type': item.mimeType,
            'Content-Disposition': `attachment; filename="${encodeURIComponent(item.name)}"`,
            'Content-Length': item.size,
          });
          return fs.createReadStream(item.filePath).pipe(res);
        }
        res.writeHead(404);
        return res.end('Not found');
      }

      // 5. API: Upload from Mobile (multipart/form-data or raw buffer)
      if (pathname === '/api/upload' && req.method === 'POST') {
        const chunks: Buffer[] = [];
        req.on('data', (c) => chunks.push(c));
        req.on('end', () => {
          const body = Buffer.concat(chunks);
          const contentType = req.headers['content-type'] || '';

          if (contentType.includes('multipart/form-data')) {
            // Fast extract multipart payload
            const boundaryMatch = contentType.match(/boundary=(?:"([^"]+)"|([^;]+))/i);
            const boundary = boundaryMatch ? boundaryMatch[1] || boundaryMatch[2] : null;

            if (boundary) {
              const boundaryBuffer = Buffer.from(`--${boundary}`);
              let startIndex = body.indexOf(boundaryBuffer);

              while (startIndex !== -1) {
                const nextIndex = body.indexOf(boundaryBuffer, startIndex + boundaryBuffer.length);
                if (nextIndex === -1) break;

                const part = body.subarray(startIndex + boundaryBuffer.length, nextIndex);
                const headerEnd = part.indexOf(Buffer.from('\r\n\r\n'));

                if (headerEnd !== -1) {
                  const headers = part.subarray(0, headerEnd).toString();
                  const fileData = part.subarray(headerEnd + 4, part.length - 2); // strip trailing CRLF

                  const nameMatch = headers.match(/filename="([^"]+)"/i);
                  const mimeMatch = headers.match(/Content-Type:\s*([^\r\n]+)/i);

                  if (nameMatch && fileData.length > 0) {
                    const rawName = nameMatch[1];
                    const mime = mimeMatch ? mimeMatch[1].trim() : 'application/octet-stream';
                    const newItem = addBufferToShelf(fileData, rawName, mime);
                    if (newItem && onItemUploaded) {
                      onItemUploaded(newItem);
                    }
                  }
                }
                startIndex = nextIndex;
              }
            }
          } else {
            // Direct binary upload fallback
            const fallbackName = `mobile_upload_${Date.now()}.jpg`;
            const newItem = addBufferToShelf(body, fallbackName, 'image/jpeg');
            if (newItem && onItemUploaded) {
              onItemUploaded(newItem);
            }
          }

          res.writeHead(200, { 'Content-Type': 'application/json' });
          return res.end(JSON.stringify({ success: true, count: shelfItems.length }));
        });
        return;
      }

      res.writeHead(404);
      res.end('Not Found');
    });

    shareServer.listen(SERVER_PORT, async () => {
      console.log(`[DropShelf] Local sharing server listening on ${shareUrl}`);
      const qrDataUrl = await QRCode.toDataURL(shareUrl, { margin: 1, width: 280 });
      resolve({
        isRunning: true,
        port: SERVER_PORT,
        localIp,
        shareUrl,
        qrDataUrl,
        totalItems: shelfItems.length,
      });
    });

    shareServer.on('error', async (err) => {
      console.warn('[DropShelf] Server listen error (port may be in use):', err);
      resolve({
        isRunning: false,
        port: SERVER_PORT,
        localIp,
        shareUrl,
        qrDataUrl: '',
        totalItems: shelfItems.length,
      });
    });
  });
}

// ── IPC Handlers Registration ─────────────────────────────────────────────

export interface FileShelfIpcContext {
  getMainWindow: () => BrowserWindow | null;
  notify?: (title: string, body: string) => void;
}

export function registerFileShelfIpc(ctx: FileShelfIpcContext): void {
  // 1. Get All Shelf Items
  ipcMain.handle('fileshelf:get-items', async () => {
    return loadShelfManifest();
  });

  // 2. Add File Paths to Shelf (from OS drag & drop or file picker)
  ipcMain.handle('fileshelf:add-files', async (_e, filePaths: string[]) => {
    if (!Array.isArray(filePaths)) return { success: false, items: [] };
    const added: ShelfItem[] = [];
    for (const fp of filePaths) {
      const item = addFileToShelf(fp);
      if (item) added.push(item);
    }
    const win = ctx.getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('fileshelf:items-updated', shelfItems);
    }
    return { success: true, added, total: shelfItems.length };
  });

  // 3. Remove Item
  ipcMain.handle('fileshelf:remove-item', async (_e, id: string) => {
    const ok = removeShelfItem(id);
    const win = ctx.getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('fileshelf:items-updated', shelfItems);
    }
    return ok;
  });

  // 4. Clear Shelf
  ipcMain.handle('fileshelf:clear', async () => {
    clearShelf();
    const win = ctx.getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('fileshelf:items-updated', shelfItems);
    }
    return true;
  });

  // 5. Native OS File Picker to Add
  ipcMain.handle('fileshelf:select-files', async () => {
    const win = ctx.getMainWindow();
    const res = await dialog.showOpenDialog(win || (undefined as any), {
      title: 'Add Files / Photos to Anything Drop Shelf',
      properties: ['openFile', 'multiSelections'],
      buttonLabel: 'Drop on Shelf',
    });
    if (res.canceled || !res.filePaths || res.filePaths.length === 0) {
      return { success: false, added: [] };
    }
    const added: ShelfItem[] = [];
    for (const fp of res.filePaths) {
      const item = addFileToShelf(fp);
      if (item) added.push(item);
    }
    if (win && !win.isDestroyed()) {
      win.webContents.send('fileshelf:items-updated', shelfItems);
    }
    return { success: true, added, total: shelfItems.length };
  });

  // 6. Get Server Info & QR Code
  ipcMain.handle('fileshelf:get-server-info', async () => {
    const info = await startDropShelfServer((newItem) => {
      const win = ctx.getMainWindow();
      if (win && !win.isDestroyed()) {
        win.webContents.send('fileshelf:item-received-from-mobile', newItem);
        win.webContents.send('fileshelf:items-updated', shelfItems);
      }
      if (ctx.notify) {
        ctx.notify('Photo Received from Phone', `Saved "${newItem.name}" to Drop Shelf`);
      }
    });
    return info;
  });

  // 7. Save / Download Item to Disk
  ipcMain.handle('fileshelf:save-item-to-disk', async (_e, id: string) => {
    const item = shelfItems.find((it) => it.id === id);
    if (!item || !fs.existsSync(item.filePath)) return { success: false };

    const win = ctx.getMainWindow();
    const saveRes = await dialog.showSaveDialog(win || (undefined as any), {
      title: 'Save Image / File to PC',
      defaultPath: path.join(os.homedir(), 'Downloads', item.name),
    });

    if (saveRes.canceled || !saveRes.filePath) return { success: false };

    fs.copyFileSync(item.filePath, saveRes.filePath);
    return { success: true, savedPath: saveRes.filePath };
  });

  // 8. Open Shelf Item in Default App
  ipcMain.handle('fileshelf:open-item', async (_e, id: string) => {
    const item = shelfItems.find((it) => it.id === id);
    if (item && fs.existsSync(item.filePath)) {
      await shell.openPath(item.filePath);
      return true;
    }
    return false;
  });
}

