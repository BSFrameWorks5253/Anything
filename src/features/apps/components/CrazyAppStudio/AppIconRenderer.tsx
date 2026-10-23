import React, { useState, useEffect } from 'react';
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

  const isTapStudio =
    app.id === 'tap-studio' ||
    app.id === 'app-tap-studio' ||
    Boolean(app.name && app.name.toLowerCase().includes('tap studio'));

  const rawIconValue = app.iconValue;

  const getInitialImageSrc = () => {
    if (typeof rawIconValue === 'string') {
      if (rawIconValue.startsWith('data:image/')) return rawIconValue;
      if (rawIconValue.startsWith('http://') || rawIconValue.startsWith('https://')) return rawIconValue;
      if (rawIconValue.startsWith('/')) return rawIconValue;
      if (rawIconValue === 'app-logo.png' || rawIconValue.endsWith('app-logo.png')) {
        return '/tap-studio-logo.png';
      }
      if (/\.(png|svg|jpg|jpeg|webp)$/i.test(rawIconValue)) {
        return `/${rawIconValue.replace(/^(\.\/)+/, '')}`;
      }
    }
    if (app.iconType === 'image') {
      return isTapStudio ? '/tap-studio-logo.png' : null;
    }
    if (isTapStudio) {
      return '/tap-studio-logo.png';
    }
    return null;
  };

  const [imgSrc, setImgSrc] = useState<string | null>(getInitialImageSrc);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgSrc(getInitialImageSrc());
    setImgFailed(false);
  }, [app.iconValue, app.iconType, app.id, app.name]);

  const handleImageError = () => {
    if (isTapStudio && imgSrc !== '/tap-studio-logo.png') {
      setImgSrc('/tap-studio-logo.png');
    } else {
      setImgFailed(true);
    }
  };

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

        {imgSrc && !imgFailed ? (
          <img
            src={imgSrc}
            alt=""
            onError={handleImageError}
            className="w-full h-full object-cover rounded-[inherit]"
          />
        ) : isTapStudio ? (
          <div className="w-full h-full p-2.5 flex items-center justify-center bg-gradient-to-br from-cyan-500/20 via-teal-500/10 to-transparent">
            <svg viewBox="0 0 100 100" className="w-full h-full text-cyan-400 drop-shadow-md" fill="none">
              <rect x="6" y="6" width="88" height="88" rx="22" stroke="currentColor" strokeWidth="5" opacity="0.85" />
              <circle cx="50" cy="50" r="26" stroke="currentColor" strokeWidth="5" />
              <circle cx="50" cy="50" r="14" fill="currentColor" />
              <path d="M50 14 L50 24 M50 76 L50 86 M14 50 L24 50 M76 50 L86 50" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
            </svg>
          </div>
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
