'use client';

import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AtSign, FileText, Building2, FolderOpen, X, Search, Check, Sparkles } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useCalculatorStore } from '@/lib/calculators/store';
import {
  searchEntities,
  getAutoFillFromEntity,
  getEntityTypeConfig,
  formatEntityInfo,
} from '@/lib/calculators/mention-utils';
import type {
  MentionEntity,
  MentionEntityType,
  CalculatorAutoFill,
  CalculatorType,
} from '@/types/calculator';
import { cn } from '@/lib/utils';

const ENTITY_ICONS = {
  proposal: FileText,
  client: Building2,
  project: FolderOpen,
};

interface EntityMentionProps {
  calculatorType: CalculatorType;
  onSelect: (entity: MentionEntity, autoFill: CalculatorAutoFill) => void;
  onClear?: () => void;
  placeholder?: string;
  entityTypes?: MentionEntityType[];
  showAutoFillPreview?: boolean;
}

export function EntityMention({
  calculatorType,
  onSelect,
  onClear,
  placeholder = 'Type @ to reference a proposal, client, or project...',
  entityTypes = ['proposal', 'client', 'project'],
  showAutoFillPreview = true,
}: EntityMentionProps) {
  const { proposals, projects } = useAppStore();
  const { currentProposalContext, setProposalContext } = useCalculatorStore();

  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedEntity, setSelectedEntity] = useState<MentionEntity | null>(null);
  const [activeFilter, setActiveFilter] = useState<MentionEntityType | 'all'>('all');

  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter and search entities
  const filteredEntities = useMemo(() => {
    if (!isOpen && !query) return [];

    const searchTerm = query.startsWith('@') ? query.slice(1) : query;
    const typesToSearch = activeFilter === 'all' ? entityTypes : [activeFilter];

    return searchEntities(searchTerm, proposals, projects, typesToSearch);
  }, [proposals, projects, query, isOpen, activeFilter, entityTypes]);

  // Handle input change
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.startsWith('@') || value.length > 0) {
      setIsOpen(true);
      setSelectedIndex(0);
    } else {
      setIsOpen(false);
    }
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === '@') {
        setIsOpen(true);
      }
      return;
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredEntities.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
        break;
      case 'Enter':
        e.preventDefault();
        if (filteredEntities[selectedIndex]) {
          handleSelectEntity(filteredEntities[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        break;
      case 'Tab':
        // Cycle through filters
        e.preventDefault();
        const filters: (MentionEntityType | 'all')[] = ['all', ...entityTypes];
        const currentIdx = filters.indexOf(activeFilter);
        setActiveFilter(filters[(currentIdx + 1) % filters.length]);
        break;
    }
  }, [isOpen, filteredEntities, selectedIndex, activeFilter, entityTypes]);

  // Select an entity
  const handleSelectEntity = useCallback((entity: MentionEntity) => {
    const autoFill = getAutoFillFromEntity(entity, calculatorType);
    setSelectedEntity(entity);
    onSelect(entity, autoFill);
    setIsOpen(false);
    setQuery('');

    // Also set proposal context if it's a proposal
    if (entity.type === 'proposal') {
      setProposalContext(entity.metadata as any);
    }
  }, [calculatorType, onSelect, setProposalContext]);

  // Clear selection
  const handleClear = useCallback(() => {
    setSelectedEntity(null);
    setProposalContext(null);
    setQuery('');
    onClear?.();
  }, [onClear, setProposalContext]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // If we have a selected entity, show it
  if (selectedEntity || currentProposalContext) {
    const entity = selectedEntity || {
      type: 'proposal' as MentionEntityType,
      label: currentProposalContext?.title || 'Selected',
      subLabel: currentProposalContext?.code,
      metadata: currentProposalContext,
    };

    const config = getEntityTypeConfig(entity.type);
    const Icon = ENTITY_ICONS[entity.type];
    const info = formatEntityInfo(entity as MentionEntity);

    return (
      <div className="relative">
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border',
          config.bgColor,
          'border-gray-200 dark:border-gray-700'
        )}>
          <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center', config.bgColor)}>
            <Icon className={cn('w-4 h-4', config.color)} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                {entity.label}
              </span>
              {entity.subLabel && (
                <span className={cn(
                  'text-xs px-1.5 py-0.5 rounded',
                  config.bgColor,
                  config.color
                )}>
                  {entity.subLabel}
                </span>
              )}
              <span className={cn(
                'text-xs px-1.5 py-0.5 rounded-full uppercase font-semibold',
                config.bgColor,
                config.color
              )}>
                {config.label}
              </span>
            </div>
            {info.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {info.map((item, i) => (
                  <span key={i}>
                    {i > 0 && '• '}
                    {item}
                  </span>
                ))}
              </div>
            )}
          </div>
          {showAutoFillPreview && (
            <div className="flex items-center gap-1 text-xs text-[#5B50BD] dark:text-[#918AD3]">
              <Sparkles className="w-3 h-3" />
              <span>Auto-filled</span>
            </div>
          )}
          <button
            onClick={handleClear}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
          >
            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative">
        <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length > 0 && setIsOpen(true)}
          placeholder={placeholder}
          className={cn(
            'w-full pl-9 pr-3 py-2.5 bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700 rounded-lg',
            'text-sm text-gray-900 dark:text-white placeholder-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-[#5B50BD]/50 focus:border-[#5B50BD]',
            'transition-colors'
          )}
        />
        {query.length > 0 && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <X className="w-3.5 h-3.5 text-gray-400" />
          </button>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div
          ref={dropdownRef}
          className={cn(
            'absolute z-50 w-full mt-1',
            'bg-white dark:bg-gray-800',
            'border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg',
            'max-h-96 overflow-hidden'
          )}
        >
          {/* Filter tabs */}
          {entityTypes.length > 1 && (
            <div className="flex items-center gap-1 p-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
              <button
                onClick={() => setActiveFilter('all')}
                className={cn(
                  'px-2 py-1 text-xs rounded-md transition-colors',
                  activeFilter === 'all'
                    ? 'bg-[#5B50BD] text-white'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                )}
              >
                All
              </button>
              {entityTypes.map((type) => {
                const config = getEntityTypeConfig(type);
                return (
                  <button
                    key={type}
                    onClick={() => setActiveFilter(type)}
                    className={cn(
                      'px-2 py-1 text-xs rounded-md transition-colors capitalize',
                      activeFilter === type
                        ? 'bg-[#5B50BD] text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    )}
                  >
                    {config.label}s
                  </button>
                );
              })}
              <span className="ml-auto text-xs text-gray-400">Tab to filter</span>
            </div>
          )}

          {/* Results */}
          <div className="overflow-y-auto max-h-72">
            {filteredEntities.length === 0 ? (
              <div className="px-4 py-6 text-center">
                <Search className="w-6 h-6 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {query ? 'No results found' : 'Type to search proposals, clients, or projects'}
                </p>
              </div>
            ) : (
              <div className="py-1">
                {filteredEntities.map((entity, index) => {
                  const config = getEntityTypeConfig(entity.type);
                  const Icon = ENTITY_ICONS[entity.type];
                  const info = formatEntityInfo(entity);

                  return (
                    <button
                      key={`${entity.type}-${entity.id}`}
                      onClick={() => handleSelectEntity(entity)}
                      className={cn(
                        'w-full px-3 py-2.5 flex items-start gap-3 text-left',
                        'transition-colors',
                        index === selectedIndex
                          ? 'bg-[#EDE9F9] dark:bg-[#231E51]'
                          : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
                      )}
                    >
                      <div className={cn(
                        'w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0',
                        config.bgColor
                      )}>
                        <Icon className={cn('w-4 h-4', config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900 dark:text-white truncate">
                            {entity.label}
                          </span>
                          {entity.subLabel && (
                            <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                              {entity.subLabel}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                          <span className={cn('font-medium', config.color)}>{config.label}</span>
                          {info.length > 0 && (
                            <>
                              <span>•</span>
                              {info.slice(0, 3).map((item, i) => (
                                <span key={i}>
                                  {i > 0 && '• '}
                                  {item}
                                </span>
                              ))}
                            </>
                          )}
                        </div>
                      </div>
                      {index === selectedIndex && (
                        <Check className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3] flex-shrink-0 mt-1" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer hint */}
          <div className="px-3 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <Sparkles className="w-3 h-3 text-[#5B50BD]" />
              <span>Select to auto-fill calculator with reference data</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// Compact entity badge for inline display
interface EntityBadgeProps {
  entity: MentionEntity;
  onRemove?: () => void;
  size?: 'sm' | 'md';
}

export function EntityBadge({ entity, onRemove, size = 'md' }: EntityBadgeProps) {
  const config = getEntityTypeConfig(entity.type);
  const Icon = ENTITY_ICONS[entity.type];

  return (
    <span className={cn(
      'inline-flex items-center gap-1.5 rounded-full',
      config.bgColor,
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    )}>
      <Icon className={cn('w-3 h-3', config.color)} />
      <span className={cn('font-medium', config.color)}>{entity.label}</span>
      {onRemove && (
        <button
          onClick={onRemove}
          className={cn('hover:opacity-70 transition-opacity', config.color)}
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
