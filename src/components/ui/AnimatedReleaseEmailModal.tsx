import React, { useState } from 'react';
import {
  X,
  Mail,
  Send,
  Copy,
  Check,
  Sparkles,
  Zap,
  Wrench,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { GlassButton } from './GlassButton';
import { GlassBadge } from './GlassBadge';
import type { CatalogApp, AppReleaseMetadata } from '../../types/app.types';

interface AnimatedReleaseEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  app: CatalogApp;
  release?: AppReleaseMetadata;
  userEmail?: string;
  onInstallVersion?: (app: CatalogApp, version: string) => void;
}

export const AnimatedReleaseEmailModal: React.FC<AnimatedReleaseEmailModalProps> = ({
  isOpen,
  onClose,
  app,
  release,
  userEmail = 'burhanuddin@anything.io',
  onInstallVersion,
}) => {
  const [copied, setCopied] = useState(false);
  const [simulatedSent, setSimulatedSent] = useState(false);

  if (!isOpen) return null;

  const version = release?.version || app.version || '1.0.0';
  const newFeatures = release?.newFeatures && release.newFeatures.length > 0
    ? release.newFeatures
    : [
        `Upgraded core engine to v${version} for high responsiveness`,
        'Enhanced Windows 11 fluent liquid glass visual integration',
        'Added seamless child app IPC bridge with Anything',
      ];

  const improvements = release?.improvements && release.improvements.length > 0
    ? release.improvements
    : [
        '50% faster startup loading from cold launch',
        'Reduced background memory footprint during idle states',
        'Optimized direct executable launch handling',
      ];

  const fixes = release?.fixes && release.fixes.length > 0
    ? release.fixes
    : [
        'Resolved executable path resolution on custom Windows drives',
        'Fixed occasional window shadow artifacts on high-DPI displays',
        'Corrected taskbar notification grouping in Windows Action Center',
      ];

  const tagline = release?.tagline || `The Next Evolution of ${app.name}`;
  const summary =
    release?.summary ||
    `We are excited to roll out version ${version} of ${app.name}. This release focuses on lightning-fast performance, improved system integration, and core stability fixes.`;

  const subject =
    release?.emailNotification?.subject ||
    `🚀 ${app.name} v${version} is Here: ${tagline}!`;

  const generateHtmlEmail = () => {
    return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${subject}</title>
</head>
<body style="margin:0;padding:24px;background-color:#09090b;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#e4e4e7;">
  <table width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;margin:0 auto;background:#18181b;border:1px solid #27272a;border-radius:16px;overflow:hidden;">
    <tr>
      <td style="padding:32px;background:linear-gradient(135deg,#0e7490,#1d4ed8);text-align:center;">
        <h1 style="margin:0;font-size:26px;color:#ffffff;font-weight:800;">${app.name} v${version}</h1>
        <p style="margin:8px 0 0;font-size:14px;color:#cffafe;">${tagline}</p>
      </td>
    </tr>
    <tr>
      <td style="padding:28px;">
        <p style="font-size:15px;line-height:1.6;color:#d4d4d8;">${summary}</p>
        
        <h3 style="color:#38bdf8;margin:24px 0 12px;font-size:16px;">🚀 What's New</h3>
        <ul style="padding-left:20px;color:#a1a1aa;line-height:1.6;">
          ${newFeatures.map((f) => `<li style="margin-bottom:6px;"><strong>${f}</strong></li>`).join('')}
        </ul>

        <h3 style="color:#2dd4bf;margin:24px 0 12px;font-size:16px;">⚡ Improvements</h3>
        <ul style="padding-left:20px;color:#a1a1aa;line-height:1.6;">
          ${improvements.map((i) => `<li style="margin-bottom:6px;">${i}</li>`).join('')}
        </ul>

        <h3 style="color:#fb7185;margin:24px 0 12px;font-size:16px;">🛠️ Fixes & Patches</h3>
        <ul style="padding-left:20px;color:#a1a1aa;line-height:1.6;">
          ${fixes.map((x) => `<li style="margin-bottom:6px;">${x}</li>`).join('')}
        </ul>

        <div style="text-align:center;margin:32px 0 12px;">
          <a href="#" style="background:#06b6d4;color:#09090b;padding:12px 28px;text-decoration:none;border-radius:9999px;font-weight:bold;font-size:14px;display:inline-block;">Open in Anything</a>
        </div>
      </td>
    </tr>
    <tr>
      <td style="padding:20px;background:#121215;border-top:1px solid #27272a;text-align:center;font-size:12px;color:#71717a;">
        Architected by Burhanuddin Sounasath (+91 8369811201) · Anything Ecosystem Inc.
      </td>
    </tr>
  </table>
</body>
</html>`;
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(generateHtmlEmail());
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  const handleSimulateSend = () => {
    setSimulatedSent(true);
    setTimeout(() => setSimulatedSent(false), 3500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-2xl max-h-[92vh] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Email Header Chrome */}
        <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white tracking-wide">
                  Release Dispatch Preview
                </span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                  HTML5 Animated
                </span>
              </div>
              <p className="text-[11px] text-zinc-400 font-mono">
                Sent to: <span className="text-zinc-200">{userEmail}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSimulateSend}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                simulatedSent
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-200'
              }`}
            >
              {simulatedSent ? (
                <>
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Email Dispatched!</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Test Send</span>
                </>
              )}
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Envelope Info Bar */}
        <div className="px-6 py-3 bg-zinc-900/40 border-b border-zinc-800/80 text-xs text-zinc-300 font-mono space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">Subject:</span>
            <span className="text-zinc-200 font-bold truncate max-w-md">{subject}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-zinc-500">From:</span>
            <span className="text-cyan-400 flex items-center gap-1">
              Anything Updates &lt;releases@anything.io&gt;
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
            </span>
          </div>
        </div>

        {/* Animated Email Render Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-gradient-to-b from-zinc-950 to-black select-text">
          {/* Animated Hero Card */}
          <div className="relative rounded-2xl p-6 overflow-hidden border border-white/10 shadow-xl bg-gradient-to-tr from-cyan-900/40 via-blue-900/30 to-purple-900/30 text-center space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-400/10 border border-cyan-400/20 text-cyan-300 text-xs font-mono font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300 animate-spin" />
              <span>OFFICIAL RELEASE DISPATCH · v{version}</span>
            </div>

            <h2 className="text-2xl font-black text-white tracking-tight">
              {app.name} <span className="bg-gradient-to-r from-cyan-400 to-sky-300 bg-clip-text text-transparent">v{version}</span> is Live!
            </h2>

            <p className="text-xs text-zinc-300 max-w-lg mx-auto leading-relaxed">
              {summary}
            </p>
          </div>

          {/* 3 Changelog Columns / Cards */}
          <div className="space-y-4">
            {/* New Features */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold">
                  🚀
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  New Features Added
                </h4>
              </div>
              <ul className="space-y-1.5 pl-2">
                {newFeatures.map((feat, idx) => (
                  <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 mt-1.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Improvements */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-cyan-500/20 text-cyan-400 flex items-center justify-center text-xs font-bold">
                  ⚡
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Improvements & Speed
                </h4>
              </div>
              <ul className="space-y-1.5 pl-2">
                {improvements.map((imp, idx) => (
                  <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Bug Fixes */}
            <div className="p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800/80 space-y-2.5">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center text-xs font-bold">
                  🛠️
                </span>
                <h4 className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                  Bug Fixes & Patches
                </h4>
              </div>
              <ul className="space-y-1.5 pl-2">
                {fixes.map((fix, idx) => (
                  <li key={idx} className="text-xs text-zinc-300 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0 mt-1.5" />
                    <span>{fix}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action CTA Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/40 to-blue-950/40 border border-cyan-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-xs font-bold text-white">
                Ready to experience v{version}?
              </p>
              <p className="text-[11px] text-zinc-400">
                You can install, test, or switch to this version directly.
              </p>
            </div>

            {onInstallVersion && (
              <GlassButton
                variant="primary"
                size="sm"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
                onClick={() => {
                  onInstallVersion(app, version);
                  onClose();
                }}
              >
                Use Version {version}
              </GlassButton>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/60 flex items-center justify-between">
          <button
            onClick={handleCopyHtml}
            className="text-xs text-zinc-400 hover:text-white flex items-center gap-1.5 font-medium transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'HTML Copied to Clipboard!' : 'Copy Raw HTML Email'}</span>
          </button>

          <div className="text-[10px] text-zinc-500 font-mono">
            Burhanuddin Sounasath · 8369811201
          </div>
        </div>
      </div>
    </div>
  );
};
