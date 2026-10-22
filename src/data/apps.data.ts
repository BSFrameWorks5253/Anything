import type { CreativeApp, CloudFileItem } from '../types/app.types';

// All pre-installed default apps removed — clean slate!
export const creativeAppsData: CreativeApp[] = [];

export const appCategoriesList: string[] = [
  'All',
  'Creative & Design',
  'Development',
  'Video & 3D',
  'Productivity',
  'Gaming & Media',
  'Custom Tools',
];

// One-click quick addition presets
export const popularPresets: Partial<CreativeApp>[] = [
  {
    name: 'Visual Studio Code',
    shortName: 'VS',
    category: 'Development',
    description: 'Lightweight and powerful source code editor.',
    gradient: 'from-blue-600 via-sky-500 to-cyan-400',
    textColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    iconType: 'emoji',
    iconValue: '💻',
    executablePath: 'code',
  },
  {
    name: 'Blender 3D',
    shortName: 'Bl',
    category: 'Video & 3D',
    description: 'Free and open-source 3D creation suite.',
    gradient: 'from-amber-600 via-orange-500 to-yellow-400',
    textColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.45)',
    iconType: 'emoji',
    iconValue: '🧊',
  },
  {
    name: 'Figma',
    shortName: 'Fg',
    category: 'Creative & Design',
    description: 'Collaborative interface design & prototyping.',
    gradient: 'from-purple-600 via-pink-500 to-rose-400',
    textColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    iconType: 'emoji',
    iconValue: '🎨',
    executablePath: 'https://figma.com',
  },
  {
    name: 'OBS Studio',
    shortName: 'Ob',
    category: 'Video & 3D',
    description: 'High-performance video recording & live streaming.',
    gradient: 'from-slate-700 via-zinc-800 to-neutral-900',
    textColor: '#a1a1aa',
    glowColor: 'rgba(161, 161, 170, 0.45)',
    iconType: 'emoji',
    iconValue: '📹',
  },
  {
    name: 'DaVinci Resolve',
    shortName: 'Dv',
    category: 'Video & 3D',
    description: 'Professional video editing, color correction, and audio post.',
    gradient: 'from-rose-600 via-red-500 to-amber-500',
    textColor: '#fb923c',
    glowColor: 'rgba(251, 146, 60, 0.45)',
    iconType: 'emoji',
    iconValue: '🎬',
  },
  {
    name: 'Unity Engine',
    shortName: 'Un',
    category: 'Development',
    description: 'Real-time 2D, 3D, VR & AR development platform.',
    gradient: 'from-gray-800 via-slate-900 to-black',
    textColor: '#e2e8f0',
    glowColor: 'rgba(226, 232, 240, 0.35)',
    iconType: 'emoji',
    iconValue: '🎮',
  },
];

export const mockCloudFiles: CloudFileItem[] = [
  {
    id: 'f1',
    name: 'Spatial Canvas Artwork.png',
    appShort: 'Sp',
    appGradient: 'from-blue-600 to-cyan-400',
    appTextColor: '#38bdf8',
    modified: 'Just now',
    size: '4.2 MB',
    status: 'synced',
    palette: ['#38bdf8', '#818cf8', '#c084fc', '#f43f5e', '#fbbf24'],
  },
];
