'use client';

import { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  BarChart3,
  PieChart,
  TrendingUp,
  Users,
  Globe,
  Building2,
  FileCheck,
  FileX,
  Clock,
  Calendar,
  X,
  ChevronDown,
  MessageSquare,
} from 'lucide-react';
import { cn, formatDate, groupBy } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Input, Select, Button, Badge, Card, CardHeader, CardTitle, CardContent, Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui';
import type { ProposalStatus } from '@/types';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'on_hold', label: 'On Hold' },
];

export function MetaLearnings() {
  const { proposals, metaLearningFilter, setMetaLearningFilter, clearMetaLearningFilter } = useAppStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [chatQuery, setChatQuery] = useState('');
  const [chatResponse, setChatResponse] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Get unique values for filters
  const uniqueClients = useMemo(() => {
    const clients = proposals.map((p) => p.content.client).filter(Boolean);
    return [...new Set(clients)];
  }, [proposals]);

  const uniqueAuthors = useMemo(() => {
    const authors = proposals.map((p) => ({ id: p.author.id, name: p.author.name }));
    return [...new Map(authors.map((a) => [a.id, a])).values()];
  }, [proposals]);

  // Filter proposals
  const filteredProposals = useMemo(() => {
    return proposals.filter((p) => {
      if (p.status === 'deleted') return false;

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matches =
          p.content.title?.toLowerCase().includes(query) ||
          p.content.client?.toLowerCase().includes(query) ||
          p.code?.toLowerCase().includes(query);
        if (!matches) return false;
      }

      // Status filter
      if (metaLearningFilter.statuses?.length) {
        if (!metaLearningFilter.statuses.includes(p.status)) return false;
      }

      // Client filter
      if (metaLearningFilter.clients?.length) {
        if (!metaLearningFilter.clients.includes(p.content.client || '')) return false;
      }

      // Author filter
      if (metaLearningFilter.authors?.length) {
        if (!metaLearningFilter.authors.includes(p.author.id)) return false;
      }

      // Date filter
      if (metaLearningFilter.dateRange) {
        const date = new Date(p.createdAt);
        const start = new Date(metaLearningFilter.dateRange.start);
        const end = new Date(metaLearningFilter.dateRange.end);
        if (date < start || date > end) return false;
      }

      return true;
    });
  }, [proposals, searchQuery, metaLearningFilter]);

  // Calculate analytics
  const analytics = useMemo(() => {
    const total = filteredProposals.length;
    const approved = filteredProposals.filter((p) => p.status === 'client_approved' || p.status === 'manager_approved').length;
    const rejected = filteredProposals.filter((p) => p.status === 'manager_rejected' || p.status === 'client_rejected').length;
    const pending = filteredProposals.filter((p) => p.status === 'pending_manager' || p.status === 'pending_client').length;
    const draft = filteredProposals.filter((p) => p.status === 'draft').length;

    const byClient = Object.entries(groupBy(filteredProposals, 'content'))
      .map(([_, items]) => ({
        name: items[0]?.content.client || 'Unknown',
        count: items.length,
        approved: items.filter((p) => p.status === 'client_approved' || p.status === 'manager_approved').length,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    const byAuthor = Object.entries(
      filteredProposals.reduce((acc, p) => {
        const name = p.author.name;
        if (!acc[name]) acc[name] = { total: 0, approved: 0 };
        acc[name].total++;
        if (p.status === 'client_approved' || p.status === 'manager_approved') acc[name].approved++;
        return acc;
      }, {} as Record<string, { total: number; approved: number }>)
    )
      .map(([name, data]) => ({
        name,
        count: data.total,
        approved: data.approved,
        rate: Math.round((data.approved / data.total) * 100),
      }))
      .sort((a, b) => b.count - a.count);

    return { total, approved, rejected, pending, draft, byClient, byAuthor };
  }, [filteredProposals]);

  // Handle chat query for meta analysis
  const handleAnalyze = () => {
    if (!chatQuery.trim()) return;

    setIsAnalyzing(true);
    // Simulate AI response
    setTimeout(() => {
      const query = chatQuery.toLowerCase();
      let response = '';

      if (query.includes('approved') || query.includes('success')) {
        response = `**Analysis: Approval Patterns**\n\nBased on ${analytics.total} proposals analyzed:\n\n- **Approval Rate:** ${Math.round((analytics.approved / analytics.total) * 100)}%\n- **Most Successful Client:** ${analytics.byClient[0]?.name || 'N/A'}\n- **Top Performer:** ${analytics.byAuthor[0]?.name || 'N/A'} with ${analytics.byAuthor[0]?.rate || 0}% approval rate\n\n**Key Insights:**\n1. Proposals with clear business objectives have 40% higher approval rates\n2. Brand tracking studies show highest approval\n3. Multi-market proposals take longer but have similar approval rates`;
      } else if (query.includes('reject') || query.includes('fail')) {
        response = `**Analysis: Rejection Patterns**\n\nFrom ${analytics.rejected} rejected proposals:\n\n**Common Reasons:**\n1. Incomplete target definition (35%)\n2. Budget misalignment (28%)\n3. Timeline issues (22%)\n4. Scope creep (15%)\n\n**Recommendations:**\n- Always include detailed target definitions\n- Validate budget early with stakeholders\n- Use feasibility check before submission`;
      } else if (query.includes('trend') || query.includes('pattern')) {
        response = `**Trend Analysis**\n\nBased on historical data:\n\n**Rising Research Types:**\n1. Concept Testing (+25% YoY)\n2. Brand Health Tracking (+18% YoY)\n3. Segmentation Studies (+12% YoY)\n\n**Client Activity:**\n- Most active client: ${analytics.byClient[0]?.name || 'N/A'}\n- Fastest growing segment: FMCG brands\n\n**Seasonal Patterns:**\n- Peak: Q1 (budget allocation)\n- Low: Q3 (summer slowdown)`;
      } else {
        response = `**General Analysis**\n\nCurrent Portfolio Overview:\n\n- **Total Proposals:** ${analytics.total}\n- **Approved:** ${analytics.approved} (${Math.round((analytics.approved / analytics.total) * 100)}%)\n- **Pending:** ${analytics.pending}\n- **Draft:** ${analytics.draft}\n\n**Top Clients by Volume:**\n${analytics.byClient.slice(0, 5).map((c, i) => `${i + 1}. ${c.name}: ${c.count} proposals`).join('\n')}\n\nAsk me about specific trends, success factors, or comparison analysis!`;
      }

      setChatResponse(response);
      setIsAnalyzing(false);
    }, 1500);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">Meta Learnings</h1>
        <p className="text-sm text-gray-500">
          Analyze proposal patterns and insights across your organization
        </p>
      </div>

      {/* Filters */}
      <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
        <div className="flex flex-wrap items-center gap-4">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search proposals..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select
            options={STATUS_OPTIONS}
            value={metaLearningFilter.statuses?.[0] || ''}
            onChange={(e) =>
              setMetaLearningFilter({
                ...metaLearningFilter,
                statuses: e.target.value ? [e.target.value as ProposalStatus] : undefined,
              })
            }
            className="w-[180px]"
          />

          {/* Client Filter */}
          <Select
            options={[
              { value: '', label: 'All Clients' },
              ...uniqueClients.map((c) => ({ value: c!, label: c! })),
            ]}
            value={metaLearningFilter.clients?.[0] || ''}
            onChange={(e) =>
              setMetaLearningFilter({
                ...metaLearningFilter,
                clients: e.target.value ? [e.target.value] : undefined,
              })
            }
            className="w-[180px]"
          />

          {/* Author Filter */}
          <Select
            options={[
              { value: '', label: 'All Authors' },
              ...uniqueAuthors.map((a) => ({ value: a.id, label: a.name })),
            ]}
            value={metaLearningFilter.authors?.[0] || ''}
            onChange={(e) =>
              setMetaLearningFilter({
                ...metaLearningFilter,
                authors: e.target.value ? [e.target.value] : undefined,
              })
            }
            className="w-[180px]"
          />

          {/* Clear Filters */}
          {(searchQuery || Object.keys(metaLearningFilter).length > 0) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                clearMetaLearningFilter();
              }}
            >
              <X className="mr-2 h-4 w-4" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <Tabs defaultValue="overview">
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="by-client">By Client</TabsTrigger>
            <TabsTrigger value="by-author">By Author</TabsTrigger>
            <TabsTrigger value="chat">AI Analysis</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <StatCard
                title="Total Proposals"
                value={analytics.total}
                icon={<BarChart3 className="h-5 w-5 text-blue-600" />}
                color="blue"
              />
              <StatCard
                title="Approved"
                value={analytics.approved}
                subtitle={`${Math.round((analytics.approved / analytics.total) * 100) || 0}% rate`}
                icon={<FileCheck className="h-5 w-5 text-green-600" />}
                color="green"
              />
              <StatCard
                title="Rejected"
                value={analytics.rejected}
                icon={<FileX className="h-5 w-5 text-red-600" />}
                color="red"
              />
              <StatCard
                title="Pending"
                value={analytics.pending}
                icon={<Clock className="h-5 w-5 text-yellow-600" />}
                color="yellow"
              />
            </div>

            {/* Charts Section */}
            <div className="mt-6 grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Status Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <StatusBar label="Approved" count={analytics.approved} total={analytics.total} color="bg-[#1ED6BB] dark:bg-[#14A08C]" />
                    <StatusBar label="Rejected" count={analytics.rejected} total={analytics.total} color="bg-[#EB3F5F] dark:bg-[#CA1636]" />
                    <StatusBar label="Pending" count={analytics.pending} total={analytics.total} color="bg-[#A2AD01] dark:bg-[#788101]" />
                    <StatusBar label="Draft" count={analytics.draft} total={analytics.total} color="bg-[#919191] dark:bg-[#5A5A5A]" />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Top Clients
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {analytics.byClient.slice(0, 5).map((client, i) => (
                      <div key={client.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-medium text-blue-600">
                            {i + 1}
                          </span>
                          <span className="text-sm text-gray-700">{client.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="info">{client.count}</Badge>
                          <span className="text-xs text-gray-500">
                            {client.approved} approved
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* By Client Tab */}
          <TabsContent value="by-client">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Proposals by Client
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 text-sm font-medium text-gray-500">Client</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Total</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Approved</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.byClient.map((client) => (
                        <tr key={client.name} className="border-b">
                          <td className="py-3 text-sm text-gray-900">{client.name}</td>
                          <td className="py-3 text-sm text-gray-600">{client.count}</td>
                          <td className="py-3 text-sm text-gray-600">{client.approved}</td>
                          <td className="py-3">
                            <Badge
                              variant={
                                (client.approved / client.count) >= 0.7
                                  ? 'success'
                                  : (client.approved / client.count) >= 0.4
                                  ? 'warning'
                                  : 'error'
                              }
                            >
                              {Math.round((client.approved / client.count) * 100)}%
                            </Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* By Author Tab */}
          <TabsContent value="by-author">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Performance by Author
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left">
                        <th className="pb-3 text-sm font-medium text-gray-500">Author</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Total</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Approved</th>
                        <th className="pb-3 text-sm font-medium text-gray-500">Success Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.byAuthor.map((author) => (
                        <tr key={author.name} className="border-b">
                          <td className="py-3 text-sm text-gray-900">{author.name}</td>
                          <td className="py-3 text-sm text-gray-600">{author.count}</td>
                          <td className="py-3 text-sm text-gray-600">{author.approved}</td>
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-20 rounded-full bg-gray-200">
                                <div
                                  className={cn(
                                    'h-full rounded-full',
                                    author.rate >= 70 ? 'bg-green-500' : author.rate >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                                  )}
                                  style={{ width: `${author.rate}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{author.rate}%</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Analysis Chat Tab */}
          <TabsContent value="chat">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  AI-Powered Analysis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-600">
                  Ask questions about your proposal data and get AI-powered insights.
                </p>

                {/* Chat Response */}
                {chatResponse && (
                  <div className="mb-4 rounded-lg bg-blue-50 p-4">
                    <div className="whitespace-pre-wrap text-sm text-gray-800">{chatResponse}</div>
                  </div>
                )}

                {/* Query Input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., What are the common patterns in approved proposals?"
                    value={chatQuery}
                    onChange={(e) => setChatQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
                    className="flex-1"
                  />
                  <Button onClick={handleAnalyze} disabled={isAnalyzing || !chatQuery.trim()}>
                    {isAnalyzing ? 'Analyzing...' : 'Analyze'}
                  </Button>
                </div>

                {/* Suggested Queries */}
                <div className="mt-4">
                  <p className="mb-2 text-xs font-medium text-gray-500">Suggested questions:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'What are success patterns?',
                      'Why are proposals rejected?',
                      'Show me trends',
                      'Compare performance',
                    ].map((q) => (
                      <button
                        key={q}
                        onClick={() => setChatQuery(q)}
                        className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Helper Components

interface StatCardProps {
  title: string;
  value: number;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'blue' | 'green' | 'red' | 'yellow';
}

function StatCard({ title, value, subtitle, icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-700',
    green: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-700',
    red: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-700',
    yellow: 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/30 dark:border-yellow-700',
  };

  return (
    <div className={cn('rounded-xl border p-6', colorClasses[color])}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-gray-300">{title}</p>
          <p className="mt-1 text-3xl font-semibold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        <div className="rounded-full bg-white dark:bg-gray-800 p-3 shadow-sm">{icon}</div>
      </div>
    </div>
  );
}

interface StatusBarProps {
  label: string;
  count: number;
  total: number;
  color: string;
}

function StatusBar({ label, count, total, color }: StatusBarProps) {
  const percentage = total > 0 ? Math.round((count / total) * 100) : 0;

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <span className="font-medium text-gray-900 dark:text-white">{count} ({percentage}%)</span>
      </div>
      <div className="h-2 rounded-full bg-gray-200 dark:bg-gray-700">
        <div
          className={cn('h-full rounded-full', color)}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
