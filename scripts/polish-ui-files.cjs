const fs = require('fs');
const path = require('path');

// 1. FilesHeader.tsx
const filesHeaderPath = path.resolve(__dirname, '..', 'src', 'features', 'files', 'components', 'FilesHeader.tsx');
const newFilesHeader = `import React from 'react';
import { Plus, CloudUpload } from 'lucide-react';
import { GlassButton } from '../../../components/ui/GlassButton';

interface FilesHeaderProps {
  onNewFile: () => void;
}

export const FilesHeader: React.FC<FilesHeaderProps> = ({ onNewFile }) => {
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 pb-3 border-b border-zinc-200/80 dark:border-white/[0.08]">
      <div>
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl font-bold text-zinc-900 dark:text-white tracking-tight">
            Ecosystem Asset Hub & Universal Staging
          </h2>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Studio Network · Port 49153
          </span>
        </div>
        <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
          Real-time cross-app file streaming, asset staging, and direct Wi-Fi sync for One Tap, MediaFlow & Mobile
        </p>
      </div>

      <div className="flex items-center gap-2.5">
        <GlassButton
          variant="glass"
          size="sm"
          icon={<CloudUpload className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />}
        >
          Import Asset
        </GlassButton>

        <GlassButton
          variant="primary"
          size="sm"
          icon={<Plus className="w-3.5 h-3.5 text-white" />}
          onClick={onNewFile}
          className="bg-blue-600 hover:bg-blue-500 text-white font-semibold shadow-md shadow-blue-600/20"
        >
          New Production Asset
        </GlassButton>
      </div>
    </div>
  );
};
`;
fs.writeFileSync(filesHeaderPath, newFilesHeader, 'utf8');
console.log('✓ Updated FilesHeader.tsx');

// 2. FilesPage.tsx
const filesPagePath = path.resolve(__dirname, '..', 'src', 'features', 'files', 'FilesPage.tsx');
let filesPageContent = fs.readFileSync(filesPagePath, 'utf8');

// Update tab names
filesPageContent = filesPageContent.replace(
  '<span>Mac Drop Shelf & Mobile QR</span>',
  '<span>Universal Drop Shelf & Mobile QR</span>'
);
filesPageContent = filesPageContent.replace(
  '<span>Cloud Documents</span>',
  '<span>Studio Cloud Documents</span>'
);
filesPageContent = filesPageContent.replace(
  '<span>Shared Library & MediaFlow Badges</span>',
  '<span>Shared Assets & MediaFlow Badges</span>'
);
filesPageContent = filesPageContent.replace(
  '<span>Final Titles (One Tap)</span>',
  '<span>One Tap Production Titles</span>'
);
fs.writeFileSync(filesPagePath, filesPageContent, 'utf8');
console.log('✓ Updated FilesPage.tsx');

// 3. MacDropShelf.tsx
const macDropShelfPath = path.resolve(__dirname, '..', 'src', 'features', 'files', 'components', 'MacDropShelf.tsx');
let shelfContent = fs.readFileSync(macDropShelfPath, 'utf8');

// Header title & description
shelfContent = shelfContent.replace(
  'Mac-Style Drop Shelf & QR Image Hub',
  'Universal Drop Shelf & Mobile Gateway'
);
shelfContent = shelfContent.replace(
  '{items.length === 1 ? \'Item\' : \'Items\'}',
  '{items.length === 1 ? \'Staged Asset\' : \'Staged Assets\'}'
);
shelfContent = shelfContent.replace(
  'Drag files & photos here to stage, download high-res images, or scan QR code to link mobile phone in real-time.',
  'Stage media, graphics, and package builds for instant access across your desktop suite and peer-to-peer mobile transfer.'
);

// Buttons
shelfContent = shelfContent.replace(
  "{isQrOpen ? 'Hide Mobile QR' : '📱 Phone Live QR'}",
  "{isQrOpen ? 'Hide Mobile Link' : 'Mobile QR Link'}"
);
shelfContent = shelfContent.replace(
  'Add Files',
  'Add Files & Assets'
);
shelfContent = shelfContent.replace(
  'title="Download all images and files to your PC"',
  'title="Download all staged assets to your local drive"'
);
shelfContent = shelfContent.replace(
  'Download All ({items.length})',
  'Download All ({items.length})'
);
shelfContent = shelfContent.replace(
  'Clear',
  'Clear Shelf'
);

