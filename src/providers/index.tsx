// Providers index file - Export all providers and their hooks
export { ThemeProvider, useThemeContext, useTheme } from './ThemeProvider';
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
  enableBackendSync?: boolean; // Option to enable/disable backend sync globally
}

export function AppProviders({
  children,
  defaultTheme = 'dark',
  defaultLocale = 'en',
  enableBackendSync = true
}: AppProvidersProps) {
  return (
    <ThemeProvider
      defaultTheme={defaultTheme}
      enableBackendSync={enableBackendSync}
    >
      <LanguageProvider
        defaultLocale={defaultLocale}
        enableBackendSync={enableBackendSync}
      >
        {children}
      </LanguageProvider>
    </ThemeProvider>
  );
}
