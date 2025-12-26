'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  Plus,
  Brain,
  Calculator,
  Library as LibraryIcon,
  FolderKanban,
  History,
  ChevronDown,
  ChevronRight,
  Settings,
  User,
  Menu,
  X,
  Moon,
  Sun,
  Bell,
  LogOut,
  Users,
  ClipboardCheck,
  Check,
  FileText,
  MessageSquare,
  UserCheck,
  HelpCircle,
  LayoutDashboard,
  Clock,
  Share2,
  Camera,
  Wrench,
  AlertTriangle,
  Target,
  Lightbulb,
  BellRing,
  Search,
  Archive,
  ArchiveRestore,
  Link,
} from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme';
import { useShallow } from 'zustand/react/shallow';
import { ProjectsList } from './ProjectsList';
import { ChatProjectsList } from './ChatProjectsList';
import { HistoryList } from './HistoryList';
import { Modal, Button, Input, Select, toast, BoltLogo } from '@/components/ui';

// Main navigation items (top-level, no grouping)
const mainNavItems = [
  { id: 'search-my', label: 'Proposals', icon: FileText },
  { id: 'meta-learnings', label: 'Meta Learnings', icon: Brain },
  { id: 'calculators', label: 'Calculators', icon: Calculator },
  { id: 'library', label: 'Library', icon: LibraryIcon },
];

// Mock history data for search
const mockMetaLearningChats = [
  { id: 'ml-1', title: 'Brand performance analysis', timestamp: '2025-12-24T10:00:00Z', type: 'meta-learning' as const },
  { id: 'ml-2', title: 'Competitor insights Q4', timestamp: '2025-12-23T15:30:00Z', type: 'meta-learning' as const },
  { id: 'ml-3', title: 'Market trends discussion', timestamp: '2025-12-22T09:00:00Z', type: 'meta-learning' as const },
];

const mockCalculatorChats = [
  { id: 'calc-1', title: 'Sample size calculation', timestamp: '2025-12-24T11:00:00Z', type: 'calculator' as const },
  { id: 'calc-2', title: 'Margin of error check', timestamp: '2025-12-21T14:00:00Z', type: 'calculator' as const },
];

const mockProjectChats = [
  { id: 'proj-1', title: 'Coca-Cola brand study', project: 'Coca-Cola 2024', timestamp: '2025-12-24T09:00:00Z', type: 'project' as const },
  { id: 'proj-2', title: 'Samsung mobile research', project: 'Samsung', timestamp: '2025-12-23T16:00:00Z', type: 'project' as const },
  { id: 'proj-3', title: 'Team sync - Q1 planning', project: 'U&A Studies', timestamp: '2025-12-22T11:00:00Z', type: 'project' as const },
];

interface SidebarProps {
  onNavigate?: (section: string) => void;
}

