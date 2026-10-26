import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { 
  Download, 
  ArrowRight, 
  Sparkles, 
  FileText, 
  ShieldCheck, 
  Zap, 
  PenTool, 
  Compass, 
  Layers, 
  Lock 
} from 'lucide-react';
import { WindowsIcon, AdobeIcon } from './Icons';

interface ParallaxHeroProps {
  onOpenDownloadModal?: () => void;
}

export const ParallaxHero: React.FC<ParallaxHeroProps> = ({ onOpenDownloadModal }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { scrollY } = useScroll();

  // Smooth springs for parallax motion
  const smoothY = useSpring(scrollY, { stiffness: 100, damping: 30 });

  // Multi-plane parallax translations
  const bgMeshY = useTransform(smoothY, [0, 1000], [0, 300]);
  const heroTextY = useTransform(smoothY, [0, 800], [0, 120]);
  const mockupY = useTransform(smoothY, [0, 1000], [0, -90]);
  const mockupRotateX = useTransform(smoothY, [0, 600], [12, 0]);
  const badge1Y = useTransform(smoothY, [0, 800], [0, -180]);
  const badge2Y = useTransform(smoothY, [0, 800], [0, 140]);
  const badge3Y = useTransform(smoothY, [0, 800], [0, -110]);

  return (
    <section 
      ref={containerRef}
      className="relative min-h-[95vh] pt-28 pb-16 flex flex-col items-center justify-center overflow-hidden perspective-1000"
    >
      {/* Dynamic Parallax Background Orbs */}
      <motion.div 
        style={{ y: bgMeshY }}
        className="absolute inset-0 pointer-events-none -z-10 flex items-center justify-center"
      >
        <div className="w-[680px] h-[680px] rounded-full bg-gradient-to-tr from-rose-600/20 via-red-500/15 to-cyan-500/20 blur-[130px] animate-pulse" />
        <div className="absolute top-12 left-10 w-96 h-96 rounded-full bg-cyan-500/15 blur-[120px]" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-purple-600/15 blur-[120px]" />
      </motion.div>

      {/* Hero Header Content */}
      <motion.div 
        style={{ y: heroTextY }}
        className="max-w-5xl mx-auto px-4 sm:px-6 text-center flex flex-col items-center relative z-10"
      >
        {/* Banner Pill */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full liquid-glass border-rose-500/30 text-rose-300 text-xs font-semibold mb-6 shadow-lg shadow-rose-500/10"
        >
          <AdobeIcon className="w-4 h-4 text-rose-500" />
          <span>The Sovereign Adobe Acrobat & Creative Cloud Alternative</span>
          <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
        </motion.div>

        {/* Main Headline */}
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight max-w-5xl leading-[1.08] mb-6 text-white"
        >
          Adobe Acrobat, Liberated.{' '}
          <span className="text-gradient-acrobat block mt-1">
            Everything is 100% Free Forever.
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-base sm:text-xl text-zinc-300 max-w-3xl mb-8 leading-relaxed font-normal"
        >
          No <span className="line-through text-zinc-500">$239/year</span> Adobe subscription. No cloud paywalls after two pages. No document harvesting. Enjoy native Windows desktop apps with continuous PDF viewing, digital signing, offline OCR, CAD blueprints, and multi-document fusion.
        </motion.p>

        {/* Action Buttons */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-4 mb-12"
        >
          <button
            onClick={() => {
              if (onOpenDownloadModal) {
                onOpenDownloadModal();
              } else {
                window.location.href = '/apps';
              }
            }}
            className="flex items-center gap-2.5 px-7 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-red-600 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-extrabold text-sm shadow-xl shadow-red-500/30 transition-all hover:scale-105"
          >
            <WindowsIcon className="w-4 h-4" />
            <Download className="w-4 h-4" />
            <span>Download Anything Desktop Hub</span>
          </button>

          <a
            href="#interactive-tools"
            className="flex items-center gap-2 px-6 py-4 rounded-2xl liquid-glass hover:bg-white/10 text-white font-semibold text-sm transition-all hover:border-cyan-500/40"
          >
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Try Free Online PDF Tools</span>
            <ArrowRight className="w-4 h-4 text-zinc-400" />
          </a>
        </motion.div>

        {/* Trust Badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-zinc-400 font-mono"
        >
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>100% Offline Sandbox</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Zero Subscription Fees</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>No Account / Login Required</span>
          </div>
        </motion.div>
      </motion.div>

      {/* Parallax 3D Workspace Mockup Container */}
      <motion.div 
        style={{ 
          y: mockupY,
          rotateX: mockupRotateX
        }}
        className="w-full max-w-6xl mx-auto px-4 sm:px-6 mt-12 relative transform-style-preserve-3d"
      >
        {/* Floating Parallax Badges */}
        <motion.div
          style={{ y: badge1Y }}
          className="hidden md:flex absolute -top-8 -left-6 liquid-glass-bright p-3.5 rounded-2xl shadow-2xl items-center gap-3 z-30 border-rose-500/30 animate-bounce duration-1000"
        >
          <div className="w-9 h-9 rounded-xl bg-rose-500 flex items-center justify-center text-white">
            <FileText className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-zinc-400 font-mono uppercase block">AcroFlow Studio</span>
            <span className="text-xs font-bold text-white">Unlimited PDF Editor Active</span>
          </div>
        </motion.div>

        <motion.div
          style={{ y: badge2Y }}
          className="hidden md:flex absolute top-1/2 -right-6 liquid-glass-bright p-3.5 rounded-2xl shadow-2xl items-center gap-3 z-30 border-cyan-500/30"
        >
          <div className="w-9 h-9 rounded-xl bg-cyan-500 flex items-center justify-center text-slate-950">
            <Compass className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-zinc-400 font-mono uppercase block">DocuFlow CAD</span>
            <span className="text-xs font-bold text-white">AutoCAD Vector Blueprint A1</span>
          </div>
        </motion.div>

        <motion.div
          style={{ y: badge3Y }}
          className="hidden md:flex absolute -bottom-6 left-1/4 liquid-glass-bright p-3.5 rounded-2xl shadow-2xl items-center gap-3 z-30 border-amber-500/30"
        >
          <div className="w-9 h-9 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950">
            <Layers className="w-5 h-5" />
          </div>
          <div className="text-left">
            <span className="text-[10px] text-zinc-400 font-mono uppercase block">Multi-Document Fusion</span>
            <span className="text-xs font-bold text-white">Word + Excel + CAD fused in 1s</span>
          </div>
        </motion.div>

        {/* Main Application Window Simulation */}
        <div className="liquid-glass rounded-3xl p-3 sm:p-5 shadow-2xl border-white/15 relative overflow-hidden">
          {/* Window Header Bar */}
          <div className="flex items-center justify-between pb-3 px-2 border-b border-white/10 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="text-[11px] font-mono text-zinc-400 ml-2">
                AcroFlow_Studio_Pro_2026.exe — [Unrestricted Master Document.pdf]
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 rounded-md bg-rose-500/10 text-rose-400 font-mono text-[10px]">
                Direct3D 11 Active
              </span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
                0$ License
              </span>
            </div>
          </div>

          {/* Acrobat-Style Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 bg-white/5 rounded-xl border border-white/5 mb-3 text-xs">
            <div className="flex items-center gap-2">
              <button className="p-1.5 rounded-lg bg-white/10 text-white flex items-center gap-1">
                <FileText className="w-3.5 h-3.5 text-rose-400" />
                <span>Page 1 / 48</span>
              </button>
              <div className="h-4 w-[1px] bg-white/10" />
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-300 flex items-center gap-1">
                <PenTool className="w-3.5 h-3.5 text-cyan-400" />
                <span className="hidden sm:inline">Highlight & Ink</span>
              </button>
              <button className="p-1.5 rounded-lg hover:bg-white/5 text-zinc-300 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">Digital Signature</span>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] text-zinc-500 font-mono">Zoom: 125%</span>
              <button className="px-3 py-1 rounded-lg bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs">
                Export Master PDF
              </button>
            </div>
          </div>

          {/* Window Canvas Layout (Sidebar + Document Viewer) */}
          <div className="grid grid-cols-12 gap-3 h-80 sm:h-96 bg-[#0a0a0f] rounded-2xl p-3 border border-white/5 overflow-hidden">
            {/* Left Thumbnails Strip */}
            <div className="col-span-3 sm:col-span-2 space-y-2 border-r border-white/5 pr-2 overflow-y-hidden">
              <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono block">Pages</span>
              {[1, 2, 3, 4].map(pg => (
                <div 
                  key={pg} 
                  className={`p-1.5 rounded-lg border text-center transition-all ${
                    pg === 1 
                      ? 'border-rose-500/50 bg-rose-500/10' 
                      : 'border-white/5 bg-white/5 opacity-50'
                  }`}
                >
                  <div className="h-14 bg-zinc-900 rounded flex items-center justify-center text-[10px] text-zinc-400 font-mono">
                    Pg {pg}
                  </div>
                </div>
              ))}
            </div>

            {/* Main High-DPI Document Canvas */}
            <div className="col-span-9 sm:col-span-10 bg-white/5 rounded-xl p-4 sm:p-6 flex flex-col justify-between relative overflow-hidden">
              {/* Simulated PDF Document Header */}
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-rose-600 to-amber-500 flex items-center justify-center font-bold text-white text-xs">
                      Ac
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">MASTER ARCHITECTURAL SPECIFICATION & AGREEMENT</h4>
                      <p className="text-[10px] text-zinc-400 font-mono">Confidential Executive Document · Version 2026.1</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 font-mono text-[10px]">
                    AES-256 ENCRYPTED
                  </span>
                </div>

                <div className="space-y-2 text-xs text-zinc-300 font-mono">
                  <p className="bg-rose-500/15 p-2 rounded border border-rose-500/30 text-rose-200">
                    &bull; Clause 1.1: Complete freedom from monthly licensing fees and proprietary vendor lock-in.
                  </p>
                  <p className="text-zinc-400">
                    &bull; Clause 1.2: Client documents are processed in a local sandbox memory space. Zero cloud upload telemetry.
                  </p>
                  <p className="text-zinc-400">
                    &bull; Clause 1.3: AutoCAD DXF vector blueprints render directly with sub-pixel layer precision.
                  </p>
                </div>
              </div>

              {/* Bottom Stamp & Signature Area */}
              <div className="pt-4 border-t border-white/10 flex items-end justify-between">
                <div>
                  <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-mono block">Approved By Creator</span>
                  <div className="font-serif italic text-rose-400 text-lg sm:text-xl">
                    Burhanuddin Sounasath
                  </div>
                </div>

                <div className="p-2 rounded-xl bg-white/5 border border-white/10 text-right">
                  <span className="text-[9px] text-emerald-400 font-mono block">DIGITAL STAMP VERIFIED</span>
                  <span className="text-[10px] text-zinc-400 font-mono">HASH: SHA256-ANYTHING-2026</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
