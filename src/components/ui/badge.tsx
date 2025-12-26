'use client';

import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info' | 'custom';
}

export function Badge({ className, variant = 'custom', ...props }: BadgeProps) {
  // If className contains bg- or text- classes, don't apply variant colors
  const hasCustomColors = className && (className.includes('bg-') || className.includes('text-'));
  const effectiveVariant = hasCustomColors ? 'custom' : variant;

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
        'transition-colors duration-150',
        {
          // Default - neutral gray with WCAG AA contrast
          'bg-gray-100 text-gray-800 dark:bg-[#2D2760] dark:text-gray-200 dark:border dark:border-[#3D3766]':
            effectiveVariant === 'default',
          // Success - emerald with proper dark mode contrast (4.5:1+)
          'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 dark:border dark:border-emerald-700/50':
            effectiveVariant === 'success',
          // Warning - amber with proper dark mode contrast (4.5:1+)
          'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 dark:border dark:border-amber-700/50':
            effectiveVariant === 'warning',
          // Error - red with proper dark mode contrast (4.5:1+)
          'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 dark:border dark:border-red-700/50':
            effectiveVariant === 'error',
          // Info - brand purple with proper dark mode contrast
          'bg-[#EDE9F9] text-[#5B50BD] dark:bg-[#2D2760] dark:text-[#C8C4E9] dark:border dark:border-[#3D3766]':
            effectiveVariant === 'info',
          // 'custom' variant applies no colors - uses className
        },
        className
      )}
      {...props}
    />
  );
}
