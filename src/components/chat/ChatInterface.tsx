'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import {
  Send,
  Paperclip,
  Bot,
  User,
  FileText,
  X,
  Sparkles,
  Check,
  Target,
  Users,
  BarChart3,
  Globe,
  BookOpen,
  TrendingUp,
  Copy,
  Upload,
  Link as LinkIcon,
  Briefcase,
} from 'lucide-react';
import { cn, formatDateTime } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Button, Textarea, AITypingIndicator, AttachmentPreviewCompact, ChatMessageAttachmentsCompact } from '@/components/ui';
import type { ChatAttachment } from '@/components/ui';
import type { ChatMessage, ProposalContent } from '@/types';

type AttachmentMode = 'menu' | null;

interface ChatInterfaceProps {
  proposalId: string; // Required - each proposal has its own chat
  onProposalGenerated?: (content: string) => void;
  activeFieldSection?: string | null;
  onFieldSectionChange?: (section: string | null) => void;
  proposalContent?: ProposalContent;
  onProposalContentUpdate?: (key: keyof ProposalContent, value: unknown) => void;
  onSendToProposal?: (content: string) => void;
}

// Quick action buttons (like Research Calculators)
const QUICK_ACTIONS = [
  { id: 'header', label: 'Title & Client', icon: FileText, query: 'Set proposal title and client information' },
  { id: 'background', label: 'Background', icon: BookOpen, query: 'Write the background section' },
  { id: 'businessObjectives', label: 'Business Objectives', icon: Target, query: 'Define business objectives' },
  { id: 'researchObjectives', label: 'Research Objectives', icon: TrendingUp, query: 'Set research objectives' },
  { id: 'targetDefinition', label: 'Target Audience', icon: Users, query: 'Define target audience' },
  { id: 'sampleSize', label: 'Sample Size', icon: BarChart3, query: 'Set sample size' },
  { id: 'markets', label: 'Markets', icon: Globe, query: 'Add markets' },
];

const templateOptions = [
  { id: 'blank', label: 'Blank Proposal', response: '' },
  {
    id: 'concept-test',
    label: 'Concept Testing',
    response: `Great choice! I've loaded the **Concept Testing Template**.

**This template is optimized for:**
- Testing new product/service concepts
- Evaluating advertising or packaging designs
- Comparing multiple concepts against each other

**Pre-configured sections:**
- Concept appeal metrics (Relevance, Uniqueness, Believability)
- Purchase intent scales
- Open-ended improvement questions
- Comparative analysis framework

**To customize this proposal, please tell me:**
1. **Client Name:** Who is this for?
2. **Number of Concepts:** How many concepts to test?
3. **Target Audience:** Who should evaluate?
4. **Markets:** Which countries?
5. **Sample Size:** Usually n=150-200 per concept

What information can you provide?`
  },
  {
    id: 'brand-tracking',
    label: 'Brand Tracking',
    response: `Excellent! I've loaded the **Brand Tracking Template**.

**This template includes:**
- Brand funnel metrics (Awareness → Consideration → Usage → Loyalty)
- Brand image and attribute tracking
- Competitive benchmarking framework
- NPS and satisfaction measures

**Standard wave structure:**
- Quarterly or monthly tracking
- Consistent sample per wave for trending
- Competitor comparison included

**To customize, please share:**
1. **Client/Brand:** Which brand are we tracking?
2. **Markets:** Countries and languages
3. **Sample Size:** Typically n=500-1000 per market
4. **Competitors:** Any specific competitors to include?
5. **Key Metrics:** Any specific KPIs to prioritize?

What would you like to start with?`
  },
  {
    id: 'segmentation',
    label: 'Segmentation',
    response: `Perfect! I've loaded the **Segmentation Study Template**.

**This template is designed for:**
- Identifying distinct consumer segments
- Understanding segment needs and motivations
- Developing targeted marketing strategies

**Included methodology:**
- Attitudinal and behavioral questions
- Cluster analysis approach
- Segment profiling variables
- Persona development framework

**Requirements for this study:**
1. **Category:** What product/service category?
2. **Markets:** Which countries?
3. **Sample Size:** Minimum n=1000-1500 for robust segments
4. **Segmentation Base:** Attitudes, behaviors, or hybrid?
5. **Business Questions:** What decisions will this inform?

Tell me about your segmentation needs!`
  },
  {
    id: 'uat',
    label: 'Usage & Attitude',
    response: `Great! I've loaded the **Usage & Attitude (U&A) Template**.

**This comprehensive template covers:**
- Category usage behavior and frequency
- Brand funnel and switching patterns
- Need states and usage occasions
- Attitudes and perceptions
- Media consumption habits

**Typical U&A sections:**
- Category penetration and frequency
- Brand repertoire and loyalty
- Decision journey mapping
- Unmet needs identification

**To build your U&A study, I need:**
1. **Category:** What category are we studying?
2. **Client/Brand:** Who is this for?
3. **Markets:** Which countries?
4. **Target:** Category users or broader population?
5. **Sample Size:** Usually n=1000+ per market

What details can you provide?`
  },
];

