// Providers index file - Export all providers and their hooks
export { ThemeProvider, useThemeContext } from './ThemeProvider';
export { LanguageProvider, useLanguageContext, useLanguage } from './LanguageProvider';

// Combined Provider for easy setup
import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { LanguageProvider } from './LanguageProvider';
import { ThemeMode } from '../../config/theme/types';
import { Locale } from '../../config/i18n';

interface AppProvidersProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultLocale?: Locale;
  enableBackendSync?: boolean;
  isAuthenticated?: boolean;
  isAuthLoading?: boolean;
}

export function AppProviders({
  children,
  defaultTheme = 'dark',
  defaultLocale = 'en',
  enableBackendSync = true,
  isAuthenticated = false,
  isAuthLoading = true
}: AppProvidersProps) {
  // Only enable backend sync when auth is loaded and optionally when authenticated
  const shouldSyncWithBackend = enableBackendSync && !isAuthLoading;

  return (
    <ThemeProvider
      defaultTheme={defaultTheme}
      enableBackendSync={shouldSyncWithBackend}
      isAuthenticated={isAuthenticated}
    >
      <LanguageProvider
        defaultLocale={defaultLocale}
        enableBackendSync={shouldSyncWithBackend}
        isAuthenticated={isAuthenticated}
      >
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
