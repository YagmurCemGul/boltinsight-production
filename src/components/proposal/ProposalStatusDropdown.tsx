'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, Clock, Send, UserCheck, UserX, Users, Pause, RotateCcw, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Proposal, ProposalStatus, User } from '@/types';

interface ProposalStatusDropdownProps {
  proposal: Proposal;
  currentUser: User;
  onSubmitToManager: (managerId: string, comment?: string) => void;
  onManagerApprove: (comment?: string) => void;
  onManagerReject: (comment: string) => void;
  onSubmitToClient: (clientEmail: string, comment?: string) => void;
  onClientApprove: (comment?: string) => void;
  onClientReject: (comment: string) => void;
  onPutOnHold: (comment: string) => void;
  onRequestRevision: (comment: string) => void;
  onReopen: () => void;
  compact?: boolean;
  managers?: User[];
}

// Status colors and labels
const STATUS_CONFIG: Record<ProposalStatus, {
  bg: string;
  text: string;
  border: string;
  label: string;
  icon: React.ReactNode;
}> = {
  draft: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-700 dark:text-gray-300',
    border: 'border-gray-300 dark:border-gray-600',
    label: 'Draft',
    icon: <Clock className="w-3.5 h-3.5" />
  },
  pending_manager: {
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    text: 'text-yellow-700 dark:text-yellow-400',
    border: 'border-yellow-300 dark:border-yellow-600',
    label: 'Pending Manager',
    icon: <Send className="w-3.5 h-3.5" />
  },
  manager_approved: {
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-700 dark:text-blue-400',
    border: 'border-blue-300 dark:border-blue-600',
    label: 'Manager Approved',
    icon: <UserCheck className="w-3.5 h-3.5" />
  },
  manager_rejected: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-600',
    label: 'Manager Rejected',
    icon: <UserX className="w-3.5 h-3.5" />
  },
  pending_client: {
    bg: 'bg-purple-50 dark:bg-purple-900/20',
    text: 'text-purple-700 dark:text-purple-400',
    border: 'border-purple-300 dark:border-purple-600',
    label: 'Pending Client',
    icon: <Users className="w-3.5 h-3.5" />
  },
  client_approved: {
    bg: 'bg-green-50 dark:bg-green-900/20',
    text: 'text-green-700 dark:text-green-400',
    border: 'border-green-300 dark:border-green-600',
    label: 'Client Approved',
    icon: <Check className="w-3.5 h-3.5" />
  },
  client_rejected: {
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-700 dark:text-red-400',
    border: 'border-red-300 dark:border-red-600',
    label: 'Client Rejected',
    icon: <UserX className="w-3.5 h-3.5" />
  },
  on_hold: {
    bg: 'bg-orange-50 dark:bg-orange-900/20',
    text: 'text-orange-700 dark:text-orange-400',
    border: 'border-orange-300 dark:border-orange-600',
    label: 'On Hold',
    icon: <Pause className="w-3.5 h-3.5" />
  },
  revisions_needed: {
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-700 dark:text-amber-400',
    border: 'border-amber-300 dark:border-amber-600',
    label: 'Revisions Needed',
    icon: <AlertCircle className="w-3.5 h-3.5" />
  },
  deleted: {
    bg: 'bg-gray-100 dark:bg-gray-800',
    text: 'text-gray-400 dark:text-gray-500',
    border: 'border-gray-200 dark:border-gray-700',
    label: 'Deleted',
    icon: <Clock className="w-3.5 h-3.5" />
  },
};

