import { useCallback } from 'react';
import { useInboxNotifications } from './useInboxNotifications';
import { useNotificationFormatter } from './useNotificationFormatter';
import { useNotificationSelection } from './useNotificationSelection';

/**
 * Main hook that combines all inbox functionality
 * This is the primary hook that the inbox page should use
 */
export const useInbox = () => {
  // Get all the sub-hooks
  const inboxData = useInboxNotifications();
  const formatter = useNotificationFormatter();
  const selection = useNotificationSelection();

  // Format notifications for display
  const formattedNotifications = formatter.formatNotifications(inboxData.notifications);
  const groupedNotifications = formatter.groupNotificationsByDate(formattedNotifications);

  // Get available notification IDs for selection
  const availableIds = formattedNotifications.map(n => n.id);

  // Combined bulk actions that work with selection
  const bulkActions = {
    markSelectedAsRead: useCallback(async () => {
      const selectedIds = Array.from(selection.selectedIds);
      if (selectedIds.length === 0) return;

      await inboxData.markMultipleAsRead(selectedIds);
      selection.deselectAll();
    }, [inboxData.markMultipleAsRead, selection.selectedIds, selection.deselectAll]),

    archiveSelected: useCallback(async () => {
      const selectedIds = Array.from(selection.selectedIds);
      if (selectedIds.length === 0) return;

      await inboxData.archiveMultiple(selectedIds);
      selection.deselectAll();
    }, [inboxData.archiveMultiple, selection.selectedIds, selection.deselectAll]),

    deleteSelected: useCallback(async () => {
      const selectedIds = Array.from(selection.selectedIds);
      if (selectedIds.length === 0) return;

      await inboxData.deleteMultiple(selectedIds);
      selection.deselectAll();
    }, [inboxData.deleteMultiple, selection.selectedIds, selection.deselectAll])
  };

  return {
    // Data
    notifications: formattedNotifications,
    groupedNotifications,
    enhancedCounts: inboxData.enhancedCounts,
    loading: inboxData.loading,
    error: inboxData.error,

    // Filters and sorting
    filters: inboxData.filters,
    sortOptions: inboxData.sortOptions,
    setFilters: inboxData.setFilters,
    setSortOptions: inboxData.setSortOptions,

    // Pagination
    pagination: inboxData.pagination,
    setPage: inboxData.setPage,
    setPageSize: inboxData.setPageSize,

    // Data actions
    refreshInbox: inboxData.refreshInbox,
    fetchInboxNotifications: inboxData.fetchInboxNotifications,

    // Single notification actions
    markAsRead: inboxData.markAsRead,
    markAsUnread: inboxData.markAsUnread,
    toggleBookmark: inboxData.toggleBookmark,
    archiveNotification: inboxData.archiveNotification,
    deleteNotification: inboxData.deleteNotification,

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
    toggleSelectAll: () => selection.toggleSelectAll(availableIds),
    getSelectedNotifications: () => selection.getSelectedNotifications(formattedNotifications),

    // Bulk actions
    bulkActions,

    // Formatting utilities
    getNotificationIcon: formatter.getNotificationIcon,
    getNotificationColor: formatter.getNotificationColor,
    formatOverdueTaskContent: formatter.formatOverdueTaskContent
  };
};
