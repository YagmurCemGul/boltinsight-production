'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { ChevronUp, ChevronDown, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { ROW_STATUS_COLORS, TREND_ICONS } from './constants';
import type { DataTableProps, TableHeader, TableRow, TrendDirection } from './types';

type SortDirection = 'asc' | 'desc' | null;

interface SortState {
  key: string;
  direction: SortDirection;
}

function TrendIndicator({ trend }: { trend: TrendDirection }) {
  const config = {
    up: {
      color: 'text-emerald-600 dark:text-emerald-400',
      symbol: TREND_ICONS.up,
    },
    down: {
      color: 'text-amber-600 dark:text-amber-400',
      symbol: TREND_ICONS.down,
    },
    neutral: {
      color: 'text-gray-500 dark:text-gray-400',
      symbol: TREND_ICONS.neutral,
    },
  };

  const { color, symbol } = config[trend];

  return (
    <span className={cn('inline-flex items-center gap-1 font-medium', color)}>
      {symbol}
    </span>
  );
}

export function DataTable({
  headers,
  rows,
  title,
  sortable = true,
  onRowClick,
  showTrendIndicators = true,
  className,
}: DataTableProps) {
  const [sortState, setSortState] = useState<SortState>({ key: '', direction: null });

  const handleSort = (header: TableHeader) => {
    if (!sortable || !header.sortable) return;

    setSortState((prev) => {
      if (prev.key !== header.key) {
        return { key: header.key, direction: 'asc' };
      }
      if (prev.direction === 'asc') {
        return { key: header.key, direction: 'desc' };
      }
      return { key: '', direction: null };
    });
  };

  const sortedRows = useMemo(() => {
    if (!sortState.key || !sortState.direction) return rows;

    return [...rows].sort((a, b) => {
      const aVal = a.data[sortState.key];
      const bVal = b.data[sortState.key];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortState.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortState.direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });
  }, [rows, sortState]);

  return (
    <div className={cn('rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden', className)}>
      {title && (
        <div className="px-2 sm:px-3 py-1.5 sm:py-2 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-[10px] sm:text-xs font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[300px]">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/80">
              {headers.map((header) => (
                <th
                  key={header.key}
                  className={cn(
                    'px-2 sm:px-3 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider whitespace-nowrap',
                    'text-gray-500 dark:text-gray-400',
                    header.align === 'center' && 'text-center',
                    header.align === 'right' && 'text-right',
                    sortable && header.sortable && 'cursor-pointer select-none hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  onClick={() => handleSort(header)}
                >
                  <div className={cn(
                    'flex items-center gap-0.5',
                    header.align === 'center' && 'justify-center',
                    header.align === 'right' && 'justify-end'
                  )}>
                    <span>{header.label}</span>
                    {sortable && header.sortable && (
                      <span className="inline-flex flex-col">
                        <ChevronUp
                          className={cn(
                            'w-2.5 h-2.5 -mb-0.5',
                            sortState.key === header.key && sortState.direction === 'asc'
                              ? 'text-[#5B50BD] dark:text-[#918AD3]'
                              : 'text-gray-300 dark:text-gray-600'
                          )}
                        />
                        <ChevronDown
                          className={cn(
                            'w-2.5 h-2.5 -mt-0.5',
                            sortState.key === header.key && sortState.direction === 'desc'
                              ? 'text-[#5B50BD] dark:text-[#918AD3]'
                              : 'text-gray-300 dark:text-gray-600'
                          )}
                        />
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {sortedRows.map((row) => (
              <tr
                key={row.id}
                className={cn(
                  'transition-colors',
                  row.status ? ROW_STATUS_COLORS[row.status] : ROW_STATUS_COLORS.neutral,
                  row.onClick || onRowClick ? 'cursor-pointer' : ''
                )}
                onClick={() => (row.onClick || onRowClick)?.(row)}
              >
                {headers.map((header) => {
                  const cellValue = row.data[header.key];
                  const isTrendCell = showTrendIndicators && header.key === 'trend' && typeof cellValue === 'string' && ['up', 'down', 'neutral'].includes(cellValue);

                  return (
                    <td
                      key={header.key}
                      className={cn(
                        'px-2 sm:px-3 py-1.5 sm:py-2 text-[10px] sm:text-xs',
                        'text-gray-900 dark:text-gray-100',
                        header.align === 'center' && 'text-center',
                        header.align === 'right' && 'text-right'
                      )}
                    >
                      {isTrendCell ? (
                        <TrendIndicator trend={cellValue as TrendDirection} />
                      ) : (
                        cellValue
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {sortedRows.length === 0 && (
        <div className="px-2 sm:px-3 py-3 sm:py-4 text-center text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
          No data to display
        </div>
      )}
    </div>
  );
}
