import { UserRole, Permission } from '@/constants/auth';
import { 
  ROUTES, 
  ROUTE_GROUPS, 
  RouteConfig, 
  RouteGroup,
  getRoutesByRole,
  getNavRoutes,
  hasRouteAccess,
  generateRoutePath
} from '@/config/routes';

export interface BreadcrumbItem {
  title: string;
  href?: string;
  isActive?: boolean;
}

export interface NavigationItem {
  key: string;
  title: string;
  href: string;
  icon?: string;
  isActive?: boolean;
  children?: NavigationItem[];
  badge?: string | number;
  requiresPermissions?: Permission[];
}

export interface SidebarSection {
  title: string;
  items: NavigationItem[];
  order: number;
  icon?: string;
}

/**
 * Generate navigation items based on user role and permissions
 */
export function generateNavigation(
  userRole: UserRole,
  userPermissions: Permission[],
  currentPath: string
): SidebarSection[] {
  const sections: SidebarSection[] = [];

  // Get route groups that the user has access to
  const accessibleGroups = ROUTE_GROUPS.filter(group => 
    group.routes.some(route => hasRouteAccess(route, userRole, userPermissions))
  );

  accessibleGroups.forEach(group => {
    const accessibleRoutes = group.routes.filter(route => 
      hasRouteAccess(route, userRole, userPermissions) && route.isNavItem
    );

    if (accessibleRoutes.length > 0) {
      const items: NavigationItem[] = accessibleRoutes.map(route => ({
        key: route.path,
        title: route.title,
        href: route.path,
        icon: route.icon,
        isActive: currentPath === route.path || currentPath.startsWith(route.path + '/'),
        children: getChildNavigationItems(route, userRole, userPermissions, currentPath),
      }));

      sections.push({
        title: group.name,
        items,
        order: group.order,
        icon: group.icon,
      });
    }
  });

  return sections.sort((a, b) => a.order - b.order);
}

/**
 * Get child navigation items for a parent route
 */
function getChildNavigationItems(
  parentRoute: RouteConfig,
  userRole: UserRole,
  userPermissions: Permission[],
  currentPath: string
): NavigationItem[] {
  const childRoutes = Object.values(ROUTES).filter(route => 
    route.parent === getRouteKey(parentRoute.path) &&
    hasRouteAccess(route, userRole, userPermissions)
  );

  return childRoutes.map(route => ({
    key: route.path,
    title: route.title,
    href: route.path,
    icon: route.icon,
    isActive: currentPath === route.path,
  }));
}

/**
 * Generate breadcrumb navigation for current path
 */
export function generateBreadcrumbs(currentPath: string): BreadcrumbItem[] {
  const breadcrumbs: BreadcrumbItem[] = [];
  const pathSegments = currentPath.split('/').filter(Boolean);
  
  // Add home/dashboard as first item
  breadcrumbs.push({
    title: 'Dashboard',
    href: '/dashboard',
  });

  // Build breadcrumbs from path segments
  let currentSegmentPath = '';
  
  pathSegments.forEach((segment, index) => {
    currentSegmentPath += `/${segment}`;
    
    const route = Object.values(ROUTES).find(r => r.path === currentSegmentPath);
    
    if (route) {
      breadcrumbs.push({
        title: route.title,
        href: index === pathSegments.length - 1 ? undefined : route.path,
        isActive: index === pathSegments.length - 1,
      });
    } else {
      // Fallback for dynamic routes or unmatched segments
      breadcrumbs.push({
        title: capitalizeFirstLetter(segment.replace(/[-_]/g, ' ')),
        href: index === pathSegments.length - 1 ? undefined : currentSegmentPath,
        isActive: index === pathSegments.length - 1,
      });
    }
  });

  return breadcrumbs;
}

/**
 * Get quick actions based on user role and current context
 */
export function getQuickActions(
  userRole: UserRole,
  userPermissions: Permission[],
  context?: 'project' | 'task' | 'dashboard'
): NavigationItem[] {
  const actions: NavigationItem[] = [];

  // Common actions based on permissions
  if (userPermissions.includes(Permission.CREATE_PROJECT)) {
    actions.push({
      key: 'create-project',
      title: 'New Project',
      href: '/projects/new',
      icon: 'plus-circle',
    });
  }

  if (userPermissions.includes(Permission.CREATE_TASK)) {
    actions.push({
      key: 'create-task',
      title: 'New Task',
      href: '/tasks/new',
      icon: 'plus',
    });
  }

  if (userPermissions.includes(Permission.INVITE_USERS)) {
    actions.push({
      key: 'invite-user',
      title: 'Invite Member',
      href: '/settings/members/invite',
      icon: 'user-plus',
    });
  }

  // Role-specific actions
  if ([UserRole.SUPER_ADMIN, UserRole.ADMIN].includes(userRole)) {
    actions.push({
      key: 'admin-panel',
      title: 'Admin Panel',
      href: '/admin',
      icon: 'shield',
    });
  }

  if (userPermissions.includes(Permission.VIEW_ANALYTICS)) {
    actions.push({
      key: 'analytics',
      title: 'Analytics',
      href: '/analytics',
      icon: 'bar-chart',
    });
  }

  return actions;
}

/**
 * Generate navigation for mobile menu
 */
