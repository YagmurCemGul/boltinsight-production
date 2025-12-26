'use client';

import { useState, useCallback, useMemo } from 'react';
import {
  Calculator,
  RefreshCw,
  Clock,
  ChevronDown,
  ChevronUp,
  DollarSign,
  AlertTriangle,
  Zap,
  TrendingDown,
} from 'lucide-react';
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
  CostTierIndicator,
  DropoutRiskIndicator,
  LOIBreakdownTable,
  AddToCompareButton,
  QuickInsightBanner,
  RiskCard,
  SaveToFavoritesButton,
} from '../shared';
import { calculateLOI } from '@/lib/calculators/calculations';
import { generateLOIInsights } from '@/lib/calculators/ai-insights';
import { useCalculatorStore, generateCalculatorId } from '@/lib/calculators/store';
import type {
  LOIInputs,
  LOIOutputs,
  LOIResult,
  MentionEntity,
  CalculatorAutoFill,
  AIInsight,
  CostTier,
} from '@/types/calculator';
import { cn } from '@/lib/utils';

const COST_TIER_COLORS: Record<CostTier, string> = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  standard: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  medium: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  premium: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const COST_TIER_LABELS: Record<CostTier, string> = {
  low: 'Low Cost',
  standard: 'Standard',
  medium: 'Medium',
  high: 'High',
  premium: 'Premium',
};

