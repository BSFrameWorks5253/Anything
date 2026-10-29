import React, { useState, useCallback } from 'react';
import { AdobeSplashScreen } from './components/ui/AdobeSplashScreen';
import { loadSplashSettings } from './data/splash.data';

export const StandaloneSplashApp: React.FC = () => {
  const [settings] = useState(() => loadSplashSettings());

  const handleComplete = useCallback(() => {
    try {
      (window as any).electronAPI?.splashDone?.();
    } catch (e) {
      console.warn('splashDone error:', e);
    }
  }, []);

  return (
    <div className="w-screen h-screen flex items-center justify-center bg-transparent select-none p-0 m-0 overflow-hidden">
      <AdobeSplashScreen
        settings={settings}
        isOpen={true}
        onComplete={handleComplete}
        isStandaloneSplash={true}
      />
    </div>
  );
};
