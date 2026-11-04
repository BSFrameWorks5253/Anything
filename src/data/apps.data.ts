import type { CreativeApp, CloudFileItem, CatalogApp } from '../types/app.types';
import {
  MEDIAFLOW_STUDIO_LOGO_BASE64,
  ONE_TAP_LOGO_BASE64,
  DOCUFLOW_STUDIO_LOGO_BASE64,
  PIXELCHARM_LOGO_BASE64,
  ANYTHING_OFFICE_LOGO_BASE64,
  ANYTHING_DATA_MANAGE_LOGO_BASE64,
  ANYTHING_FILE_MANAGER_LOGO_BASE64,
} from '../features/apps/constants/appLogos';

export function isHostAnythingApp(app: Partial<CatalogApp>): boolean {
  if (!app) return false;
  const id = (app.id || '').toLowerCase().replace(/^app-/, '');
  const name = (app.name || '').toLowerCase();
  const repo = (app.githubRepo || '').toLowerCase();
  if (id === 'anything' || id === 'anything-hub' || id === 'anything-master-hub' || id === 'app-anything') return true;
  if (name === 'anything' || name === 'anything hub' || name === 'anything master hub') return true;
  if (repo === 'bsframeworks5253/anything' || repo.endsWith('/anything')) return true;
  return false;
}

/**
 * Authentic Child Applications Registry.
 * Extracted directly from Anything Apps child repositories with accurate versions,
 * executables, and authentic icons.
 */
export const creativeAppsData: CatalogApp[] = [
  {
    id: 'mediaflow-studio',
    name: 'MediaFlow Studio',
    shortName: 'MS',
    category: 'Media & Video',
    version: '26.11.05',
    localVersion: '26.11.05',
    description: 'Automated video production and rendering pipeline built for high-performance broadcast workflows.',
    executableName: 'MediaFlow Studio.exe',
    installedPath: '',
    gradient: 'from-blue-600 to-indigo-700',
    textColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    githubRepo: 'BSFrameWorks5253/MediaFlow-Studio',
    iconType: 'image',
    iconValue: MEDIAFLOW_STUDIO_LOGO_BASE64,
    status: 'not-installed',
    packageSize: '82.2 MB',
    packageFormat: '.exe',
    targetPlatforms: ['desktop'],
    badgeTag: 'v26.11.07 · Ready to Install',
    addedByCreator: true,
  },
  {
    id: 'one-tap',
    name: 'One Tap',
    shortName: 'OT',
    category: 'Media & Production',
    version: '26.11.6',
    localVersion: '26.11.6',
    description: 'Automated video production workstation and safar task reconciliation engine.',
    executableName: 'One Tap.exe',
    installedPath: '',
    gradient: 'from-rose-600 via-red-600 to-amber-500',
    textColor: '#f43f5e',
    glowColor: 'rgba(244, 63, 94, 0.45)',
    githubRepo: 'BSFrameWorks5253/onetap-workstation',
    iconType: 'image',
    iconValue: ONE_TAP_LOGO_BASE64,
    status: 'not-installed',
    packageSize: '91.6 MB',
    packageFormat: '.exe',
    targetPlatforms: ['desktop'],
    badgeTag: 'v26.11.08 · Ready to Install',
    addedByCreator: true,
  },
  {
    id: 'docuflow-studio',
    name: 'VectorForge Studio',
    shortName: 'VF',
    category: 'Productivity & Documents',
    version: '26.11.5',
    localVersion: '26.11.5',
    description: 'In-place vector PDF editing and precision document mastering workstation.',
    executableName: 'PDF Master Pro.exe',
    installedPath: '',
    gradient: 'from-emerald-600 to-teal-700',
    textColor: '#2dd4bf',
    glowColor: 'rgba(45, 212, 191, 0.45)',
    githubRepo: 'BSFrameWorks5253/VectorForge',
    iconType: 'image',
    iconValue: DOCUFLOW_STUDIO_LOGO_BASE64,
    status: 'not-installed',
    packageSize: '118.0 MB',
    packageFormat: '.exe',
    targetPlatforms: ['desktop'],
    badgeTag: 'v26.11.5 · Ready to Install',
    addedByCreator: true,
  },
  {
    id: 'pixelcharm',
    name: 'Pixelcharm',
    shortName: 'PC',
    category: 'Creative & Design',
    version: '26.10.31',
    localVersion: '26.10.31',
    description: 'Creative visual effects, intelligent color transformation and high-res image mastering studio.',
    executableName: 'Pixelcharm.exe',
    installedPath: '',
    gradient: 'from-pink-600 to-purple-700',
    textColor: '#f472b6',
    glowColor: 'rgba(244, 114, 182, 0.45)',
    githubRepo: 'BSFrameWorks5253/Pixelcharm',
    iconType: 'image',
    iconValue: PIXELCHARM_LOGO_BASE64,
    status: 'not-installed',
    packageSize: '124.5 MB',
    packageFormat: '.exe',
    targetPlatforms: ['desktop'],
    badgeTag: 'v26.10.31 · Ready to Install',
    addedByCreator: true,
  },
  {
    id: 'anything-office',
    name: 'Anything Office',
    shortName: 'AO',
    category: 'Custom Tools',
    version: '26.10.31',
    localVersion: '26.10.31',
    description: 'Unified office workstation with real-time word processing, spreadsheet calculus, and document presentation tools.',
    executableName: 'Anything Office.exe',
    installedPath: '',
    gradient: 'from-cyan-600 to-sky-700',
    textColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    githubRepo: 'BSFrameworks5253/Anything-Office',
    iconType: 'image',
    iconValue: ANYTHING_OFFICE_LOGO_BASE64,
    status: 'not-installed',
    packageSize: '137.3 MB',
    packageFormat: '.exe',
    targetPlatforms: ['desktop'],
    badgeTag: 'v26.10.31 · Ready to Install',
    addedByCreator: true,
  },
  {
    id: 'anything-data-manage',
    name: 'Anything Data Manage',
    shortName: 'DM',
    category: 'Productivity & Data',
    version: '26.10.32',
    localVersion: '26.10.32',
    description: 'AIN53 comprehensive database analysis, reconciliation, and production data pipeline manager.',
    executableName: 'AIN53_Data_Management_Portable.exe',
    installedPath: '',
    gradient: 'from-amber-600 to-orange-700',
    textColor: '#fbbf24',
    glowColor: 'rgba(251, 191, 36, 0.45)',
    githubRepo: 'BSFrameWorks5253/AIN53',
    iconType: 'image',
    iconValue: ANYTHING_DATA_MANAGE_LOGO_BASE64,
    status: 'not-installed',
    packageSize: '109.5 MB',
    packageFormat: '.exe',
    targetPlatforms: ['desktop'],
    badgeTag: 'v26.10.32 · Ready to Install',
    addedByCreator: true,
  },
  {
    id: 'anything-file-manager',
    name: 'Anything File Manager',
    shortName: 'AFM',
    category: 'Media & Production',
    version: '1.0.0',
    localVersion: '1.0.0',
    description: 'Unified high-speed media explorer and asset command center with One Tap production workflow integration.',
    executableName: 'Anything File Manager.exe',
    installedPath: '',
    gradient: 'from-violet-600 via-indigo-600 to-purple-700',
    textColor: '#c084fc',
    glowColor: 'rgba(192, 132, 252, 0.45)',
    githubRepo: 'BSFrameWorks5253/Anything-File-Manager',
    iconType: 'image',
    iconValue: ANYTHING_FILE_MANAGER_LOGO_BASE64,
    status: 'not-installed',
    packageSize: '85.4 MB',
    packageFormat: '.exe',
    targetPlatforms: ['desktop'],
    badgeTag: 'v26.11.08 · Ready to Install',
    addedByCreator: true,
  },
];

