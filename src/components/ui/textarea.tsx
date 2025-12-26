'use client';

import { forwardRef, type TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border px-3 py-2 text-sm',
          'transition-all duration-150 ease-out',
          // Light mode - transparent background for floating over chat background
          'border-gray-300 bg-transparent text-gray-900',
          'placeholder:text-gray-400',
          // Dark mode - transparent background
          'dark:border-[#3D3766] dark:bg-transparent dark:text-gray-100',
          'dark:placeholder:text-gray-500',
          // Focus states using design tokens
          'focus:outline-none focus:ring-2 focus:ring-[var(--focus-ring)] focus:border-transparent',
          'focus:shadow-[var(--focus-glow)]',
          // Disabled states using design tokens
          'disabled:cursor-not-allowed disabled:opacity-[var(--disabled-opacity)]',
          'disabled:bg-[var(--disabled-bg)] disabled:text-[var(--disabled-text)] disabled:border-[var(--disabled-border)]',
          'resize-none',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Textarea.displayName = 'Textarea';

export { Textarea };
