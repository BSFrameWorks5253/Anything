import React, { useState } from 'react';
import { Smartphone, Download, QrCode, ExternalLink, ShieldCheck, Apple, Check, Share2, Sparkles } from 'lucide-react';
import type { CatalogApp } from '../../types/app.types';
import { GlassCard } from '../../components/ui/GlassCard';
import { AppIconRenderer } from '../apps/components/CrazyAppStudio/AppIconRenderer';
import { useTheme } from '../../context/ThemeContext';

interface MobileAppsPageProps {
  apps: CatalogApp[];
  onOpenAppDetail?: (app: CatalogApp) => void;
  onNavigateToPublisher?: () => void;
}

export const MobileAppsPage: React.FC<MobileAppsPageProps> = ({
  apps,
  onOpenAppDetail,
  onNavigateToPublisher,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [selectedMobileApp, setSelectedMobileApp] = useState<CatalogApp | null>(null);

  // Filter apps that have mobile releases (Android APK/AAB or iOS IPA) or have category 'Mobile'
  const mobileApps = apps.filter(
    (a) => a.targetPlatforms?.includes('mobile') || Boolean(a.mobileInfo) || (a.category && a.category.toLowerCase().includes('mobile'))
  );

  return (
    <div className="p-6 lg:p-8 space-y-8 max-w-7xl mx-auto pb-16">
      {/* Hero Banner: Creative Cloud Mobile Suite */}
      <div
        className={`relative rounded-3xl p-8 overflow-hidden border transition-all ${
          isLight
            ? 'bg-gradient-to-br from-white via-emerald-50/40 to-cyan-50/30 border-emerald-500/20 shadow-xl'
            : 'bg-gradient-to-br from-[#18181C] via-[#121216] to-[#0D1515] border-emerald-500/20 shadow-2xl'
        }`}
      >
        <div className="absolute top-0 right-0 w-[500px] h-[350px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
            <Smartphone className="w-3.5 h-3.5" />
            <span>Anything Mobile Ecosystem</span>
          </div>

          <h2 className="text-3xl font-black tracking-tight drop-shadow-xs">
            Mobile Creative Apps & Companion Studio
          </h2>

          <p className={`text-sm leading-relaxed ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
            Access your applications on the go. Install official Android APK packages, scan QR codes for direct wireless installation to your phone or tablet, and sync your assets across mobile and desktop.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-4 h-4" />
              <span>Verified GitHub Release Artifacts</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <span>• Direct Android APK</span>
            </div>
            <div className="flex items-center gap-1.5 text-zinc-500 dark:text-zinc-400">
              <span>• iOS TestFlight / IPA Ready</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Apps Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className={`text-lg font-bold ${isLight ? 'text-zinc-900' : 'text-white'}`}>
              Available Mobile Apps
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-mono font-bold bg-emerald-500/15 text-emerald-500">
              {mobileApps.length}
            </span>
          </div>
        </div>

        {mobileApps.length === 0 ? (
          <GlassCard className="p-12 text-center max-w-xl mx-auto space-y-4 border-dashed">
            <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-500">
              <Smartphone className="w-7 h-7" />
            </div>
            <h4 className="text-base font-bold">No Mobile Releases Synced Yet</h4>
            <p className={`text-xs ${isLight ? 'text-zinc-600' : 'text-zinc-400'} max-w-md mx-auto leading-relaxed`}>
              When you attach an <code className="px-1 py-0.5 rounded bg-black/10 dark:bg-white/10 font-mono">.apk</code> or mobile companion package to your GitHub releases in Cloud Hub, it will automatically populate here with direct 1-click install links and QR codes.
            </p>
            {onNavigateToPublisher && (
              <button
                onClick={onNavigateToPublisher}
                className="mt-3 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-md hover:scale-105"
              >
                Open Cloud Hub Publisher
              </button>
            )}
          </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {mobileApps.map((app) => {
              const apkUrl = app.mobileInfo?.apkDownloadUrl || (app.downloadUrl?.endsWith('.apk') ? app.downloadUrl : null);
              const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
                apkUrl || app.releasesUrl || `https://github.com/${app.githubRepo || ''}`
              )}`;

              return (
                <GlassCard
                  key={app.id}
                  variant="interactive"
                  className="p-5 flex flex-col justify-between group space-y-4"
                  onClick={() => onOpenAppDetail?.(app)}
                >
                  <div className="flex items-start gap-4">
                    <AppIconRenderer app={app} size="lg" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="text-sm font-bold truncate group-hover:text-emerald-500 transition-colors">
                          {app.name}
                        </h4>
                        <span className="p-0.5 rounded bg-emerald-500/10 text-emerald-500" title="Android APK available">
                          <Smartphone className="w-3 h-3" />
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 block mt-0.5">
                        v{app.version} • {app.category}
                      </span>
                      <p className={`text-xs mt-2 line-clamp-2 ${isLight ? 'text-zinc-600' : 'text-zinc-300'}`}>
                        {app.description}
                      </p>
                    </div>
                  </div>

                  {/* QR Code & Direct Download Box */}
                  <div
                    className={`p-3 rounded-2xl border flex items-center justify-between gap-3 ${
                      isLight ? 'bg-zinc-100/80 border-zinc-200' : 'bg-black/30 border-white/10'
                    }`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={qrUrl}
                        alt="Mobile Scan QR"
                        className="w-12 h-12 rounded-lg bg-white p-1 border shadow-xs"
                      />
                      <div className="text-left">
                        <span className="text-[11px] font-bold block">Scan to Install</span>
                        <span className="text-[10px] text-zinc-500 dark:text-zinc-400 block">
                          Point phone camera to download
                        </span>
                      </div>
                    </div>

                    {apkUrl ? (
                      <a
                        href={apkUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white flex items-center gap-1.5 shadow-xs transition-transform active:scale-95"
                        title="Download Android APK"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>APK</span>
                      </a>
                    ) : (
                      <a
                        href={app.releasesUrl || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-xl text-xs font-medium border border-zinc-300 dark:border-zinc-700 hover:bg-white/10 flex items-center gap-1 transition-colors"
                      >
                        <span>Releases</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </GlassCard>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};