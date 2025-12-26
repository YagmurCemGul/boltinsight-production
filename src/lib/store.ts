'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  Proposal,
  Project,
  NestedProject,
  User,
  ChatMessage,
  LibraryItem,
  MetaLearningFilter,
  ProposalStatus,
  ApprovalAction,
  ApprovalRecord,
  Notification,
  NotificationType,
  ActivityLogEntry,
  ActivityType,
  ChatProject,
  ProjectConversation,
  ProjectMessage,
  ProjectFile,
  ProjectCollaborator,
  ProposalRef,
  CoworkingSession,
  SessionCollaborator,
  SessionComment,
  SessionMessage,
  SessionInvite,
  SessionType,
  AccessLevel,
} from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { generateProposalCode } from './utils';

// Mock current user
const currentUser: User = {
  id: 'user-1',
  name: 'Demo User',
  email: 'demo@boltinsight.com',
  role: 'admin',
  region: 'EMEA',
};

// Mock team members for approver selection
export const teamMembers: User[] = [
  currentUser,
  {
    id: 'user-2',
    name: 'Sarah Johnson',
    email: 'sarah.johnson@boltinsight.com',
    role: 'manager',
    region: 'EMEA',
  },
  {
    id: 'user-3',
    name: 'Michael Chen',
    email: 'michael.chen@boltinsight.com',
    role: 'manager',
    region: 'APAC',
  },
  {
    id: 'user-4',
    name: 'Emily Rodriguez',
    email: 'emily.rodriguez@boltinsight.com',
    role: 'researcher',
    region: 'LATAM',
  },
  {
    id: 'user-5',
    name: 'David Kim',
    email: 'david.kim@boltinsight.com',
    role: 'admin',
    region: 'NA',
  },
];

