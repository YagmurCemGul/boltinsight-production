'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Calculator,
  Percent,
  Users,
  BarChart3,
  Clock,
  PieChart,
  ClipboardCheck,
  ChevronUp,
  ChevronDown,
  Paperclip,
  Upload,
  Link as LinkIcon,
  Briefcase,
} from 'lucide-react';
import { Button, AttachmentPreviewCompact, ChatMessageAttachmentsCompact } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { ToolInputForm } from './ToolInputForm';
import { ToolResultCard } from './ToolResultCard';
import { TOOL_SUGGESTIONS, TOOL_CONFIGS } from './constants';
import { TypingIndicator } from '@/components/coworking';
import type { ToolsChatContainerProps, ToolType, ToolsChatMessage, ChatAttachment } from './types';

type AttachmentMode = 'menu' | null;

// Icon mapping
const TOOL_ICONS: Record<string, typeof Calculator> = {
  Percent,
  Users,
  BarChart3,
  Clock,
  PieChart,
  ClipboardCheck,
  Calculator,
};

// Typing cursor component
function TypingCursor() {
  return (
    <span
      className="inline-block w-0.5 h-4 bg-[#5B50BD] dark:bg-[#918AD3] ml-0.5 align-middle"
      style={{ animation: 'blink 0.8s step-end infinite' }}
    />
  );
}

// Typing text component with character-by-character animation
function TypewriterText({ text, isNew }: { text: string; isNew: boolean }) {
  const [displayedText, setDisplayedText] = useState(isNew ? '' : text);
  const [isTyping, setIsTyping] = useState(isNew);

  // When isNew becomes false, immediately show full text
  useEffect(() => {
    if (!isNew) {
      setDisplayedText(text);
      setIsTyping(false);
    }
  }, [isNew, text]);

  // Typing animation
  useEffect(() => {
    if (!isNew) return;

    setDisplayedText('');
    setIsTyping(true);
    let index = 0;

    const interval = setInterval(() => {
      if (index < text.length) {
        setDisplayedText(text.slice(0, index + 1));
        index++;
      } else {
        setIsTyping(false);
        clearInterval(interval);
      }
    }, 20);

    return () => clearInterval(interval);
  }, [text, isNew]);

  // Format a single line with markdown
  const formatLine = (line: string, isLastLine: boolean, showCursor: boolean) => {
    const parts = line.split(/\*\*(.*?)\*\*/g);
    const elements = parts.map((part, i) =>
      i % 2 === 1
        ? <strong key={i} className="font-semibold text-[#5B50BD] dark:text-[#918AD3]">{part}</strong>
        : <span key={i}>{part}</span>
    );

    // Add cursor at the end of the last line if typing
    if (isLastLine && showCursor) {
      elements.push(<TypingCursor key="cursor" />);
    }

    return elements;
  };

  // Parse and format content
  const lines = displayedText.split('\n');

  return (
    <div className="text-sm leading-relaxed space-y-1">
      {lines.map((line, idx) => {
        const isLastLine = idx === lines.length - 1;
        const showCursor = isTyping && isLastLine;

        // Bullet points
        if (line.startsWith('• ') || line.startsWith('- ')) {
          return (
            <li key={idx} className="ml-4 list-disc text-gray-600 dark:text-gray-300">
              {formatLine(line.slice(2), isLastLine, showCursor)}
            </li>
          );
        }

        // Empty lines
        if (!line.trim()) {
          return <div key={idx} className="h-2" />;
        }

        return (
          <p key={idx} className="text-gray-600 dark:text-gray-300">
            {formatLine(line, isLastLine, showCursor)}
          </p>
        );
      })}
    </div>
  );
}

