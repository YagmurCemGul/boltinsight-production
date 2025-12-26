'use client';

import { useState } from 'react';
import { Users, Globe, Calculator, Download, RefreshCw, PieChart } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button, Input, Select, Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

// Mock census data for demonstration
const CENSUS_DATA: Record<string, {
  ageGroups: { range: string; percentage: number }[];
  gender: { category: string; percentage: number }[];
}> = {
  USA: {
    ageGroups: [
      { range: '18-24', percentage: 12 },
      { range: '25-34', percentage: 18 },
      { range: '35-44', percentage: 17 },
      { range: '45-54', percentage: 17 },
      { range: '55-64', percentage: 17 },
      { range: '65+', percentage: 19 },
    ],
    gender: [
      { category: 'Male', percentage: 49 },
      { category: 'Female', percentage: 51 },
    ],
  },
  UK: {
    ageGroups: [
      { range: '18-24', percentage: 11 },
      { range: '25-34', percentage: 17 },
      { range: '35-44', percentage: 16 },
      { range: '45-54', percentage: 17 },
      { range: '55-64', percentage: 16 },
      { range: '65+', percentage: 23 },
    ],
    gender: [
      { category: 'Male', percentage: 49 },
      { category: 'Female', percentage: 51 },
    ],
  },
  Germany: {
    ageGroups: [
      { range: '18-24', percentage: 10 },
      { range: '25-34', percentage: 15 },
      { range: '35-44', percentage: 15 },
      { range: '45-54', percentage: 18 },
      { range: '55-64', percentage: 17 },
      { range: '65+', percentage: 25 },
    ],
    gender: [
      { category: 'Male', percentage: 49 },
      { category: 'Female', percentage: 51 },
    ],
  },
  France: {
    ageGroups: [
      { range: '18-24', percentage: 11 },
      { range: '25-34', percentage: 15 },
      { range: '35-44', percentage: 16 },
      { range: '45-54', percentage: 17 },
      { range: '55-64', percentage: 16 },
      { range: '65+', percentage: 25 },
    ],
    gender: [
      { category: 'Male', percentage: 48 },
      { category: 'Female', percentage: 52 },
    ],
  },
};

const COUNTRY_OPTIONS = [
  { value: 'USA', label: 'United States' },
  { value: 'UK', label: 'United Kingdom' },
  { value: 'Germany', label: 'Germany' },
  { value: 'France', label: 'France' },
];

