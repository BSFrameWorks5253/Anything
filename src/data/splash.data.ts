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
    artist: 'Adobe Creative Collective',
    title: 'Refractive Glass in Motion',
    imageUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85',
    category: 'Abstract 3D',
  },
  {
    id: 'preset-cosmic',
    name: 'Cosmic Nebula Core',
    artist: 'Elena Rostova',
    title: 'Interstellar Luminescence',
    imageUrl: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?auto=format&fit=crop&w=1400&q=85',
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
  enabled: boolean;
  artworkUrl: string;
  artistName: string;
  artworkTitle: string;
  productName: string;
  versionText: string;
  tagline: string;
  durationMs: number;
}

export const defaultSplashSettings: SplashSettings = {
  enabled: true,
  artworkUrl: splashArtworkPresets[0].imageUrl,
  artistName: splashArtworkPresets[0].artist,
  artworkTitle: splashArtworkPresets[0].title,
  productName: 'Anything',
  versionText: '2026.1 Release · v1.0.0 (x64)',
  tagline: 'Creative & Productivity Master Hub',
  durationMs: 2800,
};

export const loadSplashSettings = (): SplashSettings => {
  try {
    const saved = localStorage.getItem('anything_splash_screen_settings_v1');
    if (saved) {
      return { ...defaultSplashSettings, ...JSON.parse(saved) };
    }
  } catch (e) {
    console.error('Failed to load splash settings:', e);
  }
  return defaultSplashSettings;
};

export const saveSplashSettings = (settings: SplashSettings) => {
  try {
    localStorage.setItem('anything_splash_screen_settings_v1', JSON.stringify(settings));
  } catch (e) {
    console.error('Failed to save splash settings:', e);
  }
};
