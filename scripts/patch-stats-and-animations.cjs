const fs = require('fs');
const path = require('path');

// 1. Patch FilesPage.tsx
const filesPagePath = path.resolve(__dirname, '..', 'src', 'features', 'files', 'FilesPage.tsx');
let pageContent = fs.readFileSync(filesPagePath, 'utf8');

if (!pageContent.includes('MediaFlowStatsTab')) {
  pageContent = pageContent.replace(
    "import { MacDropShelf } from './components/MacDropShelf';",
    "import { MacDropShelf } from './components/MacDropShelf';\nimport { MediaFlowStatsTab } from './components/MediaFlowStatsTab';\nimport { BarChart3 } from 'lucide-react';"
  );

  pageContent = pageContent.replace(
    "const [activeTab, setActiveTab] = useState<'shelf' | 'cloud' | 'shared' | 'onetap'>('shelf');",
    "const [activeTab, setActiveTab] = useState<'shelf' | 'cloud' | 'shared' | 'mediaflow-stats' | 'onetap'>('shelf');"
  );

  const statsTabBtn = `
        <button
          onClick={() => setActiveTab('mediaflow-stats')}
          className={\`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer \${
            activeTab === 'mediaflow-stats'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }\`}
        >
          <BarChart3 className="w-3.5 h-3.5 text-cyan-500" />
          <span>MediaFlow Production Stats</span>
        </button>`;

  pageContent = pageContent.replace(
    '<span>Shared Assets & MediaFlow Badges</span>\n        </button>',
    '<span>Shared Assets & MediaFlow Badges</span>\n        </button>' + statsTabBtn
  );
  // Also try CRLF
  pageContent = pageContent.replace(
    '<span>Shared Assets & MediaFlow Badges</span>\r\n        </button>',
    '<span>Shared Assets & MediaFlow Badges</span>\r\n        </button>' + statsTabBtn
  );

  const statsSection = `
      {/* Tab: MediaFlow Production & Safar Telemetry */}
      {activeTab === 'mediaflow-stats' && (
        <div className="space-y-6">
          <MediaFlowStatsTab />
        </div>
      )}
`;

  pageContent = pageContent.replace(
    '{/* Tab 4: One Tap Final Titles Two-Way Synced Hub */}',
    statsSection + '\n      {/* Tab 4: One Tap Final Titles Two-Way Synced Hub */}'
  );

  fs.writeFileSync(filesPagePath, pageContent, 'utf8');
  console.log('✓ Updated FilesPage.tsx with MediaFlowStatsTab');
}

// 2. Patch MacDropShelf.tsx with AnythingLogoAssemblyAnimation
const shelfPath = path.resolve(__dirname, '..', 'src', 'features', 'files', 'components', 'MacDropShelf.tsx');
let shelfContent = fs.readFileSync(shelfPath, 'utf8');

if (!shelfContent.includes('AnythingLogoAssemblyAnimation')) {
  shelfContent = shelfContent.replace(
    "import { GlassBadge } from '../../../components/ui/GlassBadge';",
    "import { GlassBadge } from '../../../components/ui/GlassBadge';\nimport { AnythingLogoAssemblyAnimation } from '../../../components/ui/AnythingLogoAssemblyAnimation';"
  );

  shelfContent = shelfContent.replace(
    "const [loading, setLoading] = useState(true);",
    `const [loading, setLoading] = useState(true);
  const [animState, setAnimState] = useState<{
    isOpen: boolean;
    mode: 'upload' | 'download';
    title?: string;
    subtitle?: string;
    itemCount: number;
    totalSizeFormatted: string;
  }>({
    isOpen: false,
    mode: 'upload',
    itemCount: 0,
    totalSizeFormatted: '0 MB',
  });`
  );

  // Trigger animation on drop
  shelfContent = shelfContent.replace(
    "if (droppedFiles.length === 0) return;",
    `if (droppedFiles.length === 0) return;
    const totalBytesDropped = droppedFiles.reduce((acc, f) => acc + (f.size || 0), 0);
    const dropSizeFormatted = totalBytesDropped > 1024 * 1024 ? \`\${(totalBytesDropped / (1024 * 1024)).toFixed(1)} MB\` : \`\${Math.round(totalBytesDropped / 1024)} KB\`;
    setAnimState({
      isOpen: true,
      mode: 'upload',
      title: 'Assembling Staged Assets into Hub',
      subtitle: \`Staging \${droppedFiles.length} item(s) (\${dropSizeFormatted}) into Studio Drop Shelf\`,
      itemCount: droppedFiles.length,
      totalSizeFormatted: dropSizeFormatted,
    });`
  );

  // Trigger animation on download all
  shelfContent = shelfContent.replace(
    "const handleDownloadAll = async () => {",
    `const handleDownloadAll = async () => {
    setAnimState({
      isOpen: true,
      mode: 'download',
      title: 'Streaming Staged Assets to Disk',
      subtitle: \`Exporting \${items.length} file(s) (\${totalSizeFormatted}) at native bus speed\`,
      itemCount: items.length,
      totalSizeFormatted,
    });`
  );

  // Add component to return JSX before the last closing </div>
  const lastIndex = shelfContent.lastIndexOf('</div>');
  shelfContent =
    shelfContent.slice(0, lastIndex) +
    `  <AnythingLogoAssemblyAnimation
        isOpen={animState.isOpen}
        mode={animState.mode}
        title={animState.title}
        subtitle={animState.subtitle}
        itemCount={animState.itemCount}
        totalSizeFormatted={animState.totalSizeFormatted}
        onComplete={() => setAnimState((prev) => ({ ...prev, isOpen: false }))}
      />\n    </div>` +
    shelfContent.slice(lastIndex + 6);

  fs.writeFileSync(shelfPath, shelfContent, 'utf8');
  console.log('✓ Updated MacDropShelf.tsx with AnythingLogoAssemblyAnimation');
}
