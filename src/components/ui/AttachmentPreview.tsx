'use client';

import { FileText, Image as ImageIcon, File, X, FileSpreadsheet, FileCode, Film, Music } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AttachmentFile {
  name: string;
  type: string;
  size?: number;
}

interface AttachmentPreviewProps {
  attachments: AttachmentFile[];
  onRemove: (index: number) => void;
  className?: string;
}

// Get file type info (icon, color, label)
function getFileTypeInfo(file: AttachmentFile) {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';
  const mimeType = file.type.toLowerCase();

  // PDF
  if (mimeType.includes('pdf') || extension === 'pdf') {
    return {
      icon: FileText,
      color: 'rgb(250, 66, 62)', // Red
      label: 'PDF',
    };
  }

  // Images
  if (mimeType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(extension)) {
    return {
      icon: ImageIcon,
      color: 'rgb(16, 185, 129)', // Green
      label: extension.toUpperCase() || 'Image',
    };
  }

  // Word documents
  if (mimeType.includes('word') || ['doc', 'docx'].includes(extension)) {
    return {
      icon: FileText,
      color: 'rgb(59, 130, 246)', // Blue
      label: extension.toUpperCase() || 'Word',
    };
  }

  // Excel/Spreadsheets
  if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || ['xls', 'xlsx', 'csv'].includes(extension)) {
    return {
      icon: FileSpreadsheet,
      color: 'rgb(34, 197, 94)', // Green
      label: extension.toUpperCase() || 'Excel',
    };
  }

  // PowerPoint
  if (mimeType.includes('presentation') || ['ppt', 'pptx'].includes(extension)) {
    return {
      icon: FileText,
      color: 'rgb(249, 115, 22)', // Orange
      label: extension.toUpperCase() || 'PowerPoint',
    };
  }

  // Code files
  if (['js', 'ts', 'jsx', 'tsx', 'html', 'css', 'json', 'py', 'java', 'cpp', 'c', 'php', 'rb', 'go', 'rs'].includes(extension)) {
    return {
      icon: FileCode,
      color: 'rgb(139, 92, 246)', // Purple
      label: extension.toUpperCase(),
    };
  }

  // Video
  if (mimeType.startsWith('video/') || ['mp4', 'mov', 'avi', 'mkv', 'webm'].includes(extension)) {
    return {
      icon: Film,
      color: 'rgb(236, 72, 153)', // Pink
      label: extension.toUpperCase() || 'Video',
    };
  }

  // Audio
  if (mimeType.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'flac', 'm4a'].includes(extension)) {
    return {
      icon: Music,
      color: 'rgb(245, 158, 11)', // Amber
      label: extension.toUpperCase() || 'Audio',
    };
  }

  // Plain text
  if (mimeType.includes('text') || extension === 'txt') {
    return {
      icon: FileText,
      color: 'rgb(107, 114, 128)', // Gray
      label: 'TXT',
    };
  }

  // Default
  return {
    icon: File,
    color: 'rgb(107, 114, 128)', // Gray
    label: extension.toUpperCase() || 'File',
  };
}

export function AttachmentPreview({ attachments, onRemove, className }: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className={cn('w-full', className)}>
      <div className="no-scrollbar flex flex-nowrap gap-2 overflow-x-auto px-2.5 pt-2.5 pb-1.5">
        {attachments.map((file, index) => {
          const fileInfo = getFileTypeInfo(file);
          const Icon = fileInfo.icon;
          const uniqueKey = `${file.name}-${file.type}-${file.size || 0}-${index}`;

          return (
            <div
              key={uniqueKey}
              className="group relative inline-block text-sm flex-shrink-0"
            >
              {/* Card */}
              <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative overflow-hidden rounded-2xl cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <div className="p-2 w-80">
                  <div className="flex flex-row items-center gap-2 overflow-hidden">
                    {/* Icon */}
                    <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-lg">
                      <div
                        className="flex items-center justify-center rounded-lg h-10 w-10 shrink-0"
                        style={{ backgroundColor: fileInfo.color }}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                    </div>
                    {/* File info */}
                    <div className="overflow-hidden min-w-0 flex-1">
                      <div className="truncate font-semibold text-gray-900 dark:text-white">
                        {file.name}
                      </div>
                      <div className="truncate text-gray-500 dark:text-gray-400 text-xs">
                        {fileInfo.label}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remove button */}
              <div className="absolute end-1.5 top-1.5 inline-flex gap-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                  }}
                  aria-label="Remove file"
                  className="transition-colors flex h-5 w-5 items-center justify-center rounded-full bg-black/80 text-white hover:bg-black dark:bg-white/80 dark:text-black dark:hover:bg-white"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Also export a compact version for smaller spaces
export function AttachmentPreviewCompact({ attachments, onRemove, className }: AttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <div className={cn('w-full', className)}>
      <div className="no-scrollbar flex flex-nowrap gap-1.5 overflow-x-auto px-2 pt-2 pb-1">
        {attachments.map((file, index) => {
          const fileInfo = getFileTypeInfo(file);
          const Icon = fileInfo.icon;
          const uniqueKey = `${file.name}-${file.type}-${file.size || 0}-${index}`;

          return (
            <div
              key={uniqueKey}
              className="group relative inline-block text-xs flex-shrink-0"
            >
              {/* Compact Card */}
              <div className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 relative overflow-hidden rounded-xl cursor-pointer hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                <div className="p-1.5 w-48">
                  <div className="flex flex-row items-center gap-1.5 overflow-hidden">
                    {/* Icon */}
                    <div
                      className="flex items-center justify-center rounded-md h-7 w-7 shrink-0"
                      style={{ backgroundColor: fileInfo.color }}
                    >
                      <Icon className="h-3.5 w-3.5 text-white" />
                    </div>
                    {/* File info */}
                    <div className="overflow-hidden min-w-0 flex-1">
                      <div className="truncate font-medium text-gray-900 dark:text-white text-xs">
                        {file.name}
                      </div>
                      <div className="truncate text-gray-500 dark:text-gray-400 text-[10px]">
                        {fileInfo.label}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Remove button */}
              <div className="absolute end-1 top-1 inline-flex gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemove(index);
                  }}
                  aria-label="Remove file"
                  className="transition-colors flex h-4 w-4 items-center justify-center rounded-full bg-black/80 text-white hover:bg-black dark:bg-white/80 dark:text-black dark:hover:bg-white"
                >
                  <X className="h-2.5 w-2.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
