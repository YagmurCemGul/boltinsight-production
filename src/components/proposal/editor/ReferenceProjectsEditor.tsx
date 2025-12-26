'use client';

import { useState, useRef, useMemo, memo, useCallback } from 'react';
import { Search, X, FileText, Link as LinkIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Input } from '@/components/ui';
import type { Proposal } from '@/types';

interface ReferenceProjectsEditorProps {
  items: string[];
  onChange: (items: string[]) => void;
  proposals: Proposal[];
  currentProposalId: string;
}

export const ReferenceProjectsEditor = memo(function ReferenceProjectsEditor({
  items,
  onChange,
  proposals,
  currentProposalId,
}: ReferenceProjectsEditorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter proposals based on search query (exclude current proposal and already added ones)
  const suggestions = useMemo(() => {
    if (!searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase();
    return proposals
      .filter(
        (p) =>
          p.id !== currentProposalId &&
          p.status !== 'deleted' &&
          !items.some((item) => item.includes(p.id) || item.includes(p.code || ''))
      )
      .filter(
        (p) =>
          p.content.title?.toLowerCase().includes(query) ||
          p.content.client?.toLowerCase().includes(query) ||
          p.code?.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [searchQuery, proposals, currentProposalId, items]);

  const addItem = useCallback(
    (item: string) => {
      if (item.trim() && !items.includes(item.trim())) {
        onChange([...items, item.trim()]);
      }
      setSearchQuery('');
      setShowSuggestions(false);
    },
    [items, onChange]
  );

  const addProposal = useCallback(
    (proposal: Proposal) => {
      const reference = proposal.code
        ? `${proposal.code}: ${proposal.content.title || 'Untitled'} (${proposal.content.client || 'No client'})`
        : `${proposal.content.title || 'Untitled'} (${proposal.content.client || 'No client'})`;
      addItem(reference);
    },
    [addItem]
  );

  const removeItem = useCallback(
    (index: number) => {
      onChange(items.filter((_, i) => i !== index));
    },
    [items, onChange]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && searchQuery.trim()) {
        if (suggestions.length > 0) {
          addProposal(suggestions[0]);
        } else {
          addItem(searchQuery);
        }
      }
      if (e.key === 'Escape') {
        setShowSuggestions(false);
      }
    },
    [searchQuery, suggestions, addProposal, addItem]
  );

  const handleAddClick = useCallback(() => {
    if (searchQuery.trim()) {
      if (suggestions.length > 0) {
        addProposal(suggestions[0]);
      } else {
        addItem(searchQuery);
      }
    }
  }, [searchQuery, suggestions, addProposal, addItem]);

  return (
    <div className="space-y-3">
      {/* Added references */}
      {items.length > 0 && (
        <div className="space-y-2">
          {items.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="flex items-center gap-2 rounded-lg bg-gray-50 dark:bg-gray-800 px-3 py-2"
            >
              <LinkIcon className="h-4 w-4 text-[#5B50BD] flex-shrink-0" />
              <span className="flex-1 text-sm text-gray-700 dark:text-gray-300 truncate">
                {item}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeItem(index)}
                className="h-6 px-2"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Search input with autocomplete */}
      <div className="relative">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(true);
              }}
              onFocus={() => setShowSuggestions(true)}
              onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
              placeholder="Search proposals by title, client, or code..."
              className="pl-9"
              onKeyDown={handleKeyDown}
            />
          </div>
          <Button variant="outline" onClick={handleAddClick}>
            Add
          </Button>
        </div>

        {/* Suggestions dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg max-h-60 overflow-y-auto">
            {suggestions.map((proposal) => (
              <button
                key={proposal.id}
                type="button"
                className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border-b border-gray-100 dark:border-gray-700 last:border-0"
                onMouseDown={(e) => {
                  e.preventDefault();
                  addProposal(proposal);
                }}
              >
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-[#5B50BD] flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {proposal.content.title || 'Untitled'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {proposal.code && (
                        <span className="text-[#5B50BD] font-medium mr-2">{proposal.code}</span>
                      )}
                      {proposal.content.client || 'No client'}
                      <span className="mx-1">•</span>
                      {proposal.author.name}
                    </p>
                  </div>
                  <span
                    className={cn(
                      'text-[10px] px-1.5 py-0.5 rounded-full',
                      proposal.status === 'client_approved' || proposal.status === 'manager_approved'
                        ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                        : proposal.status === 'draft'
                          ? 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                          : proposal.status === 'client_rejected' ||
                              proposal.status === 'manager_rejected'
                            ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                    )}
                  >
                    {proposal.status.replace(/_/g, ' ')}
                  </span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Empty state when searching but no results */}
        {showSuggestions && searchQuery.trim() && suggestions.length === 0 && (
          <div className="absolute z-10 mt-1 w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg p-3">
            <p className="text-sm text-gray-500 text-center">
              No matching proposals found. Press Enter to add as custom reference.
            </p>
          </div>
        )}
      </div>

      {/* Help text */}
      <p className="text-xs text-gray-500">
        Search for existing proposals or enter a custom reference code/link.
      </p>
    </div>
  );
});
