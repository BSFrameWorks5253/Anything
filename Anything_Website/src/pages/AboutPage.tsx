import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sparkles, 
  Terminal, 
  ExternalLink,
  ArrowLeft
} from 'lucide-react';
import { GithubIcon, AdobeIcon } from '../components/Icons';

export const AboutPage: React.FC = () => {
  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs text-zinc-400 hover:text-white transition-colors mb-6 font-mono"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Overview</span>
        </Link>

        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Architecture & Developer Guidance</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-4">
            The Freedom <span className="text-gradient">Manifesto</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
            The technical philosophy, liquid glass aesthetic principles, and ecosystem contract behind Anything and its Adobe Acrobat alternative suite.
          </p>
        </div>

        {/* Section 1: Philosophy of Free Software */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-10 mb-10 border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400">
              <AdobeIcon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Why Everything is 100% Free Forever</h2>
              <span className="text-xs text-zinc-400 font-mono">Liberating everyday desktop documents</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            In the modern software landscape, Adobe and similar conglomerates have normalized predatory subscription locks on universal file standards. PDF was designed in 1993 as an open document standard — yet today, basic operations like combining two files, signing a receipt, or deleting a blank page are paywalled behind $239/year plans.
          </p>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Anything rejects this paradigm. All child applications in the Anything ecosystem are engineered by <strong>Burhanuddin Sounasath</strong> as self-contained, offline, portable Windows binaries. They operate directly on your computer's CPU and GPU memory space with zero cloud server relays, zero tracking tokens, and zero subscription gates.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-white/5 text-xs">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="font-bold text-white block mb-1">0$ Forever</span>
              <span className="text-zinc-400">No trial periods. No billing credentials required.</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="font-bold text-white block mb-1">100% Offline</span>
              <span className="text-zinc-400">Your documents stay strictly on your local hardware.</span>
            </div>
            <div className="p-3 rounded-xl bg-white/5 border border-white/5">
              <span className="font-bold text-white block mb-1">Zero Registry</span>
              <span className="text-zinc-400">Clean portable execution without system bloat.</span>
            </div>
          </div>
        </div>

        {/* Section 2: Technical Architecture & Auto-Update Protocol */}
        <div className="liquid-glass rounded-3xl p-6 sm:p-10 mb-10 border border-white/10 space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">The Auto-Update & Notification Contract</h2>
              <span className="text-xs text-zinc-400 font-mono">Windows 10/11 Action Center Integration</span>
            </div>
          </div>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Whenever a child application publishes a new release tag to GitHub, Anything's background sync engine compares the local SemVer with the remote asset release. When an update is detected, an official Windows 10/11 Action Center Toast notification is dispatched.
          </p>

          {/* Code Spec Box */}
          <div className="bg-[#09090e] rounded-2xl p-4 sm:p-5 border border-white/10 font-mono text-[11px] text-zinc-300 overflow-x-auto space-y-2">
            <div className="text-cyan-400 font-bold">// Windows Action Center Notification Contract Payload:</div>
            <pre className="text-zinc-300">{`{
  "appUserModelId": "com.burhanuddin.anything",
  "title": "🚀 Update Available: {AppName} v{NewVersion}",
  "body": "Version {NewVersion} is now available on GitHub (Installed: v{CurrentVersion}). Click to download.",
  "silent": false,
  "icon": "application_emblem_or_logo.png",
  "clickAction": "FOCUS_ANYTHING_AND_OPEN_UPDATE_MODAL"
}`}</pre>
          </div>

          <div className="space-y-3 pt-2 text-xs text-zinc-300">
            <h4 className="font-bold text-white uppercase tracking-wider text-[11px]">Core Architecture Rules:</h4>
            <ul className="space-y-2 pl-4 list-disc text-zinc-400">
              <li><strong>Self-Contained Portable Binary:</strong> Standalone .exe or .zip. Child apps install to <code className="text-cyan-300 font-mono text-[10px]">%LOCALAPPDATA%\anything\installed-apps\{'{appId}'}</code></li>
              <li><strong>Strict Semantic Versioning (SemVer):</strong> Strict numeric comparison (e.g., v1.2.0 &gt; v1.1.9).</li>
              <li><strong>Zero Cloud Relays:</strong> Execution remains completely isolated in a local sandboxed thread pool.</li>
            </ul>
          </div>
        </div>

        {/* Section 3: Creator Profile & GitHub Hub */}
        <div className="liquid-glass-bright rounded-3xl p-6 sm:p-10 border border-white/15 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="space-y-2 text-center sm:text-left">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block">Lead Creator & Architect</span>
            <h3 className="text-2xl font-black text-white">Burhanuddin Sounasath</h3>
            <p className="text-xs text-zinc-300 max-w-md">
              BSFrameWorks · Dedicated to building high-performance, beautiful, and unrestricted creative engineering software for Windows.
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <a
              href="https://github.com/BSFrameWorks5253/Anything"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs flex items-center gap-2 border border-white/10 transition-colors"
            >
              <GithubIcon className="w-4 h-4" />
              <span>GitHub Organization</span>
              <ExternalLink className="w-3.5 h-3.5 text-zinc-400" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
