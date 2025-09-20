import { useState, useEffect, useCallback } from 'react';
import { NotificationService } from '@/services/notification/notificationService';
import {
  NotificationResponse,
  NotificationCountResponse,
  EnhancedNotificationCountResponse,
  GetNotificationsParams
} from '@/types/notification';
import useSWR from 'swr';
import { useAuth } from '@/components/auth/AuthProvider';

interface UseNotificationsReturn {
  notifications: NotificationResponse[];
  unreadCount: number;
  totalCount: number;
  loading: boolean;
  error: Error | null;
  fetchUnreadNotifications: () => Promise<void>;
  fetchAllNotifications: () => Promise<void>;
  markAsRead: (ids: number[]) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: number) => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

/**
 * Main hook for managing notifications with SWR caching
 */
export const useNotifications = (): UseNotificationsReturn => {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  // State for notifications
  const [notifications, setNotifications] = useState<NotificationResponse[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Use SWR for unread count - Only when authenticated
  const {
    data: unreadCountData,
    error: unreadCountError,
    mutate: refreshUnreadCount
  } = useSWR<NotificationCountResponse>(
    isAuthenticated && !authLoading ? '/api/notifications/unread-count' : null,
    () => NotificationService.getUnreadCount(),
    {
      refreshInterval: 0, // ✅ FIX: Disable auto-refresh to prevent excessive requests
      revalidateOnFocus: false, // ✅ FIX: Disable focus revalidation
      dedupingInterval: 60000, // ✅ FIX: Increase to 1 minute
      onError: (error) => {
        if (error?.response?.status === 401) {
          console.log('🔐 Authentication required for notifications');
        }
      }
    }
  );

  // Fetch unread notifications
  const fetchUnreadNotifications = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      console.log('🔐 Skipping notification fetch - user not authenticated');
      return;
    }

    setLoading(true);
    try {
      const response = await NotificationService.getUnreadNotifications({
        page: 0,
        size: 20,
        sort: 'createdAt,desc'
      });

      setNotifications(response.content);
      await refreshUnreadCount();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch unread notifications'));
    } finally {
      setLoading(false);
    }
  }, [refreshUnreadCount, isAuthenticated, authLoading]);

  // Fetch all notifications
  const fetchAllNotifications = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      console.log('🔐 Skipping notification fetch - user not authenticated');
      return;
    }

    setLoading(true);
    try {
      const response = await NotificationService.getAllNotifications({
        page: 0,
        size: 50,
        sort: 'createdAt,desc'
      });

      setNotifications(response.content);
      await refreshUnreadCount();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch all notifications'));
    } finally {
      setLoading(false);
    }
  }, [refreshUnreadCount, isAuthenticated, authLoading]);

  // Mark notifications as read
  const markAsRead = useCallback(async (ids: number[]) => {
    if (!isAuthenticated || authLoading) return;

    try {
      await NotificationService.markAsRead(ids);

      // Update local state
      setNotifications(prev =>
        prev.map(notification =>
          ids.includes(notification.id)
            ? { ...notification, isRead: true, readAt: new Date().toISOString() }
            : notification
        )
      );

      await refreshUnreadCount();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark notifications as read'));
    }
  }, [refreshUnreadCount, isAuthenticated, authLoading]);

  // Mark all notifications as read
  const markAllAsRead = useCallback(async () => {
    if (!isAuthenticated || authLoading) return;

    try {
      await NotificationService.markAllAsRead();

      // Update local state
      setNotifications(prev =>
        prev.map(notification => ({
          ...notification,
          isRead: true,
          readAt: new Date().toISOString()
        }))
      );

      await refreshUnreadCount();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mark all notifications as read'));
    }
  }, [refreshUnreadCount, isAuthenticated, authLoading]);

  // Delete notification
  const deleteNotification = useCallback(async (id: number) => {
    if (!isAuthenticated || authLoading) return;

    try {
      await NotificationService.deleteNotification(id);

      // Remove from local state
      setNotifications(prev => prev.filter(notification => notification.id !== id));

      await refreshUnreadCount();
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to delete notification'));
    }
  }, [refreshUnreadCount, isAuthenticated, authLoading]);

  // Refresh notifications
  const refreshNotifications = useCallback(async () => {
    await fetchUnreadNotifications();
  }, [fetchUnreadNotifications]);

  // Auto-fetch notifications when authenticated
  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      fetchUnreadNotifications();
    }
  }, [isAuthenticated, authLoading, fetchUnreadNotifications]);

  return {
    notifications,
    unreadCount: unreadCountData?.unreadCount || 0,
    totalCount: notifications.length,
    loading: loading || !!unreadCountError,
    error: error || unreadCountError,
    fetchUnreadNotifications,
    fetchAllNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refreshNotifications
  };
};
