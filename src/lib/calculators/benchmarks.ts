import type {
  MOEBenchmark,
  SampleSizeBenchmark,
  LOICostTier,
  CensusData,
  QualityRating,
} from '@/types/calculator';

// ============================================
// MARGIN OF ERROR BENCHMARKS
// ============================================

export const MOE_BENCHMARKS: MOEBenchmark[] = [
  {
    range: [0, 3],
    rating: 'excellent',
    description: 'High precision - suitable for critical business decisions',
  },
  {
    range: [3, 5],
    rating: 'good',
    description: 'Standard precision - appropriate for most research applications',
  },
  {
    range: [5, 10],
    rating: 'acceptable',
    description: 'Moderate precision - suitable for directional insights',
  },
  {
    range: [10, 100],
    rating: 'poor',
    description: 'Low precision - use for exploratory research only',
  },
];

export function getMOEQualityRating(moe: number): QualityRating {
  for (const benchmark of MOE_BENCHMARKS) {
    if (moe >= benchmark.range[0] && moe < benchmark.range[1]) {
      return benchmark.rating;
    }
  }
  return 'poor';
}

// ============================================
// SAMPLE SIZE BENCHMARKS BY METHODOLOGY
// ============================================

export const SAMPLE_SIZE_BENCHMARKS: SampleSizeBenchmark[] = [
  {
    methodology: 'Brand Tracking',
    typical: 500,
    minimum: 300,
    description: 'Quarterly or monthly tracking studies',
  },
  {
    methodology: 'Concept Testing',
    typical: 400,
    minimum: 200,
    description: 'New product/concept evaluation',
  },
  {
    methodology: 'Ad Testing',
    typical: 300,
    minimum: 150,
    description: 'Advertising effectiveness research',
  },
  {
    methodology: 'U&A Study',
    typical: 1000,
    minimum: 500,
    description: 'Usage & Attitude comprehensive studies',
  },
  {
    methodology: 'Price Testing',
    typical: 500,
    minimum: 300,
    description: 'Pricing and willingness-to-pay research',
  },
  {
    methodology: 'NPS/Satisfaction',
    typical: 400,
    minimum: 200,
    description: 'Customer satisfaction tracking',
  },
  {
    methodology: 'Segmentation',
    typical: 1500,
    minimum: 800,
    description: 'Market segmentation studies',
  },
  {
    methodology: 'Qualitative',
    typical: 30,
    minimum: 15,
    description: 'In-depth interviews or focus groups',
  },
];

export function getSampleSizeBenchmark(methodology: string): SampleSizeBenchmark | undefined {
  return SAMPLE_SIZE_BENCHMARKS.find(
    (b) => b.methodology.toLowerCase() === methodology.toLowerCase()
  );
}

// ============================================
// LOI COST TIERS
// ============================================

export const LOI_COST_TIERS: LOICostTier[] = [
  {
    tier: 'low',
    minLOI: 1,
    maxLOI: 5,
    costMultiplier: 0.8,
    description: 'Quick surveys - lower dropout, better data quality',
  },
  {
    tier: 'standard',
    minLOI: 6,
    maxLOI: 10,
    costMultiplier: 1.0,
    description: 'Standard length - most common for quantitative research',
  },
  {
    tier: 'medium',
    minLOI: 11,
    maxLOI: 15,
    costMultiplier: 1.3,
    description: 'Moderate length - detailed studies, some fatigue risk',
  },
  {
    tier: 'high',
    minLOI: 16,
    maxLOI: 20,
    costMultiplier: 1.6,
    description: 'Long surveys - increased incentives needed',
  },
  {
    tier: 'premium',
    minLOI: 21,
    maxLOI: 999,
    costMultiplier: 2.0,
    description: 'Very long - high dropout risk, premium incentives',
  },
];

export function getLOICostTier(loi: number): LOICostTier {
  for (const tier of LOI_COST_TIERS) {
    if (loi >= tier.minLOI && loi <= tier.maxLOI) {
      return tier;
    }
  }
  return LOI_COST_TIERS[LOI_COST_TIERS.length - 1];
}

// ============================================
// CENSUS DATA (Turkey TÜİK 2024)
// ============================================

