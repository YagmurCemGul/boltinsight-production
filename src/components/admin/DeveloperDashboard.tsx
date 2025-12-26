'use client';

import { useMemo, useState } from 'react';
import {
  Activity,
  Users,
  Zap,
  Clock,
  Search,
  Filter,
  ChevronDown,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  BarChart3,
  Cpu,
  Bot,
  FileText,
  MessageSquare,
  Database,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, Button } from '@/components/ui';
import { cn, formatDate } from '@/lib/utils';

type TabId = 'overview' | 'activity-logs' | 'token-usage' | 'users';

interface Tab {
  id: TabId;
  label: string;
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview' },
  { id: 'activity-logs', label: 'Activity Logs' },
  { id: 'token-usage', label: 'Token Usage' },
  { id: 'users', label: 'Users' },
];

// Mock data for API activity
const mockActivityLogs = [
  { id: '1', timestamp: new Date(Date.now() - 3600000), operation: 'Generate Proposal', model: 'Claude 3.5 Sonnet', tokens: 1250, duration: 2.3, status: 'success', user: 'John Doe' },
  { id: '2', timestamp: new Date(Date.now() - 7200000), operation: 'Analyze Document', model: 'Claude 3.5 Sonnet', tokens: 890, duration: 1.8, status: 'success', user: 'Jane Smith' },
  { id: '3', timestamp: new Date(Date.now() - 10800000), operation: 'Generate Proposal', model: 'GPT-4 Turbo', tokens: 2100, duration: 3.5, status: 'success', user: 'John Doe' },
  { id: '4', timestamp: new Date(Date.now() - 14400000), operation: 'Chat Query', model: 'Claude 3.5 Sonnet', tokens: 450, duration: 0.9, status: 'success', user: 'Sarah Wilson' },
  { id: '5', timestamp: new Date(Date.now() - 18000000), operation: 'RAG Search', model: 'Embedding-3', tokens: 320, duration: 0.5, status: 'success', user: 'Mike Brown' },
  { id: '6', timestamp: new Date(Date.now() - 21600000), operation: 'Generate Proposal', model: 'GPT-4 Turbo', tokens: 1890, duration: 2.8, status: 'error', user: 'Jane Smith' },
  { id: '7', timestamp: new Date(Date.now() - 25200000), operation: 'Analyze Document', model: 'Claude 3.5 Sonnet', tokens: 1120, duration: 2.1, status: 'success', user: 'John Doe' },
  { id: '8', timestamp: new Date(Date.now() - 28800000), operation: 'Chat Query', model: 'Claude 3.5 Sonnet', tokens: 380, duration: 0.7, status: 'success', user: 'Sarah Wilson' },
];

const mockUsageByOperation = [
  { name: 'Generate Proposal', count: 245, tokens: 312500, percentage: 45 },
  { name: 'Analyze Document', count: 128, tokens: 156000, percentage: 25 },
  { name: 'Chat Query', count: 312, tokens: 89000, percentage: 15 },
  { name: 'RAG Search', count: 89, tokens: 45000, percentage: 10 },
  { name: 'Other', count: 45, tokens: 23000, percentage: 5 },
];

const mockUsageByModel = [
  { name: 'Claude 3.5 Sonnet', tokens: 425000, cost: 4250, color: '#5B50BD' },
  { name: 'GPT-4 Turbo', tokens: 156000, cost: 3120, color: '#10B981' },
  { name: 'Embedding-3', tokens: 45000, cost: 45, color: '#F59E0B' },
];

const mockTokenUsageData = [
  { date: '2024-01-15', user: 'John Doe', operation: 'Generate Proposal', model: 'Claude 3.5 Sonnet', inputTokens: 850, outputTokens: 2400, cost: 0.32 },
  { date: '2024-01-15', user: 'Jane Smith', operation: 'Analyze Document', model: 'Claude 3.5 Sonnet', inputTokens: 1200, outputTokens: 1800, cost: 0.28 },
  { date: '2024-01-14', user: 'Sarah Wilson', operation: 'Chat Query', model: 'GPT-4 Turbo', inputTokens: 320, outputTokens: 580, cost: 0.15 },
  { date: '2024-01-14', user: 'Mike Brown', operation: 'RAG Search', model: 'Embedding-3', inputTokens: 450, outputTokens: 0, cost: 0.004 },
  { date: '2024-01-13', user: 'John Doe', operation: 'Generate Proposal', model: 'GPT-4 Turbo', inputTokens: 920, outputTokens: 2100, cost: 0.45 },
];

