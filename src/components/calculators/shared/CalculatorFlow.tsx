'use client';

import { useState, useMemo } from 'react';
import {
  Play,
  Check,
  Circle,
  ArrowRight,
  X,
  ChevronRight,
  Workflow,
  Users,
  Percent,
  Clock,
  BarChart3,
  PieChart,
  ClipboardCheck,
  DollarSign,
} from 'lucide-react';
import { Button, Card, CardContent } from '@/components/ui';
import {
  PREDEFINED_FLOWS,
  getFlowById,
  calculateFlowProgress,
  getFlowSummary,
  type CalculatorFlow as FlowType,
  type FlowExecutionState,
  type FlowStep,
} from '@/lib/calculators/flow-manager';
import type { CalculatorType } from '@/types/calculator';
import { cn } from '@/lib/utils';

const CALCULATOR_ICONS: Record<CalculatorType, typeof Users> = {
  sample: Users,
  moe: Percent,
  loi: Clock,
  maxdiff: BarChart3,
  demographics: PieChart,
  feasibility: ClipboardCheck,
};

interface CalculatorFlowProps {
  flowState: FlowExecutionState | null;
  onStartFlow: (flowId: string) => void;
  onStepClick: (step: CalculatorType) => void;
  onExitFlow: () => void;
}

