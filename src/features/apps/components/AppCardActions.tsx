import React from 'react';
import { Play, Download, RefreshCw, AlertTriangle, MoreHorizontal, Wrench, Trash2, FolderOpen, Sparkles } from 'lucide-react';
import type { CatalogApp } from '../../../types/app.types';
import { GlassButton } from '../../../components/ui/GlassButton';
import { useTheme } from '../../../context/ThemeContext';

interface AppCardActionsProps {
  app: CatalogApp;
  onInstall: (app: CatalogApp) => void;
  onLaunch: (app: CatalogApp) => void;
  onUpdate: (app: CatalogApp) => void;
  onFixPath: (app: CatalogApp) => void;
  onUninstall: (appId: string) => void;
  onDeleteApp?: (appId: string) => void;
  onCustomizeLoader?: (app: CatalogApp) => void;
}

export const AppCardActions: React.FC<AppCardActionsProps> = ({
  app,
  onInstall,
  onLaunch,
  onUpdate,
  onFixPath,
  onUninstall,
  onDeleteApp,
  onCustomizeLoader,
}) => {
  const [showMenu, setShowMenu] = React.useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      className={`pt-3 border-t mt-3 relative transition-colors ${
        isLight ? 'border-zinc-100' : 'border-zinc-800'
      }`}
    >
      {/* Downloading / Extracting / Installing Progress Bar */}
      {app.status === 'downloading' && (
        <div className="mb-2 space-y-1">
          <div className="flex justify-between text-[10px] font-mono text-zinc-600 dark:text-zinc-400">
            <span>
              {app.downloadProgress?.percent && app.downloadProgress.percent >= 85
                ? 'Installing silently...'
                : `Downloading... ${app.downloadProgress?.percent || 0}%`}
            </span>
            <span>
              {app.downloadProgress?.speedBytesPerSec
                ? `${(app.downloadProgress.speedBytesPerSec / (1024 * 1024)).toFixed(1)} MB/s`
                : ''}
            </span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
            <div
              className="h-full rounded-full bg-cyan-500 transition-all duration-200"
              style={{ width: `${app.downloadProgress?.percent || 5}%` }}
            />
          </div>
        </div>
      )}

      {(app.status === 'extracting' || (app as any).status === 'installing') && (
        <div className="mb-2 flex items-center justify-between text-[11px] font-mono text-zinc-600 dark:text-zinc-400">
          <span className="flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 animate-spin text-cyan-500" />
            <span>Installing silently...</span>
          </span>
          <span>99%</span>
        </div>
      )}

      <div className="flex items-center justify-between gap-2">
        <span
          className={`text-[10px] font-mono truncate ${
            isLight ? 'text-zinc-500 font-medium' : 'text-zinc-400'
          }`}
        >
          {app.status === 'installed'
            ? `v${app.localVersion || app.version} · Installed`
            : app.status === 'update-available'
            ? `v${app.localVersion || 'old'} → v${app.version}`
            : app.status === 'path-broken'
            ? 'Path Missing'
            : app.size || 'Ready'}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Main Action Button Based on Lifecycle */}
          {app.status === 'installed' && (
            <GlassButton
              variant="glass"
              size="sm"
              icon={<Play className="w-3 h-3 fill-current" />}
              onClick={(e) => {
                e.stopPropagation();
                onLaunch(app);
              }}
              className="text-xs px-3 font-semibold"
            >
              Open
            </GlassButton>
          )}

          {app.status === 'update-available' && (
            <GlassButton
              variant="accent"
              size="sm"
              icon={<RefreshCw className="w-3 h-3" />}
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(app);
              }}
              className="text-xs px-3 font-semibold"
            >
              Update
            </GlassButton>
          )}

          {app.status === 'not-installed' && (
            <GlassButton
              variant="primary"
              size="sm"
              icon={<Download className="w-3 h-3" />}
              onClick={(e) => {
                e.stopPropagation();
                onInstall(app);
              }}
              className="text-xs px-3 font-semibold"
            >
              Install
            </GlassButton>
          )}

          {app.status === 'path-broken' && (
            <GlassButton
              variant="danger"
              size="sm"
              icon={<AlertTriangle className="w-3.5 h-3.5" />}
              onClick={(e) => {
                e.stopPropagation();
                onFixPath(app);
              }}
              className="text-xs px-3 border-amber-500/40 text-amber-300 bg-amber-500/15"
            >
              Fix Path
            </GlassButton>
          )}

          {/* Options Dropdown Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="w-7 h-7 rounded-full flex items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors"
              title="Options"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className="absolute right-0 bottom-full mb-1.5 w-48 rounded-xl bg-slate-900/95 border border-white/15 backdrop-blur-2xl shadow-2xl py-1.5 z-30 text-xs text-white/80 select-none animate-fadeIn"
              >
                {onCustomizeLoader && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onCustomizeLoader(app);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-cyan-500/15 text-cyan-300 flex items-center gap-2 transition-colors font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Customize Loader</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onFixPath(app);
                  }}
                  className="w-full px-3 py-2 text-left hover:bg-white/10 flex items-center gap-2 transition-colors"
                >
                  <Wrench className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Locate Executable</span>
                </button>

                {(app.status === 'installed' || app.status === 'ready' || app.status === 'update-available' || Boolean(app.installedPath)) && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onUninstall(app.id);
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-rose-500/15 text-rose-300 flex items-center gap-2 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                    <span>Uninstall App</span>
                  </button>
                )}

                {onDeleteApp && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      if (
                        window.confirm(
                          `Are you sure you want to completely delete "${app.name}" and remove all its releases from Anything?`
                        )
                      ) {
                        onDeleteApp(app.id);
                      }
                    }}
                    className="w-full px-3 py-2 text-left hover:bg-rose-500/20 text-rose-400 flex items-center gap-2 transition-colors border-t border-white/10 mt-1 pt-1.5"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span className="font-semibold text-rose-300">Delete from Anything</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
