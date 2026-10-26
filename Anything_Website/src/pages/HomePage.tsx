import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Download, 
  ArrowRight, 
  Sparkles, 
  Layers, 
  RefreshCw, 
  Sliders, 
  ChevronRight,
  FileCheck
} from 'lucide-react';
import { ParallaxHero } from '../components/ParallaxHero';
import { FormatMarquee } from '../components/FormatMarquee';
import { ParallaxStoryTimeline } from '../components/ParallaxStoryTimeline';
import { RealPdfStudio } from '../components/RealPdfStudio';
import { InteractiveAcrobatTools } from '../components/InteractiveAcrobatTools';
import { AdobeSavingsCalculator } from '../components/AdobeSavingsCalculator';
import { AcrobatComparison } from '../components/AcrobatComparison';
import { DownloadModal } from '../components/DownloadModal';
import { ecosystemApps } from '../data/apps';
import { WindowsIcon, GithubIcon } from '../components/Icons';
import { soundFx } from '../utils/audio';

export const HomePage: React.FC = () => {
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [activeDownloadAppId, setActiveDownloadAppId] = useState('anything-hub');

  const openDownload = (appId: string = 'anything-hub') => {
    setActiveDownloadAppId(appId);
    setDownloadModalOpen(true);
    soundFx.playClick();
  };

  return (
    <div className="min-h-screen overflow-hidden">
      {/* 1. Multi-Plane Parallax Hero */}
      <ParallaxHero onOpenDownloadModal={() => openDownload('anything-hub')} />

      {/* 2. Supported Formats Infinite Ribbon */}
      <FormatMarquee />

      {/* 3. Acrobat Quick Tools Horizontal Navigation Strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 my-12 relative z-20">
        <div className="liquid-glass rounded-2xl p-3 sm:p-4 border-white/10 shadow-2xl flex items-center justify-between gap-3 overflow-x-auto text-xs">
          <div className="flex items-center gap-2 text-zinc-400 font-mono text-[11px] whitespace-nowrap pl-2">
            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
            <span>Free Acrobat Tools:</span>
          </div>

          <div className="flex items-center gap-2">
            <a
              href="#real-pdf-studio"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/30 text-rose-300 font-bold transition-colors whitespace-nowrap"
            >
              <FileCheck className="w-3.5 h-3.5 text-rose-400" />
              <span>Real PDF Creator & Signer</span>
            </a>

            <a
              href="#interactive-tools"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors whitespace-nowrap"
            >
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Visual Split & Reorder</span>
            </a>

            <a
              href="#interactive-tools"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
              <span>Smart Compressor</span>
            </a>

            <a
              href="#interactive-tools"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-colors whitespace-nowrap"
            >
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span>Universal Fusion</span>
            </a>

            <Link
              to="/tools"
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10 text-white font-bold transition-all hover:bg-white/20 whitespace-nowrap"
            >
              <span>All Online Tools</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </section>

      {/* 4. Real Working In-Browser PDF Studio */}
      <section id="real-pdf-studio" className="max-w-7xl mx-auto px-4 sm:px-6 py-12 scroll-mt-24">
        <RealPdfStudio />
      </section>

      {/* 5. Apple / Adobe Parallax Interactive Chapter Narrative */}
      <ParallaxStoryTimeline />

      {/* 6. Interactive In-Browser Acrobat Tools Suite */}
      <InteractiveAcrobatTools />

      {/* 7. Adobe Tax / Team Savings Calculator */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <AdobeSavingsCalculator />
      </section>

      {/* 8. Complete Ecosystem Apps Showcase with 3D Tilt Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Full Suite Roster</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Ecosystem Applications
            </h2>
            <p className="text-sm text-zinc-400 mt-2">
              Standalone Windows executables synchronized through the Anything desktop hub.
            </p>
          </div>

          <Link
            to="/apps"
            className="flex items-center gap-2 text-xs font-bold text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <span>View All Specs & Binaries</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {ecosystemApps.map((app, idx) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.08 }}
              whileHover={{ y: -6 }}
              className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between gap-6 group hover:border-white/30 transition-all shadow-xl relative overflow-hidden"
            >
              <div 
                className="absolute -top-20 -right-20 w-44 h-44 rounded-full blur-3xl opacity-20 pointer-events-none group-hover:opacity-40 transition-opacity"
                style={{ backgroundColor: app.accentColor }}
              />

              <div className="space-y-4 relative z-10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${app.gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg p-1.5`}>
                      {app.logoImg ? (
                        <img src={app.logoImg} alt={app.name} className="w-full h-full object-contain filter drop-shadow" />
                      ) : (
                        app.shortName
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {app.name}
                      </h3>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        v{app.version} · {app.size}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    Free
                  </span>
                </div>

                <p className="text-xs text-zinc-300 leading-relaxed">
                  {app.description}
                </p>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  {app.features.slice(0, 3).map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2 text-xs text-zinc-400">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3 relative z-10">
                <Link
                  to={`/apps/${app.id}`}
                  className="text-xs font-bold text-white hover:text-cyan-400 flex items-center gap-1 transition-colors"
                >
                  <span>Learn More</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => openDownload(app.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .EXE</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 9. Acrobat vs Anything Parallax Matrix */}
      <AcrobatComparison />

      {/* 10. Creator Manifesto & Philosophy of Free Software */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
        <div className="liquid-glass-bright rounded-3xl p-8 sm:p-12 border border-white/15 relative overflow-hidden text-center space-y-6">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 mx-auto flex items-center justify-center font-black text-white text-2xl shadow-xl shadow-red-500/30">
            An
          </div>

          <h3 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            "Documents Should Belong to the People Who Create Them."
          </h3>

          <p className="text-sm sm:text-base text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            We believe that basic everyday digital rights — reading, editing, organizing, and digitally signing your own PDF documents — should never be locked behind a $20/month subscription toll booth. Anything was engineered in 2026 to bring professional creative and document mastery to everyone without strings attached.
          </p>

          <div className="pt-4 flex flex-col items-center">
            <span className="text-sm font-bold text-white">Burhanuddin Sounasath</span>
            <span className="text-xs font-mono text-zinc-400">Chief Architect & Engineer · Anything Creative Ecosystem</span>
          </div>

          <div className="pt-6 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => openDownload('anything-hub')}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-rose-500 via-red-600 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-extrabold text-sm shadow-xl shadow-red-500/30 transition-all hover:scale-105 flex items-center gap-2"
            >
              <WindowsIcon className="w-4 h-4" />
              <span>Download Anything Hub 2026</span>
            </button>

            <a
              href="https://github.com/BSFrameWorks5253/Anything"
              target="_blank"
              rel="noopener noreferrer"
              className="px-6 py-4 rounded-2xl liquid-glass hover:bg-white/10 text-white font-semibold text-xs border border-white/10 flex items-center gap-2 transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>Star on GitHub</span>
            </a>
          </div>
        </div>
      </section>

      {/* Download Modal Trigger */}
      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        selectedAppId={activeDownloadAppId}
      />
    </div>
  );
};
