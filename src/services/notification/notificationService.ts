import { BaseApiClient } from '@/lib/baseApiClient';
import {
  NotificationCountResponse,
  EnhancedNotificationCountResponse,
  PaginatedNotificationsResponse,
  GetNotificationsParams,
  MarkNotificationsReadRequest,
  BulkArchiveNotificationsRequest,
  BulkUnarchiveNotificationsRequest
} from '@/types/notification';

/**
 * Service for handling notification-related API calls
 */
export class NotificationService {
  private static readonly API_BASE_PATH = '/api/notifications';

  /**
   * Get unread notification count for the current user
   */
  static async getUnreadCount(): Promise<NotificationCountResponse> {
    try {
      return await BaseApiClient.get<NotificationCountResponse>(`${this.API_BASE_PATH}/unread-count`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get enhanced notification counts (unread, bookmarked, archived, total)
   */
  static async getEnhancedCount(): Promise<EnhancedNotificationCountResponse> {
    try {
      return await BaseApiClient.get<EnhancedNotificationCountResponse>(`${this.API_BASE_PATH}/count/enhanced`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get inbox notifications (non-archived notifications) with pagination
   */
  static async getInboxNotifications(params: GetNotificationsParams = {}): Promise<PaginatedNotificationsResponse> {
    try {
      return await BaseApiClient.get<PaginatedNotificationsResponse>(`${this.API_BASE_PATH}/inbox`, params);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get all notifications for the current user with pagination
   */
  static async getAllNotifications(params: GetNotificationsParams = {}): Promise<PaginatedNotificationsResponse> {
    try {
      return await BaseApiClient.get<PaginatedNotificationsResponse>(this.API_BASE_PATH, params);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get unread notifications for the current user with pagination
   * This is the main sync endpoint used when user logs in
   */
  static async getUnreadNotifications(params: GetNotificationsParams = {}): Promise<PaginatedNotificationsResponse> {
    try {
      return await BaseApiClient.get<PaginatedNotificationsResponse>(`${this.API_BASE_PATH}/unread`, params);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark specific notifications as read
   */
  static async markAsRead(notificationIds: number[]): Promise<void> {
    const request: MarkNotificationsReadRequest = { notificationIds };
    try {
      await BaseApiClient.put<void>(`${this.API_BASE_PATH}/mark-read`, request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Mark all notifications as read for the current user
   */
  static async markAllAsRead(): Promise<void> {
    try {
      await BaseApiClient.put<void>(`${this.API_BASE_PATH}/mark-all-read`, {});
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a notification
   */
  static async deleteNotification(id: number): Promise<void> {
    try {
      await BaseApiClient.delete<void>(`${this.API_BASE_PATH}/${id}`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Force a synchronization of notifications from server to client
   * Useful after events that might trigger new notifications
   */
  static async syncNotifications(): Promise<PaginatedNotificationsResponse> {
    try {
      return await BaseApiClient.get<PaginatedNotificationsResponse>(`${this.API_BASE_PATH}/sync`);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get bookmarked notifications for the current user with pagination
   */
  static async getBookmarkedNotifications(params: GetNotificationsParams = {}): Promise<PaginatedNotificationsResponse> {
    try {
      return await BaseApiClient.get<PaginatedNotificationsResponse>(`${this.API_BASE_PATH}/bookmarked`, params);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Bookmark or unbookmark a notification
   */
  static async toggleBookmark(id: number, bookmarked: boolean = true): Promise<void> {
    try {
      await BaseApiClient.post<void>(`${this.API_BASE_PATH}/${id}/bookmark`, { bookmarked });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Archive or unarchive a notification
   */
  static async toggleArchive(id: number, archived: boolean = true): Promise<void> {
    try {
      await BaseApiClient.post<void>(`${this.API_BASE_PATH}/${id}/archive`, { archived });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get archived notifications for the current user with pagination
   */
  static async getArchivedNotifications(params: GetNotificationsParams = {}): Promise<PaginatedNotificationsResponse> {
    try {
      return await BaseApiClient.get<PaginatedNotificationsResponse>(`${this.API_BASE_PATH}/archived`, params);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Archive multiple notifications at once
   */
  static async bulkArchiveNotifications(notificationIds: number[]): Promise<void> {
    const request: BulkArchiveNotificationsRequest = { notificationIds };
    try {
      await BaseApiClient.post<void>(`${this.API_BASE_PATH}/archive`, request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Unarchive multiple notifications at once
   */
  static async bulkUnarchiveNotifications(notificationIds: number[]): Promise<void> {
    const request: BulkUnarchiveNotificationsRequest = { notificationIds };
    try {
      await BaseApiClient.post<void>(`${this.API_BASE_PATH}/unarchive`, request);
    } catch (error) {
      throw error;
    }
  }
}
