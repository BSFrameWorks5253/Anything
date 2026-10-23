import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  Play,
  Pause,
  Download,
  Film,
  Camera,
  Activity,
  Cpu,
  Layers,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Sliders,
  Volume2,
} from 'lucide-react';
import type { CatalogApp } from '../../../types/app.types';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import { AppIconRenderer } from './CrazyAppStudio/AppIconRenderer';
import { useTheme } from '../../../context/ThemeContext';

interface AppDemoModalProps {
  app: CatalogApp;
  isOpen: boolean;
  onClose: () => void;
  onInstall: (app: CatalogApp) => void;
  onStartTrial?: (app: CatalogApp) => void;
}

export const AppDemoModal: React.FC<AppDemoModalProps> = ({
  app,
  isOpen,
  onClose,
  onInstall,
  onStartTrial,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [activeTab, setActiveTab] = useState<'simulator' | 'benefits'>('simulator');
  const [isPlaying, setIsPlaying] = useState(true);
  const [activeAngle, setActiveAngle] = useState<'A' | 'B' | 'C' | 'D'>('A');
  const [timelineSecs, setTimelineSecs] = useState(148);
  const [gpuAccelerated, setGpuAccelerated] = useState(true);
  const [simulatedToast, setSimulatedToast] = useState<string | null>(null);
  const [isLaunchingLocalDemo, setIsLaunchingLocalDemo] = useState(false);

  // Auto-increment simulated scrubber when playing
  useEffect(() => {
    if (!isOpen || !isPlaying) return;
    const interval = setInterval(() => {
      setTimelineSecs((prev) => (prev >= 360 ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isOpen, isPlaying]);

  if (!isOpen) return null;

  const formatTimecode = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const frames = Math.floor((totalSeconds * 24) % 24);
    return `00:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
  };

  const handleLaunchLocalDemo = async () => {
    setIsLaunchingLocalDemo(true);
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.launchAppDemo) {
      const res = await electronAPI.launchAppDemo(app);
      if (!res.success) {
        setSimulatedToast(res.error || 'Running in interactive sandbox mode.');
        setTimeout(() => setSimulatedToast(null), 3500);
      }
    } else {
      setSimulatedToast('Demo mode active in browser sandbox.');
      setTimeout(() => setSimulatedToast(null), 3000);
    }
    setIsLaunchingLocalDemo(false);
  };

  const handleActivateTrial = () => {
    if (onStartTrial) {
      onStartTrial(app);
    }
    onClose();
  };

  const isMedia =
    app.category.toLowerCase().includes('media') ||
    app.category.toLowerCase().includes('video') ||
    app.name.toLowerCase().includes('mediaflow');

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-xl animate-fadeIn"
      onClick={onClose}
    >
      <div
        className={`w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border shadow-2xl overflow-hidden relative transition-all ${
          isLight
            ? 'bg-white/95 border-zinc-200 text-zinc-900'
            : 'bg-zinc-950/95 border-white/15 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
        style={{
          boxShadow: `0 25px 60px -15px ${app.glowColor || 'rgba(0, 102, 238, 0.35)'}`,
        }}
      >
        {/* Ambient Top Glow */}
        <div
          className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-48 rounded-full blur-3xl pointer-events-none opacity-40"
          style={{ background: app.glowColor || 'rgba(56, 189, 248, 0.4)' }}
        />

        {/* Modal Header */}
        <div className="p-6 border-b border-zinc-200 dark:border-white/10 flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-1.5 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/40 dark:bg-white/5 shadow-md">
              <AppIconRenderer app={app} size="md" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold tracking-tight">{app.name}</h2>
                <GlassBadge variant="cyan" size="sm" icon={<Sparkles className="w-3 h-3 text-cyan-400" />}>
                  Free Trial & Demo
                </GlassBadge>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">
                {app.category} · v{app.version} · 7-Day Full Feature Evaluation
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-6 pt-3 flex gap-2 border-b border-zinc-200 dark:border-white/10 relative z-10">
          <button
            onClick={() => setActiveTab('simulator')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'simulator'
                ? 'border-cyan-500 text-cyan-500'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </button>
          <button
            onClick={() => setActiveTab('benefits')}
            className={`pb-2.5 px-3 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'benefits'
                ? 'border-cyan-500 text-cyan-500'
                : 'border-transparent text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-300'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Trial Perks & Features</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 relative z-10 custom-scrollbar">
          {simulatedToast && (
            <div className="p-3 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs flex items-center gap-2 animate-fadeIn">
              <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
              <span>{simulatedToast}</span>
            </div>
          )}

          {activeTab === 'simulator' ? (
            <div className="space-y-5">
              {isMedia ? (
                /* Interactive Video / Multi-Camera Simulator for MediaFlow Studio */
                <div className="space-y-4">
                  {/* Virtual Video Viewport */}
                  <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-white/15 shadow-2xl group flex flex-col justify-between p-4">
                    {/* Camera Feed Background Simulation */}
                    <div className="absolute inset-0 bg-gradient-to-tr from-slate-950 via-blue-950/60 to-indigo-950 flex items-center justify-center pointer-events-none">
                      <div className="text-center space-y-2 opacity-60">
                        <Film className="w-12 h-12 text-cyan-400 mx-auto animate-pulse" />
                        <span className="text-xs font-mono tracking-widest uppercase text-cyan-300">
                          {activeAngle === 'A' && 'CAM A: Wide 4K Cinema (Master)'}
                          {activeAngle === 'B' && 'CAM B: 60fps Action Gimbal'}
                          {activeAngle === 'C' && 'CAM C: High Drone Aerial POV'}
                          {activeAngle === 'D' && 'CAM D: Stage Left Telephoto'}
                        </span>
                      </div>
                    </div>

                    {/* Viewport Overlay Controls */}
                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded-md bg-rose-600/80 text-white text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
                          LIVE REC
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-white/15 backdrop-blur-md text-white text-[10px] font-mono">
                          4K UHD · 24.00 fps
                        </span>
                      </div>

                      <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md rounded-lg p-1 border border-white/10 text-xs font-mono">
                        {(['A', 'B', 'C', 'D'] as const).map((angle) => (
                          <button
                            key={angle}
                            onClick={() => setActiveAngle(angle)}
                            className={`px-2 py-0.5 rounded font-bold transition-all ${
                              activeAngle === angle
                                ? 'bg-cyan-500 text-black shadow-xs'
                                : 'text-white/60 hover:text-white'
                            }`}
                          >
                            Angle {angle}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Bottom Playback & Scrubber Controls */}
                    <div className="relative z-10 bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/10 space-y-2">
                      <div className="flex items-center justify-between text-xs font-mono text-zinc-300">
                        <div className="flex items-center gap-3">
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="w-7 h-7 rounded-full bg-cyan-500 text-black flex items-center justify-center hover:scale-105 transition-transform"
                          >
                            {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 fill-current ml-0.5" />}
                          </button>
                          <span>{formatTimecode(timelineSecs)}</span>
                        </div>

                        {/* Interactive Waveform Audio Visualizer */}
                        <div className="hidden sm:flex items-center gap-1 h-4">
                          <Volume2 className="w-3.5 h-3.5 text-zinc-400 mr-1" />
                          {[40, 70, 95, 30, 85, 60, 100, 45, 90, 65, 80, 50].map((h, i) => (
                            <div
                              key={i}
                              className="w-1 bg-cyan-400/80 rounded-full transition-all duration-150"
                              style={{
                                height: isPlaying ? `${Math.max(15, (h * (timelineSecs % 3 + 1)) % 100)}%` : '20%',
                              }}
                            />
                          ))}
                        </div>

                        <span className="text-[11px] text-zinc-400">Total: 00:06:00:00</span>
                      </div>

                      {/* Timeline Scrubber */}
                      <input
                        type="range"
                        min={0}
                        max={360}
                        value={timelineSecs}
                        onChange={(e) => setTimelineSecs(Number(e.target.value))}
                        className="w-full accent-cyan-400 h-1 rounded-full cursor-pointer bg-white/20"
                      />
                    </div>
                  </div>

                  {/* Interactive Quick Features Deck */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        setSimulatedToast('Simulated: Ingested 4 angles in 0.38 seconds via NVENC.');
                        setTimeout(() => setSimulatedToast(null), 3000);
                      }}
                      className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:border-cyan-500/40 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <Camera className="w-4 h-4 text-cyan-500" />
                        <span className="text-[10px] font-mono text-zinc-400">Instant</span>
                      </div>
                      <div className="text-xs font-bold mt-1.5 group-hover:text-cyan-400 transition-colors">
                        Multi-Cam Ingestion
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Simulate 4 camera sync
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setGpuAccelerated(!gpuAccelerated);
                        setSimulatedToast(
                          gpuAccelerated
                            ? 'GPU Acceleration disabled. Running CPU fallback.'
                            : 'Hardware Acceleration Active: DirectX 12 / Direct3D 11.'
                        );
                        setTimeout(() => setSimulatedToast(null), 3000);
                      }}
                      className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:border-cyan-500/40 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <Cpu className="w-4 h-4 text-indigo-500" />
                        <span className="text-[10px] font-mono text-emerald-400">
                          {gpuAccelerated ? 'DX12 ON' : 'OFF'}
                        </span>
                      </div>
                      <div className="text-xs font-bold mt-1.5 group-hover:text-indigo-400 transition-colors">
                        GPU Hardware Engine
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Toggle hardware decoder
                      </div>
                    </button>

                    <button
                      onClick={() => {
                        setSimulatedToast('Simulated: Timeline exported to C:\\Users\\...\\Videos in 4K ProRes.');
                        setTimeout(() => setSimulatedToast(null), 3000);
                      }}
                      className="p-3.5 rounded-xl border border-zinc-200 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:border-cyan-500/40 text-left transition-all group"
                    >
                      <div className="flex items-center justify-between">
                        <Zap className="w-4 h-4 text-amber-500" />
                        <span className="text-[10px] font-mono text-zinc-400">ProRes</span>
                      </div>
                      <div className="text-xs font-bold mt-1.5 group-hover:text-amber-400 transition-colors">
                        Quick Export Render
                      </div>
                      <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                        Test 4K export speed
                      </div>
                    </button>
                  </div>
                </div>
              ) : (
                /* General / Developer Simulator */
                <div className="p-6 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/40 dark:bg-white/5 space-y-4">
                  <div className="flex items-center gap-3">
                    <Sliders className="w-5 h-5 text-cyan-500" />
                    <div>
                      <h4 className="text-sm font-bold">Interactive Sandbox Execution</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">
                        Test macro hotkeys, low-latency event loop, and live Anything loader handoff.
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-black/80 font-mono text-xs text-emerald-400 space-y-1">
                    <div>$ {app.executableName} --demo --trial</div>
                    <div className="text-zinc-500">// Initializing hardware acceleration...</div>
                    <div className="text-zinc-400">✓ Connected to Anything live ecosystem</div>
                    <div className="text-zinc-400">✓ Event bus latency: 0.36ms (SSD Ultra)</div>
                    <div className="text-cyan-400">⚡ Ready for interactive evaluation</div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Trial Benefits Overview */
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  {
                    title: '7-Day Unlimited Access',
                    desc: 'Zero watermarks, zero feature gating. Experience the complete software exactly like the full release.',
                    icon: <Clock className="w-5 h-5 text-cyan-500" />,
                  },
                  {
                    title: 'No Credit Card or Registration',
                    desc: 'Instant one-click evaluation without signing up or entering billing details.',
                    icon: <ShieldCheck className="w-5 h-5 text-emerald-500" />,
                  },
                  {
                    title: 'Synchronized Liquid Glass Loader',
                    desc: 'Integrates with Anything splash screen presets and custom boot phrases.',
                    icon: <Sparkles className="w-5 h-5 text-purple-500" />,
                  },
                  {
                    title: '1-Click Permanent Install',
                    desc: 'Love the app? Keep your settings, media cache, and projects when upgrading to full install.',
                    icon: <Download className="w-5 h-5 text-blue-500" />,
                  },
                ].map((perk, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl border border-zinc-200 dark:border-white/10 bg-white/40 dark:bg-white/5 space-y-2"
                  >
                    <div className="p-2 rounded-xl bg-white/10 w-fit">{perk.icon}</div>
                    <h4 className="text-sm font-bold">{perk.title}</h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">{perk.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Action Footer */}
        <div className="p-6 border-t border-zinc-200 dark:border-white/10 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Ready for Instant Evaluation</span>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <GlassButton
              variant="glass"
              size="sm"
              icon={<Play className="w-3.5 h-3.5 fill-current" />}
              onClick={handleLaunchLocalDemo}
              disabled={isLaunchingLocalDemo}
            >
              {isLaunchingLocalDemo ? 'Launching...' : 'Run Local Demo'}
            </GlassButton>

            <GlassButton
              variant="accent"
              size="sm"
              icon={<Sparkles className="w-3.5 h-3.5" />}
              onClick={handleActivateTrial}
            >
              Start 7-Day Trial
            </GlassButton>

            <GlassButton
              variant="primary"
              size="sm"
              icon={<Download className="w-3.5 h-3.5" />}
              onClick={() => {
                onInstall(app);
                onClose();
              }}
              className="font-bold"
            >
              Install Full Version
            </GlassButton>
          </div>
        </div>
      </div>
    </div>
  );
};
