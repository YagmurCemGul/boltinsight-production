'use client';

import { useState } from 'react';
import {
  Clock,
  Send,
  Check,
  X,
  Users,
  Pause,
  RotateCcw,
  AlertCircle,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  History
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ApprovalRecord, ApprovalAction } from '@/types';

interface ApprovalTimelineProps {
  approvalHistory: ApprovalRecord[];
  className?: string;
  maxVisible?: number;
}

// Action configuration for icons and colors
const ACTION_CONFIG: Record<ApprovalAction, {
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  label: string;
}> = {
  submitted_to_manager: {
    icon: <Send className="w-4 h-4" />,
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-100 dark:bg-yellow-900/30',
    label: 'Submitted to Manager',
  },
  manager_approved: {
    icon: <Check className="w-4 h-4" />,
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    label: 'Manager Approved',
  },
  manager_rejected: {
    icon: <X className="w-4 h-4" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Manager Rejected',
  },
  submitted_to_client: {
    icon: <Users className="w-4 h-4" />,
    color: 'text-purple-600 dark:text-purple-400',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
    label: 'Sent to Client',
  },
  client_approved: {
    icon: <Check className="w-4 h-4" />,
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
    label: 'Client Approved',
  },
  client_rejected: {
    icon: <X className="w-4 h-4" />,
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    label: 'Client Rejected',
  },
  put_on_hold: {
    icon: <Pause className="w-4 h-4" />,
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    label: 'Put on Hold',
  },
  revision_requested: {
    icon: <AlertCircle className="w-4 h-4" />,
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    label: 'Revision Requested',
  },
  reopened: {
    icon: <RotateCcw className="w-4 h-4" />,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    label: 'Reopened',
  },
  comment: {
    icon: <MessageSquare className="w-4 h-4" />,
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
    label: 'Comment',
  },
};

function formatDate(timestamp: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

function formatFullDate(timestamp: string): string {
  return new Date(timestamp).toLocaleString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function ApprovalTimeline({
  approvalHistory,
  className,
  maxVisible = 5
}: ApprovalTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!approvalHistory || approvalHistory.length === 0) {
    return (
      <div className={cn('flex items-center gap-2 text-gray-500 dark:text-gray-400 text-sm', className)}>
        <Clock className="w-4 h-4" />
        <span>No approval history yet</span>
      </div>
    );
  }

  // Sort by timestamp descending (newest first)
  const sortedHistory = [...approvalHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const visibleHistory = isExpanded ? sortedHistory : sortedHistory.slice(0, maxVisible);
  const hasMore = sortedHistory.length > maxVisible;

  return (
    <div className={cn('space-y-3', className)}>
      {/* Timeline Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
          <History className="w-4 h-4" />
          <span>Approval History</span>
          <span className="text-gray-400 dark:text-gray-500">({approvalHistory.length})</span>
        </div>
      </div>

      {/* Timeline Items */}
      <div className="relative">
        {/* Vertical line */}
        <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gray-200 dark:bg-gray-700" />

        <div className="space-y-4">
          {visibleHistory.map((record, index) => {
            const config = ACTION_CONFIG[record.action] || ACTION_CONFIG.comment;

            return (
              <div key={record.id} className="relative flex gap-3">
                {/* Icon */}
                <div
                  className={cn(
                    'relative z-10 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center',
                    config.bgColor,
                    config.color
                  )}
                >
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pb-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {config.label}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        by {record.by.name}
                        {record.to && <span> to {record.to.name}</span>}
                      </p>
                    </div>
                    <span
                      className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap"
                      title={formatFullDate(record.timestamp)}
                    >
                      {formatDate(record.timestamp)}
                    </span>
                  </div>

                  {/* Comment */}
                  {record.comment && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800/50 rounded-md border border-gray-100 dark:border-gray-700">
                      <p className="text-sm text-gray-600 dark:text-gray-300">
                        {record.comment}
                      </p>
                    </div>
                  )}

                  {/* Previous Status Badge */}
                  {record.previousStatus && (
                    <div className="mt-1 text-xs text-gray-400 dark:text-gray-500">
                      From: <span className="font-medium">{record.previousStatus.replace(/_/g, ' ')}</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Show More/Less Button */}
        {hasMore && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 text-sm text-[#5B50BD] hover:text-[#4A41A0] font-medium ml-11 mt-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="w-4 h-4" />
                Show less
              </>
            ) : (
              <>
                <ChevronDown className="w-4 h-4" />
                Show {sortedHistory.length - maxVisible} more
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

// Compact inline version for headers/cards
export function ApprovalTimelineCompact({ approvalHistory }: { approvalHistory: ApprovalRecord[] }) {
  if (!approvalHistory || approvalHistory.length === 0) {
    return null;
  }

  const latestRecord = [...approvalHistory].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )[0];

  const config = ACTION_CONFIG[latestRecord.action] || ACTION_CONFIG.comment;

  return (
    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
      <div className={cn('p-1 rounded-full', config.bgColor, config.color)}>
        {config.icon}
      </div>
      <span>
        {config.label} by {latestRecord.by.name}
      </span>
      <span className="text-gray-400">
        {formatDate(latestRecord.timestamp)}
      </span>
    </div>
  );
}

// Panel version for sidebars
export function ApprovalTimelinePanel({
  approvalHistory,
  onClose
}: {
  approvalHistory: ApprovalRecord[];
  onClose?: () => void;
}) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Approval History
        </h3>
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>
      <div className="p-4 max-h-96 overflow-y-auto">
        <ApprovalTimeline approvalHistory={approvalHistory} maxVisible={10} />
      </div>
    </div>
  );
}
