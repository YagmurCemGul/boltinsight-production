import type {
  CalculatorType,
  CalculatorResult,
  ConfidenceLevel,
  Methodology,
} from '@/types/calculator';

// Flow step definition
export interface FlowStep {
  calculator: CalculatorType;
  label: string;
  description: string;
  isOptional?: boolean;
  dependsOn?: CalculatorType[];
}

// Calculator flow definition
export interface CalculatorFlow {
  id: string;
  name: string;
  description: string;
  steps: FlowStep[];
  category: 'standard' | 'advanced' | 'custom';
}

// Flow execution state
export interface FlowExecutionState {
  flowId: string;
  currentStepIndex: number;
  completedSteps: CalculatorType[];
  results: Partial<Record<CalculatorType, CalculatorResult>>;
  sharedContext: SharedFlowContext;
  startedAt: Date;
}

// Shared context passed between calculators in a flow
export interface SharedFlowContext {
  sampleSize?: number;
  confidenceLevel?: ConfidenceLevel;
  marginOfError?: number;
  loi?: number;
  countries?: string[];
  methodology?: Methodology;
  timeline?: number;
  incidenceRate?: number;
  estimatedCost?: number;
  targetAudience?: string;
}

// Predefined flows
export const PREDEFINED_FLOWS: CalculatorFlow[] = [
  {
    id: 'full-feasibility',
    name: 'Full Feasibility Analysis',
    description: 'Complete project planning from sample size to feasibility check',
    category: 'standard',
    steps: [
      {
        calculator: 'sample',
        label: 'Sample Size',
        description: 'Determine required sample size',
      },
      {
        calculator: 'moe',
        label: 'Margin of Error',
        description: 'Verify precision of results',
        dependsOn: ['sample'],
      },
      {
        calculator: 'loi',
        label: 'Survey Length',
        description: 'Estimate survey duration and cost',
      },
      {
        calculator: 'demographics',
        label: 'Demographics',
        description: 'Plan quota distribution',
        dependsOn: ['sample'],
      },
      {
        calculator: 'feasibility',
        label: 'Feasibility Check',
        description: 'Assess overall project feasibility',
        dependsOn: ['sample', 'loi', 'demographics'],
      },
    ],
  },
  {
    id: 'sample-analysis',
    name: 'Sample & Precision Analysis',
    description: 'Quick sample size and margin of error calculation',
    category: 'standard',
    steps: [
      {
        calculator: 'sample',
        label: 'Sample Size',
        description: 'Calculate required sample',
      },
      {
        calculator: 'moe',
        label: 'Margin of Error',
        description: 'Verify statistical precision',
        dependsOn: ['sample'],
      },
    ],
  },
  {
    id: 'survey-design',
    name: 'Survey Design',
    description: 'Plan survey structure and exercises',
    category: 'standard',
    steps: [
      {
        calculator: 'loi',
        label: 'Survey Length',
        description: 'Estimate total duration',
      },
      {
        calculator: 'maxdiff',
        label: 'MaxDiff Design',
        description: 'Configure MaxDiff exercise',
        isOptional: true,
      },
    ],
  },
  {
    id: 'quick-quote',
    name: 'Quick Quote Preparation',
    description: 'Essential calculations for proposal quotes',
    category: 'standard',
    steps: [
      {
        calculator: 'sample',
        label: 'Sample Size',
        description: 'Determine sample requirements',
      },
      {
        calculator: 'loi',
        label: 'Survey Length',
        description: 'Estimate LOI and costs',
      },
      {
        calculator: 'feasibility',
        label: 'Feasibility',
        description: 'Quick feasibility check',
        dependsOn: ['sample', 'loi'],
      },
    ],
  },
  {
    id: 'tracker-setup',
    name: 'Tracker Study Setup',
    description: 'Planning for tracking studies with waves',
    category: 'advanced',
    steps: [
      {
        calculator: 'sample',
        label: 'Sample per Wave',
        description: 'Calculate per-wave sample',
      },
      {
        calculator: 'moe',
        label: 'Precision Check',
        description: 'Verify wave-to-wave precision',
        dependsOn: ['sample'],
      },
      {
        calculator: 'demographics',
        label: 'Quota Structure',
        description: 'Define tracking quotas',
        dependsOn: ['sample'],
      },
      {
        calculator: 'loi',
        label: 'Survey Duration',
        description: 'Optimize for repeated fielding',
      },
    ],
  },
];

// Get flow by ID
export function getFlowById(id: string): CalculatorFlow | undefined {
  return PREDEFINED_FLOWS.find((flow) => flow.id === id);
}

