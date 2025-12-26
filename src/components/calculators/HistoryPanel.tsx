'use client';

import { useState, useMemo } from 'react';
import {
  History,
  Search,
  Trash2,
  X,
  ChevronDown,
  ChevronRight,
  Users,
  Percent,
  Clock,
  BarChart3,
  PieChart,
  ClipboardCheck,
  Play,
  Calendar,
  Filter,
} from 'lucide-react';
import { Button, Input } from '@/components/ui';
import { useCalculatorStore } from '@/lib/calculators/store';
import type { CalculatorResult, CalculatorType } from '@/types/calculator';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday, isThisWeek, parseISO } from 'date-fns';

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

const CALCULATOR_COLORS: Record<CalculatorType, string> = {
  sample: 'text-blue-600',
  moe: 'text-blue-600',
  loi: 'text-green-600',
  maxdiff: 'text-[#5B50BD]',
  demographics: 'text-teal-600',
  feasibility: 'text-amber-600',
};

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectResult: (result: CalculatorResult) => void;
  position?: 'left' | 'right';
}

export function HistoryPanel({
  isOpen,
  onClose,
  onSelectResult,
  position = 'right',
}: HistoryPanelProps) {
  const { history, removeFromHistory, clearHistory } = useCalculatorStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<CalculatorType | 'all'>('all');
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['today', 'yesterday']);

  // Group history by date
  const groupedHistory = useMemo(() => {
    let filtered = history;

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter((item) => {
        const linkedTitle = item.linkedProposalTitle?.toLowerCase() || '';
        const type = CALCULATOR_LABELS[item.type].toLowerCase();
        return linkedTitle.includes(query) || type.includes(query);
      });
    }

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter((item) => item.type === filterType);
    }

    // Group by date
    const groups: Record<string, CalculatorResult[]> = {
      today: [],
      yesterday: [],
      thisWeek: [],
      older: [],
    };

    filtered.forEach((item) => {
      const date = item.timestamp instanceof Date ? item.timestamp : parseISO(item.timestamp as unknown as string);
      if (isToday(date)) {
        groups.today.push(item);
      } else if (isYesterday(date)) {
        groups.yesterday.push(item);
      } else if (isThisWeek(date)) {
        groups.thisWeek.push(item);
      } else {
        groups.older.push(item);
      }
    });

    return groups;
  }, [history, searchQuery, filterType]);

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) =>
      prev.includes(group) ? prev.filter((g) => g !== group) : [...prev, group]
    );
  };

  const totalResults = history.length;

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        'fixed inset-y-0 w-80 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-xl z-40 flex flex-col',
        position === 'right' ? 'right-0 border-l' : 'left-0 border-r'
      )}
    >
      {/* Header */}
      <div className="flex-shrink-0 px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#5B50BD]" />
            <h2 className="font-semibold text-gray-900 dark:text-white">History</h2>
            <span className="text-xs px-2 py-0.5 bg-gray-200 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-400">
              {totalResults}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search history..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#5B50BD]/50"
          />
        </div>

        {/* Filter */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          <button
            onClick={() => setFilterType('all')}
            className={cn(
              'px-2 py-1 text-xs rounded-md whitespace-nowrap transition-colors',
              filterType === 'all'
                ? 'bg-[#5B50BD] text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
            )}
          >
            All
          </button>
          {(Object.keys(CALCULATOR_LABELS) as CalculatorType[]).map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={cn(
                'px-2 py-1 text-xs rounded-md whitespace-nowrap transition-colors',
                filterType === type
                  ? 'bg-[#5B50BD] text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              )}
            >
              {CALCULATOR_LABELS[type]}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {totalResults === 0 ? (
          <div className="flex flex-col items-center justify-center h-full px-4 text-center">
            <History className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-3" />
            <p className="text-gray-500 dark:text-gray-400 text-sm">No calculations yet</p>
            <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
              Your calculation history will appear here
            </p>
          </div>
        ) : (
          <div className="py-2">
            {Object.entries(groupedHistory).map(([group, items]) => {
              if (items.length === 0) return null;

              const groupLabels: Record<string, string> = {
                today: 'Today',
                yesterday: 'Yesterday',
                thisWeek: 'This Week',
                older: 'Older',
              };

              const isExpanded = expandedGroups.includes(group);

              return (
                <div key={group} className="mb-2">
                  <button
                    onClick={() => toggleGroup(group)}
                    className="w-full flex items-center justify-between px-4 py-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4" />
                      ) : (
                        <ChevronRight className="w-4 h-4" />
                      )}
                      <span>{groupLabels[group]}</span>
                    </div>
                    <span className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full">
                      {items.length}
                    </span>
                  </button>

                  {isExpanded && (
                    <div className="space-y-1 px-2">
                      {items.map((item) => (
                        <HistoryItem
                          key={item.id}
                          result={item}
                          onSelect={() => onSelectResult(item)}
                          onDelete={() => removeFromHistory(item.id)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {totalResults > 0 && (
        <div className="flex-shrink-0 px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <Button
            variant="outline"
            size="sm"
            onClick={clearHistory}
            className="w-full text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/30"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Clear All History
          </Button>
        </div>
      )}
    </div>
  );
}

interface HistoryItemProps {
  result: CalculatorResult;
  onSelect: () => void;
  onDelete: () => void;
}

function HistoryItem({ result, onSelect, onDelete }: HistoryItemProps) {
  const Icon = CALCULATOR_ICONS[result.type];
  const color = CALCULATOR_COLORS[result.type];
  const label = CALCULATOR_LABELS[result.type];

  const getResultSummary = (): string => {
    switch (result.type) {
      case 'sample':
        return `n=${result.outputs.recommendedSample.toLocaleString()}`;
      case 'moe':
        return `±${result.outputs.marginOfError}%`;
      case 'loi':
        return `${result.outputs.estimatedLOI} min`;
      case 'maxdiff':
        return `${result.inputs.totalItems} items`;
      case 'demographics':
        return result.inputs.country;
      case 'feasibility':
        return `Score: ${result.outputs.overallScore}/100`;
      default:
        return '';
    }
  };

  const date = result.timestamp instanceof Date
    ? result.timestamp
    : new Date(result.timestamp as unknown as string);

  return (
    <div
      className="group flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
      onClick={onSelect}
    >
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800', color)}>
        <Icon className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate">
            {label}
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {getResultSummary()}
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-gray-400 dark:text-gray-500">
          <span>{format(date, 'HH:mm')}</span>
          {result.linkedProposalTitle && (
            <>
              <span>•</span>
              <span className="truncate">{result.linkedProposalTitle}</span>
            </>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect();
          }}
          className="p-1 hover:bg-[#5B50BD]/10 rounded transition-colors"
          title="Re-run calculation"
        >
          <Play className="w-4 h-4 text-[#5B50BD]" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 hover:bg-red-100 dark:hover:bg-red-950/30 rounded transition-colors"
          title="Delete"
        >
          <Trash2 className="w-4 h-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

// Compact history item for inline use
export function HistoryItemCompact({ result, onSelect }: { result: CalculatorResult; onSelect: () => void }) {
  const Icon = CALCULATOR_ICONS[result.type];
  const color = CALCULATOR_COLORS[result.type];

  return (
    <button
      onClick={onSelect}
      className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
    >
      <Icon className={cn('w-3 h-3', color)} />
      <span className="text-xs text-gray-600 dark:text-gray-400">
        {CALCULATOR_LABELS[result.type]}
      </span>
    </button>
  );
}