export function generateMobileNavigation(
  userRole: UserRole,
  userPermissions: Permission[],
  currentPath: string
): NavigationItem[] {
  const navRoutes = getNavRoutes(userRole).filter(route =>
    hasRouteAccess(route, userRole, userPermissions)
  );

  return navRoutes.map(route => ({
    key: route.path,
    title: route.title,
    href: route.path,
    icon: route.icon,
    isActive: currentPath === route.path || currentPath.startsWith(route.path + '/'),
  }));
}

/**
 * Get contextual navigation based on current page
 */
export function getContextualNavigation(
  currentPath: string,
  userRole: UserRole,
  userPermissions: Permission[]
): NavigationItem[] {
  const navigation: NavigationItem[] = [];
  
  // Project context navigation
  if (currentPath.startsWith('/projects') || currentPath.startsWith('/owner/project')) {
    const projectNavigation = [
      { key: 'project-list', title: 'All Projects', href: '/owner/project/list', icon: 'list' },
      { key: 'project-board', title: 'Board View', href: '/owner/project/board', icon: 'trello' },
    ];

    if (userPermissions.includes(Permission.VIEW_REPORTS)) {
      projectNavigation.push({
        key: 'project-timeline',
        title: 'Timeline',
        href: '/owner/project/timeline',
        icon: 'gantt-chart'
      });
    }

    navigation.push(...projectNavigation.filter(item => 
      hasRouteAccess(getRouteByPath(item.href), userRole, userPermissions)
    ));
  }

  // Task context navigation
  if (currentPath.startsWith('/tasks') || currentPath.startsWith('/owner/mytask')) {
    const taskNavigation = [
      { key: 'task-list', title: 'My Tasks', href: '/owner/mytask', icon: 'check-square' },
      { key: 'task-board', title: 'Board View', href: '/owner/mytask/board', icon: 'trello' },
      { key: 'task-calendar', title: 'Calendar', href: '/owner/mytask/calendar', icon: 'calendar' },
    ];

    navigation.push(...taskNavigation.filter(item => 
      hasRouteAccess(getRouteByPath(item.href), userRole, userPermissions)
    ));
  }

  // Admin context navigation
  if (currentPath.startsWith('/admin')) {
    const adminNavigation = [
      { key: 'admin-dashboard', title: 'Dashboard', href: '/admin', icon: 'shield' },
      { key: 'admin-users', title: 'Users', href: '/admin/users', icon: 'users' },
      { key: 'admin-system', title: 'System', href: '/admin/system', icon: 'settings' },
      { key: 'admin-analytics', title: 'Analytics', href: '/admin/analytics', icon: 'bar-chart' },
    ];

    navigation.push(...adminNavigation.filter(item => 
      hasRouteAccess(getRouteByPath(item.href), userRole, userPermissions)
    ));
  }

  return navigation.map(item => ({
    ...item,
    isActive: currentPath === item.href,
  }));
}

/**
 * Get user menu items based on role
 */
export function getUserMenuItems(userRole: UserRole): NavigationItem[] {
  const baseItems: NavigationItem[] = [
    { key: 'profile', title: 'Profile', href: '/settings/profile', icon: 'user' },
    { key: 'settings', title: 'Settings', href: '/settings', icon: 'settings' },
  ];

  // Role-specific menu items
  if ([UserRole.OWNER, UserRole.SUPER_ADMIN].includes(userRole)) {
    baseItems.splice(1, 0, {
      key: 'workspace',
      title: 'Workspace Settings',
      href: '/settings/workspace',
      icon: 'building'
    });
  }

  if ([UserRole.OWNER, UserRole.SUPER_ADMIN].includes(userRole)) {
    baseItems.push({
      key: 'billing',
      title: 'Billing',
      href: '/settings/billing',
      icon: 'credit-card'
    });
  }

  baseItems.push({
    key: 'logout',
    title: 'Sign Out',
    href: '/logout',
    icon: 'log-out'
  });

  return baseItems;
}

// Helper functions
function getRouteKey(path: string): string {
  const route = Object.entries(ROUTES).find(([_, route]) => route.path === path);
  return route ? route[0] : '';
}

function getRouteByPath(path: string): RouteConfig {
  return Object.values(ROUTES).find(route => route.path === path) || ROUTES.HOME;
}

function capitalizeFirstLetter(string: string): string {
  return string.charAt(0).toUpperCase() + string.slice(1);
}

// Navigation utilities for programmatic navigation
export class NavigationManager {
  static goToDefaultRoute(userRole: UserRole): void {
    let defaultRoute: string;
    
    switch (userRole) {
      case UserRole.SUPER_ADMIN:
      case UserRole.ADMIN:
        defaultRoute = '/admin';
        break;
      case UserRole.OWNER:
        defaultRoute = '/owner/home';
        break;
      case UserRole.PM:
      case UserRole.LEADER:
      case UserRole.MEMBER:
        defaultRoute = '/dashboard';
        break;
      default:
        defaultRoute = '/';
    }
    
    window.location.href = defaultRoute;
  }

  static goToRoute(routeKey: keyof typeof ROUTES, params: Record<string, string> = {}): void {
    const path = generateRoutePath(routeKey, params);
    window.location.href = path;
  }

  static canAccessRoute(routeKey: keyof typeof ROUTES, userRole: UserRole, userPermissions: Permission[]): boolean {
    const route = ROUTES[routeKey];
    return hasRouteAccess(route, userRole, userPermissions);
  }
} 