import React, { useState, useEffect } from 'react';
import { X, Sparkles, Loader2, Cpu } from 'lucide-react';
import type { SplashSettings } from '../../data/splash.data';

interface AdobeSplashScreenProps {
  settings: SplashSettings;
  isOpen: boolean;
  onComplete: () => void;
  isPreview?: boolean;
  isBootScreen?: boolean;
  isStandaloneSplash?: boolean;
}

// Inlined Brand Emblem Squircle Logo Badge for instantaneous, 100% reliable rendering
export const AnythingBrandEmblem: React.FC<{
  size?: number;
  className?: string;
  letters?: string;
  gradientFrom?: string;
  gradientTo?: string;
  glow?: boolean;
}> = ({
  size = 56,
  className = '',
  letters = 'An',
  gradientFrom = '#FF2A2A',
  gradientTo = '#BA0000',
  glow = false,
}) => {
  const isTap = letters.toLowerCase() === 'ts';
  const fromColor = isTap ? '#06B6D4' : gradientFrom;
  const toColor = isTap ? '#4F46E5' : gradientTo;
  const shadowColor = isTap ? 'rgba(6, 182, 212, 0.45)' : 'rgba(224, 2, 1, 0.45)';

  return (
    <div
      className={`shrink-0 rounded-2xl overflow-hidden select-none ${className}`}
      style={{
        width: size,
        height: size,
        boxShadow: glow ? `0 8px 28px ${shadowColor}` : undefined,
      }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <defs>
          <linearGradient id={`emblemGrad_${letters}`} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={fromColor} />
            <stop offset="100%" stopColor={toColor} />
          </linearGradient>
        </defs>
        <rect width="100" height="100" rx="22" fill={`url(#emblemGrad_${letters})`} />
        {/* Specular glass highlight rim */}
        <rect
          x="1.5"
          y="1.5"
          width="97"
          height="97"
          rx="20.5"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="1.5"
        />
        <text
          x="50"
          y="67"
          textAnchor="middle"
          fill="#FFFFFF"
          style={{
            fontFamily:
              "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
            fontWeight: 800,
            fontSize: letters.length > 2 ? '42px' : '52px',
            letterSpacing: '-1.5px',
          }}
        >
          {letters}
        </text>
      </svg>
    </div>
  );
};

const getInitializationSteps = (name: string = '') => {
  if (name.toLowerCase().includes('tap')) {
    return [
      'Initializing Direct3D 12 low-latency driver...',
      'Scanning USB Stream Deck & Macro Devices...',
      'Loading Hotkeys and Dynamic Keymaps...',
      'Syncing with Anything Ecosystem...',
      'Starting Tap Studio...',
    ];
  }
  return [
    'Initializing Direct3D 12 GPU hardware pipeline...',
    'Loading Anything Spectrum layout engine...',
    'Parsing application registry & package catalog...',
    'Synchronizing Cloud Documents & Spatial assets...',
    'Connecting GitHub release channels & delta maps...',
    'Restoring workspace panels & layout state...',
    'Starting Anything...',
  ];
};

export const AdobeSplashScreen: React.FC<AdobeSplashScreenProps> = ({
  settings,
  isOpen,
  onComplete,
  isPreview = false,
  isBootScreen = false,
  isStandaloneSplash = false,
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
    const intervalTime = 35;
    const totalSteps = duration / intervalTime;
    const increment = 100 / totalSteps;
    const stepsList = getInitializationSteps(settings.productName);

    let currentProgress = 0;

    const timer = setInterval(() => {
      currentProgress += increment;
      if (currentProgress >= 100) {
        currentProgress = 100;
        setProgress(100);
        setCurrentStepIndex(stepsList.length - 1);
        clearInterval(timer);

        // Smooth fadeout into workspace
        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            onComplete();
          }, 350);
        }, 220);
      } else {
        setProgress(currentProgress);
        const step = Math.min(
          stepsList.length - 2,
          Math.floor((currentProgress / 100) * (stepsList.length - 1))
        );
        setCurrentStepIndex(step);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [isOpen, settings.durationMs, settings.productName, onComplete]);

  if (!isOpen) return null;

  const stepsList = getInitializationSteps(settings.productName);
  const emblemLetters =
    settings.logoText ||
    (settings.productName?.toLowerCase().includes('tap')
      ? 'Ts'
      : settings.productName?.slice(0, 2) || 'An');

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center select-none transition-all duration-300 ${
        isStandaloneSplash
          ? 'bg-transparent p-0 m-0'
          : isBootScreen
          ? 'bg-[#0E0E11]'
          : 'bg-black/80 backdrop-blur-md p-4'
      } ${
        isFadingOut
          ? 'opacity-0 scale-[0.985] pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      onClick={(e) => {
        // Dismiss preview on background click
        if (isPreview && e.target === e.currentTarget) {
          onComplete();
        }
      }}
    >
      {/* Adobe Splash Window Container (The Box Only) */}
      <div
        className="w-[740px] max-w-[740px] rounded-2xl overflow-hidden bg-[#18181B] border border-[#2B2B30] flex flex-col relative transition-transform duration-300 animate-fadeIn mx-4"
        style={{
          boxShadow: '0 30px 90px -10px rgba(0, 0, 0, 0.95), 0 0 0 1px rgba(255, 255, 255, 0.09)',
        }}
      >
        {/* Top Header & Artwork Canvas */}
        <div
          className="relative h-[340px] sm:h-[360px] w-full overflow-hidden bg-zinc-950 flex flex-col justify-between p-7"
          style={isStandaloneSplash ? ({ WebkitAppRegion: 'drag' } as React.CSSProperties) : undefined}
        >
          {/* Background Artwork Canvas with subtle ambient scale */}
          <img
            src={settings.artworkUrl}
            alt="Splash Artwork"
            className={`absolute inset-0 w-full h-full filter brightness-[0.95] contrast-[1.04] transition-all duration-700 ${
              settings.artworkFit === 'contain'
                ? 'object-contain bg-zinc-950'
                : 'object-cover'
            } ${
              settings.artworkPosition === 'top'
                ? 'object-top'
                : settings.artworkPosition === 'bottom'
                ? 'object-bottom'
                : 'object-center'
            } scale-100 hover:scale-102`}
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1400&q=85';
            }}
          />

          {/* Cinematic Studio Overlays (Vignette & Readability Gradient) */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#18181B] via-black/25 to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-transparent to-black/45 pointer-events-none" />

          {/* Top Bar: Official Red Squircle Emblem, Title & Fast Skip */}
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-4">
              {/* Reliable Inlined Official Logo Badge */}
              <AnythingBrandEmblem
                size={56}
                letters={emblemLetters}
                className="transition-transform duration-200 hover:scale-105"
              />

              <div>
                <div className="flex items-center gap-2.5">
                  <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-md">
                    {settings.productName || 'Anything'}
                  </h1>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-mono font-bold bg-white/10 text-white border border-white/20 backdrop-blur-md shadow-xs">
                    {settings.versionText || '2026.1'}
                  </span>
                </div>
                <p className="text-xs text-zinc-200/90 font-medium drop-shadow-sm mt-0.5">
                  {settings.tagline || 'Creative & Productivity Master Hub'}
                </p>
              </div>
            </div>

            {/* Skip / Close preview button */}
            <div style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}>
              {isPreview ? (
                <button
                  onClick={onComplete}
                  className="w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 border border-white/20 text-white flex items-center justify-center transition-colors backdrop-blur-md shadow-md"
                  title="Close Preview"
                >
                  <X className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="text-[11px] font-mono font-medium text-white/70 hover:text-white px-3 py-1 rounded-full bg-black/40 hover:bg-black/70 border border-white/15 transition-all backdrop-blur-md hover:scale-105"
                >
                  Skip ➔
                </button>
              )}
            </div>
          </div>

          {/* Bottom Right of Artwork: Artist Credit Capsule */}
          <div className="relative z-10 self-end">
            <div className="px-3.5 py-1.5 rounded-xl bg-black/65 backdrop-blur-xl border border-white/15 shadow-xl flex flex-col items-end">
              <span className="text-[9px] font-mono uppercase tracking-widest text-cyan-300 font-bold">
                Featured Artwork
              </span>
              <span className="text-xs font-bold text-white tracking-tight drop-shadow-xs">
                {settings.artistName || 'Burhanuddin Sounasath'}
              </span>
              {settings.artworkTitle && (
                <span className="text-[10px] text-zinc-300 italic font-medium">
                  {settings.artworkTitle}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Lower Canvas: High-End Adobe Progress Bar & Real-time Diagnostics */}
        <div className="p-6 bg-[#18181B] text-zinc-100 flex flex-col justify-between gap-4 border-t border-zinc-800/80">
          {/* Real-time Loader Progress Bar */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 text-red-500 animate-spin shrink-0" />
                <span className="font-mono text-zinc-200 text-[11px] font-medium tracking-wide">
                  {stepsList[currentStepIndex] || 'Starting application...'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs">
                <span className="text-zinc-400">Loading</span>
                <span className="text-red-400 font-bold">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>

            {/* Glowing Segmented Loader Bar with Shimmer Beam */}
            <div className="w-full h-2 rounded-full bg-zinc-900 border border-zinc-800/90 overflow-hidden relative shadow-inner">
              <div
                className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-400 rounded-full transition-all duration-75 relative overflow-hidden shadow-[0_0_14px_rgba(239,68,68,0.7)]"
                style={{ width: `${progress}%` }}
              >
                {/* Moving Shimmer Sheen */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/35 to-transparent animate-shimmer" />
              </div>
            </div>
          </div>

          {/* Footer Metadata & Adobe Spectrum Legal Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-400 font-mono">
            <span>© 1990–2026 Anything Systems Inc. · Architect: Burhanuddin Sounasath (8369811201)</span>
            <div className="flex items-center gap-2 text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>DirectX 12 GPU · Build 2026.10</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
