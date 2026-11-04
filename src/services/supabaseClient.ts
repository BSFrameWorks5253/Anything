import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Retrieve credentials from environment variables or custom local storage override
const envUrl = (import.meta.env.VITE_SUPABASE_URL as string) || '';
const envKey = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string) || (import.meta.env.VITE_SUPABASE_ANON_KEY as string) || '';

export const SUPABASE_URL = localStorage.getItem('anything_custom_supabase_url') || envUrl;
export const SUPABASE_ANON_KEY = localStorage.getItem('anything_custom_supabase_anon_key') || envKey;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && 
  SUPABASE_URL.startsWith('http') && 
  SUPABASE_ANON_KEY && 
  SUPABASE_ANON_KEY.length > 5
);

let clientInstance: SupabaseClient | null = null;

if (isSupabaseConfigured) {
  try {
    clientInstance = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storage: window.localStorage,
      },
    });
  } catch (err) {
    console.warn('[Supabase] Failed to initialize Supabase client:', err);
  }
}

export const supabase = clientInstance;

export function updateCustomSupabaseConfig(url: string, anonKey: string) {
  if (url && anonKey) {
    localStorage.setItem('anything_custom_supabase_url', url.trim());
    localStorage.setItem('anything_custom_supabase_anon_key', anonKey.trim());
  } else {
    localStorage.removeItem('anything_custom_supabase_url');
    localStorage.removeItem('anything_custom_supabase_anon_key');
  }
  window.location.reload();
}
