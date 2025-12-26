'use client';

import { cn } from '@/lib/utils';
import type { QualityRating } from '@/types/calculator';

interface CalculatorResultProps {
  value: string | number;
  unit?: string;
  label: string;
  description?: string;
  qualityRating?: QualityRating;
  colorScheme?: 'blue' | 'purple' | 'green' | 'teal' | 'amber';
  size?: 'sm' | 'md' | 'lg';
}

const colorSchemes = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-300',
    label: 'text-blue-900 dark:text-blue-100',
    description: 'text-blue-800 dark:text-blue-200',
  },
  purple: {
    bg: 'bg-[#EDE9F9] dark:bg-[#231E51]',
    border: 'border-[#C8C4E9] dark:border-[#5B50BD]',
    text: 'text-[#5B50BD] dark:text-[#918AD3]',
    label: 'text-[#5B50BD] dark:text-[#918AD3]',
    description: 'text-gray-700 dark:text-gray-300',
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-300 dark:border-green-700',
    text: 'text-green-700 dark:text-green-300',
    label: 'text-green-900 dark:text-green-100',
    description: 'text-green-800 dark:text-green-200',
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950',
    border: 'border-teal-300 dark:border-teal-700',
    text: 'text-teal-700 dark:text-teal-300',
    label: 'text-teal-900 dark:text-teal-100',
    description: 'text-teal-800 dark:text-teal-200',
  },
  amber: {
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-300 dark:border-amber-700',
    text: 'text-amber-700 dark:text-amber-300',
    label: 'text-amber-900 dark:text-amber-100',
    description: 'text-amber-800 dark:text-amber-200',
  },
};

const qualityColors: Record<QualityRating, string> = {
  excellent: 'text-green-600 dark:text-green-400',
  good: 'text-blue-600 dark:text-blue-400',
  acceptable: 'text-amber-600 dark:text-amber-400',
  poor: 'text-red-600 dark:text-red-400',
};

const qualityLabels: Record<QualityRating, string> = {
  excellent: 'Excellent',
  good: 'Good',
  acceptable: 'Acceptable',
  poor: 'Poor',
};

export function CalculatorResult({
  value,
  unit,
  label,
  description,
  qualityRating,
  colorScheme = 'blue',
  size = 'md',
}: CalculatorResultProps) {
  const colors = colorSchemes[colorScheme];

  const valueSize = {
    sm: 'text-2xl',
    md: 'text-3xl',
    lg: 'text-4xl',
  }[size];

  const unitSize = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl',
  }[size];

  return (
    <div
      className={cn(
        'rounded-lg p-4 border-2',
        colors.bg,
        colors.border
      )}
    >
      <h3 className={cn('mb-2 font-semibold', colors.label)}>
        {label}
      </h3>

      <div className="flex items-baseline gap-2">
        <span className={cn('font-bold', valueSize, colors.text)}>
          {typeof value === 'number' ? value.toLocaleString() : value}
        </span>
        {unit && (
          <span className={cn('font-medium', unitSize, colors.text)}>
            {unit}
          </span>
        )}
      </div>

      {qualityRating && (
        <div className="mt-2 flex items-center gap-2">
          <span className="text-sm text-gray-600 dark:text-gray-400">Quality:</span>
          <span className={cn('font-medium text-sm', qualityColors[qualityRating])}>
            {qualityLabels[qualityRating]}
          </span>
        </div>
      )}

      {description && (
        <p className={cn('mt-2 text-sm', colors.description)}>
          {description}
        </p>
      )}
    </div>
  );
}

// Compact version for secondary metrics
interface MetricDisplayProps {
  label: string;
  value: string | number;
  subtext?: string;
  trend?: 'up' | 'down' | 'neutral';
}

export function MetricDisplay({ label, value, subtext, trend }: MetricDisplayProps) {
  return (
    <div className="p-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
      <p className="text-xl font-semibold text-gray-900 dark:text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
      {subtext && (
        <p className={cn(
          'text-xs mt-1',
          trend === 'up' ? 'text-green-600' :
          trend === 'down' ? 'text-red-600' :
          'text-gray-500 dark:text-gray-400'
        )}>
          {subtext}
        </p>
      )}
    </div>
  );
}

// Grid of metrics
interface MetricGridProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
}

export function MetricGrid({ children, columns = 3 }: MetricGridProps) {
  const gridCols = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  }[columns];

  return (
    <div className={cn('grid gap-4', gridCols)}>
      {children}
    </div>
  );
}
