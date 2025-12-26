'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { Send, Loader2, Brain, TrendingUp, Users, Target, FileText, Paperclip, Upload, Link as LinkIcon, Briefcase } from 'lucide-react';
import { Button, AttachmentPreviewCompact } from '@/components/ui';
import { useAppStore } from '@/lib/store';
import { AIMessage } from './AIMessage';
import { UserMessage } from './UserMessage';
import { StreamingIndicator } from './StreamingIndicator';
import { FilterChips } from './FilterChips';
import { TypingIndicator } from '@/components/coworking';
import type { ChatContainerProps, MessageAttachment } from './types';

type AttachmentMode = 'menu' | null;

// Welcome screen quick actions
const WELCOME_QUICK_ACTIONS = [
  { id: 'approval', label: 'Approval rates', icon: TrendingUp, query: 'Which proposals have the highest approval rate?' },
  { id: 'patterns', label: 'Common patterns', icon: Brain, query: 'What are the common patterns in rejected proposals?' },
  { id: 'clients', label: 'Active clients', icon: Users, query: 'Who are our most active clients?' },
  { id: 'methodology', label: 'By methodology', icon: Target, query: 'How do success rates vary by methodology?' },
  { id: 'recent', label: 'Recent insights', icon: FileText, query: 'What are the key insights from recent proposals?' },
];

