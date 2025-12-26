'use client';

import { useState, useCallback, useMemo } from 'react';
import { Calculator, RefreshCw, BarChart3, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { Button, Input, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';
import {
  EntityMention,
  CalculatorResult,
  MetricDisplay,
  MetricGrid,
  AIInsightsPanel,
  AddToProposalButton,
  QualityCircles,
  ProgressBar,
  SummaryBox,
  BalanceCheck,
  ReliabilityIndicator,
  AddToCompareButton,
  QuickInsightBanner,
} from '../shared';
import { SaveToFavoritesButton } from '../FavoritesPanel';
import { calculateMaxDiff } from '@/lib/calculators/calculations';
import { generateMaxDiffInsights } from '@/lib/calculators/ai-insights';
import { useCalculatorStore, generateCalculatorId } from '@/lib/calculators/store';
import type {
  MaxDiffInputs,
  MaxDiffOutputs,
  MaxDiffResult,
  MentionEntity,
  CalculatorAutoFill,
  AIInsight,
} from '@/types/calculator';
import { cn } from '@/lib/utils';

const RELIABILITY_COLORS = {
  high: 'text-green-600 dark:text-green-400',
  medium: 'text-amber-600 dark:text-amber-400',
  low: 'text-red-600 dark:text-red-400',
};

export function MaxDiffCalculator() {
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
  const [totalItems, setTotalItems] = useState<string>('12');
  const [itemsPerSet, setItemsPerSet] = useState<string>('4');
  const [sampleSize, setSampleSize] = useState<string>('300');
  const [customTasks, setCustomTasks] = useState<string>('');

  // Result state
  const [result, setResult] = useState<MaxDiffOutputs | null>(null);
  const [lastResult, setLastResult] = useState<MaxDiffResult | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<MentionEntity | null>(null);

  // Get current inputs object for favorites
  const currentInputs = useMemo(
    () => ({
      totalItems: parseInt(totalItems) || 0,
      itemsPerSet: parseInt(itemsPerSet) || 0,
      sampleSize: parseInt(sampleSize) || 0,
      customTasks: customTasks ? parseInt(customTasks) : undefined,
    }),
    [totalItems, itemsPerSet, sampleSize, customTasks]
  );

  // Handle entity selection from @mention
  const handleEntitySelect = useCallback((entity: MentionEntity, autoFill: CalculatorAutoFill) => {
    setSelectedEntity(entity);

    if (autoFill.sampleSize) {
      setSampleSize(autoFill.sampleSize.toString());
    }
  }, []);

  // Handle entity clear
  const handleEntityClear = useCallback(() => {
    setSelectedEntity(null);
    setProposalContext(null);
  }, [setProposalContext]);

  // Calculate
  const handleCalculate = useCallback(() => {
    const items = parseInt(totalItems);
    const perSet = parseInt(itemsPerSet);
    const sample = parseInt(sampleSize);

    if (isNaN(items) || isNaN(perSet) || isNaN(sample)) return;
    if (perSet >= items) {
      return;
    }

    const inputs: MaxDiffInputs = {
      totalItems: items,
      itemsPerSet: perSet,
      sampleSize: sample,
      customTasks: customTasks ? parseInt(customTasks) : undefined,
    };

    const outputs = calculateMaxDiff(inputs);
    const aiInsights = generateMaxDiffInsights(inputs, outputs);

    setResult(outputs);
    setInsights(aiInsights);

    // Save to history
    const calculatorResult: MaxDiffResult = {
      id: generateCalculatorId(),
      type: 'maxdiff',
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
  }, [totalItems, itemsPerSet, sampleSize, customTasks, addResult, activeFlow, completeFlowStep]);

  // Reset
  const handleReset = useCallback(() => {
    setTotalItems('12');
    setItemsPerSet('4');
    setSampleSize('300');
    setCustomTasks('');
    setResult(null);
    setLastResult(null);
    setInsights([]);
    setSelectedEntity(null);
    setProposalContext(null);
  }, [setProposalContext]);

  // Handle AI action application
  const handleApplyAction = useCallback((insight: AIInsight) => {
    if (insight.action) {
      const { field, value } = insight.action;
      if (field === 'sampleSize') {
        setSampleSize(value.toString());
      } else if (field === 'customTasks') {
        setCustomTasks(value.toString());
      }
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

  // Get quality rating based on reliability
  const getQualityRating = (reliability: string): 'excellent' | 'good' | 'acceptable' | 'poor' => {
    switch (reliability) {
      case 'high':
        return 'excellent';
      case 'medium':
        return 'good';
      case 'low':
        return 'poor';
      default:
        return 'acceptable';
    }
  };

  return (
    <div className="space-y-6">
      {/* Entity Reference */}
      <Card>
        <CardContent className="p-4">
          <EntityMention
            calculatorType="maxdiff"
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
            <BarChart3 className="h-5 w-5 text-[#5B50BD]" />
            MaxDiff (Best-Worst Scaling) Calculator
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
            Calculate optimal design parameters for MaxDiff studies.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Items to Test <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={totalItems}
                onChange={(e) => setTotalItems(e.target.value)}
                placeholder="e.g., 12"
                min="4"
                max="30"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Typical range: 8-20 items
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Items per Set <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={itemsPerSet}
                onChange={(e) => setItemsPerSet(e.target.value)}
                placeholder="e.g., 4"
                min="3"
                max="7"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                4-5 items is optimal for respondent burden
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sample Size <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
                placeholder="e.g., 300"
                min="50"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Minimum 200 for individual-level utilities
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Custom Tasks (optional)
              </label>
              <Input
                type="number"
                value={customTasks}
                onChange={(e) => setCustomTasks(e.target.value)}
                placeholder="Auto-calculated if blank"
                min="1"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Override recommended number of tasks
              </p>
            </div>
          </div>

          {/* Validation warning */}
          {parseInt(itemsPerSet) >= parseInt(totalItems) && (
            <div className="p-3 bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
              <p className="text-sm text-red-700 dark:text-red-300">
                Items per set must be less than total items.
              </p>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button
              onClick={handleCalculate}
              className="flex-1"
              disabled={parseInt(itemsPerSet) >= parseInt(totalItems)}
            >
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Design
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
        <Card>
          <CardContent className="p-6 space-y-6">
            {/* Main result with visual box */}
            <div className="bg-gradient-to-br from-[#EDE9F9] to-[#D8D3F0] dark:from-[#231E51] dark:to-[#2D2660] rounded-xl p-6 border border-[#C8C4E9] dark:border-[#5B50BD]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-sm font-medium text-[#5B50BD] dark:text-[#918AD3] mb-1">
                    MaxDiff Design
                  </h3>
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {result.recommendedTasks} <span className="text-xl font-normal">tasks</span>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    {totalItems} items, {itemsPerSet} per set, n={sampleSize}
                  </p>
                </div>
                <QualityCircles rating={getQualityRating(result.reliabilityScore)} />
              </div>

              {/* Quick stats grid */}
              <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-[#C8C4E9] dark:border-[#5B50BD]/50">
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#5B50BD] dark:text-[#918AD3]">
                    {result.recommendedTasks}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Tasks</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-[#5B50BD] dark:text-[#918AD3]">
                    {result.totalComparisons}
                  </p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">Comparisons</p>
                </div>
                <div className="text-center">
                  <ReliabilityIndicator score={result.reliabilityScore} />
                </div>
              </div>
            </div>

            {/* Balance and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <BalanceCheck
                isBalanced={result.isBalancedDesign}
                details={[`Each item shown ${result.timesEachItemShown} times`]}
              />

              <div className="p-4 rounded-lg bg-gray-50 dark:bg-gray-800">
                <p className="font-medium text-gray-900 dark:text-white">Estimated Duration</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  ~{result.estimatedDuration} min
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Based on 30 seconds per task
                </p>
              </div>
            </div>

            {/* Summary box */}
            <SummaryBox title="Design Summary">
              <div className="space-y-1">
                <div>📊 Total Items: {totalItems}</div>
                <div>📋 Items per Set: {itemsPerSet}</div>
                <div>🔢 Recommended Tasks: {result.recommendedTasks}</div>
                <div>👁️ Each Item Shown: {result.timesEachItemShown}x per respondent</div>
                <div>📈 Total Comparisons: {result.totalComparisons}</div>
                <div>⏱️ Duration: ~{result.estimatedDuration} minutes</div>
                <div>✅ Balanced Design: {result.isBalancedDesign ? 'Yes' : 'No'}</div>
                <div>📏 Reliability: {result.reliabilityScore.charAt(0).toUpperCase() + result.reliabilityScore.slice(1)}</div>
              </div>
            </SummaryBox>

            {/* Additional metrics */}
            <MetricGrid columns={2}>
              <MetricDisplay
                label="Min Sample for Utilities"
                value={result.minimumSampleForUtilities.toLocaleString()}
                subtext={
                  parseInt(sampleSize) >= result.minimumSampleForUtilities
                    ? '✓ Your sample is sufficient'
                    : '⚠️ Increase sample size'
                }
                trend={parseInt(sampleSize) >= result.minimumSampleForUtilities ? 'neutral' : 'down'}
              />
              <MetricDisplay
                label="Times Each Item Shown"
                value={result.timesEachItemShown}
                subtext={
                  result.timesEachItemShown >= 3
                    ? '✓ Good coverage'
                    : '⚠️ Consider more tasks'
                }
              />
            </MetricGrid>

            {/* Sample size warning */}
            {parseInt(sampleSize) < result.minimumSampleForUtilities && (
              <div className="p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-amber-800 dark:text-amber-200">
                      Sample Size Warning
                    </h4>
                    <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                      Your sample of {parseInt(sampleSize).toLocaleString()} is below the
                      recommended minimum of {result.minimumSampleForUtilities.toLocaleString()} for
                      individual-level utility estimation. Consider increasing your sample size.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* AI Insights */}
            {insights.length > 0 && (
              <AIInsightsPanel insights={insights} onApplyAction={handleApplyAction} />
            )}

            {/* Guidelines */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-[#5B50BD] flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    Design Guidelines
                  </h4>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Aim for each item to be shown 3+ times per respondent</li>
                    <li>• 4-5 items per task is optimal for cognitive load</li>
                    <li>• n=200+ for individual-level utility estimation</li>
                    <li>• n=300+ recommended for subgroup analysis</li>
                    <li>• Balanced designs ensure equal exposure of all items</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
              <AddToProposalButton
                calculatorType="maxdiff"
                value={`MaxDiff: ${totalItems} items, ${result.recommendedTasks} tasks, ${itemsPerSet} per set`}
                onReset={handleReset}
              />
              <SaveToFavoritesButton calculatorType="maxdiff" inputs={currentInputs} />
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
      )}
    </div>
  );
}
