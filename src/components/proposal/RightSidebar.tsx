'use client';

import { useMemo } from 'react';
import {
  FileText,
  Building2,
  User,
  BookOpen,
  Target,
  HelpCircle,
  Users,
  BarChart3,
  Globe,
  PieChart,
  TrendingUp,
  Link as LinkIcon,
  CheckCircle,
  Circle,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ProposalContent } from '@/types';

export type EditorMode = 'chat' | 'editor';

interface RightSidebarProps {
  content: ProposalContent;
  activeSection?: string;
  onSectionClick?: (sectionId: string) => void;
  collapsed?: boolean;
  compact?: boolean; // Compact mode for Chat Editor - narrower with less detail
  editorMode?: EditorMode;
  onEditorModeChange?: (mode: EditorMode) => void;
}

interface SectionField {
  key: string;
  label: string;
  required: boolean;
  isArray?: boolean;
}

interface Section {
  id: string;
  label: string;
  icon: typeof FileText;
  description?: string;
  fields: SectionField[];
}

const SECTIONS: Section[] = [
  {
    id: 'header',
    label: '1. Header Information',
    icon: FileText,
    fields: [
      { key: 'title', label: 'Title (Proposal Name)', required: true },
      { key: 'client', label: 'Client', required: false },
      { key: 'contact', label: 'Contact', required: false },
    ],
  },
  {
    id: 'background',
    label: '2. Background / Context',
    icon: BookOpen,
    fields: [{ key: 'background', label: 'Background', required: false }],
  },
  {
    id: 'businessObjectives',
    label: '3. Business Objectives',
    icon: TrendingUp,
    description: 'Short bullet list (marketing goals)',
    fields: [{ key: 'businessObjectives', label: 'Business Objectives', required: false, isArray: true }],
  },
  {
    id: 'researchObjectives',
    label: '4. Research Objectives',
    icon: Target,
    description: '"To..." statements + research questions',
    fields: [{ key: 'researchObjectives', label: 'Research Objectives', required: false, isArray: true }],
  },
  {
    id: 'burningQuestions',
    label: 'Burning Questions',
    icon: HelpCircle,
    fields: [{ key: 'burningQuestions', label: 'Burning Questions', required: false, isArray: true }],
  },
  {
    id: 'targetDefinition',
    label: '5. Target Definition',
    icon: Users,
    fields: [{ key: 'targetDefinition', label: 'Target Definition', required: true }],
  },
  {
    id: 'sampleSize',
    label: '6. Sample Size',
    icon: BarChart3,
    fields: [{ key: 'sampleSize', label: 'Sample Size', required: true }],
  },
  {
    id: 'loi',
    label: '7. LOI (Length of Interview)',
    icon: Clock,
    description: 'Survey duration in minutes',
    fields: [{ key: 'loi', label: 'Length of Interview', required: true }],
  },
  {
    id: 'markets',
    label: '8. Markets',
    icon: Globe,
    description: 'Should include language',
    fields: [{ key: 'markets', label: 'Markets', required: true, isArray: true }],
  },
  {
    id: 'quotas',
    label: '9. Quota Recommendations',
    icon: PieChart,
    description: 'System should recommend',
    fields: [{ key: 'quotas', label: 'Quotas', required: false, isArray: true }],
  },
  {
    id: 'advancedAnalysis',
    label: 'Advanced Analysis',
    icon: TrendingUp,
    description: 'System should recommend',
    fields: [{ key: 'advancedAnalysis', label: 'Advanced Analysis', required: false, isArray: true }],
  },
  {
    id: 'referenceProjects',
    label: '10. Reference Projects',
    icon: LinkIcon,
    description: 'Reference proposal list',
    fields: [{ key: 'referenceProjects', label: 'Reference Projects', required: false, isArray: true }],
  },
];

