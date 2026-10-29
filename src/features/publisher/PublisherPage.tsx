import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  ArrowRight,
  Eye,
  GitBranch,
  ExternalLink,
  Plus,
  Trash2,
  Check,
  AlertCircle,
  Cloud,
  Layers,
  Globe
} from 'lucide-react';
import type { CatalogApp } from '../../types/app.types';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { LiveCardPreview } from './components/LiveCardPreview';
import { useViewMode } from '../../context/ViewModeContext';

interface PublisherPageProps {
  catalogApps: CatalogApp[];
  onAddCatalogApp: (app: CatalogApp) => void;
  onRemoveCatalogApp: (id: string) => void;
  onNavigateToApps?: () => void;
}

interface AppSourceItem {
  id?: string;
  name?: string;
  url: string;
  category?: string;
  autoSync?: boolean;
}

const liquidShaders = [
  { label: 'Cyber Cyan', gradient: 'from-blue-600 via-sky-500 to-cyan-400', textColor: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)' },
  { label: 'Cosmic Violet', gradient: 'from-violet-700 via-purple-600 to-indigo-500', textColor: '#c084fc', glow: 'rgba(192, 132, 252, 0.45)' },
  { label: 'Liquid Amber', gradient: 'from-amber-600 via-orange-500 to-yellow-400', textColor: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)' },
  { label: 'Emerald Aurora', gradient: 'from-emerald-500 via-teal-400 to-cyan-400', textColor: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.45)' },
  { label: 'Apple Rose', gradient: 'from-pink-600 via-rose-500 to-orange-400', textColor: '#fb7185', glow: 'rgba(251, 113, 133, 0.45)' },
];

const emojiIcons = ['⚡', '🎨', '🚀', '💻', '🎬', '🎮', '🔮', '🎧', '📦', '📸', '✨', '🛠️'];

