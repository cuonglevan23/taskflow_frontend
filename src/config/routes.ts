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

// Main routes configuration
export const ROUTES: Record<string, RouteConfig> = {
  // Public Routes (for non-authenticated users)
  HOME: {
    path: '/',
    title: 'Home',
    description: 'Landing page',
    layout: 'public',
    accessRoles: Object.values(UserRole),
    isPublic: true,
    isNavItem: true,
    icon: 'home',
  },
  
  ABOUT: {
    path: '/about',
    title: 'About',
    layout: 'public',
    accessRoles: Object.values(UserRole),
    isPublic: true,
    isNavItem: true,
    icon: 'info',
  },

  PRICING: {
    path: '/pricing',
    title: 'Pricing',
    layout: 'public',
    accessRoles: Object.values(UserRole),
    isPublic: true,
    isNavItem: true,
    icon: 'dollar-sign',
  },

  CONTACT: {
    path: '/contact',
    title: 'Contact',
    layout: 'public',
    accessRoles: Object.values(UserRole),
    isPublic: true,
    isNavItem: true,
    icon: 'mail',
  },

  // Auth Routes (Guest only - use public layout)
  LOGIN: {
    path: '/login',
    title: 'Login',
    layout: 'public',
    accessRoles: [],
    requiresGuest: true,
    icon: 'log-in',
  },

  REGISTER: {
    path: '/register',
    title: 'Register',
    layout: 'public',
    accessRoles: [],
    requiresGuest: true,
    icon: 'user-plus',
  },

  FORGOT_PASSWORD: {
    path: '/forgot-password',
    title: 'Forgot Password',
    layout: 'public',
    accessRoles: [],
    requiresGuest: true,
    icon: 'key',
  },

  // Private Routes - Dashboard
  DASHBOARD: {
    path: '/dashboard',
    title: 'Dashboard',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    requiresAuth: true,
    isNavItem: true,
    icon: 'layout-dashboard',
    navGroup: 'main',
    order: 1,
  },

  // Owner-specific routes
  OWNER_ANALYTICS: {
    path: '/owner/analytics',
    title: 'Analytics',
    layout: 'private',
    accessRoles: [UserRole.OWNER],
    requiresAuth: true,
    isNavItem: true,
    icon: 'bar-chart',
    navGroup: 'owner',
    order: 1,
  },

  OWNER_BILLING: {
    path: '/owner/billing',
    title: 'Billing & Subscription',
    layout: 'private',
    accessRoles: [UserRole.OWNER],
    requiredPermissions: [Permission.MANAGE_BILLING],
    requiresAuth: true,
    isNavItem: true,
    icon: 'credit-card',
    navGroup: 'owner',
    order: 2,
  },

  OWNER_WORKSPACE: {
    path: '/owner/workspace',
    title: 'Workspace Settings',
    layout: 'private',
    accessRoles: [UserRole.OWNER],
    requiredPermissions: [Permission.MANAGE_WORKSPACE],
    requiresAuth: true,
    isNavItem: true,
    icon: 'building',
    navGroup: 'owner',
    order: 3,
  },

  // Project Management Routes
  PROJECTS: {
    path: '/projects',
    title: 'Projects',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    requiredPermissions: [Permission.VIEW_PROJECT],
    requiresAuth: true,
    isNavItem: true,
    icon: 'folder',
    navGroup: 'projects',
    order: 1,
  },

  PROJECT_LIST: {
    path: '/projects/list',
    title: 'All Projects',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    requiredPermissions: [Permission.VIEW_PROJECT],
    requiresAuth: true,
    parent: 'PROJECTS',
    icon: 'list',
  },

  PROJECT_BOARD: {
    path: '/projects/board',
    title: 'Project Board',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    requiredPermissions: [Permission.VIEW_PROJECT],
    requiresAuth: true,
    parent: 'PROJECTS',
    icon: 'trello',
  },

  PROJECT_CREATE: {
    path: '/projects/create',
    title: 'Create Project',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM],
    requiredPermissions: [Permission.CREATE_PROJECT],
    requiresAuth: true,
    parent: 'PROJECTS',
    icon: 'plus',
  },

  // Task Management Routes
  MY_TASKS: {
    path: '/tasks',
    title: 'My Tasks',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    requiresAuth: true,
    isNavItem: true,
    icon: 'check-square',
    navGroup: 'tasks',
    order: 1,
  },

  TASK_BOARD: {
    path: '/tasks/board',
    title: 'Task Board',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    requiresAuth: true,
    parent: 'MY_TASKS',
    icon: 'trello',
  },

  TASK_CALENDAR: {
    path: '/tasks/calendar',
    title: 'Task Calendar',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    requiresAuth: true,
    parent: 'MY_TASKS',
    icon: 'calendar',
  },

  // Team Management Routes (Manager and above)
  TEAM_MANAGEMENT: {
    path: '/team',
    title: 'Team Management',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER],
    requiredPermissions: [Permission.MANAGE_TEAM],
    requiresAuth: true,
    isNavItem: true,
    icon: 'users',
    navGroup: 'management',
    order: 1,
  },

  TEAM_MEMBERS: {
    path: '/team/members',
    title: 'Team Members',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER],
    requiredPermissions: [Permission.VIEW_MEMBERS],
    requiresAuth: true,
    parent: 'TEAM_MANAGEMENT',
    icon: 'user-group',
  },

  INVITE_MEMBERS: {
    path: '/team/invite',
    title: 'Invite Members',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM],
    requiredPermissions: [Permission.INVITE_USERS],
    requiresAuth: true,
    parent: 'TEAM_MANAGEMENT',
    icon: 'user-plus',
  },

  // Reports (Manager and above)
  REPORTS: {
    path: '/reports',
    title: 'Reports',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER],
    requiredPermissions: [Permission.VIEW_REPORTS],
    requiresAuth: true,
    isNavItem: true,
    icon: 'chart-line',
    navGroup: 'management',
    order: 2,
  },

  // Management Center Routes
  MANAGEMENT_CENTER: {
    path: '/manager',
    title: 'Management Center',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER],
    requiresAuth: true,
    isNavItem: true,
    icon: 'settings',
    navGroup: 'management',
    order: 3,
  },

  MANAGEMENT_PROJECTS: {
    path: '/manager/projects',
    title: 'Manage Projects',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER],
    requiresAuth: true,
    parent: 'MANAGEMENT_CENTER',
    icon: 'folder-open',
  },

  MANAGEMENT_TEAMS: {
    path: '/manager/teams',
    title: 'Manage Teams',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM],
    requiresAuth: true,
    parent: 'MANAGEMENT_CENTER',
    icon: 'users',
  },

  MANAGEMENT_USERS: {
    path: '/manager/users',
    title: 'Manage Users',
    layout: 'private',
    accessRoles: [UserRole.OWNER],
    requiresAuth: true,
    parent: 'MANAGEMENT_CENTER',
    icon: 'user',
  },

  // Personal Settings (All authenticated users)
  PROFILE: {
    path: '/profile',
    title: 'Profile',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    requiresAuth: true,
    isNavItem: true,
    icon: 'user',
    navGroup: 'settings',
    order: 1,
  },

  SETTINGS: {
    path: '/settings',
    title: 'Settings',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    requiresAuth: true,
    isNavItem: true,
    icon: 'settings',
    navGroup: 'settings',
    order: 2,
  },

  NOTIFICATIONS: {
    path: '/notifications',
    title: 'Notifications',
    layout: 'private',
    accessRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    requiresAuth: true,
    isNavItem: true,
    icon: 'bell',
    navGroup: 'settings',
    order: 3,
  },
};

