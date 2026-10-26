import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Unlock, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Compass, 
  ArrowRight 
} from 'lucide-react';
import { soundFx } from '../utils/audio';

export const ParallaxStoryTimeline: React.FC = () => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 'freedom',
      badge: 'Chapter 01 · Liberation',
      title: 'The Death of the Adobe Subscription Paywall',
      description: 'PDF is an open ISO standard created over 30 years ago. Yet Adobe locks simple actions behind $239/year recurring fees. Anything dismantles this toll booth permanently.',
      icon: <Unlock className="w-6 h-6 text-emerald-400" />,
      accentColor: '#10b981',
      gradient: 'from-emerald-500/20 via-teal-500/10 to-transparent',
      preview: {
        tag: 'Adobe Paywall Neutralized',
        stats: 'Cost: $0.00 Forever · Unlimited Pages',
        quote: 'No credit card required. No 7-day trials. Pure software sovereignty.'
      }
    },
    {
      id: 'cad',
      badge: 'Chapter 02 · Vector CAD Precision',
      title: 'AutoCAD Vector Blueprints Without Autodesk Or Adobe',
      description: 'Open, inspect, and export AutoCAD DXF blueprints directly to high-DPI vector PDFs. Switch between Blueprint Blue, Monochrome Dark, and Layer Colors up to A1 sheet dimensions.',
      icon: <Compass className="w-6 h-6 text-cyan-400" />,
      accentColor: '#06b6d4',
      gradient: 'from-cyan-500/20 via-blue-500/10 to-transparent',
      preview: {
        tag: 'DXF Layer Pipeline Active',
        stats: 'Scale: 1:100 Vector · A1 Paper Ready',
        quote: 'Engineered for architects, MEP engineers, and structural draftsmen.'
      }
    },
    {
      id: 'fusion',
      badge: 'Chapter 03 · Heterogeneous Synthesis',
      title: 'Universal Multi-Document Fusion Reactor',
      description: 'Merge Word documents, Excel financial tables, CAD blueprints, and high-res image sets into one indexed master publication in a single click.',
      icon: <Layers className="w-6 h-6 text-amber-400" />,
      accentColor: '#f59e0b',
      gradient: 'from-amber-500/20 via-orange-500/10 to-transparent',
      preview: {
        tag: 'Universal Fusion Reactor',
        stats: 'Formats: DOCX + XLSX + DXF + PNG -> PDF',
        quote: 'Zero format impedance mismatch. Everything harmonizes seamlessly.'
      }
    },
    {
      id: 'privacy',
      badge: 'Chapter 04 · Sovereign Privacy',
      title: '100% Client-Side Sandboxed Security',
      description: 'When you open a confidential contract in Adobe Acrobat, telemetry tokens and files touch Adobe servers. In Anything, memory never leaves your CPU/GPU hardware boundary.',
      icon: <ShieldCheck className="w-6 h-6 text-rose-400" />,
      accentColor: '#ef4444',
      gradient: 'from-rose-500/20 via-red-500/10 to-transparent',
      preview: {
        tag: 'Zero Cloud Relays',
        stats: 'Hardware: Direct3D 11 · Local RAM Sandbox',
        quote: 'Guaranteed 0 external packets sent. Your legal data remains exclusively yours.'
      }
    }
  ];

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 relative">
      <div className="text-center max-w-3xl mx-auto mb-14">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Chapter Experience</span>
        </div>
        <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-4">
          How Anything <span className="text-gradient">Redefines Documents</span>
        </h2>
        <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
          Click through the evolutionary milestones of sovereign document engineering.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Step Buttons List Left */}
        <div className="lg:col-span-5 space-y-3">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => {
                setActiveStep(idx);
                soundFx.playClick();
              }}
              className={`p-5 rounded-3xl border cursor-pointer transition-all ${
                activeStep === idx
                  ? 'liquid-glass-bright border-white/30 shadow-2xl scale-[1.02]'
                  : 'liquid-glass-subtle border-white/5 opacity-60 hover:opacity-100 hover:border-white/15'
              }`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-[10px] uppercase font-mono tracking-wider font-bold" style={{ color: step.accentColor }}>
                  {step.badge}
                </span>
              </div>
              <h4 className="text-base font-bold text-white mb-1">
                {step.title}
              </h4>
              <p className="text-xs text-zinc-400 line-clamp-2">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        {/* Dynamic Interactive Stage Right */}
        <div className="lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={steps[activeStep].id}
              initial={{ opacity: 0, scale: 0.96, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -20 }}
              transition={{ duration: 0.3 }}
              className={`liquid-glass-bright rounded-3xl p-8 sm:p-12 border border-white/20 shadow-2xl relative overflow-hidden bg-gradient-to-br ${steps[activeStep].gradient}`}
            >
              <div className="flex items-center justify-between pb-6 border-b border-white/10 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center">
                    {steps[activeStep].icon}
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                      {steps[activeStep].badge}
                    </span>
                    <h3 className="text-xl font-black text-white">
                      {steps[activeStep].title}
                    </h3>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-white/10 text-white">
                  0{activeStep + 1} / 04
                </span>
              </div>

              <p className="text-sm text-zinc-200 leading-relaxed mb-8">
                {steps[activeStep].description}
              </p>

              {/* Dynamic Feature Card Inside */}
              <div className="p-6 rounded-2xl bg-black/50 border border-white/10 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 font-mono">
                    {steps[activeStep].preview.tag}
                  </span>
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {steps[activeStep].preview.stats}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 italic border-l-2 border-white/20 pl-3">
                  "{steps[activeStep].preview.quote}"
                </p>
              </div>

              {/* Step Navigation Controls */}
              <div className="pt-8 border-t border-white/10 flex items-center justify-between">
                <button
                  onClick={() => {
                    setActiveStep((activeStep - 1 + steps.length) % steps.length);
                    soundFx.playClick();
                  }}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-semibold text-zinc-300"
                >
                  &larr; Previous Chapter
                </button>

                <button
                  onClick={() => {
                    setActiveStep((activeStep + 1) % steps.length);
                    soundFx.playClick();
                  }}
                  className="px-5 py-2 rounded-xl bg-white text-slate-950 font-bold text-xs hover:bg-zinc-200 transition-colors flex items-center gap-1.5"
                >
                  <span>Next Chapter</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
