// Export main notification hooks
export { useNotifications } from './useNotifications';

// Re-export inbox hooks for convenience
// Note: These are kept in the inbox directory for better organization
export { useInbox } from '../../app/(dashboard)/inbox/hooks/useInbox';
export { useInboxNotifications } from '../../app/(dashboard)/inbox/hooks/useInboxNotifications';
export { useNotificationFormatter } from '../../app/(dashboard)/inbox/hooks/useNotificationFormatter';
export { useNotificationSelection } from '../../app/(dashboard)/inbox/hooks/useNotificationSelection';
export { useBookmarkedNotifications } from '../../app/(dashboard)/inbox/hooks/useBookmarkedNotifications';
export { useArchivedNotifications } from '../../app/(dashboard)/inbox/hooks/useArchivedNotifications';

// Re-export types for convenience
export type {
  InboxFilters,
  InboxSortOptions
} from '../../app/(dashboard)/inbox/hooks/useInboxNotifications';

export type {
  FormattedNotification,
  NotificationGroup
} from '../../app/(dashboard)/inbox/hooks/useNotificationFormatter';
