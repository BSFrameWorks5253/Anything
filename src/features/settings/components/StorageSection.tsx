import React from 'react';
import { Database, HardDrive, ArrowUpRight } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';

export const StorageSection: React.FC = () => {
  const breakdown = [
    { label: 'Spatial Documents', size: '7.2 GB', color: 'bg-cyan-500', percent: '50%' },
    { label: 'Video Renders (ProRes)', size: '4.8 GB', color: 'bg-purple-500', percent: '34%' },
    { label: 'Vector Assets', size: '1.4 GB', color: 'bg-amber-500', percent: '10%' },
    { label: 'App Cache & Temp', size: '0.8 GB', color: 'bg-emerald-500', percent: '6%' },
  ];

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold">
          Spatial Cloud Storage Allocation
        </h3>
        <span className="text-[11px] text-zinc-500 dark:text-white/50 font-mono font-medium">14.2 GB of 100 GB</span>
      </div>

      <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <span className="text-sm font-semibold text-zinc-900 dark:text-white">Apple iCloud & Adobe Mesh</span>
          </div>
          <span className="text-xs text-emerald-600 dark:text-emerald-400 font-mono font-medium">85.8 GB Available</span>
        </div>

        {/* Multi-segment liquid progress bar */}
        <div className="w-full h-3 rounded-full bg-zinc-100 dark:bg-white/[0.06] p-[1px] border border-zinc-200 dark:border-white/10 overflow-hidden flex gap-0.5">
          <div className="h-full bg-cyan-500 rounded-l-full shadow-xs" style={{ width: '7.2%' }} />
          <div className="h-full bg-purple-500 shadow-xs" style={{ width: '4.8%' }} />
          <div className="h-full bg-amber-500 shadow-xs" style={{ width: '1.4%' }} />
          <div className="h-full bg-emerald-500 rounded-r-full shadow-xs" style={{ width: '0.8%' }} />
        </div>

        {/* Breakdown chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-200 dark:border-white/[0.06]">
          {breakdown.map((item, idx) => (
            <div key={idx} className="flex flex-col">
              <div className="flex items-center gap-1.5 text-xs text-zinc-600 dark:text-white/70 font-medium">
                <span className={`w-2 h-2 rounded-full ${item.color}`} />
                <span className="truncate">{item.label}</span>
              </div>
              <span className="text-xs font-bold text-zinc-900 dark:text-white font-mono mt-0.5">
                {item.size}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 flex items-center justify-between pt-3 border-t border-zinc-200 dark:border-white/[0.06]">
          <span className="text-[11px] text-zinc-500 dark:text-white/40 font-medium">
            Need more capacity? Upgrade up to 2 TB with Apple One Premier.
          </span>
          <GlassButton variant="glass" size="sm" icon={<ArrowUpRight className="w-3 h-3" />}>
            Upgrade Storage
          </GlassButton>
        </div>
      </GlassCard>
    </section>
  );
};
