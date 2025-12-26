'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { FileText, MoreVertical, Copy, Trash2, FolderInput, AlertTriangle, Brain, Calculator, MessageSquare, FolderKanban, Users, Pencil, Pin, Archive, ChevronRight, MoreHorizontal, PinOff, Upload, MessageCirclePlus, FolderPlus, X } from 'lucide-react';
import { cn, formatDate, getStatusColor, truncateText } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Badge, Dropdown, DropdownItem, DropdownSeparator, Modal, Select, Button, toast } from '@/components/ui';

// Mock data for different chat types
const mockMetaLearningChats = [
  { id: 'ml-1', title: 'Brand performance analysis', timestamp: '2025-12-24T10:00:00Z' },
  { id: 'ml-2', title: 'Competitor insights Q4', timestamp: '2025-12-23T15:30:00Z' },
  { id: 'ml-3', title: 'Market trends discussion', timestamp: '2025-12-22T09:00:00Z' },
];

const mockCalculatorChats = [
  { id: 'calc-1', title: 'Sample size calculation', timestamp: '2025-12-24T11:00:00Z' },
  { id: 'calc-2', title: 'Margin of error check', timestamp: '2025-12-21T14:00:00Z' },
];

const mockProjectChats = [
  { id: 'proj-1', title: 'Coca-Cola brand study', project: 'Coca-Cola 2024', timestamp: '2025-12-24T09:00:00Z' },
  { id: 'proj-2', title: 'Samsung mobile research', project: 'Samsung', timestamp: '2025-12-23T16:00:00Z' },
  { id: 'proj-3', title: 'Team sync - Q1 planning', project: 'U&A Studies', timestamp: '2025-12-22T11:00:00Z' },
];

interface HistoryListProps {
  onNavigate?: (section: string) => void;
}

