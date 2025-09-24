"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getTheme, getCSSVariables, DEFAULT_THEME } from '../../config/theme';
import { ThemeMode, Theme, CSSVariables } from '../../config/theme/types';
import SettingsService from '@/services/setting/settingsService';

interface ThemeContextType {
  theme: Theme;
  themeMode: ThemeMode;
  setTheme: (mode: ThemeMode) => void;
  isLoading: boolean;
  error: string | null;
  syncWithBackend: boolean;
  updateThemeInBackend: (mode: ThemeMode) => Promise<boolean>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
  defaultTheme?: ThemeMode;
  enableBackendSync?: boolean;
  isAuthenticated?: boolean; // Add auth check prop
}

export function ThemeProvider({
  children,
  defaultTheme = 'dark',
  enableBackendSync = true,
  isAuthenticated = false // Default to false for safety
}: ThemeProviderProps) {
  const [themeMode, setThemeMode] = useState<ThemeMode>(defaultTheme);
  const [theme, setCurrentTheme] = useState<Theme>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Apply CSS variables to document root
  const applyCSSVariables = (variables: CSSVariables) => {
    if (typeof document !== 'undefined') {
      const root = document.documentElement;
      Object.entries(variables).forEach(([key, value]) => {
        root.style.setProperty(`--${key}`, value);
      });
    }
  };

  // Load initial theme from backend - only if authenticated
  const loadInitialThemeFromBackend = async (): Promise<ThemeMode | null> => {
    if (!enableBackendSync || !isAuthenticated) return null;

    try {
      const settings = await SettingsService.getAccountSettings();
      return (settings.preferredTheme?.toLowerCase() as ThemeMode) || null;
    } catch (err) {
      console.error('Failed to load theme from backend:', err);
      return null;
    }
  };

  // Update theme in backend - only if authenticated
  const updateThemeInBackend = async (mode: ThemeMode): Promise<boolean> => {
    if (!enableBackendSync || !isAuthenticated) return true;

    try {
      await SettingsService.updateTheme(mode.toUpperCase());
      return true;
    } catch (err) {
      console.error('Failed to update theme in backend:', err);
      setError('Failed to save theme preference');
      return false;
    }
  };

  // Update theme with full sync (local + backend + CSS)
  const updateTheme = async (mode: ThemeMode) => {
    try {
      setError(null);

      // Update local state
      setThemeMode(mode);
      const newTheme = getTheme(mode);
      setCurrentTheme(newTheme);

      // Apply CSS variables
      const cssVariables = getCSSVariables(mode);
      applyCSSVariables(cssVariables);

      // Update localStorage
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('theme-mode', mode);
      }

      // Sync with backend
      if (enableBackendSync) {
        await updateThemeInBackend(mode);
      }
    } catch (err) {
      console.error('Failed to update theme:', err);
      setError('Failed to update theme');
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    const initializeTheme = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Try to load from localStorage first
        let initialMode = defaultTheme;
        if (typeof localStorage !== 'undefined') {
          const savedMode = localStorage.getItem('theme-mode') as ThemeMode;
          if (savedMode && (savedMode === 'light' || savedMode === 'dark')) {
            initialMode = savedMode;
          }
        }

        // Only try to load from backend if authenticated
        if (isAuthenticated) {
          const backendMode = await loadInitialThemeFromBackend();
          if (backendMode) {
            initialMode = backendMode;
          }
        }

        // Apply the determined theme
        const initialTheme = getTheme(initialMode);
        setThemeMode(initialMode);
        setCurrentTheme(initialTheme);

        // Apply CSS variables
        const cssVariables = getCSSVariables(initialMode);
        applyCSSVariables(cssVariables);

        // Save to localStorage if different
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('theme-mode', initialMode);
        }
      } catch (err) {
        console.error('Failed to initialize theme:', err);
        setError('Failed to initialize theme');

        // Fallback to default theme
        const fallbackTheme = getTheme(defaultTheme);
        setThemeMode(defaultTheme);
        setCurrentTheme(fallbackTheme);
        const cssVariables = getCSSVariables(defaultTheme);
        applyCSSVariables(cssVariables);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTheme();
  }, [defaultTheme, enableBackendSync, isAuthenticated]); // Add isAuthenticated to dependencies

  // Listen for system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't explicitly set a preference
      const savedMode = localStorage.getItem('theme-mode');
      if (!savedMode) {
        const systemMode: ThemeMode = e.matches ? 'dark' : 'light';
        updateTheme(systemMode);
      }
    };

    mediaQuery.addEventListener('change', handleSystemThemeChange);
    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, []);

  const contextValue: ThemeContextType = {
    theme,
    themeMode,
    setTheme: updateTheme,
    isLoading,
    error,
    syncWithBackend: enableBackendSync,
    updateThemeInBackend,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext(): ThemeContextType {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
}
