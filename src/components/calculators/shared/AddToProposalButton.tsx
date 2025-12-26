'use client';

import { useState, useRef, useEffect } from 'react';
import { FileText, ChevronDown, Check, Copy, RefreshCw } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useCalculatorStore } from '@/lib/calculators/store';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui';

interface AddToProposalButtonProps {
  calculatorType: 'sample' | 'moe' | 'maxdiff' | 'demographics' | 'feasibility' | 'loi';
  value: string | number;
  fieldMapping?: {
    field: string;
    label: string;
    format?: (value: string | number) => string;
  }[];
  onReset?: () => void;
}

// Default field mappings per calculator type
// Using 'background' field for notes since ProposalContent doesn't have a dedicated notes field
const defaultFieldMappings: Record<string, { field: string; label: string }[]> = {
  sample: [
    { field: 'sampleSize', label: 'Sample Size' },
    { field: 'background', label: 'Background (append)' },
  ],
  moe: [
    { field: 'background', label: 'Background (append)' },
  ],
  maxdiff: [
    { field: 'background', label: 'Background (append)' },
  ],
  demographics: [
    { field: 'targetDefinition', label: 'Target Definition' },
    { field: 'background', label: 'Background (append)' },
  ],
  feasibility: [
    { field: 'background', label: 'Background (append)' },
  ],
  loi: [
    { field: 'loi', label: 'LOI' },
    { field: 'background', label: 'Background (append)' },
  ],
};

export function AddToProposalButton({
  calculatorType,
  value,
  fieldMapping,
  onReset,
}: AddToProposalButtonProps) {
  const { currentProposal, updateProposal } = useAppStore();
  const { currentProposalContext } = useCalculatorStore();

  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mappings = fieldMapping || defaultFieldMappings[calculatorType] || [];

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddToField = (field: string, label: string) => {
    // Determine which proposal to update
    const proposalId = currentProposalContext?.id || currentProposal?.id;

    if (!proposalId) {
      toast.error('No proposal selected. Use @ mention to reference a proposal first.');
      setIsOpen(false);
      return;
    }

    // Format the value
    const formattedValue = typeof value === 'number' ? value.toString() : value;

    // Get the target proposal
    const targetProposal = currentProposal?.id === proposalId ? currentProposal : null;

    if (field === 'background') {
      // Append to existing background
      const existingBackground = targetProposal?.content?.background || '';
      const timestamp = new Date().toLocaleString();
      const newEntry = `\n\n[Calculator Result - ${timestamp}]\n${formattedValue}`;

      updateProposal(proposalId, {
        content: {
          title: targetProposal?.content?.title || 'Untitled',
          client: targetProposal?.content?.client || '',
          ...targetProposal?.content,
          background: existingBackground + newEntry,
        },
      });
    } else if (field === 'loi') {
      // LOI is a number
      const numValue = typeof value === 'number' ? value : parseInt(formattedValue);
      updateProposal(proposalId, {
        content: {
          title: targetProposal?.content?.title || 'Untitled',
          client: targetProposal?.content?.client || '',
          ...targetProposal?.content,
          loi: isNaN(numValue) ? undefined : numValue,
        },
      });
    } else if (field === 'sampleSize') {
      // Sample size is a number
      const numValue = typeof value === 'number' ? value : parseInt(formattedValue);
      updateProposal(proposalId, {
        content: {
          title: targetProposal?.content?.title || 'Untitled',
          client: targetProposal?.content?.client || '',
          ...targetProposal?.content,
          sampleSize: isNaN(numValue) ? undefined : numValue,
        },
      });
    } else {
      // Update other string fields
      updateProposal(proposalId, {
        content: {
          title: targetProposal?.content?.title || 'Untitled',
          client: targetProposal?.content?.client || '',
          ...targetProposal?.content,
          [field]: formattedValue,
        },
      });
    }

    toast.success(`Added to ${label}`);
    setIsOpen(false);
  };

  const handleCopy = async () => {
    const text = typeof value === 'number' ? value.toString() : value;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success('Copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Copy button */}
      <button
        onClick={handleCopy}
        className={cn(
          'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg',
          'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300',
          'hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
        )}
      >
        {copied ? (
          <Check className="w-4 h-4 text-green-600" />
        ) : (
          <Copy className="w-4 h-4" />
        )}
        Copy
      </button>

      {/* Add to Proposal dropdown */}
      <div className="relative" ref={dropdownRef}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg',
            'bg-[#5B50BD] hover:bg-[#4a41a0] text-white transition-colors'
          )}
        >
          <FileText className="w-4 h-4" />
          Add to Proposal
          <ChevronDown className={cn('w-4 h-4 transition-transform', isOpen && 'rotate-180')} />
        </button>

        {isOpen && (
          <div className="absolute right-0 mt-1 w-56 py-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
            {!currentProposalContext && !currentProposal && (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                No proposal selected. Use @ mention first.
              </div>
            )}

            {(currentProposalContext || currentProposal) && (
              <>
                <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-b border-gray-100 dark:border-gray-700">
                  Adding to: {currentProposalContext?.title || currentProposal?.content?.title || 'Current Proposal'}
                </div>

                {mappings.map((mapping) => (
                  <button
                    key={mapping.field}
                    onClick={() => handleAddToField(mapping.field, mapping.label)}
                    className="w-full px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2"
                  >
                    <FileText className="w-4 h-4 text-gray-400" />
                    {mapping.label}
                  </button>
                ))}
              </>
            )}
          </div>
        )}
      </div>

      {/* Reset button */}
      {onReset && (
        <button
          onClick={onReset}
          className={cn(
            'inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg',
            'border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300',
            'hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors'
          )}
        >
          <RefreshCw className="w-4 h-4" />
          Reset
        </button>
      )}
    </div>
  );
}

// Simpler version just for copy
interface CopyResultButtonProps {
  value: string | number;
  label?: string;
}

export function CopyResultButton({ value, label = 'Copy' }: CopyResultButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = typeof value === 'number' ? value.toString() : value;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded',
        'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
        'hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors'
      )}
    >
      {copied ? (
        <>
          <Check className="w-3 h-3 text-green-600" />
          Copied
        </>
      ) : (
        <>
          <Copy className="w-3 h-3" />
          {label}
        </>
      )}
    </button>
  );
}