export function HistoryList({ onNavigate }: HistoryListProps = {}) {
  const {
    proposals,
    projects,
    chatProjects,
    setCurrentProposal,
    setActiveSection,
    deleteProposal,
    moveProposalToProject,
    addProposal,
    currentUser,
    archivedHistoryItems,
    pinnedHistoryItems,
    archiveHistoryItem,
    pinHistoryItem,
    unpinHistoryItem,
  } = useAppStore();

  // Get non-archived chat projects for Move to project submenu
  const availableProjects = chatProjects.filter(p => !p.isArchived);

  // Use provided navigation handler or fall back to direct setActiveSection
  const navigateTo = onNavigate || setActiveSection;

  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [renameModalOpen, setRenameModalOpen] = useState(false);
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<{ id: string; type: string; title: string } | null>(null);
  const [targetProject, setTargetProject] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [itemMenuOpen, setItemMenuOpen] = useState<string | null>(null);
  const [showProjectSubmenu, setShowProjectSubmenu] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [sharedUsers, setSharedUsers] = useState<{ email: string; name: string; avatar?: string }[]>([]);
  const menuRef = useRef<HTMLDivElement>(null);

  // Create sets from store arrays for efficient lookups
  const pinnedItemsSet = new Set(pinnedHistoryItems);
  const archivedItemsSet = new Set(archivedHistoryItems.map(i => i.id));

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setItemMenuOpen(null);
        setShowProjectSubmenu(false);
      }
    };
    if (itemMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [itemMenuOpen]);

  // Handle coworking (share for collaboration)
  const handleCoworking = (item: { id: string; type: string; title: string }) => {
    setSelectedItem(item);
    setShareModalOpen(true);
    setItemMenuOpen(null);
  };

  // Add user to shared list
  const handleAddSharedUser = () => {
    if (shareEmail.trim() && !sharedUsers.find(u => u.email === shareEmail.trim())) {
      const name = shareEmail.split('@')[0];
      setSharedUsers([...sharedUsers, { email: shareEmail.trim(), name: name.charAt(0).toUpperCase() + name.slice(1) }]);
      setShareEmail('');
    }
  };

  // Remove user from shared list
  const handleRemoveSharedUser = (email: string) => {
    setSharedUsers(sharedUsers.filter(u => u.email !== email));
  };

  // Save share settings
  const handleSaveShare = () => {
    if (selectedItem) {
      toast.success('Shared', `"${selectedItem.title}" shared with ${sharedUsers.length} people`);
      setShareModalOpen(false);
      setSelectedItem(null);
      setSharedUsers([]);
    }
  };

  // Handle rename
  const openRenameModal = (item: { id: string; type: string; title: string }) => {
    setSelectedItem(item);
    setNewTitle(item.title);
    setRenameModalOpen(true);
    setItemMenuOpen(null);
  };

  const handleRename = () => {
    if (selectedItem && newTitle.trim()) {
      toast.success('Renamed', `Item renamed to "${newTitle}"`);
      setRenameModalOpen(false);
      setSelectedItem(null);
      setNewTitle('');
    }
  };

  // Handle pin toggle
  const handlePin = useCallback((item: { id: string; type: string; title: string }) => {
    if (pinnedItemsSet.has(item.id)) {
      unpinHistoryItem(item.id);
      toast.success('Unpinned', `"${item.title}" has been unpinned`);
    } else {
      pinHistoryItem(item.id);
      toast.success('Pinned', `"${item.title}" has been pinned`);
    }
    setItemMenuOpen(null);
  }, [pinnedItemsSet, pinHistoryItem, unpinHistoryItem]);

  // Handle archive
  const handleArchive = useCallback((item: { id: string; type: string; title: string }, timestamp: string) => {
    archiveHistoryItem({ ...item, timestamp });
    toast.success('Archived', `"${item.title}" has been archived`);
    setItemMenuOpen(null);
  }, [archiveHistoryItem]);

  // Handle delete for any item type
  const handleDeleteItem = (item: { id: string; type: string; title: string }) => {
    setSelectedItem(item);
    setItemMenuOpen(null);
    if (item.type === 'proposal') {
      setSelectedProposal(item.id);
      setDeleteModalOpen(true);
    } else {
      toast.success('Deleted', `"${item.title}" has been deleted`);
    }
  };

  // Handle move to project
  const handleMoveToProject = useCallback((item: { id: string; type: string; title: string }, projectId: string) => {
    const project = availableProjects.find(p => p.id === projectId);
    if (item.type === 'proposal') {
      moveProposalToProject(item.id, projectId);
    }
    toast.success('Moved', `"${item.title}" moved to "${project?.name || 'project'}"`);
    setItemMenuOpen(null);
    setShowProjectSubmenu(false);
  }, [availableProjects, moveProposalToProject]);

  // Filter out deleted proposals and sort by date
  const visibleProposals = proposals
    .filter((p) => p.status !== 'deleted')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

  const handleProposalClick = (proposal: typeof proposals[0]) => {
    setCurrentProposal(proposal);
    navigateTo('view-proposal');
  };

  const handleCopy = (proposal: typeof proposals[0]) => {
    addProposal({
      ...proposal,
      status: 'draft',
      code: undefined,
      content: {
        ...proposal.content,
        title: `${proposal.content.title} (Copy)`,
      },
      author: currentUser,
      sentToClient: false,
      approvalHistory: [],
      comments: [],
      collaborators: [],
    });
    toast.success('Proposal duplicated', 'A copy has been created as a draft.');
  };

  const openDeleteModal = (proposalId: string) => {
    setSelectedProposal(proposalId);
    setDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (selectedProposal) {
      deleteProposal(selectedProposal);
      setDeleteModalOpen(false);
      setSelectedProposal(null);
      toast.success('Proposal deleted', 'The proposal has been moved to trash.');
    }
  };

  const openMoveModal = (proposalId: string) => {
    setSelectedProposal(proposalId);
    setTargetProject('');
    setMoveModalOpen(true);
  };

  const handleMove = () => {
    if (selectedProposal && targetProject) {
      const project = projects.find(p => p.id === targetProject);
      moveProposalToProject(selectedProposal, targetProject);
      setMoveModalOpen(false);
      setSelectedProposal(null);
      setTargetProject('');
      toast.success('Proposal moved', `Moved to "${project?.name || 'project'}".`);
    }
  };

  const getStatusBadge = (proposal: typeof proposals[0]) => {
    if (proposal.sentToClient && proposal.code) {
      return (
        <span className="text-[10px] font-medium text-[#5B50BD] dark:text-[#918AD3]">{proposal.code}</span>
      );
    }
    return (
      <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500">Draft</span>
    );
  };

  // Check if an item is pinned
  const isItemPinned = useCallback((itemId: string) => pinnedItemsSet.has(itemId), [pinnedItemsSet]);

  // Handle creating new project
  const handleCreateNewProject = (itemInfo: { id: string; type: string; title: string }) => {
    toast.success('New project', 'Navigating to create new project');
    setItemMenuOpen(null);
    setShowProjectSubmenu(false);
    // Navigate to create new project
    navigateTo('chat-projects');
  };

  // Reusable context menu component
  const renderContextMenu = (itemInfo: { id: string; type: string; title: string }, timestamp: string) => {
    const isPinned = isItemPinned(itemInfo.id);

    return (
      <div
        ref={menuRef}
        className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
      >
        <button
          onClick={() => handleCoworking(itemInfo)}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Users className="w-4 h-4" />
          Coworking
        </button>
        <button
          onClick={() => openRenameModal(itemInfo)}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Pencil className="w-4 h-4" />
          Rename
        </button>
        <div
          className="relative"
          onMouseEnter={() => setShowProjectSubmenu(true)}
          onMouseLeave={() => setShowProjectSubmenu(false)}
        >
          <button
            onClick={() => setShowProjectSubmenu(!showProjectSubmenu)}
            className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <FolderInput className="w-4 h-4" />
              Move to project
            </div>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
          {showProjectSubmenu && (
            <div className="absolute left-full top-0 ml-1 w-44 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50 max-h-56 overflow-y-auto">
              {/* New project option at top */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleCreateNewProject(itemInfo);
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[#5B50BD] dark:text-[#918AD3] hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left font-medium"
              >
                <FolderPlus className="w-3.5 h-3.5" />
                <span>New project</span>
              </button>
              {availableProjects.length > 0 && (
                <div className="h-px bg-gray-200 dark:bg-gray-700 my-0.5" />
              )}
              {availableProjects.map(project => (
                <button
                  key={project.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleMoveToProject(itemInfo, project.id);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                >
                  <FolderKanban className="w-3.5 h-3.5 text-teal-500" />
                  <span className="truncate">{project.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>
        <button
          onClick={() => handlePin(itemInfo)}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          {isPinned ? (
            <>
              <PinOff className="w-4 h-4" />
              Unpin
            </>
          ) : (
            <>
              <Pin className="w-4 h-4" />
              Pin
            </>
          )}
        </button>
        <button
          onClick={() => handleArchive(itemInfo, timestamp)}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <Archive className="w-4 h-4" />
          Archive
        </button>
        <div className="h-px bg-gray-200 dark:bg-gray-700 my-0.5" />
        <button
          onClick={() => handleDeleteItem(itemInfo)}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    );
  };

  const renderMetaLearningItem = (item: typeof mockMetaLearningChats[0]) => {
    const itemInfo = { id: item.id, type: 'metalearning', title: item.title };
    const isPinned = isItemPinned(item.id);

    return (
      <div
        key={item.id}
        className="group flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 relative"
      >
        <button
          onClick={() => navigateTo('meta-learnings')}
          className="flex flex-1 items-start gap-1.5 text-left min-w-0"
        >
          <Brain className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-purple-500" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs text-gray-700 dark:text-gray-300">
              {truncateText(item.title, 25)}
            </p>
            <p className="text-[9px] text-gray-400 dark:text-gray-500">
              Meta Learning - {formatDate(item.timestamp)}
            </p>
          </div>
        </button>
        {/* Pin icon visible when pinned, 3-dots on hover */}
        <div className="flex-shrink-0 relative">
          {isPinned && (
            <div className="group-hover:hidden p-0.5">
              <Pin className="h-3.5 w-3.5 text-[#5B50BD] dark:text-[#918AD3]" />
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setItemMenuOpen(itemMenuOpen === item.id ? null : item.id);
            }}
            className={cn(
              "rounded p-0.5 text-gray-400 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300",
              isPinned ? "hidden group-hover:block" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
        {itemMenuOpen === item.id && renderContextMenu(itemInfo, item.timestamp)}
      </div>
    );
  };

  const renderCalculatorItem = (item: typeof mockCalculatorChats[0]) => {
    const itemInfo = { id: item.id, type: 'calculator', title: item.title };
    const isPinned = isItemPinned(item.id);

    return (
      <div
        key={item.id}
        className="group flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 relative"
      >
        <button
          onClick={() => navigateTo('calculators')}
          className="flex flex-1 items-start gap-1.5 text-left min-w-0"
        >
          <Calculator className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-blue-500" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs text-gray-700 dark:text-gray-300">
              {truncateText(item.title, 25)}
            </p>
            <p className="text-[9px] text-gray-400 dark:text-gray-500">
              Calculator - {formatDate(item.timestamp)}
            </p>
          </div>
        </button>
        {/* Pin icon visible when pinned, 3-dots on hover */}
        <div className="flex-shrink-0 relative">
          {isPinned && (
            <div className="group-hover:hidden p-0.5">
              <Pin className="h-3.5 w-3.5 text-[#5B50BD] dark:text-[#918AD3]" />
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setItemMenuOpen(itemMenuOpen === item.id ? null : item.id);
            }}
            className={cn(
              "rounded p-0.5 text-gray-400 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300",
              isPinned ? "hidden group-hover:block" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
        {itemMenuOpen === item.id && renderContextMenu(itemInfo, item.timestamp)}
      </div>
    );
  };

  const renderProjectChatItem = (item: typeof mockProjectChats[0]) => {
    const itemInfo = { id: item.id, type: 'project-chat', title: item.title };
    const isPinned = isItemPinned(item.id);

    return (
      <div
        key={item.id}
        className="group flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 relative"
      >
        <button
          onClick={() => {
            // Find the project and navigate to it
            const project = chatProjects.find(p => p.name === item.project);
            if (project) {
              useAppStore.getState().setCurrentChatProject(project);
            }
            navigateTo('chat-projects');
          }}
          className="flex flex-1 items-start gap-1.5 text-left min-w-0"
        >
          <FolderKanban className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-teal-500" />
          <div className="flex-1 min-w-0">
            <p className="truncate text-xs text-gray-700 dark:text-gray-300">
              {truncateText(item.title, 25)}
            </p>
            <p className="text-[9px] text-gray-400 dark:text-gray-500">
              {item.project} - {formatDate(item.timestamp)}
            </p>
          </div>
        </button>
        {/* Pin icon visible when pinned, 3-dots on hover */}
        <div className="flex-shrink-0 relative">
          {isPinned && (
            <div className="group-hover:hidden p-0.5">
              <Pin className="h-3.5 w-3.5 text-[#5B50BD] dark:text-[#918AD3]" />
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setItemMenuOpen(itemMenuOpen === item.id ? null : item.id);
            }}
            className={cn(
              "rounded p-0.5 text-gray-400 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300",
              isPinned ? "hidden group-hover:block" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
        {itemMenuOpen === item.id && renderContextMenu(itemInfo, item.timestamp)}
      </div>
    );
  };

  const renderAllItems = () => {
    // Filter out archived items
    const filteredProposals = visibleProposals.filter(p => !archivedItemsSet.has(p.id));
    const filteredMetaLearning = mockMetaLearningChats.filter(m => !archivedItemsSet.has(m.id));
    const filteredCalculator = mockCalculatorChats.filter(c => !archivedItemsSet.has(c.id));
    const filteredProjectChats = mockProjectChats.filter(p => !archivedItemsSet.has(p.id));

    const allItems = [
      ...filteredProposals.slice(0, 3).map(p => ({ type: 'proposal' as const, item: p, timestamp: p.updatedAt, id: p.id })),
      ...filteredMetaLearning.map(m => ({ type: 'metalearning' as const, item: m, timestamp: m.timestamp, id: m.id })),
      ...filteredCalculator.map(c => ({ type: 'calculator' as const, item: c, timestamp: c.timestamp, id: c.id })),
      ...filteredProjectChats.map(p => ({ type: 'project' as const, item: p, timestamp: p.timestamp, id: p.id })),
    ];

    // Sort: pinned items first, then by date
    const sortedItems = allItems.sort((a, b) => {
      const aPinned = pinnedItemsSet.has(a.id);
      const bPinned = pinnedItemsSet.has(b.id);
      if (aPinned && !bPinned) return -1;
      if (!aPinned && bPinned) return 1;
      return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    });

    return sortedItems.slice(0, 10).map((entry) => {
      if (entry.type === 'proposal') return renderProposalItem(entry.item as typeof proposals[0]);
      if (entry.type === 'metalearning') return renderMetaLearningItem(entry.item as typeof mockMetaLearningChats[0]);
      if (entry.type === 'calculator') return renderCalculatorItem(entry.item as typeof mockCalculatorChats[0]);
      if (entry.type === 'project') return renderProjectChatItem(entry.item as typeof mockProjectChats[0]);
      return null;
    });
  };

  const renderProposalItem = (proposal: typeof proposals[0]) => {
    const itemInfo = { id: proposal.id, type: 'proposal', title: proposal.content.title || 'Untitled Proposal' };
    const isPinned = isItemPinned(proposal.id);

    return (
      <div
        key={proposal.id}
        className="group flex items-start gap-1.5 rounded-lg px-2.5 py-1.5 transition-colors hover:bg-gray-100 dark:hover:bg-gray-800 relative"
      >
        <button
          onClick={() => handleProposalClick(proposal)}
          className="flex flex-1 items-start gap-1.5 text-left min-w-0"
        >
          <FileText className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-gray-400" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              {getStatusBadge(proposal)}
              <span className={cn(
                'rounded px-1 py-0.5 text-[9px] whitespace-nowrap',
                getStatusColor(proposal.status)
              )}>
                {proposal.status.replace('_', ' ')}
              </span>
            </div>
            <p className="truncate text-xs text-gray-700 dark:text-gray-300 mt-0.5">
              {truncateText(proposal.content.title || 'Untitled Proposal', 25)}
            </p>
            <p className="text-[9px] text-gray-400 dark:text-gray-500 truncate">
              {proposal.content.client || 'No client'} - {formatDate(proposal.updatedAt)}
            </p>
          </div>
        </button>
        {/* Pin icon visible when pinned, 3-dots on hover */}
        <div className="flex-shrink-0 relative">
          {isPinned && (
            <div className="group-hover:hidden p-0.5">
              <Pin className="h-3.5 w-3.5 text-[#5B50BD] dark:text-[#918AD3]" />
            </div>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setItemMenuOpen(itemMenuOpen === proposal.id ? null : proposal.id);
            }}
            className={cn(
              "rounded p-0.5 text-gray-400 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-600 dark:hover:text-gray-300",
              isPinned ? "hidden group-hover:block" : "opacity-0 group-hover:opacity-100"
            )}
          >
            <MoreHorizontal className="h-3.5 w-3.5" />
          </button>
        </div>
        {itemMenuOpen === proposal.id && renderContextMenu(itemInfo, proposal.updatedAt)}
      </div>
    );
  };

  return (
    <div className="px-2">
      {/* Flat list of all items sorted by date */}
      <div className="space-y-0.5">
        {renderAllItems()}
      </div>

      {/* Move to Project Modal */}
      <Modal
        isOpen={moveModalOpen}
        onClose={() => setMoveModalOpen(false)}
        title="Move to Project"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Select Project
            </label>
            <Select
              options={projects.map((p) => ({ value: p.id, label: p.name }))}
              value={targetProject}
              onChange={(e) => setTargetProject(e.target.value)}
              placeholder="Choose a project"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setMoveModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleMove} disabled={!targetProject}>
              Move
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Delete Proposal"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 rounded-lg bg-red-50 dark:bg-red-900/30 p-4">
            <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-red-800 dark:text-red-200">
                Are you sure you want to delete this proposal?
              </p>
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                This action cannot be undone.
              </p>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </Modal>

      {/* Rename Modal */}
      <Modal
        isOpen={renameModalOpen}
        onClose={() => {
          setRenameModalOpen(false);
          setSelectedItem(null);
          setNewTitle('');
        }}
        title="Rename"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              New name
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3]"
              placeholder="Enter new name"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => {
                setRenameModalOpen(false);
                setSelectedItem(null);
                setNewTitle('');
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleRename} disabled={!newTitle.trim()}>
              Rename
            </Button>
          </div>
        </div>
      </Modal>

      {/* Share Modal */}
      <Modal
        isOpen={shareModalOpen}
        onClose={() => {
          setShareModalOpen(false);
          setSelectedItem(null);
          setShareEmail('');
          setSharedUsers([]);
        }}
        title="Coworking"
        size="md"
      >
        <div className="space-y-4">
          {selectedItem && (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Share <span className="font-medium text-gray-900 dark:text-white">{selectedItem.title}</span> for collaboration
            </p>
          )}

          {/* Add user input */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Add collaborator
            </label>
            <div className="flex gap-2">
              <input
                type="email"
                value={shareEmail}
                onChange={(e) => setShareEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddSharedUser()}
                className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3]"
                placeholder="Enter email address"
              />
              <Button onClick={handleAddSharedUser} disabled={!shareEmail.trim()}>
                Add
              </Button>
            </div>
          </div>

          {/* Shared users list */}
          {sharedUsers.length > 0 && (
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Collaborators ({sharedUsers.length})
              </label>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {sharedUsers.map((user) => (
                  <div
                    key={user.email}
                    className="flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#5B50BD] text-white flex items-center justify-center text-sm font-medium">
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => handleRemoveSharedUser(user.email)}
                      className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setShareModalOpen(false);
                setSelectedItem(null);
                setShareEmail('');
                setSharedUsers([]);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveShare}>
              <Users className="mr-2 h-4 w-4" />
              Share
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
