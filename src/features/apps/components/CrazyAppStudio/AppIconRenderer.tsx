import React, { useState, useEffect } from 'react';
import type { CreativeApp } from '../../../../types/app.types';
import {
  TAP_STUDIO_LOGO_BASE64,
  MEDIAFLOW_STUDIO_LOGO_BASE64,
  ONE_TAP_LOGO_BASE64,
  DOCUFLOW_STUDIO_LOGO_BASE64,
  VECTORFORGE_STUDIO_LOGO_BASE64,
  PIXELCHARM_LOGO_BASE64,
  ANYTHING_OFFICE_LOGO_BASE64,
  ANYTHING_DATA_MANAGE_LOGO_BASE64,
  ANYTHING_FILE_MANAGER_LOGO_BASE64,
} from '../../constants/appLogos';

export {
  TAP_STUDIO_LOGO_BASE64,
  MEDIAFLOW_STUDIO_LOGO_BASE64,
  ONE_TAP_LOGO_BASE64,
  DOCUFLOW_STUDIO_LOGO_BASE64,
  VECTORFORGE_STUDIO_LOGO_BASE64,
  PIXELCHARM_LOGO_BASE64,
  ANYTHING_OFFICE_LOGO_BASE64,
  ANYTHING_DATA_MANAGE_LOGO_BASE64,
  ANYTHING_FILE_MANAGER_LOGO_BASE64,
};

interface AppIconRendererProps {
  app: Partial<CreativeApp>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

/**
 * Resolves the authentic application icon from child app assets.
 */
export function getChildAppIcon(app: Partial<CreativeApp>): string | null {
  const id = (app.id || '').toLowerCase();
  const name = (app.name || '').toLowerCase();

  if (id.includes('mediaflow') || name.includes('mediaflow')) {
    return MEDIAFLOW_STUDIO_LOGO_BASE64;
  }
  if (id.includes('one-tap') || id.includes('onetap') || name.includes('one tap')) {
    return ONE_TAP_LOGO_BASE64;
  }
  if (
    id.includes('vectorforge') ||
    name.includes('vectorforge') ||
    id.includes('docuflow') ||
    name.includes('docuflow')
  ) {
    return DOCUFLOW_STUDIO_LOGO_BASE64;
  }
  if (id.includes('pixelcharm') || name.includes('pixelcharm')) {
    return PIXELCHARM_LOGO_BASE64;
  }
  if (id.includes('office') || name.includes('office')) {
    return ANYTHING_OFFICE_LOGO_BASE64;
  }
  if (
    id.includes('data-manage') ||
    id.includes('datamanage') ||
    name.includes('data manage') ||
    id.includes('ain53') ||
    name.includes('ain53')
  ) {
    return ANYTHING_DATA_MANAGE_LOGO_BASE64;
  }
  if (
    id.includes('file-manager') ||
    id.includes('afm') ||
    id.includes('media-viewer') ||
    name.includes('file manager') ||
    name.includes('media viewer')
  ) {
    return ANYTHING_FILE_MANAGER_LOGO_BASE64;
  }
  if (id.includes('tap-studio') || name.includes('tap studio')) {
    return TAP_STUDIO_LOGO_BASE64;
  }

  const raw = app.iconValue;
  if (typeof raw === 'string' && raw.length > 3 && !raw.includes('⚡')) {
    if (raw.startsWith('data:image/') || raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }
    if (raw.startsWith('/app-icons/')) {
      return '.' + raw;
    }
    if (raw.startsWith('app-icons/')) {
      return './' + raw;
    }
    if (raw.startsWith('./app-icons/')) {
      return raw;
    }
    if (/\.(png|svg|jpg|jpeg|webp)$/i.test(raw)) {
      return `./app-icons/${raw.replace(/^(\.\/)+/, '').replace(/^\/+/, '').replace(/^app-icons\//, '')}`;
    }
  }

  return null;
}

export const AppIconRenderer: React.FC<AppIconRendererProps> = ({
  app,
  size = 'md',
  className = '',
}) => {
  const pixelSizeMap = { sm: 40, md: 54, lg: 64, xl: 80 }[size];

  const [imgSrc, setImgSrc] = useState<string | null>(() => getChildAppIcon(app));
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgSrc(getChildAppIcon(app));
    setImgFailed(false);
  }, [app.id, app.name, app.iconValue, app.iconType]);

  const handleImageError = () => {
    const fallback = getChildAppIcon(app);
    if (fallback && fallback !== imgSrc) {
      setImgSrc(fallback);
      setImgFailed(false);
    } else {
      setImgFailed(true);
    }
  };

  const name = app.name || 'App';
  const initialLetter = name.charAt(0).toUpperCase();

  return (
    <div
      className={`relative select-none shrink-0 transition-transform duration-150 group-hover:scale-105 will-change-transform ${className}`}
      style={{
        width: pixelSizeMap,
        height: pixelSizeMap,
      }}
    >
      {imgSrc && !imgFailed ? (
        <div
          className="w-full h-full rounded-[22%] overflow-hidden bg-zinc-950 border border-white/15 shadow-md flex items-center justify-center relative p-1"
        >
          <img
            src={imgSrc}
            alt={name}
            onError={handleImageError}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-contain pointer-events-none"
          />
        </div>
      ) : (
        <div
          className="w-full h-full rounded-[22%] overflow-hidden bg-zinc-800 border border-white/15 shadow-md flex items-center justify-center text-white font-black text-lg select-none"
        >
          {initialLetter}
        </div>
      )}
    </div>
  );
};
