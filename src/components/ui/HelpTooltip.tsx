'use client';

import { useState, useRef, useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { HelpCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

// Research glossary terms
export const researchGlossary: Record<string, { term: string; definition: string; example?: string }> = {
  loi: {
    term: 'LOI (Length of Interview)',
    definition: 'The estimated time in minutes that a survey takes to complete. Longer LOI typically increases costs and can affect response quality.',
    example: 'A typical brand health survey has a LOI of 15-20 minutes.',
  },
  incidence: {
    term: 'Incidence Rate (IR)',
    definition: 'The percentage of people in the general population who qualify for a study based on screening criteria. Lower incidence rates increase fieldwork costs.',
    example: 'A study targeting luxury car owners might have an incidence rate of 5%.',
  },
  quota: {
    term: 'Quota',
    definition: 'The minimum number of completed surveys required from a specific demographic group to ensure statistical representation.',
    example: 'Setting quotas of 50% male and 50% female ensures gender balance.',
  },
  moe: {
    term: 'MOE (Margin of Error)',
    definition: 'The range within which the true population value is expected to fall. A smaller MOE requires a larger sample size.',
    example: 'A sample of n=400 typically yields a ±5% margin of error at 95% confidence.',
  },
  sampleSize: {
    term: 'Sample Size (n)',
    definition: 'The number of respondents who complete a survey. Larger samples provide more reliable results but increase costs.',
    example: 'Most market research studies use sample sizes between 300-1000 respondents per market.',
  },
  confidenceLevel: {
    term: 'Confidence Level',
    definition: 'The probability that the sample results represent the true population value. Common levels are 90%, 95%, and 99%.',
    example: 'A 95% confidence level means that if you repeated the study 100 times, 95 would produce similar results.',
  },
  nps: {
    term: 'NPS (Net Promoter Score)',
    definition: 'A customer loyalty metric calculated by subtracting the percentage of detractors from promoters. Scores range from -100 to +100.',
    example: 'An NPS of +50 is considered excellent in most industries.',
  },
  csat: {
    term: 'CSAT (Customer Satisfaction Score)',
    definition: 'A metric measuring customer satisfaction, typically on a 1-5 or 1-10 scale, expressed as a percentage of satisfied customers.',
    example: 'A CSAT of 80% means 80% of respondents rated their satisfaction as 4 or 5 out of 5.',
  },
  maxdiff: {
    term: 'MaxDiff Analysis',
    definition: 'A survey technique that asks respondents to choose the most and least important items from a set, providing robust preference rankings.',
    example: 'MaxDiff is commonly used to rank product features or brand attributes.',
  },
  conjoint: {
    term: 'Conjoint Analysis',
    definition: 'A statistical technique that determines how people value different product attributes by analyzing trade-off decisions.',
    example: 'Conjoint analysis can reveal the optimal price point for a new product.',
  },
  segmentation: {
    term: 'Market Segmentation',
    definition: 'The process of dividing a market into distinct groups of consumers with similar needs, characteristics, or behaviors.',
    example: 'Segmentation might identify "health-conscious millennials" as a distinct target group.',
  },
  ua: {
    term: 'U&A (Usage & Attitude)',
    definition: 'A comprehensive study type that explores how consumers use products and their attitudes toward brands and categories.',
    example: 'U&A studies help identify usage occasions and purchase drivers.',
  },
  esomar: {
    term: 'ESOMAR',
    definition: 'European Society for Opinion and Marketing Research - the global voice of the data, research and insights community.',
    example: 'Following ESOMAR guidelines ensures ethical research practices.',
  },
  fieldwork: {
    term: 'Fieldwork',
    definition: 'The data collection phase of a research project when surveys are administered to respondents.',
    example: 'Fieldwork typically takes 2-4 weeks depending on sample requirements.',
  },
  screener: {
    term: 'Screener',
    definition: 'A set of qualification questions at the beginning of a survey to ensure respondents meet the target criteria.',
    example: 'A screener might filter for "primary grocery shoppers aged 25-54".',
  },
  weighting: {
    term: 'Data Weighting',
    definition: 'A statistical adjustment applied to survey data to ensure the sample matches known population characteristics.',
    example: 'Weighting can correct for oversampling of certain demographics.',
  },
  topline: {
    term: 'Topline Report',
    definition: 'An initial summary of survey results showing frequency distributions for all questions, delivered quickly after fieldwork.',
    example: 'Topline reports are typically delivered within 48 hours of fieldwork completion.',
  },
  crosstab: {
    term: 'Cross-tabulation (Crosstab)',
    definition: 'A table showing the relationship between two or more variables, breaking down responses by demographic or behavioral groups.',
    example: 'A crosstab might show brand awareness by age group and region.',
  },
};

interface TooltipPosition {
  top: number;
  left: number;
}

interface HelpTooltipProps {
  term: keyof typeof researchGlossary | string;
  children?: ReactNode;
  showIcon?: boolean;
  iconSize?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function HelpTooltip({
  term,
  children,
  showIcon = true,
  iconSize = 'sm',
  className,
}: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const glossaryEntry = researchGlossary[term.toLowerCase()];

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 320;
      const tooltipHeight = 150; // Approximate height

      let left = rect.left + rect.width / 2 - tooltipWidth / 2;
      let top = rect.bottom + 8;

      // Ensure tooltip stays within viewport
      if (left < 8) left = 8;
      if (left + tooltipWidth > window.innerWidth - 8) {
        left = window.innerWidth - tooltipWidth - 8;
      }

      // Position above if not enough space below
      if (top + tooltipHeight > window.innerHeight - 8) {
        top = rect.top - tooltipHeight - 8;
      }

      setPosition({ top, left });
    }
  }, [isOpen]);

  if (!glossaryEntry) {
    // If term not found in glossary, just render children
    return <>{children}</>;
  }

  const iconSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  const tooltipContent = isOpen && (
    <div
      ref={tooltipRef}
      className="fixed z-[400] w-80 rounded-lg bg-gray-900 dark:bg-gray-800 p-4 shadow-xl border border-gray-700 animate-tooltip"
      style={{ top: position.top, left: position.left }}
    >
      {/* Arrow */}
      <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rotate-45 bg-gray-900 dark:bg-gray-800 border-l border-t border-gray-700" />

      <div className="relative">
        <h4 className="text-sm font-semibold text-white mb-2">{glossaryEntry.term}</h4>
        <p className="text-sm text-gray-300 leading-relaxed">{glossaryEntry.definition}</p>
        {glossaryEntry.example && (
          <p className="text-xs text-gray-400 mt-2 italic">
            Example: {glossaryEntry.example}
          </p>
        )}
      </div>
    </div>
  );

  return (
    <>
      <span
        ref={triggerRef}
        className={cn(
          'inline-flex items-center gap-1 cursor-help',
          className
        )}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
        {showIcon && (
          <HelpCircle
            className={cn(
              iconSizeClasses[iconSize],
              'text-gray-400 hover:text-[#5B50BD] transition-colors'
            )}
          />
        )}
      </span>
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
}

// Standalone tooltip that can wrap any content
interface TooltipProps {
  content: ReactNode;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ content, children, position = 'top', className }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<TooltipPosition>({ top: 0, left: 0 });
  const triggerRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isOpen && triggerRef.current) {
      const rect = triggerRef.current.getBoundingClientRect();
      const tooltipWidth = 200;
      const gap = 8;

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top - gap;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'bottom':
          top = rect.bottom + gap;
          left = rect.left + rect.width / 2 - tooltipWidth / 2;
          break;
        case 'left':
          top = rect.top + rect.height / 2;
          left = rect.left - tooltipWidth - gap;
          break;
        case 'right':
          top = rect.top + rect.height / 2;
          left = rect.right + gap;
          break;
      }

      // Ensure tooltip stays within viewport
      if (left < 8) left = 8;
      if (left + tooltipWidth > window.innerWidth - 8) {
        left = window.innerWidth - tooltipWidth - 8;
      }

      setCoords({ top, left });
    }
  }, [isOpen, position]);

  const tooltipContent = isOpen && (
    <div
      className={cn(
        'fixed z-[400] px-3 py-2 rounded-md bg-gray-900 dark:bg-gray-800 text-sm text-white shadow-lg max-w-[200px]',
        'animate-tooltip',
        position === 'top' && 'transform -translate-y-full',
        position === 'left' || position === 'right' && 'transform -translate-y-1/2',
        className
      )}
      style={{ top: coords.top, left: coords.left }}
    >
      {content}
    </div>
  );

  return (
    <>
      <span
        ref={triggerRef}
        className="inline-block"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        {children}
      </span>
      {typeof document !== 'undefined' && createPortal(tooltipContent, document.body)}
    </>
  );
}

// Helper component to highlight terms inline
interface GlossaryTermProps {
  term: keyof typeof researchGlossary;
  children?: ReactNode;
}

export function GlossaryTerm({ term, children }: GlossaryTermProps) {
  const glossaryEntry = researchGlossary[term.toLowerCase()];

  return (
    <HelpTooltip term={term} showIcon={false}>
      <span className="border-b border-dotted border-gray-400 hover:border-[#5B50BD] hover:text-[#5B50BD] transition-colors">
        {children || glossaryEntry?.term || term}
      </span>
    </HelpTooltip>
  );
}
