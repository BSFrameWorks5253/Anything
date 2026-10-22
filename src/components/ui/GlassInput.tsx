import React from 'react';
import { Search, X } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface GlassInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  shortcut?: string;
  onClear?: () => void;
}

export const GlassInput: React.FC<GlassInputProps> = ({
  placeholder = 'Search apps & files...',
  shortcut = 'Ctrl + K',
  className = '',
  value,
  onChange,
  onClear,
  ...props
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';
  const hasValue = Boolean(value && String(value).length > 0);

  return (
    <div
      className={`relative flex items-center group ${className}`}
      style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
    >
      <Search
        className={`absolute left-3 w-3.5 h-3.5 pointer-events-none transition-colors ${
          isLight
            ? 'text-zinc-400 group-focus-within:text-zinc-700'
            : 'text-zinc-500 group-focus-within:text-zinc-300'
        }`}
      />

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-8 pr-16 py-1 text-xs rounded-lg outline-none transition-colors ${
          isLight
            ? 'bg-zinc-100 hover:bg-zinc-100/90 focus:bg-white text-zinc-900 placeholder-zinc-400 border border-zinc-200 focus:border-zinc-400'
            : 'bg-zinc-800/70 hover:bg-zinc-800 focus:bg-zinc-800 text-zinc-100 placeholder-zinc-500 border border-zinc-700/80 focus:border-zinc-500'
        }`}
        {...props}
      />

      <div className="absolute right-2 flex items-center gap-1">
        {hasValue && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              if (onClear) {
                onClear();
              } else if (onChange) {
                const syntheticEvent = {
                  target: { value: '' },
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
              }
            }}
            className={`p-0.5 rounded transition-colors ${
              isLight
                ? 'text-zinc-400 hover:text-zinc-700'
                : 'text-zinc-500 hover:text-zinc-200'
            }`}
            title="Clear"
          >
            <X className="w-3 h-3" />
          </button>
        )}

        {shortcut && (
          <span
            className={`text-[9px] font-mono px-1 py-0.2 rounded pointer-events-none select-none ${
              hasValue ? 'hidden' : 'inline-block'
            } ${
              isLight
                ? 'bg-zinc-200/70 text-zinc-600'
                : 'bg-zinc-700/60 text-zinc-400'
            }`}
          >
            {shortcut}
          </span>
        )}
      </div>
    </div>
  );
};
