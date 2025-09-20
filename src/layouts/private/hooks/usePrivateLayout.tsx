"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/constants/auth";
import { useAuth } from "@/components/auth/AuthProvider";
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
  const { user, isLoading: userDataLoading, logout: authLogout, isAuthenticated } = useAuth();

  // Layout state - Start with server-safe defaults
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Handle client-side initialization after hydration
  useEffect(() => {
    if (typeof window !== 'undefined' && !isHydrated) {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        setIsSidebarOpen(false);
      } else {
        const saved = localStorage.getItem('sidebar-open');
        setIsSidebarOpen(saved ? JSON.parse(saved) : true);
      }
      setIsHydrated(true);
    }
  }, [isHydrated]);

  // Persist sidebar state
  useEffect(() => {
    if (typeof window !== 'undefined' && isHydrated) {
      localStorage.setItem('sidebar-open', JSON.stringify(isSidebarOpen));
    }
  }, [isSidebarOpen, isHydrated]);

  // Close sidebar on mobile navigation
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 1024;
      if (isMobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    }
  }, [pathname, isSidebarOpen]);

  // Action callbacks - defined at top level
  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prev => !prev);
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setIsSidebarOpen(open);
  }, []);

  const toggleSidebarCollapse = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const setSidebarCollapsed = useCallback((collapsed: boolean) => {
    setIsSidebarCollapsed(collapsed);
  }, []);

  const toggleUserMenu = useCallback(() => {
    setIsUserMenuOpen(prev => !prev);
  }, []);

  const setUserMenuOpen = useCallback((open: boolean) => {
    setIsUserMenuOpen(open);
  }, []);

  const performSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    setSearchQuery(query);

    // Mock search results
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
  }, []);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  const signOut = useCallback(async () => {
    try {
      await authLogout();
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [authLogout, router]);

  const markNotificationAsRead = useCallback((notificationId: string) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, isRead: true }
          : notification
      )
    );
  }, []);

  const markAllNotificationsAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, isRead: true }))
    );
  }, []);

  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      // Mock implementation
      await new Promise(resolve => setTimeout(resolve, 500));
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

  // Navigation groups - static data
  const navigationGroups = useMemo(() => [
    {
      id: "main",
      title: "Main",
      icon: "home",
      items: [
        { key: "dashboard", title: "Dashboard", href: "/home", icon: "home" },
        { key: "inbox", title: "Inbox", href: "/inbox", icon: "inbox" },
        { key: "newsfeed", title: "Newsfeed", href: "/newsfeed", icon: "rss" },
      ],
      order: 1,
      requiredRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    },
    {
      id: "projects",
      title: "Projects",
      icon: "folder",
      items: [
        { key: "projects", title: "Projects", href: "/projects", icon: "folder" },
        { key: "projects-list", title: "All Projects", href: "/projects/list", icon: "list" },
      ],
      order: 2,
      requiredRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    },
    {
      id: "tasks",
      title: "Tasks",
      icon: "check-square",
      items: [
        { key: "tasks", title: "My Tasks", href: "/my-tasks", icon: "check-square" },
        { key: "task-board", title: "Task Board", href: "/my-tasks/board", icon: "trello" },
      ],
      order: 3,
      requiredRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
    },
  ], []);

  // ✅ FIX: Ensure user is properly passed to context even during loading
  const effectiveUser = useMemo(() => {
    // Return user if authenticated, null otherwise
    return isAuthenticated && user ? user : null;
  }, [isAuthenticated, user]);

  // Actions object
  const actions: LayoutActions = {
    toggleSidebar,
    setSidebarOpen,
    toggleSidebarCollapse,
    setSidebarCollapsed,
    toggleUserMenu,
    setUserMenuOpen,
    performSearch,
    clearSearch,
    signOut,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    refreshNotifications,
    updateBreadcrumbs,
  };

  // Context value - Use effectiveUser instead of raw user
  const contextValue: LayoutContextValue = {
    user: effectiveUser, // ✅ FIX: Use effectiveUser instead of user
    isLoading: userDataLoading || isLoading,
    isSidebarOpen,
    isSidebarCollapsed,
    isUserMenuOpen,
    searchQuery,
    searchResults,
    notifications,
    breadcrumbs,
    navigationGroups,
    unreadNotificationsCount: notifications.filter(n => !n.isRead).length,
  };

  return {
    context: contextValue,
    actions,
  };
}
