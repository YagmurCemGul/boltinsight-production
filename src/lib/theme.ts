'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useEffect } from 'react';

interface ThemeState {
  isDarkMode: boolean;
  useSystemPreference: boolean;
  _hasHydrated: boolean;
  toggleDarkMode: () => void;
  setDarkMode: (isDark: boolean) => void;
  setUseSystemPreference: (use: boolean) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      useSystemPreference: true, // Default to system preference
      _hasHydrated: false,

      toggleDarkMode: () => set((state) => ({
        isDarkMode: !state.isDarkMode,
        useSystemPreference: false, // User manually toggled, disable system preference
      })),

      setDarkMode: (isDark: boolean) => set(() => ({
        isDarkMode: isDark,
      })),

      setUseSystemPreference: (use: boolean) => set(() => ({
        useSystemPreference: use,
      })),

      setHasHydrated: (state: boolean) => {
        set({ _hasHydrated: state });
      },
    }),
    {
      name: 'boltinsight-theme',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);

// Helper function to apply theme with smooth transition
export function applyThemeWithTransition(isDark: boolean) {
  const html = document.documentElement;

  // Add transition class for smooth color changes
  html.classList.add('theme-transitioning');

  // Apply theme
  if (isDark) {
    html.classList.add('dark');
  } else {
    html.classList.remove('dark');
  }

  // Remove transition class after animation completes
  setTimeout(() => {
    html.classList.remove('theme-transitioning');
  }, 250);
}

// Enhanced hook to sync dark mode with DOM after hydration
// Includes system preference support
export function useThemeEffect() {
  const { isDarkMode, useSystemPreference, setDarkMode, _hasHydrated } = useThemeStore();

  // Handle system preference changes
  useEffect(() => {
    if (!_hasHydrated) return;

    // Mark as hydrated for FOIT prevention
    document.documentElement.classList.add('hydrated');

    if (useSystemPreference) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

      const handleChange = (e: MediaQueryListEvent) => {
        setDarkMode(e.matches);
        applyThemeWithTransition(e.matches);
      };

      // Set initial value from system preference
      if (mediaQuery.matches !== isDarkMode) {
        setDarkMode(mediaQuery.matches);
      }
      applyThemeWithTransition(mediaQuery.matches);

      // Listen for system preference changes
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Apply user's manual preference
      applyThemeWithTransition(isDarkMode);
    }
  }, [isDarkMode, useSystemPreference, setDarkMode, _hasHydrated]);
}

// Hook to get system preference info (useful for settings UI)
export function useSystemPreference() {
  const { useSystemPreference, setUseSystemPreference } = useThemeStore();

  return {
    useSystemPreference,
    enableSystemPreference: () => setUseSystemPreference(true),
    disableSystemPreference: () => setUseSystemPreference(false),
  };
}
