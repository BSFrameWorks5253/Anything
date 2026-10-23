import React, { useState, useRef } from 'react';
import {
  X,
  Sparkles,
  Upload,
  Image as ImageIcon,
  Smile,
  Layers,
  Check,
  RotateCcw,
  Pencil,
} from 'lucide-react';
import type { CatalogApp } from '../../../types/app.types';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { AppIconRenderer } from './CrazyAppStudio/AppIconRenderer';
import { appCategoriesList } from '../../../data/apps.data';
import { useTheme } from '../../../context/ThemeContext';

interface EditAppModalProps {
  app: CatalogApp | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (appId: string, updates: Partial<CatalogApp>) => Promise<void> | void;
}

const emojiIcons = [
  '⚡', '🎨', '🚀', '💻', '🎬', '🎮', '🔮', '🎧', '📦', '📸', '✨', '🛠️',
  '📊', '🌐', '🔒', '🎵', '📝', '🎯', '💡', '🔥', '🤖', '📱', '🧭', '🧩',
];

const liquidShaders = [
  { label: 'Cyber Cyan', gradient: 'from-blue-600 via-sky-500 to-cyan-400', textColor: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)' },
  { label: 'Cosmic Violet', gradient: 'from-violet-700 via-purple-600 to-indigo-500', textColor: '#c084fc', glow: 'rgba(192, 132, 252, 0.45)' },
  { label: 'Liquid Amber', gradient: 'from-amber-600 via-orange-500 to-yellow-400', textColor: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)' },
  { label: 'Emerald Aurora', gradient: 'from-emerald-500 via-teal-400 to-cyan-400', textColor: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.45)' },
  { label: 'Apple Rose', gradient: 'from-pink-600 via-rose-500 to-orange-400', textColor: '#fb7185', glow: 'rgba(251, 113, 133, 0.45)' },
  { label: 'Magma Flame', gradient: 'from-red-600 via-rose-600 to-amber-500', textColor: '#f97316', glow: 'rgba(249, 115, 22, 0.45)' },
  { label: 'Obsidian Void', gradient: 'from-slate-800 via-gray-900 to-black', textColor: '#cbd5e1', glow: 'rgba(203, 213, 225, 0.35)' },
  { label: 'Solar Prismatic', gradient: 'from-fuchsia-600 via-purple-600 to-cyan-400', textColor: '#e879f9', glow: 'rgba(232, 121, 249, 0.45)' },
];

export const EditAppModal: React.FC<EditAppModalProps> = ({
  app,
  isOpen,
  onClose,
  onSave,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen || !app) return null;

  return <EditAppModalContent app={app} isLight={isLight} onClose={onClose} onSave={onSave} fileInputRef={fileInputRef} />;
};