export function Sidebar({ onNavigate }: SidebarProps = {}) {
  // Selective subscriptions - only re-render when specific state changes
  const { sidebarOpen, sidebarCollapsed, sidebarWidth, activeSection } = useAppStore(
    useShallow((state) => ({
      sidebarOpen: state.sidebarOpen,
      sidebarCollapsed: state.sidebarCollapsed,
      sidebarWidth: state.sidebarWidth,
      activeSection: state.activeSection,
    }))
  );

  const { setSidebarOpen, setSidebarCollapsed, setSidebarWidth, setActiveSection, setLoggedIn, setShowSettingsModal } = useAppStore(
    useShallow((state) => ({
      setSidebarOpen: state.setSidebarOpen,
      setSidebarCollapsed: state.setSidebarCollapsed,
      setSidebarWidth: state.setSidebarWidth,
      setActiveSection: state.setActiveSection,
      setLoggedIn: state.setLoggedIn,
      setShowSettingsModal: state.setShowSettingsModal,
    }))
  );

  const currentUser = useAppStore((state) => state.currentUser);
  const setCurrentUser = useAppStore((state) => state.setCurrentUser);

  const notifications = useAppStore((state) => state.notifications);
  const { markNotificationRead, markAllNotificationsRead } = useAppStore(
    useShallow((state) => ({
      markNotificationRead: state.markNotificationRead,
      markAllNotificationsRead: state.markAllNotificationsRead,
    }))
  );

  const proposals = useAppStore((state) => state.proposals);
  const setCurrentProposal = useAppStore((state) => state.setCurrentProposal);
  const chatProjects = useAppStore((state) => state.chatProjects);
  const libraryItems = useAppStore((state) => state.libraryItems);
  const archivedHistoryItems = useAppStore((state) => state.archivedHistoryItems);
  const unarchiveHistoryItem = useAppStore((state) => state.unarchiveHistoryItem);
  const unarchiveChatProject = useAppStore((state) => state.unarchiveChatProject);


  // Create a Set of archived history item IDs for efficient lookup
  const archivedHistoryItemIds = new Set(archivedHistoryItems.map(item => item.id));

  // Use provided navigation handler or fall back to direct setActiveSection
  const navigateTo = onNavigate || setActiveSection;
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [expandedItems, setExpandedItems] = useState<string[]>(['projects', 'history']);
  const [expandedGroups, setExpandedGroups] = useState<string[]>(['projects']);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [globalSearchOpen, setGlobalSearchOpen] = useState(false);
  const [globalSearchQuery, setGlobalSearchQuery] = useState('');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [isResizing, setIsResizing] = useState(false);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [profileEditOpen, setProfileEditOpen] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editUsername, setEditUsername] = useState(currentUser.email.split('@')[0]);
  const [profilePhoto, setProfilePhoto] = useState<string | null>(currentUser.avatar || null);
  const sidebarRef = useRef<HTMLElement>(null);
  const profileDropdownRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle profile photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Invalid file type', 'Please select an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File too large', 'Maximum file size is 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePhoto(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle profile save
  const handleProfileSave = () => {
    setCurrentUser({
      ...currentUser,
      name: editName,
      email: `${editUsername}@boltinsight.com`,
      avatar: profilePhoto || undefined,
    });
    setProfileEditOpen(false);
    toast.success('Profile updated', 'Your changes have been saved');
  };

  // Close profile dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileDropdownRef.current && !profileDropdownRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard shortcut for global search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setGlobalSearchOpen(true);
      }
      if (e.key === 'Escape' && globalSearchOpen) {
        setGlobalSearchOpen(false);
        setGlobalSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [globalSearchOpen]);

  // Handle resize drag
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = e.clientX;
      setSidebarWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, setSidebarWidth]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    markAllNotificationsRead();
  };

  const handleNotificationClick = (notification: typeof notifications[0]) => {
    // Mark as read
    markNotificationRead(notification.id);

    // If it has a proposal, navigate to it
    if (notification.proposalId) {
      const proposal = proposals.find(p => p.id === notification.proposalId);
      if (proposal) {
        setCurrentProposal(proposal);
        setActiveSection('view-proposal');
        setNotificationsOpen(false);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval_request': return <Clock className="h-4 w-4 text-amber-500" />;
      case 'approval_approved': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'approval_rejected': return <X className="h-4 w-4 text-red-500" />;
      case 'approval_on_hold': return <Clock className="h-4 w-4 text-blue-500" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'share': return <Share2 className="h-4 w-4 text-[#5B50BD]" />;
      // Meta Learnings notification types
      case 'meta_warning': return <AlertTriangle className="h-4 w-4 text-amber-500" />;
      case 'meta_opportunity': return <Target className="h-4 w-4 text-green-500" />;
      case 'meta_insight': return <Lightbulb className="h-4 w-4 text-blue-500" />;
      case 'meta_reminder': return <BellRing className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleItemClick = (id: string, expandable: boolean) => {
    if (expandable) {
      toggleExpand(id);
    }
    setActiveSection(id);
  };

  const toggleGroup = (groupId: string) => {
    setExpandedGroups((prev) =>
      prev.includes(groupId) ? prev.filter((g) => g !== groupId) : [...prev, groupId]
    );
  };

  const renderExpandedContent = (itemId: string) => {
    if (itemId === 'projects') {
      return <ProjectsList />;
    }
    return null;
  };

  return (
    <>
      {/* Mobile Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="fixed left-4 top-4 z-50 rounded-lg bg-white p-2 shadow-lg lg:hidden"
      >
        {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={cn(
          'fixed left-0 top-0 z-40 h-screen transform border-r border-gray-200 bg-white transition-all ease-in-out',
          sidebarCollapsed ? 'w-16' : '',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0',
          !isResizing && 'duration-200'
        )}
        style={!sidebarCollapsed ? { width: sidebarWidth } : undefined}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-gray-200 px-4">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:block cursor-pointer"
              title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {!sidebarCollapsed && <BoltLogo className="h-9 w-auto" variant={isDarkMode ? 'dark' : 'light'} />}
              {sidebarCollapsed && <BoltLogo className="h-8 w-8" variant={isDarkMode ? 'dark' : 'light'} />}
            </button>
            <div className="lg:hidden">
              {!sidebarCollapsed && <BoltLogo className="h-9 w-auto" variant={isDarkMode ? 'dark' : 'light'} />}
              {sidebarCollapsed && <BoltLogo className="h-8 w-8" variant={isDarkMode ? 'dark' : 'light'} />}
            </div>
            {!sidebarCollapsed && (
              <button
                onClick={() => setNotificationsOpen(true)}
                className="relative flex items-center justify-center rounded-lg p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                title="Notifications"
              >
                <Bell className="h-4 w-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-0.5 right-0.5 h-2 w-2 rounded-full bg-red-500" />
                )}
              </button>
            )}
          </div>

          {/* Main Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {/* New Proposal Button */}
            <button
              onClick={() => setActiveSection('new-proposal')}
              className={cn(
                'mb-4 flex w-full items-center rounded-lg bg-[#5B50BD] text-white transition-colors hover:bg-[#4A41A0]',
                sidebarCollapsed ? 'justify-center p-3' : 'gap-3 px-4 py-3',
                activeSection === 'new-proposal' && 'ring-2 ring-[#918AD3]'
              )}
              title={sidebarCollapsed ? 'New Proposal' : undefined}
            >
              <Plus className="h-5 w-5" />
              {!sidebarCollapsed && <span className="font-medium">New Proposal</span>}
            </button>

            {/* Dashboard */}
            <button
              onClick={() => navigateTo('dashboard')}
              className={cn(
                'mb-1 flex w-full items-center rounded-lg text-xs transition-colors',
                sidebarCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2',
                activeSection === 'dashboard'
                  ? 'bg-[#EDE9F9] text-[#5B50BD] dark:bg-[#231E51] dark:text-[#918AD3]'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
              )}
              title={sidebarCollapsed ? 'Dashboard' : undefined}
            >
              <LayoutDashboard className="h-4 w-4" />
              {!sidebarCollapsed && <span className="flex-1 text-left font-medium">Dashboard</span>}
            </button>

            {/* Main Navigation Items (Proposals, Meta Learnings, Library) */}
            {mainNavItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <div key={item.id}>
                  <button
                    onClick={() => navigateTo(item.id)}
                    className={cn(
                      'mb-0.5 flex w-full items-center rounded-lg text-xs transition-colors',
                      sidebarCollapsed ? 'justify-center p-2' : 'gap-2.5 px-3 py-2',
                      activeSection === item.id
                        ? 'bg-[#EDE9F9] text-[#5B50BD] dark:bg-[#231E51] dark:text-[#918AD3]'
                        : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                    )}
                    title={sidebarCollapsed ? item.label : undefined}
                  >
                    <Icon className="h-4 w-4" />
                    {!sidebarCollapsed && <span className="flex-1 text-left font-medium">{item.label}</span>}
                  </button>

                  {/* Global Search Button - appears after Proposals */}
                  {index === 0 && (
                    <button
                      onClick={() => setGlobalSearchOpen(true)}
                      className={cn(
                        "mb-0.5 flex w-full items-center rounded-lg text-xs transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800",
                        sidebarCollapsed ? "justify-center p-2" : "gap-2.5 px-3 py-2"
                      )}
                      title={sidebarCollapsed ? "Search" : undefined}
                    >
                      <Search className="h-4 w-4" />
                      {!sidebarCollapsed && <span className="flex-1 text-left font-medium">Search</span>}
                    </button>
                  )}
                </div>
              );
            })}

            {/* Projects Section - ChatGPT style */}
            {sidebarCollapsed ? (
              <button
                onClick={() => navigateTo('chat-projects')}
                className={cn(
                  'flex w-full items-center justify-center rounded-lg text-xs transition-colors p-2',
                  activeSection === 'chat-projects' || activeSection.startsWith('project-')
                    ? 'bg-[#EDE9F9] text-[#5B50BD] dark:bg-[#231E51] dark:text-[#918AD3]'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
                title="Projects"
              >
                <FolderKanban className="h-4 w-4" />
              </button>
            ) : (
              <ChatProjectsList onNavigate={navigateTo} />
            )}

            {/* History Section - ChatGPT style */}
            {sidebarCollapsed ? (
              <button
                onClick={() => navigateTo('history')}
                className={cn(
                  'flex w-full items-center justify-center rounded-lg text-xs transition-colors p-2',
                  activeSection === 'history'
                    ? 'bg-[#EDE9F9] text-[#5B50BD] dark:bg-[#231E51] dark:text-[#918AD3]'
                    : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800'
                )}
                title="History"
              >
                <History className="h-4 w-4" />
              </button>
            ) : (
              <div className="group/sidebar-expando-section mb-2">
                {/* Section Header */}
                <button
                  onClick={() => toggleExpand('history')}
                  aria-expanded={expandedItems.includes('history')}
                  className="flex w-full items-center justify-start gap-0.5 px-4 py-1.5 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                >
                  <h2 className="text-xs font-semibold uppercase tracking-wider">History</h2>
                  <ChevronDown className={cn(
                    "h-3 w-3 transition-transform duration-200",
                    expandedItems.includes('history') ? "hidden group-hover/sidebar-expando-section:block" : "group-hover/sidebar-expando-section:block -rotate-90"
                  )} />
                </button>

                {expandedItems.includes('history') && (
                  <HistoryList onNavigate={navigateTo} />
                )}
              </div>
            )}

          </nav>

          {/* User Profile */}
          <div className="border-t border-gray-200 p-4">
            <div className={cn('flex items-center relative', sidebarCollapsed ? 'justify-center' : 'gap-3')} ref={profileDropdownRef}>
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex h-10 w-10 min-w-[2.5rem] min-h-[2.5rem] items-center justify-center rounded-full bg-[#C9A75C] text-white hover:opacity-90 transition-opacity overflow-hidden flex-shrink-0"
                title={sidebarCollapsed ? currentUser.name : undefined}
              >
                {currentUser.avatar ? (
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-sm font-semibold">
                    {currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </span>
                )}
              </button>
              {!sidebarCollapsed && (
                <>
                  <button
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex-1 text-left hover:opacity-80"
                  >
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{currentUser.name}</p>
                    <p className="text-xs text-[#5B50BD] dark:text-[#918AD3]">{currentUser.role}</p>
                  </button>
                  <button
                    onClick={() => {
                      setSettingsOpen(false);
                      setShowSettingsModal(true);
                    }}
                    className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 dark:hover:bg-gray-800"
                    title="Settings"
                  >
                    <Settings className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Profile Dropdown */}
              {profileDropdownOpen && (
                <div className={cn(
                  'absolute bottom-full mb-2 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50',
                  sidebarCollapsed ? 'left-0 w-56' : 'left-0 right-0'
                )}>
                  {/* Profile Edit Button */}
                  <button
                    onClick={() => {
                      setProfileEditOpen(true);
                      setProfileDropdownOpen(false);
                      setEditName(currentUser.name);
                      setEditUsername(currentUser.email.split('@')[0]);
                      setProfilePhoto(currentUser.avatar || null);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C9A75C] text-white text-xs font-semibold overflow-hidden">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-800 dark:text-white">{currentUser.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Edit profile</p>
                    </div>
                  </button>

                  <div className="my-2 h-px bg-gray-200 dark:bg-gray-700" />

                  {/* Sign Out Button */}
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      setLoggedIn(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-left hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-red-600 dark:text-red-400">Sign Out</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Log out of your account</p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Resize Handle */}
        {!sidebarCollapsed && (
          <div
            onMouseDown={handleMouseDown}
            className={cn(
              'absolute right-0 top-0 h-full w-1 cursor-col-resize transition-colors hover:bg-[#5B50BD]/50',
              isResizing && 'bg-[#5B50BD]'
            )}
          />
        )}
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Settings Modal */}
      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Settings"
        size="md"
      >
        <div className="space-y-6">
          {/* User Info */}
          <div className="rounded-lg bg-gray-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EDE9F9] text-[#5B50BD] dark:bg-[#231E51] dark:text-[#918AD3]">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{currentUser.name}</p>
                <p className="text-sm text-gray-500">{currentUser.email}</p>
                <p className="text-xs text-gray-400 capitalize">{currentUser.role}</p>
              </div>
            </div>
          </div>

          {/* My Analytics / Meta Learnings */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-900">My Analytics</h3>
            <button
              onClick={() => {
                setSettingsOpen(false);
                navigateTo('meta-learnings');
              }}
              className="flex w-full items-center gap-3 rounded-lg border p-3 hover:bg-gray-50 transition-colors"
            >
              <Brain className="h-4 w-4 text-[#5B50BD]" />
              <div className="flex-1 text-left">
                <span className="text-sm font-medium">Meta Learnings</span>
                <p className="text-xs text-gray-500">View your proposal analytics and performance</p>
              </div>
            </button>
          </div>

          {/* Appearance */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-900">Appearance</h3>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                {isDarkMode ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                <span className="text-sm">Dark Mode</span>
              </div>
              <button
                onClick={() => {
                  toggleDarkMode();
                  toast.success(isDarkMode ? 'Light mode enabled' : 'Dark mode enabled');
                }}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  isDarkMode ? 'bg-[#5B50BD]' : 'bg-gray-200'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow',
                    isDarkMode ? 'left-5' : 'left-0.5'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <h3 className="mb-3 text-sm font-medium text-gray-900">Notifications</h3>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div className="flex items-center gap-2">
                <Bell className="h-4 w-4" />
                <span className="text-sm">Email Notifications</span>
              </div>
              <button
                onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  notificationsEnabled ? 'bg-[#5B50BD]' : 'bg-gray-200'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow',
                    notificationsEnabled ? 'left-5' : 'left-0.5'
                  )}
                />
              </button>
            </div>
          </div>

          {/* Help */}
          <div>
            <button
              onClick={() => toast.info('Help center coming soon')}
              className="flex w-full items-center gap-3 rounded-lg border p-3 hover:bg-gray-50"
            >
              <HelpCircle className="h-4 w-4 text-gray-500" />
              <span className="text-sm">Help & Support</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-between border-t pt-4">
            <Button
              variant="outline"
              className="text-red-600 hover:bg-red-50"
              onClick={() => {
                setSettingsOpen(false);
                setLoggedIn(false);
              }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Sign Out
            </Button>
            <Button onClick={() => setSettingsOpen(false)}>
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* Notifications Modal */}
      <Modal
        isOpen={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
        title="Notifications"
        size="md"
      >
        <div className="space-y-4">
          {unreadCount > 0 && (
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" onClick={markAllRead}>
                <Check className="mr-1 h-4 w-4" />
                Mark all read
              </Button>
            </div>
          )}

          {notifications.length === 0 ? (
            <div className="py-8 text-center">
              <Bell className="mx-auto h-12 w-12 text-gray-300 mb-3" />
              <p className="text-gray-500">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {notifications.map((notification) => (
                <button
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-lg p-3 transition-colors border text-left',
                    notification.read
                      ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-700/50'
                      : 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700/50 hover:bg-purple-100 dark:hover:bg-purple-900/50'
                  )}
                >
                  <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-xs font-semibold mb-0.5',
                      notification.read
                        ? 'text-gray-500 dark:text-gray-400'
                        : 'text-[#5B50BD] dark:text-[#918AD3]'
                    )}>
                      {notification.title}
                    </p>
                    <p className={cn(
                      'text-sm leading-relaxed',
                      notification.read
                        ? 'text-gray-600 dark:text-gray-300'
                        : 'text-gray-900 dark:text-gray-100'
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400 mt-2 flex-shrink-0" />
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="pt-4 border-t">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => setNotificationsOpen(false)}
            >
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Profile Edit Modal */}
      {profileEditOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-sm shadow-xl">
            <div className="p-6">
              <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-6">Edit Profile</h2>

              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              {/* Profile Photo */}
              <div className="flex justify-center mb-6">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-[#C9A75C] flex items-center justify-center text-white text-3xl font-semibold ring-4 ring-[#5B50BD]/30 dark:ring-[#918AD3]/30 overflow-hidden">
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      editName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <button
                    className="absolute bottom-0 right-0 w-9 h-9 bg-white dark:bg-gray-700 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload photo"
                  >
                    <Camera className="w-4 h-4 text-gray-600 dark:text-gray-300" />
                  </button>
                  {profilePhoto && (
                    <button
                      className="absolute top-0 right-0 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-sm hover:bg-red-600 transition-colors"
                      onClick={() => setProfilePhoto(null)}
                      title="Remove photo"
                    >
                      <X className="w-3 h-3 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Display name</label>
                  <input
                    type="text"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3]"
                    placeholder="Full name"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1.5">Username</label>
                  <input
                    type="text"
                    value={editUsername}
                    onChange={(e) => setEditUsername(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-800 dark:text-white bg-white dark:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3]"
                    placeholder="username"
                  />
                </div>
              </div>

              <p className="text-xs text-gray-400 dark:text-gray-500 text-center mt-4">
                Your profile helps people recognize you. Your name and username are used throughout the app.
              </p>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 px-6 pb-6">
              <Button
                variant="outline"
                onClick={() => {
                  setProfileEditOpen(false);
                  setEditName(currentUser.name);
                  setEditUsername(currentUser.email.split('@')[0]);
                  setProfilePhoto(currentUser.avatar || null);
                }}
                className="rounded-full px-6"
              >
                Cancel
              </Button>
              <Button
                onClick={handleProfileSave}
                className="rounded-full px-6 bg-[#5B50BD] hover:bg-[#4A41A0] text-white"
              >
                Save
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Global Search Modal - ChatGPT style */}
      {globalSearchOpen && (
        <div
          className="fixed inset-0 bg-black/60 flex items-start justify-center z-50 pt-[15vh]"
          onClick={() => {
            setGlobalSearchOpen(false);
            setGlobalSearchQuery('');
          }}
        >
          <div
            className="w-full max-w-2xl bg-white dark:bg-[#1A163C] rounded-2xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Search Input */}
            <div className="relative border-b border-gray-200 dark:border-gray-700">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search proposals, projects, conversations..."
                value={globalSearchQuery}
                onChange={(e) => setGlobalSearchQuery(e.target.value)}
                autoFocus
                className="w-full pl-14 pr-12 py-5 text-lg bg-transparent text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none"
              />
              <button
                onClick={() => {
                  setGlobalSearchOpen(false);
                  setGlobalSearchQuery('');
                }}
                className="absolute right-5 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Search Results */}
            <div className="max-h-[50vh] overflow-y-auto">
              {globalSearchQuery ? (
                (() => {
                  const query = globalSearchQuery.toLowerCase();

                  // Filter proposals
                  const filteredProposals = proposals.filter(p =>
                    p.content.title?.toLowerCase().includes(query) ||
                    p.content.client?.toLowerCase().includes(query)
                  );

                  // Filter archived projects
                  const filteredArchivedProjects = chatProjects.filter(p =>
                    p.isArchived && (
                      p.name.toLowerCase().includes(query) ||
                      p.conversations.some(c => c.title.toLowerCase().includes(query))
                    )
                  );

                  // Filter library items
                  const filteredLibraryItems = libraryItems.filter(item =>
                    item.name?.toLowerCase().includes(query) ||
                    item.description?.toLowerCase().includes(query) ||
                    item.tags?.some(tag => tag.toLowerCase().includes(query))
                  );

                  // Filter history items
                  const filteredMetaLearnings = mockMetaLearningChats.filter(m =>
                    m.title.toLowerCase().includes(query)
                  );
                  const filteredCalculators = mockCalculatorChats.filter(c =>
                    c.title.toLowerCase().includes(query)
                  );
                  const filteredProjects = mockProjectChats.filter(p =>
                    p.title.toLowerCase().includes(query) || p.project.toLowerCase().includes(query)
                  );

                  const hasResults = filteredProposals.length > 0 ||
                    filteredArchivedProjects.length > 0 ||
                    filteredLibraryItems.length > 0 ||
                    filteredMetaLearnings.length > 0 ||
                    filteredCalculators.length > 0 ||
                    filteredProjects.length > 0;

                  return (
                    <div className="p-2">
                      {/* Proposals Section */}
                      {filteredProposals.length > 0 && (
                        <div className="mb-4">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Proposals</div>
                          {filteredProposals.slice(0, 5).map(proposal => {
                            const isArchived = archivedHistoryItemIds.has(proposal.id);
                            return (
                            <button
                              key={proposal.id}
                              onClick={() => {
                                setCurrentProposal(proposal);
                                navigateTo('view-proposal');
                                setGlobalSearchOpen(false);
                                setGlobalSearchQuery('');
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                              {isArchived ? (
                                <Archive className="h-4 w-4 text-gray-400" />
                              ) : (
                                <FileText className="h-4 w-4 text-gray-400" />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {proposal.content.title || 'Untitled Proposal'}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {proposal.content.client || 'No client'}{isArchived && ' • Archived'}
                                </p>
                              </div>
                              <span className={cn(
                                'px-2 py-0.5 rounded text-xs',
                                (proposal.status === 'client_approved' || proposal.status === 'manager_approved') ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' :
                                (proposal.status === 'pending_manager' || proposal.status === 'pending_client') ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' :
                                (proposal.status === 'client_rejected' || proposal.status === 'manager_rejected') ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400'
                              )}>
                                {proposal.status.replace(/_/g, ' ')}
                              </span>
                              {isArchived && (
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    unarchiveHistoryItem(proposal.id);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.stopPropagation();
                                      unarchiveHistoryItem(proposal.id);
                                    }
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-[#5B50BD] hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
                                  title="Unarchive"
                                >
                                  <ArchiveRestore className="h-4 w-4" />
                                </div>
                              )}
                            </button>
                          );})}
                        </div>
                      )}

                      {/* Archived Projects Section */}
                      {filteredArchivedProjects.length > 0 && (
                        <div className="mb-4">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Archived Projects</div>
                          {filteredArchivedProjects.slice(0, 5).map(project => (
                            <div
                              key={project.id}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                              <Archive className="h-4 w-4 text-gray-400" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {project.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {project.conversations.length} conversation{project.conversations.length !== 1 ? 's' : ''} • Archived
                                </p>
                              </div>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  unarchiveChatProject(project.id);
                                }}
                                className="p-1.5 text-gray-400 hover:text-[#5B50BD] hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                                title="Unarchive"
                              >
                                <ArchiveRestore className="h-4 w-4" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Library Section */}
                      {filteredLibraryItems.length > 0 && (
                        <div className="mb-4">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Library</div>
                          {filteredLibraryItems.slice(0, 5).map(item => (
                            <button
                              key={item.id}
                              onClick={() => {
                                if (item.url) {
                                  window.open(item.url, '_blank');
                                }
                                setGlobalSearchOpen(false);
                                setGlobalSearchQuery('');
                              }}
                              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                            >
                              <Link className="h-4 w-4 text-teal-500" />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                  {item.name}
                                </p>
                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                  {item.category}
                                </p>
                              </div>
                            </button>
                          ))}
                        </div>
                      )}

                      {/* History Section - Meta Learnings, Calculators, Projects */}
                      {(filteredMetaLearnings.length > 0 || filteredCalculators.length > 0 || filteredProjects.length > 0) && (
                        <div className="mb-4">
                          <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">History</div>

                          {/* Meta Learning chats */}
                          {filteredMetaLearnings.map(item => {
                            const isArchived = archivedHistoryItemIds.has(item.id);
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  navigateTo('meta-learnings');
                                  setGlobalSearchOpen(false);
                                  setGlobalSearchQuery('');
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                              >
                                {isArchived ? (
                                  <Archive className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Brain className="h-4 w-4 text-purple-500" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Meta Learning{isArchived && ' • Archived'}
                                  </p>
                                </div>
                                {isArchived && (
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    unarchiveHistoryItem(item.id);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.stopPropagation();
                                      unarchiveHistoryItem(item.id);
                                    }
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-[#5B50BD] hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
                                  title="Unarchive"
                                >
                                  <ArchiveRestore className="h-4 w-4" />
                                </div>
                              )}
                              </button>
                            );
                          })}

                          {/* Calculator chats */}
                          {filteredCalculators.map(item => {
                            const isArchived = archivedHistoryItemIds.has(item.id);
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  navigateTo('calculators');
                                  setGlobalSearchOpen(false);
                                  setGlobalSearchQuery('');
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                              >
                                {isArchived ? (
                                  <Archive className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <Calculator className="h-4 w-4 text-blue-500" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    Calculator{isArchived && ' • Archived'}
                                  </p>
                                </div>
                                {isArchived && (
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    unarchiveHistoryItem(item.id);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.stopPropagation();
                                      unarchiveHistoryItem(item.id);
                                    }
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-[#5B50BD] hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
                                  title="Unarchive"
                                >
                                  <ArchiveRestore className="h-4 w-4" />
                                </div>
                              )}
                              </button>
                            );
                          })}

                          {/* Project chats */}
                          {filteredProjects.map(item => {
                            const isArchived = archivedHistoryItemIds.has(item.id);
                            return (
                              <button
                                key={item.id}
                                onClick={() => {
                                  navigateTo('chat-projects');
                                  setGlobalSearchOpen(false);
                                  setGlobalSearchQuery('');
                                }}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                              >
                                {isArchived ? (
                                  <Archive className="h-4 w-4 text-gray-400" />
                                ) : (
                                  <FolderKanban className="h-4 w-4 text-teal-500" />
                                )}
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                                    {item.title}
                                  </p>
                                  <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {item.project}{isArchived && ' • Archived'}
                                  </p>
                                </div>
                                {isArchived && (
                                <div
                                  role="button"
                                  tabIndex={0}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    unarchiveHistoryItem(item.id);
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                      e.stopPropagation();
                                      unarchiveHistoryItem(item.id);
                                    }
                                  }}
                                  className="p-1.5 text-gray-400 hover:text-[#5B50BD] hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
                                  title="Unarchive"
                                >
                                  <ArchiveRestore className="h-4 w-4" />
                                </div>
                              )}
                              </button>
                            );
                          })}
                        </div>
                      )}

                      {/* Quick Actions Section */}
                      <div className="mb-4">
                        <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Quick Actions</div>
                        <button
                          onClick={() => {
                            setActiveSection('new-proposal');
                            setGlobalSearchOpen(false);
                            setGlobalSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <Plus className="h-4 w-4 text-[#5B50BD]" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Create new proposal</span>
                        </button>
                        <button
                          onClick={() => {
                            navigateTo('meta-learnings');
                            setGlobalSearchOpen(false);
                            setGlobalSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <Brain className="h-4 w-4 text-purple-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Open Meta Learnings</span>
                        </button>
                        <button
                          onClick={() => {
                            navigateTo('calculators');
                            setGlobalSearchOpen(false);
                            setGlobalSearchQuery('');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                        >
                          <Calculator className="h-4 w-4 text-blue-500" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">Open Calculators</span>
                        </button>
                      </div>

                      {/* No results message */}
                      {!hasResults && (
                        <div className="py-8 text-center">
                          <Search className="mx-auto h-10 w-10 text-gray-300 dark:text-gray-600 mb-3" />
                          <p className="text-gray-500 dark:text-gray-400">No results found for "{globalSearchQuery}"</p>
                          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">Try searching for something else</p>
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="p-2">
                  {/* Recent Items - combining proposals and history */}
                  <div className="mb-4">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Recent</div>

                    {/* Recent proposals */}
                    {proposals.slice(0, 2).map(proposal => (
                      <button
                        key={proposal.id}
                        onClick={() => {
                          setCurrentProposal(proposal);
                          navigateTo('view-proposal');
                          setGlobalSearchOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        <FileText className="h-4 w-4 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {proposal.content.title || 'Untitled Proposal'}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                            {proposal.content.client || 'No client'}
                          </p>
                        </div>
                      </button>
                    ))}

                    {/* Recent history items */}
                    {mockMetaLearningChats.slice(0, 1).map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigateTo('meta-learnings');
                          setGlobalSearchOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        <Brain className="h-4 w-4 text-purple-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Meta Learning
                          </p>
                        </div>
                      </button>
                    ))}

                    {mockCalculatorChats.slice(0, 1).map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigateTo('calculators');
                          setGlobalSearchOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        <Calculator className="h-4 w-4 text-blue-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Calculator
                          </p>
                        </div>
                      </button>
                    ))}

                    {mockProjectChats.slice(0, 1).map(item => (
                      <button
                        key={item.id}
                        onClick={() => {
                          navigateTo('chat-projects');
                          setGlobalSearchOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                      >
                        <FolderKanban className="h-4 w-4 text-teal-500" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {item.title}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            {item.project}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Suggestions */}
                  <div>
                    <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Suggestions</div>
                    <button
                      onClick={() => {
                        setActiveSection('new-proposal');
                        setGlobalSearchOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <Plus className="h-4 w-4 text-[#5B50BD]" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Create new proposal</span>
                    </button>
                    <button
                      onClick={() => {
                        navigateTo('library');
                        setGlobalSearchOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <LibraryIcon className="h-4 w-4 text-teal-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Browse library</span>
                    </button>
                    <button
                      onClick={() => {
                        navigateTo('chat-projects');
                        setGlobalSearchOpen(false);
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-left"
                    >
                      <FolderKanban className="h-4 w-4 text-orange-500" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">View projects</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </>
  );
}
