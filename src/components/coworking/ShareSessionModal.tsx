'use client';

import { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { X, Link2, Copy, Check, Send, Loader2, Trash2, ChevronDown, Search, UserPlus } from 'lucide-react';
import { toast } from '@/components/ui';
import { CollaboratorAvatar } from './CoworkingHeader';
import type { CoworkingSession, AccessLevel, CollaboratorRole } from '@/types';

interface ShareSessionModalProps {
  session: CoworkingSession;
  onClose: () => void;
  onGenerateLink: () => string;
  onUpdateAccessLevel: (level: AccessLevel) => void;
  onInviteByEmail: (email: string, role: CollaboratorRole) => void;
  onRemoveCollaborator: (collaboratorId: string) => void;
  className?: string;
}

export function ShareSessionModal({
  session,
  onClose,
  onGenerateLink,
  onUpdateAccessLevel,
  onInviteByEmail,
  onRemoveCollaborator,
  className,
}: ShareSessionModalProps) {
  const [copied, setCopied] = useState(false);
  const [shareLink, setShareLink] = useState(session.shareLink || '');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<CollaboratorRole>('viewer');
  const [isSending, setIsSending] = useState(false);


const [teamDropdownOpen, setTeamDropdownOpen] = useState(false);
const [teamSearchQuery, setTeamSearchQuery] = useState('');
const [teamMemberRole, setTeamMemberRole] = useState<CollaboratorRole>('editor');
const teamDropdownRef = useRef<HTMLDivElement>(null);

// Mock team members - bunu store'dan çekebilirsin
const teamMembers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', avatar: null },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', avatar: null },
  { id: '3', name: 'Mike Johnson', email: 'mike@example.com', avatar: null },
  { id: '4', name: 'Sarah Wilson', email: 'sarah@example.com', avatar: null },
];

