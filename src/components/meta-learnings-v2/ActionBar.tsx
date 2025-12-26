'use client';

import { cn } from '@/lib/utils';
import { FileText, Mail, Plus, ExternalLink, Copy, Share2 } from 'lucide-react';
import { Button } from '@/components/ui';
import type { ActionBarProps, ActionItem } from './types';

const ACTION_ICON_MAP: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-3 h-3" />,
  email: <Mail className="w-3 h-3" />,
  share: <Share2 className="w-3 h-3" />,
  proposal: <Plus className="w-3 h-3" />,
  detail: <ExternalLink className="w-3 h-3" />,
  copy: <Copy className="w-3 h-3" />,
};

function getButtonVariant(variant: ActionItem['variant']): 'default' | 'outline' | 'ghost' {
  switch (variant) {
    case 'primary':
      return 'default';
    case 'secondary':
      return 'outline';
    case 'ghost':
      return 'ghost';
    default:
      return 'outline';
  }
}

export function ActionBar({
  actions,
  position = 'inline',
  className,
}: ActionBarProps) {
  if (actions.length === 0) return null;

  const containerClasses = cn(
    'flex items-center gap-1.5 flex-wrap',
    position === 'fixed' && [
      'fixed bottom-0 left-0 right-0',
      'p-3 bg-white dark:bg-[#1A163C]',
      'border-t border-gray-200 dark:border-gray-700',
      'shadow-lg',
    ],
    className
  );

  return (
    <div className={containerClasses}>
      {actions.map((action) => {
        const icon = action.icon ? ACTION_ICON_MAP[action.icon] : null;
        const buttonVariant = getButtonVariant(action.variant);

        return (
          <Button
            key={action.id}
            variant={buttonVariant}
            size="sm"
            onClick={action.onClick}
            className={cn(
              'gap-1 h-7 px-2 text-xs',
              action.variant === 'primary' && [
                'bg-[#5B50BD] hover:bg-[#4A41A0]',
                'dark:bg-[#918AD3] dark:hover:bg-[#A8A2DE] dark:text-[#100E28]',
              ]
            )}
          >
            {icon}
            <span>{action.label}</span>
          </Button>
        );
      })}
    </div>
  );
}
