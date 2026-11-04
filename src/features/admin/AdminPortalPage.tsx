import React, { useState, useEffect, useMemo } from 'react';
import {
  KeyRound,
  Lock,
  Unlock,
  EyeOff,
  ShieldAlert,
  ShieldCheck,
  Users,
  Film,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Download,
  RefreshCw,
  Sparkles,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  Play,
  FolderCheck,
  Calendar,
  Layers,
  BarChart3,
  Sliders,
  Database,
  Eye,
  PlusCircle,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { GlassBadge } from '../../components/ui/GlassBadge';
import { useAuth } from '../../context/AuthContext';
import { analyticsService, type UserAnalyticsRecord } from '../../services/analyticsService';
import { isSupabaseConfigured } from '../../services/supabaseClient';
import { getProfileInitial, getInitialGradient } from '../../utils/userInitials';

function formatDuration(totalSeconds: number): string {
  if (!totalSeconds || totalSeconds <= 0) return '0m';
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  if (hours === 0) return `${minutes}m`;
  return `${hours}h ${minutes}m`;
}

function formatDate(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return iso;
  }
}

export const AdminPortalPage: React.FC<{ onBack?: () => void }> = ({ onBack }) => {
  const { user, isAdmin, toggleAdminRole, openAuthModal } = useAuth();
  const [is2StepVerified, setIs2StepVerified] = useState<boolean>(() => {
    return sessionStorage.getItem('anything_admin_2step_verified') === 'true';
  });
  const [pinCode, setPinCode] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [pinError, setPinError] = useState<string | null>(null);

  const handleVerify2Step = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (pinCode.trim() === '515253') {
      sessionStorage.setItem('anything_admin_2step_verified', 'true');
      setIs2StepVerified(true);
      setPinError(null);
      if (!isAdmin) {
        toggleAdminRole();
      }
      triggerNotify('Master 2-Step Verification Confirmed · Admin Console Unlocked');
    } else {
      setPinError('Incorrect 2-step verification password. Master code 515253 is required.');
    }
  };

  const handleLockPortal = () => {
    sessionStorage.removeItem('anything_admin_2step_verified');
    setIs2StepVerified(false);
    setPinCode('');
    triggerNotify('Admin Portal Locked Successfully');
  };
  const [usersList, setUsersList] = useState<UserAnalyticsRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'admin' | 'member' | 'pro'>('all');
  const [sortBy, setSortBy] = useState<'activity' | 'videos' | 'safars' | 'time'>('activity');
  const [selectedUser, setSelectedUser] = useState<UserAnalyticsRecord | null>(null);

  // Quick Action Simulation state
  const [simulatingUserId, setSimulatingUserId] = useState<string | null>(null);
  const [notificationMsg, setNotificationMsg] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const records = await analyticsService.getAllUsersAnalytics();
      setUsersList(records);
      // Update selected user if currently open
      if (selectedUser) {
        const updated = records.find((u) => u.userId === selectedUser.userId);
        if (updated) setSelectedUser(updated);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000); // refresh every 10s
    return () => clearInterval(interval);
  }, []);

  const triggerNotify = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(null), 3000);
  };

  // Aggregated KPIs
  const totalUsers = usersList.length;
  const totalVideos = useMemo(
    () => usersList.reduce((acc, u) => acc + (u.videosRenderedCount || 0), 0),
    [usersList]
  );
  const totalSafars = useMemo(
    () => usersList.reduce((acc, u) => acc + (u.safarsCompletedCount || 0), 0),
    [usersList]
  );
  const totalScreenTimeSeconds = useMemo(
    () => usersList.reduce((acc, u) => acc + (u.totalStaySeconds || 0), 0),
    [usersList]
  );

  // Filtered and Sorted Users
  const filteredUsers = useMemo(() => {
    return usersList
      .filter((u) => {
        const matchesQuery =
          u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
          u.userId.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = roleFilter === 'all' || u.role === roleFilter;
        return matchesQuery && matchesRole;
      })
      .sort((a, b) => {
        if (sortBy === 'videos') return b.videosRenderedCount - a.videosRenderedCount;
        if (sortBy === 'safars') return b.safarsCompletedCount - a.safarsCompletedCount;
        if (sortBy === 'time') return b.totalStaySeconds - a.totalStaySeconds;
        return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
      });
  }, [usersList, searchQuery, roleFilter, sortBy]);

  // Simulation Handlers
  const handleSimulateVideoRender = async (targetUserId: string) => {
    const titles = [
      '1448-10_Majlis_Recap_Master.mp4',
      'Session_Highlights_ColorGraded_4K.mp4',
      'Night_Celebration_FinalCut.mov',
      'Teaser_Promo_Broadcast.mp4',
      'Daily_Wrapup_Sequence.mp4',
    ];
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    await analyticsService.recordVideoRendered(targetUserId, randomTitle, 'MediaFlow Studio', '4K', 140);
    await loadData();
    triggerNotify(`Simulated 1 video rendered for user: ${randomTitle}`);
  };

  const handleSimulateSafarComplete = async (targetUserId: string) => {
    const safars = [
      '1448-10-Istefada ilmiyah Tour',
      '1448-09-Ramadan Kareem Archive',
      '1448-08-Shaaban Tour Complete',
      '1448-02-Chehlum Mubharak Session',
    ];
    const randomSafar = safars[Math.floor(Math.random() * safars.length)];
    await analyticsService.recordSafarCompleted(targetUserId, randomSafar, 4, 3800, 48000000000, 'One Tap');
    await loadData();
    triggerNotify(`Simulated 1 safar completed: ${randomSafar}`);
  };

  const handleSimulateStayTime = async (targetUserId: string, appId: string, appName: string) => {
    const addedSeconds = 1800; // 30 minutes
    await analyticsService.recordAppStaySession(targetUserId, appId, appName, addedSeconds);
    await loadData();
    triggerNotify(`Added +30m screen time in ${appName}`);
  };

  const handleExportCSV = () => {
    const headers = ['User ID', 'Name', 'Email', 'Role', 'Videos Rendered', 'Safars Completed', 'Screen Time (Seconds)', 'Last Active'];
    const rows = usersList.map((u) => [
      u.userId,
      `"${u.name}"`,
      u.email,
      u.role,
      u.videosRenderedCount,
      u.safarsCompletedCount,
      u.totalStaySeconds,
      u.lastActiveAt,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `anything_ecosystem_users_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    triggerNotify('Exported user analytics to CSV!');
  };

  // 2-Step Master Verification Gate (Password: 515253)
  if (!is2StepVerified) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center p-6 animate-in fade-in duration-300">
        <GlassCard className="max-w-md w-full p-8 border-amber-500/40 bg-gradient-to-b from-amber-500/[0.08] via-zinc-900/60 to-zinc-900/90 shadow-2xl relative overflow-hidden">
          {/* Decorative Gold Accent */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-400" />

          <div className="w-16 h-16 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-500 flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/10">
            <Lock className="w-8 h-8" />
          </div>

          <div className="text-center mb-6">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 mb-2">
              <ShieldCheck className="w-3.5 h-3.5" />
              CONFIDENTIAL DATA VAULT
            </span>
            <h2 className="text-xl font-black text-zinc-900 dark:text-white tracking-tight">
              Admin 2-Step Verification
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
              Enter the master security password <span className="font-mono font-bold text-amber-500">515253</span> to access user activity, video renders, and safar metrics.
            </p>
          </div>

          {/* Verification Form */}
          <form onSubmit={handleVerify2Step} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-mono uppercase text-zinc-400 font-semibold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  Security Password
                </label>
                <span className="text-[10px] font-mono text-zinc-500">Master Passcode</span>
              </div>
              <div className="relative">
                <input
                  type={showPin ? 'text' : 'password'}
                  autoFocus
                  required
                  value={pinCode}
                  onChange={(e) => {
                    setPinCode(e.target.value);
                    if (pinError) setPinError(null);
                  }}
                  placeholder="Enter 2-step password (515253)"
                  className="w-full px-4 py-2.5 rounded-xl bg-black/40 border border-amber-500/30 focus:border-amber-400 focus:ring-1 focus:ring-amber-500/50 text-white font-mono text-center tracking-widest text-base outline-none placeholder:text-zinc-600 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 top-3 text-zinc-400 hover:text-white"
                  title={showPin ? 'Hide password' : 'Show password'}
                >
                  {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {pinError && (
              <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-medium animate-in shake">
                {pinError}
              </div>
            )}

            <div className="space-y-2 pt-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-black font-extrabold text-xs shadow-lg shadow-amber-500/25 active:scale-[0.98] transition-all cursor-pointer select-none flex items-center justify-center gap-2"
              >
                <Unlock className="w-4 h-4" />
                <span>Verify & Unlock Admin Portal</span>
              </button>

              {onBack && (
                <button
                  type="button"
                  onClick={onBack}
                  className="w-full py-2 text-xs text-zinc-400 hover:text-white font-mono transition-colors"
                >
                  ← Return to Apps
                </button>
              )}
            </div>
          </form>

          <div className="mt-6 pt-4 border-t border-zinc-800 text-center">
            <span className="text-[10px] text-zinc-500 font-mono">
              Protected by Anything Master 2-Step Gate
            </span>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Toast Notification Banner */}
      {notificationMsg && (
        <div className="fixed top-16 right-6 z-50 p-3.5 rounded-xl bg-emerald-600 text-white text-xs font-semibold shadow-2xl flex items-center gap-2 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{notificationMsg}</span>
        </div>
      )}

      {/* Admin Portal Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-extrabold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-amber-600 dark:text-amber-400 border border-amber-500/30">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
              CONFIDENTIAL ADMIN CONSOLE
            </span>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono ${
              isSupabaseConfigured
                ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                : 'bg-zinc-500/10 text-zinc-400 border border-zinc-500/20'
            }`}>
              <Database className="w-3 h-3" />
              {isSupabaseConfigured ? 'Supabase Connected' : 'Local Mock Database'}
            </span>
          </div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
            Ecosystem User Analytics & Telemetry
          </h1>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
            User-wise intelligence tracking videos rendered, safars completed, and application stay duration across all apps.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <GlassButton
            variant="secondary"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
            icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="text-xs font-semibold"
          >
            {isLoading ? 'Syncing...' : 'Refresh'}
          </GlassButton>

          <GlassButton
            variant="primary"
            size="sm"
            onClick={handleExportCSV}
            icon={<Download className="w-3.5 h-3.5" />}
            className="text-xs font-semibold shadow-md"
          >
            Export CSV
          </GlassButton>
        </div>
      </div>

      {/* KPI Stat Ribbons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Users */}
        <GlassCard className="p-4 border-zinc-200 dark:border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-bold">
              Total Users
            </span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">{totalUsers}</span>
            <span className="text-[11px] text-emerald-500 font-mono font-medium">Active Profiles</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Synced across Anything apps</p>
        </GlassCard>

        {/* KPI 2: Videos Rendered */}
        <GlassCard className="p-4 border-zinc-200 dark:border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-bold">
              Videos Rendered
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-500 flex items-center justify-center">
              <Film className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">{totalVideos}</span>
            <span className="text-[11px] text-rose-500 font-mono font-medium">Exports</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Via MediaFlow Studio</p>
        </GlassCard>

        {/* KPI 3: Safars Completed */}
        <GlassCard className="p-4 border-zinc-200 dark:border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-bold">
              Safars Completed
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">{totalSafars}</span>
            <span className="text-[11px] text-emerald-500 font-mono font-medium">Reconciled</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Via One Tap Workstation</p>
        </GlassCard>

        {/* KPI 4: Total Ecosystem Stay Time */}
        <GlassCard className="p-4 border-zinc-200 dark:border-white/10 relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-bold">
              Ecosystem Stay Time
            </span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-zinc-900 dark:text-white">
              {formatDuration(totalScreenTimeSeconds)}
            </span>
            <span className="text-[11px] text-amber-500 font-mono font-medium">Screen Time</span>
          </div>
          <p className="text-[11px] text-zinc-400 mt-1">Combined user app usage</p>
        </GlassCard>
      </div>

      {/* Filter and Search Bar */}
      <GlassCard className="p-4 border-zinc-200 dark:border-white/10">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by user name, email, or UID..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 text-xs">
              <span className="text-zinc-400 text-[11px] font-mono uppercase">Role:</span>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 outline-none"
              >
                <option value="all">All Roles</option>
                <option value="admin">Admin</option>
                <option value="member">Member</option>
                <option value="pro">Pro</option>
              </select>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-zinc-400 text-[11px] font-mono uppercase">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-2.5 py-1.5 text-xs rounded-lg bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 outline-none"
              >
                <option value="activity">Recent Activity</option>
                <option value="videos">Most Videos Rendered</option>
                <option value="safars">Most Safars Completed</option>
                <option value="time">Highest Stay Time</option>
              </select>
            </div>
          </div>
        </div>
      </GlassCard>

      {/* Master User Analytics Table */}
      <GlassCard className="border-zinc-200 dark:border-white/10 overflow-hidden shadow-xl">
        <div className="px-5 py-3 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-mono uppercase tracking-wider font-extrabold text-zinc-700 dark:text-zinc-300">
              User-Wise Operational Intelligence ({filteredUsers.length})
            </h3>
          </div>
          <span className="text-[11px] text-zinc-400 font-mono">Click user row for deep drill-down</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-100/70 dark:bg-zinc-800/50 text-zinc-500 dark:text-zinc-400 uppercase font-mono text-[10px] border-b border-zinc-200 dark:border-zinc-800">
              <tr>
                <th className="py-3 px-4">User Identity</th>
                <th className="py-3 px-3 text-center">Videos Rendered</th>
                <th className="py-3 px-3 text-center">Safars Completed</th>
                <th className="py-3 px-4">App Stay Duration</th>
                <th className="py-3 px-4">Most Active App</th>
                <th className="py-3 px-4">Last Seen</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {filteredUsers.map((item) => {
                const isSelected = selectedUser?.userId === item.userId;
                // Identify top app
                const topAppEntry = Object.entries(item.appBreakdown || {}).sort((a, b) => b[1] - a[1])[0];
                const topAppName = topAppEntry ? topAppEntry[0].replace('-', ' ') : 'Anything Hub';

                return (
                  <tr
                    key={item.userId}
                    onClick={() => setSelectedUser(item)}
                    className={`cursor-pointer transition-colors hover:bg-zinc-100/60 dark:hover:bg-zinc-800/40 ${
                      isSelected ? 'bg-amber-500/10 dark:bg-amber-500/15' : ''
                    }`}
                  >
                    {/* User Identity Column */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 border border-zinc-200 dark:border-zinc-700">
                          {item.avatar ? (
                            <img src={item.avatar} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className={`w-full h-full flex items-center justify-center bg-gradient-to-tr ${getInitialGradient(getProfileInitial(item))} text-white font-black text-xs`}>
                              {getProfileInitial(item)}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-zinc-900 dark:text-white truncate">
                              {item.name}
                            </span>
                            {item.role === 'admin' && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30">
                                ADMIN
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-500 font-mono block truncate">
                            {item.email}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Videos Rendered Column */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                        <Film className="w-3 h-3" />
                        {item.videosRenderedCount}
                      </span>
                    </td>

                    {/* Safars Completed Column */}
                    <td className="py-3 px-3 text-center">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" />
                        {item.safarsCompletedCount}
                      </span>
                    </td>

                    {/* App Stay Duration Column */}
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-mono font-bold text-zinc-800 dark:text-zinc-200">
                          <Clock className="w-3 h-3 text-amber-500" />
                          <span>{formatDuration(item.totalStaySeconds)}</span>
                        </div>
                        <div className="w-24 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                          <div
                            className="h-full bg-amber-500 rounded-full"
                            style={{ width: `${Math.min(100, (item.totalStaySeconds / 43200) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Most Active App */}
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 capitalize">
                        {topAppName}
                      </span>
                    </td>

                    {/* Last Seen */}
                    <td className="py-3 px-4 text-zinc-500 font-mono text-[11px]">
                      {formatDate(item.lastActiveAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleSimulateVideoRender(item.userId)}
                          title="Simulate Video Render"
                          className="p-1 rounded-md text-zinc-400 hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                        >
                          <Film className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleSimulateSafarComplete(item.userId)}
                          title="Simulate Safar Complete"
                          className="p-1 rounded-md text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/10 transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setSelectedUser(item)}
                          className="px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800 hover:bg-amber-500 hover:text-white dark:hover:bg-amber-500 text-zinc-700 dark:text-zinc-300 font-medium text-[11px] transition-colors"
                        >
                          Inspect
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-zinc-400 text-xs">
                    No users found matching query.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      {/* Selected User Drill-Down Drawer / Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <GlassCard className="w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 border-zinc-200 dark:border-white/10 shadow-2xl relative bg-white/95 dark:bg-[#18181B]/95">
            {/* Close button */}
            <button
              onClick={() => setSelectedUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {/* User Header Profile */}
            <div className="flex items-center gap-4 pb-5 border-b border-zinc-200 dark:border-zinc-800">
              <div className="w-14 h-14 rounded-full overflow-hidden shadow-lg border-2 border-amber-500/30 shrink-0">
                {selectedUser.avatar ? (
                  <img src={selectedUser.avatar} alt={selectedUser.name} className="w-full h-full object-cover" />
                ) : (
                  <div className={`w-full h-full flex items-center justify-center bg-gradient-to-tr ${getInitialGradient(getProfileInitial(selectedUser))} text-white font-black text-xl`}>
                    {getProfileInitial(selectedUser)}
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-black text-zinc-900 dark:text-white truncate">
                    {selectedUser.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-500 border border-amber-500/30 uppercase">
                    {selectedUser.role}
                  </span>
                </div>
                <p className="text-xs text-zinc-500 font-mono truncate">{selectedUser.email}</p>
                <p className="text-[10px] text-zinc-400 font-mono mt-0.5">UID: {selectedUser.userId}</p>
              </div>
            </div>

            {/* Mini KPIs for this user */}
            <div className="grid grid-cols-3 gap-3 my-5">
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">Videos Rendered</span>
                <span className="text-xl font-black text-rose-500">{selectedUser.videosRenderedCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">Safars Completed</span>
                <span className="text-xl font-black text-emerald-500">{selectedUser.safarsCompletedCount}</span>
              </div>
              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700/60 text-center">
                <span className="text-[10px] font-mono text-zinc-400 uppercase block">Total Screen Time</span>
                <span className="text-xl font-black text-amber-500">{formatDuration(selectedUser.totalStaySeconds)}</span>
              </div>
            </div>

            {/* App Stay Time Breakdown */}
            <div className="mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider font-extrabold text-zinc-700 dark:text-zinc-300 mb-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-500" />
                Time Stayed in Particular Applications
              </h4>
              <div className="space-y-2.5">
                {Object.entries({
                  'mediaflow-studio': 'MediaFlow Studio',
                  'one-tap': 'One Tap Workstation',
                  'docuflow-studio': 'DocuFlow Studio',
                  'anything-hub': 'Anything Master Hub',
                  'anything-data-manage': 'Anything Data Management',
                  'pixelcharm': 'Pixelcharm Studio',
                }).map(([appKey, appLabel]) => {
                  const duration = selectedUser.appBreakdown?.[appKey] || 0;
                  const percent = selectedUser.totalStaySeconds > 0
                    ? Math.round((duration / selectedUser.totalStaySeconds) * 100)
                    : 0;

                  return (
                    <div key={appKey} className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-zinc-700/40">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{appLabel}</span>
                        <span className="font-mono text-zinc-500">{formatDuration(duration)} ({percent}%)</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-700 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-400 to-rose-500 rounded-full"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Video Renders Log */}
            <div className="mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider font-extrabold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                <Film className="w-3.5 h-3.5 text-rose-500" />
                Rendered Video Exports ({selectedUser.recentVideos?.length || 0})
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {selectedUser.recentVideos && selectedUser.recentVideos.length > 0 ? (
                  selectedUser.recentVideos.map((v) => (
                    <div key={v.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-xs">
                      <div className="truncate min-w-0 pr-2">
                        <p className="font-medium text-zinc-900 dark:text-white truncate">{v.title}</p>
                        <span className="text-[10px] text-zinc-400 font-mono">{v.appName} • {v.resolution || '1080p'}</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono shrink-0">{formatDate(v.timestamp)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 italic">No video renders recorded yet for this user.</p>
                )}
              </div>
            </div>

            {/* Completed Safars Log */}
            <div className="mb-6">
              <h4 className="text-xs font-mono uppercase tracking-wider font-extrabold text-zinc-700 dark:text-zinc-300 mb-2 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                Completed Safar Reconciliations ({selectedUser.recentSafars?.length || 0})
              </h4>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {selectedUser.recentSafars && selectedUser.recentSafars.length > 0 ? (
                  selectedUser.recentSafars.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-2 rounded-lg bg-zinc-100 dark:bg-zinc-800/50 text-xs">
                      <div className="truncate min-w-0 pr-2">
                        <p className="font-medium text-zinc-900 dark:text-white truncate">{s.safarName}</p>
                        <span className="text-[10px] text-zinc-400 font-mono">{s.datesCount} Sessions • {s.filesCount.toLocaleString()} Files</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 font-mono shrink-0">{formatDate(s.timestamp)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 italic">No safar reconciliations recorded yet.</p>
                )}
              </div>
            </div>

            {/* Test Simulation Controls */}
            <div className="pt-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
              <span className="text-[10px] font-mono text-zinc-400 uppercase">Live Simulation Tools:</span>
              <div className="flex items-center gap-2">
                <GlassButton
                  variant="secondary"
                  size="xs"
                  onClick={() => handleSimulateVideoRender(selectedUser.userId)}
                  icon={<Film className="w-3 h-3 text-rose-500" />}
                >
                  + Video Render
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  size="xs"
                  onClick={() => handleSimulateSafarComplete(selectedUser.userId)}
                  icon={<CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                >
                  + Safar Complete
                </GlassButton>
                <GlassButton
                  variant="secondary"
                  size="xs"
                  onClick={() => handleSimulateStayTime(selectedUser.userId, 'mediaflow-studio', 'MediaFlow Studio')}
                  icon={<Clock className="w-3 h-3 text-amber-500" />}
                >
                  +30m Stay Time
                </GlassButton>
              </div>
            </div>
          </GlassCard>
        </div>
      )}
    </div>
  );
};
