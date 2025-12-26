'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  TrendingUp,
  Plus,
  ArrowRight,
  Bell,
  Bookmark,
  Calendar,
  Folder,
  Settings,
  X,
  GripVertical,
  RotateCcw,
  Calculator,
  Users,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  BarChart3,
  Zap,
  PieChart,
  LayoutDashboard,
  Info,
  Video,
  ListTodo,
  AlertCircle,
  Flag,
  Pencil,
  Trash2,
  Check,
  Search,
  Sparkles,
  MessageSquare,
  UserPlus,
  DollarSign,
  Target,
  Maximize2,
  Minimize2,
} from 'lucide-react';
import { useAppStore, type QuickAction, type CalendarTask, type CalendarTaskType, type CalendarTaskPriority } from '@/lib/store';
import { Button, Card, CardContent, Input, Select, AIBadge } from '@/components/ui';
import { cn, formatDate, getStatusColor, getStatusLabel, truncateText } from '@/lib/utils';
import type { Proposal } from '@/types';

// Widget configuration type
interface DashboardWidget {
  id: string;
  name: string;
  description: string;
  icon: string;
  visible: boolean;
  colspan: 1 | 2; // Grid column span
}

// Pending action types for navigation
type PendingActionType =
  | 'complete_draft'
  | 'review_rejection'
  | 'resume_on_hold'
  | 'awaiting_approval'
  | 'calculate_roi'
  | 'add_sample_size'
  | 'add_methodology'
  | 'collaboration_invite';

// Quick action icon map
const quickActionIcons: Record<string, React.ReactNode> = {
  Plus: <Plus className="h-5 w-5" />,
  Calculator: <Calculator className="h-5 w-5" />,
  Users: <Users className="h-5 w-5" />,
  BookOpen: <BookOpen className="h-5 w-5" />,
  FileText: <FileText className="h-5 w-5" />,
  BarChart3: <BarChart3 className="h-5 w-5" />,
  PieChart: <PieChart className="h-5 w-5" />,
  Folder: <Folder className="h-5 w-5" />,
};

// Widget icon component
function WidgetIcon({ name, className }: { name: string; className?: string }) {
  const iconClass = cn('h-4 w-4', className);
  const icons: Record<string, React.ReactNode> = {
    chart: <BarChart3 className={iconClass} />,
    lightning: <Zap className={iconClass} />,
    bell: <Bell className={iconClass} />,
    pin: <Bookmark className={iconClass} />,
    clock: <Clock className={iconClass} />,
    calendar: <Calendar className={iconClass} />,
    folder: <Folder className={iconClass} />,
    search: <Search className={iconClass} />,
    sparkles: <Sparkles className={iconClass} />,
  };
  return <>{icons[name] || <LayoutDashboard className={iconClass} />}</>;
}

// Stat card component
interface StatCardProps {
  label: string;
  value: number;
  icon: 'document' | 'check' | 'draft' | 'trending';
  color: string;
  onClick?: () => void;
}

function StatCard({ label, value, icon, color, onClick }: StatCardProps) {
  const icons = {
    document: <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />,
    check: <CheckCircle className="h-5 w-5 text-[#5B50BD] dark:text-[#918AD3]" />,
    draft: <Clock className="h-5 w-5 text-amber-500" />,
    trending: <TrendingUp className="h-5 w-5 text-blue-500" />,
  };

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md hover:scale-[1.02] active:scale-[0.98]',
        onClick && 'hover:ring-2 hover:ring-[#5B50BD]/30'
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center bg-gray-100 dark:bg-gray-800', color)}>
          {icons[icon]}
        </div>
        <div>
          <p className="text-2xl font-bold text-gray-800 dark:text-white">{value}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
        </div>
      </CardContent>
    </Card>
  );
}

// Quick action card component
interface QuickActionCardProps {
  action: QuickAction;
  onClick: () => void;
}

function QuickActionCard({ action, onClick }: QuickActionCardProps) {
  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:ring-1 hover:ring-[#5B50BD]/20 active:scale-[0.98]"
      onClick={onClick}
    >
      <CardContent className="p-5">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center text-white mb-3"
          style={{ backgroundColor: action.color }}
        >
          {quickActionIcons[action.icon] || <Plus className="h-5 w-5" />}
        </div>
        <h3 className="font-medium text-gray-800 dark:text-white mb-1">{action.label}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          {action.action === 'new-proposal' && 'Start creating a new proposal with AI'}
          {action.action === 'calculators' && 'MOE & Max-Diff calculators'}
          {action.action === 'demographics' && 'Population data analysis'}
          {action.action === 'library' && 'External links & resources'}
          {action.action === 'search-my' && 'View your proposals'}
          {!['new-proposal', 'calculators', 'demographics', 'library', 'search-my'].includes(action.action) && 'Quick access shortcut'}
        </p>
      </CardContent>
    </Card>
  );
}

// Proposal row component
function ProposalRow({ proposal, onClick }: { proposal: Proposal; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-between w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all text-left active:scale-[0.98]"
    >
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-gray-100 dark:bg-gray-700 rounded flex items-center justify-center">
          <FileText className="w-4 h-4 text-gray-400" />
        </div>
        <div>
          <p className="font-medium text-gray-800 dark:text-white text-sm">
            {truncateText(proposal.content.title || 'Untitled', 35)}
          </p>
          <p className="text-xs text-gray-400 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDate(proposal.createdAt)}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={cn('text-xs px-2 py-0.5 rounded', getStatusColor(proposal.status))}>
          {getStatusLabel(proposal.status)}
        </span>
        <ArrowRight className="w-4 h-4 text-gray-400" />
      </div>
    </button>
  );
}

