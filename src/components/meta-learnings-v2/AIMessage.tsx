'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Brain } from 'lucide-react';
import { ConfidenceBadge } from './ConfidenceBadge';
import { DataTable } from './DataTable';
import { InsightCard } from './InsightCard';
import { SourceCitation } from './SourceCitation';
import { ActionBar } from './ActionBar';
import { SuggestionPills } from './SuggestionPills';
import { ProposalSelector } from './ProposalSelector';
import { ShareSelector } from './ShareSelector';
import type { AIMessageProps, ActionItem } from './types';

export function AIMessage({
  message,
  onSourceClick,
  onActionClick,
  onSuggestionClick,
  className,
}: AIMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('');
  const [showProposalSelector, setShowProposalSelector] = useState(false);
  const [showShareSelector, setShowShareSelector] = useState(false);

  // Handle action click with inline selectors
  const handleActionClick = (action: ActionItem) => {
    if (action.id === 'proposal') {
      setShowProposalSelector(true);
      setShowShareSelector(false);
    } else if (action.id === 'share') {
      setShowShareSelector(true);
      setShowProposalSelector(false);
    } else {
      onActionClick?.(action);
    }
  };

  // Streaming effect
  useEffect(() => {
    if (message.isStreaming) {
      let index = 0;
      const interval = setInterval(() => {
        setDisplayedContent(message.content.slice(0, index));
        index++;
        if (index > message.content.length) {
          clearInterval(interval);
        }
      }, 15);
      return () => clearInterval(interval);
    } else {
      setDisplayedContent(message.content);
    }
  }, [message.content, message.isStreaming]);

  // Simple markdown rendering - compact version
  const renderMarkdown = (content: string) => {
    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];

    lines.forEach((line, i) => {
      // Headers
      if (line.startsWith('### ')) {
        elements.push(
          <h3 key={i} className="text-sm font-semibold text-gray-900 dark:text-gray-100 mt-3 mb-1">
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith('## ')) {
        elements.push(
          <h2 key={i} className="text-base font-semibold text-gray-900 dark:text-gray-100 mt-3 mb-1">
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith('# ')) {
        elements.push(
          <h1 key={i} className="text-lg font-bold text-gray-900 dark:text-gray-100 mt-3 mb-1">
            {line.slice(2)}
          </h1>
        );
      }
      // Bold text with **
      else if (line.includes('**')) {
        const parts = line.split(/\*\*(.+?)\*\*/g);
        elements.push(
          <p key={i} className="text-xs text-gray-700 dark:text-gray-300 mb-1">
            {parts.map((part, j) =>
              j % 2 === 1 ? (
                <strong key={j} className="font-semibold text-gray-900 dark:text-gray-100">
                  {part}
                </strong>
              ) : (
                part
              )
            )}
          </p>
        );
      }
      // List items
      else if (line.match(/^[\d]+\./)) {
        elements.push(
          <p key={i} className="text-xs text-gray-700 dark:text-gray-300 mb-0.5 pl-3">
            {line}
          </p>
        );
      } else if (line.startsWith('- ')) {
        elements.push(
          <p key={i} className="text-xs text-gray-700 dark:text-gray-300 mb-0.5 pl-3">
            {'\u2022'} {line.slice(2)}
          </p>
        );
      }
      // Empty lines
      else if (line.trim() === '') {
        elements.push(<div key={i} className="h-1" />);
      }
      // Regular text
      else {
        elements.push(
          <p key={i} className="text-xs text-gray-700 dark:text-gray-300 mb-1">
            {line}
          </p>
        );
      }
    });

    return elements;
  };

  // Deduplicate suggestions
  const uniqueSuggestions = message.suggestions
    ? [...new Set(message.suggestions)]
    : [];

  return (
    <div className={cn('flex items-start gap-1.5 sm:gap-2', className)}>
      {/* AI Avatar - compact & responsive */}
      <div
        className={cn(
          'flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full',
          'bg-[#5B50BD] dark:bg-[#918AD3]',
          'flex items-center justify-center',
          'mt-0.5'
        )}
      >
        <Brain className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white dark:text-[#100E28]" />
      </div>

      {/* Content - Direct typing style without card */}
      <div className="flex-1 min-w-0 max-w-[95%] sm:max-w-[90%]">
        {/* Header with confidence - inline */}
        {message.confidence !== undefined && (
          <div className="flex items-center gap-2 mb-1">
            <ConfidenceBadge level={message.confidence} size="sm" />
          </div>
        )}

        {/* Text content with markdown - direct typing */}
        <div className="prose-sm max-w-none">
          {renderMarkdown(displayedContent)}
        </div>

        {/* Streaming cursor */}
        {message.isStreaming && (
          <span className="inline-block w-1.5 h-3 bg-[#5B50BD] dark:bg-[#918AD3] rounded-sm ml-0.5 animate-pulse" />
        )}

        {/* Tables - with subtle card styling */}
        {!message.isStreaming && message.tables && message.tables.length > 0 && (
          <div className="mt-3 space-y-3">
            {message.tables.map((table) => (
              <DataTable
                key={table.id}
                title={table.title}
                headers={table.headers}
                rows={table.rows}
              />
            ))}
          </div>
        )}

        {/* Insights - with subtle card styling */}
        {!message.isStreaming && message.insights && message.insights.length > 0 && (
          <div className="mt-3 space-y-3">
            {message.insights.map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onActionClick={onActionClick}
              />
            ))}
          </div>
        )}

        {/* Sources */}
        {!message.isStreaming && message.sources && message.sources.length > 0 && (
          <div className="mt-3 pt-2 border-t border-gray-200/50 dark:border-gray-700/50">
            <SourceCitation
              sources={message.sources}
              onSourceClick={onSourceClick}
            />
          </div>
        )}

        {/* Actions */}
        {!message.isStreaming && message.actions && message.actions.length > 0 && (
          <div className="mt-3">
            <ActionBar
              actions={message.actions.map(action => ({
                ...action,
                onClick: () => handleActionClick(action),
              }))}
            />
          </div>
        )}

        {/* Inline Proposal Selector */}
        {showProposalSelector && (
          <ProposalSelector
            content={message.content}
            onClose={() => setShowProposalSelector(false)}
            className="mt-3"
          />
        )}

        {/* Inline Share Selector */}
        {showShareSelector && (
          <ShareSelector
            content={message.content}
            onClose={() => setShowShareSelector(false)}
            className="mt-3"
          />
        )}

        {/* Timestamp */}
        <time className="block text-[10px] text-gray-500 dark:text-gray-400 mt-2">
          {new Date(message.timestamp).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </time>

        {/* Follow-up suggestions - deduplicated */}
        {!message.isStreaming && uniqueSuggestions.length > 0 && onSuggestionClick && (
          <div className="mt-2">
            <SuggestionPills
              suggestions={uniqueSuggestions}
              onSelect={onSuggestionClick}
              layout="horizontal"
            />
          </div>
        )}
      </div>
    </div>
  );
}