const mockUsers = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'active', lastActive: new Date(Date.now() - 3600000), apiCalls: 156 },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'Editor', status: 'active', lastActive: new Date(Date.now() - 7200000), apiCalls: 89 },
  { id: '3', name: 'Sarah Wilson', email: 'sarah@example.com', role: 'Viewer', status: 'active', lastActive: new Date(Date.now() - 86400000), apiCalls: 45 },
  { id: '4', name: 'Mike Brown', email: 'mike@example.com', role: 'Editor', status: 'inactive', lastActive: new Date(Date.now() - 604800000), apiCalls: 23 },
  { id: '5', name: 'Emily Davis', email: 'emily@example.com', role: 'Viewer', status: 'active', lastActive: new Date(Date.now() - 172800000), apiCalls: 67 },
];

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string | number;
  subValue?: string;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  color: string;
  bgColor: string;
}

function StatCard({ label, value, subValue, icon, trend, color, bgColor }: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', bgColor)}>
            {icon}
          </div>
          {trend && (
            <div className={cn('flex items-center gap-1 text-xs font-medium', trend.positive ? 'text-green-600' : 'text-red-600')}>
              <TrendingUp className={cn('w-3 h-3', !trend.positive && 'rotate-180')} />
              {trend.value}%
            </div>
          )}
        </div>
        <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        {subValue && <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">{subValue}</p>}
      </CardContent>
    </Card>
  );
}

// Progress Bar Component
function ProgressBar({ percentage, color }: { percentage: number; color: string }) {
  return (
    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
      <div className="h-2 rounded-full transition-all" style={{ width: `${percentage}%`, backgroundColor: color }} />
    </div>
  );
}

