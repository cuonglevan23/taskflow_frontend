// Custom hook for managing account settings (language & theme)
import { useState, useEffect } from "react";
import SettingsService from "@/services/setting";
import { AccountSettings } from "@/types/settings";

export function useAccountSettings() {
  const [settings, setSettings] = useState<AccountSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load settings from API
  const loadSettings = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await SettingsService.getAccountSettings();
      setSettings(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load settings';
      setError(errorMessage);
      console.error('Failed to load account settings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Update language preference
  const updateLanguage = async (languageCode: string) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedSettings = await SettingsService.updateLanguage(languageCode);
      setSettings(updatedSettings);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update language';
      setError(errorMessage);
      console.error('Failed to update language:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Update theme preference
  const updateTheme = async (themeCode: string) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedSettings = await SettingsService.updateTheme(themeCode);
      setSettings(updatedSettings);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update theme';
      setError(errorMessage);
      console.error('Failed to update theme:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Update both language and theme
  const updateBothSettings = async (languageCode: string, themeCode: string) => {
    try {
      setUpdating(true);
      setError(null);
      const updatedSettings = await SettingsService.updateAccountSettings({
        preferredLanguage: languageCode,
        preferredTheme: themeCode
      });
      setSettings(updatedSettings);
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update settings';
      setError(errorMessage);
      console.error('Failed to update account settings:', err);
      return false;
    } finally {
      setUpdating(false);
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  // Retry loading settings
  const retry = () => {
    loadSettings();
  };

  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);

  return {
    settings,
    loading,
    updating,
    error,
    updateLanguage,
    updateTheme,
    updateBothSettings,
    clearError,
    retry,
    reload: loadSettings,
  };
}
