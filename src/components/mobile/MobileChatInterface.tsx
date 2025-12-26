'use client';

import { useState, useRef, useEffect } from 'react';
import {
  Send,
  Paperclip,
  Sparkles,
  User,
  Bot,
  ChevronDown,
  FileEdit,
} from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import type { ChatMessage, Proposal } from '@/types';

const TEMPLATES = [
  { id: 'concept', name: 'Concept Test' },
  { id: 'brand', name: 'Brand Tracking' },
  { id: 'segmentation', name: 'Segmentation' },
  { id: 'ua', name: 'U&A Study' },
  { id: 'ad', name: 'Ad Testing' },
  { id: 'pricing', name: 'Pricing Research' },
];

interface MobileChatInterfaceProps {
  proposalId: string;
  onSwitchToEditor: () => void;
}

export function MobileChatInterface({ proposalId, onSwitchToEditor }: MobileChatInterfaceProps) {
  const {
    getProposalChat,
    isAiTyping,
    addChatMessage,
    setAiTyping,
    addProposal,
    setCurrentProposal,
    currentUser,
  } = useAppStore();

  // Get chat messages for this specific proposal
  const chatMessages = getProposalChat(proposalId);

  const [inputValue, setInputValue] = useState('');
  const [showTemplates, setShowTemplates] = useState(chatMessages.length === 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages, isAiTyping]);

  // Auto resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = Math.min(inputRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  const handleSend = () => {
    if (!inputValue.trim() || isAiTyping) return;

    const userContent = inputValue.trim();

    addChatMessage(proposalId, {
      role: 'user',
      content: userContent,
    });
    setInputValue('');
    setShowTemplates(false);
    setAiTyping(true);

    // Simulate AI response
    setTimeout(() => {
      addChatMessage(proposalId, {
        role: 'assistant',
        content: generateAIResponse(userContent),
      });
      setAiTyping(false);
    }, 1500);
  };

  const handleTemplateSelect = (template: typeof TEMPLATES[0]) => {
    const message = `I want to create a ${template.name} proposal`;
    setInputValue(message);
    setShowTemplates(false);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lower = userMessage.toLowerCase();

    if (lower.includes('concept') || lower.includes('test')) {
      return "I'll help you create a concept testing proposal. Let me ask a few questions:\n\n1. **Client name?**\n2. **Number of concepts** to test?\n3. **Target audience?**\n\nYou can answer all at once or one by one.";
    }

    if (lower.includes('brand') || lower.includes('tracking')) {
      return "Great! A brand tracking study. I'll need:\n\n1. **Brand name** and category?\n2. **Markets** to cover?\n3. **Tracking frequency** (monthly, quarterly)?\n\nShare what you have and I'll fill in the rest.";
    }

    if (lower.includes('help') || lower.includes('how')) {
      return "I can help you create proposals in two ways:\n\n1. **Chat with me** - Describe your project and I'll draft the proposal\n2. **Use a template** - Start with a pre-built structure\n\nWhat would you like to do?";
    }

    return "Thanks for the details! Based on what you've shared, I'll start drafting your proposal.\n\nI'll include:\n- Background & objectives\n- Methodology recommendation\n- Sample structure\n- Timeline estimate\n\nWould you like me to proceed, or do you have more details to add?";
  };

  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-gray-900">
      {/* Messages Area */}
      <div className="flex-1 px-4 py-4">
        {/* Templates */}
        {showTemplates && chatMessages.length === 0 && (
          <div className="mb-6">
            <div className="text-center mb-6">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EDE9F9] dark:bg-[#231E51]">
                <Sparkles className="h-7 w-7 text-[#5B50BD] dark:text-[#918AD3]" />
              </div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Create a Proposal
              </h2>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Tell me about your research project or pick a template
              </p>
            </div>

            <div className="flex flex-wrap gap-2 justify-center">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => handleTemplateSelect(template)}
                  className="inline-flex items-center rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-gray-300 transition-colors active:bg-gray-100 dark:active:bg-gray-700"
                >
                  {template.name}
                </button>
              ))}
            </div>

            <button
              onClick={onSwitchToEditor}
              className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-gray-100 dark:bg-gray-800 p-3 text-sm font-medium text-gray-600 dark:text-gray-400"
            >
              <FileEdit className="h-4 w-4" />
              Or use manual editor
            </button>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4">
          {chatMessages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex gap-3',
                message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              {/* Avatar */}
              <div
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  message.role === 'user'
                    ? 'bg-[#5B50BD]'
                    : 'bg-gradient-to-br from-[#5B50BD] to-[#918AD3]'
                )}
              >
                {message.role === 'user' ? (
                  <User className="h-4 w-4 text-white" />
                ) : (
                  <Bot className="h-4 w-4 text-white" />
                )}
              </div>

              {/* Message */}
              <div
                className={cn(
                  'max-w-[80%] rounded-2xl px-4 py-2.5',
                  message.role === 'user'
                    ? 'bg-[#5B50BD] text-white rounded-br-md'
                    : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-bl-md'
                )}
              >
                <p
                  className={cn(
                    'text-sm whitespace-pre-wrap',
                    message.role === 'assistant' && 'text-gray-700 dark:text-gray-300'
                  )}
                  dangerouslySetInnerHTML={{
                    __html: message.content
                      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                      .replace(/\n/g, '<br />')
                  }}
                />
                <span
                  className={cn(
                    'block mt-1 text-xs',
                    message.role === 'user'
                      ? 'text-blue-200'
                      : 'text-gray-400 dark:text-gray-500'
                  )}
                >
                  {formatTime(message.timestamp)}
                </span>
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isAiTyping && (
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#5B50BD] to-[#918AD3]">
                <Bot className="h-4 w-4 text-white" />
              </div>
              <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
        </div>

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-3">
        <div className="flex items-end gap-2">
          <button className="shrink-0 rounded-full p-2 text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800">
            <Paperclip className="h-5 w-5" />
          </button>

          <div className="flex-1 relative">
            <textarea
              ref={inputRef}
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Describe your research project..."
              rows={1}
              className="w-full resize-none rounded-2xl border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#5B50BD] focus:ring-2 focus:ring-[#5B50BD]/20"
            />
          </div>

          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isAiTyping}
            className={cn(
              'shrink-0 rounded-full p-2.5 transition-colors',
              inputValue.trim() && !isAiTyping
                ? 'bg-[#5B50BD] text-white active:bg-[#4A41A0]'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-400'
            )}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
