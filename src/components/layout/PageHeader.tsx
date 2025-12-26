'use client';

import { Breadcrumb, type BreadcrumbItem } from '@/components/ui';
import { useAppStore } from '@/lib/store';

// Breadcrumb mapping for all sections
export const breadcrumbMap: Record<string, BreadcrumbItem[]> = {
  // Dashboard - no breadcrumb (home)
  'dashboard': [],

  // Proposals
  'new-proposal': [{ label: 'Proposals' }, { label: 'New Proposal' }],
  'search-my': [{ label: 'Proposals' }, { label: 'My Proposals' }],
  'search-all': [{ label: 'Proposals' }, { label: 'All Proposals' }],
  'view-proposal': [{ label: 'Proposals' }, { label: 'View Proposal' }],

  // Projects
  'chat-projects': [{ label: 'Projects' }],

  // Tools
  'tools': [{ label: 'Tools' }],
  'calculators': [{ label: 'Tools' }, { label: 'Sample Calculator' }],
  'demographics': [{ label: 'Tools' }, { label: 'Demographics' }],
  'feasibility': [{ label: 'Tools' }, { label: 'Feasibility Check' }],

  // Library & Resources
  'library': [{ label: 'Library' }],
  'resources': [{ label: 'Resources' }],
  'meta-learnings': [{ label: 'Meta Learnings' }],

  // Settings & Admin
  'settings': [{ label: 'Settings' }],
  'system-settings': [{ label: 'Settings' }, { label: 'System' }],
  'admin-dashboard': [{ label: 'Settings' }, { label: 'Administration' }],
  'developer-dashboard': [{ label: 'Settings' }, { label: 'Developer' }],
  'example-proposals': [{ label: 'Settings' }, { label: 'Example Documents' }],

  // History
  'history': [{ label: 'History' }],
};

interface PageHeaderProps {
  title: string;
  description?: string;
  actions?: React.ReactNode;
  showBreadcrumb?: boolean;
  customBreadcrumb?: BreadcrumbItem[];
}

export function PageHeader({
  title,
  description,
  actions,
  showBreadcrumb = true,
  customBreadcrumb,
}: PageHeaderProps) {
  const { activeSection, setActiveSection } = useAppStore();

  const breadcrumbItems = customBreadcrumb || breadcrumbMap[activeSection] || [];

  // Handle parent breadcrumb clicks
  const handleBreadcrumbClick = (label: string) => {
    const sectionMap: Record<string, string> = {
      'Proposals': 'search-my',
      'Projects': 'chat-projects',
      'Tools': 'calculators',
      'Library': 'library',
      'Resources': 'resources',
      'Settings': 'settings',
    };
    if (sectionMap[label]) {
      setActiveSection(sectionMap[label]);
    }
  };

  // Add onClick handlers to parent breadcrumbs
  const itemsWithHandlers = breadcrumbItems.map((item, index) => {
    if (index < breadcrumbItems.length - 1) {
      return {
        ...item,
        onClick: () => handleBreadcrumbClick(item.label),
      };
    }
    return item;
  });

  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
      {showBreadcrumb && itemsWithHandlers.length > 0 && (
        <Breadcrumb
          items={itemsWithHandlers}
          onHomeClick={() => setActiveSection('dashboard')}
          className="mb-3"
        />
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>

        {actions && (
          <div className="flex items-center gap-3">
            {actions}
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get dynamic breadcrumb for project pages
export function getProjectBreadcrumb(projectName: string): BreadcrumbItem[] {
  return [
    { label: 'Projects' },
    { label: projectName },
  ];
}

// Helper function to get dynamic breadcrumb for chat project pages
export function getChatProjectBreadcrumb(projectName: string): BreadcrumbItem[] {
  return [
    { label: 'Projects' },
    { label: projectName },
  ];
}
