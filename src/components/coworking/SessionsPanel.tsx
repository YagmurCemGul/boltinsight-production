'use client';

import { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Plus,
  Search,
  Calculator,
  Brain,
  Filter,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui';
import { SessionCard } from './SessionCard';
import { useAppStore } from '@/lib/store';
import type { SessionType } from '@/types';

interface SessionsPanelProps {
  onSessionOpen?: (sessionId: string) => void;
  onSessionShare?: (sessionId: string) => void;
  onCreateSession?: (type: SessionType) => void;
  className?: string;
}

type FilterType = 'all' | 'calculators' | 'meta-learnings';

export function SessionsPanel({
  onSessionOpen,
  onSessionShare,
  onCreateSession,
  className,
}: SessionsPanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [showNewMenu, setShowNewMenu] = useState(false);

  const {
    coworkingSessions,
    activeCoworkingSessionId,
    setActiveCoworkingSession,
    updateCoworkingSession,
    deleteCoworkingSession,
  } = useAppStore();

  // Filter and search sessions
  const filteredSessions = useMemo(() => {
    let sessions = coworkingSessions.filter(s => !s.isArchived);

    // Filter by type
    if (filterType !== 'all') {
      sessions = sessions.filter(s => s.type === filterType);
    }

    // Search by name
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      sessions = sessions.filter(s =>
        s.name.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query)
      );
    }

    // Sort by last activity
    return sessions.sort((a, b) =>
      new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime()
    );
  }, [coworkingSessions, filterType, searchQuery]);

  // Archived sessions count
  const archivedCount = coworkingSessions.filter(s => s.isArchived).length;

  const handleOpen = (sessionId: string) => {
    setActiveCoworkingSession(sessionId);
    onSessionOpen?.(sessionId);
  };

  const handleShare = (sessionId: string) => {
    onSessionShare?.(sessionId);
  };

  const handleArchive = (sessionId: string) => {
    updateCoworkingSession(sessionId, { isArchived: true });
  };

  const handleDelete = (sessionId: string) => {
    if (confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      deleteCoworkingSession(sessionId);
    }
  };

  const handleCreateSession = (type: SessionType) => {
    setShowNewMenu(false);
    onCreateSession?.(type);
  };

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            Coworking Sessions
          </h2>

          {/* New session button */}
          <div className="relative">
            <Button
              size="sm"
              onClick={() => setShowNewMenu(!showNewMenu)}
              className="h-7 gap-1 text-xs"
            >
              <Plus className="w-3 h-3" />
              New
            </Button>

            {showNewMenu && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowNewMenu(false)}
                />
                <div
                  className={cn(
                    'absolute right-0 top-full mt-1 z-20',
                    'w-44 py-1 rounded-lg shadow-lg',
                    'bg-white dark:bg-gray-800',
                    'border border-gray-200 dark:border-gray-700'
                  )}
                >
                  <button
                    onClick={() => handleCreateSession('calculators')}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2',
                      'text-xs text-gray-700 dark:text-gray-300',
                      'hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    <Calculator className="w-3.5 h-3.5 text-[#5B50BD] dark:text-[#918AD3]" />
                    Calculators Session
                  </button>
                  <button
                    onClick={() => handleCreateSession('meta-learnings')}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2',
                      'text-xs text-gray-700 dark:text-gray-300',
                      'hover:bg-gray-100 dark:hover:bg-gray-700'
                    )}
                  >
                    <Brain className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
                    Meta Learnings Session
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search sessions..."
            className={cn(
              'w-full pl-8 pr-8 py-1.5 rounded-lg',
              'text-xs text-gray-900 dark:text-gray-100',
              'bg-gray-100 dark:bg-gray-800',
              'border border-transparent',
              'focus:border-[#5B50BD] dark:focus:border-[#918AD3]',
              'focus:outline-none focus:ring-1 focus:ring-[#5B50BD]/20',
              'placeholder:text-gray-400 dark:placeholder:text-gray-500'
            )}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-1">
          {[
            { id: 'all' as FilterType, label: 'All' },
            { id: 'calculators' as FilterType, label: 'Calculators', icon: Calculator },
            { id: 'meta-learnings' as FilterType, label: 'Insights', icon: Brain },
          ].map((filter) => (
            <button
              key={filter.id}
              onClick={() => setFilterType(filter.id)}
              className={cn(
                'flex items-center gap-1 px-2 py-1 rounded-md',
                'text-[10px] font-medium transition-colors',
                filterType === filter.id
                  ? 'bg-[#5B50BD] dark:bg-[#918AD3] text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
              )}
            >
              {filter.icon && <filter.icon className="w-2.5 h-2.5" />}
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {filteredSessions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3">
              <Filter className="w-5 h-5 text-gray-400" />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              {searchQuery ? 'No sessions match your search' : 'No sessions yet'}
            </p>
            <p className="text-[10px] text-gray-400 dark:text-gray-500">
              {searchQuery
                ? 'Try a different search term'
                : 'Create a new session to start collaborating'}
            </p>
          </div>
        ) : (
          filteredSessions.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              isActive={session.id === activeCoworkingSessionId}
              onOpen={handleOpen}
              onShare={handleShare}
              onArchive={handleArchive}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Footer with archived count */}
      {archivedCount > 0 && (
        <div className="flex-shrink-0 px-4 py-2 border-t border-gray-200 dark:border-gray-700">
          <button
            className="text-[10px] text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            {archivedCount} archived session{archivedCount !== 1 ? 's' : ''}
          </button>
        </div>
      )}
    </div>
  );
}
