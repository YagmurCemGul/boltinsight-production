// Meta Learnings V2 - Barrel Export

// Main component
export { MetaLearningsV2 } from './MetaLearningsV2';
export { MetaLearningsAlertProvider } from './MetaLearningsAlertProvider';

// Chat components
export { ChatContainer } from './ChatContainer';
export { AIMessage } from './AIMessage';
export { UserMessage } from './UserMessage';
export { StreamingIndicator } from './StreamingIndicator';

// Data display components
export { DataTable } from './DataTable';
export { InsightCard } from './InsightCard';
export { ConfidenceBadge } from './ConfidenceBadge';

// Interactive components
export { FilterChips } from './FilterChips';
export { SuggestionPills } from './SuggestionPills';
export { ActionBar } from './ActionBar';
export { SourceCitation } from './SourceCitation';
export { ProposalSelector } from './ProposalSelector';
export { ShareSelector } from './ShareSelector';

// Alert components
export { ProactiveAlert as ProactiveAlertComponent } from './ProactiveAlert';
export { AlertsPanel } from './AlertsPanel';

// Hook
export { useMetaLearningsChat } from './hooks/useMetaLearningsChat';

// Types
export type {
  MetaLearningMessage,
  InsightData,
  TableData,
  TableHeader,
  TableRow,
  SourceCitationData,
  ActionItem,
  FilterChip,
  MetricData,
  MessageRole,
  InsightType,
  ConfidenceLevel,
  TrendDirection,
  FilterType,
  // Alert types
  AlertType,
  AlertPriority,
  ProactiveAlert,
  AlertAction,
  ConversationContext,
  // Props types
  ConfidenceBadgeProps,
  StreamingIndicatorProps,
  SuggestionPillsProps,
  FilterChipsProps,
  ActionBarProps,
  SourceCitationProps,
  DataTableProps,
  InsightCardProps,
  UserMessageProps,
  AIMessageProps,
  ChatContainerProps,
  ProactiveAlertProps,
  AlertsPanelProps,
  UseMetaLearningsChatReturn,
} from './types';

// Constants
export {
  COLORS,
  INSIGHT_CONFIG,
  CONFIDENCE_CONFIG,
  TREND_ICONS,
  SIZE_CONFIG,
  EMPTY_STATE_SUGGESTIONS,
  FILTER_TYPE_LABELS,
  FILTER_TYPE_ICONS,
  ACTION_ICONS,
  ROW_STATUS_COLORS,
} from './constants';

// Mock data utilities
export {
  generateMockResponse,
  getWelcomeMessage,
  generateProactiveAlerts,
  extractContextFromQuery,
} from './mock-data';
