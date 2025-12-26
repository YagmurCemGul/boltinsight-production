'use client';

import { useState, useCallback, useMemo } from 'react';
import { Calculator, RefreshCw, ClipboardCheck, CheckCircle, AlertTriangle, XCircle, ArrowRight, TrendingUp, TrendingDown, Shield, Clock, DollarSign, Users, Globe, Target, Zap } from 'lucide-react';
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
  AddToCompareButton,
  SaveToFavoritesButton,
} from '../shared';
import { calculateFeasibility } from '@/lib/calculators/calculations';
import { generateFeasibilityInsights } from '@/lib/calculators/ai-insights';
import { useCalculatorStore, generateCalculatorId } from '@/lib/calculators/store';
import type { FeasibilityInputs, FeasibilityOutputs, FeasibilityResult, ProposalContext, AIInsight, Methodology, FeasibilityVerdict, MentionEntity, CalculatorAutoFill } from '@/types/calculator';
import { cn } from '@/lib/utils';

const METHODOLOGY_OPTIONS = [
  { value: 'online', label: 'Online (CAWI)' },
  { value: 'cati', label: 'CATI (Phone)' },
  { value: 'f2f', label: 'Face-to-Face' },
  { value: 'clt', label: 'CLT (Central Location)' },
  { value: 'mixed', label: 'Mixed Mode' },
];

const VERDICT_CONFIG: Record<FeasibilityVerdict, { icon: typeof CheckCircle; color: string; bg: string; label: string; emoji: string }> = {
  green: {
    icon: CheckCircle,
    color: 'text-green-600',
    bg: 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800',
    label: 'Feasible',
    emoji: '✅',
  },
  yellow: {
    icon: AlertTriangle,
    color: 'text-amber-600',
    bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
    label: 'Feasible with Adjustments',
    emoji: '⚠️',
  },
  red: {
    icon: XCircle,
    color: 'text-red-600',
    bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
    label: 'High Risk',
    emoji: '🔴',
  },
};

// Dimension icons
const DIMENSION_ICONS: Record<string, typeof Shield> = {
  sample: Users,
  timeline: Clock,
  budget: DollarSign,
  methodology: Target,
  geography: Globe,
};

// Quick Insight Banner for flow mode
function QuickInsightBanner({ message, type = 'info' }: { message: string; type?: 'info' | 'success' | 'warning' }) {
  const colors = {
    info: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 text-blue-800 dark:text-blue-300',
    success: 'bg-green-50 dark:bg-green-950/30 border-green-200 text-green-800 dark:text-green-300',
    warning: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 text-amber-800 dark:text-amber-300',
  };

  return (
    <div className={cn('px-4 py-2 rounded-lg border text-sm', colors[type])}>
      <Zap className="w-4 h-4 inline mr-2" />
      {message}
    </div>
  );
}

// Dimension Score Card component
interface DimensionScoreCardProps {
  dimension: string;
  score: number;
  notes: string;
}

function DimensionScoreCard({ dimension, score, notes }: DimensionScoreCardProps) {
  const Icon = DIMENSION_ICONS[dimension] || Shield;
  const rating = score >= 70 ? 'excellent' : score >= 55 ? 'good' : score >= 40 ? 'acceptable' : 'poor';
  const colorClass = score >= 70 ? 'text-green-600' : score >= 40 ? 'text-amber-600' : 'text-red-600';
  const bgClass = score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-amber-500' : 'bg-red-500';

  return (
    <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn('p-2 rounded-lg', score >= 70 ? 'bg-green-100 dark:bg-green-950/50' : score >= 40 ? 'bg-amber-100 dark:bg-amber-950/50' : 'bg-red-100 dark:bg-red-950/50')}>
          <Icon className={cn('w-5 h-5', colorClass)} />
        </div>
        <div className="flex-1">
          <h4 className="font-semibold text-gray-900 dark:text-white capitalize">{dimension}</h4>
          <div className="flex items-center gap-2">
            <span className={cn('text-lg font-bold', colorClass)}>{score}/100</span>
            <QualityCircles rating={rating} showLabel={false} />
          </div>
        </div>
      </div>
      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-2">
        <div
          className={cn('h-full rounded-full transition-all', bgClass)}
          style={{ width: `${score}%` }}
        />
      </div>
      <p className="text-xs text-gray-500 dark:text-gray-400">{notes}</p>
    </div>
  );
}

