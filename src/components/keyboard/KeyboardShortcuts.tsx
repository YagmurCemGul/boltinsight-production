'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  Command,
  Search,
  Plus,
  Home,
  Settings,
  Calculator,
  BookOpen,
  FileText,
  Moon,
  Sun,
  HelpCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme';

interface KeyboardShortcut {
  keys: string[];
  description: string;
  action: () => void;
  category: 'navigation' | 'actions' | 'editing' | 'general';
  icon?: React.ReactNode;
}

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function KeyboardShortcutsModal({ isOpen, onClose }: KeyboardShortcutsModalProps) {
  const shortcuts: Record<string, { keys: string[]; description: string; icon?: React.ReactNode }[]> = {
    Navigation: [
      { keys: ['⌘', 'K'], description: 'Open command palette / Quick search', icon: <Search className="w-4 h-4" /> },
      { keys: ['⌘', 'H'], description: 'Go to Dashboard', icon: <Home className="w-4 h-4" /> },
      { keys: ['⌘', 'N'], description: 'New Proposal', icon: <Plus className="w-4 h-4" /> },
      { keys: ['⌘', ','], description: 'Open Settings', icon: <Settings className="w-4 h-4" /> },
    ],
    Actions: [
      { keys: ['⌘', 'S'], description: 'Save current document' },
      { keys: ['⌘', 'Enter'], description: 'Submit / Send message' },
      { keys: ['⌘', 'Shift', 'D'], description: 'Toggle dark mode', icon: <Moon className="w-4 h-4" /> },
      { keys: ['Escape'], description: 'Close modal / Cancel' },
    ],
    Tools: [
      { keys: ['⌘', 'Shift', 'C'], description: 'Open Calculators', icon: <Calculator className="w-4 h-4" /> },
      { keys: ['⌘', 'Shift', 'L'], description: 'Open Library', icon: <BookOpen className="w-4 h-4" /> },
      { keys: ['⌘', 'Shift', 'P'], description: 'Search Proposals', icon: <FileText className="w-4 h-4" /> },
    ],
    Help: [
      { keys: ['?'], description: 'Show keyboard shortcuts', icon: <HelpCircle className="w-4 h-4" /> },
      { keys: ['⌘', '/'], description: 'Toggle help panel' },
    ],
  };

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[350] flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-[351] w-full max-w-2xl mx-4 max-h-[80vh] bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#5B50BD] to-[#1ED6BB]">
          <div className="flex items-center gap-3 text-white">
            <Command className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Keyboard Shortcuts</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(80vh-80px)]">
          <div className="grid gap-6 md:grid-cols-2">
            {Object.entries(shortcuts).map(([category, items]) => (
              <div key={category}>
                <h3 className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
                  {category}
                </h3>
                <div className="space-y-2">
                  {items.map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                    >
                      <div className="flex items-center gap-2">
                        {shortcut.icon && (
                          <span className="text-gray-400">{shortcut.icon}</span>
                        )}
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {shortcut.description}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <kbd
                            key={keyIndex}
                            className="px-2 py-1 text-xs font-medium bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 rounded shadow-sm text-gray-600 dark:text-gray-300"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Footer tip */}
          <div className="mt-6 p-4 bg-[#EDE9F9] dark:bg-[#231E51] rounded-lg">
            <p className="text-sm text-[#5B50BD] dark:text-[#918AD3]">
              <span className="font-medium">Pro tip:</span> Press{' '}
              <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 rounded border border-[#5B50BD]/30">⌘</kbd>
              {' '}+{' '}
              <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 rounded border border-[#5B50BD]/30">K</kbd>
              {' '}to quickly access the command palette from anywhere.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== 'undefined') {
    return createPortal(modalContent, document.body);
  }

  return modalContent;
}

// Hook for keyboard shortcuts
export function useKeyboardShortcuts() {
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const { setActiveSection } = useAppStore();
  const { toggleDarkMode } = useThemeStore();

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    const modKey = isMac ? e.metaKey : e.ctrlKey;

    // Don't trigger shortcuts when typing in inputs
    const activeElement = document.activeElement;
    const isInputActive = activeElement instanceof HTMLInputElement ||
                         activeElement instanceof HTMLTextAreaElement ||
                         (activeElement as HTMLElement)?.isContentEditable;

    // Show shortcuts modal with ? key (only when not typing)
    if (e.key === '?' && !isInputActive) {
      e.preventDefault();
      setShowShortcutsModal(true);
      return;
    }

    // Allow some shortcuts even when typing
    if (!modKey) return;

    // Command/Ctrl + K - Quick search / command palette
    if (e.key === 'k') {
      e.preventDefault();
      setShowShortcutsModal(true); // For now, show shortcuts modal
      return;
    }

    // Command/Ctrl + H - Go to Dashboard
    if (e.key === 'h' && !e.shiftKey) {
      e.preventDefault();
      setActiveSection('dashboard');
      return;
    }

    // Command/Ctrl + N - New Proposal
    if (e.key === 'n' && !e.shiftKey) {
      e.preventDefault();
      setActiveSection('new-proposal');
      return;
    }

    // Command/Ctrl + , - Settings
    if (e.key === ',') {
      e.preventDefault();
      setActiveSection('settings');
      return;
    }

    // Command/Ctrl + Shift + D - Toggle dark mode
    if (e.key === 'd' && e.shiftKey) {
      e.preventDefault();
      toggleDarkMode();
      return;
    }

    // Command/Ctrl + Shift + C - Calculators
    if (e.key === 'c' && e.shiftKey) {
      e.preventDefault();
      setActiveSection('calculators');
      return;
    }

    // Command/Ctrl + Shift + L - Library
    if (e.key === 'l' && e.shiftKey) {
      e.preventDefault();
      setActiveSection('library');
      return;
    }

    // Command/Ctrl + Shift + P - Search Proposals
    if (e.key === 'p' && e.shiftKey) {
      e.preventDefault();
      setActiveSection('search-my');
      return;
    }
  }, [setActiveSection, toggleDarkMode]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    showShortcutsModal,
    setShowShortcutsModal,
  };
}

// Component that provides keyboard shortcuts functionality
export function KeyboardShortcutsProvider({ children }: { children: React.ReactNode }) {
  const { showShortcutsModal, setShowShortcutsModal } = useKeyboardShortcuts();

  return (
    <>
      {children}
      <KeyboardShortcutsModal
        isOpen={showShortcutsModal}
        onClose={() => setShowShortcutsModal(false)}
      />
    </>
  );
}

// Standalone button to show shortcuts
export function KeyboardShortcutsButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
        title="Keyboard shortcuts"
      >
        <Command className="w-4 h-4" />
        <span className="hidden sm:inline">Shortcuts</span>
        <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-700 rounded border border-gray-200 dark:border-gray-600">
          ?
        </kbd>
      </button>
      <KeyboardShortcutsModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
