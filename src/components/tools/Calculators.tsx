'use client';

import { useState } from 'react';
import { Calculator, Info, RefreshCw, Percent, BarChart3, Clock } from 'lucide-react';
import { calculateMarginOfError, calculateRequiredSampleSize, cn } from '@/lib/utils';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';

const CONFIDENCE_LEVELS = [
  { value: '90', label: '90%' },
  { value: '95', label: '95%' },
  { value: '99', label: '99%' },
];

export function Calculators() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-3xl p-6">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <Calculator className="h-6 w-6" />
            Calculators
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Tools to help you calculate sample sizes, margins of error, and survey length
          </p>
        </div>

        <Tabs defaultValue="moe">
          <TabsList className="mb-6">
            <TabsTrigger value="moe" className="flex items-center gap-2">
              <Percent className="h-4 w-4" />
              Margin of Error
            </TabsTrigger>
            <TabsTrigger value="maxdiff" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Max Diff
            </TabsTrigger>
            <TabsTrigger value="loi" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              LOI Calculator
            </TabsTrigger>
          </TabsList>

          <TabsContent value="moe">
            <MarginOfErrorTab />
          </TabsContent>

          <TabsContent value="maxdiff">
            <MaxDiffTab />
          </TabsContent>

          <TabsContent value="loi">
            <LOICalculatorTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function MarginOfErrorTab() {
  const [mode, setMode] = useState<'moe' | 'sample'>('moe');
  const [sampleSize, setSampleSize] = useState<string>('1000');
  const [populationSize, setPopulationSize] = useState<string>('');
  const [confidenceLevel, setConfidenceLevel] = useState<string>('95');
  const [marginOfError, setMarginOfError] = useState<string>('5');
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Percent className="h-5 w-5" />
          Margin of Error Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Mode Selector */}
        <div className="mb-6 flex rounded-lg bg-gray-100 dark:bg-gray-800 p-1">
          <button
            onClick={() => {
              setMode('moe');
              setResult(null);
            }}
            className={cn(
              'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
              mode === 'moe' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            Calculate Margin of Error
          </button>
          <button
            onClick={() => {
              setMode('sample');
              setResult(null);
            }}
            className={cn(
              'flex-1 rounded-md py-2 text-sm font-medium transition-colors',
              mode === 'sample' ? 'bg-white dark:bg-gray-700 shadow text-gray-900 dark:text-white' : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            )}
          >
            Calculate Sample Size
          </button>
        </div>

        <div className="space-y-4">
          {/* Sample Size Input (for MOE mode) */}
          {mode === 'moe' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sample Size <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
                placeholder="e.g., 1000"
                min="1"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Number of respondents in your study
              </p>
            </div>
          )}

          {/* Margin of Error Input (for Sample Size mode) */}
          {mode === 'sample' && (
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Desired Margin of Error (%) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={marginOfError}
                onChange={(e) => setMarginOfError(e.target.value)}
                placeholder="e.g., 5"
                min="0.1"
                max="50"
                step="0.1"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Typical ranges: 3-5% for quantitative, 15-20% for qualitative
              </p>
            </div>
          )}

          {/* Confidence Level */}
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

          {/* Population Size (Optional) */}
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Population Size (Optional)
            </label>
            <Input
              type="number"
              value={populationSize}
              onChange={(e) => setPopulationSize(e.target.value)}
              placeholder="Leave blank for infinite population"
              min="1"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Include for finite population correction (FPC)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={calculate} className="flex-1">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate
            </Button>
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {/* Result Display */}
        {result !== null && (
          <div className="mt-6 rounded-lg bg-blue-50 dark:bg-blue-950 p-4 border-2 border-blue-300 dark:border-blue-700">
            <h3 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">Result</h3>
            {mode === 'moe' ? (
              <div>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  ±{result}%
                </p>
                <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
                  With a sample size of {sampleSize} and {confidenceLevel}% confidence level,
                  your margin of error is ±{result}%.
                </p>
              </div>
            ) : (
              <div>
                <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">
                  n = {result.toLocaleString()}
                </p>
                <p className="mt-2 text-sm text-blue-800 dark:text-blue-200">
                  To achieve a ±{marginOfError}% margin of error with {confidenceLevel}% confidence,
                  you need a sample size of {result.toLocaleString()} respondents.
                </p>
              </div>
            )}
          </div>
        )}

        {/* Information Box */}
        <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
          <div className="flex gap-2">
            <Info className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="mb-2 font-medium text-gray-700 dark:text-gray-200">Quick Reference:</p>
              <ul className="space-y-1 text-xs">
                <li>• n=100: ~10% MOE (subgroup minimum)</li>
                <li>• n=400: ~5% MOE (standard tracking)</li>
                <li>• n=1000: ~3% MOE (high precision)</li>
                <li>• Qualitative (n=30): ~18-20% MOE</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MaxDiffTab() {
  const [numAttributes, setNumAttributes] = useState<string>('10');
  const [numShown, setNumShown] = useState<string>('5');
  const [numTasks, setNumTasks] = useState<string>('');
  const [sampleSize, setSampleSize] = useState<string>('300');
  const [result, setResult] = useState<{
    recommendedTasks: number;
    totalComparisons: number;
    reliabilityScore: string;
  } | null>(null);

  const calculate = () => {
    const attributes = parseInt(numAttributes);
    const shown = parseInt(numShown);
    const sample = parseInt(sampleSize);

    if (isNaN(attributes) || isNaN(shown) || isNaN(sample)) return;
    if (shown >= attributes) {
      return;
    }

    // MaxDiff task calculation
    // Recommended tasks = (3 * k) / s where k = attributes, s = shown per task
    const recommendedTasks = Math.ceil((3 * attributes) / shown);

    // Total comparisons per respondent
    const totalComparisons = recommendedTasks * (shown - 1) * 2;

    // Reliability assessment
    let reliabilityScore = 'Low';
    const timesShown = (recommendedTasks * shown) / attributes;
    if (timesShown >= 3 && sample >= 200) {
      reliabilityScore = 'High';
    } else if (timesShown >= 2 && sample >= 100) {
      reliabilityScore = 'Medium';
    }

    setResult({
      recommendedTasks: numTasks ? parseInt(numTasks) : recommendedTasks,
      totalComparisons,
      reliabilityScore,
    });
  };

  const reset = () => {
    setNumAttributes('10');
    setNumShown('5');
    setNumTasks('');
    setSampleSize('300');
    setResult(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Max Diff Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Calculate the optimal number of tasks and sample size for MaxDiff (Best-Worst Scaling) analysis.
        </p>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Number of Attributes <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={numAttributes}
              onChange={(e) => setNumAttributes(e.target.value)}
              placeholder="e.g., 10"
              min="4"
              max="30"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Total items/attributes to evaluate (typically 8-20)
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Items Shown per Task <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              value={numShown}
              onChange={(e) => setNumShown(e.target.value)}
              placeholder="e.g., 5"
              min="3"
              max="7"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Number of items displayed per choice task (typically 4-5)
            </p>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Number of Tasks (Optional)
            </label>
            <Input
              type="number"
              value={numTasks}
              onChange={(e) => setNumTasks(e.target.value)}
              placeholder="Leave blank for recommendation"
              min="1"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Override the recommended number of tasks
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
              Minimum 200 for reliable individual-level estimates
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={calculate} className="flex-1">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate
            </Button>
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {result && (
          <div className="mt-6 rounded-lg bg-[#EDE9F9] dark:bg-[#231E51] p-4 border-2 border-[#C8C4E9] dark:border-[#5B50BD]">
            <h3 className="mb-3 font-semibold text-[#5B50BD] dark:text-[#918AD3]">MaxDiff Design</h3>
            <div className="grid grid-cols-3 gap-4">
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
                <p className={cn(
                  'text-2xl font-bold',
                  result.reliabilityScore === 'High' ? 'text-green-600' :
                  result.reliabilityScore === 'Medium' ? 'text-amber-600' : 'text-red-600'
                )}>
                  {result.reliabilityScore}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">Reliability</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-gray-600 dark:text-gray-400">
              Each attribute will be shown ~{Math.round((result.recommendedTasks * parseInt(numShown)) / parseInt(numAttributes))} times per respondent.
            </p>
          </div>
        )}

        <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
          <div className="flex gap-2">
            <Info className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="mb-2 font-medium text-gray-700 dark:text-gray-200">Guidelines:</p>
              <ul className="space-y-1 text-xs">
                <li>• Aim for each item to be shown 3+ times per respondent</li>
                <li>• 4-5 items per task is optimal for cognitive load</li>
                <li>• n=200+ for individual-level utility estimation</li>
                <li>• n=300+ recommended for subgroup analysis</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function LOICalculatorTab() {
  const [numQuestions, setNumQuestions] = useState<string>('25');
  const [avgOptionsPerQuestion, setAvgOptionsPerQuestion] = useState<string>('5');
  const [numOpenEnds, setNumOpenEnds] = useState<string>('2');
  const [numGridQuestions, setNumGridQuestions] = useState<string>('3');
  const [gridRows, setGridRows] = useState<string>('8');
  const [result, setResult] = useState<{
    estimatedLOI: number;
    minLOI: number;
    maxLOI: number;
    costTier: string;
  } | null>(null);

  const calculate = () => {
    const questions = parseInt(numQuestions) || 0;
    const avgOptions = parseInt(avgOptionsPerQuestion) || 5;
    const openEnds = parseInt(numOpenEnds) || 0;
    const grids = parseInt(numGridQuestions) || 0;
    const rows = parseInt(gridRows) || 5;

    // LOI estimation formula (in seconds)
    // Single choice: ~8 seconds base + 1.5 per option
    // Grid question: ~5 seconds per row
    // Open-end: ~45-60 seconds each

    const singleChoiceTime = (questions - grids - openEnds) * (8 + avgOptions * 1.5);
    const gridTime = grids * rows * 5;
    const openEndTime = openEnds * 52.5; // average of 45-60

    const totalSeconds = singleChoiceTime + gridTime + openEndTime + 30; // 30s for intro/outro
    const estimatedMinutes = Math.round(totalSeconds / 60);

    // Cost tier based on LOI
    let costTier = 'Standard';
    if (estimatedMinutes <= 5) costTier = 'Low';
    else if (estimatedMinutes <= 10) costTier = 'Standard';
    else if (estimatedMinutes <= 15) costTier = 'Medium';
    else if (estimatedMinutes <= 20) costTier = 'High';
    else costTier = 'Premium';

    setResult({
      estimatedLOI: estimatedMinutes,
      minLOI: Math.max(1, Math.round(estimatedMinutes * 0.8)),
      maxLOI: Math.round(estimatedMinutes * 1.3),
      costTier,
    });
  };

  const reset = () => {
    setNumQuestions('25');
    setAvgOptionsPerQuestion('5');
    setNumOpenEnds('2');
    setNumGridQuestions('3');
    setGridRows('8');
    setResult(null);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          LOI (Length of Interview) Calculator
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
          Estimate survey length based on question types and complexity. Accurate LOI estimation helps with pricing and respondent experience.
        </p>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Questions <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={numQuestions}
                onChange={(e) => setNumQuestions(e.target.value)}
                placeholder="e.g., 25"
                min="1"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Avg Options per Question
              </label>
              <Input
                type="number"
                value={avgOptionsPerQuestion}
                onChange={(e) => setAvgOptionsPerQuestion(e.target.value)}
                placeholder="e.g., 5"
                min="2"
                max="20"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Open-End Questions
              </label>
              <Input
                type="number"
                value={numOpenEnds}
                onChange={(e) => setNumOpenEnds(e.target.value)}
                placeholder="e.g., 2"
                min="0"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                ~1 min each
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Grid/Matrix Questions
              </label>
              <Input
                type="number"
                value={numGridQuestions}
                onChange={(e) => setNumGridQuestions(e.target.value)}
                placeholder="e.g., 3"
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Avg Rows per Grid
            </label>
            <Input
              type="number"
              value={gridRows}
              onChange={(e) => setGridRows(e.target.value)}
              placeholder="e.g., 8"
              min="1"
              max="20"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              ~5 seconds per row
            </p>
          </div>

          <div className="flex gap-2 pt-2">
            <Button onClick={calculate} className="flex-1">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate LOI
            </Button>
            <Button variant="outline" onClick={reset}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>

        {result && (
          <div className="mt-6 rounded-lg bg-green-50 dark:bg-green-950 p-4 border-2 border-green-300 dark:border-green-700">
            <h3 className="mb-3 font-semibold text-green-900 dark:text-green-100">Estimated Survey Length</h3>
            <div className="flex items-center justify-center gap-2 mb-3">
              <p className="text-4xl font-bold text-green-700 dark:text-green-300">
                {result.estimatedLOI}
              </p>
              <p className="text-xl text-green-700 dark:text-green-300">minutes</p>
            </div>
            <div className="text-center text-sm text-green-800 dark:text-green-200 mb-3">
              Range: {result.minLOI} - {result.maxLOI} minutes
            </div>
            <div className={cn(
              'text-center py-2 px-4 rounded-lg font-medium',
              result.costTier === 'Low' ? 'bg-green-200 text-green-800' :
              result.costTier === 'Standard' ? 'bg-blue-200 text-blue-800' :
              result.costTier === 'Medium' ? 'bg-amber-200 text-amber-800' :
              result.costTier === 'High' ? 'bg-orange-200 text-orange-800' :
              'bg-red-200 text-red-800'
            )}>
              Cost Tier: {result.costTier}
            </div>
          </div>
        )}

        <div className="mt-6 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
          <div className="flex gap-2">
            <Info className="h-5 w-5 flex-shrink-0 text-gray-400 dark:text-gray-500" />
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p className="mb-2 font-medium text-gray-700 dark:text-gray-200">LOI & Pricing Tiers:</p>
              <ul className="space-y-1 text-xs">
                <li>• 1-5 min: Low cost - Quick surveys</li>
                <li>• 6-10 min: Standard - Most common</li>
                <li>• 11-15 min: Medium - Detailed studies</li>
                <li>• 16-20 min: High - Comprehensive research</li>
                <li>• 20+ min: Premium - In-depth interviews</li>
              </ul>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
