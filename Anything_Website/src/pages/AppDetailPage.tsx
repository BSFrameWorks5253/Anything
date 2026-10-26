import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Download, 
  ExternalLink, 
  ShieldCheck, 
  Sparkles, 
  ChevronRight, 
  Eye, 
  PenTool, 
  FileCheck, 
  Layers, 
  Compass, 
  Lock, 
  Sliders, 
  RefreshCw, 
  Shield, 
  FileImage, 
  Cpu, 
  Zap, 
  Terminal, 
  Laptop, 
  HardDrive, 
  Check, 
  Command, 
  ArrowLeft, 
  Share2,
  Bell
} from 'lucide-react';
import { ecosystemApps, type AppData } from '../data/apps';
import { GithubIcon, AdobeIcon, WindowsIcon } from '../components/Icons';
import { DownloadModal } from '../components/DownloadModal';
import { soundFx } from '../utils/audio';

export const AppDetailPage: React.FC = () => {
  const { appId } = useParams<{ appId: string }>();
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // App Simulator State
  const [acroZoom, setAcroZoom] = useState(125);
  const [dxfTheme, setDxfTheme] = useState<'blueprint' | 'monochrome' | 'layers'>('blueprint');
  const [activeCam, setActiveCam] = useState<number>(1);
  const [simulatedToast, setSimulatedToast] = useState<string | null>(null);

  // Find app by ID or default to pdf-master
  const app: AppData = ecosystemApps.find(a => a.id === appId) || ecosystemApps[0];

  const getFeatureIcon = (name: string) => {
    switch (name) {
      case 'Eye': return <Eye className="w-5 h-5" />;
      case 'PenTool': return <PenTool className="w-5 h-5" />;
      case 'FileCheck': return <FileCheck className="w-5 h-5" />;
      case 'Layers': return <Layers className="w-5 h-5" />;
      case 'Compass': return <Compass className="w-5 h-5" />;
      case 'Lock': return <Lock className="w-5 h-5" />;
      case 'Sliders': return <Sliders className="w-5 h-5" />;
      case 'RefreshCw': return <RefreshCw className="w-5 h-5" />;
      case 'Shield': return <Shield className="w-5 h-5" />;
      case 'FileImage': return <FileImage className="w-5 h-5" />;
      case 'Cpu': return <Cpu className="w-5 h-5" />;
      case 'Zap': return <Zap className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  const copyPageUrl = () => {
    soundFx.playClick();
    setCopiedLink(true);
    navigator.clipboard.writeText(window.location.href);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const triggerToastSimulation = () => {
    soundFx.playSuccess();
    setSimulatedToast(`🚀 Update Available: ${app.name} v1.2.0 (Installed: v${app.version})`);
    setTimeout(() => setSimulatedToast(null), 4500);
  };

  return (
    <div className="min-h-screen pt-24 pb-20 overflow-hidden relative">
      {/* Background Glow Mesh matching App Color */}
      <div className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center opacity-30">
        <div 
          className="w-[700px] h-[700px] rounded-full blur-[140px] animate-pulse"
          style={{ backgroundColor: app.accentColor }}
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Breadcrumb Navigation */}
        <div className="flex items-center gap-2 text-xs text-zinc-400 mb-8 font-mono">
          <Link to="/" className="hover:text-white transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <Link to="/apps" className="hover:text-white transition-colors">Applications</Link>
          <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />
          <span className="text-white font-bold">{app.name}</span>
        </div>

        {/* Hero Section */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-10 mb-12 shadow-2xl border-white/10 relative overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* App Info Left */}
            <div className="lg:col-span-7 space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <span className="px-3 py-1 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-zinc-300">
                  {app.category}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono font-bold">
                  v{app.version} · Verified Free
                </span>
                <span className="text-zinc-500 text-xs font-mono">
                  {app.size}
                </span>
              </div>

              <div>
                <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-3">
                  {app.name}
                </h1>
                <p className="text-lg sm:text-xl font-medium text-cyan-300">
                  {app.tagline}
                </p>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed max-w-2xl">
                {app.extendedDescription}
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  onClick={() => {
                    soundFx.playClick();
                    setDownloadModalOpen(true);
                  }}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-extrabold text-sm shadow-xl shadow-rose-500/25 transition-all hover:scale-105"
                >
                  <WindowsIcon className="w-4 h-4" />
                  <Download className="w-4 h-4" />
                  <span>Download Windows Binary (.exe)</span>
                </button>

                <a
                  href={app.releasesUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-5 py-3.5 rounded-2xl liquid-glass hover:bg-white/10 text-white font-semibold text-xs border border-white/10 transition-colors"
                >
                  <GithubIcon className="w-4 h-4" />
                  <span>GitHub Releases</span>
                  <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
                </a>

                <button
                  onClick={copyPageUrl}
                  className="p-3.5 rounded-2xl liquid-glass hover:bg-white/10 text-zinc-300 hover:text-white transition-colors flex items-center gap-1.5 text-xs"
                  title="Share App Link"
                >
                  {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
                  {copiedLink && <span className="text-[11px] text-emerald-400">Copied</span>}
                </button>
              </div>

              {/* Sovereign Guarantee */}
              <div className="flex items-center gap-4 pt-4 border-t border-white/10 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-1.5 text-emerald-400">
                  <ShieldCheck className="w-4 h-4" />
                  <span>100% Client-Side Sandbox</span>
                </div>
                <span>•</span>
                <span>Zero Telemetry</span>
                <span>•</span>
                <span>Direct3D 11 GPU Accelerated</span>
              </div>
            </div>

            {/* App Emblem / Card Right */}
            <div className="lg:col-span-5 flex justify-center">
              <motion.div 
                whileHover={{ scale: 1.03, rotate: 1 }}
                className="w-full max-w-sm liquid-glass-bright rounded-3xl p-6 border border-white/20 shadow-2xl relative flex flex-col items-center text-center space-y-5"
              >
                <div className={`w-28 h-28 rounded-3xl bg-gradient-to-tr ${app.gradient} flex items-center justify-center text-white text-4xl font-black shadow-2xl shadow-rose-500/30 p-2 relative overflow-hidden group`}>
                  {app.logoImg ? (
                    <img 
                      src={app.logoImg} 
                      alt={app.name} 
                      className="w-full h-full object-contain filter drop-shadow-md group-hover:scale-110 transition-transform duration-300" 
                    />
                  ) : (
                    app.shortName
                  )}
                </div>

                <div>
                  <h3 className="text-xl font-bold text-white">{app.name}</h3>
                  <span className="text-xs font-mono text-zinc-400">
                    Engineered by {app.author}
                  </span>
                </div>

                <div className="w-full p-4 rounded-2xl bg-black/40 border border-white/5 text-left space-y-2 text-xs">
                  <div className="flex justify-between text-zinc-400">
                    <span>Executable:</span>
                    <span className="font-mono text-zinc-200">{app.directDownloadName}</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>License:</span>
                    <span className="font-mono text-emerald-400 font-bold">$0.00 Free Forever</span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Platform:</span>
                    <span className="font-mono text-zinc-200">Windows 10 / 11 64-bit</span>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        {/* --- INTERACTIVE APPLICATION SIMULATOR LAB --- */}
        <section className="mb-16">
          <div className="liquid-glass rounded-3xl p-6 sm:p-8 border border-white/15 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold block mb-1">
                  Interactive Application Laboratory
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-white">
                  Live {app.name} Feature Workspace
                </h3>
              </div>
              <span className="px-3 py-1 rounded-full bg-white/10 font-mono text-xs text-zinc-300">
                Direct3D 11 Render Pipeline
              </span>
            </div>

            {/* SIMULATOR 1: ACROFLOW (PDF MASTER) */}
            {app.id === 'pdf-master' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs bg-white/5 p-3 rounded-2xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <span className="text-zinc-400">Zoom Canvas:</span>
                    <button 
                      onClick={() => setAcroZoom(Math.max(75, acroZoom - 25))}
                      className="px-2.5 py-1 rounded bg-white/10 text-white font-mono"
                    >
                      -
                    </button>
                    <span className="font-mono text-cyan-400 font-bold">{acroZoom}%</span>
                    <button 
                      onClick={() => setAcroZoom(Math.min(300, acroZoom + 25))}
                      className="px-2.5 py-1 rounded bg-white/10 text-white font-mono"
                    >
                      +
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[11px]">
                      Continuous Scroll 120 FPS
                    </span>
                  </div>
                </div>

                <div className="h-72 bg-[#09090d] rounded-2xl border border-white/10 p-4 overflow-y-auto flex flex-col items-center">
                  <div 
                    className="w-full max-w-xl bg-white/5 p-6 rounded-xl border border-white/10 space-y-4 shadow-xl transition-all duration-200"
                    style={{ transform: `scale(${acroZoom / 100})`, transformOrigin: 'top center' }}
                  >
                    <div className="flex justify-between border-b border-white/10 pb-3">
                      <span className="font-bold text-white text-sm">AcroFlow Studio Pro — Master Contract</span>
                      <span className="font-mono text-xs text-rose-400">Page 1 of 12</span>
                    </div>
                    <div className="space-y-2 text-xs text-zinc-300 font-mono">
                      <p className="bg-rose-500/20 p-2 rounded text-rose-200">
                        [Highlighted Text]: All proprietary Acrobat licenses are permanently revoked in favor of open desktop freedom.
                      </p>
                      <p className="text-zinc-400">
                        Zero server transmission. Memory-mapped I/O guarantees instant document navigation even on multi-gigabyte blueprints.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                      <span className="font-serif italic text-rose-400 text-lg">Burhanuddin Sounasath</span>
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                        Digitally Signed
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 2: DOCUFLOW (CAD BLUEPRINT) */}
            {app.id === 'docuflow-studio' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs bg-white/5 p-3 rounded-2xl border border-white/5">
                  <span className="text-zinc-400">Blueprint DXF Color Theme:</span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setDxfTheme('blueprint')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all ${dxfTheme === 'blueprint' ? 'bg-blue-600 text-white' : 'bg-white/10 text-zinc-400'}`}
                    >
                      Architectural Blueprint
                    </button>
                    <button
                      onClick={() => setDxfTheme('monochrome')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all ${dxfTheme === 'monochrome' ? 'bg-zinc-800 text-white' : 'bg-white/10 text-zinc-400'}`}
                    >
                      Monochrome Dark
                    </button>
                    <button
                      onClick={() => setDxfTheme('layers')}
                      className={`px-3 py-1 rounded-xl font-bold transition-all ${dxfTheme === 'layers' ? 'bg-cyan-600 text-white' : 'bg-white/10 text-zinc-400'}`}
                    >
                      Layer Colors
                    </button>
                  </div>
                </div>

                <div 
                  className={`h-72 rounded-2xl border border-white/15 p-6 flex flex-col justify-between transition-colors ${
                    dxfTheme === 'blueprint' ? 'bg-[#002244]' : dxfTheme === 'monochrome' ? 'bg-[#121216]' : 'bg-[#0d1b2a]'
                  }`}
                >
                  <div className="flex justify-between items-start text-xs font-mono">
                    <span className="text-cyan-300 font-bold">STRUCTURAL_TOWER_LVL4.DXF (A1 Sheet Vector)</span>
                    <span className="text-white/60">Scale: 1:50 · Layers: 16 Active</span>
                  </div>

                  {/* Simulated Blueprint Vector Grid */}
                  <div className="border border-white/20 h-44 rounded-xl flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px]" />
                    <div className="relative text-center font-mono text-xs text-white/80 space-y-1">
                      <Compass className="w-8 h-8 text-cyan-400 mx-auto animate-spin duration-3000" />
                      <p className="font-bold">AutoCAD DXF Vector Entities Parsed (Sub-pixel Precision)</p>
                      <span className="text-[10px] text-cyan-300">Direct DXF &rarr; PDF Export Ready</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* SIMULATOR 3: MEDIAFLOW */}
            {app.id === 'mediaflow-studio' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs bg-white/5 p-3 rounded-2xl border border-white/5">
                  <span className="text-zinc-400">Multi-Camera Angle Monitor:</span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4].map(num => (
                      <button
                        key={num}
                        onClick={() => setActiveCam(num)}
                        className={`px-3 py-1 rounded-xl font-bold text-xs ${activeCam === num ? 'bg-blue-600 text-white' : 'bg-white/10 text-zinc-400'}`}
                      >
                        Cam 0{num}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 h-72">
                  {[1, 2, 3, 4].map(cam => (
                    <div
                      key={cam}
                      onClick={() => setActiveCam(cam)}
                      className={`rounded-2xl border p-3 flex flex-col justify-between cursor-pointer transition-all ${
                        activeCam === cam 
                          ? 'border-blue-500 bg-blue-500/10 shadow-lg' 
                          : 'border-white/10 bg-black/40 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <div className="flex justify-between text-[11px] font-mono">
                        <span className="text-white font-bold">ANGLE 0{cam} (4K 60FPS)</span>
                        <span className={`w-2 h-2 rounded-full ${activeCam === cam ? 'bg-red-500 animate-ping' : 'bg-zinc-600'}`} />
                      </div>
                      <div className="text-center font-mono text-xs text-zinc-400">
                        PV Separation Track #{cam}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SIMULATOR 4: ANYTHING HUB TOAST NOTIFICATION */}
            {app.id === 'anything-hub' && (
              <div className="p-6 rounded-2xl bg-white/5 border border-white/10 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div>
                  <h4 className="text-base font-bold text-white mb-1">
                    Simulate Windows Action Center Native Toast
                  </h4>
                  <p className="text-xs text-zinc-400">
                    Test the official Windows 10/11 notification chime dispatched when Anything detects GitHub releases.
                  </p>
                </div>

                <button
                  onClick={triggerToastSimulation}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 text-slate-950 font-bold text-xs flex items-center gap-2 shadow-lg shadow-emerald-500/20 shrink-0"
                >
                  <Bell className="w-4 h-4" />
                  <span>Dispatch Windows Toast</span>
                </button>
              </div>
            )}
          </div>
        </section>

        {/* Simulated Windows 11 Toast Notification Banner */}
        {simulatedToast && (
          <div className="fixed bottom-6 right-6 z-50 liquid-glass-bright p-4 rounded-2xl border border-cyan-500/40 shadow-2xl max-w-sm animate-in slide-in-from-bottom-4 duration-200">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-amber-500 flex items-center justify-center font-bold text-white text-xs shrink-0">
                An
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-xs font-bold text-white block">Windows Action Center</span>
                <p className="text-[11px] text-zinc-300 font-medium mt-0.5">{simulatedToast}</p>
                <span className="text-[9px] text-cyan-400 font-mono mt-1 block">appUserModelId: com.burhanuddin.anything</span>
              </div>
            </div>
          </div>
        )}

        {/* Detailed Features Grid */}
        <section className="mb-16">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white mb-3">
              Core Architectural Pillars
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400">
              Built from scratch with zero compromises. High-DPI canvas rendering, offline execution, and frictionless usability.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {app.detailedFeatures.map((feat, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.08 }}
                className="liquid-glass p-6 rounded-3xl border border-white/10 flex flex-col justify-between gap-4 group hover:border-white/25 transition-all"
              >
                <div className="space-y-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-rose-400 group-hover:scale-110 group-hover:bg-rose-500/10 transition-all">
                    {getFeatureIcon(feat.iconName)}
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    {feat.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-white/5 flex items-center gap-1.5 text-[10px] text-zinc-500 font-mono">
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Verified Native Support</span>
                </div>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Adobe Counterpart Comparison Box */}
        <section className="mb-16">
          <div className="liquid-glass-bright rounded-3xl p-6 sm:p-10 border border-rose-500/20 shadow-2xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                  <AdobeIcon className="w-3.5 h-3.5" />
                  <span>Why It Beats The Adobe Equivalent</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-white">
                  {app.vsAdobe.adobeEquivalent}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  Adobe charges <strong className="text-red-400">{app.vsAdobe.adobeCost}</strong> for locked down software that sends your files to their cloud servers. {app.name} is <strong className="text-emerald-400">{app.vsAdobe.anythingCost}</strong>.
                </p>

                <div className="space-y-2 pt-2">
                  {app.vsAdobe.keyDifferences.map((diff, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{diff}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Benchmarks Matrix */}
              <div className="lg:col-span-7 bg-[#09090d] rounded-2xl p-5 border border-white/10 space-y-4">
                <span className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono block">
                  Measured Performance & Cost Benchmark:
                </span>
                
                <div className="space-y-3">
                  {app.benchmarks.map((bench, idx) => (
                    <div 
                      key={idx}
                      className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between text-xs"
                    >
                      <span className="font-semibold text-zinc-300">{bench.metric}</span>
                      <div className="flex items-center gap-4">
                        <span className="font-mono text-zinc-500 line-through">{bench.adobeVal}</span>
                        <span className="font-mono text-emerald-400 font-bold">{bench.anythingVal}</span>
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
                          {bench.advantage}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* System Specs & Keyboard Shortcuts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {/* Shortcuts */}
          <div className="liquid-glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-amber-400">
                <Command className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">Keyboard Accelerators</h3>
                <span className="text-[11px] text-zinc-400">Productivity shortcuts for instant power usage</span>
              </div>
            </div>

            <div className="space-y-2.5">
              {app.shortcuts.map((sc, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between p-2.5 rounded-xl bg-white/5 border border-white/5 text-xs"
                >
                  <span className="text-zinc-300">{sc.action}</span>
                  <kbd className="px-2.5 py-1 rounded-lg bg-black/60 border border-white/15 font-mono text-cyan-300 text-[11px] shadow-inner">
                    {sc.key}
                  </kbd>
                </div>
              ))}
            </div>
          </div>

          {/* System Requirements */}
          <div className="liquid-glass p-6 sm:p-8 rounded-3xl border border-white/10 space-y-5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cyan-400">
                <Laptop className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white">System Requirements</h3>
                <span className="text-[11px] text-zinc-400">Engineered for lightweight, zero-latency execution</span>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Laptop className="w-4 h-4 text-zinc-500" />
                  <span>Operating System:</span>
                </span>
                <span className="font-mono text-zinc-200 font-semibold">{app.systemRequirements.os}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-zinc-500" />
                  <span>System Memory:</span>
                </span>
                <span className="font-mono text-zinc-200 font-semibold">{app.systemRequirements.ram}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-zinc-400 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-zinc-500" />
                  <span>GPU Acceleration:</span>
                </span>
                <span className="font-mono text-zinc-200 font-semibold">{app.systemRequirements.gpu}</span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/5">
                <span className="text-zinc-400 flex items-center gap-2">
                  <HardDrive className="w-4 h-4 text-zinc-500" />
                  <span>Storage Footprint:</span>
                </span>
                <span className="font-mono text-zinc-200 font-semibold">{app.systemRequirements.storage}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Changelog & Release Notes */}
        <div className="liquid-glass p-6 sm:p-8 rounded-3xl border border-white/10 mb-16">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span>Release History & Changelog</span>
          </h3>

          <div className="space-y-2 text-xs font-mono text-zinc-400">
            {app.changelog.map((log, idx) => (
              <div key={idx} className="flex items-start gap-2 p-2 rounded-lg hover:bg-white/5 transition-colors">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                <span className="leading-relaxed">{log}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation between apps */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-8 border-t border-white/10">
          <Link
            to="/apps"
            className="flex items-center gap-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Applications</span>
          </Link>

          <button
            onClick={() => setDownloadModalOpen(true)}
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-amber-500 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/20"
          >
            <Download className="w-4 h-4" />
            <span>Download {app.name} Now</span>
          </button>
        </div>
      </div>

      {/* Download Modal */}
      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        selectedAppId={app.id}
      />
    </div>
  );
};
