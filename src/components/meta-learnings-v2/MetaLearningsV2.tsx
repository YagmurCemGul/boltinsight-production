'use client';

import { useCallback, useRef, useEffect, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { RefreshCw, Users } from 'lucide-react';
import { Button, toast } from '@/components/ui';
import { ChatContainer } from './ChatContainer';
import { useMetaLearningsChat } from './hooks/useMetaLearningsChat';
import { ShareSessionModal, CollaboratorCursors, CollaboratorAvatar } from '@/components/coworking';
import { useProposalSession } from '@/components/proposal/hooks/useProposalSession';
import { useAppStore } from '@/lib/store';

interface MetaLearningsV2Props {
  className?: string;
  onActionsChange?: (actions: ReactNode) => void; // Callback to pass actions to parent
}

export function MetaLearningsV2({ className, onActionsChange }: MetaLearningsV2Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAppStore();

  const {
    messages,
    isStreaming,
    activeFilters,
    sendMessage,
    removeFilter,
    clearFilters,
    clearChat,
  } = useMetaLearningsChat();

  // Coworking session using unified proposal session hook
  const {
    session,
    isSessionActive,
    startSession,
    typingUsers,
    inviteUser,
    removeUser,
    comments,
    getCommentsForSection: getCommentsForMessage,
    addComment,
    resolveComment,
    deleteComment,
    generateShareLink,
    updateAccessLevel,
    showShareModal,
    setShowShareModal,
  } = useProposalSession({ proposalId: 'meta-learnings' });

  // Detailed analysis - send follow-up message
  const handleDetailedAnalysis = useCallback(() => {
    sendMessage('Can you provide more detailed analysis on this topic?');
  }, [sendMessage]);

  const handleSourceClick = (source: { proposalId: string; proposalTitle: string }) => {
    toast.info('Opening Proposal', `Navigating to: ${source.proposalTitle}`);
  };

  const handleActionClick = (action: { id: string; label: string }) => {
    switch (action.id) {
      case 'detail':
        handleDetailedAnalysis();
        break;
      default:
        // Other actions (share, proposal) are handled inline in AIMessage
        break;
    }
  };

  // Check if this is first load (no user messages yet)
  const isFirstLoad = messages.length <= 1 || !messages.some(m => m.role === 'user');

  // Pass actions to parent for rendering in breadcrumbs
  useEffect(() => {
    if (onActionsChange) {
      if (isSessionActive && session) {
        // Show coworking controls in breadcrumbs when session is active
        const actions = (
          <div className="flex items-center gap-2">
            {/* Collaborator avatars */}
            {session.collaborators.length > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex -space-x-2">
                  {session.collaborators.slice(0, 4).map((collaborator) => (
                    <CollaboratorAvatar
                      key={collaborator.id}
                      collaborator={collaborator}
                      showStatus
                      size="sm"
                    />
                  ))}
                </div>
                {session.collaborators.length > 4 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    +{session.collaborators.length - 4}
                  </span>
                )}
              </div>
            )}
            {/* Coworking button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowShareModal(true)}
              className="gap-1 h-7 px-2 text-xs"
            >
              <Users className="h-3.5 w-3.5" />
              Coworking
            </Button>
            {/* Reset button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              disabled={isStreaming || messages.length <= 1}
              className="gap-1.5 h-7 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </div>
        );
        onActionsChange(actions);
      } else {
        // Show default controls when no session
        const actions = (
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                startSession('meta-learnings', 'Meta Learnings Session');
                setShowShareModal(true);
              }}
              className="gap-1.5 h-7 text-xs"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Start Coworking</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              disabled={isStreaming || messages.length <= 1}
              className="gap-1.5 h-7 text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </Button>
          </>
        );
        onActionsChange(actions);
      }
    }
  }, [onActionsChange, isSessionActive, session, isStreaming, messages.length, startSession, clearChat, setShowShareModal]);

  return (
    <div ref={containerRef} className={cn('relative flex h-full flex-col bg-gray-50 dark:bg-[#100E28]', className)}>
      {/* Collaborator Cursors Overlay */}
      {isSessionActive && session && currentUser && (
        <CollaboratorCursors
          collaborators={session.collaborators}
          currentUserId={currentUser.id}
          containerRef={containerRef}
        />
      )}

      {/* Chat content */}
      <ChatContainer
        messages={messages}
        isStreaming={isStreaming}
        activeFilters={activeFilters}
        onSendMessage={sendMessage}
        onFilterRemove={removeFilter}
        onFilterClearAll={clearFilters}
        onSourceClick={handleSourceClick}
        onActionClick={handleActionClick}
        className="flex-1"
        // Coworking props
        sessionActive={isSessionActive}
        comments={comments}
        getCommentsForMessage={getCommentsForMessage}
        onAddComment={addComment}
        onResolveComment={resolveComment}
        onDeleteComment={deleteComment}
        typingUsers={typingUsers}
      />

      {/* Share Modal */}
      {showShareModal && session && (
        <ShareSessionModal
          session={session}
          onClose={() => setShowShareModal(false)}
          onGenerateLink={generateShareLink}
          onUpdateAccessLevel={updateAccessLevel}
          onInviteByEmail={inviteUser}
          onRemoveCollaborator={removeUser}
        />
      )}
    </div>
  );
}
