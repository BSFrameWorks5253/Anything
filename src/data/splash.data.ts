export interface SplashArtworkPreset {
  id: string;
  name: string;
  artist: string;
  title: string;
  imageUrl: string;
  category: string;
}

export const splashArtworkPresets: SplashArtworkPreset[] = [
  {
    id: 'preset-spectrum',
    name: 'Liquid Spectrum 2026',
    artist: 'Anything Creation',
    title: '-Designed by Burhanuddin',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85',
    category: 'Abstract 3D',
  },
  {
    id: 'preset-cosmic',
    name: 'Cosmic Nebula Core',
    artist: 'Elena Rostova',
    title: 'Interstellar Luminescence',
    imageUrl: 'https://images.unsplash.com/photo-1579793900882-c0d3dad7b119?auto=format&fit=crop&w=1400&q=85',
    category: 'Cosmic & Fluid',
  },
  {
    id: 'preset-cyberpunk',
    name: 'Neo Shinjuku Pulse',
    artist: 'Kenji Takahashi',
    title: 'Bioluminescent Architecture',
    imageUrl: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=1400&q=85',
    category: 'Digital Futurism',
  },
  {
    id: 'preset-organic',
    name: 'Chromatic Flora',
    artist: 'Maya Lin Studios',
    title: 'Bioluminescent Petals & Glass',
    imageUrl: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=1400&q=85',
    category: 'Botanical & Organic',
  },
  {
    id: 'preset-minimal',
    name: 'Geometric Horizon',
    artist: 'Studio Bauhaus Digital',
    title: 'Monolith in Titanium Fog',
    imageUrl: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=1400&q=85',
    category: 'Minimalist 3D',
  },
];

export interface SplashSettings {
  appId?: string;
  enabled: boolean;
  artworkUrl: string;
  artistName: string;
  artworkTitle: string;
  productName: string;
  versionText: string;
  tagline: string;
  durationMs: number;
  logoText?: string;
  badgeGradient?: string;
  artworkFit?: 'cover' | 'contain';
  artworkPosition?: 'center' | 'top' | 'bottom';
}

export const defaultSplashSettings: SplashSettings = {
  appId: 'anything',
  enabled: true,
  artworkUrl: splashArtworkPresets[0].imageUrl,
  artistName: 'Anything Creation',
  artworkTitle: '-Designed by Burhanuddin',
  productName: 'Anything',
  versionText: '2026.1 Release · v1.0.0 (x64)',
  tagline: 'Creative & Productivity Master Hub',
  durationMs: 2800,
  logoText: 'An',
  badgeGradient: 'from-red-600 via-rose-500 to-amber-500',
  artworkFit: 'cover',
  artworkPosition: 'center',
};

export const defaultChildAppSplashSettings: Record<string, SplashSettings> = {
  'tap-studio': {
    appId: 'tap-studio',
    enabled: true,
    artworkUrl: splashArtworkPresets[0].imageUrl,
    artistName: 'Anything Creation',
    artworkTitle: '-Designed by Burhanuddin',
    productName: 'Tap Studio',
    versionText: 'v1.0.0 (x64)',
    tagline: 'Macro Automation & Stream Deck Companion',
    durationMs: 2800,
    logoText: 'Ts',
    badgeGradient: 'from-cyan-600 via-sky-500 to-indigo-600',
    artworkFit: 'cover',
    artworkPosition: 'center',
  },
};

export const loadSplashSettings = (): SplashSettings => {
  return loadAppSplashSettings('anything');
};

export const saveSplashSettings = (settings: SplashSettings) => {
  saveAppSplashSettings('anything', settings);
};

export const loadAppSplashSettings = (appId: string = 'anything'): SplashSettings => {
  try {
    const key =
      appId === 'anything'
        ? 'anything_splash_screen_settings_v1'
        : `anything_splash_screen_settings_${appId}`;
    const saved = localStorage.getItem(key);
    const defaults =
      appId === 'anything'
        ? defaultSplashSettings
        : defaultChildAppSplashSettings[appId] || {
            ...defaultSplashSettings,
            appId,
            productName: appId.charAt(0).toUpperCase() + appId.slice(1).replace(/-/g, ' '),
            logoText: appId.slice(0, 2).toUpperCase(),
            tagline: 'Integrated Workspace Application',
            versionText: 'v1.0.0 (x64)',
          };

    if (saved) {
      const parsed = JSON.parse(saved);
      // Automatically migrate legacy values to Image 1 defaults
      if (parsed.artistName === 'Adobe Creative Collective') {
        parsed.artistName = 'Anything Creation';
      }
      if (parsed.artworkTitle === 'Refractive Glass in Motion' || !parsed.artworkTitle) {
        parsed.artworkTitle = '-Designed by Burhanuddin';
      }
      return { ...defaults, ...parsed };
    }
    return defaults;
  } catch (e) {
    console.error('Failed to load splash settings:', e);
  }
  return appId === 'anything'
    ? defaultSplashSettings
    : defaultChildAppSplashSettings[appId] || defaultSplashSettings;
};

export const saveAppSplashSettings = (appId: string = 'anything', settings: SplashSettings) => {
  try {
    const key =
      appId === 'anything'
        ? 'anything_splash_screen_settings_v1'
        : `anything_splash_screen_settings_${appId}`;
    localStorage.setItem(key, JSON.stringify({ ...settings, appId }));
  } catch (e) {
    console.error('Failed to save splash settings:', e);
  }
};
