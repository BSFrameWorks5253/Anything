import React from 'react';
import { Play, Plus } from 'lucide-react';
import type { CreativeApp } from '../../../types/app.types';
import { GlassCard } from '../../../components/ui/GlassCard';
import { AppIconRenderer } from '../../apps/components/CrazyAppStudio/AppIconRenderer';
import { useTheme } from '../../../context/ThemeContext';

interface QuickLaunchGridProps {
  apps: CreativeApp[];
  onOpenApp: (app: CreativeApp) => void;
  onAddClick?: () => void;
}

export const QuickLaunchGrid: React.FC<QuickLaunchGridProps> = ({
  apps,
  onOpenApp,
  onAddClick,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3
          className={`text-xs font-semibold tracking-wide uppercase ${
            isLight ? 'text-zinc-600' : 'text-zinc-400'
          }`}
        >
          Quick Launch
        </h3>
        <span
          className={`text-xs ${
            isLight ? 'text-zinc-400' : 'text-zinc-500'
          }`}
        >
          Installed Applications
        </span>
      </div>

      {apps.length === 0 ? (
        <GlassCard
          variant="interactive"
          onClick={onAddClick}
          className="p-6 border-dashed flex flex-col items-center justify-center text-center cursor-pointer"
        >
          <div
            className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors mb-2 ${
              isLight
                ? 'bg-zinc-100 text-zinc-500'
                : 'bg-zinc-800 text-zinc-400'
            }`}
          >
            <Plus className="w-4 h-4" />
          </div>
          <span
            className={`text-sm font-semibold ${
              isLight ? 'text-zinc-800' : 'text-zinc-200'
            }`}
          >
            No installed applications yet
          </span>
          <span
            className={`text-xs mt-0.5 ${
              isLight ? 'text-zinc-400' : 'text-zinc-500'
            }`}
          >
            Browse the catalog to install or add your apps
          </span>
        </GlassCard>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {apps.map((app) => (
            <GlassCard
              key={app.id}
              variant="interactive"
              onClick={() => onOpenApp(app)}
              className="p-3.5 flex flex-col items-center text-center group"
            >
              <div className="relative mb-2.5">
                <AppIconRenderer app={app} size="md" />

                <div className="absolute inset-0 rounded-xl bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Play className="w-4 h-4 text-white fill-white" />
                </div>
              </div>

              <span
                className={`text-xs font-semibold truncate max-w-full transition-colors ${
                  isLight
                    ? 'text-zinc-800 group-hover:text-red-600'
                    : 'text-zinc-200 group-hover:text-white'
                }`}
              >
                {app.name}
              </span>
              <span
                className={`text-[10px] mt-0.5 truncate max-w-full ${
                  isLight ? 'text-zinc-400' : 'text-zinc-500'
                }`}
              >
                {app.badgeTag || app.category}
              </span>
            </GlassCard>
          ))}
        </div>
      )}
    </div>
  );
};
