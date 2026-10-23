import React, { useState } from 'react';
import {
  X,
  Copy,
  Check,
  FolderOpen,
  Sparkles,
  Bot,
  Terminal,
  Layers,
  ArrowRight,
  ExternalLink,
  Zap,
} from 'lucide-react';
import { GlassButton } from '../../../components/ui/GlassButton';

const GithubIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg
    className={className}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
  </svg>
);

interface ChildAppSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenReleasesFolder?: () => void;
}

export const ChildAppSetupModal: React.FC<ChildAppSetupModalProps> = ({
  isOpen,
  onClose,
  onOpenReleasesFolder,
}) => {
  const [activeTab, setActiveTab] = useState<'guide' | 'ai-prompt' | 'github'>('guide');
  const [copied, setCopied] = useState(false);

  const aiPromptText = `You are building a dedicated child desktop application for the "Anything" app ecosystem (created by Burhanuddin Sounasath · Phone: 8369811201).

### 🎯 Child App Requirements
1. Platform: Windows 10/11 (x64).
2. Output Target: A single standalone executable (.exe) or portable executable.
3. Tech Stack Options:
   - Electron / Vite / React (portable/NSIS build)
   - Tauri / Rust (lightweight <10MB .exe)
   - Python PyInstaller (single-file .exe)
   - C# / .NET (single-file win-x64 release)
   - Go / C++ (compiled Windows GUI .exe)

### 📦 Output Location & Structure
When built, place your executable and an app.json manifest inside:
Anything/releases/<your-app-id>/

Create an app.json file:
{
  "id": "my-child-app",
  "name": "My Child App",
  "shortName": "MC",
  "version": "1.0.0",
  "category": "Development",
  "description": "Short description of what this child app does.",
  "executableName": "my-child-app.exe",
  "iconType": "emoji",
  "iconValue": "🚀",
  "gradient": "from-blue-600 via-sky-500 to-cyan-400",
  "textColor": "#38bdf8",
  "glowColor": "rgba(56, 189, 248, 0.45)",
  "githubRepo": "your-github-username/my-child-app"
}

### 🔄 Auto-Update Support
- Method A: Drop new .exe into Anything/releases/<your-app-id>/ (e.g. my-child-app-v1.1.0.exe). Anything's collector detects it and updates the launcher automatically.
- Method B: If githubRepo is provided, publish new releases with Windows assets (.exe/.zip) on GitHub. Anything will check and auto-download updates in the background.

Please build the application and manifest now.`;

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(aiPromptText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800 bg-zinc-900/50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-slate-950 shadow-md shadow-cyan-500/20">
              <Bot className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white tracking-tight">
                Child App Creator & AI Instructions
              </h3>
              <p className="text-xs text-zinc-400">
                Architected by Burhanuddin Sounasath (Phone: 8369811201)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 px-6 pt-3 border-b border-zinc-800/80 bg-zinc-900/30">
          <button
            onClick={() => setActiveTab('guide')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'guide'
                ? 'text-cyan-400 border-cyan-400 bg-white/[0.04]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>One-Time Setup Guide</span>
          </button>

          <button
            onClick={() => setActiveTab('ai-prompt')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'ai-prompt'
                ? 'text-cyan-400 border-cyan-400 bg-white/[0.04]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI Prompt Template</span>
          </button>

          <button
            onClick={() => setActiveTab('github')}
            className={`px-3.5 py-2 text-xs font-semibold rounded-t-xl transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'github'
                ? 'text-cyan-400 border-cyan-400 bg-white/[0.04]'
                : 'text-zinc-400 border-transparent hover:text-zinc-200'
            }`}
          >
            <GithubIcon className="w-3.5 h-3.5" />
            <span>GitHub Auto-Updates</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'guide' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
                <div className="text-xs text-zinc-300 leading-relaxed">
                  <strong className="text-white block font-bold mb-1">
                    How Child Apps Work in Anything:
                  </strong>
                  You don't need to rebuild Anything to add new apps. Each child app is a standalone program (Electron, Tauri, Python, C#) that lives inside the <code className="text-cyan-300 font-mono">releases/</code> folder. Anything automatically scans, catalogs, and manages them.
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 font-bold font-mono flex items-center justify-center text-xs">
                    1
                  </div>
                  <h4 className="text-xs font-bold text-white">Create App Folder</h4>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Inside <code className="text-cyan-300">Anything/releases/</code>, create a folder like <code className="text-zinc-200">photo-trimmer</code>.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-cyan-500/20 text-cyan-400 font-bold font-mono flex items-center justify-center text-xs">
                    2
                  </div>
                  <h4 className="text-xs font-bold text-white">Drop .exe & app.json</h4>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Place your built executable and optional <code className="text-zinc-200">app.json</code> in that folder.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 font-bold font-mono flex items-center justify-center text-xs">
                    3
                  </div>
                  <h4 className="text-xs font-bold text-white">Auto-Synced!</h4>
                  <p className="text-[11px] text-zinc-400 leading-normal">
                    Anything's live watcher instantly detects the app, updates the catalog, and enables Launch!
                  </p>
                </div>
              </div>

              {/* Sample Folder Structure Box */}
              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-2">
                  Directory Layout
                </h4>
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300 space-y-1">
                  <div className="text-cyan-400">Anything/releases/</div>
                  <div className="pl-4">├── <span className="text-amber-300">my-child-app/</span></div>
                  <div className="pl-8">├── <span className="text-emerald-400">my-child-app.exe</span> <span className="text-zinc-500">(Executable)</span></div>
                  <div className="pl-8">└── <span className="text-purple-300">app.json</span> <span className="text-zinc-500">(Metadata config)</span></div>
                  <div className="pl-4">└── <span className="text-emerald-400">StandaloneApp-v1.0.exe</span> <span className="text-zinc-500">(Direct drop also supported)</span></div>
                </div>
              </div>

              {onOpenReleasesFolder && (
                <div className="pt-2">
                  <GlassButton
                    variant="primary"
                    size="sm"
                    icon={<FolderOpen className="w-4 h-4" />}
                    onClick={onOpenReleasesFolder}
                  >
                    Open Releases Folder Now
                  </GlassButton>
                </div>
              )}
            </div>
          )}

          {activeTab === 'ai-prompt' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-xs text-zinc-400">
                  Copy and paste this prompt to any AI (Claude, ChatGPT, Cursor, Gemini) to build a compatible child app:
                </p>
                <button
                  onClick={handleCopyPrompt}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    copied
                      ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                      : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-md shadow-cyan-500/20'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied to Clipboard!' : 'Copy AI Prompt'}</span>
                </button>
              </div>

              <div className="relative rounded-2xl bg-zinc-900 border border-zinc-800 overflow-hidden">
                <pre className="p-4 text-[11px] font-mono text-zinc-300 whitespace-pre-wrap leading-relaxed max-h-72 overflow-y-auto">
                  {aiPromptText}
                </pre>
              </div>
            </div>
          )}

          {activeTab === 'github' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-white font-bold text-xs">
                  <GithubIcon className="w-4 h-4 text-cyan-400" />
                  <span>Remote Auto-Updates via GitHub Releases</span>
                </div>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Instead of manually copying .exe files, you can link any public or private GitHub repository. When you publish a release on GitHub, Anything checks for new versions, downloads the .exe in the background, and updates the child app!
                </p>
              </div>

              <div>
                <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-400 font-bold mb-2">
                  Sample app.json with GitHub Link
                </h4>
                <div className="p-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 font-mono text-[11px] text-zinc-300">
                  <pre>{`{
  "id": "screen-recorder",
  "name": "Screen Recorder Pro",
  "version": "1.0.0",
  "category": "Video & 3D",
  "executableName": "ScreenRecorder.exe",
  "githubRepo": "BSFrameWorks5253/screen-recorder",
  "iconType": "emoji",
  "iconValue": "📹"
}`}</pre>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 text-xs text-emerald-300">
                <strong>Zero Downtime:</strong> Users see a glowing update badge in Anything whenever GitHub has a newer tag. Clicking "Update" hot-swaps the binary seamlessly!
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-800 bg-zinc-900/40 flex items-center justify-between">
          <div className="text-[11px] text-zinc-500 font-mono">
            Support: Burhanuddin Sounasath (8369811201)
          </div>
          <GlassButton variant="glass" size="sm" onClick={onClose}>
            Close
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
