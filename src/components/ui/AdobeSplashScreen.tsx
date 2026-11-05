import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  X,
  Sparkles,
  Loader2,
  Cpu,
  Activity,
  HardDrive,
  ShieldCheck,
  Volume2,
  VolumeX,
  Terminal,
  Zap,
} from 'lucide-react';
import type { SplashSettings } from '../../data/splash.data';
import { cleanVersionText } from '../../data/splash.data';

interface AdobeSplashScreenProps {
  settings: SplashSettings;
  isOpen: boolean;
  onComplete: () => void;
  isPreview?: boolean;
  isBootScreen?: boolean;
  isStandaloneSplash?: boolean;
}

// ==========================================
// PROCEDURAL LUXURY WEB AUDIO SYNTHESIZER
// ==========================================
class SplashAudioEngine {
  private ctx: AudioContext | null = null;
  public enabled: boolean = true;

  constructor() {
    try {
      const saved = localStorage.getItem('anything_splash_audio');
      if (saved !== null) {
        this.enabled = saved === 'true';
      }
    } catch (_) {}
  }

  private init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    try {
      localStorage.setItem('anything_splash_audio', String(val));
    } catch (_) {}
  }

  public play(type: 'forge' | 'ascend' | 'lock' | 'monogram') {
    if (!this.enabled) return;
    try {
      this.init();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;

      if (type === 'forge') {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(65, now);
        osc.frequency.exponentialRampToValueAtTime(32, now + 0.7);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(140, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.12, now + 0.12);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.75);

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc.stop(now + 0.8);
      } else if (type === 'ascend') {
        const osc = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const filter = this.ctx.createBiquadFilter();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.exponentialRampToValueAtTime(560, now + 0.55);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(285, now);
        osc2.frequency.exponentialRampToValueAtTime(840, now + 0.55);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1100, now);

        gain.gain.setValueAtTime(0.001, now);
        gain.gain.linearRampToValueAtTime(0.09, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.65);

        osc.connect(filter);
        osc2.connect(filter);
        filter.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(now);
        osc2.start(now);
        osc.stop(now + 0.7);
        osc2.stop(now + 0.7);
      } else if (type === 'lock') {
        [880, 1320, 1760].forEach((freq, i) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.02);

          gain.gain.setValueAtTime(0.001, now + i * 0.02);
          gain.gain.linearRampToValueAtTime(0.07 / (i + 1), now + i * 0.02 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.02 + 0.75);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(now + i * 0.02);
          osc.stop(now + i * 0.02 + 0.8);
        });
      } else if (type === 'monogram') {
        [440, 554.37, 659.25].forEach((freq) => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now);

          gain.gain.setValueAtTime(0.001, now);
          gain.gain.linearRampToValueAtTime(0.035, now + 0.08);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.9);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(now);
          osc.stop(now + 0.95);
        });
      }
    } catch (_) {}
  }
}

const splashAudio = new SplashAudioEngine();