// AI message component
function AIMessage({
  message,
  activeToolForm,
  formValues,
  onSubmitToolForm,
  onUpdateFormValue,
  onSuggestionClick,
  onToolSelect,
  isLatest,
}: {
  message: ToolsChatMessage;
  activeToolForm: ToolType | null;
  formValues: Record<string, unknown>;
  onSubmitToolForm: (toolType: ToolType, values: Record<string, unknown>) => void;
  onUpdateFormValue: (field: string, value: unknown) => void;
  onSuggestionClick: (suggestion: string) => void;
  onToolSelect: (toolType: ToolType) => void;
  isLatest: boolean;
}) {
  // Only animate typing for latest message that's streaming
  const shouldAnimate = isLatest && message.isStreaming === true;

  return (
    <div className="flex items-start gap-3 animate-fade-slide-in">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#5B50BD] dark:bg-[#918AD3] flex items-center justify-center mt-0.5">
        <Calculator className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white dark:text-[#100E28]" />
      </div>

      <div className="flex-1 space-y-4">
        {/* Message content with typing animation */}
        <TypewriterText text={message.content} isNew={shouldAnimate} />

        {/* Tool result */}
        {message.toolResult && !message.isStreaming && (
          <div className="animate-fade-slide-in-delay-1">
            <ToolResultCard result={message.toolResult} />
          </div>
        )}

        {/* Tool form - single render for both editable and read-only */}
        {message.showToolForm && !message.isStreaming && (() => {
          // Determine if form should be editable or read-only
          const isActiveForm = activeToolForm === message.showToolForm;
          const hasSubmittedValues = message.submittedValues && Object.keys(message.submittedValues).length > 0;
          const hasFormValues = message.formValues && Object.keys(message.formValues).length > 0;

          // Priority 1: Show submitted values (read-only after calculation)
          if (hasSubmittedValues) {
            return (
              <div className="mt-2">
                <ToolInputForm
                  toolType={message.showToolForm}
                  values={message.submittedValues!}
                  readOnly
                />
              </div>
            );
          }

          // Priority 2: Show editable form if this is the active form
          if (isActiveForm) {
            return (
              <div className="animate-fade-slide-in-delay-1">
                <ToolInputForm
                  toolType={message.showToolForm}
                  values={formValues}
                  onValueChange={onUpdateFormValue}
                  onSubmit={onSubmitToolForm}
                  onCancel={() => onToolSelect(message.showToolForm!)}
                />
              </div>
            );
          }

          // Priority 3: Show read-only with formValues (race condition or stale state)
          if (hasFormValues) {
            return (
              <div className="mt-2">
                <ToolInputForm
                  toolType={message.showToolForm}
                  values={message.formValues!}
                  readOnly
                />
              </div>
            );
          }

          // Priority 4: Always show form with empty values as last resort
          // This prevents the form from disappearing
          return (
            <div className="mt-2">
              <ToolInputForm
                toolType={message.showToolForm}
                values={{}}
                readOnly
              />
            </div>
          );
        })()}

        {/* Follow-up suggestions */}
        {message.suggestions && message.suggestions.length > 0 && !message.isStreaming && (
          <div className="flex flex-wrap gap-2 pt-2 animate-fade-slide-in-delay-2">
            {message.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => onSuggestionClick(suggestion)}
                className={cn(
                  'px-3 py-1.5 text-xs rounded-full',
                  'text-gray-600 dark:text-gray-400',
                  'border border-gray-200 dark:border-gray-700',
                  'hover:border-[#5B50BD] dark:hover:border-[#918AD3]',
                  'hover:text-[#5B50BD] dark:hover:text-[#918AD3]',
                  'transition-colors'
                )}
              >
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Streaming indicator with avatar
function StreamingIndicator() {
  return (
    <div className="flex items-start gap-3 animate-fade-slide-in">
      {/* AI Avatar */}
      <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#5B50BD] dark:bg-[#918AD3] flex items-center justify-center mt-0.5">
        <Calculator className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white dark:text-[#100E28]" />
      </div>

      <div className="flex items-center gap-2 py-1">
        <div className="flex gap-1">
          <span className="w-2 h-2 bg-[#5B50BD] dark:bg-[#918AD3] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <span className="w-2 h-2 bg-[#5B50BD] dark:bg-[#918AD3] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <span className="w-2 h-2 bg-[#5B50BD] dark:bg-[#918AD3] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400 animate-pulse">Calculating...</span>
      </div>
    </div>
  );
}

// Quick actions bar (at bottom of chat area)
function QuickActionsBar({
  onToolSelect,
  isVisible,
  onToggle,
}: {
  onToolSelect: (toolType: ToolType) => void;
  isVisible: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex-shrink-0 py-3 bg-gray-50 dark:bg-[#100E28]">
      <div className="max-w-[700px] mx-auto px-4 relative">
        {/* Toggle button - positioned on the right */}
        <button
          onClick={onToggle}
          className={cn(
            'absolute right-4 -top-1 flex items-center gap-1 px-2 py-0.5',
            'text-[10px] text-gray-400 dark:text-gray-500',
            'hover:text-gray-600 dark:hover:text-gray-400',
            'transition-colors z-10'
          )}
        >
          {isVisible ? (
            <>
              <ChevronDown className="w-3 h-3" />
              <span>Hide</span>
            </>
          ) : (
            <>
              <ChevronUp className="w-3 h-3" />
              <span>Tools</span>
            </>
          )}
        </button>

        {/* Tools */}
        {isVisible && (
          <div className="flex flex-wrap justify-center gap-2 pt-1">
            {TOOL_SUGGESTIONS.map((suggestion) => {
              const Icon = TOOL_ICONS[suggestion.icon] || Calculator;
              return (
                <button
                  key={suggestion.id}
                  onClick={() => onToolSelect(suggestion.toolType)}
                  className={cn(
                    'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full',
                    'text-[11px] font-medium',
                    'bg-white dark:bg-gray-800',
                    'text-gray-600 dark:text-gray-400',
                    'shadow-md shadow-gray-200/50 dark:shadow-gray-900/50',
                    'hover:shadow-lg hover:shadow-[#5B50BD]/20 dark:hover:shadow-[#918AD3]/20',
                    'hover:text-[#5B50BD] dark:hover:text-[#918AD3]',
                    'hover:-translate-y-0.5',
                    'transition-all duration-200'
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {suggestion.label}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// Welcome screen component (ChatGPT style)
function WelcomeScreen({
  onToolSelect,
  onSendMessage,
  isStreaming,
}: {
  onToolSelect: (toolType: ToolType) => void;
  onSendMessage: (content: string, attachments?: ChatAttachment[]) => void;
  isStreaming: boolean;
}) {
  const { proposals } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [linkAttachments, setLinkAttachments] = useState<ChatAttachment[]>([]);
  const [proposalAttachments, setProposalAttachments] = useState<ChatAttachment[]>([]);
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

  const allPendingAttachments = useMemo(() => {
    const fileAttachments = attachments.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }));
    return [...fileAttachments, ...linkAttachments, ...proposalAttachments];
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
      proposalId: selectedProposal.id,
      proposalStatus: selectedProposal.status,
    }]);
    setAttachmentMode(null);
  };

  const handleSend = () => {
    const hasContent = inputValue.trim();
    const hasAttachments = attachments.length > 0 || linkAttachments.length > 0 || proposalAttachments.length > 0;
    if ((!hasContent && !hasAttachments) || isStreaming) return;

    const fileAttachments: ChatAttachment[] = attachments.map(f => ({
      name: f.name, type: f.type, size: f.size, url: URL.createObjectURL(f),
    }));
    const messageAttachments = [...fileAttachments, ...linkAttachments, ...proposalAttachments];

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
            What would you like to calculate?
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Sample sizes, margins of error, survey lengths, and more
          </p>
        </div>

        {/* Quick tool buttons */}
        <div className="flex flex-wrap justify-center gap-2 max-w-lg mb-8">
          {TOOL_SUGGESTIONS.map((suggestion) => {
            const Icon = TOOL_ICONS[suggestion.icon] || Calculator;
            return (
              <button
                key={suggestion.id}
                onClick={() => onToolSelect(suggestion.toolType)}
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
                {suggestion.label}
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
              placeholder="Ask anything..."
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

export function ToolsChatContainer({
  messages,
  isStreaming,
  activeToolForm,
  formValues,
  onSendMessage,
  onSubmitToolForm,
  onUpdateFormValue,
  onSuggestionClick,
  onToolSelect,
  showWelcome,
  className,
  sessionActive,
  typingUsers,
}: ToolsChatContainerProps) {
  const { proposals } = useAppStore();
  const [inputValue, setInputValue] = useState('');
  const [showQuickActions, setShowQuickActions] = useState(true);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [linkAttachments, setLinkAttachments] = useState<ChatAttachment[]>([]);
  const [proposalAttachments, setProposalAttachments] = useState<ChatAttachment[]>([]);
  const [attachmentMode, setAttachmentMode] = useState<AttachmentMode>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [proposalSearchQuery, setProposalSearchQuery] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming, activeToolForm]);

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

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) setAttachments(prev => [...prev, ...Array.from(files)]);
    e.target.value = '';
    setAttachmentMode(null);
  };

  const allPendingAttachments = useMemo(() => {
    const fileAtts = attachments.map(f => ({ name: f.name, type: f.type, size: f.size }));
    return [...fileAtts, ...linkAttachments, ...proposalAttachments];
  }, [attachments, linkAttachments, proposalAttachments]);

  const removeAttachment = (index: number) => {
    const fileCount = attachments.length;
    const linkCount = linkAttachments.length;
    if (index < fileCount) setAttachments(prev => prev.filter((_, i) => i !== index));
    else if (index < fileCount + linkCount) setLinkAttachments(prev => prev.filter((_, i) => i !== index - fileCount));
    else setProposalAttachments(prev => prev.filter((_, i) => i !== index - fileCount - linkCount));
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
      proposalId: selectedProposal.id,
      proposalStatus: selectedProposal.status,
    }]);
    setAttachmentMode(null);
  };

  const handleSend = () => {
    const hasContent = inputValue.trim();
    const hasAttachments = attachments.length > 0 || linkAttachments.length > 0 || proposalAttachments.length > 0;
    if ((!hasContent && !hasAttachments) || isStreaming) return;

    const fileAtts: ChatAttachment[] = attachments.map(f => ({
      name: f.name, type: f.type, size: f.size, url: URL.createObjectURL(f),
    }));
    const messageAttachments = [...fileAtts, ...linkAttachments, ...proposalAttachments];

    onSendMessage(inputValue.trim(), messageAttachments.length > 0 ? messageAttachments : undefined);
    setInputValue('');
    setAttachments([]);
    setLinkAttachments([]);
    setProposalAttachments([]);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Show welcome screen on first load (no user messages and no tool selected yet)
  const hasUserMessages = messages.some(m => m.role === 'user');
  const hasToolFormMessages = messages.some(m => m.showToolForm);

  if (showWelcome && !hasUserMessages && !hasToolFormMessages) {
    return (
      <div className={cn('flex flex-col h-full overflow-hidden bg-gray-50 dark:bg-[#100E28]', className)}>
        <WelcomeScreen
          onToolSelect={onToolSelect}
          onSendMessage={onSendMessage}
          isStreaming={isStreaming}
        />
      </div>
    );
  }

  // Filter out the initial welcome message after user starts chatting
  // But keep messages that have tool forms or results
  const displayMessages = messages.filter((m, idx) =>
    !(idx === 0 && m.role === 'assistant' && messages.length > 1 && !m.showToolForm && !m.toolResult)
  );

  return (
    <div className={cn('flex flex-col h-full overflow-hidden', className)}>
      {/* Messages area - scrollable */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
        <div className="max-w-[700px] mx-auto space-y-6">
          {displayMessages.map((message, idx) => (
            message.role === 'user' ? (
              <div key={message.id} className="flex flex-col items-end gap-2 animate-fade-slide-in">
                {/* Attachments - ChatGPT Style (outside bubble) */}
                {message.attachments && message.attachments.length > 0 && (
                  <ChatMessageAttachmentsCompact attachments={message.attachments} align="end" />
                )}
                {/* Message bubble - only show if there's actual text content */}
                {message.content && message.content.trim() && (
                  <div className="max-w-[85%] px-4 py-2.5 rounded-2xl rounded-br-sm bg-[#5B50BD] text-white">
                    <p className="text-sm">{message.content}</p>
                  </div>
                )}
              </div>
            ) : (
              <AIMessage
                key={message.id}
                message={message}
                activeToolForm={activeToolForm}
                formValues={formValues}
                onSubmitToolForm={onSubmitToolForm}
                onUpdateFormValue={onUpdateFormValue}
                onSuggestionClick={onSuggestionClick}
                onToolSelect={onToolSelect}
                isLatest={idx === displayMessages.length - 1}
              />
            )
          ))}

          {/* Streaming indicator */}
          {isStreaming && messages[messages.length - 1]?.role === 'user' && (
            <StreamingIndicator />
          )}

          {/* Typing indicator for collaborators */}
          {sessionActive && typingUsers && typingUsers.length > 0 && (
            <TypingIndicator typingUsers={typingUsers} />
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Quick actions bar - fixed at bottom of chat area */}
      <QuickActionsBar
        onToolSelect={onToolSelect}
        isVisible={showQuickActions}
        onToggle={() => setShowQuickActions(!showQuickActions)}
      />

      {/* Input area */}
      <div className="flex-shrink-0 pt-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xlsx,.csv"
        />

        <div className="max-w-[800px] mx-auto px-4 py-3">
          {/* Attachments Preview */}
          {allPendingAttachments.length > 0 && (
            <div className="mb-3">
              <AttachmentPreviewCompact attachments={allPendingAttachments} onRemove={removeAttachment} />
            </div>
          )}

          <div className="flex items-center gap-2">
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

            <div className={cn(
              'flex-1 relative rounded-xl no-focus-outline',
              'border border-gray-200 dark:border-gray-700',
              'focus-within:border-[#5B50BD] dark:focus-within:border-[#918AD3]',
              'bg-gray-50 dark:bg-gray-800',
              'transition-all'
            )}>
              <textarea
                ref={textareaRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about sample size, MOE, MaxDiff, LOI..."
                disabled={isStreaming}
                rows={1}
                className={cn(
                  'w-full px-4 py-2.5 bg-transparent resize-none',
                  'text-sm text-gray-900 dark:text-gray-100',
                  'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                  'focus:outline-none focus:ring-0 focus-visible:outline-none',
                  'disabled:opacity-50',
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
                'disabled:opacity-50'
              )}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>

          <p className="hidden sm:block mt-2 text-xs text-gray-400 text-center">
            Press Enter to send
          </p>
        </div>
      </div>
    </div>
  );
}
