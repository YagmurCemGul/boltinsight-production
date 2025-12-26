'use client';

import { useState, useEffect, memo, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { Button, Textarea } from '@/components/ui';
import { TARGET_CRITERIA } from './constants';

interface TargetDefinitionEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export const TargetDefinitionEditor = memo(function TargetDefinitionEditor({
  value,
  onChange,
}: TargetDefinitionEditorProps) {
  const [selectedCriteria, setSelectedCriteria] = useState<Record<string, string[]>>({});

  // Parse existing value to extract selected criteria on mount
  useEffect(() => {
    const criteria: Record<string, string[]> = {};
    Object.entries(TARGET_CRITERIA).forEach(([key, config]) => {
      config.options.forEach((option) => {
        if (value.toLowerCase().includes(option.value.toLowerCase())) {
          if (!criteria[key]) criteria[key] = [];
          if (!criteria[key].includes(option.value)) {
            criteria[key].push(option.value);
          }
        }
      });
    });
    setSelectedCriteria(criteria);
  }, []);

  const toggleCriterion = useCallback((category: string, optionValue: string) => {
    setSelectedCriteria((prev) => {
      const current = prev[category] || [];
      const updated = current.includes(optionValue)
        ? current.filter((v) => v !== optionValue)
        : [...current, optionValue];

      return { ...prev, [category]: updated };
    });
  }, []);

  const buildTargetString = useCallback(() => {
    const parts: string[] = [];

    if (selectedCriteria.age?.length) {
      parts.push(`Age: ${selectedCriteria.age.join(', ')}`);
    }
    if (selectedCriteria.gender?.length) {
      parts.push(`Gender: ${selectedCriteria.gender.join(', ')}`);
    }
    if (selectedCriteria.income?.length) {
      parts.push(`Income: ${selectedCriteria.income.join(', ')}`);
    }
    if (selectedCriteria.location?.length) {
      parts.push(`Location: ${selectedCriteria.location.join(', ')}`);
    }
    if (selectedCriteria.employment?.length) {
      parts.push(`Employment: ${selectedCriteria.employment.join(', ')}`);
    }
    if (selectedCriteria.household?.length) {
      parts.push(`Household: ${selectedCriteria.household.join(', ')}`);
    }
    if (selectedCriteria.brandUsage?.length) {
      parts.push(`Brand Usage: ${selectedCriteria.brandUsage.join(', ')}`);
    }
    if (selectedCriteria.purchaseFrequency?.length) {
      parts.push(`Purchase Frequency: ${selectedCriteria.purchaseFrequency.join(', ')}`);
    }

    return parts.join('\n');
  }, [selectedCriteria]);

  const applySelectedCriteria = useCallback(() => {
    const criteriaString = buildTargetString();
    if (criteriaString) {
      const newValue = value
        ? `${value}\n\n--- Selected Criteria ---\n${criteriaString}`
        : criteriaString;
      onChange(newValue);
    }
  }, [buildTargetString, value, onChange]);

  return (
    <div className="space-y-6">
      {/* Free-form description */}
      <div>
        <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="e.g., Adults 18-45, primary grocery shoppers, who have purchased soft drinks in the past month..."
          className="min-h-[120px]"
        />
      </div>

      {/* Selectable criteria */}
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Quick Select Criteria
          </h3>
          <Button variant="outline" size="sm" onClick={applySelectedCriteria}>
            Apply Selected
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Object.entries(TARGET_CRITERIA).map(([key, config]) => (
            <div key={key} className="space-y-2">
              <label className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide">
                {config.label}
              </label>
              <div className="flex flex-wrap gap-1.5">
                {config.options.map((option) => {
                  const isSelected = selectedCriteria[key]?.includes(option.value);
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => toggleCriterion(key, option.value)}
                      className={cn(
                        'px-2.5 py-1 text-xs rounded-full border transition-all',
                        isSelected
                          ? 'bg-[#5B50BD] text-white border-[#5B50BD]'
                          : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 border-gray-300 dark:border-gray-600 hover:border-[#5B50BD] hover:text-[#5B50BD]'
                      )}
                    >
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Selected summary */}
        {Object.values(selectedCriteria).some((arr) => arr.length > 0) && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
              Selected criteria preview:
            </p>
            <div className="text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded-lg p-3 whitespace-pre-line">
              {buildTargetString() || 'No criteria selected'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
});
