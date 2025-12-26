'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Save,
  Send,
  Download,
  Users,
  ClipboardCheck,
  History,
  RefreshCw,
  Wand2,
  FileText,
  FileDown,
  Presentation,
  Paperclip,
  Sparkles,
  AtSign,
  Loader2,
  Undo,
  Redo,
} from 'lucide-react';
// Export libraries are loaded dynamically to reduce bundle size
// jsPDF, docx, and file-saver are imported on demand in handleExport
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useUndoRedo } from '@/hooks';
import { Button, Input, Textarea, Select, Badge, Modal, toast } from '@/components/ui';
import { CoworkingHeader, ShareSessionModal, CollaboratorCursors } from '@/components/coworking';
import { useProposalSession } from './hooks/useProposalSession';
import type { Proposal, ProposalContent, User, Market, Quota } from '@/types';
import {
  SectionEditor,
  ListEditor,
  MarketsEditor,
  TargetDefinitionEditor,
  ReferenceProjectsEditor,
  SECTION_CONFIG,
  PROPOSAL_TEMPLATES,
  AI_QUICK_ACTIONS,
} from './editor';

interface ProposalEditorProps {
  proposal: Proposal;
  onSave: (content: ProposalContent) => void;
  externalActiveSection?: string;
  onSectionChange?: (sectionId: string) => void;
}

