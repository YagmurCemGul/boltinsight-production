'use client';

import { useState, useRef, useCallback, useMemo, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { Users, MessageSquare, FormInput, FileText, Target, HelpCircle, BarChart2, Globe, Check, Upload, FileDown, Sparkles, Save, Download, ChevronDown, X, FileType, Presentation, Loader2 } from 'lucide-react';
import { useAppStore, teamMembers } from '@/lib/store';
import { Sidebar } from '@/components/sidebar';
import { ChatInterface } from '@/components/chat';
import { RightSidebar, type EditorMode } from '@/components/proposal';
import { SimpleEditor, type SimpleEditorRef } from '@/components/tiptap-templates/simple/simple-editor';
import { useProposalSession } from '@/components/proposal/hooks/useProposalSession';
import { ProposalStatusDropdown } from '@/components/proposal/ProposalStatusDropdown';
import { MetaLearningsAlertProvider } from '@/components/meta-learnings-v2/MetaLearningsAlertProvider';
import { Breadcrumbs } from '@/components/navigation';
import { SettingsModal } from '@/components/admin';
import { OnboardingTour } from '@/components/onboarding';
import { HelpPanel } from '@/components/help';
import { KeyboardShortcutsProvider } from '@/components/keyboard';
import { CreateProjectModal } from '@/components/projects';
import { ShareSessionModal, CollaboratorCursors, CollaboratorAvatar } from '@/components/coworking';
import { Button, toast } from '@/components/ui';
import { cn, getStatusColor } from '@/lib/utils';
import type { Proposal, ProposalContent, User } from '@/types';

// Loading component for lazy-loaded sections
const SectionLoader = () => (
  <div className="flex h-full items-center justify-center">
    <Loader2 className="h-8 w-8 animate-spin text-[#5B50BD]" />
  </div>
);

// Dynamic imports for heavy components (route-based code splitting)
const MetaLearningsV2 = dynamic(() => import('@/components/meta-learnings-v2').then(mod => ({ default: mod.MetaLearningsV2 })), {
  loading: () => <SectionLoader />,
  ssr: false
});

const SearchView = dynamic(() => import('@/components/tools').then(mod => ({ default: mod.SearchView })), {
  loading: () => <SectionLoader />,
  ssr: false
});

const ToolsChat = dynamic(() => import('@/components/tools-chat').then(mod => ({ default: mod.ToolsChat })), {
  loading: () => <SectionLoader />,
  ssr: false
});

const Library = dynamic(() => import('@/components/library').then(mod => ({ default: mod.Library })), {
  loading: () => <SectionLoader />,
  ssr: false
});

const ResourcesHub = dynamic(() => import('@/components/resources').then(mod => ({ default: mod.ResourcesHub })), {
  loading: () => <SectionLoader />,
  ssr: false
});

const Dashboard = dynamic(() => import('@/components/dashboard').then(mod => ({ default: mod.Dashboard })), {
  loading: () => <SectionLoader />,
  ssr: false
});

const ExampleProposals = dynamic(() => import('@/components/admin').then(mod => ({ default: mod.ExampleProposals })), {
  loading: () => <SectionLoader />,
  ssr: false
});

const ProjectsView = dynamic(() => import('@/components/projects').then(mod => ({ default: mod.ProjectsView })), {
  loading: () => <SectionLoader />,
  ssr: false
});

// Section ID to Label mapping for proposal sections
const SECTION_LABELS: Record<string, string> = {
  header: 'Header Information',
  background: 'Background / Context',
  businessObjectives: 'Business Objectives',
  researchObjectives: 'Research Objectives',
  burningQuestions: 'Burning Questions',
  targetDefinition: 'Target Definition',
  sampleSize: 'Sample Size',
  loi: 'LOI (Length of Interview)',
  markets: 'Markets',
  quotas: 'Quota Recommendations',
  advancedAnalysis: 'Advanced Analysis',
  referenceProjects: 'Reference Projects',
};

// Default empty proposal content for new proposals
const DEFAULT_PROPOSAL_CONTENT: ProposalContent = {
  title: '',
  client: '',
  contact: '',
  background: '',
  businessObjectives: [],
  researchObjectives: [],
  burningQuestions: [],
  targetDefinition: '',
  sampleSize: undefined,
  loi: undefined,
  markets: [],
  quotas: [],
  advancedAnalysis: [],
  referenceProjects: [],
};

// Helper function to generate HTML from proposal content
function generateProposalHtml(content: ProposalContent): string {
  const sections: string[] = [];

  if (content.title) {
    sections.push(`<h1>${content.title}</h1>`);
  }

  if (content.client) {
    sections.push(`<p><strong>Client:</strong> ${content.client}</p>`);
  }

  if (content.background) {
    sections.push(`<h2>Background</h2><p>${content.background}</p>`);
  }

  if (content.businessObjectives?.length) {
    sections.push(`<h2>Business Objectives</h2><ul>${content.businessObjectives.map(o => `<li>${o}</li>`).join('')}</ul>`);
  }

  if (content.researchObjectives?.length) {
    sections.push(`<h2>Research Objectives</h2><ul>${content.researchObjectives.map(o => `<li>${o}</li>`).join('')}</ul>`);
  }

  if (content.burningQuestions?.length) {
    sections.push(`<h2>Burning Questions</h2><ul>${content.burningQuestions.map(q => `<li>${q}</li>`).join('')}</ul>`);
  }

  if (content.targetDefinition) {
    sections.push(`<h2>Target Definition</h2><p>${content.targetDefinition}</p>`);
  }

  if (content.sampleSize) {
    sections.push(`<h2>Sample Size</h2><p>${content.sampleSize}</p>`);
  }

  if (content.markets?.length) {
    sections.push(`<h2>Markets</h2><ul>${content.markets.map(m => `<li>${m.country} (${m.language}) - n=${m.sampleSize || 'TBD'}</li>`).join('')}</ul>`);
  }

  return sections.join('\n') || '<h1>Untitled Proposal</h1><p>Start writing your proposal here...</p>';
}

// Approver Selection Modal Component
interface ApproverModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (approver: User) => void;
  currentUserId?: string;
}

