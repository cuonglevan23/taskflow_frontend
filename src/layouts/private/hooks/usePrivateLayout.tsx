"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/types/auth";
import { useMockAuth } from "@/providers/MockAuthProvider";
import {
  LayoutContextValue,
  LayoutActions,
  SearchResult,
  HeaderNotification,
  BreadcrumbItem,
} from "../../types";

export function usePrivateLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const { user: authUser, logout } = useMockAuth();

  // Layout state
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use real user from auth context
  const user = useMemo(() => {
    if (!authUser) return null;
    
    const userData = {
      id: authUser.id,
      name: authUser.name,
      email: authUser.email,
      role: authUser.role as UserRole,
      permissions: [],
      avatar: "",
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Console log current role for debugging
    console.log('🔐 Current User Role:', authUser.role.toUpperCase());
    console.log('👤 Current User:', authUser.name, `(${authUser.email})`);
    console.log('📋 User Data:', userData);
    
    return userData;
  }, [authUser]);

  // Mock navigation
  const navigation = useMemo(
    () => [
      {
        id: "main",
        title: "Dashboard",
        icon: "home",
        items: [
          {
            key: "home",
            title: "Home",
            href: "/home",
            icon: "home",
          },
        ],
        order: 1,
        requiredRoles: [UserRole.OWNER],
      },
      {
        id: "projects",
        title: "Projects",
        icon: "folder",
        items: [
          {
            key: "projects",
            title: "Projects",
            href: "/projects",
            icon: "folder",
          },
          {
            key: "project-list",
            title: "All Projects",
            href: "/projects/list",
            icon: "list",
          },
        ],
        order: 2,
        requiredRoles: [UserRole.OWNER],
      },
      {
        id: "tasks",
        title: "Tasks",
        icon: "check-square",
        items: [
          {
            key: "tasks",
            title: "My Tasks",
            href: "/tasks",
            icon: "check-square",
          },
          {
            key: "task-board",
            title: "Task Board",
            href: "/tasks/board",
            icon: "trello",
          },
        ],
        order: 3,
        requiredRoles: [UserRole.OWNER],
      },
    ],
    []
  );

  // Layout actions
  const performSearch = useCallback(
    async (query: string): Promise<SearchResult[]> => {
      if (!query.trim()) {
        setSearchResults([]);
        return [];
      }

      setIsLoading(true);

      try {
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

  const signOut = useCallback(async () => {
    try {
      await logout();
      // Redirect to login page after successful logout
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [logout, router]);

  // Auto-generate breadcrumbs
  useEffect(() => {
    const generateBreadcrumbs = (): BreadcrumbItem[] => {
      const segments = pathname.split("/").filter(Boolean);
      const breadcrumbs: BreadcrumbItem[] = [
        { title: "Home", href: "/home", icon: "home" },
      ];

      let currentPath = "";
      segments.forEach((segment, index) => {
        currentPath += `/${segment}`;
        const isLast = index === segments.length - 1;

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

  useEffect(() => {
    refreshNotifications();
  }, [refreshNotifications]);

  const context: LayoutContextValue = {
    user,
    navigation,
    notifications,
    unreadNotificationCount: notifications.filter((n) => !n.isRead).length,
    breadcrumbs,
    quickActions: [],
    isLoading,
    isSidebarOpen,
    isSidebarCollapsed,
    isUserMenuOpen,
    searchQuery,
    searchResults,
    currentPath: pathname,
  };

  const actions: LayoutActions = {
    setSidebarOpen: setIsSidebarOpen,
    setSidebarCollapsed: setIsSidebarCollapsed,
    setUserMenuOpen: setIsUserMenuOpen,
    toggleSidebar: () => setIsSidebarOpen((prev) => !prev),
    toggleSidebarCollapse: () => setIsSidebarCollapsed((prev) => !prev),
    toggleUserMenu: () => setIsUserMenuOpen((prev) => !prev),
    setSearchQuery,
    performSearch,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshNotifications,
    updateBreadcrumbs,
    signOut,
  };

  return { context, actions };
}
