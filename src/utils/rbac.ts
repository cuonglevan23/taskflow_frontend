/**
 * Role-Based Access Control (RBAC) Utilities
 * Quản lý quyền hạn và bảo mật chặt chẽ theo role từ backend
 */

import { UserRole, Permission, ROLE_PERMISSIONS } from '@/constants/auth';
import type { UserWithRole } from '@/types/roles';

// Role hierarchy - số càng cao quyền càng lớn
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ADMIN]: 90,
  [UserRole.OWNER]: 80,
  [UserRole.PM]: 70,
  [UserRole.LEADER]: 50,
  [UserRole.MEMBER]: 30,
  [UserRole.GUEST]: 10,
};

// Convert legacy roles to new system
export const LEGACY_ROLE_MAPPING: Record<string, UserRole> = {
  'admin': UserRole.ADMIN,
  'owner': UserRole.OWNER,
  'project_manager': UserRole.PM,
  'leader': UserRole.LEADER,
  'member': UserRole.MEMBER,
  // Backend trả về uppercase
  'ADMIN': UserRole.ADMIN,
  'OWNER': UserRole.OWNER, 
  'PM': UserRole.PM,
  'PROJECT_MANAGER': UserRole.PM,
  'LEADER': UserRole.LEADER,
  'MEMBER': UserRole.MEMBER,
  'GUEST': UserRole.GUEST,
  'SUPER_ADMIN': UserRole.SUPER_ADMIN,
};

/**
 * Lấy UserRole chuẩn từ backend string
 */
export function normalizeRole(roleString: string): UserRole {
  if (!roleString) {
    console.warn('Empty role string, defaulting to MEMBER');
    return UserRole.MEMBER;
  }

  
  // Try direct match first (uppercase)
  if (Object.values(UserRole).includes(roleString as UserRole)) {
    return roleString as UserRole;
  }
  
  // Try legacy mapping (both case-sensitive và case-insensitive)
  const exactMatch = LEGACY_ROLE_MAPPING[roleString];
  if (exactMatch) {
    return exactMatch;
  }

  const lowercaseMatch = LEGACY_ROLE_MAPPING[roleString.toLowerCase()];
  if (lowercaseMatch) {
    return lowercaseMatch;
  }
  
  // Default fallback
  console.warn(`❌ Unknown role: ${roleString}, defaulting to MEMBER`);
  return UserRole.MEMBER;
}

/**
 * Kiểm tra user có quyền thực hiện action không
 */
export function hasPermission(user: UserWithRole | null, permission: Permission): boolean {
  if (!user?.role) return false;
  
  const normalizedRole = normalizeRole(user.role as string);
  const rolePermissions = ROLE_PERMISSIONS[normalizedRole] || [];
  
  return rolePermissions.includes(permission);
}

/**
 * Kiểm tra user có một trong các permissions không
 */
export function hasAnyPermission(user: UserWithRole | null, permissions: Permission[]): boolean {
  return permissions.some(permission => hasPermission(user, permission));
}

/**
 * Kiểm tra user có tất cả permissions không
 */
export function hasAllPermissions(user: UserWithRole | null, permissions: Permission[]): boolean {
  return permissions.every(permission => hasPermission(user, permission));
}

/**
 * Kiểm tra role có quyền cao hơn role khác không
 */
export function hasHigherRole(userRole: UserRole, targetRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] > ROLE_HIERARCHY[targetRole];
}

/**
 * Kiểm tra role có quyền tối thiểu không
 */
export function hasMinimumRole(userRole: UserRole, minimumRole: UserRole): boolean {
  return ROLE_HIERARCHY[userRole] >= ROLE_HIERARCHY[minimumRole];
}

/**
 * Lấy tất cả permissions của user
 */
export function getUserPermissions(user: UserWithRole | null): Permission[] {
  if (!user?.role) return [];
  
  const normalizedRole = normalizeRole(user.role as string);
  return ROLE_PERMISSIONS[normalizedRole] || [];
}

/**
 * Kiểm tra user có thể truy cập route không
 */
