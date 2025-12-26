export { useIsMobile } from './useIsMobile';
export { useUndoRedo } from './useUndoRedo';
export { useAISearch } from './useAISearch';

// Selective Zustand store hooks
export {
  // Proposal hooks
  useProposals,
  useCurrentProposal,
  useProposalActions,
  useProposalWorkflow,
  usePinnedProposals,
  // Project hooks
  useProjects,
  useCurrentProject,
  useProjectActions,
  useChatProjects,
  useCurrentChatProject,
  // Chat hooks
  useProposalChats,
  useAiTyping,
  useActiveProposalChatId,
  useChatActions,
  // Notification hooks
  useNotifications,
  useUnreadNotificationCount,
  useNotificationActions,
  // UI state hooks
  useActiveSection,
  useSetActiveSection,
  useSidebarState,
  useSidebarActions,
  useModalStates,
  useModalActions,
  // User hooks
  useCurrentUser,
  useIsLoggedIn,
  useUserActions,
  // Dashboard hooks
  useDashboardConfig,
  useDashboardActions,
  useButtonVisibility,
  // Library hooks
  useLibraryItems,
  useLibraryActions,
  // Filter hooks
  useMetaLearningFilter,
  useFilterActions,
  // Calendar hooks
  useCalendarTasks,
  useCalendarActions,
  // Coworking hooks
  useCoworkingSessions,
  useCreateCoworkingSession,
  useCoworkingInvites,
  // Onboarding & preferences
  useOnboardingCompleted,
  useDefaultEditorMode,
  usePreferenceActions,
  // History hooks
  useArchivedHistoryItems,
  usePinnedHistoryItems,
  useHistoryActions,
} from './useStore';
