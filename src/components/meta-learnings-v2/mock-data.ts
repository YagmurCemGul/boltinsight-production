// Mock AI responses for Meta Learnings V2
// Comprehensive scenario-based responses following AI behavior guidelines

import type {
  MetaLearningMessage,
  InsightData,
  TableData,
  SourceCitationData,
  ActionItem,
  ProactiveAlert,
  ConversationContext,
} from './types';

// Generate unique ID
const generateId = () => Math.random().toString(36).substring(2, 11);

// ============================================
// MOCK DATA SOURCES
// ============================================

const MOCK_SOURCES: Record<string, SourceCitationData[]> = {
  pg: [
    {
      id: 'src-pg-1',
      proposalId: 'P-2024-Q3-001',
      proposalTitle: 'P&G Brand Tracker Q3',
      client: 'P&G',
      status: 'rejected',
      date: '2024-09-15',
      relevanceScore: 95,
      excerpt: 'Price exceeds budget allocation, timeline too long...',
    },
    {
      id: 'src-pg-2',
      proposalId: 'P-2024-Q4-001',
      proposalTitle: 'P&G Concept Test Alpha',
      client: 'P&G',
      status: 'rejected',
      date: '2024-10-22',
      relevanceScore: 88,
      excerpt: 'Methodology does not meet expectations...',
    },
    {
      id: 'src-pg-3',
      proposalId: 'P-2024-Q4-003',
      proposalTitle: 'P&G Package Testing',
      client: 'P&G',
      status: 'rejected',
      date: '2024-11-10',
      relevanceScore: 91,
      excerpt: 'Alternative vendor selected due to pricing...',
    },
  ],
  samsung: [
    {
      id: 'src-sam-1',
      proposalId: 'SS-2024-Q2-001',
      proposalTitle: 'Samsung Mobile UX Study',
      client: 'Samsung',
      status: 'approved',
      date: '2024-06-15',
      relevanceScore: 94,
      excerpt: 'Fast turnaround and mobile expertise appreciated...',
    },
    {
      id: 'src-sam-2',
      proposalId: 'SS-2024-Q3-002',
      proposalTitle: 'Samsung Galaxy Tracker',
      client: 'Samsung',
      status: 'approved',
      date: '2024-09-20',
      relevanceScore: 89,
      excerpt: 'Excellent methodology for mobile-first research...',
    },
  ],
  unilever: [
    {
      id: 'src-uni-1',
      proposalId: 'UL-2024-Q4-001',
      proposalTitle: 'Unilever Innovation Study',
      client: 'Unilever',
      status: 'approved',
      date: '2024-11-05',
      relevanceScore: 82,
      excerpt: 'Comprehensive approach with local insights...',
    },
    {
      id: 'src-uni-2',
      proposalId: 'UL-2024-Q3-002',
      proposalTitle: 'Unilever Brand Health Q3',
      client: 'Unilever',
      status: 'approved',
      date: '2024-09-28',
      relevanceScore: 86,
      excerpt: 'Strong sustainability focus appreciated...',
    },
  ],
  general: [
    {
      id: 'src-gen-1',
      proposalId: 'P-2024-Q4-002',
      proposalTitle: 'FMCG Concept Test',
      client: 'Various',
      status: 'approved',
      date: '2024-11-05',
      relevanceScore: 78,
    },
  ],
};

// Common actions for responses
const COMMON_ACTIONS: ActionItem[] = [
  { id: 'share', label: 'Share', icon: 'share', variant: 'secondary' },
  { id: 'proposal', label: 'Add to', icon: 'proposal', variant: 'primary' },
];

const DETAIL_ACTION: ActionItem = {
  id: 'detail',
  label: 'Detailed Analysis',
  icon: 'detail',
  variant: 'secondary',
};

// ============================================
// RESPONSE GENERATORS BY CATEGORY
// ============================================

interface Analytics {
  total: number;
  approved: number;
  rejected: number;
  pending: number;
  topClients: { name: string; count: number; approved: number }[];
  topAuthors: { name: string; count: number; rate: number }[];
}

