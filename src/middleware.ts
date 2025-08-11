import { auth } from "@/auth"
import { NextResponse } from "next/server"
import { UserRole } from "@/constants/auth"

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

// Admin-only routes
const adminRoutes = ['/admin'];

// Owner-only routes
const ownerRoutes = ['/admin/system'];

export default auth((req) => {
  const { nextUrl } = req
  const isLoggedIn = !!req.auth
  const userRole = req.auth?.user?.role

  // Check if route is protected
  const isProtectedRoute = protectedRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );

  // Check if route is auth route
  const isAuthRoute = authRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );

  // Check if route requires admin access
  const isAdminRoute = adminRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );

  // Check if route requires owner access
  const isOwnerRoute = ownerRoutes.some(route => 
    nextUrl.pathname.startsWith(route)
  );

  // Redirect unauthenticated users from protected routes
  if (isProtectedRoute && !isLoggedIn) {
    const loginUrl = new URL('/login', nextUrl)
    loginUrl.searchParams.set('callbackUrl', nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Redirect authenticated users from auth routes
  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/home', nextUrl))
  }

  // Check admin access
  if (isAdminRoute && isLoggedIn) {
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.SUPER_ADMIN && userRole !== UserRole.OWNER) {
      return NextResponse.redirect(new URL('/home', nextUrl))
    }
  }

  // Check owner access
  if (isOwnerRoute && isLoggedIn) {
    if (userRole !== UserRole.OWNER && userRole !== UserRole.SUPER_ADMIN) {
      return NextResponse.redirect(new URL('/home', nextUrl))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
}