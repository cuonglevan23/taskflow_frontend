"use client";

import React, { createContext, useContext, useState, useCallback, useMemo, ReactNode, useEffect } from "react";
import {
  NotificationResponse,
  NotificationType,
  NotificationPriority
} from "@/types/notification";
import { NotificationService } from "@/services/notification";
import { useNotifications as useNotificationsHook } from "@/hooks/notifications";
import { useAuth } from "@/components/auth/AuthProvider";

// Notification Status
export type NotificationStatus = "unread" | "read" | "archived" | "bookmarked";

// Extended notification interface that includes UI state
export interface UINotification extends NotificationResponse {
  isBookmarked: boolean;
  isArchived: boolean;
}

export interface NotificationFilters {
  type?: NotificationType[];
  priority?: NotificationPriority[];
  status?: NotificationStatus[];
  dateRange?: { start: Date; end: Date };
  searchQuery?: string;
}

export interface NotificationStats {
  total: number;
  unread: number;
  bookmarked: number;
  archived: number;
  byType: Partial<Record<NotificationType, number>>;
  byPriority: Record<NotificationPriority, number>;
  recentCount: number; // Last 24 hours
}

export interface NotificationContextType {
  // Data
  notifications: UINotification[];
  filteredNotifications: UINotification[];

  // State
  isLoading: boolean;
  error: string | null;
  filters: NotificationFilters;
  
  // Actions
  markAsRead: (id: number) => Promise<void>;
  markAsUnread: (id: number) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  bookmark: (id: number) => Promise<void>;
  unbookmark: (id: number) => Promise<void>;
  archive: (id: number) => Promise<void>;
  unarchive: (id: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;

  // Computed
  stats: NotificationStats;
  
  // UI State
  selectedNotifications: number[];
  showMoreMenu: number | null;

  // UI Actions
  setFilters: (filters: NotificationFilters) => void;
  setSelectedNotifications: (ids: number[]) => void;
  toggleSelection: (id: number) => void;
  clearSelection: () => void;
  showMoreActions: (id: number) => void;
  hideMoreActions: () => void;
}

// Create Context
const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Storage keys for local state persistence
const STORAGE_KEYS = {
  bookmarked: 'bookmarkedNotifications',
  archived: 'archivedNotifications',
  filters: 'notificationFilters'
} as const;

const saveToStorage = (key: string, data: unknown) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(key, JSON.stringify(data));
  }
};

const getFromStorage = <T,>(key: string, defaultValue: T): T => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultValue;
  }
  return defaultValue;
};

// Provider Props
interface NotificationProviderProps {
  children: ReactNode;
}

