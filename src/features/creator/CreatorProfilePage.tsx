import React, { useState } from 'react';
import {
  ShieldCheck,
  Phone,
  Mail,
  Sparkles,
  ExternalLink,
  FolderOpen,
  Copy,
  Check,
  Code2,
  Cpu,
  Layers,
  Wrench,
  Eye,
  Play,
  ArrowRight,
  MessageSquare,
  Package,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { AppIconRenderer } from '../apps/components/CrazyAppStudio/AppIconRenderer';
import { useViewMode } from '../../context/ViewModeContext';
import { useTheme } from '../../context/ThemeContext';
import type { CatalogApp } from '../../types/app.types';

interface CreatorProfilePageProps {
  catalog: CatalogApp[];
  onLaunchApp: (app: CatalogApp) => void;
  onOpenAppDetail: (app: CatalogApp) => void;
}

export const CreatorProfilePage: React.FC<CreatorProfilePageProps> = ({
  catalog,
  onLaunchApp,
  onOpenAppDetail,
}) => {
  const { viewMode, setViewMode } = useViewMode();
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const creatorApps = catalog.filter(
    (app) =>
      app.addedByCreator ||
      app.id === 'tap-studio' ||
      app.id === 'photo-studio' ||
      app.author?.includes('Burhanuddin')
  );

  const promptPreview = `You are building a dedicated professional child desktop application for the "Anything" app ecosystem (created by Burhanuddin Sounasath · Phone: 8369811201).
Output structure:
release/<AppName>/
  ├── app-logo.png (512x512 PNG, square 1:1, transparent)
  ├── app.json
  └── V-<version>/
      ├── <AppName>-V-<version>.exe
      └── release.json`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(promptPreview);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2200);
  };

  const handleOpenReleasesFolder = async () => {
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.openReleasesFolder) {
        await electronAPI.openReleasesFolder();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-24 animate-fadeIn">
      {/* Top Header Card */}
      <GlassCard
        variant="interactive"
        className="p-6 sm:p-8 border-zinc-200 dark:border-white/10 relative overflow-hidden shadow-2xl"
      >
        {/* Glow Spheres */}
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full bg-cyan-600/20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full bg-indigo-600/20 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start sm:items-center gap-5">
            {/* Creator Avatar Emblem */}
            <div className="relative group shrink-0">
              <div className="w-20 h-20 rounded-2xl p-[2px] bg-gradient-to-tr from-cyan-400 via-sky-500 to-indigo-600 shadow-xl shadow-cyan-500/25">
                <div className="w-full h-full rounded-2xl bg-zinc-950 flex items-center justify-center font-black text-2xl text-white tracking-tight">
                  BS
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-950 flex items-center justify-center shadow-sm">
                <Check className="w-3 h-3 text-slate-950 stroke-[3]" />
              </span>
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  Burhanuddin Sounasath
                </h1>
                <GlassBadge variant="cyan" dot>
                  Lead Architect & Creator
                </GlassBadge>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xl leading-relaxed">
                Founder & Lead Architect of the <strong>Anything</strong> application ecosystem and <strong>BSFrameWorks</strong>. Designing next-generation hardware companions, low-latency stream macro controllers, and modular desktop software.
              </p>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3 text-xs font-mono text-zinc-500 dark:text-zinc-400">
                <span className="flex items-center gap-1 text-cyan-600 dark:text-cyan-400 font-bold">
                  <Phone className="w-3.5 h-3.5" />
                  +91 8369811201
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  burhanuddin@anything.io
                </span>
                <span>•</span>
                <span>Mumbai, India</span>
              </div>
            </div>
          </div>

          {/* Quick Contact & Developer Controls */}
          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            <a
              href="tel:8369811201"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-600 hover:bg-cyan-500 text-slate-950 flex items-center gap-1.5 shadow-lg shadow-cyan-600/30 transition-all active:scale-95"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Creator</span>
            </a>

            <a
              href="https://wa.me/918369811201"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-lg shadow-emerald-600/30 transition-all active:scale-95"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>

            <button
              onClick={() => setViewMode(viewMode === 'creator' ? 'user' : 'creator')}
              className="px-3 py-2 rounded-xl text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-white/10 dark:hover:bg-white/15 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-white/10 transition-colors flex items-center gap-1.5"
            >
              {viewMode === 'creator' ? <Eye className="w-3.5 h-3.5 text-cyan-500" /> : <Wrench className="w-3.5 h-3.5 text-amber-500" />}
              <span>{viewMode === 'creator' ? 'Exit Creator Mode' : 'Enter Creator Mode'}</span>
            </button>
          </div>
        </div>
      </GlassCard>

      {/* Ecosystem Architecture & Pillars */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <GlassCard className="p-5 border-zinc-200 dark:border-white/10 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-500 flex items-center justify-center font-bold">
            <Cpu className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Hardware Companion Engine</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Direct USB HID and Stream Deck integration powering low-latency macros through <strong>Tap Studio</strong>.
          </p>
        </GlassCard>

        <GlassCard className="p-5 border-zinc-200 dark:border-white/10 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-500 flex items-center justify-center font-bold">
            <Layers className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Modular Child Releases</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Zero-config auto-discovery for versioned child applications dropped into the <code>release/</code> root folder.
          </p>
        </GlassCard>

        <GlassCard className="p-5 border-zinc-200 dark:border-white/10 space-y-2">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-500 flex items-center justify-center font-bold">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Animated Release Emails</h3>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Every release automatically compiles a responsive liquid-glass HTML email to push features and fixes to subscribers.
          </p>
        </GlassCard>
      </div>

      {/* Creator Official Child Apps Portfolio */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold">
              Official Ecosystem Applications ({creatorApps.length})
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-white/40">
              Applications developed, packaged, and verified by Burhanuddin Sounasath.
            </p>
          </div>

          <GlassButton
            variant="glass"
            size="sm"
            icon={<FolderOpen className="w-3.5 h-3.5 text-cyan-500" />}
            onClick={handleOpenReleasesFolder}
          >
            Open Release Folder
          </GlassButton>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {creatorApps.map((app) => (
            <GlassCard
              key={app.id}
              variant="interactive"
              className="p-5 border-zinc-200 dark:border-white/10 space-y-3 relative group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <AppIconRenderer app={app} size="sm" />
                  <div>
                    <h4 className="text-sm font-bold text-zinc-900 dark:text-white group-hover:text-cyan-500 transition-colors">
                      {app.name}
                    </h4>
                    <span className="text-[11px] font-mono text-zinc-400">
                      v{app.localVersion || app.version} · {app.category}
                    </span>
                  </div>
                </div>

                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border border-cyan-500/20 font-bold">
                  Verified
                </span>
              </div>

              <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-2 leading-relaxed">
                {app.description || 'Child application integrated natively with Anything.'}
              </p>

              <div className="flex items-center gap-2 pt-1 border-t border-zinc-100 dark:border-white/[0.06]">
                <button
                  onClick={() => onOpenAppDetail(app)}
                  className="flex-1 py-1.5 px-3 rounded-lg text-xs font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.06] dark:hover:bg-white/10 text-zinc-800 dark:text-zinc-200 transition-colors text-center"
                >
                  Inspect & Versions
                </button>

                {app.status === 'installed' && (
                  <button
                    onClick={() => onLaunchApp(app)}
                    className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 transition-colors"
                    title="Launch"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                )}
              </div>
            </GlassCard>
          ))}
        </div>
      </div>

      {/* Developer & AI Prompt Toolkit Card */}
      <GlassCard className="p-6 border-zinc-200 dark:border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 flex items-center justify-center font-bold">
              <Code2 className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
                Child App AI Builder Master Prompt
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Give this prompt to Claude, ChatGPT, or Cursor to create an Anything-compatible child app.
              </p>
            </div>
          </div>

          <GlassButton
            variant="glass"
            size="sm"
            icon={copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
            onClick={handleCopyPrompt}
          >
            {copiedPrompt ? 'Copied Prompt!' : 'Copy Master Prompt'}
          </GlassButton>
        </div>

        <pre className="p-4 rounded-xl bg-zinc-950 text-cyan-400 font-mono text-[11px] leading-relaxed overflow-x-auto border border-zinc-800 selection:bg-cyan-500/30">
          {promptPreview}
        </pre>
      </GlassCard>
    </div>
  );
};
