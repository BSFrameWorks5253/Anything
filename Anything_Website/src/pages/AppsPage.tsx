import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Download, 
  Search, 
  Sparkles, 
  ChevronRight, 
  SlidersHorizontal 
} from 'lucide-react';
import { ecosystemApps, type AppData } from '../data/apps';
import { DownloadModal } from '../components/DownloadModal';

export const AppsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [downloadModalOpen, setDownloadModalOpen] = useState(false);
  const [activeDownloadAppId, setActiveDownloadAppId] = useState('pdf-master');

  const categories = ['All', 'Productivity & PDF Mastery', 'Document Fusion & Engineering', 'Media & Video Production', 'Productivity & Workstation', 'Ecosystem & Central Launcher'];

  const filteredApps = ecosystemApps.filter((app: AppData) => {
    const matchesCategory = selectedCategory === 'All' || app.category === selectedCategory;
    const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          app.tagline.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const openDownload = (appId: string) => {
    setActiveDownloadAppId(appId);
    setDownloadModalOpen(true);
  };

  return (
    <div className="min-h-screen pt-28 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Official Application Directory</span>
          </div>
          <h1 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-4">
            Anything <span className="text-gradient">Ecosystem Apps</span>
          </h1>
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Discover sovereign, standalone Windows desktop software. Every tool is 100% free, runs in a local sandbox, and updates smoothly through Anything Hub.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="liquid-glass rounded-3xl p-4 sm:p-6 mb-10 border-white/10 shadow-xl space-y-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-80">
              <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools, features, formats..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-black/40 border border-white/10 text-white text-xs focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>

            {/* Quick Stats */}
            <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
              <span>Showing: <strong className="text-white">{filteredApps.length}</strong> of {ecosystemApps.length} Applications</span>
              <span>•</span>
              <span className="text-emerald-400 font-bold">100% Free Lifetime</span>
            </div>
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
            <SlidersHorizontal className="w-4 h-4 text-zinc-500 shrink-0 mr-1" />
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'bg-white/5 hover:bg-white/10 text-zinc-300'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Apps Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredApps.map((app, idx) => (
            <motion.div
              key={app.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="liquid-glass rounded-3xl p-6 sm:p-7 border border-white/10 flex flex-col justify-between gap-6 group hover:border-white/30 transition-all shadow-xl relative overflow-hidden"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${app.gradient} flex items-center justify-center text-white text-xl font-bold shadow-lg p-1.5`}>
                      {app.logoImg ? (
                        <img src={app.logoImg} alt={app.name} className="w-full h-full object-contain filter drop-shadow" />
                      ) : (
                        app.shortName
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white group-hover:text-cyan-300 transition-colors">
                        {app.name}
                      </h3>
                      <span className="text-[11px] text-zinc-400 font-mono">
                        v{app.version} · {app.size}
                      </span>
                    </div>
                  </div>

                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
                    Free
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-semibold text-rose-300 block mb-1">
                    {app.tagline}
                  </span>
                  <p className="text-xs text-zinc-300 leading-relaxed">
                    {app.description}
                  </p>
                </div>

                <div className="space-y-1.5 pt-2 border-t border-white/5 text-xs text-zinc-400">
                  {app.features.slice(0, 3).map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-center gap-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-between gap-3">
                <Link
                  to={`/apps/${app.id}`}
                  className="text-xs font-bold text-white hover:text-cyan-400 flex items-center gap-1 transition-colors"
                >
                  <span>Full App Specs</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Link>

                <button
                  onClick={() => openDownload(app.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download .EXE</span>
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <DownloadModal
        isOpen={downloadModalOpen}
        onClose={() => setDownloadModalOpen(false)}
        selectedAppId={activeDownloadAppId}
      />
    </div>
  );
};
