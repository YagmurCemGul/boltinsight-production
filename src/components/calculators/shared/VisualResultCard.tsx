'use client';

import { ReactNode } from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { QualityRating, FeasibilityVerdict } from '@/types/calculator';

// Quality indicator with emoji circles
interface QualityCirclesProps {
  rating: QualityRating;
  showLabel?: boolean;
}

export function QualityCircles({ rating, showLabel = true }: QualityCirclesProps) {
  const configs: Record<QualityRating, { filled: number; label: string; color: string }> = {
    excellent: { filled: 5, label: 'Excellent', color: 'text-green-500' },
    good: { filled: 4, label: 'Very Good', color: 'text-blue-500' },
    acceptable: { filled: 3, label: 'Good', color: 'text-yellow-500' },
    poor: { filled: 1, label: 'Poor', color: 'text-red-500' },
  };

  const config = configs[rating];

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={i <= config.filled ? config.color : 'text-gray-300 dark:text-gray-600'}>
            {i <= config.filled ? '●' : '○'}
          </span>
        ))}
      </div>
      {showLabel && (
        <span className={cn('text-sm font-medium', config.color)}>{config.label}</span>
      )}
    </div>
  );
}

// Feasibility verdict badge
interface VerdictBadgeProps {
  verdict: FeasibilityVerdict;
  score?: number;
}

export function VerdictBadge({ verdict, score }: VerdictBadgeProps) {
  const configs: Record<FeasibilityVerdict, { label: string; bgColor: string; textColor: string; icon: typeof CheckCircle }> = {
    green: { label: 'ACHIEVABLE', bgColor: 'bg-green-100 dark:bg-green-900/30', textColor: 'text-green-700 dark:text-green-400', icon: CheckCircle },
    yellow: { label: 'PROCEED WITH CAUTION', bgColor: 'bg-yellow-100 dark:bg-yellow-900/30', textColor: 'text-yellow-700 dark:text-yellow-400', icon: AlertTriangle },
    red: { label: 'HIGH RISK', bgColor: 'bg-red-100 dark:bg-red-900/30', textColor: 'text-red-700 dark:text-red-400', icon: XCircle },
  };

  const config = configs[verdict];
  const Icon = config.icon;

  return (
    <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-full', config.bgColor)}>
      <Icon className={cn('w-4 h-4', config.textColor)} />
      <span className={cn('text-sm font-semibold', config.textColor)}>{config.label}</span>
      {score !== undefined && (
        <span className={cn('text-sm', config.textColor)}>({score}/100)</span>
      )}
    </div>
  );
}

// Progress bar with segments
interface ProgressBarProps {
  value: number;
  max?: number;
  showPercentage?: boolean;
  colorScheme?: 'default' | 'quality' | 'feasibility';
  size?: 'sm' | 'md' | 'lg';
}

export function ProgressBar({ value, max = 100, showPercentage = true, colorScheme = 'default', size = 'md' }: ProgressBarProps) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const getColor = () => {
    if (colorScheme === 'quality') {
      if (percentage >= 70) return 'bg-green-500';
      if (percentage >= 40) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    if (colorScheme === 'feasibility') {
      if (percentage >= 70) return 'bg-green-500';
      if (percentage >= 40) return 'bg-yellow-500';
      return 'bg-red-500';
    }
    return 'bg-[#5B50BD]';
  };

  const heights = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };

  return (
    <div className="w-full">
      <div className={cn('w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden', heights[size])}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', getColor())}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {showPercentage && (
        <div className="flex justify-between mt-1 text-xs text-gray-500 dark:text-gray-400">
          <span>0</span>
          <span className="font-medium">{Math.round(percentage)}%</span>
          <span>{max}</span>
        </div>
      )}
    </div>
  );
}

// Summary box with ASCII-style border
interface SummaryBoxProps {
  title: string;
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
}

export function SummaryBox({ title, children, variant = 'default' }: SummaryBoxProps) {
  const variants = {
    default: 'border-gray-300 dark:border-gray-600',
    success: 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950/20',
    warning: 'border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-950/20',
    error: 'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950/20',
    info: 'border-blue-400 dark:border-blue-600 bg-blue-50 dark:bg-blue-950/20',
  };

  return (
    <div className={cn('border-2 rounded-lg overflow-hidden', variants[variant])}>
      <div className={cn(
        'px-4 py-2 border-b-2 font-mono text-sm font-bold',
        variant === 'default' ? 'bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600' :
        variant === 'success' ? 'bg-green-100 dark:bg-green-900/30 border-green-400 dark:border-green-600 text-green-800 dark:text-green-300' :
        variant === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-400 dark:border-yellow-600 text-yellow-800 dark:text-yellow-300' :
        variant === 'error' ? 'bg-red-100 dark:bg-red-900/30 border-red-400 dark:border-red-600 text-red-800 dark:text-red-300' :
        'bg-blue-100 dark:bg-blue-900/30 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-300'
      )}>
        {title}
      </div>
      <div className="p-4 font-mono text-sm">
        {children}
      </div>
    </div>
  );
}

// Tree-style list item
interface TreeItemProps {
  label: string;
  value: string | number;
  isLast?: boolean;
  indent?: number;
  highlight?: boolean;
}

