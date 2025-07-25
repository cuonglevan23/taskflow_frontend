import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { UserRole, Permission, ROLE_PERMISSIONS } from '@/constants/auth';
import { ROUTES, ROUTE_PATTERNS, getRouteByPath, hasRouteAccess } from '@/config/routes';

// Interface for user context
interface UserContext {
  id: string;
  role: UserRole;
  permissions: Permission[];
  isAuthenticated: boolean;
}

// Helper function to get user context from request
function getUserContext(request: NextRequest): UserContext | null {
  const token = request.cookies.get('token')?.value;
  const userRole = request.cookies.get('userRole')?.value as UserRole;
  const userId = request.cookies.get('userId')?.value;

  if (!token || !userRole || !userId) {
    return null;
  }

  return {
    id: userId,
    role: userRole,
    permissions: ROLE_PERMISSIONS[userRole] || [],
    isAuthenticated: true,
  };
}

// Helper function to match route patterns
function matchesPattern(pathname: string, patterns: string[]): boolean {
  return patterns.some(pattern => {
    // Convert Next.js dynamic routes to regex
    const regexPattern = pattern
      .replace(/\[([^\]]+)\]/g, '([^/]+)') // [id] -> ([^/]+)
      .replace(/\*$/, '.*'); // trailing * for catch-all
    
    const regex = new RegExp(`^${regexPattern}$`);
    return regex.test(pathname);
  });
}

