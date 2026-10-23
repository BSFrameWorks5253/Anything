import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
  uid: string;
  verified: boolean;
  provider?: 'credentials' | 'google' | 'github' | 'architect';
  createdAt?: string;
}

export const ARCHITECT_USER: UserProfile = {
  name: 'Burhanuddin Sounasath',
  email: 'burhanuddin@anything.io',
  phone: '8369811201',
  role: 'Creator & Lead Architect',
  avatar: null,
  uid: 'BURHANUDDIN-8369811201',
  verified: true,
  provider: 'architect',
  createdAt: '2026-01-01',
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
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
    rememberMe?: boolean
  ) => Promise<{ success: boolean; error?: string }>;
  loginWithSocial: (provider: 'google' | 'github', simulatedEmail?: string) => Promise<{ success: boolean }>;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
  isAuthModalOpen: boolean;
  openAuthModal: () => void;
  closeAuthModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'anything_auth_session_v1';
const USERS_DB_KEY = 'anything_users_registry_v1';

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
    return null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync avatar updates from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const currentAvatar = localStorage.getItem('anything_user_avatar');
      setUser((prev) => (prev ? { ...prev, avatar: currentAvatar } : null));
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const loginAsArchitect = () => {
    const currentAvatar = localStorage.getItem('anything_user_avatar') || null;
    const profile: UserProfile = { ...ARCHITECT_USER, avatar: currentAvatar };
    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    setIsAuthModalOpen(false);
  };

  const loginWithCredentials = async (
    emailOrPhone: string,
    passkey?: string,
    rememberMe = true
  ): Promise<{ success: boolean; error?: string }> => {
    if (!emailOrPhone.trim()) {
      return { success: false, error: 'Please enter your email address or phone number.' };
    }

    const trimmed = emailOrPhone.trim();
    const currentAvatar = localStorage.getItem('anything_user_avatar') || null;

    // Check Architect credentials
    if (
      trimmed === '8369811201' ||
      trimmed.toLowerCase() === 'burhanuddin@anything.io' ||
      trimmed.toLowerCase().includes('burhanuddin')
    ) {
      const profile = { ...ARCHITECT_USER, avatar: currentAvatar };
      setUser(profile);
      if (rememberMe) {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      }
      setIsAuthModalOpen(false);
      return { success: true };
    }

    // Check registered users in local mock database
    try {
      const rawUsers = localStorage.getItem(USERS_DB_KEY);
      const registry: any[] = rawUsers ? JSON.parse(rawUsers) : [];
      const found = registry.find(
        (u) =>
          u.email.toLowerCase() === trimmed.toLowerCase() ||
          (u.phone && u.phone === trimmed)
      );

      if (found) {
        if (passkey && found.password && found.password !== passkey) {
          return { success: false, error: 'Incorrect password entered.' };
        }
        const profile: UserProfile = {
          name: found.name,
          email: found.email,
          phone: found.phone || '',
          role: found.role || 'Workspace Member',
          avatar: currentAvatar || found.avatar || null,
          uid: found.uid,
          verified: true,
          provider: 'credentials',
          createdAt: found.createdAt,
        };
        setUser(profile);
        if (rememberMe) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
        }
        setIsAuthModalOpen(false);
        return { success: true };
      }
    } catch (e) {}

    // Password validation for new/ad-hoc login
    if (passkey && passkey.length < 4) {
      return { success: false, error: 'Password must be at least 4 characters long.' };
    }

    // Automatic onboarding profile
    const derivedName = trimmed.includes('@')
      ? trimmed.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
      : 'Workspace Member';

    const customUser: UserProfile = {
      name: derivedName,
      email: trimmed.includes('@') ? trimmed : `${trimmed}@anything.local`,
      phone: trimmed.includes('@') ? '' : trimmed,
      role: 'Registered Member',
      avatar: currentAvatar,
      uid: `USR-${Date.now().toString().slice(-6)}`,
      verified: true,
      provider: 'credentials',
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setUser(customUser);
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(customUser));
    }
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const signUp = async (
    name: string,
    email: string,
    password: string,
    phone = '',
    rememberMe = true
  ): Promise<{ success: boolean; error?: string }> => {
    if (!name.trim()) return { success: false, error: 'Please enter your full name.' };
    if (!email.trim() || !email.includes('@')) return { success: false, error: 'Please enter a valid email address.' };
    if (!password || password.length < 6) return { success: false, error: 'Password must be at least 6 characters.' };

    const currentAvatar = localStorage.getItem('anything_user_avatar') || null;
    const newUid = `USR-${Math.floor(100000 + Math.random() * 900000)}`;

    const newUserRecord = {
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      password,
      role: 'Workspace Member',
      uid: newUid,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    // Save into users registry
    try {
      const rawUsers = localStorage.getItem(USERS_DB_KEY);
      const registry: any[] = rawUsers ? JSON.parse(rawUsers) : [];
      registry.push(newUserRecord);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(registry));
    } catch (e) {}

    const profile: UserProfile = {
      name: newUserRecord.name,
      email: newUserRecord.email,
      phone: newUserRecord.phone,
      role: newUserRecord.role,
      avatar: currentAvatar,
      uid: newUid,
      verified: true,
      provider: 'credentials',
      createdAt: newUserRecord.createdAt,
    };

    setUser(profile);
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    }
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const loginWithSocial = async (
    provider: 'google' | 'github',
    simulatedEmail?: string
  ): Promise<{ success: boolean }> => {
    const currentAvatar = localStorage.getItem('anything_user_avatar') || null;
    const email =
      simulatedEmail ||
      (provider === 'google' ? 'zeninfosys@gmail.com' : 'burhanuddin@github.com');
    const name = email.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    const profile: UserProfile = {
      name,
      email,
      phone: '',
      role: provider === 'google' ? 'Google Workspace User' : 'GitHub Developer',
      avatar: currentAvatar,
      uid: `${provider.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      verified: true,
      provider,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setIsAuthModalOpen(true);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      if (!prev) return null;
      const next = { ...prev, ...updates };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: Boolean(user),
        loginAsArchitect,
        loginWithCredentials,
        signUp,
        loginWithSocial,
        logout,
        updateUser,
        isAuthModalOpen,
        openAuthModal: () => setIsAuthModalOpen(true),
        closeAuthModal: () => setIsAuthModalOpen(false),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
