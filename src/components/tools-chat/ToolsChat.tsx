'use client';

import { useCallback, useState, useRef, useEffect, ReactNode } from 'react';
import { RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';
import { ToolsChatContainer } from './ToolsChatContainer';
import { useToolsChat } from './hooks/useToolsChat';
import { ShareSessionModal, CollaboratorCursors, CollaboratorAvatar } from '@/components/coworking';
import { useProposalSession } from '@/components/proposal/hooks/useProposalSession';
import { useAppStore } from '@/lib/store';

interface ToolsChatProps {
  className?: string;
  onActionsChange?: (actions: ReactNode) => void;
}

export function ToolsChat({ className, onActionsChange }: ToolsChatProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentUser } = useAppStore();

  const {
    messages,
    isStreaming,
    activeToolForm,
    formValues,
    sendMessage,
    submitToolForm,
    updateFormValue,
    clearChat,
    selectTool,
  } = useToolsChat();

  // Coworking session using unified proposal session hook
  const {
    session,
    isSessionActive,
    startSession,
    typingUsers,
    inviteUser,
    removeUser,
    generateShareLink,
    updateAccessLevel,
    showShareModal,
    setShowShareModal,
  } = useProposalSession({ proposalId: 'calculator' });

  const handleSuggestionClick = useCallback((suggestion: string) => {
    sendMessage(suggestion);
  }, [sendMessage]);

  // Check if this is first load (only welcome message, no user messages, and no tool selected)
  const hasUserMessages = messages.some(m => m.role === 'user');
  const hasToolFormMessages = messages.some(m => m.showToolForm);
  const isFirstLoad = (messages.length <= 1 || !hasUserMessages) && !hasToolFormMessages;

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
                startSession('calculator', 'Calculator Session');
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
      <ToolsChatContainer
        messages={messages}
        isStreaming={isStreaming}
        activeToolForm={activeToolForm}
        formValues={formValues}
        onSendMessage={sendMessage}
        onSubmitToolForm={submitToolForm}
        onUpdateFormValue={updateFormValue}
        onSuggestionClick={handleSuggestionClick}
        onToolSelect={selectTool}
        showWelcome={isFirstLoad}
        className="flex-1"
        sessionActive={isSessionActive}
        typingUsers={typingUsers}
      />

      {/* Share Session Modal */}
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
