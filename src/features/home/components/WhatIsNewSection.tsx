import React from 'react';
import { Sparkles, Wand2, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import { GlassCard } from '../../../components/ui/GlassCard';
import { useTheme } from '../../../context/ThemeContext';

export const WhatIsNewSection: React.FC = () => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const highlights = [
    {
      icon: <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />,
      badge: 'Tap Studio',
      title: 'Macro & Hardware Automation',
      desc: 'Low-latency system triggers, custom hotkeys, and automated updates linked with BSFrameWorks5253/TapDesk.',
    },
    {
      icon: <Sparkles className="w-4 h-4 text-amber-600 dark:text-amber-400" />,
      badge: 'Release Engine',
      title: 'Automated Child App Sync',
      desc: 'Drop any <AppName>_<version>.exe into releases/ to auto-catalog, stage setup installers, and archive versions.',
    },
    {
      icon: <RefreshCw className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      badge: 'Anything Core',
      title: 'Animated Email Dispatches & Rollback',
      desc: 'Automated release notes with fixes, improvements, and features delivered with one-click version rollback.',
    },
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3
            className={`text-xs font-semibold tracking-wide uppercase ${
              isLight ? 'text-zinc-600' : 'text-zinc-400'
            }`}
          >
            What's New in Anything Ecosystem
          </h3>
          <p
            className={`text-xs mt-0.5 ${
              isLight ? 'text-zinc-500' : 'text-zinc-500'
            }`}
          >
            Recent capabilities, child app updates, and enhancements across the suite
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {highlights.map((item, idx) => (
          <GlassCard
            key={idx}
            variant="static"
            className="p-4 flex flex-col justify-between transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-colors ${
                    isLight
                      ? 'bg-zinc-50 border-zinc-200'
                      : 'bg-zinc-800/80 border-zinc-700'
                  }`}
                >
                  {item.icon}
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                    isLight
                      ? 'bg-zinc-100 border-zinc-200 text-zinc-700'
                      : 'bg-zinc-800 border-zinc-700 text-zinc-300'
                  }`}
                >
                  {item.badge}
                </span>
              </div>

              <h4
                className={`text-xs font-semibold tracking-tight ${
                  isLight ? 'text-zinc-900' : 'text-zinc-100'
                }`}
              >
                {item.title}
              </h4>
              <p
                className={`text-xs mt-1 leading-relaxed ${
                  isLight ? 'text-zinc-500' : 'text-zinc-400'
                }`}
              >
                {item.desc}
              </p>
            </div>
          </GlassCard>
        ))}
      </div>
    </div>
  );
};
