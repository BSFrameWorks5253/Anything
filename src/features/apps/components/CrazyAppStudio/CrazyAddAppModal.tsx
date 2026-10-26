import React, { useState } from 'react';
import { X, Sparkles, Wand2, Upload, FileJson, Sliders, Check, FolderOpen, GitBranch, CloudDownload, CheckCircle2, RefreshCw } from 'lucide-react';
import type { CreativeApp } from '../../../../types/app.types';
import { GlassCard } from '../../../../components/ui/GlassCard';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { ExeDropTarget } from './ExeDropTarget';
import { PresetOneClickPicker } from './PresetOneClickPicker';
import { AppIconRenderer } from './AppIconRenderer';
import { useTheme } from '../../../../context/ThemeContext';

interface CrazyAddAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingApps: CreativeApp[];
  onAddApp: (newApp: CreativeApp) => void;
  onImportApps: (importedApps: CreativeApp[]) => void;
}

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

const emojiIcons = ['⚡', '🎨', '🚀', '💻', '🎬', '🎮', '🔮', '🎧', '📦', '📸', '✨', '🛠️'];

export const CrazyAddAppModal: React.FC<CrazyAddAppModalProps> = ({
  isOpen,
  onClose,
  existingApps,
  onAddApp,
  onImportApps,
}) => {
  const [activeTab, setActiveTab] = useState<'drop' | 'github' | 'presets' | 'custom' | 'json'>('drop');
  const [githubRepoInput, setGithubRepoInput] = useState('');
  const [githubCheckStatus, setGithubCheckStatus] = useState<{
    checking: boolean;
    info?: any;
    error?: string;
  }>({ checking: false });

  // Custom Form state
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [category, setCategory] = useState('Creative & Design');
  const [executablePath, setExecutablePath] = useState('');
  const [launchArgs, setLaunchArgs] = useState('');
  const [description, setDescription] = useState('');
  const [iconType, setIconType] = useState<'monogram' | 'emoji' | 'image'>('monogram');
  const [selectedEmoji, setSelectedEmoji] = useState('⚡');
  const [selectedShader, setSelectedShader] = useState(liquidShaders[0]);

  // JSON state
  const [jsonText, setJsonText] = useState('');
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (!isOpen) return null;

  const handleAddPreset = (preset: Partial<CreativeApp>) => {
    const newApp: CreativeApp = {
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: preset.name || 'Custom App',
      shortName: preset.shortName || 'App',
      category: preset.category || 'Creative & Design',
      description: preset.description || 'Quick-added application.',
      gradient: preset.gradient || selectedShader.gradient,
      textColor: preset.textColor || selectedShader.textColor,
      glowColor: preset.glowColor || selectedShader.glow,
      version: "26.10.26",
      status: 'installed',
      size: 'Local Application',
      executablePath: preset.executablePath || '',
      iconType: preset.iconType || 'emoji',
      iconValue: preset.iconValue || '⚡',
      badgeTag: 'Quick Add',
      isCustom: true,
      addedAt: Date.now(),
    };
    onAddApp(newApp);
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newApp: CreativeApp = {
      id: `app-${Date.now()}`,
      name: name.trim(),
      shortName: shortName.trim() || name.slice(0, 2).toUpperCase(),
      category,
      description: description.trim() || 'Custom registered application.',
      gradient: selectedShader.gradient,
      textColor: selectedShader.textColor,
      glowColor: selectedShader.glow,
      version: "26.10.26",
      status: 'installed',
      size: 'Custom Registered',
      executablePath: executablePath.trim() || undefined,
      launchArgs: launchArgs.trim() || undefined,
      iconType,
      iconValue: iconType === 'emoji' ? selectedEmoji : undefined,
      badgeTag: 'Studio Pro',
      isCustom: true,
      addedAt: Date.now(),
    };

    onAddApp(newApp);
    onClose();
  };

  const handleCheckAndAddFromGitHub = async () => {
    if (!githubRepoInput.trim()) return;
    setGithubCheckStatus({ checking: true });
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.checkGitHubRelease) {
      const res = await electronAPI.checkGitHubRelease(githubRepoInput.trim());
      if (res.success) {
        setGithubCheckStatus({ checking: false, info: res });
        const repoName = res.repo.split('/')[1] || 'App';
        const formattedTitle = repoName.replace(/[-_]/g, ' ').replace(/\b\w/g, (c: string) => c.toUpperCase());
        const newApp: any = {
          id: `app-gh-${Date.now()}`,
          name: formattedTitle,
          shortName: formattedTitle.slice(0, 2).toUpperCase(),
          category: 'Development',
          description: res.releaseNotes
            ? `${res.releaseName || res.rawTag} · Automatic updates via GitHub Releases.`
            : `Imported from ${res.repo}`,
          gradient: liquidShaders[0].gradient,
          textColor: liquidShaders[0].textColor,
          glowColor: liquidShaders[0].glow,
          version: res.remoteVersion || '1.0.0',
          status: 'not-installed',
          size: res.asset?.sizeFormatted || 'GitHub Release',
          downloadUrl: res.asset?.downloadUrl,
          executableName: res.asset?.name || `${repoName}.exe`,
          githubRepo: res.repo,
          latestRelease: res.asset
            ? {
                tag: res.remoteVersion || res.rawTag,
                name: res.releaseName,
                body: res.releaseNotes,
                assetUrl: res.asset.downloadUrl,
                assetName: res.asset.name,
                assetSize: res.asset.sizeFormatted,
                publishedAt: res.publishedAt,
              }
            : undefined,
          iconType: 'emoji',
          iconValue: '⚡',
          addedByCreator: true,
          changelog: [
            `Release ${res.rawTag} from GitHub (${res.repo})`,
            res.publishedAt ? `Published on ${res.publishedAt}` : 'Latest Release',
          ],
        };
        onAddApp(newApp);
        onClose();
      } else {
        setGithubCheckStatus({ checking: false, error: res.error || 'Failed to fetch release' });
      }
    } else {
      setTimeout(() => {
        setGithubCheckStatus({ checking: false });
        alert('GitHub release check is active inside the desktop shell.');
      }, 500);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(existingApps, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', `creative-hub-backup-${Date.now()}.json`);
    dlAnchor.click();
  };

  const handleImportJSON = () => {
    try {
      const parsed = JSON.parse(jsonText);
      if (Array.isArray(parsed)) {
        onImportApps(parsed);
        onClose();
      } else {
        alert('JSON must be an array of application objects.');
      }
    } catch (e: any) {
      alert(`Invalid JSON: ${e.message}`);
    }
  };

  const previewApp: Partial<CreativeApp> = {
    name: name || 'App Preview',
    shortName: shortName || 'Ap',
    gradient: selectedShader.gradient,
    textColor: selectedShader.textColor,
    glowColor: selectedShader.glow,
    iconType,
    iconValue: iconType === 'emoji' ? selectedEmoji : undefined,
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-3xl animate-fadeIn ${
        isLight ? 'bg-slate-900/40' : 'bg-slate-950/80'
      }`}
    >
      <GlassCard
        variant="elevated"
        className={`w-full max-w-2xl shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden ${
          isLight ? 'border-white/80' : 'border-white/20'
        }`}
      >
        {/* Header */}
        <div
          className={`flex items-center justify-between p-6 pb-4 border-b relative z-10 ${
            isLight ? 'border-slate-900/10' : 'border-white/[0.08]'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-cyan-400 via-sky-300 to-indigo-500 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-400/30">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <h3
                className={`text-lg font-bold tracking-tight ${
                  isLight ? 'text-slate-900' : 'text-white'
                }`}
              >
                Application Studio & Onboarder
              </h3>
              <p className={`text-xs ${isLight ? 'text-slate-500' : 'text-white/50'}`}>
                Add, link, design, and manage apps without rebuilding
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
              isLight
                ? 'text-slate-400 hover:text-slate-900 hover:bg-slate-200/60'
                : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Pills */}
        <div
          className={`flex items-center gap-2 px-6 pt-3 border-b overflow-x-auto ${
            isLight ? 'border-slate-900/10 bg-slate-50/50' : 'border-white/[0.06] bg-white/[0.02]'
          }`}
        >
          {[
            { id: 'drop', label: '1. Drop .exe or Shortcut', icon: <Upload className="w-3.5 h-3.5" /> },
            { id: 'github', label: '2. From GitHub Repo', icon: <GitBranch className="w-3.5 h-3.5 text-cyan-400" /> },
            { id: 'presets', label: '3. Popular Presets', icon: <Wand2 className="w-3.5 h-3.5" /> },
            { id: 'custom', label: '4. Custom Designer', icon: <Sliders className="w-3.5 h-3.5" /> },
            { id: 'json', label: '5. JSON Backup', icon: <FileJson className="w-3.5 h-3.5" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-2.5 px-3 text-xs font-medium border-b-2 flex items-center gap-1.5 transition-all ${
                activeTab === tab.id
                  ? isLight
                    ? 'border-sky-500 text-sky-700 font-bold'
                    : 'border-cyan-400 text-white font-semibold'
                  : isLight
                  ? 'border-transparent text-slate-500 hover:text-slate-900'
                  : 'border-transparent text-white/50 hover:text-white'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {/* Tab 1: Drag & Drop */}
          {activeTab === 'drop' && (
            <div className="space-y-4">
              <ExeDropTarget
                onAutoAdd={(app) => {
                  onAddApp(app);
                  onClose();
                }}
              />
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-white/50 leading-relaxed">
                <span className="text-cyan-300 font-semibold block mb-1">PRO TIP:</span>
                Drag any <code className="text-white font-mono">.exe</code>, shortcut <code className="text-white font-mono">.lnk</code> from your Windows desktop, or <code className="text-white font-mono">.bat</code> script. It automatically links the execution target and generates liquid glass artwork!
              </div>
            </div>
          )}

          {/* Tab 2: GitHub Releases Direct Link */}
          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-cyan-500/[0.04] border border-cyan-400/20 space-y-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-cyan-400/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white tracking-tight">
                      Link Any GitHub Release
                    </h4>
                    <p className="text-[11px] text-white/50">
                      Creative Hub tracks and pulls the latest .exe / .msix releases automatically.
                    </p>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <label className="block text-[11px] font-mono text-cyan-300 uppercase">
                    GitHub Repository (owner/repo or URL)
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="e.g. cli/cli, obsidianmd/obsidian-releases, or your repo"
                      value={githubRepoInput}
                      onChange={(e) => setGithubRepoInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCheckAndAddFromGitHub();
                      }}
                      className="flex-1 px-3 py-2 text-xs font-mono bg-black/50 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400"
                    />
                    <GlassButton
                      variant="primary"
                      size="sm"
                      onClick={handleCheckAndAddFromGitHub}
                      disabled={!githubRepoInput.trim() || githubCheckStatus.checking}
                      icon={
                        githubCheckStatus.checking ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )
                      }
                    >
                      {githubCheckStatus.checking ? 'Checking...' : 'Fetch & Add'}
                    </GlassButton>
                  </div>
                </div>

                {githubCheckStatus.error && (
                  <p className="text-xs text-rose-400 font-mono pt-1">
                    Error: {githubCheckStatus.error}
                  </p>
                )}

                <div className="pt-2 text-[11px] text-white/40 space-y-1 font-mono">
                  <p>• Automatically finds Windows .exe, .msix, and .zip release assets</p>
                  <p>• Whenever you or the author publish a new version on GitHub, users get the update button</p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Presets */}
          {activeTab === 'presets' && (
            <PresetOneClickPicker
              existingNames={existingApps.map((a) => a.name)}
              onAddPreset={(preset) => {
                handleAddPreset(preset);
              }}
            />
          )}

          {/* Tab 3: Custom Visual Designer */}
          {activeTab === 'custom' && (
            <form onSubmit={handleCustomSubmit} className="space-y-4">
              {/* Live Preview Card */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center gap-4">
                <AppIconRenderer app={previewApp} size="lg" />
                <div>
                  <h4 className="text-base font-bold text-white">
                    {previewApp.name || 'Untitled Application'}
                  </h4>
                  <span className="text-xs font-mono text-cyan-300 block">
                    {category} · Liquid Glass WWDC26
                  </span>
                  <span className="text-[11px] text-white/40 block mt-0.5">
                    {executablePath ? `Target: ${executablePath}` : 'Web / Native Shell Ready'}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase">
                    App Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Unreal Engine 5"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (!shortName) setShortName(e.target.value.slice(0, 2).toUpperCase());
                    }}
                    className="w-full px-3.5 py-2 text-sm bg-white/[0.05] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-900 border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/60"
                  >
                    <option value="Creative & Design">Creative & Design</option>
                    <option value="Development">Development</option>
                    <option value="Video & 3D">Video & 3D</option>
                    <option value="Productivity">Productivity</option>
                    <option value="Gaming & Media">Gaming & Media</option>
                    <option value="Custom Tools">Custom Tools</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-mono text-white/60 mb-1.5 uppercase">
                  Executable Path, Batch File, or URL
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="C:\Program Files\... or https://..."
                    value={executablePath}
                    onChange={(e) => setExecutablePath(e.target.value)}
                    className="flex-1 px-3.5 py-2 text-xs font-mono bg-white/[0.05] border border-white/10 rounded-xl text-white outline-none focus:border-cyan-400/60"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      const electronAPI = (window as any).electronAPI;
                      if (electronAPI?.selectExecutable) {
                        const path = await electronAPI.selectExecutable();
                        if (path) setExecutablePath(path);
                      }
                    }}
                    className="px-3.5 py-2 rounded-xl bg-white/[0.08] hover:bg-white/[0.15] border border-white/15 text-xs text-white/80 hover:text-white flex items-center gap-1.5 transition-all"
                  >
                    <FolderOpen className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Browse</span>
                  </button>
                </div>
              </div>

              {/* Icon Mode Picker */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-mono text-white/60 uppercase">
                    Icon Emblem Style
                  </label>
                  <div className="inline-flex p-0.5 rounded-lg bg-white/[0.06] border border-white/10 text-xs">
                    <button
                      type="button"
                      onClick={() => setIconType('monogram')}
                      className={`px-2.5 py-0.5 rounded-md transition-all ${
                        iconType === 'monogram' ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-white/60'
                      }`}
                    >
                      Initials
                    </button>
                    <button
                      type="button"
                      onClick={() => setIconType('emoji')}
                      className={`px-2.5 py-0.5 rounded-md transition-all ${
                        iconType === 'emoji' ? 'bg-cyan-400 text-slate-950 font-bold' : 'text-white/60'
                      }`}
                    >
                      Emoji
                    </button>
                  </div>
                </div>

                {iconType === 'emoji' ? (
                  <div className="flex flex-wrap gap-2">
                    {emojiIcons.map((emoji) => (
                      <button
                        key={emoji}
                        type="button"
                        onClick={() => setSelectedEmoji(emoji)}
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center text-lg transition-all ${
                          selectedEmoji === emoji ? 'border-cyan-400 bg-cyan-400/20 scale-110' : 'border-white/10 bg-white/[0.04]'
                        }`}
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                ) : (
                  <input
                    type="text"
                    maxLength={3}
                    placeholder="2-3 letter short code"
                    value={shortName}
                    onChange={(e) => setShortName(e.target.value.toUpperCase())}
                    className="w-32 px-3.5 py-1.5 text-sm font-bold text-center bg-white/[0.05] border border-white/10 rounded-xl text-cyan-300"
                  />
                )}
              </div>

              {/* Shaders */}
              <div>
                <label className="block text-xs font-mono text-white/60 mb-2 uppercase">
                  Liquid Shader Color
                </label>
                <div className="flex flex-wrap gap-2.5">
                  {liquidShaders.map((shader, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedShader(shader)}
                      className={`w-9 h-9 rounded-xl p-[2px] bg-gradient-to-br ${shader.gradient} transition-transform ${
                        selectedShader.label === shader.label ? 'scale-115 ring-2 ring-white shadow-lg' : 'opacity-70 hover:opacity-100'
                      }`}
                      title={shader.label}
                    >
                      <div className="w-full h-full rounded-[9px] bg-slate-950/80" />
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-white/[0.08] flex justify-end gap-2.5">
                <GlassButton type="button" variant="ghost" size="sm" onClick={onClose}>
                  Cancel
                </GlassButton>
                <GlassButton type="submit" variant="primary" size="sm" icon={<Sparkles className="w-3.5 h-3.5" />}>
                  Save & Register App
                </GlassButton>
              </div>
            </form>
          )}

          {/* Tab 4: JSON Export / Import */}
          {activeTab === 'json' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-bold text-white">Hub Registry Backup & Restore</h4>
                  <p className="text-xs text-white/50">Export your list or paste JSON to sync across machines</p>
                </div>
                <GlassButton
                  variant="glass"
                  size="sm"
                  onClick={handleExportJSON}
                >
                  Export JSON File
                </GlassButton>
              </div>

              <textarea
                rows={7}
                placeholder="Paste backup JSON array here to import..."
                value={jsonText}
                onChange={(e) => setJsonText(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-950 border border-white/10 rounded-xl text-cyan-300 outline-none focus:border-cyan-400"
              />

              <div className="flex justify-end">
                <GlassButton
                  variant="primary"
                  size="sm"
                  onClick={handleImportJSON}
                  disabled={!jsonText.trim()}
                >
                  Import & Overwrite Hub
                </GlassButton>
              </div>
            </div>
          )}
        </div>
      </GlassCard>
    </div>
  );
};
