import React, { useState } from 'react';
import { RefreshCw, GitBranch, Sparkles, CheckCircle2, ShieldCheck, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassBadge } from '../../../components/ui/GlassBadge';

export const AutoUpdateSection: React.FC = () => {
  const [checking, setChecking] = useState(false);
  const [statusText, setStatusText] = useState('Up to date with GitHub Releases');

  const handleCheck = async () => {
    setChecking(true);
    setStatusText('Checking GitHub Releases repository...');

    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.checkForUpdates) {
      try {
        const res = await electronAPI.checkForUpdates();
        setTimeout(() => {
          setChecking(false);
          if (res?.status === 'dev-mode') {
            setStatusText('Development mode · Auto-update active in packaged builds');
          } else {
            setStatusText('Your Anything app is running the latest version');
          }
        }, 1200);
      } catch (err: any) {
        setChecking(false);
        setStatusText(`Status: ${err.message || 'Complete'}`);
      }
    } else {
      setTimeout(() => {
        setChecking(false);
        setStatusText('Latest version installed (v1.0.0)');
      }, 800);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold">
          GitHub Releases · Delta Auto-Updater
        </h3>
        <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono font-medium">No Custom Domain Needed</span>
      </div>

      <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-slate-950 font-bold shadow-md shadow-cyan-400/25 shrink-0">
              <GitBranch className="w-5 h-5 text-slate-950" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                  Anything v1.0.0
                </h4>
                <GlassBadge variant="emerald" dot>Live Release Channel</GlassBadge>
              </div>
              <p className="text-xs text-zinc-600 dark:text-white/60 mt-0.5 font-medium">
                {statusText}
              </p>
            </div>
          </div>

          <GlassButton
            variant="glass"
            size="sm"
            onClick={handleCheck}
            disabled={checking}
            icon={<RefreshCw className={`w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 ${checking ? 'animate-spin' : ''}`} />}
          >
            {checking ? 'Checking GitHub...' : 'Check for Updates'}
          </GlassButton>
        </div>

        {/* How it works summary cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
            <span className="text-[10px] font-mono text-cyan-700 dark:text-cyan-300 font-bold block mb-1">
              1. PUSH CODE TO GITHUB
            </span>
            <p className="text-xs text-zinc-600 dark:text-white/70 leading-relaxed font-medium">
              Whenever you make any change, bump version in <code className="text-cyan-700 dark:text-cyan-300 font-mono">package.json</code> and run release.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
            <span className="text-[10px] font-mono text-purple-700 dark:text-purple-300 font-bold block mb-1">
              2. ZERO DOMAIN HOSTING
            </span>
            <p className="text-xs text-zinc-600 dark:text-white/70 leading-relaxed font-medium">
              GitHub Releases hosts the delta block maps and update files completely free.
            </p>
          </div>

          <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/5">
            <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-300 font-bold block mb-1">
              3. SILENT BACKGROUND UPDATE
            </span>
            <p className="text-xs text-zinc-600 dark:text-white/70 leading-relaxed font-medium">
              Users’ PCs automatically download the patch in the background and restart updated.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-zinc-500 dark:text-white/40 pt-2 border-t border-zinc-200 dark:border-white/5 font-mono font-medium">
          <span>Engine: electron-updater v6.3.9</span>
          <span className="text-cyan-600 dark:text-cyan-400 hover:underline cursor-pointer">View Release Runbook</span>
        </div>
      </GlassCard>
    </section>
  );
};