export function LOICalculator() {
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

  // Form state - Question types
  const [singleChoice, setSingleChoice] = useState<string>('15');
  const [multipleChoice, setMultipleChoice] = useState<string>('5');
  const [matrixQuestions, setMatrixQuestions] = useState<string>('2');
  const [matrixItems, setMatrixItems] = useState<string>('6');
  const [openEndShort, setOpenEndShort] = useState<string>('2');
  const [openEndLong, setOpenEndLong] = useState<string>('1');
  const [ranking, setRanking] = useState<string>('0');
  const [maxDiffSets, setMaxDiffSets] = useState<string>('0');
  const [conjointTasks, setConjointTasks] = useState<string>('0');

  // Form state - Media
  const [images, setImages] = useState<string>('0');
  const [videoCount, setVideoCount] = useState<string>('0');
  const [videoDuration, setVideoDuration] = useState<string>('30');

  // Form state - Other
  const [introScreens, setIntroScreens] = useState<string>('3');

  // UI state
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Result state
  const [result, setResult] = useState<LOIOutputs | null>(null);
  const [lastResult, setLastResult] = useState<LOIResult | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [selectedEntity, setSelectedEntity] = useState<MentionEntity | null>(null);

  // Get current inputs object for favorites
  const currentInputs = useMemo(
    () => ({
      singleChoice: parseInt(singleChoice) || 0,
      multipleChoice: parseInt(multipleChoice) || 0,
      matrixQuestions: parseInt(matrixQuestions) || 0,
      matrixItems: parseInt(matrixItems) || 0,
      openEndShort: parseInt(openEndShort) || 0,
      openEndLong: parseInt(openEndLong) || 0,
    }),
    [singleChoice, multipleChoice, matrixQuestions, matrixItems, openEndShort, openEndLong]
  );

  // Handle entity selection from @mention
  const handleEntitySelect = useCallback((entity: MentionEntity, autoFill: CalculatorAutoFill) => {
    setSelectedEntity(entity);

    if (autoFill.loi) {
      // Reverse-engineer question counts from LOI
      // This is a simplified example
    }
  }, []);

  // Handle entity clear
  const handleEntityClear = useCallback(() => {
    setSelectedEntity(null);
    setProposalContext(null);
  }, [setProposalContext]);

  // Calculate
  const handleCalculate = useCallback(() => {
    const inputs: LOIInputs = {
      questions: {
        singleChoice: parseInt(singleChoice) || 0,
        multipleChoice: parseInt(multipleChoice) || 0,
        matrix: {
          questions: parseInt(matrixQuestions) || 0,
          items: parseInt(matrixItems) || 0,
        },
        openEndShort: parseInt(openEndShort) || 0,
        openEndLong: parseInt(openEndLong) || 0,
        ranking: parseInt(ranking) || 0,
        maxDiffSets: parseInt(maxDiffSets) || 0,
        conjointTasks: parseInt(conjointTasks) || 0,
      },
      media: {
        images: parseInt(images) || 0,
        videos: {
          count: parseInt(videoCount) || 0,
          avgDuration: parseInt(videoDuration) || 0,
        },
      },
      introScreens: parseInt(introScreens) || 0,
    };

    const outputs = calculateLOI(inputs);
    const aiInsights = generateLOIInsights(inputs, outputs);

    setResult(outputs);
    setInsights(aiInsights);

    // Save to history
    const calculatorResult: LOIResult = {
      id: generateCalculatorId(),
      type: 'loi',
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
    singleChoice,
    multipleChoice,
    matrixQuestions,
    matrixItems,
    openEndShort,
    openEndLong,
    ranking,
    maxDiffSets,
    conjointTasks,
    images,
    videoCount,
    videoDuration,
    introScreens,
    addResult,
    activeFlow,
    completeFlowStep,
  ]);

  // Reset
  const handleReset = useCallback(() => {
    setSingleChoice('15');
    setMultipleChoice('5');
    setMatrixQuestions('2');
    setMatrixItems('6');
    setOpenEndShort('2');
    setOpenEndLong('1');
    setRanking('0');
    setMaxDiffSets('0');
    setConjointTasks('0');
    setImages('0');
    setVideoCount('0');
    setVideoDuration('30');
    setIntroScreens('3');
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

  // Generate time breakdown for table (LOIBreakdownRow format)
  const timeBreakdown = useMemo(() => {
    if (!result) return [];

    const items = [
      { questionType: 'Single Choice Questions', count: parseInt(singleChoice) || 0, timePerItem: 15, totalTime: (parseInt(singleChoice) || 0) * 15 },
      { questionType: 'Multiple Choice Questions', count: parseInt(multipleChoice) || 0, timePerItem: 30, totalTime: (parseInt(multipleChoice) || 0) * 30 },
      { questionType: 'Matrix Questions', count: parseInt(matrixQuestions) || 0, timePerItem: 9, totalTime: (parseInt(matrixQuestions) || 0) * (parseInt(matrixItems) || 0) * 9 },
      { questionType: 'Open-End (Short)', count: parseInt(openEndShort) || 0, timePerItem: 60, totalTime: (parseInt(openEndShort) || 0) * 60 },
      { questionType: 'Open-End (Long)', count: parseInt(openEndLong) || 0, timePerItem: 120, totalTime: (parseInt(openEndLong) || 0) * 120 },
      { questionType: 'Ranking Questions', count: parseInt(ranking) || 0, timePerItem: 90, totalTime: (parseInt(ranking) || 0) * 90 },
      { questionType: 'MaxDiff Sets', count: parseInt(maxDiffSets) || 0, timePerItem: 30, totalTime: (parseInt(maxDiffSets) || 0) * 30 },
      { questionType: 'Conjoint Tasks', count: parseInt(conjointTasks) || 0, timePerItem: 45, totalTime: (parseInt(conjointTasks) || 0) * 45 },
      { questionType: 'Media (Images/Videos)', count: (parseInt(images) || 0) + (parseInt(videoCount) || 0), timePerItem: 15, totalTime: ((parseInt(images) || 0) * 15) + ((parseInt(videoCount) || 0) * ((parseInt(videoDuration) || 0) + 30)) },
      { questionType: 'Intro/Instructions', count: parseInt(introScreens) || 0, timePerItem: 15, totalTime: (parseInt(introScreens) || 0) * 15 },
    ];
    return items.filter(item => item.count > 0);
  }, [result, singleChoice, multipleChoice, matrixQuestions, matrixItems, openEndShort, openEndLong, ranking, maxDiffSets, conjointTasks, images, videoCount, videoDuration, introScreens]);

  // Get quality rating based on LOI
  const getQualityRating = (loi: number): 'excellent' | 'good' | 'acceptable' | 'poor' => {
    if (loi <= 5) return 'excellent';
    if (loi <= 10) return 'good';
    if (loi <= 15) return 'acceptable';
    return 'poor';
  };

  return (
    <div className="space-y-6">
      {/* Entity Reference */}
      <Card>
        <CardContent className="p-4">
          <EntityMention
            calculatorType="loi"
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
            <Clock className="h-5 w-5 text-green-600" />
            LOI (Length of Interview) Calculator
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Quick insight banner if in flow mode */}
          {activeFlow && (
            <QuickInsightBanner
              type="info"
              message="This calculator is part of a flow. Results will be shared with subsequent calculators."
            />
          )}

          {/* Basic Question Types */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Question Types</h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Single Choice
                </label>
                <Input
                  type="number"
                  value={singleChoice}
                  onChange={(e) => setSingleChoice(e.target.value)}
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">~15 sec each</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Multiple Choice
                </label>
                <Input
                  type="number"
                  value={multipleChoice}
                  onChange={(e) => setMultipleChoice(e.target.value)}
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">~30 sec each</p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Open-End (Short)
                </label>
                <Input
                  type="number"
                  value={openEndShort}
                  onChange={(e) => setOpenEndShort(e.target.value)}
                  min="0"
                />
                <p className="mt-1 text-xs text-gray-500">~1 min each</p>
              </div>
            </div>
          </div>

          {/* Matrix Questions */}
          <div>
            <h4 className="font-medium text-gray-900 dark:text-white mb-3">Matrix/Grid Questions</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Number of Matrices
                </label>
                <Input
                  type="number"
                  value={matrixQuestions}
                  onChange={(e) => setMatrixQuestions(e.target.value)}
                  min="0"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Avg Items per Matrix
                </label>
                <Input
                  type="number"
                  value={matrixItems}
                  onChange={(e) => setMatrixItems(e.target.value)}
                  min="0"
                />
              </div>
            </div>
          </div>

          {/* Advanced options toggle */}
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-1 text-sm text-[#5B50BD] dark:text-[#918AD3] hover:underline"
          >
            {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            {showAdvanced ? 'Hide' : 'Show'} Advanced Options
          </button>

          {/* Advanced inputs */}
          {showAdvanced && (
            <div className="space-y-6 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Open-End (Long)
                  </label>
                  <Input
                    type="number"
                    value={openEndLong}
                    onChange={(e) => setOpenEndLong(e.target.value)}
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">~2 min each</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Ranking Questions
                  </label>
                  <Input
                    type="number"
                    value={ranking}
                    onChange={(e) => setRanking(e.target.value)}
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">~1.5 min each</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    MaxDiff Sets
                  </label>
                  <Input
                    type="number"
                    value={maxDiffSets}
                    onChange={(e) => setMaxDiffSets(e.target.value)}
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">~30 sec each</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Conjoint Tasks
                  </label>
                  <Input
                    type="number"
                    value={conjointTasks}
                    onChange={(e) => setConjointTasks(e.target.value)}
                    min="0"
                  />
                  <p className="mt-1 text-xs text-gray-500">~45 sec each</p>
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Images to Evaluate
                  </label>
                  <Input
                    type="number"
                    value={images}
                    onChange={(e) => setImages(e.target.value)}
                    min="0"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Videos
                  </label>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={videoCount}
                      onChange={(e) => setVideoCount(e.target.value)}
                      min="0"
                      placeholder="Count"
                    />
                    <Input
                      type="number"
                      value={videoDuration}
                      onChange={(e) => setVideoDuration(e.target.value)}
                      min="0"
                      placeholder="Avg sec"
                    />
                  </div>
                </div>
              </div>

              <div className="max-w-xs">
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Intro/Instruction Screens
                </label>
                <Input
                  type="number"
                  value={introScreens}
                  onChange={(e) => setIntroScreens(e.target.value)}
                  min="0"
                />
              </div>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCalculate} className="flex-1">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate LOI
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
              <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/30 dark:to-green-900/30 rounded-xl p-6 border border-green-200 dark:border-green-800">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-sm font-medium text-green-600 dark:text-green-400 mb-1">
                      Estimated Survey Length
                    </h3>
                    <div className="text-4xl font-bold text-gray-900 dark:text-white">
                      {result.estimatedLOI} <span className="text-xl font-normal">minutes</span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                      Range: {result.minLOI}-{result.maxLOI} minutes
                    </p>
                  </div>
                  <QualityCircles rating={getQualityRating(result.estimatedLOI)} />
                </div>

                {/* Cost Tier Indicator */}
                <CostTierIndicator tier={result.costTier} costPerRespondent={result.costPerRespondent} />
              </div>

              {/* Visual progress bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                  <span>Survey Duration</span>
                  <span
                    className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      COST_TIER_COLORS[result.costTier]
                    )}
                  >
                    {COST_TIER_LABELS[result.costTier]}
                  </span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  <div className="bg-green-500" style={{ width: '20%' }} title="1-5 min" />
                  <div className="bg-blue-500" style={{ width: '20%' }} title="6-10 min" />
                  <div className="bg-amber-500" style={{ width: '20%' }} title="11-15 min" />
                  <div className="bg-orange-500" style={{ width: '20%' }} title="16-20 min" />
                  <div className="bg-red-500" style={{ width: '20%' }} title="20+ min" />
                </div>
                <div className="relative h-4">
                  <div
                    className="absolute -translate-x-1/2 text-xs font-semibold"
                    style={{ left: `${Math.min(100, (result.estimatedLOI / 25) * 100)}%` }}
                  >
                    ▲ {result.estimatedLOI}m
                  </div>
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                  <span>Quick</span>
                  <span>Standard</span>
                  <span>Medium</span>
                  <span>Long</span>
                  <span>Premium</span>
                </div>
              </div>

              {/* Summary box */}
              <SummaryBox title="LOI Summary">
                <div className="space-y-1">
                  <div>⏱️ Estimated: {result.estimatedLOI} minutes ({result.minLOI}-{result.maxLOI} range)</div>
                  <div>💰 Cost Tier: {COST_TIER_LABELS[result.costTier]}</div>
                  <div>💵 Cost/Respondent: ${result.costPerRespondent}</div>
                  <div>⚠️ Dropout Risk: {result.dropoutRisk.charAt(0).toUpperCase() + result.dropoutRisk.slice(1)}</div>
                  <div>🏃 Speeding Risk: {result.speedingRisk}%</div>
                  {result.fatiguePoint > 0 && <div>😓 Fatigue Point: {result.fatiguePoint} minutes</div>}
                </div>
              </SummaryBox>

              {/* Risk indicators */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <RiskCard
                  title="Dropout Risk"
                  level={result.dropoutRisk as 'low' | 'medium' | 'high'}
                  description={
                    result.dropoutRisk === 'low'
                      ? 'Low risk of respondents abandoning the survey'
                      : result.dropoutRisk === 'medium'
                      ? 'Some respondents may drop off before completion'
                      : 'High risk - consider shortening the survey'
                  }
                />
                <RiskCard
                  title="Speeding Risk"
                  level={result.speedingRisk > 20 ? 'high' : result.speedingRisk > 10 ? 'medium' : 'low'}
                  description={`${result.speedingRisk}% of respondents may rush through answers`}
                />
              </div>

              {/* Metrics */}
              <MetricGrid columns={4}>
                <MetricDisplay
                  label="Cost/Respondent"
                  value={`$${result.costPerRespondent}`}
                />
                <MetricDisplay
                  label="Fatigue Point"
                  value={result.fatiguePoint > 0 ? `${result.fatiguePoint} min` : 'N/A'}
                />
                <MetricDisplay
                  label="Dropout Risk"
                  value={result.dropoutRisk.charAt(0).toUpperCase() + result.dropoutRisk.slice(1)}
                />
                <MetricDisplay
                  label="Speeding Risk"
                  value={`${result.speedingRisk}%`}
                />
              </MetricGrid>

              {/* AI Insights */}
              {insights.length > 0 && <AIInsightsPanel insights={insights} />}

              {/* Optimization suggestions */}
              {result.optimizationSuggestions.length > 0 && (
                <div className="p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <h4 className="font-medium text-amber-900 dark:text-amber-100 mb-2 flex items-center gap-2">
                    <TrendingDown className="w-4 h-4" />
                    Optimization Suggestions
                  </h4>
                  <ul className="space-y-2">
                    {result.optimizationSuggestions.map((suggestion, i) => (
                      <li
                        key={i}
                        className="text-sm text-amber-800 dark:text-amber-200 flex items-start gap-2"
                      >
                        <span className="text-amber-500">•</span>
                        <span>{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Action buttons */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex flex-wrap gap-2">
                <AddToProposalButton
                  calculatorType="loi"
                  value={result.estimatedLOI}
                  onReset={handleReset}
                />
                <SaveToFavoritesButton calculatorType="loi" inputs={currentInputs} />
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

          {/* Time Breakdown Table */}
          <LOIBreakdownTable breakdown={timeBreakdown} />
        </>
      )}
    </div>
  );
}
