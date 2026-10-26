import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Search, 
  FileText,
  Sparkles, 
  Download, 
  Volume2, 
  VolumeX,
  X,
  ArrowRight
} from 'lucide-react';
import { ecosystemApps } from '../data/apps';
import { soundFx } from '../utils/audio';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenDownload: (appId?: string) => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ 
  isOpen, 
  onClose,
  onOpenDownload
}) => {
  const [query, setQuery] = useState('');
  const [audioEnabled, setAudioEnabled] = useState(soundFx.enabled);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open
          soundFx.playClick();
        }
      } else if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const toggleAudio = () => {
    soundFx.enabled = !soundFx.enabled;
    setAudioEnabled(soundFx.enabled);
    if (soundFx.enabled) soundFx.playSuccess();
  };

  const filteredApps = ecosystemApps.filter(app => 
    app.name.toLowerCase().includes(query.toLowerCase()) ||
    app.tagline.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="liquid-glass-bright max-w-xl w-full rounded-3xl p-4 sm:p-6 shadow-2xl border-white/20 relative animate-in zoom-in-95 duration-150 space-y-4">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 pb-3 border-b border-white/10">
          <Search className="w-5 h-5 text-cyan-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, application, or tool..."
            className="w-full bg-transparent text-white text-sm focus:outline-none placeholder:text-zinc-500"
          />
          <kbd className="hidden sm:inline px-2 py-0.5 rounded bg-white/10 font-mono text-[10px] text-zinc-400">
            ESC
          </kbd>
          <button onClick={onClose} className="text-zinc-400 hover:text-white sm:hidden">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Commands & Tools */}
        <div className="space-y-1">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 block mb-1">
            Quick Actions
          </span>

          <button
            onClick={() => {
              navigate('/tools');
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-xs text-white transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-rose-400" />
              <span>Launch In-Browser Free PDF Studio</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={() => {
              navigate('/compare');
              onClose();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-xs text-white transition-colors group"
          >
            <div className="flex items-center gap-2.5">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>View Adobe Acrobat vs Anything Matrix</span>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-zinc-500 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </button>

          <button
            onClick={toggleAudio}
            className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-white/10 text-xs text-white transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {audioEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-zinc-400" />}
              <span>Interactive Audio Sound Effects</span>
            </div>
            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${audioEnabled ? 'bg-emerald-500/20 text-emerald-400' : 'bg-white/5 text-zinc-500'}`}>
              {audioEnabled ? 'Active' : 'Muted'}
            </span>
          </button>
        </div>

        {/* Applications List */}
        <div className="space-y-1 pt-2 border-t border-white/5">
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-500 px-2 block mb-1">
            Applications ({filteredApps.length})
          </span>

          <div className="max-h-56 overflow-y-auto space-y-1">
            {filteredApps.map(app => (
              <div
                key={app.id}
                className="flex items-center justify-between p-2 rounded-xl hover:bg-white/10 transition-colors group text-xs"
              >
                <div 
                  onClick={() => {
                    navigate(`/apps/${app.id}`);
                    onClose();
                  }}
                  className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                >
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-tr ${app.gradient} flex items-center justify-center text-white text-[10px] font-bold`}>
                    {app.shortName}
                  </div>
                  <div className="truncate">
                    <span className="text-white font-bold block truncate group-hover:text-cyan-300">
                      {app.name}
                    </span>
                    <span className="text-[10px] text-zinc-400 truncate block">
                      {app.tagline}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    onOpenDownload(app.id);
                    onClose();
                  }}
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white font-semibold text-[11px] flex items-center gap-1 shrink-0 ml-2"
                >
                  <Download className="w-3 h-3" />
                  <span>Get .EXE</span>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer shortcuts helper */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-zinc-500 font-mono">
          <span>Navigate with mouse or keyboard</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
