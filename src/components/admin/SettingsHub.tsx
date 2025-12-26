'use client';

import {
  Settings,
  Shield,
  Palette,
  Bell,
  Lock,
  Globe,
  ArrowRight,
  ChevronRight,
  Users,
  Key,
  UserCircle,
  SlidersHorizontal,
  LayoutDashboard,
  Terminal,
  Server,
  Sparkles,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { Card, CardContent, Badge } from '@/components/ui';

interface SettingsCategory {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  section: string;
  color: string;
  badge?: string;
  adminOnly?: boolean;
}

const SETTINGS_CATEGORIES: SettingsCategory[] = [
  {
    id: 'profile',
    label: 'Profile & Account',
    description: 'Manage your personal information, password, and notification preferences.',
    icon: <UserCircle className="w-6 h-6" />,
    section: 'settings',
    color: 'bg-[#5B50BD]',
  },
  {
    id: 'system-settings',
    label: 'System Settings',
    description: 'Configure site-wide preferences, appearance, and performance settings.',
    icon: <SlidersHorizontal className="w-6 h-6" />,
    section: 'system-settings',
    color: 'bg-[#3B82F6]',
    adminOnly: true,
  },
  {
    id: 'admin-dashboard',
    label: 'Admin Dashboard',
    description: 'View user activities, manage proposals, and monitor system health.',
    icon: <LayoutDashboard className="w-6 h-6" />,
    section: 'admin-dashboard',
    color: 'bg-[#1ED6BB]',
    adminOnly: true,
  },
  {
    id: 'developer-dashboard',
    label: 'Developer Dashboard',
    description: 'Access API logs, token usage, and developer tools.',
    icon: <Terminal className="w-6 h-6" />,
    section: 'developer-dashboard',
    color: 'bg-[#F59E0B]',
    adminOnly: true,
  },
];

// Quick settings items
const QUICK_SETTINGS = [
  { id: 'appearance', label: 'Appearance', description: 'Dark mode, colors, layout', icon: <Palette className="w-5 h-5" />, section: 'system-settings', color: 'bg-[#5B50BD]' },
  { id: 'notifications', label: 'Notifications', description: 'Email and push settings', icon: <Bell className="w-5 h-5" />, section: 'settings', color: 'bg-[#EF4444]' },
  { id: 'security', label: 'Security', description: 'Password, 2FA, sessions', icon: <Lock className="w-5 h-5" />, section: 'system-settings', color: 'bg-[#1ED6BB]' },
  { id: 'performance', label: 'Performance', description: 'Cache, optimization', icon: <Sparkles className="w-5 h-5" />, section: 'system-settings', color: 'bg-[#EAB308]' },
];

// Admin tools
const ADMIN_TOOLS = [
  { id: 'users', label: 'User Management', description: 'Manage users and roles', icon: <Users className="w-5 h-5" />, section: 'admin-dashboard', color: 'bg-[#5B50BD]' },
  { id: 'api', label: 'API Settings', description: 'Configure API keys', icon: <Key className="w-5 h-5" />, section: 'developer-dashboard', color: 'bg-[#EC4899]' },
  { id: 'examples', label: 'Example Proposals', description: 'Manage RAG documents', icon: <Layers className="w-5 h-5" />, section: 'example-proposals', color: 'bg-[#10B981]' },
  { id: 'database', label: 'Data Management', description: 'Database and backups', icon: <Server className="w-5 h-5" />, section: 'developer-dashboard', color: 'bg-[#6366F1]' },
];

export function SettingsHub() {
  const { setActiveSection, currentUser } = useAppStore();

  const isAdmin = ['admin', 'manager', 'developer'].includes(currentUser.role);

  const handleCategoryClick = (section: string) => {
    setActiveSection(section);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="w-6 h-6 text-[#5B50BD]" />
              Settings Hub
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Manage your account, preferences, and system configuration
            </p>
          </div>
          <Badge variant="info" className="capitalize">
            {currentUser.role}
          </Badge>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {/* Main Categories */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {SETTINGS_CATEGORIES.filter(c => !c.adminOnly || isAdmin).map((category) => (
            <Card
              key={category.id}
              className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-[#5B50BD]/30"
              onClick={() => handleCategoryClick(category.section)}
            >
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className={cn('p-3 rounded-xl text-white', category.color)}>
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white group-hover:text-[#5B50BD] transition-colors">
                        {category.label}
                      </h3>
                      {category.adminOnly && (
                        <Badge variant="warning" className="text-xs">Admin</Badge>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {category.description}
                    </p>

                    {/* Action */}
                    <div className="mt-4 flex items-center text-sm font-medium text-[#5B50BD] group-hover:gap-2 transition-all">
                      <span>Open</span>
                      <ArrowRight className="w-4 h-4 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Settings */}
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Settings</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
          {QUICK_SETTINGS.map((item) => {
            const colorHex = item.color.match(/#[A-Fa-f0-9]{6}/)?.[0] || '#5B50BD';
            return (
              <button
                key={item.id}
                onClick={() => handleCategoryClick(item.section)}
                className="flex items-center gap-3 p-4 bg-white dark:bg-gray-800 rounded-xl border hover:shadow-sm transition-all text-left group"
                style={{ borderColor: '#e5e7eb' }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = colorHex}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#e5e7eb'}
              >
                <div
                  className="p-2 rounded-lg transition-colors"
                  style={{ backgroundColor: `${colorHex}15`, color: colorHex }}
                >
                  {item.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            );
          })}
        </div>

        {/* Admin Tools (only visible to admins) */}
        {isAdmin && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-[#5B50BD]" />
              Admin Tools
            </h2>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 mb-8">
              {ADMIN_TOOLS.map((item) => {
                const colorHex = item.color.match(/#[A-Fa-f0-9]{6}/)?.[0] || '#5B50BD';
                return (
                  <button
                    key={item.id}
                    onClick={() => handleCategoryClick(item.section)}
                    className="flex items-center gap-3 p-4 rounded-xl border hover:shadow-sm transition-all text-left group bg-white dark:bg-gray-800"
                    style={{ borderColor: `${colorHex}40` }}
                    onMouseEnter={(e) => e.currentTarget.style.borderColor = colorHex}
                    onMouseLeave={(e) => e.currentTarget.style.borderColor = `${colorHex}40`}
                  >
                    <div
                      className="p-2 rounded-lg"
                      style={{ backgroundColor: `${colorHex}20`, color: colorHex }}
                    >
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.label}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{item.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                );
              })}
            </div>
          </>
        )}

        {/* Help Section */}
        <div className="bg-gradient-to-br from-[#5B50BD]/5 to-[#1ED6BB]/5 rounded-xl p-6 border border-[#5B50BD]/20">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-[#5B50BD] rounded-xl text-white">
              <Globe className="w-6 h-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Need Help?
              </h3>
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                If you need assistance with any settings or have questions about your account,
                check out our help center or contact support.
              </p>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-[#5B50BD] hover:text-[#5B50BD] transition-colors"
                >
                  View Documentation
                </button>
                <button
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-[#5B50BD] hover:text-[#5B50BD] transition-colors"
                >
                  Contact Support
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
