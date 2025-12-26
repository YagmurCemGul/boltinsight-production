'use client';

import { useState, useCallback, useMemo } from 'react';
import { Calculator, RefreshCw, Percent, Target, Info, TrendingDown } from 'lucide-react';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  EntityMention,
  CalculatorResult,
  MetricDisplay,
  MetricGrid,
  BenchmarkIndicator,
  AIInsightsPanel,
  AddToProposalButton,
  MOEQualityIndicator,
  QualityCircles,
  ProgressBar,
  SummaryBox,
  WhatIfPanel,
  generateMOEWhatIf,
  QuickAdjust,
  AddToCompareButton,
  QuickInsightBanner,
  MOE_QUALITY_RANGES,
} from '../shared';
import { SaveToFavoritesButton } from '../FavoritesPanel';
import { calculateMarginOfError } from '@/lib/calculators/calculations';
import { generateMOEInsights } from '@/lib/calculators/ai-insights';
import { useCalculatorStore, generateCalculatorId } from '@/lib/calculators/store';
import type {
  MOEInputs,
  MOEOutputs,
  MOEResult,
  MentionEntity,
  CalculatorAutoFill,
  AIInsight,
  ConfidenceLevel,
} from '@/types/calculator';
import { cn } from '@/lib/utils';

const CONFIDENCE_LEVELS = [
  { value: '90', label: '90%' },
  { value: '95', label: '95% (Recommended)' },
  { value: '99', label: '99%' },
];

const QUICK_SAMPLE_PRESETS = [
  { label: '100', value: 100 },
  { label: '300', value: 300 },
  { label: '500', value: 500 },
  { label: '1,000', value: 1000 },
  { label: '2,000', value: 2000 },
];

