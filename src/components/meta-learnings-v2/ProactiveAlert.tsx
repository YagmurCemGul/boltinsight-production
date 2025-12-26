'use client';

import { cn } from '@/lib/utils';
import { AlertTriangle, Lightbulb, TrendingUp, Bell, X } from 'lucide-react';
import { Button } from '@/components/ui';
import type { ProactiveAlertProps, AlertType } from './types';

const ALERT_CONFIG: Record<AlertType, { icon: React.ReactNode; colors: string; borderColor: string }> = {
  warning: {
    icon: <AlertTriangle className="w-4 h-4" />,
    colors: 'text-amber-600 dark:text-amber-400',
    borderColor: 'border-l-amber-500 dark:border-l-amber-400',
  },
  opportunity: {
    icon: <TrendingUp className="w-4 h-4" />,
    colors: 'text-emerald-600 dark:text-emerald-400',
    borderColor: 'border-l-emerald-500 dark:border-l-emerald-400',
  },
  insight: {
    icon: <Lightbulb className="w-4 h-4" />,
    colors: 'text-blue-600 dark:text-blue-400',
    borderColor: 'border-l-blue-500 dark:border-l-blue-400',
  },
  reminder: {
    icon: <Bell className="w-4 h-4" />,
    colors: 'text-purple-600 dark:text-purple-400',
    borderColor: 'border-l-purple-500 dark:border-l-purple-400',
  },
};

const PRIORITY_STYLES: Record<string, string> = {
  high: 'bg-red-50 dark:bg-red-900/10',
  medium: 'bg-amber-50 dark:bg-amber-900/10',
  low: 'bg-gray-50 dark:bg-gray-800/50',
};

export function ProactiveAlert({
  alert,
  onAction,
  onDismiss,
  className,
}: ProactiveAlertProps) {
  const config = ALERT_CONFIG[alert.type];
  const priorityStyle = PRIORITY_STYLES[alert.priority] || PRIORITY_STYLES.low;

  return (
    <div
      className={cn(
        'relative rounded-lg border-l-4 overflow-hidden',
        'bg-white dark:bg-[#1F2937]',
        'border border-gray-200 dark:border-gray-700',
        config.borderColor,
        priorityStyle,
        'shadow-sm',
        'animate-in slide-in-from-right-2 duration-300',
        className
      )}
    >
      <div className="p-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2">
            <div className={cn('flex-shrink-0', config.colors)}>
              {config.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                {alert.title}
              </h4>
            </div>
          </div>

          {alert.dismissable && (
            <button
              onClick={onDismiss}
              className={cn(
                'flex-shrink-0 p-1 rounded-md',
                'hover:bg-gray-100 dark:hover:bg-gray-700',
                'transition-colors'
              )}
              aria-label="Dismiss alert"
            >
              <X className="w-3.5 h-3.5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Description */}
        <p className="mt-1.5 text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
          {alert.description}
        </p>

        {/* Actions */}
        {alert.actions.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            {alert.actions.map((action) => (
              <Button
                key={action.id}
                variant={action.variant === 'primary' ? 'default' : action.variant === 'ghost' ? 'ghost' : 'outline'}
                size="sm"
                onClick={() => onAction?.(action.id)}
                className={cn(
                  'h-7 px-2.5 text-xs',
                  action.variant === 'primary' && [
                    'bg-[#5B50BD] hover:bg-[#4A41A0]',
                    'dark:bg-[#918AD3] dark:hover:bg-[#A8A2DE] dark:text-[#100E28]',
                  ]
                )}
              >
                {action.label}
              </Button>
            ))}
          </div>
        )}

        {/* Priority indicator */}
        {alert.priority === 'high' && (
          <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-bl-sm" />
        )}
      </div>
    </div>
  );
}
