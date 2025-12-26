'use client';

import { useState } from 'react';
import {
  Settings,
  Globe,
  Database,
  Shield,
  Zap,
  Bell,
  Mail,
  Clock,
  Save,
  RotateCcw,
  AlertTriangle,
  Check,
  Moon,
  Sun,
  Palette,
} from 'lucide-react';
import { Card, CardContent, Button, toast } from '@/components/ui';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/lib/theme';

type TabId = 'general' | 'appearance' | 'notifications' | 'security' | 'performance';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'general', label: 'General', icon: <Settings className="w-4 h-4" /> },
  { id: 'appearance', label: 'Appearance', icon: <Palette className="w-4 h-4" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-4 h-4" /> },
  { id: 'security', label: 'Security', icon: <Shield className="w-4 h-4" /> },
  { id: 'performance', label: 'Performance', icon: <Zap className="w-4 h-4" /> },
];

export function SystemSettings() {
  const { isDarkMode, toggleDarkMode } = useThemeStore();
  const [activeTab, setActiveTab] = useState<TabId>('general');
  const [isSaving, setIsSaving] = useState(false);

  // General settings state
  const [generalSettings, setGeneralSettings] = useState({
    siteName: 'BoltInsight',
    siteDescription: 'AI-powered proposal management platform',
    defaultLanguage: 'tr',
    timezone: 'Europe/Istanbul',
    dateFormat: 'DD/MM/YYYY',
    maxFileSize: 10,
    allowPublicRegistration: false,
  });

  // Appearance settings state
  const [appearanceSettings, setAppearanceSettings] = useState({
    primaryColor: '#5B50BD',
    accentColor: '#918AD3',
    logoUrl: '',
    faviconUrl: '',
    compactMode: false,
    animationsEnabled: true,
  });

  // Notification settings state
  const [notificationSettings, setNotificationSettings] = useState({
    emailEnabled: true,
    smtpHost: 'smtp.boltinsight.com',
    smtpPort: 587,
    smtpUser: '',
    smtpPassword: '',
    emailFromAddress: 'noreply@boltinsight.com',
    emailFromName: 'BoltInsight',
    pushNotificationsEnabled: true,
    notifyOnNewProposal: true,
    notifyOnApproval: true,
    notifyOnComment: true,
  });

  // Security settings state
  const [securitySettings, setSecuritySettings] = useState({
    sessionTimeout: 60,
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    requireMfa: false,
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSpecialChars: true,
    allowedIpAddresses: '',
    auditLoggingEnabled: true,
  });

  // Performance settings state
  const [performanceSettings, setPerformanceSettings] = useState({
    cacheEnabled: true,
    cacheDuration: 3600,
    maxConcurrentRequests: 100,
    apiRateLimit: 1000,
    compressionEnabled: true,
    minifyAssets: true,
    lazyLoadingEnabled: true,
    prefetchEnabled: false,
  });

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      toast.success('Settings saved', 'System settings updated successfully');
    }, 1000);
  };

  const handleReset = () => {
    toast.info('Settings reset', 'Restored to default settings');
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50 dark:bg-gray-900">
      <div className="p-8">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-6 h-6 rounded-full border-2 border-[#5B50BD] dark:border-[#918AD3]" />
            <h1 className="text-xl font-semibold text-gray-800 dark:text-white">System Settings</h1>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 ml-9">
            Manage system-wide preferences and configurations
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
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* General Settings Tab */}
        {activeTab === 'general' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Globe className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
                  <h3 className="font-semibold text-gray-800 dark:text-white">Site Settings</h3>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Site Name
                    </label>
                    <input
                      type="text"
                      value={generalSettings.siteName}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Site Description
                    </label>
                    <textarea
                      value={generalSettings.siteDescription}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                      rows={2}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Default Language
                      </label>
                      <select
                        value={generalSettings.defaultLanguage}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, defaultLanguage: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      >
                        <option value="tr">Türkçe</option>
                        <option value="en">English</option>
                        <option value="de">Deutsch</option>
                        <option value="fr">Français</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Timezone
                      </label>
                      <select
                        value={generalSettings.timezone}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, timezone: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      >
                        <option value="Europe/Istanbul">Europe/Istanbul (GMT+3)</option>
                        <option value="Europe/London">Europe/London (GMT+0)</option>
                        <option value="America/New_York">America/New York (GMT-5)</option>
                        <option value="Asia/Tokyo">Asia/Tokyo (GMT+9)</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Date Format
                      </label>
                      <select
                        value={generalSettings.dateFormat}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, dateFormat: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      >
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max File Size (MB)
                      </label>
                      <input
                        type="number"
                        value={generalSettings.maxFileSize}
                        onChange={(e) => setGeneralSettings({ ...generalSettings, maxFileSize: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      />
                    </div>
                  </div>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">Public Registration</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Allow new users to register themselves</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={generalSettings.allowPublicRegistration}
                      onChange={(e) => setGeneralSettings({ ...generalSettings, allowPublicRegistration: e.target.checked })}
                      className="w-5 h-5 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Appearance Settings Tab */}
        {activeTab === 'appearance' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
                  <h3 className="font-semibold text-gray-800 dark:text-white">Theme Settings</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {isDarkMode ? <Moon className="w-5 h-5 text-[#918AD3]" /> : <Sun className="w-5 h-5 text-amber-500" />}
                      <div>
                        <p className="font-medium text-gray-800 dark:text-white">Dark Mode</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Use dark theme</p>
                      </div>
                    </div>
                    <button
                      onClick={toggleDarkMode}
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

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Primary Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={appearanceSettings.primaryColor}
                          onChange={(e) => setAppearanceSettings({ ...appearanceSettings, primaryColor: e.target.value })}
                          className="w-10 h-10 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={appearanceSettings.primaryColor}
                          onChange={(e) => setAppearanceSettings({ ...appearanceSettings, primaryColor: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Accent Color
                      </label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={appearanceSettings.accentColor}
                          onChange={(e) => setAppearanceSettings({ ...appearanceSettings, accentColor: e.target.value })}
                          className="w-10 h-10 border border-gray-200 dark:border-gray-700 rounded-lg cursor-pointer"
                        />
                        <input
                          type="text"
                          value={appearanceSettings.accentColor}
                          onChange={(e) => setAppearanceSettings({ ...appearanceSettings, accentColor: e.target.value })}
                          className="flex-1 px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                        />
                      </div>
                    </div>
                  </div>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">Compact Mode</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Reduce spacing for a denser layout</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={appearanceSettings.compactMode}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, compactMode: e.target.checked })}
                      className="w-5 h-5 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">Animations</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Enable UI animations and transitions</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={appearanceSettings.animationsEnabled}
                      onChange={(e) => setAppearanceSettings({ ...appearanceSettings, animationsEnabled: e.target.checked })}
                      className="w-5 h-5 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Notifications Settings Tab */}
        {activeTab === 'notifications' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Mail className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
                  <h3 className="font-semibold text-gray-800 dark:text-white">Email Settings</h3>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">Email Notifications</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Enable email notifications</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailEnabled}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, emailEnabled: e.target.checked })}
                      className="w-5 h-5 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        SMTP Server
                      </label>
                      <input
                        type="text"
                        value={notificationSettings.smtpHost}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, smtpHost: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        SMTP Port
                      </label>
                      <input
                        type="number"
                        value={notificationSettings.smtpPort}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, smtpPort: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        From Email
                      </label>
                      <input
                        type="email"
                        value={notificationSettings.emailFromAddress}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailFromAddress: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        From Name
                      </label>
                      <input
                        type="text"
                        value={notificationSettings.emailFromName}
                        onChange={(e) => setNotificationSettings({ ...notificationSettings, emailFromName: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Bell className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
                  <h3 className="font-semibold text-gray-800 dark:text-white">Notification Preferences</h3>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">New Proposal</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Notify when a new proposal is created</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.notifyOnNewProposal}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyOnNewProposal: e.target.checked })}
                      className="w-5 h-5 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">Approval Status</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Notify when approval status changes</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.notifyOnApproval}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyOnApproval: e.target.checked })}
                      className="w-5 h-5 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">Comments</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Notify when a new comment is added</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.notifyOnComment}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, notifyOnComment: e.target.checked })}
                      className="w-5 h-5 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Security Settings Tab */}
        {activeTab === 'security' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
                  <h3 className="font-semibold text-gray-800 dark:text-white">Session Security</h3>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Session Timeout (minutes)
                      </label>
                      <input
                        type="number"
                        value={securitySettings.sessionTimeout}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, sessionTimeout: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Login Attempts
                      </label>
                      <input
                        type="number"
                        value={securitySettings.maxLoginAttempts}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, maxLoginAttempts: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      />
                    </div>
                  </div>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">Two-Factor Authentication (MFA)</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Require MFA for all users</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings.requireMfa}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, requireMfa: e.target.checked })}
                      className="w-5 h-5 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">Audit Logging</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Log all user activities</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={securitySettings.auditLoggingEnabled}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, auditLoggingEnabled: e.target.checked })}
                      className="w-5 h-5 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                    />
                  </label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="font-semibold text-gray-800 dark:text-white mb-4">Password Policy</h3>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Minimum Password Length
                    </label>
                    <input
                      type="number"
                      value={securitySettings.passwordMinLength}
                      onChange={(e) => setSecuritySettings({ ...securitySettings, passwordMinLength: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.passwordRequireUppercase}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, passwordRequireUppercase: e.target.checked })}
                        className="w-4 h-4 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Require uppercase letter</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.passwordRequireNumbers}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, passwordRequireNumbers: e.target.checked })}
                        className="w-4 h-4 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Require number</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={securitySettings.passwordRequireSpecialChars}
                        onChange={(e) => setSecuritySettings({ ...securitySettings, passwordRequireSpecialChars: e.target.checked })}
                        className="w-4 h-4 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">Require special character</span>
                    </label>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Performance Settings Tab */}
        {activeTab === 'performance' && (
          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
                  <h3 className="font-semibold text-gray-800 dark:text-white">Cache Settings</h3>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">Cache</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Enable application cache</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={performanceSettings.cacheEnabled}
                      onChange={(e) => setPerformanceSettings({ ...performanceSettings, cacheEnabled: e.target.checked })}
                      className="w-5 h-5 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                    />
                  </label>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Cache Duration (seconds)
                    </label>
                    <input
                      type="number"
                      value={performanceSettings.cacheDuration}
                      onChange={(e) => setPerformanceSettings({ ...performanceSettings, cacheDuration: parseInt(e.target.value) })}
                      className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Zap className="w-5 h-5 text-[#5B50BD] dark:text-[#918AD3]" />
                  <h3 className="font-semibold text-gray-800 dark:text-white">Optimization</h3>
                </div>

                <div className="space-y-4">
                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">Compression</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Enable response compression</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={performanceSettings.compressionEnabled}
                      onChange={(e) => setPerformanceSettings({ ...performanceSettings, compressionEnabled: e.target.checked })}
                      className="w-5 h-5 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">Lazy Loading</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Load images and components on demand</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={performanceSettings.lazyLoadingEnabled}
                      onChange={(e) => setPerformanceSettings({ ...performanceSettings, lazyLoadingEnabled: e.target.checked })}
                      className="w-5 h-5 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                    />
                  </label>

                  <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                    <div>
                      <p className="font-medium text-gray-800 dark:text-white text-sm">Prefetch</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Preload pages in advance</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={performanceSettings.prefetchEnabled}
                      onChange={(e) => setPerformanceSettings({ ...performanceSettings, prefetchEnabled: e.target.checked })}
                      className="w-5 h-5 text-[#5B50BD] rounded focus:ring-[#5B50BD]"
                    />
                  </label>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        API Rate Limit (requests/min)
                      </label>
                      <input
                        type="number"
                        value={performanceSettings.apiRateLimit}
                        onChange={(e) => setPerformanceSettings({ ...performanceSettings, apiRateLimit: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Max Concurrent Requests
                      </label>
                      <input
                        type="number"
                        value={performanceSettings.maxConcurrentRequests}
                        onChange={(e) => setPerformanceSettings({ ...performanceSettings, maxConcurrentRequests: parseInt(e.target.value) })}
                        className="w-full px-4 py-2 border border-gray-200 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#5B50BD]"
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6 flex justify-between">
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </Button>
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#5B50BD] hover:bg-[#4a41a0] text-white"
          >
            {isSaving ? (
              <span className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Saving...
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <Save className="w-4 h-4" />
                Save
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