export function Dashboard() {
  const {
    proposals,
    projects,
    currentUser,
    setActiveSection,
    setCurrentProposal,
    dashboardConfig,
    updateQuickAction,
    addQuickAction,
    deleteQuickAction,
    pinProposal,
    unpinProposal,
    pinnedProposalIds,
    setSearchPreset,
    calendarTasks,
    updateCalendarTasks,
  } = useAppStore();

  const [showCustomizeDashboard, setShowCustomizeDashboard] = useState(false);
  const [showCustomizeQuickActions, setShowCustomizeQuickActions] = useState(false);
  const [showProjectsModal, setShowProjectsModal] = useState(false);
  const [projectModalSearch, setProjectModalSearch] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [addActionsTab, setAddActionsTab] = useState('pages');

  // Visible projects in widget (localStorage persisted)
  const [visibleProjectIds, setVisibleProjectIds] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boltinsight_visible_projects');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  // Save visible projects to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('boltinsight_visible_projects', JSON.stringify(visibleProjectIds));
    }
  }, [visibleProjectIds]);

  // Toggle project visibility
  const toggleProjectVisibility = (projectId: string) => {
    setVisibleProjectIds(prev =>
      prev.includes(projectId)
        ? prev.filter(id => id !== projectId)
        : [...prev, projectId]
    );
  };

  // Get visible projects for the widget
  const visibleProjects = useMemo(() => {
    if (visibleProjectIds.length === 0) {
      // If no selection, show first 3 projects
      return projects.slice(0, 3);
    }
    return projects.filter(p => visibleProjectIds.includes(p.id)).slice(0, 6);
  }, [projects, visibleProjectIds]);

  // Drag-and-drop state for widgets
  const [draggedWidgetIndex, setDraggedWidgetIndex] = useState<number | null>(null);
  const [dragOverWidgetIndex, setDragOverWidgetIndex] = useState<number | null>(null);

  // Drag-and-drop state for quick actions
  const [draggedActionIndex, setDraggedActionIndex] = useState<number | null>(null);
  const [dragOverActionIndex, setDragOverActionIndex] = useState<number | null>(null);

  // Pin modal state
  const [showPinModal, setShowPinModal] = useState(false);
  const [pinSearch, setPinSearch] = useState('');
  const [pinStatusFilter, setPinStatusFilter] = useState<string>('');
  const [pinModalPos, setPinModalPos] = useState({ x: 0, y: 0 });
  const [pinDrag, setPinDrag] = useState<{ active: boolean; offsetX: number; offsetY: number }>({ active: false, offsetX: 0, offsetY: 0 });

  // Default dashboard widgets configuration
  const defaultWidgets: DashboardWidget[] = [
    { id: 'statistics', name: 'Statistics', description: 'Overview of your proposals', icon: 'chart', visible: true, colspan: 2 },
    { id: 'quick-actions', name: 'Quick Actions', description: 'Shortcuts to common tasks', icon: 'lightning', visible: true, colspan: 2 },
    { id: 'pending-actions', name: 'Pending Actions', description: 'Items that need your attention', icon: 'bell', visible: true, colspan: 1 },
    { id: 'pinned-proposals', name: 'Pinned Proposals', description: 'Your favorite proposals', icon: 'pin', visible: true, colspan: 1 },
    { id: 'recent-proposals', name: 'Recent Proposals', description: 'Recently created or updated', icon: 'clock', visible: true, colspan: 2 },
    { id: 'calendar', name: 'Calendar', description: 'Proposal timeline view', icon: 'calendar', visible: true, colspan: 1 },
    { id: 'projects', name: 'Projects', description: 'Your project folders', icon: 'folder', visible: true, colspan: 1 },
  ];

  // Dashboard widgets state with localStorage persistence
  const [dashboardWidgets, setDashboardWidgets] = useState<DashboardWidget[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('boltinsight_dashboard_widgets');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return defaultWidgets;
        }
      }
    }
    return defaultWidgets;
  });

  // Save widgets to localStorage when they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('boltinsight_dashboard_widgets', JSON.stringify(dashboardWidgets));
    }
  }, [dashboardWidgets]);

  // Quick action type for available actions
  type AvailableAction = {
    id: string;
    label: string;
    action: string;
    icon: string;
    color: string;
    description: string;
  };

  // Available quick actions for adding - categorized by tab
  const availableActionsByTab: Record<string, AvailableAction[]> = {
    pages: [
      { id: 'new-proposal', label: 'New Proposal', action: 'new-proposal', icon: 'Plus', color: '#5B50BD', description: 'Start creating a new proposal with AI' },
      { id: 'search-my', label: 'My Proposals', action: 'search-my', icon: 'FileText', color: '#1ED6BB', description: 'View your proposals' },
      { id: 'chat-projects', label: 'Projects', action: 'chat-projects', icon: 'Folder', color: '#8B5CF6', description: 'Manage your projects' },
    ],
    library: [
      { id: 'library', label: 'Library', action: 'library', icon: 'BookOpen', color: '#EC4899', description: 'External links & resources' },
      { id: 'meta-learnings', label: 'Meta Learnings', action: 'meta-learnings', icon: 'PieChart', color: '#F59E0B', description: 'Insights and learnings' },
    ],
    calculators: [
      { id: 'calculators', label: 'Calculators', action: 'calculators', icon: 'Calculator', color: '#3B82F6', description: 'MOE & Max-Diff calculators' },
      { id: 'demographics', label: 'Demographics', action: 'demographics', icon: 'Users', color: '#F59E0B', description: 'Population data analysis' },
      { id: 'feasibility', label: 'Feasibility', action: 'feasibility', icon: 'BarChart3', color: '#10B981', description: 'Check project feasibility' },
    ],
  };

  const availableActions = availableActionsByTab[addActionsTab] || availableActionsByTab.pages;

  // Get quick actions from store and sort by order
  const quickActions = useMemo(() => {
    const actions = dashboardConfig?.quickActions || [];
    return [...actions].sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [dashboardConfig?.quickActions]);

  // Start of month timestamp for filters
  const startOfMonthTime = useMemo(() => {
    const d = new Date();
    d.setDate(1);
    d.setHours(0, 0, 0, 0);
    return d.getTime();
  }, []);

  // Handle dragging of pin modal
  useEffect(() => {
    if (!pinDrag.active) return;
    const onMove = (e: MouseEvent) => {
      setPinModalPos({ x: e.clientX - pinDrag.offsetX, y: e.clientY - pinDrag.offsetY });
    };
    const onUp = () => setPinDrag({ active: false, offsetX: 0, offsetY: 0 });
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [pinDrag]);

  // Calculate stats
  const stats = useMemo(() => {
    const myProposals = proposals.filter(p => p.author.id === currentUser.id && p.status !== 'deleted');

    return {
      total: myProposals.length,
      approved: myProposals.filter(p => p.status === 'client_approved' || p.status === 'manager_approved').length,
      drafts: myProposals.filter(p => p.status === 'draft').length,
      thisMonth: myProposals.filter(p => new Date(p.createdAt).getTime() >= startOfMonthTime).length,
    };
  }, [proposals, currentUser.id, startOfMonthTime]);

  // Get pending actions (diverse items that need attention)
  const pendingActions = useMemo(() => {
    const actions: { proposal: Proposal; actionType: PendingActionType; section?: string }[] = [];

    // Drafts with missing sections - check specific fields
    proposals
      .filter(p => p.author.id === currentUser.id && p.status === 'draft')
      .forEach(p => {
        // Check for missing ROI/pricing
        if (!p.content.pricing?.total) {
          actions.push({ proposal: p, actionType: 'calculate_roi', section: 'pricing' });
        }
        // Check for missing sample size
        if (!p.content.sampleSize) {
          actions.push({ proposal: p, actionType: 'add_sample_size', section: 'sampleSize' });
        }
        // Check for missing methodology
        if (!p.content.methodology?.type) {
          actions.push({ proposal: p, actionType: 'add_methodology', section: 'methodology' });
        }
        // General incomplete drafts
        if (!p.content.title || !p.content.background) {
          actions.push({ proposal: p, actionType: 'complete_draft', section: 'title' });
        }
      });

    // Rejected proposals that need revision
    proposals
      .filter(p => p.author.id === currentUser.id && (p.status === 'manager_rejected' || p.status === 'client_rejected'))
      .forEach(p => actions.push({ proposal: p, actionType: 'review_rejection' }));

    // On hold proposals
    proposals
      .filter(p => p.author.id === currentUser.id && p.status === 'on_hold')
      .forEach(p => actions.push({ proposal: p, actionType: 'resume_on_hold' }));

    // Proposals pending approval (yours that are waiting)
    proposals
      .filter(p => p.author.id === currentUser.id && (p.status === 'pending_manager' || p.status === 'pending_client'))
      .forEach(p => actions.push({ proposal: p, actionType: 'awaiting_approval' }));

    // Remove duplicates and limit
    const uniqueActions = actions.filter((action, index, self) =>
      index === self.findIndex(a => a.proposal.id === action.proposal.id && a.actionType === action.actionType)
    );

    return uniqueActions.slice(0, 6);
  }, [proposals, currentUser.id]);

  // Get recent proposals
  const recentProposals = useMemo(() => {
    return proposals
      .filter(p => p.author.id === currentUser.id && p.status !== 'deleted')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [proposals, currentUser.id]);

  const thisMonthProposals = useMemo(() => {
    return proposals
      .filter(p => p.author.id === currentUser.id && p.status !== 'deleted' && new Date(p.createdAt).getTime() >= startOfMonthTime)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [proposals, currentUser.id, startOfMonthTime]);

  const pinnedProposals = useMemo(() => {
    return proposals.filter((p) => pinnedProposalIds.includes(p.id));
  }, [proposals, pinnedProposalIds]);

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    return { daysInMonth, startingDay };
  };

  const { daysInMonth, startingDay } = getDaysInMonth(currentMonth);
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentMonth.getMonth() && today.getFullYear() === currentMonth.getFullYear();

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState<CalendarTask | null>(null);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskAssignee, setNewTaskAssignee] = useState(currentUser.name);
  const [newTaskTime, setNewTaskTime] = useState('');
  const [newTaskEndTime, setNewTaskEndTime] = useState('');
  const [newTaskType, setNewTaskType] = useState<CalendarTaskType>('task');
  const [newTaskPriority, setNewTaskPriority] = useState<CalendarTaskPriority>('medium');
  const [newTaskLink, setNewTaskLink] = useState('');
  const [newTaskNotes, setNewTaskNotes] = useState('');

  const resetTaskForm = () => {
    setNewTaskTitle('');
    setNewTaskAssignee(currentUser.name);
    setNewTaskTime('');
    setNewTaskEndTime('');
    setNewTaskType('task');
    setNewTaskPriority('medium');
    setNewTaskLink('');
    setNewTaskNotes('');
    setEditingTask(null);
  };

  const openAddTaskModal = (date: string) => {
    setSelectedDate(date);
    resetTaskForm();
    setShowAddTaskModal(true);
  };

  const openEditTaskModal = (task: CalendarTask) => {
    setEditingTask(task);
    setSelectedDate(task.date);
    setNewTaskTitle(task.title);
    setNewTaskAssignee(task.assignee);
    setNewTaskTime(task.time || '');
    setNewTaskEndTime(task.endTime || '');
    setNewTaskType(task.type);
    setNewTaskPriority(task.priority);
    setNewTaskLink(task.link || '');
    setNewTaskNotes(task.notes || '');
    setShowAddTaskModal(true);
  };

  const handleSaveTask = () => {
    if (!newTaskTitle.trim() || !selectedDate) return;

    const taskData: CalendarTask = {
      id: editingTask?.id || `task-${Date.now()}`,
      date: selectedDate,
      title: newTaskTitle.trim(),
      assignee: newTaskAssignee || currentUser.name,
      time: newTaskTime || undefined,
      endTime: newTaskEndTime || undefined,
      type: newTaskType,
      priority: newTaskPriority,
      link: newTaskLink || undefined,
      notes: newTaskNotes || undefined,
      completed: editingTask?.completed || false,
    };

    if (editingTask) {
      updateCalendarTasks(calendarTasks.map(t => t.id === editingTask.id ? taskData : t));
    } else {
      updateCalendarTasks([...calendarTasks, taskData]);
    }

    setShowAddTaskModal(false);
    resetTaskForm();
  };

  const handleDeleteTask = (taskId: string) => {
    updateCalendarTasks(calendarTasks.filter(t => t.id !== taskId));
  };

  const handleToggleComplete = (task: CalendarTask) => {
    updateCalendarTasks(calendarTasks.map(t =>
      t.id === task.id ? { ...t, completed: !t.completed } : t
    ));
  };

  const getTaskTypeIcon = (type: CalendarTaskType) => {
    switch (type) {
      case 'meeting': return <Video className="w-3.5 h-3.5" />;
      case 'task': return <ListTodo className="w-3.5 h-3.5" />;
      case 'reminder': return <Bell className="w-3.5 h-3.5" />;
      case 'deadline': return <Flag className="w-3.5 h-3.5" />;
    }
  };

  const getTaskTypeColor = (type: CalendarTaskType) => {
    switch (type) {
      case 'meeting': return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
      case 'task': return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
      case 'reminder': return 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400';
      case 'deadline': return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
    }
  };

  const getPriorityColor = (priority: CalendarTaskPriority) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-gray-400';
    }
  };

  const formatDateDisplay = (dateKey: string) => {
    const [year, month, day] = dateKey.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  };

  // Greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Handlers
  const handleProposalClick = (proposal: Proposal, options?: { openEditor?: boolean; section?: string }) => {
    setCurrentProposal(proposal);
    if (options?.openEditor) {
      sessionStorage.setItem('proposalEditorMode', 'editor');
      if (options.section) {
        sessionStorage.setItem('proposalEditorSection', options.section);
      }
    }
    setActiveSection('view-proposal');
  };

  const handleQuickActionClick = (action: QuickAction) => {
    setActiveSection(action.action);
  };

  const toggleWidgetVisibility = (widgetId: string) => {
    setDashboardWidgets(widgets =>
      widgets.map(w => w.id === widgetId ? { ...w, visible: !w.visible } : w)
    );
  };

  const toggleWidgetSize = (widgetId: string) => {
    setDashboardWidgets(widgets =>
      widgets.map(w => w.id === widgetId ? { ...w, colspan: w.colspan === 1 ? 2 : 1 } : w)
    );
  };

  const getMissingSections = (proposal: Proposal) => {
    const missing: string[] = [];
    if (!proposal.content.title) missing.push('title');
    if (!proposal.content.background) missing.push('background');
    if (!proposal.content.sampleSize) missing.push('sampleSize');
    if (!proposal.content.targetDefinition) missing.push('targetDefinition');
    if (!proposal.content.loi) missing.push('loi');
    return missing.length ? missing : ['title'];
  };

  const isActionAdded = (actionId: string) => {
    return quickActions.some(a => a.id === actionId || a.action === actionId);
  };

  const handleRemoveQuickAction = (actionId: string) => {
    deleteQuickAction(actionId);
  };

  const handleAddQuickAction = (action: AvailableAction) => {
    if (!isActionAdded(action.id)) {
      addQuickAction({
        label: action.label,
        icon: action.icon,
        action: action.action,
        color: action.color,
      });
    }
  };

  const resetToDefault = () => {
    setDashboardWidgets(defaultWidgets);
  };

  // Widget drag-and-drop handlers
  const handleWidgetDragStart = (e: React.DragEvent, index: number) => {
    setDraggedWidgetIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleWidgetDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedWidgetIndex !== null && draggedWidgetIndex !== index) {
      setDragOverWidgetIndex(index);
    }
  };

  const handleWidgetDragLeave = () => {
    setDragOverWidgetIndex(null);
  };

  const handleWidgetDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedWidgetIndex !== null && draggedWidgetIndex !== dropIndex) {
      const newWidgets = [...dashboardWidgets];
      const [draggedWidget] = newWidgets.splice(draggedWidgetIndex, 1);
      newWidgets.splice(dropIndex, 0, draggedWidget);
      setDashboardWidgets(newWidgets);
    }
    setDraggedWidgetIndex(null);
    setDragOverWidgetIndex(null);
  };

  const handleWidgetDragEnd = () => {
    setDraggedWidgetIndex(null);
    setDragOverWidgetIndex(null);
  };

  // Quick action drag-and-drop handlers
  const handleActionDragStart = (e: React.DragEvent, index: number) => {
    setDraggedActionIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleActionDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (draggedActionIndex !== null && draggedActionIndex !== index) {
      setDragOverActionIndex(index);
    }
  };

  const handleActionDragLeave = () => {
    setDragOverActionIndex(null);
  };

  const handleActionDrop = (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (draggedActionIndex !== null && draggedActionIndex !== dropIndex) {
      // Reorder quick actions in store
      const reorderedActions = [...quickActions];
      const [draggedAction] = reorderedActions.splice(draggedActionIndex, 1);
      reorderedActions.splice(dropIndex, 0, draggedAction);

      // Update order property and save to store
      reorderedActions.forEach((action, idx) => {
        updateQuickAction(action.id, { order: idx });
      });
    }
    setDraggedActionIndex(null);
    setDragOverActionIndex(null);
  };

  const handleActionDragEnd = () => {
    setDraggedActionIndex(null);
    setDragOverActionIndex(null);
  };

  // Render individual widget by ID
  const renderWidget = (widget: DashboardWidget): React.ReactNode => {
    const widgetId = widget.id;
    const colspanClass = widget.colspan === 2 ? 'col-span-2' : 'col-span-1';

    switch (widgetId) {
      case 'statistics':
        return (
          <div key="statistics" className={cn(colspanClass, widget.colspan === 2 ? 'grid grid-cols-4 gap-4' : 'grid grid-cols-2 gap-4')}>
            <StatCard
              label="Total Proposals"
              value={stats.total}
              icon="document"
              color=""
              onClick={() => setActiveSection('search-my')}
            />
            <StatCard
              label="Approved"
              value={stats.approved}
              icon="check"
              color=""
              onClick={() => {
                setSearchPreset({ scope: 'my', status: 'client_approved' });
                setActiveSection('search-my');
              }}
            />
            <StatCard
              label="Drafts"
              value={stats.drafts}
              icon="draft"
              color=""
              onClick={() => {
                setSearchPreset({ scope: 'my', status: 'draft' });
                setActiveSection('search-my');
              }}
            />
            <StatCard
              label="This Month"
              value={stats.thisMonth}
              icon="trending"
              color=""
              onClick={() => {
                const now = new Date();
                const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                const diffDays = Math.max(1, Math.ceil((now.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)));
                setSearchPreset({ scope: 'my', dateRangeDays: diffDays });
                setActiveSection('search-my');
              }}
            />
          </div>
        );

      case 'quick-actions':
        return (
          <div key="quick-actions" className={colspanClass}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Quick Actions</h2>
              <button
                onClick={() => setShowCustomizeQuickActions(true)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-all active:scale-[0.9]"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
            <div className={widget.colspan === 2 ? 'grid grid-cols-4 gap-4' : 'grid grid-cols-2 gap-3'}>
              {quickActions.map((action) => (
                <QuickActionCard
                  key={action.id}
                  action={action}
                  onClick={() => handleQuickActionClick(action)}
                />
              ))}
            </div>
          </div>
        );

      case 'pending-actions':
        return (
          <Card key="pending-actions" className={colspanClass}>
            <CardContent className="p-5">
              <div className="flex items-center gap-2 mb-4">
                <Bell className="w-5 h-5 text-amber-500" />
                <h2 className="font-semibold text-gray-800 dark:text-white">Pending Actions</h2>
                {pendingActions.length > 0 && (
                  <span className="w-5 h-5 bg-amber-500 text-white text-xs rounded-full flex items-center justify-center">
                    {pendingActions.length}
                  </span>
                )}
              </div>
              <div className="space-y-2">
              {pendingActions.length === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">All caught up!</p>
                    <p className="text-xs text-[#5B50BD] dark:text-[#918AD3]">No pending actions</p>
                  </div>
                </div>
              ) : (
                pendingActions.map(({ proposal, actionType, section }) => {
                  const getActionLabel = () => {
                    switch (actionType) {
                      case 'complete_draft':
                        return `Complete proposal: ${getMissingSections(proposal).map(s => s.replace(/([A-Z])/g, ' $1')).join(', ')}`;
                      case 'calculate_roi':
                        return 'ROI calculation needed';
                      case 'add_sample_size':
                        return 'Sample size required';
                      case 'add_methodology':
                        return 'Methodology needs to be defined';
                      case 'review_rejection':
                        return 'Rejected - Review feedback & revise';
                      case 'resume_on_hold':
                        return 'On Hold - Check status & resume';
                      case 'awaiting_approval':
                        return 'Awaiting approval';
                      case 'collaboration_invite':
                        return 'Collaboration invite pending';
                      default:
                        return 'Needs attention';
                    }
                  };

                  const getActionIcon = () => {
                    switch (actionType) {
                      case 'calculate_roi':
                        return <DollarSign className="w-4 h-4" />;
                      case 'add_sample_size':
                        return <Users className="w-4 h-4" />;
                      case 'add_methodology':
                        return <Target className="w-4 h-4" />;
                      case 'collaboration_invite':
                        return <UserPlus className="w-4 h-4" />;
                      case 'review_rejection':
                        return <AlertCircle className="w-4 h-4" />;
                      case 'resume_on_hold':
                        return <Clock className="w-4 h-4" />;
                      case 'awaiting_approval':
                        return <Clock className="w-4 h-4" />;
                      default:
                        return <FileText className="w-4 h-4" />;
                    }
                  };

                  const getIconColor = () => {
                    switch (actionType) {
                      case 'calculate_roi':
                        return 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400';
                      case 'add_sample_size':
                        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
                      case 'add_methodology':
                        return 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400';
                      case 'review_rejection':
                        return 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400';
                      case 'resume_on_hold':
                        return 'bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400';
                      case 'awaiting_approval':
                        return 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400';
                      case 'collaboration_invite':
                        return 'bg-teal-100 text-teal-600 dark:bg-teal-900/30 dark:text-teal-400';
                      default:
                        return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
                    }
                  };

                  return (
                    <button
                      key={`${proposal.id}-${actionType}`}
                      onClick={() => handleProposalClick(proposal, {
                        openEditor: ['complete_draft', 'calculate_roi', 'add_sample_size', 'add_methodology'].includes(actionType),
                        section: section || (actionType === 'complete_draft' ? getMissingSections(proposal)[0] : undefined)
                      })}
                      className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all cursor-pointer w-full text-left active:scale-[0.98]"
                    >
                      <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center", getIconColor())}>
                        {getActionIcon()}
                      </div>
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white text-sm">
                          {truncateText(proposal.content.title || 'Untitled Brief', 25)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {getActionLabel()}
                        </p>
                      </div>
                    </button>
                  );
                })
              )}
              </div>
            </CardContent>
          </Card>
        );

      case 'pinned-proposals':
        return (
          <Card key="pinned-proposals" className={colspanClass}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-5 h-5 text-amber-500" />
                  <h2 className="font-semibold text-gray-800 dark:text-white">Pinned Proposals</h2>
                </div>
                <button
                  onClick={() => setShowPinModal(true)}
                  className="text-[#5B50BD] dark:text-[#918AD3] text-sm font-medium flex items-center gap-1 hover:opacity-80"
                >
                  <Plus className="w-4 h-4" />
                  Add
                </button>
              </div>
              {pinnedProposals.length === 0 ? (
                <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                    <Bookmark className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-800 dark:text-white text-sm">No pinned proposals</p>
                    <p className="text-xs text-[#5B50BD] dark:text-[#918AD3]">Pin your favorites for quick access</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {pinnedProposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-all"
                    >
                      <button
                        onClick={() => handleProposalClick(proposal)}
                        className="flex items-center gap-3 text-left transition-all active:scale-[0.98]"
                      >
                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                          <FileText className="w-4 h-4 text-gray-400" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white text-sm">
                            {truncateText(proposal.content.title || 'Untitled Brief', 25)}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {proposal.content.client || 'No client'}
                          </p>
                        </div>
                      </button>
                      <button
                        onClick={() => unpinProposal(proposal.id)}
                        className="text-xs text-red-500 hover:text-red-600 transition-all active:scale-[0.95]"
                        aria-label="Unpin proposal"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'calendar':
        return (
          <Card key="calendar" className={colspanClass}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-[#5B50BD]" />
                  <h2 className="font-semibold text-gray-800 dark:text-white">Calendar</h2>
                </div>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="text-[#5B50BD] dark:text-[#918AD3] text-sm font-medium hover:opacity-80 transition-all active:scale-[0.95]"
                >
                  Today
                </button>
              </div>

              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all active:scale-[0.9]"
                >
                  <ChevronLeft className="w-4 h-4 text-gray-500" />
                </button>
                <span className="font-semibold text-gray-800 dark:text-white">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </span>
                <button
                  onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                  className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all active:scale-[0.9]"
                >
                  <ChevronRight className="w-4 h-4 text-gray-500" />
                </button>
              </div>

              {/* Calendar Grid */}
              <div className="grid grid-cols-7 gap-1 text-center mb-4">
                {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((day) => (
                  <div key={day} className="text-xs font-medium text-gray-400 py-2">{day}</div>
                ))}
                {Array.from({ length: startingDay }).map((_, i) => (
                  <div key={`empty-${i}`} className="py-2" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isToday = isCurrentMonth && day === today.getDate();
                  const dateKey = `${currentMonth.getFullYear()}-${currentMonth.getMonth() + 1}-${day}`;
                  const tasksForDay = calendarTasks.filter((t) => t.date === dateKey);
                  const isSelected = selectedDate === dateKey;
                  return (
                    <div
                      key={day}
                      className={cn(
                        'py-2 text-sm rounded-lg cursor-pointer transition-all relative group active:scale-[0.95]',
                        isToday && !isSelected && 'bg-[#5B50BD] text-white font-semibold',
                        isSelected && 'bg-[#5B50BD]/20 text-[#5B50BD] dark:text-[#918AD3] ring-2 ring-[#5B50BD]',
                        !isToday && !isSelected && 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                      onClick={() => setSelectedDate(isSelected ? null : dateKey)}
                    >
                      {day}
                      {tasksForDay.length > 0 && (
                        <span className={cn(
                          "absolute -top-0.5 -right-0.5 inline-flex items-center justify-center h-4 min-w-[16px] rounded-full text-[10px] px-1 font-medium",
                          isToday && !isSelected ? "bg-white text-[#5B50BD]" : "bg-[#5B50BD] text-white"
                        )}>
                          {tasksForDay.length}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Task drawer */}
              {selectedDate && (
                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-white">
                        {formatDateDisplay(selectedDate)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {calendarTasks.filter((t) => t.date === selectedDate).length} task(s)
                      </p>
                    </div>
                    <button
                      onClick={() => openAddTaskModal(selectedDate)}
                      className="flex items-center gap-1 px-3 py-1.5 bg-[#5B50BD] hover:bg-[#4a41a0] text-white text-xs font-medium rounded-lg transition-all active:scale-[0.95]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Task
                    </button>
                  </div>

                  {/* Task List */}
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {calendarTasks
                      .filter((t) => t.date === selectedDate)
                      .sort((a, b) => (a.time || '99:99').localeCompare(b.time || '99:99'))
                      .map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-lg border transition-all",
                          task.completed
                            ? "bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 opacity-60"
                            : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 hover:border-[#5B50BD]/30"
                        )}
                      >
                        {/* Complete checkbox */}
                        <button
                          onClick={() => handleToggleComplete(task)}
                          className={cn(
                            "mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all active:scale-[0.85]",
                            task.completed
                              ? "bg-green-500 border-green-500 text-white"
                              : "border-gray-300 dark:border-gray-600 hover:border-[#5B50BD]"
                          )}
                        >
                          {task.completed && <Check className="w-3 h-3" />}
                        </button>

                        {/* Task content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium", getTaskTypeColor(task.type))}>
                              {getTaskTypeIcon(task.type)}
                              {task.type.charAt(0).toUpperCase() + task.type.slice(1)}
                            </span>
                            <AlertCircle className={cn("w-3 h-3", getPriorityColor(task.priority))} />
                            {task.time && (
                              <span className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-0.5">
                                <Clock className="w-3 h-3" />
                                {task.time}{task.endTime && ` - ${task.endTime}`}
                              </span>
                            )}
                          </div>
                          <p className={cn(
                            "text-sm font-medium text-gray-800 dark:text-white",
                            task.completed && "line-through"
                          )}>
                            {task.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{task.assignee}</p>
                          {task.notes && (
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 line-clamp-1">{task.notes}</p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <button
                            onClick={() => openEditTaskModal(task)}
                            className="p-1 text-gray-400 hover:text-[#5B50BD] rounded transition-all active:scale-[0.85]"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task.id)}
                            className="p-1 text-gray-400 hover:text-red-500 rounded transition-all active:scale-[0.85]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    {calendarTasks.filter((t) => t.date === selectedDate).length === 0 && (
                      <div className="text-center py-6">
                        <Calendar className="w-8 h-8 mx-auto text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">No tasks for this day</p>
                        <button
                          onClick={() => openAddTaskModal(selectedDate)}
                          className="mt-2 text-sm text-[#5B50BD] hover:underline"
                        >
                          Add your first task
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        );

      case 'projects':
        return (
          <Card key="projects" className={colspanClass}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Folder className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
                  <h2 className="font-semibold text-gray-800 dark:text-white">Projects</h2>
                </div>
                <button
                  onClick={() => setShowProjectsModal(true)}
                  className="text-[#5B50BD] dark:text-[#918AD3] text-sm font-medium flex items-center gap-1 hover:opacity-80"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-2">
                {projects.length === 0 ? (
                  <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <Folder className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">No projects yet</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Create your first project</p>
                    </div>
                  </div>
                ) : (
                  visibleProjects.map((project, index) => {
                    const projectColors = ['#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#3b82f6'];
                    const proposalCount = proposals.filter(
                      p => p.projectId === project.id || project.proposals.includes(p.id)
                    ).length;
                    return (
                      <button
                        key={project.id}
                        onClick={() => setActiveSection(`project-${project.id}`)}
                        className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-all cursor-pointer w-full text-left active:scale-[0.98]"
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: projectColors[index % projectColors.length] }}
                        />
                        <div>
                          <p className="font-medium text-gray-800 dark:text-white text-sm">{project.name}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{proposalCount} proposals</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'recent-proposals':
        return (
          <Card key="recent-proposals" className={colspanClass}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 dark:text-white">Recent Proposals</h2>
                <button
                  onClick={() => {
                    setSearchPreset({ scope: 'my', dateRangeDays: 30 });
                    setActiveSection('search-my');
                  }}
                  className="text-[#5B50BD] dark:text-[#918AD3] text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-all active:scale-[0.95]"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {recentProposals.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <FileText className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">No proposals yet</p>
                      <p className="text-xs text-[#5B50BD] dark:text-[#918AD3]">Create your first proposal</p>
                    </div>
                  </div>
                ) : (
                  recentProposals.map((proposal) => (
                    <ProposalRow
                      key={proposal.id}
                      proposal={proposal}
                      onClick={() => handleProposalClick(proposal)}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        );

      case 'this-month':
        return (
          <Card key="this-month" className={colspanClass}>
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-semibold text-gray-800 dark:text-white">This Month</h2>
                <button
                  onClick={() => {
                    const now = new Date();
                    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                    const diffDays = Math.max(1, Math.ceil((now.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24)));
                    setSearchPreset({ scope: 'my', dateRangeDays: diffDays });
                    setActiveSection('search-my');
                  }}
                  className="text-[#5B50BD] dark:text-[#918AD3] text-sm font-medium flex items-center gap-1 hover:opacity-80 transition-all active:scale-[0.95]"
                >
                  View all
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
              <div className="space-y-1">
                {thisMonthProposals.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded flex items-center justify-center">
                      <Clock className="w-4 h-4 text-gray-400" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">No proposals yet</p>
                      <p className="text-xs text-[#5B50BD] dark:text-[#918AD3]">Create a proposal this month</p>
                    </div>
                  </div>
                ) : (
                  thisMonthProposals.map((proposal) => (
                    <ProposalRow
                      key={proposal.id}
                      proposal={proposal}
                      onClick={() => handleProposalClick(proposal)}
                    />
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-gray-800 dark:text-white">
              {getGreeting()}, {currentUser.name.split(' ')[0]}!
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Here's what's happening with your proposals
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowCustomizeDashboard(true)}
            className="flex items-center gap-2"
          >
            <LayoutDashboard className="w-4 h-4" />
            Customize
          </Button>
        </div>

        {/* Dynamic Widget Grid */}
        <div className="grid grid-cols-2 gap-6 items-start">
          {dashboardWidgets
            .filter(widget => widget.visible)
            .map(widget => renderWidget(widget))}
        </div>
      </div>

      {/* Pin Proposals Modal */}
      {showPinModal && (
        <div className="fixed inset-0 z-50">

          <div
            className="absolute w-full max-w-lg rounded-xl bg-white dark:bg-gray-800 shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[80vh] overflow-hidden flex flex-col cursor-default"
            style={{ left: pinModalPos.x || 'auto', top: pinModalPos.y || '80px', right: pinModalPos.x ? 'auto' : '24px' }}
          >
            <div
              className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 px-6 py-4 cursor-move"
              onMouseDown={(e) => {
                const rect = (e.currentTarget.parentElement as HTMLElement).getBoundingClientRect();
                setPinDrag({ active: true, offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top });
              }}
            >
              <div className="flex items-center gap-2">
                <Bookmark className="h-5 w-5 text-[#5B50BD]" />
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Pin Proposals</h2>
              </div>
              <button
                onClick={() => setShowPinModal(false)}
                className="rounded p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center gap-3">
              <div className="relative flex-1">
                <div className="absolute left-3 top-1/2 -translate-y-1/2">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <Input
                  value={pinSearch}
                  onChange={(e) => setPinSearch(e.target.value)}
                  placeholder="Search proposals..."
                  className="pl-9 pr-4 py-2 text-sm"
                />
              </div>
              <Select
                options={[
                  { value: '', label: 'All statuses' },
                  { value: 'draft', label: 'Draft' },
                  { value: 'pending_manager', label: 'Pending Manager' },
                  { value: 'manager_approved', label: 'Manager Approved' },
                  { value: 'manager_rejected', label: 'Manager Rejected' },
                  { value: 'pending_client', label: 'Pending Client' },
                  { value: 'client_approved', label: 'Client Approved' },
                  { value: 'client_rejected', label: 'Client Rejected' },
                  { value: 'on_hold', label: 'On Hold' },
                  { value: 'revisions_needed', label: 'Revisions Needed' },
                ]}
                value={pinStatusFilter}
                onChange={(e) => setPinStatusFilter(e.target.value)}
                className="w-40"
              />
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {proposals
                .filter((p) => p.status !== 'deleted')
                .filter((p) =>
                  (!pinSearch ||
                    p.content.title?.toLowerCase().includes(pinSearch.toLowerCase()) ||
                    p.content.client?.toLowerCase().includes(pinSearch.toLowerCase())) &&
                  (!pinStatusFilter || p.status === pinStatusFilter)
                )
                .map((proposal) => {
                  const isPinned = pinnedProposalIds.includes(proposal.id);
                  return (
                    <label
                      key={proposal.id}
                      className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={isPinned}
                        onChange={() => (isPinned ? unpinProposal(proposal.id) : pinProposal(proposal.id))}
                        className="h-4 w-4 accent-[#5B50BD]"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 dark:text-white truncate">
                          {proposal.content.title || 'Untitled'}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                          {proposal.content.client || 'No client'} • {getStatusLabel(proposal.status)}
                        </p>
                      </div>
                    </label>
                  );
                })}
            </div>
            <div className="border-t border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-end">
              <Button onClick={() => setShowPinModal(false)}>Done</Button>
            </div>
          </div>
        </div>
      )}

      {/* Customize Dashboard Modal */}
      {showCustomizeDashboard && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-md shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <LayoutDashboard className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Customize Dashboard</h2>
              </div>
              <button
                onClick={() => setShowCustomizeDashboard(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Drag to reorder widgets. Toggle visibility and size.
              </p>

              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {dashboardWidgets.map((widget, index) => (
                  <div
                    key={widget.id}
                    draggable
                    onDragStart={(e) => handleWidgetDragStart(e, index)}
                    onDragOver={(e) => handleWidgetDragOver(e, index)}
                    onDragLeave={handleWidgetDragLeave}
                    onDrop={(e) => handleWidgetDrop(e, index)}
                    onDragEnd={handleWidgetDragEnd}
                    className={cn(
                      'flex items-center gap-3 p-3 border rounded-lg transition-all cursor-move',
                      draggedWidgetIndex === index
                        ? 'opacity-50 border-[#5B50BD] dark:border-[#918AD3] bg-[#EDE9F9] dark:bg-[#231E51]'
                        : dragOverWidgetIndex === index
                        ? 'border-[#5B50BD] dark:border-[#918AD3] bg-[#EDE9F9]/50 dark:bg-[#231E51]/50'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <div className="w-8 h-8 bg-[#EDE9F9] dark:bg-[#231E51] rounded flex items-center justify-center">
                      <WidgetIcon name={widget.icon} className="text-[#5B50BD] dark:text-[#918AD3]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-gray-800 dark:text-white text-sm">{widget.name}</p>
                        <span className={cn(
                          "text-[10px] px-1.5 py-0.5 rounded font-medium",
                          widget.colspan === 2
                            ? "bg-[#5B50BD]/10 text-[#5B50BD] dark:bg-[#918AD3]/20 dark:text-[#918AD3]"
                            : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                        )}>
                          {widget.colspan === 2 ? 'Full' : 'Half'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{widget.description}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      {/* Size toggle */}
                      <button
                        onClick={() => toggleWidgetSize(widget.id)}
                        className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        title={widget.colspan === 2 ? 'Make half width' : 'Make full width'}
                      >
                        {widget.colspan === 2 ? (
                          <Minimize2 className="w-4 h-4 text-gray-400" />
                        ) : (
                          <Maximize2 className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                      {/* Visibility toggle */}
                      <button
                        onClick={() => toggleWidgetVisibility(widget.id)}
                        className={cn(
                          'p-1.5 rounded transition-colors',
                          widget.visible ? 'text-[#5B50BD] dark:text-[#918AD3]' : 'text-gray-300 dark:text-gray-600'
                        )}
                        title={widget.visible ? 'Hide widget' : 'Show widget'}
                      >
                        {widget.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-5 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={resetToDefault}
                className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
              >
                <RotateCcw className="w-4 h-4" />
                Reset to default
              </button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setShowCustomizeDashboard(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowCustomizeDashboard(false)}>
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Customize Quick Actions Modal */}
      {showCustomizeQuickActions && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl w-full max-w-2xl shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Customize Quick Actions</h2>
              <button
                onClick={() => setShowCustomizeQuickActions(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5">
              <div className="grid grid-cols-2 gap-6">
                {/* Your Quick Actions */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-medium text-gray-800 dark:text-white">Your Quick Actions</h3>
                    <span className="text-sm text-gray-400 dark:text-gray-500">{quickActions.length}/8</span>
                  </div>
                  <div className="space-y-2">
                    {quickActions.map((action, index) => (
                      <div
                        key={action.id}
                        draggable
                        onDragStart={(e) => handleActionDragStart(e, index)}
                        onDragOver={(e) => handleActionDragOver(e, index)}
                        onDragLeave={handleActionDragLeave}
                        onDrop={(e) => handleActionDrop(e, index)}
                        onDragEnd={handleActionDragEnd}
                        className={cn(
                          'flex items-center gap-3 p-3 border rounded-lg transition-all cursor-move',
                          draggedActionIndex === index
                            ? 'opacity-50 border-[#5B50BD] dark:border-[#918AD3] bg-[#EDE9F9] dark:bg-[#231E51]'
                            : dragOverActionIndex === index
                            ? 'border-[#5B50BD] dark:border-[#918AD3] bg-[#EDE9F9]/50 dark:bg-[#231E51]/50'
                            : 'border-gray-200 dark:border-gray-700'
                        )}
                      >
                        <GripVertical className="w-4 h-4 text-gray-400 dark:text-gray-500" />
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center text-white"
                          style={{ backgroundColor: action.color }}
                        >
                          {quickActionIcons[action.icon] ? (
                            <span className="scale-75">{quickActionIcons[action.icon]}</span>
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </div>
                        <span className="flex-1 text-sm text-gray-800 dark:text-white">{action.label}</span>
                        <button
                          onClick={() => handleRemoveQuickAction(action.id)}
                          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    {quickActions.length === 0 && (
                      <p className="text-sm text-gray-400 dark:text-gray-500 p-3">No quick actions added</p>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
                    Drag to reorder. Changes apply to your dashboard only.
                  </p>
                </div>

                {/* Add Actions */}
                <div>
                  <h3 className="font-medium text-gray-800 dark:text-white mb-3">Add Actions</h3>

                  {/* Tabs */}
                  <div className="flex border border-gray-200 dark:border-gray-700 rounded-lg p-1 mb-4">
                    {['Pages', 'Library', 'Calculators'].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setAddActionsTab(tab.toLowerCase())}
                        className={cn(
                          'flex-1 py-1.5 text-sm rounded-md transition-colors',
                          addActionsTab === tab.toLowerCase()
                            ? 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white font-medium'
                            : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200'
                        )}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>

                  {/* Available Actions */}
                  <div className="space-y-2">
                    {availableActions.map((action) => (
                      <button
                        key={action.id}
                        onClick={() => handleAddQuickAction(action)}
                        disabled={isActionAdded(action.id)}
                        className={cn(
                          'flex items-center gap-3 p-3 border border-gray-200 dark:border-gray-700 rounded-lg w-full text-left transition-colors',
                          isActionAdded(action.id)
                            ? 'opacity-50 cursor-not-allowed'
                            : 'hover:border-[#5B50BD] dark:hover:border-[#918AD3] cursor-pointer'
                        )}
                      >
                        <div
                          className="w-8 h-8 rounded flex items-center justify-center text-white"
                          style={{ backgroundColor: action.color }}
                        >
                          {quickActionIcons[action.icon] ? (
                            <span className="scale-75">{quickActionIcons[action.icon]}</span>
                          ) : (
                            <Plus className="w-4 h-4" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-800 dark:text-white">{action.label}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{action.description}</p>
                        </div>
                        {isActionAdded(action.id) && (
                          <span className="text-xs text-[#5B50BD] dark:text-[#918AD3] font-medium">Added</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100 dark:border-gray-700">
              <Button variant="outline" onClick={() => setShowCustomizeQuickActions(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowCustomizeQuickActions(false)}>
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Task Modal */}
      {showAddTaskModal && selectedDate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => { setShowAddTaskModal(false); resetTaskForm(); }} />
          <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {editingTask ? 'Edit Task' : 'Add Task'}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{formatDateDisplay(selectedDate)}</p>
              </div>
              <button
                onClick={() => { setShowAddTaskModal(false); resetTaskForm(); }}
                className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Form */}
            <div className="p-5 space-y-4">
              {/* Title */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">
                  Title <span className="text-red-500">*</span>
                </label>
                <Input
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Enter task title..."
                  className="w-full"
                />
              </div>

              {/* Type */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Type</label>
                <div className="grid grid-cols-4 gap-2">
                  {(['meeting', 'task', 'reminder', 'deadline'] as CalendarTaskType[]).map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewTaskType(type)}
                      className={cn(
                        "py-2.5 px-2 rounded-lg border text-xs font-medium transition-all flex flex-col items-center gap-1.5",
                        newTaskType === type
                          ? "border-[#5B50BD] bg-[#5B50BD]/10 text-[#5B50BD]"
                          : "border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300 dark:hover:border-gray-500"
                      )}
                    >
                      {type === 'meeting' && <Video className="w-4 h-4" />}
                      {type === 'task' && <ListTodo className="w-4 h-4" />}
                      {type === 'reminder' && <Bell className="w-4 h-4" />}
                      {type === 'deadline' && <Flag className="w-4 h-4" />}
                      <span className="capitalize">{type}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Priority</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['low', 'medium', 'high'] as CalendarTaskPriority[]).map((priority) => (
                    <button
                      key={priority}
                      onClick={() => setNewTaskPriority(priority)}
                      className={cn(
                        "py-2 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2",
                        newTaskPriority === priority
                          ? priority === 'high'
                            ? "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600"
                            : priority === 'medium'
                            ? "border-amber-500 bg-amber-50 dark:bg-amber-900/20 text-amber-600"
                            : "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600"
                          : "border-gray-200 dark:border-gray-600 text-gray-500 hover:border-gray-300 dark:hover:border-gray-500"
                      )}
                    >
                      <span className={cn(
                        "w-2 h-2 rounded-full",
                        priority === 'high' ? "bg-red-500" : priority === 'medium' ? "bg-amber-500" : "bg-green-500"
                      )} />
                      <span className="capitalize">{priority}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Time */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Start Time</label>
                  <input
                    type="time"
                    value={newTaskTime}
                    onChange={(e) => setNewTaskTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">End Time</label>
                  <input
                    type="time"
                    value={newTaskEndTime}
                    onChange={(e) => setNewTaskEndTime(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                  />
                </div>
              </div>

              {/* Assignee */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Assignee</label>
                <Input
                  value={newTaskAssignee}
                  onChange={(e) => setNewTaskAssignee(e.target.value)}
                  placeholder="Who is responsible?"
                  className="w-full"
                />
              </div>

              {/* Link */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Link (optional)</label>
                <Input
                  value={newTaskLink}
                  onChange={(e) => setNewTaskLink(e.target.value)}
                  placeholder="https://..."
                  className="w-full"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5 block">Notes (optional)</label>
                <textarea
                  value={newTaskNotes}
                  onChange={(e) => setNewTaskNotes(e.target.value)}
                  placeholder="Add agenda, details, or notes..."
                  rows={3}
                  className="w-full rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-900 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#5B50BD] resize-none"
                />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-2 p-5 border-t border-gray-100 dark:border-gray-700">
              <Button variant="outline" onClick={() => { setShowAddTaskModal(false); resetTaskForm(); }}>
                Cancel
              </Button>
              <Button onClick={handleSaveTask} disabled={!newTaskTitle.trim()}>
                {editingTask ? 'Save Changes' : 'Add Task'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Selection Modal */}
      {showProjectsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowProjectsModal(false)} />
          <div className="relative w-full max-w-md rounded-xl bg-white dark:bg-gray-800 shadow-xl border border-gray-200 dark:border-gray-700 max-h-[80vh] flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-2">
                <Folder className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
                <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Select Projects</h2>
              </div>
              <button
                onClick={() => setShowProjectsModal(false)}
                className="rounded-lg p-1.5 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Search */}
            <div className="px-5 pt-4 pb-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  value={projectModalSearch}
                  onChange={(e) => setProjectModalSearch(e.target.value)}
                  placeholder="Search projects..."
                  className="pl-9 pr-4 py-2 text-sm"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Select which projects to display in your dashboard widget (max 6).
              </p>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-5 pb-5">
              {projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-3">
                    <Folder className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white mb-1">No projects yet</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Create projects to organize your proposals</p>
                  <Button
                    onClick={() => {
                      setShowProjectsModal(false);
                      setActiveSection('chat-projects');
                    }}
                    className="mt-4"
                    size="sm"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Create Project
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  {projects
                    .filter(p => !projectModalSearch || p.name.toLowerCase().includes(projectModalSearch.toLowerCase()))
                    .map((project, index) => {
                    const projectColors = ['#10b981', '#8b5cf6', '#ef4444', '#f59e0b', '#3b82f6'];
                    const isSelected = visibleProjectIds.includes(project.id);
                    const proposalCount = proposals.filter(
                      p => p.projectId === project.id || project.proposals.includes(p.id)
                    ).length;

                    return (
                      <label
                        key={project.id}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                          isSelected
                            ? "border-[#5B50BD] bg-[#5B50BD]/5 dark:bg-[#5B50BD]/10"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProjectVisibility(project.id)}
                          disabled={!isSelected && visibleProjectIds.length >= 6}
                          className="h-4 w-4 accent-[#5B50BD] rounded"
                        />
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: projectColors[index % projectColors.length] }}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm text-gray-800 dark:text-white truncate">
                            {project.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {proposalCount} proposals
                          </p>
                        </div>
                        {isSelected && (
                          <CheckCircle className="w-4 h-4 text-[#5B50BD] flex-shrink-0" />
                        )}
                      </label>
                    );
                  })}
                </div>
              )}

              {visibleProjectIds.length >= 6 && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 flex items-center gap-1">
                  <Info className="w-3 h-3" />
                  Maximum 6 projects can be displayed in the widget
                </p>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between p-5 border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => setVisibleProjectIds([])}
                className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 flex items-center gap-1"
              >
                <RotateCcw className="w-4 h-4" />
                Reset
              </button>
              <Button onClick={() => setShowProjectsModal(false)} size="sm">
                Done
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