// 1. WIN/LOSS ANALYSIS RESPONSES
function generateRejectionAnalysis(query: string, analytics: Analytics, context: ConversationContext): Omit<MetaLearningMessage, 'id' | 'timestamp'> {
  // Check if specific client mentioned in context
  const clientFocus = context.mentionedClients[0] || 'P&G';

  return {
    role: 'assistant',
    content: `## Rejection Analysis

I analyzed ${clientFocus}'s last 5 proposals in the past 6 months. 3 were rejected.

**Rejection Patterns:**

| Factor | Occurrence | Impact |
|--------|------------|--------|
| 💰 High Price | 3/3 | Average +28% above accepted |
| ⏱️ Long Timeline | 2/3 | 18+ days (requested: 14) |
| 📋 Methodology | 1/3 | Hybrid vs Online preference |

**Detail:**

1. **${clientFocus}-2024-Q3-Tracker** ($36,200 - REJECTED)
   - Acceptance average: $28,500
   - Difference: +27% ❌
   - Feedback: "Over budget"

2. **${clientFocus}-2024-Q4-Concept** ($34,800 - REJECTED)
   - Timeline: 21 days (requested: 14)
   - Feedback: "Timeline too long"

3. **${clientFocus}-2024-Q4-Package** ($38,500 - REJECTED)
   - Both factors present
   - Feedback: "Alternative selected"

**Recommendation:** For next ${clientFocus} proposal:
- Max price: $30,000
- Max timeline: 14 days
- Pure online CAWI methodology`,
    confidence: 87,
    tables: [
      {
        id: 'rejection-table',
        title: 'Rejection Factors Distribution',
        headers: [
          { key: 'factor', label: 'Factor', sortable: true },
          { key: 'impact', label: 'Impact', sortable: true, align: 'center' },
          { key: 'frequency', label: 'Frequency', align: 'center' },
          { key: 'trend', label: 'Trend', align: 'center' },
        ],
        rows: [
          { id: '1', data: { factor: 'Price', impact: '80%', frequency: '3/3', trend: '↑' }, status: 'negative' },
          { id: '2', data: { factor: 'Timeline', impact: '60%', frequency: '2/3', trend: '→' } },
          { id: '3', data: { factor: 'Methodology', impact: '40%', frequency: '1/3', trend: '↓' }, status: 'positive' },
        ],
      },
    ],
    sources: MOCK_SOURCES.pg,
    actions: COMMON_ACTIONS,
    suggestions: [
      'What price optimization strategies work?',
      `Show successful ${clientFocus} proposals`,
      'Are there similar patterns with other clients?',
    ],
  };
}

function generateSuccessAnalysis(query: string, analytics: Analytics, context: ConversationContext): Omit<MetaLearningMessage, 'id' | 'timestamp'> {
  const approvalRate = analytics.total > 0 ? Math.round((analytics.approved / analytics.total) * 100) : 68;
  const topClient = analytics.topClients[0] || { name: 'Samsung', count: 15, approved: 12 };
  const topAuthor = analytics.topAuthors[0] || { name: 'Melek O.', count: 57, rate: 82 };

  return {
    role: 'assistant',
    content: `## Success Analysis

I reviewed your proposal portfolio. Here are the key metrics:

**Overall Performance:**
- Total Proposals: ${analytics.total || 245}
- Win Rate: ${approvalRate}% (Target: 70%)
- Top Client: ${topClient.name}
- Top Performer: ${topAuthor.name} (${topAuthor.rate}% win rate)

**Success Factors Identified:**

1. **Response Speed** - 18-hour average response time correlates with +15% win rate
2. **Clear Target Audience** - Proposals with defined audiences have +40% approval
3. **Benchmark Data** - Including benchmarks increases approval speed by 3 days
4. **Client-Specific Pricing** - Tailored pricing vs. standard templates: +22% win rate

**Top Performing Segments:**
- FMCG: 78% win rate ⭐
- Technology: 74% win rate
- Finance: 71% win rate`,
    confidence: 92,
    insights: [
      {
        id: 'insight-opportunity',
        type: 'opportunity',
        title: 'High-Potential Segment',
        description: 'Your FMCG sector approval rate is 78%, significantly above average. Growth opportunity exists.',
        confidence: 85,
        metrics: [
          { label: 'FMCG Win Rate', value: '78%', trend: 'up', change: 12 },
          { label: 'Potential Revenue', value: '$45K' },
          { label: 'Expected Projects', value: '3' },
        ],
        actions: [DETAIL_ACTION],
      },
    ],
    sources: [...MOCK_SOURCES.samsung, ...MOCK_SOURCES.unilever],
    actions: COMMON_ACTIONS,
    suggestions: [
      'Show winning proposal structures',
      'Which segments underperform?',
      'Analyze approval timeline patterns',
    ],
  };
}