// Get flows by category
export function getFlowsByCategory(category: CalculatorFlow['category']): CalculatorFlow[] {
  return PREDEFINED_FLOWS.filter((flow) => flow.category === category);
}

// Create a new flow execution state
export function createFlowExecution(flowId: string): FlowExecutionState | null {
  const flow = getFlowById(flowId);
  if (!flow) return null;

  return {
    flowId,
    currentStepIndex: 0,
    completedSteps: [],
    results: {},
    sharedContext: {},
    startedAt: new Date(),
  };
}

// Check if a step can be executed
export function canExecuteStep(
  flow: CalculatorFlow,
  stepIndex: number,
  completedSteps: CalculatorType[]
): boolean {
  const step = flow.steps[stepIndex];
  if (!step) return false;

  // Check dependencies
  if (step.dependsOn) {
    return step.dependsOn.every((dep) => completedSteps.includes(dep));
  }

  return true;
}

// Get next available step
export function getNextAvailableStep(
  flow: CalculatorFlow,
  completedSteps: CalculatorType[]
): number {
  for (let i = 0; i < flow.steps.length; i++) {
    const step = flow.steps[i];
    if (!completedSteps.includes(step.calculator) && canExecuteStep(flow, i, completedSteps)) {
      return i;
    }
  }
  return -1; // All steps completed
}

// Update shared context from result
export function updateSharedContext(
  context: SharedFlowContext,
  result: CalculatorResult
): SharedFlowContext {
  const updated = { ...context };

  switch (result.type) {
    case 'sample':
      updated.sampleSize = result.outputs.recommendedSample;
      updated.confidenceLevel = result.inputs.confidenceLevel;
      break;

    case 'moe':
      updated.marginOfError = result.outputs.marginOfError;
      updated.sampleSize = result.inputs.sampleSize;
      updated.confidenceLevel = result.inputs.confidenceLevel;
      break;

    case 'loi':
      updated.loi = result.outputs.estimatedLOI;
      break;

    case 'demographics':
      updated.countries = [result.inputs.country];
      updated.incidenceRate = result.outputs.incidenceRate;
      break;

    case 'feasibility':
      updated.estimatedCost = result.outputs.estimatedCost;
      updated.methodology = result.inputs.methodology;
      updated.timeline = result.inputs.timeline;
      break;
  }

  return updated;
}

// Calculate flow progress percentage
export function calculateFlowProgress(
  flow: CalculatorFlow,
  completedSteps: CalculatorType[]
): number {
  const requiredSteps = flow.steps.filter((s) => !s.isOptional);
  const completedRequired = requiredSteps.filter((s) =>
    completedSteps.includes(s.calculator)
  );
  return Math.round((completedRequired.length / requiredSteps.length) * 100);
}

// Get flow summary for display
export function getFlowSummary(state: FlowExecutionState): {
  totalSteps: number;
  completedSteps: number;
  currentStep: string;
  progress: number;
  estimatedCost?: number;
  sampleSize?: number;
} {
  const flow = getFlowById(state.flowId);
  if (!flow) {
    return {
      totalSteps: 0,
      completedSteps: 0,
      currentStep: 'Unknown',
      progress: 0,
    };
  }

  const currentStepInfo = flow.steps[state.currentStepIndex];

  return {
    totalSteps: flow.steps.length,
    completedSteps: state.completedSteps.length,
    currentStep: currentStepInfo?.label || 'Complete',
    progress: calculateFlowProgress(flow, state.completedSteps),
    estimatedCost: state.sharedContext.estimatedCost,
    sampleSize: state.sharedContext.sampleSize,
  };
}

// Create custom flow
export function createCustomFlow(
  name: string,
  steps: CalculatorType[],
  description?: string
): CalculatorFlow {
  const stepConfigs: Record<CalculatorType, { label: string; description: string }> = {
    sample: { label: 'Sample Size', description: 'Calculate required sample' },
    moe: { label: 'Margin of Error', description: 'Check statistical precision' },
    loi: { label: 'Survey Length', description: 'Estimate duration and cost' },
    maxdiff: { label: 'MaxDiff Design', description: 'Configure MaxDiff exercise' },
    demographics: { label: 'Demographics', description: 'Plan quota distribution' },
    feasibility: { label: 'Feasibility', description: 'Assess project feasibility' },
  };

  return {
    id: `custom-${Date.now()}`,
    name,
    description: description || `Custom flow with ${steps.length} steps`,
    category: 'custom',
    steps: steps.map((calculator) => ({
      calculator,
      ...stepConfigs[calculator],
    })),
  };
}
