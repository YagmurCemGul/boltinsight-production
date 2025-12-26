'use client';

import { cn } from '@/lib/utils';
import {
  FileText,
  Image as ImageIcon,
  FileSpreadsheet,
  FileCode,
  Video,
  Music,
  File,
  Link as LinkIcon,
  Briefcase,
} from 'lucide-react';

export interface ChatAttachment {
  name: string;
  type: string; // MIME type or 'link' or 'proposal'
  size?: number;
  url?: string;
  // For proposals
  proposalId?: string;
  proposalStatus?: string;
}

interface ChatMessageAttachmentsProps {
  attachments: ChatAttachment[];
  className?: string;
  onAttachmentClick?: (attachment: ChatAttachment) => void;
}

// Get file type info for icon and color
function getFileTypeInfo(type: string, name: string): { icon: typeof FileText; color: string; label: string } {
  const lowerName = name.toLowerCase();
  const lowerType = type.toLowerCase();

  // Link type
  if (lowerType === 'link' || lowerType === 'url') {
    return { icon: LinkIcon, color: 'bg-blue-500', label: 'Link' };
  }

  // Proposal type
  if (lowerType === 'proposal') {
    return { icon: Briefcase, color: 'bg-[#5B50BD]', label: 'Proposal' };
  }

  // PDF
  if (lowerType.includes('pdf') || lowerName.endsWith('.pdf')) {
    return { icon: FileText, color: 'bg-red-500', label: 'PDF' };
  }

  // Images
  if (lowerType.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp|svg|bmp)$/i.test(lowerName)) {
    return { icon: ImageIcon, color: 'bg-green-500', label: 'Image' };
  }

  // Word documents
  if (
    lowerType.includes('msword') ||
    lowerType.includes('wordprocessingml') ||
    lowerName.endsWith('.doc') ||
    lowerName.endsWith('.docx')
  ) {
    return { icon: FileText, color: 'bg-blue-600', label: 'Document' };
  }

  // Excel/Spreadsheets
  if (
    lowerType.includes('spreadsheet') ||
    lowerType.includes('excel') ||
    lowerName.endsWith('.xlsx') ||
    lowerName.endsWith('.xls') ||
    lowerName.endsWith('.csv')
  ) {
    return { icon: FileSpreadsheet, color: 'bg-green-600', label: 'Spreadsheet' };
  }

  // PowerPoint
  if (
    lowerType.includes('presentation') ||
    lowerType.includes('powerpoint') ||
    lowerName.endsWith('.ppt') ||
    lowerName.endsWith('.pptx')
  ) {
    return { icon: FileText, color: 'bg-orange-500', label: 'Presentation' };
  }

  // Code files
  if (
    lowerType.includes('javascript') ||
    lowerType.includes('typescript') ||
    lowerType.includes('json') ||
    lowerType.includes('html') ||
    lowerType.includes('css') ||
    /\.(js|ts|jsx|tsx|json|html|css|py|java|cpp|c|h|rb|go|rs|swift|kt)$/i.test(lowerName)
  ) {
    return { icon: FileCode, color: 'bg-gray-500', label: 'Code' };
  }

  // Video
  if (lowerType.startsWith('video/') || /\.(mp4|mov|avi|mkv|webm)$/i.test(lowerName)) {
    return { icon: Video, color: 'bg-purple-500', label: 'Video' };
  }

  // Audio
  if (lowerType.startsWith('audio/') || /\.(mp3|wav|ogg|m4a|flac)$/i.test(lowerName)) {
    return { icon: Music, color: 'bg-pink-500', label: 'Audio' };
  }

  // Text files
  if (lowerType.includes('text/') || lowerName.endsWith('.txt')) {
    return { icon: FileText, color: 'bg-gray-500', label: 'Text' };
  }

  // Default
  return { icon: File, color: 'bg-gray-400', label: 'File' };
}

