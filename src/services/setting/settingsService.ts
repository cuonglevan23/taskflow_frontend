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
   * Sử dụng endpoint có sẵn: GET /api/user-profiles/me (settings sẽ được include trong profile)
   */
  static async getAccountSettings(): Promise<AccountSettings> {
    try {
      // Tạm thời sử dụng profile endpoint để lấy settings
      const profile = await BaseApiClient.get<any>('/api/user-profiles/me');

      // Map từ profile response sang AccountSettings format
      return {
        preferredLanguage: profile.preferredLanguage || 'en',
        theme: profile.theme || 'light',
        // Có thể thêm các settings khác từ profile
        ...profile.settings
      };
    } catch (error) {
      console.error('Failed to get account settings:', error);
      throw error;
    }
  }

  /**
   * Update account settings (language and theme preferences)
   * Sử dụng endpoint có sẵn: PUT /api/user-profiles/me
   */
  static async updateAccountSettings(settings: UpdateAccountSettingsRequest): Promise<AccountSettings> {
    try {
      // Update profile với settings mới
      const updatedProfile = await BaseApiClient.put<any>('/api/user-profiles/me', {
        preferredLanguage: settings.preferredLanguage,
        theme: settings.theme,
        settings: settings
      });

      // Return formatted settings
      return {
        preferredLanguage: updatedProfile.preferredLanguage || settings.preferredLanguage,
        theme: updatedProfile.theme || settings.theme,
        ...updatedProfile.settings
      };
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
