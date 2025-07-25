"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import { UserRole, Permission } from "@/constants/auth";
import { getSidebarNavigation } from "@/config/routes";
import { useAuth } from "@/hooks/useAuth";
import {
  LayoutContext,
  LayoutActions,
  LayoutConfig,
  UsePrivateLayoutReturn,
  NavigationGroup,
  HeaderNotification,
  BreadcrumbItem,
  QuickAction,
  SearchResult,
  UserMenuItem,
  LayoutUser,
} from "@/types/layout";

// Default layout configuration
const DEFAULT_CONFIG: LayoutConfig = {
  brand: {
    name: "TaskManager",
    logo: "/logo.svg",
    logoUrl: "/dashboard",
  },
  navigation: {
    enableGrouping: true,
    enableCollapse: true,
    showIcons: true,
    showBadges: true,
  },
  header: {
    enableSearch: true,
    enableNotifications: true,
    showUserInfo: true,
    enableQuickActions: true,
  },
  sidebar: {
    defaultWidth: 256,
    compactWidth: 64,
    enableResize: false,
    enableCollapse: true,
    position: "left",
  },
  theme: {
    primaryColor: "#3B82F6",
    accentColor: "#10B981",
    sidebarBg: "#FFFFFF",
    headerBg: "#FFFFFF",
  },
};