// 2. CLIENT PROFILE RESPONSES
function generateClientProfile(query: string, analytics: Analytics, context: ConversationContext): Omit<MetaLearningMessage, 'id' | 'timestamp'> {
  // Extract client name from query or context
  const clientMatch = query.match(/(?:about|analyze|show|profile)\s+(\w+)/i);
  const clientName = clientMatch?.[1] || context.mentionedClients[0] || 'Unilever';

  const clientData: Record<string, { winRate: number; projects: number; revenue: string; preferences: string[] }> = {
    unilever: { winRate: 82, projects: 127, revenue: '$3.2M', preferences: ['Online CAWI (75%)', 'CLT (20%)', '10-14 day timeline'] },
    samsung: { winRate: 76, projects: 89, revenue: '$2.8M', preferences: ['Mobile-first methodology', 'Fast turnaround', 'UX focus'] },
    pg: { winRate: 58, projects: 45, revenue: '$1.1M', preferences: ['Hybrid methods', 'Detailed methodology', 'Competitive pricing'] },
    nestle: { winRate: 71, projects: 62, revenue: '$1.8M', preferences: ['Price sensitive', 'Committee decisions', 'Long timeline OK'] },
  };

  const client = clientData[clientName.toLowerCase()] || clientData.unilever;
  const displayName = clientName.charAt(0).toUpperCase() + clientName.slice(1);

  return {
    role: 'assistant',
    content: `## ${displayName} Client Profile

**Overview:**
- Total Projects: ${client.projects} (2020-2024)
- Total Revenue: ${client.revenue}
- Win Rate: ${client.winRate}% ${client.winRate >= 75 ? '⭐' : ''}
- Relationship Score: ${Math.round(client.winRate * 1.15)}/100

**Preferences:**
| Category | Preference |
|----------|------------|
| Methodology | ${client.preferences[0]} |
| Sample Size | 400-600 (optimal: 500) |
| Timeline | ${client.preferences[2]} |
| Budget Range | $25,000-$45,000 |
| Survey Length | Max 15 minutes |

**Seasonality:**
- Q1: Innovation trackers (3-4 projects)
- Q2: Concept tests (summer launches)
- Q3: Low activity
- Q4: Brand tracking renewal

**Key Decision Makers:**
- Research Director - Final approval
- Brand Manager - Brief originator
- Budget held by Marketing Director

**Recent Activity:**
- Last brief: 45 days ago
- Last project: Completed, NPS: 9
- Expected: Q1 Innovation Tracker`,
    confidence: 88,
    sources: MOCK_SOURCES[clientName.toLowerCase()] || MOCK_SOURCES.unilever,
    actions: COMMON_ACTIONS,
    suggestions: [
      `What are ${displayName}'s common rejection reasons?`,
      `Compare ${displayName} with other clients`,
      `${displayName} pricing recommendations`,
    ],
  };
}

function generateClientComparison(query: string, analytics: Analytics): Omit<MetaLearningMessage, 'id' | 'timestamp'> {
  return {
    role: 'assistant',
    content: `## Client Comparison Analysis

**Performance Overview:**`,
    confidence: 85,
    tables: [
      {
        id: 'client-comparison',
        title: 'Client Performance Matrix',
        headers: [
          { key: 'client', label: 'Client', sortable: true },
          { key: 'winRate', label: 'Win Rate', sortable: true, align: 'center' },
          { key: 'projects', label: 'Projects', sortable: true, align: 'center' },
          { key: 'revenue', label: 'Revenue', sortable: true, align: 'right' },
          { key: 'avgValue', label: 'Avg Value', align: 'right' },
          { key: 'trend', label: 'Trend', align: 'center' },
        ],
        rows: [
          { id: '1', data: { client: 'Unilever', winRate: '82%', projects: 127, revenue: '$3.2M', avgValue: '$25.2K', trend: '↑' }, status: 'positive' },
          { id: '2', data: { client: 'Samsung', winRate: '76%', projects: 89, revenue: '$2.8M', avgValue: '$31.5K', trend: '↑' }, status: 'positive' },
          { id: '3', data: { client: 'Nestle', winRate: '71%', projects: 62, revenue: '$1.8M', avgValue: '$29.0K', trend: '→' } },
          { id: '4', data: { client: 'P&G', winRate: '58%', projects: 45, revenue: '$1.1M', avgValue: '$24.4K', trend: '↓' }, status: 'negative' },
          { id: '5', data: { client: 'Coca-Cola', winRate: '69%', projects: 38, revenue: '$950K', avgValue: '$25.0K', trend: '→' } },
        ],
      },
    ],
    insights: [
      {
        id: 'client-insight',
        type: 'warning',
        title: 'P&G Relationship at Risk',
        description: 'Win rate dropped from 72% to 58% in 6 months. Last 3 proposals rejected. Immediate attention required.',
        confidence: 90,
        metrics: [
          { label: 'Win Rate Drop', value: '-14%', trend: 'down', change: -14 },
          { label: 'Days Since Last Win', value: '180' },
        ],
        actions: [DETAIL_ACTION],
      },
    ],
    sources: [...MOCK_SOURCES.pg.slice(0, 1), ...MOCK_SOURCES.samsung.slice(0, 1)],
    actions: COMMON_ACTIONS,
    suggestions: [
      'Deep dive into P&G relationship',
      'What makes Unilever successful?',
      'Client acquisition opportunities',
    ],
  };
}

