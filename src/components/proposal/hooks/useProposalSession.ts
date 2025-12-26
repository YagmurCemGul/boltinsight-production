'use client';

import { useState, useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import type { CoworkingSession, SessionComment, AccessLevel, CollaboratorRole } from '@/types';

interface UseProposalSessionOptions {
  proposalId?: string; // Optional - when provided, session is per-proposal
}

interface UseProposalSessionReturn {
  // Session state
  session: CoworkingSession | null;
  isSessionActive: boolean;

  // Session actions
  startSession: (proposalId: string, name?: string) => void;
  endSession: () => void;
  updateSessionName: (name: string) => void;

  // Collaborator state
  typingUsers: CoworkingSession['collaborators'];
  onlineUsers: CoworkingSession['collaborators'];

  // Collaborator actions
  setTyping: (isTyping: boolean) => void;
  inviteUser: (email: string, role: CollaboratorRole) => void;
  removeUser: (collaboratorId: string) => void;

  // Comment state
  comments: SessionComment[];
  getCommentsForSection: (sectionId: string) => SessionComment[];

  // Comment actions
  addComment: (sectionId: string, content: string) => void;
  resolveComment: (commentId: string, resolved: boolean) => void;
  deleteComment: (commentId: string) => void;

  // Share actions
  generateShareLink: () => string;
  updateAccessLevel: (level: AccessLevel) => void;

  // Show/hide states
  showShareModal: boolean;
  setShowShareModal: (show: boolean) => void;
}

export function useProposalSession(options: UseProposalSessionOptions = {}): UseProposalSessionReturn {
  const { proposalId } = options;
  const [showShareModal, setShowShareModal] = useState(false);

  const {
    currentUser,
    coworkingSessions,
    activeCoworkingSessionId,
    createCoworkingSession,
    updateCoworkingSession,
    setActiveCoworkingSession,
    removeSessionCollaborator,
    setSessionCollaboratorTyping,
    addSessionComment,
    deleteSessionComment,
    resolveSessionComment,
    getSessionComments,
    generateSessionShareLink,
    updateSessionAccessLevel,
    createSessionInvite,
  } = useAppStore();

  // Get session for this specific proposal (if proposalId provided)
  // Otherwise fall back to global active session
  const session = useMemo(() => {
    if (proposalId) {
      // Find session that matches this specific proposal
      return coworkingSessions.find(s =>
        s.type === 'proposal' &&
        s.description?.includes(proposalId)
      ) || null;
    }
    // Fall back to global active session
    return activeCoworkingSessionId
      ? coworkingSessions.find(s => s.id === activeCoworkingSessionId && s.type === 'proposal') || null
      : null;
  }, [proposalId, coworkingSessions, activeCoworkingSessionId]);

  const isSessionActive = !!session;

  // Get current user's collaborator ID
  const currentCollaboratorId = session?.collaborators.find(c => c.user.id === currentUser.id)?.id;

  // Derived state
  const typingUsers = session?.collaborators.filter(c => c.isTyping && c.user.id !== currentUser.id) || [];
  const onlineUsers = session?.collaborators.filter(c => c.status === 'online') || [];
  const comments = session?.comments || [];

  // Start a new session for a proposal
  const startSession = useCallback((proposalId: string, name?: string) => {
    const sessionId = createCoworkingSession({
      type: 'proposal',
      name: name || `Proposal Session - ${new Date().toLocaleDateString()}`,
      description: `Coworking session for proposal ${proposalId}`,
      owner: currentUser,
      accessLevel: 'private',
    });
    setActiveCoworkingSession(sessionId);
  }, [createCoworkingSession, currentUser, setActiveCoworkingSession]);

  // End current session
  const endSession = useCallback(() => {
    setActiveCoworkingSession(null);
  }, [setActiveCoworkingSession]);

  // Update session name
  const updateSessionName = useCallback((name: string) => {
    if (session) {
      updateCoworkingSession(session.id, { name });
    }
  }, [session, updateCoworkingSession]);

  // Set typing status
  const setTyping = useCallback((isTyping: boolean) => {
    if (session && currentCollaboratorId) {
      setSessionCollaboratorTyping(session.id, currentCollaboratorId, isTyping);
    }
  }, [session, currentCollaboratorId, setSessionCollaboratorTyping]);

  // Invite user
const inviteUser = useCallback((email: string, role: CollaboratorRole) => {
  if (session) {
    const now = new Date().toISOString();
    
    const newCollaborator = {
      id: crypto.randomUUID(),
      user: {
        id: crypto.randomUUID(),
        name: email.split('@')[0],
        email: email,
        role: 'researcher' as const,  // ← BU ALANI EKLE
        avatar: undefined,             // ← null yerine undefined
      },
      role: role,
      status: 'online' as const,
      cursor: undefined,
      isTyping: false,
      joinedAt: now,
      lastActiveAt: now,
    };
    
    updateCoworkingSession(session.id, {
      collaborators: [...session.collaborators, newCollaborator]
    });
  }
}, [session, updateCoworkingSession]);


  // Remove user
  const removeUser = useCallback((collaboratorId: string) => {
    if (session) {
      removeSessionCollaborator(session.id, collaboratorId);
    }
  }, [session, removeSessionCollaborator]);

  // Get comments for a specific section (using messageId as sectionId)
  const getCommentsForSection = useCallback((sectionId: string) => {
    if (!session) return [];
    return getSessionComments(session.id, sectionId);
  }, [session, getSessionComments]);

  // Add comment to a section
  const addComment = useCallback((sectionId: string, content: string) => {
    if (session) {
      addSessionComment(session.id, {
        messageId: sectionId,
        author: currentUser,
        content,
      });
    }
  }, [session, currentUser, addSessionComment]);

  // Resolve comment
  const resolveComment = useCallback((commentId: string, resolved: boolean) => {
    if (session) {
      resolveSessionComment(session.id, commentId, resolved);
    }
  }, [session, resolveSessionComment]);

  // Delete comment
  const deleteComment = useCallback((commentId: string) => {
    if (session) {
      deleteSessionComment(session.id, commentId);
    }
  }, [session, deleteSessionComment]);

  // Generate share link
  const generateShareLink = useCallback(() => {
    if (session) {
      return generateSessionShareLink(session.id);
    }
    return '';
  }, [session, generateSessionShareLink]);

  // Update access level
  const updateAccessLevel = useCallback((level: AccessLevel) => {
    if (session) {
      updateSessionAccessLevel(session.id, level);
    }
  }, [session, updateSessionAccessLevel]);

  return {
    session,
    isSessionActive,
    startSession,
    endSession,
    updateSessionName,
    typingUsers,
    onlineUsers,
    setTyping,
    inviteUser,
    removeUser,
    comments,
    getCommentsForSection,
    addComment,
    resolveComment,
    deleteComment,
    generateShareLink,
    updateAccessLevel,
    showShareModal,
    setShowShareModal,
  };
}
