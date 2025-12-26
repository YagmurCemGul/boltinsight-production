'use client';

import { useMemo, useState } from 'react';
import {
  Users,
  FileText,
  CheckCircle,
  Sparkles,
  Search,
  Clock,
  ArrowRight,
  Activity,
  Eye,
  Trash2,
  MoreHorizontal,
  Shield,
  ChevronDown,
  Check,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, Button, toast } from '@/components/ui';
import { cn, formatDate, getStatusColor, getStatusLabel, truncateText } from '@/lib/utils';
import type { Proposal, User } from '@/types';

type TabId = 'overview' | 'user-activity' | 'all-proposals' | 'role-management';

interface Tab {
  id: TabId;
  label: string;
  icon: 'sparkle' | 'users' | 'document' | 'shield';
}

const tabs: Tab[] = [
  { id: 'overview', label: 'Overview', icon: 'sparkle' },
  { id: 'user-activity', label: 'User Activity', icon: 'users' },
  { id: 'all-proposals', label: 'All Proposals', icon: 'document' },
  { id: 'role-management', label: 'Role Management', icon: 'shield' },
];

// Role definitions with permissions
const roleDefinitions = {
  admin: {
    label: 'Admin',
    description: 'Full access to all features and settings',
    color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    permissions: ['create', 'edit', 'delete', 'approve', 'manage_users', 'manage_roles', 'view_all'],
  },
  manager: {
    label: 'Manager',
    description: 'Can approve proposals and manage team',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    permissions: ['create', 'edit', 'delete', 'approve', 'view_all'],
  },
  researcher: {
    label: 'Researcher',
    description: 'Can create and edit proposals',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    permissions: ['create', 'edit', 'delete'],
  },
  viewer: {
    label: 'Viewer',
    description: 'Can only view proposals',
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
    permissions: ['view'],
  },
} as const;

type Role = keyof typeof roleDefinitions;

// Tab Icon component
function TabIcon({ name, active }: { name: Tab['icon']; active: boolean }) {
  const iconClass = cn('w-4 h-4', active ? 'text-[#5B50BD] dark:text-[#918AD3]' : 'text-gray-400');

  switch (name) {
    case 'sparkle':
      return <Sparkles className={iconClass} />;
    case 'users':
      return <Users className={iconClass} />;
    case 'document':
      return <FileText className={iconClass} />;
    case 'shield':
      return <Shield className={iconClass} />;
    default:
      return null;
  }
}

// Role Dropdown component
interface RoleDropdownProps {
  currentRole: Role;
  onRoleChange: (role: Role) => void;
  disabled?: boolean;
}