const filteredTeamMembers = teamMembers.filter(member =>
  member.name.toLowerCase().includes(teamSearchQuery.toLowerCase()) ||
  member.email.toLowerCase().includes(teamSearchQuery.toLowerCase())
);
useEffect(() => {
  const handleClickOutside = (e: MouseEvent) => {
    if (teamDropdownRef.current && !teamDropdownRef.current.contains(e.target as Node)) {
      setTeamDropdownOpen(false);
    }
  };
  if (teamDropdownOpen) {
    document.addEventListener('mousedown', handleClickOutside);
  }
  return () => document.removeEventListener('mousedown', handleClickOutside);
}, [teamDropdownOpen]);

  const handleGenerateLink = () => {
    const link = onGenerateLink();
    setShareLink(link);
  };

  const handleCopyLink = async () => {
    if (!shareLink) {
      handleGenerateLink();
    }
    try {
      await navigator.clipboard.writeText(shareLink || onGenerateLink());
      setCopied(true);
      toast.success('Link copied', 'Share link copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed', 'Could not copy to clipboard');
    }
  };

  const handleSendInvite = async () => {
    if (!inviteEmail.trim()) {
      toast.error('Error', 'Please enter an email address');
      return;
    }

    setIsSending(true);
    // Simulate sending invite
    await new Promise(resolve => setTimeout(resolve, 1000));
    onInviteByEmail(inviteEmail.trim(), inviteRole);
    setIsSending(false);
    setInviteEmail('');
    toast.success('Invite sent', `Invitation sent to ${inviteEmail}`);
  };

  const accessLevelOptions: { value: AccessLevel; label: string; description: string }[] = [
    { value: 'private', label: 'Private', description: 'Only you can access' },
    { value: 'link', label: 'Anyone with link', description: 'Anyone with the link can view' },
    { value: 'team', label: 'Team access', description: 'All team members can access' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={cn(
        'relative w-full max-w-md mx-4',
        'bg-white dark:bg-[#1F2937] rounded-xl shadow-xl',
        'animate-in zoom-in-95 duration-200',
        'overflow-hidden',
        className
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Share Session
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Share Link */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Share link
            </label>
            <div className="flex gap-2">
              <div className={cn(
                'flex-1 flex items-center gap-2 px-3 py-2 rounded-lg min-w-0',
                'bg-gray-100 dark:bg-gray-800',
                'border border-gray-200 dark:border-gray-700',
                'overflow-hidden'
              )}>
                <Link2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                <span className="text-sm text-gray-600 dark:text-gray-400 truncate block">
                  {shareLink || 'Click to generate link'}
                </span>
              </div>
              <button
                onClick={handleCopyLink}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium flex-shrink-0',
                  'flex items-center gap-1.5',
                  copied
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-[#5B50BD] text-white hover:bg-[#4A41A0] dark:bg-[#918AD3] dark:text-[#100E28]'
                )}
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
            </div>
          </div>

          {/* Access Level */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Access level
            </label>
            <div className="space-y-2">
              {accessLevelOptions.map((option) => (
                <label
                  key={option.value}
                  className={cn(
                    'flex items-start gap-3 p-3 rounded-lg cursor-pointer',
                    'border transition-colors',
                    session.accessLevel === option.value
                      ? 'border-[#5B50BD] bg-[#5B50BD]/5 dark:border-[#918AD3] dark:bg-[#918AD3]/5'
                      : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                  )}
                >
                  <input
                    type="radio"
                    name="accessLevel"
                    value={option.value}
                    checked={session.accessLevel === option.value}
                    onChange={() => onUpdateAccessLevel(option.value)}
                    className="mt-0.5 accent-[#5B50BD]"
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {option.label}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {option.description}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </div>
{/* Add Team Members - Custom Dropdown */}
<div className="space-y-2">
  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
    Add team members
  </label>
  <div className="flex gap-2">
    <div className="relative flex-1" ref={teamDropdownRef}>
    {/* Dropdown Trigger */}
    <button
      type="button"
      onClick={() => setTeamDropdownOpen(!teamDropdownOpen)}
      className={cn(
        'w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm',
        'border border-gray-200 dark:border-gray-700',
        'bg-white dark:bg-gray-800',
        'text-gray-500 dark:text-gray-400',
        'hover:border-gray-300 dark:hover:border-gray-600',
        'focus:outline-none focus:ring-2 focus:ring-[#5B50BD]/20 focus:border-[#5B50BD]'
      )}
    >
      <span className="flex items-center gap-2">
        <UserPlus className="w-4 h-4" />
        Select team member...
      </span>
      <ChevronDown className={cn('w-4 h-4 transition-transform', teamDropdownOpen && 'rotate-180')} />
    </button>

    {/* Dropdown Menu */}
    {teamDropdownOpen && (
      <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden">
        {/* Search Input */}
        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={teamSearchQuery}
              onChange={(e) => setTeamSearchQuery(e.target.value)}
              placeholder="Search by name or email..."
              className={cn(
                'w-full pl-8 pr-3 py-1.5 rounded text-sm',
                'bg-gray-50 dark:bg-gray-900',
                'border border-gray-200 dark:border-gray-700',
                'text-gray-900 dark:text-white',
                'placeholder:text-gray-400',
                'focus:outline-none focus:ring-1 focus:ring-[#5B50BD]'
              )}
              autoFocus
            />
          </div>
        </div>


        {/* Team Members List */}
        <div className="max-h-[200px] overflow-y-auto">
          {filteredTeamMembers.length > 0 ? (
            filteredTeamMembers.map((member) => (
              <div key={member.id} className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700">
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-[#5B50BD] text-white flex items-center justify-center text-sm font-medium flex-shrink-0">
                  {member.name.charAt(0)}
                </div>
                {/* Name & Email */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{member.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{member.email}</p>
                </div>
                {/* Role Select */}
                <div className="relative flex-shrink-0">
                  <select
                    value={teamMemberRole}
                    onChange={(e) => setTeamMemberRole(e.target.value as CollaboratorRole)}
                    onClick={(e) => e.stopPropagation()}
                    className="appearance-none px-2 py-1 pr-6 rounded text-xs border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <ChevronDown className="absolute right-1 top-1/2 -translate-y-1/2 w-3 h-3 text-gray-400 pointer-events-none" />
                </div>
                {/* Add Button */}
                <button
                  type="button"
                  onClick={() => {
                    onInviteByEmail(member.email, teamMemberRole);
                    toast.success('Member added', `${member.name} added as ${teamMemberRole}`);
                    setTeamDropdownOpen(false);
                    setTeamSearchQuery('');
                  }}
                  className="px-2 py-1 rounded text-xs font-medium bg-[#5B50BD] text-white hover:bg-[#4A41A0]"
                >
                  Add
                </button>
              </div>

            ))
          ) : (
            <div className="px-3 py-4 text-center text-sm text-gray-500 dark:text-gray-400">
              No team members found
            </div>
          )}
        </div>
      </div>
    )}
  </div>
</div>
</div>

          {/* Invite by Email */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Invite by email
            </label>
            <div className="flex gap-2">
              <div className="flex-1 flex gap-2 min-w-0">
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="email@example.com"
                  disabled={isSending}
                  className={cn(
                    'flex-1 min-w-0 px-3 py-2 rounded-lg text-sm',
                    'border border-gray-200 dark:border-gray-700',
                    'bg-white dark:bg-gray-800',
                    'text-gray-900 dark:text-white',
                    'placeholder:text-gray-400',
                    'focus:outline-none focus:ring-2 focus:ring-[#5B50BD]/20 focus:border-[#5B50BD]',
                    'disabled:opacity-50'
                  )}
                />
                <div className="relative">
                  <select
                    value={inviteRole}
                    onChange={(e) => setInviteRole(e.target.value as CollaboratorRole)}
                    disabled={isSending}
                    className={cn(
                      'appearance-none px-3 py-2 pr-8 rounded-lg text-sm flex-shrink-0',
                      'border border-gray-200 dark:border-gray-700',
                      'bg-white dark:bg-gray-800',
                      'text-gray-900 dark:text-white',
                      'focus:outline-none focus:ring-2 focus:ring-[#5B50BD]/20',
                      'disabled:opacity-50'
                    )}
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

              </div>
              <button
                onClick={handleSendInvite}
                disabled={isSending || !inviteEmail.trim()}
                className={cn(
                  'px-3 py-2 rounded-lg text-sm font-medium flex-shrink-0',
                  'bg-[#5B50BD] text-white hover:bg-[#4A41A0]',
                  'dark:bg-[#918AD3] dark:text-[#100E28]',
                  'disabled:opacity-50 disabled:cursor-not-allowed',
                  'flex items-center gap-1.5'
                )}
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Collaborators List */}
          {session.collaborators.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Collaborators ({session.collaborators.length})
              </label>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {session.collaborators.map((collaborator) => (
                  <div
                    key={collaborator.id}
                    className={cn(
                      'flex items-center gap-3 p-2.5 rounded-lg',
                      'bg-gray-50 dark:bg-gray-800/50'
                    )}
                  >
                    <CollaboratorAvatar collaborator={collaborator} showStatus size="md" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {collaborator.user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {collaborator.user.email}
                      </p>
                    </div>
                    <span className={cn(
                      'px-2 py-0.5 rounded text-xs font-medium flex-shrink-0',
                      collaborator.role === 'owner'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : collaborator.role === 'editor'
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                    )}>
                      {collaborator.role}
                    </span>
                    {collaborator.role !== 'owner' && (
                      <button
                        onClick={() => onRemoveCollaborator(collaborator.id)}
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400 hover:text-red-500 flex-shrink-0"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
