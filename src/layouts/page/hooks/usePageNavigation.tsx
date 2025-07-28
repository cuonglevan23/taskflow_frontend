"use client";

import { usePathname } from "next/navigation";
import React, { ReactNode } from "react";
import {
  ACTION_ICONS,
  LAYOUT_ICONS,
  USER_ICONS,
  FILE_ICONS,
  HEADER_ICONS,
} from "@/constants/icons";

export interface NavigationItem {
  label: string;
  href: string;
  icon?: ReactNode;
}

export interface HeaderAction {
  label: string;
  icon?: ReactNode;
  onClick?: () => void;
  variant?: "default" | "primary" | "ghost";
}

export interface PageHeaderInfo {
  avatar?: ReactNode;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  customContent?: ReactNode;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: ReactNode;
}

export interface HeaderSection {
  id: string;
  content: ReactNode;
  position?: "top" | "middle" | "bottom";
  className?: string;
}

export interface PageNavigationConfig {
  title: string;
  navItems: NavigationItem[];
  actions: HeaderAction[];
  headerInfo?: PageHeaderInfo;
  showTabsPlus?: boolean;
  headerSections?: HeaderSection[];
}

export const usePageNavigation = (): PageNavigationConfig | null => {
  const pathname = usePathname();

  // MyTask Navigation
  if (pathname.startsWith("/mytask")) {
    return {
      title: "My Task",
      navItems: [
        {
          label: "List",
          href: "/mytask/list",
        },
        {
          label: "Board",
          href: "/mytask/board",
        },
        {
          label: "Calendar",
          href: "/mytask/calendar",
        },
        {
          label: "Dashboard",
          href: "/mytask/dashboard",
        },
        {
          label: "File",
          href: "/mytask/file",
        },
      ],
      actions: [
        {
          label: "Filter",
          icon: <ACTION_ICONS.filter className="w-4 h-4" />,
          variant: "ghost",
        },
        {
          label: "Sort: Priority",
          icon: <ACTION_ICONS.sort className="w-4 h-4" />,
          variant: "ghost",
        },
        {
          label: "Add Task",
          icon: <ACTION_ICONS.create className="w-4 h-4" />,
          variant: "primary",
        },
        {
          label: "",
          icon: <HEADER_ICONS.chevronDown className="w-5 h-5" />,
          variant: "ghost",
        },
      ],
      showTabsPlus: true,
    };
  }

  // Inbox Navigation
  if (pathname.startsWith("/inbox")) {
    return {
      title: "Inbox",
      navItems: [
        {
          label: "Activity",
          href: "/inbox",
        },
        {
          label: "Bookmarks",
          href: "/inbox/bookmarks",
        },
        {
          label: "Archive",
          href: "/inbox/archive",
        },
      ],
      actions: [
        {
          label: "Filter",
          icon: <ACTION_ICONS.filter className="w-4 h-4" />,
          variant: "ghost",
        },
        {
          label: "Sort: Newest",
          icon: <ACTION_ICONS.sort className="w-4 h-4" />,
          variant: "ghost",
        },
        {
          label: "Manage notifications",
          variant: "primary",
        },
        {
          label: "",
          icon: <HEADER_ICONS.chevronDown className="w-5 h-5" />,
          variant: "ghost",
        },
      ],
      showTabsPlus: true,
    };
  }

  return null;
};