export function RightSidebar({ content, activeSection, onSectionClick, collapsed = false, compact = false, editorMode = 'editor', onEditorModeChange }: RightSidebarProps) {
  const sectionStatus = useMemo(() => {
    const status: Record<string, { complete: boolean; hasContent: boolean }> = {};

    SECTIONS.forEach((section) => {
      let hasContent = false;
      let allRequiredComplete = true;

      section.fields.forEach((field) => {
        const value = content[field.key as keyof ProposalContent];

        if (field.isArray) {
          hasContent = hasContent || (Array.isArray(value) && value.length > 0);
          if (field.required && (!Array.isArray(value) || value.length === 0)) {
            allRequiredComplete = false;
          }
        } else {
          hasContent = hasContent || (value !== undefined && value !== null && value !== '');
          if (field.required && !value) {
            allRequiredComplete = false;
          }
        }
      });

      status[section.id] = {
        complete: allRequiredComplete && hasContent,
        hasContent,
      };
    });

    return status;
  }, [content]);

  const completionStats = useMemo(() => {
    const requiredSections = SECTIONS.filter((s) =>
      s.fields.some((f) => f.required)
    );
    const completedRequired = requiredSections.filter(
      (s) => sectionStatus[s.id]?.complete
    ).length;

    return {
      total: SECTIONS.length,
      completed: Object.values(sectionStatus).filter((s) => s.hasContent).length,
      requiredTotal: requiredSections.length,
      requiredCompleted: completedRequired,
    };
  }, [sectionStatus]);

  const getPreviewValue = (section: typeof SECTIONS[0]): string => {
    const field = section.fields[0];
    const value = content[field.key as keyof ProposalContent];

    if (!value) return '-';

    if (field.isArray && Array.isArray(value)) {
      if (field.key === 'markets') {
        return `${value.length} market${value.length !== 1 ? 's' : ''}`;
      }
      return `${value.length} item${value.length !== 1 ? 's' : ''}`;
    }

    if (typeof value === 'number') {
      if (field.key === 'loi') {
        return `${value} min`;
      }
      return `n=${value.toLocaleString()}`;
    }

    if (typeof value === 'string') {
      return value.length > 30 ? value.substring(0, 30) + '...' : value;
    }

    return '-';
  };

  return (
    <aside className={cn(
      "border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 flex flex-col h-full transition-all duration-200",
      collapsed ? "w-12" : compact ? "w-52" : "w-80"
    )}>
      {/* Header */}
      <div className={cn("border-b border-gray-200 dark:border-gray-700", collapsed ? "p-2" : compact ? "p-3" : "p-4")}>
        {!collapsed && (
          <>
            <h2 className={cn("font-semibold text-gray-900 dark:text-white", compact ? "text-xs" : "text-sm")}>
              {compact ? "Sections" : "Section Content"}
            </h2>
            {!compact && (
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {completionStats.completed}/{completionStats.total} sections complete
              </p>
            )}
            {/* Progress Bar */}
            <div className={cn("h-1.5 rounded-full bg-gray-100 dark:bg-gray-700", compact ? "mt-2" : "mt-3 h-2")}>
              <div
                className="h-full rounded-full bg-[#5B50BD] transition-all duration-300"
                style={{
                  width: `${(completionStats.completed / completionStats.total) * 100}%`,
                }}
              />
            </div>
            {compact && (
              <p className="mt-1 text-[10px] text-gray-400 dark:text-gray-500">
                {completionStats.completed}/{completionStats.total}
              </p>
            )}
          </>
        )}
      </div>

      {/* Sections List */}
      <div className="flex-1 overflow-y-auto">
        <nav className={cn("space-y-0.5", collapsed ? "p-1" : compact ? "p-1.5" : "p-2")}>
          {SECTIONS.map((section) => {
            const status = sectionStatus[section.id];
            const isActive = activeSection === section.id;
            const hasRequired = section.fields.some((f) => f.required);

            const isIncompleteRequired = hasRequired && !status?.complete;

            // Get short label for compact mode (remove number prefix)
            const shortLabel = section.label.replace(/^\d+\.\s*/, '');

            return (
              <button
                key={section.id}
                onClick={() => onSectionClick?.(section.id)}
                className={cn(
                  'w-full rounded-lg text-left transition-all',
                  collapsed ? 'p-2 flex items-center justify-center' : compact ? 'p-2' : 'p-3',
                  isActive
                    ? 'bg-[#EDE9F9] ring-1 ring-[#C8C4E9] dark:bg-[#231E51] dark:ring-[#5B50BD]'
                    : isIncompleteRequired
                    ? 'border border-red-300 dark:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/10'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                )}
                title={collapsed || compact ? section.label : undefined}
              >
                {collapsed ? (
                  /* Collapsed: show only icon */
                  <div className="relative">
                    <section.icon className={cn(
                      'h-5 w-5',
                      isActive ? 'text-[#5B50BD] dark:text-[#918AD3]' : isIncompleteRequired ? 'text-red-400' : 'text-gray-400'
                    )} />
                    {status?.complete ? (
                      <CheckCircle className="absolute -top-1 -right-1 h-3 w-3 text-green-500 bg-white rounded-full" />
                    ) : isIncompleteRequired && (
                      <Circle className="absolute -top-1 -right-1 h-3 w-3 text-red-400 bg-white rounded-full" />
                    )}
                  </div>
                ) : compact ? (
                  /* Compact: simplified row with icon, label, and status */
                  <div className="flex items-center gap-2">
                    <section.icon className={cn(
                      'h-3.5 w-3.5 flex-shrink-0',
                      isActive ? 'text-[#5B50BD] dark:text-[#918AD3]' : 'text-gray-400'
                    )} />
                    <span className={cn(
                      'text-xs font-medium truncate flex-1',
                      isActive ? 'text-[#5B50BD] dark:text-[#918AD3]' : 'text-gray-600 dark:text-gray-300'
                    )}>
                      {shortLabel}
                    </span>
                    {status?.complete ? (
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                    ) : isIncompleteRequired ? (
                      <Circle className="h-3 w-3 text-red-400 flex-shrink-0" />
                    ) : (
                      <Circle className="h-3 w-3 text-gray-300 dark:text-gray-600 flex-shrink-0" />
                    )}
                  </div>
                ) : (
                  /* Expanded: show full content */
                  <div className="flex items-start gap-3">
                    {/* Status Icon */}
                    <div className="mt-0.5">
                      {status?.complete ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : isIncompleteRequired ? (
                        <Circle className="h-4 w-4 text-red-400" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-300 dark:text-gray-500" />
                      )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <section.icon className={cn(
                          'h-4 w-4 flex-shrink-0',
                          isActive ? 'text-[#5B50BD] dark:text-[#918AD3]' : 'text-gray-400'
                        )} />
                        <span className={cn(
                          'text-sm font-medium truncate',
                          isActive ? 'text-[#5B50BD] dark:text-[#918AD3]' : 'text-gray-700 dark:text-gray-200'
                        )}>
                          {section.label}
                        </span>
                        {hasRequired && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                      </div>

                      {section.description && (
                        <p className="mt-0.5 text-xs text-gray-400 dark:text-gray-500 truncate">
                          {section.description}
                        </p>
                      )}

                      {/* Preview Value */}
                      <p className={cn(
                        'mt-1 text-xs truncate',
                        status?.hasContent ? 'text-gray-600 dark:text-gray-400' : 'text-gray-300 dark:text-gray-600'
                      )}>
                        {getPreviewValue(section)}
                      </p>
                    </div>

                    {/* Arrow */}
                    <ChevronRight className={cn(
                      'h-4 w-4 flex-shrink-0 transition-transform',
                      isActive ? 'text-[#5B50BD] dark:text-[#918AD3] rotate-90' : 'text-gray-300 dark:text-gray-600'
                    )} />
                  </div>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer - Quick Stats */}
      {!collapsed && !compact ? (
        <div className="border-t border-gray-200 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800">
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-lg bg-white dark:bg-gray-900 p-2 shadow-sm">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {content.sampleSize?.toLocaleString() || '-'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Sample</p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-2 shadow-sm">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {content.loi ? `${content.loi}m` : '-'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">LOI</p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-2 shadow-sm">
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {content.markets?.length || 0}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Markets</p>
            </div>
          </div>

          {/* Client Info */}
          {content.client && (
            <div className="mt-3 flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
              <Building2 className="h-3 w-3" />
              <span className="truncate">{content.client}</span>
              {content.contact && (
                <>
                  <span className="text-gray-300 dark:text-gray-600">|</span>
                  <User className="h-3 w-3" />
                  <span className="truncate">{content.contact}</span>
                </>
              )}
            </div>
          )}
        </div>
      ) : compact ? (
        /* Compact Footer - Horizontal stats row */
        <div className="border-t border-gray-200 dark:border-gray-700 px-2 py-2 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between gap-1 text-center">
            <div className="flex-1 rounded bg-white dark:bg-gray-900 px-1.5 py-1" title="Sample Size">
              <p className="text-[10px] text-gray-400">n</p>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {content.sampleSize ? (content.sampleSize >= 1000 ? `${(content.sampleSize / 1000).toFixed(0)}k` : content.sampleSize) : '-'}
              </p>
            </div>
            <div className="flex-1 rounded bg-white dark:bg-gray-900 px-1.5 py-1" title="LOI">
              <p className="text-[10px] text-gray-400">LOI</p>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {content.loi ? `${content.loi}m` : '-'}
              </p>
            </div>
            <div className="flex-1 rounded bg-white dark:bg-gray-900 px-1.5 py-1" title="Markets">
              <p className="text-[10px] text-gray-400">Mkts</p>
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {content.markets?.length || 0}
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="border-t border-gray-200 dark:border-gray-700 p-2 bg-gray-50 dark:bg-gray-800">
          <div className="flex flex-col items-center gap-2 text-center">
            <div className="rounded-lg bg-white dark:bg-gray-900 p-1.5 shadow-sm" title="Sample Size">
              <BarChart3 className="h-4 w-4 text-gray-400 mx-auto" />
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {content.sampleSize ? (content.sampleSize >= 1000 ? `${(content.sampleSize / 1000).toFixed(0)}k` : content.sampleSize) : '-'}
              </p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-1.5 shadow-sm" title="LOI (Length of Interview)">
              <Clock className="h-4 w-4 text-gray-400 mx-auto" />
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {content.loi ? `${content.loi}m` : '-'}
              </p>
            </div>
            <div className="rounded-lg bg-white dark:bg-gray-900 p-1.5 shadow-sm" title="Markets">
              <Globe className="h-4 w-4 text-gray-400 mx-auto" />
              <p className="text-xs font-semibold text-gray-900 dark:text-white">
                {content.markets?.length || 0}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
