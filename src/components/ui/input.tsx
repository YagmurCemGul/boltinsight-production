'use client';

import { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-lg border px-3 py-2 text-sm',
          'transition-all duration-150 ease-out',
          // Light mode
          'border-gray-300 bg-white text-gray-900',
          'placeholder:text-gray-400',
          // Dark mode
          'dark:border-[#3D3766] dark:bg-[#1A163C] dark:text-gray-100',
          'dark:placeholder:text-gray-500',
          // Focus states using design tokens
          'focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent',
          'focus:shadow-[var(--focus-glow)]',
          // Disabled states using design tokens
          'disabled:cursor-not-allowed disabled:opacity-[var(--disabled-opacity)]',
          'disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-text)] disabled:border-[var(--disabled-border)]',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = 'Input';

export { Input };
