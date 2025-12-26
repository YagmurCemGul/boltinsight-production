'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { UserPlus, Pencil, Check, X } from 'lucide-react';
import type { CoworkingSession, SessionCollaborator } from '@/types';

interface CoworkingHeaderProps {
  session: CoworkingSession;
  onUpdateName: (name: string) => void;
  onInviteClick: () => void;
  className?: string;
}

export function CoworkingHeader({
  session,
  onUpdateName,
  onInviteClick,
  className,
}: CoworkingHeaderProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(session.name);

  const onlineCollaborators = session.collaborators.filter(c => c.status === 'online');
  const otherCollaborators = session.collaborators.filter(c => c.status !== 'online');

  const handleSaveName = () => {
    if (editName.trim()) {
      onUpdateName(editName.trim());
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditName(session.name);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSaveName();
    } else if (e.key === 'Escape') {
      handleCancelEdit();
    }
  };

  return (
    <div className={cn(
      'flex items-center justify-between px-4 py-2',
      'border-b border-gray-200 dark:border-gray-700',
      'bg-white dark:bg-[#1F2937]',
      className
    )}>
      {/* Left side - Session name */}
      <div className="flex items-center gap-2 min-w-0">
        {isEditing ? (
          <div className="flex items-center gap-1.5">
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
              className={cn(
                'px-2 py-1 text-sm font-medium rounded-md',
                'border border-[#5B50BD] dark:border-[#918AD3]',
                'bg-white dark:bg-gray-800',
                'text-gray-900 dark:text-white',
                'focus:outline-none focus:ring-2 focus:ring-[#5B50BD]/20'
              )}
            />
            <button
              onClick={handleSaveName}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-green-600"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancelEdit}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-1.5 group"
          >
            <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px]">
              {session.name}
            </span>
            <Pencil className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          </button>
        )}

        {/* Session type badge */}
        <span className={cn(
          'px-1.5 py-0.5 text-[10px] font-medium rounded uppercase',
          session.type === 'meta-learnings'
            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
        )}>
          {session.type === 'meta-learnings' ? 'ML' : 'Calc'}
        </span>
      </div>

      {/* Right side - Collaborators and invite */}
      <div className="flex items-center gap-1">
        {/* Collaborator avatars */}
        <div className="flex -space-x-2">
          {onlineCollaborators.slice(0, 4).map((collaborator) => (
            <CollaboratorAvatar
              key={collaborator.id}
              collaborator={collaborator}
              showStatus
            />
          ))}
        </div>
        {session.collaborators.length > 4 && (
          <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
            +{session.collaborators.length - 4}
          </span>
        )}

        {/* Invite button */}
        <button
          onClick={onInviteClick}
          className={cn(
            'ml-1 p-1.5 rounded-full',
            'bg-gray-100 dark:bg-gray-700',
            'hover:bg-[#5B50BD] dark:hover:bg-[#918AD3]',
            'text-gray-500 hover:text-white dark:hover:text-[#100E28]',
            'transition-colors'
          )}
          title="Invite collaborators"
        >
          <UserPlus className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// Collaborator Avatar Component
interface CollaboratorAvatarProps {
  collaborator: SessionCollaborator;
  showStatus?: boolean;
  size?: 'sm' | 'md';
}

function CollaboratorAvatar({ collaborator, showStatus = false, size = 'sm' }: CollaboratorAvatarProps) {
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-8 h-8 text-xs';
  const statusSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  const statusColors = {
    online: 'bg-green-500',
    away: 'bg-amber-500',
    offline: 'bg-gray-400',
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative">
      {collaborator.user.avatar ? (
        <img
          src={collaborator.user.avatar}
          alt={collaborator.user.name}
          className={cn(
            sizeClasses,
            'rounded-full ring-2 ring-white dark:ring-gray-800 object-cover'
          )}
        />
      ) : (
        <div
          className={cn(
            sizeClasses,
            'rounded-full ring-2 ring-white dark:ring-gray-800',
            'bg-[#5B50BD] dark:bg-[#918AD3] text-white dark:text-[#100E28]',
            'flex items-center justify-center font-medium'
          )}
        >
          {getInitials(collaborator.user.name)}
        </div>
      )}
      {showStatus && (
        <span
          className={cn(
            statusSize,
            'absolute -bottom-0.5 -right-0.5 rounded-full',
            'ring-2 ring-white dark:ring-gray-800',
            statusColors[collaborator.status]
          )}
        />
      )}
    </div>
  );
}

export { CollaboratorAvatar };
