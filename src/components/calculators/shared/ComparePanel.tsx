'use client';

import { useState } from 'react';
import {
  GitCompare,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  Plus,
  Check,
  Users,
  Percent,
  Clock,
  BarChart3,
  PieChart,
  ClipboardCheck,
} from 'lucide-react';
import { Button } from '@/components/ui';
import type { CalculatorResult, CalculatorType } from '@/types/calculator';
import { cn } from '@/lib/utils';

const CALCULATOR_ICONS: Record<CalculatorType, typeof Users> = {
  sample: Users,
  moe: Percent,
  loi: Clock,
  maxdiff: BarChart3,
  demographics: PieChart,
  feasibility: ClipboardCheck,
};

const CALCULATOR_LABELS: Record<CalculatorType, string> = {
  sample: 'Sample Size',
  moe: 'Margin of Error',
  loi: 'LOI',
  maxdiff: 'MaxDiff',
  demographics: 'Demographics',
  feasibility: 'Feasibility',
};

interface ComparePanelProps {
  results: CalculatorResult[];
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose: () => void;
}

export function ComparePanel({ results, onRemove, onClear, onClose }: ComparePanelProps) {
  if (results.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 text-center">
        <GitCompare className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Compare Results</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Add calculation results to compare them side by side
        </p>
        <Button variant="outline" onClick={onClose}>Close</Button>
      </div>
    );
  }

  // Group results by type
  const groupedResults = results.reduce((acc, result) => {
    if (!acc[result.type]) acc[result.type] = [];
    acc[result.type].push(result);
    return acc;
  }, {} as Record<CalculatorType, CalculatorResult[]>);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-[#5B50BD]" />
            <h3 className="font-semibold text-gray-900 dark:text-white">
              Compare Results ({results.length})
            </h3>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClear}>
              Clear All
            </Button>
            <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        {Object.entries(groupedResults).map(([type, typeResults]) => (
          <ComparisonTable
            key={type}
            type={type as CalculatorType}
            results={typeResults}
            onRemove={onRemove}
          />
        ))}
      </div>
    </div>
  );
}

interface ComparisonTableProps {
  type: CalculatorType;
  results: CalculatorResult[];
  onRemove: (id: string) => void;
}

