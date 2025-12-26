'use client';

import { useState, useCallback, useMemo } from 'react';
import { Calculator, RefreshCw, PieChart, Download, Info } from 'lucide-react';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  EntityMention,
  MetricDisplay,
  MetricGrid,
  AIInsightsPanel,
  AddToProposalButton,
  QualityCircles,
  ProgressBar,
  SummaryBox,
  DemographicsQuotaTable,
  AddToCompareButton,
  QuickInsightBanner,
  SaveToFavoritesButton,
} from '../shared';
import { calculateDemographics } from '@/lib/calculators/calculations';
import { generateDemographicsInsights } from '@/lib/calculators/ai-insights';
import { getAvailableCountries } from '@/lib/calculators/benchmarks';
import { useCalculatorStore, generateCalculatorId } from '@/lib/calculators/store';
import type {
  DemographicsInputs,
  DemographicsOutputs,
  DemographicsResult,
  MentionEntity,
  CalculatorAutoFill,
  AIInsight,
} from '@/types/calculator';
import { cn } from '@/lib/utils';

const COUNTRY_OPTIONS = getAvailableCountries().map((country) => ({
  value: country.toLowerCase(),
  label: country,
}));

const GENDER_OPTIONS = [
  { value: 'all', label: 'All Genders' },
  { value: 'male', label: 'Male Only' },
  { value: 'female', label: 'Female Only' },
];

