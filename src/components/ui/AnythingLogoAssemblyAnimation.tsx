import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, ArrowDownToLine, ArrowUpToLine, Zap, Layers } from 'lucide-react';

interface AnythingLogoAssemblyAnimationProps {
  isOpen: boolean;
  mode: 'upload' | 'download';
  title?: string;
  subtitle?: string;
  itemCount?: number;
  totalSizeFormatted?: string;
  progress?: number; // 0 to 100
  onComplete?: () => void;
  autoCloseMs?: number;
}

export const AnythingLogoAssemblyAnimation: React.FC<AnythingLogoAssemblyAnimationProps> = ({
  isOpen,
  mode,
  title,
  subtitle,
  itemCount = 1,
  totalSizeFormatted = '12.4 MB',
  progress: externalProgress,
  onComplete,
  autoCloseMs = 3200,
}) => {
  const [internalProgress, setInternalProgress] = useState(0);
  const [phase, setPhase] = useState<'laser' | 'assembling' | 'igniting' | 'complete'>('laser');

  const currentProgress = externalProgress !== undefined ? externalProgress : internalProgress;

  useEffect(() => {
    if (!isOpen) {
      setInternalProgress(0);
      setPhase('laser');
      return;
    }

    // Auto progress simulation if no external progress provided
    if (externalProgress === undefined) {
      setInternalProgress(0);
      setPhase('laser');

      const t1 = setTimeout(() => setPhase('assembling'), 400);
      const t2 = setTimeout(() => setPhase('igniting'), 1400);

      const interval = setInterval(() => {
        setInternalProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setPhase('complete');
            return 100;
          }
          const next = prev + Math.floor(Math.random() * 15) + 12;
          return next > 100 ? 100 : next;
        });
      }, 150);

      const closeTimer = setTimeout(() => {
        if (onComplete) onComplete();
      }, autoCloseMs);

      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
        clearTimeout(closeTimer);
        clearInterval(interval);
      };
    }
  }, [isOpen, externalProgress, autoCloseMs, onComplete]);

  if (!isOpen) return null;

  const isUpload = mode === 'upload';

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fadeIn">
      {/* Dynamic Ambient Background Sheen */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[30%] left-[20%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-pink-600/20 via-rose-600/15 to-transparent blur-3xl animate-pulse" />
        <div className="absolute -bottom-[20%] right-[15%] w-[500px] h-[500px] rounded-full bg-gradient-to-bl from-blue-600/20 via-indigo-600/15 to-transparent blur-3xl animate-pulse" />
      </div>

      <div className="relative w-full max-w-md p-8 rounded-3xl bg-zinc-900/90 border border-white/15 shadow-[0_0_60px_rgba(0,0,0,0.8)] flex flex-col items-center text-center overflow-hidden">
        
        {/* Top Glow Ray */}
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-rose-500/80 to-transparent" />

        {/* Cinematic Logo Assembly Viewport */}
        <div className="relative w-44 h-44 mb-6 flex items-center justify-center">
          
          {/* Orbital Laser Rings */}
          <div className="absolute inset-0 rounded-full border border-rose-500/20 animate-spin duration-[10000ms]" />
          <div className="absolute inset-3 rounded-full border border-dashed border-amber-500/30 animate-spin duration-[7000ms] reverse" />

          {/* SVG Hardware-Accelerated Logo Assembly */}
          <svg
            viewBox="0 0 512 512"
            className="w-36 h-36 drop-shadow-[0_0_35px_rgba(255,19,65,0.45)] transition-all duration-700"
            style={{
              transform: phase === 'igniting' || phase === 'complete' ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            <defs>
              <linearGradient id="animSpectrum" x1="60" y1="360" x2="450" y2="120" gradientUnits="userSpaceOnUse">
                <stop offset="0%" stopColor="#DA1884" />
                <stop offset="25%" stopColor="#FF1341" />
                <stop offset="55%" stopColor="#FF4F00" />
                <stop offset="80%" stopColor="#FF8A00" />
                <stop offset="100%" stopColor="#FFBA00" />
              </linearGradient>

              <radialGradient id="animGlow" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#FF1341" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#FF1341" stopOpacity="0" />
              </radialGradient>
            </defs>

            {/* Glowing Aura Core */}
            <circle cx="256" cy="256" r="200" fill="url(#animGlow)" className="animate-pulse" />

            {/* Dark Studio Squircle Base */}
            <rect
              x="36"
              y="36"
              width="440"
              height="440"
              rx="105"
              fill="#141418"
              stroke="#FFFFFF"
              strokeOpacity="0.18"
              strokeWidth="4"
              className="transition-all duration-500"
            />

            {/* The Assembling Creative Infinity Ribbon with Laser Tracing */}
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M 256,120
                 C 308,120 350,154 366,198
                 C 408,206 440,242 440,286
                 C 440,336 400,376 350,376
                 C 322,376 288,360 256,334
                 C 224,360 190,376 162,376
                 C 112,376 72,336 72,286
                 C 72,242 104,206 146,198
                 C 162,154 204,120 256,120 Z
                 M 256,192
                 C 232,192 214,208 206,230
                 C 218,242 236,258 256,276
                 C 276,258 294,242 306,230
                 C 298,208 280,192 256,192 Z"
              fill="url(#animSpectrum)"
              stroke="#FFFFFF"
              strokeWidth={phase === 'laser' ? 14 : 2}
              strokeOpacity={phase === 'laser' ? 0.9 : 0.3}
              strokeDasharray="1600"
              strokeDashoffset={1600 - (1600 * currentProgress) / 100}
              className="transition-all duration-300 ease-out"
            />
          </svg>

          {/* Central Laser Flare during assembly */}
          {phase === 'laser' && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-cyan-400/40 blur-md animate-ping" />
            </div>
          )}
        </div>

        {/* Status Mode Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold tracking-wide uppercase mb-3 bg-white/[0.07] border border-white/10 text-white shadow-inner">
          {isUpload ? (
            <>
              <ArrowUpToLine className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
              <span>Studio Staging Stream</span>
            </>
          ) : (
            <>
              <ArrowDownToLine className="w-3.5 h-3.5 text-cyan-400 animate-bounce" />
              <span>Direct Export Stream</span>
            </>
          )}
          <span className="text-zinc-500">•</span>
          <span className="text-emerald-400 font-bold">{currentProgress}%</span>
        </div>

        {/* Title & Subtitle */}
        <h3 className="text-lg font-bold text-white tracking-tight">
          {title || (isUpload ? 'Assembling Staged Assets into Hub' : 'Streaming Files to Local Storage')}
        </h3>
        <p className="text-xs text-zinc-400 mt-1 max-w-xs font-medium">
          {subtitle ||
            (isUpload
              ? `Syncing ${itemCount} item(s) (${totalSizeFormatted}) into Anything studio workspace`
              : `Downloading ${itemCount} asset(s) at native SSD speeds`)}
        </p>

        {/* Smooth Glass Progress Bar */}
        <div className="w-full mt-6 bg-black/50 p-1 rounded-2xl border border-white/10 shadow-inner">
          <div
            className="h-2.5 rounded-xl bg-gradient-to-r from-rose-500 via-orange-500 to-amber-400 transition-all duration-200 ease-out shadow-[0_0_15px_rgba(255,79,0,0.5)]"
            style={{ width: `${currentProgress}%` }}
          />
        </div>

        {/* Transfer Metrics Footer */}
        <div className="w-full flex items-center justify-between mt-3 text-[11px] font-mono text-zinc-400 font-semibold px-1">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <Zap className="w-3 h-3 text-amber-400" />
            142.8 MB/s · Local Bus
          </span>
          <span>
            {currentProgress === 100 ? (
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Completed
              </span>
            ) : (
              `${itemCount} ${itemCount === 1 ? 'file' : 'files'} remaining`
            )}
          </span>
        </div>
      </div>
    </div>
  );
};