// Initial mock data
const mockProposals: Proposal[] = [
  {
    id: 'proposal-1',
    code: 'BI-2412-0001',
    status: 'client_approved',
    projectId: 'project-2',
    content: {
      title: 'Brand Health Tracking Q1 2025',
      client: 'Coca-Cola',
      contact: 'John Smith',
      background: 'Annual brand health measurement study to track key brand metrics and consumer perceptions across major markets.',
      businessObjectives: [
        'Measure brand awareness levels',
        'Track brand perception changes',
        'Monitor competitive positioning',
      ],
      researchObjectives: [
        'To understand current brand positioning',
        'To identify key purchase drivers',
        'To measure brand equity metrics',
      ],
      burningQuestions: [
        'How has brand awareness changed since last quarter?',
        'What are the key drivers of brand preference?',
      ],
      targetDefinition: 'Adults 18-45, primary grocery shoppers who consume soft drinks at least once per week',
      sampleSize: 1000,
      markets: [
        { country: 'USA', language: 'English', sampleSize: 500 },
        { country: 'UK', language: 'English', sampleSize: 500 },
      ],
      advancedAnalysis: ['Brand Funnel Analysis', 'Key Driver Analysis', 'Competitive Mapping'],
    },
    author: currentUser,
    createdAt: '2024-12-01T10:00:00Z',
    updatedAt: '2024-12-10T14:30:00Z',
    sentToClient: true,
    versions: [
      {
        id: 'v1',
        version: 1,
        content: { title: 'Brand Health Study', client: 'Coca-Cola' },
        createdAt: '2024-12-01T10:00:00Z',
        createdBy: currentUser,
      },
    ],
    approvalHistory: [
      {
        id: 'approval-1',
        action: 'manager_approved',
        by: { ...currentUser, id: 'manager-1', name: 'Team Manager', role: 'manager' },
        timestamp: '2024-12-10T14:30:00Z',
      },
    ],
  },
  {
    id: 'proposal-2',
    status: 'draft',
    content: {
      title: 'Consumer Segmentation Study',
      client: 'Danone',
      contact: 'Marie Dupont',
      background: 'Identify key consumer segments for new product launch in the yogurt category',
      businessObjectives: [
        'Understand consumer segments',
        'Identify growth opportunities',
      ],
      researchObjectives: [
        'To identify distinct consumer segments based on health attitudes',
        'To understand purchase drivers by segment',
        'To map brand positioning vs competitors',
      ],
      burningQuestions: [
        'What percentage of consumers prioritize health over taste?',
        'How price sensitive are health-conscious segments?',
        'What is the optimal pack size for different occasions?',
      ],
      targetDefinition: 'Adults 25-54, health-conscious consumers',
      sampleSize: 2000,
      markets: [
        { country: 'France', language: 'French', sampleSize: 800 },
        { country: 'Germany', language: 'German', sampleSize: 600 },
        { country: 'UK', language: 'English', sampleSize: 600 },
      ],
    },
    author: currentUser,
    createdAt: '2024-12-12T09:00:00Z',
    updatedAt: '2024-12-12T09:00:00Z',
    versions: [
      {
        id: 'v2-1',
        version: 1,
        content: { title: 'Consumer Study', client: 'Danone' },
        createdAt: '2024-12-11T10:00:00Z',
        createdBy: currentUser,
      },
      {
        id: 'v2-2',
        version: 2,
        content: { title: 'Consumer Segmentation Study', client: 'Danone', targetDefinition: 'Adults 25-54' },
        createdAt: '2024-12-12T09:00:00Z',
        createdBy: currentUser,
      },
    ],
  },
  {
    id: 'proposal-99',
    code: 'BI-2501-0001',
    status: 'draft',
    projectId: '',
    content: {
      title: 'GenZ Social Media Pulse Jan 2025',
      client: 'TikTok',
      contact: 'Jess Lin',
      background: 'Quick pulse to understand weekly engagement drivers.',
      targetDefinition: 'GenZ, 16-24, US',
      sampleSize: 400,
      markets: [{ country: 'USA', language: 'English', sampleSize: 400 }],
    },
    author: currentUser,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvalHistory: [],
    comments: [],
    collaborators: [],
    versions: [],
  },
  {
    id: 'proposal-100',
    code: 'BI-2501-0002',
    status: 'client_approved',
    projectId: '',
    content: {
      title: 'Retail Footfall Tracker Jan 2025',
      client: 'IKEA',
      contact: 'Aylin Demir',
      background: 'Track conversion uplift after new layout rollout.',
      targetDefinition: 'Shoppers 18-55',
      sampleSize: 600,
      markets: [{ country: 'Turkey', language: 'Turkish', sampleSize: 600 }],
    },
    author: currentUser,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    approvalHistory: [],
    comments: [],
    collaborators: [],
    versions: [],
  },
  {
    id: 'proposal-3',
    code: 'BI-2412-0002',
    status: 'pending_manager',
    content: {
      title: 'Concept Testing - New Product Line',
      client: 'Nestle',
      contact: 'Sarah Johnson',
      background: 'Testing 3 new product concepts for European market launch in Q2 2025',
      businessObjectives: ['Identify winning concept', 'Understand improvement areas', 'Validate pricing strategy'],
      researchObjectives: ['To evaluate concept appeal', 'To measure purchase intent', 'To assess price sensitivity'],
      burningQuestions: [
        'Which concept has the highest purchase intent?',
        'What improvements would increase appeal?',
      ],
      targetDefinition: 'Young adults 18-35, health conscious, interested in sustainable products',
      sampleSize: 1500,
      markets: [
        { country: 'Germany', language: 'German', sampleSize: 500 },
        { country: 'France', language: 'French', sampleSize: 500 },
        { country: 'Spain', language: 'Spanish', sampleSize: 500 },
      ],
      advancedAnalysis: ['MaxDiff Analysis', 'Conjoint Analysis'],
    },
    author: currentUser,
    createdAt: '2024-12-13T11:00:00Z',
    updatedAt: '2024-12-14T08:00:00Z',
    versions: [
      {
        id: 'v3-1',
        version: 1,
        content: { title: 'Concept Testing', client: 'Nestle', sampleSize: 1000 },
        createdAt: '2024-12-13T11:00:00Z',
        createdBy: currentUser,
      },
      {
        id: 'v3-2',
        version: 2,
        content: { title: 'Concept Testing - New Product Line', client: 'Nestle', sampleSize: 1500 },
        createdAt: '2024-12-13T15:00:00Z',
        createdBy: currentUser,
      },
      {
        id: 'v3-3',
        version: 3,
        content: { title: 'Concept Testing - New Product Line', client: 'Nestle', sampleSize: 1500, markets: [{ country: 'Germany', language: 'German', sampleSize: 500 }] },
        createdAt: '2024-12-14T08:00:00Z',
        createdBy: currentUser,
      },
    ],
  },
  {
    id: 'proposal-4',
    code: 'BI-2412-0003',
    status: 'client_approved',
    projectId: 'project-1',
    content: {
      title: 'Customer Satisfaction Survey - Banking',
      client: 'HSBC',
      contact: 'Michael Chen',
      background: 'Quarterly customer satisfaction tracking for retail banking services',
      businessObjectives: [
        'Track NPS score',
        'Identify pain points in customer journey',
        'Benchmark against competitors',
      ],
      researchObjectives: [
        'To measure overall satisfaction',
        'To identify drivers of loyalty',
        'To evaluate service touchpoints',
      ],
      targetDefinition: 'HSBC retail banking customers, active account holders',
      sampleSize: 3000,
      markets: [
        { country: 'UK', language: 'English', sampleSize: 1500 },
        { country: 'USA', language: 'English', sampleSize: 1500 },
      ],
      advancedAnalysis: ['NPS Analysis', 'Key Driver Analysis', 'Customer Journey Mapping'],
    },
    author: currentUser,
    createdAt: '2024-12-05T14:00:00Z',
    updatedAt: '2024-12-08T16:00:00Z',
    sentToClient: true,
    versions: [],
    approvalHistory: [
      {
        id: 'approval-2',
        action: 'manager_approved',
        by: { ...currentUser, id: 'director-1', name: 'Research Director', role: 'manager' },
        timestamp: '2024-12-08T16:00:00Z',
      },
    ],
  },
  {
    id: 'proposal-5',
    status: 'manager_rejected',
    content: {
      title: 'Ad Effectiveness Study',
      client: 'BMW',
      contact: 'Hans Mueller',
      background: 'Measure effectiveness of new TV campaign',
      businessObjectives: ['Evaluate ad recall', 'Measure brand impact'],
      researchObjectives: ['To measure campaign effectiveness'],
      targetDefinition: 'Luxury car intenders, household income $100k+',
      sampleSize: 800,
      markets: [
        { country: 'Germany', language: 'German', sampleSize: 400 },
        { country: 'USA', language: 'English', sampleSize: 400 },
      ],
    },
    author: currentUser,
    createdAt: '2024-12-10T10:00:00Z',
    updatedAt: '2024-12-11T09:00:00Z',
    versions: [],
    approvalHistory: [
      {
        id: 'approval-3',
        action: 'manager_rejected',
        by: { ...currentUser, id: 'manager-1', name: 'Team Manager', role: 'manager' },
        comment: 'Sample size too small for the target audience. Please revise.',
        timestamp: '2024-12-11T09:00:00Z',
      },
    ],
  },
  {
    id: 'proposal-6',
    status: 'on_hold',
    projectId: 'project-1',
    content: {
      title: 'Market Entry Study - Southeast Asia',
      client: 'Unilever',
      contact: 'Emma Watson',
      background: 'Evaluate market potential for new skincare line in Southeast Asian markets',
      businessObjectives: [
        'Assess market opportunity',
        'Understand competitive landscape',
        'Identify distribution channels',
      ],
      researchObjectives: [
        'To evaluate market size and potential',
        'To understand consumer preferences',
        'To identify key success factors',
      ],
      targetDefinition: 'Women 18-45, interested in skincare, SEC A/B',
      sampleSize: 2400,
      markets: [
        { country: 'Thailand', language: 'Thai', sampleSize: 600 },
        { country: 'Vietnam', language: 'Vietnamese', sampleSize: 600 },
        { country: 'Indonesia', language: 'Indonesian', sampleSize: 600 },
        { country: 'Philippines', language: 'English', sampleSize: 600 },
      ],
    },
    author: currentUser,
    createdAt: '2024-12-08T11:00:00Z',
    updatedAt: '2024-12-12T15:00:00Z',
    versions: [],
    approvalHistory: [
      {
        id: 'approval-4',
        action: 'put_on_hold',
        by: { ...currentUser, id: 'director-1', name: 'Research Director', role: 'manager' },
        comment: 'Waiting for budget confirmation from client.',
        timestamp: '2024-12-12T15:00:00Z',
      },
    ],
  },
  {
    id: 'proposal-7',
    code: 'BI-2412-0004',
    status: 'client_approved',
    projectId: 'project-3',
    content: {
      title: 'Usage & Attitude Study - Snacking',
      client: 'PepsiCo',
      contact: 'Robert Brown',
      background: 'Comprehensive U&A study to understand snacking behaviors and attitudes across demographics',
      businessObjectives: [
        'Map snacking occasions',
        'Understand brand perceptions',
        'Identify unmet needs',
      ],
      researchObjectives: [
        'To understand snacking habits and occasions',
        'To measure brand awareness and consideration',
        'To identify growth opportunities',
      ],
      burningQuestions: [
        'What drives snack choice in different occasions?',
        'How do health concerns impact snacking behavior?',
      ],
      targetDefinition: 'Adults 18-54, snack consumers (at least weekly)',
      sampleSize: 4000,
      markets: [
        { country: 'USA', language: 'English', sampleSize: 1500 },
        { country: 'UK', language: 'English', sampleSize: 1000 },
        { country: 'Mexico', language: 'Spanish', sampleSize: 750 },
        { country: 'Brazil', language: 'Portuguese', sampleSize: 750 },
      ],
      advancedAnalysis: ['Occasion Mapping', 'Segmentation', 'Brand Positioning'],
    },
    author: currentUser,
    createdAt: '2024-11-25T09:00:00Z',
    updatedAt: '2024-12-02T11:00:00Z',
    sentToClient: true,
    versions: [],
    approvalHistory: [
      {
        id: 'approval-5',
        action: 'manager_approved',
        by: { ...currentUser, id: 'director-1', name: 'Research Director', role: 'manager' },
        timestamp: '2024-12-02T11:00:00Z',
      },
    ],
  },
  {
    id: 'proposal-8',
    code: 'BI-2412-0005',
    status: 'pending_manager',
    projectId: 'project-samsung',
    content: {
      title: 'Mobile App UX Research',
      client: 'Samsung',
      contact: 'Kim Min-ji',
      background: 'Evaluate user experience of new mobile banking app features before global rollout',
      businessObjectives: [
        'Optimize user onboarding flow',
        'Improve feature discoverability',
        'Increase user retention rates',
      ],
      researchObjectives: [
        'To identify UX pain points in current app design',
        'To measure task completion rates for key features',
        'To understand user mental models for navigation',
      ],
      burningQuestions: [
        'Which features are users struggling to find?',
        'What causes users to abandon the onboarding process?',
      ],
      targetDefinition: 'Adults 18-55, smartphone users with active mobile banking accounts',
      sampleSize: 800,
      markets: [
        { country: 'South Korea', language: 'Korean', sampleSize: 400 },
        { country: 'USA', language: 'English', sampleSize: 400 },
      ],
      advancedAnalysis: ['Heuristic Evaluation', 'Task Flow Analysis', 'Eye Tracking'],
    },
    author: currentUser,
    createdAt: '2024-12-13T14:00:00Z',
    updatedAt: '2024-12-14T09:00:00Z',
    versions: [],
  },
  {
    id: 'proposal-9',
    status: 'draft',
    projectId: 'project-louis-vuitton',
    content: {
      title: 'Price Elasticity Study - Premium Segment',
      client: 'Louis Vuitton',
      contact: 'Pierre Dubois',
      background: 'Understand price sensitivity among luxury consumers for new product line pricing strategy',
      businessObjectives: [
        'Determine optimal price points',
        'Understand willingness to pay by segment',
      ],
      targetDefinition: 'High-net-worth individuals, household income $200k+, luxury brand purchasers',
      sampleSize: 500,
      markets: [
        { country: 'France', language: 'French', sampleSize: 150 },
        { country: 'USA', language: 'English', sampleSize: 150 },
        { country: 'China', language: 'Mandarin', sampleSize: 200 },
      ],
    },
    author: currentUser,
    createdAt: '2024-12-14T08:00:00Z',
    updatedAt: '2024-12-14T08:00:00Z',
    versions: [],
  },
  {
    id: 'proposal-10',
    code: 'BI-2412-0006',
    status: 'client_approved',
    projectId: 'project-microsoft',
    content: {
      title: 'Employee Engagement Survey',
      client: 'Microsoft',
      contact: 'Sarah Williams',
      background: 'Annual employee satisfaction and engagement measurement for EMEA region',
      businessObjectives: [
        'Measure employee NPS',
        'Identify areas for improvement',
        'Track year-over-year changes',
      ],
      researchObjectives: [
        'To measure overall engagement levels',
        'To identify key drivers of satisfaction',
        'To benchmark against industry standards',
      ],
      targetDefinition: 'Microsoft EMEA employees, all departments and levels',
      sampleSize: 5000,
      markets: [
        { country: 'UK', language: 'English', sampleSize: 1500 },
        { country: 'Germany', language: 'German', sampleSize: 1200 },
        { country: 'France', language: 'French', sampleSize: 1000 },
        { country: 'Netherlands', language: 'Dutch', sampleSize: 700 },
        { country: 'Ireland', language: 'English', sampleSize: 600 },
      ],
      advancedAnalysis: ['eNPS Analysis', 'Driver Analysis', 'Text Analytics'],
    },
    author: currentUser,
    createdAt: '2024-11-15T10:00:00Z',
    updatedAt: '2024-11-28T14:00:00Z',
    sentToClient: true,
    versions: [],
    approvalHistory: [
      {
        id: 'approval-6',
        action: 'manager_approved',
        by: { ...currentUser, id: 'director-1', name: 'Research Director', role: 'manager' },
        timestamp: '2024-11-28T14:00:00Z',
      },
    ],
  },
  {
    id: 'proposal-11',
    status: 'draft',
    projectId: 'project-kraft-heinz',
    content: {
      title: 'Packaging Innovation Test',
      client: 'Kraft Heinz',
      contact: 'Amanda Johnson',
      background: 'Test consumer response to 3 new sustainable packaging designs',
      businessObjectives: ['Select winning packaging concept', 'Validate sustainability messaging'],
      targetDefinition: 'Primary grocery shoppers, aged 25-65, environmentally conscious consumers',
      sampleSize: 1200,
      markets: [
        { country: 'USA', language: 'English', sampleSize: 600 },
        { country: 'Canada', language: 'English', sampleSize: 300 },
        { country: 'Canada', language: 'French', sampleSize: 300 },
      ],
    },
    author: currentUser,
    createdAt: '2024-12-13T16:00:00Z',
    updatedAt: '2024-12-13T16:00:00Z',
    versions: [],
  },
  {
    id: 'proposal-12',
    code: 'BI-2411-0007',
    status: 'client_approved',
    projectId: 'project-disney-plus',
    content: {
      title: 'Streaming Service Competitive Analysis',
      client: 'Disney+',
      contact: 'Michael Torres',
      background: 'Comprehensive competitive landscape study of streaming services market',
      businessObjectives: [
        'Understand competitive positioning',
        'Identify content gaps',
        'Map subscriber journey',
      ],
      researchObjectives: [
        'To measure brand awareness vs competitors',
        'To understand switching behavior',
        'To identify content preferences by segment',
      ],
      burningQuestions: [
        'What would make subscribers switch to Disney+?',
        'How does Disney+ compare on value perception?',
      ],
      targetDefinition: 'Adults 18-54, current streaming service subscribers (any platform)',
      sampleSize: 3000,
      markets: [
        { country: 'USA', language: 'English', sampleSize: 1500 },
        { country: 'UK', language: 'English', sampleSize: 750 },
        { country: 'Australia', language: 'English', sampleSize: 750 },
      ],
      advancedAnalysis: ['Competitive Mapping', 'MaxDiff', 'Customer Journey Analysis'],
    },
    author: currentUser,
    createdAt: '2024-11-20T09:00:00Z',
    updatedAt: '2024-12-01T15:00:00Z',
    sentToClient: true,
    versions: [],
    approvalHistory: [
      {
        id: 'approval-7',
        action: 'manager_approved',
        by: { ...currentUser, id: 'manager-1', name: 'Team Manager', role: 'manager' },
        timestamp: '2024-12-01T15:00:00Z',
      },
    ],
  },
  {
    id: 'proposal-13',
    status: 'pending_manager',
    projectId: 'project-pfizer',
    content: {
      title: 'Healthcare Provider Satisfaction Study',
      client: 'Pfizer',
      contact: 'Dr. Elizabeth Chen',
      background: 'Measure HCP satisfaction with medical rep interactions and educational resources',
      businessObjectives: [
        'Improve HCP engagement',
        'Optimize resource allocation',
        'Strengthen relationships',
      ],
      targetDefinition: 'Healthcare professionals - physicians, pharmacists, nurse practitioners',
      sampleSize: 600,
      markets: [
        { country: 'USA', language: 'English', sampleSize: 300 },
        { country: 'Germany', language: 'German', sampleSize: 150 },
        { country: 'Japan', language: 'Japanese', sampleSize: 150 },
      ],
    },
    author: currentUser,
    createdAt: '2024-12-12T11:00:00Z',
    updatedAt: '2024-12-14T10:00:00Z',
    versions: [],
  },
  {
    id: 'proposal-14',
    status: 'on_hold',
    projectId: 'project-toyota',
    content: {
      title: 'Electric Vehicle Purchase Journey',
      client: 'Toyota',
      contact: 'Yuki Tanaka',
      background: 'Map the EV purchase decision journey from awareness to purchase',
      businessObjectives: [
        'Understand EV consideration triggers',
        'Map touchpoints in purchase journey',
        'Identify barriers to EV adoption',
      ],
      targetDefinition: 'Adults 25-60, in-market for new vehicle purchase within 12 months',
      sampleSize: 2000,
      markets: [
        { country: 'Japan', language: 'Japanese', sampleSize: 800 },
        { country: 'USA', language: 'English', sampleSize: 700 },
        { country: 'Germany', language: 'German', sampleSize: 500 },
      ],
    },
    author: currentUser,
    createdAt: '2024-12-13T09:00:00Z',
    updatedAt: '2024-12-13T09:00:00Z',
    versions: [],
    approvalHistory: [
      {
        id: 'approval-8',
        action: 'put_on_hold',
        by: { ...currentUser, id: 'director-1', name: 'Research Director', role: 'manager' },
        comment: 'Budget reallocation pending Q1 planning.',
        timestamp: '2024-12-13T09:00:00Z',
      },
    ],
  },
  {
    id: 'proposal-15',
    code: 'BI-2512-0001',
    status: 'draft',
    content: {
      title: 'Holiday Season Consumer Trends',
      client: 'Amazon',
      contact: 'Jeff B.',
      background: 'Analyzing consumer spending habits and trends during the 2025 holiday season.',
      targetDefinition: 'Adults 18+, online shoppers',
      sampleSize: 2500,
      markets: [
        { country: 'USA', language: 'English', sampleSize: 1500 },
        { country: 'UK', language: 'English', sampleSize: 1000 },
      ],
    },
    author: currentUser,
    createdAt: '2025-12-05T10:00:00Z',
    updatedAt: '2025-12-05T10:00:00Z',
    versions: [],
  },
  {
    id: 'proposal-16',
    code: 'BI-2512-0002',
    status: 'client_approved',
    content: {
      title: 'New Year Fitness Resolutions',
      client: 'Nike',
      contact: 'Phil K.',
      background: 'A study to understand fitness goals and new product interests for the new year.',
      targetDefinition: 'Adults 18-40, interested in fitness',
      sampleSize: 1200,
      markets: [
        { country: 'USA', language: 'English', sampleSize: 1200 },
      ],
    },
    author: currentUser,
    createdAt: '2025-12-02T14:00:00Z',
    updatedAt: '2025-12-08T11:00:00Z',
    versions: [],
  },
  {
    id: 'proposal-17',
    code: 'BI-2512-0003',
    status: 'draft',
    content: {
      title: 'Winter Travel Intentions 2025',
      client: 'Airbnb',
      contact: 'Sarah B.',
      background: 'Understanding winter holiday travel plans and accommodation preferences.',
      targetDefinition: 'Adults 25-55, traveled internationally in past year',
      sampleSize: 1800,
      markets: [
        { country: 'USA', language: 'English', sampleSize: 600 },
        { country: 'UK', language: 'English', sampleSize: 600 },
        { country: 'Germany', language: 'German', sampleSize: 600 },
      ],
    },
    author: currentUser,
    createdAt: '2025-12-18T09:00:00Z',
    updatedAt: '2025-12-18T16:30:00Z',
    versions: [],
  },
  {
    id: 'proposal-18',
    code: 'BI-2512-0004',
    status: 'pending_manager',
    content: {
      title: 'Smart Home Tech Adoption Q1 2026',
      client: 'Google Nest',
      contact: 'Alex C.',
      background: 'Tracking adoption rates and barriers for smart home devices.',
      targetDefinition: 'Homeowners 30-60, tech-interested',
      sampleSize: 2000,
      markets: [
        { country: 'USA', language: 'English', sampleSize: 1000 },
        { country: 'Japan', language: 'Japanese', sampleSize: 1000 },
      ],
    },
    author: currentUser,
    createdAt: '2025-12-15T11:00:00Z',
    updatedAt: '2025-12-19T10:00:00Z',
    versions: [],
  },
  {
    id: 'proposal-19',
    status: 'draft',
    content: {
      title: 'Electric Vehicle Perception Study',
      client: 'Tesla',
      contact: 'Elon M.',
      background: 'Understanding consumer perceptions of EV brands and charging infrastructure.',
      targetDefinition: 'Adults 25-50, considering car purchase in next 12 months',
      sampleSize: 1500,
      markets: [
        { country: 'USA', language: 'English', sampleSize: 750 },
        { country: 'Netherlands', language: 'Dutch', sampleSize: 750 },
      ],
    },
    author: currentUser,
    createdAt: '2025-12-20T08:00:00Z',
    updatedAt: '2025-12-20T14:00:00Z',
    versions: [],
  },
  {
    id: 'proposal-20',
    code: 'BI-2512-0005',
    status: 'client_approved',
    content: {
      title: 'Year-End Brand Equity Tracker',
      client: 'Spotify',
      contact: 'Daniel E.',
      background: 'Annual brand equity measurement for streaming music services.',
      targetDefinition: 'Music listeners 16-45, use streaming services weekly',
      sampleSize: 3000,
      markets: [
        { country: 'USA', language: 'English', sampleSize: 1000 },
        { country: 'UK', language: 'English', sampleSize: 1000 },
        { country: 'Brazil', language: 'Portuguese', sampleSize: 1000 },
      ],
    },
    author: currentUser,
    createdAt: '2025-12-10T13:00:00Z',
    updatedAt: '2025-12-16T09:00:00Z',
    sentToClient: true,
    versions: [],
    approvalHistory: [
      {
        id: 'approval-20',
        action: 'manager_approved',
        by: { ...currentUser, id: 'director-2', name: 'Senior Director', role: 'manager' },
        timestamp: '2025-12-16T09:00:00Z',
      },
    ],
  },
];

