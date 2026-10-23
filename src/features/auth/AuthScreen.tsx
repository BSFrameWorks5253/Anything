import React, { useState } from 'react';
import {
  ShieldCheck,
  Key,
  Mail,
  Phone,
  ArrowRight,
  Sparkles,
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Globe,
  GitBranch,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { AnythingBrandEmblem } from '../../components/ui/AdobeSplashScreen';
import { GlassCard } from '../../components/ui/GlassCard';
import { GlassButton } from '../../components/ui/GlassButton';
import { getProfileInitial, getInitialGradient } from '../../utils/userInitials';

interface AuthScreenProps {
  isModal?: boolean;
  onClose?: () => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ isModal = false, onClose }) => {
  const { loginAsArchitect, loginWithCredentials, signUp, loginWithSocial } = useAuth();
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Sign In form state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up form state
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');

  // UI state
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);

  // Dynamic live initial calculation from email or identifier!
  const activeInputEmail = mode === 'signin' ? identifier : signupEmail;
  const liveInitial = getProfileInitial({ email: activeInputEmail, name: signupName });
  const liveGradient = getInitialGradient(liveInitial);

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const res = await loginWithCredentials(identifier, password, rememberMe);
      if (!res.success) {
        setError(res.error || 'Invalid credentials.');
      } else if (onClose) {
        onClose();
      }
    } catch (err: any) {
      setError(err?.message || 'Authentication error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (signupPassword !== signupConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await signUp(signupName, signupEmail, signupPassword, signupPhone, rememberMe);
      if (!res.success) {
        setError(res.error || 'Failed to create account.');
      } else {
        setSuccessMsg('Account created successfully! Welcome to Anything.');
        setTimeout(() => {
          if (onClose) onClose();
        }, 600);
      }
    } catch (err: any) {
      setError(err?.message || 'Signup error.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setError(null);
    try {
      await loginWithSocial(provider);
      if (onClose) onClose();
    } catch (err: any) {
      setError(`Failed to sign in with ${provider}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickArchitect = () => {
    loginAsArchitect();
    if (onClose) onClose();
  };

  const handleSendResetLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetEmail.includes('@')) {
      setError('Please enter a valid email for password recovery.');
      return;
    }
    setResetSuccess(true);
    setTimeout(() => {
      setShowForgotModal(false);
      setResetSuccess(false);
      setSuccessMsg(`Password reset instructions sent to ${resetEmail}`);
    }, 1800);
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
          className="p-6 sm:p-8 border-zinc-200 dark:border-white/10 relative overflow-hidden shadow-2xl bg-white/95 dark:bg-[#18181B]/95 backdrop-blur-2xl"
        >
          {/* Ambient Lighting Glows */}
          <div className="absolute -top-24 -right-24 w-56 h-56 rounded-full bg-cyan-600/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-56 h-56 rounded-full bg-indigo-600/15 blur-3xl pointer-events-none" />

          {/* Top Branding & Live Avatar */}
          <div className="flex flex-col items-center text-center mb-5">
            <div className="relative mb-3">
              <AnythingBrandEmblem size={48} className="hover:scale-105 transition-transform" />
              {activeInputEmail && (
                <div
                  className={`absolute -bottom-1.5 -right-2 w-7 h-7 rounded-full bg-gradient-to-tr ${liveGradient} flex items-center justify-center text-white font-black text-xs shadow-lg border-2 border-white dark:border-zinc-900 animate-in zoom-in-75`}
                  title={`Email initial: ${liveInitial}`}
                >
                  {liveInitial}
                </div>
              )}
            </div>

            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
              {mode === 'signin' ? 'Sign In to Anything' : 'Create Workspace Account'}
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
              Professional identity & synchronization for child desktop apps, macro loaders, and releases.
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-white/[0.06] rounded-xl mb-5 text-xs font-semibold">
            <button
              type="button"
              onClick={() => {
                setMode('signin');
                setError(null);
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === 'signin'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-1.5 rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs font-bold'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Status Banners */}
          {error && (
            <div className="p-3 mb-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 mb-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {mode === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-3.5">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold">
                    Email or Phone
                  </label>
                  {identifier.includes('@') && (
                    <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                      Profile Letter: [{liveInitial}]
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="zeninfosys@gmail.com or 8369811201"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-medium transition-colors"
                  />
                  <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(true)}
                    className="text-[11px] text-cyan-600 dark:text-cyan-400 hover:underline font-mono"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-9 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-medium transition-colors"
                  />
                  <Lock className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-200"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-600 dark:text-zinc-400">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-zinc-300 text-cyan-600 focus:ring-cyan-500"
                  />
                  <span>Stay signed in on this device</span>
                </label>
              </div>

              <GlassButton
                type="submit"
                variant="primary"
                size="sm"
                disabled={isLoading}
                className="w-full justify-center text-xs font-bold py-2 mt-2 shadow-lg"
                icon={<Key className="w-3.5 h-3.5" />}
              >
                {isLoading ? 'Authenticating...' : 'Sign In with Password'}
              </GlassButton>
            </form>
          )}

          {/* SIGN UP FORM */}
          {mode === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                    placeholder="Zen Infosys or John Doe"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-medium"
                  />
                  <User className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold">
                    Email Address
                  </label>
                  {signupEmail.includes('@') && (
                    <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-400 font-bold">
                      Avatar Initial: [{liveInitial}]
                    </span>
                  )}
                </div>
                <div className="relative">
                  <input
                    type="email"
                    required
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="zeninfosys@gmail.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-medium"
                  />
                  <Mail className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                  Phone (Optional)
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={signupPhone}
                    onChange={(e) => setSignupPhone(e.target.value)}
                    placeholder="+91 8369811201"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-medium"
                  />
                  <Phone className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-mono uppercase text-zinc-500 dark:text-zinc-400 font-semibold mb-1">
                    Confirm
                  </label>
                  <input
                    type="password"
                    required
                    value={signupConfirmPassword}
                    onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-medium"
                  />
                </div>
              </div>

              <GlassButton
                type="submit"
                variant="primary"
                size="sm"
                disabled={isLoading}
                className="w-full justify-center text-xs font-bold py-2 mt-3 shadow-lg"
                icon={<ArrowRight className="w-3.5 h-3.5" />}
              >
                {isLoading ? 'Creating Account...' : 'Register Workspace Profile'}
              </GlassButton>
            </form>
          )}

          {/* Social OAuth Single-Click Buttons */}
          <div className="relative flex items-center justify-center my-4">
            <div className="border-t border-zinc-200 dark:border-zinc-800 w-full" />
            <span className="bg-white dark:bg-[#18181B] px-2 text-[10px] font-mono text-zinc-400 uppercase tracking-widest relative">
              Or Fast Connect
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 mb-4">
            <button
              type="button"
              onClick={() => handleSocialLogin('google')}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 hover:bg-zinc-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <span className="font-bold text-red-500">G</span>
              <span>Google</span>
            </button>

            <button
              type="button"
              onClick={() => handleSocialLogin('github')}
              className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-zinc-200 dark:border-white/10 bg-zinc-50 hover:bg-zinc-100 dark:bg-white/[0.04] dark:hover:bg-white/[0.08] text-xs font-medium text-zinc-800 dark:text-zinc-200 transition-colors"
            >
              <GitBranch className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
              <span>GitHub</span>
            </button>
          </div>

          {/* Quick Architect Sign In Capsule */}
          <div className="p-3.5 rounded-xl border border-cyan-500/30 bg-gradient-to-r from-cyan-500/10 via-sky-500/5 to-indigo-500/10 relative group">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-600 dark:text-cyan-400 font-bold flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Architect Fast Track
              </span>
              <span className="text-[10px] text-zinc-400 font-mono">UID: 8369811201</span>
            </div>

            <div className="flex items-center gap-2.5 mb-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-600 flex items-center justify-center font-black text-slate-950 text-xs shadow-md">
                BS
              </div>
              <div className="text-left leading-tight">
                <div className="flex items-center gap-1">
                  <h4 className="text-xs font-bold text-zinc-900 dark:text-white">
                    Burhanuddin Sounasath
                  </h4>
                  <ShieldCheck className="w-3 h-3 text-cyan-500" />
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono">
                  +91 8369811201 · Lead Architect
                </p>
              </div>
            </div>

            <GlassButton
              variant="glass"
              size="sm"
              className="w-full justify-center text-xs font-semibold py-1.5 hover:border-cyan-500/50"
              icon={<ArrowRight className="w-3 h-3 text-cyan-500" />}
              onClick={handleQuickArchitect}
            >
              Sign In as Burhanuddin
            </GlassButton>
          </div>

          {/* Close/Cancel Modal button */}
          {isModal && onClose && (
            <div className="mt-3 text-center">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-zinc-400 hover:text-zinc-200 underline font-mono"
              >
                Continue as Guest / Dismiss
              </button>
            </div>
          )}
        </GlassCard>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-sm">
            <GlassCard className="p-6 border-zinc-200 dark:border-white/10 bg-white dark:bg-[#18181B] shadow-2xl">
              <h3 className="text-sm font-bold text-zinc-900 dark:text-white mb-1">
                Reset Account Password
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-4">
                Enter your registered email address to receive an automated verification PIN.
              </p>

              {resetSuccess ? (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verification link sent! Check your inbox.</span>
                </div>
              ) : (
                <form onSubmit={handleSendResetLink} className="space-y-3">
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="user@anything.io"
                    className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500"
                  />
                  <div className="flex items-center gap-2">
                    <GlassButton
                      type="submit"
                      variant="primary"
                      size="sm"
                      className="flex-1 justify-center text-xs font-semibold"
                    >
                      Send Reset Instructions
                    </GlassButton>
                    <GlassButton
                      type="button"
                      variant="glass"
                      size="sm"
                      onClick={() => setShowForgotModal(false)}
                      className="text-xs"
                    >
                      Cancel
                    </GlassButton>
                  </div>
                </form>
              )}
            </GlassCard>
          </div>
        </div>
      )}
    </div>
  );
};
