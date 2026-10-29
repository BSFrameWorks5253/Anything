import React from 'react';
import { Play, Download, RefreshCw, AlertTriangle, MoreHorizontal, Wrench, Trash2, Sparkles } from 'lucide-react';
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
  onEditApp?: (app: CatalogApp) => void;
  onTryDemo?: (app: CatalogApp) => void;
}

export const AppCardActions: React.FC<AppCardActionsProps> = ({
  app,
  onInstall,
  onLaunch,
  onUpdate,
  onFixPath,
  onUninstall,
  onCustomizeLoader,
  onTryDemo,
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
            : app.status === 'trial'
            ? 'Demo Active'
            : app.size || 'Ready'}
        </span>

        <div className="flex items-center gap-1.5">
          {/* Action Buttons with Tactile Feedback */}
          {app.status === 'installed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onLaunch(app);
              }}
              className={`text-xs px-3.5 py-1 rounded-full border font-semibold transition-all duration-150 ease-out active:scale-[0.97] flex items-center gap-1.5 cursor-pointer select-none ${
                isLight
                  ? 'border-zinc-300 text-zinc-900 hover:bg-zinc-100 hover:border-zinc-400 shadow-xs'
                  : 'border-zinc-600 text-white hover:bg-white/10 hover:border-zinc-500 shadow-xs'
              }`}
            >
              <Play className="w-3 h-3 fill-current" />
              <span>Open</span>
            </button>
          )}

          {app.status === 'trial' && (
            <div className="flex items-center gap-1.5">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (onTryDemo) onTryDemo(app);
                  else onLaunch(app);
                }}
                className="text-xs px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 dark:text-emerald-300 font-semibold hover:bg-emerald-500/30 active:scale-[0.97] transition-all duration-150 flex items-center gap-1 cursor-pointer select-none"
                title="Launch Software Demo"
              >
                <Play className="w-3 h-3 fill-current" />
                <span>Demo</span>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInstall(app);
                }}
                className="text-xs px-3.5 py-1 rounded-full bg-[#1473E6] hover:bg-[#0d66d0] text-white font-semibold shadow-xs active:scale-[0.97] transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none"
                title="Install Full Version"
              >
                <Download className="w-3 h-3" />
                <span>Install</span>
              </button>
            </div>
          )}

          {app.status === 'update-available' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUpdate(app);
              }}
              className="text-xs px-3.5 py-1 rounded-full bg-[#1473E6] hover:bg-[#0d66d0] text-white font-semibold shadow-xs active:scale-[0.97] transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Update</span>
            </button>
          )}

          {app.status === 'not-installed' && (
            <div className="flex items-center gap-1.5">
              {onTryDemo && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onTryDemo(app);
                  }}
                  className={`text-xs px-3 py-1 rounded-full border font-medium active:scale-[0.97] transition-all duration-150 flex items-center gap-1 cursor-pointer select-none ${
                    isLight
                      ? 'border-cyan-600/30 hover:border-cyan-600 text-cyan-700 hover:bg-cyan-500/10'
                      : 'border-cyan-500/30 hover:border-cyan-400 text-cyan-300 hover:bg-cyan-500/10'
                  }`}
                  title="Try Software Demo / Sandbox"
                >
                  <Sparkles className="w-3 h-3 text-cyan-500" />
                  <span>Try</span>
                </button>
              )}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onInstall(app);
                }}
                className="text-xs px-3.5 py-1 rounded-full bg-[#1473E6] hover:bg-[#0d66d0] text-white font-semibold shadow-xs active:scale-[0.97] transition-all duration-150 flex items-center gap-1.5 cursor-pointer select-none"
              >
                <Download className="w-3 h-3" />
                <span>Install</span>
              </button>
            </div>
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
              className="text-xs px-3 border-amber-500/40 text-amber-500 dark:text-amber-300 bg-amber-500/15"
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
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer select-none ${
                isLight
                  ? 'text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100'
                  : 'text-zinc-400 hover:text-white hover:bg-white/10'
              }`}
              title="Options"
            >
              <MoreHorizontal className="w-3.5 h-3.5" />
            </button>

            {showMenu && (
              <div
                onClick={(e) => e.stopPropagation()}
                className={`absolute right-0 bottom-full mb-1.5 w-48 rounded-xl border backdrop-blur-2xl py-1.5 z-30 text-xs select-none shadow-2xl animate-in fade-in zoom-in-95 duration-100 ${
                  isLight
                    ? 'bg-white/95 border-zinc-200 text-zinc-800 shadow-zinc-300/60'
                    : 'bg-zinc-900/95 border-zinc-700 text-zinc-100 shadow-black/80'
                }`}
              >
                {onTryDemo && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onTryDemo(app);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors font-medium border-b mb-1 ${
                      isLight
                        ? 'border-zinc-100 hover:bg-cyan-50 text-cyan-700'
                        : 'border-zinc-800 hover:bg-cyan-500/15 text-cyan-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Try / Demo Mode</span>
                  </button>
                )}

                {onCustomizeLoader && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onCustomizeLoader(app);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors font-medium ${
                      isLight
                        ? 'hover:bg-cyan-50 text-cyan-700'
                        : 'hover:bg-cyan-500/15 text-cyan-300'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
                    <span>Customize Loader</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowMenu(false);
                    onFixPath(app);
                  }}
                  className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors ${
                    isLight ? 'hover:bg-zinc-100 text-zinc-700' : 'hover:bg-white/10 text-zinc-200'
                  }`}
                >
                  <Wrench className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Locate Executable</span>
                </button>

                {(app.status === 'installed' || app.status === 'ready' || app.status === 'update-available' || Boolean(app.installedPath)) && (
                  <button
                    onClick={() => {
                      setShowMenu(false);
                      onUninstall(app.id);
                    }}
                    className={`w-full px-3 py-2 text-left flex items-center gap-2 transition-colors ${
                      isLight
                        ? 'hover:bg-rose-50 text-rose-600'
                        : 'hover:bg-rose-500/15 text-rose-400'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Uninstall App</span>
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
