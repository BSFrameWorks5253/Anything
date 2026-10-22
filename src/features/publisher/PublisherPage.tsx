import React, { useState, useEffect } from 'react';
import { Package, Sparkles, FolderOpen, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import type { CatalogApp } from '../../types/app.types';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { InboxStagingDock, type StagedFile } from './components/InboxStagingDock';
import { LiveCardPreview } from './components/LiveCardPreview';
import { PushFormCustomizer } from './components/PushFormCustomizer';
import { useViewMode } from '../../context/ViewModeContext';
import { Eye } from 'lucide-react';

interface PublisherPageProps {
  catalogApps: CatalogApp[];
  onAddCatalogApp: (app: CatalogApp) => void;
  onRemoveCatalogApp: (id: string) => void;
  onNavigateToApps?: () => void;
}

const liquidShaders = [
  { label: 'Cyber Cyan', gradient: 'from-blue-600 via-sky-500 to-cyan-400', textColor: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)' },
  { label: 'Cosmic Violet', gradient: 'from-violet-700 via-purple-600 to-indigo-500', textColor: '#c084fc', glow: 'rgba(192, 132, 252, 0.45)' },
  { label: 'Liquid Amber', gradient: 'from-amber-600 via-orange-500 to-yellow-400', textColor: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)' },
  { label: 'Emerald Aurora', gradient: 'from-emerald-500 via-teal-400 to-cyan-400', textColor: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.45)' },
  { label: 'Apple Rose', gradient: 'from-pink-600 via-rose-500 to-orange-400', textColor: '#fb7185', glow: 'rgba(251, 113, 133, 0.45)' },
];

export const PublisherPage: React.FC<PublisherPageProps> = ({
  catalogApps,
  onAddCatalogApp,
  onRemoveCatalogApp,
  onNavigateToApps,
}) => {
  const [inboxFiles, setInboxFiles] = useState<StagedFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<StagedFile | null>(null);
  const { setViewMode } = useViewMode();

  // Form customizer state
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Creative & Design');
  const [version, setVersion] = useState('1.0.0');
  const [description, setDescription] = useState('');
  const [executableName, setExecutableName] = useState('');
  const [iconType, setIconType] = useState<'monogram' | 'emoji' | 'image'>('emoji');
  const [selectedEmoji, setSelectedEmoji] = useState('🚀');
  const [selectedShader, setSelectedShader] = useState(liquidShaders[0]);
  const [githubRepo, setGithubRepo] = useState('');
  const [githubStatus, setGithubStatus] = useState<{
    checking: boolean;
    info?: any;
    error?: string;
  }>({ checking: false });

  const [isPushing, setIsPushing] = useState(false);
  const [pushedSuccessApp, setPushedSuccessApp] = useState<CatalogApp | null>(null);

  // Scan inbox folder on mount and refresh
  const scanInbox = async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.scanInboxFolder) {
      const res = await electronAPI.scanInboxFolder();
      if (res.success) {
        setInboxFiles(res.files);
        if (res.files.length > 0 && !selectedFile) {
          handleSelectFile(res.files[0]);
        }
      }
    } else {
      // Mock staged file for browser preview
      const mock: StagedFile[] = [
        {
          fileName: 'MySpecialApp-v1.0.exe',
          fullPath: 'C:\\creative-hub\\packages-inbox\\MySpecialApp-v1.0.exe',
          extension: '.exe',
          sizeBytes: 45000000,
          sizeFormatted: '45.0 MB',
          modifiedTime: 'Today',
        },
      ];
      setInboxFiles(mock);
      handleSelectFile(mock[0]);
    }
  };

  useEffect(() => {
    scanInbox();
  }, []);

  const handleSelectFile = (file: StagedFile) => {
    setSelectedFile(file);
    const baseName = file.fileName.replace(/\.[^/.]+$/, '').replace(/[-_v0-9.]+$/g, '').trim();
    const cleanName = (baseName || 'Application').replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());

    setName(cleanName);
    setVersion('1.0.0');
    setExecutableName(file.extension === '.exe' ? file.fileName : `${cleanName.toLowerCase().replace(/\s+/g, '')}.exe`);
    setDescription(`Software application distributed via Creative Hub from ${file.fileName}.`);
  };

  const handleOpenFolder = async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.openInboxFolder) {
      await electronAPI.openInboxFolder();
    } else {
      alert('Open folder is active in the Electron desktop app.');
    }
  };

  const handleCheckGitHub = async () => {
    if (!githubRepo.trim()) return;
    setGithubStatus({ checking: true });
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.checkGitHubRelease) {
      const res = await electronAPI.checkGitHubRelease(githubRepo.trim(), version);
      if (res.success) {
        setGithubStatus({ checking: false, info: res });
        if (res.remoteVersion) {
          setVersion(res.remoteVersion);
        }
        if (res.releaseNotes && !description) {
          setDescription(res.releaseName || `Latest release from ${githubRepo}`);
        }
        if (res.asset?.name && !executableName) {
          setExecutableName(res.asset.name);
        }
      } else {
        setGithubStatus({ checking: false, error: res.error || 'Failed to fetch release' });
      }
    } else {
      setTimeout(() => {
        setGithubStatus({
          checking: false,
          info: {
            remoteVersion: '2.4.0',
            rawTag: 'v2.4.0',
            releaseName: 'v2.4.0 High-Performance Release',
            releaseNotes: 'Features and auto updates',
            publishedAt: 'Today',
            asset: { name: 'App-Win-x64.exe', sizeFormatted: '38.4 MB', downloadUrl: '#' },
          },
        });
        setVersion('2.4.0');
      }, 700);
    }
  };

  const handleDownloadGitHubAsset = async () => {
    if (!githubStatus.info?.asset?.downloadUrl) return;
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.downloadReleaseToInbox) {
      setGithubStatus((prev) => ({ ...prev, checking: true }));
      const res = await electronAPI.downloadReleaseToInbox({
        assetUrl: githubStatus.info.asset.downloadUrl,
        assetName: githubStatus.info.asset.name,
      });
      setGithubStatus((prev) => ({ ...prev, checking: false }));
      if (res.success) {
        await scanInbox();
      } else {
        alert(`Download failed: ${res.error}`);
      }
    }
  };

  // THE MAGIC PUSH TO USERS
  const handlePushToUsers = async () => {
    if (!selectedFile || !name.trim()) return;
    setIsPushing(true);

    const appId = `app-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

    const appConfig: CatalogApp = {
      id: appId,
      name: name.trim(),
      shortName: name.slice(0, 2).toUpperCase(),
      category,
      version: version.trim() || '1.0.0',
      description: description.trim() || 'Software package pushed via Creative Hub Staging Studio.',
      executableName: executableName.trim() || selectedFile.fileName,
      size: selectedFile.sizeFormatted,
      gradient: selectedShader.gradient,
      textColor: selectedShader.textColor,
      glowColor: selectedShader.glow,
      iconType,
      iconValue: iconType === 'emoji' ? selectedEmoji : undefined,
      status: 'not-installed',
      githubRepo: githubRepo.trim() || undefined,
      latestRelease: githubStatus.info?.asset
        ? {
            tag: githubStatus.info.remoteVersion || githubStatus.info.rawTag,
            name: githubStatus.info.releaseName,
            body: githubStatus.info.releaseNotes,
            assetUrl: githubStatus.info.asset.downloadUrl,
            assetName: githubStatus.info.asset.name,
            assetSize: githubStatus.info.asset.sizeFormatted,
            publishedAt: githubStatus.info.publishedAt,
          }
        : undefined,
      changelog: [
        `Version ${version} published to Creative Hub users`,
        githubRepo.trim() ? `Auto-Updates linked to GitHub: ${githubRepo.trim()}` : `Local Staged Package`,
        `Package format: ${selectedFile.extension.toUpperCase()}`,
      ],
      addedByCreator: true,
    };

    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.pushPackage) {
      const res = await electronAPI.pushPackage({
        stagedFile: selectedFile,
        appConfig,
      });

      setIsPushing(false);
      if (res.success) {
        onAddCatalogApp(res.app);
        setPushedSuccessApp(res.app);
      } else {
        alert(`Push failed: ${res.error}`);
      }
    } else {
      // Browser simulation
      setTimeout(() => {
        setIsPushing(false);
        onAddCatalogApp(appConfig);
        setPushedSuccessApp(appConfig);
      }, 900);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-16">
      {/* Top Banner */}
      <GlassCard
        variant="elevated"
        className="p-6 relative overflow-hidden border-white/20 shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-5"
      >
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-mono mb-2.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
            <span>Drop & Push Architecture</span>
          </div>

          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
            Drop your .exe or .msix here, setup the card, and hit <span className="shimmer-text">Push to Users.</span>
          </h2>

          <p className="text-xs sm:text-sm text-white/60 mt-1.5 leading-relaxed">
            No manual download links or complex configurations. Just put your executable in the folder, choose how it looks, and click Push. It appears on the user side instantly.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <GlassButton
            variant="glass"
            size="sm"
            onClick={() => {
              setViewMode('user');
              if (onNavigateToApps) onNavigateToApps();
            }}
            icon={<Eye className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Switch to User View
          </GlassButton>

          <GlassButton
            variant="glass"
            size="sm"
            onClick={handleOpenFolder}
            icon={<FolderOpen className="w-3.5 h-3.5 text-cyan-400" />}
          >
            Open Inbox Folder
          </GlassButton>
        </div>
      </GlassCard>

      {/* Success Notification Banner */}
      {pushedSuccessApp && (
        <GlassCard variant="interactive" className="p-4 border-emerald-500/40 bg-emerald-950/20 shadow-[0_0_25px_rgba(52,211,153,0.2)] flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <div>
              <h4 className="text-sm font-bold text-white">
                "{pushedSuccessApp.name}" has been successfully pushed!
              </h4>
              <p className="text-xs text-white/50">
                It is now live in the user catalog ready for download and 1-click installation.
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
              Experience on User Side
            </GlassButton>
          </div>
        </GlassCard>
      )}

      {/* 2-Column Split: Inbox Dock vs Push Customizer & Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Inbox Staging (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <InboxStagingDock
            files={inboxFiles}
            selectedFile={selectedFile}
            onSelectFile={handleSelectFile}
            onRefresh={scanInbox}
            onOpenFolder={handleOpenFolder}
          />
        </div>

        {/* Right Column: Customizer & Real-time Live Preview (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          <LiveCardPreview
            name={name}
            category={category}
            version={version}
            description={description}
            size={selectedFile?.sizeFormatted || '45 MB'}
            iconType={iconType}
            iconValue={selectedEmoji}
            gradient={selectedShader.gradient}
            textColor={selectedShader.textColor}
            glowColor={selectedShader.glow}
          />

          <PushFormCustomizer
            selectedFile={selectedFile}
            name={name}
            setName={setName}
            category={category}
            setCategory={setCategory}
            version={version}
            setVersion={setVersion}
            description={description}
            setDescription={setDescription}
            executableName={executableName}
            setExecutableName={setExecutableName}
            iconType={iconType}
            setIconType={setIconType}
            selectedEmoji={selectedEmoji}
            setSelectedEmoji={setSelectedEmoji}
            selectedShader={selectedShader}
            setSelectedShader={setSelectedShader}
            shaders={liquidShaders}
            isPushing={isPushing}
            onPush={handlePushToUsers}
            githubRepo={githubRepo}
            setGithubRepo={setGithubRepo}
            githubStatus={githubStatus}
            onCheckGitHub={handleCheckGitHub}
            onDownloadGitHubAsset={handleDownloadGitHubAsset}
          />
        </div>
      </div>
    </div>
  );
};
