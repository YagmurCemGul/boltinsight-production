'use client';

import { useState, useEffect, useRef, useCallback, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  FileText,
  FolderOpen,
  BookOpen,
  Calculator,
  Settings,
  Plus,
  Clock,
  X,
  ArrowRight,
  Command,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from './input';

// Types
export type CommandCategory = 'recent' | 'actions' | 'proposals' | 'projects' | 'resources' | 'settings';

export interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  category: CommandCategory;
  keywords?: string[];
  shortcut?: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  items: CommandItem[];
  placeholder?: string;
  recentSearches?: string[];
  onRecentSearchSelect?: (query: string) => void;
  onClearRecentSearches?: () => void;
}

// Category labels and icons
const categoryConfig = {
  recent: { label: 'Recent Searches', icon: Clock },
  actions: { label: 'Quick Actions', icon: ArrowRight },
  proposals: { label: 'Proposals', icon: FileText },
  projects: { label: 'Projects', icon: FolderOpen },
  resources: { label: 'Resources', icon: BookOpen },
  settings: { label: 'Settings', icon: Settings },
};

// Simple fuzzy search
function fuzzyMatch(text: string, query: string): boolean {
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();

  if (lowerQuery.length === 0) return true;
  if (lowerText.includes(lowerQuery)) return true;

  // Simple fuzzy: check if all query chars appear in order
  let queryIndex = 0;
  for (let i = 0; i < lowerText.length && queryIndex < lowerQuery.length; i++) {
    if (lowerText[i] === lowerQuery[queryIndex]) {
      queryIndex++;
    }
  }
  return queryIndex === lowerQuery.length;
}

function highlightMatch(text: string, query: string): ReactNode {
  if (!query) return text;

  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);

  if (index === -1) return text;

  return (
    <>
      {text.slice(0, index)}
      <span className="bg-[#EDE9F9] dark:bg-[#3D3766] text-[#5B50BD] dark:text-[#C8C4E9] rounded px-0.5">
        {text.slice(index, index + query.length)}
      </span>
      {text.slice(index + query.length)}
    </>
  );
}

/**
 * CommandPalette - Global search and command palette (⌘K)
 *
 * Usage:
 * <CommandPalette
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   items={commandItems}
 * />
 */
