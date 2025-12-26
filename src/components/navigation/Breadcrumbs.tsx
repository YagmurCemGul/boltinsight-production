'use client';

import { ChevronRight, Home, Copy, Check } from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { ReactNode, useState, useCallback } from 'react';

export interface BreadcrumbItem {
  label: string;
  section?: string;
  current?: boolean;
  tooltip?: string; // Tooltip for the current item
  tooltipExtra?: { // Extra info to show in tooltip (like client/code for proposals)
    label: string;
    value: string;
  }[];
  onClick?: () => void; // Custom click handler (takes precedence over section navigation)
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
  actions?: ReactNode; // Action buttons to show on the right
}

// Generate breadcrumbs based on active section
function generateBreadcrumbs(
  activeSection: string,
  currentProposal?: { code?: string; content: { title?: string; client?: string } } | null,
  currentProject?: { name: string } | null,
  currentChatProject?: { name: string } | null,
  currentConversation?: { title: string } | null,
  myProposalsCount?: number,
  allProposalsCount?: number,
  onProjectClick?: () => void
): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];

  switch (activeSection) {
    case 'dashboard':
      breadcrumbs.push({ label: 'Dashboard', current: true });
      break;

    case 'new-proposal':
      breadcrumbs.push({ label: 'Proposals', section: 'search-my' });
      breadcrumbs.push({ label: 'New Proposal', current: true });
      break;

    case 'view-proposal':
      breadcrumbs.push({ label: 'Proposals', section: 'search-my' });
      const proposalTooltipExtra: { label: string; value: string }[] = [];
      if (currentProposal?.code) {
        proposalTooltipExtra.push({ label: 'Code', value: currentProposal.code });
      }
      if (currentProposal?.content?.client) {
        proposalTooltipExtra.push({ label: 'Brand', value: currentProposal.content.client });
      }
      breadcrumbs.push({
        label: currentProposal?.content?.title || 'Untitled Proposal',
        current: true,
        tooltipExtra: proposalTooltipExtra.length > 0 ? proposalTooltipExtra : undefined,
      });
      break;

    case 'search-my':
      breadcrumbs.push({ label: 'Proposals', section: 'search-my' });
      breadcrumbs.push({ label: 'My Proposals', current: true, tooltip: `Search through your ${myProposalsCount || 0} proposals` });
      break;

    case 'search-all':
      breadcrumbs.push({ label: 'Proposals', section: 'search-my' });
      breadcrumbs.push({ label: 'All Proposals', current: true, tooltip: `Search through all ${allProposalsCount || 0} proposals` });
      break;

    case 'library':
      breadcrumbs.push({ label: 'Library', current: true, tooltip: 'External links and resources' });
      break;

    case 'meta-learnings':
      breadcrumbs.push({ label: 'Meta Learnings', current: true, tooltip: 'AI-powered proposal insights' });
      break;

    case 'calculators':
      breadcrumbs.push({ label: 'Research Calculators', current: true, tooltip: 'Calculate sample size, margin of error, and more' });
      break;

    case 'tools':
      breadcrumbs.push({ label: 'Tools', current: true });
      break;

    case 'resources':
      breadcrumbs.push({ label: 'Resources', current: true });
      break;

    case 'chat-projects':
      if (currentChatProject && currentConversation) {
        // Viewing a conversation: Project Name > Conversation Name
        breadcrumbs.push({
          label: currentChatProject.name,
          onClick: onProjectClick, // Go to project overview without clearing conversation data
        });
        breadcrumbs.push({ label: currentConversation.title, current: true });
      } else if (currentChatProject) {
        // Viewing project overview: Projects > Project Name
        breadcrumbs.push({ label: 'Projects', section: 'chat-projects' });
        breadcrumbs.push({ label: currentChatProject.name, current: true });
      } else {
        // Viewing projects list
        breadcrumbs.push({ label: 'Projects', current: true });
      }
      break;

    case 'history':
      breadcrumbs.push({ label: 'History', current: true });
      break;

    case 'settings':
      breadcrumbs.push({ label: 'Settings', current: true });
      break;

    case 'system-settings':
      breadcrumbs.push({ label: 'Settings', section: 'settings' });
      breadcrumbs.push({ label: 'System', current: true });
      break;

    case 'admin-dashboard':
      breadcrumbs.push({ label: 'Settings', section: 'settings' });
      breadcrumbs.push({ label: 'Administration', current: true });
      break;

    case 'developer-dashboard':
      breadcrumbs.push({ label: 'Settings', section: 'settings' });
      breadcrumbs.push({ label: 'Developer', current: true });
      break;

    case 'example-proposals':
      breadcrumbs.push({ label: 'Settings', section: 'settings' });
      breadcrumbs.push({ label: 'Example Documents', current: true });
      break;

    default:
      if (activeSection.startsWith('project-')) {
        breadcrumbs.push({ label: 'Projects', section: 'chat-projects' });
        breadcrumbs.push({
          label: currentProject?.name || 'Project',
          current: true,
        });
      }
      break;
  }

  return breadcrumbs;
}

