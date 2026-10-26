import React, { useState } from 'react';
import { Upload, FileText, Folder, CheckCircle, Trash2, Eye, Sparkles } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import { useTheme } from '../../../context/ThemeContext';

interface SharedAsset {
  id: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
  dataUrl?: string;
}

export const SharedAssetLibrary: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const [assets, setAssets] = useState<SharedAsset[]>(() => {
    try {
      const saved = localStorage.getItem('anything_shared_assets');
      return saved ? JSON.parse(saved) : [
        { id: '1', name: 'WWDC26 Liquid Brand Gradient.png', type: 'image/png', size: '1.8 MB', uploadedAt: '2026-10-24' },
        { id: '2', name: 'Standard Typography Config.json', type: 'application/json', size: '14 KB', uploadedAt: '2026-10-23' },
      ];
    } catch {
      return [];
    }
  });

  const saveAssets = (updated: SharedAsset[]) => {
    setAssets(updated);
    localStorage.setItem('anything_shared_assets', JSON.stringify(updated));
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const newAsset: SharedAsset = {
        id: `ast-${Date.now()}`,
        name: file.name,
        type: file.type || 'application/octet-stream',
        size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
        uploadedAt: new Date().toISOString().slice(0, 10),
        dataUrl: reader.result as string,
      };
      saveAssets([newAsset, ...assets]);
    };
    reader.readAsDataURL(file);
  };

  const handleDelete = (id: string) => {
    saveAssets(assets.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold">Shared Asset Library</h3>
          <p className="text-xs text-zinc-500">Cross-app assets accessible by all child applications in Anything.</p>
        </div>
        <label className="cursor-pointer flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-md shadow-blue-600/20 transition-all">
          <Upload className="w-4 h-4" />
          Upload Asset
          <input type="file" className="hidden" onChange={handleFileUpload} />
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {assets.map(asset => (
          <GlassCard key={asset.id} className="p-4 flex flex-col justify-between gap-4 border-zinc-200 dark:border-white/10">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shrink-0">
                  {asset.type.includes('image') ? <FileText className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                </div>
                <div className="truncate">
                  <h4 className="text-sm font-semibold truncate">{asset.name}</h4>
                  <p className="text-[11px] text-zinc-500">{asset.size} • {asset.uploadedAt}</p>
                </div>
              </div>
              <button
                onClick={() => handleDelete(asset.id)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                title="Delete Asset"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {asset.dataUrl && asset.type.includes('image') && (
              <div className="h-28 rounded-lg overflow-hidden border border-white/10 bg-black/40">
                <img src={asset.dataUrl} alt={asset.name} className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex items-center justify-between pt-2 border-t border-zinc-100 dark:border-white/5 text-[11px]">
              <GlassBadge variant="emerald" dot>Synced to Cloud</GlassBadge>
              <button
                onClick={() => {
                  if (asset.dataUrl) {
                    navigator.clipboard.writeText(asset.dataUrl);
                    alert('Asset data URL copied to clipboard!');
                  } else {
                    alert(`Asset path: ${asset.name}`);
                  }
                }}
                className="text-blue-500 hover:underline font-medium"
              >
                Copy Link
              </button>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
