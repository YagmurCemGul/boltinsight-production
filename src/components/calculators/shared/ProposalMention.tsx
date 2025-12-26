'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { AtSign, FileText, X, Search, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useCalculatorStore } from '@/lib/calculators/store';
import type { ProposalContext } from '@/types/calculator';
import type { Proposal } from '@/types';
import { cn } from '@/lib/utils';

interface ProposalMentionProps {
  onSelect: (context: ProposalContext) => void;
  onClear?: () => void;
  placeholder?: string;
}

export function ProposalMention({ onSelect, onClear, placeholder = 'Type @ to reference a proposal...' }: ProposalMentionProps) {
  const { proposals } = useAppStore();
  const { currentProposalContext, setProposalContext } = useCalculatorStore();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter proposals based on search query
  const filteredProposals = useMemo(() => {
    if (!query && !isOpen) return [];

    const searchTerm = query.startsWith('@') ? query.slice(1) : query;

    return proposals
      .filter((p) => p.status !== 'deleted')
      .filter((p) => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return (
          p.content.title?.toLowerCase().includes(term) ||
          p.code?.toLowerCase().includes(term) ||
          p.content.client?.toLowerCase().includes(term)
        );
      })
      .slice(0, 8); // Limit results
  }, [proposals, query, isOpen]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.startsWith('@') || value.length > 0) {
      setIsOpen(true);
      setSelectedIndex(0);
    } else {
      setIsOpen(false);
    }
  };

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === '@') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredProposals.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredProposals[selectedIndex]) {
          selectProposal(filteredProposals[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
    }
  };

  // Select a proposal
  const selectProposal = (proposal: Proposal) => {
    // Extract countries from markets array
    const countriesFromMarkets = proposal.content.markets?.map(m => m.country) || [];

    // Convert quotas to string format if present
    const quotasString = proposal.content.quotas
      ? proposal.content.quotas.map(q => `${q.dimension}: ${q.categories.map(c => `${c.name} (${c.percentage}%)`).join(', ')}`).join('; ')
      : undefined;

    const context: ProposalContext = {
      id: proposal.id,
      title: proposal.content.title || 'Untitled',
      code: proposal.code,
      methodology: proposal.content.methodology?.type,
      sampleSize: proposal.content.sampleSize,
      countries: countriesFromMarkets.length > 0 ? countriesFromMarkets : undefined,
      loi: proposal.content.loi,
      quotas: quotasString,
    };

    setProposalContext(context);
    onSelect(context);
    setIsOpen(false);
    setQuery('');
  };

  // Clear selection
  const handleClear = () => {
    setProposalContext(null);
    setQuery('');
    onClear?.();
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If we have a selected proposal, show it
  if (currentProposalContext) {
    return (
      <div className="relative">
        <div className="flex items-center gap-2 px-3 py-2 bg-[#EDE9F9] dark:bg-[#231E51] border border-[#5B50BD]/30 rounded-lg">
          <AtSign className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3]" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                {currentProposalContext.title}
              </span>
              {currentProposalContext.code && (
                <span className="text-xs px-1.5 py-0.5 bg-[#5B50BD]/20 text-[#5B50BD] dark:text-[#918AD3] rounded">
                  {currentProposalContext.code}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
              {currentProposalContext.sampleSize && (
                <span>n={currentProposalContext.sampleSize}</span>
              )}
              {currentProposalContext.methodology && (
                <span>• {currentProposalContext.methodology}</span>
              )}
              {currentProposalContext.countries && currentProposalContext.countries.length > 0 && (
                <span>• {currentProposalContext.countries.join(', ')}</span>
              )}
            </div>
          </div>
          <button
            onClick={handleClear}
            className="p-1 hover:bg-[#5B50BD]/20 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-9 pr-3 py-2 bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700 rounded-lg',
            'text-sm text-gray-900 dark:text-white placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-[#5B50BD]/50 focus:border-[#5B50BD]',
            'transition-colors'
          )}
        />
        {query.length > 0 && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute z-50 w-full mt-1 py-1',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg',
            'max-h-80 overflow-y-auto'
          )}
        >
          {filteredProposals.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 text-center">
              <Search className="w-5 h-5 mx-auto mb-2 opacity-50" />
              {query ? 'No proposals found' : 'Type to search proposals'}
            </div>
          ) : (
            filteredProposals.map((proposal, index) => (
              <button
                key={proposal.id}
                onClick={() => selectProposal(proposal)}
                className={cn(
                  'w-full px-3 py-2 flex items-start gap-3 text-left',
                  'transition-colors',
                  index === selectedIndex
                    ? 'bg-[#EDE9F9] dark:bg-[#231E51]'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                )}
              >
                <FileText className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3] flex-shrink-0 mt-0.5" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                      {proposal.content.title || 'Untitled'}
                    </span>
                    {proposal.code && (
                      <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                        {proposal.code}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    {proposal.content.client && (
                      <span>{proposal.content.client}</span>
                    )}
                    {proposal.content.sampleSize && (
                      <span>• n={proposal.content.sampleSize}</span>
                    )}
                    {proposal.content.methodology?.type && (
                      <span>• {proposal.content.methodology.type}</span>
                    )}
                  </div>
                </div>
                {index === selectedIndex && (
                  <Check className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3] flex-shrink-0" />
                )}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}

