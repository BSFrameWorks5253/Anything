import React, { createContext, useContext, useState, useEffect } from 'react';

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  role: string;
  avatar: string | null;
  uid: string;
  verified: boolean;
}

export const ARCHITECT_USER: UserProfile = {
  name: 'Burhanuddin Sounasath',
  email: 'burhanuddin@anything.io',
  phone: '8369811201',
  role: 'Creator & Lead Architect',
  avatar: null,
  uid: 'BURHANUDDIN-8369811201',
  verified: true,
};

interface AuthContextType {
  user: UserProfile | null;
  isAuthenticated: boolean;
  loginAsArchitect: () => void;
  loginWithCredentials: (emailOrPhone: string, passkey?: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  updateUser: (updates: Partial<UserProfile>) => void;
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
    return null; // Not logged in by default unless explicit session exists
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
    const profile = { ...ARCHITECT_USER, avatar: currentAvatar };
    setUser(profile);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
    setIsAuthModalOpen(false);
  };

  const loginWithCredentials = async (
    emailOrPhone: string,
    _passkey?: string
  ): Promise<{ success: boolean; error?: string }> => {
    if (!emailOrPhone.trim()) {
      return { success: false, error: 'Please enter your email or phone number.' };
    }

    const trimmed = emailOrPhone.trim();
    const currentAvatar = localStorage.getItem('anything_user_avatar') || null;

    if (
      trimmed === '8369811201' ||
      trimmed.toLowerCase() === 'burhanuddin@anything.io' ||
      trimmed.toLowerCase().includes('burhanuddin')
    ) {
      const profile = { ...ARCHITECT_USER, avatar: currentAvatar };
      setUser(profile);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(profile));
      setIsAuthModalOpen(false);
      return { success: true };
    }

    // Generic User Profile
    const customUser: UserProfile = {
      name: trimmed.includes('@') ? trimmed.split('@')[0] : 'Workspace Member',
      email: trimmed.includes('@') ? trimmed : `${trimmed}@anything.local`,
      phone: trimmed.includes('@') ? '' : trimmed,
      role: 'Registered Member',
      avatar: currentAvatar,
      uid: `USR-${Date.now().toString().slice(-6)}`,
      verified: true,
    };

    setUser(customUser);
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(customUser));
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