export function DemographicsDistribution() {
  const {
    addResult,
    setProposalContext,
    addToComparison,
    removeFromComparison,
    isInComparison,
    activeFlow,
    completeFlowStep,
    nextFlowStep,
  } = useCalculatorStore();

  // Form state
  const [country, setCountry] = useState<string>('turkey');
  const [ageMin, setAgeMin] = useState<string>('18');
  const [ageMax, setAgeMax] = useState<string>('65');
  const [gender, setGender] = useState<string>('all');
  const [totalSample, setTotalSample] = useState<string>('500');

  // Result state
  const [result, setResult] = useState<DemographicsOutputs | null>(null);
  const [lastResult, setLastResult] = useState<DemographicsResult | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<MentionEntity | null>(null);

  // Get current inputs object for favorites
  const currentInputs = useMemo(
    () => ({
      country,
      ageMin: parseInt(ageMin),
      ageMax: parseInt(ageMax),
      gender,
      totalSample: parseInt(totalSample),
    }),
    [country, ageMin, ageMax, gender, totalSample]
  );

  // Handle entity selection from @mention
  const handleEntitySelect = useCallback((entity: MentionEntity, autoFill: CalculatorAutoFill) => {
    setSelectedEntity(entity);

    if (autoFill.sampleSize) {
      setTotalSample(autoFill.sampleSize.toString());
    }
    if (autoFill.countries && autoFill.countries.length > 0) {
      const countryMatch = COUNTRY_OPTIONS.find((c) =>
        c.label.toLowerCase().includes(autoFill.countries![0].toLowerCase())
      );
      if (countryMatch) {
        setCountry(countryMatch.value);
      }
    }
  }, []);

  // Handle entity clear
  const handleEntityClear = useCallback(() => {
    setSelectedEntity(null);
    setProposalContext(null);
  }, [setProposalContext]);

  // Calculate
  const handleCalculate = useCallback(() => {
    const inputs: DemographicsInputs = {
      country,
      ageRange: [parseInt(ageMin), parseInt(ageMax)],
      gender: gender as 'all' | 'male' | 'female',
      totalSample: parseInt(totalSample),
    };

    const outputs = calculateDemographics(inputs);
    const aiInsights = generateDemographicsInsights(inputs, outputs);

    setResult(outputs);
    setInsights(aiInsights);

    // Save to history
    const calculatorResult: DemographicsResult = {
      id: generateCalculatorId(),
      type: 'demographics',
      inputs,
      outputs,
      aiInsights,
      timestamp: new Date(),
    };
    addResult(calculatorResult);
    setLastResult(calculatorResult);

    // If in flow mode, complete the step
    if (activeFlow) {
      completeFlowStep(calculatorResult);
    }
  }, [country, ageMin, ageMax, gender, totalSample, addResult, activeFlow, completeFlowStep]);

  // Reset
  const handleReset = useCallback(() => {
    setCountry('turkey');
    setAgeMin('18');
    setAgeMax('65');
    setGender('all');
    setTotalSample('500');
    setResult(null);
    setLastResult(null);
    setInsights([]);
    setSelectedEntity(null);
    setProposalContext(null);
  }, [setProposalContext]);

  // Handle comparison toggle
  const handleComparisonToggle = useCallback(() => {
    if (!lastResult) return;
    if (isInComparison(lastResult.id)) {
      removeFromComparison(lastResult.id);
    } else {
      addToComparison(lastResult);
    }
  }, [lastResult, isInComparison, addToComparison, removeFromComparison]);

  // Export to CSV
  const handleExport = useCallback(() => {
    if (!result) return;

    const rows = [
      ['Demographics Distribution Report'],
      [''],
      ['Country', COUNTRY_OPTIONS.find((c) => c.value === country)?.label || country],
      ['Age Range', `${ageMin}-${ageMax}`],
      ['Gender', gender],
      ['Total Sample', totalSample],
      [''],
      ['AGE DISTRIBUTION'],
      ['Range', 'Percentage', 'Count'],
      ...result.ageDistribution.map((a) => [a.range, `${a.percentage}%`, a.count.toString()]),
      [''],
      ['GENDER DISTRIBUTION'],
      ['Gender', 'Percentage', 'Count'],
      ...result.genderDistribution.map((g) => [g.gender, `${g.percentage}%`, g.count.toString()]),
      [''],
      ['FEASIBILITY'],
      ['Incidence Rate', `${result.incidenceRate}%`],
      ['Achievable', result.isAchievable ? 'Yes' : 'No'],
      ['Data Source', result.dataSource],
    ];

    const csv = rows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `demographics-${country}-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }, [result, country, ageMin, ageMax, gender, totalSample]);

  // Get quality rating
  const getQualityRating = (achievable: boolean, incidence: number): 'excellent' | 'good' | 'acceptable' | 'poor' => {
    if (achievable && incidence >= 30) return 'excellent';
    if (achievable && incidence >= 15) return 'good';
    if (achievable && incidence >= 5) return 'acceptable';
    return 'poor';
  };

  return (
    <div className="space-y-6">
      {/* Entity Reference */}
      <Card>
        <CardContent className="p-4">
          <EntityMention
            calculatorType="demographics"
            onSelect={handleEntitySelect}
            onClear={handleEntityClear}
            placeholder="Type @ to reference a proposal, client, or project..."
          />
        </CardContent>
      </Card>

      {/* Calculator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-teal-600" />
            Demographics Distribution
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick insight banner if in flow mode */}
          {activeFlow && (
            <QuickInsightBanner
              type="info"
              message="This calculator is part of a flow. Results will be shared with subsequent calculators."
            />
          )}

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Calculate representative sample quotas based on census data.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Country <span className="text-red-500">*</span>
              </label>
              <Select
                options={COUNTRY_OPTIONS}
                value={country}
                onChange={(e) => setCountry(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Sample <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={totalSample}
                onChange={(e) => setTotalSample(e.target.value)}
                placeholder="e.g., 500"
                min="1"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Age Range <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2 items-center">
                <Input
                  type="number"
                  value={ageMin}
                  onChange={(e) => setAgeMin(e.target.value)}
                  placeholder="Min"
                  min="18"
                  max="99"
                />
                <span className="text-gray-500">to</span>
                <Input
                  type="number"
                  value={ageMax}
                  onChange={(e) => setAgeMax(e.target.value)}
                  placeholder="Max"
                  min="18"
                  max="99"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Gender
              </label>
              <Select
                options={GENDER_OPTIONS}
                value={gender}
                onChange={(e) => setGender(e.target.value)}
              />
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCalculate} className="flex-1">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Distribution
            </Button>
            <Button variant="outline" onClick={handleReset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <>
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Main result with visual box */}
              <div className="bg-gradient-to-br from-teal-50 to-teal-100 dark:from-teal-950/30 dark:to-teal-900/30 rounded-xl p-6 border border-teal-200 dark:border-teal-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-teal-600 dark:text-teal-400 mb-1">
                      Demographics Distribution
                    </h3>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {COUNTRY_OPTIONS.find((c) => c.value === country)?.label}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Ages {ageMin}-{ageMax}, n={parseInt(totalSample).toLocaleString()}
                    </p>
                  </div>
                  <QualityCircles
                    rating={getQualityRating(result.isAchievable, result.incidenceRate)}
                  />
                </div>

                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-teal-200 dark:border-teal-800">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-teal-600 dark:text-teal-400">
                      {result.incidenceRate}%
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Incidence Rate</p>
                  </div>
                  <div className="text-center">
                    <p
                      className={cn(
                        'text-2xl font-bold',
                        result.isAchievable
                          ? 'text-green-600 dark:text-green-400'
                          : 'text-red-600 dark:text-red-400'
                      )}
                    >
                      {result.isAchievable ? 'Yes' : 'No'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Achievable</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {result.dataSource}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">Data Source</p>
                  </div>
                </div>
              </div>

              {/* Summary box */}
              <SummaryBox title="Distribution Summary" variant={result.isAchievable ? 'success' : 'warning'}>
                <div className="p-4 space-y-2 font-mono text-sm">
                  <p>🌍 Country: {COUNTRY_OPTIONS.find((c) => c.value === country)?.label}</p>
                  <p>👥 Total Sample: {parseInt(totalSample).toLocaleString()}</p>
                  <p>📅 Age Range: {ageMin}-{ageMax}</p>
                  <p>⚥ Gender: {GENDER_OPTIONS.find((g) => g.value === gender)?.label}</p>
                  <p>📊 Incidence Rate: {result.incidenceRate}%</p>
                  <p>✅ Achievable: {result.isAchievable ? 'Yes' : 'Challenging'}</p>
                  <p>📚 Data Source: {result.dataSource}</p>
                </div>
              </SummaryBox>

              {/* Distribution tables */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Age Distribution */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Age Distribution
                  </h4>
                  <div className="space-y-3">
                    {result.ageDistribution.map((age) => (
                      <div key={age.range} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{age.range}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {age.percentage}% ({age.count})
                          </span>
                        </div>
                        <ProgressBar
                          value={age.percentage}
                          max={100}
                          showPercentage={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>

                {/* Gender Distribution */}
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                    Gender Distribution
                  </h4>
                  <div className="space-y-3">
                    {result.genderDistribution.map((g) => (
                      <div key={g.gender} className="space-y-1">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-700 dark:text-gray-300">{g.gender}</span>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {g.percentage}% ({g.count})
                          </span>
                        </div>
                        <ProgressBar
                          value={g.percentage}
                          max={100}
                          showPercentage={false}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Feasibility metrics */}
              <MetricGrid columns={3}>
                <MetricDisplay
                  label="Incidence Rate"
                  value={`${result.incidenceRate}%`}
                  subtext="Of total population"
                />
                <MetricDisplay
                  label="Achievable"
                  value={result.isAchievable ? 'Yes' : 'Challenging'}
                />
                <MetricDisplay
                  label="Data Source"
                  value={result.dataSource}
                  subtext={result.lastUpdated}
                />
              </MetricGrid>

              {/* Hard to reach warnings */}
              {result.hardToReach.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2">
                    Feasibility Notes
                  </h4>
                  <ul className="space-y-1">
                    {result.hardToReach.map((note, i) => (
                      <li
                        key={i}
                        className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2"
                      >
                        <span>•</span>
                        <span>{note}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* AI Insights */}
              {insights.length > 0 && <AIInsightsPanel insights={insights} />}

              {/* Action buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap items-center gap-2">
                <Button variant="outline" onClick={handleExport}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </Button>
                <AddToProposalButton
                  calculatorType="demographics"
                  value={result.ageDistribution.map((a) => `${a.range}: ${a.count}`).join(', ')}
                  onReset={handleReset}
                />
                <SaveToFavoritesButton calculatorType="demographics" inputs={currentInputs} />
                {lastResult && (
                  <AddToCompareButton
                    result={lastResult}
                    isInComparison={isInComparison(lastResult.id)}
                    onAdd={handleComparisonToggle}
                    onRemove={handleComparisonToggle}
                  />
                )}
                {activeFlow && (
                  <Button
                    onClick={nextFlowStep}
                    className="bg-[#5B50BD] hover:bg-[#4a3fa3] text-white"
                  >
                    Continue to Next Step
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quota Table */}
          <DemographicsQuotaTable
            quotas={[
              ...result.ageDistribution.map((age) => ({
                category: `Age ${age.range}`,
                percentage: age.percentage,
                count: age.count,
                feasibility: age.percentage >= 20 ? 'easy' as const : age.percentage >= 10 ? 'moderate' as const : 'hard' as const,
              })),
              ...result.genderDistribution.map((g) => ({
                category: g.gender,
                percentage: g.percentage,
                count: g.count,
                feasibility: g.percentage >= 40 ? 'easy' as const : g.percentage >= 20 ? 'moderate' as const : 'hard' as const,
              })),
            ]}
            total={parseInt(totalSample)}
          />
        </>
      )}
    </div>
  );
}
