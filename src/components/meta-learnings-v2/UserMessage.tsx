'use client';

import { cn } from '@/lib/utils';
import { User } from 'lucide-react';
import { ChatMessageAttachmentsCompact } from '@/components/ui/ChatMessageAttachments';
import type { UserMessageProps } from './types';

export function UserMessage({ message, className }: UserMessageProps) {
  const hasAttachments = message.attachments && message.attachments.length > 0;
  const hasContent = message.content && message.content.trim().length > 0;

  return (
    <div className={cn('flex items-start gap-1.5 sm:gap-2 justify-end', className)}>
      {/* Content area */}
      <div className="max-w-[85%] sm:max-w-[80%] flex flex-col gap-2 items-end">
        {/* Attachments - ChatGPT Style (outside message bubble) */}
        {hasAttachments && (
          <ChatMessageAttachmentsCompact
            attachments={message.attachments!}
            align="end"
          />
        )}

        {/* Message bubble - only show if there's text content */}
        {hasContent && (
          <div
            className={cn(
              'px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl rounded-tr-sm',
              'bg-[#5B50BD] dark:bg-[#918AD3]',
              'text-white dark:text-[#100E28]'
            )}
          >
            <p className="text-[10px] sm:text-xs whitespace-pre-wrap">{message.content}</p>
          </div>
        )}

        {/* Timestamp */}
        <time className="text-[9px] sm:text-[10px] text-gray-400 dark:text-gray-500">
          {new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>
      </div>

      {/* User Avatar - compact & responsive */}
      <div
        className={cn(
          'flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full',
          'bg-gray-200 dark:bg-gray-700',
          'flex items-center justify-center'
        )}
      >
        <User className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-gray-500 dark:text-gray-400" />
      </div>
    </div>
  );
}
