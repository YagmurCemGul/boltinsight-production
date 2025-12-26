'use client';

import { useState, useEffect, useMemo, useRef } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Collaboration from '@tiptap/extension-collaboration';
import CollaborationCursor from '@tiptap/extension-collaboration-cursor';
import * as Y from 'yjs';
import { IndexeddbPersistence } from 'y-indexeddb';
import { HocuspocusProvider } from '@hocuspocus/provider';

// Tiptap Cloud configuration
const TIPTAP_APP_ID = '7me38069';
const TIPTAP_APP_SECRET = '304bcf2557b366ce2f46e8df5a70f562dd4c48a6ff9d1c8221b88d1e417855cb';
import {
  Save,
  Download,
  Check,
  Link,
  Highlighter,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Minus,
  Table,
  Undo,
  Redo,
  Zap,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Type,
  Palette,
  FileText,
  Eye,
  Layout,
  Columns,
  LayoutGrid,
  Maximize,
  Minimize,
  ZoomIn,
  ZoomOut,
  Sparkles,
  CheckCircle,
  MessageSquare,
  Languages,
  Paintbrush,
  Shapes,
  FileImage,
  Grid3X3,
  BarChart3,
  TextCursor,
  Subscript,
  Superscript,
  IndentIncrease,
  IndentDecrease,
  Copy,
  ClipboardPaste,
  Scissors,
  Ruler,
  SeparatorHorizontal,
  BookOpen,
  Bookmark,
  FileCheck,
  FilePlus,
  Lock,
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { toast } from '@/components/ui';
import type { Proposal, ProposalContent } from '@/types';

interface DocumentEditorProps {
  proposal: Proposal;
  onSave?: (content: ProposalContent) => void;
}

type RibbonTab = 'home' | 'insert' | 'design' | 'layout' | 'review' | 'view';

interface ToolbarTool {
  id: string;
  icon: React.ReactNode;
  label: string;
  action?: () => void;
  active?: boolean;
  dropdown?: boolean;
}

interface ToolbarGroup {
  id: string;
  label?: string;
  tools: ToolbarTool[];
}

// Random color generator for collaboration cursors
const getRandomColor = () => {
  const colors = [
    '#958DF1', '#F98181', '#FBBC88', '#FAF594', '#70CFF8',
    '#94FADB', '#B9F18D', '#C3E2C2', '#EAECCC', '#AFC8AD',
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export function DocumentEditor({ proposal, onSave }: DocumentEditorProps) {
  const { updateProposal, submitForApproval, currentUser } = useAppStore();
  const [content] = useState<ProposalContent>(proposal.content);
  const [aiPrompt, setAiPrompt] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<RibbonTab>('home');
  const [zoom, setZoom] = useState(100);
  const [showRuler, setShowRuler] = useState(true);
  const [fontSize, setFontSize] = useState('12');
  const [fontFamily, setFontFamily] = useState('Aptos (Body)');
  const [isSynced, setIsSynced] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const providerRef = useRef<HocuspocusProvider | null>(null);

  // Create Y.Doc for collaboration - memoized to prevent recreation
  const ydoc = useMemo(() => new Y.Doc(), []);

  // Set up IndexedDB persistence for offline support
  useEffect(() => {
    const documentId = `proposal-${proposal.id}`;
    const persistence = new IndexeddbPersistence(documentId, ydoc);

    persistence.on('synced', () => {
      setIsSynced(true);
    });

    return () => {
      persistence.destroy();
    };
  }, [ydoc, proposal.id]);

  // Set up HocuspocusProvider for Tiptap Cloud
  useEffect(() => {
    const documentId = `proposal-${proposal.id}`;

    const provider = new HocuspocusProvider({
      url: `wss://${TIPTAP_APP_ID}.collab.tiptap.cloud`,
      name: documentId,
      document: ydoc,
      token: TIPTAP_APP_SECRET,
      onConnect: () => {
        setIsConnected(true);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onSynced: () => {
        // Document synced with cloud
      },
    });

    providerRef.current = provider;

    return () => {
      provider.destroy();
    };
  }, [ydoc, proposal.id]);

  // Generate initial HTML content from proposal
  const initialContent = useMemo(() => {
    return `
      <h1>${content.title || 'Untitled Proposal'}</h1>
      <p class="meta">Client: ${content.client || 'N/A'}</p>
      <p class="meta">Date: ${new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</p>

      ${content.background ? `
      <h2>1. Background / Context</h2>
      <p>${content.background}</p>
      ` : ''}

      ${content.businessObjectives ? `
      <h2>2. Business Objectives</h2>
      <p>${content.businessObjectives}</p>
      ` : ''}

      ${content.researchObjectives ? `
      <h2>3. Research Objectives</h2>
      <p>${content.researchObjectives}</p>
      ` : ''}

      ${content.burningQuestions ? `
      <h2>4. Research Questions</h2>
      <p>${content.burningQuestions}</p>
      ` : ''}

      ${content.targetDefinition ? `
      <h2>5. Target Definition</h2>
      <p>${content.targetDefinition}</p>
      ` : ''}
    `;
  }, [content]);

  // Initialize Tiptap editor with collaboration
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const extensions: any[] = useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const exts: any[] = [
      StarterKit.configure({
        // @ts-expect-error - history option exists but may not be in type definition
        history: false, // Disable history as collaboration handles undo/redo
      }),
      Collaboration.configure({
        document: ydoc,
      }),
    ];

    // Add CollaborationCursor only when provider is available
    if (providerRef.current) {
      exts.push(
        CollaborationCursor.configure({
          provider: providerRef.current,
          user: {
            name: currentUser || 'Anonymous',
            color: getRandomColor(),
          },
        })
      );
    }

    return exts;
  }, [ydoc, currentUser, isConnected]); // isConnected triggers re-creation when provider connects

  const editor = useEditor({
    extensions,
    content: '',
    editorProps: {
      attributes: {
        class: cn(
          'p-12 md:p-16 min-h-[800px] focus:outline-none prose prose-gray dark:prose-invert max-w-none',
          '[&_h1]:text-3xl [&_h1]:font-bold [&_h1]:text-[#5B50BD] [&_h1]:dark:text-[#918AD3] [&_h1]:mb-6',
          '[&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:dark:text-white [&_h2]:mt-8 [&_h2]:mb-4 [&_h2]:border-b [&_h2]:border-gray-200 [&_h2]:dark:border-gray-700 [&_h2]:pb-2',
          '[&_h3]:text-lg [&_h3]:font-semibold [&_h3]:text-gray-800 [&_h3]:dark:text-gray-200 [&_h3]:mt-6 [&_h3]:mb-3',
          '[&_p]:text-gray-600 [&_p]:dark:text-gray-300 [&_p]:leading-relaxed [&_p]:mb-4',
          '[&_.meta]:text-gray-500 [&_.meta]:dark:text-gray-400 [&_.meta]:text-sm [&_.meta]:mb-1',
          '[&_blockquote]:border-l-4 [&_blockquote]:border-[#5B50BD] [&_blockquote]:bg-[#F9F8FD] [&_blockquote]:dark:bg-[#231E51] [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:italic',
          '[&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6',
          '[&_a]:text-[#5B50BD] [&_a]:underline [&_a]:hover:text-[#1ED6BB]',
          '[&_table]:border-collapse [&_table]:w-full [&_td]:border [&_td]:border-gray-300 [&_td]:dark:border-gray-600 [&_td]:p-3',
          '[&_th]:bg-[#5B50BD] [&_th]:text-white [&_th]:p-3 [&_th]:text-left',
          '[&_hr]:border-t-2 [&_hr]:border-[#1ED6BB] [&_hr]:my-8',
          'selection:bg-[#EDE9F9] selection:text-[#5B50BD]'
        ),
      },
    },
    onUpdate: () => {
      setHasChanges(true);
    },
  });

  // Set initial content when synced
  useEffect(() => {
    if (editor && isSynced) {
      // Only set content if the document is empty
      const fragment = ydoc.getXmlFragment('default');
      if (fragment.length === 0) {
        editor.commands.setContent(initialContent);
      }
    }
  }, [editor, isSynced, ydoc, initialContent]);

  // Ribbon tabs configuration
  const ribbonTabs: { id: RibbonTab; label: string }[] = [
    { id: 'home', label: 'Home' },
    { id: 'insert', label: 'Insert' },
    { id: 'design', label: 'Design' },
    { id: 'layout', label: 'Layout' },
    { id: 'review', label: 'Review' },
    { id: 'view', label: 'View' },
  ];

  // Helper to run editor commands safely
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const runCommand = (command: string, options?: any) => {
    if (!editor) return;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const chain = editor.chain().focus() as any;
    if (options !== undefined) {
      chain[command](options).run();
    } else {
      chain[command]().run();
    }
  };

  // Home tab tools
  const homeTabGroups: ToolbarGroup[] = [
    {
      id: 'clipboard',
      label: 'Clipboard',
      tools: [
        { id: 'paste', icon: <ClipboardPaste className="w-5 h-5" />, label: 'Paste', action: () => document.execCommand('paste') },
        { id: 'cut', icon: <Scissors className="w-4 h-4" />, label: 'Cut', action: () => document.execCommand('cut') },
        { id: 'copy', icon: <Copy className="w-4 h-4" />, label: 'Copy', action: () => document.execCommand('copy') },
      ],
    },
    {
      id: 'font',
      label: 'Font',
      tools: [
        { id: 'bold', icon: <Bold className="w-4 h-4" />, label: 'Bold (Ctrl+B)', action: () => runCommand('toggleBold'), active: editor?.isActive('bold') },
        { id: 'italic', icon: <Italic className="w-4 h-4" />, label: 'Italic (Ctrl+I)', action: () => runCommand('toggleItalic'), active: editor?.isActive('italic') },
        { id: 'underline', icon: <Underline className="w-4 h-4" />, label: 'Underline (Ctrl+U)', action: () => document.execCommand('underline') },
        { id: 'strikethrough', icon: <Strikethrough className="w-4 h-4" />, label: 'Strikethrough', action: () => runCommand('toggleStrike'), active: editor?.isActive('strike') },
        { id: 'subscript', icon: <Subscript className="w-4 h-4" />, label: 'Subscript', action: () => document.execCommand('subscript') },
        { id: 'superscript', icon: <Superscript className="w-4 h-4" />, label: 'Superscript', action: () => document.execCommand('superscript') },
        { id: 'highlight', icon: <Highlighter className="w-4 h-4" />, label: 'Highlight', action: () => document.execCommand('backColor', false, '#ffeb3b') },
        { id: 'text-color', icon: <Palette className="w-4 h-4" />, label: 'Font Color', action: () => document.execCommand('foreColor', false, '#5B50BD') },
      ],
    },
    {
      id: 'paragraph',
      label: 'Paragraph',
      tools: [
        { id: 'align-left', icon: <AlignLeft className="w-4 h-4" />, label: 'Align Left', action: () => document.execCommand('justifyLeft') },
        { id: 'align-center', icon: <AlignCenter className="w-4 h-4" />, label: 'Align Center', action: () => document.execCommand('justifyCenter') },
        { id: 'align-right', icon: <AlignRight className="w-4 h-4" />, label: 'Align Right', action: () => document.execCommand('justifyRight') },
        { id: 'align-justify', icon: <AlignJustify className="w-4 h-4" />, label: 'Justify', action: () => document.execCommand('justifyFull') },
        { id: 'bullet-list', icon: <List className="w-4 h-4" />, label: 'Bullet List', action: () => runCommand('toggleBulletList'), active: editor?.isActive('bulletList') },
        { id: 'numbered-list', icon: <ListOrdered className="w-4 h-4" />, label: 'Numbered List', action: () => runCommand('toggleOrderedList'), active: editor?.isActive('orderedList') },
        { id: 'indent-decrease', icon: <IndentDecrease className="w-4 h-4" />, label: 'Decrease Indent', action: () => document.execCommand('outdent') },
        { id: 'indent-increase', icon: <IndentIncrease className="w-4 h-4" />, label: 'Increase Indent', action: () => document.execCommand('indent') },
      ],
    },
    {
      id: 'styles',
      label: 'Styles',
      tools: [
        { id: 'normal', icon: <Type className="w-4 h-4" />, label: 'Normal', action: () => runCommand('setParagraph'), active: editor?.isActive('paragraph') },
        { id: 'h1', icon: <Heading1 className="w-4 h-4" />, label: 'Heading 1', action: () => runCommand('toggleHeading', { level: 1 }), active: editor?.isActive('heading', { level: 1 }) },
        { id: 'h2', icon: <Heading2 className="w-4 h-4" />, label: 'Heading 2', action: () => runCommand('toggleHeading', { level: 2 }), active: editor?.isActive('heading', { level: 2 }) },
        { id: 'h3', icon: <Heading3 className="w-4 h-4" />, label: 'Heading 3', action: () => runCommand('toggleHeading', { level: 3 }), active: editor?.isActive('heading', { level: 3 }) },
        { id: 'quote', icon: <Quote className="w-4 h-4" />, label: 'Quote', action: () => runCommand('toggleBlockquote'), active: editor?.isActive('blockquote') },
      ],
    },
    {
      id: 'editing',
      label: 'Editing',
      tools: [
        { id: 'undo', icon: <Undo className="w-4 h-4" />, label: 'Undo', action: () => runCommand('undo') },
        { id: 'redo', icon: <Redo className="w-4 h-4" />, label: 'Redo', action: () => runCommand('redo') },
      ],
    },
  ];

  // Insert tab tools
  const insertTabGroups: ToolbarGroup[] = [
    {
      id: 'pages',
      label: 'Pages',
      tools: [
        { id: 'page-break', icon: <FileText className="w-5 h-5" />, label: 'Page Break', action: () => runCommand('setHorizontalRule') },
        { id: 'blank-page', icon: <FilePlus className="w-4 h-4" />, label: 'Blank Page' },
      ],
    },
    {
      id: 'tables',
      label: 'Tables',
      tools: [
        { id: 'table', icon: <Table className="w-5 h-5" />, label: 'Table', action: () => {
          const tableHtml = '<table border="1" style="border-collapse: collapse; width: 100%; margin: 16px 0;"><tr><td style="padding: 12px; border: 1px solid #e5e7eb;">&nbsp;</td><td style="padding: 12px; border: 1px solid #e5e7eb;">&nbsp;</td><td style="padding: 12px; border: 1px solid #e5e7eb;">&nbsp;</td></tr><tr><td style="padding: 12px; border: 1px solid #e5e7eb;">&nbsp;</td><td style="padding: 12px; border: 1px solid #e5e7eb;">&nbsp;</td><td style="padding: 12px; border: 1px solid #e5e7eb;">&nbsp;</td></tr><tr><td style="padding: 12px; border: 1px solid #e5e7eb;">&nbsp;</td><td style="padding: 12px; border: 1px solid #e5e7eb;">&nbsp;</td><td style="padding: 12px; border: 1px solid #e5e7eb;">&nbsp;</td></tr></table>';
          runCommand('insertContent', tableHtml);
        }},
      ],
    },
    {
      id: 'illustrations',
      label: 'Illustrations',
      tools: [
        { id: 'image', icon: <FileImage className="w-5 h-5" />, label: 'Picture', action: () => {
          const url = prompt('Enter image URL:');
          if (url) {
            runCommand('insertContent', `<img src="${url}" alt="Image" />`);
          }
        }},
        { id: 'shapes', icon: <Shapes className="w-4 h-4" />, label: 'Shapes' },
        { id: 'chart', icon: <BarChart3 className="w-4 h-4" />, label: 'Chart' },
      ],
    },
    {
      id: 'links',
      label: 'Links',
      tools: [
        { id: 'link', icon: <Link className="w-5 h-5" />, label: 'Link', action: () => {
          const url = prompt('Enter URL:');
          if (url) {
            runCommand('insertContent', `<a href="${url}">${url}</a>`);
          }
        }},
        { id: 'bookmark', icon: <Bookmark className="w-4 h-4" />, label: 'Bookmark' },
      ],
    },
    {
      id: 'text',
      label: 'Text',
      tools: [
        { id: 'text-box', icon: <TextCursor className="w-5 h-5" />, label: 'Text Box' },
        { id: 'divider', icon: <Minus className="w-4 h-4" />, label: 'Horizontal Line', action: () => runCommand('setHorizontalRule') },
      ],
    },
  ];

  // Design tab tools
  const designTabGroups: ToolbarGroup[] = [
    {
      id: 'themes',
      label: 'Document Formatting',
      tools: [
        { id: 'colors', icon: <Palette className="w-5 h-5" />, label: 'Colors' },
        { id: 'fonts', icon: <Type className="w-5 h-5" />, label: 'Fonts' },
      ],
    },
    {
      id: 'page-background',
      label: 'Page Background',
      tools: [
        { id: 'watermark', icon: <FileText className="w-4 h-4" />, label: 'Watermark' },
        { id: 'page-color', icon: <Paintbrush className="w-4 h-4" />, label: 'Page Color' },
        { id: 'page-borders', icon: <Grid3X3 className="w-4 h-4" />, label: 'Page Borders' },
      ],
    },
  ];

  // Layout tab tools
  const layoutTabGroups: ToolbarGroup[] = [
    {
      id: 'page-setup',
      label: 'Page Setup',
      tools: [
        { id: 'margins', icon: <Layout className="w-5 h-5" />, label: 'Margins' },
        { id: 'orientation', icon: <FileText className="w-4 h-4" />, label: 'Orientation' },
        { id: 'size', icon: <Maximize className="w-4 h-4" />, label: 'Size' },
        { id: 'columns', icon: <Columns className="w-4 h-4" />, label: 'Columns' },
        { id: 'breaks', icon: <SeparatorHorizontal className="w-4 h-4" />, label: 'Breaks' },
      ],
    },
    {
      id: 'paragraph-layout',
      label: 'Paragraph',
      tools: [
        { id: 'spacing', icon: <LayoutGrid className="w-4 h-4" />, label: 'Spacing' },
      ],
    },
  ];

  // Review tab tools
  const reviewTabGroups: ToolbarGroup[] = [
    {
      id: 'proofing',
      label: 'Proofing',
      tools: [
        { id: 'spell-check', icon: <CheckCircle className="w-5 h-5" />, label: 'Spelling & Grammar' },
        { id: 'thesaurus', icon: <BookOpen className="w-4 h-4" />, label: 'Thesaurus' },
      ],
    },
    {
      id: 'language',
      label: 'Language',
      tools: [
        { id: 'translate', icon: <Languages className="w-5 h-5" />, label: 'Translate' },
        { id: 'language', icon: <Globe className="w-4 h-4" />, label: 'Language' },
      ],
    },
    {
      id: 'comments',
      label: 'Comments',
      tools: [
        { id: 'new-comment', icon: <MessageSquare className="w-5 h-5" />, label: 'New Comment' },
      ],
    },
    {
      id: 'tracking',
      label: 'Tracking',
      tools: [
        { id: 'track-changes', icon: <Eye className="w-5 h-5" />, label: 'Track Changes' },
      ],
    },
    {
      id: 'protect',
      label: 'Protect',
      tools: [
        { id: 'protect', icon: <Lock className="w-5 h-5" />, label: 'Protect Document' },
      ],
    },
  ];

  // View tab tools
  const viewTabGroups: ToolbarGroup[] = [
    {
      id: 'views',
      label: 'Views',
      tools: [
        { id: 'print-layout', icon: <FileText className="w-5 h-5" />, label: 'Print Layout' },
        { id: 'web-layout', icon: <Globe className="w-4 h-4" />, label: 'Web Layout' },
        { id: 'outline', icon: <List className="w-4 h-4" />, label: 'Outline' },
        { id: 'draft', icon: <FileCheck className="w-4 h-4" />, label: 'Draft' },
      ],
    },
    {
      id: 'show',
      label: 'Show',
      tools: [
        { id: 'ruler', icon: <Ruler className="w-4 h-4" />, label: 'Ruler', action: () => setShowRuler(!showRuler), active: showRuler },
        { id: 'gridlines', icon: <Grid3X3 className="w-4 h-4" />, label: 'Gridlines' },
      ],
    },
    {
      id: 'zoom',
      label: 'Zoom',
      tools: [
        { id: 'zoom-in', icon: <ZoomIn className="w-4 h-4" />, label: 'Zoom In', action: () => setZoom(Math.min(zoom + 10, 200)) },
        { id: 'zoom-out', icon: <ZoomOut className="w-4 h-4" />, label: 'Zoom Out', action: () => setZoom(Math.max(zoom - 10, 50)) },
        { id: 'zoom-100', icon: <Maximize className="w-4 h-4" />, label: '100%', action: () => setZoom(100) },
      ],
    },
  ];

  const getTabGroups = (tab: RibbonTab): ToolbarGroup[] => {
    switch (tab) {
      case 'home': return homeTabGroups;
      case 'insert': return insertTabGroups;
      case 'design': return designTabGroups;
      case 'layout': return layoutTabGroups;
      case 'review': return reviewTabGroups;
      case 'view': return viewTabGroups;
      default: return homeTabGroups;
    }
  };

  const handleSave = () => {
    if (!editor) return;

    // Parse HTML content back to ProposalContent structure
    // The content is automatically synced via Yjs
    const updatedContent = { ...content };

    if (onSave) {
      onSave(updatedContent);
    }
    updateProposal(proposal.id, { content: updatedContent });
    setHasChanges(false);
    toast.success('Saved', 'Your changes have been saved.');
  };

  const handleApprove = () => {
    submitForApproval(proposal.id, currentUser);
    toast.success('Submitted', 'Proposal submitted for approval.');
  };

  const handleExport = () => {
    if (!editor) return;

    const textContent = editor.getText();
    const blob = new Blob([textContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${content.title || 'proposal'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Exported', 'Proposal exported successfully.');
  };

  const handleAiSend = () => {
    if (!aiPrompt.trim()) return;
    toast.info('AI Assistant', `Processing: "${aiPrompt}"`);
    setAiPrompt('');
  };

  const getStatusBadge = () => {
    const statusStyles: Record<string, string> = {
      draft: 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
      pending_approval: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
      approved: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      rejected: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return statusStyles[proposal.status] || statusStyles.draft;
  };

  return (
    <div className="flex flex-col h-full bg-[#F3F3F3] dark:bg-gray-900">
      {/* Ribbon Tab Bar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        {/* Quick Access Toolbar */}
        <div className="flex items-center gap-1 px-2 py-1 border-b border-gray-100 dark:border-gray-700">
          <button
            onClick={handleSave}
            className="p-1.5 text-gray-500 hover:text-[#5B50BD] hover:bg-[#EDE9F9] dark:hover:bg-[#231E51] rounded transition-colors"
            title="Save"
          >
            <Save className="w-4 h-4" />
          </button>
          <button
            onClick={() => runCommand('undo')}
            className="p-1.5 text-gray-500 hover:text-[#5B50BD] hover:bg-[#EDE9F9] dark:hover:bg-[#231E51] rounded transition-colors"
            title="Undo"
          >
            <Undo className="w-4 h-4" />
          </button>
          <button
            onClick={() => runCommand('redo')}
            className="p-1.5 text-gray-500 hover:text-[#5B50BD] hover:bg-[#EDE9F9] dark:hover:bg-[#231E51] rounded transition-colors"
            title="Redo"
          >
            <Redo className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-gray-200 dark:bg-gray-600 mx-1" />
          <span className={cn('px-2 py-0.5 text-xs rounded-full capitalize', getStatusBadge())}>
            {proposal.status.replace('_', ' ')}
          </span>
          {hasChanges && (
            <span className="text-xs text-amber-500 ml-2">Unsaved</span>
          )}
          {/* Collaboration indicator */}
          <div className="flex items-center gap-2 ml-auto">
            <div className="flex items-center gap-1">
              <div className={cn(
                'w-2 h-2 rounded-full',
                isConnected ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
              )} />
              <span className="text-xs text-gray-500">
                {isConnected ? 'Connected' : 'Connecting...'}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <div className={cn(
                'w-2 h-2 rounded-full',
                isSynced ? 'bg-blue-500' : 'bg-gray-400'
              )} />
              <span className="text-xs text-gray-500">
                {isSynced ? 'Offline ready' : 'Caching...'}
              </span>
            </div>
          </div>
        </div>

        {/* Ribbon Tabs */}
        <div className="flex items-center px-1 pt-1 gap-0.5">
          {ribbonTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'px-2 py-1.5 text-xs font-medium rounded-t transition-colors relative whitespace-nowrap',
                activeTab === tab.id
                  ? 'text-[#5B50BD] bg-[#F9F8FD] dark:bg-gray-700 dark:text-[#918AD3]'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/50'
              )}
            >
              {tab.label}
              {activeTab === tab.id && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#5B50BD]" />
              )}
            </button>
          ))}
          <div className="flex-1 min-w-0" />
          <div className="flex items-center gap-1 pr-1 shrink-0">
            <button
              onClick={handleExport}
              className="flex items-center gap-1 px-2 py-1 text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
            {proposal.status === 'draft' && (
              <button
                onClick={handleApprove}
                className="flex items-center gap-1 px-2 py-1 text-xs text-white bg-[#5B50BD] hover:bg-[#4A3FAC] rounded transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Submit</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Ribbon Content */}
      <div className="bg-[#F9F8FD] dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700 px-2 py-1.5 shrink-0">
        <div className="flex items-end gap-3 flex-wrap">
          {getTabGroups(activeTab).map((group) => (
            <div key={group.id} className="flex flex-col">
              <div className="flex items-center gap-0.5 mb-0.5">
                {group.tools.map((tool, index) => (
                  <button
                    key={tool.id}
                    onClick={tool.action}
                    className={cn(
                      'flex items-center justify-center transition-colors rounded',
                      index === 0 && group.tools.length > 2
                        ? 'p-1.5 hover:bg-white dark:hover:bg-gray-700 shadow-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600'
                        : 'p-1.5 hover:bg-white dark:hover:bg-gray-700',
                      tool.active && 'bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD]'
                    )}
                    title={tool.label}
                  >
                    <span className={cn(
                      'w-3.5 h-3.5 flex items-center justify-center [&>svg]:w-3.5 [&>svg]:h-3.5',
                      index === 0 && group.tools.length > 2
                        ? 'text-[#5B50BD] dark:text-[#918AD3]'
                        : 'text-gray-600 dark:text-gray-400'
                    )}>
                      {tool.icon}
                    </span>
                  </button>
                ))}
              </div>
              {group.label && (
                <div className="text-[9px] text-gray-400 dark:text-gray-500 text-center border-t border-gray-200 dark:border-gray-600 pt-0.5 mt-auto">
                  {group.label}
                </div>
              )}
            </div>
          ))}

          {/* Font selectors for Home tab */}
          {activeTab === 'home' && (
            <div className="flex flex-col border-l border-gray-200 dark:border-gray-600 pl-2">
              <div className="flex items-center gap-1 mb-0.5">
                <select
                  value={fontFamily}
                  onChange={(e) => {
                    setFontFamily(e.target.value);
                  }}
                  className="h-6 px-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#5B50BD] w-20"
                >
                  <option value="Aptos (Body)">Aptos</option>
                  <option value="Arial">Arial</option>
                  <option value="Times New Roman">Times</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Calibri">Calibri</option>
                </select>
                <select
                  value={fontSize}
                  onChange={(e) => {
                    setFontSize(e.target.value);
                  }}
                  className="h-6 px-1 text-xs border border-gray-200 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-1 focus:ring-[#5B50BD] w-12"
                >
                  {[8, 9, 10, 11, 12, 14, 16, 18, 20, 24, 28, 36, 48, 72].map((size) => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>
              <div className="text-[9px] text-gray-400 dark:text-gray-500 text-center border-t border-gray-200 dark:border-gray-600 pt-0.5">
                Font
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Ruler (optional) */}
      {showRuler && (
        <div className="h-6 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-center shrink-0">
          <div className="w-full max-w-4xl relative">
            <div className="flex items-end h-4 text-[8px] text-gray-400">
              {Array.from({ length: 17 }, (_, i) => (
                <div key={i} className="flex-1 flex items-end justify-start border-l border-gray-300 dark:border-gray-600">
                  <span className="ml-0.5">{i}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Document Area - Tiptap Editor */}
      <div className="flex-1 overflow-auto p-4 md:p-8" style={{ zoom: `${zoom}%` }}>
        <div className="max-w-4xl mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-lg min-h-full border border-gray-200 dark:border-gray-700">
          <EditorContent editor={editor} />
        </div>
      </div>

      {/* AI Chat Panel (Slide-in) */}
      {isChatOpen && (
        <div className="fixed bottom-4 right-4 w-96 bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#5B50BD] to-[#1ED6BB] flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">AI Assistant</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">Ask me anything about your document</p>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded"
            >
              <Minimize className="w-4 h-4" />
            </button>
          </div>
          <div className="h-64 p-4 overflow-y-auto">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-6 h-6 rounded-full bg-[#EDE9F9] dark:bg-[#231E51] flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-3 h-3 text-[#5B50BD]" />
              </div>
              <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-3 text-sm text-gray-700 dark:text-gray-300">
                Hello! I can help you with your proposal. Try asking me to:
                <ul className="mt-2 space-y-1 text-xs">
                  <li>• Improve the writing style</li>
                  <li>• Add more details to a section</li>
                  <li>• Summarize the content</li>
                  <li>• Check for errors</li>
                </ul>
              </div>
            </div>
          </div>
          <div className="p-4 border-t border-gray-200 dark:border-gray-700">
            <div className="relative">
              <input
                type="text"
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAiSend()}
                placeholder="Ask AI to help with your document..."
                className="w-full px-4 py-3 pr-12 border border-gray-200 dark:border-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5B50BD] focus:border-transparent text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400"
              />
              <button
                onClick={handleAiSend}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-[#5B50BD] hover:bg-[#EDE9F9] dark:hover:bg-[#231E51] rounded-lg transition-colors"
              >
                <Zap className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
