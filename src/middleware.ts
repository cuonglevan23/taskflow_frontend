// Next.js Middleware for Route Protection
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = [
  '/home',
  '/my-tasks',
  '/tasks',
  '/projects',
  '/teams',
  '/portfolios',
  '/goals',
  '/reporting',
  '/admin',
  '/role-demo'
];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get('access_token')?.value;
  const isAuthenticated = !!accessToken;

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Check if route is auth route
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/home', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - auth/callback (OAuth callback)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|auth/callback).*)',
  ],
};