export const PublisherPage: React.FC<PublisherPageProps> = ({
  catalogApps,
  onAddCatalogApp,
  onRemoveCatalogApp,
  onNavigateToApps,
}) => {
  const { setViewMode } = useViewMode();

  // App sources state (from app-sources.json)
  const [sources, setSources] = useState<AppSourceItem[]>([]);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // New GitHub repository form state
  const [repoInput, setRepoInput] = useState('');
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Media & Video');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('');
  const [iconType, setIconType] = useState<'monogram' | 'emoji' | 'image'>('emoji');
  const [selectedEmoji, setSelectedEmoji] = useState('🚀');
  const [selectedShader, setSelectedShader] = useState(liquidShaders[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [pushedSuccessApp, setPushedSuccessApp] = useState<CatalogApp | null>(null);

  // GitHub inspection status
  const [githubStatus, setGithubStatus] = useState<{
    checking: boolean;
    info?: any;
    error?: string;
  }>({ checking: false });

  // Load app sources on mount
  const loadSources = async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.getAppSources) {
      try {
        const res = await electronAPI.getAppSources();
        if (res.success && Array.isArray(res.sources)) {
          setSources(res.sources);
        }
      } catch (e) {
        console.error('Failed to load app sources:', e);
      }
    } else {
      // Browser fallback simulation
      setSources([
        {
          url: 'https://github.com/BSFrameWorks5253/MediaFlow-Studio',
          name: 'MediaFlow Studio',
          category: 'Media & Video',
          autoSync: true,
        },
        {
          url: 'https://github.com/BSFrameWorks5253/onetap-workstation',
          id: 'one-tap',
          name: 'One Tap',
          category: 'Media & Production',
          autoSync: true,
        },
        {
          id: 'pdf-master',
          name: 'AcroFlow Studio Pro',
          url: 'https://github.com/BSFrameWorks5253/PDF-Master-Pro',
          category: 'Productivity & Creative',
          autoSync: true,
        },
        {
          id: 'docuflow-studio',
          name: 'DocuFlow Studio Pro',
          url: 'https://github.com/BSFrameWorks5253/DocuFlow-Studio',
          category: 'Productivity & Documents',
          autoSync: true,
        },
      ]);
    }
  };

  useEffect(() => {
    loadSources();

    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.onCatalogUpdated) {
      const unsub = electronAPI.onCatalogUpdated((newCatalog: CatalogApp[]) => {
        if (Array.isArray(newCatalog)) {
          newCatalog.forEach((app) => onAddCatalogApp(app));
        }
      });
      return () => unsub();
    }
  }, []);

  // Sync all GitHub sources
  const handleSyncAllSources = async () => {
    setIsSyncing(true);
    setSyncFeedback(null);
    const electronAPI = (window as any).electronAPI;

    if (electronAPI?.syncAppSources) {
      try {
        const res = await electronAPI.syncAppSources();
        setIsSyncing(false);
        if (res.success) {
          setSyncFeedback(`Successfully synced ${res.synced} application(s) from GitHub Releases!`);
          await loadSources();
        } else {
          setSyncFeedback(`Sync completed with notice: ${res.errors?.join(', ') || 'OK'}`);
        }
      } catch (err: any) {
        setIsSyncing(false);
        setSyncFeedback(`Sync error: ${err.message}`);
      }
    } else {
      setTimeout(() => {
        setIsSyncing(false);
        setSyncFeedback('Simulated GitHub sync: 4 cloud apps up to date.');
      }, 900);
    }
  };

  // Inspect GitHub repository releases
  const handleCheckGitHub = async (overrideUrl?: string) => {
    const rawRepo = (overrideUrl || repoInput).trim();
    if (!rawRepo) return;

    setGithubStatus({ checking: true });
    const electronAPI = (window as any).electronAPI;

    if (electronAPI?.checkGitHubRelease) {
      try {
        const res = await electronAPI.checkGitHubRelease(rawRepo);
        if (res.success) {
          setGithubStatus({ checking: false, info: res });
          if (res.remoteVersion) {
            setVersion(res.remoteVersion);
          }
          if (res.releaseName && !name) {
            setName(res.releaseName.replace(/^v\d+\.\d+\.\d+\s*[-_:]*\s*/i, '').trim());
          }
          if (res.releaseNotes && !description) {
            setDescription(res.releaseNotes.slice(0, 200).replace(/\r?\n/g, ' '));
          }
        } else {
          setGithubStatus({ checking: false, error: res.error || 'Failed to query GitHub repository releases' });
        }
      } catch (err: any) {
        setGithubStatus({ checking: false, error: err.message });
      }
    } else {
      // Browser preview simulation
      setTimeout(() => {
        setGithubStatus({
          checking: false,
          info: {
            remoteVersion: '1.2.0',
            rawTag: 'v1.2.0',
            releaseName: 'MediaFlow Studio v1.2.0',
            releaseNotes: 'Direct cloud distribution via GitHub Releases.',
            publishedAt: 'Today',
            asset: {
              name: 'MediaFlow_1.2.0_Setup.exe',
              sizeFormatted: '48.5 MB',
              downloadUrl: 'https://github.com/BSFrameWorks5253/MediaFlow-Studio/releases',
            },
          },
        });
        setVersion('1.2.0');
      }, 700);
    }
  };

  const handleRepoInputChange = (val: string) => {
    setRepoInput(val);
    setGithubStatus({ checking: false });
    // Extract clean app name from repo path
    const parts = val.replace(/\.git$/i, '').split('/');
    const lastPart = parts[parts.length - 1] || '';
    if (lastPart) {
      const formatted = lastPart.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      setName(formatted);
    }
  };

  // Add new repository to app-sources.json and sync
  const handleAddAndSyncSource = async () => {
    const cleanRepo = repoInput.trim();
    if (!cleanRepo || !name.trim()) return;

    setIsAdding(true);
    const appId = name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    const fullUrl = cleanRepo.startsWith('http') ? cleanRepo : `https://github.com/${cleanRepo}`;

    const newSourceItem: AppSourceItem = {
      id: appId,
      name: name.trim(),
      url: fullUrl,
      category,
      autoSync: true,
    };

    const updatedSources = [
      ...sources.filter((s) => s.url.toLowerCase() !== fullUrl.toLowerCase()),
      newSourceItem,
    ];

    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.saveAppSources) {
      try {
        await electronAPI.saveAppSources(updatedSources);
        await electronAPI.syncAppSources?.();
        setSources(updatedSources);
        setIsAdding(false);

        const syntheticApp: CatalogApp = {
          id: appId,
          name: name.trim(),
          shortName: name.slice(0, 2).toUpperCase(),
          category,
          version,
          description: description || `${name} synchronized directly from GitHub Releases.`,
          executableName: `${appId}.exe`,
          size: githubStatus.info?.asset?.sizeFormatted || 'Online Installer',
          gradient: selectedShader.gradient,
          textColor: selectedShader.textColor,
          glowColor: selectedShader.glow,
          iconType,
          iconValue: iconType === 'emoji' ? selectedEmoji : undefined,
          status: 'not-installed',
          githubRepo: fullUrl.replace('https://github.com/', ''),
          downloadUrl: githubStatus.info?.asset?.downloadUrl,
          addedByCreator: true,
        };

        setPushedSuccessApp(syntheticApp);
        onAddCatalogApp(syntheticApp);
        setRepoInput('');
        setName('');
        setDescription('');
        setGithubStatus({ checking: false });
      } catch (err: any) {
        setIsAdding(false);
        alert(`Failed to save app source: ${err.message}`);
      }
    } else {
      // Browser preview simulation
      setTimeout(() => {
        setSources(updatedSources);
        setIsAdding(false);
        const syntheticApp: CatalogApp = {
          id: appId,
          name: name.trim(),
          shortName: name.slice(0, 2).toUpperCase(),
          category,
          version,
          description: description || `${name} synchronized directly from GitHub Releases.`,
          executableName: `${appId}.exe`,
          size: '48.5 MB',
          gradient: selectedShader.gradient,
          textColor: selectedShader.textColor,
          glowColor: selectedShader.glow,
          iconType,
          iconValue: iconType === 'emoji' ? selectedEmoji : undefined,
          status: 'not-installed',
          addedByCreator: true,
        };
        setPushedSuccessApp(syntheticApp);
        onAddCatalogApp(syntheticApp);
      }, 700);
    }
  };

  // Remove source
  const handleRemoveSource = async (url: string) => {
    const updated = sources.filter((s) => s.url !== url);
    setSources(updated);

    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.saveAppSources) {
      await electronAPI.saveAppSources(updated);
      await electronAPI.syncAppSources?.();
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-20 animate-fadeIn">
      {/* Top Banner: GitHub-Only Cloud Architecture */}
      <GlassCard
        variant="elevated"
        className="p-6 relative overflow-hidden border-zinc-200 dark:border-white/20 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
      >
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 dark:bg-cyan-400/15 border border-cyan-500/25 text-cyan-600 dark:text-cyan-300 text-xs font-mono mb-2.5">
            <Globe className="w-3.5 h-3.5 text-cyan-500 dark:text-cyan-400" />
            <span>GitHub Releases Cloud Distribution</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Connect your GitHub repositories. <span className="shimmer-text">No local installer drops needed.</span>
          </h2>

          <p className="text-xs sm:text-sm text-zinc-600 dark:text-white/60 mt-1.5 leading-relaxed">
            All child applications, version updates, release notes, and setup executables (.exe) are cataloged and installed straight from GitHub Releases in the cloud.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <GlassButton
            variant="glass"
            size="sm"
            onClick={handleSyncAllSources}
            icon={<RefreshCw className={`w-3.5 h-3.5 text-cyan-500 ${isSyncing ? 'animate-spin' : ''}`} />}
            disabled={isSyncing}
          >
            {isSyncing ? 'Syncing GitHub...' : 'Sync All Sources'}
          </GlassButton>

          <GlassButton
            variant="primary"
            size="sm"
            onClick={() => {
              setViewMode('user');
              if (onNavigateToApps) onNavigateToApps();
            }}
            icon={<Eye className="w-3.5 h-3.5" />}
          >
            View in Catalog
          </GlassButton>
        </div>
      </GlassCard>

      {/* Sync Status Feedback Toast */}
      {syncFeedback && (
        <div className="p-3.5 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-cyan-200 text-xs font-mono flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>{syncFeedback}</span>
          </div>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-white/40 hover:text-white text-xs px-2 py-0.5"
          >
            ✕
          </button>
        </div>
      )}

      {/* Success Notification Banner */}
      {pushedSuccessApp && (
        <GlassCard
          variant="interactive"
          className="p-4 border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_25px_rgba(52,211,153,0.2)] flex items-center justify-between animate-fadeIn"
        >
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">
                "{pushedSuccessApp.name}" connected from GitHub!
              </h4>
              <p className="text-xs text-white/50">
                Live in the user catalog. Users can click Install to download the setup directly from GitHub Releases.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <GlassButton
              variant="primary"
              size="sm"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={() => {
                setViewMode('user');
                if (onNavigateToApps) onNavigateToApps();
              }}
            >
              See in User Catalog
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* 2-Column Split: Connected GitHub Sources vs Add New GitHub App & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Connected Cloud Sources (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <GlassCard variant="interactive" className="p-5 border-zinc-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
              <div>
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-cyan-500" />
                  <span>Connected GitHub Repositories</span>
                </h3>
                <p className="text-[11px] text-zinc-500 dark:text-white/40 mt-0.5">
                  Tracked in <code className="text-cyan-500 font-mono">app-sources.json</code> ({sources.length})
                </p>
              </div>

              <GlassBadge variant="cyan" dot className="text-[10px]">
                Live Cloud Sync
              </GlassBadge>
            </div>

            {sources.length === 0 ? (
              <div className="py-8 text-center text-zinc-500 dark:text-white/40 text-xs">
                No GitHub sources connected yet. Add one on the right!
              </div>
            ) : (
              <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1">
                {sources.map((src, idx) => {
                  const repoSlug = src.url.replace(/^https?:\/\/github\.com\//i, '').replace(/\.git$/i, '');
                  const catalogMatch = catalogApps.find(
                    (a) => a.id === src.id || (a?.name && (src.name || '') && a.name.toLowerCase() === src.name.toLowerCase())
                  );

                  return (
                    <div
                      key={src.url || idx}
                      className="p-3.5 rounded-xl bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200 dark:border-white/10 hover:border-cyan-500/40 transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                            {src.name || repoSlug.split('/')[1] || 'App'}
                          </h4>
                          {catalogMatch?.version && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                              v{catalogMatch.version}
                            </span>
                          )}
                        </div>

                        <a
                          href={src.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 mt-1 truncate"
                        >
                          <span>{repoSlug}</span>
                          <ExternalLink className="w-3 h-3 shrink-0 opacity-70" />
                        </a>

                        <div className="flex items-center gap-2 mt-2">
                          <span className="text-[10px] text-zinc-500 dark:text-white/40">
                            {src.category || 'Utility'}
                          </span>
                          <span className="text-[10px] text-zinc-400 dark:text-white/20">•</span>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                            Auto-Sync Active
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                        <button
                          onClick={() => handleRemoveSource(src.url)}
                          title="Remove Source"
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </GlassCard>
        </div>

        {/* Right Column: Add New GitHub Repo & Real-time Live Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {/* Real-time User-Side Preview */}
          <LiveCardPreview
            name={name || 'New Application'}
            category={category}
            version={version}
            description={description || 'App synchronized from GitHub Releases.'}
            size={githubStatus.info?.asset?.sizeFormatted || 'GitHub Release'}
            iconType={iconType}
            iconValue={selectedEmoji}
            gradient={selectedShader.gradient}
            textColor={selectedShader.textColor}
            glowColor={selectedShader.glow}
          />

          {/* Add & Configure GitHub Source Card */}
          <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-white/[0.08]">
              <div>
                <h4 className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Plus className="w-4 h-4 text-cyan-500" />
                  <span>Connect New GitHub Repository</span>
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-white/50 mt-0.5">
                  Enter repository URL to track releases and package installers directly.
                </p>
              </div>

              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-600 dark:text-cyan-300 border border-cyan-500/30">
                Cloud Sync
              </span>
            </div>

            {/* Step 1: Repository Input & Verification */}
            <div className="space-y-2">
              <label className="block text-[11px] font-mono uppercase text-zinc-600 dark:text-white/50">
                GitHub Repository URL or owner/repo *
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://github.com/BSFrameWorks5253/MediaFlow-Studio"
                  value={repoInput}
                  onChange={(e) => handleRepoInputChange(e.target.value)}
                  className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-300 dark:border-white/10 text-xs font-mono text-zinc-900 dark:text-white placeholder:text-zinc-400 dark:placeholder:text-white/30 focus:outline-none focus:border-cyan-500 transition-colors"
                />
                <GlassButton
                  variant="glass"
                  size="sm"
                  onClick={() => handleCheckGitHub()}
                  disabled={githubStatus.checking || !repoInput.trim()}
                  icon={
                    githubStatus.checking ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    ) : (
                      <Cloud className="w-3.5 h-3.5 text-cyan-400" />
                    )
                  }
                >
                  {githubStatus.checking ? 'Checking...' : 'Check Release'}
                </GlassButton>
              </div>

              {/* GitHub Status Banner */}
              {githubStatus.info && (
                <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-xs text-emerald-200 flex items-start gap-2.5 animate-fadeIn">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <div className="font-semibold text-white">
                      Release Tag Detected: <span className="text-emerald-400 font-mono">{githubStatus.info.remoteVersion || githubStatus.info.rawTag}</span>
                    </div>
                    {githubStatus.info.asset ? (
                      <div className="text-[11px] text-emerald-300/80">
                        Windows Installer: <code className="text-white font-mono">{githubStatus.info.asset.name}</code> ({githubStatus.info.asset.sizeFormatted})
                      </div>
                    ) : (
                      <div className="text-[11px] text-amber-300">
                        Release found without setup executable. Standard package will be downloaded.
                      </div>
                    )}
                  </div>
                </div>
              )}

              {githubStatus.error && (
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-xs text-red-300 flex items-center gap-2 animate-fadeIn">
                  <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{githubStatus.error}</span>
                </div>
              )}
            </div>

            {/* Step 2: Presentation & Metadata */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-mono text-zinc-600 dark:text-white/50 mb-1 uppercase">
                  Application Title *
                </label>
                <input
                  type="text"
                  placeholder="e.g. MediaFlow Studio"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-300 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-600 dark:text-white/50 mb-1 uppercase">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500"
                >
                  <option value="Media & Video">Media & Video</option>
                  <option value="Media & Production">Media & Production</option>
                  <option value="Productivity & Documents">Productivity & Documents</option>
                  <option value="Creative & Design">Creative & Design</option>
                  <option value="Development">Development</option>
                  <option value="Mobile">Mobile Companion</option>
                  <option value="Custom Tools">Custom Tools</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono text-zinc-600 dark:text-white/50 mb-1 uppercase">
                Tagline / Description
              </label>
              <textarea
                rows={2}
                placeholder="High-performance child application synced from GitHub Releases."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-300 dark:border-white/10 text-xs text-zinc-900 dark:text-white focus:outline-none focus:border-cyan-500 resize-none"
              />
            </div>

            {/* Liquid Shader & Icon Palette */}
            <div className="space-y-2 pt-2 border-t border-zinc-200 dark:border-white/[0.06]">
              <label className="block text-[11px] font-mono text-zinc-600 dark:text-white/50 uppercase">
                Liquid Shader Accent
              </label>
              <div className="flex flex-wrap gap-2">
                {liquidShaders.map((shader) => (
                  <button
                    key={shader.label}
                    type="button"
                    onClick={() => setSelectedShader(shader)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 border transition-all ${
                      selectedShader.label === shader.label
                        ? 'border-white bg-white/15 text-white shadow-lg'
                        : 'border-zinc-300 dark:border-white/10 text-zinc-600 dark:text-white/60 hover:text-white'
                    }`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${shader.gradient}`} />
                    <span>{shader.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Icon Selection */}
            <div className="space-y-2 pt-2">
              <label className="block text-[11px] font-mono text-zinc-600 dark:text-white/50 uppercase">
                App Icon Style
              </label>
              <div className="flex items-center gap-2 mb-2">
                <button
                  type="button"
                  onClick={() => setIconType('emoji')}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                    iconType === 'emoji' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-white/40'
                  }`}
                >
                  Emoji
                </button>
                <button
                  type="button"
                  onClick={() => setIconType('monogram')}
                  className={`px-3 py-1 rounded-md text-xs font-mono transition-all ${
                    iconType === 'monogram' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-white/40'
                  }`}
                >
                  Monogram ({name ? name.slice(0, 2).toUpperCase() : 'AP'})
                </button>
              </div>

              {iconType === 'emoji' && (
                <div className="flex flex-wrap gap-2">
                  {emojiIcons.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setSelectedEmoji(emoji)}
                      className={`w-9 h-9 rounded-xl text-base flex items-center justify-center border transition-all ${
                        selectedEmoji === emoji
                          ? 'border-cyan-400 bg-cyan-400/20 scale-105'
                          : 'border-zinc-300 dark:border-white/10 hover:border-white/30'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-3">
              <GlassButton
                variant="primary"
                size="md"
                className="w-full justify-center"
                onClick={handleAddAndSyncSource}
                disabled={isAdding || !repoInput.trim() || !name.trim()}
                icon={<Sparkles className="w-4 h-4" />}
              >
                {isAdding ? 'Connecting to GitHub...' : 'Publish & Sync from GitHub'}
              </GlassButton>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
};
