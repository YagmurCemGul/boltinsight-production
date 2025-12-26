'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface AIBadgeProps {
  isActive?: boolean;
  showTooltip?: boolean;
  tooltipText?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function AIBadge({
  isActive = false,
  showTooltip = true,
  tooltipText = 'Type @ to activate AI suggestions. AI will help you find relevant data from Meta Learnings and past proposals.',
  className,
  size = 'md',
}: AIBadgeProps) {
  const [isHovered, setIsHovered] = useState(false);

  const sizeClasses = {
    sm: 'text-[9px] px-1 py-0.5',
    md: 'text-[10px] px-1.5 py-0.5',
    lg: 'text-xs px-2 py-1',
  };

  return (
    <div
      className="relative inline-flex"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <span
        className={cn(
          'font-bold rounded tracking-wide transition-all duration-200 cursor-help select-none',
          sizeClasses[size],
          isActive
            ? 'bg-gradient-to-r from-[#5B50BD] to-[#7B6FD6] text-white shadow-sm animate-pulse'
            : 'bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-600 dark:to-gray-700 text-gray-600 dark:text-gray-300',
          className
        )}
      >
        AI
      </span>

      {/* Tooltip */}
      {showTooltip && isHovered && (
        <div className="absolute left-0 top-full mt-2 z-[100] pointer-events-none">
          <div className="relative bg-gray-900 dark:bg-gray-800 text-white text-xs rounded-lg px-3 py-2 shadow-lg max-w-[240px] whitespace-normal">
            {/* Arrow */}
            <div className="absolute left-3 bottom-full w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-b-[6px] border-b-gray-900 dark:border-b-gray-800" />
            <p className="leading-relaxed">{tooltipText}</p>
          </div>
        </div>
      )}
    </div>
  );
}
