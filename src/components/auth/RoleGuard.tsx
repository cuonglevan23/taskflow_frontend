// Role-based Component Guard
'use client';

import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import { UserRole } from '@/types/roles';

interface RoleGuardProps {
  children: React.ReactNode;
  roles?: UserRole | UserRole[];
  minimumRole?: UserRole;
  resource?: string;
  action?: string;
  fallback?: React.ReactNode;
  contextType?: 'project' | 'team' | 'portfolio';
  contextId?: string;
}

export const RoleGuard = ({
  children,
  roles,
  minimumRole,
  resource,
  action,
  fallback = null,
  contextType,
  contextId,
}: RoleGuardProps) => {
  const { hasRole, hasMinimumRole, hasPermission } = usePermissions({
    contextType,
    contextId,
  });

  // Check role-based access
  if (roles && !hasRole(roles)) {
    return <>{fallback}</>;
  }

  // Check minimum role level
  if (minimumRole && !hasMinimumRole(minimumRole)) {
    return <>{fallback}</>;
  }

  // Check specific permission
  if (resource && action && !hasPermission(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

