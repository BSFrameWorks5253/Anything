import React from 'react';
import { ShieldCheck, Sparkles, Key } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassBadge } from '../../../components/ui/GlassBadge';

export const AccountSection: React.FC = () => {
  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold">
          Anything Account & Identity
        </h3>
        <span className="text-[11px] text-cyan-600 dark:text-cyan-400 font-mono font-medium">Passkey Active</span>
      </div>

      <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            {/* Iridescent Avatar with 3D Ring */}
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl p-[1px] bg-gradient-to-tr from-cyan-400 via-sky-300 to-indigo-500 shadow-xl shadow-cyan-500/20">
                <div className="w-full h-full rounded-[15px] bg-slate-900/90 backdrop-blur-2xl flex items-center justify-center font-extrabold text-2xl text-white border border-white/20">
                  <span className="bg-gradient-to-br from-white via-cyan-100 to-sky-300 bg-clip-text text-transparent">
                    B
                  </span>
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_8px_#34d399]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
                  Burhanuddin
                </h4>
                <ShieldCheck className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
              </div>
              <p className="text-xs text-zinc-500 dark:text-white/60 font-mono font-medium">burhanuddin@apple.id</p>
              
              <div className="flex items-center gap-2 mt-2">
                <GlassBadge variant="cyan" dot>
                  Anything Pro Member
                </GlassBadge>
                <span className="text-[11px] text-zinc-500 dark:text-white/40 hidden sm:inline font-mono font-medium">
                  ID: AN-9482-PRO
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <GlassButton variant="glass" size="sm" icon={<Key className="w-3.5 h-3.5 text-zinc-600 dark:text-white/70" />}>
              Security Keys
            </GlassButton>
            <GlassButton variant="primary" size="sm">
              Manage Account
            </GlassButton>
          </div>
        </div>
      </GlassCard>
    </section>
  );
};
