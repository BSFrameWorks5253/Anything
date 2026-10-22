import React, { useState } from 'react';
import { AccountSection } from './components/AccountSection';
import { SplashScreenSection } from './components/SplashScreenSection';
import { AutoUpdateSection } from './components/AutoUpdateSection';
import { PlanSection } from './components/PlanSection';
import { StorageSection } from './components/StorageSection';
import { PreferencesList } from './components/PreferencesList';
import { AdobeSplashScreen } from '../../components/ui/AdobeSplashScreen';
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

      {/* Subscription Tier Details */}
      <PlanSection />

      {/* Cloud Storage Breakdown */}
      <StorageSection />

      {/* Hardware & Engine Preferences */}
      <PreferencesList />

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
