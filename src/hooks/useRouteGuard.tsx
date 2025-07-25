"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { UserRole, Permission } from "@/constants/auth";
import { getRouteByPath, hasRouteAccess } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";

export interface RouteGuardOptions {
  requiredRoles?: UserRole[];
  requiredPermissions?: Permission[];
  redirectTo?: string;
  fallbackComponent?: React.ComponentType;
  allowGuest?: boolean;
}

/**
 * Hook for protecting routes with role and permission checks
 */
export function useRouteGuard(options: RouteGuardOptions = {}) {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  const {
    requiredRoles,
    requiredPermissions,
    redirectTo,
    allowGuest = false,
  } = options;

  useEffect(() => {
    if (isLoading) return;

    // Check authentication
    if (!user && !allowGuest) {
      setHasAccess(false);
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
      return;
    }

    // Allow guest access if specified
    if (!user && allowGuest) {
      setHasAccess(true);
      return;
    }

    if (!user) {
      setHasAccess(false);
      return;
    }

    // Check role requirements
    if (requiredRoles && !requiredRoles.includes(user.role)) {
      setHasAccess(false);
      if (redirectTo) {
        router.replace(redirectTo);
      } else {
        router.replace(getDefaultRoute(user.role));
      }
      return;
    }

    // Check permission requirements
    if (requiredPermissions) {
      const hasRequiredPermissions = requiredPermissions.every((permission) =>
        user.permissions.includes(permission)
      );

      if (!hasRequiredPermissions) {
        setHasAccess(false);
        if (redirectTo) {
          router.replace(redirectTo);
        } else {
          router.replace(getDefaultRoute(user.role));
        }
        return;
      }
    }

    setHasAccess(true);
  }, [
    user,
    isLoading,
    pathname,
    router,
    requiredRoles,
    requiredPermissions,
    redirectTo,
    allowGuest,
  ]);

  return {
    hasAccess,
    isLoading,
    user,
  };
}

/**
 * Hook for automatically protecting routes based on route configuration
 */
export function useAutoRouteGuard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasAccess, setHasAccess] = useState<boolean | null>(null);

  useEffect(() => {
    if (isLoading) return;

    const routeConfig = getRouteByPath(pathname);

    if (!routeConfig) {
      setHasAccess(true);
      return;
    }

    // Handle guest-only routes
    if (routeConfig.requiresGuest && user) {
      setHasAccess(false);
      router.replace(getDefaultRoute(user.role));
      return;
    }

    // Handle auth-required routes
    if (routeConfig.requiresAuth && !user) {
      setHasAccess(false);
      const loginUrl = `/login?callbackUrl=${encodeURIComponent(pathname)}`;
      router.replace(loginUrl);
      return;
    }

    // Check route access
    if (user && routeConfig) {
      const access = hasRouteAccess(routeConfig, user.role, user.permissions);
      setHasAccess(access);

      if (!access) {
        router.replace(getDefaultRoute(user.role));
      }
    } else {
      setHasAccess(routeConfig.isPublic || false);
    }
  }, [user, isLoading, pathname, router]);

  return {
    hasAccess,
    isLoading,
    user,
  };
}

/**
 * Hook for checking permissions
 */
export function usePermissions() {
  const { user } = useAuth();

  const hasPermission = (permission: Permission): boolean => {
    return user?.permissions.includes(permission) || false;
  };

  const hasAnyPermission = (permissions: Permission[]): boolean => {
    return permissions.some((permission) => hasPermission(permission));
  };

  const hasAllPermissions = (permissions: Permission[]): boolean => {
    return permissions.every((permission) => hasPermission(permission));
  };

  const hasRole = (role: UserRole): boolean => {
    return user?.role === role;
  };

  const hasAnyRole = (roles: UserRole[]): boolean => {
    return roles.includes(user?.role as UserRole);
  };

  return {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasRole,
    hasAnyRole,
    userPermissions: user?.permissions || [],
    userRole: user?.role,
  };
}

/**
 * Hook for checking if user can access a specific route
 */
export function useCanAccessRoute() {
  const { user } = useAuth();

  const canAccessRoute = (routePath: string): boolean => {
    if (!user) return false;

    const routeConfig = getRouteByPath(routePath);
    if (!routeConfig) return false;

    return hasRouteAccess(routeConfig, user.role, user.permissions);
  };

  const canAccessRouteKey = (routeKey: string): boolean => {
    // This would need the ROUTES object imported, but to avoid circular deps,
    // we'll implement this in the navigation utilities
    return false;
  };

  return {
    canAccessRoute,
    canAccessRouteKey,
  };
}

/**
 * Component wrapper for route protection
 */
interface RouteGuardProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
  requiredPermissions?: Permission[];
  fallback?: React.ReactNode;
  allowGuest?: boolean;
}

export function RouteGuard({
  children,
  requiredRoles,
  requiredPermissions,
  fallback,
  allowGuest = false,
}: RouteGuardProps) {
  const { hasAccess, isLoading } = useRouteGuard({
    requiredRoles,
    requiredPermissions,
    allowGuest,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (hasAccess === false) {
    return fallback ? (
      <>{fallback}</>
    ) : (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You don&apos;t have permission to access this page.
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Component for conditional rendering based on permissions
 */
interface PermissionGateProps {
  children: React.ReactNode;
  permissions?: Permission[];
  roles?: UserRole[];
  requireAll?: boolean; // true = AND logic, false = OR logic
  fallback?: React.ReactNode;
}

export function PermissionGate({
  children,
  permissions = [],
  roles = [],
  requireAll = false,
  fallback = null,
}: PermissionGateProps) {
  const { hasPermission, hasRole } = usePermissions();

  let hasAccess = true;

  // Check permissions
  if (permissions.length > 0) {
    if (requireAll) {
      hasAccess = permissions.every((permission) => hasPermission(permission));
    } else {
      hasAccess = permissions.some((permission) => hasPermission(permission));
    }
  }

  // Check roles
  if (roles.length > 0 && hasAccess) {
    if (requireAll) {
      // For roles, requireAll doesn't make sense since a user has only one role
      hasAccess = roles.some((role) => hasRole(role));
    } else {
      hasAccess = roles.some((role) => hasRole(role));
    }
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
}

/**
 * HOC for protecting components
 */
export function withRouteGuard<P extends object>(
  Component: React.ComponentType<P>,
  options: RouteGuardOptions = {}
) {
  return function GuardedComponent(props: P) {
    const { hasAccess, isLoading } = useRouteGuard(options);

    if (isLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      );
    }

    if (hasAccess === false) {
      return options.fallbackComponent ? (
        <options.fallbackComponent />
      ) : (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Access Denied
            </h1>
            <p className="text-gray-600">
              You don&apos;t have permission to access this page.
            </p>
          </div>
        </div>
      );
    }

    return <Component {...props} />;
  };
}

// Helper function to get default route
function getDefaultRoute(userRole: UserRole): string {
  switch (userRole) {
    case UserRole.SUPER_ADMIN:
    case UserRole.ADMIN:
      return "/admin";
    case UserRole.OWNER:
      return "/owner/home";
    case UserRole.PM:
    case UserRole.LEADER:
    case UserRole.MEMBER:
      return "/dashboard";
    default:
      return "/";
  }
}
