'use client';

import { cn } from '@/lib/utils';
import type { ReactNode, HTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';
import { FileText, FolderOpen, Search, Inbox, Database, Users } from 'lucide-react';
import { Button } from './button';

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: 'default' | 'primary' | 'secondary' | 'outline';
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  size?: 'sm' | 'md' | 'lg';
  preset?: 'proposals' | 'projects' | 'search' | 'inbox' | 'data' | 'team';
}

const presetConfigs = {
  proposals: {
    icon: FileText,
    title: 'No proposals yet',
    description: 'Create your first proposal to get started with your research project.',
  },
  projects: {
    icon: FolderOpen,
    title: 'No projects found',
    description: 'Organize your proposals by creating a project.',
  },
  search: {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search terms or filters.',
  },
  inbox: {
    icon: Inbox,
    title: 'Your inbox is empty',
    description: 'New notifications will appear here.',
  },
  data: {
    icon: Database,
    title: 'No data available',
    description: 'Data will appear here once available.',
  },
  team: {
    icon: Users,
    title: 'No team members',
    description: 'Invite team members to collaborate on projects.',
  },
};

const sizeClasses = {
  sm: {
    container: 'py-8 px-4',
    icon: 'w-10 h-10',
    iconContainer: 'w-16 h-16',
    title: 'text-base',
    description: 'text-sm',
  },
  md: {
    container: 'py-12 px-6',
    icon: 'w-12 h-12',
    iconContainer: 'w-20 h-20',
    title: 'text-lg',
    description: 'text-sm',
  },
  lg: {
    container: 'py-16 px-8',
    icon: 'w-16 h-16',
    iconContainer: 'w-24 h-24',
    title: 'text-xl',
    description: 'text-base',
  },
};

/**
 * EmptyState - Placeholder component for empty content areas
 *
 * Usage:
 * <EmptyState
 *   preset="proposals"
 *   action={{ label: "Create Proposal", onClick: handleCreate }}
 * />
 *
 * Custom:
 * <EmptyState
 *   icon={FileText}
 *   title="No documents"
 *   description="Upload your first document"
 *   action={{ label: "Upload", onClick: handleUpload }}
 * />
 */
export function EmptyState({
  icon: CustomIcon,
  title: customTitle,
  description: customDescription,
  action,
  secondaryAction,
  size = 'md',
  preset,
  className,
  ...props
}: EmptyStateProps) {
  const presetConfig = preset ? presetConfigs[preset] : null;

  const Icon = CustomIcon || presetConfig?.icon || FileText;
  const title = customTitle || presetConfig?.title || 'No items';
  const description = customDescription || presetConfig?.description;

  const sizes = sizeClasses[size];

  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        sizes.container,
        className
      )}
      {...props}
    >
      {/* Icon container with subtle background */}
      <div
        className={cn(
          'flex items-center justify-center rounded-full mb-4',
          'bg-gray-100 dark:bg-[#231E51]',
          sizes.iconContainer
        )}
      >
        <Icon
          className={cn(
            'text-gray-400 dark:text-gray-500',
            sizes.icon
          )}
        />
      </div>

      {/* Title */}
      <h3
        className={cn(
          'font-semibold text-gray-900 dark:text-gray-100 mb-2',
          sizes.title
        )}
      >
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p
          className={cn(
            'text-gray-500 dark:text-gray-400 max-w-sm mb-6',
            sizes.description
          )}
        >
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex items-center gap-3">
          {action && (
            <Button
              variant={action.variant || 'primary'}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          )}
          {secondaryAction && (
            <Button
              variant="ghost"
              onClick={secondaryAction.onClick}
            >
              {secondaryAction.label}
            </Button>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * EmptyStateInline - Compact inline empty state for smaller areas
 */
export function EmptyStateInline({
  icon: Icon = Inbox,
  message = 'No items',
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  icon?: LucideIcon;
  message?: string;
}) {
  return (
    <div
      className={cn(
        'flex items-center justify-center gap-2 py-4 text-gray-500 dark:text-gray-400',
        className
      )}
      {...props}
    >
      <Icon className="w-4 h-4" />
      <span className="text-sm">{message}</span>
    </div>
  );
}
