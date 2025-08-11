/**
 * RBAC Guards Export Index
 * Export tất cả guards để dễ import trong các components khác
 */

export {
  RBACGuard as default,
  RBACGuard,
  PermissionGuard,
  RoleGuard,
  AdminGuard,
  OwnerGuard,
  ManagerGuard,
  LeaderGuard,
  MemberGuard,
  AuthenticatedGuard,
  GuestGuard,
  ConditionalRoleRenderer,
  withRBAC,
} from './RBACGuard';

// Re-export types for convenience
export type {
  UserRole,
  Permission,
} from '@/constants/auth';

// Re-export RBAC hook
export { useRBAC } from '@/hooks/useRBAC';