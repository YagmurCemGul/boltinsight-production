import type {
  ConfidenceLevel,
  QualityRating,
  CostTier,
  FeasibilityVerdict,
  Methodology,
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
  DimensionScore,
  FeasibilityRisk,
} from '@/types/calculator';
import { CENSUS_DATA, MOE_BENCHMARKS, LOI_COST_TIERS } from './benchmarks';

// Z-scores for confidence levels
const Z_SCORES: Record<ConfidenceLevel, number> = {
  90: 1.645,
  95: 1.96,
  99: 2.576,
};

// ============================================
// SAMPLE SIZE CALCULATOR
// ============================================

export function calculateSampleSize(inputs: SampleSizeInputs): SampleSizeOutputs {
  const { confidenceLevel, marginOfError, populationSize, responseDistribution } = inputs;

  const z = Z_SCORES[confidenceLevel];
  const p = responseDistribution / 100;
  const e = marginOfError / 100;

  // Basic sample size formula: n = (z² × p × (1-p)) / e²
  let n = (Math.pow(z, 2) * p * (1 - p)) / Math.pow(e, 2);

  // Apply finite population correction if population is specified
  if (populationSize && populationSize > 0) {
    n = n / (1 + (n - 1) / populationSize);
  }

  const recommendedSample = Math.ceil(n);

  // Calculate range
  const minimumSample = Math.ceil(recommendedSample * 0.7);
  const maximumSample = Math.ceil(recommendedSample * 1.5);

  // Subgroup capacity: typically need n=100 per subgroup for meaningful analysis
  const subgroupCapacity = Math.floor(recommendedSample / 100);

  // Quality rating based on sample size
  let qualityRating: QualityRating = 'poor';
  if (recommendedSample >= 1000) qualityRating = 'excellent';
  else if (recommendedSample >= 500) qualityRating = 'good';
  else if (recommendedSample >= 200) qualityRating = 'acceptable';

  // Estimated cost (rough estimate: $20 per respondent for online)
  const estimatedCost = recommendedSample * 20;

  return {
    recommendedSample,
    minimumSample,
    maximumSample,
    subgroupCapacity,
    estimatedCost,
    qualityRating,
  };
}

// ============================================
// MARGIN OF ERROR CALCULATOR
// ============================================

export function calculateMarginOfError(inputs: MOEInputs): MOEOutputs {
  const { sampleSize, confidenceLevel, populationSize } = inputs;

  const z = Z_SCORES[confidenceLevel];
  const p = 0.5; // Worst-case assumption

  // Basic MOE formula: e = z × √(p × (1-p) / n)
  let moe = z * Math.sqrt((p * (1 - p)) / sampleSize);

  // Apply finite population correction if population is specified
  if (populationSize && populationSize > 0 && sampleSize < populationSize) {
    const fpc = Math.sqrt((populationSize - sampleSize) / (populationSize - 1));
    moe = moe * fpc;
  }

  const marginOfError = parseFloat((moe * 100).toFixed(2));

  // Quality rating
  let qualityRating: QualityRating = 'poor';
  for (const benchmark of MOE_BENCHMARKS) {
    if (marginOfError >= benchmark.range[0] && marginOfError < benchmark.range[1]) {
      qualityRating = benchmark.rating;
      break;
    }
  }

  // Plain language interpretation
  const interpretation = generateMOEInterpretation(marginOfError, confidenceLevel);
  const clientFriendly = generateClientFriendlyExplanation(marginOfError, qualityRating);

  // What-if scenarios
  const whatIf = {
    toReach3Percent: calculateSampleForMOE(3, confidenceLevel, populationSize),
    toReach5Percent: calculateSampleForMOE(5, confidenceLevel, populationSize),
  };

  return {
    marginOfError,
    qualityRating,
    interpretation,
    clientFriendly,
    whatIf,
  };
}

