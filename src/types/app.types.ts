export type NavigationPage = 
  | 'home' 
  | 'apps' 
  | 'publisher'
  | 'creator'
  | 'files' 
  | 'settings';

export type AppCategory = 
  | 'All' 
  | 'Creative & Design' 
  | 'Development' 
  | 'Video & 3D' 
  | 'Productivity' 
  | 'Gaming & Media'
  | 'Custom Tools';

export type AppLifecycleStatus = 
  | 'not-installed'     // Ready to download & install
  | 'downloading'       // Currently downloading package
  | 'extracting'        // Unpacking & configuring
  | 'installed'         // Ready to launch
  | 'ready'             // Ready alias for installed
  | 'update-available'  // Remote version > local version
  | 'path-broken'       // Executable missing from disk
  | 'trial';            // Free trial / Demo mode active

export interface DownloadProgress {
  percent: number;
  transferredBytes: number;
  totalBytes: number;
  speedBytesPerSec: number;
}

export interface AppReleaseMetadata {
  version: string;
  executableName?: string;
  releaseDate?: string;
  releaseType?: 'major' | 'minor' | 'patch';
  tagline?: string;
  summary?: string;
  newFeatures?: string[];
  improvements?: string[];
  fixes?: string[];
  downloadUrl?: string;
  sizeFormatted?: string;
  emailNotification?: {
    subject?: string;
    preview?: string;
    ctaText?: string;
    heroGradient?: string;
  };
}

export interface CatalogApp {
  id: string;
  name: string;
  shortName: string;
  category: AppCategory | string;
  description: string;
  version: string;
  localVersion?: string;
  size: string;
  downloadUrl?: string; // Direct link to .zip, .exe, or GitHub Release
  releasesUrl?: string; // Direct link to GitHub repository releases page
  releasesTagUrl?: string; // Direct link prefix for GitHub release tags (e.g. https://github.com/owner/repo/releases/tag/)
  setupExecutableName?: string; // Remote setup asset name (e.g. Tapstudio_1.2.0_Setup.exe)
  packageFileName?: string; // Legacy or alternative setup file name
  executableName: string; // e.g. "Tap Studio.exe"
  installedPath?: string; // Resolved full path on disk
  gradient: string;
  textColor: string;
  glowColor: string;
  iconType?: 'monogram' | 'emoji' | 'image';
  iconValue?: string;
  /** true when iconValue is an actual app icon (EXE extracted or PNG/SVG provided by creator) */
  hasRealIcon?: boolean;
  status: AppLifecycleStatus;
  trialInfo?: {
    active: boolean;
    startedAt?: number;
  };
  downloadProgress?: DownloadProgress;
  changelog?: string[];
  releaseInfo?: AppReleaseMetadata;
  history?: AppReleaseMetadata[];
  systemRequirements?: {
    os: string;
    ram: string;
    gpu: string;
    storage: string;
  };
  addedByCreator?: boolean;
  githubRepo?: string; // e.g. "owner/repo" or "https://github.com/owner/repo"
  endpoints?: {
    repository?: string;
    releasesDashboard?: string;
    releasesTagUrl?: string;
    latestReleaseApi?: string;
    binaryDownloadPattern?: string;
  };
  latestRelease?: {
    tag: string;
    name: string;
    body?: string;
    assetUrl: string;
    assetName: string;
    assetSize?: string;
    sizeFormatted?: string;
    publishedAt?: string;
  };
}

export interface CloudFileItem {
  id: string;
  name: string;
  appShort: string;
  appGradient: string;
  appTextColor: string;
  modified: string;
  size: string;
  sharedWith?: string[];
  status: 'synced' | 'syncing';
  previewUrl?: string;
  palette?: string[];
}

export interface SplashConfig {
  enabled: boolean;
  artworkUrl: string;
  artistName: string;
  productName: string;
  versionText: string;
  tagline: string;
  durationMs: number;
}

export type ChildAppUpdateMode = 'auto' | 'manual';
export type ChildAppCheckFrequency = '1h' | '6h' | 'startup' | 'manual';

export interface ChildAppUpdateSettings {
  mode: ChildAppUpdateMode;
  frequency: ChildAppCheckFrequency;
  silentInstall: boolean;
  notifyAvailable: boolean;
  notifyComplete: boolean;
  lastCheckedAt?: number;
}

