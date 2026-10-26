import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Download, 
  Menu, 
  X, 
  ChevronDown, 
  FileText, 
  Layers, 
  RefreshCw, 
  Video, 
  Zap, 
  ShieldCheck,
  Sparkles,
  Search
} from 'lucide-react';
import { GithubIcon } from './Icons';
import { ecosystemApps } from '../data/apps';
import { soundFx } from '../utils/audio';

interface NavbarProps {
  onOpenDownloadModal?: () => void;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ 
  onOpenDownloadModal,
  onOpenCommandPalette
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [appsDropdownOpen, setAppsDropdownOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      const totalScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (totalScroll > 0) {
        setScrollProgress((window.scrollY / totalScroll) * 100);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown on route change
  useEffect(() => {
    setMobileMenuOpen(false);
    setAppsDropdownOpen(false);
  }, [location.pathname]);

  const appIconsMap: Record<string, React.ReactNode> = {
    'pdf-master': <FileText className="w-4 h-4 text-rose-400" />,
    'docuflow-studio': <Layers className="w-4 h-4 text-cyan-400" />,
    'master-converter': <RefreshCw className="w-4 h-4 text-indigo-400" />,
    'mediaflow-studio': <Video className="w-4 h-4 text-blue-400" />,
    'one-tap': <Zap className="w-4 h-4 text-amber-400" />,
    'anything-hub': <Sparkles className="w-4 h-4 text-emerald-400" />
  };

  return (
    <>
      {/* Top Scroll Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] bg-white/5 z-50">
        <div 
          className="h-full bg-gradient-to-r from-red-500 via-cyan-400 to-indigo-500 transition-all duration-75"
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <header
        className={`fixed top-2 left-0 right-0 mx-auto max-w-7xl px-4 sm:px-6 z-40 transition-all duration-300 ${
          isScrolled ? 'top-3' : 'top-4'
        }`}
      >
        <div
          className={`liquid-glass rounded-2xl px-4 py-3 flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'bg-[#0f0f14]/90 shadow-2xl border-white/20' : 'bg-[#121218]/70'
          }`}
        >
          {/* Brand Logo */}
          <Link 
            to="/" 
            onClick={() => soundFx.playClick()}
            className="flex items-center gap-3 group"
          >
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center font-black text-white text-base shadow-lg shadow-red-500/30 group-hover:scale-105 transition-transform duration-300">
                An
              </div>
              <span className="absolute -top-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-500" />
              </span>
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-base group-hover:text-cyan-400 transition-colors">
                  Anything
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-gradient-to-r from-rose-500/20 to-cyan-500/20 border border-white/10 text-cyan-300">
                  100% Free
                </span>
              </div>
              <span className="text-[10px] text-zinc-400 font-mono hidden sm:inline">
                Adobe-Grade Free Creative Suite
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            <Link
              to="/"
              onClick={() => soundFx.playClick()}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/' 
                  ? 'bg-white/10 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Overview
            </Link>

            {/* Apps Dropdown */}
            <div 
              className="relative"
              onMouseEnter={() => setAppsDropdownOpen(true)}
              onMouseLeave={() => setAppsDropdownOpen(false)}
            >
              <button
                onClick={() => setAppsDropdownOpen(!appsDropdownOpen)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  location.pathname.startsWith('/apps')
                    ? 'bg-white/10 text-white'
                    : 'text-zinc-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <span>Applications</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${appsDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {appsDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-84 p-2 liquid-glass-bright rounded-2xl shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
                      Anything Ecosystem Tools
                    </span>
                  </div>
                  <div className="space-y-1">
                    {ecosystemApps.map((app) => (
                      <Link
                        key={app.id}
                        to={`/apps/${app.id}`}
                        onClick={() => soundFx.playClick()}
                        className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/10 transition-colors group"
                      >
                        <div className={`w-8 h-8 rounded-lg bg-gradient-to-tr ${app.gradient} flex items-center justify-center text-white text-xs font-bold shadow-sm group-hover:scale-105 transition-transform`}>
                          {appIconsMap[app.id] || app.shortName}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white group-hover:text-cyan-300 truncate">
                              {app.name}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono">
                              v{app.version}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 truncate">
                            {app.tagline}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-2 pt-2 border-t border-white/10 px-2 flex justify-between items-center text-[11px]">
                    <Link to="/apps" className="text-cyan-400 hover:underline font-semibold">
                      View all apps &rarr;
                    </Link>
                    <span className="text-zinc-500 font-mono">0$ Subscriptions</span>
                  </div>
                </div>
              )}
            </div>

            <Link
              to="/tools"
              onClick={() => soundFx.playClick()}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/tools' 
                  ? 'bg-white/10 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Free PDF Tools
            </Link>

            <Link
              to="/compare"
              onClick={() => soundFx.playClick()}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/compare' 
                  ? 'bg-white/10 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              vs Adobe Acrobat
            </Link>

            <Link
              to="/about"
              onClick={() => soundFx.playClick()}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                location.pathname === '/about' 
                  ? 'bg-white/10 text-white' 
                  : 'text-zinc-300 hover:text-white hover:bg-white/5'
              }`}
            >
              Manifesto
            </Link>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Command Palette Trigger */}
            <button
              onClick={() => {
                if (onOpenCommandPalette) onOpenCommandPalette();
              }}
              className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-400 hover:text-white transition-all text-xs"
              title="Command Palette (Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400" />
              <span className="hidden md:inline text-[11px]">Search</span>
              <kbd className="hidden sm:inline px-1.5 py-0.5 rounded bg-black/50 border border-white/10 font-mono text-[9px] text-zinc-400">
                ⌘K
              </kbd>
            </button>

            <a
              href="https://github.com/BSFrameWorks5253/Anything"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all hidden sm:flex"
              title="View on GitHub"
            >
              <GithubIcon className="w-4 h-4" />
            </a>

            <button
              onClick={() => {
                soundFx.playClick();
                if (onOpenDownloadModal) {
                  onOpenDownloadModal();
                } else {
                  window.location.href = '/apps';
                }
              }}
              className="flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 via-red-500 to-amber-500 hover:from-rose-400 hover:to-amber-400 text-white font-bold text-xs shadow-lg shadow-red-500/25 transition-all hover:scale-105"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Get Anything Hub</span>
              <span className="sm:hidden">Get Free</span>
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden mt-2 p-4 liquid-glass-bright rounded-2xl shadow-2xl animate-in fade-in slide-in-from-top-3 duration-200 space-y-3">
            <div className="space-y-1">
              <Link
                to="/"
                className="block px-3 py-2 rounded-xl text-sm font-semibold hover:bg-white/10"
              >
                Overview
              </Link>
              <Link
                to="/apps"
                className="block px-3 py-2 rounded-xl text-sm font-semibold hover:bg-white/10"
              >
                All Applications ({ecosystemApps.length})
              </Link>
              <div className="pl-3 py-1 space-y-1 border-l border-white/10 ml-2">
                {ecosystemApps.map(app => (
                  <Link
                    key={app.id}
                    to={`/apps/${app.id}`}
                    className="flex items-center justify-between px-2 py-1.5 text-xs text-zinc-300 hover:text-white"
                  >
                    <span>{app.name}</span>
                    <span className="text-[10px] text-zinc-500 font-mono">v{app.version}</span>
                  </Link>
                ))}
              </div>
              <Link
                to="/tools"
                className="block px-3 py-2 rounded-xl text-sm font-semibold hover:bg-white/10"
              >
                In-Browser Free PDF Tools
              </Link>
              <Link
                to="/compare"
                className="block px-3 py-2 rounded-xl text-sm font-semibold hover:bg-white/10"
              >
                Adobe Acrobat vs Anything
              </Link>
              <Link
                to="/about"
                className="block px-3 py-2 rounded-xl text-sm font-semibold hover:bg-white/10"
              >
                Architecture & Free Manifesto
              </Link>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs text-zinc-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                100% Free · Client-Side Sandbox
              </span>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (onOpenCommandPalette) onOpenCommandPalette();
                }}
                className="text-cyan-400 font-semibold"
              >
                Search Command ⌘K &rarr;
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