// Available actions based on current status and user role
function getAvailableActions(status: ProposalStatus, userRole: User['role']): Array<{
  key: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  requiresComment?: boolean;
  requiresManager?: boolean;
  requiresClientEmail?: boolean;
}> {
  const isManager = userRole === 'manager' || userRole === 'admin';
  const canEdit = userRole !== 'viewer';

  const actions: Array<{
    key: string;
    label: string;
    description: string;
    icon: React.ReactNode;
    requiresComment?: boolean;
    requiresManager?: boolean;
    requiresClientEmail?: boolean;
  }> = [];

  switch (status) {
    case 'draft':
    case 'revisions_needed':
      if (canEdit) {
        actions.push({
          key: 'submit_to_manager',
          label: 'Submit to Manager',
          description: 'Send for manager approval',
          icon: <Send className="w-4 h-4" />,
          requiresManager: true,
        });
      }
      break;

    case 'pending_manager':
      if (isManager) {
        actions.push(
          {
            key: 'manager_approve',
            label: 'Approve',
            description: 'Approve this proposal',
            icon: <Check className="w-4 h-4 text-green-600" />,
          },
          {
            key: 'manager_reject',
            label: 'Reject',
            description: 'Reject with feedback',
            icon: <UserX className="w-4 h-4 text-red-600" />,
            requiresComment: true,
          },
          {
            key: 'request_revision',
            label: 'Request Revision',
            description: 'Request changes from author',
            icon: <RotateCcw className="w-4 h-4 text-amber-600" />,
            requiresComment: true,
          },
          {
            key: 'put_on_hold',
            label: 'Put on Hold',
            description: 'Pause the approval process',
            icon: <Pause className="w-4 h-4 text-orange-600" />,
            requiresComment: true,
          }
        );
      }
      break;

    case 'manager_approved':
      if (canEdit) {
        actions.push({
          key: 'submit_to_client',
          label: 'Send to Client',
          description: 'Submit for client approval',
          icon: <Users className="w-4 h-4 text-purple-600" />,
          requiresClientEmail: true,
        });
      }
      if (isManager) {
        actions.push({
          key: 'put_on_hold',
          label: 'Put on Hold',
          description: 'Pause before sending to client',
          icon: <Pause className="w-4 h-4 text-orange-600" />,
          requiresComment: true,
        });
      }
      break;

    case 'pending_client':
      // Simulate client actions (in real app, these would be for client users)
      if (canEdit) {
        actions.push(
          {
            key: 'client_approve',
            label: 'Client Approved',
            description: 'Mark as approved by client',
            icon: <Check className="w-4 h-4 text-green-600" />,
          },
          {
            key: 'client_reject',
            label: 'Client Rejected',
            description: 'Mark as rejected by client',
            icon: <UserX className="w-4 h-4 text-red-600" />,
            requiresComment: true,
          }
        );
      }
      break;

    case 'manager_rejected':
    case 'client_rejected':
    case 'on_hold':
      if (canEdit) {
        actions.push({
          key: 'reopen',
          label: 'Reopen as Draft',
          description: 'Return to draft for editing',
          icon: <RotateCcw className="w-4 h-4 text-gray-600" />,
        });
      }
      break;

    case 'client_approved':
      // Final state - no actions available
      break;
  }

  return actions;
}

