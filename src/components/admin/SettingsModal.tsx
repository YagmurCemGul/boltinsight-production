'use client';

import { useState, useEffect } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Bell,
  Palette,
  Plug,
  Database,
  Shield,
  User,
  Users,
  Key,
  FileText,
  Activity,
  ChevronDown,
  Sun,
  Moon,
  Monitor,
  MessageSquare,
  FileEdit,
  Check,
  Eye,
  EyeOff,
  Lock,
  Trash2,
  Download,
  LogOut,
  Plus,
  Search,
  BarChart3,
  Clock,
  Zap,
  Globe,
  Server,
  Code,
  ExternalLink,
  ChevronRight,
  CheckCircle,
  Copy,
  Archive,
  ArchiveRestore,
  Brain,
  Calculator,
  FolderKanban,
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme';
import { cn } from '@/lib/utils';

type TabId = 'general' | 'notifications' | 'personalization' | 'integrations' | 'data-controls' | 'security' | 'account' | 'admin' | 'developer' | 'system';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
  adminOnly?: boolean;
}

const tabs: Tab[] = [
  { id: 'general', label: 'General', icon: <SettingsIcon className="w-5 h-5" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  { id: 'personalization', label: 'Personalization', icon: <Palette className="w-5 h-5" /> },
  { id: 'integrations', label: 'Integrations', icon: <Plug className="w-5 h-5" /> },
  { id: 'data-controls', label: 'Data Controls', icon: <Database className="w-5 h-5" /> },
  { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
  { id: 'account', label: 'Account', icon: <User className="w-5 h-5" /> },
  { id: 'admin', label: 'Admin', icon: <Users className="w-5 h-5" />, adminOnly: true },
  { id: 'developer', label: 'Developer', icon: <Code className="w-5 h-5" />, adminOnly: true },
  { id: 'system', label: 'System', icon: <Server className="w-5 h-5" />, adminOnly: true },
];

// Toggle Switch Component
function ToggleSwitch({ checked, onChange, disabled }: { checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => !disabled && onChange(!checked)}
      disabled={disabled}
      className={cn(
        'relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#5B50BD] focus:ring-offset-2',
        checked ? 'bg-[#5B50BD]' : 'bg-gray-200 dark:bg-gray-600',
        disabled && 'opacity-50 cursor-not-allowed'
      )}
    >
      <span
        className={cn(
          'pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-4' : 'translate-x-0'
        )}
      />
    </button>
  );
}

// Dropdown Component
function Dropdown({ value, options, onChange }: { value: string; options: { value: string; label: string; icon?: React.ReactNode }[]; onChange: (value: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedOption = options.find((o) => o.value === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="inline-flex items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        {selectedOption?.icon}
        <span>{selectedOption?.label}</span>
        <ChevronDown className="w-4 h-4 text-gray-400" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-1 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg overflow-hidden z-50">
            {options.map((option) => (
              <button
                key={option.value}
                onClick={() => {
                  onChange(option.value);
                  setIsOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors',
                  value === option.value
                    ? 'bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD] dark:text-[#918AD3]'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                )}
              >
                {option.icon}
                <span className="flex-1">{option.label}</span>
                {value === option.value && <Check className="w-4 h-4" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Setting Row Component
function SettingRow({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex min-h-[60px] items-center border-b border-gray-200 dark:border-gray-700 py-3 last:border-b-0">
      <div className="flex-1">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-900 dark:text-white">{label}</div>
          {children}
        </div>
        {description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 pr-12">{description}</p>
        )}
      </div>
    </div>
  );
}

// Compact Stat Row Component
function StatRow({ icon, label, value, change, changeType }: { icon: React.ReactNode; label: string; value: string; change?: string; changeType?: 'up' | 'down' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-b-0">
      <div className="flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-[#EDE9F9] dark:bg-[#231E51] flex items-center justify-center text-[#5B50BD] dark:text-[#918AD3]">
          {icon}
        </div>
        <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      </div>
      <div className="flex items-center gap-2">
        <span className="text-sm font-semibold text-gray-900 dark:text-white">{value}</span>
        {change && (
          <span className={cn('text-xs', changeType === 'up' ? 'text-green-500' : 'text-red-500')}>
            {changeType === 'up' ? '+' : '-'}{change}
          </span>
        )}
      </div>
    </div>
  );
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { currentUser, setCurrentUser, defaultEditorMode, setDefaultEditorMode, showAdminButton, setShowAdminButton, showHelpButton, setShowHelpButton, setLoggedIn, setActiveSection, chatProjects, unarchiveChatProject, deleteChatProject, archivedHistoryItems, unarchiveHistoryItem } = useAppStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [expandedQuickAction, setExpandedQuickAction] = useState<string | null>(null);
  const [showNewKeyModal, setShowNewKeyModal] = useState(false);
  const [adminModal, setAdminModal] = useState<'users' | 'roles' | 'examples' | 'analytics' | null>(null);
  const [newKeyName, setNewKeyName] = useState('');
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [visibleKeys, setVisibleKeys] = useState<Set<string>>(new Set());

  // Admin Dashboard state
  const [userSearch, setUserSearch] = useState('');
  const [showAddUserForm, setShowAddUserForm] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('researcher');
  const [users, setUsers] = useState([
    { id: '1', name: 'John Doe', email: 'john.doe@company.com', role: 'admin' },
    { id: '2', name: 'Jane Smith', email: 'jane.smith@company.com', role: 'manager' },
    { id: '3', name: 'Mike Wilson', email: 'mike.wilson@company.com', role: 'researcher' },
    { id: '4', name: 'Sarah Johnson', email: 'sarah.johnson@company.com', role: 'researcher' },
    { id: '5', name: 'Alex Brown', email: 'alex.brown@company.com', role: 'researcher' },
  ]);

  const [roleSearch, setRoleSearch] = useState('');
  const [showAddRoleForm, setShowAddRoleForm] = useState(false);
  const [newRoleName, setNewRoleName] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState('');
  const [roles, setRoles] = useState([
    { id: '1', name: 'Admin', count: 3, color: 'bg-red-100 text-red-600', permissions: 'Full access' },
    { id: '2', name: 'Manager', count: 12, color: 'bg-blue-100 text-blue-600', permissions: 'Approve, Edit, View' },
    { id: '3', name: 'Researcher', count: 45, color: 'bg-green-100 text-green-600', permissions: 'Create, Edit, View' },
    { id: '4', name: 'Viewer', count: 96, color: 'bg-gray-100 text-gray-600', permissions: 'View only' },
  ]);

  const [templateSearch, setTemplateSearch] = useState('');
  const [showAddTemplateForm, setShowAddTemplateForm] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [newTemplateDescription, setNewTemplateDescription] = useState('');
  const [newTemplateCategory, setNewTemplateCategory] = useState('Research');
  const [newTemplateStatus, setNewTemplateStatus] = useState('Active');
  const [templates, setTemplates] = useState([
    { id: '1', name: 'Brand Tracking', status: 'Active', description: 'Track brand health and awareness metrics over time', category: 'Brand' },
    { id: '2', name: 'Concept Test', status: 'Active', description: 'Evaluate new product concepts before launch', category: 'Product' },
    { id: '3', name: 'U&A Study', status: 'Active', description: 'Usage and attitudes research methodology', category: 'Research' },
    { id: '4', name: 'Ad Testing', status: 'Active', description: 'Test advertising effectiveness and recall', category: 'Advertising' },
    { id: '5', name: 'Price Sensitivity', status: 'Active', description: 'Measure price elasticity and willingness to pay', category: 'Pricing' },
    { id: '6', name: 'Customer Journey', status: 'Active', description: 'Map the customer experience touchpoints', category: 'CX' },
    { id: '7', name: 'NPS Survey', status: 'Active', description: 'Net Promoter Score measurement template', category: 'CX' },
    { id: '8', name: 'Market Sizing', status: 'Inactive', description: 'Estimate total addressable market size', category: 'Strategy' },
  ]);

  const [analyticsExporting, setAnalyticsExporting] = useState(false);
  const [showFullAnalytics, setShowFullAnalytics] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);

  // Get archived projects
  const archivedProjects = chatProjects.filter(p => p.isArchived);

  // Edit state for users
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserName, setEditUserName] = useState('');
  const [editUserEmail, setEditUserEmail] = useState('');
  const [editUserRole, setEditUserRole] = useState('');

  // Edit state for roles
  const [editingRoleId, setEditingRoleId] = useState<string | null>(null);
  const [editRoleName, setEditRoleName] = useState('');
  const [editRolePermissions, setEditRolePermissions] = useState('');

  // Edit state for templates
  const [editingTemplateId, setEditingTemplateId] = useState<string | null>(null);
  const [editTemplateName, setEditTemplateName] = useState('');
  const [editTemplateDescription, setEditTemplateDescription] = useState('');
  const [editTemplateCategory, setEditTemplateCategory] = useState('');
  const [editTemplateStatus, setEditTemplateStatus] = useState('');

  // Mock API keys data
  const [apiKeys, setApiKeys] = useState([
    { id: 'key-1', name: 'Production Key', key: 'sk-prod-abc123def456ghi789jkl012mno345pqr678', suffix: '...4f8a', status: 'active' as const },
    { id: 'key-2', name: 'Development Key', key: 'sk-dev-xyz987uvw654tsr321qpo098nml765kji432', suffix: '...9c2b', status: 'active' as const },
  ]);

  // Toggle key visibility
  const toggleKeyVisibility = (keyId: string) => {
    setVisibleKeys(prev => {
      const newSet = new Set(prev);
      if (newSet.has(keyId)) {
        newSet.delete(keyId);
      } else {
        newSet.add(keyId);
      }
      return newSet;
    });
  };

  // Generate new API key
  const generateNewKey = () => {
    if (!newKeyName.trim()) return;
    const randomKey = `sk-${newKeyName.toLowerCase().replace(/\s/g, '-')}-${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
    const newKey = {
      id: `key-${Date.now()}`,
      name: newKeyName,
      key: randomKey,
      suffix: `...${randomKey.slice(-4)}`,
      status: 'active' as const,
    };
    setApiKeys(prev => [...prev, newKey]);
    setGeneratedKey(randomKey);
  };

  // Settings state
  const [theme, setTheme] = useState<'system' | 'light' | 'dark'>(isDarkMode ? 'dark' : 'light');
  const [language, setLanguage] = useState('auto');
  const [accentColor, setAccentColor] = useState('default');

  // Notification settings
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [proposalUpdates, setProposalUpdates] = useState(true);
  const [teamActivity, setTeamActivity] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);
  const [browserNotifications, setBrowserNotifications] = useState(false);

  // Security
  const [showPassword, setShowPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);

  // Data controls
  const [saveHistory, setSaveHistory] = useState(true);
  const [shareUsageData, setShareUsageData] = useState(false);

  // System settings
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [cacheEnabled, setCacheEnabled] = useState(true);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  // Account edit mode
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState(currentUser.name);
  const [editEmail, setEditEmail] = useState(currentUser.email);

  // Detect and apply system theme preference
  useEffect(() => {
    if (theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = (e: MediaQueryListEvent | MediaQueryList) => {
        const shouldBeDark = e.matches;
        if (shouldBeDark !== isDarkMode) {
          toggleDarkMode();
        }
      };

      // Apply initial system preference
      handleChange(mediaQuery);

      // Listen for system preference changes
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    }
  }, [theme, isDarkMode, toggleDarkMode]);

  if (!isOpen) return null;

  const handleThemeChange = (value: string) => {
    setTheme(value as 'system' | 'light' | 'dark');
    if (value === 'system') {
      // Apply system preference immediately
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark !== isDarkMode) {
        toggleDarkMode();
      }
    } else if (value === 'dark' && !isDarkMode) {
      toggleDarkMode();
    } else if (value === 'light' && isDarkMode) {
      toggleDarkMode();
    }
  };

  const themeOptions = [
    { value: 'system', label: 'System', icon: <Monitor className="w-4 h-4" /> },
    { value: 'light', label: 'Light', icon: <Sun className="w-4 h-4" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="w-4 h-4" /> },
  ];

  const languageOptions = [
    { value: 'auto', label: 'Auto-detect' },
    { value: 'en', label: 'English' },
    { value: 'tr', label: 'Türkçe' },
    { value: 'de', label: 'Deutsch' },
    { value: 'fr', label: 'Français' },
  ];

  const accentOptions = [
    { value: 'default', label: 'Default', icon: <div className="w-3 h-3 rounded-full bg-[#5B50BD]" /> },
    { value: 'blue', label: 'Blue', icon: <div className="w-3 h-3 rounded-full bg-blue-500" /> },
    { value: 'green', label: 'Green', icon: <div className="w-3 h-3 rounded-full bg-green-500" /> },
    { value: 'orange', label: 'Orange', icon: <div className="w-3 h-3 rounded-full bg-orange-500" /> },
  ];

  const editorOptions = [
    { value: 'chat', label: 'Chat Mode', icon: <MessageSquare className="w-4 h-4" /> },
    { value: 'editor', label: 'Document Editor', icon: <FileEdit className="w-4 h-4" /> },
  ];

  // Filter tabs based on user role
  const visibleTabs = tabs.filter(tab => !tab.adminOnly || currentUser.role === 'admin');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <section className="mb-4">
            <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-normal text-gray-900 dark:text-white">General</h3>
            </div>

            <SettingRow label="Appearance">
              <Dropdown value={theme} options={themeOptions} onChange={handleThemeChange} />
            </SettingRow>

            <SettingRow label="Accent Color">
              <Dropdown value={accentColor} options={accentOptions} onChange={setAccentColor} />
            </SettingRow>

            <SettingRow label="Language">
              <Dropdown value={language} options={languageOptions} onChange={setLanguage} />
            </SettingRow>

            <SettingRow label="Show Help Button" description="Display the help button (?) at the bottom right corner. Right-click to hide.">
              <ToggleSwitch checked={showHelpButton} onChange={setShowHelpButton} />
            </SettingRow>
          </section>
        );

      case 'notifications':
        return (
          <section className="mb-4">
            <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-normal text-gray-900 dark:text-white">Notifications</h3>
            </div>

            <SettingRow label="Email Notifications" description="Receive notifications via email">
              <ToggleSwitch checked={emailNotifications} onChange={setEmailNotifications} />
            </SettingRow>

            <SettingRow label="Browser Notifications" description="Show desktop notifications in your browser">
              <ToggleSwitch checked={browserNotifications} onChange={setBrowserNotifications} />
            </SettingRow>

            <SettingRow label="Proposal Updates" description="Get notified when proposals are updated or reviewed">
              <ToggleSwitch checked={proposalUpdates} onChange={setProposalUpdates} />
            </SettingRow>

            <SettingRow label="Team Activity" description="Notifications about team member actions and mentions">
              <ToggleSwitch checked={teamActivity} onChange={setTeamActivity} />
            </SettingRow>

            <SettingRow label="Weekly Digest" description="Receive a weekly summary of your proposal activity">
              <ToggleSwitch checked={weeklyDigest} onChange={setWeeklyDigest} />
            </SettingRow>
          </section>
        );

      case 'personalization':
        return (
          <section className="mb-4">
            <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-normal text-gray-900 dark:text-white">Personalization</h3>
            </div>

            <SettingRow label="Default Editor Mode" description="Choose which editor mode opens by default when creating new proposals">
              <Dropdown value={defaultEditorMode} options={editorOptions} onChange={(v) => setDefaultEditorMode(v as 'chat' | 'editor')} />
            </SettingRow>

            <div className="py-4">
              <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">Editor Mode Preview</p>
              <div className="grid grid-cols-2 gap-3">
                {editorOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDefaultEditorMode(option.value as 'chat' | 'editor')}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all',
                      defaultEditorMode === option.value
                        ? 'border-[#5B50BD] bg-[#EDE9F9] dark:bg-[#231E51]'
                        : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                    )}
                  >
                    <div className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center',
                      defaultEditorMode === option.value
                        ? 'bg-[#5B50BD] text-white'
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                    )}>
                      {option.icon}
                    </div>
                    <span className={cn(
                      'text-sm font-medium',
                      defaultEditorMode === option.value ? 'text-[#5B50BD] dark:text-[#918AD3]' : 'text-gray-600 dark:text-gray-400'
                    )}>{option.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        );

      case 'integrations':
        return (
          <section className="mb-4">
            <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-normal text-gray-900 dark:text-white">Integrations</h3>
            </div>

            <div className="py-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mx-auto mb-4">
                <Plug className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">No integrations connected</p>
              <p className="text-sm text-gray-400 dark:text-gray-500">Connect third-party apps to enhance your workflow</p>
              <button className="mt-4 px-4 py-2 bg-[#5B50BD] text-white rounded-lg text-sm font-medium hover:bg-[#4A41A0] transition-colors">
                Browse Integrations
              </button>
            </div>
          </section>
        );

      case 'data-controls':
        return (
          <section className="mb-4">
            <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-normal text-gray-900 dark:text-white">Data Controls</h3>
            </div>

            <SettingRow label="Save Proposal History" description="Keep a history of your proposal edits and versions">
              <ToggleSwitch checked={saveHistory} onChange={setSaveHistory} />
            </SettingRow>

            <SettingRow label="Share Usage Data" description="Help improve BoltInsight by sharing anonymous usage data">
              <ToggleSwitch checked={shareUsageData} onChange={setShareUsageData} />
            </SettingRow>

            {/* Archived Items Management */}
            <SettingRow label="Archived Items" description="Manage your archived projects and conversations">
              <button
                onClick={() => setShowArchiveModal(true)}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Manage
              </button>
            </SettingRow>

            <div className="py-4 space-y-3">
              <button className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                <Download className="w-5 h-5 text-gray-500" />
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Export All Data</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Download all your proposals and data</p>
                </div>
              </button>

              <button className="w-full flex items-center gap-3 px-4 py-3 border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                <Trash2 className="w-5 h-5 text-red-500" />
                <div className="text-left">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">Clear All Data</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Permanently delete all your data</p>
                </div>
              </button>
            </div>
          </section>
        );

      case 'security':
        return (
          <section className="mb-4">
            <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-normal text-gray-900 dark:text-white">Security</h3>
            </div>

            <div className="py-4 space-y-4">
              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">Current Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter current password"
                    className="w-full pl-10 pr-10 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter new password"
                    className="w-full pl-10 pr-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                  />
                </div>
              </div>

              <button className="px-4 py-2 bg-[#5B50BD] text-white rounded-lg text-sm font-medium hover:bg-[#4A41A0] transition-colors">
                Update Password
              </button>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
              <SettingRow label="Two-Factor Authentication" description="Add an extra layer of security to your account">
                <ToggleSwitch checked={twoFactorEnabled} onChange={setTwoFactorEnabled} />
              </SettingRow>
            </div>
          </section>
        );

      case 'account':
        return (
          <section className="mb-4">
            <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-normal text-gray-900 dark:text-white">Account</h3>
            </div>

            <div className="py-4">
              {/* Profile Card */}
              {isEditingProfile ? (
                <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-full bg-[#C9A75C] flex items-center justify-center text-white text-xl font-semibold overflow-hidden">
                      {currentUser.avatar ? (
                        <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                      ) : (
                        editName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                      )}
                    </div>
                    <button className="px-3 py-1.5 text-xs text-[#5B50BD] hover:bg-[#EDE9F9] dark:hover:bg-[#231E51] rounded-lg transition-colors">
                      Change Photo
                    </button>
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Name</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Email</label>
                    <input
                      type="email"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                    />
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setIsEditingProfile(false)}
                      className="flex-1 px-3 py-2 bg-[#5B50BD] text-white rounded-lg text-sm font-medium hover:bg-[#4A41A0] transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      onClick={() => {
                        setEditName(currentUser.name);
                        setEditEmail(currentUser.email);
                        setIsEditingProfile(false);
                      }}
                      className="px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4">
                  <div className="w-14 h-14 rounded-full bg-[#C9A75C] flex items-center justify-center text-white text-xl font-semibold overflow-hidden">
                    {currentUser.avatar ? (
                      <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                    ) : (
                      currentUser.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900 dark:text-white">{currentUser.name}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 mt-1 bg-[#EDE9F9] dark:bg-[#231E51] text-[#5B50BD] dark:text-[#918AD3] rounded text-xs font-medium">
                      <Shield className="w-3 h-3" />
                      {currentUser.role}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsEditingProfile(true)}
                    className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    Edit
                  </button>
                </div>
              )}

              {/* Role Selector - For testing different access levels */}
              <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span className="text-sm font-medium text-amber-800 dark:text-amber-200">Role (Demo Mode)</span>
                </div>
                <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
                  Change your role to test different access levels. Managers and Admins can see "All Proposals".
                </p>
                <div className="flex gap-2">
                  {(['researcher', 'manager', 'admin'] as const).map((role) => (
                    <button
                      key={role}
                      onClick={() => setCurrentUser({ ...currentUser, role })}
                      className={cn(
                        'flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors capitalize',
                        currentUser.role === role
                          ? 'bg-[#5B50BD] text-white'
                          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                      )}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setLoggedIn(false);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <LogOut className="w-5 h-5 text-gray-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">Sign Out</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Log out of your account</p>
                  </div>
                </button>

                <button className="w-full flex items-center gap-3 px-4 py-3 border border-red-200 dark:border-red-900/50 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-5 h-5 text-red-500" />
                  <div className="text-left">
                    <p className="text-sm font-medium text-red-600 dark:text-red-400">Delete Account</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Permanently delete your account and all data</p>
                  </div>
                </button>
              </div>
            </div>
          </section>
        );

      case 'admin':
        const filteredUsers = users.filter(u =>
          u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
          u.role.toLowerCase().includes(userSearch.toLowerCase())
        );
        const filteredRoles = roles.filter(r =>
          r.name.toLowerCase().includes(roleSearch.toLowerCase()) ||
          r.permissions.toLowerCase().includes(roleSearch.toLowerCase())
        );
        const filteredTemplates = templates.filter(t =>
          t.name.toLowerCase().includes(templateSearch.toLowerCase())
        );

        const handleAddUser = () => {
          if (newUserName.trim() && newUserEmail.trim()) {
            setUsers(prev => [...prev, {
              id: String(Date.now()),
              name: newUserName.trim(),
              email: newUserEmail.trim(),
              role: newUserRole
            }]);
            setNewUserName('');
            setNewUserEmail('');
            setNewUserRole('researcher');
            setShowAddUserForm(false);
          }
        };

        const handleAddRole = () => {
          if (newRoleName.trim() && newRolePermissions.trim()) {
            setRoles(prev => [...prev, {
              id: String(Date.now()),
              name: newRoleName.trim(),
              count: 0,
              color: 'bg-purple-100 text-purple-600',
              permissions: newRolePermissions.trim()
            }]);
            setNewRoleName('');
            setNewRolePermissions('');
            setShowAddRoleForm(false);
          }
        };

        const handleAddTemplate = () => {
          if (newTemplateName.trim()) {
            setTemplates(prev => [...prev, {
              id: String(Date.now()),
              name: newTemplateName.trim(),
              description: newTemplateDescription.trim() || 'No description',
              category: newTemplateCategory,
              status: newTemplateStatus
            }]);
            setNewTemplateName('');
            setNewTemplateDescription('');
            setNewTemplateCategory('Research');
            setNewTemplateStatus('Active');
            setShowAddTemplateForm(false);
          }
        };

        const handleExportUsers = () => {
          const csvContent = "Name,Email,Role\n" + users.map(u => `${u.name},${u.email},${u.role}`).join('\n');
          const blob = new Blob([csvContent], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = 'users.csv';
          a.click();
          URL.revokeObjectURL(url);
        };

        // Edit user handler
        const handleStartEditUser = (user: typeof users[0]) => {
          setEditingUserId(user.id);
          setEditUserName(user.name);
          setEditUserEmail(user.email);
          setEditUserRole(user.role);
        };

        const handleSaveUser = () => {
          if (editingUserId && editUserName.trim() && editUserEmail.trim()) {
            setUsers(prev => prev.map(u =>
              u.id === editingUserId
                ? { ...u, name: editUserName.trim(), email: editUserEmail.trim(), role: editUserRole }
                : u
            ));
            setEditingUserId(null);
            setEditUserName('');
            setEditUserEmail('');
            setEditUserRole('');
          }
        };

        const handleCancelEditUser = () => {
          setEditingUserId(null);
          setEditUserName('');
          setEditUserEmail('');
          setEditUserRole('');
        };

        // Edit role handler
        const handleStartEditRole = (role: typeof roles[0]) => {
          setEditingRoleId(role.id);
          setEditRoleName(role.name);
          setEditRolePermissions(role.permissions);
        };

        const handleSaveRole = () => {
          if (editingRoleId && editRoleName.trim() && editRolePermissions.trim()) {
            setRoles(prev => prev.map(r =>
              r.id === editingRoleId
                ? { ...r, name: editRoleName.trim(), permissions: editRolePermissions.trim() }
                : r
            ));
            setEditingRoleId(null);
            setEditRoleName('');
            setEditRolePermissions('');
          }
        };

        const handleCancelEditRole = () => {
          setEditingRoleId(null);
          setEditRoleName('');
          setEditRolePermissions('');
        };

        // Edit template handler
        const handleStartEditTemplate = (template: typeof templates[0]) => {
          setEditingTemplateId(template.id);
          setEditTemplateName(template.name);
          setEditTemplateDescription(template.description || '');
          setEditTemplateCategory(template.category || 'Research');
          setEditTemplateStatus(template.status);
        };

        const handleSaveTemplate = () => {
          if (editingTemplateId && editTemplateName.trim()) {
            setTemplates(prev => prev.map(t =>
              t.id === editingTemplateId
                ? {
                    ...t,
                    name: editTemplateName.trim(),
                    description: editTemplateDescription.trim() || 'No description',
                    category: editTemplateCategory,
                    status: editTemplateStatus
                  }
                : t
            ));
            setEditingTemplateId(null);
            setEditTemplateName('');
            setEditTemplateDescription('');
            setEditTemplateCategory('');
            setEditTemplateStatus('');
          }
        };

        const handleCancelEditTemplate = () => {
          setEditingTemplateId(null);
          setEditTemplateName('');
          setEditTemplateDescription('');
          setEditTemplateCategory('');
          setEditTemplateStatus('');
        };

        const handleExportAnalytics = () => {
          setAnalyticsExporting(true);
          setTimeout(() => {
            const data = {
              proposals: 423,
              approvalRate: '89%',
              users: 156,
              avgTime: '4.2h',
              exportDate: new Date().toISOString()
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'analytics-report.json';
            a.click();
            URL.revokeObjectURL(url);
            setAnalyticsExporting(false);
          }, 1000);
        };

        return (
          <section className="mb-4">
            <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-normal text-gray-900 dark:text-white">Admin Dashboard</h3>
            </div>

            {/* Compact Stats */}
            <div className="py-3">
              <StatRow icon={<Users className="w-3.5 h-3.5" />} label="Total Users" value={String(users.length)} change="12%" changeType="up" />
              <StatRow icon={<FileText className="w-3.5 h-3.5" />} label="Proposals" value="423" change="8%" changeType="up" />
              <StatRow icon={<Activity className="w-3.5 h-3.5" />} label="Active Now" value="24" />
              <StatRow icon={<Clock className="w-3.5 h-3.5" />} label="Avg. Time" value="4.2h" change="15%" changeType="down" />
            </div>

            {/* Quick Actions - Expandable Inline Sections */}
            <div className="space-y-2 mt-3">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">Quick Actions</p>

              {/* Manage Users - Expandable */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setAdminModal(adminModal === 'users' ? null : 'users')}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3]" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Manage Users</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", adminModal === 'users' && "rotate-180")} />
                </button>
                {adminModal === 'users' && (
                  <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mt-3 mb-3">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search users..."
                          value={userSearch}
                          onChange={(e) => setUserSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                        />
                      </div>
                      <button
                        onClick={() => setShowAddUserForm(!showAddUserForm)}
                        className={cn("px-3 py-2 rounded-lg text-xs font-medium transition-colors", showAddUserForm ? "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300" : "bg-[#5B50BD] text-white hover:bg-[#4A41A0]")}
                      >
                        <Plus className="w-3 h-3 inline mr-1" /> Add
                      </button>
                      <button
                        onClick={handleExportUsers}
                        className="px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700"
                      >
                        <Download className="w-3 h-3 inline mr-1" /> Export
                      </button>
                    </div>

                    {/* Add User Form */}
                    {showAddUserForm && (
                      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                        <input
                          type="text"
                          placeholder="Name"
                          value={newUserName}
                          onChange={(e) => setNewUserName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                        />
                        <input
                          type="email"
                          placeholder="Email"
                          value={newUserEmail}
                          onChange={(e) => setNewUserEmail(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                        />
                        <select
                          value={newUserRole}
                          onChange={(e) => setNewUserRole(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                        >
                          <option value="researcher">Researcher</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                        <div className="flex gap-2">
                          <button onClick={() => setShowAddUserForm(false)} className="flex-1 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">Cancel</button>
                          <button onClick={handleAddUser} disabled={!newUserName.trim() || !newUserEmail.trim()} className="flex-1 px-3 py-2 bg-[#5B50BD] text-white rounded-lg text-xs font-medium hover:bg-[#4A41A0] disabled:opacity-50 disabled:cursor-not-allowed">Add User</button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {filteredUsers.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">No users found</p>
                      ) : (
                        filteredUsers.map((user) => (
                          editingUserId === user.id ? (
                            <div key={user.id} className="p-3 rounded-lg bg-[#5B50BD]/5 dark:bg-[#5B50BD]/10 border border-[#5B50BD]/30 space-y-2">
                              <input
                                type="text"
                                value={editUserName}
                                onChange={(e) => setEditUserName(e.target.value)}
                                placeholder="Name"
                                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                              />
                              <input
                                type="email"
                                value={editUserEmail}
                                onChange={(e) => setEditUserEmail(e.target.value)}
                                placeholder="Email"
                                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                              />
                              <select
                                value={editUserRole}
                                onChange={(e) => setEditUserRole(e.target.value)}
                                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                              >
                                <option value="researcher">Researcher</option>
                                <option value="manager">Manager</option>
                                <option value="admin">Admin</option>
                              </select>
                              <div className="flex gap-2">
                                <button onClick={handleCancelEditUser} className="flex-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">Cancel</button>
                                <button onClick={handleSaveUser} disabled={!editUserName.trim() || !editUserEmail.trim()} className="flex-1 px-3 py-1.5 bg-[#5B50BD] text-white rounded-lg text-xs font-medium hover:bg-[#4A41A0] disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
                              </div>
                            </div>
                          ) : (
                            <div key={user.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                              <div className="w-7 h-7 rounded-full bg-[#5B50BD]/10 flex items-center justify-center text-xs font-medium text-[#5B50BD]">{user.name.charAt(0)}</div>
                              <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">{user.name}</p>
                                <p className="text-[10px] text-gray-500 truncate">{user.email}</p>
                              </div>
                              <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", user.role === 'admin' ? 'bg-red-100 text-red-600' : user.role === 'manager' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600')}>
                                {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                              </span>
                              <button onClick={() => handleStartEditUser(user)} className="text-xs text-[#5B50BD] hover:underline">Edit</button>
                              <button onClick={() => setUsers(prev => prev.filter(u => u.id !== user.id))} className="text-xs text-red-500 hover:underline">Delete</button>
                            </div>
                          )
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Roles & Permissions - Expandable */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setAdminModal(adminModal === 'roles' ? null : 'roles')}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3]" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Roles & Permissions</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", adminModal === 'roles' && "rotate-180")} />
                </button>
                {adminModal === 'roles' && (
                  <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mt-3 mb-3">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search roles..."
                          value={roleSearch}
                          onChange={(e) => setRoleSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                        />
                      </div>
                      <button
                        onClick={() => setShowAddRoleForm(!showAddRoleForm)}
                        className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", showAddRoleForm ? "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300" : "bg-[#5B50BD] text-white hover:bg-[#4A41A0]")}
                      >
                        <Plus className="w-3 h-3 inline mr-1" /> Create Role
                      </button>
                    </div>

                    {/* Add Role Form */}
                    {showAddRoleForm && (
                      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                        <input
                          type="text"
                          placeholder="Role name"
                          value={newRoleName}
                          onChange={(e) => setNewRoleName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                        />
                        <input
                          type="text"
                          placeholder="Permissions (e.g., View, Edit, Create)"
                          value={newRolePermissions}
                          onChange={(e) => setNewRolePermissions(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                        />
                        <div className="flex gap-2">
                          <button onClick={() => setShowAddRoleForm(false)} className="flex-1 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">Cancel</button>
                          <button onClick={handleAddRole} disabled={!newRoleName.trim() || !newRolePermissions.trim()} className="flex-1 px-3 py-2 bg-[#5B50BD] text-white rounded-lg text-xs font-medium hover:bg-[#4A41A0] disabled:opacity-50 disabled:cursor-not-allowed">Create</button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {filteredRoles.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">No roles found</p>
                      ) : (
                        filteredRoles.map((role) => (
                          editingRoleId === role.id ? (
                            <div key={role.id} className="p-3 rounded-lg bg-[#5B50BD]/5 dark:bg-[#5B50BD]/10 border border-[#5B50BD]/30 space-y-2">
                              <input
                                type="text"
                                value={editRoleName}
                                onChange={(e) => setEditRoleName(e.target.value)}
                                placeholder="Role name"
                                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                              />
                              <input
                                type="text"
                                value={editRolePermissions}
                                onChange={(e) => setEditRolePermissions(e.target.value)}
                                placeholder="Permissions (e.g., View, Edit, Create)"
                                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                              />
                              <div className="flex gap-2">
                                <button onClick={handleCancelEditRole} className="flex-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">Cancel</button>
                                <button onClick={handleSaveRole} disabled={!editRoleName.trim() || !editRolePermissions.trim()} className="flex-1 px-3 py-1.5 bg-[#5B50BD] text-white rounded-lg text-xs font-medium hover:bg-[#4A41A0] disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
                              </div>
                            </div>
                          ) : (
                            <div key={role.id} className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                              <span className={cn("px-1.5 py-0.5 rounded text-[10px] font-medium", role.color)}>{role.name}</span>
                              <div className="flex-1">
                                <p className="text-[10px] text-gray-500">{role.permissions}</p>
                              </div>
                              <span className="text-[10px] text-gray-400">{role.count} users</span>
                              <button onClick={() => handleStartEditRole(role)} className="text-xs text-[#5B50BD] hover:underline">Edit</button>
                              <button onClick={() => setRoles(prev => prev.filter(r => r.id !== role.id))} className="text-xs text-red-500 hover:underline">Delete</button>
                            </div>
                          )
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Example Proposals - Expandable */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setAdminModal(adminModal === 'examples' ? null : 'examples')}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3]" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">Example Proposals</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", adminModal === 'examples' && "rotate-180")} />
                </button>
                {adminModal === 'examples' && (
                  <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mt-3 mb-3">
                      <div className="flex-1 relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          placeholder="Search templates..."
                          value={templateSearch}
                          onChange={(e) => setTemplateSearch(e.target.value)}
                          className="w-full pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                        />
                      </div>
                      <button
                        onClick={() => setShowAddTemplateForm(!showAddTemplateForm)}
                        className={cn("px-3 py-1.5 rounded-lg text-xs font-medium transition-colors", showAddTemplateForm ? "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300" : "bg-[#5B50BD] text-white hover:bg-[#4A41A0]")}
                      >
                        <Plus className="w-3 h-3 inline mr-1" /> Add Template
                      </button>
                    </div>

                    {/* Add Template Form */}
                    {showAddTemplateForm && (
                      <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg space-y-2">
                        <input
                          type="text"
                          placeholder="Template name *"
                          value={newTemplateName}
                          onChange={(e) => setNewTemplateName(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                        />
                        <textarea
                          placeholder="Description"
                          value={newTemplateDescription}
                          onChange={(e) => setNewTemplateDescription(e.target.value)}
                          rows={2}
                          className="w-full px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD] resize-none"
                        />
                        <div className="flex gap-2">
                          <select
                            value={newTemplateCategory}
                            onChange={(e) => setNewTemplateCategory(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                          >
                            <option value="Research">Research</option>
                            <option value="Brand">Brand</option>
                            <option value="Product">Product</option>
                            <option value="Advertising">Advertising</option>
                            <option value="Pricing">Pricing</option>
                            <option value="CX">CX</option>
                            <option value="Strategy">Strategy</option>
                          </select>
                          <select
                            value={newTemplateStatus}
                            onChange={(e) => setNewTemplateStatus(e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-200 dark:border-gray-600 rounded-lg text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                          >
                            <option value="Active">Active</option>
                            <option value="Inactive">Inactive</option>
                          </select>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => { setShowAddTemplateForm(false); setNewTemplateName(''); setNewTemplateDescription(''); setNewTemplateCategory('Research'); setNewTemplateStatus('Active'); }} className="flex-1 px-3 py-2 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">Cancel</button>
                          <button onClick={handleAddTemplate} disabled={!newTemplateName.trim()} className="flex-1 px-3 py-2 bg-[#5B50BD] text-white rounded-lg text-xs font-medium hover:bg-[#4A41A0] disabled:opacity-50 disabled:cursor-not-allowed">Add Template</button>
                        </div>
                      </div>
                    )}

                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {filteredTemplates.length === 0 ? (
                        <p className="text-xs text-gray-500 text-center py-4">No templates found</p>
                      ) : (
                        filteredTemplates.map((template) => (
                          editingTemplateId === template.id ? (
                            <div key={template.id} className="p-3 rounded-lg bg-[#5B50BD]/5 dark:bg-[#5B50BD]/10 border border-[#5B50BD]/30 space-y-2">
                              <input
                                type="text"
                                value={editTemplateName}
                                onChange={(e) => setEditTemplateName(e.target.value)}
                                placeholder="Template name *"
                                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                              />
                              <textarea
                                value={editTemplateDescription}
                                onChange={(e) => setEditTemplateDescription(e.target.value)}
                                placeholder="Description"
                                rows={2}
                                className="w-full px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD] resize-none"
                              />
                              <div className="flex gap-2">
                                <select
                                  value={editTemplateCategory}
                                  onChange={(e) => setEditTemplateCategory(e.target.value)}
                                  className="flex-1 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                                >
                                  <option value="Research">Research</option>
                                  <option value="Brand">Brand</option>
                                  <option value="Product">Product</option>
                                  <option value="Consumer">Consumer</option>
                                  <option value="Market">Market</option>
                                  <option value="Other">Other</option>
                                </select>
                                <select
                                  value={editTemplateStatus}
                                  onChange={(e) => setEditTemplateStatus(e.target.value)}
                                  className="flex-1 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-[#5B50BD]"
                                >
                                  <option value="Active">Active</option>
                                  <option value="Inactive">Inactive</option>
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={handleCancelEditTemplate} className="flex-1 px-3 py-1.5 text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">Cancel</button>
                                <button onClick={handleSaveTemplate} disabled={!editTemplateName.trim()} className="flex-1 px-3 py-1.5 bg-[#5B50BD] text-white rounded-lg text-xs font-medium hover:bg-[#4A41A0] disabled:opacity-50 disabled:cursor-not-allowed">Save</button>
                              </div>
                            </div>
                          ) : (
                            <div key={template.id} className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 space-y-1">
                              <div className="flex items-center gap-2">
                                <FileText className="w-4 h-4 text-gray-400 flex-shrink-0" />
                                <span className="flex-1 text-xs font-medium text-gray-700 dark:text-gray-300">{template.name}</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">{template.category}</span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${template.status === 'Active' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400'}`}>{template.status}</span>
                              </div>
                              {template.description && (
                                <p className="text-[10px] text-gray-500 dark:text-gray-400 pl-6 line-clamp-2">{template.description}</p>
                              )}
                              <div className="flex gap-2 pl-6">
                                <button onClick={() => handleStartEditTemplate(template)} className="text-xs text-[#5B50BD] hover:underline">Edit</button>
                                <button onClick={() => setTemplates(prev => prev.filter(t => t.id !== template.id))} className="text-xs text-red-500 hover:underline">Delete</button>
                              </div>
                            </div>
                          )
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* View Analytics - Expandable */}
              <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                <button
                  onClick={() => setAdminModal(adminModal === 'analytics' ? null : 'analytics')}
                  className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3]" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">View Analytics</span>
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-gray-400 transition-transform", adminModal === 'analytics' && "rotate-180")} />
                </button>
                {adminModal === 'analytics' && (
                  <div className="px-3 pb-3 border-t border-gray-200 dark:border-gray-700">
                    {!showFullAnalytics ? (
                      <>
                        <div className="grid grid-cols-2 gap-2 mt-3 mb-3">
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">423</p>
                            <p className="text-[10px] text-gray-500">Proposals</p>
                          </div>
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                            <p className="text-lg font-bold text-green-500">89%</p>
                            <p className="text-[10px] text-gray-500">Approval</p>
                          </div>
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">{users.length}</p>
                            <p className="text-[10px] text-gray-500">Users</p>
                          </div>
                          <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                            <p className="text-lg font-bold text-gray-900 dark:text-white">4.2h</p>
                            <p className="text-[10px] text-gray-500">Avg. Time</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleExportAnalytics}
                            disabled={analyticsExporting}
                            className="flex-1 px-3 py-1.5 border border-gray-200 dark:border-gray-600 rounded-lg text-xs text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                          >
                            {analyticsExporting ? (
                              <span className="flex items-center justify-center gap-1"><span className="animate-spin">⏳</span> Exporting...</span>
                            ) : (
                              <><Download className="w-3 h-3 inline mr-1" /> Export</>
                            )}
                          </button>
                          <button
                            onClick={() => setShowFullAnalytics(true)}
                            className="flex-1 px-3 py-1.5 bg-[#5B50BD] text-white rounded-lg text-xs font-medium hover:bg-[#4A41A0]"
                          >
                            Full Dashboard
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="mt-3">
                        <button onClick={() => setShowFullAnalytics(false)} className="text-xs text-[#5B50BD] hover:underline mb-3">← Back to summary</button>
                        <div className="space-y-3">
                          <div className="grid grid-cols-4 gap-2">
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                              <p className="text-sm font-bold text-gray-900 dark:text-white">423</p>
                              <p className="text-[9px] text-gray-500">Total</p>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                              <p className="text-sm font-bold text-green-500">376</p>
                              <p className="text-[9px] text-gray-500">Approved</p>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                              <p className="text-sm font-bold text-amber-500">32</p>
                              <p className="text-[9px] text-gray-500">Pending</p>
                            </div>
                            <div className="p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 text-center">
                              <p className="text-sm font-bold text-red-500">15</p>
                              <p className="text-[9px] text-gray-500">Rejected</p>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Monthly Trend</p>
                            <div className="flex items-end gap-1 h-16">
                              {[35, 42, 28, 55, 48, 62, 45, 58, 72, 65, 78, 85].map((h, i) => (
                                <div key={i} className="flex-1 bg-[#5B50BD]/60 rounded-t" style={{ height: `${h}%` }} title={`Month ${i + 1}`} />
                              ))}
                            </div>
                            <div className="flex justify-between mt-1">
                              <span className="text-[8px] text-gray-400">Jan</span>
                              <span className="text-[8px] text-gray-400">Dec</span>
                            </div>
                          </div>
                          <div className="p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                            <p className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Top Performers</p>
                            <div className="space-y-1.5">
                              {['John Doe - 45 proposals', 'Jane Smith - 38 proposals', 'Mike Wilson - 32 proposals'].map((item, i) => (
                                <div key={i} className="flex items-center gap-2 text-[10px] text-gray-600 dark:text-gray-400">
                                  <span className="w-4 h-4 rounded-full bg-[#5B50BD]/10 flex items-center justify-center text-[8px] font-bold text-[#5B50BD]">{i + 1}</span>
                                  {item}
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </section>
        );

      case 'developer':
        return (
          <section className="mb-4">
            <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-normal text-gray-900 dark:text-white">Developer Settings</h3>
            </div>

            {/* Compact API Stats */}
            <div className="py-3">
              <StatRow icon={<Zap className="w-3.5 h-3.5" />} label="API Calls" value="12.4K" change="23%" changeType="up" />
              <StatRow icon={<Globe className="w-3.5 h-3.5" />} label="Tokens Used" value="847K" change="15%" changeType="up" />
            </div>

            {/* API Keys Section */}
            <div className="mt-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">API Keys</p>
                <button
                  onClick={() => { setShowNewKeyModal(true); setNewKeyName(''); setGeneratedKey(null); }}
                  className="flex items-center gap-1 px-3 py-1.5 bg-[#5B50BD] text-white rounded-lg text-xs font-medium hover:bg-[#4A41A0] transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  New Key
                </button>
              </div>

              {/* New Key Modal/Form */}
              {showNewKeyModal && (
                <div className="mb-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                  {!generatedKey ? (
                    <>
                      <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">Create New API Key</p>
                      <input
                        type="text"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        placeholder="Enter key name (e.g., Mobile App)"
                        className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 text-sm text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      />
                      <div className="flex gap-2 mt-3">
                        <button
                          onClick={() => setShowNewKeyModal(false)}
                          className="flex-1 px-3 py-2 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={generateNewKey}
                          disabled={!newKeyName.trim()}
                          className="flex-1 px-3 py-2 text-sm bg-[#5B50BD] text-white rounded-lg hover:bg-[#4A41A0] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Generate Key
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center gap-2 mb-3">
                        <CheckCircle className="w-5 h-5 text-green-500" />
                        <p className="text-sm font-medium text-gray-900 dark:text-white">API Key Created!</p>
                      </div>
                      <div className="p-3 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-600">
                        <p className="text-[10px] text-gray-500 mb-1">Make sure to copy your key now. You won't be able to see it again!</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 text-xs text-gray-900 dark:text-white font-mono break-all">{generatedKey}</code>
                          <button
                            onClick={() => navigator.clipboard.writeText(generatedKey)}
                            className="p-1.5 text-[#5B50BD] hover:bg-[#EDE9F9] dark:hover:bg-[#231E51] rounded transition-colors"
                            title="Copy to clipboard"
                          >
                            <Copy className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <button
                        onClick={() => { setShowNewKeyModal(false); setGeneratedKey(null); }}
                        className="w-full mt-3 px-3 py-2 text-sm bg-[#5B50BD] text-white rounded-lg hover:bg-[#4A41A0] transition-colors"
                      >
                        Done
                      </button>
                    </>
                  )}
                </div>
              )}

              <div className="space-y-2">
                {apiKeys.map((apiKey) => (
                  <div key={apiKey.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <Key className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{apiKey.name}</p>
                        {visibleKeys.has(apiKey.id) ? (
                          <p className="text-xs text-gray-500 font-mono truncate">{apiKey.key}</p>
                        ) : (
                          <p className="text-xs text-gray-500">sk-{apiKey.suffix}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs rounded">Active</span>
                      <button
                        onClick={() => toggleKeyVisibility(apiKey.id)}
                        className={cn(
                          "p-1.5 rounded transition-colors",
                          visibleKeys.has(apiKey.id)
                            ? "text-[#5B50BD] bg-[#EDE9F9] dark:bg-[#231E51]"
                            : "text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                        )}
                        title={visibleKeys.has(apiKey.id) ? "Hide key" : "Show key"}
                      >
                        {visibleKeys.has(apiKey.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documentation Link */}
            <div className="mt-4 p-4 bg-[#EDE9F9] dark:bg-[#231E51] rounded-xl">
              <div className="flex items-center gap-3">
                <Code className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">API Documentation</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Learn how to integrate with BoltInsight</p>
                </div>
                <ExternalLink className="w-4 h-4 text-[#5B50BD] dark:text-[#918AD3]" />
              </div>
            </div>
          </section>
        );

      case 'system':
        return (
          <section className="mb-4">
            <div className="flex items-center py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-normal text-gray-900 dark:text-white">System Settings</h3>
            </div>

            <SettingRow label="Maintenance Mode" description="Put the system in maintenance mode. Only admins can access.">
              <ToggleSwitch checked={maintenanceMode} onChange={setMaintenanceMode} />
            </SettingRow>

            <SettingRow label="Debug Mode" description="Enable detailed error messages and logging">
              <ToggleSwitch checked={debugMode} onChange={setDebugMode} />
            </SettingRow>

            <SettingRow label="Cache Enabled" description="Enable caching for improved performance">
              <ToggleSwitch checked={cacheEnabled} onChange={setCacheEnabled} />
            </SettingRow>

            <SettingRow label="Analytics" description="Collect system analytics and performance metrics">
              <ToggleSwitch checked={analyticsEnabled} onChange={setAnalyticsEnabled} />
            </SettingRow>

            {/* Compact System Info */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">System Info</p>
              <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs">
                <span className="text-gray-500">v2.4.1</span>
                <span className="text-gray-500">Production</span>
                <span className="text-gray-500">Updated Dec 23</span>
                <span className="text-green-500">● Connected</span>
              </div>
            </div>

            {/* Danger Zone */}
            <div className="mt-6 p-4 border border-red-200 dark:border-red-900/50 rounded-xl">
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-3">Danger Zone</p>
              <div className="space-y-2">
                <button className="w-full flex items-center gap-3 px-4 py-2.5 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Trash2 className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400">Clear Cache</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-2.5 border border-red-200 dark:border-red-900/50 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                  <Database className="w-4 h-4 text-red-500" />
                  <span className="text-sm text-red-600 dark:text-red-400">Reset Database</span>
                </button>
              </div>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-[720px] h-[600px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 md:hidden">
          <h2 className="text-lg font-normal text-gray-900 dark:text-white">
            {visibleTabs.find((t) => t.id === activeTab)?.label}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="hidden md:flex flex-col w-[200px] min-w-[200px] bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-700 py-3">
            {/* Close button */}
            <div className="px-3 mb-2">
              <button
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex-1 overflow-y-auto">
              {visibleTabs.map((tab, index) => (
                <div key={tab.id}>
                  {/* Divider before admin tabs */}
                  {tab.adminOnly && visibleTabs[index - 1] && !visibleTabs[index - 1].adminOnly && (
                    <div className="h-px bg-gray-200 dark:bg-gray-700 mx-4 my-2" />
                  )}
                  <button
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors text-left w-[calc(100%-16px)]',
                      activeTab === tab.id
                        ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                    )}
                  >
                    <span className={cn(
                      'flex items-center justify-center',
                      activeTab === tab.id ? 'text-[#5B50BD] dark:text-[#918AD3]' : 'text-gray-400'
                    )}>
                      {tab.icon}
                    </span>
                    <span className="truncate">{tab.label}</span>
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Mobile Tab Bar */}
          <div className="flex md:hidden overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-1.5 flex-shrink-0">
            {visibleTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors',
                  activeTab === tab.id
                    ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white'
                    : 'text-gray-600 dark:text-gray-400'
                )}
              >
                <span className={cn(
                  activeTab === tab.id ? 'text-[#5B50BD] dark:text-[#918AD3]' : 'text-gray-400'
                )}>
                  {tab.icon}
                </span>
                <span>{tab.label}</span>
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto px-6 py-2">
            {renderTabContent()}
          </div>
        </div>
      </div>

      {/* Archive Management Modal */}
      {showArchiveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-3xl max-h-[80vh] flex flex-col shadow-xl overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Archived Items</h2>
              <button
                onClick={() => setShowArchiveModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto min-h-0 pb-6">
              {(archivedProjects.length > 0 || archivedHistoryItems.length > 0) ? (
                <div className="">
                  {/* Header Row - No gray background */}
                  <div className="grid grid-cols-[20px_1fr_150px_100px_70px] gap-2 items-center px-6 py-3 border-t-0">
                    <div></div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</div>
                    <div className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</div>
                  </div>
                  {/* Archived Projects */}
                  {archivedProjects.map((project) => (
                    <div
                      key={project.id}
                      className="grid grid-cols-[20px_1fr_135px_100px_100px] gap-2 items-center px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <Archive className="w-5 h-5 text-gray-400" />
                      <div className="min-w-0">
                        <button
                          onClick={() => {
                            setShowArchiveModal(false);
                            onClose();
                          }}
                          className="text-sm font-medium text-[#5B50BD] dark:text-[#918AD3] hover:underline text-left block truncate"
                        >
                          {project.name}
                        </button>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full w-fit">
                        Project
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(project.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => unarchiveChatProject(project.id)}
                          className="p-1.5 text-gray-400 hover:text-[#5B50BD] dark:hover:text-[#918AD3] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Unarchive"
                        >
                          <ArchiveRestore className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this item?')) {
                              deleteChatProject(project.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                  {/* Archived History Items */}
                  {archivedHistoryItems.map((item) => (
                    <div
                      key={item.id}
                      className="grid grid-cols-[20px_1fr_135px_100px_100px] gap-2 items-center px-6 py-3 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      <Archive className="w-5 h-5 text-gray-400" />
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-[#5B50BD] dark:text-[#918AD3] cursor-pointer hover:underline block truncate">
                          {item.title}
                        </span>
                      </div>
                      <span className="text-xs text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full w-fit">
                        {item.type === 'metalearning' ? 'Meta Learning' :
                         item.type === 'calculator' ? 'Calculator' :
                         item.type === 'proposal' ? 'Proposal' :
                         item.type === 'project-chat' ? 'Project Chat' : item.type}
                      </span>
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        {new Date(item.timestamp).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </span>
                      <div className="flex items-center gap-1 justify-end">
                        <button
                          onClick={() => unarchiveHistoryItem(item.id)}
                          className="p-1.5 text-gray-400 hover:text-[#5B50BD] dark:hover:text-[#918AD3] hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                          title="Unarchive"
                        >
                          <ArchiveRestore className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this item?')) {
                              unarchiveHistoryItem(item.id);
                            }
                          }}
                          className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 px-6">
                  <Archive className="w-12 h-12 text-gray-300 dark:text-gray-600 mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-center">No archived items</p>
                  <p className="text-sm text-gray-400 dark:text-gray-500 text-center mt-1">
                    Items you archive will appear here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