// 3. PRICING ANALYSIS RESPONSES
function generatePricingAnalysis(query: string, analytics: Analytics, context: ConversationContext): Omit<MetaLearningMessage, 'id' | 'timestamp'> {
  const clientMatch = query.match(/(?:for|price|pricing)\s+(\w+)/i);
  const clientName = clientMatch?.[1] || context.mentionedClients[0] || 'client';

  return {
    role: 'assistant',
    content: `## Pricing Analysis - Concept Test

**Historical Data (2022-2024, 34 projects):**

Accepted (31 projects):
- Average: $28,500
- Range: $22,000 - $38,000
- Sweet spot: $26,000 - $32,000

Rejected (3 projects):
- All above $40,000
- Rejection reason: "Budget exceeded"

**Recommended Price: $28,000 - $30,000**

| Component | Recommended | Market Avg |
|-----------|-------------|------------|
| Sample (400) | $18,000 | $17,500 |
| Programming | $3,500 | $3,200 |
| Analysis | $4,500 | $4,800 |
| PM Fee | $2,500 | $2,500 |
| **Total** | **$28,500** | **$28,000** |

**Client-Specific Factors:**
✓ Volume discount: 5+ projects/year = 8% discount
✓ Relationship premium: Acceptable due to trust
⚠️ Year-end: Budget may be depleted

**Negotiation Strategy:**
- Opening: $31,000
- Target: $28,500
- Minimum: $26,000 (margin preserved)`,
    confidence: 84,
    insights: [
      {
        id: 'price-insight',
        type: 'recommendation',
        title: 'Optimal Price Point',
        description: 'Based on 34 historical projects, $28,000-$30,000 range has 89% acceptance rate.',
        confidence: 84,
        metrics: [
          { label: 'Recommended Price', value: '$28,500' },
          { label: 'Win Probability', value: '89%', trend: 'up' },
          { label: 'Margin', value: '34%' },
        ],
      },
    ],
    sources: MOCK_SOURCES.general,
    actions: COMMON_ACTIONS,
    suggestions: [
      'Show margin analysis',
      'Compare with competitor pricing',
      'Generate proposal draft with this price',
    ],
  };
}

function generateMarginAnalysis(analytics: Analytics): Omit<MetaLearningMessage, 'id' | 'timestamp'> {
  return {
    role: 'assistant',
    content: `## Margin Analysis (2024)

**Overview:**
- Average Margin: 32%
- Target: 35%
- Gap: -3 points

**By Methodology:**`,
    confidence: 86,
    tables: [
      {
        id: 'margin-table',
        title: 'Margin by Methodology',
        headers: [
          { key: 'methodology', label: 'Methodology', sortable: true },
          { key: 'margin', label: 'Margin', sortable: true, align: 'center' },
          { key: 'target', label: 'Target', align: 'center' },
          { key: 'status', label: 'Status', align: 'center' },
        ],
        rows: [
          { id: '1', data: { methodology: 'Online CAWI', margin: '38%', target: '35%', status: '✅ Above' }, status: 'positive' },
          { id: '2', data: { methodology: 'Tracker', margin: '35%', target: '35%', status: '✅ On Target' }, status: 'positive' },
          { id: '3', data: { methodology: 'Concept Test', margin: '31%', target: '35%', status: '⚠️ Below' } },
          { id: '4', data: { methodology: 'CLT', margin: '25%', target: '30%', status: '❌ Low' }, status: 'negative' },
          { id: '5', data: { methodology: 'Qualitative', margin: '22%', target: '30%', status: '❌ Very Low' }, status: 'negative' },
        ],
      },
    ],
    insights: [
      {
        id: 'margin-insight',
        type: 'warning',
        title: 'CLT Projects Margin Issue',
        description: 'Field costs are rising but prices remain static. Recommend 15% price increase.',
        confidence: 88,
        metrics: [
          { label: 'Current Margin', value: '25%', trend: 'down', change: -5 },
          { label: 'Required Increase', value: '+15%' },
        ],
        actions: [DETAIL_ACTION],
      },
    ],
    sources: MOCK_SOURCES.general,
    actions: COMMON_ACTIONS,
    suggestions: [
      'CLT pricing recommendations',
      'Which clients have lowest margins?',
      'Qualitative pricing strategy',
    ],
  };
}

