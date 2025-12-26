import type { User } from './index';

// Session Types
export type SessionType = 'meta-learnings' | 'calculators' | 'proposal';
export type AccessLevel = 'private' | 'link' | 'team';
export type CollaboratorRole = 'owner' | 'editor' | 'viewer';
export type CollaboratorStatus = 'online' | 'offline' | 'away';

// Session Collaborator
export interface SessionCollaborator {
  id: string;
  user: User;
  role: CollaboratorRole;
  status: CollaboratorStatus;
  isTyping?: boolean;
  cursor?: {
    messageId: string;
    position: number;
  };
  joinedAt: string;
  lastActiveAt: string;
}

// Session Comment
export interface SessionComment {
  id: string;
  messageId: string;
  author: User;
  content: string;
  timestamp: string;
  resolved?: boolean;
  replies?: SessionComment[];
}

// Session Message (generic for both Meta Learnings and Calculators)
export interface SessionMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  authorId?: string; // For user messages, who sent it
  metadata?: Record<string, unknown>;
}

// Main Coworking Session
export interface CoworkingSession {
  id: string;
  type: SessionType;
  name: string;
  description?: string;
  owner: User;
  collaborators: SessionCollaborator[];
  messages: SessionMessage[];
  comments: SessionComment[];
  shareLink?: string;
  accessLevel: AccessLevel;
  createdAt: string;
  updatedAt: string;
  lastActivityAt: string;
  isArchived?: boolean;
}

// Session Invite
export interface SessionInvite {
  id: string;
  sessionId: string;
  invitedEmail: string;
  invitedBy: User;
  role: CollaboratorRole;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: string;
  expiresAt?: string;
}

// Coworking Store State
export interface CoworkingState {
  sessions: CoworkingSession[];
  activeSessionId: string | null;
  invites: SessionInvite[];
}

// Coworking Store Actions
export interface CoworkingActions {
  // Session CRUD
  createSession: (session: Omit<CoworkingSession, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt'>) => string;
  updateSession: (sessionId: string, updates: Partial<CoworkingSession>) => void;
  deleteSession: (sessionId: string) => void;
  archiveSession: (sessionId: string) => void;
  setActiveSession: (sessionId: string | null) => void;

  // Collaborator management
  addCollaborator: (sessionId: string, collaborator: Omit<SessionCollaborator, 'id' | 'joinedAt' | 'lastActiveAt'>) => void;
  updateCollaborator: (sessionId: string, collaboratorId: string, updates: Partial<SessionCollaborator>) => void;
  removeCollaborator: (sessionId: string, collaboratorId: string) => void;
  setCollaboratorStatus: (sessionId: string, collaboratorId: string, status: CollaboratorStatus) => void;
  setCollaboratorTyping: (sessionId: string, collaboratorId: string, isTyping: boolean) => void;

  // Message management
  addSessionMessage: (sessionId: string, message: Omit<SessionMessage, 'id' | 'timestamp'>) => void;
  updateSessionMessage: (sessionId: string, messageId: string, updates: Partial<SessionMessage>) => void;
  deleteSessionMessage: (sessionId: string, messageId: string) => void;

  // Comment management
  addComment: (sessionId: string, comment: Omit<SessionComment, 'id' | 'timestamp'>) => void;
  updateComment: (sessionId: string, commentId: string, updates: Partial<SessionComment>) => void;
  deleteComment: (sessionId: string, commentId: string) => void;
  resolveComment: (sessionId: string, commentId: string, resolved: boolean) => void;
  addCommentReply: (sessionId: string, commentId: string, reply: Omit<SessionComment, 'id' | 'timestamp' | 'messageId'>) => void;

  // Share link management
  generateShareLink: (sessionId: string) => string;
  updateAccessLevel: (sessionId: string, accessLevel: AccessLevel) => void;

  // Invites
  createInvite: (invite: Omit<SessionInvite, 'id' | 'createdAt'>) => void;
  respondToInvite: (inviteId: string, response: 'accepted' | 'declined') => void;

  // Getters
  getSession: (sessionId: string) => CoworkingSession | undefined;
  getSessionsByType: (type: SessionType) => CoworkingSession[];
  getActiveSession: () => CoworkingSession | undefined;
  getSessionComments: (sessionId: string, messageId?: string) => SessionComment[];
}