function RoleDropdown({ currentRole, onRoleChange, disabled }: RoleDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
          roleDefinitions[currentRole].color,
          disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80 cursor-pointer'
        )}
      >
        {roleDefinitions[currentRole].label}
        {!disabled && <ChevronDown className="w-3 h-3" />}
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
            {(Object.keys(roleDefinitions) as Role[]).map((role) => (
              <button
                key={role}
                onClick={() => {
                  onRoleChange(role);
                  setIsOpen(false);
                }}
                className={cn(
                  'flex items-center justify-between w-full px-4 py-2.5 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors',
                  currentRole === role && 'bg-gray-50 dark:bg-gray-700'
                )}
              >
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">{roleDefinitions[role].label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{roleDefinitions[role].description}</p>
                </div>
                {currentRole === role && <Check className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3]" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Stat Card component
interface StatCardProps {
  label: string;
  value: number;
  icon: 'users' | 'document' | 'check';
  color: string;
  bgColor: string;
}

function StatCard({ label, value, icon, color, bgColor }: StatCardProps) {
  const icons = {
    users: <Users className={cn('w-5 h-5', color)} />,
    document: <FileText className={cn('w-5 h-5', color)} />,
    check: <CheckCircle className={cn('w-5 h-5', color)} />,
  };

  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', bgColor)}>
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

// User Row component
interface UserRowProps {
  user: User;
  proposalCount: number;
  isSelected: boolean;
  onClick: () => void;
}

function UserRow({ user, proposalCount, isSelected, onClick }: UserRowProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full p-3 rounded-lg text-left transition-colors',
        isSelected
          ? 'bg-[#EDE9F9] dark:bg-[#231E51] border border-[#5B50BD] dark:border-[#918AD3]'
          : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: user.avatar || '#5B50BD' }}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800 dark:text-white text-sm">{user.name}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">
              {proposalCount} proposals
            </p>
          </div>
        </div>
        <span className="px-2 py-1 bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD] dark:text-[#918AD3] text-xs rounded-full font-medium">
          {user.role}
        </span>
      </div>
    </button>
  );
}

// Proposal Table Row
interface ProposalTableRowProps {
  proposal: Proposal;
  onView: () => void;
  onDelete: () => void;
}

function ProposalTableRow({ proposal, onView, onDelete }: ProposalTableRowProps) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <tr className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
      <td className="py-3 px-5">
        <div>
          <p className="font-medium text-gray-800 dark:text-white text-sm">
            {truncateText(proposal.content.title || 'Untitled', 40)}
          </p>
          <p className="text-xs text-gray-400">{proposal.content.client || 'No client'}</p>
        </div>
      </td>
      <td className="py-3 px-5">
        <div className="flex items-center gap-2">
          <div
            className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
            style={{ backgroundColor: proposal.author.avatar || '#5B50BD' }}
          >
            {proposal.author.name.charAt(0).toUpperCase()}
          </div>
          <span className="text-sm text-gray-600 dark:text-gray-300">{proposal.author.name}</span>
        </div>
      </td>
      <td className="py-3 px-5">
        <span className={cn('text-xs px-2 py-1 rounded-full', getStatusColor(proposal.status))}>
          {getStatusLabel(proposal.status)}
        </span>
      </td>
      <td className="py-3 px-5">
        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
          <Clock className="w-3 h-3" />
          {formatDate(proposal.createdAt)}
        </div>
      </td>
      <td className="py-3 px-5">
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
          >
            <MoreHorizontal className="w-4 h-4 text-gray-400" />
          </button>
          {showMenu && (
            <div className="absolute right-0 top-8 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-10 py-1 min-w-[120px]">
              <button
                onClick={() => {
                  onView();
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
              <button
                onClick={() => {
                  onDelete();
                  setShowMenu(false);
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export function AdminDashboard() {
  const {
    proposals,
    currentUser,
    setActiveSection,
    setCurrentProposal,
    updateProposal,
  } = useAppStore();

  const [activeTab, setActiveTab] = useState<TabId>('overview');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userSearch, setUserSearch] = useState('');
  const [proposalSearch, setProposalSearch] = useState('');
  const [roleSearch, setRoleSearch] = useState('');
  const [userRoles, setUserRoles] = useState<Record<string, Role>>({});

  // Get all unique users from proposals
  const allUsers = useMemo(() => {
    const userMap = new Map<string, User>();
    userMap.set(currentUser.id, currentUser);

    proposals.forEach(p => {
      if (!userMap.has(p.author.id)) {
        userMap.set(p.author.id, p.author);
      }
      p.collaborators?.forEach(c => {
        if (!userMap.has(c.id)) {
          userMap.set(c.id, c);
        }
      });
    });

    return Array.from(userMap.values());
  }, [proposals, currentUser]);

  // Filter users by search
  const filteredUsers = useMemo(() => {
    if (!userSearch) return allUsers;
    const search = userSearch.toLowerCase();
    return allUsers.filter(
      u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
    );
  }, [allUsers, userSearch]);

  // Get proposals count per user
  const getProposalCount = (userId: string) => {
    return proposals.filter(p => p.author.id === userId && p.status !== 'deleted').length;
  };

  // Filter proposals by search
  const filteredProposals = useMemo(() => {
    let filtered = proposals.filter(p => p.status !== 'deleted');
    if (proposalSearch) {
      const search = proposalSearch.toLowerCase();
      filtered = filtered.filter(
        p =>
          (p.content.title?.toLowerCase().includes(search)) ||
          (p.content.client?.toLowerCase().includes(search)) ||
          p.author.name.toLowerCase().includes(search)
      );
    }
    return filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [proposals, proposalSearch]);

  // Calculate stats
  const stats = useMemo(() => {
    const activeProposals = proposals.filter(p => p.status !== 'deleted');
    return {
      totalUsers: allUsers.length,
      totalProposals: activeProposals.length,
      approvedProposals: activeProposals.filter(p => p.status === 'client_approved' || p.status === 'manager_approved').length,
    };
  }, [proposals, allUsers]);

  // Get recent activity
  const recentActivity = useMemo(() => {
    return proposals
      .filter(p => p.status !== 'deleted')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 5);
  }, [proposals]);

  // Get selected user's proposals
  const selectedUserProposals = useMemo(() => {
    if (!selectedUser) return [];
    return proposals
      .filter(p => p.author.id === selectedUser.id && p.status !== 'deleted')
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }, [proposals, selectedUser]);

  const handleViewProposal = (proposal: Proposal) => {
    setCurrentProposal(proposal);
    setActiveSection('view-proposal');
  };

  const handleDeleteProposal = (proposalId: string) => {
    updateProposal(proposalId, { status: 'deleted' });
  };

  // Get user's role (from local state or from user object)
  const getUserRole = (user: User): Role => {
    return userRoles[user.id] || (user.role as Role) || 'researcher';
  };

  // Handle role change
  const handleRoleChange = (userId: string, newRole: Role) => {
    setUserRoles(prev => ({ ...prev, [userId]: newRole }));
    const user = allUsers.find(u => u.id === userId);
    toast.success(
      'Rol güncellendi',
      `${user?.name || 'Kullanıcı'} artık ${roleDefinitions[newRole].label} rolüne sahip`
    );
  };

  // Filter users for role management
  const filteredRoleUsers = useMemo(() => {
    if (!roleSearch) return allUsers;
    const search = roleSearch.toLowerCase();
    return allUsers.filter(
      u => u.name.toLowerCase().includes(search) || u.email.toLowerCase().includes(search)
    );
  }, [allUsers, roleSearch]);

  // Role stats
  const roleStats = useMemo(() => {
    const stats: Record<Role, number> = { admin: 0, manager: 0, researcher: 0, viewer: 0 };
    allUsers.forEach(user => {
      const role = getUserRole(user);
      stats[role]++;
    });
    return stats;
  }, [allUsers, userRoles]);

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-6 h-6 rounded-full border-2 border-[#5B50BD] dark:border-[#918AD3]" />
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">Admin Dashboard</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-9">
            Monitor user activity and manage proposals
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-6">
          <nav className="flex gap-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2 pb-3 px-1 text-sm font-medium border-b-2 transition-colors',
                  activeTab === tab.id
                    ? 'border-[#5B50BD] dark:border-[#918AD3] text-[#5B50BD] dark:text-[#918AD3]'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                )}
              >
                <TabIcon name={tab.icon} active={activeTab === tab.id} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div>
            {/* Stats Cards */}
            <div className="grid grid-cols-3 gap-6 mb-8">
              <StatCard
                label="Total Users"
                value={stats.totalUsers}
                icon="users"
                color="text-blue-500"
                bgColor="bg-blue-50 dark:bg-blue-900/20"
              />
              <StatCard
                label="Total Proposals"
                value={stats.totalProposals}
                icon="document"
                color="text-[#5B50BD] dark:text-[#918AD3]"
                bgColor="bg-[#EDE9F9] dark:bg-[#231E51]"
              />
              <StatCard
                label="Approved Proposals"
                value={stats.approvedProposals}
                icon="check"
                color="text-green-500"
                bgColor="bg-green-50 dark:bg-green-900/20"
              />
            </div>

            {/* Recent Activity */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
                  <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Recent Activity</h2>
                </div>
                {recentActivity.length === 0 ? (
                  <div className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">
                    No recent activity
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentActivity.map((proposal) => (
                      <button
                        key={proposal.id}
                        onClick={() => handleViewProposal(proposal)}
                        className="flex items-center justify-between w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium"
                            style={{ backgroundColor: proposal.author.avatar || '#5B50BD' }}
                          >
                            {proposal.author.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800 dark:text-white text-sm">
                              {truncateText(proposal.content.title || 'Untitled', 35)}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              by {proposal.author.name} • {formatDate(proposal.updatedAt)}
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
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'user-activity' && (
          <div className="grid grid-cols-2 gap-6">
            {/* Users List */}
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Users</h2>
                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3]"
                  />
                </div>
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {filteredUsers.map((user) => (
                    <UserRow
                      key={user.id}
                      user={user}
                      proposalCount={getProposalCount(user.id)}
                      isSelected={selectedUser?.id === user.id}
                      onClick={() => setSelectedUser(user)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Activity Panel */}
            <Card>
              <CardContent className="p-5">
                {selectedUser ? (
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-medium"
                        style={{ backgroundColor: selectedUser.avatar || '#5B50BD' }}
                      >
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-800 dark:text-white">{selectedUser.name}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Role: <span className="text-[#5B50BD] dark:text-[#918AD3] font-medium">{selectedUser.role}</span>
                      </p>
                    </div>

                    <h4 className="font-medium text-gray-800 dark:text-white mb-3">
                      Proposals ({selectedUserProposals.length})
                    </h4>

                    {selectedUserProposals.length === 0 ? (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No proposals</p>
                    ) : (
                      <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {selectedUserProposals.map((proposal) => (
                          <button
                            key={proposal.id}
                            onClick={() => handleViewProposal(proposal)}
                            className="flex items-center justify-between w-full p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors text-left"
                          >
                            <div>
                              <p className="font-medium text-gray-800 dark:text-white text-sm">
                                {truncateText(proposal.content.title || 'Untitled', 30)}
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                {formatDate(proposal.createdAt)}
                              </p>
                            </div>
                            <span className={cn('text-xs px-2 py-0.5 rounded', getStatusColor(proposal.status))}>
                              {getStatusLabel(proposal.status)}
                            </span>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full min-h-[300px]">
                    <p className="text-sm text-gray-400 dark:text-gray-500">Select a user to view their activity</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'all-proposals' && (
          <Card>
            <CardContent className="p-0">
              <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
                <h2 className="font-semibold text-gray-800 dark:text-white">
                  All Proposals ({filteredProposals.length})
                </h2>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={proposalSearch}
                    onChange={(e) => setProposalSearch(e.target.value)}
                    placeholder="Search proposals..."
                    className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3] w-64"
                  />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-800">
                    <tr>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Title
                      </th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Owner
                      </th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Status
                      </th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Created
                      </th>
                      <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProposals.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                          No proposals found
                        </td>
                      </tr>
                    ) : (
                      filteredProposals.map((proposal) => (
                        <ProposalTableRow
                          key={proposal.id}
                          proposal={proposal}
                          onView={() => handleViewProposal(proposal)}
                          onDelete={() => handleDeleteProposal(proposal.id)}
                        />
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'role-management' && (
          <div className="space-y-6">
            {/* Role Stats Cards */}
            <div className="grid grid-cols-4 gap-4">
              {(Object.keys(roleDefinitions) as Role[]).map((role) => (
                <Card key={role}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-gray-800 dark:text-white">{roleStats[role]}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{roleDefinitions[role].label}</p>
                      </div>
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', roleDefinitions[role].color.replace('text-', 'bg-').split(' ')[0])}>
                        <Shield className={cn('w-5 h-5', roleDefinitions[role].color.split(' ')[1])} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Role Permissions Reference */}
            <Card>
              <CardContent className="p-5">
                <h2 className="font-semibold text-gray-800 dark:text-white mb-4">Rol İzinleri</h2>
                <div className="grid grid-cols-4 gap-4">
                  {(Object.keys(roleDefinitions) as Role[]).map((role) => (
                    <div key={role} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={cn('px-2 py-1 rounded text-xs font-medium', roleDefinitions[role].color)}>
                          {roleDefinitions[role].label}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">{roleDefinitions[role].description}</p>
                      <div className="space-y-1">
                        {roleDefinitions[role].permissions.map((perm) => (
                          <div key={perm} className="flex items-center gap-1.5 text-xs text-gray-600 dark:text-gray-300">
                            <Check className="w-3 h-3 text-green-500" />
                            <span className="capitalize">{perm.replace('_', ' ')}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* User Role Management */}
            <Card>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-semibold text-gray-800 dark:text-white">Kullanıcı Rol Yönetimi</h2>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={roleSearch}
                      onChange={(e) => setRoleSearch(e.target.value)}
                      placeholder="Kullanıcı ara..."
                      className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD] dark:focus:ring-[#918AD3] w-64"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Kullanıcı
                        </th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Email
                        </th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Bölge
                        </th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Teklif Sayısı
                        </th>
                        <th className="text-left py-3 px-5 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">
                          Rol
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRoleUsers.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="py-12 text-center text-sm text-gray-500 dark:text-gray-400">
                            Kullanıcı bulunamadı
                          </td>
                        </tr>
                      ) : (
                        filteredRoleUsers.map((user) => (
                          <tr key={user.id} className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800">
                            <td className="py-3 px-5">
                              <div className="flex items-center gap-3">
                                <div
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium overflow-hidden"
                                  style={{ backgroundColor: '#C9A75C' }}
                                >
                                  {user.avatar ? (
                                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                                  ) : (
                                    user.name.charAt(0).toUpperCase()
                                  )}
                                </div>
                                <span className="font-medium text-gray-800 dark:text-white text-sm">{user.name}</span>
                              </div>
                            </td>
                            <td className="py-3 px-5 text-sm text-gray-600 dark:text-gray-300">
                              {user.email}
                            </td>
                            <td className="py-3 px-5 text-sm text-gray-600 dark:text-gray-300">
                              {user.region || '-'}
                            </td>
                            <td className="py-3 px-5 text-sm text-gray-600 dark:text-gray-300">
                              {getProposalCount(user.id)}
                            </td>
                            <td className="py-3 px-5">
                              <RoleDropdown
                                currentRole={getUserRole(user)}
                                onRoleChange={(newRole) => handleRoleChange(user.id, newRole)}
                                disabled={user.id === currentUser.id}
                              />
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
