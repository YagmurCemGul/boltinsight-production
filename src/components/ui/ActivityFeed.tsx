'use client';

import { type ReactNode } from 'react';
import {
  FileText,
  FolderOpen,
  MessageSquare,
  Check,
  Send,
  Edit,
  Trash2,
  UserPlus,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { Skeleton } from './Skeleton';

export type ActivityType =
  | 'proposal_created'
  | 'proposal_updated'
  | 'proposal_submitted'
  | 'proposal_approved'
  | 'proposal_deleted'
  | 'project_created'
  | 'comment_added'
  | 'member_added';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string | Date;
  user?: {
    name: string;
    avatar?: string;
  };
  link?: string;
}

const activityConfig: Record<ActivityType, { icon: typeof FileText; color: string; bgColor: string }> = {
  proposal_created: {
    icon: FileText,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-900/30',
  },
  proposal_updated: {
    icon: Edit,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-50 dark:bg-amber-900/30',
  },
  proposal_submitted: {
    icon: Send,
    color: 'text-[#5B50BD] dark:text-[#918AD3]',
    bgColor: 'bg-[#EDE9F9] dark:bg-[#231E51]',
  },
  proposal_approved: {
    icon: Check,
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-50 dark:bg-emerald-900/30',
  },
  proposal_deleted: {
    icon: Trash2,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/30',
  },
  project_created: {
    icon: FolderOpen,
    color: 'text-indigo-600 dark:text-indigo-400',
    bgColor: 'bg-indigo-50 dark:bg-indigo-900/30',
  },
  comment_added: {
    icon: MessageSquare,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
  },
  member_added: {
    icon: UserPlus,
    color: 'text-teal-600 dark:text-teal-400',
    bgColor: 'bg-teal-50 dark:bg-teal-900/30',
  },
};

function formatTimestamp(timestamp: string | Date): string {
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
  showTimeline?: boolean;
  onItemClick?: (item: ActivityItem) => void;
  className?: string;
}

/**
 * ActivityFeed - Timeline of recent activities
 *
 * Usage:
 * <ActivityFeed
 *   activities={[
 *     { id: '1', type: 'proposal_created', title: 'New proposal', timestamp: new Date() }
 *   ]}
 * />
 */
export function ActivityFeed({
  activities,
  loading = false,
  maxItems = 10,
  showTimeline = true,
  onItemClick,
  className,
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (loading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-3">
            <Skeleton variant="circular" className="w-8 h-8" />
            <div className="flex-1 space-y-2">
              <Skeleton variant="text" className="w-3/4 h-4" />
              <Skeleton variant="text" className="w-1/2 h-3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Clock className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <p className="text-sm text-gray-500 dark:text-gray-400">No recent activity</p>
      </div>
    );
  }

  return (
    <div className={cn('relative', className)}>
      {/* Timeline line */}
      {showTimeline && displayActivities.length > 1 && (
        <div className="absolute left-4 top-8 bottom-4 w-px bg-gray-200 dark:bg-[#3D3766]" />
      )}

      <div className="space-y-4">
        {displayActivities.map((activity, index) => {
          const config = activityConfig[activity.type];
          const Icon = config.icon;

          return (
            <div
              key={activity.id}
              className={cn(
                'relative flex items-start gap-3',
                onItemClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1A163C] rounded-lg p-2 -mx-2 transition-colors'
              )}
              onClick={() => onItemClick?.(activity)}
            >
              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 flex items-center justify-center w-8 h-8 rounded-full shrink-0',
                  config.bgColor,
                  config.color
                )}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {activity.title}
                  </p>
                </div>
                {activity.description && (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                    {activity.description}
                  </p>
                )}
                <div className="flex items-center gap-2 mt-1">
                  {activity.user && (
                    <>
                      {activity.user.avatar ? (
                        <img
                          src={activity.user.avatar}
                          alt={activity.user.name}
                          className="w-4 h-4 rounded-full"
                        />
                      ) : (
                        <div className="w-4 h-4 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                          <span className="text-[8px] font-medium text-gray-600 dark:text-gray-400">
                            {activity.user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {activity.user.name}
                      </span>
                      <span className="text-gray-300 dark:text-gray-600">•</span>
                    </>
                  )}
                  <span className="text-xs text-gray-400 dark:text-gray-500">
                    {formatTimestamp(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * ActivityFeedCard - Activity feed wrapped in a card
 */
export function ActivityFeedCard({
  title = 'Recent Activity',
  activities,
  loading,
  maxItems = 5,
  onViewAll,
  className,
}: {
  title?: string;
  activities: ActivityItem[];
  loading?: boolean;
  maxItems?: number;
  onViewAll?: () => void;
  className?: string;
}) {
  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-[#3D3766]">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          {title}
        </h3>
        {onViewAll && activities.length > maxItems && (
          <button
            onClick={onViewAll}
            className="text-sm text-[#5B50BD] dark:text-[#918AD3] hover:underline"
          >
            View all
          </button>
        )}
      </div>
      <div className="p-6">
        <ActivityFeed
          activities={activities}
          loading={loading}
          maxItems={maxItems}
          showTimeline={true}
        />
      </div>
    </Card>
  );
}