// Field configurations with AI chat suggestions (what to ask AI)
const FIELD_CONFIG: Record<string, {
  label: string;
  placeholder: string;
  type: 'text' | 'textarea' | 'number' | 'array';
  chatSuggestions: string[]; // Suggestions for what to type in chat
  description: string;
}> = {
  header: {
    label: 'Proposal Title',
    placeholder: 'Enter a clear, descriptive title...',
    type: 'text',
    description: 'Enter a clear, descriptive title for the proposal',
    chatSuggestions: [
      'Generate a title for a brand tracking study',
      'Suggest a title based on consumer insights research',
      'Create a professional proposal title',
    ],
  },
  background: {
    label: 'Background / Context',
    placeholder: 'Describe the research context and rationale...',
    type: 'textarea',
    description: 'Provide context about the project and why this research is needed',
    chatSuggestions: [
      'Write a background section about market dynamics',
      'Generate context for a new product launch research',
      'Help me describe why this research is needed',
    ],
  },
  businessObjectives: {
    label: 'Business Objectives',
    placeholder: 'Add a business objective...',
    type: 'array',
    description: 'Short bullet list of marketing/business goals',
    chatSuggestions: [
      'Suggest business objectives for brand growth',
      'What objectives should I include for market expansion?',
      'Generate business goals for competitive analysis',
    ],
  },
  researchObjectives: {
    label: 'Research Objectives',
    placeholder: 'Add a research objective (e.g., To understand...)',
    type: 'array',
    description: 'Use "To..." statements and research questions',
    chatSuggestions: [
      'Generate research objectives for consumer behavior study',
      'What research questions should I ask about brand perception?',
      'Suggest "To understand..." statements for U&A research',
    ],
  },
  burningQuestions: {
    label: 'Burning Questions',
    placeholder: 'Add a burning question...',
    type: 'array',
    description: 'Key questions the client wants answered',
    chatSuggestions: [
      'What burning questions should I ask about market trends?',
      'Suggest key questions for brand health tracking',
      'Generate critical questions for segmentation study',
    ],
  },
  targetDefinition: {
    label: 'Target Definition',
    placeholder: 'e.g., Adults 18-45, primary grocery shoppers...',
    type: 'textarea',
    description: 'Define the target audience for this research',
    chatSuggestions: [
      'Define target audience for FMCG research',
      'Suggest target criteria for Gen Z study',
      'Help me define the target for B2B research',
    ],
  },
  sampleSize: {
    label: 'Sample Size',
    placeholder: 'e.g., 1000',
    type: 'number',
    description: 'Total sample size across all markets',
    chatSuggestions: [
      'What sample size do I need for ±3% margin of error?',
      'Calculate sample size for 3 market study',
      'Recommend sample size for segmentation',
    ],
  },
  loi: {
    label: 'LOI (Length of Interview)',
    placeholder: 'e.g., 15',
    type: 'number',
    description: 'Survey duration in minutes',
    chatSuggestions: [
      'What LOI is typical for brand tracking?',
      'Estimate survey length for 30 questions',
      'Suggest appropriate LOI for concept test',
    ],
  },
  markets: {
    label: 'Markets',
    placeholder: 'Add a market (e.g., USA - English)...',
    type: 'array',
    description: 'Add markets with sample sizes and languages',
    chatSuggestions: [
      'Suggest markets for European expansion study',
      'What markets should I include for global launch?',
      'Recommend sample distribution across 5 markets',
    ],
  },
  quotas: {
    label: 'Quota Recommendations',
    placeholder: 'Add a quota recommendation...',
    type: 'array',
    description: 'AI-generated quota recommendations',
    chatSuggestions: [
      'Recommend quotas for representative sample',
      'Generate demographic quotas for US market',
      'Suggest quota structure for Gen rep study',
    ],
  },
  advancedAnalysis: {
    label: 'Advanced Analysis',
    placeholder: 'Add an analysis type...',
    type: 'array',
    description: 'Recommended analysis techniques',
    chatSuggestions: [
      'What analysis methods suit brand tracking?',
      'Recommend advanced analytics for segmentation',
      'Suggest analysis techniques for pricing research',
    ],
  },
  referenceProjects: {
    label: 'Reference Projects',
    placeholder: 'Add a reference project...',
    type: 'array',
    description: 'Link to similar past proposals for reference',
    chatSuggestions: [
      'Find similar brand tracking proposals',
      'Search for reference U&A studies',
      'Show me relevant past projects',
    ],
  },
};

const SYSTEM_PROMPTS = {
  welcome: `Welcome! I'm here to help you create a research proposal.

You can start by:
1. Uploading a brief document
2. Pasting client requirements
3. Describing your research needs

I'll help you fill in all the required sections including:
- Background & Context
- Business Objectives
- Research Objectives
- Target Definition
- Sample Size & Markets
- Quotas & Analysis Recommendations

What would you like to start with?`,

  askForMissing: (missing: string[]) =>
    `Great progress! To complete the proposal, I still need information about:\n\n${missing.map(m => `- ${m}`).join('\n')}\n\nCould you provide details for these?`,
};