export function TreeItem({ label, value, isLast = false, indent = 0, highlight = false }: TreeItemProps) {
  const prefix = isLast ? '└─' : '├─';
  const indentStr = '│  '.repeat(indent);

  return (
    <div className={cn(
      'font-mono text-sm py-0.5',
      highlight && 'bg-yellow-100 dark:bg-yellow-900/20 -mx-2 px-2 rounded'
    )}>
      <span className="text-gray-400 dark:text-gray-500">{indentStr}{prefix}</span>
      <span className="text-gray-600 dark:text-gray-400"> {label}: </span>
      <span className="text-gray-900 dark:text-white font-semibold">{value}</span>
    </div>
  );
}

// Main visual result card
interface VisualResultCardProps {
  title: string;
  mainValue: string | number;
  mainLabel: string;
  qualityRating?: QualityRating;
  verdict?: FeasibilityVerdict;
  score?: number;
  description?: string;
  treeItems?: Array<{ label: string; value: string | number; highlight?: boolean }>;
  aiInsight?: string;
  colorScheme?: 'blue' | 'green' | 'purple' | 'amber' | 'teal';
}

export function VisualResultCard({
  title,
  mainValue,
  mainLabel,
  qualityRating,
  verdict,
  score,
  description,
  treeItems,
  aiInsight,
  colorScheme = 'blue',
}: VisualResultCardProps) {
  const colors = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    purple: 'from-[#5B50BD] to-[#7B6DD8]',
    amber: 'from-amber-500 to-amber-600',
    teal: 'from-teal-500 to-teal-600',
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className={cn('bg-gradient-to-r p-4 text-white', colors[colorScheme])}>
        <h3 className="text-lg font-bold">{title}</h3>
      </div>

      {/* Main content */}
      <div className="p-6">
        {/* Main value display */}
        <div className="text-center mb-6">
          <div className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            {mainValue}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {mainLabel}
          </div>
        </div>

        {/* Quality or Verdict indicator */}
        {qualityRating && (
          <div className="flex justify-center mb-4">
            <QualityCircles rating={qualityRating} />
          </div>
        )}

        {verdict && (
          <div className="flex justify-center mb-4">
            <VerdictBadge verdict={verdict} score={score} />
          </div>
        )}

        {/* Progress bar for score */}
        {score !== undefined && (
          <div className="mb-6">
            <ProgressBar value={score} colorScheme="feasibility" size="lg" />
          </div>
        )}

        {/* Description */}
        {description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 text-center mb-6">
            {description}
          </p>
        )}

        {/* Tree items */}
        {treeItems && treeItems.length > 0 && (
          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 mb-4">
            {treeItems.map((item, index) => (
              <TreeItem
                key={index}
                label={item.label}
                value={item.value}
                isLast={index === treeItems.length - 1}
                highlight={item.highlight}
              />
            ))}
          </div>
        )}

        {/* AI Insight */}
        {aiInsight && (
          <div className="flex items-start gap-2 p-3 bg-[#EDE9F9] dark:bg-[#231E51] rounded-lg">
            <Info className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3] flex-shrink-0 mt-0.5" />
            <p className="text-sm text-gray-700 dark:text-gray-300">{aiInsight}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// Metric comparison card
interface MetricComparisonProps {
  label: string;
  currentValue: number | string;
  targetValue?: number | string;
  benchmark?: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'neutral';
  description?: string;
}

export function MetricComparison({
  label,
  currentValue,
  targetValue,
  benchmark,
  unit = '',
  trend,
  description,
}: MetricComparisonProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">{label}</div>
      <div className="flex items-center gap-2">
        <span className="text-2xl font-bold text-gray-900 dark:text-white">
          {currentValue}{unit}
        </span>
        {trend === 'up' && <TrendingUp className="w-5 h-5 text-green-500" />}
        {trend === 'down' && <TrendingDown className="w-5 h-5 text-red-500" />}
      </div>
      {(targetValue || benchmark) && (
        <div className="mt-2 text-xs text-gray-500 dark:text-gray-400 space-y-1">
          {targetValue && <div>Target: {targetValue}{unit}</div>}
          {benchmark && <div>Benchmark: {benchmark}{unit}</div>}
        </div>
      )}
      {description && (
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">{description}</p>
      )}
    </div>
  );
}

// Risk indicator card
interface RiskCardProps {
  level: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  mitigation?: string;
}

export function RiskCard({ level, title, description, mitigation }: RiskCardProps) {
  const configs = {
    high: { bg: 'bg-red-50 dark:bg-red-950/20', border: 'border-red-200 dark:border-red-800', icon: '🔴', label: 'HIGH' },
    medium: { bg: 'bg-yellow-50 dark:bg-yellow-950/20', border: 'border-yellow-200 dark:border-yellow-800', icon: '🟡', label: 'MEDIUM' },
    low: { bg: 'bg-green-50 dark:bg-green-950/20', border: 'border-green-200 dark:border-green-800', icon: '🟢', label: 'LOW' },
  };

  const config = configs[level];

  return (
    <div className={cn('rounded-lg border p-4', config.bg, config.border)}>
      <div className="flex items-center gap-2 mb-2">
        <span>{config.icon}</span>
        <span className="text-xs font-bold text-gray-500 dark:text-gray-400">{config.label} RISK</span>
      </div>
      <h4 className="font-semibold text-gray-900 dark:text-white mb-1">{title}</h4>
      <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{description}</p>
      {mitigation && (
        <div className="text-sm">
          <span className="font-medium text-gray-700 dark:text-gray-300">Mitigation: </span>
          <span className="text-gray-600 dark:text-gray-400">{mitigation}</span>
        </div>
      )}
    </div>
  );
}