// Risk Card component
interface RiskCardProps {
  level: 'high' | 'medium' | 'low';
  description: string;
  mitigation: string;
}

function RiskCard({ level, description, mitigation }: RiskCardProps) {
  const config = {
    high: {
      bg: 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800',
      badge: 'bg-red-200 text-red-800',
      icon: XCircle,
      iconColor: 'text-red-500',
    },
    medium: {
      bg: 'bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800',
      badge: 'bg-amber-200 text-amber-800',
      icon: AlertTriangle,
      iconColor: 'text-amber-500',
    },
    low: {
      bg: 'bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800',
      badge: 'bg-blue-200 text-blue-800',
      icon: Shield,
      iconColor: 'text-blue-500',
    },
  };

  const { bg, badge, icon: Icon, iconColor } = config[level];

  return (
    <div className={cn('p-4 rounded-lg border', bg)}>
      <div className="flex items-start gap-3">
        <Icon className={cn('w-5 h-5 mt-0.5', iconColor)} />
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={cn('text-xs font-medium px-2 py-0.5 rounded uppercase', badge)}>
              {level}
            </span>
          </div>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
            {description}
          </p>
          <div className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
            <Zap className="w-3 h-3 mt-0.5 text-[#5B50BD]" />
            <span><span className="font-medium">Mitigation:</span> {mitigation}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeasibilityCheck() {
  const {
    addResult,
    setProposalContext,
    activeFlow,
    completeFlowStep,
    nextFlowStep,
    addToComparison,
    removeFromComparison,
    isInComparison,
  } = useCalculatorStore();

  // Form state
  const [methodology, setMethodology] = useState<string>('online');
  const [sampleSize, setSampleSize] = useState<string>('500');
  const [countries, setCountries] = useState<string>('Turkey');
  const [timeline, setTimeline] = useState<string>('14');
  const [targetAudience, setTargetAudience] = useState<string>('Adults 18-65');
  const [incidenceRate, setIncidenceRate] = useState<string>('30');
  const [loi, setLoi] = useState<string>('12');

  // Result state
  const [result, setResult] = useState<FeasibilityOutputs | null>(null);
  const [insights, setInsights] = useState<AIInsight[]>([]);
  const [lastResult, setLastResult] = useState<FeasibilityResult | null>(null);

  // Get current inputs object for favorites
  const currentInputs = useMemo(
    () => ({
      methodology,
      sampleSize: parseInt(sampleSize),
      countries: countries.split(',').map(c => c.trim()).filter(Boolean),
      timeline: parseInt(timeline),
      targetAudience,
      incidenceRate: parseInt(incidenceRate),
      loi: parseInt(loi),
    }),
    [methodology, sampleSize, countries, timeline, targetAudience, incidenceRate, loi]
  );

  // Handle entity selection from @mention
  const handleEntitySelect = useCallback((entity: MentionEntity, autoFill: CalculatorAutoFill) => {
    // Use autoFill for all values
    if (autoFill.sampleSize) {
      setSampleSize(autoFill.sampleSize.toString());
    }
    if (autoFill.methodology) {
      const match = METHODOLOGY_OPTIONS.find(m =>
        m.label.toLowerCase().includes(autoFill.methodology!.toLowerCase())
      );
      if (match) {
        setMethodology(match.value);
      }
    }
    if (autoFill.countries && autoFill.countries.length > 0) {
      setCountries(autoFill.countries.join(', '));
    }
    if (autoFill.loi) {
      setLoi(autoFill.loi.toString());
    }
  }, []);

  // Calculate
  const handleCalculate = useCallback(() => {
    const countryList = countries.split(',').map(c => c.trim()).filter(Boolean);

    const inputs: FeasibilityInputs = {
      methodology: methodology as Methodology,
      sampleSize: parseInt(sampleSize),
      countries: countryList,
      timeline: parseInt(timeline),
      targetAudience,
      incidenceRate: parseInt(incidenceRate),
      loi: parseInt(loi),
    };

    const outputs = calculateFeasibility(inputs);
    const aiInsights = generateFeasibilityInsights(inputs, outputs);

    setResult(outputs);
    setInsights(aiInsights);

    // Save to history
    const calculatorResult: FeasibilityResult = {
      id: generateCalculatorId(),
      type: 'feasibility',
      inputs,
      outputs,
      aiInsights,
      timestamp: new Date(),
    };
    addResult(calculatorResult);
    setLastResult(calculatorResult);

    // If in flow mode, complete this step
    if (activeFlow) {
      completeFlowStep(calculatorResult);
    }
  }, [methodology, sampleSize, countries, timeline, targetAudience, incidenceRate, loi, addResult, activeFlow, completeFlowStep]);

  // Reset
  const handleReset = useCallback(() => {
    setMethodology('online');
    setSampleSize('500');
    setCountries('Turkey');
    setTimeline('14');
    setTargetAudience('Adults 18-65');
    setIncidenceRate('30');
    setLoi('12');
    setResult(null);
    setInsights([]);
    setLastResult(null);
    setProposalContext(null);
  }, [setProposalContext]);

  // Generate summary for SummaryBox
  const summaryItems = useMemo(() => {
    if (!result) return [];
    return [
      { label: 'Verdict', value: VERDICT_CONFIG[result.verdict].label, emoji: VERDICT_CONFIG[result.verdict].emoji },
      { label: 'Overall Score', value: `${result.overallScore}/100` },
      { label: 'Est. Cost', value: `$${result.estimatedCost.toLocaleString()}` },
      { label: 'Est. Days', value: `${result.estimatedDays} days` },
      { label: 'Risks', value: `${result.risks.length} identified` },
    ];
  }, [result]);

  // Quality rating based on overall score
  const overallRating: 'excellent' | 'good' | 'acceptable' | 'poor' = result
    ? (result.overallScore >= 80 ? 'excellent' : result.overallScore >= 60 ? 'good' : result.overallScore >= 40 ? 'acceptable' : 'poor')
    : 'poor';

  return (
    <div className="space-y-6">
      {/* Flow Mode Banner */}
      {activeFlow && (
        <QuickInsightBanner
          message={`Flow Mode: Completing feasibility assessment (Step ${activeFlow.currentStepIndex + 1})`}
          type="info"
        />
      )}

      {/* Entity Reference */}
      <Card>
        <CardContent className="p-4">
          <EntityMention
            calculatorType="feasibility"
            onSelect={handleEntitySelect}
            onClear={() => setProposalContext(null)}
            placeholder="Type @ to reference a proposal, client, or project..."
            entityTypes={['proposal', 'client', 'project']}
          />
        </CardContent>
      </Card>

      {/* Calculator Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5 text-amber-600" />
            Feasibility Check
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Assess project feasibility based on methodology, sample, timeline, and constraints.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Methodology <span className="text-red-500">*</span>
              </label>
              <Select
                options={METHODOLOGY_OPTIONS}
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Sample Size (per market) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
                placeholder="e.g., 500"
                min="1"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Countries/Markets <span className="text-red-500">*</span>
              </label>
              <Input
                type="text"
                value={countries}
                onChange={(e) => setCountries(e.target.value)}
                placeholder="e.g., Turkey, UK, Germany"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Separate multiple countries with commas
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Timeline (days) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={timeline}
                onChange={(e) => setTimeline(e.target.value)}
                placeholder="e.g., 14"
                min="1"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Incidence Rate (%) <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={incidenceRate}
                onChange={(e) => setIncidenceRate(e.target.value)}
                placeholder="e.g., 30"
                min="1"
                max="100"
              />
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                % of population qualifying for study
              </p>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                LOI (minutes)
              </label>
              <Input
                type="number"
                value={loi}
                onChange={(e) => setLoi(e.target.value)}
                placeholder="e.g., 12"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
              Target Audience
            </label>
            <Input
              type="text"
              value={targetAudience}
              onChange={(e) => setTargetAudience(e.target.value)}
              placeholder="e.g., Adults 18-65, Urban, ABC1"
            />
          </div>

          {/* Action buttons */}
          <div className="flex gap-2 pt-2">
            <Button onClick={handleCalculate} className="flex-1">
              <Calculator className="mr-2 h-4 w-4" />
              Check Feasibility
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
            {/* Summary Box */}
            <SummaryBox
              title="Feasibility Assessment"
              variant={result.verdict === 'green' ? 'success' : result.verdict === 'yellow' ? 'warning' : 'error'}
            >
              <div className="p-4 space-y-2 font-mono text-sm">
                {summaryItems.map((item, i) => (
                  <p key={i}>
                    {item.emoji && `${item.emoji} `}{item.label}: {item.value}
                  </p>
                ))}
              </div>
            </SummaryBox>

            {/* Overall verdict with visual score */}
            {(() => {
              const config = VERDICT_CONFIG[result.verdict];
              const Icon = config.icon;
              return (
                <div className={cn('p-6 rounded-xl border-2', config.bg)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-white dark:bg-gray-800 rounded-full shadow-sm">
                        <Icon className={cn('w-10 h-10', config.color)} />
                      </div>
                      <div>
                        <h3 className={cn('text-2xl font-bold', config.color)}>
                          {config.emoji} {config.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          Overall feasibility assessment
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className={cn('text-4xl font-bold', config.color)}>
                        {result.overallScore}
                      </div>
                      <div className="text-sm text-gray-500">out of 100</div>
                      <div className="mt-2">
                        <QualityCircles rating={overallRating} />
                      </div>
                    </div>
                  </div>
                  <div className="mt-4">
                    <ProgressBar
                      value={result.overallScore}
                      max={100}
                      colorScheme="feasibility"
                      size="lg"
                    />
                  </div>
                </div>
              );
            })()}

            {/* Dimension scores as cards */}
            <div className="space-y-4">
              <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                <Target className="w-5 h-5 text-[#5B50BD]" />
                Assessment by Dimension
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {result.dimensions.map((dim) => (
                  <DimensionScoreCard
                    key={dim.dimension}
                    dimension={dim.dimension}
                    score={dim.score}
                    notes={dim.notes}
                  />
                ))}
              </div>
            </div>

            {/* Key metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <DollarSign className="w-6 h-6 mx-auto mb-2 text-green-600" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${result.estimatedCost.toLocaleString()}
                </div>
                <div className="text-xs text-gray-500">Estimated Cost</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <Clock className="w-6 h-6 mx-auto mb-2 text-blue-600" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.estimatedDays}
                </div>
                <div className="text-xs text-gray-500">Days to Complete</div>
                {result.estimatedDays > parseInt(timeline) && (
                  <div className="text-xs text-red-500 mt-1 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" />
                    Exceeds timeline
                  </div>
                )}
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <Users className="w-6 h-6 mx-auto mb-2 text-purple-600" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {countries.split(',').length}
                </div>
                <div className="text-xs text-gray-500">Markets</div>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-800/50 rounded-lg text-center">
                <AlertTriangle className="w-6 h-6 mx-auto mb-2 text-amber-600" />
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {result.risks.length}
                </div>
                <div className="text-xs text-gray-500">Risks Identified</div>
              </div>
            </div>

            {/* Risks */}
            {result.risks.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-red-500" />
                  Identified Risks & Mitigations
                </h4>
                <div className="space-y-3">
                  {result.risks.map((risk, i) => (
                    <RiskCard
                      key={i}
                      level={risk.level}
                      description={risk.description}
                      mitigation={risk.mitigation}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="p-4 bg-[#EDE9F9] dark:bg-[#231E51] rounded-lg">
                <h4 className="font-semibold text-[#5B50BD] dark:text-[#918AD3] mb-3 flex items-center gap-2">
                  <Zap className="w-5 h-5" />
                  Recommendations
                </h4>
                <ul className="space-y-2">
                  {result.recommendations.map((rec, i) => (
                    <li key={i} className="text-sm text-gray-700 dark:text-gray-300 flex items-start gap-2">
                      <CheckCircle className="w-4 h-4 text-[#5B50BD] mt-0.5 flex-shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* AI Insights */}
            {insights.length > 0 && (
              <AIInsightsPanel insights={insights} />
            )}

            {/* Action buttons */}
            <div className="pt-4 border-t border-gray-200 dark:border-gray-700 space-y-4">
              <div className="flex flex-wrap gap-2">
                <AddToProposalButton
                  calculatorType="feasibility"
                  value={`Feasibility: ${VERDICT_CONFIG[result.verdict].label} (${result.overallScore}/100)`}
                  onReset={handleReset}
                />
                {lastResult && (
                  <>
                    <AddToCompareButton
                      result={lastResult}
                      isInComparison={isInComparison(lastResult.id)}
                      onAdd={() => addToComparison(lastResult)}
                      onRemove={() => removeFromComparison(lastResult.id)}
                    />
                    <SaveToFavoritesButton calculatorType="feasibility" inputs={currentInputs} />
                  </>
                )}
              </div>

              {/* Flow mode navigation */}
              {activeFlow && (
                <div className="flex justify-end">
                  <Button onClick={nextFlowStep} className="bg-[#5B50BD] hover:bg-[#4A3FA8]">
                    Continue to Next Step
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
