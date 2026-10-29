import React from 'react';
import { Image, Video, Layers } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';

export const FilesStats: React.FC = () => {
  const stats = [
    {
      label: 'Studio Master Projects',
      value: '28 Files',
      size: '8.4 GB',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      gradient: 'from-cyan-500/20 to-blue-600/10',
    },
    {
      label: 'ProRes & MediaFlow Cuts',
      value: '14 Cuts',
      size: '22.8 GB',
      icon: <Video className="w-4 h-4 text-purple-400" />,
      gradient: 'from-purple-500/20 to-indigo-600/10',
    },
    {
      label: 'Production Graphics & Stills',
      value: '142 Images',
      size: '4.6 GB',
      icon: <Image className="w-4 h-4 text-emerald-400" />,
      gradient: 'from-emerald-500/20 to-teal-600/10',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
      {stats.map((s, i) => (
        <GlassCard
          key={i}
          variant="interactive"
          className="p-4 flex items-center justify-between border-zinc-200 dark:border-white/10"
        >
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${s.gradient} border border-zinc-200 dark:border-white/10 flex items-center justify-center backdrop-blur-xl`}>
              {s.icon}
            </div>
            <div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">{s.label}</p>
              <p className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight">{s.value}</p>
            </div>
          </div>
          <span className="text-xs font-mono text-zinc-500 dark:text-zinc-400 font-medium">{s.size}</span>
        </GlassCard>
      ))}
    </div>
  );
};
