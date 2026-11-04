import type { UserProfile } from '../context/AuthContext';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './supabaseClient';

export interface EcosystemSessionPayload {
  version: '1.0.0';
  user: {
    id: string;
    email: string;
    name: string;
    username?: string;
    role: string;
    avatar: string | null;
    provider?: string;
  };
  supabase: {
    url: string;
    anonKey: string;
  };
  auth: {
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: number;
  };
  syncedAt: string;
}

export const ECOSYSTEM_SESSION_STORAGE_KEY = 'anything_ecosystem_session_v1';

/**
 * Broadcasts user session across the Anything desktop ecosystem so that all child apps
 * (MediaFlow Studio, One Tap, DocuFlow, etc.) automatically recognize and share the same login!
 */
export async function syncSessionToEcosystem(user: UserProfile, tokenData?: { accessToken?: string; refreshToken?: string; expiresAt?: number }) {
  const payload: EcosystemSessionPayload = {
    version: '1.0.0',
    user: {
      id: user.uid,
      email: user.email,
      name: user.name,
      username: user.username || (user.email ? user.email.split('@')[0].replace(/[^a-zA-Z0-9_.-]/g, '') : 'creator'),
      role: user.role,
      avatar: user.avatar,
      provider: user.provider,
    },
    supabase: {
      url: SUPABASE_URL || '',
      anonKey: SUPABASE_ANON_KEY || '',
    },
    auth: {
      accessToken: tokenData?.accessToken,
      refreshToken: tokenData?.refreshToken,
      expiresAt: tokenData?.expiresAt,
    },
    syncedAt: new Date().toISOString(),
  };

  // 1. Save in web localStorage for frontend apps
  localStorage.setItem(ECOSYSTEM_SESSION_STORAGE_KEY, JSON.stringify(payload));

  // 2. Broadcast via Electron IPC to disk files across %APPDATA%
  const electronAPI = (window as any).electronAPI;
  if (electronAPI?.saveEcosystemSession) {
    try {
      await electronAPI.saveEcosystemSession(payload);
    } catch (e) {
      console.warn('[Ecosystem] Failed to write session via Electron IPC:', e);
    }
  }

  // 3. Broadcast custom DOM event for any embedded windows / iframes
  window.dispatchEvent(new CustomEvent('anything:ecosystem-auth-change', { detail: payload }));
}

/**
 * Clears ecosystem session across all child apps
 */
export async function clearEcosystemSession() {
  localStorage.removeItem(ECOSYSTEM_SESSION_STORAGE_KEY);
  const electronAPI = (window as any).electronAPI;
  if (electronAPI?.clearEcosystemSession) {
    try {
      await electronAPI.clearEcosystemSession();
    } catch (e) {}
  }
  window.dispatchEvent(new CustomEvent('anything:ecosystem-auth-change', { detail: null }));
}