function ComparisonTable({ type, results, onRemove }: ComparisonTableProps) {
  const Icon = CALCULATOR_ICONS[type];
  const label = CALCULATOR_LABELS[type];

  // Get comparison metrics based on calculator type
  const getMetrics = (): { key: string; label: string; format: (r: CalculatorResult) => string }[] => {
    switch (type) {
      case 'sample':
        return [
          { key: 'recommendedSample', label: 'Sample Size', format: (r) => `n=${(r as any).outputs.recommendedSample.toLocaleString()}` },
          { key: 'qualityRating', label: 'Quality', format: (r) => (r as any).outputs.qualityRating },
          { key: 'estimatedCost', label: 'Est. Cost', format: (r) => `$${((r as any).outputs.estimatedCost || 0).toLocaleString()}` },
          { key: 'subgroupCapacity', label: 'Subgroups', format: (r) => (r as any).outputs.subgroupCapacity.toString() },
        ];
      case 'moe':
        return [
          { key: 'marginOfError', label: 'MOE', format: (r) => `±${(r as any).outputs.marginOfError}%` },
          { key: 'qualityRating', label: 'Quality', format: (r) => (r as any).outputs.qualityRating },
          { key: 'sampleSize', label: 'Sample', format: (r) => `n=${(r as any).inputs.sampleSize.toLocaleString()}` },
        ];
      case 'loi':
        return [
          { key: 'estimatedLOI', label: 'Duration', format: (r) => `${(r as any).outputs.estimatedLOI} min` },
          { key: 'costTier', label: 'Cost Tier', format: (r) => (r as any).outputs.costTier },
          { key: 'dropoutRisk', label: 'Dropout Risk', format: (r) => (r as any).outputs.dropoutRisk },
          { key: 'costPerRespondent', label: 'Cost/Resp', format: (r) => `$${(r as any).outputs.costPerRespondent}` },
        ];
      case 'feasibility':
        return [
          { key: 'overallScore', label: 'Score', format: (r) => `${(r as any).outputs.overallScore}/100` },
          { key: 'verdict', label: 'Verdict', format: (r) => (r as any).outputs.verdict.toUpperCase() },
          { key: 'estimatedCost', label: 'Est. Cost', format: (r) => `$${(r as any).outputs.estimatedCost.toLocaleString()}` },
          { key: 'estimatedDays', label: 'Timeline', format: (r) => `${(r as any).outputs.estimatedDays} days` },
        ];
      case 'maxdiff':
        return [
          { key: 'recommendedTasks', label: 'Tasks', format: (r) => (r as any).outputs.recommendedTasks.toString() },
          { key: 'isBalancedDesign', label: 'Balanced', format: (r) => (r as any).outputs.isBalancedDesign ? 'Yes' : 'No' },
          { key: 'estimatedDuration', label: 'Duration', format: (r) => `${(r as any).outputs.estimatedDuration} min` },
          { key: 'reliabilityScore', label: 'Reliability', format: (r) => (r as any).outputs.reliabilityScore },
        ];
      case 'demographics':
        return [
          { key: 'country', label: 'Country', format: (r) => (r as any).inputs.country },
          { key: 'incidenceRate', label: 'Incidence', format: (r) => `${(r as any).outputs.incidenceRate}%` },
          { key: 'isAchievable', label: 'Achievable', format: (r) => (r as any).outputs.isAchievable ? 'Yes' : 'No' },
        ];
      default:
        return [];
    }
  };

  const metrics = getMetrics();

  // Calculate best values for highlighting
  const getBestValue = (metric: string): string | null => {
    if (results.length < 2) return null;

    const values = results.map(r => {
      const output = (r as any).outputs[metric];
      return typeof output === 'number' ? output : null;
    }).filter(v => v !== null);

    if (values.length === 0) return null;

    // For certain metrics, lower is better
    const lowerIsBetter = ['marginOfError', 'dropoutRisk', 'estimatedCost', 'estimatedDays', 'estimatedLOI'];
    const best = lowerIsBetter.includes(metric)
      ? Math.min(...values)
      : Math.max(...values);

    const bestResult = results.find(r => (r as any).outputs[metric] === best);
    return bestResult?.id || null;
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 last:border-0">
      {/* Type header */}
      <div className="px-4 py-2 bg-gray-100 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <Icon className="w-4 h-4 text-[#5B50BD]" />
          <span className="font-medium text-sm text-gray-900 dark:text-white">{label}</span>
          <span className="text-xs text-gray-500">({results.length} calculations)</span>
        </div>
      </div>

      {/* Comparison table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-max">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 w-32">
                Metric
              </th>
              {results.map((result, i) => (
                <th key={result.id} className="px-4 py-2 text-center min-w-32">
                  <div className="flex items-center justify-center gap-2">
                    <span className="text-xs font-medium text-gray-900 dark:text-white">
                      Calc {i + 1}
                    </span>
                    <button
                      onClick={() => onRemove(result.id)}
                      className="p-0.5 hover:bg-red-100 dark:hover:bg-red-950/30 rounded"
                    >
                      <X className="w-3 h-3 text-red-500" />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {metrics.map((metric) => {
              const bestId = getBestValue(metric.key);
              return (
                <tr key={metric.key} className="border-t border-gray-200 dark:border-gray-700">
                  <td className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400">
                    {metric.label}
                  </td>
                  {results.map((result) => {
                    const isBest = bestId === result.id;
                    return (
                      <td
                        key={result.id}
                        className={cn(
                          'px-4 py-2 text-center text-sm',
                          isBest && 'bg-green-50 dark:bg-green-950/20'
                        )}
                      >
                        <span className={cn(
                          'font-medium',
                          isBest ? 'text-green-600 dark:text-green-400' : 'text-gray-900 dark:text-white'
                        )}>
                          {metric.format(result)}
                        </span>
                        {isBest && (
                          <Check className="w-3 h-3 text-green-500 inline ml-1" />
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Add to compare button
interface AddToCompareButtonProps {
  result: CalculatorResult;
  isInComparison: boolean;
  onAdd: () => void;
  onRemove: () => void;
}

export function AddToCompareButton({ result, isInComparison, onAdd, onRemove }: AddToCompareButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={isInComparison ? onRemove : onAdd}
      className={cn(isInComparison && 'bg-[#EDE9F9] dark:bg-[#231E51] border-[#5B50BD]')}
    >
      {isInComparison ? (
        <>
          <Check className="w-4 h-4 mr-1 text-[#5B50BD]" />
          <span className="text-[#5B50BD]">In Compare</span>
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 mr-1" />
          Add to Compare
        </>
      )}
    </Button>
  );
}

// Difference indicator
interface DifferenceIndicatorProps {
  baseValue: number;
  compareValue: number;
  unit?: string;
  lowerIsBetter?: boolean;
}

export function DifferenceIndicator({
  baseValue,
  compareValue,
  unit = '',
  lowerIsBetter = false,
}: DifferenceIndicatorProps) {
  const diff = compareValue - baseValue;
  const percentDiff = baseValue !== 0 ? Math.round((diff / baseValue) * 100) : 0;

  const isPositive = lowerIsBetter ? diff < 0 : diff > 0;
  const isNegative = lowerIsBetter ? diff > 0 : diff < 0;

  return (
    <div className="flex items-center gap-1">
      {diff === 0 ? (
        <Minus className="w-4 h-4 text-gray-400" />
      ) : isPositive ? (
        <TrendingUp className="w-4 h-4 text-green-500" />
      ) : (
        <TrendingDown className="w-4 h-4 text-red-500" />
      )}
      <span className={cn(
        'text-sm font-medium',
        diff === 0 && 'text-gray-500',
        isPositive && 'text-green-600',
        isNegative && 'text-red-600'
      )}>
        {diff > 0 ? '+' : ''}{diff.toLocaleString()}{unit}
        {percentDiff !== 0 && ` (${percentDiff > 0 ? '+' : ''}${percentDiff}%)`}
      </span>
    </div>
  );
}

// Save to favorites button
interface SaveToFavoritesButtonProps {
  onSave: () => void;
  isSaved?: boolean;
}

export function SaveToFavoritesButton({ onSave, isSaved = false }: SaveToFavoritesButtonProps) {
  const [saved, setSaved] = useState(isSaved);

  const handleSave = () => {
    onSave();
    setSaved(true);
    // Reset after 2 seconds
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleSave}
      disabled={saved}
      className={cn(saved && 'bg-green-50 dark:bg-green-950/30 border-green-500')}
    >
      {saved ? (
        <>
          <Check className="w-4 h-4 mr-1 text-green-500" />
          <span className="text-green-600">Saved!</span>
        </>
      ) : (
        <>
          <Plus className="w-4 h-4 mr-1" />
          Save to Favorites
        </>
      )}
    </Button>
  );
}