// Main middleware function
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const userContext = getUserContext(request);

  // Handle API routes separately
  if (pathname.startsWith('/api/')) {
    return handleApiRoutes(request, userContext);
  }

  // Get route configuration
  const routeConfig = getRouteByPath(pathname) || findMatchingRoute(pathname);

  // Handle static files and special Next.js routes
  if (isStaticOrSpecialRoute(pathname)) {
    return NextResponse.next();
  }

  // Handle public routes
  if (routeConfig?.isPublic || matchesPattern(pathname, ROUTE_PATTERNS.PUBLIC)) {
    return NextResponse.next();
  }

  // Handle guest-only routes (auth pages)
  if (routeConfig?.requiresGuest || matchesPattern(pathname, ROUTE_PATTERNS.GUEST_ONLY)) {
    if (userContext?.isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Check authentication requirement for private routes
  if (routeConfig?.requiresAuth || routeConfig?.layout === 'private' || matchesPattern(pathname, ROUTE_PATTERNS.PRIVATE)) {
    if (!userContext?.isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Check route access permissions for authenticated users
  if (routeConfig && userContext) {
    const hasAccess = hasRouteAccess(routeConfig, userContext.role, userContext.permissions);
    
    if (!hasAccess) {
      // Redirect to dashboard for unauthorized access
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  // Add security headers
  const response = NextResponse.next();
  addSecurityHeaders(response, routeConfig);

  return response;
}

// Handle API route authentication and authorization
function handleApiRoutes(request: NextRequest, userContext: UserContext | null): NextResponse {
  const { pathname } = request.nextUrl;

  // Public API endpoints
  if (pathname.startsWith('/api/public') || pathname.startsWith('/api/auth')) {
    return NextResponse.next();
  }

  // Check authentication for protected API endpoints
  if (!userContext?.isAuthenticated) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    );
  }

  // Owner-only API endpoints
  if (pathname.startsWith('/api/owner')) {
    if (userContext.role !== UserRole.OWNER) {
      return NextResponse.json(
        { error: 'Owner access required' },
        { status: 403 }
      );
    }
  }

  // Manager-level API endpoints (PM and above)
  if (pathname.startsWith('/api/management')) {
    if (![UserRole.OWNER, UserRole.PM, UserRole.LEADER].includes(userContext.role)) {
      return NextResponse.json(
        { error: 'Management access required' },
        { status: 403 }
      );
    }
  }

  // Project management API endpoints
  if (pathname.startsWith('/api/projects')) {
    const requiredPermission = getApiPermission(pathname, request.method);
    if (requiredPermission && !userContext.permissions.includes(requiredPermission)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
  }

  // Task management API endpoints
  if (pathname.startsWith('/api/tasks')) {
    const requiredPermission = getApiPermission(pathname, request.method);
    if (requiredPermission && !userContext.permissions.includes(requiredPermission)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }
  }

  return NextResponse.next();
}

// Find matching route for dynamic paths
function findMatchingRoute(pathname: string): typeof ROUTES[keyof typeof ROUTES] | null {
  const routes = Object.values(ROUTES);
  
  for (const route of routes) {
    // Convert route path to regex pattern
    const pattern = route.path
      .replace(/\[([^\]]+)\]/g, '([^/]+)')
      .replace(/\*$/, '.*');
    
    const regex = new RegExp(`^${pattern}$`);
    if (regex.test(pathname)) {
      return route;
    }
  }
  
  return null;
}

// Check if route is static or special Next.js route
function isStaticOrSpecialRoute(pathname: string): boolean {
  const staticPaths = [
    '/favicon.ico',
    '/sitemap.xml',
    '/robots.txt',
    '/_next',
    '/_vercel',
    '/static',
    '/images',
    '/icons',
  ];
  
  return staticPaths.some(path => pathname.startsWith(path));
}

// Get required permission for API endpoints
function getApiPermission(pathname: string, method: string): Permission | null {
  // Project API permissions
  if (pathname.startsWith('/api/projects')) {
    switch (method) {
      case 'GET':
        return Permission.VIEW_PROJECT;
      case 'POST':
        return Permission.CREATE_PROJECT;
      case 'PUT':
      case 'PATCH':
        return Permission.UPDATE_PROJECT;
      case 'DELETE':
        return Permission.DELETE_PROJECT;
    }
  }
  
  // Task API permissions
  if (pathname.startsWith('/api/tasks')) {
    switch (method) {
      case 'GET':
        return Permission.VIEW_TASK;
      case 'POST':
        return Permission.CREATE_TASK;
      case 'PUT':
      case 'PATCH':
        return Permission.UPDATE_TASK;
      case 'DELETE':
        return Permission.DELETE_TASK;
    }
  }
  
  // User API permissions
  if (pathname.startsWith('/api/users')) {
    switch (method) {
      case 'GET':
        return Permission.VIEW_MEMBERS;
      case 'POST':
      case 'PUT':
      case 'PATCH':
        return Permission.MANAGE_USERS;
      case 'DELETE':
        return Permission.MANAGE_USERS;
    }
  }

  // Team management API permissions
  if (pathname.startsWith('/api/team')) {
    switch (method) {
      case 'GET':
        return Permission.VIEW_MEMBERS;
      case 'POST':
        return Permission.INVITE_USERS;
      case 'PUT':
      case 'PATCH':
        return Permission.MANAGE_TEAM;
      case 'DELETE':
        return Permission.MANAGE_TEAM;
    }
  }
  
  return null;
}

// Add security headers to response
function addSecurityHeaders(response: NextResponse, routeConfig?: typeof ROUTES[keyof typeof ROUTES] | null): void {
  // Basic security headers
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Enhanced CSP for private routes
  if (routeConfig?.layout === 'private') {
    response.headers.set(
      'Content-Security-Policy',
      "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
    );
  }
}

// Middleware configuration
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * 1. /api/auth/* (authentication routes)
     * 2. /static/* (static files)
     * 3. /_next/* (Next.js internals)
     * 4. /_proxy/* (special routes)
     * 5. /_vercel/* (Vercel internals)
     * 6. /favicon.ico, /sitemap.xml, /robots.txt (public files)
     */
    '/((?!api/auth|static|_next|_proxy|_vercel|favicon.ico|sitemap.xml|robots.txt).*)',
  ],
};
