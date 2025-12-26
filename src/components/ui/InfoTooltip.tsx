'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TooltipPosition {
  top: number;
  left: number;
}

interface InfoTooltipProps {
  content: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  maxWidth?: number;
  className?: string;
  iconClassName?: string;
}

/**
 * InfoTooltip - Progressive disclosure component
 * Shows an ⓘ icon that reveals helpful information on hover
 *
 * Usage:
 * <InfoTooltip content="Survey sample size for market research." />
 */
export function InfoTooltip({
  content,
  position = 'right',
  delay = 200,
  maxWidth = 280,
  className,
  iconClassName,
}: InfoTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<TooltipPosition>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseEnter = () => {
    timeoutRef.current = setTimeout(() => {
      setIsOpen(true);
    }, delay);
  };

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsOpen(false);
  };

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const gap = 8;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top - gap;
          left = rect.left + rect.width / 2;
          break;
        case 'bottom':
          top = rect.bottom + gap;
          left = rect.left + rect.width / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - gap;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + gap;
          break;
      }

      // Ensure tooltip stays within viewport
      if (left < 8) left = 8;
      if (left + maxWidth > window.innerWidth - 8) {
        left = window.innerWidth - maxWidth - 8;
      }
      if (top < 8) top = 8;

      setCoords({ top, left });
    }

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isOpen, position, maxWidth]);

  const getTransformClass = () => {
    switch (position) {
      case 'top':
        return '-translate-y-full -translate-x-1/2';
      case 'bottom':
        return '-translate-x-1/2';
      case 'left':
        return '-translate-x-full -translate-y-1/2';
      case 'right':
        return '-translate-y-1/2';
      default:
        return '';
    }
  };

  const tooltipContent = isOpen && (
    <div
      className={cn(
        'fixed z-[500] px-3 py-2 rounded-lg text-sm shadow-lg',
        'bg-[#231E51] text-white',
        'animate-in fade-in-0 zoom-in-95 duration-150',
        getTransformClass(),
        className
      )}
      style={{
        top: coords.top,
        left: coords.left,
        maxWidth: `${maxWidth}px`,
      }}
    >
      {/* Arrow */}
      {position === 'right' && (
        <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#231E51]" />
      )}
      {position === 'left' && (
        <div className="absolute right-0 top-1/2 translate-x-1 -translate-y-1/2 w-2 h-2 rotate-45 bg-[#231E51]" />
      )}
      {position === 'top' && (
        <div className="absolute bottom-0 left-1/2 translate-y-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#231E51]" />
      )}
      {position === 'bottom' && (
        <div className="absolute top-0 left-1/2 -translate-y-1 -translate-x-1/2 w-2 h-2 rotate-45 bg-[#231E51]" />
      )}

      <div className="relative leading-relaxed">
        {content}
      </div>
    </div>
  );

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-flex items-center cursor-help"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <Info
          className={cn(
            'w-4 h-4 text-gray-400 hover:text-[#5B50BD] transition-colors',
            iconClassName
          )}
        />
      </span>
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
}
