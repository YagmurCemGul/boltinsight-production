'use client';

import { cn } from '@/lib/utils';
import type { QualityRating } from '@/types/calculator';

interface BenchmarkIndicatorProps {
  value: number;
  ranges: {
    excellent: [number, number];
    good: [number, number];
    acceptable: [number, number];
    poor: [number, number];
  };
  unit?: string;
  showLabels?: boolean;
  reverse?: boolean; // For metrics where lower is better (like MOE)
}

export function BenchmarkIndicator({
  value,
  ranges,
  unit = '%',
  showLabels = true,
  reverse = false,
}: BenchmarkIndicatorProps) {
  // Determine current rating
  const getCurrentRating = (): QualityRating => {
    if (value >= ranges.excellent[0] && value < ranges.excellent[1]) return 'excellent';
    if (value >= ranges.good[0] && value < ranges.good[1]) return 'good';
    if (value >= ranges.acceptable[0] && value < ranges.acceptable[1]) return 'acceptable';
    return 'poor';
  };

  const rating = getCurrentRating();

  // Calculate position on the bar (0-100%)
  const calculatePosition = (): number => {
    const minVal = Math.min(
      ranges.excellent[0],
      ranges.good[0],
      ranges.acceptable[0],
      ranges.poor[0]
    );
    const maxVal = Math.max(
      ranges.excellent[1],
      ranges.good[1],
      ranges.acceptable[1],
      ranges.poor[1]
    );

    const position = ((value - minVal) / (maxVal - minVal)) * 100;
    return Math.max(0, Math.min(100, position));
  };

  const position = calculatePosition();

  const ratingColors: Record<QualityRating, { bg: string; text: string; marker: string }> = {
    excellent: {
      bg: 'bg-green-500',
      text: 'text-green-700 dark:text-green-400',
      marker: 'bg-green-600 border-green-700',
    },
    good: {
      bg: 'bg-blue-500',
      text: 'text-blue-700 dark:text-blue-400',
      marker: 'bg-blue-600 border-blue-700',
    },
    acceptable: {
      bg: 'bg-amber-500',
      text: 'text-amber-700 dark:text-amber-400',
      marker: 'bg-amber-600 border-amber-700',
    },
    poor: {
      bg: 'bg-red-500',
      text: 'text-red-700 dark:text-red-400',
      marker: 'bg-red-600 border-red-700',
    },
  };

  const currentColor = ratingColors[rating];

  return (
    <div className="space-y-2">
      {/* Value display */}
      <div className="flex items-center justify-between">
        <span className={cn('font-semibold', currentColor.text)}>
          {value}
          {unit}
        </span>
        <span className={cn('text-sm font-medium capitalize', currentColor.text)}>
          {rating}
        </span>
      </div>

      {/* Progress bar */}
      <div className="relative">
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
          {/* Segments - order depends on reverse prop */}
          {reverse ? (
            <>
              <div className="flex-1 bg-green-500" title="Excellent" />
              <div className="flex-1 bg-blue-500" title="Good" />
              <div className="flex-1 bg-amber-500" title="Acceptable" />
              <div className="flex-1 bg-red-500" title="Poor" />
            </>
          ) : (
            <>
              <div className="flex-1 bg-red-500" title="Poor" />
              <div className="flex-1 bg-amber-500" title="Acceptable" />
              <div className="flex-1 bg-blue-500" title="Good" />
              <div className="flex-1 bg-green-500" title="Excellent" />
            </>
          )}
        </div>

        {/* Position marker */}
        <div
          className={cn(
            'absolute top-1/2 -translate-y-1/2 -translate-x-1/2',
            'w-4 h-4 rounded-full border-2 border-white dark:border-gray-900',
            currentColor.marker,
            'shadow-md transition-all duration-300'
          )}
          style={{ left: `${position}%` }}
        >
          {/* Inner dot */}
          <div className="absolute inset-1 bg-white rounded-full" />
        </div>
      </div>

      {/* Labels */}
      {showLabels && (
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
          {reverse ? (
            <>
              <span>Excellent</span>
              <span>Good</span>
              <span>Acceptable</span>
              <span>Poor</span>
            </>
          ) : (
            <>
              <span>Poor</span>
              <span>Acceptable</span>
              <span>Good</span>
              <span>Excellent</span>
            </>
          )}
        </div>
      )}
    </div>
  );
}

// Simple quality badge
interface QualityBadgeProps {
  rating: QualityRating;
  size?: 'sm' | 'md';
}

export function QualityBadge({ rating, size = 'md' }: QualityBadgeProps) {
  const colors: Record<QualityRating, string> = {
    excellent: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    good: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    acceptable: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
    poor: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
  }[size];

  return (
    <span className={cn('font-medium rounded-full capitalize', colors[rating], sizeClasses)}>
      {rating}
    </span>
  );
}

// Horizontal benchmark comparison
interface BenchmarkComparisonProps {
  current: number;
  benchmark: number;
  label: string;
  unit?: string;
}

export function BenchmarkComparison({ current, benchmark, label, unit = '' }: BenchmarkComparisonProps) {
  const difference = current - benchmark;
  const isAbove = difference > 0;
  const percentDiff = benchmark > 0 ? Math.abs(Math.round((difference / benchmark) * 100)) : 0;

  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <div className="flex items-center gap-2">
        <span className="font-medium text-gray-900 dark:text-white">
          {current.toLocaleString()}{unit}
        </span>
        <span className={cn(
          'text-xs px-1.5 py-0.5 rounded',
          isAbove
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
            : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
        )}>
          {isAbove ? '+' : '-'}{percentDiff}%
        </span>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          (benchmark: {benchmark.toLocaleString()}{unit})
        </span>
      </div>
    </div>
  );
}
