import React, { useState } from 'react';
import { mockCloudFiles } from '../../data/apps.data';
import type { CloudFileItem } from '../../types/app.types';
import { FilesHeader } from './components/FilesHeader';
import { FilesStats } from './components/FilesStats';
import { FilesTable } from './components/FilesTable';
import { FileDropZone } from './components/FileDropZone';
import { FilePreviewModal } from './components/FilePreviewModal';
import { SharedAssetLibrary } from './components/SharedAssetLibrary';

interface FilesPageProps {
  searchQuery: string;
}

export const FilesPage: React.FC<FilesPageProps> = ({ searchQuery }) => {
  const [files, setFiles] = useState<CloudFileItem[]>(() => {
    const saved = localStorage.getItem('creative_cloud_files');
    return saved ? JSON.parse(saved) : mockCloudFiles;
  });

  const [selectedFile, setSelectedFile] = useState<CloudFileItem | null>(null);
  const [activeTab, setActiveTab] = useState<'cloud' | 'shared'>('cloud');

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

  const filteredFiles = files.filter(
    (f) =>
      !searchQuery ||
      f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.appShort.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-8 space-y-6 max-w-7xl mx-auto pb-14">
      {/* Header with CTA */}
      <FilesHeader onNewFile={() => {
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
      }} />

      {/* Tabs */}
      <div className="flex items-center gap-1 p-1 bg-zinc-900/40 border border-zinc-700/50 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('cloud')}
          className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${activeTab === 'cloud' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          Cloud Documents
        </button>
        <button
          onClick={() => setActiveTab('shared')}
          className={`px-4 py-1.5 rounded-md text-xs font-semibold transition-colors ${activeTab === 'shared' ? 'bg-zinc-800 text-white' : 'text-zinc-400 hover:text-white'}`}
        >
          Shared Asset Library
        </button>
      </div>

      {activeTab === 'cloud' ? (
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
      ) : (
        <SharedAssetLibrary />
      )}
    </div>
  );
};