function ApproverModal({ isOpen, onClose, onSelect, currentUserId }: ApproverModalProps) {
  if (!isOpen) return null;

  // Filter out current user and get managers/admins who can approve
  const approvers = teamMembers.filter(
    member => member.id !== currentUserId && (member.role === 'manager' || member.role === 'admin')
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Select Approver</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Choose who should review and approve this proposal.
        </p>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {approvers.map(approver => (
            <button
              key={approver.id}
              onClick={() => {
                onSelect(approver);
                onClose();
              }}
              className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="w-10 h-10 rounded-full bg-[#5B50BD] flex items-center justify-center text-white font-medium">
                {approver.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 dark:text-white truncate">{approver.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">{approver.email}</p>
              </div>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 capitalize">
                {approver.role}
              </span>
            </button>
          ))}
          {approvers.length === 0 && (
            <p className="text-center text-gray-500 dark:text-gray-400 py-4">
              No approvers available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// Save Draft Modal Component
interface SaveDraftModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: () => void;
  onDiscard: () => void;
}

function SaveDraftModal({ isOpen, onClose, onSave, onDiscard }: SaveDraftModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Save as Draft?</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          You have unsaved changes in your proposal. Would you like to save it as a draft before leaving?
        </p>
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onDiscard}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Discard
          </button>
          <button
            onClick={onSave}
            className="px-4 py-2 text-sm bg-[#5B50BD] hover:bg-[#4A41A0] text-white rounded-lg transition-colors"
          >
            Save as Draft
          </button>
        </div>
      </div>
    </div>
  );
}

// Rejection Modal Component
interface RejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onReject: (reason: string) => void;
  proposalTitle?: string;
}

function RejectionModal({ isOpen, onClose, onReject, proposalTitle }: RejectionModalProps) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const handleReject = () => {
    if (!reason.trim()) {
      toast.error('Required', 'Please provide a reason for rejection.');
      return;
    }
    onReject(reason);
    setReason('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-md w-full mx-4 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Reject Proposal</h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {proposalTitle && (
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 font-medium">
            "{proposalTitle}"
          </p>
        )}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Please provide a reason for rejection. This will be visible to the proposal author.
        </p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Enter rejection reason..."
          className="w-full p-3 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-900 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
          rows={4}
        />
        <div className="flex items-center justify-end gap-3 mt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleReject}
            className="px-4 py-2 text-sm bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
          >
            Reject Proposal
          </button>
        </div>
      </div>
    </div>
  );
}

