import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShieldCheck, 
  Sparkles, 
  Terminal, 
  ExternalLink,
  Laptop
} from 'lucide-react';
import { GithubIcon, AdobeIcon, WindowsIcon } from './Icons';
import { ecosystemApps } from '../data/apps';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-24 border-t border-white/10 bg-[#09090d]/80 backdrop-blur-xl text-zinc-400 relative overflow-hidden">
      {/* Subtle background ambient mesh */}
      <div className="absolute inset-0 pointer-events-none -z-10 opacity-20">
        <div className="absolute -top-40 left-1/4 w-96 h-96 bg-red-600/30 rounded-full blur-[120px]" />
        <div className="absolute -top-40 right-1/4 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
          {/* Brand & Manifesto Column */}
          <div className="lg:col-span-2 space-y-4">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-red-500/25">
                An
              </div>
              <span className="font-extrabold tracking-tight text-white text-lg">
                Anything
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                WWDC26 Liquid Glass
              </span>
            </Link>

            <p className="text-xs text-zinc-400 leading-relaxed max-w-sm">
              The revolutionary Adobe Acrobat & Creative Cloud alternative. Zero monthly subscriptions, zero paywalls, zero cloud data harvesting. Free, offline, and native desktop power for everyone.
            </p>

            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://github.com/BSFrameWorks5253/Anything"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all flex items-center gap-2 text-xs"
              >
                <GithubIcon className="w-4 h-4" />
                <span>GitHub Org</span>
              </a>
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Sovereign Local Privacy</span>
              </div>
            </div>
          </div>

          {/* Ecosystem Apps Column */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-rose-400" />
              <span>Applications</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              {ecosystemApps.map((app) => (
                <li key={app.id}>
                  <Link
                    to={`/apps/${app.id}`}
                    className="hover:text-white transition-colors flex items-center justify-between group"
                  >
                    <span className="group-hover:translate-x-0.5 transition-transform">
                      {app.name}
                    </span>
                    <span className="text-[10px] text-zinc-500 font-mono">
                      v{app.version}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Online Tools & Comparison */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <AdobeIcon className="w-3.5 h-3.5 text-red-400" />
              <span>Free PDF Tools</span>
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/tools" className="hover:text-white transition-colors">
                  In-Browser PDF Suite
                </Link>
              </li>
              <li>
                <Link to="/tools" className="hover:text-white transition-colors">
                  Digital Signature Studio
                </Link>
              </li>
              <li>
                <Link to="/tools" className="hover:text-white transition-colors">
                  Visual Page Splitter
                </Link>
              </li>
              <li>
                <Link to="/tools" className="hover:text-white transition-colors">
                  Smart PDF Compressor
                </Link>
              </li>
              <li>
                <Link to="/tools" className="hover:text-white transition-colors">
                  Offline OCR Text Extractor
                </Link>
              </li>
              <li>
                <Link to="/compare" className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
                  <span>Adobe vs Anything Matrix</span>
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </li>
            </ul>
          </div>

          {/* Platform & Requirements */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-4 flex items-center gap-2">
              <WindowsIcon className="w-3.5 h-3.5 text-cyan-400" />
              <span>Platform Specs</span>
            </h4>
            <ul className="space-y-2 text-xs text-zinc-400">
              <li className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-zinc-500" />
                <span>Windows 10 / 11 (64-bit)</span>
              </li>
              <li className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-zinc-500" />
                <span>DirectX 11 Hardware Acceleration</span>
              </li>
              <li>
                <span className="text-zinc-500">Installation:</span> Zero Registry (%LOCALAPPDATA%)
              </li>
              <li>
                <span className="text-zinc-500">Distribution:</span> Standalone .EXE & GitHub Releases
              </li>
              <li className="pt-2">
                <Link to="/about" className="text-rose-400 hover:text-rose-300 font-semibold">
                  Read Developer Guidance &rarr;
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Credits & Copyright */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2">
            <span>© 2026 Anything Creative Ecosystem.</span>
            <span className="text-zinc-600">•</span>
            <span>Architected & Engineered by <strong className="text-zinc-200">Burhanuddin Sounasath</strong>.</span>
          </div>

          <div className="flex items-center gap-4 text-zinc-500 text-[11px] font-mono">
            <span>All child tools are 100% Free Forever</span>
            <span>•</span>
            <span>Zero Subscription Fees</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