export function ProposalEditor({ proposal, onSave, externalActiveSection, onSectionChange }: ProposalEditorProps) {
  const { projects, proposals, currentUser, submitForApproval, updateProposal, setActiveSection: setGlobalActiveSection } = useAppStore();

  // Use undo/redo for content state
  const {
    value: content,
    setValue: setContent,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useUndoRedo<ProposalContent>(proposal.content, { maxHistory: 50, debounceMs: 500 });
  const [activeSection, setActiveSectionInternal] = useState('title');
  const [approvalModalOpen, setApprovalModalOpen] = useState(false);
  const [versionsModalOpen, setVersionsModalOpen] = useState(false);
  const [feasibilityModalOpen, setFeasibilityModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [selectedApprover, setSelectedApprover] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [lastAutoSave, setLastAutoSave] = useState<Date | null>(null);
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // AI Chat state
  const [chatInput, setChatInput] = useState('');
  const [showMentions, setShowMentions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState('');
  const [isAIProcessing, setIsAIProcessing] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('blank');
  const chatInputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  // Coworking session
  const {
    session,
    isSessionActive,
    startSession,
    updateSessionName,
    typingUsers,
    inviteUser,
    removeUser,
    generateShareLink,
    updateAccessLevel,
    showShareModal,
    setShowShareModal,
  } = useProposalSession();

  // Auto-save delay in milliseconds (30 seconds)
  const AUTO_SAVE_DELAY = 30000;

  // Auto-save function
  const performAutoSave = useCallback(() => {
    if (hasChanges) {
      setIsAutoSaving(true);
      onSave(content);
      updateProposal(proposal.id, { content, status: 'draft' });
      setHasChanges(false);
      setLastAutoSave(new Date());
      setIsAutoSaving(false);
      toast.info('Auto-saved', 'Your changes have been automatically saved.');
    }
  }, [content, hasChanges, onSave, proposal.id, updateProposal]);

  // Auto-save effect - triggers after AUTO_SAVE_DELAY when content changes
  useEffect(() => {
    if (hasChanges) {
      // Clear existing timeout
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }

      // Set new timeout for auto-save
      autoSaveTimeoutRef.current = setTimeout(() => {
        performAutoSave();
      }, AUTO_SAVE_DELAY);
    }

    // Cleanup on unmount or when content changes
    return () => {
      if (autoSaveTimeoutRef.current) {
        clearTimeout(autoSaveTimeoutRef.current);
      }
    };
  }, [hasChanges, performAutoSave]);

  // Wrapper for setActiveSection that also calls callback
  const setActiveSection = (sectionId: string) => {
    setActiveSectionInternal(sectionId);
    onSectionChange?.(sectionId);
  };

  // Sync with external active section (from RightSidebar)
  useEffect(() => {
    if (externalActiveSection) {
      // Map RightSidebar section IDs to ProposalEditor section IDs
      const sectionMap: Record<string, string> = {
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
      const mappedSection = sectionMap[externalActiveSection] || externalActiveSection;
      if (mappedSection && SECTION_CONFIG.some(s => s.id === mappedSection)) {
        setActiveSectionInternal(mappedSection);
      }
    }
  }, [externalActiveSection]);



  // Track changes
  useEffect(() => {
    const isDifferent = JSON.stringify(content) !== JSON.stringify(proposal.content);
    setHasChanges(isDifferent);
  }, [content, proposal.content]);

  const updateContent = <K extends keyof ProposalContent>(
    key: K,
    value: ProposalContent[K]
  ) => {
    setContent((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    // Clear any pending auto-save
    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }
    onSave(content);
    updateProposal(proposal.id, { content, status: 'draft' });
    setHasChanges(false);
    setLastAutoSave(new Date());
    toast.success('Draft saved', 'Your proposal has been saved successfully.');
  };

  const handleSubmitForApproval = () => {
    if (!selectedApprover) return;

    const approver: User = {
      id: selectedApprover,
      name: 'Approver',
      email: 'approver@boltinsight.com',
      role: 'manager',
    };

    submitForApproval(proposal.id, approver);
    setApprovalModalOpen(false);
    toast.success('Submitted for approval', 'Your proposal has been sent to the approver.');
  };

  const handleExport = async (format: 'word' | 'pdf' | 'ppt') => {
    toast.info(`Exporting as ${format.toUpperCase()}`, 'Your document is being prepared for download...');

    const fileName = `${content.title || 'proposal'}_${proposal.code || proposal.id}`;

    try {
      if (format === 'ppt') {
        // Generate PowerPoint using pptxgenjs (dynamic import for SSR compatibility)
        const pptxgenModule = await import('pptxgenjs');
        const pptxgen = pptxgenModule.default;
        const pptx = new pptxgen();

        // Set presentation properties
        pptx.title = content.title || 'Untitled Proposal';
        pptx.author = proposal.author.name;

        // Title Slide
        const titleSlide = pptx.addSlide();
        titleSlide.addText(content.title || 'Untitled Proposal', {
          x: 0.5,
          y: 2,
          w: 9,
          h: 1.5,
          fontSize: 36,
          bold: true,
          color: '5B50BD',
          align: 'center',
        });
        titleSlide.addText(`Client: ${content.client || 'N/A'}`, {
          x: 0.5,
          y: 3.5,
          w: 9,
          h: 0.5,
          fontSize: 18,
          color: '666666',
          align: 'center',
        });
        titleSlide.addText(`${proposal.code || 'Draft'} | ${new Date().toLocaleDateString()}`, {
          x: 0.5,
          y: 4.2,
          w: 9,
          h: 0.5,
          fontSize: 12,
          color: '999999',
          align: 'center',
        });

        // Background Slide
        if (content.background) {
          const bgSlide = pptx.addSlide();
          bgSlide.addText('Background / Context', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 0.6,
            fontSize: 24,
            bold: true,
            color: '5B50BD',
          });
          bgSlide.addText(content.background, {
            x: 0.5,
            y: 1.3,
            w: 9,
            h: 4,
            fontSize: 14,
            color: '333333',
            valign: 'top',
          });
        }

        // Business Objectives Slide
        if (content.businessObjectives && content.businessObjectives.length > 0) {
          const boSlide = pptx.addSlide();
          boSlide.addText('Business Objectives', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 0.6,
            fontSize: 24,
            bold: true,
            color: '5B50BD',
          });
          content.businessObjectives.forEach((obj, i) => {
            boSlide.addText(`${i + 1}. ${obj}`, {
              x: 0.5,
              y: 1.3 + i * 0.5,
              w: 9,
              h: 0.5,
              fontSize: 14,
              color: '333333',
              bullet: true,
            });
          });
        }

        // Research Objectives Slide
        if (content.researchObjectives && content.researchObjectives.length > 0) {
          const roSlide = pptx.addSlide();
          roSlide.addText('Research Objectives', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 0.6,
            fontSize: 24,
            bold: true,
            color: '5B50BD',
          });
          content.researchObjectives.forEach((obj, i) => {
            roSlide.addText(obj, {
              x: 0.5,
              y: 1.3 + i * 0.5,
              w: 9,
              h: 0.5,
              fontSize: 14,
              color: '333333',
              bullet: true,
            });
          });
        }

        // Target & Sample Slide
        const targetSlide = pptx.addSlide();
        targetSlide.addText('Target & Sample', {
          x: 0.5,
          y: 0.5,
          w: 9,
          h: 0.6,
          fontSize: 24,
          bold: true,
          color: '5B50BD',
        });
        targetSlide.addText('Target Definition:', {
          x: 0.5,
          y: 1.3,
          w: 9,
          h: 0.4,
          fontSize: 14,
          bold: true,
          color: '333333',
        });
        targetSlide.addText(content.targetDefinition || 'Not specified', {
          x: 0.5,
          y: 1.7,
          w: 9,
          h: 1,
          fontSize: 12,
          color: '666666',
        });
        targetSlide.addText(`Total Sample Size: ${content.sampleSize?.toLocaleString() || 'N/A'}`, {
          x: 0.5,
          y: 3,
          w: 9,
          h: 0.5,
          fontSize: 16,
          bold: true,
          color: '5B50BD',
        });

        // Markets Slide
        if (content.markets && content.markets.length > 0) {
          const marketsSlide = pptx.addSlide();
          marketsSlide.addText('Markets', {
            x: 0.5,
            y: 0.5,
            w: 9,
            h: 0.6,
            fontSize: 24,
            bold: true,
            color: '5B50BD',
          });

          const tableData = [
            [{ text: 'Country', options: { bold: true, fill: { color: 'EDE9F9' } } }, { text: 'Language', options: { bold: true, fill: { color: 'EDE9F9' } } }, { text: 'Sample Size', options: { bold: true, fill: { color: 'EDE9F9' } } }],
            ...content.markets.map(m => [m.country, m.language, m.sampleSize.toString()]),
          ];

          marketsSlide.addTable(tableData as any[], {
            x: 0.5,
            y: 1.3,
            w: 9,
            colW: [3, 3, 3],
            fontSize: 12,
            border: { pt: 0.5, color: 'CCCCCC' },
          });
        }

        // Save the presentation
        await pptx.writeFile({ fileName: `${fileName}.pptx` });
      } else if (format === 'pdf') {
        // Generate PDF using jsPDF (dynamic import)
        const { jsPDF } = await import('jspdf');
        const doc = new jsPDF();
        const pageWidth = doc.internal.pageSize.getWidth();
        let y = 20;
        const lineHeight = 7;
        const margin = 20;
        const maxWidth = pageWidth - 2 * margin;

        // Helper to add text and handle page breaks
        const addText = (text: string, fontSize: number = 12, isBold: boolean = false) => {
          doc.setFontSize(fontSize);
          doc.setFont('helvetica', isBold ? 'bold' : 'normal');
          const lines = doc.splitTextToSize(text, maxWidth);
          lines.forEach((line: string) => {
            if (y > 270) {
              doc.addPage();
              y = 20;
            }
            doc.text(line, margin, y);
            y += lineHeight;
          });
        };

        const addSection = (title: string, content: string | string[] | undefined) => {
          y += 5;
          addText(title, 14, true);
          y += 2;
          if (Array.isArray(content)) {
            content.forEach((item, i) => addText(`${i + 1}. ${item}`));
          } else {
            addText(content || 'Not specified');
          }
        };

        // Title
        doc.setFontSize(20);
        doc.setFont('helvetica', 'bold');
        doc.text(content.title || 'Untitled Proposal', margin, y);
        y += 10;

        // Meta info
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(100);
        doc.text(`Code: ${proposal.code || 'Draft'} | Status: ${proposal.status} | Generated: ${new Date().toLocaleDateString()}`, margin, y);
        y += 15;
        doc.setTextColor(0);

        // Client
        addSection('CLIENT INFORMATION', `Client: ${content.client || 'N/A'}\nContact: ${content.contact || 'N/A'}`);

        // Background
        addSection('BACKGROUND / CONTEXT', content.background);

        // Business Objectives
        addSection('BUSINESS OBJECTIVES', content.businessObjectives);

        // Research Objectives
        addSection('RESEARCH OBJECTIVES', content.researchObjectives);

        // Burning Questions
        addSection('BURNING QUESTIONS', content.burningQuestions);

        // Target Definition
        addSection('TARGET DEFINITION', content.targetDefinition);

        // Sample Size
        addSection('SAMPLE SIZE', `Total: ${content.sampleSize?.toLocaleString() || 'N/A'}`);

        // Markets
        if (content.markets && content.markets.length > 0) {
          y += 5;
          addText('MARKETS', 14, true);
          y += 2;
          content.markets.forEach(m => addText(`• ${m.country} (${m.language}): n=${m.sampleSize}`));
        }

        // Advanced Analysis
        addSection('ADVANCED ANALYSIS', content.advancedAnalysis);

        // Footer
        y += 10;
        doc.setFontSize(10);
        doc.setTextColor(100);
        doc.text(`Author: ${proposal.author.name}`, margin, y);

        doc.save(`${fileName}.pdf`);
      } else {
        // Generate DOCX using docx library (dynamic import)
        const docx = await import('docx');
        const { Document, Packer, Paragraph, TextRun, HeadingLevel } = docx;
        const { saveAs } = await import('file-saver');
        const docChildren: InstanceType<typeof Paragraph>[] = [];

        // Title
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: content.title || 'Untitled Proposal', bold: true, size: 48 })],
            heading: HeadingLevel.TITLE,
            spacing: { after: 200 },
          })
        );

        // Meta info
        docChildren.push(
          new Paragraph({
            children: [
              new TextRun({ text: `Code: ${proposal.code || 'Draft'} | Status: ${proposal.status} | Generated: ${new Date().toLocaleDateString()}`, size: 20, color: '666666' }),
            ],
            spacing: { after: 400 },
          })
        );

        // Helper to add sections
        const addDocSection = (title: string, items: string | string[] | undefined) => {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: title, bold: true, size: 28 })],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            })
          );

          if (Array.isArray(items) && items.length > 0) {
            items.forEach((item, i) => {
              docChildren.push(
                new Paragraph({
                  children: [new TextRun({ text: `${i + 1}. ${item}`, size: 24 })],
                  spacing: { after: 100 },
                })
              );
            });
          } else if (typeof items === 'string' && items) {
            docChildren.push(
              new Paragraph({
                children: [new TextRun({ text: items, size: 24 })],
                spacing: { after: 100 },
              })
            );
          } else {
            docChildren.push(
              new Paragraph({
                children: [new TextRun({ text: 'Not specified', size: 24, italics: true, color: '999999' })],
                spacing: { after: 100 },
              })
            );
          }
        };

        // Add sections
        addDocSection('Client Information', `Client: ${content.client || 'N/A'}\nContact: ${content.contact || 'N/A'}`);
        addDocSection('Background / Context', content.background);
        addDocSection('Business Objectives', content.businessObjectives);
        addDocSection('Research Objectives', content.researchObjectives);
        addDocSection('Burning Questions', content.burningQuestions);
        addDocSection('Target Definition', content.targetDefinition);
        addDocSection('Sample Size', `Total: ${content.sampleSize?.toLocaleString() || 'N/A'}`);

        // Markets
        if (content.markets && content.markets.length > 0) {
          docChildren.push(
            new Paragraph({
              children: [new TextRun({ text: 'Markets', bold: true, size: 28 })],
              heading: HeadingLevel.HEADING_1,
              spacing: { before: 400, after: 200 },
            })
          );
          content.markets.forEach(m => {
            docChildren.push(
              new Paragraph({
                children: [new TextRun({ text: `• ${m.country} (${m.language}): n=${m.sampleSize}`, size: 24 })],
                spacing: { after: 100 },
              })
            );
          });
        }

        addDocSection('Advanced Analysis', content.advancedAnalysis);

        // Author footer
        docChildren.push(
          new Paragraph({
            children: [new TextRun({ text: `Author: ${proposal.author.name}`, size: 20, color: '666666' })],
            spacing: { before: 400 },
          })
        );

        const doc = new Document({
          sections: [{
            properties: {},
            children: docChildren,
          }],
        });

        const blob = await Packer.toBlob(doc);
        saveAs(blob, `${fileName}.docx`);
      }

      toast.success('Export complete', `Your ${format.toUpperCase()} file has been downloaded.`);
    } catch (error) {
      console.error('Export error:', error);
      toast.error('Export failed', 'There was an error generating your document.');
    }
  };

  const handleAIRephrase = (sectionId: string) => {
    // In real app, this would call AI API to rephrase content
    toast.info('AI Processing', `Rephrasing ${sectionId} content...`);
  };

  const handleGenerateQuotas = () => {
    // Generate quota recommendations based on target definition and markets
    if (!content.targetDefinition && (!content.markets || content.markets.length === 0)) {
      toast.error('Missing information', 'Please define target audience and markets first.');
      return;
    }

    const sampleSize = content.sampleSize || 1000;
    const quotas: Quota[] = [];

    // Generate demographic quota recommendations
    quotas.push({
      dimension: 'Gender',
      categories: [
        { name: 'Male', percentage: 50, count: Math.round(sampleSize * 0.5) },
        { name: 'Female', percentage: 50, count: Math.round(sampleSize * 0.5) },
      ],
    });

    quotas.push({
      dimension: 'Age',
      categories: [
        { name: '18-24', percentage: 15, count: Math.round(sampleSize * 0.15) },
        { name: '25-34', percentage: 25, count: Math.round(sampleSize * 0.25) },
        { name: '35-44', percentage: 25, count: Math.round(sampleSize * 0.25) },
        { name: '45-54', percentage: 20, count: Math.round(sampleSize * 0.20) },
        { name: '55+', percentage: 15, count: Math.round(sampleSize * 0.15) },
      ],
    });

    // Add market-specific quotas if markets are defined
    if (content.markets && content.markets.length > 0) {
      const totalSample = content.markets.reduce((sum, m) => sum + m.sampleSize, 0);
      quotas.push({
        dimension: 'Market',
        categories: content.markets.map((market) => ({
          name: market.country,
          percentage: Math.round((market.sampleSize / totalSample) * 100),
          count: market.sampleSize,
        })),
      });
    }

    // Add recommendations based on target definition keywords
    if (content.targetDefinition) {
      const targetLower = content.targetDefinition.toLowerCase();
      if (targetLower.includes('income') || targetLower.includes('sec')) {
        quotas.push({
          dimension: 'Income/SEC',
          categories: [
            { name: 'High', percentage: 20, count: Math.round(sampleSize * 0.20) },
            { name: 'Medium', percentage: 50, count: Math.round(sampleSize * 0.50) },
            { name: 'Low', percentage: 30, count: Math.round(sampleSize * 0.30) },
          ],
        });
      }
      if (targetLower.includes('urban') || targetLower.includes('rural')) {
        quotas.push({
          dimension: 'Region Type',
          categories: [
            { name: 'Urban', percentage: 70, count: Math.round(sampleSize * 0.70) },
            { name: 'Rural', percentage: 30, count: Math.round(sampleSize * 0.30) },
          ],
        });
      }
      if (targetLower.includes('brand') || targetLower.includes('user')) {
        quotas.push({
          dimension: 'Brand Usage',
          categories: [
            { name: 'Current Users', percentage: 30, count: Math.round(sampleSize * 0.30) },
            { name: 'Lapsed Users', percentage: 30, count: Math.round(sampleSize * 0.30) },
            { name: 'Non-Users', percentage: 40, count: Math.round(sampleSize * 0.40) },
          ],
        });
      }
    }

    updateContent('quotas', quotas);
    toast.success('Quotas generated', `${quotas.length} quota dimensions have been added.`);
  };

  const isProposalComplete = () => {
    return (
      content.title &&
      content.client &&
      content.targetDefinition &&
      content.sampleSize &&
      content.loi &&
      content.markets &&
      content.markets.length > 0
    );
  };

  const getSectionCompletion = () => {
    const requiredSections = SECTION_CONFIG.filter((s) => s.required);
    const completed = requiredSections.filter((s) => {
      const value = content[s.id as keyof ProposalContent];
      if (Array.isArray(value)) return value.length > 0;
      return !!value;
    });
    return Math.round((completed.length / requiredSections.length) * 100);
  };

  return (
    <div ref={editorContainerRef} className="relative flex h-full min-w-0 overflow-hidden">
      {/* Collaborator Cursors Overlay */}
      {isSessionActive && session && currentUser && (
        <CollaboratorCursors
          collaborators={session.collaborators}
          currentUserId={currentUser.id}
          containerRef={editorContainerRef}
        />
      )}

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col min-w-0 overflow-hidden">
        {/* Coworking Header - shown when session is active */}
        {isSessionActive && session && (
          <CoworkingHeader
            session={session}
            onUpdateName={updateSessionName}
            onInviteClick={() => setShowShareModal(true)}
          />
        )}

        {/* Header Actions */}
        <div className="flex flex-wrap items-center justify-between border-b border-gray-200 px-4 py-2 gap-2">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => setVersionsModalOpen(true)} className="whitespace-nowrap px-2.5">
              <History className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Versions</span>
            </Button>
            {!isSessionActive && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => startSession(proposal.id, content.title || 'Untitled Proposal')}
                className="whitespace-nowrap px-2.5"
              >
                <Users className="h-4 w-4 sm:mr-1.5" />
                <span className="hidden sm:inline">Start Coworking</span>
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={() => setFeasibilityModalOpen(true)} className="whitespace-nowrap px-2.5">
              <ClipboardCheck className="h-4 w-4 sm:mr-1.5" />
              <span className="hidden sm:inline">Feasibility</span>
            </Button>
          </div>

          {/* Undo/Redo Buttons */}
          <div className="flex items-center gap-1 border-l border-gray-200 dark:border-gray-700 pl-2 ml-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={undo}
              disabled={!canUndo}
              className="px-2"
              title="Undo (Ctrl+Z)"
            >
              <Undo className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={redo}
              disabled={!canRedo}
              className="px-2"
              title="Redo (Ctrl+Shift+Z)"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            {isAutoSaving ? (
              <Badge variant="default" className="mr-1 hidden sm:flex animate-pulse">
                <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                Auto-saving...
              </Badge>
            ) : hasChanges ? (
              <Badge variant="warning" className="mr-1 hidden sm:flex">
                Unsaved
              </Badge>
            ) : lastAutoSave ? (
              <span className="text-xs text-gray-400 mr-1 hidden sm:flex">
                Auto-saved {lastAutoSave.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            ) : null}
            <Button variant="secondary" size="sm" onClick={handleSave} className="whitespace-nowrap px-3">
              <Save className="h-4 w-4 sm:mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">Save Draft</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setApprovalModalOpen(true)}
              disabled={!isProposalComplete()}
              className="whitespace-nowrap px-3"
            >
              <Send className="h-4 w-4 sm:mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">Submit</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setExportModalOpen(true)} className="whitespace-nowrap px-3">
              <Download className="h-4 w-4 sm:mr-1.5 flex-shrink-0" />
              <span className="hidden sm:inline">Export</span>
            </Button>
          </div>
        </div>

        {/* Content Editor */}
        <div className="flex-1 min-h-0 overflow-y-auto p-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {/* Title Section */}
            {activeSection === 'title' && (
              <SectionEditor
                title="Proposal Title"
                description="Enter a clear, descriptive title for the proposal"
                onRephrase={() => handleAIRephrase('title')}
              >
                <Input
                  value={content.title || ''}
                  onChange={(e) => updateContent('title', e.target.value)}
                  placeholder="e.g., Brand Health Tracking Study Q1 2025"
                  className="text-lg font-medium"
                />
              </SectionEditor>
            )}

            {/* Client Section */}
            {activeSection === 'client' && (
              <SectionEditor
                title="Client Information"
                description="Enter the client name and contact details"
              >
                <div className="space-y-4">
                  <div>
                    <label className="mb-1 block text-sm font-medium">Client Name</label>
                    <Input
                      value={content.client || ''}
                      onChange={(e) => updateContent('client', e.target.value)}
                      placeholder="e.g., Coca-Cola"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium">Contact Person</label>
                    <Input
                      value={content.contact || ''}
                      onChange={(e) => updateContent('contact', e.target.value)}
                      placeholder="e.g., John Smith"
                    />
                  </div>
                </div>
              </SectionEditor>
            )}

            {/* Background Section */}
            {activeSection === 'background' && (
              <SectionEditor
                title="Background / Context"
                description="Provide context about the project and why this research is needed"
                onRephrase={() => handleAIRephrase('background')}
              >
                <Textarea
                  value={content.background || ''}
                  onChange={(e) => updateContent('background', e.target.value)}
                  placeholder="Describe the background and context for this research..."
                  className="min-h-[200px]"
                />
              </SectionEditor>
            )}

            {/* Business Objectives */}
            {activeSection === 'businessObjectives' && (
              <SectionEditor
                title="Business Objectives"
                description="Short bullet list of marketing/business goals"
                onRephrase={() => handleAIRephrase('businessObjectives')}
              >
                <ListEditor
                  items={content.businessObjectives || []}
                  onChange={(items) => updateContent('businessObjectives', items)}
                  placeholder="Add a business objective..."
                />
              </SectionEditor>
            )}

            {/* Research Objectives */}
            {activeSection === 'researchObjectives' && (
              <SectionEditor
                title="Research Objectives"
                description='Use "To..." statements and research questions'
                onRephrase={() => handleAIRephrase('researchObjectives')}
              >
                <ListEditor
                  items={content.researchObjectives || []}
                  onChange={(items) => updateContent('researchObjectives', items)}
                  placeholder="Add a research objective (e.g., To understand...)"
                />
              </SectionEditor>
            )}

            {/* Burning Questions */}
            {activeSection === 'burningQuestions' && (
              <SectionEditor
                title="Burning Questions"
                description="Key questions the client wants answered"
                onRephrase={() => handleAIRephrase('burningQuestions')}
              >
                <ListEditor
                  items={content.burningQuestions || []}
                  onChange={(items) => updateContent('burningQuestions', items)}
                  placeholder="Add a burning question..."
                />
              </SectionEditor>
            )}

            {/* Target Definition */}
            {activeSection === 'targetDefinition' && (
              <SectionEditor
                title="Target Definition"
                description="Define the target audience for this research"
                onRephrase={() => handleAIRephrase('targetDefinition')}
              >
                <TargetDefinitionEditor
                  value={content.targetDefinition || ''}
                  onChange={(value) => updateContent('targetDefinition', value)}
                />
              </SectionEditor>
            )}

            {/* Sample Size */}
            {activeSection === 'sampleSize' && (
              <SectionEditor
                title="Sample Size"
                description="Total sample size across all markets"
              >
                <Input
                  type="number"
                  value={content.sampleSize || ''}
                  onChange={(e) => updateContent('sampleSize', parseInt(e.target.value) || undefined)}
                  placeholder="e.g., 1000"
                />
              </SectionEditor>
            )}

            {/* LOI (Length of Interview) */}
            {activeSection === 'loi' && (
              <SectionEditor
                title="LOI (Length of Interview)"
                description="Survey duration in minutes. Pricing: 5-10 min (lower cost), 10-15 min (standard), 15-20 min (premium), 20+ min (may need incentive adjustments)."
              >
                <div className="flex items-center gap-3">
                  <Input
                    type="number"
                    value={content.loi || ''}
                    onChange={(e) => updateContent('loi', parseInt(e.target.value) || undefined)}
                    placeholder="e.g., 15"
                    className="w-32"
                  />
                  <span className="text-sm text-gray-500">minutes</span>
                </div>
              </SectionEditor>
            )}

            {/* Markets */}
            {activeSection === 'markets' && (
              <SectionEditor
                title="Markets"
                description="Add markets with sample sizes and languages"
              >
                <MarketsEditor
                  markets={content.markets || []}
                  onChange={(markets) => updateContent('markets', markets)}
                />
              </SectionEditor>
            )}

            {/* Quotas */}
            {activeSection === 'quotas' && (
              <SectionEditor
                title="Quota Recommendations"
                description="AI-generated quota recommendations based on target definition and markets. Click 'Generate' to create demographic distributions."
              >
                <div className="space-y-4">
                  <Button variant="outline" size="sm" onClick={handleGenerateQuotas}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Generate Recommendations
                  </Button>

                  {/* Display generated quotas */}
                  {content.quotas && content.quotas.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">Generated Quotas:</h3>
                      {content.quotas.map((quota, index) => (
                        <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">{quota.dimension}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const newQuotas = content.quotas?.filter((_, i) => i !== index) || [];
                                updateContent('quotas', newQuotas);
                              }}
                            >
                              Remove
                            </Button>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {quota.categories.map((cat, catIndex) => (
                              <span
                                key={catIndex}
                                className="inline-flex items-center px-2 py-1 rounded-md bg-white dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600"
                              >
                                {cat.name}: {cat.percentage}% (n={cat.count})
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </SectionEditor>
            )}

            {/* Advanced Analysis */}
            {activeSection === 'advancedAnalysis' && (
              <SectionEditor
                title="Advanced Analysis Recommendations"
                description="Common analyses: MaxDiff (attribute importance), Conjoint (price optimization), Key Driver Analysis (satisfaction drivers)."
              >
                <ListEditor
                  items={content.advancedAnalysis || []}
                  onChange={(items) => updateContent('advancedAnalysis', items)}
                  placeholder="Add an analysis type..."
                />
              </SectionEditor>
            )}

            {/* Reference Projects */}
            {activeSection === 'referenceProjects' && (
              <SectionEditor
                title="Reference Projects"
                description="Link to similar past proposals for reference"
              >
                <ReferenceProjectsEditor
                  items={content.referenceProjects || []}
                  onChange={(items) => updateContent('referenceProjects', items)}
                  proposals={proposals}
                  currentProposalId={proposal.id}
                />
              </SectionEditor>
            )}
          </div>
        </div>

        {/* AI Chat Section at Bottom */}
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-6 py-4">
          {/* Proposal Templates */}
          <div className="mb-3">
            <label className="mb-1.5 block text-xs font-medium text-gray-500 dark:text-gray-400">
              Start with a template (optional)
            </label>
            <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
              {PROPOSAL_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  onClick={() => {
                    setSelectedTemplate(template.id);
                    if (template.prompt) {
                      setChatInput(template.prompt);
                      chatInputRef.current?.focus();
                    }
                  }}
                  disabled={isAIProcessing}
                  className={cn(
                    'rounded-full px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap flex-shrink-0',
                    selectedTemplate === template.id
                      ? 'bg-[#5B50BD] text-white'
                      : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700',
                    isAIProcessing && 'opacity-50 cursor-not-allowed'
                  )}
                >
                  {template.label}
                </button>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mb-3 flex flex-wrap gap-2">
            {AI_QUICK_ACTIONS.map((action, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setChatInput(action.prompt);
                  chatInputRef.current?.focus();
                }}
                disabled={isAIProcessing}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-full bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD] dark:text-[#918AD3] hover:bg-[#DDD6F3] dark:hover:bg-[#2E2763] transition-colors',
                  isAIProcessing && 'opacity-50 cursor-not-allowed'
                )}
              >
                <Sparkles className="h-3 w-3" />
                {action.label}
              </button>
            ))}
          </div>

        {/* Chat Messages */}
        {chatMessages.length > 0 && (
          <div
            ref={chatContainerRef}
            className="mb-3 max-h-48 overflow-y-auto space-y-3 rounded-lg bg-gray-50 dark:bg-gray-800 p-3"
          >
            {chatMessages.map((msg, idx) => (
              <div
                key={idx}
                className={cn(
                  'rounded-lg p-3 text-sm',
                  msg.role === 'user'
                    ? 'bg-[#5B50BD] text-white ml-8'
                    : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white mr-8 border border-gray-200 dark:border-gray-600'
                )}
              >
                {msg.content}
              </div>
            ))}
            {isAIProcessing && (
              <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                <Loader2 className="h-4 w-4 animate-spin" />
                AI is thinking...
              </div>
            )}
          </div>
        )}

        {/* Chat Input */}
        <div className="relative">
          {/* Mention Dropdown */}
          {showMentions && (
            <div className="absolute bottom-full left-0 mb-2 w-64 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700 max-h-48 overflow-y-auto z-10">
              <div className="p-2 text-xs font-medium text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                Reference a proposal
              </div>
              {proposals
                .filter((p) =>
                  p.id !== proposal.id &&
                  (p.content.title?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
                   p.content.client?.toLowerCase().includes(mentionQuery.toLowerCase()))
                )
                .slice(0, 5)
                .map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      const beforeAt = chatInput.substring(0, chatInput.lastIndexOf('@'));
                      setChatInput(`${beforeAt}@[${p.content.title || 'Untitled'}] `);
                      setShowMentions(false);
                      setMentionQuery('');
                      chatInputRef.current?.focus();
                    }}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 text-sm"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {p.content.title || 'Untitled'}
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {p.content.client || 'No client'} • {p.code || 'Draft'}
                    </div>
                  </button>
                ))}
              {proposals.filter((p) =>
                p.id !== proposal.id &&
                (p.content.title?.toLowerCase().includes(mentionQuery.toLowerCase()) ||
                 p.content.client?.toLowerCase().includes(mentionQuery.toLowerCase()))
              ).length === 0 && (
                <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">
                  No proposals found
                </div>
              )}
            </div>
          )}

          <div className="flex items-end gap-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 p-2">
            <button
              onClick={() => {
                setChatInput(chatInput + '@');
                setShowMentions(true);
                chatInputRef.current?.focus();
              }}
              className="p-2 text-gray-500 hover:text-[#5B50BD] dark:text-gray-400 dark:hover:text-[#918AD3] transition-colors"
              title="Mention a proposal"
            >
              <AtSign className="h-5 w-5" />
            </button>
            <button
              className="p-2 text-gray-500 hover:text-[#5B50BD] dark:text-gray-400 dark:hover:text-[#918AD3] transition-colors"
              title="Attach file"
            >
              <Paperclip className="h-5 w-5" />
            </button>
            <textarea
              ref={chatInputRef}
              value={chatInput}
              onChange={(e) => {
                setChatInput(e.target.value);
                // Check for @ mentions
                const lastAtIndex = e.target.value.lastIndexOf('@');
                if (lastAtIndex !== -1) {
                  const afterAt = e.target.value.substring(lastAtIndex + 1);
                  if (!afterAt.includes(' ') && !afterAt.includes('[')) {
                    setShowMentions(true);
                    setMentionQuery(afterAt);
                  } else {
                    setShowMentions(false);
                  }
                } else {
                  setShowMentions(false);
                }
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  if (chatInput.trim() && !isAIProcessing) {
                    // Add user message
                    setChatMessages((prev) => [...prev, { role: 'user', content: chatInput.trim() }]);
                    setChatInput('');
                    setIsAIProcessing(true);

                    // Simulate AI response
                    setTimeout(() => {
                      setChatMessages((prev) => [
                        ...prev,
                        {
                          role: 'assistant',
                          content: `I'll help you with "${chatInput.trim().substring(0, 50)}...". Based on the current proposal context, here are my suggestions:\n\n• Consider adding more specific details to the ${activeSection} section\n• The sample size should align with your margin of error requirements\n• You may want to reference similar past projects for benchmarking`,
                        },
                      ]);
                      setIsAIProcessing(false);
                    }, 1500);
                  }
                }
                if (e.key === 'Escape') {
                  setShowMentions(false);
                }
              }}
              placeholder="Ask AI to help with your proposal... Use @ to reference other proposals"
              className="flex-1 resize-none bg-transparent border-0 focus:ring-0 text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 min-h-[40px] max-h-24"
              rows={1}
            />
            <button
              onClick={() => {
                if (chatInput.trim() && !isAIProcessing) {
                  setChatMessages((prev) => [...prev, { role: 'user', content: chatInput.trim() }]);
                  const userMessage = chatInput.trim();
                  setChatInput('');
                  setIsAIProcessing(true);

                  setTimeout(() => {
                    setChatMessages((prev) => [
                      ...prev,
                      {
                        role: 'assistant',
                        content: `I'll help you with "${userMessage.substring(0, 50)}...". Based on the current proposal context, here are my suggestions:\n\n• Consider adding more specific details to the ${activeSection} section\n• The sample size should align with your margin of error requirements\n• You may want to reference similar past projects for benchmarking`,
                      },
                    ]);
                    setIsAIProcessing(false);
                  }, 1500);
                }
              }}
              disabled={!chatInput.trim() || isAIProcessing}
              className={cn(
                'p-2 rounded-lg transition-colors',
                chatInput.trim() && !isAIProcessing
                  ? 'bg-[#5B50BD] text-white hover:bg-[#4A3FA8]'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed'
              )}
            >
              {isAIProcessing ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Press Enter to send, Shift+Enter for new line. Use @proposal to reference other proposals.
          </p>
        </div>
        </div>
      </div>

      {/* Send to Approval Modal */}
      <Modal
        isOpen={approvalModalOpen}
        onClose={() => setApprovalModalOpen(false)}
        title="Send to Approval"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">Select Approver</label>
            <Select
              options={[
                { value: 'user-manager', label: 'Team Manager' },
                { value: 'user-director', label: 'Research Director' },
                { value: 'user-admin', label: 'Admin' },
              ]}
              value={selectedApprover}
              onChange={(e) => setSelectedApprover(e.target.value)}
              placeholder="Choose approver"
            />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setApprovalModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmitForApproval} disabled={!selectedApprover}>
              Submit
            </Button>
          </div>
        </div>
      </Modal>

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

      {/* Versions Modal */}
      <Modal
        isOpen={versionsModalOpen}
        onClose={() => setVersionsModalOpen(false)}
        title="Version History"
        size="lg"
      >
        <div className="space-y-4">
          {proposal.versions.length === 0 ? (
            <div className="text-center py-8">
              <History className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-sm text-gray-500">No previous versions</p>
              <p className="text-xs text-gray-400 mt-1">Versions are created when you save changes</p>
            </div>
          ) : (
            proposal.versions.map((version) => (
              <div
                key={version.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">Version {version.version}</p>
                  <p className="text-sm text-gray-500">
                    {version.createdBy.name} - {new Date(version.createdAt).toLocaleString()}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setContent(version.content);
                    setVersionsModalOpen(false);
                    toast.success('Version restored', 'Click Save Draft to keep changes.');
                  }}
                >
                  Restore
                </Button>
              </div>
            ))
          )}
        </div>
      </Modal>

      {/* Feasibility Check Modal */}
      <Modal
        isOpen={feasibilityModalOpen}
        onClose={() => setFeasibilityModalOpen(false)}
        title="Quick Feasibility Check"
        size="md"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Based on current proposal details, here's a quick feasibility assessment.
          </p>

          <div className="rounded-lg bg-gray-50 p-4 space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Total Sample Size</span>
              <span className="font-medium">{content.sampleSize?.toLocaleString() || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Markets</span>
              <span className="font-medium">{content.markets?.length || 0} countries</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Target Audience</span>
              <span className="font-medium text-right max-w-[200px] truncate">
                {content.targetDefinition || 'Not defined'}
              </span>
            </div>
          </div>

          {content.sampleSize && content.markets && content.markets.length > 0 ? (
            <div className="rounded-lg bg-green-50 border border-green-200 p-4">
              <div className="flex items-center gap-2 text-green-700">
                <ClipboardCheck className="h-5 w-5" />
                <span className="font-medium">Likely Feasible</span>
              </div>
              <p className="text-sm text-green-600 mt-1">
                Estimated timeline: 2-4 weeks for {content.sampleSize} completes
              </p>
            </div>
          ) : (
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-4">
              <p className="text-sm text-amber-700">
                Please complete sample size and markets to get feasibility estimate.
              </p>
            </div>
          )}

          <div className="flex justify-between pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setFeasibilityModalOpen(false);
                setGlobalActiveSection('feasibility');
              }}
            >
              Full Feasibility Tool
            </Button>
            <Button onClick={() => setFeasibilityModalOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Export Modal */}
      <Modal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        title="Export Proposal"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Choose a format to export your proposal.
          </p>

          <div className="space-y-2">
            <button
              onClick={() => {
                handleExport('word');
                setExportModalOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg border p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-8 w-8 text-[#5B50BD] dark:text-[#918AD3]" />
              <div>
                <p className="font-medium">Word Document</p>
                <p className="text-sm text-gray-500">Export as .docx file</p>
              </div>
            </button>

            <button
              onClick={() => {
                handleExport('pdf');
                setExportModalOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg border p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <FileDown className="h-8 w-8 text-red-600" />
              <div>
                <p className="font-medium">PDF Document</p>
                <p className="text-sm text-gray-500">Export as .pdf file</p>
              </div>
            </button>

            <button
              onClick={() => {
                handleExport('ppt');
                setExportModalOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-lg border p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <Presentation className="h-8 w-8 text-orange-600" />
              <div>
                <p className="font-medium">PowerPoint Presentation</p>
                <p className="text-sm text-gray-500">Export as .pptx file</p>
              </div>
            </button>
          </div>

          <Button variant="outline" onClick={() => setExportModalOpen(false)} className="w-full">
            Cancel
          </Button>
        </div>
      </Modal>
    </div>
  );
}