const mockProjects: Project[] = [
  {
    id: 'project-1',
    name: 'BoltChatAI Credit Sales',
    description: 'Default project for credit sales and financial services research',
    client: 'Various',
    proposals: ['proposal-4', 'proposal-6'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-12-08T00:00:00Z',
    isDefault: true,
    order: 0,
  },
  {
    id: 'project-2',
    name: 'Coca-Cola 2024',
    description: 'All Coca-Cola projects for 2024',
    client: 'Coca-Cola',
    proposals: ['proposal-1'],
    createdAt: '2024-01-15T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
    order: 1,
  },
  {
    id: 'project-3',
    name: 'U&A Studies',
    description: 'Usage and Attitude research projects',
    client: 'PepsiCo',
    proposals: ['proposal-7'],
    createdAt: '2024-03-01T00:00:00Z',
    updatedAt: '2024-12-02T00:00:00Z',
    order: 2,
  },
  {
    id: 'project-samsung',
    name: 'Samsung',
    description: 'Samsung mobile and technology research projects',
    client: 'Samsung',
    proposals: ['proposal-8'],
    createdAt: '2024-06-01T00:00:00Z',
    updatedAt: '2024-12-14T00:00:00Z',
    order: 3,
  },
  {
    id: 'project-louis-vuitton',
    name: 'Louis Vuitton',
    description: 'Louis Vuitton luxury brand and pricing research projects',
    client: 'Louis Vuitton',
    proposals: ['proposal-9'],
    createdAt: '2024-07-01T00:00:00Z',
    updatedAt: '2024-12-14T00:00:00Z',
    order: 4,
  },
  {
    id: 'project-microsoft',
    name: 'Microsoft',
    description: 'Microsoft employee engagement and enterprise research projects',
    client: 'Microsoft',
    proposals: ['proposal-10'],
    createdAt: '2024-05-01T00:00:00Z',
    updatedAt: '2024-11-28T00:00:00Z',
    order: 5,
  },
  {
    id: 'project-kraft-heinz',
    name: 'Kraft Heinz',
    description: 'Kraft Heinz packaging and product innovation research projects',
    client: 'Kraft Heinz',
    proposals: ['proposal-11'],
    createdAt: '2024-08-01T00:00:00Z',
    updatedAt: '2024-12-13T00:00:00Z',
    order: 6,
  },
  {
    id: 'project-disney-plus',
    name: 'Disney+',
    description: 'Disney+ streaming service and content research projects',
    client: 'Disney+',
    proposals: ['proposal-12'],
    createdAt: '2024-04-01T00:00:00Z',
    updatedAt: '2024-12-01T00:00:00Z',
    order: 7,
  },
  {
    id: 'project-pfizer',
    name: 'Pfizer',
    description: 'Pfizer healthcare provider and pharmaceutical research projects',
    client: 'Pfizer',
    proposals: ['proposal-13'],
    createdAt: '2024-09-01T00:00:00Z',
    updatedAt: '2024-12-14T00:00:00Z',
    order: 8,
  },
  {
    id: 'project-toyota',
    name: 'Toyota',
    description: 'Toyota automotive and electric vehicle research projects',
    client: 'Toyota',
    proposals: ['proposal-14'],
    createdAt: '2024-10-01T00:00:00Z',
    updatedAt: '2024-12-13T00:00:00Z',
    order: 9,
  },
];

const mockLibraryItems: LibraryItem[] = [
  // Templates
  {
    id: 'template-1',
    name: 'Brand Health Tracking Template',
    description: 'Standard template for brand awareness, perception, and NPS studies',
    url: '/templates/brand-health',
    category: 'template',
    tags: ['brand', 'tracking', 'NPS'],
    createdAt: '2024-01-15T00:00:00Z',
  },
  {
    id: 'template-2',
    name: 'Customer Satisfaction Survey Template',
    description: 'CSAT and customer experience measurement template',
    url: '/templates/csat',
    category: 'template',
    tags: ['CSAT', 'customer experience', 'satisfaction'],
    createdAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'template-3',
    name: 'Concept Testing Template',
    description: 'Template for new product/concept evaluation studies',
    url: '/templates/concept-test',
    category: 'template',
    tags: ['concept', 'product', 'innovation'],
    createdAt: '2024-02-15T00:00:00Z',
  },
  {
    id: 'template-4',
    name: 'U&A Study Template',
    description: 'Usage and Attitude study template with standard modules',
    url: '/templates/ua-study',
    category: 'template',
    tags: ['U&A', 'usage', 'attitude'],
    createdAt: '2024-03-01T00:00:00Z',
  },
  {
    id: 'template-5',
    name: 'Ad Testing Template',
    description: 'Creative and advertising effectiveness testing template',
    url: '/templates/ad-test',
    category: 'template',
    tags: ['advertising', 'creative', 'testing'],
    createdAt: '2024-03-15T00:00:00Z',
  },
  {
    id: 'template-6',
    name: 'Price Sensitivity Template',
    description: 'Van Westendorp and Gabor-Granger pricing research template',
    url: '/templates/pricing',
    category: 'template',
    tags: ['pricing', 'Van Westendorp', 'Gabor-Granger'],
    createdAt: '2024-04-01T00:00:00Z',
  },
  // Methodologies
  {
    id: 'method-1',
    name: 'MaxDiff Analysis Guide',
    description: 'Best practices for MaxDiff design and analysis',
    url: '/methodologies/maxdiff',
    category: 'methodology',
    tags: ['MaxDiff', 'preference', 'analysis'],
    createdAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'method-2',
    name: 'Conjoint Analysis Handbook',
    description: 'Complete guide to conjoint analysis for product optimization',
    url: '/methodologies/conjoint',
    category: 'methodology',
    tags: ['conjoint', 'choice modeling', 'optimization'],
    createdAt: '2024-02-10T00:00:00Z',
  },
  {
    id: 'method-3',
    name: 'Segmentation Best Practices',
    description: 'Guidelines for market segmentation studies',
    url: '/methodologies/segmentation',
    category: 'methodology',
    tags: ['segmentation', 'clustering', 'targeting'],
    createdAt: '2024-03-05T00:00:00Z',
  },
  // Videos
  {
    id: 'video-1',
    name: 'BoltInsight Platform Tutorial',
    description: 'Complete walkthrough of the proposal creation process',
    url: '/videos/platform-tutorial',
    category: 'video',
    tags: ['tutorial', 'training', 'onboarding'],
    createdAt: '2024-04-01T00:00:00Z',
  },
  {
    id: 'video-2',
    name: 'Sample Size Calculator Demo',
    description: 'How to use the margin of error calculator effectively',
    url: '/videos/sample-size-demo',
    category: 'video',
    tags: ['sample size', 'MOE', 'calculator'],
    createdAt: '2024-04-15T00:00:00Z',
  },
  // External Links
  {
    id: 'link-1',
    name: 'ESOMAR Guidelines',
    description: 'International standards for market research ethics',
    url: 'https://www.esomar.org/codes-and-guidelines',
    category: 'external_link',
    tags: ['ethics', 'standards', 'ESOMAR'],
    createdAt: '2024-01-01T00:00:00Z',
  },
  {
    id: 'link-2',
    name: 'Survey Design Best Practices',
    description: 'Qualtrics guide to effective survey design',
    url: 'https://www.qualtrics.com/experience-management/research/survey-design/',
    category: 'external_link',
    tags: ['survey', 'design', 'best practices'],
    createdAt: '2024-02-01T00:00:00Z',
  },
];

// Mock notifications for approval requests
const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'submitted_to_manager',
    title: 'New Approval Request',
    message: 'Demo User sent you "Concept Testing - New Product Line" for approval',
    proposalId: 'proposal-3',
    proposalTitle: 'Concept Testing - New Product Line',
    fromUser: currentUser,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 min ago
  },
  {
    id: 'notif-2',
    type: 'submitted_to_manager',
    title: 'New Approval Request',
    message: 'Demo User sent you "Mobile App UX Research" for approval',
    proposalId: 'proposal-8',
    proposalTitle: 'Mobile App UX Research',
    fromUser: currentUser,
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
  },
  {
    id: 'notif-3',
    type: 'manager_approved',
    title: 'Proposal Approved',
    message: 'Your proposal "Brand Health Tracking Q1 2025" was approved by Team Manager',
    proposalId: 'proposal-1',
    proposalTitle: 'Brand Health Tracking Q1 2025',
    fromUser: { ...currentUser, id: 'manager-1', name: 'Team Manager', role: 'manager' },
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
  },
  {
    id: 'notif-4',
    type: 'manager_rejected',
    title: 'Proposal Rejected',
    message: 'Your proposal "Ad Effectiveness Study" was rejected by Team Manager. Reason: Sample size too small.',
    proposalId: 'proposal-5',
    proposalTitle: 'Ad Effectiveness Study',
    fromUser: { ...currentUser, id: 'manager-1', name: 'Team Manager', role: 'manager' },
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
  },
];

// Mock ChatProjects for the ChatGPT-style Projects system
const mockChatProjects: ChatProject[] = [
  {
    id: 'chat-project-1',
    name: 'Coca-Cola Brand Research',
    description: 'All brand tracking and health studies for Coca-Cola 2025',
    color: '#EB3F5F',
    icon: '🥤',
    instructions: 'Focus on brand health metrics, NPS tracking, and competitive analysis. Always reference previous Coca-Cola studies when providing recommendations.',
    files: [
      {
        id: 'file-1',
        name: 'Brand Guidelines 2025.pdf',
        type: 'document',
        size: 2500000,
        url: '/files/brand-guidelines.pdf',
        description: 'Official Coca-Cola brand guidelines',
        tags: ['brand', 'guidelines'],
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7).toISOString(),
        uploadedBy: 'user-1',
      },
    ],
    owner: currentUser,
    collaborators: [
      {
        id: 'collab-1',
        user: { id: 'user-2', name: 'Sarah Johnson', email: 'sarah@boltinsight.com', role: 'researcher' },
        role: 'editor',
        status: 'online',
        joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      },
    ],
    conversations: [
      {
        id: 'conv-1',
        title: 'Q1 2025 Brand Health Study Setup',
        messages: [
          {
            id: 'msg-1',
            role: 'user',
            content: 'I need to set up the Q1 2025 brand health tracking study for Coca-Cola. Can you help me with the sample size recommendations?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
          },
          {
            id: 'msg-2',
            role: 'assistant',
            content: 'Based on our previous Coca-Cola brand tracking studies and the target markets (USA and UK), I recommend:\n\n**Sample Size Recommendations:**\n- USA: 500 respondents (±4.4% margin of error at 95% CI)\n- UK: 500 respondents (±4.4% margin of error at 95% CI)\n\n**Total: 1,000 respondents**\n\nThis maintains consistency with the Q4 2024 study and allows for reliable trend analysis. Would you like me to help with the quota specifications?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2 + 30000).toISOString(),
            metadata: { model: 'gpt-4', tokens: 150 },
          },
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2 + 30000).toISOString(),
        linkedProposalIds: ['proposal-1'],
      },
    ],
    proposals: [
      { id: 'proposal-1', title: 'Brand Health Tracking Q1 2025', status: 'client_approved', linkedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString() },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    isPinned: true,
    isArchived: false,
  },
  {
    id: 'chat-project-2',
    name: 'FMCG Segmentation Studies',
    description: 'Consumer segmentation research for FMCG clients',
    color: '#5B50BD',
    icon: '🎯',
    instructions: 'Specialize in consumer segmentation, cluster analysis, and targeting strategies. Reference industry benchmarks and best practices.',
    files: [],
    owner: currentUser,
    collaborators: [],
    conversations: [
      {
        id: 'conv-2',
        title: 'Danone Segmentation Approach',
        messages: [
          {
            id: 'msg-3',
            role: 'user',
            content: 'What segmentation methodology would you recommend for the Danone yogurt study?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          },
          {
            id: 'msg-4',
            role: 'assistant',
            content: 'For the Danone yogurt segmentation study, I recommend a **hybrid segmentation approach**:\n\n1. **Attitudinal Segmentation** - Primary basis\n   - Health consciousness attitudes\n   - Taste vs. nutrition trade-offs\n   - Sustainability concerns\n\n2. **Behavioral Overlay**\n   - Purchase frequency\n   - Brand switching patterns\n   - Occasion-based consumption\n\n3. **Recommended Techniques:**\n   - Latent Class Analysis (LCA) for identifying segments\n   - Discriminant analysis for profiling\n   - MaxDiff for preference prioritization\n\nShall I draft the specific attitude battery questions?',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 + 45000).toISOString(),
            metadata: { model: 'gpt-4', tokens: 200 },
          },
        ],
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
        updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 + 45000).toISOString(),
        linkedProposalIds: ['proposal-2'],
      },
    ],
    proposals: [
      { id: 'proposal-2', title: 'Consumer Segmentation Study', status: 'draft', linkedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    isPinned: false,
    isArchived: false,
  },
  {
    id: 'chat-project-3',
    name: 'UX Research Templates',
    description: 'Standard templates and frameworks for UX research projects',
    color: '#1ED6BB',
    icon: '📱',
    instructions: 'Focus on UX research methodologies, usability testing, and user journey mapping. Provide practical frameworks and templates.',
    files: [
      {
        id: 'file-2',
        name: 'UX Research Framework.docx',
        type: 'document',
        size: 150000,
        url: '/files/ux-framework.docx',
        description: 'Standard UX research framework',
        tags: ['UX', 'framework', 'template'],
        uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
        uploadedBy: 'user-1',
      },
    ],
    owner: currentUser,
    collaborators: [
      {
        id: 'collab-2',
        user: { id: 'user-3', name: 'Mike Chen', email: 'mike@boltinsight.com', role: 'researcher' },
        role: 'viewer',
        status: 'offline',
        joinedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3).toISOString(),
        lastActiveAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
    ],
    conversations: [],
    proposals: [
      { id: 'proposal-8', title: 'Mobile App UX Research', status: 'pending_manager', linkedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString() },
    ],
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    lastActivityAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    isPinned: true,
    isArchived: false,
  },
];

// Dashboard widget configuration
export type WidgetSize = number; // 1-12 column span for 12-column grid

export interface WidgetLayout {
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  minH?: number;
}

export interface DashboardWidgetConfig {
  id: string;
  name: string;
  visible: boolean;
  order: number;
  size: WidgetSize; // Column span (1-12)
  height?: number; // Height in pixels (auto if not set)
  layout?: WidgetLayout; // Grid layout position
}

// Quick Action configuration
export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string; // navigation target or action type
  color: string;
  order: number;
}

