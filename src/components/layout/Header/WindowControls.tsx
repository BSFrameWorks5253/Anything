import React, { useState, useEffect } from 'react';
import { Minus, Square, Copy, X } from 'lucide-react';
import { useTheme } from '../../../context/ThemeContext';

export const WindowControls: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.electronAPI?.isWindowMaximized) {
      window.electronAPI.isWindowMaximized().then((max) => setIsMaximized(Boolean(max)));
    }

    if (window.electronAPI?.onWindowStateChanged) {
      const unsubscribe = window.electronAPI.onWindowStateChanged((data) => {
        setIsMaximized(Boolean(data.isMaximized));
      });
      return () => {
        if (typeof unsubscribe === 'function') unsubscribe();
      };
    }
  }, []);

  const handleMinimize = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.electronAPI?.minimizeWindow();
  };

  const handleMaximize = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.electronAPI?.maximizeWindow) {
      const nowMax = await window.electronAPI.maximizeWindow();
      setIsMaximized(Boolean(nowMax));
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.electronAPI?.closeWindow();
  };

  return (
    <div
      className="flex items-center h-full select-none"
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      {/* Minimize */}
      <button
        onClick={handleMinimize}
        className={`w-11 h-full flex items-center justify-center transition-colors ${
          isLight
            ? 'text-zinc-500 hover:bg-zinc-200/80 hover:text-zinc-900 active:bg-zinc-300'
            : 'text-zinc-400 hover:bg-white/10 hover:text-white active:bg-white/15'
        }`}
        title="Minimize"
        aria-label="Minimize"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      {/* Maximize / Restore */}
      <button
        onClick={handleMaximize}
        className={`w-11 h-full flex items-center justify-center transition-colors ${
          isLight
            ? 'text-zinc-500 hover:bg-zinc-200/80 hover:text-zinc-900 active:bg-zinc-300'
            : 'text-zinc-400 hover:bg-white/10 hover:text-white active:bg-white/15'
        }`}
        title={isMaximized ? 'Restore' : 'Maximize'}
        aria-label={isMaximized ? 'Restore' : 'Maximize'}
      >
        {isMaximized ? (
          <Copy className="w-3 h-3 rotate-180" />
        ) : (
          <Square className="w-3 h-3" />
        )}
      </button>

      {/* Close (Windows Native Crimson Hover) */}
      <button
        onClick={handleClose}
        className="w-11 h-full flex items-center justify-center transition-colors text-zinc-500 dark:text-zinc-400 hover:bg-[#E81123] hover:text-white active:bg-[#C4101F]"
        title="Close"
        aria-label="Close"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
};