export function ChatInterface({
  proposalId,
  activeFieldSection,
  onFieldSectionChange,
  proposalContent,
  onProposalContentUpdate,
}: ChatInterfaceProps) {
  const { getProposalChat, addChatMessage, isAiTyping, setAiTyping, proposals } = useAppStore();

  // Get chat messages for this specific proposal
  const chatMessages = getProposalChat(proposalId);
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [linkAttachments, setLinkAttachments] = useState<ChatAttachment[]>([]);
  const [proposalAttachments, setProposalAttachments] = useState<ChatAttachment[]>([]);
  const [attachmentMode, setAttachmentMode] = useState<AttachmentMode>(null);
  const [linkUrl, setLinkUrl] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [proposalSearchQuery, setProposalSearchQuery] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const [showTemplates, setShowTemplates] = useState(true);
  const [fieldValue, setFieldValue] = useState('');
  const [arrayFieldItems, setArrayFieldItems] = useState<string[]>([]);
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const fieldInputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null);
  const prevActiveFieldSectionRef = useRef<string | null>(null);
  const attachmentMenuRef = useRef<HTMLDivElement>(null);

  // Track which messages should NOT animate (already seen/animated)
  const seenMessagesRef = useRef<Set<string>>(new Set());
  // Track message count for animation detection
  const prevMessageCountRef = useRef<number>(0);
  // Track which messages have been animated
  const animatedMessagesRef = useRef<Set<string>>(new Set());
  // Initialize seen messages on first render (for existing messages)
  const [isInitialized, setIsInitialized] = useState(false);

  const getFieldKey = (sectionId: string): string => {
    const mapping: Record<string, string> = {
      'header': 'title',
      'background': 'background',
      'businessObjectives': 'businessObjectives',
      'researchObjectives': 'researchObjectives',
      'burningQuestions': 'burningQuestions',
      'targetDefinition': 'targetDefinition',
      'sampleSize': 'sampleSize',
      'loi': 'loi',
      'markets': 'markets',
      'quotas': 'quotas',
      'advancedAnalysis': 'advancedAnalysis',
      'referenceProjects': 'referenceProjects',
    };
    return mapping[sectionId] || sectionId;
  };

  // Initialize with welcome message
  useEffect(() => {
    if (chatMessages.length === 0) {
      addChatMessage(proposalId, {
        role: 'assistant',
        content: SYSTEM_PROMPTS.welcome,
      });
    }
  }, [proposalId]);

  // Auto-save current field when switching to a different section
  useEffect(() => {
    const prevSection = prevActiveFieldSectionRef.current;

    // If we're switching from one section to another (not just closing)
    if (prevSection && activeFieldSection && prevSection !== activeFieldSection) {
      const prevConfig = FIELD_CONFIG[prevSection];
      const prevFieldKey = getFieldKey(prevSection);

      // Auto-save the previous field if it has value
      let displayValue = '';
      if (prevConfig?.type === 'array' && arrayFieldItems.length > 0) {
        onProposalContentUpdate?.(prevFieldKey as keyof ProposalContent, arrayFieldItems);
        displayValue = '• ' + arrayFieldItems.join('\n• ');
      } else if (fieldValue.trim()) {
        if (prevConfig?.type === 'number') {
          const numValue = parseInt(fieldValue) || undefined;
          onProposalContentUpdate?.(prevFieldKey as keyof ProposalContent, numValue);
          displayValue = numValue ? String(numValue) : '';
        } else {
          onProposalContentUpdate?.(prevFieldKey as keyof ProposalContent, fieldValue);
          displayValue = fieldValue;
        }
      }

      // Add as chat message if there was a value
      if (displayValue) {
        addChatMessage(proposalId, {
          role: 'assistant',
          content: `${prevConfig?.label || prevSection} filled`,
        });
      }
    }

    // Update ref for next comparison
    prevActiveFieldSectionRef.current = activeFieldSection || null;

    // Load values for the new section from proposalContent
    if (activeFieldSection && proposalContent) {
      const fieldKey = getFieldKey(activeFieldSection);
      const currentValue = proposalContent[fieldKey as keyof ProposalContent];

      if (Array.isArray(currentValue)) {
        setArrayFieldItems(currentValue.map(item =>
          typeof item === 'object' ? JSON.stringify(item) : String(item)
        ));
        setFieldValue('');
      } else if (currentValue !== undefined && currentValue !== null) {
        setFieldValue(String(currentValue));
        setArrayFieldItems([]);
      } else {
        setFieldValue('');
        setArrayFieldItems([]);
      }
    }
  }, [activeFieldSection]);

  // Focus field input when active section changes
  useEffect(() => {
    if (activeFieldSection && fieldInputRef.current) {
      setTimeout(() => fieldInputRef.current?.focus(), 100);
    }
  }, [activeFieldSection]);

  // Handle template selection
  const handleTemplateSelect = (templateId: string) => {
    if (templateId === selectedTemplate) return;

    setSelectedTemplate(templateId);

    const template = templateOptions.find(t => t.id === templateId);
    if (template && template.response) {
      // Add user message indicating template selection
      addChatMessage(proposalId, {
        role: 'user',
        content: `I'd like to use the ${template.label}`,
      });

      // Simulate AI typing
      setAiTyping(true);

      // Add template response after delay
      setTimeout(() => {
        addChatMessage(proposalId, {
          role: 'assistant',
          content: template.response,
        });
        setAiTyping(false);
      }, 800);
    }
  };

  // Custom smooth scroll with easing for a more polished animation
  const smoothScrollToBottom = useCallback((duration: number = 400) => {
    const scrollContainer = scrollContainerRef.current;
    if (!scrollContainer) return;

    const targetPosition = scrollContainer.scrollHeight - scrollContainer.clientHeight;
    const startPosition = scrollContainer.scrollTop;
    const distance = targetPosition - startPosition;

    if (distance <= 0) return; // Already at bottom or no scroll needed

    let startTime: number | null = null;

    // Easing function: easeOutCubic for smooth deceleration
    const easeOutCubic = (t: number): number => 1 - Math.pow(1 - t, 3);

    const animateScroll = (currentTime: number) => {
      if (startTime === null) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);

      scrollContainer.scrollTop = startPosition + (distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }, []);

  // Scroll to bottom on new chat messages
  useEffect(() => {
    smoothScrollToBottom(800);
  }, [chatMessages, smoothScrollToBottom]);

  // Scroll to bottom when activeFieldSection changes (clicking section from RightSidebar)
  useEffect(() => {
    if (activeFieldSection) {
      smoothScrollToBottom(1000);
    }
  }, [activeFieldSection, smoothScrollToBottom]);

  // Close attachment menu on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (attachmentMenuRef.current && !attachmentMenuRef.current.contains(event.target as Node)) {
        setAttachmentMode(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered proposals for search
  const filteredProposals = useMemo(() => {
    if (!proposalSearchQuery.trim()) return proposals;
    const query = proposalSearchQuery.toLowerCase();
    return proposals.filter(
      (p) =>
        (p.content.title || '').toLowerCase().includes(query) ||
        (p.content.client || '').toLowerCase().includes(query) ||
        p.status.toLowerCase().includes(query)
    );
  }, [proposals, proposalSearchQuery]);

  // All pending attachments combined
  const allPendingAttachments = useMemo(() => {
    const fileAtts = attachments.map(f => ({ name: f.name, type: f.type, size: f.size }));
    return [...fileAtts, ...linkAttachments, ...proposalAttachments];
  }, [attachments, linkAttachments, proposalAttachments]);

  const handleSend = async () => {
    const hasContent = input.trim();
    const hasAttachments = attachments.length > 0 || linkAttachments.length > 0 || proposalAttachments.length > 0;
    if (!hasContent && !hasAttachments) return;

    // Auto-save active field if there's unsaved content
    if (activeFieldSection && onProposalContentUpdate) {
      const fieldKey = getFieldKey(activeFieldSection);
      const config = FIELD_CONFIG[activeFieldSection];

      let hasContent = false;

      if (config?.type === 'array' && arrayFieldItems.length > 0) {
        hasContent = true;
        onProposalContentUpdate(fieldKey as keyof ProposalContent, arrayFieldItems);
      } else if (config?.type === 'number' && fieldValue) {
        const numValue = parseInt(fieldValue) || undefined;
        if (numValue) {
          hasContent = true;
          onProposalContentUpdate(fieldKey as keyof ProposalContent, numValue);
        }
      } else if (fieldValue.trim()) {
        hasContent = true;
        onProposalContentUpdate(fieldKey as keyof ProposalContent, fieldValue);
      }

      // Always add field form to chat (filled or empty)
      const formValue = config?.type === 'array'
        ? [...arrayFieldItems]
        : config?.type === 'number'
          ? (parseInt(fieldValue) || '')
          : fieldValue;

      addChatMessage(proposalId, {
        role: 'assistant',
        content: `${config?.label || activeFieldSection} ${hasContent ? 'filled' : '(empty)'}`,
        fieldForm: {
          sectionId: activeFieldSection,
          label: config?.label || activeFieldSection,
          type: config?.type || 'text',
          value: formValue,
        },
      });

      // Close the field editor
      onFieldSectionChange?.(null);
      setFieldValue('');
      setArrayFieldItems([]);
    }

    // Create message attachments from all sources
    const fileAtts = attachments.map((f) => ({
      id: crypto.randomUUID(),
      name: f.name,
      type: f.type,
      url: URL.createObjectURL(f),
    }));
    const linkAtts = linkAttachments.map((l) => ({
      id: crypto.randomUUID(),
      name: l.name,
      type: l.type,
      url: l.url || '',
    }));
    const propAtts = proposalAttachments.map((p) => ({
      id: crypto.randomUUID(),
      name: p.name,
      type: p.type,
      url: '',
    }));
    const messageAttachments = [...fileAtts, ...linkAtts, ...propAtts];

    // Add user message
    addChatMessage(proposalId, {
      role: 'user',
      content: input,
      attachments: messageAttachments.length > 0 ? messageAttachments : undefined,
    });

    setInput('');
    setAttachments([]);
    setLinkAttachments([]);
    setProposalAttachments([]);
    setAiTyping(true);

    // Simulate AI response (in real app, this would call an API)
    setTimeout(() => {
      const response = generateAIResponse(input);
      addChatMessage(proposalId, {
        role: 'assistant',
        content: response,
      });
      setAiTyping(false);
    }, 1500);
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();

    // Brand tracking study
    if (lowerMessage.includes('brand') && (lowerMessage.includes('track') || lowerMessage.includes('health'))) {
      return `I understand you're looking to set up a **Brand Health Tracking** study.

**Recommended Structure:**
- Frequency: Quarterly or Monthly waves
- Core metrics: Awareness, Consideration, Usage, NPS
- Competitive benchmarking included

**I'll need a few details:**
1. **Markets:** Which countries should this cover?
2. **Target Audience:** Who are we surveying?
3. **Sample Size:** Typically n=500-1000 per market
4. **Competitors:** Any specific brands to track alongside?

Click on the sections in the sidebar to fill in each field, or tell me the details here!`;
    }

    // Default contextual response
    return `Thank you for that information! I'm analyzing what you've shared.

**Here's what I've captured:**
✓ Initial project context received
✓ Building proposal structure

**To complete the proposal, I'll need:**
- **Client Name:** Who is this research for?
- **Research Type:** Brand tracking, Concept test, U&A, Segmentation?
- **Target Audience:** Who should we survey?
- **Sample Size:** Total completes needed
- **Markets:** Countries and languages

You can click on sections in the right sidebar to fill in details, or share them here. What would you like to provide next?`;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
    e.target.value = '';
    setAttachmentMode(null);
  };

  const removeAttachment = (index: number) => {
    const fileCount = attachments.length;
    const linkCount = linkAttachments.length;
    if (index < fileCount) {
      setAttachments(attachments.filter((_, i) => i !== index));
    } else if (index < fileCount + linkCount) {
      setLinkAttachments(linkAttachments.filter((_, i) => i !== index - fileCount));
    } else {
      setProposalAttachments(proposalAttachments.filter((_, i) => i !== index - fileCount - linkCount));
    }
  };

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const files = e.dataTransfer.files;
    if (files) setAttachments(prev => [...prev, ...Array.from(files)]);
    setAttachmentMode(null);
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;
    setLinkAttachments(prev => [...prev, { name: linkUrl.trim(), type: 'link', url: linkUrl.trim() }]);
    setLinkUrl('');
    setAttachmentMode(null);
  };

  const handleAddProposal = (proposalIdToAdd: string) => {
    const selectedProposal = proposals.find((p) => p.id === proposalIdToAdd);
    if (!selectedProposal) return;
    setProposalAttachments(prev => [...prev, {
      name: selectedProposal.content.title || 'Untitled Proposal',
      type: 'proposal',
      proposalId: selectedProposal.id,
      proposalStatus: selectedProposal.status,
    }]);
    setAttachmentMode(null);
  };

  // Field input handlers
  const handleFieldSave = useCallback(() => {
    if (!activeFieldSection || !onProposalContentUpdate) return;

    const fieldKey = getFieldKey(activeFieldSection);
    const config = FIELD_CONFIG[activeFieldSection];

    let displayValue = '';

    if (config?.type === 'array') {
      onProposalContentUpdate(fieldKey as keyof ProposalContent, arrayFieldItems);
      displayValue = arrayFieldItems.join('\n• ');
      if (displayValue) displayValue = '• ' + displayValue;
    } else if (config?.type === 'number') {
      const numValue = parseInt(fieldValue) || undefined;
      onProposalContentUpdate(fieldKey as keyof ProposalContent, numValue);
      displayValue = numValue ? String(numValue) : '';
    } else {
      onProposalContentUpdate(fieldKey as keyof ProposalContent, fieldValue);
      displayValue = fieldValue;
    }

    // Add saved field as a chat message with fieldForm data for chronological order
    if (displayValue) {
      const formValue = config?.type === 'array'
        ? [...arrayFieldItems]
        : config?.type === 'number'
          ? parseInt(fieldValue) || 0
          : fieldValue;

      addChatMessage(proposalId, {
        role: 'assistant',
        content: `${config?.label || activeFieldSection} filled`,
        fieldForm: {
          sectionId: activeFieldSection,
          label: config?.label || activeFieldSection,
          type: config?.type || 'text',
          value: formValue,
        },
      });
    }

    // Close the editor after save
    onFieldSectionChange?.(null);
    setFieldValue('');
    setArrayFieldItems([]);
  }, [activeFieldSection, fieldValue, arrayFieldItems, onProposalContentUpdate, onFieldSectionChange, addChatMessage, proposalId]);

  const handleAddArrayItem = useCallback(() => {
    if (fieldValue.trim()) {
      setArrayFieldItems(prev => [...prev, fieldValue.trim()]);
      setFieldValue('');
      fieldInputRef.current?.focus();
    }
  }, [fieldValue]);

  const handleRemoveArrayItem = useCallback((index: number) => {
    setArrayFieldItems(prev => prev.filter((_, i) => i !== index));
  }, []);

  // Handle field cancel - add empty form to chat and close
  const handleFieldCancel = useCallback(() => {
    if (!activeFieldSection) return;

    const config = FIELD_CONFIG[activeFieldSection];

    // Determine current value (could be empty)
    const formValue = config?.type === 'array'
      ? [...arrayFieldItems]
      : config?.type === 'number'
        ? (parseInt(fieldValue) || '')
        : fieldValue;

    // Add field form to chat (even if empty)
    addChatMessage(proposalId, {
      role: 'assistant',
      content: `${config?.label || activeFieldSection} ${fieldValue.trim() || arrayFieldItems.length > 0 ? 'filled' : '(empty)'}`,
      fieldForm: {
        sectionId: activeFieldSection,
        label: config?.label || activeFieldSection,
        type: config?.type || 'text',
        value: formValue,
      },
    });

    // Close the editor
    onFieldSectionChange?.(null);
    setFieldValue('');
    setArrayFieldItems([]);
  }, [activeFieldSection, fieldValue, arrayFieldItems, onFieldSectionChange, addChatMessage, proposalId]);

  const handleFieldKeyDown = (e: React.KeyboardEvent) => {
    const config = FIELD_CONFIG[activeFieldSection || ''];
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (config?.type === 'array') {
        handleAddArrayItem();
      } else {
        handleFieldSave();
      }
    }
    if (e.key === 'Escape') {
      onFieldSectionChange?.(null);
    }
  };

  const activeFieldConfig = activeFieldSection ? FIELD_CONFIG[activeFieldSection] : null;

  // Handle chat suggestion click - fills the chat input
  const handleChatSuggestionClick = useCallback((suggestion: string) => {
    setInput(suggestion);
  }, []);

  return (
    <div className="flex h-full flex-col relative">
      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">
        <div className="mx-auto max-w-3xl space-y-4">
          {(() => {
            // Calculate which messages should animate during this render
            const messagesToAnimate = new Set<string>();

            chatMessages.forEach((message, index) => {
              // A message should animate if:
              // 1. It's an assistant message
              // 2. It hasn't been animated before
              // 3. It's a new message (index >= previous count)
              const isNewMessage = index >= prevMessageCountRef.current;
              if (message.role === 'assistant' &&
                  !animatedMessagesRef.current.has(message.id) &&
                  isNewMessage) {
                messagesToAnimate.add(message.id);
                animatedMessagesRef.current.add(message.id);
              }
            });

            // Update the count for next render
            prevMessageCountRef.current = chatMessages.length;

            return chatMessages.map((message) => (
              <ChatMessageItem
                key={message.id}
                message={message}
                shouldAnimate={messagesToAnimate.has(message.id)}
                copiedMessageId={copiedMessageId}
                onCopy={(id, content) => {
                  navigator.clipboard.writeText(content);
                  setCopiedMessageId(id);
                  setTimeout(() => setCopiedMessageId(null), 2000);
                }}
              />
            ));
          })()}

          <AITypingIndicator isVisible={isAiTyping} estimatedTime={3} />

          {/* Active Field Editor - Inside chat flow (like Research Calculators) */}
          {activeFieldSection && activeFieldConfig && (
            <div className="flex items-start gap-3 animate-in fade-in-0 slide-in-from-bottom-2 duration-300">
              <div className="flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#5B50BD] dark:bg-[#918AD3] flex items-center justify-center mt-0.5">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white dark:text-[#100E28]" />
              </div>

              <div className="flex-1 space-y-3">
                <div className="text-sm leading-relaxed text-gray-600 dark:text-gray-300">
                  <TypewriterText
                    key={activeFieldSection}
                    text={`Fill in ${activeFieldConfig.label} below:`}
                    speed={12}
                  />
                </div>

                <div className="space-y-2">
                  {activeFieldConfig.type === 'array' && arrayFieldItems.length > 0 && (
                    <div className="space-y-1">
                      {arrayFieldItems.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 group"
                        >
                          <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{item}</span>
                          <button
                            onClick={() => handleRemoveArrayItem(index)}
                            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-400"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-2">
                    {activeFieldConfig.type === 'textarea' ? (
                      <textarea
                        ref={fieldInputRef as React.RefObject<HTMLTextAreaElement>}
                        value={fieldValue}
                        onChange={(e) => setFieldValue(e.target.value)}
                        onKeyDown={handleFieldKeyDown}
                        placeholder={activeFieldConfig.placeholder}
                        rows={4}
                        className={cn(
                          'flex-1 px-3 py-2 rounded-lg text-sm',
                          'border border-gray-300 dark:border-[#3D3766]',
                          'bg-white dark:bg-gray-800',
                          'text-gray-900 dark:text-gray-100',
                          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                          'focus:outline-none focus:ring-2 focus:ring-[#5B50BD]/30 focus:border-transparent',
                          'resize-none transition-all duration-150'
                        )}
                      />
                    ) : (
                      <input
                        ref={fieldInputRef as React.RefObject<HTMLInputElement>}
                        type={activeFieldConfig.type === 'number' ? 'number' : 'text'}
                        value={fieldValue}
                        onChange={(e) => setFieldValue(e.target.value)}
                        onKeyDown={handleFieldKeyDown}
                        placeholder={activeFieldConfig.placeholder}
                        className={cn(
                          'flex-1 h-9 px-3 py-2 rounded-lg text-sm',
                          'border border-gray-300 dark:border-[#3D3766]',
                          'bg-white dark:bg-gray-800',
                          'text-gray-900 dark:text-gray-100',
                          'placeholder:text-gray-400 dark:placeholder:text-gray-500',
                          'focus:outline-none focus:ring-2 focus:ring-[#5B50BD]/30 focus:border-transparent',
                          'transition-all duration-150'
                        )}
                      />
                    )}
                    {activeFieldConfig.type === 'array' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleAddArrayItem}
                        disabled={!fieldValue.trim()}
                        className="h-9"
                      >
                        Add
                      </Button>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleFieldSave}
                    className="gap-1.5"
                    disabled={activeFieldConfig.type === 'array'
                      ? arrayFieldItems.length === 0
                      : !fieldValue.trim()
                    }
                  >
                    <Check className="w-3.5 h-3.5" />
                    Save
                  </Button>
                  <button
                    onClick={handleFieldCancel}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border text-gray-600 border-gray-200 hover:bg-gray-100 dark:text-gray-400 dark:border-gray-700 dark:hover:bg-gray-800"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Extra padding at bottom for better scroll - enough space for floating templates */}
          <div ref={messagesEndRef} className="h-24" />
        </div>
      </div>

      {/* Bottom Input Area */}
      <div className="relative">
        {/* Floating Template Selection - At bottom, no card background */}
        <div className={cn(
          'absolute -top-12 left-1/2 -translate-x-1/2 z-10',
          'flex items-center gap-2',
          'transition-all duration-300',
          showTemplates && !activeFieldSection ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}>
          <div className="flex items-center gap-1.5">
            {templateOptions.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                disabled={isAiTyping}
                className={cn(
                  'rounded-full px-3 py-1.5 text-xs font-medium transition-all whitespace-nowrap',
                  selectedTemplate === template.id
                    ? 'bg-[#5B50BD] text-white shadow-md'
                    : 'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-700 shadow-sm',
                  isAiTyping && 'opacity-50 cursor-not-allowed'
                )}
              >
                {template.label}
              </button>
            ))}
          </div>
          {/* Hide/Show toggle */}
          <button
            onClick={() => setShowTemplates(false)}
            className={cn(
              'p-1.5 rounded-full',
              'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
              'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300',
              'shadow-sm transition-all'
            )}
            title="Hide templates"
          >
            <X className="w-3 h-3" />
          </button>
        </div>

        {/* Show Templates Button - when hidden and no field active */}
        {!showTemplates && !activeFieldSection && (
          <button
            onClick={() => setShowTemplates(true)}
            className={cn(
              'absolute -top-10 left-1/2 -translate-x-1/2 z-10',
              'flex items-center gap-1.5 px-3 py-1.5 rounded-full',
              'bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm',
              'text-xs text-gray-500 dark:text-gray-400',
              'hover:bg-white dark:hover:bg-gray-700',
              'shadow-sm transition-all'
            )}
          >
            <Sparkles className="w-3 h-3" />
            <span>Templates</span>
          </button>
        )}

        {/* Floating Chat Suggestions - when field is active */}
        {activeFieldSection && activeFieldConfig && (
          <div className={cn(
            'absolute -top-8 left-1/2 -translate-x-1/2 z-10',
            'flex items-center gap-1.5',
            'transition-all duration-300'
          )}>
            {activeFieldConfig.chatSuggestions.slice(0, 2).map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleChatSuggestionClick(suggestion)}
                className={cn(
                  'rounded-full px-2.5 py-1 text-[10px] font-medium transition-all whitespace-nowrap',
                  'bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm',
                  'text-[#5B50BD] dark:text-[#918AD3]',
                  'hover:bg-[#5B50BD]/10 dark:hover:bg-[#5B50BD]/20',
                  'shadow-sm border border-[#5B50BD]/20'
                )}
              >
                {suggestion.length > 35 ? suggestion.substring(0, 35) + '...' : suggestion}
              </button>
            ))}
          </div>
        )}

        {/* Input Area */}
        <div className="p-4">
          <div className="mx-auto max-w-3xl">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              multiple
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.png,.jpg,.jpeg,.xlsx,.csv"
            />

            {/* Attachments Preview - ChatGPT Style */}
            {allPendingAttachments.length > 0 && (
              <div className="mb-3">
                <AttachmentPreviewCompact
                  attachments={allPendingAttachments}
                  onRemove={removeAttachment}
                />
              </div>
            )}

            <div className="flex items-end gap-2">
              {/* Attachment Menu Button */}
              <div className="relative flex-shrink-0" ref={attachmentMenuRef}>
                <button
                  onClick={() => setAttachmentMode(attachmentMode ? null : 'menu')}
                  className={cn(
                    'p-2 rounded-lg transition-colors',
                    attachmentMode
                      ? 'text-[#5B50BD] bg-[#5B50BD]/10'
                      : 'text-gray-400 hover:text-[#5B50BD] hover:bg-[#5B50BD]/10'
                  )}
                  title="Add files, link or proposal"
                >
                  <Paperclip className="w-5 h-5" />
                </button>

                {/* Attachment Panel */}
                {attachmentMode && (
                  <div className="absolute bottom-full left-0 mb-2 w-80 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden">
                    {/* Files */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <Upload className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-500">Files</span>
                      </div>
                      <div
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        className={cn(
                          'border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-all',
                          dragOver ? 'border-[#5B50BD] bg-[#5B50BD]/5' : 'border-gray-300 dark:border-gray-600 hover:border-[#5B50BD]'
                        )}
                      >
                        <p className="text-xs text-gray-500">Drop files or click to upload</p>
                      </div>
                    </div>

                    {/* Links */}
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <LinkIcon className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-500">Add Link</span>
                      </div>
                      <div className="flex gap-2">
                        <input
                          type="url"
                          value={linkUrl}
                          onChange={(e) => setLinkUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="flex-1 px-2 py-1.5 text-xs border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                          onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddLink(); } }}
                        />
                        <button
                          onClick={handleAddLink}
                          disabled={!linkUrl.trim()}
                          className={cn(
                            'px-3 py-1.5 text-xs font-medium rounded-lg transition-colors',
                            linkUrl.trim() ? 'bg-[#5B50BD] text-white hover:bg-[#4A41A0]' : 'bg-gray-200 dark:bg-gray-600 text-gray-400 cursor-not-allowed'
                          )}
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Proposals */}
                    <div className="p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Briefcase className="w-4 h-4 text-gray-500" />
                        <span className="text-xs font-medium text-gray-500">Link Proposal</span>
                      </div>
                      <input
                        type="text"
                        value={proposalSearchQuery}
                        onChange={(e) => setProposalSearchQuery(e.target.value)}
                        placeholder="Search proposals..."
                        className="w-full px-2 py-1.5 text-xs border border-gray-200 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-[#5B50BD] mb-2"
                      />
                      <div className="max-h-32 overflow-y-auto space-y-1">
                        {filteredProposals.length > 0 ? (
                          filteredProposals.map((proposal) => (
                            <button
                              key={proposal.id}
                              onClick={() => handleAddProposal(proposal.id)}
                              className="w-full flex items-center gap-2 px-2 py-1.5 text-left text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                            >
                              <Briefcase className="w-3 h-3 text-[#5B50BD] flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <p className="truncate font-medium">{proposal.content.title || 'Untitled'}</p>
                                <p className="text-[10px] text-gray-500 capitalize">{proposal.status}</p>
                              </div>
                            </button>
                          ))
                        ) : (
                          <p className="py-2 text-xs text-gray-500 text-center">
                            {proposalSearchQuery ? 'No proposals found' : 'No proposals available'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative flex-1">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={activeFieldSection && activeFieldConfig
                    ? `Ask AI about ${activeFieldConfig.label.toLowerCase()}...`
                    : "Type your message or paste brief content..."}
                  className="min-h-[44px] resize-none pr-12"
                  rows={1}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() && allPendingAttachments.length === 0}
                  className={cn(
                    'absolute bottom-1.5 right-1.5 h-8 w-8 rounded-lg flex items-center justify-center transition-all duration-200',
                    input.trim() || allPendingAttachments.length > 0
                      ? 'bg-[#5B50BD] text-white hover:bg-[#4A41A0] shadow-sm'
                      : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>

            <p className="mt-2 text-center text-xs text-gray-400">
              Press Enter to send, Shift+Enter for new line. Click sidebar sections to edit fields.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Typing cursor component - ChatGPT style blinking
function TypingCursor() {
  return (
    <span
      className="inline-block w-0.5 h-4 ml-0.5 bg-[#5B50BD] dark:bg-[#918AD3] align-text-bottom"
      style={{ animation: 'blink 0.8s step-end infinite' }}
    />
  );
}

// Typewriter effect component for AI messages - ChatGPT style
function TypewriterText({ text, speed = 12 }: { text: string; speed?: number }) {
  const [displayedText, setDisplayedText] = useState('');
  const [isComplete, setIsComplete] = useState(false);
  const hasAnimatedRef = useRef(false);

  useEffect(() => {
    // Only animate once per message
    if (hasAnimatedRef.current) {
      setDisplayedText(text);
      setIsComplete(true);
      return;
    }

    hasAnimatedRef.current = true;
    let currentIndex = 0;
    setDisplayedText('');
    setIsComplete(false);

    // Word-by-word animation for more natural ChatGPT feel
    const words = text.split(/(\s+)/); // Split by whitespace but keep delimiters
    let wordIndex = 0;
    let charInWordIndex = 0;

    const animate = () => {
      if (wordIndex >= words.length) {
        setIsComplete(true);
        return;
      }

      const currentWord = words[wordIndex];

      // For whitespace, add it all at once
      if (/^\s+$/.test(currentWord)) {
        currentIndex += currentWord.length;
        setDisplayedText(text.slice(0, currentIndex));
        wordIndex++;
        charInWordIndex = 0;
        setTimeout(animate, speed / 2);
        return;
      }

      // For words, add 2-3 characters at a time for smooth flow
      const chunkSize = Math.min(2, currentWord.length - charInWordIndex);
      charInWordIndex += chunkSize;
      currentIndex += chunkSize;
      setDisplayedText(text.slice(0, currentIndex));

      if (charInWordIndex >= currentWord.length) {
        wordIndex++;
        charInWordIndex = 0;
      }

      if (currentIndex < text.length) {
        setTimeout(animate, speed);
      } else {
        setIsComplete(true);
      }
    };

    const timeoutId = setTimeout(animate, 50);
    return () => clearTimeout(timeoutId);
  }, [text, speed]);

  // Parse and format markdown (bold, bullet points)
  const formatText = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, lineIdx) => {
      // Handle bullet points
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
        const bulletContent = line.slice(2);
        return (
          <div key={lineIdx} className="flex gap-2 ml-2">
            <span className="text-[#5B50BD] dark:text-[#918AD3]">•</span>
            <span>{formatInline(bulletContent)}</span>
          </div>
        );
      }
      // Handle numbered lists
      if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+\.)\s(.*)$/);
        if (match) {
          return (
            <div key={lineIdx} className="flex gap-2 ml-2">
              <span className="text-[#5B50BD] dark:text-[#918AD3] font-medium">{match[1]}</span>
              <span>{formatInline(match[2])}</span>
            </div>
          );
        }
      }
      // Empty line
      if (!line.trim()) {
        return <div key={lineIdx} className="h-2" />;
      }
      return <div key={lineIdx}>{formatInline(line)}</div>;
    });
  };

  // Format inline elements (bold, checkmarks)
  const formatInline = (content: string) => {
    // Handle **bold** text
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, idx) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return (
          <strong key={idx} className="font-semibold text-[#5B50BD] dark:text-[#918AD3]">
            {part.slice(2, -2)}
          </strong>
        );
      }
      // Handle checkmarks
      if (part.includes('✓')) {
        return part.split(/(✓)/g).map((subpart, subIdx) =>
          subpart === '✓' ? (
            <span key={`${idx}-${subIdx}`} className="text-green-500">✓</span>
          ) : (
            <span key={`${idx}-${subIdx}`}>{subpart}</span>
          )
        );
      }
      return part;
    });
  };

  return (
    <div className="space-y-1">
      {formatText(displayedText)}
      {!isComplete && <TypingCursor />}
    </div>
  );
}

