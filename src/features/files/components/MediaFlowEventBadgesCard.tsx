import React, { useState, useEffect } from 'react';
import {
  Folder,
  FolderOpen,
  Image as ImageIcon,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Camera,
  Layers,
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassBadge } from '../../../components/ui/GlassBadge';

interface BadgeSample {
  name: string;
  token: string;
  fullPath: string;
}

interface BadgesDirData {
  path: string;
  exists: boolean;
  count: number;
  sampleBadges: BadgeSample[];
  lastUpdated?: string;
  updatedBy?: string;
}

export const MediaFlowEventBadgesCard: React.FC = () => {
  const [data, setData] = useState<BadgesDirData | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const loadBadgesDir = async () => {
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.mediaflowGetBadgesDir) {
        const res = await electronAPI.mediaflowGetBadgesDir();
        setData(res);
      } else {
        // Fallback demo mock
        setData({
          path: 'D:\\APP_DATA\\EVENT_BADGES',
          exists: true,
          count: 14,
          sampleBadges: [
            { name: 'Q.jpg', token: 'Q', fullPath: '' },
            { name: 'M.jpg', token: 'M', fullPath: '' },
            { name: 'Z.jpg', token: 'Z', fullPath: '' },
            { name: 'N.jpg', token: 'N', fullPath: '' },
            { name: '0042_Ceremony_VIP.png', token: 'VIP', fullPath: '' },
            { name: 'Session_A.png', token: 'A', fullPath: '' },
            { name: 'Session_B.png', token: 'B', fullPath: '' },
            { name: 'Gold_Pass.jpg', token: 'GOLD', fullPath: '' },
          ],
          lastUpdated: new Date().toISOString(),
          updatedBy: 'MediaFlow Studio',
        });
      }
    } catch (err) {
      console.warn('Failed to load MediaFlow badges dir:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBadgesDir();

    const electronAPI = (window as any).electronAPI;
    let unsubscribe: (() => void) | undefined;
    if (electronAPI?.onMediaFlowBadgesUpdated) {
      unsubscribe = electronAPI.onMediaFlowBadgesUpdated((updated: BadgesDirData) => {
        setData(updated);
        setFeedback('Directory path updated from ecosystem');
        setTimeout(() => setFeedback(null), 3500);
      });
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const handleSelectDir = async () => {
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.mediaflowSelectBadgesDir) {
        const res = await electronAPI.mediaflowSelectBadgesDir();
        if (res) {
          setData(res);
          setFeedback(`Linked: ${res.count} badges found`);
          setTimeout(() => setFeedback(null), 3500);
        }
      }
    } catch (err) {
      console.error('Select dir failed:', err);
    }
  };

  const handleOpenFolder = async () => {
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.mediaflowOpenFolder && data?.path) {
        await electronAPI.mediaflowOpenFolder(data.path);
      }
    } catch (err) {
      console.error('Open folder failed:', err);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    await loadBadgesDir();
    setSyncing(false);
    setFeedback('Synchronized with ecosystem config');
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleLaunchStudio = async () => {
    setLaunching(true);
    try {
      const electronAPI = (window as any).electronAPI;
      if (electronAPI?.mediaflowLaunchStudio) {
        await electronAPI.mediaflowLaunchStudio(data?.path);
      }
    } finally {
      setTimeout(() => setLaunching(false), 2000);
    }
  };

  const isLinked = Boolean(data?.path && data?.exists);

  return (
    <GlassCard
      variant="interactive"
      className="p-6 border-indigo-500/25 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent relative overflow-hidden space-y-5 rounded-2xl shadow-xl backdrop-blur-xl"
    >
      {/* Background Accent Glow */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-20 bg-gradient-to-br from-indigo-500 to-purple-600" />

      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-500 p-0.5 shadow-md shadow-indigo-500/25 flex items-center justify-center text-white shrink-0">
            <Camera className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                MediaFlow Studio · Event Badges Folder
              </h3>
              {isLinked ? (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Synced & Active
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30 flex items-center gap-1.5">
                  <AlertCircle className="w-3 h-3" />
                  Unlinked Folder
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5 font-medium">
              Master reference image directory for Stage 07 Placard & Event Image Shifter
            </p>
          </div>
        </div>

        {/* Top Right Quick Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <GlassButton
            variant="glass"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${syncing ? 'animate-spin text-indigo-400' : 'text-zinc-400'}`} />}
            onClick={handleSync}
            disabled={syncing}
            title="Reload shared ecosystem config"
          >
            Sync Path
          </GlassButton>

          <GlassButton
            variant="primary"
            size="sm"
            icon={<ExternalLink className="w-3.5 h-3.5" />}
            onClick={handleLaunchStudio}
            disabled={launching}
            className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-md shadow-indigo-500/20"
          >
            {launching ? 'Opening...' : 'Launch in MediaFlow Studio ↗'}
          </GlassButton>
        </div>
      </div>

      {/* Path Box */}
      <div className="p-4 rounded-xl bg-white/60 dark:bg-black/40 border border-zinc-200/80 dark:border-white/10 space-y-2.5 relative z-10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Folder className="w-4 h-4 text-indigo-500 shrink-0" />
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold">
              Master Reference Directory:
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isLinked && (
              <button
                onClick={handleOpenFolder}
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 cursor-pointer"
              >
                <FolderOpen className="w-3.5 h-3.5" />
                <span>Open in Explorer</span>
              </button>
            )}
            <GlassButton
              variant="glass"
              size="sm"
              onClick={handleSelectDir}
              className="text-xs font-semibold py-1 px-3 border-indigo-500/30 text-indigo-600 dark:text-indigo-300"
            >
              {data?.path ? 'Change Folder' : 'Select Folder'}
            </GlassButton>
          </div>
        </div>

        <div className="font-mono text-xs text-zinc-800 dark:text-zinc-200 break-all select-all font-semibold p-2.5 rounded-lg bg-zinc-100 dark:bg-white/[0.04] border border-zinc-200/60 dark:border-white/5">
          {data?.path || 'No event badges directory selected • Click "Select Folder" to connect'}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-500 font-medium pt-1">
          <span>
            Ecosystem Config: <code className="text-indigo-600 dark:text-indigo-400 font-mono">%APPDATA%/anything/ecosystem_shared_config.json</code>
          </span>
          {data?.updatedBy && (
            <span className="text-zinc-400 dark:text-zinc-500 font-mono text-[10px]">
              Last updated by {data.updatedBy}
            </span>
          )}
        </div>
      </div>

      {/* Badges Preview Grid */}
      {isLinked && data && data.count > 0 && (
        <div className="space-y-2.5 relative z-10">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 font-semibold flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span>Detected Badges & Placard Tokens ({data.count})</span>
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{data.count} Badges Synced</span>
            </span>
          </div>

          <div className="flex flex-wrap gap-2 pt-1 max-h-36 overflow-y-auto no-scrollbar">
            {data.sampleBadges.map((badge, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/70 dark:bg-zinc-800/80 border border-zinc-200 dark:border-white/10 shadow-xs hover:border-indigo-400/50 transition-all group"
                title={`${badge.name} (Token: ${badge.token})`}
              >
                <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 flex items-center justify-center font-bold text-[10px] text-indigo-600 dark:text-indigo-300">
                  {badge.token}
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[130px]">
                    {badge.token}
                  </span>
                  <span className="text-[10px] text-zinc-400 truncate max-w-[130px] font-mono">
                    {badge.name}
                  </span>
                </div>
              </div>
            ))}
            {data.count > data.sampleBadges.length && (
              <div className="flex items-center px-3 py-1.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-xs font-semibold">
                +{data.count - data.sampleBadges.length} more
              </div>
            )}
          </div>
        </div>
      )}

      {/* Unlinked / Empty State Guidance */}
      {(!isLinked || data?.count === 0) && (
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-800 dark:text-amber-200 flex items-start gap-3 relative z-10">
          <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold">No badge images found in this folder</p>
            <p className="text-zinc-600 dark:text-zinc-400">
              Place badge placards (e.g. <code className="font-mono text-zinc-800 dark:text-zinc-200">Q.jpg</code>, <code className="font-mono text-zinc-800 dark:text-zinc-200">M.jpg</code>, <code className="font-mono text-zinc-800 dark:text-zinc-200">0042_Ceremony_N.png</code>) in this folder. MediaFlow Studio Stage 07 uses them to automatically match and copy placard markers during photo distribution.
            </p>
          </div>
        </div>
      )}

      {/* Feedback Toast Notification */}
      {feedback && (
        <div className="p-2.5 rounded-xl bg-indigo-500/15 border border-indigo-500/30 text-indigo-700 dark:text-indigo-300 text-xs flex items-center gap-2 font-medium animate-fadeIn">
          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
          <span>{feedback}</span>
        </div>
      )}
    </GlassCard>
  );
};

