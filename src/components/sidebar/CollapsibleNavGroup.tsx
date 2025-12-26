'use client';

import { ChevronDown, ChevronRight, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  expandable?: boolean;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  collapsible: boolean;
  items: NavItem[];
  roles?: string[];
}

interface CollapsibleNavGroupProps {
  group: NavGroup;
  isExpanded: boolean;
  onToggle: () => void;
  activeSection: string;
  onItemClick: (id: string) => void;
  sidebarCollapsed: boolean;
  expandedItems: string[];
  onItemExpand: (id: string) => void;
  renderExpandedContent?: (itemId: string) => React.ReactNode;
}

export function CollapsibleNavGroup({
  group,
  isExpanded,
  onToggle,
  activeSection,
  onItemClick,
  sidebarCollapsed,
  expandedItems,
  onItemExpand,
  renderExpandedContent,
}: CollapsibleNavGroupProps) {
  const isGroupActive = group.items.some(item => activeSection === item.id || activeSection.startsWith(`${item.id}-`));

  if (sidebarCollapsed) {
    // Collapsed mode: show only icons
    return (
      <div className="space-y-1">
        {group.items.map((item) => (
          <button
            key={item.id}
            onClick={() => onItemClick(item.id)}
            className={cn(
              'flex w-full items-center justify-center rounded-lg p-2.5 transition-colors',
              activeSection === item.id || activeSection.startsWith(`${item.id}-`)
                ? 'bg-[#EDE9F9] text-[#5B50BD] dark:bg-[#231E51] dark:text-[#918AD3]'
                : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
            )}
            title={item.label}
          >
            <item.icon className="h-5 w-5" />
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="group/sidebar-expando-section mb-2">
      {/* Section Header - ChatGPT style */}
      <button
        onClick={onToggle}
        aria-expanded={isExpanded}
        className="flex w-full items-center justify-start gap-0.5 px-4 py-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
      >
        <h2 className="text-xs font-semibold uppercase tracking-wider">{group.label}</h2>
        {group.collapsible && (
          <ChevronDown className={cn(
            "h-3 w-3 transition-transform duration-200",
            isExpanded ? "hidden group-hover/sidebar-expando-section:block" : "group-hover/sidebar-expando-section:block -rotate-90"
          )} />
        )}
      </button>

      {/* Group Items */}
      {(!group.collapsible || isExpanded) && (
        <div className="space-y-0.5 mt-1">
          {group.items.map((item) => {
            const isActive = activeSection === item.id || activeSection.startsWith(`${item.id}-`);
            const isItemExpanded = expandedItems.includes(item.id);

            return (
              <div key={item.id}>
                <button
                  onClick={() => {
                    if (item.expandable) {
                      onItemExpand(item.id);
                    }
                    onItemClick(item.id);
                  }}
                  className={cn(
                    'group flex w-full items-center gap-2.5 rounded-lg px-4 py-2 mx-2 text-sm transition-colors',
                    isActive
                      ? 'bg-[#EDE9F9] text-[#5B50BD] dark:bg-[#231E51] dark:text-[#918AD3]'
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                  )}
                  style={{ width: 'calc(100% - 1rem)' }}
                >
                  <item.icon className={cn(
                    "h-4 w-4 flex-shrink-0",
                    isActive ? "text-[#5B50BD] dark:text-[#918AD3]" : "text-gray-500 dark:text-gray-400"
                  )} />
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.expandable && (
                    <ChevronDown className={cn(
                      "h-3.5 w-3.5 transition-transform duration-200",
                      !isItemExpanded && "-rotate-90"
                    )} />
                  )}
                </button>

                {/* Expandable Content */}
                {item.expandable && isItemExpanded && renderExpandedContent && (
                  <div className="ml-4 mt-1">
                    {renderExpandedContent(item.id)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
