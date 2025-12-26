'use client';

import { useState } from 'react';
import { Menu, Bell, ArrowLeft, Search, X, Check, FileText, MessageSquare, UserCheck } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { useAppStore } from '@/lib/store';
import { useThemeStore } from '@/lib/theme';
import { Modal, Button, BoltLogo } from '@/components/ui';

interface MobileHeaderProps {
  onOpenMenu: () => void;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showSearch?: boolean;
}

// Mock notifications data
const mockNotifications = [
  { id: '1', type: 'approval', message: 'Your proposal "Brand Tracking Q1" was approved', time: new Date(Date.now() - 1000 * 60 * 30), read: false },
  { id: '2', type: 'comment', message: 'John added a comment on "Market Research"', time: new Date(Date.now() - 1000 * 60 * 60 * 2), read: false },
  { id: '3', type: 'mention', message: 'You were mentioned in a proposal discussion', time: new Date(Date.now() - 1000 * 60 * 60 * 24), read: true },
];

export function MobileHeader({
  onOpenMenu,
  title,
  showBack = false,
  onBack,
  showSearch = false
}: MobileHeaderProps) {
  const { activeSection, setActiveSection, currentProposal } = useAppStore();
  const { isDarkMode } = useThemeStore();
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);

  const unreadCount = notifications.filter(n => !n.read).length;

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval': return <UserCheck className="h-4 w-4 text-green-500" />;
      case 'comment': return <MessageSquare className="h-4 w-4 text-[#5B50BD]" />;
      default: return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };

  // Dynamic title based on activeSection
  const getTitle = () => {
    if (title) return title;

    switch (activeSection) {
      case 'new-proposal':
        return 'New Proposal';
      case 'view-proposal':
        return currentProposal?.content.title || 'View Proposal';
      case 'meta-learnings':
        return 'Meta Learnings';
      case 'moe-calculator':
        return 'Margin of Error';
      case 'demographics':
        return 'Demographics';
      case 'feasibility':
        return 'Feasibility Check';
      case 'library':
        return 'Library';
      case 'search-my':
        return 'My Proposals';
      case 'search-all':
        return 'All Proposals';
      default:
        if (activeSection.startsWith('project-')) {
          return 'Project';
        }
        return 'Dashboard';
    }
  };

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      setActiveSection('new-proposal');
    }
  };

  if (searchOpen) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 safe-area-top">
        <div className="flex items-center gap-2 px-3 h-full">
          <button
            onClick={() => setSearchOpen(false)}
            className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <input
            type="text"
            placeholder="Search proposals..."
            autoFocus
            className="flex-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-[#5B50BD]"
          />
        </div>
      </header>
    );
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 safe-area-top">
      <div className="flex items-center justify-between px-4 h-full">
        {/* Left Side */}
        <div className="flex items-center gap-2">
          {showBack ? (
            <button
              onClick={handleBack}
              className="rounded-lg p-2 -ml-2 text-gray-700 dark:text-gray-300 active:bg-gray-100 dark:active:bg-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          ) : (
            <button
              onClick={onOpenMenu}
              className="-ml-1 active:opacity-70"
            >
              <BoltLogo className="h-8 w-auto" variant={isDarkMode ? 'dark' : 'light'} />
            </button>
          )}
        </div>

        {/* Center - Title */}
        {(showBack || activeSection !== 'new-proposal') && (
          <h1 className="absolute left-1/2 -translate-x-1/2 font-semibold text-gray-900 dark:text-white truncate max-w-[50%]">
            {getTitle()}
          </h1>
        )}

        {/* Right Side */}
        <div className="flex items-center gap-1">
          {showSearch && (
            <button
              onClick={() => setSearchOpen(true)}
              className="rounded-lg p-2 text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={() => setNotificationsOpen(true)}
            className="rounded-lg p-2 text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800 relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500" />
            )}
          </button>
        </div>
      </div>

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
              <p className="text-gray-500 dark:text-gray-400">No notifications</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-80 overflow-y-auto">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'flex items-start gap-3 rounded-lg p-3 transition-colors border',
                    notification.read
                      ? 'bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700'
                      : 'bg-purple-50 dark:bg-purple-900/30 border-purple-200 dark:border-purple-700/50'
                  )}
                >
                  <div className="mt-0.5">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1 min-w-0">
                    <p className={cn(
                      'text-sm leading-relaxed',
                      notification.read
                        ? 'text-gray-600 dark:text-gray-300'
                        : 'text-gray-900 dark:text-gray-100 font-medium'
                    )}>
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      {formatDate(notification.time)}
                    </p>
                  </div>
                  {!notification.read && (
                    <span className="h-2 w-2 rounded-full bg-purple-500 dark:bg-purple-400 mt-2 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}

          <div className="pt-4 border-t dark:border-gray-700">
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
    </header>
  );
}
