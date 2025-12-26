'use client';

import { useMemo } from 'react';
import { cn } from '@/lib/utils';
import type { QualityRating, CostTier } from '@/types/calculator';

// MOE Quality Ranges
const MOE_QUALITY_RANGES = [
  { max: 2, rating: 'excellent' as const, emoji: '🟢🟢🟢🟢🟢', label: 'Excellent', description: 'Highly reliable for critical decisions' },
  { max: 3, rating: 'good' as const, emoji: '🟢🟢🟢🟢⚪', label: 'Very Good', description: 'Solid results for most applications' },
  { max: 5, rating: 'acceptable' as const, emoji: '🟢🟢🟢⚪⚪', label: 'Good', description: 'Standard for concept tests' },
  { max: 7, rating: 'acceptable' as const, emoji: '🟢🟢⚪⚪⚪', label: 'Acceptable', description: 'Suitable for exploratory research' },
  { max: 10, rating: 'poor' as const, emoji: '🟢⚪⚪⚪⚪', label: 'Marginal', description: 'Use with caution' },
  { max: Infinity, rating: 'poor' as const, emoji: '🔴', label: 'Poor', description: 'Not recommended for decisions' },
];

interface MOEQualityIndicatorProps {
  moe: number;
  showDetails?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function MOEQualityIndicator({ moe, showDetails = true, size = 'md' }: MOEQualityIndicatorProps) {
  const quality = useMemo(() => {
    return MOE_QUALITY_RANGES.find(r => moe < r.max) || MOE_QUALITY_RANGES[MOE_QUALITY_RANGES.length - 1];
  }, [moe]);

  const sizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  return (
    <div className={cn('space-y-2', sizeClasses[size])}>
      <div className="flex items-center justify-between">
        <span className="font-medium text-gray-700 dark:text-gray-300">Quality Rating</span>
        <span className="font-mono">{quality.emoji}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-gray-500 dark:text-gray-400">{quality.label}</span>
        <span className={cn(
          'px-2 py-0.5 rounded-full text-xs font-medium',
          quality.rating === 'excellent' && 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
          quality.rating === 'good' && 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
          quality.rating === 'acceptable' && 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
          quality.rating === 'poor' && 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
        )}>
          ±{moe}%
        </span>
      </div>
      {showDetails && (
        <p className="text-xs text-gray-500 dark:text-gray-400 italic">
          {quality.description}
        </p>
      )}
    </div>
  );
}

// Visual quality bar with ranges
interface QualityBarProps {
  value: number;
  ranges: {
    excellent: [number, number];
    good: [number, number];
    acceptable: [number, number];
    poor: [number, number];
  };
  unit?: string;
  inverted?: boolean; // For MOE, lower is better
}

export function QualityBar({ value, ranges, unit = '', inverted = false }: QualityBarProps) {
  const getPosition = () => {
    const min = Math.min(ranges.excellent[0], ranges.poor[0]);
    const max = Math.max(ranges.excellent[1], ranges.poor[1]);
    return Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  };

  const position = getPosition();

  return (
    <div className="space-y-2">
      <div className="relative h-3 rounded-full overflow-hidden flex">
        <div className={cn('flex-1', inverted ? 'bg-red-400' : 'bg-green-400')} />
        <div className="flex-1 bg-blue-400" />
        <div className="flex-1 bg-yellow-400" />
        <div className={cn('flex-1', inverted ? 'bg-green-400' : 'bg-red-400')} />
      </div>
      {/* Marker */}
      <div className="relative h-2">
        <div
          className="absolute w-3 h-3 bg-gray-900 dark:bg-white rounded-full transform -translate-x-1/2 -translate-y-1"
          style={{ left: `${position}%` }}
        />
      </div>
      {/* Labels */}
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
        <span>{inverted ? 'Excellent' : 'Poor'}</span>
        <span className="font-medium text-gray-900 dark:text-white">{value}{unit}</span>
        <span>{inverted ? 'Poor' : 'Excellent'}</span>
      </div>
    </div>
  );
}

// Cost tier indicator
interface CostTierIndicatorProps {
  tier: CostTier;
  costPerRespondent?: number;
  showMultiplier?: boolean;
}

const COST_TIER_CONFIG: Record<CostTier, { label: string; color: string; multiplier: string; bg: string }> = {
  low: { label: 'Budget-friendly', color: 'text-green-600', multiplier: '1.0x', bg: 'bg-green-100 dark:bg-green-900/30' },
  standard: { label: 'Standard', color: 'text-blue-600', multiplier: '1.3x', bg: 'bg-blue-100 dark:bg-blue-900/30' },
  medium: { label: 'Medium', color: 'text-yellow-600', multiplier: '1.6x', bg: 'bg-yellow-100 dark:bg-yellow-900/30' },
  high: { label: 'Premium', color: 'text-orange-600', multiplier: '2.0x', bg: 'bg-orange-100 dark:bg-orange-900/30' },
  premium: { label: 'Premium+', color: 'text-red-600', multiplier: '2.5x+', bg: 'bg-red-100 dark:bg-red-900/30' },
};

export function CostTierIndicator({ tier, costPerRespondent, showMultiplier = true }: CostTierIndicatorProps) {
  const config = COST_TIER_CONFIG[tier];

  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-lg', config.bg)}>
      <span className={cn('font-medium text-sm', config.color)}>{config.label}</span>
      {showMultiplier && (
        <span className="text-xs text-gray-500 dark:text-gray-400">({config.multiplier})</span>
      )}
      {costPerRespondent && (
        <span className={cn('font-semibold', config.color)}>${costPerRespondent}/resp</span>
      )}
    </div>
  );
}

