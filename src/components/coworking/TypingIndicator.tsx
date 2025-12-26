'use client';

import { cn } from '@/lib/utils';
import type { SessionCollaborator } from '@/types';

interface TypingIndicatorProps {
  typingUsers: SessionCollaborator[];
  className?: string;
}

export function TypingIndicator({ typingUsers, className }: TypingIndicatorProps) {
  if (typingUsers.length === 0) return null;

  const getTypingText = () => {
    if (typingUsers.length === 1) {
      return `${typingUsers[0].user.name} is typing`;
    } else if (typingUsers.length === 2) {
      return `${typingUsers[0].user.name} and ${typingUsers[1].user.name} are typing`;
    } else {
      return `${typingUsers.length} people are typing`;
    }
  };

  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5',
      'text-xs text-[#5B50BD] dark:text-[#918AD3]',
      className
    )}>
      {/* Avatars */}
      <div className="flex -space-x-1.5">
        {typingUsers.slice(0, 3).map((user) => (
          <div
            key={user.id}
            className={cn(
              'w-5 h-5 rounded-full',
              'bg-[#5B50BD] dark:bg-[#918AD3]',
              'ring-2 ring-white dark:ring-gray-800',
              'flex items-center justify-center'
            )}
          >
            <span className="text-[8px] font-medium text-white dark:text-[#100E28]">
              {user.user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        ))}
      </div>

      {/* Animated dots */}
      <div className="flex gap-0.5">
        <span
          className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '600ms' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
          style={{ animationDelay: '150ms', animationDuration: '600ms' }}
        />
        <span
          className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
          style={{ animationDelay: '300ms', animationDuration: '600ms' }}
        />
      </div>

      {/* Text */}
      <span className="font-medium">
        {getTypingText()}
      </span>
    </div>
  );
}

// Compact version for inline use
interface TypingIndicatorCompactProps {
  userName: string;
  className?: string;
}

export function TypingIndicatorCompact({ userName, className }: TypingIndicatorCompactProps) {
  return (
    <div className={cn(
      'flex items-center gap-1.5',
      'text-xs text-[#5B50BD] dark:text-[#918AD3]',
      className
    )}>
      <div className="flex gap-0.5">
        <span
          className="w-1 h-1 rounded-full bg-current animate-bounce"
          style={{ animationDelay: '0ms', animationDuration: '600ms' }}
        />
        <span
          className="w-1 h-1 rounded-full bg-current animate-bounce"
          style={{ animationDelay: '150ms', animationDuration: '600ms' }}
        />
        <span
          className="w-1 h-1 rounded-full bg-current animate-bounce"
          style={{ animationDelay: '300ms', animationDuration: '600ms' }}
        />
      </div>
      <span>{userName} is typing</span>
    </div>
  );
}