/**
 * Reconciles any loaded app list with authentic child app data,
 * fixing missing paths, restoring 'installed' status, and setting genuine icons.
 */
export function reconcileWithChildApps(incoming?: CatalogApp[]): CatalogApp[] {
  const defaultsMap = new Map<string, CatalogApp>();
  for (const def of creativeAppsData) {
    defaultsMap.set(def.id, def);
  }

  const result: CatalogApp[] = [];
  const processedKeys = new Set<string>();

  if (Array.isArray(incoming)) {
    for (const app of incoming) {
      if (isHostAnythingApp(app)) {
        continue;
      }
      const normId = (app.id || '').toLowerCase().replace(/^app-/, '');
      // Skip known obsolete duplicate entries
      if (['onetap', 'mediaflow', 'docuflow', 'app-anything-data-manage'].includes(normId)) {
        continue;
      }
      if (normId === 'anything' || normId === 'auto-copier' || normId === 'pulsewave') {
        continue;
      }

      // Check if it matches a default child app
      let matchedDefault: CatalogApp | undefined;
      for (const [defId, defApp] of defaultsMap.entries()) {
        if (normId === defId || app.name?.toLowerCase().includes(defApp.name.toLowerCase())) {
          matchedDefault = defApp;
          break;
        }
      }

      if (matchedDefault) {
        processedKeys.add(matchedDefault.id);
        const rawPath = app.installedPath || matchedDefault.installedPath || '';
        const cleanInstalledPath = rawPath.toLowerCase().includes('uni desk') ? '' : rawPath;
        const isActuallyInstalled = Boolean(cleanInstalledPath && !cleanInstalledPath.toLowerCase().includes('setup'));
        result.push({
          ...matchedDefault,
          status: isActuallyInstalled ? (app.status === 'update-available' ? 'update-available' : 'installed') : 'not-installed',
          installedPath: isActuallyInstalled ? cleanInstalledPath : '',
          localVersion: isActuallyInstalled ? (app.localVersion || matchedDefault.version) : undefined,
          version: matchedDefault.version,
          iconValue: matchedDefault.iconValue,
          iconType: 'image',
        });
      } else {
        const isActuallyInstalled = Boolean(app.installedPath && !app.installedPath.toLowerCase().includes('setup'));
        result.push({
          ...app,
          status: isActuallyInstalled ? (app.status || 'installed') : (app.status === 'downloading' ? 'downloading' : 'not-installed'),
          installedPath: isActuallyInstalled ? app.installedPath : '',
        });
      }
    }
  }

  // Ensure all 6 default child apps are in the list
  for (const [defId, defApp] of defaultsMap.entries()) {
    if (!processedKeys.has(defId)) {
      result.push(defApp);
    }
  }

  return result;
}

export const appCategoriesList: string[] = [
  'All',
  'Media & Video',
  'Media & Production',
  'Productivity & Documents',
  'Creative & Design',
  'Development',
  'Mobile',
  'Custom Tools',
];

export const popularPresets: Partial<CreativeApp>[] = [];

export const mockCloudFiles: CloudFileItem[] = [];
