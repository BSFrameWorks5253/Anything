import React, { useState } from 'react';
import { Upload, FolderOpen } from 'lucide-react';
import type { CreativeApp } from '../../../../types/app.types';
import { GlassCard } from '../../../../components/ui/GlassCard';
import { GlassButton } from '../../../../components/ui/GlassButton';
import { useTheme } from '../../../../context/ThemeContext';

interface ExeDropTargetProps {
  onAutoAdd: (newApp: CreativeApp) => void;
}

const colorPresets = [
  { gradient: 'from-blue-600 via-sky-500 to-cyan-400', textColor: '#38bdf8', glow: 'rgba(56, 189, 248, 0.45)' },
  { gradient: 'from-violet-700 via-purple-600 to-indigo-500', textColor: '#c084fc', glow: 'rgba(192, 132, 252, 0.45)' },
  { gradient: 'from-amber-600 via-orange-500 to-yellow-400', textColor: '#fbbf24', glow: 'rgba(251, 191, 36, 0.45)' },
  { gradient: 'from-emerald-500 via-teal-400 to-cyan-400', textColor: '#2dd4bf', glow: 'rgba(45, 212, 191, 0.45)' },
  { gradient: 'from-pink-600 via-rose-500 to-orange-400', textColor: '#fb7185', glow: 'rgba(251, 113, 133, 0.45)' },
];

export const ExeDropTarget: React.FC<ExeDropTargetProps> = ({ onAutoAdd }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const processDroppedFile = (file: File) => {
    // Extract base name without extension
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const cleanName = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
    const shortCode = cleanName.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase() || cleanName.slice(0, 2).toUpperCase();
    
    // Pick random stylish gradient
    const randomPreset = colorPresets[Math.floor(Math.random() * colorPresets.length)];

    // Path in Electron File object
    const filePath = (file as any).path || file.name;

    const newApp: CreativeApp = {
      id: `app-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      name: cleanName,
      shortName: shortCode,
      category: 'Custom Tools',
      description: `Locally registered application from ${file.name}.`,
      gradient: randomPreset.gradient,
      textColor: randomPreset.textColor,
      glowColor: randomPreset.glow,
      version: '1.0.0',
      status: 'installed',
      size: 'Local Executable',
      executablePath: filePath,
      badgeTag: 'Auto-Linked',
      isCustom: true,
      addedAt: Date.now(),
    };

    onAutoAdd(newApp);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        processDroppedFile(e.dataTransfer.files[i]);
      }
    }
  };

  const handleBrowse = async () => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.selectExecutable) {
      const pickedPath = await electronAPI.selectExecutable();
      if (pickedPath) {
        const baseName = pickedPath.split(/[\/\\]/).pop()?.replace(/\.[^/.]+$/, '') || 'Application';
        const cleanName = baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase());
        const shortCode = cleanName.split(' ').map((w) => w[0]).join('').slice(0, 3).toUpperCase() || cleanName.slice(0, 2).toUpperCase();
        const randomPreset = colorPresets[Math.floor(Math.random() * colorPresets.length)];

        onAutoAdd({
          id: `app-${Date.now()}`,
          name: cleanName,
          shortName: shortCode,
          category: 'Custom Tools',
          description: `Linked native executable: ${pickedPath}`,
          gradient: randomPreset.gradient,
          textColor: randomPreset.textColor,
          glowColor: randomPreset.glow,
          version: '1.0.0',
          status: 'installed',
          size: 'Native App',
          executablePath: pickedPath,
          badgeTag: 'Native System',
          isCustom: true,
          addedAt: Date.now(),
        });
      }
    } else {
      alert('File browser is active in the Electron desktop shell. You can also drag & drop files here.');
    }
  };

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragOver(true);
      }}
      onDragLeave={(e) => {
        e.preventDefault();
        setIsDragOver(false);
      }}
      onDrop={handleDrop}
    >
      <GlassCard
        variant="interactive"
        className={`p-6 border-dashed transition-all duration-300 flex flex-col items-center justify-center text-center ${
          isDragOver
            ? isLight
              ? 'border-sky-500 bg-sky-500/15 scale-[1.01] shadow-[0_0_35px_rgba(14,165,233,0.3)]'
              : 'border-cyan-400 bg-cyan-950/30 scale-[1.01] shadow-[0_0_35px_rgba(56,189,248,0.3)]'
            : isLight
            ? 'border-slate-300 hover:border-sky-400 bg-white/70 hover:bg-white/90 shadow-sm'
            : 'border-white/15 hover:border-white/30 bg-white/[0.02]'
        }`}
      >
        <div
          className={`w-13 h-13 rounded-2xl flex items-center justify-center mb-3 border ${
            isLight
              ? 'bg-sky-500/10 border-sky-400/25 shadow-sm'
              : 'bg-white/[0.06] border-white/10'
          }`}
        >
          <Upload className={`w-6 h-6 ${isLight ? 'text-sky-600' : 'text-cyan-400'}`} />
        </div>

        <h4
          className={`text-sm font-bold tracking-tight ${
            isLight ? 'text-slate-900' : 'text-white'
          }`}
        >
          Drop any .exe, .bat, or Desktop Shortcut here
        </h4>
        <p
          className={`text-xs mt-1 max-w-md ${
            isLight ? 'text-slate-600 font-medium' : 'text-white/50'
          }`}
        >
          Instantly parses the app, generates a 3D liquid glass icon, and links execution path automatically.
        </p>

        <div className="mt-4 flex items-center gap-2">
          <GlassButton
            variant="glass"
            size="sm"
            onClick={handleBrowse}
            icon={<FolderOpen className={`w-3.5 h-3.5 ${isLight ? 'text-sky-600' : 'text-cyan-400'}`} />}
          >
            Browse from PC (.exe)
          </GlassButton>
        </div>
      </GlassCard>
    </div>
  );
};