function calculateSampleForMOE(targetMOE: number, confidence: ConfidenceLevel, population?: number): number {
  const z = Z_SCORES[confidence];
  const p = 0.5;
  const e = targetMOE / 100;

  let n = (Math.pow(z, 2) * p * (1 - p)) / Math.pow(e, 2);

  if (population && population > 0) {
    n = n / (1 + (n - 1) / population);
  }

  return Math.ceil(n);
}

function generateMOEInterpretation(moe: number, confidence: ConfidenceLevel): string {
  const prob = confidence === 95 ? '19 out of 20' : confidence === 99 ? '99 out of 100' : '9 out of 10';
  return `In ${prob} surveys conducted the same way, the results would fall within ±${moe}% of this survey's results.`;
}

function generateClientFriendlyExplanation(moe: number, rating: QualityRating): string {
  const explanations: Record<QualityRating, string> = {
    excellent: `With ±${moe}% margin of error, these results are highly reliable and suitable for critical business decisions.`,
    good: `With ±${moe}% margin of error, these results are solid and appropriate for most research applications.`,
    acceptable: `With ±${moe}% margin of error, these results provide directional insights suitable for exploratory research.`,
    poor: `With ±${moe}% margin of error, these results should be interpreted with caution and used for initial exploration only.`,
  };
  return explanations[rating];
}

// ============================================
// MAXDIFF CALCULATOR
// ============================================

export function calculateMaxDiff(inputs: MaxDiffInputs): MaxDiffOutputs {
  const { totalItems, itemsPerSet, sampleSize, customTasks } = inputs;

  // Recommended tasks = (3 × k) / s where k = items, s = items per set
  const recommendedTasks = customTasks || Math.ceil((3 * totalItems) / itemsPerSet);

  // Total comparisons per respondent
  const totalComparisons = recommendedTasks * (itemsPerSet - 1) * 2;

  // Times each item is shown
  const timesEachItemShown = Math.round((recommendedTasks * itemsPerSet) / totalItems);

  // Check if design is balanced
  const isBalancedDesign = timesEachItemShown >= 2 && (recommendedTasks * itemsPerSet) % totalItems < 3;

  // Reliability assessment
  let reliabilityScore: 'high' | 'medium' | 'low' = 'low';
  if (timesEachItemShown >= 3 && sampleSize >= 200) {
    reliabilityScore = 'high';
  } else if (timesEachItemShown >= 2 && sampleSize >= 100) {
    reliabilityScore = 'medium';
  }

  // Estimated duration (roughly 20-30 seconds per task)
  const estimatedDuration = Math.round((recommendedTasks * 25) / 60);

  // Minimum sample for individual-level utility estimation
  const minimumSampleForUtilities = Math.max(200, totalItems * 15);

  return {
    recommendedTasks,
    totalComparisons,
    timesEachItemShown,
    isBalancedDesign,
    reliabilityScore,
    estimatedDuration,
    minimumSampleForUtilities,
  };
}

// ============================================
// DEMOGRAPHICS DISTRIBUTION CALCULATOR
// ============================================

export function calculateDemographics(inputs: DemographicsInputs): DemographicsOutputs {
  const { country, ageRange, gender, totalSample } = inputs;

  // Get census data for country
  const censusData = CENSUS_DATA[country.toLowerCase()] || CENSUS_DATA['turkey'];

  // Filter age distribution based on range
  const filteredAgeDistribution = censusData.ageDistribution
    .filter((age) => {
      const [min, max] = parseAgeRange(age.range);
      return min >= ageRange[0] && max <= ageRange[1];
    });

  // Normalize percentages
  const totalPercentage = filteredAgeDistribution.reduce((sum, a) => sum + a.percentage, 0);

  const ageDistribution = filteredAgeDistribution.map((age) => ({
    range: age.range,
    percentage: Math.round((age.percentage / totalPercentage) * 100),
    count: Math.round((age.percentage / totalPercentage) * totalSample),
  }));

  // Gender distribution
  let genderDistribution;
  if (gender === 'all') {
    genderDistribution = censusData.genderDistribution.map((g) => ({
      gender: g.gender,
      percentage: g.percentage,
      count: Math.round((g.percentage / 100) * totalSample),
    }));
  } else {
    genderDistribution = [{
      gender: gender === 'male' ? 'Male' : 'Female',
      percentage: 100,
      count: totalSample,
    }];
  }

  // Incidence rate estimation (simplified)
  const ageIncidence = totalPercentage;
  const genderIncidence = gender === 'all' ? 100 : 50;
  const incidenceRate = Math.round((ageIncidence * genderIncidence) / 100);

  // Feasibility assessment
  const hardToReach: string[] = [];
  ageDistribution.forEach((age) => {
    if (age.percentage > 0 && age.percentage < 10) {
      hardToReach.push(`${age.range} age group may require extended fieldwork`);
    }
  });

  const isAchievable = incidenceRate >= 10 && totalSample <= 5000;

  return {
    ageDistribution,
    genderDistribution,
    incidenceRate,
    isAchievable,
    hardToReach,
    dataSource: censusData.source,
    lastUpdated: censusData.lastUpdated,
  };
}

