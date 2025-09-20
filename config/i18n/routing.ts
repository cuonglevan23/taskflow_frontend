import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['en', 'vi', 'ko'],

  // Used when no locale matches
  defaultLocale: 'en',

  // All paths are the same for all locales - English only
  pathnames: {
    '/': '/',
    '/login': '/login',
    '/register': '/register',
    '/dashboard': '/dashboard',
    '/tasks': '/tasks',
    '/projects': '/projects',
    '/teams': '/teams',
    '/calendar': '/calendar',
    '/settings': '/settings',
    '/home': '/home',
    '/my-tasks': '/my-tasks',
    '/portfolios': '/portfolios',
    '/goals': '/goals',
    '/admin': '/admin',
    '/profile': '/profile'
  }
});

export const { Link, redirect, usePathname, useRouter } = createNavigation(routing);
