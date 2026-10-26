import React from 'react';
import { Star, Smartphone, Monitor } from 'lucide-react';
import type { CreativeApp } from '../../../types/app.types';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import { AppIconRenderer } from './CrazyAppStudio/AppIconRenderer';
import { useTheme } from '../../../context/ThemeContext';

interface AppCardHeaderProps {
  app: CreativeApp;
}

export const AppCardHeader: React.FC<AppCardHeaderProps> = ({ app }) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const hasMobile = Boolean(app.targetPlatforms?.includes('mobile') || app.category?.toLowerCase().includes('mobile'));

  return (
    <div className="flex items-start gap-3.5">
      {/* Dynamic 3D Liquid Apple/Custom Icon */}
      <AppIconRenderer app={app} size="md" />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1.5 min-w-0">
            <h3
              className={`text-sm font-bold tracking-tight truncate transition-colors ${
                isLight
                  ? 'text-slate-900 group-hover:text-cyan-600'
                  : 'text-white group-hover:text-cyan-300'
              }`}
            >
              {app.name}
            </h3>
            {hasMobile && (
              <span
                className="shrink-0 p-0.5 rounded bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                title="Mobile app available"
              >
                <Smartphone className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          {(app.status === 'update-available' || (app as any).status === 'update') && (
            <GlassBadge variant="cyan" dot className="shrink-0 text-[10px]">
              Update
            </GlassBadge>
          )}
          {app.status === 'trial' && (
            <GlassBadge variant="emerald" dot className="shrink-0 text-[10px] bg-emerald-500/15 border-emerald-500/30 text-emerald-300">
              Demo Mode
            </GlassBadge>
          )}
        </div>

        <div className="flex items-center gap-2 mt-0.5">
          {app.badgeTag ? (
            <span
              className={`text-[10px] font-mono truncate ${
                isLight ? 'text-cyan-700 font-semibold' : 'text-cyan-300/80'
              }`}
            >
              {app.badgeTag}
            </span>
          ) : (
            <span
              className={`text-[10px] truncate font-mono ${
                isLight ? 'text-slate-500' : 'text-white/40'
              }`}
            >
              v{app.version || '1.0.0'}
            </span>
          )}

          {app.rating && (
            <span className="hidden sm:inline-flex items-center gap-0.5 text-[10px] text-amber-500 font-mono font-semibold">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              {app.rating.toFixed(1)}
            </span>
          )}
        </div>

        <p
          className={`text-[11px] mt-1 line-clamp-2 leading-relaxed ${
            isLight ? 'text-slate-600' : 'text-white/50'
          }`}
        >
          {app.description}
        </p>
      </div>
    </div>
  );
};
