import { ReactNode } from "react";
import {
  ACTION_ICONS,
  LAYOUT_ICONS,
  USER_ICONS,
  FILE_ICONS,
  COMMUNICATION_ICONS,
  DATA_ICONS,
  NAVIGATION_ICONS,
} from "@/constants/icons";
import { Star } from "lucide-react";

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
      icon: Star,
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

  '/manager': {
    title: 'Manager',
    avatarConfig: {
      type: 'icon',
      icon: USER_ICONS.users,
      bgColor: 'orange-500',
    },
    navItems: [
      {
        label: 'Projects',
        href: '/manager/projects',
        icon: NAVIGATION_ICONS.projects,
      },
      {
        label: 'Teams',
        href: '/manager/teams',
        icon: USER_ICONS.users,
      },
      {
        label: 'Users',
        href: '/manager/users',
        icon: USER_ICONS.user,
      },
    ],
    actions: [],
    showTabsPlus: false,
  },

  '/teams/:id': {
    title: 'Team', // This will be dynamic based on team data
    isDynamic: true,
    avatarConfig: {
      type: 'icon',
      icon: USER_ICONS.users,
      bgColor: 'blue-500',
    },
    navItems: [
      {
        label: 'Overview',
        href: (params) => `/teams/${params.id}/overview`,
        icon: LAYOUT_ICONS.grid,
      },
      {
        label: 'Members',
        href: (params) => `/teams/${params.id}/members`,
        icon: USER_ICONS.users,
      },
      {
        label: 'All Work',
        href: (params) => `/teams/${params.id}/all-work`,
        icon: LAYOUT_ICONS.list,
      },

      {
        label: 'Calendar',
        href: (params) => `/teams/${params.id}/calendar`,
        icon: LAYOUT_ICONS.calendar,
      },
    

    ],
    actions: [],
    showTabsPlus: false,
  },


};