'use client';

import { useState } from 'react';
import {
  X,
  Plus,
  Search,
  Brain,
  Calculator,
  Library,
  FolderKanban,
  History,
  Settings,
  User,
  Moon,
  Sun,
  Bell,
  LogOut,
  Users,
  Percent,
  ClipboardCheck,
  ChevronRight,
  FileText,
  ChevronDown,
  MoreVertical,
  Copy,
  Trash2,
  FolderInput,
  BellRing,
  HelpCircle,
} from 'lucide-react';
import { formatDate, truncateText, getStatusColor } from '@/lib/utils';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme';
import { Modal, Button, Select, toast, Dropdown, DropdownItem, DropdownSeparator, MoveToProjectModal, Input, BoltLogo } from '@/components/ui';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const menuItems = [
  { id: 'new-proposal', label: 'New Proposal', icon: Plus, color: 'text-[#5B50BD]' },
  { id: 'search-my', label: 'Search My Proposals', icon: User },
  { id: 'search-all', label: 'Search All Proposals', icon: Users },
  { id: 'meta-learnings', label: 'Meta Learnings', icon: Brain },
  { id: 'divider-1', type: 'divider' },
  { id: 'moe-calculator', label: 'Margin of Error', icon: Percent },
  { id: 'demographics', label: 'Demographics & Quota', icon: Users },
  { id: 'feasibility', label: 'Feasibility Check', icon: ClipboardCheck },
  { id: 'divider-2', type: 'divider' },
  { id: 'library', label: 'Library', icon: Library },
];

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const { activeSection, setActiveSection, currentUser, projects, proposals, setCurrentProposal, setLoggedIn, deleteProposal, addProposal, addProject } = useAppStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [showProjects, setShowProjects] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<{ id: string; title: string } | null>(null);
  const [newProjectModalOpen, setNewProjectModalOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Get recent proposals for history
  const recentProposals = proposals
    .filter((p) => p.status !== 'deleted')
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    .slice(0, 10);

  const handleItemClick = (id: string) => {
    setActiveSection(id);
    onClose();
  };

  const handleProposalClick = (proposal: typeof proposals[0]) => {
    setCurrentProposal(proposal);
    setActiveSection('view-proposal');
    onClose();
  };

  const handleCopyProposal = (proposal: typeof proposals[0]) => {
    addProposal({
      ...proposal,
      status: 'draft',
      code: undefined,
      content: {
        ...proposal.content,
        title: `${proposal.content.title} (Copy)`,
      },
      author: currentUser,
      sentToClient: false,
      approvalHistory: [],
      comments: [],
      collaborators: [],
    });
    toast.success('Proposal duplicated');
  };

  const handleDeleteProposal = (proposalId: string) => {
    deleteProposal(proposalId);
    toast.success('Proposal deleted');
  };

  const handleMoveProposal = (proposal: typeof proposals[0]) => {
    setSelectedProposal({ id: proposal.id, title: proposal.content.title || 'Untitled' });
    setMoveModalOpen(true);
  };

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    addProject({
      name: newProjectName.trim(),
      description: newProjectDescription.trim() || undefined,
      proposals: [],
    });
    toast.success(`Project "${newProjectName}" created`);
    setNewProjectName('');
    setNewProjectDescription('');
    setNewProjectModalOpen(false);
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-[60] bg-black/50 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-[70] h-full w-[85%] max-w-[320px] transform bg-white dark:bg-gray-900 transition-transform duration-300 ease-out shadow-xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-full flex-col">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 dark:border-gray-800 px-4 py-4">
            <BoltLogo className="h-9 w-auto" variant={isDarkMode ? 'dark' : 'light'} />
            <button
              onClick={onClose}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto px-3 py-4">
            {menuItems.map((item) => {
              if (item.type === 'divider') {
                return <div key={item.id} className="my-3 h-px bg-gray-200 dark:bg-gray-800" />;
              }

              const Icon = item.icon!;
              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={cn(
                    'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left transition-colors mb-1',
                    activeSection === item.id
                      ? 'bg-[#EDE9F9] text-[#5B50BD] dark:bg-[#231E51] dark:text-[#918AD3]'
                      : 'text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-800'
                  )}
                >
                  <Icon className={cn('h-5 w-5', item.color)} />
                  <span className="font-medium">{item.label}</span>
                </button>
              );
            })}

            {/* Projects Section */}
            <div className="my-3 h-px bg-gray-200 dark:bg-gray-800" />

            <button
              onClick={() => setShowProjects(!showProjects)}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <FolderKanban className="h-5 w-5" />
                <span className="font-medium">Projects</span>
              </div>
              <ChevronDown
                className={cn(
                  'h-5 w-5 transition-transform',
                  !showProjects && '-rotate-90'
                )}
              />
            </button>

            {showProjects && (
              <div className="ml-4 mt-1 space-y-1">
                {[...projects]
                  .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                  .slice(0, 5)
                  .map((project) => (
                  <div
                    key={project.id}
                    className="group flex items-center gap-2"
                  >
                    <button
                      onClick={() => {
                        setActiveSection(`project-${project.id}`);
                        onClose();
                      }}
                      className={cn(
                        'flex flex-1 items-center gap-2 rounded-lg px-3 py-2 text-sm text-left',
                        activeSection === `project-${project.id}`
                          ? 'bg-[#EDE9F9] text-[#5B50BD] dark:bg-[#231E51] dark:text-[#918AD3]'
                          : 'text-gray-600 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800'
                      )}
                    >
                      <FolderKanban className="h-4 w-4" />
                      <span className="truncate">{project.name}</span>
                    </button>
                    <Dropdown
                      trigger={
                        <button className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      }
                      align="right"
                    >
                      <DropdownItem onClick={() => {
                        setActiveSection(`project-${project.id}`);
                        onClose();
                      }}>
                        <FolderKanban className="mr-2 h-4 w-4" />
                        Open
                      </DropdownItem>
                      <DropdownSeparator />
                      <DropdownItem variant="destructive" onClick={() => {}}>
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownItem>
                    </Dropdown>
                  </div>
                ))}
                {/* Create New Project Button */}
                <button
                  onClick={() => setNewProjectModalOpen(true)}
                  className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-left text-[#5B50BD] dark:text-[#918AD3] hover:bg-[#EDE9F9] dark:hover:bg-[#231E51]"
                >
                  <Plus className="h-4 w-4" />
                  <span>Create New Project</span>
                </button>
              </div>
            )}

            {/* History Section */}
            <button
              onClick={() => setShowHistory(!showHistory)}
              className="flex w-full items-center justify-between rounded-xl px-4 py-3 text-left text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <History className="h-5 w-5" />
                <span className="font-medium">History</span>
              </div>
              <ChevronDown
                className={cn(
                  'h-5 w-5 transition-transform',
                  !showHistory && '-rotate-90'
                )}
              />
            </button>

            {showHistory && (
              <div className="ml-4 mt-1 space-y-1 max-h-64 overflow-y-auto">
                {recentProposals.length === 0 ? (
                  <p className="py-4 text-center text-xs text-gray-400">No proposals yet</p>
                ) : (
                  recentProposals.map((proposal) => (
                    <div
                      key={proposal.id}
                      className="group flex items-start gap-2 rounded-lg px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      <button
                        onClick={() => handleProposalClick(proposal)}
                        className="flex flex-1 items-start gap-2 text-left min-w-0"
                      >
                        <FileText className="mt-0.5 h-4 w-4 flex-shrink-0 text-gray-400" />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-medium text-[#5B50BD] dark:text-[#918AD3]">
                              {proposal.code || 'Draft'}
                            </span>
                            <span className={cn(
                              'rounded px-1.5 py-0.5 text-[10px]',
                              getStatusColor(proposal.status)
                            )}>
                              {proposal.status.replace('_', ' ')}
                            </span>
                          </div>
                          <p className="truncate text-sm text-gray-700 dark:text-gray-300">
                            {truncateText(proposal.content.title || 'Untitled', 20)}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {formatDate(proposal.updatedAt)}
                          </p>
                        </div>
                      </button>
                      <Dropdown
                        trigger={
                          <button className="flex-shrink-0 rounded p-1 text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700">
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        }
                        align="right"
                      >
                        <DropdownItem onClick={() => handleCopyProposal(proposal)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Duplicate
                        </DropdownItem>
                        <DropdownItem onClick={() => handleMoveProposal(proposal)}>
                          <FolderInput className="mr-2 h-4 w-4" />
                          Move
                        </DropdownItem>
                        <DropdownSeparator />
                        <DropdownItem
                          variant="destructive"
                          onClick={() => handleDeleteProposal(proposal.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownItem>
                      </Dropdown>
                    </div>
                  ))
                )}
              </div>
            )}
          </nav>

          {/* Footer - User Profile */}
          <div className="border-t border-gray-200 dark:border-gray-800 p-4">
            {/* User Info */}
            <button
              onClick={() => {
                setSettingsOpen(true);
              }}
              className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left active:bg-gray-100 dark:active:bg-gray-800"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD] dark:text-[#918AD3]">
                <User className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-white">{currentUser.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
              </div>
              <Settings className="h-5 w-5 text-gray-400" />
            </button>
          </div>
        </div>
      </aside>

      {/* Settings Modal */}
      <Modal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Settings"
        size="md"
      >
        <div className="space-y-6">
          {/* User Info */}
          <div className="rounded-lg bg-gray-50 dark:bg-gray-800 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD] dark:text-[#918AD3]">
                <User className="h-6 w-6" />
              </div>
              <div>
                <p className="font-medium text-gray-900 dark:text-white">{currentUser.name}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 capitalize">{currentUser.role}</p>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div>
            <button
              onClick={() => {
                setNotificationsEnabled(!notificationsEnabled);
                toast.success(notificationsEnabled ? 'Notifications disabled' : 'Notifications enabled');
              }}
              className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center gap-3">
                <BellRing className="h-5 w-5 text-gray-500" />
                <span className="font-medium text-gray-900 dark:text-white">Notifications</span>
              </div>
              <div
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  notificationsEnabled ? 'bg-[#5B50BD]' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow',
                    notificationsEnabled ? 'left-5' : 'left-0.5'
                  )}
                />
              </div>
            </button>
          </div>

          {/* Theme */}
          <div>
            <button
              onClick={() => {
                toggleDarkMode();
                toast.success(isDarkMode ? 'Light mode enabled' : 'Dark mode enabled');
              }}
              className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <div className="flex items-center gap-3">
                {isDarkMode ? <Moon className="h-5 w-5 text-gray-500" /> : <Sun className="h-5 w-5 text-gray-500" />}
                <span className="font-medium text-gray-900 dark:text-white">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</span>
              </div>
              <div
                className={cn(
                  'relative h-6 w-11 rounded-full transition-colors',
                  isDarkMode ? 'bg-[#5B50BD]' : 'bg-gray-300'
                )}
              >
                <span
                  className={cn(
                    'absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform shadow',
                    isDarkMode ? 'left-5' : 'left-0.5'
                  )}
                />
              </div>
            </button>
          </div>

          {/* Help */}
          <div>
            <button
              onClick={() => toast.info('Help center coming soon')}
              className="flex w-full items-center gap-3 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <HelpCircle className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-900 dark:text-white">Help & Support</span>
            </button>
          </div>

          {/* Actions */}
          <div className="flex justify-between border-t dark:border-gray-700 pt-4">
            <Button
              variant="outline"
              className="text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              onClick={() => {
                setSettingsOpen(false);
                onClose();
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

      {/* Move to Project Modal */}
      {selectedProposal && (
        <MoveToProjectModal
          isOpen={moveModalOpen}
          onClose={() => {
            setMoveModalOpen(false);
            setSelectedProposal(null);
          }}
          proposalId={selectedProposal.id}
          proposalTitle={selectedProposal.title}
        />
      )}

      {/* Create New Project Modal */}
      <Modal
        isOpen={newProjectModalOpen}
        onClose={() => {
          setNewProjectModalOpen(false);
          setNewProjectName('');
          setNewProjectDescription('');
        }}
        title="Create New Project"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            placeholder="Project name"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            autoFocus
          />
          <textarea
            placeholder="Project description (optional)"
            value={newProjectDescription}
            onChange={(e) => setNewProjectDescription(e.target.value)}
            className="w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-white placeholder-gray-400 outline-none focus:border-[#5B50BD] focus:ring-2 focus:ring-[#5B50BD]/20 resize-none"
            rows={3}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => {
                setNewProjectModalOpen(false);
                setNewProjectName('');
                setNewProjectDescription('');
              }}
            >
              Cancel
            </Button>
            <Button
              className="flex-1"
              onClick={handleCreateProject}
              disabled={!newProjectName.trim()}
            >
              Create
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
