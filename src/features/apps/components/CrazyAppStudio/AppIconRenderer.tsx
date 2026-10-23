import React, { useState, useEffect } from 'react';
import type { CreativeApp } from '../../../../types/app.types';

export const TAP_STUDIO_LOGO_BASE64 =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAOg0lEQVR4nO3deZAcZRnH8Wd2do7dkI3ZzUEOJCBJwAABAomBiGBpQGNVtrQUhaKgggFEyuLwj3AIRQKCRlFAxUJBQZBDiBMOSQIkEDAhgHLEACEngSRkc2yy987sYb2Na5awx/T0291vz/v9VHVRQNVO19Q8v37ft99DBAAAAAAA2CAmETdz+tbOsO8B9lq4ZFSkayhSN0+xIwoWRigUYsVQ9JnFI08P5m6A/arP2LZMIh4GsSgVPYWOKAfDQgPDIGZ64VP0KLYwWGhQEIR+IxQ9bFFtYBjETCr+Qp/2+fTFAN0ymn6vYYZALGqFT7HDZBkPv+UwgiAWhcKn6BFFmQJ/30EGQSyM4s/ni6HoUUwyLn/zQYVAzLTip/BRzDIufv9BhEDMlCY/hQ+bZFzUgp9BEAv7qU/hw2aZPGvDrxCIhVX8FD6wXz514kcIlOj+gxQ/4F5vD8TuweDHYjitAUDxA9EKgVhQxU+TH8hffzWkqzugpQVA8QN69fTA9KMl4DkAKH4guiHgKQAofiDaIaClC0CfHwgvBEIJgK7kofiBcEPASyugoADo6wMZ7Qf80VdtFRoCJX6v6gPgH6/jAQV3AWj6A9EfD3AVAPT7geIaD9DyFoB+PxAsXTVXouPpDyB8hbQC8goARv2B4nwr4KoLwNMfMJvbGvU0BkDfHwiX1xrsNwDo+wPFOxZQcAuApz9gBi+12GcA8PQHirsVUFALgKc/YJZCa1L7pqAAoqPXAKD5DxR/N8B1C4DmP2CmQmqTLgBgsR4DgOY/YEc3wFULgOY/YDa3NUoXALAYAQBYjAAALPapAPDjBFIA4euptkvyXVfMACAQDQfWal97BNAFACxGAAAWIwAAixEAgMUIAMBiBABgMQIAsBgBAFiMAAAsRgAAFiMAAIsRAIDFCADAYgQAYDECALAYAQBYjAAALEYAABYjAACLEQCAxQgAwGIEAGAxAgCwGAEAWIwAACxGAAAWIwAAixEAgMUIAMBiBABgsVKx1IKnR0oJ8dev71Zvl5bmTx0rjyJBCQAWIwAAixEAgMUIAMBiBABgMQIAsBgBAFiMAAAsRgAAFiMAAIsRAIDFCADAYgQAYDECALAYAQBYjAAALGbthiDnnfWRxGL+f8455w2UM2YM0Po3H32oQR5f0CBBYDOQ4mZtANTXdQTyOdmsD3+ztVPq9gVz/yhudAEAixEAgMUIAMBiBABgMQIAsJi1bwFgBnU2wyGHJmTMYaUyYlSpjBhZKlVDSqRiUFwqKkoklY5JIiESj8ektbXTeQOi/tnS0il7a9tlZ0277Kppl50722XH9nbZtDEX2BueYkAAIFBq7sXY8Uk5flJKJ6Q=';

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
    if (isTapStudio) {
      return TAP_STUDIO_LOGO_BASE64;
    }
    if (typeof rawIconValue === 'string') {
      if (rawIconValue.startsWith('data:image/')) return rawIconValue;
      if (rawIconValue.startsWith('http://') || rawIconValue.startsWith('https://')) return rawIconValue;
      if (rawIconValue.startsWith('/')) return rawIconValue;
      if (rawIconValue === 'assets/logo.svg' || rawIconValue === 'logo.svg' || rawIconValue.endsWith('logo.svg')) {
        return TAP_STUDIO_LOGO_BASE64;
      }
      if (rawIconValue === 'app-logo.png' || rawIconValue.endsWith('app-logo.png')) {
        return TAP_STUDIO_LOGO_BASE64;
      }
      if (/\.(png|svg|jpg|jpeg|webp)$/i.test(rawIconValue)) {
        return `/${rawIconValue.replace(/^(\.\/)+/, '')}`;
      }
    }
    if (app.iconType === 'image' || app.iconType === 'svg') {
      return isTapStudio ? TAP_STUDIO_LOGO_BASE64 : null;
    }
    if (isTapStudio) {
      return TAP_STUDIO_LOGO_BASE64;
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
    if (isTapStudio && imgSrc !== TAP_STUDIO_LOGO_BASE64) {
      setImgSrc(TAP_STUDIO_LOGO_BASE64);
      setImgFailed(false);
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
            className={`w-full h-full rounded-[inherit] ${
              isTapStudio ? 'object-contain p-1.5' : 'object-cover'
            }`}
          />
        ) : isTapStudio ? (
          <img
            src={TAP_STUDIO_LOGO_BASE64}
            alt="Tap Studio"
            className="w-full h-full object-contain p-1.5 rounded-[inherit]"
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
