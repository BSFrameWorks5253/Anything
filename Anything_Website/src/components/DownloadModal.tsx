import React, { useState } from 'react';
import { 
  X, 
  Download, 
  ShieldCheck, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink,
  Laptop
} from 'lucide-react';
import { WindowsIcon, GithubIcon } from './Icons';
import { ecosystemApps } from '../data/apps';

interface DownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedAppId?: string;
}

export const DownloadModal: React.FC<DownloadModalProps> = ({ 
  isOpen, 
  onClose,
  selectedAppId = 'anything-hub'
}) => {
  const [activeTab, setActiveTab] = useState<string>(selectedAppId);
  const [copiedHash, setCopiedHash] = useState(false);

  if (!isOpen) return null;

  const currentApp = ecosystemApps.find(a => a.id === activeTab) || ecosystemApps[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="liquid-glass-bright max-w-2xl w-full rounded-3xl p-6 sm:p-8 shadow-2xl border-white/20 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-xl bg-white/5 hover:bg-white/15 text-zinc-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${currentApp.gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg`}>
            {currentApp.iconSymbol}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-black text-white">{currentApp.name}</h3>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono text-[10px]">
                Verified Free
              </span>
            </div>
            <p className="text-xs text-zinc-400">
              v{currentApp.version} · Windows 10/11 64-bit Native · {currentApp.size}
            </p>
          </div>
        </div>

        {/* App Switcher Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 border-b border-white/10 text-xs">
          {ecosystemApps.map(app => (
            <button
              key={app.id}
              onClick={() => setActiveTab(app.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                activeTab === app.id
                  ? 'bg-white/20 text-white'
                  : 'bg-white/5 text-zinc-400 hover:text-white'
              }`}
            >
              {app.name}
            </button>
          ))}
        </div>

        {/* Download Action Cards */}
        <div className="space-y-4 mb-6">
          <div className="liquid-glass p-5 rounded-2xl border border-white/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-bold text-white flex items-center gap-2">
                <WindowsIcon className="w-4 h-4 text-cyan-400" />
                <span>Primary Windows 64-bit Binary (.EXE)</span>
              </span>
              <p className="text-[11px] text-zinc-400">
                Self-contained, portable binary. No installer required.
              </p>
            </div>

            <a
              href={currentApp.releasesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-400 hover:to-red-500 text-white font-extrabold text-xs flex items-center gap-2 shadow-lg shadow-rose-500/25 shrink-0"
            >
              <Download className="w-4 h-4" />
              <span>Download {currentApp.directDownloadName}</span>
            </a>
          </div>

          <div className="liquid-glass-subtle p-4 rounded-2xl border border-white/5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-zinc-300">
              <GithubIcon className="w-4 h-4" />
              <span>View Source & GitHub Releases</span>
            </div>
            <a
              href={currentApp.releasesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-400 hover:underline flex items-center gap-1 font-semibold"
            >
              <span>{currentApp.githubRepo}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Security & Verification Box */}
        <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-3 text-xs mb-6">
          <div className="flex items-center justify-between">
            <span className="text-zinc-300 font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Cryptographic Integrity Verification</span>
            </span>
            <button
              onClick={() => {
                setCopiedHash(true);
                navigator.clipboard.writeText(`Get-FileHash -Algorithm SHA256 .\\${currentApp.directDownloadName}`);
                setTimeout(() => setCopiedHash(false), 2000);
              }}
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1"
            >
              {copiedHash ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
              <span>{copiedHash ? 'Copied Command' : 'Copy PowerShell Hash Cmd'}</span>
            </button>
          </div>

          <div className="bg-black/50 p-2.5 rounded-xl font-mono text-[10px] text-zinc-400 break-all border border-white/5">
            Get-FileHash -Algorithm SHA256 .\{currentApp.directDownloadName}
          </div>
        </div>

        {/* System Specs */}
        <div className="grid grid-cols-2 gap-3 text-[11px] text-zinc-400 font-mono pt-3 border-t border-white/10">
          <div className="flex items-center gap-2">
            <Laptop className="w-3.5 h-3.5 text-zinc-500" />
            <span>OS: {currentApp.systemRequirements.os}</span>
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-zinc-500" />
            <span>RAM: {currentApp.systemRequirements.ram}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
