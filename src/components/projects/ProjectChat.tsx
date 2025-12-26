'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Paperclip,
  MoreHorizontal,
  Copy,
  Edit2,
  Trash2,
  RefreshCw,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Bot,
  User,
  MessageSquarePlus,
  FileText,
  Link as LinkIcon,
  Plus,
  Users,
  Info,
  FolderOpen,
  Upload,
  Briefcase,
  Check,
  SendHorizontal,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { ProjectMessage, ProjectConversation, ChatProject, Proposal, ProjectFileAttachment } from '@/types';
import { format, isToday, isYesterday, formatDistanceToNow } from 'date-fns';
import { toast } from '@/components/ui/toast';
import { AttachmentPreviewCompact } from '@/components/ui/AttachmentPreview';
import { ChatMessageAttachmentsCompact } from '@/components/ui/ChatMessageAttachments';
import type { ChatAttachment } from '@/components/ui/ChatMessageAttachments';
import { ShareSessionModal, CollaboratorCursors, CollaboratorAvatar } from '@/components/coworking';
import { useProposalSession } from '@/components/proposal/hooks/useProposalSession';

type HeaderTab = 'details' | 'files' | 'team' | 'proposals' | null;
type AttachmentMode = 'menu' | 'files' | 'link' | 'proposal' | null;

interface ProjectChatProps {
  project: ChatProject;
  conversationId?: string;
  activeTab?: HeaderTab;
  onTabChange?: (tab: HeaderTab) => void;
  onBack?: () => void;
}

