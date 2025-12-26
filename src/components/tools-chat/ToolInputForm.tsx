'use client';

import { useState, useEffect } from 'react';
import { ArrowRight } from 'lucide-react';
import { Button, Input, Select } from '@/components/ui';
import { cn } from '@/lib/utils';
import { TOOL_CONFIGS } from './constants';
import type { ToolType } from './types';

interface ToolInputFormProps {
  toolType: ToolType;
  values: Record<string, unknown>;
  onValueChange?: (field: string, value: unknown) => void;
  onSubmit?: (toolType: ToolType, values: Record<string, unknown>) => void;
  onCancel?: () => void;
  readOnly?: boolean;
  className?: string;
}

export function ToolInputForm({
  toolType,
  values,
  onValueChange,
  onSubmit,
  onCancel,
  readOnly = false,
  className,
}: ToolInputFormProps) {
  const config = TOOL_CONFIGS[toolType];
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Local state to track form values - ensures we always have the latest
  const [localValues, setLocalValues] = useState<Record<string, unknown>>(() => ({ ...values }));

  // Sync local values with prop values
  useEffect(() => {
    if (readOnly) {
      // For read-only mode, always use prop values
      setLocalValues({ ...values });
    } else {
      // For editable mode, merge new prop values with existing local values
      // This ensures defaults are included but user input is preserved
      setLocalValues(prev => {
        const merged = { ...values };
        // Preserve user-entered values
        Object.keys(prev).forEach(key => {
          if (prev[key] !== undefined && prev[key] !== '') {
            merged[key] = prev[key];
          }
        });
        return merged;
      });
    }
  }, [values, readOnly]);

  // Handle value change - update both local state and parent
  const handleValueChange = (field: string, value: unknown) => {
    setLocalValues(prev => ({ ...prev, [field]: value }));
    onValueChange?.(field, value);
  };

  // Get the current value for a field (prefer local state for editable, prop for read-only)
  const getValue = (fieldName: string) => {
    if (readOnly) {
      return values[fieldName];
    }
    return localValues[fieldName] !== undefined ? localValues[fieldName] : values[fieldName];
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    config.fields.forEach(field => {
      if (field.required) {
        const value = getValue(field.name);
        if (value === undefined || value === '' || value === null) {
          newErrors[field.name] = `Required`;
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate() && onSubmit) {
      // Merge prop values (defaults) with local values (user input)
      // Local values override prop values
      const mergedValues = { ...values, ...localValues };
      onSubmit(toolType, mergedValues);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !readOnly) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Inline form fields */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {config.fields.map(field => (
          <div key={field.name} className="space-y-1">
            <label className="text-xs text-gray-500 dark:text-gray-400">
              {field.label}
              {field.required && <span className="text-red-400 ml-0.5">*</span>}
            </label>

            {field.type === 'select' ? (
              <Select
                options={field.options || []}
                value={String(getValue(field.name) || field.defaultValue || '')}
                onChange={(e) => handleValueChange(field.name, e.target.value)}
                disabled={readOnly}
                className={cn(
                  'h-9 text-sm',
                  readOnly && 'opacity-70 cursor-not-allowed bg-gray-100 dark:bg-gray-700',
                  errors[field.name] && 'border-red-400 focus:border-red-400'
                )}
              />
            ) : (
              <Input
                type={field.type}
                value={getValue(field.name) !== undefined ? String(getValue(field.name)) : ''}
                onChange={(e) => handleValueChange(field.name, e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={field.placeholder}
                min={field.min}
                max={field.max}
                step={field.step}
                readOnly={readOnly}
                disabled={readOnly}
                className={cn(
                  'h-9 text-sm',
                  readOnly && 'opacity-70 cursor-not-allowed bg-gray-100 dark:bg-gray-700',
                  errors[field.name] && 'border-red-400 focus:border-red-400'
                )}
              />
            )}

            {errors[field.name] && (
              <p className="text-[10px] text-red-400">{errors[field.name]}</p>
            )}
          </div>
        ))}
      </div>

      {/* Submit row - hidden in readOnly mode */}
      {!readOnly && (
        <div className="flex items-center gap-2">
          <Button
            onClick={handleSubmit}
            size="sm"
            className="bg-[#5B50BD] hover:bg-[#4A41A0] h-8 px-4 text-xs"
          >
            Calculate
            <ArrowRight className="w-3 h-3 ml-1.5" />
          </Button>
          <button
            onClick={onCancel}
            className="text-xs text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            Cancel
          </button>
        </div>
      )}
    </div>
  );
}
