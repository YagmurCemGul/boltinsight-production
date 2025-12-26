// Meta Learnings V2 - Design System Constants

import type { InsightType } from './types';

// Color palette from specification
export const COLORS = {
  primary: {
    ai: '#5B50BD',
    aiLight: '#918AD3',
    insight: '#8B5CF6',
    source: '#6366F1',
  },
  semantic: {
    positive: '#10B981',
    negative: '#EF4444',
    neutral: '#6B7280',
    trendUp: '#22C55E',
    trendDown: '#F59E0B',
  },
  confidence: {
    high: '#10B981',
    medium: '#F59E0B',
    low: '#EF4444',
  },
  insight: {
    opportunity: '#10B981',
    warning: '#F59E0B',
    trend: '#8B5CF6',
    recommendation: '#3B82F6',
  },
  interactive: {
    hover: 'rgba(91, 80, 189, 0.08)',
    active: 'rgba(91, 80, 189, 0.12)',
    focus: 'rgba(91, 80, 189, 0.2)',
  },
} as const;

// Insight type configurations
export const INSIGHT_CONFIG: Record<InsightType, {
  borderColor: string;
  bgColor: string;
  darkBgColor: string;
  icon: string;
  label: string;
}> = {
  opportunity: {
    borderColor: 'border-l-emerald-500',
    bgColor: 'bg-emerald-50',
    darkBgColor: 'dark:bg-emerald-900/20',
    icon: 'Target',
    label: 'Opportunity',
  },
  warning: {
    borderColor: 'border-l-amber-500',
    bgColor: 'bg-amber-50',
    darkBgColor: 'dark:bg-amber-900/20',
    icon: 'AlertTriangle',
    label: 'Warning',
  },
  trend: {
    borderColor: 'border-l-purple-500',
    bgColor: 'bg-purple-50',
    darkBgColor: 'dark:bg-purple-900/20',
    icon: 'TrendingUp',
    label: 'Trend',
  },
  recommendation: {
    borderColor: 'border-l-blue-500',
    bgColor: 'bg-blue-50',
    darkBgColor: 'dark:bg-blue-900/20',
    icon: 'Lightbulb',
    label: 'Recommendation',
  },
};

// Confidence level configurations
export const CONFIDENCE_CONFIG = {
  high: {
    min: 80,
    dots: '\u25CF\u25CF\u25CF\u25CF', // ●●●●
    color: 'text-emerald-600 dark:text-emerald-400',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/40',
  },
  medium: {
    min: 50,
    dots: '\u25CF\u25CF\u25CF\u25CB', // ●●●○
    color: 'text-amber-600 dark:text-amber-400',
    bgColor: 'bg-amber-100 dark:bg-amber-900/40',
  },
  low: {
    min: 0,
    dots: '\u25CF\u25CF\u25CB\u25CB', // ●●○○
    color: 'text-gray-600 dark:text-gray-400',
    bgColor: 'bg-gray-100 dark:bg-gray-800',
  },
} as const;

// Trend indicators
export const TREND_ICONS = {
  up: '\u2191', // ↑
  down: '\u2193', // ↓
  neutral: '\u2192', // →
} as const;

// Size configurations - Compact
export const SIZE_CONFIG = {
  sm: {
    height: 'h-4',
    fontSize: 'text-xs',
    padding: 'px-1.5 py-0.5',
  },
  md: {
    height: 'h-5',
    fontSize: 'text-xs',
    padding: 'px-2 py-0.5',
  },
  lg: {
    height: 'h-6',
    fontSize: 'text-sm',
    padding: 'px-2.5 py-1',
  },
} as const;

// Default suggestions in English
export const EMPTY_STATE_SUGGESTIONS = [
  'Which proposals have the highest approval rate?',
  'What are the common patterns in rejected proposals?',
  'Who are our most active clients?',
  'How do success rates vary by methodology?',
] as const;

// Filter type labels
export const FILTER_TYPE_LABELS: Record<string, string> = {
  date: 'Date',
  customer: 'Client',
  status: 'Status',
  methodology: 'Methodology',
  author: 'Author',
} as const;

// Filter type icons
export const FILTER_TYPE_ICONS: Record<string, string> = {
  date: 'Calendar',
  customer: 'Building2',
  status: 'CheckCircle',
  methodology: 'Beaker',
  author: 'User',
} as const;

// Action button icons
export const ACTION_ICONS: Record<string, string> = {
  pdf: 'FileText',
  email: 'Mail',
  proposal: 'Plus',
  detail: 'ExternalLink',
  copy: 'Copy',
} as const;

// Status colors for tables
export const ROW_STATUS_COLORS = {
  positive: 'bg-emerald-50 dark:bg-emerald-900/10 hover:bg-emerald-100 dark:hover:bg-emerald-900/20',
  negative: 'bg-red-50 dark:bg-red-900/10 hover:bg-red-100 dark:hover:bg-red-900/20',
  neutral: 'hover:bg-gray-50 dark:hover:bg-gray-800/50',
} as const;
