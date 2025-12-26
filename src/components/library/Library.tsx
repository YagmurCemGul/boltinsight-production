'use client';

import { useState, useEffect, ReactNode } from 'react';
import {
  Library as LibraryIcon,
  Plus,
  Search,
  Trash2,
  ExternalLink,
  Globe,
  X,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import {
  Button,
  Input,
  Select,
  Modal,
  Card,
  CardContent,
  Badge,
} from '@/components/ui';
import type { LibraryItem } from '@/types';

const COUNTRY_OPTIONS = [
  { value: '', label: 'All Countries' },
  { value: 'usa', label: 'United States' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'germany', label: 'Germany' },
  { value: 'france', label: 'France' },
  { value: 'turkey', label: 'Turkey' },
  { value: 'spain', label: 'Spain' },
  { value: 'italy', label: 'Italy' },
  { value: 'netherlands', label: 'Netherlands' },
  { value: 'brazil', label: 'Brazil' },
  { value: 'japan', label: 'Japan' },
  { value: 'australia', label: 'Australia' },
  { value: 'canada', label: 'Canada' },
  { value: 'global', label: 'Global' },
];

// Mock external links data
const MOCK_EXTERNAL_LINKS: LibraryItem[] = [
  {
    id: 'ext-1',
    name: 'US Census Bureau - Population Data',
    description: 'Official US population statistics, demographics, and economic data',
    url: 'https://www.census.gov/data.html',
    category: 'external_link',
    tags: ['population', 'demographics', 'census', 'usa'],
    country: 'usa',
    createdAt: new Date('2024-01-15'),
  },
  {
    id: 'ext-2',
    name: 'TurkStat - Turkish Statistical Institute',
    description: 'Official statistics on Turkey - population, economy, social data',
    url: 'https://www.tuik.gov.tr',
    category: 'external_link',
    tags: ['population', 'demographics', 'census', 'turkey'],
    country: 'turkey',
    createdAt: new Date('2024-01-10'),
  },
  {
    id: 'ext-3',
    name: 'Eurostat - European Statistics',
    description: 'Statistical office of the European Union',
    url: 'https://ec.europa.eu/eurostat',
    category: 'external_link',
    tags: ['population', 'economy', 'europe'],
    country: 'global',
    createdAt: new Date('2024-02-01'),
  },
  {
    id: 'ext-4',
    name: 'UK Office for National Statistics',
    description: 'UK official statistics on population, economy and society',
    url: 'https://www.ons.gov.uk',
    category: 'external_link',
    tags: ['population', 'demographics', 'uk'],
    country: 'uk',
    createdAt: new Date('2024-01-20'),
  },
  {
    id: 'ext-5',
    name: 'Statista - Market Research Portal',
    description: 'Global market and consumer data across industries',
    url: 'https://www.statista.com',
    category: 'external_link',
    tags: ['market-research', 'trends', 'industry'],
    country: 'global',
    createdAt: new Date('2024-02-15'),
  },
  {
    id: 'ext-6',
    name: 'SurveyMonkey - Sample Size Calculator',
    description: 'Calculate the right sample size for your survey',
    url: 'https://www.surveymonkey.com/mp/sample-size-calculator/',
    category: 'external_link',
    tags: ['calculator', 'sample-size', 'methodology'],
    country: 'global',
    createdAt: new Date('2024-03-01'),
  },
];

interface LibraryProps {
  onActionsChange?: (actions: ReactNode) => void;
}

export function Library({ onActionsChange }: LibraryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [tagFilter, setTagFilter] = useState('');
  const [isAddLinkModalOpen, setIsAddLinkModalOpen] = useState(false);
  const [externalLinks, setExternalLinks] = useState<LibraryItem[]>(MOCK_EXTERNAL_LINKS);
  const [newLink, setNewLink] = useState<{
    name: string;
    description: string;
    url: string;
    country: string;
  }>({
    name: '',
    description: '',
    url: '',
    country: 'global',
  });
  const [newLinkTags, setNewLinkTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');

  // Filter external links
  const filteredExternalLinks = externalLinks.filter((link) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !link.name.toLowerCase().includes(query) &&
        !link.description.toLowerCase().includes(query) &&
        !link.tags?.some(tag => tag.toLowerCase().includes(query))
      ) {
        return false;
      }
    }
    if (countryFilter && link.country !== countryFilter) {
      return false;
    }
    if (tagFilter && !link.tags?.includes(tagFilter)) {
      return false;
    }
    return true;
  });

  // Get unique tags from external links
  const allTags = Array.from(new Set(externalLinks.flatMap(link => link.tags || [])));

  // Pass actions to parent for rendering in breadcrumbs
  useEffect(() => {
    if (onActionsChange) {
      const actions = (
        <Button size="sm" onClick={() => setIsAddLinkModalOpen(true)} className="gap-1.5 h-7 text-xs">
          <Plus className="h-3.5 w-3.5" />
          Add Link
        </Button>
      );
      onActionsChange(actions);
    }
  }, [onActionsChange]);

  const handleAddLink = () => {
    if (!newLink.name || !newLink.url) return;

    const newLinkItem: LibraryItem = {
      id: `ext-${Date.now()}`,
      name: newLink.name,
      description: newLink.description,
      url: newLink.url,
      category: 'external_link',
      tags: newLinkTags,
      country: newLink.country,
      createdAt: new Date(),
    };

    setExternalLinks([newLinkItem, ...externalLinks]);
    setNewLink({
      name: '',
      description: '',
      url: '',
      country: 'global',
    });
    setNewLinkTags([]);
    setTagInput('');
    setIsAddLinkModalOpen(false);
  };

  const handleDeleteLink = (id: string) => {
    if (confirm('Are you sure you want to delete this link?')) {
      setExternalLinks(externalLinks.filter(link => link.id !== id));
    }
  };

  return (
    <div className="flex h-full flex-col bg-gray-50 dark:bg-gray-900">
      {/* Filters */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 px-6 py-4">
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search links..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select
            options={COUNTRY_OPTIONS}
            value={countryFilter}
            onChange={(e) => setCountryFilter(e.target.value)}
            className="w-48"
          />
          <Select
            options={[
              { value: '', label: 'All Tags' },
              ...allTags.map(tag => ({ value: tag, label: tag })),
            ]}
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="w-48"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {filteredExternalLinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ExternalLink className="mb-4 h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="mb-2 text-lg font-medium text-gray-900 dark:text-white">No external links found</h3>
            <p className="mb-4 text-sm text-gray-500 dark:text-gray-400">
              Add links to external resources like census data, statistics portals, and research tools
            </p>
            <Button onClick={() => setIsAddLinkModalOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Add Link
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredExternalLinks.map((link) => (
              <ExternalLinkCard key={link.id} link={link} onDelete={handleDeleteLink} />
            ))}
          </div>
        )}
      </div>

      {/* Add External Link Modal */}
      <Modal
        isOpen={isAddLinkModalOpen}
        onClose={() => setIsAddLinkModalOpen(false)}
        title="Add External Link"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Name <span className="text-red-500">*</span>
            </label>
            <Input
              value={newLink.name}
              onChange={(e) => setNewLink({ ...newLink, name: e.target.value })}
              placeholder="e.g., US Census Bureau"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Description
            </label>
            <Input
              value={newLink.description}
              onChange={(e) => setNewLink({ ...newLink, description: e.target.value })}
              placeholder="Brief description of the resource"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              URL <span className="text-red-500">*</span>
            </label>
            <Input
              value={newLink.url}
              onChange={(e) => setNewLink({ ...newLink, url: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Country
            </label>
            <Select
              options={COUNTRY_OPTIONS.filter(c => c.value !== '')}
              value={newLink.country}
              onChange={(e) => setNewLink({ ...newLink, country: e.target.value })}
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">
              Tags
            </label>
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const value = tagInput.trim();
                  if (value && !newLinkTags.includes(value)) {
                    setNewLinkTags([...newLinkTags, value]);
                    setTagInput('');
                  }
                }
              }}
              placeholder="Type a tag and press Enter"
            />
            <p className="mt-1 text-xs text-gray-500">
              Add tags to help categorize and find this link
            </p>
            {newLinkTags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {newLinkTags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="default"
                    className="text-xs flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      className="ml-1 text-[10px]"
                      onClick={() => setNewLinkTags(newLinkTags.filter((t) => t !== tag))}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setIsAddLinkModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLink} disabled={!newLink.name || !newLink.url}>
              Add Link
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

function ExternalLinkCard({ link, onDelete }: { link: LibraryItem; onDelete: (id: string) => void }) {
  const countryLabel = COUNTRY_OPTIONS.find(c => c.value === link.country)?.label || link.country;
  let faviconUrl: string | null = null;
  try {
    const hostname = new URL(link.url).hostname;
    faviconUrl = `https://www.google.com/s2/favicons?domain=${hostname}&sz=64`;
  } catch (err) {
    faviconUrl = null;
  }

  return (
    <Card className="group relative transition-shadow hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300 overflow-hidden">
            {faviconUrl ? (
              <img src={faviconUrl} alt="favicon" className="h-6 w-6 rounded" />
            ) : (
              <ExternalLink className="h-5 w-5" />
            )}
          </div>

          <div className="flex-1 overflow-hidden">
            <h3 className="font-medium text-gray-900 dark:text-white">{link.name}</h3>
            {link.description && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">{link.description}</p>
            )}

            {/* Country Badge */}
            {link.country && (
              <div className="mt-2 flex items-center gap-1">
                <Globe className="h-3 w-3 text-gray-400" />
                <span className="text-xs text-gray-500">{countryLabel}</span>
              </div>
            )}

            {/* Tags */}
            {link.tags && link.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {link.tags.slice(0, 4).map((tag) => (
                  <Badge key={tag} variant="default" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {link.tags.length > 4 && (
                  <Badge variant="default" className="text-xs">
                    +{link.tags.length - 4}
                  </Badge>
                )}
              </div>
            )}

            <div className="mt-3 flex items-center gap-2">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
              >
                <ExternalLink className="h-3 w-3" />
                Open Link
              </a>
              <span className="text-gray-300">|</span>
              <span className="text-xs text-gray-400">
                Added {formatDate(link.createdAt)}
              </span>
            </div>
          </div>
        </div>

        {/* Delete button */}
        <button
          onClick={() => onDelete(link.id)}
          className="absolute right-2 top-2 rounded p-1 text-gray-400 opacity-0 transition-opacity hover:bg-gray-100 hover:text-red-600 group-hover:opacity-100"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </CardContent>
    </Card>
  );
}
