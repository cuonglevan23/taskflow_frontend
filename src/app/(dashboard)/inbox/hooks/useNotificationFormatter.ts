import { useMemo } from 'react';
import { NotificationResponse } from '@/types/notification';
import { format, parseISO, isToday, isYesterday, subDays, isAfter } from 'date-fns';

export interface FormattedNotification {
  id: number;
  type: 'task' | 'project' | 'message' | 'reminder' | 'system' | 'post';
  title: string;
  content: string;
  time: string;
  relativeTime: string;
  isRead: boolean;
  isBookmarked: boolean;
  isArchived: boolean;
  priority: number;
  avatar?: string;
  senderName?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
  isOverdue?: boolean;
  formattedDate: string;
  groupKey: string; // For grouping notifications by date
}

export interface NotificationGroup {
  groupKey: string;
  groupLabel: string;
  notifications: FormattedNotification[];
  count: number;
  unreadCount: number;
}

interface UseNotificationFormatterReturn {
  formatNotification: (notification: NotificationResponse) => FormattedNotification;
  formatNotifications: (notifications: NotificationResponse[]) => FormattedNotification[];
  groupNotificationsByDate: (notifications: FormattedNotification[]) => NotificationGroup[];
  getNotificationIcon: (type: string) => string;
  getNotificationColor: (type: string, isRead: boolean) => string;
  formatOverdueTaskContent: (notification: NotificationResponse) => { title: string; content: string };
}

/**
 * Hook for formatting and transforming notification data for UI display
 */
export const useNotificationFormatter = (): UseNotificationFormatterReturn => {

  // Map notification types from backend to UI
  const mapNotificationType = (type: string): FormattedNotification['type'] => {
    if (type.startsWith('TASK_')) return 'task';
    if (type.startsWith('PROJECT_')) return 'project';
    if (type.startsWith('CHAT_') || type.startsWith('MESSAGE_')) return 'message';
    if (type.startsWith('MEETING_') || type.startsWith('CALENDAR_')) return 'reminder';
    if (type === 'POST_LIKE' || type === 'POST_COMMENTED') return 'post';
    return 'system';
  };

  // Get notification icon based on type
  const getNotificationIcon = (type: string): string => {
    switch (type) {
      case 'task':
        return '📋';
      case 'project':
        return '📁';
      case 'message':
        return '💬';
      case 'reminder':
        return '⏰';
      case 'post':
        return '💖';
      case 'system':
      default:
        return '🔔';
    }
  };

  // Get notification color based on type and read status
  const getNotificationColor = (type: string, isRead: boolean): string => {
    if (isRead) return 'text-gray-500';

    switch (type) {
      case 'task':
        return 'text-blue-600';
      case 'project':
        return 'text-green-600';
      case 'message':
        return 'text-purple-600';
      case 'reminder':
        return 'text-orange-600';
      case 'post':
        return 'text-pink-600';
      case 'system':
      default:
        return 'text-gray-600';
    }
  };

  // Check if notification is overdue task
  const isOverdueTaskNotification = (notification: NotificationResponse): boolean => {
    return notification.type === 'TASK_OVERDUE';
  };

  // Format overdue task content
  const formatOverdueTaskContent = (notification: NotificationResponse): { title: string; content: string } => {
    if (!isOverdueTaskNotification(notification)) {
      return { title: notification.title, content: notification.content || '' };
    }

    const metadata = notification.metadata || {};
    const taskCount = parseInt(metadata.overdueTaskCount || '1');

    if (taskCount === 1) {
      const taskName = metadata.taskName || 'Task';
      return {
        title: `⚠️ Overdue Task: ${taskName}`,
        content: `Task "${taskName}" is overdue and needs immediate attention.`
      };
    } else {
      return {
        title: `⚠️ ${taskCount} Overdue Tasks`,
        content: `You have ${taskCount} tasks that are overdue and need immediate attention.`
      };
    }
  };

  // Format relative time
  const formatRelativeTime = (dateStr: string): string => {
    const date = parseISO(dateStr);
    const now = new Date();

    if (isToday(date)) {
      return format(date, 'HH:mm');
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else if (isAfter(date, subDays(now, 7))) {
      return format(date, 'EEE'); // Mon, Tue, etc.
    } else {
      return format(date, 'MMM d'); // Jan 1, Feb 15, etc.
    }
  };

  // Get group key for date grouping
  const getGroupKey = (dateStr: string): string => {
    const date = parseISO(dateStr);
    const now = new Date();

    if (isToday(date)) {
      return 'today';
    } else if (isYesterday(date)) {
      return 'yesterday';
    } else if (isAfter(date, subDays(now, 7))) {
      return 'thisWeek';
    } else if (isAfter(date, subDays(now, 30))) {
      return 'thisMonth';
    } else {
      return 'older';
    }
  };

  // Get group label
  const getGroupLabel = (groupKey: string): string => {
    switch (groupKey) {
      case 'today':
        return 'Today';
      case 'yesterday':
        return 'Yesterday';
      case 'thisWeek':
        return 'This Week';
      case 'thisMonth':
        return 'This Month';
      case 'older':
        return 'Older';
      default:
        return 'Unknown';
    }
  };

  // Format single notification
  const formatNotification = (notification: NotificationResponse): FormattedNotification => {
    const mappedType = mapNotificationType(notification.type);
    const isOverdue = isOverdueTaskNotification(notification);
    const formattedContent = isOverdue
      ? formatOverdueTaskContent(notification)
      : { title: notification.title, content: notification.content || '' };

    return {
      id: notification.id,
      type: mappedType,
      title: formattedContent.title,
      content: formattedContent.content,
      time: notification.createdAt,
      relativeTime: formatRelativeTime(notification.createdAt),
      isRead: notification.isRead,
      isBookmarked: notification.isBookmarked || false,
      isArchived: notification.isArchived || false,
      priority: notification.priority || 0,
      avatar: notification.avatarUrl,
      senderName: notification.senderName,
      actionUrl: notification.actionUrl,
      metadata: notification.metadata,
      isOverdue,
      formattedDate: format(parseISO(notification.createdAt), 'MMM d, yyyy HH:mm'),
      groupKey: getGroupKey(notification.createdAt)
    };
  };

  // Format multiple notifications
  const formatNotifications = (notifications: NotificationResponse[]): FormattedNotification[] => {
    return notifications.map(formatNotification);
  };

  // Group notifications by date
  const groupNotificationsByDate = (notifications: FormattedNotification[]): NotificationGroup[] => {
    const groups = notifications.reduce((acc, notification) => {
      const { groupKey } = notification;

      if (!acc[groupKey]) {
        acc[groupKey] = {
          groupKey,
          groupLabel: getGroupLabel(groupKey),
          notifications: [],
          count: 0,
          unreadCount: 0
        };
      }

      acc[groupKey].notifications.push(notification);
      acc[groupKey].count++;

      if (!notification.isRead) {
        acc[groupKey].unreadCount++;
      }

      return acc;
    }, {} as Record<string, NotificationGroup>);

    // Sort groups by priority (today, yesterday, this week, etc.)
    const groupOrder = ['today', 'yesterday', 'thisWeek', 'thisMonth', 'older'];

    return groupOrder
      .map(key => groups[key])
      .filter(Boolean) // Remove undefined groups
      .map(group => ({
        ...group,
        notifications: group.notifications.sort((a, b) =>
          new Date(b.time).getTime() - new Date(a.time).getTime()
        )
      }));
  };

  return {
    formatNotification,
    formatNotifications,
    groupNotificationsByDate,
    getNotificationIcon,
    getNotificationColor,
    formatOverdueTaskContent
  };
};
