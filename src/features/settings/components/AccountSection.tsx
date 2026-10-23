import React, { useState, useRef, useEffect } from 'react';
import {
  ShieldCheck,
  Sparkles,
  Key,
  Camera,
  Phone,
  Mail,
  UserCheck,
  RotateCcw,
  LogOut,
  LogIn,
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import { InstagramImageCropModal } from '../../../components/ui/InstagramImageCropModal';
import { useAuth } from '../../../context/AuthContext';
import { getProfileInitial } from '../../../utils/userInitials';

export const AccountSection: React.FC = () => {
  const { user, isAuthenticated, logout, openAuthModal, updateUser } = useAuth();
  const [avatar, setAvatar] = useState<string | null>(() => {
    return localStorage.getItem('anything_user_avatar') || user?.avatar || null;
  });

  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user?.avatar) {
      setAvatar(user.avatar);
    }
  }, [user?.avatar]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setTempImageSrc(reader.result);
          setCropperOpen(true);
        }
      };
      reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleCropComplete = (croppedDataUrl: string) => {
    setAvatar(croppedDataUrl);
    localStorage.setItem('anything_user_avatar', croppedDataUrl);
    if (updateUser) {
      updateUser({ avatar: croppedDataUrl });
    }
    window.dispatchEvent(new Event('storage'));
  };

  const handleResetAvatar = () => {
    setAvatar(null);
    localStorage.removeItem('anything_user_avatar');
    if (updateUser) {
      updateUser({ avatar: null });
    }
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold">
          Anything Account & Creator Identity
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Verified Creator
          </span>
        </div>
      </div>

      <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Iridescent Avatar with 3D Ring & Instagram Cropper Trigger */}
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-20 h-20 rounded-full p-[2px] bg-gradient-to-tr from-amber-400 via-rose-500 to-indigo-500 shadow-xl shadow-rose-500/20 group-hover:scale-105 transition-transform duration-300">
                <div className="w-full h-full rounded-full bg-slate-900/90 backdrop-blur-2xl overflow-hidden flex items-center justify-center font-extrabold text-3xl text-white border border-white/20 relative">
                  {avatar ? (
                    <img
                      src={avatar}
                      alt={user?.name || 'Profile'}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="bg-gradient-to-br from-white via-cyan-100 to-sky-300 bg-clip-text text-transparent">
                      {getProfileInitial(user)}
                    </span>
                  )}

                  {/* Instagram-style Camera overlay */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1 text-white">
                    <Camera className="w-5 h-5" />
                    <span className="text-[9px] font-bold tracking-tight">Edit PFP</span>
                  </div>
                </div>
              </div>

              <span
                className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-400 border-2 border-slate-950 shadow-[0_0_8px_#34d399] flex items-center justify-center"
                title="Active Now"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
              </span>

              {/* Hidden file input */}
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                  {user ? user.name : 'Signed Out'}
                </h4>
                {user ? (
                  <>
                    <ShieldCheck className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-cyan-500/15 text-cyan-700 dark:text-cyan-300 border border-cyan-500/30 font-bold">
                      {user.role}
                    </span>
                  </>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-amber-500/15 text-amber-600 border border-amber-500/30 font-bold">
                    Guest Mode
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-1.5 text-xs text-zinc-600 dark:text-white/70 font-medium">
                {user?.phone && (
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                    <span className="font-mono text-zinc-900 dark:text-white font-semibold">
                      {user.phone}
                    </span>
                    <span className="text-[11px] text-zinc-400 font-mono">(Direct)</span>
                  </div>
                )}

                <div className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-zinc-400" />
                  <span className="font-mono">{user ? user.email : 'No active session'}</span>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-2.5">
                <GlassBadge variant="cyan" dot>
                  {user ? 'Verified Account' : 'Offline'}
                </GlassBadge>
                {user?.uid && (
                  <span className="text-[11px] text-zinc-500 dark:text-white/40 hidden sm:inline font-mono font-medium">
                    UID: {user.uid}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
            {isAuthenticated ? (
              <>
                <GlassButton
                  variant="glass"
                  size="sm"
                  icon={<Camera className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
                  onClick={() => fileInputRef.current?.click()}
                >
                  Change Photo
                </GlassButton>

                {avatar && (
                  <GlassButton
                    variant="glass"
                    size="sm"
                    icon={<RotateCcw className="w-3.5 h-3.5 text-zinc-400" />}
                    onClick={handleResetAvatar}
                  >
                    Reset
                  </GlassButton>
                )}

                <GlassButton
                  variant="glass"
                  size="sm"
                  icon={<LogOut className="w-3.5 h-3.5 text-rose-500" />}
                  onClick={logout}
                >
                  Sign Out
                </GlassButton>
              </>
            ) : (
              <GlassButton
                variant="primary"
                size="sm"
                icon={<LogIn className="w-3.5 h-3.5" />}
                onClick={openAuthModal}
              >
                Sign In
              </GlassButton>
            )}
          </div>
        </div>
      </GlassCard>

      {/* Instagram Image Cropper Modal */}
      {cropperOpen && tempImageSrc && (
        <InstagramImageCropModal
          isOpen={cropperOpen}
          imageSrc={tempImageSrc}
          initialShape="circle"
          title="Adjust Profile Photo"
          onClose={() => {
            setCropperOpen(false);
            setTempImageSrc(null);
          }}
          onCropComplete={handleCropComplete}
        />
      )}
    </section>
  );
};