export function MainContent() {
  const {
    activeSection,
    sidebarCollapsed,
    sidebarWidth,
    rightSidebarCollapsed,
    setRightSidebarCollapsed,
    currentProposal,
    setCurrentProposal,
    onboardingCompleted,
    setOnboardingCompleted,
    setActiveSection,
    showCreateProjectModal,
    setShowCreateProjectModal,
    setCurrentChatProject,
    showSettingsModal,
    setShowSettingsModal,
    currentUser,
    defaultEditorMode,
    addProposal,
    updateProposal,
    // Workflow actions
    submitToManager,
    managerApprove,
    managerReject,
    submitToClient,
    clientApprove,
    clientReject,
    putOnHold,
    requestRevision,
    reopenProposal,
  } = useAppStore();

  // Container ref for cursor tracking
  const proposalContainerRef = useRef<HTMLDivElement>(null);

  // Editor ref for accessing editor content
  const editorRef = useRef<SimpleEditorRef>(null);

  // State for inline field editing from RightSidebar clicks
  const [activeFieldSection, setActiveFieldSection] = useState<string | null>(null);

  // State for editor mode (chat, editor, document) - use store's default
  const [editorMode, setEditorMode] = useState<EditorMode>(defaultEditorMode);

  // State for new proposal content (when creating a new proposal)
  const [newProposalContent, setNewProposalContent] = useState<ProposalContent>(DEFAULT_PROPOSAL_CONTENT);

  // Generate a unique ID for each new proposal session (persists for the session)
  const newProposalChatId = useMemo(() => `new-proposal-${Date.now()}`, []);

  // Create a temporary Proposal object for new proposals (for DocumentEditor)
  const tempNewProposal: Proposal = useMemo(() => {
    const tempAuthor = currentUser || {
      id: 'anonymous',
      name: 'Anonymous',
      email: 'anonymous@example.com',
      role: 'researcher' as const,
    };
    return {
      id: newProposalChatId,
      content: newProposalContent,
      status: 'draft' as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      author: tempAuthor,
      versions: [],
      collaborators: [],
    };
  }, [newProposalChatId, newProposalContent, currentUser]);

  // State for breadcrumbs actions (e.g., from Meta Learnings)
  const [breadcrumbActions, setBreadcrumbActions] = useState<ReactNode>(null);

  // State for custom breadcrumb items (from SearchView)
  const [customBreadcrumbs, setCustomBreadcrumbs] = useState<{ label: string; section?: string; current?: boolean; tooltip?: string }[] | null>(null);

  // State for export dropdown and approver modal
  const [showExportDropdown, setShowExportDropdown] = useState(false);
  const [showApproverModal, setShowApproverModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState<User | null>(null);

  // State for "Save as draft?" confirmation when leaving new proposal
  const [showSaveDraftModal, setShowSaveDraftModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // Check if new proposal has unsaved content
  const hasUnsavedNewProposal = useCallback(() => {
    if (activeSection !== 'new-proposal') return false;
    const content = newProposalContent;
    return !!(
      content.title ||
      content.client ||
      content.background ||
      (content.businessObjectives && content.businessObjectives.length > 0) ||
      (content.researchObjectives && content.researchObjectives.length > 0) ||
      (content.burningQuestions && content.burningQuestions.length > 0) ||
      content.targetDefinition ||
      content.sampleSize ||
      (content.markets && content.markets.length > 0)
    );
  }, [activeSection, newProposalContent]);

  // Handle navigation with confirmation
  const handleNavigate = useCallback((section: string) => {
    if (activeSection === 'new-proposal' && section !== 'new-proposal' && hasUnsavedNewProposal()) {
      setPendingNavigation(section);
      setShowSaveDraftModal(true);
    } else {
      setActiveSection(section);
    }
  }, [activeSection, hasUnsavedNewProposal, setActiveSection]);

  // Determine current proposal ID for coworking (new-proposal or existing)
  const currentProposalId = currentProposal?.id || 'new-proposal';

  // Coworking session for proposals - now per-proposal
  const {
    session,
    isSessionActive,
    startSession,
    updateSessionName,
    inviteUser,
    removeUser,
    generateShareLink,
    updateAccessLevel,
    showShareModal,
    setShowShareModal,
  } = useProposalSession({ proposalId: currentProposalId });

  // Get current proposal content for RightSidebar
  const currentProposalContent: ProposalContent = currentProposal?.content || newProposalContent;

  // Handle proposal content updates from ChatInterface
  const handleNewProposalContentUpdate = useCallback((key: keyof ProposalContent, value: unknown) => {
    setNewProposalContent(prev => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  // Handle proposal content updates for existing proposals
  const handleExistingProposalContentUpdate = useCallback((key: keyof ProposalContent, value: unknown) => {
    if (currentProposal) {
      setCurrentProposal({
        ...currentProposal,
        content: {
          ...currentProposal.content,
          [key]: value,
        },
      });
    }
  }, [currentProposal, setCurrentProposal]);

  // Handle section click from RightSidebar
  const handleSectionClick = useCallback((sectionId: string) => {
    setActiveFieldSection(sectionId);
  }, []);

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'new-proposal':
        return (
          <div ref={proposalContainerRef} className="relative flex h-full overflow-hidden">
            {/* Collaborator Cursors Overlay */}
            {isSessionActive && session && currentUser && (
              <CollaboratorCursors
                collaborators={session.collaborators}
                currentUserId={currentUser.id}
                containerRef={proposalContainerRef}
              />
            )}

            {/* Main Content Area */}
            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
              {/* Content - Chat Interface or Document Editor */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {editorMode === 'editor' ? (
                  <div className="flex-1 overflow-hidden">
                    <SimpleEditor ref={editorRef} />
                  </div>
                ) : (
                  <ChatInterface
                    proposalId={newProposalChatId}
                    activeFieldSection={activeFieldSection}
                    onFieldSectionChange={setActiveFieldSection}
                    proposalContent={newProposalContent}
                    onProposalContentUpdate={handleNewProposalContentUpdate}
                  />
                )}
              </div>
            </div>

            {/* Compact Right Sidebar */}
            <RightSidebar
              content={newProposalContent}
              activeSection={activeFieldSection || undefined}
              onSectionClick={handleSectionClick}
              compact={true}
              collapsed={rightSidebarCollapsed}
              editorMode={editorMode}
              onEditorModeChange={setEditorMode}
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

      case 'view-proposal':
        return currentProposal ? (
          <div ref={proposalContainerRef} className="relative flex h-full overflow-hidden">
            {/* Collaborator Cursors Overlay */}
            {isSessionActive && session && currentUser && (
              <CollaboratorCursors
                collaborators={session.collaborators}
                currentUserId={currentUser.id}
                containerRef={proposalContainerRef}
              />
            )}

            <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
              {/* Content - Chat Interface or Document Editor */}
              <div className="flex-1 overflow-hidden flex flex-col">
                {editorMode === 'editor' ? (
                  <div className="flex-1 overflow-hidden">
                    <SimpleEditor
                      ref={editorRef}
                      initialContent={currentProposal.content.documentHtml || generateProposalHtml(currentProposal.content)}
                    />
                  </div>
                ) : (
                  <ChatInterface
                    proposalId={currentProposal.id}
                    activeFieldSection={activeFieldSection}
                    onFieldSectionChange={setActiveFieldSection}
                    proposalContent={currentProposal.content}
                    onProposalContentUpdate={handleExistingProposalContentUpdate}
                  />
                )}
              </div>
            </div>

            {/* Compact Right Sidebar */}
            <RightSidebar
              content={currentProposal.content}
              activeSection={activeFieldSection || undefined}
              onSectionClick={handleSectionClick}
              compact={true}
              collapsed={rightSidebarCollapsed}
              editorMode={editorMode}
              onEditorModeChange={setEditorMode}
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
        ) : (
          <EmptyState message="Select a proposal to view" />
        );

      case 'meta-learnings':
        return <MetaLearningsV2 onActionsChange={setBreadcrumbActions} />;

      case 'calculators':
        return <ToolsChat onActionsChange={setBreadcrumbActions} />;

      case 'library':
        return <Library onActionsChange={setBreadcrumbActions} />;

      case 'resources':
        return <ResourcesHub />;

      case 'dashboard':
        return <Dashboard />;

      case 'chat-projects':
        return <ProjectsView />;

      case 'example-proposals':
        return <ExampleProposals />;

      case 'search-my':
        return <SearchView searchAll={false} onActionsChange={setBreadcrumbActions} onBreadcrumbsChange={setCustomBreadcrumbs} />;

      case 'search-all':
        return <SearchView searchAll={true} onActionsChange={setBreadcrumbActions} onBreadcrumbsChange={setCustomBreadcrumbs} />;

      default:
        // Handle project views
        if (activeSection.startsWith('project-')) {
          return <ProjectView projectId={activeSection.replace('project-', '')} />;
        }

        // Default to Dashboard as the landing page
        return <Dashboard />;
    }
  };

  return (
    <KeyboardShortcutsProvider>
      {/* Meta Learnings Alert Provider - generates alerts for notifications */}
      <MetaLearningsAlertProvider />

      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar onNavigate={handleNavigate} />

        {/* Main Content Area */}
        <main
          className="flex-1 transition-all duration-200 flex flex-col"
          style={{ marginLeft: sidebarCollapsed ? 64 : sidebarWidth }}
        >
          {/* Section indicator and Breadcrumbs - shown on most pages (excluding dashboard and chat-projects) */}
          {activeSection !== 'dashboard' && activeSection !== 'chat-projects' && (
            <div className="flex-shrink-0">
              {/* Section indicator - shown above breadcrumbs when editing a proposal section */}
              {(activeSection === 'new-proposal' || activeSection === 'view-proposal') && activeFieldSection && (
                <div className="px-6 py-2 border-b border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400 dark:text-gray-500">Editing:</span>
                    <span className="text-xs font-medium text-[#5B50BD] dark:text-[#918AD3]">
                      {SECTION_LABELS[activeFieldSection] || activeFieldSection}
                    </span>
                  </div>
                </div>
              )}
              {/* Breadcrumbs */}
              <div className="px-6 py-3 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                <Breadcrumbs
                  items={
                    ['search-my', 'search-all'].includes(activeSection) && customBreadcrumbs
                      ? customBreadcrumbs
                      : activeSection === 'new-proposal' && newProposalContent.title
                        ? [
                            {
                              label: 'New Proposal',
                              onClick: () => {
                                // Check if there's unsaved content and ask to save as draft
                                if (hasUnsavedNewProposal()) {
                                  setPendingNavigation('new-proposal');
                                  setShowSaveDraftModal(true);
                                } else {
                                  // No unsaved content, just reset
                                  setNewProposalContent(DEFAULT_PROPOSAL_CONTENT);
                                }
                              }
                            },
                            { label: newProposalContent.title, current: true }
                          ]
                        : undefined
                  }
                  actions={
                    ['meta-learnings', 'calculators', 'search-my', 'search-all', 'library'].includes(activeSection)
                      ? breadcrumbActions
                      : (activeSection === 'new-proposal' || activeSection === 'view-proposal')
                        ? (
                          <div className="flex items-center gap-2">
                            {/* Status Dropdown with Workflow Actions */}
                            {(() => {
                              const proposal = activeSection === 'view-proposal' ? currentProposal : tempNewProposal;
                              if (!proposal || !currentUser) return null;

                              return (
                                <ProposalStatusDropdown
                                  proposal={proposal}
                                  currentUser={currentUser}
                                  managers={teamMembers}
                                  compact
                                  onSubmitToManager={(managerId, comment) => {
                                    submitToManager(proposal.id, managerId, comment);
                                    toast.success('Submitted', 'Proposal sent for manager approval.');
                                  }}
                                  onManagerApprove={(comment) => {
                                    managerApprove(proposal.id, comment);
                                    toast.success('Approved', 'You approved this proposal.');
                                  }}
                                  onManagerReject={(comment) => {
                                    managerReject(proposal.id, comment);
                                    toast.success('Rejected', 'Proposal has been rejected.');
                                  }}
                                  onSubmitToClient={(clientEmail, comment) => {
                                    submitToClient(proposal.id, clientEmail, comment);
                                    toast.success('Sent', 'Proposal sent to client for approval.');
                                  }}
                                  onClientApprove={(comment) => {
                                    clientApprove(proposal.id, comment);
                                    toast.success('Client Approved', 'Proposal approved by client!');
                                  }}
                                  onClientReject={(comment) => {
                                    clientReject(proposal.id, comment);
                                    toast.success('Client Rejected', 'Proposal rejected by client.');
                                  }}
                                  onPutOnHold={(comment) => {
                                    putOnHold(proposal.id, comment);
                                    toast.success('On Hold', 'Proposal put on hold.');
                                  }}
                                  onRequestRevision={(comment) => {
                                    requestRevision(proposal.id, comment);
                                    toast.success('Revision Requested', 'Revisions requested from author.');
                                  }}
                                  onReopen={() => {
                                    reopenProposal(proposal.id);
                                    toast.success('Reopened', 'Proposal reopened as draft.');
                                  }}
                                />
                              );
                            })()}

                            {/* Divider */}
                            <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />

                            {/* Save Button */}
                            {editorMode === 'editor' && (
                              <button
                                onClick={() => {
                                  const html = editorRef.current?.getHTML() || '';
                                  if (activeSection === 'view-proposal' && currentProposal) {
                                    updateProposal(currentProposal.id, {
                                      content: { ...currentProposal.content, documentHtml: html }
                                    });
                                  }
                                  toast.success('Saved', 'Your changes have been saved.');
                                }}
                                className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                title="Save"
                              >
                                <Save className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Save</span>
                              </button>
                            )}

                            {/* Export Dropdown */}
                            {editorMode === 'editor' && (
                              <div className="relative">
                                <button
                                  onClick={() => setShowExportDropdown(!showExportDropdown)}
                                  className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
                                  title="Export"
                                >
                                  <Download className="w-3.5 h-3.5" />
                                  <span className="hidden sm:inline">Export</span>
                                  <ChevronDown className="w-3 h-3" />
                                </button>
                                {showExportDropdown && (
                                  <>
                                    <div className="fixed inset-0 z-40" onClick={() => setShowExportDropdown(false)} />
                                    <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50 min-w-[140px] py-1">
                                      <button
                                        onClick={() => {
                                          const html = editorRef.current?.getHTML() || '';
                                          const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Proposal</title></head><body>${html}</body></html>`], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                                          const url = URL.createObjectURL(blob);
                                          const a = document.createElement('a');
                                          a.href = url;
                                          a.download = `proposal-${currentProposal?.id || 'draft'}.docx`;
                                          a.click();
                                          URL.revokeObjectURL(url);
                                          setShowExportDropdown(false);
                                          toast.success('Exported', 'Document exported as DOCX.');
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        <FileType className="w-4 h-4" />
                                        Export as DOCX
                                      </button>
                                      <button
                                        onClick={() => {
                                          const html = editorRef.current?.getHTML() || '';
                                          const printWindow = window.open('', '_blank');
                                          if (printWindow) {
                                            printWindow.document.write(`<!DOCTYPE html><html><head><title>Proposal</title><style>body{font-family:sans-serif;padding:40px;max-width:800px;margin:0 auto;}</style></head><body>${html}</body></html>`);
                                            printWindow.document.close();
                                            printWindow.print();
                                          }
                                          setShowExportDropdown(false);
                                          toast.success('Exported', 'Document sent to print as PDF.');
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        <FileDown className="w-4 h-4" />
                                        Export as PDF
                                      </button>
                                      <button
                                        onClick={() => {
                                          const html = editorRef.current?.getHTML() || '';
                                          const blob = new Blob([`<!DOCTYPE html><html><head><meta charset="utf-8"><title>Proposal</title></head><body>${html}</body></html>`], { type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation' });
                                          const url = URL.createObjectURL(blob);
                                          const a = document.createElement('a');
                                          a.href = url;
                                          a.download = `proposal-${currentProposal?.id || 'draft'}.pptx`;
                                          a.click();
                                          URL.revokeObjectURL(url);
                                          setShowExportDropdown(false);
                                          toast.success('Exported', 'Document exported as PPTX.');
                                        }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                                      >
                                        <Presentation className="w-4 h-4" />
                                        Export as PPTX
                                      </button>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}

                            {/* Divider */}
                            <div className="w-px h-4 bg-gray-200 dark:bg-gray-600" />

                            {/* Editor Mode Toggle */}
                            <div className="flex items-center gap-0.5 p-0.5 rounded-lg bg-gray-100 dark:bg-gray-700">
                              <button
                                onClick={() => setEditorMode('chat')}
                                className={cn(
                                  "p-1 rounded transition-all",
                                  editorMode === 'chat'
                                    ? "bg-white dark:bg-gray-600 text-[#5B50BD] dark:text-[#918AD3] shadow-sm"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                )}
                                title="Chat Mode"
                              >
                                <MessageSquare className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={() => setEditorMode('editor')}
                                className={cn(
                                  "p-1 rounded transition-all",
                                  editorMode === 'editor'
                                    ? "bg-white dark:bg-gray-600 text-[#5B50BD] dark:text-[#918AD3] shadow-sm"
                                    : "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                )}
                                title="Document Editor"
                              >
                                <FormInput className="h-3.5 w-3.5" />
                              </button>
                            </div>

                            {/* Sections Button */}
                            <button
                              onClick={() => setRightSidebarCollapsed(!rightSidebarCollapsed)}
                              className={cn(
                                "flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors",
                                rightSidebarCollapsed
                                  ? "bg-[#5B50BD] text-white hover:bg-[#4a41a0]"
                                  : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                              )}
                            >
                              Sections
                            </button>
                            {/* Collaborator Avatars */}
                            {isSessionActive && session && session.collaborators.length > 0 && (
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
                            {/* Co-working Button */}
                            <button
                              onClick={() => {
                                if (!isSessionActive) {
                                  startSession(currentProposalId);
                                }
                                setShowShareModal(true);
                              }}
                              className={cn(
                                "flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium transition-colors",
                                isSessionActive
                                  ? "bg-[#1ED6BB]/10 text-[#1ED6BB] border border-[#1ED6BB]/30 hover:bg-[#1ED6BB]/20"
                                  : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                              )}
                              title="Collaborate with team"
                            >
                              <Users className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">{isSessionActive ? 'Collaborating' : 'Coworking'}</span>
                            </button>

                          </div>
                        )
                        : undefined
                  }
                />
              </div>
            </div>
          )}
          <div className="flex-1 overflow-hidden">{renderContent()}</div>
        </main>

        {/* Onboarding Tour */}
        <OnboardingTour
          isOpen={!onboardingCompleted}
          onComplete={() => setOnboardingCompleted(true)}
          onSkip={() => setOnboardingCompleted(true)}
        />

        {/* Help Panel - contextual help for each section */}
        <HelpPanel section={activeSection} />

        {/* Global Create Project Modal */}
        <CreateProjectModal
          isOpen={showCreateProjectModal}
          onClose={() => setShowCreateProjectModal(false)}
          onProjectCreated={(project) => {
            setCurrentChatProject(project);
            setActiveSection('chat-projects');
          }}
        />

        {/* Global Settings Modal */}
        <SettingsModal
          isOpen={showSettingsModal}
          onClose={() => setShowSettingsModal(false)}
        />

        {/* Approver Selection Modal (Legacy - uses new workflow) */}
        <ApproverModal
          isOpen={showApproverModal}
          onClose={() => setShowApproverModal(false)}
          currentUserId={currentUser?.id}
          onSelect={(approver) => {
            if (activeSection === 'view-proposal' && currentProposal) {
              // Existing proposal - submit to manager
              submitToManager(currentProposal.id, approver.id);
              toast.success('Submitted', `Proposal sent to ${approver.name} for manager approval.`);
            } else if (activeSection === 'new-proposal') {
              // New proposal - first save it to store, then submit to manager
              const savedProposal = addProposal({
                content: newProposalContent,
                status: 'draft',
                author: currentUser || {
                  id: 'anonymous',
                  name: 'Anonymous',
                  email: 'anonymous@example.com',
                  role: 'researcher' as const,
                },
                collaborators: [],
              });
              // Now submit the saved proposal to manager
              submitToManager(savedProposal.id, approver.id);
              // Navigate to view the saved proposal
              setCurrentProposal(savedProposal);
              setActiveSection('view-proposal');
              // Reset the new proposal content
              setNewProposalContent(DEFAULT_PROPOSAL_CONTENT);
              toast.success('Submitted', `Proposal saved and sent to ${approver.name} for manager approval.`);
            }
            setShowApproverModal(false);
          }}
        />

        {/* Rejection Modal (Legacy - uses new workflow) */}
        <RejectionModal
          isOpen={showRejectModal}
          onClose={() => setShowRejectModal(false)}
          proposalTitle={currentProposal?.content.title || tempNewProposal?.content.title}
          onReject={(reason) => {
            const proposal = activeSection === 'view-proposal' ? currentProposal : tempNewProposal;
            if (proposal) {
              managerReject(proposal.id, reason);
              toast.success('Rejected', 'Proposal has been rejected by manager.');
            }
          }}
        />

        {/* Save Draft Confirmation Modal */}
        <SaveDraftModal
          isOpen={showSaveDraftModal}
          onClose={() => {
            setShowSaveDraftModal(false);
            setPendingNavigation(null);
          }}
          onSave={() => {
            // Save the proposal as draft
            const savedProposal = addProposal({
              content: newProposalContent,
              status: 'draft',
              author: currentUser || {
                id: 'anonymous',
                name: 'Anonymous',
                email: 'anonymous@example.com',
                role: 'researcher' as const,
              },
              collaborators: [],
            });
            toast.success('Saved', 'Proposal saved as draft.');
            // Reset the new proposal content
            setNewProposalContent(DEFAULT_PROPOSAL_CONTENT);
            // Navigate to pending destination
            if (pendingNavigation) {
              setActiveSection(pendingNavigation);
            }
            setShowSaveDraftModal(false);
            setPendingNavigation(null);
          }}
          onDiscard={() => {
            // Discard changes and navigate
            setNewProposalContent(DEFAULT_PROPOSAL_CONTENT);
            if (pendingNavigation) {
              setActiveSection(pendingNavigation);
            }
            setShowSaveDraftModal(false);
            setPendingNavigation(null);
          }}
        />
      </div>
    </KeyboardShortcutsProvider>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-gray-500">{message}</p>
    </div>
  );
}

// Document Editor View Component
interface DocumentEditorViewProps {
  proposalContent: ProposalContent;
  onProposalContentUpdate: (key: keyof ProposalContent, value: unknown) => void;
  activeFieldSection: string | null;
  onFieldSectionChange: (section: string | null) => void;
}

function DocumentEditorView({
  proposalContent,
  onProposalContentUpdate,
  activeFieldSection,
  onFieldSectionChange,
}: DocumentEditorViewProps) {
  const sections = [
    { id: 'header', label: 'Header Information', icon: FileText, color: 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400' },
    { id: 'background', label: 'Background / Context', icon: MessageSquare, color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
    { id: 'businessObjectives', label: 'Business Objectives', icon: Target, color: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' },
    { id: 'researchObjectives', label: 'Research Objectives', icon: Target, color: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' },
    { id: 'burningQuestions', label: 'Burning Questions', icon: HelpCircle, color: 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' },
    { id: 'targetDefinition', label: 'Target Definition', icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
    { id: 'sampleSize', label: 'Sample Size', icon: BarChart2, color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
    { id: 'markets', label: 'Markets', icon: Globe, color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  ];

  const hasContent = (sectionId: string): boolean => {
    const content = proposalContent;
    switch (sectionId) {
      case 'header':
        return !!(content.title || content.client || content.contact);
      case 'background':
        return !!content.background;
      case 'businessObjectives':
        return !!(content.businessObjectives && content.businessObjectives.length > 0);
      case 'researchObjectives':
        return !!(content.researchObjectives && content.researchObjectives.length > 0);
      case 'burningQuestions':
        return !!(content.burningQuestions && content.burningQuestions.length > 0);
      case 'targetDefinition':
        return !!content.targetDefinition;
      case 'sampleSize':
        return !!content.sampleSize;
      case 'markets':
        return !!(content.markets && content.markets.length > 0);
      default:
        return false;
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-3xl px-6 py-8">
        {/* Empty State Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#5B50BD]/10">
            <FormInput className="h-8 w-8 text-[#5B50BD]" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Document Editor</h2>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            Click on a section below to start editing your proposal
          </p>
        </div>

        {/* Sections Grid */}
        <div className="grid gap-4 sm:grid-cols-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const filled = hasContent(section.id);
            const isActive = activeFieldSection === section.id;

            return (
              <button
                key={section.id}
                onClick={() => onFieldSectionChange(isActive ? null : section.id)}
                className={cn(
                  'group relative flex items-start gap-4 rounded-xl border p-4 text-left transition-all',
                  isActive
                    ? 'border-[#5B50BD] bg-[#5B50BD]/5 ring-1 ring-[#5B50BD]'
                    : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600'
                )}
              >
                <div className={cn('flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg', section.color)}>
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <span className={cn(
                      'text-sm font-medium',
                      isActive ? 'text-[#5B50BD] dark:text-[#918AD3]' : 'text-gray-900 dark:text-white'
                    )}>
                      {section.label}
                    </span>
                    {filled && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {filled ? 'Content added' : 'Click to add content'}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <Upload className="h-4 w-4" />
            Import from File
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <FileDown className="h-4 w-4" />
            Export Draft
          </Button>
          <Button variant="outline" size="sm" className="gap-2">
            <Sparkles className="h-4 w-4" />
            AI Generate All
          </Button>
        </div>

        {/* Active Section Editor */}
        {activeFieldSection && (
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
            <h3 className="mb-4 text-lg font-medium text-gray-900 dark:text-white">
              {sections.find(s => s.id === activeFieldSection)?.label || activeFieldSection}
            </h3>
            {renderSectionEditor(activeFieldSection, proposalContent, onProposalContentUpdate)}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to render section-specific editors
function renderSectionEditor(
  sectionId: string,
  content: ProposalContent,
  onUpdate: (key: keyof ProposalContent, value: unknown) => void
) {
  switch (sectionId) {
    case 'header':
      return (
        <div className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Title</label>
            <input
              type="text"
              value={content.title || ''}
              onChange={(e) => onUpdate('title', e.target.value)}
              placeholder="Enter proposal title..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5B50BD] focus:outline-none focus:ring-1 focus:ring-[#5B50BD] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Client</label>
            <input
              type="text"
              value={content.client || ''}
              onChange={(e) => onUpdate('client', e.target.value)}
              placeholder="Enter client name..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5B50BD] focus:outline-none focus:ring-1 focus:ring-[#5B50BD] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">Contact</label>
            <input
              type="text"
              value={content.contact || ''}
              onChange={(e) => onUpdate('contact', e.target.value)}
              placeholder="Enter contact person..."
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5B50BD] focus:outline-none focus:ring-1 focus:ring-[#5B50BD] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
            />
          </div>
        </div>
      );
    case 'background':
      return (
        <textarea
          value={content.background || ''}
          onChange={(e) => onUpdate('background', e.target.value)}
          placeholder="Enter background and context..."
          rows={6}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5B50BD] focus:outline-none focus:ring-1 focus:ring-[#5B50BD] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      );
    case 'businessObjectives':
      return (
        <textarea
          value={content.businessObjectives?.join('\n') || ''}
          onChange={(e) => onUpdate('businessObjectives', e.target.value.split('\n').filter(Boolean))}
          placeholder="Enter business objectives (one per line)..."
          rows={5}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5B50BD] focus:outline-none focus:ring-1 focus:ring-[#5B50BD] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      );
    case 'researchObjectives':
      return (
        <textarea
          value={content.researchObjectives?.join('\n') || ''}
          onChange={(e) => onUpdate('researchObjectives', e.target.value.split('\n').filter(Boolean))}
          placeholder="Enter research objectives (one per line)..."
          rows={5}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5B50BD] focus:outline-none focus:ring-1 focus:ring-[#5B50BD] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      );
    case 'burningQuestions':
      return (
        <textarea
          value={content.burningQuestions?.join('\n') || ''}
          onChange={(e) => onUpdate('burningQuestions', e.target.value.split('\n').filter(Boolean))}
          placeholder="Enter burning questions (one per line)..."
          rows={5}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5B50BD] focus:outline-none focus:ring-1 focus:ring-[#5B50BD] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      );
    case 'targetDefinition':
      return (
        <textarea
          value={content.targetDefinition || ''}
          onChange={(e) => onUpdate('targetDefinition', e.target.value)}
          placeholder="Enter target definition..."
          rows={4}
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5B50BD] focus:outline-none focus:ring-1 focus:ring-[#5B50BD] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      );
    case 'sampleSize':
      return (
        <input
          type="number"
          value={content.sampleSize || ''}
          onChange={(e) => onUpdate('sampleSize', parseInt(e.target.value) || undefined)}
          placeholder="Enter sample size..."
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:border-[#5B50BD] focus:outline-none focus:ring-1 focus:ring-[#5B50BD] dark:border-gray-700 dark:bg-gray-900 dark:text-white"
        />
      );
    case 'markets':
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Market configuration coming soon. Use Chat Mode for now.
        </div>
      );
    default:
      return (
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Editor for this section is not available yet.
        </div>
      );
  }
}

function ProjectView({ projectId }: { projectId: string }) {
  const { projects, proposals, setCurrentProposal, setActiveSection } = useAppStore();
  const project = projects.find((p) => p.id === projectId);

  if (!project) {
    return <EmptyState message="Project not found" />;
  }

  const projectProposals = proposals.filter(
    (p) => p.projectId === projectId || project.proposals.includes(p.id)
  );

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mb-6">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">{project.name}</h1>
        {project.description && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{project.description}</p>
        )}
        {project.client && (
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Client: {project.client}</p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {projectProposals.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 dark:text-gray-400">
            No proposals in this project yet
          </p>
        ) : (
          projectProposals.map((proposal) => (
            <button
              key={proposal.id}
              onClick={() => {
                setCurrentProposal(proposal);
                setActiveSection('view-proposal');
              }}
              className="rounded-lg border border-gray-200 bg-white p-4 text-left transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-medium text-[#5B50BD] dark:text-[#918AD3]">
                  {proposal.code || 'Draft'}
                </span>
                <span
                  className={cn(
                    'rounded px-2 py-0.5 text-xs font-medium',
                    getStatusColor(proposal.status)
                  )}
                >
                  {proposal.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                {proposal.content.title || 'Untitled Proposal'}
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {proposal.content.client || 'No client'}
              </p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}

