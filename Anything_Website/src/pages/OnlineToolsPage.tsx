import React from 'react';
import { RealPdfStudio } from '../components/RealPdfStudio';
import { InteractiveAcrobatTools } from '../components/InteractiveAcrobatTools';
import { AdobeSavingsCalculator } from '../components/AdobeSavingsCalculator';
import { ShieldCheck, Lock, Zap, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { AdobeIcon } from '../components/Icons';

export const OnlineToolsPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-6 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>

        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold mb-3">
            <AdobeIcon className="w-3.5 h-3.5" />
            <span>Online Acrobat Toolkit · 100% Client-Side</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-4">
            Free In-Browser <span className="text-gradient-acrobat">PDF & Document Suite</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            No signup. No 1-file daily trap. Your files never touch a remote server — all processing happens in your browser's private memory sandbox via WebAssembly & Canvas.
          </p>
        </div>

        {/* Feature Badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 text-xs text-zinc-400 font-mono mb-12">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Zero Cloud Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-cyan-400" />
            <span>Client-Side WebAssembly</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400" />
            <span>Infinite Free Conversions</span>
          </div>
        </div>

        {/* 1. Real Working PDF Generator & Watermarker */}
        <div className="mb-16">
          <RealPdfStudio />
        </div>

        {/* 2. Interactive Tools (Signature, Organizer, Compressor, OCR, Fusion) */}
        <div className="mb-16">
          <InteractiveAcrobatTools />
        </div>

        {/* 3. Team Savings Calculator */}
        <div>
          <AdobeSavingsCalculator />
        </div>
      </div>
    </div>
  );
};
