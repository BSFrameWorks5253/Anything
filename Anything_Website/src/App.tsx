import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { AppsPage } from './pages/AppsPage';
import { AppDetailPage } from './pages/AppDetailPage';
import { OnlineToolsPage } from './pages/OnlineToolsPage';
import { ComparePage } from './pages/ComparePage';
import { AboutPage } from './pages/AboutPage';
import { DownloadModal } from './components/DownloadModal';
import { CommandPalette } from './components/CommandPalette';

// Scroll to top & update document title on route change
const RouteManager: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
    if (location.pathname === '/apps') {
      document.title = 'Applications & Downloads — Anything';
    } else if (location.pathname.startsWith('/apps/')) {
      document.title = 'Application Specification — Anything';
    } else if (location.pathname === '/tools') {
      document.title = 'Free In-Browser Acrobat PDF Tools — Anything';
    } else if (location.pathname === '/compare') {
      document.title = 'Adobe Acrobat DC Pro vs Anything Suite — 100% Free';
    } else if (location.pathname === '/about') {
      document.title = 'The Freedom Manifesto & Architecture — Anything';
    } else {
      document.title = 'Anything — The Free Adobe Acrobat & Creative Suite';
    }
  }, [location]);

  return null;
};

export function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const [downloadAppId, setDownloadAppId] = useState('anything-hub');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 350);
    return () => clearTimeout(timer);
  }, []);

  const handleOpenDownload = (appId: string = 'anything-hub') => {
    setDownloadAppId(appId);
    setDownloadModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="w-screen h-screen bg-[#070709] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center font-black text-white text-2xl shadow-2xl shadow-red-500/30 animate-pulse">
            An
          </div>
          <div className="w-36 h-1 bg-zinc-800 rounded-full overflow-hidden">
            <div className="w-full h-full bg-gradient-to-r from-red-500 via-cyan-400 to-indigo-500 animate-[shimmer_1s_infinite]" />
          </div>
          <span className="text-[11px] font-mono text-zinc-500">
            Initializing Liquid Glass Suite...
          </span>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <RouteManager />
      <div className="min-h-screen bg-[#070709] text-zinc-100 flex flex-col font-sans selection:bg-rose-500/30">
        <Navbar 
          onOpenDownloadModal={() => handleOpenDownload('anything-hub')} 
          onOpenCommandPalette={() => setCommandPaletteOpen(true)}
        />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/apps" element={<AppsPage />} />
            <Route path="/apps/:appId" element={<AppDetailPage />} />
            <Route path="/tools" element={<OnlineToolsPage />} />
            <Route path="/compare" element={<ComparePage />} />
            <Route path="/about" element={<AboutPage />} />
          </Routes>
        </main>
        <Footer />

        {/* Global Download Modal */}
        <DownloadModal
          isOpen={downloadModalOpen}
          onClose={() => setDownloadModalOpen(false)}
          selectedAppId={downloadAppId}
        />

        {/* Global Command Palette (Ctrl+K / ⌘K) */}
        <CommandPalette
          isOpen={commandPaletteOpen}
          onClose={() => setCommandPaletteOpen(false)}
          onOpenDownload={(id) => handleOpenDownload(id || 'anything-hub')}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;
