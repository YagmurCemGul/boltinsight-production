'use client';

import { useState, useEffect } from 'react';
import { Wand2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Modal } from './modal';
import { Button } from './button';
import type { AIAutoFillValues } from '@/types';

interface AIAutoFillModalProps {
  isOpen: boolean;
  values: AIAutoFillValues;
  onConfirm: (selectedValues: AIAutoFillValues) => void;
  onCancel: () => void;
}

interface FieldConfig {
  key: keyof AIAutoFillValues;
  label: string;
  formatValue: (value: unknown) => string;
}

const FIELD_CONFIGS: FieldConfig[] = [
  { key: 'market', label: 'Market', formatValue: (v) => String(v) },
  { key: 'sampleSize', label: 'Sample Size', formatValue: (v) => String(v) },
  { key: 'gender', label: 'Gender', formatValue: (v) => String(v) },
  { key: 'ageRanges', label: 'Age Ranges', formatValue: (v) => Array.isArray(v) ? v.join(', ') : String(v) },
  { key: 'methodology', label: 'Methodology', formatValue: (v) => formatMethodology(String(v)) },
  { key: 'audienceType', label: 'Audience Type', formatValue: (v) => formatAudienceType(String(v)) },
];

function formatMethodology(value: string): string {
  const map: Record<string, string> = {
    'online_survey': 'Online Survey (CAWI)',
    'telephone': 'Telephone (CATI)',
    'face_to_face': 'Face-to-Face (CAPI)',
    'mobile': 'Mobile Survey',
    'qualitative_idi': 'In-Depth Interviews',
    'focus_groups': 'Focus Groups',
  };
  return map[value] || value;
}

function formatAudienceType(value: string): string {
  const map: Record<string, string> = {
    'general_population': 'General Population',
    'category_users': 'Category Users',
    'brand_users': 'Brand Users',
    'lapsed_users': 'Lapsed Users',
    'non_users': 'Non-Users',
    'b2b': 'B2B Decision Makers',
  };
  return map[value] || value;
}

export function AIAutoFillModal({
  isOpen,
  values,
  onConfirm,
  onCancel,
}: AIAutoFillModalProps) {
  const [selectedFields, setSelectedFields] = useState<Set<keyof AIAutoFillValues>>(new Set());

  // Initialize with all available fields selected
  useEffect(() => {
    const availableFields = FIELD_CONFIGS
      .filter(config => values[config.key] !== undefined && values[config.key] !== null)
      .map(config => config.key);
    setSelectedFields(new Set(availableFields));
  }, [values]);

  const toggleField = (key: keyof AIAutoFillValues) => {
    const newSelected = new Set(selectedFields);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedFields(newSelected);
  };

  const handleConfirm = () => {
    const selectedValues: AIAutoFillValues = {};
    for (const key of selectedFields) {
      if (values[key] !== undefined) {
        (selectedValues as Record<string, unknown>)[key] = values[key];
      }
    }
    onConfirm(selectedValues);
  };

  const availableFields = FIELD_CONFIGS.filter(
    config => values[config.key] !== undefined && values[config.key] !== null
  );

  if (availableFields.length === 0) {
    return null;
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onCancel}
      title=""
      size="sm"
    >
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-3 pb-3 border-b border-gray-200 dark:border-gray-700">
          <div className="w-10 h-10 rounded-full bg-[#EDE9F9] dark:bg-[#231E51] flex items-center justify-center">
            <Wand2 className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              AI Detected Values
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Select which fields to auto-fill
            </p>
          </div>
        </div>

        {/* Field List */}
        <div className="space-y-2">
          {availableFields.map(config => {
            const isSelected = selectedFields.has(config.key);
            const displayValue = config.formatValue(values[config.key]);

            return (
              <button
                key={config.key}
                onClick={() => toggleField(config.key)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-lg border transition-all',
                  isSelected
                    ? 'border-[#5B50BD] bg-[#EDE9F9] dark:bg-[#231E51] dark:border-[#5B50BD]'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                )}
              >
                {/* Checkbox */}
                <div
                  className={cn(
                    'w-5 h-5 rounded flex items-center justify-center border-2 transition-colors',
                    isSelected
                      ? 'bg-[#5B50BD] border-[#5B50BD]'
                      : 'border-gray-300 dark:border-gray-600'
                  )}
                >
                  {isSelected && <Check className="w-3 h-3 text-white" />}
                </div>

                {/* Label and Value */}
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {config.label}
                  </p>
                  <p className={cn(
                    'text-sm',
                    isSelected
                      ? 'text-[#5B50BD] dark:text-[#918AD3]'
                      : 'text-gray-500 dark:text-gray-400'
                  )}>
                    {displayValue}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-2 pt-3 border-t border-gray-200 dark:border-gray-700">
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={selectedFields.size === 0}
          >
            Apply {selectedFields.size > 0 ? `(${selectedFields.size})` : ''}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