export function ProposalStatusDropdown({
  proposal,
  currentUser,
  onSubmitToManager,
  onManagerApprove,
  onManagerReject,
  onSubmitToClient,
  onClientApprove,
  onClientReject,
  onPutOnHold,
  onRequestRevision,
  onReopen,
  compact = false,
  managers = [],
}: ProposalStatusDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showActionModal, setShowActionModal] = useState<string | null>(null);
  const [comment, setComment] = useState('');
  const [selectedManagerId, setSelectedManagerId] = useState('');
  const [clientEmail, setClientEmail] = useState(proposal.content.contact || '');
  const dropdownRef = useRef<HTMLDivElement>(null);

  const status = proposal.status;
  const config = STATUS_CONFIG[status];
  const actions = getAvailableActions(status, currentUser.role);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (actionKey: string) => {
    const action = actions.find(a => a.key === actionKey);
    if (!action) return;

    if (action.requiresComment || action.requiresManager || action.requiresClientEmail) {
      setShowActionModal(actionKey);
      setIsOpen(false);
    } else {
      executeAction(actionKey);
    }
  };

  const executeAction = (actionKey: string, actionComment?: string) => {
    switch (actionKey) {
      case 'submit_to_manager':
        if (selectedManagerId) {
          onSubmitToManager(selectedManagerId, actionComment);
        }
        break;
      case 'manager_approve':
        onManagerApprove(actionComment);
        break;
      case 'manager_reject':
        if (actionComment) onManagerReject(actionComment);
        break;
      case 'submit_to_client':
        if (clientEmail) onSubmitToClient(clientEmail, actionComment);
        break;
      case 'client_approve':
        onClientApprove(actionComment);
        break;
      case 'client_reject':
        if (actionComment) onClientReject(actionComment);
        break;
      case 'put_on_hold':
        if (actionComment) onPutOnHold(actionComment);
        break;
      case 'request_revision':
        if (actionComment) onRequestRevision(actionComment);
        break;
      case 'reopen':
        onReopen();
        break;
    }
    setShowActionModal(null);
    setComment('');
    setSelectedManagerId('');
    setIsOpen(false);
  };

  const handleModalSubmit = () => {
    if (!showActionModal) return;

    const action = actions.find(a => a.key === showActionModal);
    if (action?.requiresComment && !comment.trim()) return;
    if (action?.requiresManager && !selectedManagerId) return;
    if (action?.requiresClientEmail && !clientEmail.trim()) return;

    executeAction(showActionModal, comment);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Status Badge Button */}
      <button
        onClick={() => actions.length > 0 && setIsOpen(!isOpen)}
        disabled={actions.length === 0}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-md border transition-colors',
          config.bg,
          config.text,
          config.border,
          actions.length > 0 ? 'cursor-pointer hover:opacity-80' : 'cursor-default',
          compact && 'px-2 py-0.5 text-xs'
        )}
      >
        {config.icon}
        <span className={cn('font-medium', compact ? 'text-xs' : 'text-sm')}>
          {config.label}
        </span>
        {actions.length > 0 && (
          <ChevronDown className={cn(
            'transition-transform',
            isOpen && 'rotate-180',
            compact ? 'w-3 h-3' : 'w-4 h-4'
          )} />
        )}
      </button>

      {/* Dropdown Menu */}
      {isOpen && actions.length > 0 && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 py-1 z-50">
          <div className="px-3 py-2 border-b border-gray-100 dark:border-gray-700">
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              Available Actions
            </p>
          </div>
          {actions.map((action) => (
            <button
              key={action.key}
              onClick={() => handleAction(action.key)}
              className="w-full flex items-start gap-3 px-3 py-2 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors text-left"
            >
              <div className="mt-0.5">{action.icon}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.label}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {action.description}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Action Modal */}
      {showActionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100]">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md mx-4 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {actions.find(a => a.key === showActionModal)?.label}
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {/* Manager Selection */}
              {showActionModal === 'submit_to_manager' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Manager
                  </label>
                  <select
                    value={selectedManagerId}
                    onChange={(e) => setSelectedManagerId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#5B50BD] focus:border-transparent"
                  >
                    <option value="">Choose a manager...</option>
                    {managers.filter(m => m.role === 'manager' || m.role === 'admin').map((manager) => (
                      <option key={manager.id} value={manager.id}>
                        {manager.name} ({manager.email})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Client Email */}
              {showActionModal === 'submit_to_client' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Client Email
                  </label>
                  <input
                    type="email"
                    value={clientEmail}
                    onChange={(e) => setClientEmail(e.target.value)}
                    placeholder="client@company.com"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#5B50BD] focus:border-transparent"
                  />
                </div>
              )}

              {/* Comment Field */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {actions.find(a => a.key === showActionModal)?.requiresComment
                    ? 'Comment (required)'
                    : 'Note (optional)'}
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Add a note or explanation..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-[#5B50BD] focus:border-transparent resize-none"
                />
              </div>
            </div>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowActionModal(null);
                  setComment('');
                  setSelectedManagerId('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleModalSubmit}
                disabled={
                  (actions.find(a => a.key === showActionModal)?.requiresComment && !comment.trim()) ||
                  (actions.find(a => a.key === showActionModal)?.requiresManager && !selectedManagerId) ||
                  (actions.find(a => a.key === showActionModal)?.requiresClientEmail && !clientEmail.trim())
                }
                className="px-4 py-2 text-sm font-medium text-white bg-[#5B50BD] hover:bg-[#4A41A0] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Simple status badge (read-only)
export function StatusBadge({ status, compact = false }: { status: ProposalStatus; compact?: boolean }) {
  const config = STATUS_CONFIG[status];

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 px-2 py-0.5 rounded-md border',
        config.bg,
        config.text,
        config.border,
        compact ? 'text-xs' : 'text-sm'
      )}
    >
      {config.icon}
      <span className="font-medium">{config.label}</span>
    </span>
  );
}

// Export status config for use elsewhere
export { STATUS_CONFIG };
