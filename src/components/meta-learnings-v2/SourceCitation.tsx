'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { Paperclip, ChevronDown, ChevronUp, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui';
import type { SourceCitationProps, SourceCitationData } from './types';

export function SourceCitation({
  sources,
  maxCollapsed = 2,
  onSourceClick,
  className,
}: SourceCitationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  if (sources.length === 0) return null;

  const visibleSources = isExpanded ? sources : sources.slice(0, maxCollapsed);
  const hiddenCount = sources.length - maxCollapsed;
  const hasMore = sources.length > maxCollapsed;

  // Collapsed view
  if (!isExpanded && hasMore) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          'flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-xs',
          'bg-gray-50 dark:bg-gray-800/50',
          'text-gray-600 dark:text-gray-400',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'transition-colors',
          className
        )}
      >
        <Paperclip className="w-3 h-3" />
        <span>
          {sources.length} sources: {sources.slice(0, 2).map(s => s.proposalTitle).join(', ')}
          {hiddenCount > 0 && `, +${hiddenCount} more`}
        </span>
        <ChevronDown className="w-3 h-3 ml-auto" />
      </button>
    );
  }

  // Expanded view
  return (
    <div
      className={cn(
        'rounded-lg border border-gray-200 dark:border-gray-700',
        'bg-gray-50 dark:bg-gray-800/50',
        'overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={cn(
          'w-full flex items-center justify-between px-3 py-2',
          'text-xs font-medium text-gray-700 dark:text-gray-300',
          'hover:bg-gray-100 dark:hover:bg-gray-800',
          'transition-colors'
        )}
      >
        <div className="flex items-center gap-1.5">
          <Paperclip className="w-3 h-3" />
          <span>Sources ({sources.length})</span>
        </div>
        {hasMore && (isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />)}
      </button>

      {/* Source list */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {visibleSources.map((source) => (
          <SourceItem
            key={source.id}
            source={source}
            onClick={() => onSourceClick?.(source)}
          />
        ))}
      </div>
    </div>
  );
}

interface SourceItemProps {
  source: SourceCitationData;
  onClick?: () => void;
}

function SourceItem({ source, onClick }: SourceItemProps) {
  return (
    <div
      className={cn(
        'px-3 py-2 bg-white dark:bg-gray-900/50',
        onClick && 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800',
        'transition-colors'
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <span className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
              {source.proposalTitle}
            </span>
          </div>
          <div className="flex items-center gap-2 text-[10px] text-gray-500 dark:text-gray-400">
            <span>{source.client}</span>
            <span>{'\u2022'}</span>
            <Badge
              variant={
                (source.status === 'client_approved' || source.status === 'manager_approved') ? 'success' :
                (source.status === 'client_rejected' || source.status === 'manager_rejected') ? 'error' :
                (source.status === 'pending_manager' || source.status === 'pending_client') ? 'warning' :
                'default'
              }
              className="text-[10px] px-1.5 py-0"
            >
              {(source.status === 'client_approved' || source.status === 'manager_approved') ? 'Approved' :
               (source.status === 'client_rejected' || source.status === 'manager_rejected') ? 'Rejected' :
               (source.status === 'pending_manager' || source.status === 'pending_client') ? 'Pending' :
               source.status?.replace(/_/g, ' ')}
            </Badge>
          </div>
          {source.excerpt && (
            <p className="mt-1 text-[10px] text-gray-500 dark:text-gray-400 italic line-clamp-1">
              "{source.excerpt}"
            </p>
          )}
        </div>
        {onClick && (
          <ExternalLink className="w-3 h-3 text-gray-400 dark:text-gray-500 flex-shrink-0" />
        )}
      </div>
    </div>
  );
}
