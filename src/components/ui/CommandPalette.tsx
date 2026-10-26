import React, { useState, useEffect, useRef } from 'react';
import { Command, Search, Sparkles, Zap, Package, Settings, FileText, User, Home, CornerDownLeft, ArrowDown, ArrowUp } from 'lucide-react';
import type { CatalogApp, NavigationPage } from '../../types/app.types';

interface CommandItem {
  id: string;
  label: string;
  category: 'Navigation' | 'Apps' | 'Actions' | 'Workspace';
  icon: React.ReactNode;
  shortcut?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  apps: CatalogApp[];
  onNavigate: (page: NavigationPage) => void;
  onLaunchApp: (app: CatalogApp) => void;
  onCheckUpdates: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  apps,
  onNavigate,
  onLaunchApp,
  onCheckUpdates,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const navigationCommands: CommandItem[] = [
    { id: 'nav-home', label: 'Go to Home', category: 'Navigation', icon: <Home className="w-4 h-4" />, action: () => onNavigate('home') },
    { id: 'nav-apps', label: 'Go to Apps Hub', category: 'Navigation', icon: <Package className="w-4 h-4" />, action: () => onNavigate('apps') },
    { id: 'nav-publisher', label: 'Go to Publisher Portal', category: 'Navigation', icon: <Sparkles className="w-4 h-4" />, action: () => onNavigate('publisher') },
    { id: 'nav-files', label: 'Go to Files & Assets', category: 'Navigation', icon: <FileText className="w-4 h-4" />, action: () => onNavigate('files') },
    { id: 'nav-settings', label: 'Go to Settings', category: 'Navigation', icon: <Settings className="w-4 h-4" />, action: () => onNavigate('settings') },
    { id: 'nav-creator', label: 'Go to Creator Profile', category: 'Navigation', icon: <User className="w-4 h-4" />, action: () => onNavigate('creator') },
  ];

  const actionCommands: CommandItem[] = [
    { id: 'action-updates', label: 'Check for Updates', category: 'Actions', icon: <Zap className="w-4 h-4" />, action: onCheckUpdates },
    { id: 'action-theme', label: 'Toggle Theme', category: 'Actions', icon: <Sparkles className="w-4 h-4" />, action: () => {
      const current = document.documentElement.getAttribute('data-theme');
      document.documentElement.setAttribute('data-theme', current === 'dark' ? 'light' : 'dark');
    } },
  ];

  const appCommands: CommandItem[] = apps
    .filter(app => app.status === 'installed' || app.status === 'update-available')
    .map(app => ({
      id: `app-${app.id}`,
      label: `Launch ${app.name}`,
      category: 'Apps' as const,
      icon: app.iconType === 'image' ? (
        <img src={app.iconValue} className="w-4 h-4 rounded-sm object-contain" alt="" />
      ) : (
        <span className="text-xs">{app.iconValue || '⚡'}</span>
      ),
      action: () => onLaunchApp(app),
    }));

  const allCommands = [...navigationCommands, ...appCommands, ...actionCommands];
  const filteredCommands = allCommands.filter(c =>
    c.label.toLowerCase().includes(query.toLowerCase()) ||
    c.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 10);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => (prev + 1) % filteredCommands.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => (prev - 1 + filteredCommands.length) % filteredCommands.length);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-start justify-center pt-[15vh] px-4 bg-black/60 backdrop-blur-md transition-all duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-zinc-900/90 border border-white/10 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center px-5 py-4 border-b border-white/5 bg-white/5">
          <Search className="w-5 h-5 text-zinc-500 mr-3" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none text-zinc-100 text-lg placeholder-zinc-500"
            placeholder="Type a command or search for an app..."
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
          />
          <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-white/5 border border-white/10 text-[10px] text-zinc-400 font-mono">
            ESC
          </div>
        </div>

        <div className="max-h-[400px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-white/10">
          {filteredCommands.length > 0 ? (
            <div className="space-y-1">
              {filteredCommands.map((cmd, index) => {
                const isSelected = index === selectedIndex;
                const isFirstInCategory = index === 0 || filteredCommands[index - 1].category !== cmd.category;

                return (
                  <React.Fragment key={cmd.id}>
                    {isFirstInCategory && (
                      <div className="px-3 py-2 text-[10px] uppercase tracking-wider font-bold text-zinc-500 mt-2 first:mt-0">
                        {cmd.category}
                      </div>
                    )}
                    <button
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-150 ${
                        isSelected
                          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                          : 'text-zinc-400 hover:bg-white/5 border border-transparent'
                      }`}
                      onClick={() => {
                        cmd.action();
                        onClose();
                      }}
                      onMouseEnter={() => setSelectedIndex(index)}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`p-1.5 rounded-md ${isSelected ? 'bg-blue-500/20' : 'bg-zinc-800'}`}>
                          {cmd.icon}
                        </div>
                        <span className={`text-sm font-medium ${isSelected ? 'text-zinc-100' : ''}`}>{cmd.label}</span>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-[10px] text-blue-400 opacity-80">
                          <CornerDownLeft className="w-3 h-3" />
                          ENTER
                        </div>
                      )}
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center justify-center text-zinc-500 text-sm">
              <div className="p-3 bg-zinc-800 rounded-full mb-3">
                <Search className="w-6 h-6 opacity-20" />
              </div>
              No results found for "{query}"
            </div>
          )}
        </div>

        <div className="px-4 py-3 bg-black/40 border-t border-white/5 flex items-center justify-between text-[11px] text-zinc-500 font-medium">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10 flex items-center"><ArrowUp className="w-2 h-2" /></kbd>
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10 flex items-center"><ArrowDown className="w-2 h-2" /></kbd>
              to navigate
            </span>
            <span className="flex items-center gap-1.5">
              <kbd className="px-1.5 py-0.5 rounded bg-zinc-800 border border-white/10 flex items-center"><CornerDownLeft className="w-2 h-2" /></kbd>
              to select
            </span>
          </div>
          <div className="flex items-center gap-2 text-zinc-600">
            Anything v26.10.26
          </div>
        </div>
      </div>
    </div>
  );
};
