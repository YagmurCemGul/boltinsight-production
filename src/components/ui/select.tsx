'use client';

import { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[];
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, options, placeholder, ...props }, ref) => {
    return (
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            'flex h-10 w-full appearance-none rounded-lg border px-3 py-2 pr-10 text-sm',
            'transition-all duration-150 ease-out',
            // Light mode
            'border-gray-300 bg-white text-gray-900',
            // Dark mode
            'dark:border-[#3D3766] dark:bg-[#1A163C] dark:text-gray-100',
            // Focus states using design tokens
            'focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent',
            'focus:shadow-[var(--focus-glow)]',
            // Disabled states using design tokens
            'disabled:cursor-not-allowed disabled:opacity-[var(--disabled-opacity)]',
            'disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-text)] disabled:border-[var(--disabled-border)]',
            className
          )}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-500" />
      </div>
    );
  }
);

Select.displayName = 'Select';

export { Select };
