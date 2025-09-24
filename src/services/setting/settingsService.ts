// Settings Service - Account Settings API integration
// Uses BaseApiClient for HTTP requests with proper error handling

import { BaseApiClient } from '@/lib/baseApiClient';
import {
  AccountSettings,
  UpdateAccountSettingsRequest
} from '@/types/settings';

export class SettingsService {
  /**
   * Get account settings including preferred language, theme and available options
   * GET /api/profile/account-settings
   */
  static async getAccountSettings(): Promise<AccountSettings> {
    try {
      return await BaseApiClient.get<AccountSettings>('/api/profile/account-settings');
    } catch (error) {
      console.error('Failed to get account settings:', error);
      throw error;
    }
  }

  /**
   * Update account settings (language and theme preferences)
   * PUT /api/profile/account-settings
   */
  static async updateAccountSettings(settings: UpdateAccountSettingsRequest): Promise<AccountSettings> {
    try {
      return await BaseApiClient.put<AccountSettings>('/api/profile/account-settings', settings);
    } catch (error) {
      console.error('Failed to update account settings:', error);
      throw error;
    }
  }

  /**
   * Update only language preference
   * Convenience method for updating just the language
   */
  static async updateLanguage(languageCode: string): Promise<AccountSettings> {
    try {
      // First get current settings to preserve theme
      const currentSettings = await this.getAccountSettings();

      return await this.updateAccountSettings({
        preferredLanguage: languageCode,
        preferredTheme: currentSettings.preferredTheme
      });
    } catch (error) {
      console.error('Failed to update language:', error);
      throw error;
    }
  }

  /**
   * Update only theme preference
   * Convenience method for updating just the theme
   */
  static async updateTheme(themeCode: string): Promise<AccountSettings> {
    try {
      // First get current settings to preserve language
      const currentSettings = await this.getAccountSettings();

      return await this.updateAccountSettings({
        preferredLanguage: currentSettings.preferredLanguage,
        preferredTheme: themeCode
      });
    } catch (error) {
      console.error('Failed to update theme:', error);
      throw error;
    }
  }
}

export default SettingsService;
