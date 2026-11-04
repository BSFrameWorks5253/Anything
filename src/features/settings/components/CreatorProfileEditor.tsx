import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  AtSign,
  User,
  Check,
  AlertCircle,
  Wand2,
  Image as ImageIcon,
  CheckCircle2,
  RefreshCw,
  Palette
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import { useAuth } from '../../../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../../../services/supabaseClient';

// High-fidelity vector avatar presets (offline-ready, zero network latency)
export const PRESET_AVATARS = [
  {
    id: 'cyber_neon',
    name: 'Cyber Neon',
    accent: '#06b6d4',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2306b6d4"/><stop offset="50%" stop-color="%233b82f6"/><stop offset="100%" stop-color="%238b5cf6"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g1)"/><circle cx="50" cy="38" r="18" fill="%23ffffff" opacity="0.95"/><path d="M22 84 C24 64, 40 58, 50 58 C60 58, 76 64, 78 84 Z" fill="%23ffffff" opacity="0.95"/></svg>`
  },
  {
    id: 'studio_gold',
    name: 'Studio Gold',
    accent: '#f59e0b',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g2" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f59e0b"/><stop offset="50%" stop-color="%23ef4444"/><stop offset="100%" stop-color="%23ec4899"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g2)"/><polygon points="50,22 62,45 86,45 66,60 74,83 50,68 26,83 34,60 14,45 38,45" fill="%23ffffff" opacity="0.92"/></svg>`
  },
  {
    id: 'emerald_flow',
    name: 'Emerald Matrix',
    accent: '#10b981',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g3" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%2310b981"/><stop offset="50%" stop-color="%23059669"/><stop offset="100%" stop-color="%23047857"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g3)"/><circle cx="50" cy="40" r="16" fill="%23ffffff" opacity="0.95"/><path d="M25 80 C28 62, 42 58, 50 58 C58 58, 72 62, 75 80 Z" fill="%23ffffff" opacity="0.95"/></svg>`
  },
  {
    id: 'violet_pulse',
    name: 'Violet Pulse',
    accent: '#a855f7',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g4" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%238b5cf6"/><stop offset="50%" stop-color="%23d946ef"/><stop offset="100%" stop-color="%23f43f5e"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g4)"/><circle cx="50" cy="50" r="28" fill="none" stroke="%23ffffff" stroke-width="6" opacity="0.95"/><circle cx="50" cy="50" r="12" fill="%23ffffff"/></svg>`
  },
  {
    id: 'dark_onyx',
    name: 'Midnight Pro',
    accent: '#64748b',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g5" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231e293b"/><stop offset="50%" stop-color="%23334155"/><stop offset="100%" stop-color="%230f172a"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g5)"/><path d="M50 20 L76 35 L76 65 L50 80 L24 65 L24 35 Z" fill="none" stroke="%2338bdf8" stroke-width="5"/><circle cx="50" cy="50" r="12" fill="%2338bdf8"/></svg>`
  },
  {
    id: 'sunset_zen',
    name: 'Sunset Zen',
    accent: '#f97316',
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="g6" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23f97316"/><stop offset="50%" stop-color="%23fbbf24"/><stop offset="100%" stop-color="%23ea580c"/></linearGradient></defs><circle cx="50" cy="50" r="50" fill="url(%23g6)"/><circle cx="50" cy="50" r="22" fill="%23ffffff" opacity="0.95"/><path d="M30 65 Q50 48 70 65" stroke="%23ea580c" stroke-width="5" fill="none"/></svg>`
  }
];

// Reserved handles / taken mock list for offline simulation
const RESERVED_HANDLES = new Set([
  'admin', 'administrator', 'system', 'root', 'anything', 'onetap',
  'mediaflow', 'support', 'official', 'guest', 'member', 'owner'
]);

interface CreatorProfileEditorProps {
  onAvatarSelect?: (avatarUrl: string) => void;
  onOpenUploadCropper?: () => void;
}

