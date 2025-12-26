'use client';

import { memo } from 'react';
import { cn } from '@/lib/utils';
import { Target, AlertTriangle, TrendingUp, Lightbulb, TrendingDown, Minus } from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';
import { ActionBar } from './ActionBar';
import { INSIGHT_CONFIG, TREND_ICONS } from './constants';
import type { InsightCardProps, InsightType, MetricData, TrendDirection } from './types';

const INSIGHT_ICONS: Record<InsightType, React.ReactNode> = {
  opportunity: <Target className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  trend: <TrendingUp className="w-4 h-4" />,
  recommendation: <Lightbulb className="w-4 h-4" />,
};

const MetricDisplay = memo(function MetricDisplay({ metric }: { metric: MetricData }) {
  const trendConfig: Record<TrendDirection, { icon: React.ReactNode; color: string }> = {
    up: {
      icon: <TrendingUp className="w-2.5 h-2.5" />,
      color: 'text-emerald-600 dark:text-emerald-400',
    },
    down: {
      icon: <TrendingDown className="w-2.5 h-2.5" />,
      color: 'text-amber-600 dark:text-amber-400',
    },
    neutral: {
      icon: <Minus className="w-2.5 h-2.5" />,
      color: 'text-gray-500 dark:text-gray-400',
    },
  };

  return (
    <div className="flex flex-col items-center p-2 bg-white dark:bg-gray-800/50 rounded-lg">
      <div className="flex items-center gap-0.5">
        <span className="text-sm font-bold text-gray-900 dark:text-gray-100">
          {metric.value}
        </span>
        {metric.trend && (
          <span className={cn('flex items-center gap-0.5', trendConfig[metric.trend].color)}>
            {trendConfig[metric.trend].icon}
            {metric.change !== undefined && (
              <span className="text-[10px]">
                {metric.change > 0 ? '+' : ''}{metric.change}%
              </span>
            )}
          </span>
        )}
      </div>
      <span className="text-[10px] text-gray-500 dark:text-gray-400 text-center mt-0.5">
        {metric.label}
      </span>
    </div>
  );
});

export const InsightCard = memo(function InsightCard({
  insight,
  onActionClick,
  className,
}: InsightCardProps) {
  const config = INSIGHT_CONFIG[insight.type];

  return (
    <div
      className={cn(
        'rounded-lg border-l-3 overflow-hidden',
        'bg-white dark:bg-[#1F2937]',
        'border border-gray-200 dark:border-gray-700',
        config.borderColor,
        className
      )}
    >
      {/* Header - compact */}
      <div className={cn(
        'px-3 py-2 flex items-center justify-between',
        config.bgColor,
        config.darkBgColor
      )}>
        <div className="flex items-center gap-1.5">
          <span className={cn(
            'flex items-center justify-center w-6 h-6 rounded-md',
            insight.type === 'opportunity' && 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
            insight.type === 'warning' && 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
            insight.type === 'trend' && 'bg-purple-100 text-purple-600 dark:bg-purple-900/50 dark:text-purple-400',
            insight.type === 'recommendation' && 'bg-blue-100 text-blue-600 dark:bg-blue-900/50 dark:text-blue-400'
          )}>
            {INSIGHT_ICONS[insight.type]}
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-gray-600 dark:text-gray-400">
            {config.label}
          </span>
        </div>
        <ConfidenceBadge level={insight.confidence} size="sm" />
      </div>

      {/* Content - compact */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {insight.title}
        </h3>
        <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">
          {insight.description}
        </p>

        {/* Metrics - compact */}
        {insight.metrics && insight.metrics.length > 0 && (
          <div className={cn(
            'grid gap-1.5 mb-3',
            insight.metrics.length === 1 && 'grid-cols-1',
            insight.metrics.length === 2 && 'grid-cols-2',
            insight.metrics.length >= 3 && 'grid-cols-3'
          )}>
            {insight.metrics.map((metric, index) => (
              <MetricDisplay key={index} metric={metric} />
            ))}
          </div>
        )}

        {/* Actions */}
        {insight.actions && insight.actions.length > 0 && (
          <ActionBar
            actions={insight.actions.map(action => ({
              ...action,
              onClick: () => onActionClick?.(action),
            }))}
          />
        )}
      </div>
    </div>
  );
});
