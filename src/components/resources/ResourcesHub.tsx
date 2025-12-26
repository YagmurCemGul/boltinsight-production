'use client';

import { useState, useMemo, useCallback } from 'react';
import {
  FolderOpen,
  ExternalLink,
  Lightbulb,
  BookOpen,
  FileText,
  TrendingUp,
  Users,
  ArrowRight,
  Search,
  Plus,
  Globe,
  BarChart3,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, Input, Button } from '@/components/ui';

interface ResourceCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  section: string;
  color: string;
  stats?: { label: string; value: string | number }[];
  features: string[];
}

const RESOURCE_CATEGORIES: ResourceCategory[] = [
  {
    id: 'library',
    label: 'External Resources',
    description: 'Curated links to census data, statistics portals, and research tools from around the world.',
    icon: <ExternalLink className="w-6 h-6" />,
    section: 'library',
    color: 'bg-blue-500',
    features: [
      'Census & population data',
      'Statistics portals',
      'Research tools & calculators',
      'Country-specific resources',
    ],
  },
  {
    id: 'meta-learnings',
    label: 'Meta Learnings',
    description: 'AI-powered insights and analytics from your proposal history to improve success rates.',
    icon: <Lightbulb className="w-6 h-6" />,
    section: 'meta-learnings',
    color: 'bg-purple-500',
    features: [
      'Proposal success patterns',
      'Client performance analytics',
      'Author performance tracking',
      'AI-powered analysis',
    ],
  },
];

// Quick access links
const QUICK_LINKS = [
  { label: 'US Census Bureau', url: 'https://www.census.gov/data.html', country: 'USA' },
  { label: 'Eurostat', url: 'https://ec.europa.eu/eurostat', country: 'EU' },
  { label: 'TurkStat', url: 'https://www.tuik.gov.tr', country: 'Turkey' },
  { label: 'UK ONS', url: 'https://www.ons.gov.uk', country: 'UK' },
  { label: 'Statista', url: 'https://www.statista.com', country: 'Global' },
];

export function ResourcesHub() {
  const { setActiveSection, proposals } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate quick stats - memoized to avoid recalculation on every render
  const { totalProposals, approvedProposals, approvalRate } = useMemo(() => {
    const total = proposals.filter(p => p.status !== 'deleted').length;
    const approved = proposals.filter(p => p.status === 'client_approved' || p.status === 'manager_approved').length;
    const rate = total > 0 ? Math.round((approved / total) * 100) : 0;
    return { totalProposals: total, approvedProposals: approved, approvalRate: rate };
  }, [proposals]);

  const handleCategoryClick = useCallback((section: string) => {
    setActiveSection(section);
  }, [setActiveSection]);

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FolderOpen className="w-6 h-6 text-[#5B50BD]" />
              Resources
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              External links, insights, and learning resources
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Quick Stats Row */}
        <div className="grid gap-4 md:grid-cols-3 mb-8">
          <div className="rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30 p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-500 rounded-lg">
                <ExternalLink className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">6</p>
                <p className="text-sm text-blue-600 dark:text-blue-400">External Links</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30 p-4 border border-purple-200 dark:border-purple-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-500 rounded-lg">
                <BarChart3 className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">{totalProposals}</p>
                <p className="text-sm text-purple-600 dark:text-purple-400">Proposals Analyzed</p>
              </div>
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30 p-4 border border-green-200 dark:border-green-700">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500 rounded-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300">{approvalRate}%</p>
                <p className="text-sm text-green-600 dark:text-green-400">Approval Rate</p>
              </div>
            </div>
          </div>
        </div>

        {/* Resource Categories */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Resource Categories</h2>
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {RESOURCE_CATEGORIES.map((category) => (
            <Card
              key={category.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-[#5B50BD]/30"
              onClick={() => handleCategoryClick(category.section)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={cn('p-3 rounded-xl text-white', category.color)}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-[#5B50BD] transition-colors">
                      {category.label}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {category.description}
                    </p>

                    {/* Features */}
                    <div className="mt-4 space-y-1.5">
                      {category.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#5B50BD]" />
                          {feature}
                        </div>
                      ))}
                    </div>

                    {/* Action */}
                    <div className="mt-4 flex items-center text-sm font-medium text-[#5B50BD] group-hover:gap-2 transition-all">
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Access Links */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Access</h2>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Popular External Resources</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {QUICK_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:border-[#5B50BD] hover:shadow-sm transition-all group"
              >
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-[#5B50BD]" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{link.label}</p>
                  <p className="text-xs text-gray-500">{link.country}</p>
                </div>
              </a>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setActiveSection('library')}
              className="text-[#5B50BD]"
            >
              <Plus className="w-4 h-4 mr-2" />
              View All & Add New
            </Button>
          </div>
        </div>

        {/* Learning Section */}
        <div className="bg-gradient-to-br from-[#5B50BD]/5 to-[#1ED6BB]/5 rounded-xl p-6 border border-[#5B50BD]/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#5B50BD] rounded-xl text-white">
              <BookOpen className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Learning Center
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Discover best practices for proposal creation, learn from successful patterns, and improve your research methodology.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  onClick={() => setActiveSection('meta-learnings')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-[#5B50BD] hover:text-[#5B50BD] transition-colors"
                >
                  <Lightbulb className="w-4 h-4" />
                  View Insights
                </button>
                <button
                  onClick={() => setActiveSection('library')}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-[#5B50BD] hover:text-[#5B50BD] transition-colors"
                >
                  <FileText className="w-4 h-4" />
                  Browse Resources
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