// ==========================================
// 1:1 CANONICAL MASTER LOGO ASSEMBLY COMPONENT
// ==========================================
export const MasterLogoAssembly: React.FC<{
  progress: number; // 0 to 100
  size?: number;
  interactiveTilt?: boolean;
}> = ({ progress, size = 150, interactiveTilt = true }) => {
  const norm = Math.min(1, Math.max(0, progress / 100));

  // Phase 1: Squircle (0 to 0.28)
  const p1 = Math.min(1, norm / 0.28);
  const p1Eased = 1 - Math.pow(1 - p1, 3);
  const squircleScale = 0.86 + 0.14 * p1Eased;
  const rimOffset = 1600 * (1 - p1Eased);

  // Phase 2: Ribbon (0.24 to 0.58)
  const p2 = norm < 0.24 ? 0 : Math.min(1, (norm - 0.24) / 0.34);
  const p2Eased = p2 < 0.5 ? 4 * p2 * p2 * p2 : 1 - Math.pow(-2 * p2 + 2, 3) / 2;
  const ribbonOpacity = p2Eased;
  const ribbonScale = 0.92 + 0.08 * p2Eased;
  const contourOffset = 1450 * (1 - p2Eased);

  // Phase 3: Arrow Ascension from Beneath (0.50 to 0.78)
  const p3 = norm < 0.5 ? 0 : Math.min(1, (norm - 0.5) / 0.28);
  const p3Ascend = 1 - Math.pow(1 - p3, 3);
  const arrowY = 150 * (1 - p3Ascend); // Rises from +150px beneath through the aperture to 0px
  const arrowScale = 0.35 + 0.65 * p3Ascend;
  const arrowOpacity = norm < 0.5 ? 0 : Math.min(1, p3 * 2.8);
  const shaftOpacity = norm >= 0.5 && norm < 0.8 ? Math.sin(p3 * Math.PI) * 0.8 : 0;

  // Phase 4: Keystone Elastic Lock (0.78 to 0.88)
  const p4 = norm < 0.78 ? 0 : Math.min(1, (norm - 0.78) / 0.1);
  const pulseOpacity = norm >= 0.78 && norm < 0.9 ? (1 - p4) * 0.85 : 0;
  const pulseScale = 0.5 + p4 * 0.9;
  const lensOpacity = norm >= 0.78 && norm < 0.88 ? Math.sin(p4 * Math.PI) * 0.95 : 0;

  // Phase 5: 'An' Bloom (0.86 to 1.0)
  const p5 = norm < 0.86 ? 0 : Math.min(1, (norm - 0.86) / 0.14);
  const monogramOpacity = p5;
  const monogramY = 8 * (1 - p5);
  const monogramSpacing = 4 * (1 - p5) - 1.5;

  return (
    <div
      className="relative shrink-0 flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* Upward Light Shaft Beam */}
      <div
        className="absolute w-16 h-48 bg-gradient-to-t from-transparent via-cyan-400/25 to-white/70 blur-xl top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-10 transition-opacity duration-150"
        style={{ opacity: shaftOpacity }}
      />

      {/* Shockwave Pulse Ring on Arrow Lock */}
      <div
        className="absolute w-28 h-28 rounded-full border border-white/80 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-20"
        style={{
          opacity: pulseOpacity,
          transform: `translate(-50%, -50%) scale(${pulseScale})`,
          transition: 'transform 0.1s linear, opacity 0.1s linear',
        }}
      />

      {/* Anamorphic Specular Flash Line */}
      <div
        className="absolute w-44 h-1 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-30 filter blur-[1px]"
        style={{
          opacity: lensOpacity,
          background:
            'linear-gradient(90deg, transparent 0%, rgba(255, 79, 0, 0.4) 30%, #ffffff 50%, rgba(56, 189, 248, 0.4) 70%, transparent 100%)',
        }}
      />

      {/* 100% CANONICAL LOGO.SVG VECTOR ARTWORK */}
      <svg
        viewBox="0 0 512 512"
        width="100%"
        height="100%"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="overflow-visible"
      >
        <defs>
          <linearGradient
            id="spSpectrumGrad"
            x1="60"
            y1="360"
            x2="450"
            y2="120"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#DA1884" />
            <stop offset="25%" stopColor="#FF1341" />
            <stop offset="55%" stopColor="#FF4F00" />
            <stop offset="80%" stopColor="#FF8A00" />
            <stop offset="100%" stopColor="#FFBA00" />
          </linearGradient>

          <filter id="spSoftGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow
              dx="0"
              dy="10"
              stdDeviation="16"
              floodColor="#FF1341"
              floodOpacity="0.4"
            />
            <feDropShadow
              dx="0"
              dy="4"
              stdDeviation="6"
              floodColor="#000000"
              floodOpacity="0.6"
            />
          </filter>

          <linearGradient
            id="spTileBg"
            x1="0"
            y1="0"
            x2="512"
            y2="512"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#24242A" />
            <stop offset="50%" stopColor="#18181C" />
            <stop offset="100%" stopColor="#0E0E12" />
          </linearGradient>

          <radialGradient
            id="spTileSheen"
            cx="120"
            cy="90"
            r="340"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.14" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>

          <radialGradient id="spArrowHalo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.5" />
            <stop offset="80%" stopColor="#DA1884" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Squircle Tile Base */}
        <g
          style={{
            transformOrigin: '256px 256px',
            transform: `scale(${squircleScale})`,
            opacity: p1Eased,
            transition: 'transform 0.08s linear, opacity 0.08s linear',
          }}
        >
          <rect
            x="20"
            y="20"
            width="472"
            height="472"
            rx="112"
            fill="#000000"
            opacity="0.5"
            style={{ filter: 'blur(14px)', transform: 'translateY(14px)' }}
          />
          <rect x="20" y="20" width="472" height="472" rx="112" fill="url(#spTileBg)" />
          <rect x="20" y="20" width="472" height="472" rx="112" fill="url(#spTileSheen)" />

          {/* Precision Specular Chamfer Rim (Double Edge) */}
          <rect
            x="21.5"
            y="21.5"
            width="469"
            height="469"
            rx="110.5"
            stroke="#FFFFFF"
            strokeOpacity="0.22"
            strokeWidth="3"
            strokeDasharray="1600"
            strokeDashoffset={rimOffset}
          />
        </g>

        {/* Central Aperture Hole Depth */}
        <ellipse
          cx="256"
          cy="246"
          rx="36"
          ry="18"
          fill="#000000"
          opacity={0.5 * ribbonOpacity}
          style={{ filter: 'blur(8px)' }}
        />

        {/* Geometric Creative Cloud Infinity Ribbon */}
        <g
          filter="url(#spSoftGlow)"
          style={{
            transformOrigin: '256px 256px',
            transform: `scale(${ribbonScale})`,
            opacity: ribbonOpacity,
            transition: 'transform 0.08s linear, opacity 0.08s linear',
          }}
        >
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
               M 256,168
               C 220,168 188,194 178,230
               C 176,238 168,244 160,244
               C 134,244 116,262 116,286
               C 116,312 136,332 162,332
               C 180,332 206,318 232,294
               C 246,281 266,281 280,294
               C 306,318 332,332 350,332
               C 376,332 396,312 396,286
               C 396,262 378,244 352,244
               C 344,244 336,238 334,230
               C 324,194 292,168 256,168 Z"
            fill="url(#spSpectrumGrad)"
          />

          {/* Contour Laser Trace during assembly */}
          {norm < 0.6 && (
            <path
              d="M 256,120
                 C 308,120 350,154 366,198
                 C 408,206 440,242 440,286
                 C 440,336 400,376 350,376
                 C 322,376 288,360 256,334
                 C 224,360 190,376 162,376
                 C 112,376 72,336 72,286
                 C 72,242 104,206 146,198
                 C 162,154 204,120 256,120 Z"
              fill="none"
              stroke="#ffffff"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray="1450"
              strokeDashoffset={contourOffset}
              opacity={norm < 0.55 ? 0.8 : 0}
            />
          )}
        </g>

        {/* Delta Apex Arrow Ascending from Beneath */}
        <g
          style={{
            transformOrigin: '256px 218px',
            transform: `translateY(${arrowY}px) scale(${arrowScale})`,
            opacity: arrowOpacity,
            transition: 'transform 0.08s linear, opacity 0.08s linear',
          }}
        >
          {/* Underglow Halo */}
          <circle cx="256" cy="218" r="42" fill="url(#spArrowHalo)" opacity={shaftOpacity} />

          {/* Authentic White Triangle Apex */}
          <path
            d="M 256,190
               C 258,190 260,193 262,196
               L 282,238
               C 284,242 282,246 278,246
               L 234,246
               C 230,246 228,242 230,238
               L 250,196
               C 252,193 254,190 256,190 Z"
            fill="#FFFFFF"
          />
        </g>

        {/* Mnemonic 'An' in Crisp White Typography */}
        <text
          x="256"
          y="442"
          textAnchor="middle"
          fill="#FFFFFF"
          fontFamily="system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"
          fontWeight="800"
          fontSize="76"
          letterSpacing={`${monogramSpacing}px`}
          style={{
            transformOrigin: '256px 442px',
            transform: `translateY(${monogramY}px)`,
            opacity: monogramOpacity,
            transition: 'opacity 0.08s linear, transform 0.08s linear',
          }}
        >
          An
        </text>
      </svg>
    </div>
  );
};

