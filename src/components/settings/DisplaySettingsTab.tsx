"use client";

import React, { useState, useEffect } from "react";
import { useAccountSettings } from "@/hooks/settings";
import { useThemeContext } from "@/providers/ThemeProvider";
import { useLanguageContext } from "@/providers/LanguageProvider";
import { Button } from "@/components/ui";

interface DisplaySettingsTabProps {
  // Remove theme prop as we now get it from context
}

export default function DisplaySettingsTab({}: DisplaySettingsTabProps) {
  // Use contexts instead of props - now with backend integration
  const { theme, themeMode, setTheme, isLoading: themeLoading, error: themeError } = useThemeContext();
  const { locale, setLocale, messages, isLoading: languageLoading, error: languageError } = useLanguageContext();

  // Keep useAccountSettings for form data and available options
  const {
    settings, // Contains availableLanguages and availableThemes from backend
    loading: settingsLoading,
    updating,
    error: settingsError,
    clearError,
    retry,
    updateBothSettings
  } = useAccountSettings();

  // Local form state - synced with Provider contexts
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedTheme, setSelectedTheme] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Helper function to get translated text
  const t = (key: string): string => {
    const keys = key.split('.');
    let value: any = messages;
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  // Sync form state with Provider contexts and check for changes
  useEffect(() => {
    if (locale) {
      const currentLanguage = locale.toUpperCase();
      setSelectedLanguage(currentLanguage);

      // Check if different from backend settings
      const backendLanguage = settings?.preferredLanguage?.toUpperCase();
      const languageChanged = backendLanguage && backendLanguage !== currentLanguage;
      const themeChanged = selectedTheme && settings?.preferredTheme && selectedTheme !== settings.preferredTheme.toUpperCase();
      setHasChanges(Boolean(languageChanged || themeChanged));
    }
  }, [locale, settings, selectedTheme]);

  useEffect(() => {
    if (themeMode) {
      const currentTheme = themeMode.toUpperCase();
      setSelectedTheme(currentTheme);

      // Check if different from backend settings
      const backendTheme = settings?.preferredTheme?.toUpperCase();
      const themeChanged = backendTheme && backendTheme !== currentTheme;
      const languageChanged = selectedLanguage && settings?.preferredLanguage && selectedLanguage !== settings.preferredLanguage.toUpperCase();
      setHasChanges(Boolean(themeChanged || languageChanged));
    }
  }, [themeMode, settings, selectedLanguage]);

  // Handle language change - use Provider method (includes backend sync)
  const handleLanguageChange = async (newLanguage: string) => {
    setSelectedLanguage(newLanguage);
    setHasChanges(true);

    // Update via Provider (includes backend sync)
    const languageCode = newLanguage.toLowerCase() as 'en' | 'vi' | 'ko';
    setLocale(languageCode);
  };

  // Handle theme change - use Provider method (includes backend sync)
  const handleThemeChange = async (newTheme: string) => {
    setSelectedTheme(newTheme);
    setHasChanges(true);

    // Update via Provider (includes backend sync)
    const themeMode = newTheme.toLowerCase() as 'light' | 'dark';
    setTheme(themeMode);
  };

  // Save changes - now actually sends data to backend
  const handleSaveChanges = async () => {
    try {
      if (!hasChanges) {
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
        return;
      }

      // Send both settings to backend - backend expects UPPERCASE values
      const languageCode = selectedLanguage.toUpperCase(); // VI, EN, KO
      const themeCode = selectedTheme.toUpperCase();       // LIGHT, DARK

      const success = await updateBothSettings(languageCode, themeCode);

      if (success) {
        setHasChanges(false);
        setSaveSuccess(true);

        // Also update providers to ensure UI is in sync (providers expect lowercase)
        setLocale(selectedLanguage.toLowerCase() as 'en' | 'vi' | 'ko');
        setTheme(selectedTheme.toLowerCase() as 'light' | 'dark');

        // Clear success message after 3 seconds
        setTimeout(() => setSaveSuccess(false), 3000);
      }
    } catch (error) {
      console.error('Save changes error:', error);
    }
  };

  // Combine loading states
  const isLoading = themeLoading || languageLoading || settingsLoading;

  // Combine error states
  const error = themeError || languageError || settingsError;

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-6">
          <div className="space-y-2">
            <div className="h-6 bg-gray-300 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
            <div className="space-y-2">
              <div className="h-8 bg-gray-200 rounded"></div>
              <div className="h-8 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div
          className="p-4 rounded-lg border border-red-300 bg-red-50"
          style={{
            backgroundColor: theme.status?.error || '#fef2f2',
            borderColor: theme.border?.default || '#fca5a5',
            color: theme.text?.primary || '#dc2626'
          }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="font-medium">{t('settings.errorLoading')}</p>
              <p className="text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={clearError}
              className="text-sm opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
          <button
            onClick={retry}
            className="mt-3 px-3 py-1 text-sm rounded border hover:bg-opacity-80"
            style={{
              backgroundColor: theme.background?.primary || '#ffffff',
              borderColor: theme.border?.default || '#d1d5db',
              color: theme.text?.primary || '#374151'
            }}
          >
            {t('settings.retry')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div>
        <h3
          className="text-lg font-semibold mb-2"
          style={{ color: theme.text?.primary || '#374151' }}
        >
          {t('settings.displayPreferences')}
        </h3>
        <p
          className="text-sm"
          style={{ color: theme.text?.secondary || '#6b7280' }}
        >
          {t('settings.customizeLanguageTheme')}
        </p>
      </div>

      {/* Success Message */}
      {saveSuccess && (
        <div
          className="p-3 rounded-lg border"
          style={{
            backgroundColor: theme.status?.success || '#f0fdf4',
            borderColor: '#22c55e',
            color: '#15803d'
          }}
        >
          <p className="text-sm font-medium">✓ {t('settings.savedSuccessfully')}</p>
        </div>
      )}

      {/* Language Settings */}
      <div className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-3"
            style={{ color: theme.text?.primary || '#374151' }}
          >
            {t('settings.language')}
          </label>
          <p
            className="text-xs mb-4"
            style={{ color: theme.text?.secondary || '#6b7280' }}
          >
            {t('settings.selectLanguage')}
          </p>
        </div>

        <div className="space-y-3">
          {settings?.availableLanguages?.map((language) => {
            const isSelected = selectedLanguage === language.code.toUpperCase();

            return (
              <label
                key={language.code}
                className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-opacity-50 transition-colors"
                style={{
                  borderColor: isSelected
                    ? '#3b82f6'
                    : theme.border?.default || '#d1d5db',
                  backgroundColor: isSelected
                    ? (theme.background?.secondary || '#eff6ff')
                    : 'transparent'
                }}
              >
                <input
                  type="radio"
                  name="language"
                  value={language.code.toUpperCase()}
                  checked={isSelected}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  disabled={updating}
                  className="w-4 h-4"
                  style={{ accentColor: '#3b82f6' }}
                />
                <div className="flex-1">
                  <span
                    className="font-medium"
                    style={{ color: theme.text?.primary || '#374151' }}
                  >
                    {t(`languages.${language.code.toLowerCase()}`) || language.displayName}
                  </span>
                  <p
                    className="text-xs mt-1"
                    style={{ color: theme.text?.secondary || '#6b7280' }}
                  >
                    {language.code.toUpperCase()}
                  </p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Theme Settings */}
      <div className="space-y-4">
        <div>
          <label
            className="block text-sm font-medium mb-3"
            style={{ color: theme.text?.primary || '#374151' }}
          >
            {t('settings.theme')}
          </label>
          <p
            className="text-xs mb-4"
            style={{ color: theme.text?.secondary || '#6b7280' }}
          >
            {t('settings.chooseTheme')}
          </p>
        </div>

        <div className="space-y-3">
          {settings?.availableThemes?.map((themeOption) => {
            const isSelected = selectedTheme === themeOption.code.toUpperCase();

            return (
              <label
                key={themeOption.code}
                className="flex items-center space-x-3 p-3 rounded-lg border cursor-pointer hover:bg-opacity-50 transition-colors"
                style={{
                  borderColor: isSelected
                    ? '#3b82f6'
                    : theme.border?.default || '#d1d5db',
                  backgroundColor: isSelected
                    ? (theme.background?.secondary || '#eff6ff')
                    : 'transparent'
                }}
              >
                <input
                  type="radio"
                  name="theme"
                  value={themeOption.code.toUpperCase()}
                  checked={isSelected}
                  onChange={(e) => handleThemeChange(e.target.value)}
                  disabled={updating}
                  className="w-4 h-4"
                  style={{ accentColor: '#3b82f6' }}
                />
                <div className="flex-1">
                  <span
                    className="font-medium"
                    style={{ color: theme.text?.primary || '#374151' }}
                  >
                    {t(`themes.${themeOption.code.toLowerCase()}`) || themeOption.displayName}
                  </span>
                  <div className="flex items-center mt-1">
                    <div
                      className="w-4 h-4 rounded-full mr-2 border"
                      style={{
                        backgroundColor: themeOption.code.toLowerCase() === 'dark' ? '#1f2937' : '#ffffff',
                        borderColor: theme.border?.default || '#d1d5db'
                      }}
                    />
                    <p
                      className="text-xs"
                      style={{ color: theme.text?.secondary || '#6b7280' }}
                    >
                      {themeOption.code.toLowerCase() === 'dark'
                        ? t('settings.darkAppearance')
                        : t('settings.lightAppearance')
                      }
                    </p>
                  </div>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Real-time Status - shows Provider sync status */}
      {(updating) && (
        <div
          className="flex items-center space-x-2 p-3 rounded-lg"
          style={{
            backgroundColor: theme.background?.muted || '#f9fafb',
            color: theme.text?.secondary || '#6b7280'
          }}
        >
          <div className="w-4 h-4 border-2 border-t-transparent rounded-full animate-spin"
               style={{ borderColor: '#3b82f6', borderTopColor: 'transparent' }}>
          </div>
          <span className="text-sm">{t('settings.savingPreferences')}</span>
        </div>
      )}

      {/* Manual Save Button - now optional since auto-sync via Providers */}
      <div className="pt-4 border-t" style={{ borderColor: theme.border?.default }}>
        <div className="flex justify-between items-center">
          <p className="text-xs text-gray-500">
            Changes are automatically saved
          </p>
          <Button
            onClick={handleSaveChanges}
            disabled={updating}
            variant="default"
            size="default"
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {t('settings.savePreferences')}
          </Button>
        </div>
      </div>
    </div>
  );
}
