import React from 'react';
import { CreditCard, CheckCircle2, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';

export const PlanSection: React.FC = () => {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold">
          Spatial Subscription & Billing
        </h3>
        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium">Auto-Renewing</span>
      </div>

      <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 relative overflow-hidden">
        {/* Subtle background glow */}
        <div className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-5 border-b border-zinc-200 dark:border-white/[0.08]">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                Anything All Apps Ecosystem
              </h4>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-400/20 text-cyan-700 dark:text-cyan-300 border border-cyan-400/30 font-medium">
                Annual Pro
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-white/60 mt-1 font-medium">
              Unlimited access to 20+ spatial apps, 1,000 Neural AI monthly credits, and 100 GB Cloud.
            </p>
          </div>

          <div className="text-left md:text-right">
            <div className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
              $54.99
              <span className="text-xs font-normal text-zinc-500 dark:text-white/50 ml-1">/ month</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-white/40 mt-0.5 font-mono">
              Next billing: Nov 22, 2026
            </p>
          </div>
        </div>

        <div className="pt-4 flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-600 dark:text-white/60 font-medium">
          <div className="flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span>Apple Pay · Apple Card Master ending in •••• 9241</span>
          </div>

          <div className="flex items-center gap-3">
            <button className="text-xs text-zinc-600 dark:text-white/60 hover:text-zinc-900 dark:hover:text-white hover:underline transition-colors font-medium">
              Billing History
            </button>
            <GlassButton variant="glass" size="sm" icon={<ArrowUpRight className="w-3.5 h-3.5" />}>
              Change Plan
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </section>
  );
};
