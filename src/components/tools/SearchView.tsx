'use client';

import { useState, useMemo, useEffect, ReactNode } from 'react';
import {
  Search,
  X,
  User,
  Users,
  MoreVertical,
  Copy,
  Trash2,
  FileText,
  FolderInput,
  Grid3X3,
  List,
  Layout,
  SlidersHorizontal,
  ChevronRight,
  ChevronDown,
  RotateCcw,
  Pencil,
  ExternalLink,
  ArrowUpDown,
  Eye,
  Table,
  Check,
  XCircle,
  Download,
  UserCircle,
  Calendar,
} from 'lucide-react';
import { Input, Badge, Select, Card, CardHeader, CardTitle, CardContent, Dropdown, DropdownItem, DropdownSeparator, toast, MoveToProjectModal } from '@/components/ui';
import { useAppStore } from '@/lib/store';
import { cn, formatDate, getStatusColor, getStatusLabel, truncateText } from '@/lib/utils';
import type { ProposalStatus, Proposal, LibraryItem } from '@/types';

// Status badge colors as per client requirements
const STATUS_COLORS: Record<ProposalStatus, { bg: string; text: string; border: string }> = {
  draft: { bg: 'bg-gray-100 dark:bg-gray-700', text: 'text-gray-600 dark:text-gray-400', border: 'border-gray-300' },
  pending_manager: { bg: 'bg-amber-50 dark:bg-amber-900/20', text: 'text-amber-600 dark:text-amber-400', border: 'border-amber-300' },
  manager_approved: { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-600 dark:text-blue-400', border: 'border-blue-300' },
  manager_rejected: { bg: 'bg-[#EB3F5F]/10', text: 'text-[#EB3F5F]', border: 'border-[#EB3F5F]/30' },
  pending_client: { bg: 'bg-purple-50 dark:bg-purple-900/20', text: 'text-purple-600 dark:text-purple-400', border: 'border-purple-300' },
  client_approved: { bg: 'bg-[#1ED6BB]/10', text: 'text-[#1ED6BB]', border: 'border-[#1ED6BB]/30' },
  client_rejected: { bg: 'bg-[#EB3F5F]/10', text: 'text-[#EB3F5F]', border: 'border-[#EB3F5F]/30' },
  on_hold: { bg: 'bg-[#5B50BD]/10', text: 'text-[#5B50BD]', border: 'border-[#5B50BD]/30' },
  revisions_needed: { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-600 dark:text-orange-400', border: 'border-orange-300' },
  deleted: { bg: 'bg-gray-100', text: 'text-gray-400', border: 'border-gray-200' },
};

// Brand colors for sidebar tags
const BRAND_COLORS = [
  '#5B50BD', '#1ED6BB', '#EB3F5F', '#F59E0B', '#3B82F6',
  '#10B981', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
];

interface SearchViewProps {
  searchAll?: boolean;
  onActionsChange?: (actions: ReactNode) => void;
  onBreadcrumbsChange?: (items: { label: string; section?: string; current?: boolean; tooltip?: string }[]) => void;
}

const statusOptions = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_manager', label: 'Pending Manager' },
  { value: 'manager_approved', label: 'Manager Approved' },
  { value: 'manager_rejected', label: 'Manager Rejected' },
  { value: 'pending_client', label: 'Pending Client' },
  { value: 'client_approved', label: 'Client Approved' },
  { value: 'client_rejected', label: 'Client Rejected' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'revisions_needed', label: 'Revisions Needed' },
];

const ownershipOptions = [
  { value: '', label: 'All Authors' },
  { value: 'mine', label: 'Created by Me' },
  { value: 'others', label: 'Created by Others' },
];

export function SearchView({ searchAll: initialSearchAll = false, onActionsChange, onBreadcrumbsChange }: SearchViewProps) {
  const {
    proposals,
    currentUser,
    setCurrentProposal,
    setActiveSection,
    deleteProposal,
    addProposal,
    libraryItems,
    deleteLibraryItem,
    activeSection,
    searchPreset,
    setSearchPreset,
  } = useAppStore();

  // Use internal scope state that can toggle between my/all
  const [scope, setScope] = useState<'my' | 'all'>(initialSearchAll ? 'all' : 'my');
  const searchAll = scope === 'all';

  // Sync with activeSection changes
  useEffect(() => {
    if (activeSection === 'search-my') {
      setScope('my');
    } else if (activeSection === 'search-all') {
      setScope('all');
    }
  }, [activeSection]);

  // Apply preset filters coming from dashboard shortcuts
  useEffect(() => {
    if (searchPreset) {
      if (searchPreset.scope) {
        setScope(searchPreset.scope);
      }
      if (searchPreset.status) {
        setStatusFilter(searchPreset.status);
      }
      if (searchPreset.dateRangeDays !== undefined) {
        setDateFilter(String(searchPreset.dateRangeDays));
      }
      if (searchPreset.query) {
        setQuery(searchPreset.query);
      }
      setRightSidebarOpen(true);
      setSearchPreset(null);
    }
  }, [searchPreset, setSearchPreset]);

  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dateFilter, setDateFilter] = useState('');
  const [ownershipFilter, setOwnershipFilter] = useState('');
  const [viewMode, setViewMode] = useState<'table' | 'grid' | 'list'>('table');
  const [sortField, setSortField] = useState<'title' | 'status' | 'createdAt'>('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  const toggleSort = (field: 'title' | 'status' | 'createdAt') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<{ id: string; title: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'proposals' | 'templates'>('proposals');

  // Right Sidebar state - closed by default
  const [rightSidebarOpen, setRightSidebarOpen] = useState(false);

  // Advanced filter fields (simplified per client requirements)
  const [filterProposalName, setFilterProposalName] = useState('');
  const [filterClientName, setFilterClientName] = useState('');
  const [filterAccountManager, setFilterAccountManager] = useState('');
  const [filterProposalLead, setFilterProposalLead] = useState('');

  // Brand filter state (single brand selection for dropdown)
  const [brandFilter, setBrandFilter] = useState<string>('');

  // Notify breadcrumbs change when scope or activeTab changes
  useEffect(() => {
    if (onBreadcrumbsChange) {
      const myProposalsCount = proposals.filter(p => p.status !== 'deleted' && p.author.id === currentUser.id).length;
      const allProposalsCount = proposals.filter(p => p.status !== 'deleted').length;
      const templatesCount = libraryItems.filter(item => item.category === 'template').length;

      let breadcrumbs: { label: string; section?: string; current?: boolean; tooltip?: string }[] = [];

      if (scope === 'my') {
        breadcrumbs = [
          { label: 'Proposals', section: 'search-my' },
          { label: 'My Proposals', current: true, tooltip: `Search through your ${myProposalsCount} proposals` },
        ];
      } else if (scope === 'all' && activeTab === 'proposals') {
        breadcrumbs = [
          { label: 'Proposals', section: 'search-my' },
          { label: 'All Proposals', current: true, tooltip: `Search through all ${allProposalsCount} proposals` },
        ];
      } else if (scope === 'all' && activeTab === 'templates') {
        breadcrumbs = [
          { label: 'Proposals', section: 'search-my' },
          { label: 'Templates', current: true, tooltip: `Browse ${templatesCount} templates` },
        ];
      }

      onBreadcrumbsChange(breadcrumbs);
    }
  }, [scope, activeTab, onBreadcrumbsChange, proposals, currentUser.id, libraryItems]);

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

    // Apply text search (skip if query is just @ or starts with @ for AI handoff)
    if (query && !query.startsWith('@')) {
      const lowerQuery = query.toLowerCase();
      filtered = filtered.filter(p =>
        p.content.title?.toLowerCase().includes(lowerQuery) ||
        p.content.client?.toLowerCase().includes(lowerQuery) ||
        p.code?.toLowerCase().includes(lowerQuery) ||
        p.author.name?.toLowerCase().includes(lowerQuery)
      );
    }

    // Apply advanced filters from right sidebar
    if (filterProposalName) {
      const lowerFilter = filterProposalName.toLowerCase();
      filtered = filtered.filter(p =>
        p.content.title?.toLowerCase().includes(lowerFilter)
      );
    }

    if (filterClientName) {
      const lowerFilter = filterClientName.toLowerCase();
      filtered = filtered.filter(p =>
        p.content.client?.toLowerCase().includes(lowerFilter)
      );
    }

    if (filterAccountManager) {
      const lowerFilter = filterAccountManager.toLowerCase();
      filtered = filtered.filter(p =>
        p.author.name?.toLowerCase().includes(lowerFilter)
      );
    }

    if (filterProposalLead) {
      const lowerFilter = filterProposalLead.toLowerCase();
      filtered = filtered.filter(p =>
        p.author.name?.toLowerCase().includes(lowerFilter)
      );
    }

    // Apply brand filter from sidebar
    if (brandFilter) {
      filtered = filtered.filter(p => p.content.client === brandFilter);
    }

    // Apply status filter
    if (statusFilter) {
      filtered = filtered.filter(p => p.status === statusFilter);
    }

    // Apply date filter
    if (dateFilter) {
      let cutoffDate: Date;
      if (dateFilter === 'this-month') {
        // Start of current month
        const now = new Date();
        cutoffDate = new Date(now.getFullYear(), now.getMonth(), 1);
      } else {
        const days = parseInt(dateFilter);
        cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
      }
      filtered = filtered.filter(p => new Date(p.updatedAt) >= cutoffDate);
    }

    // Sort by most recent
    return filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [proposals, currentUser.id, searchAll, query, statusFilter, dateFilter, ownershipFilter, filterProposalName, filterClientName, filterAccountManager, filterProposalLead, brandFilter]);

  // Count active advanced filters
  const activeAdvancedFiltersCount = [
    filterProposalName,
    filterClientName,
    filterAccountManager,
    filterProposalLead,
    statusFilter,
    dateFilter,
    brandFilter,
  ].filter(Boolean).length;

  // Pass actions to parent for rendering in breadcrumbs
  useEffect(() => {
    if (onActionsChange) {
      const actions = (
        <button
          onClick={() => setRightSidebarOpen(!rightSidebarOpen)}
          className={cn(
            "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            rightSidebarOpen
              ? "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              : "bg-[#5B50BD] text-white hover:bg-[#4a41a0]"
          )}
        >
          <SlidersHorizontal className="h-3.5 w-3.5" />
          Filters
          {activeAdvancedFiltersCount > 0 && (
            <span className={cn(
              "ml-0.5 rounded-full px-1.5 py-0.5 text-[10px]",
              rightSidebarOpen
                ? "bg-[#5B50BD] text-white"
                : "bg-white/20"
            )}>
              {activeAdvancedFiltersCount}
            </span>
          )}
        </button>
      );
      onActionsChange(actions);
    }
  }, [onActionsChange, rightSidebarOpen, activeAdvancedFiltersCount]);

  // Get unique brands/customers with colors for sidebar
  const brandsWithColors = useMemo(() => {
    const brandCounts: Record<string, number> = {};
    proposals
      .filter(p => p.status !== 'deleted' && p.content.client)
      .forEach(p => {
        const client = p.content.client || 'Unknown';
        brandCounts[client] = (brandCounts[client] || 0) + 1;
      });

    return Object.entries(brandCounts)
      .map(([name, count], index) => ({
        name,
        count,
        color: BRAND_COLORS[index % BRAND_COLORS.length],
      }))
      .sort((a, b) => b.count - a.count);
  }, [proposals]);

  // Get unique account managers
  const accountManagers = useMemo(() => {
    const managers = new Set<string>();
    proposals.forEach(p => {
      if (p.author.name) managers.add(p.author.name);
    });
    return Array.from(managers).sort();
  }, [proposals]);

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

  const clearAdvancedFilters = () => {
    setFilterProposalName('');
    setFilterClientName('');
    setFilterAccountManager('');
    setFilterProposalLead('');
    setStatusFilter('');
    setDateFilter('');
    setBrandFilter('');
  };

  // Filter templates based on search criteria (available to everyone)
  const templateResults = useMemo(() => {
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
  }, [libraryItems, query]);

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

  // Calculate counts
  const myProposalsCount = proposals.filter(p => p.status !== 'deleted' && p.author.id === currentUser.id).length;
  const allProposalsCount = proposals.filter(p => p.status !== 'deleted').length;
  const templatesCount = libraryItems.filter(item => item.category === 'template').length;

  // Check if user is manager or admin
  const isManagerOrAdmin = currentUser.role === 'manager' || currentUser.role === 'admin';

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Main Content */}
      <div className={cn(
        "flex-1 h-full overflow-y-auto transition-all duration-300",
        rightSidebarOpen ? "mr-0" : "mr-0"
      )}>
      <div className="p-6">
        {/* Scope Toggle */}
        <div className="mb-6 flex items-center gap-4">
          <div className="inline-flex rounded-lg border border-gray-200 bg-white p-1 dark:border-gray-700 dark:bg-gray-800">
            <button
              onClick={() => setScope('my')}
              className={cn(
                'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                scope === 'my' && activeTab === 'proposals'
                  ? 'bg-[#5B50BD] text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
              )}
            >
              <User className="h-4 w-4" />
              My Proposals
              <span className={cn(
                'ml-1 rounded-full px-2 py-0.5 text-xs',
                scope === 'my' && activeTab === 'proposals' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
              )}>
                {myProposalsCount}
              </span>
            </button>
            {/* All Proposals - Only visible to managers and admins */}
            {isManagerOrAdmin && (
              <button
                onClick={() => {
                  setScope('all');
                  setActiveTab('proposals');
                }}
                className={cn(
                  'flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all',
                  scope === 'all' && activeTab === 'proposals'
                    ? 'bg-[#5B50BD] text-white shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white'
                )}
              >
                <Users className="h-4 w-4" />
                All Proposals
                <span className={cn(
                  'ml-1 rounded-full px-2 py-0.5 text-xs',
                  scope === 'all' && activeTab === 'proposals' ? 'bg-white/20' : 'bg-gray-100 dark:bg-gray-700'
                )}>
                  {allProposalsCount}
                </span>
              </button>
            )}
          </div>

          {/* Templates tab - visible to everyone */}
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('proposals')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                activeTab === 'proposals'
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              <FileText className="h-4 w-4" />
              Proposals
            </button>
            <button
              onClick={() => setActiveTab('templates')}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-all',
                activeTab === 'templates'
                  ? 'bg-gray-100 text-gray-900 dark:bg-gray-700 dark:text-white'
                  : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
              )}
            >
              <Layout className="h-4 w-4" />
              Templates
            </button>
          </div>
        </div>

        {/* Search and Filters Card */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            {/* Search Input */}
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder={searchAll ? 'Search by title, client, code, author...' : 'Search by title, client, code...'}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10 pr-4 py-3 text-base"
              />
            </div>

            {/* Results Header */}
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {(!searchAll || activeTab === 'proposals')
                  ? `${results.length} ${results.length === 1 ? 'proposal' : 'proposals'} ${query || statusFilter || dateFilter || ownershipFilter ? 'found' : ''}`
                  : `${templateResults.length} ${templateResults.length === 1 ? 'template' : 'templates'} ${query ? 'found' : ''}`
                }
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('table')}
                  className={cn(
                    'rounded p-1.5 transition-colors',
                    viewMode === 'table' ? 'bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD] dark:text-[#918AD3]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  )}
                  title="Table view"
                >
                  <Table className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={cn(
                    'rounded p-1.5 transition-colors',
                    viewMode === 'list' ? 'bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD] dark:text-[#918AD3]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  )}
                  title="List view"
                >
                  <List className="h-5 w-5" />
                </button>
                <button
                  onClick={() => setViewMode('grid')}
                  className={cn(
                    'rounded p-1.5 transition-colors',
                    viewMode === 'grid' ? 'bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD] dark:text-[#918AD3]' : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  )}
                  title="Grid view"
                >
                  <Grid3X3 className="h-5 w-5" />
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Proposals Results */}
        {(!searchAll || activeTab === 'proposals') && (results.length > 0 ? (
          viewMode === 'table' ? (
            /* Table View */
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-[#F6F8F8] dark:bg-[#231E51] border-b border-[#C8C4E9] dark:border-[#231E51]">
                    <tr>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400">
                        <button
                          onClick={() => toggleSort('title')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          Proposal Name
                          <ArrowUpDown className={cn('w-3 h-3', sortField === 'title' && 'text-[#5B50BD]')} />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 w-36">
                        Customer
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 w-36">
                        Account Manager
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 w-36">
                        Proposal Lead
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 w-28">
                        <button
                          onClick={() => toggleSort('createdAt')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          Date
                          <ArrowUpDown className={cn('w-3 h-3', sortField === 'createdAt' && 'text-[#5B50BD]')} />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 w-28">
                        <button
                          onClick={() => toggleSort('status')}
                          className="flex items-center gap-1 hover:text-gray-700 dark:hover:text-gray-200"
                        >
                          Status
                          <ArrowUpDown className={cn('w-3 h-3', sortField === 'status' && 'text-[#5B50BD]')} />
                        </button>
                      </th>
                      <th className="text-left py-3 px-4 text-sm font-semibold text-gray-500 dark:text-gray-400 w-32">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                    {results.map((proposal) => {
                      const isOwner = proposal.author.id === currentUser.id;
                      const isAdmin = ['admin', 'manager'].includes(currentUser.role);
                      const statusColors = STATUS_COLORS[proposal.status];

                      // Get brand color
                      const brandData = brandsWithColors.find(b => b.name === proposal.content.client);
                      const brandColor = brandData?.color || '#5B50BD';

                      return (
                        <tr
                          key={proposal.id}
                          onClick={() => handleResultClick(proposal)}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('proposalId', proposal.id);
                            e.dataTransfer.setData('proposalTitle', proposal.content.title || 'Untitled');
                            e.dataTransfer.effectAllowed = 'move';
                            // Create custom drag pill
                            const pill = document.createElement('div');
                            pill.className = 'fixed pointer-events-none z-50 px-3 py-1.5 bg-[#5B50BD] text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-1.5 max-w-[200px]';
                            pill.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/></svg><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${proposal.content.title || 'Untitled'}</span>`;
                            pill.style.top = '-1000px';
                            document.body.appendChild(pill);
                            e.dataTransfer.setDragImage(pill, pill.offsetWidth / 2, pill.offsetHeight / 2);
                            setTimeout(() => document.body.removeChild(pill), 0);
                          }}
                          className="hover:bg-[#F9FAFB] dark:hover:bg-[#231E51] transition-all cursor-pointer group h-14"
                        >
                          {/* Proposal Name */}
                          <td className="py-3 px-4">
                            <div className="flex flex-col relative group/name">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(proposal.content.title || 'Untitled');
                                  // Show toast
                                  const toast = document.createElement('div');
                                  toast.className = 'fixed top-4 right-4 z-50 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg';
                                  toast.textContent = 'Title copied!';
                                  document.body.appendChild(toast);
                                  setTimeout(() => toast.remove(), 1500);
                                }}
                                className="text-sm font-medium text-gray-900 dark:text-white text-left hover:text-[#5B50BD] dark:hover:text-[#918AD3] transition-colors"
                                title="Click to copy title"
                              >
                                {proposal.content.title || 'Untitled'}
                              </button>
                              {/* Code tooltip on hover */}
                              {proposal.code && (
                                <div className="absolute left-0 top-full mt-1 opacity-0 group-hover/name:opacity-100 transition-opacity z-20">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (proposal.code) navigator.clipboard.writeText(proposal.code);
                                      // Show tick feedback
                                      const btn = e.currentTarget;
                                      const icon = btn.querySelector('.copy-icon');
                                      const tick = btn.querySelector('.tick-icon');
                                      if (icon && tick) {
                                        icon.classList.add('hidden');
                                        tick.classList.remove('hidden');
                                        setTimeout(() => {
                                          icon.classList.remove('hidden');
                                          tick.classList.add('hidden');
                                        }, 1500);
                                      }
                                    }}
                                    className="px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded-md shadow-lg whitespace-nowrap flex items-center gap-1.5 hover:bg-gray-800 dark:hover:bg-gray-600"
                                  >
                                    <span>{proposal.code}</span>
                                    <Copy className="w-3 h-3 copy-icon" />
                                    <Check className="w-3 h-3 tick-icon hidden text-green-400" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                          {/* Customer/Brand */}
                          <td className="py-3 px-4">
                            {proposal.content.client ? (
                              <span
                                className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium"
                                style={{
                                  backgroundColor: `${brandColor}15`,
                                  color: brandColor,
                                  border: `1px solid ${brandColor}30`,
                                }}
                              >
                                {proposal.content.client}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">—</span>
                            )}
                          </td>
                          {/* Account Manager */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                                <UserCircle className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {proposal.author.name || '—'}
                              </span>
                            </div>
                          </td>
                          {/* Proposal Lead */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-[#5B50BD]/10 flex items-center justify-center">
                                <User className="w-4 h-4 text-[#5B50BD]" />
                              </div>
                              <span className="text-sm text-gray-600 dark:text-gray-300">
                                {proposal.author.name || '—'}
                              </span>
                            </div>
                          </td>
                          {/* Date */}
                          <td className="py-3 px-4 text-sm text-gray-500 dark:text-gray-400">
                            {formatDate((proposal.status === 'client_approved' || proposal.status === 'manager_approved') ? proposal.updatedAt : proposal.createdAt)}
                          </td>
                          {/* Status Badge */}
                          <td className="py-3 px-4">
                            <span className={cn(
                              'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border',
                              statusColors.bg,
                              statusColors.text,
                              statusColors.border
                            )}>
                              {getStatusLabel(proposal.status)}
                            </span>
                          </td>
                          {/* Actions */}
                          <td className="py-3 px-4" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                              {/* Edit */}
                              <button
                                onClick={() => handleResultClick(proposal)}
                                className="p-1.5 text-gray-400 hover:text-[#5B50BD] hover:bg-[#5B50BD]/10 rounded transition-colors"
                                title="Edit"
                              >
                                <Pencil className="w-4 h-4" />
                              </button>
                              {/* View */}
                              <button
                                onClick={() => handleResultClick(proposal)}
                                className="p-1.5 text-gray-400 hover:text-[#5B50BD] hover:bg-[#5B50BD]/10 rounded transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {/* Download/Export */}
                              <button
                                onClick={() => toast.success('Exporting proposal...')}
                                className="p-1.5 text-gray-400 hover:text-[#5B50BD] hover:bg-[#5B50BD]/10 rounded transition-colors"
                                title="Export"
                              >
                                <Download className="w-4 h-4" />
                              </button>
                              {/* Approve (admins only, for pending proposals) */}
                              {isAdmin && (proposal.status === 'pending_manager' || proposal.status === 'pending_client') && (
                                <button
                                  onClick={() => toast.success('Proposal approved')}
                                  className="p-1.5 text-gray-400 hover:text-[#1ED6BB] hover:bg-[#1ED6BB]/10 rounded transition-colors"
                                  title="Approve"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                              {/* Reject (admins only, for pending proposals) */}
                              {isAdmin && (proposal.status === 'pending_manager' || proposal.status === 'pending_client') && (
                                <button
                                  onClick={() => toast.error('Proposal rejected')}
                                  className="p-1.5 text-gray-400 hover:text-[#EB3F5F] hover:bg-[#EB3F5F]/10 rounded transition-colors"
                                  title="Reject"
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              )}
                              {/* Delete (owner only) */}
                              {isOwner && (
                                <button
                                  onClick={() => handleDeleteProposal(proposal.id)}
                                  className="p-1.5 text-gray-400 hover:text-[#EB3F5F] hover:bg-[#EB3F5F]/10 rounded transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          ) : viewMode === 'list' ? (
            <div className="space-y-3">
              {results.map((proposal) => (
                <Card
                  key={proposal.id}
                  className="group hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('proposalId', proposal.id);
                    e.dataTransfer.setData('proposalTitle', proposal.content.title || 'Untitled');
                    e.dataTransfer.effectAllowed = 'move';
                    // Create custom drag pill
                    const pill = document.createElement('div');
                    pill.className = 'fixed pointer-events-none z-50 px-3 py-1.5 bg-[#5B50BD] text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-1.5 max-w-[200px]';
                    pill.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/></svg><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${proposal.content.title || 'Untitled'}</span>`;
                    pill.style.top = '-1000px';
                    document.body.appendChild(pill);
                    e.dataTransfer.setDragImage(pill, pill.offsetWidth / 2, pill.offsetHeight / 2);
                    setTimeout(() => document.body.removeChild(pill), 0);
                  }}
                >
                  <div className="flex items-center gap-4 p-4">
                    <button
                      onClick={() => handleResultClick(proposal)}
                      className="flex flex-1 items-center gap-4 text-left min-w-0"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100 dark:bg-gray-800">
                        <FileText className="h-6 w-6 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-medium text-[#5B50BD] dark:text-[#918AD3]">
                            {proposal.code || 'Draft'}
                          </span>
                          <span className={cn('rounded px-2 py-0.5 text-xs font-medium', getStatusColor(proposal.status))}>
                            {getStatusLabel(proposal.status)}
                          </span>
                        </div>
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {proposal.content.title || 'Untitled'}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {proposal.content.client || 'No client'} • {proposal.author.name} • {formatDate(proposal.updatedAt)}
                        </p>
                      </div>
                    </button>
                    <Dropdown
                      trigger={
                        <button className="flex-shrink-0 rounded p-2 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700 group-hover:opacity-100">
                          <MoreVertical className="h-5 w-5" />
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
                        Move to Project
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
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((proposal) => (
                <Card
                  key={proposal.id}
                  className="group hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.setData('proposalId', proposal.id);
                    e.dataTransfer.setData('proposalTitle', proposal.content.title || 'Untitled');
                    e.dataTransfer.effectAllowed = 'move';
                    // Create custom drag pill
                    const pill = document.createElement('div');
                    pill.className = 'fixed pointer-events-none z-50 px-3 py-1.5 bg-[#5B50BD] text-white text-xs font-medium rounded-full shadow-lg flex items-center gap-1.5 max-w-[200px]';
                    pill.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 22a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8a2.4 2.4 0 0 1 1.704.706l3.588 3.588A2.4 2.4 0 0 1 20 8v12a2 2 0 0 1-2 2z"/></svg><span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${proposal.content.title || 'Untitled'}</span>`;
                    pill.style.top = '-1000px';
                    document.body.appendChild(pill);
                    e.dataTransfer.setDragImage(pill, pill.offsetWidth / 2, pill.offsetHeight / 2);
                    setTimeout(() => document.body.removeChild(pill), 0);
                  }}
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-medium text-[#5B50BD] dark:text-[#918AD3]">
                          {proposal.code || 'Draft'}
                        </span>
                        <span className={cn('rounded px-2 py-0.5 text-xs font-medium', getStatusColor(proposal.status))}>
                          {getStatusLabel(proposal.status)}
                        </span>
                      </div>
                      <Dropdown
                        trigger={
                          <button className="flex-shrink-0 rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700 group-hover:opacity-100">
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
                          Move to Project
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
                    <button
                      onClick={() => handleResultClick(proposal)}
                      className="text-left w-full"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">
                        {proposal.content.title || 'Untitled'}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
                        {proposal.content.client || 'No client'}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-400">
                        <User className="h-3 w-3" />
                        <span>{proposal.author.name}</span>
                        <span>•</span>
                        <span>{formatDate(proposal.updatedAt)}</span>
                      </div>
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Card>
            <div className="flex flex-col items-center justify-center py-16">
              <Search className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No proposals found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {searchAll ? 'No proposals match your search criteria' : 'You have no proposals yet. Create your first one!'}
              </p>
            </div>
          </Card>
        ))}

        {/* Templates Results */}
        {activeTab === 'templates' && (templateResults.length > 0 ? (
          viewMode === 'list' ? (
            <div className="space-y-3">
              {templateResults.map((template) => (
                <Card
                  key={template.id}
                  className="group hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center gap-4 p-4">
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="flex flex-1 items-center gap-4 text-left min-w-0"
                    >
                      <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Layout className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-gray-900 dark:text-white truncate">
                          {template.name}
                        </h3>
                        {template.description && (
                          <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                            {template.description}
                          </p>
                        )}
                        {template.tags && template.tags.length > 0 && (
                          <div className="flex gap-1 mt-1 flex-wrap">
                            {template.tags.slice(0, 3).map((tag) => (
                              <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                                {tag}
                              </span>
                            ))}
                            {template.tags.length > 3 && (
                              <span className="text-xs text-gray-400">+{template.tags.length - 3}</span>
                            )}
                          </div>
                        )}
                      </div>
                    </button>
                    <Dropdown
                      trigger={
                        <button className="flex-shrink-0 rounded p-2 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700 group-hover:opacity-100">
                          <MoreVertical className="h-5 w-5" />
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
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {templateResults.map((template) => (
                <Card
                  key={template.id}
                  className="group hover:shadow-md transition-shadow"
                >
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                        <Layout className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <Dropdown
                        trigger={
                          <button className="flex-shrink-0 rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 dark:hover:bg-gray-700 group-hover:opacity-100">
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
                    <button
                      onClick={() => handleUseTemplate(template)}
                      className="text-left w-full"
                    >
                      <h3 className="font-medium text-gray-900 dark:text-white truncate mb-1">
                        {template.name}
                      </h3>
                      {template.description && (
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
                          {template.description}
                        </p>
                      )}
                      {template.tags && template.tags.length > 0 && (
                        <div className="flex gap-1 mt-1 flex-wrap">
                          {template.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded">
                              {tag}
                            </span>
                          ))}
                          {template.tags.length > 3 && (
                            <span className="text-xs text-gray-400">+{template.tags.length - 3}</span>
                          )}
                        </div>
                      )}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )
        ) : (
          <Card>
            <div className="flex flex-col items-center justify-center py-16">
              <Layout className="h-12 w-12 text-gray-300 dark:text-gray-600 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                No templates found
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                No templates match your search criteria
              </p>
            </div>
          </Card>
        ))}
      </div>
      </div>

      {/* Right Sidebar - Filter Panel */}
      <div
        className={cn(
          'h-full border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 transition-all duration-300 overflow-hidden flex-shrink-0',
          rightSidebarOpen ? 'w-80' : 'w-0'
        )}
      >
        {rightSidebarOpen && (
          <div className="h-full flex flex-col">
            {/* Sidebar Header */}
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-[#5B50BD]" />
                <h2 className="font-semibold text-gray-900 dark:text-white">Filters</h2>
              </div>
              <button
                onClick={() => setRightSidebarOpen(false)}
                className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>

            {/* Filter Fields */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="space-y-5">
                {/* Proposal Name */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Proposal Name
                  </label>
                  <Input
                    placeholder="Search by proposal name..."
                    value={filterProposalName}
                    onChange={(e) => setFilterProposalName(e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* Customer / Brand */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Customer / Brand
                  </label>
                  <Input
                    placeholder="Search by customer..."
                    value={filterClientName}
                    onChange={(e) => setFilterClientName(e.target.value)}
                    className="text-sm"
                  />
                </div>

                {/* Account Manager */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Account Manager
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'All Managers' },
                      ...accountManagers.map(m => ({ value: m, label: m }))
                    ]}
                    value={filterAccountManager}
                    onChange={(e) => setFilterAccountManager(e.target.value)}
                  />
                </div>

                {/* Proposal Lead */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Proposal Lead
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'All Leads' },
                      ...accountManagers.map(m => ({ value: m, label: m }))
                    ]}
                    value={filterProposalLead}
                    onChange={(e) => setFilterProposalLead(e.target.value)}
                  />
                </div>

                {/* Status */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </label>
                  <Select
                    options={statusOptions}
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                  />
                </div>

                {/* Date Range */}
                <div>
                  <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date Range
                  </label>
                  <Select
                    options={[
                      { value: '', label: 'Any Time' },
                      { value: 'this-month', label: 'This Month' },
                      { value: '7', label: 'Recent (7 Days)' },
                      { value: '30', label: 'Last 30 Days' },
                      { value: '90', label: 'Last 90 Days' },
                      { value: '180', label: 'Last 6 Months' },
                      { value: '365', label: 'Last Year' },
                    ]}
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                  />
                </div>

                {/* Brand Filter */}
                {brandsWithColors.length > 0 && (
                  <div>
                    <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Filter by Brand
                    </label>
                    <Select
                      options={[
                        { value: '', label: 'All Brands' },
                        ...brandsWithColors.map(brand => ({
                          value: brand.name,
                          label: `${brand.name} (${brand.count})`
                        }))
                      ]}
                      value={brandFilter}
                      onChange={(e) => setBrandFilter(e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar Footer */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              {/* Results Summary */}
              <div className="mb-3 text-center">
                <span className="text-2xl font-bold text-[#5B50BD]">{results.length}</span>
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {results.length === 1 ? 'proposal found' : 'proposals found'}
                </span>
              </div>

              {/* Clear Filters Button */}
              {activeAdvancedFiltersCount > 0 && (
                <button
                  onClick={clearAdvancedFilters}
                  className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 dark:border-gray-700 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <RotateCcw className="h-4 w-4" />
                  Clear All Filters ({activeAdvancedFiltersCount})
                </button>
              )}
            </div>
          </div>
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
