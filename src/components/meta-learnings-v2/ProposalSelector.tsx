'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import { FileText, Search, X, ChevronDown, ChevronUp, Plus } from 'lucide-react';
import { toast } from '@/components/ui';
import { useAppStore } from '@/lib/store';

interface ProposalSelectorProps {
  content: string;
  onClose: () => void;
  className?: string;
}

type ItemType = 'proposal' | 'project';

interface SearchItem {
  id: string;
  type: ItemType;
  title: string;
  subtitle?: string;
  status?: string;
  color?: string;
  emoji?: string;
  isPinned?: boolean;
}

export function ProposalSelector({ content, onClose, className }: ProposalSelectorProps) {
  const { proposals, chatProjects } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [showList, setShowList] = useState(false);

  // Combine proposals and projects into a single searchable list
  const allItems = useMemo<SearchItem[]>(() => {
    const proposalItems: SearchItem[] = proposals
      .filter(p => p.status !== 'deleted')
      .map(p => ({
        id: p.id,
        type: 'proposal' as ItemType,
        title: p.content.title || 'Untitled',
        subtitle: `${p.content.client || 'No client'} • ${p.code}`,
        status: p.status,
      }));

    const projectItems: SearchItem[] = chatProjects
      .filter(p => !p.isArchived)
      .map(p => ({
        id: p.id,
        type: 'project' as ItemType,
        title: p.name,
        subtitle: p.description,
        color: p.color,
        emoji: p.icon,
        isPinned: p.isPinned,
      }));

    return [...proposalItems, ...projectItems];
  }, [proposals, chatProjects]);

  // Filter by search query
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return allItems;

    const query = searchQuery.toLowerCase();
    return allItems.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.subtitle?.toLowerCase().includes(query)
    );
  }, [allItems, searchQuery]);

  const handleSelectItem = (item: SearchItem) => {
    const typeName = item.type === 'proposal' ? 'Proposal' : 'Project';
    navigator.clipboard.writeText(content).then(() => {
      toast.success(
        `Added to ${typeName}`,
        `Insight ready to paste into "${item.title}"`
      );
      onClose();
    }).catch(() => {
      toast.info('Selected', `Open "${item.title}" and paste the insight.`);
      onClose();
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'pending':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
      case 'rejected':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
      case 'draft':
        return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
      default:
        return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className={cn(
      'animate-in slide-in-from-bottom-2 duration-200',
      className
    )}>
      <div className="space-y-2">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Plus className="w-3.5 h-3.5 text-[#5B50BD] dark:text-[#918AD3]" />
            <span className="text-xs font-medium text-gray-600 dark:text-gray-400">
              Select destination
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-gray-500" />
          </button>
        </div>

        {/* Select Proposal/Project Toggle */}
        <button
          onClick={() => setShowList(!showList)}
          className={cn(
            'w-full flex items-center justify-between gap-2.5 p-2.5 rounded-lg',
            'border border-gray-200 dark:border-gray-700',
            'hover:border-[#5B50BD] dark:hover:border-[#918AD3]',
            'hover:bg-[#5B50BD]/5 dark:hover:bg-[#918AD3]/5',
            'transition-all duration-150',
            showList && 'border-[#5B50BD] dark:border-[#918AD3] bg-[#5B50BD]/5 dark:bg-[#918AD3]/5'
          )}
        >
          <div className="flex items-center gap-2.5">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#5B50BD]/10 dark:bg-[#918AD3]/10">
              <FileText className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3]" />
            </div>
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              Select Proposal or Project
            </span>
          </div>
          {showList ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>

        {/* Unified List */}
        {showList && (
          <div className="space-y-2 pt-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
              <input
                type="text"
                placeholder="Search proposals & projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={cn(
                  'w-full pl-8 pr-3 py-1.5 rounded-lg',
                  'border border-gray-200 dark:border-gray-700',
                  'bg-gray-50 dark:bg-gray-800/50',
                  'text-xs text-gray-900 dark:text-gray-100',
                  'placeholder:text-gray-400',
                  'focus:outline-none focus:ring-1 focus:ring-[#5B50BD]/20',
                  'focus:border-[#5B50BD] dark:focus:border-[#918AD3]'
                )}
              />
            </div>

            {/* Combined List */}
            <div className="max-h-[180px] overflow-y-auto space-y-1.5">
              {filteredItems.length === 0 ? (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  <Search className="w-6 h-6 mx-auto mb-1 opacity-50" />
                  <p className="text-xs">No results found</p>
                </div>
              ) : (
                filteredItems.slice(0, 8).map((item) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => handleSelectItem(item)}
                    className={cn(
                      'w-full flex items-center gap-2 p-2 rounded-lg text-left',
                      'border border-gray-100 dark:border-gray-800',
                      'hover:border-[#5B50BD] dark:hover:border-[#918AD3]',
                      'hover:bg-gray-50 dark:hover:bg-gray-800/50',
                      'transition-all duration-150'
                    )}
                  >
                    {/* Icon/Avatar */}
                    {item.type === 'proposal' ? (
                      <div className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center bg-gray-100 dark:bg-gray-800">
                        <FileText className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
                      </div>
                    ) : (
                      <div
                        className="flex-shrink-0 w-6 h-6 rounded-md flex items-center justify-center text-xs font-bold text-white"
                        style={{ backgroundColor: item.color || '#5B50BD' }}
                      >
                        {item.emoji || item.title.charAt(0).toUpperCase()}
                      </div>
                    )}

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate">
                          {item.title}
                        </p>
                        <span className={cn(
                          'flex-shrink-0 px-1 py-0.5 rounded text-[8px] font-medium uppercase',
                          item.type === 'proposal'
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                            : 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        )}>
                          {item.type === 'proposal' ? 'P' : 'PR'}
                        </span>
                      </div>
                      {item.subtitle && (
                        <p className="text-[10px] text-gray-500 truncate">
                          {item.subtitle}
                        </p>
                      )}
                    </div>

                    {/* Status/Badge */}
                    {item.type === 'proposal' && item.status && (
                      <span className={cn(
                        'flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium uppercase',
                        getStatusColor(item.status)
                      )}>
                        {item.status}
                      </span>
                    )}
                    {item.type === 'project' && item.isPinned && (
                      <span className="flex-shrink-0 px-1.5 py-0.5 rounded text-[9px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                        Pinned
                      </span>
                    )}
                  </button>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
