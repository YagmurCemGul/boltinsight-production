'use client';

import { useState, type ReactNode } from 'react';
import { ChevronDown, ChevronUp, MoreHorizontal, Maximize2, Minimize2, X, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Card } from './card';
import { Button } from './button';
import { Dropdown, DropdownItem, DropdownSeparator } from './dropdown';
import { Skeleton } from './Skeleton';

type WidgetSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface WidgetCardProps {
  id: string;
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  size?: WidgetSize;
  collapsible?: boolean;
  defaultCollapsed?: boolean;
  removable?: boolean;
  loading?: boolean;
  draggable?: boolean;
  actions?: ReactNode;
  onRemove?: (id: string) => void;
  onResize?: (id: string, size: WidgetSize) => void;
  onCollapse?: (id: string, collapsed: boolean) => void;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
}

const sizeConfig: Record<WidgetSize, string> = {
  sm: 'col-span-1',
  md: 'col-span-1 md:col-span-2',
  lg: 'col-span-1 md:col-span-2 lg:col-span-3',
  xl: 'col-span-1 md:col-span-2 lg:col-span-4',
  full: 'col-span-full',
};

/**
 * WidgetCard - Resizable, collapsible widget container for dashboards
 *
 * Usage:
 * <WidgetCard
 *   id="stats"
 *   title="Statistics"
 *   collapsible
 *   removable
 *   size="md"
 * >
 *   {content}
 * </WidgetCard>
 */
export function WidgetCard({
  id,
  title,
  subtitle,
  icon,
  children,
  size = 'md',
  collapsible = false,
  defaultCollapsed = false,
  removable = false,
  loading = false,
  draggable = false,
  actions,
  onRemove,
  onResize,
  onCollapse,
  className,
  headerClassName,
  contentClassName,
}: WidgetCardProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [currentSize, setCurrentSize] = useState<WidgetSize>(size);

  const handleCollapse = () => {
    const newCollapsed = !isCollapsed;
    setIsCollapsed(newCollapsed);
    onCollapse?.(id, newCollapsed);
  };

  const handleResize = (newSize: WidgetSize) => {
    setCurrentSize(newSize);
    onResize?.(id, newSize);
  };

  const handleRemove = () => {
    onRemove?.(id);
  };

  return (
    <Card
      className={cn(
        sizeConfig[currentSize],
        'overflow-hidden transition-all duration-200',
        className
      )}
    >
      {/* Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3',
          'border-b border-gray-200 dark:border-[#3D3766]',
          !isCollapsed && 'border-b',
          isCollapsed && 'border-b-0',
          headerClassName
        )}
      >
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Drag handle */}
          {draggable && (
            <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
              <GripVertical className="w-4 h-4" />
            </div>
          )}

          {/* Icon */}
          {icon && (
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD] dark:text-[#918AD3] shrink-0">
              {icon}
            </div>
          )}

          {/* Title */}
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 shrink-0">
          {actions}

          {/* Collapse button */}
          {collapsible && (
            <Button
              variant="ghost"
              size="icon"
              className="w-7 h-7"
              onClick={handleCollapse}
              aria-label={isCollapsed ? 'Expand' : 'Collapse'}
            >
              {isCollapsed ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronUp className="w-4 h-4" />
              )}
            </Button>
          )}

          {/* More options */}
          {(removable || onResize) && (
            <Dropdown
              trigger={
                <Button variant="ghost" size="icon" className="w-7 h-7">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              }
              align="right"
            >
              {onResize && (
                <>
                  <div className="px-3 py-1.5 text-xs font-medium text-gray-500 dark:text-gray-400">
                    Resize
                  </div>
                  <DropdownItem onClick={() => handleResize('sm')}>
                    <Minimize2 className="w-4 h-4 mr-2" />
                    Small
                  </DropdownItem>
                  <DropdownItem onClick={() => handleResize('md')}>
                    Medium
                  </DropdownItem>
                  <DropdownItem onClick={() => handleResize('lg')}>
                    Large
                  </DropdownItem>
                  <DropdownItem onClick={() => handleResize('full')}>
                    <Maximize2 className="w-4 h-4 mr-2" />
                    Full width
                  </DropdownItem>
                </>
              )}
              {onResize && removable && <DropdownSeparator />}
              {removable && (
                <DropdownItem onClick={handleRemove} variant="destructive">
                  <X className="w-4 h-4 mr-2" />
                  Remove widget
                </DropdownItem>
              )}
            </Dropdown>
          )}
        </div>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className={cn('p-4', contentClassName)}>
          {loading ? (
            <div className="space-y-3">
              <Skeleton variant="text" className="w-full h-4" />
              <Skeleton variant="text" className="w-3/4 h-4" />
              <Skeleton variant="text" className="w-1/2 h-4" />
            </div>
          ) : (
            children
          )}
        </div>
      )}
    </Card>
  );
}

/**
 * WidgetGrid - Grid layout for widgets with drag-and-drop support
 */
export function WidgetGrid({
  children,
  columns = 4,
  gap = 4,
  className,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4 | 6;
  gap?: 2 | 4 | 6;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'grid',
        {
          'grid-cols-1 md:grid-cols-2': columns === 2,
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-3': columns === 3,
          'grid-cols-1 md:grid-cols-2 lg:grid-cols-4': columns === 4,
          'grid-cols-1 md:grid-cols-3 lg:grid-cols-6': columns === 6,
        },
        {
          'gap-2': gap === 2,
          'gap-4': gap === 4,
          'gap-6': gap === 6,
        },
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * QuickActionsWidget - Common quick actions widget
 */
export function QuickActionsWidget({
  actions,
  className,
}: {
  actions: Array<{
    label: string;
    icon: ReactNode;
    onClick: () => void;
    variant?: 'default' | 'primary';
  }>;
  className?: string;
}) {
  return (
    <div className={cn('grid grid-cols-2 gap-2', className)}>
      {actions.map((action, index) => (
        <Button
          key={index}
          variant={action.variant === 'primary' ? 'primary' : 'outline'}
          className="justify-start"
          onClick={action.onClick}
          leftIcon={action.icon}
        >
          {action.label}
        </Button>
      ))}
    </div>
  );
}
