// BoltInsight Type Definitions

export type ProposalStatus =
  | 'draft'              // Draft - not submitted yet
  | 'pending_manager'    // Waiting for manager approval
  | 'manager_approved'   // Manager approved (can be sent to client)
  | 'manager_rejected'   // Manager rejected
  | 'pending_client'     // Waiting for client approval
  | 'client_approved'    // Client approved (final)
  | 'client_rejected'    // Client rejected
  | 'on_hold'            // On hold
  | 'revisions_needed'   // Revisions required
  | 'deleted';           // Deleted

export type ResearchType =
  | 'concept_test'
  | 'usage_and_attitude'
  | 'brand_tracking'
  | 'segmentation'
  | 'customer_satisfaction'
  | 'ad_testing'
  | 'price_testing'
  | 'product_test'
  | 'qualitative'
  | 'quantitative'
  | 'mixed_methods';

export type ServiceType =
  | 'full_service'
  | 'diy'
  | 'assisted'
  | 'consulting'
  | 'bolt_chat_credits';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'manager' | 'researcher' | 'viewer';
  region?: string;
  avatar?: string;
}

export interface Market {
  country: string;
  language: string;
  sampleSize: number;
  quotas?: Quota[];
}

export interface Quota {
  dimension: string;
  categories: {
    name: string;
    percentage: number;
    count: number;
  }[];
}

export interface ProposalContent {
  title: string;
  client: string;
  contact?: string;
  background?: string;
  businessObjectives?: string[];
  researchObjectives?: string[];
  burningQuestions?: string[];
  targetDefinition?: string;
  sampleSize?: number;
  loi?: number; // Length of Interview in minutes
  markets?: Market[];
  quotas?: Quota[];
  advancedAnalysis?: string[];
  referenceProjects?: string[];
  timeline?: Timeline;
  pricing?: Pricing;
  methodology?: {
    type?: string;
    description?: string;
  };
  documentHtml?: string; // Rich text editor content stored as HTML
}

export interface Timeline {
  startDate?: string;
  endDate?: string;
  milestones?: {
    name: string;
    date: string;
    completed: boolean;
  }[];
}

export interface Pricing {
  total: number;
  currency: string;
  breakdown?: {
    item: string;
    amount: number;
  }[];
}

export interface Proposal {
  id: string;
  code?: string; // Generated on first approval submission
  projectId?: string;
  status: ProposalStatus;
  content: ProposalContent;
  author: User;
  collaborators?: User[];
  createdAt: string;
  updatedAt: string;
  sentToClient?: boolean;
  versions: ProposalVersion[];
  approvalHistory?: ApprovalRecord[];
  activityLog?: ActivityLogEntry[];
  comments?: Comment[];
}

export interface ProposalVersion {
  id: string;
  version: number;
  content: ProposalContent;
  createdAt: string;
  createdBy: User;
  note?: string;
}

export type ApprovalAction =
  | 'submitted_to_manager'    // Submitted to manager
  | 'manager_approved'        // Manager approved
  | 'manager_rejected'        // Manager rejected
  | 'submitted_to_client'     // Submitted to client
  | 'client_approved'         // Client approved
  | 'client_rejected'         // Client rejected
  | 'put_on_hold'             // Put on hold
  | 'revision_requested'      // Revision requested
  | 'reopened'                // Reopened
  | 'comment';                // Comment added

export interface ApprovalRecord {
  id: string;
  action: ApprovalAction;
  by: User;
  to?: User;
  comment?: string;
  timestamp: string;
  previousStatus?: ProposalStatus;  // Previous status for tracking transitions
}

export type ActivityType =
  | 'created'
  | 'updated'
  | 'sample_size_updated'
  | 'loi_updated'
  | 'analysis_added'
  | 'market_added'
  | 'content_updated'
  | 'status_changed'
  | 'shared'
  | 'comment_added';

export interface ActivityLogEntry {
  id: string;
  type: ActivityType;
  description: string;
  by: User;
  timestamp: string;
  details?: Record<string, unknown>;
}

export interface Comment {
  id: string;
  author: User;
  content: string;
  timestamp: string;
  resolved?: boolean;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  client?: string;
  proposals: string[]; // Proposal IDs
  createdAt: string;
  updatedAt: string;
  isDefault?: boolean; // For BoltChatAI Credit Sales
  tags?: string[];
  color?: string;
  // Nested structure support
  parentId?: string;
  order?: number;
  path?: string; // File system path
}

// Nested project structure for tree rendering
export interface NestedProject extends Project {
  children: NestedProject[];
  depth: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  attachments?: Attachment[];
  // For inline field forms (like Research Calculators)
  fieldForm?: {
    sectionId: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'array';
    value: string | number | string[];
  };
}

export interface Attachment {
  id: string;
  name: string;
  type: string;
  url: string;
  size?: number;
}

export interface LibraryItem {
  id: string;
  name: string;
  description: string;
  url: string;
  category: 'external_link' | 'video' | 'template' | 'methodology';
  tags?: string[];
  country?: string;
  createdAt: string | Date;
}

export interface MetaLearningFilter {
  clients?: string[];
  regions?: string[];
  countries?: string[];
  researchTypes?: ResearchType[];
  statuses?: ProposalStatus[];
  authors?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  keywords?: string[];
}

export interface AnalyticsData {
  totalProposals: number;
  approvedCount: number;
  rejectedCount: number;
  pendingCount: number;
  byClient: { name: string; count: number }[];
  byRegion: { name: string; count: number }[];
  byResearchType: { name: string; count: number }[];
  byAuthor: { name: string; count: number }[];
  trends: { date: string; count: number }[];
}

