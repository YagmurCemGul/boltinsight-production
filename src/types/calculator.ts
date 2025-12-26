// Calculator Types for BoltInsight Research Tools

export type CalculatorType = 'sample' | 'moe' | 'maxdiff' | 'demographics' | 'feasibility' | 'loi';

export type ConfidenceLevel = 90 | 95 | 99;

export type Methodology = 'online' | 'cati' | 'f2f' | 'clt' | 'mixed';

export type QualityRating = 'excellent' | 'good' | 'acceptable' | 'poor';

export type CostTier = 'low' | 'standard' | 'medium' | 'high' | 'premium';

export type FeasibilityVerdict = 'green' | 'yellow' | 'red';

// AI Insight Types
export interface AIInsight {
  id: string;
  type: 'recommendation' | 'warning' | 'benchmark' | 'optimization';
  message: string;
  confidence: number; // 0-1
  action?: {
    label: string;
    field: string;
    value: string | number;
  };
}

// Calculator Result Base
export interface CalculatorResultBase {
  id: string;
  type: CalculatorType;
  timestamp: Date;
  linkedProposalId?: string;
  linkedProposalTitle?: string;
}

// Sample Size Calculator
export interface SampleSizeInputs {
  confidenceLevel: ConfidenceLevel;
  marginOfError: number;
  populationSize?: number;
  responseDistribution: number; // 0-100, default 50
}

export interface SampleSizeOutputs {
  recommendedSample: number;
  minimumSample: number;
  maximumSample: number;
  subgroupCapacity: number; // How many subgroups can be analyzed
  estimatedCost?: number;
  qualityRating: QualityRating;
}

export interface SampleSizeResult extends CalculatorResultBase {
  type: 'sample';
  inputs: SampleSizeInputs;
  outputs: SampleSizeOutputs;
  aiInsights: AIInsight[];
}

// Margin of Error Calculator
export interface MOEInputs {
  sampleSize: number;
  confidenceLevel: ConfidenceLevel;
  populationSize?: number;
}

export interface MOEOutputs {
  marginOfError: number;
  qualityRating: QualityRating;
  interpretation: string;
  clientFriendly: string;
  whatIf: {
    toReach3Percent: number;
    toReach5Percent: number;
  };
}

export interface MOEResult extends CalculatorResultBase {
  type: 'moe';
  inputs: MOEInputs;
  outputs: MOEOutputs;
  aiInsights: AIInsight[];
}

// MaxDiff Calculator
export interface MaxDiffInputs {
  totalItems: number;
  itemsPerSet: number;
  sampleSize: number;
  customTasks?: number;
}

export interface MaxDiffOutputs {
  recommendedTasks: number;
  totalComparisons: number;
  timesEachItemShown: number;
  isBalancedDesign: boolean;
  reliabilityScore: 'high' | 'medium' | 'low';
  estimatedDuration: number; // minutes
  minimumSampleForUtilities: number;
}

export interface MaxDiffResult extends CalculatorResultBase {
  type: 'maxdiff';
  inputs: MaxDiffInputs;
  outputs: MaxDiffOutputs;
  aiInsights: AIInsight[];
}

// Demographics Distribution
export interface DemographicsInputs {
  country: string;
  region?: string;
  ageRange: [number, number];
  gender: 'all' | 'male' | 'female';
  totalSample: number;
  additionalCriteria?: string[];
}

export interface AgeQuota {
  range: string;
  percentage: number;
  count: number;
}

export interface GenderQuota {
  gender: string;
  percentage: number;
  count: number;
}

export interface DemographicsOutputs {
  ageDistribution: AgeQuota[];
  genderDistribution: GenderQuota[];
  incidenceRate: number;
  isAchievable: boolean;
  hardToReach: string[];
  dataSource: string;
  lastUpdated: string;
}

export interface DemographicsResult extends CalculatorResultBase {
  type: 'demographics';
  inputs: DemographicsInputs;
  outputs: DemographicsOutputs;
  aiInsights: AIInsight[];
}

// Feasibility Check
export interface FeasibilityInputs {
  methodology: Methodology;
  sampleSize: number;
  countries: string[];
  timeline: number; // days
  targetAudience: string;
  incidenceRate: number;
  loi?: number;
  specialRequirements?: string[];
}

export interface DimensionScore {
  dimension: 'sample' | 'timeline' | 'cost' | 'quality';
  score: number; // 0-100
  notes: string;
}

export interface FeasibilityRisk {
  level: 'high' | 'medium' | 'low';
  description: string;
  mitigation: string;
}

