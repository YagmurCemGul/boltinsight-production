'use client';

import { useState, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X, Command, Search, Plus, Settings, FileText, FolderOpen, Save, Undo, Redo } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from './button';

interface ShortcutItem {
  keys: string[];
  label: string;
  icon?: ReactNode;
}

interface ShortcutGroup {
  title: string;
  shortcuts: ShortcutItem[];
}

const defaultShortcuts: ShortcutGroup[] = [
  {
    title: 'General',
    shortcuts: [
      { keys: ['⌘', 'K'], label: 'Open command palette', icon: <Search className="w-4 h-4" /> },
      { keys: ['?'], label: 'Show keyboard shortcuts' },
      { keys: ['Esc'], label: 'Close modal / Cancel' },
    ],
  },
  {
    title: 'Navigation',
    shortcuts: [
      { keys: ['G', 'H'], label: 'Go to Dashboard' },
      { keys: ['G', 'P'], label: 'Go to Proposals', icon: <FileText className="w-4 h-4" /> },
      { keys: ['G', 'J'], label: 'Go to Projects', icon: <FolderOpen className="w-4 h-4" /> },
      { keys: ['G', 'S'], label: 'Go to Settings', icon: <Settings className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Proposals',
    shortcuts: [
      { keys: ['⌘', 'N'], label: 'New proposal', icon: <Plus className="w-4 h-4" /> },
      { keys: ['⌘', 'S'], label: 'Save proposal', icon: <Save className="w-4 h-4" /> },
      { keys: ['⌘', 'Z'], label: 'Undo', icon: <Undo className="w-4 h-4" /> },
      { keys: ['⌘', 'Shift', 'Z'], label: 'Redo', icon: <Redo className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Editor',
    shortcuts: [
      { keys: ['⌘', 'B'], label: 'Bold text' },
      { keys: ['⌘', 'I'], label: 'Italic text' },
      { keys: ['⌘', 'U'], label: 'Underline text' },
      { keys: ['⌘', 'E'], label: 'Toggle AI assistant' },
    ],
  },
];

interface KeyboardShortcutsProps {
  isOpen: boolean;
  onClose: () => void;
  shortcuts?: ShortcutGroup[];
  className?: string;
}

/**
 * KeyboardShortcuts - Modal showing all available keyboard shortcuts
 *
 * Usage:
 * <KeyboardShortcuts isOpen={isOpen} onClose={() => setIsOpen(false)} />
 */
export function KeyboardShortcuts({
  isOpen,
  onClose,
  shortcuts = defaultShortcuts,
  className,
}: KeyboardShortcutsProps) {
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

  const content = (
    <div className="fixed inset-0 z-[250] flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--overlay-medium)] animate-backdrop"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div
        className={cn(
          'relative z-[250] w-full max-w-2xl mx-4 max-h-[80vh]',
          'bg-[var(--surface-overlay)] rounded-xl shadow-[var(--shadow-xl)]',
          'dark:border dark:border-[#3D3766]',
          'animate-scale-in overflow-hidden flex flex-col',
          className
        )}
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 dark:border-[#3D3766] px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-[#EDE9F9] dark:bg-[#231E51]">
              <Command className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                Keyboard Shortcuts
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Quick actions to boost your productivity
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {shortcuts.map((group) => (
              <div key={group.title}>
                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">
                  {group.title}
                </h3>
                <div className="space-y-2">
                  {group.shortcuts.map((shortcut, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-gray-50 dark:hover:bg-[#1A163C] transition-colors"
                    >
                      <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                        {shortcut.icon && (
                          <span className="text-gray-400 dark:text-gray-500">
                            {shortcut.icon}
                          </span>
                        )}
                        <span>{shortcut.label}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIdx) => (
                          <kbd
                            key={keyIdx}
                            className={cn(
                              'inline-flex items-center justify-center min-w-[24px] h-6 px-1.5',
                              'text-xs font-medium rounded',
                              'bg-gray-100 text-gray-700 border border-gray-200',
                              'dark:bg-[#231E51] dark:text-gray-300 dark:border-[#3D3766]'
                            )}
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
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-[#3D3766] px-6 py-3 bg-gray-50 dark:bg-[#1A163C] shrink-0">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            Press <kbd className="px-1.5 py-0.5 bg-gray-200 dark:bg-[#231E51] rounded text-xs mx-1">?</kbd> anytime to show this panel
          </p>
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
 * useKeyboardShortcuts - Hook for managing keyboard shortcuts panel
 */
export function useKeyboardShortcuts() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // ? key to open shortcuts panel (when not in an input)
      if (e.key === '?' && !isInputElement(e.target as HTMLElement)) {
        e.preventDefault();
        setIsOpen(true);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return {
    isOpen,
    setIsOpen,
    open: () => setIsOpen(true),
    close: () => setIsOpen(false),
    toggle: () => setIsOpen((prev) => !prev),
  };
}

function isInputElement(element: HTMLElement): boolean {
  const tagName = element.tagName.toLowerCase();
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    element.isContentEditable
  );
}

/**
 * Kbd - Styled keyboard key component
 */
export function Kbd({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <kbd
      className={cn(
        'inline-flex items-center justify-center min-w-[20px] h-5 px-1.5',
        'text-xs font-medium rounded',
        'bg-gray-100 text-gray-600 border border-gray-200',
        'dark:bg-[#231E51] dark:text-gray-400 dark:border-[#3D3766]',
        className
      )}
    >
      {children}
    </kbd>
  );
}
