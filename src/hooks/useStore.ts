'use client';

/**
 * Selective Zustand store hooks
 *
 * These hooks allow components to subscribe only to specific parts of the store,
 * preventing unnecessary re-renders when unrelated state changes.
 *
 * USAGE:
 * // WRONG - subscribes to entire store, re-renders on any change
 * const { proposals, notifications, activeSection } = useAppStore();
 *
 * // CORRECT - subscribes only to what's needed
 * const proposals = useProposals();
 * const notifications = useNotifications();
 * const activeSection = useActiveSection();
 */

import { useAppStore } from '@/lib/store';
import { useShallow } from 'zustand/react/shallow';

// ============================================
// PROPOSAL HOOKS
// ============================================

/** Get all proposals */
export const useProposals = () => useAppStore((state) => state.proposals);

/** Get current proposal */
export const useCurrentProposal = () => useAppStore((state) => state.currentProposal);

/** Get proposal actions */
export const useProposalActions = () =>
  useAppStore(
    useShallow((state) => ({
      addProposal: state.addProposal,
      updateProposal: state.updateProposal,
      deleteProposal: state.deleteProposal,
      setCurrentProposal: state.setCurrentProposal,
    }))
  );

/** Get proposal workflow actions */
export const useProposalWorkflow = () =>
  useAppStore(
    useShallow((state) => ({
      submitToManager: state.submitToManager,
      managerApprove: state.managerApprove,
      managerReject: state.managerReject,
      submitToClient: state.submitToClient,
      clientApprove: state.clientApprove,
      clientReject: state.clientReject,
      putOnHold: state.putOnHold,
      requestRevision: state.requestRevision,
      reopenProposal: state.reopenProposal,
    }))
  );

/** Get pinned proposal IDs */
export const usePinnedProposals = () => useAppStore((state) => state.pinnedProposalIds);

// ============================================
// PROJECT HOOKS
// ============================================

/** Get legacy projects */
export const useProjects = () => useAppStore((state) => state.projects);

/** Get current project */
export const useCurrentProject = () => useAppStore((state) => state.currentProject);

/** Get project actions */
export const useProjectActions = () =>
  useAppStore(
    useShallow((state) => ({
      addProject: state.addProject,
      updateProject: state.updateProject,
      deleteProject: state.deleteProject,
      setCurrentProject: state.setCurrentProject,
      moveProposalToProject: state.moveProposalToProject,
      reorderProjects: state.reorderProjects,
      getNestedProjects: state.getNestedProjects,
    }))
  );

/** Get chat projects */
export const useChatProjects = () => useAppStore((state) => state.chatProjects);

/** Get current chat project */
export const useCurrentChatProject = () => useAppStore((state) => state.currentChatProject);

// ============================================
// CHAT HOOKS
// ============================================

/** Get proposal chats */
export const useProposalChats = () => useAppStore((state) => state.proposalChats);

/** Get AI typing state */
export const useAiTyping = () => useAppStore((state) => state.isAiTyping);

/** Get active proposal chat ID */
export const useActiveProposalChatId = () => useAppStore((state) => state.activeProposalChatId);

/** Get chat actions */
export const useChatActions = () =>
  useAppStore(
    useShallow((state) => ({
      addChatMessage: state.addChatMessage,
      setActiveProposalChatId: state.setActiveProposalChatId,
      setAiTyping: state.setAiTyping,
    }))
  );

// ============================================
// NOTIFICATION HOOKS
// ============================================

/** Get notifications */
export const useNotifications = () => useAppStore((state) => state.notifications);

/** Get unread notification count */
export const useUnreadNotificationCount = () =>
  useAppStore((state) => state.notifications.filter((n) => !n.read).length);

/** Get notification actions */
export const useNotificationActions = () =>
  useAppStore(
    useShallow((state) => ({
      addNotification: state.addNotification,
      markNotificationRead: state.markNotificationRead,
      markAllNotificationsRead: state.markAllNotificationsRead,
    }))
  );

// ============================================
// UI STATE HOOKS
// ============================================

/** Get active section */
export const useActiveSection = () => useAppStore((state) => state.activeSection);

/** Set active section */
export const useSetActiveSection = () => useAppStore((state) => state.setActiveSection);

/** Get sidebar state */
export const useSidebarState = () =>
  useAppStore(
    useShallow((state) => ({
      sidebarOpen: state.sidebarOpen,
      sidebarCollapsed: state.sidebarCollapsed,
      sidebarWidth: state.sidebarWidth,
      rightSidebarCollapsed: state.rightSidebarCollapsed,
    }))
  );

