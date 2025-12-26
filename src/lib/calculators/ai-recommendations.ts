import type {
  AIInsight,
  CalculatorType,
  ConfidenceLevel,
  Methodology,
  SampleSizeInputs,
  SampleSizeOutputs,
  MOEInputs,
  MOEOutputs,
  FeasibilityInputs,
  FeasibilityOutputs,
  LOIInputs,
  LOIOutputs,
  MaxDiffInputs,
  MaxDiffOutputs,
  DemographicsInputs,
  DemographicsOutputs,
} from '@/types/calculator';

// Budget-based sample recommendation
interface BudgetRecommendation {
  budget: number;
  maxSample: number;
  recommendedSample: number;
  moeAtRecommended: number;
  costPerRespondent: number;
  bufferPercentage: number;
}

export function getBudgetBasedRecommendation(
  budget: number,
  country: string = 'Turkey',
  methodology: Methodology = 'online',
  loi: number = 15
): BudgetRecommendation {
  // Base cost per respondent by country (USD)
  const countryCosts: Record<string, number> = {
    turkey: 10,
    uk: 15,
    germany: 14,
    france: 14,
    usa: 12,
    poland: 8,
    netherlands: 15,
    spain: 12,
    italy: 13,
  };

  // LOI multipliers
  const loiMultiplier = loi <= 10 ? 1 : loi <= 15 ? 1.3 : loi <= 20 ? 1.6 : 2;

  // Methodology multipliers
  const methodologyMultiplier: Record<Methodology, number> = {
    online: 1,
    cati: 2.5,
    f2f: 5,
    clt: 3.5,
    mixed: 2,
  };

  const baseCost = countryCosts[country.toLowerCase()] || 12;
  const costPerRespondent = baseCost * loiMultiplier * methodologyMultiplier[methodology];

  const maxSample = Math.floor(budget / costPerRespondent);
  const bufferPercentage = 15; // 15% buffer for quality screening
  const recommendedSample = Math.floor(maxSample * (1 - bufferPercentage / 100));

  // Calculate MOE at recommended sample
  const z = 1.96; // 95% confidence
  const moeAtRecommended = (z * Math.sqrt(0.25 / recommendedSample)) * 100;

  return {
    budget,
    maxSample,
    recommendedSample,
    moeAtRecommended: Math.round(moeAtRecommended * 10) / 10,
    costPerRespondent: Math.round(costPerRespondent * 100) / 100,
    bufferPercentage,
  };
}

// Timeline-based recommendation
interface TimelineRecommendation {
  days: number;
  methodology: Methodology;
  comfortableSample: number;
  aggressiveSample: number;
  riskZone: number;
  dailyCapacity: number;
}

export function getTimelineBasedRecommendation(
  days: number,
  country: string = 'Turkey',
  methodology: Methodology = 'online',
  incidenceRate: number = 100
): TimelineRecommendation {
  // Base daily capacity by methodology
  const dailyCapacity: Record<Methodology, number> = {
    online: 500,
    cati: 80,
    f2f: 30,
    clt: 50,
    mixed: 200,
  };

  // Adjust for incidence rate
  const adjustedCapacity = dailyCapacity[methodology] * (incidenceRate / 100);

  // Soft launch typically takes 1-2 days
  const effectiveDays = Math.max(1, days - 2);

  const comfortableSample = Math.floor(adjustedCapacity * effectiveDays * 0.7);
  const aggressiveSample = Math.floor(adjustedCapacity * effectiveDays);
  const riskZone = Math.floor(adjustedCapacity * effectiveDays * 1.3);

  return {
    days,
    methodology,
    comfortableSample,
    aggressiveSample,
    riskZone,
    dailyCapacity: Math.round(adjustedCapacity),
  };
}

// Subgroup analysis recommendation
interface SubgroupRecommendation {
  totalSample: number;
  subgroupCount: number;
  avgCellSize: number;
  moePerCell: number;
  isReliable: boolean;
  recommendedSample: number;
  recommendation: string;
}

export function getSubgroupRecommendation(
  currentSample: number,
  subgroupCount: number,
  minCellSize: number = 100
): SubgroupRecommendation {
  const avgCellSize = Math.floor(currentSample / subgroupCount);
  const z = 1.96;
  const moePerCell = (z * Math.sqrt(0.25 / avgCellSize)) * 100;
  const isReliable = avgCellSize >= minCellSize;
  const recommendedSample = minCellSize * subgroupCount;

  let recommendation = '';
  if (isReliable) {
    recommendation = `Current sample is sufficient for ${subgroupCount} subgroups with ±${moePerCell.toFixed(1)}% precision per cell.`;
  } else if (avgCellSize >= 50) {
    recommendation = `Current sample provides directional insights per subgroup. For reliable analysis, increase to n=${recommendedSample.toLocaleString()}.`;
  } else {
    recommendation = `⚠️ Sample too small for meaningful subgroup analysis. Consider reducing subgroups or increasing sample to n=${recommendedSample.toLocaleString()}.`;
  }

  return {
    totalSample: currentSample,
    subgroupCount,
    avgCellSize,
    moePerCell: Math.round(moePerCell * 10) / 10,
    isReliable,
    recommendedSample,
    recommendation,
  };
}

