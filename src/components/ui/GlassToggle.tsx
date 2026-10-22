import React from 'react';
import { useTheme } from '../../context/ThemeContext';

interface GlassToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}

export const GlassToggle: React.FC<GlassToggleProps> = ({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div
      onClick={() => !disabled && onChange(!checked)}
      className={`flex items-center justify-between py-2 group cursor-pointer select-none ${
        disabled ? 'opacity-40 cursor-not-allowed' : ''
      }`}
    >
      {(label || description) && (
        <div className="flex flex-col pr-4">
          {label && (
            <span
              className={`text-sm font-medium transition-colors ${
                isLight ? 'text-slate-900' : 'text-white/90 group-hover:text-white'
              }`}
            >
              {label}
            </span>
          )}
          {description && (
            <span
              className={`text-xs mt-0.5 leading-relaxed ${
                isLight ? 'text-slate-500 font-medium' : 'text-white/45'
              }`}
            >
              {description}
            </span>
          )}
        </div>
      )}

      {/* macOS / iOS Liquid Pill Switch */}
      <div
        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border transition-all duration-300 ease-in-out focus:outline-none backdrop-blur-xl ${
          checked
            ? 'bg-gradient-to-r from-sky-400 via-cyan-400 to-blue-500 border-cyan-300/80 shadow-[0_0_12px_rgba(56,189,248,0.4)]'
            : isLight
            ? 'bg-slate-200 border-slate-300 hover:border-slate-400 shadow-inner'
            : 'bg-white/[0.08] border-white/15 hover:border-white/25'
        }`}
      >
        <span
          className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-all duration-300 ease-in-out mt-0.5 ${
            checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
        >
          {/* Subtle liquid sheen on switch handle */}
          <span className="block w-full h-full rounded-full bg-gradient-to-b from-white to-slate-200" />
        </span>
      </div>
    </div>
  );
};
