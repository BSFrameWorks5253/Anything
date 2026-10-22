import React from 'react';
import { RefreshCw, ArrowRight } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { useTheme } from '../../../context/ThemeContext';

interface UpdatesAlertBarProps {
  count: number;
  onUpdateAll: () => void;
  onViewApps: () => void;
}

export const UpdatesAlertBar: React.FC<UpdatesAlertBarProps> = ({
  count,
  onUpdateAll,
  onViewApps,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  if (count <= 0) return null;

  return (
    <GlassCard
      variant="static"
      className="p-4 border flex items-center justify-between flex-wrap gap-4 transition-colors"
    >
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-red-600/10 border border-red-600/20 flex items-center justify-center text-red-600">
          <RefreshCw className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h4
              className={`text-sm font-semibold tracking-tight ${
                isLight ? 'text-zinc-900' : 'text-zinc-100'
              }`}
            >
              {count} Application Update{count > 1 ? 's' : ''} Available
            </h4>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-red-600/10 text-red-600 font-semibold">
              Ready
            </span>
          </div>
          <p
            className={`text-xs mt-0.5 ${
              isLight ? 'text-zinc-500' : 'text-zinc-400'
            }`}
          >
            Keep your creative apps up to date for new features and performance enhancements.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <GlassButton
          variant="ghost"
          size="sm"
          onClick={onViewApps}
          icon={<ArrowRight className="w-3.5 h-3.5" />}
        >
          View Apps
        </GlassButton>
        <GlassButton
          variant="accent"
          size="sm"
          onClick={onUpdateAll}
        >
          Update All
        </GlassButton>
      </div>
    </GlassCard>
  );
};
