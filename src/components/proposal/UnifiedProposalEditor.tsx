'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import {
  Send,
  Paperclip,
  Sparkles,
  ChevronRight,
  ChevronDown,
  Users,
  Clock,
  ClipboardCheck,
  Save,
  Upload,
  FileDown,
  RotateCcw,
  X,
  Check,
  Loader2,
  AtSign,
  Wand2,
  FileText,
  Building2,
  Target,
  BarChart3,
  Globe,
  Calendar,
  DollarSign,
  Lightbulb,
  MessageSquare,
  History,
} from 'lucide-react';
import { Card, CardContent, Input, Textarea, Button, Badge, toast } from '@/components/ui';
import { CoworkingHeader, ShareSessionModal, CollaboratorCursors } from '@/components/coworking';
import { useProposalSession } from './hooks/useProposalSession';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import type { Proposal, ProposalContent } from '@/types';

interface UnifiedProposalEditorProps {
  proposal: Proposal;
  onSave: (content: ProposalContent) => void;
}

// Proposal sections for right sidebar navigation
const PROPOSAL_SECTIONS = [
  { id: 'header', label: 'Header Information', icon: FileText, color: 'bg-rose-100 dark:bg-rose-900/30' },
  { id: 'background', label: 'Background', icon: Lightbulb, color: 'bg-yellow-100 dark:bg-yellow-900/30' },
  { id: 'objectives', label: 'Objectives', icon: Target, color: 'bg-green-100 dark:bg-green-900/30' },
  { id: 'methodology', label: 'Methodology', icon: BarChart3, color: 'bg-cyan-100 dark:bg-cyan-900/30' },
  { id: 'sample', label: 'Sample & Quotas', icon: Users, color: 'bg-blue-100 dark:bg-blue-900/30' },
  { id: 'markets', label: 'Markets', icon: Globe, color: 'bg-purple-100 dark:bg-purple-900/30' },
  { id: 'timeline', label: 'Timeline', icon: Calendar, color: 'bg-pink-100 dark:bg-pink-900/30' },
  { id: 'pricing', label: 'Pricing', icon: DollarSign, color: 'bg-red-100 dark:bg-red-900/30' },
];

// AI suggestion templates
const AI_TEMPLATES = [
  'Generate background section',
  'Suggest research objectives',
  'Create sample quotas',
  'Generate timeline',
  'Suggest methodology',
];