// Mobile QR Card
shelfContent = shelfContent.replace(
  'Scan with Mobile Phone (Instant Direct Link)',
  'Instant Peer-to-Peer Mobile Link'
);
shelfContent = shelfContent.replace(
  'No app installation required. Works in Safari, Chrome, and any mobile browser.',
  'Direct Wi-Fi pipeline. Works in Safari, Chrome, and any mobile browser without cloud intermediaries.'
);
shelfContent = shelfContent.replace(
  '<strong>Download Images:</strong> Save high-res images directly to your phone\'s camera roll.',
  '<strong>Direct Image Downloads:</strong> Preview and save high-resolution studio assets straight to your mobile camera roll.'
);
shelfContent = shelfContent.replace(
  '<strong>Upload Photos:</strong> Snap a photo on mobile and it drops straight onto your PC shelf!',
  '<strong>Instant Mobile Ingest:</strong> Snap a photo or choose gallery items on your phone to stream straight onto this shelf.'
);
shelfContent = shelfContent.replace(
  '<strong>Local Network Speed:</strong> Direct peer-to-peer Wi-Fi connection without cloud limits.',
  '<strong>High-Speed Local LAN:</strong> Direct Wi-Fi stream on port {serverInfo.port} without cloud compression or size limits.'
);

// Drop Zone Text
shelfContent = shelfContent.replace(
  "{isDragging ? 'Release to Drop on Shelf' : 'Drop Images & Files onto Shelf'}",
  "{isDragging ? 'Release to Stage Assets on Shelf' : 'Drop Images, Videos & Files onto Shelf'}"
);
shelfContent = shelfContent.replace(
  'Drag & drop photos, screenshots, PSDs, or documents from anywhere on your Mac/PC',
  'Drag & drop high-res photos, 4K clips, PSDs, production graphics, or documents from any application or folder'
);

// Staged items gallery title
shelfContent = shelfContent.replace(
  'Staged Shelf Items ({items.length})',
  'Staged Production Assets ({items.length})'
);
shelfContent = shelfContent.replace(
  '{imageCount} Images Available for Download',
  '{imageCount} High-Res Assets Ready'
);

// Add format badges to DropZone if not already present
if (!shelfContent.includes('Supported format pills')) {
  const targetDropZoneSnippet = `<p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
              Drag & drop high-res photos, 4K clips, PSDs, production graphics, or documents from any application or folder
            </p>
          </div>
        </div>
      </div>`;
  
  const replacementDropZoneSnippet = `<p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
              Drag & drop high-res photos, 4K clips, PSDs, production graphics, or documents from any application or folder
            </p>
          </div>

          {/* Supported format pills */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2">
            {['PNG', 'JPG', 'MP4', 'WAV', 'PSD', 'PDF', 'ZIP'].map((fmt) => (
              <span
                key={fmt}
                className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-zinc-200/70 dark:bg-white/[0.06] text-zinc-600 dark:text-zinc-400 border border-zinc-300/50 dark:border-white/10"
              >
                {fmt}
              </span>
            ))}
          </div>
        </div>
      </div>`;
  
  // Normalize line endings for replacement
  const normalizedTarget = targetDropZoneSnippet.replace(/\r\n/g, '\n');
  const normalizedShelf = shelfContent.replace(/\r\n/g, '\n');
  if (normalizedShelf.includes(normalizedTarget)) {
    shelfContent = normalizedShelf.replace(normalizedTarget, replacementDropZoneSnippet.replace(/\r\n/g, '\n'));
  }
}

fs.writeFileSync(macDropShelfPath, shelfContent, 'utf8');
console.log('✓ Updated MacDropShelf.tsx');

// 4. FilesStats.tsx
const filesStatsPath = path.resolve(__dirname, '..', 'src', 'features', 'files', 'components', 'FilesStats.tsx');
let statsContent = fs.readFileSync(filesStatsPath, 'utf8');
statsContent = statsContent.replace("'Spatial Compositions'", "'Studio Master Projects'");
statsContent = statsContent.replace("'ProRes 8K Renders'", "'ProRes & MediaFlow Cuts'");
statsContent = statsContent.replace("'RAW Spatial Photos'", "'Production Graphics & Stills'");
fs.writeFileSync(filesStatsPath, statsContent, 'utf8');
console.log('✓ Updated FilesStats.tsx');
