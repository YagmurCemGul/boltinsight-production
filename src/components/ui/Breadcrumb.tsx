'use client';

import { Fragment } from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface BreadcrumbItem {
  label: string;
  href?: string;
  onClick?: () => void;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  onHomeClick?: () => void;
  className?: string;
}

export function Breadcrumb({ items, onHomeClick, className }: BreadcrumbProps) {
  if (items.length === 0) return null;

  return (
    <nav className={cn('flex items-center gap-1.5 text-sm', className)}>
      {/* Home Icon */}
      <button
        onClick={onHomeClick}
        className="flex items-center justify-center rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#5B50BD] dark:hover:bg-gray-800 dark:hover:text-[#918AD3]"
        title="Dashboard"
      >
        <Home className="h-4 w-4" />
      </button>

      {items.map((item, index) => {
        const isLast = index === items.length - 1;

        return (
          <Fragment key={index}>
            <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
            {isLast ? (
              <span className="font-medium text-gray-900 dark:text-white">
                {item.label}
              </span>
            ) : item.onClick || item.href ? (
              <button
                onClick={item.onClick}
                className="text-gray-500 transition-colors hover:text-[#5B50BD] dark:text-gray-400 dark:hover:text-[#918AD3]"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-gray-500 dark:text-gray-400">{item.label}</span>
            )}
          </Fragment>
        );
      })}
    </nav>
  );
}
