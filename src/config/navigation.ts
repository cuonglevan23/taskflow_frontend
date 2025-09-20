'use client';

import React, { memo, ReactNode } from 'react';
import { SIDEBAR_ICONS } from '@/constants/icons';
import {
  Folder,
  Users,
  UserPlus,
  Settings,
  Star,
} from 'lucide-react';
import {
  LAYOUT_ICONS,
  USER_ICONS,
  FILE_ICONS,
  DATA_ICONS,
  NAVIGATION_ICONS,
} from "@/constants/icons";

interface NavigationItem {
  id: string;
  label: string;
  href: string;
  icon?: React.ReactNode;
  badge?: {
    count: number;
    color: string;
  };
  dynamic?: boolean;
}

interface NavigationSection {
  id: string;
  title?: string;
  items: NavigationItem[];
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

// Route Configuration Interface (tích hợp từ routeNavigationConfig.ts)
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

// Memoize icons để tránh re-create mỗi lần render
const memoizedIcons = {
  home: memo(() => React.createElement(SIDEBAR_ICONS.home, { width: 20, height: 20, className: "text-gray-300" })),
  myTasks: memo(() => React.createElement(SIDEBAR_ICONS.myTasks, { width: 20, height: 20, className: "text-gray-300" })),
  messages: memo(() => React.createElement(SIDEBAR_ICONS.messages, { width: 20, height: 20, className: "text-gray-300" })),
  newsfeed: memo(() => React.createElement(SIDEBAR_ICONS.newsfeed, { width: 20, height: 20, className: "text-gray-300" })),
  inbox: memo(() => React.createElement(SIDEBAR_ICONS.inbox, { width: 20, height: 20, className: "text-gray-300" })),
  goals: memo(() => React.createElement(SIDEBAR_ICONS.goals, { className: "text-gray-300 w-5 h-5" })),
  folder: memo(() => React.createElement(Folder, { size: 20, className: "text-gray-300" })),
  star: memo(() => React.createElement(Star, { size: 20, className: "text-gray-300" })),
  users: memo(() => React.createElement(Users, { size: 20, className: "text-gray-300" })),
  userPlus: memo(() => React.createElement(UserPlus, { size: 20, className: "text-gray-300" })),
  settings: memo(() => React.createElement(Settings, { size: 20, className: "text-gray-300" })),
};

// Sidebar Navigation Configuration
export const NAVIGATION_SECTIONS: NavigationSection[] = [
  {
    id: 'main',
    items: [
      {
        id: 'home',
        label: 'Home',
        href: '/home',
        icon: React.createElement(memoizedIcons.home),
      },
      {
        id: 'my-tasks',
        label: 'My Tasks',
        href: '/my-tasks',
        icon: React.createElement(memoizedIcons.myTasks),
        badge: { count: 0, color: 'default' },
      },
      {
        id: 'messages',
        label: 'Messages',
        href: '/messages',
        icon: React.createElement(memoizedIcons.messages),
      },
      {
        id: 'newsfeed',
        label: 'NewsFeed',
        href: '/newsfeed',
        icon: React.createElement(memoizedIcons.newsfeed),
      },
      {
        id: 'inbox',
        label: 'Inbox',
        href: '/inbox',
        icon: React.createElement(memoizedIcons.inbox),
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
        icon: React.createElement(memoizedIcons.goals),
      },
    ],
    collapsible: true,
    defaultExpanded: true,
  },
  {
    id: 'projects',
    title: 'Projects',
    items: [
      
    ],
    collapsible: true,
    defaultExpanded: true,
  },
  {
    id: 'teams',
    title: 'Teams',
    items: [


    ],
    collapsible: true,
    defaultExpanded: true,
  },

];

// Route Navigation Configuration (tích hợp từ routeNavigationConfig.ts)
export const ROUTE_NAVIGATION_CONFIG: Record<string, RouteConfig> = {
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

  '/newsfeed': {
    title: 'NewsFeed',
    avatarConfig: {
      type: 'icon',
      icon: SIDEBAR_ICONS.newsfeed,
      bgColor: 'orange-500',
    },
    navItems: [
      {
        label: '',
        href: '/newsfeed',
      },
    ],
    actions: [],
    showTabsPlus: false,
  },

  '/my-tasks': {
    title: 'My tasks',
    avatarConfig: {
      type: 'user',
      bgColor: 'gray-300',
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
      {
        label: 'Notes',
        href: '/my-tasks/notes',
        icon: LAYOUT_ICONS.notes,
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
        label: 'Dashboard',
        href: (params) => `/projects/${params.id}/dashboard`,
        icon: LAYOUT_ICONS.timeline,
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


  '/teams/:id': {
    title: 'Team',
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
        label: 'Dashboard',
        href: (params) => `/teams/${params.id}/dashboard`,
        icon: LAYOUT_ICONS.timeline,
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

export type { NavigationItem, NavigationSection };
