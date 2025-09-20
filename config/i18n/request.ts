import { notFound } from 'next/navigation';
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!routing.locales.includes(locale as any)) notFound();

  return {
    messages: (await import(`./messages/${locale}.json`)).default,
    timeZone: getTimeZone(locale),
    now: new Date(),
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric'
        },
        medium: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric'
        }
      },
      number: {
        currency: {
          style: 'currency',
          currency: getCurrency(locale)
        }
      }
    }
  };
});

function getTimeZone(locale: string): string {
  switch (locale) {
    case 'vi':
      return 'Asia/Ho_Chi_Minh';
    case 'ko':
      return 'Asia/Seoul';
    case 'en':
    default:
      return 'America/New_York';
  }
}

function getCurrency(locale: string): string {
  switch (locale) {
    case 'vi':
      return 'VND';
    case 'ko':
      return 'KRW';
    case 'en':
    default:
      return 'USD';
  }
}