const EditAppModalContent: React.FC<{
  app: CatalogApp;
  isLight: boolean;
  onClose: () => void;
  onSave: (appId: string, updates: Partial<CatalogApp>) => Promise<void> | void;
  fileInputRef: React.RefObject<HTMLInputElement | null>;
}> = ({ app, isLight, onClose, onSave, fileInputRef }) => {
  const [name, setName] = useState(app.name || '');
  const [category, setCategory] = useState(app.category || 'Creative & Design');
  const [description, setDescription] = useState(app.description || '');
  const [iconType, setIconType] = useState<'image' | 'emoji' | 'monogram'>(
    app.iconType || (app.iconValue?.startsWith('data:image/') || app.iconValue?.endsWith('.png') ? 'image' : 'emoji')
  );
  const [iconValue, setIconValue] = useState(app.iconValue || '⚡');
  const [shortName, setShortName] = useState(app.shortName || app.name?.slice(0, 2).toUpperCase() || 'AP');
  const [selectedShader, setSelectedShader] = useState(
    liquidShaders.find((s) => s.gradient === app.gradient) || liquidShaders[0]
  );
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Handle Image File Upload (Base64)
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/') && !file.name.endsWith('.ico') && !file.name.endsWith('.svg')) {
      setErrorMessage('Please select a valid image file (PNG, JPG, SVG, ICO, WebP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUri = event.target?.result as string;
      if (dataUri) {
        setIconType('image');
        setIconValue(dataUri);
        setErrorMessage('');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleResetToOriginal = () => {
    setName(app.name || '');
    setCategory(app.category || 'Creative & Design');
    setDescription(app.description || '');
    setIconType(app.iconType || 'emoji');
    setIconValue(app.iconValue || '⚡');
    setShortName(app.shortName || 'AP');
    setErrorMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Application title is required.');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');

    try {
      const updates: Partial<CatalogApp> = {
        name: name.trim(),
        category,
        description: description.trim(),
        iconType,
        iconValue,
        shortName: shortName.trim() || name.slice(0, 2).toUpperCase(),
        gradient: selectedShader.gradient,
        textColor: selectedShader.textColor,
        glowColor: selectedShader.glow,
        hasRealIcon: true,
      };

      await onSave(app.id, updates);
      setIsSaving(false);
      onClose();
    } catch (err: any) {
      setIsSaving(false);
      setErrorMessage(err.message || 'Failed to save app changes.');
    }
  };

  // Live preview dummy app
  const previewApp: Partial<CatalogApp> = {
    ...app,
    name: name || 'Application Title',
    category,
    description,
    iconType,
    iconValue,
    shortName: shortName || 'AP',
    gradient: selectedShader.gradient,
    textColor: selectedShader.textColor,
    glowColor: selectedShader.glow,
    hasRealIcon: true,
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-2xl animate-fadeIn ${
        isLight ? 'bg-slate-900/40' : 'bg-slate-950/80'
      }`}
    >
      <GlassCard
        variant="elevated"
        className={`w-full max-w-2xl shadow-2xl relative overflow-hidden flex flex-col max-h-[92vh] ${
          isLight ? 'border-white/80' : 'border-white/20'
        }`}
      >
        {/* Glow backdrop */}
        <div
          className="absolute -top-32 -right-32 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-30"
          style={{ background: selectedShader.glow }}
        />

        {/* Modal Header */}
        <div
          className={`flex items-center justify-between p-6 pb-4 border-b relative z-10 ${
            isLight ? 'border-slate-900/10' : 'border-white/[0.08]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center text-cyan-500 shadow-sm">
              <Pencil className="w-5 h-5" />
            </div>
            <div>
              <h2 className={`text-lg font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                Edit Application & Icon
              </h2>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                Customize icon, name, category, and metadata for <span className="font-semibold">{app.name}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isLight
                ? 'text-slate-500 hover:text-slate-900 hover:bg-slate-100'
                : 'text-white/60 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 relative z-10">
          {errorMessage && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium">
              {errorMessage}
            </div>
          )}

          {/* 1. App Icon Customization Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className={`text-xs font-mono uppercase tracking-wider font-semibold ${isLight ? 'text-slate-700' : 'text-white/70'}`}>
                Application Icon
              </label>

              {/* Icon Mode Tabs */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-200 dark:bg-white/5 border border-zinc-300 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIconType('image')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    iconType === 'image'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <ImageIcon className="w-3 h-3" />
                  <span>Logo / Image</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIconType('emoji');
                    if (iconValue.startsWith('data:image/')) setIconValue('⚡');
                  }}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    iconType === 'emoji'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Smile className="w-3 h-3" />
                  <span>Emoji</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIconType('monogram')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    iconType === 'monogram'
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Layers className="w-3 h-3" />
                  <span>Monogram</span>
                </button>
              </div>
            </div>

            {/* Icon Preview + Controls Card */}
            <div className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center gap-4 ${
              isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/[0.03] border-white/10'
            }`}>
              <div className="shrink-0 p-1 rounded-2xl bg-white/60 dark:bg-zinc-900/60 shadow-lg border border-black/5 dark:border-white/10">
                <AppIconRenderer app={previewApp} size="lg" />
              </div>

              <div className="flex-1 space-y-2 w-full">
                {iconType === 'image' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/svg+xml,image/x-icon,image/webp,.ico"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="px-3 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Upload Custom Logo</span>
                      </button>
                      {iconValue.startsWith('data:image/') && (
                        <button
                          type="button"
                          onClick={() => {
                            setIconType('emoji');
                            setIconValue('⚡');
                          }}
                          className="px-2.5 py-1.5 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 font-medium transition-colors"
                        >
                          Remove Image
                        </button>
                      )}
                    </div>
                    <p className={`text-[11px] mt-1.5 ${isLight ? 'text-slate-500' : 'text-white/40'}`}>
                      Accepts PNG, SVG, JPG, ICO, WebP (512×512 transparent PNG recommended).
                    </p>
                  </div>
                )}

                {iconType === 'emoji' && (
                  <div>
                    <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1">
                      {emojiIcons.map((e) => (
                        <button
                          key={e}
                          type="button"
                          onClick={() => setIconValue(e)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-base transition-transform hover:scale-110 ${
                            iconValue === e
                              ? 'bg-cyan-500/25 border-2 border-cyan-400 scale-105'
                              : isLight ? 'bg-slate-200/60 hover:bg-slate-300' : 'bg-white/5 hover:bg-white/15'
                          }`}
                        >
                          {e}
                        </button>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <span className={`text-[11px] font-mono ${isLight ? 'text-slate-500' : 'text-white/50'}`}>Or custom emoji:</span>
                      <input
                        type="text"
                        value={iconValue.startsWith('data:image/') ? '⚡' : iconValue}
                        onChange={(e) => setIconValue(e.target.value)}
                        className={`w-14 px-2 py-0.5 rounded-lg text-center text-sm border font-mono ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-900'
                            : 'bg-zinc-900 border-white/15 text-white'
                        }`}
                        maxLength={4}
                      />
                    </div>
                  </div>
                )}

                {iconType === 'monogram' && (
                  <div className="flex items-center gap-3">
                    <div>
                      <label className={`text-[10px] font-mono block mb-1 ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                        2-Letter Monogram
                      </label>
                      <input
                        type="text"
                        value={shortName}
                        onChange={(e) => setShortName(e.target.value.toUpperCase())}
                        maxLength={3}
                        className={`w-20 px-3 py-1.5 rounded-xl border text-center font-bold tracking-wider text-sm ${
                          isLight
                            ? 'bg-white border-slate-300 text-slate-900'
                            : 'bg-zinc-900 border-white/15 text-white'
                        }`}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Liquid Shader Gradient Preset (for monogram/border glow) */}
          <div className="space-y-2">
            <label className={`text-xs font-mono uppercase tracking-wider font-semibold ${isLight ? 'text-slate-700' : 'text-white/70'}`}>
              Theme Shader & Aura
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {liquidShaders.map((shader) => (
                <button
                  key={shader.label}
                  type="button"
                  onClick={() => setSelectedShader(shader)}
                  className={`p-2 rounded-xl border flex items-center gap-2 transition-all ${
                    selectedShader.label === shader.label
                      ? 'border-cyan-400 bg-cyan-500/15 shadow-sm'
                      : isLight
                      ? 'border-slate-200 bg-white hover:bg-slate-50'
                      : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.06]'
                  }`}
                >
                  <div className={`w-4 h-4 rounded-full bg-gradient-to-tr ${shader.gradient} shrink-0`} />
                  <span className={`text-[11px] font-medium truncate ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    {shader.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* 2. App Name & Category Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-mono uppercase tracking-wider font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-white/70'}`}>
                Application Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Photo Studio, Vector Forge"
                className={`w-full px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500'
                    : 'bg-zinc-900 border-white/15 text-white focus:border-cyan-400'
                }`}
              />
            </div>

            <div>
              <label className={`block text-xs font-mono uppercase tracking-wider font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-white/70'}`}>
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-3.5 py-2 rounded-xl border text-sm font-medium transition-colors ${
                  isLight
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500'
                    : 'bg-zinc-900 border-white/15 text-white focus:border-cyan-400'
                }`}
              >
                {appCategoriesList.filter((c) => c !== 'All').map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 3. Description */}
          <div>
            <label className={`block text-xs font-mono uppercase tracking-wider font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-white/70'}`}>
              Description
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what this creative application does..."
              className={`w-full px-3.5 py-2 rounded-xl border text-xs leading-relaxed transition-colors resize-none ${
                isLight
                  ? 'bg-white border-slate-300 text-slate-900 focus:border-cyan-500'
                  : 'bg-zinc-900 border-white/15 text-white focus:border-cyan-400'
              }`}
            />
          </div>

          {/* Modal Footer Controls */}
          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={handleResetToOriginal}
              className={`text-xs flex items-center gap-1.5 transition-colors ${
                isLight ? 'text-slate-500 hover:text-slate-800' : 'text-white/50 hover:text-white'
              }`}
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Values</span>
            </button>

            <div className="flex items-center gap-2">
              <GlassButton
                type="button"
                variant="glass"
                size="sm"
                onClick={onClose}
                disabled={isSaving}
              >
                Cancel
              </GlassButton>
              <GlassButton
                type="submit"
                variant="primary"
                size="sm"
                icon={<Check className="w-4 h-4" />}
                disabled={isSaving}
                className="font-bold px-4"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </GlassButton>
            </div>
          </div>
        </form>
      </GlassCard>
    </div>
  );
};
