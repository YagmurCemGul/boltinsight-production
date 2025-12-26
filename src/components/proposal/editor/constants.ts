import {
  FileQuestion,
  Users,
  BookOpen,
  Target,
  BarChart3,
  Globe,
  Link as LinkIcon,
} from 'lucide-react';

export const SECTION_CONFIG = [
  { id: 'title', label: 'Title', icon: FileQuestion, required: true },
  { id: 'client', label: 'Client', icon: Users, required: true },
  { id: 'background', label: 'Background / Context', icon: BookOpen, required: false },
  { id: 'businessObjectives', label: 'Business Objectives', icon: Target, required: false },
  { id: 'researchObjectives', label: 'Research Objectives', icon: Target, required: false },
  { id: 'burningQuestions', label: 'Burning Questions', icon: FileQuestion, required: false },
  { id: 'targetDefinition', label: 'Target Definition', icon: Target, required: true },
  { id: 'sampleSize', label: 'Sample Size', icon: BarChart3, required: true },
  { id: 'loi', label: 'LOI (Length of Interview)', icon: BarChart3, required: true },
  { id: 'markets', label: 'Markets', icon: Globe, required: true },
  { id: 'quotas', label: 'Quota Recommendations', icon: BarChart3, required: false },
  { id: 'advancedAnalysis', label: 'Advanced Analysis', icon: BarChart3, required: false },
  { id: 'referenceProjects', label: 'Reference Projects', icon: LinkIcon, required: false },
];

export const PROPOSAL_TEMPLATES = [
  { id: 'blank', label: 'Blank Proposal', prompt: '' },
  {
    id: 'concept-test',
    label: 'Concept Testing',
    prompt: `Help me set up a Concept Testing proposal. I need:
- Concept appeal metrics (Relevance, Uniqueness, Believability)
- Purchase intent scales
- Open-ended improvement questions
- Comparative analysis framework`
  },
  {
    id: 'brand-tracking',
    label: 'Brand Tracking',
    prompt: `Help me create a Brand Tracking proposal with:
- Brand funnel metrics (Awareness → Consideration → Usage → Loyalty)
- Brand image and attribute tracking
- Competitive benchmarking framework
- NPS and satisfaction measures`
  },
  {
    id: 'segmentation',
    label: 'Segmentation Study',
    prompt: `Help me build a Segmentation Study proposal including:
- Attitudinal and behavioral questions
- Cluster analysis approach
- Segment profiling variables
- Persona development framework`
  },
  {
    id: 'uat',
    label: 'Usage & Attitude',
    prompt: `Help me create a Usage & Attitude (U&A) proposal with:
- Category usage behavior and frequency
- Brand funnel and switching patterns
- Need states and occasions
- Attitude and satisfaction measures`
  },
];

export const AI_QUICK_ACTIONS = [
  { label: 'Expand objectives', prompt: 'Help me expand and detail my research objectives based on the current content.' },
  { label: 'Suggest sample', prompt: 'Based on the research objectives, what sample size and quota splits would you recommend?' },
  { label: 'Add markets', prompt: 'Suggest additional markets that might be relevant for this study.' },
  { label: 'Generate questions', prompt: 'Generate key burning questions based on the research objectives.' },
];

export const TARGET_CRITERIA = {
  age: {
    label: 'Age',
    options: [
      { value: '18-24', label: '18-24' },
      { value: '25-34', label: '25-34' },
      { value: '35-44', label: '35-44' },
      { value: '45-54', label: '45-54' },
      { value: '55-64', label: '55-64' },
      { value: '65+', label: '65+' },
    ],
  },
  gender: {
    label: 'Gender',
    options: [
      { value: 'Male', label: 'Male' },
      { value: 'Female', label: 'Female' },
      { value: 'All genders', label: 'All genders' },
    ],
  },
  income: {
    label: 'Income Level',
    options: [
      { value: 'Low income', label: 'Low income' },
      { value: 'Middle income', label: 'Middle income' },
      { value: 'High income', label: 'High income' },
      { value: 'All income levels', label: 'All income levels' },
    ],
  },
  location: {
    label: 'Location Type',
    options: [
      { value: 'Urban', label: 'Urban' },
      { value: 'Suburban', label: 'Suburban' },
      { value: 'Rural', label: 'Rural' },
      { value: 'All locations', label: 'All locations' },
    ],
  },
  employment: {
    label: 'Employment Status',
    options: [
      { value: 'Employed full-time', label: 'Employed full-time' },
      { value: 'Employed part-time', label: 'Employed part-time' },
      { value: 'Self-employed', label: 'Self-employed' },
      { value: 'Unemployed', label: 'Unemployed' },
      { value: 'Student', label: 'Student' },
      { value: 'Retired', label: 'Retired' },
    ],
  },
  household: {
    label: 'Household',
    options: [
      { value: 'Single', label: 'Single' },
      { value: 'Married/Partner', label: 'Married/Partner' },
      { value: 'With children', label: 'With children' },
      { value: 'Without children', label: 'Without children' },
    ],
  },
  brandUsage: {
    label: 'Brand Usage',
    options: [
      { value: 'Current brand users', label: 'Current brand users' },
      { value: 'Lapsed users', label: 'Lapsed users' },
      { value: 'Competitor users', label: 'Competitor users' },
      { value: 'Non-users', label: 'Non-users' },
      { value: 'Category buyers', label: 'Category buyers' },
    ],
  },
  purchaseFrequency: {
    label: 'Purchase Frequency',
    options: [
      { value: 'Daily purchasers', label: 'Daily purchasers' },
      { value: 'Weekly purchasers', label: 'Weekly purchasers' },
      { value: 'Monthly purchasers', label: 'Monthly purchasers' },
      { value: 'Occasional purchasers', label: 'Occasional purchasers' },
    ],
  },
};