export function ProjectChat({ project, conversationId, activeTab, onTabChange, onBack }: ProjectChatProps) {
  const {
    addProjectMessage,
    updateProjectMessage,
    deleteProjectMessage,
    addConversation,
    updateConversation,
    setCurrentConversation,
    setChatProjectTyping,
    isChatProjectTyping,
    currentConversation,
    proposals,
    addProjectFile,
    updateChatProject,
    currentUser,
  } = useAppStore();

  // Coworking session hook
  const {
    session,
    isSessionActive,
    startSession,
    inviteUser,
    removeUser,
    generateShareLink,
    updateAccessLevel,
    showShareModal,
    setShowShareModal,
  } = useProposalSession({ proposalId: project.id });

  const [message, setMessage] = useState('');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [showConversationList, setShowConversationList] = useState(false);
  const [attachmentMode, setAttachmentMode] = useState<AttachmentMode>(null);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [displayedText, setDisplayedText] = useState<Record<string, string>>({});
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);

  // Inline attachment states
  const [linkUrl, setLinkUrl] = useState('');
  const [linkTitle, setLinkTitle] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<File[]>([]);
  // Link and proposal attachments for messages (ChatGPT style)
  const [linkAttachments, setLinkAttachments] = useState<ChatAttachment[]>([]);
  const [proposalAttachments, setProposalAttachments] = useState<ChatAttachment[]>([]);

  // Send to proposal states
  const [showProposalSelector, setShowProposalSelector] = useState<string | null>(null); // message id
  const [contentToSend, setContentToSend] = useState('');
  const [proposalSearchQuery, setProposalSearchQuery] = useState('');
  const [attachmentProposalSearch, setAttachmentProposalSearch] = useState('');

  const animatedMessagesRef = useRef<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Find current conversation
  const conversation = useMemo(() => {
    if (conversationId) {
      return project.conversations.find((c) => c.id === conversationId) || null;
    }
    return project.conversations[project.conversations.length - 1] || null;
  }, [project.conversations, conversationId]);

  // Set current conversation when it changes
  useEffect(() => {
    if (conversation) {
      setCurrentConversation(conversation);
    }
  }, [conversation, setCurrentConversation]);

  // Typing animation effect for AI messages
  useEffect(() => {
    if (!conversation?.messages) return;

    const lastMessage = conversation.messages[conversation.messages.length - 1];
    if (lastMessage && lastMessage.role === 'assistant' && !animatedMessagesRef.current.has(lastMessage.id)) {
      animatedMessagesRef.current.add(lastMessage.id);
      setTypingMessageId(lastMessage.id);
      let currentIndex = 0;
      const fullText = lastMessage.content;

      const typeInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          currentIndex++;
          setDisplayedText(prev => ({
            ...prev,
            [lastMessage.id]: fullText.slice(0, currentIndex)
          }));
        } else {
          // Typing complete - clear interval and hide cursor
          clearInterval(typeInterval);
          setTypingMessageId(null);
          // Ensure full text is displayed
          setDisplayedText(prev => ({
            ...prev,
            [lastMessage.id]: fullText
          }));
        }
      }, 10); // Speed of typing

      return () => {
        clearInterval(typeInterval);
        // If component unmounts during typing, ensure cursor is hidden
        setTypingMessageId(null);
      };
    }
  }, [conversation?.messages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation?.messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, [conversation?.id]);

  // Close attachment menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setAttachmentMode(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // File upload handlers - add to pending attachments for ChatGPT-style preview
  const handleFileUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setPendingAttachments(prev => [...prev, ...Array.from(files)]);
    setAttachmentMode(null);
  };

  // Add files directly to project (bypassing pending attachments)
  const handleAddFilesToProject = (files: FileList | null) => {
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const fileType = file.type.startsWith('image/')
        ? 'image'
        : file.type.includes('document') || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx')
        ? 'document'
        : file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')
        ? 'data'
        : 'other';

      addProjectFile(project.id, {
        name: file.name,
        type: fileType,
        size: file.size,
        url: URL.createObjectURL(file),
        uploadedBy: 'current-user',
      });
    });

    toast.success('Files uploaded', `${files.length} file(s) added to project`);
    setAttachmentMode(null);
  };

  // Remove pending attachment
  const removePendingAttachment = (index: number) => {
    setPendingAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;

    addProjectFile(project.id, {
      name: linkTitle.trim() || linkUrl.trim(),
      type: 'other',
      size: 0,
      url: linkUrl.trim(),
      uploadedBy: 'current-user',
    });

    toast.success('Link added', 'The link has been added to the project');
    setLinkUrl('');
    setLinkTitle('');
    setAttachmentMode(null);
  };

  const handleLinkProposal = (proposalId: string) => {
    const selectedProposal = proposals.find((p) => p.id === proposalId);
    if (!selectedProposal) return;

    const linkedProposal = {
      id: selectedProposal.id,
      title: selectedProposal.content.title || 'Untitled Proposal',
      status: selectedProposal.status,
      linkedAt: new Date().toISOString(),
    };

    updateChatProject(project.id, {
      proposals: [...project.proposals, linkedProposal],
    });

    toast.success('Proposal linked', `"${linkedProposal.title}" has been linked to this project`);
    setAttachmentMode(null);
  };

  // Send message to proposal
  const handleSendToProposalClick = (msgId: string, content: string) => {
    setShowProposalSelector(msgId);
    setContentToSend(content);
    setProposalSearchQuery('');
  };

  // Filtered proposals for send to proposal dropdown
  const filteredProposals = useMemo(() => {
    if (!proposalSearchQuery.trim()) return proposals;
    const query = proposalSearchQuery.toLowerCase();
    return proposals.filter(
      (p) =>
        (p.content.title || '').toLowerCase().includes(query) ||
        (p.content.client || '').toLowerCase().includes(query) ||
        p.status.toLowerCase().includes(query)
    );
  }, [proposals, proposalSearchQuery]);

  const handleConfirmSendToProposal = (proposalId: string) => {
    const selectedProposal = proposals.find((p) => p.id === proposalId);
    if (!selectedProposal) return;

    // Copy content to clipboard and show success
    navigator.clipboard.writeText(contentToSend);
    toast.success(
      'Sent to proposal',
      `Content copied! Navigate to "${selectedProposal.content.title || 'Untitled'}" to paste.`
    );
    setShowProposalSelector(null);
    setContentToSend('');
  };

  // Get available proposals (not already linked)
  const availableProposals = useMemo(() => {
    const linkedIds = project.proposals.map((p) => p.id);
    return proposals.filter((p) => !linkedIds.includes(p.id));
  }, [proposals, project.proposals]);

  // Filtered available proposals for attachment panel search (all proposals for message attachments)
  const filteredAttachmentProposals = useMemo(() => {
    if (!attachmentProposalSearch.trim()) return proposals;
    const query = attachmentProposalSearch.toLowerCase();
    return proposals.filter(
      (p) =>
        (p.content.title || '').toLowerCase().includes(query) ||
        (p.content.client || '').toLowerCase().includes(query) ||
        p.status.toLowerCase().includes(query)
    );
  }, [proposals, attachmentProposalSearch]);

  // All pending attachments combined for preview
  const allPendingAttachments = useMemo(() => {
    const fileAtts = pendingAttachments.map(f => ({ name: f.name, type: f.type, size: f.size }));
    return [...fileAtts, ...linkAttachments, ...proposalAttachments];
  }, [pendingAttachments, linkAttachments, proposalAttachments]);

  // Add link as message attachment
  const handleAddLinkAttachment = () => {
    if (!linkUrl.trim()) return;
    setLinkAttachments(prev => [...prev, { name: linkUrl.trim(), type: 'link', url: linkUrl.trim() }]);
    setLinkUrl('');
    setAttachmentMode(null);
  };

  // Add proposal as message attachment
  const handleAddProposalAttachment = (proposalId: string) => {
    const selectedProposal = proposals.find((p) => p.id === proposalId);
    if (!selectedProposal) return;
    setProposalAttachments(prev => [...prev, {
      name: selectedProposal.content.title || 'Untitled Proposal',
      type: 'proposal',
      proposalId: selectedProposal.id,
      proposalStatus: selectedProposal.status,
    }]);
    setAttachmentMode(null);
  };

  // Remove any type of attachment
  const removeAttachment = (index: number) => {
    const fileCount = pendingAttachments.length;
    const linkCount = linkAttachments.length;
    if (index < fileCount) {
      setPendingAttachments(prev => prev.filter((_, i) => i !== index));
    } else if (index < fileCount + linkCount) {
      setLinkAttachments(prev => prev.filter((_, i) => i !== index - fileCount));
    } else {
      setProposalAttachments(prev => prev.filter((_, i) => i !== index - fileCount - linkCount));
    }
  };

  const handleSend = async () => {
    const hasContent = message.trim();
    const hasAttachments = pendingAttachments.length > 0 || linkAttachments.length > 0 || proposalAttachments.length > 0;
    if ((!hasContent && !hasAttachments) || !conversation) return;

    // Create message attachments in ProjectFileAttachment format
    const messageAttachments: ProjectFileAttachment[] = [];

    // Add file attachments
    pendingAttachments.forEach((file) => {
      const fileType = file.type.startsWith('image/')
        ? 'image'
        : file.type.includes('document') || file.name.endsWith('.pdf') || file.name.endsWith('.doc') || file.name.endsWith('.docx')
        ? 'document'
        : file.type.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.csv')
        ? 'data'
        : 'other';

      messageAttachments.push({
        id: crypto.randomUUID(),
        name: file.name,
        type: fileType,
        size: file.size,
        url: URL.createObjectURL(file),
      });

      // Also add to project files
      addProjectFile(project.id, {
        name: file.name,
        type: fileType,
        size: file.size,
        url: URL.createObjectURL(file),
        uploadedBy: 'current-user',
      });
    });

    // Add link attachments
    linkAttachments.forEach((link) => {
      messageAttachments.push({
        id: crypto.randomUUID(),
        name: link.name,
        type: 'link',
        linkUrl: link.url,
      });
    });

    // Add proposal attachments
    proposalAttachments.forEach((proposal) => {
      messageAttachments.push({
        id: crypto.randomUUID(),
        name: proposal.name,
        type: 'proposal',
        proposalId: proposal.proposalId,
        proposalStatus: proposal.proposalStatus,
      });
    });

    // Add user message with attachments
    addProjectMessage(project.id, conversation.id, {
      role: 'user',
      content: message.trim(),
      attachments: messageAttachments.length > 0 ? messageAttachments : undefined,
    });

    const userMessage = message.trim();
    setMessage('');
    setPendingAttachments([]);
    setLinkAttachments([]);
    setProposalAttachments([]);

    // Simulate AI response
    setChatProjectTyping(true);

    // Update conversation title if it's the first message
    if (conversation.messages.length === 0 && conversation.title === 'New conversation') {
      const newTitle = userMessage.slice(0, 50) + (userMessage.length > 50 ? '...' : '');
      updateConversation(project.id, conversation.id, { title: newTitle });
    }

    // Simulate AI thinking delay
    await new Promise((resolve) => setTimeout(resolve, 1500 + Math.random() * 1000));

    // Generate mock AI response based on project instructions
    const aiResponse = generateMockResponse(userMessage, project.instructions);

    addProjectMessage(project.id, conversation.id, {
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

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleNewConversation = () => {
    const newConv = addConversation(project.id, 'New conversation');
    setCurrentConversation(newConv);
    setShowConversationList(false);
  };

  const handleSelectConversation = (conv: ProjectConversation) => {
    setCurrentConversation(conv);
    setShowConversationList(false);
  };

  const handleEditMessage = (messageId: string, content: string) => {
    setEditingMessageId(messageId);
    setEditContent(content);
  };

  const handleSaveEdit = () => {
    if (!editingMessageId || !conversation) return;
    updateProjectMessage(project.id, conversation.id, editingMessageId, editContent);
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleDeleteMessage = (messageId: string) => {
    if (!conversation) return;
    deleteProjectMessage(project.id, conversation.id, messageId);
  };

  const handleCopyMessage = (messageId: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedMessageId(messageId);
    setTimeout(() => setCopiedMessageId(null), 2000);
  };


  const formatMessageTime = (timestamp: string) => {
    const date = new Date(timestamp);
    if (isToday(date)) {
      return format(date, 'h:mm a');
    } else if (isYesterday(date)) {
      return `Yesterday ${format(date, 'h:mm a')}`;
    }
    return format(date, 'MMM d, h:mm a');
  };

  const renderMessage = (msg: ProjectMessage, index: number) => {
    const isUser = msg.role === 'user';
    const isEditing = editingMessageId === msg.id;
    const isTyping = typingMessageId === msg.id;
    const messageContent = isUser ? msg.content : (displayedText[msg.id] ?? msg.content);

    return (
      <div
        key={msg.id}
        className={cn(
          'group flex py-3 px-4',
          isUser ? 'justify-end' : 'justify-start'
        )}
      >
        <div className={cn(
          'flex gap-2 max-w-[80%]',
          isUser ? 'flex-row-reverse' : 'flex-row'
        )}>
          {/* Avatar */}
          <div
            className={cn(
              'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
              isUser
                ? 'bg-[#5B50BD] text-white'
                : 'bg-gradient-to-br from-[#1ED6BB] to-[#5B50BD] text-white'
            )}
          >
            {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
          </div>

          {/* Message Content */}
          <div className={cn(
            'flex flex-col',
            isUser ? 'items-end' : 'items-start'
          )}>
            {isEditing ? (
              <div className="space-y-2">
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none focus:outline-none focus:ring-2 focus:ring-[#5B50BD]/50"
                  rows={3}
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveEdit}
                    className="px-3 py-1.5 bg-[#5B50BD] text-white text-sm rounded-lg hover:bg-[#4A41A0] transition-colors"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => setEditingMessageId(null)}
                    className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {/* Attachments - ChatGPT Style (outside message content) */}
                {msg.attachments && msg.attachments.length > 0 && (
                  <ChatMessageAttachmentsCompact
                    attachments={msg.attachments.map(att => ({
                      name: att.name,
                      type: att.type,
                      size: att.size,
                      url: att.url || att.linkUrl,
                      proposalId: att.proposalId,
                      proposalStatus: att.proposalStatus,
                    }))}
                    align={isUser ? 'end' : 'start'}
                  />
                )}
                {/* Message text - only show if there's content */}
                {messageContent && (
                  <p className={cn(
                    'text-sm whitespace-pre-wrap',
                    isUser ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'
                  )}>
                    {messageContent}
                    {isTyping && <span className="inline-block w-0.5 h-4 bg-gray-500 ml-0.5 animate-pulse" />}
                  </p>
                )}
              </div>
            )}

            {/* Timestamp */}
            <span className={cn(
              'text-[10px] text-gray-400 mt-1',
              isUser ? 'text-right' : 'text-left'
            )}>
              {formatMessageTime(msg.timestamp)}
              {msg.isEdited && ' (edited)'}
            </span>

            {/* Action Buttons on hover */}
            {!isEditing && (
              <div className={cn(
                'flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100',
                isUser ? 'flex-row-reverse' : 'flex-row'
              )}>
                <button
                  onClick={() => handleCopyMessage(msg.id, msg.content)}
                  className={cn(
                    'p-1 rounded',
                    copiedMessageId === msg.id
                      ? 'text-green-500'
                      : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
                  )}
                  title={copiedMessageId === msg.id ? 'Copied!' : 'Copy'}
                >
                  {copiedMessageId === msg.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                </button>
                <div className="relative">
                  <button
                    onClick={() => handleSendToProposalClick(msg.id, msg.content)}
                    className="p-1 text-gray-400 hover:text-[#5B50BD] hover:bg-[#5B50BD]/10 rounded"
                    title="Send to proposal"
                  >
                    <SendHorizontal className="w-3 h-3" />
                  </button>
                  {/* Proposal Selection Dropdown */}
                  {showProposalSelector === msg.id && (
                    <div className="absolute bottom-full left-0 mb-2 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                      <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 px-2 mb-2">Send to proposal</p>
                        <input
                          type="text"
                          value={proposalSearchQuery}
                          onChange={(e) => setProposalSearchQuery(e.target.value)}
                          placeholder="Search proposals..."
                          className="w-full px-3 py-1.5 text-sm border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto p-2">
                        {filteredProposals.length > 0 ? (
                          filteredProposals.map((proposal) => (
                            <button
                              key={proposal.id}
                              onClick={() => handleConfirmSendToProposal(proposal.id)}
                              className="w-full flex items-center gap-2 px-3 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <Briefcase className="w-4 h-4 text-[#5B50BD] flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="truncate font-medium">{proposal.content.title || 'Untitled Proposal'}</p>
                                <p className="text-xs text-gray-500 capitalize">{proposal.status}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <p className="px-3 py-4 text-sm text-gray-500 text-center">
                            {proposalSearchQuery ? 'No proposals found' : 'No proposals available'}
                          </p>
                        )}
                      </div>
                      <div className="p-2 border-t border-gray-200 dark:border-gray-700">
                        <button
                          onClick={() => setShowProposalSelector(null)}
                          className="w-full px-3 py-1.5 text-xs text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {isUser && (
                  <button
                    onClick={() => handleEditMessage(msg.id, msg.content)}
                    className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                    title="Edit"
                  >
                    <Edit2 className="w-3 h-3" />
                  </button>
                )}
                <button
                  onClick={() => handleDeleteMessage(msg.id)}
                  className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Breadcrumbs Header Bar */}
      <div className="flex-shrink-0 border-b border-gray-200 dark:border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Left: Breadcrumbs */}
          <div className="flex items-center gap-2">
            {/* Breadcrumbs: Project Name > Conversation Title */}
            <div className="flex items-center gap-1.5 text-sm">
              <button
                onClick={onBack}
                className="text-gray-500 dark:text-gray-400 hover:text-[#5B50BD] dark:hover:text-[#918AD3] transition-colors"
                title={`Go to ${project.name}`}
              >
                {project.name}
              </button>
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />

              {/* Conversation Selector */}
              <div className="relative">
                <button
                  onClick={() => setShowConversationList(!showConversationList)}
                  className="flex items-center gap-1 px-2 py-1 text-gray-900 dark:text-white font-medium hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  title={`Project: ${project.name}`}
                >
                  <span className="max-w-[200px] truncate">
                    {conversation?.title || 'New conversation'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                </button>

                {/* Conversation Dropdown */}
                {showConversationList && (
                  <div className="absolute top-full left-0 mt-1 w-72 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                    <div className="p-2 border-b border-gray-200 dark:border-gray-700">
                      <button
                        onClick={handleNewConversation}
                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5B50BD] hover:bg-[#5B50BD]/10 rounded-lg transition-colors"
                      >
                        <MessageSquarePlus className="w-4 h-4" />
                        New conversation
                      </button>
                    </div>
                    <div className="max-h-64 overflow-y-auto p-2">
                      {project.conversations.filter(c => !c.isArchived).map((conv) => (
                        <button
                          key={conv.id}
                          onClick={() => handleSelectConversation(conv)}
                          className={cn(
                            'w-full flex items-center gap-3 px-3 py-2 text-left rounded-lg transition-colors',
                            conv.id === conversation?.id
                              ? 'bg-[#5B50BD]/10 text-[#5B50BD]'
                              : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'
                          )}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{conv.title}</p>
                            <p className="text-xs text-gray-500 truncate">
                              {conv.messages.length} messages • {formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}
                            </p>
                          </div>
                        </button>
                      ))}
                      {project.conversations.filter(c => !c.isArchived).length === 0 && (
                        <p className="px-3 py-4 text-sm text-gray-500 text-center">
                          No conversations yet
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right: Collaborator Avatars + Coworking Button */}
          <div className="flex items-center gap-2">
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

            {/* Coworking Button */}
            <button
              onClick={() => {
                if (!isSessionActive) {
                  startSession(project.id, `${project.name} Session`);
                }
                setShowShareModal(true);
              }}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1.5 text-sm font-medium rounded-lg transition-colors',
                isSessionActive
                  ? 'text-[#5B50BD] bg-[#5B50BD]/10'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800'
              )}
              title={isSessionActive ? 'Coworking session active' : 'Start coworking session'}
            >
              <Users className="w-4 h-4" />
              {isSessionActive ? 'Coworking' : 'Start Coworking'}
            </button>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto">
        {conversation && conversation.messages.length > 0 ? (
          <div className="py-4">
            {conversation.messages.map((msg, index) => renderMessage(msg, index))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full px-6 py-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {project.name}
            </h3>
            <p className="text-sm text-gray-500 max-w-md mb-6">
              {project.description || 'Start a conversation with your AI assistant. It has access to your project context and files.'}
            </p>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 justify-center">
              {project.files.length > 0 && (
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <FileText className="w-4 h-4" />
                  {project.files.length} files available
                </button>
              )}
              {project.proposals.length > 0 && (
                <button className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                  <LinkIcon className="w-4 h-4" />
                  {project.proposals.length} linked proposals
                </button>
              )}
            </div>
          </div>
        )}

        {/* Typing Indicator */}
        {isChatProjectTyping && (
          <div className="flex gap-3 py-4 px-4 bg-gray-50 dark:bg-gray-800/50">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1ED6BB] to-[#5B50BD] flex items-center justify-center text-white">
              <Bot className="w-4 h-4" />
            </div>
            <div className="flex items-center gap-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              <span className="text-sm text-gray-500">BoltAI is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="flex-shrink-0 p-4">
        {/* ChatGPT-style Attachment Preview - Above input */}
        {allPendingAttachments.length > 0 && (
          <div className="mb-3">
            <AttachmentPreviewCompact
              attachments={allPendingAttachments}
              onRemove={removeAttachment}
            />
          </div>
        )}

        <div className="flex items-center gap-2">
          {/* Attachment Menu Button */}
          <div className="relative flex-shrink-0" ref={attachmentMenuRef}>
              <button
                onClick={() => setAttachmentMode(attachmentMode ? null : 'menu')}
                className={cn(
                  'p-1.5 rounded-lg transition-colors flex-shrink-0',
                  attachmentMode
                    ? 'text-[#5B50BD] bg-[#5B50BD]/10'
                    : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
                title="Add files, link or proposal"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              {/* Hidden file input */}
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileUpload(e.target.files)}
                accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xlsx,.csv"
              />

              {/* Inline Attachment Panel - All options visible */}
              {attachmentMode && (
                <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                  {/* File Upload Section */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-500">Files</span>
                    </div>
                    <div
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        'border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all',
                        dragOver
                          ? 'border-[#5B50BD] bg-[#5B50BD]/5'
                          : 'border-gray-300 dark:border-gray-600 hover:border-[#5B50BD]'
                      )}
                    >
                      <p className="text-xs text-gray-500">Drop files or click to upload</p>
                    </div>
                    {project.files.length > 0 && (
                      <p className="text-xs text-gray-400 text-center mt-1">
                        {project.files.length} files in project
                      </p>
                    )}
                  </div>

                  {/* Link Input Section */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <LinkIcon className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-500">Add Link</span>
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="url"
                        value={linkUrl}
                        onChange={(e) => setLinkUrl(e.target.value)}
                        placeholder="https://example.com"
                        className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLinkAttachment(); } }}
                      />
                      <button
                        onClick={handleAddLinkAttachment}
                        disabled={!linkUrl.trim()}
                        className={cn(
                          'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                          linkUrl.trim()
                            ? 'bg-[#5B50BD] text-white hover:bg-[#4A41A0]'
                            : 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                        )}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Proposal Selection Section */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-500">Link Proposal</span>
                    </div>
                    {/* Search input for proposals */}
                    <input
                      type="text"
                      value={attachmentProposalSearch}
                      onChange={(e) => setAttachmentProposalSearch(e.target.value)}
                      placeholder="Search proposals..."
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5B50BD] mb-2"
                    />
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {filteredAttachmentProposals.length > 0 ? (
                        filteredAttachmentProposals.map((proposal) => (
                          <button
                            key={proposal.id}
                            onClick={() => handleAddProposalAttachment(proposal.id)}
                            className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          >
                            <Briefcase className="w-3 h-3 text-[#5B50BD] flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="truncate font-medium">{proposal.content.title || 'Untitled'}</p>
                              <p className="text-[10px] text-gray-500 capitalize">{proposal.status}</p>
                            </div>
                          </button>
                        ))
                      ) : (
                        <p className="py-2 text-xs text-gray-500 text-center">
                          {attachmentProposalSearch ? 'No proposals found' : 'No proposals available'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Text Input */}
          <div
            className={cn(
              'flex-1 rounded-xl',
              'border border-gray-200 dark:border-gray-700',
              'transition-all'
            )}
          >
            <textarea
              ref={inputRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={conversation ? 'Type a message...' : 'Start a new conversation...'}
              className="no-focus-outline w-full px-3 py-2 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 resize-none focus:outline-none focus:ring-0 min-h-[40px] max-h-[120px]"
              rows={1}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleSend}
            disabled={(!message.trim() && allPendingAttachments.length === 0) || isChatProjectTyping}
            className={cn(
              'h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200',
              (message.trim() || allPendingAttachments.length > 0) && !isChatProjectTyping
                ? 'bg-[#5B50BD] text-white hover:bg-[#4A41A0] hover:scale-105 shadow-sm'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
            )}
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400 text-center">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>

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

      {/* Collaborator Cursors */}
      {isSessionActive && session && (
        <CollaboratorCursors
          collaborators={session.collaborators}
          currentUserId={currentUser.id}
          containerRef={messagesEndRef}
        />
      )}
    </div>
  );
}

// Helper function to generate mock AI responses
function generateMockResponse(userMessage: string, instructions: string): string {
  const lowerMessage = userMessage.toLowerCase();

  if (lowerMessage.includes('sample size') || lowerMessage.includes('respondent')) {
    return `Based on your project requirements, here are my sample size recommendations:

**General Guidelines:**
- For a margin of error of ±3% at 95% confidence: ~1,067 respondents
- For a margin of error of ±4% at 95% confidence: ~600 respondents
- For a margin of error of ±5% at 95% confidence: ~384 respondents

**Multi-Market Studies:**
When running across multiple markets, I recommend:
- Minimum 300-400 per market for basic comparisons
- 500+ per market for subgroup analysis
- 1,000+ per market for detailed segmentation

Would you like me to calculate specific numbers for your target markets?`;
  }

  if (lowerMessage.includes('methodology') || lowerMessage.includes('approach')) {
    return `For your research objectives, I recommend the following methodology:

**Recommended Approach:**
1. **Quantitative Survey** - Primary method
   - Online panel recruitment
   - 15-20 minute survey length
   - Mobile-optimized design

2. **Key Modules to Include:**
   - Screening questions
   - Brand awareness/usage
   - Attribute ratings (MaxDiff or rating scale)
   - Purchase intent
   - Demographics

3. **Analysis Plan:**
   - Descriptive statistics
   - Cross-tabulations by key segments
   - Statistical significance testing (95% CI)

Would you like me to draft specific questions for any of these modules?`;
  }

  if (lowerMessage.includes('help') || lowerMessage.includes('what can you')) {
    return `I'm your AI research assistant for this project! Here's how I can help:

**Research Design:**
- Sample size calculations and recommendations
- Methodology selection guidance
- Questionnaire design tips
- Quota recommendations

**Analysis Support:**
- Statistical methodology guidance
- Data interpretation suggestions
- Report structure recommendations

**Project Management:**
- Timeline planning
- Budget considerations
- Stakeholder communication tips

Just ask me any research-related question, and I'll provide recommendations based on best practices and your project context.`;
  }

  // Default response
  return `Thank you for your message. Based on your project context${instructions ? ' and the instructions provided' : ''}, here are my thoughts:

I understand you're asking about "${userMessage.slice(0, 50)}${userMessage.length > 50 ? '...' : ''}".

To provide the most helpful guidance, could you tell me more about:
1. Your specific research objectives
2. Target audience characteristics
3. Timeline and budget constraints

This will help me tailor my recommendations to your exact needs.`;
}
