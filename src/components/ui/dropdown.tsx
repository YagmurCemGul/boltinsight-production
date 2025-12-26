'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

interface DropdownProps {
  trigger: ReactNode;
  children: ReactNode;
  align?: 'left' | 'right';
  className?: string;
  usePortal?: boolean;
}

export function Dropdown({ trigger, children, align = 'left', className, usePortal = true }: DropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const triggerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (
        triggerRef.current && !triggerRef.current.contains(target) &&
        dropdownRef.current && !dropdownRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && triggerRef.current && usePortal) {
      const rect = triggerRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY + 4,
        left: align === 'right' ? rect.right + window.scrollX - 160 : rect.left + window.scrollX,
      });
    }
  }, [isOpen, align, usePortal]);

  const dropdownContent = (
    <div
      ref={dropdownRef}
      className={cn(
        'min-w-[160px] rounded-lg border py-1',
        'bg-[var(--surface-overlay)] shadow-[var(--shadow-lg)]',
        'border-gray-200 dark:border-[#3D3766]',
        'animate-dropdown',
        usePortal ? 'fixed z-[350]' : 'absolute z-[100] mt-1',
        !usePortal && (align === 'right' ? 'right-0' : 'left-0'),
        className
      )}
      style={usePortal ? { top: position.top, left: position.left } : undefined}
      onClick={(e) => e.stopPropagation()}
    >
      {children}
    </div>
  );

  return (
    <div className="relative" ref={triggerRef}>
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>
      {isOpen && (
        usePortal && typeof document !== 'undefined'
          ? createPortal(dropdownContent, document.body)
          : dropdownContent
      )}
    </div>
  );
}

interface DropdownItemProps {
  onClick?: () => void;
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'destructive';
}

export function DropdownItem({ onClick, children, className, variant = 'default' }: DropdownItemProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex w-full items-center px-3 py-2 text-sm transition-colors',
        {
          'text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700': variant === 'default',
          'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30': variant === 'destructive',
        },
        className
      )}
    >
      {children}
    </button>
  );
}

export function DropdownSeparator() {
  return <div className="my-1 h-px bg-gray-200 dark:bg-gray-700" />;
}