/** Get sidebar actions */
export const useSidebarActions = () =>
  useAppStore(
    useShallow((state) => ({
      setSidebarOpen: state.setSidebarOpen,
      setSidebarCollapsed: state.setSidebarCollapsed,
      setSidebarWidth: state.setSidebarWidth,
      setRightSidebarCollapsed: state.setRightSidebarCollapsed,
    }))
  );

/** Get modal states */
export const useModalStates = () =>
  useAppStore(
    useShallow((state) => ({
      showCreateProjectModal: state.showCreateProjectModal,
      showSettingsModal: state.showSettingsModal,
    }))
  );

/** Get modal actions */
export const useModalActions = () =>
  useAppStore(
    useShallow((state) => ({
      setShowCreateProjectModal: state.setShowCreateProjectModal,
      setShowSettingsModal: state.setShowSettingsModal,
    }))
  );

// ============================================
// USER HOOKS
// ============================================

/** Get current user */
export const useCurrentUser = () => useAppStore((state) => state.currentUser);

/** Get login state */
export const useIsLoggedIn = () => useAppStore((state) => state.isLoggedIn);

/** Get user actions */
export const useUserActions = () =>
  useAppStore(
    useShallow((state) => ({
      setCurrentUser: state.setCurrentUser,
      setLoggedIn: state.setLoggedIn,
    }))
  );

// ============================================
// DASHBOARD HOOKS
// ============================================

/** Get dashboard config */
export const useDashboardConfig = () => useAppStore((state) => state.dashboardConfig);

/** Get dashboard actions */
export const useDashboardActions = () =>
  useAppStore(
    useShallow((state) => ({
      resetDashboardConfig: state.resetDashboardConfig,
    }))
  );

/** Get admin/help button visibility */
export const useButtonVisibility = () =>
  useAppStore(
    useShallow((state) => ({
      showAdminButton: state.showAdminButton,
      showHelpButton: state.showHelpButton,
    }))
  );

// ============================================
// LIBRARY HOOKS
// ============================================

/** Get library items */
export const useLibraryItems = () => useAppStore((state) => state.libraryItems);

/** Get library actions */
export const useLibraryActions = () =>
  useAppStore(
    useShallow((state) => ({
      addLibraryItem: state.addLibraryItem,
      deleteLibraryItem: state.deleteLibraryItem,
    }))
  );

// ============================================
// FILTER HOOKS
// ============================================

/** Get meta learning filter */
export const useMetaLearningFilter = () => useAppStore((state) => state.metaLearningFilter);

/** Get filter actions */
export const useFilterActions = () =>
  useAppStore(
    useShallow((state) => ({
      setMetaLearningFilter: state.setMetaLearningFilter,
      clearMetaLearningFilter: state.clearMetaLearningFilter,
      setSearchPreset: state.setSearchPreset,
    }))
  );

// ============================================
// CALENDAR HOOKS
// ============================================

/** Get calendar tasks */
export const useCalendarTasks = () => useAppStore((state) => state.calendarTasks);

/** Get calendar actions */
export const useCalendarActions = () =>
  useAppStore(
    useShallow((state) => ({
      updateCalendarTasks: state.updateCalendarTasks,
    }))
  );

// ============================================
// COWORKING SESSION HOOKS
// ============================================

/** Get coworking sessions */
export const useCoworkingSessions = () => useAppStore((state) => state.coworkingSessions);

/** Get coworking session creator */
export const useCreateCoworkingSession = () => useAppStore((state) => state.createCoworkingSession);

/** Get coworking invites */
export const useCoworkingInvites = () => useAppStore((state) => state.coworkingInvites);

// ============================================
// ONBOARDING & PREFERENCES HOOKS
// ============================================

/** Get onboarding state */
export const useOnboardingCompleted = () => useAppStore((state) => state.onboardingCompleted);

/** Get default editor mode */
export const useDefaultEditorMode = () => useAppStore((state) => state.defaultEditorMode);

/** Get preference actions */
export const usePreferenceActions = () =>
  useAppStore(
    useShallow((state) => ({
      setOnboardingCompleted: state.setOnboardingCompleted,
      setDefaultEditorMode: state.setDefaultEditorMode,
    }))
  );

// ============================================
// HISTORY HOOKS
// ============================================

/** Get archived history items */
export const useArchivedHistoryItems = () => useAppStore((state) => state.archivedHistoryItems);

/** Get pinned history items */
export const usePinnedHistoryItems = () => useAppStore((state) => state.pinnedHistoryItems);

/** Get history actions */
export const useHistoryActions = () =>
  useAppStore(
    useShallow((state) => ({
      archiveHistoryItem: state.archiveHistoryItem,
      unarchiveHistoryItem: state.unarchiveHistoryItem,
      pinHistoryItem: state.pinHistoryItem,
      unpinHistoryItem: state.unpinHistoryItem,
    }))
  );
