import React, { useState, useEffect } from 'react';
import {
  Clock,
  Film,
  CheckCircle2,
  Sparkles,
  Smartphone,
  Monitor,
  Flame,
  TrendingUp,
  RefreshCw,
  PlusCircle,
} from 'lucide-react';
import { GlassCard } from '../ui/GlassCard';
import { GlassButton } from '../ui/GlassButton';
import { useAuth } from '../../context/AuthContext';
import { analyticsService, type UserAnalyticsRecord } from '../../services/analyticsService';

function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

export const UserAppStayTimeCard: React.FC = () => {
  const { user, recordVideoRender, recordSafarComplete, trackAppTime } = useAuth();
  const [analytics, setAnalytics] = useState<UserAnalyticsRecord | null>(null);
  const [activeTab, setActiveTab] = useState<'apps' | 'history'>('apps');

  const refreshUserStats = () => {
    if (user?.uid) {
      const data = analyticsService.getUserAnalytics(user.uid);
      setAnalytics(data);
    }
  };

  useEffect(() => {
    refreshUserStats();
    const interval = setInterval(refreshUserStats, 4000);
    return () => clearInterval(interval);
  }, [user?.uid]);

  const appMeta: Record<string, { name: string; color: string; desc: string }> = {
    'one-tap': {
      name: 'One Tap Workstation',
      color: 'from-emerald-500 to-teal-500',
      desc: 'Automatic backup, safar reconciler & title synchronization',
    },
    'mediaflow-studio': {
      name: 'MediaFlow Studio',
      color: 'from-rose-500 to-amber-500',
      desc: 'High-speed 4K/1080p video rendering & timeline editor',
    },
    'docuflow-studio': {
      name: 'DocuFlow Studio',
      color: 'from-blue-500 to-cyan-500',
      desc: 'Document compilation, vector forge & data processing',
    },
    'anything-hub': {
      name: 'Anything Master Hub',
      color: 'from-indigo-500 to-purple-500',
      desc: 'Central launcher, ecosystem updates & asset management',
    },
    'anything-data-manage': {
      name: 'Anything Data Management',
      color: 'from-violet-500 to-fuchsia-500',
      desc: 'AIN53 inventory, database and storage tools',
    },
    'pixelcharm': {
      name: 'Pixelcharm Studio',
      color: 'from-pink-500 to-rose-500',
      desc: 'Graphic design, photo editing and social templates',
    },
  };

  const totalSeconds = analytics?.totalStaySeconds || 0;
  const videosCount = analytics?.videosRenderedCount || 0;
  const safarsCount = analytics?.safarsCompletedCount || 0;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-zinc-300 font-bold flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Your Ecosystem App Stay Time & Activity
          </h4>
          <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
            Real-time duration tracking your productivity across all Anything creative applications.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 flex items-center gap-1">
            <Flame className="w-3 h-3 text-amber-500" />
            {formatDuration(totalSeconds)} Logged
          </span>
        </div>
      </div>

      {/* Main 3 Activity Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <GlassCard className="p-3.5 border-zinc-200 dark:border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
            <Clock className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-mono text-zinc-400 uppercase">Total Screen Time</p>
            <p className="text-base font-black text-zinc-900 dark:text-white">
              {formatDuration(totalSeconds)}
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-3.5 border-zinc-200 dark:border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center shrink-0">
            <Film className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-mono text-zinc-400 uppercase">Videos Rendered</p>
            <p className="text-base font-black text-zinc-900 dark:text-white">
              {videosCount} <span className="text-xs font-normal text-zinc-400">Exports</span>
            </p>
          </div>
        </GlassCard>

        <GlassCard className="p-3.5 border-zinc-200 dark:border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-mono text-zinc-400 uppercase">Safars Completed</p>
            <p className="text-base font-black text-zinc-900 dark:text-white">
              {safarsCount} <span className="text-xs font-normal text-zinc-400">Reconciled</span>
            </p>
          </div>
        </GlassCard>
      </div>

      {/* Per-App Duration Meters */}
      <GlassCard className="p-4 border-zinc-200 dark:border-white/10">
        <h5 className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-bold mb-3">
          Time Stayed in Each Particular Application
        </h5>

        <div className="space-y-3">
          {Object.entries(appMeta).map(([key, meta]) => {
            const staySeconds = analytics?.appBreakdown?.[key] || 0;
            const percent = totalSeconds > 0 ? Math.round((staySeconds / totalSeconds) * 100) : 0;

            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-zinc-800 dark:text-zinc-200">{meta.name}</span>
                    <span className="text-[10px] text-zinc-400 font-mono hidden md:inline">
                      • {meta.desc}
                    </span>
                  </div>
                  <span className="font-mono text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    {formatDuration(staySeconds)}{' '}
                    <span className="text-[10px] text-zinc-400">({percent}%)</span>
                  </span>
                </div>

                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${meta.color} rounded-full transition-all duration-500`}
                    style={{ width: `${Math.max(percent, staySeconds > 0 ? 3 : 0)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick action simulation triggers for user testing */}
        <div className="mt-4 pt-3 border-t border-zinc-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-xs">
          <span className="text-[10px] text-zinc-400 font-mono">
            💡 Time updates automatically whenever you run apps. You can also test with:
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => trackAppTime('mediaflow-studio', 'MediaFlow Studio', 900)}
              className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] font-mono text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              +15m MediaFlow
            </button>
            <button
              onClick={() => trackAppTime('one-tap', 'One Tap', 900)}
              className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-[10px] font-mono text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              +15m One Tap
            </button>
            <button
              onClick={() => recordVideoRender('Project_Master_Render_4K.mp4')}
              className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 text-[10px] font-mono transition-colors"
            >
              +1 Render
            </button>
            <button
              onClick={() => recordSafarComplete('1448-10-Istefada ilmiyah')}
              className="px-2 py-1 rounded bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 text-[10px] font-mono transition-colors"
            >
              +1 Safar
            </button>
          </div>
        </div>
      </GlassCard>
    </div>
  );
};
