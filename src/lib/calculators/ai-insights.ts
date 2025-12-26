import type {
  AIInsight,
  SampleSizeInputs,
  SampleSizeOutputs,
  MOEInputs,
  MOEOutputs,
  MaxDiffInputs,
  MaxDiffOutputs,
  DemographicsInputs,
  DemographicsOutputs,
  FeasibilityInputs,
  FeasibilityOutputs,
  LOIInputs,
  LOIOutputs,
} from '@/types/calculator';
import { INDUSTRY_STANDARDS, SAMPLE_SIZE_BENCHMARKS } from './benchmarks';

// Helper to generate unique IDs
const generateId = () => `insight-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

// ============================================
// SAMPLE SIZE INSIGHTS
// ============================================

export function generateSampleSizeInsights(
  inputs: SampleSizeInputs,
  outputs: SampleSizeOutputs
): AIInsight[] {
  const insights: AIInsight[] = [];

  // Subgroup analysis capability
  if (outputs.subgroupCapacity >= 4) {
    insights.push({
      id: generateId(),
      type: 'recommendation',
      message: `This sample allows analysis of ${outputs.subgroupCapacity} subgroups (n=${Math.floor(outputs.recommendedSample / outputs.subgroupCapacity)} each).`,
      confidence: 0.95,
    });
  } else if (outputs.subgroupCapacity < 2) {
    insights.push({
      id: generateId(),
      type: 'warning',
      message: 'Sample size may be too small for meaningful subgroup analysis. Consider increasing to at least 400.',
      confidence: 0.9,
      action: {
        label: 'Increase to 400',
        field: 'sampleSize',
        value: 400,
      },
    });
  }

  // Budget insight
  if (outputs.estimatedCost && outputs.estimatedCost > 30000) {
    insights.push({
      id: generateId(),
      type: 'optimization',
      message: `Estimated cost: $${outputs.estimatedCost.toLocaleString()}. Consider reducing MOE target to ${inputs.marginOfError + 1}% to reduce sample and cost.`,
      confidence: 0.85,
      action: {
        label: `Set MOE to ${inputs.marginOfError + 1}%`,
        field: 'marginOfError',
        value: inputs.marginOfError + 1,
      },
    });
  }

  // Industry benchmark comparison
  const benchmark = SAMPLE_SIZE_BENCHMARKS.find(b =>
    outputs.recommendedSample >= b.minimum && outputs.recommendedSample <= b.typical * 2
  );
  if (benchmark) {
    insights.push({
      id: generateId(),
      type: 'benchmark',
      message: `Sample aligns with ${benchmark.methodology} standards (typical: ${benchmark.typical}, min: ${benchmark.minimum}).`,
      confidence: 0.9,
    });
  }

  // Quality rating context
  if (outputs.qualityRating === 'excellent') {
    insights.push({
      id: generateId(),
      type: 'recommendation',
      message: 'Excellent sample size for high-stakes decisions and detailed segmentation analysis.',
      confidence: 0.95,
    });
  }

  return insights;
}

// ============================================
// MARGIN OF ERROR INSIGHTS
// ============================================

export function generateMOEInsights(
  inputs: MOEInputs,
  outputs: MOEOutputs
): AIInsight[] {
  const insights: AIInsight[] = [];

  // Quality assessment
  if (outputs.qualityRating === 'excellent') {
    insights.push({
      id: generateId(),
      type: 'benchmark',
      message: `±${outputs.marginOfError}% is excellent precision. Industry standard accepts up to ±5%.`,
      confidence: 0.95,
    });
  } else if (outputs.qualityRating === 'poor') {
    insights.push({
      id: generateId(),
      type: 'warning',
      message: `±${outputs.marginOfError}% is high. For reliable insights, increase sample to ${outputs.whatIf.toReach5Percent}.`,
      confidence: 0.9,
      action: {
        label: `Set sample to ${outputs.whatIf.toReach5Percent}`,
        field: 'sampleSize',
        value: outputs.whatIf.toReach5Percent,
      },
    });
  }

  // What-if recommendations
  if (outputs.marginOfError > 3 && outputs.marginOfError <= 5) {
    insights.push({
      id: generateId(),
      type: 'optimization',
      message: `To reach ±3% MOE, you need ${outputs.whatIf.toReach3Percent.toLocaleString()} respondents (+${(outputs.whatIf.toReach3Percent - inputs.sampleSize).toLocaleString()}).`,
      confidence: 0.95,
    });
  }

  // Practical interpretation
  insights.push({
    id: generateId(),
    type: 'recommendation',
    message: outputs.clientFriendly,
    confidence: 0.9,
  });

  return insights;
}

// ============================================
// MAXDIFF INSIGHTS
// ============================================

export function generateMaxDiffInsights(
  inputs: MaxDiffInputs,
  outputs: MaxDiffOutputs
): AIInsight[] {
  const insights: AIInsight[] = [];

  // Design balance
  if (outputs.isBalancedDesign) {
    insights.push({
      id: generateId(),
      type: 'recommendation',
      message: `Balanced design: each item shown ${outputs.timesEachItemShown}x per respondent. Optimal for reliable utility estimation.`,
      confidence: 0.95,
    });
  } else {
    insights.push({
      id: generateId(),
      type: 'warning',
      message: 'Design is not perfectly balanced. Consider adjusting number of tasks or items per set.',
      confidence: 0.85,
    });
  }

  // Sample adequacy for utilities
  if (inputs.sampleSize < outputs.minimumSampleForUtilities) {
    insights.push({
      id: generateId(),
      type: 'warning',
      message: `For individual-level utility estimation, increase sample to ${outputs.minimumSampleForUtilities}.`,
      confidence: 0.9,
      action: {
        label: `Set sample to ${outputs.minimumSampleForUtilities}`,
        field: 'sampleSize',
        value: outputs.minimumSampleForUtilities,
      },
    });
  }

  // Respondent burden
  if (outputs.estimatedDuration > 5) {
    insights.push({
      id: generateId(),
      type: 'warning',
      message: `${outputs.recommendedTasks} tasks (~${outputs.estimatedDuration} min) may cause fatigue. Consider reducing to ${Math.ceil(outputs.recommendedTasks * 0.7)} tasks.`,
      confidence: 0.8,
      action: {
        label: 'Reduce tasks',
        field: 'customTasks',
        value: Math.ceil(outputs.recommendedTasks * 0.7),
      },
    });
  }

  // Reliability assessment
  if (outputs.reliabilityScore === 'high') {
    insights.push({
      id: generateId(),
      type: 'benchmark',
      message: 'High reliability design - suitable for segmentation and individual-level analysis.',
      confidence: 0.9,
    });
  }

  // Item count guidance
  if (inputs.totalItems > INDUSTRY_STANDARDS.maxDiffMaxItems) {
    insights.push({
      id: generateId(),
      type: 'optimization',
      message: `${inputs.totalItems} items is above optimal range (8-20). Consider grouping or reducing items.`,
      confidence: 0.85,
    });
  }

  return insights;
}

// ============================================
// DEMOGRAPHICS INSIGHTS
// ============================================

export function generateDemographicsInsights(
  inputs: DemographicsInputs,
  outputs: DemographicsOutputs
): AIInsight[] {
  const insights: AIInsight[] = [];

  // Incidence rate assessment
  if (outputs.incidenceRate >= 50) {
    insights.push({
      id: generateId(),
      type: 'benchmark',
      message: `${outputs.incidenceRate}% incidence rate - broad target, straightforward to achieve.`,
      confidence: 0.9,
    });
  } else if (outputs.incidenceRate < 20) {
    insights.push({
      id: generateId(),
      type: 'warning',
      message: `${outputs.incidenceRate}% incidence rate is low. Expect extended fieldwork or consider broadening criteria.`,
      confidence: 0.85,
    });
  }

  // Hard-to-reach segments
  if (outputs.hardToReach.length > 0) {
    insights.push({
      id: generateId(),
      type: 'warning',
      message: outputs.hardToReach[0],
      confidence: 0.8,
    });
  }

  // Feasibility
  if (outputs.isAchievable) {
    insights.push({
      id: generateId(),
      type: 'recommendation',
      message: 'Distribution is achievable with standard online panel recruitment.',
      confidence: 0.9,
    });
  } else {
    insights.push({
      id: generateId(),
      type: 'warning',
      message: 'This distribution may be challenging. Consider panel blend or extended fieldwork.',
      confidence: 0.85,
    });
  }

  // Data source attribution
  insights.push({
    id: generateId(),
    type: 'benchmark',
    message: `Population data from ${outputs.dataSource} (${outputs.lastUpdated}).`,
    confidence: 1.0,
  });

  return insights;
}

// ============================================
// FEASIBILITY INSIGHTS
// ============================================

export function generateFeasibilityInsights(
  inputs: FeasibilityInputs,
  outputs: FeasibilityOutputs
): AIInsight[] {
  const insights: AIInsight[] = [];

  // Overall verdict
  if (outputs.verdict === 'green') {
    insights.push({
      id: generateId(),
      type: 'recommendation',
      message: `Score: ${outputs.overallScore}/100 - Project is feasible with current parameters.`,
      confidence: 0.95,
    });
  } else if (outputs.verdict === 'yellow') {
    insights.push({
      id: generateId(),
      type: 'warning',
      message: `Score: ${outputs.overallScore}/100 - Feasible with adjustments. Review risk areas below.`,
      confidence: 0.9,
    });
  } else {
    insights.push({
      id: generateId(),
      type: 'warning',
      message: `Score: ${outputs.overallScore}/100 - High risk. Significant changes recommended.`,
      confidence: 0.9,
    });
  }

  // Risk highlights
  const highRisks = outputs.risks.filter(r => r.level === 'high');
  if (highRisks.length > 0) {
    insights.push({
      id: generateId(),
      type: 'warning',
      message: highRisks[0].description,
      confidence: 0.9,
    });
  }

  // Dimension-specific insights
  const weakestDimension = outputs.dimensions.reduce(
    (min, d) => (d.score < min.score ? d : min),
    outputs.dimensions[0]
  );
  if (weakestDimension.score < 70) {
    insights.push({
      id: generateId(),
      type: 'optimization',
      message: `Weakest area: ${weakestDimension.dimension} (${weakestDimension.score}/100). ${weakestDimension.notes}`,
      confidence: 0.85,
    });
  }

  // Cost and timeline estimates
  insights.push({
    id: generateId(),
    type: 'benchmark',
    message: `Estimated: $${outputs.estimatedCost.toLocaleString()} over ${outputs.estimatedDays} days.`,
    confidence: 0.8,
  });

  // Recommendations
  if (outputs.recommendations.length > 0) {
    insights.push({
      id: generateId(),
      type: 'recommendation',
      message: outputs.recommendations[0],
      confidence: 0.85,
    });
  }

  return insights;
}

// ============================================
// LOI INSIGHTS
// ============================================

export function generateLOIInsights(
  inputs: LOIInputs,
  outputs: LOIOutputs
): AIInsight[] {
  const insights: AIInsight[] = [];

  // Cost tier
  const tierDescriptions: Record<string, string> = {
    low: 'cost-efficient',
    standard: 'standard pricing',
    medium: 'moderate premium',
    high: 'significant premium',
    premium: 'highest tier',
  };
  insights.push({
    id: generateId(),
    type: 'benchmark',
    message: `${outputs.estimatedLOI} min survey = ${tierDescriptions[outputs.costTier]} (~$${outputs.costPerRespondent}/respondent).`,
    confidence: 0.9,
  });

  // Dropout risk
  if (outputs.dropoutRisk === 'high') {
    insights.push({
      id: generateId(),
      type: 'warning',
      message: 'High dropout risk. Consider increasing incentive or reducing survey length.',
      confidence: 0.9,
    });
  } else if (outputs.dropoutRisk === 'medium') {
    insights.push({
      id: generateId(),
      type: 'warning',
      message: 'Moderate dropout risk. Position engaging questions early to maintain attention.',
      confidence: 0.85,
    });
  }

  // Fatigue warning
  if (outputs.fatiguePoint > 0 && outputs.estimatedLOI > outputs.fatiguePoint) {
    insights.push({
      id: generateId(),
      type: 'warning',
      message: `Quality may decline after ${outputs.fatiguePoint} min. Place critical questions before this point.`,
      confidence: 0.85,
    });
  }

  // Optimization suggestions
  if (outputs.optimizationSuggestions.length > 0) {
    insights.push({
      id: generateId(),
      type: 'optimization',
      message: outputs.optimizationSuggestions[0],
      confidence: 0.8,
    });
  }

  // Open-end considerations
  const totalOpenEnds = inputs.questions.openEndShort + inputs.questions.openEndLong;
  if (totalOpenEnds > 3) {
    insights.push({
      id: generateId(),
      type: 'optimization',
      message: `${totalOpenEnds} open-ends may fatigue respondents. Consider limiting to 2-3 essential ones.`,
      confidence: 0.85,
    });
  }

  // Ideal survey length
  if (outputs.estimatedLOI <= INDUSTRY_STANDARDS.optimalLOI) {
    insights.push({
      id: generateId(),
      type: 'recommendation',
      message: 'Survey length is optimal for data quality and respondent experience.',
      confidence: 0.95,
    });
  }

  return insights;
}
