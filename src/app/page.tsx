'use client';

import { MainContent } from '@/components/MainContent';
import { LoginScreen } from '@/components/auth';
import { ToastContainer } from '@/components/ui';
import { MobileApp } from '@/components/mobile';
import { useAppStore } from '@/lib/store';
import { useThemeEffect } from '@/lib/theme';
import { useIsMobile } from '@/hooks';

export default function Home() {
  const { isLoggedIn, setLoggedIn } = useAppStore();
  const isMobile = useIsMobile();

  // Apply dark mode after hydration
  useThemeEffect();

  // Mobile version - completely separate UI
  if (isMobile) {
    return (
      <>
        <MobileApp />
        <ToastContainer />
      </>
    );
  }

  // Desktop version - original code unchanged
  if (!isLoggedIn) {
    return (
      <>
        <LoginScreen onLogin={() => setLoggedIn(true)} />
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <MainContent />
      <ToastContainer />
    </>
  );
}
