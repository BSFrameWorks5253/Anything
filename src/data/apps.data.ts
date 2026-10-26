import type { CreativeApp, CloudFileItem } from '../types/app.types';

// All pre-installed dummy apps removed — strictly clean slate! Real GitHub published apps only.
export const creativeAppsData: CreativeApp[] = [];

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

// No dummy presets
export const popularPresets: Partial<CreativeApp>[] = [];

export const mockCloudFiles: CloudFileItem[] = [];
