"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { Locale, defaultLocale, locales, languageNames, languageMetadata } from '../../config/i18n';
import SettingsService from '@/services/setting/settingsService';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  messages: Record<string, any>;
  isLoading: boolean;
  error: string | null;
  direction: 'ltr' | 'rtl';
  metadata: typeof languageMetadata[Locale];
  // Add service integration methods
  syncWithBackend: boolean;
  updateLanguageInBackend: (locale: Locale) => Promise<boolean>;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
  defaultLocale?: Locale;
  initialMessages?: Record<string, any>;
  enableBackendSync?: boolean; // Option to enable/disable backend sync
  isAuthenticated?: boolean; // Add auth check prop
}

export function LanguageProvider({
  children,
  defaultLocale: initialLocale = defaultLocale,
  initialMessages = {},
  enableBackendSync = true,
  isAuthenticated = false // Default to false for safety
}: LanguageProviderProps) {
  const [locale, setCurrentLocale] = useState<Locale>(initialLocale);
  const [messages, setMessages] = useState<Record<string, any>>(initialMessages);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load messages for a specific locale
  const loadMessages = async (targetLocale: Locale) => {
    try {
      setError(null);

      // Dynamic import of locale messages
      const messageModule = await import(`../../config/i18n/messages/${targetLocale}.json`);
      const localeMessages = messageModule.default || messageModule;

      setMessages(localeMessages);
    } catch (err) {
      console.error(`Failed to load messages for locale: ${targetLocale}`, err);
      setError(`Failed to load language pack: ${targetLocale}`);

      // Fallback to default locale if not already trying it
      if (targetLocale !== defaultLocale) {
        try {
          const fallbackModule = await import(`../../config/i18n/messages/${defaultLocale}.json`);
          const fallbackMessages = fallbackModule.default || fallbackModule;
          setMessages(fallbackMessages);
        } catch (fallbackErr) {
          console.error('Failed to load fallback messages:', fallbackErr);
          setMessages({});
        }
      }
    }
  };

  // Load initial language from backend - only if authenticated
  const loadInitialLanguageFromBackend = async () => {
    if (!enableBackendSync || !isAuthenticated) return null;

    try {
      const settings = await SettingsService.getAccountSettings();
      return settings.preferredLanguage?.toLowerCase() as Locale;
    } catch (err) {
      console.error('Failed to load language from backend:', err);
      return null;
    }
  };

  // Update language in backend - only if authenticated
  const updateLanguageInBackend = async (newLocale: Locale): Promise<boolean> => {
    if (!enableBackendSync || !isAuthenticated) return true;

    try {
      await SettingsService.updateLanguage(newLocale.toUpperCase());
      return true;
    } catch (err) {
      console.error('Failed to update language in backend:', err);
      setError('Failed to save language preference');
      return false;
    }
  };

  // Update locale with full sync (local + backend + messages)
  const updateLocale = async (newLocale: Locale) => {
    if (!locales.includes(newLocale)) {
      console.error(`Invalid locale: ${newLocale}`);
      return;
    }

    try {
      // 1. Update local state immediately for responsive UI
      setCurrentLocale(newLocale);

      // 2. Update localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem('user-locale', newLocale);
        document.documentElement.setAttribute('lang', newLocale);
        document.documentElement.setAttribute('dir', languageMetadata[newLocale].dir);
      }

      // 3. Load new messages
      await loadMessages(newLocale);

      // 4. Sync with backend (non-blocking)
      if (enableBackendSync) {
        updateLanguageInBackend(newLocale).catch(err => {
          console.error('Backend sync failed:', err);
          // Don't revert local changes if backend fails
        });
      }

    } catch (err) {
      setError('Failed to update language');
      console.error('Language update error:', err);
    }
  };

  // Initialize language from multiple sources (priority: backend > browser > default)
  useEffect(() => {
    const initializeLocale = async () => {
      setIsLoading(true);

      try {
        let targetLocale: Locale = initialLocale;

        // Priority 1: Try to get from backend if authenticated (highest priority)
        if (isAuthenticated) {
          const backendLocale = await loadInitialLanguageFromBackend();
          if (backendLocale && locales.includes(backendLocale)) {
            targetLocale = backendLocale;
          } else {
            // Priority 2: Browser language detection (fallback when backend fails)
            if (typeof window !== 'undefined') {
              const browserLang = navigator.language.toLowerCase();
              if (browserLang.startsWith('vi')) targetLocale = 'vi';
              else if (browserLang.startsWith('ko')) targetLocale = 'ko';
              else targetLocale = 'en';
            }
          }
        } else {
          // Priority 2: Browser language detection (when not authenticated)
          if (typeof window !== 'undefined') {
            const browserLang = navigator.language.toLowerCase();
            if (browserLang.startsWith('vi')) targetLocale = 'vi';
            else if (browserLang.startsWith('ko')) targetLocale = 'ko';
            else targetLocale = 'en';
          }
        }

        // Set locale
        setCurrentLocale(targetLocale);

        // Update DOM attributes
        if (typeof window !== 'undefined') {
          document.documentElement.setAttribute('lang', targetLocale);
          document.documentElement.setAttribute('dir', languageMetadata[targetLocale].dir);
        }

        // Load messages
        await loadMessages(targetLocale);

      } catch (err) {
        console.error('Locale initialization error:', err);
        setError('Failed to initialize language');

        // Fallback to default locale
        setCurrentLocale(defaultLocale);
        await loadMessages(defaultLocale);
      } finally {
        setIsLoading(false);
      }
    };

    initializeLocale();
  }, [initialLocale, enableBackendSync, isAuthenticated]);

  const contextValue: LanguageContextType = {
    locale,
    setLocale: updateLocale,
    messages,
    isLoading,
    error,
    direction: languageMetadata[locale]?.dir || 'ltr',
    metadata: languageMetadata[locale],
    syncWithBackend: enableBackendSync,
    updateLanguageInBackend
  };

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook to use language context
export function useLanguageContext(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguageContext must be used within a LanguageProvider');
  }
  return context;
}

// Export for backward compatibility
export const useLanguage = useLanguageContext;