// Welcome screen component (ChatGPT style)
function WelcomeScreen({
  onSendMessage,
  isStreaming,
}: {
  onSendMessage: (message: string, attachments?: MessageAttachment[]) => void;
  isStreaming: boolean;
}) {
  const { proposals } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [linkAttachments, setLinkAttachments] = useState<MessageAttachment[]>([]);
  const [proposalAttachments, setProposalAttachments] = useState<MessageAttachment[]>([]);
  const [attachmentMode, setAttachmentMode] = useState<AttachmentMode>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [proposalSearchQuery, setProposalSearchQuery] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputValue]);

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

  // Filtered proposals for search
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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachments(prev => [...prev, ...Array.from(files)]);
    }
    e.target.value = '';
    setAttachmentMode(null);
  };

  // All pending attachments combined
  const allPendingAttachments = useMemo(() => {
    const fileAtts = attachments.map(f => ({ name: f.name, type: f.type, size: f.size }));
    return [...fileAtts, ...linkAttachments, ...proposalAttachments];
  }, [attachments, linkAttachments, proposalAttachments]);

  const removeAttachment = (index: number) => {
    const fileCount = attachments.length;
    const linkCount = linkAttachments.length;
    if (index < fileCount) {
      setAttachments(prev => prev.filter((_, i) => i !== index));
    } else if (index < fileCount + linkCount) {
      setLinkAttachments(prev => prev.filter((_, i) => i !== index - fileCount));
    } else {
      setProposalAttachments(prev => prev.filter((_, i) => i !== index - fileCount - linkCount));
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files) setAttachments(prev => [...prev, ...Array.from(files)]);
    setAttachmentMode(null);
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    setLinkAttachments(prev => [...prev, { name: linkUrl.trim(), type: 'link', url: linkUrl.trim() }]);
    setLinkUrl('');
    setAttachmentMode(null);
  };

  const handleAddProposal = (proposalId: string) => {
    const selectedProposal = proposals.find((p) => p.id === proposalId);
    if (!selectedProposal) return;
    setProposalAttachments(prev => [...prev, {
      name: selectedProposal.content.title || 'Untitled Proposal',
      type: 'proposal',
    }]);
    setAttachmentMode(null);
  };

  const handleSend = () => {
    const hasContent = inputValue.trim();
    const hasAttachments = attachments.length > 0 || linkAttachments.length > 0 || proposalAttachments.length > 0;
    if ((!hasContent && !hasAttachments) || isStreaming) return;

    const fileAtts: MessageAttachment[] = attachments.map(f => ({
      name: f.name, type: f.type, size: f.size, url: URL.createObjectURL(f),
    }));
    const messageAttachments = [...fileAtts, ...linkAttachments, ...proposalAttachments];

    onSendMessage(inputValue.trim(), messageAttachments.length > 0 ? messageAttachments : undefined);
    setInputValue('');
    setAttachments([]);
    setLinkAttachments([]);
    setProposalAttachments([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileSelect}
        accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xlsx,.csv"
      />

      {/* Center content area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        {/* Headline */}
        <div className="text-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-2">
            What insights are you looking for?
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Analyze proposal patterns, client trends, and success factors
          </p>
        </div>

        {/* Quick action buttons */}
        <div className="flex flex-wrap justify-center gap-2 max-w-xl mb-8">
          {WELCOME_QUICK_ACTIONS.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.id}
                onClick={() => onSendMessage(action.query)}
                className={cn(
                  'inline-flex items-center gap-2 px-4 py-2.5 rounded-xl',
                  'text-sm font-medium',
                  'bg-white dark:bg-gray-800',
                  'text-gray-700 dark:text-gray-300',
                  'border border-gray-200 dark:border-gray-700',
                  'hover:border-[#5B50BD] dark:hover:border-[#918AD3]',
                  'hover:text-[#5B50BD] dark:hover:text-[#918AD3]',
                  'hover:shadow-md hover:shadow-[#5B50BD]/10',
                  'transition-all duration-200'
                )}
              >
                <Icon className="w-4 h-4" />
                {action.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Input area at bottom */}
      <div className="flex-shrink-0 px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Attachments Preview */}
          {allPendingAttachments.length > 0 && (
            <div className="mb-3">
              <AttachmentPreviewCompact attachments={allPendingAttachments} onRemove={removeAttachment} />
            </div>
          )}

          <div className={cn(
            'flex items-center gap-2 p-2 rounded-2xl',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700',
            'focus-within:border-[#5B50BD] dark:focus-within:border-[#918AD3]',
            'shadow-lg shadow-gray-200/50 dark:shadow-gray-900/50',
            'transition-all no-focus-outline'
          )}>
            {/* Attachment Menu Button */}
            <div className="relative flex-shrink-0" ref={attachmentMenuRef}>
              <button
                onClick={() => setAttachmentMode(attachmentMode ? null : 'menu')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  attachmentMode
                    ? 'text-[#5B50BD] bg-[#5B50BD]/10'
                    : 'text-gray-400 hover:text-[#5B50BD] hover:bg-[#5B50BD]/10'
                )}
                title="Add files, link or proposal"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Attachment Panel */}
              {attachmentMode && (
                <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                  {/* Files */}
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
                        dragOver ? 'border-[#5B50BD] bg-[#5B50BD]/5' : 'border-gray-300 dark:border-gray-600 hover:border-[#5B50BD]'
                      )}
                    >
                      <p className="text-xs text-gray-500">Drop files or click to upload</p>
                    </div>
                  </div>

                  {/* Links */}
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
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLink(); } }}
                      />
                      <button
                        onClick={handleAddLink}
                        disabled={!linkUrl.trim()}
                        className={cn(
                          'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                          linkUrl.trim() ? 'bg-[#5B50BD] text-white hover:bg-[#4A41A0]' : 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                        )}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Proposals */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-500">Link Proposal</span>
                    </div>
                    <input
                      type="text"
                      value={proposalSearchQuery}
                      onChange={(e) => setProposalSearchQuery(e.target.value)}
                      placeholder="Search proposals..."
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5B50BD] mb-2"
                    />
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {filteredProposals.length > 0 ? (
                        filteredProposals.map((proposal) => (
                          <button
                            key={proposal.id}
                            onClick={() => handleAddProposal(proposal.id)}
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
                          {proposalSearchQuery ? 'No proposals found' : 'No proposals available'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask anything about your proposals..."
              disabled={isStreaming}
              rows={1}
              className={cn(
                'flex-1 px-3 py-2 bg-transparent resize-none',
                'text-base text-gray-900 dark:text-gray-100',
                'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                'focus:outline-none focus:ring-0 focus-visible:outline-none',
                'disabled:opacity-50',
                'min-h-[44px] max-h-[120px]'
              )}
            />
            <Button
              onClick={handleSend}
              disabled={(!inputValue.trim() && allPendingAttachments.length === 0) || isStreaming}
              className={cn(
                'h-10 w-10 p-0 rounded-xl flex-shrink-0 self-end mb-0.5',
                'bg-[#5B50BD] hover:bg-[#4A41A0]',
                'disabled:opacity-30 disabled:bg-gray-300 dark:disabled:bg-gray-600'
              )}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatContainer({
  messages,
  isStreaming,
  activeFilters,
  onSendMessage,
  onFilterRemove,
  onFilterClearAll,
  onSourceClick,
  onActionClick,
  className,
  // Coworking props
  sessionActive,
  comments,
  getCommentsForMessage,
  onAddComment,
  onResolveComment,
  onDeleteComment,
  typingUsers,
}: ChatContainerProps) {
  const { proposals } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [linkAttachments, setLinkAttachments] = useState<MessageAttachment[]>([]);
  const [proposalAttachments, setProposalAttachments] = useState<MessageAttachment[]>([]);
  const [attachmentMode, setAttachmentMode] = useState<AttachmentMode>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [proposalSearchQuery, setProposalSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 80)}px`;
    }
  }, [inputValue]);

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

  // Filtered proposals for search
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

  // All pending attachments combined
  const allPendingAttachments = useMemo(() => {
    const fileAtts = attachments.map(f => ({ name: f.name, type: f.type, size: f.size }));
    return [...fileAtts, ...linkAttachments, ...proposalAttachments];
  }, [attachments, linkAttachments, proposalAttachments]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      setAttachments(prev => [...prev, ...Array.from(files)]);
    }
    e.target.value = '';
    setAttachmentMode(null);
  };

  const removeAttachment = (index: number) => {
    const fileCount = attachments.length;
    const linkCount = linkAttachments.length;
    if (index < fileCount) {
      setAttachments(prev => prev.filter((_, i) => i !== index));
    } else if (index < fileCount + linkCount) {
      setLinkAttachments(prev => prev.filter((_, i) => i !== index - fileCount));
    } else {
      setProposalAttachments(prev => prev.filter((_, i) => i !== index - fileCount - linkCount));
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files) setAttachments(prev => [...prev, ...Array.from(files)]);
    setAttachmentMode(null);
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    setLinkAttachments(prev => [...prev, { name: linkUrl.trim(), type: 'link', url: linkUrl.trim() }]);
    setLinkUrl('');
    setAttachmentMode(null);
  };

  const handleAddProposal = (proposalId: string) => {
    const selectedProposal = proposals.find((p) => p.id === proposalId);
    if (!selectedProposal) return;
    setProposalAttachments(prev => [...prev, {
      name: selectedProposal.content.title || 'Untitled Proposal',
      type: 'proposal',
    }]);
    setAttachmentMode(null);
  };

  const handleSend = () => {
    const hasContent = inputValue.trim();
    const hasAttachments = attachments.length > 0 || linkAttachments.length > 0 || proposalAttachments.length > 0;
    if ((!hasContent && !hasAttachments) || isStreaming) return;

    const fileAtts: MessageAttachment[] = attachments.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
      url: URL.createObjectURL(f),
    }));
    const messageAttachments = [...fileAtts, ...linkAttachments, ...proposalAttachments];

    onSendMessage(inputValue.trim(), messageAttachments.length > 0 ? messageAttachments : undefined);
    setInputValue('');
    setAttachments([]);
    setLinkAttachments([]);
    setProposalAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
    if (e.key === 'Escape') {
      setInputValue('');
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    onSendMessage(suggestion);
  };

  const isLoading = messages.length === 0;

  // Loading state while initializing
  if (isLoading) {
    return (
      <div className={cn('flex flex-col h-full items-center justify-center', className)}>
        <Loader2 className="w-6 h-6 animate-spin text-[#5B50BD] dark:text-[#918AD3]" />
        <p className="mt-2 text-xs text-gray-500">Loading...</p>
      </div>
    );
  }

  // Show welcome screen if no user messages yet
  const hasUserMessages = messages.some(m => m.role === 'user');
  if (!hasUserMessages) {
    return (
      <div className={cn('flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-[#100E28]', className)}>
        <WelcomeScreen
          onSendMessage={onSendMessage}
          isStreaming={isStreaming}
        />
      </div>
    );
  }

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      {/* Messages area - responsive padding */}
      <div className="flex-1 overflow-y-auto px-2 sm:px-3 md:px-4 py-2 sm:py-3">
        <div className="max-w-full sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] mx-auto space-y-2 sm:space-y-3">
          {/* Messages - filter out initial welcome message */}
          {messages.filter((m, idx) => !(idx === 0 && m.role === 'assistant')).map((message) => (
            message.role === 'user' ? (
              <UserMessage key={message.id} message={message} />
            ) : (
              <AIMessage
                key={message.id}
                message={message}
                onSourceClick={onSourceClick}
                onActionClick={onActionClick}
                onSuggestionClick={handleSuggestionClick}
              />
            )
          ))}

          {/* Streaming indicator */}
          {isStreaming && messages[messages.length - 1]?.role === 'user' && (
            <StreamingIndicator isVisible={true} />
          )}

          {/* Typing indicator for collaborators */}
          {sessionActive && typingUsers && typingUsers.length > 0 && (
            <TypingIndicator typingUsers={typingUsers} />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Bottom input area - responsive & compact */}
      <div className="flex-shrink-0 pt-4">
        <div className="max-w-full sm:max-w-[600px] md:max-w-[700px] lg:max-w-[800px] mx-auto px-2 sm:px-3 md:px-4 py-2">
          {/* Active filters */}
          {activeFilters.length > 0 && (
            <div className="mb-2">
              <FilterChips
                filters={activeFilters}
                onRemove={onFilterRemove}
                onClearAll={onFilterClearAll}
              />
            </div>
          )}

          {/* Quick action buttons */}
          <div className="flex flex-wrap gap-1.5 mb-2">
            {WELCOME_QUICK_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={() => onSendMessage(action.query)}
                  disabled={isStreaming}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg',
                    'text-xs font-medium',
                    'bg-white dark:bg-gray-800',
                    'text-gray-600 dark:text-gray-400',
                    'border border-gray-200 dark:border-gray-700',
                    'hover:border-[#5B50BD] dark:hover:border-[#918AD3]',
                    'hover:text-[#5B50BD] dark:hover:text-[#918AD3]',
                    'transition-all duration-200',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {action.label}
                </button>
              );
            })}
          </div>

          {/* Hidden file input */}
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleFileSelect}
            accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xlsx,.csv"
          />

          {/* Attachments Preview */}
          {allPendingAttachments.length > 0 && (
            <div className="mb-2">
              <AttachmentPreviewCompact
                attachments={allPendingAttachments}
                onRemove={removeAttachment}
              />
            </div>
          )}

          {/* Input row */}
          <div className="flex items-center gap-2">
            {/* Attachment Menu Button */}
            <div className="relative flex-shrink-0" ref={attachmentMenuRef}>
              <button
                onClick={() => setAttachmentMode(attachmentMode ? null : 'menu')}
                className={cn(
                  'p-2 rounded-lg transition-colors',
                  attachmentMode
                    ? 'text-[#5B50BD] bg-[#5B50BD]/10'
                    : 'text-gray-400 hover:text-[#5B50BD] hover:bg-[#5B50BD]/10',
                  'dark:hover:text-[#918AD3] dark:hover:bg-[#918AD3]/10'
                )}
                title="Add files, link or proposal"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              {/* Attachment Panel */}
              {attachmentMode && (
                <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                  {/* Files */}
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
                        dragOver ? 'border-[#5B50BD] bg-[#5B50BD]/5' : 'border-gray-300 dark:border-gray-600 hover:border-[#5B50BD]'
                      )}
                    >
                      <p className="text-xs text-gray-500">Drop files or click to upload</p>
                    </div>
                  </div>

                  {/* Links */}
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
                        onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLink(); } }}
                      />
                      <button
                        onClick={handleAddLink}
                        disabled={!linkUrl.trim()}
                        className={cn(
                          'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                          linkUrl.trim() ? 'bg-[#5B50BD] text-white hover:bg-[#4A41A0]' : 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                        )}
                      >
                        Add
                      </button>
                    </div>
                  </div>

                  {/* Proposals */}
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <Briefcase className="w-4 h-4 text-gray-500" />
                      <span className="text-xs font-medium text-gray-500">Link Proposal</span>
                    </div>
                    <input
                      type="text"
                      value={proposalSearchQuery}
                      onChange={(e) => setProposalSearchQuery(e.target.value)}
                      placeholder="Search proposals..."
                      className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5B50BD] mb-2"
                    />
                    <div className="max-h-32 overflow-y-auto space-y-1">
                      {filteredProposals.length > 0 ? (
                        filteredProposals.map((proposal) => (
                          <button
                            key={proposal.id}
                            onClick={() => handleAddProposal(proposal.id)}
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
                          {proposalSearchQuery ? 'No proposals found' : 'No proposals available'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className={cn(
                'flex-1 relative rounded-xl no-focus-outline',
                'border border-gray-200 dark:border-gray-700',
                'focus-within:border-[#5B50BD] dark:focus-within:border-[#918AD3]',
                'bg-gray-50 dark:bg-gray-800/50',
                'transition-all'
              )}
            >
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask a question..."
                disabled={isStreaming}
                rows={1}
                className={cn(
                  'w-full px-3 py-2.5 bg-transparent resize-none',
                  'text-sm text-gray-900 dark:text-gray-100',
                  'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                  'focus:outline-none focus:ring-0 focus-visible:outline-none',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'min-h-[40px] max-h-[80px]'
                )}
              />
            </div>

            <Button
              onClick={handleSend}
              disabled={(!inputValue.trim() && allPendingAttachments.length === 0) || isStreaming}
              className={cn(
                'h-10 w-10 p-0 rounded-xl flex-shrink-0',
                'bg-[#5B50BD] hover:bg-[#4A41A0]',
                'dark:bg-[#918AD3] dark:hover:bg-[#A8A2DE] dark:text-[#100E28]',
                'disabled:opacity-50 disabled:cursor-not-allowed'
              )}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          {/* Help text - hidden on mobile */}
          <p className="hidden sm:block mt-1 text-[10px] text-gray-400 dark:text-gray-500 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
