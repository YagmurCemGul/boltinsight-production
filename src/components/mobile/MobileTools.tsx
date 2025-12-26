'use client';

import { useState } from 'react';
import {
  Calculator,
  Users,
  ClipboardCheck,
  RefreshCw,
  Download,
  PieChart,
  Loader2,
  AlertCircle,
  CheckCircle,
  Clock,
  DollarSign,
} from 'lucide-react';
import { cn, calculateMarginOfError, calculateRequiredSampleSize } from '@/lib/utils';
import { Button, Input, Select, Card, CardContent, Textarea, AIBadge } from '@/components/ui';

// ==================== MOE Calculator ====================
export function MobileMOECalculator() {
  const [mode, setMode] = useState<'moe' | 'sample'>('moe');
  const [sampleSize, setSampleSize] = useState('1000');
  const [populationSize, setPopulationSize] = useState('');
  const [confidenceLevel, setConfidenceLevel] = useState('95');
  const [marginOfError, setMarginOfError] = useState('5');
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const confidence = parseInt(confidenceLevel);
    const population = populationSize ? parseInt(populationSize) : undefined;

    if (mode === 'moe') {
      const sample = parseInt(sampleSize);
      if (isNaN(sample) || sample <= 0) return;
      const moe = calculateMarginOfError(sample, confidence, population);
      setResult(moe);
    } else {
      const moe = parseFloat(marginOfError);
      if (isNaN(moe) || moe <= 0) return;
      const sample = calculateRequiredSampleSize(moe, confidence, population);
      setResult(sample);
    }
  };

  const reset = () => {
    setSampleSize('1000');
    setPopulationSize('');
    setConfidenceLevel('95');
    setMarginOfError('5');
    setResult(null);
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-4 pb-24">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Calculator className="h-5 w-5 text-blue-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">MOE Calculator</h2>
          </div>

          {/* Mode Toggle */}
          <div className="flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1 mb-4">
            <button
              onClick={() => { setMode('moe'); setResult(null); }}
              className={cn(
                'flex-1 rounded-md py-2 text-xs font-medium transition-colors',
                mode === 'moe' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              )}
            >
              Calculate MOE
            </button>
            <button
              onClick={() => { setMode('sample'); setResult(null); }}
              className={cn(
                'flex-1 rounded-md py-2 text-xs font-medium transition-colors',
                mode === 'sample' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400'
              )}
            >
              Calculate Sample
            </button>
          </div>

          <div className="space-y-4">
            {mode === 'moe' ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sample Size *</label>
                <Input
                  type="number"
                  value={sampleSize}
                  onChange={(e) => setSampleSize(e.target.value)}
                  placeholder="e.g., 1000"
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Desired MOE (%) *</label>
                <Input
                  type="number"
                  value={marginOfError}
                  onChange={(e) => setMarginOfError(e.target.value)}
                  placeholder="e.g., 5"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confidence Level *</label>
              <Select
                options={[
                  { value: '90', label: '90%' },
                  { value: '95', label: '95%' },
                  { value: '99', label: '99%' },
                ]}
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Population (Optional)</label>
              <Input
                type="number"
                value={populationSize}
                onChange={(e) => setPopulationSize(e.target.value)}
                placeholder="Leave blank for infinite"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={calculate} className="flex-1">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate
              </Button>
              <Button variant="outline" onClick={reset}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {result !== null && (
            <div className="mt-4 rounded-lg bg-blue-50 dark:bg-blue-900/30 p-4 border border-blue-200 dark:border-blue-700">
              <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">Result</h3>
              <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                {mode === 'moe' ? `±${result}%` : `n = ${result.toLocaleString()}`}
              </p>
              <p className="text-sm text-blue-800 dark:text-blue-200 mt-1">
                {mode === 'moe'
                  ? `With n=${sampleSize} at ${confidenceLevel}% confidence`
                  : `For ±${marginOfError}% MOE at ${confidenceLevel}% confidence`}
              </p>
            </div>
          )}

          <div className="mt-4 rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
            <div className="flex gap-2">
              <AIBadge
                isActive={false}
                showTooltip={true}
                tooltipText="AI-powered quick reference guide"
                size="sm"
              />
              <div className="text-xs text-gray-600 dark:text-gray-400">
                <p className="font-medium mb-1">Quick Reference:</p>
                <p>• n=400: ~5% MOE</p>
                <p>• n=1000: ~3% MOE</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== Demographics Calculator ====================
const CENSUS_DATA: Record<string, {
  ageGroups: { range: string; percentage: number }[];
  gender: { category: string; percentage: number }[];
}> = {
  USA: {
    ageGroups: [
      { range: '18-24', percentage: 12 },
      { range: '25-34', percentage: 18 },
      { range: '35-44', percentage: 17 },
      { range: '45-54', percentage: 17 },
      { range: '55-64', percentage: 17 },
      { range: '65+', percentage: 19 },
    ],
    gender: [
      { category: 'Male', percentage: 49 },
      { category: 'Female', percentage: 51 },
    ],
  },
  UK: {
    ageGroups: [
      { range: '18-24', percentage: 11 },
      { range: '25-34', percentage: 17 },
      { range: '35-44', percentage: 16 },
      { range: '45-54', percentage: 17 },
      { range: '55-64', percentage: 16 },
      { range: '65+', percentage: 23 },
    ],
    gender: [
      { category: 'Male', percentage: 49 },
      { category: 'Female', percentage: 51 },
    ],
  },
};

export function MobileDemographics() {
  const [country, setCountry] = useState('USA');
  const [sampleSize, setSampleSize] = useState('1000');
  const [quotas, setQuotas] = useState<{
    ageGroups: { range: string; percentage: number; count: number }[];
    gender: { category: string; percentage: number; count: number }[];
  } | null>(null);

  const calculateQuotas = () => {
    const sample = parseInt(sampleSize) || 0;
    const censusData = CENSUS_DATA[country];
    if (!censusData) return;

    const ageQuotas = censusData.ageGroups.map((g) => ({
      ...g,
      count: Math.round((g.percentage / 100) * sample),
    }));

    const genderQuotas = censusData.gender.map((g) => ({
      ...g,
      count: Math.round((g.percentage / 100) * sample),
    }));

    setQuotas({ ageGroups: ageQuotas, gender: genderQuotas });
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-4 pb-24">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Users className="h-5 w-5 text-green-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Demographics & Quota</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Country</label>
              <Select
                options={[
                  { value: 'USA', label: 'United States' },
                  { value: 'UK', label: 'United Kingdom' },
                ]}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sample Size</label>
              <Input
                type="number"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
                placeholder="e.g., 1000"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={calculateQuotas} className="flex-1">
                <Calculator className="mr-2 h-4 w-4" />
                Calculate Quotas
              </Button>
              <Button variant="outline" onClick={() => setQuotas(null)}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {quotas && (
            <div className="mt-4 space-y-4">
              {/* Age Distribution */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <PieChart className="h-4 w-4" />
                  Age Distribution
                </h3>
                <div className="space-y-2">
                  {quotas.ageGroups.map((group) => (
                    <div key={group.range}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 dark:text-gray-400">{group.range}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {group.percentage}% (n={group.count})
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${group.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Distribution */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                <h3 className="font-medium text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Gender Distribution
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  {quotas.gender.map((g) => (
                    <div
                      key={g.category}
                      className={cn(
                        'rounded-lg p-3 text-center',
                        g.category === 'Male'
                          ? 'bg-blue-50 dark:bg-blue-900/30'
                          : 'bg-pink-50 dark:bg-pink-900/30'
                      )}
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-400">{g.category}</p>
                      <p className="text-xl font-bold text-gray-900 dark:text-white">{g.percentage}%</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">n = {g.count}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ==================== Feasibility Check ====================
const METHODOLOGY_OPTIONS = [
  { value: 'online_survey', label: 'Online Survey' },
  { value: 'cati', label: 'Telephone (CATI)' },
  { value: 'f2f', label: 'Face-to-Face' },
];

const MARKET_OPTIONS = [
  { value: 'USA', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'Germany', label: 'Germany' },
];

const AUDIENCE_OPTIONS = [
  { value: 'general_population', label: 'General Population' },
  { value: 'category_users', label: 'Category Users' },
  { value: 'b2b', label: 'B2B / Decision Makers' },
];

interface FeasibilityResult {
  feasible: boolean;
  incidenceRate: number;
  estimatedTimeline: string;
  estimatedCost: number;
  confidence: 'high' | 'medium' | 'low';
  recommendations: string[];
}

export function MobileFeasibility() {
  const [market, setMarket] = useState('');
  const [methodology, setMethodology] = useState('');
  const [sampleSize, setSampleSize] = useState('');
  const [audienceType, setAudienceType] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<FeasibilityResult | null>(null);

  const checkFeasibility = () => {
    if (!market || !methodology || !sampleSize || !audienceType) return;
    setIsChecking(true);

    setTimeout(() => {
      const sample = parseInt(sampleSize);
      const isB2B = audienceType === 'b2b';

      let incidenceRate = isB2B ? 15 : 50;
      const daysPerHundred = methodology === 'f2f' ? 7 : methodology === 'cati' ? 5 : 2;
      const estimatedDays = Math.ceil((sample / 100) * daysPerHundred * (50 / incidenceRate));

      const baseCost = methodology === 'f2f' ? 25 : methodology === 'cati' ? 15 : 5;
      const estimatedCost = Math.round(sample * baseCost * (50 / incidenceRate));

      const feasible = incidenceRate > 3 && estimatedDays < 60;
      const confidence = incidenceRate > 30 ? 'high' : incidenceRate > 10 ? 'medium' : 'low';

      const recommendations: string[] = [];
      if (incidenceRate < 30) recommendations.push('Consider broadening target definition');
      if (isB2B) recommendations.push('Allow extra time for B2B recruitment');
      recommendations.push('Include 10-15% oversample for quality control');

      setResult({
        feasible,
        incidenceRate,
        estimatedTimeline: `${estimatedDays} days`,
        estimatedCost,
        confidence,
        recommendations,
      });

      setIsChecking(false);
    }, 1500);
  };

  const reset = () => {
    setMarket('');
    setMethodology('');
    setSampleSize('');
    setAudienceType('');
    setResult(null);
  };

  return (
    <div className="h-full bg-gray-50 dark:bg-gray-900 p-4 pb-24">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <ClipboardCheck className="h-5 w-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900 dark:text-white">Feasibility Check</h2>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Market *</label>
              <Select
                options={[{ value: '', label: 'Select market' }, ...MARKET_OPTIONS]}
                value={market}
                onChange={(e) => setMarket(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Methodology *</label>
              <Select
                options={[{ value: '', label: 'Select methodology' }, ...METHODOLOGY_OPTIONS]}
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Sample Size *</label>
              <Input
                type="number"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
                placeholder="e.g., 500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Audience *</label>
              <Select
                options={[{ value: '', label: 'Select audience' }, ...AUDIENCE_OPTIONS]}
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value)}
              />
            </div>

            <div className="flex gap-2">
              <Button
                onClick={checkFeasibility}
                disabled={isChecking || !market || !methodology || !sampleSize || !audienceType}
                className="flex-1"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <ClipboardCheck className="mr-2 h-4 w-4" />
                    Check
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={reset}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {result && (
            <div className="mt-4 space-y-3">
              {/* Status */}
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg p-3 border',
                  result.feasible
                    ? 'bg-green-50 dark:bg-green-900/30 border-green-300 dark:border-green-700'
                    : 'bg-red-50 dark:bg-red-900/30 border-red-300 dark:border-red-700'
                )}
              >
                {result.feasible ? (
                  <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-400" />
                )}
                <div>
                  <p className={cn('font-semibold', result.feasible ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100')}>
                    {result.feasible ? 'Feasible' : 'Challenges'}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Confidence: {result.confidence}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-3 gap-2">
                <div className="rounded-lg bg-blue-50 dark:bg-blue-900/30 p-3 text-center">
                  <p className="text-lg font-bold text-blue-900 dark:text-blue-100">{result.incidenceRate}%</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">Incidence</p>
                </div>
                <div className="rounded-lg bg-purple-50 dark:bg-purple-900/30 p-3 text-center">
                  <p className="text-lg font-bold text-purple-900 dark:text-purple-100">{result.estimatedTimeline}</p>
                  <p className="text-xs text-purple-700 dark:text-purple-300">Timeline</p>
                </div>
                <div className="rounded-lg bg-green-50 dark:bg-green-900/30 p-3 text-center">
                  <p className="text-lg font-bold text-green-900 dark:text-green-100">${(result.estimatedCost / 1000).toFixed(0)}k</p>
                  <p className="text-xs text-green-700 dark:text-green-300">Est. Cost</p>
                </div>
              </div>

              {/* Recommendations */}
              <div className="rounded-lg bg-gray-100 dark:bg-gray-800 p-3">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm">Recommendations</h4>
                <ul className="space-y-1">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                      <CheckCircle className="h-3 w-3 text-blue-500 mt-0.5 shrink-0" />
                      {rec}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
