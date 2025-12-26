'use client';

import { useState } from 'react';
import {
  X,
  Settings as SettingsIcon,
  Bell,
  Palette,
  Plug,
  Database,
  Shield,
  User,
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
} from 'lucide-react';
import { useAppStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme';
import { cn } from '@/lib/utils';

type TabId = 'general' | 'notifications' | 'personalization' | 'integrations' | 'data-controls' | 'security' | 'account';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'general', label: 'General', icon: <SettingsIcon className="w-5 h-5" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  { id: 'personalization', label: 'Personalization', icon: <Palette className="w-5 h-5" /> },
  { id: 'integrations', label: 'Integrations', icon: <Plug className="w-5 h-5" /> },
  { id: 'data-controls', label: 'Data Controls', icon: <Database className="w-5 h-5" /> },
  { id: 'security', label: 'Security', icon: <Shield className="w-5 h-5" /> },
  { id: 'account', label: 'Account', icon: <User className="w-5 h-5" /> },
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
        className="inline-flex items-center justify-center gap-1 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
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

export function Settings() {
  const { currentUser, defaultEditorMode, setDefaultEditorMode, showAdminButton, setShowAdminButton, setLoggedIn } = useAppStore();
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [activeTab, setActiveTab] = useState<TabId>('general');

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

  const handleThemeChange = (value: string) => {
    setTheme(value as 'system' | 'light' | 'dark');
    if (value === 'dark' && !isDarkMode) toggleDarkMode();
    if (value === 'light' && isDarkMode) toggleDarkMode();
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

            <SettingRow label="Show Admin Button" description="Display the Admin button in the top right corner for quick access to admin pages">
              <ToggleSwitch checked={showAdminButton} onChange={setShowAdminButton} />
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
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl mb-4">
                <div className="w-14 h-14 rounded-full bg-[#C9A75C] flex items-center justify-center text-white text-xl font-semibold">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full rounded-full object-cover" />
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
                <button className="px-3 py-1.5 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                  Edit
                </button>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <button
                  onClick={() => setLoggedIn(false)}
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

      default:
        return null;
    }
  };

  return (
    <div className="h-full overflow-hidden bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      {/* Settings Modal */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-[680px] h-[600px] max-h-[85vh] flex flex-col overflow-hidden">
        {/* Mobile Header */}
        <header className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700 md:hidden">
          <h2 className="text-lg font-normal text-gray-900 dark:text-white">
            {tabs.find((t) => t.id === activeTab)?.label}
          </h2>
          <button className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </header>

        {/* Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="hidden md:flex flex-col w-[180px] min-w-[180px] bg-gray-50 dark:bg-gray-900/50 border-r border-gray-200 dark:border-gray-700 py-3">
            {/* Close button */}
            <div className="px-3 mb-2">
              <button className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Tabs */}
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex items-center gap-2.5 px-4 py-2.5 mx-2 rounded-lg text-sm font-medium transition-colors text-left',
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
            ))}
          </div>

          {/* Mobile Tab Bar */}
          <div className="flex md:hidden overflow-x-auto border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 p-1.5">
            {tabs.map((tab) => (
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
          <div className="flex-1 overflow-y-auto px-4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}
