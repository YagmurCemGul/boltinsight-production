'use client';

import {
  Plus,
  Search,
  Brain,
  Library,
  Settings,
  Menu,
  FolderKanban,
  Calculator,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
}

const mainNavItems: NavItem[] = [
  { id: 'new-proposal', label: 'New', icon: Plus },
  { id: 'search-my', label: 'Search', icon: Search },
  { id: 'meta-learnings', label: 'Insights', icon: Brain },
  { id: 'library', label: 'Library', icon: Library },
  { id: 'more', label: 'More', icon: Menu },
];

interface MobileNavigationProps {
  onOpenMenu: () => void;
  hidden?: boolean;
}

export function MobileNavigation({ onOpenMenu, hidden = false }: MobileNavigationProps) {
  const { activeSection, setActiveSection } = useAppStore();

  const handleNavClick = (id: string) => {
    if (id === 'more') {
      onOpenMenu();
    } else {
      setActiveSection(id);
    }
  };

  const isActive = (id: string) => {
    if (id === 'more') return false;
    if (id === 'search-my') {
      return activeSection === 'search-my' || activeSection === 'search-all';
    }
    return activeSection === id;
  };

  return (
    <nav
      className={cn(
        'fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white dark:bg-gray-900 dark:border-gray-800 safe-area-bottom transition-transform duration-300',
        hidden ? 'translate-y-full' : 'translate-y-0'
      )}
    >
      <div className="flex items-center justify-around px-2 py-2">
        {mainNavItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavClick(item.id)}
            className={cn(
              'flex flex-col items-center justify-center min-w-[60px] py-1 px-2 rounded-lg transition-colors',
              isActive(item.id)
                ? 'text-[#5B50BD] dark:text-[#918AD3]'
                : 'text-gray-500 dark:text-gray-400 active:bg-gray-100 dark:active:bg-gray-800'
            )}
          >
            <item.icon
              className={cn(
                'h-6 w-6 mb-0.5',
                isActive(item.id) && item.id === 'new-proposal' && 'text-blue-600'
              )}
            />
            <span className="text-xs font-medium">{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}
