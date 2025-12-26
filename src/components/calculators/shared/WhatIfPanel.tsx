'use client';

import { useState, useCallback, useEffect } from 'react';
import { TrendingUp, TrendingDown, Minus, RefreshCw, ArrowRight, Lightbulb } from 'lucide-react';
import { Button } from '@/components/ui';
import { cn } from '@/lib/utils';

interface WhatIfScenario {
  label: string;
  field: string;
  currentValue: number;
  newValue: number;
  result: number;
  resultLabel: string;
  unit?: string;
  impact?: 'positive' | 'negative' | 'neutral';
  savingsOrCost?: number;
}

interface WhatIfPanelProps {
  title?: string;
  scenarios: WhatIfScenario[];
  onApplyScenario?: (scenario: WhatIfScenario) => void;
  currentResult: number;
  currentResultLabel: string;
}

export function WhatIfPanel({
  title = 'What-If Analysis',
  scenarios,
  onApplyScenario,
  currentResult,
  currentResultLabel,
}: WhatIfPanelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <Lightbulb className="w-4 h-4 text-[#5B50BD]" />
          <h3 className="font-semibold text-gray-900 dark:text-white">{title}</h3>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          See how different parameters affect your results
        </p>
      </div>

      {/* Current state */}
      <div className="px-4 py-3 bg-[#EDE9F9] dark:bg-[#231E51] border-b border-[#5B50BD]/20">
        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current</div>
        <div className="text-lg font-bold text-gray-900 dark:text-white">
          {currentResult.toLocaleString()} <span className="text-sm font-normal text-gray-500">{currentResultLabel}</span>
        </div>
      </div>

      {/* Scenarios */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {scenarios.map((scenario, index) => (
          <WhatIfRow
            key={index}
            scenario={scenario}
            onApply={onApplyScenario}
          />
        ))}
      </div>
    </div>
  );
}

interface WhatIfRowProps {
  scenario: WhatIfScenario;
  onApply?: (scenario: WhatIfScenario) => void;
}

function WhatIfRow({ scenario, onApply }: WhatIfRowProps) {
  const difference = scenario.result - scenario.currentValue;
  const percentChange = scenario.currentValue > 0
    ? Math.round((difference / scenario.currentValue) * 100)
    : 0;

  const getTrendIcon = () => {
    if (scenario.impact === 'positive') return <TrendingUp className="w-4 h-4 text-green-500" />;
    if (scenario.impact === 'negative') return <TrendingDown className="w-4 h-4 text-red-500" />;
    return <Minus className="w-4 h-4 text-gray-400" />;
  };

  return (
    <div className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
            {scenario.label}
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span>{scenario.currentValue}{scenario.unit}</span>
            <ArrowRight className="w-3 h-3" />
            <span className="font-medium text-gray-700 dark:text-gray-300">
              {scenario.newValue}{scenario.unit}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="flex items-center gap-1 justify-end">
              {getTrendIcon()}
              <span className={cn(
                'font-semibold',
                scenario.impact === 'positive' && 'text-green-600',
                scenario.impact === 'negative' && 'text-red-600',
                scenario.impact === 'neutral' && 'text-gray-600 dark:text-gray-400',
              )}>
                {scenario.result.toLocaleString()}
              </span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {scenario.resultLabel}
            </div>
            {scenario.savingsOrCost && (
              <div className={cn(
                'text-xs font-medium',
                scenario.savingsOrCost > 0 ? 'text-red-500' : 'text-green-500'
              )}>
                {scenario.savingsOrCost > 0 ? '+' : ''}{scenario.savingsOrCost < 0 ? 'Save ' : ''}
                ${Math.abs(scenario.savingsOrCost).toLocaleString()}
              </div>
            )}
          </div>

          {onApply && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => onApply(scenario)}
              className="text-xs"
            >
              Apply
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Slider-based what-if control
interface WhatIfSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (value: number) => void;
  result?: number;
  resultLabel?: string;
}

export function WhatIfSlider({
  label,
  value,
  min,
  max,
  step = 1,
  unit = '',
  onChange,
  result,
  resultLabel,
}: WhatIfSliderProps) {
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue);
    onChange(newValue);
  }, [onChange]);

  const percentage = ((localValue - min) / (max - min)) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>
        <span className="text-sm font-mono bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">
          {localValue}{unit}
        </span>
      </div>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={localValue}
          onChange={handleChange}
          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          style={{
            background: `linear-gradient(to right, #5B50BD ${percentage}%, #e5e7eb ${percentage}%)`,
          }}
        />
        <div className="flex justify-between text-xs text-gray-400 mt-1">
          <span>{min}{unit}</span>
          <span>{max}{unit}</span>
        </div>
      </div>
      {result !== undefined && resultLabel && (
        <div className="text-right text-sm">
          <span className="text-gray-500 dark:text-gray-400">{resultLabel}: </span>
          <span className="font-semibold text-gray-900 dark:text-white">{result.toLocaleString()}</span>
        </div>
      )}
    </div>
  );
}

