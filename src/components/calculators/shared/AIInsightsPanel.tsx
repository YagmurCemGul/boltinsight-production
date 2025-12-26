'use client';

import { useState } from 'react';
import { Lightbulb, AlertTriangle, BarChart3, Zap, ChevronDown, ChevronUp, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { AIInsight } from '@/types/calculator';

interface AIInsightsPanelProps {
  insights: AIInsight[];
  onApplyAction?: (insight: AIInsight) => void;
  maxVisible?: number;
  collapsible?: boolean;
}

const insightIcons = {
  recommendation: Lightbulb,
  warning: AlertTriangle,
  benchmark: BarChart3,
  optimization: Zap,
};

const insightColors = {
  recommendation: {
    bg: 'bg-blue-50 dark:bg-blue-950/50',
    border: 'border-blue-200 dark:border-blue-800',
    icon: 'text-blue-600 dark:text-blue-400',
    text: 'text-blue-900 dark:text-blue-100',
  },
  warning: {
    bg: 'bg-amber-50 dark:bg-amber-950/50',
    border: 'border-amber-200 dark:border-amber-800',
    icon: 'text-amber-600 dark:text-amber-400',
    text: 'text-amber-900 dark:text-amber-100',
  },
  benchmark: {
    bg: 'bg-purple-50 dark:bg-purple-950/50',
    border: 'border-purple-200 dark:border-purple-800',
    icon: 'text-purple-600 dark:text-purple-400',
    text: 'text-purple-900 dark:text-purple-100',
  },
  optimization: {
    bg: 'bg-green-50 dark:bg-green-950/50',
    border: 'border-green-200 dark:border-green-800',
    icon: 'text-green-600 dark:text-green-400',
    text: 'text-green-900 dark:text-green-100',
  },
};

export function AIInsightsPanel({
  insights,
  onApplyAction,
  maxVisible = 4,
  collapsible = true,
}: AIInsightsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [appliedActions, setAppliedActions] = useState<Set<string>>(new Set());

  if (insights.length === 0) {
    return null;
  }

  const visibleInsights = isExpanded ? insights : insights.slice(0, maxVisible);
  const hasMore = insights.length > maxVisible;

  const handleApplyAction = (insight: AIInsight) => {
    if (insight.action && onApplyAction) {
      onApplyAction(insight);
      setAppliedActions((prev) => new Set([...prev, insight.id]));
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Lightbulb className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
        <h4 className="font-semibold text-gray-900 dark:text-white">AI Insights</h4>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          ({insights.length})
        </span>
      </div>

      <div className="space-y-2">
        {visibleInsights.map((insight) => {
          const Icon = insightIcons[insight.type];
          const colors = insightColors[insight.type];
          const isApplied = appliedActions.has(insight.id);

          return (
            <div
              key={insight.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border',
                colors.bg,
                colors.border
              )}
            >
              <Icon className={cn('w-5 h-5 flex-shrink-0 mt-0.5', colors.icon)} />
              <div className="flex-1 min-w-0">
                <p className={cn('text-sm', colors.text)}>
                  {insight.message}
                </p>
                {insight.action && onApplyAction && (
                  <button
                    onClick={() => handleApplyAction(insight)}
                    disabled={isApplied}
                    className={cn(
                      'mt-2 inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors',
                      isApplied
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 cursor-default'
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-600'
                    )}
                  >
                    {isApplied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Applied
                      </>
                    ) : (
                      insight.action.label
                    )}
                  </button>
                )}
              </div>
              {insight.confidence >= 0.9 && (
                <span className="text-xs text-gray-400 dark:text-gray-500 flex-shrink-0">
                  High confidence
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Expand/Collapse button */}
      {hasMore && collapsible && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-1 text-sm text-[#5B50BD] dark:text-[#918AD3] hover:underline"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              Show {insights.length - maxVisible} more
            </>
          )}
        </button>
      )}
    </div>
  );
}

// Compact version for inline display
interface AIInsightBadgeProps {
  insight: AIInsight;
  onClick?: () => void;
}

export function AIInsightBadge({ insight, onClick }: AIInsightBadgeProps) {
  const Icon = insightIcons[insight.type];
  const colors = insightColors[insight.type];

  return (
    <button
      onClick={onClick}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium',
        colors.bg,
        colors.text,
        'hover:opacity-80 transition-opacity'
      )}
    >
      <Icon className={cn('w-3.5 h-3.5', colors.icon)} />
      <span className="max-w-[150px] truncate">{insight.message}</span>
    </button>
  );
}
