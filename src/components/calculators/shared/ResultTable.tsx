'use client';

import { useState, useMemo } from 'react';
import { ArrowUpDown, ArrowUp, ArrowDown, Download, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface Column<T> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
  width?: string;
  render?: (value: unknown, row: T) => React.ReactNode;
  highlight?: (value: unknown, row: T) => boolean;
}

interface ResultTableProps<T extends Record<string, unknown>> {
  title?: string;
  columns: Column<T>[];
  data: T[];
  highlightRow?: (row: T) => boolean;
  emptyMessage?: string;
  showExport?: boolean;
  compact?: boolean;
}

export function ResultTable<T extends Record<string, unknown>>({
  title,
  columns,
  data,
  highlightRow,
  emptyMessage = 'No data available',
  showExport = true,
  compact = false,
}: ResultTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [copied, setCopied] = useState(false);

  const sortedData = useMemo(() => {
    if (!sortKey) return data;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey as keyof T];
      const bVal = b[sortKey as keyof T];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      const comparison = aVal < bVal ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [data, sortKey, sortDirection]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };

  const handleExportCSV = () => {
    const headers = columns.map(c => c.label).join(',');
    const rows = data.map(row =>
      columns.map(col => {
        const value = row[col.key as keyof T];
        return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
      }).join(',')
    ).join('\n');

    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title?.replace(/\s+/g, '_').toLowerCase() || 'data'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopyTable = async () => {
    const text = [
      columns.map(c => c.label).join('\t'),
      ...data.map(row =>
        columns.map(col => row[col.key as keyof T]).join('\t')
      ),
    ].join('\n');

    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getValue = (row: T, col: Column<T>) => {
    const key = col.key as keyof T;
    return row[key];
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      {(title || showExport) && (
        <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
          {title && (
            <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
          )}
          {showExport && (
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={handleCopyTable}>
                {copied ? <Check className="w-4 h-4 mr-1" /> : <Copy className="w-4 h-4 mr-1" />}
                {copied ? 'Copied' : 'Copy'}
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportCSV}>
                <Download className="w-4 h-4 mr-1" />
                Export CSV
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-100 dark:bg-gray-900">
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  className={cn(
                    'px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider',
                    col.align === 'center' && 'text-center',
                    col.align === 'right' && 'text-right',
                    col.sortable && 'cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors'
                  )}
                  style={{ width: col.width }}
                  onClick={() => col.sortable && handleSort(col.key as string)}
                >
                  <div className={cn(
                    'flex items-center gap-1',
                    col.align === 'center' && 'justify-center',
                    col.align === 'right' && 'justify-end'
                  )}>
                    {col.label}
                    {col.sortable && (
                      <span className="inline-flex">
                        {sortKey === col.key ? (
                          sortDirection === 'asc' ? (
                            <ArrowUp className="w-3 h-3" />
                          ) : (
                            <ArrowDown className="w-3 h-3" />
                          )
                        ) : (
                          <ArrowUpDown className="w-3 h-3 opacity-30" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedData.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-8 text-center text-gray-500 dark:text-gray-400"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              sortedData.map((row, rowIndex) => (
                <tr
                  key={rowIndex}
                  className={cn(
                    'transition-colors',
                    highlightRow?.(row)
                      ? 'bg-[#EDE9F9] dark:bg-[#231E51]'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-900/30'
                  )}
                >
                  {columns.map((col) => {
                    const value = getValue(row, col);
                    const isHighlighted = col.highlight?.(value, row);

                    return (
                      <td
                        key={col.key as string}
                        className={cn(
                          compact ? 'px-3 py-2' : 'px-4 py-3',
                          'text-sm',
                          col.align === 'center' && 'text-center',
                          col.align === 'right' && 'text-right',
                          isHighlighted && 'font-semibold text-[#5B50BD] dark:text-[#918AD3]'
                        )}
                      >
                        {col.render ? col.render(value, row) : String(value ?? '-')}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Sample size reference table preset
interface SampleSizeReferenceRow {
  sampleSize: number;
  moe: string;
  bestFor: string;
  [key: string]: unknown;
}

export const SAMPLE_SIZE_REFERENCE_DATA: SampleSizeReferenceRow[] = [
  { sampleSize: 100, moe: '±9.8%', bestFor: 'Exploratory research' },
  { sampleSize: 200, moe: '±6.9%', bestFor: 'Qualitative supplements' },
  { sampleSize: 300, moe: '±5.7%', bestFor: 'Concept testing' },
  { sampleSize: 400, moe: '±4.9%', bestFor: 'Standard studies' },
  { sampleSize: 500, moe: '±4.4%', bestFor: 'Brand tracking' },
  { sampleSize: 750, moe: '±3.6%', bestFor: 'Detailed analysis' },
  { sampleSize: 1000, moe: '±3.1%', bestFor: 'Robust analysis' },
  { sampleSize: 1500, moe: '±2.5%', bestFor: 'High precision' },
  { sampleSize: 2000, moe: '±2.2%', bestFor: 'Segmentation studies' },
];

export function SampleSizeReferenceTable({ highlightSample }: { highlightSample?: number }) {
  const columns: Column<SampleSizeReferenceRow>[] = [
    {
      key: 'sampleSize',
      label: 'Sample Size',
      sortable: true,
      render: (value) => <span className="font-medium">{(value as number).toLocaleString()}</span>,
    },
    {
      key: 'moe',
      label: 'MOE (95% CI)',
      align: 'center',
      render: (value) => <span className="font-mono">{value as string}</span>,
    },
    {
      key: 'bestFor',
      label: 'Best For',
    },
  ];

  return (
    <ResultTable<SampleSizeReferenceRow>
      title="Sample Size Reference"
      columns={columns}
      data={SAMPLE_SIZE_REFERENCE_DATA}
      highlightRow={(row) => {
        if (!highlightSample) return false;
        const current = row.sampleSize;
        const next = SAMPLE_SIZE_REFERENCE_DATA.find(r => r.sampleSize > current)?.sampleSize || Infinity;
        return highlightSample >= current && highlightSample < next;
      }}
      showExport={false}
      compact
    />
  );
}

// LOI breakdown table preset
interface LOIBreakdownRow {
  questionType: string;
  count: number;
  timePerItem: number;
  totalTime: number;
  [key: string]: unknown;
}

export function LOIBreakdownTable({ breakdown }: { breakdown: LOIBreakdownRow[] }) {
  const columns: Column<LOIBreakdownRow>[] = [
    {
      key: 'questionType',
      label: 'Question Type',
    },
    {
      key: 'count',
      label: 'Count',
      align: 'center',
    },
    {
      key: 'timePerItem',
      label: 'Time/Item',
      align: 'center',
      render: (value) => `${(value as number).toFixed(1)} sec`,
    },
    {
      key: 'totalTime',
      label: 'Total',
      align: 'right',
      render: (value) => {
        const minutes = (value as number) / 60;
        return minutes >= 1 ? `${minutes.toFixed(1)} min` : `${value} sec`;
      },
      highlight: (value) => (value as number) > 120, // Highlight if > 2 minutes
    },
  ];

  const totalTime = breakdown.reduce((sum, row) => sum + row.totalTime, 0);

  return (
    <div className="space-y-2">
      <ResultTable<LOIBreakdownRow>
        title="Survey Duration Breakdown"
        columns={columns}
        data={breakdown}
        showExport={false}
        compact
      />
      <div className="flex justify-end px-4 py-2 bg-gray-100 dark:bg-gray-900 rounded-lg">
        <span className="text-sm text-gray-600 dark:text-gray-400">
          Total Estimated: <span className="font-bold text-gray-900 dark:text-white">{(totalTime / 60).toFixed(1)} minutes</span>
        </span>
      </div>
    </div>
  );
}

// Demographics quota table
interface DemographicsQuotaRow {
  category: string;
  percentage: number;
  count: number;
  feasibility: 'easy' | 'moderate' | 'hard';
  [key: string]: unknown;
}

export function DemographicsQuotaTable({ quotas, total }: { quotas: DemographicsQuotaRow[]; total: number }) {
  const columns: Column<DemographicsQuotaRow>[] = [
    {
      key: 'category',
      label: 'Category',
    },
    {
      key: 'percentage',
      label: '%',
      align: 'center',
      render: (value) => `${value}%`,
    },
    {
      key: 'count',
      label: 'Target n',
      align: 'center',
      render: (value) => (value as number).toLocaleString(),
    },
    {
      key: 'feasibility',
      label: 'Feasibility',
      align: 'center',
      render: (value) => {
        const configs = {
          easy: { emoji: '🟢', label: 'Easy' },
          moderate: { emoji: '🟡', label: 'Moderate' },
          hard: { emoji: '🔴', label: 'Hard' },
        };
        const config = configs[value as 'easy' | 'moderate' | 'hard'];
        return (
          <span className="inline-flex items-center gap-1">
            <span>{config.emoji}</span>
            <span className="text-xs">{config.label}</span>
          </span>
        );
      },
    },
  ];

  return (
    <ResultTable<DemographicsQuotaRow>
      title={`Quota Distribution (n=${total.toLocaleString()})`}
      columns={columns}
      data={quotas}
      showExport
      compact
    />
  );
}

// Benchmark comparison table
interface BenchmarkComparisonRow {
  metric: string;
  yourValue: string;
  industryBenchmark: string;
  clientAverage: string;
  status: 'better' | 'equal' | 'worse';
  [key: string]: unknown;
}

export function BenchmarkComparisonTable({ data }: { data: BenchmarkComparisonRow[] }) {
  const columns: Column<BenchmarkComparisonRow>[] = [
    {
      key: 'metric',
      label: 'Metric',
    },
    {
      key: 'yourValue',
      label: 'Your Value',
      align: 'center',
      render: (value) => <span className="font-semibold">{value as string}</span>,
    },
    {
      key: 'industryBenchmark',
      label: 'Industry',
      align: 'center',
    },
    {
      key: 'clientAverage',
      label: 'Client Avg',
      align: 'center',
    },
    {
      key: 'status',
      label: 'Status',
      align: 'center',
      render: (value) => {
        const configs = {
          better: { emoji: '✓', color: 'text-green-600', label: 'Better' },
          equal: { emoji: '≈', color: 'text-blue-600', label: 'On par' },
          worse: { emoji: '⚠️', color: 'text-yellow-600', label: 'Review' },
        };
        const config = configs[value as 'better' | 'equal' | 'worse'];
        return (
          <span className={cn('inline-flex items-center gap-1', config.color)}>
            <span>{config.emoji}</span>
            <span className="text-xs font-medium">{config.label}</span>
          </span>
        );
      },
    },
  ];

  return (
    <ResultTable<BenchmarkComparisonRow>
      title="Benchmark Comparison"
      columns={columns}
      data={data}
      showExport={false}
      compact
    />
  );
}
