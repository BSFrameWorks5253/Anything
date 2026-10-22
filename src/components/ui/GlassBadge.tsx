import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface GlassBadgeProps {
  children: React.ReactNode;
  variant?: 'cyan' | 'violet' | 'amber' | 'emerald' | 'rose' | 'neutral';
  className?: string;
  dot?: boolean;
}

export const GlassBadge: React.FC<GlassBadgeProps> = ({
  children,
  variant = 'neutral',
  className = '',
  dot = false,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const colorMap = {
    cyan: isLight
      ? 'bg-sky-500/15 text-sky-800 border-sky-400/40 font-semibold'
      : 'bg-cyan-500/15 text-cyan-300 border-cyan-400/30',
    violet: isLight
      ? 'bg-purple-500/15 text-purple-800 border-purple-400/40 font-semibold'
      : 'bg-purple-500/15 text-purple-300 border-purple-400/30',
    amber: isLight
      ? 'bg-amber-500/15 text-amber-900 border-amber-400/40 font-semibold'
      : 'bg-amber-500/15 text-amber-300 border-amber-400/30',
    emerald: isLight
      ? 'bg-emerald-500/15 text-emerald-800 border-emerald-400/40 font-semibold'
      : 'bg-emerald-500/15 text-emerald-300 border-emerald-400/30',
    rose: isLight
      ? 'bg-rose-500/15 text-rose-800 border-rose-400/40 font-semibold'
      : 'bg-rose-500/15 text-rose-300 border-rose-400/30',
    neutral: isLight
      ? 'bg-slate-200/80 text-slate-800 border-slate-300 font-medium'
      : 'bg-white/10 text-white/80 border-white/15',
  }[variant];

  const dotColor = {
    cyan: isLight ? 'bg-sky-600 shadow-sky-600/60' : 'bg-cyan-400 shadow-cyan-400/80',
    violet: isLight ? 'bg-purple-600 shadow-purple-600/60' : 'bg-purple-400 shadow-purple-400/80',
    amber: isLight ? 'bg-amber-600 shadow-amber-600/60' : 'bg-amber-400 shadow-amber-400/80',
    emerald: isLight ? 'bg-emerald-600 shadow-emerald-600/60' : 'bg-emerald-400 shadow-emerald-400/80',
    rose: isLight ? 'bg-rose-600 shadow-rose-600/60' : 'bg-rose-400 shadow-rose-400/80',
    neutral: isLight ? 'bg-slate-600 shadow-slate-600/60' : 'bg-white/60 shadow-white/80',
  }[variant];

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] tracking-wide backdrop-blur-md border ${colorMap} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_6px] ${dotColor}`} />
      )}
      {children}
    </span>
  );
};
