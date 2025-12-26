'use client';

import { memo, type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { Skeleton } from './Skeleton';

interface StatCardProps {
  title: string;
  value: string | number;
  previousValue?: string | number;
  change?: number;
  changeLabel?: string;
  icon?: ReactNode;
  trend?: 'up' | 'down' | 'neutral';
  loading?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * StatCard - Display a single statistic with optional trend
 *
 * Usage:
 * <StatCard
 *   title="Total Proposals"
 *   value={42}
 *   change={12.5}
 *   trend="up"
 *   icon={<FileText />}
 * />
 */
export const StatCard = memo(function StatCard({
  title,
  value,
  previousValue,
  change,
  changeLabel,
  icon,
  trend,
  loading = false,
  className,
  onClick,
}: StatCardProps) {
  // Auto-detect trend from change if not provided
  const effectiveTrend = trend ?? (change ? (change > 0 ? 'up' : change < 0 ? 'down' : 'neutral') : undefined);

  const trendConfig = {
    up: {
      icon: TrendingUp,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
    },
    down: {
      icon: TrendingDown,
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/30',
    },
    neutral: {
      icon: Minus,
      color: 'text-gray-500 dark:text-gray-400',
      bg: 'bg-gray-50 dark:bg-gray-800',
    },
  };

  if (loading) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <Skeleton variant="text" className="w-24 h-4" />
            <Skeleton variant="text" className="w-16 h-8" />
            <Skeleton variant="text" className="w-20 h-4" />
          </div>
          <Skeleton variant="circular" className="w-10 h-10" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'p-6',
        onClick && 'card-interactive',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {/* Title */}
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
            {title}
          </p>

          {/* Value */}
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {value}
          </p>

          {/* Change/Trend */}
          {(change !== undefined || changeLabel) && effectiveTrend && (
            <div className="flex items-center gap-2 mt-2">
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium',
                  trendConfig[effectiveTrend].bg,
                  trendConfig[effectiveTrend].color
                )}
              >
                {effectiveTrend === 'up' && <TrendingUp className="w-3 h-3" />}
                {effectiveTrend === 'down' && <TrendingDown className="w-3 h-3" />}
                {effectiveTrend === 'neutral' && <Minus className="w-3 h-3" />}
                {change !== undefined && (
                  <span>{change > 0 ? '+' : ''}{change}%</span>
                )}
              </span>
              {changeLabel && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {changeLabel}
                </span>
              )}
            </div>
          )}

          {/* Previous value */}
          {previousValue !== undefined && (
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Previous: {previousValue}
            </p>
          )}
        </div>

        {/* Icon */}
        {icon && (
          <div
            className={cn(
              'flex items-center justify-center w-10 h-10 rounded-lg',
              'bg-[#EDE9F9] dark:bg-[#231E51]',
              'text-[#5B50BD] dark:text-[#918AD3]'
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </Card>
  );
});

/**
 * StatCardGrid - Grid layout for multiple stat cards
 */
export function StatCardGrid({
  children,
  columns = 4,
  className,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid gap-4',
        {
          'grid-cols-1 sm:grid-cols-2': columns === 2,
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3': columns === 3,
          'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4': columns === 4,
        },
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * MiniStatCard - Compact version for sidebars or smaller areas
 */
export const MiniStatCard = memo(function MiniStatCard({
  title,
  value,
  icon,
  className,
}: {
  title: string;
  value: string | number;
  icon?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg',
        'bg-gray-50 dark:bg-[#1A163C]',
        className
      )}
    >
      {icon && (
        <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD] dark:text-[#918AD3]">
          {icon}
        </div>
      )}
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{value}</p>
      </div>
    </div>
  );
});
