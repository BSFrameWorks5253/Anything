import React, { useState, useRef, useEffect } from 'react';
import {
  Sparkles,
  Play,
  Upload,
  Image as ImageIcon,
  Check,
  RotateCcw,
  Sliders,
  Palette,
  Crop,
  Layers,
  Save,
  CheckCircle2,
  FileCode,
  Copy,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import { AnythingBrandEmblem } from '../../../components/ui/AdobeSplashScreen';
import { InstagramImageCropModal } from '../../../components/ui/InstagramImageCropModal';
import {
  TAP_STUDIO_LOGO_BASE64,
  MEDIAFLOW_STUDIO_LOGO_BASE64,
} from '../../apps/constants/appLogos';
import {
  splashArtworkPresets,
  loadAppSplashSettings,
  saveAppSplashSettings,
  defaultSplashSettings,
  defaultChildAppSplashSettings,
  type SplashSettings,
} from '../../../data/splash.data';

interface SplashScreenSectionProps {
  onPreview: (settings: SplashSettings) => void;
  initialAppId?: string;
}

export const SplashScreenSection: React.FC<SplashScreenSectionProps> = ({
  onPreview,
  initialAppId = 'anything',
}) => {
  const [selectedAppId, setSelectedAppId] = useState<string>(initialAppId);
  const [settings, setSettings] = useState<SplashSettings>(() =>
    loadAppSplashSettings(initialAppId)
  );
  const [customUrlInput, setCustomUrlInput] = useState('');
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [cropSourceImage, setCropSourceImage] = useState<string | null>(null);
  const [syncStatus, setSyncStatus] = useState<string | null>(null);
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Switch active app loader
  const handleSelectApp = (appId: string) => {
    setSelectedAppId(appId);
    const loaded = loadAppSplashSettings(appId);
    setSettings(loaded);
    setSyncStatus(null);
  };

  const updateSettings = async (partial: Partial<SplashSettings>) => {
    const next = { ...settings, ...partial, appId: selectedAppId };
    setSettings(next);
    saveAppSplashSettings(selectedAppId, next);

    // Sync to disk if Electron is active
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.saveChildAppLoaderConfig) {
      try {
        const res = await electronAPI.saveChildAppLoaderConfig({
          appId: selectedAppId,
          config: next,
        });
        if (res?.success) {
          setSyncStatus(`Synced to releases/${selectedAppId}/loader-config.json`);
          setTimeout(() => setSyncStatus(null), 4000);
        }
      } catch (e) {
        console.error('Failed to sync loader config to disk:', e);
      }
    }
  };

  const handleSelectPreset = (preset: (typeof splashArtworkPresets)[0]) => {
    updateSettings({
      artworkUrl: preset.imageUrl,
      artistName: preset.artist,
      artworkTitle: preset.title,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setCropSourceImage(reader.result);
          setCropModalOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    updateSettings({
      artworkUrl: croppedDataUrl,
      artistName: settings.artistName || 'Anything Creation',
      artworkTitle: settings.artworkTitle || '-Designed by Burhanuddin',
    });
  };

  const handleApplyCustomUrl = () => {
    if (customUrlInput.trim()) {
      updateSettings({
        artworkUrl: customUrlInput.trim(),
        artistName: settings.artistName || 'Anything Creation',
        artworkTitle: settings.artworkTitle || '-Designed by Burhanuddin',
      });
      setCustomUrlInput('');
    }
  };

  const handleResetDefaults = () => {
    const defaults =
      selectedAppId === 'anything'
        ? defaultSplashSettings
        : defaultChildAppSplashSettings[selectedAppId] || {
            ...defaultSplashSettings,
            appId: selectedAppId,
            productName:
              selectedAppId.charAt(0).toUpperCase() +
              selectedAppId.slice(1).replace(/-/g, ' '),
            logoText: selectedAppId.slice(0, 2).toUpperCase(),
          };
    setSettings(defaults);
    saveAppSplashSettings(selectedAppId, defaults);
    updateSettings(defaults);
  };

  const emblemLetters =
    settings.logoText ||
    (settings.productName?.toLowerCase().includes('tap')
      ? 'Ts'
      : settings.productName?.toLowerCase().includes('mediaflow')
      ? 'Ms'
      : settings.productName?.slice(0, 2) || 'An');

  const integrationCodeSnippet = `// Tap Studio / Child App Startup Loader Consumer
const fs = require('fs');
const path = require('path');

function getLoaderConfig() {
  // 1. Check command line arg --loader-config=
  const arg = process.argv.find(a => a.startsWith('--loader-config='));
  if (arg && fs.existsSync(arg.split('=')[1])) {
    return JSON.parse(fs.readFileSync(arg.split('=')[1], 'utf-8'));
  }
  // 2. Check local release folder loader-config.json
  const local = path.join(__dirname, 'loader-config.json');
  if (fs.existsSync(local)) return JSON.parse(fs.readFileSync(local, 'utf-8'));
  // 3. Fallback to default
  return ${JSON.stringify(settings, null, 2)};
}`;

  return (
    <section>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold">
            Startup Loader & Splash Customizer
          </h3>
          <GlassBadge variant="cyan" dot>
            Child Apps Synced
          </GlassBadge>
        </div>

        <div className="flex items-center gap-3">
          {syncStatus && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-1 animate-fadeIn">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {syncStatus}
            </span>
          )}
          <button
            onClick={handleResetDefaults}
            className="text-[11px] text-zinc-500 hover:text-zinc-800 dark:text-white/40 dark:hover:text-white font-mono flex items-center gap-1 transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Defaults</span>
          </button>
        </div>
      </div>

      <GlassCard
        variant="interactive"
        className="p-6 border-zinc-200 dark:border-white/10 space-y-6"
      >
        {/* App Selection Tabs Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 font-semibold uppercase">
              Target Application:
            </span>
            <div className="inline-flex p-1 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700">
              <button
                onClick={() => handleSelectApp('anything')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedAppId === 'anything'
                    ? 'bg-red-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <span>Anything Core</span>
              </button>

              <button
                onClick={() => handleSelectApp('tap-studio')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedAppId === 'tap-studio'
                    ? 'bg-cyan-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <img
                  src={TAP_STUDIO_LOGO_BASE64}
                  alt="Tap Studio"
                  className="w-3.5 h-3.5 object-contain rounded-xs"
                />
                <span>Tap Studio</span>
              </button>

              <button
                onClick={() => handleSelectApp('mediaflow-studio')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
                  selectedAppId === 'mediaflow-studio'
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                }`}
              >
                <img
                  src={MEDIAFLOW_STUDIO_LOGO_BASE64}
                  alt="MediaFlow Studio"
                  className="w-3.5 h-3.5 object-cover rounded-xs"
                />
                <span>MediaFlow Studio</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GlassButton
              variant="glass"
              size="sm"
              icon={<FileCode className="w-3.5 h-3.5 text-cyan-500" />}
              onClick={() => setShowCodeModal(true)}
            >
              Child App Integration
            </GlassButton>

            <GlassButton
              variant="primary"
              size="sm"
              icon={<Play className="w-3.5 h-3.5" />}
              onClick={() => onPreview(settings)}
            >
              Preview Loader
            </GlassButton>
          </div>
        </div>

        {/* Current Active Splash Artwork Preview Card */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
          <div className="md:col-span-5 relative rounded-2xl overflow-hidden border border-zinc-300 dark:border-white/15 h-48 shadow-lg bg-zinc-950 group">
            <img
              src={settings.artworkUrl}
              alt="Active Splash Preview"
              className={`w-full h-full transition-all duration-500 ${
                settings.artworkFit === 'contain'
                  ? 'object-contain bg-zinc-950'
                  : 'object-cover'
              } ${
                settings.artworkPosition === 'top'
                  ? 'object-top'
                  : settings.artworkPosition === 'bottom'
                  ? 'object-bottom'
                  : 'object-center'
              } group-hover:scale-105`}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/40 pointer-events-none" />

            {/* Overlay badge with dynamic letters */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
              <AnythingBrandEmblem
                size={30}
                letters={emblemLetters}
                className="rounded-lg shadow-sm"
              />
              <div className="flex flex-col">
                <span className="text-xs font-bold text-white drop-shadow-sm leading-tight">
                  {settings.productName}
                </span>
                <span className="text-[10px] text-zinc-300 font-mono">
                  {settings.versionText}
                </span>
              </div>
            </div>

            <div className="absolute bottom-3 right-3 text-right">
              <span className="text-[9px] font-mono uppercase text-cyan-300 block font-bold tracking-wider">
                Artwork by
              </span>
              <span className="text-xs font-semibold text-white drop-shadow-xs">
                {settings.artistName}
              </span>
              {settings.artworkTitle && (
                <span className="text-[10px] text-zinc-300 italic block">
                  {settings.artworkTitle}
                </span>
              )}
            </div>
          </div>

          <div className="md:col-span-7 space-y-3.5">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold mb-1.5">
                Artist Name / Credit
              </label>
              <input
                type="text"
                value={settings.artistName}
                onChange={(e) => updateSettings({ artistName: e.target.value })}
                placeholder="e.g. Anything Creation"
                className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold mb-1.5">
                  Artwork Title
                </label>
                <input
                  type="text"
                  value={settings.artworkTitle}
                  onChange={(e) => updateSettings({ artworkTitle: e.target.value })}
                  placeholder="e.g. -Designed by Burhanuddin"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold mb-1.5">
                  Duration (Speed)
                </label>
                <select
                  value={settings.durationMs}
                  onChange={(e) =>
                    updateSettings({ durationMs: Number(e.target.value) })
                  }
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white outline-none focus:border-cyan-500 font-medium"
                >
                  <option value={1500}>Quick (1.5 seconds)</option>
                  <option value={2800}>Standard (2.8 seconds)</option>
                  <option value={4200}>Cinematic (4.2 seconds)</option>
                </select>
              </div>
            </div>

            {/* Framing & Vertical Alignment Options */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                  Framing Mode
                </label>
                <div className="flex rounded-xl bg-zinc-100 dark:bg-white/[0.05] p-1 border border-zinc-200 dark:border-white/10 gap-1">
                  <button
                    type="button"
                    onClick={() => updateSettings({ artworkFit: 'cover' })}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-all ${
                      (settings.artworkFit || 'cover') === 'cover'
                        ? 'bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-xs font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-white'
                    }`}
                  >
                    Fill (Cover)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ artworkFit: 'contain' })}
                    className={`flex-1 py-1 px-2 rounded-lg text-xs font-medium transition-all ${
                      settings.artworkFit === 'contain'
                        ? 'bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-xs font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-white'
                    }`}
                  >
                    Fit Whole Image
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                  Vertical Focus
                </label>
                <div className="flex rounded-xl bg-zinc-100 dark:bg-white/[0.05] p-1 border border-zinc-200 dark:border-white/10 gap-1">
                  <button
                    type="button"
                    onClick={() => updateSettings({ artworkPosition: 'top' })}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-xs font-medium transition-all ${
                      settings.artworkPosition === 'top'
                        ? 'bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-xs font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-white'
                    }`}
                    title="Focus top of image (preserves heads and logos)"
                  >
                    Top (Head)
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ artworkPosition: 'center' })}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-xs font-medium transition-all ${
                      (!settings.artworkPosition || settings.artworkPosition === 'center')
                        ? 'bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-xs font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-white'
                    }`}
                  >
                    Center
                  </button>
                  <button
                    type="button"
                    onClick={() => updateSettings({ artworkPosition: 'bottom' })}
                    className={`flex-1 py-1 px-1.5 rounded-lg text-xs font-medium transition-all ${
                      settings.artworkPosition === 'bottom'
                        ? 'bg-white dark:bg-zinc-800 text-cyan-600 dark:text-cyan-400 shadow-xs font-semibold'
                        : 'text-zinc-600 dark:text-zinc-400 hover:text-white'
                    }`}
                  >
                    Bottom
                  </button>
                </div>
              </div>
            </div>

            {/* App Branding Customization */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                  Product / App Title
                </label>
                <input
                  type="text"
                  value={settings.productName}
                  onChange={(e) => updateSettings({ productName: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-zinc-500 font-semibold mb-1">
                  Version Subtitle
                </label>
                <input
                  type="text"
                  value={settings.versionText}
                  onChange={(e) => updateSettings({ versionText: e.target.value })}
                  className="w-full px-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white font-mono"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Preset Gallery */}
        <div>
          <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold mb-2.5">
            Curated Artwork Presets
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {splashArtworkPresets.map((preset) => {
              const isSelected = settings.artworkUrl === preset.imageUrl;
              return (
                <div
                  key={preset.id}
                  onClick={() => handleSelectPreset(preset)}
                  className={`group relative rounded-xl overflow-hidden border cursor-pointer transition-all duration-200 ${
                    isSelected
                      ? 'border-cyan-500 ring-2 ring-cyan-500/40 scale-[1.02] shadow-md shadow-cyan-500/20'
                      : 'border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/30'
                  }`}
                >
                  <div className="h-24 w-full bg-zinc-900 relative">
                    <img
                      src={preset.imageUrl}
                      alt={preset.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-cyan-500 text-slate-950 flex items-center justify-center shadow-xs">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                  <div className="p-2 bg-zinc-50 dark:bg-white/[0.03]">
                    <p className="text-[11px] font-bold text-zinc-900 dark:text-white truncate">
                      {preset.name}
                    </p>
                    <p className="text-[10px] text-zinc-500 dark:text-white/50 truncate font-mono">
                      {preset.artist}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Custom Upload or Image URL Bar */}
        <div className="pt-2 border-t border-zinc-200 dark:border-white/[0.08] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={customUrlInput}
              onChange={(e) => setCustomUrlInput(e.target.value)}
              placeholder="Paste any custom image URL (https://...)"
              className="flex-1 px-3 py-1.5 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-mono"
            />
            <GlassButton variant="glass" size="sm" onClick={handleApplyCustomUrl}>
              Apply URL
            </GlassButton>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <GlassButton
              variant="glass"
              size="sm"
              icon={<Crop className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
              onClick={() => {
                setCropSourceImage(settings.artworkUrl);
                setCropModalOpen(true);
              }}
            >
              Adjust & Crop
            </GlassButton>
            <GlassButton
              variant="glass"
              size="sm"
              icon={<Upload className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
              onClick={() => fileInputRef.current?.click()}
            >
              Upload Local Image
            </GlassButton>
          </div>
        </div>
      </GlassCard>

      {/* Instagram-style Crop Modal for Splash Loader Artwork */}
      {cropModalOpen && cropSourceImage && (
        <InstagramImageCropModal
          isOpen={cropModalOpen}
          imageSrc={cropSourceImage}
          initialShape="banner"
          title={`Crop & Rotate ${settings.productName} Artwork`}
          onClose={() => {
            setCropModalOpen(false);
            setCropSourceImage(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}

      {/* Child App Integration Code Modal */}
      {showCodeModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-2xl bg-[#18181B] rounded-2xl border border-white/15 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-white">
                  Tap Studio & Child App Integration
                </h4>
              </div>
              <button
                onClick={() => setShowCodeModal(false)}
                className="text-xs text-zinc-400 hover:text-white font-mono"
              >
                Close ✕
              </button>
            </div>

            <p className="text-xs text-zinc-300 leading-relaxed">
              When you save loader settings in Anything, the configuration is synced to{' '}
              <code className="text-cyan-400 font-mono">
                releases/{selectedAppId}/loader-config.json
              </code>{' '}
              and global AppData. In Tap Studio, include this snippet at startup:
            </p>

            <pre className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-60">
              {integrationCodeSnippet}
            </pre>

            <div className="flex items-center justify-between pt-2">
              <span className="text-[11px] text-zinc-400 font-mono">
                Written for Burhanuddin Sounasath (8369811201)
              </span>
              <GlassButton
                variant="primary"
                size="sm"
                icon={<Copy className="w-3.5 h-3.5" />}
                onClick={() => {
                  navigator.clipboard.writeText(integrationCodeSnippet);
                  setCopiedCode(true);
                  setTimeout(() => setCopiedCode(false), 2000);
                }}
              >
                {copiedCode ? 'Copied to Clipboard!' : 'Copy Integration Code'}
              </GlassButton>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
