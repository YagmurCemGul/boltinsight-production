'use client';

import { useState, useCallback } from 'react';
import { useAppStore } from '@/lib/store';
import type { CoworkingSession, SessionComment, AccessLevel, CollaboratorRole } from '@/types';

interface UseToolsChatSessionReturn {
  // Session state
  session: CoworkingSession | null;
  isSessionActive: boolean;

  // Session actions
  startSession: (name?: string) => void;
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
  getCommentsForMessage: (messageId: string) => SessionComment[];

  // Comment actions
  addComment: (messageId: string, content: string) => void;
  resolveComment: (commentId: string, resolved: boolean) => void;
  deleteComment: (commentId: string) => void;

  // Share actions
  generateShareLink: () => string;
  updateAccessLevel: (level: AccessLevel) => void;

  // Show/hide states
  showShareModal: boolean;
  setShowShareModal: (show: boolean) => void;
}

export function useToolsChatSession(): UseToolsChatSessionReturn {
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

  // Get current session (for calculators type)
  const session = activeCoworkingSessionId
    ? coworkingSessions.find(s => s.id === activeCoworkingSessionId && s.type === 'calculators') || null
    : null;

  const isSessionActive = !!session;

  // Get current user's collaborator ID
  const currentCollaboratorId = session?.collaborators.find(c => c.user.id === currentUser.id)?.id;

  // Derived state
  const typingUsers = session?.collaborators.filter(c => c.isTyping && c.user.id !== currentUser.id) || [];
  const onlineUsers = session?.collaborators.filter(c => c.status === 'online') || [];
  const comments = session?.comments || [];

  // Start a new session
  const startSession = useCallback((name?: string) => {
    const sessionId = createCoworkingSession({
      type: 'calculators',
      name: name || `Calculator Session - ${new Date().toLocaleDateString()}`,
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
      createSessionInvite({
        sessionId: session.id,
        invitedEmail: email,
        invitedBy: currentUser,
        role,
        status: 'pending',
      });
    }
  }, [session, currentUser, createSessionInvite]);

  // Remove user
  const removeUser = useCallback((collaboratorId: string) => {
    if (session) {
      removeSessionCollaborator(session.id, collaboratorId);
    }
  }, [session, removeSessionCollaborator]);

  // Get comments for a specific message
  const getCommentsForMessage = useCallback((messageId: string) => {
    if (!session) return [];
    return getSessionComments(session.id, messageId);
  }, [session, getSessionComments]);

  // Add comment
  const addComment = useCallback((messageId: string, content: string) => {
    if (session) {
      addSessionComment(session.id, {
        messageId,
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
    getCommentsForMessage,
    addComment,
    resolveComment,
    deleteComment,
    generateShareLink,
    updateAccessLevel,
    showShareModal,
    setShowShareModal,
  };
}
