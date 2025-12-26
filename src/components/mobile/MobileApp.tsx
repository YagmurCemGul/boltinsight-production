'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { MobileNavigation } from './MobileNavigation';
import { MobileSidebar } from './MobileSidebar';
import { MobileHeader } from './MobileHeader';
import { MobileLoginScreen } from './MobileLoginScreen';
import { MobileChatInterface } from './MobileChatInterface';
import { MobileProposalEditor } from './MobileProposalEditor';
import { MobileMetaLearnings } from './MobileMetaLearnings';
import { MobileLibrary } from './MobileLibrary';
import { MobileSearch } from './MobileSearch';
import { MobileMOECalculator, MobileDemographics, MobileFeasibility } from './MobileTools';

export function MobileApp() {
  const { isLoggedIn, activeSection, setActiveSection, currentProposal } = useAppStore();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<'chat' | 'editor'>('chat');
  const [navHidden, setNavHidden] = useState(false);
  const lastScrollY = useRef(0);
  const mainRef = useRef<HTMLDivElement>(null);

  // Generate a unique ID for each new proposal session
  const newProposalChatId = useMemo(() => `new-proposal-mobile-${Date.now()}`, []);

  const handleScroll = useCallback(() => {
    const currentScrollY = mainRef.current?.scrollTop || 0;
    const scrollDiff = currentScrollY - lastScrollY.current;

    // Only hide/show if scroll is significant (more than 10px)
    if (Math.abs(scrollDiff) > 10) {
      if (scrollDiff > 0 && currentScrollY > 50) {
        // Scrolling down - hide nav
        setNavHidden(true);
      } else {
        // Scrolling up - show nav
        setNavHidden(false);
      }
      lastScrollY.current = currentScrollY;
    }
  }, []);

  // If not logged in, show login screen
  if (!isLoggedIn) {
    return <MobileLoginScreen />;
  }

  // Determine if we need back button and which section we're in
  const needsBackButton = ['view-proposal', 'moe-calculator', 'demographics', 'feasibility'].includes(activeSection) ||
    activeSection.startsWith('project-');

  const handleBack = () => {
    if (activeSection === 'view-proposal') {
      setActiveSection('library');
    } else if (activeSection.startsWith('project-')) {
      setActiveSection('library');
    } else {
      setActiveSection('new-proposal');
    }
  };

  // Render content based on active section
  const renderContent = () => {
    switch (activeSection) {
      case 'new-proposal':
        if (editorMode === 'chat') {
          return <MobileChatInterface proposalId={newProposalChatId} onSwitchToEditor={() => setEditorMode('editor')} />;
        }
        return <MobileProposalEditor />;

      case 'view-proposal':
        return <MobileProposalEditor />;

      case 'search-my':
        return <MobileSearch mode="my" />;

      case 'search-all':
        return <MobileSearch mode="all" />;

      case 'meta-learnings':
        return <MobileMetaLearnings />;

      case 'moe-calculator':
        return <MobileMOECalculator />;

      case 'demographics':
        return <MobileDemographics />;

      case 'feasibility':
        return <MobileFeasibility />;

      case 'library':
        return <MobileLibrary />;

      default:
        if (activeSection.startsWith('project-')) {
          return <MobileLibrary />;
        }
        // Default to chat interface
        return <MobileChatInterface proposalId={newProposalChatId} onSwitchToEditor={() => setEditorMode('editor')} />;
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Mobile Header */}
      <MobileHeader
        onOpenMenu={() => setSidebarOpen(true)}
        showBack={needsBackButton}
        onBack={handleBack}
        showSearch={activeSection === 'search-my' || activeSection === 'search-all'}
      />

      {/* Mobile Sidebar (Slide-out menu) */}
      <MobileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main Content */}
      <main
        ref={mainRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto pt-16 pb-16"
      >
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      <MobileNavigation onOpenMenu={() => setSidebarOpen(true)} hidden={navHidden} />
    </div>
  );
}
