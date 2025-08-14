import { ReactNode } from "react";
import {
  ACTION_ICONS,
  LAYOUT_ICONS,
  USER_ICONS,
  FILE_ICONS,
  PROJECT_ICONS,
  COMMUNICATION_ICONS,
  DATA_ICONS,
  NAVIGATION_ICONS,
} from "@/constants/icons";

export interface RouteConfig {
  title: string;
  avatarConfig?: {
    type: 'icon' | 'initial' | 'custom' | 'user';
    icon?: any;
    bgColor: string;
    initial?: string;
    customContent?: () => ReactNode;
  };
  navItems: Array<{
    label: string;
    href: string | ((params: Record<string, string>) => string);
    icon?: any;
  }>;
  actions?: Array<{
    label: string;
    icon?: any;
    onClick?: () => void;
    variant?: "default" | "primary" | "ghost";
  }>;
  showTabsPlus?: boolean;
  isDynamic?: boolean;
  customHeaderContent?: () => ReactNode;
}

export const ROUTE_NAVIGATION_CONFIG: Record<string, RouteConfig> = {
  '/reporting': {
    title: 'Reporting',
    avatarConfig: {
      type: 'icon',
      icon: DATA_ICONS.chart,
      bgColor: 'blue-500',
    },
    navItems: [
      {
        label: 'Dashboards',
        href: '/reporting/dashboards',
        icon: DATA_ICONS.chart,
      },
    ],
    actions: [],
    showTabsPlus: false,
  },

  '/goals': {
    title: 'Goals',
    avatarConfig: {
      type: 'icon',
      icon: NAVIGATION_ICONS.goals,
      bgColor: 'green-500',
    },
    navItems: [
      {
        label: 'Strategy map',
        href: '/goals/strategy-map',
        icon: NAVIGATION_ICONS.goals,
      },
      {
        label: 'Team goals',
        href: '/goals/team-goals',
        icon: USER_ICONS.users,
      },
      {
        label: 'My goals',
        href: '/goals/my-goals',
        icon: USER_ICONS.user,
      },
    ],
    actions: [],
    showTabsPlus: false,
  },

  '/my-tasks': {
    title: 'My tasks',
    avatarConfig: {
      type: 'user', // Use real user avatar from backend
      bgColor: 'gray-300', // Fallback color for initials
    },
    navItems: [
      {
        label: 'List',
        href: '/my-tasks/list',
        icon: LAYOUT_ICONS.list,
      },
      {
        label: 'Board',
        href: '/my-tasks/board',
        icon: LAYOUT_ICONS.board,
      },
      {
        label: 'Calendar',
        href: '/my-tasks/calendar',
        icon: LAYOUT_ICONS.calendar,
      },
      {
        label: 'Dashboard',
        href: '/my-tasks/dashboard',
        icon: LAYOUT_ICONS.timeline,
      },
    ],
    actions: [],
    showTabsPlus: false,
  },

  '/projects/:id': {
    title: 'Project',
    isDynamic: true,
    avatarConfig: {
      type: 'icon',
      icon: LAYOUT_ICONS.grid,
      bgColor: 'gray-300',
    },
    navItems: [
      {
        label: 'Overview',
        href: (params) => `/projects/${params.id}`,
        icon: LAYOUT_ICONS.grid,
      },
      {
        label: 'List',
        href: (params) => `/projects/${params.id}/list`,
        icon: LAYOUT_ICONS.list,
      },
      {
        label: 'Board',
        href: (params) => `/projects/${params.id}/board`,
        icon: LAYOUT_ICONS.board,
      },
      {
        label: 'Calendar',
        href: (params) => `/projects/${params.id}/calendar`,
        icon: LAYOUT_ICONS.calendar,
      },
      {
        label: 'Timeline',
        href: (params) => `/projects/${params.id}/timeline`,
        icon: LAYOUT_ICONS.timeline,
      },
      {
        label: 'Files',
        href: (params) => `/projects/${params.id}/files`,
        icon: FILE_ICONS.document,
      },
    ],
    actions: [],
    showTabsPlus: false,
  },

  '/project': {
    title: 'My Project',
    avatarConfig: {
      type: 'icon',
      icon: USER_ICONS.user,
      bgColor: 'gray-300',
    },
    navItems: [
      {
        label: 'Overview',
        href: '/project',
        icon: LAYOUT_ICONS.grid,
      },
      {
        label: 'List',
        href: '/projects/list',
        icon: LAYOUT_ICONS.list,
      },
      {
        label: 'Board',
        href: '/projects/board',
        icon: LAYOUT_ICONS.board,
      },
      {
        label: 'Calendar',
        href: '/projects/calendar',
        icon: LAYOUT_ICONS.calendar,
      },
      {
        label: 'Dashboard',
        href: '/projects/dashboard',
        icon: LAYOUT_ICONS.timeline,
      },
      {
        label: 'File',
        href: '/projects/file',
        icon: FILE_ICONS.document,
      },
    ],
    actions: [],
    showTabsPlus: false,
  },

  '/owner': {
    title: 'My Project',
    avatarConfig: {
      type: 'icon',
      icon: USER_ICONS.user,
      bgColor: 'gray-300',
    },
    navItems: [
      {
        label: 'Overview',
        href: '/owner/projects',
        icon: LAYOUT_ICONS.grid,
      },
      {
        label: 'Members',
        href: '/owner/Members/allMembers',
        icon: LAYOUT_ICONS.list,
      },
    ],
    actions: [],
    showTabsPlus: false,
  },

  '/inbox': {
    title: 'Inbox',
    navItems: [
      {
        label: 'Activity',
        href: '/inbox',
      },
      {
        label: 'Bookmarks',
        href: '/inbox/bookmarks',
      },
      {
        label: 'Archive',
        href: '/inbox/archive',
      },
    ],
    actions: [],
    showTabsPlus: false,
  },

  '/portfolios': {
    title: 'Portfolios',
    avatarConfig: {
      type: 'icon',
      icon: PROJECT_ICONS.star,
      bgColor: 'purple-500',
    },
    navItems: [
      {
        label: 'Recent and starred',
        href: '/portfolios',
      },
      {
        label: 'Browse all',
        href: '/portfolios/browse-all',
      },
    ],
    actions: [],
    showTabsPlus: false,
  },

  '/teams': {
    title: '',
    customHeaderContent: () => null, // Will be handled by the teams-specific component
    navItems: [
      {
        label: 'Overview',
        href: '/teams',
        icon: LAYOUT_ICONS.grid,
      },
      {
        label: 'All work',
        href: '/teams/all-work',
        icon: LAYOUT_ICONS.list,
      },
      {
        label: 'Messages',
        href: '/teams/messages',
        icon: COMMUNICATION_ICONS.message,
      },
      {
        label: 'Calendar',
        href: '/teams/calendar',
        icon: LAYOUT_ICONS.calendar,
      },
      {
        label: 'Knowledge',
        href: '/teams/knowledge',
        icon: FILE_ICONS.document,
      },
    ],
    actions: [],
    showTabsPlus: true,
  },
};