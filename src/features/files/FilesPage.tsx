import React, { useState } from 'react';
import { mockCloudFiles } from '../../data/apps.data';
import type { CloudFileItem } from '../../types/app.types';
import { FilesHeader } from './components/FilesHeader';
import { FilesStats } from './components/FilesStats';
import { FilesTable } from './components/FilesTable';
import { FileDropZone } from './components/FileDropZone';
import { FilePreviewModal } from './components/FilePreviewModal';
import { SharedAssetLibrary } from './components/SharedAssetLibrary';
import { MediaFlowEventBadgesCard } from './components/MediaFlowEventBadgesCard';
import { MacDropShelf } from './components/MacDropShelf';
import { OneTapTitlesTab } from './components/OneTapTitlesTab';
import { Layers, Folder, QrCode, FileText, Film } from 'lucide-react';

interface FilesPageProps {
  searchQuery: string;
}

export const FilesPage: React.FC<FilesPageProps> = ({ searchQuery }) => {
  const [files, setFiles] = useState<CloudFileItem[]>(() => {
    const saved = localStorage.getItem('creative_cloud_files');
    return saved ? JSON.parse(saved) : mockCloudFiles;
  });

  const [selectedFile, setSelectedFile] = useState<CloudFileItem | null>(null);
  const [activeTab, setActiveTab] = useState<'shelf' | 'cloud' | 'shared' | 'onetap'>('shelf');

  const saveFiles = (updated: CloudFileItem[]) => {
    setFiles(updated);
    localStorage.setItem('creative_cloud_files', JSON.stringify(updated));
  };

  const handleFilesDropped = (newItems: CloudFileItem[]) => {
    saveFiles([...newItems, ...files]);
  };

  const handleDeleteFile = (id: string) => {
    saveFiles(files.filter((f) => f.id !== id));
  };

  const filteredFiles = files.filter((f) => {
    if (!f) return false;
    const q = (searchQuery || '').toLowerCase();
    if (!q) return true;
    const name = (f.name || '').toLowerCase();
    const appShort = (f.appShort || '').toLowerCase();
    return name.includes(q) || appShort.includes(q);
  });

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-14 animate-fadeIn">
      {/* Header with CTA */}
      <FilesHeader
        onNewFile={() => {
          const dummy: CloudFileItem = {
            id: `file-${Date.now()}`,
            name: 'New Spatial Composition.psd',
            appShort: 'Ps',
            appGradient: 'from-blue-600 to-cyan-400',
            appTextColor: '#38bdf8',
            modified: 'Just now',
            size: '24 MB',
            status: 'synced',
          };
          saveFiles([dummy, ...files]);
        }}
      />

      {/* Modern Segmented Navigation Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-zinc-200/80 dark:bg-zinc-900/60 border border-zinc-300 dark:border-zinc-700/60 rounded-xl w-fit backdrop-blur-md">
        <button
          onClick={() => setActiveTab('shelf')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'shelf'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <Layers className="w-3.5 h-3.5 text-blue-500" />
          <span>Mac Drop Shelf & Mobile QR</span>
        </button>

        <button
          onClick={() => setActiveTab('cloud')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'cloud'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-indigo-400" />
          <span>Cloud Documents</span>
        </button>

        <button
          onClick={() => setActiveTab('shared')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'shared'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <Folder className="w-3.5 h-3.5 text-purple-400" />
          <span>Shared Library & MediaFlow Badges</span>
        </button>

        <button
          onClick={() => setActiveTab('onetap')}
          className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'onetap'
              ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10'
              : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
          }`}
        >
          <Film className="w-3.5 h-3.5 text-amber-500" />
          <span>Final Titles (One Tap)</span>
        </button>
      </div>

      {/* Tab 1: Mac Drop Shelf & Mobile QR Direct Image Hub */}
      {activeTab === 'shelf' && (
        <div className="space-y-6">
          <MacDropShelf />
        </div>
      )}

      {/* Tab 2: Cloud Documents Table */}
      {activeTab === 'cloud' && (
        <>
          {/* Storage category stats */}
          <FilesStats />

          {/* OS Drag and Drop Zone */}
          <FileDropZone onFilesDropped={handleFilesDropped} />

          {/* Cloud Documents Table */}
          <FilesTable files={filteredFiles} onOpenFile={(f) => setSelectedFile(f)} />

          {/* File Lightbox / Palette Modal */}
          <FilePreviewModal
            file={selectedFile}
            isOpen={Boolean(selectedFile)}
            onClose={() => setSelectedFile(null)}
            onDelete={handleDeleteFile}
          />
        </>
      )}

      {/* Tab 3: Shared Library & MediaFlow Badges */}
      {activeTab === 'shared' && (
        <div className="space-y-6">
          {/* MediaFlow Studio Master Event Badges Directory Card */}
          <MediaFlowEventBadgesCard />

          {/* General Shared Asset Library */}
          <SharedAssetLibrary />
        </div>
      )}

      {/* Tab 4: One Tap Final Titles Two-Way Synced Hub */}
      {activeTab === 'onetap' && (
        <div className="space-y-6">
          <OneTapTitlesTab searchQuery={searchQuery} />
        </div>
      )}
    </div>
  );
};
