import React from 'react';

interface GlassCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  variant?: 'interactive' | 'static' | 'elevated' | 'sunken';
  glowColor?: string;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  variant = 'interactive',
  glowColor,
  style,
  ...props
}) => {
  const variantStyles = {
    interactive: 'liquid-glass-card cursor-pointer',
    static: 'liquid-glass-panel',
    elevated: 'liquid-glass-panel shadow-xl border-white/10',
    sunken: 'bg-zinc-900/60 border border-white/5 shadow-inner',
  }[variant];

  return (
    <div
      className={`rounded-2xl transition-all duration-150 relative overflow-hidden ${variantStyles} ${className}`}
      style={{
        ...style,
        ...(glowColor ? ({ '--glow-color': glowColor } as React.CSSProperties) : {}),
      }}
      {...props}
    >
      {children}
    </div>
  );
};
