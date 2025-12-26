'use client';

import { cn } from '@/lib/utils';
import { UserPlus } from 'lucide-react';
import { CollaboratorAvatar } from './CoworkingHeader';
import type { SessionCollaborator } from '@/types';

interface CollaboratorBarProps {
  collaborators: SessionCollaborator[];
  onInviteClick: () => void;
  className?: string;
}

export function CollaboratorBar({
  collaborators,
  onInviteClick,
  className,
}: CollaboratorBarProps) {
  const onlineCollaborators = collaborators.filter(c => c.status === 'online');
  const awayCollaborators = collaborators.filter(c => c.status === 'away');
  const offlineCollaborators = collaborators.filter(c => c.status === 'offline');

  // Sort by status: online first, then away, then offline
  const sortedCollaborators = [...onlineCollaborators, ...awayCollaborators, ...offlineCollaborators];

  const typingUsers = collaborators.filter(c => c.isTyping);

  return (
    <div className={cn(
      'flex items-center gap-3 px-4 py-2',
      'border-b border-gray-100 dark:border-gray-800',
      'bg-gray-50/50 dark:bg-gray-800/30',
      className
    )}>
      {/* Collaborators */}
      <div className="flex items-center gap-1.5">
        <div className="flex -space-x-1.5">
          {sortedCollaborators.slice(0, 6).map((collaborator) => (
            <div
              key={collaborator.id}
              className="group relative"
              title={`${collaborator.user.name} (${collaborator.role})`}
            >
              <CollaboratorAvatar
                collaborator={collaborator}
                showStatus
                size="sm"
              />
              {collaborator.isTyping && (
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#5B50BD] opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#5B50BD]" />
                </span>
              )}
            </div>
          ))}
        </div>

        {collaborators.length > 6 && (
          <span className="text-xs text-gray-500 dark:text-gray-400 ml-1">
            +{collaborators.length - 6}
          </span>
        )}
      </div>

      {/* Status summary */}
      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
        {onlineCollaborators.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
            {onlineCollaborators.length} online
          </span>
        )}
        {awayCollaborators.length > 0 && (
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            {awayCollaborators.length} away
          </span>
        )}
      </div>

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className="flex items-center gap-1.5 text-xs text-[#5B50BD] dark:text-[#918AD3]">
          <TypingDots />
          <span>
            {typingUsers.length === 1
              ? `${typingUsers[0].user.name} is typing`
              : `${typingUsers.length} people typing`}
          </span>
        </div>
      )}

      {/* Spacer */}
      <div className="flex-1" />

      {/* Invite button */}
      <button
        onClick={onInviteClick}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium',
          'text-[#5B50BD] dark:text-[#918AD3]',
          'hover:bg-[#5B50BD]/10 dark:hover:bg-[#918AD3]/10',
          'transition-colors'
        )}
      >
        <UserPlus className="w-3.5 h-3.5" />
        <span>Invite</span>
      </button>
    </div>
  );
}

// Typing animation dots
function TypingDots() {
  return (
    <div className="flex gap-0.5">
      <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
      <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
      <span className="w-1 h-1 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
    </div>
  );
}

export { TypingDots };