export function CommandPalette({
  isOpen,
  onClose,
  items,
  placeholder = 'Search proposals, projects, resources...',
  recentSearches = [],
  onRecentSearchSelect,
  onClearRecentSearches,
}: CommandPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Filter items based on query
  const filteredItems = items.filter((item) => {
    if (!query) return true;
    const searchText = [item.label, item.description, ...(item.keywords || [])].join(' ');
    return fuzzyMatch(searchText, query);
  });

  // Group items by category
  const groupedItems = filteredItems.reduce((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, {} as Record<string, CommandItem[]>);

  // Flatten for keyboard navigation
  const flatItems = Object.values(groupedItems).flat();

  // Reset selection when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen]);

  // Scroll selected item into view
  useEffect(() => {
    const selectedElement = listRef.current?.querySelector(`[data-index="${selectedIndex}"]`);
    selectedElement?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex((prev) => (prev + 1) % flatItems.length);
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex((prev) => (prev - 1 + flatItems.length) % flatItems.length);
          break;
        case 'Enter':
          e.preventDefault();
          if (flatItems[selectedIndex]) {
            flatItems[selectedIndex].onSelect();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [flatItems, selectedIndex, onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const content = (
    <div
      className="fixed inset-0 z-[300] flex items-start justify-center pt-[15vh]"
      onClick={handleBackdropClick}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[var(--overlay-light)] backdrop-blur-sm animate-fade-in"
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'relative w-full max-w-xl mx-4',
          'bg-[var(--surface-overlay)] rounded-xl shadow-[var(--shadow-xl)]',
          'border border-gray-200 dark:border-[#3D3766]',
          'animate-scale-in overflow-hidden'
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-200 dark:border-[#3D3766]">
          <Search className="w-5 h-5 text-gray-400 dark:text-gray-500 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              'flex-1 bg-transparent border-none outline-none',
              'text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'text-base'
            )}
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 hover:bg-gray-100 dark:hover:bg-[#2D2760] rounded"
            >
              <X className="w-4 h-4 text-gray-400" />
            </button>
          )}
          <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 dark:bg-[#231E51] rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div
          ref={listRef}
          className="max-h-[60vh] overflow-y-auto py-2"
        >
          {/* Recent Searches (when no query) */}
          {!query && recentSearches.length > 0 && (
            <div className="px-2 pb-2">
              <div className="flex items-center justify-between px-2 py-1">
                <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Recent Searches
                </span>
                {onClearRecentSearches && (
                  <button
                    onClick={onClearRecentSearches}
                    className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  >
                    Clear
                  </button>
                )}
              </div>
              <div className="space-y-0.5">
                {recentSearches.slice(0, 5).map((search, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      onRecentSearchSelect?.(search);
                      setQuery(search);
                    }}
                    className={cn(
                      'flex items-center gap-3 w-full px-3 py-2 rounded-lg text-left',
                      'text-gray-700 dark:text-gray-200',
                      'hover:bg-gray-100 dark:hover:bg-[#1A163C]',
                      'transition-colors duration-100'
                    )}
                  >
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span className="text-sm">{search}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Grouped Results */}
          {Object.entries(groupedItems).length > 0 ? (
            Object.entries(groupedItems).map(([category, categoryItems]) => {
              const config = categoryConfig[category as keyof typeof categoryConfig];
              let currentIndex = flatItems.findIndex((item) => item === categoryItems[0]);

              return (
                <div key={category} className="px-2 pb-2">
                  <div className="flex items-center gap-2 px-2 py-1">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      {config?.label || category}
                    </span>
                  </div>
                  <div className="space-y-0.5">
                    {categoryItems.map((item, i) => {
                      const itemIndex = currentIndex + i;
                      const isSelected = itemIndex === selectedIndex;

                      return (
                        <button
                          key={item.id}
                          data-index={itemIndex}
                          onClick={() => {
                            item.onSelect();
                            onClose();
                          }}
                          onMouseEnter={() => setSelectedIndex(itemIndex)}
                          className={cn(
                            'flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-left',
                            'transition-colors duration-100',
                            isSelected
                              ? 'bg-[#EDE9F9] dark:bg-[#231E51]'
                              : 'hover:bg-gray-100 dark:hover:bg-[#1A163C]'
                          )}
                        >
                          {/* Icon */}
                          <div
                            className={cn(
                              'flex items-center justify-center w-8 h-8 rounded-lg shrink-0',
                              isSelected
                                ? 'bg-[#5B50BD] text-white dark:bg-[#918AD3] dark:text-[#100E28]'
                                : 'bg-gray-100 text-gray-500 dark:bg-[#2D2760] dark:text-gray-400'
                            )}
                          >
                            {item.icon || <FileText className="w-4 h-4" />}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                              {highlightMatch(item.label, query)}
                            </div>
                            {item.description && (
                              <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                {item.description}
                              </div>
                            )}
                          </div>

                          {/* Shortcut */}
                          {item.shortcut && (
                            <kbd className="hidden sm:flex items-center gap-1 px-2 py-1 text-xs text-gray-400 bg-gray-100 dark:bg-[#231E51] rounded shrink-0">
                              {item.shortcut}
                            </kbd>
                          )}

                          {/* Arrow indicator when selected */}
                          {isSelected && (
                            <ArrowRight className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3] shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })
          ) : (
            // Empty state
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Search className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No results found for "{query}"
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Try different keywords or check spelling
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-[#3D3766] bg-gray-50 dark:bg-[#1A163C]">
          <div className="flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-[#231E51] rounded">↑↓</kbd>
              Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-[#231E51] rounded">↵</kbd>
              Select
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-[#231E51] rounded">ESC</kbd>
              Close
            </span>
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Command className="w-3 h-3" />
            <span>K to open</span>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(content, document.body);
  }

  return content;
}

/**
 * useCommandPalette - Hook for managing command palette state
 */
export function useCommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    const stored = localStorage.getItem('commandPalette:recentSearches');
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Global keyboard shortcut (⌘K or Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addRecentSearch = useCallback((query: string) => {
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s !== query);
      const updated = [query, ...filtered].slice(0, 10);
      localStorage.setItem('commandPalette:recentSearches', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('commandPalette:recentSearches');
  }, []);

  return {
    isOpen,
    setIsOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
    recentSearches,
    addRecentSearch,
    clearRecentSearches,
  };
}

/**
 * Default command items generator
 */
export function createDefaultCommands(handlers: {
  onNewProposal?: () => void;
  onOpenCalculators?: () => void;
  onOpenSettings?: () => void;
  onNavigate?: (path: string) => void;
}): CommandItem[] {
  return [
    {
      id: 'new-proposal',
      label: 'New Proposal',
      description: 'Create a new research proposal',
      icon: <Plus className="w-4 h-4" />,
      category: 'actions',
      shortcut: '⌘N',
      keywords: ['create', 'add', 'proposal'],
      onSelect: handlers.onNewProposal || (() => {}),
    },
    {
      id: 'calculators',
      label: 'Open Calculators',
      description: 'Sample size and margin of error calculators',
      icon: <Calculator className="w-4 h-4" />,
      category: 'actions',
      keywords: ['sample', 'size', 'margin', 'error', 'calculator'],
      onSelect: handlers.onOpenCalculators || (() => {}),
    },
    {
      id: 'settings',
      label: 'Settings',
      description: 'Manage your account and preferences',
      icon: <Settings className="w-4 h-4" />,
      category: 'settings',
      shortcut: '⌘,',
      keywords: ['preferences', 'account', 'profile'],
      onSelect: handlers.onOpenSettings || (() => {}),
    },
  ];
}
