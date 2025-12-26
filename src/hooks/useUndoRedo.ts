'use client';

import { useState, useCallback, useRef, useEffect } from 'react';

interface UndoRedoOptions<T> {
  maxHistory?: number;
  debounceMs?: number;
}

interface UndoRedoReturn<T> {
  value: T;
  setValue: (newValue: T | ((prev: T) => T)) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  historyIndex: number;
  historyLength: number;
  reset: (initialValue: T) => void;
}

export function useUndoRedo<T>(
  initialValue: T,
  options: UndoRedoOptions<T> = {}
): UndoRedoReturn<T> {
  const { maxHistory = 50, debounceMs = 500 } = options;

  // History state - stores all states
  const [history, setHistory] = useState<T[]>([initialValue]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Debounce timer ref
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const pendingValueRef = useRef<T | null>(null);

  // Current value is the one at currentIndex
  const value = history[currentIndex];

  // Commit pending changes to history
  const commitToHistory = useCallback((newValue: T) => {
    setHistory((prev) => {
      // Remove any "future" states (redo history) when adding new state
      const newHistory = prev.slice(0, currentIndex + 1);

      // Don't add if the value is the same as the last one
      const lastValue = newHistory[newHistory.length - 1];
      if (JSON.stringify(lastValue) === JSON.stringify(newValue)) {
        return prev;
      }

      // Add new state
      newHistory.push(newValue);

      // Trim if exceeding max history
      if (newHistory.length > maxHistory) {
        return newHistory.slice(-maxHistory);
      }

      return newHistory;
    });

    setCurrentIndex((prev) => {
      // Calculate new index accounting for potential trimming
      const newIndex = Math.min(prev + 1, maxHistory - 1);
      return newIndex;
    });
  }, [currentIndex, maxHistory]);

  // Set value with debounced history update
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    const resolvedValue = typeof newValue === 'function'
      ? (newValue as (prev: T) => T)(history[currentIndex])
      : newValue;

    // Store pending value for immediate UI update
    pendingValueRef.current = resolvedValue;

    // Clear existing debounce timer
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Immediately update the current history entry for UI responsiveness
    setHistory((prev) => {
      const newHistory = [...prev];
      newHistory[currentIndex] = resolvedValue;
      return newHistory;
    });

    // Debounce the actual history commit
    debounceRef.current = setTimeout(() => {
      if (pendingValueRef.current !== null) {
        commitToHistory(pendingValueRef.current);
        pendingValueRef.current = null;
      }
    }, debounceMs);
  }, [currentIndex, history, debounceMs, commitToHistory]);

  // Undo - go back in history
  const undo = useCallback(() => {
    // Clear any pending changes
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    pendingValueRef.current = null;

    setCurrentIndex((prev) => Math.max(0, prev - 1));
  }, []);

  // Redo - go forward in history
  const redo = useCallback(() => {
    // Clear any pending changes
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    pendingValueRef.current = null;

    setCurrentIndex((prev) => Math.min(history.length - 1, prev + 1));
  }, [history.length]);

  // Reset to a new initial value
  const reset = useCallback((initialValue: T) => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }
    pendingValueRef.current = null;

    setHistory([initialValue]);
    setCurrentIndex(0);
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  // Keyboard shortcuts (Ctrl/Cmd + Z for undo, Ctrl/Cmd + Shift + Z for redo)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const modKey = isMac ? e.metaKey : e.ctrlKey;

      if (modKey && e.key === 'z') {
        if (e.shiftKey) {
          e.preventDefault();
          redo();
        } else {
          e.preventDefault();
          undo();
        }
      }

      // Alternative redo shortcut: Ctrl/Cmd + Y
      if (modKey && e.key === 'y') {
        e.preventDefault();
        redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return {
    value,
    setValue,
    undo,
    redo,
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    historyIndex: currentIndex,
    historyLength: history.length,
    reset,
  };
}
