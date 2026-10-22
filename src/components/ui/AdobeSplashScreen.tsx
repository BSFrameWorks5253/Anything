import React, { useState, useEffect } from 'react';
import { X, Minus, Loader2 } from 'lucide-react';
import type { SplashSettings } from '../../data/splash.data';

interface AdobeSplashScreenProps {
  settings: SplashSettings;
  isOpen: boolean;
  onComplete: () => void;
  isPreview?: boolean;
  isBootScreen?: boolean;
}

const initializationSteps = [
  'Initializing application architecture...',
  'Loading liquid-glass rendering engine...',
  'Scanning installed applications catalog...',
  'Synchronizing cloud workspace & documents...',
  'Connecting GitHub release & update channels...',
  'Preloading desktop user interface...',
  'Ready',
];

export const AdobeSplashScreen: React.FC<AdobeSplashScreenProps> = ({
  settings,
  isOpen,
  onComplete,
  isPreview = false,
  isBootScreen = false,
}) => {
  const [progress, setProgress] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentStepIndex(0);
      setIsFadingOut(false);
      return;
    }

    const duration = Math.max(1200, settings.durationMs || 2800);
    const intervalTime = 40;
    const totalSteps = duration / intervalTime;
    const increment = 100 / totalSteps;

    let currentProgress = 0;

    const timer = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        setCurrentStepIndex(initializationSteps.length - 1);
        clearInterval(timer);

        // Initiate fadeout
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            onComplete();
          }, 350);
        }, 250);
      } else {
        setProgress(currentProgress);
        const step = Math.min(
          initializationSteps.length - 2,
          Math.floor((currentProgress / 100) * (initializationSteps.length - 1))
        );
        setCurrentStepIndex(step);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, settings.durationMs, onComplete]);

  if (!isOpen) return null;

  const handleMinimize = () => {
    (window as any).electronAPI?.minimizeWindow();
  };

  const handleClose = () => {
    if (isBootScreen) {
      (window as any).electronAPI?.closeWindow();
    } else {
      onComplete();
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center transition-all duration-350 select-none ${
        isBootScreen
          ? 'bg-[#0E0E11]'
          : 'bg-black/80 backdrop-blur-md p-4'
      } ${
        isFadingOut
          ? 'opacity-0 scale-[0.98] pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      onClick={(e) => {
        // Dismiss preview on background click
        if (isPreview && e.target === e.currentTarget) {
          onComplete();
        }
      }}
    >
      {/* Frameless Drag Handle Bar for Boot Screen */}
      {isBootScreen && (
        <div
          className="absolute top-0 left-0 right-0 h-10 flex items-center justify-end px-3 z-50 select-none"
          style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
        >
          <div
            className="flex items-center gap-1"
            style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
          >
            <button
              onClick={handleMinimize}
              className="w-8 h-8 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Minimize"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleClose}
              className="w-8 h-8 rounded flex items-center justify-center text-zinc-400 hover:text-white hover:bg-red-600 transition-colors"
              title="Close"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Adobe Splash Window Container (The Box) */}
      <div
        className="w-full max-w-[720px] rounded-2xl overflow-hidden bg-[#18181B] border border-[#27272A] shadow-[0_25px_80px_rgba(0,0,0,0.95)] flex flex-col relative transition-transform duration-300 animate-fadeIn mx-4"
        style={{
          boxShadow: '0 25px 80px -10px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        }}
      >
        {/* Top Header & Artwork Canvas */}
        <div className="relative h-[330px] sm:h-[360px] w-full overflow-hidden bg-zinc-950 flex flex-col justify-between p-6">
          {/* Background Artwork */}
          <img
            src={settings.artworkUrl}
            alt="Splash Artwork"
            className="absolute inset-0 w-full h-full object-cover object-center filter brightness-[0.92] contrast-[1.05]"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85';
            }}
          />

          {/* Cinematic Vignette Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-black/20 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-black/40 pointer-events-none" />

          {/* Top Bar: Adobe-Style Monogram Badge & Title */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-3.5">
              {/* Official Anything App Logo (logo.svg) */}
              <div className="w-13 h-13 rounded-2xl overflow-hidden shadow-[0_4px_24px_rgba(224,2,1,0.45)] shrink-0 transition-transform hover:scale-105">
                <img src="/logo.svg" alt="Anything Logo" className="w-full h-full object-contain" />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
                    {settings.productName || 'Anything'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white/10 text-white/90 border border-white/20 backdrop-blur-md">
                    {settings.versionText || '2026.1'}
                  </span>
                </div>
                <p className="text-xs text-cyan-200/90 font-medium drop-shadow-sm mt-0.5">
                  {settings.tagline || 'Creative & Productivity Master Hub'}
                </p>
              </div>
            </div>

            {/* Skip / Close preview button */}
            <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
              {isPreview ? (
                <button
                  onClick={onComplete}
                  className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/70 border border-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md"
                  title="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="text-[11px] font-mono text-white/50 hover:text-white px-2.5 py-1 rounded-md bg-black/30 hover:bg-black/60 border border-white/10 transition-colors backdrop-blur-md"
                >
                  Skip ➔
                </button>
              )}
            </div>
          </div>

          {/* Bottom Right of Artwork: Artist Credit Capsule (Adobe Signature Style) */}
          <div className="relative z-10 self-end">
            <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-white/15 shadow-lg flex flex-col items-end">
              <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-300/80 font-bold">
                Featured Artwork
              </span>
              <span className="text-xs font-semibold text-white tracking-tight drop-shadow-xs">
                {settings.artistName || 'Burhanuddin'}
              </span>
              {settings.artworkTitle && (
                <span className="text-[10px] text-white/60 italic font-medium">
                  {settings.artworkTitle}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lower Canvas: Loader, Status Bar & Initialization Diagnostics */}
        <div className="p-6 bg-[#18181B] text-zinc-100 flex flex-col justify-between gap-4">
          {/* Real-time Loader Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
                <span className="font-mono text-zinc-300 text-[11px]">
                  {initializationSteps[currentStepIndex]}
                </span>
              </div>
              <span className="font-mono text-cyan-400 font-bold text-[11px]">
                {Math.round(progress)}%
              </span>
            </div>

            {/* Glowing Segmented Loader Bar */}
            <div className="w-full h-1.5 rounded-full bg-zinc-800/80 overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 via-sky-400 to-indigo-500 rounded-full transition-all duration-75 shadow-[0_0_12px_rgba(56,189,248,0.6)]"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Footer Metadata & Adobe Legal Style */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-zinc-800 text-[10px] text-zinc-400 font-mono">
            <span>© 1990–2026 Anything Systems Inc. All rights reserved.</span>
            <span className="text-zinc-400">
              GPU Hardware Accelerated · x64 Release
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
