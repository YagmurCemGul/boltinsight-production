'use client';

import { forwardRef, useRef, useState } from 'react';
import type { TextareaHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useAISearch } from '@/hooks/useAISearch';
import { AISuggestionDropdown } from './AISuggestionDropdown';
import { AIAutoFillModal } from './AIAutoFillModal';
import { AIBadge } from './AIBadge';
import { AIHelpGuide } from './AIHelpGuide';
import type { AIFieldContext, AISuggestion, AIAutoFillValues } from '@/types';

export interface AIEnabledTextareaProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'onChange'> {
  fieldContext: AIFieldContext;
  onValueChange?: (value: string) => void;
  onAISuggestion?: (suggestion: AISuggestion) => void;
  onAutoFill?: (values: AIAutoFillValues) => void;
  showAIIcon?: boolean;
  showHelpGuide?: boolean;
  helpGuideKey?: string;
  enableAutoFill?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

export const AIEnabledTextarea = forwardRef<HTMLTextAreaElement, AIEnabledTextareaProps>(
  ({
    fieldContext,
    onValueChange,
    onAISuggestion,
    onAutoFill,
    showAIIcon = true,
    showHelpGuide = false, // Disabled by default to prevent rendering issues
    helpGuideKey,
    enableAutoFill = true,
    className,
    value: controlledValue,
    onChange,
    placeholder,
    ...props
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [internalValue, setInternalValue] = useState('');
    const [showAutoFillModal, setShowAutoFillModal] = useState(false);
    const [pendingAutoFillValues, setPendingAutoFillValues] = useState<AIAutoFillValues | null>(null);
    const [showGuide, setShowGuide] = useState(true);

    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const {
      isOpen,
      isLoading,
      suggestions,
      hasAtTrigger,
      autoFillValues,
      setQuery,
      selectSuggestion,
      close,
      dismissAutoFill,
    } = useAISearch({
      fieldContext,
      onSuggestionSelect: (suggestion) => {
        onAISuggestion?.(suggestion);
      },
      onAutoFill: (values) => {
        if (enableAutoFill) {
          setPendingAutoFillValues(values);
          setShowAutoFillModal(true);
        }
      },
    });

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(e);
      onValueChange?.(newValue);
      setQuery(newValue);
    };

    const handleSuggestionSelect = (suggestion: AISuggestion) => {
      if (suggestion.type === 'autofill' && suggestion.metadata && enableAutoFill) {
        setPendingAutoFillValues(suggestion.metadata as AIAutoFillValues);
        setShowAutoFillModal(true);
        return;
      }

      selectSuggestion(suggestion);

      if (suggestion.type === 'reference' && suggestion.sourceProposalTitle) {
        // For reference suggestions, add a note about the source
        const atIndex = value.lastIndexOf('@');
        const newValue = atIndex >= 0
          ? value.slice(0, atIndex) + `[Using settings from: ${suggestion.sourceProposalTitle}]`
          : value + ` [Using settings from: ${suggestion.sourceProposalTitle}]`;

        setInternalValue(newValue);
        onValueChange?.(newValue);
      }
    };

    const handleAutoFillConfirm = (selectedValues: AIAutoFillValues) => {
      onAutoFill?.(selectedValues);
      setShowAutoFillModal(false);
      setPendingAutoFillValues(null);
      close();

      // Clear the @ query from the text
      const atIndex = value.lastIndexOf('@');
      if (atIndex >= 0) {
        const newValue = value.slice(0, atIndex).trim();
        setInternalValue(newValue);
        onValueChange?.(newValue);
      }
    };

    const handleAutoFillCancel = () => {
      setShowAutoFillModal(false);
      setPendingAutoFillValues(null);
      dismissAutoFill();
    };

    const guideKey = helpGuideKey || `ai-textarea-${fieldContext.component}-${fieldContext.fieldName}`;

    return (
      <>
        <div ref={containerRef} className="relative">
          <div className="relative">
            {/* AI Badge */}
            {showAIIcon && (
              <div className="absolute left-3 top-3 z-10">
                <AIBadge
                  isActive={hasAtTrigger}
                  showTooltip={true}
                  tooltipText="Type @ followed by natural language to auto-fill multiple fields at once"
                  size="sm"
                />
              </div>
            )}

            {/* Textarea */}
            <textarea
              ref={ref}
              value={value}
              onChange={handleChange}
              placeholder={placeholder || 'Type @ followed by natural language to auto-fill fields... (e.g., @500 US males 25-44 online survey)'}
              className={cn(
                'w-full rounded-lg border border-gray-300 dark:border-gray-600',
                'bg-white dark:bg-gray-800',
                'text-gray-900 dark:text-white',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                'focus:outline-none focus:ring-2 focus:ring-[#5B50BD]/20 focus:border-[#5B50BD]',
                'dark:focus:ring-[#918AD3]/20 dark:focus:border-[#918AD3]',
                'transition-all duration-150',
                'resize-y min-h-[80px]',
                showAIIcon ? 'pl-12 pr-4 py-3' : 'px-4 py-3',
                hasAtTrigger && 'ring-2 ring-[#5B50BD]/20 border-[#5B50BD]',
                className
              )}
              {...props}
            />
          </div>

          {/* Help Guide */}
          {showHelpGuide && showGuide && (
            <AIHelpGuide
              featureKey={guideKey}
              title="AI Auto-Fill"
              position="bottom"
              steps={[
                {
                  title: 'Type @ to Start',
                  description: 'Begin typing @ followed by your requirements in natural language.',
                },
                {
                  title: 'Describe Your Needs',
                  description: 'Example: "@500 US males 25-44 online survey for brand tracking"',
                },
                {
                  title: 'Auto-Fill Multiple Fields',
                  description: 'AI will parse your text and offer to fill Market, Sample Size, Gender, Age, Methodology, and more.',
                },
              ]}
              onDismiss={() => setShowGuide(false)}
            />
          )}

          {/* Suggestions Dropdown */}
          <AISuggestionDropdown
            isOpen={isOpen}
            isLoading={isLoading}
            suggestions={suggestions}
            onSelect={handleSuggestionSelect}
            onClose={close}
          />
        </div>

        {/* Auto-Fill Modal */}
        {showAutoFillModal && pendingAutoFillValues && (
          <AIAutoFillModal
            isOpen={showAutoFillModal}
            values={pendingAutoFillValues}
            onConfirm={handleAutoFillConfirm}
            onCancel={handleAutoFillCancel}
          />
        )}
      </>
    );
  }
);

AIEnabledTextarea.displayName = 'AIEnabledTextarea';