// Generate contextual AI recommendations
export function generateContextualRecommendations(
  calculatorType: CalculatorType,
  inputs: Record<string, unknown>,
  outputs: Record<string, unknown>,
  context?: {
    studyType?: string;
    client?: string;
    country?: string;
    budget?: number;
    timeline?: number;
  }
): AIInsight[] {
  const insights: AIInsight[] = [];

  switch (calculatorType) {
    case 'sample':
      insights.push(...generateSampleContextRecommendations(
        inputs as unknown as SampleSizeInputs,
        outputs as unknown as SampleSizeOutputs,
        context
      ));
      break;

    case 'moe':
      insights.push(...generateMOEContextRecommendations(
        inputs as unknown as MOEInputs,
        outputs as unknown as MOEOutputs,
        context
      ));
      break;

    case 'feasibility':
      insights.push(...generateFeasibilityContextRecommendations(
        inputs as unknown as FeasibilityInputs,
        outputs as unknown as FeasibilityOutputs,
        context
      ));
      break;

    case 'loi':
      insights.push(...generateLOIContextRecommendations(
        inputs as unknown as LOIInputs,
        outputs as unknown as LOIOutputs,
        context
      ));
      break;
  }

  return insights;
}

function generateSampleContextRecommendations(
  inputs: SampleSizeInputs,
  outputs: SampleSizeOutputs,
  context?: { studyType?: string; budget?: number; timeline?: number }
): AIInsight[] {
  const insights: AIInsight[] = [];

  // Study type specific recommendations
  const studyType = context?.studyType?.toLowerCase() || '';

  if (studyType.includes('concept') || studyType.includes('pack')) {
    if (outputs.recommendedSample > 400) {
      insights.push({
        id: `sample-concept-${Date.now()}`,
        type: 'recommendation',
        message: `For concept testing, industry standard is 300-400 respondents. Your calculated sample of ${outputs.recommendedSample} provides extra precision for subgroup analysis.`,
        confidence: 0.85,
      });
    }
  }

  if (studyType.includes('track') || studyType.includes('tracker')) {
    if (outputs.recommendedSample < 500) {
      insights.push({
        id: `sample-tracker-${Date.now()}`,
        type: 'warning',
        message: 'Brand tracking studies typically need n≥500 per wave for reliable trend analysis.',
        confidence: 0.9,
        action: {
          label: 'Increase to 500',
          field: 'sampleSize',
          value: 500,
        },
      });
    }
  }

  // Budget context
  if (context?.budget) {
    const budgetRec = getBudgetBasedRecommendation(context.budget);
    if (outputs.recommendedSample > budgetRec.recommendedSample) {
      insights.push({
        id: `sample-budget-${Date.now()}`,
        type: 'warning',
        message: `With $${context.budget.toLocaleString()} budget, maximum achievable sample is ~${budgetRec.recommendedSample.toLocaleString()} respondents. Consider adjusting MOE target.`,
        confidence: 0.8,
        action: {
          label: 'Adjust to budget',
          field: 'marginOfError',
          value: budgetRec.moeAtRecommended,
        },
      });
    }
  }

  // Subgroup capacity warning
  if (outputs.subgroupCapacity < 3 && inputs.marginOfError <= 5) {
    insights.push({
      id: `sample-subgroup-${Date.now()}`,
      type: 'benchmark',
      message: `Current sample supports ${outputs.subgroupCapacity} subgroups with reliable precision. For more demographic breakouts, consider increasing sample.`,
      confidence: 0.75,
    });
  }

  return insights;
}

function generateMOEContextRecommendations(
  inputs: MOEInputs,
  outputs: MOEOutputs,
  context?: { studyType?: string }
): AIInsight[] {
  const insights: AIInsight[] = [];

  // Precision recommendations
  if (outputs.marginOfError > 5) {
    insights.push({
      id: `moe-precision-${Date.now()}`,
      type: 'recommendation',
      message: `±${outputs.marginOfError}% MOE means results within ${outputs.marginOfError}% of each other are statistically tied. Consider this for interpreting close scores.`,
      confidence: 0.95,
    });
  }

  // Sample increase suggestion
  if (outputs.marginOfError > 3 && inputs.sampleSize < outputs.whatIf.toReach3Percent) {
    const increase = outputs.whatIf.toReach3Percent - inputs.sampleSize;
    insights.push({
      id: `moe-increase-${Date.now()}`,
      type: 'optimization',
      message: `Adding ${increase.toLocaleString()} more respondents would achieve ±3% MOE, significantly improving decision confidence.`,
      confidence: 0.85,
      action: {
        label: `Increase to ${outputs.whatIf.toReach3Percent.toLocaleString()}`,
        field: 'sampleSize',
        value: outputs.whatIf.toReach3Percent,
      },
    });
  }

  return insights;
}