// ==========================================
// BACKWARD-COMPATIBLE BRAND EMBLEM BADGE
// ==========================================
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
  gradientFrom,
  gradientTo,
  glow = false,
}) => {
  const lower = letters.toLowerCase();
  const isOneTap = lower === 'ot';
  const isTap = lower === 'ts';
  const isMediaFlow = lower === 'ms' || lower === 'mf';

  const defaultFrom = isOneTap
    ? '#E11D48'
    : isTap
    ? '#06B6D4'
    : isMediaFlow
    ? '#0066EE'
    : '#1E1E24';
  const defaultTo = isOneTap
    ? '#9F1239'
    : isTap
    ? '#4F46E5'
    : isMediaFlow
    ? '#003399'
    : '#121216';
  const fromColor = gradientFrom || defaultFrom;
  const toColor = gradientTo || defaultTo;
  const shadowColor = isOneTap
    ? 'rgba(225, 29, 72, 0.45)'
    : isTap
    ? 'rgba(6, 182, 212, 0.45)'
    : isMediaFlow
    ? 'rgba(0, 102, 238, 0.45)'
    : 'rgba(0, 0, 0, 0.55)';

  if (lower === 'an') {
    return (
      <div
        className={`shrink-0 select-none ${className}`}
        style={{
          width: size,
          height: size,
          filter: glow ? `drop-shadow(0 8px 24px rgba(255, 19, 65, 0.45))` : undefined,
        }}
      >
        <MasterLogoAssembly progress={100} size={size} interactiveTilt={false} />
      </div>
    );
  }

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
          <linearGradient
            id={`emblemGrad_${letters}`}
            x1="0"
            y1="0"
            x2="100"
            y2="100"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor={fromColor} />
            <stop offset="100%" stopColor={toColor} />
          </linearGradient>
          <radialGradient
            id={`emblemGlow_${letters}`}
            cx="25"
            cy="25"
            r="60"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>
        <rect width="100" height="100" rx="22" fill={`url(#emblemGrad_${letters})`} />
        <rect width="100" height="100" rx="22" fill={`url(#emblemGlow_${letters})`} />
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

// ==========================================
// INITIALIZATION STEPS & STATISTICAL TELEMETRY
// ==========================================
const getInitializationSteps = (name: string = '') => {
  const lower = name.toLowerCase();
  if (lower.includes('one tap') || lower.includes('onetap')) {
    return [
      'Allocating Direct3D 12 GPU Hardware Buffers...',
      'Probing high-speed NVMe media ingestion buses...',
      'Mounting sequential batch rendering engine...',
      'Calibrating Premiere Pro & After Effects CEP bridges...',
      'Synchronizing Anything Ecosystem microservices...',
      'Launching One Tap Creative Studio...',
    ];
  }
  if (lower.includes('tap')) {
    return [
      'Initializing Direct3D 12 low-latency driver...',
      'Scanning USB Stream Deck & Macro Devices...',
      'Loading dynamic keymaps & hardware bindings...',
      'Connecting Anything Ecosystem message bus...',
      'Launching Tap Studio...',
    ];
  }
  if (lower.includes('mediaflow')) {
    return [
      'Initializing Direct3D 12 media ingestion pipeline...',
      'Verifying storage volume headroom and I/O threads...',
      'Loading multi-camera sync & PV separation engine...',
      'Syncing with Anything Ecosystem...',
      'Launching MediaFlow Studio...',
    ];
  }
  return [
    'Initializing Direct3D 12 GPU hardware pipeline...',
    'Calibrating Creative Spectrum layout matrix...',
    'Mounting Spatial Documents & Cloud assets engine...',
    'Synchronizing child app registry (15/15 nodes)...',
    'Restoring multi-window workspace topology...',
    'Executing Anything Master Creative Suite...',
  ];
};

const getDiagnosticHexAddress = (p: number) => {
  if (p < 20) return '[0x7FFE04] D3D12 GPU Pipeline Allocated';
  if (p < 40) return '[0x7FFE1A] Spectrum Color Core & Shader Cache Verified';
  if (p < 60) return '[0x7FFE2E] Spatial Asset Engine & Virtual I/O Active';
  if (p < 80) return '[0x7FFE45] Keystone Apex Delta Bus · 15 Nodes Online';
  if (p < 95) return '[0x7FFE5C] Release Channel Handshake Complete';
  return '[0x7FFE70] Workspace State Restored · Executing Launch';
};

// ==========================================
// MASTER ADOBE SPLASH SCREEN COMPONENT
// ==========================================
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
  const [audioMuted, setAudioMuted] = useState(!splashAudio.enabled);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  const soundFiredRef = useRef({ forge: false, ascend: false, lock: false, monogram: false });

  // Sound triggering synchronized with progress milestones
  useEffect(() => {
    if (progress >= 5 && !soundFiredRef.current.forge) {
      soundFiredRef.current.forge = true;
      splashAudio.play('forge');
    }
    if (progress >= 52 && !soundFiredRef.current.ascend) {
      soundFiredRef.current.ascend = true;
      splashAudio.play('ascend');
    }
    if (progress >= 80 && !soundFiredRef.current.lock) {
      soundFiredRef.current.lock = true;
      splashAudio.play('lock');
    }
    if (progress >= 88 && !soundFiredRef.current.monogram) {
      soundFiredRef.current.monogram = true;
      splashAudio.play('monogram');
    }
  }, [progress]);

  // Main loading progress timer loop
  useEffect(() => {
    if (!isOpen) {
      setProgress(0);
      setCurrentStepIndex(0);
      setIsFadingOut(false);
      soundFiredRef.current = { forge: false, ascend: false, lock: false, monogram: false };
      return;
    }

    const isDev = typeof window !== 'undefined' && (
      window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.port === '5173'
    );
    const duration = isDev ? 450 : (settings.durationMs ? Math.min(settings.durationMs, 1000) : 850);
    const intervalTime = 20;
    const totalSteps = Math.max(10, duration / intervalTime);
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

        setTimeout(() => {
          setIsFadingOut(true);
          setTimeout(() => {
            onCompleteRef.current?.();
          }, isDev ? 80 : 180);
        }, isDev ? 60 : 120);
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
  }, [isOpen, settings.durationMs, settings.productName]);

  const toggleSound = () => {
    const next = !splashAudio.enabled;
    splashAudio.setEnabled(next);
    setAudioMuted(!next);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const nx = (e.clientX - rect.left) / rect.width - 0.5;
    const ny = (e.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: -ny * 10, y: nx * 10 });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  if (!isOpen) return null;

  const stepsList = getInitializationSteps(settings.productName);
  const isMasterAnything =
    !settings.productName ||
    settings.productName.toLowerCase() === 'anything' ||
    (settings.logoText || '').toLowerCase() === 'an';

  const emblemLetters =
    settings.logoText ||
    (settings.productName?.toLowerCase().includes('one tap') ||
    settings.productName?.toLowerCase().includes('onetap')
      ? 'Ot'
      : settings.productName?.toLowerCase().includes('tap')
      ? 'Ts'
      : settings.productName?.toLowerCase().includes('mediaflow')
      ? 'Ms'
      : settings.productName?.slice(0, 2) || 'An');

  // Dynamic Statistical Gauges
  const statCore = Math.min(100, Math.round(progress * 1.2));
  const statVram = Math.min(100, Math.round(progress * 1.12));
  const statCache = Math.min(100, Math.round(progress * 1.05));
  const statNet = Math.round(progress);
  const dynamicMem = Math.round(180 + progress * 2.8);
  const dynamicLatency = (0.6 + Math.sin(progress * 0.1) * 0.2 + 0.2).toFixed(1);

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center select-none transition-all duration-300 ${
        isStandaloneSplash
          ? 'bg-transparent p-0 m-0'
          : isBootScreen
          ? 'bg-[#0A0A0E]'
          : 'bg-black/85 backdrop-blur-md p-4'
      } ${
        isFadingOut
          ? 'opacity-0 scale-[0.985] pointer-events-none'
          : 'opacity-100 scale-100'
      }`}
      onClick={(e) => {
        if (isPreview && e.target === e.currentTarget) {
          onComplete();
        }
      }}
    >
      {/* Precision 740x480 Obsidian Studio Command Window */}
      <div
        className="w-[740px] h-[480px] max-w-[740px] max-h-[480px] rounded-2xl overflow-hidden bg-[#0C0D12] border border-[#262730] flex flex-col relative transition-transform duration-200 shadow-2xl select-none"
        style={{
          boxShadow:
            '0 32px 100px -15px rgba(0, 0, 0, 0.95), 0 0 50px -10px rgba(218, 24, 132, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
          transform: `perspective(1000px) rotateX(${tilt.x.toFixed(1)}deg) rotateY(${tilt.y.toFixed(1)}deg)`,
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        {/* ============================================================== */}
        {/* UPPER HERO CANVAS: 1:1 Kinetic Logo + Statistical HUD Matrix  */}
        {/* ============================================================== */}
        <div
          className="relative h-[335px] w-full overflow-hidden bg-gradient-to-b from-[#13141C] via-[#0E0F16] to-[#0A0B10] p-6 flex flex-col justify-between"
          style={isStandaloneSplash ? ({ WebkitAppRegion: 'drag' } as React.CSSProperties) : undefined}
        >
          {/* Ambient Spectrum Caustics Glow Behind Logo */}
          <div className="absolute -top-24 -left-24 w-72 h-72 rounded-full bg-gradient-to-br from-[#DA1884]/20 via-[#FF1341]/15 to-transparent blur-[80px] pointer-events-none" />
          <div className="absolute top-1/2 left-1/3 w-80 h-80 rounded-full bg-gradient-to-tr from-[#FF8A00]/15 via-[#38bdf8]/10 to-transparent blur-[90px] pointer-events-none" />

          {/* Optional Background Artwork with High-Tech Readability Tint */}
          {settings.artworkUrl && (
            <img
              src={settings.artworkUrl}
              alt="Splash Artwork"
              className="absolute inset-0 w-full h-full object-cover filter brightness-[0.22] contrast-[1.1] pointer-events-none mix-blend-screen opacity-40 transition-opacity duration-700"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}

          {/* Top Command Bar: Window Identity & Controls */}
          <div className="relative z-10 flex items-center justify-between pb-2 border-b border-white/[0.06]">
            <div className="flex items-center gap-2 font-mono text-[11px] text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-white font-bold tracking-wider uppercase">
                {settings.productName || 'Anything'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-cyan-400 font-semibold">
                {cleanVersionText(settings.versionText) || 'v2026.10 PRO'}
              </span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400 text-[10px]">Direct3D 12 Engine</span>
            </div>

            {/* Quick Actions (Audio Mute & Fast Skip) */}
            <div
              className="flex items-center gap-2"
              style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
            >
              <button
                onClick={toggleSound}
                className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                title={audioMuted ? 'Unmute Sound FX' : 'Mute Sound FX'}
              >
                {audioMuted ? (
                  <VolumeX className="w-3.5 h-3.5 text-slate-400" />
                ) : (
                  <Volume2 className="w-3.5 h-3.5 text-cyan-400" />
                )}
              </button>

              {isPreview ? (
                <button
                  onClick={onComplete}
                  className="w-7 h-7 rounded-lg bg-white/[0.05] hover:bg-rose-500/20 border border-white/10 text-slate-300 hover:text-white flex items-center justify-center transition-all"
                  title="Close Preview"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={onComplete}
                  className="text-[10px] font-mono font-medium text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 transition-all hover:scale-105"
                >
                  Skip ➔
                </button>
              )}
            </div>
          </div>

          {/* Center Stage: Kinetic Logo Assembly + Statistical HUD Matrix */}
          <div className="relative z-10 grid grid-cols-12 gap-5 items-center my-auto">
            {/* Left 5 Cols: The 1:1 Master Animated Emblem */}
            <div className="col-span-4 flex flex-col items-center justify-center relative">
              {isMasterAnything ? (
                <MasterLogoAssembly progress={progress} size={152} interactiveTilt={false} />
              ) : (
                <AnythingBrandEmblem
                  size={120}
                  letters={emblemLetters}
                  className="transition-transform duration-200 hover:scale-105"
                  glow={true}
                />
              )}
            </div>

            {/* Right 8 Cols: Statistical Telemetry Command Matrix */}
            <div className="col-span-8 flex flex-col gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-black text-white tracking-tight drop-shadow-sm">
                    {settings.productName || 'Anything Creative Suite'}
                  </h1>
                </div>
                <p className="text-xs text-slate-400 font-medium mt-0.5">
                  {settings.tagline || 'Universal Creative Ecosystem & High-Speed Media Pipeline'}
                </p>
              </div>

              {/* Statistical Telemetry Grid (4 Live Hardware Gauges) */}
              <div className="grid grid-cols-2 gap-2 font-mono text-[10px]">
                {/* Metric 1: GPU Allocation */}
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Cpu className="w-3 h-3 text-cyan-400 shrink-0" />
                    <span>GPU DirectPipe</span>
                  </div>
                  <span className="text-white font-bold">{statCore}%</span>
                </div>

                {/* Metric 2: VRAM Allocation */}
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <HardDrive className="w-3 h-3 text-rose-400 shrink-0" />
                    <span>Allocated VRAM</span>
                  </div>
                  <span className="text-white font-bold">{dynamicMem} MB</span>
                </div>

                {/* Metric 3: Bus Latency */}
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <Activity className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>Kernel Bus</span>
                  </div>
                  <span className="text-white font-bold">{dynamicLatency} ms</span>
                </div>

                {/* Metric 4: Microservices Sync */}
                <div className="p-2 rounded-xl bg-white/[0.03] border border-white/[0.07] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <ShieldCheck className="w-3 h-3 text-amber-400 shrink-0" />
                    <span>Ecosystem Sync</span>
                  </div>
                  <span className="text-white font-bold">15/15 Active</span>
                </div>
              </div>

              {/* Dynamic Hex Telemetry Address Readout */}
              <div className="px-3 py-1.5 rounded-xl bg-black/40 border border-white/[0.06] flex items-center gap-2 font-mono text-[10px] text-slate-300">
                <Terminal className="w-3 h-3 text-rose-400 shrink-0" />
                <span className="truncate">{getDiagnosticHexAddress(progress)}</span>
              </div>
            </div>
          </div>

          {/* Bottom Right of Upper Canvas: Artist Credit Pill */}
          <div className="relative z-10 flex items-center justify-between pt-1 font-mono text-[9px] text-slate-500">
            <span>Direct3D 12 Hardware Accelerated</span>
            <span className="text-slate-400">
              Architect: <strong className="text-white font-semibold">{settings.artistName || 'Burhanuddin Sounasath'}</strong>
            </span>
          </div>
        </div>

        {/* ============================================================== */}
        {/* LOWER CANVAS: Segmented Statistical Progress & Spectrum Loader  */}
        {/* ============================================================== */}
        <div className="h-[145px] p-5 bg-[#090A0E] text-zinc-100 flex flex-col justify-between border-t border-zinc-800/80">
          {/* Main Progress Indicator Line */}
          <div className="flex items-center justify-between text-xs font-mono">
            <div className="flex items-center gap-2 truncate pr-2">
              <Loader2 className="w-3.5 h-3.5 text-rose-500 animate-spin shrink-0" />
              <span className="text-zinc-200 text-[11px] font-medium tracking-wide truncate">
                {stepsList[currentStepIndex] || 'Starting application...'}
              </span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-zinc-500 text-[11px]">System Ready</span>
              <span className="text-xs font-bold text-white px-2 py-0.5 rounded-md bg-gradient-to-r from-rose-500 to-amber-500 shadow-sm shadow-rose-500/20">
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* 4 Statistical Sub-Gauges Bars */}
          <div className="grid grid-cols-4 gap-2 font-mono text-[9px] text-zinc-400">
            <div>
              <div className="flex justify-between mb-0.5">
                <span>CORE</span>
                <span className="text-zinc-200">{statCore}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-cyan-400 rounded-full transition-all duration-75"
                  style={{ width: `${statCore}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-0.5">
                <span>VRAM</span>
                <span className="text-zinc-200">{statVram}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full transition-all duration-75"
                  style={{ width: `${statVram}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-0.5">
                <span>CACHE</span>
                <span className="text-zinc-200">{statCache}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-75"
                  style={{ width: `${statCache}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between mb-0.5">
                <span>ECO BUS</span>
                <span className="text-zinc-200">{statNet}%</span>
              </div>
              <div className="w-full h-1 rounded-full bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-emerald-400 rounded-full transition-all duration-75"
                  style={{ width: `${statNet}%` }}
                />
              </div>
            </div>
          </div>

          {/* Primary Master Glowing Spectrum Loader Bar */}
          <div className="w-full h-2 rounded-full bg-zinc-950 border border-zinc-800 overflow-hidden relative shadow-inner">
            <div
              className="h-full bg-gradient-to-r from-[#DA1884] via-[#FF1341] to-[#FFBA00] rounded-full transition-all duration-75 relative overflow-hidden shadow-[0_0_16px_rgba(255,19,65,0.7)]"
              style={{ width: `${progress}%` }}
            >
              {/* High-speed specular shimmer beam */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
            </div>
          </div>

          {/* Footer Metadata & Legal Status */}
          <div className="flex items-center justify-between text-[9px] text-zinc-500 font-mono pt-1 border-t border-zinc-800/80">
            <span>© 1990–2026 Anything Systems Inc. · All Rights Reserved</span>
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-zinc-400">DirectX 12 Pipeline Ready</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
