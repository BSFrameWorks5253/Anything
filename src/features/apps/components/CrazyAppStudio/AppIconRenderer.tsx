import React, { useState, useEffect } from 'react';
import type { CreativeApp } from '../../../../types/app.types';
import {
  TAP_STUDIO_LOGO_BASE64,
  MEDIAFLOW_STUDIO_LOGO_BASE64,
  ONE_TAP_LOGO_BASE64,
} from '../../constants/appLogos';

export { TAP_STUDIO_LOGO_BASE64, MEDIAFLOW_STUDIO_LOGO_BASE64, ONE_TAP_LOGO_BASE64 };

interface AppIconRendererProps {
  app: Partial<CreativeApp>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

// Map well-known apps or categories to authentic Adobe CC Squircle color profiles
function getAdobePalette(app: Partial<CreativeApp>) {
  const id = (app.id || '').toLowerCase();
  const name = (app.name || '').toLowerCase();
  const category = (app.category || '').toLowerCase();

  if (id.includes('anything')) {
    return { bgStart: '#1E1E24', bgEnd: '#121216', text: '#FFFFFF', rim: 'rgba(255,255,255,0.4)', monogram: 'An' };
  }
  if (id.includes('mediaflow') || name.includes('mediaflow')) {
    return { bgStart: '#002B49', bgEnd: '#001424', text: '#31A8FF', rim: '#31A8FF', monogram: 'Mf' };
  }
  if (id.includes('one-tap') || id.includes('onetap') || name.includes('one tap')) {
    return { bgStart: '#360000', bgEnd: '#1A0000', text: '#FF416C', rim: '#FF416C', monogram: 'Ot' };
  }
  if (id.includes('tap-studio') || name.includes('tap studio')) {
    return { bgStart: '#2A1800', bgEnd: '#140B00', text: '#F59E0B', rim: '#F59E0B', monogram: 'Ts' };
  }
  if (id.includes('pdf') || id.includes('acro') || name.includes('acroflow')) {
    return { bgStart: '#3A0000', bgEnd: '#1F0000', text: '#FF3333', rim: '#FF3333', monogram: 'Ac' };
  }
  if (id.includes('docu') || name.includes('docuflow')) {
    return { bgStart: '#002B1D', bgEnd: '#00140E', text: '#2DD4BF', rim: '#2DD4BF', monogram: 'Df' };
  }
  if (id.includes('data-manage') || id.includes('datamanage') || name.includes('data manage') || id.includes('ain53')) {
    return { bgStart: '#002236', bgEnd: '#000A12', text: '#00E5FF', rim: '#00E5FF', monogram: 'Dm' };
  }

  // Categories
  if (category.includes('video') || category.includes('media')) {
    return { bgStart: '#140033', bgEnd: '#09001A', text: '#9999FF', rim: '#9999FF', monogram: app.shortName || name.slice(0, 2).toUpperCase() || 'Vd' };
  }
  if (category.includes('design') || category.includes('creative')) {
    return { bgStart: '#331B00', bgEnd: '#1A0D00', text: '#FF9A00', rim: '#FF9A00', monogram: app.shortName || name.slice(0, 2).toUpperCase() || 'Ds' };
  }
  if (category.includes('code') || category.includes('developer')) {
    return { bgStart: '#002B33', bgEnd: '#00141A', text: '#00E5FF', rim: '#00E5FF', monogram: app.shortName || name.slice(0, 2).toUpperCase() || 'Dv' };
  }

  // Default spectrum slate
  return {
    bgStart: '#1F2026',
    bgEnd: '#121317',
    text: app.textColor || '#38BDF8',
    rim: 'rgba(255,255,255,0.25)',
    monogram: app.shortName || (name ? name.slice(0, 2).toUpperCase() : 'Ap'),
  };
}

export const AppIconRenderer: React.FC<AppIconRendererProps> = ({
  app,
  size = 'md',
  className = '',
}) => {
  const pixelSizeMap = { sm: 40, md: 54, lg: 64, xl: 80 }[size];
  const fontSizeMap = { sm: 20, md: 27, lg: 32, xl: 40 }[size];

  const isTapStudio =
    app.id === 'tap-studio' ||
    app.id === 'app-tap-studio' ||
    Boolean(app.name && app.name.toLowerCase().includes('tap studio'));

  const isMediaFlowStudio =
    app.id === 'mediaflow-studio' ||
    app.id === 'app-mediaflow-studio' ||
    Boolean(app.name && app.name.toLowerCase().includes('mediaflow'));

  const isOneTap =
    app.id === 'one-tap' ||
    app.id === 'onetap-workstation' ||
    app.id === 'app-one-tap' ||
    Boolean(app.name && app.name.toLowerCase().includes('one tap'));

  const rawIconValue = app.iconValue;

  const getInitialImageSrc = (): string | null => {
    if (isTapStudio) return TAP_STUDIO_LOGO_BASE64;
    if (isMediaFlowStudio) return MEDIAFLOW_STUDIO_LOGO_BASE64;
    if (isOneTap) return ONE_TAP_LOGO_BASE64;
    if (app.id?.includes('anything') || app.name?.toLowerCase().includes('anything')) return '/app-logo.png';

    if (typeof rawIconValue === 'string') {
      if (rawIconValue.startsWith('data:image/')) return rawIconValue;
      if (rawIconValue.startsWith('http://') || rawIconValue.startsWith('https://')) return rawIconValue;
      if (rawIconValue.startsWith('/')) return rawIconValue;

      if (rawIconValue.includes('tap-studio') || rawIconValue.includes('tapstudio')) {
        return TAP_STUDIO_LOGO_BASE64;
      }
      if (rawIconValue.includes('mediaflow')) {
        return MEDIAFLOW_STUDIO_LOGO_BASE64;
      }
      if (rawIconValue.includes('one-tap') || rawIconValue.includes('onetap')) {
        return ONE_TAP_LOGO_BASE64;
      }

      if (/\.(png|svg|jpg|jpeg|webp)$/i.test(rawIconValue)) {
        return `/${rawIconValue.replace(/^(\.\/)+/, '')}`;
      }
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
    setImgFailed(true);
  };

  const palette = getAdobePalette(app);
  const gradId = `adobe-grad-${(app.id || 'default').replace(/[^a-z0-9]/gi, '-')}-${size}`;

  return (
    <div
      className={`relative select-none shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
      style={{
        width: pixelSizeMap,
        height: pixelSizeMap,
        filter: 'drop-shadow(0 6px 16px rgba(0,0,0,0.45))',
      }}
    >
      {imgSrc && !imgFailed ? (
        /* ── Image Logo with Adobe CC Squircle Framing ── */
        <div
          className="w-full h-full rounded-[22%] overflow-hidden bg-[#18181B] border border-white/20 shadow-inner flex items-center justify-center relative"
          style={{
            boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.5)',
          }}
        >
          <img
            src={imgSrc}
            alt={app.name || ''}
            onError={handleImageError}
            className="w-full h-full object-cover"
          />
          {/* Top highlight sheen */}
          <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/15 to-transparent pointer-events-none" />
        </div>
      ) : (
        /* ── Authentic Adobe Spectrum Vector Squircle Monogram Tile ── */
        <svg
          viewBox="0 0 100 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor={palette.bgStart} />
              <stop offset="100%" stopColor={palette.bgEnd} />
            </linearGradient>
          </defs>

          {/* Squircle Base Tile */}
          <rect width="100" height="100" rx="22" fill={`url(#${gradId})`} />

          {/* Specular Edge Rim */}
          <rect
            x="1.5"
            y="1.5"
            width="97"
            height="97"
            rx="20.5"
            stroke={palette.rim}
            strokeWidth="1.8"
            strokeOpacity="0.45"
          />

          {/* Subtle Top Glass Sheen */}
          <path
            d="M 2 22 C 2 11 11 2 22 2 L 78 2 C 89 2 98 11 98 22 L 98 46 L 2 46 Z"
            fill="rgba(255,255,255,0.06)"
          />

          {/* Adobe CC Bold 2-Letter Monogram Typography */}
          <text
            x="50"
            y="67"
            textAnchor="middle"
            fill={palette.text}
            style={{
              fontFamily:
                "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Outfit', 'Helvetica Neue', Arial, sans-serif",
              fontWeight: 800,
              fontSize: '48px',
              letterSpacing: '-1.5px',
            }}
          >
            {palette.monogram}
          </text>
        </svg>
      )}
    </div>
  );
};
