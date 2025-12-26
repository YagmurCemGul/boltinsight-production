'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Bell, ChevronDown, ChevronUp, X } from 'lucide-react';
import { Button } from '@/components/ui';
import { ProactiveAlert } from './ProactiveAlert';
import type { AlertsPanelProps } from './types';

export function AlertsPanel({
  alerts,
  onAction,
  onDismiss,
  onDismissAll,
  className,
}: AlertsPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  // Sort alerts by priority (high first) and timestamp
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  const highPriorityCount = alerts.filter(a => a.priority === 'high').length;

  if (alerts.length === 0) return null;

  return (
    <div
      className={cn(
        'rounded-lg border overflow-hidden',
        'border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-[#1A163C]',
        'shadow-sm',
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2',
          'bg-gray-50 dark:bg-[#1A163C]',
          'border-b border-gray-200 dark:border-gray-700',
          'hover:bg-gray-100 dark:hover:bg-[#252149]',
          'transition-colors'
        )}
      >
        <div className="flex items-center gap-2">
          <div className="relative">
            <Bell className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3]" />
            {highPriorityCount > 0 && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full text-[8px] text-white font-bold flex items-center justify-center">
                {highPriorityCount}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
            Alerts ({alerts.length})
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isExpanded && alerts.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                onDismissAll?.();
              }}
              className="h-6 px-2 text-[10px] text-gray-500 hover:text-gray-700"
            >
              Dismiss All
            </Button>
          )}
          {isExpanded ? (
            <ChevronUp className="w-4 h-4 text-gray-400" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-400" />
          )}
        </div>
      </button>

      {/* Alert List */}
      {isExpanded && (
        <div className="p-2 space-y-2 max-h-[300px] overflow-y-auto">
          {sortedAlerts.map((alert) => (
            <ProactiveAlert
              key={alert.id}
              alert={alert}
              onAction={(actionId) => onAction?.(alert.id, actionId)}
              onDismiss={() => onDismiss?.(alert.id)}
            />
          ))}
        </div>
      )}

      {/* Collapsed Summary */}
      {!isExpanded && highPriorityCount > 0 && (
        <div className="px-3 py-2 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/10">
          {highPriorityCount} high priority alert{highPriorityCount > 1 ? 's' : ''} require attention
        </div>
      )}
    </div>
  );
}
