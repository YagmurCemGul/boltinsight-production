'use client';

import { useState } from 'react';
import { Calculator, RefreshCw, Download } from 'lucide-react';
import { calculateMarginOfError, calculateRequiredSampleSize, cn } from '@/lib/utils';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent, AIBadge } from '@/components/ui';

const CONFIDENCE_LEVELS = [
  { value: '90', label: '90%' },
  { value: '95', label: '95%' },
  { value: '99', label: '99%' },
];

export function MarginOfErrorCalculator() {
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
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-2xl p-6">
        <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
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
              <AIBadge
                isActive={false}
                showTooltip={true}
                tooltipText="AI-powered quick reference guide for sample size calculations"
                size="sm"
              />
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
      </div>
    </div>
  );
}