function generateFeasibilityContextRecommendations(
  inputs: FeasibilityInputs,
  outputs: FeasibilityOutputs,
  context?: { client?: string }
): AIInsight[] {
  const insights: AIInsight[] = [];

  // Timeline risk
  if (outputs.estimatedDays > inputs.timeline) {
    const overrun = outputs.estimatedDays - inputs.timeline;
    insights.push({
      id: `feas-timeline-${Date.now()}`,
      type: 'warning',
      message: `Project needs ${outputs.estimatedDays} days but only ${inputs.timeline} available. Risk of ${overrun}-day overrun.`,
      confidence: 0.85,
    });
  }

  // Cost efficiency
  const costPerComplete = outputs.estimatedCost / (inputs.sampleSize * inputs.countries.length);
  if (costPerComplete > 25) {
    insights.push({
      id: `feas-cost-${Date.now()}`,
      type: 'benchmark',
      message: `Cost per complete ($${costPerComplete.toFixed(0)}) is above industry average. Consider panel optimization or sample reduction.`,
      confidence: 0.7,
    });
  }

  // Multi-country coordination
  if (inputs.countries.length > 3) {
    insights.push({
      id: `feas-multicountry-${Date.now()}`,
      type: 'recommendation',
      message: `With ${inputs.countries.length} markets, recommend staggered field start to manage quality across regions.`,
      confidence: 0.8,
    });
  }

  return insights;
}

function generateLOIContextRecommendations(
  inputs: LOIInputs,
  outputs: LOIOutputs,
  context?: { studyType?: string }
): AIInsight[] {
  const insights: AIInsight[] = [];

  // Dropout risk
  if (outputs.dropoutRisk === 'high') {
    insights.push({
      id: `loi-dropout-${Date.now()}`,
      type: 'warning',
      message: `High dropout risk (>15%) expected. Budget ${Math.round(outputs.estimatedLOI * 0.25)} extra completes to compensate.`,
      confidence: 0.8,
    });
  }

  // Open-end fatigue
  const totalOpenEnds = inputs.questions.openEndShort + inputs.questions.openEndLong;
  if (totalOpenEnds > 3) {
    insights.push({
      id: `loi-openend-${Date.now()}`,
      type: 'optimization',
      message: `${totalOpenEnds} open-ended questions may cause response fatigue. Consider reducing to 2-3 key open-ends.`,
      confidence: 0.75,
      action: {
        label: 'Review open-ends',
        field: 'openEndLong',
        value: Math.min(1, inputs.questions.openEndLong),
      },
    });
  }

  // MaxDiff/Conjoint placement
  if (inputs.questions.maxDiffSets > 0 || inputs.questions.conjointTasks > 0) {
    insights.push({
      id: `loi-exercise-${Date.now()}`,
      type: 'recommendation',
      message: 'Place MaxDiff/Conjoint exercises in the first half of the survey for best data quality.',
      confidence: 0.85,
    });
  }

  return insights;
}

// Historical benchmark comparison
interface BenchmarkComparison {
  metric: string;
  yourValue: number;
  industryAverage: number;
  clientAverage?: number;
  percentile: number;
  rating: 'excellent' | 'good' | 'average' | 'below_average';
}

export function compareWithBenchmarks(
  calculatorType: CalculatorType,
  value: number,
  metric: string
): BenchmarkComparison {
  // Industry benchmarks (simplified)
  const benchmarks: Record<string, { avg: number; stdDev: number }> = {
    'sample_concept_test': { avg: 350, stdDev: 100 },
    'sample_tracker': { avg: 750, stdDev: 200 },
    'sample_uat': { avg: 1200, stdDev: 400 },
    'moe_standard': { avg: 4.5, stdDev: 1.5 },
    'loi_standard': { avg: 15, stdDev: 5 },
    'cost_per_complete': { avg: 18, stdDev: 8 },
  };

  const key = `${metric}_standard`;
  const benchmark = benchmarks[key] || { avg: value, stdDev: value * 0.3 };

  const zScore = (value - benchmark.avg) / benchmark.stdDev;
  const percentile = Math.round(normalCDF(zScore) * 100);

  let rating: BenchmarkComparison['rating'] = 'average';
  if (percentile >= 75) rating = 'excellent';
  else if (percentile >= 50) rating = 'good';
  else if (percentile < 25) rating = 'below_average';

  return {
    metric,
    yourValue: value,
    industryAverage: benchmark.avg,
    percentile,
    rating,
  };
}

// Helper: Normal CDF approximation
function normalCDF(x: number): number {
  const a1 =  0.254829592;
  const a2 = -0.284496736;
  const a3 =  1.421413741;
  const a4 = -1.453152027;
  const a5 =  1.061405429;
  const p  =  0.3275911;

  const sign = x < 0 ? -1 : 1;
  x = Math.abs(x) / Math.sqrt(2);

  const t = 1.0 / (1.0 + p * x);
  const y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);

  return 0.5 * (1.0 + sign * y);
}
