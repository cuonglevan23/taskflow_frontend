// Internationalization configuration for Next.js 15
export const i18nConfig = {
  defaultLocale: 'en',
  locales: ['en', 'vi', 'ko'],
  localePath: './config/i18n',
} as const;

// Optimized i18n configuration using next-intl
export { routing } from './routing';
export { Link, redirect, usePathname, useRouter } from './routing';

// Locale types
export type Locale = 'en' | 'vi' | 'ko';

// Language display names
export const languageNames: Record<Locale, string> = {
  en: 'English',
  vi: 'Tiếng Việt',
  ko: '한국어',
};

// Language metadata
export const languageMetadata: Record<Locale, {
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  currency: string;
  timeZone: string;
}> = {
  en: {
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸',
    dir: 'ltr',
    currency: 'USD',
    timeZone: 'America/New_York'
  },
  vi: {
    name: 'Vietnamese',
    nativeName: 'Tiếng Việt',
    flag: '🇻🇳',
    dir: 'ltr',
    currency: 'VND',
    timeZone: 'Asia/Ho_Chi_Minh'
  },
  ko: {
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷',
    dir: 'ltr',
    currency: 'KRW',
    timeZone: 'Asia/Seoul'
  }
};

// Helper functions
export const getLanguageDirection = (locale: Locale): 'ltr' | 'rtl' => {
  return languageMetadata[locale].dir;
};

export const detectLocale = (acceptLanguage?: string): Locale => {
  if (!acceptLanguage) return 'en';

  const browserLocales = acceptLanguage
    .split(',')
    .map(lang => lang.split(';')[0].trim().toLowerCase());

  for (const browserLocale of browserLocales) {
    if (browserLocale.startsWith('vi')) return 'vi';
    if (browserLocale.startsWith('ko')) return 'ko';
    if (browserLocale.startsWith('en')) return 'en';
  }

  return 'en';
};

// Default configuration
export const defaultLocale: Locale = 'en';
export const locales: readonly Locale[] = ['en', 'vi', 'ko'] as const;

export default i18nConfig;