export function canAccessRoute(user: UserWithRole | null, allowedRoles: UserRole[], requiredPermissions: Permission[] = []): boolean {
  if (!user?.role) return false;
  
  const normalizedRole = normalizeRole(user.role as string);
  
  // Nếu không có role restrictions, chỉ check permissions
  if (allowedRoles.length === 0) {
    if (requiredPermissions.length > 0) {
      return hasAllPermissions(user, requiredPermissions);
    }
    return true;
  }
  
  // Kiểm tra role - support both exact match và hierarchy
  const hasRole = allowedRoles.some(allowedRole => {
    // Exact match
    if (normalizedRole === allowedRole) return true;
    
    // Hierarchy check - user role có level >= required role không
    return hasMinimumRole(normalizedRole, allowedRole);
  });
  
  if (!hasRole) return false;
  
  // Kiểm tra permissions nếu có
  if (requiredPermissions.length > 0) {
    return hasAllPermissions(user, requiredPermissions);
  }
  
  return true;
}

/**
 * Filter array dựa trên permissions
 */
export function filterByPermission<T>(
  items: T[],
  user: UserWithRole | null,
  getRequiredPermission: (item: T) => Permission
): T[] {
  return items.filter(item => {
    const requiredPermission = getRequiredPermission(item);
    return hasPermission(user, requiredPermission);
  });
}

/**
 * Role-based UI helpers
 */
export class RBACHelper {
  constructor(private user: UserWithRole | null) {}

  // Role checks
  get isSuperAdmin(): boolean {
    return this.hasRole(UserRole.SUPER_ADMIN);
  }

  get isAdmin(): boolean {
    return this.hasRole(UserRole.ADMIN);
  }

  get isOwner(): boolean {
    return this.hasRole(UserRole.OWNER);
  }

  get isProjectManager(): boolean {
    return this.hasRole(UserRole.PM);
  }

  get isLeader(): boolean {
    return this.hasRole(UserRole.LEADER);
  }

  get isMember(): boolean {
    return this.hasRole(UserRole.MEMBER);
  }

  get isGuest(): boolean {
    return this.hasRole(UserRole.GUEST);
  }

  // Management capabilities
  get canManageWorkspace(): boolean {
    return this.hasPermission(Permission.MANAGE_WORKSPACE);
  }

  get canManageUsers(): boolean {
    return this.hasPermission(Permission.MANAGE_USERS);
  }

  get canCreateProjects(): boolean {
    return this.hasPermission(Permission.CREATE_PROJECT);
  }

  get canManageTeams(): boolean {
    return this.hasPermission(Permission.MANAGE_TEAM);
  }

  get canViewReports(): boolean {
    return this.hasPermission(Permission.VIEW_REPORTS);
  }

  get canManageBilling(): boolean {
    return this.hasPermission(Permission.MANAGE_BILLING);
  }

  // Private methods
  private hasRole(role: UserRole): boolean {
    if (!this.user?.role) return false;
    const normalizedRole = normalizeRole(this.user.role as string);
    return normalizedRole === role;
  }

  private hasPermission(permission: Permission): boolean {
    return hasPermission(this.user, permission);
  }

  // Utility methods
  can(permission: Permission): boolean {
    return this.hasPermission(permission);
  }

  canAny(permissions: Permission[]): boolean {
    return hasAnyPermission(this.user, permissions);
  }

  canAll(permissions: Permission[]): boolean {
    return hasAllPermissions(this.user, permissions);
  }

  hasMinRole(minimumRole: UserRole): boolean {
    if (!this.user?.role) return false;
    const normalizedRole = normalizeRole(this.user.role as string);
    return hasMinimumRole(normalizedRole, minimumRole);
  }
}

/**
 * Hook-style helper để sử dụng trong components
 */
export function createRBACHelper(user: UserWithRole | null): RBACHelper {
  return new RBACHelper(user);
}

/**
 * Debugging utilities
 */
export function debugUserPermissions(user: UserWithRole | null): void {
  if (!user) {
    return;
  }

  const normalizedRole = normalizeRole(user.role as string);
  const permissions = getUserPermissions(user);
  const rbac = createRBACHelper(user);
}