// Single attachment card (ChatGPT style)
function AttachmentCard({
  attachment,
  onClick,
}: {
  attachment: ChatAttachment;
  onClick?: () => void;
}) {
  const { icon: Icon, color, label } = getFileTypeInfo(attachment.type, attachment.name);

  return (
    <div
      onClick={onClick}
      className={cn(
        'group relative inline-block text-sm cursor-pointer',
        'w-80 flex-shrink-0'
      )}
    >
      <div
        className={cn(
          'border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800',
          'relative overflow-hidden rounded-xl',
          'hover:border-gray-300 dark:hover:border-gray-600',
          'transition-colors'
        )}
      >
        <div className="p-2">
          <div className="flex flex-row items-center gap-2 overflow-hidden">
            {/* Icon */}
            <div
              className={cn(
                'relative h-10 w-10 shrink-0 overflow-hidden rounded-lg',
                'flex items-center justify-center',
                color
              )}
            >
              <Icon className="h-5 w-5 text-white" />
            </div>

            {/* Text */}
            <div className="overflow-hidden min-w-0 flex-1">
              <div className="truncate font-semibold text-gray-900 dark:text-white">
                {attachment.name}
              </div>
              <div className="truncate text-gray-500 dark:text-gray-400 text-xs">
                {attachment.type === 'proposal' && attachment.proposalStatus
                  ? `Proposal - ${attachment.proposalStatus}`
                  : label}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Image preview card
function ImageCard({
  attachment,
  onClick,
}: {
  attachment: ChatAttachment;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={cn(
        'overflow-hidden rounded-lg cursor-pointer',
        'max-w-96 max-h-64'
      )}
    >
      <div className="bg-gray-100 dark:bg-gray-800 relative flex h-auto w-full max-w-lg items-center justify-center overflow-hidden">
        {attachment.url ? (
          <img
            alt={attachment.name}
            src={attachment.url}
            className="max-w-full object-cover object-center overflow-hidden rounded-lg w-full h-full max-w-96 max-h-64 transition-opacity duration-300"
          />
        ) : (
          <div className="flex items-center justify-center w-full h-32 bg-gray-200 dark:bg-gray-700">
            <ImageIcon className="w-8 h-8 text-gray-400" />
          </div>
        )}
      </div>
    </div>
  );
}

// Main component to display attachments in a chat message
export function ChatMessageAttachments({
  attachments,
  className,
  onAttachmentClick,
}: ChatMessageAttachmentsProps) {
  if (!attachments || attachments.length === 0) return null;

  // Separate images from other files
  const images = attachments.filter(
    (a) => a.type.startsWith('image/') || /\.(png|jpg|jpeg|gif|webp)$/i.test(a.name)
  );
  const otherFiles = attachments.filter(
    (a) => !a.type.startsWith('image/') && !/\.(png|jpg|jpeg|gif|webp)$/i.test(a.name)
  );

  return (
    <div className={cn('flex flex-col gap-2', className)}>
      {/* Images grid */}
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((attachment) => (
            <ImageCard
              key={attachment.url || attachment.proposalId || `${attachment.name}-${attachment.type}`}
              attachment={attachment}
              onClick={() => onAttachmentClick?.(attachment)}
            />
          ))}
        </div>
      )}

      {/* Other files */}
      {otherFiles.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {otherFiles.map((attachment) => (
            <AttachmentCard
              key={attachment.url || attachment.proposalId || `${attachment.name}-${attachment.type}`}
              attachment={attachment}
              onClick={() => onAttachmentClick?.(attachment)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// Compact version for smaller spaces (e.g., user message bubbles aligned right)
export function ChatMessageAttachmentsCompact({
  attachments,
  className,
  onAttachmentClick,
  align = 'start',
}: ChatMessageAttachmentsProps & { align?: 'start' | 'end' }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div
      className={cn(
        'flex flex-wrap gap-2',
        align === 'end' ? 'justify-end' : 'justify-start',
        className
      )}
    >
      {attachments.map((attachment) => {
        const isImage =
          attachment.type.startsWith('image/') ||
          /\.(png|jpg|jpeg|gif|webp)$/i.test(attachment.name);
        const uniqueKey = attachment.url || attachment.proposalId || `${attachment.name}-${attachment.type}`;

        if (isImage) {
          return (
            <ImageCard
              key={uniqueKey}
              attachment={attachment}
              onClick={() => onAttachmentClick?.(attachment)}
            />
          );
        }

        return (
          <AttachmentCard
            key={uniqueKey}
            attachment={attachment}
            onClick={() => onAttachmentClick?.(attachment)}
          />
        );
      })}
    </div>
  );
}
