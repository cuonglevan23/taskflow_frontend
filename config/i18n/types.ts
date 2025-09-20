// TypeScript types for optimized i18n with next-intl
import type { AbstractIntlMessages } from 'next-intl';

export type Messages = AbstractIntlMessages;

export type Locale = 'en' | 'vi' | 'ko';

// Get the type of nested keys from message object
export type MessageKeys<T = Messages, K extends keyof T = keyof T> = K extends string
  ? T[K] extends Record<string, any>
    ? T[K] extends AbstractIntlMessages
      ? `${K}` | `${K}.${MessageKeys<T[K]>}`
      : `${K}`
    : `${K}`
  : never;

// Translation function type
export type TranslationFunction = (
  key: MessageKeys,
  values?: Record<string, string | number | boolean | Date | null | undefined>,
  formats?: any
) => string;

// Locale configuration interface
export interface LocaleConfig {
  name: string;
  nativeName: string;
  flag: string;
  dir: 'ltr' | 'rtl';
  currency: string;
  timeZone: string;
}

// Component props with locale
export interface LocaleProps {
  params: {
    locale: Locale;
  };
}

// Page props with locale and searchParams
export interface PageProps extends LocaleProps {
  searchParams?: { [key: string]: string | string[] | undefined };
}

// Layout props with children and locale
export interface LayoutProps extends LocaleProps {
  children: React.ReactNode;
}