// Sidebar navigation groups based on user roles
export const SIDEBAR_GROUPS: Record<string, RouteGroup> = {
  main: {
    name: 'Dashboard',
    order: 1,
    icon: 'home',
    roles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    routes: [ROUTES.DASHBOARD],
  },
  
  projects: {
    name: 'Projects',
    order: 2,
    icon: 'folder',
    roles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    routes: [ROUTES.PROJECTS],
  },

  tasks: {
    name: 'Tasks',
    order: 3,
    icon: 'check-square',
    roles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    routes: [ROUTES.MY_TASKS],
  },

  management: {
    name: 'Management',
    order: 4,
    icon: 'briefcase',
    roles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER],
    routes: [ROUTES.TEAM_MANAGEMENT, ROUTES.REPORTS, ROUTES.MANAGEMENT_CENTER],
  },

  owner: {
    name: 'Owner',
    order: 5,
    icon: 'crown',
    roles: [UserRole.OWNER],
    routes: [ROUTES.OWNER_ANALYTICS, ROUTES.OWNER_BILLING, ROUTES.OWNER_WORKSPACE],
  },

  settings: {
    name: 'Settings',
    order: 6,
    icon: 'settings',
    roles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    routes: [ROUTES.PROFILE, ROUTES.SETTINGS, ROUTES.NOTIFICATIONS],
  },
};

// Helper functions
export function getRoutesByRole(userRole: UserRole): RouteConfig[] {
  return Object.values(ROUTES).filter(route => 
    route.accessRoles.includes(userRole)
  );
}

export function getSidebarNavigation(userRole: UserRole): RouteGroup[] {
  return Object.values(SIDEBAR_GROUPS)
    .filter(group => group.roles.includes(userRole))
    .map(group => ({
      ...group,
      routes: group.routes.filter(route => 
        route.accessRoles.includes(userRole) && route.isNavItem
      )
    }))
    .filter(group => group.routes.length > 0)
    .sort((a, b) => a.order - b.order);
}

export function getPublicNavRoutes(): RouteConfig[] {
  return Object.values(ROUTES).filter(route => 
    route.isPublic && route.isNavItem
  );
}

export function getRouteByPath(path: string): RouteConfig | undefined {
  return Object.values(ROUTES).find(route => route.path === path);
}

export function getChildRoutes(parentPath: string): RouteConfig[] {
  const parentKey = Object.keys(ROUTES).find(key => ROUTES[key].path === parentPath);
  if (!parentKey) return [];
  
  return Object.values(ROUTES).filter(route => route.parent === parentKey);
}

export function hasRouteAccess(route: RouteConfig, userRole: UserRole, userPermissions: Permission[] = []): boolean {
  // Check role access
  if (!route.accessRoles.includes(userRole)) {
    return false;
  }
  
  // Check required permissions
  if (route.requiredPermissions) {
    return route.requiredPermissions.every(permission => userPermissions.includes(permission));
  }
  
  return true;
}

export function generateRoutePath(routeKey: string, params: Record<string, string> = {}): string {
  const route = ROUTES[routeKey as keyof typeof ROUTES];
  if (!route) return '/';
  
  let path = route.path;
  
  // Replace dynamic segments
  Object.entries(params).forEach(([key, value]) => {
    path = path.replace(`[${key}]`, value).replace(`:${key}`, value);
  });
  
  return path;
}

// Route patterns for middleware
export const ROUTE_PATTERNS = {
  PUBLIC: Object.values(ROUTES).filter(r => r.isPublic).map(r => r.path),
  AUTH_REQUIRED: Object.values(ROUTES).filter(r => r.requiresAuth).map(r => r.path),
  GUEST_ONLY: Object.values(ROUTES).filter(r => r.requiresGuest).map(r => r.path),
  PRIVATE: Object.values(ROUTES).filter(r => r.layout === 'private').map(r => r.path),
}; 