function parseAgeRange(range: string): [number, number] {
  const match = range.match(/(\d+)-(\d+)/);
  if (match) {
    return [parseInt(match[1]), parseInt(match[2])];
  }
  // Handle "65+" style
  const singleMatch = range.match(/(\d+)\+/);
  if (singleMatch) {
    return [parseInt(singleMatch[1]), 100];
  }
  return [0, 100];
}

// ============================================
// FEASIBILITY CHECK CALCULATOR
// ============================================

export function calculateFeasibility(inputs: FeasibilityInputs): FeasibilityOutputs {
  const { methodology, sampleSize, countries, timeline, incidenceRate, loi } = inputs;

  const dimensions: DimensionScore[] = [];
  const risks: FeasibilityRisk[] = [];

  // Sample dimension
  const sampleScore = calculateSampleFeasibility(sampleSize, countries.length, incidenceRate);
  dimensions.push({
    dimension: 'sample',
    score: sampleScore.score,
    notes: sampleScore.notes,
  });
  if (sampleScore.risk) risks.push(sampleScore.risk);

  // Timeline dimension
  const timelineScore = calculateTimelineFeasibility(sampleSize, countries.length, timeline, methodology);
  dimensions.push({
    dimension: 'timeline',
    score: timelineScore.score,
    notes: timelineScore.notes,
  });
  if (timelineScore.risk) risks.push(timelineScore.risk);

  // Cost dimension
  const costScore = calculateCostFeasibility(sampleSize, countries.length, loi || 10, methodology);
  dimensions.push({
    dimension: 'cost',
    score: costScore.score,
    notes: costScore.notes,
  });

  // Quality dimension
  const qualityScore = calculateQualityFeasibility(sampleSize, incidenceRate, loi || 10);
  dimensions.push({
    dimension: 'quality',
    score: qualityScore.score,
    notes: qualityScore.notes,
  });
  if (qualityScore.risk) risks.push(qualityScore.risk);

  // Overall score (weighted average)
  const overallScore = Math.round(
    dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length
  );

  // Verdict
  let verdict: FeasibilityVerdict = 'red';
  if (overallScore >= 70) verdict = 'green';
  else if (overallScore >= 40) verdict = 'yellow';

  // Estimated cost
  const costPerRespondent = getCostPerRespondent(methodology, loi || 10);
  const estimatedCost = sampleSize * countries.length * costPerRespondent;

  // Estimated days
  const dailyCapacity = getDailyCapacity(methodology, incidenceRate);
  const estimatedDays = Math.ceil((sampleSize * countries.length) / dailyCapacity);

  // Recommendations
  const recommendations = generateRecommendations(inputs, dimensions, risks);

  return {
    overallScore,
    verdict,
    dimensions,
    risks,
    estimatedCost,
    estimatedDays,
    recommendations,
  };
}

