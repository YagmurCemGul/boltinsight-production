'use client';

import { useState, useEffect, useMemo } from 'react';
import { Search, Filter, Calendar, Tag, X, User, Users, UserCheck, MoreVertical, Copy, Trash2, Eye, FileText, FolderInput, Layout } from 'lucide-react';
import { Input, Badge, Select, Dropdown, DropdownItem, DropdownSeparator, toast, MoveToProjectModal, AIBadge } from '@/components/ui';
import { useAppStore } from '@/lib/store';
import { cn, formatDate, getStatusColor, getStatusLabel, truncateText } from '@/lib/utils';
import type { ProposalStatus, Proposal, LibraryItem } from '@/types';

interface SearchSectionProps {
  searchAll: boolean;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'on_hold', label: 'On Hold' },
];

const ownershipOptions = [
  { value: '', label: 'All Authors' },
  { value: 'mine', label: 'Created by Me' },
  { value: 'others', label: 'Created by Others' },
];

export function SearchSection({ searchAll }: SearchSectionProps) {
  const { proposals, currentUser, setCurrentProposal, setActiveSection, deleteProposal, addProposal, libraryItems, deleteLibraryItem } = useAppStore();
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState('');
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<{ id: string; title: string } | null>(null);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState<'proposals' | 'templates'>('proposals');

  const handleMoveProposal = (proposal: Proposal) => {
    setSelectedProposal({ id: proposal.id, title: proposal.content.title || 'Untitled' });
    setMoveModalOpen(true);
  };

  const handleCopyProposal = (proposal: Proposal) => {
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
    toast.success('Proposal duplicated');
  };

  const handleDeleteProposal = (proposalId: string) => {
    deleteProposal(proposalId);
    toast.success('Proposal deleted');
  };

  // Filter proposals based on search criteria
  const results = useMemo(() => {
    let filtered = proposals.filter(p => p.status !== 'deleted');

    // For "My Proposals", filter by current user (author)
    if (!searchAll) {
      filtered = filtered.filter(p => p.author.id === currentUser.id);
    } else {
      // For "All Proposals", apply ownership filter if selected
      if (ownershipFilter === 'mine') {
        filtered = filtered.filter(p => p.author.id === currentUser.id);
      } else if (ownershipFilter === 'others') {
        filtered = filtered.filter(p => p.author.id !== currentUser.id);
      }
    }

    // Apply text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(p =>
        p.content.title?.toLowerCase().includes(lowerQuery) ||
        p.content.client?.toLowerCase().includes(lowerQuery) ||
        p.code?.toLowerCase().includes(lowerQuery) ||
        p.author.name?.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter) {
      const days = parseInt(dateFilter);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);
      filtered = filtered.filter(p => new Date(p.createdAt) >= cutoffDate);
    }

    // Sort by most recent
    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [proposals, currentUser.id, searchAll, query, statusFilter, dateFilter, ownershipFilter]);

  const handleResultClick = (proposal: typeof results[0]) => {
    setCurrentProposal(proposal);
    setActiveSection('view-proposal');
  };

  const clearFilters = () => {
    setQuery('');
    setStatusFilter('');
    setDateFilter('');
    setOwnershipFilter('');
  };

  // Filter templates based on search criteria (only for searchAll mode)
  const templateResults = useMemo(() => {
    if (!searchAll) return [];

    let filtered = libraryItems.filter(item => item.category === 'template');

    // Apply text search
    if (query) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(t =>
        t.name?.toLowerCase().includes(lowerQuery) ||
        t.description?.toLowerCase().includes(lowerQuery) ||
        t.tags?.some(tag => tag.toLowerCase().includes(lowerQuery))
      );
    }

    return filtered;
  }, [libraryItems, searchAll, query]);

  const handleUseTemplate = (template: LibraryItem) => {
    // Create a new proposal from template
    addProposal({
      status: 'draft',
      content: {
        title: template.name,
        client: '',
        contact: '',
        background: template.description || '',
        businessObjectives: [],
        researchObjectives: [],
        burningQuestions: [],
        targetDefinition: '',
        sampleSize: 0,
        markets: [],
        quotas: [],
        advancedAnalysis: [],
        referenceProjects: [],
      },
      author: currentUser,
      sentToClient: false,
      approvalHistory: [],
      comments: [],
      collaborators: [],
    });
    toast.success('New proposal created from template');
    setActiveSection('view-proposal');
  };

  const handleDeleteTemplate = (templateId: string) => {
    deleteLibraryItem(templateId);
    toast.success('Template deleted');
  };

  // Calculate counts for the mode indicator
  const myProposalsCount = proposals.filter(p => p.status !== 'deleted' && p.author.id === currentUser.id).length;
  const allProposalsCount = proposals.filter(p => p.status !== 'deleted').length;
  const templatesCount = libraryItems.filter(item => item.category === 'template').length;

  return (
    <div className="space-y-3">
      {/* Mode Indicator */}
      {!searchAll ? (
        <div className={cn(
          'flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium',
          'bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD] dark:text-[#918AD3] border border-[#C8C4E9] dark:border-[#5B50BD]'
        )}>
          <UserCheck className="h-4 w-4" />
          <span>My Proposals ({myProposalsCount})</span>
        </div>
      ) : (
        <div className="flex gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <button
            onClick={() => setActiveTab('proposals')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              activeTab === 'proposals'
                ? 'bg-white dark:bg-gray-700 text-[#5B50BD] dark:text-[#918AD3] shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <FileText className="h-3.5 w-3.5" />
            <span>Proposals ({allProposalsCount})</span>
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              activeTab === 'templates'
                ? 'bg-white dark:bg-gray-700 text-[#5B50BD] dark:text-[#918AD3] shadow-sm'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
            )}
          >
            <Layout className="h-3.5 w-3.5" />
            <span>Templates ({templatesCount})</span>
          </button>
        </div>
      )}

      {/* Search Input */}
      <div className={cn(
        "relative transition-all duration-300 ease-in-out",
        isSearchFocused && "scale-[1.02] z-10"
      )}>
        <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10">
          <AIBadge
            isActive={query.includes('@')}
            showTooltip={true}
            tooltipText="Type @ to search with AI. Find proposals using natural language queries."
            size="sm"
          />
        </div>
        <Input
          placeholder={searchAll ? 'Search or type @ for AI...' : 'Search or type @ for AI...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsSearchFocused(true)}
          onBlur={() => setIsSearchFocused(false)}
          className={cn(
            "pl-12 pr-10 transition-all duration-300",
            isSearchFocused && "ring-2 ring-[#5B50BD] dark:ring-[#918AD3] border-[#5B50BD] dark:border-[#918AD3] shadow-lg",
            query.includes('@') && "ring-2 ring-[#5B50BD]/50"
          )}
        />
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            'absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 transition-colors',
            showFilters ? 'bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD] dark:text-[#918AD3]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
          )}
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="space-y-2 rounded-lg bg-gray-50 dark:bg-gray-800 p-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Filters</span>
            {(statusFilter || dateFilter || ownershipFilter) && (
              <button
                onClick={clearFilters}
                className="flex items-center gap-1 text-xs text-[#5B50BD] dark:text-[#918AD3] hover:text-[#4A41A0] dark:hover:text-[#C8C4E9]"
              >
                <X className="h-3 w-3" />
                Clear
              </button>
            )}
          </div>

          <div className="grid gap-2">
            {/* Author filter - only show in "All Proposals" mode */}
            {searchAll && (
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-gray-400" />
                <Select
                  options={ownershipOptions}
                  value={ownershipFilter}
                  onChange={(e) => setOwnershipFilter(e.target.value)}
                  className="flex-1 text-xs"
                />
              </div>
            )}

            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <Select
                options={statusOptions}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="flex-1 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <Select
                options={[
                  { value: '', label: 'Any Time' },
                  { value: '7', label: 'Last 7 Days' },
                  { value: '30', label: 'Last 30 Days' },
                  { value: '90', label: 'Last 90 Days' },
                ]}
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="flex-1 text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Results */}
      <div className="space-y-2">
        {/* Proposals Tab Content */}
        {(!searchAll || activeTab === 'proposals') && (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {results.length} {results.length === 1 ? 'proposal' : 'proposals'} {query || statusFilter || dateFilter || ownershipFilter ? 'found' : ''}
            </p>

            {results.length > 0 ? (
              <div className="max-h-60 space-y-1 overflow-y-auto">
                {results.map((proposal) => (
                  <div
                    key={proposal.id}
                    className={cn(
                      'group flex items-start gap-2 rounded-lg p-2 transition-colors',
                      'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                    )}
                  >
                    <button
                      onClick={() => handleResultClick(proposal)}
                      className="flex flex-1 items-start gap-2 text-left min-w-0"
                    >
                      <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-medium text-[#5B50BD] dark:text-[#918AD3]">
                            {proposal.code || 'Draft'}
                          </span>
                          <span className={cn('rounded px-1.5 py-0.5 text-[10px] whitespace-nowrap', getStatusColor(proposal.status))}>
                            {getStatusLabel(proposal.status)}
                          </span>
                        </div>
                        <p className="truncate text-sm text-gray-700 dark:text-gray-300 mt-0.5">
                          {truncateText(proposal.content.title || 'Untitled', 25)}
                        </p>
                        <p className="text-[10px] text-gray-400 truncate">
                          {proposal.content.client || 'No client'} - {formatDate(proposal.createdAt)}
                        </p>
                      </div>
                    </button>
                    <Dropdown
                      trigger={
                        <button className="flex-shrink-0 rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-600 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      }
                      align="right"
                    >
                      <DropdownItem onClick={() => handleCopyProposal(proposal)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Duplicate
                      </DropdownItem>
                      <DropdownItem onClick={() => handleMoveProposal(proposal)}>
                        <FolderInput className="mr-2 h-4 w-4" />
                        Move
                      </DropdownItem>
                      <DropdownSeparator />
                      <DropdownItem
                        variant="destructive"
                        onClick={() => handleDeleteProposal(proposal.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownItem>
                    </Dropdown>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
                {searchAll ? 'No proposals found in the system' : 'You have no proposals yet'}
              </p>
            )}
          </>
        )}

        {/* Templates Tab Content */}
        {searchAll && activeTab === 'templates' && (
          <>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {templateResults.length} {templateResults.length === 1 ? 'template' : 'templates'} {query ? 'found' : ''}
            </p>

            {templateResults.length > 0 ? (
              <div className="max-h-60 space-y-1 overflow-y-auto">
                {templateResults.map((template) => (
                  <div
                    key={template.id}
                    className={cn(
                      'group flex items-start gap-2 rounded-lg p-2 transition-colors',
                      'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700'
                    )}
                  >
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex flex-1 items-start gap-2 text-left min-w-0"
                    >
                      <Layout className="mt-0.5 h-4 w-4 flex-shrink-0 text-green-500" />
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                          {template.name}
                        </p>
                        {template.description && (
                          <p className="text-[10px] text-gray-400 truncate mt-0.5">
                            {truncateText(template.description, 40)}
                          </p>
                        )}
                        {template.tags && template.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {template.tags.slice(0, 2).map((tag) => (
                              <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                                {tag}
                              </span>
                            ))}
                            {template.tags.length > 2 && (
                              <span className="text-[9px] text-gray-400">+{template.tags.length - 2}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                    <Dropdown
                      trigger={
                        <button className="flex-shrink-0 rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-200 dark:hover:bg-gray-600 group-hover:opacity-100">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      }
                      align="right"
                    >
                      <DropdownItem onClick={() => handleUseTemplate(template)}>
                        <Copy className="mr-2 h-4 w-4" />
                        Use Template
                      </DropdownItem>
                      <DropdownSeparator />
                      <DropdownItem
                        variant="destructive"
                        onClick={() => handleDeleteTemplate(template.id)}
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownItem>
                    </Dropdown>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-xs text-gray-400 dark:text-gray-500 py-4">
                No templates found
              </p>
            )}
          </>
        )}
      </div>

      {/* Move to Project Modal */}
      {selectedProposal && (
        <MoveToProjectModal
          isOpen={moveModalOpen}
          onClose={() => {
            setMoveModalOpen(false);
            setSelectedProposal(null);
          }}
          proposalId={selectedProposal.id}
          proposalTitle={selectedProposal.title}
        />
      )}
    </div>
  );
}
