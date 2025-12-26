'use client';

import { cn } from '@/lib/utils';
import type { LucideIcon } from 'lucide-react';

interface ThemedIconProps {
  icon: LucideIcon;
  className?: string;
  muted?: boolean;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const sizeClasses = {
  xs: 'w-3 h-3',
  sm: 'w-4 h-4',
  md: 'w-5 h-5',
  lg: 'w-6 h-6',
  xl: 'w-8 h-8',
};

/**
 * ThemedIcon - A wrapper for Lucide icons with consistent dark mode styling
 *
 * Usage:
 * <ThemedIcon icon={Settings} size="md" />
 * <ThemedIcon icon={HelpCircle} muted size="sm" />
 */
export function ThemedIcon({ icon: Icon, className, muted, size = 'md' }: ThemedIconProps) {
  return (
    <Icon
      className={cn(
        sizeClasses[size],
        muted
          ? 'text-gray-400 dark:text-gray-500'
          : 'text-gray-600 dark:text-gray-300',
        className
      )}
    />
  );
}

// Variant for primary colored icons
export function PrimaryIcon({ icon: Icon, className, size = 'md' }: Omit<ThemedIconProps, 'muted'>) {
  return (
    <Icon
      className={cn(
        sizeClasses[size],
        'text-[#5B50BD] dark:text-[#918AD3]',
        className
      )}
    />
  );
}

// Variant for status icons
interface StatusIconProps extends Omit<ThemedIconProps, 'muted'> {
  status: 'success' | 'warning' | 'error' | 'info';
}

const statusColors = {
  success: 'text-emerald-600 dark:text-emerald-400',
  warning: 'text-amber-600 dark:text-amber-400',
  error: 'text-red-600 dark:text-red-400',
  info: 'text-blue-600 dark:text-blue-400',
};

export function StatusIcon({ icon: Icon, className, size = 'md', status }: StatusIconProps) {
  return (
    <Icon
      className={cn(
        sizeClasses[size],
        statusColors[status],
        className
      )}
    />
  );
}
