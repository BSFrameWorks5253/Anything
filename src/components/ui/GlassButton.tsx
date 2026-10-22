import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface GlassButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'glass' | 'ghost' | 'danger' | 'accent';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const GlassButton: React.FC<GlassButtonProps> = ({
  children,
  variant = 'glass',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5 rounded-lg',
    md: 'text-xs sm:text-sm px-4 py-2 gap-2 rounded-lg',
    lg: 'text-sm px-5 py-2.5 gap-2.5 rounded-xl',
  }[size];

  const variantClasses = {
    primary: isLight
      ? 'bg-zinc-900 hover:bg-black !text-white font-semibold shadow-xs active:scale-[0.99]'
      : 'bg-white hover:bg-zinc-200 !text-zinc-950 font-semibold shadow-xs active:scale-[0.99]',
    accent:
      'bg-red-600 hover:bg-red-700 !text-white font-semibold shadow-xs active:scale-[0.99]',
    glass: isLight
      ? 'bg-white hover:bg-zinc-50 !text-zinc-800 border border-zinc-300 shadow-xs active:scale-[0.99]'
      : 'bg-zinc-800/80 hover:bg-zinc-700 !text-zinc-100 border border-zinc-700 shadow-xs active:scale-[0.99]',
    ghost: isLight
      ? 'bg-transparent hover:bg-zinc-100 !text-zinc-600 hover:!text-zinc-900 active:scale-[0.99]'
      : 'bg-transparent hover:bg-zinc-800 !text-zinc-400 hover:!text-zinc-100 active:scale-[0.99]',
    danger: isLight
      ? 'bg-rose-50 hover:bg-rose-100 !text-rose-700 border border-rose-200 active:scale-[0.99]'
      : 'bg-rose-950/40 hover:bg-rose-900/60 !text-rose-300 border border-rose-800/60 active:scale-[0.99]',
  }[variant];

  return (
    <button
      className={`inline-flex items-center justify-center font-medium transition-colors select-none disabled:opacity-50 disabled:pointer-events-none cursor-pointer ${sizeClasses} ${variantClasses} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      <span>{children}</span>
    </button>
  );
};