// 4. PIPELINE/OPPORTUNITY RESPONSES
function generatePipelineAnalysis(analytics: Analytics): Omit<MetaLearningMessage, 'id' | 'timestamp'> {
  const nextMonth = new Date();
  nextMonth.setMonth(nextMonth.getMonth() + 1);
  const monthName = nextMonth.toLocaleString('en-US', { month: 'long' });

  return {
    role: 'assistant',
    content: `## ${monthName} Pipeline Forecast

**High Probability (>80%):**

1. 🔥 **Unilever Q1 Tracker Brief**
   - Expected: Early ${monthName}
   - Reason: Same timing last 3 years
   - Potential: $40,000-$50,000
   - Confidence: 90%

2. 🔥 **Eti Year-End Concept**
   - Expected: Mid ${monthName}
   - Reason: 4 new SKU launches announced
   - Potential: $60,000-$80,000
   - Confidence: 85%

**Medium Probability (50-80%):**

3. ⚡ **Samsung CES Preparation**
   - Expected: Mid ${monthName}
   - Reason: Annual CES pre-testing
   - Potential: $35,000
   - Confidence: 65%

4. ⚡ **Garanti Brand Tracking**
   - Expected: Late ${monthName}
   - Reason: Annual tracking renewal
   - Potential: $30,000
   - Confidence: 55%

**Total Pipeline: $165,000 - $195,000**`,
    confidence: 78,
    insights: [
      {
        id: 'pipeline-insight',
        type: 'opportunity',
        title: 'Proactive Outreach Window',
        description: `Q1 briefs typically arrive in ${monthName}. Last year: 15 new briefs. Proactive outreach recommended.`,
        confidence: 82,
        metrics: [
          { label: 'Last Q1', value: '15 briefs' },
          { label: 'Estimated Q1', value: '18 briefs', trend: 'up', change: 20 },
          { label: 'Pipeline Value', value: '$180K' },
        ],
        actions: [DETAIL_ACTION],
      },
    ],
    sources: MOCK_SOURCES.unilever,
    actions: COMMON_ACTIONS,
    suggestions: [
      'Which clients to contact first?',
      'Show historical Q1 patterns',
      'Prepare proactive proposals',
    ],
  };
}

function generateChurnRiskAnalysis(analytics: Analytics): Omit<MetaLearningMessage, 'id' | 'timestamp'> {
  return {
    role: 'assistant',
    content: `## Churn Risk Analysis

**High Risk Clients:**`,
    confidence: 85,
    tables: [
      {
        id: 'churn-table',
        title: 'Client Risk Assessment',
        headers: [
          { key: 'client', label: 'Client', sortable: true },
          { key: 'risk', label: 'Risk Level', sortable: true, align: 'center' },
          { key: 'signals', label: 'Warning Signals', align: 'left' },
          { key: 'potentialLoss', label: 'Potential Loss', align: 'right' },
        ],
        rows: [
          { id: '1', data: { client: 'P&G', risk: '🔴 75%', signals: 'Last 3 proposals rejected, no brief in 4 months', potentialLoss: '$180K/year' }, status: 'negative' },
          { id: '2', data: { client: 'Coca-Cola', risk: '🔴 60%', signals: 'Budget cuts, scope reductions, new procurement', potentialLoss: '$120K/year' }, status: 'negative' },
          { id: '3', data: { client: 'Nestle', risk: '🟡 45%', signals: 'Price pressure, win rate declined 15%', potentialLoss: '$90K/year' } },
          { id: '4', data: { client: 'Garanti', risk: '🟢 25%', signals: '6 months no brief (but annual tracker due)', potentialLoss: '$30K/year' }, status: 'positive' },
        ],
      },
    ],
    insights: [
      {
        id: 'churn-insight',
        type: 'warning',
        title: 'P&G Immediate Attention Required',
        description: 'Last 3 proposals rejected. No contact in 4 months. Feedback: "Evaluating alternatives"',
        confidence: 90,
        metrics: [
          { label: 'Risk Level', value: '75%', trend: 'up', change: 25 },
          { label: 'Potential Loss', value: '$180K' },
          { label: 'Days Since Contact', value: '120' },
        ],
        actions: [
          { id: 'recovery-plan', label: 'Create Recovery Plan', icon: 'detail', variant: 'primary' },
        ],
      },
    ],
    sources: MOCK_SOURCES.pg,
    actions: COMMON_ACTIONS,
    suggestions: [
      'P&G recovery strategy',
      'How to re-engage Coca-Cola?',
      'Retention best practices',
    ],
  };
}