function calculateSampleFeasibility(sample: number, markets: number, ir: number) {
  const totalSample = sample * markets;
  const adjustedSample = totalSample / (ir / 100);

  let score = 100;
  if (adjustedSample > 10000) score -= 30;
  else if (adjustedSample > 5000) score -= 15;

  if (ir < 10) score -= 30;
  else if (ir < 20) score -= 15;

  let risk: FeasibilityRisk | undefined;
  if (ir < 15) {
    risk = {
      level: 'high',
      description: 'Low incidence rate may cause delays',
      mitigation: 'Consider broadening target criteria or extending timeline',
    };
  }

  return {
    score: Math.max(0, score),
    notes: `${totalSample.toLocaleString()} total respondents needed at ${ir}% IR`,
    risk,
  };
}

function calculateTimelineFeasibility(sample: number, markets: number, days: number, method: Methodology) {
  const dailyCapacity = getDailyCapacity(method, 30);
  const requiredDays = Math.ceil((sample * markets) / dailyCapacity);

  let score = 100;
  if (requiredDays > days) {
    score = Math.max(0, 100 - ((requiredDays - days) / days) * 100);
  }

  let risk: FeasibilityRisk | undefined;
  if (requiredDays > days * 1.5) {
    risk = {
      level: 'high',
      description: `Timeline too tight: need ${requiredDays} days, only ${days} available`,
      mitigation: 'Extend timeline or reduce sample size',
    };
  } else if (requiredDays > days) {
    risk = {
      level: 'medium',
      description: 'Timeline is challenging',
      mitigation: 'Start fieldwork early in the week for best momentum',
    };
  }

  return {
    score: Math.max(0, Math.min(100, score)),
    notes: requiredDays <= days ? 'Timeline is achievable' : `Needs ${requiredDays} days vs ${days} available`,
    risk,
  };
}

function calculateCostFeasibility(sample: number, markets: number, loi: number, method: Methodology) {
  const costPerRespondent = getCostPerRespondent(method, loi);
  const totalCost = sample * markets * costPerRespondent;

  // Score based on cost efficiency
  let score = 100;
  if (costPerRespondent > 30) score -= 20;
  if (totalCost > 50000) score -= 15;

  return {
    score: Math.max(0, score),
    notes: `Est. $${costPerRespondent}/respondent, total $${totalCost.toLocaleString()}`,
  };
}

function calculateQualityFeasibility(sample: number, ir: number, loi: number) {
  let score = 100;
  let risk: FeasibilityRisk | undefined;

  if (loi > 20) {
    score -= 25;
    risk = {
      level: 'medium',
      description: 'Long survey may affect data quality',
      mitigation: 'Consider incentive increase or survey optimization',
    };
  } else if (loi > 15) {
    score -= 10;
  }

  if (ir < 20) score -= 15;
  if (sample < 200) score -= 20;

  return {
    score: Math.max(0, score),
    notes: loi <= 15 ? 'Good survey length for quality' : 'Consider survey optimization',
    risk,
  };
}

function getCostPerRespondent(method: Methodology, loi: number): number {
  const baseCosts: Record<Methodology, number> = {
    online: 15,
    cati: 25,
    f2f: 50,
    clt: 40,
    mixed: 30,
  };

  const base = baseCosts[method];
  const loiMultiplier = loi <= 10 ? 1 : loi <= 15 ? 1.3 : loi <= 20 ? 1.6 : 2;

  return Math.round(base * loiMultiplier);
}

function getDailyCapacity(method: Methodology, ir: number): number {
  const baseCapacity: Record<Methodology, number> = {
    online: 500,
    cati: 100,
    f2f: 30,
    clt: 50,
    mixed: 200,
  };

  return Math.round(baseCapacity[method] * (ir / 100));
}

function generateRecommendations(inputs: FeasibilityInputs, dimensions: DimensionScore[], risks: FeasibilityRisk[]): string[] {
  const recommendations: string[] = [];

  if (risks.some(r => r.level === 'high')) {
    recommendations.push('Address high-risk items before proceeding');
  }

  const lowestDimension = dimensions.reduce((min, d) => d.score < min.score ? d : min);
  if (lowestDimension.score < 70) {
    recommendations.push(`Focus on improving ${lowestDimension.dimension}: ${lowestDimension.notes}`);
  }

  if (inputs.incidenceRate < 20) {
    recommendations.push('Consider panel blend for low-incidence audiences');
  }

  if (inputs.timeline < 14 && inputs.sampleSize > 500) {
    recommendations.push('Short timeline with large sample - consider increasing team resources');
  }

  return recommendations;
}

