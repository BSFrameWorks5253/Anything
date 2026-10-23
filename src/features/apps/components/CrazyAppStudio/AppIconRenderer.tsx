import React, { useState, useEffect } from 'react';
import { ImagePlus } from 'lucide-react';
import type { CreativeApp } from '../../../../types/app.types';
import {
  TAP_STUDIO_LOGO_BASE64,
  MEDIAFLOW_STUDIO_LOGO_BASE64,
} from '../../constants/appLogos';

export { TAP_STUDIO_LOGO_BASE64, MEDIAFLOW_STUDIO_LOGO_BASE64 };

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

  const pixelSizeMap = { sm: 40, md: 56, lg: 64, xl: 80 }[size];

  const gradient = app.gradient || 'from-blue-600 via-sky-500 to-cyan-400';
  const textColor = app.textColor || '#38bdf8';
  const glowColor = app.glowColor || 'rgba(56, 189, 248, 0.4)';

  // ── Known official apps always get their authentic logo ────────────────────────
  const isTapStudio =
    app.id === 'tap-studio' ||
    app.id === 'app-tap-studio' ||
    Boolean(app.name && app.name.toLowerCase().includes('tap studio'));

  const isMediaFlowStudio =
    app.id === 'mediaflow-studio' ||
    app.id === 'app-mediaflow-studio' ||
    Boolean(app.name && app.name.toLowerCase().includes('mediaflow'));

  const rawIconValue = app.iconValue;

  const getInitialImageSrc = (): string | null => {
    if (isTapStudio) return TAP_STUDIO_LOGO_BASE64;
    if (isMediaFlowStudio) return MEDIAFLOW_STUDIO_LOGO_BASE64;

    if (typeof rawIconValue === 'string') {
      // Embedded data URI or remote URL → use directly
      if (rawIconValue.startsWith('data:image/')) return rawIconValue;
      if (rawIconValue.startsWith('http://') || rawIconValue.startsWith('https://')) return rawIconValue;
      if (rawIconValue.startsWith('/')) return rawIconValue;

      // Guard against accidental routing of tap/mediaflow icon references
      if (rawIconValue.includes('tap-studio') || rawIconValue.includes('tapstudio')) {
        return TAP_STUDIO_LOGO_BASE64;
      }
      if (rawIconValue.includes('mediaflow')) {
        return MEDIAFLOW_STUDIO_LOGO_BASE64;
      }

      // Relative path (e.g. "icon.png")
      if (/\.(png|svg|jpg|jpeg|webp)$/i.test(rawIconValue)) {
        return `/${rawIconValue.replace(/^(\.\/)+/, '')}`;
      }
    }

    // iconType image/svg but no usable URI → null (shows fallback)
    if (app.iconType === 'image' || app.iconType === 'svg') return null;

    return null;
  };

  const [imgSrc, setImgSrc] = useState<string | null>(getInitialImageSrc);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgSrc(getInitialImageSrc());
    setImgFailed(false);
  }, [app.iconValue, app.iconType, app.id, app.name]);

  const handleImageError = () => {
    if (isTapStudio && imgSrc !== TAP_STUDIO_LOGO_BASE64) {
      setImgSrc(TAP_STUDIO_LOGO_BASE64);
      setImgFailed(false);
    } else if (isMediaFlowStudio && imgSrc !== MEDIAFLOW_STUDIO_LOGO_BASE64) {
      setImgSrc(MEDIAFLOW_STUDIO_LOGO_BASE64);
      setImgFailed(false);
    } else {
      setImgFailed(true);
    }
  };

  // Determine if we have a real icon from EXE/PNG/SVG or the creator hasn't added one yet
  const hasRealIcon =
    (app as any).hasRealIcon === true ||
    isTapStudio ||
    isMediaFlowStudio ||
    (typeof rawIconValue === 'string' && rawIconValue.startsWith('data:image/')) ||
    (typeof rawIconValue === 'string' && (rawIconValue.startsWith('http') || rawIconValue.startsWith('/')));

  const showAddIconHint = !hasRealIcon && !imgSrc && (app as any).addedByCreator;

  return (
    <div
      className={`relative p-[1px] bg-gradient-to-br ${gradient} shrink-0 shadow-lg group-hover:scale-105 transition-transform duration-300 ${sizeMap} ${className}`}
      style={{ boxShadow: `0 12px 28px -6px ${glowColor}` }}
    >
      <div className="w-full h-full rounded-[inherit] bg-slate-950/85 backdrop-blur-2xl flex items-center justify-center relative overflow-hidden border border-white/20">
        {/* Specular glass reflection */}
        <div className="specular-reflection opacity-80" />

        {imgSrc && !imgFailed ? (
          /* ── Real icon: EXE-extracted, PNG, SVG, or Data URI ── */
          <img
            src={imgSrc}
            alt={app.name || ''}
            onError={handleImageError}
            className={`w-full h-full rounded-[inherit] ${
              isTapStudio ? 'object-contain p-1' : 'object-cover'
            }`}
          />
        ) : isTapStudio ? (
          <img
            src={TAP_STUDIO_LOGO_BASE64}
            alt="Tap Studio"
            className="w-full h-full object-contain p-1 rounded-[inherit]"
          />
        ) : isMediaFlowStudio ? (
          <img
            src={MEDIAFLOW_STUDIO_LOGO_BASE64}
            alt="MediaFlow Studio"
            className="w-full h-full object-cover rounded-[inherit]"
          />
        ) : showAddIconHint ? (
          /* ── No icon found: prompt creator to add one ── */
          <div className="flex flex-col items-center justify-center gap-0.5 text-center px-1">
            <ImagePlus
              className="text-white/40"
              style={{ width: pixelSizeMap * 0.35, height: pixelSizeMap * 0.35 }}
            />
            {pixelSizeMap >= 56 && (
              <span
                className="font-semibold text-white/30 leading-none select-none"
                style={{ fontSize: Math.max(7, pixelSizeMap * 0.135) }}
              >
                Add Icon
              </span>
            )}
          </div>
        ) : app.iconType === 'emoji' && app.iconValue ? (
          /* ── Emoji icon ── */
          <span className="select-none filter drop-shadow-md">{app.iconValue}</span>
        ) : (
          /* ── Monogram fallback ── */
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