// Quick adjustment buttons
interface QuickAdjustProps {
  label: string;
  currentValue: number;
  adjustments: Array<{ label: string; value: number }>;
  onSelect: (value: number) => void;
  unit?: string;
}

export function QuickAdjust({ label, currentValue, adjustments, onSelect, unit = '' }: QuickAdjustProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</span>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          Current: {currentValue}{unit}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {adjustments.map((adj, index) => (
          <button
            key={index}
            onClick={() => onSelect(adj.value)}
            className={cn(
              'px-3 py-1.5 text-sm rounded-lg border transition-colors',
              adj.value === currentValue
                ? 'bg-[#5B50BD] text-white border-[#5B50BD]'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700 hover:border-[#5B50BD]'
            )}
          >
            {adj.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// Sample size what-if scenarios generator
export function generateSampleSizeWhatIf(
  currentSample: number,
  currentMOE: number,
  costPerRespondent: number = 20
): WhatIfScenario[] {
  const scenarios: WhatIfScenario[] = [];

  // Scenario: Reduce to minimum
  const minSample = Math.ceil(currentSample * 0.7);
  scenarios.push({
    label: 'Reduce to minimum acceptable',
    field: 'sampleSize',
    currentValue: currentSample,
    newValue: minSample,
    result: minSample,
    resultLabel: 'respondents',
    impact: 'neutral',
    savingsOrCost: -(currentSample - minSample) * costPerRespondent,
  });

  // Scenario: Increase for subgroups
  const subgroupSample = Math.ceil(currentSample * 1.5);
  scenarios.push({
    label: 'Increase for subgroup analysis',
    field: 'sampleSize',
    currentValue: currentSample,
    newValue: subgroupSample,
    result: subgroupSample,
    resultLabel: 'respondents',
    impact: 'positive',
    savingsOrCost: (subgroupSample - currentSample) * costPerRespondent,
  });

  // Scenario: Double for precision
  const doubleSample = currentSample * 2;
  scenarios.push({
    label: 'Double for higher precision',
    field: 'sampleSize',
    currentValue: currentSample,
    newValue: doubleSample,
    result: doubleSample,
    resultLabel: 'respondents',
    impact: 'positive',
    savingsOrCost: (doubleSample - currentSample) * costPerRespondent,
  });

  return scenarios;
}

// MOE what-if scenarios generator
export function generateMOEWhatIf(currentMOE: number, currentSample: number): WhatIfScenario[] {
  const calculateSampleForMOE = (moe: number) => Math.ceil((1.96 * 1.96 * 0.5 * 0.5) / (moe / 100) ** 2);

  return [
    {
      label: 'Achieve ±3% MOE',
      field: 'moe',
      currentValue: currentMOE,
      newValue: 3,
      result: calculateSampleForMOE(3),
      resultLabel: 'Need',
      unit: '%',
      impact: currentMOE > 3 ? 'positive' : 'negative',
    },
    {
      label: 'Achieve ±4% MOE',
      field: 'moe',
      currentValue: currentMOE,
      newValue: 4,
      result: calculateSampleForMOE(4),
      resultLabel: 'Need',
      unit: '%',
      impact: currentMOE > 4 ? 'positive' : 'neutral',
    },
    {
      label: 'Achieve ±5% MOE',
      field: 'moe',
      currentValue: currentMOE,
      newValue: 5,
      result: calculateSampleForMOE(5),
      resultLabel: 'Need',
      unit: '%',
      impact: currentMOE > 5 ? 'positive' : 'negative',
    },
  ];
}
