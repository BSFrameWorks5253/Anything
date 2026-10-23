import React, { useState } from 'react';
import {
  Mail,
  ShieldCheck,
  Bell,
  Sparkles,
  Send,
  Eye,
  Check,
  Key,
  Smartphone,
  Lock,
} from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { GlassButton } from '../../../components/ui/GlassButton';
import { GlassBadge } from '../../../components/ui/GlassBadge';
import { AnimatedReleaseEmailModal } from '../../../components/ui/AnimatedReleaseEmailModal';
import type { CatalogApp } from '../../../types/app.types';

export const AuthEmailNotificationSection: React.FC = () => {
  const [emailAlertsEnabled, setEmailAlertsEnabled] = useState(true);
  const [childAppsAlerts, setChildAppsAlerts] = useState(true);
  const [recipientEmail, setRecipientEmail] = useState('burhanuddin@anything.io');
  const [previewEmailOpen, setPreviewEmailOpen] = useState(false);
  const [testSent, setTestSent] = useState(false);

  const sampleApp: CatalogApp = {
    id: 'sample-app',
    name: 'Anything Pro Suite',
    shortName: 'AP',
    category: 'Development',
    description: 'Master Creative & Developer Launcher',
    version: '1.2.0',
    size: '48.5 MB',
    executableName: 'Anything_1.2.0.exe',
    gradient: 'from-blue-600 via-sky-500 to-cyan-400',
    textColor: '#38bdf8',
    glowColor: 'rgba(56, 189, 248, 0.45)',
    status: 'installed',
  };

  const sampleRelease = {
    version: '1.2.0',
    executableName: 'Anything_1.2.0.exe',
    releaseDate: 'Today',
    releaseType: 'minor' as const,
    tagline: 'Spring Speedup & Child App Release Pipeline',
    summary:
      'This major update introduces the automated Child App Release Collector, Instagram-style photo cropping, Start Menu NSIS packaging, and instant Animated Release Emails.',
    newFeatures: [
      'Automated Child Apps Release Collector with background directory watcher',
      'Instagram-style PFP & media crop modal with 90° rotation and fit controls',
      'Professional NSIS executable build setup creating Start Menu folder and desktop icons',
    ],
    improvements: [
      'Instantaneous app startup and reduced loader transition lag',
      'Optimized memory usage when previewing large artwork presets',
      'Smoother liquid glass animations across high-refresh-rate monitors',
    ],
    fixes: [
      'Fixed child app path resolution when launching portable executables',
      'Resolved occasional light/dark theme flash on application startup',
      'Fixed taskbar window icon resolution on Windows 11',
    ],
  };

  const handleTestDispatch = () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <h3 className="text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold">
            Authentication & Animated Email Notifications
          </h3>
          <GlassBadge variant="cyan" dot>
            Real-Time Dispatch
          </GlassBadge>
        </div>
        <span className="text-[11px] text-zinc-500 dark:text-white/40 font-mono">
          Auth: Passkey Active
        </span>
      </div>

      <GlassCard variant="interactive" className="p-6 border-zinc-200 dark:border-white/10 space-y-6">
        {/* Auth Credentials Overview */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-5 border-b border-zinc-200 dark:border-white/[0.08]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-500 via-sky-400 to-indigo-600 flex items-center justify-center text-slate-950 shadow-lg shadow-cyan-500/20">
              <Mail className="w-6 h-6 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-zinc-900 dark:text-white tracking-tight">
                  Release Email Dispatch Service
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 font-bold">
                  Verified Delivery
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-white/60 mt-0.5">
                Whenever Anything or any child app releases an update, subscribers automatically receive a beautifully animated email detailing what's new, what got improved, and what bugs were fixed.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <GlassButton
              variant="glass"
              size="sm"
              icon={<Eye className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />}
              onClick={() => setPreviewEmailOpen(true)}
            >
              Preview Email
            </GlassButton>

            <GlassButton
              variant="primary"
              size="sm"
              icon={testSent ? <Check className="w-3.5 h-3.5" /> : <Send className="w-3.5 h-3.5" />}
              onClick={handleTestDispatch}
            >
              {testSent ? 'Sent to Inbox!' : 'Send Test Alert'}
            </GlassButton>
          </div>
        </div>

        {/* Dispatch Controls & Recipient Form */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold mb-1.5">
                Target Email Address for Updates
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={recipientEmail}
                  onChange={(e) => setRecipientEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full px-3 py-2 text-xs rounded-xl bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/10 text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:border-cyan-500 font-mono font-medium"
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 text-xs text-zinc-600 dark:text-white/70 space-y-1">
              <div className="flex items-center justify-between font-mono">
                <span>Authenticated Creator:</span>
                <span className="font-bold text-zinc-900 dark:text-white">Burhanuddin Sounasath</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span>Registered Phone:</span>
                <span className="font-bold text-zinc-900 dark:text-white">8369811201</span>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span>Security Method:</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">FIDO2 Passkey / Token</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="block text-xs font-mono uppercase tracking-wider text-zinc-600 dark:text-white/60 font-semibold mb-1">
              Notification Preferences
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 cursor-pointer hover:border-zinc-300 dark:hover:border-white/20 transition-all">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                  Email Me on Anything Updates
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-white/50 block">
                  Dispatches when core Anything desktop app receives a new release
                </span>
              </div>
              <input
                type="checkbox"
                checked={emailAlertsEnabled}
                onChange={(e) => setEmailAlertsEnabled(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-zinc-100 dark:bg-white/[0.03] border border-zinc-200 dark:border-white/10 cursor-pointer hover:border-zinc-300 dark:hover:border-white/20 transition-all">
              <div className="space-y-0.5">
                <span className="text-xs font-bold text-zinc-900 dark:text-white block">
                  Email Me on Child Apps Updates
                </span>
                <span className="text-[11px] text-zinc-500 dark:text-white/50 block">
                  Dispatches formatted release notes when any child app is added or bumped
                </span>
              </div>
              <input
                type="checkbox"
                checked={childAppsAlerts}
                onChange={(e) => setChildAppsAlerts(e.target.checked)}
                className="w-4 h-4 rounded text-cyan-500 accent-cyan-500 cursor-pointer"
              />
            </label>
          </div>
        </div>
      </GlassCard>

      {/* Animated Email Modal Preview */}
      <AnimatedReleaseEmailModal
        isOpen={previewEmailOpen}
        onClose={() => setPreviewEmailOpen(false)}
        app={sampleApp}
        release={sampleRelease}
        userEmail={recipientEmail}
      />
    </section>
  );
};
