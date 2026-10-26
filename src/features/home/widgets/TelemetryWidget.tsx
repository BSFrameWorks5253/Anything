import React from 'react';
import { Activity, Cpu, HardDrive, Zap, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import type { CatalogApp } from '../../../types/app.types';

export const TelemetryWidget: React.FC<{ apps: CatalogApp[] }> = ({ apps }) => {
  const installedCount = apps.filter(a => a.status === 'installed' || a.status === 'update-available').length;
  const updatesCount = apps.filter(a => a.status === 'update-available').length;

  return (
    <GlassCard className="p-5 border-zinc-200 dark:border-white/10 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-emerald-500" />
          <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500">System Telemetry</h4>
        </div>
        <span className="flex items-center gap-1 text-[10px] text-emerald-500 font-mono bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Healthy
        </span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px]">Installed Apps</span>
            <Cpu className="w-3.5 h-3.5" />
          </div>
          <span className="text-xl font-extrabold mt-2">{installedCount}</span>
        </div>

        <div className="p-3 rounded-xl bg-white/5 border border-white/5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-[11px]">Pending Updates</span>
            <Zap className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <span className="text-xl font-extrabold mt-2 text-amber-500">{updatesCount}</span>
        </div>
      </div>
    </GlassCard>
  );
};
