'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import type { AIFieldContext, AISuggestion, AIAutoFillValues } from '@/types';
import { useAppStore } from '@/lib/store';
import { searchAI, parseAutoFillValues, hasAutoFillValues } from '@/lib/ai-service';

interface UseAISearchOptions {
  fieldContext: AIFieldContext;
  debounceMs?: number;
  onSuggestionSelect?: (suggestion: AISuggestion) => void;
  onAutoFill?: (values: AIAutoFillValues) => void;
}

interface UseAISearchReturn {
  isOpen: boolean;
  isLoading: boolean;
  suggestions: AISuggestion[];
  query: string;
  setQuery: (query: string) => void;
  selectSuggestion: (suggestion: AISuggestion) => void;
  close: () => void;
  triggerSearch: (query: string) => void;
  hasAtTrigger: boolean;
  autoFillValues: AIAutoFillValues | null;
  applyAutoFill: () => void;
  dismissAutoFill: () => void;
}

export function useAISearch({
  fieldContext,
  debounceMs = 300,
  onSuggestionSelect,
  onAutoFill,
}: UseAISearchOptions): UseAISearchReturn {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<AISuggestion[]>([]);
  const [query, setQuery] = useState('');
  const [hasAtTrigger, setHasAtTrigger] = useState(false);
  const [autoFillValues, setAutoFillValues] = useState<AIAutoFillValues | null>(null);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const proposals = useAppStore((state) => state.proposals);

  const triggerSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setSuggestions([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    try {
      const response = await searchAI(searchQuery, fieldContext, proposals);
      setSuggestions(response.suggestions);

      // Check for auto-fill suggestions
      const autoFillSuggestion = response.suggestions.find(s => s.type === 'autofill');
      if (autoFillSuggestion?.metadata) {
        setAutoFillValues(autoFillSuggestion.metadata as AIAutoFillValues);
      }
    } catch (error) {
      console.error('AI search error:', error);
      setSuggestions([]);
    } finally {
      setIsLoading(false);
    }
  }, [fieldContext, proposals]);

  const handleQueryChange = useCallback((newQuery: string) => {
    setQuery(newQuery);

    // Check for @ trigger
    const hasAt = newQuery.includes('@');
    setHasAtTrigger(hasAt);

    if (hasAt) {
      setIsOpen(true);

      // Extract query after @
      const atIndex = newQuery.lastIndexOf('@');
      const searchQuery = newQuery.slice(atIndex + 1).trim();

      // Debounce the search
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      if (searchQuery.length >= 2) {
        debounceTimerRef.current = setTimeout(() => {
          triggerSearch(searchQuery);
        }, debounceMs);
      } else {
        setSuggestions([]);
        setIsLoading(false);
      }
    } else {
      setIsOpen(false);
      setSuggestions([]);
      setAutoFillValues(null);
    }
  }, [debounceMs, triggerSearch]);

  const selectSuggestion = useCallback((suggestion: AISuggestion) => {
    if (suggestion.type === 'autofill' && suggestion.metadata) {
      setAutoFillValues(suggestion.metadata as AIAutoFillValues);
      // Don't close, show auto-fill modal
      return;
    }

    onSuggestionSelect?.(suggestion);
    setIsOpen(false);
    setSuggestions([]);
    setQuery('');
    setHasAtTrigger(false);
  }, [onSuggestionSelect]);

  const close = useCallback(() => {
    setIsOpen(false);
    setSuggestions([]);
    setAutoFillValues(null);
  }, []);

  const applyAutoFill = useCallback(() => {
    if (autoFillValues && onAutoFill) {
      onAutoFill(autoFillValues);
    }
    setAutoFillValues(null);
    setIsOpen(false);
    setQuery('');
    setHasAtTrigger(false);
  }, [autoFillValues, onAutoFill]);

  const dismissAutoFill = useCallback(() => {
    setAutoFillValues(null);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  return {
    isOpen,
    isLoading,
    suggestions,
    query,
    setQuery: handleQueryChange,
    selectSuggestion,
    close,
    triggerSearch,
    hasAtTrigger,
    autoFillValues,
    applyAutoFill,
    dismissAutoFill,
  };
}
