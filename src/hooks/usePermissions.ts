// Permission Management Hook
import { useMemo } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { UserRole, ROLE_PERMISSIONS, type Permission } from '@/constants/auth';

export function usePermissions(): {
  permissions: Permission[];
  hasPermission: (permission: Permission) => boolean;
  canAccess: (requiredPermissions: Permission[]) => boolean;
  userRole: UserRole | null;
  isLoading: boolean;
} {
  const { user, isLoading } = useAuth();

  const permissions = useMemo(() => {
    if (!user?.role) return [];
    return ROLE_PERMISSIONS[user.role as UserRole] || [];
  }, [user?.role]);

  const hasPermission = useMemo(() =>
    (permission: Permission) => permissions.includes(permission),
    [permissions]
  );

  const canAccess = useMemo(() =>
    (requiredPermissions: Permission[]) =>
      requiredPermissions.every(permission => permissions.includes(permission)),
    [permissions]
  );

  return {
    permissions,
    hasPermission,
    canAccess,
    userRole: user?.role as UserRole || null,
    isLoading,
  };
}
