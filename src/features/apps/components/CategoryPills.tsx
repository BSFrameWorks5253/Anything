import React from 'react';
import { useTheme } from '../../../context/ThemeContext';

interface CategoryPillsProps {
  categories: string[];
  activeCategory: string;
  onSelectCategory: (category: string) => void;
}

export const CategoryPills: React.FC<CategoryPillsProps> = ({
  categories,
  activeCategory,
  onSelectCategory,
}) => {
  const { theme } = useTheme();
  const isLight = theme === 'light';

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto py-1.5 no-scrollbar">
      {categories.map((cat) => {
        const isSelected = activeCategory === cat;
        return (
          <button
            key={cat}
            onClick={() => onSelectCategory(cat)}
            className={`px-3 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-all duration-150 ease-out active:scale-[0.96] border select-none ${
              isSelected
                ? isLight
                  ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                  : 'bg-zinc-100 text-zinc-900 border-zinc-100 font-semibold shadow-xs'
                : isLight
                ? 'bg-white hover:bg-zinc-100 text-zinc-600 hover:text-zinc-900 border-zinc-200'
                : 'bg-zinc-800/60 hover:bg-zinc-700 text-zinc-300 hover:text-white border-zinc-700/80'
            }`}
          >
            {cat}
          </button>
        );
      })}
    </div>
  );
};
