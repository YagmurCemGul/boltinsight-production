'use client';

import { useState } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, RefreshCw, ArrowRight, Copy, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastAction {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
}

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
  // Enhanced error features
  recovery?: string; // Recovery suggestion text
  actions?: ToastAction[]; // Action buttons
  errorCode?: string; // Error code for reference
  details?: string; // Technical details (expandable)
}

interface ToastState {
  toasts: Toast[];
  addToast: (toast: Omit<Toast, 'id'>) => void;
  removeToast: (id: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(7);
    set((state) => ({
      toasts: [...state.toasts, { ...toast, id }],
    }));

    // Auto remove after duration (longer for errors with actions)
    const hasActions = toast.actions && toast.actions.length > 0;
    const duration = toast.duration || (hasActions ? 10000 : (toast.type === 'error' ? 6000 : 4000));
    setTimeout(() => {
      set((state) => ({
        toasts: state.toasts.filter((t) => t.id !== id),
      }));
    }, duration);
  },
  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));

// Helper function to show toast with enhanced error support
export const toast = {
  success: (title: string, message?: string) => {
    useToastStore.getState().addToast({ type: 'success', title, message });
  },
  error: (title: string, message?: string, options?: { recovery?: string; actions?: ToastAction[]; errorCode?: string; details?: string }) => {
    useToastStore.getState().addToast({
      type: 'error',
      title,
      message,
      duration: 8000,
      ...options
    });
  },
  warning: (title: string, message?: string) => {
    useToastStore.getState().addToast({ type: 'warning', title, message });
  },
  info: (title: string, message?: string) => {
    useToastStore.getState().addToast({ type: 'info', title, message });
  },
  // Specialized error toasts with recovery suggestions
  networkError: (message?: string) => {
    useToastStore.getState().addToast({
      type: 'error',
      title: 'Connection Error',
      message: message || 'Unable to connect to the server.',
      recovery: 'Check your internet connection and try again.',
      actions: [
        {
          label: 'Retry',
          onClick: () => window.location.reload(),
          icon: <RefreshCw className="w-3 h-3" />,
        },
      ],
      duration: 10000,
    });
  },
  saveError: (message?: string, retryFn?: () => void) => {
    const actions: ToastAction[] = [];
    if (retryFn) {
      actions.push({
        label: 'Try Again',
        onClick: retryFn,
        icon: <RefreshCw className="w-3 h-3" />,
      });
    }
    useToastStore.getState().addToast({
      type: 'error',
      title: 'Save Failed',
      message: message || 'Your changes could not be saved.',
      recovery: 'Your work is preserved locally. Try saving again in a moment.',
      actions,
      duration: 10000,
    });
  },
  validationError: (fields: string[]) => {
    useToastStore.getState().addToast({
      type: 'error',
      title: 'Validation Error',
      message: `Please check the following fields: ${fields.join(', ')}`,
      recovery: 'Correct the highlighted fields and try again.',
      duration: 8000,
    });
  },
  permissionError: (action?: string) => {
    useToastStore.getState().addToast({
      type: 'error',
      title: 'Permission Denied',
      message: action ? `You don't have permission to ${action}.` : 'You don\'t have permission for this action.',
      recovery: 'Contact your administrator if you need access.',
      duration: 8000,
    });
  },
};

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const styles = {
  success: 'bg-green-50 border-green-200 text-green-800 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-300',
  error: 'bg-red-50 border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-700 dark:text-red-300',
  warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-300',
  info: 'bg-[#EDE9F9] border-[#C8C4E9] text-[#5B50BD] dark:bg-[#231E51] dark:border-[#3D3766] dark:text-[#C8C4E9]',
};

const iconStyles = {
  success: 'text-green-500 dark:text-emerald-400',
  error: 'text-red-500 dark:text-red-400',
  warning: 'text-amber-500 dark:text-amber-400',
  info: 'text-[#5B50BD] dark:text-[#918AD3]',
};

function ToastItem({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const [isExiting, setIsExiting] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const Icon = icons[toast.type];

  const handleClose = () => {
    setIsExiting(true);
    setTimeout(onClose, 200);
  };

  const handleAction = (action: ToastAction) => {
    action.onClick();
    handleClose();
  };

  const hasEnhancedFeatures = toast.recovery || toast.actions?.length || toast.errorCode || toast.details;

  return (
    <div
      className={cn(
        'pointer-events-auto flex w-full items-start gap-3 rounded-lg border p-4 shadow-lg transition-all duration-200',
        hasEnhancedFeatures ? 'max-w-md' : 'max-w-sm',
        styles[toast.type],
        isExiting ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'
      )}
    >
      <Icon className={cn('h-5 w-5 flex-shrink-0 mt-0.5', iconStyles[toast.type])} />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium">{toast.title}</p>
          {toast.errorCode && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/10 font-mono">
              {toast.errorCode}
            </span>
          )}
        </div>

        {toast.message && (
          <p className="mt-1 text-xs opacity-80">{toast.message}</p>
        )}

        {/* Recovery suggestion */}
        {toast.recovery && (
          <div className="mt-2 flex items-start gap-1.5 text-xs">
            <ArrowRight className="w-3 h-3 mt-0.5 flex-shrink-0 opacity-60" />
            <span className="opacity-70 italic">{toast.recovery}</span>
          </div>
        )}

        {/* Technical details (expandable) */}
        {toast.details && (
          <div className="mt-2">
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs opacity-60 hover:opacity-100 underline"
            >
              {showDetails ? 'Hide details' : 'Show details'}
            </button>
            {showDetails && (
              <pre className="mt-1 text-[10px] p-2 bg-black/10 rounded overflow-x-auto font-mono">
                {toast.details}
              </pre>
            )}
          </div>
        )}

        {/* Action buttons */}
        {toast.actions && toast.actions.length > 0 && (
          <div className="mt-3 flex items-center gap-2">
            {toast.actions.map((action, index) => (
              <button
                key={index}
                onClick={() => handleAction(action)}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors',
                  toast.type === 'error'
                    ? 'bg-red-100 hover:bg-red-200 text-red-700'
                    : toast.type === 'warning'
                    ? 'bg-amber-100 hover:bg-amber-200 text-amber-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                )}
              >
                {action.icon}
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button
        onClick={handleClose}
        className="flex-shrink-0 rounded p-1 opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

export function ToastContainer() {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
      ))}
    </div>
  );
}
