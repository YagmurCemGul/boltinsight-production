'use client';

import { CheckCircle, AlertTriangle, Info, Copy, Check, Plus } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { TOOL_CONFIGS } from './constants';
import { ProposalSelector } from '@/components/meta-learnings-v2/ProposalSelector';
import type { ToolResult } from './types';

interface ToolResultCardProps {
  result: ToolResult;
  className?: string;
}

export function ToolResultCard({ result, className }: ToolResultCardProps) {
  const [copied, setCopied] = useState(false);
  const [showProposalSelector, setShowProposalSelector] = useState(false);
  const config = TOOL_CONFIGS[result.toolType];

  const getQualityConfig = () => {
    switch (result.quality) {
      case 'excellent': return { icon: CheckCircle, color: 'text-green-500', bgColor: 'bg-green-500', label: 'Excellent', circles: 5 };
      case 'good': return { icon: CheckCircle, color: 'text-blue-500', bgColor: 'bg-blue-500', label: 'Good', circles: 4 };
      case 'acceptable': return { icon: Info, color: 'text-amber-500', bgColor: 'bg-amber-500', label: 'Acceptable', circles: 3 };
      case 'poor': return { icon: AlertTriangle, color: 'text-red-500', bgColor: 'bg-red-500', label: 'Poor', circles: 2 };
      default: return null;
    }
  };

  const qualityConfig = getQualityConfig();

  // Generate formatted text for copying/sharing
  const getFormattedContent = () => {
    return [
      `📊 ${config.name} Results`,
      '─'.repeat(30),
      ...result.details.map(d => `${d.label}: ${d.value}`),
      '',
      result.quality ? `Quality: ${result.quality.charAt(0).toUpperCase() + result.quality.slice(1)}` : '',
      '',
      ...(result.recommendations && result.recommendations.length > 0
        ? ['Recommendations:', ...result.recommendations.map(r => `• ${r}`)]
        : []),
    ].filter(Boolean).join('\n');
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getFormattedContent());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={cn('space-y-3', className)}>
      {/* Main result with quality */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Primary result */}
        {result.details.filter(d => d.highlight).map((detail, idx) => (
          <div key={idx} className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-[#5B50BD] dark:text-[#918AD3]">
              {detail.value}
            </span>
            <span className="text-sm text-gray-500 dark:text-gray-400">{detail.label}</span>
          </div>
        ))}

        {/* Quality indicator */}
        {qualityConfig && (
          <div className="flex items-center gap-1.5 ml-2">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className={cn(
                    'w-2 h-2 rounded-full',
                    i <= qualityConfig.circles ? qualityConfig.bgColor : 'bg-gray-200 dark:bg-gray-700'
                  )}
                />
              ))}
            </div>
            <span className={cn('text-xs font-medium', qualityConfig.color)}>
              {qualityConfig.label}
            </span>
          </div>
        )}

      </div>

      {/* Other details */}
      {result.details.filter(d => !d.highlight).length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
          {result.details.filter(d => !d.highlight).map((detail, idx) => (
            <div key={idx} className="flex items-center gap-1.5">
              <span className="text-gray-500 dark:text-gray-400">{detail.label}:</span>
              <span className="text-gray-700 dark:text-gray-300 font-medium">{detail.value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Recommendations */}
      {result.recommendations && result.recommendations.length > 0 && (
        <div className="pt-2 border-t border-gray-100 dark:border-gray-800">
          <div className="space-y-1">
            {result.recommendations.map((rec, idx) => (
              <p key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                <span className="text-[#5B50BD] dark:text-[#918AD3]">•</span>
                {rec}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Action buttons - below the result */}
      <div className="flex items-center gap-2 pt-3 border-t border-gray-100 dark:border-gray-800">
        {/* Add to proposal button */}
        <button
          onClick={() => setShowProposalSelector(!showProposalSelector)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
            showProposalSelector
              ? 'bg-[#5B50BD] text-white border-[#5B50BD] dark:bg-[#918AD3] dark:border-[#918AD3] dark:text-[#100E28]'
              : 'text-[#5B50BD] border-[#5B50BD]/30 hover:bg-[#5B50BD]/10 dark:text-[#918AD3] dark:border-[#918AD3]/30 dark:hover:bg-[#918AD3]/10'
          )}
          title="Add to proposal or project"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add to</span>
        </button>

        {/* Copy button */}
        <button
          onClick={handleCopy}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border',
            copied
              ? 'text-green-600 border-green-300 bg-green-50 dark:bg-green-900/20 dark:border-green-700'
              : 'text-gray-600 border-gray-200 hover:bg-gray-100 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-800'
          )}
          title="Copy results"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copied ? 'Copied!' : 'Copy'}</span>
        </button>
      </div>

      {/* Proposal Selector */}
      {showProposalSelector && (
        <ProposalSelector
          content={getFormattedContent()}
          onClose={() => setShowProposalSelector(false)}
          className="mt-2"
        />
      )}
    </div>
  );
}