// 5. TEAM PERFORMANCE RESPONSES
function generateTeamPerformance(analytics: Analytics): Omit<MetaLearningMessage, 'id' | 'timestamp'> {
  return {
    role: 'assistant',
    content: `## Team Performance Analysis (2024)

**Overview:**
- Total Proposals: 245
- Team Win Rate: 68% (Target: 70%)
- Average Response Time: 32 hours

**Individual Performance:**`,
    confidence: 91,
    tables: [
      {
        id: 'team-table',
        title: 'Team Performance Matrix',
        headers: [
          { key: 'name', label: 'Name', sortable: true },
          { key: 'winRate', label: 'Win %', sortable: true, align: 'center' },
          { key: 'proposals', label: 'Proposals', sortable: true, align: 'center' },
          { key: 'responseTime', label: 'Resp. Time', align: 'center' },
          { key: 'trend', label: 'Trend', align: 'center' },
          { key: 'specialty', label: 'Specialty' },
        ],
        rows: [
          { id: '1', data: { name: 'Melek O.', winRate: '82%', proposals: 57, responseTime: '18 hrs', trend: '↑', specialty: 'FMCG' }, status: 'positive' },
          { id: '2', data: { name: 'Naz T.', winRate: '76%', proposals: 50, responseTime: '24 hrs', trend: '→', specialty: 'Tech' }, status: 'positive' },
          { id: '3', data: { name: 'Gabi K.', winRate: '74%', proposals: 55, responseTime: '28 hrs', trend: '↑', specialty: 'Finance' } },
          { id: '4', data: { name: 'Mert S.', winRate: '71%', proposals: 45, responseTime: '36 hrs', trend: '→', specialty: 'Tracker' } },
          { id: '5', data: { name: 'Ebru A.', winRate: '62%', proposals: 38, responseTime: '48 hrs', trend: '↓', specialty: 'Qual' }, status: 'negative' },
        ],
      },
    ],
    insights: [
      {
        id: 'team-insight-1',
        type: 'recommendation',
        title: "Melek's Success Formula",
        description: '82% win rate leader. Key factors: 18-hour response, client-specific pricing, decision-maker focused summaries.',
        confidence: 88,
        metrics: [
          { label: 'Win Rate', value: '82%', trend: 'up' },
          { label: 'Response Time', value: '18 hrs' },
          { label: 'Proposals', value: '57' },
        ],
      },
      {
        id: 'team-insight-2',
        type: 'warning',
        title: "Ebru's Performance Decline",
        description: 'Win rate dropped from 71% to 62%. Possible causes: Qual project decline, workload issues.',
        confidence: 82,
        metrics: [
          { label: 'Win Rate Drop', value: '-9%', trend: 'down', change: -9 },
          { label: 'Response Time', value: '48 hrs' },
        ],
        actions: [DETAIL_ACTION],
      },
    ],
    sources: MOCK_SOURCES.general,
    actions: COMMON_ACTIONS,
    suggestions: [
      "Share Melek's templates with team",
      "Ebru's workload analysis",
      'Team training recommendations',
    ],
  };
}

// 6. TREND ANALYSIS RESPONSES
function generateTrendAnalysis(analytics: Analytics): Omit<MetaLearningMessage, 'id' | 'timestamp'> {
  return {
    role: 'assistant',
    content: `## Trend Analysis (12 Months)

**Rising Research Types:**
1. Concept Testing (+25% YoY)
2. Brand Health Tracking (+18% YoY)
3. Segmentation Studies (+12% YoY)

**Declining:**
1. Traditional Focus Groups (-15% YoY)
2. Paper-based surveys (-30% YoY)

**Seasonal Patterns:**
- Peak: Q1 (budget allocation period)
- Secondary Peak: Q4 (year-end projects)
- Low: Q3 (summer slowdown)

**Client Activity Trends:**
- Most Active: ${analytics.topClients[0]?.name || 'Unilever'}
- Fastest Growing Segment: FMCG (+22% YoY)
- Declining Segment: Retail (-8% YoY)`,
    confidence: 79,
    insights: [
      {
        id: 'trend-insight',
        type: 'trend',
        title: 'Q1 Preparation Window',
        description: 'January approaching. Last year: 15 new briefs in Q1. Time for proactive client outreach.',
        confidence: 75,
        metrics: [
          { label: 'Last Q1 Briefs', value: '15' },
          { label: 'Estimated Q1', value: '18', trend: 'up', change: 20 },
          { label: 'Top Q1 Client', value: 'Unilever' },
        ],
      },
    ],
    sources: MOCK_SOURCES.unilever,
    actions: COMMON_ACTIONS,
    suggestions: [
      'Which clients to contact for Q1?',
      'Growing methodology breakdown',
      'Sector performance details',
    ],
  };
}

// 7. EDGE CASE / FALLBACK RESPONSES
function generateNoDataResponse(query: string): Omit<MetaLearningMessage, 'id' | 'timestamp'> {
  return {
    role: 'assistant',
    content: `## Search Results

I couldn't find specific data matching your query.

**What I can help with:**
- Rejection analysis and win/loss patterns
- Client profiles and comparisons
- Pricing recommendations
- Pipeline forecasts
- Team performance metrics
- Trend analysis

**Alternative approaches:**
1. Try a more specific client name
2. Specify a time period (e.g., "last 6 months")
3. Focus on a methodology type

Would you like me to show a general overview instead?`,
    confidence: 50,
    actions: COMMON_ACTIONS.slice(0, 1),
    suggestions: [
      'Show general portfolio analysis',
      'List all available clients',
      'What data do you have?',
    ],
  };
}

