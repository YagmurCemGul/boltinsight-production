'use client';

import { cn } from '@/lib/utils';
import type { SuggestionPillsProps } from './types';

export function SuggestionPills({
  suggestions,
  onSelect,
  layout = 'horizontal',
  className,
}: SuggestionPillsProps) {
  if (suggestions.length === 0) return null;

  if (layout === 'vertical') {
    return (
      <div className={cn('space-y-1', className)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
          {suggestions.map((suggestion, index) => (
            <button
              key={index}
              onClick={() => onSelect(suggestion)}
              className={cn(
                'w-full text-left px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs rounded-lg',
                'text-gray-700 dark:text-gray-300',
                'border border-gray-200 dark:border-gray-700',
                'bg-white dark:bg-gray-800',
                'hover:bg-gray-50 dark:hover:bg-gray-700',
                'hover:border-[#5B50BD] dark:hover:border-[#918AD3]',
                'transition-colors duration-150',
                'focus:outline-none focus:ring-1 focus:ring-[#5B50BD]/20',
                'line-clamp-2'
              )}
            >
              <span className="text-gray-400 dark:text-gray-500 mr-1">{'\u2022'}</span>
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    );
  }

  // Horizontal layout
  return (
    <div className={cn('', className)}>
      <div className="flex flex-wrap gap-1.5">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            onClick={() => onSelect(suggestion)}
            className={cn(
              'px-2.5 py-1 text-xs rounded-lg',
              'text-gray-700 dark:text-gray-300',
              'border border-gray-200 dark:border-gray-700',
              'bg-white dark:bg-gray-800',
              'hover:bg-gray-50 dark:hover:bg-gray-700',
              'hover:border-[#5B50BD] dark:hover:border-[#918AD3]',
              'transition-colors duration-150',
              'focus:outline-none focus:ring-1 focus:ring-[#5B50BD]/20'
            )}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
}
