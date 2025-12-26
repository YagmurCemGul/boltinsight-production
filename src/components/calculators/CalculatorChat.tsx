'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Paperclip,
  Bot,
  User,
  X,
  MessageSquare,
  Sparkles,
  Upload,
  Link as LinkIcon,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import {
  Button,
  AttachmentPreviewCompact,
  ChatMessageAttachmentsCompact,
} from '@/components/ui';
import type { ChatAttachment } from '@/components/ui';

interface CalculatorMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: ChatAttachment[];
  timestamp: Date;
}

interface CalculatorChatProps {
  isOpen: boolean;
  onClose: () => void;
  calculatorType?: string;
}

type AttachmentMode = 'menu' | 'files' | 'link' | 'proposal' | null;

// Quick suggestions for calculator chat
const QUICK_SUGGESTIONS = [
  'What sample size do I need for 95% confidence?',
  'How does margin of error affect sample size?',
  'Recommend a sample size for brand tracking',
  'What is the minimum sample for subgroup analysis?',
];

// Generate mock AI response
function generateAIResponse(message: string, calculatorType?: string): string {
  const lowerMessage = message.toLowerCase();

  if (lowerMessage.includes('sample size') && lowerMessage.includes('95')) {
    return `For a 95% confidence level, here are common sample size requirements:

**Standard Research:**
- ±3% margin of error: ~1,067 respondents
- ±5% margin of error: ~384 respondents
- ±7% margin of error: ~196 respondents

**Key Factors:**
1. Population size (usually not critical if >10,000)
2. Expected response distribution (50% is most conservative)
3. Number of subgroups needed

Would you like me to calculate a specific sample size for your research?`;
  }

  if (lowerMessage.includes('margin of error')) {
    return `**Margin of Error Impact on Sample Size:**

The relationship is inverse - lower MOE requires larger samples:

| MOE | Sample Size (95% CI) |
|-----|---------------------|
| ±1% | 9,604 |
| ±2% | 2,401 |
| ±3% | 1,067 |
| ±5% | 384 |
| ±10% | 96 |

**Recommendations:**
- Brand tracking: ±3-5%
- Concept testing: ±5-7%
- Exploratory: ±7-10%

Which type of research are you planning?`;
  }

  if (lowerMessage.includes('brand tracking')) {
    return `**Sample Size for Brand Tracking Studies:**

For reliable brand tracking, I recommend:

**Per Market:**
- Minimum: 400 respondents (±5% MOE)
- Standard: 600-800 respondents (±3-4% MOE)
- Premium: 1,000+ respondents (±3% MOE)

**Key Considerations:**
1. Track at least quarterly for trend detection
2. Keep methodology consistent across waves
3. Consider boosting for brand user segments

**Cost Estimate:**
- 500 respondents × $20/complete = $10,000 per market
- 800 respondents × $20/complete = $16,000 per market

Should I calculate costs for multiple markets?`;
  }

  if (lowerMessage.includes('subgroup')) {
    return `**Minimum Sample for Subgroup Analysis:**

For reliable subgroup comparisons, each subgroup needs sufficient base size:

**Subgroup Base Sizes:**
- Minimum reporting: 30 respondents
- Reliable comparisons: 100+ respondents
- Detailed analysis: 200+ respondents

**Example:**
If you need 4 subgroups with reliable comparisons:
- 4 subgroups × 100 = 400 minimum
- With margin buffer: 500-600 recommended

**Formula:**
Total Sample = (Number of Subgroups × Min per Subgroup) × 1.25 buffer

How many subgroups do you plan to analyze?`;
  }

  // Default response
  return `I can help you with research calculations! Here's what I can assist with:

**Sample Size:**
- Calculate optimal sample sizes
- Determine margin of error impact
- Plan for subgroup analysis

**Methodology:**
- LOI (Length of Interview) estimation
- MaxDiff analysis planning
- Demographics distribution

**Feasibility:**
- Budget optimization
- Timeline planning
- Multi-market studies

What specific calculation would you like help with?`;
}