export interface SearchPreset {
  scope?: 'my' | 'all';
  status?: ProposalStatus;
  dateRangeDays?: number;
  query?: string;
}

export interface DashboardConfig {
  widgets: DashboardWidgetConfig[];
  quickActions: QuickAction[];
  layoutLocked: boolean; // Lock widget positions and sizes
}

const defaultQuickActions: QuickAction[] = [
  { id: 'qa-1', label: 'New Proposal', icon: 'Plus', action: 'new-proposal', color: '#5B50BD', order: 0 },
  { id: 'qa-2', label: 'My Proposals', icon: 'FileText', action: 'search-my', color: '#1ED6BB', order: 1 },
  { id: 'qa-3', label: 'Calculators', icon: 'Calculator', action: 'calculators', color: '#F59E0B', order: 2 },
  { id: 'qa-4', label: 'Library', icon: 'BookOpen', action: 'library', color: '#EC4899', order: 3 },
];

const defaultDashboardConfig: DashboardConfig = {
  widgets: [
    // Row 0: Quick Actions (full width)
    { id: 'quick-actions', name: 'Quick Actions', visible: true, order: 0, size: 24, height: 100, layout: { x: 0, y: 0, w: 24, h: 1 } },
    // Row 1: Stats Overview (full width)
    { id: 'stats-grid', name: 'Stats', visible: true, order: 1, size: 24, height: 100, layout: { x: 0, y: 1, w: 24, h: 1 } },
    // Row 2-3: Recent Proposals (12) + Notifications (12)
    { id: 'recent-proposals', name: 'Recent Proposals', visible: true, order: 2, size: 12, height: 200, layout: { x: 0, y: 2, w: 12, h: 2 } },
    { id: 'notifications-log', name: 'Notifications', visible: true, order: 3, size: 12, height: 200, layout: { x: 12, y: 2, w: 12, h: 2 } },
    // Row 4-5: Shared with Me (12) + Recent Activity (12)
    { id: 'shared-with-me', name: 'Shared with Me', visible: true, order: 4, size: 12, height: 200, layout: { x: 0, y: 4, w: 12, h: 2 } },
    { id: 'recent-activity', name: 'Recent Activity', visible: true, order: 5, size: 12, height: 200, layout: { x: 12, y: 4, w: 12, h: 2 } },
    // Row 6-7: Pending Approvals (12) + Approval Requests (12)
    { id: 'pending-approvals', name: 'Pending Approvals', visible: true, order: 6, size: 12, height: 200, layout: { x: 0, y: 6, w: 12, h: 2 } },
    { id: 'approval-requests', name: 'Approval Requests', visible: true, order: 7, size: 12, height: 200, layout: { x: 12, y: 6, w: 12, h: 2 } },
    // Row 8: Quick Stats (full width)
    { id: 'quick-stats', name: 'Quick Stats', visible: true, order: 8, size: 24, height: 100, layout: { x: 0, y: 8, w: 24, h: 1 } },
  ],
  quickActions: defaultQuickActions,
  layoutLocked: false,
};

export type CalendarTaskType = 'meeting' | 'task' | 'reminder' | 'deadline';
export type CalendarTaskPriority = 'low' | 'medium' | 'high';

export interface CalendarTask {
  id: string;
  date: string;
  title: string;
  assignee: string;
  time?: string;
  endTime?: string;
  type: CalendarTaskType;
  priority: CalendarTaskPriority;
  link?: string;
  notes?: string;
  completed?: boolean;
}

interface AppState {
  // Current user
  currentUser: User;

  // Proposals
  proposals: Proposal[];
  currentProposal: Proposal | null;

  // Projects (legacy)
  projects: Project[];
  currentProject: Project | null;

  // ChatGPT-style Projects
  chatProjects: ChatProject[];
  currentChatProject: ChatProject | null;
  currentConversation: ProjectConversation | null;
  isChatProjectTyping: boolean;

  // Chat (per-proposal)
  proposalChats: Record<string, ChatMessage[]>;
  isAiTyping: boolean;
  activeProposalChatId: string | null;

  // Library
  libraryItems: LibraryItem[];

  // Notifications
  notifications: Notification[];

  // Calendar
  calendarTasks: CalendarTask[];

  // Dashboard helpers
  pinnedProposalIds: string[];
  searchPreset: SearchPreset | null;
  showAdminButton: boolean;
  showHelpButton: boolean;

  // History items state (for meta learning, calculator chats)
  archivedHistoryItems: { id: string; type: string; title: string; timestamp: string }[];
  pinnedHistoryItems: string[];

  // Filters
  metaLearningFilter: MetaLearningFilter;

  // Dashboard config
  dashboardConfig: DashboardConfig;

  // UI State
  sidebarOpen: boolean;
  sidebarCollapsed: boolean;
  sidebarWidth: number;
  rightSidebarCollapsed: boolean;
  activeSection: string;
  isLoggedIn: boolean;
  showCreateProjectModal: boolean;
  showSettingsModal: boolean;

  // Onboarding
  onboardingCompleted: boolean;

  // User Preferences
  defaultEditorMode: 'chat' | 'editor';

  // Actions
  setCurrentUser: (user: User) => void;

  // Proposal actions
  addProposal: (proposal: Omit<Proposal, 'id' | 'createdAt' | 'updatedAt' | 'versions'>) => Proposal;
  updateProposal: (id: string, updates: Partial<Proposal>) => void;
  deleteProposal: (id: string) => void;
  setCurrentProposal: (proposal: Proposal | null) => void;
  // Workflow Actions
  submitToManager: (proposalId: string, managerId: string, comment?: string) => void;
  managerApprove: (proposalId: string, comment?: string) => void;
  managerReject: (proposalId: string, comment: string) => void;
  submitToClient: (proposalId: string, clientEmail: string, comment?: string) => void;
  clientApprove: (proposalId: string, comment?: string) => void;
  clientReject: (proposalId: string, comment: string) => void;
  putOnHold: (proposalId: string, comment: string) => void;
  requestRevision: (proposalId: string, comment: string) => void;
  reopenProposal: (proposalId: string) => void;
  // Legacy (kept for backward compatibility)
  submitForApproval: (id: string, approver: User) => void;
  updateProposalStatus: (id: string, status: ProposalStatus, comment?: string) => void;
  addCollaborator: (proposalId: string, collaborator: User) => void;
  removeCollaborator: (proposalId: string, collaboratorId: string) => void;
  addProposalActivity: (proposalId: string, activity: { type: string; description: string; details?: Record<string, unknown> }) => void;