export function CalculatorFlow({
  flowState,
  onStartFlow,
  onStepClick,
  onExitFlow,
}: CalculatorFlowProps) {
  const [showFlowSelector, setShowFlowSelector] = useState(!flowState);

  if (!flowState && showFlowSelector) {
    return <FlowSelector onSelect={onStartFlow} onClose={() => setShowFlowSelector(false)} />;
  }

  if (!flowState) {
    return (
      <Button
        variant="outline"
        onClick={() => setShowFlowSelector(true)}
        className="gap-2"
      >
        <Workflow className="w-4 h-4" />
        Start Flow
      </Button>
    );
  }

  const flow = getFlowById(flowState.flowId);
  if (!flow) return null;

  const summary = getFlowSummary(flowState);
  const progress = calculateFlowProgress(flow, flowState.completedSteps);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-[#5B50BD] to-[#7B6DD8] text-white">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Workflow className="w-5 h-5" />
            <div>
              <h3 className="font-semibold">{flow.name}</h3>
              <p className="text-xs text-white/80">{flow.description}</p>
            </div>
          </div>
          <button
            onClick={onExitFlow}
            className="p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-600 dark:text-gray-400">Progress</span>
          <span className="font-medium text-gray-900 dark:text-white">{progress}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#5B50BD] rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="p-4">
        <div className="space-y-2">
          {flow.steps.map((step, index) => {
            const isCompleted = flowState.completedSteps.includes(step.calculator);
            const isCurrent = flowState.currentStepIndex === index;
            const canExecute = !step.dependsOn || step.dependsOn.every(dep => flowState.completedSteps.includes(dep));

            return (
              <FlowStepItem
                key={step.calculator}
                step={step}
                index={index}
                isCompleted={isCompleted}
                isCurrent={isCurrent}
                canExecute={canExecute}
                onClick={() => onStepClick(step.calculator)}
              />
            );
          })}
        </div>
      </div>

      {/* Summary */}
      {(summary.sampleSize || summary.estimatedCost) && (
        <div className="px-4 py-3 bg-[#EDE9F9] dark:bg-[#231E51] border-t border-[#5B50BD]/20">
          <div className="flex items-center justify-between text-sm">
            {summary.sampleSize && (
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-[#5B50BD]" />
                <span className="text-gray-600 dark:text-gray-400">Sample:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  n={summary.sampleSize.toLocaleString()}
                </span>
              </div>
            )}
            {summary.estimatedCost && (
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#5B50BD]" />
                <span className="text-gray-600 dark:text-gray-400">Est. Cost:</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  ${summary.estimatedCost.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

interface FlowStepItemProps {
  step: FlowStep;
  index: number;
  isCompleted: boolean;
  isCurrent: boolean;
  canExecute: boolean;
  onClick: () => void;
}

function FlowStepItem({ step, index, isCompleted, isCurrent, canExecute, onClick }: FlowStepItemProps) {
  const Icon = CALCULATOR_ICONS[step.calculator];

  return (
    <button
      onClick={onClick}
      disabled={!canExecute}
      className={cn(
        'w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all text-left',
        isCompleted && 'bg-green-50 dark:bg-green-950/20',
        isCurrent && 'bg-[#EDE9F9] dark:bg-[#231E51] ring-2 ring-[#5B50BD]',
        !isCompleted && !isCurrent && canExecute && 'hover:bg-gray-100 dark:hover:bg-gray-800',
        !canExecute && 'opacity-50 cursor-not-allowed'
      )}
    >
      {/* Step indicator */}
      <div className={cn(
        'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0',
        isCompleted && 'bg-green-500 text-white',
        isCurrent && 'bg-[#5B50BD] text-white',
        !isCompleted && !isCurrent && 'bg-gray-200 dark:bg-gray-700 text-gray-500'
      )}>
        {isCompleted ? (
          <Check className="w-4 h-4" />
        ) : (
          <span className="text-sm font-medium">{index + 1}</span>
        )}
      </div>

      {/* Step info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <Icon className={cn(
            'w-4 h-4',
            isCompleted && 'text-green-600',
            isCurrent && 'text-[#5B50BD]',
            !isCompleted && !isCurrent && 'text-gray-400'
          )} />
          <span className={cn(
            'font-medium text-sm',
            isCompleted && 'text-green-700 dark:text-green-400',
            isCurrent && 'text-[#5B50BD] dark:text-[#918AD3]',
            !isCompleted && !isCurrent && 'text-gray-600 dark:text-gray-400'
          )}>
            {step.label}
          </span>
          {step.isOptional && (
            <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 rounded">
              Optional
            </span>
          )}
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
          {step.description}
        </p>
      </div>

      {/* Action indicator */}
      {canExecute && !isCompleted && (
        <ChevronRight className={cn(
          'w-5 h-5 flex-shrink-0',
          isCurrent ? 'text-[#5B50BD]' : 'text-gray-400'
        )} />
      )}
    </button>
  );
}

interface FlowSelectorProps {
  onSelect: (flowId: string) => void;
  onClose: () => void;
}

function FlowSelector({ onSelect, onClose }: FlowSelectorProps) {
  const standardFlows = PREDEFINED_FLOWS.filter(f => f.category === 'standard');
  const advancedFlows = PREDEFINED_FLOWS.filter(f => f.category === 'advanced');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Workflow className="w-5 h-5 text-[#5B50BD]" />
          <h3 className="font-semibold text-gray-900 dark:text-white">Start a Calculation Flow</h3>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      <div className="p-4 space-y-4">
        <div>
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
            Standard Flows
          </h4>
          <div className="space-y-2">
            {standardFlows.map(flow => (
              <FlowCard key={flow.id} flow={flow} onSelect={() => onSelect(flow.id)} />
            ))}
          </div>
        </div>

        {advancedFlows.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Advanced Flows
            </h4>
            <div className="space-y-2">
              {advancedFlows.map(flow => (
                <FlowCard key={flow.id} flow={flow} onSelect={() => onSelect(flow.id)} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

interface FlowCardProps {
  flow: FlowType;
  onSelect: () => void;
}

function FlowCard({ flow, onSelect }: FlowCardProps) {
  return (
    <button
      onClick={onSelect}
      className="w-full flex items-start gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-[#5B50BD] hover:bg-[#EDE9F9]/30 dark:hover:bg-[#231E51]/30 transition-colors text-left"
    >
      <div className="w-10 h-10 rounded-lg bg-[#EDE9F9] dark:bg-[#231E51] flex items-center justify-center flex-shrink-0">
        <Workflow className="w-5 h-5 text-[#5B50BD]" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-medium text-gray-900 dark:text-white">{flow.name}</h4>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{flow.description}</p>
        <div className="flex items-center gap-1 mt-2">
          {flow.steps.map((step, i) => {
            const Icon = CALCULATOR_ICONS[step.calculator];
            return (
              <div key={step.calculator} className="flex items-center">
                <div className="w-6 h-6 rounded bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <Icon className="w-3 h-3 text-gray-500" />
                </div>
                {i < flow.steps.length - 1 && (
                  <ArrowRight className="w-3 h-3 text-gray-300 mx-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Play className="w-5 h-5 text-[#5B50BD] flex-shrink-0" />
    </button>
  );
}

// Compact flow indicator
interface FlowIndicatorProps {
  flowState: FlowExecutionState;
  onStepClick?: (step: CalculatorType) => void;
}

export function FlowIndicator({ flowState, onStepClick }: FlowIndicatorProps) {
  const flow = getFlowById(flowState.flowId);
  if (!flow) return null;

  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-[#EDE9F9] dark:bg-[#231E51] rounded-lg">
      <Workflow className="w-4 h-4 text-[#5B50BD]" />
      <span className="text-xs font-medium text-[#5B50BD] dark:text-[#918AD3]">
        {flow.name}
      </span>
      <span className="text-xs text-gray-500 dark:text-gray-400">
        Step {flowState.currentStepIndex + 1}/{flow.steps.length}
      </span>
    </div>
  );
}