function generateAmbiguousResponse(query: string, analytics: Analytics): Omit<MetaLearningMessage, 'id' | 'timestamp'> {
  const approvalRate = analytics.total > 0 ? Math.round((analytics.approved / analytics.total) * 100) : 68;

  return {
    role: 'assistant',
    content: `## Analysis Options

I can help with several types of analysis. Which would you like to explore?

**Quick Stats:**
- Current Win Rate: ${approvalRate}%
- Active Proposals: ${analytics.pending}
- Top Client: ${analytics.topClients[0]?.name || 'Unilever'}

**Available Analysis Types:**

1. **Win Rate Improvement**
   - Current: ${approvalRate}%, Target: 75%
   - Lowest segment: Qualitative (62%)

2. **Margin Optimization**
   - Current: 32%, Target: 35%
   - Problem area: CLT projects

3. **Client Health**
   - Current NPS: 8.2
   - At-risk: P&G (6.5)

4. **Response Speed**
   - Current: 32 hours
   - Target: 24 hours

Which area would you like to focus on?`,
    confidence: 70,
    sources: MOCK_SOURCES.general,
    actions: COMMON_ACTIONS,
    suggestions: [
      'How to improve win rate?',
      'Show margin analysis',
      'Which clients are at risk?',
      'Team performance breakdown',
    ],
  };
}

// ============================================
// MAIN RESPONSE GENERATOR
// ============================================

export function generateMockResponse(
  query: string,
  analytics: Analytics,
  context: ConversationContext = { mentionedClients: [], mentionedProposals: [] }
): Omit<MetaLearningMessage, 'id' | 'timestamp'> {
  const queryLower = query.toLowerCase();

  // Rejection / Loss Analysis
  if (queryLower.match(/reject|loss|fail|why.*(lost|reject)|reason/)) {
    return generateRejectionAnalysis(query, analytics, context);
  }

  // Success / Win Analysis
  if (queryLower.match(/success|win|approv|highest|best|top.*perform/)) {
    return generateSuccessAnalysis(query, analytics, context);
  }

  // Client Profile (specific client mentioned)
  if (queryLower.match(/about|profile|analyze|show/i) && queryLower.match(/unilever|samsung|p&g|pg|nestle|coca|eti|garanti/i)) {
    return generateClientProfile(query, analytics, context);
  }

  // Client Comparison
  if (queryLower.match(/compar|versus|vs|between.*client/)) {
    return generateClientComparison(query, analytics);
  }

  // Pricing Analysis
  if (queryLower.match(/price|pricing|cost|budget|quote|margin/)) {
    if (queryLower.includes('margin')) {
      return generateMarginAnalysis(analytics);
    }
    return generatePricingAnalysis(query, analytics, context);
  }

  // Pipeline / Forecast
  if (queryLower.match(/pipeline|forecast|expect|next.*month|upcoming|predict/)) {
    return generatePipelineAnalysis(analytics);
  }

  // Churn / Risk Analysis
  if (queryLower.match(/churn|risk|los.*client|at.risk|danger/)) {
    return generateChurnRiskAnalysis(analytics);
  }

  // Team Performance
  if (queryLower.match(/team|perform|author|who.*best|staff|employee/)) {
    return generateTeamPerformance(analytics);
  }

  // Trend Analysis
  if (queryLower.match(/trend|pattern|seasonal|change.*over|growth/)) {
    return generateTrendAnalysis(analytics);
  }

  // Client Analysis (general)
  if (queryLower.match(/client|customer|active|account/)) {
    return generateClientComparison(query, analytics);
  }

  // Ambiguous / General queries
  if (queryLower.match(/how.*improv|what.*can|help|better|optimi/)) {
    return generateAmbiguousResponse(query, analytics);
  }

  // Default - General Analysis
  const approvalRate = analytics.total > 0 ? Math.round((analytics.approved / analytics.total) * 100) : 0;

  return {
    role: 'assistant',
    content: `## Portfolio Overview

**Current Status:**
- Total Proposals: ${analytics.total}
- Approved: ${analytics.approved}
- Pending: ${analytics.pending}
- Rejected: ${analytics.rejected}

**Win Rate:** ${approvalRate}%

**Top Clients:**
${analytics.topClients.slice(0, 3).map((c, i) => `${i + 1}. ${c.name}: ${c.count} proposals (${Math.round((c.approved / c.count) * 100)}% win rate)`).join('\n')}

Ask a more specific question for detailed analysis!`,
    confidence: 85,
    sources: MOCK_SOURCES.general,
    actions: COMMON_ACTIONS,
    suggestions: [
      'Why are proposals being rejected?',
      'Show success factors',
      'Analyze client performance',
      'What are the trends?',
    ],
  };
}

// ============================================
// PROACTIVE ALERTS GENERATOR
// ============================================

