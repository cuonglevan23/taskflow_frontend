"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { usePathname, useRouter } from "next/navigation";
import { UserRole } from "@/types/auth";
import { useAuth } from "@/components/auth/AuthProvider"; // Thay thế useUser
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
  const { user, isLoading: userDataLoading, logout: authLogout } = useAuth(); // Sử dụng useAuth thay vì useUser

  // Layout state với localStorage persistence
  const [isSidebarOpen, setIsSidebarOpen] = useState(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) return false; // Mobile mặc định đóng
      
      // Desktop: check localStorage hoặc mặc định mở
      const saved = localStorage.getItem('sidebar-open');
      return saved ? JSON.parse(saved) : true;
    }
    return true; // SSR fallback
  });
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [notifications, setNotifications] = useState<HeaderNotification[]>([]);
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Persist sidebar state to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-open', JSON.stringify(isSidebarOpen));
    }
  }, [isSidebarOpen]);

  // Chỉ đóng sidebar trên mobile khi navigate
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isMobile = window.innerWidth < 1024;
      if (isMobile) {
        // Kiểm tra current state thay vì depend vào state
        const currentSidebarState = JSON.parse(localStorage.getItem('sidebar-open') || 'false');
        if (currentSidebarState) {
          // Delay một chút để tránh đóng ngay lập tức
          const timer = setTimeout(() => {
            setIsSidebarOpen(false);
          }, 100);
          return () => clearTimeout(timer);
        }
      }
    }
  }, [pathname]);

  // User data is already combined in UserContext - no need to merge here

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
        requiredRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
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
            key: "projects-list",
            title: "All Projects",
            href: "/projects/list",
            icon: "list",
          },
        ],
        order: 2,
        requiredRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
      },
      {
        id: "tasks",
        title: "Tasks",
        icon: "check-square",
        items: [
          {
            key: "tasks",
            title: "My Tasks",
            href: "/my-tasks",
            icon: "check-square",
          },
          {
            key: "task-board",
            title: "Task Board",
            href: "/my-tasks/board",
            icon: "trello",
          },
        ],
        order: 3,
        requiredRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER, UserRole.MEMBER],
      },
      {
        id: "management",
        title: "Management",
        icon: "briefcase",
        items: [
          {
            key: "management-center",
            title: "Management Center",
            href: "/manager",
            icon: "settings",
          },
          {
            key: "reports",
            title: "Reports",
            href: "/reports",
            icon: "chart-line",
          },
        ],
        order: 4,
        requiredRoles: [UserRole.OWNER, UserRole.PM, UserRole.LEADER],
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
            description: "A projects that matches your search",
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
      await authLogout();
      // Redirect to login page after successful logout
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }, [authLogout, router]);

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
    setSidebarOpen: (open: boolean) => {
      setIsSidebarOpen(open);
      if (typeof window !== 'undefined') {
        localStorage.setItem('sidebar-open', JSON.stringify(open));
      }
    },
    setSidebarCollapsed: setIsSidebarCollapsed,
    setUserMenuOpen: setIsUserMenuOpen,
    toggleSidebar: () => {
      setIsSidebarOpen((prev: boolean) => {
        const newState = !prev;
        if (typeof window !== 'undefined') {
          localStorage.setItem('sidebar-open', JSON.stringify(newState));
        }
        return newState;
      });
    },
    toggleSidebarCollapse: () => setIsSidebarCollapsed((prev: boolean) => !prev),
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
