'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Calculator,
  Brain,
  MoreHorizontal,
  Share2,
  Trash2,
  Archive,
  Clock,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui';
import type { CoworkingSession } from '@/types';

interface SessionCardProps {
  session: CoworkingSession;
  isActive?: boolean;
  onOpen: (sessionId: string) => void;
  onShare: (sessionId: string) => void;
  onArchive: (sessionId: string) => void;
  onDelete: (sessionId: string) => void;
  className?: string;
}

export function SessionCard({
  session,
  isActive,
  onOpen,
  onShare,
  onArchive,
  onDelete,
  className,
}: SessionCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const Icon = session.type === 'calculators' ? Calculator : Brain;
  const typeLabel = session.type === 'calculators' ? 'Calculators' : 'Meta Learnings';

  // Format relative time
  const formatRelativeTime = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  // Count online collaborators
  const onlineCount = session.collaborators.filter(c => c.status === 'online').length;

  return (
    <div
      className={cn(
        'relative p-3 rounded-lg',
        'border transition-all cursor-pointer',
        isActive
          ? 'border-[#5B50BD] dark:border-[#918AD3] bg-[#5B50BD]/5 dark:bg-[#918AD3]/10'
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-[#5B50BD]/50 dark:hover:border-[#918AD3]/50',
        className
      )}
      onClick={() => onOpen(session.id)}
    >
      {/* Header row */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div
            className={cn(
              'flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center',
              session.type === 'calculators'
                ? 'bg-[#5B50BD]/10 dark:bg-[#918AD3]/20'
                : 'bg-purple-100 dark:bg-purple-900/30'
            )}
          >
            <Icon
              className={cn(
                'w-3.5 h-3.5',
                session.type === 'calculators'
                  ? 'text-[#5B50BD] dark:text-[#918AD3]'
                  : 'text-purple-600 dark:text-purple-400'
              )}
            />
          </div>

          <div className="min-w-0">
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {session.name}
            </h3>
            <p className="text-[10px] text-gray-500 dark:text-gray-400">
              {typeLabel}
            </p>
          </div>
        </div>

        {/* Menu button */}
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="h-6 w-6 p-0"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </Button>

          {/* Dropdown menu */}
          {showMenu && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowMenu(false);
                }}
              />
              <div
                className={cn(
                  'absolute right-0 top-full mt-1 z-20',
                  'w-36 py-1 rounded-lg shadow-lg',
                  'bg-white dark:bg-gray-800',
                  'border border-gray-200 dark:border-gray-700'
                )}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(session.id);
                    setShowMenu(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-1.5',
                    'text-xs text-gray-700 dark:text-gray-300',
                    'hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Share2 className="w-3 h-3" />
                  Share
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onArchive(session.id);
                    setShowMenu(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-1.5',
                    'text-xs text-gray-700 dark:text-gray-300',
                    'hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                >
                  <Archive className="w-3 h-3" />
                  Archive
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(session.id);
                    setShowMenu(false);
                  }}
                  className={cn(
                    'w-full flex items-center gap-2 px-3 py-1.5',
                    'text-xs text-red-600 dark:text-red-400',
                    'hover:bg-red-50 dark:hover:bg-red-900/20'
                  )}
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Footer row */}
      <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
        {/* Collaborators */}
        <div className="flex items-center gap-1.5">
          {session.collaborators.slice(0, 3).map((collaborator, idx) => (
            <div
              key={collaborator.id}
              className={cn(
                'relative w-5 h-5 rounded-full',
                'flex items-center justify-center',
                'text-[9px] font-medium text-white',
                'bg-gradient-to-br',
                idx === 0 && 'from-blue-400 to-blue-600',
                idx === 1 && 'from-green-400 to-green-600',
                idx === 2 && 'from-purple-400 to-purple-600'
              )}
              style={{ marginLeft: idx > 0 ? '-4px' : 0 }}
            >
              {collaborator.user.name.charAt(0).toUpperCase()}
              {collaborator.status === 'online' && (
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-green-500 border border-white dark:border-gray-800" />
              )}
            </div>
          ))}
          {session.collaborators.length > 3 && (
            <span className="text-[10px] text-gray-500 dark:text-gray-400 ml-1">
              +{session.collaborators.length - 3}
            </span>
          )}
          {onlineCount > 0 && (
            <span className="flex items-center gap-0.5 text-[10px] text-green-600 dark:text-green-400 ml-1">
              <Users className="w-2.5 h-2.5" />
              {onlineCount}
            </span>
          )}
        </div>

        {/* Last activity */}
        <div className="flex items-center gap-1 text-[10px] text-gray-400 dark:text-gray-500">
          <Clock className="w-2.5 h-2.5" />
          {formatRelativeTime(session.lastActivityAt)}
        </div>
      </div>
    </div>
  );
}
