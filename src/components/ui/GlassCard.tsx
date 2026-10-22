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
    interactive: 'liquid-glass-card hover:shadow-liquid-glow cursor-pointer',
    static: 'liquid-glass-panel',
    elevated: 'liquid-glass-panel shadow-2xl backdrop-blur-3xl border-white/20',
    sunken: 'bg-white/[0.03] backdrop-blur-xl border border-white/5 shadow-inner',
  }[variant];

  return (
    <div
      className={`rounded-2xl transition-all duration-300 relative overflow-hidden ${variantStyles} ${className}`}
      style={{
        ...style,
        ...(glowColor ? { '--glow-color': glowColor } as React.CSSProperties : {}),
      }}
      {...props}
    >
      {/* Specular highlight rim at top */}
      <div className="specular-reflection" />
      {children}
    </div>
  );
};