// Notification Provider that integrates with our API service
export function NotificationProvider({ children }: NotificationProviderProps) {
  const {
    notifications: hookNotifications,
    loading: hookLoading,
    error: hookError,
    fetchUnreadNotifications,
    markAsRead: hookMarkAsRead,
    markAllAsRead: hookMarkAllAsRead,
  } = useNotificationsHook();

  // Local UI state
  const [bookmarkedIds, setBookmarkedIds] = useState<number[]>(() =>
    getFromStorage(STORAGE_KEYS.bookmarked, [])
  );
  const [archivedIds, setArchivedIds] = useState<number[]>(() =>
    getFromStorage(STORAGE_KEYS.archived, [])
  );
  const [filters, setFilters] = useState<NotificationFilters>(() =>
    getFromStorage(STORAGE_KEYS.filters, {})
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedNotifications, setSelectedNotifications] = useState<number[]>([]);
  const [showMoreMenu, setShowMoreMenu] = useState<number | null>(null);

  // Combine API notifications with local state (bookmarks, archives)
  const notifications = useMemo((): UINotification[] => {
    return hookNotifications.map(notification => ({
      ...notification,
      isBookmarked: bookmarkedIds.includes(notification.id),
      isArchived: archivedIds.includes(notification.id)
    }));
  }, [hookNotifications, bookmarkedIds, archivedIds]);

  // Filtered notifications based on user preferences
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter out archived notifications unless specifically requested
    if (!filters.status?.includes('archived')) {
      filtered = filtered.filter(n => !n.isArchived);
    }

    // Apply type filters
    if (filters.type?.length) {
      filtered = filtered.filter(n => filters.type!.includes(n.type));
    }
    
    // Apply priority filters with type safety
    if (filters.priority?.length) {
      filtered = filtered.filter(n => {
        // Handle priority field properly - it's a number in the API but we filter by string values
        if (typeof n.priority !== 'number') return false;

        // Map numeric priority to string priority for filtering
        let priorityString: NotificationPriority;
        switch (n.priority) {
          case 1:
            priorityString = 'LOW';
            break;
          case 2:
            priorityString = 'MEDIUM';
            break;
          case 3:
            priorityString = 'HIGH';
            break;
          case 4:
            priorityString = 'URGENT';
            break;
          default:
            return false;
        }

        return filters.priority!.includes(priorityString);
      });
    }
    
    // Apply status filters
    if (filters.status?.length) {
      filtered = filtered.filter(n => {
        const status: NotificationStatus = n.isArchived
          ? 'archived'
          : n.isBookmarked
            ? 'bookmarked'
            : n.isRead ? 'read' : 'unread';
        return filters.status!.includes(status);
      });
    }
    
    // Apply search filters
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      filtered = filtered.filter(n => 
        n.title.toLowerCase().includes(query) ||
        n.content?.toLowerCase().includes(query)
      );
    }
    
    // Apply date range filters
    if (filters.dateRange) {
      filtered = filtered.filter(n => {
        const timestamp = new Date(n.createdAt);
        return timestamp >= filters.dateRange!.start && timestamp <= filters.dateRange!.end;
      });
    }

    // Sort by creation date (newest first)
    return filtered.sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  }, [notifications, filters]);

  // Calculate notification statistics
  const stats = useMemo((): NotificationStats => {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    
    const byType = notifications.reduce((acc, n) => {
      acc[n.type] = (acc[n.type] || 0) + 1;
      return acc;
    }, {} as Partial<Record<NotificationType, number>>);

    // Calculate stats with type safety
    const byPriority = notifications.reduce((acc, n) => {
      if (typeof n.priority === 'number') {
        // Map numeric priority to string priority for stats
        let priorityString: NotificationPriority;
        switch (n.priority) {
          case 1:
            priorityString = 'LOW';
            break;
          case 2:
            priorityString = 'MEDIUM';
            break;
          case 3:
            priorityString = 'HIGH';
            break;
          case 4:
            priorityString = 'URGENT';
            break;
          default:
            return acc; // Skip invalid priority values
        }
        acc[priorityString] = (acc[priorityString] || 0) + 1;
      }
      return acc;
    }, {} as Record<NotificationPriority, number>);

    return {
      total: notifications.length,
      unread: notifications.filter(n => !n.isRead).length,
      bookmarked: bookmarkedIds.length,
      archived: archivedIds.length,
      byType,
      byPriority,
      recentCount: notifications.filter(n => {
        const timestamp = new Date(n.createdAt);
        return timestamp > yesterday;
      }).length,
    };
  }, [notifications, bookmarkedIds.length, archivedIds.length]);

  // Persist local state to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.bookmarked, bookmarkedIds);
  }, [bookmarkedIds]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.archived, archivedIds);
  }, [archivedIds]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.filters, filters);
  }, [filters]);

  // Mark as read (integrates with API)
  const markAsRead = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      await hookMarkAsRead([id]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as read');
    } finally {
      setIsLoading(false);
    }
  }, [hookMarkAsRead]);

  // Mark as unread (local state only for now)
  const markAsUnread = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      // In the future, when API supports this functionality:
      // await NotificationService.markAsUnread([id]);

      // For now, update local state
      const notification = notifications.find(n => n.id === id);
      if (notification) {
        await NotificationService.syncNotifications();
        await fetchUnreadNotifications();
      }
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark as unread');
    } finally {
      setIsLoading(false);
    }
  }, [notifications, fetchUnreadNotifications]);

  // Mark all as read (integrates with API)
  const markAllAsReadHandler = useCallback(async () => {
    setIsLoading(true);
    try {
      await hookMarkAllAsRead();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to mark all as read');
    } finally {
      setIsLoading(false);
    }
  }, [hookMarkAllAsRead]);

  // Bookmark (local state only)
  const bookmark = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      setBookmarkedIds(prev => [...prev, id]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to bookmark notification');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Unbookmark (local state only)
  const unbookmark = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      setBookmarkedIds(prev => prev.filter(itemId => itemId !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unbookmark notification');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Archive (local state only)
  const archive = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      setArchivedIds(prev => [...prev, id]);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to archive notification');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Unarchive (local state only)
  const unarchive = useCallback(async (id: number) => {
    setIsLoading(true);
    try {
      setArchivedIds(prev => prev.filter(itemId => itemId !== id));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to unarchive notification');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Refresh notifications (integrates with API)
  const refreshNotifications = useCallback(async () => {
    setIsLoading(true);
    try {
      await fetchUnreadNotifications();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh notifications');
    } finally {
      setIsLoading(false);
    }
  }, [fetchUnreadNotifications]);

  // UI Actions
  const toggleSelection = useCallback((id: number) => {
    setSelectedNotifications(prev =>
      prev.includes(id) 
        ? prev.filter(itemId => itemId !== id)
        : [...prev, id]
    );
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedNotifications([]);
  }, []);

  const showMoreActions = useCallback((id: number) => {
    setShowMoreMenu(id);
  }, []);

  const hideMoreActions = useCallback(() => {
    setShowMoreMenu(null);
  }, []);

  // Handle API errors with proper type conversion
  useEffect(() => {
    if (hookError) {
      setError(hookError.message || 'Unknown error');
    }
  }, [hookError]);

  // Set global loading state
  useEffect(() => {
    if (!isLoading) {
      setIsLoading(hookLoading);
    }
  }, [hookLoading, isLoading]);

  // Update filters handler
  const handleSetFilters = useCallback((newFilters: NotificationFilters) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters
    }));
  }, []);

  // Context value
  const contextValue = useMemo(() => ({
    notifications,
    filteredNotifications,
    isLoading,
    error,
    filters,
    markAsRead,
    markAsUnread,
    markAllAsRead: markAllAsReadHandler,
    bookmark,
    unbookmark,
    archive,
    unarchive,
    refreshNotifications,
    stats,
    selectedNotifications,
    showMoreMenu,
    setFilters: handleSetFilters,
    setSelectedNotifications,
    toggleSelection,
    clearSelection,
    showMoreActions,
    hideMoreActions
  }), [
    notifications,
    filteredNotifications,
    isLoading,
    error,
    filters,
    markAsRead,
    markAsUnread,
    markAllAsReadHandler,
    bookmark,
    unbookmark,
    archive,
    unarchive,
    refreshNotifications,
    stats,
    selectedNotifications,
    showMoreMenu,
    handleSetFilters,
    setSelectedNotifications,
    toggleSelection,
    clearSelection,
    showMoreActions,
    hideMoreActions
  ]);

  return (
    <NotificationContext.Provider value={contextValue}>
      {children}
    </NotificationContext.Provider>
  )
}

// Helper hook to access full context
export function useNotificationContext(): NotificationContextType {
  const ctx = React.useContext(NotificationContext);
  if (!ctx) throw new Error('useNotificationContext must be used within NotificationProvider');
  return ctx;
}
// Backward compatible hooks (simple projections)
export function useNotifications() { return useNotificationContext(); }
export function useInboxNotifications() { return useNotificationContext(); }
export function useHeaderNotifications() { return useNotificationContext(); }
export function useBookmarkedNotifications() { return useNotificationContext(); }
export function useArchivedNotifications() { return useNotificationContext(); }
