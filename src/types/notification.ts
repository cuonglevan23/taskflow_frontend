// Notification Types for the application
export type NotificationType =
  | 'TASK_ASSIGNED'
  | 'TASK_UPDATED'
  | 'TASK_COMPLETED'
  | 'TASK_COMMENTED'
  | 'TASK_DUE_SOON'
  | 'TASK_OVERDUE'
  | 'TEAM_INVITATION'
  | 'TEAM_JOINED'
  | 'TEAM_LEFT'
  | 'MENTION'
  | 'SYSTEM'
  | 'FRIEND_REQUEST'
  | 'FRIEND_ACCEPTED'
  | 'POST_LIKE'  // Updated from POST_LIKED to match API
  | 'POST_COMMENTED'
  | 'CALENDAR_EVENT'
  | 'MEETING_INVITATION';  // ✅ NEW - Added for meeting invitations

export type NotificationPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

// Base Notification Interface
export interface NotificationResponse {
  id: number;
  userId: number;
  title: string;
  content?: string;
  type: NotificationType;
  referenceId?: number;
  referenceType?: string;
  metadata?: Record<string, any>;
  isRead: boolean;
  readAt?: string | null;
  isBookmarked?: boolean;           // ✅ NEW
  bookmarkedAt?: string | null;     // ✅ NEW
  isArchived?: boolean;             // ✅ NEW
  archivedAt?: string | null;       // ✅ NEW
  createdAt: string;
  expiresAt?: string | null;
  priority?: number;
  channelId?: string;
  isRealTime?: boolean;
  actionUrl?: string;
  avatarUrl?: string;
  senderName?: string;
}

// Notification Count Response
export interface NotificationCountResponse {
  unreadCount: number;
}

// ✅ NEW - Enhanced Notification Count Response
export interface EnhancedNotificationCountResponse {
  unreadCount: number;
  bookmarkedCount: number;
  archivedCount: number;
  totalCount: number;
}

// Paginated Notifications Response
export interface PaginatedNotificationsResponse {
  content: NotificationResponse[];
  pageable: {
    pageNumber: number;
    pageSize: number;
    sort: {
      sorted: boolean;
      direction?: string;  // Added direction field
      property?: string;   // Added property field (for bookmarkedAt sorting)
      orderBy?: string;    // Keep existing for backward compatibility
    };
  };
  totalElements: number;
  totalPages: number;
  first: boolean;
  last: boolean;
  numberOfElements?: number;  // Made optional as it might not always be present
}

// Request to mark notifications as read
export interface MarkNotificationsReadRequest {
  notificationIds: number[];
}

// Request params for fetching notifications
export interface GetNotificationsParams {
  page?: number;
  size?: number;
  sort?: string;
  type?: NotificationType | NotificationType[];
  priority?: NotificationPriority | NotificationPriority[];
  read?: boolean;
  bookmarked?: boolean;  // ✅ NEW - for filtering bookmarked notifications
  archived?: boolean;    // ✅ NEW - for filtering archived notifications
  startDate?: string;
  endDate?: string;
}

// ✅ NEW - Request to bookmark/unbookmark notification
export interface BookmarkNotificationRequest {
  bookmarked: boolean;
}

// ✅ NEW - Request to archive/unarchive notification
export interface ArchiveNotificationRequest {
  archived: boolean;
}

// ✅ NEW - Request to archive/unarchive multiple notifications
export interface BulkArchiveNotificationsRequest {
  notificationIds: number[];
}

// ✅ NEW - Request to unarchive multiple notifications
export interface BulkUnarchiveNotificationsRequest {
  notificationIds: number[];
}
