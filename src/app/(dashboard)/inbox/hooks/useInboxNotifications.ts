import { useState, useCallback, useEffect } from 'react';
import { NotificationService } from '@/services/notification/notificationService';
import {
  NotificationResponse,
  GetNotificationsParams,
  EnhancedNotificationCountResponse
} from '@/types/notification';
import useSWR from 'swr';
import { useAuth } from '@/components/auth/AuthProvider';

export interface InboxFilters {
  type?: string[];
  read?: boolean;
  priority?: string[];
  dateRange?: {
    startDate?: string;
    endDate?: string;
  };
}

export interface InboxSortOptions {
  sortBy: 'createdAt' | 'readAt' | 'priority';
  sortOrder: 'asc' | 'desc';
}

interface UseInboxNotificationsReturn {
  notifications: NotificationResponse[];
  enhancedCounts: EnhancedNotificationCountResponse | null;
  loading: boolean;
  error: Error | null;
  filters: InboxFilters;
  sortOptions: InboxSortOptions;
  pagination: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };

  // Actions
  setFilters: (filters: InboxFilters) => void;
  setSortOptions: (options: InboxSortOptions) => void;
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Data fetchers
  fetchInboxNotifications: () => Promise<void>;
  refreshInbox: () => Promise<void>;

  // Single notification actions
  markAsRead: (id: number) => Promise<void>;
  markAsUnread: (id: number) => Promise<void>;
  toggleBookmark: (id: number) => Promise<void>;
  archiveNotification: (id: number) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;

  // Bulk actions
  markMultipleAsRead: (ids: number[]) => Promise<void>;
  archiveMultiple: (ids: number[]) => Promise<void>;
  deleteMultiple: (ids: number[]) => Promise<void>;
}

/**
 * Hook for managing inbox notifications with filtering, sorting, and pagination
 */
