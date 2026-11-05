import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';
import { syncSessionToEcosystem, clearEcosystemSession } from '../services/ecosystemSession';
import { analyticsService } from '../services/analyticsService';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  username?: string;
  role: 'member' | 'pro' | 'admin' | string;
  avatar: string | null;
  uid: string;
  verified: boolean;
  provider?: 'credentials' | 'google' | 'github' | 'architect';
  createdAt?: string;
}

export const DEFAULT_MEMBER_USER: UserProfile = {
  name: 'Creative Member',
  email: 'member@anything.local',
  phone: '',
  username: 'creative_member',
  role: 'member',
  avatar: null,
  uid: 'CREATIVE-MEMBER',
  verified: true,
  provider: 'credentials',
  createdAt: '2026-01-01',
};

export const ARCHITECT_USER: UserProfile = {
  name: 'Master Architect',
  email: 'admin@anything.local',
  phone: '',
  username: 'architect_master',
  role: 'admin',
  avatar: null,
  uid: 'CREATIVE-ADMIN-MASTER',
  verified: true,
  provider: 'architect',
  createdAt: '2026-01-01',
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isSupabaseActive: boolean;
  loginAsArchitect: () => void;
  loginWithCredentials: (
    emailOrPhone: string,
    passkey?: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    name: string,
    email: string,
    password: string,
    phone?: string,
    rememberMe?: boolean,
    username?: string
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithSocial: (provider: 'google' | 'github', simulatedEmail?: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  toggleAdminRole: () => void;
  recordVideoRender: (title: string, appName?: string, resolution?: string) => Promise<void>;
  recordSafarComplete: (safarName: string, datesCount?: number, filesCount?: number) => Promise<void>;
  trackAppTime: (appId: string, appName: string, durationSeconds: number) => Promise<void>;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'anything_auth_session_v1';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(AUTH_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const avatar = localStorage.getItem('anything_user_avatar') || parsed.avatar || null;
        return { ...parsed, avatar };
      }
    } catch (e) {
      console.error('Failed to parse auth session:', e);
    }
    return DEFAULT_MEMBER_USER;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Determine admin privileges: role === 'admin' OR specific master email
  const isAdmin = Boolean(
    user && (
      user.role?.toLowerCase() === 'admin' ||
      user.email?.toLowerCase().includes('admin@') ||
      user.email?.toLowerCase() === 'burhanuddin@anything.local'
    )
  );

  // Sync session changes to the ecosystem & analytics service
  useEffect(() => {
    if (user) {
      analyticsService.ensureUserRecord(user);
      syncSessionToEcosystem(user);
    }
  }, [user]);

  // Listen to Supabase Auth state changes if Supabase is connected
  useEffect(() => {
    if (isSupabaseConfigured && supabase) {
      // 1. Get initial session
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (session?.user) {
          mapSupabaseUserToProfile(session.user, session.access_token);
        }
      });

      // 2. Subscribe to auth changes (e.g. Google OAuth redirect)
      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (session?.user) {
          mapSupabaseUserToProfile(session.user, session.access_token);
        } else if (event === 'SIGNED_OUT') {
          setUser(DEFAULT_MEMBER_USER);
          clearEcosystemSession();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  // Listen to Child App close duration from Electron
  useEffect(() => {
    const electronAPI = (window as any).electronAPI;
    if (electronAPI?.onAppClosedDuration) {
      const unsub = electronAPI.onAppClosedDuration((data: { appId: string; appName: string; durationSeconds: number }) => {
        if (user && data.durationSeconds > 0) {
          analyticsService.recordAppStaySession(user.uid, data.appId, data.appName, data.durationSeconds);
        }
      });
      return unsub;
    }
  }, [user]);

  // Track time spent in the Anything Master Hub itself (heartbeat every 60s)
  useEffect(() => {
    if (!user) return;
    const interval = setInterval(() => {
      analyticsService.recordAppStaySession(user.uid, 'anything-hub', 'Anything Hub', 60);
    }, 60000);
    return () => clearInterval(interval);
  }, [user]);

  const mapSupabaseUserToProfile = (sbUser: any, token?: string) => {
    const meta = sbUser.user_metadata || {};
    const email = sbUser.email || '';
    const name = meta.full_name || meta.name || email.split('@')[0] || 'Ecosystem User';
    const username = meta.username || meta.user_name || (email ? email.split('@')[0].replace(/[^a-zA-Z0-9_.-]/g, '') : 'creator');
    const avatar = meta.avatar_url || meta.picture || localStorage.getItem('anything_user_avatar') || null;
    const isAutoAdmin = email === 'admin@anything.com' || email === 'admin@anything.local' || email === 'burhanuddin@anything.local' || username.toLowerCase() === 'admin';
    const role = isAutoAdmin ? 'admin' : (meta.role || 'member');

    const profile: UserProfile = {
      name,
      username,
      email,
      phone: sbUser.phone || '',
      role,
      avatar,
      uid: sbUser.id,
      verified: Boolean(sbUser.email_confirmed_at || sbUser.phone_confirmed_at),
      provider: sbUser.app_metadata?.provider === 'google' ? 'google' : 'credentials',
      createdAt: sbUser.created_at,
    };

    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    localStorage.setItem('anything_last_signed_in_account', JSON.stringify({
      email: profile.email,
      name: profile.name,
      username: profile.username || profile.email.split('@')[0],
      avatar: profile.avatar || null,
    }));
    analyticsService.ensureUserRecord(profile);
    syncSessionToEcosystem(profile, { accessToken: token });
  };

  const loginAsArchitect = () => {
    const currentAvatar = localStorage.getItem('anything_user_avatar') || null;
    const profile: UserProfile = { ...ARCHITECT_USER, avatar: currentAvatar };
    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    analyticsService.ensureUserRecord(profile);
    syncSessionToEcosystem(profile);
    setIsAuthModalOpen(false);
  };

  const loginWithCredentials = async (
    identifier: string,
    passkey?: string,
    rememberMe = true
  ): Promise<{ success: boolean; error?: string }> => {
    const rawInput = (identifier || '').trim();
    if (!rawInput) return { success: false, error: 'Please enter your username or email.' };
    const cleanInput = rawInput.replace(/^@/, '');

    if (!passkey || passkey.trim().length === 0) {
      return { success: false, error: 'Password is required to sign in.' };
    }

    // 1. Supabase Authentication (Online Mode)
    if (isSupabaseConfigured && supabase) {
      try {
        let authEmail = cleanInput;

        // If user typed a username (no @), look up their email in public.profiles table
        if (!cleanInput.includes('@')) {
          const { data: profileRecord } = await supabase
            .from('profiles')
            .select('email, username')
            .ilike('username', cleanInput)
            .maybeSingle();

          if (profileRecord && profileRecord.email) {
            authEmail = profileRecord.email;
          }
        }

        // Call Supabase auth if we have a valid email format
        if (authEmail.includes('@')) {
          const { data, error } = await supabase.auth.signInWithPassword({
            email: authEmail,
            password: passkey,
          });

          if (!error && data.user) {
            mapSupabaseUserToProfile(data.user, data.session?.access_token);
            setIsAuthModalOpen(false);
            return { success: true };
          } else if (error && cleanInput.includes('@')) {
            return { success: false, error: error.message };
          }
        }
      } catch (err: any) {
        console.warn('[Auth] Supabase sign-in lookup error:', err);
      }
    }

    // 2. Ecosystem Session / App-Provided Username / Local Offline Fallback
    const currentAvatar = localStorage.getItem('anything_user_avatar') || null;
    const lowerInput = cleanInput.toLowerCase();

    // Check if matching an ecosystem session stored in localStorage
    let ecoMatchedUser: any = null;
    try {
      const ecoRaw = localStorage.getItem('anything_ecosystem_session_v1');
      if (ecoRaw) {
        const parsedEco = JSON.parse(ecoRaw);
        if (parsedEco?.user) {
          const uHandle = (parsedEco.user.username || (parsedEco.user.email ? parsedEco.user.email.split('@')[0] : '')).toLowerCase();
          if (uHandle === lowerInput || parsedEco.user.email?.toLowerCase() === lowerInput) {
            ecoMatchedUser = parsedEco.user;
          }
        }
      }
    } catch (e) {}

    // Check built-in ecosystem usernames (e.g. admin, architect, zaid, fatima)
    const KNOWN_ECOSYSTEM_USERS: Record<string, Partial<UserProfile>> = {
      admin: {
        name: 'Master Architect',
        username: 'admin',
        email: 'admin@anything.local',
        role: 'admin',
        uid: 'CREATIVE-ADMIN-MASTER',
        avatar: currentAvatar || ARCHITECT_USER.avatar,
      },
      architect: {
        name: 'Master Architect',
        username: 'architect',
        email: 'admin@anything.local',
        role: 'admin',
        uid: 'CREATIVE-ADMIN-MASTER',
        avatar: currentAvatar || ARCHITECT_USER.avatar,
      },
      zaid: {
        name: 'Zaid Editor',
        username: 'zaid',
        email: 'zaid@anything.local',
        role: 'member',
        uid: 'user_zaid_editor',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
      },
      fatima: {
        name: 'Fatima Lead',
        username: 'fatima',
        email: 'fatima@anything.local',
        role: 'member',
        uid: 'user_fatima_lead',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
      },
    };

    let profile: UserProfile;

    if (ecoMatchedUser) {
      profile = {
        name: ecoMatchedUser.name || cleanInput,
        username: ecoMatchedUser.username || cleanInput,
        email: ecoMatchedUser.email || `${cleanInput}@anything.local`,
        phone: '',
        role: (ecoMatchedUser.role as any) || 'member',
        avatar: ecoMatchedUser.avatar || currentAvatar,
        uid: ecoMatchedUser.id || `USR-${Date.now()}`,
        verified: true,
        provider: 'credentials',
      };
    } else if (KNOWN_ECOSYSTEM_USERS[lowerInput]) {
      const known = KNOWN_ECOSYSTEM_USERS[lowerInput];
      profile = {
        name: known.name || cleanInput,
        username: known.username || cleanInput,
        email: known.email || `${cleanInput}@anything.local`,
        phone: '',
        role: known.role || 'member',
        avatar: known.avatar || currentAvatar,
        uid: known.uid || `USR-${Date.now()}`,
        verified: true,
        provider: 'credentials',
      };
    } else {
      const isSpecialAdmin = lowerInput === 'admin' || lowerInput === 'admin@anything.local' || lowerInput === 'admin@anything.com';
      const userHandle = cleanInput.includes('@') ? cleanInput.split('@')[0] : cleanInput;
      profile = {
        name: cleanInput.includes('@') ? cleanInput.split('@')[0] : cleanInput,
        username: userHandle,
        email: cleanInput.includes('@') ? cleanInput : `${cleanInput.toLowerCase().replace(/[^a-z0-9_.-]/g, '')}@anything.local`,
        phone: '',
        role: isSpecialAdmin ? 'admin' : 'member',
        avatar: currentAvatar,
        uid: isSpecialAdmin ? 'CREATIVE-ADMIN-MASTER' : `USR-${Date.now()}`,
        verified: true,
        provider: 'credentials',
      };
    }

    setUser(profile);
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      localStorage.setItem('anything_last_signed_in_account', JSON.stringify({
        email: profile.email,
        name: profile.name,
        username: profile.username || (profile.email ? profile.email.split('@')[0] : 'creator'),
        avatar: profile.avatar || null,
      }));
    }
    analyticsService.ensureUserRecord(profile);
    syncSessionToEcosystem(profile);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    phone?: string,
    rememberMe = true,
    username?: string
  ): Promise<{ success: boolean; error?: string }> => {
    const cleanEmail = email.trim();
    const cleanName = name.trim() || cleanEmail.split('@')[0];
    const cleanUsername = (username || cleanEmail.split('@')[0] || cleanName.toLowerCase().replace(/\s+/g, '_')).trim().replace(/^@/, '');

    // 1. If Supabase is configured, register with Supabase Auth
    if (isSupabaseConfigured && supabase) {
      try {
        const isInitialAdmin = cleanEmail === 'admin@anything.com' || cleanEmail === 'admin@anything.local' || cleanUsername.toLowerCase() === 'admin';
        const { data, error } = await supabase.auth.signUp({
          email: cleanEmail,
          password,
          options: {
            data: {
              full_name: cleanName,
              username: cleanUsername,
              role: isInitialAdmin ? 'admin' : 'member',
              phone: phone || '',
            },
          },
        });

        if (error) {
          return { success: false, error: error.message };
        }

        if (data.user) {
          // Upsert into public.profiles so username lookups succeed immediately
          try {
            await supabase.from('profiles').upsert({
              id: data.user.id,
              email: cleanEmail,
              full_name: cleanName,
              username: cleanUsername,
              role: isInitialAdmin ? 'admin' : 'member',
              phone: phone || '',
            }, { onConflict: 'id' });
          } catch (e) {}

          mapSupabaseUserToProfile(data.user, data.session?.access_token);
          setIsAuthModalOpen(false);
          return { success: true };
        }
      } catch (err: any) {
        return { success: false, error: err.message || 'Supabase sign up failed.' };
      }
    }

    // 2. Local fallback / offline registration
    const currentAvatar = localStorage.getItem('anything_user_avatar') || null;
    const isSpecialAdmin = cleanEmail.toLowerCase() === 'admin@anything.local' || cleanEmail.toLowerCase() === 'admin@anything.com' || cleanUsername.toLowerCase() === 'admin';
    const profile: UserProfile = {
      name: cleanName,
      username: cleanUsername,
      email: cleanEmail,
      phone: phone?.trim() || '',
      role: isSpecialAdmin ? 'admin' : 'member',
      avatar: currentAvatar,
      uid: isSpecialAdmin ? 'CREATIVE-ADMIN-MASTER' : `USR-${Date.now()}`,
      verified: true,
      provider: 'credentials',
    };

    setUser(profile);
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      localStorage.setItem('anything_last_signed_in_account', JSON.stringify({
        email: profile.email,
        name: profile.name,
        username: cleanUsername,
        avatar: profile.avatar || null,
      }));
    }
    analyticsService.ensureUserRecord(profile);
    syncSessionToEcosystem(profile);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const loginWithGoogle = async (): Promise<{ success: boolean; error?: string }> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              access_type: 'offline',
              prompt: 'consent',
            },
          },
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }

    // Local / Desktop simulated Google login
    return loginWithSocial('google', 'creative.master@gmail.com');
  };

  const loginWithSocial = async (provider: 'google' | 'github', simulatedEmail?: string): Promise<{ success: boolean; error?: string }> => {
    if (provider === 'google' && isSupabaseConfigured && supabase) {
      return loginWithGoogle();
    }

    const currentAvatar = localStorage.getItem('anything_user_avatar') || (
      provider === 'google'
        ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'
        : null
    );

    const email = simulatedEmail || (provider === 'google' ? 'creative.pro@gmail.com' : 'developer@github.com');
    const profile: UserProfile = {
      name: provider === 'google' ? 'Google Creative Pro' : 'GitHub Developer',
      email,
      phone: '',
      role: 'member',
      avatar: currentAvatar,
      uid: `${provider.toUpperCase()}-${Date.now()}`,
      verified: true,
      provider,
    };

    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    analyticsService.ensureUserRecord(profile);
    syncSessionToEcosystem(profile);
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    if (!email) return { success: false, error: 'Please enter your email.' };
    if (isSupabaseConfigured && supabase) {
      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) return { success: false, error: error.message };
        return { success: true };
      } catch (err: any) {
        return { success: false, error: err.message };
      }
    }
    return { success: true };
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      try {
        await supabase.auth.signOut();
      } catch (e) {}
    }
    localStorage.removeItem(AUTH_STORAGE_KEY);
    clearEcosystemSession();
    setUser(DEFAULT_MEMBER_USER);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...updates } : { ...DEFAULT_MEMBER_USER, ...updates };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
      if (next.avatar) {
        localStorage.setItem('anything_user_avatar', next.avatar);
      } else if (updates.avatar === null) {
        localStorage.removeItem('anything_user_avatar');
      }
      localStorage.setItem('anything_last_signed_in_account', JSON.stringify({
        email: next.email,
        name: next.name,
        username: next.username || (next.email ? next.email.split('@')[0] : ''),
        avatar: next.avatar || null,
      }));
      analyticsService.ensureUserRecord(next);
      syncSessionToEcosystem(next);
      return next;
    });
  };

  const toggleAdminRole = () => {
    if (!user) return;
    const newRole = user.role === 'admin' ? 'member' : 'admin';
    updateUser({ role: newRole });
  };

  const recordVideoRender = async (title: string, appName = 'MediaFlow Studio', resolution = '1080p') => {
    if (user) {
      await analyticsService.recordVideoRendered(user.uid, title, appName, resolution);
    }
  };

  const recordSafarComplete = async (safarName: string, datesCount = 1, filesCount = 100) => {
    if (user) {
      await analyticsService.recordSafarCompleted(user.uid, safarName, datesCount, filesCount);
    }
  };

  const trackAppTime = async (appId: string, appName: string, durationSeconds: number) => {
    if (user) {
      await analyticsService.recordAppStaySession(user.uid, appId, appName, durationSeconds);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user && user.uid !== DEFAULT_MEMBER_USER.uid),
        isAdmin,
        isSupabaseActive: isSupabaseConfigured,
        loginAsArchitect,
        loginWithCredentials,
        signUp,
        loginWithSocial,
        loginWithGoogle,
        resetPassword,
        logout,
        updateUser,
        toggleAdminRole,
        recordVideoRender,
        recordSafarComplete,
        trackAppTime,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
