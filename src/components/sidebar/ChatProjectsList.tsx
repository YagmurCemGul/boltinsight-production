'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import {
  FolderPlus,
  Folder,
  FolderOpen,
  MoreHorizontal,
  Pin,
  Archive,
  ArchiveRestore,
  Trash2,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Search,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { toast } from '@/components/ui';
import type { ChatProject, ProjectConversation } from '@/types';

interface ChatProjectsListProps {
  onNavigate?: (section: string) => void;
}

export function ChatProjectsList({ onNavigate }: ChatProjectsListProps = {}) {
  const {
    chatProjects,
    currentChatProject,
    currentConversation,
    setCurrentChatProject,
    setCurrentConversation,
    pinChatProject,
    unpinChatProject,
    archiveChatProject,
    unarchiveChatProject,
    deleteChatProject,
    setActiveSection,
    setShowCreateProjectModal,
    moveProposalToProject,
  } = useAppStore();

  // Use provided navigation handler or fall back to direct setActiveSection
  const navigateTo = onNavigate || setActiveSection;

  const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set());
  const [projectMenuOpen, setProjectMenuOpen] = useState<string | null>(null);
  const [isSectionExpanded, setIsSectionExpanded] = useState(true);
  const [isSearchMode, setIsSearchMode] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dragOverProjectId, setDragOverProjectId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Handle drop of proposal onto project
  const handleProposalDrop = (e: React.DragEvent, projectId: string, projectName: string) => {
    e.preventDefault();
    e.stopPropagation();
    const proposalId = e.dataTransfer.getData('proposalId');
    const proposalTitle = e.dataTransfer.getData('proposalTitle');

    if (proposalId) {
      moveProposalToProject(proposalId, projectId);
      toast.success('Proposal moved', `"${proposalTitle}" moved to ${projectName}`);
    }
    setDragOverProjectId(null);
  };

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProjectMenuOpen(null);
      }
    };
    if (projectMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [projectMenuOpen]);

  // Focus search input when entering search mode
  useEffect(() => {
    if (isSearchMode && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isSearchMode]);

  // Sort and filter projects: pinned first, then by last activity
  const sortedProjects = useMemo(() => {
    let active = chatProjects.filter((p) => !p.isArchived);

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      active = active.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.conversations.some(c => c.title.toLowerCase().includes(query))
      );
    }

    const pinned = active.filter((p) => p.isPinned);
    const unpinned = active.filter((p) => !p.isPinned);

    pinned.sort(
      (a, b) =>
        new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    );
    unpinned.sort(
      (a, b) =>
        new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    );

    return [...pinned, ...unpinned];
  }, [chatProjects, searchQuery]);

  // Archived projects - shown in archive section or when searching
  const archivedProjects = useMemo(() => {
    let archived = chatProjects.filter((p) => p.isArchived);

    // Apply search filter to archived projects too
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      archived = archived.filter((p) =>
        p.name.toLowerCase().includes(query) ||
        p.conversations.some(c => c.title.toLowerCase().includes(query))
      );
    }

    return archived.sort(
      (a, b) =>
        new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    );
  }, [chatProjects, searchQuery]);

  // Handle unarchive project
  const handleUnarchiveProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    unarchiveChatProject(projectId);
    setProjectMenuOpen(null);
    toast.success('Project unarchived');
  };

  const toggleProjectExpand = (projectId: string) => {
    setExpandedProjects((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) {
        next.delete(projectId);
      } else {
        next.add(projectId);
      }
      return next;
    });
  };

  const handleSelectProject = (project: ChatProject) => {
    setCurrentChatProject(project);
    setCurrentConversation(null); // Clear conversation to show project overview
    navigateTo('chat-projects');
  };

  const handleSelectConversation = (project: ChatProject, conversation: ProjectConversation) => {
    setCurrentChatProject(project);
    setCurrentConversation(conversation);
    navigateTo('chat-projects');
  };

  const handleTogglePin = (projectId: string, isPinned: boolean, e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPinned) {
      unpinChatProject(projectId);
    } else {
      pinChatProject(projectId);
    }
    setProjectMenuOpen(null);
  };

  const handleArchiveProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    archiveChatProject(projectId);
    if (currentChatProject?.id === projectId) {
      setCurrentChatProject(null);
    }
    setProjectMenuOpen(null);
  };

  const handleDeleteProject = (projectId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this project?')) {
      deleteChatProject(projectId);
      if (currentChatProject?.id === projectId) {
        setCurrentChatProject(null);
      }
    }
    setProjectMenuOpen(null);
  };

  const handleNewProject = () => {
    // Just open the modal - don't navigate away from current page
    setShowCreateProjectModal(true);
  };

  return (
    <div className="group/sidebar-expando-section mb-2">
      {/* Section Header - with expand animation */}
      <div className="relative">
        {/* Search Bar - expands from right to left */}
        <div className={cn(
          "flex items-center gap-2 mx-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800 transition-all duration-300 ease-out origin-right absolute inset-x-0 top-0",
          "outline-none ring-0 border-none shadow-none",
          "focus-within:outline-none focus-within:ring-0 focus-within:border-none focus-within:shadow-none",
          "[&:has(:focus)]:outline-none [&:has(:focus)]:ring-0 [&:has(:focus)]:shadow-none",
          isSearchMode
            ? "scale-x-100 opacity-100"
            : "scale-x-0 opacity-0 pointer-events-none"
        )}>
          <Search className={cn(
            "h-3 w-3 text-gray-400 flex-shrink-0 transition-opacity duration-200 delay-150",
            isSearchMode ? "opacity-100" : "opacity-0"
          )} />
          <input
            ref={searchInputRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className={cn(
              "flex-1 bg-transparent text-xs text-gray-700 dark:text-gray-300 placeholder-gray-400",
              "!outline-none !border-none !ring-0 !shadow-none",
              "focus:!outline-none focus:!border-none focus:!ring-0 focus:!shadow-none focus:!ring-transparent",
              "transition-opacity duration-200 delay-150",
              isSearchMode ? "opacity-100" : "opacity-0"
            )}
            style={{ outline: 'none', boxShadow: 'none' }}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setIsSearchMode(false);
                setSearchQuery('');
              }
            }}
          />
          <button
            onClick={() => {
              setIsSearchMode(false);
              setSearchQuery('');
            }}
            className={cn(
              "text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all duration-200 delay-150",
              isSearchMode ? "opacity-100" : "opacity-0"
            )}
          >
            <X className="h-3 w-3" />
          </button>
        </div>

        {/* Normal Header - fades out */}
        <div className={cn(
          "flex w-full items-center justify-between px-4 py-1.5 text-gray-500 dark:text-gray-400 transition-all duration-200",
          isSearchMode
            ? "opacity-0 pointer-events-none"
            : "opacity-100"
        )}>
          <button
            onClick={() => setIsSectionExpanded(!isSectionExpanded)}
            aria-expanded={isSectionExpanded}
            className="flex items-center gap-0.5 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            <h2 className="text-xs font-semibold uppercase tracking-wider">Projects</h2>
            <ChevronDown className={cn(
              "h-3 w-3 transition-transform duration-200",
              isSectionExpanded ? "hidden group-hover/sidebar-expando-section:block" : "group-hover/sidebar-expando-section:block -rotate-90"
            )} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsSearchMode(true);
              setIsSectionExpanded(true);
            }}
            className="opacity-0 group-hover/sidebar-expando-section:opacity-100 hover:text-gray-700 dark:hover:text-gray-300 transition-all"
            title="Search projects"
          >
            <Search className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {isSectionExpanded && (
        <>
          {/* New Project Item */}
          <div
            onClick={handleNewProject}
            className="group flex items-center gap-2 px-3 py-1.5 cursor-pointer hover:bg-[#EDE9F9] dark:hover:bg-[#231E51] rounded-lg mx-2 transition-colors"
          >
            <FolderPlus className="w-3.5 h-3.5 text-[#5B50BD] dark:text-[#918AD3]" />
            <span className="text-xs font-medium text-gray-700 dark:text-gray-300">New project</span>
          </div>

          {/* Projects List */}
          <div className="space-y-0.5 mt-1">
        {sortedProjects.map((project) => {
          const isExpanded = expandedProjects.has(project.id);
          const isSelected = currentChatProject?.id === project.id && !currentConversation;
          const activeConversations = project.conversations.filter((c) => !c.isArchived);

          return (
            <div key={project.id} className="relative">
              {/* Project Row */}
              <div
                onClick={() => {
                  toggleProjectExpand(project.id);
                  handleSelectProject(project);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  e.dataTransfer.dropEffect = 'move';
                  setDragOverProjectId(project.id);
                }}
                onDragLeave={() => setDragOverProjectId(null)}
                onDrop={(e) => handleProposalDrop(e, project.id, project.name)}
                className={cn(
                  'group flex items-center gap-1.5 px-3 py-1.5 mx-2 rounded-lg cursor-pointer transition-colors',
                  isSelected
                    ? 'bg-[#EDE9F9] dark:bg-[#231E51]'
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800',
                  dragOverProjectId === project.id && 'ring-2 ring-[#5B50BD] bg-[#EDE9F9]/50 dark:bg-[#231E51]/50'
                )}
              >
                {/* Expand/Collapse Icon */}
                <ChevronRight className={cn(
                  "w-3 h-3 text-gray-400 transition-transform duration-200 flex-shrink-0",
                  isExpanded && "rotate-90"
                )} />

                {/* Folder Icon */}
                {isExpanded ? (
                  <FolderOpen className={cn(
                    "w-3.5 h-3.5 flex-shrink-0",
                    isSelected ? "text-[#5B50BD] dark:text-[#918AD3]" : "text-gray-500 dark:text-gray-400"
                  )} />
                ) : (
                  <Folder className={cn(
                    "w-3.5 h-3.5 flex-shrink-0",
                    isSelected ? "text-[#5B50BD] dark:text-[#918AD3]" : "text-gray-500 dark:text-gray-400"
                  )} />
                )}

                {/* Project Name */}
                <span className={cn(
                  "text-xs truncate flex-1",
                  isSelected
                    ? "font-medium text-[#5B50BD] dark:text-[#918AD3]"
                    : "text-gray-700 dark:text-gray-300"
                )}>
                  {project.name}
                </span>

                {/* Pin indicator */}
                {project.isPinned && (
                  <Pin className="w-2.5 h-2.5 text-[#5B50BD] dark:text-[#918AD3] flex-shrink-0" />
                )}

                {/* Trailing Menu - show on hover */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setProjectMenuOpen(projectMenuOpen === project.id ? null : project.id);
                    }}
                    className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                  >
                    <MoreHorizontal className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dropdown Menu */}
              {projectMenuOpen === project.id && (
                <div
                  ref={menuRef}
                  className="absolute right-4 top-full mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
                >
                  <button
                    onClick={(e) => handleTogglePin(project.id, project.isPinned, e)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Pin className="w-3.5 h-3.5" />
                    {project.isPinned ? 'Unpin' : 'Pin to top'}
                  </button>
                  <button
                    onClick={(e) => handleArchiveProject(project.id, e)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <Archive className="w-3.5 h-3.5" />
                    Archive
                  </button>
                  <div className="h-px bg-gray-200 dark:bg-gray-700 my-0.5" />
                  <button
                    onClick={(e) => handleDeleteProject(project.id, e)}
                    className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Delete
                  </button>
                </div>
              )}

              {/* Conversations (Nested) */}
              {isExpanded && activeConversations.length > 0 && (
                <div className="ml-3 pl-2.5 border-l border-gray-200 dark:border-gray-700">
                  {activeConversations.map((conv) => {
                    const isConvSelected =
                      currentChatProject?.id === project.id &&
                      currentConversation?.id === conv.id;

                    return (
                      <div
                        key={conv.id}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelectConversation(project, conv);
                        }}
                        className={cn(
                          'group flex items-center gap-1.5 pl-2.5 pr-3 py-1 mr-2 rounded-lg cursor-pointer transition-colors',
                          isConvSelected
                            ? 'bg-[#EDE9F9] dark:bg-[#231E51]'
                            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                        )}
                      >
                        <MessageSquare className={cn(
                          "w-3 h-3 flex-shrink-0",
                          isConvSelected
                            ? "text-[#5B50BD] dark:text-[#918AD3]"
                            : "text-gray-400 dark:text-gray-500"
                        )} />
                        <span className={cn(
                          'text-[11px] truncate flex-1',
                          isConvSelected
                            ? 'font-medium text-[#5B50BD] dark:text-[#918AD3]'
                            : 'text-gray-600 dark:text-gray-400'
                        )}>
                          {conv.title}
                        </span>
                        {/* Trailing menu for conversation */}
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <button className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded">
                            <MoreHorizontal className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

            {/* Empty state for active projects */}
            {sortedProjects.length === 0 && !searchQuery.trim() && (
              <div className="px-4 py-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                  No projects yet
                </p>
              </div>
            )}

            {/* Show archived projects in search results */}
            {searchQuery.trim() && archivedProjects.length > 0 && (
              <div className="mt-2">
                <div className="px-4 py-1">
                  <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    Archived
                  </span>
                </div>
                {archivedProjects.map((project) => (
                  <div key={project.id} className="relative">
                    <div
                      className="group flex items-center gap-1.5 px-3 py-1.5 mx-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5 text-gray-400 dark:text-gray-500 flex-shrink-0" />
                      <span className="text-xs text-gray-500 dark:text-gray-400 truncate flex-1">
                        {project.name}
                      </span>
                      <span className="text-[10px] text-gray-400 dark:text-gray-500 flex-shrink-0">
                        (Archived)
                      </span>
                      {/* Trailing Menu */}
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setProjectMenuOpen(projectMenuOpen === `archived-${project.id}` ? null : `archived-${project.id}`);
                          }}
                          className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded transition-colors"
                        >
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {/* Dropdown Menu for archived project */}
                    {projectMenuOpen === `archived-${project.id}` && (
                      <div
                        ref={menuRef}
                        className="absolute right-4 top-full mt-1 w-36 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg overflow-hidden z-50"
                      >
                        <button
                          onClick={(e) => handleUnarchiveProject(project.id, e)}
                          className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <ArchiveRestore className="w-3.5 h-3.5" />
                          Unarchive
                        </button>
                        <div className="h-px bg-gray-200 dark:bg-gray-700 my-0.5" />
                        <button
                          onClick={(e) => handleDeleteProject(project.id, e)}
                          className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* No results state when searching */}
            {searchQuery.trim() && sortedProjects.length === 0 && archivedProjects.length === 0 && (
              <div className="px-4 py-3">
                <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                  No projects found
                </p>
              </div>
            )}
          </div>

        </>
      )}
    </div>
  );
}
