'use client';

import { useState } from 'react';
import {
  Search,
  Plus,
  FileText,
  Eye,
  FolderOpen,
  Filter,
  X,
  MoreVertical,
  Copy,
  Trash2,
  Building2,
  FolderInput,
} from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Input, Button, Badge, Card, CardContent, Tabs, TabsList, TabsTrigger, TabsContent, Modal, Select, Dropdown, DropdownItem, DropdownSeparator, toast, MoveToProjectModal } from '@/components/ui';
import type { LibraryItem, Proposal, ProposalContent } from '@/types';

export function MobileLibrary() {
  const {
    libraryItems,
    addLibraryItem,
    deleteLibraryItem,
    proposals,
    setCurrentProposal,
    setActiveSection,
    deleteProposal,
    addProposal,
    currentUser,
  } = useAppStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [proposalStatusFilter, setProposalStatusFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<{ id: string; title: string } | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    url: '',
    category: 'template',
    tags: '',
  });

  // Filter proposals
  const filteredProposals = proposals.filter((p) => {
    if (p.status === 'deleted') return false;
    if (proposalStatusFilter && p.status !== proposalStatusFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        p.content.title?.toLowerCase().includes(query) ||
        p.content.client?.toLowerCase().includes(query)
      );
    }
    return true;
  });

  // Filter templates
  const templates = libraryItems.filter((item) => {
    if (item.category !== 'template') return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        item.name.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const handleAddItem = () => {
    if (!newItem.name || !newItem.url) return;
    addLibraryItem({
      name: newItem.name,
      description: newItem.description,
      url: newItem.url,
      category: newItem.category as LibraryItem['category'],
      tags: newItem.tags.split(',').map((t) => t.trim()).filter(Boolean),
    });
    setNewItem({ name: '', description: '', url: '', category: 'template', tags: '' });
    setAddModalOpen(false);
  };

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

  const handleMoveProposal = (proposal: Proposal) => {
    setSelectedProposal({ id: proposal.id, title: proposal.content.title || 'Untitled' });
    setMoveModalOpen(true);
  };

  const handleUseTemplate = (template: LibraryItem) => {
    // Create a new proposal from template
    const newProposal = {
      status: 'draft' as const,
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
      } as ProposalContent,
      author: currentUser,
      sentToClient: false,
      approvalHistory: [],
      comments: [],
      collaborators: [],
    };
    addProposal(newProposal);
    toast.success('Template applied to new proposal');
    setActiveSection('view-proposal');
  };

  const statusColors: Record<string, string> = {
    draft: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    pending_approval: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300',
    rejected: 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300',
    on_hold: 'bg-orange-100 text-orange-700 dark:bg-orange-900/50 dark:text-orange-300',
  };

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Search Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex gap-2 mb-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search library..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Button onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 pb-24">
        <Tabs defaultValue="proposals" className="h-full">
          <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-900 px-4 pt-3">
            <TabsList className="w-full">
              <TabsTrigger value="proposals" className="flex-1">Proposals</TabsTrigger>
              <TabsTrigger value="templates" className="flex-1">Templates</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="proposals" className="px-4 py-4">
            {/* Filter for Proposals */}
            <div className="mb-4">
              <Select
                options={[
                  { value: '', label: 'All Statuses' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'pending_approval', label: 'Pending' },
                  { value: 'approved', label: 'Approved' },
                  { value: 'rejected', label: 'Rejected' },
                ]}
                value={proposalStatusFilter}
                onChange={(e) => setProposalStatusFilter(e.target.value)}
              />
            </div>

            {filteredProposals.length === 0 ? (
              <div className="text-center py-12">
                <FolderOpen className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No proposals found
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Create your first proposal
                </p>
                <Button onClick={() => setActiveSection('new-proposal')}>
                  <Plus className="mr-2 h-4 w-4" />
                  New Proposal
                </Button>
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
                          <div className="flex items-center gap-2 mb-1">
                            {proposal.code && (
                              <span className="text-xs font-medium text-blue-600 dark:text-blue-400">
                                {proposal.code}
                              </span>
                            )}
                            <Badge className={cn('text-xs', statusColors[proposal.status])}>
                              {proposal.status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <h3 className="font-medium text-gray-900 dark:text-white truncate">
                            {proposal.content.title || 'Untitled'}
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
          </TabsContent>

          <TabsContent value="templates" className="px-4 py-4">
            {templates.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No templates
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  Add templates to reuse
                </p>
                <Button onClick={() => setAddModalOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Template
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {templates.map((template) => (
                  <Card key={template.id} className="overflow-hidden">
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/50 text-green-600 dark:text-green-400"
                        >
                          <FileText className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleUseTemplate(template)}
                          className="flex-1 min-w-0 text-left"
                        >
                          <h3 className="font-medium text-gray-900 dark:text-white">
                            {template.name}
                          </h3>
                          {template.description && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mt-1">
                              {template.description}
                            </p>
                          )}
                          {template.tags && template.tags.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {template.tags.slice(0, 3).map((tag) => (
                                <Badge key={tag} variant="default" className="text-xs">
                                  {tag}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </button>
                        <Dropdown
                          trigger={
                            <button className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          }
                          align="right"
                        >
                          <DropdownItem onClick={() => handleUseTemplate(template)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownItem>
                          <DropdownItem onClick={() => toast.info('Move to folder coming soon')}>
                            <FolderInput className="mr-2 h-4 w-4" />
                            Move
                          </DropdownItem>
                          <DropdownSeparator />
                          <DropdownItem
                            variant="destructive"
                            onClick={() => {
                              deleteLibraryItem(template.id);
                              toast.success('Template deleted');
                            }}
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
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Modal */}
      <Modal
        isOpen={addModalOpen}
        onClose={() => setAddModalOpen(false)}
        title="Add Resource"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              placeholder="Template name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <Input
              value={newItem.description}
              onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
              placeholder="Brief description"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              URL <span className="text-red-500">*</span>
            </label>
            <Input
              value={newItem.url}
              onChange={(e) => setNewItem({ ...newItem, url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Tags
            </label>
            <Input
              value={newItem.tags}
              onChange={(e) => setNewItem({ ...newItem, tags: e.target.value })}
              placeholder="comma, separated, tags"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setAddModalOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleAddItem} disabled={!newItem.name || !newItem.url} className="flex-1">
              Add
            </Button>
          </div>
        </div>
      </Modal>

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