function ChatMessageItem({
  message,
  shouldAnimate = false,
  copiedMessageId,
  onCopy,
}: {
  message: ChatMessage;
  shouldAnimate?: boolean;
  copiedMessageId?: string | null;
  onCopy?: (id: string, content: string) => void;
}) {
  const isUser = message.role === 'user';

  // Render inactive field form
  const renderFieldForm = () => {
    if (!message.fieldForm) return null;

    const { type, value } = message.fieldForm;

    if (type === 'array') {
      const items = Array.isArray(value) ? value : [];
      return (
        <div className="mt-3 space-y-1.5">
          {items.length > 0 ? (
            items.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700"
              >
                <span className="text-sm text-gray-600 dark:text-gray-400">{item}</span>
              </div>
            ))
          ) : (
            <input
              type="text"
              value=""
              placeholder="(empty)"
              readOnly
              disabled
              className={cn(
                'w-full px-3 py-2 rounded-lg text-sm h-9',
                'bg-gray-100 dark:bg-gray-800/50',
                'border border-gray-200 dark:border-gray-700',
                'text-gray-400 dark:text-gray-500',
                'opacity-70 cursor-not-allowed'
              )}
            />
          )}
        </div>
      );
    }

    if (type === 'textarea') {
      return (
        <div className="mt-3">
          <textarea
            value={String(value || '')}
            placeholder={!value ? '(empty)' : ''}
            readOnly
            disabled
            className={cn(
              'w-full px-3 py-2 rounded-lg text-sm resize-none',
              'bg-gray-100 dark:bg-gray-800/50',
              'border border-gray-200 dark:border-gray-700',
              !value ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400',
              'opacity-70 cursor-not-allowed'
            )}
            rows={4}
          />
        </div>
      );
    }

    // Text or number input
    return (
      <div className="mt-3">
        <input
          type={type === 'number' ? 'number' : 'text'}
          value={String(value || '')}
          placeholder={!value ? '(empty)' : ''}
          readOnly
          disabled
          className={cn(
            'w-full px-3 py-2 rounded-lg text-sm h-9',
            'bg-gray-100 dark:bg-gray-800/50',
            'border border-gray-200 dark:border-gray-700',
            !value ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400',
            'opacity-70 cursor-not-allowed'
          )}
        />
      </div>
    );
  };

  return (
    <div className={cn('group flex items-start gap-3', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0',
          isUser ? 'bg-gray-200 dark:bg-gray-700' : 'bg-[#EDE9F9] dark:bg-[#231E51]'
        )}
      >
        {isUser ? (
          <User className="h-5 w-5 text-gray-600" />
        ) : (
          <Bot className="h-5 w-5 text-[#5B50BD] dark:text-[#918AD3]" />
        )}
      </div>

      <div className={cn(
        // Full width for fieldForm messages to match active input width
        message.fieldForm ? 'flex-1' : 'max-w-[80%]',
        isUser && 'text-right'
      )}>
        <div className="flex flex-col gap-2">
          {/* Attachments - ChatGPT Style (outside message bubble) */}
          {message.attachments && message.attachments.length > 0 && (
            <ChatMessageAttachmentsCompact
              attachments={message.attachments.map((att): ChatAttachment => ({
                name: att.name,
                type: att.type,
                url: att.url,
              }))}
              align={isUser ? 'end' : 'start'}
            />
          )}

          {/* Message bubble - only show if there's actual text content */}
          {message.content && message.content.trim() && (
            <div
              className={cn(
                'rounded-lg px-4 py-3',
                isUser ? 'bg-[#5B50BD] text-white' : 'text-gray-800 dark:text-gray-200'
              )}
            >
              <div className="whitespace-pre-wrap text-sm">
                {shouldAnimate ? (
                  <TypewriterText text={message.content} speed={8} />
                ) : (
                  message.content
                )}
              </div>

              {/* Render inactive field form if present */}
              {renderFieldForm()}
            </div>
          )}

          {/* Field form without text */}
          {(!message.content || !message.content.trim()) && message.fieldForm && (
            <div className="text-gray-800 dark:text-gray-200">
              {renderFieldForm()}
            </div>
          )}
        </div>
        {/* Action buttons on hover */}
        <div className={cn(
          'flex items-center gap-1 mt-1 opacity-0 group-hover:opacity-100 transition-opacity',
          isUser ? 'justify-end' : 'justify-start'
        )}>
          <button
            onClick={() => onCopy?.(message.id, message.content)}
            className={cn(
              'p-1 rounded transition-colors',
              copiedMessageId === message.id
                ? 'text-green-500'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700'
            )}
            title={copiedMessageId === message.id ? 'Copied!' : 'Copy'}
          >
            {copiedMessageId === message.id ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
          </button>
          <span className="text-xs text-gray-400 ml-1">
            {formatDateTime(message.timestamp)}
          </span>
        </div>
      </div>
    </div>
  );
}