  // Project actions (legacy)
  addProject: (project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) => Project;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: Project | null) => void;
  moveProposalToProject: (proposalId: string, projectId: string) => void;
  reorderProjects: (dragId: string, dropId: string, position: 'before' | 'after' | 'inside') => void;
  moveProjectToParent: (projectId: string, parentId: string | null) => void;
  getNestedProjects: () => NestedProject[];

  // ChatGPT-style Project actions
  addChatProject: (project: Omit<ChatProject, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'conversations' | 'files' | 'collaborators' | 'proposals'>) => ChatProject;
  updateChatProject: (id: string, updates: Partial<ChatProject>) => void;
  deleteChatProject: (id: string) => void;
  archiveChatProject: (id: string) => void;
  unarchiveChatProject: (id: string) => void;
  pinChatProject: (id: string) => void;
  unpinChatProject: (id: string) => void;
  setCurrentChatProject: (project: ChatProject | null) => void;

  // Conversation actions
  addConversation: (projectId: string, title?: string) => ProjectConversation;
  updateConversation: (projectId: string, conversationId: string, updates: Partial<ProjectConversation>) => void;
  deleteConversation: (projectId: string, conversationId: string) => void;
  archiveConversation: (projectId: string, conversationId: string) => void;
  setCurrentConversation: (conversation: ProjectConversation | null) => void;

  // Message actions
  addProjectMessage: (projectId: string, conversationId: string, message: Omit<ProjectMessage, 'id' | 'timestamp'>) => ProjectMessage;
  updateProjectMessage: (projectId: string, conversationId: string, messageId: string, content: string) => void;
  deleteProjectMessage: (projectId: string, conversationId: string, messageId: string) => void;
  setChatProjectTyping: (typing: boolean) => void;

  // Project file actions
  addProjectFile: (projectId: string, file: Omit<ProjectFile, 'id' | 'uploadedAt'>) => void;
  deleteProjectFile: (projectId: string, fileId: string) => void;

  // Project collaborator actions
  addProjectCollaborator: (projectId: string, collaborator: Omit<ProjectCollaborator, 'id' | 'joinedAt' | 'lastActiveAt'>) => void;
  updateProjectCollaborator: (projectId: string, collaboratorId: string, updates: Partial<ProjectCollaborator>) => void;
  removeProjectCollaborator: (projectId: string, collaboratorId: string) => void;

  // Link proposal to project
  linkProposalToChatProject: (projectId: string, proposal: ProposalRef) => void;
  unlinkProposalFromChatProject: (projectId: string, proposalId: string) => void;

  // Getters
  getChatProjectsByFilter: (filter: { pinned?: boolean; archived?: boolean }) => ChatProject[];

  // Chat actions (per-proposal)
  getProposalChat: (proposalId: string) => ChatMessage[];
  addChatMessage: (proposalId: string, message: Omit<ChatMessage, 'id' | 'timestamp'>) => void;
  clearProposalChat: (proposalId: string) => void;
  setActiveProposalChatId: (proposalId: string | null) => void;
  setAiTyping: (typing: boolean) => void;

  // Library actions
  addLibraryItem: (item: Omit<LibraryItem, 'id' | 'createdAt'>) => void;
  deleteLibraryItem: (id: string) => void;

  // Notification actions
  addNotification: (notification: Omit<Notification, 'id' | 'createdAt'>) => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  getUnreadNotificationCount: () => number;
  getPendingApprovals: () => Notification[];

  // Calendar actions
  updateCalendarTasks: (tasks: CalendarTask[]) => void;

  // Dashboard helpers
  pinProposal: (id: string) => void;
  unpinProposal: (id: string) => void;

  // History items actions
  archiveHistoryItem: (item: { id: string; type: string; title: string; timestamp: string }) => void;
  unarchiveHistoryItem: (id: string) => void;
  pinHistoryItem: (id: string) => void;
  unpinHistoryItem: (id: string) => void;
  setSearchPreset: (preset: SearchPreset | null) => void;
  setShowAdminButton: (visible: boolean) => void;
  setShowHelpButton: (visible: boolean) => void;

  // Filter actions
  setMetaLearningFilter: (filter: MetaLearningFilter) => void;
  clearMetaLearningFilter: () => void;

  // Dashboard config actions
  updateDashboardWidget: (widgetId: string, updates: Partial<DashboardWidgetConfig>) => void;
  updateWidgetLayouts: (layouts: { id: string; layout: WidgetLayout }[]) => void;
  reorderDashboardWidgets: (widgets: DashboardWidgetConfig[]) => void;
  resetDashboardConfig: () => void;
  toggleLayoutLock: () => void;
  setLayoutLock: (locked: boolean) => void;

  // Quick actions
  addQuickAction: (action: Omit<QuickAction, 'id' | 'order'>) => void;
  updateQuickAction: (id: string, updates: Partial<QuickAction>) => void;
  deleteQuickAction: (id: string) => void;
  reorderQuickActions: (actions: QuickAction[]) => void;

  // UI actions
  setSidebarOpen: (open: boolean) => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  setSidebarWidth: (width: number) => void;
  setRightSidebarCollapsed: (collapsed: boolean) => void;
  setActiveSection: (section: string) => void;
  setLoggedIn: (loggedIn: boolean) => void;
  setShowCreateProjectModal: (show: boolean) => void;
  setShowSettingsModal: (show: boolean) => void;

  // Onboarding actions
  setOnboardingCompleted: (completed: boolean) => void;

  // Preference actions
  setDefaultEditorMode: (mode: 'chat' | 'editor') => void;

  // Search
  searchProposals: (query: string, searchAll: boolean) => Proposal[];
  getFilteredProposals: () => Proposal[];

  // Coworking State
  coworkingSessions: CoworkingSession[];
  activeCoworkingSessionId: string | null;
  coworkingInvites: SessionInvite[];

  // Coworking Session Actions
  createCoworkingSession: (session: Omit<CoworkingSession, 'id' | 'createdAt' | 'updatedAt' | 'lastActivityAt' | 'collaborators' | 'comments' | 'messages'>) => string;
  updateCoworkingSession: (sessionId: string, updates: Partial<CoworkingSession>) => void;
  deleteCoworkingSession: (sessionId: string) => void;
  archiveCoworkingSession: (sessionId: string) => void;
  setActiveCoworkingSession: (sessionId: string | null) => void;
  getCoworkingSession: (sessionId: string) => CoworkingSession | undefined;
  getCoworkingSessionsByType: (type: SessionType) => CoworkingSession[];

  // Coworking Collaborator Actions
  addSessionCollaborator: (sessionId: string, collaborator: Omit<SessionCollaborator, 'id' | 'joinedAt' | 'lastActiveAt'>) => void;
  updateSessionCollaborator: (sessionId: string, collaboratorId: string, updates: Partial<SessionCollaborator>) => void;
  removeSessionCollaborator: (sessionId: string, collaboratorId: string) => void;
  setSessionCollaboratorStatus: (sessionId: string, collaboratorId: string, status: 'online' | 'offline' | 'away') => void;
  setSessionCollaboratorTyping: (sessionId: string, collaboratorId: string, isTyping: boolean) => void;

  // Coworking Message Actions
  addSessionMessage: (sessionId: string, message: Omit<SessionMessage, 'id' | 'timestamp'>) => void;
  updateSessionMessage: (sessionId: string, messageId: string, updates: Partial<SessionMessage>) => void;
  deleteSessionMessage: (sessionId: string, messageId: string) => void;

  // Coworking Comment Actions
  addSessionComment: (sessionId: string, comment: Omit<SessionComment, 'id' | 'timestamp'>) => void;
  updateSessionComment: (sessionId: string, commentId: string, updates: Partial<SessionComment>) => void;
  deleteSessionComment: (sessionId: string, commentId: string) => void;
  resolveSessionComment: (sessionId: string, commentId: string, resolved: boolean) => void;
  getSessionComments: (sessionId: string, messageId?: string) => SessionComment[];

  // Coworking Share Actions
  generateSessionShareLink: (sessionId: string) => string;
  updateSessionAccessLevel: (sessionId: string, accessLevel: AccessLevel) => void;

  // Coworking Invite Actions
  createSessionInvite: (invite: Omit<SessionInvite, 'id' | 'createdAt'>) => void;
  respondToSessionInvite: (inviteId: string, response: 'accepted' | 'declined') => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      currentUser,
      proposals: mockProposals,
      currentProposal: null,
      projects: mockProjects,
      currentProject: null,
      chatProjects: mockChatProjects,
      currentChatProject: null,
      currentConversation: null,
      isChatProjectTyping: false,
      proposalChats: {},
      isAiTyping: false,
      activeProposalChatId: null,
      libraryItems: mockLibraryItems,
      notifications: mockNotifications,
      calendarTasks: [],
      pinnedProposalIds: ['proposal-1', 'proposal-4', 'proposal-7'],
      searchPreset: null,
      showAdminButton: true,
      archivedHistoryItems: [],
      pinnedHistoryItems: [],
      showHelpButton: true,
      metaLearningFilter: {},
      dashboardConfig: defaultDashboardConfig,
      sidebarOpen: true,
      sidebarCollapsed: false,
      sidebarWidth: 288,
      rightSidebarCollapsed: false,
      activeSection: 'dashboard',
      isLoggedIn: false,
      showCreateProjectModal: false,
      showSettingsModal: false,
      onboardingCompleted: false,
      defaultEditorMode: 'chat',

      // Coworking initial state
      coworkingSessions: [],
      activeCoworkingSessionId: null,
      coworkingInvites: [],

      setCurrentUser: (user) => set({ currentUser: user }),

      // Proposal actions
      addProposal: (proposalData) => {
        const newProposal: Proposal = {
          ...proposalData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          versions: [],
        };
        set((state) => ({
          proposals: [...state.proposals, newProposal],
        }));
        return newProposal;
      },

      updateProposal: (id, updates) => {
        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
          currentProposal:
            state.currentProposal?.id === id
              ? { ...state.currentProposal, ...updates, updatedAt: new Date().toISOString() }
              : state.currentProposal,
        }));
      },

      deleteProposal: (id) => {
        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === id ? { ...p, status: 'deleted' as ProposalStatus } : p
          ),
        }));
      },

      setCurrentProposal: (proposal) => set({ currentProposal: proposal }),

      // ============ WORKFLOW ACTIONS ============

      submitToManager: (proposalId, managerId, comment) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal) return;

        const code = proposal.code || generateProposalCode();
        const currentUser = get().currentUser;
        const manager = teamMembers.find(m => m.id === managerId);

        const approvalRecord: ApprovalRecord = {
          id: uuidv4(),
          action: 'submitted_to_manager',
          by: currentUser,
          to: manager,
          comment,
          timestamp: new Date().toISOString(),
          previousStatus: proposal.status,
        };

        const notification: Notification = {
          id: uuidv4(),
          type: 'submitted_to_manager',
          title: 'New Proposal for Review',
          message: `${currentUser.name} submitted "${proposal.content.title || 'Untitled Proposal'}" for your approval`,
          proposalId,
          proposalTitle: proposal.content.title || 'Untitled Proposal',
          fromUser: currentUser,
          read: false,
          createdAt: new Date().toISOString(),
        };

        const updatedProposal = {
          ...proposal,
          code,
          status: 'pending_manager' as ProposalStatus,
          approvalHistory: [...(proposal.approvalHistory || []), approvalRecord],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          proposals: state.proposals.map((p) => p.id === proposalId ? updatedProposal : p),
          currentProposal: state.currentProposal?.id === proposalId ? updatedProposal : state.currentProposal,
          notifications: [notification, ...state.notifications],
        }));
      },

      managerApprove: (proposalId, comment) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal) return;

        const currentUser = get().currentUser;

        const approvalRecord: ApprovalRecord = {
          id: uuidv4(),
          action: 'manager_approved',
          by: currentUser,
          comment,
          timestamp: new Date().toISOString(),
          previousStatus: proposal.status,
        };

        const notification: Notification = {
          id: uuidv4(),
          type: 'manager_approved',
          title: 'Proposal Approved by Manager',
          message: `${currentUser.name} approved your proposal "${proposal.content.title || 'Untitled Proposal'}"${comment ? `. Note: ${comment}` : ''}`,
          proposalId,
          proposalTitle: proposal.content.title || 'Untitled Proposal',
          fromUser: currentUser,
          read: false,
          createdAt: new Date().toISOString(),
        };

        const updatedProposal = {
          ...proposal,
          status: 'manager_approved' as ProposalStatus,
          approvalHistory: [...(proposal.approvalHistory || []), approvalRecord],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          proposals: state.proposals.map((p) => p.id === proposalId ? updatedProposal : p),
          currentProposal: state.currentProposal?.id === proposalId ? updatedProposal : state.currentProposal,
          notifications: [notification, ...state.notifications],
        }));
      },

      managerReject: (proposalId, comment) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal) return;

        const currentUser = get().currentUser;

        const approvalRecord: ApprovalRecord = {
          id: uuidv4(),
          action: 'manager_rejected',
          by: currentUser,
          comment,
          timestamp: new Date().toISOString(),
          previousStatus: proposal.status,
        };

        const notification: Notification = {
          id: uuidv4(),
          type: 'manager_rejected',
          title: 'Proposal Rejected by Manager',
          message: `${currentUser.name} rejected your proposal "${proposal.content.title || 'Untitled Proposal'}". Reason: ${comment}`,
          proposalId,
          proposalTitle: proposal.content.title || 'Untitled Proposal',
          fromUser: currentUser,
          read: false,
          createdAt: new Date().toISOString(),
        };

        const updatedProposal = {
          ...proposal,
          status: 'manager_rejected' as ProposalStatus,
          approvalHistory: [...(proposal.approvalHistory || []), approvalRecord],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          proposals: state.proposals.map((p) => p.id === proposalId ? updatedProposal : p),
          currentProposal: state.currentProposal?.id === proposalId ? updatedProposal : state.currentProposal,
          notifications: [notification, ...state.notifications],
        }));
      },

      submitToClient: (proposalId, clientEmail, comment) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal) return;

        const currentUser = get().currentUser;

        const approvalRecord: ApprovalRecord = {
          id: uuidv4(),
          action: 'submitted_to_client',
          by: currentUser,
          comment,
          timestamp: new Date().toISOString(),
          previousStatus: proposal.status,
        };

        const notification: Notification = {
          id: uuidv4(),
          type: 'submitted_to_client',
          title: 'Proposal Sent to Client',
          message: `"${proposal.content.title || 'Untitled Proposal'}" has been sent to client (${clientEmail}) for approval`,
          proposalId,
          proposalTitle: proposal.content.title || 'Untitled Proposal',
          fromUser: currentUser,
          read: false,
          createdAt: new Date().toISOString(),
        };

        const updatedProposal = {
          ...proposal,
          status: 'pending_client' as ProposalStatus,
          sentToClient: true,
          approvalHistory: [...(proposal.approvalHistory || []), approvalRecord],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          proposals: state.proposals.map((p) => p.id === proposalId ? updatedProposal : p),
          currentProposal: state.currentProposal?.id === proposalId ? updatedProposal : state.currentProposal,
          notifications: [notification, ...state.notifications],
        }));
      },

      clientApprove: (proposalId, comment) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal) return;

        const currentUser = get().currentUser;

        const approvalRecord: ApprovalRecord = {
          id: uuidv4(),
          action: 'client_approved',
          by: currentUser, // In real app, this would be the client user
          comment,
          timestamp: new Date().toISOString(),
          previousStatus: proposal.status,
        };

        const notification: Notification = {
          id: uuidv4(),
          type: 'client_approved',
          title: 'Proposal Approved by Client!',
          message: `Client approved your proposal "${proposal.content.title || 'Untitled Proposal'}"${comment ? `. Note: ${comment}` : ''}`,
          proposalId,
          proposalTitle: proposal.content.title || 'Untitled Proposal',
          fromUser: currentUser,
          read: false,
          createdAt: new Date().toISOString(),
        };

        const updatedProposal = {
          ...proposal,
          status: 'client_approved' as ProposalStatus,
          approvalHistory: [...(proposal.approvalHistory || []), approvalRecord],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          proposals: state.proposals.map((p) => p.id === proposalId ? updatedProposal : p),
          currentProposal: state.currentProposal?.id === proposalId ? updatedProposal : state.currentProposal,
          notifications: [notification, ...state.notifications],
        }));
      },

      clientReject: (proposalId, comment) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal) return;

        const currentUser = get().currentUser;

        const approvalRecord: ApprovalRecord = {
          id: uuidv4(),
          action: 'client_rejected',
          by: currentUser, // In real app, this would be the client user
          comment,
          timestamp: new Date().toISOString(),
          previousStatus: proposal.status,
        };

        const notification: Notification = {
          id: uuidv4(),
          type: 'client_rejected',
          title: 'Proposal Rejected by Client',
          message: `Client rejected your proposal "${proposal.content.title || 'Untitled Proposal'}". Reason: ${comment}`,
          proposalId,
          proposalTitle: proposal.content.title || 'Untitled Proposal',
          fromUser: currentUser,
          read: false,
          createdAt: new Date().toISOString(),
        };

        const updatedProposal = {
          ...proposal,
          status: 'client_rejected' as ProposalStatus,
          approvalHistory: [...(proposal.approvalHistory || []), approvalRecord],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          proposals: state.proposals.map((p) => p.id === proposalId ? updatedProposal : p),
          currentProposal: state.currentProposal?.id === proposalId ? updatedProposal : state.currentProposal,
          notifications: [notification, ...state.notifications],
        }));
      },

      putOnHold: (proposalId, comment) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal) return;

        const currentUser = get().currentUser;

        const approvalRecord: ApprovalRecord = {
          id: uuidv4(),
          action: 'put_on_hold',
          by: currentUser,
          comment,
          timestamp: new Date().toISOString(),
          previousStatus: proposal.status,
        };

        const notification: Notification = {
          id: uuidv4(),
          type: 'put_on_hold',
          title: 'Proposal Put On Hold',
          message: `${currentUser.name} put "${proposal.content.title || 'Untitled Proposal'}" on hold. Reason: ${comment}`,
          proposalId,
          proposalTitle: proposal.content.title || 'Untitled Proposal',
          fromUser: currentUser,
          read: false,
          createdAt: new Date().toISOString(),
        };

        const updatedProposal = {
          ...proposal,
          status: 'on_hold' as ProposalStatus,
          approvalHistory: [...(proposal.approvalHistory || []), approvalRecord],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          proposals: state.proposals.map((p) => p.id === proposalId ? updatedProposal : p),
          currentProposal: state.currentProposal?.id === proposalId ? updatedProposal : state.currentProposal,
          notifications: [notification, ...state.notifications],
        }));
      },

      requestRevision: (proposalId, comment) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal) return;

        const currentUser = get().currentUser;

        const approvalRecord: ApprovalRecord = {
          id: uuidv4(),
          action: 'revision_requested',
          by: currentUser,
          comment,
          timestamp: new Date().toISOString(),
          previousStatus: proposal.status,
        };

        const notification: Notification = {
          id: uuidv4(),
          type: 'revision_requested',
          title: 'Revision Requested',
          message: `${currentUser.name} requested revisions for "${proposal.content.title || 'Untitled Proposal'}". Details: ${comment}`,
          proposalId,
          proposalTitle: proposal.content.title || 'Untitled Proposal',
          fromUser: currentUser,
          read: false,
          createdAt: new Date().toISOString(),
        };

        const updatedProposal = {
          ...proposal,
          status: 'revisions_needed' as ProposalStatus,
          approvalHistory: [...(proposal.approvalHistory || []), approvalRecord],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          proposals: state.proposals.map((p) => p.id === proposalId ? updatedProposal : p),
          currentProposal: state.currentProposal?.id === proposalId ? updatedProposal : state.currentProposal,
          notifications: [notification, ...state.notifications],
        }));
      },

      reopenProposal: (proposalId) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal) return;

        const currentUser = get().currentUser;

        const approvalRecord: ApprovalRecord = {
          id: uuidv4(),
          action: 'reopened',
          by: currentUser,
          comment: `Reopened from ${proposal.status}`,
          timestamp: new Date().toISOString(),
          previousStatus: proposal.status,
        };

        const updatedProposal = {
          ...proposal,
          status: 'draft' as ProposalStatus,
          approvalHistory: [...(proposal.approvalHistory || []), approvalRecord],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          proposals: state.proposals.map((p) => p.id === proposalId ? updatedProposal : p),
          currentProposal: state.currentProposal?.id === proposalId ? updatedProposal : state.currentProposal,
        }));
      },

      // ============ LEGACY APPROVAL ACTIONS (Backward Compatibility) ============

      submitForApproval: (id, approver) => {
        const proposal = get().proposals.find((p) => p.id === id);
        if (!proposal) return;

        const code = proposal.code || generateProposalCode();
        const currentUser = get().currentUser;
        const approvalRecord: ApprovalRecord = {
          id: uuidv4(),
          action: 'submitted_to_manager',
          by: currentUser,
          to: approver,
          timestamp: new Date().toISOString(),
        };

        // Create notification for the approver
        const notification: Notification = {
          id: uuidv4(),
          type: 'submitted_to_manager',
          title: 'New Approval Request',
          message: `${currentUser.name} sent you "${proposal.content.title || 'Untitled Proposal'}" for approval`,
          proposalId: id,
          proposalTitle: proposal.content.title || 'Untitled Proposal',
          fromUser: currentUser,
          read: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === id
              ? {
                  ...p,
                  code,
                  status: 'pending_manager' as ProposalStatus,
                  approvalHistory: [...(p.approvalHistory || []), approvalRecord],
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          notifications: [notification, ...state.notifications],
        }));
      },

      updateProposalStatus: (id, status, comment) => {
        const proposal = get().proposals.find((p) => p.id === id);
        if (!proposal) return;

        const currentUser = get().currentUser;

        // Map status to approval action
        const statusToActionMap: Record<string, ApprovalAction> = {
          manager_approved: 'manager_approved',
          manager_rejected: 'manager_rejected',
          client_approved: 'client_approved',
          client_rejected: 'client_rejected',
          on_hold: 'put_on_hold',
          revisions_needed: 'revision_requested',
        };

        const approvalRecord: ApprovalRecord = {
          id: uuidv4(),
          action: statusToActionMap[status] || 'comment',
          by: currentUser,
          comment,
          timestamp: new Date().toISOString(),
          previousStatus: proposal.status,
        };

        // Create notification for the proposal author
        const notificationTypeMap: Record<string, NotificationType> = {
          manager_approved: 'manager_approved',
          manager_rejected: 'manager_rejected',
          client_approved: 'client_approved',
          client_rejected: 'client_rejected',
          on_hold: 'put_on_hold',
          revisions_needed: 'revision_requested',
        };

        const titleMap: Record<string, string> = {
          manager_approved: 'Proposal Approved by Manager',
          manager_rejected: 'Proposal Rejected by Manager',
          client_approved: 'Proposal Approved by Client',
          client_rejected: 'Proposal Rejected by Client',
          on_hold: 'Proposal On Hold',
          revisions_needed: 'Revisions Requested',
        };

        const getStatusMessage = () => {
          const proposalTitle = proposal.content.title || 'Untitled Proposal';
          switch (status) {
            case 'manager_approved':
              return `Your proposal "${proposalTitle}" was approved by ${currentUser.name}`;
            case 'manager_rejected':
              return `Your proposal "${proposalTitle}" was rejected by ${currentUser.name}${comment ? `. Reason: ${comment}` : ''}`;
            case 'client_approved':
              return `Your proposal "${proposalTitle}" was approved by the client`;
            case 'client_rejected':
              return `Your proposal "${proposalTitle}" was rejected by the client${comment ? `. Reason: ${comment}` : ''}`;
            case 'on_hold':
              return `Your proposal "${proposalTitle}" was put on hold by ${currentUser.name}${comment ? `. Reason: ${comment}` : ''}`;
            case 'revisions_needed':
              return `Revisions requested for "${proposalTitle}"${comment ? `. Details: ${comment}` : ''}`;
            default:
              return `Your proposal "${proposalTitle}" status was updated`;
          }
        };

        const notification: Notification = {
          id: uuidv4(),
          type: notificationTypeMap[status] || 'manager_approved',
          title: titleMap[status] || 'Status Updated',
          message: getStatusMessage(),
          proposalId: id,
          proposalTitle: proposal.content.title || 'Untitled Proposal',
          fromUser: currentUser,
          read: false,
          createdAt: new Date().toISOString(),
        };

        const updatedProposal = {
          ...proposal,
          status,
          approvalHistory: [...(proposal.approvalHistory || []), approvalRecord],
          updatedAt: new Date().toISOString(),
        };

        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === id ? updatedProposal : p
          ),
          // Also update currentProposal if it's the same proposal
          currentProposal: state.currentProposal?.id === id ? updatedProposal : state.currentProposal,
          notifications: [notification, ...state.notifications],
        }));
      },

      addCollaborator: (proposalId, collaborator) => {
        const proposal = get().proposals.find((p) => p.id === proposalId);
        if (!proposal) return;

        // Check if already a collaborator
        if (proposal.collaborators?.some((c) => c.id === collaborator.id)) return;

        const currentUser = get().currentUser;

        // Create share notification for the new collaborator
        const notification: Notification = {
          id: uuidv4(),
          type: 'share',
          title: 'Proposal Shared with You',
          message: `${currentUser.name} shared "${proposal.content.title || 'Untitled Proposal'}" with you`,
          proposalId,
          proposalTitle: proposal.content.title || 'Untitled Proposal',
          fromUser: currentUser,
          read: false,
          createdAt: new Date().toISOString(),
        };

        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === proposalId
              ? {
                  ...p,
                  collaborators: [...(p.collaborators || []), collaborator],
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          notifications: [notification, ...state.notifications],
        }));
      },

      removeCollaborator: (proposalId, collaboratorId) => {
        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === proposalId
              ? {
                  ...p,
                  collaborators: (p.collaborators || []).filter((c) => c.id !== collaboratorId),
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
        }));
      },

      addProposalActivity: (proposalId, activity) => {
        const { currentUser } = get();
        const newActivity: ActivityLogEntry = {
          id: uuidv4(),
          type: activity.type as ActivityType,
          description: activity.description,
          by: currentUser,
          timestamp: new Date().toISOString(),
          details: activity.details,
        };

        set((state) => ({
          proposals: state.proposals.map((p) =>
            p.id === proposalId
              ? {
                  ...p,
                  activityLog: [...(p.activityLog || []), newActivity],
                  updatedAt: new Date().toISOString(),
                }
              : p
          ),
          currentProposal:
            state.currentProposal?.id === proposalId
              ? {
                  ...state.currentProposal,
                  activityLog: [...(state.currentProposal.activityLog || []), newActivity],
                  updatedAt: new Date().toISOString(),
                }
              : state.currentProposal,
        }));
      },

      // Project actions
      addProject: (projectData) => {
        const state = get();
        const maxOrder = Math.max(...state.projects.map(p => p.order || 0), -1);
        const newProject: Project = {
          ...projectData,
          id: uuidv4(),
          proposals: [],
          order: maxOrder + 1,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        set((state) => ({
          projects: [...state.projects, newProject],
        }));
        return newProject;
      },

      updateProject: (id, updates) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      deleteProject: (id) => {
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
        }));
      },

      setCurrentProject: (project) => set({ currentProject: project }),

      moveProposalToProject: (proposalId, projectId) => {
        set((state) => {
          // Find the proposal to get its details for ProposalRef
          const proposal = state.proposals.find(p => p.id === proposalId);

          return {
            proposals: state.proposals.map((p) =>
              p.id === proposalId ? { ...p, projectId } : p
            ),
            // Update old project system
            projects: state.projects.map((p) => {
              if (p.id === projectId && !p.proposals.includes(proposalId)) {
                return { ...p, proposals: [...p.proposals, proposalId] };
              }
              return {
                ...p,
                proposals: p.proposals.filter((id) => id !== proposalId),
              };
            }),
            // Update ChatGPT-style projects
            chatProjects: state.chatProjects.map((cp) => {
              // Add to target project if not already there
              if (cp.id === projectId && !cp.proposals.some(pr => pr.id === proposalId)) {
                const newProposalRef = {
                  id: proposalId,
                  title: proposal?.content?.title || 'Untitled Proposal',
                  status: proposal?.status || 'draft',
                  linkedAt: new Date().toISOString(),
                };
                return { ...cp, proposals: [...cp.proposals, newProposalRef] };
              }
              // Remove from other projects
              if (cp.id !== projectId) {
                return {
                  ...cp,
                  proposals: cp.proposals.filter((pr) => pr.id !== proposalId),
                };
              }
              return cp;
            }),
          };
        });
      },

      reorderProjects: (dragId, dropId, position) => {
        set((state) => {
          const projects = [...state.projects];
          const dragIndex = projects.findIndex(p => p.id === dragId);
          let dropIndex = projects.findIndex(p => p.id === dropId);

          if (dragIndex === -1 || dropIndex === -1) return state;

          // Get drop target info before removing dragged item
          const dropTarget = projects[dropIndex];
          const dropParentId = dropTarget?.parentId;

          // Remove dragged project
          const [draggedProject] = projects.splice(dragIndex, 1);

          // Adjust dropIndex if dragged item was before drop target
          if (dragIndex < dropIndex) {
            dropIndex--;
          }

          if (position === 'inside') {
            // Move project inside another (make it a child)
            draggedProject.parentId = dropId;
            // Insert after the parent in the flat array
            projects.splice(dropIndex + 1, 0, draggedProject);
          } else if (position === 'before') {
            // Move before the drop target (same parent level)
            draggedProject.parentId = dropParentId;
            projects.splice(dropIndex, 0, draggedProject);
          } else {
            // Move after the drop target (same parent level)
            draggedProject.parentId = dropParentId;
            projects.splice(dropIndex + 1, 0, draggedProject);
          }

          // Update order for all projects
          return {
            projects: projects.map((p, index) => ({ ...p, order: index, updatedAt: new Date().toISOString() })),
          };
        });
      },

      moveProjectToParent: (projectId, parentId) => {
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === projectId ? { ...p, parentId: parentId || undefined, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      getNestedProjects: () => {
        const state = get();
        const projects = state.projects;

        const buildTree = (parentId: string | undefined, depth: number): NestedProject[] => {
          return projects
            .filter(p => p.parentId === parentId)
            .sort((a, b) => (a.order || 0) - (b.order || 0))
            .map(p => ({
              ...p,
              depth,
              children: buildTree(p.id, depth + 1),
            }));
        };

        return buildTree(undefined, 0);
      },

      // ChatGPT-style Project actions
      addChatProject: (projectData) => {
        const { currentUser } = get();
        const now = new Date().toISOString();
        const newProject: ChatProject = {
          ...projectData,
          id: uuidv4(),
          owner: currentUser,
          collaborators: [],
          conversations: [],
          files: [],
          proposals: [],
          createdAt: now,
          updatedAt: now,
          lastActivityAt: now,
        };
        set((state) => ({
          chatProjects: [...state.chatProjects, newProject],
        }));
        return newProject;
      },

      updateChatProject: (id, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: now, lastActivityAt: now } : p
          ),
          currentChatProject:
            state.currentChatProject?.id === id
              ? { ...state.currentChatProject, ...updates, updatedAt: now, lastActivityAt: now }
              : state.currentChatProject,
        }));
      },

      deleteChatProject: (id) => {
        set((state) => ({
          chatProjects: state.chatProjects.filter((p) => p.id !== id),
          currentChatProject: state.currentChatProject?.id === id ? null : state.currentChatProject,
          currentConversation: state.currentChatProject?.id === id ? null : state.currentConversation,
        }));
      },

      archiveChatProject: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === id ? { ...p, isArchived: true, updatedAt: now } : p
          ),
        }));
      },

      unarchiveChatProject: (id) => {
        const now = new Date().toISOString();
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === id ? { ...p, isArchived: false, updatedAt: now } : p
          ),
        }));
      },

      pinChatProject: (id) => {
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === id ? { ...p, isPinned: true, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      unpinChatProject: (id) => {
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === id ? { ...p, isPinned: false, updatedAt: new Date().toISOString() } : p
          ),
        }));
      },

      setCurrentChatProject: (project) => set({ currentChatProject: project }),

      // Conversation actions
      addConversation: (projectId, title) => {
        const now = new Date().toISOString();
        const newConversation: ProjectConversation = {
          id: uuidv4(),
          title: title || 'New conversation',
          messages: [],
          createdAt: now,
          updatedAt: now,
        };
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === projectId
              ? { ...p, conversations: [...p.conversations, newConversation], lastActivityAt: now, updatedAt: now }
              : p
          ),
          currentChatProject:
            state.currentChatProject?.id === projectId
              ? { ...state.currentChatProject, conversations: [...state.currentChatProject.conversations, newConversation], lastActivityAt: now, updatedAt: now }
              : state.currentChatProject,
        }));
        return newConversation;
      },

      updateConversation: (projectId, conversationId, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  conversations: p.conversations.map((c) =>
                    c.id === conversationId ? { ...c, ...updates, updatedAt: now } : c
                  ),
                  lastActivityAt: now,
                  updatedAt: now,
                }
              : p
          ),
          currentChatProject:
            state.currentChatProject?.id === projectId
              ? {
                  ...state.currentChatProject,
                  conversations: state.currentChatProject.conversations.map((c) =>
                    c.id === conversationId ? { ...c, ...updates, updatedAt: now } : c
                  ),
                  lastActivityAt: now,
                  updatedAt: now,
                }
              : state.currentChatProject,
          currentConversation:
            state.currentConversation?.id === conversationId
              ? { ...state.currentConversation, ...updates, updatedAt: now }
              : state.currentConversation,
        }));
      },

      deleteConversation: (projectId, conversationId) => {
        const now = new Date().toISOString();
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  conversations: p.conversations.filter((c) => c.id !== conversationId),
                  updatedAt: now,
                }
              : p
          ),
          currentChatProject:
            state.currentChatProject?.id === projectId
              ? {
                  ...state.currentChatProject,
                  conversations: state.currentChatProject.conversations.filter((c) => c.id !== conversationId),
                  updatedAt: now,
                }
              : state.currentChatProject,
          currentConversation:
            state.currentConversation?.id === conversationId ? null : state.currentConversation,
        }));
      },

      archiveConversation: (projectId, conversationId) => {
        const now = new Date().toISOString();
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  conversations: p.conversations.map((c) =>
                    c.id === conversationId ? { ...c, isArchived: true, updatedAt: now } : c
                  ),
                  updatedAt: now,
                }
              : p
          ),
        }));
      },

      setCurrentConversation: (conversation) => set({ currentConversation: conversation }),

      // Message actions
      addProjectMessage: (projectId, conversationId, messageData) => {
        const now = new Date().toISOString();
        const newMessage: ProjectMessage = {
          ...messageData,
          id: uuidv4(),
          timestamp: now,
        };

        set((state) => {
          const updateConversations = (conversations: ProjectConversation[]) =>
            conversations.map((c) =>
              c.id === conversationId
                ? { ...c, messages: [...c.messages, newMessage], updatedAt: now }
                : c
            );

          return {
            chatProjects: state.chatProjects.map((p) =>
              p.id === projectId
                ? {
                    ...p,
                    conversations: updateConversations(p.conversations),
                    lastActivityAt: now,
                    updatedAt: now,
                  }
                : p
            ),
            currentChatProject:
              state.currentChatProject?.id === projectId
                ? {
                    ...state.currentChatProject,
                    conversations: updateConversations(state.currentChatProject.conversations),
                    lastActivityAt: now,
                    updatedAt: now,
                  }
                : state.currentChatProject,
            currentConversation:
              state.currentConversation?.id === conversationId
                ? { ...state.currentConversation, messages: [...state.currentConversation.messages, newMessage], updatedAt: now }
                : state.currentConversation,
          };
        });

        return newMessage;
      },

      updateProjectMessage: (projectId, conversationId, messageId, content) => {
        const now = new Date().toISOString();
        set((state) => {
          const updateMessages = (messages: ProjectMessage[]) =>
            messages.map((m) =>
              m.id === messageId ? { ...m, content, isEdited: true, editedAt: now } : m
            );

          const updateConversations = (conversations: ProjectConversation[]) =>
            conversations.map((c) =>
              c.id === conversationId
                ? { ...c, messages: updateMessages(c.messages), updatedAt: now }
                : c
            );

          return {
            chatProjects: state.chatProjects.map((p) =>
              p.id === projectId
                ? { ...p, conversations: updateConversations(p.conversations), updatedAt: now }
                : p
            ),
            currentChatProject:
              state.currentChatProject?.id === projectId
                ? { ...state.currentChatProject, conversations: updateConversations(state.currentChatProject.conversations), updatedAt: now }
                : state.currentChatProject,
            currentConversation:
              state.currentConversation?.id === conversationId
                ? { ...state.currentConversation, messages: updateMessages(state.currentConversation.messages), updatedAt: now }
                : state.currentConversation,
          };
        });
      },

      deleteProjectMessage: (projectId, conversationId, messageId) => {
        const now = new Date().toISOString();
        set((state) => {
          const updateConversations = (conversations: ProjectConversation[]) =>
            conversations.map((c) =>
              c.id === conversationId
                ? { ...c, messages: c.messages.filter((m) => m.id !== messageId), updatedAt: now }
                : c
            );

          return {
            chatProjects: state.chatProjects.map((p) =>
              p.id === projectId
                ? { ...p, conversations: updateConversations(p.conversations), updatedAt: now }
                : p
            ),
            currentChatProject:
              state.currentChatProject?.id === projectId
                ? { ...state.currentChatProject, conversations: updateConversations(state.currentChatProject.conversations), updatedAt: now }
                : state.currentChatProject,
            currentConversation:
              state.currentConversation?.id === conversationId
                ? { ...state.currentConversation, messages: state.currentConversation.messages.filter((m) => m.id !== messageId), updatedAt: now }
                : state.currentConversation,
          };
        });
      },

      setChatProjectTyping: (typing) => set({ isChatProjectTyping: typing }),

      // Project file actions
      addProjectFile: (projectId, fileData) => {
        const now = new Date().toISOString();
        const newFile: ProjectFile = {
          ...fileData,
          id: uuidv4(),
          uploadedAt: now,
        };
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === projectId
              ? { ...p, files: [...p.files, newFile], updatedAt: now, lastActivityAt: now }
              : p
          ),
          currentChatProject:
            state.currentChatProject?.id === projectId
              ? { ...state.currentChatProject, files: [...state.currentChatProject.files, newFile], updatedAt: now, lastActivityAt: now }
              : state.currentChatProject,
        }));
      },

      deleteProjectFile: (projectId, fileId) => {
        const now = new Date().toISOString();
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === projectId
              ? { ...p, files: p.files.filter((f) => f.id !== fileId), updatedAt: now }
              : p
          ),
          currentChatProject:
            state.currentChatProject?.id === projectId
              ? { ...state.currentChatProject, files: state.currentChatProject.files.filter((f) => f.id !== fileId), updatedAt: now }
              : state.currentChatProject,
        }));
      },

      // Project collaborator actions
      addProjectCollaborator: (projectId, collaboratorData) => {
        const now = new Date().toISOString();
        const newCollaborator: ProjectCollaborator = {
          ...collaboratorData,
          id: uuidv4(),
          joinedAt: now,
          lastActiveAt: now,
        };
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === projectId
              ? { ...p, collaborators: [...p.collaborators, newCollaborator], updatedAt: now }
              : p
          ),
          currentChatProject:
            state.currentChatProject?.id === projectId
              ? { ...state.currentChatProject, collaborators: [...state.currentChatProject.collaborators, newCollaborator], updatedAt: now }
              : state.currentChatProject,
        }));
      },

      updateProjectCollaborator: (projectId, collaboratorId, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  collaborators: p.collaborators.map((c) =>
                    c.id === collaboratorId ? { ...c, ...updates, lastActiveAt: now } : c
                  ),
                  updatedAt: now,
                }
              : p
          ),
          currentChatProject:
            state.currentChatProject?.id === projectId
              ? {
                  ...state.currentChatProject,
                  collaborators: state.currentChatProject.collaborators.map((c) =>
                    c.id === collaboratorId ? { ...c, ...updates, lastActiveAt: now } : c
                  ),
                  updatedAt: now,
                }
              : state.currentChatProject,
        }));
      },

      removeProjectCollaborator: (projectId, collaboratorId) => {
        const now = new Date().toISOString();
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === projectId
              ? { ...p, collaborators: p.collaborators.filter((c) => c.id !== collaboratorId), updatedAt: now }
              : p
          ),
          currentChatProject:
            state.currentChatProject?.id === projectId
              ? { ...state.currentChatProject, collaborators: state.currentChatProject.collaborators.filter((c) => c.id !== collaboratorId), updatedAt: now }
              : state.currentChatProject,
        }));
      },

      // Link proposal to project
      linkProposalToChatProject: (projectId, proposal) => {
        const now = new Date().toISOString();
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  proposals: [...p.proposals.filter((pr) => pr.id !== proposal.id), { ...proposal, linkedAt: now }],
                  updatedAt: now,
                  lastActivityAt: now,
                }
              : p
          ),
          currentChatProject:
            state.currentChatProject?.id === projectId
              ? {
                  ...state.currentChatProject,
                  proposals: [...state.currentChatProject.proposals.filter((pr) => pr.id !== proposal.id), { ...proposal, linkedAt: now }],
                  updatedAt: now,
                  lastActivityAt: now,
                }
              : state.currentChatProject,
        }));
      },

      unlinkProposalFromChatProject: (projectId, proposalId) => {
        const now = new Date().toISOString();
        set((state) => ({
          chatProjects: state.chatProjects.map((p) =>
            p.id === projectId
              ? { ...p, proposals: p.proposals.filter((pr) => pr.id !== proposalId), updatedAt: now }
              : p
          ),
          currentChatProject:
            state.currentChatProject?.id === projectId
              ? { ...state.currentChatProject, proposals: state.currentChatProject.proposals.filter((pr) => pr.id !== proposalId), updatedAt: now }
              : state.currentChatProject,
        }));
      },

      // Getters
      getChatProjectsByFilter: (filter) => {
        const { chatProjects } = get();
        return chatProjects.filter((p) => {
          if (filter.pinned !== undefined && p.isPinned !== filter.pinned) return false;
          if (filter.archived !== undefined && p.isArchived !== filter.archived) return false;
          return true;
        });
      },

      // Chat actions (per-proposal)
      getProposalChat: (proposalId) => {
        return get().proposalChats[proposalId] || [];
      },

      addChatMessage: (proposalId, messageData) => {
        const newMessage: ChatMessage = {
          ...messageData,
          id: uuidv4(),
          timestamp: new Date().toISOString(),
        };
        set((state) => ({
          proposalChats: {
            ...state.proposalChats,
            [proposalId]: [...(state.proposalChats[proposalId] || []), newMessage],
          },
        }));
      },

      clearProposalChat: (proposalId) => {
        set((state) => ({
          proposalChats: {
            ...state.proposalChats,
            [proposalId]: [],
          },
        }));
      },

      setActiveProposalChatId: (proposalId) => set({ activeProposalChatId: proposalId }),

      setAiTyping: (typing) => set({ isAiTyping: typing }),

      // Library actions
      addLibraryItem: (itemData) => {
        const newItem: LibraryItem = {
          ...itemData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          libraryItems: [...state.libraryItems, newItem],
        }));
      },

      deleteLibraryItem: (id) => {
        set((state) => ({
          libraryItems: state.libraryItems.filter((item) => item.id !== id),
        }));
      },

      // Notification actions
      addNotification: (notificationData) => {
        const newNotification: Notification = {
          ...notificationData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          notifications: [newNotification, ...state.notifications],
        }));
      },

      markNotificationRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      deleteNotification: (id) => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      },

      getUnreadNotificationCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },

      getPendingApprovals: () => {
        return get().notifications.filter(
          (n) => n.type === 'submitted_to_manager' && !n.read
        );
      },

      // Calendar actions
      updateCalendarTasks: (tasks) => set({ calendarTasks: tasks }),

      // Dashboard helpers
      pinProposal: (id) => {
        set((state) => ({
          pinnedProposalIds: state.pinnedProposalIds.includes(id)
            ? state.pinnedProposalIds
            : [...state.pinnedProposalIds, id],
        }));
      },
      unpinProposal: (id) => {
        set((state) => ({
          pinnedProposalIds: state.pinnedProposalIds.filter((pId) => pId !== id),
        }));
      },

      // History items actions
      archiveHistoryItem: (item) => {
        set((state) => ({
          archivedHistoryItems: state.archivedHistoryItems.some(i => i.id === item.id)
            ? state.archivedHistoryItems
            : [...state.archivedHistoryItems, item],
        }));
      },
      unarchiveHistoryItem: (id) => {
        set((state) => ({
          archivedHistoryItems: state.archivedHistoryItems.filter((i) => i.id !== id),
        }));
      },
      pinHistoryItem: (id) => {
        set((state) => ({
          pinnedHistoryItems: state.pinnedHistoryItems.includes(id)
            ? state.pinnedHistoryItems
            : [...state.pinnedHistoryItems, id],
        }));
      },
      unpinHistoryItem: (id) => {
        set((state) => ({
          pinnedHistoryItems: state.pinnedHistoryItems.filter((pId) => pId !== id),
        }));
      },

      setSearchPreset: (preset) => set({ searchPreset: preset }),
      setShowAdminButton: (visible) => set({ showAdminButton: visible }),
      setShowHelpButton: (visible) => set({ showHelpButton: visible }),

      // Filter actions
      setMetaLearningFilter: (filter) => set({ metaLearningFilter: filter }),
      clearMetaLearningFilter: () => set({ metaLearningFilter: {} }),

      // Dashboard config actions
      updateDashboardWidget: (widgetId, updates) => {
        set((state) => ({
          dashboardConfig: {
            ...state.dashboardConfig,
            widgets: state.dashboardConfig.widgets.map((w) =>
              w.id === widgetId ? { ...w, ...updates } : w
            ),
          },
        }));
      },

      updateWidgetLayouts: (layouts) => {
        set((state) => ({
          dashboardConfig: {
            ...state.dashboardConfig,
            widgets: state.dashboardConfig.widgets.map((w) => {
              const layoutUpdate = layouts.find((l) => l.id === w.id);
              return layoutUpdate ? { ...w, layout: layoutUpdate.layout } : w;
            }),
          },
        }));
      },

      reorderDashboardWidgets: (widgets) => {
        set((state) => ({
          dashboardConfig: { ...state.dashboardConfig, widgets },
        }));
      },

      resetDashboardConfig: () => {
        set({ dashboardConfig: defaultDashboardConfig });
      },

      toggleLayoutLock: () => {
        set((state) => ({
          dashboardConfig: {
            ...state.dashboardConfig,
            layoutLocked: !state.dashboardConfig.layoutLocked,
          },
        }));
      },

      setLayoutLock: (locked) => {
        set((state) => ({
          dashboardConfig: {
            ...state.dashboardConfig,
            layoutLocked: locked,
          },
        }));
      },

      // Quick actions
      addQuickAction: (action) => {
        const id = `qa-${Date.now()}`;
        set((state) => {
          const maxOrder = Math.max(...state.dashboardConfig.quickActions.map((a) => a.order), -1);
          return {
            dashboardConfig: {
              ...state.dashboardConfig,
              quickActions: [
                ...state.dashboardConfig.quickActions,
                { ...action, id, order: maxOrder + 1 },
              ],
            },
          };
        });
      },

      updateQuickAction: (id, updates) => {
        set((state) => ({
          dashboardConfig: {
            ...state.dashboardConfig,
            quickActions: state.dashboardConfig.quickActions.map((a) =>
              a.id === id ? { ...a, ...updates } : a
            ),
          },
        }));
      },

      deleteQuickAction: (id) => {
        set((state) => ({
          dashboardConfig: {
            ...state.dashboardConfig,
            quickActions: state.dashboardConfig.quickActions.filter((a) => a.id !== id),
          },
        }));
      },

      reorderQuickActions: (actions) => {
        set((state) => ({
          dashboardConfig: {
            ...state.dashboardConfig,
            quickActions: actions,
          },
        }));
      },

      // UI actions
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setSidebarWidth: (width) => set({ sidebarWidth: Math.max(200, Math.min(480, width)) }),
      setRightSidebarCollapsed: (collapsed) => set({ rightSidebarCollapsed: collapsed }),
      setActiveSection: (section) => set({ activeSection: section }),
      setLoggedIn: (loggedIn) => set({ isLoggedIn: loggedIn }),
      setShowCreateProjectModal: (show) => set({ showCreateProjectModal: show }),
      setShowSettingsModal: (show) => set({ showSettingsModal: show }),

      // Onboarding
      setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),

      // Preferences
      setDefaultEditorMode: (mode) => set({ defaultEditorMode: mode }),

      // Search
      searchProposals: (query, searchAll) => {
        const { proposals, currentUser } = get();
        const lowerQuery = query.toLowerCase();

        return proposals.filter((p) => {
          // Filter by ownership if not searching all
          if (!searchAll && p.author.id !== currentUser.id) {
            return false;
          }

          // Search in title, client, background
          return (
            p.content.title?.toLowerCase().includes(lowerQuery) ||
            p.content.client?.toLowerCase().includes(lowerQuery) ||
            p.content.background?.toLowerCase().includes(lowerQuery) ||
            p.code?.toLowerCase().includes(lowerQuery)
          );
        });
      },

      getFilteredProposals: () => {
        const { proposals, metaLearningFilter } = get();

        return proposals.filter((p) => {
          if (p.status === 'deleted') return false;

          if (metaLearningFilter.clients?.length) {
            if (!metaLearningFilter.clients.includes(p.content.client || '')) {
              return false;
            }
          }

          if (metaLearningFilter.statuses?.length) {
            if (!metaLearningFilter.statuses.includes(p.status)) {
              return false;
            }
          }

          if (metaLearningFilter.authors?.length) {
            if (!metaLearningFilter.authors.includes(p.author.id)) {
              return false;
            }
          }

          if (metaLearningFilter.dateRange) {
            const proposalDate = new Date(p.createdAt);
            const startDate = new Date(metaLearningFilter.dateRange.start);
            const endDate = new Date(metaLearningFilter.dateRange.end);
            if (proposalDate < startDate || proposalDate > endDate) {
              return false;
            }
          }

          return true;
        });
      },

      // ==================== COWORKING ACTIONS ====================

      // Session CRUD
      createCoworkingSession: (sessionData) => {
        const now = new Date().toISOString();
        const newSession: CoworkingSession = {
          ...sessionData,
          id: uuidv4(),
          collaborators: [{
            id: uuidv4(),
            user: get().currentUser,
            role: 'owner',
            status: 'online',
            joinedAt: now,
            lastActiveAt: now,
          }],
          messages: [],
          comments: [],
          createdAt: now,
          updatedAt: now,
          lastActivityAt: now,
        };
        set((state) => ({
          coworkingSessions: [...state.coworkingSessions, newSession],
          activeCoworkingSessionId: newSession.id,
        }));
        return newSession.id;
      },

      updateCoworkingSession: (sessionId, updates) => {
        const now = new Date().toISOString();
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId ? { ...s, ...updates, updatedAt: now, lastActivityAt: now } : s
          ),
        }));
      },

      deleteCoworkingSession: (sessionId) => {
        set((state) => ({
          coworkingSessions: state.coworkingSessions.filter((s) => s.id !== sessionId),
          activeCoworkingSessionId: state.activeCoworkingSessionId === sessionId ? null : state.activeCoworkingSessionId,
        }));
      },

      archiveCoworkingSession: (sessionId) => {
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId ? { ...s, isArchived: true, updatedAt: new Date().toISOString() } : s
          ),
        }));
      },

      setActiveCoworkingSession: (sessionId) => {
        set({ activeCoworkingSessionId: sessionId });
      },

      getCoworkingSession: (sessionId) => {
        return get().coworkingSessions.find((s) => s.id === sessionId);
      },

      getCoworkingSessionsByType: (type) => {
        return get().coworkingSessions.filter((s) => s.type === type && !s.isArchived);
      },

      // Collaborator Actions
      addSessionCollaborator: (sessionId, collaboratorData) => {
        const now = new Date().toISOString();
        const newCollaborator: SessionCollaborator = {
          ...collaboratorData,
          id: uuidv4(),
          joinedAt: now,
          lastActiveAt: now,
        };
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId
              ? { ...s, collaborators: [...s.collaborators, newCollaborator], lastActivityAt: now }
              : s
          ),
        }));
      },

      updateSessionCollaborator: (sessionId, collaboratorId, updates) => {
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  collaborators: s.collaborators.map((c) =>
                    c.id === collaboratorId ? { ...c, ...updates, lastActiveAt: new Date().toISOString() } : c
                  ),
                }
              : s
          ),
        }));
      },

      removeSessionCollaborator: (sessionId, collaboratorId) => {
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId
              ? { ...s, collaborators: s.collaborators.filter((c) => c.id !== collaboratorId) }
              : s
          ),
        }));
      },

      setSessionCollaboratorStatus: (sessionId, collaboratorId, status) => {
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  collaborators: s.collaborators.map((c) =>
                    c.id === collaboratorId ? { ...c, status, lastActiveAt: new Date().toISOString() } : c
                  ),
                }
              : s
          ),
        }));
      },

      setSessionCollaboratorTyping: (sessionId, collaboratorId, isTyping) => {
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  collaborators: s.collaborators.map((c) =>
                    c.id === collaboratorId ? { ...c, isTyping } : c
                  ),
                }
              : s
          ),
        }));
      },

      // Message Actions
      addSessionMessage: (sessionId, messageData) => {
        const now = new Date().toISOString();
        const newMessage: SessionMessage = {
          ...messageData,
          id: uuidv4(),
          timestamp: now,
        };
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages: [...s.messages, newMessage], lastActivityAt: now, updatedAt: now }
              : s
          ),
        }));
      },

      updateSessionMessage: (sessionId, messageId, updates) => {
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  messages: s.messages.map((m) => (m.id === messageId ? { ...m, ...updates } : m)),
                  lastActivityAt: new Date().toISOString(),
                }
              : s
          ),
        }));
      },

      deleteSessionMessage: (sessionId, messageId) => {
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId
              ? { ...s, messages: s.messages.filter((m) => m.id !== messageId) }
              : s
          ),
        }));
      },

      // Comment Actions
      addSessionComment: (sessionId, commentData) => {
        const now = new Date().toISOString();
        const newComment: SessionComment = {
          ...commentData,
          id: uuidv4(),
          timestamp: now,
        };
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId
              ? { ...s, comments: [...s.comments, newComment], lastActivityAt: now }
              : s
          ),
        }));
      },

      updateSessionComment: (sessionId, commentId, updates) => {
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  comments: s.comments.map((c) => (c.id === commentId ? { ...c, ...updates } : c)),
                }
              : s
          ),
        }));
      },

      deleteSessionComment: (sessionId, commentId) => {
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId
              ? { ...s, comments: s.comments.filter((c) => c.id !== commentId) }
              : s
          ),
        }));
      },

      resolveSessionComment: (sessionId, commentId, resolved) => {
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId
              ? {
                  ...s,
                  comments: s.comments.map((c) => (c.id === commentId ? { ...c, resolved } : c)),
                }
              : s
          ),
        }));
      },

      getSessionComments: (sessionId, messageId) => {
        const session = get().coworkingSessions.find((s) => s.id === sessionId);
        if (!session) return [];
        if (messageId) {
          return session.comments.filter((c) => c.messageId === messageId);
        }
        return session.comments;
      },

      // Share Actions
      generateSessionShareLink: (sessionId) => {
        const shareLink = `${typeof window !== 'undefined' ? window.location.origin : ''}/session/${sessionId}`;
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId ? { ...s, shareLink, accessLevel: 'link' as AccessLevel } : s
          ),
        }));
        return shareLink;
      },

      updateSessionAccessLevel: (sessionId, accessLevel) => {
        set((state) => ({
          coworkingSessions: state.coworkingSessions.map((s) =>
            s.id === sessionId ? { ...s, accessLevel } : s
          ),
        }));
      },

      // Invite Actions
      createSessionInvite: (inviteData) => {
        const newInvite: SessionInvite = {
          ...inviteData,
          id: uuidv4(),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          coworkingInvites: [...state.coworkingInvites, newInvite],
        }));
      },

      respondToSessionInvite: (inviteId, response) => {
        const invite = get().coworkingInvites.find((i) => i.id === inviteId);
        if (!invite) return;

        set((state) => ({
          coworkingInvites: state.coworkingInvites.map((i) =>
            i.id === inviteId ? { ...i, status: response } : i
          ),
        }));

        // If accepted, add as collaborator
        if (response === 'accepted') {
          const currentUser = get().currentUser;
          get().addSessionCollaborator(invite.sessionId, {
            user: currentUser,
            role: invite.role,
            status: 'online',
          });
        }
      },
    }),
    {
      name: 'boltinsight-storage',
      version: 22,
      migrate: (persistedState: unknown, version: number) => {
        // Reset dashboard config when migrating to version 18 (24-column grid with Card components)
        return {
          isLoggedIn: false,
          sidebarCollapsed: false,
          rightSidebarCollapsed: false,
          dashboardConfig: defaultDashboardConfig,
        };
      },
      partialize: (state) => ({
        isLoggedIn: state.isLoggedIn,
        sidebarCollapsed: state.sidebarCollapsed,
        rightSidebarCollapsed: state.rightSidebarCollapsed,
        dashboardConfig: state.dashboardConfig,
        pinnedProposalIds: state.pinnedProposalIds,
        showAdminButton: state.showAdminButton,
        showHelpButton: state.showHelpButton,
        onboardingCompleted: state.onboardingCompleted,
        defaultEditorMode: state.defaultEditorMode,
        calendarTasks: state.calendarTasks,
        coworkingSessions: state.coworkingSessions,
      }),
    }
  )
);
