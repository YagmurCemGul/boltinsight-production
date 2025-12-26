'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { MessageCircle, Send, Check, MoreHorizontal, Trash2, CheckCircle } from 'lucide-react';
import type { SessionComment, User } from '@/types';

interface SessionCommentsProps {
  comments: SessionComment[];
  messageId: string;
  currentUser: User;
  onAddComment: (content: string) => void;
  onResolveComment: (commentId: string, resolved: boolean) => void;
  onDeleteComment: (commentId: string) => void;
  className?: string;
}

export function SessionComments({
  comments,
  messageId,
  currentUser,
  onAddComment,
  onResolveComment,
  onDeleteComment,
  className,
}: SessionCommentsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [newComment, setNewComment] = useState('');

  const messageComments = comments.filter(c => c.messageId === messageId);
  const unresolvedCount = messageComments.filter(c => !c.resolved).length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newComment.trim()) {
      onAddComment(newComment.trim());
      setNewComment('');
    }
  };

  if (!isExpanded) {
    return (
      <button
        onClick={() => setIsExpanded(true)}
        className={cn(
          'flex items-center gap-1 text-xs',
          messageComments.length > 0
            ? 'text-[#5B50BD] dark:text-[#918AD3]'
            : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
          className
        )}
      >
        <MessageCircle className="w-3.5 h-3.5" />
        {messageComments.length > 0 && (
          <span className="font-medium">{messageComments.length}</span>
        )}
      </button>
    );
  }

  return (
    <div className={cn('space-y-2', className)}>
      {/* Comment Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(false)}
          className="flex items-center gap-1.5 text-xs text-[#5B50BD] dark:text-[#918AD3] font-medium"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          Comments ({messageComments.length})
        </button>
        {unresolvedCount > 0 && (
          <span className="text-xs text-amber-600 dark:text-amber-400">
            {unresolvedCount} unresolved
          </span>
        )}
      </div>

      {/* Comments List */}
      {messageComments.length > 0 && (
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {messageComments.map((comment) => (
            <CommentItem
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onResolve={(resolved) => onResolveComment(comment.id, resolved)}
              onDelete={() => onDeleteComment(comment.id)}
            />
          ))}
        </div>
      )}

      {/* Add Comment Form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          className={cn(
            'flex-1 px-3 py-1.5 rounded-lg text-xs',
            'border border-gray-200 dark:border-gray-700',
            'bg-white dark:bg-gray-800',
            'text-gray-900 dark:text-white',
            'placeholder:text-gray-400',
            'focus:outline-none focus:ring-1 focus:ring-[#5B50BD]/20 focus:border-[#5B50BD]'
          )}
        />
        <button
          type="submit"
          disabled={!newComment.trim()}
          className={cn(
            'p-1.5 rounded-lg',
            'bg-[#5B50BD] text-white dark:bg-[#918AD3] dark:text-[#100E28]',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'hover:bg-[#4A41A0] dark:hover:bg-[#A8A2DE]'
          )}
        >
          <Send className="w-3.5 h-3.5" />
        </button>
      </form>
    </div>
  );
}

// Individual Comment Item
interface CommentItemProps {
  comment: SessionComment;
  currentUser: User;
  onResolve: (resolved: boolean) => void;
  onDelete: () => void;
}

function CommentItem({ comment, currentUser, onResolve, onDelete }: CommentItemProps) {
  const [showMenu, setShowMenu] = useState(false);
  const isOwner = comment.author.id === currentUser.id;

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={cn(
      'p-2 rounded-lg',
      'bg-gray-50 dark:bg-gray-800/50',
      comment.resolved && 'opacity-60'
    )}>
      <div className="flex items-start gap-2">
        {/* Avatar */}
        <div className="flex-shrink-0 w-5 h-5 rounded-full bg-[#5B50BD] dark:bg-[#918AD3] flex items-center justify-center">
          <span className="text-[8px] font-medium text-white dark:text-[#100E28]">
            {comment.author.name.charAt(0).toUpperCase()}
          </span>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-xs font-medium text-gray-900 dark:text-white">
              {comment.author.name}
            </span>
            <span className="text-[10px] text-gray-400">
              {formatTime(comment.timestamp)}
            </span>
            {comment.resolved && (
              <CheckCircle className="w-3 h-3 text-green-500" />
            )}
          </div>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
            {comment.content}
          </p>
        </div>

        {/* Actions */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {showMenu && (
            <>
              <div
                className="fixed inset-0"
                onClick={() => setShowMenu(false)}
              />
              <div className={cn(
                'absolute right-0 top-6 z-10',
                'bg-white dark:bg-gray-800 rounded-lg shadow-lg',
                'border border-gray-200 dark:border-gray-700',
                'py-1 min-w-[120px]'
              )}>
                <button
                  onClick={() => {
                    onResolve(!comment.resolved);
                    setShowMenu(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Check className="w-3.5 h-3.5" />
                  {comment.resolved ? 'Unresolve' : 'Resolve'}
                </button>
                {isOwner && (
                  <button
                    onClick={() => {
                      onDelete();
                      setShowMenu(false);
                    }}
                    className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// Comment Button (for adding to messages)
interface CommentButtonProps {
  commentCount: number;
  onClick: () => void;
  className?: string;
}

export function CommentButton({ commentCount, onClick, className }: CommentButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex items-center gap-1 px-2 py-1 rounded text-xs transition-colors',
        commentCount > 0
          ? 'text-[#5B50BD] dark:text-[#918AD3] bg-[#5B50BD]/10 dark:bg-[#918AD3]/10'
          : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800',
        className
      )}
    >
      <MessageCircle className="w-3.5 h-3.5" />
      {commentCount > 0 && <span className="font-medium">{commentCount}</span>}
    </button>
  );
}