export function MarginOfErrorCalculator() {
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
  const [sampleSize, setSampleSize] = useState<string>('500');
  const [confidenceLevel, setConfidenceLevel] = useState<string>('95');
  const [populationSize, setPopulationSize] = useState<string>('');

  // Result state
  const [result, setResult] = useState<MOEOutputs | null>(null);
  const [lastResult, setLastResult] = useState<MOEResult | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<MentionEntity | null>(null);

  // Get current inputs object for favorites
  const currentInputs = useMemo(
    () => ({
      sampleSize: parseInt(sampleSize),
      confidenceLevel: parseInt(confidenceLevel),
      populationSize: populationSize ? parseInt(populationSize) : undefined,
    }),
    [sampleSize, confidenceLevel, populationSize]
  );

  // Handle entity selection from @mention
  const handleEntitySelect = useCallback((entity: MentionEntity, autoFill: CalculatorAutoFill) => {
    setSelectedEntity(entity);

    // Apply auto-fill values
    if (autoFill.sampleSize) {
      setSampleSize(autoFill.sampleSize.toString());
    }
    if (autoFill.confidenceLevel) {
      setConfidenceLevel(autoFill.confidenceLevel.toString());
    }
  }, []);

  // Handle entity clear
  const handleEntityClear = useCallback(() => {
    setSelectedEntity(null);
    setProposalContext(null);
  }, [setProposalContext]);

  // Calculate
  const handleCalculate = useCallback(() => {
    const sample = parseInt(sampleSize);
    if (isNaN(sample) || sample <= 0) return;

    const inputs: MOEInputs = {
      sampleSize: sample,
      confidenceLevel: parseInt(confidenceLevel) as ConfidenceLevel,
      populationSize: populationSize ? parseInt(populationSize) : undefined,
    };

    const outputs = calculateMarginOfError(inputs);
    const aiInsights = generateMOEInsights(inputs, outputs);

    setResult(outputs);
    setInsights(aiInsights);

    // Save to history
    const calculatorResult: MOEResult = {
      id: generateCalculatorId(),
      type: 'moe',
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
  }, [sampleSize, confidenceLevel, populationSize, addResult, activeFlow, completeFlowStep]);

  // Reset
  const handleReset = useCallback(() => {
    setSampleSize('500');
    setConfidenceLevel('95');
    setPopulationSize('');
    setResult(null);
    setLastResult(null);
    setInsights([]);
    setSelectedEntity(null);
    setProposalContext(null);
  }, [setProposalContext]);

  // Handle AI action application
  const handleApplyAction = useCallback(
    (insight: AIInsight) => {
      if (insight.action) {
        const { field, value } = insight.action;
        if (field === 'sampleSize') {
          setSampleSize(value.toString());
          // Auto-recalculate
          setTimeout(handleCalculate, 100);
        }
      }
    },
    [handleCalculate]
  );

  // Handle comparison toggle
  const handleComparisonToggle = useCallback(() => {
    if (!lastResult) return;
    if (isInComparison(lastResult.id)) {
      removeFromComparison(lastResult.id);
    } else {
      addToComparison(lastResult);
    }
  }, [lastResult, isInComparison, addToComparison, removeFromComparison]);

  // Handle quick sample size selection
  const handleQuickSampleSelect = useCallback((value: number) => {
    setSampleSize(value.toString());
  }, []);

  // Generate What-If scenarios
  const whatIfScenarios = useMemo(() => {
    if (!result) return [];
    return generateMOEWhatIf(result.marginOfError, parseInt(sampleSize));
  }, [result, sampleSize]);

  // Get MOE quality color
  const getMOEQualityColor = (moe: number): string => {
    if (moe <= 3) return 'green';
    if (moe <= 5) return 'blue';
    if (moe <= 7) return 'yellow';
    return 'red';
  };

  return (
    <div className="space-y-6">
      {/* Entity Reference */}
      <Card>
        <CardContent className="p-4">
          <EntityMention
            calculatorType="moe"
            onSelect={handleEntitySelect}
            onClear={handleEntityClear}
            placeholder="Type @ to reference a proposal, client, or project and auto-fill sample size..."
          />
        </CardContent>
      </Card>

      {/* Calculator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Percent className="h-5 w-5 text-blue-600" />
            Margin of Error Calculator
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sample Size <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
                placeholder="e.g., 500"
                min="1"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Number of respondents in your study
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confidence Level <span className="text-red-500">*</span>
              </label>
              <Select
                options={CONFIDENCE_LEVELS}
                value={confidenceLevel}
                onChange={(e) => setConfidenceLevel(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                95% is standard for most research
              </p>
            </div>
          </div>

          {/* Quick sample size selector */}
          <QuickAdjust
            label="Quick Sample Size Selection"
            currentValue={parseInt(sampleSize) || 0}
            adjustments={QUICK_SAMPLE_PRESETS}
            onSelect={handleQuickSampleSelect}
            unit=""
          />

          <div className="max-w-xs">
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Population Size (optional)
            </label>
            <Input
              type="number"
              value={populationSize}
              onChange={(e) => setPopulationSize(e.target.value)}
              placeholder="Leave blank for infinite"
              min="1"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              For finite population correction
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCalculate} className="flex-1">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate MOE
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
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-1">
                      Margin of Error
                    </h3>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                      ±{result.marginOfError}%
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      At {confidenceLevel}% confidence with n={parseInt(sampleSize).toLocaleString()}
                    </p>
                  </div>
                  <QualityCircles rating={result.qualityRating} />
                </div>

                {/* Quality indicator with 5-circle system */}
                <MOEQualityIndicator moe={result.marginOfError} showDetails size="lg" />
              </div>

              {/* Progress bar showing MOE quality */}
              <div className="space-y-1">
                <div className="text-sm text-gray-600 dark:text-gray-400">Precision Level</div>
                <ProgressBar
                  value={10 - Math.min(result.marginOfError, 10)}
                  max={10}
                  showPercentage={false}
                  colorScheme="quality"
                />
              </div>

              {/* Visual quality rating legend */}
              <div className="grid grid-cols-4 gap-2 text-center text-xs">
                <div className="p-2 bg-green-100 dark:bg-green-950/30 rounded">
                  <div className="font-semibold text-green-700 dark:text-green-400">≤3%</div>
                  <div className="text-gray-600 dark:text-gray-400">Excellent</div>
                </div>
                <div className="p-2 bg-blue-100 dark:bg-blue-950/30 rounded">
                  <div className="font-semibold text-blue-700 dark:text-blue-400">3-5%</div>
                  <div className="text-gray-600 dark:text-gray-400">Good</div>
                </div>
                <div className="p-2 bg-yellow-100 dark:bg-yellow-950/30 rounded">
                  <div className="font-semibold text-yellow-700 dark:text-yellow-400">5-7%</div>
                  <div className="text-gray-600 dark:text-gray-400">Acceptable</div>
                </div>
                <div className="p-2 bg-red-100 dark:bg-red-950/30 rounded">
                  <div className="font-semibold text-red-700 dark:text-red-400">&gt;7%</div>
                  <div className="text-gray-600 dark:text-gray-400">Consider more sample</div>
                </div>
              </div>

              {/* Summary box */}
              <SummaryBox title="Result Summary">
                <div className="space-y-1">
                  <div>📊 Sample Size: {parseInt(sampleSize).toLocaleString()} respondents</div>
                  <div>📏 Margin of Error: ±{result.marginOfError}%</div>
                  <div>🎯 Confidence Level: {confidenceLevel}%</div>
                  <div>✅ Quality Rating: {result.qualityRating.charAt(0).toUpperCase() + result.qualityRating.slice(1)}</div>
                </div>
              </SummaryBox>

              {/* Client-friendly explanation */}
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-[#5B50BD] flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      What this means (plain language):
                    </h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {result.clientFriendly}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      <strong>Example:</strong> If your survey shows 60% preference, the true value is
                      likely between{' '}
                      <span className="font-semibold text-[#5B50BD]">
                        {(60 - result.marginOfError).toFixed(1)}% and{' '}
                        {(60 + result.marginOfError).toFixed(1)}%
                      </span>
                      .
                    </p>
                  </div>
                </div>
              </div>

              {/* What-if scenarios to improve */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 dark:text-white flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-green-600" />
                  Sample Needed for Better Precision:
                </h4>
                <MetricGrid columns={3}>
                  <MetricDisplay
                    label="For ±3% MOE"
                    value={result.whatIf.toReach3Percent.toLocaleString()}
                    subtext={
                      parseInt(sampleSize) >= result.whatIf.toReach3Percent
                        ? '✓ Already achieved!'
                        : `+${(result.whatIf.toReach3Percent - parseInt(sampleSize)).toLocaleString()} more needed`
                    }
                    trend={
                      parseInt(sampleSize) >= result.whatIf.toReach3Percent ? 'neutral' : 'up'
                    }
                  />
                  <MetricDisplay
                    label="For ±5% MOE"
                    value={result.whatIf.toReach5Percent.toLocaleString()}
                    subtext={
                      parseInt(sampleSize) >= result.whatIf.toReach5Percent
                        ? '✓ Already achieved!'
                        : `+${(result.whatIf.toReach5Percent - parseInt(sampleSize)).toLocaleString()} more needed`
                    }
                    trend={
                      parseInt(sampleSize) >= result.whatIf.toReach5Percent ? 'neutral' : 'up'
                    }
                  />
                </MetricGrid>
              </div>

              {/* AI Insights */}
              {insights.length > 0 && (
                <AIInsightsPanel insights={insights} onApplyAction={handleApplyAction} />
              )}

              {/* Action buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                <AddToProposalButton
                  calculatorType="moe"
                  value={`±${result.marginOfError}% MOE at ${confidenceLevel}% CI with n=${sampleSize}`}
                  onReset={handleReset}
                />
                <SaveToFavoritesButton calculatorType="moe" inputs={currentInputs} />
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

          {/* What-If Analysis Panel */}
          {whatIfScenarios.length > 0 && (
            <WhatIfPanel
              title="What-If Analysis"
              scenarios={whatIfScenarios}
              currentResult={result.marginOfError}
              currentResultLabel="% MOE"
            />
          )}

          {/* MOE Reference Table */}
          <Card>
            <CardContent className="p-4">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                MOE Reference Table
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-100 dark:bg-gray-800">
                      <th className="px-4 py-2 text-left">Sample Size</th>
                      <th className="px-4 py-2 text-left">MOE (95% CI)</th>
                      <th className="px-4 py-2 text-left">Quality</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { n: 100, moe: 9.8, quality: 'poor' },
                      { n: 300, moe: 5.7, quality: 'acceptable' },
                      { n: 500, moe: 4.4, quality: 'good' },
                      { n: 1000, moe: 3.1, quality: 'good' },
                      { n: 2000, moe: 2.2, quality: 'excellent' },
                    ].map((row) => {
                      const isHighlighted =
                        parseInt(sampleSize) >= row.n * 0.8 &&
                        parseInt(sampleSize) <= row.n * 1.2;
                      return (
                        <tr
                          key={row.n}
                          className={cn(
                            'border-b dark:border-gray-700',
                            isHighlighted && 'bg-blue-50 dark:bg-blue-950/30'
                          )}
                        >
                          <td className="px-4 py-3">{row.n.toLocaleString()}</td>
                          <td className="px-4 py-3">±{row.moe}%</td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                'px-2 py-0.5 rounded text-xs font-medium',
                                row.quality === 'excellent' &&
                                  'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400',
                                row.quality === 'good' &&
                                  'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-400',
                                row.quality === 'acceptable' &&
                                  'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400',
                                row.quality === 'poor' &&
                                  'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400'
                              )}
                            >
                              {row.quality}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