export function DemographicDistribution() {
  const [country, setCountry] = useState('USA');
  const [sampleSize, setSampleSize] = useState('1000');
  const [ageRange, setAgeRange] = useState<{ min: string; max: string }>({ min: '18', max: '65' });
  const [quotas, setQuotas] = useState<{
    ageGroups: { range: string; percentage: number; count: number }[];
    gender: { category: string; percentage: number; count: number }[];
  } | null>(null);

  // Calculate quotas function remains the same

  const calculateQuotas = () => {
    const sample = parseInt(sampleSize) || 0;
    const minAge = parseInt(ageRange.min) || 18;
    const maxAge = parseInt(ageRange.max) || 99;

    const censusData = CENSUS_DATA[country];
    if (!censusData) return;

    // Filter and recalculate age groups based on range
    const ageRangeMap: Record<string, [number, number]> = {
      '18-24': [18, 24],
      '25-34': [25, 34],
      '35-44': [35, 44],
      '45-54': [45, 54],
      '55-64': [55, 64],
      '65+': [65, 99],
    };

    const filteredAgeGroups = censusData.ageGroups.filter((group) => {
      const [groupMin, groupMax] = ageRangeMap[group.range] || [0, 0];
      return groupMax >= minAge && groupMin <= maxAge;
    });

    // Recalculate percentages for filtered age groups
    const totalPercentage = filteredAgeGroups.reduce((sum, g) => sum + g.percentage, 0);
    const normalizedAgeGroups = filteredAgeGroups.map((g) => ({
      range: g.range,
      percentage: Math.round((g.percentage / totalPercentage) * 100),
      count: Math.round((g.percentage / totalPercentage) * sample),
    }));

    // Calculate gender quotas
    const genderQuotas = censusData.gender.map((g) => ({
      ...g,
      count: Math.round((g.percentage / 100) * sample),
    }));

    setQuotas({
      ageGroups: normalizedAgeGroups,
      gender: genderQuotas,
    });
  };

  const exportQuotas = () => {
    if (!quotas) return;

    const content = `
Demographic Quota Distribution
Country: ${COUNTRY_OPTIONS.find(c => c.value === country)?.label}
Sample Size: ${sampleSize}
Age Range: ${ageRange.min}-${ageRange.max}

Age Groups:
${quotas.ageGroups.map(g => `${g.range}: ${g.percentage}% (n=${g.count})`).join('\n')}

Gender:
${quotas.gender.map(g => `${g.category}: ${g.percentage}% (n=${g.count})`).join('\n')}
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quota_distribution.txt';
    a.click();
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="w-full h-full p-4 md:p-6 lg:p-8">
        <div className="mb-6">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2 cursor-help" title="Calculate quota distributions based on census data for your target population">
            <Users className="h-6 w-6" />
            Demographics Distribution
          </h1>
        </div>

        <Card className="max-w-4xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5" />
            Quota Calculator
          </CardTitle>
        </CardHeader>
        <CardContent>

          <div className="grid gap-4 md:grid-cols-2">
            {/* Country Selection */}
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

            {/* Sample Size */}
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Total Sample Size <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                value={sampleSize}
                onChange={(e) => setSampleSize(e.target.value)}
                placeholder="e.g., 1000"
                min="1"
              />
            </div>

            {/* Age Range */}
            <div className="md:col-span-2">
              <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
                Target Age Range
              </label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={ageRange.min}
                  onChange={(e) => setAgeRange({ ...ageRange, min: e.target.value })}
                  placeholder="Min"
                  min="18"
                  max="99"
                  className="w-24"
                />
                <span className="text-gray-500 dark:text-gray-400">to</span>
                <Input
                  type="number"
                  value={ageRange.max}
                  onChange={(e) => setAgeRange({ ...ageRange, max: e.target.value })}
                  placeholder="Max"
                  min="18"
                  max="99"
                  className="w-24"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-6 flex gap-2">
            <Button onClick={calculateQuotas} className="flex-1">
              <Calculator className="mr-2 h-4 w-4" />
              Calculate Quotas
            </Button>
            <Button variant="outline" onClick={() => setQuotas(null)}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>

          {/* Results */}
          {quotas && (
            <div className="mt-6 space-y-6">
              {/* Age Distribution */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="mb-4 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                  <PieChart className="h-4 w-4" />
                  Age Distribution
                </h3>
                <div className="space-y-3">
                  {quotas.ageGroups.map((group) => (
                    <div key={group.range}>
                      <div className="mb-1 flex items-center justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-300">{group.range}</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          {group.percentage}% (n={group.count})
                        </span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-blue-500"
                          style={{ width: `${group.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Gender Distribution */}
              <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                <h3 className="mb-4 flex items-center gap-2 font-medium text-gray-900 dark:text-white">
                  <Users className="h-4 w-4" />
                  Gender Distribution
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {quotas.gender.map((g) => (
                    <div
                      key={g.category}
                      className={cn(
                        'rounded-lg p-4 text-center',
                        g.category === 'Male'
                          ? 'bg-blue-50 dark:bg-blue-900/30'
                          : 'bg-pink-50 dark:bg-pink-900/30'
                      )}
                    >
                      <p className="text-sm text-gray-600 dark:text-gray-300">{g.category}</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-white">{g.percentage}%</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">n = {g.count}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Export Button */}
              <Button variant="outline" onClick={exportQuotas} className="w-full">
                <Download className="mr-2 h-4 w-4" />
                Export Quota Distribution
              </Button>
            </div>
          )}

          {/* Census Data Note */}
          <div className="mt-6 rounded-lg bg-amber-50 dark:bg-amber-950 border-2 border-amber-300 dark:border-amber-700 p-4">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              <strong className="text-amber-900 dark:text-amber-100">Note:</strong> Quota calculations are based on publicly available census data.
              For the most accurate quotas, please consult the latest official census data for your target market.
            </p>
          </div>
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
