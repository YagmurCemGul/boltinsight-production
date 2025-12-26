// Meta Learnings V2 - Type Definitions

import type { ReactNode } from 'react';

// Core enums and literal types
export type MessageRole = 'user' | 'assistant' | 'system';
export type InsightType = 'opportunity' | 'warning' | 'trend' | 'recommendation';
export type ConfidenceLevel = 'high' | 'medium' | 'low';
export type TrendDirection = 'up' | 'down' | 'neutral';
export type FilterType = 'date' | 'customer' | 'status' | 'methodology' | 'author';

// Attachment type for messages
export interface MessageAttachment {
  name: string;
  type: string;
  size?: number;
  url?: string;
}

// Message types
export interface MetaLearningMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  isStreaming?: boolean;
  sources?: SourceCitationData[];
  insights?: InsightData[];
  tables?: TableData[];
  confidence?: number;
  actions?: ActionItem[];
  suggestions?: string[];
  attachments?: MessageAttachment[];
}

// Source citation for AI responses
export interface SourceCitationData {
  id: string;
  proposalId: string;
  proposalTitle: string;
  client: string;
  status: string;
  date: string;
  relevanceScore: number;
  excerpt?: string;
}

// Insight card data
export interface InsightData {
  id: string;
  type: InsightType;
  title: string;
  description: string;
  confidence: number;
  metrics?: MetricData[];
  actions?: ActionItem[];
}

// Metric display
export interface MetricData {
  label: string;
  value: string | number;
  trend?: TrendDirection;
  change?: number;
}

// Table structures
export interface TableData {
  id: string;
  title?: string;
  headers: TableHeader[];
  rows: TableRow[];
}

export interface TableHeader {
  key: string;
  label: string;
  sortable?: boolean;
  align?: 'left' | 'center' | 'right';
}

export interface TableRow {
  id: string;
  data: Record<string, string | number | ReactNode>;
  status?: 'positive' | 'negative' | 'neutral';
  onClick?: () => void;
}

// Action items
export interface ActionItem {
  id: string;
  label: string;
  icon?: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
}

// Filter chip
export interface FilterChip {
  id: string;
  type: FilterType;
  label: string;
  value: string;
}

// Component Props interfaces
export interface ConfidenceBadgeProps {
  level: number; // 0-100
  size?: 'sm' | 'md' | 'lg';
  showPercentage?: boolean;
  className?: string;
}

export interface StreamingIndicatorProps {
  isVisible: boolean;
  text?: string;
  className?: string;
}

export interface SuggestionPillsProps {
  suggestions: string[];
  onSelect: (suggestion: string) => void;
  layout?: 'horizontal' | 'vertical';
  className?: string;
}

export interface FilterChipsProps {
  filters: FilterChip[];
  onRemove: (filterId: string) => void;
  onClearAll: () => void;
  className?: string;
}

export interface ActionBarProps {
  actions: ActionItem[];
  position?: 'inline' | 'fixed';
  className?: string;
}

export interface SourceCitationProps {
  sources: SourceCitationData[];
  maxCollapsed?: number;
  onSourceClick?: (source: SourceCitationData) => void;
  className?: string;
}

export interface DataTableProps {
  headers: TableHeader[];
  rows: TableRow[];
  title?: string;
  sortable?: boolean;
  onRowClick?: (row: TableRow) => void;
  showTrendIndicators?: boolean;
  className?: string;
}

export interface InsightCardProps {
  insight: InsightData;
  onActionClick?: (action: ActionItem) => void;
  className?: string;
}

export interface UserMessageProps {
  message: MetaLearningMessage;
  className?: string;
}

export interface AIMessageProps {
  message: MetaLearningMessage;
  onSourceClick?: (source: SourceCitationData) => void;
  onActionClick?: (action: ActionItem) => void;
  onSuggestionClick?: (suggestion: string) => void;
  className?: string;
}

export interface ChatContainerProps {
  messages: MetaLearningMessage[];
  isStreaming: boolean;
  activeFilters: FilterChip[];
  onSendMessage: (message: string, attachments?: MessageAttachment[]) => void;
  onFilterRemove: (filterId: string) => void;
  onFilterClearAll: () => void;
  onSourceClick?: (source: SourceCitationData) => void;
  onActionClick?: (action: ActionItem) => void;
  className?: string;
  // Coworking props
  sessionActive?: boolean;
  comments?: import('@/types').SessionComment[];
  getCommentsForMessage?: (messageId: string) => import('@/types').SessionComment[];
  onAddComment?: (messageId: string, content: string) => void;
  onResolveComment?: (commentId: string, resolved: boolean) => void;
  onDeleteComment?: (commentId: string) => void;
  typingUsers?: import('@/types').SessionCollaborator[];
}

// Proactive Alert Types
export type AlertType = 'warning' | 'opportunity' | 'insight' | 'reminder';
export type AlertPriority = 'high' | 'medium' | 'low';

export interface ProactiveAlert {
  id: string;
  type: AlertType;
  priority: AlertPriority;
  title: string;
  description: string;
  data?: Record<string, unknown>;
  actions: AlertAction[];
  dismissable: boolean;
  timestamp: string;
  expiresAt?: string;
}

export interface AlertAction {
  id: string;
  label: string;
  variant?: 'primary' | 'secondary' | 'ghost';
  onClick?: () => void;
}

export interface ProactiveAlertProps {
  alert: ProactiveAlert;
  onAction?: (actionId: string) => void;
  onDismiss?: () => void;
  className?: string;
}

export interface AlertsPanelProps {
  alerts: ProactiveAlert[];
  onAction?: (alertId: string, actionId: string) => void;
  onDismiss?: (alertId: string) => void;
  onDismissAll?: () => void;
  className?: string;
}

// Conversation Context for Memory
export interface ConversationContext {
  currentTopic?: string;
  mentionedClients: string[];
  mentionedProposals: string[];
  activeTimeRange?: { start: string; end: string };
  lastQueryType?: string;
}

// Hook return type
export interface UseMetaLearningsChatReturn {
  messages: MetaLearningMessage[];
  isStreaming: boolean;
  activeFilters: FilterChip[];
  alerts: ProactiveAlert[];
  conversationContext: ConversationContext;
  sendMessage: (content: string, attachments?: MessageAttachment[]) => void;
  addFilter: (filter: Omit<FilterChip, 'id'>) => void;
  removeFilter: (filterId: string) => void;
  clearFilters: () => void;
  clearChat: () => void;
  dismissAlert: (alertId: string) => void;
  dismissAllAlerts: () => void;
}
