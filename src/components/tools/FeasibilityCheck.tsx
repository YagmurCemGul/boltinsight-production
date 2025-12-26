'use client';

import { useState } from 'react';
import { ClipboardCheck, Loader2, AlertCircle, CheckCircle, Clock, DollarSign } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Input, Select, Textarea, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui';

const METHODOLOGY_OPTIONS = [
  { value: 'online_survey', label: 'Online Survey (CAWI)' },
  { value: 'cati', label: 'Telephone (CATI)' },
  { value: 'f2f', label: 'Face-to-Face (CAPI)' },
  { value: 'mobile', label: 'Mobile Survey' },
  { value: 'qual_idi', label: 'Qualitative - IDIs' },
  { value: 'qual_focus', label: 'Qualitative - Focus Groups' },
];

const MARKET_OPTIONS = [
  { value: 'USA', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
  { value: 'Japan', label: 'Japan' },
  { value: 'Brazil', label: 'Brazil' },
  { value: 'India', label: 'India' },
  { value: 'China', label: 'China' },
];

interface FeasibilityResult {
  feasible: boolean;
  incidenceRate: number;
  estimatedTimeline: string;
  estimatedCost: number;
  confidence: 'high' | 'medium' | 'low';
  risks: string[];
  recommendations: string[];
}

const AGE_RANGES = [
  { value: '18-24', label: '18-24' },
  { value: '25-34', label: '25-34' },
  { value: '35-44', label: '35-44' },
  { value: '45-54', label: '45-54' },
  { value: '55-64', label: '55-64' },
  { value: '65+', label: '65+' },
];

const AUDIENCE_TYPES = [
  { value: 'general_population', label: 'General Population' },
  { value: 'category_users', label: 'Category Users' },
  { value: 'brand_users', label: 'Brand Users' },
  { value: 'lapsed_users', label: 'Lapsed Users' },
  { value: 'non_users', label: 'Non-Users' },
  { value: 'b2b', label: 'B2B / Decision Makers' },
];

const GENDER_OPTIONS = [
  { value: 'all', label: 'All Genders' },
  { value: 'male', label: 'Male Only' },
  { value: 'female', label: 'Female Only' },
];

export function FeasibilityCheck() {
  const [market, setMarket] = useState('');
  const [methodology, setMethodology] = useState('');
  const [sampleSize, setSampleSize] = useState('');
  const [targetAudience, setTargetAudience] = useState('');
  const [audienceType, setAudienceType] = useState('');
  const [gender, setGender] = useState('all');
  const [selectedAges, setSelectedAges] = useState<string[]>([]);
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<FeasibilityResult | null>(null);

  const toggleAge = (age: string) => {
    setSelectedAges(prev =>
      prev.includes(age) ? prev.filter(a => a !== age) : [...prev, age]
    );
  };

  const checkFeasibility = () => {
    if (!market || !methodology || !sampleSize || !audienceType) return;

    setIsChecking(true);

    // Simulate API call
    setTimeout(() => {
      // Generate mock result based on inputs
      const sample = parseInt(sampleSize);
      const isB2B = audienceType === 'b2b';
      const isNiche = audienceType === 'lapsed_users' || audienceType === 'non_users' || selectedAges.length === 1;

      let incidenceRate = 50;
      if (isB2B) incidenceRate = 15;
      if (isNiche) incidenceRate = 5;

      const daysPerHundred = methodology.includes('qual') ? 14 :
                            methodology === 'f2f' ? 7 :
                            methodology === 'cati' ? 5 : 2;
      const estimatedDays = Math.ceil((sample / 100) * daysPerHundred * (50 / incidenceRate));

      const baseCostPerComplete = methodology.includes('qual') ? 150 :
                                   methodology === 'f2f' ? 25 :
                                   methodology === 'cati' ? 15 : 5;
      const estimatedCost = Math.round(sample * baseCostPerComplete * (50 / incidenceRate));

      const feasible = incidenceRate > 3 && estimatedDays < 60;
      const confidence = incidenceRate > 30 ? 'high' : incidenceRate > 10 ? 'medium' : 'low';

      const risks: string[] = [];
      const recommendations: string[] = [];

      if (incidenceRate < 10) {
        risks.push('Low incidence rate may extend fieldwork timeline');
        recommendations.push('Consider broadening target definition');
      }
      if (sample > 1000 && methodology === 'f2f') {
        risks.push('Large F2F sample may require multiple field agencies');
        recommendations.push('Consider phased fieldwork approach');
      }
      if (isB2B) {
        risks.push('B2B audiences typically harder to reach');
        recommendations.push('Allow extra time for recruitment');
        recommendations.push('Consider incentive optimization');
      }

      if (feasible) {
        recommendations.push('Include 10-15% oversample for quality control');
      }

      setResult({
        feasible,
        incidenceRate,
        estimatedTimeline: `${estimatedDays} days`,
        estimatedCost,
        confidence,
        risks,
        recommendations,
      });

      setIsChecking(false);
    }, 2000);
  };

  const reset = () => {
    setMarket('');
    setMethodology('');
    setSampleSize('');
    setTargetAudience('');
    setAudienceType('');
    setGender('all');
    setSelectedAges([]);
    setResult(null);
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 cursor-help" title="Get a quick assessment of your research feasibility including estimated incidence rate, timeline, and cost projections">
            <ClipboardCheck className="h-6 w-6" />
            Feasibility Check
          </h1>
        </div>

        <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ClipboardCheck className="h-5 w-5" />
            Project Feasibility Assessment
          </CardTitle>
        </CardHeader>
        <CardContent>

          <div className="space-y-4">
            {/* Market */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Market <span className="text-red-500">*</span>
              </label>
              <Select
                options={MARKET_OPTIONS}
                value={market}
                onChange={(e) => setMarket(e.target.value)}
                placeholder="Select market"
              />
            </div>

            {/* Methodology */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Methodology <span className="text-red-500">*</span>
              </label>
              <Select
                options={METHODOLOGY_OPTIONS}
                value={methodology}
                onChange={(e) => setMethodology(e.target.value)}
                placeholder="Select methodology"
              />
            </div>

            {/* Sample Size */}
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
            </div>

            {/* Audience Type */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Audience Type <span className="text-red-500">*</span>
              </label>
              <Select
                options={[{ value: '', label: 'Select audience type' }, ...AUDIENCE_TYPES]}
                value={audienceType}
                onChange={(e) => setAudienceType(e.target.value)}
              />
            </div>

            {/* Gender */}
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

            {/* Age Range Selection */}
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Age Range
              </label>
              <div className="flex flex-wrap gap-2">
                {AGE_RANGES.map((age) => (
                  <button
                    key={age.value}
                    type="button"
                    onClick={() => toggleAge(age.value)}
                    className={cn(
                      'rounded-full px-3 py-1.5 text-sm font-medium transition-colors',
                      selectedAges.includes(age.value)
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                    )}
                  >
                    {age.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Additional Target Description */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Additional Criteria
              </label>
              <Textarea
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="e.g., Primary grocery shoppers, purchased soft drinks in past month..."
                className="min-h-[80px]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 pt-2">
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
                    Check Feasibility
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={reset}>
                Reset
              </Button>
            </div>
          </div>

          {/* Results */}
          {result && (
            <div className="mt-6 space-y-4">
              {/* Feasibility Status */}
              <div
                className={cn(
                  'flex items-center gap-3 rounded-lg p-4 border-2',
                  result.feasible
                    ? 'bg-green-50 dark:bg-green-950 border-green-300 dark:border-green-700'
                    : 'bg-red-50 dark:bg-red-950 border-red-300 dark:border-red-700'
                )}
              >
                {result.feasible ? (
                  <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                ) : (
                  <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-400" />
                )}
                <div>
                  <p className={cn('font-semibold', result.feasible ? 'text-green-900 dark:text-green-100' : 'text-red-900 dark:text-red-100')}>
                    {result.feasible ? 'Feasible' : 'Potential Challenges'}
                  </p>
                  <p className={cn('text-sm', result.feasible ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200')}>
                    Confidence: {result.confidence.charAt(0).toUpperCase() + result.confidence.slice(1)}
                  </p>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid gap-4 md:grid-cols-3">
                <div className={cn(
                  'rounded-lg border-2 p-4 text-center',
                  result.incidenceRate >= 30 ? 'border-green-400 dark:border-green-600 bg-green-50 dark:bg-green-950' :
                  result.incidenceRate >= 10 ? 'border-yellow-400 dark:border-yellow-600 bg-yellow-50 dark:bg-yellow-950' :
                  'border-red-400 dark:border-red-600 bg-red-50 dark:bg-red-950'
                )}>
                  <div className={cn(
                    'mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full',
                    result.incidenceRate >= 30 ? 'bg-green-200 dark:bg-green-800' :
                    result.incidenceRate >= 10 ? 'bg-yellow-200 dark:bg-yellow-800' :
                    'bg-red-200 dark:bg-red-800'
                  )}>
                    <span className={cn(
                      'text-lg font-bold',
                      result.incidenceRate >= 30 ? 'text-green-800 dark:text-green-200' :
                      result.incidenceRate >= 10 ? 'text-yellow-800 dark:text-yellow-200' :
                      'text-red-800 dark:text-red-200'
                    )}>{result.incidenceRate}%</span>
                  </div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200">Incidence Rate</p>
                  <p className={cn(
                    'text-xs font-medium',
                    result.incidenceRate >= 30 ? 'text-green-700 dark:text-green-300' :
                    result.incidenceRate >= 10 ? 'text-yellow-700 dark:text-yellow-300' :
                    'text-red-700 dark:text-red-300'
                  )}>
                    {result.incidenceRate >= 30 ? 'Good' : result.incidenceRate >= 10 ? 'Moderate' : 'Low'}
                  </p>
                </div>
                <div className="rounded-lg border-2 border-blue-200 dark:border-blue-700 p-4 text-center bg-blue-50 dark:bg-blue-950">
                  <Clock className="mx-auto mb-2 h-8 w-8 text-blue-600 dark:text-blue-400" />
                  <p className="text-lg font-semibold text-blue-900 dark:text-blue-100">{result.estimatedTimeline}</p>
                  <p className="text-sm text-blue-700 dark:text-blue-300">Est. Timeline</p>
                </div>
                <div className="rounded-lg border-2 border-green-200 dark:border-green-700 p-4 text-center bg-green-50 dark:bg-green-950">
                  <DollarSign className="mx-auto mb-2 h-8 w-8 text-green-600 dark:text-green-400" />
                  <p className="text-lg font-semibold text-green-900 dark:text-green-100">
                    ${result.estimatedCost.toLocaleString()}
                  </p>
                  <p className="text-sm text-green-700 dark:text-green-300">Est. Cost</p>
                </div>
              </div>

              {/* Risks */}
              {result.risks.length > 0 && (
                <div className="rounded-lg border-2 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-950 p-4">
                  <h4 className="mb-2 font-semibold text-amber-900 dark:text-amber-100">Potential Risks</h4>
                  <ul className="space-y-1">
                    {result.risks.map((risk, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-200">
                        <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                        {risk}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Recommendations */}
              {result.recommendations.length > 0 && (
                <div className="rounded-lg border-2 border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-950 p-4">
                  <h4 className="mb-2 font-semibold text-blue-900 dark:text-blue-100">Recommendations</h4>
                  <ul className="space-y-1">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-blue-800 dark:text-blue-200">
                        <CheckCircle className="mt-0.5 h-4 w-4 flex-shrink-0 text-blue-600 dark:text-blue-400" />
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
