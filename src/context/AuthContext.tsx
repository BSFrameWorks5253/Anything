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

export const DEFAULT_MEMBER_USER: UserProfile = {
  name: 'Creative Member',
  email: 'member@anything.local',
  phone: '',
  role: 'Member',
  avatar: null,
  uid: 'CREATIVE-MEMBER',
  verified: true,
  provider: 'credentials',
  createdAt: '2026-01-01',
};

export const ARCHITECT_USER: UserProfile = {
  name: 'Creative Pro',
  email: 'pro@anything.local',
  phone: '',
  role: 'Pro Member',
  avatar: null,
  uid: 'CREATIVE-PRO',
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
    // Default to free local workspace member - Login is completely optional & non-compulsory
    return DEFAULT_MEMBER_USER;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Sync avatar updates from localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const currentAvatar = localStorage.getItem('anything_user_avatar');
      setUser((prev) => (prev ? { ...prev, avatar: currentAvatar } : DEFAULT_MEMBER_USER));
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
    const input = emailOrPhone.trim();
    if (!input) return { success: false, error: 'Please enter your email or phone.' };

    const currentAvatar = localStorage.getItem('anything_user_avatar') || null;
    const profile: UserProfile = {
      name: input.includes('@') ? input.split('@')[0] : 'Workspace Member',
      email: input.includes('@') ? input : `${input}@anything.local`,
      phone: input.includes('@') ? '' : input,
      role: 'Member',
      avatar: currentAvatar,
      uid: `USR-${Date.now()}`,
      verified: true,
      provider: 'credentials',
    };

    setUser(profile);
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    }
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const signUp = async (
    name: string,
    email: string,
    _password: string,
    phone?: string,
    rememberMe = true
  ): Promise<{ success: boolean; error?: string }> => {
    const currentAvatar = localStorage.getItem('anything_user_avatar') || null;
    const profile: UserProfile = {
      name: name.trim() || 'Workspace Member',
      email: email.trim(),
      phone: phone?.trim() || '',
      role: 'Member',
      avatar: currentAvatar,
      uid: `USR-${Date.now()}`,
      verified: true,
      provider: 'credentials',
    };

    setUser(profile);
    if (rememberMe) {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    }
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const loginWithSocial = async (provider: 'google' | 'github', simulatedEmail?: string) => {
    const currentAvatar = localStorage.getItem('anything_user_avatar') || null;
    const profile: UserProfile = {
      name: provider === 'google' ? 'Google User' : 'GitHub Developer',
      email: simulatedEmail || `${provider}@anything.local`,
      phone: '',
      role: 'Member',
      avatar: currentAvatar,
      uid: `${provider.toUpperCase()}-${Date.now()}`,
      verified: true,
      provider,
    };
    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    setIsAuthModalOpen(false);
    return { success: true };
  };

  const logout = () => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    // Reset to free workspace member session rather than forcing an auth wall
    setUser(DEFAULT_MEMBER_USER);
  };

  const updateUser = (updates: Partial<UserProfile>) => {
    setUser((prev) => {
      const next = prev ? { ...prev, ...updates } : { ...DEFAULT_MEMBER_USER, ...updates };
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: true, // Login is optional & non-compulsory
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
