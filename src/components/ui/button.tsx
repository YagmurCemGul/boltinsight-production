'use client';

import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  loading?: boolean;
  loadingText?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'default',
    size = 'md',
    loading = false,
    loadingText,
    leftIcon,
    rightIcon,
    fullWidth = false,
    disabled,
    children,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={cn(
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
          'transition-all duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--focus-ring)] focus-visible:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50 disabled:cursor-not-allowed',
          'active:scale-[0.97]',
          {
            // Primary/Default - with dark mode hover
            'bg-[#5B50BD] text-white hover:bg-[#4A41A0] active:bg-[#3D3580] dark:bg-[#918AD3] dark:text-[#100E28] dark:hover:bg-[#A8A2DE] dark:active:bg-[#C8C4E9]':
              variant === 'default' || variant === 'primary',
            // Secondary - with dark mode
            'bg-gray-100 text-gray-900 hover:bg-gray-200 active:bg-gray-300 dark:bg-[#231E51] dark:text-gray-100 dark:hover:bg-[#2D2760] dark:active:bg-[#3D3766]':
              variant === 'secondary',
            // Outline - with dark mode border visibility
            'border border-gray-300 bg-transparent hover:bg-gray-50 active:bg-gray-100 dark:border-[#3D3766] dark:text-gray-200 dark:hover:bg-[#1A163C] dark:active:bg-[#231E51]':
              variant === 'outline',
            // Ghost - with dark mode hover
            'bg-transparent hover:bg-gray-100 active:bg-gray-200 dark:hover:bg-[#1A163C] dark:active:bg-[#231E51] dark:text-gray-200':
              variant === 'ghost',
            // Destructive - with dark mode
            'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 dark:bg-red-500 dark:hover:bg-red-400 dark:active:bg-red-300':
              variant === 'destructive',
          },
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
            'h-10 w-10 p-0': size === 'icon',
          },
          fullWidth && 'w-full',
          className
        )}
        {...props}
      >
        {/* Loading spinner or left icon */}
        {loading ? (
          <Loader2 className={cn(
            'animate-spin',
            size === 'sm' ? 'w-3 h-3' : size === 'lg' ? 'w-5 h-5' : 'w-4 h-4'
          )} />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}

        {/* Button content */}
        {loading && loadingText ? loadingText : children}

        {/* Right icon (not shown when loading) */}
        {!loading && rightIcon && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
