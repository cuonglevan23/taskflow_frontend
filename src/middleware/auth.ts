import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole } from '@/constants/auth';

// Define protected routes patterns
const ADMIN_ROUTES = ['/admin/:path*'];
const AUTH_ROUTES = ['/dashboard/:path*', '/settings/:path*'];
const PUBLIC_ROUTES = ['/', '/about', '/pricing', '/contact'];
const AUTH_PAGES = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Get token and user role from cookies or headers
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('userRole')?.value as UserRole;

  // Check if it's an API route
  if (pathname.startsWith('/api/')) {
    return apiMiddleware(request, token, userRole);
  }

  // Public routes are accessible to everyone
  if (PUBLIC_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Auth pages are only accessible to non-authenticated users
  if (AUTH_PAGES.some(route => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Check authentication
  if (!token) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check admin routes
  if (ADMIN_ROUTES.some(route => pathname.startsWith(route))) {
    if (userRole !== UserRole.ADMIN) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Check authenticated routes
  if (AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

function apiMiddleware(
  request: NextRequest,
  token?: string,
  userRole?: UserRole
) {
  const { pathname } = request.nextUrl;

  // Public API endpoints
  if (pathname.startsWith('/api/public')) {
    return NextResponse.next();
  }

  // Check authentication for protected API endpoints
  if (!token) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Admin-only API endpoints
  if (pathname.startsWith('/api/admin') && userRole !== UserRole.ADMIN) {
    return NextResponse.json(
      { error: 'Admin access required' },
      { status: 403 }
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /static/* (static files)
     * 3. /_next/* (Next.js internals)
     * 4. /_proxy/* (special routes)
     * 5. /_vercel/* (Vercel internals)
     * 6. /favicon.ico, /sitemap.xml (public files)
     */
    '/((?!api/auth|static|_next|_proxy|_vercel|favicon.ico|sitemap.xml).*)',
  ],
};