// Dropout risk indicator
interface DropoutRiskIndicatorProps {
  risk: 'low' | 'medium' | 'high';
  percentage?: number;
}

export function DropoutRiskIndicator({ risk, percentage }: DropoutRiskIndicatorProps) {
  const configs = {
    low: { label: 'Low Dropout Risk', color: 'text-green-600', bg: 'bg-green-100 dark:bg-green-900/30', icon: '✓', range: '<5%' },
    medium: { label: 'Moderate Dropout Risk', color: 'text-yellow-600', bg: 'bg-yellow-100 dark:bg-yellow-900/30', icon: '⚠', range: '5-15%' },
    high: { label: 'High Dropout Risk', color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30', icon: '⚠', range: '>15%' },
  };

  const config = configs[risk];

  return (
    <div className={cn('flex items-center gap-2 px-3 py-2 rounded-lg', config.bg)}>
      <span className="text-lg">{config.icon}</span>
      <div>
        <div className={cn('font-medium text-sm', config.color)}>{config.label}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Expected: {percentage !== undefined ? `${percentage}%` : config.range}
        </div>
      </div>
    </div>
  );
}

// Reliability score indicator
interface ReliabilityIndicatorProps {
  score: 'high' | 'medium' | 'low';
  label?: string;
}

export function ReliabilityIndicator({ score, label }: ReliabilityIndicatorProps) {
  const configs = {
    high: { emoji: '🟢', text: 'High Reliability', color: 'text-green-600' },
    medium: { emoji: '🟡', text: 'Medium Reliability', color: 'text-yellow-600' },
    low: { emoji: '🔴', text: 'Low Reliability', color: 'text-red-600' },
  };

  const config = configs[score];

  return (
    <div className="flex items-center gap-2">
      <span>{config.emoji}</span>
      <span className={cn('font-medium text-sm', config.color)}>
        {label || config.text}
      </span>
    </div>
  );
}

// Balance design check indicator
interface BalanceCheckProps {
  isBalanced: boolean;
  details?: string[];
}

export function BalanceCheck({ isBalanced, details }: BalanceCheckProps) {
  return (
    <div className={cn(
      'p-3 rounded-lg border',
      isBalanced
        ? 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800'
        : 'bg-red-50 dark:bg-red-950/20 border-red-200 dark:border-red-800'
    )}>
      <div className="flex items-center gap-2 mb-2">
        <span>{isBalanced ? '✓' : '✗'}</span>
        <span className={cn(
          'font-semibold',
          isBalanced ? 'text-green-700 dark:text-green-400' : 'text-red-700 dark:text-red-400'
        )}>
          Balance Check: {isBalanced ? 'PASSED' : 'FAILED'}
        </span>
      </div>
      {details && details.length > 0 && (
        <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
          {details.map((detail, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-gray-400">├─</span>
              <span>{detail}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// Dimension score card (for feasibility)
interface DimensionScoreCardProps {
  dimension: string;
  score: number;
  notes: string;
  icon?: React.ReactNode;
}

export function DimensionScoreCard({ dimension, score, notes, icon }: DimensionScoreCardProps) {
  const getScoreColor = (s: number) => {
    if (s >= 80) return { bg: 'bg-green-500', text: 'text-green-600', emoji: '🟢' };
    if (s >= 60) return { bg: 'bg-blue-500', text: 'text-blue-600', emoji: '🔵' };
    if (s >= 40) return { bg: 'bg-yellow-500', text: 'text-yellow-600', emoji: '🟡' };
    return { bg: 'bg-red-500', text: 'text-red-600', emoji: '🔴' };
  };

  const colors = getScoreColor(score);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-medium text-gray-900 dark:text-white capitalize">{dimension}</span>
        </div>
        <div className="flex items-center gap-1">
          <span>{colors.emoji}</span>
          <span className={cn('font-bold', colors.text)}>{score}/100</span>
        </div>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
        <div className={cn('h-full rounded-full transition-all', colors.bg)} style={{ width: `${score}%` }} />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{notes}</p>
    </div>
  );
}

// Benchmark comparison table row
interface BenchmarkRowProps {
  label: string;
  yourValue: string | number;
  benchmark: string | number;
  status: 'better' | 'equal' | 'worse';
}

export function BenchmarkRow({ label, yourValue, benchmark, status }: BenchmarkRowProps) {
  const statusConfig = {
    better: { icon: '✓', color: 'text-green-600', label: 'Better' },
    equal: { icon: '≈', color: 'text-blue-600', label: 'On par' },
    worse: { icon: '⚠️', color: 'text-yellow-600', label: 'Higher' },
  };

  const config = statusConfig[status];

  return (
    <tr className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      <td className="py-2 text-sm text-gray-600 dark:text-gray-400">{label}</td>
      <td className="py-2 text-sm font-medium text-gray-900 dark:text-white text-center">{yourValue}</td>
      <td className="py-2 text-sm text-gray-500 dark:text-gray-400 text-center">{benchmark}</td>
      <td className={cn('py-2 text-sm font-medium text-center', config.color)}>
        {config.icon} {config.label}
      </td>
    </tr>
  );
}

// Export all
export {
  MOE_QUALITY_RANGES,
  COST_TIER_CONFIG,
};