export function usePrivateLayout(
  customConfig?: Partial<LayoutConfig>
): UsePrivateLayoutReturn {
  const { user: authUser } = useAuth();
  const pathname = usePathname();

  // Merge custom config with defaults
  const config = useMemo(
    () => ({
      ...DEFAULT_CONFIG,
      ...customConfig,
    }),
    [customConfig]
  );

  // Layout state
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Convert auth user to layout user
  const user: LayoutUser | null = useMemo(() => {
    if (!authUser) return null;

    return {
      id: authUser.id,
      role: authUser.role,
      permissions: authUser.permissions,
      name: authUser.name,
      email: authUser.email,
      workspace: {
        id: "workspace-1",
        name: "My Workspace",
      },
    };
  }, [authUser]);

  // Generate navigation based on user role
  const navigation: NavigationGroup[] = useMemo(() => {
    if (!user) return [];

    const routeGroups = getSidebarNavigation(user.role);

    return routeGroups.map((group) => ({
      id: group.name.toLowerCase().replace(/\s+/g, "-"),
      title: group.name,
      icon: group.icon,
      items: group.routes.map((route) => ({
        key: route.path,
        title: route.title,
        href: route.path,
        icon: route.icon,
        isActive:
          pathname === route.path || pathname.startsWith(route.path + "/"),
        requiredPermissions: route.requiredPermissions,
        requiredRoles: route.accessRoles,
        isVisible: route.accessRoles.includes(user.role),
        order: route.order || 0,
      })),
      order: group.order,
      isCollapsible: group.routes.length > 3,
      isExpanded: true,
      requiredRoles: group.roles,
    }));
  }, [user, pathname]);

  // Generate quick actions based on user permissions
  const quickActions: QuickAction[] = useMemo(() => {
    if (!user) return [];

    const actions: QuickAction[] = [];

    if (user.permissions.includes(Permission.CREATE_PROJECT)) {
      actions.push({
        id: "create-project",
        title: "New Project",
        description: "Create a new project",
        icon: "plus",
        href: "/projects/create",
        color: "blue",
        requiredPermissions: [Permission.CREATE_PROJECT],
      });
    }

    if (user.permissions.includes(Permission.CREATE_TASK)) {
      actions.push({
        id: "create-task",
        title: "New Task",
        description: "Create a new task",
        icon: "check-square",
        href: "/tasks/create",
        color: "green",
        requiredPermissions: [Permission.CREATE_TASK],
      });
    }

    if (user.permissions.includes(Permission.INVITE_USERS)) {
      actions.push({
        id: "invite-user",
        title: "Invite Member",
        description: "Invite a team member",
        icon: "user-plus",
        href: "/team/invite",
        color: "purple",
        requiredPermissions: [Permission.INVITE_USERS],
      });
    }

    if (user.permissions.includes(Permission.VIEW_REPORTS)) {
      actions.push({
        id: "view-reports",
        title: "Reports",
        description: "View project reports",
        icon: "chart-line",
        href: "/reports",
        color: "orange",
        requiredPermissions: [Permission.VIEW_REPORTS],
      });
    }

    return actions;
  }, [user]);

  // Generate user menu items
  const userMenuItems: UserMenuItem[] = useMemo(() => {
    const items: UserMenuItem[] = [
      {
        key: "profile",
        title: "Profile",
        href: "/profile",
        icon: "user",
      },
      {
        key: "settings",
        title: "Settings",
        href: "/settings",
        icon: "settings",
      },
      {
        key: "notifications",
        title: "Notifications",
        href: "/notifications",
        icon: "bell",
      },
    ];

    // Add role-specific items
    if (user?.role === UserRole.OWNER) {
      items.splice(-1, 0, {
        key: "workspace",
        title: "Workspace Settings",
        href: "/owner/workspace",
        icon: "building",
        requiredRoles: [UserRole.OWNER],
      });

      items.splice(-1, 0, {
        key: "billing",
        title: "Billing",
        href: "/owner/billing",
        icon: "credit-card",
        requiredRoles: [UserRole.OWNER],
      });
    }

    items.push(
      { key: "divider-1", title: "", isDivider: true },
      {
        key: "sign-out",
        title: "Sign Out",
        icon: "log-out",
        onClick: () => signOut(),
      }
    );

    return items;
  }, [user]);

  // Calculate unread notification count
  const unreadNotificationCount = useMemo(() => {
    return notifications.filter((n) => !n.isRead).length;
  }, [notifications]);

  // Layout actions
  const setSidebarOpen = useCallback((open: boolean) => {
    setIsSidebarOpen(open);
  }, []);

  const setUserMenuOpen = useCallback((open: boolean) => {
    setIsUserMenuOpen(open);
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen((prev) => !prev);
  }, []);

  const performSearch = useCallback(
    async (query: string): Promise<SearchResult[]> => {
      if (!query.trim()) {
        setSearchResults([]);
        return [];
      }

      setIsLoading(true);

      try {
        // Simulate API call - replace with actual search implementation
        await new Promise((resolve) => setTimeout(resolve, 300));

        const mockResults: SearchResult[] = [
          {
            id: "1",
            title: `Project containing "${query}"`,
            description: "A project that matches your search",
            type: "project",
            url: "/projects/1",
            icon: "folder",
          },
          {
            id: "2",
            title: `Task containing "${query}"`,
            description: "A task that matches your search",
            type: "task",
            url: "/tasks/1",
            icon: "check-square",
          },
          {
            id: "3",
            title: `User containing "${query}"`,
            description: "A user that matches your search",
            type: "user",
            url: "/team/members/1",
            icon: "user",
          },
        ];

        setSearchResults(mockResults);
        return mockResults;
      } catch (error) {
        console.error("Search error:", error);
        setSearchResults([]);
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, isRead: true }))
    );
  }, []);

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);

    try {
      // Simulate API call - replace with actual notification fetching
      await new Promise((resolve) => setTimeout(resolve, 500));

      const mockNotifications: HeaderNotification[] = [
        {
          id: "1",
          title: "New Project Assigned",
          message: "You have been assigned to Project Alpha",
          type: "info",
          isRead: false,
          timestamp: new Date(),
          actionUrl: "/projects/alpha",
          actionText: "View Project",
        },
        {
          id: "2",
          title: "Task Completed",
          message: 'Your task "Design Review" has been completed',
          type: "success",
          isRead: false,
          timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
        },
        {
          id: "3",
          title: "Meeting Reminder",
          message: "Team standup in 15 minutes",
          type: "warning",
          isRead: true,
          timestamp: new Date(Date.now() - 1000 * 60 * 60), // 1 hour ago
        },
      ];

      setNotifications(mockNotifications);
    } catch (error) {
      console.error("Failed to refresh notifications:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateBreadcrumbs = useCallback((newBreadcrumbs: BreadcrumbItem[]) => {
    setBreadcrumbs(newBreadcrumbs);
  }, []);

  const signOut = useCallback(() => {
    // Implement sign out logic
    console.log("Signing out...");
    // Clear user state, redirect to login, etc.
  }, []);

  // Auto-generate breadcrumbs based on current path
  useEffect(() => {
    const generateBreadcrumbs = (): BreadcrumbItem[] => {
      const segments = pathname.split("/").filter(Boolean);
      const breadcrumbs: BreadcrumbItem[] = [
        { title: "Dashboard", href: "/dashboard", icon: "home" },
      ];

      let currentPath = "";
      segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === segments.length - 1;

        // Capitalize and format segment
        const title =
          segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, " ");

        breadcrumbs.push({
          title,
          href: isLast ? undefined : currentPath,
          isActive: isLast,
        });
      });

      return breadcrumbs;
    };

    setBreadcrumbs(generateBreadcrumbs());
  }, [pathname]);

  // Load initial notifications
  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  // Create context object
  const context: LayoutContext = {
    user,
    navigation,
    notifications,
    unreadNotificationCount,
    breadcrumbs,
    quickActions,
    isLoading,
    isSidebarOpen,
    isUserMenuOpen,
    searchQuery,
    searchResults,
    currentPath: pathname,
  };

  // Create actions object
  const actions: LayoutActions = {
    setSidebarOpen,
    setUserMenuOpen,
    toggleSidebar,
    toggleUserMenu,
    setSearchQuery,
    performSearch,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshNotifications,
    updateBreadcrumbs,
    signOut,
  };

  return {
    context,
    actions,
    config,
  };
}
