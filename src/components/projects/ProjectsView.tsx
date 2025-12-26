'use client';

import { useState, useRef } from 'react';
import {
  MoreHorizontal,
  MessageSquare,
  Users,
  Trash2,
  Upload,
  X,
  FileText,
  Image,
  File,
  Folder,
  FolderOpen,
  Plus,
  Settings2,
  LogOut,
  Lock,
  ChevronDown,
  Info,
  Briefcase,
  Link2,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { toast } from '@/components/ui';
import { ProjectChat } from './ProjectChat';
import type { ChatProject, ProjectConversation } from '@/types';
import { formatDistanceToNow, format } from 'date-fns';

type HeaderTab = 'details' | 'files' | 'team' | 'proposals' | null;

export function ProjectsView() {
  const {
    currentChatProject,
    currentConversation,
    setCurrentChatProject,
    setCurrentConversation,
    addConversation,
    deleteConversation,
    deleteChatProject,
    addProjectFile,
    updateChatProject,
    addProjectCollaborator,
    removeProjectCollaborator,
    proposals,
  } = useAppStore();

  const [showFileUploadModal, setShowFileUploadModal] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<HeaderTab>(null);
  const [newConversationInput, setNewConversationInput] = useState('');
  const [showProjectOptionsMenu, setShowProjectOptionsMenu] = useState(false);
  const [showInstructionsModal, setShowInstructionsModal] = useState(false);
  const [instructionsInput, setInstructionsInput] = useState('');
  const [showCoworkingModal, setShowCoworkingModal] = useState(false);
  const [coworkingEmail, setCoworkingEmail] = useState('');
  const [coworkingAccess, setCoworkingAccess] = useState<'invited' | 'anyone'>('invited');
  const [coworkingRole, setCoworkingRole] = useState<'editor' | 'viewer'>('editor');
  const [conversationMenuOpen, setConversationMenuOpen] = useState<string | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [showHeaderAddMenu, setShowHeaderAddMenu] = useState(false);
  const [showAddProposalModal, setShowAddProposalModal] = useState(false);
  const [showAddLinkModal, setShowAddLinkModal] = useState(false);
  const [showLinkedProposalsModal, setShowLinkedProposalsModal] = useState(false);
  const [showLinkedFilesModal, setShowLinkedFilesModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [proposalSearchQuery, setProposalSearchQuery] = useState('');
  const [fileSearchQuery, setFileSearchQuery] = useState('');
  const [selectedProposalId, setSelectedProposalId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filter proposals that are not already linked to this project
  const availableProposals = proposals.filter(
    (p) => !currentChatProject?.proposals.some((linked) => linked.id === p.id)
  ).filter(
    (p) => !proposalSearchQuery || p.content.title?.toLowerCase().includes(proposalSearchQuery.toLowerCase())
  );

  // All proposals for the linked proposals modal (filtered by search)
  const allProposalsFiltered = proposals.filter(
    (p) => !proposalSearchQuery || p.content.title?.toLowerCase().includes(proposalSearchQuery.toLowerCase())
  );

  // Filter files for search
  const filteredFiles = currentChatProject?.files.filter(
    (f) => !fileSearchQuery || f.name.toLowerCase().includes(fileSearchQuery.toLowerCase())
  ) || [];

  // File upload handlers
  const handleFileUpload = (files: FileList | null) => {
    if (!files || !currentChatProject) return;

    Array.from(files).forEach((file) => {
      const fileType = file.type.startsWith('image/')
        ? 'image'
        : file.type.includes('document') || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx')
        ? 'document'
        : file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')
        ? 'data'
        : 'other';

      addProjectFile(currentChatProject.id, {
        name: file.name,
        type: fileType,
        size: file.size,
        url: URL.createObjectURL(file),
        uploadedBy: 'current-user',
      });
    });

    setShowFileUploadModal(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  // Render tab content panel
  const renderTabPanel = () => {
    if (!activeTab || !currentChatProject) return null;

    return (
      <div className="absolute top-14 right-4 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 max-h-[500px] overflow-hidden">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white capitalize">{activeTab}</h3>
            <button
              onClick={() => setActiveTab(null)}
              className="p-1 text-gray-400 hover:text-gray-600 rounded"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="p-4 overflow-y-auto max-h-[400px]">
          {activeTab === 'files' && (
            <div className="space-y-4">
              {/* Files Section */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Files</h4>
                {currentChatProject.files.length > 0 ? (
                  <div className="space-y-1">
                    {currentChatProject.files.map((file) => (
                      <div key={file.id} className="group flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        <span className="text-sm text-gray-700 dark:text-gray-300 truncate flex-1">{file.name}</span>
                        <button
                          onClick={() => {
                            // Remove file from project
                            const updatedFiles = currentChatProject.files.filter(f => f.id !== file.id);
                            updateChatProject(currentChatProject.id, { files: updatedFiles });
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-all"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">No files yet</p>
                )}
                <button
                  onClick={() => {
                    setShowFileUploadModal(true);
                    setActiveTab(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2 mt-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-[#5B50BD] hover:text-[#5B50BD] transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Add files
                </button>
              </div>

              {/* Proposals Section */}
              <div>
                <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Linked Proposals</h4>
                {currentChatProject.proposals.length > 0 ? (
                  <div className="space-y-1">
                    {currentChatProject.proposals.map((proposal) => (
                      <div key={proposal.id} className="group flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <Briefcase className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3] flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{proposal.title}</p>
                          <p className="text-xs text-gray-500 capitalize">{proposal.status}</p>
                        </div>
                        <button
                          onClick={() => {
                            // Remove proposal from project
                            const updatedProposals = currentChatProject.proposals.filter(p => p.id !== proposal.id);
                            updateChatProject(currentChatProject.id, { proposals: updatedProposals });
                          }}
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-all"
                          title="Remove"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">No proposals linked</p>
                )}
                <button
                  onClick={() => {
                    setShowAddProposalModal(true);
                    setActiveTab(null);
                  }}
                  className="w-full flex items-center justify-center gap-2 p-2 mt-2 border border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-500 hover:border-[#5B50BD] hover:text-[#5B50BD] transition-colors"
                >
                  <Briefcase className="w-4 h-4" />
                  Add proposal
                </button>
              </div>
            </div>
          )}
          {activeTab === 'team' && (
            <div className="space-y-3">
              {/* Team Members */}
              <div className="flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-[#5B50BD] text-white flex items-center justify-center text-sm">
                  {currentChatProject.owner.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{currentChatProject.owner.name}</p>
                  <p className="text-xs text-gray-500">Owner</p>
                </div>
              </div>
              {currentChatProject.collaborators.map((collab) => (
                <div key={collab.id} className="group flex items-center gap-3 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-300 flex items-center justify-center text-sm">
                    {collab.user.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{collab.user.name}</p>
                    <p className="text-xs text-gray-500 capitalize">{collab.role}</p>
                  </div>
                  <div className={cn(
                    'w-2 h-2 rounded-full',
                    collab.status === 'online' ? 'bg-green-500' : 'bg-gray-300'
                  )} />
                  <button
                    onClick={() => {
                      if (confirm(`Remove ${collab.user.name} from the project?`)) {
                        removeProjectCollaborator(currentChatProject.id, collab.id);
                        toast.success('Team member removed', `${collab.user.name} has been removed`);
                      }
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-all"
                    title="Remove"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}

              {/* Inline Add Team Member Form */}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs font-medium text-gray-500 mb-2">Add team member</p>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    value={coworkingEmail}
                    onChange={(e) => setCoworkingEmail(e.target.value)}
                    placeholder="Name or email..."
                    className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                  />
                  <select
                    value={coworkingRole}
                    onChange={(e) => setCoworkingRole(e.target.value as 'editor' | 'viewer')}
                    className="px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                  >
                    <option value="editor">Editor</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  <button
                    onClick={() => {
                      if (coworkingEmail.trim() && currentChatProject) {
                        addProjectCollaborator(currentChatProject.id, {
                          user: {
                            id: crypto.randomUUID(),
                            name: coworkingEmail.trim(),
                            email: coworkingEmail.includes('@') ? coworkingEmail.trim() : `${coworkingEmail.trim().toLowerCase().replace(/\s+/g, '.')}@company.com`,
                            role: 'researcher',
                          },
                          role: coworkingRole,
                          status: 'offline',
                        });
                        toast.success('Added', `${coworkingEmail.trim()} added as ${coworkingRole}`);
                        setCoworkingEmail('');
                      }
                    }}
                    disabled={!coworkingEmail.trim()}
                    className={cn(
                      'px-2.5 py-1.5 text-xs font-medium rounded-lg transition-colors',
                      coworkingEmail.trim()
                        ? 'bg-[#5B50BD] text-white hover:bg-[#4A41A0]'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Get sorted conversations (no date grouping)
  const getSortedConversations = (conversations: ProjectConversation[]) => {
    return conversations
      .filter(c => !c.isArchived)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  };

  // Handle starting new conversation
  const handleStartNewConversation = async () => {
    if (!currentChatProject) return;

    const messageText = newConversationInput.trim();
    if (!messageText) {
      // If no text, just create empty conversation
      const newConv = addConversation(currentChatProject.id, 'Yeni sohbet');
      setCurrentConversation(newConv);
      return;
    }

    // Create conversation with first message as title (truncated)
    const title = messageText.slice(0, 50) + (messageText.length > 50 ? '...' : '');
    const newConv = addConversation(currentChatProject.id, title);

    // Add the input as the first message
    const { addProjectMessage, setChatProjectTyping } = useAppStore.getState();
    addProjectMessage(currentChatProject.id, newConv.id, {
      role: 'user',
      content: messageText,
    });

    setCurrentConversation(newConv);
    setNewConversationInput('');

    // Trigger AI response
    setChatProjectTyping(true);

    // Simulate AI thinking delay
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Generate mock AI response
    const aiResponse = generateMockResponse(messageText, currentChatProject.instructions);

    addProjectMessage(currentChatProject.id, newConv.id, {
      role: 'assistant',
      content: aiResponse,
      metadata: {
        model: 'gpt-4',
        tokens: Math.floor(aiResponse.length / 4),
        processingTime: 1500 + Math.random() * 1000,
      },
    });

    setChatProjectTyping(false);
  };

  // Helper function to generate mock AI responses
  function generateMockResponse(userMessage: string, instructions: string): string {
    const lowerMessage = userMessage.toLowerCase();

    if (lowerMessage.includes('sample size') || lowerMessage.includes('respondent')) {
      return `Based on your project requirements, here are my sample size recommendations:

**General Guidelines:**
- For a margin of error of ±3% at 95% confidence: ~1,067 respondents
- For a margin of error of ±4% at 95% confidence: ~600 respondents
- For a margin of error of ±5% at 95% confidence: ~384 respondents

Would you like me to calculate specific numbers for your target markets?`;
    }

    if (lowerMessage.includes('methodology') || lowerMessage.includes('approach')) {
      return `For your research objectives, I recommend the following methodology:

**Recommended Approach:**
1. **Quantitative Survey** - Primary method
2. **Key Modules to Include:**
   - Screening questions
   - Brand awareness/usage
   - Attribute ratings

Would you like me to draft specific questions?`;
    }

    // Default response
    return `Thank you for your message. Based on your project context${instructions ? ' and the instructions provided' : ''}, I understand you're asking about "${userMessage.slice(0, 50)}${userMessage.length > 50 ? '...' : ''}".

To provide the most helpful guidance, could you tell me more about:
1. Your specific research objectives
2. Target audience characteristics
3. Timeline and budget constraints

This will help me tailor my recommendations to your exact needs.`;
  }

  // Handle selecting a conversation
  const handleSelectConversation = (conv: ProjectConversation) => {
    setCurrentConversation(conv);
  };

  // If a conversation is selected, show the chat view
  if (currentChatProject && currentConversation) {
    return (
      <div className="flex h-full relative">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />

        {/* Chat Area */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Chat */}
          <div className="flex-1 min-h-0 relative">
            <ProjectChat
              project={currentChatProject}
              conversationId={currentConversation.id}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              onBack={() => setCurrentConversation(null)}
            />
            {/* Inline Tab Panel */}
            {renderTabPanel()}
          </div>
        </div>

        {/* File Upload Modal - ChatGPT style */}
        {showFileUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFileUploadModal(false)}
            />
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add files to {currentChatProject.name}
                </h2>
                <button
                  onClick={() => setShowFileUploadModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drop Zone */}
              <div className="p-6">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                    dragOver
                      ? 'border-[#5B50BD] bg-[#5B50BD]/5'
                      : 'border-gray-300 dark:border-gray-600 hover:border-[#5B50BD] hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  )}
                >
                  <div className="w-14 h-14 mx-auto rounded-xl bg-[#5B50BD]/10 flex items-center justify-center mb-4">
                    <Upload className="w-7 h-7 text-[#5B50BD]" />
                  </div>
                  <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm text-gray-500">
                    Documents, images and data files are supported
                  </p>
                </div>

                {/* File Types */}
                <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Documents
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Image className="w-4 h-4" />
                    Images
                  </span>
                  <span className="flex items-center gap-1.5">
                    <File className="w-4 h-4" />
                    Data files
                  </span>
                </div>

                {/* Current files count */}
                {currentChatProject.files.length > 0 && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    This project already has {currentChatProject.files.length} files
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Add Proposal Modal */}
        {showAddProposalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowAddProposalModal(false);
                setProposalSearchQuery('');
                setSelectedProposalId(null);
              }}
            />
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add Proposal to {currentChatProject.name}
                </h2>
                <button
                  onClick={() => {
                    setShowAddProposalModal(false);
                    setProposalSearchQuery('');
                    setSelectedProposalId(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Link an existing proposal to this project.
                </p>

                {/* Search Proposals */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={proposalSearchQuery}
                    onChange={(e) => setProposalSearchQuery(e.target.value)}
                    placeholder="Search proposals..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3]"
                  />
                </div>

                {/* Proposal List */}
                <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                  {availableProposals.length > 0 ? (
                    availableProposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        onClick={() => setSelectedProposalId(proposal.id)}
                        className={cn(
                          'p-3 border rounded-lg cursor-pointer transition-colors',
                          selectedProposalId === proposal.id
                            ? 'border-[#5B50BD] bg-[#5B50BD]/5 dark:border-[#918AD3] dark:bg-[#918AD3]/10'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        )}
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {proposal.content.title || 'Untitled Proposal'}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {proposal.status} • {proposal.content.client || 'No client'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      {proposalSearchQuery ? 'No proposals found' : 'No proposals available to link'}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowAddProposalModal(false);
                      setProposalSearchQuery('');
                      setSelectedProposalId(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (selectedProposalId && currentChatProject) {
                        const selectedProposal = proposals.find(p => p.id === selectedProposalId);
                        if (selectedProposal) {
                          const linkedProposal = {
                            id: selectedProposal.id,
                            title: selectedProposal.content.title || 'Untitled Proposal',
                            status: selectedProposal.status,
                            linkedAt: new Date().toISOString(),
                          };
                          updateChatProject(currentChatProject.id, {
                            proposals: [...currentChatProject.proposals, linkedProposal],
                          });
                          toast.success('Proposal linked', `"${linkedProposal.title}" has been linked to this project`);
                        }
                      }
                      setShowAddProposalModal(false);
                      setProposalSearchQuery('');
                      setSelectedProposalId(null);
                    }}
                    disabled={!selectedProposalId}
                    className={cn(
                      'flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-colors',
                      selectedProposalId
                        ? 'bg-[#5B50BD] text-white hover:bg-[#4A41A0]'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    <Briefcase className="w-4 h-4" />
                    Link Proposal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Link Modal */}
        {showAddLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowAddLinkModal(false);
                setLinkUrl('');
                setLinkTitle('');
              }}
            />
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add Link
                </h2>
                <button
                  onClick={() => {
                    setShowAddLinkModal(false);
                    setLinkUrl('');
                    setLinkTitle('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      placeholder="Enter a title for this link"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3]"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowAddLinkModal(false);
                      setLinkUrl('');
                      setLinkTitle('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (linkUrl && currentChatProject) {
                        addProjectFile(currentChatProject.id, {
                          name: linkTitle || linkUrl,
                          type: 'other',
                          size: 0,
                          url: linkUrl,
                          uploadedBy: 'current-user',
                        });
                        toast.success('Link added', 'The link has been added to the project');
                      }
                      setShowAddLinkModal(false);
                      setLinkUrl('');
                      setLinkTitle('');
                    }}
                    disabled={!linkUrl}
                    className={cn(
                      'flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-colors',
                      linkUrl
                        ? 'bg-[#5B50BD] text-white hover:bg-[#4A41A0]'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    )}
                  >
                    <Link2 className="w-4 h-4" />
                    Add Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coworking Modal - Team Management */}
        {showCoworkingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowCoworkingModal(false);
                setCoworkingEmail('');
                setCoworkingRole('editor');
              }}
            />
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Manage Team - {currentChatProject.name}
                </h2>
                <button
                  onClick={() => {
                    setShowCoworkingModal(false);
                    setCoworkingEmail('');
                    setCoworkingRole('editor');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                {/* Add Team Member Section */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Add team member
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coworkingEmail}
                      onChange={(e) => setCoworkingEmail(e.target.value)}
                      placeholder="Enter name or email..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3]"
                    />
                    <select
                      value={coworkingRole}
                      onChange={(e) => setCoworkingRole(e.target.value as 'editor' | 'viewer')}
                      className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3]"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      onClick={() => {
                        if (coworkingEmail.trim() && currentChatProject) {
                          addProjectCollaborator(currentChatProject.id, {
                            user: {
                              id: crypto.randomUUID(),
                              name: coworkingEmail.trim(),
                              email: coworkingEmail.includes('@') ? coworkingEmail.trim() : `${coworkingEmail.trim().toLowerCase().replace(/\s+/g, '.')}@company.com`,
                              role: 'researcher',
                            },
                            role: coworkingRole,
                            status: 'offline',
                          });
                          toast.success('Team member added', `${coworkingEmail.trim()} has been added as ${coworkingRole}`);
                          setCoworkingEmail('');
                        }
                      }}
                      disabled={!coworkingEmail.trim()}
                      className={cn(
                        'px-4 py-2.5 rounded-xl font-medium text-sm transition-colors',
                        coworkingEmail.trim()
                          ? 'bg-[#5B50BD] text-white hover:bg-[#4A41A0]'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Access Section */}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Who has access
                  </p>

                  {/* Access Dropdown */}
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      Only invited members
                    </span>
                  </div>

                  {/* Owner */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-medium">
                        {currentChatProject.owner.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-gray-900 dark:text-white">
                        {currentChatProject.owner.name} <span className="text-gray-500">(you)</span>
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">Owner</span>
                  </div>

                  {/* Collaborators */}
                  {currentChatProject.collaborators.length > 0 ? (
                    currentChatProject.collaborators.map((collab) => (
                      <div key={collab.id} className="group flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                            {collab.user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-gray-900 dark:text-white block">
                              {collab.user.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {collab.user.email}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-sm capitalize">{collab.role}</span>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${collab.user.name} from the project?`)) {
                                removeProjectCollaborator(currentChatProject.id, collab.id);
                                toast.success('Team member removed', `${collab.user.name} has been removed from the project`);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-all"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-sm text-gray-500 text-center">
                      No team members yet. Add someone above!
                    </p>
                  )}
                </div>

                {/* Info Box */}
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        This project may contain sensitive information
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        All project content will be visible to collaborators.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer with Done button */}
                <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowCoworkingModal(false);
                      setCoworkingEmail('');
                      setCoworkingRole('editor');
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // If a project is selected but no conversation, show ChatGPT-style project overview
  if (currentChatProject) {
    const sortedConversations = getSortedConversations(currentChatProject.conversations);

    return (
      <div className="flex flex-col h-full bg-white dark:bg-gray-900">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => handleFileUpload(e.target.files)}
        />

        {/* Breadcrumbs Header Bar with project name, coworking and more options */}
        <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-6 py-3 bg-white dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-900 dark:text-white">
              {currentChatProject.name}
            </span>

            {/* Right: More options */}
            <div className="flex items-center gap-1">
              <div className="relative">
                <button
                  onClick={() => setShowProjectOptionsMenu(!showProjectOptionsMenu)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title="Project options"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>

                {/* Project Options Dropdown */}
                {showProjectOptionsMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowProjectOptionsMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
                      <button
                        onClick={() => {
                          setShowInstructionsModal(true);
                          setShowProjectOptionsMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Settings2 className="w-4 h-4" />
                        Edit instructions
                      </button>
                      <button
                        onClick={() => {
                          setShowCoworkingModal(true);
                          setShowProjectOptionsMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      >
                        <Users className="w-4 h-4" />
                        Manage team
                      </button>
                      <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />
                      <button
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this project?')) {
                            deleteChatProject(currentChatProject.id);
                            setCurrentChatProject(null);
                          }
                          setShowProjectOptionsMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        Delete project
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto flex items-start justify-center pt-[18vh]">
          <div className="max-w-2xl w-full px-4 py-8">
            {/* Project Header with folder icon, name and + Add button */}
            <div className="mb-8">
              <div className="flex items-start justify-between">
                {/* Left: Folder icon and project name */}
                <div className="flex items-center gap-1.5">
                  <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors">
                    <Folder className="w-8 h-8 text-gray-600 dark:text-gray-400" />
                  </button>
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {currentChatProject.name}
                  </h1>
                </div>

                {/* Right: Linked Proposals + Linked Files buttons (single line) */}
                <div className="flex items-center gap-2 flex-nowrap">
                  <button
                    onClick={() => setShowLinkedProposalsModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    <Briefcase className="w-4 h-4 flex-shrink-0" />
                    {currentChatProject.proposals.length} linked proposal{currentChatProject.proposals.length !== 1 ? 's' : ''}
                  </button>
                  <button
                    onClick={() => setShowLinkedFilesModal(true)}
                    className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 transition-colors whitespace-nowrap flex-shrink-0"
                  >
                    <FileText className="w-4 h-4 flex-shrink-0" />
                    {currentChatProject.files.length} linked file{currentChatProject.files.length !== 1 ? 's' : ''}
                  </button>
                </div>
              </div>
            </div>

            {/* New conversation input - ChatGPT style pill shape */}
            <div className="mb-8">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleStartNewConversation();
                }}
                className="relative"
              >
                <div className="flex items-center gap-3 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-full hover:border-gray-400 dark:hover:border-gray-500 transition-colors bg-white dark:bg-gray-800">
                  <div className="relative flex-shrink-0">
                    <button
                      type="button"
                      onClick={() => setShowAddMenu(!showAddMenu)}
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    {/* Add Menu Dropdown */}
                    {showAddMenu && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setShowAddMenu(false)}
                        />
                        <div className="absolute left-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
                          <button
                            type="button"
                            onClick={() => {
                              setShowFileUploadModal(true);
                              setShowAddMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Upload className="w-4 h-4" />
                            Add files
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddProposalModal(true);
                              setShowAddMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Briefcase className="w-4 h-4" />
                            Add proposal
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddLinkModal(true);
                              setShowAddMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Link2 className="w-4 h-4" />
                            Add link
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setShowCoworkingModal(true);
                              setShowAddMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <Users className="w-4 h-4" />
                            Manage team
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                  <input
                    type="text"
                    value={newConversationInput}
                    onChange={(e) => setNewConversationInput(e.target.value)}
                    placeholder={`New chat in ${currentChatProject.name}`}
                    style={{ outline: 'none', boxShadow: 'none' }}
                    className="flex-1 bg-transparent border-none outline-none focus:outline-none focus:ring-0 focus:border-none focus:shadow-none text-base text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                  />
                  <button
                    type="button"
                    className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                  </button>
                  <button
                    type="submit"
                    className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center text-gray-500 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                    </svg>
                  </button>
                </div>
              </form>
            </div>

            {/* Conversations List - ChatGPT style */}
            <div>
              {sortedConversations.length > 0 ? (
                <ol className="divide-y divide-gray-200 dark:divide-gray-700">
                  {sortedConversations.map((conv) => (
                    <li
                      key={conv.id}
                      onClick={() => handleSelectConversation(conv)}
                      className="group/project-item flex items-center gap-4 p-3 min-h-16 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 active:bg-gray-200 dark:active:bg-gray-700 cursor-pointer select-none"
                    >
                      <div className="grow overflow-hidden">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {conv.title}
                        </p>
                        {conv.messages.length > 0 && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate min-h-0">
                            {conv.messages[conv.messages.length - 1]?.content.slice(0, 60)}...
                          </p>
                        )}
                      </div>
                      {/* Date and menu container - they swap on hover */}
                      <div className="relative flex min-h-10 min-w-10 items-center justify-between text-sm text-gray-400 flex-shrink-0">
                        {/* Date - visible by default, hidden on hover */}
                        <span className="whitespace-nowrap opacity-100 group-hover/project-item:opacity-0 transition-opacity">
                          {format(new Date(conv.updatedAt), 'd MMM')}
                        </span>
                        {/* Three dot menu - hidden by default, visible on hover with scale animation */}
                        <div className="absolute inset-0 flex items-center gap-1.5 translate-y-0 scale-95 opacity-0 group-hover/project-item:translate-y-0 group-hover/project-item:scale-100 group-hover/project-item:opacity-100 transition-all">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setConversationMenuOpen(conversationMenuOpen === conv.id ? null : conv.id);
                            }}
                            className="m-0 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                            aria-label="Open conversation options"
                          >
                            <MoreHorizontal className="w-5 h-5" />
                          </button>

                          {/* Conversation Dropdown Menu */}
                          {conversationMenuOpen === conv.id && (
                            <>
                              <div
                                className="fixed inset-0 z-40"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConversationMenuOpen(null);
                                }}
                              />
                              <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowCoworkingModal(true);
                                    setConversationMenuOpen(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <Users className="w-4 h-4" />
                                  Manage team
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowFileUploadModal(true);
                                    setConversationMenuOpen(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <Upload className="w-4 h-4" />
                                  Add files
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setShowAddProposalModal(true);
                                    setConversationMenuOpen(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                >
                                  <Briefcase className="w-4 h-4" />
                                  Add proposal
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (confirm('Are you sure you want to delete this conversation?')) {
                                      deleteConversation(currentChatProject.id, conv.id);
                                    }
                                    setConversationMenuOpen(null);
                                  }}
                                  className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-8 h-8 text-gray-400" />
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No conversations yet
                  </p>
                  <p className="text-gray-400 dark:text-gray-500 text-xs mt-1">
                    Use the input above to start a new conversation
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* File Upload Modal - ChatGPT style */}
        {showFileUploadModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowFileUploadModal(false)}
            />
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Add files to {currentChatProject.name}
                </h2>
                <button
                  onClick={() => setShowFileUploadModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drop Zone */}
              <div className="p-6">
                <div
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                  className={cn(
                    'border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all',
                    dragOver
                      ? 'border-[#5B50BD] bg-[#5B50BD]/5'
                      : 'border-gray-300 dark:border-gray-600 hover:border-[#5B50BD] hover:bg-gray-50 dark:hover:bg-gray-700/50'
                  )}
                >
                  <div className="w-14 h-14 mx-auto rounded-xl bg-[#5B50BD]/10 flex items-center justify-center mb-4">
                    <Upload className="w-7 h-7 text-[#5B50BD]" />
                  </div>
                  <p className="text-base font-medium text-gray-900 dark:text-white mb-1">
                    Drop files here or click to upload
                  </p>
                  <p className="text-sm text-gray-500">
                    Documents, images and data files are supported
                  </p>
                </div>

                {/* File Types */}
                <div className="flex items-center justify-center gap-6 mt-6 text-xs text-gray-400">
                  <span className="flex items-center gap-1.5">
                    <FileText className="w-4 h-4" />
                    Documents
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Image className="w-4 h-4" />
                    Images
                  </span>
                  <span className="flex items-center gap-1.5">
                    <File className="w-4 h-4" />
                    Data files
                  </span>
                </div>

                {/* Current files count */}
                {currentChatProject.files.length > 0 && (
                  <p className="text-center text-sm text-gray-500 mt-4">
                    This project already has {currentChatProject.files.length} files
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions Modal - ChatGPT style */}
        {showInstructionsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowInstructionsModal(false)}
            />
            <div className="relative w-full max-w-xl mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Instructions
                </h2>
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="mb-4">
                  <h3 className="text-base font-medium text-gray-900 dark:text-white mb-1">
                    How can BoltAI best help you in this project?
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    You can ask BoltAI to focus on specific topics or use a particular tone or format for responses.
                  </p>
                </div>

                <textarea
                  value={instructionsInput}
                  onChange={(e) => setInstructionsInput(e.target.value)}
                  placeholder='e.g., "Focus on market research insights. Reference the latest industry data. Keep responses concise and actionable."'
                  className="w-full h-40 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => setShowInstructionsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (currentChatProject) {
                      updateChatProject(currentChatProject.id, {
                        instructions: instructionsInput,
                      });
                    }
                    setShowInstructionsModal(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Coworking Modal - ChatGPT style */}
        {showCoworkingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowCoworkingModal(false);
                setCoworkingEmail('');
                setCoworkingRole('editor');
              }}
            />
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Manage Team - {currentChatProject.name}
                </h2>
                <button
                  onClick={() => {
                    setShowCoworkingModal(false);
                    setCoworkingEmail('');
                    setCoworkingRole('editor');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                {/* Add Team Member Section */}
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Add team member
                  </p>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={coworkingEmail}
                      onChange={(e) => setCoworkingEmail(e.target.value)}
                      placeholder="Enter name or email..."
                      className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3]"
                    />
                    <select
                      value={coworkingRole}
                      onChange={(e) => setCoworkingRole(e.target.value as 'editor' | 'viewer')}
                      className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3]"
                    >
                      <option value="editor">Editor</option>
                      <option value="viewer">Viewer</option>
                    </select>
                    <button
                      onClick={() => {
                        if (coworkingEmail.trim() && currentChatProject) {
                          addProjectCollaborator(currentChatProject.id, {
                            user: {
                              id: crypto.randomUUID(),
                              name: coworkingEmail.trim(),
                              email: coworkingEmail.includes('@') ? coworkingEmail.trim() : `${coworkingEmail.trim().toLowerCase().replace(/\s+/g, '.')}@company.com`,
                              role: 'researcher',
                            },
                            role: coworkingRole,
                            status: 'offline',
                          });
                          toast.success('Team member added', `${coworkingEmail.trim()} has been added as ${coworkingRole}`);
                          setCoworkingEmail('');
                        }
                      }}
                      disabled={!coworkingEmail.trim()}
                      className={cn(
                        'px-4 py-2.5 rounded-xl font-medium text-sm transition-colors',
                        coworkingEmail.trim()
                          ? 'bg-[#5B50BD] text-white hover:bg-[#4A41A0]'
                          : 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                      )}
                    >
                      Add
                    </button>
                  </div>
                </div>

                {/* Access Section */}
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Who has access
                  </p>

                  {/* Access Dropdown */}
                  <div className="flex items-center gap-3 mb-4">
                    <Lock className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-900 dark:text-white font-medium">
                      Only invited members
                    </span>
                  </div>

                  {/* Owner */}
                  <div className="flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-sm font-medium">
                        {currentChatProject.owner.name.slice(0, 2).toUpperCase()}
                      </div>
                      <span className="text-gray-900 dark:text-white">
                        {currentChatProject.owner.name} <span className="text-gray-500">(you)</span>
                      </span>
                    </div>
                    <span className="text-gray-500 text-sm">Owner</span>
                  </div>

                  {/* Collaborators */}
                  {currentChatProject.collaborators.length > 0 ? (
                    currentChatProject.collaborators.map((collab) => (
                      <div key={collab.id} className="group flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-medium">
                            {collab.user.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <span className="text-gray-900 dark:text-white block">
                              {collab.user.name}
                            </span>
                            <span className="text-xs text-gray-500">
                              {collab.user.email}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-500 text-sm capitalize">{collab.role}</span>
                          <button
                            onClick={() => {
                              if (confirm(`Remove ${collab.user.name} from the project?`)) {
                                removeProjectCollaborator(currentChatProject.id, collab.id);
                                toast.success('Team member removed', `${collab.user.name} has been removed from the project`);
                              }
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 rounded transition-all"
                            title="Remove"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="py-4 text-sm text-gray-500 text-center">
                      No team members yet. Add someone above!
                    </p>
                  )}
                </div>

                {/* Info Box */}
                <div className="mt-4 p-4 bg-gray-100 dark:bg-gray-700/50 rounded-xl">
                  <div className="flex gap-3">
                    <Info className="w-5 h-5 text-gray-500 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        This project may contain sensitive information
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        All project content will be visible to collaborators.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer with Done button */}
                <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowCoworkingModal(false);
                      setCoworkingEmail('');
                      setCoworkingRole('editor');
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Proposal Modal */}
        {showAddProposalModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowAddProposalModal(false);
                setProposalSearchQuery('');
                setSelectedProposalId(null);
              }}
            />
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add Proposal to {currentChatProject.name}
                </h2>
                <button
                  onClick={() => {
                    setShowAddProposalModal(false);
                    setProposalSearchQuery('');
                    setSelectedProposalId(null);
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Link an existing proposal to this project.
                </p>

                {/* Search Proposals */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={proposalSearchQuery}
                    onChange={(e) => setProposalSearchQuery(e.target.value)}
                    placeholder="Search proposals..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3]"
                  />
                </div>

                {/* Proposal List */}
                <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                  {availableProposals.length > 0 ? (
                    availableProposals.map((proposal) => (
                      <div
                        key={proposal.id}
                        onClick={() => setSelectedProposalId(proposal.id)}
                        className={cn(
                          'p-3 border rounded-lg cursor-pointer transition-colors',
                          selectedProposalId === proposal.id
                            ? 'border-[#5B50BD] bg-[#5B50BD]/5 dark:border-[#918AD3] dark:bg-[#918AD3]/10'
                            : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                        )}
                      >
                        <p className="font-medium text-gray-900 dark:text-white">
                          {proposal.content.title || 'Untitled Proposal'}
                        </p>
                        <p className="text-sm text-gray-500 capitalize">
                          {proposal.status} • {proposal.content.client || 'No client'}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      {proposalSearchQuery ? 'No proposals found' : 'No proposals available to link'}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowAddProposalModal(false);
                      setProposalSearchQuery('');
                      setSelectedProposalId(null);
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      if (selectedProposalId && currentChatProject) {
                        const selectedProposal = proposals.find(p => p.id === selectedProposalId);
                        if (selectedProposal) {
                          const linkedProposal = {
                            id: selectedProposal.id,
                            title: selectedProposal.content.title || 'Untitled Proposal',
                            status: selectedProposal.status,
                            linkedAt: new Date().toISOString(),
                          };
                          updateChatProject(currentChatProject.id, {
                            proposals: [...currentChatProject.proposals, linkedProposal],
                          });
                          toast.success('Proposal linked', `"${linkedProposal.title}" has been linked to this project`);
                        }
                      }
                      setShowAddProposalModal(false);
                      setProposalSearchQuery('');
                      setSelectedProposalId(null);
                    }}
                    disabled={!selectedProposalId}
                    className={cn(
                      'flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-colors',
                      selectedProposalId
                        ? 'bg-[#5B50BD] text-white hover:bg-[#4A41A0]'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    <Briefcase className="w-4 h-4" />
                    Link Proposal
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add Link Modal */}
        {showAddLinkModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowAddLinkModal(false);
                setLinkUrl('');
                setLinkTitle('');
              }}
            />
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Add Link
                </h2>
                <button
                  onClick={() => {
                    setShowAddLinkModal(false);
                    setLinkUrl('');
                    setLinkTitle('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      URL
                    </label>
                    <input
                      type="url"
                      value={linkUrl}
                      onChange={(e) => setLinkUrl(e.target.value)}
                      placeholder="https://example.com"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Title (optional)
                    </label>
                    <input
                      type="text"
                      value={linkTitle}
                      onChange={(e) => setLinkTitle(e.target.value)}
                      placeholder="Enter a title for this link"
                      className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-gray-500"
                    />
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowAddLinkModal(false);
                      setLinkUrl('');
                      setLinkTitle('');
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      // Handle add link - you can add to project files or a links array
                      if (linkUrl) {
                        addProjectFile(currentChatProject.id, {
                          name: linkTitle || linkUrl,
                          type: 'other',
                          size: 0,
                          url: linkUrl,
                          uploadedBy: 'current-user',
                        });
                      }
                      setShowAddLinkModal(false);
                      setLinkUrl('');
                      setLinkTitle('');
                    }}
                    disabled={!linkUrl}
                    className={cn(
                      'flex items-center gap-2 px-6 py-2.5 rounded-full font-medium text-sm transition-colors',
                      linkUrl
                        ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100'
                        : 'bg-gray-200 dark:bg-gray-600 text-gray-400 dark:text-gray-500 cursor-not-allowed'
                    )}
                  >
                    <Link2 className="w-4 h-4" />
                    Add Link
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Linked Proposals Modal - Manage linked proposals */}
        {showLinkedProposalsModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowLinkedProposalsModal(false);
                setProposalSearchQuery('');
              }}
            />
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Linked Proposals
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentChatProject.proposals.length} of {proposals.length} linked
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowLinkedProposalsModal(false);
                    setProposalSearchQuery('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                {/* Search */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={proposalSearchQuery}
                    onChange={(e) => setProposalSearchQuery(e.target.value)}
                    placeholder="Search proposals..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3]"
                  />
                </div>

                {/* All Proposals List */}
                <div className="max-h-80 overflow-y-auto space-y-2">
                  {allProposalsFiltered.length > 0 ? (
                    allProposalsFiltered.map((proposal) => {
                      const isLinked = currentChatProject.proposals.some(p => p.id === proposal.id);
                      return (
                        <div
                          key={proposal.id}
                          onClick={() => {
                            if (isLinked) {
                              // Unlink
                              const updatedProposals = currentChatProject.proposals.filter(p => p.id !== proposal.id);
                              updateChatProject(currentChatProject.id, { proposals: updatedProposals });
                              toast.success('Proposal unlinked', `"${proposal.content.title}" has been removed`);
                            } else {
                              // Link
                              const linkedProposal = {
                                id: proposal.id,
                                title: proposal.content.title || 'Untitled Proposal',
                                status: proposal.status,
                                linkedAt: new Date().toISOString(),
                              };
                              updateChatProject(currentChatProject.id, {
                                proposals: [...currentChatProject.proposals, linkedProposal],
                              });
                              toast.success('Proposal linked', `"${linkedProposal.title}" has been linked`);
                            }
                          }}
                          className={cn(
                            'flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors',
                            isLinked
                              ? 'bg-[#5B50BD]/10 border border-[#5B50BD] dark:border-[#918AD3]'
                              : 'border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50'
                          )}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Briefcase className={cn(
                              'w-4 h-4 flex-shrink-0',
                              isLinked ? 'text-[#5B50BD] dark:text-[#918AD3]' : 'text-gray-400'
                            )} />
                            <div className="min-w-0">
                              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                {proposal.content.title || 'Untitled Proposal'}
                              </p>
                              <p className="text-xs text-gray-500 capitalize">
                                {proposal.status} • {proposal.content.client || 'No client'}
                              </p>
                            </div>
                          </div>
                          {isLinked ? (
                            <div className="flex items-center gap-1.5 text-[#5B50BD] dark:text-[#918AD3]">
                              <span className="text-xs font-medium">Linked</span>
                              <X className="w-4 h-4" />
                            </div>
                          ) : (
                            <Plus className="w-4 h-4 text-gray-400 flex-shrink-0" />
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8">
                      {proposalSearchQuery ? 'No proposals found' : 'No proposals available'}
                    </p>
                  )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowLinkedProposalsModal(false);
                      setProposalSearchQuery('');
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Linked Files Modal - Manage linked files */}
        {showLinkedFilesModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => {
                setShowLinkedFilesModal(false);
                setFileSearchQuery('');
              }}
            />
            <div className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl">
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-5">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Linked Files
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    {currentChatProject.files.length} file{currentChatProject.files.length !== 1 ? 's' : ''} in this project
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowLinkedFilesModal(false);
                    setFileSearchQuery('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Content */}
              <div className="px-6 pb-6">
                {/* Search */}
                <div className="relative mb-4">
                  <input
                    type="text"
                    value={fileSearchQuery}
                    onChange={(e) => setFileSearchQuery(e.target.value)}
                    placeholder="Search files..."
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3]"
                  />
                </div>

                {/* Files List */}
                <div className="max-h-64 overflow-y-auto space-y-2 mb-4">
                  {filteredFiles.length > 0 ? (
                    filteredFiles.map((file) => (
                      <div
                        key={file.id}
                        className="group flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <FileText className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3] flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-500 capitalize">{file.type}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            const updatedFiles = currentChatProject.files.filter(f => f.id !== file.id);
                            updateChatProject(currentChatProject.id, { files: updatedFiles });
                            toast.success('File removed', `"${file.name}" has been removed from this project`);
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                          title="Remove from project"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500 text-center py-8 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      {fileSearchQuery ? 'No files found' : 'No files added yet'}
                    </p>
                  )}
                </div>

                {/* Add Files Section */}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl cursor-pointer hover:border-[#5B50BD] hover:bg-[#5B50BD]/5 transition-colors"
                  >
                    <Upload className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">Click to add files</span>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <button
                    onClick={() => {
                      setShowLinkedFilesModal(false);
                      setFileSearchQuery('');
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium text-sm hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                  >
                    Done
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // No project selected - return empty (modal is handled globally)
  return null;
}
