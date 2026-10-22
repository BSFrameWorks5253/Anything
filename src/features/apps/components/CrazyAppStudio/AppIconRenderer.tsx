import React from 'react';
import type { CreativeApp } from '../../../../types/app.types';

interface AppIconRendererProps {
  app: Partial<CreativeApp>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AppIconRenderer: React.FC<AppIconRendererProps> = ({
  app,
  size = 'md',
  className = '',
}) => {
  const sizeMap = {
    sm: 'w-10 h-10 rounded-xl text-xs',
    md: 'w-14 h-14 rounded-2xl text-lg',
    lg: 'w-16 h-16 rounded-2xl text-2xl',
    xl: 'w-20 h-20 rounded-3xl text-3xl',
  }[size];

  const gradient = app.gradient || 'from-blue-600 via-sky-500 to-cyan-400';
  const textColor = app.textColor || '#38bdf8';
  const glowColor = app.glowColor || 'rgba(56, 189, 248, 0.4)';

  return (
    <div
      className={`relative p-[1px] bg-gradient-to-br ${gradient} shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300 ${sizeMap} ${className}`}
      style={{
        boxShadow: `0 12px 28px -6px ${glowColor}`,
      }}
    >
      <div className="w-full h-full rounded-[inherit] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center relative overflow-hidden border border-white/20">
        {/* Specular glass reflection */}
        <div className="specular-reflection opacity-80" />

        {app.iconType === 'image' && app.iconValue ? (
          <img
            src={app.iconValue}
            alt={app.name || 'App icon'}
            className="w-full h-full object-cover rounded-[inherit]"
          />
        ) : app.iconType === 'emoji' && app.iconValue ? (
          <span className="select-none filter drop-shadow-md">{app.iconValue}</span>
        ) : (
          <span
            className="font-black tracking-tight select-none"
            style={{ color: textColor }}
          >
            {app.shortName || (app.name ? app.name.slice(0, 2).toUpperCase() : 'Cc')}
          </span>
        )}
      </div>
    </div>
  );
};
