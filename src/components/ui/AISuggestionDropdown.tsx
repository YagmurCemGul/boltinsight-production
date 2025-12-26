'use client';

import { useEffect, useRef, useState } from 'react';
import { FileText, Loader2, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AIBadge } from './AIBadge';
import type { AISuggestion } from '@/types';

interface AISuggestionDropdownProps {
  isOpen: boolean;
  isLoading: boolean;
  suggestions: AISuggestion[];
  onSelect: (suggestion: AISuggestion) => void;
  onClose: () => void;
  className?: string;
}

export function AISuggestionDropdown({
  isOpen,
  isLoading,
  suggestions,
  onSelect,
  onClose,
  className,
}: AISuggestionDropdownProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Reset selection when suggestions change
  useEffect(() => {
    setSelectedIndex(0);
  }, [suggestions]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setSelectedIndex(prev =>
            prev < suggestions.length - 1 ? prev + 1 : prev
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setSelectedIndex(prev => prev > 0 ? prev - 1 : 0);
          break;
        case 'Enter':
          e.preventDefault();
          if (suggestions[selectedIndex]) {
            onSelect(suggestions[selectedIndex]);
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, suggestions, selectedIndex, onSelect, onClose]);

  // Close on click outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={dropdownRef}
      className={cn(
        'absolute z-50 mt-1 w-full max-h-[280px] overflow-y-auto',
        'bg-white dark:bg-[#1A163C] border border-gray-200 dark:border-[#3D3766]',
        'rounded-lg shadow-lg',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-3 py-2 border-b border-gray-100 dark:border-[#3D3766]">
        <AIBadge isActive={true} showTooltip={false} size="sm" />
        <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
          Suggestions
        </span>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex items-center gap-2 px-4 py-3 text-gray-500 dark:text-gray-400">
          <Loader2 className="w-4 h-4 animate-spin text-[#5B50BD]" />
          <span className="text-sm">AI is thinking...</span>
        </div>
      )}

      {/* No results */}
      {!isLoading && suggestions.length === 0 && (
        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
          Type more to get suggestions...
        </div>
      )}

      {/* Suggestions list */}
      {!isLoading && suggestions.length > 0 && (
        <div className="py-1">
          {suggestions.map((suggestion, index) => (
            <button
              key={suggestion.id}
              onClick={() => onSelect(suggestion)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                'w-full px-4 py-2.5 text-left flex items-start gap-3 transition-colors',
                selectedIndex === index
                  ? 'bg-[#EDE9F9] dark:bg-[#231E51] border-l-2 border-[#5B50BD]'
                  : 'hover:bg-gray-50 dark:hover:bg-[#231E51]/50 border-l-2 border-transparent'
              )}
            >
              {/* Icon based on type */}
              <div className="flex-shrink-0 mt-0.5">
                {suggestion.type === 'autofill' ? (
                  <Wand2 className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3]" />
                ) : suggestion.type === 'reference' ? (
                  <FileText className="w-4 h-4 text-gray-400" />
                ) : (
                  <AIBadge isActive={true} showTooltip={false} size="sm" />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-800 dark:text-white truncate">
                    {suggestion.text}
                  </span>
                  {/* Confidence indicator */}
                  {suggestion.confidence >= 0.9 && (
                    <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 rounded">
                      High
                    </span>
                  )}
                </div>

                {/* Source reference */}
                {suggestion.sourceProposalTitle ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                    From: {suggestion.sourceProposalTitle}
                  </p>
                ) : null}

                {/* Description from metadata */}
                {suggestion.metadata?.description ? (
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {String(suggestion.metadata.description)}
                  </p>
                ) : null}

                {/* Auto-fill indicator */}
                {suggestion.type === 'autofill' && (
                  <p className="text-xs text-[#5B50BD] dark:text-[#918AD3] mt-0.5">
                    Click to auto-fill multiple fields
                  </p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Footer hint */}
      <div className="px-3 py-2 border-t border-gray-100 dark:border-[#3D3766] bg-gray-50 dark:bg-[#100E28]">
        <p className="text-[10px] text-gray-400 dark:text-gray-500">
          ↑↓ to navigate • Enter to select • Esc to close
        </p>
      </div>
    </div>
  );
}
