// Reusable Authentication Middleware for API Routes
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';
import { UserRole, Permission } from '@/constants/auth';

// User context interface
export interface AuthenticatedUser {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  permissions: Permission[];
}

// Middleware result interface
export interface AuthMiddlewareResult {
  success: boolean;
  user?: AuthenticatedUser;
  error?: {
    message: string;
    status: number;
  };
}

// Authentication middleware function
export async function withAuth(request: NextRequest): Promise<AuthMiddlewareResult> {
  try {
    const session = await auth();
    
    if (!session || !session.user) {
      return {
        success: false,
        error: {
          message: 'Authentication required',
          status: 401
        }
      };
    }

    // Transform session user to our format
    const user: AuthenticatedUser = {
      id: session.user.id || session.user.email || 'unknown',
      email: session.user.email || '',
      name: session.user.name || 'Unknown User',
      role: session.user.role || UserRole.MEMBER,
      permissions: session.user.permissions || []
    };

    return {
      success: true,
      user
    };
  } catch (error) {
    console.error('Authentication middleware error:', error);
    return {
      success: false,
      error: {
        message: 'Authentication failed',
        status: 500
      }
    };
  }
}

// Role-based authorization middleware
export async function withRole(
  request: NextRequest, 
  requiredRoles: UserRole[]
): Promise<AuthMiddlewareResult> {
  const authResult = await withAuth(request);
  
  if (!authResult.success || !authResult.user) {
    return authResult;
  }

  if (!requiredRoles.includes(authResult.user.role)) {
    return {
      success: false,
      error: {
        message: 'Insufficient permissions',
        status: 403
      }
    };
  }

  return authResult;
}

// Permission-based authorization middleware
export async function withPermission(
  request: NextRequest,
  requiredPermissions: Permission[]
): Promise<AuthMiddlewareResult> {
  const authResult = await withAuth(request);
  
  if (!authResult.success || !authResult.user) {
    return authResult;
  }

  const hasPermission = requiredPermissions.some(permission =>
    authResult.user!.permissions.includes(permission)
  );

  if (!hasPermission) {
    return {
      success: false,
      error: {
        message: 'Insufficient permissions',
        status: 403
      }
    };
  }

  return authResult;
}

// Admin-only middleware
export async function withAdmin(request: NextRequest): Promise<AuthMiddlewareResult> {
  return withRole(request, [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.OWNER]);
}

// Owner-only middleware
export async function withOwner(request: NextRequest): Promise<AuthMiddlewareResult> {
  return withRole(request, [UserRole.OWNER]);
}

// Manager-level middleware (PM and above)
export async function withManager(request: NextRequest): Promise<AuthMiddlewareResult> {
  return withRole(request, [UserRole.OWNER, UserRole.PM, UserRole.LEADER]);
}

// Helper function to create error response
export function createAuthErrorResponse(error: { message: string; status: number }): NextResponse {
  return NextResponse.json(
    { error: error.message },
    { 
      status: error.status,
      headers: {
        'Content-Type': 'application/json',
      }
    }
  );
}

// Higher-order function to wrap API handlers with authentication
export function withAuthHandler(
  handler: (request: NextRequest, user: AuthenticatedUser) => Promise<NextResponse>,
  authMiddleware: (request: NextRequest) => Promise<AuthMiddlewareResult> = withAuth
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await authMiddleware(request);
    
    if (!authResult.success || !authResult.user) {
      return createAuthErrorResponse(authResult.error!);
    }

    try {
      return await handler(request, authResult.user);
    } catch (error) {
      console.error('API handler error:', error);
      return NextResponse.json(
        { error: 'Internal server error' },
        { status: 500 }
      );
    }
  };
}

// Specific middleware combinations for common use cases
export const withTaskPermissions = (request: NextRequest) => 
  withPermission(request, [Permission.VIEW_TASK, Permission.CREATE_TASK]);

export const withProjectPermissions = (request: NextRequest) => 
  withPermission(request, [Permission.VIEW_PROJECT, Permission.CREATE_PROJECT]);

export const withUserManagement = (request: NextRequest) => 
  withPermission(request, [Permission.MANAGE_USERS]);

export const withTeamManagement = (request: NextRequest) => 
  withPermission(request, [Permission.MANAGE_TEAM]);