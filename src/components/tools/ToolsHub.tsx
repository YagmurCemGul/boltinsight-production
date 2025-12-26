'use client';

import { useState } from 'react';
import {
  PieChart,
  ClipboardCheck,
  Sparkles,
  TrendingUp,
  Target,
  Layers,
  X,
  Maximize2,
  Clock,
  BarChart3,
  Percent,
  Users,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, Button } from '@/components/ui';
import { cn } from '@/lib/utils';

// Import new calculator components
import {
  SampleSizeCalculator,
  MarginOfErrorCalculator,
  LOICalculator,
  MaxDiffCalculator,
  DemographicsDistribution,
  FeasibilityCheck,
} from '@/components/calculators';

interface Tool {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  section: string;
  color: string;
  features: string[];
}

const tools: Tool[] = [
  {
    id: 'sample',
    label: 'Sample Size Calculator',
    description: 'Calculate optimal sample sizes with AI-powered recommendations and subgroup analysis.',
    icon: <Users className="w-8 h-8" />,
    section: 'sample',
    color: 'from-blue-500 to-indigo-600',
    features: ['Sample size calculation', 'Subgroup analysis', 'Cost estimation', 'AI recommendations'],
  },
  {
    id: 'moe',
    label: 'Margin of Error',
    description: 'Calculate statistical precision with quality ratings and what-if scenarios.',
    icon: <Percent className="w-8 h-8" />,
    section: 'moe',
    color: 'from-blue-500 to-blue-700',
    features: ['MOE calculation', 'Quality rating', 'What-if analysis', 'Benchmarks'],
  },
  {
    id: 'loi',
    label: 'LOI Calculator',
    description: 'Estimate survey duration with cost tiers and optimization suggestions.',
    icon: <Clock className="w-8 h-8" />,
    section: 'loi',
    color: 'from-green-500 to-emerald-600',
    features: ['Duration estimate', 'Cost tiers', 'Fatigue analysis', 'Optimization tips'],
  },
  {
    id: 'maxdiff',
    label: 'MaxDiff Calculator',
    description: 'Design optimal MaxDiff studies with balanced designs and reliability scoring.',
    icon: <BarChart3 className="w-8 h-8" />,
    section: 'maxdiff',
    color: 'from-[#5B50BD] to-[#918AD3]',
    features: ['Task optimization', 'Balance check', 'Reliability score', 'Sample guidance'],
  },
  {
    id: 'demographics',
    label: 'Demographics Distribution',
    description: 'Calculate representative quotas based on census data with feasibility notes.',
    icon: <PieChart className="w-8 h-8" />,
    section: 'demographics',
    color: 'from-teal-500 to-teal-600',
    features: ['Census data', 'Age/gender quotas', 'Incidence rate', 'Export to CSV'],
  },
  {
    id: 'feasibility',
    label: 'Feasibility Check',
    description: 'Assess project feasibility with multi-dimensional scoring and risk analysis.',
    icon: <ClipboardCheck className="w-8 h-8" />,
    section: 'feasibility',
    color: 'from-amber-500 to-orange-600',
    features: ['Feasibility score', 'Risk assessment', 'Cost estimate', 'Recommendations'],
  },
];

const quickStats = [
  { label: 'Calculations Made', value: '1,247', icon: <TrendingUp className="w-4 h-4" />, trend: '+12%' },
  { label: 'Projects Validated', value: '89', icon: <Target className="w-4 h-4" />, trend: '+5%' },
  { label: 'Time Saved', value: '156h', icon: <Sparkles className="w-4 h-4" />, trend: '+23%' },
];

export function ToolsHub() {
  const { setActiveSection } = useAppStore();
  const [fullScreenTool, setFullScreenTool] = useState<Tool | null>(null);

  // Full-screen tool content renderer - using new AI-powered calculators
  const renderFullScreenToolContent = (tool: Tool) => {
    switch (tool.id) {
      case 'sample':
        return <SampleSizeCalculator />;
      case 'moe':
        return <MarginOfErrorCalculator />;
      case 'loi':
        return <LOICalculator />;
      case 'maxdiff':
        return <MaxDiffCalculator />;
      case 'demographics':
        return <DemographicsDistribution />;
      case 'feasibility':
        return <FeasibilityCheck />;
      default:
        return null;
    }
  };

  // Full-screen modal
  if (fullScreenTool) {
    return (
      <div className="fixed inset-0 z-50 bg-white dark:bg-gray-900 overflow-y-auto">
        {/* Full-screen header */}
        <div className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
          <div className="flex items-center justify-between max-w-6xl mx-auto">
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-10 h-10 rounded-xl bg-gradient-to-br flex items-center justify-center text-white',
                fullScreenTool.color
              )}>
                {fullScreenTool.icon}
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">{fullScreenTool.label}</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">{fullScreenTool.description}</p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setFullScreenTool(null)}
              className="gap-2"
            >
              <X className="w-4 h-4" />
              Close
            </Button>
          </div>
        </div>

        {/* Full-screen content */}
        <div className="p-6 max-w-6xl mx-auto">
          {renderFullScreenToolContent(fullScreenTool)}
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5B50BD] to-[#1ED6BB] flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Research Tools</h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Powerful calculators and analyzers to support your research
              </p>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {quickStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <div className="w-8 h-8 rounded-lg bg-[#EDE9F9] dark:bg-[#231E51] flex items-center justify-center text-[#5B50BD] dark:text-[#918AD3]">
                      {stat.icon}
                    </div>
                    <span className="text-xs text-green-600 dark:text-green-400 font-medium">
                      {stat.trend}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tools Grid */}
        <div className="grid gap-6">
          {tools.map((tool) => (
            <Card
              key={tool.id}
              className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => setFullScreenTool(tool)}
            >
              <CardContent className="p-0">
                <div className="flex">
                  {/* Icon Side */}
                  <div className={cn(
                    'w-40 flex-shrink-0 bg-gradient-to-br flex items-center justify-center text-white',
                    tool.color
                  )}>
                    {tool.icon}
                  </div>

                  {/* Content Side */}
                  <div className="flex-1 p-6">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                          {tool.label}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                          {tool.description}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-[#5B50BD] hover:text-white transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFullScreenTool(tool);
                          }}
                          title="Open full screen"
                        >
                          <Maximize2 className="w-5 h-5 text-gray-400 group-hover:text-[#5B50BD]" />
                        </div>
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap gap-2">
                      {tool.features.map((feature) => (
                        <span
                          key={feature}
                          className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 text-xs rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-8 p-6 bg-gradient-to-r from-[#5B50BD]/10 to-[#1ED6BB]/10 rounded-xl border border-[#5B50BD]/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-[#5B50BD]/20 flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-[#5B50BD]" />
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-900 dark:text-white">Need help choosing?</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Our AI assistant can recommend the right tool based on your research needs.
              </p>
            </div>
            <button
              onClick={() => setActiveSection('new-proposal')}
              className="px-4 py-2 bg-[#5B50BD] hover:bg-[#4a41a0] text-white rounded-lg text-sm font-medium transition-colors"
            >
              Ask AI Assistant
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