export const CreatorProfileEditor: React.FC<CreatorProfileEditorProps> = ({
  onAvatarSelect,
  onOpenUploadCropper
}) => {
  const { user, updateUser } = useAuth();

  const [displayName, setDisplayName] = useState(user?.name || '');
  const [handle, setHandle] = useState(() => {
    return user?.username || (user?.email ? user.email.split('@')[0] : 'creator');
  });

  const [selectedAvatar, setSelectedAvatar] = useState<string | null>(user?.avatar || null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [isCollision, setIsCollision] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when user profile changes
  useEffect(() => {
    if (user?.name) setDisplayName(user.name);
    if (user?.username) setHandle(user.username);
    if (user?.avatar) setSelectedAvatar(user.avatar);
  }, [user?.name, user?.username, user?.avatar]);

  // Generates intelligent, personalized recommendations with numbers and special characters
  const generateRecommendations = (baseHandle: string): string[] => {
    const clean = baseHandle
      .toLowerCase()
      .replace(/[^a-z0-9_.-]/g, '')
      .slice(0, 15) || 'creator';

    const suggestions: string[] = [
      `${clean}_${Math.floor(10 + Math.random() * 89)}`,
      `${clean}_5253`,
      `${clean}.pro`,
      `real_${clean}`,
      `${clean}_26`,
      `${clean}_studio`
    ];

    // Pick 4 unique ones
    return Array.from(new Set(suggestions)).slice(0, 4);
  };

  // Validate handle and check for collisions or similarity
  const validateHandle = async (inputHandle: string) => {
    setErrorMsg(null);
    setIsCollision(false);

    // Rule 1: No spaces allowed
    if (/\s/.test(inputHandle)) {
      setErrorMsg('User ID cannot contain any spaces. Spaces are automatically removed.');
      return false;
    }

    // Rule 2: Must be alphanumeric, underscores, hyphens, or dots
    if (!/^[a-zA-Z0-9_.-]+$/.test(inputHandle)) {
      setErrorMsg('User ID can only contain letters, numbers, underscores (_), hyphens (-), and dots (.).');
      return false;
    }

    if (inputHandle.length < 3) {
      setErrorMsg('User ID must be at least 3 characters long.');
      return false;
    }

    const cleanLower = inputHandle.toLowerCase().trim();

    // Check collision with reserved handles
    let collisionDetected = RESERVED_HANDLES.has(cleanLower);

    // If Supabase is active, check against existing profiles
    if (!collisionDetected && isSupabaseConfigured && supabase) {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('id, username')
          .eq('username', cleanLower);

        if (data && data.length > 0) {
          // If the profile belongs to someone else
          if (!user?.uid || data[0].id !== user.uid) {
            collisionDetected = true;
          }
        }
      } catch (e) {
        // Fallback gracefully
      }
    }

    if (collisionDetected) {
      setIsCollision(true);
      setErrorMsg(`@${inputHandle} is already reserved or in use.`);
      setRecommendations(generateRecommendations(cleanLower));
      return false;
    } else {
      setIsCollision(false);
      setRecommendations([]);
      return true;
    }
  };

  const handleHandleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Automatically strip any spaces that the user types or pastes!
    const rawVal = e.target.value.replace(/\s+/g, '_');
    setHandle(rawVal);
    validateHandle(rawVal);
  };

  const handleSelectRecommendation = (rec: string) => {
    setHandle(rec);
    setIsCollision(false);
    setErrorMsg(null);
    setRecommendations([]);
  };

  const handlePickPresetAvatar = (avatarUrl: string) => {
    setSelectedAvatar(avatarUrl);
    if (onAvatarSelect) onAvatarSelect(avatarUrl);
  };

  const handleSaveProfile = async () => {
    const isValid = await validateHandle(handle);
    if (!isValid && isCollision) {
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    const cleanHandle = handle.replace(/\s+/g, '_').toLowerCase().trim();
    const cleanName = displayName.trim() || cleanHandle;

    try {
      // 1. Update in AuthContext & LocalStorage
      updateUser({
        name: cleanName,
        username: cleanHandle,
        avatar: selectedAvatar
      });

      if (selectedAvatar) {
        localStorage.setItem('anything_user_avatar', selectedAvatar);
      }

      // 2. Update in Supabase profiles table if available
      if (isSupabaseConfigured && supabase && user?.uid) {
        await supabase
          .from('profiles')
          .update({
            full_name: cleanName,
            username: cleanHandle,
            avatar_url: selectedAvatar
          })
          .eq('id', user.uid);
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3500);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save creator profile.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 mt-6 relative overflow-hidden">
      {/* Background ambient iridescent glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-rose-500/10 blur-3xl pointer-events-none" />

      <div className="flex items-center justify-between mb-5">
        <div>
          <h4 className="text-sm font-mono uppercase tracking-wider font-bold text-zinc-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-500 animate-spin-slow" />
            Creator Identity & Custom User ID
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Set your public display name, unique handle, and avatar. Broadcasted automatically across One Tap & all child apps.
          </p>
        </div>

        <GlassBadge variant="cyan" dot>
          Live Ecosystem Sync
        </GlassBadge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Name & User ID (Handle) */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
              Creator Display Name
            </label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="e.g. Burhanuddin or Studio Lead"
              className="w-full px-3.5 py-2 rounded-xl text-sm bg-zinc-100 dark:bg-white/5 border border-zinc-300 dark:border-white/10 text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AtSign className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Unique User ID / Handle (No spaces)
              </span>
              <button
                type="button"
                onClick={() => setRecommendations(generateRecommendations(handle || 'creator'))}
                className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer font-sans"
              >
                <Wand2 className="w-3 h-3" />
                Suggest
              </button>
            </label>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-400 font-mono text-sm">
                @
              </div>
              <input
                type="text"
                value={handle}
                onChange={handleHandleChange}
                placeholder="creator_handle"
                className={`w-full pl-8 pr-3.5 py-2 rounded-xl text-sm bg-zinc-100 dark:bg-white/5 border text-zinc-900 dark:text-white placeholder:text-zinc-400 focus:outline-none transition-all font-mono font-semibold ${
                  isCollision
                    ? 'border-amber-500/70 focus:ring-2 focus:ring-amber-500/50'
                    : 'border-zinc-300 dark:border-white/10 focus:ring-2 focus:ring-cyan-500/50'
                }`}
              />
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-1">
              Displayed as <span className="font-mono font-semibold text-cyan-600 dark:text-cyan-400">@{handle || 'username'}</span> at the top of One Tap and child apps. Spaces are strictly forbidden.
            </p>

            {/* Error or Collision Warning */}
            {errorMsg && (
              <div className="mt-2.5 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">{errorMsg}</p>
                </div>
              </div>
            )}

            {/* Smart Handle Recommendations with numbers & special characters */}
            {recommendations.length > 0 && (
              <div className="mt-3 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
                <span className="text-[11px] font-mono text-cyan-700 dark:text-cyan-300 font-bold block mb-2 flex items-center gap-1.5">
                  <Wand2 className="w-3 h-3 text-cyan-500" />
                  Recommended Handles for you (Click to choose):
                </span>
                <div className="flex flex-wrap gap-2">
                  {recommendations.map((rec) => (
                    <button
                      key={rec}
                      type="button"
                      onClick={() => handleSelectRecommendation(rec)}
                      className="px-2.5 py-1 rounded-lg text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white transition-all shadow-xs active:scale-95 cursor-pointer flex items-center gap-1"
                    >
                      <span>@{rec}</span>
                      <Check className="w-3 h-3 opacity-60" />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Preset Avatar / PFP Picker */}
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-mono font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5 flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Palette className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                Choose Profile Picture (PFP)
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">1-Click Preset or Upload</span>
            </label>

            {/* 6 Curated Preset Avatars */}
            <div className="grid grid-cols-3 gap-2.5">
              {PRESET_AVATARS.map((preset) => {
                const isSelected = selectedAvatar === preset.dataUrl;
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePickPresetAvatar(preset.dataUrl)}
                    className={`relative p-2 rounded-xl border flex flex-col items-center gap-1.5 transition-all duration-200 cursor-pointer text-center group ${
                      isSelected
                        ? 'border-cyan-500 bg-cyan-500/10 shadow-md shadow-cyan-500/15'
                        : 'border-zinc-200 dark:border-white/10 hover:border-zinc-400 dark:hover:border-white/25 bg-zinc-50 dark:bg-white/5'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 shadow-xs relative">
                      <img src={preset.dataUrl} alt={preset.name} className="w-full h-full object-cover" />
                      {isSelected && (
                        <div className="absolute inset-0 bg-cyan-500/40 backdrop-blur-[1px] flex items-center justify-center text-white">
                          <Check className="w-4 h-4 drop-shadow" />
                        </div>
                      )}
                    </div>
                    <span className="text-[10px] font-mono font-semibold text-zinc-700 dark:text-zinc-300 truncate w-full">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Extra Options: Upload Custom Photo */}
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={onOpenUploadCropper}
                className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold border border-zinc-300 dark:border-white/15 bg-white dark:bg-white/5 hover:bg-zinc-100 dark:hover:bg-white/10 text-zinc-800 dark:text-white flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <ImageIcon className="w-3.5 h-3.5 text-cyan-500" />
                <span>Upload Custom Image</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Button & Confirmation */}
      <div className="flex items-center justify-between pt-5 mt-5 border-t border-zinc-200 dark:border-white/10">
        <div className="flex items-center gap-2">
          {saveSuccess && (
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 animate-in fade-in slide-in-from-left duration-200">
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              <span>Identity Updated & Broadcasted to All Apps!</span>
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <GlassButton
            variant="primary"
            size="sm"
            icon={isSaving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
            onClick={handleSaveProfile}
            disabled={isSaving}
          >
            {isSaving ? 'Updating...' : 'Save Creator Profile'}
          </GlassButton>
        </div>
      </div>
    </GlassCard>
  );
};

