import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function generateProposalCode(): string {
  const prefix = 'BI';
  const year = new Date().getFullYear().toString().slice(-2);
  const month = (new Date().getMonth() + 1).toString().padStart(2, '0');
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `${prefix}-${year}${month}-${random}`;
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function calculateMarginOfError(
  sampleSize: number,
  confidenceLevel: number = 95,
  population?: number
): number {
  // Z-scores for common confidence levels
  const zScores: Record<number, number> = {
    90: 1.645,
    95: 1.96,
    99: 2.576,
  };

  const z = zScores[confidenceLevel] || 1.96;
  const p = 0.5; // Assumed proportion for maximum variability

  // Standard margin of error formula
  let moe = z * Math.sqrt((p * (1 - p)) / sampleSize);

  // Apply finite population correction if population is provided
  if (population && population > 0) {
    const fpc = Math.sqrt((population - sampleSize) / (population - 1));
    moe *= fpc;
  }

  return Math.round(moe * 10000) / 100; // Return as percentage with 2 decimals
}

export function calculateRequiredSampleSize(
  marginOfError: number,
  confidenceLevel: number = 95,
  population?: number
): number {
  const zScores: Record<number, number> = {
    90: 1.645,
    95: 1.96,
    99: 2.576,
  };

  const z = zScores[confidenceLevel] || 1.96;
  const p = 0.5;
  const e = marginOfError / 100;

  // Basic sample size calculation
  let n = Math.ceil((z * z * p * (1 - p)) / (e * e));

  // Apply finite population correction if population is provided
  if (population && population > 0) {
    n = Math.ceil((n * population) / (n + population - 1));
  }

  return n;
}

export function getStatusColor(status: string): string {
  // Improved dark mode colors with better contrast (WCAG AA compliant)
  const colors: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200',
    pending_approval: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
    approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
    on_hold: 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    deleted: 'bg-gray-200 text-gray-600 dark:bg-gray-700 dark:text-gray-400',
  };
  return colors[status] || 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200';
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    draft: 'Draft',
    pending_approval: 'Pending',
    approved: 'Approved',
    rejected: 'Rejected',
    on_hold: 'On Hold',
    deleted: 'Deleted',
  };
  return labels[status] || status;
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function debounce<T extends (...args: Parameters<T>) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const value = String(item[key]);
    if (!groups[value]) {
      groups[value] = [];
    }
    groups[value].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}