export function generateProactiveAlerts(analytics: Analytics): ProactiveAlert[] {
  const alerts: ProactiveAlert[] = [];
  const now = new Date().toISOString();

  // Check for win rate decline
  const winRate = analytics.total > 0 ? (analytics.approved / analytics.total) * 100 : 0;
  if (winRate < 65) {
    alerts.push({
      id: generateId(),
      type: 'warning',
      priority: 'high',
      title: 'Win Rate Decline',
      description: `Win rate dropped to ${Math.round(winRate)}%. Target is 70%. Review recent rejections for patterns.`,
      actions: [
        { id: 'analyze', label: 'Analyze', variant: 'primary' },
        { id: 'later', label: 'Remind Later', variant: 'ghost' },
      ],
      dismissable: true,
      timestamp: now,
    });
  }

  // Check for high-value opportunity
  const topClient = analytics.topClients[0];
  if (topClient && topClient.count > 10 && (topClient.approved / topClient.count) > 0.7) {
    alerts.push({
      id: generateId(),
      type: 'opportunity',
      priority: 'medium',
      title: `${topClient.name} Q1 Opportunity`,
      description: `${topClient.name} typically sends Q1 briefs soon. Your win rate with them is ${Math.round((topClient.approved / topClient.count) * 100)}%. Consider proactive outreach.`,
      actions: [
        { id: 'detail', label: 'View Details', variant: 'primary' },
        { id: 'notify', label: 'Notify Account Manager', variant: 'secondary' },
      ],
      dismissable: true,
      timestamp: now,
    });
  }

  // Team performance insight
  const topAuthor = analytics.topAuthors[0];
  if (topAuthor && topAuthor.rate > 75) {
    alerts.push({
      id: generateId(),
      type: 'insight',
      priority: 'low',
      title: `${topAuthor.name}'s Success Formula`,
      description: `${topAuthor.name} leads with ${topAuthor.rate}% win rate. Their approach could benefit the whole team.`,
      actions: [
        { id: 'detail', label: 'Learn More', variant: 'secondary' },
        { id: 'share', label: 'Share with Team', variant: 'primary' },
      ],
      dismissable: true,
      timestamp: now,
    });
  }

  // Client at risk
  const lowPerformingClient = analytics.topClients.find(
    c => c.count >= 5 && (c.approved / c.count) < 0.5
  );
  if (lowPerformingClient) {
    alerts.push({
      id: generateId(),
      type: 'warning',
      priority: 'high',
      title: `${lowPerformingClient.name} Relationship at Risk`,
      description: `Only ${Math.round((lowPerformingClient.approved / lowPerformingClient.count) * 100)}% win rate with ${lowPerformingClient.name}. May need intervention.`,
      actions: [
        { id: 'recovery', label: 'Recovery Plan', variant: 'primary' },
        { id: 'dismiss', label: 'Dismiss', variant: 'ghost' },
      ],
      dismissable: true,
      timestamp: now,
    });
  }

  return alerts;
}

// ============================================
// WELCOME MESSAGE
// ============================================

export function getWelcomeMessage(): MetaLearningMessage {
  return {
    id: 'welcome',
    role: 'assistant',
    content: `## Welcome to Meta Learnings

I'm your AI-powered proposal insights assistant. I analyze your proposal data to help you win more.

**What I can help with:**
- **Win/Loss Analysis** - Why are proposals being rejected?
- **Client Intelligence** - Client profiles, preferences, and risk assessment
- **Pricing Optimization** - What prices work for each client?
- **Pipeline Forecasting** - What opportunities are coming?
- **Team Performance** - Who's winning and why?

Type your question below to get started.`,
    timestamp: new Date().toISOString(),
  };
}

// ============================================
// CONTEXT EXTRACTION
// ============================================

export function extractContextFromQuery(query: string, existingContext: ConversationContext): ConversationContext {
  const updatedContext = { ...existingContext };

  // Extract mentioned clients
  const clientPatterns = /\b(unilever|samsung|p&g|pg|nestle|coca.?cola|eti|garanti|kraft|disney|pfizer|toyota)\b/gi;
  const clientMatches = query.match(clientPatterns);
  if (clientMatches) {
    const newClients = clientMatches.map(c => c.toLowerCase().replace(/\s/g, ''));
    updatedContext.mentionedClients = [...new Set([...newClients, ...existingContext.mentionedClients])].slice(0, 5);
  }

  // Extract query type
  if (query.match(/reject|loss|fail/i)) {
    updatedContext.lastQueryType = 'rejection';
  } else if (query.match(/success|win|approv/i)) {
    updatedContext.lastQueryType = 'success';
  } else if (query.match(/price|cost|margin/i)) {
    updatedContext.lastQueryType = 'pricing';
  } else if (query.match(/client|customer/i)) {
    updatedContext.lastQueryType = 'client';
  } else if (query.match(/team|perform/i)) {
    updatedContext.lastQueryType = 'team';
  } else if (query.match(/trend|pattern/i)) {
    updatedContext.lastQueryType = 'trend';
  }

  return updatedContext;
}
