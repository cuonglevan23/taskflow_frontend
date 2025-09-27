// Combined Provider for easy setup
'use client';

import React from 'react';
import { ThemeProvider } from './ThemeProvider';
import { LanguageProvider } from './LanguageProvider';
import { PremiumProvider } from './PremiumProvider';
import { useAuth } from '@/components/auth/AuthProvider';
import { ThemeMode } from '../../config/theme/types';
import { Locale } from '../../config/i18n';

// Providers index file - Export all providers and their hooks
export { ThemeProvider, useThemeContext } from './ThemeProvider';
export { LanguageProvider, useLanguageContext, useLanguage } from './LanguageProvider';
export { PremiumProvider, usePremium } from './PremiumProvider';

interface AppProvidersProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  defaultLocale?: Locale;
  enableBackendSync?: boolean;
}

export function AppProviders({
  children,
  defaultTheme = 'dark',
  defaultLocale = 'en',
  enableBackendSync = true,
}: AppProvidersProps) {
  // ✅ FIX: Use actual authentication state from AuthProvider
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // Only enable backend sync when user is actually authenticated and auth is loaded
  const shouldSyncWithBackend = enableBackendSync && !authLoading && isAuthenticated;

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
        <PremiumProvider>
          {children}
        </PremiumProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}
