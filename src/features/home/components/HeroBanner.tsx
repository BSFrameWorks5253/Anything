import React from 'react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { useTheme } from '../../../context/ThemeContext';

interface HeroBannerProps {
  onOpenApps: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({ onOpenApps }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <GlassCard
      variant="static"
      className="p-6 md:p-8 relative border transition-colors"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="max-w-xl">
          <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-red-600/10 border border-red-600/20 text-red-600 text-xs font-semibold mb-3">
            <span>Anything Suite</span>
          </div>

          <h2
            className={`text-2xl sm:text-3xl font-bold tracking-tight leading-tight ${
              isLight ? 'text-zinc-900' : 'text-zinc-100'
            }`}
          >
            Welcome back, Burhanuddin
          </h2>

          <p
            className={`mt-2 text-xs sm:text-sm leading-relaxed ${
              isLight ? 'text-zinc-600' : 'text-zinc-400'
            }`}
          >
            Manage your desktop applications, background releases, and creative tools from a single workspace.
          </p>

          <div className="mt-5 flex items-center gap-3">
            <GlassButton
              variant="primary"
              size="sm"
              icon={<ArrowUpRight className="w-3.5 h-3.5" />}
              onClick={onOpenApps}
            >
              Browse Applications
            </GlassButton>
          </div>
        </div>

        {/* System & Plan Status Chip */}
        <div
          className={`self-start sm:self-center px-4 py-3 rounded-xl border flex items-center gap-3 transition-colors ${
            isLight
              ? 'bg-zinc-50 border-zinc-200'
              : 'bg-zinc-900/80 border-zinc-800'
          }`}
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <div
              className={`text-xs font-semibold ${
                isLight ? 'text-zinc-900' : 'text-zinc-100'
              }`}
            >
              Anything Ecosystem Suite
            </div>
            <div className="text-[11px] text-zinc-500">
              Desktop v1.2.0 · Ready
            </div>
          </div>
        </div>
      </div>
    </GlassCard>
  );
};
