'use client';

import { useState } from 'react';
import {
  X,
  ChevronRight,
  Settings,
  Users,
  FileText,
  Link as LinkIcon,
  Upload,
  Trash2,
  MoreHorizontal,
  Plus,
  Edit2,
  UserPlus,
  Archive,
  Pin,
  PinOff,
  ExternalLink,
  Download,
  MessageSquare,
  Clock,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { ChatProject, ProjectFile, ProjectCollaborator, ProposalRef } from '@/types';
import { format, formatDistanceToNow } from 'date-fns';

interface ProjectSidebarProps {
  project: ChatProject;
  isOpen: boolean;
  onClose: () => void;
}

type Tab = 'details' | 'files' | 'collaborators' | 'proposals';

export function ProjectSidebar({ project, isOpen, onClose }: ProjectSidebarProps) {
  const {
    updateChatProject,
    deleteChatProject,
    archiveChatProject,
    pinChatProject,
    unpinChatProject,
    deleteProjectFile,
    removeProjectCollaborator,
    unlinkProposalFromChatProject,
    setActiveSection,
    setCurrentProposal,
    proposals,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<Tab>('details');
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(project.name);
  const [editDescription, setEditDescription] = useState(project.description || '');
  const [editInstructions, setEditInstructions] = useState(project.instructions);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleSaveDetails = () => {
    updateChatProject(project.id, {
      name: editName.trim(),
      description: editDescription.trim() || undefined,
      instructions: editInstructions.trim(),
    });
    setIsEditing(false);
  };

  const handleDeleteProject = () => {
    deleteChatProject(project.id);
    onClose();
  };

  const handleTogglePin = () => {
    if (project.isPinned) {
      unpinChatProject(project.id);
    } else {
      pinChatProject(project.id);
    }
  };

  const handleArchive = () => {
    archiveChatProject(project.id);
    onClose();
  };

  const handleViewProposal = (proposalId: string) => {
    const proposal = proposals.find((p) => p.id === proposalId);
    if (proposal) {
      setCurrentProposal(proposal);
      setActiveSection('view-proposal');
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document':
        return '📄';
      case 'image':
        return '🖼️';
      case 'data':
        return '📊';
      default:
        return '📎';
    }
  };

  const renderDetailsTab = () => (
    <div className="space-y-6">
      {/* Project Info */}
      <div className="space-y-4">
        {isEditing ? (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Name
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]/50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]/50 resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instructions
              </label>
              <textarea
                value={editInstructions}
                onChange={(e) => setEditInstructions(e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]/50 resize-none"
                rows={4}
              />
            </div>
            <div className="flex gap-2">
              <button
                onClick={handleSaveDetails}
                className="flex-1 px-3 py-2 bg-[#5B50BD] text-white text-sm rounded-lg hover:bg-[#4A41A0] transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditName(project.name);
                  setEditDescription(project.description || '');
                  setEditInstructions(project.instructions);
                }}
                className="px-3 py-2 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white">{project.name}</h3>
                <p className="text-sm text-gray-500 mt-1">
                  {project.description || 'No description'}
                </p>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            {project.instructions && (
              <div className="p-3 bg-[#5B50BD]/5 border border-[#5B50BD]/20 rounded-lg">
                <p className="text-xs font-medium text-[#5B50BD] mb-1">Instructions</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{project.instructions}</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <MessageSquare className="w-4 h-4" />
            <span className="text-xs">Conversations</span>
          </div>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {project.conversations.length}
          </p>
        </div>
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
          <div className="flex items-center gap-2 text-gray-500 mb-1">
            <Clock className="w-4 h-4" />
            <span className="text-xs">Last Activity</span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white">
            {formatDistanceToNow(new Date(project.lastActivityAt), { addSuffix: true })}
          </p>
        </div>
      </div>

      {/* Created/Updated */}
      <div className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Created</span>
          <span className="text-gray-700 dark:text-gray-300">
            {format(new Date(project.createdAt), 'MMM d, yyyy')}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-500">Owner</span>
          <span className="text-gray-700 dark:text-gray-300">{project.owner.name}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          onClick={handleTogglePin}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          {project.isPinned ? (
            <>
              <PinOff className="w-4 h-4" />
              Unpin Project
            </>
          ) : (
            <>
              <Pin className="w-4 h-4" />
              Pin Project
            </>
          )}
        </button>
        <button
          onClick={handleArchive}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <Archive className="w-4 h-4" />
          Archive Project
        </button>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete Project
        </button>
      </div>

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-sm text-red-600 dark:text-red-400 mb-3">
            Are you sure you want to delete this project? This action cannot be undone.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleDeleteProject}
              className="flex-1 px-3 py-2 bg-red-500 text-white text-sm rounded-lg hover:bg-red-600 transition-colors"
            >
              Delete
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              className="px-3 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );

  const renderFilesTab = () => (
    <div className="space-y-4">
      {/* Upload Button */}
      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:border-[#5B50BD] hover:text-[#5B50BD] transition-colors">
        <Upload className="w-4 h-4" />
        Upload files
      </button>

      {/* Files List */}
      {project.files.length > 0 ? (
        <div className="space-y-2">
          {project.files.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg group"
            >
              <span className="text-xl">{getFileIcon(file.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatFileSize(file.size)} • {formatDistanceToNow(new Date(file.uploadedAt), { addSuffix: true })}
                </p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                <button className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors">
                  <Download className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => deleteProjectFile(project.id, file.id)}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <FileText className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No files uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Upload files to build your knowledge base
          </p>
        </div>
      )}
    </div>
  );

  const renderCollaboratorsTab = () => (
    <div className="space-y-4">
      {/* Add Collaborator Button */}
      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:border-[#5B50BD] hover:text-[#5B50BD] transition-colors">
        <UserPlus className="w-4 h-4" />
        Add collaborator
      </button>

      {/* Owner */}
      <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#5B50BD] flex items-center justify-center text-white text-sm font-medium">
            {project.owner.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {project.owner.name}
            </p>
            <p className="text-xs text-gray-500">{project.owner.email}</p>
          </div>
          <span className="px-2 py-1 bg-[#5B50BD]/10 text-[#5B50BD] text-xs font-medium rounded">
            Owner
          </span>
        </div>
      </div>

      {/* Collaborators List */}
      {project.collaborators.length > 0 ? (
        <div className="space-y-2">
          {project.collaborators.map((collaborator) => (
            <div
              key={collaborator.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg group"
            >
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gray-300 dark:bg-gray-600 flex items-center justify-center text-gray-700 dark:text-gray-300 text-sm font-medium">
                  {collaborator.user.name.charAt(0)}
                </div>
                <span
                  className={cn(
                    'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white dark:border-gray-800',
                    collaborator.status === 'online' && 'bg-green-500',
                    collaborator.status === 'away' && 'bg-yellow-500',
                    collaborator.status === 'offline' && 'bg-gray-400'
                  )}
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {collaborator.user.name}
                </p>
                <p className="text-xs text-gray-500">
                  {collaborator.status === 'online'
                    ? 'Active now'
                    : `Last seen ${formatDistanceToNow(new Date(collaborator.lastActiveAt), { addSuffix: true })}`}
                </p>
              </div>
              <span
                className={cn(
                  'px-2 py-1 text-xs font-medium rounded',
                  collaborator.role === 'editor'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
                    : 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                )}
              >
                {collaborator.role}
              </span>
              <button
                onClick={() => removeProjectCollaborator(project.id, collaborator.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <Users className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No collaborators yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Invite team members to collaborate
          </p>
        </div>
      )}
    </div>
  );

  const renderProposalsTab = () => (
    <div className="space-y-4">
      {/* Link Proposal Button */}
      <button className="w-full flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg text-gray-500 hover:border-[#5B50BD] hover:text-[#5B50BD] transition-colors">
        <LinkIcon className="w-4 h-4" />
        Link proposal
      </button>

      {/* Linked Proposals List */}
      {project.proposals.length > 0 ? (
        <div className="space-y-2">
          {project.proposals.map((proposal) => (
            <div
              key={proposal.id}
              className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg group cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => handleViewProposal(proposal.id)}
            >
              <div className="w-8 h-8 rounded-lg bg-[#5B50BD]/10 flex items-center justify-center">
                <FileText className="w-4 h-4 text-[#5B50BD]" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {proposal.title}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={cn(
                      'px-1.5 py-0.5 text-xs font-medium rounded capitalize',
                      (proposal.status === 'client_approved' || proposal.status === 'manager_approved') && 'bg-[#1ED6BB]/10 text-[#1ED6BB]',
                      (proposal.status === 'pending_manager' || proposal.status === 'pending_client') && 'bg-amber-100 text-amber-700',
                      proposal.status === 'draft' && 'bg-gray-100 text-gray-600',
                      (proposal.status === 'client_rejected' || proposal.status === 'manager_rejected') && 'bg-red-100 text-red-600'
                    )}
                  >
                    {proposal.status.replace(/_/g, ' ')}
                  </span>
                  <span className="text-xs text-gray-400">
                    Linked {formatDistanceToNow(new Date(proposal.linkedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewProposal(proposal.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-[#5B50BD] hover:bg-[#5B50BD]/10 rounded transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    unlinkProposalFromChatProject(project.id, proposal.id);
                  }}
                  className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 text-center">
          <LinkIcon className="w-10 h-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm text-gray-500">No linked proposals</p>
          <p className="text-xs text-gray-400 mt-1">
            Connect proposals to this project
          </p>
        </div>
      )}
    </div>
  );

  if (!isOpen) return null;

  return (
    <div className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="font-semibold text-gray-900 dark:text-white">Project Details</h3>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700">
        {[
          { id: 'details' as Tab, label: 'Details', icon: Settings },
          { id: 'files' as Tab, label: 'Files', icon: FileText, count: project.files.length },
          { id: 'collaborators' as Tab, label: 'Team', icon: Users, count: project.collaborators.length },
          { id: 'proposals' as Tab, label: 'Proposals', icon: LinkIcon, count: project.proposals.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-2 py-2.5 text-xs font-medium transition-colors relative',
              activeTab === tab.id
                ? 'text-[#5B50BD]'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.count !== undefined && tab.count > 0 && (
              <span className="w-4 h-4 text-[10px] bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                {tab.count}
              </span>
            )}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B50BD]" />
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        {activeTab === 'details' && renderDetailsTab()}
        {activeTab === 'files' && renderFilesTab()}
        {activeTab === 'collaborators' && renderCollaboratorsTab()}
        {activeTab === 'proposals' && renderProposalsTab()}
      </div>
    </div>
  );
}
