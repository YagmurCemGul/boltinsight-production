'use client';

import { useState, useCallback } from 'react';
import {
  Users,
  Percent,
  Clock,
  BarChart3,
  PieChart,
  ClipboardCheck,
  X,
  History,
  Star,
  Layers,
  Sparkles,
  GitCompare,
  Workflow,
  ChevronRight,
  MessageSquare,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import { useCalculatorStore } from '@/lib/calculators/store';
import { cn } from '@/lib/utils';
import type { CalculatorResult, CalculatorType } from '@/types/calculator';

// Import calculators
import { SampleSizeCalculator } from './calculators/SampleSizeCalculator';
import { MarginOfErrorCalculator } from './calculators/MarginOfErrorCalculator';
import { LOICalculator } from './calculators/LOICalculator';
import { MaxDiffCalculator } from './calculators/MaxDiffCalculator';
import { DemographicsDistribution } from './calculators/DemographicsDistribution';
import { FeasibilityCheck } from './calculators/FeasibilityCheck';

// Import panels
import { HistoryPanel } from './HistoryPanel';
import { FavoritesPanel } from './FavoritesPanel';
import { CalculatorFlow, ComparePanel } from './shared';
import { getFlowById } from '@/lib/calculators/flow-manager';
import { CalculatorChat } from './CalculatorChat';

type CalculatorTab = 'sample' | 'moe' | 'loi' | 'maxdiff' | 'demographics' | 'feasibility';

const CALCULATOR_TABS: { id: CalculatorTab; label: string; icon: typeof Users; color: string }[] = [
  { id: 'sample', label: 'Sample Size', icon: Users, color: 'text-blue-600' },
  { id: 'moe', label: 'Margin of Error', icon: Percent, color: 'text-blue-600' },
  { id: 'loi', label: 'LOI', icon: Clock, color: 'text-green-600' },
  { id: 'maxdiff', label: 'MaxDiff', icon: BarChart3, color: 'text-[#5B50BD]' },
  { id: 'demographics', label: 'Demographics', icon: PieChart, color: 'text-teal-600' },
  { id: 'feasibility', label: 'Feasibility', icon: ClipboardCheck, color: 'text-amber-600' },
];

interface CalculatorHubProps {
  onClose?: () => void;
  fullScreen?: boolean;
  defaultTab?: CalculatorTab;
}

export function CalculatorHub({ onClose, fullScreen = false, defaultTab = 'sample' }: CalculatorHubProps) {
  const [activeTab, setActiveTab] = useState<CalculatorTab>(defaultTab);
  const [isChatOpen, setIsChatOpen] = useState(false);

  const {
    history,
    favorites,
    historyPanelOpen,
    favoritesPanelOpen,
    comparePanelOpen,
    comparisonResults,
    activeFlow,
    flowMode,
    toggleHistoryPanel,
    toggleFavoritesPanel,
    toggleComparePanel,
    removeFromComparison,
    clearComparison,
    startFlow,
    exitFlow,
  } = useCalculatorStore();

  // Handle selecting a result from history
  const handleSelectHistoryResult = useCallback((result: CalculatorResult) => {
    setActiveTab(result.type as CalculatorTab);
    // The calculator component will handle loading the result
  }, []);

  // Handle selecting a favorite
  const handleSelectFavorite = useCallback((config: { type: CalculatorType }) => {
    setActiveTab(config.type as CalculatorTab);
  }, []);

  // Handle flow step click
  const handleFlowStepClick = useCallback((step: CalculatorType) => {
    setActiveTab(step as CalculatorTab);
  }, []);

  const renderCalculator = () => {
    switch (activeTab) {
      case 'sample':
        return <SampleSizeCalculator />;
      case 'moe':
        return <MarginOfErrorCalculator />;
      case 'loi':
        return <LOICalculator />;
      case 'maxdiff':
        return <MaxDiffCalculator />;
      case 'demographics':
        return <DemographicsDistribution />;
      case 'feasibility':
        return <FeasibilityCheck />;
      default:
        return null;
    }
  };

  const containerClass = fullScreen
    ? 'fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-hidden flex flex-col'
    : 'h-full flex flex-col';

  return (
    <div className={containerClass}>
      {/* Header */}
      <div className="flex-shrink-0 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B50BD] to-[#1ED6BB] flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900 dark:text-white">Research Calculators</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                AI-powered tools for research planning
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Flow indicator */}
            {activeFlow && (
              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-[#EDE9F9] dark:bg-[#231E51] rounded-lg">
                <Workflow className="w-4 h-4 text-[#5B50BD]" />
                <span className="text-sm font-medium text-[#5B50BD] dark:text-[#918AD3]">
                  {getFlowById(activeFlow.flowId)?.name}
                </span>
                <span className="text-xs text-gray-500">
                  Step {activeFlow.currentStepIndex + 1}
                </span>
              </div>
            )}

            {/* Action buttons */}
            <div className="hidden md:flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsChatOpen(true)}
                className={cn(
                  'bg-gradient-to-r from-[#5B50BD]/10 to-[#1ED6BB]/10',
                  'border-[#5B50BD]/30 hover:border-[#5B50BD]',
                  'text-[#5B50BD] hover:text-[#4A41A0]'
                )}
              >
                <MessageSquare className="w-4 h-4 mr-1" />
                AI Chat
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleHistoryPanel}
                className={cn(historyPanelOpen && 'bg-[#EDE9F9] border-[#5B50BD]')}
              >
                <History className={cn('w-4 h-4 mr-1', historyPanelOpen && 'text-[#5B50BD]')} />
                <span className={cn(historyPanelOpen && 'text-[#5B50BD]')}>{history.length}</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={toggleFavoritesPanel}
                className={cn(favoritesPanelOpen && 'bg-yellow-50 border-yellow-500')}
              >
                <Star className={cn('w-4 h-4 mr-1', favoritesPanelOpen && 'text-yellow-500 fill-yellow-500')} />
                <span className={cn(favoritesPanelOpen && 'text-yellow-600')}>{favorites.length}</span>
              </Button>

              {comparisonResults.length > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleComparePanel}
                  className={cn(comparePanelOpen && 'bg-green-50 border-green-500')}
                >
                  <GitCompare className={cn('w-4 h-4 mr-1', comparePanelOpen && 'text-green-600')} />
                  <span className={cn(comparePanelOpen && 'text-green-600')}>{comparisonResults.length}</span>
                </Button>
              )}
            </div>

            {onClose && (
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="w-4 h-4 mr-1" />
                Close
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex-shrink-0 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 px-6 py-2">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-1 overflow-x-auto pb-1">
            {CALCULATOR_TABS.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              const isInFlow = activeFlow?.completedSteps.includes(tab.id as CalculatorType);
              const isCurrentFlowStep = activeFlow &&
                getFlowById(activeFlow.flowId)?.steps[activeFlow.currentStepIndex]?.calculator === tab.id;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={cn(
                    'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                    isActive
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-white/50 dark:hover:bg-gray-800/50',
                    isInFlow && 'ring-2 ring-green-500 ring-offset-1',
                    isCurrentFlowStep && !isActive && 'ring-2 ring-[#5B50BD] ring-offset-1'
                  )}
                >
                  <Icon className={cn('w-4 h-4', isActive && tab.color)} />
                  {tab.label}
                  {isInFlow && (
                    <span className="w-2 h-2 rounded-full bg-green-500" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-hidden flex">
        {/* Calculator Content */}
        <div className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="max-w-4xl mx-auto p-6">
            {/* Flow widget (when in flow mode) */}
            {activeFlow && (
              <div className="mb-6">
                <CalculatorFlow
                  flowState={activeFlow}
                  onStartFlow={startFlow}
                  onStepClick={handleFlowStepClick}
                  onExitFlow={exitFlow}
                />
              </div>
            )}

            {/* Calculator */}
            {renderCalculator()}
          </div>
        </div>

        {/* Compare Panel (inline when open) */}
        {comparePanelOpen && comparisonResults.length > 0 && (
          <div className="w-96 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-y-auto">
            <ComparePanel
              results={comparisonResults}
              onRemove={removeFromComparison}
              onClear={clearComparison}
              onClose={toggleComparePanel}
            />
          </div>
        )}
      </div>

      {/* AI Assistant hint */}
      <div className="flex-shrink-0 bg-gradient-to-r from-[#5B50BD]/5 to-[#1ED6BB]/5 border-t border-[#5B50BD]/10 px-6 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <Sparkles className="w-4 h-4 text-[#5B50BD]" />
            <span>Use @ to reference a proposal and auto-fill calculator inputs</span>
          </div>
          {!activeFlow && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => startFlow('full-feasibility')}
              className="text-[#5B50BD] border-[#5B50BD]/30 hover:bg-[#5B50BD]/10"
            >
              <Workflow className="w-4 h-4 mr-1" />
              Start Flow
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          )}
        </div>
      </div>

      {/* Side Panels */}
      <HistoryPanel
        isOpen={historyPanelOpen}
        onClose={toggleHistoryPanel}
        onSelectResult={handleSelectHistoryResult}
        position="right"
      />

      <FavoritesPanel
        isOpen={favoritesPanelOpen}
        onClose={toggleFavoritesPanel}
        onSelectFavorite={handleSelectFavorite}
        position="right"
      />

      {/* AI Chat Panel */}
      <CalculatorChat
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        calculatorType={activeTab}
      />
    </div>
  );
}

// Quick access component for use in other parts of the app
interface QuickCalculatorProps {
  type: CalculatorTab;
  onOpenFull?: () => void;
}

export function QuickCalculator({ type, onOpenFull }: QuickCalculatorProps) {
  const tab = CALCULATOR_TABS.find((t) => t.id === type);
  if (!tab) return null;

  const Icon = tab.icon;

  return (
    <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={onOpenFull}>
      <CardContent className="p-4 flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          'bg-gray-100 dark:bg-gray-800'
        )}>
          <Icon className={cn('w-5 h-5', tab.color)} />
        </div>
        <div className="flex-1">
          <h4 className="font-medium text-gray-900 dark:text-white">{tab.label}</h4>
          <p className="text-xs text-gray-500 dark:text-gray-400">Click to open calculator</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Export calculator tabs for external use
export { CALCULATOR_TABS };
export type { CalculatorTab };
