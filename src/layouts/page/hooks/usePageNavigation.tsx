"use client";

import { usePathname } from "next/navigation";
import React, { ReactNode, useMemo } from "react";
import { ROUTE_NAVIGATION_CONFIG } from "../configs/routeNavigationConfig";
import { matchRoute, buildNavigationItems } from "../utils/routeMatcher";
import { NavigationAvatar } from "../components/NavigationAvatar";

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

  // Memoized route configuration processing
  const navigationConfig = useMemo(() => {
    const routeKeys = Object.keys(ROUTE_NAVIGATION_CONFIG);
    const routeMatch = matchRoute(pathname, routeKeys);

    if (!routeMatch.isMatch) {
      return null;
    }

    const config = ROUTE_NAVIGATION_CONFIG[routeMatch.config];
    
    // Build navigation items with dynamic parameters
    const navItems = buildNavigationItems(config.navItems, routeMatch.params).map(item => ({
      ...item,
      icon: item.icon ? <item.icon className="w-4 h-4" /> : undefined,
    }));

    // Build header info with memoized avatar
    const headerInfo: PageHeaderInfo = {};
    
    if (config.avatarConfig) {
      headerInfo.avatar = <NavigationAvatar config={config.avatarConfig} />;
    }


    return {
      title: config.title,
      navItems,
      actions: config.actions || [],
      headerInfo: Object.keys(headerInfo).length > 0 ? headerInfo : undefined,
      showTabsPlus: config.showTabsPlus || false,
    };
  }, [pathname]);

  return navigationConfig;
};