export interface FeasibilityOutputs {
  overallScore: number; // 0-100
  verdict: FeasibilityVerdict;
  dimensions: DimensionScore[];
  risks: FeasibilityRisk[];
  estimatedCost: number;
  estimatedDays: number;
  recommendations: string[];
}

export interface FeasibilityResult extends CalculatorResultBase {
  type: 'feasibility';
  inputs: FeasibilityInputs;
  outputs: FeasibilityOutputs;
  aiInsights: AIInsight[];
}

// LOI Calculator
export interface LOIInputs {
  questions: {
    singleChoice: number;
    multipleChoice: number;
    matrix: { questions: number; items: number };
    openEndShort: number;
    openEndLong: number;
    ranking: number;
    maxDiffSets: number;
    conjointTasks: number;
  };
  media: {
    images: number;
    videos: { count: number; avgDuration: number };
  };
  introScreens: number;
}

export interface LOIOutputs {
  estimatedLOI: number; // minutes
  minLOI: number;
  maxLOI: number;
  costTier: CostTier;
  fatiguePoint: number; // minutes
  dropoutRisk: 'low' | 'medium' | 'high';
  speedingRisk: number; // percentage
  costPerRespondent: number;
  optimizationSuggestions: string[];
}

export interface LOIResult extends CalculatorResultBase {
  type: 'loi';
  inputs: LOIInputs;
  outputs: LOIOutputs;
  aiInsights: AIInsight[];
}

// Union type for all results
export type CalculatorResult =
  | SampleSizeResult
  | MOEResult
  | MaxDiffResult
  | DemographicsResult
  | FeasibilityResult
  | LOIResult;

// Calculator Configuration for favorites
export interface CalculatorConfig {
  id: string;
  name: string;
  type: CalculatorType;
  inputs: Record<string, unknown>;
  createdAt: Date;
}

// Proposal Context for @ mention
export interface ProposalContext {
  id: string;
  title: string;
  code?: string;
  methodology?: string;
  sampleSize?: number;
  countries?: string[];
  loi?: number;
  quotas?: string;
}

// Client Context for @ mention
export interface ClientContext {
  id: string;
  name: string;
  recentProposals: ProposalRef[];
  typicalMethodology?: Methodology;
  averageSampleSize?: number;
  commonCountries?: string[];
  totalProjects?: number;
  lastProjectDate?: string;
}

export interface ProposalRef {
  id: string;
  title: string;
  code?: string;
  date: string;
}

// Project Context for @ mention
export interface ProjectContext {
  id: string;
  name: string;
  client?: string;
  proposals: ProposalRef[];
  status: 'active' | 'completed' | 'archived';
  methodology?: Methodology;
  targetSampleSize?: number;
  targetCountries?: string[];
}

// Mention Entity Types
export type MentionEntityType = 'proposal' | 'client' | 'project';

export interface MentionEntity {
  id: string;
  type: MentionEntityType;
  label: string;
  subLabel?: string;
  metadata: ProposalContext | ClientContext | ProjectContext;
}

// Auto-fill mapping for calculators
export interface CalculatorAutoFill {
  sampleSize?: number;
  confidenceLevel?: ConfidenceLevel;
  marginOfError?: number;
  countries?: string[];
  methodology?: Methodology;
  loi?: number;
  timeline?: number;
  incidenceRate?: number;
  targetAudience?: string;
}

// Calculator State
export interface CalculatorState {
  history: CalculatorResult[];
  favorites: CalculatorConfig[];
  currentProposalContext: ProposalContext | null;

  // Actions
  addResult: (result: CalculatorResult) => void;
  clearHistory: () => void;
  removeFromHistory: (id: string) => void;
  addFavorite: (config: CalculatorConfig) => void;
  removeFavorite: (id: string) => void;
  setProposalContext: (context: ProposalContext | null) => void;

  // Selectors
  getRecentByType: (type: CalculatorType, limit?: number) => CalculatorResult[];
}

// Benchmark Data Types
export interface MOEBenchmark {
  range: [number, number];
  rating: QualityRating;
  description: string;
}

export interface SampleSizeBenchmark {
  methodology: string;
  typical: number;
  minimum: number;
  description: string;
}

export interface LOICostTier {
  tier: CostTier;
  minLOI: number;
  maxLOI: number;
  costMultiplier: number;
  description: string;
}

export interface CensusData {
  country: string;
  source: string;
  lastUpdated: string;
  ageDistribution: { range: string; percentage: number }[];
  genderDistribution: { gender: string; percentage: number }[];
  urbanRural?: { type: string; percentage: number }[];
}
