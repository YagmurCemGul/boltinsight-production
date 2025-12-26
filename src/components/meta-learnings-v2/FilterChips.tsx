'use client';

import { cn } from '@/lib/utils';
import { X, Filter, Calendar, Building2, CheckCircle, User, Beaker } from 'lucide-react';
import { FILTER_TYPE_LABELS } from './constants';
import type { FilterChipsProps, FilterType } from './types';

const FILTER_ICONS: Record<FilterType, React.ReactNode> = {
  date: <Calendar className="w-3 h-3" />,
  customer: <Building2 className="w-3 h-3" />,
  status: <CheckCircle className="w-3 h-3" />,
  methodology: <Beaker className="w-3 h-3" />,
  author: <User className="w-3 h-3" />,
};

export function FilterChips({
  filters,
  onRemove,
  onClearAll,
  className,
}: FilterChipsProps) {
  if (filters.length === 0) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-1.5 px-2 py-1.5 rounded-lg',
        'bg-gray-50 dark:bg-gray-800/50',
        className
      )}
    >
      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
        <Filter className="w-3 h-3" />
        <span>Filters:</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {filters.map((filter) => (
          <span
            key={filter.id}
            className={cn(
              'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs',
              'bg-[#5B50BD]/10 dark:bg-[#918AD3]/20',
              'text-[#5B50BD] dark:text-[#C8C4E9]',
              'border border-[#5B50BD]/30 dark:border-[#918AD3]/30'
            )}
          >
            {FILTER_ICONS[filter.type]}
            <span className="font-medium">{filter.label}</span>
            <button
              onClick={() => onRemove(filter.id)}
              className={cn(
                'p-0.5 rounded-full -mr-0.5',
                'hover:bg-[#5B50BD]/20 dark:hover:bg-[#918AD3]/30',
                'transition-colors'
              )}
              title={`Remove ${FILTER_TYPE_LABELS[filter.type]} filter`}
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {filters.length > 1 && (
        <button
          onClick={onClearAll}
          className={cn(
            'ml-auto text-xs text-gray-500 dark:text-gray-400',
            'hover:text-gray-700 dark:hover:text-gray-200',
            'transition-colors'
          )}
        >
          Clear all
        </button>
      )}
    </div>
  );
}
