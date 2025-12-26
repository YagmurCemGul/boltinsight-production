'use client';

import { forwardRef, useRef, useState } from 'react';
import type { InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import { useAISearch } from '@/hooks/useAISearch';
import { AISuggestionDropdown } from './AISuggestionDropdown';
import { AIBadge } from './AIBadge';
import { AIHelpGuide } from './AIHelpGuide';
import type { AIFieldContext, AISuggestion, AIAutoFillValues } from '@/types';

export interface AIEnabledInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  fieldContext: AIFieldContext;
  onValueChange?: (value: string) => void;
  onAISuggestion?: (suggestion: AISuggestion) => void;
  onAutoFill?: (values: AIAutoFillValues) => void;
  showAIIcon?: boolean;
  showHelpGuide?: boolean;
  helpGuideKey?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const AIEnabledInput = forwardRef<HTMLInputElement, AIEnabledInputProps>(
  ({
    fieldContext,
    onValueChange,
    onAISuggestion,
    onAutoFill,
    showAIIcon = true,
    showHelpGuide = false, // Disabled by default to prevent rendering issues
    helpGuideKey,
    className,
    value: controlledValue,
    onChange,
    placeholder,
    ...props
  }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [internalValue, setInternalValue] = useState('');
    const [showGuide, setShowGuide] = useState(true);

    const value = controlledValue !== undefined ? controlledValue : internalValue;

    const {
      isOpen,
      isLoading,
      suggestions,
      hasAtTrigger,
      setQuery,
      selectSuggestion,
      close,
    } = useAISearch({
      fieldContext,
      onSuggestionSelect: (suggestion) => {
        onAISuggestion?.(suggestion);
        // Update the value with the suggestion text, removing the @ query
        const newValue = suggestion.text;
        setInternalValue(newValue);
        onValueChange?.(newValue);
      },
      onAutoFill,
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;
      setInternalValue(newValue);
      onChange?.(e);
      onValueChange?.(newValue);
      setQuery(newValue);
    };

    const handleSuggestionSelect = (suggestion: AISuggestion) => {
      selectSuggestion(suggestion);

      if (suggestion.type !== 'autofill') {
        // Replace the @ query with the suggestion
        const atIndex = value.lastIndexOf('@');
        const newValue = atIndex >= 0
          ? value.slice(0, atIndex) + suggestion.text
          : suggestion.text;

        setInternalValue(newValue);
        onValueChange?.(newValue);
      }
    };

    const guideKey = helpGuideKey || `ai-input-${fieldContext.component}-${fieldContext.fieldName}`;

    return (
      <div ref={containerRef} className="relative">
        <div className="relative flex items-center">
          {/* AI Badge */}
          {showAIIcon && (
            <div className="absolute left-3 flex items-center z-10">
              <AIBadge
                isActive={hasAtTrigger}
                showTooltip={true}
                tooltipText="Type @ to get AI suggestions from Meta Learnings and past proposals"
                size="sm"
              />
            </div>
          )}

          {/* Input */}
          <input
            ref={ref}
            type="text"
            value={value}
            onChange={handleChange}
            placeholder={placeholder || 'Type @ for AI suggestions...'}
            className={cn(
              'w-full rounded-lg border border-gray-300 dark:border-gray-600',
              'bg-white dark:bg-gray-800',
              'text-gray-900 dark:text-white',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500',
              'focus:outline-none focus:ring-2 focus:ring-[#5B50BD]/20 focus:border-[#5B50BD]',
              'dark:focus:ring-[#918AD3]/20 dark:focus:border-[#918AD3]',
              'transition-all duration-150',
              showAIIcon ? 'pl-12 pr-4 py-2' : 'px-4 py-2',
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
            title="AI-Powered Input"
            position="bottom"
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
    );
  }
);

AIEnabledInput.displayName = 'AIEnabledInput';
