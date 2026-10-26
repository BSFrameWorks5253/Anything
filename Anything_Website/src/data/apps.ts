export interface AppFeature {
  title: string;
  description: string;
  iconName: string;
}

export interface AppShortcut {
  key: string;
  action: string;
}

export interface AppBenchmark {
  metric: string;
  anythingVal: string;
  adobeVal: string;
  advantage: string;
}

export interface AppData {
  id: string;
  name: string;
  shortName: string;
  category: string;
  version: string;
  size: string;
  author: string;
  tagline: string;
  description: string;
  extendedDescription: string;
  gradient: string;
  glowColor: string;
  accentColor: string;
  iconSymbol: string;
  logoImg?: string;
  downloadEnvKey: string;
  directDownloadName: string;
  githubRepo: string;
  releasesUrl: string;
  features: string[];
  detailedFeatures: AppFeature[];
  vsAdobe: {
    adobeEquivalent: string;
    adobeCost: string;
    anythingCost: string;
    keyDifferences: string[];
  };
  benchmarks: AppBenchmark[];
  shortcuts: AppShortcut[];
  systemRequirements: {
    os: string;
    ram: string;
    gpu: string;
    storage: string;
  };
  changelog: string[];
}

export const ecosystemApps: AppData[] = [
  {
    id: 'pdf-master',
    name: 'AcroFlow Studio Pro',
    shortName: 'Ac',
    category: 'Productivity & PDF Mastery',
    version: '1.0.0',
    size: '181.8 MB',
    author: 'Burhanuddin Sounasath',
    tagline: 'The Free, Unlimited Adobe Acrobat Pro Alternative',
    description: 'Adobe Acrobat-grade desktop PDF viewer, continuous canvas editor, annotation studio, digital signature pad, and universal multi-document fusion engine.',
    extendedDescription: 'AcroFlow Studio Pro (PDF Master Pro) liberates your document workflow from expensive Adobe Creative Cloud paywalls. Experience zero subscriptions, zero cloud uploads, high-DPI canvas rendering with viewport virtualization, digital signature script generators, and seamless fusion of Word, Excel, CAD DXF, and images into unified master documents.',
    gradient: 'from-rose-600 via-red-600 to-amber-600',
    glowColor: 'rgba(239, 68, 68, 0.45)',
    accentColor: '#ef4444',
    iconSymbol: '📄',
    logoImg: '/apps/pdf-master.png',
    downloadEnvKey: 'VITE_APP_ACROFLOW_URL',
    directDownloadName: 'AcroFlow_Studio_1.0.0.exe',
    githubRepo: 'BSFrameWorks5253/PDF-Master-Pro',
    releasesUrl: 'https://github.com/BSFrameWorks5253/PDF-Master-Pro/releases',
    features: [
      'Adobe-Grade Continuous Virtualized Canvas Viewer',
      'Annotation & Markup Studio (Ink, Highlights, Shapes)',
      'Digital Signature & Corporate Stamp Studio',
      'Universal Multi-Document Fusion (Word, Excel, CAD DXF, Images -> PDF)',
      'AutoCAD DXF Vector Blueprint-to-PDF Conversion',
      'Client-Side AES Password Encryption & Permissions Lock'
    ],
    detailedFeatures: [
      {
        title: 'Continuous High-DPI Canvas Viewer',
        description: 'Smooth 120 FPS infinite vertical scrolling with left thumbnail sidebar, page jump navigation, zoom up to 600%, and instant rotation.',
        iconName: 'Eye'
      },
      {
        title: 'Annotation & Interactive Markup Studio',
        description: 'Text highlighter with hex opacity, calligraphy ink pen, sticky notes, geometric shapes (rectangle, ellipse), whiteout redaction, and inline text stamps.',
        iconName: 'PenTool'
      },
      {
        title: 'Digital Signature & Stamp Studio',
        description: 'Draw realistic signatures with pressure-sensitive stylus/mouse, pick from 8 cursive calligraphy typefaces, or generate formal enterprise approval stamps.',
        iconName: 'FileCheck'
      },
      {
        title: 'Universal Multi-Document Fusion',
        description: 'Drag and drop any combination of Microsoft Word (.docx), Excel (.xlsx), AutoCAD (.dxf), Images, Text, and PDFs to merge into a single publication.',
        iconName: 'Layers'
      },
      {
        title: 'AutoCAD DXF Vector Blueprint Studio',
        description: 'Direct vector DXF parser rendering architectural drawings into blueprint sheets with Blueprint, Monochrome, and Layer Color themes up to A1 paper.',
        iconName: 'Compass'
      },
      {
        title: 'Sovereign Client-Side Security',
        description: '100% offline AES password encryption, redaction of sensitive numbers, and granular permission controls (prevent copying, printing, or modifying).',
        iconName: 'Lock'
      }
    ],
    vsAdobe: {
      adobeEquivalent: 'Adobe Acrobat DC Pro ($239.88/year)',
      adobeCost: '$19.99 - $29.99 / month recurring',
      anythingCost: '$0.00 Forever (100% Free & Open)',
      keyDifferences: [
        'Unlimited PDF operations vs Adobe 2-file free daily limit',
        '100% Local client-side sandboxed execution vs Adobe mandatory cloud sync',
        'Built-in AutoCAD DXF blueprint rendering (Adobe requires expensive CAD plugin)',
        'Zero registration or email capture required vs Adobe ID login lock',
        'Instant 30ms startup vs Adobe background telemetries'
      ]
    },
    benchmarks: [
      { metric: 'Annual Cost', anythingVal: '$0 Forever', adobeVal: '$239.88 / yr', advantage: '100% Free' },
      { metric: 'Daily Document Limit', anythingVal: 'Unlimited', adobeVal: '2 Free Files', advantage: 'Infinite' },
      { metric: 'Cloud Privacy', anythingVal: '100% Offline Local', adobeVal: 'Cloud Uploaded', advantage: 'Zero Tracking' },
      { metric: 'Memory Usage', anythingVal: '~95 MB RAM', adobeVal: '~680 MB RAM', advantage: '7x Lighter' }
    ],
    shortcuts: [
      { key: 'Ctrl + O', action: 'Open PDF / Document' },
      { key: 'Ctrl + S', action: 'Save / Export Master PDF' },
      { key: 'Ctrl + + / -', action: 'Zoom In / Out' },
      { key: 'V', action: 'Select / Hand Navigation Tool' },
      { key: 'H', action: 'Text Highlight Mode' },
      { key: 'P', action: 'Calligraphy Pen Mode' },
      { key: 'S', action: 'Open Digital Signature Modal' }
    ],
    systemRequirements: {
      os: 'Windows 10 / Windows 11 (64-bit)',
      ram: '4 GB RAM (8 GB Recommended)',
      gpu: 'DirectX 11 / Direct3D 11 Compatible GPU',
      storage: '150 MB Available Disk Space'
    },
    changelog: [
      'v1.0.0 — Official Public Release with Adobe Acrobat DC 2026 UI overhaul',
      'Implemented high-DPI virtualized canvas viewer with thumbnail strip',
      'Added universal heterogeneous fusion for Word, Excel, CAD DXF, and images',
      'Integrated pressure-sensitive digital signature canvas and cursive generators',
      'Added client-side AES-256 PDF encryption and granular permission restrictions'
    ]
  },
  {
    id: 'docuflow-studio',
    name: 'DocuFlow Studio Pro',
    shortName: 'Df',
    category: 'Document Fusion & Engineering',
    version: '1.0.0',
    size: '108.0 MB',
    author: 'Burhanuddin Sounasath',
    tagline: 'Universal Document Fusion, Vector Engineering & Offline OCR',
    description: 'Universal document fusion, visual PDF page reordering and splitting, offline OCR vision, 1-to-1 batch office conversion, security stamps & compression.',
    extendedDescription: 'DocuFlow Studio Pro is the powerhouse document engineering suite for architects, lawyers, accountants, and engineers. It effortlessly handles heterogeneous document fusion, allowing you to combine dozens of disparate formats into a unified publication, extract text offline with AI vision, split multi-hundred page documents with visual drag-and-drop, and convert CAD blueprints into high-definition vector PDFs.',
    gradient: 'from-cyan-500 via-sky-600 to-blue-700',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    accentColor: '#0ea5e9',
    iconSymbol: '📑',
    logoImg: '/apps/docuflow-studio.png',
    downloadEnvKey: 'VITE_APP_DOCUFLOW_URL',
    directDownloadName: 'DocuFlow_Studio_1.0.0.exe',
    githubRepo: 'BSFrameWorks5253/DocuFlow-Studio',
    releasesUrl: 'https://github.com/BSFrameWorks5253/DocuFlow-Studio/releases',
    features: [
      'Heterogeneous Universal Document Fusion',
      'PDF Page Studio & Visual Splitter (Reorder, Rotate, Split to ZIP)',
      'Offline OCR Vision Extractor (Local Tesseract Engine)',
      '1-to-1 Batch Office Converter (Word, Excel -> Individual PDFs)',
      'AutoCAD CAD-to-Blueprint Studio (A4-A1 Sheet Sizes)',
      'Document Security & Smart Compression Profiles'
    ],
    detailedFeatures: [
      {
        title: 'Heterogeneous Document Fusion',
        description: 'Stagger and fuse arbitrary multi-format documents (Word, Excel, CAD DXF, Images, Text, PDFs) into one cohesive, indexed master PDF document.',
        iconName: 'Layers'
      },
      {
        title: 'PDF Page Studio & Visual Splitter',
        description: 'Interactive visual grid of page thumbnails. Drag to reorder, rotate 90 degrees, exclude pages, extract custom ranges (e.g., 1-4, 9), or split all pages into a ZIP.',
        iconName: 'Sliders'
      },
      {
        title: 'Offline OCR Vision Extractor',
        description: 'Built-in client-side Optical Character Recognition powered by local Tesseract workers. Extract text from scanned contracts and flattened PDFs without sending data to servers.',
        iconName: 'Eye'
      },
      {
        title: '1-to-1 Batch Office Converter',
        description: 'Batch convert dozens of Microsoft Word (.docx, .doc) and Excel (.xlsx, .xls) worksheets into standalone individual PDFs with direct folder saving or ZIP download.',
        iconName: 'RefreshCw'
      },
      {
        title: 'CAD Blueprint Rendering Engine',
        description: 'Specialized vector engine parsing AutoCAD DXF files into architectural blueprint layouts with Blueprint Blue, Monochrome Dark, and Layer Color presets.',
        iconName: 'Compass'
      },
      {
        title: 'Smart Optimization & Watermarking',
        description: 'Apply diagonal confidential stamps, dynamic page numbers, custom opacity watermarks, and compress multi-megabyte PDFs down to email-ready sizes.',
        iconName: 'Shield'
      }
    ],
    vsAdobe: {
      adobeEquivalent: 'Adobe Acrobat Pro + Document Cloud Automation',
      adobeCost: '$29.99 / month + API costs',
      anythingCost: '$0.00 Forever',
      keyDifferences: [
        'Batch 1-to-1 office conversion without monthly transaction fees',
        'Completely offline OCR without sending private contracts to Adobe AI servers',
        'Native AutoCAD DXF vector support without Autodesk subscription',
        'Zero limit on document size or page count'
      ]
    },
    benchmarks: [
      { metric: 'Batch Office Conversion', anythingVal: 'Unlimited Files', adobeVal: 'Paywalled / Throttled', advantage: 'Infinite' },
      { metric: 'OCR Engine', anythingVal: '100% Offline Local', adobeVal: 'Cloud Processed', advantage: 'Private' },
      { metric: 'CAD Blueprint Support', anythingVal: 'Native Vector DXF', adobeVal: 'Plugin Required', advantage: 'Built-in' },
      { metric: 'Price', anythingVal: '$0 Forever', adobeVal: '$29.99 / mo', advantage: 'Save $360/yr' }
    ],
    shortcuts: [
      { key: 'Ctrl + M', action: 'Open Universal Document Fusion' },
      { key: 'Ctrl + P', action: 'Open PDF Page Studio & Splitter' },
      { key: 'Ctrl + B', action: 'Launch Batch Office Converter' },
      { key: 'Ctrl + O', action: 'Run Offline OCR Vision' },
      { key: 'Ctrl + D', action: 'Launch CAD Blueprint Studio' }
    ],
    systemRequirements: {
      os: 'Windows 10 / Windows 11 (64-bit)',
      ram: '4 GB RAM (8 GB Recommended)',
      gpu: 'DirectX 11 / Direct3D 11 Compatible GPU',
      storage: '180 MB Available Disk Space'
    },
    changelog: [
      'v1.0.0 — Initial Master Launch for the Anything Ecosystem',
      'Added PDF Page Studio with visual drag-and-drop thumbnail reordering',
      'Implemented local offline Tesseract OCR worker for confidential documents',
      'Built 1-to-1 batch office converter with folder and ZIP output modes',
      'Engineered AutoCAD DXF vector blueprint renderer supporting A4 through A1'
    ]
  },
  {
    id: 'master-converter',
    name: 'Master Document Converter Pro',
    shortName: 'MDC',
    category: 'Productivity & Batch Conversion',
    version: '1.0.0',
    size: '108.0 MB',
    author: 'Burhanuddin Sounasath',
    tagline: 'Universal Multi-Document Conversion Studio & Reverse Deconstruction',
    description: 'High-throughput document fusion, image gallery rearrangement, AutoCAD blueprint vector conversion, and PDF reverse deconstruction into Word, Excel, and images.',
    extendedDescription: 'Master Document Converter Pro specializes in high-throughput conversion and reverse engineering of document formats. Turn multi-page PDFs back into editable Word (.docx) documents, Excel (.xlsx) spreadsheets, 300 DPI high-res page image collections (.zip), or raw text, all processed locally on your CPU/GPU.',
    gradient: 'from-indigo-600 via-sky-600 to-cyan-600',
    glowColor: 'rgba(14, 165, 233, 0.45)',
    accentColor: '#38bdf8',
    iconSymbol: '🔄',
    logoImg: '/apps/docuflow-studio.png',
    downloadEnvKey: 'VITE_APP_MASTER_CONVERTER_URL',
    directDownloadName: 'Master_Converter_1.0.0.exe',
    githubRepo: 'BSFrameWorks5253/Master-Document-Converter',
    releasesUrl: 'https://github.com/BSFrameWorks5253/Master-Document-Converter/releases',
    features: [
      'PDF Reverse Deconstruction (PDF -> DOCX, XLSX, Images ZIP, TXT)',
      'Visual Image Gallery Studio with layout orientation presets',
      'AutoCAD DXF-to-PDF Vector Studio across A4-A1 scales',
      'Direct Microsoft Word & Excel to PDF conversion',
      'Real-time conversion queue telemetry and memory-efficient streaming'
    ],
    detailedFeatures: [
      {
        title: 'PDF Reverse Deconstruction',
        description: 'Convert flattened PDFs back into editable Microsoft Word documents, structured Excel spreadsheets, high-res images, and plain text files.',
        iconName: 'RefreshCw'
      },
      {
        title: 'Visual Image Gallery Studio',
        description: 'Rearrange JPG, PNG, and WebP cards with custom margins, landscape/portrait sheet orientation, and instant unified PDF generation.',
        iconName: 'FileImage'
      },
      {
        title: 'Batch Office Conversion Pipeline',
        description: 'Feed large directories of office files into the batch pipeline with parallel thread workers and zero server latency.',
        iconName: 'Layers'
      },
      {
        title: 'Hardware-Accelerated Vector Engine',
        description: 'Utilizes modern Windows Direct2D/DirectWrite rendering for instant sub-pixel blueprint calculation.',
        iconName: 'Cpu'
      }
    ],
    vsAdobe: {
      adobeEquivalent: 'Adobe Acrobat Export PDF & PDF Pack',
      adobeCost: '$120 - $240 / year',
      anythingCost: '$0.00 Forever',
      keyDifferences: [
        'Reverse export without server roundtrips or file size limitations',
        'Batch export hundreds of documents simultaneously',
        'Includes image gallery layout and CAD blueprint tools at no extra fee'
      ]
    },
    benchmarks: [
      { metric: 'Conversion Throughput', anythingVal: 'Local CPU (Fast)', adobeVal: 'Cloud Queue (Slow)', advantage: '3x Speed' },
      { metric: 'File Size Limit', anythingVal: 'Unlimited', adobeVal: '100 MB Limit', advantage: 'No Limit' },
      { metric: 'Cost', anythingVal: '$0 Forever', adobeVal: '$19.99 / mo', advantage: '100% Free' }
    ],
    shortcuts: [
      { key: 'Ctrl + N', action: 'New Conversion Batch' },
      { key: 'Ctrl + E', action: 'Export to Word (.docx)' },
      { key: 'Ctrl + X', action: 'Export to Excel (.xlsx)' },
      { key: 'Ctrl + I', action: 'Export to Images (.zip)' }
    ],
    systemRequirements: {
      os: 'Windows 10 / Windows 11 (64-bit)',
      ram: '4 GB RAM',
      gpu: 'DirectX 11 Compatible GPU',
      storage: '120 MB Available Disk Space'
    },
    changelog: [
      'v1.0.0 — Initial standalone release of Master Document Converter Pro',
      'Engineered reverse PDF deconstruction engine into Word, Excel, and images',
      'Added image gallery rearranging canvas with custom bleed and margin settings',
      'Optimized memory usage for multi-gigabyte document batches'
    ]
  },
  {
    id: 'mediaflow-studio',
    name: 'MediaFlow Studio',
    shortName: 'Mf',
    category: 'Media & Video Production',
    version: '6.0.0',
    size: '79.8 MB',
    author: 'Burhanuddin Sounasath',
    tagline: 'Professional Multi-Camera PV Separation & Synchronized Media Engine',
    description: 'Professional media ingestion, synchronization, and multi-camera PV separation pipeline featuring Apple WWDC26 Liquid Glass UI.',
    extendedDescription: 'MediaFlow Studio brings Hollywood-grade multi-camera production pipelines to creators and editors. Separate multi-angle footage, synchronize audio tracks with sub-frame accuracy, and export proxy and master reels without expensive Adobe Premiere or Creative Cloud subscription locks.',
    gradient: 'from-blue-600 via-indigo-600 to-cyan-500',
    glowColor: 'rgba(59, 130, 246, 0.45)',
    accentColor: '#3b82f6',
    iconSymbol: '⚡',
    logoImg: '/apps/mediaflow-studio.png',
    downloadEnvKey: 'VITE_APP_MEDIAFLOW_URL',
    directDownloadName: 'Mediaflow_studio_6.0.0.exe',
    githubRepo: 'BSFrameWorks5253/MediaFlow-Studio',
    releasesUrl: 'https://github.com/BSFrameWorks5253/MediaFlow-Studio/releases',
    features: [
      'Multi-Camera PV Separation Pipeline',
      'Sub-Frame Waveform Audio Synchronization',
      'Apple WWDC26 Liquid Glass UI Redesign',
      'GPU-Accelerated Direct3D Timeline Scrubbing',
      'Windows Action Center Interactive Toast Notifications'
    ],
    detailedFeatures: [
      {
        title: 'Multi-Camera PV Pipeline',
        description: 'Separate multi-angle camera feeds, preview clips simultaneously in real-time split view, and tag key moments effortlessly.',
        iconName: 'Eye'
      },
      {
        title: 'Sub-Frame Audio Synchronization',
        description: 'Align multiple microphones and external audio recorders using automated cross-correlation audio waveform analysis.',
        iconName: 'Zap'
      },
      {
        title: 'Apple WWDC26 Liquid Glass Interface',
        description: 'Sleek frosted glass panels, ambient colored glow borders, and fluid physics-based responsive controls.',
        iconName: 'Sparkles'
      },
      {
        title: 'Hardware Acceleration',
        description: 'Harnesses NVIDIA NVENC and AMD AMF video decoders for stutter-free 4K/8K timeline playback.',
        iconName: 'Cpu'
      }
    ],
    vsAdobe: {
      adobeEquivalent: 'Adobe Premiere Pro ($239.88/year)',
      adobeCost: '$22.99 / month',
      anythingCost: '$0.00 Forever',
      keyDifferences: [
        'Dedicated lightweight PV separation pipeline without massive project files',
        'Zero telemetry, cloud login, or software activation servers',
        'Fast portable executable with sub-second launch times'
      ]
    },
    benchmarks: [
      { metric: 'Project Load Time', anythingVal: '< 1.2 seconds', adobeVal: '> 14 seconds', advantage: '10x Faster' },
      { metric: 'Executable Size', anythingVal: '79.8 MB', adobeVal: '4.5+ GB', advantage: '50x Smaller' },
      { metric: 'Subscription Cost', anythingVal: '$0 Forever', adobeVal: '$239.88 / yr', advantage: '100% Free' }
    ],
    shortcuts: [
      { key: 'Space', action: 'Play / Pause Multi-cam Timeline' },
      { key: 'J / K / L', action: 'Shuttle Rewind / Pause / Fast Forward' },
      { key: 'Ctrl + S', action: 'Sync Selected Audio Tracks' },
      { key: 'M', action: 'Add Marker at Playhead' }
    ],
    systemRequirements: {
      os: 'Windows 10 / Windows 11 (64-bit)',
      ram: '8 GB RAM (16 GB Recommended for 4K)',
      gpu: 'DirectX 11 / NVENC or AMD VCE Capable GPU',
      storage: '200 MB Available Disk Space'
    },
    changelog: [
      'v6.0.0 — Apple WWDC26 Liquid Glass UI complete visual redesign',
      'Added multi-camera PV separation pipeline with real-time quad-split view',
      'Implemented automated sub-frame waveform audio synchronization',
      'Integrated Windows Action Center native toast notifications for export completions'
    ]
  },
  {
    id: 'one-tap',
    name: 'One Tap Workstation',
    shortName: 'OT',
    category: 'Productivity & Workstation',
    version: '26.10.21',
    size: '96.0 MB',
    author: 'Burhanuddin Sounasath',
    tagline: 'Instant Workstation Control, Hotkey Automation & Macro Hub',
    description: 'Instant workstation control and automation utility designed for lightning-fast creative asset deployment and macro triggering.',
    extendedDescription: 'One Tap is your personal mission control for Windows. Automate tedious multi-step creative tasks, trigger complex asset pipelines with custom hotkeys, synchronize credentials safely, and control background system threads without breaking your creative flow.',
    gradient: 'from-amber-600 via-orange-500 to-yellow-400',
    glowColor: 'rgba(251, 191, 36, 0.45)',
    accentColor: '#f59e0b',
    iconSymbol: '🎯',
    logoImg: undefined,
    downloadEnvKey: 'VITE_APP_ONETAP_URL',
    directDownloadName: 'OneTap-Portable-V-26.10.21.exe',
    githubRepo: 'BSFrameWorks5253/onetap-workstation',
    releasesUrl: 'https://github.com/BSFrameWorks5253/onetap-workstation/releases',
    features: [
      'One-Click Workflow Macro Triggering',
      'Low-Latency Background Worker Threads',
      'Secure Credential Vault & Token Sync',
      'Customizable Floating Action HUD Widgets',
      'Zero-Latency Global Hotkey Listener'
    ],
    detailedFeatures: [
      {
        title: 'One-Click Macro Engine',
        description: 'Chain complex OS actions, file transformations, and creative tool launches into a single instant hotkey or floating widget tap.',
        iconName: 'Zap'
      },
      {
        title: 'Floating Action HUD',
        description: 'Minimalist glass overlay that sits unobtrusively on your desktop and reacts instantly when summoned via global hotkey.',
        iconName: 'Sliders'
      },
      {
        title: 'Encrypted Credential Vault',
        description: 'Secure client-side storage for API tokens, git credentials, and server keys with AES-256 Windows DPAPI integration.',
        iconName: 'Lock'
      },
      {
        title: 'Background Process Telemetry',
        description: 'Monitor child application CPU, RAM, and disk utilization without opening heavy Task Manager windows.',
        iconName: 'Cpu'
      }
    ],
    vsAdobe: {
      adobeEquivalent: 'Adobe Creative Cloud Desktop Manager',
      adobeCost: 'Bloatware bundled with CC ($59.99/mo)',
      anythingCost: '$0.00 Forever',
      keyDifferences: [
        'Uses less than 1% CPU compared to Adobe CC 15+ background daemon processes',
        'Customizable macro keys and floating heads for instant productivity',
        'Zero telemetry and zero cloud sync requirements'
      ]
    },
    benchmarks: [
      { metric: 'Idle CPU Usage', anythingVal: '0.01%', adobeVal: '2.5% - 5.0%', advantage: '250x Lighter' },
      { metric: 'Background Daemons', anythingVal: '1 Clean Process', adobeVal: '18+ Adobe Processes', advantage: 'Zero Bloat' },
      { metric: 'Global Hotkey Latency', anythingVal: '< 4ms', adobeVal: 'N/A', advantage: 'Instant' }
    ],
    shortcuts: [
      { key: 'Alt + Space', action: 'Toggle Floating One Tap HUD' },
      { key: 'Ctrl + Shift + 1', action: 'Trigger Primary Macro 1' },
      { key: 'Ctrl + Shift + 2', action: 'Trigger Primary Macro 2' },
      { key: 'Ctrl + Shift + Q', action: 'Instant Workstation Lock' }
    ],
    systemRequirements: {
      os: 'Windows 10 / Windows 11 (64-bit)',
      ram: '2 GB RAM',
      gpu: 'Standard Windows Graphics',
      storage: '100 MB Available Disk Space'
    },
    changelog: [
      'v26.10.21 — Enhanced low-latency global keyboard hooks',
      'Implemented customizable floating action HUD with drag positioning',
      'Added local AES credential vault for secure local workflow authentication',
      'Integrated auto-update handoff to Anything Master Hub'
    ]
  },
  {
    id: 'anything-hub',
    name: 'Anything Master Hub',
    shortName: 'An',
    category: 'Ecosystem & Central Launcher',
    version: '1.0.0',
    size: '86.4 MB',
    author: 'Burhanuddin Sounasath',
    tagline: 'Apple WWDC26 Liquid Glass Desktop Launcher & Auto-Update Engine',
    description: 'Centralized Windows desktop launcher and lifecycle management ecosystem styled with an Apple WWDC26 full liquid glass aesthetic.',
    extendedDescription: 'Anything is the master distribution and auto-update hub for the entire ecosystem. Styled with Apple WWDC26 liquid glass aesthetics, it provides one-click child application discovery, seamless background GitHub release polling, Windows 10/11 Action Center native toast notifications, and clean zero-registry installations.',
    gradient: 'from-cyan-500 via-blue-600 to-purple-600',
    glowColor: 'rgba(0, 242, 254, 0.45)',
    accentColor: '#00f2fe',
    iconSymbol: '💎',
    logoImg: undefined,
    downloadEnvKey: 'VITE_APP_ANYTHING_URL',
    directDownloadName: 'Anything_Master_Hub_1.0.0.exe',
    githubRepo: 'BSFrameWorks5253/Anything',
    releasesUrl: 'https://github.com/BSFrameWorks5253/Anything/releases',
    features: [
      'Apple WWDC26 Liquid Glass UI Aesthetic',
      'Windows 10/11 Action Center Toast Notifications',
      'Background GitHub Releases Auto-Sync & Version Comparator',
      'Sandboxed Zero-Registry Local App Installation',
      'High-Performance Direct3D GPU Canvas Telemetry'
    ],
    detailedFeatures: [
      {
        title: 'Apple WWDC26 Liquid Glass Design',
        description: 'Immersive acrylic and mica materials, multi-tier backdrop blurs, dynamic specular rims, and fluid micro-animations.',
        iconName: 'Sparkles'
      },
      {
        title: 'Native Windows Action Center Toasts',
        description: 'Receives official Windows 10/11 notifications when new releases drop on GitHub with one-click direct update buttons.',
        iconName: 'Zap'
      },
      {
        title: 'Stream-Download & Auto-Update Engine',
        description: 'Fast chunked parallel downloading with real-time MB/s speed meters and atomic in-place binary swaps.',
        iconName: 'Download'
      },
      {
        title: 'Clean Sandbox Isolation',
        description: 'Installs all child tools neatly to %LOCALAPPDATA%\\anything\\installed-apps without polluting the Windows Registry.',
        iconName: 'Shield'
      }
    ],
    vsAdobe: {
      adobeEquivalent: 'Adobe Creative Cloud Desktop ($59.99/mo bundle)',
      adobeCost: 'Subscription required + 20+ intrusive background services',
      anythingCost: '$0.00 Forever (No Accounts, No Tracking)',
      keyDifferences: [
        'Clean portable launcher without persistent spyware daemons',
        'Direct connection to open GitHub release repositories',
        'Full freedom to launch, portable-copy, or cleanly uninstall apps'
      ]
    },
    benchmarks: [
      { metric: 'Background Processes', anythingVal: '1 Lightweight Process', adobeVal: '20+ Adobe Services', advantage: 'Zero Bloat' },
      { metric: 'Update Transparency', anythingVal: 'Public GitHub Releases', adobeVal: 'Proprietary Cloud Lock', advantage: 'Open & Clear' },
      { metric: 'Subscription Cost', anythingVal: '$0 Forever', adobeVal: 'Mandatory Subscription', advantage: '100% Free' }
    ],
    shortcuts: [
      { key: 'Ctrl + Space', action: 'Bring Anything Hub to Foreground' },
      { key: 'Ctrl + R', action: 'Force Sync GitHub Releases' },
      { key: 'Ctrl + Shift + D', action: 'Open Downloads Manager' },
      { key: 'Ctrl + ,', action: 'Open Hub Preferences' }
    ],
    systemRequirements: {
      os: 'Windows 10 / Windows 11 (64-bit)',
      ram: '4 GB RAM',
      gpu: 'DirectX 11 Compatible GPU',
      storage: '100 MB Available Disk Space'
    },
    changelog: [
      'v1.0.0 — Public Release of Anything Master Hub WWDC26 Liquid Glass Edition',
      'Engineered automated GitHub Release scanner with SemVer comparison',
      'Implemented Windows Action Center toast notifications with appUserModelId',
      'Added high-speed chunked asset stream downloader with live telemetry'
    ]
  }
];

