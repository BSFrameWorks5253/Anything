import React, { useState } from 'react';
import { AccountSection } from './components/AccountSection';
import { SplashScreenSection } from './components/SplashScreenSection';
import { AutoUpdateSection } from './components/AutoUpdateSection';
import { OneTapAutoConverterSection } from './components/OneTapAutoConverterSection';
import { AuthEmailNotificationSection } from './components/AuthEmailNotificationSection';
import { DiagnosticLogsViewer } from './components/DiagnosticLogsViewer';
import { PlanSection } from './components/PlanSection';
import { AnythingFontsManager } from '../fonts/AnythingFontsManager';
import { EcosystemThemeSync } from '../theme/EcosystemThemeSync';
import { AdobeSplashScreen } from '../../components/ui/AdobeSplashScreen';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { type SplashSettings } from '../../data/splash.data';
import type { CatalogApp } from '../../types/app.types';

interface SettingsPageProps {
  onPreviewSplash?: (settings: SplashSettings) => void;
  initialAppId?: string;
  apps?: CatalogApp[];
  onUpdateApp?: (app: CatalogApp) => void;
  onCheckUpdates?: () => Promise<void>;
  isCheckingUpdates?: boolean;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  onPreviewSplash,
  initialAppId = 'anything',
  apps = [],
  onUpdateApp,
  onCheckUpdates,
  isCheckingUpdates = false,
}) => {
  const [previewSettings, setPreviewSettings] = useState<SplashSettings | null>(null);

  const handlePreview = (settings: SplashSettings) => {
    if (onPreviewSplash) {
      onPreviewSplash(settings);
    } else {
      setPreviewSettings(settings);
    }
  };

  return (
    <div className="p-6 lg:p-8 space-y-7 max-w-7xl mx-auto pb-16">
      {/* Account Profile Card */}
      <AccountSection />

      {/* Adobe Splash Screen & Loader Customizer */}
      <SplashScreenSection initialAppId={initialAppId} apps={apps} onPreview={handlePreview} />

      {/* GitHub Releases Auto-Update Section */}
      <AutoUpdateSection
        apps={apps}
        onUpdateApp={onUpdateApp}
        onCheckUpdates={onCheckUpdates}
        isCheckingUpdates={isCheckingUpdates}
      />

      {/* One Tap PNG to JPG Auto-Converter Background Daemon */}
      <OneTapAutoConverterSection />

      

      {/* Authentication & Animated Email Release Dispatch */}
      <AuthEmailNotificationSection />

      {/* Anything Fonts Manager */}
      <AnythingFontsManager />

      {/* Ecosystem Theme Sync */}
      <EcosystemThemeSync />

      {/* Diagnostic Logs */}
      <DiagnosticLogsViewer />

      {/* Subscription Tier Details */}
      <PlanSection />

      {/* About Anything Suite */}
      <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-600 flex items-center justify-center text-slate-950 font-extrabold text-lg shadow-md shadow-cyan-500/20">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  Anything Desktop Suite
                </h4>
                <GlassBadge variant="cyan" dot>
                  Creative Ecosystem
                </GlassBadge>
              </div>
              <p className="text-xs text-zinc-600 dark:text-white/60 font-mono mt-0.5">
                Modern Child Apps & Automation Workstation
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-white/50">
            <span>Version 26.10.30</span>
            <span>•</span>
            <span>Build 2026.10</span>
          </div>
        </div>
      </GlassCard>

      {/* Local Preview Modal fallback */}
      {previewSettings && (
        <AdobeSplashScreen
          settings={previewSettings}
          isOpen={Boolean(previewSettings)}
          onComplete={() => setPreviewSettings(null)}
          isPreview={true}
        />
      )}
    </div>
  );
};
