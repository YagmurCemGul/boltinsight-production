'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Calculator,
  RefreshCw,
  Users,
  DollarSign,
  Target,
  AlertTriangle,
  Lightbulb,
  Layers,
} from 'lucide-react';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  EntityMention,
  CalculatorResult,
  MetricDisplay,
  MetricGrid,
  BenchmarkIndicator,
  AIInsightsPanel,
  AddToProposalButton,
  QualityCircles,
  ProgressBar,
  SummaryBox,
  WhatIfPanel,
  generateSampleSizeWhatIf,
  QuickAdjust,
  SampleSizeReferenceTable,
  AddToCompareButton,
  AIRecommendationCard,
  QuickInsightBanner,
} from '../shared';
import { SaveToFavoritesButton } from '../FavoritesPanel';
import { calculateSampleSize } from '@/lib/calculators/calculations';
import { generateSampleSizeInsights } from '@/lib/calculators/ai-insights';
import {
  getBudgetBasedRecommendation,
  getTimelineBasedRecommendation,
  getSubgroupRecommendation,
  generateContextualRecommendations,
} from '@/lib/calculators/ai-recommendations';
import { useCalculatorStore, generateCalculatorId } from '@/lib/calculators/store';
import type {
  SampleSizeInputs,
  SampleSizeOutputs,
  SampleSizeResult,
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

const MOE_OPTIONS = [
  { value: '1', label: '±1% (Very high precision)' },
  { value: '2', label: '±2% (High precision)' },
  { value: '3', label: '±3% (Standard)' },
  { value: '4', label: '±4%' },
  { value: '5', label: '±5% (Common)' },
  { value: '7', label: '±7%' },
  { value: '10', label: '±10% (Exploratory)' },
];

const QUICK_SAMPLE_PRESETS = [
  { label: '100', value: 100 },
  { label: '300', value: 300 },
  { label: '500', value: 500 },
  { label: '1,000', value: 1000 },
  { label: '2,000', value: 2000 },
];

export function SampleSizeCalculator() {
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
  const [confidenceLevel, setConfidenceLevel] = useState<string>('95');
  const [marginOfError, setMarginOfError] = useState<string>('5');
  const [populationSize, setPopulationSize] = useState<string>('');
  const [responseDistribution, setResponseDistribution] = useState<string>('50');
  const [budget, setBudget] = useState<string>('');
  const [timeline, setTimeline] = useState<string>('');
  const [subgroups, setSubgroups] = useState<string>('');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Result state
  const [result, setResult] = useState<SampleSizeOutputs | null>(null);
  const [lastResult, setLastResult] = useState<SampleSizeResult | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<MentionEntity | null>(null);

  // Get current inputs object for favorites
  const currentInputs = useMemo(
    () => ({
      confidenceLevel: parseInt(confidenceLevel),
      marginOfError: parseFloat(marginOfError),
      populationSize: populationSize ? parseInt(populationSize) : undefined,
      responseDistribution: parseFloat(responseDistribution),
    }),
    [confidenceLevel, marginOfError, populationSize, responseDistribution]
  );

  // Handle entity selection from @mention
  const handleEntitySelect = useCallback(
    (entity: MentionEntity, autoFill: CalculatorAutoFill) => {
      setSelectedEntity(entity);

      // Apply auto-fill values
      if (autoFill.confidenceLevel) {
        setConfidenceLevel(autoFill.confidenceLevel.toString());
      }
      if (autoFill.marginOfError) {
        setMarginOfError(autoFill.marginOfError.toString());
      }
    },
    []
  );

  // Handle entity clear
  const handleEntityClear = useCallback(() => {
    setSelectedEntity(null);
    setProposalContext(null);
  }, [setProposalContext]);

  // Calculate
  const handleCalculate = useCallback(() => {
    const inputs: SampleSizeInputs = {
      confidenceLevel: parseInt(confidenceLevel) as ConfidenceLevel,
      marginOfError: parseFloat(marginOfError),
      populationSize: populationSize ? parseInt(populationSize) : undefined,
      responseDistribution: parseFloat(responseDistribution),
    };

    const outputs = calculateSampleSize(inputs);
    const aiInsights = generateSampleSizeInsights(inputs, outputs);

    // Add budget/timeline based recommendations if provided
    if (budget) {
      const budgetRec = getBudgetBasedRecommendation(parseFloat(budget));
      if (budgetRec) {
        aiInsights.push({
          id: `budget-${Date.now()}`,
          type: 'recommendation',
          message: `With $${parseFloat(budget).toLocaleString()} budget, you can achieve ~${budgetRec.recommendedSample.toLocaleString()} respondents at ~$${budgetRec.costPerRespondent.toFixed(2)}/respondent.`,
          confidence: 0.7,
        });
      }
    }

    if (subgroups) {
      const subgroupRec = getSubgroupRecommendation(
        outputs.recommendedSample,
        parseInt(subgroups)
      );
      if (subgroupRec) {
        aiInsights.push({
          id: `subgroup-${Date.now()}`,
          type: subgroupRec.isReliable ? 'optimization' : 'warning',
          message: subgroupRec.recommendation,
          confidence: 0.8,
        });
      }
    }

    setResult(outputs);
    setInsights(aiInsights);

    // Save to history
    const calculatorResult: SampleSizeResult = {
      id: generateCalculatorId(),
      type: 'sample',
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
  }, [
    confidenceLevel,
    marginOfError,
    populationSize,
    responseDistribution,
    budget,
    subgroups,
    addResult,
    activeFlow,
    completeFlowStep,
  ]);

  // Reset
  const handleReset = useCallback(() => {
    setConfidenceLevel('95');
    setMarginOfError('5');
    setPopulationSize('');
    setResponseDistribution('50');
    setBudget('');
    setTimeline('');
    setSubgroups('');
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
        if (field === 'marginOfError') {
          setMarginOfError(value.toString());
        }
      }
    },
    []
  );

  // Handle What-If scenario application
  const handleApplyWhatIf = useCallback((scenario: { field: string; newValue: number }) => {
    if (scenario.field === 'sampleSize') {
      // Reverse calculate the MOE for this sample size
      // For now, just show the scenario is applied
    }
  }, []);

  // Handle comparison toggle
  const handleComparisonToggle = useCallback(() => {
    if (!lastResult) return;
    if (isInComparison(lastResult.id)) {
      removeFromComparison(lastResult.id);
    } else {
      addToComparison(lastResult);
    }
  }, [lastResult, isInComparison, addToComparison, removeFromComparison]);

  // Generate What-If scenarios
  const whatIfScenarios = useMemo(() => {
    if (!result) return [];
    const costPerRespondent = 20;
    return generateSampleSizeWhatIf(result.recommendedSample, parseFloat(marginOfError), costPerRespondent);
  }, [result, marginOfError]);


  return (
    <div className="space-y-6">
      {/* Entity Reference */}
      <Card>
        <CardContent className="p-4">
          <EntityMention
            calculatorType="sample"
            onSelect={handleEntitySelect}
            onClear={handleEntityClear}
            placeholder="Type @ to reference a proposal, client, or project and auto-fill parameters..."
          />
        </CardContent>
      </Card>

      {/* Calculator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600" />
            Sample Size Calculator
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

          {/* Main inputs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                95% is standard for most market research
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Target Margin of Error <span className="text-red-500">*</span>
              </label>
              <Select
                options={MOE_OPTIONS}
                value={marginOfError}
                onChange={(e) => setMarginOfError(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ±3-5% is typical for quantitative research
              </p>
            </div>
          </div>

          {/* Budget-based quick input */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <DollarSign className="w-4 h-4 inline mr-1" />
                Budget (optional)
              </label>
              <Input
                type="number"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                placeholder="e.g., 10000"
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Get recommendations based on your budget
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                <Layers className="w-4 h-4 inline mr-1" />
                Number of Subgroups (optional)
              </label>
              <Input
                type="number"
                value={subgroups}
                onChange={(e) => setSubgroups(e.target.value)}
                placeholder="e.g., 4"
                min="1"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                For subgroup analysis requirements
              </p>
            </div>
          </div>

          {/* Advanced options toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-[#5B50BD] dark:text-[#918AD3] hover:underline"
          >
            {showAdvanced ? '▼ Hide' : '▶ Show'} Advanced Options
          </button>

          {/* Advanced inputs */}
          {showAdvanced && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div>
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
                  For finite population correction (FPC)
                </p>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Response Distribution
                </label>
                <Input
                  type="number"
                  value={responseDistribution}
                  onChange={(e) => setResponseDistribution(e.target.value)}
                  placeholder="50"
                  min="1"
                  max="99"
                />
                <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                  Expected % split (50% = most conservative)
                </p>
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCalculate} className="flex-1">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Sample Size
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
                      Recommended Sample Size
                    </h3>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                      n = {result.recommendedSample.toLocaleString()}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      To achieve ±{marginOfError}% margin of error with {confidenceLevel}% confidence
                    </p>
                  </div>
                  <QualityCircles rating={result.qualityRating} />
                </div>

                {/* Quick summary */}
                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-blue-200 dark:border-blue-800">
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Quality</div>
                    <div className={cn(
                      'text-lg font-semibold capitalize',
                      result.qualityRating === 'excellent' && 'text-green-600',
                      result.qualityRating === 'good' && 'text-blue-600',
                      result.qualityRating === 'acceptable' && 'text-yellow-600',
                      result.qualityRating === 'poor' && 'text-red-600'
                    )}>
                      {result.qualityRating}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Est. Cost</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      ${(result.estimatedCost || 0).toLocaleString()}
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Subgroups</div>
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      {result.subgroupCapacity}
                    </div>
                  </div>
                </div>
              </div>

              {/* Quality progress bar */}
              <div className="space-y-1">
                <div className="text-sm text-gray-600 dark:text-gray-400">Sample adequacy</div>
                <ProgressBar
                  value={result.recommendedSample}
                  max={2000}
                  showPercentage={false}
                  colorScheme="quality"
                />
              </div>

              {/* Summary box */}
              <SummaryBox title="Calculation Summary">
                <div className="space-y-1">
                  <div>📊 Confidence Level: {confidenceLevel}%</div>
                  <div>📏 Target MOE: ±{marginOfError}%</div>
                  <div>👥 Recommended: {result.recommendedSample.toLocaleString()} respondents</div>
                  <div>📉 Minimum Acceptable: {result.minimumSample.toLocaleString()} respondents</div>
                  <div>🔍 Can analyze {result.subgroupCapacity} subgroups</div>
                  <div>💰 Estimated cost: ${(result.estimatedCost || 0).toLocaleString()}</div>
                </div>
              </SummaryBox>

              {/* Subgroup warning if needed */}
              {subgroups && parseInt(subgroups) > result.subgroupCapacity && (
                <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-amber-800 dark:text-amber-200">
                        Subgroup Analysis Warning
                      </h4>
                      <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                        You requested {subgroups} subgroups, but this sample only supports{' '}
                        {result.subgroupCapacity}. Consider increasing your sample size to at least{' '}
                        <strong>{parseInt(subgroups) * 100}</strong> for reliable subgroup analysis.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI Insights */}
              {insights.length > 0 && (
                <AIInsightsPanel insights={insights} onApplyAction={handleApplyAction} />
              )}

              {/* Budget recommendation if budget provided */}
              {budget && (
                <AIRecommendationCard
                  insight={{
                    id: `budget-rec-${Date.now()}`,
                    type: parseInt(budget) / 20 >= result.recommendedSample ? 'optimization' : 'warning',
                    message: `With a budget of $${parseInt(budget).toLocaleString()}, you can afford approximately ${Math.floor(
                      parseInt(budget) / 20
                    ).toLocaleString()} respondents at $20/respondent.${
                      parseInt(budget) / 20 < result.recommendedSample
                        ? ' Consider increasing target MOE to reduce sample needs.'
                        : ''
                    }`,
                    confidence: 0.8,
                  }}
                />
              )}

              {/* Action buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                <AddToProposalButton
                  calculatorType="sample"
                  value={result.recommendedSample}
                  onReset={handleReset}
                />
                <SaveToFavoritesButton
                  calculatorType="sample"
                  inputs={currentInputs}
                />
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

          {/* What-If Analysis */}
          {whatIfScenarios.length > 0 && (
            <WhatIfPanel
              title="What-If Analysis"
              scenarios={whatIfScenarios}
              onApplyScenario={handleApplyWhatIf}
              currentResult={result.recommendedSample}
              currentResultLabel="respondents"
            />
          )}

          {/* Quick Adjust */}
          <Card>
            <CardContent className="p-4">
              <QuickAdjust
                label="Quick Sample Size Comparison"
                currentValue={result.recommendedSample}
                adjustments={QUICK_SAMPLE_PRESETS}
                onSelect={(value) => {
                  // This would ideally reverse-calculate MOE
                }}
                unit=" respondents"
              />
            </CardContent>
          </Card>

          {/* Reference table */}
          <SampleSizeReferenceTable highlightSample={result.recommendedSample} />
        </>
      )}
    </div>
  );
}
