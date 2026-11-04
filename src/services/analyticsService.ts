import { supabase, isSupabaseConfigured } from './supabaseClient';

export interface AppStayTime {
  appId: string;
  appName: string;
  durationSeconds: number;
  lastActive: string;
}

export interface UserAnalyticsRecord {
  userId: string;
  email: string;
  name: string;
  role: 'member' | 'pro' | 'admin';
  avatar: string | null;
  joinedAt: string;
  lastActiveAt: string;
  videosRenderedCount: number;
  safarsCompletedCount: number;
  totalStaySeconds: number;
  appBreakdown: Record<string, number>; // appId -> seconds
  recentVideos: Array<{
    id: string;
    title: string;
    resolution?: string;
    appName: string;
    timestamp: string;
  }>;
  recentSafars: Array<{
    id: string;
    safarName: string;
    datesCount: number;
    filesCount: number;
    timestamp: string;
  }>;
  recentSessions: Array<{
    appId: string;
    appName: string;
    durationSeconds: number;
    timestamp: string;
  }>;
}

const LOCAL_ANALYTICS_STORAGE_KEY = 'anything_ecosystem_analytics_v1';

// Seed demo users so admin dashboard has instant realistic user-wise data
const DEFAULT_DEMO_USERS: UserAnalyticsRecord[] = [
  {
    userId: 'USR-ADMIN-001',
    email: 'admin@anything.local',
    name: 'Master Architect',
    role: 'admin',
    avatar: null,
    joinedAt: '2026-10-01T08:00:00Z',
    lastActiveAt: new Date().toISOString(),
    videosRenderedCount: 42,
    safarsCompletedCount: 18,
    totalStaySeconds: 43200, // 12 hours
    appBreakdown: {
      'mediaflow-studio': 18000,
      'one-tap': 14400,
      'docuflow-studio': 5400,
      'anything-hub': 5400,
    },
    recentVideos: [
      { id: 'vid-1', title: '1448-10_Majlis_Recap_4K.mp4', resolution: '4K', appName: 'MediaFlow Studio', timestamp: '2026-10-30T18:20:00Z' },
      { id: 'vid-2', title: 'Istefada_Highlights_Session1.mp4', resolution: '1080p', appName: 'MediaFlow Studio', timestamp: '2026-10-29T14:10:00Z' },
      { id: 'vid-3', title: 'Teaser_Promo_Final.mov', resolution: '1080p', appName: 'MediaFlow Studio', timestamp: '2026-10-28T11:00:00Z' },
    ],
    recentSafars: [
      { id: 'saf-1', safarName: '1448-10-Istefada ilmiyah', datesCount: 4, filesCount: 6200, timestamp: '2026-10-28T16:30:00Z' },
      { id: 'saf-2', safarName: '1447-02-Chehlum Mubharak', datesCount: 2, filesCount: 3400, timestamp: '2026-10-15T12:00:00Z' },
    ],
    recentSessions: [
      { appId: 'mediaflow-studio', appName: 'MediaFlow Studio', durationSeconds: 3600, timestamp: '2026-10-31T08:30:00Z' },
      { appId: 'one-tap', appName: 'One Tap', durationSeconds: 2400, timestamp: '2026-10-31T09:40:00Z' },
    ],
  },
  {
    userId: 'USR-DEV-002',
    email: 'zain@studio.net',
    name: 'Zain Creative Editor',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    joinedAt: '2026-10-10T11:00:00Z',
    lastActiveAt: '2026-10-30T22:15:00Z',
    videosRenderedCount: 29,
    safarsCompletedCount: 7,
    totalStaySeconds: 31200, // 8.6 hours
    appBreakdown: {
      'mediaflow-studio': 21600,
      'one-tap': 7200,
      'anything-hub': 2400,
    },
    recentVideos: [
      { id: 'vid-4', title: 'Night_Celebration_Cut_ColorGraded.mp4', resolution: '4K', appName: 'MediaFlow Studio', timestamp: '2026-10-30T21:40:00Z' },
      { id: 'vid-5', title: 'Day3_Drone_Sequence.mp4', resolution: '1080p', appName: 'MediaFlow Studio', timestamp: '2026-10-30T19:00:00Z' },
    ],
    recentSafars: [
      { id: 'saf-3', safarName: '1448-09-Ramadan Kareem', datesCount: 3, filesCount: 4500, timestamp: '2026-10-25T14:00:00Z' },
    ],
    recentSessions: [
      { appId: 'mediaflow-studio', appName: 'MediaFlow Studio', durationSeconds: 4200, timestamp: '2026-10-30T20:00:00Z' },
    ],
  },
  {
    userId: 'USR-PROD-003',
    email: 'fatima@onetap.io',
    name: 'Fatima Production Lead',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&q=80',
    joinedAt: '2026-10-14T09:30:00Z',
    lastActiveAt: '2026-10-31T07:15:00Z',
    videosRenderedCount: 14,
    safarsCompletedCount: 31,
    totalStaySeconds: 52400, // 14.5 hours
    appBreakdown: {
      'one-tap': 38000,
      'docuflow-studio': 9400,
      'anything-hub': 5000,
    },
    recentVideos: [
      { id: 'vid-6', title: 'Batch_Thumbnails_Export.mp4', resolution: '720p', appName: 'MediaFlow Studio', timestamp: '2026-10-28T10:15:00Z' },
    ],
    recentSafars: [
      { id: 'saf-4', safarName: '1448-08-Shaaban Tour Complete', datesCount: 6, filesCount: 9800, timestamp: '2026-10-31T06:50:00Z' },
      { id: 'saf-5', safarName: '1448-07-Rajab Ziyarat Safar', datesCount: 5, filesCount: 8120, timestamp: '2026-10-22T17:30:00Z' },
      { id: 'saf-6', safarName: '1448-06-Jumada Al-Akhir Archive', datesCount: 4, filesCount: 5400, timestamp: '2026-10-18T14:20:00Z' },
    ],
    recentSessions: [
      { appId: 'one-tap', appName: 'One Tap', durationSeconds: 5400, timestamp: '2026-10-31T05:30:00Z' },
    ],
  },
  {
    userId: 'USR-DOC-004',
    email: 'mustafa@docuflow.cc',
    name: 'Mustafa Data Architect',
    role: 'member',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
    joinedAt: '2026-10-18T14:00:00Z',
    lastActiveAt: '2026-10-30T16:45:00Z',
    videosRenderedCount: 6,
    safarsCompletedCount: 12,
    totalStaySeconds: 19800, // 5.5 hours
    appBreakdown: {
      'docuflow-studio': 12000,
      'anything-data-manage': 5400,
      'anything-hub': 2400,
    },
    recentVideos: [],
    recentSafars: [
      { id: 'saf-7', safarName: '1448-05-Regional Session East', datesCount: 2, filesCount: 1980, timestamp: '2026-10-29T11:00:00Z' },
    ],
    recentSessions: [
      { appId: 'docuflow-studio', appName: 'DocuFlow', durationSeconds: 3600, timestamp: '2026-10-30T15:00:00Z' },
    ],
  },
];