// ============================================
// LOI CALCULATOR
// ============================================

export function calculateLOI(inputs: LOIInputs): LOIOutputs {
  const { questions, media, introScreens } = inputs;

  // Time estimates in seconds
  const singleChoiceTime = questions.singleChoice * 12;
  const multipleChoiceTime = questions.multipleChoice * 18;
  const matrixTime = questions.matrix.questions * questions.matrix.items * 5;
  const openEndShortTime = questions.openEndShort * 45;
  const openEndLongTime = questions.openEndLong * 90;
  const rankingTime = questions.ranking * 25;
  const maxDiffTime = questions.maxDiffSets * 20;
  const conjointTime = questions.conjointTasks * 25;

  const imageTime = media.images * 10;
  const videoTime = media.videos.count * (media.videos.avgDuration + 5);

  const introTime = introScreens * 15;

  const totalSeconds =
    singleChoiceTime +
    multipleChoiceTime +
    matrixTime +
    openEndShortTime +
    openEndLongTime +
    rankingTime +
    maxDiffTime +
    conjointTime +
    imageTime +
    videoTime +
    introTime +
    30; // Buffer for navigation

  const estimatedLOI = Math.round(totalSeconds / 60);
  const minLOI = Math.max(1, Math.round(estimatedLOI * 0.8));
  const maxLOI = Math.round(estimatedLOI * 1.3);

  // Cost tier
  const costTier = getCostTier(estimatedLOI);

  // Fatigue and dropout analysis
  const fatiguePoint = estimatedLOI <= 10 ? 0 : Math.min(estimatedLOI, 12);

  let dropoutRisk: 'low' | 'medium' | 'high' = 'low';
  if (estimatedLOI > 20) dropoutRisk = 'high';
  else if (estimatedLOI > 15) dropoutRisk = 'medium';

  // Speeding risk (percentage likely to speed)
  const speedingRisk = estimatedLOI > 15 ? 15 : estimatedLOI > 10 ? 8 : 3;

  // Cost per respondent
  const tierData = LOI_COST_TIERS.find(t => t.tier === costTier);
  const costPerRespondent = (tierData?.costMultiplier || 1) * 15;

  // Optimization suggestions
  const optimizationSuggestions = generateLOIOptimizations(inputs, estimatedLOI);

  return {
    estimatedLOI,
    minLOI,
    maxLOI,
    costTier,
    fatiguePoint,
    dropoutRisk,
    speedingRisk,
    costPerRespondent,
    optimizationSuggestions,
  };
}

function getCostTier(loi: number): CostTier {
  for (const tier of LOI_COST_TIERS) {
    if (loi >= tier.minLOI && loi <= tier.maxLOI) {
      return tier.tier;
    }
  }
  return 'premium';
}

function generateLOIOptimizations(inputs: LOIInputs, currentLOI: number): string[] {
  const suggestions: string[] = [];

  if (currentLOI > 15) {
    if (inputs.questions.matrix.items > 5) {
      suggestions.push(`Reduce matrix items from ${inputs.questions.matrix.items} to 5 (saves ~${Math.round((inputs.questions.matrix.items - 5) * 5 / 60)} min)`);
    }
    if (inputs.questions.openEndLong > 1) {
      suggestions.push(`Consider converting ${inputs.questions.openEndLong - 1} long open-ends to short format (saves ~${(inputs.questions.openEndLong - 1) * 0.75} min)`);
    }
    if (inputs.questions.ranking > 2) {
      suggestions.push('Limit ranking questions to essential attributes only');
    }
  }

  if (inputs.media.videos.count > 2) {
    suggestions.push('Consider reducing video stimuli to maintain engagement');
  }

  return suggestions;
}
