import React from 'react';
import { Link } from 'react-router-dom';
import { AcrobatComparison } from '../components/AcrobatComparison';
import { AdobeIcon, WindowsIcon } from '../components/Icons';
import { ArrowLeft } from 'lucide-react';

export const ComparePage: React.FC = () => {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
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
            <span>Transparency Report</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-4">
            Adobe Acrobat vs <span className="text-gradient-acrobat">Anything Suite</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            A comprehensive, feature-by-feature evaluation comparing Adobe Acrobat DC Pro ($239.88/year) with Anything's 100% Free Desktop Suite.
          </p>
        </div>

        {/* Detailed Comparison Matrix */}
        <AcrobatComparison />

        {/* Bottom Banner */}
        <div className="mt-16 liquid-glass-bright rounded-3xl p-8 sm:p-12 text-center max-w-4xl mx-auto space-y-6 border border-white/15">
          <h3 className="text-2xl sm:text-3xl font-black text-white">
            Ready to Cut Out $240+ In Yearly Adobe Invoices?
          </h3>
          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            Download the Anything Master Hub or individual standalone apps. No credit card, no registration, and no cloud uploads.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/apps"
              className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-extrabold text-xs shadow-lg shadow-red-500/25 flex items-center gap-2"
            >
              <WindowsIcon className="w-4 h-4" />
              <span>Explore All Free Applications</span>
            </Link>
            <Link
              to="/tools"
              className="px-6 py-3.5 rounded-2xl liquid-glass hover:bg-white/10 text-white font-semibold text-xs border border-white/10"
            >
              <span>Try In-Browser Free Tools</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