export function DeveloperDashboard() {
  const { currentUser } = useAppStore();
  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [activitySearch, setActivitySearch] = useState('');
  const [userSearch, setUserSearch] = useState('');
  const [dateRange, setDateRange] = useState('last-7-days');
  const [modelFilter, setModelFilter] = useState('all');
  const [operationFilter, setOperationFilter] = useState('all');
  const [showAddUserModal, setShowAddUserModal] = useState(false);

  // Filter activity logs
  const filteredActivityLogs = useMemo(() => {
    if (!activitySearch) return mockActivityLogs;
    const search = activitySearch.toLowerCase();
    return mockActivityLogs.filter(
      log => log.operation.toLowerCase().includes(search) ||
             log.user.toLowerCase().includes(search) ||
             log.model.toLowerCase().includes(search)
    );
  }, [activitySearch]);

  // Filter users
  const filteredUsers = useMemo(() => {
    if (!userSearch) return mockUsers;
    const search = userSearch.toLowerCase();
    return mockUsers.filter(
      user => user.name.toLowerCase().includes(search) || user.email.toLowerCase().includes(search)
    );
  }, [userSearch]);

  // Calculate totals
  const totals = useMemo(() => {
    return {
      totalTokens: mockUsageByModel.reduce((acc, m) => acc + m.tokens, 0),
      totalCost: mockUsageByModel.reduce((acc, m) => acc + m.cost, 0),
      totalApiCalls: mockActivityLogs.length * 125, // Mock multiplier
      avgResponseTime: 1.8,
    };
  }, []);

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const formatCurrency = (num: number) => {
    return `$${num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const getRelativeTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-6 h-6 rounded-full border-2 border-[#5B50BD] dark:border-[#918AD3]" />
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Developer Dashboard</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-9">
            Monitor API usage, token consumption, and system activity
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'pb-3 px-1 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-[#5B50BD] dark:border-[#918AD3] text-[#5B50BD] dark:text-[#918AD3]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-6">
              <StatCard
                label="Total API Calls"
                value={formatNumber(totals.totalApiCalls)}
                subValue="Last 30 days"
                icon={<Zap className="w-5 h-5 text-[#5B50BD]" />}
                trend={{ value: 12, positive: true }}
                color="text-[#5B50BD]"
                bgColor="bg-[#EDE9F9] dark:bg-[#231E51]"
              />
              <StatCard
                label="Total Tokens"
                value={formatNumber(totals.totalTokens)}
                subValue="Last 30 days"
                icon={<Database className="w-5 h-5 text-blue-500" />}
                trend={{ value: 8, positive: true }}
                color="text-blue-500"
                bgColor="bg-blue-50 dark:bg-blue-900/20"
              />
              <StatCard
                label="Total Cost"
                value={formatCurrency(totals.totalCost)}
                subValue="Last 30 days"
                icon={<BarChart3 className="w-5 h-5 text-green-500" />}
                trend={{ value: 5, positive: false }}
                color="text-green-500"
                bgColor="bg-green-50 dark:bg-green-900/20"
              />
              <StatCard
                label="Avg Response Time"
                value={`${totals.avgResponseTime}s`}
                subValue="Last 30 days"
                icon={<Clock className="w-5 h-5 text-orange-500" />}
                trend={{ value: 15, positive: true }}
                color="text-orange-500"
                bgColor="bg-orange-50 dark:bg-orange-900/20"
              />
            </div>

            {/* Usage Charts Row */}
            <div className="grid grid-cols-2 gap-6">
              {/* Usage by Operation */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Usage by Operation</h3>
                    <select className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    {mockUsageByOperation.map((op) => (
                      <div key={op.name}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            {op.name === 'Generate Proposal' && <FileText className="w-4 h-4 text-[#5B50BD]" />}
                            {op.name === 'Analyze Document' && <Bot className="w-4 h-4 text-blue-500" />}
                            {op.name === 'Chat Query' && <MessageSquare className="w-4 h-4 text-green-500" />}
                            {op.name === 'RAG Search' && <Database className="w-4 h-4 text-orange-500" />}
                            {op.name === 'Other' && <Cpu className="w-4 h-4 text-gray-400" />}
                            <span className="text-sm text-gray-700 dark:text-gray-300">{op.name}</span>
                          </div>
                          <span className="text-sm font-medium text-gray-800 dark:text-white">{op.count} calls</span>
                        </div>
                        <ProgressBar percentage={op.percentage} color="#5B50BD" />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Usage by Model */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-800 dark:text-white">Usage by Model</h3>
                    <select className="text-sm border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-1 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                  </div>
                  <div className="space-y-4">
                    {mockUsageByModel.map((model) => (
                      <div key={model.name} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: model.color }} />
                            <span className="font-medium text-gray-800 dark:text-white">{model.name}</span>
                          </div>
                          <span className="text-sm font-semibold text-gray-800 dark:text-white">{formatCurrency(model.cost)}</span>
                        </div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatNumber(model.tokens)} tokens</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
                    <h3 className="font-semibold text-gray-800 dark:text-white">Recent Activity</h3>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setActiveTab('activity-logs')}
                    className="text-[#5B50BD] dark:text-[#918AD3]"
                  >
                    View All
                  </Button>
                </div>
                <div className="space-y-3">
                  {mockActivityLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-2 h-2 rounded-full',
                          log.status === 'success' ? 'bg-green-500' : 'bg-red-500'
                        )} />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white text-sm">{log.operation}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {log.user} • {log.model}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-800 dark:text-white">{log.tokens} tokens</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">{getRelativeTime(log.timestamp)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Activity Logs Tab */}
        {activeTab === 'activity-logs' && (
          <Card>
            <CardContent className="p-0">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 dark:text-white">Activity Logs</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={activitySearch}
                      onChange={(e) => setActivitySearch(e.target.value)}
                      placeholder="Search logs..."
                      className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD] w-64"
                    />
                  </div>
                  <button className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800">
                    <Filter className="w-4 h-4" />
                    Filter
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Timestamp</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Operation</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">User</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Model</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Tokens</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Duration</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredActivityLogs.map((log) => (
                      <tr key={log.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-5">
                          <div className="text-sm text-gray-800 dark:text-white">{formatDate(log.timestamp)}</div>
                          <div className="text-xs text-gray-500">{formatTime(log.timestamp)}</div>
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-800 dark:text-white">{log.operation}</td>
                        <td className="py-3 px-5 text-sm text-gray-600 dark:text-gray-300">{log.user}</td>
                        <td className="py-3 px-5">
                          <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                            {log.model}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-sm font-medium text-gray-800 dark:text-white">{log.tokens.toLocaleString()}</td>
                        <td className="py-3 px-5 text-sm text-gray-600 dark:text-gray-300">{log.duration}s</td>
                        <td className="py-3 px-5">
                          <span className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            log.status === 'success'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                          )}>
                            {log.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Token Usage Tab */}
        {activeTab === 'token-usage' && (
          <div className="space-y-6">
            {/* Filters */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <select
                      value={dateRange}
                      onChange={(e) => setDateRange(e.target.value)}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                    >
                      <option value="today">Today</option>
                      <option value="last-7-days">Last 7 days</option>
                      <option value="last-30-days">Last 30 days</option>
                      <option value="last-90-days">Last 90 days</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Cpu className="w-4 h-4 text-gray-400" />
                    <select
                      value={modelFilter}
                      onChange={(e) => setModelFilter(e.target.value)}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                    >
                      <option value="all">All Models</option>
                      <option value="claude">Claude 3.5 Sonnet</option>
                      <option value="gpt4">GPT-4 Turbo</option>
                      <option value="embedding">Embedding-3</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <select
                      value={operationFilter}
                      onChange={(e) => setOperationFilter(e.target.value)}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white"
                    >
                      <option value="all">All Operations</option>
                      <option value="generate">Generate Proposal</option>
                      <option value="analyze">Analyze Document</option>
                      <option value="chat">Chat Query</option>
                      <option value="rag">RAG Search</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Token Stats */}
            <div className="grid grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-5 text-center">
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">626K</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Total Tokens</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 text-center">
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">234K</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Input Tokens</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 text-center">
                  <p className="text-3xl font-bold text-gray-800 dark:text-white">392K</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Output Tokens</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-5 text-center">
                  <p className="text-3xl font-bold text-[#5B50BD] dark:text-[#918AD3]">$7,415</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Estimated Cost</p>
                </CardContent>
              </Card>
            </div>

            {/* Usage Table */}
            <Card>
              <CardContent className="p-0">
                <div className="p-5 border-b border-gray-100 dark:border-gray-700">
                  <h3 className="font-semibold text-gray-800 dark:text-white">Token Usage Details</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Date</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">User</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Operation</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Model</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Input</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Output</th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Cost</th>
                      </tr>
                    </thead>
                    <tbody>
                      {mockTokenUsageData.map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-3 px-5 text-sm text-gray-800 dark:text-white">{row.date}</td>
                          <td className="py-3 px-5 text-sm text-gray-600 dark:text-gray-300">{row.user}</td>
                          <td className="py-3 px-5 text-sm text-gray-800 dark:text-white">{row.operation}</td>
                          <td className="py-3 px-5">
                            <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-700 dark:text-gray-300">
                              {row.model}
                            </span>
                          </td>
                          <td className="py-3 px-5 text-sm text-gray-600 dark:text-gray-300">{row.inputTokens.toLocaleString()}</td>
                          <td className="py-3 px-5 text-sm text-gray-600 dark:text-gray-300">{row.outputTokens.toLocaleString()}</td>
                          <td className="py-3 px-5 text-sm font-medium text-[#5B50BD] dark:text-[#918AD3]">${row.cost.toFixed(3)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <Card>
            <CardContent className="p-0">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 dark:text-white">User Management</h2>
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={userSearch}
                      onChange={(e) => setUserSearch(e.target.value)}
                      placeholder="Search users..."
                      className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD] w-64"
                    />
                  </div>
                  <Button
                    onClick={() => setShowAddUserModal(true)}
                    className="bg-[#5B50BD] hover:bg-[#4a41a0] text-white"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Add User
                  </Button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">User</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Role</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Status</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Last Active</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">API Calls</th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-[#5B50BD] flex items-center justify-center text-white text-sm font-medium">
                              {user.name.charAt(0)}
                            </div>
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white text-sm">{user.name}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-5">
                          <span className="px-2 py-1 bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD] dark:text-[#918AD3] rounded text-xs font-medium">
                            {user.role}
                          </span>
                        </td>
                        <td className="py-3 px-5">
                          <span className={cn(
                            'px-2 py-1 rounded text-xs font-medium',
                            user.status === 'active'
                              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                          )}>
                            {user.status}
                          </span>
                        </td>
                        <td className="py-3 px-5 text-sm text-gray-600 dark:text-gray-300">{getRelativeTime(user.lastActive)}</td>
                        <td className="py-3 px-5 text-sm font-medium text-gray-800 dark:text-white">{user.apiCalls}</td>
                        <td className="py-3 px-5">
                          <div className="flex items-center gap-2">
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                              <Edit className="w-4 h-4 text-gray-400" />
                            </button>
                            <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded">
                              <Trash2 className="w-4 h-4 text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Add User Modal */}
        {showAddUserModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="w-full max-w-md">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Add New User</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      type="text"
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      placeholder="Enter user name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      type="email"
                      className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      placeholder="Enter email address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                    <select className="w-full border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]">
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                </div>
                <div className="flex justify-end gap-3 mt-6">
                  <Button variant="outline" onClick={() => setShowAddUserModal(false)}>Cancel</Button>
                  <Button className="bg-[#5B50BD] hover:bg-[#4a41a0] text-white" onClick={() => setShowAddUserModal(false)}>Add User</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
