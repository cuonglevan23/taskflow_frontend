import { useState, useCallback, useEffect } from 'react';
import { NotificationService } from '@/services/notification/notificationService';
import {
  NotificationResponse,
  GetNotificationsParams,
  EnhancedNotificationCountResponse
} from '@/types/notification';
import useSWR from 'swr';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNotificationFormatter, FormattedNotification } from './useNotificationFormatter';
import { useNotificationSelection } from './useNotificationSelection';

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
  sortBy: 'createdAt' | 'archivedAt' | 'priority';
  sortOrder: 'asc' | 'desc';
}

interface UseArchivedNotificationsReturn {
  notifications: FormattedNotification[];
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
  fetchArchivedNotifications: () => Promise<void>;
  refreshArchive: () => Promise<void>;

  // Single notification actions
  unarchiveNotification: (id: number) => Promise<void>;
  markAsRead: (id: number) => Promise<void>;
  toggleBookmark: (id: number) => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;

  // Selection state
  selectedIds: Set<number>;
  isSelected: (id: number) => boolean;
  isAllSelected: boolean;
  isIndeterminate: boolean;
  selectedCount: number;
  hasSelection: boolean;

  // Selection actions
  selectNotification: (id: number) => void;
  deselectNotification: (id: number) => void;
  toggleSelection: (id: number) => void;
  selectAll: () => void;
  deselectAll: () => void;

  // Bulk actions
  unarchiveMultiple: (ids: number[]) => Promise<void>;
  deleteMultiple: (ids: number[]) => Promise<void>;
  clearAllArchived: () => Promise<void>;
}

/**
 * Hook for managing archived notifications
 */
export const useArchivedNotifications = (): UseArchivedNotificationsReturn => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // State management
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Filters and sorting state
  const [filters, setFilters] = useState<InboxFilters>({});
  const [sortOptions, setSortOptions] = useState<InboxSortOptions>({
    sortBy: 'archivedAt',
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

  // Use formatter and selection hooks
  const formatter = useNotificationFormatter();
  const selection = useNotificationSelection();

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

  // Fetch archived notifications
  const fetchArchivedNotifications = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;

    setLoading(true);
    try {
      const params = buildQueryParams();
      const response = await NotificationService.getArchivedNotifications(params);

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
      setError(err instanceof Error ? err : new Error('Failed to fetch archived notifications'));
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, buildQueryParams, refreshCounts]);

  // Refresh archive
  const refreshArchive = useCallback(async () => {
    await fetchArchivedNotifications();
  }, [fetchArchivedNotifications]);

  // Single notification actions
  const unarchiveNotification = useCallback(async (id: number) => {
    if (!isAuthenticated) return;

    try {
      await NotificationService.toggleArchive(id, false);

      // Remove from archive list
      setNotifications(prev => prev.filter(notification => notification.id !== id));

      setPagination(prev => ({
        ...prev,
        totalElements: prev.totalElements - 1
      }));

      await refreshCounts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to unarchive notification'));
    }
  }, [isAuthenticated, refreshCounts]);

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
  const unarchiveMultiple = useCallback(async (ids: number[]) => {
    if (!isAuthenticated) return;

    try {
      await NotificationService.bulkUnarchiveNotifications(ids);

      setNotifications(prev =>
        prev.filter(notification => !ids.includes(notification.id))
      );

      setPagination(prev => ({
        ...prev,
        totalElements: prev.totalElements - ids.length
      }));

      selection.deselectAll();
      await refreshCounts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to unarchive notifications'));
    }
  }, [isAuthenticated, refreshCounts, selection]);

  const deleteMultiple = useCallback(async (ids: number[]) => {
    if (!isAuthenticated) return;

    try {
      await Promise.all(ids.map(id => NotificationService.deleteNotification(id)));

      setNotifications(prev =>
        prev.filter(notification => !ids.includes(notification.id))
      );

      setPagination(prev => ({
        ...prev,
        totalElements: prev.totalElements - ids.length
      }));

      selection.deselectAll();
      await refreshCounts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete notifications'));
    }
  }, [isAuthenticated, refreshCounts, selection]);

  const clearAllArchived = useCallback(async () => {
    if (!isAuthenticated) return;

    try {
      const allIds = notifications.map(n => n.id);
      await Promise.all(allIds.map(id => NotificationService.deleteNotification(id)));

      setNotifications([]);
      setPagination(prev => ({
        ...prev,
        totalElements: 0,
        totalPages: 0,
        hasNext: false,
        hasPrevious: false
      }));

      selection.deselectAll();
      await refreshCounts();
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to clear all archived notifications'));
    }
  }, [isAuthenticated, notifications, refreshCounts, selection]);

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
      fetchArchivedNotifications();
    }
  }, [isAuthenticated, authLoading, filters, sortOptions, pagination.page, pagination.size]);

  // Format notifications
  const formattedNotifications = formatter.formatNotifications(notifications);
  const availableIds = formattedNotifications.map(n => n.id);

  return {
    notifications: formattedNotifications,
    enhancedCounts: enhancedCounts || null,
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
    fetchArchivedNotifications,
    refreshArchive,

    // Single actions
    unarchiveNotification,
    markAsRead,
    toggleBookmark,
    deleteNotification,

    // Selection state
    selectedIds: selection.selectedIds,
    isSelected: selection.isSelected,
    isAllSelected: selection.getIsAllSelected(availableIds),
    isIndeterminate: selection.getIsIndeterminate(availableIds),
    selectedCount: selection.selectedCount,
    hasSelection: selection.hasSelection,

    // Selection actions
    selectNotification: selection.selectNotification,
    deselectNotification: selection.deselectNotification,
    toggleSelection: selection.toggleSelection,
    selectAll: () => selection.selectAll(availableIds),
    deselectAll: selection.deselectAll,

    // Bulk actions
    unarchiveMultiple,
    deleteMultiple,
    clearAllArchived
  };
};