export function UnifiedProposalEditor({ proposal, onSave }: UnifiedProposalEditorProps) {
  const { proposals } = useAppStore();
  const [content, setContent] = useState<ProposalContent>(proposal.content);
  const [activeSection, setActiveSection] = useState('header');
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(false);

  // AI Chat state
  const [chatInput, setChatInput] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'ai'; content: string }>>([]);

  // Field-level AI suggestions
  const [showAISuggestions, setShowAISuggestions] = useState<Record<string, boolean>>({});
  const [aiSuggestions, setAiSuggestions] = useState<Record<string, string[]>>({});

  // Modals
  const [showVersions, setShowVersions] = useState(false);
  const [showFeasibility, setShowFeasibility] = useState(false);

  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get current user
  const { currentUser } = useAppStore();

  // Coworking session
  const {
    session,
    isSessionActive,
    startSession,
    updateSessionName,
    inviteUser,
    removeUser,
    generateShareLink,
    updateAccessLevel,
    showShareModal,
    setShowShareModal,
  } = useProposalSession();

  // Filter proposals for @ mentions
  const filteredProposals = useMemo(() => {
    if (!mentionQuery) return proposals.slice(0, 5);
    const query = mentionQuery.toLowerCase();
    return proposals
      .filter(p =>
        p.content.title?.toLowerCase().includes(query) ||
        p.content.client?.toLowerCase().includes(query) ||
        p.code?.toLowerCase().includes(query)
      )
      .slice(0, 5);
  }, [proposals, mentionQuery]);

  // Handle chat input changes
  const handleChatInputChange = (value: string) => {
    setChatInput(value);

    // Check for @ mention
    const lastAtIndex = value.lastIndexOf('@');
    if (lastAtIndex !== -1) {
      const afterAt = value.substring(lastAtIndex + 1);
      if (!afterAt.includes(' ')) {
        setShowMentions(true);
        setMentionQuery(afterAt);
        return;
      }
    }
    setShowMentions(false);
    setMentionQuery('');
  };

  // Handle mention selection
  const handleSelectMention = (proposal: Proposal) => {
    const lastAtIndex = chatInput.lastIndexOf('@');
    const newInput = chatInput.substring(0, lastAtIndex) +
      `@[${proposal.content.title || proposal.code || 'Untitled'}] `;
    setChatInput(newInput);
    setShowMentions(false);
    setMentionQuery('');
    chatInputRef.current?.focus();
  };

  // Handle AI chat submit
  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isProcessing) return;

    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    setIsProcessing(true);

    // Simulate AI response
    setTimeout(() => {
      let aiResponse = '';

      if (userMessage.toLowerCase().includes('background')) {
        aiResponse = 'I can help you create a compelling background section. Based on similar proposals, I suggest including: market context, client challenges, and research rationale. Would you like me to draft this section?';
      } else if (userMessage.toLowerCase().includes('objective')) {
        aiResponse = 'For research objectives, consider including: primary business objectives, specific research questions, and expected outcomes. Should I generate some suggestions based on your target audience?';
      } else if (userMessage.toLowerCase().includes('sample') || userMessage.toLowerCase().includes('quota')) {
        aiResponse = 'For sample design, I recommend considering: demographic quotas, geographic distribution, and screening criteria. What is your target sample size?';
      } else {
        aiResponse = 'I can help you with your proposal. What specific section would you like assistance with? You can mention sections like background, objectives, methodology, sample, or timeline.';
      }

      setChatMessages(prev => [...prev, { role: 'ai', content: aiResponse }]);
      setIsProcessing(false);
    }, 1500);
  };

  // Handle AI template click
  const handleTemplateClick = (template: string) => {
    setChatInput(template);
    chatInputRef.current?.focus();
  };

  // Generate AI suggestions for a field
  const generateFieldSuggestions = (fieldId: string) => {
    setShowAISuggestions(prev => ({ ...prev, [fieldId]: true }));

    // Simulate generating suggestions
    setTimeout(() => {
      let suggestions: string[] = [];

      switch (fieldId) {
        case 'title':
          suggestions = [
            `${content.client || 'Brand'} Market Research Study 2024`,
            `Consumer Insights Research - ${content.client || 'Client'}`,
            `${content.client || 'Brand'} Customer Experience Survey`,
          ];
          break;
        case 'background':
          suggestions = [
            'The client is seeking to understand current market dynamics and consumer preferences in their target segment.',
            'This research aims to provide actionable insights for strategic decision-making and market positioning.',
            'Following recent market changes, the client needs updated consumer behavior data.',
          ];
          break;
        case 'objectives':
          suggestions = [
            'Understand key drivers of purchase decisions',
            'Identify unmet consumer needs and pain points',
            'Evaluate brand perception and competitive positioning',
          ];
          break;
        default:
          suggestions = [
            'AI-generated suggestion 1',
            'AI-generated suggestion 2',
            'AI-generated suggestion 3',
          ];
      }

      setAiSuggestions(prev => ({ ...prev, [fieldId]: suggestions }));
    }, 500);
  };

  // Apply AI suggestion to field
  const applyFieldSuggestion = (fieldId: string, suggestion: string) => {
    switch (fieldId) {
      case 'title':
        setContent(prev => ({ ...prev, title: suggestion }));
        break;
      case 'background':
        setContent(prev => ({ ...prev, background: suggestion }));
        break;
      case 'objectives':
        setContent(prev => ({
          ...prev,
          businessObjectives: [...(prev.businessObjectives || []), suggestion],
        }));
        break;
    }
    setShowAISuggestions(prev => ({ ...prev, [fieldId]: false }));
    toast.success('AI suggestion applied');
  };

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId);
    const element = document.getElementById(`section-${sectionId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Handle save
  const handleSave = () => {
    onSave(content);
    toast.success('Draft saved successfully');
  };

  return (
    <div ref={containerRef} className="relative flex h-full flex-col bg-gray-50 dark:bg-gray-900">
      {/* Collaborator Cursors Overlay */}
      {isSessionActive && session && currentUser && (
        <CollaboratorCursors
          collaborators={session.collaborators}
          currentUserId={currentUser.id}
          containerRef={containerRef}
        />
      )}

      {/* Coworking Header - shown when session is active */}
      {isSessionActive && session && (
        <CoworkingHeader
          session={session}
          onUpdateName={updateSessionName}
          onInviteClick={() => setShowShareModal(true)}
        />
      )}

      {/* Top Toolbar */}
      <div className="flex items-center justify-between border-b border-gray-200 bg-white px-4 py-3 dark:border-gray-700 dark:bg-gray-900">
        <div className="flex items-center gap-2">
          <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
            {content.title || 'New Proposal'}
          </h1>
          <Badge variant="warning">Draft</Badge>
        </div>

        <div className="flex items-center gap-2">
          {/* Versions */}
          <button
            onClick={() => setShowVersions(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <History className="h-4 w-4" />
            Versions
          </button>

          {/* Coworking - only show when session is not active */}
          {!isSessionActive && (
            <button
              onClick={() => startSession(proposal.id, content.title || 'Untitled Proposal')}
              className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            >
              <Users className="h-4 w-4" />
              Start Coworking
            </button>
          )}

          {/* Feasibility */}
          <button
            onClick={() => setShowFeasibility(true)}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <ClipboardCheck className="h-4 w-4" />
            Feasibility
          </button>

          <div className="mx-2 h-6 w-px bg-gray-200 dark:bg-gray-700" />

          {/* Save Draft */}
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Save className="h-4 w-4" />
            Save Draft
          </button>

          {/* Submit */}
          <button className="flex items-center gap-1.5 rounded-lg bg-[#5B50BD] px-3 py-2 text-sm font-medium text-white hover:bg-[#4A3FAC]">
            <Upload className="h-4 w-4" />
            Submit
          </button>

          {/* Export */}
          <button className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700">
            <FileDown className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Document Editor */}
        <div className="flex-1 overflow-y-auto" ref={formRef}>
          <div className="mx-auto max-w-4xl p-6 pb-48">
            {/* Header Section */}
            <section id="section-header" className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-100 dark:bg-rose-900/30">
                  <FileText className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Header Information</h2>
              </div>

              <Card>
                <CardContent className="space-y-4 p-4">
                  {/* Title */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Proposal Title
                      </label>
                      <button
                        onClick={() => generateFieldSuggestions('title')}
                        className="flex items-center gap-1 text-xs text-[#5B50BD] hover:text-[#4A3FAC]"
                      >
                        <Wand2 className="h-3 w-3" />
                        AI Rephrase
                      </button>
                    </div>
                    <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
                      Enter a clear, descriptive title for the proposal
                    </p>
                    <Input
                      value={content.title || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, title: e.target.value }))}
                      placeholder="Type @ to get suggestions from existing proposals..."
                      className="text-sm"
                    />
                    {showAISuggestions.title && aiSuggestions.title && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {aiSuggestions.title.map((suggestion, idx) => (
                          <button
                            key={idx}
                            onClick={() => applyFieldSuggestion('title', suggestion)}
                            className="rounded-lg bg-[#5B50BD]/10 px-3 py-1.5 text-xs text-[#5B50BD] hover:bg-[#5B50BD]/20 dark:text-[#918AD3]"
                          >
                            {suggestion}
                          </button>
                        ))}
                        <button
                          onClick={() => setShowAISuggestions(prev => ({ ...prev, title: false }))}
                          className="rounded-lg bg-gray-100 px-2 py-1.5 text-xs text-gray-500 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Client */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Client / Brand
                      </label>
                      <button className="flex items-center gap-1 text-xs text-[#5B50BD] hover:text-[#4A3FAC]">
                        <Wand2 className="h-3 w-3" />
                        AI Rephrase
                      </button>
                    </div>
                    <Input
                      value={content.client || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, client: e.target.value }))}
                      placeholder="Enter client or brand name"
                      className="text-sm"
                    />
                  </div>

                  {/* Contact */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Contact Person
                    </label>
                    <Input
                      value={content.contact || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, contact: e.target.value }))}
                      placeholder="Enter primary contact"
                      className="text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Background Section */}
            <section id="section-background" className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-100 dark:bg-yellow-900/30">
                  <Lightbulb className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Background</h2>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="mb-1.5 flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Research Background
                    </label>
                    <button
                      onClick={() => generateFieldSuggestions('background')}
                      className="flex items-center gap-1 text-xs text-[#5B50BD] hover:text-[#4A3FAC]"
                    >
                      <Wand2 className="h-3 w-3" />
                      AI Generate
                    </button>
                  </div>
                  <Textarea
                    value={content.background || ''}
                    onChange={(e) => setContent(prev => ({ ...prev, background: e.target.value }))}
                    placeholder="Describe the research context and rationale..."
                    className="min-h-[120px] text-sm"
                  />
                  {showAISuggestions.background && aiSuggestions.background && (
                    <div className="mt-3 space-y-2">
                      {aiSuggestions.background.map((suggestion, idx) => (
                        <button
                          key={idx}
                          onClick={() => applyFieldSuggestion('background', suggestion)}
                          className="block w-full rounded-lg border border-[#5B50BD]/20 bg-[#5B50BD]/5 p-3 text-left text-xs text-gray-700 hover:bg-[#5B50BD]/10 dark:text-gray-300"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </section>

            {/* Objectives Section */}
            <section id="section-objectives" className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-green-100 dark:bg-green-900/30">
                  <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Objectives</h2>
              </div>

              <Card>
                <CardContent className="space-y-4 p-4">
                  <div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Business Objectives
                      </label>
                      <button
                        onClick={() => generateFieldSuggestions('objectives')}
                        className="flex items-center gap-1 text-xs text-[#5B50BD] hover:text-[#4A3FAC]"
                      >
                        <Wand2 className="h-3 w-3" />
                        AI Suggest
                      </button>
                    </div>
                    <Textarea
                      value={content.businessObjectives?.join('\n') || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        businessObjectives: e.target.value.split('\n').filter(Boolean),
                      }))}
                      placeholder="Enter business objectives (one per line)"
                      className="min-h-[80px] text-sm"
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Research Objectives
                    </label>
                    <Textarea
                      value={content.researchObjectives?.join('\n') || ''}
                      onChange={(e) => setContent(prev => ({
                        ...prev,
                        researchObjectives: e.target.value.split('\n').filter(Boolean),
                      }))}
                      placeholder="Enter research objectives (one per line)"
                      className="min-h-[80px] text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Sample & Quotas Section */}
            <section id="section-sample" className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100 dark:bg-blue-900/30">
                  <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Sample & Quotas</h2>
              </div>

              <Card>
                <CardContent className="space-y-4 p-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Target Definition
                    </label>
                    <Textarea
                      value={content.targetDefinition || ''}
                      onChange={(e) => setContent(prev => ({ ...prev, targetDefinition: e.target.value }))}
                      placeholder="Describe your target audience"
                      className="min-h-[80px] text-sm"
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Sample Size
                      </label>
                      <Input
                        type="number"
                        value={content.sampleSize || ''}
                        onChange={(e) => setContent(prev => ({ ...prev, sampleSize: parseInt(e.target.value) || 0 }))}
                        placeholder="e.g., 500"
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        LOI (minutes)
                      </label>
                      <Input
                        type="number"
                        value={content.loi || ''}
                        onChange={(e) => setContent(prev => ({ ...prev, loi: parseInt(e.target.value) || 0 }))}
                        placeholder="e.g., 15"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Markets Section */}
            <section id="section-markets" className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-purple-100 dark:bg-purple-900/30">
                  <Globe className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Markets</h2>
              </div>

              <Card>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Add markets and configure country-specific settings
                  </p>
                  <Button variant="outline" className="mt-3">
                    + Add Market
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* Timeline Section */}
            <section id="section-timeline" className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-100 dark:bg-pink-900/30">
                  <Calendar className="h-4 w-4 text-pink-600 dark:text-pink-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Timeline</h2>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Start Date
                      </label>
                      <Input
                        type="date"
                        value={content.timeline?.startDate || ''}
                        onChange={(e) => setContent(prev => ({
                          ...prev,
                          timeline: { ...prev.timeline, startDate: e.target.value },
                        }))}
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                        End Date
                      </label>
                      <Input
                        type="date"
                        value={content.timeline?.endDate || ''}
                        onChange={(e) => setContent(prev => ({
                          ...prev,
                          timeline: { ...prev.timeline, endDate: e.target.value },
                        }))}
                        className="text-sm"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>

            {/* Pricing Section */}
            <section id="section-pricing" className="mb-8">
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-red-100 dark:bg-red-900/30">
                  <DollarSign className="h-4 w-4 text-red-600 dark:text-red-400" />
                </div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pricing</h2>
              </div>

              <Card>
                <CardContent className="p-4">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Total Price
                    </label>
                    <Input
                      type="number"
                      value={content.pricing?.total || ''}
                      onChange={(e) => {
                        const newTotal = parseInt(e.target.value) || 0;
                        setContent(prev => ({
                          ...prev,
                          pricing: {
                            total: newTotal,
                            currency: prev.pricing?.currency || 'USD',
                            breakdown: prev.pricing?.breakdown,
                          },
                        }));
                      }}
                      placeholder="Enter total price"
                      className="text-sm"
                    />
                  </div>
                </CardContent>
              </Card>
            </section>
          </div>
        </div>

        {/* Right Sidebar - Section Navigation */}
        <div
          className={cn(
            'h-full border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 transition-all duration-300 flex-shrink-0 overflow-hidden',
            rightSidebarCollapsed ? 'w-0' : 'w-72'
          )}
        >
          {!rightSidebarCollapsed && (
            <div className="h-full flex flex-col">
              {/* Sidebar Header */}
              <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-4 py-3">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Selection Content
                </span>
                <button
                  onClick={() => setRightSidebarCollapsed(true)}
                  className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Section List */}
              <div className="flex-1 overflow-y-auto p-2">
                {PROPOSAL_SECTIONS.map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => scrollToSection(section.id)}
                      className={cn(
                        'w-full flex items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors mb-1',
                        activeSection === section.id
                          ? 'bg-[#5B50BD]/10 text-[#5B50BD] dark:text-[#918AD3]'
                          : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                      )}
                    >
                      <div className={cn('flex h-8 w-8 items-center justify-center rounded-lg', section.color)}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <span className="text-sm font-medium">{section.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Completion Status */}
              <div className="border-t border-gray-200 dark:border-gray-700 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">Completion</span>
                  <span className="font-medium text-[#5B50BD]">25%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
                  <div className="h-2 w-1/4 rounded-full bg-[#5B50BD]" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Collapsed Sidebar Toggle */}
        {rightSidebarCollapsed && (
          <button
            onClick={() => setRightSidebarCollapsed(false)}
            className="absolute right-0 top-1/2 -translate-y-1/2 rounded-l-lg border border-r-0 border-gray-200 bg-white p-2 text-gray-400 hover:text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:hover:text-gray-300"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
          </button>
        )}
      </div>

      {/* Bottom AI Chat Input */}
      <div className="border-t border-gray-200 bg-white px-6 py-4 dark:border-gray-700 dark:bg-gray-900">
        {/* AI Templates */}
        <div className="mb-3 flex flex-wrap gap-2">
          {AI_TEMPLATES.map((template, idx) => (
            <button
              key={idx}
              onClick={() => handleTemplateClick(template)}
              className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
            >
              {template}
            </button>
          ))}
        </div>

        {/* Chat Input Area */}
        <div className="relative flex items-end gap-3">
          {/* Attachment Button */}
          <button className="mb-1 rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800 dark:hover:text-gray-300">
            <Paperclip className="h-5 w-5" />
          </button>

          {/* Input with Mention Dropdown */}
          <div className="relative flex-1">
            {/* Mention Dropdown */}
            {showMentions && (
              <div className="absolute bottom-full left-0 mb-2 w-full max-w-md rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                <div className="p-2">
                  <div className="mb-2 flex items-center gap-2 px-2 text-xs text-gray-500">
                    <AtSign className="h-3 w-3" />
                    <span>Reference a proposal</span>
                  </div>
                  {filteredProposals.length > 0 ? (
                    filteredProposals.map((p) => (
                      <button
                        key={p.id}
                        onClick={() => handleSelectMention(p)}
                        className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
                      >
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
                            {p.content.title || 'Untitled'}
                          </p>
                          <p className="truncate text-xs text-gray-500">
                            {p.content.client || 'No client'} • {p.code || 'Draft'}
                          </p>
                        </div>
                      </button>
                    ))
                  ) : (
                    <p className="px-2 py-2 text-sm text-gray-500">No proposals found</p>
                  )}
                </div>
              </div>
            )}

            <textarea
              ref={chatInputRef}
              value={chatInput}
              onChange={(e) => handleChatInputChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleChatSubmit();
                }
              }}
              placeholder="Ask AI for help... Type @ to reference a proposal"
              className="w-full resize-none rounded-lg border border-gray-200 bg-white px-4 py-3 text-sm focus:border-[#5B50BD] focus:outline-none focus:ring-1 focus:ring-[#5B50BD] dark:border-gray-700 dark:bg-gray-800 dark:text-white"
              rows={1}
              style={{ minHeight: '44px', maxHeight: '120px' }}
            />
          </div>

          {/* Send Button */}
          <button
            onClick={handleChatSubmit}
            disabled={!chatInput.trim() || isProcessing}
            className="mb-1 flex h-10 w-10 items-center justify-center rounded-lg bg-[#5B50BD] text-white hover:bg-[#4A3FAC] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isProcessing ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Send className="h-5 w-5" />
            )}
          </button>
        </div>

        {/* Recent AI Messages */}
        {chatMessages.length > 0 && (
          <div className="mt-3 max-h-32 overflow-y-auto rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
            {chatMessages.slice(-2).map((msg, idx) => (
              <div key={idx} className={cn('mb-2 last:mb-0', msg.role === 'ai' ? 'text-[#5B50BD]' : 'text-gray-700 dark:text-gray-300')}>
                <span className="text-xs font-medium">{msg.role === 'ai' ? 'AI: ' : 'You: '}</span>
                <span className="text-xs">{msg.content}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Share Session Modal */}
      {showShareModal && session && (
        <ShareSessionModal
          session={session}
          onClose={() => setShowShareModal(false)}
          onGenerateLink={generateShareLink}
          onUpdateAccessLevel={updateAccessLevel}
          onInviteByEmail={inviteUser}
          onRemoveCollaborator={removeUser}
        />
      )}
    </div>
  );
}