export const useInboxNotifications = (): UseInboxNotificationsReturn => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // State management
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Filters and sorting state
  const [filters, setFilters] = useState<InboxFilters>({});
  const [sortOptions, setSortOptions] = useState<InboxSortOptions>({
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });

  // Pagination state
  const [pagination, setPagination] = useState({
    page: 0,
    size: 20,
    totalElements: 0,
    totalPages: 0,
    hasNext: false,
    hasPrevious: false
  });

  // Enhanced notification counts using SWR
  const {
    data: enhancedCounts,
    error: countsError,
    mutate: refreshCounts
  } = useSWR<EnhancedNotificationCountResponse>(
    isAuthenticated && !authLoading ? '/api/notifications/count/enhanced' : null,
    () => NotificationService.getEnhancedCount(),
    {
      refreshInterval: 30000,
      revalidateOnFocus: true,
      dedupingInterval: 5000
    }
  );

  // Build query parameters
  const buildQueryParams = useCallback((): GetNotificationsParams => {
    const params: GetNotificationsParams = {
      page: pagination.page,
      size: pagination.size,
      sort: `${sortOptions.sortBy},${sortOptions.sortOrder}`
    };

    if (filters.type && filters.type.length > 0) {
      params.type = filters.type as any[];
    }

    if (filters.read !== undefined) {
      params.read = filters.read;
    }

    if (filters.priority && filters.priority.length > 0) {
      params.priority = filters.priority as any[];
    }

    if (filters.dateRange?.startDate) {
      params.startDate = filters.dateRange.startDate;
    }

    if (filters.dateRange?.endDate) {
      params.endDate = filters.dateRange.endDate;
    }

    return params;
  }, [filters, sortOptions, pagination.page, pagination.size]);

  // Fetch inbox notifications (non-archived)
  const fetchInboxNotifications = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;

    setLoading(true);
    try {
      const params = buildQueryParams();
      const response = await NotificationService.getInboxNotifications(params);

      setNotifications(response.content);
      setPagination(prev => ({
        ...prev,
        totalElements: response.totalElements,
        totalPages: response.totalPages,
        hasNext: !response.last,
        hasPrevious: !response.first
      }));

      await refreshCounts();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch inbox notifications'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, buildQueryParams, refreshCounts]);

  // Refresh inbox
  const refreshInbox = useCallback(async () => {
    await fetchInboxNotifications();
  }, [fetchInboxNotifications]);

  // Single notification actions
  const markAsRead = useCallback(async (id: number) => {
    if (!isAuthenticated) return;

    try {
      await NotificationService.markAsRead([id]);

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );

      await refreshCounts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark notification as read'));
    }
  }, [isAuthenticated, refreshCounts]);

  const markAsUnread = useCallback(async (id: number) => {
    if (!isAuthenticated) return;

    try {
      // Note: You might need to add an unread endpoint to your API
      // For now, we'll just update the local state
      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? { ...notification, isRead: false, readAt: null }
            : notification
        )
      );

      await refreshCounts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark notification as unread'));
    }
  }, [isAuthenticated, refreshCounts]);

  const toggleBookmark = useCallback(async (id: number) => {
    if (!isAuthenticated) return;

    try {
      const notification = notifications.find(n => n.id === id);
      const newBookmarkState = !notification?.isBookmarked;

      await NotificationService.toggleBookmark(id, newBookmarkState);

      setNotifications(prev =>
        prev.map(notification =>
          notification.id === id
            ? {
                ...notification,
                isBookmarked: newBookmarkState,
                bookmarkedAt: newBookmarkState ? new Date().toISOString() : null
              }
            : notification
        )
      );

      await refreshCounts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to toggle bookmark'));
    }
  }, [isAuthenticated, notifications, refreshCounts]);

  const archiveNotification = useCallback(async (id: number) => {
    if (!isAuthenticated) return;

    try {
      await NotificationService.toggleArchive(id, true);

      // Remove from inbox (since archived items don't show in inbox)
      setNotifications(prev => prev.filter(notification => notification.id !== id));

      setPagination(prev => ({
        ...prev,
        totalElements: prev.totalElements - 1
      }));

      await refreshCounts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to archive notification'));
    }
  }, [isAuthenticated, refreshCounts]);

  const deleteNotification = useCallback(async (id: number) => {
    if (!isAuthenticated) return;

    try {
      await NotificationService.deleteNotification(id);

      setNotifications(prev => prev.filter(notification => notification.id !== id));

      setPagination(prev => ({
        ...prev,
        totalElements: prev.totalElements - 1
      }));

      await refreshCounts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete notification'));
    }
  }, [isAuthenticated, refreshCounts]);

  // Bulk actions
  const markMultipleAsRead = useCallback(async (ids: number[]) => {
    if (!isAuthenticated) return;

    try {
      await NotificationService.markAsRead(ids);

      setNotifications(prev =>
        prev.map(notification =>
          ids.includes(notification.id)
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );

      await refreshCounts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark notifications as read'));
    }
  }, [isAuthenticated, refreshCounts]);

  const archiveMultiple = useCallback(async (ids: number[]) => {
    if (!isAuthenticated) return;

    try {
      await NotificationService.bulkArchiveNotifications(ids);

      setNotifications(prev =>
        prev.filter(notification => !ids.includes(notification.id))
      );

      setPagination(prev => ({
        ...prev,
        totalElements: prev.totalElements - ids.length
      }));

      await refreshCounts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to archive notifications'));
    }
  }, [isAuthenticated, refreshCounts]);

  const deleteMultiple = useCallback(async (ids: number[]) => {
    if (!isAuthenticated) return;

    try {
      // Note: You might want to add a bulk delete endpoint
      await Promise.all(ids.map(id => NotificationService.deleteNotification(id)));

      setNotifications(prev =>
        prev.filter(notification => !ids.includes(notification.id))
      );

      setPagination(prev => ({
        ...prev,
        totalElements: prev.totalElements - ids.length
      }));

      await refreshCounts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete notifications'));
    }
  }, [isAuthenticated, refreshCounts]);

  // Pagination helpers
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPagination(prev => ({ ...prev, size, page: 0 }));
  }, []);

  // Auto-fetch when dependencies change
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchInboxNotifications();
    }
  }, [isAuthenticated, authLoading, filters, sortOptions, pagination.page, pagination.size]);

  return {
    notifications,
    enhancedCounts: enhancedCounts || null, // Convert undefined to null
    loading: loading || !!countsError,
    error: error || countsError,
    filters,
    sortOptions,
    pagination,

    // Setters
    setFilters,
    setSortOptions,
    setPage,
    setPageSize,

    // Data fetchers
    fetchInboxNotifications,
    refreshInbox,

    // Single actions
    markAsRead,
    markAsUnread,
    toggleBookmark,
    archiveNotification,
    deleteNotification,

    // Bulk actions
    markMultipleAsRead,
    archiveMultiple,
    deleteMultiple
  };
};
