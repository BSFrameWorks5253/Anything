import React, { useState } from 'react';
import { AccountSection } from './components/AccountSection';
import { SplashScreenSection } from './components/SplashScreenSection';
import { AutoUpdateSection } from './components/AutoUpdateSection';
import { AuthEmailNotificationSection } from './components/AuthEmailNotificationSection';
import { PlanSection } from './components/PlanSection';
import { StorageSection } from './components/StorageSection';
import { PreferencesList } from './components/PreferencesList';
import { AdobeSplashScreen } from '../../components/ui/AdobeSplashScreen';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { type SplashSettings } from '../../data/splash.data';

interface SettingsPageProps {
  onPreviewSplash?: (settings: SplashSettings) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = ({ onPreviewSplash }) => {
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
      <SplashScreenSection onPreview={handlePreview} />

      {/* GitHub Releases Auto-Update Section */}
      <AutoUpdateSection />

      {/* Authentication & Animated Email Release Dispatch */}
      <AuthEmailNotificationSection />

      {/* Subscription Tier Details */}
      <PlanSection />

      {/* Cloud Storage Breakdown */}
      <StorageSection />

      {/* Hardware & Engine Preferences */}
      <PreferencesList />

      {/* Creator & Architect Signature Card */}
      <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-600 flex items-center justify-center text-slate-950 font-extrabold text-lg shadow-md shadow-cyan-500/20">
              BS
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                  Burhanuddin Sounasath
                </h4>
                <GlassBadge variant="cyan" dot>
                  Lead Architect
                </GlassBadge>
              </div>
              <p className="text-xs text-zinc-600 dark:text-white/60 font-mono mt-0.5">
                Creator of Anything Ecosystem · Direct Contact: +91 8369811201
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-zinc-500 dark:text-white/50">
            <span>Anything v1.0.0</span>
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
