'use client';

import { useState } from 'react';
import {
  Sparkles,
  Lightbulb,
  AlertTriangle,
  TrendingUp,
  BarChart2,
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Info,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui';
import type { AIInsight } from '@/types/calculator';
import { cn } from '@/lib/utils';

interface AIRecommendationCardProps {
  insight: AIInsight;
  onApply?: (insight: AIInsight) => void;
  onDismiss?: (insight: AIInsight) => void;
  compact?: boolean;
}

const INSIGHT_ICONS = {
  recommendation: Lightbulb,
  warning: AlertTriangle,
  optimization: TrendingUp,
  benchmark: BarChart2,
};

const INSIGHT_COLORS = {
  recommendation: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-800 dark:text-blue-300',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    text: 'text-amber-800 dark:text-amber-300',
  },
  optimization: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-800 dark:text-green-300',
  },
  benchmark: {
    bg: 'bg-purple-50 dark:bg-purple-950/20',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
    text: 'text-purple-800 dark:text-purple-300',
  },
};

export function AIRecommendationCard({
  insight,
  onApply,
  onDismiss,
  compact = false,
}: AIRecommendationCardProps) {
  const [isExpanded, setIsExpanded] = useState(!compact);
  const [isApplied, setIsApplied] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) return null;

  const Icon = INSIGHT_ICONS[insight.type];
  const colors = INSIGHT_COLORS[insight.type];
  const confidencePercent = Math.round(insight.confidence * 100);

  const handleApply = () => {
    setIsApplied(true);
    onApply?.(insight);
  };

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.(insight);
  };

  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-lg border',
        colors.bg,
        colors.border
      )}>
        <Icon className={cn('w-4 h-4 flex-shrink-0', colors.icon)} />
        <span className={cn('text-sm flex-1', colors.text)}>{insight.message}</span>
        {insight.action && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleApply}
            disabled={isApplied}
            className="text-xs"
          >
            {isApplied ? <Check className="w-3 h-3" /> : insight.action.label}
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className={cn(
      'rounded-xl border overflow-hidden',
      colors.bg,
      colors.border
    )}>
      {/* Header */}
      <div
        className={cn(
          'flex items-start gap-3 p-4 cursor-pointer',
          'hover:bg-white/50 dark:hover:bg-black/10 transition-colors'
        )}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          colors.bg,
          'border',
          colors.border
        )}>
          <Icon className={cn('w-5 h-5', colors.icon)} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs font-semibold uppercase tracking-wider', colors.icon)}>
              {insight.type}
            </span>
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {confidencePercent}% confidence
            </span>
          </div>
          <p className={cn('text-sm', colors.text)}>{insight.message}</p>
        </div>

        <button className="p-1">
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-3">
          {/* Confidence bar */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">Confidence</span>
            <div className="flex-1 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  confidencePercent >= 80 && 'bg-green-500',
                  confidencePercent >= 60 && confidencePercent < 80 && 'bg-blue-500',
                  confidencePercent < 60 && 'bg-amber-500'
                )}
                style={{ width: `${confidencePercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              {confidencePercent}%
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2">
            {insight.action && (
              <Button
                size="sm"
                onClick={handleApply}
                disabled={isApplied}
                className={cn(
                  isApplied && 'bg-green-600 hover:bg-green-600'
                )}
              >
                {isApplied ? (
                  <>
                    <Check className="w-4 h-4 mr-1" />
                    Applied
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-1" />
                    {insight.action.label}
                  </>
                )}
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={handleDismiss}
            >
              <X className="w-4 h-4 mr-1" />
              Dismiss
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

// AI Insights summary panel
interface AIInsightsSummaryProps {
  insights: AIInsight[];
  onApply?: (insight: AIInsight) => void;
  title?: string;
  maxVisible?: number;
}

export function AIInsightsSummary({
  insights,
  onApply,
  title = 'AI Recommendations',
  maxVisible = 3,
}: AIInsightsSummaryProps) {
  const [showAll, setShowAll] = useState(false);

  if (insights.length === 0) return null;

  const visibleInsights = showAll ? insights : insights.slice(0, maxVisible);
  const hiddenCount = insights.length - maxVisible;

  // Sort by type priority
  const typePriority = { warning: 0, optimization: 1, recommendation: 2, benchmark: 3 };
  const sortedInsights = [...visibleInsights].sort(
    (a, b) => typePriority[a.type] - typePriority[b.type]
  );

  return (
    <div className="bg-gradient-to-br from-[#EDE9F9] to-[#E5F7F5] dark:from-[#231E51] dark:to-[#1A3A35] rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-[#5B50BD]" />
        <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        <span className="text-xs px-2 py-0.5 bg-[#5B50BD]/20 text-[#5B50BD] dark:text-[#918AD3] rounded-full">
          {insights.length} insights
        </span>
      </div>

      <div className="space-y-2">
        {sortedInsights.map((insight) => (
          <AIRecommendationCard
            key={insight.id}
            insight={insight}
            onApply={onApply}
            compact
          />
        ))}
      </div>

      {hiddenCount > 0 && !showAll && (
        <button
          onClick={() => setShowAll(true)}
          className="mt-3 text-sm text-[#5B50BD] dark:text-[#918AD3] hover:underline"
        >
          Show {hiddenCount} more insights
        </button>
      )}

      {showAll && insights.length > maxVisible && (
        <button
          onClick={() => setShowAll(false)}
          className="mt-3 text-sm text-[#5B50BD] dark:text-[#918AD3] hover:underline"
        >
          Show less
        </button>
      )}
    </div>
  );
}

// AI badge for headers
export function AIBadgeIndicator({ count }: { count: number }) {
  if (count === 0) return null;

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#5B50BD]/10 text-[#5B50BD] dark:text-[#918AD3] text-xs font-medium rounded-full">
      <Sparkles className="w-3 h-3" />
      {count} AI {count === 1 ? 'insight' : 'insights'}
    </span>
  );
}

// Quick insight banner - can accept either an AIInsight or simple type/message
interface QuickInsightBannerProps {
  insight?: AIInsight;
  type?: 'info' | 'success' | 'warning' | 'recommendation' | 'optimization' | 'benchmark';
  message?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}

const SIMPLE_COLORS = {
  info: {
    bg: 'bg-blue-50 dark:bg-blue-950/20',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-800 dark:text-blue-300',
  },
  success: {
    bg: 'bg-green-50 dark:bg-green-950/20',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-800 dark:text-green-300',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/20',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    text: 'text-amber-800 dark:text-amber-300',
  },
};

export function QuickInsightBanner({ insight, type, message, onAction, onDismiss }: QuickInsightBannerProps) {
  // If insight is provided, use it; otherwise use type/message props
  const displayType = insight?.type || type || 'info';
  const displayMessage = insight?.message || message || '';

  // Get colors based on type
  const colors = insight
    ? INSIGHT_COLORS[insight.type]
    : SIMPLE_COLORS[displayType as keyof typeof SIMPLE_COLORS] || SIMPLE_COLORS.info;

  // Get icon based on type
  const Icon = insight
    ? INSIGHT_ICONS[insight.type]
    : (displayType === 'info' ? Info : displayType === 'success' ? Check : displayType === 'warning' ? AlertTriangle : Lightbulb);

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-3 rounded-lg border',
      colors.bg,
      colors.border
    )}>
      <Icon className={cn('w-5 h-5 flex-shrink-0', colors.icon)} />
      <p className={cn('flex-1 text-sm', colors.text)}>{displayMessage}</p>
      {insight?.action && onAction && (
        <Button size="sm" onClick={onAction}>
          {insight.action.label}
        </Button>
      )}
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="p-1 hover:bg-white/50 dark:hover:bg-black/20 rounded"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      )}
    </div>
  );
}