export const CENSUS_DATA: Record<string, CensusData> = {
  turkey: {
    country: 'Turkey',
    source: 'TÜİK 2024',
    lastUpdated: '2024-01',
    ageDistribution: [
      { range: '18-24', percentage: 12 },
      { range: '25-34', percentage: 18 },
      { range: '35-44', percentage: 17 },
      { range: '45-54', percentage: 14 },
      { range: '55-64', percentage: 11 },
      { range: '65+', percentage: 10 },
    ],
    genderDistribution: [
      { gender: 'Male', percentage: 49 },
      { gender: 'Female', percentage: 51 },
    ],
    urbanRural: [
      { type: 'Urban', percentage: 76 },
      { type: 'Rural', percentage: 24 },
    ],
  },
  uk: {
    country: 'United Kingdom',
    source: 'ONS 2023',
    lastUpdated: '2023-06',
    ageDistribution: [
      { range: '18-24', percentage: 10 },
      { range: '25-34', percentage: 17 },
      { range: '35-44', percentage: 16 },
      { range: '45-54', percentage: 16 },
      { range: '55-64', percentage: 15 },
      { range: '65+', percentage: 18 },
    ],
    genderDistribution: [
      { gender: 'Male', percentage: 49 },
      { gender: 'Female', percentage: 51 },
    ],
  },
  usa: {
    country: 'United States',
    source: 'US Census 2023',
    lastUpdated: '2023-07',
    ageDistribution: [
      { range: '18-24', percentage: 11 },
      { range: '25-34', percentage: 17 },
      { range: '35-44', percentage: 16 },
      { range: '45-54', percentage: 15 },
      { range: '55-64', percentage: 15 },
      { range: '65+', percentage: 17 },
    ],
    genderDistribution: [
      { gender: 'Male', percentage: 49 },
      { gender: 'Female', percentage: 51 },
    ],
  },
  germany: {
    country: 'Germany',
    source: 'Destatis 2023',
    lastUpdated: '2023-12',
    ageDistribution: [
      { range: '18-24', percentage: 9 },
      { range: '25-34', percentage: 15 },
      { range: '35-44', percentage: 15 },
      { range: '45-54', percentage: 17 },
      { range: '55-64', percentage: 16 },
      { range: '65+', percentage: 21 },
    ],
    genderDistribution: [
      { gender: 'Male', percentage: 49 },
      { gender: 'Female', percentage: 51 },
    ],
  },
  france: {
    country: 'France',
    source: 'INSEE 2023',
    lastUpdated: '2023-01',
    ageDistribution: [
      { range: '18-24', percentage: 10 },
      { range: '25-34', percentage: 15 },
      { range: '35-44', percentage: 15 },
      { range: '45-54', percentage: 16 },
      { range: '55-64', percentage: 15 },
      { range: '65+', percentage: 20 },
    ],
    genderDistribution: [
      { gender: 'Male', percentage: 48 },
      { gender: 'Female', percentage: 52 },
    ],
  },
  spain: {
    country: 'Spain',
    source: 'INE 2023',
    lastUpdated: '2023-07',
    ageDistribution: [
      { range: '18-24', percentage: 9 },
      { range: '25-34', percentage: 14 },
      { range: '35-44', percentage: 18 },
      { range: '45-54', percentage: 18 },
      { range: '55-64', percentage: 14 },
      { range: '65+', percentage: 19 },
    ],
    genderDistribution: [
      { gender: 'Male', percentage: 49 },
      { gender: 'Female', percentage: 51 },
    ],
  },
  italy: {
    country: 'Italy',
    source: 'ISTAT 2023',
    lastUpdated: '2023-01',
    ageDistribution: [
      { range: '18-24', percentage: 8 },
      { range: '25-34', percentage: 13 },
      { range: '35-44', percentage: 16 },
      { range: '45-54', percentage: 18 },
      { range: '55-64', percentage: 16 },
      { range: '65+', percentage: 23 },
    ],
    genderDistribution: [
      { gender: 'Male', percentage: 49 },
      { gender: 'Female', percentage: 51 },
    ],
  },
  netherlands: {
    country: 'Netherlands',
    source: 'CBS 2023',
    lastUpdated: '2023-01',
    ageDistribution: [
      { range: '18-24', percentage: 11 },
      { range: '25-34', percentage: 16 },
      { range: '35-44', percentage: 15 },
      { range: '45-54', percentage: 17 },
      { range: '55-64', percentage: 15 },
      { range: '65+', percentage: 19 },
    ],
    genderDistribution: [
      { gender: 'Male', percentage: 50 },
      { gender: 'Female', percentage: 50 },
    ],
  },
  poland: {
    country: 'Poland',
    source: 'GUS 2023',
    lastUpdated: '2023-06',
    ageDistribution: [
      { range: '18-24', percentage: 10 },
      { range: '25-34', percentage: 17 },
      { range: '35-44', percentage: 18 },
      { range: '45-54', percentage: 15 },
      { range: '55-64', percentage: 15 },
      { range: '65+', percentage: 18 },
    ],
    genderDistribution: [
      { gender: 'Male', percentage: 48 },
      { gender: 'Female', percentage: 52 },
    ],
  },
};

export function getCensusData(country: string): CensusData | undefined {
  return CENSUS_DATA[country.toLowerCase()];
}

export function getAvailableCountries(): string[] {
  return Object.keys(CENSUS_DATA).map(
    (key) => CENSUS_DATA[key].country
  );
}

// ============================================
// INDUSTRY STANDARDS
// ============================================

export const INDUSTRY_STANDARDS = {
  minSampleForSubgroup: 100,
  optimalMOE: 3,
  maxAcceptableMOE: 5,
  optimalLOI: 10,
  maxLOIBeforeFatigue: 15,
  minOnlineSample: 200,
  minQualSample: 15,
  maxDiffMinItems: 8,
  maxDiffMaxItems: 20,
  maxDiffOptimalItemsPerSet: 4,
};
