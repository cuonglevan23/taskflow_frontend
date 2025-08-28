'use client';

import { UserRole, Permission } from '@/constants/auth';
import { UserWithRole } from '@/types/roles';
import React from 'react';
import { SIDEBAR_ICONS } from '@/constants/icons';
import {
  Folder,
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

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  allowedRoles?: UserRole[];
  badge?: {
    count: number;
    color: string;
  };
  dynamic?: boolean;
  childItems?: NavigationItem[];
  requiredPermissions?: Permission[];
}

interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
  allowedRoles?: UserRole[];
}

interface QuickAction {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  allowedRoles?: UserRole[];
}

interface FooterAction {
  id: string;
  label: string;
  href: string;
  allowedRoles?: UserRole[];
}

export const RBAC_NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    id: 'main',
    items: [
      {
        id: 'home',
        label: 'Home',
        href: '/home',
        icon: React.createElement(SIDEBAR_ICONS.home, { width: 20, height: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
      },
      {
        id: 'my-tasks',
        label: 'My Tasks',
        href: '/my-tasks',
        icon: React.createElement(SIDEBAR_ICONS.myTasks, { width: 20, height: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.MEMBER],
        badge: { count: 0, color: 'default' },
      },
      {
        id: 'newsfeed',
        label: 'NewsFeed',
        href: '/newsfeed',
        icon: React.createElement(SIDEBAR_ICONS.newsfeed, { width: 20, height: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
      },
      {
        id: 'inbox',
        label: 'Inbox',
        href: '/inbox',
        icon: React.createElement(SIDEBAR_ICONS.inbox, { width: 20, height: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
      },
    ],
    defaultExpanded: true,
  },
      {
    id: 'analytics',
    title: 'Insights',
    items: [
      {
        id: 'goals',
        label: 'Goals',
        href: '/goals',
        icon: React.createElement(SIDEBAR_ICONS.goals, { className: "text-gray-300 w-5 h-5" }),
        allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
      },
      {
        id: 'reports',
        label: 'Reports',
        href: '/reporting',
        icon: React.createElement(SIDEBAR_ICONS.reporting, { className: "text-gray-300 w-5 h-5" }),
        allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
      },
    ],
    collapsible: true,
    defaultExpanded: true,
  },
  {
    id: 'projects',
    title: 'Projects',
    items: [
      {
        id: 'projects-overview',
        label: 'All Projects',
        href: '/projects',
        icon: React.createElement(Folder, { size: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
      },
      {
        id: 'my-projects',
        label: 'My Projects',
        href: '/projects/my-projects',
        icon: React.createElement(Star, { size: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.MEMBER],
        dynamic: true,
        childItems: [],
      },
      {
        id: 'project-tasks',
        label: 'Project Tasks',
        href: '/projects/tasks',
        icon: React.createElement(SIDEBAR_ICONS.myTasks, { width: 20, height: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.MEMBER],
      },
      {
        id: 'project-management',
        label: 'Project Management',
        href: '/projects/manage',
        icon: React.createElement(Users, { size: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.MEMBER],
      },
    ],
    collapsible: true,
    defaultExpanded: true,
  },
      {
    id: 'teams',
    title: 'Teams',
    items: [
      {
        id: 'teams-overview',
        label: 'All Teams',
        href: '/teams',
        icon: React.createElement(Users, { size: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
      },
      {
        id: 'my-teams',
        label: 'My Teams',
        href: '/teams/my-teams',
        icon: React.createElement(Star, { size: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.MEMBER],
        dynamic: true,
      },
      {
        id: 'team-tasks',
        label: 'Team Tasks',
        href: '/teams/tasks',
        icon: React.createElement(SIDEBAR_ICONS.myTasks, { width: 20, height: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.MEMBER],
      },
      {
        id: 'team-management',
        label: 'Team Management',
        href: '/teams/manage',
        icon: React.createElement(UserPlus, { size: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.MEMBER],
      },
    ],
    collapsible: true,
    defaultExpanded: true,
  },

  {
    id: 'management',
    title: 'Management',
    items: [
      {
        id: 'management-center',
        label: 'Management Center',
        href: '/manager',
        icon: React.createElement(Settings, { size: 20, className: "text-gray-300" }),
        allowedRoles: [UserRole.ADMIN],
        requiredPermissions: [Permission.VIEW_REPORTS],
      },
    ],
    collapsible: true,
    defaultExpanded: true,
    allowedRoles: [UserRole.ADMIN],
  },
];

export const RBAC_QUICK_ACTIONS: QuickAction[] = [
  {
    id: 'create-project',
    label: 'Create Project',
    href: '/projects/create',
    icon: React.createElement(Plus, { size: 16, className: "text-gray-300" }),
    allowedRoles: [UserRole.MEMBER],
  },
  {
    id: 'create-team',
    label: 'Create Team',
    href: '/teams/create',
    icon: React.createElement(Plus, { size: 16, className: "text-gray-300" }),
    allowedRoles: [UserRole.MEMBER],
  },
  {
    id: 'create-task',
    label: 'Create Task',
    href: '/tasks/create',
    icon: React.createElement(Plus, { size: 16, className: "text-gray-300" }),
    allowedRoles: [UserRole.MEMBER],
  },
  {
    id: 'invite-member',
    label: 'Invite Member',
    href: '/invite',
    icon: React.createElement(UserPlus, { size: 16, className: "text-gray-300" }),
    allowedRoles: [UserRole.MEMBER],
  }
];

export const RBAC_FOOTER_ACTIONS: FooterAction[] = [
  {
    id: 'system-settings',
    label: 'System Settings',
    href: '/admin/settings',
    allowedRoles: [UserRole.ADMIN],
  },
  {
    id: 'user-settings',
    label: 'User Settings',
    href: '/settings',
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
  },
  {
    id: 'support',
    label: 'Support',
    href: '/support',
    allowedRoles: [UserRole.ADMIN, UserRole.MEMBER],
  }
];

export function getVisibleNavigationSections(user: UserWithRole | null): NavigationSection[] {
  if (!user) return [];

  const userRole = UserRole[user.role.toUpperCase() as keyof typeof UserRole];

  return RBAC_NAVIGATION_SECTIONS.filter(section => {
    // Check section level permissions
    if (section.allowedRoles && !section.allowedRoles.includes(userRole)) {
      return false;
    }

    // Filter items based on roles
    const visibleItems = section.items.filter(item => {
      if (item.allowedRoles && item.allowedRoles.length > 0) {
        return item.allowedRoles.includes(userRole);
      }
      return true;
    });

    return visibleItems.length > 0;
  }).map(section => ({
    ...section,
    items: section.items.filter(item => {
      if (item.allowedRoles && item.allowedRoles.length > 0) {
        return item.allowedRoles.includes(userRole);
      }
      return true;
    }).map(item => {
      if (item.dynamic) {
        return {
          ...item,
          childItems: [], // Will be populated by the sidebar component
        };
      }
      return item;
    })
  }));
}

export function getVisibleQuickActions(user: UserWithRole | null): QuickAction[] {
  if (!user) return [];

  const userRole = UserRole[user.role.toUpperCase() as keyof typeof UserRole];

  return RBAC_QUICK_ACTIONS.filter(action => {
    if (action.allowedRoles && action.allowedRoles.length > 0) {
      return action.allowedRoles.includes(userRole);
    }
    return true;
  });
}

export function getVisibleFooterActions(user: UserWithRole | null): FooterAction[] {
  if (!user) return [];

  const userRole = UserRole[user.role.toUpperCase() as keyof typeof UserRole];

  return RBAC_FOOTER_ACTIONS.filter(action => {
    if (action.allowedRoles && action.allowedRoles.length > 0) {
      return action.allowedRoles.includes(userRole);
    }
    return true;
  });
}
