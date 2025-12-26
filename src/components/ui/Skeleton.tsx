'use client';

import { cn } from '@/lib/utils';
import type { HTMLAttributes } from 'react';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular' | 'rounded';
  width?: string | number;
  height?: string | number;
  lines?: number;
  animate?: boolean;
}

/**
 * Skeleton - Loading placeholder component
 *
 * Usage:
 * <Skeleton variant="text" lines={3} />
 * <Skeleton variant="circular" width={40} height={40} />
 * <Skeleton variant="rectangular" width="100%" height={200} />
 */
export function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  lines = 1,
  animate = true,
  ...props
}: SkeletonProps) {
  const baseClasses = cn(
    'bg-gray-200 dark:bg-[#2D2760]',
    animate && 'animate-skeleton',
    className
  );

  const style = {
    width: typeof width === 'number' ? `${width}px` : width,
    height: typeof height === 'number' ? `${height}px` : height,
  };

  if (variant === 'circular') {
    return (
      <div
        className={cn(baseClasses, 'rounded-full')}
        style={{ ...style, aspectRatio: width && height ? undefined : '1/1' }}
        {...props}
      />
    );
  }

  if (variant === 'rectangular') {
    return (
      <div
        className={cn(baseClasses, 'rounded-none')}
        style={style}
        {...props}
      />
    );
  }

  if (variant === 'rounded') {
    return (
      <div
        className={cn(baseClasses, 'rounded-xl')}
        style={style}
        {...props}
      />
    );
  }

  // Text variant - can have multiple lines
  if (lines > 1) {
    return (
      <div className="space-y-2" {...props}>
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              baseClasses,
              'h-4 rounded',
              i === lines - 1 && 'w-3/4' // Last line is shorter
            )}
            style={i === lines - 1 ? {} : style}
          />
        ))}
      </div>
    );
  }

  return (
    <div
      className={cn(baseClasses, 'h-4 rounded')}
      style={style}
      {...props}
    />
  );
}

/**
 * SkeletonCard - Card loading placeholder
 */
export function SkeletonCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 dark:border-[#3D3766] p-6',
        'bg-[var(--surface-raised)]',
        className
      )}
      {...props}
    >
      <div className="space-y-4">
        <Skeleton variant="text" width="60%" />
        <Skeleton variant="text" lines={2} />
        <div className="flex gap-2 pt-2">
          <Skeleton variant="rounded" width={80} height={32} />
          <Skeleton variant="rounded" width={80} height={32} />
        </div>
      </div>
    </div>
  );
}

/**
 * SkeletonAvatar - Avatar with text loading placeholder
 */
export function SkeletonAvatar({
  className,
  size = 40,
  showText = true,
  ...props
}: HTMLAttributes<HTMLDivElement> & { size?: number; showText?: boolean }) {
  return (
    <div className={cn('flex items-center gap-3', className)} {...props}>
      <Skeleton variant="circular" width={size} height={size} />
      {showText && (
        <div className="space-y-2 flex-1">
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="60%" className="h-3" />
        </div>
      )}
    </div>
  );
}

/**
 * SkeletonTable - Table loading placeholder
 */
export function SkeletonTable({
  rows = 5,
  columns = 4,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { rows?: number; columns?: number }) {
  return (
    <div className={cn('w-full', className)} {...props}>
      {/* Header */}
      <div className="flex gap-4 pb-4 border-b border-gray-200 dark:border-[#3D3766]">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} variant="text" className="flex-1 h-5" />
        ))}
      </div>
      {/* Rows */}
      <div className="divide-y divide-gray-100 dark:divide-[#2D2760]">
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="flex gap-4 py-4">
            {Array.from({ length: columns }).map((_, colIndex) => (
              <Skeleton
                key={colIndex}
                variant="text"
                className="flex-1"
                width={colIndex === 0 ? '80%' : undefined}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * SkeletonChart - Chart loading placeholder
 */
export function SkeletonChart({
  type = 'bar',
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { type?: 'bar' | 'donut' | 'line' }) {
  if (type === 'donut') {
    return (
      <div className={cn('flex items-center justify-center p-8', className)} {...props}>
        <div className="relative">
          <Skeleton variant="circular" width={160} height={160} />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-20 h-20 rounded-full bg-[var(--surface-raised)]" />
          </div>
        </div>
      </div>
    );
  }

  if (type === 'line') {
    return (
      <div className={cn('p-4', className)} {...props}>
        <Skeleton variant="rounded" width="100%" height={200} />
      </div>
    );
  }

  // Bar chart
  return (
    <div className={cn('flex items-end gap-2 h-48 p-4', className)} {...props}>
      {[40, 65, 45, 80, 55, 70, 35, 60].map((h, i) => (
        <Skeleton
          key={i}
          variant="rectangular"
          className="flex-1 rounded-t"
          height={`${h}%`}
        />
      ))}
    </div>
  );
}

/**
 * SkeletonProposalCard - Proposal card loading placeholder
 */
export function SkeletonProposalCard({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'rounded-xl border border-gray-200 dark:border-[#3D3766] p-4',
        'bg-[var(--surface-raised)]',
        className
      )}
      {...props}
    >
      <div className="flex items-start justify-between mb-3">
        <Skeleton variant="rounded" width={80} height={24} />
        <Skeleton variant="circular" width={24} height={24} />
      </div>
      <Skeleton variant="text" width="80%" className="mb-2" />
      <Skeleton variant="text" width="60%" className="h-3 mb-4" />
      <div className="flex items-center gap-2">
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width={100} className="h-3" />
      </div>
    </div>
  );
}
