// Protected Route Component
'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types/roles';

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: UserRole | UserRole[];
  minimumRole?: UserRole;
  resource?: string;
  action?: string;
  redirectTo?: string;
  fallback?: React.ReactNode;
  /** Optional context type for role-based permissions */
  contextType?: 'project' | 'team';
  contextId?: string;
}

export const ProtectedRoute = ({
  children,
  roles,
  minimumRole,
  resource,
  action,
  redirectTo = '/unauthorized',
  fallback,
  contextType,
  contextId,
}: ProtectedRouteProps) => {
  const router = useRouter();
  const { user, hasRole, hasMinimumRole, hasPermission } = usePermissions({
    contextType,
    contextId,
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    let hasAccess = true;

    // Check role-based access
    if (roles && !hasRole(roles)) {
      hasAccess = false;
    }

    // Check minimum role level
    if (minimumRole && !hasMinimumRole(minimumRole)) {
      hasAccess = false;
    }

    // Check specific permission
    if (resource && action && !hasPermission(resource, action)) {
      hasAccess = false;
    }

    if (!hasAccess) {
      router.push(redirectTo);
    }
  }, [user, roles, minimumRole, resource, action, hasRole, hasMinimumRole, hasPermission, router, redirectTo]);

  // Show loading or fallback while checking permissions
  if (!user) {
    return fallback || <div>Loading...</div>;
  }

  // Check permissions again for rendering
  let hasAccess = true;

  if (roles && !hasRole(roles)) {
    hasAccess = false;
  }

  if (minimumRole && !hasMinimumRole(minimumRole)) {
    hasAccess = false;
  }

  if (resource && action && !hasPermission(resource, action)) {
    hasAccess = false;
  }

  if (!hasAccess) {
    return fallback || <div>Access Denied</div>;
  }

  return <>{children}</>;
};

// Convenience components for route protection
export function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
  <ProtectedRoute roles="admin">
    {children}
  </ProtectedRoute>
);

export function OwnerRoute({ children }: { children: React.ReactNode }) {
  return (
  <ProtectedRoute roles="owner">
    {children}
  </ProtectedRoute>
);

export function ManagerRoute({ children }: { children: React.ReactNode }) {
  return (
  <ProtectedRoute minimumRole="project_manager">
    {children}
  </ProtectedRoute>
);

export function LeaderRoute({ children }: { children: React.ReactNode }) {
  return (
  <ProtectedRoute minimumRole="leader">
    {children}
  </ProtectedRoute>
);