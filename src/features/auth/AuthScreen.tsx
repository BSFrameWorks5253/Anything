import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  Lock,
  UserCheck,
  CheckCircle2,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AnythingBrandEmblem } from '../../components/ui/AdobeSplashScreen';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';

interface AuthScreenProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ isModal = false, onClose }) => {
  const { loginAsArchitect, loginWithCredentials } = useAuth();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await loginWithCredentials(identifier, password);
      if (!res.success) {
        setError(res.error || 'Failed to authenticate');
      } else if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickArchitect = () => {
    loginAsArchitect();
    if (onClose) onClose();
  };

  return (
    <div
      className={`${
        isModal
          ? 'fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-md p-4'
          : 'min-h-screen w-full flex items-center justify-center p-4 bg-[#121214]'
      }`}
    >
      <div className="w-full max-w-md animate-fadeIn">
        <GlassCard
          variant="interactive"
          className="p-8 border-zinc-200 dark:border-white/10 relative overflow-hidden shadow-2xl bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-2xl"
        >
          {/* Ambient Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 rounded-full bg-red-600/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-20 -left-20 w-48 h-48 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none" />

          {/* Top Header */}
          <div className="flex flex-col items-center text-center mb-6">
            <AnythingBrandEmblem size={52} className="mb-3 hover:scale-105 transition-transform" />
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              Sign In to Anything
            </h2>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
              Unified workspace for desktop applications, hardware macro controls, and child releases.
            </p>
          </div>

          {/* Quick Architect Sign In Capsule */}
          <div className="p-4 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-indigo-500/10 mb-6 relative group">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Architect Fast Track
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">UID: 8369811201</span>
            </div>

            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-600 flex items-center justify-center font-black text-slate-950 text-sm shadow-md">
                BS
              </div>
              <div className="text-left">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                    Burhanuddin Sounasath
                  </h4>
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-500" />
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-mono">
                  +91 8369811201 · Lead Architect
                </p>
              </div>
            </div>

            <GlassButton
              variant="primary"
              size="sm"
              className="w-full justify-center text-xs font-semibold"
              icon={<ArrowRight className="w-3.5 h-3.5" />}
              onClick={handleQuickArchitect}
            >
              Sign In as Burhanuddin
            </GlassButton>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center my-5">
            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
            <span className="bg-white dark:bg-[#18181B] px-2 text-[10px] font-mono text-zinc-400 uppercase tracking-widest relative">
              Or Use Credentials
            </span>
          </div>

          {/* Manual Auth Form */}
          <form onSubmit={handleManualSubmit} className="space-y-3.5">
            {error && (
              <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-medium">
                {error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                Email or Phone Number
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="8369811201 or user@anything.io"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-medium"
                />
                <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                Password or Passkey
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-medium"
                />
                <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
              </div>
            </div>

            <GlassButton
              type="submit"
              variant="glass"
              size="sm"
              disabled={isLoading}
              className="w-full justify-center text-xs font-semibold mt-2"
              icon={<Key className="w-3.5 h-3.5 text-cyan-500" />}
            >
              {isLoading ? 'Verifying...' : 'Sign In with Passkey'}
            </GlassButton>
          </form>

          {/* Guest / Close */}
          {isModal && onClose && (
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline font-mono"
              >
                Cancel
              </button>
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
};
