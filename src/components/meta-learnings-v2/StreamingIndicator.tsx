'use client';

import { cn } from '@/lib/utils';
import { Brain } from 'lucide-react';
import type { StreamingIndicatorProps } from './types';

export function StreamingIndicator({
  isVisible,
  text = 'Analyzing...',
  className,
}: StreamingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div
      className={cn(
        'flex items-start gap-1.5 sm:gap-2',
        className
      )}
    >
      {/* AI Avatar - matching AIMessage style */}
      <div
        className={cn(
          'flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full',
          'bg-[#5B50BD] dark:bg-[#918AD3]',
          'flex items-center justify-center',
          'mt-0.5'
        )}
      >
        <Brain className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white dark:text-[#100E28]" />
      </div>

      {/* Content - direct typing style */}
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-500 dark:text-gray-400">{text}</p>
        <div className="mt-1 flex items-center gap-1">
          <span className="inline-block w-1.5 h-3 bg-[#5B50BD] dark:bg-[#918AD3] rounded-sm animate-pulse" />
        </div>
      </div>
    </div>
  );
}
