const { app, BrowserWindow } = require('electron');
const fs = require('fs');
const path = require('path');

app.disableHardwareAcceleration();

app.whenReady().then(async () => {
  const win = new BrowserWindow({
    width: 512,
    height: 512,
    show: false,
    frame: false,
    transparent: true,
    webPreferences: {
      offscreen: true,
    },
  });

  const svgContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body, html {
          margin: 0;
          padding: 0;
          width: 512px;
          height: 512px;
          background: transparent;
          overflow: hidden;
        }
      </style>
    </head>
    <body>
      <svg width="512" height="512" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="emblemGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stop-color="#FF2A2A" />
            <stop offset="100%" stop-color="#BA0000" />
          </linearGradient>
          <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
            <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="rgba(0,0,0,0.4)" />
          </filter>
        </defs>
        <!-- Squircle Base -->
        <rect x="2" y="2" width="96" height="96" rx="22" fill="url(#emblemGrad)" filter="url(#shadow)" />
        <!-- Specular Highlight Rim -->
        <rect x="3.5" y="3.5" width="93" height="93" rx="20.5" stroke="rgba(255,255,255,0.4)" stroke-width="1.8" />
        <!-- Top Glass Specular Arc -->
        <path d="M4 26C16 24 33 30 50 23C67 16 84 21 96 18V4C96 4 93 4 89 4H11C7 4 4 7 4 11V26Z" fill="white" opacity="0.18" />
        <!-- Brand Monogram -->
        <text
          x="50"
          y="68"
          text-anchor="middle"
          fill="#FFFFFF"
          font-family="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif"
          font-weight="800"
          font-size="52"
          letter-spacing="-1.5"
        >An</text>
      </svg>
    </body>
    </html>
  `;

  await win.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(svgContent));
  // Wait a moment for rendering
  await new Promise(r => setTimeout(r, 600));

  const image = await win.capturePage();
  const png512 = image.toPNG();

  const publicDir = path.join(__dirname, '..', 'public');
  const buildDir = path.join(__dirname, '..', 'build');
  if (!fs.existsSync(buildDir)) fs.mkdirSync(buildDir, { recursive: true });

  // Save 512x512 app-logo.png
  fs.writeFileSync(path.join(publicDir, 'app-logo.png'), png512);
  console.log('Saved public/app-logo.png (512x512)');

  // Save tray-icon.png (64x64 crisp image)
  const trayImg = image.resize({ width: 64, height: 64, quality: 'best' });
  fs.writeFileSync(path.join(publicDir, 'tray-icon.png'), trayImg.toPNG());
  console.log('Saved public/tray-icon.png (64x64)');

  // Also save a 32x32 tray icon for high-DPI scaling
  const tray32 = image.resize({ width: 32, height: 32, quality: 'best' });
  fs.writeFileSync(path.join(publicDir, 'tray-icon-32.png'), tray32.toPNG());

  // Generate multi-resolution .ico containing 16, 24, 32, 48, 64, 128, 256
  const sizes = [16, 24, 32, 48, 64, 128, 256];
  const pngBuffers = sizes.map(sz => {
    return {
      size: sz,
      buffer: image.resize({ width: sz, height: sz, quality: 'best' }).toPNG()
    };
  });

  // Assemble Windows .ico file
  const count = pngBuffers.length;
  const headerSize = 6;
  const dirEntrySize = 16;
  let dataOffset = headerSize + (count * dirEntrySize);

  const entries = [];
  for (const item of pngBuffers) {
    const entry = Buffer.alloc(16);
    entry.writeUInt8(item.size === 256 ? 0 : item.size, 0); // width
    entry.writeUInt8(item.size === 256 ? 0 : item.size, 1); // height
    entry.writeUInt8(0, 2); // color palette count
    entry.writeUInt8(0, 3); // reserved
    entry.writeUInt16LE(1, 4); // color planes
    entry.writeUInt16LE(32, 6); // bits per pixel
    entry.writeUInt32LE(item.buffer.length, 8); // size of image data
    entry.writeUInt32LE(dataOffset, 12); // offset of image data
    entries.push(entry);
    dataOffset += item.buffer.length;
  }

  const icoHeader = Buffer.alloc(6);
  icoHeader.writeUInt16LE(0, 0); // reserved
  icoHeader.writeUInt16LE(1, 2); // icon type (1 = ICO)
  icoHeader.writeUInt16LE(count, 4); // number of images

  const icoBuffer = Buffer.concat([
    icoHeader,
    ...entries,
    ...pngBuffers.map(p => p.buffer)
  ]);

  fs.writeFileSync(path.join(publicDir, 'icon.ico'), icoBuffer);
  fs.writeFileSync(path.join(buildDir, 'icon.ico'), icoBuffer);
  console.log('Saved public/icon.ico & build/icon.ico (with sizes:', sizes.join(', '), ')');

  app.quit();
});
