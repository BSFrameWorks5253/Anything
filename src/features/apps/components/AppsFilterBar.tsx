import React from 'react';
import { ArrowDownCircle, RefreshCw, Monitor, Smartphone } from 'lucide-react';
import { GlassButton } from '../../../components/ui/GlassButton';
import { useTheme } from '../../../context/ThemeContext';

export type FilterTab = 'all' | 'desktop' | 'mobile' | 'installed' | 'updates';

interface AppsFilterBarProps {
  activeTab: FilterTab;
  onTabChange: (tab: FilterTab) => void;
  updateCount: number;
  totalCount: number;
  desktopCount?: number;
  mobileCount?: number;
  onUpdateAll: () => void;
  isCheckingUpdates?: boolean;
  onCheckUpdates?: () => void;
}

export const AppsFilterBar: React.FC<AppsFilterBarProps> = ({
  activeTab,
  onTabChange,
  updateCount,
  totalCount,
  desktopCount,
  mobileCount,
  onUpdateAll,
  isCheckingUpdates,
  onCheckUpdates,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const tabs: { id: FilterTab; label: string; count?: number; icon?: React.ReactNode }[] = [
    { id: 'all', label: 'All Applications', count: totalCount },
    { id: 'desktop', label: 'Desktop', count: desktopCount, icon: <Monitor className="w-3.5 h-3.5" /> },
    { id: 'mobile', label: 'Mobile', count: mobileCount, icon: <Smartphone className="w-3.5 h-3.5 text-emerald-400" /> },
    { id: 'installed', label: 'Installed' },
    { id: 'updates', label: 'Updates', count: updateCount },
  ];

  return (
    <div
      className={`flex flex-wrap items-center justify-between gap-4 pb-2 border-b transition-colors ${
        isLight ? 'border-zinc-200' : 'border-zinc-800'
      }`}
    >
      {/* Refined Segment Control */}
      <div
        className={`inline-flex p-0.5 rounded-lg border transition-colors ${
          isLight
            ? 'bg-zinc-100 border-zinc-200'
            : 'bg-zinc-800/80 border-zinc-700'
        }`}
      >
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`relative px-3.5 py-1.5 rounded-md text-xs font-medium transition-all duration-150 ease-out active:scale-[0.97] select-none flex items-center gap-1.5 ${
                isActive
                  ? isLight
                    ? 'bg-white text-zinc-900 font-semibold shadow-xs'
                    : 'bg-zinc-700 text-white font-semibold shadow-xs'
                  : isLight
                  ? 'text-zinc-500 hover:text-zinc-900'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.icon}
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                    isActive
                      ? isLight
                        ? 'bg-zinc-100 text-zinc-800 font-bold'
                        : 'bg-zinc-800 text-white'
                      : isLight
                      ? 'bg-zinc-200/60 text-zinc-500'
                      : 'bg-zinc-800 text-zinc-400'
                  }`}
                >
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Global Actions */}
      <div className="flex items-center gap-2">
        {onCheckUpdates && (
          <GlassButton
            variant="glass"
            size="sm"
            onClick={onCheckUpdates}
            disabled={isCheckingUpdates}
            icon={<RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isCheckingUpdates ? 'animate-spin' : ''}`} />}
          >
            {isCheckingUpdates ? 'Checking...' : 'Check for Updates'}
          </GlassButton>
        )}

        {updateCount > 0 && (
          <GlassButton
            variant="primary"
            size="sm"
            onClick={onUpdateAll}
            icon={<ArrowDownCircle className="w-3.5 h-3.5 fill-current" />}
          >
            Update All ({updateCount})
          </GlassButton>
        )}
      </div>
    </div>
  );
};
