// Types for Account Settings API

export interface LanguageOption {
  code: string;
  displayName: string;
  isSelected: boolean;
}

export interface ThemeOption {
  code: string;
  displayName: string;
  isSelected: boolean;
}

export interface AccountSettings {
  preferredLanguage: string;
  preferredTheme: string;
  availableLanguages: LanguageOption[];
  availableThemes: ThemeOption[];
}

export interface UpdateAccountSettingsRequest {
  preferredLanguage: string;
  preferredTheme: string;
}

// Enum for language codes
export enum LanguageCode {
  EN = 'EN',
  KO = 'KO',
  VI = 'VI'
}

// Enum for theme codes
export enum ThemeCode {
  DARK = 'DARK',
  LIGHT = 'LIGHT'
}