export function Breadcrumbs({ items, className, actions }: BreadcrumbsProps) {
  const { activeSection, currentProposal, currentProject, currentChatProject, currentConversation, setActiveSection, setCurrentChatProject, setCurrentConversation, proposals, currentUser } = useAppStore();
  const [showTooltip, setShowTooltip] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Handle copying tooltip extra value to clipboard
  const handleCopyToClipboard = useCallback(async (value: string, index: number) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 1500);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  }, []);

  // Handle clicking project name in breadcrumb - go to project overview without clearing conversation data
  const handleProjectClick = useCallback(() => {
    setCurrentConversation(null); // Just clear the view, conversation data stays in project
  }, [setCurrentConversation]);

  // Calculate proposal counts for dynamic tooltips
  const myProposalsCount = proposals.filter(p => p.status !== 'deleted' && p.author.id === currentUser.id).length;
  const allProposalsCount = proposals.filter(p => p.status !== 'deleted').length;

  // Generate breadcrumbs
  const breadcrumbs = items || generateBreadcrumbs(activeSection, currentProposal, currentProject, currentChatProject, currentConversation, myProposalsCount, allProposalsCount, handleProjectClick);

  // Don't show breadcrumbs if empty or only dashboard
  if (breadcrumbs.length === 0 || (breadcrumbs.length === 1 && breadcrumbs[0]?.label === 'Dashboard')) {
    return null;
  }

  return (
    <nav className={cn('flex items-center justify-between', className)} aria-label="Breadcrumb">
      <div className="flex items-center relative">
        <ol className="flex items-center gap-1.5">
          {/* Home Icon */}
          <li className="flex items-center">
            <button
              onClick={() => setActiveSection('dashboard')}
              className="flex items-center justify-center rounded p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#5B50BD] dark:hover:bg-gray-800 dark:hover:text-[#918AD3]"
              title="Dashboard"
            >
              <Home className="h-4 w-4" />
            </button>
          </li>
          {breadcrumbs.map((item, index) => (
            <li key={index} className="flex items-center gap-1.5">
              <ChevronRight className="w-3.5 h-3.5 text-gray-300 dark:text-gray-600 flex-shrink-0" />
              {item.current ? (
                <div
                  className="relative"
                  onMouseEnter={() => (item.tooltip || item.tooltipExtra) && setShowTooltip(true)}
                  onMouseLeave={() => setShowTooltip(false)}
                >
                  <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px] cursor-default block">
                    {item.label}
                  </span>
                  {/* Tooltip - inside the hover container with padding bridge */}
                  {showTooltip && (item.tooltip || item.tooltipExtra) && (
                    <div className="absolute left-0 top-full pt-2 z-50">
                      <div className="px-3 py-2 text-xs font-medium text-white bg-gray-900 dark:bg-gray-700 rounded-lg shadow-lg animate-in fade-in-0 zoom-in-95 duration-150 whitespace-nowrap">
                        {item.tooltip && (
                          <div>{item.tooltip}</div>
                        )}
                        {item.tooltipExtra && item.tooltipExtra.length > 0 && (
                          <div className={cn("flex items-center gap-2", item.tooltip && "mt-2")}>
                            {item.tooltipExtra.map((extra, i) => (
                              <button
                                key={i}
                                onClick={() => handleCopyToClipboard(extra.value, i)}
                                className="inline-flex items-center gap-1.5 px-2 py-1 bg-white/10 hover:bg-white/20 rounded-full text-[11px] transition-colors cursor-pointer group"
                                title={`Click to copy ${extra.label.toLowerCase()}`}
                              >
                                <span className="text-gray-300">{extra.label}:</span>
                                <span className="text-white font-medium">{extra.value}</span>
                                {copiedIndex === i ? (
                                  <Check className="w-3 h-3 text-green-400" />
                                ) : (
                                  <Copy className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                        <div className="absolute top-[5px] left-4 w-2 h-2 bg-gray-900 dark:bg-gray-700 rotate-45" />
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    if (item.onClick) {
                      item.onClick();
                    } else if (item.section) {
                      setActiveSection(item.section);
                    }
                  }}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-[#5B50BD] dark:hover:text-[#918AD3] transition-colors truncate max-w-[150px]"
                >
                  {item.label}
                </button>
              )}
            </li>
          ))}
        </ol>
      </div>

      {/* Action buttons on the right */}
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </nav>
  );
}
