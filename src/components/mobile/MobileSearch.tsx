'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  FileText,
  Eye,
  User,
  Users,
  X,
  Calendar,
  Building2,
  MoreVertical,
  Copy,
  Trash2,
  FolderInput,
} from 'lucide-react';
import { cn, formatDate, getStatusColor } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Input, Select, Button, Badge, Card, CardContent, Dropdown, DropdownItem, DropdownSeparator, toast, MoveToProjectModal } from '@/components/ui';
import type { Proposal } from '@/types';

interface MobileSearchProps {
  mode: 'my' | 'all';
}

export function MobileSearch({ mode }: MobileSearchProps) {
  const { proposals, currentUser, setCurrentProposal, setActiveSection, deleteProposal, addProposal } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<{ id: string; title: string } | null>(null);

  const handleMoveProposal = (proposal: Proposal) => {
    setSelectedProposal({ id: proposal.id, title: proposal.content.title || 'Untitled' });
    setMoveModalOpen(true);
  };

  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      if (p.status === 'deleted') return false;

      // Mode filter
      if (mode === 'my' && p.author.id !== currentUser.id) return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          p.content.title?.toLowerCase().includes(query) ||
          p.content.client?.toLowerCase().includes(query) ||
          p.code?.toLowerCase().includes(query) ||
          p.author.name.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Status filter
      if (statusFilter && p.status !== statusFilter) return false;

      return true;
    });
  }, [proposals, searchQuery, statusFilter, mode, currentUser.id]);

  const handleViewProposal = (proposal: Proposal) => {
    setCurrentProposal(proposal);
    setActiveSection('view-proposal');
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

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        {/* Tab Toggle */}
        <div className="flex rounded-lg bg-gray-100 dark:bg-gray-700 p-1 mb-3">
          <button
            onClick={() => setActiveSection('search-my')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 rounded-md py-2 text-sm font-medium transition-colors',
              mode === 'my' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
            )}
          >
            <User className="h-4 w-4" />
            My Proposals
          </button>
          <button
            onClick={() => setActiveSection('search-all')}
            className={cn(
              'flex-1 flex items-center justify-center gap-1 rounded-md py-2 text-sm font-medium transition-colors',
              mode === 'all' ? 'bg-white dark:bg-gray-600 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
            )}
          >
            <Users className="h-4 w-4" />
            All Proposals
          </button>
        </div>

        {/* Search Input */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search by title, client, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button
            variant={showFilters ? 'default' : 'outline'}
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-3 flex gap-2">
            <Select
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'draft', label: 'Draft' },
                { value: 'pending_approval', label: 'Pending' },
                { value: 'approved', label: 'Approved' },
                { value: 'rejected', label: 'Rejected' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="flex-1"
            />
            {(searchQuery || statusFilter) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Results */}
      <div className="flex-1 p-4 pb-24">
        {/* Results Count */}
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {filteredProposals.length} proposal{filteredProposals.length !== 1 ? 's' : ''} found
        </p>

        {filteredProposals.length === 0 ? (
          <div className="text-center py-12">
            <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No proposals found
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Try adjusting your search or filters
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredProposals.map((proposal) => (
              <Card key={proposal.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => handleViewProposal(proposal)}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400"
                    >
                      <FileText className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleViewProposal(proposal)}
                      className="flex-1 min-w-0 text-left"
                    >
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        {proposal.code && (
                          <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                            {proposal.code}
                          </span>
                        )}
                        <Badge className={cn('text-xs', getStatusColor(proposal.status))}>
                          {proposal.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <h3 className="font-medium text-gray-900 dark:text-white line-clamp-1">
                        {proposal.content.title || 'Untitled Proposal'}
                      </h3>
                      {proposal.content.client && (
                        <div className="flex items-center gap-1 mt-1 text-sm text-gray-500 dark:text-gray-400">
                          <Building2 className="h-3 w-3" />
                          <span className="truncate">{proposal.content.client}</span>
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-2 text-xs text-gray-400">
                        <span>{proposal.author.name}</span>
                        <span>•</span>
                        <span>{formatDate(proposal.updatedAt)}</span>
                      </div>
                    </button>
                    <Dropdown
                      trigger={
                        <button className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
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
                </CardContent>
              </Card>
            ))}
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
