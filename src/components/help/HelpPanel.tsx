'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  HelpCircle,
  X,
  ChevronRight,
  BookOpen,
  Calculator,
  FileText,
  MessageSquare,
  LayoutDashboard,
  ExternalLink,
  EyeOff,
  MoreVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { researchGlossary } from '@/components/ui/HelpTooltip';
import { useAppStore } from '@/lib/store';

interface HelpTopic {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  content: string;
  relatedTerms?: string[];
}

const helpTopics: Record<string, HelpTopic[]> = {
  dashboard: [
    {
      id: 'dashboard-overview',
      title: 'Dashboard Overview',
      description: 'Understanding your dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      content: 'Your dashboard shows an overview of your recent activity, pending approvals, and quick access to common actions. You can customize the layout by dragging widgets or using the settings button.',
      relatedTerms: ['nps', 'csat'],
    },
    {
      id: 'quick-actions',
      title: 'Quick Actions',
      description: 'Shortcuts to common tasks',
      icon: <ChevronRight className="w-4 h-4" />,
      content: 'Quick actions provide one-click access to frequently used features like creating new proposals, accessing calculators, or viewing your library.',
    },
  ],
  'new-proposal': [
    {
      id: 'chat-mode',
      title: 'Chat Mode',
      description: 'AI-powered proposal creation',
      icon: <MessageSquare className="w-4 h-4" />,
      content: 'In Chat Mode, describe your research needs in natural language. Our AI assistant will help structure your proposal by asking clarifying questions and suggesting appropriate methodologies.',
      relatedTerms: ['loi', 'sampleSize', 'incidence'],
    },
    {
      id: 'editor-modes',
      title: 'Editor Modes',
      description: 'Form vs Document editing',
      icon: <FileText className="w-4 h-4" />,
      content: 'Switch between Chat Mode for AI-assisted creation and Document Editor for structured data entry and final formatting. Document Editor is best for entering data systematically and fine-tuning the final presentation.',
    },
    {
      id: 'sample-considerations',
      title: 'Sample Design',
      description: 'Key sampling concepts',
      icon: <Calculator className="w-4 h-4" />,
      content: 'When designing your sample, consider your target definition, required sample size, margin of error, and quotas. Use our calculators to determine the optimal sample size for your research objectives.',
      relatedTerms: ['sampleSize', 'moe', 'quota', 'incidence'],
    },
  ],
  calculators: [
    {
      id: 'moe-calculator',
      title: 'Margin of Error',
      description: 'Calculate statistical precision',
      icon: <Calculator className="w-4 h-4" />,
      content: 'The margin of error calculator helps you determine the statistical precision of your results. Enter your sample size and confidence level to see the expected margin of error.',
      relatedTerms: ['moe', 'sampleSize', 'confidenceLevel'],
    },
    {
      id: 'sample-size-calc',
      title: 'Sample Size',
      description: 'Determine required respondents',
      icon: <Calculator className="w-4 h-4" />,
      content: 'Use the sample size calculator to determine how many respondents you need. Input your desired margin of error and confidence level to get the minimum required sample size.',
      relatedTerms: ['sampleSize', 'moe', 'confidenceLevel', 'incidence'],
    },
  ],
  library: [
    {
      id: 'templates',
      title: 'Using Templates',
      description: 'Start with proven frameworks',
      icon: <BookOpen className="w-4 h-4" />,
      content: 'Templates provide pre-built proposal structures for common research types. Select a template that matches your needs and customize it for your specific project.',
      relatedTerms: ['ua', 'nps', 'maxdiff'],
    },
    {
      id: 'methodologies',
      title: 'Methodology Guides',
      description: 'Learn about research methods',
      icon: <BookOpen className="w-4 h-4" />,
      content: 'Our methodology guides explain various research techniques in detail. Reference these guides when choosing the right approach for your research objectives.',
      relatedTerms: ['maxdiff', 'conjoint', 'segmentation'],
    },
  ],
};

interface HelpPanelProps {
  section?: string;
}