export function CalculatorChat({ isOpen, onClose, calculatorType }: CalculatorChatProps) {
  const { proposals } = useAppStore();

  const [messages, setMessages] = useState<CalculatorMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Hi! I'm your research calculator assistant. I can help you with sample size calculations, margin of error estimates, and other research planning questions.

What would you like to calculate?`,
      timestamp: new Date(),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isTyping, setIsTyping] = useState(false);

  // Attachment menu states
  const [attachmentMode, setAttachmentMode] = useState<AttachmentMode>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [proposalSearchQuery, setProposalSearchQuery] = useState('');
  // Track link and proposal attachments separately
  const [linkAttachments, setLinkAttachments] = useState<ChatAttachment[]>([]);
  const [proposalAttachments, setProposalAttachments] = useState<ChatAttachment[]>([]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 100)}px`;
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

  const removeAttachment = (index: number) => {
    // Calculate which type of attachment to remove
    const fileCount = attachments.length;
    const linkCount = linkAttachments.length;

    if (index < fileCount) {
      // Remove file attachment
      setAttachments(prev => prev.filter((_, i) => i !== index));
    } else if (index < fileCount + linkCount) {
      // Remove link attachment
      setLinkAttachments(prev => prev.filter((_, i) => i !== index - fileCount));
    } else {
      // Remove proposal attachment
      setProposalAttachments(prev => prev.filter((_, i) => i !== index - fileCount - linkCount));
    }
  };

  // Drag and drop handlers
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
    const files = e.dataTransfer.files;
    if (files) {
      setAttachments(prev => [...prev, ...Array.from(files)]);
    }
    setAttachmentMode(null);
  };

  // Add link as attachment
  const handleAddLink = () => {
    if (!linkUrl.trim()) return;

    const newLink: ChatAttachment = {
      name: linkUrl.trim(),
      type: 'link',
      url: linkUrl.trim(),
    };

    setLinkAttachments(prev => [...prev, newLink]);
    setLinkUrl('');
    setAttachmentMode(null);
  };

  // Add proposal as attachment
  const handleAddProposal = (proposalId: string) => {
    const selectedProposal = proposals.find((p) => p.id === proposalId);
    if (!selectedProposal) return;

    const newProposalAttachment: ChatAttachment = {
      name: selectedProposal.content.title || 'Untitled Proposal',
      type: 'proposal',
      proposalId: selectedProposal.id,
      proposalStatus: selectedProposal.status,
    };

    setProposalAttachments(prev => [...prev, newProposalAttachment]);
    setAttachmentMode(null);
  };

  // Get all attachments combined for preview
  const allPendingAttachments = useMemo(() => {
    const fileAttachments = attachments.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
    }));
    return [...fileAttachments, ...linkAttachments, ...proposalAttachments];
  }, [attachments, linkAttachments, proposalAttachments]);

  const handleSend = async () => {
    const hasContent = inputValue.trim();
    const hasAttachments = attachments.length > 0 || linkAttachments.length > 0 || proposalAttachments.length > 0;

    if ((!hasContent && !hasAttachments) || isTyping) return;

    // Create message attachments from all sources
    const fileAttachments: ChatAttachment[] = attachments.map(f => ({
      name: f.name,
      type: f.type,
      size: f.size,
      url: URL.createObjectURL(f),
    }));

    const messageAttachments: ChatAttachment[] = [
      ...fileAttachments,
      ...linkAttachments,
      ...proposalAttachments,
    ];

    // Add user message
    const userMessage: CalculatorMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputValue.trim(),
      attachments: messageAttachments.length > 0 ? messageAttachments : undefined,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    const userQuery = inputValue.trim();
    setInputValue('');
    setAttachments([]);
    setLinkAttachments([]);
    setProposalAttachments([]);

    // Simulate AI response
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 500));

    const aiResponse: CalculatorMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      content: generateAIResponse(userQuery, calculatorType),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, aiResponse]);
    setIsTyping(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputValue(suggestion);
    textareaRef.current?.focus();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 flex flex-col z-50 shadow-xl">
      {/* Header */}
      <div className="flex-shrink-0 flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5B50BD] to-[#1ED6BB] flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Calculator Assistant</h3>
            <p className="text-xs text-gray-500">AI-powered research help</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(message => (
          <div
            key={message.id}
            className={cn(
              'flex gap-2',
              message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
            )}
          >
            {/* Avatar */}
            <div
              className={cn(
                'flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center',
                message.role === 'user'
                  ? 'bg-[#5B50BD] text-white'
                  : 'bg-gradient-to-br from-[#1ED6BB] to-[#5B50BD] text-white'
              )}
            >
              {message.role === 'user' ? (
                <User className="w-3.5 h-3.5" />
              ) : (
                <Bot className="w-3.5 h-3.5" />
              )}
            </div>

            {/* Message Content */}
            <div
              className={cn(
                'max-w-[80%] flex flex-col gap-2',
                message.role === 'user' ? 'items-end' : 'items-start'
              )}
            >
              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <ChatMessageAttachmentsCompact
                  attachments={message.attachments}
                  align={message.role === 'user' ? 'end' : 'start'}
                />
              )}

              {/* Text - only show bubble if there's actual content */}
              {message.content && message.content.trim() && (
                <div
                  className={cn(
                    'rounded-2xl px-3 py-2 text-sm',
                    message.role === 'user'
                      ? 'bg-[#5B50BD] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white'
                  )}
                >
                  <div className="whitespace-pre-wrap">{message.content}</div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {isTyping && (
          <div className="flex gap-2">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#1ED6BB] to-[#5B50BD] flex items-center justify-center text-white">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl px-4 py-2">
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick suggestions */}
      {messages.length <= 2 && (
        <div className="flex-shrink-0 px-4 pb-2">
          <div className="flex flex-wrap gap-1.5">
            {QUICK_SUGGESTIONS.slice(0, 2).map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSuggestionClick(suggestion)}
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs',
                  'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400',
                  'hover:bg-[#5B50BD]/10 hover:text-[#5B50BD] dark:hover:text-[#918AD3]',
                  'border border-gray-200 dark:border-gray-700',
                  'transition-colors'
                )}
              >
                <Sparkles className="w-3 h-3" />
                {suggestion.length > 30 ? suggestion.substring(0, 30) + '...' : suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="flex-shrink-0 border-t border-gray-200 dark:border-gray-700 p-4">
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileSelect}
          accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xlsx,.csv"
        />

        {/* Attachments Preview - ChatGPT style */}
        {allPendingAttachments.length > 0 && (
          <div className="mb-3">
            <AttachmentPreviewCompact
              attachments={allPendingAttachments}
              onRemove={removeAttachment}
            />
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* Attachment Menu Button */}
          <div className="relative flex-shrink-0" ref={attachmentMenuRef}>
            <button
              onClick={() => setAttachmentMode(attachmentMode ? null : 'menu')}
              className={cn(
                'p-2 rounded-lg transition-colors flex-shrink-0',
                attachmentMode
                  ? 'text-[#5B50BD] bg-[#5B50BD]/10'
                  : 'text-gray-400 hover:text-[#5B50BD] hover:bg-[#5B50BD]/10'
              )}
              title="Add files, link or proposal"
            >
              <Paperclip className="w-5 h-5" />
            </button>

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
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddLink();
                        }
                      }}
                    />
                    <button
                      onClick={handleAddLink}
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
              'flex-1 rounded-xl',
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
              placeholder="Ask about calculations..."
              disabled={isTyping}
              rows={1}
              className={cn(
                'w-full px-3 py-2 bg-transparent resize-none',
                'text-sm text-gray-900 dark:text-gray-100',
                'placeholder:text-gray-400',
                'focus:outline-none focus:ring-0',
                'disabled:opacity-50',
                'min-h-[36px] max-h-[100px]'
              )}
            />
          </div>

          <Button
            onClick={handleSend}
            disabled={(!inputValue.trim() && allPendingAttachments.length === 0) || isTyping}
            className={cn(
              'h-9 w-9 p-0 rounded-xl flex-shrink-0',
              'bg-[#5B50BD] hover:bg-[#4A41A0]',
              'disabled:opacity-50'
            )}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