export const adobeComparisonData = [
  {
    feature: 'Price & Billing',
    anything: '$0.00 Forever (100% Free)',
    adobe: '$19.99 – $29.99 / month ($239+/yr)',
    highlight: true
  },
  {
    feature: 'Free Daily Limit',
    anything: 'Unlimited Edits, Merges, & Exports',
    adobe: 'Paywalled after 1-2 free operations',
    highlight: true
  },
  {
    feature: 'Cloud Privacy & Sovereignty',
    anything: '100% Client-Side Offline. Zero Cloud Uploads',
    adobe: 'Mandatory upload to Adobe Document Cloud',
    highlight: true
  },
  {
    feature: 'Account & Sign-In Lock',
    anything: 'No Account Required. No Email Capturing',
    adobe: 'Mandatory Adobe ID & Credit Card verification',
    highlight: false
  },
  {
    feature: 'AutoCAD DXF Vector Blueprints',
    anything: 'Built-in Blueprint Vector Engine up to A1 size',
    adobe: 'Requires expensive CAD add-ons or Autodesk',
    highlight: true
  },
  {
    feature: 'Universal Heterogeneous Fusion',
    anything: 'Mix Word, Excel, CAD DXF, Images & PDF in one click',
    adobe: 'Requires multiple separate conversions',
    highlight: true
  },
  {
    feature: 'Offline OCR Vision',
    anything: 'Local Tesseract OCR without server tracking',
    adobe: 'Cloud AI OCR with terms of service data usage',
    highlight: false
  },
  {
    feature: 'Digital Signature & Script Pad',
    anything: 'Unlimited drawing pad, cursive fonts, corporate stamps',
    adobe: 'Locked behind Adobe Acrobat Sign subscription tier',
    highlight: true
  },
  {
    feature: 'System Resource Impact',
    anything: '< 100 MB RAM, portable standalone executables',
    adobe: 'Heavy 15+ background daemons, 1GB+ RAM',
    highlight: false
  }
];