class AnalyticsService {
  private localUsers: Map<string, UserAnalyticsRecord> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(LOCAL_ANALYTICS_STORAGE_KEY);
      if (stored) {
        const parsed: UserAnalyticsRecord[] = JSON.parse(stored);
        parsed.forEach((u) => this.localUsers.set(u.userId, u));
      } else {
        DEFAULT_DEMO_USERS.forEach((u) => this.localUsers.set(u.userId, u));
        this.saveToStorage();
      }
    } catch (e) {
      DEFAULT_DEMO_USERS.forEach((u) => this.localUsers.set(u.userId, u));
    }
  }

  private saveToStorage() {
    try {
      const list = Array.from(this.localUsers.values());
      localStorage.setItem(LOCAL_ANALYTICS_STORAGE_KEY, JSON.stringify(list));
    } catch (e) {}
  }

  // Ensure current logged in user has a record in analytics
  public ensureUserRecord(user: { uid: string; email: string; name: string; role?: string; avatar?: string | null }) {
    if (!this.localUsers.has(user.uid)) {
      const isInitialAdmin = user.email === 'admin@anything.local' || user.email === 'admin@anything.com' || user.role === 'admin';
      const record: UserAnalyticsRecord = {
        userId: user.uid,
        email: user.email,
        name: user.name || user.email.split('@')[0],
        role: isInitialAdmin ? 'admin' : ((user.role as any) || 'member'),
        avatar: user.avatar || null,
        joinedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
        videosRenderedCount: 0,
        safarsCompletedCount: 0,
        totalStaySeconds: 0,
        appBreakdown: {},
        recentVideos: [],
        recentSafars: [],
        recentSessions: [],
      };
      this.localUsers.set(user.uid, record);
      this.saveToStorage();
    } else {
      const existing = this.localUsers.get(user.uid)!;
      existing.name = user.name || existing.name;
      existing.avatar = user.avatar !== undefined ? user.avatar : existing.avatar;
      existing.lastActiveAt = new Date().toISOString();
      if (user.role) existing.role = user.role as any;
      this.saveToStorage();
    }
  }

  // Record an app stay session (duration in seconds)
  public async recordAppStaySession(
    userId: string,
    appId: string,
    appName: string,
    durationSeconds: number
  ) {
    if (!userId || durationSeconds <= 0) return;

    // 1. Update local cache
    const user = this.localUsers.get(userId);
    if (user) {
      user.totalStaySeconds += durationSeconds;
      user.appBreakdown[appId] = (user.appBreakdown[appId] || 0) + durationSeconds;
      user.lastActiveAt = new Date().toISOString();
      user.recentSessions.unshift({
        appId,
        appName,
        durationSeconds,
        timestamp: new Date().toISOString(),
      });
      user.recentSessions = user.recentSessions.slice(0, 30);
      this.saveToStorage();
    }

    // 2. If Supabase is connected, record to DB
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('app_usage_sessions').insert({
          user_id: userId,
          app_id: appId,
          app_name: appName,
          duration_seconds: durationSeconds,
          started_at: new Date(Date.now() - durationSeconds * 1000).toISOString(),
          ended_at: new Date().toISOString(),
        });
      } catch (err) {
        console.warn('[Analytics] Supabase record usage session failed:', err);
      }
    }
  }

  // Record a video render completed event (from MediaFlow Studio)
  public async recordVideoRendered(
    userId: string,
    videoTitle: string,
    appName = 'MediaFlow Studio',
    resolution = '1080p',
    renderDurationSeconds = 120
  ) {
    if (!userId) return;

    // Local update
    const user = this.localUsers.get(userId);
    if (user) {
      user.videosRenderedCount += 1;
      user.lastActiveAt = new Date().toISOString();
      user.recentVideos.unshift({
        id: `vid-${Date.now()}`,
        title: videoTitle,
        resolution,
        appName,
        timestamp: new Date().toISOString(),
      });
      user.recentVideos = user.recentVideos.slice(0, 30);
      this.saveToStorage();
    }

    // Supabase update
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('video_render_logs').insert({
          user_id: userId,
          video_title: videoTitle,
          app_name: appName,
          resolution,
          render_duration_seconds: renderDurationSeconds,
          status: 'completed',
        });
      } catch (err) {
        console.warn('[Analytics] Supabase record video render failed:', err);
      }
    }
  }

  // Record a Safar completed event (from One Tap)
  public async recordSafarCompleted(
    userId: string,
    safarName: string,
    datesCount = 1,
    filesCount = 100,
    totalSizeBytes = 1024 * 1024 * 500,
    appName = 'One Tap'
  ) {
    if (!userId) return;

    // Local update
    const user = this.localUsers.get(userId);
    if (user) {
      user.safarsCompletedCount += 1;
      user.lastActiveAt = new Date().toISOString();
      user.recentSafars.unshift({
        id: `saf-${Date.now()}`,
        safarName,
        datesCount,
        filesCount,
        timestamp: new Date().toISOString(),
      });
      user.recentSafars = user.recentSafars.slice(0, 30);
      this.saveToStorage();
    }

    // Supabase update
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.from('safar_completion_logs').insert({
          user_id: userId,
          safar_name: safarName,
          app_name: appName,
          dates_count: datesCount,
          total_files: filesCount,
          total_size_bytes: totalSizeBytes,
        });
      } catch (err) {
        console.warn('[Analytics] Supabase record safar completed failed:', err);
      }
    }
  }

  // Get user-wise analytics for the Admin Page
  public async getAllUsersAnalytics(): Promise<UserAnalyticsRecord[]> {
    if (isSupabaseConfigured && supabase) {
      try {
        // Fetch profiles and aggregated counts from Supabase
        const { data: profiles, error } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: false });

        if (!error && profiles && profiles.length > 0) {
          // Merge with local records
          for (const p of profiles) {
            if (!this.localUsers.has(p.id)) {
              this.localUsers.set(p.id, {
                userId: p.id,
                email: p.email,
                name: p.full_name || p.email.split('@')[0],
                role: p.role || 'member',
                avatar: p.avatar_url || null,
                joinedAt: p.created_at,
                lastActiveAt: p.last_seen_at || p.created_at,
                videosRenderedCount: 0,
                safarsCompletedCount: 0,
                totalStaySeconds: 0,
                appBreakdown: {},
                recentVideos: [],
                recentSafars: [],
                recentSessions: [],
              });
            }
          }
          this.saveToStorage();
        }
      } catch (e) {
        console.warn('[Analytics] Failed to fetch remote profiles:', e);
      }
    }

    return Array.from(this.localUsers.values()).sort(
      (a, b) => new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime()
    );
  }

  // Get specific user's metrics (for the user to see their own stay time)
  public getUserAnalytics(userId: string): UserAnalyticsRecord | null {
    return this.localUsers.get(userId) || null;
  }
}

export const analyticsService = new AnalyticsService();

