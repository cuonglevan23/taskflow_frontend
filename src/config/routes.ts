import { UserRole, Permission } from '@/constants/auth';

export interface RouteConfig {
  path: string;
  title: string;
  description?: string;
  layout: 'public' | 'private'; // Simplified to two layouts
  accessRoles: UserRole[];
  requiredPermissions?: Permission[];
  isPublic?: boolean;
  requiresAuth?: boolean;
  requiresGuest?: boolean; // Only for non-authenticated users
  icon?: string;
  isNavItem?: boolean; // Should appear in navigation
  parent?: string; // For nested routes
  redirectTo?: string; // Redirect destination
  children?: RouteConfig[];
  navGroup?: string; // Group for sidebar organization
  order?: number; // Order within nav group
}

export interface RouteGroup {
  name: string;
  routes: RouteConfig[];
  icon?: string;
  order: number;
  roles: UserRole[]; // Which roles can see this group
}