export interface FeasibilityCheck {
  market: string;
  targetAudience: string;
  methodology: string;
  estimatedIncidenceRate: number;
  estimatedTimeline: string;
  estimatedCost: number;
  feasible: boolean;
  notes?: string;
}

export interface MarginOfErrorResult {
  sampleSize: number;
  populationSize?: number;
  confidenceLevel: number;
  marginOfError: number;
}

export interface DemographicDistribution {
  ageGroups: { range: string; percentage: number }[];
  gender: { category: string; percentage: number }[];
  region: { name: string; percentage: number }[];
  income?: { range: string; percentage: number }[];
}

export type NotificationType =
  | 'submitted_to_manager'    // Proposal submitted for manager approval
  | 'manager_approved'        // Manager approved your proposal
  | 'manager_rejected'        // Manager rejected your proposal
  | 'submitted_to_client'     // Proposal submitted to client
  | 'client_approved'         // Client approved the proposal
  | 'client_rejected'         // Client rejected the proposal
  | 'put_on_hold'             // Proposal put on hold
  | 'revision_requested'      // Revision requested
  | 'comment'                 // Someone commented on your proposal
  | 'mention'                 // You were mentioned
  | 'share'                   // A proposal was shared with you
  | 'meta_warning'            // Meta Learnings warning alert
  | 'meta_opportunity'        // Meta Learnings opportunity alert
  | 'meta_insight'            // Meta Learnings insight alert
  | 'meta_reminder';          // Meta Learnings reminder alert

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  proposalId?: string;
  proposalTitle?: string;
  fromUser?: User;
  read: boolean;
  createdAt: string;
  priority?: 'high' | 'medium' | 'low';  // For Meta Learnings alerts
  actionId?: string;                      // For Meta Learnings alert actions
}

// AI Search Types
export type AIFieldType =
  | 'country'
  | 'criteria'
  | 'market'
  | 'methodology'
  | 'sample_size'
  | 'audience'
  | 'notes'
  | 'number'
  | 'text';

export type AIComponentType =
  | 'demographic'
  | 'feasibility'
  | 'calculator'
  | 'library'
  | 'projects'
  | 'create_project'
  | 'edit_project'
  | 'search'
  | 'dashboard';

export interface AIFieldContext {
  fieldName: string;
  fieldType?: AIFieldType;
  component: AIComponentType;
  currentValues?: Record<string, unknown>;
  availableOptions?: string[];
  proposalId?: string;
}

export interface AISuggestion {
  id: string;
  text: string;
  type: 'value' | 'autofill' | 'reference';
  confidence: number;
  sourceProposalId?: string;
  sourceProposalTitle?: string;
  metadata?: Record<string, unknown>;
}

export interface AISearchRequest {
  query: string;
  fieldContext: AIFieldContext;
  limit?: number;
}

export interface AISearchResponse {
  suggestions: AISuggestion[];
  source: 'openai' | 'mock';
}

export interface AIAutoFillValues {
  market?: string;
  methodology?: string;
  sampleSize?: number;
  audienceType?: string;
  gender?: string;
  ageRanges?: string[];
  additionalCriteria?: Record<string, string[]>;
}

// ChatGPT-style Projects Types
export type CollaboratorRole = 'owner' | 'editor' | 'viewer';
export type CollaboratorStatus = 'online' | 'offline' | 'away';
export type MessageRole = 'user' | 'assistant' | 'system';
export type ProjectFileType = 'document' | 'image' | 'data' | 'other' | 'link' | 'proposal';

export interface ProjectCollaborator {
  id: string;
  user: User;
  role: CollaboratorRole;
  status: CollaboratorStatus;
  joinedAt: string;
  lastActiveAt: string;
  cursor?: {
    conversationId: string;
    position: number;
  };
}

export interface ProjectMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  attachments?: ProjectFileAttachment[];
  metadata?: {
    model?: string;
    tokens?: number;
    processingTime?: number;
  };
  isEdited?: boolean;
  editedAt?: string;
}

export interface ProjectFileAttachment {
  id: string;
  name: string;
  type: ProjectFileType | string;
  size?: number;
  url?: string;
  uploadedAt?: string;
  uploadedBy?: string;
  // For link attachments
  linkUrl?: string;
  // For proposal attachments
  proposalId?: string;
  proposalStatus?: string;
}

export interface ProjectConversation {
  id: string;
  title: string;
  messages: ProjectMessage[];
  createdAt: string;
  updatedAt: string;
  isArchived?: boolean;
  linkedProposalIds?: string[];
}

export interface ProjectFile {
  id: string;
  name: string;
  type: ProjectFileType;
  size: number;
  url: string;
  description?: string;
  tags?: string[];
  uploadedAt: string;
  uploadedBy: string;
}

export interface ProposalRef {
  id: string;
  title: string;
  status: ProposalStatus;
  linkedAt: string;
}

export interface ChatProject {
  id: string;
  name: string;
  description?: string;
  color: string;
  icon?: string;
  instructions: string;
  files: ProjectFile[];
  owner: User;
  collaborators: ProjectCollaborator[];
  conversations: ProjectConversation[];
  proposals: ProposalRef[];
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  isPinned: boolean;
  isArchived: boolean;
}

// Re-export calculator types
export * from './calculator';

// Re-export coworking types
export * from './coworking';
