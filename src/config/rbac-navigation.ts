/**
 * Role-Based Navigation Configuration
 * Cấu hình navigation dựa trên roles và permissions từ backend
 */

import { UserRole, Permission } from '@/constants/auth';
import React from 'react';
import {
  Home,
  CheckSquare,
  Inbox,
  Folder,
  BarChart3,
  Target,
  Users,
  UserPlus,
  Settings,
  CreditCard,
  Star,
  Building,
  Crown,
  Shield,
  Plus,
} from 'lucide-react';

export interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: any;
  external?: boolean;
  badge?: {
    count?: number;
    text?: string;
    color?: 'default' | 'primary' | 'success' | 'warning' | 'danger';
  };
  // RBAC properties
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  minimumRole?: UserRole;
}

export interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
  // RBAC properties
  allowedRoles?: UserRole[];
  requiredPermissions?: Permission[];
  minimumRole?: UserRole;
}

/**
 * Main Navigation Sections với RBAC - Updated theo yêu cầu OWNER structure
 */
export const RBAC_NAVIGATION_SECTIONS: NavigationSection[] = [
  // Main Navigation - Tất cả authenticated users  
  {
    id: 'main',
    items: [
      {
        id: 'home',
        label: 'Home',
        href: '/home',
        icon: React.createElement(Home, { size: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
      },
      {
        id: 'my-tasks',
        label: 'My Task',
        href: '/my-tasks',
        icon: React.createElement(CheckSquare, { size: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
        badge: { count: 0, color: 'default' }, // Will be updated dynamically
      },
      {
        id: 'inbox',
        label: 'Inbox',
        href: '/inbox',
        icon: React.createElement(Inbox, { size: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
      },
    ],
    defaultExpanded: true,
  },

  // Insights Section - Available for all roles (MEMBER+)
  {
    id: 'insights',
    title: 'Insights',
    items: [
      {
        id: 'goals',
        label: 'Goals',
        href: '/goals',
        icon: React.createElement(Target, { size: 20, className: "text-gray-300" }),
        minimumRole: UserRole.MEMBER,
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/reporting',
        icon: React.createElement(BarChart3, { size: 20, className: "text-gray-300" }),
        minimumRole: UserRole.MEMBER,
        requiredPermissions: [Permission.VIEW_REPORTS],
      },
      {
        id: 'portfolios',
        label: 'Portfolios',
        href: '/portfolios',
        icon: React.createElement(Folder, { size: 20, className: "text-gray-300" }),
        minimumRole: UserRole.MEMBER,
      },
    ],
    collapsible: true,
    defaultExpanded: true,
    minimumRole: UserRole.MEMBER,
  },

  // Projects Section - Only for MEMBER và LEADER (tham gia/team projects)
  {
    id: 'projects',
    title: 'Projects',
    items: [], // Will be populated dynamically with user's projects
    collapsible: true,
    defaultExpanded: true,
    allowedRoles: [UserRole.LEADER, UserRole.MEMBER],
  },

  // Teams Section - Only for Member và Leader (tham gia)
  {
    id: 'teams',
    title: 'Teams ',
    items: [], // Will be populated dynamically with user's teams
    collapsible: true,
    defaultExpanded: true,
    allowedRoles: [UserRole.LEADER, UserRole.MEMBER],
  },

  // Management Section - Role-based access
  {
    id: 'managements',
    title: 'Managements',
    items: [
      {
        id: 'project-management',
        label: 'Project Management',
        href: '/managements/projects',
        icon: React.createElement(Folder, { size: 20, className: "text-gray-300" }),
        minimumRole: UserRole.PM,
        requiredPermissions: [Permission.CREATE_PROJECT, Permission.UPDATE_PROJECT],
      },
      {
        id: 'team-management',
        label: 'Team Management',
        href: '/managements/teams',
        icon: React.createElement(Users, { size: 20, className: "text-gray-300" }),
        minimumRole: UserRole.LEADER,
        requiredPermissions: [Permission.MANAGE_TEAM],
      },
      {
        id: 'user-management',
        label: 'User Management',
        href: '/managements/users',
        icon: React.createElement(Settings, { size: 20, className: "text-gray-300" }),
        minimumRole: UserRole.PM,
        requiredPermissions: [Permission.MANAGE_USERS],
      },
    ],
    collapsible: true,
    defaultExpanded: true,
    minimumRole: UserRole.LEADER,
  },
];

/**
 * Quick Actions dựa trên role
 */
export const RBAC_QUICK_ACTIONS = [
  {
    id: 'create-project',
    label: 'Create Project',
    href: '/projects/create',
    icon: React.createElement(Plus, { size: 16, className: "text-gray-300" }),
    minimumRole: UserRole.PM,
    requiredPermissions: [Permission.CREATE_PROJECT],
  },
  {
    id: 'create-team',
    label: 'Create Team',
    href: '/teams/create',
    icon: React.createElement(Plus, { size: 16, className: "text-gray-300" }),
    minimumRole: UserRole.PM,
    requiredPermissions: [Permission.CREATE_TEAM],
  },
  {
    id: 'invite-user',
    label: 'Invite User',
    href: '/teams/invite',
    icon: React.createElement(UserPlus, { size: 16, className: "text-gray-300" }),
    minimumRole: UserRole.PM,
    requiredPermissions: [Permission.INVITE_USERS],
  },
];

/**
 * Footer actions dựa trên role
 */
export const RBAC_FOOTER_ACTIONS = [
  {
    id: 'upgrade',
    label: 'Upgrade Plan',
    href: '/owner/billing',
    minimumRole: UserRole.OWNER,
    requiredPermissions: [Permission.MANAGE_BILLING],
  },
  {
    id: 'support',
    label: 'Support',
    href: '/support',
    allowedRoles: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
  },
];

/**
 * Helper functions để filter navigation dựa trên user permissions
 */
import { UserWithRole } from '@/types/roles';
import { canAccessRoute } from '@/utils/rbac';

export function getVisibleNavigationSections(user: UserWithRole | null): NavigationSection[] {
  if (!user) return [];

  return RBAC_NAVIGATION_SECTIONS.filter(section => {
    // Check section level permissions
    if (section.allowedRoles && section.allowedRoles.length > 0) {
      if (!canAccessRoute(user, section.allowedRoles, section.requiredPermissions || [])) {
        return false;
      }
    } else if (section.minimumRole) {
      if (!canAccessRoute(user, [section.minimumRole], section.requiredPermissions || [])) {
        return false;
      }
    } else if (section.requiredPermissions && section.requiredPermissions.length > 0) {
      if (!canAccessRoute(user, [], section.requiredPermissions)) {
        return false;
      }
    }
    
    // Filter items within section
    const visibleItems = section.items.filter(item => {
      if (item.allowedRoles && item.allowedRoles.length > 0) {
        return canAccessRoute(user, item.allowedRoles, item.requiredPermissions || []);
      } else if (item.minimumRole) {
        return canAccessRoute(user, [item.minimumRole], item.requiredPermissions || []);
      } else if (item.requiredPermissions && item.requiredPermissions.length > 0) {
        return canAccessRoute(user, [], item.requiredPermissions);
      }
      return true;
    });
    
    // Only show section if it has visible items
    // Exception: Projects and Teams sections are populated dynamically, always show if user has access
    if (section.id === 'projects' || section.id === 'teams') {
      return true; // These will be populated dynamically in PrivateSidebar
    }
    
    return visibleItems.length > 0;
  }).map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (item.allowedRoles && item.allowedRoles.length > 0) {
        return canAccessRoute(user, item.allowedRoles, item.requiredPermissions || []);
      } else if (item.minimumRole) {
        return canAccessRoute(user, [item.minimumRole], item.requiredPermissions || []);
      } else if (item.requiredPermissions && item.requiredPermissions.length > 0) {
        return canAccessRoute(user, [], item.requiredPermissions);
      }
      return true;
    })
  }));
}

export function getVisibleQuickActions(user: UserWithRole | null) {
  if (!user) return [];

  return RBAC_QUICK_ACTIONS.filter(action => {
    if (action.allowedRoles && !canAccessRoute(user, action.allowedRoles)) {
      return false;
    }
    
    if (action.minimumRole && !canAccessRoute(user, [action.minimumRole])) {
      return false;
    }
    
    if (action.requiredPermissions && !canAccessRoute(user, [], action.requiredPermissions)) {
      return false;
    }
    
    return true;
  });
}

export function getVisibleFooterActions(user: UserWithRole | null) {
  if (!user) return [];

  return RBAC_FOOTER_ACTIONS.filter(action => {
    if (action.allowedRoles && !canAccessRoute(user, action.allowedRoles)) {
      return false;
    }
    
    if (action.minimumRole && !canAccessRoute(user, [action.minimumRole])) {
      return false;
    }
    
    if (action.requiredPermissions && !canAccessRoute(user, [], action.requiredPermissions)) {
      return false;
    }
    
    return true;
  });
}