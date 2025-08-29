// Middleware - Backend JWT Authentication Only
import { NextRequest, NextResponse } from "next/server"

// Routes that require authentication
const protectedRoutes = [
  '/home',
  '/dashboard',
  '/my-tasks',
  '/tasks',
  '/projects',
  '/teams',
  '/portfolios',
  '/goals',
  '/reporting',
  '/admin',
  '/manager',
  '/role-demo',
  '/profile'
];

// Routes that should redirect to dashboard if authenticated
const authRoutes = ['/login', '/register'];

// Public routes (no auth required)
const publicRoutes = ['/', '/auth/success', '/auth/error'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, API routes, and _next
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.includes('.') ||
    pathname.startsWith('/favicon')
  ) {
    return NextResponse.next();
  }

  // Check if route is public
  const isPublicRoute = publicRoutes.includes(pathname);
  if (isPublicRoute) {
    return NextResponse.next();
  }

  // Check if route requires authentication
  const isProtectedRoute = protectedRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Check if route is auth route (login/register)
  const isAuthRoute = authRoutes.some(route =>
    pathname.startsWith(route)
  );

  // Get authentication status from HTTP-only cookie
  // Note: We can't read HTTP-only cookies in middleware
  // So we'll let the AuthProvider handle authentication checks
  const hasAccessToken = request.cookies.has('accessToken');

  // If trying to access protected route without token, redirect to login
  if (isProtectedRoute && !hasAccessToken) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // If trying to access auth route with token, redirect to home
  if (isAuthRoute && hasAccessToken) {
    const homeUrl = new URL('/home', request.url); // Thay đổi từ '/dashboard' thành '/home'
    return NextResponse.redirect(homeUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Match all routes except static files and API routes
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}