export function HelpPanel({ section = 'dashboard' }: HelpPanelProps) {
  const { showHelpButton, setShowHelpButton } = useAppStore();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState<HelpTopic | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const topics = helpTopics[section] || helpTopics.dashboard;

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  // Don't render if hidden
  if (!showHelpButton) {
    return null;
  }

  const panelContent = isOpen && (
    <div className="fixed bottom-20 right-4 z-[9999] w-96 max-h-[60vh] bg-white dark:bg-[#1A163C] rounded-xl shadow-2xl border border-gray-200 dark:border-[#3D3766] overflow-hidden flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-[#5B50BD] to-[#1ED6BB]">
        <div className="flex items-center gap-2 text-white">
          <HelpCircle className="w-5 h-5" />
          <h3 className="font-semibold">Help & Tips</h3>
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            setSelectedTopic(null);
          }}
          className="p-1 rounded-lg hover:bg-white/20 transition-colors"
        >
          <X className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {selectedTopic ? (
          <div className="p-4">
            <button
              onClick={() => setSelectedTopic(null)}
              className="flex items-center gap-1 text-sm text-[#5B50BD] hover:underline mb-4"
            >
              <ChevronRight className="w-3 h-3 rotate-180" />
              Back to topics
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 rounded-lg bg-[#5B50BD]/10 text-[#5B50BD]">
                {selectedTopic.icon}
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {selectedTopic.title}
                </h4>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {selectedTopic.description}
                </p>
              </div>
            </div>

            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
              {selectedTopic.content}
            </p>

            {selectedTopic.relatedTerms && selectedTopic.relatedTerms.length > 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                  Related Terms
                </h5>
                <div className="space-y-2">
                  {selectedTopic.relatedTerms.map((termKey) => {
                    const term = researchGlossary[termKey];
                    if (!term) return null;
                    return (
                      <div
                        key={termKey}
                        className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50"
                      >
                        <h6 className="text-sm font-medium text-gray-900 dark:text-white">
                          {term.term}
                        </h6>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                          {term.definition}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Choose a topic to learn more:
            </p>

            <div className="space-y-2">
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  onClick={() => setSelectedTopic(topic)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group"
                >
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 group-hover:bg-[#5B50BD]/10 group-hover:text-[#5B50BD] transition-colors">
                    {topic.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                      {topic.title}
                    </h4>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {topic.description}
                    </p>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </button>
              ))}
            </div>

            {/* Glossary quick access */}
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <h5 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase mb-3">
                Quick Glossary
              </h5>
              <div className="flex flex-wrap gap-2">
                {['loi', 'moe', 'quota', 'nps', 'incidence'].map((termKey) => {
                  const term = researchGlossary[termKey];
                  if (!term) return null;
                  return (
                    <span
                      key={termKey}
                      className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 cursor-help"
                      title={term.definition}
                    >
                      {term.term.split(' ')[0]}
                    </span>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
        <a
          href="#"
          className="flex items-center justify-center gap-2 text-sm text-[#5B50BD] hover:underline"
        >
          <BookOpen className="w-4 h-4" />
          View Full Documentation
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );

  const handleHide = () => {
    setShowHelpButton(false);
    setShowMenu(false);
    setIsOpen(false);
  };

  const buttonContent = (
    <div ref={menuRef} className="fixed bottom-4 right-4 z-[9998]">
      <button
        onClick={() => {
          if (showMenu) {
            setShowMenu(false);
          } else if (isOpen) {
            setIsOpen(false);
          } else {
            setShowMenu(true);
          }
        }}
        className={cn(
          'p-3 rounded-full shadow-lg transition-all duration-200',
          isOpen
            ? 'bg-[#1A163C] dark:bg-gray-700 text-white rotate-45'
            : 'bg-[#5B50BD] hover:bg-[#4A3FA6] text-white hover:shadow-xl hover:scale-105'
        )}
        aria-label={isOpen ? 'Close help' : 'Open help'}
      >
        {isOpen ? (
          <X className="w-5 h-5" />
        ) : (
          <HelpCircle className="w-5 h-5" />
        )}
      </button>

      {/* Menu - opens on click */}
      {showMenu && !isOpen && (
        <div className="absolute bottom-full right-0 mb-2 w-36 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(false);
              setIsOpen(true);
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <HelpCircle className="w-4 h-4" />
            Open Help
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleHide();
            }}
            className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <EyeOff className="w-4 h-4" />
            Hide
          </button>
        </div>
      )}
    </div>
  );

  if (typeof document === 'undefined') {
    return buttonContent;
  }

  return (
    <>
      {createPortal(buttonContent, document.body)}
      {createPortal(panelContent, document.body)}
    </>
  );
}
